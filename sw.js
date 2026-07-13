// update-v1.1-20260714-submit-fix2 - 還原相容寫入流程，強制淘汰舊快取
const CACHE = 'dsj-update-v1.1-20260714-submit-fix2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
