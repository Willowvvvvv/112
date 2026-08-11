const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });

  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('[data-shell-nav="projects"]').click());
  await page.waitForTimeout(600);

  const r1 = await page.evaluate(() => {
    const list = document.querySelector('.po-list');
    const rows = document.querySelectorAll('.po-list-row').length;
    const title = (document.querySelector('.po-toolbar h2') || {}).textContent;
    // 尝试点击第一行
    const firstRow = document.querySelector('.po-list-row[data-nav]');
    const rowNav = firstRow ? firstRow.getAttribute('data-nav') : null;
    return { hasList: !!list, rows, title, rowNav };
  });
  console.log('projects page:', JSON.stringify(r1));

  if (r1.rowNav) {
    await page.evaluate(n => document.querySelector('.po-list-row[data-nav="'+n+'"]').click(), r1.rowNav);
    await page.waitForTimeout(600);
    const r2 = await page.evaluate(() => ({ hash: location.hash, hasDetail: !!document.querySelector('.po-stages,.po-page') }));
    console.log('after row click:', JSON.stringify(r2));
  }

  // 聚合节点 box 计算样式背景
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(500);
  const boxStyle = await page.evaluate(() => {
    const h = document.querySelector('.po-scope-cat-h .po-tree-box');
    if (!h) return null;
    const cs = getComputedStyle(h);
    return { cls: h.className, bg: cs.backgroundColor, borderBg: cs.borderTopColor };
  });
  console.log('aggregator box style:', JSON.stringify(boxStyle));

  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})();
