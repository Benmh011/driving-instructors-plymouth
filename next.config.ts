import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA service worker + manifest are served from /public.
  // No experimental flags needed for the landing-page first push.
};

export default nextConfig;
