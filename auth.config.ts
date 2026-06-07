import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

// Edge-safe base config. No Prisma / bcrypt here — those live in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/onboarding") ||
        path.startsWith("/students") ||
        path.startsWith("/diary") ||
        path.startsWith("/admin");
      const isAuthPage = path === "/login" || path === "/register";

      if (isProtected && !isLoggedIn) return false; // -> redirected to /login
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role: Role }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
