import { test, expect } from '@playwright/test'

const routes = {
  home: 'Overview', roadmap: '12-week path', dsa: 'DSA Lab',
  hld: 'System Design', lld: 'Object Design', workspace: 'Visual Workspace',
  booking: 'Living system', appendix: 'Appendix',
}
const stages = ['understand', 'predict', 'experiment', 'explain', 'apply']
const widths = [240, 280, 320, 360, 371, 390, 430, 600, 780, 781, 820, 900, 1050, 1280, 1440, 1920, 2560]

test.beforeEach(async ({ page }) => {
  await page.route('https://*.supabase.co/**', route => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem('codyssey-website-walkthrough-seen-v3', 'true')
    localStorage.setItem('codyssey-workbench-hint-v1', 'seen')
    localStorage.setItem('codyssey-studio-motion', 'off')
  })
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  await page.locator('.study-home').waitFor()
})

async function openRoute(page, route) {
  if (await page.locator('.mobile-dock').isVisible() && !await page.locator('.sidebar').isVisible()) {
    await page.getByRole('button', { name: 'More', exact: true }).click()
  }
  await page.locator(`.sidebar .nav-item[aria-label="${routes[route]}"]`).click()
  await page.locator(`.studio-shell[data-view="${route}"]`).waitFor()
  if (['dsa', 'hld', 'lld'].includes(route)) {
    await page.locator(`.workbench-page[data-track="${route}"]`).waitFor()
  }
}

async function openStage(page, stage) {
  await page.locator('.wb-stages button').filter({ hasText: stage }).click()
  await page.getByRole('region', { name: stage[0].toUpperCase() + stage.slice(1), exact: true }).waitFor()
}

async function fitIssues(page) {
  return page.evaluate(async () => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const width = document.documentElement.clientWidth
    const failures = []
    const identify = e => `${e.tagName.toLowerCase()}.${e.className}: ${e.textContent.trim().slice(0, 65)}`
    const header = document.querySelector('.topbar')
    const headerRect = header.getBoundingClientRect()
    if (getComputedStyle(header).position !== 'fixed' || Math.abs(headerRect.top) > 1 || Math.abs(headerRect.right - width) > 1) failures.push('Header is not fixed to the viewport')
    const main = document.querySelector('main')
    if (Math.abs(headerRect.left - main.getBoundingClientRect().left) > 1) failures.push('Header and navigation widths are out of sync')
    if (Math.abs(parseFloat(getComputedStyle(main).paddingTop) - headerRect.height) > 1) failures.push('Page does not reserve actual header height')
    if (document.documentElement.scrollWidth > width + 1) failures.push(`Document overflows: ${document.documentElement.scrollWidth} > ${width}`)
    window.scrollBy(10000, 0)
    if (Math.abs(scrollX) > 1) failures.push(`Page scrolls horizontally: ${scrollX}`)

    for (const e of document.querySelectorAll('button, input, select, textarea, .headline-line > span')) {
      const r = e.getBoundingClientRect()
      if (!r.width || !r.height) continue
      let localScroll = false
      let clipped = false
      for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
        const style = getComputedStyle(p)
        if (['auto', 'scroll'].includes(style.overflowX) && p.scrollWidth > p.clientWidth + 1 && p.matches('[role="region"][tabindex], .pattern-list, .workspace-stage-wrap, .workspace-modes, .booking-diagram-scroll')) {
          localScroll = true
          break
        }
        const bounds = p.getBoundingClientRect()
        if (['hidden', 'clip'].includes(style.overflowX) && (r.left < bounds.left - 1 || r.right > bounds.right + 1)) clipped = true
      }
      if (localScroll) continue
      const isClippedMotionReveal = document.documentElement.dataset.motion === 'on' && e.matches('.headline-line > span')
      if (r.left < -1 || r.right > width + 1 || (clipped && !isClippedMotionReveal)) failures.push(`Clipped or out of bounds: ${identify(e)}`)
      if (e.tagName === 'BUTTON' && e.scrollWidth > e.clientWidth + 1) {
        const buttonBounds = e.getBoundingClientRect()
        const hasOverflowingContent = [...e.children].some(child => {
          const style = getComputedStyle(child)
          if (style.position === 'absolute' || style.display === 'none' || style.visibility === 'hidden') return false
          const childBounds = child.getBoundingClientRect()
          if (!childBounds.width || !childBounds.height) return false
          return childBounds.left < buttonBounds.left - 1 || childBounds.right > buttonBounds.right + 1
        })
        const hasDirectText = [...e.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
        if (hasOverflowingContent || hasDirectText) failures.push(`Button content overflows: ${identify(e)}`)
      }
    }
    return failures
  })
}

