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
  position: [number, number, number]
  color: string
  size: number
}

function Planet({ label, position, color, size }: PlanetProps) {
  return (
    <group position={position}>
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

      <Orbit radius={3} />
      <Orbit radius={4.5} />
      <Orbit radius={6} />
      <Orbit radius={7.5} />

      <Planet
        label="Compétences"
        position={[3, 0, 0]}
        color="#3b82f6"
        size={0.35}
      />

      <Planet
        label="Expériences"
        position={[-4.5, 0, 0]}
        color="#22c55e"
        size={0.45}
      />

      <Planet
        label="Formation"
        position={[0, 0, -6]}
        color="#a855f7"
        size={0.4}
      />

      <Planet
        label="Mini-jeu"
        position={[7.5, 0, 0]}
        color="#f97316"
        size={0.55}
      />

      <OrbitControls />
    </Canvas>
  )
}

export default SolarScene