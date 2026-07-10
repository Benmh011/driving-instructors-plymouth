// Production base URL for building shareable links. Canonical host is www —
// the apex 308-redirects to it, which breaks server-to-server callers (Stripe).
export const SITE_URL = "https://www.drivinginstructorsplymouth.com";

// Hard ceiling on an instructor's roster (safety cap; instructors can also
// turn themselves "not taking students" before reaching it).
export const MAX_ROSTER = 50;

// Common allowable-expense categories for a driving instructor's Self Assessment.
export const EXPENSE_CATEGORIES = [
  "Fuel",
  "Vehicle (service, repairs, tyres)",
  "Insurance",
  "Franchise / school fees",
  "Training & CPD",
  "Phone & admin",
  "Other",
] as const;

// ─── Billing ───
// Standard free trial length (days) once the founder offer has closed.
export const TRIAL_DAYS = 30;

// Display prices only. The source of truth for what a customer is charged is
// the Stripe Price object referenced by STRIPE_PRICE_* env vars.
export const STANDARD_PRICE_PENCE = 1399; // £13.99 / month
export const FOUNDER_PRICE_PENCE = 999; // £9.99 / month, locked for the life of the sub

// Founder offer: the first FOUNDER_SEATS instructors ride free until
// FOUNDER_FREE_UNTIL, then pay the founder rate for as long as they stay
// subscribed. The window end is a backstop so the offer can't run forever.
export const FOUNDER_SEATS = 20;
export const FOUNDER_FREE_UNTIL = new Date("2027-01-01T00:00:00Z");
export const FOUNDER_WINDOW_END = new Date("2026-12-15T23:59:59Z");
