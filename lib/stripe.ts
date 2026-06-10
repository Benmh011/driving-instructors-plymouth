import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// True only when the secret key is actually present. Routes guard on this so a
// fresh deploy (before env vars are set) doesn't crash — it just declines.
export const stripeConfigured = Boolean(secretKey);

// A single shared client. When the key is missing we still construct one with a
// placeholder so module imports stay clean; any real call would fail, but the
// `stripeConfigured` guard stops us getting that far.
export const stripe = new Stripe(secretKey ?? "sk_test_placeholder");

// The two recurring prices, created in the Stripe dashboard.
export const STRIPE_PRICE_STANDARD = process.env.STRIPE_PRICE_STANDARD ?? "";
export const STRIPE_PRICE_FOUNDER = process.env.STRIPE_PRICE_FOUNDER ?? "";
