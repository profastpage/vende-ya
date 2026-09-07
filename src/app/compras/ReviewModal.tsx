'use client'

import * as React from 'react'
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react'
import { submitReview } from './actions'
import { toast } from 'sonner'

interface ReviewModalProps {
  orderId: string;
  sellerId: string;
  sellerName: string;
  productTitle: string;
  existingReview?: {
    rating: number;
    comment?: string | null;
  } | null;
}

export function ReviewModal({
  orderId,
  sellerId,
  sellerName,
  productTitle,
  existingReview,
}: ReviewModalProps) {
  const [open, setOpen] = React.useState(false)
  const [rating, setRating] = React.useState(existingReview?.rating || 5)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [comment, setComment] = React.useState(existingReview?.comment || '')
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(Boolean(existingReview))

  if (submitted) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Calificado ({rating}/5)
      </span>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await submitReview({
        orderId,
        sellerId,
        rating,
        comment,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('¡Gracias por tu calificación!')
        setSubmitted(true)
        setOpen(false)
      }
    } catch (err: any) {
      toast.error('Error al enviar calificación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-bold text-xs transition-colors"
      >
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span>Calificar Vendedor</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-black text-foreground">Califica tu compra</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {productTitle} • Vendedor: @{sellerName}
              </p>
            </div>

            {/* Star selector */}
            <div className="flex items-center justify-center gap-2 py-3 border-y border-border/50">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-center text-xs font-semibold text-amber-400">
              {rating === 5 && '¡Excelente experiencia! 🌟'}
              {rating === 4 && 'Muy buena compra 👍'}
              {rating === 3 && 'Buena / Aceptable 👌'}
              {rating === 2 && 'Regular 😕'}
              {rating === 1 && 'Mala experiencia 👎'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Comentario (opcional)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="¿Cómo fue la entrega por Shalom/Olva? ¿El producto llegó en buen estado?"
                  className="w-full rounded-xl bg-muted border border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-bold text-xs shadow-lg shadow-fuchsia-500/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enviar Calificación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}