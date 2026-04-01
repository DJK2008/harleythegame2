const CACHE_NAME = 'harley-game-cache-v2';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './js/config.js',
  './js/assets.js',
  './js/firebase-service.js',
  './manifest.json',
  './assets/eagle.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Forceer de nieuwe service worker om direct actief te worden
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  // Verwijder oude caches zodat spelers niet met oude code blijven zitten
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
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Strategie: Netwerk eerst, val terug op cache als de speler offline is
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Als we online zijn, sla de nieuwste versie direct op in de cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Als fetch faalt (speler is offline), pak dan de versie uit de cache
        return caches.match(event.request);
      })
  );
});