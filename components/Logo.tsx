export function Logo({
  className = "",
  variant = "onLight",
}: {
  className?: string;
  variant?: "onLight" | "onDark";
}) {
  const text = variant === "onLight" ? "text-ink" : "text-paper";
  // On the dark (navy) footer the L-plate keeps its red; everywhere else it's navy.
  const plateStyle =
    variant === "onDark" ? { background: "var(--color-signal)" } : undefined;
  const period = variant === "onDark" ? "text-signal" : "text-ink";
  return (
    <a href="#top" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="lplate h-9 w-9 shrink-0 text-lg leading-none transition-transform duration-300 group-hover:-rotate-6"
        style={plateStyle}
      >
        L
      </span>
      <span className={`flex flex-col font-display leading-[0.96] tracking-tight ${text}`}>
        <span className="text-[13px] font-extrabold sm:text-[15px]">
          Driving Instructors
        </span>
        <span className="text-[13px] font-extrabold sm:text-[15px]">
          Plymouth<span className={period}>.</span>
        </span>
      </span>
    </a>
  );
}
