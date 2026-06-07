export function Logo({
  className = "",
  variant = "onLight",
  href = "#top",
}: {
  className?: string;
  variant?: "onLight" | "onDark";
  href?: string;
}) {
  const text = variant === "onLight" ? "text-ink" : "text-paper";
  // The L-plate is always red (traditional learner plate). The period
  // accent is red on dark backgrounds, navy on light ones.
  const period = variant === "onDark" ? "text-signal" : "text-ink";
  return (
    <a href={href} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="lplate h-9 w-9 shrink-0 text-lg leading-none transition-transform duration-300 group-hover:-rotate-6">
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
