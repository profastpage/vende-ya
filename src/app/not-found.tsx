import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <AlertCircle className="w-16 h-16 text-amber-500 mb-6" />
      <h2 className="text-3xl font-black mb-2 text-center">Página no encontrada</h2>
      <p className="text-zinc-400 mb-8 text-center max-w-md">
        Lo sentimos, no pudimos encontrar el enlace o la transmisión a la que intentas acceder. 
        Puede que haya finalizado o la URL sea incorrecta.
      </p>
      <Link 
        href="/"
        className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-bold transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  )
}