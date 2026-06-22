// Validate a ?next redirect target so we only ever send people to an internal
// path — never an external or protocol-relative URL. Returns the fallback when
// the value is missing or unsafe.
export function safeNext(raw: unknown, fallback = "/dashboard"): string {
  const s = typeof raw === "string" ? raw : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
}
