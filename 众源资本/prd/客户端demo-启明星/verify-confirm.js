const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  const out = {};
  // 1) confirm 页字段操作
  await p.evaluate(() => { location.hash = '#pe:confirm/fp3'; });
  await p.waitForTimeout(500);
  out.acceptBtns = await p.$$eval('[data-act="acceptField"]', e => e.length);
  await p.evaluate(() => { const el = document.querySelector('[data-act="acceptField"]'); if (el) el.click(); });
  await p.waitForTimeout(500);
  out.done1 = await p.evaluate(() => ({
    doneActs: document.querySelectorAll('.po-field-act-done').length,
    acceptBtnsLeft: document.querySelectorAll('[data-act="acceptField"]').length,
  }));
  out.batchBar = await p.evaluate(() => { const m = document.body.innerText.match(/已接受 \d+ \/ \d+ 项/); return m ? m[0] : null; });
  // 批量确认
  await p.evaluate(() => { const el = document.querySelector('[data-act="batchConfirm"]'); if (el) el.click(); });
  await p.waitForTimeout(500);
  out.afterBatch = await p.evaluate(() => ({
    doneActs: document.querySelectorAll('.po-field-act-done').length,
    batchBtnGone: !document.querySelector('[data-act="batchConfirm"]'),
    okRows: document.querySelectorAll('.po-field-row.po-field-ok').length,
  }));
  // 提交确认
  await p.evaluate(() => { const el = document.querySelector('[data-act="submitConfirm"]'); if (el) el.click(); });
  await p.waitForTimeout(300);
  out.modalOpen = await p.$('#poSubmitOk') ? true : false;
  await p.evaluate(() => { const el = document.getElementById('poSubmitOk'); if (el) el.click(); });
  await p.waitForTimeout(700);
  out.submitted = await p.evaluate(() => ({
    toolbar: Array.from(document.querySelectorAll('.po-toolbar .po-btn, .po-toolbar span')).map(e => e.textContent.trim()).join('|'),
    hasSubmitted: document.body.innerText.includes('已提交'),
  }));
  // 2) 催收清单
  await p.evaluate(() => { location.hash = '#pe:file-parse'; });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const el = document.querySelector('[data-act="genReminder"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.rm = await p.evaluate(() => ({
    open: !!document.querySelector('[data-rk-copy]'),
    overdueTags: document.querySelectorAll('.po-tag-status-abnormal').length,
  }));
  if (out.rm.open) {
    await p.evaluate(() => { const el = document.querySelector('[data-rk-copy]'); if (el) el.click(); });
    await p.waitForTimeout(300);
    out.copied = await p.evaluate(() => { const btns = document.querySelectorAll('[data-rk-copy]'); return btns.length ? btns[0].textContent.trim() : null; });
  }
  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
