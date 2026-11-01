import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoadingScreen from './LoadingScreen'
import StartHint from './StartHint'

describe('StartHint', () => {
  it('explique comment naviguer', () => {
    render(<StartHint />)
    expect(screen.getByText(/une planète ou/)).toBeInTheDocument()
  })

  it('ne bloque pas les clics sur la scène', () => {
    render(<StartHint />)
    expect(screen.getByText(/une planète ou/)).toHaveClass('pointer-events-none')
  })
})

describe('LoadingScreen', () => {
  it('annonce le chargement aux lecteurs d’écran', () => {
    render(<LoadingScreen />)
    expect(screen.getByRole('status')).toHaveTextContent('Chargement du système solaire')
  })
})
