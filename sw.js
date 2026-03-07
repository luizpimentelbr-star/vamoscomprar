// sw.js

const CACHE_NAME = "app-cache-v1";
const FILES_TO_CACHE = [
  "/",              // raiz
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json"
];

// Instala o service worker e faz cache dos arquivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // força ativação imediata
});

// Ativa o service worker e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // assume controle das páginas abertas
});

// Intercepta requisições e responde com cache ou rede
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
