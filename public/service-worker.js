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
const ROOT = new URL('./', SCOPE).href
const INDEX = new URL('index.html', SCOPE).href

// A response that followed a redirect (Cloudflare redirects /index.html -> /)
// must never be used to answer a navigation: the browser shows ERR_FAILED.
// Rebuild it as a clean, non-redirected response.
async function clean(res) {
  if (!res || !res.redirected) return res
  const body = await res.blob()
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers })
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // Cache everything (HTML, JS, CSS, fonts, icons) up-front so the
      // very first launch is enough to work offline afterwards.
      await Promise.all(
        PRECACHE.map(async (url) => {
          const href = new URL(url, SCOPE).href
          const res = await fetch(new Request(href, { cache: 'reload' }))
          if (!res.ok) throw new Error('precache failed: ' + href)
          await cache.put(href, await clean(res))
        }),
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

  // Page navigations: serve the cached app shell (cleaned of redirects).
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const hit = (await caches.match(ROOT)) || (await caches.match(INDEX))
        if (hit) return clean(hit)
        try {
          return await clean(await fetch(req))
        } catch {
          return offlineResponse()
        }
      })(),
    )
    return
  }

  // Static assets: Cache First.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        (hit ? clean(hit) : null) ||
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
