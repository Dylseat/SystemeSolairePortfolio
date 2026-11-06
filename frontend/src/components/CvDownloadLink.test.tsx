import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CvDownloadLink from './CvDownloadLink'

describe('CvDownloadLink', () => {
  it('propose le PDF en téléchargement', () => {
    render(<CvDownloadLink href="/cv.pdf" />)
    const link = screen.getByRole('link', { name: /Télécharger mon CV/ })

    expect(link).toHaveAttribute('href', '/cv.pdf')
    expect(link).toHaveAttribute('download')
  })

  it('compte les téléchargements dans les statistiques', async () => {
    const count = vi.fn()
    vi.stubGlobal('goatcounter', { count })
    render(<CvDownloadLink href="/cv.pdf" />)
    const link = screen.getByRole('link', { name: /Télécharger mon CV/ })
    // jsdom ne sait pas télécharger : on empêche juste la navigation
    link.addEventListener('click', (event) => event.preventDefault())

    await userEvent.click(link)
    expect(count).toHaveBeenCalledWith({
      path: 'telecharger-cv',
      title: 'Téléchargement du CV (PDF)',
      event: true,
    })
    vi.unstubAllGlobals()
  })
})
