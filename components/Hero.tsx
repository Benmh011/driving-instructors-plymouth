export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* teal atmosphere on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-10 hidden h-[120%] w-[45%] -rotate-6 bg-sea/[0.06] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-20 hidden h-80 w-80 rounded-full bg-sea/25 blur-[90px] lg:block"
      />
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <p
          className="rise mb-7 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper-dim/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ animationDelay: "0ms" }}
        >
          <span className="inline-block h-2 w-2 rounded-full bg-go" />
          Plymouth &amp; South West Devon · Launching soon
        </p>

        <h1
          className="rise max-w-[14ch] font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Learn to drive,
          <br />
          <span className="text-sea">without the faff.</span>
        </h1>

        <p
          className="rise mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
          style={{ animationDelay: "160ms" }}
        >
          We connect you with vetted local driving instructors across
          Plymouth and the surrounding towns. See real prices, real
          availability, and book lessons in minutes — no endless phone calls,
          no six-month waitlists.
        </p>

        {/* Area search — visual for now, leads to sign-up */}
        <div
          className="rise mt-9 flex w-full max-w-lg flex-col gap-2.5 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex flex-1 items-center gap-2.5 rounded-full border border-ink/20 bg-white/70 px-4 py-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0 text-ink-soft"
              aria-hidden
            >
              <path
                d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <input
              type="text"
              placeholder="Your postcode or area (e.g. PL1)"
              aria-label="Your postcode or area"
              className="w-full bg-transparent text-base outline-none placeholder:text-ink-soft/70"
            />
          </div>
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-sea px-6 py-3 text-base font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-sea-dark"
          >
            Find lessons
            <span aria-hidden>→</span>
          </a>
        </div>

        <p
          className="rise mt-4 text-sm text-ink-soft"
          style={{ animationDelay: "300ms" }}
        >
          Teaching here?{" "}
          <a href="/register?role=instructor" className="link-grow font-semibold text-ink">
            List your lessons →
          </a>
        </p>

        {/* trust row */}
        <div
          className="rise mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-ink-soft"
          style={{ animationDelay: "380ms" }}
        >
          <Stat figure="DVSA" label="approved instructors only" />
          <Stat figure="0%" label="booking fees at launch" />
          <Stat figure="Local" label="built in Plymouth, for Plymouth" />
        </div>
      </div>

      <div className="roadline" aria-hidden />
    </section>
  );
}

function Stat({ figure, label }: { figure: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl font-bold text-ink">{figure}</span>
      <span>{label}</span>
    </div>
  );
}
