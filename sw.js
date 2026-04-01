const CACHE_NAME = 'harley-game-cache-v1';

// We cachen in deze basis-setup de core bestanden. 
// Je kunt hier later specifieke grote audio/afbeeldingen aan toevoegen.
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
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  // Gebruik de cache-first strategie voor snellere laadtijden
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});