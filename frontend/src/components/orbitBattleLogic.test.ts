// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  nextTarget,
  RESPAWN_TIME,
  SHOT_COOLDOWN,
  SHOT_TIME,
  shotIsClear,
  shotPosition,
} from './orbitBattleLogic'

const PLANET = 0.55

describe('aperçu du mini-jeu autour de la planète', () => {
  it('vise les ennemis à tour de rôle', () => {
    expect(nextTarget(0, [0, 0, 0])).toBe(1)
    expect(nextTarget(1, [0, 0, 0])).toBe(2)
    expect(nextTarget(2, [0, 0, 0])).toBe(0)
  })

  it('saute les ennemis qui ont explosé, sans en oublier un', () => {
    // Le violet (1) vient d'exploser : le suivant est l'orange (2), pas le rouge (0)
    expect(nextTarget(1, [0, 1.2, 0])).toBe(2)
    expect(nextTarget(2, [0.4, 0, 1.2])).toBe(1)
  })

  it('touche chaque ennemi au fil des tirs, orange compris', () => {
    // Même rythme que dans la scène : 0,3 s de vol, explosion, réapparition après 1,2 s,
    // puis 0,5 s avant le tir suivant
    const respawn = [0, 0, 0]
    const wait = (seconds: number) =>
      respawn.forEach((time, index) => (respawn[index] = Math.max(0, time - seconds)))
    const hit = new Set<number>()
    let target = 0

    for (let shot = 0; shot < 9; shot++) {
      target = nextTarget(target, respawn) ?? target
      wait(0.3)
      respawn[target] = 1.2
      hit.add(target)
      wait(0.5)
    }
    expect([...hit].sort()).toEqual([0, 1, 2])
  })

  it('ne vise personne si tous ont explosé', () => {
    expect(nextTarget(0, [1, 1, 1])).toBeNull()
  })

  it('saute un ennemi caché par la planète', () => {
    expect(nextTarget(0, [0, 0, 0], (index) => index !== 1)).toBe(2)
    expect(nextTarget(0, [0, 0, 0], () => false)).toBeNull()
  })

  it('refuse certains tirs : ceux où la planète est entre le vaisseau et l’ennemi', () => {
    const results = Array.from({ length: 600 }, (_, frame) => shotIsClear(0, frame / 60, PLANET))
    expect(results).toContain(true)
    expect(results).toContain(false)
  })

  it('ne tire jamais à travers la planète, et touche quand même les trois ennemis', () => {
    // Simulation de 60 secondes, image par image, avec les mêmes règles que la scène
    const respawn = [0, 0, 0]
    const hit = new Set<number>()
    let target = 0
    let cooldown = SHOT_COOLDOWN
    let launchTime = -1
    let closest = Infinity

    for (let frame = 0; frame < 60 * 60; frame++) {
      const time = frame / 60
      respawn.forEach((left, index) => (respawn[index] = Math.max(0, left - 1 / 60)))
      cooldown -= 1 / 60

      if (launchTime < 0 && cooldown <= 0) {
        const next = nextTarget(target, respawn, (index) => shotIsClear(index, time, PLANET))
        if (next !== null) {
          target = next
          launchTime = time
        }
      }

      if (launchTime >= 0) {
        const age = time - launchTime
        closest = Math.min(closest, shotPosition(target, launchTime, age, PLANET).length())
        if (age >= SHOT_TIME) {
          respawn[target] = RESPAWN_TIME
          hit.add(target)
          launchTime = -1
          cooldown = SHOT_COOLDOWN
        }
      }
    }

    expect(closest).toBeGreaterThan(PLANET)
    expect([...hit].sort()).toEqual([0, 1, 2])
  })
})
