import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import CameraRig from './CameraRig'
import InfoPanel from './InfoPanel'
import Orbit from './Orbit'
import Planet from './Planet'
import SectionMenu from './SectionMenu'
import StartHint from './StartHint'
import Sun from './Sun'
import { planets, sections, sunData } from '../data/planets'
import { useIsSmallScreen, usePrefersReducedMotion } from '../hooks/useMediaQuery'

type SolarSceneProps = {
  onOpenTextView: () => void
}

function SolarScene({ onOpenTextView }: SolarSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hasSelected, setHasSelected] = useState(false)
  const isSmallScreen = useIsSmallScreen()
  const reducedMotion = usePrefersReducedMotion()

  const selectedSection = sections.find((section) => section.id === selectedId)

  const select = (id: string) => {
    setSelectedId(id)
    setHasSelected(true)
  }

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: isSmallScreen ? [0, 9, 16] : [0, 4, 10], fov: 60 }}
        dpr={isSmallScreen ? [1, 1.5] : [1, 2]}
      >
        <color attach="background" args={['#020617']} />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={30} />

        <Stars
          radius={100}
          depth={50}
          count={isSmallScreen ? 1500 : 4000}
          factor={4}
          fade
          speed={reducedMotion ? 0 : 1}
        />

        <Sun
          name={sunData.id}
          isSelected={selectedId === sunData.id}
          onClick={() => select(sunData.id)}
        />

        {planets.map((planet) => (
          <Orbit key={`orbit-${planet.id}`} radius={planet.orbitRadius} />
        ))}

        {/* Les noms des planètes chargent une police : ce Suspense évite
            que ce chargement ne remonte hors du Canvas et ne réinitialise WebGL */}
        <Suspense fallback={null}>
          {planets.map((planet) => (
            <Planet
              key={planet.id}
              id={planet.id}
              label={planet.label}
              color={planet.color}
              size={planet.size}
              orbitRadius={planet.orbitRadius}
              angle={planet.angle}
              speed={planet.speed}
              isSelected={selectedId === planet.id}
              paused={selectedId !== null || reducedMotion}
              onClick={() => select(planet.id)}
            />
          ))}
        </Suspense>

        <CameraRig
          selectedId={selectedId}
          isSmallScreen={isSmallScreen}
          reducedMotion={reducedMotion}
        />
      </Canvas>

      <SectionMenu
        sections={sections}
        selectedId={selectedId}
        onSelect={select}
        onOpenTextView={onOpenTextView}
      />

      {!hasSelected && <StartHint />}

      {selectedSection && (
        <InfoPanel
          title={selectedSection.label}
          description={selectedSection.description}
          items={selectedSection.items}
          imageUrl={selectedSection.imageUrl}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

export default SolarScene
