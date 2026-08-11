const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  const out = {};

  // 1) "+" → 专家 → 面板有"开启红蓝对抗"
  await p.evaluate(() => { location.hash = '#pe:home'; });
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('#poHomePlus').click());
  await p.waitForTimeout(200);
  await p.evaluate(() => {
    const items = document.querySelectorAll('#poPlusMenu [data-plus-act]');
    for (const it of items) if (it.getAttribute('data-plus-act') === 'experts') { it.click(); break; }
  });
  await p.waitForTimeout(300);
  out.debateEntry = await p.evaluate(() => ({
    exists: !!document.querySelector('#poPlusMenu [data-plus-act="debateSetup"]'),
    text: (document.querySelector('#poPlusMenu [data-plus-act="debateSetup"]') || {}).textContent.replace(/\s+/g, ' ').trim(),
  }));

  // 2) 进入 setup
  await p.evaluate(() => { const el = document.querySelector('#poPlusMenu [data-plus-act="debateSetup"]'); if (el) el.click(); });
  await p.waitForTimeout(600);
  out.setup = await p.evaluate(() => ({
    hash: location.hash,
    redCards: document.querySelectorAll('.po-pick-card').length,
    startDisabled: (document.querySelector('[data-act="debateStart"]') || {}).disabled,
  }));

  // 3) 选红方（红列第1个）+ 蓝方（蓝列第1个）
  await p.evaluate(() => { const el = document.querySelector('.po-pick-col:nth-child(1) .po-pick-card'); if (el) el.click(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const el = document.querySelector('.po-pick-col:nth-child(2) .po-pick-card'); if (el) el.click(); });
  await p.waitForTimeout(300);
  out.afterPick = await p.evaluate(() => ({
    redSel: document.querySelectorAll('.po-pick-card.red-sel').length,
    blueSel: document.querySelectorAll('.po-pick-card.blue-sel').length,
    startDisabled: (document.querySelector('[data-act="debateStart"]') || {}).disabled,
  }));

  // 4) 开始对抗 → redblue 显示所选专家
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
