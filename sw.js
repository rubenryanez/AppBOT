/* Service Worker MVP — cache simple con bust por versión.
   Bumpear CACHE_VERSION cuando se actualicen los JSONs del corpus. */

const CACHE_VERSION = "lvam-ffvv-v2-2026-06-13";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./corpus/apv.json",
  "./corpus/regulacion.json",
  "./corpus/operaciones.json",
  "./corpus/flv.json",
  "./config/search-config.json",
  "./config/synonyms.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  // Solo manejar GET de mismo origen
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Revalidar en background (stale-while-revalidate liviano)
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_VERSION).then(c => c.put(event.request, response.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const respClone = response.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, respClone));
        }
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
