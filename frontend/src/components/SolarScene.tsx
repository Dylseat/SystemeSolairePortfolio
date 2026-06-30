import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import InfoPanel from './InfoPanel'
import Planet from './Planet'
import { planets, type PlanetData } from '../data/planets'

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="orange"
        emissive="orange"
        emissiveIntensity={1.5}
      />
    </mesh>
  )
}

function Orbit({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.01, 16, 120]} />
      <meshBasicMaterial color="#334155" />
    </mesh>
  )
}

type PlanetProps = PlanetData & {
  onClick: () => void
}

function SolarScene() {
    const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null)
    
  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 4, 10], fov: 60 }}>
        <color attach="background" args={['#020617']} />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={30} />

        <Stars
          radius={100}
          depth={50}
          count={4000}
          factor={4}
          fade
          speed={1}
        />

        <Sun />

        {planets.map((planet) => (
          <Orbit key={`orbit-${planet.label}`} radius={planet.orbitRadius} />
        ))}

        {planets.map((planet) => (
          <Planet
            key={planet.label}
            label={planet.label}
            color={planet.color}
            size={planet.size}
            orbitRadius={planet.orbitRadius}
            angle={planet.angle}
            speed={planet.speed}
            onClick={() => setSelectedPlanet(planet)}
            description={planet.description}
            items={planet.items}
          />
        ))}

        <OrbitControls />
      </Canvas>

      {selectedPlanet && (
        <InfoPanel
          title={selectedPlanet.label}
          description={selectedPlanet.description}
          items={selectedPlanet.items}
          onClose={() => setSelectedPlanet(null)}
        />
      )}
    </div>
  )
}

export default SolarScene