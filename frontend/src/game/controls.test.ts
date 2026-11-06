import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_VOLUME,
  loadBestScore,
  loadVolume,
  readKeyboard,
  saveBestScore,
  saveVolume,
} from './controls'

describe('commandes du mini-jeu', () => {
  it('lit les touches WASD / ZQSD par leur position physique', () => {
    expect(readKeyboard(new Set(['KeyW', 'KeyD']))).toEqual({ dx: 1, dy: 1, fire: false })
    expect(readKeyboard(new Set(['KeyS', 'KeyA']))).toEqual({ dx: -1, dy: -1, fire: false })
  })

  it('accepte aussi les flèches, et Espace pour tirer', () => {
    expect(readKeyboard(new Set(['ArrowLeft', 'Space']))).toEqual({ dx: -1, dy: 0, fire: true })
  })

  it('s’arrête si deux directions opposées sont appuyées', () => {
    expect(readKeyboard(new Set(['KeyA', 'KeyD']))).toEqual({ dx: 0, dy: 0, fire: false })
  })
})

describe('meilleur score', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('garde le meilleur score dans le navigateur', () => {
    expect(loadBestScore()).toBe(0)
    saveBestScore(1250)
    expect(loadBestScore()).toBe(1250)
  })

  it('garde le volume, et ignore une valeur invalide', () => {
    expect(loadVolume()).toBe(DEFAULT_VOLUME)
    saveVolume(0.25)
    expect(loadVolume()).toBe(0.25)

    localStorage.setItem('mini-jeu:volume', '7')
    expect(loadVolume()).toBe(DEFAULT_VOLUME)
    localStorage.setItem('mini-jeu:volume', 'fort')
    expect(loadVolume()).toBe(DEFAULT_VOLUME)
  })

  it('fonctionne même si le stockage est bloqué', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqué')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqué')
    })

    expect(() => saveBestScore(10)).not.toThrow()
    expect(loadBestScore()).toBe(0)
  })
})
