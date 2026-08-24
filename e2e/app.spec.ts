import { expect, test } from '@playwright/test'

test('admin kan inloggen en het coachoverzicht openen', async ({ page }) => {
  await page.goto('')
  await page.getByLabel('Loginnaam').fill('coach')
  await page.getByLabel('Wachtwoord', { exact: true }).fill('demo')
  await page.getByRole('button', { name: 'Naar Ontwikkelveld' }).click()
  await expect(page.getByRole('heading', { name: 'Coachoverzicht' })).toBeVisible()
  await expect(page.getByText('Periode 3')).toBeVisible()
})

test('speler ziet team en alleen het eigen dashboard', async ({ page }) => {
  await page.goto('')
  await page.getByLabel('Loginnaam').fill('daan8')
  await page.getByLabel('Wachtwoord', { exact: true }).fill('demo')
  await page.getByRole('button', { name: 'Naar Ontwikkelveld' }).click()
  await expect(page.getByRole('heading', { name: 'Team Groeiwaarde' })).toBeVisible()
  await page.getByRole('link', { name: 'Mijn groei' }).click()
  await expect(page.getByRole('heading', { name: /Mijn groei, Daan/ })).toBeVisible()
  await expect(page.getByText('Waar kijk je voordat je de bal ontvangt?')).toBeVisible()
  await expect(page.getByText('Kijk vóór de balaanname over beide schouders, zodat je volgende actie al duidelijk is.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Bekijk antwoord/i })).toHaveCount(0)
})

test('admin kan een leeritem omzetten naar progressie', async ({ page }) => {
  await page.goto('')
  await page.getByLabel('Loginnaam').fill('coach')
  await page.getByLabel('Wachtwoord', { exact: true }).fill('demo')
  await page.getByRole('button', { name: 'Naar Ontwikkelveld' }).click()
  await page.getByRole('link', { name: 'Spelers' }).click()
  await page.getByRole('article').filter({ hasText: 'Daan de Jong' }).getByRole('link', { name: 'Beheren' }).click()

  const learningItem = page.getByRole('heading', { name: 'Waar kijk je voordat je de bal ontvangt?' })
  await expect(learningItem).toBeVisible()
  await page.getByRole('article').filter({ has: learningItem }).getByRole('button', { name: 'Naar progressie' }).click()
  await expect(page.getByRole('heading', { name: 'Leeritem omzetten naar progressie' })).toBeVisible()
  const conversionForm = page.locator('form.conversion-form')
  await conversionForm.getByRole('spinbutton', { name: 'Punten', exact: true }).fill('125')
  await conversionForm.getByRole('textbox', { name: 'Progressietitel', exact: true }).fill('Scannen zelfstandig toegepast')
  await conversionForm.getByRole('button', { name: 'Omzetten naar progressie', exact: true }).click()

  await expect(learningItem).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Scannen zelfstandig toegepast' })).toBeVisible()
  await expect(page.getByText('+€125K', { exact: true })).toBeVisible()
})
