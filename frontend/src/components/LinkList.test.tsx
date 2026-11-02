import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LinkList from './LinkList'

const links = [
  { label: 'Email', href: 'mailto:moi@example.com' },
  { label: 'GitHub', href: 'https://github.com/exemple' },
]

describe('LinkList', () => {
  it('affiche un lien par entrée', () => {
    render(<LinkList links={links} />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('compte les clics sur les liens dans les statistiques', async () => {
    const count = vi.fn()
    vi.stubGlobal('goatcounter', { count })
    render(<LinkList links={links} />)

    await userEvent.click(screen.getByRole('link', { name: /GitHub/ }))
    expect(count).toHaveBeenCalledWith({ path: 'lien/github', title: 'Lien : GitHub', event: true })
    vi.unstubAllGlobals()
  })

  it('ouvre les liens externes dans un nouvel onglet', () => {
    render(<LinkList links={links} />)
    const github = screen.getByRole('link', { name: /GitHub/ })

    expect(github).toHaveAttribute('href', 'https://github.com/exemple')
    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', 'noreferrer')
  })

  it("ouvre l'email dans le même onglet", () => {
    render(<LinkList links={links} />)
    const email = screen.getByRole('link', { name: /Email/ })

    expect(email).toHaveAttribute('href', 'mailto:moi@example.com')
    expect(email).not.toHaveAttribute('target')
  })

  it("prévoit l'adresse en clair pour l'impression, sans « mailto: »", () => {
    render(<LinkList links={links} />)
    const email = screen.getByRole('link', { name: /Email/ })

    expect(email).toHaveTextContent('moi@example.com')
    expect(email).not.toHaveTextContent('mailto:')
  })
})
