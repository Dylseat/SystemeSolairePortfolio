import { useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { autopilot } from './autopilot'
import { createGame, step } from './engine'
import Game3D, { type Hud } from './Game3D'

// Une partie déjà un peu avancée, pour qu'il y ait de l'action dès l'ouverture
function startDemo() {
  const game = createGame()
  for (let i = 0; i < 180; i++) step(game, autopilot(game), 1 / 60)
  return game
}

// Démo du jeu sur ordinateur : la vraie scène 3D, pilotée par le pilote automatique
function GamePreview3D() {
  // useState garde la première partie : elle n'est préparée qu'une fois, pas à chaque rendu
  const [firstGame] = useState(startDemo)
  const gameRef = useRef(firstGame)
  const reducedMotion = usePrefersReducedMotion()

  const readInput = () => autopilot(gameRef.current)
  // La démo recommence toute seule quand le pilote automatique perd
  const handleHud = (hud: Hud) => {
    if (hud.over) gameRef.current = startDemo()
  }

  return (
    // Décoratif : le bouton « Jouer » juste en dessous dit déjà de quoi il s'agit
    <div aria-hidden="true" data-demo="3d" className="relative h-56 w-full overflow-hidden rounded-xl">
      <Game3D
        gameRef={gameRef}
        readInput={readInput}
        running={!reducedMotion}
        still={reducedMotion}
        minDistance={13}
        onHud={handleHud}
      />
    </div>
  )
}

export default GamePreview3D
