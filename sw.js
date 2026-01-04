const CACHE_NAME = 'lorevault-v2';
const assets = [
  './',
  './index.html',
  './lorevault.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => {
      return res || fetch(evt.request);
    })
  );
});
