const { chromium } = require('playwright');

const clickSel = (page, sel) => page.evaluate(s => { const el = document.querySelector(s); if (el) el.click(); }, sel);
const setSearch = (page, v) => page.evaluate(val => {
  const i = document.querySelector('#poBrowserSearch');
  if (i) { i.value = val; i.dispatchEvent(new Event('input', { bubbles: true })); }
}, v);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  const base = 'http://localhost:8765/';
  await page.goto(base, { waitUntil: 'networkidle' });

  // —— 首页 ——
  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(500);
  const recent = await page.$$eval('.po-recent-item', els => els.length);
  const recentTitle = await page.$eval('.po-recent-title', el => el.textContent).catch(() => null);
  const homeText = await page.$eval('.po-page-home', el => el.innerText).catch(() => '');

  // —— 项目数据浏览器 ——
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(500);
  const title = await page.$eval('.po-toolbar h2', el => el.textContent).catch(() => null);
  const searchExists = await page.$('#poBrowserSearch') ? true : false;
  const sectHeaders = await page.$$eval('.po-browser-sect-h', els => els.map(e => e.textContent.trim()));
  const manageSpace = await page.$('[data-act="openSpaceMgr"]') ? true : false;
  const spaceSelect = await page.$('#poBrowserSpace') ? true : false;
  const tplSelect = await page.$('#poBrowserTpl') ? true : false;
  const rowsBefore = await page.$$eval('.po-browser-table tbody tr', els => els.length);

  // 取消勾选“直投”根
  await clickSel(page, '[data-scope-act="toggle"][data-arg="direct"]');
  await page.waitForTimeout(400);
  const rowsAfterDirectOff = await page.$$eval('.po-browser-table tbody tr', els => els.length);
  // 勾回直投
  await clickSel(page, '[data-scope-act="toggle"][data-arg="direct"]');
  await page.waitForTimeout(300);

  // 基金投默认已展开，直接取消一个底层项目（不折叠树）
  const rowsBeforeUg = await page.$$eval('.po-browser-table tbody tr', els => els.length);
  await clickSel(page, '[data-scope-act="toggle"][data-arg="uf:f-ggv:ug1"]');
  await page.waitForTimeout(300);
  const rowsAfterUg = await page.$$eval('.po-browser-table tbody tr', els => els.length);
  // 勾回
  await clickSel(page, '[data-scope-act="toggle"][data-arg="uf:f-ggv:ug1"]');
  await page.waitForTimeout(300);

  // 搜索指标：输入“估值”
  await setSearch(page, '估值');
  await page.waitForTimeout(400);
  const treeCatsAfterSearch = await page.$$eval('.po-tree-cat-h', els => els.map(e => e.textContent.replace(/[▾▸]/g, '').trim()));
  await setSearch(page, '');
  await page.waitForTimeout(300);

  // emoji 检测：仅捕获真正的装饰性 emoji（含 ✓✗✔✖❌ 等符号与 emoji 区块），放行功能箭头 →↑← 与 × 等纯文本符号
  const emojiRe = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const browserText = await page.$eval('.po-page', el => el.innerText).catch(() => '');
  const hasEmojiHome = emojiRe.test(homeText);
  const hasEmojiBrowser = emojiRe.test(browserText);
  const homeMatch = homeText.match(emojiRe);
  const browserMatch = browserText.match(emojiRe);

  console.log(JSON.stringify({
    recentItems: recent,
    recentTitle,
    browserTitle: title,
    searchExists,
    sectHeaders,
    manageSpaceFound: manageSpace,
    spaceSelectFound: spaceSelect,
    tplSelectFound: tplSelect,
    rowsBefore,
    rowsAfterDirectOff,
    rowsBeforeUg,
    rowsAfterUg,
    treeCatsAfterSearch,
    hasEmojiHome,
    hasEmojiBrowser,
    homeMatch,
    browserMatch,
    errors
  }, null, 2));

  await browser.close();
})();
