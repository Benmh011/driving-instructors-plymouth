const FAQS = [
  {
    q: "When does it launch?",
    a: "We're onboarding the first Plymouth instructors now and opening to learners shortly after. Create an account to get set up.",
  },
  {
    q: "Does it cost anything to sign up?",
    a: "No — creating an account is free for both learners and instructors. At launch there are no booking fees for learners either.",
  },
  {
    q: "I'm a driving instructor. How does it work for me?",
    a: "You create a profile, set your prices, hours and coverage area, and get matched with local learners. You keep your earnings and manage everything from one calendar.",
  },
  {
    q: "Which areas are covered?",
    a: "We're starting across Plymouth and the surrounding towns, then expanding through South West Devon. Tell us your area when you sign up so we can prioritise it.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
      <h2 className="mb-10 text-center font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Questions?
      </h2>
      <div className="divide-y divide-hairline border-y border-hairline">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
              {f.q}
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/20 text-ink-soft transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
