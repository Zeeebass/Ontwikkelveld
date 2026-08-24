import { expect, test } from '@playwright/test'

test('admin kan inloggen en het coachoverzicht openen', async ({ page }) => {
  await page.goto('')
  await page.getByLabel('Loginnaam').fill('coach')
  await page.getByLabel('Wachtwoord', { exact: true }).fill('demo')
  await page.getByRole('button', { name: 'Naar Marpunten' }).click()
  await expect(page.getByRole('heading', { name: 'Coachoverzicht' })).toBeVisible()
  await expect(page.getByText('Periode 3')).toBeVisible()
})

test('speler ziet team en alleen het eigen dashboard', async ({ page }) => {
  await page.goto('')
  await page.getByLabel('Loginnaam').fill('daan8')
  await page.getByLabel('Wachtwoord', { exact: true }).fill('demo')
  await page.getByRole('button', { name: 'Naar Marpunten' }).click()
  await expect(page.getByRole('heading', { name: 'Team Groeiwaarde' })).toBeVisible()
  await page.getByRole('link', { name: 'Mijn groei' }).click()
  await expect(page.getByRole('heading', { name: /Mijn groei, Daan/ })).toBeVisible()
  await expect(page.getByText('Waar kijk je voordat je de bal ontvangt?')).toBeVisible()
})
