import Link from "next/link";
import type { AccessState } from "@/lib/subscription";

function trialDaysLeft(trialEndsAt?: Date | null) {
  if (!trialEndsAt) return 0;
  return Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000));
}

export default function SubscriptionBanner({
  state,
  trialEndsAt,
}: {
  state: AccessState;
  trialEndsAt?: Date | null;
}) {
  const left = trialDaysLeft(trialEndsAt);

  const config: Record<
    AccessState,
    { tone: string; pill: string; label: string; sub: string | null; cta: string }
  > = {
    none: {
      tone: "border-sea/30 bg-sea/10",
      pill: "bg-sea text-white",
      label: "Start your 30-day free trial",
      sub: "Manage students, take bookings and get matched with local learners.",
      cta: "Start trial",
    },
    trialing: {
      tone: "border-hairline bg-cream",
      pill: "bg-ink text-white",
      label: `Free trial — ${left} ${left === 1 ? "day" : "days"} left`,
      sub: "You won't be charged until your trial ends.",
      cta: "Manage",
    },
    active: {
      tone: "border-hairline bg-paper/70",
      pill: "bg-ink text-white",
      label: "Membership active",
      sub: null,
      cta: "Manage",
    },
    past_due: {
      tone: "border-signal/40 bg-signal/10",
      pill: "bg-signal text-white",
      label: "Payment failed — update your card",
      sub: "You still have full access for a few days. Update your card to keep it.",
      cta: "Update card",
    },
    locked: {
      tone: "border-signal/50 bg-signal/10",
      pill: "bg-signal text-white",
      label: "Subscription ended",
      sub: "Resubscribe to manage your diary, take bookings and message learners.",
      cta: "Resubscribe",
    },
  };

  const c = config[state];

  return (
    <Link
      href="/dashboard/billing"
      className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 transition-colors hover:border-ink/30 ${c.tone}`}
    >
      <div className="min-w-0">
        <p className="font-semibold text-ink">{c.label}</p>
        {c.sub && (
          <p className="mt-0.5 truncate text-sm text-ink-soft">{c.sub}</p>
        )}
      </div>
      <span
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${c.pill}`}
      >
        {c.cta}
      </span>
    </Link>
  );
}
