/* Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { projects: PROJECTS } = require('./project-fixtures.json');

const BASE = (process.env.TEST_BASE_URL || 'http://127.0.0.1:1313').replace(/\/$/, '');
const OUTPUT = process.env.TEST_OUTPUT || '.build/acceptance';
const SCREENSHOT_VIEWPORTS = new Set(['desktop', 'mobile']);
const VIEWPORTS = [
  { name: 'wide-desktop', width: 1920, height: 1080 },
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'compact-desktop', width: 1024, height: 900 },
  { name: 'tablet', width: 768, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small-mobile', width: 360, height: 800 },
  { name: 'minimum-mobile', width: 320, height: 700 },
  { name: 'landscape', width: 844, height: 390 },
];

function observe(page) {
  const errors = [];
  const failures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(`${BASE}/`) && response.status() >= 400) {
      failures.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  page.on('requestfailed', request => failures.push(`${request.failure().errorText}: ${request.url()}`));
  return { errors, failures };
}

async function verifyViewport(page) {
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth, content: document.documentElement.scrollWidth,
  }));
  assert.ok(dimensions.content <= dimensions.width + 1,
    `Horizontal overflow: ${JSON.stringify(dimensions)} at ${page.url()}`);
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  assert.deepEqual(duplicates, [], 'IDs must be unique');
}

async function verifySEO(page, route) {
  const expectedPath = route.includes('/page/') ? '/' : new URL(`${BASE}${route}`).pathname;
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert.equal(new URL(canonical).pathname, expectedPath, `Canonical mismatch on ${route}`);
  assert.ok((await page.locator('title').innerText()).length > 8, `Weak title on ${route}`);
  assert.ok((await page.locator('meta[name="description"]').getAttribute('content')).length > 0, `Missing description on ${route}`);
  assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), canonical);
  assert.ok((await page.locator('meta[property="og:image"]').getAttribute('content')).startsWith('http'));
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  if (!route.includes('/page/')) assert.ok(!robots.includes('noindex'), `Unexpected noindex: ${route}`);
  const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const types = new Set();
  const walk = value => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== 'object') return;
    const type = value['@type'];
    (Array.isArray(type) ? type : [type]).filter(Boolean).forEach(item => types.add(item));
    Object.values(value).forEach(walk);
  };
  walk(structured);
  assert.ok(types.has('Person') && types.has('WebSite'), `Incomplete JSON-LD on ${route}`);
  if (route.startsWith('/projects/') && route !== '/projects/') {
    assert.ok(types.has('SoftwareSourceCode') && types.has('Article'), `Project JSON-LD missing on ${route}`);
  }
}

async function visit(page, route) {
  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, `HTTP error on ${route}`);
  await verifySEO(page, route);
  await verifyViewport(page);
}

async function snapshot(page, name, fullPage = true) {
  await page.screenshot({ path: path.join(OUTPUT, `${name}.png`), fullPage, animations: 'disabled' });
}

async function toggleTheme(page, dark) {
  const button = page.getByRole('button', { name: '切换深色模式' });
  await button.click();
  assert.equal(await page.locator('html').evaluate(element => element.classList.contains('dark')), dark);
  assert.equal(await button.getAttribute('aria-pressed'), String(dark));
}

async function verifyArticle(page, project, viewport) {
  await page.locator('.project-card h3 a').getByText(project.title, { exact: true }).click();
  await page.waitForURL(`${BASE}/projects/${project.slug}/`, { waitUntil: 'networkidle' });
  await verifySEO(page, `/projects/${project.slug}/`);
  assert.equal(await page.locator('h1').innerText(), project.title);
  assert.ok((await page.title()).startsWith(project.title));
  assert.equal(await page.locator('.project-answer').count(), 1);
  assert.ok((await page.locator('.project-answer').innerText()).length > 80);
  const viewCount = page.locator('[data-goatcounter-count]');
  assert.equal(await viewCount.count(), 1);
  assert.equal(await viewCount.getAttribute('data-goatcounter-path'), `/projects/${project.slug}/`);
  const repoLink = page.locator('.project-link-primary');
  assert.equal(await repoLink.getAttribute('href'), `https://github.com/konglong87/${project.repo}`);
  assert.equal(await repoLink.getAttribute('target'), '_blank');
  assert.ok((await repoLink.getAttribute('rel')).includes('noopener'));
  const content = await page.locator('.project-content').innerText();
  for (const required of project.required_content) assert.ok(content.includes(required), `${project.slug}: ${required}`);
  if (project.site) assert.equal(await page.locator('.project-links a').filter({ hasText: '阅读知识站' }).getAttribute('href'), project.site);
  const related = PROJECTS.filter(item => item.slug !== project.slug);
  assert.deepEqual(await page.locator('.project-related-list li > a').allTextContents(), related.map(item => `${item.title} →`));
  assert.deepEqual(await page.locator('.project-related-list li > a').evaluateAll(links => links.map(link => new URL(link.href).pathname)),
    related.map(item => `/projects/${item.slug}/`));
  for (const image of await page.locator('.project-content img').all()) {
    await image.evaluate(node => node.decode());
    assert.ok(await image.evaluate(node => node.naturalWidth > 0 && node.width > 0 && node.height > 0),
      `${project.slug}: project images must load with visible dimensions`);
  }
  await verifyViewport(page);
  if (SCREENSHOT_VIEWPORTS.has(viewport.name)) {
    await snapshot(page, `${project.slug}-${viewport.name}`, false);
    await snapshot(page, `${project.slug}-${viewport.name}-full`);
  }
  await toggleTheme(page, true);
  await verifyViewport(page);
  if (viewport.name === 'desktop') await snapshot(page, `${project.slug}-dark`, false);
  await toggleTheme(page, false);
  // Follow a real related-project link before using the return link.
  await page.locator('.project-related-list li > a').first().click();
  await page.waitForURL(`${BASE}/projects/${related[0].slug}/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').innerText(), related[0].title);
  await page.locator('.project-related .projects-back').click();
  await page.waitForURL(`${BASE}/projects/`, { waitUntil: 'networkidle' });
}

async function verifyAtViewport(browser, viewport) {
  const context = await browser.newContext({ viewport, colorScheme: 'light' });
  try {
    const page = await context.newPage();
    const observed = observe(page);
    await visit(page, '/');
    assert.equal(await page.locator('.projects-featured').count(), 1);
    assert.equal(await page.locator('.projects-featured .project-card').count(), PROJECTS.length);
    assert.deepEqual(await page.locator('.project-card h3').allTextContents(), PROJECTS.map(project => project.title));
    assert.ok((await page.locator('main').innerText()).includes('陛下的规矩'));
    assert.equal(await page.locator('.home-banner-slogan').innerText(), '从学习到实践，把想法做成项目');
    assert.equal(await page.locator('.home-banner-subtitle').innerText(), '公开项目、AI 学习路径与实践记录，欢迎从一个真实项目开始。');
    assert.equal(await page.locator('.home-banner-slogan').evaluate(node => Boolean(node.closest('a'))), false,
      'Homepage slogan must be decorative text, not a navigation link');
    const homeEntryCards = page.locator('.home-entry-card');
    assert.equal(await homeEntryCards.count(), 3);
    assert.deepEqual(await homeEntryCards.evaluateAll(cards => cards.map(card => card.querySelector('.home-entry-label')?.textContent)),
      ['先学 AI', '做出项目', '提升效率']);
    const learningLink = page.locator('.home-banner-learning');
    assert.equal(await learningLink.getAttribute('href'), 'https://konglong87.github.io/anything-ai/');
    assert.equal(await learningLink.getAttribute('target'), '_blank');
    assert.ok((await learningLink.getAttribute('rel')).includes('noopener'));
    const homeViewCount = page.locator('[data-goatcounter-count]');
    assert.equal(await homeViewCount.count(), 1);
    assert.equal(await homeViewCount.getAttribute('data-goatcounter-path'), '/');
    assert.equal(await homeViewCount.getAttribute('data-goatcounter-label'), '首页访问量');
    const bannerProjects = page.locator('.home-banner-projects');
    assert.equal(await bannerProjects.getAttribute('href'), '/projects/');
    assert.equal(await bannerProjects.getByText('从精选项目开始', { exact: true }).count(), 1);
    await bannerProjects.click();
    await page.waitForURL(`${BASE}/projects/`, { waitUntil: 'networkidle' });
    await visit(page, '/');
    await page.locator('main img').evaluate(image => image.decode());
    assert.ok(await page.locator('.theme-icon').evaluate(icon => getComputedStyle(icon).backgroundImage.includes('theme.png')));
    if (SCREENSHOT_VIEWPORTS.has(viewport.name)) await snapshot(page, `home-${viewport.name}`);
    await toggleTheme(page, true);
    await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgba(0, 0, 0, 0.9)');
    if (viewport.name === 'desktop') await snapshot(page, 'home-dark');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').evaluate(element => element.classList.contains('dark')), true, 'Theme persists');
    await toggleTheme(page, false);

    if (viewport.width < 1024) {
      const menuButton = page.getByRole('button', { name: '打开导航' });
      await menuButton.click();
      await page.waitForFunction(() => document.documentElement.classList.contains('open'));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('html').evaluate(element => element.classList.contains('open')), false,
        'Escape must close the mobile menu');
      await menuButton.click();
      await page.waitForFunction(() => document.getElementById('site-navigation').getBoundingClientRect().top === 0);
      const link = page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '精选项目', exact: true });
      const box = await link.boundingBox();
      assert.ok(box.y >= 0 && box.y + box.height <= viewport.height, 'Project navigation fits on-screen');
      if (viewport.name === 'mobile') await snapshot(page, 'mobile-navigation', false);
      await link.click();
    } else {
      await page.locator('.home-banner-projects').click();
    }
    await page.waitForURL(`${BASE}/projects/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').innerText(), '精选项目');
    assert.equal(await page.locator('.projects-list .project-card').count(), PROJECTS.length);
    assert.deepEqual(await page.locator('.project-card h3').allTextContents(), PROJECTS.map(project => project.title));
    await verifyViewport(page);
    if (SCREENSHOT_VIEWPORTS.has(viewport.name)) await snapshot(page, `projects-${viewport.name}`);
    for (const project of PROJECTS) await verifyArticle(page, project, viewport);

    await visit(page, '/');
    const keyboardLink = page.locator('.projects-featured .project-card h3 a').last();
    await keyboardLink.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(`${BASE}/projects/${PROJECTS.at(-1).slug}/`, { waitUntil: 'networkidle' });
    await visit(page, '/page/2/');
    assert.equal(await page.locator('.projects-featured').count(), 0, 'Featured section only appears on the first home page');
    await visit(page, '/post/陛下的规矩/');
    assert.equal(await page.locator('h1').innerText(), '陛下的规矩');
    assert.ok((await page.locator('article').innerText()).includes('共同承担家务'));
    assert.deepEqual(observed.errors, [], 'No browser runtime errors');
    assert.deepEqual(observed.failures, [], 'No failed requests or broken assets');
    return { viewport: viewport.name, status: 'passed', ...observed };
  } finally { await context.close(); }
}

async function verifyBlockedStorage(browser) {
  const context = await browser.newContext({ viewport: VIEWPORTS[1], colorScheme: 'light' });
  try {
    await context.addInitScript(() => {
      for (const method of ['getItem', 'setItem']) {
        Storage.prototype[method] = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
      }
    });
    const page = await context.newPage();
    const observed = observe(page);
    await visit(page, '/projects/');
    await toggleTheme(page, true);
    await toggleTheme(page, false);
    assert.deepEqual(observed.errors, [], 'Storage restrictions must not break page scripts');
    assert.deepEqual(observed.failures, []);
    return { scenario: 'blocked-localStorage', status: 'passed' };
  } finally { await context.close(); }
}

async function verifySlowImage(browser, viewport) {
  const context = await browser.newContext({ viewport, colorScheme: 'light' });
  let release;
  const held = new Promise(resolve => { release = resolve; });
  let markRequested;
  const requested = new Promise(resolve => { markRequested = resolve; });
  try {
    const page = await context.newPage();
    await page.route('**/projects/go-e2e/desktop.png', async route => {
      markRequested();
      await held;
      await route.continue();
    });
    await page.goto(`${BASE}/projects/go-e2e/`, { waitUntil: 'domcontentloaded' });
    await requested;
    await page.evaluate(() => document.fonts.ready);
    const image = page.locator('.project-content img');
    await image.scrollIntoViewIfNeeded();
    const measure = () => image.evaluate(img => {
      const heading = [...document.querySelectorAll('.project-content h2')]
        .find(node => img.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);
      return { naturalWidth: img.naturalWidth, height: img.getBoundingClientRect().height,
        headingY: heading.getBoundingClientRect().top + window.scrollY };
    });
    const before = await measure();
    assert.equal(before.naturalWidth, 0, 'Image must really be delayed');
    assert.ok(before.height > 100, 'Image space must be reserved before download');
    await snapshot(page, `slow-image-${viewport.name}-before`, false);
    release();
    await image.evaluate(img => img.decode());
    const after = await measure();
    assert.ok(after.naturalWidth > 1000);
    const headingShift = Math.abs(after.headingY - before.headingY);
    assert.ok(headingShift <= 1, `Delayed image shifted content by ${headingShift}px`);
    assert.ok(Math.abs(after.height - before.height) <= 1, 'Reserved image height must match loaded height');
    await snapshot(page, `slow-image-${viewport.name}-after`, false);
    return { scenario: `slow-image-${viewport.name}`, status: 'passed', before, after, headingShift };
  } finally { release(); await context.close(); }
}

(async () => {
  fs.mkdirSync(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = [];
  try {
    for (const viewport of VIEWPORTS) report.push(await verifyAtViewport(browser, viewport));
    report.push(await verifyBlockedStorage(browser));
    for (const viewport of VIEWPORTS.filter(item => SCREENSHOT_VIEWPORTS.has(item.name))) {
      report.push(await verifySlowImage(browser, viewport));
    }
    fs.writeFileSync(path.join(OUTPUT, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
