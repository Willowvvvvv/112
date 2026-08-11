const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(1100);
  const res = await page.evaluate(() => {
    const root = document.querySelector('#app') || document.body;
    const left = root.querySelector('.po-home-sources');
    const hero = root.querySelector('.po-home-hero');
    const greet = root.querySelector('.po-home-greet');
    const input = root.querySelector('#poHomeInput');
    const inputBox = input ? input.getBoundingClientRect() : null;
    const center = root.querySelector('.po-home-center');
    const centerBox = center ? center.getBoundingClientRect() : null;
    const wrap = root.querySelector('.po-input-wrap-hero');
    const chips = root.querySelectorAll('.po-chip').length;
    const recent = root.querySelector('.po-home-recent');
    const tasks = root.querySelectorAll('.po-task-row').length;
    const spaceBar = root.querySelector('#poHomeSpace');
    return {
      leftRemoved: !left,
      hasHero: !!hero,
      hasGreet: !!greet,
      hasInput: !!input,
      inputCentered: (inputBox && centerBox) ? Math.abs((inputBox.left + inputBox.width/2) - (centerBox.left + centerBox.width/2)) < 6 : false,
      inputWidth: inputBox ? Math.round(inputBox.width) : 0,
      inputHeight: inputBox ? Math.round(inputBox.height) : 0,
      hasHeroWrap: !!wrap,
      chips,
      hasRecent: !!recent,
      tasks,
      hasSpaceBar: !!spaceBar,
      emoji: (root.textContent.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length
    };
  });
  console.log(JSON.stringify(res, null, 2));
  console.log('JS errors:', errors.length ? errors : 'NONE');
  const pass = res.leftRemoved && res.hasHero && res.hasInput && res.inputCentered && res.chips >= 4 && res.hasRecent && res.inputWidth > 500 && errors.length === 0 && res.emoji === 0;
  console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
  await page.screenshot({ path: '_verify/home-center.png', fullPage: false });
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
