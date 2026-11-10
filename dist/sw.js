/**
 * templates/sw.js
 * InsurIntel HK ServiceWorker for Offline PWA Support
 * Network-First Strategy with Automatic Legacy Cache Eviction & Client Refresh
 */

const CACHE_NAME = 'insurintel-cache-v11-private-bank-split';
const UNIFIED_VIEWS = ['#battlecard', '#gl16', '#briefing', '#scanner', '#pricing'];
const PRECACHE_URLS = [
  './',
  './index.html',
  './cafe.html',
  './gn16_tracker.html',
  './morning_slides.html',
  './waitlist.html',
  './index.html#battlecard',
  './index.html#gl16',
  './index.html#briefing',
  './index.html#scanner',
  './index.html#pricing'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      let deletedLegacyCache = false;
      await Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            deletedLegacyCache = true;
            return caches.delete(cache);
          }
        })
      );
      await self.clients.claim();
      if (deletedLegacyCache) {
        const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windowClients) {
          try {
            if (client.url && 'navigate' in client) {
              const cleanUrl = client.url
                .replace(/([?&])(mode=demo|demo=1|demo=true)(&|$)/g, '$1')
                .replace(/[?&]$/, '');
              await client.navigate(cleanUrl);
            }
          } catch (e) {}
        }
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-First Strategy: always serve fresh live HTML/assets when online; fallback to cache only when offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
