import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import {
  BLAST_TIME,
  enemyPosition,
  nextTarget,
  RESPAWN_TIME,
  SHOT_COOLDOWN,
  SHOT_TIME,
  shipPosition,
  shotIsClear,
  shotPosition,
} from './orbitBattleLogic'

type OrbitBattleProps = {
  // Rayon de la planète autour de laquelle se passe la bataille
  size: number
  paused: boolean
}

// Aperçu du mini-jeu dans la scène : un petit vaisseau tourne autour de la planète
// et tire sur des ennemis aux couleurs du jeu, qui explosent puis réapparaissent
function OrbitBattle({ size, paused }: OrbitBattleProps) {
  const ship = useRef<Group>(null)
  const enemies = useRef<(Mesh | null)[]>([])
  const shot = useRef<Mesh>(null)
  const blast = useRef<Mesh>(null)
  const battle = useRef({
    time: 0,
    target: 0,
    cooldown: SHOT_COOLDOWN,
    shotAge: -1,
    blastAge: -1,
    respawn: [0, 0, 0],
    launchTime: 0,
  })

  useFrame((_, delta) => {
    const state = battle.current
    if (!paused) state.time += delta
    const step = paused ? 0 : delta

    if (ship.current) {
      shipPosition(state.time, size, ship.current.position)
      // Toujours orienté dans le sens de sa trajectoire
      ship.current.rotation.y = -state.time * 1.3
    }

    enemies.current.forEach((enemy, index) => {
      if (!enemy) return
      state.respawn[index] = Math.max(0, state.respawn[index] - step)
      enemy.visible = state.respawn[index] === 0
      enemyPosition(index, state.time, size, enemy.position)
      enemy.rotation.set(state.time * 2, state.time * 3, 0)
    })

    // Un tir à la fois, vers le prochain ennemi encore là et pas caché par la planète.
    // Si aucun n'est atteignable, le vaisseau attend d'avoir un angle de tir dégagé.
    state.cooldown -= step
    if (state.shotAge < 0 && state.cooldown <= 0) {
      const target = nextTarget(state.target, state.respawn, (index) =>
        shotIsClear(index, state.time, size),
      )
      if (target !== null) {
        state.target = target
        state.shotAge = 0
        state.launchTime = state.time
      }
    }

    if (shot.current) {
      shot.current.visible = state.shotAge >= 0
      if (state.shotAge >= 0) {
        state.shotAge = state.time - state.launchTime
        shotPosition(state.target, state.launchTime, state.shotAge, size, shot.current.position)
        if (state.shotAge >= SHOT_TIME) {
          state.respawn[state.target] = RESPAWN_TIME
          state.shotAge = -1
          state.cooldown = SHOT_COOLDOWN
          state.blastAge = 0
          blast.current?.position.copy(shot.current.position)
        }
      }
    }

    if (blast.current) {
      blast.current.visible = state.blastAge >= 0
      if (state.blastAge >= 0) {
        state.blastAge += step
        blast.current.scale.setScalar(0.4 + (state.blastAge / BLAST_TIME) * 1.2)
        if (state.blastAge >= BLAST_TIME) state.blastAge = -1
      }
    }
  })

  return (
    // Légère inclinaison pour voir la bataille en relief depuis la vue d'ensemble
    <group rotation={[0.35, 0, 0.2]}>
      <group ref={ship}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.05, 0.16, 8]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.8} />
        </mesh>
      </group>

      <mesh ref={(mesh) => void (enemies.current[0] = mesh)}>
        <octahedronGeometry args={[0.07]} />
        <meshStandardMaterial color="#f43f5e" emissive="#9f1239" emissiveIntensity={0.8} flatShading />
      </mesh>
      <mesh ref={(mesh) => void (enemies.current[1] = mesh)}>
        <torusGeometry args={[0.05, 0.02, 8, 16]} />
        <meshStandardMaterial color="#a855f7" emissive="#6b21a8" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={(mesh) => void (enemies.current[2] = mesh)}>
        <icosahedronGeometry args={[0.08]} />
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.8} flatShading />
      </mesh>

      <mesh ref={shot} visible={false}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial color="#a5f3fc" />
      </mesh>
      <mesh ref={blast} visible={false}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshBasicMaterial color="#fdba74" transparent opacity={0.7} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default OrbitBattle
