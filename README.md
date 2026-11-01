# Portfolio — Système solaire

Mon CV sous forme de système solaire en 3D : chaque astre est une section du portfolio (présentation, compétences, expériences, formation, contact). Une version texte imprimable est disponible à tout moment, aussi à l'adresse `/#cv`.

## Stack

- React, TypeScript, Vite
- Three.js avec React Three Fiber et drei
- Tailwind CSS
- Hébergement sur Vercel

## Lancer le projet

```bash
cd frontend
npm install
npm run dev
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run lint` | Vérification du code (ESLint) |
| `npm run build` | Vérification des types et build de production dans `dist/` |
| `npm run preview` | Sert le build de production en local |
| `npm test` | Tests unitaires et fonctionnels (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright) |

La liste des tests et leur rôle est détaillée dans [TESTS.md](TESTS.md).

## Contenu

Tout le contenu du CV se trouve dans [`frontend/src/data/planets.ts`](frontend/src/data/planets.ts). Il alimente à la fois la scène 3D et la version texte.
