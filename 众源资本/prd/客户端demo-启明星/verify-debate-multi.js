const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { location.hash = '#pe:redblue-setup'; });
  await p.waitForTimeout(600);
  const out = {};

  // 1) 多选红方 3 个
  const redFirst3 = ['私募股权专家', '估值建模专家', '主题挖项目专家'];
  await p.evaluate((names) => {
    const cards = document.querySelectorAll('.po-pick-col:nth-child(1) .po-pick-card');
    for (const c of cards) { for (const n of names) if (c.textContent.includes(n)) { c.click(); break; } }
  }, redFirst3);
  await p.waitForTimeout(500);
  out.red3 = await p.evaluate(() => ({
    selCount: document.querySelectorAll('.po-pick-card.red-sel').length,
    colH: (document.querySelector('.po-pick-col-h.red') || {}).textContent,
    startText: (document.querySelector('[data-act="debateStart"]') || {}).textContent.replace(/\s+/g, ' ').trim(),
  }));

  // 2) 蓝方选 1 个
  await p.evaluate(() => {
    const cards = document.querySelectorAll('.po-pick-col:nth-child(2) .po-pick-card');
    for (const c of cards) if (c.textContent.includes('合规风控专家')) { c.click(); break; }
  });
  await p.waitForTimeout(400);
  out.blue1 = await p.evaluate(() => ({
    selCount: document.querySelectorAll('.po-pick-card.blue-sel').length,
    startDisabled: (document.querySelector('[data-act="debateStart"]') || {}).disabled,
  }));

  // 3) 蓝方再加到 5 个 → 第 5 个应被拒（toast）
  const blueNames = ['私募股权专家','财务尽调专家','并购交易专家','业绩解读专家','投行路演专家'];
  await p.evaluate((names) => {
    const cards = document.querySelectorAll('.po-pick-col:nth-child(2) .po-pick-card');
    for (const c of cards) { for (const n of names) if (c.textContent.includes(n)) { c.click(); break; } }
  }, blueNames);
  await p.waitForTimeout(500);
  out.max4 = await p.evaluate(() => ({
    blueSel: document.querySelectorAll('.po-pick-card.blue-sel').length,
    toast: (document.getElementById('toast') || {}).textContent,
  }));

  // 4) 开始对抗 → redblue 对阵条显示多专家
  await p.evaluate(() => { const el = document.querySelector('[data-act="debateStart"]'); if (el) el.click(); });
  await p.waitForTimeout(600);
  out.result = await p.evaluate(() => ({
    hash: location.hash,
    matchup: (document.querySelector('.po-debate-matchup') || {}).textContent.replace(/\s+/g, ' ').trim(),
    redColH: (document.querySelector('.po-debate-red .po-debate-col-h') || {}).textContent,
    blueColH: (document.querySelector('.po-debate-blue .po-debate-col-h') || {}).textContent,
  }));

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
