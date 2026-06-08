// UK tax year runs 6 April to 5 April (inclusive). We work in UTC to stay
// consistent with how lessons are stored/displayed elsewhere in the app.

export function currentTaxYearStartYear(now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const april6 = Date.UTC(y, 3, 6); // month index 3 = April
  return now.getTime() >= april6 ? y : y - 1;
}

export function taxYearBounds(startYear: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(startYear, 3, 6)),
    end: new Date(Date.UTC(startYear + 1, 3, 6)), // exclusive
  };
}

export function taxYearLabel(startYear: number): string {
  const next = (startYear + 1) % 100;
  return `${startYear}/${next.toString().padStart(2, "0")}`;
}

export function gbp(pence: number): string {
  return (pence / 100).toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
}
