import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Tunables. 5 failures within the window trips a 15-minute lock.
const THRESHOLD = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

export function loginEmailKey(email: string): string {
  return `email:${email.trim().toLowerCase()}`;
}

export function loginIpKey(ip: string): string {
  return `ip:${ip}`;
}

export function loginThrottleKeys(email: string, ip: string): string[] {
  return [loginEmailKey(email), loginIpKey(ip)];
}

// Best-effort client IP from Vercel's forwarding headers.
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}

// Is any of these keys currently locked? Returns the longest remaining wait.
export async function checkLoginThrottle(
  keys: string[],
): Promise<{ locked: boolean; retryAfterMins?: number }> {
  const now = new Date();
  const rows = await prisma.loginThrottle.findMany({
    where: { key: { in: keys }, lockedUntil: { gt: now } },
    select: { lockedUntil: true },
  });
  if (rows.length === 0) return { locked: false };

  const maxUntil = rows.reduce(
    (m: number, r: { lockedUntil: Date | null }) =>
      Math.max(m, r.lockedUntil ? r.lockedUntil.getTime() : 0),
    0,
  );
  const mins = Math.max(1, Math.ceil((maxUntil - now.getTime()) / 60000));
  return { locked: true, retryAfterMins: mins };
}

// Record a failed attempt against each key, locking once the threshold is hit.
export async function recordLoginFailure(keys: string[]): Promise<void> {
  const now = new Date();
  for (const key of keys) {
    const row = await prisma.loginThrottle.findUnique({ where: { key } });

    // Fresh key, or the previous window has expired → start counting again.
    if (!row || now.getTime() - row.firstFailedAt.getTime() > WINDOW_MS) {
      await prisma.loginThrottle.upsert({
        where: { key },
        create: { key, failedCount: 1, firstFailedAt: now, lockedUntil: null },
        update: { failedCount: 1, firstFailedAt: now, lockedUntil: null },
      });
      continue;
    }

    const failedCount = row.failedCount + 1;
    const lockedUntil =
      failedCount >= THRESHOLD
        ? new Date(now.getTime() + LOCK_MS)
        : row.lockedUntil;
    await prisma.loginThrottle.update({
      where: { key },
      data: { failedCount, lockedUntil },
    });
  }
}

// Clear a key's counter — called on a successful sign-in.
export async function clearLoginThrottle(key: string): Promise<void> {
  await prisma.loginThrottle.deleteMany({ where: { key } });
}

// Housekeeping for the daily cron: drop stale, unlocked rows.
export async function cleanupLoginThrottle(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const res = await prisma.loginThrottle.deleteMany({
    where: {
      updatedAt: { lt: cutoff },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
    },
  });
  return res.count;
}
