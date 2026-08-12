const CACHE = "pathseeker-v2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // The page itself always comes from the network, bypassing the HTTP cache — a stale
  // shell used to survive even a hard refresh. Assets stay network-first with cache fallback.
  const isDoc = e.request.mode === "navigate";
  const req = isDoc ? new Request(e.request.url, { cache: "reload" }) : e.request;
  e.respondWith(
    fetch(req)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
