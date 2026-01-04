// Service Worker pour LoreVault

const CACHE_NAME = 'lorevault-v1';
const urlsToCache = [
  '/LoreVault/',
  '/LoreVault/index.html',
  '/LoreVault/styles.css',
  '/LoreVault/script.js',
  '/LoreVault/app.js',
  '/LoreVault/records.js',
  '/LoreVault/manifest.json',
  '/LoreVault/lorevault.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des fichiers');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('[Service Worker] Erreur lors de la mise en cache:', error);
      })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
 self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ne gérer que les requêtes GET
  if (request.method !== 'GET') return;

  // Ne pas intercepter les requêtes externes
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // 1️Si trouvé dans le cache → direct
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2️ Sinon → réseau
      return fetch(request)
        .then((networkResponse) => {
          // Vérification réponse valide
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          // Mise en cache dynamique
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          // 3️ OFFLINE FALLBACK
          if (request.destination === 'document') {
            return caches.match('/LoreVault/index.html');
          }
        });
    })
  );
});
