function StartHint() {
  return (
    <p className="pointer-events-none absolute bottom-8 left-1/2 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-black/60 px-5 py-2 text-center text-sm text-slate-200 backdrop-blur motion-safe:animate-pulse">
      <span className="pointer-coarse:hidden">Clique</span>
      <span className="hidden pointer-coarse:inline">Touche</span> une planète ou
      choisis une section dans le menu
    </p>
  )
}

export default StartHint
