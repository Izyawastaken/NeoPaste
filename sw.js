// NeoPaste Service Worker for Performance Optimization
const CACHE_NAME = 'neopaste-v5';

// Actual files being used by the application
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/view.html', 
  '/main.css',
  '/view.css',
  '/script-optimized.js',    // Used by index.html
  '/view-optimized.js',      // Used by view.html
  '/config.js',
  '/performance.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
        // Continue anyway - don't block installation
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request for caching
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the response for static assets
            if (STATIC_ASSETS.some(asset => event.request.url.includes(asset))) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for better performance
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background tasks
      console.log('Background sync performed')
    );
  }
});

// Push notifications (for future features)
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    };

    event.waitUntil(
      self.registration.showNotification('NeoPaste', options)
    );
  }
});
