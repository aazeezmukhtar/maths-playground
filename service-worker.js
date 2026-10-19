const CACHE_NAME = 'maths-playground-v18';
const APP_SHELL = [
  './',
  './index.html',
  './modules/fractions/',
  './modules/fractions/index.html',
  './modules/numbers/',
  './modules/numbers/index.html',
  './modules/geometry/',
  './modules/geometry/index.html',
  './modules/challenges/',
  './modules/challenges/index.html',
  './subjects/',
  './subjects/index.html',
  './subjects/mathematics/',
  './subjects/mathematics/index.html',
  './subjects/logic/',
  './subjects/logic/index.html',
  './styles.css',
  './catalog.css',
  './catalog.js',
  './data/learning-catalog.js',
  './data/module-content.js',
  './data/activities.js',
  './learning-activities.js',
  './learning-activities.css',
  './learner-profiles.js',
  './learner-profiles.css',
  './learning-module.js',
  './learning-module.css',
  './app.js',
  './progress-dashboard.js',
  './data/gamification.js',
  './gamification.js',
  './gamification.css',
  './kid-navigation.js',
  './kid-navigation.css',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('This resource is unavailable offline.');
      });
    })
  );
});