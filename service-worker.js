const CACHE_NAME = 'dad-jokes-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

// Installation of Service Worker and Caching Resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
      })
  );
});

// Fetch Event to Serve Cached Resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if available, else fetch from network
        return response || fetch(event.request)
          .catch(error => {
            console.error('Failed to fetch resource:', error);
          });
      })
      .catch(error => {
        console.error('Error matching cache:', error);
      })
  );
});

// Activate Event to Clean Up Old Caches (Optional)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).catch(error => {
      console.error('Failed to delete old caches during activate:', error);
    })
  );
});
