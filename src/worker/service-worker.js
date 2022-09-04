var CACHE_NAME = 'hens-world-@@cacheVersion';
var urlsToCache = [
  './version-@@currentVersion/js/libs/libs.js', './version-@@currentVersion/js/scripts.js'
];

self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(caches.open(CACHE_NAME)
    .then(function (cache) {
      return cache.addAll(urlsToCache);
    }).catch(error => {
      console.error('error service worker', error);
    }));
});

self.addEventListener('push', (event) => {
  let [title, body] = event.data.text().split('||');
  const promiseChain = self.showNotification(title,  {
    body: body,
  });
  event.waitUntil(promiseChain);
});

/**
 * Handle notification server change
 */
self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request)
    .then(function (response) {
      if (response) {
        return response;     // if valid response is found in cache return it
      } else {
        return fetch(event.request).then(function (response) {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function (cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function (err) {       // fallback mechanism
          return caches.open(CACHE_NAME)
            .then(function (cache) {
              return cache.match('/offline.html');
            });
        });
      }
    }).catch(e=>{
      console.log("ERROR respond error", Object.keys(e), event.request);
  }));
});