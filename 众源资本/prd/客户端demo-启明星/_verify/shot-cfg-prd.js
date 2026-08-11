const { chromium } = require('playwright');
const OUT = '/Users/ctt/project/finstep/众源资本/prd/modules/配置中心/assets/config-center-v1.0-20260803';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('[err] ' + e.message));

  const go = async (hash, wait = 700) => {
    await page.evaluate(h => { location.hash = h; }, hash);
    await page.waitForTimeout(wait);
  };
  const click = async (sel, wait = 450) => {
    await page.evaluate(s => { const b = document.querySelector(s); if (b) b.click(); }, sel);
    await page.waitForTimeout(wait);
  };
  const clickText = async (txt, wait = 450) => {
    await page.evaluate(t => {
      const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === t);
      if (b) b.click();
    }, txt);
    await page.waitForTimeout(wait);
  };
  const shot = async (name) => { await page.screenshot({ path: OUT + '/' + name }); console.log('shot:', name); };

  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.removeItem('qmx:cfg-center:v1'));

  await go('#pe:settings', 500);
  await clickText('管理员', 400);

  // verify finance-config menu is gone
  const hasFinCfg = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#sidebarNav *')).some(el => el.textContent.trim() === '科目配置'));
  console.log('科目配置 menu present:', hasFinCfg);

  await go('#pe:config-center', 800);
  await shot('01-standards-list.png');

  // enter subject library
  await click('[data-act="cfgSelectStandard"]', 500);
  await click('.po-fin-subject', 450);
  await shot('02-subject-workbench.png');   // 科目与映射 section

  // switch to 校验规则 section
  await click('[data-act="cfgDetailSection"][data-arg="checks"]', 500);
  await shot('03-checks-section.png');      // 校验规则 section (folded in)

  // open a check edit modal
  await click('[data-act="cfgEditCheck"]', 450);
  await shot('04-check-edit-modal.png');    // 校验规则 edit modal
  // close
  await click('[data-act="cfgCloseModal"]', 300);

  // indicators + fields
  await click('[data-act="cfgBackToStandards"]', 350);
  await click('[data-act="cfgTab"][data-arg="indicators"]', 450);
  await shot('05-indicators.png');
  await click('[data-act="cfgTab"][data-arg="fields"]', 450);
  await shot('06-fields.png');

  if (errors.length) console.log('JS errors:', errors);
  else console.log('no JS errors');

  await browser.close();
})();
