import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import InfoPanel from './InfoPanel'
import type { InfoPanelData } from '../data/planets'

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

  it('appelle onClose au clic sur « Fermer »', async () => {
    const onClose = vi.fn()
    render(<InfoPanel section={section} onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
