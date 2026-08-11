const { chromium } = require('playwright');
const BASE = 'http://localhost:8765/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  // ---- 浏览器页：全部空间 ----
  await page.goto(BASE + '#pe:browser', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const all = await page.evaluate(() => {
    const groups = document.querySelectorAll('.po-browser-table thead .po-th-group').length;
    const leaves = document.querySelectorAll('.po-browser-table thead .po-th-leaf').length;
    const rows = document.querySelectorAll('.po-browser-table tbody tr').length;
    const hint = (document.querySelector('.po-browser-toolhint') || {}).innerText || '';
    const treeCats = document.querySelectorAll('.po-tree-cat').length;
    return { groups, leaves, rows, hint, treeCats };
  });
  console.log('ALL 空间:', JSON.stringify(all));

  // ---- 切换到基金空间 ----
  await page.selectOption('#poBrowserSpace', 'sp-f-ggv');
  await page.waitForTimeout(400);
  const fund = await page.evaluate(() => {
    const rows = document.querySelectorAll('.po-browser-table tbody tr').length;
    const hint = (document.querySelector('.po-browser-toolhint') || {}).innerText || '';
    const firstName = (document.querySelector('.po-brow-name') || {}).innerText || '';
    return { rows, hint, firstName };
  });
  console.log('基金空间:', JSON.stringify(fund));

  // ---- 模板切换（GP季报审阅）→ 列数变化 ----
  await page.selectOption('#poBrowserTpl', 't-gp');
  await page.waitForTimeout(400);
  const tpl = await page.evaluate(() => {
    const leaves = document.querySelectorAll('.po-browser-table thead .po-th-leaf').length;
    const onLeaves = document.querySelectorAll('.po-tree-leaf.on').length;
    return { leaves, onLeaves };
  });
  console.log('GP模板:', JSON.stringify(tpl));

  // ---- 侧栏折叠 ----
  await page.goto(BASE + '#pe:home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const side = await page.evaluate(() => {
    const core = document.querySelectorAll('#sidebarNav > .sidebar-nav .nav-item').length;
    const toggle = !!document.querySelector('#sidebarMoreToggle');
    const moreOpen = document.querySelector('.sidebar-more') ? getComputedStyle(document.querySelector('.sidebar-more')).display : 'none';
    const moreCount = document.querySelectorAll('.sidebar-more').length;
    return { core, toggle, moreOpen, moreCount };
  });
  console.log('侧栏:', JSON.stringify(side));

  // ---- 展开全部场景 ----
  await page.click('#sidebarMoreToggle');
  await page.waitForTimeout(200);
  const expanded = await page.evaluate(() => getComputedStyle(document.querySelector('.sidebar-more')).display);
  console.log('展开后 .sidebar-more display:', expanded);

  console.log('=== ERRORS: ' + errors.length + ' ===');
  errors.slice(0, 10).forEach(e => console.log(e));
  await browser.close();
})();
