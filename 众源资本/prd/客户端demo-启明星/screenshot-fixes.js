const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });

  // 首页（最近任务加宽）
  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '_verify/home-fixed.png' });

  // 首页查看全部弹层
  await page.evaluate(() => document.querySelector('.po-recent-more').click());
  await page.waitForTimeout(400);
  await page.screenshot({ path: '_verify/home-viewall.png' });
  await page.evaluate(() => document.querySelector('.po-modal-x').click());
  await page.waitForTimeout(300);

  // 项目库（筛选 tab）
  await page.evaluate(() => { location.hash = '#pe:projects'; });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '_verify/projects-fixed.png' });

  // 项目数据浏览器（一级节点已选中）
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '_verify/browser-checked.png' });

  console.log('shots done');
  await browser.close();
})();
