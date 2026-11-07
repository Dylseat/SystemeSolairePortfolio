// Calculs de la bataille autour de la planète Mini-jeu, sans affichage :
// positions sur les orbites, trajet du tir et choix de la cible (testables sans 3D)
import { Vector3 } from 'three'

export const SHOT_TIME = 0.3
export const SHOT_COOLDOWN = 0.5
export const RESPAWN_TIME = 1.2
export const BLAST_TIME = 0.4
// Distance au vaisseau et aux ennemis, ajoutée au rayon de la planète
const SHIP_ORBIT = 0.3
const ENEMY_ORBIT = 0.65
// Le tir doit passer au moins à cette distance de la surface de la planète
const SHOT_MARGIN = 0.05
// Nombre de positions du tir vérifiées pendant son vol
const SHOT_SAMPLES = 12

export function shipPosition(time: number, planetRadius: number, out = new Vector3()) {
  const angle = time * 1.3
  const radius = planetRadius + SHIP_ORBIT
  return out.set(Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius)
}

export function enemyPosition(index: number, time: number, planetRadius: number, out = new Vector3()) {
  const angle = -time * 0.5 + (index * 2 * Math.PI) / 3
  const radius = planetRadius + ENEMY_ORBIT
  return out.set(Math.cos(angle) * radius, Math.sin(time * 0.8 + index) * 0.15, Math.sin(angle) * radius)
}

// Position du tir pendant son vol : il part du vaisseau et rejoint l'ennemi,
// les deux continuant de bouger pendant ce temps
export function shotPosition(
  target: number,
  launchTime: number,
  age: number,
  planetRadius: number,
  out = new Vector3(),
) {
  const time = launchTime + age
  const from = shipPosition(time, planetRadius)
  const to = enemyPosition(target, time, planetRadius)
  return out.lerpVectors(from, to, Math.min(1, age / SHOT_TIME))
}

// Le tir ne doit jamais traverser la planète (centrée en 0, 0, 0) : on vérifie plusieurs
// positions de son vol à venir
export function shotIsClear(target: number, launchTime: number, planetRadius: number) {
  const point = new Vector3()
  for (let sample = 0; sample <= SHOT_SAMPLES; sample++) {
    shotPosition(target, launchTime, (sample / SHOT_SAMPLES) * SHOT_TIME, planetRadius, point)
    if (point.length() < planetRadius + SHOT_MARGIN) return false
  }
  return true
}

// Prochaine cible : l'ennemi suivant dans l'ordre (rouge, violet, orange), en sautant ceux
// qui ont déjà explosé ou que la planète cache. Partir de la cible actuelle, même détruite,
// pour que chacun y passe.
export function nextTarget(
  current: number,
  respawn: number[],
  inSight: (index: number) => boolean = () => true,
): number | null {
  for (let offset = 1; offset <= respawn.length; offset++) {
    const index = (current + offset) % respawn.length
    if (respawn[index] === 0 && inSight(index)) return index
  }
  return null
}
