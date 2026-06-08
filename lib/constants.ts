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
