import type { NextConfig } from "next";

// Content-Security-Policy. Locked to our own origin, with explicit allowances
// for the few external services we genuinely use (Stripe for billing, Vercel
// Blob for the direct photo/badge uploads). 'unsafe-inline' is required by
// Next's hydration scripts and Tailwind's injected styles; everything else is
// tightly scoped. frame-ancestors/object-src/base-uri close common attack paths.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.vercel-storage.com https://*.public.blob.vercel-storage.com",
  "font-src 'self'",
  "connect-src 'self' https://api.stripe.com https://*.vercel-storage.com https://*.public.blob.vercel-storage.com https://blob.vercel-storage.com",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://billing.stripe.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
