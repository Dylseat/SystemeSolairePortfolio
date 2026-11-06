import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CvView from './CvView'
import { moonData, planets, profile, sunData } from '../data/planets'

describe('CvView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche le nom et le titre en en-tête', () => {
    render(<CvView />)

    expect(screen.getByRole('heading', { level: 1, name: profile.name })).toBeInTheDocument()
    expect(screen.getByText(profile.title)).toBeInTheDocument()
  })

  it('affiche toutes les sections du CV, sans le mini-jeu', () => {
    render(<CvView />)
    const titles = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)

    for (const planet of planets.filter((planet) => planet.id !== 'mini-jeu')) {
      expect(titles).toContain(planet.label)
    }
    expect(titles).not.toContain('Mini-jeu')
  })

  it('affiche les liens de contact', () => {
    render(<CvView />)

    for (const link of moonData.links ?? []) {
      expect(screen.getByRole('link', { name: new RegExp(link.label) })).toHaveAttribute(
        'href',
        link.href,
      )
    }
  })

  it('lance l’impression du navigateur', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<CvView />)

    await userEvent.click(screen.getByRole('button', { name: /Imprimer/ }))
    expect(print).toHaveBeenCalledOnce()
  })

  it('compte les impressions dans les statistiques', async () => {
    vi.spyOn(window, 'print').mockImplementation(() => {})
    const count = vi.fn()
    vi.stubGlobal('goatcounter', { count })
    render(<CvView />)

    await userEvent.click(screen.getByRole('button', { name: /Imprimer/ }))
    expect(count).toHaveBeenCalledWith(expect.objectContaining({ path: 'imprimer-cv', event: true }))
    vi.unstubAllGlobals()
  })

  it('propose de télécharger le CV en PDF', () => {
    render(<CvView />)
    expect(screen.getByRole('link', { name: /Télécharger mon CV/ })).toHaveAttribute(
      'href',
      sunData.cvUrl,
    )
  })

  it('propose de revenir au système solaire quand la 3D est disponible', async () => {
    const onClose = vi.fn()
    render(<CvView onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Retour au système solaire' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('ne propose pas de retour quand la vue texte est la seule vue', () => {
    render(<CvView />)
    expect(
      screen.queryByRole('button', { name: 'Retour au système solaire' }),
    ).not.toBeInTheDocument()
  })

  it('affiche les expériences avec leurs détails', () => {
    render(<CvView />)
    const experiences = screen.getByRole('heading', { level: 2, name: 'Expériences' })
      .parentElement as HTMLElement
    const firstEntry = planets.find((planet) => planet.id === 'experiences')
      ?.entries?.[0]

    expect(firstEntry).toBeDefined()
    expect(within(experiences).getAllByText(firstEntry!.title).length).toBeGreaterThan(0)
  })
})
