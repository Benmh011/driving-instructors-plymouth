import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";
import { loginSchema } from "./lib/validators";
import { verifyTwoFactorLogin } from "./lib/twofactor";
import { isTrustedDevice } from "./lib/trusted-device";
import { clearLoginThrottle, loginEmailKey } from "./lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, code: {} },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const code = typeof raw?.code === "string" ? raw.code : "";

        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // 2FA is the real enforcement point: even if someone hits the auth
        // endpoint directly, a 2FA account can't sign in without either a valid
        // code or a previously-trusted device.
        if (user.twoFactorEnabled) {
          let ok = false;
          if (code) {
            ok = await verifyTwoFactorLogin(
              {
                id: user.id,
                twoFactorSecret: user.twoFactorSecret,
                twoFactorBackupCodes: user.twoFactorBackupCodes,
              },
              code,
            );
          }
          if (!ok) ok = await isTrustedDevice(user.id);
          if (!ok) return null;
        }

        // Full success — clear any accumulated failures for this email.
        await clearLoginThrottle(loginEmailKey(user.email));

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
