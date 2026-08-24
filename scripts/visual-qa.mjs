import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const executablePath = process.platform === 'win32'
  ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  : undefined
const browser = await chromium.launch({ headless: true, executablePath })
const baseURL = 'http://127.0.0.1:5173/Ontwikkelveld/'
const reviewDir = new URL('../.impeccable/review/', import.meta.url)
await mkdir(reviewDir, { recursive: true })
const reviewPath = (name) => fileURLToPath(new URL(name, reviewDir))

async function login(page, loginName) {
  await page.goto(baseURL)
  await page.getByLabel('Loginnaam').fill(loginName)
  await page.getByLabel('Wachtwoord', { exact: true }).fill('demo')
  await page.getByRole('button', { name: 'Naar Ontwikkelveld' }).click()
  await page.waitForTimeout(300)
}

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const desktop = await desktopContext.newPage()
const desktopErrors = []
desktop.on('console', (message) => { if (message.type() === 'error') desktopErrors.push(message.text()) })
await desktop.goto(baseURL)
await desktop.screenshot({ path: reviewPath('login-desktop.png'), fullPage: true })
await login(desktop, 'coach')
await desktop.getByRole('heading', { name: 'Coachoverzicht' }).waitFor()
await desktop.screenshot({ path: reviewPath('desktop.png'), fullPage: true })
const desktopMetrics = await desktop.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, title: document.title, heading: document.querySelector('h1')?.textContent }))
await desktop.getByRole('link', { name: 'Spelers', exact: true }).click()
await desktop.getByRole('button', { name: 'Speler toevoegen', exact: true }).click()
await desktop.getByLabel('Voornaam').fill('Milan')
await desktop.getByLabel('Achternaam').fill('Dekker')
await desktop.getByLabel('Loginnaam').fill('milan7')
await desktop.getByLabel('Positie').fill('Aanvaller')
await desktop.getByLabel('Rugnummer').fill('7')
await desktop.getByRole('button', { name: 'Speler en account maken' }).click()
await desktop.getByRole('heading', { name: 'Account is klaar' }).waitFor()
const createPlayerCheck = await desktop.getByText('Focus-Ruimte-4827').isVisible()
await desktop.goto(`${baseURL}#/admin/players/10000000-0000-4000-8000-000000000001`)
await desktop.getByRole('heading', { name: 'Daan de Jong' }).waitFor()
const learningHeading = desktop.getByRole('heading', { name: 'Waar kijk je voordat je de bal ontvangt?' })
await desktop.getByRole('article').filter({ has: learningHeading }).getByRole('button', { name: 'Naar progressie' }).click()
await desktop.getByRole('heading', { name: 'Leeritem omzetten naar progressie' }).waitFor()
await desktop.screenshot({ path: reviewPath('learning-conversion-desktop.png'), fullPage: true })
const conversionVisible = await desktop.getByRole('heading', { name: 'Leeritem omzetten naar progressie' }).isVisible()

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', isMobile: true })
const mobile = await mobileContext.newPage()
const mobileErrors = []
mobile.on('console', (message) => { if (message.type() === 'error') mobileErrors.push(message.text()) })
await login(mobile, 'daan8')
await mobile.getByRole('heading', { name: 'Team Groeiwaarde' }).waitFor()
await mobile.getByRole('link', { name: 'Mijn groei' }).click()
await mobile.getByRole('heading', { name: 'Mijn groei, Daan' }).waitFor()
await mobile.screenshot({ path: reviewPath('mobile.png'), fullPage: true })
const mobileMetrics = await mobile.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, title: document.title, heading: document.querySelector('h1')?.textContent }))

console.log(JSON.stringify({ desktop: desktopMetrics, mobile: mobileMetrics, createPlayerCheck, conversionVisible, desktopErrors, mobileErrors }, null, 2))
await browser.close()
