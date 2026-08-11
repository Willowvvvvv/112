const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { location.hash = '#pe:post-browser'; });
  await p.waitForTimeout(600);
  const out = {};

  // 1) 无 toolHint，提取按钮存在，搜索在指标下面
  out.ui = await p.evaluate(() => ({
    toolHintExists: !!document.querySelector('.po-browser-toolhint'),
    extractBtnExists: !!document.querySelector('[data-act="extractData"]'),
    extractText: (document.querySelector('[data-act="extractData"]') || {}).textContent,
    searchPosition: (() => {
      const aside = document.querySelector('.po-browser-tree');
      if (!aside) return 'no-aside';
      const children = Array.from(aside.children).map(c => (c.className || '').split(' ')[0]);
      return children.join(' > ');
    })(),
    caretRightAligned: (() => {
      const cs = getComputedStyle(document.querySelector('.po-tree-cat .po-tree-caret'));
      return cs.marginLeft === 'auto' || cs.marginLeft !== '0px';
    })(),
  }));

  // 2) 初始表格列数
  out.initialCols = await p.$$eval('.po-browser-table thead th', els => els.length);

  // 3) 取消一个叶子 → 树更新，表格不变
  await p.evaluate(() => { const el = document.querySelector('[data-act="treeLeaf"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.afterLeafToggle = await p.evaluate(() => ({
    checkedLeafs: document.querySelectorAll('.po-tree-leaf.on').length,
    tableCols: document.querySelectorAll('.po-browser-table thead th').length,
  }));

  // 4) 点提取 → 表格更新
  await p.evaluate(() => { const el = document.querySelector('[data-act="extractData"]'); if (el) el.click(); });
  await p.waitForTimeout(400);
  out.afterExtract = await p.evaluate(() => ({
    tableCols: document.querySelectorAll('.po-browser-table thead th').length,
    checkedLeafs: document.querySelectorAll('.po-tree-leaf.on').length,
  }));

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
