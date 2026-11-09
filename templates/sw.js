/**
 * templates/sw.js
 * InsurIntel HK ServiceWorker for Offline PWA Support
 * Cache-First Strategy for Offline High-Availability & Coffee-Shop Meetings
 */

const CACHE_NAME = 'insurintel-cache-v5-unified';
const UNIFIED_VIEWS = ['#battlecard', '#gl16', '#briefing', '#scanner', '#pricing'];
const PRECACHE_URLS = [
  './',
  './index.html',
  './cafe.html',
  './gn16_tracker.html',
  './morning_slides.html',
  './waitlist.html',
  './index.html?mode=demo',
  './cafe.html?mode=demo',
  './index.html#battlecard',
  './index.html#gl16',
  './index.html#briefing',
  './index.html#scanner',
  './index.html#pricing'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
