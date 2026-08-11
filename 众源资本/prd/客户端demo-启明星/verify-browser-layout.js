const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });

  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(600);

  const r = await page.evaluate(() => {
    const doc = document.documentElement;
    const tree = document.querySelector('.po-browser-tree');
    const scroll = document.querySelector('.po-browser-scroll');
    const main = document.querySelector('.po-browser-main');
    const pageEl = document.querySelector('.po-page-browser');
    const treeCs = getComputedStyle(tree);
    const scrollCs = getComputedStyle(scroll);
    return {
      docScrollH: doc.scrollHeight,
      winH: window.innerHeight,
      docScrolls: doc.scrollHeight > window.innerHeight + 2,   // 整页是否溢出滚动
      pageH: Math.round(pageEl.getBoundingClientRect().height),
      treeClientH: tree.clientHeight,
      treeScrollH: tree.scrollHeight,          // 左菜单内容是否超出（超出则可内部滚动）
      treeOverflowY: treeCs.overflowY,
      scrollClientH: scroll.clientHeight,
      scrollScrollH: scroll.scrollHeight,      // 右列表内容是否超出（应超出→可滚动）
      scrollOverflowY: scrollCs.overflowY,
      mainOverflow: getComputedStyle(main).overflow,
    };
  });
  console.log(JSON.stringify(r, null, 2));

  // 滚动右侧列表，确认左侧不动
  await page.evaluate(() => { const s=document.querySelector('.po-browser-scroll'); s.scrollTop = 400; });
  await page.waitForTimeout(200);
  const afterScroll = await page.evaluate(() => {
    const tree = document.querySelector('.po-browser-tree');
    const scroll = document.querySelector('.po-browser-scroll');
    return { treeScrollTop: tree.scrollTop, scrollScrollTop: scroll.scrollTop, docScrollTop: document.documentElement.scrollTop };
  });
  console.log('after right scroll:', JSON.stringify(afterScroll));
  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})();
