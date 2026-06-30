import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, OrbitControls, Stars, Text } from '@react-three/drei'
import type { Group } from 'three'

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

type PlanetData = {
  label: string
  color: string
  size: number
  orbitRadius: number
  angle: number
  speed: number
}

type PlanetProps = PlanetData & {
  onClick: () => void
}

function Planet({ label, color, size, orbitRadius, angle, speed, onClick }: PlanetProps) {
  const planetGroupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (planetGroupRef.current) {
      planetGroupRef.current.rotation.y += speed * delta
    }
  })

  return (
    <group ref={planetGroupRef} rotation={[0, angle, 0]}>
      <group position={[orbitRadius, 0, 0]}>
        <mesh onClick={onClick}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>

        <Billboard position={[0, size + 0.35, 0]}>
          <Text
            fontSize={0.22}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        </Billboard>
      </group>
    </group>
  )
}

const planets: PlanetData[] = [
  {
    label: 'Compétences',
    color: '#3b82f6',
    size: 0.35,
    orbitRadius: 3,
    angle: 0,
    speed: 0.5,
  },
  {
    label: 'Expériences',
    color: '#22c55e',
    size: 0.45,
    orbitRadius: 4.5,
    angle: Math.PI,
    speed: 0.3,
  },
  {
    label: 'Formation',
    color: '#a855f7',
    size: 0.4,
    orbitRadius: 6,
    angle: Math.PI / 2,
    speed: 0.2,
  },
  {
    label: 'Mini-jeu',
    color: '#f97316',
    size: 0.55,
    orbitRadius: 7.5,
    angle: -Math.PI / 4,
    speed: 0.15,
  },
]

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
          />
        ))}

        <OrbitControls />
      </Canvas>

      {selectedPlanet && (
        <div className="absolute right-6 top-6 w-80 rounded-2xl bg-black/70 p-5 text-white backdrop-blur">
          <h2 className="text-2xl font-bold">{selectedPlanet.label}</h2>

          <p className="mt-3 text-sm text-slate-300">
            Contenu de la section : {selectedPlanet.label}
          </p>

          <button
            className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
            onClick={() => setSelectedPlanet(null)}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  )
}

export default SolarScene