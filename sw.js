
const CACHE = "barber-agenda-v1";

self.addEventListener("install", event => {
 event.waitUntil(
  caches.open(CACHE).then(cache =>
   cache.addAll(["./", "./index.html", "./manifest.json"])
  )
 );
 self.skipWaiting();
});

self.addEventListener("activate", event => {
 event.waitUntil(
  caches.keys().then(keys =>
   Promise.all(
    keys.filter(key => key !== CACHE).map(key => caches.delete(key))
   )
  )
 );
 self.clients.claim();
});

self.addEventListener("fetch", event => {
 if(event.request.method !== "GET") return;

 const url = new URL(event.request.url);
 if(url.origin !== self.location.origin) return;

 event.respondWith(
  fetch(event.request).then(response => {
   if(response.ok){
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
   }
   return response;
  }).catch(async()=>{
   return await caches.match(event.request) ||
    new Response("Você está sem conexão.",{
     headers:{"Content-Type":"text/plain; charset=utf-8"}
    });
  })
 );
});
