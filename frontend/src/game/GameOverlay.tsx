import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../analytics'
import {
  GAME_KEYS,
  loadBestScore,
  loadMuted,
  loadVolume,
  readKeyboard,
  saveBestScore,
  saveMuted,
  saveVolume,
} from './controls'
import { createGame } from './engine'
import Game3D, { type Hud } from './Game3D'

type Phase = 'intro' | 'playing' | 'over'

type GameOverlayProps = {
  onClose: () => void
}

const START_HUD: Hud = { score: 0, lives: 3, wave: 1, announcing: true, over: false }

// Téléchargée à l'ouverture du mini-jeu (3 Mo)
const MUSIC_URL = '/audio/mini-jeu.mp3'
// Durée du fondu de la musique quand on quitte le jeu
const MUSIC_FADE_MS = 1000
const FADE_STEPS = 20

// Baisse le volume petit à petit, puis met en pause
function fadeOut(audio: HTMLAudioElement) {
  if (audio.paused || audio.muted || audio.volume === 0) {
    audio.pause()
    return
  }
  const startVolume = audio.volume
  let step = 0
  const timer = setInterval(() => {
    step += 1
    audio.volume = Math.max(0, startVolume * (1 - step / FADE_STEPS))
    if (step < FADE_STEPS) return
    clearInterval(timer)
    audio.pause()
  }, MUSIC_FADE_MS / FADE_STEPS)
}

// Lance la musique si elle ne joue pas déjà ; lecture refusée par le navigateur : le jeu continue sans
function playMusic(audio: HTMLAudioElement | null) {
  if (audio?.paused) audio.play()?.catch(() => {})
}

const buttonClass =
  'rounded-full px-5 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300'

function GameOverlay({ onClose }: GameOverlayProps) {
  const gameRef = useRef(createGame())
  const pressedKeys = useRef(new Set<string>())

  const [phase, setPhase] = useState<Phase>('intro')
  const [hud, setHud] = useState<Hud>(START_HUD)
  const [bestScore, setBestScore] = useState(loadBestScore)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [muted, setMuted] = useState(loadMuted)
  const [volume, setVolume] = useState(loadVolume)
  const music = useRef<HTMLAudioElement | null>(null)

  // La musique démarre dès l'écran d'intro : le jeu s'ouvre sur un clic, que le navigateur compte
  // comme une autorisation de jouer du son. Elle tourne en boucle, sans couper entre les parties,
  // jusqu'à ce qu'on quitte le jeu, puis s'éteint en fondu.
  // (Le volume et la coupure du son sont appliqués par les deux effets juste en dessous.)
  useEffect(() => {
    const audio = new Audio(MUSIC_URL)
    audio.loop = true
    music.current = audio
    playMusic(audio)
    return () => {
      music.current = null
      fadeOut(audio)
    }
  }, [])

  // Bouger le curseur remet le son s'il était coupé
  const changeVolume = (value: number) => {
    setVolume(value)
    setMuted(false)
  }

  useEffect(() => {
    saveMuted(muted)
    if (music.current) music.current.muted = muted
  }, [muted])

  useEffect(() => {
    saveVolume(volume)
    if (music.current) music.current.volume = volume
  }, [volume])

  const start = () => {
    gameRef.current = createGame()
    pressedKeys.current.clear()
    setHud(START_HUD)
    setIsNewRecord(false)
    setPhase('playing')
    // Si le navigateur a refusé la musique à l'ouverture, ce clic la lance ; sinon elle continue
    playMusic(music.current)
    trackEvent('mini-jeu/partie', 'Mini-jeu : partie lancée')
  }

  const readInput = () => readKeyboard(pressedKeys.current)

  const handleHud = (next: Hud) => {
    setHud(next)
    if (!next.over) return
    setPhase('over')
    if (next.score > bestScore) {
      saveBestScore(next.score)
      setBestScore(next.score)
      setIsNewRecord(true)
    }
  }

  useEffect(() => {
    const keys = pressedKeys.current
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.code === 'KeyM' && !event.repeat) setMuted((value) => !value)
      // Pendant la partie, les flèches et Espace ne doivent pas faire défiler la page
      if (phase === 'playing' && GAME_KEYS.includes(event.code)) event.preventDefault()
      keys.add(event.code)
    }
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code)
    const releaseAll = () => keys.clear()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseAll)
    }
  }, [onClose, phase])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mini-jeu"
      className="fixed inset-0 z-50 select-none bg-slate-950 text-white"
    >
      <Game3D
        gameRef={gameRef}
        readInput={readInput}
        running={phase === 'playing'}
        onHud={handleHud}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 text-sm">
        <dl className="flex flex-wrap gap-x-5 gap-y-1 rounded-xl bg-black/50 px-4 py-2 backdrop-blur">
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Score</dt>
            <dd className="font-semibold tabular-nums">{hud.score}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Vague</dt>
            <dd className="font-semibold tabular-nums">{hud.wave}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Vies</dt>
            <dd className="font-semibold text-rose-400" aria-label={`${hud.lives} vies`}>
              {'♥'.repeat(Math.max(0, hud.lives))}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-slate-400">Record</dt>
            <dd className="font-semibold tabular-nums">{bestScore}</dd>
          </div>
        </dl>
        <div className="pointer-events-auto flex items-center gap-2">
          <label
            className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2"
            title="Volume de la musique (M : couper le son)"
          >
            <span aria-hidden="true">{muted || volume === 0 ? '🔇' : '🔊'}</span>
            <span className="sr-only">Volume de la musique</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => changeVolume(Number(event.target.value))}
              // Rendre le clavier au jeu après avoir réglé le volume à la souris
              onPointerUp={(event) => event.currentTarget.blur()}
              className="w-24 accent-cyan-400"
            />
          </label>
          <button className={`${buttonClass} bg-slate-800 hover:bg-slate-700`} onClick={onClose}>
            Quitter
          </button>
        </div>
      </div>

      {phase === 'playing' && hud.announcing && (
        <p
          role="status"
          className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-4xl font-bold tracking-widest text-cyan-300"
        >
          Vague {hud.wave}
        </p>
      )}

      {phase !== 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-black/75 p-6 text-center backdrop-blur">
            {phase === 'intro' ? (
              <>
                <h2 className="text-2xl font-bold">Patrouille orbitale</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Détruis les vagues d’ennemis et esquive leurs tirs. Chaque vague est plus
                  rapide que la précédente.
                </p>
                <ul className="mt-4 space-y-1 text-sm text-slate-200">
                  <li>
                    <kbd>W A S D</kbd> (QWERTZ), <kbd>Z Q S D</kbd> (AZERTY) ou flèches : se
                    déplacer
                  </li>
                  <li>
                    <kbd>Espace</kbd> : tirer · <kbd>M</kbd> : couper le son · <kbd>Échap</kbd> : quitter
                  </li>
                </ul>
                <p className="mt-4 text-xs text-slate-400">
                  Musique : « Mystics of the Cosmos », Unicorn Heads
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Partie terminée</h2>
                <p className="mt-2 text-4xl font-bold tabular-nums text-cyan-300">{hud.score}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {isNewRecord ? 'Nouveau record !' : `Record : ${bestScore}`} · Vague {hud.wave}
                </p>
              </>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <button
                autoFocus
                className={`${buttonClass} bg-cyan-400 text-slate-950 hover:bg-cyan-300`}
                onClick={start}
              >
                {phase === 'intro' ? 'Commencer' : 'Rejouer'}
              </button>
              <button className={`${buttonClass} bg-slate-800 hover:bg-slate-700`} onClick={onClose}>
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameOverlay
