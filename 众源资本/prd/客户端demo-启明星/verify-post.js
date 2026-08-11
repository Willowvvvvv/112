const { chromium } = require('playwright');

const BASE = 'http://localhost:8765/index.html';
const routes = [
  { hash: '#pe:home', name: 'home' },
  { hash: '#pe:file-parse', name: 'file-parse' },
  { hash: '#pe:confirm/fp3', name: 'confirm' },
  { hash: '#pe:project/xinghe', name: 'project-detail' },
  { hash: '#pe:fund', name: 'fund' },
  { hash: '#pe:snapshot', name: 'snapshot' },
  { hash: '#pe:browser', name: 'browser' },
  { hash: '#pe:scenarios', name: 'workflow' },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  for (const r of routes) {
    await page.goto(BASE + r.hash, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    // check emoji in visible text
    const emoji = await page.evaluate(() => {
      const txt = document.body.innerText;
      const m = txt.match(/[📊📄📋📈💰✓✗✕⚠⬆🟢🔴🟡]/g);
      return m ? m : [];
    });
    await page.screenshot({ path: '/tmp/po-' + r.name + '.png', fullPage: false });
    console.log(r.name + ' | emoji=' + (emoji.length ? emoji.join('') : 'none') + ' | errors-so-far=' + errors.length);
  }
  /* 浏览器：基金空间作用域 */
  await page.goto(BASE + '#pe:browser', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.selectOption('#poBrowserSpace', 'sp-f-ggv').catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/po-browser-fund.png', fullPage: false });

  /* 侧栏（默认折叠长尾） */
  await page.goto(BASE + '#pe:home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const side = await page.$('#sidebarNav');
  if (side) await side.screenshot({ path: '/tmp/po-sidebar.png' });

  console.log('=== TOTAL ERRORS: ' + errors.length + ' ===');
  errors.slice(0, 20).forEach(e => console.log(e));
  await browser.close();
})();
