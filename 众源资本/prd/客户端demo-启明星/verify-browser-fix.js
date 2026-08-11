const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  const base = 'http://localhost:8765/';
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // navigate to browser route
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(1200);

  const res = await page.evaluate(() => {
    const root = document.querySelector('#app') || document.body;
    const tree = root.querySelector('.po-browser-tree');
    const treeLeaves = root.querySelectorAll('.po-tree-leaf').length;
    const treeCats = root.querySelectorAll('.po-tree-cat').length;
    const table = root.querySelector('.po-browser-table');
    const groupHead = root.querySelectorAll('.po-th-group').length;
    const leafHead = root.querySelectorAll('.po-th-leaf').length;
    const caps = root.querySelectorAll('.po-th-cap').length;
    const nameCells = root.querySelectorAll('.po-brow-name').length;
    const toolhint = root.querySelector('.po-browser-toolhint');
    const select = root.querySelector('#poBrowserSpace');
    const tpl = root.querySelector('#poBrowserTpl');
    const oldMarker = !!root.querySelector('[class*="browser-legacy"]');
    return {
      url: location.hash,
      hasTree: !!tree, treeLeaves, treeCats,
      hasTable: !!table, groupHead, leafHead, caps, nameCells,
      hasToolhint: !!toolhint,
      hasSpaceSel: !!select, hasTplSel: !!tpl,
      oldMarker,
      title: (root.querySelector('.po-toolbar-title, .toolbar-title') || {}).textContent || ''
    };
  });

  console.log('--- post-browser render check ---');
  console.log(JSON.stringify(res, null, 2));
  console.log('JS errors:', errors.length ? errors : 'NONE');

  const pass = res.hasTree && res.treeLeaves > 0 && res.hasTable && res.groupHead > 0 && res.leafHead > 0 && res.caps > 0 && res.nameCells > 0 && !res.oldMarker && errors.length === 0;
  console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');

  await browser.close();
  process.exit(pass ? 0 : 1);
})();
