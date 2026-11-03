// Service worker: guarda la app para usarla sin conexión.
// Al publicar cambios, subí CACHE_VERSION para que los dispositivos tomen la versión nueva.
const CACHE_VERSION = "cuentas-pesca-v3";
const FONT_CACHE = "cuentas-pesca-fuentes";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./vendor/jspdf.umd.min.js",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_VERSION && name !== FONT_CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Fuentes de Google: se guardan la primera vez que se usan
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => cached || fetch(request).then((response) => {
          if (response.ok || response.type === "opaque") cache.put(request, response.clone());
          return response;
        }))
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Archivos de la app: responde al instante desde el caché y actualiza en segundo plano
  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(request, { ignoreSearch: true }).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }).catch(() => cached || (request.mode === "navigate" ? cache.match("./index.html") : undefined));
        return cached || network;
      })
    )
  );
});
