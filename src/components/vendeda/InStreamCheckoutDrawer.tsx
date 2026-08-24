'use client'

import * as React from 'react'
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from '@/components/ui/drawer'
import { ShoppingBag, Truck, MapPin, Zap } from 'lucide-react'
import { formatPEN } from '@/lib/vendeda/format'

interface InStreamCheckoutDrawerProps {
  product: any
  sellerPhone?: string
}

export function InStreamCheckoutDrawer({ product, sellerPhone = '999999999' }: InStreamCheckoutDrawerProps) {
  // Simulate shipping logic
  const shippingCost = 10.00;
  const total = product.price + shippingCost;
  const yapeUrl = `yape://pay?amount=${total}&phone=${sellerPhone}`;
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="bg-[#FE2C55] text-foreground px-2 py-1.5 rounded-lg font-bold text-[10px] md:text-xs ml-auto shrink-0 flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform animate-pulse">
          <ShoppingBag className="w-3.5 h-3.5" /> Comprar
        </button>
      </DrawerTrigger>
      
      {/* Background is slightly transparent so video can be partially seen */}
      <DrawerContent className="bg-background/95 backdrop-blur-xl border-border px-4 pb-8 max-h-[85vh]">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4 mt-2" />
        <DrawerTitle className="sr-only">Comprar {product.title}</DrawerTitle>
        
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full overflow-y-auto">
          {/* Product Summary */}
          <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl border border-border">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border border-border">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground font-black text-sm md:text-base line-clamp-2">{product.title}</h3>
              <p className="text-[#FE2C55] font-bold mt-1 text-lg">{formatPEN(product.price)}</p>
            </div>
          </div>

          {/* 1-Click Shipping */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Envío Express (Auto-calculado)
            </h4>
            <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold text-sm">Av. Larco 123, Miraflores</p>
                <p className="text-muted-foreground text-xs mt-1">Shalom Courier - Llega mañana</p>
              </div>
              <p className="text-foreground font-black text-sm">+{formatPEN(shippingCost)}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total a pagar</h4>
            <div className="flex justify-between items-center text-xl">
              <span className="text-foreground font-bold">Total:</span>
              <span className="text-foreground font-black">{formatPEN(total)}</span>
            </div>
          </div>

          {/* Deep Link Payment Button */}
          <a
            href={yapeUrl}
            className="w-full bg-[#00E4CC] text-zinc-950 py-4 rounded-2xl font-black text-lg text-center flex items-center justify-center gap-2 hover:bg-[#00c9b4] transition-colors shadow-lg shadow-[#00E4CC]/20 active:scale-95"
          >
            <Zap className="w-5 h-5" /> Pagar con Yape
          </a>
          
          <p className="text-center text-xs text-muted-foreground">
            Al pagar aceptas los términos de Vende Ya. Tu pago está protegido.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  )
}