// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { autopilot } from './autopilot'
import { createGame, step, type Enemy } from './engine'

const enemyAt = (x: number, y: number): Enemy => ({
  id: 1, kind: 'drone', x, y, baseX: x, age: 0, hp: 1, speed: 0, stopY: 0, fireTimer: 99,
})

describe('pilote automatique de la démo', () => {
  it('tire sans arrêt', () => {
    expect(autopilot(createGame(1)).fire).toBe(true)
  })

  it('se place sous l’ennemi le plus proche', () => {
    const game = createGame(1)
    game.enemies.push(enemyAt(4, 12), enemyAt(-3, 8))
    expect(autopilot(game).dx).toBeLessThan(0)
  })

  it('s’écarte d’un tir ennemi qui arrive sur lui', () => {
    const game = createGame(1)
    game.enemies.push(enemyAt(0, 10))
    game.enemyBullets.push({ x: game.player.x + 0.3, y: game.player.y + 1.5, vx: 0, vy: -6 })
    expect(autopilot(game).dx).toBe(-1)
  })

  it('fait marquer des points en jouant seul', () => {
    const game = createGame(7)
    for (let i = 0; i < 60 * 20 && !game.over; i++) step(game, autopilot(game), 1 / 60)
    expect(game.score).toBeGreaterThan(0)
  })
})