for (const [route] of Object.entries(routes)) {
  test(`${route} fits the viewport with fixed navigation`, async ({ page }) => {
    await openRoute(page, route)
    const problems = []
    for (const collapsed of [false, true]) {
      await page.setViewportSize({ width: 1280, height: 720 })
      const shell = page.locator('.studio-shell')
      if ((await shell.getAttribute('class')).includes('sidebar-collapsed') !== collapsed) {
        await page.locator('.sidebar-collapse').click()
      }
      for (const width of widths) {
        await page.setViewportSize({ width, height: width < 781 ? 620 : 600 })
        for (const stage of ['dsa', 'hld', 'lld'].includes(route) ? stages : ['page']) {
          if (stage !== 'page') await openStage(page, stage)
          await page.evaluate(() => scrollTo(0, 160))
          const issues = await fitIssues(page)
          if (issues.length) problems.push({ width, collapsed, stage, issues })
        }
        const sidebar = page.locator('.sidebar')
        if (width >= 781) {
          const position = await sidebar.evaluate(e => ({ top: e.getBoundingClientRect().top, height: e.getBoundingClientRect().height, fixed: getComputedStyle(e).position === 'fixed' }))
          expect(position).toEqual({ top: 0, height: 600, fixed: true })
        } else {
          await page.getByRole('button', { name: 'More', exact: true }).click()
          const menu = await sidebar.boundingBox()
          const header = await page.locator('.topbar').boundingBox()
          const dock = await page.locator('.mobile-dock').boundingBox()
          expect(menu.y).toBeGreaterThanOrEqual(header.height)
          expect(menu.y + menu.height).toBeLessThanOrEqual(dock.y)
          expect(await sidebar.locator('.nav-item:visible').count()).toBe(8)
          const issues = await fitIssues(page)
          if (issues.length) problems.push({ width, collapsed, stage: 'mobile menu', issues })
          await page.getByRole('button', { name: 'Close menu', exact: true }).click()
        }
      }
    }
    expect(problems, JSON.stringify(problems)).toEqual([])
  })
}

for (const track of ['dsa', 'hld', 'lld']) {
  test(`all ${track} lessons fit compact screens`, async ({ page }) => {
    await openRoute(page, track)
    const problems = []
    for (let week = 1; week <= 12; week++) {
      await page.getByLabel('Select course week').selectOption(String(week))
      await expect(page.locator('.wb-heading .section-kicker')).toContainText(String(week).padStart(2, '0'))
      for (const width of [280, 390, 820]) {
        await page.setViewportSize({ width, height: 640 })
        for (const stage of stages) {
          await openStage(page, stage)
          const issues = await fitIssues(page)
          if (issues.length) problems.push({ week, width, stage, issues })
        }
      }
    }
    expect(problems, JSON.stringify(problems)).toEqual([])
  })
}

test('every DSA week exposes visual anatomy and operation costs', async ({ page }) => {
  await openRoute(page, 'dsa')
  await openStage(page, 'understand')
  for (let week = 1; week <= 12; week++) {
    await page.getByLabel('Select course week').selectOption(String(week))
    await expect(page.locator('.dsa-concept-visual')).toBeVisible()
    await expect(page.locator('.dsa-concept-visual > header h3')).not.toHaveText('')
    const operations = page.locator('.concept-operation-grid button')
    expect(await operations.count()).toBeGreaterThanOrEqual(2)
    await operations.last().click()
    await expect(operations.last()).toHaveAttribute('aria-pressed', 'true')
    for (const width of [280, 820]) {
      await page.setViewportSize({ width, height: 700 })
      expect(await fitIssues(page)).toEqual([])
    }
  }
})

