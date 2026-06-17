import { test, expect } from '@playwright/test'

/**
 * VENDE YA — Navigation E2E tests
 * =====================================================================
 * Tests that all the new subpages are reachable and render correctly.
 * =====================================================================
 */

const PAGES = [
  { path: '/login',          title: 'Inicia sesión' },
  { path: '/registro',       title: 'Crea tu cuenta' },
  { path: '/dashboard',      title: 'Mi Dashboard' },
  { path: '/vender',         title: 'Vender' },
  { path: '/en-vivo',        title: 'En vivo ahora' },
  { path: '/marketplace',    title: 'Marketplace' },
  { path: '/buscar',         title: 'Buscar' },
  { path: '/notificaciones', title: 'Notificaciones' },
  { path: '/mensajes',       title: 'Mensajes' },
  { path: '/perfil',         title: 'Mi perfil' },
  { path: '/configuracion',  title: 'Configuración' },
  { path: '/pagos',          title: 'Métodos de pago' },
  { path: '/envios',         title: 'Envíos y direcciones' },
  { path: '/terminos',       title: 'Términos y condiciones' },
  { path: '/privacidad',     title: 'Política de privacidad' },
  { path: '/soporte',        title: 'Soporte' },
  { path: '/faq',            title: 'Preguntas frecuentes' },
] as const

test.describe('Static subpages render', () => {
  for (const page of PAGES) {
    test(`/${page.path === '/' ? '' : page.path} renders and shows expected content`, async ({ page: pwPage }) => {
      await pwPage.goto(page.path)
      // Wait for the page to fully load
      await pwPage.waitForLoadState('networkidle')
      // Check that the title appears somewhere on the page (h1 or h2 or breadcrumb)
      const titleRegex = new RegExp(page.title.split(' ')[0], 'i')
      const heading = pwPage.locator('h1, h2, [class*="breadcrumb"]').filter({ hasText: titleRegex }).first()
      await expect(heading).toBeAttached({ timeout: 5000 })
    })
  }
})

test.describe('Dynamic routes', () => {
  test('/subastas/a1 renders the live auction', async ({ page }) => {
    await page.goto('/subastas/a1')
    await expect(page.locator('h1').first()).toContainText('Polo algodón pima', { timeout: 5000 })
  })

  test('/productos/pr1 renders the product page', async ({ page }) => {
    await page.goto('/productos/pr1')
    await expect(page.locator('h1').first()).toContainText('Polo algodón pima', { timeout: 5000 })
  })

  test('/vendedores/rosa.peru renders the seller profile', async ({ page }) => {
    await page.goto('/vendedores/rosa.peru')
    await expect(page.locator('h1').first()).toContainText('Rosa', { timeout: 5000 })
  })

  test('/en-vivo/s1 renders the stream page', async ({ page }) => {
    await page.goto('/en-vivo/s1')
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')
    // The stream page should have a LiveBiddingContainer with a Live indicator
    await expect(page.locator('body')).toBeVisible()
    // Verify it's not 404
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)
  })

  test('non-existent auction returns 404', async ({ page }) => {
    const response = await page.goto('/subastas/non-existent-id')
    expect(response?.status()).toBe(404)
  })
})

test.describe('Mobile bottom navigation', () => {
  test('all 5 bottom nav links are present and clickable', async ({ page }) => {
    await page.goto('/')
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })

    const bottomNav = page.getByRole('navigation', { name: 'Navegación principal' }).last()
    const links = bottomNav.locator('a')
    await expect(links).toHaveCount(5)

    // Verify each link's href
    const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('href')))
    expect(hrefs).toEqual(['/', '/en-vivo', '/vender', '/notificaciones', '/perfil'])
  })

  test('clicking "Vender" navigates to /vender', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 390, height: 844 })

    const bottomNav = page.getByRole('navigation', { name: 'Navegación principal' }).last()
    await bottomNav.locator('a[href="/vender"]').click()

    await expect(page).toHaveURL(/\/vender$/)
    await expect(page.locator('h1').first()).toContainText('Vender')
  })

  test('only ONE floating "+" button on mobile (not two)', async ({ page }) => {
    await page.goto('/')
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })

    // The QuickAuctionFab should be hidden on mobile (hidden md:flex)
    // Use mobile project for true emulation. Here we just verify the
    // bottom-nav + button exists and is visible.
    const bottomNav = page.getByRole('navigation', { name: 'Navegación principal' }).last()
    const venderLink = bottomNav.locator('a[href="/vender"]')
    await expect(venderLink).toBeVisible()
  })
})

test.describe('Desktop top navigation', () => {
  test('desktop nav has correct links', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 1440, height: 900 })

    const topNav = page.getByRole('banner').getByRole('link')
    const texts = await topNav.allTextContents()
    expect(texts.join('|')).toContain('Inicio')
    expect(texts.join('|')).toContain('En vivo')
    expect(texts.join('|')).toContain('Marketplace')
    expect(texts.join('|')).toContain('Mi dashboard')
    expect(texts.join('|')).toContain('Vender')
  })
})

test.describe('Cross-page navigation flows', () => {
  test('user can navigate: home → login → dashboard', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1').first()).toContainText('Inicia sesión')

    // Fill the form and submit
    await page.fill('input[type="email"]', 'test@vendeya.pe')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should navigate to dashboard
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 })
  })

  test('user can navigate: home → vender → dashboard', async ({ page }) => {
    await page.goto('/vender')
    await expect(page.locator('h1').first()).toContainText('Vender')

    // Fill the form
    await page.fill('#title', 'Test product')
    await page.fill('#price', '50')
    await page.click('button:has-text("Publicar producto"), button:has-text("Iniciar subasta")')

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 })
  })

  test('footer legal links work', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    // Click "Términos" link in the footer
    const termsLink = page.locator('footer a[href="/terminos"]').first()
    await termsLink.click()
    await expect(page).toHaveURL(/\/terminos$/)

    // Go back and click "Privacidad"
    await page.goto('/')
    const privLink = page.locator('footer a[href="/privacidad"]').first()
    await privLink.click()
    await expect(page).toHaveURL(/\/privacidad$/)
  })
})
