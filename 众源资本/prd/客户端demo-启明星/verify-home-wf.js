const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  const emojiRe = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

  async function emojiIn(sel) {
    return await page.$eval(sel, el => {
      const t = el.innerText || '';
      return /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t);
    }).catch(() => false);
  }

  // ---- HOME ----
  await page.goto('http://localhost:8765/index.html#pe:home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const home = await page.evaluate(() => ({
    workspace: !!document.querySelector('.po-home-workspace'),
    sources: document.querySelectorAll('.po-source-card').length,
    tasks: document.querySelectorAll('.po-task-row').length,
    spaceSelect: !!document.querySelector('#poHomeSpace'),
    spaceLabel: (document.querySelector('.po-home-sources-sub b')||{}).textContent || '',
    title: (document.querySelector('.po-toolbar h2')||{}).textContent || '',
  }));
  const homeEmoji = await emojiIn('#viewRoot');
  console.log('HOME:', JSON.stringify(home), 'emoji=', homeEmoji);

  // click a task row -> answer should appear in qa-zone
  const firstTask = await page.$('.po-task-row');
  if (firstTask) { await firstTask.click(); await page.waitForTimeout(300); }
  const qaShown = await page.$('.po-qa-zone .po-qa-card') ? true : false;
  console.log('HOME task-click -> qa card shown:', qaShown);

  // change space -> sources should re-filter
  const sel = await page.$('#poHomeSpace');
  if (sel) {
    const opts = await page.$$eval('#poHomeSpace option', os => os.map(o => o.value));
    if (opts.length > 1) { await sel.selectOption(opts[1]); await page.waitForTimeout(300); }
  }
  const afterSpace = await page.evaluate(() => ({
    spaceLabel: (document.querySelector('.po-home-sources-sub b')||{}).textContent || '',
    sources: document.querySelectorAll('.po-source-card').length,
  }));
  console.log('HOME after space change:', JSON.stringify(afterSpace));

  // ---- 工作流 (scenarios) ----
  await page.goto('http://localhost:8765/index.html#pe:scenarios', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const wf = await page.evaluate(() => ({
    title: (document.querySelector('.po-toolbar h2')||{}).textContent || (document.querySelector('.xb-scenario-section-title')? 'has-scenario' : ''),
    cards: document.querySelectorAll('.xb-scenario-card').length,
    navActive: (document.querySelector('.nav-item.active')||{}).textContent || '',
  }));
  const wfEmoji = await emojiIn('#viewRoot');
  console.log('WORKFLOW:', JSON.stringify(wf), 'emoji=', wfEmoji);

  await page.screenshot({ path: '/tmp/po-home-new.png' });
  await page.goto('http://localhost:8765/index.html#pe:scenarios', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/po-workflow.png' });

  console.log('CONSOLE ERRORS:', errs.length, errs.slice(0,10));
  await browser.close();
})();
