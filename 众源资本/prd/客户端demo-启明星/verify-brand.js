const { chromium } = require('playwright');
const BRAND = 'rgb(194, 53, 27)'; // #c2351b
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://localhost:8765/index.html#pe:home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  async function col(sel) {
    return await page.$eval(sel, el => getComputedStyle(el).color).catch(() => 'N/A');
  }
  const logoName = await col('.sidebar-brand-name');
  const logoImg = await page.$('.sidebar-brand img');
  const logoImgOk = logoImg ? true : false;
  const navItems = await page.$$eval('.nav-item', els => els.map(e => getComputedStyle(e).color));
  const activeNav = await col('.nav-item.active');
  const title = await col('.page-toolbar h1');

  // count any text node painted in brand orange anywhere in sidebar
  const orangeInSidebar = await page.$$eval('.sidebar *', els =>
    els.filter(e => getComputedStyle(e).color === 'rgb(194, 53, 27)').length);

  console.log('logo name color   :', logoName, logoName === BRAND ? '  <-- ORANGE!' : 'ok');
  console.log('logo img present  :', logoImgOk);
  console.log('nav-item colors   :', JSON.stringify([...new Set(navItems)]), navItems.includes(BRAND) ? '<-- ORANGE!' : 'ok');
  console.log('active nav color  :', activeNav, activeNav === BRAND ? '  <-- ORANGE!' : 'ok');
  console.log('page title color  :', title, title === BRAND ? '  <-- ORANGE!' : 'ok');
  console.log('orange text nodes in sidebar:', orangeInSidebar, orangeInSidebar > 0 ? '<-- ORANGE!' : 'ok');
  console.log('console errors    :', errs.length);
  await browser.close();
})();
