const AREAS = [
  "Plymouth City",
  "Plympton",
  "Plymstock",
  "Saltash",
  "Ivybridge",
  "Tavistock",
  "Yealmpton",
  "Wembury",
  "Torpoint",
  "Brixton",
  "Elburton",
  "Roborough",
  "Crownhill",
  "Tamerton Foliot",
  "Estover",
  "South Hams",
];

export function Coverage() {
  return (
    <section id="coverage" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-signal">
            Where we cover
          </span>
          <h2 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Built for the whole patch.
          </h2>
          <p className="mt-4 max-w-sm text-ink-soft">
            Starting in Plymouth and rolling out across South West Devon. Don&rsquo;t
            see your area? Join the list and we&rsquo;ll prioritise instructors
            near you.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {AREAS.map((area) => (
            <span
              key={area}
              className="rounded-full border border-ink/15 bg-white/60 px-4 py-2 text-sm font-medium transition-colors hover:border-sea hover:text-sea"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
