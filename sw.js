/* Mathewerkstatt – Service Worker: Netzwerk zuerst, ohne Verbindung aus dem Zwischenspeicher. */
const CACHE = 'mathewerkstatt-v1';
const START = ['./', 'index.html', 'css/app.css', 'src/app.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(START)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request)
      .then((antwort) => {
        if (antwort.ok) {
          const kopie = antwort.clone();
          caches.open(CACHE).then((c) => c.put(ev.request, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(ev.request).then((r) => r || caches.match('index.html')))
  );
});
