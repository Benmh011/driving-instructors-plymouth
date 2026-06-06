import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#how" className="link-grow">
            How it works
          </a>
          <a href="#instructors" className="link-grow">
            For instructors
          </a>
          <a href="#coverage" className="link-grow">
            Areas
          </a>
          <a href="/login" className="link-grow">
            Log in
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/register?role=instructor"
            className="hidden rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper sm:inline-flex"
          >
            I&rsquo;m an instructor
          </a>
          <a
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-signal-dark"
          >
            Find an instructor
          </a>
        </div>
      </div>
    </header>
  );
}
