// Clutch service worker — minimal offline shell for the first push.
// As the PWA grows, expand the precache list and add runtime strategies.
const CACHE = "clutch-v6";
const SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Only handle GET navigations/assets; let the API hit the network.
  if (request.method !== "GET" || request.url.includes("/api/")) return;

  const url = new URL(request.url);

  // RSC payloads (the fetches behind client-side <Link> navigations) are
  // per-user and dynamic. Always go straight to the network and never serve a
  // cached copy — otherwise, after switching accounts in the same tab, a
  // previous account's page can be handed back from cache.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
    event.respondWith(fetch(request));
    return;
  }

  // Full-page navigations: always fetch fresh HTML (bypassing the HTTP cache so
  // an old build can't strand the PWA). When genuinely offline, fall back to
  // the precached shell — never to a cached per-URL page, which could belong to
  // a different signed-in user.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.match("/")),
    );
    return;
  }

  // Immutable, content-hashed build assets (and icons/fonts) → cache-first.
  // These never change for a given URL, so serving from cache is instant and
  // always correct; a new build simply requests new hashed filenames.
  const immutable =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/fonts/"));
  if (immutable) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Everything else → stale-while-revalidate: serve the cached copy instantly
  // (fast), then refresh it in the background for next time.
  event.respondWith(
    caches.match(request).then((hit) => {
      const fetched = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => hit || caches.match("/"));
      return hit || fetched;
    }),
  );
});

// --- Web push ---------------------------------------------------------------
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Driving Instructors Plymouth";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || undefined,
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(target) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      }),
  );
});
