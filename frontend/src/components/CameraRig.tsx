import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { Box3, Sphere, Vector3 } from 'three'

const OVERVIEW_POSITION = new Vector3(0, 4, 10)
const OVERVIEW_TARGET = new Vector3(0, 0, 0)

type CameraRigProps = {
  selectedId: string | null
}

// Les astres sont retrouvés dans la scène grâce à leur `name`, égal à l'id de la section
function CameraRig({ selectedId }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const body = selectedId ? scene.getObjectByName(selectedId) : undefined

    if (!body) {
      controls.setFocalOffset(0, 0, 0, true)
      controls.setLookAt(
        ...OVERVIEW_POSITION.toArray(),
        ...OVERVIEW_TARGET.toArray(),
        true,
      )
      return
    }

    const target = body.getWorldPosition(new Vector3())
    const radius = new Box3()
      .setFromObject(body)
      .getBoundingSphere(new Sphere()).radius
    const distance = radius * 6

    // Se placer sur le côté de la planète, un peu vers le Soleil, pour voir
    // sa face éclairée sans que le Soleil ne bouche la vue
    const towardSun =
      target.lengthSq() > 0
        ? target.clone().normalize().negate()
        : new Vector3(0, 0, 1)
    const sideways = new Vector3(0, 1, 0).cross(towardSun)
    const position = target
      .clone()
      .addScaledVector(sideways, distance * 0.9)
      .addScaledVector(towardSun, distance * 0.4)
      .add(new Vector3(0, distance * 0.3, 0))

    // Décaler l'astre vers la gauche pour qu'il ne soit pas caché par le panneau
    const isWideScreen = window.innerWidth >= 768
    controls.setFocalOffset(isWideScreen ? radius * 1.5 : 0, 0, 0, true)
    controls.setLookAt(...position.toArray(), ...target.toArray(), true)
  }, [scene, selectedId])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={1.5}
      maxDistance={30}
      smoothTime={0.6}
    />
  )
}

export default CameraRig
