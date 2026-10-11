// Offline: tudo é pré-carregado na primeira visita. Ao mudar qualquer arquivo, suba a versão.
const CACHE = "nihongo-pocket-v5";
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
  // Uma versão nova fica em espera: a página avisa e só troca quando a pessoa toca em Atualizar
  // (ou quando o app é fechado e aberto de novo)
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Responde só com os arquivos desta versão, para que ela não se misture com a próxima.
// O que não está no cache vem da rede
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      return cached || fetch(request).catch(() => cache.match("./"));
    })
  );
});
