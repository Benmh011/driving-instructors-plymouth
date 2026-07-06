// Single source of truth for the factual details that appear across our legal
// pages (privacy, terms, cookies, acceptable use). Edit them here once and every
// page updates.
//
// TODO — on company formation: fill in entityName, companyNumber,
// registeredAddress and icoNumber below. Until they're set, the pages render
// under the trading name and simply omit the company-registration lines, so
// nothing half-finished shows on the live site.
export const LEGAL = {
  tradingName: "Driving Instructors Plymouth",

  entityName: "Reaction App Limited", // registered company / sole-trader legal name
  companyNumber: "", // Companies House number, if incorporated
  registeredAddress: "", // registered or principal business address
  icoNumber: "", // ICO data-protection registration number

  contactEmail: "hello@drivinginstructorsplymouth.com",

  lastUpdated: "26 June 2026",

  minLearnerAge: 17,
  liabilityCap:
    "the total fees you have paid us in the 12 months before the claim arose",
} as const;

// Name to show in prose: the registered entity once we have one, else the
// trading name.
export const operatorName: string = LEGAL.entityName || LEGAL.tradingName;
