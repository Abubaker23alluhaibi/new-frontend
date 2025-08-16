// Service Worker for Tabib IQ - Cache Control
const CACHE_NAME = 'tabib-iq-v2-' + Date.now();
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png'
];

// Install event - clear old caches and set up new ones
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Caching app shell');
      return caches.open(CACHE_NAME);
    }).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch(error => {
      console.log('Service Worker: Cache setup failed', error);
    })
  );
});

// Fetch event - always fetch fresh content
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Skip requests to external domains
  if (new URL(request.url).origin !== location.origin) {
    return;
  }
  
  console.log('Service Worker: Fetching', request.url);
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch((error) => {
        console.log('Service Worker: Fetch failed, trying cache', request.url, error);
        // If network fails, try to get from cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return a fallback response for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Network error', { status: 408, statusText: 'Request timeout' });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Skip waiting to activate immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle errors
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled rejection', event.reason);
}); 