import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import EntryList from './EntryList'

describe('EntryList', () => {
  it('affiche le titre, le lieu et la période', () => {
    render(
      <EntryList
        entries={[{ title: 'Apprenti', place: 'Entreprise, Ville', period: '2023 – 2026' }]}
      />,
    )

    expect(screen.getByText('Apprenti')).toBeInTheDocument()
    expect(screen.getByText('Entreprise, Ville · 2023 – 2026')).toBeInTheDocument()
  })

  it('affiche le détail des missions quand il existe', () => {
    render(
      <EntryList
        entries={[
          {
            title: 'Apprenti',
            place: 'Entreprise',
            period: '2023',
            details: ['Tests unitaires', 'Correction de bugs'],
          },
        ]}
      />,
    )

    expect(screen.getByText('Tests unitaires')).toBeInTheDocument()
    expect(screen.getByText('Correction de bugs')).toBeInTheDocument()
  })

  it("n'affiche pas de liste de détails vide", () => {
    render(<EntryList entries={[{ title: 'Cursus', place: 'École', period: '2015' }]} />)

    // Une seule liste : celle des entrées, pas de sous-liste
    expect(screen.getAllByRole('list')).toHaveLength(1)
  })

  it('affiche les entrées dans l’ordre donné', () => {
    render(
      <EntryList
        entries={[
          { title: 'Récent', place: 'A', period: '2024' },
          { title: 'Ancien', place: 'B', period: '2015' },
        ]}
      />,
    )

    const titles = screen.getAllByText(/Récent|Ancien/).map((node) => node.textContent)
    expect(titles).toEqual(['Récent', 'Ancien'])
  })
})
