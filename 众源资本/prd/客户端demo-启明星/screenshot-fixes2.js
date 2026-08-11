const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://localhost:8765/', { waitUntil: 'networkidle' });

  // "+" 主菜单
  await p.evaluate(() => { location.hash = '#pe:home'; });
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('#poHomePlus').click());
  await p.waitForTimeout(300);
  await p.screenshot({ path: '_verify/plus-main-menu.png' });

  // confirm 页（部分字段已接受 + 批量条计数）
  await p.evaluate(() => { location.hash = '#pe:confirm/fp3'; });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const el = document.querySelector('[data-act="acceptField"]'); if (el) el.click(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const el = document.querySelector('[data-act="rejectField"]'); if (el) el.click(); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: '_verify/confirm-field-states.png' });

  console.log('shots ok');
  await b.close();
})();
