// NeoPaste Service Worker for Performance Optimization
const CACHE_NAME = 'neopaste-v7';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

// Helper function to check if cached response is expired
function isCacheExpired(response) {
  if (!response) return true;
  
  const cachedDate = response.headers.get('sw-cached-date');
  if (!cachedDate) return true;
  
  const age = Date.now() - parseInt(cachedDate);
  return age > CACHE_EXPIRY;
}

// Helper function to add timestamp to response
function addTimestampToResponse(response) {
  const responseClone = response.clone();
  const newHeaders = new Headers(responseClone.headers);
  newHeaders.set('sw-cached-date', Date.now().toString());
  
  return new Response(responseClone.body, {
    status: responseClone.status,
    statusText: responseClone.statusText,
    headers: newHeaders
  });
}

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

// Activate event - clean up old caches and expired entries
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old cache versions
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames
              .filter(cacheName => cacheName !== CACHE_NAME)
              .map(cacheName => caches.delete(cacheName))
          );
        }),
      // Clean up expired entries in current cache
      caches.open(CACHE_NAME)
        .then(cache => {
          return cache.keys().then(requests => {
            return Promise.all(
              requests.map(request => {
                return cache.match(request).then(response => {
                  if (isCacheExpired(response)) {
                    console.log('Removing expired cache entry:', request.url);
                    return cache.delete(request);
                  }
                });
              })
            );
          });
        })
    ]).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with expiration check and network fallback
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
        // Check if cached response exists and is not expired
        if (response && !isCacheExpired(response)) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // If expired or not cached, fetch from network
        console.log('Cache expired or missing, fetching from network:', event.request.url);
        
        // Clone the request for caching
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(networkResponse => {
            // Check if valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Add timestamp and cache the response for static assets
            if (STATIC_ASSETS.some(asset => event.request.url.includes(asset))) {
              const responseWithTimestamp = addTimestampToResponse(networkResponse);
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseWithTimestamp.clone());
                });
              
              return responseWithTimestamp;
            }

            return networkResponse;
          })
          .catch(() => {
            // If network fails, try to serve stale cache as fallback
            if (response) {
              console.log('Network failed, serving stale cache:', event.request.url);
              return response;
            }
            
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
