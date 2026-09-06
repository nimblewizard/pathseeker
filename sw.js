const CACHE = "pathseeker-v4";
const NET_TIMEOUT_MS = 3500;   // one bar of signal used to mean a long white screen
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// Map tiles and translator models keep their own caches (ps-tiles-v1, transformers-cache) —
// don't duplicate 300 MB of model files in the app cache.
const skipCache = (url) => /huggingface\.co|hf\.co|cdn-lfs|tile\.openstreetmap\.org/.test(url);
const withTimeout = (p, ms) => new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error("timeout")), ms);
  p.then((v) => { clearTimeout(t); res(v); }, (err) => { clearTimeout(t); rej(err); });
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (skipCache(e.request.url)) return;
  const isDoc = e.request.mode === "navigate";
  // The page itself bypasses the HTTP cache so a stale shell can't survive a hard refresh…
  const req = isDoc ? new Request(e.request.url, { cache: "reload" }) : e.request;
  const net = fetch(req).then((r) => {
    if (r && (r.ok || r.type === "opaque")) {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
    }
    return r;
  });
  if (isDoc) {
    // …but on a weak signal we don't wait forever: after 3.5 s serve the cached app and let the
    // network copy refresh the cache in the background for next time.
    e.respondWith(
      withTimeout(net, NET_TIMEOUT_MS).catch(() =>
        caches.match(e.request, { ignoreSearch: true }).then((c) => c || net))
    );
    return;
  }
  e.respondWith(net.catch(() => caches.match(e.request, { ignoreSearch: true })));
});
