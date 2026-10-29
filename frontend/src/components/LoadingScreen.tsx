function LoadingScreen() {
  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-center justify-center gap-4 text-slate-300"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-400/30 border-t-orange-400" />
      <p className="text-sm">Chargement du système solaire…</p>
    </div>
  )
}

export default LoadingScreen
