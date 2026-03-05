const CACHE_NAME = "lista-compras-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instala e guarda arquivos no cache
self.addEventListener("install", event => {
  // Força o Service Worker a se tornar o ativo imediatamente
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Cache aberto com sucesso!");
      return cache.addAll(urlsToCache);
    })
  );
});

// Ativa e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Garante que o SW controle a página imediatamente
  return self.clients.claim();
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna o cache ou busca na rede
      return response || fetch(event.request).catch(() => {
        // Fallback: se estiver offline e o recurso não estiver no cache
        console.log("Recurso não encontrado no cache e você está offline.");
      });
    })
  );
});
