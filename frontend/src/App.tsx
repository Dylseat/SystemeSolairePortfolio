import { lazy, Suspense } from 'react'
import LoadingScreen from './components/LoadingScreen'

// La scène 3D (Three.js) est chargée à part pour afficher la page tout de suite
const SolarScene = lazy(() => import('./components/SolarScene'))

function App() {
  return (
    <main className="h-screen w-screen bg-slate-950">
      <Suspense fallback={<LoadingScreen />}>
        <SolarScene />
      </Suspense>
    </main>
  )
}

export default App
