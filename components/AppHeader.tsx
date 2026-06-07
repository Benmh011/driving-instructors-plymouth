import { Logo } from "./Logo";

// Shared header for signed-in / internal pages. Matches the landing banner
// (navy bar, red L-plate logo). Pass `right` for page-specific actions.
export function AppHeader({
  right,
  home = "/",
}: {
  right?: React.ReactNode;
  home?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-tarmac/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-8">
        <Logo variant="onDark" href={home} />
        {right}
      </div>
    </header>
  );
}
