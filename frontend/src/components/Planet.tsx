import { useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, useCursor } from '@react-three/drei'
import type { Group } from 'three'
import type { PlanetData } from '../data/planets'

type PlanetProps = Pick<
  PlanetData,
  'id' | 'label' | 'color' | 'size' | 'orbitRadius' | 'angle' | 'speed'
> & {
  isSelected: boolean
  showLabel: boolean
  paused: boolean
  onClick: () => void
  // Décor qui accompagne la planète sur son orbite (par exemple l'aperçu du mini-jeu)
  children?: ReactNode
}

function Planet({
  id,
  label,
  color,
  size,
  orbitRadius,
  angle,
  speed,
  isSelected,
  showLabel,
  paused,
  onClick,
  children,
}: PlanetProps) {
  const planetGroupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const isHighlighted = hovered || isSelected

  useCursor(hovered)

  useFrame((_, delta) => {
    if (planetGroupRef.current && !paused) {
      planetGroupRef.current.rotation.y += speed * delta
    }
  })

  return (
    <group ref={planetGroupRef} rotation={[0, angle, 0]}>
      <group position={[orbitRadius, 0, 0]}>
        <mesh
          name={id}
          scale={isHighlighted ? 1.15 : 1}
          onClick={(event) => {
            event.stopPropagation()
            onClick()
          }}
          onPointerOver={(event) => {
            event.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHighlighted ? 0.5 : 0}
          />
        </mesh>

        <Billboard position={[0, size + 0.35, 0]} visible={showLabel}>
          <Text
            fontSize={isHighlighted ? 0.28 : 0.22}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        </Billboard>

        {children}
      </group>
    </group>
  )
}

export default Planet
