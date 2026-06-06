"use client";

import { useState } from "react";

type Role = "learner" | "instructor";
type Status = "idle" | "loading" | "success" | "error";

export function Waitlist() {
  const [role, setRole] = useState<Role>("learner");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, area }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setMessage(
        role === "learner"
          ? "You're on the list — we'll be in touch when instructors near you go live."
          : "Brilliant — we'll reach out about getting your profile set up first.",
      );
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again in a moment.");
    }
  }

  return (
    <section id="waitlist" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-tarmac px-6 py-14 text-paper sm:px-14 sm:py-20">
        {/* decorative road lines */}
        <div className="roadline absolute left-0 top-0" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-signal/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-xl text-center">
          <span className="lplate mx-auto mb-6 grid h-12 w-12 text-xl">L</span>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Be first in the queue.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-paper/75">
            Driving Instructors Plymouth is launching soon. Join the waitlist
            and we&rsquo;ll let you know the moment it&rsquo;s live in your area.
          </p>

          {status === "success" ? (
            <div className="mx-auto mt-9 max-w-md rounded-2xl border border-go/40 bg-go/10 px-6 py-6">
              <p className="font-display text-lg font-semibold text-line">
                You&rsquo;re in.
              </p>
              <p className="mt-1 text-sm text-paper/80">{message}</p>
            </div>
          ) : (
            <div className="mt-9">
              {/* role toggle */}
              <div className="mx-auto mb-4 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
                {(["learner", "instructor"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-full px-5 py-1.5 text-sm font-semibold capitalize transition-colors ${
                      role === r
                        ? "bg-signal text-white"
                        : "text-paper/70 hover:text-paper"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="mx-auto flex max-w-md flex-col gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.co.uk"
                  aria-label="Email address"
                  className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-base text-paper outline-none transition-colors placeholder:text-paper/45 focus:border-line"
                />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Your area or postcode (optional)"
                  aria-label="Your area or postcode"
                  className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-base text-paper outline-none transition-colors placeholder:text-paper/45 focus:border-line"
                />
                <button
                  type="button"
                  onClick={submit}
                  disabled={status === "loading"}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Joining…" : "Join the waitlist"}
                </button>
              </div>
              {status === "error" && (
                <p className="mt-3 text-sm text-line">{message}</p>
              )}
              <p className="mt-4 text-xs text-paper/50">
                No spam, ever. Just one email when we launch near you.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
