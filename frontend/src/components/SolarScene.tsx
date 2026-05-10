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
      <torusGeometry args={[radius, 0.01, 16, 100]} />
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
        position={[0, size + 0.3, 0]}
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
    <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
      <color attach="background" args={['#020617']} />

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={20} />

      <Stars
        radius={80}
        depth={50}
        count={3000}
        factor={4}
        fade
        speed={1}
      />

      <Sun />
      <Orbit radius={3} />
      <Planet
        label="Compétences"
        position={[3, 0, 0]}
        color="#3b82f6"
        size={0.35}
      />

      <OrbitControls />
    </Canvas>
  )
}

export default SolarScene