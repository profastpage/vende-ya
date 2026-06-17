'use client'

import * as React from 'react'
import { Plus, Radio, Video, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/vendeda/routes'

export function QuickAuctionFab() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-30 flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Link href={`${ROUTES.vender}?mode=live`}>
                <Button
                  variant="outline"
                  className="bg-card shadow-lift rounded-full pl-4 pr-5 h-12 gap-2"
                  onClick={() => setOpen(false)}
                >
                  <Video className="h-4 w-4 text-salsa-500" />
                  <span className="text-sm font-medium">Subastar en vivo</span>
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15, delay: 0.05 }}
            >
              <Link href={`${ROUTES.vender}?mode=ai`}>
                <Button
                  variant="outline"
                  className="bg-card shadow-lift rounded-full pl-4 pr-5 h-12 gap-2"
                  onClick={() => setOpen(false)}
                >
                  <Sparkles className="h-4 w-4 text-lima-500" />
                  <span className="text-sm font-medium">Extraer con IA</span>
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15, delay: 0.1 }}
            >
              <Link href={`${ROUTES.vender}?mode=quick`}>
                <Button
                  variant="outline"
                  className="bg-card shadow-lift rounded-full pl-4 pr-5 h-12 gap-2"
                  onClick={() => setOpen(false)}
                >
                  <Radio className="h-4 w-4 text-plin-500" />
                  <span className="text-sm font-medium">Subasta rápida</span>
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'h-14 w-14 rounded-full shadow-glow-salsa flex items-center justify-center text-white',
          'bg-salsa-500 hover:bg-salsa-600 transition-colors'
        )}
        aria-label={open ? 'Cerrar menú' : 'Crear subasta'}
        aria-expanded={open}
      >
        <motion.div animate={{ rotate: open ? 135 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </div>
  )
}
