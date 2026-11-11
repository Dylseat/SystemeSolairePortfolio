# CI/CD

🇫🇷 [Français](README.fr.md) · 🇬🇧 **English**

Continuous integration and deployment run through a single GitHub Actions workflow: [`ci.yml`](ci.yml).

## When it runs

| Event | Jobs run |
| --- | --- |
| Pull request (to any branch) | Checks, then end-to-end tests |
| Push to `main` (pull request merge) | Checks, end-to-end tests, then deployment |

The workflow can only read the repository (`permissions: contents: read`).

## The three jobs

They run in sequence: a job only starts if the previous one succeeded. Job and step names are in French in the workflow: each section below gives the job's name as shown in GitHub Actions, and the tables list the steps under their French names.

```
Lint, build and unit tests  →  End-to-end tests  →  Infomaniak deployment
                                                    (main only)
```

Each job runs on `ubuntu-latest` with Node 24 and installs dependencies with `npm ci` (npm cache keyed on `frontend/package-lock.json`).

### 1. Lint, build and unit tests

Job name in GitHub Actions: *Lint, build et tests unitaires*.

| Step | Command | Purpose |
| --- | --- | --- |
| Lint | `npm run lint` | ESLint rules |
| Types et build | `npm run build` | TypeScript check (`tsc -b`) and Vite build |
| Tests unitaires et fonctionnels | `npm test` | Vitest, JUnit report in `test-reports/unit-junit.xml` |
| Rapport des tests unitaires | `node scripts/test-summary.mjs …` | French summary in the run's *Summary* tab, even when tests fail |

### 2. End-to-end tests

Job name in GitHub Actions: *Tests end-to-end*.

| Step | Command | Purpose |
| --- | --- | --- |
| Installer Chromium | `npx playwright install --with-deps chromium` | Browser for Playwright |
| Tests end-to-end (bureau et mobile) | `npm run test:e2e` | Playwright against the production build, on desktop Chrome and Pixel 7 |
| Rapport des tests end-to-end | `node scripts/test-summary.mjs …` | French summary in the *Summary* tab |
| Rapport Playwright détaillé | `actions/upload-artifact` | `rapport-playwright` artifact (screenshots, traces), kept 14 days |

Test and report details are in [TESTS.md](../../TESTS.md).

### 3. Infomaniak deployment

Job name in GitHub Actions: *Déploiement Infomaniak*.

It only runs when all three conditions are met:

- the event is a push to `main`;
- the end-to-end tests passed;
- the `INFOMANIAK_HOST` variable is set (otherwise the job is skipped).

Steps: a fresh production build (`npm run build`), then `frontend/dist/` is uploaded to the server with [FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action). Only changed files are sent, and files removed from the build are deleted from the server (tracked in `.ftp-deploy-sync-state.json`).

The job uses the `production` GitHub environment: each deployment shows up in the repository's *Deployments* tab, with a link to the site (`SITE_URL`). Two deployments never run at the same time (`concurrency: deploy-production`): the second one waits for the first to finish without cancelling it.

The Starter hosting plan only accepts unencrypted FTP: the FTP account is dedicated to deployment, and moving to the Web Hosting plan will allow SFTP.

## Configuration

In GitHub, *Settings → Secrets and variables → Actions*:

| Name | Type | Content |
| --- | --- | --- |
| `INFOMANIAK_FTP_PASSWORD` | Secret | Password of the deployment FTP account |
| `INFOMANIAK_HOST` | Variable | FTP server of the hosting |
| `INFOMANIAK_USER` | Variable | FTP user |
| `INFOMANIAK_PATH` | Variable | Site folder on the server, ending with `/` (files removed from the build are deleted there) |
| `SITE_URL` | Variable | Public address of the site |

The [`frontend/public/.htaccess`](../../frontend/public/.htaccess) file is deployed with the site: it redirects `http://` and `www.` to `https://dylandiaz.ch`.

## Badges

The two badges at the top of the [README](../../README.md) track the CI status on `main` and the latest production deployment.
