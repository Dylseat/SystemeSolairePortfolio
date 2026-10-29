import { useState } from 'react'
import { useCursor } from '@react-three/drei'

type SunProps = {
  name: string
  isSelected: boolean
  onClick: () => void
}

function Sun({ name, isSelected, onClick }: SunProps) {
  const [hovered, setHovered] = useState(false)

  useCursor(hovered)

  return (
    <mesh
      name={name}
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
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="orange"
        emissive="orange"
        emissiveIntensity={hovered || isSelected ? 2.2 : 1.5}
      />
    </mesh>
  )
}

export default Sun
