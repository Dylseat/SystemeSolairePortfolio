import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'

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

type PlanetProps = {
  label: string
  color: string
  size: number
  orbitRadius: number
  angle: number
}

function Planet({ label, color, size, orbitRadius, angle }: PlanetProps) {
  const x = Math.cos(angle) * orbitRadius
  const z = Math.sin(angle) * orbitRadius

  return (
    <group position={[x, 0, z]}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <Text
        position={[0, size + 0.35, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

const planets: PlanetProps[] = [
  {
    label: 'Compétences',
    color: '#3b82f6',
    size: 0.35,
    orbitRadius: 3,
    angle: 0,
  },
  {
    label: 'Expériences',
    color: '#22c55e',
    size: 0.45,
    orbitRadius: 4.5,
    angle: Math.PI,
  },
  {
    label: 'Formation',
    color: '#a855f7',
    size: 0.4,
    orbitRadius: 6,
    angle: Math.PI / 2,
  },
  {
    label: 'Mini-jeu',
    color: '#f97316',
    size: 0.55,
    orbitRadius: 7.5,
    angle: -Math.PI / 4,
  },
]

function SolarScene() {
  return (
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
        />
      ))}

      <OrbitControls />
    </Canvas>
  )
}

export default SolarScene