const CACHE_NAME = "vamoscomprar-cache-v1";
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
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
