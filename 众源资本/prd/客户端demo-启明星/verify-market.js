const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await p.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  const out = {};

  // 1) 私募股权专家页
  await p.evaluate(() => { location.hash = '#pe:experts'; });
  await p.waitForTimeout(600);
  out.experts = await p.evaluate(() => ({
    title: (document.querySelector('.po-toolbar h2') || {}).textContent,
    cards: document.querySelectorAll('.po-expert-card').length,
    lead: (document.querySelector('.po-market-lead') || {}).textContent,
    firstCard: (document.querySelector('.po-expert-name') || {}).textContent,
    hasSummon: !!document.querySelector('[data-act="summonExpert"]'),
  }));
  // 召唤专家 → 回首页并插入 @
  await p.evaluate(() => { const el = document.querySelector('[data-act="summonExpert"]'); if (el) el.click(); });
  await p.waitForTimeout(500);
  out.summon = await p.evaluate(() => ({
    hash: location.hash,
    inputVal: (document.getElementById('poHomeInput') || {}).value,
  }));

  // 2) 能力市场（默认技能 tab）
  await p.evaluate(() => { location.hash = '#pe:skills'; });
  await p.waitForTimeout(600);
  out.skills = await p.evaluate(() => ({
    title: (document.querySelector('.po-toolbar h2') || {}).textContent,
    tabs: Array.from(document.querySelectorAll('.po-market-tab')).map(e => e.textContent.trim() + (e.classList.contains('active') ? '*' : '')),
    skillCards: document.querySelectorAll('.po-skill-card').length,
    firstSkill: (document.querySelector('.po-skill-name') || {}).textContent,
  }));
  // 切到 连接器
  await p.evaluate(() => { const el = document.querySelector('[data-act="marketKind"][data-arg="connector"]'); if (el) el.click(); });
  await p.waitForTimeout(500);
  out.connectors = await p.evaluate(() => ({
    rows: document.querySelectorAll('.po-connector-row').length,
    first: (document.querySelector('.po-connector-name') || {}).textContent,
  }));
  // 切到 专家
  await p.evaluate(() => { const el = document.querySelector('[data-act="marketKind"][data-arg="expert"]'); if (el) el.click(); });
  await p.waitForTimeout(500);
  out.expertTab = await p.evaluate(() => document.querySelectorAll('.po-expert-card').length);
  // 使用技能
  await p.evaluate(() => { const el = document.querySelector('[data-act="marketKind"][data-arg="skill"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const el = document.querySelector('[data-act="useSkill"]'); if (el) el.click(); });
  await p.waitForTimeout(500);
  out.useSkill = await p.evaluate(() => ({ hash: location.hash, inputVal: (document.getElementById('poHomeInput') || {}).value }));

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
