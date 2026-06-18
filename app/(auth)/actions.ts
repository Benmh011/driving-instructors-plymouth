"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { signIn } from "@/auth";
import {
  getClientIp,
  loginThrottleKeys,
  checkLoginThrottle,
  recordLoginFailure,
} from "@/lib/rate-limit";

export type ActionState = { error?: string } | undefined;
export type LoginState =
  | { error?: string; needs2fa?: boolean; email?: string; ok?: boolean; next?: string }
  | undefined;

export async function registerUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const { name, email, password, role } = parsed.data;
  const wants2fa = formData.get("setup2fa") === "on";

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash, role } });

  // signIn throws a redirect, which is expected and must propagate. New users
  // who opted into 2FA go straight to setup; everyone else into onboarding.
  await signIn("credentials", {
    email,
    password,
    redirectTo: wants2fa ? "/dashboard/security?setup=1" : "/onboarding",
  });
}

export async function authenticate(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  // Where to go after login — honour an internal ?next (e.g. an invite link),
  // but never an external/protocol-relative URL.
  const nextRaw = String(formData.get("next") ?? "");
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  const ip = await getClientIp();
  const keys = loginThrottleKeys(email, ip);

  // Reject early if this email or IP is currently locked out — before doing any
  // expensive password hashing.
  const throttle = await checkLoginThrottle(keys);
  if (throttle.locked) {
    const mins = throttle.retryAfterMins ?? 15;
    return {
      error: `Too many sign-in attempts. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  // Work out whether to prompt for a 2FA code. The auth provider re-verifies
  // everything (password + code) as the real security boundary.
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { passwordHash: true, twoFactorEnabled: true },
  });
  const passwordOk = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;
  if (!user || !passwordOk) {
    await recordLoginFailure(keys);
    return { error: "Incorrect email or password." };
  }

  if (user.twoFactorEnabled && !code) {
    // Correct password — not a failed attempt, just the first of two steps.
    return { needs2fa: true, email };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      code,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Password was already confirmed above, so for a 2FA account the only way
      // to land here is a wrong or expired code.
      await recordLoginFailure(keys);
      if (user.twoFactorEnabled) {
        return {
          needs2fa: true,
          email,
          error: "That code didn't work — try again.",
        };
      }
      return { error: "Incorrect email or password." };
    }
    throw error;
  }

  // Success. Hand the destination back to the client so it can do a full-page
  // navigation — this clears the in-tab route cache, so a previous account's
  // pages can't linger after switching users.
  return { ok: true, next };
}
