import { Logo } from "./Logo";
import { RoadDivider } from "./RoadDivider";

export function Footer() {
  return (
    <footer className="bg-tarmac text-paper">
      <RoadDivider progress={88} finish />
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo variant="onDark" />
            <p className="mt-4 text-sm leading-relaxed text-paper/60">
              The simplest way to find and book a driving instructor in Plymouth
              and South West Devon.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-14 gap-y-2.5 text-sm text-paper/70 sm:grid-cols-2">
            <a href="#how" className="link-grow w-fit">
              How it works
            </a>
            <a href="#instructors" className="link-grow w-fit">
              For instructors
            </a>
            <a href="#coverage" className="link-grow w-fit">
              Areas covered
            </a>
            <a href="/register" className="link-grow w-fit">
              Create an account
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Driving Instructors Plymouth. Made in Plymouth.</p>
          <p>Privacy · Terms · hello@drivinginstructorsplymouth.com</p>
        </div>
      </div>
    </footer>
  );
}