test('mobile touch, rotation, and short-screen menus remain reachable', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'Playwright does not emulate mobile Firefox.')
  const context = await page.context().browser().newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  })
  await context.route('https://*.supabase.co/**', route => route.abort())
  await context.addInitScript(() => {
    localStorage.setItem('codyssey-website-walkthrough-seen-v3', 'true')
    localStorage.setItem('codyssey-studio-motion', 'on')
  })
  const phone = await context.newPage()
  try {
    await phone.goto('http://127.0.0.1:5199')
    await phone.locator('.study-home').waitFor()
    for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 320, height: 240 }, { width: 280, height: 320 }]) {
      await phone.setViewportSize(size)
      await phone.evaluate(() => scrollTo(0, 400))
      await phone.waitForTimeout(500)
      expect(await fitIssues(phone)).toEqual([])
      if (size.width <= 780) {
        if (size.width === 320) {
          expect((await phone.locator('.topbar').boundingBox()).height).toBe(66)
          await phone.locator('.motion-toggle').tap()
          expect(await fitIssues(phone)).toEqual([])
          expect((await phone.locator('.topbar').boundingBox()).height).toBe(66)
          await phone.locator('.motion-toggle').tap()
        }
        await phone.getByRole('button', { name: 'More', exact: true }).tap()
        const sidebar = await phone.locator('.sidebar').boundingBox()
        const header = await phone.locator('.topbar').boundingBox()
        expect(sidebar.y).toBeGreaterThanOrEqual(header.height)
        await phone.locator('.sidebar').evaluate(e => { e.scrollTop = e.scrollHeight })
        const lastItem = await phone.locator('.sidebar .nav-item[aria-label="Appendix"]').boundingBox()
        expect(lastItem.y).toBeGreaterThanOrEqual(sidebar.y)
        expect(lastItem.y + lastItem.height).toBeLessThanOrEqual(sidebar.y + sidebar.height)
        await phone.locator('.sidebar .nav-item[aria-label="Appendix"]').tap()
        await phone.locator('.studio-shell[data-view="appendix"]').waitFor()
        expect(await fitIssues(phone)).toEqual([])
      }
    }
  } finally {
    await context.close()
  }
})

test('week one DSA patterns follow prerequisite order', async ({ page }) => {
  await openRoute(page, 'dsa')
  await page.getByLabel('Select course week').selectOption('1')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.locator('.pattern-list button')).toHaveCount(7)
  await expect(page.locator('.pattern-list button span')).toHaveText([
    'Programming and Complexity Basics',
    'Python Collections',
    'Linked List Fundamentals',
    'Fast and Slow Pointer',
    'Linked List Merge and Transformation',
    'Doubly Linked Lists',
    'Linked List Pointer Rewiring',
  ])
})

