import { useSyncExternalStore } from 'react'

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

export function useIsSmallScreen() {
  return useMediaQuery('(max-width: 767px)')
}

// Écran tactile (téléphone, tablette) : pas de souris précise ni de clavier
export function useIsTouchScreen() {
  return useMediaQuery('(pointer: coarse)')
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
