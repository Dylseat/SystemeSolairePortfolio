import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { Group, InstancedMesh, Object3D, PerspectiveCamera, Vector3 } from 'three'
import { EXPLOSION_TIME, step, WORLD, type GameInput, type GameState } from './engine'

export type Hud = {
  score: number
  lives: number
  wave: number
  // Pause d'annonce entre deux vagues
  announcing: boolean
  over: boolean
}

type Game3DProps = {
  gameRef: RefObject<GameState>
  readInput: () => GameInput
  running: boolean
  onHud: (hud: Hud) => void
}

type Game3DCanvasProps = Game3DProps & {
  className?: string
  // Une seule image, sans animation (« réduire les animations »)
  still?: boolean
  // Distance minimale de la caméra : plus petite pour la démo, pour voir les modèles de plus près
  minDistance?: number
}

// Nombre maximal d'objets affichés en même temps, par type
const MAX_ENEMIES = 40
const MAX_BULLETS = 120
const MAX_EXPLOSIONS = 30

// Caméra derrière le vaisseau, inclinée vers le haut du terrain
const LOOK_AT = new Vector3(0, 6.5, 0)
const VIEW_DIRECTION = new Vector3(0, -13.5, 15).normalize()

function CameraFit({ minDistance }: { minDistance: number }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const aspect = size.width / size.height
    const halfFov = (camera.fov * Math.PI) / 360
    // Assez de recul pour voir toute la largeur du terrain, même dans une fenêtre étroite
    const needed = (WORLD.width / 2 + 2) / (Math.tan(halfFov) * aspect)
    const distance = Math.max(minDistance, needed)
    camera.position.copy(LOOK_AT).addScaledVector(VIEW_DIRECTION, distance)
    camera.lookAt(LOOK_AT)
    // Redessiner avec la nouvelle caméra, même quand la scène n'est pas animée
    invalidate()
  }, [camera, size, invalidate, minDistance])

  return null
}

