// Format an instructor's car into a single readable line, e.g.
// "2021 Vauxhall Corsa · Blue". Returns null when there's no make or model to
// show (falling back to free-text carDetails is the caller's choice).
export function formatCar(c: {
  carMake?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  carColour?: string | null;
}): string | null {
  const makeModel = [c.carMake, c.carModel].filter(Boolean).join(" ").trim();
  if (!makeModel) return null;
  const name = [c.carYear ? String(c.carYear) : null, makeModel]
    .filter(Boolean)
    .join(" ");
  return c.carColour ? `${name} · ${c.carColour}` : name;
}
