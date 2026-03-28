const CACHE_NAME = "vamoscomprar-cache-v4";
const urlsToCache = [
  "/vamoscomprar/",
  "/vamoscomprar/index.html",
  "/vamoscomprar/estilo.css",
  "/vamoscomprar/script.js",
  "/vamoscomprar/manifest.json",
  "/vamoscomprar/ícones/ícone-192.png",
  "/vamoscomprar/ícones/ícone-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return response || fetchPromise;
    })
  );
});

// 🔔 Notificação de atualização
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