function updateInstances<T>(
  mesh: InstancedMesh | null,
  items: T[],
  dummy: Object3D,
  place: (item: T, dummy: Object3D) => void,
) {
  if (!mesh) return
  const count = Math.min(items.length, mesh.instanceMatrix.count)
  for (let i = 0; i < count; i++) {
    dummy.position.set(0, 0, 0)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.setScalar(1)
    place(items[i], dummy)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.count = count
  mesh.instanceMatrix.needsUpdate = true
}

function GameWorld({
  gameRef,
  readInput,
  running,
  onHud,
  minDistance,
}: Game3DProps & { minDistance: number }) {
  const player = useRef<Group>(null)
  const drones = useRef<InstancedMesh>(null)
  const zigzags = useRef<InstancedMesh>(null)
  const shooters = useRef<InstancedMesh>(null)
  const bullets = useRef<InstancedMesh>(null)
  const enemyBullets = useRef<InstancedMesh>(null)
  const explosions = useRef<InstancedMesh>(null)
  const lastHud = useRef('')
  const dummy = useMemo(() => new Object3D(), [])

  useFrame(({ clock }, delta) => {
    const game = gameRef.current
    if (running) step(game, readInput(), delta)
    const time = clock.elapsedTime

    if (player.current) {
      player.current.position.set(game.player.x, game.player.y, 0)
      // Clignote pendant l'invulnérabilité qui suit un choc
      const blinking = game.player.invulnerable > 0 && Math.floor(time * 12) % 2 === 0
      player.current.visible = !game.over && !blinking
      player.current.rotation.y = Math.sin(time * 2) * 0.15
    }

    const ofKind = (kind: string) => game.enemies.filter((enemy) => enemy.kind === kind)
    updateInstances(drones.current, ofKind('drone'), dummy, (enemy, d) => {
      d.position.set(enemy.x, enemy.y, 0)
      d.rotation.set(enemy.age * 2, enemy.age * 3, 0)
    })
    updateInstances(zigzags.current, ofKind('zigzag'), dummy, (enemy, d) => {
      d.position.set(enemy.x, enemy.y, 0)
      d.rotation.set(Math.PI / 2, enemy.age * 4, 0)
    })
    updateInstances(shooters.current, ofKind('tireur'), dummy, (enemy, d) => {
      d.position.set(enemy.x, enemy.y, 0)
      d.rotation.set(enemy.age, enemy.age * 1.5, 0)
      // Plus petit quand il ne lui reste qu'un point de vie
      d.scale.setScalar(enemy.hp === 1 ? 0.8 : 1)
    })
    updateInstances(bullets.current, game.bullets, dummy, (bullet, d) => {
      d.position.set(bullet.x, bullet.y, 0)
      d.scale.set(1, 2.5, 1)
    })
    updateInstances(enemyBullets.current, game.enemyBullets, dummy, (bullet, d) => {
      d.position.set(bullet.x, bullet.y, 0)
    })
    updateInstances(explosions.current, game.explosions, dummy, (explosion, d) => {
      d.position.set(explosion.x, explosion.y, 0)
      d.scale.setScalar(0.3 + (explosion.age / EXPLOSION_TIME) * 1.4)
    })

    // Le score et les vies ne sont envoyés à l'interface que lorsqu'ils changent
    const hud: Hud = {
      score: game.score,
      lives: game.lives,
      wave: game.wave,
      announcing: game.wavePause > 0,
      over: game.over,
    }
    const key = JSON.stringify(hud)
    if (key !== lastHud.current) {
      lastHud.current = key
      onHud(hud)
    }
  })

  return (
    <>
      <CameraFit minDistance={minDistance} />
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, -6, 10]} intensity={1.6} />
      <Stars radius={60} depth={30} count={1500} factor={3} fade speed={1} />
      <gridHelper
        args={[16, 16, '#1e293b', '#0f172a']}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, WORLD.height / 2, -0.6]}
      />

      <group ref={player}>
        <mesh>
          <coneGeometry args={[0.35, 1.1, 12]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[1.1, 0.25, 0.15]} />
          <meshStandardMaterial color="#67e8f9" emissive="#0e7490" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.65, 0]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshBasicMaterial color="#fb923c" />
        </mesh>
      </group>

      <instancedMesh ref={drones} args={[undefined, undefined, MAX_ENEMIES]} frustumCulled={false}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#f43f5e" emissive="#9f1239" emissiveIntensity={0.6} flatShading />
      </instancedMesh>
      <instancedMesh ref={zigzags} args={[undefined, undefined, MAX_ENEMIES]} frustumCulled={false}>
        <torusGeometry args={[0.35, 0.13, 10, 24]} />
        <meshStandardMaterial color="#a855f7" emissive="#6b21a8" emissiveIntensity={0.6} />
      </instancedMesh>
      <instancedMesh ref={shooters} args={[undefined, undefined, MAX_ENEMIES]} frustumCulled={false}>
        <icosahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.6} flatShading />
      </instancedMesh>
      <instancedMesh ref={bullets} args={[undefined, undefined, MAX_BULLETS]} frustumCulled={false}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#a5f3fc" />
      </instancedMesh>
      <instancedMesh ref={enemyBullets} args={[undefined, undefined, MAX_BULLETS]} frustumCulled={false}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshBasicMaterial color="#fb7185" />
      </instancedMesh>
      <instancedMesh ref={explosions} args={[undefined, undefined, MAX_EXPLOSIONS]} frustumCulled={false}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial color="#fdba74" transparent opacity={0.55} depthWrite={false} />
      </instancedMesh>
    </>
  )
}

function Game3D({
  className = 'absolute inset-0',
  still = false,
  minDistance = 20,
  ...props
}: Game3DCanvasProps) {
  return (
    <Canvas
      className={className}
      camera={{ fov: 50 }}
      dpr={[1, 2]}
      frameloop={still ? 'demand' : 'always'}
    >
      <GameWorld {...props} minDistance={minDistance} />
    </Canvas>
  )
}

export default Game3D
