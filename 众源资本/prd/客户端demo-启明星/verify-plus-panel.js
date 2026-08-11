const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await p.evaluate(() => { location.hash = '#pe:home'; });
  await p.waitForTimeout(400);
  const out = {};

  // 召唤（菜单内）
  await p.evaluate(() => document.querySelector('#poHomePlus').click());
  await p.waitForTimeout(200);
  await p.evaluate(() => {
    const items = document.querySelectorAll('#poPlusMenu [data-plus-act]');
    for (const it of items) if (it.getAttribute('data-plus-act') === 'experts') { it.click(); break; }
  });
  await p.waitForTimeout(300);
  await p.evaluate(() => {
    const el = document.querySelector('#poPlusMenu [data-plus-act="summon"]');
    if (el) el.click();
  });
  await p.waitForTimeout(500);
  out.summon = await p.evaluate(() => ({
    menuClosed: document.getElementById('poPlusMenu').style.display === 'none',
    hash: location.hash,
    inputVal: document.getElementById('poHomeInput').value,
  }));

  // 技能（菜单内）
  await p.evaluate(() => document.querySelector('#poHomePlus').click());
  await p.waitForTimeout(200);
  await p.evaluate(() => {
    const items = document.querySelectorAll('#poPlusMenu [data-plus-act]');
    for (const it of items) if (it.getAttribute('data-plus-act') === 'skills') { it.click(); break; }
  });
  await p.waitForTimeout(300);
  out.skills = await p.evaluate(() => ({
    useCount: document.querySelectorAll('#poPlusMenu [data-plus-act="useSkill"]').length,
    hash: location.hash,
  }));
  // 使用技能
  await p.evaluate(() => {
    const el = document.querySelector('#poPlusMenu [data-plus-act="useSkill"]');
    if (el) el.click();
  });
  await p.waitForTimeout(500);
  out.useSkill = await p.evaluate(() => ({
    menuClosed: document.getElementById('poPlusMenu').style.display === 'none',
    hash: location.hash,
    inputVal: document.getElementById('poHomeInput').value,
  }));

  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
