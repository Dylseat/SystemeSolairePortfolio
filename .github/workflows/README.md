# CI/CD

🇫🇷 **Français** · 🇬🇧 [English](README.en.md)

L'intégration et le déploiement continus passent par un seul workflow GitHub Actions : [`ci.yml`](ci.yml).

## Quand il se lance

| Événement | Jobs lancés |
| --- | --- |
| Pull request (vers n'importe quelle branche) | Vérification, puis tests end-to-end |
| Push sur `main` (fusion d'une pull request) | Vérification, tests end-to-end, puis déploiement |

Le workflow n'a que le droit de lire le dépôt (`permissions: contents: read`).

## Les trois jobs

Ils s'enchaînent : un job ne démarre que si le précédent a réussi.

```
Lint, build et tests unitaires  →  Tests end-to-end  →  Déploiement Infomaniak
                                                         (main uniquement)
```

Chaque job tourne sur `ubuntu-latest`, avec Node 24, et installe les dépendances avec `npm ci` (cache npm basé sur `frontend/package-lock.json`).

### 1. Lint, build et tests unitaires

| Étape | Commande | Rôle |
| --- | --- | --- |
| Lint | `npm run lint` | Règles ESLint |
| Types et build | `npm run build` | Vérification TypeScript (`tsc -b`) et build Vite |
| Tests unitaires et fonctionnels | `npm test` | Vitest, rapport JUnit dans `test-reports/unit-junit.xml` |
| Rapport des tests unitaires | `node scripts/test-summary.mjs …` | Résumé en français dans l'onglet *Summary* du run, même si les tests échouent |

### 2. Tests end-to-end

| Étape | Commande | Rôle |
| --- | --- | --- |
| Installer Chromium | `npx playwright install --with-deps chromium` | Navigateur pour Playwright |
| Tests end-to-end (bureau et mobile) | `npm run test:e2e` | Playwright sur le build de production, en Chrome bureau et Pixel 7 |
| Rapport des tests end-to-end | `node scripts/test-summary.mjs …` | Résumé en français dans l'onglet *Summary* |
| Rapport Playwright détaillé | `actions/upload-artifact` | Artefact `rapport-playwright` (captures, traces), gardé 14 jours |

Le détail des tests et des rapports est dans [TESTS.md](../../TESTS.md).

### 3. Déploiement Infomaniak

Il ne se lance que si les trois conditions sont réunies :

- l'événement est un push sur `main` ;
- les tests end-to-end ont réussi ;
- la variable `INFOMANIAK_HOST` est définie (sinon le job est ignoré).

Étapes : nouveau build de production (`npm run build`), puis envoi de `frontend/dist/` sur le serveur avec [FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action). Seuls les fichiers modifiés sont envoyés, et les fichiers retirés du build sont supprimés du serveur (suivi dans `.ftp-deploy-sync-state.json`).

Le job utilise l'environnement GitHub `production` : chaque déploiement apparaît dans l'onglet *Deployments* du dépôt, avec le lien vers le site (`SITE_URL`). Deux déploiements ne tournent jamais en même temps (`concurrency: deploy-production`) : le second attend la fin du premier, sans l'annuler.

L'hébergement Starter n'accepte que le FTP non chiffré : le compte FTP est dédié au déploiement, et le passage à l'Hébergement Web permettra d'utiliser SFTP.

## Configuration

Dans GitHub, *Settings → Secrets and variables → Actions* :

| Nom | Type | Contenu |
| --- | --- | --- |
| `INFOMANIAK_FTP_PASSWORD` | Secret | Mot de passe du compte FTP de déploiement |
| `INFOMANIAK_HOST` | Variable | Serveur FTP de l'hébergement |
| `INFOMANIAK_USER` | Variable | Utilisateur FTP |
| `INFOMANIAK_PATH` | Variable | Dossier du site sur le serveur, terminé par `/` (les fichiers retirés du build y sont supprimés) |
| `SITE_URL` | Variable | Adresse publique du site |

Le fichier [`frontend/public/.htaccess`](../../frontend/public/.htaccess) est déployé avec le site : il redirige `http://` et `www.` vers `https://dylandiaz.ch`.

## Badges

Les deux badges en haut du [README](../../README.md) suivent l'état de la CI sur `main` et du dernier déploiement en production.
