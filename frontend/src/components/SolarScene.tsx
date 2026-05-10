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

function Planet() {
  return (
    <group position={[3, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      <Text
        position={[0, 0.65, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Compétences
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
      <Planet />

      <OrbitControls />
    </Canvas>
  )
}

export default SolarScene