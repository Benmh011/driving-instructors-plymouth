import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Contact us" };

export default async function ContactPage() {
  const session = await auth();
  const signedIn = !!session?.user?.id;

  return (
    <div className="relative z-10">
      {signedIn ? <AppHeader home="/dashboard" /> : <Header />}

      <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Link
          href={signedIn ? "/dashboard" : "/"}
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; {signedIn ? "Back to dashboard" : "Back home"}
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Contact us
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          We&rsquo;re a small team based in Plymouth, here to help learners and
          instructors across Plymouth and South West Devon. The quickest way to
          reach us is by email.
        </p>

        <div className="mt-8 rounded-2xl border border-hairline bg-cream p-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Email us
          </p>
          <a
            href={`mailto:${LEGAL.contactEmail}`}
            className="mt-3 inline-flex rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark"
          >
            {LEGAL.contactEmail}
          </a>
        </div>

        <div className="mt-8 space-y-3 text-ink-soft">
          <p>You can get in touch about:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-ink">Learners</strong> — help with booking,
              payments or your account.
            </li>
            <li>
              <strong className="text-ink">Instructors</strong> — joining the
              platform, verification, or your subscription.
            </li>
            <li>
              <strong className="text-ink">Privacy</strong> — any request about
              your personal data (see our{" "}
              <Link href="/privacy" className="text-ink underline">
                Privacy Policy
              </Link>
              ).
            </li>
            <li>
              <strong className="text-ink">Anything else</strong> — feedback,
              questions, or reporting a problem.
            </li>
          </ul>
          <p className="pt-2">We&rsquo;ll get back to you as soon as we can.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
