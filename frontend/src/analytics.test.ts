import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackEvent } from './analytics'

describe('trackEvent', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envoie un événement à GoatCounter', () => {
    const count = vi.fn()
    vi.stubGlobal('goatcounter', { count })

    trackEvent('section/competences', 'Section : Compétences')

    expect(count).toHaveBeenCalledWith({
      path: 'section/competences',
      title: 'Section : Compétences',
      event: true,
    })
  })

  it('ne fait rien quand GoatCounter est absent ou bloqué', () => {
    expect(() => trackEvent('version-texte')).not.toThrow()
  })

  it('ne plante pas si GoatCounter lève une erreur', () => {
    vi.stubGlobal('goatcounter', {
      count: () => {
        throw new Error('panne')
      },
    })

    expect(() => trackEvent('version-texte')).not.toThrow()
  })
})
