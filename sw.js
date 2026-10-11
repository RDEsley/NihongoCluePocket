// Offline: tudo é pré-carregado na primeira visita. Ao mudar qualquer arquivo, suba a versão.
const CACHE = "nihongo-pocket-v4";
const ASSETS = [
  "./",
  "css/styles.css",
  "js/data.js",
  "js/legal.js",
  "js/pix.js",
  "js/invite.js",
  "js/app.js",
  "vendor/qrcode-generator.js",
  "vendor/lottie_light.min.js",
  "animations/donation-wave.webp",
  "animations/donation-wave-still.webp",
  "animations/donation-jar.json",
  "animations/donation-heart.json",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Responde do cache na hora e atualiza em segundo plano quando houver rede
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok && !response.redirected) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached || cache.match("./"));
      return cached || fresh;
    })
  );
});
