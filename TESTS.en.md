# Tests

🇫🇷 [Français](TESTS.md) · 🇬🇧 **English**

Three levels of tests, all run automatically by GitHub Actions CI on every push to `main` and on every pull request (see [CI/CD guide](.github/workflows/README.en.md)).

| Level | Tool | Where | What is tested |
| --- | --- | --- | --- |
| Unit | Vitest + Testing Library | `frontend/src/**/*.test.ts(x)` | One isolated piece: the data, a hook, a component |
| Functional | Vitest + Testing Library | `frontend/src/App.test.tsx` | Several pieces together, in a simulated browser (jsdom) |
| End-to-end | Playwright | `frontend/e2e/` | The real site (production build) in a real Chromium, on desktop and mobile |

## Running the tests

```bash
cd frontend
npm test              # unit and functional
npm run test:watch    # same, re-run on every change
npm run test:e2e      # end-to-end (first time: npx playwright install chromium)
```

## Unit tests

### Resume data — `src/data/planets.test.ts`

| Test | Why |
| --- | --- |
| Each section has a unique id | The menu, the camera and the panel find a section by its id: a duplicate would open the wrong one |
| The "about" section comes first, the contact section is present | Expected menu order |
| Each section has content | Avoids an empty panel after a content change |
| Each entry has a title, a place and a period | An incomplete job or degree would be visible to a recruiter |
| Links use `https://` or `mailto:` | No broken or insecure link |
| No sensitive personal data | Safeguard: no phone number, date of birth or postal address on the public site |
| The profile picture exists | No broken image in the panel and the text version |
| Skills and technologies are two consecutive planets, as on the resume | The site and the resume stay organized the same way |
| Planet orbits do not overlap | Two planets cannot run through each other while orbiting |
| The Moon orbits between the Sun and the first planet | It goes through neither the Sun nor a planet |
| The mini-game is playable and no longer flagged "under construction" | The "Play" button appears in its panel |

### Hook — `src/hooks/useMediaQuery.test.ts`

| Test | Why |
| --- | --- |
| Detects a small screen | Triggers the mobile layout |
| Detects "reduce motion" | Accessibility: frozen orbits, camera without transitions |
| Updates when the screen changes | Phone rotation, resized window |
| Stops listening on unmount | No memory leak |

### Mini-game — `src/game/*.test.ts`

The game logic is separated from rendering: it can be tested without WebGL, and the same logic will power the 2D version.

| Test | Why |
| --- | --- |
| A game starts at wave 1, with 3 lives and a score of zero | Known starting point |
| The ship moves with the keyboard without leaving the screen, and no faster diagonally | Accurate controls |
| Shooting respects a maximum fire rate | You cannot fire on every frame |
| A hit enemy is destroyed and awards its points | Correct score |
| A collision costs a life, then the ship is invulnerable for a moment | No lives lost in a burst |
| With no lives left, the game ends | Game over |
| A cleared wave starts the next one, larger and more varied | Progressive difficulty |
| Same seed, same game | Reproducible games in tests |
| WASD (QWERTZ) and ZQSD (AZERTY) are read by the physical key position, arrows and Space included | The game works with Swiss and French keyboards |
| High score, volume and "muted" choice are kept in the browser; an invalid volume is ignored; nothing crashes when storage is blocked | No crash in private browsing |
| The demo autopilot shoots, moves under the nearest enemy, dodges shots and scores points (`autopilot.test.ts`) | The panel demo shows a real game |
| The 2D renderer draws a running or finished game without error (`render2d.test.ts`) | Basis for the touch-screen demo and the upcoming mobile version |
| The ship around the planet targets enemies in turn, orange ones included, skips those that exploded or are hidden by the planet, and never shoots through the planet (60 s simulation) (`orbitBattleLogic.test.ts`) | The preview shows all three enemy types of the game, with believable shots |

### Statistics — `src/analytics.test.ts`

| Test | Why |
| --- | --- |
| An event is sent to GoatCounter | Counted clicks show up in the dashboard |
| Nothing happens if GoatCounter is missing or blocked | The site works with an ad blocker (Brave…) and during tests |
| A GoatCounter error does not crash the site | A lost statistic is no big deal |

### Components

