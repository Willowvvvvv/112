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

  // 1) 工具栏存在，无引用空间材料
  out.toolbar = await p.evaluate(() => {
    const tb = document.querySelector('.po-home-toolbar');
    const tools = tb ? Array.from(tb.querySelectorAll('.po-home-tool')).map(t => t.textContent.replace(/\s+/g,' ').trim()) : [];
    return { exists: !!tb, tools };
  });

  // 2) + 菜单：确认无"引用空间材料"
  await p.evaluate(() => document.querySelector('#poHomePlus').click());
  await p.waitForTimeout(300);
  out.plus = await p.evaluate(() => Array.from(document.querySelectorAll('#poPlusMenu [data-plus-act]')).map(e => e.getAttribute('data-plus-act')));
  await p.evaluate(() => { const b = document.querySelector('#poHomePlus'); if (b) b.click(); });
  await p.waitForTimeout(300);

  // 3) 点工作空间 → 面板展开
  await p.evaluate(() => { const el = document.querySelector('[data-act="toggleSpace"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.spaceOpen = await p.evaluate(() => ({
    panelExists: !!document.querySelector('[data-toolbar-panel="space"]'),
    items: document.querySelectorAll('.po-toolbar-item').length,
  }));

  // 4) 选第二个空间
  await p.evaluate(() => {
    const items = document.querySelectorAll('[data-toolbar-panel="space"] .po-toolbar-item');
    if (items[1]) items[1].click();
  });
  await p.waitForTimeout(400);
  out.afterPickSpace = await p.evaluate(() => ({
    value: (document.querySelector('[data-act="toggleSpace"] .po-home-tool-value') || {}).textContent,
    panelGone: !document.querySelector('[data-toolbar-panel]'),
  }));

  // 5) 切默认权限
  await p.evaluate(() => { const el = document.querySelector('[data-act="togglePerm"]'); if (el) el.click(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => {
    const items = document.querySelectorAll('[data-toolbar-panel="perm"] .po-toolbar-item');
    if (items[0]) items[0].click();
  });
  await p.waitForTimeout(300);
  out.afterPickPerm = await p.evaluate(() => ({
    value: (document.querySelector('[data-act="togglePerm"] .po-home-tool-value') || {}).textContent,
  }));

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();