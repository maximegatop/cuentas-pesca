// Service worker: guarda la app para usarla sin conexión.
// Con internet, la página siempre se pide al servidor (así cada cambio publicado aparece al abrir la app).
// Sin internet, se usa la copia guardada. Al publicar cambios, subí CACHE_VERSION y APP_VERSION en index.html.
const CACHE_VERSION = "cuentas-pesca-v10";
const FONT_CACHE = "cuentas-pesca-fuentes";
const NETWORK_TIMEOUT_MS = 4000;
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
  // cache: "reload" evita que el navegador use una copia vieja de sus propios archivos temporales
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_FILES.map((path) => new Request(path, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_VERSION && name !== FONT_CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT_MS);
    fetch(request, { cache: "no-cache" }).then(
      (response) => { clearTimeout(timer); resolve(response); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

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

  // La página: primero internet (versión más nueva); si no hay señal, la copia guardada
  const isPage = request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");
  if (isPage) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        fetchWithTimeout(request)
          .then((response) => {
            if (response.ok) cache.put("./index.html", response.clone());
            return response;
          })
          .catch(() => cache.match("./index.html").then((cached) => cached || cache.match("./")))
      )
    );
    return;
  }

  // Resto de los archivos (jsPDF, íconos): la copia guardada y, si falta, internet
  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }))
    )
  );
});
