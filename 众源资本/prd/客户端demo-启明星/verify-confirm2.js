const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  const out = {};

  // A) 提交确认 → 应显示“已提交”
  await p.evaluate(() => { location.hash = '#pe:confirm/fp3'; });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const el = document.querySelector('[data-act="batchConfirm"]'); if (el) el.click(); });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const el = document.querySelector('[data-act="submitConfirm"]'); if (el) el.click(); });
  await p.waitForTimeout(300);
  out.modalOpen = await p.$('#poSubmitOk') ? true : false;
  await p.evaluate(() => { const el = document.getElementById('poSubmitOk'); if (el) el.click(); });
  await p.waitForTimeout(1600); /* 等 navigate 回 confirm 页 */
  out.afterSubmit = await p.evaluate(() => ({
    hash: location.hash,
    hasSubmitted: document.body.innerText.includes('已提交'),
    toolbarBtns: Array.from(document.querySelectorAll('.po-toolbar [data-act], .po-toolbar span')).map(e => e.textContent.trim()).join('|'),
  }));

  // B) 催收清单（新开页面避免残留定时器）
  const p2 = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs2 = [];
  p2.on('pageerror', e => errs2.push(e.message));
  await p2.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await p2.evaluate(() => { location.hash = '#pe:file-parse'; });
  await p2.waitForTimeout(500);
  out.fileParseTags = await p2.$$eval('.po-tag-status-abnormal', e => e.length);
  await p2.evaluate(() => { const el = document.querySelector('[data-act="genReminder"]'); if (el) el.click(); });
  await p2.waitForTimeout(400);
  out.rm = await p2.evaluate(() => ({
    open: !!document.querySelector('[data-rk-copy]'),
    copyBtns: document.querySelectorAll('[data-rk-copy]').length,
    title: (document.body.innerText.match(/催收清单/) || [''])[0],
  }));
  if (out.rm.open) {
    await p2.evaluate(() => { const el = document.querySelector('[data-rk-copy]'); if (el) el.click(); });
    await p2.waitForTimeout(300);
    out.copied = await p2.evaluate(() => document.querySelector('[data-rk-copy]').textContent.trim());
  }
  out.errors2 = errs2;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
