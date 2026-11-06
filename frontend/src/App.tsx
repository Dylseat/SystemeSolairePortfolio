import { lazy, Suspense, useEffect, useState } from 'react'
import { trackEvent } from './analytics'
import CvView from './components/CvView'
import LoadingScreen from './components/LoadingScreen'

// La scène 3D (Three.js) est chargée à part pour afficher la page tout de suite
const SolarScene = lazy(() => import('./components/SolarScene'))
// Le mini-jeu n'est chargé que si le visiteur clique sur « Jouer »
const GameOverlay = lazy(() => import('./game/GameOverlay'))

const CV_HASH = '#cv'

const hasWebGL = (() => {
  const canvas = document.createElement('canvas')
  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
})()

function App() {
  // `#cv` dans l'URL ouvre directement la vue texte (lien à envoyer à un recruteur)
  const [isTextView, setIsTextView] = useState(
    () => window.location.hash === CV_HASH,
  )
  const [isGameOpen, setIsGameOpen] = useState(false)

  const showTextView = (show: boolean) => {
    if (show) trackEvent('version-texte', 'Version texte : ouverte depuis le menu')
    setIsTextView(show)
    history.replaceState(null, '', show ? CV_HASH : window.location.pathname)
  }

  // Arrivée directe sur la version texte, par un lien envoyé avec #cv
  useEffect(() => {
    if (window.location.hash === CV_HASH) {
      trackEvent('version-texte/lien-cv', 'Version texte : arrivée par un lien #cv')
    }
  }, [])

  // Suivre aussi les changements de l'URL faits à la main ou par un lien
  useEffect(() => {
    const syncWithHash = () => setIsTextView(window.location.hash === CV_HASH)

    window.addEventListener('hashchange', syncWithHash)
    return () => window.removeEventListener('hashchange', syncWithHash)
  }, [])

  if (!hasWebGL) return <CvView />

  return (
    <main className="h-screen w-screen bg-slate-950">
      <div className="h-full w-full print:hidden">
        <Suspense fallback={<LoadingScreen />}>
          {/* Une seule scène 3D à la fois : le système solaire est retiré pendant la partie */}
          {isGameOpen ? (
            <GameOverlay onClose={() => setIsGameOpen(false)} />
          ) : (
            <SolarScene
              onOpenTextView={() => showTextView(true)}
              onPlayGame={() => setIsGameOpen(true)}
            />
          )}
        </Suspense>
      </div>

      {isTextView && <CvView onClose={() => showTextView(false)} />}
    </main>
  )
}

export default App
