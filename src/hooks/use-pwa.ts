'use client'

/**
 * VENDE YA — usePWA hook
 * =====================================================================
 * Registers the service worker, exposes the install prompt event, and
 * provides helpers to subscribe to Web Push notifications.
 *
 * Usage:
 *   const { canInstall, promptInstall, canSubscribePush, subscribePush, updateAvailable, applyUpdate } = usePWA()
 * =====================================================================
 */
import * as React from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [canInstall, setCanInstall] = React.useState(false)
  const [installed, setInstalled] = React.useState(false)
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [pushSupported, setPushSupported] = React.useState(false)
  const [pushSubscribed, setPushSubscribed] = React.useState(false)
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null)

  const installEventRef = React.useRef<BeforeInstallPromptEvent | null>(null)

  // =====================================================================
  // SW REGISTRATION
  // =====================================================================
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        setRegistration(reg)
        console.log('[PWA] SW registered:', reg.scope)

        // Check for updates every 60s
        setInterval(() => reg.update(), 60_000)

        // Listen for new SW waiting
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })

        // Push subscription status
        if ('pushManager' in window) {
          setPushSupported(true)
          const sub = await reg.pushManager.getSubscription()
          setPushSubscribed(!!sub)
        }
      } catch (err) {
        console.error('[PWA] SW registration failed:', err)
      }
    }

    register()

    // =====================================================================
    // PWA install prompt
    // =====================================================================
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      installEventRef.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
      console.log('[PWA] Install prompt available')
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setCanInstall(false)
      installEventRef.current = null
      console.log('[PWA] App installed')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)

    // Detect if already running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  // =====================================================================
  // ACTIONS
  // =====================================================================
  const promptInstall = React.useCallback(async (): Promise<boolean> => {
    const e = installEventRef.current
    if (!e) return false
    await e.prompt()
    const choice = await e.userChoice
    if (choice.outcome === 'accepted') {
      setCanInstall(false)
      installEventRef.current = null
      return true
    }
    return false
  }, [])

  const applyUpdate = React.useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    // Reload once the new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    }, { once: true })
  }, [registration])

  // Web Push subscription
  // NOTE: Replace with your VAPID public key (from Vercel env var in prod)
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

  const subscribePush = React.useCallback(async (): Promise<boolean> => {
    if (!registration || !pushSupported) return false
    if (!VAPID_PUBLIC_KEY) {
      console.warn('[PWA] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set — push subscriptions disabled')
      return false
    }
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      // Cast to BufferSource — TS lib mismatch between Uint8Array<ArrayBufferLike>
      // and the ArrayBufferView<ArrayBuffer> expected by PushManager.subscribe.
      const keyAsBufferSource = applicationServerKey as unknown as BufferSource

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyAsBufferSource,
      })

      // In production: POST sub to /api/push/subscribe to save in DB
      // await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(sub), headers: { 'Content-Type': 'application/json' } })

      setPushSubscribed(true)
      console.log('[PWA] Push subscribed:', sub.endpoint)
      return true
    } catch (err) {
      console.error('[PWA] Push subscription failed:', err)
      return false
    }
  }, [registration, pushSupported, VAPID_PUBLIC_KEY])

  const unsubscribePush = React.useCallback(async (): Promise<boolean> => {
    if (!registration) return false
    try {
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        // In production: POST to /api/push/unsubscribe
      }
      setPushSubscribed(false)
      return true
    } catch (err) {
      console.error('[PWA] Push unsubscribe failed:', err)
      return false
    }
  }, [registration])

  return {
    canInstall,
    installed,
    updateAvailable,
    applyUpdate,
    promptInstall,
    pushSupported,
    pushSubscribed,
    subscribePush,
    unsubscribePush,
  }
}

// =====================================================================
// HELPERS
// =====================================================================
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary')
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}
