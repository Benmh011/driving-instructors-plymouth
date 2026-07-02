// Best-effort email discovery from a prospect's own website. Google Places never
// returns emails, so this is the only way to get a contact address without doing
// it by hand: fetch the site (home + a couple of likely contact pages) and pull
// out the first plausible published address. It finds emails on maybe a third to
// half of sites — many only have a contact form or push you to Facebook — so a
// null result is normal, not a failure.

const FETCH_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 500_000;

// Strings that mean "not a real human contact address".
const JUNK =
  /(sentry|wixpress|\.wix\.|example\.(com|org)|yourdomain|domain\.com|godaddy|squarespace|schema\.org|w3\.org|\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg|@2x|@3x|core-?js|googleapis|gstatic|cloudflare|jsdelivr|bootstrapcdn|fontawesome|placeholder|sentry\.io|no-?reply|email@|name@|your@|user@|test@)/i;

function isPlausibleEmail(e: string): boolean {
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(e)) return false;
  if (e.length > 100) return false;
  if (JUNK.test(e)) return false;
  return true;
}

function toOrigin(raw: string): string | null {
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProto).origin;
  } catch {
    return null;
  }
}

function hostOf(origin: string): string {
  try {
    return new URL(origin).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function fetchText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DIPBot/1.0; +https://www.drivinginstructorsplymouth.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("text/plain")) return null;
    const text = await res.text();
    return text.slice(0, MAX_HTML_BYTES);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractEmail(html: string, host: string): string | null {
  const found = new Set<string>();

  // mailto: links are the most reliable signal.
  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) {
    try {
      const e = decodeURIComponent(m[1]).trim().toLowerCase();
      if (isPlausibleEmail(e)) found.add(e);
    } catch {
      /* skip malformed */
    }
  }

  // Fall back to plain-text addresses, decoding the common @ / . entity tricks.
  const decoded = html
    .replace(/&#0?64;|&#x40;/gi, "@")
    .replace(/&#0?46;|&#x2e;/gi, ".");
  for (const m of decoded.matchAll(
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
  )) {
    const e = m[0].trim().toLowerCase();
    if (isPlausibleEmail(e)) found.add(e);
  }

  if (found.size === 0) return null;
  const list = [...found];
  // Prefer an address on the site's own domain (info@theirschool.co.uk).
  const sameDomain = host
    ? list.find((e) => e.split("@")[1]?.endsWith(host))
    : undefined;
  return sameDomain ?? list[0];
}

// Fetch home + likely contact pages in parallel; return the first email found.
export async function findEmailOnSite(website: string): Promise<string | null> {
  const origin = toOrigin(website);
  if (!origin) return null;
  const host = hostOf(origin);
  const urls = [
    origin,
    `${origin}/contact`,
    `${origin}/contact-us`,
    `${origin}/about`,
  ];
  const pages = await Promise.all(urls.map((u) => fetchText(u)));
  for (const html of pages) {
    if (!html) continue;
    const email = extractEmail(html, host);
    if (email) return email;
  }
  return null;
}
