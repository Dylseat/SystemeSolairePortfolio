# Portfolio — Système solaire

[![CI](https://github.com/Dylseat/SystemeSolairePortfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Dylseat/SystemeSolairePortfolio/actions/workflows/ci.yml)

Mon CV sous forme de système solaire en 3D : chaque astre est une section du portfolio (présentation, compétences, expériences, formation, contact). Une version texte imprimable est disponible à tout moment, aussi à l'adresse `/#cv`.

## Stack

- React, TypeScript, Vite
- Three.js avec React Three Fiber et drei
- Tailwind CSS
- Hébergement chez Infomaniak (Suisse), déployé par GitHub Actions

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

## Déploiement

Le site est hébergé chez Infomaniak. À chaque fusion sur `main`, la CI vérifie le code (lint, build, tests unitaires et end-to-end), puis le job « Déploiement Infomaniak » envoie le build `dist/` sur le serveur par SSH (`rsync`).

Configuration dans GitHub, *Settings → Secrets and variables → Actions* :

| Nom | Type | Contenu |
| --- | --- | --- |
| `INFOMANIAK_SSH_KEY` | Secret | Clé SSH privée dont la clé publique est autorisée chez Infomaniak |
| `INFOMANIAK_HOST` | Variable | Serveur SSH de l'hébergement |
| `INFOMANIAK_USER` | Variable | Utilisateur SSH |
| `INFOMANIAK_PATH` | Variable | Dossier du site sur le serveur (son contenu est remplacé à chaque déploiement) |
| `SITE_URL` | Variable | Adresse publique du site |

Tant que `INFOMANIAK_HOST` n'est pas définie, le déploiement est ignoré.
