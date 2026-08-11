const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { location.hash = '#pe:home'; });
  await p.waitForTimeout(500);
  const out = {};

  // 工具栏是否在 composer 卡片内部（连体）
  out.connected = await p.evaluate(() => {
    const composer = document.querySelector('.po-composer');
    const tools = composer ? composer.querySelector('.po-composer-tools') : null;
    const input = composer ? composer.querySelector('#poHomeInput') : null;
    if (!composer || !tools || !input) return { ok: false };
    const cr = composer.getBoundingClientRect();
    const tr = tools.getBoundingClientRect();
    const ir = input.getBoundingClientRect();
    return {
      ok: true,
      insideComposer: tr.top >= cr.top && tr.bottom <= cr.bottom + 1,
      belowInput: tr.top > ir.bottom,
      hasBorderTop: getComputedStyle(tools).borderTopWidth !== '0px',
      toolsHeight: Math.round(tr.height),
    };
  });

  // 功能仍可用：点工作空间 → 面板展开（absolute 浮层）
  await p.evaluate(() => { const el = document.querySelector('[data-act="toggleSpace"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.spacePanel = await p.evaluate(() => {
    const panel = document.querySelector('[data-toolbar-panel="space"]');
    return { exists: !!panel, items: panel ? panel.querySelectorAll('.po-toolbar-item').length : 0, composerHeight: document.querySelector('.po-composer').getBoundingClientRect().height };
  });

  // 选第二项
  await p.evaluate(() => {
    const items = document.querySelectorAll('[data-toolbar-panel="space"] .po-toolbar-item');
    if (items[1]) items[1].click();
  });
  await p.waitForTimeout(400);
  out.pick = await p.evaluate(() => ({
    value: (document.querySelector('[data-act="toggleSpace"] .po-home-tool-value') || {}).textContent,
    panelGone: !document.querySelector('[data-toolbar-panel]'),
  }));

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
