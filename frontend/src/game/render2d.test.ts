// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { autopilot } from './autopilot'
import { createGame, step } from './engine'
import { drawGame } from './render2d'

// Faux contexte de dessin : accepte tous les appels et compte les formes remplies
function fakeContext() {
  const calls = { fill: 0 }
  const ctx = new Proxy(
    {},
    {
      get: (_, name) => (name === 'fill' ? () => calls.fill++ : () => {}),
      set: () => true,
    },
  )
  return { ctx: ctx as CanvasRenderingContext2D, calls }
}

describe('dessin 2D du jeu', () => {
  it('dessine une partie en cours sans erreur', () => {
    const game = createGame(3)
    for (let i = 0; i < 60 * 8; i++) step(game, autopilot(game), 1 / 60)
    const { ctx, calls } = fakeContext()

    expect(() => drawGame(ctx, game, 320, 180, 8)).not.toThrow()
    // Au moins le vaisseau et des ennemis ou des tirs
    expect(calls.fill).toBeGreaterThan(1)
  })

  it('dessine aussi une partie terminée', () => {
    const game = createGame(3)
    game.over = true
    const { ctx } = fakeContext()
    expect(() => drawGame(ctx, game, 320, 180, 0)).not.toThrow()
  })
})
