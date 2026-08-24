export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-black tracking-widest uppercase text-sm animate-pulse">Cargando...</p>
      </div>
    </div>
  )
}
