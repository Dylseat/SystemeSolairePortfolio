import { expect, test, type Page } from '@playwright/test'

const SECTIONS = ['Présentation', 'Compétences', 'Expériences', 'Formation', 'Mini-jeu', 'Contact']

const menu = (page: Page) => page.getByRole('navigation', { name: 'Sections du portfolio' })
const panelTitle = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name, exact: true })

// Les tests ne dépendent pas du service de statistiques : son script est remplacé par un script vide
test.beforeEach(async ({ page }) => {
  await page.route(/gc\.zgo\.at/, (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  )
})

// Erreurs JavaScript de la page, pour détecter un plantage (écran vide)
function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

test.describe('système solaire', () => {
  test('charge la page et parcourt toutes les sections sans erreur', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/')

    await expect(page).toHaveTitle(/Dylan Diaz/)
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.getByText(/une planète ou choisis une section/)).toBeVisible()

    for (const section of SECTIONS) {
      await menu(page).getByRole('button', { name: section, exact: true }).click()
      await expect(panelTitle(page, section)).toBeVisible()
    }

    expect(errors).toEqual([])
  })

  test('ouvre une section depuis le menu puis la ferme', async ({ page }) => {
    await page.goto('/')
    const competences = menu(page).getByRole('button', { name: 'Compétences' })

    await competences.click()
    await expect(panelTitle(page, 'Compétences')).toBeVisible()
    await expect(page.getByText(/Langages : C#/)).toBeVisible()
    await expect(competences).toHaveAttribute('aria-current', 'true')
    await expect(page.getByText(/une planète ou choisis une section/)).toBeHidden()

    await page.keyboard.press('Escape')
    await expect(panelTitle(page, 'Compétences')).toBeHidden()

    await competences.click()
    await page.getByRole('button', { name: 'Fermer' }).click()
    await expect(panelTitle(page, 'Compétences')).toBeHidden()
  })

  test('affiche les liens de contact', async ({ page }) => {
    await page.goto('/')
    await menu(page).getByRole('button', { name: 'Contact' }).click()

    await expect(page.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      /^mailto:/,
    )
    const github = page.getByRole('link', { name: 'GitHub' })
    await expect(github).toHaveAttribute('href', 'https://github.com/Dylseat')
    await expect(github).toHaveAttribute('target', '_blank')
  })

  test('ouvre la présentation en cliquant sur le Soleil', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Le Soleil est au centre seulement sur grand écran')
    await page.goto('/')

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    // Laisser la scène faire ses premiers rendus avant de viser le Soleil
    await page.waitForTimeout(1000)

    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)

    await expect(panelTitle(page, 'Présentation')).toBeVisible()
  })
})

test.describe('version texte', () => {
  test('s’ouvre depuis le menu et revient au système solaire', async ({ page }) => {
    await page.goto('/')
    await menu(page).getByRole('button', { name: 'Version texte' }).click()

    await expect(page).toHaveURL(/#cv$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Dylan Diaz' })).toBeVisible()

    await page.getByRole('button', { name: 'Retour au système solaire' }).click()
    await expect(page).not.toHaveURL(/#cv/)
    await expect(menu(page)).toBeVisible()
  })

  test('s’ouvre directement avec un lien #cv', async ({ page }) => {
    await page.goto('/#cv')

    await expect(page.getByRole('heading', { level: 1, name: 'Dylan Diaz' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Expériences' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Mini-jeu' })).toHaveCount(0)
  })
})

test.describe('mobile et accessibilité', () => {
  test('ouvre le panneau en tiroir en bas de l’écran', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Disposition propre au mobile')
    await page.goto('/')

    const menuBox = await menu(page).boundingBox()
    expect(menuBox!.height).toBeLessThan(80) // une seule ligne qui défile

    await menu(page).getByRole('button', { name: 'Formation' }).click()
    const panel = panelTitle(page, 'Formation').locator('..')
    await expect(panel).toBeVisible()

    const panelBox = await panel.boundingBox()
    const viewport = page.viewportSize()!
    expect(panelBox!.y + panelBox!.height).toBeCloseTo(viewport.height, -1)
  })

  test('coupe les animations quand le système le demande', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    const hint = page.getByText(/une planète ou choisis une section/)
    await expect(hint).toBeVisible()
    await expect(hint).toHaveCSS('animation-name', 'none')
  })
})
