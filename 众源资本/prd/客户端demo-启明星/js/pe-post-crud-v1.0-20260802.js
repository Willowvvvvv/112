/** 启明星项目库/基金管理轻量 CRUD 运行时仓 */
(function () {
  'use strict';

  var KEY = 'qmx:pe-post-crud:v5';
  var seed = window.PE_POST_DATA || {};
  function clone(v) { return JSON.parse(JSON.stringify(v || [])); }
  function now() { return new Date().toISOString().slice(0, 16).replace('T', ' '); }
  function uid(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      /* v4/v3→v5：沿用旧仓，下面再补 followOn 等种子字段 */
      var legacy = localStorage.getItem('qmx:pe-post-crud:v4') || localStorage.getItem('qmx:pe-post-crud:v3');
      if (legacy) return JSON.parse(legacy);
    } catch (e) {}
    return { projects: clone(seed.PROJECTS), funds: clone(seed.FUNDS) };
  }
  var state = read();
  /* v5：补齐档案 updates / 后续融资 / 投资阶段 / 穿透期间等种子字段 */
  (function migrateFormalValues(){
    var seedProjects=seed.PROJECTS||[], seedFunds=seed.FUNDS||[];
    function needSeedUpdates(cur, sf){
      if(!sf||!sf.updates||!sf.updates.length)return false;
      if(!cur.updates||!cur.updates.length)return true;
      /* 旧种子只有 summary/by/at，无 field/source 时用新种子覆盖 */
      return !cur.updates.some(function(u){return u&&(u.field||u.source||u.before||u.after);});
    }
    (state.funds||[]).forEach(function(f){
      delete f.nav; delete f.invested;
      if(f.status==='存续期')f.status='正常运作';
      var sf=seedFunds.find(function(x){return x.id===f.id;});
      if(sf){
        ['code','management','strategy','type','status','manager','committed','called','fullName','registeredPlace','direction','stageFocus','investPeriod','duration','fundSize','materialFolders','materials'].forEach(function(k){if(f[k]==null&&sf[k]!=null)f[k]=sf[k];});
        if(needSeedUpdates(f,sf))f.updates=clone(sf.updates);
        if((!f.underlyingProjects||!f.underlyingProjects.length)&&sf.underlyingProjects&&sf.underlyingProjects.length)f.underlyingProjects=clone(sf.underlyingProjects);
        if((!f.fundRelations||!f.fundRelations.length)&&sf.fundRelations&&sf.fundRelations.length)f.fundRelations=clone(sf.fundRelations);
        else if(sf.fundRelations&&sf.fundRelations.length){
          (f.fundRelations||[]).forEach(function(r){
            var sr=sf.fundRelations.find(function(x){return x.fundId===r.fundId;})||sf.fundRelations[0];
            if(!sr)return;
            ['investmentCost','periodEndNav','period','commitmentRatio','tvpi','dpi','moic','committed','called','distributed'].forEach(function(k){if(r[k]==null&&sr[k]!=null)r[k]=sr[k];});
          });
        }
      }
    });
    seedProjects.forEach(function(sp){
      if(!(state.projects||[]).some(function(p){return p.id===sp.id;})) state.projects.push(clone(sp));
    });
    (state.projects||[]).forEach(function(p){
      delete p.nav;
      var sp=seedProjects.find(function(x){return x.id===p.id;});
      if(!sp)return;
      if(!p.holding&&sp.holding)p.holding=clone(sp.holding);
      ['businessProgress','exitPlan','mainBusiness','businessProgressPeriod','contacts','bankAccounts','risks','terms','finNotes','businessUpdates','exitMilestones','externalPublic','materialFolders','materials','legalName','establishDate','registeredCapital','legalRep','businessStatus','address','province','stageIn','hasFollowOn','latestRoundDate','latestRound','latestValuation','postRoundRatio','followOnText','parentFundIds'].forEach(function(k){if((p[k]==null||p[k]==='')&&sp[k]!=null)p[k]=clone(sp[k]);});
      if((!p.periods||!p.periods.length)&&sp.periods&&sp.periods.length)p.periods=clone(sp.periods);
      if(needSeedUpdates(p,sp))p.updates=clone(sp.updates);
      (p.fundRelations||[]).forEach(function(r){var sr=(sp.fundRelations||[]).find(function(x){return x.fundId===r.fundId;});if(sr){['investmentCost','periodEndNav','period','commitmentRatio'].forEach(function(k){if(r[k]==null)r[k]=sr[k];});}});
    });
  })();
  function persist() {
    seed.PROJECTS = state.projects;
    seed.FUNDS = state.funds;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function projects(includeArchived) { return state.projects.filter(function (p) { return !p.isDeleted && (includeArchived || !p.archived); }); }
  function funds(includeArchived) { return state.funds.filter(function (f) { return !f.isDeleted && (includeArchived || !f.archived); }); }
  function project(id) { return state.projects.find(function (p) { return p.id === id && !p.isDeleted; }) || null; }
  function fund(id) { return state.funds.find(function (f) { return f.id === id && !f.isDeleted; }) || null; }
  function validateProject(input, isCreate) {
    if (isCreate || input.name != null) {
      if (!(input.name || '').trim()) throw new Error('请填写项目名称');
    }
    if (isCreate) {
      if (!(input.legalName || '').trim()) throw new Error('请填写企业名称');
      if (!(input.industry || '').trim()) throw new Error('请填写所属行业');
      if (['direct', 'lookthrough'].indexOf(input.type) < 0) throw new Error('请选择项目类型');
      if (['pre', 'deal', 'post'].indexOf(input.stage) < 0) throw new Error('请选择所属阶段');
      if (['早期', '中期', '成熟期'].indexOf(input.stageIn) < 0) throw new Error('请选择投资阶段');
    } else {
      if (input.type != null && ['direct', 'lookthrough'].indexOf(input.type) < 0) throw new Error('请选择项目类型');
      if (input.stage != null && ['pre', 'deal', 'post'].indexOf(input.stage) < 0) throw new Error('请选择所属阶段');
    }
  }
  function saveProject(input) {
    var old = input.id ? project(input.id) : null;
    validateProject(input, !old);
    var item = old || { id: uid('p'), periods: [], equityEvents: [], updates: [], pendingCount: 0 };
    var oldStage = item.stage;
    Object.keys(input).forEach(function (k) { if (k !== 'id' || input[k]) item[k] = input[k]; });
    if (input.name) item.name = String(item.name || '').trim();
    item.status = item.status || 'active';
    item.parentFundIds = item.parentFundIds || [];
    item.lastUpdate = now().slice(0, 10);
    item.updates = item.updates || [];
    if (oldStage && oldStage !== item.stage) {
      var labels = { pre: '投前', deal: '投中', post: '投后' };
      item.updates.push({ at: now(), by: '当前用户', summary: '阶段由' + labels[oldStage] + '改为' + labels[item.stage] });
    } else if (old) item.updates.push({ at: now(), by: '当前用户', summary: '更新项目档案' });
    else item.updates.push({ at: now(), by: '当前用户', summary: '新增项目' });
    if (!old) state.projects.unshift(item);
    persist();
    return item;
  }
  function saveFund(input) {
    var old = input.id ? fund(input.id) : null;
    if (!old) {
      if (!(input.name || '').trim()) throw new Error('请填写基金名称');
      if (!(input.fullName || '').trim()) throw new Error('请填写基金全称');
      if (!(input.manager || '').trim()) throw new Error('请填写管理人');
      if (['managed', 'external'].indexOf(input.management) < 0) throw new Error('请选择基金类别');
    }
    var item = old || { id: uid('fund'), management: 'managed', committed: 0, called: 0, updates: [] };
    Object.keys(input).forEach(function (k) { if (k !== 'id' || input[k]) item[k] = input[k]; });
    if (input.name) item.name = String(item.name || '').trim();
    item.strategy = item.strategy || 'mixed';
    item.status = item.status || '正常运作';
    item.management = item.management || 'managed';
    if (!item.fundRelations) item.fundRelations = (old && old.fundRelations) || [];
    item.type = item.management === 'external' ? '所投子基金' : (({ direct: '直投', fof: '母基金', mixed: '混合', other: '其他' })[item.strategy] || '混合');
    item.updates = item.updates || [];
    item.lastUpdate = now().slice(0, 10);
    item.updates.push({ at: now(), by: '当前用户', summary: old ? '更新基金档案' : '新增基金' });
    if (!old) state.funds.unshift(item);
    persist();
    return item;
  }
  function hasFacts(p) { return !!((p.periods || []).length || (p.materials || []).length || (p.equityEvents || []).length || (p.investAmount || 0) > 0); }
  function removeProject(id) {
    var p = project(id); if (!p) throw new Error('项目不存在');
    if (hasFacts(p)) { p.archived = true; p.status = 'archived'; persist(); return { mode: 'archive' }; }
    p.isDeleted = true; persist(); return { mode: 'delete' };
  }
  function removeFund(id) {
    var f = fund(id); if (!f) throw new Error('基金不存在');
    var used = projects(true).some(function (p) { return (p.parentFundIds || []).indexOf(id) >= 0 || p.targetFundId === id; })
      || funds(true).some(function(x){return x.id!==id && (x.fundRelations||[]).some(function(r){return r.fundId===id;});});
    if (used || (f.committed || 0) > 0 || (f.called || 0) > 0) { f.archived = true; persist(); return { mode: 'archive' }; }
    f.isDeleted = true; persist(); return { mode: 'delete' };
  }
  function fundPortfolio(id) {
    var directProjects = projects().filter(function(p){return p.type==='direct'&&(p.parentFundIds||[]).indexOf(id)>=0;});
    var investedFunds = funds().filter(function(f){return f.management==='external'&&(f.fundRelations||[]).some(function(r){return r.fundId===id;});});
    var lookthroughProjects = projects().filter(function(p){return p.type==='lookthrough'&&p.targetFundId===id;});
    return { directProjects:directProjects, investedFunds:investedFunds, lookthroughProjects:lookthroughProjects };
  }
  function projectInvestmentAmount(p) {
    if (!p) return 0;
    return Number(p.investAmount || 0);
  }
  function fundMetrics(id) {
    var currentFund = fund(id);
    var portfolio = fundPortfolio(id);
    if (currentFund && currentFund.management === 'external') {
      var rels = currentFund.fundRelations || [];
      var lpCost = 0, lpNav = 0, lpPeriods = [];
      rels.forEach(function(r){
        lpCost += Number(r.investmentCost != null ? r.investmentCost : (r.committed || 0));
        lpNav += Number(r.periodEndNav || 0);
        if (r.period && lpPeriods.indexOf(r.period) < 0) lpPeriods.push(r.period);
      });
      return {investmentCost:lpCost,totalValue:lpNav,directValue:0,fundNav:lpNav,period:lpPeriods.length===1?lpPeriods[0]:(lpPeriods.length?'多期间':'—')};
    }
    var directCost = portfolio.directProjects.reduce(function(s,p){return s+Number(p.investAmount||0);},0);
    var directValue = portfolio.directProjects.reduce(function(s,p){return s+Number(p.holding && p.holding.totalValue || 0);},0);
    var fundCost = 0, fundNav = 0, periods = [];
    portfolio.investedFunds.forEach(function(p){
      (p.fundRelations||[]).forEach(function(r){if(r.fundId===id){fundCost+=Number(r.investmentCost||0);fundNav+=Number(r.periodEndNav||0);if(r.period&&periods.indexOf(r.period)<0)periods.push(r.period);}});
    });
    return { investmentCost:directCost+fundCost, totalValue:directValue+fundNav, directValue:directValue, fundNav:fundNav, period:periods.length===1?periods[0]:'多期间' };
  }
  function filterProjects(criteria) {
    criteria = criteria || {};
    var q = (criteria.search || '').toLowerCase();
    return projects().filter(function (p) {
      if (criteria.stage && criteria.stage !== 'all' && p.stage !== criteria.stage) return false;
      if (criteria.stageIn && criteria.stageIn !== 'all') {
        var want = criteria.stageIn;
        var got = p.stageIn || '';
        var norm = function (v) {
          v = String(v || '').trim();
          if (v === '中后期' || v === '成长' || v === '成长期') return '中期';
          if (v === '成熟') return '成熟期';
          return v;
        };
        if (norm(got) !== norm(want)) return false;
      }
      if (criteria.type && criteria.type !== 'all' && p.type !== criteria.type) return false;
      if (criteria.fundId && criteria.fundId !== 'all' && (p.parentFundIds || []).indexOf(criteria.fundId) < 0 && p.targetFundId !== criteria.fundId) return false;
      if (criteria.owner && criteria.owner !== 'all' && (p.owner || '') !== criteria.owner) return false;
      if (criteria.industry && criteria.industry !== 'all' && (p.industry || '—') !== criteria.industry) return false;
      if (q && [p.name,p.industry,p.city,p.gpName,p.owner,p.sourceFundName].join(' ').toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function filterFunds(search) {
    var q = (search || '').toLowerCase();
    if (!q) return funds();
    return funds().filter(function (f) { return [f.name,f.code,f.type,f.strategy,f.manager].join(' ').toLowerCase().indexOf(q) >= 0; });
  }
  function importProjects(rows) { return (rows || []).map(saveProject); }
  persist();
  window.PE_POST_STORE = { projects: projects, funds: funds, project: project, fund: fund, saveProject: saveProject, saveFund: saveFund, removeProject: removeProject, removeFund: removeFund, fundPortfolio: fundPortfolio, fundMetrics:fundMetrics, projectInvestmentAmount:projectInvestmentAmount, filterProjects:filterProjects, filterFunds:filterFunds, importProjects: importProjects };
})();
