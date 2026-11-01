import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SectionMenu from './SectionMenu'

const sections = [
  { id: 'presentation', label: 'Présentation', items: ['a'] },
  { id: 'competences', label: 'Compétences', items: ['b'] },
]

function renderMenu(selectedId: string | null = null) {
  const onSelect = vi.fn()
  const onOpenTextView = vi.fn()
  render(
    <SectionMenu
      sections={sections}
      selectedId={selectedId}
      onSelect={onSelect}
      onOpenTextView={onOpenTextView}
    />,
  )
  return { onSelect, onOpenTextView }
}

describe('SectionMenu', () => {
  it('affiche un bouton par section, plus « Version texte »', () => {
    renderMenu()

    expect(screen.getByRole('navigation', { name: 'Sections du portfolio' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(sections.length + 1)
    expect(screen.getByRole('button', { name: 'Version texte' })).toBeInTheDocument()
  })

  it('signale la section active aux lecteurs d’écran', () => {
    renderMenu('competences')

    expect(screen.getByRole('button', { name: 'Compétences' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Présentation' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('transmet l’id de la section cliquée', async () => {
    const { onSelect } = renderMenu()

    await userEvent.click(screen.getByRole('button', { name: 'Compétences' }))
    expect(onSelect).toHaveBeenCalledWith('competences')
  })

  it('ouvre la version texte', async () => {
    const { onOpenTextView } = renderMenu()

    await userEvent.click(screen.getByRole('button', { name: 'Version texte' }))
    expect(onOpenTextView).toHaveBeenCalledOnce()
  })
})
