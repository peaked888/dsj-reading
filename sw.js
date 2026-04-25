const CACHE = 'dsj-v1';
const ASSETS = [
  './index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap'
];

// 安裝：快取靜態資源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 啟用：清除舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 攔截請求：優先用網路，失敗才用快取（Firebase 請求不快取）
self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Firebase / Google API 請求直接走網路，不快取
  if (url.includes('firestore.googleapis.com') ||
      url.includes('firebase') ||
      url.includes('googleapis.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功就更新快取
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)) // 離線時用快取
  );
});
