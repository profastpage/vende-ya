'use client'

/**
 * VENDE YA — PWA UI components
 * - InstallPrompt: shows a banner when the app is installable
 * - UpdateBanner: shows when a new SW version is available
 * - PushSubscribeButton: lets the user opt-in to push notifications
 */
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, RefreshCw, Bell, BellOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/use-pwa'
import { useToast } from '@/hooks/use-toast'

/** Install prompt banner — appears at the top of the page on mobile. */
export function PWAInstallPrompt() {
  const { canInstall, installed, promptInstall } = usePWA()
  const [dismissed, setDismissed] = React.useState(false)
  const { toast } = useToast()

  const handleInstall = async () => {
    const ok = await promptInstall()
    if (ok) {
      toast({ title: '🎉 App instalada', description: 'Ábrela desde tu pantalla de inicio.' })
    }
  }

  if (installed || !canInstall || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 m-3 rounded-xl bg-salsa-500 text-white p-3 shadow-lift flex items-center gap-3 max-w-md mx-auto"
      >
        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Instala Vende Ya</p>
          <p className="text-xs text-white/80">Acceso rápido, notificaciones push y modo offline</p>
        </div>
        <Button
          size="sm"
          onClick={handleInstall}
          className="bg-white text-salsa-700 hover:bg-white/90 shrink-0"
        >
          Instalar
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white shrink-0 p-1"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

/** Update banner — appears when a new SW version is available. */
export function PWAUpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWA()
  if (!updateAvailable) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 md:bottom-6 left-0 right-0 z-50 m-3 rounded-xl bg-tambo text-white p-3 shadow-lift flex items-center gap-3 max-w-md mx-auto"
    >
      <RefreshCw className="h-5 w-5 shrink-0 text-lima-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Nueva versión disponible</p>
        <p className="text-xs text-white/70">Recarga para obtener las últimas mejoras</p>
      </div>
      <Button size="sm" onClick={applyUpdate} className="bg-lima-500 hover:bg-lima-600 text-white shrink-0">
        Actualizar
      </Button>
    </motion.div>
  )
}

/** Push notification subscribe/unsubscribe button. */
export function PushSubscribeButton({ className }: { className?: string }) {
  const { pushSupported, pushSubscribed, subscribePush, unsubscribePush } = usePWA()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  if (!pushSupported) return null

  const handleClick = async () => {
    setLoading(true)
    if (pushSubscribed) {
      const ok = await unsubscribePush()
      if (ok) toast({ title: '🔕 Notificaciones desactivadas' })
    } else {
      const ok = await subscribePush()
      if (ok) {
        toast({ title: '🔔 Notificaciones activadas', description: 'Te avisaremos de subastas y mensajes.' })
      } else {
        toast({ title: '⚠️ No se pudo activar', description: 'Revisa los permisos del navegador.', variant: 'destructive' })
      }
    }
    setLoading(false)
  }

  return (
    <Button
      variant={pushSubscribed ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : pushSubscribed ? (
        <Check className="h-4 w-4 mr-2 text-lima-500" />
      ) : (
        <Bell className="h-4 w-4 mr-2" />
      )}
      {pushSubscribed ? 'Notificaciones ON' : 'Activar notificaciones'}
    </Button>
  )
}