test('profile, notes, references, and walkthrough fit compact screens', async ({ page }) => {
  const problems = []
  for (const width of [240, 320, 390, 820, 1280]) {
    await page.setViewportSize({ width, height: 600 })
    await page.getByRole('button', { name: 'Open profile', exact: true }).click()
    await page.locator('.profile-panel').waitFor()
    const profileIssues = await fitIssues(page)
    if (await page.locator('.profile-panel').evaluate(e => e.scrollWidth > e.clientWidth + 1)) profileIssues.push('Profile scrolls horizontally')
    if (profileIssues.length) problems.push({ width, overlay: 'profile', issues: profileIssues })
    await page.getByRole('button', { name: 'Close profile', exact: true }).click()
    await openRoute(page, 'dsa')
    for (const name of ['Reasoning notes', 'Read deeper']) {
      await page.locator('.wb-tools button').filter({ hasText: name }).click()
      await page.locator('.wb-drawer').waitFor()
      const issues = await fitIssues(page)
      if (issues.length) problems.push({ width, overlay: name, issues })
      await page.getByRole('button', { name: 'Close reasoning drawer', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Open website walkthrough', exact: true }).click()
    await page.locator('.coach-popup').waitFor()
    const tourSteps = 12
    for (let step = 0; step < tourSteps; step++) {
      const issues = await fitIssues(page)
      if (issues.length) problems.push({ width, overlay: `walkthrough ${step}`, issues })
      const popup = await page.locator('.coach-popup').boundingBox()
      expect(popup.y).toBeGreaterThanOrEqual(0)
      expect(popup.y + popup.height).toBeLessThanOrEqual(600)
      if (step < tourSteps - 1) await page.locator('.coach-next').click()
    }
    await page.getByRole('button', { name: 'Close walkthrough', exact: true }).click()
  }
  expect(problems, JSON.stringify(problems)).toEqual([])
})

test('website walkthrough auto-opens once and remains manually available', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const firstVisit = await context.newPage()
  await firstVisit.goto('/')
  await firstVisit.locator('.coach-popup').waitFor()
  await expect(firstVisit.locator('.coach-heading')).toContainText('1/12')
  await firstVisit.getByRole('button', { name: 'Close walkthrough', exact: true }).click()
  await firstVisit.reload()
  await expect(firstVisit.locator('.coach-popup')).toHaveCount(0)
  await firstVisit.getByRole('button', { name: 'Open website walkthrough', exact: true }).click()
  await expect(firstVisit.locator('.coach-heading')).toContainText('1/12')
  await context.close()
})

test('fixed shell survives wheel input and workspace fullscreen', async ({ page }) => {
  await openRoute(page, 'workspace')
  await page.locator('.workspace-shell').waitFor()
  const originalBoard = await page.locator('.workspace-node').count()
  await page.getByRole('button', { name: 'Add node' }).click()
  await expect(page.locator('.workspace-node')).toHaveCount(originalBoard + 1)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.locator('.workspace-node')).toHaveCount(originalBoard)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.locator('.workspace-node')).toHaveCount(originalBoard + 1)
  for (const name of ['Undo', 'Redo', 'Enter fullscreen']) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveText('')
  }
  await page.mouse.move(1100, 400)
  await page.mouse.wheel(800, 500)
  expect(await fitIssues(page)).toEqual([])
  const supported = await page.evaluate(() => document.fullscreenEnabled)
  test.skip(!supported, 'This browser does not expose the element Fullscreen API.')
  const fullscreenBoard = await page.locator('.workspace-node').count()
  for (const width of [1280, 390, 280]) {
    await page.setViewportSize({ width, height: 600 })
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.classList.contains('workspace-shell'))).toBe(true)
    const box = await page.locator('.workspace-shell').boundingBox()
    const screen = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))
    expect(box.x).toBe(0)
    expect(box.y).toBe(0)
    expect(box.width).toBe(screen.width)
    expect(box.height).toBe(screen.height)
    expect(await page.locator('.workspace-node').count()).toBe(fullscreenBoard)
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true)
    expect(await fitIssues(page)).toEqual([])
  }
})

test('motion and rapid navigation never create page-level horizontal scrolling', async ({ page }) => {
  await page.locator('.motion-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'on')
  for (const width of [240, 280, 320, 390, 780, 781, 820, 1024]) {
    await page.setViewportSize({ width, height: 620 })
    for (const route of ['home', 'dsa', 'workspace', 'booking', 'roadmap']) {
      await openRoute(page, route)
      if (route === 'dsa') {
        for (const stage of stages) {
          await openStage(page, stage)
          expect(await fitIssues(page)).toEqual([])
        }
      } else {
        expect(await fitIssues(page)).toEqual([])
      }
      await page.evaluate(() => {
        window.scrollBy(10000, 0)
        document.documentElement.scrollLeft = 10000
        document.body.scrollLeft = 10000
      })
      expect(await page.evaluate(() => ({
        window: scrollX,
        root: document.documentElement.scrollLeft,
        body: document.body.scrollLeft,
      }))).toEqual({ window: 0, root: 0, body: 0 })
    }
  }
})
