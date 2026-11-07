import type { GameInput } from './engine'

// `event.code` donne la position physique de la touche, quelle que soit la disposition :
// WASD sur un clavier QWERTZ et ZQSD sur un clavier AZERTY sont les mêmes touches
const LEFT = ['KeyA', 'ArrowLeft']
const RIGHT = ['KeyD', 'ArrowRight']
const UP = ['KeyW', 'ArrowUp']
const DOWN = ['KeyS', 'ArrowDown']
const FIRE = ['Space']

export const GAME_KEYS = [...LEFT, ...RIGHT, ...UP, ...DOWN, ...FIRE]

const isPressed = (pressed: ReadonlySet<string>, codes: string[]) =>
  codes.some((code) => pressed.has(code))

export function readKeyboard(pressed: ReadonlySet<string>): GameInput {
  return {
    dx: Number(isPressed(pressed, RIGHT)) - Number(isPressed(pressed, LEFT)),
    dy: Number(isPressed(pressed, UP)) - Number(isPressed(pressed, DOWN)),
    fire: isPressed(pressed, FIRE),
  }
}

// Meilleur score du visiteur, gardé dans son navigateur
const BEST_SCORE_KEY = 'mini-jeu:meilleur-score'

export function loadBestScore(): number {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0
  } catch {
    // Stockage bloqué (navigation privée…) : pas de record, le jeu marche quand même
    return 0
  }
}

export function saveBestScore(score: number) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // Idem : le record ne sera simplement pas gardé
  }
}

// Son coupé ou non, retenu d'une visite à l'autre
const MUTED_KEY = 'mini-jeu:son-coupe'

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === 'oui'
  } catch {
    return false
  }
}

export function saveMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTED_KEY, muted ? 'oui' : 'non')
  } catch {
    // Le choix ne sera simplement pas retenu
  }
}

// Volume de la musique, de 0 à 1, retenu d'une visite à l'autre
const VOLUME_KEY = 'mini-jeu:volume'
export const DEFAULT_VOLUME = 0.2

export function loadVolume(): number {
  try {
    const saved = localStorage.getItem(VOLUME_KEY)
    const volume = saved === null ? NaN : Number(saved)
    return volume >= 0 && volume <= 1 ? volume : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

export function saveVolume(volume: number) {
  try {
    localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {
    // Le réglage ne sera simplement pas retenu
  }
}
