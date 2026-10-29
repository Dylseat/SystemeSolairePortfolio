type OrbitProps = {
  radius: number
}

function Orbit({ radius }: OrbitProps) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.01, 16, 120]} />
      <meshBasicMaterial color="#334155" />
    </mesh>
  )
}

export default Orbit