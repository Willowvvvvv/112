const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push('[err] ' + e.message));

  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Clear stale localStorage
  await page.evaluate(() => localStorage.removeItem('qmx:cfg-center:v1'));

  // Switch to admin
  await page.evaluate(() => { location.hash = '#pe:settings'; });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.trim() === '管理员');
    if (b) b.click();
  });
  await page.waitForTimeout(400);

  // Navigate to config-center subjects (standards list)
  await page.evaluate(() => { location.hash = '#pe:config-center'; });
  await page.waitForTimeout(800);

  await page.screenshot({ path: '_verify/cfg-std-01-list.png', fullPage: false });
  console.log('shot 1: standards list');

  // Click "配置科目" on first standard (std-cn)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-act="cfgSelectStandard"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '_verify/cfg-std-02-workbench-empty.png', fullPage: false });
  console.log('shot 2: po-fin workbench (nothing selected yet)');

  // Click first subject in left panel
  await page.evaluate(() => {
    const btn = document.querySelector('.po-fin-subject');
    if (btn) btn.click();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '_verify/cfg-std-03-workbench-selected.png', fullPage: false });
  console.log('shot 3: po-fin workbench with subject selected');

  // Click 资产负债表 tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.po-fin-stmt'));
    const b = btns.find(x => x.getAttribute('data-arg') === 'bs');
    if (b) b.click();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '_verify/cfg-std-04-bs-tab.png', fullPage: false });
  console.log('shot 4: BS tab');

  // Click first BS subject
  await page.evaluate(() => {
    const btn = document.querySelector('.po-fin-subject');
    if (btn) btn.click();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '_verify/cfg-std-05-bs-selected.png', fullPage: false });
  console.log('shot 5: BS subject selected in right panel');

  // Test fields tab — should not show 目标字段/提取方式
  await page.evaluate(() => {
    const btn = document.querySelector('[data-act="cfgBackToStandards"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const btn = document.querySelector('[data-act="cfgTab"][data-arg="fields"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '_verify/cfg-std-06-fields.png', fullPage: false });
  console.log('shot 6: fields tab (no 目标字段/提取方式)');

  if (errors.length) console.log('JS errors:', errors);
  else console.log('no JS errors');

  await browser.close();
})();
