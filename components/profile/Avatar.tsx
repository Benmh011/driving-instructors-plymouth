export function Avatar({
  photoUrl,
  initials,
  className = "h-12 w-12 rounded-xl",
  textClassName = "text-base",
  tone = "onLight",
}: {
  photoUrl: string | null;
  initials: string;
  className?: string;
  textClassName?: string;
  tone?: "onLight" | "onDark";
}) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photoUrl}
        alt=""
        className={`${className} shrink-0 object-cover`}
      />
    );
  }
  const toneCls =
    tone === "onDark"
      ? "bg-white/15 text-white ring-1 ring-white/20"
      : "bg-tarmac text-cream";
  return (
    <div
      className={`${className} grid shrink-0 place-items-center font-display font-bold ${textClassName} ${toneCls}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
