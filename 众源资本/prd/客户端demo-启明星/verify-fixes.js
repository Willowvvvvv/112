const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  const out = {};

  // 1) 项目库筛选 tab
  await page.evaluate(() => { location.hash = '#pe:projects'; });
  await page.waitForTimeout(500);
  out.projAllRows = await page.$$eval('.po-list-row', e => e.length);
  // 点 “投后”
  await page.evaluate(() => { const t=[...document.querySelectorAll('.po-snap-tab')].find(x=>x.textContent.trim()==='投后'); if(t)t.click(); });
  await page.waitForTimeout(400);
  out.projPostRows = await page.$$eval('.po-list-row', e => e.length);
  out.projPostActive = await page.evaluate(()=>{ const t=[...document.querySelectorAll('.po-snap-tab')].find(x=>x.textContent.trim()==='投后'); return t && t.classList.contains('active'); });
  // 点 “直投”
  await page.evaluate(() => { const t=[...document.querySelectorAll('.po-snap-tab')].find(x=>x.textContent.trim()==='直投'); if(t)t.click(); });
  await page.waitForTimeout(400);
  out.projDirectRows = await page.$$eval('.po-list-row', e => e.length);
  // 重置
  await page.evaluate(() => { const t=[...document.querySelectorAll('.po-snap-tab')].find(x=>x.textContent.trim()==='全部'); if(t)t.click(); });
  await page.waitForTimeout(300);

  // 2) 首页查看全部弹层
  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('.po-recent-more').click());
  await page.waitForTimeout(400);
  out.modalOpen = await page.$('.po-modal-mask') ? true : false;
  out.modalTasks = await page.$$eval('.po-modal-task', e => e.length).catch(()=>0);
  // 关闭（点 X）
  await page.evaluate(() => document.querySelector('.po-modal-x').click());
  await page.waitForTimeout(400);
  out.modalClosed = await page.$('.po-modal-mask') ? false : true;

  // 3) 最近任务宽度
  out.recentWidth = await page.evaluate(() => { const r=document.querySelector('.po-home-recent'); return r ? Math.round(r.getBoundingClientRect().width) : null; });

  // 4) 聚合节点勾选框背景
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(500);
  out.aggBoxBg = await page.evaluate(() => {
    const h = document.querySelector('.po-scope-cat-h .po-tree-box');
    if (!h) return null;
    return getComputedStyle(h).backgroundColor;
  });

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
