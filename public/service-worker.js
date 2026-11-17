/*
 * Offline-first service worker.
 *
 * The two placeholders below are filled in at build time by the
 * "precache-sw" plugin in vite.config.ts:
 *   - PRECACHE  -> every file of the final build (dist/)
 *   - BUILD_ID  -> hash of those files, so every new release gets
 *                  its own cache and old caches are removed cleanly.
 */
const BUILD_ID = '__BUILD_ID__'
const PRECACHE = /*__PRECACHE__*/ []
const CACHE = 'phone-' + BUILD_ID
const SCOPE = self.registration.scope
const INDEX = new URL('index.html', SCOPE).href

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // Cache everything (HTML, JS, CSS, fonts, icons) up-front so the
      // very first launch is enough to work offline afterwards.
      await cache.addAll(
        PRECACHE.map((url) => new Request(new URL(url, SCOPE).href, { cache: 'reload' })),
      )
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k.startsWith('phone-') && k !== CACHE).map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // Never touch cross-origin requests (the app makes none).
  if (url.origin !== self.location.origin) return

  // Page navigations: always serve the cached app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(INDEX).then((hit) => hit || fetch(req).catch(() => offlineResponse())),
    )
    return
  }

  // Static assets: Cache First.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          })
          .catch(() => offlineResponse()),
    ),
  )
})

function offlineResponse() {
  return new Response('Offline', { status: 503, statusText: 'Offline' })
}
