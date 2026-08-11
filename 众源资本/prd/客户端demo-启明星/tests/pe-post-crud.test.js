const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadStore() {
  const memory = {};
  const seed = {
    PROJECTS: [{ id: 'p1', name: '直投一号', type: 'direct', stage: 'pre', stageIn: '早期', status: 'active', legalName: '直投一号科技有限公司', industry: '科技', periods: [] }],
    FUNDS: [{ id: 'mf1', name: '管理基金一号', fullName: '管理基金一号合伙企业（有限合伙）', manager: '众源资本', management: 'managed', strategy: 'mixed', status: '正常运作', committed: 0, called: 0 }]
  };
  const context = {
    window: { PE_POST_DATA: seed },
    localStorage: {
      getItem: key => memory[key] || null,
      setItem: (key, value) => { memory[key] = value; },
      removeItem: key => { delete memory[key]; }
    },
    Date, JSON
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'pe-post-crud-v1.0-20260802.js'), 'utf8'), context);
  return context.window.PE_POST_STORE;
}

test('新增并持久化直投项目', () => {
  const store = loadStore();
  const created = store.saveProject({ id: null, name: '星辰科技', legalName: '星辰科技有限公司', type: 'direct', stage: 'pre', stageIn: '早期', status: 'active', industry: '科技' });
  assert.match(created.id, /^p-/);
  assert.equal(store.projects().some(p => p.id === created.id && p.name === '星辰科技'), true);
});

test('所投子基金在基金管理新增，可关联母基金或暂不关联', () => {
  const store = loadStore();
  assert.doesNotThrow(() => store.saveFund({ name: '候选基金', fullName: '候选基金合伙企业（有限合伙）', manager: '纪源资本', management: 'external', fundRelations: [] }));
  assert.doesNotThrow(() => store.saveFund({ name: '交割基金', fullName: '交割基金合伙企业（有限合伙）', manager: '纪源资本', management: 'external', fundRelations: [{fundId:'mf1'}] }));
  assert.throws(() => store.saveProject({ name: '错误基金项目', legalName: '错误', industry: '科技', type: 'fund', stage: 'pre', stageIn: '早期' }), /项目类型/);
});

test('阶段可直接修改且写入普通更新记录', () => {
  const store = loadStore();
  store.saveProject({ id: 'p1', name: '直投一号', type: 'direct', stage: 'post', stageIn: '早期', status: 'active' });
  assert.equal(store.project('p1').stage, 'post');
  assert.equal(store.project('p1').updates.at(-1).summary, '阶段由投前改为投后');
});

test('有业务事实的项目只能归档，无业务事实可软删除', () => {
  const store = loadStore();
  store.saveProject({ id: 'p1', name: '直投一号', type: 'direct', stage: 'pre', stageIn: '早期', status: 'active', periods: [{ id: 'q1' }] });
  assert.equal(store.removeProject('p1').mode, 'archive');
  const fresh = store.saveProject({ name: '空项目', legalName: '空项目有限公司', industry: '科技', type: 'direct', stage: 'pre', stageIn: '早期', status: 'active' });
  assert.equal(store.removeProject(fresh.id).mode, 'delete');
  assert.equal(store.projects().some(p => p.id === fresh.id), false);
});

test('基金 CRUD 与项目组合关系同步', () => {
  const store = loadStore();
  const fund = store.saveFund({ name: '启明星母基金', fullName: '启明星母基金合伙企业（有限合伙）', manager: '众源资本', management: 'managed', strategy: 'mixed', status: '存续期' });
  store.saveFund({ name: '所投基金A', fullName: '所投基金A合伙企业（有限合伙）', manager: '纪源资本', management: 'external', fundRelations: [{fundId:fund.id,investmentCost:1000}] });
  const portfolio = store.fundPortfolio(fund.id);
  assert.equal(portfolio.investedFunds.length, 1);
  assert.equal(portfolio.investedFunds[0].name, '所投基金A');
});

test('项目支持关键词、阶段、类型和关联基金组合筛选', () => {
  const store = loadStore();
  store.saveProject({ name: '星河科技', legalName: '星河科技有限公司', type: 'direct', stage: 'post', stageIn: '早期', status: 'active', owner: '菜菜', industry: '科技', parentFundIds: ['mf1'] });
  store.saveProject({ name: '远航科技', legalName: '远航科技有限公司', type: 'lookthrough', stage: 'post', stageIn: '中期', status: 'active', owner: '佳琪', industry: '科技', targetFundId: 'sf1', sourceFundName: '远航基金' });
  assert.deepEqual(store.filterProjects({ search: '星河', stage: 'post', type: 'direct', fundId: 'mf1' }).map(p => p.name), ['星河科技']);
  assert.deepEqual(store.filterProjects({ owner: '佳琪' }).map(p => p.name), ['远航科技']);
  assert.deepEqual(store.filterProjects({ search: '远航基金' }).map(p => p.name), ['远航科技']);
});

test('基金支持名称、编号和策略搜索', () => {
  const store = loadStore();
  store.saveFund({ name: '启明星母基金', fullName: '启明星母基金合伙企业（有限合伙）', manager: '众源资本', management: 'managed', code: 'QMX-001', strategy: 'fof', status: '存续期' });
  assert.equal(store.filterFunds('QMX-001').length, 1);
  assert.equal(store.filterFunds('母基金').length, 1);
});

test('基金组合价值只从 T5 总价值和 T16 期末账户余额汇总', () => {
  const store = loadStore();
  store.saveProject({ name:'直投项目', legalName:'直投项目有限公司', industry:'科技', type:'direct', stage:'post', stageIn:'早期', parentFundIds:['mf1'], investAmount:100, holding:{totalValue:160,period:'2026Q2'} });
  store.saveFund({ name:'所投基金', fullName:'所投基金合伙企业（有限合伙）', manager:'纪源资本', management:'external', fundRelations:[{fundId:'mf1',investmentCost:200,periodEndNav:260,period:'2026Q2'}] });
  const metrics = store.fundMetrics('mf1');
  assert.equal(metrics.investmentCost, 300);
  assert.equal(metrics.totalValue, 420);
  assert.equal(metrics.directValue, 160);
  assert.equal(metrics.fundNav, 260);
  assert.equal(metrics.period, '2026Q2');
});

test('项目和基金详情按业务 Tab 展示，并提供当前 Tab 右侧目录', () => {
  const pages = fs.readFileSync(path.join(__dirname, '..', 'js', 'pages-pe-post-v1.0-20260801.js'), 'utf8');
  assert.match(pages, /概览.*投资与股权.*经营情况.*财务数据.*材料与更新|概览.*投资与股权.*经营与财务.*材料与更新/);
  assert.match(pages, /概览.*投资组合.*出资与回款.*期间表现.*材料/);
  assert.match(pages, /本页目录/);
  assert.match(pages, /data-act=\"detailJump\"/);
});
