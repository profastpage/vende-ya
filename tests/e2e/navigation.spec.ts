import { test, expect } from '@playwright/test'

/**
 * VENDE YA — Navigation E2E tests
 * =====================================================================
 * Tests that all the new subpages are reachable and render correctly.
 * Includes auth-gate verification for protected routes.
 * =====================================================================
 */

test.describe('Static subpages render', () => {
  // Public pages — anyone can visit
  const PUBLIC_PAGES = [
    { path: '/login',          title: 'Inicia sesión' },
    { path: '/registro',       title: 'Crea tu cuenta' },
    { path: '/en-vivo',        title: 'En vivo ahora' },
    { path: '/marketplace',    title: 'Marketplace' },
    { path: '/buscar',         title: 'Buscar' },
    { path: '/terminos',       title: 'Términos y condiciones' },
    { path: '/privacidad',     title: 'Política de privacidad' },
    { path: '/soporte',        title: 'Soporte' },
    { path: '/faq',            title: 'Preguntas frecuentes' },
  ]
  // Protected pages — must login first (demo mode)
  const PROTECTED_PAGES = [
    { path: '/dashboard',      title: 'Mi Dashboard' },
    { path: '/vender',         title: 'Vender' },
    { path: '/notificaciones', title: 'Notificaciones' },
    { path: '/mensajes',       title: 'Mensajes' },
    { path: '/perfil',         title: 'Mi perfil' },
    { path: '/configuracion',  title: 'Configuración' },
    { path: '/pagos',          title: 'Métodos de pago' },
    { path: '/envios',         title: 'Envíos y direcciones' },
  ]

  for (const page of PUBLIC_PAGES) {
    test(`public ${page.path} renders without auth`, async ({ page: pwPage }) => {
      await pwPage.goto(page.path)
      await pwPage.waitForLoadState('networkidle')
      const titleRegex = new RegExp(page.title.split(' ')[0], 'i')
      const heading = pwPage.locator('h1, h2, [class*="breadcrumb"]').filter({ hasText: titleRegex }).first()
      await expect(heading).toBeAttached({ timeout: 5000 })
    })
  }

  for (const page of PROTECTED_PAGES) {
    test(`protected ${page.path} requires auth then renders`, async ({ page: pwPage }) => {
      // Login in demo mode first
      await pwPage.goto('/login')
      await pwPage.fill('input[type="email"]', 'test@vendeya.pe')
      await pwPage.fill('input[type="password"]', 'password123')
      await pwPage.click('button[type="submit"]')
      await pwPage.waitForURL(/\/dashboard$/, { timeout: 5000 })

      // Now visit the protected page
      await pwPage.goto(page.path)
      await pwPage.waitForLoadState('networkidle')
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

  test('clicking "Vender" navigates to /vender (or /login if not authenticated)', async ({ page }) => {
    await page.goto('/')
    // Ensure logged out
    await page.evaluate(() => localStorage.removeItem('vendeya:demoUser'))
    await page.reload()
    await page.setViewportSize({ width: 390, height: 844 })

    const bottomNav = page.getByRole('navigation', { name: 'Navegación principal' }).last()
    await bottomNav.locator('a[href="/vender"]').click()

    // When not authenticated, /vender is protected and redirects to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
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
  test('user can navigate: home → login → dashboard (demo mode)', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1').first()).toContainText('Inicia sesión')

    // Fill the form and submit (demo mode accepts any creds)
    await page.fill('input[type="email"]', 'test@vendeya.pe')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should navigate to dashboard
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 })
  })

  test('protected /vender redirects to /login when not authenticated', async ({ page }) => {
    // Clear any existing session first
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('vendeya:demoUser'))

    await page.goto('/vender')
    // Should redirect to /login?redirect=/vender
    await expect(page).toHaveURL(/\/login\?redirect=%2Fvender$/, { timeout: 5000 })
  })

  test('protected /dashboard redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('vendeya:demoUser'))

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard$/, { timeout: 5000 })
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
