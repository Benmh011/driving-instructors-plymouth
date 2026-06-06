import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Run on app routes, skip Next internals, the auth API, and static assets.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|sw.js|icons).*)",
  ],
};
