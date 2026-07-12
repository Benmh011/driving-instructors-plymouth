import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-tarmac/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo variant="onDark" />
        <nav className="hidden items-center gap-8 text-sm font-medium text-paper/80 md:flex">
          <a href="/#how" className="link-grow hover:text-paper">
            How it works
          </a>
          <a href="/instructors" className="link-grow hover:text-paper">
            Find an instructor
          </a>
          <a href="/#instructors" className="link-grow hover:text-paper">
            For instructors
          </a>
          <a href="/#coverage" className="link-grow hover:text-paper">
            Areas
          </a>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-paper/90 transition-colors hover:text-paper"
          >
            Log in
          </a>
          <a
            href="/register?role=instructor"
            className="hidden rounded-full border border-paper/25 px-4 py-2 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper hover:text-tarmac sm:inline-flex"
          >
            I&rsquo;m an instructor
          </a>
          <a
            href="/register"
            className="press inline-flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-signal-dark"
          >
            Join free
          </a>
        </div>
      </div>
    </header>
  );
}
