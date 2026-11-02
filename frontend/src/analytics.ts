// Statistiques anonymes avec GoatCounter (script chargé dans index.html).
// Un événement apparaît dans le tableau de bord comme une page, avec son nom et son titre.

type GoatCounter = {
  count: (vars: { path: string; title?: string; event?: boolean }) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounter
  }
}

export function trackEvent(path: string, title?: string) {
  // GoatCounter peut être bloqué (bloqueur de pub, Brave…) ou absent (tests) :
  // le site doit fonctionner normalement dans tous les cas
  try {
    window.goatcounter?.count({ path, title, event: true })
  } catch {
    // Une statistique perdue n'est pas grave
  }
}
