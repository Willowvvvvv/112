const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  const out = {};

  // 1) home chip → 直接出答案
  await p.evaluate(() => { location.hash = '#pe:home'; });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const el = document.querySelector('[data-act="homeChip"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.chipAnswer = await p.evaluate(() => ({ qaCards: document.querySelectorAll('.po-qa-card').length, inputVal: (document.getElementById('poHomeInput')||{}).value }));

  // 2) home 投后问数 tab → 聚焦
  await p.evaluate(() => { const el = document.querySelector('[data-act="homeFocus"]'); if (el) el.click(); });
  await p.waitForTimeout(200);
  out.focusActive = await p.evaluate(() => document.activeElement && document.activeElement.id === 'poHomeInput');

  // 3) file-parse done 行 → toast
  await p.evaluate(() => { location.hash = '#pe:file-parse'; });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const el = document.querySelector('[data-act="viewDone"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.doneToast = await p.evaluate(() => ({ toast: (document.getElementById('toast')||{}).textContent, viewDoneBtns: document.querySelectorAll('[data-act="viewDone"]').length }));

  // 4) project 详情文件行 → toast
  await p.evaluate(() => { location.hash = '#pe:project/p-xinghe'; });
  await p.waitForTimeout(600);
  await p.evaluate(() => { const el = document.querySelector('[data-act="fileView"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.fileViewToast = await p.evaluate(() => (document.getElementById('toast')||{}).textContent);

  // 5) uploadCap → file chooser
  const fcPromise = p.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
  await p.evaluate(() => { const el = document.querySelector('[data-act="uploadCap"]'); if (el) el.click(); });
  const fc = await fcPromise;
  out.uploadCapChooser = !!fc;

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
