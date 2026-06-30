import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import type { Group } from 'three'
import type { PlanetData } from '../data/planets'

type PlanetProps = PlanetData & {
  onClick: () => void
}

function Planet({
  label,
  color,
  size,
  orbitRadius,
  angle,
  speed,
  onClick,

}: PlanetProps) {
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

export default Planet