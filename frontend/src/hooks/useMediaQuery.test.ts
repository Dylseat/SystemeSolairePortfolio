import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useIsSmallScreen, usePrefersReducedMotion } from './useMediaQuery'

// jsdom n'implémente pas matchMedia : on le simule, avec un état modifiable
function mockMatchMedia(initialMatches: Record<string, boolean>) {
  const matches = { ...initialMatches }
  const listeners = new Set<() => void>()

  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return matches[query] ?? false
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  }))

  return {
    set(query: string, value: boolean) {
      matches[query] = value
      listeners.forEach((listener) => listener())
    },
    listenerCount: () => listeners.size,
  }
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('détecte un petit écran', () => {
    mockMatchMedia({ '(max-width: 767px)': true })
    const { result } = renderHook(() => useIsSmallScreen())
    expect(result.current).toBe(true)
  })

  it('détecte la préférence « réduire les animations »', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('se met à jour quand la media query change', () => {
    const media = mockMatchMedia({ '(max-width: 767px)': false })
    const { result } = renderHook(() => useIsSmallScreen())
    expect(result.current).toBe(false)

    act(() => media.set('(max-width: 767px)', true))
    expect(result.current).toBe(true)
  })

  it("arrête d'écouter quand le composant est démonté", () => {
    const media = mockMatchMedia({})
    const { unmount } = renderHook(() => useIsSmallScreen())
    expect(media.listenerCount()).toBe(1)

    unmount()
    expect(media.listenerCount()).toBe(0)
  })
})
