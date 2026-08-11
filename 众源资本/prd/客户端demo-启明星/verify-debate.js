const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  const out = {};

  // 1) 浏览器：搜索在指标维度分区内；树默认收起
  await p.evaluate(() => { location.hash = '#pe:post-browser'; });
  await p.waitForTimeout(600);
  out.browser = await p.evaluate(() => ({
    searchInsideSect: !!(document.querySelector('.po-browser-sect .po-browser-search')),
    searchAfterHeader: (() => {
      const sect = document.querySelectorAll('.po-browser-sect')[1];
      if (!sect) return 'no-sect';
      return Array.from(sect.children).map(c => (c.className || '').split(' ')[0]).join(' > ');
    })(),
    scopeCollapsed: document.querySelectorAll('.po-scope-cat .po-tree-leaves').length,
    scopeOpenCats: (() => {
      // 项目范围默认收起：叶子不渲染
      return document.querySelectorAll('.po-scope-cat').length;
    })(),
    treeCats: document.querySelectorAll('.po-tree-cat').length,
    treeLeavesRendered: document.querySelectorAll('.po-tree-cat .po-tree-leaves').length,
  }));

  // 2) 红蓝对抗：技能面板 → 投委会对抗预演
  await p.evaluate(() => { location.hash = '#pe:home'; });
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('#poHomePlus').click());
  await p.waitForTimeout(200);
  await p.evaluate(() => {
    const items = document.querySelectorAll('#poPlusMenu [data-plus-act]');
    for (const it of items) if (it.getAttribute('data-plus-act') === 'skills') { it.click(); break; }
  });
  await p.waitForTimeout(300);
  out.skillPanelHasDebate = await p.evaluate(() => {
    const items = document.querySelectorAll('#poPlusMenu [data-plus-act="useSkill"]');
    return Array.from(items).some(e => e.getAttribute('data-arg') === '投委会对抗预演');
  });
  await p.evaluate(() => {
    const items = document.querySelectorAll('#poPlusMenu [data-plus-act="useSkill"]');
    for (const it of items) if (it.getAttribute('data-arg') === '投委会对抗预演') { it.click(); break; }
  });
  await p.waitForTimeout(600);
  out.debate = await p.evaluate(() => ({
    hash: location.hash,
    title: (document.querySelector('.po-toolbar h2') || {}).textContent,
    redCol: !!document.querySelector('.po-debate-red'),
    blueCol: !!document.querySelector('.po-debate-blue'),
    redPoints: document.querySelectorAll('.po-debate-red .po-debate-point').length,
    bluePoints: document.querySelectorAll('.po-debate-blue .po-debate-point').length,
    verdict: (document.querySelector('.po-verdict-title') || {}).textContent,
    scoreRows: document.querySelectorAll('.po-score-row').length,
    pointTextsHidden: (() => {
      // 论点默认收起：无 .open 时详情不显示
      const open = document.querySelectorAll('.po-debate-point.open').length;
      const details = document.querySelectorAll('.po-debate-point-d').length;
      return { open, details };
    })(),
  }));
  // 展开第一个论点
  await p.evaluate(() => { const el = document.querySelector('.po-debate-red .po-debate-point'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.debateExpand = await p.evaluate(() => ({
    open: document.querySelectorAll('.po-debate-point.open').length,
    details: document.querySelectorAll('.po-debate-point-d').length,
  }));
  // 返回首页
  await p.evaluate(() => { const el = document.querySelector('[data-act="debateBack"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.backHome = await p.evaluate(() => location.hash);

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
