const STEPS = [
  {
    n: "01",
    title: "Tell us your area",
    body: "Pop in your postcode and when you're free. We'll show instructors who actually cover your patch — from PL1 to the South Hams.",
  },
  {
    n: "02",
    title: "Compare real instructors",
    body: "See prices, reviews, car type and live availability side by side. No guesswork, no ringing round a dozen numbers.",
  },
  {
    n: "03",
    title: "Book & manage in-app",
    body: "Lock in lessons, pay securely, and track your progress towards test day — all from your phone, online or off.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
            For learners
          </span>
          <h2 className="mt-2 max-w-md font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            From learner plate to pass.
          </h2>
        </div>
        <p className="max-w-xs text-ink-soft">
          The whole journey in one place — no more spreadsheets, group chats or
          missed texts.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="bg-paper p-7 transition-colors hover:bg-paper-dim/50">
            <div className="lplate mb-6 h-11 w-11 text-base">{s.n}</div>
            <h3 className="mb-2 font-display text-xl font-bold">{s.title}</h3>
            <p className="text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
