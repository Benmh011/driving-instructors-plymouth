import { FOUNDER_WINDOW_END } from "./constants";

// The five states the rest of the app cares about. Stripe has more granular
// statuses; we collapse them into these for gating + display.
export type AccessState = "trialing" | "active" | "past_due" | "locked" | "none";

// Days of continued full access after a payment fails, before we lock the
// account. Cards expire and banks decline legit charges — don't punish a
// paying instructor over a temporary blip.
const GRACE_DAYS = 5;

type SubFields = {
  subscriptionStatus?: string | null;
  trialEndsAt?: Date | null;
  currentPeriodEnd?: Date | null;
};

export function accessState(p: SubFields): AccessState {
  const status = p.subscriptionStatus;
  if (!status) return "none";
  const now = Date.now();

  switch (status) {
    case "trialing":
      if (p.trialEndsAt && p.trialEndsAt.getTime() < now) return "locked";
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid": {
      const end = p.currentPeriodEnd?.getTime() ?? now;
      return now < end + GRACE_DAYS * 86_400_000 ? "past_due" : "locked";
    }
    default:
      // canceled, incomplete, incomplete_expired, paused, etc.
      return "locked";
  }
}

// Full access = can use every paid feature. Anything else is the read-only
// safety net (see Phase 2 gating).
export function hasFullAccess(state: AccessState): boolean {
  return state === "trialing" || state === "active" || state === "past_due";
}

// Founder pricing is offered to instructors who subscribe within the launch
// window; once subscribed, Stripe keeps them on that price for the life of the
// subscription.
export function isFounderEligible(now: Date = new Date()): boolean {
  return now.getTime() < FOUNDER_WINDOW_END.getTime();
}
