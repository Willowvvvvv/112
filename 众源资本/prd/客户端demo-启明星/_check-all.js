const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  p.on('pageerror', e => console.log('PAGE:', e.message));

  const routes = ['home','file-parse','confirm/fp4','projects','project/p-xinghe','fund','snapshot','experts','skills','finance-config','chat/chat-1','chat/chat-2','post-browser'];
  for (const r of routes) {
    const url = 'http://127.0.0.1:8765/#pe:' + r;
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1100);
    const safeName = r.replace(/\//g, '_');
    const fp = '_verify/v2-' + safeName + '.png';
    await p.screenshot({ path: fp, fullPage: false });
    console.log('OK', r, '->', fs.statSync(fp).size, 'bytes');
  }
  await b.close();
  process.exit(0);
})();