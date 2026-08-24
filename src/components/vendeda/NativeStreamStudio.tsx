'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Camera, Radio, Plus, Settings, VideoOff, MicOff, X } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function NativeStreamStudio() {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isLive, setIsLive] = React.useState(false)
  const [stream, setStream] = React.useState<MediaStream | null>(null)

  // Start Camera
  React.useEffect(() => {
    async function setupCamera() {
      try {
        const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
        setStream(ms)
        if (videoRef.current) {
          videoRef.current.srcObject = ms
        }
      } catch (err) {
        console.error("Camera access denied", err)
      }
    }
    setupCamera()
    
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col">
      {/* Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-gradient-to-b from-black/60 via-transparent to-black/80">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center pt-safe">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full" /> EN VIVO
              </span>
            ) : (
              <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-xs font-bold">
                CÁMARA LISTA
              </span>
            )}
            {isLive && <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-lg text-xs font-bold">👁 0</span>}
          </div>
          <button className="w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="pb-safe mb-4 flex flex-col gap-4">
          
          {/* Fast-Add Product Drawer */}
          {isLive && (
            <Drawer>
              <DrawerTrigger asChild>
                <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors">
                  <Plus className="w-5 h-5" /> Lanzar Producto Express
                </button>
              </DrawerTrigger>
              <DrawerContent className="bg-background/95 backdrop-blur-xl border-border px-4 pb-8">
                <DrawerTitle className="text-foreground font-black text-lg mt-4 mb-2">Producto Express</DrawerTitle>
                <p className="text-muted-foreground text-xs mb-4">Crea un producto en 10 segundos para venderlo ahora mismo.</p>
                
                <div className="space-y-4">
                  <div className="w-full h-32 bg-muted rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-bold">Tomar Foto (Opcional)</span>
                  </div>
                  
                  <Input placeholder="Nombre del producto (ej: Audífonos Sony)" className="h-12 bg-muted" />
                  
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">S/</span>
                    <Input type="number" placeholder="0.00" className="h-12 bg-muted pl-10 font-bold text-lg" />
                  </div>

                  <Button className="w-full h-12 bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black text-lg">
                    Publicar en Pantalla
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          )}

          {/* Broadcast Button */}
          <div className="flex justify-center items-center gap-4">
            <button className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
              <MicOff className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsLive(!isLive)}
              className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${isLive ? 'border-rose-500 bg-rose-500/20' : 'border-white bg-white/20'}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${isLive ? 'bg-rose-500' : 'bg-white'}`}>
                {isLive ? <span className="w-5 h-5 bg-white rounded-sm" /> : <Radio className="w-6 h-6 text-black" />}
              </div>
            </button>
            
            <button className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}