| File | Tests | Why |
| --- | --- | --- |
| `LinkList.test.tsx` | One link per entry; external links in a new tab (`noreferrer`); email in the same tab; plain-text address for printing; click counted in statistics | The visitor does not leave the portfolio; the printed PDF stays useful |
| `CvDownloadLink.test.tsx` | Link to the PDF with the `download` attribute; download counted in statistics | The recruiter leaves with a real resume |
| `EntryList.test.tsx` | Title, place and period; details shown when they exist; no empty list; order preserved | Readable jobs and degrees |
| `InfoPanel.test.tsx` | All content displayed; works without a description; photo only if present; PDF resume only if present; demo and "Play" button only for the mini-game; 3D demo when the game is playable (desktop), 2D otherwise, with the "mobile version under construction" message when it is not playable; "Under construction" badge only when needed; "Close" button | The panel adapts to each section |
| `SectionMenu.test.tsx` | One button per section + "Text version"; active section flagged (`aria-current`); correct id passed on | Navigation and accessibility (screen readers) |
| `CvView.test.tsx` | Name and title; every section except the mini-game; contact links; printing (counted in statistics); PDF resume download; back button only if 3D is available | The text version is what a busy recruiter reads |
| `StartHint.test.tsx` | Help text; does not block clicks; loading screen announced to screen readers | Accessibility |
| `GameOverlay.test.tsx` | Start screen with the controls; "Start" launches the game (counted in statistics); end screen with the score; high score kept only when beaten; music looping from the start screen, kept at game over and on "Play again" without restarting, started by "Start" if the browser had refused it, faded out over one second on quit (immediately if muted); volume set with the slider and remembered; mute toggled with the M key; moving the slider unmutes; music credit; closing with Escape or "Quit" | The game opens, plays and closes cleanly |
| `GamePreview3D.test.tsx` | Panel 3D demo: the real game scene, a game already in progress, played by the autopilot; restarts when it loses; still image with "reduce motion" | On desktop, the preview looks like the real game |

## Functional tests — `src/App.test.tsx`

The 3D scene is replaced by a fake component, since jsdom has no WebGL.

| Test | Why |
| --- | --- |
| Without WebGL, the text version is shown directly | A device without 3D still sees the resume, not a blank screen |
| With WebGL, the scene is shown | Normal case |
| "Text version" opens the resume and adds `#cv` to the address | Shareable link |
| "Back" returns to 3D and removes `#cv` | Round trip without reloading |
| Landing with `#cv` opens the resume | The link sent to a recruiter works |
| Changing `#cv` in the address updates the display | Consistent navigation |
| Text version openings are counted, from the menu and through a `#cv` link | Knowing whether recruiters use the text version |

## End-to-end tests — `e2e/portfolio.spec.ts`

Run on two devices: **desktop** (Chrome) and **mobile** (Pixel 7).

| Test | Why |
| --- | --- |
| The page loads and every section opens without a JavaScript error | Catches a crash (blank screen) like the one met during development |
| Open a section from the menu, then close it (Escape and "Close") | Main visitor journey |
| Contact links are correct | A recruiter must be able to get in touch |
| Clicking the Sun opens the "about" section (desktop) | Checks clicking inside the 3D scene itself |
| The text version opens from the menu and you can go back | Busy recruiter journey |
| The `#cv` link opens the text version directly, without the mini-game | Shareable link |
| On mobile, the menu fits on one line and the panel opens at the bottom | Mobile layout |
| With "reduce motion", animations are turned off | Accessibility |
| Each section opening is counted once in statistics | Knowing which sections interest visitors, without double counting |
| On desktop, the mini-game shows its 3D demo (not the 2D one) in the panel, launches from its planet, plays (moving and shooting) without error, then closes with Escape | The game works in a real browser |
| On mobile, the mini-game panel warns that the mobile version is under construction, without a "Play" button, but with the 2D demo (not the 3D one) | Phone visitors know why they cannot play |

## Reports in GitHub Actions

- **Job summary**: for each level, a table in French (passed, failed, errors, skipped, duration), failure details and the list of every test, in the run's *Summary* tab. It is generated by [`frontend/scripts/test-summary.mjs`](frontend/scripts/test-summary.mjs) from the JUnit reports.
- **Annotations**: a failing test is flagged directly on the relevant line.
- **`rapport-playwright` artifact**: the full HTML report of the end-to-end tests, with screenshots and traces of failures (downloadable from the run page).
