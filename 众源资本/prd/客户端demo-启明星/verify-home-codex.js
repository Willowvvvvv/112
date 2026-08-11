const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];

  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', e => errors.push(e.message));

  // Navigate to home
  await page.goto('http://localhost:8765/#pe:home', { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(1000);

  const result = await page.evaluate(() => {
    const checks = {};

    // 1. No greeting text
    const greetDiv = document.querySelector('.po-home-greet');
    checks.noGreeting = !greetDiv;

    // 2. Input exists with correct placeholder
    const input = document.getElementById('poHomeInput');
    checks.inputExists = !!input;
    checks.placeholder = input ? input.getAttribute('placeholder') : null;
    checks.placeholderOK = checks.placeholder === '描述你的投后分析任务...';

    // 3. Space row exists below input
    const spacerow = document.querySelector('.po-home-spacerow');
    checks.spacerowExists = !!spacerow;

    // 4. Space select exists
    const spaceSelect = document.getElementById('poHomeSpace');
    checks.spaceSelectExists = !!spaceSelect;
    checks.spaceOptions = spaceSelect ? spaceSelect.options.length : 0;

    // 5. "+ 新建空间" button exists
    const newSpaceBtn = document.querySelector('[data-act="homeNewSpace"]');
    checks.newSpaceBtnExists = !!newSpaceBtn;
    checks.newSpaceBtnText = newSpaceBtn ? newSpaceBtn.textContent.trim() : null;

    // 6. Chips exist
    const chips = document.querySelectorAll('.po-chip');
    checks.chipCount = chips.length;

    // 7. Inline create panel exists (hidden)
    const inlinePanel = document.getElementById('poHomeInlineCreate');
    checks.inlinePanelExists = !!inlinePanel;
    checks.inlinePanelHidden = inlinePanel ? inlinePanel.style.display === 'none' : false;

    // 8. Recent tasks exist
    const tasks = document.querySelectorAll('.po-task-row');
    checks.taskCount = tasks.length;

    // 9. Input hero centered
    const hero = document.querySelector('.po-home-hero');
    checks.heroExists = !!hero;

    // 10. No source cards (left sidebar gone)
    const sourceCards = document.querySelectorAll('.po-source-card');
    checks.noSourceCards = sourceCards.length === 0;

    // 11. No emoji
    const bodyText = document.body.innerText;
    checks.noEmoji = !/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(bodyText);

    return checks;
  });

  console.log('=== Home Page Codex-style Checks ===');
  for (const [k, v] of Object.entries(result)) {
    const status = v === true ? 'PASS' : v === false ? 'FAIL' : `INFO:${JSON.stringify(v)}`;
    console.log(`${status} | ${k}`);
  }

  // Click "+ 新建空间" and verify inline panel opens
  await page.click('[data-act="homeNewSpace"]');
  await page.waitForTimeout(300);

  const inlineResult = await page.evaluate(() => {
    const panel = document.getElementById('poHomeInlineCreate');
    const checks = {};
    checks.panelVisible = panel ? panel.style.display !== 'none' : false;
    checks.titleExists = panel ? panel.querySelector('.po-inline-create-title') !== null : false;
    checks.nameInputExists = !!document.getElementById('poInlineSpaceName');
    checks.checkboxes = panel ? panel.querySelectorAll('.po-inline-chk').length : 0;
    checks.cancelBtn = !!document.getElementById('poCancelInline');
    checks.saveBtn = !!document.getElementById('poSaveInline');
    return checks;
  });

  console.log('\n=== Inline Create Panel Checks ===');
  for (const [k, v] of Object.entries(inlineResult)) {
    const status = v === true ? 'PASS' : v === false ? 'FAIL' : `INFO:${JSON.stringify(v)}`;
    console.log(`${status} | ${k}`);
  }

  // Click cancel and verify panel hides
  await page.click('#poCancelInline');
  await page.waitForTimeout(200);

  const cancelResult = await page.evaluate(() => {
    const panel = document.getElementById('poHomeInlineCreate');
    return { panelHidden: panel ? panel.style.display === 'none' : true };
  });
  console.log('\n=== Cancel Check ===');
  console.log(`${cancelResult.panelHidden ? 'PASS' : 'FAIL'} | panelHiddenAfterCancel`);

  // Take screenshot
  await page.screenshot({ path: path.join(__dirname, '_verify/home-codex.png'), fullPage: false });

  // Same: open panel again for screenshot with panel
  await page.reload({ waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(500);
  await page.click('[data-act="homeNewSpace"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, '_verify/home-codex-panel.png'), fullPage: false });

  console.log('\n=== Errors ===');
  if (errors.length) errors.forEach(e => console.log('ERR:', e));
  else console.log('0 errors');

  const allPass = Object.values(result).every(v => v === true || (typeof v === 'string' && v.startsWith('INFO')));
  const inlinePass = Object.values(inlineResult).every(v => v === true || (typeof v === 'number' && v > 0));
  if (allPass && inlinePass && cancelResult.panelHidden) {
    console.log('\nALL PASS');
  }

  await browser.close();
})();
