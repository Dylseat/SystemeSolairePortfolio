import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_VOLUME } from './controls'
import type { Hud } from './Game3D'
import GameOverlay from './GameOverlay'

// L'affichage 3D a besoin de WebGL, absent de jsdom : on garde seulement le lien avec l'interface
let reportHud: (hud: Hud) => void = () => {}
let isRunning = false
vi.mock('./Game3D', () => ({
  default: ({ onHud, running }: { onHud: (hud: Hud) => void; running: boolean }) => {
    reportHud = onHud
    isRunning = running
    return null
  },
}))

const gameOver = (score: number) =>
  act(() => reportHud({ score, lives: 0, wave: 3, announcing: false, over: true }))

// jsdom ne joue pas de son : un faux lecteur retient ce qu'on lui demande
const players: FakeAudio[] = []
// Simule un navigateur qui refuse de lancer le son sans clic
let refusePlay = false
class FakeAudio {
  loop = false
  muted = false
  volume = 1
  currentTime = 0
  paused = true
  play = vi.fn(() => {
    if (refusePlay) return Promise.reject(new Error('NotAllowedError'))
    this.paused = false
    return Promise.resolve()
  })
  pause = vi.fn(() => {
    this.paused = true
  })
  src: string
  constructor(src: string) {
    this.src = src
    players.push(this)
  }
}

describe('GameOverlay', () => {
  beforeEach(() => {
    players.length = 0
    refusePlay = false
    vi.stubGlobal('Audio', FakeAudio)
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('présente le jeu et ses commandes au clavier', () => {
    render(<GameOverlay onClose={() => {}} />)

    expect(screen.getByRole('dialog', { name: 'Mini-jeu' })).toBeInTheDocument()
    expect(screen.getByText(/QWERTZ/)).toBeInTheDocument()
    expect(screen.getByText(/AZERTY/)).toBeInTheDocument()
    expect(isRunning).toBe(false)
  })

  it('lance la partie et la compte dans les statistiques', async () => {
    const count = vi.fn()
    vi.stubGlobal('goatcounter', { count })
    render(<GameOverlay onClose={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))

    expect(isRunning).toBe(true)
    expect(count).toHaveBeenCalledWith(expect.objectContaining({ path: 'mini-jeu/partie' }))
  })

  it('affiche le score, puis garde le record en fin de partie', async () => {
    render(<GameOverlay onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))

    await gameOver(1200)

    expect(screen.getByRole('heading', { name: 'Partie terminée' })).toBeInTheDocument()
    expect(screen.getByText('Nouveau record !', { exact: false })).toBeInTheDocument()
    expect(localStorage.getItem('mini-jeu:meilleur-score')).toBe('1200')
  })

  it('ne remplace pas un meilleur record', async () => {
    localStorage.setItem('mini-jeu:meilleur-score', '5000')
    render(<GameOverlay onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))

    await gameOver(300)

    expect(screen.getByText(/Record : 5000/)).toBeInTheDocument()
    expect(localStorage.getItem('mini-jeu:meilleur-score')).toBe('5000')
  })

  it('lance la musique en boucle dès l’écran d’intro', () => {
    render(<GameOverlay onClose={() => {}} />)

    expect(players).toHaveLength(1)
    expect(players[0].src).toBe('/audio/mini-jeu.mp3')
    expect(players[0].loop).toBe(true)
    expect(players[0].play).toHaveBeenCalledOnce()
  })

  it('garde la musique en fin de partie et quand on rejoue, sans revenir au début', async () => {
    render(<GameOverlay onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    players[0].currentTime = 42

    await gameOver(100)
    await userEvent.click(screen.getByRole('button', { name: 'Rejouer' }))

    expect(players).toHaveLength(1)
    expect(players[0].pause).not.toHaveBeenCalled()
    expect(players[0].play).toHaveBeenCalledOnce()
    expect(players[0].currentTime).toBe(42)
  })

  it('lance la musique au clic sur « Commencer » si le navigateur l’avait refusée', async () => {
    refusePlay = true
    render(<GameOverlay onClose={() => {}} />)
    expect(players[0].paused).toBe(true)

    refusePlay = false
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))

    expect(players[0].paused).toBe(false)
  })

  it('éteint la musique en fondu d’une seconde quand on quitte', () => {
    localStorage.setItem('mini-jeu:volume', '0.5')
    vi.useFakeTimers()
    const { unmount } = render(<GameOverlay onClose={() => {}} />)

    unmount()
    expect(players[0].pause).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(players[0].volume).toBeCloseTo(0.25)
    expect(players[0].pause).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(players[0].volume).toBe(0)
    expect(players[0].pause).toHaveBeenCalledOnce()
  })

  it('arrête tout de suite la musique coupée quand on quitte', () => {
    localStorage.setItem('mini-jeu:son-coupe', 'oui')
    const { unmount } = render(<GameOverlay onClose={() => {}} />)

    unmount()
    expect(players[0].pause).toHaveBeenCalledOnce()
  })

  it('règle le volume avec le curseur, et s’en souvient', async () => {
    render(<GameOverlay onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    const slider = screen.getByRole('slider', { name: 'Volume de la musique' })
    expect(players[0].volume).toBe(DEFAULT_VOLUME)

    fireEvent.change(slider, { target: { value: '0.7' } })

    expect(players[0].volume).toBe(0.7)
    expect(localStorage.getItem('mini-jeu:volume')).toBe('0.7')
  })

  it('coupe et remet le son avec la touche M, et s’en souvient', async () => {
    render(<GameOverlay onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    const slider = screen.getByRole('slider', { name: 'Volume de la musique' })

    await userEvent.keyboard('m')
    expect(players[0].muted).toBe(true)
    expect(slider).toHaveValue('0')
    expect(localStorage.getItem('mini-jeu:son-coupe')).toBe('oui')

    await userEvent.keyboard('m')
    expect(players[0].muted).toBe(false)
    expect(slider).toHaveValue(String(DEFAULT_VOLUME))
  })

  it('remet le son quand on bouge le curseur alors qu’il était coupé', async () => {
    render(<GameOverlay onClose={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    await userEvent.keyboard('m')

    fireEvent.change(screen.getByRole('slider', { name: 'Volume de la musique' }), {
      target: { value: '0.8' },
    })

    expect(players[0].muted).toBe(false)
    expect(players[0].volume).toBe(0.8)
  })

  it('reprend le volume réglé à la visite précédente', async () => {
    localStorage.setItem('mini-jeu:volume', '0.3')
    render(<GameOverlay onClose={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(players[0].volume).toBe(0.3)
  })

  it('démarre en silence si le son avait été coupé à la visite précédente', async () => {
    localStorage.setItem('mini-jeu:son-coupe', 'oui')
    render(<GameOverlay onClose={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(players[0].muted).toBe(true)
  })

  it('crédite l’auteur de la musique', () => {
    render(<GameOverlay onClose={() => {}} />)
    expect(screen.getByText(/Mystics of the Cosmos/)).toBeInTheDocument()
  })

  it('se ferme avec Échap ou le bouton « Quitter »', async () => {
    const onClose = vi.fn()
    render(<GameOverlay onClose={onClose} />)

    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getAllByRole('button', { name: 'Quitter' })[0])
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
