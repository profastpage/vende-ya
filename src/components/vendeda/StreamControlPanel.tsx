'use client'

import * as React from 'react'
import { Plus, Package, MessageSquare, Video, ShieldAlert } from 'lucide-react'
import { createExpressProduct, endStream } from '@/app/studio/actions'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'

export function StreamControlPanel({ stream }: { stream: any }) {
  const [loading, setLoading] = React.useState(false)
  const [chat, setChat] = React.useState<{id: string, user: string, text: string}[]>([])

  const supabase = React.useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  React.useEffect(() => {
    const channel = supabase.channel(`chat_${stream.id}`)
    
    channel.on('broadcast', { event: 'new_message' }, (payload) => {
      setChat(prev => [...prev, { id: payload.payload.id, user: payload.payload.username, text: payload.payload.text }].slice(-20))
    })

    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [stream.id, supabase])

  const handleExpressLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const title = formData.get('title') as string
    const price = Number(formData.get('price'))
    const isAuction = formData.get('type') === 'auction'

    setLoading(true)
    const res = await createExpressProduct(stream.id, stream.sellerId, title, price, isAuction)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(isAuction ? "Subasta Express Iniciada" : "Producto Express Publicado")
      // Broadcast to viewers to refresh their screen!
      supabase.channel(`chat_${stream.id}`).send({
        type: 'broadcast',
        event: 'new_product',
        payload: { productId: res.product?.id }
      });
      (e.target as HTMLFormElement).reset()
    }
  }

  const handleEndStream = async () => {
    if(!confirm('¿Seguro que deseas finalizar el en vivo? Ya no aparecerás en la página principal.')) return;
    setLoading(true);
    const res = await endStream(stream.id);
    if(res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success('Transmisión finalizada correctamente');
      window.location.href = '/mi-dashboard';
    }
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-zinc-950 text-foreground overflow-hidden">
      
      {/* Left Col: Stream Preview & Chat */}
      <div className="flex-1 flex flex-col h-full border-r border-white/10">
        
        {/* Preview Player */}
        <div className="relative aspect-video bg-black flex-shrink-0">
          <div className="absolute top-4 left-4 z-10 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase flex items-center gap-2 animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span> EN VIVO
          </div>
          {stream.streamProvider === 'YOUTUBE' ? (
            <iframe
              src={`https://www.youtube.com/embed/${stream.streamProviderId}?autoplay=1&mute=1&controls=0`}
              className="w-full h-full pointer-events-none"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <Video className="w-12 h-12 mb-2" />
            </div>
          )}
        </div>

        {/* Chat Monitor */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-900/50">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Monitor de Chat
          </h3>
          {chat.length === 0 && <p className="text-sm text-zinc-500">Esperando mensajes...</p>}
          {chat.map(msg => (
            <div key={msg.id} className="text-sm">
              <span className="font-bold text-lime-400">{msg.user}: </span>
              <span className="text-zinc-300">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Col: Control Panel */}
      <div className="w-full md:w-[400px] flex-shrink-0 bg-zinc-950 flex flex-col h-full overflow-y-auto p-6">
        <h2 className="text-xl font-black text-white mb-6">Panel de Control</h2>
        
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-vendeda-primary" /> Lanzar Producto Express
          </h3>
          <form onSubmit={handleExpressLaunch} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Qué vas a vender?</label>
              <input name="title" required placeholder="Ej: Polo Adidas Original" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-vendeda-primary outline-none transition-colors" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Precio (S/)</label>
              <input name="price" type="number" step="0.1" required placeholder="0.00" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-vendeda-primary outline-none transition-colors font-mono" />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Modo de Venta</label>
              <select name="type" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-vendeda-primary outline-none transition-colors appearance-none">
                <option value="direct">Venta Directa (Stock 1)</option>
                <option value="auction">Subasta Relámpago (3 Minutos)</option>
              </select>
            </div>

            <button disabled={loading} className="w-full bg-vendeda-primary text-black font-black py-4 rounded-xl hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,191,0,0.3)]">
              {loading ? "Lanzando..." : <><Plus className="w-5 h-5" /> Lanzar a Pantalla</>}
            </button>
          </form>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-rose-400 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Finalizar Transmisión
          </h3>
          <p className="text-xs text-rose-400/70 mb-4">
            Al terminar tu en vivo en YouTube/PRISM, debes finalizarlo aquí para guardarlo en tu historial.
          </p>
          <button onClick={handleEndStream} disabled={loading} className="w-full bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl hover:bg-rose-500/30 transition-colors text-sm disabled:opacity-50">
            {loading ? 'Finalizando...' : 'Finalizar En Vivo'}
          </button>
        </div>
      </div>
    </div>
  )
}