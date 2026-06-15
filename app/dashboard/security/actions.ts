"use server";

import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  generateTotpSecret,
  totpAuthUrl,
  verifyTotp,
  encryptSecret,
  decryptSecret,
  generateBackupCodes,
  hashBackupCodes,
  verifyTwoFactorLogin,
} from "@/lib/twofactor";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export type SetupData = { qr: string; secret: string } | { error: string };

// Generates a fresh secret, stores it as PENDING (encrypted), and hands back a
// QR + manual key for the user to add to their authenticator app. 2FA is not
// switched on until the code is confirmed.
export async function beginTwoFactorSetup(): Promise<SetupData> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) return { error: "Account not found." };

  const secret = generateTotpSecret();
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorPendingSecret: encryptSecret(secret) },
  });

  const qr = await QRCode.toDataURL(totpAuthUrl(user.email, secret), {
    margin: 1,
    width: 220,
  });
  return { qr, secret };
}

export type ConfirmData = { backupCodes: string[] } | { error: string };

export async function confirmTwoFactorSetup(
  formData: FormData,
): Promise<ConfirmData> {
  const userId = await requireUserId();
  const code = String(formData.get("code") ?? "").trim();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorPendingSecret: true },
  });
  if (!user?.twoFactorPendingSecret) {
    return { error: "Setup hasn't been started — refresh and try again." };
  }

  const secret = decryptSecret(user.twoFactorPendingSecret);
  if (!secret || !verifyTotp(secret, code)) {
    return {
      error: "That code didn't match. Check your phone's clock and try again.",
    };
  }

  const backupCodes = generateBackupCodes();
  const hashed = await hashBackupCodes(backupCodes);
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: user.twoFactorPendingSecret, // already encrypted
      twoFactorPendingSecret: null,
      twoFactorBackupCodes: hashed,
    },
  });

  revalidatePath("/dashboard/security");
  revalidatePath("/dashboard");
  return { backupCodes };
}

export type DisableData = { ok: true } | { error: string };

export async function disableTwoFactor(
  formData: FormData,
): Promise<DisableData> {
  const userId = await requireUserId();
  const code = String(formData.get("code") ?? "").trim();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
      twoFactorSecret: true,
      twoFactorBackupCodes: true,
    },
  });
  if (!user?.twoFactorEnabled) return { error: "Two-factor isn't enabled." };

  // Require a valid current code to switch it off.
  const ok = await verifyTwoFactorLogin(
    {
      id: userId,
      twoFactorSecret: user.twoFactorSecret,
      twoFactorBackupCodes: user.twoFactorBackupCodes,
    },
    code,
  );
  if (!ok) return { error: "Enter a current code to turn this off." };

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorPendingSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  revalidatePath("/dashboard/security");
  revalidatePath("/dashboard");
  return { ok: true };
}
