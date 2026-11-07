import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { autopilot } from './autopilot'
import { createGame, step } from './engine'
import { drawGame } from './render2d'

// Une partie qui se joue toute seule, en 2D, dans le panneau du mini-jeu (écrans tactiles)
function GamePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let game = createGame()
    // Avancer un peu la partie pour qu'il y ait déjà de l'action
    for (let i = 0; i < 180; i++) step(game, autopilot(game), 1 / 60)

    const draw = (time: number) => {
      // Dessiner à la résolution de l'écran, pour rester net
      const ratio = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio
        canvas.height = height * ratio
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawGame(ctx, game, width, height, time)
    }

    // « Réduire les animations » : une seule image fixe
    if (reducedMotion) {
      draw(0)
      return
    }

    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      step(game, autopilot(game), (now - last) / 1000)
      last = now
      if (game.over) game = createGame()
      draw(now / 1000)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion])

  // Décoratif : le bouton « Jouer » juste en dessous dit déjà de quoi il s'agit
  return <canvas ref={canvasRef} aria-hidden="true" data-demo="2d" className="h-56 w-full rounded-xl" />
}

export default GamePreview
