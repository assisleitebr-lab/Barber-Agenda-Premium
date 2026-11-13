
const CACHE_NAME = "nails-agenda-v2";

// Instala o Service Worker sem tentar carregar arquivos inexistentes.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Ativa e limpa caches antigos.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) => {
      return Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      );
    }).then(() => self.clients.claim())
  );
});

// Busca arquivos pela internet e guarda somente respostas válidas.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Não intercepta arquivos de outros domínios.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        if (resposta && resposta.ok) {
          const copia = resposta.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copia);
          });
        }

        return resposta;
      })
      .catch(async () => {
        const arquivoSalvo = await caches.match(event.request);

        if (arquivoSalvo) return arquivoSalvo;

        if (event.request.mode === "navigate") {
          const pagina = await caches.match("./index.html");
          if (pagina) return pagina;
        }

        return new Response("Você está sem conexão com a internet.", {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      })
  );
});
