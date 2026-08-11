const { chromium } = require('playwright');

const clickSel = (page, sel) => page.evaluate(s => { const el = document.querySelector(s); if (el) el.click(); }, sel);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const base = 'http://localhost:8765/';
  await page.goto(base, { waitUntil: 'networkidle' });

  // 首页
  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '_verify/home.png', fullPage: false });

  // 项目数据浏览器（默认全选）
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '_verify/browser-all.png', fullPage: false });

  // 取消“直投”根 + 在搜索框输入“估值”过滤指标维度
  await clickSel(page, '[data-scope-act="toggle"][data-arg="direct"]');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const i = document.querySelector('#poBrowserSearch');
    if (i) { i.value = '估值'; i.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '_verify/browser-scoped-search.png', fullPage: false });

  // caret 展开/折叠健壮性：折叠 fof 再展开
  const caretOk = await page.evaluate(() => {
    const c = document.querySelector('[data-scope-caret="fof"]');
    if (!c) return 'no-caret';
    c.click();
    return 'clicked';
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '_verify/browser-fof-collapsed.png', fullPage: false });

  console.log(JSON.stringify({ caretOk, shots: ['home.png', 'browser-all.png', 'browser-scoped-search.png', 'browser-fof-collapsed.png'] }));
  await browser.close();
})();
