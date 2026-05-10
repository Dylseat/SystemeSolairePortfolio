import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

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

      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="orange"
          emissive="orange"
          emissiveIntensity={1.5}
        />
      </mesh>

      <OrbitControls />
    </Canvas>
  )
}

export default SolarScene