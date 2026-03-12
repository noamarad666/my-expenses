const CACHE = 'kessef-v2';

// On install — cache the main app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/my-expenses/', '/my-expenses/index.html'])
        .catch(() => cache.addAll(['/my-expenses/index.html']))
    )
  );
  self.skipWaiting();
});

// On activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// On fetch — network first, fall back to cache
self.addEventListener('fetch', e => {
  // Only handle GET requests for our own pages
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
