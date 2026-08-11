const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });

  const out = {};

  // 1) 项目库 nav 点击
  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(400);
  const navProjects = await page.$('[data-shell-nav="projects"]');
  out.navProjectsExists = !!navProjects;
  if (navProjects) {
    await page.evaluate(() => document.querySelector('[data-shell-nav="projects"]').click());
    await page.waitForTimeout(500);
    out.hashAfterClick = await page.evaluate(() => location.hash);
    out.projectsPage = await page.evaluate(() => {
      const cards = document.querySelectorAll('.xb-project-card').length;
      const empty = !!document.querySelector('.empty-hint');
      const body = !!document.querySelector('.page-body');
      const hasProjectsData = !!(window.PE_DATA && window.PE_DATA.projects && window.PE_DATA.projects.length);
      return { cards, empty, body, hasProjectsData };
    });
  }

  // 2) 首页最近任务宽度 + 查看全部
  await page.evaluate(() => { location.hash = '#pe:home'; });
  await page.waitForTimeout(400);
  out.home = await page.evaluate(() => {
    const recent = document.querySelector('.po-home-recent');
    const more = document.querySelector('.po-recent-more');
    const list = document.querySelector('.po-recent-list');
    const cs = recent ? getComputedStyle(recent) : null;
    return {
      recentMaxWidth: cs ? cs.maxWidth : null,
      recentWidth: recent ? recent.getBoundingClientRect().width : null,
      moreExists: !!more,
      moreText: more ? more.textContent.trim() : null,
      recentItems: document.querySelectorAll('.po-recent-item').length,
    };
  });

  // 3) 范围树一级节点勾选状态（全选默认）
  await page.evaluate(() => { location.hash = '#pe:post-browser'; });
  await page.waitForTimeout(500);
  out.scopeRoot = await page.evaluate(() => {
    const hs = Array.from(document.querySelectorAll('.po-scope-cat-h'));
    return hs.map(h => {
      const box = h.querySelector('.po-tree-box');
      return {
        label: (h.querySelector('.po-scope-cat-label') || {}).textContent,
        boxClass: box ? box.className : null,
        hasSvg: !!(box && box.querySelector('svg')),
      };
    });
  });

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
