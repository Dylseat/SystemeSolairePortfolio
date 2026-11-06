# Portfolio — Système solaire

[![CI](https://github.com/Dylseat/SystemeSolairePortfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Dylseat/SystemeSolairePortfolio/actions/workflows/ci.yml)
[![Déploiement](https://img.shields.io/github/deployments/Dylseat/SystemeSolairePortfolio/production?label=d%C3%A9ploiement)](https://github.com/Dylseat/SystemeSolairePortfolio/deployments)

Mon CV sous forme de système solaire en 3D, en ligne sur [dylandiaz.ch](https://dylandiaz.ch) : chaque astre est une section du portfolio (présentation, compétences, expériences, formation, contact). Une version texte imprimable est disponible à tout moment, aussi à l'adresse `/#cv`.

## Stack

- React, TypeScript, Vite
- Three.js avec React Three Fiber et drei
- Tailwind CSS
- Hébergement chez Infomaniak (Suisse), déployé par GitHub Actions
- Statistiques de visite anonymes avec GoatCounter

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

## Statistiques

Les visites sont mesurées avec [GoatCounter](https://www.goatcounter.com) : anonyme, sans cookies, donc sans bandeau de consentement. Le tableau de bord est sur [dylseat.goatcounter.com](https://dylseat.goatcounter.com).

En plus des visites, ces actions sont comptées comme événements (fonction `trackEvent` dans [`frontend/src/analytics.ts`](frontend/src/analytics.ts)) :

| Événement | Quand |
| --- | --- |
| `section/<id>` | Ouverture d'une section, depuis la scène 3D ou le menu (par exemple `section/competences`) |
| `version-texte` | Ouverture de la version texte depuis le menu |
| `version-texte/lien-cv` | Arrivée directe sur la version texte par un lien `#cv` |
| `imprimer-cv` | Clic sur « Imprimer / enregistrer en PDF » |
| `telecharger-cv` | Clic sur « Télécharger mon CV (PDF) » |
| `lien/<nom>` | Clic sur un lien de contact (par exemple `lien/linkedin`) |

Rien n'est compté en local (`localhost`), et le site fonctionne normalement si GoatCounter est bloqué. Les visiteurs qui le bloquent ne sont pas comptés : les chiffres sont un minimum.

## Déploiement

Le site est hébergé chez Infomaniak. À chaque fusion sur `main`, la CI vérifie le code (lint, build, tests unitaires et end-to-end), puis le job « Déploiement Infomaniak » envoie le build `dist/` sur le serveur en FTP. L'hébergement Starter n'accepte que le FTP non chiffré : le compte FTP est dédié au déploiement, et le passage à l'Hébergement Web permettra d'utiliser SFTP.

Configuration dans GitHub, *Settings → Secrets and variables → Actions* :

| Nom | Type | Contenu |
| --- | --- | --- |
| `INFOMANIAK_FTP_PASSWORD` | Secret | Mot de passe du compte FTP de déploiement |
| `INFOMANIAK_HOST` | Variable | Serveur FTP de l'hébergement |
| `INFOMANIAK_USER` | Variable | Utilisateur FTP |
| `INFOMANIAK_PATH` | Variable | Dossier du site sur le serveur, terminé par `/` (les fichiers retirés du build y sont supprimés) |
| `SITE_URL` | Variable | Adresse publique du site |

Tant que `INFOMANIAK_HOST` n'est pas définie, le déploiement est ignoré.

Le fichier [`frontend/public/.htaccess`](frontend/public/.htaccess) est déployé avec le site : il redirige `http://` et `www.` vers `https://dylandiaz.ch`.

## Licence

Le code est sous licence [MIT](LICENSE). Le contenu personnel (photo, CV, textes du parcours) n'est pas couvert par cette licence et reste la propriété de Dylan Diaz.
