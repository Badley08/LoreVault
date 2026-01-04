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
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ne pas mettre en cache les requêtes externes (CDN, etc.)
  if (!event.request.url.includes('/LoreVault/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la ressource du cache si disponible
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then((response) => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse
            const responseToCache = response.clone();

            // Mettre en cache la nouvelle ressource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.log('[Service Worker] Erreur de réseau:', error);
            // Retourner une page d'erreur personnalisée si nécessaire
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
