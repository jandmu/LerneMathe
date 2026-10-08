/*
 * Mathewerkstatt – Service Worker.
 * Netzwerk zuerst und immer beim Server nachfragen (cache: 'no-cache'), damit nach einem Update
 * nie alte und neue Programmdateien gemischt werden. Ohne Verbindung kommt alles aus dem Zwischenspeicher.
 * Bei jeder Veröffentlichung VERSION erhöhen, damit Browser den neuen Service Worker übernehmen.
 */
const VERSION = '7';
const CACHE = 'mathewerkstatt-' + VERSION;
const START = ['./', 'index.html', 'css/app.css', 'src/app.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(START.map((u) => new Request(u, { cache: 'no-cache' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const eigene = new URL(req.url).origin === self.location.origin;
  const holen = eigene ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req);
  ev.respondWith(
    holen
      .then((antwort) => {
        if (eigene && antwort.ok) {
          const kopie = antwort.clone();
          caches.open(CACHE).then((c) => c.put(req, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
