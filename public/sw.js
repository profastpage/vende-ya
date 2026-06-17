/**
 * Vende Ya — Service Worker
 * =====================================================================
 * Strategy:
 *  - App shell (HTML, JS, CSS): stale-while-revalidate
 *  - Static assets (fonts, images, icons): cache-first
 *  - API routes: network-first (always fresh, fallback to cache)
 *  - Offline fallback: serve cached home page
 *
 * Lifecycle:
 *  - install: pre-cache app shell
 *  - activate: clean old caches
 *  - fetch: route through strategy
 *  - message: skipWaiting on update
 * =====================================================================
 */
const SW_VERSION = 'vendeya-v1'
const APP_SHELL = [
  '/',
  '/en-vivo',
  '/marketplace',
  '/login',
  '/dashboard',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

// =====================================================================
// INSTALL — pre-cache app shell
// =====================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SW_VERSION).then((cache) => {
      console.log('[SW] Caching app shell')
      return cache.addAll(APP_SHELL).catch((err) => {
        // Don't fail install if a single resource can't be cached
        console.warn('[SW] Some app shell resources failed to cache:', err)
      })
    })
  )
  self.skipWaiting()
})

// =====================================================================
// ACTIVATE — clean old caches
// =====================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== SW_VERSION)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    )
  )
  self.clients.claim()
})

// =====================================================================
// FETCH — routing strategies
// =====================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Skip chrome-extension and external origins (except same-origin)
  if (url.origin !== self.location.origin) return

  // Skip Next.js dev/HMR
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  // API routes — network-first (always fresh when online)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Navigation (HTML) — stale-while-revalidate, fallback to cached '/'
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request, '/'))
    return
  }

  // Static assets (JS, CSS, fonts, images) — cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|avif|ico)$/i)
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Default: try network, fall back to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || Response.error()))
  )
})

// =====================================================================
// PUSH — display notifications
// =====================================================================
self.addEventListener('push', (event) => {
  let data = { title: 'Vende Ya', body: 'Tienes una nueva notificación' }
  try {
    if (event.data) data = event.data.json()
  } catch {
    if (event.data) data.body = event.data.text()
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    tag: data.tag || 'vendeya-notification',
    renotify: true,
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Cerrar' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// =====================================================================
// NOTIFICATION CLICK — focus or open the app
// =====================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if found
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate?.(targetUrl)
          return client.focus()
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// =====================================================================
// MESSAGE — accept skipWaiting command from page
// =====================================================================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// =====================================================================
// HELPERS
// =====================================================================
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SW_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return Response.error()
  }
}

async function staleWhileRevalidate(request, fallbackUrl) {
  const cache = await caches.open(SW_VERSION)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    void fetchPromise // revalidate in background
    return cached
  }

  const networkResponse = await fetchPromise
  if (networkResponse) return networkResponse

  // Last resort: serve cached fallback (home page) for offline navigation
  const fallback = await cache.match(fallbackUrl || '/')
  return fallback || Response.error()
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SW_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || Response.error()
  }
}
