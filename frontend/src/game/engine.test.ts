// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createGame, NO_INPUT, step, waveEnemies, WORLD, type GameState } from './engine'

// Avance le jeu de `seconds` secondes, par pas de 1/60 s
function run(state: GameState, seconds: number, input = NO_INPUT) {
  for (let t = 0; t < seconds; t += 1 / 60) step(state, input, 1 / 60)
  return state
}

describe('moteur du mini-jeu', () => {
  it('commence à la vague 1 avec 3 vies et un score nul', () => {
    const game = createGame(1)
    expect(game.wave).toBe(1)
    expect(game.lives).toBe(3)
    expect(game.score).toBe(0)
    expect(game.over).toBe(false)
  })

  it('déplace le vaisseau au clavier, sans sortir de l’écran', () => {
    const game = createGame(1)
    run(game, 0.5, { dx: 1, dy: 0, fire: false })
    expect(game.player.x).toBeGreaterThan(0)

    run(game, 5, { dx: 1, dy: 1, fire: false })
    expect(game.player.x).toBeLessThan(WORLD.width / 2)
    expect(game.player.y).toBeLessThan(WORLD.height / 2)
  })

  it('ne va pas plus vite en diagonale', () => {
    const straight = run(createGame(1), 0.2, { dx: 1, dy: 0, fire: false })
    const diagonal = run(createGame(1), 0.2, { dx: 1, dy: 1, fire: false })
    const distance = Math.hypot(diagonal.player.x, diagonal.player.y - 2)
    expect(distance).toBeCloseTo(straight.player.x, 5)
  })

  it('tire en respectant une cadence maximale', () => {
    const game = createGame(1)
    step(game, { ...NO_INPUT, fire: true }, 1 / 60)
    step(game, { ...NO_INPUT, fire: true }, 1 / 60)
    expect(game.bullets).toHaveLength(1)

    run(game, 0.2, { ...NO_INPUT, fire: true })
    expect(game.bullets.length).toBeGreaterThan(1)
  })

  it('détruit un ennemi touché et ajoute ses points au score', () => {
    const game = createGame(1)
    game.wavePause = 0
    game.toSpawn = []
    game.enemies.push({
      id: 99, kind: 'drone', x: 0, y: 5, baseX: 0, age: 0, hp: 1, speed: 0, stopY: 0, fireTimer: 99,
    })

    run(game, 0.5, { ...NO_INPUT, fire: true })
    expect(game.score).toBe(100)
    expect(game.enemies.find((enemy) => enemy.id === 99)).toBeUndefined()
  })

  it('fait perdre une vie au contact, puis rend invulnérable un moment', () => {
    const game = createGame(1)
    const touch = () =>
      game.enemies.push({
        id: game.nextId++, kind: 'drone', x: game.player.x, y: game.player.y, baseX: 0,
        age: 0, hp: 1, speed: 0, stopY: 0, fireTimer: 99,
      })

    touch()
    step(game, NO_INPUT, 1 / 60)
    expect(game.lives).toBe(2)

    touch()
    step(game, NO_INPUT, 1 / 60)
    expect(game.lives).toBe(2)
  })

  it('termine la partie quand il n’y a plus de vie', () => {
    const game = createGame(1)
    game.lives = 1
    game.enemyBullets.push({ x: game.player.x, y: game.player.y, vx: 0, vy: 0 })
    step(game, NO_INPUT, 1 / 60)

    expect(game.over).toBe(true)
    const score = game.score
    run(game, 1, { dx: 1, dy: 0, fire: true })
    expect(game.score).toBe(score)
  })

  it('passe à la vague suivante quand tous les ennemis sont partis', () => {
    const game = createGame(1)
    // Sans tirer, les ennemis finissent par sortir par le bas (ou toucher le joueur)
    game.lives = 99
    run(game, 40)
    expect(game.wave).toBeGreaterThan(1)
  })

  it('rend les vagues plus nombreuses et plus variées', () => {
    const random = () => 0.1
    expect(waveEnemies(1, random)).toEqual(Array(7).fill('drone'))
    expect(waveEnemies(2, random)).toEqual(Array(9).fill('zigzag'))
    expect(waveEnemies(3, random)).toEqual(Array(11).fill('tireur'))
  })

  it('donne la même partie avec la même graine', () => {
    const a = run(createGame(42), 10)
    const b = run(createGame(42), 10)
    expect(a.enemies.map((enemy) => [enemy.x, enemy.y])).toEqual(
      b.enemies.map((enemy) => [enemy.x, enemy.y]),
    )
  })
})
