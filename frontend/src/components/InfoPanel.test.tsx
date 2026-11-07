import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import InfoPanel from './InfoPanel'
import type { InfoPanelData } from '../data/planets'

// Les démos du jeu dessinent dans un canvas (2D ou WebGL), absent de jsdom : un simple repère suffit ici
vi.mock('../game/GamePreview', () => ({
  default: () => <div data-testid="demo-2d" />,
}))
vi.mock('../game/GamePreview3D', () => ({
  default: () => <div data-testid="demo-3d" />,
}))

const section: InfoPanelData = {
  id: 'test',
  label: 'Ma section',
  description: 'Une description',
  items: ['Premier point', 'Second point'],
  entries: [{ title: 'Un poste', place: 'Un lieu', period: '2024' }],
  links: [{ label: 'GitHub', href: 'https://github.com/exemple' }],
}

describe('InfoPanel', () => {
  it('affiche tout le contenu de la section', () => {
    render(<InfoPanel section={section} onClose={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Ma section' })).toBeInTheDocument()
    expect(screen.getByText('Une description')).toBeInTheDocument()
    expect(screen.getByText('Premier point')).toBeInTheDocument()
    expect(screen.getByText('Un poste')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeInTheDocument()
  })

  it('fonctionne sans description', () => {
    render(
      <InfoPanel
        section={{ id: 'test', label: 'Sans description', items: ['Un point'] }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Sans description' })).toBeInTheDocument()
    expect(screen.queryByText('Une description')).not.toBeInTheDocument()
  })

  it('affiche la photo seulement quand la section en a une', () => {
    const { rerender } = render(<InfoPanel section={section} onClose={() => {}} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    rerender(
      <InfoPanel section={{ ...section, imageUrl: '/photo.jpg' }} onClose={() => {}} />,
    )
    expect(screen.getByRole('img', { name: 'Ma section' })).toHaveAttribute(
      'src',
      '/photo.jpg',
    )
  })

  it('propose le CV en PDF seulement quand la section en a un', () => {
    const { rerender } = render(<InfoPanel section={section} onClose={() => {}} />)
    expect(screen.queryByRole('link', { name: /Télécharger mon CV/ })).not.toBeInTheDocument()

    rerender(<InfoPanel section={{ ...section, cvUrl: '/cv.pdf' }} onClose={() => {}} />)
    expect(screen.getByRole('link', { name: /Télécharger mon CV/ })).toHaveAttribute(
      'href',
      '/cv.pdf',
    )
  })

  it('propose « Jouer » seulement pour une section jouable', async () => {
    const onPlay = vi.fn()
    const { rerender } = render(<InfoPanel section={section} onClose={() => {}} onPlay={onPlay} />)
    expect(screen.queryByRole('button', { name: /Jouer/ })).not.toBeInTheDocument()

    expect(screen.queryByTestId('demo-3d')).not.toBeInTheDocument()
    expect(screen.queryByTestId('demo-2d')).not.toBeInTheDocument()

    rerender(
      <InfoPanel section={{ ...section, playable: true }} onClose={() => {}} onPlay={onPlay} />,
    )
    // Sur ordinateur, la démo est en 3D, comme le jeu
    expect(await screen.findByTestId('demo-3d')).toBeInTheDocument()
    expect(screen.queryByTestId('demo-2d')).not.toBeInTheDocument()
    expect(screen.queryByText(/Version mobile en construction/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Jouer/ }))
    expect(onPlay).toHaveBeenCalledOnce()
  })

  it('prévient que la version mobile est en construction quand le jeu n’est pas jouable ici', async () => {
    render(<InfoPanel section={{ ...section, playable: true }} onClose={() => {}} />)

    expect(screen.getByText(/Version mobile en construction/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Jouer/ })).not.toBeInTheDocument()
    // La démo reste visible, en 2D comme la future version mobile
    expect(await screen.findByTestId('demo-2d')).toBeInTheDocument()
    expect(screen.queryByTestId('demo-3d')).not.toBeInTheDocument()
  })

  it('signale une section en construction seulement quand elle l’est', () => {
    const { rerender } = render(<InfoPanel section={section} onClose={() => {}} />)
    expect(screen.queryByText('En construction')).not.toBeInTheDocument()
    expect(screen.queryByText('Fonctionnalités prévues')).not.toBeInTheDocument()

    rerender(<InfoPanel section={{ ...section, inProgress: true }} onClose={() => {}} />)
    expect(screen.getByText('En construction')).toBeInTheDocument()
    expect(screen.getByText('Fonctionnalités prévues')).toBeInTheDocument()
  })

  it('appelle onClose au clic sur « Fermer »', async () => {
    const onClose = vi.fn()
    render(<InfoPanel section={section} onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
