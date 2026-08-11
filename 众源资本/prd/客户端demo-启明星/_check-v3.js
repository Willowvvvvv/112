const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const base = 'http://127.0.0.1:8765';
  const shotsDir = path.join(__dirname, '_verify');
  const fs = require('fs');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

  const pages = [
    { name: 'home', hash: '#pe:home', desc: '首页-新建任务' },
    { name: 'chat-standalone', hash: '#pe:chat/c1', desc: '独立对话详情' },
    { name: 'chat-project', hash: '#pe:project/p1/chat/pc1', desc: '项目对话详情' },
    { name: 'file-parse', hash: '#pe:file-parse', desc: '文件解析' },
    { name: 'projects', hash: '#pe:projects', desc: '项目库' },
    { name: 'sidebar-more', hash: '#pe:home', desc: '更多浮层', openMore: true },
  ];

  for (const p of pages) {
    await page.goto(base + '/' + (p.hash || ''));
    await page.waitForTimeout(1200);
    
    if (p.openMore) {
      // 点击打开“更多”独立浮层
      const moreBtn = await page.$('#sidebarMoreToggle');
      if (moreBtn) {
        await moreBtn.click();
        await page.waitForTimeout(500);
      }
    }
    
    await page.screenshot({ path: path.join(shotsDir, `v3-${p.name}.png`), fullPage: false });
    console.log(`✓ ${p.name}: ${p.desc}`);
  }

  // Also test sidebar space expand
  await page.goto(base + '/#pe:home');
  await page.waitForTimeout(800);
  const spaceToggle = await page.$('.po-sb-caret[data-space-toggle]');
  if (spaceToggle) {
    await spaceToggle.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(shotsDir, 'v3-sidebar-expanded.png'), fullPage: false });
    console.log('✓ sidebar-expanded: 空间展开后');
  } else {
    console.log('✗ sidebar-expanded: 未找到空间展开按钮');
  }

  await browser.close();
  console.log('Done');
})();
