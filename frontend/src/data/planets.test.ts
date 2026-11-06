// @vitest-environment node
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { moonData, planets, profile, sections, sunData } from './planets'

const SUN_RADIUS = 1

describe('données du portfolio', () => {
  it('donne un id unique à chaque section', () => {
    const ids = sections.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('commence par la présentation et contient le contact', () => {
    expect(sections[0]).toBe(sunData)
    expect(sections).toContain(moonData)
  })

  it('donne du contenu à chaque section', () => {
    for (const section of sections) {
      expect(section.label.trim(), section.id).not.toBe('')
      const hasContent =
        Boolean(section.items?.length) ||
        Boolean(section.entries?.length) ||
        Boolean(section.links?.length)
      expect(hasContent, `${section.id} n'a aucun contenu`).toBe(true)
    }
  })

  it('remplit le titre, le lieu et la période de chaque entrée', () => {
    for (const entry of sections.flatMap((section) => section.entries ?? [])) {
      expect(entry.title.trim()).not.toBe('')
      expect(entry.place.trim()).not.toBe('')
      expect(entry.period.trim()).not.toBe('')
    }
  })

  it('sépare les compétences et les technologies, comme sur le CV', () => {
    const ids = planets.map((planet) => planet.id)
    const technologies = planets.find((planet) => planet.id === 'technologies')

    expect(ids.indexOf('technologies')).toBe(ids.indexOf('competences') + 1)
    expect(technologies?.items?.some((item) => item.startsWith('Langages'))).toBe(true)
  })

  it('signale que le mini-jeu est en construction', () => {
    const miniGame = planets.find((planet) => planet.id === 'mini-jeu')
    expect(miniGame?.inProgress).toBe(true)
  })

  it("n'utilise que des liens https ou mailto", () => {
    for (const link of sections.flatMap((section) => section.links ?? [])) {
      expect(link.href).toMatch(/^(https:\/\/|mailto:)/)
    }
  })

  it('ne publie aucune donnée personnelle sensible', () => {
    const publicText = JSON.stringify({ profile, sections })

    // Téléphone suisse (079 123 45 67), date de naissance, adresse postale
    expect(publicText).not.toMatch(/\b0\d{2}[ .]?\d{3}[ .]?\d{2}[ .]?\d{2}\b/)
    expect(publicText).not.toMatch(/\b\d{2}\.\d{2}\.\d{4}\b/)
    expect(publicText).not.toMatch(/\b(chemin|rue|avenue)\b/i)
  })

  it('pointe vers une photo de profil qui existe', () => {
    expect(sunData.imageUrl).toBeDefined()
    const photoPath = fileURLToPath(
      new URL(`../../public${sunData.imageUrl}`, import.meta.url),
    )
    expect(existsSync(photoPath)).toBe(true)
  })

  it('place les orbites des planètes sans chevauchement', () => {
    const sorted = [...planets].sort((a, b) => a.orbitRadius - b.orbitRadius)

    expect(sorted[0].orbitRadius - sorted[0].size).toBeGreaterThan(SUN_RADIUS)
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].orbitRadius - sorted[i - 1].orbitRadius
      expect(gap).toBeGreaterThan(sorted[i].size + sorted[i - 1].size)
    }
  })

  it('fait tourner la Lune entre le Soleil et la première planète', () => {
    const firstOrbit = Math.min(...planets.map((planet) => planet.orbitRadius))

    expect(moonData.orbitRadius - moonData.size).toBeGreaterThan(SUN_RADIUS)
    expect(moonData.orbitRadius + moonData.size).toBeLessThan(firstOrbit)
  })
})
