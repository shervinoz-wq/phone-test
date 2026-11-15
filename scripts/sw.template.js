/* Offline-first service worker. Generated into dist/sw.js at build time. */
const VERSION = '__VERSION__'
const CACHE_PREFIX = 'phone-app-'
const CACHE = CACHE_PREFIX + VERSION
const PRECACHE = __PRECACHE__

const scopeUrl = (path) => new URL(path, self.registration.scope).toString()

// A response that followed a redirect (e.g. /index.html -> /) cannot be used
// to answer a navigation request, or the browser shows ERR_FAILED. Rebuild it.
function cleanResponse(response) {
  if (!response.redirected) return Promise.resolve(response)
  return response.blob().then(
    (body) =>
      new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }),
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(
          [scopeUrl('./'), ...PRECACHE.map(scopeUrl)].map(
            (url) => new Request(url, { cache: 'reload' }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Never touch cross-origin requests: the app makes none.
  if (url.origin !== self.location.origin) return

  // App shell for any navigation (Cache First).
  if (request.mode === 'navigate') {
    event.respondWith(
      caches
        .match(scopeUrl('./'))
        .then((cached) => cached || caches.match(scopeUrl('index.html')))
        .then((cached) => (cached ? cleanResponse(cached) : fetch(request))),
    )
    return
  }

  // Static assets: Cache First.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(
      (cached) =>
        (cached ? cleanResponse(cached) : null) ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
