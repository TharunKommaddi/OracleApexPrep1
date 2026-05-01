// Oracle APEX Interview Prep - Service Worker
// Auto-versioning using timestamp - no manual version change needed!

const CACHE_NAME = 'apex-prep-' + new Date().toISOString().split('T')[0];

// Core files to cache
const CORE_ASSETS = [
  '/OracleAPEXPrep1/index.html',
  '/OracleAPEXPrep1/manifest.json'
];

// ─── INSTALL ───────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ──────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── FETCH ─────────────────────────────────────────────
// Network first always - ensures fresh content every time
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Always try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request)
        .then(cached => cached || caches.match('/OracleAPEXPrep1/index.html'))
      )
  );
});
