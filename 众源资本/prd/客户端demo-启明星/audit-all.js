const { chromium } = require('playwright');
const fs = require('fs');

const ROUTES = [
  ['home', '#pe:home'],
  ['file-parse', '#pe:file-parse'],
  ['projects', '#pe:projects'],
  ['project/p-xinghe', '#pe:project/p-xinghe'],
  ['fund', '#pe:fund'],
  ['post-browser', '#pe:post-browser'],
  ['scenarios', '#pe:scenarios'],
];

const COLLECT_SEL = '[data-act],[data-nav],[data-shell-nav],button,.po-snap-tab,.po-tab,.po-chip,.po-list-row,.po-recent-item,[data-scope-act],[data-scope-caret],.po-tree-leaf,.po-plus-item,.po-modal-x';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const allErrors = [];
  page.on('pageerror', e => allErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') allErrors.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });

  const report = [];
  let totalClicked = 0, totalDead = 0;

  for (const [name, hash] of ROUTES) {
    await page.evaluate(h => { location.hash = h; }, hash);
    await page.waitForTimeout(500);
    const targets = await page.evaluate((sel) => {
      const found = []; const seen = new Set();
      document.querySelectorAll(sel).forEach(el => {
        const act = el.getAttribute('data-act');
        const arg = el.getAttribute('data-arg');
        const nav = el.getAttribute('data-nav');
        let key, locator = null;
        if (act) { key = 'a:' + act + ':' + (arg || ''); locator = { act, arg }; }
        else if (nav) { key = 'n:' + nav; locator = { nav }; }
        else {
          const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30);
          const cls = (el.className || '').toString();
          key = 'c:' + cls + ':' + txt;
          locator = { cls, txt };
        }
        if (seen.has(key)) return; seen.add(key);
        found.push({ key, locator, txt: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24) });
      });
      return found.slice(0, 70); /* 每路由最多 70 个元素，控制总时长 */
    }, COLLECT_SEL);

    const routeDead = [];
    for (const t of targets) {
      const before = await page.evaluate(() => ({
        bodyLen: document.body.innerHTML.length,
        hash: location.hash,
        toast: (document.getElementById('toast') || {}).textContent || '',
      }));
      const clicked = await page.evaluate((loc) => {
        let el = null;
        if (loc.act) {
          el = document.querySelector('[data-act="' + loc.act + '"][data-arg="' + (loc.arg || '') + '"]') || document.querySelector('[data-act="' + loc.act + '"]');
        } else if (loc.nav) {
          el = document.querySelector('[data-nav="' + loc.nav + '"]');
        } else {
          const els = Array.from(document.querySelectorAll('[data-act],[data-nav],[data-shell-nav],button,.po-snap-tab,.po-tab,.po-chip,.po-list-row,.po-recent-item,[data-scope-act],[data-scope-caret],.po-tree-leaf,.po-plus-item,.po-modal-x'));
          el = els.find(e => ((e.className || '').toString() === loc.cls) && (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30) === loc.txt) || null;
        }
        if (el) { el.click(); return true; }
        return false;
      }, t.locator);
      totalClicked++;
      await page.waitForTimeout(280);
      const after = await page.evaluate(() => ({
        bodyLen: document.body.innerHTML.length,
        hash: location.hash,
        toast: (document.getElementById('toast') || {}).textContent || '',
      }));
      if (clicked) {
        const reacted = before.hash !== after.hash || before.bodyLen !== after.bodyLen || before.toast !== after.toast;
        if (!reacted) { routeDead.push(t.txt + (t.locator.act ? ' [' + t.locator.act + (t.locator.arg ? '/' + t.locator.arg : '') + ']' : '')); totalDead++; }
      } else {
        routeDead.push('NOT-FOUND ' + t.txt); totalDead++;
      }
      if (after.hash !== hash) {
        await page.evaluate(h => { location.hash = h; }, hash);
        await page.waitForTimeout(380);
      }
    }
    report.push({ route: name, hash, targetCount: targets.length, deadCount: routeDead.length, dead: routeDead });
    fs.writeFileSync('/Users/ctt/project/finstep/启明星/03-产品示意/启明星-完整能力Demo-v4.0-20260718/_verify/audit-progress.json', JSON.stringify({ done: name, totalDead }));
  }

  const out = { totalClicked, totalDead, routes: report, errors: allErrors.slice(0, 25), errorCount: allErrors.length };
  fs.writeFileSync('/Users/ctt/project/finstep/启明星/03-产品示意/启明星-完整能力Demo-v4.0-20260718/_verify/audit-result.json', JSON.stringify(out, null, 2));
  console.log('DONE totalDead=' + totalDead + ' errorCount=' + allErrors.length);
  await browser.close();
})();
