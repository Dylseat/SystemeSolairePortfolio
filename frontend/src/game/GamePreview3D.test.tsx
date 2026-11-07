import { act, render } from '@testing-library/react'
import type { RefObject } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GameInput, GameState } from './engine'
import type { Hud } from './Game3D'
import GamePreview3D from './GamePreview3D'

// La scène 3D a besoin de WebGL, absent de jsdom : on garde seulement ce que la démo lui passe
type Received = {
  gameRef: RefObject<GameState>
  readInput: () => GameInput
  running: boolean
  still?: boolean
  onHud: (hud: Hud) => void
}
let received: Received
vi.mock('./Game3D', () => ({
  default: (props: Received) => {
    received = props
    return null
  },
}))

const reduceMotion = (reduce: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))

describe('GamePreview3D', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('montre la vraie scène 3D, jouée par le pilote automatique', () => {
    reduceMotion(false)
    render(<GamePreview3D />)

    expect(received.running).toBe(true)
    expect(received.still).toBe(false)
    // La partie est déjà avancée, pour qu'il y ait de l'action dès l'ouverture
    expect(received.gameRef.current.enemies.length).toBeGreaterThan(0)
    // Le pilote automatique tire sans arrêt
    expect(received.readInput().fire).toBe(true)
  })

  it('recommence une partie quand le pilote automatique perd', () => {
    reduceMotion(false)
    render(<GamePreview3D />)
    const lost = received.gameRef.current
    lost.over = true

    act(() => received.onHud({ score: 0, lives: 0, wave: 1, announcing: false, over: true }))

    expect(received.gameRef.current).not.toBe(lost)
    expect(received.gameRef.current.over).toBe(false)
  })

  it('affiche une image fixe avec « réduire les animations »', () => {
    reduceMotion(true)
    render(<GamePreview3D />)

    expect(received.running).toBe(false)
    expect(received.still).toBe(true)
  })
})
