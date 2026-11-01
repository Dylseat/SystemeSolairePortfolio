import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { Box3, Sphere, Vector3 } from 'three'

const OVERVIEW_POSITION = new Vector3(0, 4, 10)
const OVERVIEW_POSITION_SMALL_SCREEN = new Vector3(0, 9, 16)
const OVERVIEW_TARGET = new Vector3(0, 0, 0)
// Recul minimal pour les petits astres comme la Lune
const MIN_FOCUS_DISTANCE = 2.5

type CameraRigProps = {
  selectedId: string | null
  isSmallScreen: boolean
  reducedMotion: boolean
}

// Les astres sont retrouvés dans la scène grâce à leur `name`, égal à l'id de la section
function CameraRig({ selectedId, isSmallScreen, reducedMotion }: CameraRigProps) {
  const controlsRef = useRef<CameraControls>(null)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const animate = !reducedMotion
    const body = selectedId ? scene.getObjectByName(selectedId) : undefined

    if (!body) {
      const overviewPosition = isSmallScreen
        ? OVERVIEW_POSITION_SMALL_SCREEN
        : OVERVIEW_POSITION
      controls.setFocalOffset(0, 0, 0, animate)
      controls.setLookAt(
        ...overviewPosition.toArray(),
        ...OVERVIEW_TARGET.toArray(),
        animate,
      )
      return
    }

    const target = body.getWorldPosition(new Vector3())
    const radius = new Box3()
      .setFromObject(body)
      .getBoundingSphere(new Sphere()).radius
    // Sur mobile, le panneau ne laisse que le haut de l'écran : prendre plus de recul
    const distance = Math.max(radius * (isSmallScreen ? 10 : 6), MIN_FOCUS_DISTANCE)

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

    // Décaler l'astre pour qu'il ne soit pas caché par le panneau :
    // vers la gauche sur grand écran, vers le haut sur mobile (panneau en bas)
    if (isSmallScreen) {
      controls.setFocalOffset(0, radius * 3, 0, animate)
    } else {
      controls.setFocalOffset(radius * 1.5, 0, 0, animate)
    }
    controls.setLookAt(...position.toArray(), ...target.toArray(), animate)
  }, [scene, selectedId, isSmallScreen, reducedMotion])

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
