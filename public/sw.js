/**
 * Vende Ya — Service Worker
 * =====================================================================
 * Strategy:
 *  - Navigation (HTML): network-first (always latest HTML so chunk URLs
 *    match the current deployment). Fallback to cached '/' only offline.
 *  - Next.js chunks (_next/static/*, *.js, *.css, fonts, images): cache-first.
 *    These are content-addressed (hash in filename) so cached versions are
 *    always safe to reuse IF the HTML referencing them is also current.
 *  - API routes: network-first (always fresh, fallback to cache)
 *  - Offline fallback: serve cached home page
 *
 * WHY NETWORK-FIRST FOR HTML (was stale-while-revalidate):
 * The previous stale-while-revalidate strategy served the CACHED HTML
 * immediately, then fetched new HTML in the background. Problem: the cached
 * HTML referenced chunk URLs like /_next/static/chunks/abc123.js that had
 * been DELETED from the server by a newer Vercel deployment. Result:
 * 404 on the chunk → 'Application error: a client-side exception has
 * occurred' → blank page. Network-first for navigation ensures the HTML
 * always matches the currently-deployed chunks.
 *
 * Lifecycle:
 *  - install: skipWaiting (no pre-cache — see bug above)
 *  - activate: clean old caches + clients.claim
 *  - fetch: route through strategy
 *  - message: skipWaiting on update
 * =====================================================================
 */
const SW_VERSION = 'vendeya-v2-2026-08-17-network-first-nav'
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
// INSTALL — skip pre-cache (it caused stale HTML → 404 chunks bug).
// Navigation will fetch fresh HTML on first visit; static chunks are
// cached lazily as they're requested.
// =====================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(Promise.resolve())
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

  // Navigation (HTML) — network-first to ensure HTML matches current
  // deployment's chunk URLs. Falls back to cached '/' only when offline.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, '/'))
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

async function networkFirstWithFallback(request, fallbackUrl) {
  // Always hit the network first for HTML navigations. This guarantees
  // the served HTML references chunks that actually exist in the current
  // Vercel deployment. Falls back to cached '/' only when the network
  // is unreachable (offline).
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      const cache = await caches.open(SW_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cache = await caches.open(SW_VERSION)
    const cached = await cache.match(request)
    if (cached) return cached
    const fallback = await cache.match(fallbackUrl || '/')
    return fallback || Response.error()
  }
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
