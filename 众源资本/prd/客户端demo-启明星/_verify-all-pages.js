const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  p.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  const base = 'http://127.0.0.1:8765/';
  const shots = '/Users/ctt/project/finstep/启明星/03-产品示意/启明星-完整能力Demo-v4.0-20260718/_verify/';

  async function go(hash, name, clickSelector) {
    await p.evaluate((h) => { location.hash = h; }, hash);
    await p.waitForTimeout(450);
    if (clickSelector) {
      try { await p.click(clickSelector, { timeout: 1500 }); await p.waitForTimeout(400); } catch(e) {}
    }
    await p.screenshot({ path: shots + name + '.png', fullPage: false });
    const txt = await p.evaluate(() => document.querySelector('#viewRoot') ? document.querySelector('#viewRoot').innerText.slice(0, 80) : 'EMPTY');
    console.log(name + ' -> ' + txt.replace(/\n/g, ' '));
  }

  await p.goto(base, { waitUntil: 'networkidle' });
  await go('#pe:home', '01-home');
  await go('#pe:file-parse', '02-fileparse');
  await go('#pe:confirm/fp4', '03-confirm-fp4');
  await go('#pe:confirm/fa2', '03b-confirm-scan');
  await go('#pe:confirm/fp3', '03c-confirm-gp');
  await go('#pe:projects', '04-projects');
  await go('#pe:project/p-xinghe', '05-project-detail');
  await go('#pe:finance-config', '06-finance-config');
  await go('#pe:finance-config', '06b-finance-metrics'); // switch tab via evaluate
  await p.evaluate(() => { const btns = document.querySelectorAll('[data-act="finTab"]'); if(btns[1]) btns[1].click(); });
  await p.waitForTimeout(400);
  await p.screenshot({ path: shots + '06b-finance-metrics.png' });
  await go('#pe:chat/chat-1', '07-chat-standalone');
  await go('#pe:chat/chat-2', '07b-chat-project');
  await go('#pe:fund', '08-fund');
  await go('#pe:snapshot', '09-snapshot');
  await go('#pe:experts', '10-experts');
  await go('#pe:skills', '11-skills');

  console.log('\n=== ERRORS (' + errors.length + ') ===');
  errors.forEach(e => console.log(e));
  await b.close();
  process.exit(errors.length ? 1 : 0);
})();
