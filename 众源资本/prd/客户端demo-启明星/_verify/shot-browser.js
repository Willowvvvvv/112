const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '_verify/browser-fixed.png', fullPage: false });
  await browser.close();
  console.log('shot saved');
})();
