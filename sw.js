const CACHE_NAME = "barber-agenda-v2";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ARQUIVOS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(chaves) {
      return Promise.all(
        chaves.map(function(chave) {
          if (chave !== CACHE_NAME) {
            return caches.delete(chave);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(respostaCache) {
      if (respostaCache) {
        return respostaCache;
      }

      return fetch(event.request).then(function(resposta) {
        if (resposta && resposta.ok) {
          const copia = resposta.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copia);
          });
        }

        return resposta;
      }).catch(function() {
        return caches.match("./index.html");
      });
    })
  );
});
