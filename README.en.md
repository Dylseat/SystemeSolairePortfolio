# Portfolio — Solar System

🇫🇷 [Français](README.md) · 🇬🇧 **English**

[![CI](https://github.com/Dylseat/SystemeSolairePortfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Dylseat/SystemeSolairePortfolio/actions/workflows/ci.yml)
[![Deployment](https://img.shields.io/github/deployments/Dylseat/SystemeSolairePortfolio/production?label=deployment)](https://github.com/Dylseat/SystemeSolairePortfolio/deployments)

My resume as a 3D solar system, live at [dylandiaz.ch](https://dylandiaz.ch): each celestial body is a section of the portfolio (about, skills, technologies, experience, education, contact), with a 3D space shooter mini-game. A printable text version is available at any time, also at `/#cv`, and the resume can be downloaded as a PDF.

The site itself is in French.

## Stack

- React, TypeScript, Vite
- Three.js with React Three Fiber and drei
- Tailwind CSS
- Hosted by Infomaniak (Switzerland), deployed with GitHub Actions
- Anonymous visit statistics with GoatCounter

## Running the project

```bash
cd frontend
npm install
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run lint` | Code linting (ESLint) |
| `npm run build` | Type checking and production build into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm test` | Unit and functional tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |

The list of tests and what each one covers is detailed in [TESTS.en.md](TESTS.en.md).

## Content

All the resume content lives in [`frontend/src/data/planets.ts`](frontend/src/data/planets.ts). It feeds both the 3D scene and the text version.

The downloadable resume is [`frontend/public/CV-Dylan-Diaz.pdf`](frontend/public/CV-Dylan-Diaz.pdf). To update it, replace this file keeping the same name, with a lighter version for the web: no phone number, full address, date of birth or nationality.

## Statistics

Visits are measured with [GoatCounter](https://www.goatcounter.com): anonymous and cookie-free, so no consent banner is needed. The dashboard is at [dylseat.goatcounter.com](https://dylseat.goatcounter.com).

On top of visits, these actions are counted as events (`trackEvent` function in [`frontend/src/analytics.ts`](frontend/src/analytics.ts)):

| Event | When |
| --- | --- |
| `section/<id>` | A section is opened, from the 3D scene or the menu (for example `section/competences`) |
| `version-texte` | The text version is opened from the menu |
| `version-texte/lien-cv` | A visitor lands directly on the text version through a `#cv` link |
| `imprimer-cv` | Click on "Imprimer / enregistrer en PDF" (print / save as PDF) |
| `telecharger-cv` | Click on "Télécharger mon CV (PDF)" (download my resume) |
| `lien/<name>` | Click on a contact link (for example `lien/linkedin`) |
| `mini-jeu/partie` | A mini-game round is started |

Nothing is counted locally (`localhost`), and the site works normally if GoatCounter is blocked. Visitors who block it are not counted, so the figures are a minimum.

## Deployment

The site is hosted by Infomaniak. On every merge into `main`, the CI checks the code (lint, build, unit and end-to-end tests), then uploads the `dist/` build to the server. How the pipeline works and how it is configured (secrets, variables) is detailed in [CI/CD guide](.github/workflows/README.en.md).

## License

The code is licensed under [MIT](LICENSE). Personal content (photo, resume, career texts) is not covered by this license and remains the property of Dylan Diaz.

## Credits

The mini-game music ([`frontend/public/audio/mini-jeu.mp3`](frontend/public/audio/mini-jeu.mp3)) is "Mystics of the Cosmos" by Unicorn Heads, compressed to 80 kbit/s mono MP3 to keep the site light. It is not covered by the code's MIT license.
