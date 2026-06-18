import crypto from "crypto";
import { cookies } from "next/headers";

// "Remember this device" for 2FA. A signed, HMAC'd cookie bound to the user id
// lets a previously-verified device skip the 2FA code for a fixed window. The
// password is still required on every sign-in — this only waives the *second*
// factor. The cookie is httpOnly and can't be forged without AUTH_SECRET.

const COOKIE = "dip_td";
const SECRET = process.env.AUTH_SECRET ?? "";

// How long a trusted device stays trusted. Change to 14 for a fortnight.
export const TRUSTED_DEVICE_DAYS = 30;

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function verify(token: string, userId: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [uid, expStr, sig] = parts;
  if (uid !== userId) return false;
  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
  const expected = sign(`${uid}.${expStr}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Is the current request's device trusted for this user?
export async function isTrustedDevice(userId: string): Promise<boolean> {
  if (!SECRET) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  return verify(token, userId);
}

// Mark the current device as trusted (call after a successful 2FA sign-in).
export async function rememberDevice(
  userId: string,
  days = TRUSTED_DEVICE_DAYS,
): Promise<void> {
  if (!SECRET) return;
  const expMs = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expMs}`;
  const value = `${payload}.${sign(payload)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: days * 24 * 60 * 60,
  });
}
