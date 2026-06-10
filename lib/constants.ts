// Production base URL for building shareable links.
export const SITE_URL = "https://drivinginstructorsplymouth.com";

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
// Free trial length (days). Set on the Stripe Checkout session, so it's easy
// to change here without touching the Stripe price.
export const TRIAL_DAYS = 30;

// Display prices only. The source of truth for what a customer is charged is
// the Stripe Price object referenced by STRIPE_PRICE_* env vars.
export const STANDARD_PRICE_PENCE = 1299; // £12.99 / month
export const FOUNDER_PRICE_PENCE = 999; // £9.99 / month, locked for the life of the sub

// Founder pricing is offered to instructors who subscribe within the launch
// window (≈3 months from launch). Adjust if the launch date slips.
export const FOUNDER_WINDOW_END = new Date("2026-09-10T23:59:59Z");
