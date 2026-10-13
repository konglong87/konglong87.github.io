/* Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:1313';
const OUTPUT = process.env.TEST_OUTPUT || '.build/acceptance';
const PROJECTS = [
  { slug: 'go-e2e', title: 'go-e2e' },
  { slug: 'feeling-to-jargon', title: 'Feeling to Jargon' },
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'compact-desktop', width: 1024, height: 900 },
  { name: 'tablet', width: 768, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small-mobile', width: 360, height: 800 },
];

async function verifyViewport(page) {
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  assert.ok(dimensions.content <= dimensions.width + 1,
    `Horizontal overflow: ${JSON.stringify(dimensions)} at ${page.url()}`);
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  assert.deepEqual(duplicates, [], 'IDs must be unique');
}

async function visit(page, route) {
  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, `HTTP error on ${route}`);
  await verifyViewport(page);
}

async function snapshot(page, name, fullPage = true) {
  await page.screenshot({ path: path.join(OUTPUT, `${name}.png`), fullPage, animations: "disabled" });
}

(async () => {
  fs.mkdirSync(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = [];
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport, colorScheme: 'light' });
      const page = await context.newPage();
      const errors = [];
      const failures = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(BASE) && response.status() >= 400) failures.push(response.url());
      });

      await visit(page, '/');
      assert.equal(await page.locator('.projects-featured').count(), 1);
      assert.equal(await page.locator('.projects-featured .project-card').count(), PROJECTS.length);
      assert.deepEqual(await page.locator('.project-card h3').allTextContents(), PROJECTS.map(project => project.title));
      assert.ok((await page.locator('main').innerText()).includes('陛下的规矩'));
      await page.locator('main img').evaluate(image => image.decode());
      assert.ok(await page.locator('.btn-dark').evaluate(button => getComputedStyle(button).backgroundImage.includes('theme.png')));
      if (['desktop', 'mobile'].includes(viewport.name)) await snapshot(page, `home-${viewport.name}`);
      await page.getByRole('button', { name: '切换深色模式' }).click();
      assert.equal(await page.locator('html').evaluate(element => element.classList.contains('dark')), true);
      assert.equal(await page.getByRole('button', { name: '切换深色模式' }).getAttribute('aria-pressed'), 'true');
      await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgba(0, 0, 0, 0.9)');
      if (viewport.name === 'desktop') await snapshot(page, 'home-dark');
      await page.reload();
      assert.equal(await page.locator('html').evaluate(element => element.classList.contains('dark')), true, 'Theme persists');
      await page.getByRole('button', { name: '切换深色模式' }).click();

      // Actual mobile/desktop navigation, not just direct URL checks.
      if (viewport.width < 1024) {
        await page.getByRole('button', { name: '打开导航' }).click();
        await page.waitForFunction(() => document.getElementById('site-navigation').getBoundingClientRect().top === 0);
        const projectLink = page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '项目', exact: true });
        const box = await projectLink.boundingBox();
        assert.ok(box.y >= 0 && box.y + box.height <= viewport.height, 'Project navigation fits on-screen');
        if (viewport.name === 'mobile') await snapshot(page, 'mobile-navigation', false);
        await projectLink.click();
      } else {
        await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '项目', exact: true }).click();
      }
      await page.waitForURL(`${BASE}/projects/`);
      assert.equal(await page.locator('h1').innerText(), '精选项目');
      assert.equal(await page.locator('.projects-list .project-card').count(), PROJECTS.length);
      await verifyViewport(page);
      if (['desktop', 'mobile'].includes(viewport.name)) await snapshot(page, `projects-${viewport.name}`);

      for (const project of PROJECTS) {
        await page.locator('.project-card h3 a').filter({ hasText: project.title }).click();
        await page.waitForURL(`${BASE}/projects/${project.slug}/`);
        assert.equal(await page.locator('h1').innerText(), project.title);
        assert.ok((await page.title()).startsWith(project.title));
        assert.equal(await page.locator('.project-link-primary').getAttribute('href'), `https://github.com/konglong87/${project.slug}`);
        assert.equal(await page.locator('.project-link-primary').getAttribute('target'), '_blank');
        if (project.slug === 'go-e2e') {
          await page.locator('.project-content img').evaluate(image => image.decode());
          assert.ok(await page.locator('.project-content img').evaluate(image => image.naturalWidth > 1000));
        } else {
          assert.ok((await page.locator('.project-content').innerText()).includes('两个叶子包'));
        }
        await verifyViewport(page);
        if (['desktop', 'mobile'].includes(viewport.name)) {
          await snapshot(page, `${project.slug}-${viewport.name}`, false);
          await snapshot(page, `${project.slug}-${viewport.name}-full`);
        }
        await page.getByRole('button', { name: '切换深色模式' }).click();
        await verifyViewport(page);
        if (viewport.name === 'desktop') await snapshot(page, `${project.slug}-dark`, false);
        await page.getByRole('button', { name: '切换深色模式' }).click();
        await page.locator('.project-related .projects-back').click();
        await page.waitForURL(`${BASE}/projects/`);
      }

      await visit(page, '/page/2/');
      assert.equal(await page.locator('.projects-featured').count(), 0, 'Featured section only appears on the first home page');
      await visit(page, '/post/陛下的规矩/');
      assert.equal(await page.locator('h1').innerText(), '陛下的规矩');
      assert.ok((await page.locator('article').innerText()).includes('共同承担家务'));
      assert.deepEqual(errors, [], 'No browser runtime errors');
      assert.deepEqual(failures, [], 'No broken internal assets');
      report.push({ viewport: viewport.name, status: 'passed', errors, failures });
      await context.close();
    }
    fs.writeFileSync(path.join(OUTPUT, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
