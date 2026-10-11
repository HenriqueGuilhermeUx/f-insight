// Service Worker for the native-faithful F-Insight PWA.
const CACHE_NAME = 'f-insight-mobile-v3';
const STATIC_ASSETS = [
  '/',
  '/app/mobile',
  '/index.html',
  '/manifest.json',
  '/finsight-app-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && !url.pathname.startsWith('/cliente') && !url.pathname.startsWith('/admin') && !url.pathname.startsWith('/assessor')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('/index.html');
        return new Response('Offline', { status: 503 });
      }))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'F-Insight';
  const options = {
    body: data.body || 'Novo sinal ou atualização no F-Insight.',
    icon: '/finsight-app-icon.svg',
    badge: '/finsight-app-icon.svg',
    data: data.url || '/app/mobile',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/app/mobile'));
});
