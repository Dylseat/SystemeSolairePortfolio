import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { profile } from './data/planets'

// La vraie scène a besoin de WebGL, absent de jsdom : on la remplace par un bouton
vi.mock('./components/SolarScene', () => ({
  default: ({ onOpenTextView }: { onOpenTextView: () => void }) => (
    <button onClick={onOpenTextView}>Version texte</button>
  ),
}))

// App détecte WebGL au chargement du module : il faut simuler le résultat avant l'import
async function renderApp({ webgl }: { webgl: boolean }) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    webgl ? ({} as RenderingContext) : null,
  )
  vi.resetModules()
  const { default: App } = await import('./App')
  return render(<App />)
}

const cvHeading = () => screen.queryByRole('heading', { level: 1, name: profile.name })

describe('App', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche directement la version texte quand WebGL est indisponible', async () => {
    await renderApp({ webgl: false })

    expect(cvHeading()).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Retour au système solaire' }),
    ).not.toBeInTheDocument()
  })

  it('affiche la scène 3D quand WebGL est disponible', async () => {
    await renderApp({ webgl: true })

    expect(await screen.findByRole('button', { name: 'Version texte' })).toBeInTheDocument()
    expect(cvHeading()).not.toBeInTheDocument()
  })

  it('ouvre la version texte et ajoute #cv à l’adresse', async () => {
    await renderApp({ webgl: true })

    await userEvent.click(await screen.findByRole('button', { name: 'Version texte' }))

    expect(cvHeading()).toBeInTheDocument()
    expect(window.location.hash).toBe('#cv')
  })

  it('revient au système solaire et retire #cv de l’adresse', async () => {
    await renderApp({ webgl: true })
    await userEvent.click(await screen.findByRole('button', { name: 'Version texte' }))

    await userEvent.click(screen.getByRole('button', { name: 'Retour au système solaire' }))

    expect(cvHeading()).not.toBeInTheDocument()
    expect(window.location.hash).toBe('')
  })

  it('ouvre la version texte quand on arrive avec un lien #cv', async () => {
    history.replaceState(null, '', '/#cv')
    await renderApp({ webgl: true })

    expect(cvHeading()).toBeInTheDocument()
  })

  it('suit les changements de #cv faits dans l’adresse', async () => {
    await renderApp({ webgl: true })
    await screen.findByRole('button', { name: 'Version texte' })

    act(() => {
      history.replaceState(null, '', '/#cv')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(cvHeading()).toBeInTheDocument()

    act(() => {
      history.replaceState(null, '', '/')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(cvHeading()).not.toBeInTheDocument()
  })
})
