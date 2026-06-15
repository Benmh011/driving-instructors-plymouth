import crypto from "crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";

const ISSUER = "Driving Instructors Plymouth";

// Tolerate ±1 time-step (30s) of clock drift between phone and server.
authenticator.options = { window: 1 };

let cachedKey: Buffer | null = null;

// AES-256 key derived from the app secret — so the TOTP secret in the database
// is useless to anyone who only has the database (not the env vars).
function encryptionKey(): Buffer {
  if (cachedKey) return cachedKey;
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  cachedKey = crypto.scryptSync(secret, "dip-2fa-key-v1", 32);
  return cachedKey;
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(blob: string): string | null {
  try {
    const [ivB, tagB, encB] = blob.split(":");
    if (!ivB || !tagB || !encB) return null;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivB, "base64"),
    );
    decipher.setAuthTag(Buffer.from(tagB, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(encB, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function totpAuthUrl(email: string, secret: string): string {
  return authenticator.keyuri(email, ISSUER, secret);
}

export function verifyTotp(secret: string, token: string): boolean {
  const clean = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  try {
    return authenticator.verify({ token: clean, secret });
  } catch {
    return false;
  }
}

// --- Backup codes -----------------------------------------------------------

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString("hex"); // 10 hex chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`; // e.g. "a1b2c-3d4e5"
  });
}

function normaliseCode(code: string): string {
  return code.replace(/[\s-]/g, "").toLowerCase();
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(normaliseCode(c), 10)));
}

/**
 * Verifies a login 2FA challenge: tries the TOTP first, then any unused backup
 * code. A matched backup code is consumed so it can't be reused.
 */
export async function verifyTwoFactorLogin(
  user: {
    id: string;
    twoFactorSecret: string | null;
    twoFactorBackupCodes: string[];
  },
  code: string,
): Promise<boolean> {
  const clean = code.replace(/\s+/g, "");
  if (!clean) return false;

  if (user.twoFactorSecret) {
    const secret = decryptSecret(user.twoFactorSecret);
    if (secret && verifyTotp(secret, clean)) return true;
  }

  const candidate = normaliseCode(code);
  for (const hash of user.twoFactorBackupCodes) {
    if (await bcrypt.compare(candidate, hash)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorBackupCodes: user.twoFactorBackupCodes.filter((h) => h !== hash),
        },
      });
      return true;
    }
  }
  return false;
}
