import type { GameInput, GameState } from './engine'

const CRUISE_Y = 2
// Distance à laquelle un tir ennemi devient dangereux
const DANGER_ABOVE = 3
const DANGER_SIDE = 1

const clamp = (value: number) => Math.max(-1, Math.min(1, value))

// Pilote automatique de la démo : tire sans arrêt, se place sous l'ennemi le plus proche
// et s'écarte des tirs ennemis qui arrivent sur lui
export function autopilot(game: GameState): GameInput {
  const { player } = game

  const threat = game.enemyBullets.find(
    (bullet) =>
      bullet.y > player.y &&
      bullet.y - player.y < DANGER_ABOVE &&
      Math.abs(bullet.x - player.x) < DANGER_SIDE,
  )

  let dx: number
  if (threat) {
    dx = threat.x > player.x ? -1 : 1
  } else {
    const closest = [...game.enemies].sort((a, b) => a.y - b.y)[0]
    dx = closest ? clamp((closest.x - player.x) * 1.5) : clamp(-player.x)
  }

  const dy = Math.abs(CRUISE_Y - player.y) > 0.2 ? Math.sign(CRUISE_Y - player.y) : 0

  return { dx, dy, fire: true }
}
