// Tracker Data Management System - Service Worker
// Offline First PWA Caching Engine for GitHub Pages & Standalone Web App
const CACHE_NAME = 'tracker-pwa-v3.4';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './css/styles.css',
  './js/app.js',
  './sections/modals.js',
  './sections/front-page.js',
  './sections/data-check.js',
  './sections/dashboard.js',
  './sections/input-data.js',
  './sections/attendance-check.js',
  './sections/attendance-summary.js',
  './sections/data-views.js',
  './sections/events.js',
  './sections/archived-data.js',
  './sections/notes.js',
  './sections/about.js',
  './sections/ms-recommendation.js',
  './sections/settings.js',
  './vendor/tailwindcss.js',
  './vendor/xlsx.full.min.js',
  './vendor/chart.umd.min.js'
];

// Install: pre-cache all static assets immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Force fresh download during install to avoid stale HTTP cache
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const req = new Request(url, { cache: 'reload' });
            const res = await fetch(req);
            if (res && res.status === 200) {
              await cache.put(url, res);
            }
          } catch (err) {
            console.warn(`[SW] Pre-caching failed for: ${url}`, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Bulletproof offline caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignore non-GET requests and browser extensions
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (req.mode === 'navigate') {
    event.respondWith(
      // Try network with a 2-second timeout, falling back immediately to cache
      new Promise((resolve) => {
        let finished = false;
        const fallbackToCache = async () => {
          if (finished) return;
          finished = true;
          const cached = await caches.match(req, { ignoreSearch: true })
            || await caches.match('./index.html', { ignoreSearch: true })
            || await caches.match('./', { ignoreSearch: true });
          if (cached) {
            resolve(cached);
          } else {
            resolve(new Response('Offline - page not cached yet', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
          }
        };

        const timer = setTimeout(fallbackToCache, 2000);

        fetch(req)
          .then((networkResponse) => {
            if (finished) return;
            clearTimeout(timer);
            finished = true;
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
            }
            resolve(networkResponse);
          })
          .catch(() => {
            clearTimeout(timer);
            fallbackToCache();
          });
      })
    );
    return;
  }

  // 2. Static Assets (scripts, icons, manifest, stylesheets)
  // Strategy: Cache-First with Stale-While-Revalidate
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset instantly (0ms latency, 100% offline), update cache in background when online
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
            }
          })
          .catch(() => {/* Offline, ignore */});
        return cachedResponse;
      }

      // If not in cache, fetch from network and dynamically cache
      return fetch(req)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an image or icon, return fallback icon
          if (req.destination === 'image') {
            return caches.match('./icon-192.png', { ignoreSearch: true });
          }
        });
    })
  );
});
