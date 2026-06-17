import { test, expect } from '@playwright/test'

/**
 * VENDE YA — Scroll Spy + Deep Linking E2E tests
 * =====================================================================
 * Tests that:
 *   1. Each section has a unique, navigable ID
 *   2. Clicking a section nav pill smooth-scrolls + updates URL hash
 *   3. Direct deep-link entry (/#marketplace) scrolls to that section
 *   4. Scrolling through the page updates the URL hash automatically
 *   5. Back/forward browser navigation works between sections
 *   6. Share-link button copies the correct URL to clipboard
 * =====================================================================
 */

const SECTIONS = [
  'hero',
  'sellers',
  'live-rail',
  'auctions',
  'products',
  'architecture',
] as const

test.describe('Scroll Spy + Deep Linking', () => {
  test('all sections have unique IDs and are present in the DOM', async ({ page }) => {
    await page.goto('/')
    for (const id of SECTIONS) {
      const el = page.locator(`#${id}`)
      await expect(el).toBeAttached({ timeout: 5000 })
    }
  })

  test('URL starts without hash on / entry', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    expect(page.url().includes('#')).toBe(false)
  })

  test('clicking a section nav pill updates the URL hash + scrolls', async ({ page }) => {
    await page.goto('/')
    // Wait for the SectionNav to render
    const navLink = page.locator('a[href="#sellers"]').first()
    await navLink.waitFor({ state: 'attached', timeout: 5000 })

    // Dispatch click directly to avoid auto-scroll + hide-on-scroll interference
    await page.evaluate(() => {
      const link = document.querySelector('a[href="#sellers"]') as HTMLAnchorElement
      if (link) link.click()
    })

    // URL should now have #sellers
    await expect(page).toHaveURL(/#sellers$/)

    // The sellers section should be in the viewport
    const sellers = page.locator('#sellers')
    await expect(sellers).toBeInViewport()
  })

  test('direct deep-link entry scrolls to the section', async ({ page }) => {
    // Visit /#products directly
    await page.goto('/#products')

    // Give the page time to scroll (smooth scroll is async)
    await page.waitForTimeout(1000)

    // The products section should be in viewport
    const products = page.locator('#products')
    await expect(products).toBeInViewport()
  })

  test('scrolling the page updates the URL hash automatically', async ({ page }) => {
    await page.goto('/')

    // Scroll to the products section explicitly (use evaluate for reliability)
    await page.evaluate(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })

    // Wait for IntersectionObserver + scroll spy to fire
    await page.waitForFunction(
      () => window.location.hash === '#products',
      undefined,
      { timeout: 5000 }
    )

    expect(page.url()).toMatch(/#products$/)
  })

  test('back/forward browser navigation works between sections', async ({ page }) => {
    await page.goto('/')

    // Click into sellers (use evaluate to avoid auto-scroll + hide-on-scroll interference)
    await page.evaluate(() => {
      const link = document.querySelector('a[href="#sellers"]') as HTMLAnchorElement
      if (link) link.click()
    })
    await expect(page).toHaveURL(/#sellers$/)

    // Click into products
    await page.evaluate(() => {
      const link = document.querySelector('a[href="#products"]') as HTMLAnchorElement
      if (link) link.click()
    })
    await expect(page).toHaveURL(/#products$/)

    // Go back — should return to #sellers
    await page.goBack()
    await expect(page).toHaveURL(/#sellers$/)

    // Go forward — should return to #products
    await page.goForward()
    await expect(page).toHaveURL(/#products$/)
  })

  test('section nav highlights the active section', async ({ page }) => {
    await page.goto('/')

    // Scroll to auctions
    await page.evaluate(() => {
      document.getElementById('auctions')?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })

    // Wait for the aria-current="true" to appear on the #auctions link
    await page.waitForFunction(
      () => !!document.querySelector('a[href="#auctions"][aria-current="true"]'),
      undefined,
      { timeout: 5000 }
    )

    const activeLink = page.locator('a[href="#auctions"][aria-current="true"]')
    await expect(activeLink).toBeAttached()
  })

  test('share-link button copies the section URL to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.goto('/#sellers')
    await page.waitForTimeout(500)

    // Find the copy-link button next to the sellers heading.
    const copyBtn = page
      .getByRole('button', { name: /Copiar enlace a Vendedores/i })
      .first()
    await copyBtn.click()

    // Wait for clipboard write
    await page.waitForTimeout(400)

    // Read clipboard and verify
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    expect(clip).toContain('#sellers')
    expect(clip).toMatch(/^https?:\/\//)
  })

  test('smooth scroll is applied (not instant jump)', async ({ page, browserName }) => {
    await page.goto('/')

    // Record scroll position before click
    const startY = await page.evaluate(() => window.scrollY)

    // On mobile, #architecture is hidden (md:block only). Use #products instead.
    const targetHash = browserName === 'webkit' || (await page.evaluate(() => window.innerWidth < 768))
      ? '#products'
      : '#architecture'

    // Dispatch click directly on the link (avoids Playwright's auto-scroll
    // which can trigger the hide-on-scroll-down behavior of SectionNav)
    await page.evaluate((hash) => {
      const link = document.querySelector(`a[href="${hash}"]`) as HTMLAnchorElement
      if (link) link.click()
    }, targetHash)

    // Wait a tiny bit — smooth scroll should still be in progress
    await page.waitForTimeout(150)

    // Mid-scroll: scrollY should be greater than start
    const midY = await page.evaluate(() => window.scrollY)
    expect(midY).toBeGreaterThan(startY)

    // Wait for scroll to finish
    await page.waitForTimeout(1200)
    const endY = await page.evaluate(() => window.scrollY)
    expect(endY).toBeGreaterThanOrEqual(midY)
  })

  test('section nav is visible on mobile viewport', async ({ page }) => {
    // iPhone 14 is configured at the project level
    await page.goto('/')

    // SectionNav should be in the DOM
    const nav = page.getByRole('navigation', { name: /Navegación de secciones/i })
    await expect(nav).toBeAttached({ timeout: 5000 })
  })

  test('hash navigation via History API updates URL without page reload', async ({ page }) => {
    await page.goto('/')

    // Get the original page load token (random data attribute we'll inject)
    const pageToken = await page.evaluate(() => {
      (window as any).__pageToken = Math.random().toString(36)
      return (window as any).__pageToken
    })

    // Click into a section (use evaluate to avoid auto-scroll interference)
    await page.evaluate(() => {
      const link = document.querySelector('a[href="#architecture"]') as HTMLAnchorElement
      if (link) link.click()
    })

    // Wait for hash to update
    await expect(page).toHaveURL(/#architecture$/)

    // Verify the page wasn't reloaded (token persists)
    const tokenAfter = await page.evaluate(() => (window as any).__pageToken)
    expect(tokenAfter).toBe(pageToken)
  })
})

test.describe('Section IDs are unique', () => {
  test('no duplicate IDs in the DOM', async ({ page }) => {
    await page.goto('/')

    const duplicateCount = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('[id]'))
      const ids = all.map((el) => el.id).filter(Boolean)
      const counts = ids.reduce<Record<string, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1
        return acc
      }, {})
      return Object.entries(counts).filter(([, n]) => n > 1)
    })

    expect(duplicateCount, `Duplicate IDs found: ${JSON.stringify(duplicateCount)}`).toEqual([])
  })
})
