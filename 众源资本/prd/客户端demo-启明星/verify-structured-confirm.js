const { chromium } = require('playwright');

const base = process.env.DEMO_BASE_URL || 'http://localhost:8765';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push('CONSOLE: ' + message.text()); });
  page.on('pageerror', error => errors.push('PAGEERROR: ' + error.message));

  await page.goto(base + '/index.html#pe%3Aconfirm%2Ffp3', { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);

  const confirm = await page.evaluate(() => ({
    back: !!document.querySelector('[data-nav="file-parse"]'),
    topConfirmCount: document.querySelectorAll('.po-toolbar [data-act="submitConfirm"]').length,
    bottomConfirmCount: document.querySelectorAll('.po-confirm-submit [data-act="submitConfirm"]').length,
    sourceCount: document.querySelectorAll('.po-source-chip').length,
    hasOldRightTabs: /结构化字段/.test(document.body.innerText),
    hasStatusStack: /草稿已自动保存|配置版本 v3\.2|校验通过 8 项/.test(document.body.innerText),
    gpFieldCount: document.querySelectorAll('.po-result-row').length,
  }));

  await page.click('[data-act="switchProjectSource"][data-arg="3"]');
  await page.waitForTimeout(200);
  const finance = await page.evaluate(() => ({
    title: document.querySelector('.po-result-head strong')?.textContent.trim(),
    fieldCount: document.querySelectorAll('.po-result-row').length,
    sections: Array.from(document.querySelectorAll('.po-result-section h3')).map(el => el.textContent.trim()),
    previewPeriods: Array.from(document.querySelectorAll('.po-source-preview thead td')).map(el => el.textContent.trim()),
  }));

  const revenue = page.getByRole('textbox', { name: '营业收入' });
  await revenue.fill('1,102,121,163.00');
  await page.waitForTimeout(600);
  const saveState = await page.locator('[data-structured-save]').textContent();

  await page.goto(base + '/index.html#pe%3Aconfig-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const config = await page.evaluate(() => ({
    materialRows: document.querySelectorAll('.cfg-material-row').length,
    summary: document.querySelector('.cfg-summary')?.textContent.replace(/\s+/g, ' ').trim(),
    hasFinance44: /被投企业财报[\s\S]*44 项/.test(document.body.innerText),
    hasLineage: /文件溯源与审计/.test(document.body.innerText),
  }));

  const result = { confirm, finance, saveState, config, errors };
  console.log(JSON.stringify(result, null, 2));

  const failures = [];
  if (!confirm.back) failures.push('缺少返回按钮');
  if (confirm.topConfirmCount !== 1 || confirm.bottomConfirmCount !== 0) failures.push('确认按钮数量不正确');
  if (confirm.sourceCount !== 8) failures.push('材料 Mock 未覆盖 8 个入口');
  if (confirm.hasOldRightTabs || confirm.hasStatusStack) failures.push('旧层级或状态堆叠仍可见');
  if (confirm.gpFieldCount !== 35) failures.push('GP 基金层和底层项目字段不完整');
  if (finance.fieldCount !== 44) failures.push('财务报表 44 项字段不完整');
  if (!['报表头信息','资产负债表','利润表','现金流量表','权益变动表与附注'].every(name => finance.sections.includes(name))) failures.push('财务报表分组不完整');
  if (saveState.trim() !== '已保存') failures.push('自动保存未完成');
  if (config.materialRows !== 10 || !/135\s*字段口径/.test(config.summary || '')) failures.push('配置中心材料类型或字段口径不完整');
  if (errors.length) failures.push('页面存在控制台错误');

  await browser.close();
  if (failures.length) {
    console.error('FAIL: ' + failures.join('；'));
    process.exit(1);
  }
  console.log('PASS: 单层确认、财务三表、材料组件与配置中心均通过');
})();
