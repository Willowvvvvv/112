const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto('http://localhost:8765/index.html#pe:home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  await page.screenshot({ path: '/tmp/collapse-normal.png' });

  // 模拟菜单收起
  await page.evaluate(() => {
    document.querySelector('.app').classList.add('sidebar-collapsed');
  });
  await page.waitForTimeout(400);

  // 测量第一个 nav-item 内 icon 是否水平居中
  const measure = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.app.sidebar-collapsed .nav-item')];
    return items.slice(0, 4).map(it => {
      const ico = it.querySelector('span');
      const r = it.getBoundingClientRect();
      const ir = ico ? ico.getBoundingClientRect() : null;
      return {
        label: it.getAttribute('data-nav-label'),
        itemW: Math.round(r.width),
        iconW: ir ? Math.round(ir.width) : 0,
        iconLeftOffset: ir ? Math.round(ir.left - r.left) : 0,
        iconRightGap: ir ? Math.round(r.right - ir.right) : 0,
        centered: ir ? Math.abs((ir.left - r.left) - (r.right - ir.right)) < 3 : false
      };
    });
  });
  console.log('COLLAPSED MEASURE:', JSON.stringify(measure, null, 2));

  await page.screenshot({ path: '/tmp/collapse-collapsed.png' });

  console.log('CONSOLE_ERRORS:', errors.length, errors.slice(0, 5));
  await browser.close();
})();
