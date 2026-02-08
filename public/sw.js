const CACHE_NAME = 'lofi-mixer-v2';
const STATIC_CACHE = 'lofi-mixer-static-v2';
const DYNAMIC_CACHE = 'lofi-mixer-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.error('Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: Cache with expiration
async function cacheWithExpiration(request, response, cacheName, maxAge = 86400000) {
  const cache = await caches.open(cacheName);
  const metadata = {
    timestamp: Date.now(),
    maxAge: maxAge
  };
  
  const headers = new Headers(response.headers);
  headers.append('X-Cache-Timestamp', metadata.timestamp.toString());
  headers.append('X-Cache-Max-Age', metadata.maxAge.toString());
  
  const cachedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
  
  await cache.put(request, cachedResponse);
}

// Helper: Check if cached response is expired
function isExpired(response) {
  const timestamp = response.headers.get('X-Cache-Timestamp');
  const maxAge = response.headers.get('X-Cache-Max-Age');
  
  if (!timestamp || !maxAge) return false;
  
  return Date.now() - parseInt(timestamp) > parseInt(maxAge);
}

// Fetch event - stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  const { request } = event;
  
  // HTML files - network first, fallback to cache
  if (request.destination === 'document' || request.url.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              '<!DOCTYPE html><html><head><title>Offline</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0f172a;color:white;text-align:center}</style></head><body><div><h1>🎵 Offline</h1><p>Lofi Mixer is not available offline.<br>Please connect to the internet.</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }
  
  // JS/CSS files - cache first, stale-while-revalidate
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cacheWithExpiration(request, networkResponse.clone(), STATIC_CACHE, 86400000);
          }
          return networkResponse;
        }).catch(() => null);
        
        return cachedResponse && !isExpired(cachedResponse) 
          ? cachedResponse 
          : fetchPromise.then(res => res || cachedResponse);
      })
    );
    return;
  }
  
  // Images and other assets - cache with 7-day expiration
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse && !isExpired(cachedResponse)) {
        // Return cached and update in background
        fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cacheWithExpiration(request, networkResponse, DYNAMIC_CACHE, 604800000);
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          cacheWithExpiration(request, networkResponse.clone(), DYNAMIC_CACHE, 604800000);
        }
        return networkResponse;
      }).catch(() => cachedResponse);
    })
  );
});

// Background sync for offline recording uploads (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-recording') {
    event.waitUntil(
      // Future: implement recording upload retry
      Promise.resolve()
    );
  }
});

// Push notifications support (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Lofi Mixer', {
        body: data.body || 'Your timer is complete!',
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg'
      })
    );
  }
});
