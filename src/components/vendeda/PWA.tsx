'use client'

/**
 * VENDE YA — PWA UI components
 * - InstallPrompt: shows a banner when the app is installable
 * - UpdateBanner: shows when a new SW version is available
 * - PushSubscribeButton: lets the user opt-in to push notifications
 */
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, RefreshCw, Bell, BellOff, Check, Share, PlusSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/use-pwa'
import { useToast } from '@/hooks/use-toast'

/** Install prompt banner — appears as a floating premium card on mobile. */
export function PWAInstallPrompt() {
  const { canInstall, installed, promptInstall } = usePWA()
  const [dismissed, setDismissed] = React.useState(true)
  const [isIOS, setIsIOS] = React.useState(false)
  const [showIOSModal, setShowIOSModal] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if dismissed recently (within 5 days)
    const lastDismissed = localStorage.getItem('vy_pwa_dismissed')
    if (lastDismissed) {
      const diff = Date.now() - parseInt(lastDismissed, 10)
      if (diff < 5 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true

    if (isIosDevice && !isStandalone) {
      setIsIOS(true)
      setDismissed(false)
    } else if (canInstall && !isStandalone) {
      setDismissed(false)
    }
  }, [canInstall])

  const handleDismiss = () => {
    setDismissed(true)
    setShowIOSModal(false)
    try {
      localStorage.setItem('vy_pwa_dismissed', Date.now().toString())
    } catch {}
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    const ok = await promptInstall()
    if (ok) {
      toast({ title: '🎉 ¡App instalada!', description: 'Ábrela desde tu pantalla de inicio para la mejor experiencia.' })
      setDismissed(true)
    }
  }

  if (installed || dismissed) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-50 max-w-sm rounded-2xl bg-card/95 border border-primary/30 p-3.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center p-1">
              <img src="/icon-192.png" alt="Vende Ya" className="h-full w-full object-contain rounded-lg" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-foreground truncate">Instala Vende Ya</p>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-primary/20 text-primary uppercase">
                  App
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                En tu pantalla de inicio. Rápida y a pantalla completa.
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-md shadow-primary/20 active:scale-95 transition-all"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 text-foreground shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Instalar en iPhone o iPad</h3>
                    <p className="text-[11px] text-muted-foreground">Solo toma 5 segundos</p>
                  </div>
                </div>
                <button onClick={() => setShowIOSModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs bg-muted/50 p-3.5 rounded-2xl border border-border/60">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px]">1</span>
                  <p className="text-muted-foreground">
                    Toca el botón <strong className="text-foreground inline-flex items-center gap-1">Compartir <Share className="w-3.5 h-3.5 inline text-sky-400" /></strong> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px]">2</span>
                  <p className="text-muted-foreground">
                    Desliza y pulsa <strong className="text-foreground inline-flex items-center gap-1">Agregar a inicio <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" /></strong>.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowIOSModal(false)}
                className="w-full rounded-xl bg-primary text-primary-foreground font-bold text-xs py-2"
              >
                ¡Entendido!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
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
