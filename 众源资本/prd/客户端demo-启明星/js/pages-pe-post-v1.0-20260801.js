/**
 * 投后工作台页面 v1.0 — 完整投后流程交互
 * 首页(问数+待办) / 文件解析(上传+队列+收齐) / 确认页(7交互) / 项目库(阶段Tab) / 项目详情 / 基金管理 / 盘面视图
 * 统一设计系统：行式列表 / 统计条 / 标签 / 面板 / 表格
 */
(function () {
  'use strict';

  var D = function () { return window.PE_POST_DATA || {}; };
  var _ctx = null;

  /* —— 项目数据浏览器 / 范围 交互状态 —— */
  function _allLeafKeys() {
    var t = (D().BROWSER_TREE || []);
    var keys = [];
    t.forEach(function (g) { g.items.forEach(function (it) { keys.push(it.key); }); });
    return keys;
  }
  var BROWSER_STATE = {
    spaceId: null,
    visible: null,        /* 当前已生效（提取后）的可见指标；null = 全部 */
    pendingVisible: null, /* 待提取的可见指标（勾选即时反映到树，但不更新表格） */
    expanded: {},         /* cat -> bool（指标维度） */
    scopeIds: null,       /* null = 全部项目；否则为 Set<scopeId>（项目范围多选） */
    scopeExpanded: {},    /* scope node id -> bool */
    template: 't-post',
    search: ''
  };
  var HOME_STATE = { viewAll: false, draft: '', perm: '可编辑', toolbarOpen: null }; /* 首页“查看全部”弹层 + 输入框草稿 + 默认权限 + 工具栏展开态 */
  var SPACE_EDITOR_STATE = { open: false, editId: null, name: '', selected: [], primaryProjectId: null, adding: false };
  var PROJECT_FILTER = { stage: '全部', type: 'direct', fundId: 'all', owner: 'all', search: '' }; /* 项目库筛选态；类型默认直投 */
  var FUND_FILTER = { search: '', management: 'all', strategy: 'all', status: 'all', manager: 'all' };
  var SNAPSHOT_FILTER = { stageIn: 'all', type: 'all', fundId: 'all', owner: 'all', industry: 'all', search: '', extraDim: 'region' };
  var FUND_SNAP_STATE = { fundId: 'all', extraDim: 'region' };
  var DETAIL_STATE = { projectTabs:{}, fundTabs:{}, timeMachineNode:{}, timeMachineCompare:{}, publicSyncNote:{} };
  var KV_EDIT_STATE = {}; /* "kind|id|field" -> true: 当前正在行内编辑的字段 */
  var KV_EDIT_DRAFT = {}; /* "kind|id|field" -> string: 正在输入的草稿值 */
  var KV_EDIT_UNIT = {}; /* "kind|id|field" -> money unit key while editing */
  var PROJ_FIN_STATE = {}; /* 项目财务数据Tab状态: pid -> { subTab, unit, currency } */
  var CONFIRM_STATE = {};   /* 确认页字段操作真实态：fileId -> { fields:{idx:'accepted'|'rejected'}, submitted:bool } */
  var CONFIRM_SHEET_STATE = {}; /* 确认页当前激活的报表 Tab：fileId -> sheetName */
  var CONFIRM_SOURCE_STATE = {}; /* 项目级确认页当前查看的原始文件 */
  var STRUCTURED_VALUES = {}; /* 项目级确认页直接编辑的最终采用值 */
  var STRUCTURED_REMOVED = {}; /* 项目级确认页删除的误识别行 */
  var STRUCTURED_RIGHT_TAB = {}; /* 项目级确认页右侧：字段 / 业务进展 */
  var STRUCTURED_ACTIVE_FIELD = {}; /* 从来源定位到左侧的字段 */
  var STRUCTURED_BIZ_TAB = {};     /* 项目级确认页当前业务 Tab */
  var STRUCTURED_LOG_OPEN = false; /* 操作记录抽屉是否展开 */
  var STRUCTURED_OP_LOG = [];      /* 操作记录条目（会话内保留） */
  var CONFIRM_PREVIEW_COLLAPSED = false; /* 确认页默认原文＋解析双栏；可手动收起左栏专注核对 */
  var UNDER_FILTER = 'changed';   /* 底层项目筛：changed | all（未挂档只进右上角待处理，列表不再筛「要处理」） */
  var UNDER_DRAWER = null;         /* 行详情抽屉：项目简称 */
  var UNDER_PENDING_OPEN = true;   /* 底层待处理面板默认展开 */
  var UNDER_SHOW_EMPTY = false;    /* 行详情是否显示空字段 */
  var UNDER_LONG_EXPAND = {};      /* 长文展开：key -> true */
  var UNDER_SEC_COLLAPSE = {};     /* 行详情分区收起：secId -> true */
  var CURRENT_CONFIRM = null;
  var CURRENT_EXPORT_PAYLOAD = null; /* 文件解析详情页当前可导出的解析结果 */
  var PARSE_QUEUE_TAB = 'pending'; /* 文件解析右侧队列：pending | all */
  var PARSE_TARGET_MODE = 'existing';
  var PARSE_TARGET = '';
  var PARSE_TARGET_LABEL = '';
  var PARSE_TARGET_QUERY = '';
  var PARSE_TARGET_NEW_TYPE = 'direct'; /* direct | external | managed */
  var PARSE_TARGET_NEW_NAME = '';
  var PARSE_TASK_DELETED = {};
  var _SUGGEST_FUNDS = null;
  var _SUGGEST_PROJECTS = null;
  function _buildSuggestHtml(q) {
    var items = _parseTargetItems(D()).filter(function (it) {
      return !q || String(it.name).indexOf(q) !== -1;
    });
    if (!items.length) {
      return '<div style="position:absolute;left:0;right:0;top:44px;background:var(--po-bg);border:1px solid var(--po-border);border-radius:8px;z-index:99;box-shadow:0 4px 16px rgba(0,0,0,.12);padding:8px 12px;font-size:13px;color:var(--po-ink-3)">无匹配结果</div>';
    }
    var groups = [
      { key: '所投子基金', items: [] },
      { key: '管理基金', items: [] },
      { key: '直投项目', items: [] }
    ];
    items.forEach(function (it) {
      for (var i = 0; i < groups.length; i++) if (groups[i].key === it.type) groups[i].items.push(it);
    });
    var rows = '<div style="position:absolute;left:0;right:0;top:44px;background:var(--po-bg);border:1px solid var(--po-border);border-radius:8px;z-index:99;box-shadow:0 4px 16px rgba(0,0,0,.12);padding:4px 0">';
    var shown = 0;
    groups.forEach(function (g) {
      if (!g.items.length) return;
      rows += '<div style="padding:6px 12px 2px;font-size:11px;color:var(--po-ink-3);font-weight:600' + (shown ? ';margin-top:2px;border-top:1px solid var(--po-border)' : '') + '">— ' + g.key + ' —</div>';
      g.items.forEach(function (it) {
        rows += '<div class="po-suggest-item" data-act="parseTargetSelect" data-arg="' + it.id + '|' + it.name + '" style="padding:7px 12px;font-size:13px;cursor:pointer">' + it.name + '</div>';
      });
      shown++;
    });
    rows += '</div>';
    return rows;
  }
  var MARKET_STATE = { kind: 'skill', scope: 'official' }; /* 能力市场：kind=skill|expert|connector */
  var FIN_STATE = { tab: 'subjects', stmt: 'is', configId: null, subjectId: null, editMetricId: null, editRuleId: null, editTemplate: 'ratio', editSlots: [], editCustomFormula: '', editName: '', editUnit: '', editCat: '', editRuleName: '', editRuleType: '', editRuleStmt: '', editRuleFormula: '', editRuleTolerance: '', editRuleException: '', editPeriodId: null, editPeriodName: '', editPeriodDesc: '', editFundFieldId: null, editFFName: '', editFFUnit: '', editFFAliases: '', editFFPriority: '', editFFMethod: '', adminLogQ: '' }; /* 科目配置 */
  var FIN_CONFIRM_STATE = { stmt: 'bs', activePeriod: 4, periodOpen: false, trialView: null, showAll: false, deriveBannerClosed: false, filterUnbalanced: false }; /* 财务三表 */
  /* 结构化确认页：材料名是否已挂到档案；id -> linked|created */
  var ENTITY_LINK_STATE = {};
  var ENTITY_LINK_TARGET = {}; /* id -> { id, name, typeLabel } */
  var FUND_PARSE_ENTITIES = [
    { id: 'ent-jd', name: '京东工业品', srcVal: '京东工业品', status: 'matched', mapVal: '已有档案' },
    { id: 'ent-new-shenji', name: '申基生物', srcVal: '申基生物', status: 'unmatched', mapVal: '' }
  ];
  /* 确认页 Tab 与档案详情同名；旧态键名映射到新名 */
  var FUND_CONFIRM_TAB_MAP = {
    '基金基础': '概览', '投资信息': '底层项目', '期末持仓': '底层项目', '底层持仓': '底层项目',
    '资本账户': '出资与回款', '分配': '出资与回款', '财务': '出资与回款', '财务（资本账户）': '出资与回款',
    '业绩指标': '期间表现'
  };
  var DIRECT_CONFIRM_TAB_MAP = {
    '基础信息': '概览', '投资信息': '投资与股权', '期末持仓': '投资与股权',
    '业绩指标': '投资与股权', '企业与条款': '投资与股权',
    '业务进展': '经营情况', '经营情况': '经营情况', '退出规划': '经营情况', '后续融资情况': '经营情况',
    '财务（三表）': '财务数据'
  };
  function _remapConfirmTab(map, t) {
    return (map && map[t]) || t;
  }
  /* 客户《投后数据整理template》· GGV人民币二期 @2026Q1 */
  function _ggvTemplate() {
    return (typeof window !== 'undefined' && window.PE_FOF_TEMPLATE_GGV) ? window.PE_FOF_TEMPLATE_GGV : null;
  }
  function _fmtWan(v) {
    if (v === null || v === undefined || v === '') return '—';
    if (v === '—' || v === '-') return '—';
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  }
  function _fmtPct(v) {
    if (v === null || v === undefined || v === '') return '—';
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    if (n > 0 && n <= 1) return (n * 100).toFixed(2) + '%';
    return n.toFixed(2) + '%';
  }
  function _fmtMoic(v) {
    if (v === null || v === undefined || v === '') return '—';
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    return n.toFixed(2) + 'x';
  }
  function _fmtSignedWan(v) {
    if (v === null || v === undefined || v === '') return '—';
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    var s = Math.abs(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
    if (n > 0) return '+' + s;
    if (n < 0) return '-' + s;
    return '0';
  }
  function _statusLabel(st) {
    if (!st) return '—';
    if (st === 'writeoff') return '核销减值';
    return String(st);
  }
  function _holdingToRow(h, entMap) {
    var fv = h.fairValue != null && h.fairValue !== ''
      ? h.fairValue
      : (Number(h.realized || 0) + Number(h.unrealized || 0));
    var finPeriods = Array.isArray(h.financialPeriods) ? h.financialPeriods : [];
    var revRaw = h.revenue;
    var npRaw = h.netProfit;
    if (finPeriods.length) {
      var latestFin = finPeriods[finPeriods.length - 1];
      if (revRaw === '' || revRaw == null) revRaw = latestFin.revenue;
      if (npRaw === '' || npRaw == null) npRaw = latestFin.netProfit;
    }
    return {
      name: h.name,
      legalName: h.legalName || '—',
      industry: h.industry || '—',
      mainBiz: h.mainBiz || '—',
      amount: _fmtWan(h.investAmt),
      amountTotal: _fmtWan(h.investAmtTotal),
      round: (h.round || '').trim() || '—',
      lead: h.lead || '—',
      owner: h.owner || '—',
      firstInvestDate: h.firstInvestDate || '—',
      postVal: _fmtWan(h.postVal),
      share: h.share == null || h.share === '' ? '—' : h.share,
      costRemain: _fmtWan(h.remainCost != null && h.remainCost !== '' ? h.remainCost : h.investAmt),
      realized: _fmtWan(h.realized),
      unrealized: _fmtWan(h.unrealized),
      fv: _fmtWan(fv),
      moic: h.moic == null || h.moic === '' ? '—' : h.moic,
      fvChange: _fmtSignedWan(h.fvChange),
      status: _statusLabel(h.status),
      exitDate: h.exitDate === '' || h.exitDate == null ? '—' : String(h.exitDate),
      exitMethod: h.exitMethod || '—',
      exitAmt: _fmtWan(h.exitAmt),
      hasFollowOn: h.hasFollowOn || ((h.financingRounds && h.financingRounds.length) ? 'Y' : '—'),
      latestRoundDate: h.latestRoundDate || '—',
      latestRoundVal: (h.latestRoundVal === '' || h.latestRoundVal == null) ? '—' : _fmtWan(h.latestRoundVal),
      postRoundShare: h.postRoundShare == null || h.postRoundShare === '' ? '—' : h.postRoundShare,
      exitStatus: h.exitStatus || '—',
      ipoExpect: h.ipoExpect || '—',
      revenue: (revRaw === '' || revRaw == null) ? '—' : _fmtWan(revRaw),
      netProfit: (npRaw === '' || npRaw == null) ? '—' : _fmtWan(npRaw),
      financialPeriods: finPeriods,
      financingRounds: Array.isArray(h.financingRounds) ? h.financingRounds : [],
      entId: (entMap && entMap[h.name]) || null
    };
  }
  function _fundUnderlyingRows() {
    var tpl = _ggvTemplate();
    var entMap = { '京东工业品': 'ent-jd', '申基生物': 'ent-new-shenji' };
    if (tpl && tpl.holdings && tpl.holdings.length) {
      return tpl.holdings.map(function (h) { return _holdingToRow(h, entMap); });
    }
    return [
      _holdingToRow({ name: '京东工业品', legalName: '北京京东叁佰陆拾度电子商务有限公司', industry: '产业互联网', investAmt: 6645.4, investAmtTotal: 11075.67, round: 'A轮', lead: '领投', owner: '徐炳东', firstInvestDate: '2020-08-17', postVal: 2952166.9, share: 0.003531, remainCost: 6645.4, realized: 0, unrealized: 10423.61, fairValue: 10423.61, moic: 1.5685, fvChange: -1661.21, status: '在管', revenue: 11200, netProfit: 1450, financialPeriods: [{ label: '2025年度', revenue: 18500, netProfit: 2100 }, { label: '2026上半年', revenue: 11200, netProfit: 1450 }] }, entMap)
    ];
  }
  function _fundHoldingsCount() {
    return _fundUnderlyingRows().length;
  }
  function _ggvFundSnap() {
    var tpl = _ggvTemplate();
    return (tpl && tpl.fund) ? tpl.fund : null;
  }
  function _rowHasChange(r) {
    var ch = String(r.fvChange || '').replace(/,/g, '').replace(/\+/g, '');
    if (ch && ch !== '—' && ch !== '0' && ch !== '-0') return true;
    if (r.status === '退出' || r.status === '核销减值') return true;
    if (r.exitAmt && r.exitAmt !== '—') return true;
    /* 本季新增融资：看最新一轮日期是否落在本报告期附近；有史≠本季变动 */
    var d = String(r.latestRoundDate || '').trim();
    if (d && d !== '—') {
      if (/^2026([.\-/]|$)/.test(d)) return true;
      if (/^2025([.\-/]?)(1[0-2]|10|11|12)\b/.test(d) || /^2025\.(1[0-2])/.test(d)) return true;
    }
    return false;
  }
  function _rowNeedsAction(r) {
    return !_rowArchiveOk(r);
  }
  function _underFilterRows(rows, filter) {
    if (filter === 'need') return rows.filter(_rowNeedsAction);
    if (filter === 'changed') return rows.filter(_rowHasChange);
    return rows;
  }
  function _underSavedVal(saved, name, field, def) {
    var k = 'under:' + name + ':' + field;
    return saved[k] != null ? saved[k] : def;
  }
  function _underInput(saved, name, field, def) {
    var val = _underSavedVal(saved, name, field, def);
    var key = 'under:' + name + ':' + field;
    var moneyFields = { amount:1, amountTotal:1, fv:1, costRemain:1, realized:1, unrealized:1, postVal:1, exitAmt:1, latestRoundVal:1, revenue:1, netProfit:1 };
    var isFinMetric = /^fin:.+:(revenue|netProfit)$/.test(field);
    var dateFields = { exitDate:1 };
    var monthFields = { firstInvestDate:1, latestRoundDate:1 };
    if (dateFields[field]) {
      var dv = (val === '' || val == null || val === '—') ? '' : normalizeDateValue(val);
      return '<input class="po-under-input" type="date" data-structured-value="' + esc(key) + '" value="' + esc(dv) + '" onclick="event.stopPropagation()" />';
    }
    if (monthFields[field]) {
      var mv = (val === '' || val == null || val === '—') ? '' : normalizeMonthValue(val);
      return '<input class="po-under-input" type="month" data-structured-value="' + esc(key) + '" value="' + esc(mv) + '" onclick="event.stopPropagation()" />';
    }
    if (moneyFields[field] || isFinMetric) {
      var partsU = _toDisplayMoneyParts(field, val);
      var unit = partsU.unit;
      var num = partsU.num;
      return '<span class="po-input-with-unit po-under-unitwrap">'
        + '<input class="po-under-input" type="number" step="0.01" data-structured-value="' + esc(key) + '" data-money-unit="' + unit + '" value="' + (num === '' ? '' : num) + '" onclick="event.stopPropagation()" />'
        + '<span class="po-input-unit">' + esc(partsU.label) + '</span>'
        + '</span>';
    }
    if (field === 'share' || field === 'postRoundShare') {
      var pn = val === '' || val == null || val === '—' ? '' : Number(String(val).replace(/%/g, ''));
      if (pn !== '' && !isNaN(pn) && pn > 0 && pn <= 1) pn = +(pn * 100).toFixed(4);
      if (pn !== '' && isNaN(pn)) pn = '';
      return '<span class="po-input-with-unit po-under-unitwrap"><input class="po-under-input" type="number" step="0.01" data-structured-value="' + esc(key) + '" value="' + (pn === '' || pn == null || isNaN(pn) ? '' : pn) + '" onclick="event.stopPropagation()" /><span class="po-input-unit">%</span></span>';
    }
    if (field === 'moic') {
      var xn = val === '' || val == null || val === '—' ? '' : Number(String(val).replace(/x$/i, ''));
      if (xn !== '' && isNaN(xn)) xn = '';
      return '<span class="po-input-with-unit po-under-unitwrap"><input class="po-under-input" type="number" step="0.01" data-structured-value="' + esc(key) + '" value="' + (xn === '' || xn == null || isNaN(xn) ? '' : xn) + '" onclick="event.stopPropagation()" /><span class="po-input-unit">x</span></span>';
    }
    if (field === 'status') {
      var stOpts = ['在管', '部分退出', '完全退出', '核销减值'];
      var cur = String(val == null || val === '—' ? '' : val);
      return '<select class="po-under-input" data-structured-value="' + esc(key) + '" onclick="event.stopPropagation()">'
        + '<option value=""' + (cur === '' ? ' selected' : '') + '>—</option>'
        + stOpts.map(function (o) { return '<option value="' + esc(o) + '"' + (cur === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('')
        + '</select>';
    }
    if (field === 'hasFollowOn') {
      var hv = (val === 'Y' || val === '是' || val === true) ? '是' : ((val === 'N' || val === '否' || val === false) ? '否' : '');
      return '<select class="po-under-input" data-structured-value="' + esc(key) + '" onclick="event.stopPropagation()">'
        + '<option value=""' + (hv === '' ? ' selected' : '') + '>—</option>'
        + '<option value="是"' + (hv === '是' ? ' selected' : '') + '>是</option>'
        + '<option value="否"' + (hv === '否' ? ' selected' : '') + '>否</option></select>';
    }
    return '<input class="po-under-input" data-structured-value="' + esc(key) + '" value="' + esc(val == null ? '' : val) + '" onclick="event.stopPropagation()" />';
  }
  function _entityResolved(e) {
    if (!e) return true;
    if (e.status === 'matched') return true;
    return !!ENTITY_LINK_STATE[e.id];
  }
  function _rowArchiveOk(row) {
    if (!row.entId) return true;
    var ent = FUND_PARSE_ENTITIES.filter(function (e) { return e.id === row.entId; })[0];
    return _entityResolved(ent);
  }
  function _unmatchedParseEntities() {
    return FUND_PARSE_ENTITIES.filter(function (e) { return !_entityResolved(e); });
  }
  /* 未挂档提醒已收进「底层项目 · N 待处理」，不再在其它 Tab 顶挂横幅 */
  function _archivePickCandidates() {
    var extras = [
      { id: 'demo-shenji', name: '申基生物', type: 'lookthrough', typeLabel: '子基金穿透', meta: 'GGV底层 · 在管' },
      { id: 'demo-keya', name: '科亚医疗', type: 'lookthrough', typeLabel: '子基金穿透', meta: '科技 · B+轮' },
      { id: 'demo-moore', name: '摩尔线程', type: 'lookthrough', typeLabel: '子基金穿透', meta: '科技 · Pre-A' }
    ];
    var fromStore = ((D() && D().PROJECTS) || []).map(function (p) {
      var typeLabel = p.type === 'lookthrough' ? '子基金穿透' : (p.type === 'direct' ? '直投项目' : '项目');
      return {
        id: p.id,
        name: p.name,
        type: p.type || 'direct',
        typeLabel: typeLabel,
        meta: [p.industry, p.round || p.stageIn].filter(Boolean).join(' · ')
      };
    });
    var seen = {};
    var out = [];
    extras.concat(fromStore).forEach(function (it) {
      if (!it || !it.name || seen[it.name]) return;
      seen[it.name] = 1;
      out.push(it);
    });
    return out;
  }
  function _openArchivePickModal(entId) {
    var ent = FUND_PARSE_ENTITIES.filter(function (e) { return e.id === entId; })[0];
    if (!ent) return;
    var existing = document.getElementById('poArchivePickMask');
    if (existing) existing.remove();
    var all = _archivePickCandidates();
    var seed = String(ent.srcVal || ent.name || '').replace(/科技|有限公司|股份/g, '');
    var mask = document.createElement('div');
    mask.id = 'poArchivePickMask';
    mask.className = 'po-archive-pick-mask';
    mask.innerHTML = '<div class="po-archive-pick" role="dialog" aria-modal="true" aria-labelledby="poArchivePickTitle">'
      + '<header class="po-archive-pick-head"><div><h2 id="poArchivePickTitle">选已有档案</h2>'
      + '<p class="po-archive-pick-sub">材料原文「' + esc(ent.srcVal || ent.name) + '」· 选一个系统里已有的项目</p></div>'
      + '<button type="button" class="po-archive-pick-close" data-close="1" aria-label="关闭">×</button></header>'
      + '<div class="po-archive-pick-search"><input type="search" id="poArchivePickInput" placeholder="搜索项目名称" value="' + esc(seed) + '" autocomplete="off" /></div>'
      + '<div class="po-archive-pick-list" id="poArchivePickList"></div>'
      + '<footer class="po-archive-pick-foot"><span class="po-archive-pick-hint">没有合适的？关闭后点「新建档案」</span>'
      + '<button type="button" class="po-btn po-btn-sm" data-close="1">取消</button></footer></div>';
    document.body.appendChild(mask);

    function renderList(q) {
      var qq = String(q || '').trim().toLowerCase();
      var list = all.filter(function (it) {
        if (!qq) return true;
        return String(it.name).toLowerCase().indexOf(qq) >= 0
          || String(it.meta || '').toLowerCase().indexOf(qq) >= 0;
      });
      var box = mask.querySelector('#poArchivePickList');
      if (!box) return;
      if (!list.length) {
        box.innerHTML = '<div class="po-archive-pick-empty">没有匹配的档案</div>';
        return;
      }
      box.innerHTML = list.map(function (it) {
        return '<button type="button" class="po-archive-pick-row" data-pick-id="' + esc(it.id) + '" data-pick-name="' + esc(it.name) + '">'
          + '<strong>' + esc(it.name) + '</strong>'
          + '<span>' + esc(it.typeLabel) + (it.meta ? ' · ' + esc(it.meta) : '') + '</span>'
          + '</button>';
      }).join('');
    }
    function close() { mask.remove(); }
    mask.addEventListener('click', function (e) {
      if (e.target === mask || (e.target && e.target.getAttribute && e.target.getAttribute('data-close'))) close();
    });
    mask.querySelector('#poArchivePickList').addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-pick-id]') : null;
      if (!btn) return;
      ENTITY_LINK_STATE[entId] = 'linked';
      ENTITY_LINK_TARGET[entId] = { id: btn.getAttribute('data-pick-id'), name: btn.getAttribute('data-pick-name') };
      STRUCTURED_OP_LOG.push({
        time: (function () { var n = new Date(); return n.getHours() + ':' + String(n.getMinutes()).padStart(2, '0') + ':' + String(n.getSeconds()).padStart(2, '0'); })(),
        who: '王敏',
        msg: '选已有档案 · ' + (ent.srcVal || ent.name) + ' → ' + btn.getAttribute('data-pick-name')
      });
      close();
      toast('已将「' + ent.name + '」挂到「' + btn.getAttribute('data-pick-name') + '」');
      if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
    });
    var inp = mask.querySelector('#poArchivePickInput');
    if (inp) {
      inp.addEventListener('input', function () { renderList(inp.value); });
      setTimeout(function () { inp.focus(); inp.select(); }, 30);
    }
    renderList(seed);
  }
  var DEBATE_SETUP = { red: [], blue: [] };  /* 红蓝对抗：选定的红方/蓝方专家 id（多选，每方最多 4 位） */
  var DEBATE_PICK = { red: [], blue: [] };   /* 已确认开始对抗的专家 */
  function _visibleKeys() {           /* 已生效：表格用 */
    if (!BROWSER_STATE.visible) return _allLeafKeys();
    return BROWSER_STATE.visible;
  }
  function _setVisible(arr) { BROWSER_STATE.visible = arr && arr.length ? arr : null; }
  function _pendingKeys() {           /* 待提取：树用 */
    if (!BROWSER_STATE.pendingVisible) return _allLeafKeys();
    return BROWSER_STATE.pendingVisible;
  }
  function _setPending(arr) { BROWSER_STATE.pendingVisible = arr && arr.length ? arr : null; }
  function _toggleKey(key) {
    var cur = _pendingKeys();
    var i = cur.indexOf(key);
    if (i >= 0) cur.splice(i, 1); else cur.push(key);
    _setPending(cur);
  }
  function _currentSpace() {
    var d = D();
    var all = (d.SPACES || []).concat(d.CUSTOM_SPACES || []);
    for (var i = 0; i < all.length; i++) if (all[i].id === BROWSER_STATE.spaceId) return all[i];
    return null;
  }
  function _scopedProjects() {
    var all = D().PROJECTS || [];
    var ids = BROWSER_STATE.scopeIds;
    /* scopeIds 只存“叶子” id：直投项目 id 与 uf:基金:底层 id；聚合节点(direct/fof/基金)的勾选态由叶子派生，不入库 */
    function directIn(p) { return !ids || ids.has(p.id); }
    function fundHasAny(p) { return (p.underlyingProjects || []).some(function (u) { return !ids || ids.has('uf:' + p.id + ':' + u.id); }); }
    function ugIn(p, u) { return !ids || ids.has('uf:' + p.id + ':' + u.id); }
    var rows = [];
    all.forEach(function (p) {
      if (p.type === 'direct') {
        if (directIn(p)) rows.push(p);
      } else if (p.type === 'lookthrough' && directIn(p)) rows.push(p);
    });
    return rows;
  }
  /* —— 项目范围树（直投 / 基金投 → 基金 → 底层项目，多选） —— */
  function _buildScopeTree() {
    var projects = D().PROJECTS || [];
    var direct = [], lookthrough = [];
    projects.forEach(function (p) {
      if (p.type === 'direct') {
        direct.push({ id: p.id, label: p.name, leaf: true });
      } else if (p.type === 'lookthrough') lookthrough.push({ id:p.id, label:p.name, leaf:true });
    });
    return [
      { id: 'direct', label: '直投', children: direct },
      { id: 'lookthrough', label: '子基金穿透', children: lookthrough }
    ];
  }
  function _scopeLeaves(id) {
    /* 仅返回该节点下的“叶子” id（直投 id / uf:基金:底层 id），不含聚合节点自身 */
    var res = [];
    function collect(node) {
      if (node.leaf) { res.push(node.id); return; }
      (node.children || []).forEach(collect);
    }
    function walk(node) {
      if (node.id === id) { collect(node); return true; }
      return (node.children || []).some(function (c) { return walk(c); });
    }
    _buildScopeTree().forEach(walk);
    return res;
  }
  function _scopeState(id) {
    var ids = BROWSER_STATE.scopeIds;
    if (!ids) return 'on';
    var leaves = _scopeLeaves(id);
    if (!leaves.length) return '';
    var all = leaves.every(function (x) { return ids.has(x); });
    var some = leaves.some(function (x) { return ids.has(x); });
    return all ? 'on' : (some ? 'ind' : '');
  }
  function _allScopeLeaves() {
    /* 仅叶子 id，供首次切换时从“全选”出发初始化 */
    var acc = [];
    function walk(n) {
      if (n.leaf) { acc.push(n.id); return; }
      (n.children || []).forEach(walk);
    }
    _buildScopeTree().forEach(walk);
    return acc;
  }
  function _toggleScope(id) {
    var ids = BROWSER_STATE.scopeIds;
    if (!ids) ids = BROWSER_STATE.scopeIds = new Set(_allScopeLeaves()); /* 从“全部”出发 */
    var leaves = _scopeLeaves(id);
    var allIn = leaves.length && leaves.every(function (x) { return ids.has(x); });
    if (allIn) leaves.forEach(function (x) { ids.delete(x); });
    else leaves.forEach(function (x) { ids.add(x); });
    if (ids.size === 0) BROWSER_STATE.scopeIds = null;
  }
  function _scopeBox(state) {
    if (state === 'on') return '<span class="po-tree-box on">' + ICON_CHECK + '</span>';
    if (state === 'ind') return '<span class="po-tree-box ind"></span>';
    return '<span class="po-tree-box"></span>';
  }
  function _renderScopeNode(node, depth) {
    if (node.leaf) {
      var st = _scopeState(node.id);
      var pad = 28 + Math.max(0, depth - 1) * 16;
      return '<div class="po-tree-leaf' + (st === 'on' ? ' on' : '') + '" data-scope-act="toggle" data-arg="' + esc(node.id) + '" style="padding-left:' + pad + 'px">'
        + _scopeBox(st) + '<span>' + esc(node.label) + '</span></div>';
    }
    var open = BROWSER_STATE.scopeExpanded[node.id] === true; /* 默认收起，点击 caret 展开 */
    var padH = 14 + depth * 6;
    var kids = (node.children || []).map(function (c) { return _renderScopeNode(c, depth + 1); }).join('');
    return '<div class="po-scope-cat">'
      + '<div class="po-scope-cat-h" data-scope-act="toggle" data-arg="' + esc(node.id) + '" style="padding-left:' + padH + 'px">'
      +   _scopeBox(_scopeState(node.id))
      +   '<span class="po-scope-cat-label">' + esc(node.label) + '</span>'
      +   '<span class="po-tree-caret" data-scope-caret="' + esc(node.id) + '">' + (open ? '▾' : '▸') + '</span>'
      + '</div>'
      + (open ? '<div class="po-tree-leaves">' + kids + '</div>' : '')
      + '</div>';
  }

  /* ═══ 统一组件 ═══ */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var LIST_PAGER = { adminUsers: { page: 1, size: 10 }, adminLogs: { page: 1, size: 10 }, projects: { page: 1, size: 10 }, funds: { page: 1, size: 10 } };
  function _pagerState(key) {
    if (!LIST_PAGER[key]) LIST_PAGER[key] = { page: 1, size: 10 };
    return LIST_PAGER[key];
  }
  function _sortTimeDesc(arr, field) {
    return (arr || []).slice().sort(function (a, b) {
      var ta = String((a && a[field]) || '').replace(/^—$/, '');
      var tb = String((b && b[field]) || '').replace(/^—$/, '');
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      return ta < tb ? 1 : ta > tb ? -1 : 0;
    });
  }
  function _pageSlice(arr, key) {
    var st = _pagerState(key);
    var total = (arr || []).length;
    var pages = Math.max(1, Math.ceil(total / st.size) || 1);
    if (st.page > pages) st.page = pages;
    if (st.page < 1) st.page = 1;
    var start = (st.page - 1) * st.size;
    return { total: total, page: st.page, size: st.size, pages: pages, rows: (arr || []).slice(start, start + st.size) };
  }
  function _pagerBar(key, total) {
    var st = _pagerState(key);
    var pages = Math.max(1, Math.ceil((total || 0) / st.size) || 1);
    if (st.page > pages) st.page = pages;
    var sizes = [10, 50, 100];
    var sizeHtml = '<select class="po-pager-select" data-act="listPageSize" data-arg="' + esc(key) + '">'
      + sizes.map(function (n) {
        return '<option value="' + n + '"' + (st.size === n ? ' selected' : '') + '>' + n + ' 条/页</option>';
      }).join('')
      + '</select>';
    return '<div class="po-pager">'
      + '<span class="po-pager-total">共 ' + (total || 0) + ' 条</span>'
      + '<span class="po-pager-sizes"><span class="po-pager-label">每页</span>' + sizeHtml + '</span>'
      + '<span class="po-pager-nav">'
      + '<button type="button" class="po-btn po-btn-sm" data-act="listPage" data-arg="' + esc(key + '|prev') + '"' + (st.page <= 1 ? ' disabled' : '') + '>上一页</button>'
      + '<span class="po-pager-num">' + st.page + ' / ' + pages + '</span>'
      + '<button type="button" class="po-btn po-btn-sm" data-act="listPage" data-arg="' + esc(key + '|next') + '"' + (st.page >= pages ? ' disabled' : '') + '>下一页</button>'
      + '</span></div>';
  }
  function _pagerNavigate(key) {
    if (key.indexOf('admin') === 0) navigate('admin');
    else if (key === 'projects') navigate('projects');
    else if (key === 'funds') navigate('fund');
  }
  function _dataTable(headers, rows, emptyText) {
    if (!rows || !rows.length) return '<div class="po-empty">' + esc(emptyText || '暂无数据') + '</div>';
    var head = headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');
    var body = rows.map(function (r) {
      return '<tr>' + r.map(function (c) {
        if (c && typeof c === 'object') {
          var cls = c.num ? ' class="po-cell-num"' : (c.wrap ? ' class="po-cell-wrap"' : '');
          var title = c.title ? ' title="' + esc(c.title) + '"' : '';
          var inner = c.html != null ? c.html : esc(c.text == null || c.text === '' ? '—' : c.text);
          return '<td' + cls + title + '>' + inner + '</td>';
        }
        return '<td>' + esc(c == null || c === '' ? '—' : c) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    var shell = headers.length >= 5 ? 'po-table-shell' : 'po-table-shell po-table-shell-fit';
    return '<div class="' + shell + '"><table class="po-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }
  function _updatesListHtml(updates, fallbackAt, groupKeyPrefix) {
    if (!updates || !updates.length) return '<div class="po-empty">暂无更新记录</div>';
    var sorted = updates.slice().reverse();
    function rowCells(u) {
      var field = (u.field && u.field !== '—') ? u.field : (u.summary || '—');
      return [
        u.at || fallbackAt || '—',
        u.by || '当前用户',
        { text: field, wrap: true, title: u.summary || field },
        { text: u.before || '—', wrap: true },
        { text: u.after || '—', wrap: true },
        { text: u.source || '—', wrap: true }
      ];
    }
    function groupKey(u) {
      if (u.group) return String(u.group);
      var f = String(u.field || u.summary || '');
      if (/^财务/.test(f) || /利润表|资产负债表|现金流量表/.test(f)) return '财务·' + (u.period || u.at || '');
      if (/^底层|^穿透/.test(f)) return '底层·' + (u.entity || u.at || '');
      if (/租金/.test(f)) return '租金计划·' + (u.period || u.at || '');
      return '';
    }
    /* 按 groupKey + at 聚合成批；满 5 条折成可展开组，默认收起 */
    var blocks = [];
    var i = 0;
    while (i < sorted.length) {
      var u0 = sorted[i];
      var gk = groupKey(u0);
      if (!gk) {
        blocks.push({ type: 'row', u: u0 });
        i += 1;
        continue;
      }
      var j = i + 1;
      while (j < sorted.length && groupKey(sorted[j]) === gk && (sorted[j].at || '') === (u0.at || '')) j += 1;
      var chunk = sorted.slice(i, j);
      if (chunk.length >= 5) blocks.push({ type: 'group', key: gk, at: u0.at || fallbackAt || '', items: chunk });
      else chunk.forEach(function (u) { blocks.push({ type: 'row', u: u }); });
      i = j;
    }
    var flatRows = [];
    var groupHtml = '';
    blocks.forEach(function (b, bi) {
      if (b.type === 'row') {
        flatRows.push(rowCells(b.u));
        return;
      }
      if (flatRows.length) {
        groupHtml += _dataTable(['时间', '操作人', '字段', '变更前', '变更后', '来源'], flatRows, '暂无更新记录');
        flatRows = [];
      }
      var gKey = (groupKeyPrefix || 'upd') + '-' + bi + '-' + b.key;
      var inner = _dataTable(['时间', '操作人', '字段', '变更前', '变更后', '来源'], b.items.map(rowCells), '暂无更新记录');
      groupHtml += _collapsibleGroup(gKey, b.key + ' · 写入 ' + b.items.length + ' 项', b.at || '', inner, false);
    });
    if (flatRows.length) groupHtml += _dataTable(['时间', '操作人', '字段', '变更前', '变更后', '来源'], flatRows, '暂无更新记录');
    return groupHtml || _dataTable(['时间', '操作人', '字段', '变更前', '变更后', '来源'], sorted.map(rowCells), '暂无更新记录');
  }
  function _opLogTableHtml(entries) {
    var rows = (entries || []).map(function (e) {
      return [e.time || '—', e.who || '—', { text: e.msg || '—', wrap: true }];
    });
    return _dataTable(['时间', '操作人', '摘要'], rows, '暂无操作记录');
  }
  function _periodHistoryTable(periods) {
    if (!periods || !periods.length) return '<div class="po-empty">暂无历史期间数据</div>';
    var statusMap = { done: '已确认', pending: '待确认' };
    var rows = periods.slice().reverse().map(function (x) {
      return [
        x.label || x.id || '—',
        statusMap[x.status] || x.status || '—',
        x.moic != null ? x.moic + 'x' : '—',
        x.tvpi != null ? x.tvpi + 'x' : '—',
        x.dpi != null ? x.dpi + 'x' : '—'
      ];
    });
    return _dataTable(['期间', '状态', 'MOIC', 'TVPI', 'DPI'], rows);
  }

  function tag(cls, text) { return '<span class="po-tag ' + cls + '">' + esc(text) + '</span>'; }

  function stageTag(stage) {
    var map = { pre:['po-tag-stage-pre','投前'], deal:['po-tag-stage-deal','投中'], post:['po-tag-stage-post','投后'] };
    var m = map[stage] || ['po-tag-stage-pre','—'];
    return tag(m[0], m[1]);
  }
  function typeTag(type) {
    return type === 'lookthrough' ? tag('po-tag-type-fof','子基金穿透') : tag('po-tag-type-direct','直接投资');
  }
  function sourceTag(src) {
    var map = { extract:'po-tag-source-extract', derived:'po-tag-source-derived', manual:'po-tag-source-manual', conflict:'po-tag-status-pending', aiFallback:'po-tag-aifallback' };
    var labels = { extract:'提取', derived:'派生', manual:'人工', conflict:'冲突', aiFallback:'AI兜底' };
    var tips = { extract:'来自上传文件原文', derived:'由已确认数据按公式计算', manual:'由用户手工补充', conflict:'多个来源值不一致，需人工选择', aiFallback:'规则无法覆盖时由 AI 建议，必须人工确认' };
    return '<span class="po-tag ' + (map[src] || 'po-tag-source-extract') + '" title="' + esc(tips[src] || '') + '">' + esc(labels[src] || src) + '</span>';
  }
  function statusTag(status) {
    var map = { done:['po-tag-status-done','已确认'], pending:['po-tag-status-pending','待确认'], abnormal:['po-tag-status-abnormal','异常'] };
    var m = map[status] || ['po-tag-status-pending','待确认'];
    return tag(m[0], m[1]);
  }

  /* —— 文件物理类型标签（原生PDF/扫描件/Excel/图片） —— */
  function _fileTypeTag(ft) {
    var map = {
      'pdf-native':['po-tag-ftype','原生PDF'],
      'pdf-scan':['po-tag-ftype po-tag-ftype-scan','扫描件'],
      'excel':['po-tag-ftype','Excel'],
      'word':['po-tag-ftype','Word'],
      'image':['po-tag-ftype po-tag-ftype-scan','图片'],
    };
    var m = map[ft] || ['po-tag-ftype', ft || '文件'];
    return '<span class="po-tag ' + m[0] + '" title="原文文件类型">' + esc(m[1]) + '</span>';
  }
  /* —— 解析方式标签（直读/OCR/单元格） —— */
  function _parseModeTag(pm) {
    var map = { direct:['po-tag-pmode','直读'], ocr:['po-tag-pmode po-tag-pmode-ocr','OCR'], cell:['po-tag-pmode','单元格'] };
    var m = map[pm] || ['po-tag-pmode', pm || ''];
    var tip = pm === 'ocr' ? '扫描件通过 OCR 识别' : (pm === 'cell' ? '直接读取 Excel 单元格' : '直接读取文档文本与表格');
    return m[1] ? '<span class="po-tag ' + m[0] + '" title="' + tip + '">' + esc(m[1]) + '</span>' : '';
  }

  function fmtMoney(v) {
    /* 档案／列表跟 getArchiveMoneyUnit；确认页核对用 getConfirmMoneyUnit */
    if (v == null || v === '' || isNaN(Number(v))) return '—';
    var wan = Number(v);
    var unit = getArchiveMoneyUnit();
    var numStr = moneyWanToUnit(wan, unit);
    if (numStr === '' || numStr == null) return '—';
    var n = Number(numStr);
    if (isNaN(n)) return String(numStr) + ' ' + moneyUnitLabel(unit);
    var shown = (unit === 'yuan' || unit === 'wan')
      ? Math.round(n).toLocaleString()
      : Number(n.toFixed(4)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    return shown + ' ' + moneyUnitLabel(unit);
  }

  /* 金额／资本：存储为「万元」数值；展示带单位，编辑只改数字 */
  function parseCapitalToWan(s) {
    if (s == null || s === '') return null;
    if (typeof s === 'number') return isNaN(s) ? null : s;
    var t = String(s).replace(/,/g, '').replace(/\s/g, '').trim();
    if (!t || t === '—') return null;
    t = t.replace(/^约/, '');
    var yi = t.match(/^([+-]?\d+(?:\.\d+)?)亿/);
    if (yi) return Number(yi[1]) * 10000;
    var baiwan = t.match(/^([+-]?\d+(?:\.\d+)?)百万/);
    if (baiwan) return Number(baiwan[1]) * 100;
    var wan = t.match(/^([+-]?\d+(?:\.\d+)?)万/);
    if (wan) return Number(wan[1]);
    var yuan = t.match(/^([+-]?\d+(?:\.\d+)?)元$/);
    if (yuan) return Number(yuan[1]) / 10000;
    var n = Number(t.replace(/[^\d.+-]/g, ''));
    return isNaN(n) ? null : n;
  }
  function fmtCapitalWan(v) {
    var n = parseCapitalToWan(v);
    if (n == null) return '—';
    return fmtMoney(n);
  }
  function normalizeDateValue(v) {
    if (v == null || v === '' || v === '—') return '';
    var s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}$/.test(s)) return s + '-01';
    if (/^\d{4}$/.test(s)) return s + '-01-01';
    var m = s.match(/^(\d{4})[./年](\d{1,2})[./月](\d{1,2})/);
    if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
    return '';
  }
  function normalizeMonthValue(v) {
    if (v == null || v === '' || v === '—') return '';
    var s = String(v).trim();
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(0, 7);
    if (/^\d{4}$/.test(s)) return s + '-01';
    var m = s.match(/^(\d{4})[./年](\d{1,2})/);
    if (m) return m[1] + '-' + ('0' + m[2]).slice(-2);
    return '';
  }
  function normalizeYearValue(v) {
    if (v == null || v === '' || v === '—') return '';
    var s = String(v).trim();
    var m = s.match(/^(\d{4})/);
    return m ? m[1] : '';
  }
  function _moneyInput(name, value, unitHint) {
    /* 档案新建／编辑跟档案展示单位，不跟确认页核对单位 */
    var unit = unitHint || getArchiveMoneyUnit();
    var parts = _toDisplayMoneyParts(name, value, unit);
    var num = parts.wan == null ? '' : moneyWanToUnit(parts.wan, unit);
    return '<span class="po-input-with-unit">'
      + '<input name="' + name + '" type="number" step="0.01" value="' + (num === '' ? '' : num) + '" data-money-unit="' + unit + '">'
      + '<span class="po-input-unit">' + esc(moneyUnitLabel(unit)) + '</span>'
      + '</span>';
  }
  function _percentInput(name, value) {
    var n = value == null || value === '' ? '' : Number(String(value).replace(/%/g, ''));
    if (n !== '' && isNaN(n)) n = '';
    return '<span class="po-input-with-unit"><input name="' + name + '" type="number" step="0.01" value="' + n + '"><span class="po-input-unit">%</span></span>';
  }
  function _numMoney(overlay, name) {
    var inp = overlay.querySelector('[name="' + name + '"]');
    if (!inp) return 0;
    var unit = inp.getAttribute('data-money-unit') || 'wan';
    var wan = moneyUnitToWan(inp.value, unit);
    return wan == null ? 0 : wan;
  }

  /* 金额单位：内部以「万元」为基准；确认页右栏与档案展示可分别记忆 */
  var MONEY_UNIT_DEFS = [
    { key: 'yuan', label: '元', toWan: 1 / 10000 },
    { key: 'wan', label: '万元', toWan: 1 },
    { key: 'baiwan', label: '百万元', toWan: 100 },
    { key: 'yi', label: '亿元', toWan: 10000 }
  ];
  function _readMoneyUnitKey(storageKey) {
    try {
      var u = localStorage.getItem(storageKey);
      if (u && MONEY_UNIT_DEFS.some(function (d) { return d.key === u; })) return u;
    } catch (e) {}
    return 'wan';
  }
  function _writeMoneyUnitKey(storageKey, unit) {
    var u = unit || 'wan';
    if (!MONEY_UNIT_DEFS.some(function (d) { return d.key === u; })) u = 'wan';
    try { localStorage.setItem(storageKey, u); } catch (e) {}
    return u;
  }
  function getConfirmMoneyUnit() { return _readMoneyUnitKey('pe_confirm_money_unit'); }
  function setConfirmMoneyUnit(unit) { return _writeMoneyUnitKey('pe_confirm_money_unit', unit); }
  function getArchiveMoneyUnit() { return _readMoneyUnitKey('pe_archive_money_unit'); }
  function setArchiveMoneyUnit(unit) { return _writeMoneyUnitKey('pe_archive_money_unit', unit); }
  /* 兼容旧调用名：确认页核对单位 */
  function getGlobalMoneyUnit() { return getConfirmMoneyUnit(); }
  function setGlobalMoneyUnit(unit) { return setConfirmMoneyUnit(unit); }
  function moneyUnitLabel(key) {
    var d = MONEY_UNIT_DEFS.filter(function (u) { return u.key === key; })[0];
    return d ? d.label : '万元';
  }
  function moneyUnitToWan(n, unit) {
    if (n === '' || n == null) return null;
    var num = Number(n);
    if (isNaN(num)) return null;
    var d = MONEY_UNIT_DEFS.filter(function (u) { return u.key === (unit || 'wan'); })[0] || MONEY_UNIT_DEFS[1];
    return num * d.toWan;
  }
  function moneyWanToUnit(wan, unit) {
    if (wan == null || wan === '' || isNaN(wan)) return '';
    var d = MONEY_UNIT_DEFS.filter(function (u) { return u.key === (unit || 'wan'); })[0] || MONEY_UNIT_DEFS[1];
    var v = Number(wan) / d.toWan;
    if (unit === 'yuan') return Math.round(v);
    var s = v.toFixed(6).replace(/\.?0+$/, '');
    return s === '-0' ? '0' : s;
  }
  /* 三表识别：原文按「元」；确认页展示跟右栏单位换算 */
  function _parseAccountingYuan(s) {
    if (s == null || s === '' || s === '—') return null;
    var t = String(s).replace(/,/g, '').trim();
    if (!t || /%|／|\//.test(t) || /审计|未审计/.test(t)) return null;
    var n = Number(t);
    return isNaN(n) ? null : n;
  }
  function _fmtYuanToGlobalDisplay(s) {
    var yuan = _parseAccountingYuan(s);
    if (yuan == null) return s == null ? '' : String(s);
    var num = moneyWanToUnit(yuan / 10000, getGlobalMoneyUnit());
    if (num === '' || num == null) return String(s);
    var n = Number(num);
    if (isNaN(n)) return String(num);
    return getGlobalMoneyUnit() === 'yuan' ? Math.round(n).toLocaleString() : String(num);
  }
  function _globalDisplayToYuanString(displayStr) {
    var t = String(displayStr == null ? '' : displayStr).replace(/,/g, '').trim();
    if (!t || t === '—') return t;
    var wan = moneyUnitToWan(t, getGlobalMoneyUnit());
    if (wan == null) return String(displayStr);
    var yuan = Math.round(wan * 10000);
    return yuan.toLocaleString('en-US');
  }
  function detectMoneyUnit(label, value) {
    var lab = String(label || '');
    var val = String(value == null ? '' : value);
    if (/亿元|亿\b/.test(val) || /（亿元）|\(亿元\)|亿元/.test(lab)) return 'yi';
    if (/百万元/.test(val) || /百万元/.test(lab)) return 'baiwan';
    if (/(^|[^\u4e00-\u9fff])元([^\u4e00-\u9fff]|$)/.test(val.replace(/万元|亿元|百万元/g, '')) && /元/.test(val) && !/万|亿/.test(val)) return 'yuan';
    if (/万元|万\b/.test(val) || /（万元）|\(万元\)|万元/.test(lab)) return 'wan';
    if (/亿/.test(lab)) return 'yi';
    return getGlobalMoneyUnit();
  }
  function _moneyUnitSelectHtml(selected, attrs) {
    return '<select class="po-input-unit-select po-global-money-unit"' + (attrs || '') + '>'
      + MONEY_UNIT_DEFS.map(function (u) {
          return '<option value="' + u.key + '"' + (u.key === selected ? ' selected' : '') + '>' + u.label + '</option>';
        }).join('')
      + '</select>';
  }
  function _confirmMoneyUnitBarHtml() {
    var u = getConfirmMoneyUnit();
    return '<div class="po-money-unit-bar po-money-unit-bar--confirm">'
      + '<span class="po-money-unit-bar-lab">金额单位</span>'
      + _moneyUnitSelectHtml(u, ' data-act="setConfirmMoneyUnit" aria-label="确认页金额单位"')
      + '</div>';
  }
  function _composeMoneyValue(numStr, unit) {
    if (numStr === '' || numStr == null) return '';
    return String(numStr) + ' ' + moneyUnitLabel(unit || getGlobalMoneyUnit());
  }
  function _toDisplayMoneyParts(label, value, forceUnit) {
    var wan = typeof parseCapitalToWan === 'function' ? parseCapitalToWan(value) : null;
    if (wan == null) {
      var srcU = detectMoneyUnit(label, value);
      var rawN = String(value == null ? '' : value).replace(/,/g, '').replace(/[^\d.\-]/g, '');
      wan = moneyUnitToWan(rawN, srcU);
    }
    var unit = forceUnit || getConfirmMoneyUnit();
    return { wan: wan, unit: unit, num: wan == null ? '' : moneyWanToUnit(wan, unit), label: moneyUnitLabel(unit) };
  }

  /* 确认页／解析详情：金额跟右栏确认单位展示；档案表单另走档案展示单位 */
  function _confirmStripLabelUnit(label) {
    return String(label || '')
      .replace(/[（(]\s*(万元|亿元|百万元|万|亿|元|%|ｘ|x)\s*[）)]/gi, '')
      .replace(/\s+$/, '');
  }
  function _confirmKindByLabel(lab) {
    if (/流水|变动说明|较上期/.test(lab)) return 'text';
    if (/期间码|报告期间(?!（截止)|数据期间|投资期|存续期/.test(lab)) return 'text';
    if (/首次投资|投资日期|发生月|预计月|最新一轮融资日期/.test(lab)) return 'month';
    if (/成立日期|分配通知日期|融资日期|退出日期|退出时间|截止日|记录日期|日期/.test(lab)) return 'date';
    if (/成立年份|年份$/.test(lab)) return 'year';
    if (/退出状态/.test(lab)) return 'select:在管|部分退出|完全退出|核销减值';
    if (/经营状态/.test(lab)) return 'select:存续|注销|吊销|迁出|其他';
    if (/是否有后续|领投者\(Y\/N\)|领投者（Y\/N）/.test(lab)) return 'bool';
    if (/MOIC|TVPI|DPI|倍数|回报/.test(lab)) return 'multiple';
    if (/比例|进度|持股|占比/.test(lab) && !/变动/.test(lab)) return 'percent';
    if (/(金额|估值|成本|资本|权益|分配|认缴|实缴|公允价值|本金|NAV|收入|净利润|增值|注册资本|价值)/.test(lab) && !/流水/.test(lab)) return 'money';
    return '';
  }
  function _confirmDetectKind(label, value) {
    var lab = String(label || '');
    var raw = value == null ? '' : value;
    var byLab = _confirmKindByLabel(lab);
    if (byLab === 'text' || (byLab && byLab.indexOf('select:') === 0) || byLab === 'bool') return byLab || 'text';
    if (byLab === 'date' || byLab === 'month' || byLab === 'year') return byLab;
    if (typeof raw === 'number') {
      return byLab || 'text';
    }
    var val = String(raw).trim();
    if (!val || val === '—' || val === '-') {
      return byLab || 'text';
    }
    /* 复合叙述：日期·金额、并列倍数、带括号说明等，整串文本，不拆数字框 */
    if (/[·]/.test(val) || /[／/]/.test(val)) return 'text';
    if (/[（(].+[）)]/.test(val) && /%|万|亿|x/i.test(val)) return 'text';
    if (/[^\d,.\s+\-%万亿元xX约]/.test(val.replace(/,/g, '')) && /%|万|亿|x/i.test(val)) return 'text';
    /* 纯日期串 */
    if (/^\d{4}-\d{2}-\d{2}/.test(val) || /^\d{4}[./年]\d{1,2}[./月]\d{1,2}/.test(val)) {
      return byLab === 'month' ? 'month' : 'date';
    }
    if (/^\d{4}-\d{2}$/.test(val) || /^\d{4}[./年]\d{1,2}月?$/.test(val)) return 'month';
    if (/^\d{4}$/.test(val) && /年/.test(lab)) return 'year';
    var compact = val.replace(/\s/g, '');
    if (/x$/i.test(compact) || (byLab === 'multiple' && /^[+-]?[\d,]+(\.\d+)?x?$/i.test(compact))) return 'multiple';
    if (/%$/.test(compact) || (byLab === 'percent' && /^[+-]?[\d,]+(\.\d+)?%?$/.test(compact))) return 'percent';
    if (/[万亿]/.test(val) || (byLab === 'money' && /^约?[+-]?[\d,]+/.test(compact))) return 'money';
    return byLab || 'text';
  }
  /* 冲突来源等只读展示：数字与单位之间留空格（不改原始 adopt 值） */
  function _confirmFmtDisplay(label, value) {
    var kind = _confirmDetectKind(label, value);
    if (kind === 'money') {
      var unit = detectMoneyUnit(label, value);
      var wan = parseCapitalToWan(value);
      if (wan == null) return String(value == null ? '' : value);
      var disp = moneyWanToUnit(wan, unit);
      return disp + ' ' + moneyUnitLabel(unit);
    }
    if (kind === 'percent') {
      var pn = value == null || value === '' || value === '—' ? null : Number(String(value).replace(/%/g, '').replace(/,/g, '').trim());
      return pn == null || isNaN(pn) ? String(value == null ? '' : value) : (pn + ' %');
    }
    if (kind === 'multiple') {
      var xn = value == null || value === '' || value === '—' ? null : Number(String(value).replace(/x$/i, '').replace(/,/g, '').trim());
      return xn == null || isNaN(xn) ? String(value == null ? '' : value) : (xn + ' x');
    }
    return String(value == null ? '' : value);
  }
  function _confirmFieldInput(key, label, value, opts) {
    opts = opts || {};
    var kind = _confirmDetectKind(label, value);
    var aria = esc(_confirmStripLabelUnit(label));
    var unc = opts.uncertain ? ' is-uncertain' : '';
    if (kind === 'date') {
      var dv = normalizeDateValue(value);
      return '<input class="po-result-input' + unc + '" type="date" data-structured-value="' + esc(key) + '" value="' + esc(dv) + '" aria-label="' + aria + '">';
    }
    if (kind === 'month') {
      var mv = normalizeMonthValue(value);
      return '<input class="po-result-input' + unc + '" type="month" data-structured-value="' + esc(key) + '" value="' + esc(mv) + '" aria-label="' + aria + '">';
    }
    if (kind === 'year') {
      var yv = normalizeYearValue(value);
      return '<input class="po-result-input' + unc + '" type="number" min="1900" max="2100" step="1" data-structured-value="' + esc(key) + '" value="' + esc(yv) + '" aria-label="' + aria + '">';
    }
    if (kind === 'money') {
      var partsM = _toDisplayMoneyParts(label, value);
      return '<span class="po-input-with-unit">'
        + '<input class="po-result-input' + unc + '" type="number" step="0.01" data-structured-value="' + esc(key) + '" data-money-unit="' + partsM.unit + '" value="' + (partsM.num === '' ? '' : partsM.num) + '" aria-label="' + aria + '">'
        + '<span class="po-input-unit">' + esc(partsM.label) + '</span>'
        + '</span>';
    }
    if (kind === 'percent') {
      var pn = value == null || value === '' || value === '—' ? '' : Number(String(value).replace(/%/g, '').replace(/,/g, '').trim());
      if (pn !== '' && isNaN(pn)) pn = '';
      return '<span class="po-input-with-unit"><input class="po-result-input' + unc + '" type="number" step="0.01" data-structured-value="' + esc(key) + '" value="' + (pn === '' || pn == null || isNaN(pn) ? '' : pn) + '" aria-label="' + aria + '"><span class="po-input-unit">%</span></span>';
    }
    if (kind === 'multiple') {
      var xn = value == null || value === '' || value === '—' ? '' : Number(String(value).replace(/x$/i, '').replace(/,/g, '').trim());
      if (xn !== '' && isNaN(xn)) xn = '';
      return '<span class="po-input-with-unit"><input class="po-result-input' + unc + '" type="number" step="0.01" data-structured-value="' + esc(key) + '" value="' + (xn === '' || xn == null || isNaN(xn) ? '' : xn) + '" aria-label="' + aria + '"><span class="po-input-unit">x</span></span>';
    }
    if (kind === 'bool') {
      var bv = (value === true || value === '是' || value === 'Y' || value === 'y' || value === '1') ? '是'
        : ((value === false || value === '否' || value === 'N' || value === 'n' || value === '0') ? '否' : '');
      return '<select class="po-result-input' + unc + '" data-structured-value="' + esc(key) + '" aria-label="' + aria + '">'
        + '<option value=""' + (bv === '' ? ' selected' : '') + '>—</option>'
        + '<option value="是"' + (bv === '是' ? ' selected' : '') + '>是</option>'
        + '<option value="否"' + (bv === '否' ? ' selected' : '') + '>否</option></select>';
    }
    if (kind && String(kind).indexOf('select:') === 0) {
      var selOpts = String(kind).slice(7).split('|').filter(Boolean);
      var cur = String(value == null || value === '—' ? '' : value);
      return '<select class="po-result-input' + unc + '" data-structured-value="' + esc(key) + '" aria-label="' + aria + '">'
        + '<option value=""' + (cur === '' ? ' selected' : '') + '>—</option>'
        + selOpts.map(function (o) {
            return '<option value="' + esc(o) + '"' + (cur === o ? ' selected' : '') + '>' + esc(o) + '</option>';
          }).join('')
        + '</select>';
    }
    return '<input class="po-result-input' + unc + '" data-structured-value="' + esc(key) + '" value="' + esc(value == null ? '' : value) + '" />';
  }

  function toolbar(title, rightHtml) {
    return '<div class="po-toolbar"><h2>' + esc(title) + '</h2><div class="po-toolbar-spacer"></div>' + (rightHtml || '') + '</div>';
  }

  function statStrip(stats) {
    return '<div class="po-stats">' + stats.map(function(s) {
      var cls = 'po-stat' + (s.clickable ? ' po-stat-clickable' : '') + (s.active ? ' po-stat-active' : '');
      var attr = s.nav ? ' data-nav="' + s.nav + '"' : '';
      return '<div class="' + cls + '"' + attr + '><span class="po-stat-num">' + esc(s.num) + '</span><span class="po-stat-label">' + esc(s.label) + '</span></div>';
    }).join('') + '</div>';
  }

  function listRow(cfg) {
    var tags = cfg.tags ? '<span class="po-row-tags">' + cfg.tags.join('') + '</span>' : '';
    var meta = cfg.meta ? '<span class="po-row-meta">' + cfg.meta + '</span>' : '';
    var status = cfg.status ? '<span class="po-row-status">' + cfg.status + '</span>' : '';
    var badge = cfg.badge ? '<span class="po-row-badge ' + (cfg.badgeCls||'') + '">' + cfg.badge + '</span>' : '';
    var nav = cfg.nav ? ' data-nav="' + cfg.nav + '"' : '';
    var act = cfg.act ? ' data-act="' + cfg.act + '" data-arg="' + esc(cfg.arg || '') + '"' : '';
    var cls = 'po-list-row' + (cfg.nocursor ? ' po-list-row-nocursor' : '');
    return '<div class="' + cls + '"' + nav + act + '>'
      + '<span class="po-row-name">' + esc(cfg.name) + '</span>'
      + tags + meta
      + '<span class="po-row-spacer"></span>'
      + status + badge
      + (cfg.arrow ? '<span style="color:var(--xb-muted);font-size:14px">›</span>' : '')
      + '</div>';
  }

  function panel(title, bodyHtml, actions) {
    return '<div class="po-panel"><div class="po-panel-h">' + esc(title)
      + (actions ? '<div class="po-panel-h-actions">' + actions + '</div>' : '')
      + '</div><div class="po-panel-bd">' + bodyHtml + '</div></div>';
  }

  function panelHtml(titleHtml, bodyHtml, actions) {
    return '<div class="po-panel"><div class="po-panel-h">' + titleHtml
      + (actions ? '<div class="po-panel-h-actions">' + actions + '</div>' : '')
      + '</div><div class="po-panel-bd">' + bodyHtml + '</div></div>';
  }

  /* —— 可折叠分组（张小龙 review：PRD 面板默认折叠） —— */
  var PRJ_TOGGLE = {}; /* pid -> { 'archive': true|false } */
  function _collapsibleGroup(key, title, summary, bodyHtml, defaultOpen) {
    var open = PRJ_TOGGLE[key] && PRJ_TOGGLE[key].open === true;
    if (defaultOpen && !(key in PRJ_TOGGLE)) open = true;
    return '<div class="po-col-group' + (open ? ' open' : '') + '">'
      + '<div class="po-col-group-h" data-act="toggleProjectGroup" data-arg="' + esc(key) + '">'
      +   '<span class="po-col-caret">' + (open ? '▾' : '▸') + '</span>'
      +   '<span class="po-col-title">' + esc(title) + '</span>'
      +   (summary ? '<span class="po-col-summary">' + esc(summary) + '</span>' : '')
      + '</div>'
      + (open ? '<div class="po-col-group-bd">' + bodyHtml + '</div>' : '')
      + '</div>';
  }

  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ el.classList.remove('show'); }, 2200);
  }

  function navigate(route) { if (_ctx && _ctx.navigate) _ctx.navigate(route); }

  /* ═══ 首页输入框下方工具栏（选择工作空间 + 默认权限） ═══ */
  var PERM_OPTIONS = ['仅查看', '可编辑'];
  function _normalizeHomePerm() {
    if (PERM_OPTIONS.indexOf(HOME_STATE.perm) === -1) HOME_STATE.perm = '可编辑';
    return HOME_STATE.perm;
  }
  function _renderHomeToolbar(d) {
    var sp = _currentSpace();
    _normalizeHomePerm();
    var spaces = (d.SPACES || []).concat(d.CUSTOM_SPACES || []);
    var openPanel = HOME_STATE.toolbarOpen;
    var panelHtml = '';
    if (openPanel === 'space') {
      var items = spaces.map(function (s) {
        return '<div class="po-toolbar-item' + (s.id === BROWSER_STATE.spaceId ? ' on' : '') + '">'
          + '<button type="button" class="po-toolbar-item-main" data-act="pickSpace" data-arg="' + esc(s.id) + '">'
          + '<span class="po-toolbar-item-name">' + esc(s.label) + '</span>'
          + '<span class="po-toolbar-item-desc">' + esc(s.desc || '') + '</span>'
          + (s.id === BROWSER_STATE.spaceId ? '<span class="po-toolbar-item-check">当前</span>' : '')
          + '</button><button type="button" class="po-toolbar-item-edit" data-act="openSpaceEditor" data-arg="' + esc(s.id) + '" aria-label="编辑' + esc(s.label) + '">编辑</button></div>';
      }).join('');
      panelHtml = '<div class="po-toolbar-panel" data-toolbar-panel="space">'
        + '<div class="po-toolbar-panel-label">选择空间</div>' + items
        + '<button type="button" class="po-toolbar-create" data-act="openSpaceEditor">+ 新建空间</button></div>';
    } else if (openPanel === 'perm') {
      var pItems = PERM_OPTIONS.map(function (p) {
        return '<div class="po-toolbar-item' + (p === HOME_STATE.perm ? ' on' : '') + '" data-act="pickPerm" data-arg="' + esc(p) + '">'
          + '<span class="po-toolbar-item-name">' + esc(p) + '</span>'
          + '<span class="po-toolbar-item-desc">' + (p === '仅查看' ? '只读访问，无写入权限' : '可读可写') + '</span>'
          + (p === HOME_STATE.perm ? '<span class="po-toolbar-item-check">当前</span>' : '')
          + '</div>';
      }).join('');
      panelHtml = '<div class="po-toolbar-panel" data-toolbar-panel="perm">' + pItems + '</div>';
    }
    return '<div class="po-composer-tools">'
      + '<button class="po-home-tool' + (openPanel === 'space' ? ' active' : '') + '" data-act="toggleSpace" title="切换工作空间">'
      +   '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2.5 4.5a1 1 0 0 1 1-1h3l1.2 1.5h5.8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-7.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>'
      +   '<span class="po-home-tool-label">工作空间</span>'
      +   '<span class="po-home-tool-value' + (!sp ? ' is-empty' : '') + '">' + esc(sp ? sp.label : '未选择') + '</span>'
      +   '<span class="po-caret">' + (openPanel === 'space' ? '▴' : '▾') + '</span>'
      + '</button>'
      + '<button class="po-home-tool' + (openPanel === 'perm' ? ' active' : '') + '" data-act="togglePerm" title="切换默认权限">'
      +   '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.6 1.8 4v4.8c0 3.2 2.6 5.6 6.2 6.4 3.6-.8 6.2-3.2 6.2-6.4V4L8 1.6Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="m5.6 8 1.8 1.8L10.4 6.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      +   '<span class="po-home-tool-label">默认权限</span>'
      +   '<span class="po-home-tool-value">' + esc(HOME_STATE.perm) + '</span>'
      +   '<span class="po-caret">' + (openPanel === 'perm' ? '▴' : '▾') + '</span>'
      + '</button>'
      + '</div>'
      + panelHtml;
  }

  function _renderSpaceEditor(d) {
    if (!SPACE_EDITOR_STATE.open) return '';
    var projects = d.PROJECTS || [];
    var selected = SPACE_EDITOR_STATE.selected || [];
    function projectById(id) {
      for (var i = 0; i < projects.length; i++) if (projects[i].id === id) return projects[i];
      return null;
    }
    var selectedHtml = selected.map(function (id) {
      var p = projectById(id);
      if (!p) return '';
      var primary = SPACE_EDITOR_STATE.primaryProjectId === id;
      return '<div class="po-space-project-row">'
        + '<span class="po-space-project-icon">' + ICON_FOLDER + '</span>'
        + '<span class="po-space-project-name">' + esc(p.name) + '</span>'
        + '<button type="button" class="po-space-primary' + (primary ? ' on' : '') + '" data-act="spaceSetPrimary" data-arg="' + esc(id) + '">' + (primary ? '主要' : '设为主要') + '</button>'
        + '<button type="button" class="po-space-remove" data-act="spaceRemoveProject" data-arg="' + esc(id) + '" aria-label="移除' + esc(p.name) + '">×</button>'
        + '</div>';
    }).join('');
    var available = projects.filter(function (p) { return selected.indexOf(p.id) < 0; });
    var availableHtml = SPACE_EDITOR_STATE.adding
      ? '<div class="po-space-available">' + available.map(function (p) {
          return '<button type="button" class="po-space-available-row" data-act="spaceAddProject" data-arg="' + esc(p.id) + '"><span>' + ICON_FOLDER + '</span><strong>' + esc(p.name) + '</strong><span>' + (p.type === 'lookthrough' ? '子基金穿透' : '直投项目') + '</span><b>添加</b></button>';
        }).join('') + '</div>'
      : '';
    var current = null;
    var allSpaces = (d.SPACES || []).concat(d.CUSTOM_SPACES || []);
    for (var si = 0; si < allSpaces.length; si++) if (allSpaces[si].id === SPACE_EDITOR_STATE.editId) current = allSpaces[si];
    return '<div class="po-space-modal-mask" data-space-modal="1">'
      + '<section class="po-space-modal" role="dialog" aria-modal="true" aria-labelledby="poSpaceModalTitle">'
      + '<header class="po-space-modal-head"><h2 id="poSpaceModalTitle">' + (current ? '编辑空间' : '新建空间') + '</h2><button type="button" class="po-space-modal-close" data-act="spaceClose" aria-label="关闭">×</button></header>'
      + '<div class="po-space-name-wrap"><span>' + ICON_FOLDER + '</span><input id="poSpaceName" value="' + esc(SPACE_EDITOR_STATE.name || '') + '" placeholder="输入空间名称" /></div>'
      + '<div class="po-space-section-title">包含项目 <span>' + selected.length + '</span></div>'
      + '<div class="po-space-project-list">' + (selectedHtml || '<div class="po-space-empty">尚未添加项目</div>')
      + '<button type="button" class="po-space-add" data-act="spaceToggleAdd">' + ICON_FOLDER + '<span>添加项目</span></button>' + availableHtml + '</div>'
      + '<footer class="po-space-modal-actions"><span class="po-space-modal-hint">一个空间可组合多个直投、基金及底层项目</span><button type="button" class="po-space-cancel" data-act="spaceClose">取消</button><button type="button" class="po-space-save" data-act="spaceSave">保存</button></footer>'
      + '</section></div>';
  }

  /* ═══ 首页（新建任务 · 终态） ═══ */
  function pageHome() {
    var d = D();

    /* —— 场景 tabs（WorkBuddy：日常办公/代码开发/设计创意 → 投后场景） —— */
    var tabs = [
      { key: 'ask', label: '投后问数', on: true },
      { key: 'parse', label: '材料解析', nav: 'file-parse' },
      { key: 'browse', label: '数据浏览', nav: 'post-browser' },
    ];
    var tabHtml = tabs.map(function (t) {
      return '<button class="po-tab' + (t.on ? ' on' : '') + '"' + (t.nav ? ' data-nav="' + t.nav + '"' : '') + (t.on && !t.nav ? ' data-act="homeFocus"' : '') + '>' + esc(t.label) + '</button>';
    }).join('');

    /* —— 技能 chips（与能力市场同款：点选后回填输入框，不直接发问） —— */
    var homeSkillIds = ['dd-target-brief', 'returns-analysis', 'pe-peer-compare', 'ic-debate'];
    var skillById = {};
    (d.PE_SKILLS || []).forEach(function (s) { skillById[s.id] = s; });
    var homeSkills = homeSkillIds.map(function (id) { return skillById[id]; }).filter(Boolean);
    if (!homeSkills.length) homeSkills = (d.PE_SKILLS || []).filter(function (s) { return s.visible === 'core'; }).slice(0, 4);
    var chipHtml = homeSkills.map(function (s) {
      return '<button type="button" class="po-chip" data-act="homeChip" data-arg="' + esc(s.name) + '" title="' + esc(s.desc || s.name) + '">' + esc(s.name) + '</button>';
    }).join('');

    /* —— 最近对话（从 CHATS 取，点击进入对话详情） —— */
    var chats = d.CHATS || [];
    var chatHtml = chats.map(function (c) {
      var preview = (c.preview || '');
      preview = preview.length > 44 ? preview.slice(0, 44) + '…' : preview;
      var projTag = c.type === 'project' ? tag('po-tag-type-direct', _projLabel(d, c.projectId)) : tag('po-tag-type-fof', '通用');
      return '<div class="po-recent-item" data-act="openChat" data-arg="' + esc(c.id) + '">'
        + '<div class="po-recent-q">' + esc(c.title) + ' ' + projTag + '</div>'
        + '<div class="po-recent-a">' + esc(preview) + '</div>'
        + '<div class="po-recent-src">' + esc(c.time || '') + '</div>'
        + '</div>';
    }).join('');

    return '<div class="po-page po-page-home">'
      + '<div class="po-body">'
      + '<div class="po-home-center">'
        + '<div class="po-home-hero">'
          /* 标题区：logo + 大标题 + 副标题 */
          + '<div class="po-home-brand">'
          +   '<div class="po-home-logo-wrap"><img class="po-home-logo" src="./assets/logo-qmx-v1.0-20260731.png" alt="财跃启明星" /></div>'
          +   '<div class="po-home-titles">'
          +     '<div class="po-home-title">财跃启明星</div>'
          +     '<div class="po-home-tagline">你的投资超能力</div>'
          +   '</div>'
          + '</div>'
          /* 场景 tabs */
          + '<div class="po-tab-row">' + tabHtml + '</div>'
          /* 功能 chips */
          + (chipHtml ? '<div class="po-chip-row">' + chipHtml + '</div>' : '')
          /* 大输入框卡片 */
          + '<div class="po-composer">'
          +   '<input id="poHomeInput" type="text" class="po-composer-input" placeholder="选择上方技能，或直接输入问题… @ 召唤专家／技能" value="' + esc(HOME_STATE.draft || '') + '" />'
          +   '<div class="po-composer-bar">'
          +     '<div class="po-composer-left">'
          +       '<button class="po-plus" id="poHomePlus" title="添加">+</button>'
          +       '<button type="button" class="po-market-pill" data-nav="skills" title="能力市场">能力市场</button>'
          +     '</div>'
          +     '<button class="po-send" data-act="homeAsk" title="发送">'
          +       '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          +     '</button>'
          +   '</div>'
          /* 输入框卡片内部底部：工作空间 + 默认权限（连体小工具栏） */
          +   _renderHomeToolbar(d)
          /* "+" 弹出菜单 */
          +   '<div class="po-plus-menu" id="poPlusMenu" style="display:none"></div>'
          + '</div>'
          + '<input type="file" id="poHomeFile" multiple accept=".pdf,.docx,.xlsx,.xls,.csv,.png,.jpg" style="display:none" />'
        + '</div>'
      + '</div>'
      + '</div>'
      + _renderSpaceEditor(d)
      + '</div>';
  }

  /* —— 项目名查找辅助 —— */
  function _projLabel(d, pid) {
    var projects = d.PROJECTS || [];
    for (var i = 0; i < projects.length; i++) { if (projects[i].id === pid) return projects[i].name; }
    return '项目';
  }

  function _parseTargetItems(d) {
    var items = [];
    ((d && d.FUNDS) || []).forEach(function (f) {
      var isManaged = f.management === 'managed';
      items.push({
        id: f.id,
        name: f.name,
        type: isManaged ? '管理基金' : '所投子基金',
        kind: 'fund'
      });
    });
    ((d && d.PROJECTS) || []).forEach(function (p) {
      if (p.type === 'lookthrough') return; /* 穿透由基金季报底层层生成，不作为上传归属入口 */
      items.push({ id: p.id, name: p.name, type: '直投项目', kind: 'direct' });
    });
    return items;
  }

  function _parseNewTypeLabel(type) {
    if (type === 'managed') return '管理基金';
    if (type === 'external' || type === 'fund') return '所投子基金';
    return '直投项目';
  }

  function _parseTargetLabel(d, mode, id, type, name) {
    if (mode === 'new') {
      var t = _parseNewTypeLabel(type);
      return (name || '').trim() ? t + ' · ' + name.trim() : t;
    }
    var items = _parseTargetItems(d);
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i].type + ' · ' + items[i].name;
    return '请选择已有对象';
  }

  /* ═══ 文件解析队列（投资云风格：大上传区 + 上传即解析 + 精简三区） ═══ */
  function pageFileParse() {
    var d = D();
    var f = d.FILES || {};
    var parseItems = _parseTargetItems(d);
    var sections = [
      { key:'pending', label:'待确认', items:f.pending || [] },
      { key:'parsing', label:'解析中', items:f.parsing || [] },
      { key:'abnormal', label:'需处理', items:f.abnormal || [] },
      { key:'done', label:'已完成', items:f.done || [] }
    ];
    var queueItems = [];
    sections.forEach(function (s) {
      if (PARSE_QUEUE_TAB === 'pending' && s.key !== 'pending' && s.key !== 'abnormal') return;
      s.items.forEach(function (item) {
        if (!PARSE_TASK_DELETED[item.project || '__unassigned__']) {
          queueItems.push({ section:s.key, label:s.label, item:item });
        }
      });
    });
    function projectName(id) {
      var p = findByIdLocal(parseItems, id);
      return p ? p.name : '待确认归属';
    }
    function findByIdLocal(list, id) {
      for (var i=0; i<list.length; i++) if (list[i].id === id) return list[i];
      return null;
    }
    function itemAction(wrap) {
      var item = wrap.item;
      var section = wrap.section;
      var canConfirm = section === 'pending' || (section === 'abnormal' && d.CONFIRMS && d.CONFIRMS[item.id]);
      var nav = canConfirm ? ' data-nav="confirm/' + esc(item.id) + '"' : '';
      var act = section === 'done' ? ' data-act="viewDone" data-arg="' + esc(item.name + '|' + (item.fields||0) + '|' + (item.confirmedBy||'') + '|' + (item.confirmedAt||'')) + '"'
        : (section === 'parsing' ? ' data-act="viewParsing" data-arg="' + esc(item.name + '|' + (item.progress||0) + '|' + (item.stage||'')) + '"'
          : (section === 'abnormal' && !canConfirm ? ' data-act="reuploadScan" data-arg="' + esc(item.id) + '"' : ''));
      return nav + act;
    }
    var projectGroups = [];
    queueItems.forEach(function (wrap) {
      var key = wrap.item.project || '__unassigned__';
      var group = null;
      for (var i = 0; i < projectGroups.length; i++) if (projectGroups[i].key === key) group = projectGroups[i];
      if (!group) {
        group = { key:key, name:projectName(wrap.item.project), items:[] };
        projectGroups.push(group);
      }
      group.items.push(wrap);
    });
    var pendingProjectKeys = {};
    (f.pending || []).concat(f.abnormal || []).forEach(function (item) {
      pendingProjectKeys[item.project || '__unassigned__'] = true;
    });
    var pendingProjectCount = Object.keys(pendingProjectKeys).length;
    function projectCard(group) {
      var pendingWraps = group.items.filter(function(w) { return w.section === 'pending' || w.section === 'abnormal'; });
      var navItem = pendingWraps.length ? pendingWraps[0] : group.items[0];
      var headAttrs = itemAction(navItem);
      var fileListHtml = group.items.map(function(wrap) {
        var item = wrap.item;
        var section = wrap.section;
        var isParsing = section === 'parsing';
        var isDone = section === 'done';
        var progressHtml = '';
        if (isParsing && item.stage) {
          var pct = item.progress || 0;
          progressHtml = '<div class="po-parse-file-progress">'
            + '<div class="po-parse-progress-bar"><div class="po-parse-progress-fill" style="width:' + pct + '%"></div></div>'
            + '<span class="po-parse-progress-label">' + esc(item.stage) + ' ' + pct + '%</span>'
            + '</div>';
        }
        var statusTag = isParsing ? '<span class="po-tag po-tag-dim">解析中</span>'
          : (isDone ? '<span class="po-tag po-tag-ok">已完成</span>'
          : (section === 'abnormal' ? '<span class="po-tag po-tag-warn">需处理</span>' : ''));
        return '<div class="po-parse-file-row">'
          + '<span class="po-parse-file-name" title="' + esc(item.name) + '">' + esc(item.name) + '</span>'
          + statusTag
          + progressHtml
          + '</div>';
      }).join('');
      return '<div class="po-parse-project-card">'
        + '<div class="po-parse-card-top">'
        + '<button type="button" class="po-parse-project-head"' + headAttrs + '>'
        + '<span class="po-parse-queue-name">' + esc(group.name) + '</span>'
        + '<span class="po-parse-project-count">' + group.items.length + ' 份材料</span>'
        + '</button>'
        + '<button type="button" class="po-parse-task-del" data-act="deleteParseTask" data-arg="' + esc(group.key) + '" title="删除此解析任务">x</button>'
        + '</div>'
        + '<div class="po-parse-file-list">' + fileListHtml + '</div>'
        + '</div>';
    }
    return '<div class="po-page po-page-parse">'
      + toolbar('文件解析')
      + '<div class="po-parse-shell">'
      + '<section class="po-parse-create">'
      +   '<div class="po-parse-intro"><h3>上传材料</h3><p>先选项目，再上传文件；AI 自动识别期间与字段，解析后在详情页核对。</p></div>'
      +   '<div class="po-parse-mode">'
      +     '<button class="po-parse-mode-btn' + (PARSE_TARGET_MODE === 'existing' ? ' active' : '') + '" data-act="parseTargetMode" data-arg="existing">已有数据</button>'
      +     '<button class="po-parse-mode-btn' + (PARSE_TARGET_MODE === 'new' ? ' active' : '') + '" data-act="parseTargetMode" data-arg="new">新建数据</button>'
      +   '</div>'
      +   (PARSE_TARGET_MODE === 'existing'
          ? '<label class="po-parse-target-label">解析内容填入至</label>'
            + '<div style="position:relative;width:100%;max-width:760px;margin:0 auto 16px">'
            + '<input id="poParseTargetSearchInput" class="po-parse-target" type="text" placeholder="请搜索项目/基金"'
            + ' value="' + esc(PARSE_TARGET_LABEL || PARSE_TARGET_QUERY) + '"'
            + ' style="margin:0;max-width:none;width:100%">'
            + '<div id="poParseTargetSuggest"></div>'
            + '</div>'
          : '<label class="po-parse-target-label">新建类型与名称</label>'
            + '<div class="po-parse-new-row">'
            + '<select id="poParseTargetNewType" class="po-parse-new-type" aria-label="新建类型">'
            + '<option value="external"' + (PARSE_TARGET_NEW_TYPE === 'external' || PARSE_TARGET_NEW_TYPE === 'fund' ? ' selected' : '') + '>所投子基金</option>'
            + '<option value="managed"' + (PARSE_TARGET_NEW_TYPE === 'managed' ? ' selected' : '') + '>管理基金</option>'
            + '<option value="direct"' + (PARSE_TARGET_NEW_TYPE === 'direct' ? ' selected' : '') + '>直投项目</option>'
            + '</select>'
            + '<input id="poParseTargetNewName" class="po-parse-target po-parse-new-name" type="text" placeholder="'
            + (PARSE_TARGET_NEW_TYPE === 'managed' ? '请输入管理基金名称' : (PARSE_TARGET_NEW_TYPE === 'direct' ? '请输入直投项目名称' : '请输入所投子基金名称'))
            + '" value="' + esc(PARSE_TARGET_NEW_NAME || '') + '">'
            + '</div>'
        )
      +   '<div class="po-upload-hero" data-act="uploadZone">'
      +     '<div class="po-upload-hero-icon">+</div>'
      +     '<div class="po-upload-hero-text">拖入文件或点击选择</div>'
      +     '<div class="po-upload-hero-hint">PDF、Excel、Word、图片和扫描件</div>'
      +   '</div>'
      +   '<p class="po-parse-rule">右侧按项目聚合。一个项目下的多个文件都会放在同一处。</p>'
      + '</section>'
      + '<aside class="po-parse-queue">'
      +   '<div class="po-parse-queue-tabs">'
      +     '<button class="po-parse-queue-tab' + (PARSE_QUEUE_TAB === 'pending' ? ' active' : '') + '" data-act="parseQueueTab" data-arg="pending">待处理 <span>' + pendingProjectCount + '</span></button>'
      +     '<button class="po-parse-queue-tab' + (PARSE_QUEUE_TAB === 'all' ? ' active' : '') + '" data-act="parseQueueTab" data-arg="all">全部</button>'
      +   '</div>'
      +   '<div class="po-parse-queue-list">' + (projectGroups.length ? projectGroups.map(projectCard).join('') : '<div class="po-empty">暂无待处理项目</div>') + '</div>'
      + '</aside>'
      + '</div></div>';
  }

  /* ═══ 通用确认页（7 交互：三表Tab + 差异高亮 + 定位 + 试算 + 派生 + 批量 + 提交） ═══ */
  function pageConfirm(fileId) {
    var d = D();
    var conf = d.CONFIRMS && d.CONFIRMS[fileId];
    if (!conf) {
      return '<div class="po-page">' + toolbar('确认数据') + '<div class="po-body"><div class="po-empty">未找到该文件的确认数据</div></div></div>';
    }

    /* 字段操作真实态 */
    CURRENT_CONFIRM = fileId;
    var st = CONFIRM_STATE[fileId] = CONFIRM_STATE[fileId] || { fields: {}, submitted: false };

    if (fileId === 'fp3') return pageStructuredProjectConfirm(conf, st);
    if (fileId === 'fp4' || fileId === 'fp6') return pageDirectProjectConfirm(conf, st, fileId);

    /* 当前激活的报表 Tab */
    var sheetTabs = conf.sheetTabs || [];
    var activeSheet = CONFIRM_SHEET_STATE[fileId] || conf.activeSheet || (sheetTabs[0] || '');
    CONFIRM_SHEET_STATE[fileId] = activeSheet;

    var fields = _confirmFields(conf);
    var tb = conf.trialBalance || { pass: true, checks: [] };
    var tc = conf.totalCheck;
    var projectStructured = fileId === 'fp3';
    var removedRows = STRUCTURED_REMOVED[fileId] = STRUCTURED_REMOVED[fileId] || {};
    if (projectStructured) fields = fields.filter(function (f, i) { return !removedRows[f.id || i]; });
    var projectSources = projectStructured ? [
      { name: '纪元GGV-2026Q2季报.xlsx', type: 'GP季报', note: '当前原文', fields: fields },
      { name: '纪源皓元-众源母基金资本账户-2026Q1.xlsx', type: '资本账户表', note: '已合并 21 项', fields: [
        {name:'累计实缴金额',srcVal:'108,000'}, {name:'累计分配金额',srcVal:'80,000'}, {name:'期末余额',srcVal:'176,400'}, {name:'本期管理费',srcVal:'1,250'}
      ]},
      { name: 'RMB Fund II Gross IRR-2026Q1.xlsx', type: '估值成本表', note: '已合并 17 项', fields: [
        {name:'累计投资成本',srcVal:'328,450'}, {name:'期末公允价值',srcVal:'512,860'}, {name:'Gross IRR',srcVal:'18.6%'}, {name:'明细重算 MOIC',srcVal:'2.1',diff:true}
      ]}
    ] : [];
    var sourceIdx = CONFIRM_SOURCE_STATE[fileId] || 0;
    var currentSource = projectSources[sourceIdx];
    var docFields = currentSource ? currentSource.fields : fields;
    var savedValues = STRUCTURED_VALUES[fileId] = STRUCTURED_VALUES[fileId] || {};
    var sourceCells = projectStructured ? [
      ['B4','B5','B6','B7','B8','B9','B10','B11','B12'],
      ['F14','F18','F22','F26'],
      ['J19','J20','J21','J22']
    ] : [];
    var activeDocRow = STRUCTURED_ACTIVE_FIELD[fileId] == null ? 0 : STRUCTURED_ACTIVE_FIELD[fileId];
    var activeCell = sourceCells[sourceIdx] && sourceCells[sourceIdx][activeDocRow] ? sourceCells[sourceIdx][activeDocRow] : 'B4';

    /* 报表 Tab 切换条 */
    var sheetTabsHtml = '';
    if (sheetTabs.length > 1 && !projectStructured) {
      sheetTabsHtml = '<div class="po-sheet-tabs">' + sheetTabs.map(function (s) {
        return '<button class="po-sheet-tab' + (s === activeSheet ? ' active' : '') + '" data-act="switchFinStmt" data-arg="' + esc(s) + '">' + esc(s) + '</button>';
      }).join('') + '</div>';
    }

    /* 文件类型 / 解析方式提示条 */
    var fileInfoHtml = '';
    if (projectStructured) {
      fileInfoHtml = '<div class="po-sheet-tabs" style="align-items:center">' + projectSources.map(function (src, i) {
        return '<button class="po-sheet-tab' + (sourceIdx === i ? ' active' : '') + '" data-act="switchProjectSource" data-arg="' + i + '"><strong style="display:inline-flex;width:18px;height:18px;border-radius:50%;background:var(--po-bg-3);align-items:center;justify-content:center;margin-right:5px">' + (i + 1) + '</strong>' + esc(src.name) + '</button>';
      }).join('') + '<span style="flex:1"></span><button class="po-btn po-btn-sm" data-act="appendProjectFile">＋ 补充文件</button></div>';
    } else {
      fileInfoHtml = '<div class="po-confirm-fileinfo">'
        + '<span class="po-confirm-fname">' + esc(conf.fileName) + '</span>'
        + _fileTypeTag(conf.fileType)
        + _parseModeTag(conf.parseMode)
        + (conf.ocrConfidence != null ? '<span class="po-confirm-ocr">OCR 置信度 ' + Math.round(conf.ocrConfidence*100) + '%</span>' : '')
        + '<span class="po-confirm-proj">' + esc(conf.projectName) + ' · ' + esc(conf.period) + '</span></div>';
    }

    /* 左侧原文（差异行粉橙高亮） */
    var docHtml = '<div class="po-doc-page">'
      + '<div class="po-doc-h">原文预览<span class="po-doc-sub">' + esc(currentSource ? currentSource.name : conf.fileName) + '</span></div>'
      + (projectStructured ? '<div class="po-derived-formula" style="margin:7px 0 10px">当前定位：' + (sourceIdx === 0 ? '基金概览' : sourceIdx === 1 ? '资本账户 · Sheet1' : 'Gross IRR') + ' · <strong>' + esc(activeCell) + '</strong></div>' : '')
      + '<table class="po-doc-table">' + (projectStructured ? '<thead><tr><td style="width:48px;text-align:center;color:var(--po-gray)">位置</td><td>业务字段</td><td style="text-align:right">原文值</td></tr></thead>' : '') + '<tbody>';
    docFields.forEach(function(fld, idx) {
      var hi = idx === activeDocRow ? ' active' : '';
      var diffCls = fld.diff ? ' po-doc-diff' : '';
      docHtml += '<tr class="po-doc-row' + diffCls + '">' + (projectStructured ? '<td style="text-align:center;color:var(--po-gray)">' + esc((sourceCells[sourceIdx] || [])[idx] || '') + '</td>' : '') + '<td class="po-doc-k">' + esc(fld.name) + '</td>'
        + '<td class="po-doc-v po-doc-hi' + hi + '" data-field-idx="' + idx + '">' + esc(fld.srcVal) + '</td></tr>';
    });
    if (tb.checks && tb.checks.length) {
      docHtml += '<tr><td colspan="' + (projectStructured ? '3' : '2') + '" class="po-doc-sep">— 以下为合计/勾稽行 —</td></tr>';
      tb.checks.forEach(function(ch) {
        docHtml += '<tr class="po-doc-row' + (ch.result!=='pass'?' po-doc-diff':'') + '">' + (projectStructured ? '<td></td>' : '') + '<td class="po-doc-k">' + esc(ch.name) + '</td>'
          + '<td class="po-doc-v" style="color:' + (ch.result==='pass'?'var(--xb-green)':'var(--po-ink)') + '">' + (ch.result==='pass'?'通过':'异常') + (ch.detail?' · '+esc(ch.detail):'') + '</td></tr>';
      });
    }
    docHtml += '</tbody></table></div>';

    /* 右侧候选字段表（差异行粉橙高亮） */
    var fieldsHtml = '';
    var rightTab = STRUCTURED_RIGHT_TAB[fileId] || 'fields';
    var sourceLocations = [
      {file:0,row:0,text:'[1] 基金概览 B4'}, {file:0,row:1,text:'[1] 基金概览 B5'},
      {file:1,row:0,text:'[2] 资本账户 F14'}, {file:1,row:1,text:'[2] 资本账户 F18'},
      {file:0,row:4,text:'[1] 基金概览 B8'}, {file:0,row:5,text:'[1] 基金概览 B9'},
      {file:2,row:3,text:'[1][3] 两处来源'}, {file:1,row:2,text:'[2] 资本账户 F22'},
      {file:0,row:8,text:'无原文来源'}
    ];
    fields.forEach(function(fld, idx) {
      var srcTagHtml = sourceTag(fld.source);
      var aiBadge = fld.aiFallback ? ' <span class="po-tag po-tag-aifallback" title="AI 兜底：' + esc(fld.fallbackFrom||'') + '">AI兜底</span>' : '';
      var checkIcon = fld.check === 'pass' ? '<span style="color:var(--xb-green)">通过</span>' : '<span style="color:var(--po-ink)">异常</span>';
      var conflictHtml = '';
      if (fld.source === 'conflict' && fld.conflict) {
        conflictHtml = '<div class="po-field-conflict">'
          + fld.conflict.map(function(c, ci) {
              return '<label class="po-conflict-opt"><input type="radio" name="conflict-' + fld.id + '" data-conflict-idx="' + idx + '" data-conflict-choice="' + ci + '" value="' + esc(c.val) + '" />'
                + '<span class="po-conflict-from">' + esc(c.from) + ':</span> <strong>' + esc(c.val) + '</strong></label>';
            }).join('')
          + '</div>';
      }
      var derivedHtml = '';
      if (fld.source === 'derived' && fld.formula) {
        derivedHtml = '<div class="po-derived-formula">= ' + esc(fld.formula) + '</div>';
      }
      var diffNoteHtml = fld.diff && fld.diffNote ? '<div class="po-field-diffnote">' + esc(fld.diffNote) + '</div>' : '';
      if (projectStructured) {
        var calcVal = fld.source === 'conflict' && fld.conflict && fld.conflict[1] ? fld.conflict[1].val : fld.mapVal;
        var finalVal = savedValues[idx] != null ? savedValues[idx] : fld.mapVal;
        var loc = sourceLocations[idx] || {file:0, text:'待补充来源'};
        fieldsHtml += '<div class="po-field-row' + (fld.diff ? ' po-field-diff' : '') + '" data-field-idx="' + idx + '" style="flex-direction:column;align-items:stretch">'
          + '<div class="po-field-row-main" style="width:100%;min-width:0;gap:8px">'
          + '<span class="po-field-name" style="width:104px">' + esc(fld.name) + '</span>'
          + '<span style="display:grid;grid-template-columns:68px 68px 82px;gap:6px;align-items:center;flex:1;min-width:0">'
          + '<span class="po-field-src po-source-link" title="原文披露值" style="width:auto">' + esc(fld.srcVal) + '<small style="display:block">原文</small></span>'
          + '<span class="po-field-map" style="min-width:0">' + esc(calcVal) + '<small style="display:block;color:var(--po-gray);font-weight:400">系统重算</small></span>'
          + '<span><input class="po-fin-cell-input' + ((fld.confLevel === 'mid' || fld.confLevel === 'low' || fld.uncertain) ? ' is-uncertain' : '') + '" data-structured-value="' + idx + '" value="' + esc(finalVal) + '" aria-label="' + esc(fld.name) + '最终采用值" title="最终采用值，可直接修改" style="width:78px;min-width:0" /><small style="display:block;color:var(--po-gray);margin-top:2px">最终采用</small></span>'
          + '</span>'
          + '<button class="po-field-locate" data-act="locateStructuredSource" data-arg="' + loc.file + '|' + loc.row + '" title="查看提取位置" style="width:110px;white-space:normal;line-height:1.25;color:var(--po-ink-2);font-weight:500;background:var(--po-bg-2);border-color:var(--po-line-2)">' + esc(loc.text) + '</button>'
          + '<button class="po-icon-btn" data-act="removeStructuredRow" data-arg="' + idx + '" title="删除误识别行">×</button>'
          + '</div>'
          + (fld.source === 'conflict' && fld.conflict ? '<div class="po-field-diffnote">多源值：' + fld.conflict.map(function(c){return esc(c.from) + ' ' + esc(c.val);}).join('；') + '。直接修改最终采用值即可，所有来源均保留。</div>' : derivedHtml + diffNoteHtml)
          + '</div>';
        return;
      }
      /* 实体字段黄标 */
      if (fld.source === 'entity') {
        var entityBadge = fld.entityStatus === 'unmatched'
          ? '<span class="po-tag po-entity-warn">待关联</span>'
          : '<span class="po-tag po-entity-ok">已关联</span>';
        var entityAction = fld.entityStatus === 'unmatched'
          ? '<span class="po-field-act po-field-act-accept" data-act="confirmEntity" data-arg="' + esc(fld.id) + '" title="确认关联">确认</span>'
            + '<span class="po-field-act" data-act="createEntity" data-arg="' + esc(fld.id) + '" title="新建档案" style="color:var(--po-ink-2)">新建</span>'
          : '<span class="po-field-act po-field-act-done">已确认</span>';
        fieldsHtml += '<div class="po-field-row' + (fld.entityStatus === 'unmatched' ? ' po-field-diff' : '') + '" data-field-idx="' + idx + '">'
          + '<div class="po-field-row-main">'
          + '<span class="po-field-name">' + esc(fld.name) + '</span>'
          + '<span class="po-field-src po-source-link" title="原文识别值">' + esc(fld.srcVal) + '</span>'
          + '<span class="po-field-arrow">→</span>'
          + '<span class="po-field-map">' + esc(fld.mapVal || fld.srcVal) + '</span>'
          + '<span class="po-field-tags">' + entityBadge + '</span>'
          + '<span class="po-field-actions">' + entityAction + '</span>'
          + '</div>'
          + '</div>';
        return;
      }
      var fst = st.fields[idx];
      var actHtml = fst === 'accepted'
        ? '<span class="po-field-act po-field-act-done">已接受</span>'
        : fst === 'rejected'
          ? '<span class="po-field-act po-field-act-rejected">已驳回</span>'
          : '<span class="po-field-act po-field-act-accept" data-act="acceptField" data-arg="' + idx + '" title="接受">接受</span>'
            + '<span class="po-field-act po-field-act-reject" data-act="rejectField" data-arg="' + idx + '" title="驳回">驳回</span>';
      var diffCls = fld.diff ? ' po-field-diff' : '';
      fieldsHtml += '<div class="po-field-row' + diffCls + (fst === 'accepted' ? ' po-field-ok' : (fst === 'rejected' ? ' po-field-bad' : '')) + '" data-field-idx="' + idx + '">'
        + '<div class="po-field-row-main">'
        + '<span class="po-field-name">' + esc(fld.name) + '</span>'
        + '<span class="po-field-src po-source-link" title="点击查看来源原文">' + esc(fld.srcVal) + '</span>'
        + '<span class="po-field-arrow">→</span>'
        + '<span class="po-field-map">' + esc(fld.mapVal) + '</span>'
        + '<span class="po-field-tags">' + srcTagHtml + aiBadge + '</span>'
        + '<span class="po-field-check">' + checkIcon + '</span>'
        + '<span class="po-field-actions">' + actHtml + '</span>'
        + '</div>'
        + conflictHtml + derivedHtml + diffNoteHtml
        + '</div>';
    });
    if (projectStructured && rightTab === 'fields') {
      fieldsHtml += '<button class="po-btn po-btn-sm" data-act="addStructuredRow" style="margin:10px 16px">＋ 新增明细行</button>';
    } else if (projectStructured) {
      fieldsHtml = '<div class="po-field-row"><div style="width:100%"><div class="po-field-name" style="width:auto;margin-bottom:6px">业务进展</div><textarea class="po-fin-input" data-structured-text="progress" style="width:100%;min-height:92px;box-sizing:border-box">本季度完成 2 个项目后续轮融资，重点推进存量项目治理。</textarea><button class="po-field-locate" data-act="locateStructuredSource" data-arg="0|0" style="margin-top:6px">[1] GP季报 · 投资组合章节 P18</button></div></div>'
        + '<div class="po-field-row"><div style="width:100%"><div class="po-field-name" style="width:auto;margin-bottom:6px">退出规划</div><textarea class="po-fin-input" data-structured-text="exit" style="width:100%;min-height:92px;box-sizing:border-box">优先推进成熟项目回购及并购退出。</textarea><button class="po-field-locate" data-act="locateStructuredSource" data-arg="0|3" style="margin-top:6px">[1] GP季报 · 退出情况 P27</button></div></div>'
        + '<div class="po-field-row"><div style="width:100%"><div class="po-field-name" style="width:auto;margin-bottom:6px">重大事项</div><textarea class="po-fin-input" data-structured-text="risk" style="width:100%;min-height:92px;box-sizing:border-box">暂无新增重大风险。</textarea><button class="po-field-locate" data-act="locateStructuredSource" data-arg="0|6" style="margin-top:6px">[1] GP季报 · 重大事项 P31</button></div></div>';
    }

    /* 试算条（顶部始终可见） */
    var failCount = (tb.checks||[]).filter(function(c){return c.result!=='pass';}).length;
    var passCount = (tb.checks||[]).length - failCount;
    var trialHtml = '<div class="po-trial-bar ' + (tb.pass ? 'po-trial-ok' : 'po-trial-fail') + '">'
      + (tb.pass ? '✓ 试算平衡 · 全部通过' : '试算不平：异常 ' + failCount + ' 项，通过 ' + passCount + ' 项，查看差异')
      + '</div>';
    if (projectStructured) trialHtml = rightTab === 'fields' ? '<div class="po-trial-bar po-trial-ok">校验通过 8 项 · 1 项多源差异待确认 · 点击来源可定位原文</div>' : '';

    /* 合计验证 */
    var totalHtml = '';
    if (tc) {
      totalHtml = '<div class="po-total-check' + (tc.pass ? '' : ' fail') + '">'
        + '<div class="po-total-h">合计验证 · ' + esc(tc.diffField||'') + '</div>'
        + '<div class="po-total-row">'
        +   '<span>源文件合计: <strong>' + esc(tc.sourceTotal) + '</strong></span>'
        +   '<span>系统重算: <strong>' + esc(tc.calcTotal) + '</strong></span>'
        +   '<span class="po-total-diff">差异: ' + esc(tc.diff) + '</span>'
        + '</div>'
        + (tc.note ? '<div class="po-total-note">' + esc(tc.note) + '</div>' : '')
        + '</div>';
    }
    if (projectStructured) totalHtml = '';

    /* 派生计算卡 */
    var derivedCardHtml = '';
    if (conf.derived) {
      var dv = conf.derived;
      derivedCardHtml = '<div class="po-trial-bar" style="background:var(--po-bg-2);color:var(--po-ink-2);border-color:var(--po-line-2)">'
        + '已自动派生 ' + esc(dv.name) + ' = ' + esc(String(dv.result)) + '（' + esc(dv.formula) + '）'
        + '</div>';
    }

    /* 批量确认条（真实态：全部接受后变为已确认） */
    var allAccepted = fields.length > 0 && fields.every(function (f, i) { return st.fields[i] === 'accepted'; });
    var acceptedCount = fields.filter(function (f, i) { return st.fields[i] === 'accepted'; }).length;
    var batchHtml = projectStructured ? '<div class="po-confirm-batch"><span class="po-batch-count" data-structured-save>草稿已自动保存 · 当前任务合并 3 份原始文件</span><span class="po-tag">配置版本 v3.2</span></div>' : '<div class="po-confirm-batch">'
      + '<span class="po-batch-count">' + (allAccepted ? '已确认 ' + fields.length + ' 项，可提交' : '已接受 ' + acceptedCount + ' / ' + fields.length + ' 项') + '</span>'
      + (allAccepted ? '' : '<button class="po-btn po-btn-sm po-btn-primary" data-act="batchConfirm">批量确认 ' + fields.length + ' 项</button>')
      + '</div>';
    var structuredTabsHtml = projectStructured ? '<div class="po-sheet-tabs"><button class="po-sheet-tab' + (rightTab === 'fields' ? ' active' : '') + '" data-act="switchStructuredRight" data-arg="fields">结构化字段</button><button class="po-sheet-tab' + (rightTab === 'progress' ? ' active' : '') + '" data-act="switchStructuredRight" data-arg="progress">业务进展</button></div>' : '';

    var submitBtn = st.submitted
      ? '<span class="po-btn po-btn-sm po-btn-submitted">已提交 ✓</span>'
      : '<button class="po-btn po-btn-sm po-btn-primary" data-act="submitConfirm">' + (projectStructured ? '确认写入' : '提交确认') + '</button>';

    return '<div class="po-page po-page-confirm">'
      + toolbar(esc(conf.projectName), submitBtn)
      + fileInfoHtml
      + sheetTabsHtml
      + '<div class="po-confirm">'
      /* 左：原文 */
      + '<div class="po-confirm-left">' + docHtml + '</div>'
      /* 右：批量+试算+合计+派生+候选+提交 */
      + '<div class="po-confirm-right">'
      + structuredTabsHtml
      + batchHtml
      + trialHtml
      + totalHtml
      + derivedCardHtml
      + '<div class="po-confirm-fields-h">' + (projectStructured ? (rightTab === 'fields' ? '字段值 · 原文值 / 系统重算 / 最终采用值 / 来源' : '从原文提取的长文本，可直接修改') : '候选字段（' + fields.length + '）') + '</div>'
      + fieldsHtml
      + '<div class="po-confirm-submit"><button class="po-btn po-btn-primary" data-act="submitConfirm" style="width:100%">' + (projectStructured ? '确认写入并归档原文' : '提交确认') + ' — ' + esc(conf.projectName) + ' · ' + esc(conf.period) + '</button></div>'
      + '</div>'
      + '</div></div>';
  }

  /* 项目级文件确认：文件即入口，系统按材料类型自动匹配组件。 */
  function _scField(name, value, loc, note, opts) {
    opts = opts || {};
    return { name:name, value:value, loc:loc, note:note || '', diff:!!opts.diff, long:!!opts.long, derived:opts.derived || '', uncertain:!!opts.uncertain };
  }

  function _scSection(title, rows) { return { title:title, rows:rows }; }

  /* 基金项目确认：仅基金材料；不含企业财务三表 */
  function _fundMockSources() {
    return [
      {
        name:'投后数据整理template.xlsx · GGV人民币二期@20260331', short:'客户台账', type:'GP季报', component:'基金季报识别',
        previewHeaders:['位置','字段','原文值'],
        previewRows:[['子基金列表!B8','基金简称','GGV人民币二期'],['子基金列表!P8','投资数量','38'],['子基金列表!V8','基金MOIC','2.37x'],['子基金列表!Z8','众源TVPI','1.76x'],['投资列表','项目','京东工业品'],['GGV!G','营业收入(2025)','18,500'],['GGV!H','净利润(2025)','2,100'],['GGV!G','营业收入(2026H1)','11,200'],['GGV!H','净利润(2026H1)','1,450']],
        sections:[
          _scSection('基金层',[
            _scField('基金简称','GGV人民币二期','子基金列表!B8'),_scField('基金全称（众源投资的基金主体）','苏州纪源皓元创业投资合伙企业（有限合伙）','B4'),
            _scField('基金管理人','宁波纪源投资管理有限公司','B6'),_scField('基金备案编号（基金编码）','SLK742','B7'),
            _scField('基金注册地','苏州市工业园区','子基金列表!F8'),_scField('基金成立日期','2019-12-18','子基金列表!G8'),
            _scField('投资期','20年7月-23年12月','子基金列表!H8'),_scField('投资期到期日','2023-12-31','子基金列表!H8'),_scField('基金存续期','3+4+2','子基金列表!I8'),
            _scField('投资方向','前沿科技及智能硬件、企业服务/云、消费升级/新零售、互联网+/产业互联网','子基金列表!J8','',{uncertain:true}),_scField('主要投资阶段（早期/VC/PE）','早期和成长期及成熟期','子基金列表!K8','',{uncertain:true}),_scField('团队核心成员','符绩勋、李宏玮、徐炳东','子基金列表!L8'),
            _scField('报告截止日','2026-03-31','子基金列表!P3'),
            _scField('认缴金额（本基金主体）','16.01 亿元','子基金列表!M8'),_scField('实缴金额（本基金主体）','16.01 亿元','子基金列表!O8'),
            _scField('基金认缴金额（基金合计）','34.1 亿元','子基金列表!N8'),_scField('基金实缴金额（基金合计）','34.1 亿元','子基金列表!N8'),
            _scField('已投项目数','38','子基金列表!P8'),_scField('投资金额（本基金主体）','13.36 亿元','子基金列表!Q8'),_scField('投资金额（基金合计）','28.066 亿元','子基金列表!R8'),
            _scField('总投资金额','28.066 亿元','子基金列表!R8','基金合计口径'),
            _scField('投资成本（投资本金）','13.36 亿元','子基金列表!Q8','本基金主体已投总额',{derived:'底层项目投资本金合计'}),
            _scField('投资比例','3.12%','子基金列表!X8','本机构认缴÷基金认缴合计',{derived:'5,000÷160,100'}),
            _scField('投资进度','83.4%','子基金列表!Q8/M8','总投资金额÷基金认缴（本基金主体）',{derived:'13.36÷16.01'}),
            _scField('完全退出项目数量','2','子基金列表!S8'),_scField('部分退出项目数量','6','子基金列表!T8'),_scField('总退出金额（万元）','12,168.73','子基金列表!U8'),
            _scField('MOIC（GP报告值）','2.37x','子基金列表!V8'),_scField('TVPI（GP报告值）','2.36x','子基金列表!V9'),_scField('DPI（GP报告值）','0.09x','子基金列表!V10'),_scField('GP报告 IRR','—','—','',{uncertain:true}),
            _scField('管理费（本期）','—','—','',{uncertain:true}),_scField('管理费（累计）','—','—','',{uncertain:true}),_scField('业绩报酬（累计）','—','—','',{uncertain:true}),
            _scField('新增后续轮融资个数','—','—'),_scField('资产配置摘要','前沿科技及智能硬件、企业服务/云、消费升级及产业互联网。','子基金列表!J8','',{long:true}),
            _scField('业务进展','—','—','',{long:true}),
            _scField('退出规划与重大事项','—','—','',{long:true})
          ]),
          _scSection('底层项目明细',[
            _scField('项目简称','京东工业品','投资列表!C'),_scField('项目工商全称','北京京东叁佰陆拾度电子商务有限公司','投资列表!D'),
            _scField('企业所在省（直辖市）','北京','投资列表!E'),_scField('项目注册地（市）','北京','投资列表!F'),_scField('项目注册地（区）','北京经济技术开发区','投资列表!G'),
            _scField('项目注册地址','—','投资列表!H'),
            _scField('所属行业','产业互联网','投资列表!I'),_scField('细分行业','—','—'),_scField('主营业务','中国头部且盈利的一站式工业品线上采购平台','投资列表!J'),
            _scField('投资轮次','A轮','投资列表!P'),_scField('首次投资日期','2020-08-17','投资列表!K'),_scField('领投者(Y/N)','领投','投资列表!Q'),_scField('项目负责人','徐炳东','投资列表!R'),
            _scField('总投资金额(投资本金)','6,645.40 万元','投资列表!N'),_scField('平行基金总投资金额(投资本金)','11,075.67 万元','投资列表!O'),_scField('剩余投资成本','6,645.40 万元','投资列表!AB'),
            _scField('最新持股比例','0.35%','投资列表!AC'),_scField('公司最新投后估值','2,952,166.90 万元','投资列表!AA'),_scField('已实现价值','0','投资列表!AD'),_scField('未实现价值','10,423.61 万元','投资列表!AE'),
            _scField('项目公允价值','10,423.61 万元','投资列表!AF','已实现+未实现',{derived:'0＋10,423.61'}),_scField('回报倍数','1.57x','投资列表!AH'),
            _scField('当期公允价值变动','-1,661.21 万元','投资列表!AI','较上季',{derived:'本季公允价值－上季公允价值'}),
            _scField('退出状态','在管','投资列表!AG'),_scField('确权情况','—','—'),_scField('投资方式','—','—'),
            _scField('是否有后续轮融资（Y/N）','—','投资列表!AM'),_scField('最新一轮融资日期','—','投资列表!AN'),_scField('最新一轮融资估值','—','投资列表!AO'),_scField('最新一轮融资后持股比例','—','投资列表!AP'),
            _scField('拟IPO项目时间预期','—','投资列表!AU'),
            _scField('营业收入（2025年度）','18,500 万元','GGV!G2025'),_scField('净利润（2025年度）','2,100 万元','GGV!H2025'),
            _scField('营业收入（2026上半年）','11,200 万元','GGV!G2026H1'),_scField('净利润（2026上半年）','1,450 万元','GGV!H2026H1'),
            _scField('项目状态备注','—','—','',{long:true}),
            _scField('业务进展','—','—','',{long:true}),
            _scField('退出规划','—','—','',{long:true}),
            _scField('后续融资情况','—','—','',{long:true})
          ])
        ]
      },
      {
        name:'纪源皓元-众源母基金资本账户-2026Q1.xlsx', short:'资本账户', type:'资本账户表', component:'资本账户识别',
        previewHeaders:['位置','字段','原文值'],previewRows:[['子基金列表!W8','本机构认缴金额','5,000'],['子基金列表!Y8','本机构实缴金额','5,000'],['子基金列表!AA8','期末权益','8,394.60'],['子基金列表!AB8','累计分配','423.59']],
        sections:[_scSection('本机构资本账户',[
          _scField('本机构认缴金额','5,000 万元','子基金列表!W8'),_scField('众源认缴比例','3.12%','子基金列表!X8'),_scField('本机构实缴金额','5,000 万元','子基金列表!Y8'),_scField('未缴款余额','0 万元','认缴－实缴','认缴金额－实缴金额',{derived:'5,000－5,000'}),
          _scField('累计分配金额','423.59 万元','子基金列表!AB8'),_scField('本期分配金额','80.00 万元','F30'),_scField('资本账户期末余额','8,394.60 万元','子基金列表!AA8'),
          _scField('TVPI（本机构自算）','1.76x','子基金列表!Z8','（期末权益＋累计分配）÷累计实缴',{derived:'(8,394.60＋423.59)÷5,000'}),
          _scField('DPI（本机构自算）','0.08x','子基金列表!AC8','累计分配÷累计实缴',{derived:'423.59÷5,000'})
        ])]
      },
      {
        name:'GGV人民币二期-2026Q1分配通知.pdf', short:'分配通知', type:'分配通知', component:'分配事件识别',
        previewHeaders:['位置','字段','原文值'],previewRows:[['P1','通知日期','2026-05-18'],['P1','本次分配总额','8,000,000'],['P2','成本收回','5,600,000'],['P2','收益分配','2,400,000'],['P3','关联项目','科亚医疗（部分退出）']],
        sections:[_scSection('分配事件',[
          _scField('分配通知日期','2026-05-18','P1'),_scField('分配金额（总额）','800.00 万元','P1'),_scField('成本收回部分','560.00 万元','P2'),_scField('收益分配部分','240.00 万元','P2'),
          _scField('关联项目／退出事项','科亚医疗（部分退出）','P3'),_scField('分配类型','现金分配','P1')
        ])]
      },
      {
        name:'投后数据整理template.xlsx', short:'内部台账', type:'内部财务表', component:'内部台账导入',
        previewHeaders:['Sheet','识别对象','关键字段'],previewRows:[['子基金列表','GGV人民币二期','基金简称、实缴、TVPI、DPI'],['分配明细','GGV人民币二期','分配时间、分配金额'],['子基金项目投资列表','京东工业品','投资金额、持股、公允价值']],
        sections:[_scSection('内部历史数据',[
          _scField('基金内部编号','FOF-014','子基金列表!A8'),_scField('本机构认缴金额','5,000 万元','子基金列表!W8'),_scField('本机构实缴金额','5,000 万元','子基金列表!Y8'),
          _scField('内部实缴流水','2020-07-15 · 5,000 万元','实缴流水!A2:C2'),_scField('累计分配金额','423.59 万元','子基金列表!AB8'),_scField('内部分配流水','2026-05-18 · 80 万元 · 科亚医疗','分配明细'),
          _scField('基金层面 MOIC／TVPI','2.37x／1.76x','子基金列表!V8:Z8'),_scField('历史季度全部指标','截至 2026-03-31','子基金列表')
        ])]
      }
    ];
  }

  /* 直投项目确认：企业材料；财务走三表工作台 */
  function _directMockSources() {
    return [
      {
        name:'星河智造-2026H1-补充材料.pdf', short:'财务三表', type:'被投企业财报', component:'财务报表识别',
        previewHeaders:['项目','2025FY','2026H1'],
        previewRows:[['营业收入','12,800','8,900'],['营业成本','7,680','5,320'],['净利润','1,820','1,450'],['货币资金','1,680','1,941.84'],['资产总计','45,000','48,000']],
        sections:[
          _scSection('报表头信息',[
            _scField('报表类型','资产负债表／利润表／现金流量表','文件包'),_scField('报告期间（截止日）','2026-06-30','表头'),_scField('币种','CNY','表头'),_scField('单位','万元','表头'),
            _scField('所属企业','星河智造（苏州）科技有限公司','文件名 / 表头')
          ])
        ]
      },
      {
        name:'星河智造-B轮股权文件.pdf', short:'后续融资', type:'后续轮融资', component:'融资事件识别',
        previewHeaders:['位置','字段','原文值'],previewRows:[['P2','融资轮次','B轮'],['P2','投后估值','80,000'],['P4','最新持股比例','12%'],['P6','领投方','光源创投']],
        sections:[_scSection('后续轮融资事件',[
          _scField('最新估值（投后）','8.00 亿元','P3'),_scField('最新持股比例','12%','P4'),_scField('融资轮次','B轮','P2'),
          _scField('融资金额','约 1.80 亿元','P2','',{uncertain:true}),_scField('新投资人／领投方','光源创投领投，元生资本跟投','P6','',{uncertain:true}),_scField('融资日期','2026-06-20','P1')
        ])]
      },
      {
        name:'星河智造-投资协议.pdf', short:'投资协议', type:'投资协议', component:'关键条款识别',
        previewHeaders:['位置','条款','识别内容'],previewRows:[['§8.1','回购权','业绩不达标触发'],['§9.2','反稀释','加权平均'],['§10.1','优先清算','本金+8%'],['附件','董事席位','1 席']],
        sections:[_scSection('关键条款',[
          _scField('回购权','业绩不达标触发回购','§8.1','',{long:true}),_scField('反稀释条款','加权平均反稀释','§9.2'),
          _scField('优先清算权','本金+8% 收益优先','§10.1'),_scField('公司治理（董事席位）','投资人有权提名 1 名董事，重大事项一票否决','附件'),
          _scField('领售权／拖售权','未约定','§11.1')
        ])]
      },
      {
        name:'星河智造-企业工商档案.pdf', short:'工商档案', type:'工商档案', component:'企业档案识别',
        previewHeaders:['位置','字段','原文值'],previewRows:[['P1','企业名称','星河智造（苏州）科技有限公司'],['P1','统一社会信用代码','91320594MA1XQ8C7X2'],['P1','法定代表人','沈峰'],['P1','注册资本','5,000 万元']],
        sections:[_scSection('企业工商与人员',[
          _scField('企业名称','星河智造（苏州）科技有限公司','P1'),_scField('统一社会信用代码','91320594MA1XQ8C7X2','P1'),_scField('法定代表人','沈峰','P1'),
          _scField('成立日期','2019-04-10','P1'),_scField('注册资本','5,000 万元','P1'),_scField('注册地址','江苏省苏州市工业园区','P1'),_scField('经营状态','存续','P1'),
          _scField('所处行业','智能制造','P2')
        ])]
      }
    ];
  }

  function _structuredMockSources() { return _fundMockSources(); }

  function _finMatrixRow(name, vals, loc, opt) {
    opt = opt || {};
    return { name:name, vals:vals || [], loc:loc || '', raw:opt.raw || name, type:opt.type || '', warn:!!opt.warn, note:opt.note || '', warnCols:opt.warnCols || null };
  }
  function _parseFinNum(s) {
    if (s == null || s === '—' || s === '') return null;
    var n = Number(String(s).replace(/,/g, ''));
    return isNaN(n) ? null : n;
  }
  function _fmtFinNum(n) {
    if (n == null) return '—';
    var neg = n < 0;
    var abs = Math.round(Math.abs(n)).toLocaleString('en-US');
    return neg ? ('-' + abs) : abs;
  }
  /* 利润表／现金流量：累计识别列 + 倒减派生单期列（示意） */
  function _rowsWithCumulativeDerive(rows) {
    return (rows || []).map(function (row) {
      if (row.type === 'section' || !row.vals || !row.vals.length) return row;
      var q1 = row.vals[0];
      var h1 = row.vals.length > 4 ? row.vals[4] : row.vals[row.vals.length - 1];
      var a = _parseFinNum(q1);
      var b = _parseFinNum(h1);
      var q2 = (a != null && b != null) ? _fmtFinNum(b - a) : '—';
      return {
        name: row.name, vals: [q1, h1, q2], loc: row.loc, raw: row.raw, type: row.type,
        warn: !!row.warn, note: row.note || '', warnCols: row.warn ? [1] : null
      };
    });
  }
  function _financeConfirmData() {

    var isCols = [
      {label:'2026Q1累计',sem:'累计',year:'2026',period:'一季度',caliber:'实际',scope:'合并'},
      {label:'2026H1累计',sem:'累计',year:'2026',period:'二季度',caliber:'实际',scope:'合并'},
      {label:'2026Q2（派生）',sem:'当期 · 派生',year:'2026',period:'二季度',caliber:'实际',scope:'合并',derived:true,formula:'2026H1累计 − 2026Q1累计'}
    ];
    var bsCols = [
      {label:'2025年末',sem:'期末',year:'2025',period:'全年',caliber:'实际',scope:'合并'},
      {label:'2026年3月末',sem:'期末',year:'2026',period:'3月',caliber:'实际',scope:'合并'},
      {label:'2026年4月末',sem:'期末',year:'2026',period:'4月',caliber:'实际',scope:'合并'},
      {label:'2026年5月末',sem:'期末',year:'2026',period:'5月',caliber:'实际',scope:'合并'},
      {label:'2026年6月末',sem:'期末',year:'2026',period:'6月',caliber:'实际',scope:'合并'}
    ];
    return {
      deriveHint:{ title:'已根据累计期间倒减出单期列', detail:'档案已有同年度一季报累计，本次识别较长累计 → 自动派生二季报单期。规则通用于三季报／年报等累计倒减。', formula:'单期派生列 ＝ 较长累计 − 较短累计（例：二季度／6 月末累计 − 一季报累计）' },
      statements:{
        is:{ label:'利润表', code:'PL', cols:isCols, rows:_rowsWithCumulativeDerive([
          _finMatrixRow('营业收入',['244,013,176','228,080,301','355,323,700','274,703,986','1,102,121,163'],'PL!B4:F4',{raw:'一、营业收入'}),
          _finMatrixRow('营业成本',['42,773,522','52,789,871','48,476,727','54,216,702','198,256,822'],'PL!B5:F5',{raw:'减：营业成本'}),
          _finMatrixRow('税金及附加',['1,028,385','1,083,535','1,017,106','992,004','4,121,030'],'PL!B6:F6'),
          _finMatrixRow('销售费用',['115,581,371','101,360,948','90,294,318','110,305,738','417,542,375'],'PL!B7:F7'),
          _finMatrixRow('管理费用',['34,422,911','43,852,470','47,716,867','52,751,970','178,744,218'],'PL!B8:F8'),
          _finMatrixRow('研发费用',['24,557,235','25,015,694','26,337,805','27,042,948','102,953,682'],'PL!B9:F9'),
          _finMatrixRow('财务费用',['28,775','1,083,412','2,291,145','1,788,444','5,191,776'],'PL!B10:F10'),
          _finMatrixRow('其中：利息费用',['317,595','302,636','281,258','281,257','1,182,746'],'PL!B11:F11',{type:'detail'}),
          _finMatrixRow('利息收入',['-846,296','-1,581,390','-668,751','-78,532','-3,174,969'],'PL!B12:F12',{type:'detail'}),
          _finMatrixRow('其他收益',['1,694,252','4,138,563','133,536','23,102','5,989,452'],'PL!B13:F13'),
          _finMatrixRow('资产处置收益',['243,853','8,456','-210','—','252,099'],'PL!B19:F19'),
          _finMatrixRow('营业利润',['27,559,082','7,041,390','141,102,531','27,629,282','203,332,284'],'PL!B20:F20',{type:'total',note:'系统重算一致'}),
          _finMatrixRow('营业外收入',['76,527','145,843','141,260','48,182','411,812'],'PL!B21:F21'),
          _finMatrixRow('营业外支出',['25,052','521,970','288,908','674,424','1,510,354'],'PL!B22:F22'),
          _finMatrixRow('利润总额',['27,610,557','6,665,263','140,954,883','27,003,039','202,233,743'],'PL!B23:F23',{type:'total'}),
          _finMatrixRow('所得税费用',['—','367','—','—','367'],'PL!B24:F24'),
          _finMatrixRow('净利润',['27,610,557','6,664,896','140,954,883','27,003,039','202,233,376'],'PL!B25:F25',{type:'total',note:'利润总额－所得税＝净利润'}),
          _finMatrixRow('归属于母公司所有者的净利润',['27,651,019','6,747,738','140,831,579','27,003,039','202,233,376'],'PL!B31:F31',{type:'detail'}),
          _finMatrixRow('少数股东损益',['-40,462','-82,842','123,304','—','—'],'PL!B32:F32',{type:'detail'}),
          _finMatrixRow('综合收益总额',['27,333,784','7,150,656','141,272,136','26,835,940','202,592,516'],'PL!B44:F44',{type:'total'})
        ]),},
        bs:{ label:'资产负债表', code:'BS', cols:bsCols, rows:[
          _finMatrixRow('流动资产','', '', {type:'section'}),
          _finMatrixRow('货币资金',['66,289,898','120,318,760','143,608,760','166,899,760','186,500,318'],'BS!B6:F6',{warn:true,warnCols:[4],note:'2026年6月末 · 与现金流量表期末现金差 −80,000，需核对'}),
          _finMatrixRow('应收账款',['118,420,000','121,206,540','124,906,540','129,406,540','132,806,540'],'BS!B9:F9',{note:'原表“应收票据及应收账款”拆分后需确认'}),
          _finMatrixRow('存货',['82,120,000','86,331,205','89,331,205','92,331,205','96,331,205'],'BS!B12:F12'),
          _finMatrixRow('流动资产合计',['430,800,000','462,406,782','478,406,782','495,406,782','512,406,782'],'BS!B18:F18',{type:'total'}),
          _finMatrixRow('非流动资产','', '', {type:'section'}),
          _finMatrixRow('固定资产净值',['210,100,000','217,694,610','221,694,610','225,694,610','228,694,610'],'BS!B25:F25',{raw:'固定资产'}),
          _finMatrixRow('无形资产',['58,900,000','60,708,900','61,708,900','62,708,900','63,708,900'],'BS!B29:F29'),
          _finMatrixRow('资产总计',['812,000,000','842,406,782','871,406,782','890,406,782','906,452,183'],'BS!B36:F36',{type:'total'}),
          _finMatrixRow('负债及所有者权益','', '', {type:'section'}),
          _finMatrixRow('短期借款',['72,000,000','74,000,000','76,000,000','78,000,000','80,000,000'],'BS!H6:L6'),
          _finMatrixRow('应付账款',['91,825,470','96,825,470','100,825,470','103,825,470','106,825,470'],'BS!H10:L10'),
          _finMatrixRow('流动负债合计',['218,930,106','226,930,106','233,930,106','240,930,106','246,930,106'],'BS!H18:L18',{type:'total'}),
          _finMatrixRow('长期借款',['82,000,000','84,000,000','86,000,000','88,000,000','90,000,000'],'BS!H24:L24'),
          _finMatrixRow('负债合计',['332,000,000','340,702,400','352,702,400','361,702,400','368,702,400'],'BS!H30:L30',{type:'total'}),
          _finMatrixRow('实收资本（股本）',['200,000,000','200,000,000','200,000,000','200,000,000','200,000,000'],'BS!H34:L34'),
          _finMatrixRow('未分配利润',['180,000,000','201,704,382','218,704,382','228,704,382','237,749,783'],'BS!H39:L39',{note:'与权益变动表期末值勾稽'}),
          _finMatrixRow('所有者权益合计',['480,000,000','501,704,382','518,704,382','528,704,382','537,749,783'],'BS!H42:L42',{type:'total'}),
          _finMatrixRow('负债和所有者权益总计',['812,000,000','842,406,782','871,406,782','890,406,782','906,452,183'],'BS!H43:L43',{type:'total',note:'与资产总计差额 0'})
        ]},
        cf:{ label:'现金流量表', code:'CF', cols:isCols, rows:_rowsWithCumulativeDerive([
          _finMatrixRow('经营活动现金流入小计',['259,620,530','268,000,000','286,000,000','271,000,000','1,084,620,530'],'CF!B12:F12'),
          _finMatrixRow('经营活动现金流出小计',['217,800,530','232,400,000','235,580,000','226,599,580','912,380,110'],'CF!B20:F20'),
          _finMatrixRow('经营活动现金流量净额',['41,820,000','35,600,000','50,420,000','44,400,420','172,240,420'],'CF!B21:F21',{type:'total'}),
          _finMatrixRow('投资活动现金流量净额',['-20,000,000','-24,310,000','-18,000,000','-24,000,000','-86,310,000'],'CF!B31:F31',{type:'total'}),
          _finMatrixRow('筹资活动现金流量净额',['8,000,000','12,000,000','6,200,000','8,000,000','34,200,000'],'CF!B41:F41',{type:'total'}),
          _finMatrixRow('汇率变动对现金的影响',['—','—','—','—','—'],'CF!B44:F44'),
          _finMatrixRow('现金及现金等价物净增加额',['29,820,000','23,290,000','38,620,000','28,400,420','120,130,420'],'CF!B45:F45',{type:'total',note:'经营＋投资＋筹资＝净增加额'}),
          _finMatrixRow('期初现金及现金等价物余额',['66,289,898','96,109,898','119,399,898','158,019,898','66,289,898'],'CF!B46:F46'),
          _finMatrixRow('期末现金及现金等价物余额',['96,109,898','119,399,898','158,019,898','186,420,318','186,420,318'],'CF!B47:F47',{type:'total',warn:true,warnCols:[4],note:'2026年6月末 · 与资产负债表货币资金差 +80,000，需核对'})
        ]),},
        aux:{ label:'权益与附注', code:'EQ', cols:[isCols[1],isCols[2]], rows:[
          _finMatrixRow('期初未分配利润',['35,516,407','35,516,407'],'EQ!D6:E6'),
          _finMatrixRow('本期净利润（转入）',['27,003,039','202,233,376'],'EQ!D9:E9',{note:'与利润表净利润一致'}),
          _finMatrixRow('利润分配及其他',['—','—'],'EQ!D12:E12'),
          _finMatrixRow('期末未分配利润',['62,519,446','237,749,783'],'EQ!D14:E14',{type:'total',note:'与资产负债表未分配利润一致'}),
          _finMatrixRow('应收账款账龄：1年内',['83%','83%'],'附注!P18'),
          _finMatrixRow('应收账款账龄：1—2年',['11%','11%'],'附注!P18'),
          _finMatrixRow('应收账款账龄：2—3年',['4%','4%'],'附注!P18'),
          _finMatrixRow('应收账款账龄：3年以上',['2%','2%'],'附注!P18'),
          _finMatrixRow('收入构成：设备／订阅／其他',['62%／28%／10%','62%／28%／10%'],'附注!P26'),
          _finMatrixRow('审计状态',['未审计','未审计'],'封面')
        ]}
      },
      checks:[
        {name:'资产负债表平衡',kind:'intra',status:'pass',period:'2026年6月末',
         lhs:{label:'资产总计',value:'906,452,183',stmt:'bs',row:8},
         rhs:[{label:'负债合计',value:'368,702,400',stmt:'bs',row:14},{label:'所有者权益合计',value:'537,749,783',stmt:'bs',row:17}],
         error:'0'},
        {name:'利润表净利润',kind:'intra',status:'pass',period:'FY2026 · 1-6月累计',
         lhs:{label:'净利润',value:'202,233,376',stmt:'is',row:16},
         rhs:[{label:'利润总额',value:'202,233,743',stmt:'is',row:14},{label:'所得税费用',value:'367',sign:'－',stmt:'is',row:15}],
         error:'0'},
        {name:'现金净增加额',kind:'intra',status:'pass',period:'FY2026 · 1-6月累计',
         lhs:{label:'现金净增加额',value:'120,130,420',stmt:'cf',row:6},
         rhs:[{label:'经营净额',value:'172,240,420',stmt:'cf',row:2},{label:'投资净额',value:'-86,310,000',stmt:'cf',row:3},{label:'筹资净额',value:'34,200,000',stmt:'cf',row:4},{label:'汇率影响',value:'0',stmt:'cf',row:5}],
         error:'0'},
        {name:'净利润转入权益',kind:'cross',status:'pass',period:'FY2026 · 1-6月累计',
         lhs:{label:'权益表·本期净利润转入',value:'202,233,376',stmt:'aux',row:1},
         rhs:[{label:'利润表·净利润',value:'202,233,376',stmt:'is',row:16}],
         error:'0'},
        {name:'期末未分配利润',kind:'cross',status:'pass',period:'2026年6月末',
         lhs:{label:'权益表·期末未分配利润',value:'237,749,783',stmt:'aux',row:3},
         rhs:[{label:'资产负债表·未分配利润',value:'237,749,783',stmt:'bs',row:16}],
         error:'0'},
        {name:'期末现金勾稽',kind:'cross',status:'warn',period:'2026年6月末',
         lhs:{label:'现金流量表·期末现金',value:'186,420,318',stmt:'cf',row:8},
         rhs:[{label:'资产负债表·货币资金',value:'186,500,318',stmt:'bs',row:1}],
         error:'-80,000'}
      ]
    };
  }

  function _renderFinancePreview(fin, activeRow, source) {
    var sheet = fin.statements[FIN_CONFIRM_STATE.stmt] || fin.statements.is;
    var rows = sheet.rows.map(function (row, ri) {
      if (row.type === 'section') return '<tr class="po-fin-preview-section"><td colspan="' + (sheet.cols.length + 1) + '">' + esc(row.name) + '</td></tr>';
      return '<tr class="po-doc-row' + (ri === activeRow ? ' active' : '') + '" data-field-idx="' + ri + '"><td class="po-doc-k">' + esc(row.raw) + '</td>'
        + row.vals.map(function (v) { return '<td class="po-doc-v po-doc-hi' + (ri === activeRow ? ' active' : '') + '" data-field-idx="' + ri + '">' + esc(v) + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="po-doc-page po-source-preview po-fin-source-preview"><div class="po-doc-h">原始报表<span class="po-doc-sub">' + esc(source.name) + '</span></div>'
      + '<div class="po-source-kind">' + esc(sheet.label) + ' · 原始科目和金额保持不变</div><div class="po-doc-table-wrap"><table class="po-doc-table po-fin-preview-table"><thead><tr><td>项目</td>'
      + sheet.cols.map(function (c) { return '<td>' + esc(c.label) + '</td>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function _renderFinanceWorkbench(fin, saved) {
    var stmtKey = FIN_CONFIRM_STATE.stmt;
    var sheet = fin.statements[stmtKey] || fin.statements.is;
    var tabs = ['bs','is','cf','aux'].map(function (key) {
      var s = fin.statements[key];
      return '<button class="po-fin-wb-tab' + (stmtKey === key ? ' active' : '') + '" data-act="switchFinanceStatement" data-arg="' + key + '">' + esc(s.label) + '<span>' + s.rows.filter(function(r){return r.type !== 'section';}).length + '</span></button>';
    }).join('');
    var periodIdx = Math.min(FIN_CONFIRM_STATE.activePeriod, sheet.cols.length - 1);
    var period = sheet.cols[periodIdx] || sheet.cols[0];
    /* 期间口径：年度 + 期间 + 金额口径（利润/现金＝当期·累计；资产负债＝期初·期末） */
    var periodEditor = '';
    if (FIN_CONFIRM_STATE.periodOpen && period) {
      var isBs = stmtKey === 'bs';
      var isCumu = /累计/.test(period.sem);
      var isOpening = /期初/.test(period.sem);
      var perOpts = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月','一季度','二季度','三季度','四季度','全年'];
      var amountChecks = isBs
        ? ('<div class="po-fin-period-checks" role="group" aria-label="金额口径">'
          + '<label class="po-fin-period-check"><input type="checkbox" data-fin-period-field="opening"' + (isOpening ? ' checked' : '') + ' /> 期初</label>'
          + '<label class="po-fin-period-check"><input type="checkbox" data-fin-period-field="closing"' + (isOpening ? '' : ' checked') + ' /> 期末</label>'
          + '</div>')
        : ('<div class="po-fin-period-checks" role="group" aria-label="金额口径">'
          + '<label class="po-fin-period-check"><input type="checkbox" data-fin-period-field="current"' + (isCumu ? '' : ' checked') + ' /> 当期</label>'
          + '<label class="po-fin-period-check"><input type="checkbox" data-fin-period-field="cumulative"' + (isCumu ? ' checked' : '') + ' /> 累计</label>'
          + '</div>');
      var amountHint = isBs
        ? '资产负债表金额口径为期初／期末（互斥，至少勾一项）。「实际／合并」按机构默认，不在此改。'
        : '利润表／现金流量为当期／累计（互斥，至少勾一项）；勾累计后可倒减缺的单期。「实际／合并」按机构默认，不在此改。';
      periodEditor = '<div class="po-fin-period-editor"><div class="po-fin-period-editor-head"><strong>' + esc(period.label) + '</strong><button class="po-icon-btn" data-act="closeFinancePeriod">×</button></div>'
        + '<div class="po-fin-period-simple">'
        + '<label>年度<select data-fin-period-field="year"><option>' + esc(period.year) + '</option><option>2025</option><option>2024</option></select></label>'
        + '<label>期间<select data-fin-period-field="period">' + perOpts.map(function(o){return '<option' + (o === period.period ? ' selected' : '') + '>' + o + '</option>';}).join('') + '</select></label>'
        + amountChecks
        + '</div><p>' + amountHint + '</p></div>';
    }
    var deriveBanner = '';
    if (!FIN_CONFIRM_STATE.deriveBannerClosed && fin.deriveHint && (stmtKey === 'is' || stmtKey === 'cf')) {
      var dh = fin.deriveHint;
      deriveBanner = '<div class="po-fin-derive-banner" role="status">'
        + '<div class="po-fin-derive-banner-body"><strong>' + esc(dh.title) + '</strong>'
        + '<span>' + esc(dh.detail) + '</span>'
        + '<code class="po-fin-derive-formula">' + esc(dh.formula) + '</code></div>'
        + '<button type="button" class="po-icon-btn" data-act="dismissDeriveBanner" title="关闭" aria-label="关闭">×</button>'
        + '</div>';
    }
    var checks = fin.checks;
    var passChecks = checks.filter(function(c){return c.status === 'pass';});
    var failChecks = checks.filter(function(c){return c.status !== 'pass';});
    var failLabel = failChecks.map(function(c){return c.name + '（' + (c.kind === 'cross' ? '跨表' : '单表') + '）';}).join('、');
    var lastBsCol = fin.statements.bs.cols[fin.statements.bs.cols.length - 1];
    var lastIsCol = fin.statements.is.cols[fin.statements.is.cols.length - 1];
    var trialPeriodNote = '<span class="po-tb-period-note">核查列：资产负债 ' + esc(lastBsCol.label) + ' · 利润表/现金流量 ' + esc(lastIsCol.label) + '</span>';
    /* 试算公式卡片：LHS 名称 = 各项名称；下一行代入实际数值，标出误差；每个位置可定位 */
    function _fmtTerms(arr, useVal){
      return arr.map(function(t, i){
        var sign = i === 0 ? '' : ((t.sign || '＋') + ' ');
        var body = useVal
          ? '<button class="po-tb-pos" data-act="locateFinanceCheck" data-arg="' + t.stmt + '|' + t.row + '" title="定位到 ' + esc(t.label) + '">' + esc(_fmtYuanToGlobalDisplay(t.value)) + '</button>'
          : esc(t.label);
        return sign + body;
      }).join(' ');
    }
    function _trialCard(c, no){
      var warn = c.status !== 'pass';
      return '<div class="po-tb-card' + (warn ? ' warn' : '') + '">'
        + '<div class="po-tb-card-head"><span class="po-tb-no">' + no + '</span><strong>' + esc(c.name) + '</strong><span class="po-tb-kind">' + (c.kind === 'cross' ? '跨表勾稽' : '单表试算') + '</span>' + (warn ? '' : '<span class="po-tb-ok">✓ 平衡</span>') + '</div>'
        + '<div class="po-tb-formula">' + esc(c.lhs.label) + ' ＝ ' + _fmtTerms(c.rhs, false) + '</div>'
        + '<div class="po-tb-calc"><span class="po-tb-period">' + esc(c.period) + '</span>'
        + '<button class="po-tb-pos po-tb-pos-lhs" data-act="locateFinanceCheck" data-arg="' + c.lhs.stmt + '|' + c.lhs.row + '">' + esc(_fmtYuanToGlobalDisplay(c.lhs.value)) + '</button> ＝ ' + _fmtTerms(c.rhs, true)
        + (warn ? '<span class="po-tb-error">误差 ' + esc(_fmtYuanToGlobalDisplay(c.error)) + '</span>' : '') + '</div>'
        + '</div>';
    }
    var trialPanel = '';
    if (FIN_CONFIRM_STATE.trialView === 'fail') {
      trialPanel = '<div class="po-fin-trial-panel"><div class="po-fin-trial-summary po-tb-sum-fail"><strong>试算不平 ' + failChecks.length + ' 项</strong><span>点击数值可定位到对应报表科目</span>' + trialPeriodNote + '</div>'
        + (failChecks.length ? failChecks.map(function(c,i){return _trialCard(c, i+1);}).join('') : '<div class="po-tb-empty">全部规则通过，无不平衡项</div>') + '</div>';
    } else if (FIN_CONFIRM_STATE.trialView === 'pass') {
      trialPanel = '<div class="po-fin-trial-panel"><div class="po-fin-trial-summary po-tb-sum-pass"><strong>试算平衡 ' + passChecks.length + ' 项</strong><span>单表试算与跨表勾稽</span>' + trialPeriodNote + '</div>'
        + passChecks.map(function(c,i){return _trialCard(c, i+1);}).join('') + '</div>';
    }
    var warnRowsInSheet = sheet.rows.filter(function(r){return r.warn;}).length;
    var hasDerivedCol = sheet.cols.some(function (c) { return c.derived; });
    /* 有派生列时默认全量展示；用户点「仅看不平衡」后才过滤 */
    var showAllRows = hasDerivedCol ? !FIN_CONFIRM_STATE.filterUnbalanced : FIN_CONFIRM_STATE.showAll;
    var colSpan = sheet.cols.length + 1;
    var bodyRows = sheet.rows.map(function (row, ri) {
      if (!showAllRows) {
        if (row.type === 'section') return '';
        if (!row.warn) return '';
      }
      if (row.type === 'section') return '<tr class="po-fin-matrix-section"><td colspan="' + colSpan + '">' + esc(row.name) + '</td></tr>';
      var locBadge = row.loc
        ? '<sup class="po-src-badge" title="' + esc(row.loc) + '" data-act="locateFinanceRow" data-arg="' + ri + '">' + (ri + 1) + '</sup>'
        : '';
      return '<tr class="po-fin-matrix-row ' + esc(row.type) + (row.warn ? ' warn' : '') + '"><td class="po-fin-matrix-name"><strong>' + esc(row.name) + locBadge + '</strong>'
        + (row.raw !== row.name ? '<small>原表：' + esc(row.raw) + '</small>' : '')
        + (row.note ? '<small>' + esc(row.note) + '</small>' : '') + '</td>'
        + row.vals.map(function(v, ci){
            var key='fin:' + stmtKey + ':' + ri + ':' + ci;
            var raw=saved[key] != null?saved[key]:v;
            var yuanN=_parseAccountingYuan(raw);
            var cellWarn=row.warnCols && row.warnCols.indexOf(ci) >= 0;
            var col = sheet.cols[ci] || {};
            var derivedCls = col.derived ? ' po-fin-cell-derived' : '';
            var title = col.derived ? ('派生：' + (col.formula || '')) : '';
            if (yuanN == null) {
              return '<td class="' + (cellWarn ? 'po-fin-cell-warn' : '') + derivedCls + '"' + (title ? ' title="' + esc(title) + '"' : '') + '><input class="po-fin-matrix-input" data-structured-value="' + key + '" value="' + esc(raw) + '" aria-label="' + esc(row.name + ' ' + col.label) + '" /></td>';
            }
            var show=_fmtYuanToGlobalDisplay(raw);
            return '<td class="' + (cellWarn ? 'po-fin-cell-warn' : '') + derivedCls + '"' + (title ? ' title="' + esc(title) + '"' : '') + '><span class="po-input-with-unit po-fin-money-cell"><input class="po-fin-matrix-input" data-structured-value="' + key + '" data-money-base="yuan" data-money-unit="' + getGlobalMoneyUnit() + '" value="' + esc(String(show).replace(/,/g, '')) + '" aria-label="' + esc(row.name + ' ' + col.label) + '" /><span class="po-input-unit">' + esc(moneyUnitLabel(getGlobalMoneyUnit())) + '</span></span></td>';
          }).join('')
        + '</tr>';
    }).join('');
    if (!showAllRows && !warnRowsInSheet) {
      bodyRows = '<tr class="po-fin-matrix-empty"><td colspan="' + colSpan + '">本表科目均平衡，差异在其他报表；可切换报表或“查看全部科目”</td></tr>';
    }
    /* 过滤条：不重复试算计数，只说明当前过滤态与差异所在规则 */
    var filterBar = '<div class="po-fin-filter-bar">'
      + (showAllRows
        ? '<span class="po-fin-filter-info">显示全部科目' + (hasDerivedCol ? ' · 含派生单期列' : '') + '</span><button class="po-btn po-btn-sm" data-act="toggleFinShowAll">仅看不平衡 ↑</button>'
        : '<span class="po-fin-filter-info">仅显示不平衡项' + (failChecks.length ? ' · 差异：<strong class="warn">' + esc(failLabel) + '</strong>' : '') + '</span><button class="po-btn po-btn-sm" data-act="toggleFinShowAll">查看全部科目 ↓</button>')
      + '</div>';
    var unitLab = moneyUnitLabel(getGlobalMoneyUnit());
    var table = '<div class="po-fin-matrix-wrap"><table class="po-fin-matrix"><thead><tr><th class="po-fin-matrix-name">标准科目（展示 ' + esc(unitLab) + '）</th>'
      + sheet.cols.map(function(c,ci){
          return '<th class="' + (c.derived ? 'po-fin-th-derived' : '') + '"><button class="po-fin-period-trigger' + (periodIdx === ci && FIN_CONFIRM_STATE.periodOpen ? ' active' : '') + '" data-act="configureFinancePeriod" data-arg="' + ci + '"><strong>' + esc(c.label) + '</strong><span>' + esc(c.sem) + '</span></button></th>';
        }).join('')
      + '</tr></thead><tbody>' + bodyRows + '</tbody></table></div>';
    return '<div class="po-fin-wb-head"><div><strong>财务三表识别</strong><span>识别保真（原文按元）· 展示跟右栏「' + esc(unitLab) + '」· 累计可倒减单期</span></div><span class="po-auto-save" data-structured-save>已保存</span></div>'
      + '<div class="po-fin-wb-toolbar"><div class="po-fin-wb-tabs">' + tabs + '</div><div class="po-fin-trial-toggles">'
      + '<button class="po-fin-trial-btn fail' + (FIN_CONFIRM_STATE.trialView === 'fail' ? ' active' : '') + '" data-act="toggleFinanceTrial" data-arg="fail"><b>' + failChecks.length + '</b> 试算不平 ' + (FIN_CONFIRM_STATE.trialView === 'fail' ? '▲' : '▼') + '</button>'
      + '<button class="po-fin-trial-btn pass' + (FIN_CONFIRM_STATE.trialView === 'pass' ? ' active' : '') + '" data-act="toggleFinanceTrial" data-arg="pass"><b>' + passChecks.length + '</b> 试算平衡 ' + (FIN_CONFIRM_STATE.trialView === 'pass' ? '▲' : '▼') + '</button>'
      + '</div></div>'
      + deriveBanner + periodEditor + trialPanel + filterBar + table;
  }

  /* ═══ 文件解析详情页 · 解析结果导出（Excel） ═══ */
  /* 构建导出数据：概览 + 各业务 Tab 一个 Sheet + 来源溯源 + 操作记录 */
  function _poTraceSheet(sources) {
    var rows = [];
    var n = 0;
    (sources || []).forEach(function (src) {
      (src.sections || []).forEach(function (sec) {
        (sec.rows || []).forEach(function (f) {
          n += 1;
          if (f.derived) {
            rows.push([n, f.name || '', '—', '—', f.derived || '', '派生', sec.title || '']);
          } else {
            rows.push([n, f.name || '', src.name || '', f.loc || '', f.value || '', src.component || '提取', sec.title || '']);
          }
        });
      });
    });
    return { name: '来源溯源', headers: ['角标', '字段', '文件名', '页或单元格', '原文值／公式', '识别方式', '分组'], rows: rows };
  }
  function _poToItem(f, srcIdx) {
    return { label: f.name, value: f.value, loc: f.loc, note: f.note, derived: f.derived, long: f.long, srcIdx: srcIdx, uncertain: !!f.uncertain };
  }
  function _poFieldRows(items, sources, saved) {
    return items.map(function (it) {
      if (it.conflict) {
        var chosen = saved['conflict:' + it.label] != null ? saved['conflict:' + it.label] : '';
        return [it.label, chosen, it.conflict.map(function (c) { return c.from + '：' + c.value; }).join(' ／ '), '冲突字段·已采用最终值'];
      }
      var key = it.srcIdx + ':' + it.label;
      var val = saved[key] != null ? saved[key] : (it.value || '');
      var src = it.derived
        ? ('派生 · ' + it.derived)
        : (it.srcIdx != null ? (sources[it.srcIdx].name + (it.loc ? ' · ' + it.loc : '')) : '');
      var note = it.derived ? (it.note || '系统按公式计算') : (it.note || (it.ext ? '外部接口补全' : ''));
      return [it.label, val, src, note];
    });
  }
  function _poFinanceSheets(fin) {
    var out = [];
    ['bs', 'is', 'cf', 'aux'].forEach(function (k) {
      var s = fin.statements[k];
      var headers = ['标准科目', '原始科目'].concat(s.cols.map(function (c) { return c.label; }));
      var rows = s.rows.map(function (r) {
        var base = [r.name, r.raw || ''];
        if (r.type === 'section') return base.concat(s.cols.map(function () { return ''; }));
        return base.concat(r.vals.map(function (v) { return v === '' ? '—' : v; }));
      });
      out.push({ name: '财务_' + s.label, headers: headers, rows: rows });
    });
    return out;
  }
  function poBuildFundPayload(conf, st) {
    var sources = _structuredMockSources();
    var saved = STRUCTURED_VALUES.fp3 = STRUCTURED_VALUES.fp3 || {};
    var tabs = [];

    /* 概览（基金层） */
    var src0 = sources[0];
    tabs.push({ name: '概览', headers: ['字段', '值', '来源', '备注'],
      rows: _poFieldRows(src0.sections[0].rows.map(function (f) { return _poToItem(f, 0); }), sources, saved) });

    /* 底层项目：一行一项目全字段（与确认页单表同源） */
    var underRows = _fundUnderlyingRows();
    tabs.push({ name: '底层项目', headers: ['项目简称', '工商全称', '行业', '首次投资', '子基金对本金', '基金合计投资', '轮次', '领投', '负责人', '投后估值', '持股', '剩余成本', '已实现', '未实现', '公允价值', 'MOIC', '公允变动', '状态', '退出时间', '退出方式', '退出金额', '后续轮', '拟IPO', '收入', '净利润', '档案'],
      rows: underRows.map(function (r) { return [r.name, r.legalName, r.industry, r.firstInvestDate, r.amount, r.amountTotal, r.round, r.lead, r.owner, r.postVal, r.share, r.costRemain, r.realized, r.unrealized, r.fv, r.moic, r.fvChange, r.status, r.exitDate, r.exitMethod, r.exitAmt, r.hasFollowOn, r.ipoExpect, r.revenue, r.netProfit, _rowArchiveOk(r) ? '已有档案' : '系统里没有']; }) });

    /* 出资与回款（资本账户滚动 + T8 + 分配；TVPI/DPI 只在期间表现） */
    var _caHide = ['本机构实缴金额', '本期分配金额', 'TVPI（本机构自算）', 'DPI（本机构自算）'];
    function _caRowByName(name) {
      var rows = sources[1].sections[0].rows;
      for (var i = 0; i < rows.length; i++) if (rows[i].name === name) return rows[i];
      return { loc: '', value: '' };
    }
    var caRows = [
      { name: '期初权益余额（2025末）', val: '7,894.60', loc: 'F22（上期）' },
      { name: '本期实缴', val: '0.00', loc: 'F18' },
      { name: '本期综合收益', val: '580.00', loc: 'F22' },
      { name: '本期分配', val: '-80.00', loc: 'F30' },
      { name: '期末权益余额', val: '8,394.60', loc: 'F22', note: '期末＝期初＋实缴＋收益－分配' }
    ];
    var caMatrixRows = caRows.map(function (r, ri) {
      var v = saved['ca:' + ri] != null ? saved['ca:' + ri] : r.val;
      return [r.name, v, r.loc || '', r.note || ''];
    });
    var src1 = sources[1];
    var caItems = src1.sections[0].rows.filter(function (f) { return _caHide.indexOf(f.name) < 0; }).map(function (f) { return _poToItem(f, 1); });
    var srcHist = sources[3];
    var histItems = [
      _poToItem(srcHist.sections[0].rows[0], 3),
      _poToItem(srcHist.sections[0].rows[3], 3),
      _poToItem(srcHist.sections[0].rows[5], 3)
    ];
    var src2 = sources[2];
    tabs.push({ name: '出资与回款', headers: ['项目', '值', '来源', '备注'],
      rows: caMatrixRows.concat(_poFieldRows(caItems, sources, saved)).concat(_poFieldRows(histItems, sources, saved)).concat(_poFieldRows(src2.sections[0].rows.map(function (f) { return _poToItem(f, 2); }), sources, saved)) });

    /* 期间表现（含 TVPI/DPI 冲突） */
    function _fundRow(name) {
      var rows = sources[0].sections[0].rows;
      for (var i = 0; i < rows.length; i++) if (rows[i].name === name) return _poToItem(rows[i], 0);
      return { label: name, value: '—', srcIdx: 0 };
    }
    var _tvpiSelf = _caRowByName('TVPI（本机构自算）');
    var _dpiSelf = _caRowByName('DPI（本机构自算）');
    var perfNormal = [
      _fundRow('已投项目数'),
      _fundRow('投资金额（本基金主体）'),
      _fundRow('投资金额（基金合计）'),
      _fundRow('完全退出项目数量'),
      _fundRow('部分退出项目数量'),
      _fundRow('总退出金额（万元）'),
      _fundRow('MOIC（GP报告值）'),
      _fundRow('投资比例'),
      _fundRow('投资进度'),
      { label: 'TVPI（本机构自算）', value: _tvpiSelf.value || '1.76x', derived: _tvpiSelf.derived || '(8,394.60＋423.59)÷5,000', note: '（期末权益＋累计分配）÷实缴', srcIdx: 1 },
      { label: 'DPI（本机构自算）', value: _dpiSelf.value || '0.08x', derived: _dpiSelf.derived || '423.59÷5,000', note: '累计分配÷实缴', srcIdx: 1 }
    ];
    tabs.push({ name: '期间表现', headers: ['字段', '值', '来源', '备注'],
      rows: _poFieldRows(perfNormal, sources, saved) });

    /* 基金不含企业财务三表；资本账户已在上方导出 */

    /* 来源溯源 */
    tabs.push(_poTraceSheet(sources));

    /* 操作记录 */
    var opLog = (STRUCTURED_OP_LOG && STRUCTURED_OP_LOG.length) ? STRUCTURED_OP_LOG : [];
    var opRows = opLog.length ? opLog.map(function (e) { return [e.time, e.who, e.msg]; })
      : [['14:31:45', '王敏', '上传材料 · 归属：GGV人民币二期 / 2026Q1']];
    tabs.push({ name: '操作记录', headers: ['时间', '操作人', '摘要'], rows: opRows });

    return { projectName: conf.projectName, period: conf.period, tabs: tabs, submitted: !!st.submitted };
  }
  function poBuildDirectPayload(conf, fileId, bizFields, saved) {
    var tabs = [];
    var bizTabs = ['概览', '投资与股权', '经营情况', '财务数据'];
    function _def(t) {
      var m = {
        '基础信息': [{ label: '工商全称', value: '—' }, { label: '注册地', value: '—' }, { label: '成立日期', value: '—' }, { label: '法定代表人', value: '—' }, { label: '注册资本', value: '—' }],
        '投资信息': [{ label: '首次投资日期', value: '—' }, { label: '本轮投资金额', value: '—' }, { label: '累计投资金额', value: '—' }, { label: '投资轮次', value: '—' }, { label: '持股比例', value: '—' }],
        '期末持仓': [{ label: '期末持股比例', value: '—' }, { label: '持股公允价值', value: '—' }, { label: '剩余投资成本', value: '—' }, { label: '未实现增值', value: '—' }, { label: 'MOIC', value: '—' }, { label: '退出状态', value: '—' }],
        '业绩指标': [{ label: 'MOIC', value: '—' }, { label: 'IRR', value: '—' }, { label: '当前估值', value: '—' }, { label: '较上期变动', value: '—' }],
        '企业与条款': [{ label: '优先清算权', value: '—' }, { label: '反稀释条款', value: '—' }, { label: '随售权', value: '—' }, { label: '拖售权', value: '—' }, { label: '董事会席位', value: '—' }]
      };
      return m[t] || [];
    }
    bizTabs.forEach(function (t) {
      if (t === '财务数据') { _poFinanceSheets(_financeConfirmData()).forEach(function (s) { tabs.push(s); }); return; }
      var fields;
      if (t === '概览') fields = bizFields['概览'] || bizFields['基础信息'] || _def('基础信息');
      else if (t === '投资与股权') {
        fields = []
          .concat(bizFields['投资信息'] || _def('投资信息'))
          .concat(bizFields['期末持仓'] || _def('期末持仓'))
          .concat(bizFields['业绩指标'] || _def('业绩指标'))
          .concat(bizFields['企业与条款'] || _def('企业与条款'));
      } else fields = bizFields[t] || _def(t);
      var rows = fields.map(function (f) {
        var key = fileId + ':' + f.label;
        var val = saved[key] != null ? saved[key] : (f.value || '—');
        return [f.label, val, '', ''];
      });
      tabs.push({ name: t, headers: ['字段', '值', '来源', '备注'], rows: rows });
    });
    tabs.push(_poTraceSheet(_directMockSources()));
    var opLog = (STRUCTURED_OP_LOG && STRUCTURED_OP_LOG.length) ? STRUCTURED_OP_LOG : [];
    var opRows = opLog.length ? opLog.map(function (e) { return [e.time, e.who, e.msg]; }) : [['—', '—', '（暂无操作记录）']];
    tabs.push({ name: '操作记录', headers: ['时间', '操作人', '摘要'], rows: opRows });
    return { projectName: conf.projectName, period: conf.period, tabs: tabs, submitted: false };
  }
  function poDownloadXlsx(payload) {
    if (!payload || !payload.tabs || !payload.tabs.length) { toast('暂无可导出的解析内容'); return; }
    var d = new Date();
    var dateStr = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    var base = (payload.projectName || '项目') + '_' + (payload.period || '') + '_文件解析结果_' + dateStr;
    var safe = base.replace(/[\\/:*?"<>|]/g, '_');
    var usedXlsx = false;
    if (window.XLSX && window.XLSX.utils && window.XLSX.utils.aoa_to_sheet) {
      try {
        var wb = window.XLSX.utils.book_new();
        var overview = [
          ['文件解析结果导出'],
          ['项目名称', payload.projectName || ''],
          ['期间', payload.period || ''],
          ['导出时间', d.toLocaleString('zh-CN')],
          ['状态', payload.submitted ? '已写入' : '解析中 / 待确认'],
          ['Sheet 数', (payload.tabs.length + 1)]
        ];
        window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(overview), '概览');
        payload.tabs.forEach(function (t) {
          var name = (t.name || 'Sheet').slice(0, 31);
          var aoa = [(t.headers || [])].concat(t.rows || []);
          window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(aoa), name);
        });
        window.XLSX.writeFile(wb, safe + '.xlsx');
        usedXlsx = true;
        toast('已导出 Excel：' + safe + '.xlsx');
      } catch (err) { usedXlsx = false; }
    }
    if (!usedXlsx) {
      /* 离线兜底：生成多 Sheet 的 HTML 表格并保存为 .xls（Excel 可直接打开） */
      var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>';
      html += '<table><tr><td colspan="2"><b>文件解析结果导出</b></td></tr>'
        + '<tr><td>项目名称</td><td>' + esc(payload.projectName || '') + '</td></tr>'
        + '<tr><td>期间</td><td>' + esc(payload.period || '') + '</td></tr>'
        + '<tr><td>导出时间</td><td>' + d.toLocaleString('zh-CN') + '</td></tr></table>';
      payload.tabs.forEach(function (t) {
        html += '<table><thead><tr><th colspan="' + (t.headers ? t.headers.length : 1) + '">' + esc(t.name || '') + '</th></tr><tr>'
          + (t.headers || []).map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>'
          + (t.rows || []).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c == null ? '' : c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      });
      html += '</body></html>';
      var blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = safe + '.xls'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast('已导出（离线模式）：' + safe + '.xls');
    }
    var n = new Date();
    STRUCTURED_OP_LOG.push({ time: n.getHours() + ':' + String(n.getMinutes()).padStart(2, '0') + ':' + String(n.getSeconds()).padStart(2, '0'), who: '王敏', msg: '导出 Excel · ' + (payload.tabs.length) + ' 个 Sheet' });
  }

  function _fmtWanNum(n) {
    if (n == null || !isFinite(n)) return '—';
    return Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  }
  function _sumAdoptNorm(v) {
    return String(v == null ? '' : v)
      .replace(/,/g, '')
      .replace(/\s*万(元)?\s*$/i, '')
      .replace(/[^\d.\-]/g, '')
      .trim();
  }
  function _sumAdoptEquals(a, b) {
    var na = _sumAdoptNorm(a);
    var nb = _sumAdoptNorm(b);
    if (na === '' && nb === '') return true;
    if (na === '' || nb === '') return false;
    var fa = Number(na), fb = Number(nb);
    if (isFinite(fa) && isFinite(fb)) return Math.abs(fa - fb) < 0.005;
    return na === nb;
  }
  var SUM_ADOPT_WRITE_LABEL = {
    invest: '投资金额',
    fv: '公允价值合计',
    dist: '分配金额'
  };
  var SUM_ADOPT_MIRROR = {
    invest: ['0:投资金额（本基金主体）', '0:投资成本（投资本金）'],
    fv: ['0:总投资金额'],
    dist: ['2:分配金额（总额）']
  };
  /* 底层合计：系统 SUM vs 材料解析披露（不含项目数，已投数只作字段摘取） */
  function _holdingSumChecks(allUnder, saved) {
    allUnder = allUnder || [];
    saved = saved || {};
    var sumFv = 0, sumAmt = 0;
    allUnder.forEach(function (r) {
      var fv = Number(String(_underSavedVal(saved, r.name, 'fv', r.fv)).replace(/,/g, ''));
      var amt = Number(String(_underSavedVal(saved, r.name, 'amount', r.amount)).replace(/,/g, ''));
      if (isFinite(fv)) sumFv += fv;
      if (isFinite(amt)) sumAmt += amt;
    });
    var snap = _ggvFundSnap() || {};
    var parseInvestWan = Number(snap.investAmtSelfYi != null ? snap.investAmtSelfYi : 13.36) * 10000;
    /* 材料披露：∑公允 vs 期末 NAV／持仓合计行。Demo 用 已投本金×基金 MOIC 作解析侧 NAV 口径 */
    var parseFvWan = Math.round(parseInvestWan * Number(snap.moic != null ? snap.moic : 2.365) * 100) / 100;
    var invDiff = Math.round((sumAmt - parseInvestWan) * 100) / 100;
    var fvDiff = Math.round((sumFv - parseFvWan) * 100) / 100;
    var rows = [
      {
        id: 'invest',
        label: '∑投资本金',
        writeLabel: '投资金额',
        sysRaw: String(Math.round(sumAmt * 100) / 100),
        parseRaw: String(Math.round(parseInvestWan * 100) / 100),
        sys: _fmtWanNum(sumAmt) + ' 万',
        parse: _fmtWanNum(parseInvestWan) + ' 万',
        fail: Math.abs(invDiff) >= 0.01,
        diff: Math.abs(invDiff) < 0.01 ? null : (_fmtWanNum(invDiff) + ' 万')
      },
      {
        id: 'fv',
        label: '∑公允／NAV',
        writeLabel: '公允价值合计',
        sysRaw: String(Math.round(sumFv * 100) / 100),
        parseRaw: String(Math.round(parseFvWan * 100) / 100),
        sys: _fmtWanNum(sumFv) + ' 万',
        parse: _fmtWanNum(parseFvWan) + ' 万',
        fail: Math.abs(fvDiff) >= 0.01,
        diff: Math.abs(fvDiff) < 0.01 ? null : (_fmtWanNum(fvDiff) + ' 万')
      }
    ];
    var pending = rows.some(function (r) {
      if (!r.fail) return false;
      var k = 'sumAdopt:' + r.id;
      return saved[k] == null || saved[k] === '';
    });
    return { rows: rows, fail: pending, sumFv: sumFv, sumAmt: sumAmt };
  }
  function _isEmptyFieldVal(v) {
    if (v == null) return true;
    var s = String(v).trim();
    return !s || s === '—' || s === '-' || s === '—';
  }
  function _underArchActionsHtml(r, compact) {
    if (_rowArchiveOk(r)) {
      return compact ? '' : '<span class="po-tag po-entity-ok">已有档案</span>';
    }
    return '<div class="po-under-arch" onclick="event.stopPropagation()">'
      + (compact ? '' : '<span class="po-tag po-entity-warn">系统里没有</span>')
      + '<button type="button" class="po-btn po-btn-sm" data-act="searchParseEntity" data-arg="' + esc(r.entId) + '">选已有档案</button>'
      + '<button type="button" class="po-btn po-btn-sm po-btn-primary" data-act="createParseEntity" data-arg="' + esc(r.entId) + '">新建档案</button>'
      + '</div>';
  }
  /* 待处理卡共用：点选两侧后，下方「最终采用」可改（合计差／冲突同一形态） */
  function _pendingFinalAdoptHtml(key, numVal, unitLabel, aria) {
    return '<div class="po-pending-final">'
      + '<span class="po-conflict-hint">最终采用</span>'
      + '<input class="po-sum-vs-input" type="number" step="0.01" data-structured-value="' + esc(key) + '" value="' + esc(numVal == null ? '' : numVal) + '" aria-label="' + esc(aria || '最终采用') + '">'
      + (unitLabel ? '<i>' + esc(unitLabel) + '</i>' : '')
      + '</div>';
  }
  /* 合计差公式卡片（与冲突卡同形态：头栏 → 公式 → 两侧点选 → 最终采用） */
  function _sumCheckCardHtml(r, saved, no) {
    saved = saved || {};
    var adoptKey = 'sumAdopt:' + (r.id || r.label);
    var sysRaw = r.sysRaw != null ? r.sysRaw : r.sys;
    var parseRaw = r.parseRaw != null ? r.parseRaw : r.parse;
    var chosen = saved[adoptKey] != null ? saved[adoptKey] : '';
    var decided = chosen !== '';
    var writeNum = _sumAdoptNorm(chosen);
    var formula = r.id === 'fv'
      ? '∑行·公允价值 ＝ 解析·NAV／合计行'
      : (r.id === 'dist' ? '∑分项分配 ＝ 解析·本次分配总额' : '∑行·子基金对本金 ＝ 解析·已投总额');
    var sysOn = decided && _sumAdoptEquals(chosen, sysRaw);
    var parseOn = decided && _sumAdoptEquals(chosen, parseRaw);
    var writeLab = r.writeLabel || SUM_ADOPT_WRITE_LABEL[r.id] || r.label;
    return '<div class="po-tb-card warn po-pending-card">'
      + '<div class="po-tb-card-head"><span class="po-tb-no">' + no + '</span><strong>' + esc(r.label) + '</strong>'
      + '<span class="po-tb-kind">合计差</span>'
      + (decided ? '<span class="po-tb-ok">已选定</span>' : '') + '</div>'
      + '<div class="po-tb-formula">' + esc(formula) + '</div>'
      + '<div class="po-tb-calc po-pending-calc">'
      + '<button type="button" class="po-tb-side' + (sysOn ? ' on' : '') + '" data-act="adoptConflictValue" data-arg="' + esc(adoptKey + '|' + sysRaw + '|0') + '" title="采用系统">'
      + '<em>系统</em><strong>' + esc(r.sys) + '</strong></button>'
      + '<span class="po-tb-eq">＝</span>'
      + '<button type="button" class="po-tb-side' + (parseOn ? ' on' : '') + '" data-act="adoptConflictValue" data-arg="' + esc(adoptKey + '|' + parseRaw + '|0') + '" title="采用解析">'
      + '<em>解析</em><strong>' + esc(r.parse) + '</strong></button>'
      + (r.diff ? '<span class="po-tb-error">误差 ' + esc(r.diff) + '</span>' : '')
      + '</div>'
      + _pendingFinalAdoptHtml(adoptKey, writeNum, '万', '最终采用 · ' + writeLab)
      + '</div>';
  }
  function _entityPendingCardHtml(r, no) {
    return '<div class="po-tb-card warn po-pending-card">'
      + '<div class="po-tb-card-head"><span class="po-tb-no">' + no + '</span><strong>' + esc(r.name) + '</strong>'
      + '<span class="po-tb-kind">系统里没有</span>'
      + '<div class="po-pending-head-acts">'
      + '<button type="button" class="po-btn po-btn-sm" data-act="searchParseEntity" data-arg="' + esc(r.entId) + '">选已有档案</button>'
      + '<button type="button" class="po-btn po-btn-sm po-btn-primary" data-act="createParseEntity" data-arg="' + esc(r.entId) + '">新建档案</button>'
      + '</div></div>'
      + '<div class="po-tb-formula">材料里有这个名字，系统档案里还没有'
      + ' · <button type="button" class="po-linkish" data-act="focusUnderRow" data-arg="' + esc(r.name) + '">定位到行</button>'
      + '</div></div>';
  }
  /* 冲突卡片：与合计差同形态——点选一侧，下方最终采用可改 */
  function _conflictPendingCardHtml(item, saved, no) {
    saved = saved || {};
    var conflictKey = 'conflict:' + item.label;
    var chosenVal = saved[conflictKey] != null ? saved[conflictKey] : '';
    var decided = chosenVal !== '';
    var sides = (item.conflict || []).map(function (cv, i) {
      var on = decided && _sumAdoptEquals(chosenVal, cv.value);
      return '<button type="button" class="po-tb-side' + (on ? ' on' : '') + '" data-act="adoptConflictValue" data-arg="' + esc(conflictKey + '|' + cv.value + '|' + (cv.srcIdx != null ? cv.srcIdx : 0)) + '" title="采用此值">'
        + '<em>' + esc(cv.from) + '</em><strong>' + esc(_confirmFmtDisplay(item.label, cv.value)) + '</strong></button>'
        + (i < item.conflict.length - 1 ? '<span class="po-tb-eq">vs</span>' : '');
    }).join('');
    var kind = _confirmDetectKind(item.label, chosenVal || ((item.conflict && item.conflict[0]) ? item.conflict[0].value : ''));
    var finalNum = '';
    var finalUnit = '';
    if (decided) {
      if (kind === 'multiple') {
        finalNum = String(chosenVal).replace(/x$/i, '').replace(/,/g, '').trim();
        finalUnit = 'x';
      } else if (kind === 'percent') {
        finalNum = String(chosenVal).replace(/%/g, '').replace(/,/g, '').trim();
        finalUnit = '%';
      } else if (kind === 'money') {
        finalNum = _sumAdoptNorm(chosenVal);
        finalUnit = '万';
      } else {
        finalNum = String(chosenVal).replace(/,/g, '').trim();
      }
      if (finalNum !== '' && isNaN(Number(finalNum))) finalNum = '';
    }
    return '<div class="po-tb-card warn po-pending-card">'
      + '<div class="po-tb-card-head"><span class="po-tb-no">' + no + '</span><strong>' + esc(item.label) + '</strong>'
      + '<span class="po-tb-kind">冲突</span>'
      + (decided ? '<span class="po-tb-ok">已选定</span>' : '') + '</div>'
      + '<div class="po-tb-formula">' + esc(item.label) + ' 多来源</div>'
      + '<div class="po-tb-calc po-pending-calc">' + sides + '</div>'
      + _pendingFinalAdoptHtml(conflictKey, finalNum, finalUnit, '最终采用 · ' + item.label)
      + '</div>';
  }
  /* 待处理：按钮进右上角粘性栏；面板只出卡片体。未决计入角标；已选定仍留在面板以显示选中态 */
  function _pendingToggleBtnHtml(n, hasResolved) {
    if (!n && !hasResolved) return '';
    var open = UNDER_PENDING_OPEN !== false;
    if (!n && hasResolved) {
      return '<button type="button" class="po-fin-trial-btn pass po-sticky-pending' + (open ? ' active' : '') + '" data-act="toggleUnderPending" title="展开／收起已处理">'
        + '已处理 ' + (open ? '▲' : '▼') + '</button>';
    }
    return '<button type="button" class="po-fin-trial-btn fail po-sticky-pending' + (open ? ' active' : '') + '" data-act="toggleUnderPending" title="展开／收起待处理">'
      + '<b>' + n + '</b> 待处理 ' + (open ? '▲' : '▼') + '</button>';
  }
  function _pendingPanelBodyHtml(cardsHtml, n, kindLabel, hasResolved) {
    if ((!n && !hasResolved) || UNDER_PENDING_OPEN === false) return '';
    var head = n
      ? ('<strong>待处理 ' + n + ' 项</strong>' + (kindLabel ? '<span>' + esc(kindLabel) + '</span>' : ''))
      : ('<strong>已处理</strong>' + (kindLabel ? '<span>' + esc(kindLabel) + '</span>' : ''));
    return '<div class="po-under-pending">'
      + '<div class="po-fin-trial-panel po-under-pending-panel">'
      + '<div class="po-fin-trial-summary ' + (n ? 'po-tb-sum-fail' : 'po-tb-sum-pass') + '">' + head
      + '</div>' + cardsHtml + '</div></div>';
  }
  function _underPendingParts(allUnder, saved, sumChk) {
    allUnder = allUnder || [];
    saved = saved || {};
    sumChk = sumChk || _holdingSumChecks(allUnder, saved);
    var allSumFails = (sumChk.rows || []).filter(function (r) { return !!r.fail; });
    var sumUndecided = allSumFails.filter(function (r) {
      var k = 'sumAdopt:' + r.id;
      return saved[k] == null || saved[k] === '';
    });
    var ents = allUnder.filter(_rowNeedsAction);
    var n = sumUndecided.length + ents.length;
    var hasResolved = allSumFails.length > sumUndecided.length;
    var kinds = [];
    if (allSumFails.length) kinds.push('合计差');
    if (ents.length) kinds.push('系统里没有');
    var cards = '';
    var no = 0;
    allSumFails.forEach(function (r) {
      no += 1;
      cards += _sumCheckCardHtml(r, saved, no);
    });
    ents.forEach(function (r) {
      no += 1;
      cards += _entityPendingCardHtml(r, no);
    });
    return {
      n: n,
      hasResolved: hasResolved,
      kindLabel: kinds.join(' · '),
      btn: _pendingToggleBtnHtml(n, hasResolved || (!!cards && n === 0)),
      panel: _pendingPanelBodyHtml(cards, n, kinds.join(' · '), hasResolved || (!!cards && n === 0))
    };
  }
  function _tabPendingParts(cardsHtml, n, kindLabel, hasResolved) {
    hasResolved = !!hasResolved;
    return {
      n: n || 0,
      hasResolved: hasResolved,
      kindLabel: kindLabel || '',
      btn: _pendingToggleBtnHtml(n, hasResolved),
      panel: _pendingPanelBodyHtml(cardsHtml, n, kindLabel, hasResolved)
    };
  }
  function _longNeedsClamp(text) {
    var t = String(text == null ? '' : text).trim();
    if (!t || t === '—' || t === '-') return false;
    return t.length > 36 || /[\n\r]/.test(t);
  }
  /* 长文：默认两行＋行尾「更多」；展开后点文字编辑；失焦保存 */
  function _longTextBodyHtml(key, text, uncertain) {
    var empty = _isEmptyFieldVal(text);
    var raw = empty ? '' : String(text);
    var expanded = !!UNDER_LONG_EXPAND[key];
    var editing = UNDER_LONG_EXPAND[key] === 'edit';
    var clamp = _longNeedsClamp(raw);
    var unc = uncertain ? ' is-uncertain' : '';
    if (editing) {
      return '<textarea class="po-result-input po-result-textarea po-long-edit' + unc + '" data-structured-value="' + esc(key) + '" data-long-key="' + esc(key) + '" rows="4" placeholder="输入内容">' + esc(raw) + '</textarea>';
    }
    if (!clamp || expanded) {
      return '<div class="po-long-full' + unc + (empty ? '' : ' po-long-editable') + '"'
        + (empty ? '' : (' data-act="toggleUnderLong" data-arg="' + esc(key + '|edit') + '" title="点击编辑"'))
        + '>' + esc(raw || '—') + '</div>'
        + (clamp && expanded
          ? '<button type="button" class="po-long-fold" data-act="toggleUnderLong" data-arg="' + esc(key + '|0') + '">收起</button>'
          : '');
    }
    return '<button type="button" class="po-long-clamp-btn' + unc + '" data-act="toggleUnderLong" data-arg="' + esc(key + '|1') + '" title="展开全文">'
      + '<span class="po-long-clamp">' + esc(raw) + '</span>'
      + '<span class="po-long-fade" aria-hidden="true"></span>'
      + '<span class="po-long-more">更多</span>'
      + '</button>';
  }
  function _underLongFieldHtml(key, label, val) {
    var empty = _isEmptyFieldVal(val);
    if (empty && !UNDER_SHOW_EMPTY) return '';
    return '<div class="po-field-item po-field-long">'
      + '<div class="po-field-label">' + esc(label) + '</div>'
      + '<div class="po-long-wrap">' + _longTextBodyHtml(key, empty ? '' : val) + '</div></div>';
  }
  function _underShortFieldHtml(saved, name, label, field, def) {
    var val = _underSavedVal(saved, name, field, def);
    if (_isEmptyFieldVal(val) && !UNDER_SHOW_EMPTY) return '';
    return '<div class="po-field-item"><div class="po-field-label">' + esc(label) + '</div>'
      + '<div class="po-field-val-wrap">' + _underInput(saved, name, field, def) + '</div></div>';
  }
  function _underLatestFinDisplay(dr) {
    var periods = dr.financialPeriods || [];
    if (periods.length) {
      var latest = periods[periods.length - 1];
      return {
        revenue: latest.revenue == null ? '—' : _fmtWan(latest.revenue),
        netProfit: latest.netProfit == null ? '—' : _fmtWan(latest.netProfit)
      };
    }
    return { revenue: dr.revenue || '—', netProfit: dr.netProfit || '—' };
  }
  function _underFinPeriodsHtml(saved, dr) {
    var periods = dr.financialPeriods || [];
    if (!periods.length) return '';
    return periods.map(function (p) {
      var revField = 'fin:' + p.label + ':revenue';
      var npField = 'fin:' + p.label + ':netProfit';
      var revDef = p.revenue == null ? '—' : _fmtWan(p.revenue);
      var npDef = p.netProfit == null ? '—' : _fmtWan(p.netProfit);
      var body = _underShortFieldHtml(saved, dr.name, '营业收入', revField, revDef)
        + _underShortFieldHtml(saved, dr.name, '净利润', npField, npDef);
      if (!body && !UNDER_SHOW_EMPTY) return '';
      return '<div class="po-under-fin-period">'
        + '<div class="po-under-fin-period-label">' + esc(p.label) + '</div>'
        + '<div class="po-field-grid">' + body + '</div></div>';
    }).filter(Boolean).join('');
  }
  function _underSecCollapsed(secId, defaultOpen) {
    if (Object.prototype.hasOwnProperty.call(UNDER_SEC_COLLAPSE, secId)) return !!UNDER_SEC_COLLAPSE[secId];
    return !defaultOpen;
  }
  function _underSecHtml(secId, title, bodyHtml, defaultOpen) {
    if (!bodyHtml) return '';
    var collapsed = _underSecCollapsed(secId, defaultOpen);
    return '<div class="po-under-sec' + (collapsed ? ' is-collapsed' : '') + '">'
      + '<button type="button" class="po-under-sec-h" data-act="toggleUnderSec" data-arg="' + esc(secId + '|' + (defaultOpen ? '1' : '0')) + '">'
      + '<strong>' + esc(title) + '</strong><span>' + (collapsed ? '▼' : '▲') + '</span></button>'
      + (collapsed ? '' : '<div class="po-under-sec-body">' + bodyHtml + '</div>')
      + '</div>';
  }

  /* 确认页专注核对：收起整块左栏（文件 chip ＋ 预览），右栏占满 */
  function _confirmFocusToggleBtn(extraClass) {
    var on = !!CONFIRM_PREVIEW_COLLAPSED;
    var label = on ? '展开原文栏' : '收起原文栏，全宽核对';
    var icon = on
      ? '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.2 2.5v11" stroke="currentColor" stroke-width="1.3"/><path d="M9.2 5.5 11.8 8 9.2 10.5M11.6 8H7.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.2 2.5v11" stroke="currentColor" stroke-width="1.3"/><path d="M10.6 5.5 8 8l2.6 2.5M8.2 8h4.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<button type="button" class="po-preview-toggle' + (on ? ' is-collapsed' : '') + (extraClass ? ' ' + extraClass : '') + '" data-act="toggleConfirmPreview" title="' + label + '" aria-label="' + label + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + icon + '</button>';
  }
  function _confirmBizStickyHtml(tabBarHtml, pendingBtnHtml) {
    /* 右上角：待处理（有则显）＋金额单位＋收起原文 */
    return '<div class="po-biz-sticky"><div class="po-biz-sticky-row">'
      + tabBarHtml
      + '<div class="po-biz-sticky-right">'
      + (pendingBtnHtml || '')
      + _confirmMoneyUnitBarHtml()
      + _confirmFocusToggleBtn()
      + '</div></div></div>';
  }
  /* 页级一条：浅底色＝识别不确定；有未改不确定字段才显示 */
  function _uncertainInfoHtml(show) {
    if (!show) return '';
    return '<div class="po-uncertain-info" role="note">'
      + '<span class="po-uncertain-swatch" aria-hidden="true"></span>'
      + '<span>浅底色输入框表示识别不确定，请优先核查。</span>'
      + '</div>';
  }
  function _syncUncertainInfo(root) {
    if (!root) return;
    var info = root.querySelector('.po-uncertain-info');
    if (!info) return;
    if (!root.querySelector('.is-uncertain')) info.style.display = 'none';
  }
  function _confirmSourceStripHtml(sources, sourceIdx) {
    return '<div class="po-source-strip"><div class="po-source-strip-scroll">' + sources.map(function(src, i) {
      return '<button class="po-source-chip' + (i === sourceIdx ? ' active' : '') + '" data-act="switchProjectSource" data-arg="' + i + '" title="' + esc(src.name) + ' · ' + esc(src.type) + '"><span>' + (i + 1) + '</span><strong>' + esc(src.short) + '</strong></button>';
    }).join('') + '</div>'
      + '<button class="po-btn po-btn-sm" data-act="appendProjectFile">＋ 补充文件</button></div>';
  }

  function pageStructuredProjectConfirm(conf, st) {
    CURRENT_CONFIRM = 'fp3';
    var sources = _structuredMockSources();
    var sourceIdx = CONFIRM_SOURCE_STATE.fp3 != null ? CONFIRM_SOURCE_STATE.fp3 : 0;
    if (sourceIdx >= sources.length) sourceIdx = 0;
    var source = sources[sourceIdx];
    var saved = STRUCTURED_VALUES.fp3 = STRUCTURED_VALUES.fp3 || {};
    var bizTab = _remapConfirmTab(FUND_CONFIRM_TAB_MAP, STRUCTURED_BIZ_TAB.fp3 || '概览');
    STRUCTURED_BIZ_TAB.fp3 = bizTab;
    var activeRow = STRUCTURED_ACTIVE_FIELD.fp3 == null ? 0 : STRUCTURED_ACTIVE_FIELD.fp3;

    /* ── 顶部工具栏 ── */
    var unmatchedN = _unmatchedParseEntities().length;
    var submitBtn = st.submitted
      ? '<span class="po-btn po-btn-sm po-btn-submitted">已写入 ✓</span>'
      : (unmatchedN
        ? '<button class="po-btn po-btn-sm po-btn-primary po-btn-disabled" data-act="submitConfirmBlocked" title="还有项目未挂到档案">确认写入</button>'
        : '<button class="po-btn po-btn-sm po-btn-primary" data-act="submitConfirm">确认写入</button>');
    var top = '<div class="po-toolbar"><button class="po-btn po-btn-sm po-confirm-back-btn" data-nav="file-parse">← 返回</button><h2>' + esc(conf.projectName) + '</h2><div class="po-toolbar-spacer"></div>'
      + '<button class="po-btn po-btn-sm' + (STRUCTURED_LOG_OPEN ? ' active' : '') + '" data-act="toggleOpLog">操作记录</button>'
      + '<button class="po-btn po-btn-sm" data-act="exportConfirmXlsx">导出 Excel</button>'
      + '<button class="po-btn po-btn-sm" data-act="saveStructuredDraft">暂存</button>'
      + submitBtn + '</div>';

    /* ── 左栏：文件条（与预览同级）＋ 原文预览 ── */
    var strip = _confirmSourceStripHtml(sources, sourceIdx);

    /* ── 左侧预览区（基金：始终预览材料原文，不切企业三表） ── */
    var previewContent = '<div class="po-doc-page po-source-preview"><div class="po-doc-h">原文预览<span class="po-doc-sub">' + esc(source.name) + '</span></div><div class="po-source-kind">自动匹配：' + esc(source.component) + '</div><div class="po-doc-table-wrap"><table class="po-doc-table"><thead><tr>'
      + source.previewHeaders.map(function(h){return '<td>' + esc(h) + '</td>';}).join('') + '</tr></thead><tbody>'
      + source.previewRows.map(function(row, ri){return '<tr class="po-doc-row">' + row.map(function(cell, ci){return '<td class="' + (ci === row.length-1 ? 'po-doc-v po-doc-hi' + (ri === activeRow ? ' active' : '') : 'po-doc-k') + '">' + esc(cell) + '</td>';}).join('') + '</tr>';}).join('')
      + '</tbody></table></div></div>';
    var leftPanel = CONFIRM_PREVIEW_COLLAPSED
      ? ''
      : '<div class="po-confirm-left">' + strip + '<div class="po-confirm-left-preview">' + previewContent + '</div></div>';

    /* ── 角标序号分配 ── */
    var badgeMap = {};
    var badgeSeq = 0;
    function getBadge(srcIdx, loc) {
      var k = srcIdx + '|' + loc;
      if (badgeMap[k] == null) badgeMap[k] = ++badgeSeq;
      return badgeMap[k];
    }

    /* ── 字段网格渲染助手 ── */
    function fieldGrid(items) {
      if (!items || !items.length) return '<div class="po-field-grid-empty">暂无识别内容</div>';
      return '<div class="po-field-grid">' + items.map(function(item) {
        if (item.conflict) {
          var conflictKey = 'conflict:' + item.label;
          var chosenVal = saved[conflictKey] != null ? saved[conflictKey] : '';
          var conflictRows = item.conflict.map(function(cv) {
            var badgeHtml;
            if (cv.derived) {
              badgeHtml = '<span class="po-derived-tag" title="系统按公式计算，不定位原文格">派生</span>';
            } else {
              var badge = getBadge(cv.srcIdx, cv.loc);
              var badgeTitle = sources[cv.srcIdx].name + ' · ' + cv.loc;
              badgeHtml = '<sup class="po-src-badge" title="' + esc(badgeTitle) + '" data-act="locateStructuredSource" data-arg="' + cv.srcIdx + '|0">' + badge + '</sup>';
            }
            var adopted = chosenVal === cv.value;
            return '<div class="po-conflict-row' + (adopted ? ' adopted' : '') + '">'
              + badgeHtml
              + '<span class="po-conflict-label">' + esc(cv.from) + '</span>'
              + '<button type="button" class="po-conflict-val' + (adopted ? ' on' : '') + '" data-act="adoptConflictValue" data-arg="' + esc(conflictKey + '|' + cv.value + '|' + cv.srcIdx) + '" title="采用此值">' + esc(_confirmFmtDisplay(item.label, cv.value)) + '</button>'
              + '</div>';
          }).join('');
          return '<div class="po-field-item po-field-conflict' + (item.long ? ' po-field-long' : '') + '">'
            + '<div class="po-field-label">' + esc(_confirmStripLabelUnit(item.label)) + ' <span class="po-conflict-badge">冲突</span></div>'
            + '<div class="po-conflict-sources">' + conflictRows + '</div>'
            + '<div class="po-field-input-wrap"><span class="po-conflict-hint">最终采用：</span>' + _confirmFieldInput(conflictKey, item.label, chosenVal, { uncertain: !!item.uncertain && !(saved[conflictKey] != null) }) + '</div>'
            + '</div>';
        }
        var key = item.srcIdx + ':' + item.label;
        var val = saved[key] != null ? saved[key] : (item.value || '');
        var isDerived = !!item.derived;
        var badgeHtml = '';
        if (isDerived) {
          badgeHtml = '<span class="po-derived-tag" title="系统按公式计算；溯源看公式与输入字段，不定位原文格">派生</span>';
        } else if (item.srcIdx != null) {
          var badge = getBadge(item.srcIdx, item.loc || '');
          var badgeTitle = sources[item.srcIdx].name + ' · ' + (item.loc || '');
          badgeHtml = badge > 0 ? '<sup class="po-src-badge" title="' + esc(badgeTitle) + '" data-act="locateStructuredSource" data-arg="' + item.srcIdx + '|0">' + badge + '</sup>' : '';
        }
        if (item.ext) badgeHtml += '<span class="po-ext-tag" title="工商信息由外部数据接口补全">外部接口</span>';
        var derivedHtml = isDerived ? '<small class="po-result-rule" title="计算公式与代入值">= ' + esc(item.derived) + (item.note ? ' · ' + esc(item.note) : '') + '</small>' : '';
        var noteHtml = (!isDerived && item.note) ? '<small class="po-result-note">' + esc(item.note) + '</small>' : '';
        var labelShow = _confirmStripLabelUnit(item.label);
        var showUncertain = !!item.uncertain && saved[key] == null;
        if (item.long) {
          var longKey = key;
          var longText = val == null ? '' : String(val);
          return '<div class="po-field-item po-field-long">'
            + '<div class="po-field-label">' + esc(labelShow) + badgeHtml + '</div>'
            + '<div class="po-long-wrap">' + _longTextBodyHtml(longKey, longText, showUncertain) + '</div>'
            + derivedHtml + noteHtml + '</div>';
        }
        return '<div class="po-field-item">'
          + '<div class="po-field-label">' + esc(labelShow) + badgeHtml + '</div>'
          + '<div class="po-field-val-wrap">' + _confirmFieldInput(key, item.label, val, { uncertain: showUncertain }) + derivedHtml + noteHtml + '</div>'
          + '</div>';
      }).join('') + '</div>';
    }

    function srcFieldToItem(fld, srcIdx) {
      return { label: fld.name, value: fld.value, loc: fld.loc, note: fld.note, derived: fld.derived, long: fld.long, srcIdx: srcIdx, uncertain: !!fld.uncertain };
    }

    /* ── 业务 Tab：只在有待处理时打实心点（无淡点装饰）── */
    var periodConflictPending = false;
    (function () {
      var fundRows = (sources[0] && sources[0].sections && sources[0].sections[0] && sources[0].sections[0].rows) || [];
      var hasGp = false;
      fundRows.forEach(function (r) {
        if ((r.name === 'TVPI（GP报告值）' || r.name === 'DPI（GP报告值）') && r.value && r.value !== '—') hasGp = true;
      });
      if (!hasGp) return;
      var need = [];
      fundRows.forEach(function (r) {
        if (r.name === 'TVPI（GP报告值）' && r.value && r.value !== '—') need.push('TVPI');
        if (r.name === 'DPI（GP报告值）' && r.value && r.value !== '—') need.push('DPI');
      });
      periodConflictPending = need.some(function (lab) { return saved['conflict:' + lab] == null || saved['conflict:' + lab] === ''; });
    })();
    var holdingSumFail = _holdingSumChecks(_fundUnderlyingRows(), saved).fail;
    /* 出资与回款：分配合计差（演示：系统分项加总 vs 解析总额） */
    var distTabWarn = (function () {
      var distSys = 800, distParse = 790;
      if (Math.abs(distSys - distParse) < 0.01) return false;
      return saved['sumAdopt:dist'] == null || saved['sumAdopt:dist'] === '';
    })();
    var bizTabs = ['概览', '底层项目', '出资与回款', '期间表现'];
    var tabBar = '<div class="po-biz-tabs">' + bizTabs.map(function(t) {
      var warn = '';
      if (t === '概览' && periodConflictPending) warn = ' po-biz-tab-warn';
      if (t === '底层项目' && (unmatchedN || holdingSumFail)) warn = ' po-biz-tab-warn';
      if (t === '出资与回款' && distTabWarn) warn = ' po-biz-tab-warn';
      return '<button class="po-biz-tab' + (t === bizTab ? ' active' : '') + warn + '" data-act="switchBizTab" data-arg="' + t + '" title="' + (warn ? '有待处理项' : '') + '">' + t + '</button>';
    }).join('') + '</div>';

    var stickyPendingBtn = '';
    var tabContent = '';
    if (bizTab === '概览') {
      var src0 = sources[0];
      var items = src0.sections[0].rows
        .filter(function(f){return !f.long;})
        .map(function(f){return srcFieldToItem(f, 0);});
      var longItems = src0.sections[0].rows
        .filter(function(f){return f.long;})
        .map(function(f){return srcFieldToItem(f, 0);});
      function findFundFieldOv(name) {
        var rows = sources[0].sections[0].rows;
        for (var i = 0; i < rows.length; i++) if (rows[i].name === name) return srcFieldToItem(rows[i], 0);
        return { label: name, value: '—', srcIdx: 0, loc: '' };
      }
      function findCaFieldOv(name) {
        var rows = sources[1].sections[0].rows;
        for (var i = 0; i < rows.length; i++) if (rows[i].name === name) return rows[i];
        return { value: '', loc: '' };
      }
      var tvpiSelfOv = findCaFieldOv('TVPI（本机构自算）');
      var dpiSelfOv = findCaFieldOv('DPI（本机构自算）');
      var gpTvpiOv = findFundFieldOv('TVPI（GP报告值）');
      var gpDpiOv = findFundFieldOv('DPI（GP报告值）');
      var gpMoicOv = findFundFieldOv('MOIC（GP报告值）');
      var lpBlock = [
        { label: '本机构认缴金额', value: '5,000 万元', loc: '子基金列表!W8', srcIdx: 1 },
        { label: '本机构实缴金额', value: '5,000 万元', loc: '子基金列表!Y8', srcIdx: 1 },
        { label: '资本账户期末余额', value: '8,394.60 万元', loc: '子基金列表!AA8', srcIdx: 1 },
        { label: '累计分配金额', value: '423.59 万元', loc: '子基金列表!AB8', srcIdx: 1 },
        { label: '本机构 TVPI', value: tvpiSelfOv.value || '1.76x', derived: tvpiSelfOv.derived || '(8,394.60＋423.59)÷5,000', note: '（期末权益＋累计分配）÷实缴', srcIdx: 1 },
        { label: '本机构 DPI', value: dpiSelfOv.value || '0.08x', derived: dpiSelfOv.derived || '423.59÷5,000', note: '累计分配÷实缴', srcIdx: 1 },
        gpMoicOv,
        gpTvpiOv,
        gpDpiOv
      ];
      var ovConflict = [];
      if (gpTvpiOv.value && gpTvpiOv.value !== '—') {
        ovConflict.push({ label:'TVPI', conflict:[
          { from:'GP报告', value: gpTvpiOv.value, loc: gpTvpiOv.loc || '', srcIdx:0 },
          { from:'本机构自算', value: tvpiSelfOv.value || '1.76x', derived: true, loc: '', srcIdx:1 }
        ]});
      }
      if (gpDpiOv.value && gpDpiOv.value !== '—') {
        ovConflict.push({ label:'DPI', conflict:[
          { from:'GP报告', value: gpDpiOv.value, loc: gpDpiOv.loc || '', srcIdx:0 },
          { from:'本机构自算', value: dpiSelfOv.value || '0.08x', derived: true, loc: '', srcIdx:1 }
        ]});
      }
      var ovConflictCards = '';
      var ovConflictPendingN = 0;
      var ovConflictResolvedN = 0;
      ovConflict.forEach(function (item, idx) {
        var ck = 'conflict:' + item.label;
        var undecided = saved[ck] == null || saved[ck] === '';
        if (undecided) ovConflictPendingN += 1;
        else ovConflictResolvedN += 1;
        ovConflictCards += _conflictPendingCardHtml(item, saved, idx + 1);
      });
      var ovConflictParts = _tabPendingParts(ovConflictCards, ovConflictPendingN, '冲突', ovConflictResolvedN > 0);
      stickyPendingBtn = ovConflictParts.btn;
      tabContent = ovConflictParts.panel
        + '<div class="po-biz-section"><h4>基金概况</h4>' + fieldGrid(items) + '</div>'
        + '<div class="po-biz-section"><h4>本机构出资口径</h4>' + fieldGrid(lpBlock) + '</div>'
        + (longItems.length ? '<div class="po-biz-section"><h4>文字摘要</h4>' + fieldGrid(longItems) + '</div>' : '');
    } else if (bizTab === '底层项目') {
      var allUnder = _fundUnderlyingRows();
      if (CURRENT_CONFIRM === 'fp3' && !UNDER_DRAWER) {
        for (var _fi = 0; _fi < allUnder.length; _fi++) {
          if ((allUnder[_fi].financialPeriods || []).length) {
            UNDER_DRAWER = allUnder[_fi].name;
            break;
          }
        }
      }
      var needN = allUnder.filter(_rowNeedsAction).length;
      var changedN = allUnder.filter(_rowHasChange).length;
      if (UNDER_FILTER === 'need') UNDER_FILTER = 'changed'; /* 旧「要处理」筛已取消，回落到本季有变动 */
      var underRows = _underFilterRows(allUnder, UNDER_FILTER);
      var sumCost = 0;
      allUnder.forEach(function (r) {
        var cost = Number(String(_underSavedVal(saved, r.name, 'costRemain', r.costRemain)).replace(/,/g, ''));
        if (isFinite(cost)) sumCost += cost;
      });
      var sumChk = _holdingSumChecks(allUnder, saved);
      var sumFv = sumChk.sumFv;
      var underPending = _underPendingParts(allUnder, saved, sumChk);
      stickyPendingBtn = underPending.btn;
      var filterBar = '<div class="po-under-toolbar">'
        + '<div class="po-under-filters">'
        + '<button type="button" class="po-under-chip' + (UNDER_FILTER === 'changed' ? ' on' : '') + '" data-act="setUnderFilter" data-arg="changed">本季有变动 · ' + changedN + '</button>'
        + '<button type="button" class="po-under-chip' + (UNDER_FILTER === 'all' ? ' on' : '') + '" data-act="setUnderFilter" data-arg="all">全部 · ' + allUnder.length + '</button>'
        + '</div>'
        + '<button type="button" class="po-btn po-btn-sm" data-act="underAddRow">＋ 加一行</button>'
        + '</div>';
      var emptyHint = '';
      if (!underRows.length) {
        emptyHint = '<div class="po-under-empty">没有「' + (UNDER_FILTER === 'changed' ? '本季有变动' : '全部') + '」的项目'
          + (UNDER_FILTER === 'changed' ? ' · <button type="button" class="po-linkish" data-act="setUnderFilter" data-arg="all">查看全部</button>' : '')
          + '</div>';
      }
      var tableHtml = '<div class="po-table-shell po-table-shell-under"><table class="po-table po-under-table"><thead><tr>'
        + '<th class="po-under-sticky">项目</th><th>首次投资</th><th>子基金对本金</th><th>持股</th><th>公允价值</th><th class="po-cell-num">收入</th><th class="po-cell-num">净利润</th><th>MOIC</th><th>状态</th>'
        + '</tr></thead><tbody>'
        + underRows.map(function (r) {
            var warn = _rowNeedsAction(r) ? ' po-row-warn' : '';
            var open = UNDER_DRAWER === r.name ? ' po-under-open' : '';
            var finDisp = _underLatestFinDisplay(r);
            return '<tr class="po-under-row' + warn + open + '" data-act="openUnderDrawer" data-arg="' + esc(r.name) + '">'
              + '<td class="po-under-sticky po-under-name"><strong>' + esc(r.name) + '</strong><small>' + esc(_underSavedVal(saved, r.name, 'industry', r.industry)) + '</small></td>'
              + '<td class="po-cell-num" onclick="event.stopPropagation()">' + _underInput(saved, r.name, 'firstInvestDate', r.firstInvestDate) + '</td>'
              + '<td class="po-cell-num" onclick="event.stopPropagation()">' + _underInput(saved, r.name, 'amount', r.amount) + '</td>'
              + '<td class="po-cell-num" onclick="event.stopPropagation()">' + _underInput(saved, r.name, 'share', r.share) + '</td>'
              + '<td class="po-cell-num" onclick="event.stopPropagation()">' + _underInput(saved, r.name, 'fv', r.fv) + '</td>'
              + '<td class="po-cell-num po-under-fin-preview">' + esc(finDisp.revenue) + '</td>'
              + '<td class="po-cell-num po-under-fin-preview">' + esc(finDisp.netProfit) + '</td>'
              + '<td class="po-cell-num" onclick="event.stopPropagation()">' + _underInput(saved, r.name, 'moic', r.moic) + '</td>'
              + '<td onclick="event.stopPropagation()">' + _underInput(saved, r.name, 'status', r.status) + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table></div>';
      var foot = '<div class="po-under-foot">'
        + '<span>已识别 <strong>' + allUnder.length + '</strong></span>'
        + '<span>待挂档 <strong class="' + (needN ? 'po-under-warn' : '') + '">' + needN + '</strong></span>'
        + '<span>∑公允 ' + sumFv.toLocaleString('zh-CN', { maximumFractionDigits: 2 }) + ' 万</span>'
        + '<span>∑剩余成本 ' + sumCost.toLocaleString('zh-CN', { maximumFractionDigits: 2 }) + ' 万</span>'
        + '</div>';
      var drawerHtml = '';
      if (UNDER_DRAWER) {
        var dr = null;
        for (var di = 0; di < allUnder.length; di++) if (allUnder[di].name === UNDER_DRAWER) { dr = allUnder[di]; break; }
        if (dr) {
          var hasExit = !_isEmptyFieldVal(dr.exitAmt) || !_isEmptyFieldVal(dr.exitDate) || (dr.status === '退出');
          var finPeriodsHtml = _underFinPeriodsHtml(saved, dr);
          var hasFin = !!finPeriodsHtml;
          var hasBiz = hasFin || !_isEmptyFieldVal(dr.revenue) || !_isEmptyFieldVal(dr.netProfit) || !_isEmptyFieldVal(dr.ipoExpect) || hasExit;
          var overviewShort = ''
            + _underShortFieldHtml(saved, dr.name, '工商全称', 'legalName', dr.legalName)
            + _underShortFieldHtml(saved, dr.name, '行业', 'industry', dr.industry)
            + _underShortFieldHtml(saved, dr.name, '首次投资', 'firstInvestDate', dr.firstInvestDate)
            + _underShortFieldHtml(saved, dr.name, '轮次', 'round', dr.round)
            + _underShortFieldHtml(saved, dr.name, '领投', 'lead', dr.lead)
            + _underShortFieldHtml(saved, dr.name, '负责人', 'owner', dr.owner);
          var overviewLong = _underLongFieldHtml('u:' + dr.name + ':mainBiz', '主营业务', _underSavedVal(saved, dr.name, 'mainBiz', dr.mainBiz));
          var overviewBody = (overviewShort ? '<div class="po-field-grid">' + overviewShort + '</div>' : '') + overviewLong;
          var holdSum = '<div class="po-under-hold-sum">'
            + '<span>本金 <b>' + esc(_fmtWanNum(Number(String(_underSavedVal(saved, dr.name, 'amount', dr.amount)).replace(/,/g, '')) || 0)) + '</b></span>'
            + '<span>公允 <b>' + esc(_fmtWanNum(Number(String(_underSavedVal(saved, dr.name, 'fv', dr.fv)).replace(/,/g, '')) || 0)) + '</b></span>'
            + '<span>MOIC <b>' + esc(String(_underSavedVal(saved, dr.name, 'moic', dr.moic) || '—')) + '</b></span>'
            + '<span>状态 <b>' + esc(String(_underSavedVal(saved, dr.name, 'status', dr.status) || '—')) + '</b></span>'
            + '</div>';
          var holdShort = ''
            + _underShortFieldHtml(saved, dr.name, '子基金对本金', 'amount', dr.amount)
            + _underShortFieldHtml(saved, dr.name, '基金合计投资', 'amountTotal', dr.amountTotal)
            + _underShortFieldHtml(saved, dr.name, '公司最新投后估值', 'postVal', dr.postVal)
            + _underShortFieldHtml(saved, dr.name, '持股比例', 'share', dr.share)
            + _underShortFieldHtml(saved, dr.name, '剩余成本', 'costRemain', dr.costRemain)
            + _underShortFieldHtml(saved, dr.name, '已实现', 'realized', dr.realized)
            + _underShortFieldHtml(saved, dr.name, '未实现', 'unrealized', dr.unrealized)
            + _underShortFieldHtml(saved, dr.name, '项目公允价值', 'fv', dr.fv)
            + _underShortFieldHtml(saved, dr.name, 'MOIC', 'moic', dr.moic)
            + _underShortFieldHtml(saved, dr.name, '公允价值变动', 'fvChange', dr.fvChange)
            + _underShortFieldHtml(saved, dr.name, '状态', 'status', dr.status);
          var holdBody = holdSum + (holdShort ? '<div class="po-field-grid">' + holdShort + '</div>' : '');
          var bizShort = ''
            + (hasFin ? '' : _underShortFieldHtml(saved, dr.name, '营业收入', 'revenue', dr.revenue))
            + (hasFin ? '' : _underShortFieldHtml(saved, dr.name, '净利润', 'netProfit', dr.netProfit))
            + _underShortFieldHtml(saved, dr.name, '拟IPO预期', 'ipoExpect', dr.ipoExpect)
            + _underShortFieldHtml(saved, dr.name, '退出时间', 'exitDate', dr.exitDate)
            + _underShortFieldHtml(saved, dr.name, '退出方式', 'exitMethod', dr.exitMethod)
            + _underShortFieldHtml(saved, dr.name, '退出金额', 'exitAmt', dr.exitAmt);
          var bizBody = bizShort ? '<div class="po-field-grid">' + bizShort + '</div>' : '';
          var rounds = dr.financingRounds || [];
          var roundsHtml = '';
          if (rounds.length) {
            roundsHtml = '<div class="po-under-rounds">'
              + '<div class="po-under-rounds-scroll"><table class="po-under-rounds-table"><thead><tr>'
              + '<th>轮次</th><th>时间</th><th>投资方</th><th>投资金额</th><th>投后估值（亿）</th><th>持股比例</th>'
              + '</tr></thead><tbody>'
              + rounds.map(function (rr, ri) {
                  var ownN = (rr.ownership === '' || rr.ownership == null || rr.ownership === '-')
                    ? null
                    : Number(rr.ownership);
                  var own = ownN == null || isNaN(ownN) ? '—'
                    : ((ownN > 0 && ownN <= 1 ? +(ownN * 100).toFixed(2) : ownN) + ' %');
                  var isLatest = ri === rounds.length - 1;
                  return '<tr' + (isLatest ? ' class="po-under-rounds-latest"' : '') + '>'
                    + '<td>' + esc(rr.round || '—') + (isLatest ? ' <span class="po-under-rounds-tag">最新</span>' : '') + '</td>'
                    + '<td>' + esc(rr.date || '—') + '</td>'
                    + '<td class="po-under-rounds-inv" title="' + esc(rr.investors || '') + '">' + esc(rr.investors || '—') + '</td>'
                    + '<td>' + esc(rr.amount || '—') + '</td><td>' + esc(rr.postValYi || '—') + '</td><td>' + esc(own) + '</td></tr>';
                }).join('')
              + '</tbody></table></div></div>';
          } else if (UNDER_SHOW_EMPTY) {
            roundsHtml = '<p class="po-under-rounds-empty">本季材料未识别到多轮融资史</p>';
          } else {
            roundsHtml = '';
          }
          /* 有史表＝表权威：一行摘要对齐表单位，禁止再并排复读四个快照字段（估值万 vs 亿、日期形态打架） */
          var finBody = '';
          if (rounds.length) {
            var lastR = rounds[rounds.length - 1];
            var lastOwnN = (lastR.ownership === '' || lastR.ownership == null || lastR.ownership === '-')
              ? null : Number(lastR.ownership);
            var lastOwn = lastOwnN == null || isNaN(lastOwnN) ? '—'
              : ((lastOwnN > 0 && lastOwnN <= 1 ? +(lastOwnN * 100).toFixed(2) : lastOwnN) + '%');
            var latestCap = '<p class="po-under-rounds-cap">最新一轮 <strong>' + esc(lastR.round || '—') + '</strong>'
              + ' · ' + esc(lastR.date || '—')
              + ' · 投后估值 ' + esc(lastR.postValYi || '—') + ' 亿'
              + ' · 持股 ' + esc(lastOwn) + '</p>';
            finBody = latestCap + roundsHtml;
          } else {
            var finHead = ''
              + _underShortFieldHtml(saved, dr.name, '是否有后续轮', 'hasFollowOn', dr.hasFollowOn)
              + _underShortFieldHtml(saved, dr.name, '最新一轮融资日期', 'latestRoundDate', dr.latestRoundDate)
              + _underShortFieldHtml(saved, dr.name, '最新一轮融资估值', 'latestRoundVal', dr.latestRoundVal)
              + _underShortFieldHtml(saved, dr.name, '融资后持股', 'postRoundShare', dr.postRoundShare);
            finBody = (finHead ? '<div class="po-field-grid">' + finHead + '</div>' : '') + roundsHtml;
          }
          var emptyToggle = '<button type="button" class="po-btn po-btn-sm' + (UNDER_SHOW_EMPTY ? ' active' : '') + '" data-act="toggleUnderEmpty">' + (UNDER_SHOW_EMPTY ? '隐藏空项' : '显示空项') + '</button>';
          drawerHtml = '<div class="po-under-drawer-mask" data-act="closeUnderDrawer" aria-hidden="true"></div>'
            + '<div class="po-under-drawer" role="dialog" aria-label="项目详情">'
            + '<div class="po-under-drawer-head"><div class="po-under-drawer-title"><strong>' + esc(dr.name) + '</strong>'
            + '<small>' + esc(_underSavedVal(saved, dr.name, 'industry', dr.industry) || '') + '</small></div>'
            + '<div class="po-under-drawer-acts">' + emptyToggle
            + '<button type="button" class="po-icon-btn" data-act="closeUnderDrawer" aria-label="关闭">×</button>'
            + '</div></div>'
            + (!_rowArchiveOk(dr) ? '<div class="po-under-drawer-arch">' + _underArchActionsHtml(dr, true) + '</div>' : '')
            + _underSecHtml('ov', '企业概况', overviewBody, true)
            + _underSecHtml('hold', '持仓信息', holdBody, true)
            + _underSecHtml('finData', '财务数据', finPeriodsHtml, hasFin)
            + _underSecHtml('biz', '经营与退出', bizBody, hasBiz)
            + _underSecHtml('fin', '后续轮融资史', finBody, !!finBody)
            + '</div>';
        }
      }
      tabContent = underPending.panel
        + '<div class="po-biz-section po-under-section">'
        + filterBar + emptyHint + tableHtml + foot + '</div>' + drawerHtml;
    } else if (bizTab === '出资与回款') {
      var src1 = sources[1];
      var srcHist = sources[3];
      var caRows = [
        {name:'期初权益余额（2025末）', val:'7,894.60', loc:'F22（上期）'},
        {name:'本期实缴', val:'0.00', loc:'F18'},
        {name:'本期综合收益', val:'580.00', loc:'F22'},
        {name:'本期分配', val:'-80.00', loc:'F30'},
        {name:'期末权益余额', val:'8,394.60', loc:'F22', total:true, note:'期末＝期初＋实缴＋收益－分配'}
      ];
      var caMatrix = '<div class="po-ca-matrix-wrap"><table class="po-ca-matrix"><thead><tr><th>资本账户项目</th><th>2026Q1（万元）</th></tr></thead><tbody>'
        + caRows.map(function(r, ri){
            var caVal = saved['ca:' + ri] != null ? saved['ca:' + ri] : r.val;
            var caBadge = getBadge(1, r.loc || ('ca:' + ri));
            var caBadgeTitle = sources[1].name + ' · ' + (r.loc || '');
            var caBadgeHtml = '<sup class="po-src-badge" title="' + esc(caBadgeTitle) + '" data-act="locateStructuredSource" data-arg="1|0">' + caBadge + '</sup>';
            return '<tr class="' + (r.total ? 'total' : '') + '"><td class="po-ca-name"><strong>' + esc(r.name) + '</strong>' + caBadgeHtml + (r.note ? '<small>' + esc(r.note) + '</small>' : '') + '</td>'
              + '<td><input class="po-fin-matrix-input" data-structured-value="ca:' + ri + '" value="' + esc(caVal) + '" aria-label="' + esc(r.name) + '" /></td></tr>';
          }).join('') + '</tbody></table></div>';
      var caCheck = '<div class="po-ca-check">'
        + '<div><span class="po-ca-check-pass">✓ 资本账户平衡</span>期末 8,394.60 ＝ 期初 7,894.60 ＋ 实缴 0.00 ＋ 收益 580.00 － 分配 80.00</div>'
        + '</div>';
      var caHide = ['本机构实缴金额','本期分配金额','TVPI（本机构自算）','DPI（本机构自算）'];
      var caItems = src1.sections[0].rows
        .filter(function(f){ return caHide.indexOf(f.name) < 0; })
        .map(function(f){return srcFieldToItem(f, 1);});
      var histItems = [
        { label:'基金内部编号', value:srcHist.sections[0].rows[0].value, loc:srcHist.sections[0].rows[0].loc, srcIdx:3 },
        { label:'内部实缴流水', value:srcHist.sections[0].rows[3].value, loc:srcHist.sections[0].rows[3].loc, srcIdx:3 },
        { label:'内部分配流水', value:srcHist.sections[0].rows[5].value, loc:srcHist.sections[0].rows[5].loc, srcIdx:3 }
      ];
      var src2 = sources[2];
      var distItems = src2.sections[0].rows.map(function(f){return srcFieldToItem(f, 2);});
      /* 分配合计：系统分项加总 vs 解析总额 */
      var distCost = 560, distGain = 240, distTotalParse = 790;
      var distSys = Math.round((distCost + distGain) * 100) / 100;
      var distDiff = Math.round((distSys - distTotalParse) * 100) / 100;
      var distFail = Math.abs(distDiff) >= 0.01;
      var distParts = { btn: '', panel: '' };
      if (distFail) {
        distParts = _underPendingParts([], saved, {
          rows: [{
            id: 'dist',
            label: '∑分配金额',
            writeLabel: '分配金额',
            sysRaw: String(distSys),
            parseRaw: String(distTotalParse),
            sys: _fmtWanNum(distSys) + ' 万',
            parse: _fmtWanNum(distTotalParse) + ' 万',
            fail: true,
            diff: _fmtWanNum(distDiff) + ' 万'
          }],
          fail: true
        });
      }
      stickyPendingBtn = distParts.btn;
      tabContent = distParts.panel
        + '<div class="po-biz-section"><h4>资本账户滚动（本机构 · 母基金口径）</h4>' + caMatrix + caCheck + '</div>'
        + '<div class="po-biz-section"><h4>本机构资本账户</h4>' + fieldGrid(caItems) + '</div>'
        + '<div class="po-biz-section"><h4>内部台账对照</h4>' + fieldGrid(histItems) + '</div>'
        + '<div class="po-biz-section"><h4>分配事件</h4>' + fieldGrid(distItems) + '</div>';
    } else if (bizTab === '期间表现') {
      function findFundField(name) {
        var rows = sources[0].sections[0].rows;
        for (var i = 0; i < rows.length; i++) if (rows[i].name === name) return srcFieldToItem(rows[i], 0);
        return { label: name, value: '—', srcIdx: 0, loc: '' };
      }
      var perfFund = [
        findFundField('已投项目数'),
        findFundField('投资金额（本基金主体）'),
        findFundField('投资金额（基金合计）'),
        findFundField('完全退出项目数量'),
        findFundField('部分退出项目数量'),
        findFundField('总退出金额（万元）'),
        findFundField('投资比例'),
        findFundField('投资进度')
      ];
      tabContent = '<div class="po-biz-section"><h4>当期表现</h4>' + fieldGrid(perfFund) + '</div>';
    }

    /* ── 操作记录抽屉 ── */
    var logDrawer = '';
    if (STRUCTURED_LOG_OPEN) {
      var logEntries = STRUCTURED_OP_LOG.length ? STRUCTURED_OP_LOG.slice().reverse() : [
        { time: '14:31:45', who: '王敏', msg: '上传材料 · 归属：GGV人民币二期 / 2026Q1' }
      ];
      logDrawer = '<div class="po-oplog-drawer"><div class="po-oplog-head"><strong>操作记录</strong><button class="po-icon-btn" data-act="toggleOpLog">×</button></div><div class="po-oplog-list">' + _opLogTableHtml(logEntries) + '</div></div>';
    }

    var rightPanel = '<div class="po-confirm-right">' + _confirmBizStickyHtml(tabBar, stickyPendingBtn)
      + _uncertainInfoHtml(tabContent.indexOf('is-uncertain') !== -1)
      + '<div class="po-biz-content">' + tabContent + '</div></div>';

    CURRENT_EXPORT_PAYLOAD = poBuildFundPayload(conf, st);

    return '<div class="po-page po-page-confirm">'
      + top
      + '<div class="po-confirm' + (CONFIRM_PREVIEW_COLLAPSED ? ' po-confirm-preview-off' : '') + '">'
      + leftPanel
      + rightPanel
      + '</div>'
      + logDrawer
      + '</div>';
  }

  /* ═══ 直投项目确认页：与基金同一套交互壳，仅数据与 Tab 不同 ═══ */
  function pageDirectProjectConfirm(conf, st, fileId) {
    CURRENT_CONFIRM = fileId;
    var sources = _directMockSources();
    var sourceIdx = CONFIRM_SOURCE_STATE[fileId] != null ? CONFIRM_SOURCE_STATE[fileId] : 0;
    if (sourceIdx >= sources.length) sourceIdx = 0;
    var source = sources[sourceIdx];
    var saved = STRUCTURED_VALUES[fileId] = STRUCTURED_VALUES[fileId] || {};
    var bizTab = _remapConfirmTab(DIRECT_CONFIRM_TAB_MAP, STRUCTURED_BIZ_TAB[fileId] || '概览');
    STRUCTURED_BIZ_TAB[fileId] = bizTab;
    var activeRow = STRUCTURED_ACTIVE_FIELD[fileId] == null ? 0 : STRUCTURED_ACTIVE_FIELD[fileId];
    var bizFields = conf.bizFields || {};

    var submitBtn = st.submitted
      ? '<span class="po-btn po-btn-sm po-btn-submitted">已写入 ✓</span>'
      : '<button class="po-btn po-btn-sm po-btn-primary" data-act="submitConfirm">确认写入</button>';
    var top = '<div class="po-toolbar"><button class="po-btn po-btn-sm po-confirm-back-btn" data-nav="file-parse">← 返回</button><h2>' + esc(conf.projectName) + '</h2><div class="po-toolbar-spacer"></div>'
      + '<button class="po-btn po-btn-sm' + (STRUCTURED_LOG_OPEN ? ' active' : '') + '" data-act="toggleOpLog">操作记录</button>'
      + '<button class="po-btn po-btn-sm" data-act="exportConfirmXlsx">导出 Excel</button>'
      + '<button class="po-btn po-btn-sm" data-act="saveStructuredDraft">暂存</button>'
      + submitBtn + '</div>';

    var strip = _confirmSourceStripHtml(sources, sourceIdx);

    var previewContent;
    if (bizTab === '财务数据') {
      previewContent = _renderFinancePreview(_financeConfirmData(), activeRow, sources[0]);
    } else {
      previewContent = '<div class="po-doc-page po-source-preview"><div class="po-doc-h">原文预览<span class="po-doc-sub">' + esc(source.name) + '</span></div><div class="po-source-kind">自动匹配：' + esc(source.component) + '</div><div class="po-doc-table-wrap"><table class="po-doc-table"><thead><tr>'
        + source.previewHeaders.map(function(h){return '<td>' + esc(h) + '</td>';}).join('') + '</tr></thead><tbody>'
        + source.previewRows.map(function(row, ri){return '<tr class="po-doc-row">' + row.map(function(cell, ci){return '<td class="' + (ci === row.length-1 ? 'po-doc-v po-doc-hi' + (ri === activeRow ? ' active' : '') : 'po-doc-k') + '">' + esc(cell) + '</td>';}).join('') + '</tr>';}).join('')
        + '</tbody></table></div></div>';
    }
    var leftPanel = CONFIRM_PREVIEW_COLLAPSED
      ? ''
      : '<div class="po-confirm-left">' + strip + '<div class="po-confirm-left-preview">' + previewContent + '</div></div>';

    var badgeMap = {};
    var badgeSeq = 0;
    function getBadge(srcIdx, loc) {
      var k = srcIdx + '|' + loc;
      if (badgeMap[k] == null) badgeMap[k] = ++badgeSeq;
      return badgeMap[k];
    }
    function fieldGrid(items) {
      if (!items || !items.length) return '<div class="po-field-grid-empty">暂无识别内容</div>';
      return '<div class="po-field-grid">' + items.map(function(item) {
        var key = (item.srcIdx != null ? item.srcIdx : fileId) + ':' + item.label;
        var val = saved[key] != null ? saved[key] : (item.value || '');
        var isDerived = !!item.derived;
        var badgeHtml = '';
        if (isDerived) {
          badgeHtml = '<span class="po-derived-tag" title="系统按公式计算；溯源看公式与输入字段，不定位原文格">派生</span>';
        } else if (item.srcIdx != null) {
          var badge = getBadge(item.srcIdx, item.loc || '');
          var badgeTitle = sources[item.srcIdx].name + ' · ' + (item.loc || '');
          badgeHtml = badge > 0 ? '<sup class="po-src-badge" title="' + esc(badgeTitle) + '" data-act="locateStructuredSource" data-arg="' + item.srcIdx + '|0">' + badge + '</sup>' : '';
        }
        if (item.ext) badgeHtml += '<span class="po-ext-tag" title="工商信息由外部数据接口补全">外部接口</span>';
        var derivedHtml = isDerived ? '<small class="po-result-rule" title="计算公式与代入值">= ' + esc(item.derived) + (item.note ? ' · ' + esc(item.note) : '') + '</small>' : '';
        var noteHtml = (!isDerived && item.note) ? '<small class="po-result-note">' + esc(item.note) + '</small>' : '';
        var labelShow = _confirmStripLabelUnit(item.label);
        var showUncertain = !!item.uncertain && saved[key] == null;
        if (item.long) {
          return '<div class="po-field-item po-field-long"><div class="po-field-label">' + esc(labelShow) + badgeHtml + '</div>'
            + '<textarea class="po-result-input po-result-textarea' + (showUncertain ? ' is-uncertain' : '') + '" data-structured-value="' + esc(key) + '">' + esc(val) + '</textarea>' + derivedHtml + noteHtml + '</div>';
        }
        return '<div class="po-field-item"><div class="po-field-label">' + esc(labelShow) + badgeHtml + '</div>'
          + '<div class="po-field-val-wrap">' + _confirmFieldInput(key, item.label, val, { uncertain: showUncertain }) + derivedHtml + noteHtml + '</div></div>';
      }).join('') + '</div>';
    }
    function srcFieldToItem(fld, srcIdx) {
      return { label: fld.name, value: fld.value, loc: fld.loc, note: fld.note, derived: fld.derived, long: fld.long, srcIdx: srcIdx, uncertain: !!fld.uncertain };
    }
    function kvToItems(fields, srcIdx) {
      return (fields || []).map(function(f) {
        return { label: f.label, value: f.value, loc: '', srcIdx: srcIdx, ext: !!f.ext };
      });
    }

    var bizTabs = ['概览', '投资与股权', '经营情况', '财务数据'];
    var finFailN = 0;
    try {
      var finData = _financeConfirmData();
      finFailN = (finData.checks || []).filter(function (c) { return c.status !== 'pass'; }).length;
    } catch (eFin) {}
    var tabBar = '<div class="po-biz-tabs">' + bizTabs.map(function(t) {
      var warn = (t === '财务数据' && finFailN) ? ' po-biz-tab-warn' : '';
      return '<button class="po-biz-tab' + (t === bizTab ? ' active' : '') + warn + '" data-act="switchBizTab" data-arg="' + esc(t) + '" title="' + (warn ? '有待处理项' : '') + '">' + t + '</button>';
    }).join('') + '</div>';

    var tabContent = '';
    if (bizTab === '概览') {
      var baseFromSrc = sources[3].sections[0].rows.map(function(f){ return srcFieldToItem(f, 3); });
      var baseFallback = kvToItems(bizFields['基础信息'] || bizFields['概览'], 3);
      tabContent = '<div class="po-biz-section"><h4>工商基础信息</h4>' + fieldGrid(baseFromSrc.length ? baseFromSrc : baseFallback) + '</div>';
    } else if (bizTab === '投资与股权') {
      var inv = kvToItems(bizFields['投资信息'] || [
        { label:'首次投资日期', value:'2024-03-28' }, { label:'本轮投资金额', value:'5,000 万元' },
        { label:'累计投资金额', value:'5,000 万元' }, { label:'投资轮次', value:'A+轮' }, { label:'持股比例', value:'12%' }
      ], 1);
      var roundItems = sources[1].sections[0].rows.map(function(f){ return srcFieldToItem(f, 1); });
      var holdItems = kvToItems(bizFields['期末持仓'] || [
        { label:'期末持股比例', value:'12%' }, { label:'持股公允价值', value:'9,600 万元' },
        { label:'剩余投资成本', value:'5,000 万元' }, { label:'未实现增值', value:'4,600 万元' },
        { label:'MOIC', value:'1.92x' }, { label:'退出状态', value:'在管' }
      ], 0);
      var perfItems = kvToItems(bizFields['业绩指标'] || [
        { label:'MOIC', value:'1.92x' }, { label:'IRR', value:'—' },
        { label:'当前估值', value:'8.00 亿元' }, { label:'较上期变动', value:'净利润 -20.3%' }
      ], 0);
      var termItems = sources[2].sections[0].rows.map(function(f){ return srcFieldToItem(f, 2); });
      tabContent = '<div class="po-biz-section"><h4>投资信息</h4>' + fieldGrid(inv) + '</div>'
        + '<div class="po-biz-section"><h4>期末持仓</h4>' + fieldGrid(holdItems) + '</div>'
        + '<div class="po-biz-section"><h4>后续轮融资</h4>' + fieldGrid(roundItems) + '</div>'
        + '<div class="po-biz-section"><h4>当期表现</h4>' + fieldGrid(perfItems) + '</div>'
        + '<div class="po-biz-section"><h4>关键条款</h4>' + fieldGrid(termItems) + '</div>';
    } else if (bizTab === '经营情况') {
      var progressItems = [
        { label: '业务进展', value: '本季度完成 2 个项目后续轮融资，重点推进存量项目治理。', long: true, srcIdx: 0 },
        { label: '退出规划', value: '优先推进已申报 IPO 项目；其余项目按持有至下一轮或协议回购路径跟进。', long: true, srcIdx: 0 },
        { label: '后续融资情况', value: 'B 轮已交割；下一轮融资窗口预计 2026 下半年。', long: true, srcIdx: 1 }
      ];
      tabContent = '<div class="po-biz-section"><h4>业务进展</h4>' + fieldGrid(progressItems) + '</div>';
    } else if (bizTab === '财务数据') {
      CONFIRM_SOURCE_STATE[fileId] = CONFIRM_SOURCE_STATE[fileId] != null ? CONFIRM_SOURCE_STATE[fileId] : 0;
      tabContent = _renderFinanceWorkbench(_financeConfirmData(), saved);
    }

    var logDrawer = '';
    if (STRUCTURED_LOG_OPEN) {
      var logEntries = STRUCTURED_OP_LOG.length ? STRUCTURED_OP_LOG.slice().reverse() : [
        { time: '15:01:40', who: '王敏', msg: '上传材料 · 归属：星河智造 / 2026H1' }
      ];
      logDrawer = '<div class="po-oplog-drawer"><div class="po-oplog-head"><strong>操作记录</strong><button class="po-icon-btn" data-act="toggleOpLog">×</button></div><div class="po-oplog-list">' + _opLogTableHtml(logEntries) + '</div></div>';
    }

    var rightPanel = bizTab === '财务数据'
      ? '<div class="po-confirm-right po-fin-workbench">' + _confirmBizStickyHtml(tabBar) + tabContent + '</div>'
      : '<div class="po-confirm-right">' + _confirmBizStickyHtml(tabBar)
        + _uncertainInfoHtml(tabContent.indexOf('is-uncertain') !== -1)
        + '<div class="po-biz-content">' + tabContent + '</div></div>';

    CURRENT_EXPORT_PAYLOAD = poBuildDirectPayload(conf, fileId, bizFields, saved);

    return '<div class="po-page po-page-confirm">'
      + top
      + '<div class="po-confirm' + (CONFIRM_PREVIEW_COLLAPSED ? ' po-confirm-preview-off' : '') + '">'
      + leftPanel
      + rightPanel
      + '</div>'
      + logDrawer
      + '</div>';
  }

  /* ═══ 项目数据浏览器（Wind 式：项目范围树 + 指标维度 + 高密度分组表头） ═══ */
  function _colDef(key) {
    var cols = D().BROWSER_COLUMNS || [];
    for (var i = 0; i < cols.length; i++) {
      for (var j = 0; j < cols[i].cols.length; j++) if (cols[i].cols[j].key === key) return cols[i].cols[j];
    }
    return null;
  }
  function _materialCount(p, type) {
    var files = D().FILES || {};
    var all = (files.parsing || []).concat(files.pending || []);
    var n = 0;
    all.forEach(function (f) {
      if (f.project !== p.id) return;
      if (type === 'GP季报') { if (f.type === 'GP季报') n++; }
      else if (type === '财报') { if (f.type === '财报') n++; }
      else if (type === '补充材料') { if (/补充/.test(f.name || '')) n++; }
    });
    return n ? n + ' 份' : '—';
  }
  function _cellVal(p, key, per) {
    if (key === 'industry') return p.industry || '—';
    if (key === 'city') return p.city || '—';
    if (key === 'round') return p.round || '—';
    if (key === 'stageIn') return p.stageIn || '—';
    if (key === 'ratio') return p.ratio ? p.ratio + '%' : '—';
    if (key === 'investAmount') return p.investAmount ? fmtMoney(p.investAmount) : '—';
    if (key === 'valuation') return p.valuation ? fmtMoney(p.valuation) : '—';
    if (key === 'investDate') return p.investDate || '—';
    if (key === 'tvpi') return p.tvpi != null ? p.tvpi.toFixed(2) : '—';
    if (key === 'dpi') return p.dpi != null ? p.dpi.toFixed(2) : '—';
    if (key === 'moic') return p.moic != null ? p.moic.toFixed(2) : '—';
    if (['revenue','netProfit','totalAssets','totalLiab','equity'].indexOf(key) >= 0) {
      var pd = null;
      (p.periods || []).forEach(function (x) { if (x.id === per) pd = x; });
      if (!pd) return '—';
      var v = pd[key];
      var cell = (v == null) ? '—' : fmtMoney(v);
      return cell + (pd.status === 'pending' ? '<span class="po-cell-flag">待确认</span>' : '');
    }
    if (key === 'm-fin') return _materialCount(p, '财报');
    if (key === 'm-gp') return _materialCount(p, 'GP季报');
    if (key === 'm-supp') return _materialCount(p, '补充材料');
    if (key.indexOf('i-') === 0) return '<span class="po-cell-muted">未接入</span>';
    return '—';
  }

  function pageBrowser() {
    var d = D();
    var projects = _scopedProjects();
    var visible = _visibleKeys();          /* 表格列：已生效 */
    var pending = _pendingKeys();          /* 树勾选：待提取 */

    /* 收集作用域内出现的期次 */
    var periodSet = {};
    projects.forEach(function (p) { (p.periods || []).forEach(function (x) { periodSet[x.id] = x.label; }); });
    var periods = Object.keys(periodSet);

    /* —— 左：指标目录树 —— */
    var treeHtml = (d.BROWSER_TREE || []).map(function (g) {
      var open = BROWSER_STATE.expanded[g.cat];
      var items = g.items.filter(function (it) {
        if (!BROWSER_STATE.search) return true;
        return it.label.toLowerCase().indexOf(BROWSER_STATE.search.toLowerCase()) >= 0;
      });
      if (BROWSER_STATE.search && !items.length) return '';
      var leaves = items.map(function (it) {
        var checked = pending.indexOf(it.key) >= 0;
        return '<div class="po-tree-leaf' + (checked ? ' on' : '') + '" data-act="treeLeaf" data-arg="' + it.key + '">'
          + '<span class="po-tree-box">' + (checked ? ICON_CHECK : '') + '</span>' + esc(it.label) + '</div>';
      }).join('');
      return '<div class="po-tree-cat">'
        + '<div class="po-tree-cat-h" data-act="treeCat" data-arg="' + esc(g.cat) + '">'
        + esc(g.cat) + '<span class="po-tree-caret">' + (open ? '▾' : '▸') + '</span></div>'
        + (open ? '<div class="po-tree-leaves">' + leaves + '</div>' : '')
        + '</div>';
    }).join('');

    /* —— 右：列模型（静态分组 + 动态期次分组） —— */
    var groups = [];
    (d.BROWSER_COLUMNS || []).forEach(function (g) {
      var cols = g.cols.filter(function (c) { return visible.indexOf(c.key) >= 0; });
      if (cols.length) groups.push({ group: g.group, cols: cols, isPeriod: false });
    });
    var finKeys = ['revenue','netProfit','totalAssets','totalLiab','equity'];
    periods.forEach(function (per) {
      var cols = finKeys.filter(function (k) { return visible.indexOf(k) >= 0; })
        .map(function (k) { var def = _colDef(k); return { key: k, label: def ? def.label : k, unit: def ? def.unit : '', caliber: per, source: '项目库·期间数据' }; });
      if (cols.length) groups.push({ group: periodSet[per], cols: cols, isPeriod: true });
    });

    /* 表头（2 级：分组 / 叶子+口径），首列为项目名（跨两行） */
    var head1 = '<tr><th rowspan="2" class="po-th-name">项目</th>';
    var head2 = '<tr>';
    groups.forEach(function (g) {
      head1 += '<th class="po-th-group" colspan="' + g.cols.length + '">' + esc(g.group) + '</th>';
      g.cols.forEach(function (c) {
        var cap = [];
        if (c.unit) cap.push('单位:' + c.unit);
        if (c.caliber) cap.push(c.caliber);
        var title = c.source ? ('来源：' + c.source) : '';
        head2 += '<th class="po-th-leaf" title="' + esc(title) + '">' + esc(c.label)
          + (cap.length ? '<span class="po-th-cap">' + esc(cap.join(' · ')) + '</span>' : '') + '</th>';
      });
    });
    head1 += '</tr>'; head2 += '</tr>';

    /* 数据行 */
    var rows = projects.map(function (p) {
      var tds = '';
      groups.forEach(function (g) {
        g.cols.forEach(function (c) {
          var v = _cellVal(p, c.key, g.isPeriod ? c.caliber : null);
          tds += '<td class="po-cell-num">' + v + '</td>';
        });
      });
      var nameCell = '<td class="po-brow-name" data-nav="project/' + p.id + '">' + esc(p.name)
        + ' ' + typeTag(p.type) + stageTag(p.stage) + '</td>';
      return '<tr>' + nameCell + tds + '</tr>';
    }).join('');

    var table = '<table class="po-browser-table"><thead>' + head1 + head2 + '</thead><tbody>' + rows + '</tbody></table>';

    /* —— 工具栏：标题 + 提取数据按钮 —— */
    var right = '<button class="po-btn po-btn-sm po-btn-primary" data-act="extractData">提取数据</button>';

    /* —— 左：项目范围 + 指标维度 + 搜索指标 —— */
    var scopeHtml = _buildScopeTree().map(function (root) {
      return _renderScopeNode(root, 0);
    }).join('');

    return '<div class="po-page po-page-browser">'
      + toolbar('项目数据浏览器', right)
      + '<div class="po-browser">'
      +   '<aside class="po-browser-tree">'
      +     '<div class="po-browser-sect"><div class="po-browser-sect-h">项目范围</div>' + scopeHtml + '</div>'
      +     '<div class="po-browser-sect"><div class="po-browser-sect-h">指标维度</div>'
      +       '<div class="po-browser-search"><input id="poBrowserSearch" class="po-input" placeholder="搜索指标" value="' + esc(BROWSER_STATE.search) + '" /></div>'
      +       treeHtml
      +     '</div>'
      +   '</aside>'
      +   '<div class="po-browser-main"><div class="po-browser-scroll">' + table + '</div></div>'
      + '</div>'
      + '</div>';
  }

  /* ═══ 私募股权专家（专家市场：对齐 agent-demo config） ═══ */
  function _expertCard(e) {
    return '<div class="po-expert-card">'
      + '<div class="po-expert-top">'
      +   '<span class="po-expert-avatar">' + esc(e.name.charAt(0)) + '</span>'
      +   '<div class="po-expert-id">'
      +     '<div class="po-expert-name">' + esc(e.name) + '</div>'
      +     '<div class="po-expert-role">' + esc(e.field) + '</div>'
      +   '</div>'
      +   '<span class="po-tag po-tag-type-direct">' + esc(e.category) + '</span>'
      + '</div>'
      + '<div class="po-expert-exp">' + esc(e.summary) + '</div>'
      + (e.tags && e.tags.length ? '<div class="po-expert-tags">' + e.tags.map(function (t) { return '<span class="po-tag po-tag-source-derived">' + esc(t) + '</span>'; }).join('') + '</div>' : '')
      + '<div class="po-expert-actions"><button class="po-btn po-btn-sm po-btn-primary" data-act="summonExpert" data-arg="' + esc(e.name) + '">召唤进对话</button></div>'
      + '</div>';
  }
  function pagePEExperts() {
    var d = D();
    var experts = d.PE_EXPERTS || [];
    var lead = '共 ' + experts.length + ' 位 AI 专家，覆盖投资建模、赛道研究、尽调、风控、并购等场景，可一键召唤进对话';
    return '<div class="po-page">'
      + toolbar('专家市场', '')
      + '<div class="po-body">'
      +   '<p class="po-market-lead">' + esc(lead) + '</p>'
      +   '<div class="po-expert-grid">' + experts.map(_expertCard).join('') + '</div>'
      + '</div></div>';
  }

  /* ═══ 能力市场（技能 / 专家 / 连接器） ═══ */
  function pagePESkills() {
    var d = D();
    var skills = d.PE_SKILLS || [];
    var experts = d.PE_EXPERTS || [];
    var conns = d.PE_CONNECTORS || [];
    var kindTabs = [['skill','技能'],['expert','专家'],['connector','连接器']].map(function (k) {
      return '<div class="po-market-tab' + (MARKET_STATE.kind === k[0] ? ' active' : '') + '" data-act="marketKind" data-arg="' + k[0] + '">' + k[1] + '</div>';
    }).join('');
    var content = '';
    if (MARKET_STATE.kind === 'expert') {
      content = '<div class="po-expert-grid">' + experts.map(_expertCard).join('') + '</div>';
    } else if (MARKET_STATE.kind === 'connector') {
      content = '<div class="po-connector-list">' + conns.map(function (c) {
        return '<div class="po-connector-row">'
          + '<div class="po-connector-name">' + esc(c.name) + '</div>'
          + '<div class="po-connector-desc">' + esc(c.desc) + '</div>'
          + '<button class="po-btn po-btn-sm' + (c.status === 'connected' ? '' : ' po-btn-ghost') + '" data-act="connectToggle" data-arg="' + esc(c.name) + '">' + (c.status === 'connected' ? '已连接' : '连接') + '</button>'
          + '</div>';
      }).join('') + '</div>';
    } else {
      content = '<div class="po-skill-grid">' + skills.map(function (s) {
        return '<div class="po-skill-card">'
          + '<div class="po-skill-head"><span class="po-skill-name">' + esc(s.name) + '</span><span class="po-tag po-tag-type-fof">' + esc(s.category) + '</span></div>'
          + '<div class="po-skill-desc">' + esc(s.desc) + '</div>'
          + '<div class="po-skill-actions"><button class="po-btn po-btn-sm po-btn-primary" data-act="useSkill" data-arg="' + esc(s.name) + '">使用</button></div>'
          + '</div>';
      }).join('') + '</div>';
    }
    return '<div class="po-page">'
      + toolbar('能力市场', '<button class="po-btn po-btn-sm" data-act="openMarketCreate">创建技能</button><button class="po-btn po-btn-sm" data-act="openMarketCreate">创建专家</button>')
      + '<div class="po-body">'
      +   '<div class="po-market-tabs">' + kindTabs + '</div>'
      +   content
      + '</div></div>';
  }

  /* ═══ 投委会对抗预演（红蓝对抗：红方 vs 蓝方 → 综合裁定，对齐 agent-demo 报告效果） ═══ */
  var DEBATE_OPEN = {};   /* col:idx -> bool 论点展开态 */
  function _debatePoint(side, pt, idx) {
    var open = DEBATE_OPEN[side + ':' + idx] === true;
    return '<div class="po-debate-point' + (open ? ' open' : '') + '" data-act="debatePoint" data-arg="' + side + ':' + idx + '">'
      + '<div class="po-debate-point-h">' + esc(pt.t) + '<span class="po-tree-caret">' + (open ? '▾' : '▸') + '</span></div>'
      + (open ? '<div class="po-debate-point-d">' + esc(pt.d) + '</div>' : '')
      + '</div>';
  }
  function pageRedBlue() {
    var d = D();
    var db = d.PE_DEBATE;
    if (!db) return '<div class="po-page">' + toolbar('投委会对抗预演') + '<div class="po-body"><div class="po-empty">暂无对抗预演数据</div></div></div>';
    /* 显示选定的红方/蓝方专家（多选） */
    var experts = d.PE_EXPERTS || [];
    function findExp(id) { for (var i = 0; i < experts.length; i++) if (experts[i].id === id) return experts[i]; return null; }
    function expNames(ids) {
      var names = (ids || []).map(findExp).filter(Boolean).map(function (e) { return e.name; });
      if (!names.length) return '';
      if (names.length <= 2) return names.join('、');
      return names.slice(0, 2).join('、') + ' 等 ' + names.length + ' 位';
    }
    function expTitle(ids) {
      var es = (ids || []).map(findExp).filter(Boolean);
      return es.map(function (e) { return e.name + ' · ' + e.field; }).join('；');
    }
    var redName = expNames(DEBATE_PICK.red) || '红方 AI 专家';
    var blueName = expNames(DEBATE_PICK.blue) || '蓝方 AI 专家';
    var redColH = '红方 · ' + (expNames(DEBATE_PICK.red) || '看多');
    var blueColH = '蓝方 · ' + (expNames(DEBATE_PICK.blue) || '看空');
    var sumRows = db.summary.map(function (r) {
      return '<tr><td style="padding:4px 10px;color:var(--xb-muted);border:1px solid var(--po-line);white-space:nowrap">' + esc(r[0]) + '</td>'
        + '<td style="padding:4px 10px;border:1px solid var(--po-line)">' + esc(r[1]) + '</td></tr>';
    }).join('');
    var redHtml = db.red.map(function (pt, i) { return _debatePoint('red', pt, i); }).join('');
    var blueHtml = db.blue.map(function (pt, i) { return _debatePoint('blue', pt, i); }).join('');
    var conflictHtml = db.verdict.conflicts.map(function (c) {
      return '<div class="po-verdict-item">' + esc(c) + '</div>';
    }).join('');
    var scoreHtml = db.verdict.scores.map(function (s) {
      var stars = '';
      for (var i = 1; i <= 5; i++) stars += i <= s[1] ? '★' : '☆';
      return '<div class="po-score-row"><span class="po-score-label">' + esc(s[0]) + '</span>'
        + '<span class="po-score-stars">' + stars + '</span>'
        + '<span class="po-score-note">' + esc(s[2]) + '</span></div>';
    }).join('');
    return '<div class="po-page">'
      + toolbar('投委会对抗预演 · ' + esc(db.target), '<button class="po-btn po-btn-sm" data-act="debateBack">返回首页</button>')
      + '<div class="po-body po-debate-body">'
      + '<div class="po-debate-sub">红方看多 vs 蓝方看空 → 综合裁定 · 还原 agent-demo 投委会对抗预演</div>'
      + '<div class="po-debate-matchup">'
      +   '<span class="po-match-red">红方：' + esc(redName) + '</span>'
      +   '<span class="po-match-vs">VS</span>'
      +   '<span class="po-match-blue">蓝方：' + esc(blueName) + '</span>'
      + '</div>'
      + '<div class="po-debate-overview"><table style="width:100%;border-collapse:collapse;font-size:12px">' + sumRows + '</table></div>'
      + '<div class="po-debate-grid">'
      +   '<div class="po-debate-col po-debate-red"><div class="po-debate-col-h" title="' + esc(expTitle(DEBATE_PICK.red)) + '">' + esc(redColH) + '</div>' + redHtml + '</div>'
      +   '<div class="po-debate-col po-debate-blue"><div class="po-debate-col-h" title="' + esc(expTitle(DEBATE_PICK.blue)) + '">' + esc(blueColH) + '</div>' + blueHtml + '</div>'
      + '</div>'
      + '<div class="po-verdict">'
      +   '<div class="po-verdict-title">综合裁定：' + esc(db.verdict.title) + '</div>'
      +   '<div class="po-verdict-sect">关键矛盾</div>' + conflictHtml
      +   '<div class="po-verdict-sect">风险收益总结</div>' + scoreHtml
      +   '<div class="po-verdict-sect">建议操作</div><div class="po-verdict-item">' + esc(db.verdict.advice) + '</div>'
      + '</div>'
      + '</div></div>';
  }

  /* ═══ 开启红蓝对抗：选择红方/蓝方专家（多选，每方最多 4 位） ═══ */
  function pageRedBlueSetup() {
    var d = D();
    var experts = d.PE_EXPERTS || [];
    function pickCard(e, side) {
      var arr = DEBATE_SETUP[side] || [];
      var idx = arr.indexOf(e.id);
      var sel = idx >= 0;
      return '<div class="po-pick-card' + (sel ? ' ' + side + '-sel' : '') + '" data-act="debatePick" data-arg="' + side + ':' + e.id + '">'
        + '<span class="po-expert-avatar">' + esc(e.name.charAt(0)) + '</span>'
        + '<div class="po-pick-id"><div class="po-pick-name">' + esc(e.name) + '</div><div class="po-pick-field">' + esc(e.field) + '</div></div>'
        + (sel ? '<span class="po-pick-check">已选 ' + (idx + 1) + '</span>' : '')
        + '</div>';
    }
    var redCards = experts.map(function (e) { return pickCard(e, 'red'); }).join('');
    var blueCards = experts.map(function (e) { return pickCard(e, 'blue'); }).join('');
    var redN = (DEBATE_SETUP.red || []).length;
    var blueN = (DEBATE_SETUP.blue || []).length;
    var ready = redN > 0 && blueN > 0;
    return '<div class="po-page">'
      + toolbar('开启红蓝对抗', '<button class="po-btn po-btn-sm" data-act="debateBack">取消</button>')
      + '<div class="po-body">'
      + '<p class="po-market-lead">选择红方（看多）与蓝方（看空）专家，可多选、每方最多 4 位；双方将按各自立场生成对抗论点并输出综合裁定。</p>'
      + '<div class="po-pick-grid">'
      +   '<div class="po-pick-col"><div class="po-pick-col-h red">红方 · 看多 / 机会（' + redN + ' / 4）</div>' + redCards + '</div>'
      +   '<div class="po-pick-col"><div class="po-pick-col-h blue">蓝方 · 看空 / 风险（' + blueN + ' / 4）</div>' + blueCards + '</div>'
      + '</div>'
      + '<div class="po-pick-footer">'
      +   '<button class="po-btn po-btn-sm po-btn-primary" data-act="debateStart" ' + (ready ? '' : 'disabled') + '>开始对抗（红 ' + redN + ' 人 vs 蓝 ' + blueN + ' 人）</button>'
      + '</div>'
      + '</div></div>';
  }

  /* ═══ 科目配置（财评助手迁移：科目库 / 指标计算 / 规则引擎 / 期间口径 + 映射策略） ═══ */
  function _finConfig() {
    var cached = window.__FIN_CFG__;
    if (cached) return cached;
    try {
      var s = localStorage.getItem('qmx:fin-cfg:v1');
      if (s) { cached = JSON.parse(s); window.__FIN_CFG__ = cached; return cached; }
    } catch(e) {}
    var fc = D().FINANCE_CONFIGS || {};
    var id = FIN_STATE.configId || fc.active;
    cached = (fc.configs && fc.configs[id]) || (fc.configs && fc.configs[fc.active]) || { subjects:{}, metrics:[], rules:[], periodCalibers:[], mappingStrategies:[] };
    window.__FIN_CFG__ = cached;
    return cached;
  }
  function _saveFinConfig(cfg) {
    window.__FIN_CFG__ = cfg;
    try { localStorage.setItem('qmx:fin-cfg:v1', JSON.stringify(cfg)); } catch(e) {}
    var el = document.querySelector('[data-fin-config-save]');
    if (el) { el.textContent = '\u2713 已保存'; setTimeout(function(){ if(el) el.textContent = '已保存'; }, 2000); }
  }
  function _finUid(p) { return p + '-' + Date.now().toString(36).substr(-4) + Math.random().toString(36).substr(2,4); }
  function pageFinanceConfig() {
    var fc = D().FINANCE_CONFIGS || {};
    var cfg = _finConfig();
    var tab = FIN_STATE.tab;
    var stmt = FIN_STATE.stmt;
    if (['subjects','metrics','rules','periods'].indexOf(tab) < 0) tab = FIN_STATE.tab = 'subjects';
    var tabs = [['subjects','科目与映射'],['metrics','指标计算'],['rules','校验规则'],['periods','期间口径']];
    var tabHtml = '<div class="po-fin-tabs">' + tabs.map(function (t) {
      return '<button class="po-fin-tab' + (tab === t[0] ? ' active' : '') + '" data-act="finTab" data-arg="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
    var list = fc.list || [];
    var activeId = FIN_STATE.configId || fc.active;
    var activeMeta = list.filter(function(c){return c.id === activeId;})[0] || list[0] || {name:'众源资本科目库',scope:'tenant'};
    var subjectCount = Object.keys(cfg.subjects || {}).reduce(function(n,k){return n + (cfg.subjects[k] || []).length;},0);
    var cfgHead = '<div class="po-fin-config-head"><div class="po-fin-config-title"><strong>' + esc(activeMeta.name) + '</strong><span>机构配置</span><small>' + subjectCount + ' 科目 · ' + (cfg.metrics || []).length + ' 指标 · ' + (cfg.rules || []).length + ' 条规则</small></div>'
      + '<div class="po-fin-cfg-switch">' + list.map(function(c){var cur=activeId===c.id;return '<button class="po-fin-cfg-opt' + (cur?' active':'') + '" data-act="finSwitchCfg" data-arg="' + c.id + '">' + esc(c.name) + '</button>';}).join('') + '</div><span class="po-auto-save" data-fin-config-save>已保存</span></div>';

    var body = '';
    if (tab === 'subjects') {
      var stmts = [['is','利润表'],['bs','资产负债表'],['cf','现金流量表']];
      var stmtTabs = '<div class="po-fin-stmt-tabs">' + stmts.map(function (s) {
        var cnt = ((cfg.subjects || {})[s[0]] || []).length;
        return '<button class="po-fin-stmt' + (stmt === s[0] ? ' active' : '') + '" data-act="finStmt" data-arg="' + s[0] + '">' + s[1] + '<span class="cnt">' + cnt + '</span></button>';
      }).join('') + '</div>';
      var subs = (cfg.subjects || {})[stmt] || [];
      var selectedId = FIN_STATE.subjectId;
      var selected = subs.filter(function(s){return s.id === selectedId;})[0] || subs[0] || {id:'',name:'',aliases:''};
      FIN_STATE.subjectId = selected.id;
      var subRows = subs.map(function (s) {
        var aliasCount = String(s.aliases || '').split(',').filter(Boolean).length;
        return '<button class="po-fin-subject' + (s.id === selected.id ? ' active' : '') + '" data-act="finSelectSubject" data-arg="' + esc(s.id) + '"><span class="po-fin-sub-name">' + esc(s.name) + '</span><span class="po-fin-sub-aliases">' + esc(s.aliases || '暂无别名') + '</span><span class="po-fin-sub-count">' + aliasCount + ' 个别名</span></button>';
      }).join('');
      var strategy = (cfg.mappingStrategies || []).map(function(s){return '<li><span>' + s.priority + '</span><div><strong>' + esc(s.name) + '</strong><small>' + esc(s.example || s.desc) + '</small></div></li>';}).join('');
      body = '<div class="po-fin-config-intro"><div><strong>点击科目名编辑，别名逗号分隔；新增后选择报表</strong><span>标准科目用于三表展示、指标公式和试算；原始科目名称始终保留并可定位。</span></div><button class="po-btn po-btn-sm" data-act="finUploadSubjects">上传科目表</button></div>'
        + stmtTabs + '<div class="po-fin-subject-workbench"><div class="po-fin-subject-pane"><div class="po-fin-subject-table-head"><span>标准科目</span><span>来源别名</span><span></span></div><div class="po-fin-subject-list">' + (subRows || '<div class="po-empty">该报表暂无科目</div>') + '</div><button class="po-fin-add-subject" data-act="finNewSubject" data-stmt="' + esc(stmt) + '">+ 新增科目</button></div>'
        + '<aside class="po-fin-subject-detail"><div class="po-fin-detail-head"><strong>科目规则</strong><span>' + esc(selected.id || '—') + '</span></div><label>标准科目名<input data-fin-config-value="name" data-subject-id="' + esc(selected.id) + '" data-subject-stmt="' + esc(stmt) + '" value="' + esc(selected.name) + '"></label><label>所属报表<select data-fin-config-value="stmt"><option>' + esc(stmt === 'is'?'利润表':stmt === 'bs'?'资产负债表':'现金流量表') + '</option></select></label><label>来源科目别名<textarea data-fin-config-value="aliases" data-subject-id="' + esc(selected.id) + '" data-subject-stmt="' + esc(stmt) + '">' + esc(selected.aliases || '') + '</textarea></label><p>命中别名后仍保留来源科目；低置信度或一对多映射进入人工确认。</p><div class="po-fin-mapping-order"><strong>匹配顺序</strong><ol>' + strategy + '</ol></div></aside></div>';
    } else if (tab === 'metrics') {
      /* 指标公式模板：6 种，每种的槽位不同 */
      var FORMULA_TEMPLATES = [
        { id:'ratio', name:'占比 A÷B', slots:['分子','分母'], build:function(s){ return s[0]+' / '+s[1]; }, example:'营业成本 ÷ 营业收入' },
        { id:'margin', name:'利润率 (A-B)÷C', slots:['收入','成本','基数'], build:function(s){ return '('+s[0]+' - '+s[1]+') / '+s[2]; }, example:'(营业收入 - 营业成本) ÷ 营业收入' },
        { id:'diff', name:'差额 A-B', slots:['A','B'], build:function(s){ return s[0]+' - '+s[1]; }, example:'流动资产合计 - 流动负债合计' },
        { id:'turnover', name:'周转天数', slots:['科目','收入'], build:function(s){ return s[0]+' / '+s[1]+' * 365'; }, example:'应收账款 ÷ 营业收入 × 365' },
        { id:'multiplier', name:'倍数 A÷B', slots:['A','B'], build:function(s){ return s[0]+' / '+s[1]; }, example:'净利润 ÷ 所有者权益合计' },
        { id:'custom', name:'自由公式', slots:[], build:function(s){ return ''; }, example:'直接输入公式表达式' },
      ];
      var CATEGORIES = ['盈利能力','偿债能力','营运能力','现金流','成长能力','内部指标','其他'];
      var allSubjects = [];
      var sbj = cfg.subjects || {};
      ['is','bs','cf'].forEach(function(k){(sbj[k]||[]).forEach(function(s){allSubjects.push({id:s.id,name:s.name,stmt:k,label:({is:'利润表',bs:'资产负债表',cf:'现金流量表'})[k]});});});
      var editId = (tab==='metrics') ? FIN_STATE.editMetricId : null;
      var metricsHtml = (cfg.metrics || []).map(function (m) {
        var isEditing = editId === m.id;
        if (isEditing) {
          var tpl = FORMULA_TEMPLATES[0];
          for (var ti=0; ti<FORMULA_TEMPLATES.length; ti++) { if (FORMULA_TEMPLATES[ti].id === (FIN_STATE.editTemplate||'ratio')) { tpl = FORMULA_TEMPLATES[ti]; break; } }
          var picks = FIN_STATE.editSlots || (m.formulaSlots ? m.formulaSlots.slice() : []);
          var preview = tpl.build([picks[0]||'?', picks[1]||'?', picks[2]||'?']);
          var customFormula = FIN_STATE.editCustomFormula || m.formula || '';
          var tplSelectHtml = FORMULA_TEMPLATES.map(function(t){return '<button class="po-fin-tpl-opt'+(tpl.id===t.id?' active':'')+'" data-act="finPickTpl" data-arg="'+t.id+'">'+t.name+'</button>';}).join('');
          var slotHtml = '';
          for (var si=0; si<tpl.slots.length; si++) {
            var slotVal = picks[si] || '';
            var slotSub = allSubjects.filter(function(s){return s.id===slotVal;})[0] || null;
            slotHtml += '<div class="po-fin-slot"><label>'+tpl.slots[si]+'</label><select data-act="finPickSlot" data-arg="'+si+'"><option value="">选择科目</option>'
              + allSubjects.map(function(s){return '<option value="'+s.id+'"'+(s.id===slotVal?' selected':'')+'>'+s.label+' · '+s.name+'</option>';}).join('')
              + '</select></div>';
          }
          return '<div class="po-fin-metric-card po-fin-metric-edit">'
            + '<div class="po-fin-edit-row"><label>名称</label><input data-edit="metric-name" value="'+esc(FIN_STATE.editName||m.name)+'" data-fin-edit-input></div>'
            + '<div class="po-fin-edit-row"><label>分类</label><select data-edit="metric-cat" data-fin-edit-input>' + CATEGORIES.map(function(c){return '<option'+(FIN_STATE.editCat&&FIN_STATE.editCat===c?' selected':(m.category===c?' selected':''))+'>'+c+'</option>';}).join('') + '</select>'
            + '<label>单位<input data-edit="metric-unit" data-fin-edit-input value="'+esc(FIN_STATE.editUnit||m.unit||'')+'" style="width:60px;margin-left:6px"></label></div>'
            + '<div class="po-fin-edit-row"><label>公式模板</label><div class="po-fin-tpl-bar">'+tplSelectHtml+'</div></div>'
            + (tpl.id==='custom'
              ? '<div class="po-fin-edit-row"><label>公式表达式</label><input data-edit="metric-custom-formula" value="'+esc(customFormula)+'" placeholder="如 (营业收入 - 营业成本) / 营业收入" style="flex:1;font-family:monospace;font-size:12px"></div>'
              : '<div class="po-fin-slots">'+slotHtml+'</div>')
            + '<div class="po-fin-formula-preview"><span>口径</span><strong>' + esc(tpl.id==='custom' ? (customFormula||'输入表达式...') : preview) + '</strong></div>'
            + '<div class="po-fin-edit-row"><label>期间规则</label><select data-edit="metric-periodRule" data-fin-edit-input><option value="point"'+(m.periodRule==='point'?' selected':'')+'>时点</option><option value="single"'+(m.periodRule==='single'?' selected':'')+'>单期</option><option value="accum"'+(m.periodRule==='accum'?' selected':'')+'>累计</option><option value="yoy"'+(m.periodRule==='yoy'?' selected':'')+'>同比</option><option value="qoq"'+(m.periodRule==='qoq'?' selected':'')+'>环比</option></select>'
            + '<label style="margin-left:12px">适用范围</label><select data-edit="metric-scope" data-fin-edit-input><option value="all"'+(m.scope==='all'?' selected':'')+'>全机构</option><option value="industry"'+(m.scope==='industry'?' selected':'')+'>行业</option><option value="company"'+(m.scope==='company'?' selected':'')+'>企业</option></select>'
            + '<label style="margin-left:12px">缺失处理</label><select data-edit="metric-missing" data-fin-edit-input><option value="skip"'+((m.missing||'skip')==='skip'?' selected':'')+'>不计算</option><option value="substitute"'+(m.missing==='substitute'?' selected':'')+'>替代字段</option><option value="manual"'+(m.missing==='manual'?' selected':'')+'>人工补充</option></select></div>'
            + '<div class="po-fin-edit-actions"><button class="po-btn po-btn-sm" data-act="finCancelEdit">取消</button><button class="po-btn po-btn-sm po-btn-primary" data-act="finSaveEdit" data-arg="'+m.id+'">保存</button></div>'
            + '</div>';
        }
        return '<div class="po-fin-metric-card" data-act="finEditMetric" data-arg="'+m.id+'">'
            + '<button class="po-fin-metric-del" data-act="finDelMetric" data-arg="'+esc(m.id)+'" title="删除">×</button>'
            + '<div class="po-fin-metric-head"><strong>'+esc(m.name)+'</strong>'+(m.unit?'<span class="po-fin-unit">'+esc(m.unit)+'</span>':'')+'</div>'
            + (m.formula?'<div class="po-fin-metric-formula">= '+esc(m.formula)+'</div>':'<div class="po-fin-metric-formula empty">点击编辑公式…</div>')
            + (m.desc?'<div class="po-fin-metric-desc">'+esc(m.desc)+'</div>':'')
            + '</div>';
      }).join('');
      body = '<div class="po-fin-section-head"><span>选模板 → 填科目 → 自动生成公式</span><button class="po-btn po-btn-sm" data-act="finNewMetric">+ 新增指标</button></div>'
        + '<div class="po-fin-metric-grid">' + metricsHtml + '</div>';
    } else if (tab === 'rules') {
      var editRId = (tab==='rules') ? FIN_STATE.editRuleId : null;
      var rulesHtml = (cfg.rules || []).map(function (r) {
        var typeLabel = r.type === 'balance' ? '表内平衡' : (r.type === 'cross' ? '跨表勾稽' : (r.type === 'threshold' ? '阈值预警' : r.type));
        var isREditing = editRId === r.id;
        if (isREditing) {
          return '<div class="po-fin-rule po-fin-rule-edit">'
            + '<div class="po-fin-edit-row"><label>名称</label><input data-edit="rule-name" data-fin-edit-input value="'+esc(FIN_STATE.editRuleName)+'"></div>'
            + '<div class="po-fin-edit-row"><label>类型</label><select data-edit="rule-type" data-fin-edit-input><option value="balance"'+(FIN_STATE.editRuleType==='balance'?' selected':'')+'>表内平衡</option><option value="cross"'+(FIN_STATE.editRuleType==='cross'?' selected':'')+'>跨表勾稽</option><option value="threshold"'+(FIN_STATE.editRuleType==='threshold'?' selected':'')+'>阈值预警</option></select>'
            + '<label>报表<select data-edit="rule-stmt" data-fin-edit-input><option value="is"'+((FIN_STATE.editRuleStmt||'').indexOf('is')>=0?' selected':'')+'>利润表</option><option value="bs"'+((FIN_STATE.editRuleStmt||'').indexOf('bs')>=0?' selected':'')+'>资产负债表</option><option value="cf"'+((FIN_STATE.editRuleStmt||'').indexOf('cf')>=0?' selected':'')+'>现金流量表</option><option value="all"'+((FIN_STATE.editRuleStmt||'')==='all'?' selected':'')+'>全部</option></select></label></div>'
            + '<div class="po-fin-edit-row"><label>公式</label><input data-edit="rule-formula" data-fin-edit-input value="'+esc(FIN_STATE.editRuleFormula)+'" style="flex:1;font-family:monospace;font-size:12px"></div>'
            + '<div class="po-fin-edit-row"><label>容差</label><input data-edit="rule-tolerance" data-fin-edit-input value="'+(r.tolerance||'')+'" placeholder="如 0.01 或 1%" style="width:100px">'
            + '<label style="margin-left:16px">例外范围</label><input data-edit="rule-exception" data-fin-edit-input value="'+(r.exception||'')+'" placeholder="如 某企业名称" style="width:120px">'
            + '<label style="margin-left:16px">禁止确认</label><label class="po-fin-rule-toggle"><input type="checkbox" data-edit="rule-block" data-fin-edit-input'+(r.blockConfirm?' checked':'')+'><span></span></label></div>'
            + '<div class="po-fin-edit-actions"><button class="po-btn po-btn-sm" data-act="finCancelEdit">取消</button><button class="po-btn po-btn-sm po-btn-primary" data-act="finSaveEdit">保存</button></div>'
            + '</div>';
        }
        return '<div class="po-fin-rule" data-act="finEditRule" data-arg="'+r.id+'">'
            + '<label class="po-fin-rule-toggle"><input type="checkbox" data-act="finToggleRule" data-arg="'+esc(r.id)+'"'+(r.enabled?' checked':'')+'><span></span></label>'
            + '<div class="po-fin-rule-head"><span class="po-fin-rule-name">'+esc(r.name)+'</span>'+tag('po-tag-ftype',typeLabel)+'<span class="po-fin-rule-stmt">'+esc(r.stmt)+'</span>'+(r.type==='threshold'?tag('po-tag-status-pending','提醒'):tag('po-tag-status-done','必须通过'))+'</div>'
            + '<div class="po-fin-rule-formula">= '+esc(r.formula)+'</div>'
            + '<button class="po-fin-rule-del" data-act="finDelRule" data-arg="'+esc(r.id)+'" title="删除">×</button>'
            + '</div>';
      }).join('');
      body = '<div class="po-fin-section-head"><span>点击规则编辑，开关即时生效</span><button class="po-btn po-btn-sm" data-act="finNewRule">+ 新增规则</button></div>'
        + '<div class="po-fin-rule-list">' + rulesHtml + '</div><div class="po-fin-rule-note">发布后，财务确认页立即按本版本执行。</div>';
    } else if (tab === 'periods') {
      /* 期间口径配置 */
      var isPeriodEdit = FIN_STATE.editPeriodId;
      var periodsHtml = (cfg.periodCalibers || []).map(function(p){
        if (isPeriodEdit === p.id) {
          return '<div class="po-fin-rule po-fin-rule-edit">'
            + '<div class="po-fin-edit-row"><label>名称</label><input data-edit="period-name" data-fin-edit-input value="'+esc(FIN_STATE.editPeriodName||p.name)+'"></div>'
            + '<div class="po-fin-edit-row"><label>描述</label><input data-edit="period-desc" data-fin-edit-input value="'+esc(FIN_STATE.editPeriodDesc||p.desc)+'" style="flex:1"></div>'
            + '<div class="po-fin-edit-row"><label>含累计列</label><label class="po-fin-rule-toggle"><input type="checkbox" data-edit="period-accum" data-fin-edit-input'+(p.accumulation?' checked':'')+'><span>启用</span></label>'
            + '<label style="margin-left:16px">含单期列</label><label class="po-fin-rule-toggle"><input type="checkbox" data-edit="period-single" data-fin-edit-input'+(p.singleMonth||p.singleQuarter?' checked':'')+'><span>启用</span></label>'
            + (p.deriveSingle?'<label style="margin-left:16px">需倒减推导</label><label class="po-fin-rule-toggle"><input type="checkbox" data-edit="period-derive" data-fin-edit-input checked><span>启用</span></label>':'')+'</div>'
            + '<div class="po-fin-edit-actions"><button class="po-btn po-btn-sm" data-act="finCancelEdit">取消</button><button class="po-btn po-btn-sm po-btn-primary" data-act="finSaveEdit" data-arg="'+p.id+'">保存</button></div></div>';
        }
        return '<div class="po-fin-rule" data-act="finEditPeriod" data-arg="'+p.id+'"><div class="po-fin-rule-head"><span class="po-fin-rule-name">'+esc(p.name)+'</span></div><div class="po-fin-rule-formula">'+esc(p.desc)+'</div><span class="po-fin-rule-del" data-act="finDelPeriod" data-arg="'+p.id+'" title="删除">×</span></div>';
      }).join('');
      var derivedCount = (cfg.periodCalibers||[]).filter(function(p){return p.deriveSingle;}).length;
      body = '<div class="po-fin-section-head"><span>定义月报／季报／年报格式，自动倒减推导——当前 '+derivedCount+' 种需倒减</span><button class="po-btn po-btn-sm" data-act="finNewPeriod">+ 新增口径</button></div>'
        + '<div class="po-fin-rule-list">'+periodsHtml+'</div>';
    } else if (tab === 'fundFields') {
      /* 已迁移至独立页面 pageFieldConfig()，路由 #pe:field-config */
    }

    return '<div class="po-page po-page-finconfig">'
      + toolbar('财务准则配置', '<button class="po-btn po-btn-sm" data-act="finUploadSubjects">导入科目</button><button class="po-btn po-btn-sm po-btn-primary" data-act="finPublish">发布 v3.3</button>')
      + '<div class="po-body">'
      + cfgHead
      + tabHtml
      + body
      + '</div></div>';
  }

  /* ═══ 母基金映射（独立页面） ═══ */
  function pageFieldConfig() {
    var cfg = _finConfig();
    var fundFields = cfg.fundFields || [];
    var isFFEdit = FIN_STATE.editFundFieldId;
    var ffHtml = fundFields.length ? fundFields.map(function(ff){
      if (isFFEdit === ff.id) {
        return '<div class="po-fin-rule po-fin-rule-edit">'
          + '<div class="po-fin-edit-row"><label>目标字段</label><input data-edit="ff-name" data-fin-edit-input value="'+esc(FIN_STATE.editFFName||ff.name)+'"></div>'
          + '<div class="po-fin-edit-row"><label>单位</label><input data-edit="ff-unit" data-fin-edit-input value="'+esc(FIN_STATE.editFFUnit||ff.unit||'')+'" style="width:80px">'
          + '<label style="margin-left:12px">层级</label><select data-edit="ff-layer" data-fin-edit-input><option value="fund"'+(ff.layer==='fund'?' selected':'')+'>子基金层</option><option value="underlying"'+(ff.layer==='underlying'?' selected':'')+'>底层项目层</option></select>'
          + '<label style="margin-left:12px">必填</label><label class="po-fin-rule-toggle"><input type="checkbox" data-edit="ff-required" data-fin-edit-input'+(ff.required?' checked':'')+'><span></span></label></div>'
          + '<div class="po-fin-edit-row"><label>来源别名</label><input data-edit="ff-aliases" data-fin-edit-input value="'+esc(FIN_STATE.editFFAliases||ff.aliases||'')+'" style="flex:1" placeholder="投资金额,投资成本,投资总额"></div>'
          + '<div class="po-fin-edit-row"><label>来源优先级</label><select data-edit="ff-priority" data-fin-edit-input><option value="gp-report"'+(ff.priority==='gp-report'?' selected':'')+'>GP季报优先</option><option value="capital-account"'+(ff.priority==='capital-account'?' selected':'')+'>资本账户优先</option><option value="internal"'+(ff.priority==='internal'?' selected':'')+'>内部表优先</option><option value="manual"'+(ff.priority==='manual'?' selected':'')+'>人工确认</option></select>'
          + '<label style="margin-left:12px">形成方式</label><select data-edit="ff-method" data-fin-edit-input><option value="extract"'+(ff.method==='extract'?' selected':'')+'>材料提取</option><option value="compute"'+(ff.method==='compute'?' selected':'')+'>系统计算</option><option value="import"'+(ff.method==='import'?' selected':'')+'>机构导入</option><option value="manual"'+(ff.method==='manual'?' selected':'')+'>人工确认</option></select></div>'
          + '<div class="po-fin-edit-actions"><button class="po-btn po-btn-sm" data-act="finCancelEdit">取消</button><button class="po-btn po-btn-sm po-btn-primary" data-act="finSaveEdit" data-arg="'+ff.id+'">保存</button></div></div>';
      }
      var methodLabel = {extract:'材料提取',compute:'系统计算',import:'机构导入',manual:'人工确认'};
      return '<div class="po-fin-rule" data-act="finEditFundField" data-arg="'+ff.id+'"><div class="po-fin-rule-head"><span class="po-fin-rule-name">'+esc(ff.name)+'</span>'+tag('po-tag-ftype',(ff.layer==='fund'?'子基金层':'底层项目'))+'<span class="po-fin-rule-stmt">'+(methodLabel[ff.method]||ff.method)+'</span>'+tag('po-tag-status-done',ff.unit||'')+'</div><div class="po-fin-rule-formula">来源别名：'+(ff.aliases||'—')+' · 优先级：'+(ff.priority||'—')+'</div><span class="po-fin-rule-del" data-act="finDelFundField" data-arg="'+ff.id+'" title="删除">×</span></div>';
    }).join('') : '<div class="po-empty">暂无母基金字段映射，点击下方新增</div>';
    return '<div class="po-page">'
      + toolbar('母基金映射', '<button class="po-btn po-btn-sm" data-act="finNewFundField">+ 新增字段</button>')
      + '<div class="po-body">'
      + '<div class="po-fin-section-head"><span>GP季报/资本账户/分配通知/内部表 → 统一的目标字段定义、来源别名与提取优先级</span></div>'
      + '<div class="po-fin-rule-list">'+ffHtml+'</div>'
      + '</div></div>';
  }

  /* ═══ 系统管理（用户与操作记录） ═══ */
  var ADMIN_USERS_KEY = 'qmx:admin-users:v3';
  var ADMIN_LOGS_KEY = 'qmx:admin-logs:v4';
  function _adminUsers() {
    var seed = [
      { id:'u1', name:'王敏', phone:'13800001024', dept:'投资一部', title:'投资经理', status:'active', lastLogin:'2026-08-02' },
      { id:'u2', name:'胡老师', phone:'13900008831', dept:'投后管理', title:'投后经理', status:'active', lastLogin:'2026-08-02' },
      { id:'u3', name:'菜菜', phone:'18600002209', dept:'投资二部', title:'分析师', status:'active', lastLogin:'2026-08-01' },
      { id:'u4', name:'佳琪', phone:'13700005516', dept:'投资一部', title:'', status:'active', lastLogin:'2026-08-01' }
    ];
    try { var s = localStorage.getItem(ADMIN_USERS_KEY); if (s) return JSON.parse(s); } catch(e) {}
    return seed;
  }
  function _saveAdminUsers(users) { try { localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users)); } catch(e) {} }
  function _adminLogSeed() {
    return [
      { id:'OP202608080001', time:'2026-08-08 10:12:05.128', actor:'王敏', action:'修改', module:'项目库', object:'星河智造 · 财务 · 2026H1 · 净利润', before:'1,200 万', after:'980 万' },
      { id:'OP202608020004', time:'2026-08-02 15:30:41.902', actor:'王敏', action:'确认写入', module:'文件解析', object:'星河智造 · 2026H1 财务三表', before:'待确认', after:'已写入档案' },
      { id:'OP202608020003', time:'2026-08-02 10:15:18.447', actor:'胡老师', action:'发布', module:'配置中心', object:'科目配置版本', before:'v3.2', after:'v3.3' },
      { id:'OP202608020002', time:'2026-08-02 09:12:33.061', actor:'菜菜', action:'新增', module:'系统管理', object:'用户 · 佳琪', before:'—', after:'手机 13700005516 · 投资一部' },
      { id:'OP202608020001', time:'2026-08-02 09:00:07.554', actor:'菜菜', action:'上传', module:'文件解析', object:'星河智造 · 材料', before:'—', after:'星河智造-2026Q2-财报.pdf' },
      { id:'OP202607180001', time:'2026-07-18 16:40:22.319', actor:'王敏', action:'修改', module:'基金管理', object:'众源一号 · 认缴金额', before:'50,000 万', after:'52,000 万' },
      { id:'OP202606030001', time:'2026-06-03 11:08:55.780', actor:'胡老师', action:'停用', module:'系统管理', object:'用户 · 试用账号', before:'启用', after:'停用' },
      { id:'OP202512200001', time:'2025-12-20 14:22:09.206', actor:'王敏', action:'修改', module:'项目库', object:'云枢科技 · 持股比例', before:'8.2%', after:'7.6%' }
    ];
  }
  function _adminLogs() {
    try { var s = localStorage.getItem(ADMIN_LOGS_KEY); if (s) return JSON.parse(s); } catch(e) {}
    return _adminLogSeed();
  }
  function _saveAdminLogs(logs) { try { localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(logs)); } catch(e) {} }
  function _bizDateStamp(d) {
    d = d || new Date();
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
  }
  function _nextBizId(kind, existingIds) {
    var prefix = kind + _bizDateStamp();
    var max = 0;
    (existingIds || []).forEach(function (id) {
      if (String(id).indexOf(prefix) === 0) {
        var n = parseInt(String(id).slice(prefix.length), 10);
        if (n > max) max = n;
      }
    });
    return prefix + ('0000' + (max + 1)).slice(-4);
  }
  function _pushAdminLog(entry) {
    var logs = _adminLogs();
    if (!entry.id) entry.id = _nextBizId('OP', logs.map(function (x) { return x.id; }));
    logs.unshift(entry);
    _saveAdminLogs(logs);
  }
  function _nowStamp() {
    var d = new Date();
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    function ms(n) { return ('00' + n).slice(-3); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + '.' + ms(d.getMilliseconds());
  }
  function _adminUserFormFields(u) {
    u = u || {};
    return '<label class="po-crud-field po-crud-span"><span>姓名<span class="po-req">*</span></span><input id="adminNewName" placeholder="请输入姓名" autocomplete="off" value="' + esc(u.name || '') + '"><div class="po-field-err" id="adminErrName">请填写姓名</div></label>'
      + '<label class="po-crud-field po-crud-span" style="margin-top:14px"><span>手机号<span class="po-req">*</span></span><input id="adminNewPhone" placeholder="11 位手机号" inputmode="tel" maxlength="11" autocomplete="off" value="' + esc(u.phone || '') + '"' + (u.id ? ' readonly' : '') + '><div class="po-field-err" id="adminErrPhone">请填写 11 位手机号</div></label>'
      + '<label class="po-crud-field po-crud-span" style="margin-top:14px"><span>部门</span><input id="adminNewDept" placeholder="如：投资一部" list="adminDeptList" autocomplete="off" value="' + esc(u.dept || '') + '"><datalist id="adminDeptList"><option value="投资一部"></option><option value="投资二部"></option><option value="投后管理"></option><option value="风控合规"></option></datalist></label>'
      + '<label class="po-crud-field po-crud-span" style="margin-top:14px"><span>职务</span><input id="adminNewTitle" placeholder="如：投资经理" list="adminTitleList" autocomplete="off" value="' + esc(u.title || '') + '"><datalist id="adminTitleList"><option value="投资经理"></option><option value="投后经理"></option><option value="分析师"></option><option value="合伙人"></option></datalist></label>';
  }
  function pageAdmin() {
    var users = _adminUsers();
    var tab = (FIN_STATE.tab === 'logs') ? 'logs' : 'users';
    var tabs = '<div class="po-fin-tabs"><button class="po-fin-tab' + (tab==='users'?' active':'') + '" data-act="adminTab" data-arg="users">用户</button><button class="po-fin-tab' + (tab==='logs'?' active':'') + '" data-act="adminTab" data-arg="logs">操作记录</button></div>';
    var body = '';
    if (tab === 'users') {
      var userPage = _pageSlice(_sortTimeDesc(users, 'lastLogin'), 'adminUsers');
      var userRows = userPage.rows.map(function (u) {
        return [
          u.name,
          u.phone || '—',
          u.dept || '—',
          u.title || '—',
          u.lastLogin || '—',
          { html: '<button class="po-btn po-btn-sm" data-act="adminEditUser" data-arg="' + esc(u.id) + '">编辑</button> <button class="po-btn po-btn-sm" data-act="adminDelUser" data-arg="' + esc(u.id) + '">删除</button>' }
        ];
      });
      body = '<div class="po-admin-list-bar">'
        + '<span></span>'
        + '<button type="button" class="po-btn po-btn-sm po-btn-primary" data-act="adminNewUser">新增用户</button>'
        + '</div>'
        + _dataTable(['姓名', '手机号', '部门', '职务', '最后登录', '操作'], userRows, '暂无用户')
        + _pagerBar('adminUsers', userPage.total);
    } else {
      var logs = _sortTimeDesc(_adminLogs(), 'time');
      var q = String(FIN_STATE.adminLogQ || '').trim();
      if (q) logs = logs.filter(function (r) { return r.id === q; });
      var logPage = _pageSlice(logs, 'adminLogs');
      var logRows = logPage.rows.map(function (r) {
        return [
          { html: '<button type="button" class="po-btn po-btn-sm" data-act="adminCopyLogId" data-arg="' + esc(r.id) + '" title="复制">' + esc(r.id) + '</button>' },
          r.actor, r.action, r.module, r.object, r.before || '—', r.after || '—', r.time
        ];
      });
      body = '<div class="po-admin-list-bar">'
        + '<input class="search" id="adminLogQ" placeholder="输入完整记录号" value="' + esc(q) + '" style="width:220px" />'
        + '<button type="button" class="po-btn po-btn-sm" data-act="adminLogFind">查找</button>'
        + '</div>'
        + _dataTable(['记录号', '操作人', '操作', '模块', '对象', '变更前', '变更后', '时间'], logRows, q ? '没有这条记录' : '暂无操作记录')
        + _pagerBar('adminLogs', logPage.total);
    }
    return '<div class="po-page po-page-finconfig">' + toolbar('系统管理') + '<div class="po-body">' + tabs + body + '</div></div>';
  }

  /* ═══ 对话详情（Codex Spec 三栏：左项目+会话树 / 中对话流 / 右 Workspace） ═══ */
  var CHAT_CTX_STATE = { draft: '', activeArtifactIdx: 0, wsTab: 'artifact', wsOpen: true, artifactFocus: false, projOpen: {}, spaceOpen: {} };
  function _renderChat(chatId, projectId) {
    return pageChat(chatId, projectId);
  }
  /* 收集对话中所有 AI 产出物（artifact） */
  function _collectArtifacts(messages) {
    var arts = [];
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      if (m.role !== 'ai') continue;
      if (m.artifact) arts.push(m.artifact);
      var hasCards = m.cards && m.cards.length;
      var isLong = m.text && m.text.length > 80;
      if (!m.artifact && (hasCards || isLong)) {
        var title = '';
        if (m.cards && m.cards.length) {
          for (var j=0; j<m.cards.length; j++) {
            if (m.cards[j].title) { title = m.cards[j].title; break; }
          }
        }
        if (!title) title = 'AI 生成';
        var content = '## ' + title + '\n\n' + m.text + '\n\n';
        if (m.cards && m.cards.length) {
          m.cards.forEach(function(c) {
            content += '### ' + (c.title||'') + '\n';
            if (c.rows) {
              c.rows.forEach(function(r) { content += '- **' + r[0] + '**：' + r[1] + '\n'; });
            }
            if (c.items) {
              c.items.forEach(function(it) { content += '- ' + it + '\n'; });
            }
            content += '\n';
          });
        }
        arts.push({ filename: title + '.md', title: title, content: content, ext: 'md', fromMsgIdx: i });
        m._hasArtifact = true;
        m._artifactTitle = title;
      }
    }
    return arts;
  }
  function pageChat(chatId, projectId) {
    var d = D();
    var chat = _findChat(chatId);
    var pid = projectId || (chat && chat.projectId) || null;
    var project = pid ? _findProject(d, pid) : null;
    var title = chat ? chat.title : '新对话';
    var messages = (chat && chat.messages) || [{ role: 'ai', text: '你好，我是财跃启明星助手。可以问我投后数据、查估值、生成摘要，或上传财报让我解析。', time: '刚刚' }];

    var artifacts = _collectArtifacts(messages);
    if (artifacts.length && CHAT_CTX_STATE.activeArtifactIdx >= artifacts.length) CHAT_CTX_STATE.activeArtifactIdx = 0;
    var activeArtifact = artifacts.length ? artifacts[CHAT_CTX_STATE.activeArtifactIdx] : null;

    /* 顶栏 */
    var projTagHtml = project ? ' ' + tag('po-tag-type-direct', project.name) + ' ' + stageTag(project.stage) : ' ' + tag('po-tag-type-fof', '通用对话');
    var topBar = '<div class="po-chat-topbar">'
      + '<button class="po-chat-back" data-act="chatBack" title="返回">' + ICON_BACK + '</button>'
      + '<div class="po-chat-title">' + esc(title) + projTagHtml + '</div>'
      + '<div class="po-chat-topbar-spacer"></div>'
      + (artifacts.length ? '<button type="button" class="po-chat-artcount' + (CHAT_CTX_STATE.wsOpen ? ' active' : '') + '" data-act="toggleWorkspace" aria-expanded="' + (CHAT_CTX_STATE.wsOpen ? 'true' : 'false') + '">' + artifacts.length + ' 份产出</button>' : '')
      + '<span class="po-chat-now">' + esc(chat ? chat.time : '刚刚') + '</span>'
      + '</div>';

    /* 消息流 */
    var msgHtml = messages.map(function (msg, mi) {
      return _renderChatMessage(msg, activeArtifact, mi, chatId);
    }).join('');

    /* 场景 chips */
    var scenarios = d.CHAT_SCENARIOS || [];
    var chipHtml = scenarios.map(function (s) {
      return '<button class="po-chat-chip" data-act="chatScenario" data-arg="' + esc(s.label) + '">' + esc(s.label) + '</button>';
    }).join('');

    /* Composer（Codex：固定底部，Enter 发送，支持 @ / 拖文件，张小龙精简到 1 行提示） */
    var composer = '<div class="po-chat-composer">'
      + '<div class="po-chat-chips">' + chipHtml + '</div>'
      + '<div class="po-chat-input-row">'
      + '<input id="poChatInput" type="text" class="po-chat-input" placeholder="输入消息，或拖入文件…" value="' + esc(CHAT_CTX_STATE.draft) + '" />'
      + '<button class="po-chat-send" data-act="chatSend" data-arg="' + esc(chatId) + '" title="发送 (Enter)">'
      + '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</button>'
      + '</div>'
      + '<div class="po-chat-composer-hints"><span>Enter 发送 · @ 引用 · 拖入文件</span></div>'
      + '<input type="file" id="poChatFile" multiple accept=".pdf,.docx,.xlsx,.xls,.csv,.png,.jpg" style="display:none" />'
      + '</div>';

    /* 项目与会话树已搬到全局左侧 sidebar，chat 页为 2 栏：对话流 + Workspace */
    var leftCol = '<div class="po-chat-main">'
      + topBar
      + '<div class="po-chat-stream" id="poChatStream">' + msgHtml + '</div>'
      + composer
      + '</div>';

    /* 右栏：Workspace（精简到 2 tabs：产出物 / 试算校验） */
    var workspace = CHAT_CTX_STATE.wsOpen
      ? '<aside class="po-chat-ws" aria-label="产出物面板">' + _renderChatWorkspace(d, project, chat, artifacts, activeArtifact, messages) + '</aside>'
      : '';

    return '<div class="po-page po-page-chat' + (CHAT_CTX_STATE.artifactFocus ? ' is-artifact-focus' : '') + '">'
      + '<div class="po-chat-layout' + (CHAT_CTX_STATE.artifactFocus ? ' is-artifact-focus' : '') + '">'
      + leftCol
      + workspace
      + '</div></div>';
  }

  /* —— 左面板：项目树 + 会话列表（Codex 左栏，300px 可折叠） —— */
  /* —— _renderChatLeft 已删除：项目与会话树迁到全局 sidebar —— */
  /* —— 会话卡片行（Codex Task Card：名称 + 状态点 + 时间 + hover ⋯） —— */
  function _chatRow(c, curChatId) {
    var active = c.id === curChatId;
    var route = c.type === 'project' ? 'project/' + c.projectId + '/chat/' + c.id : 'chat/' + c.id;
    var statusDot = active ? ' running' : '';
    return '<div class="po-cl-chat-row' + (active ? ' active' : '') + '" data-nav="' + route + '">'
      + '<span class="po-cl-status-dot' + statusDot + '"></span>'
      + '<span class="po-cl-chat-name">' + esc(c.title) + '</span>'
      + '<span class="po-cl-chat-time">' + esc(c.time || '') + '</span>'
      + '<span class="po-cl-menu" data-act="chatTaskMenu" data-arg="' + esc(c.id) + '" title="任务菜单">⋯</span>'
      + '</div>';
  }

  /* —— 右栏 Workspace（精简单栏：仅产出物预览，无 tab 切换） —— */
  function _renderChatWorkspace(d, project, chat, artifacts, activeArtifact, messages) {
    var tabs = artifacts.map(function (art, idx) {
      return '<button type="button" class="po-ws-file-tab' + (idx === CHAT_CTX_STATE.activeArtifactIdx ? ' active' : '') + '" data-act="pickArtifact" data-arg="' + idx + '" title="' + esc(art.filename || art.title) + '">'
        + '<span>' + ICON_FILE + '</span><span class="po-ws-file-tab-name">' + esc(art.filename || art.title) + '</span></button>';
    }).join('');
    var header = '<div class="po-ws-tabbar">' + tabs
      + '<button type="button" class="po-ws-tab-add" data-act="workspaceAdd" aria-label="打开其他产出">+</button>'
      + '<span class="po-ws-header-spacer"></span>'
      + '<button type="button" class="po-ws-focus" data-act="toggleArtifactFocus" aria-pressed="' + (CHAT_CTX_STATE.artifactFocus ? 'true' : 'false') + '" aria-label="' + (CHAT_CTX_STATE.artifactFocus ? '退出产出物专注模式' : '放大只看产出物') + '" title="' + (CHAT_CTX_STATE.artifactFocus ? '退出专注模式' : '放大只看产出物') + '">' + (CHAT_CTX_STATE.artifactFocus ? '↙' : '⤢') + '</button>'
      + '<button type="button" class="po-ws-close" data-act="toggleWorkspace" aria-label="关闭产出物面板" title="关闭">×</button></div>';

    var currentSpace = _currentSpace();
    var contextName = project ? project.name : (currentSpace ? currentSpace.label : '独立任务');
    var contextBar = '<div class="po-ws-contextbar"><span>' + ICON_FOLDER + '</span><span>' + esc(contextName) + '</span><b>›</b><strong>' + esc(activeArtifact ? (activeArtifact.filename || activeArtifact.title) : '产出物') + '</strong></div>';

    var body = activeArtifact ? _renderArtifactPreview(activeArtifact) : '<div class="po-ws-empty">暂无产出物</div>';

    return '<div class="po-ws">' + header + contextBar + '<div class="po-ws-body">' + body + '</div></div>';
  }

  /* —— Workspace：数据差异（试算不平 + 跨期变动，映射 T37/T38 校验结果） —— */
  function _renderWsDiff(d, project) {
    var html = '<div class="po-ws-h">数据差异 <span class="po-ws-h-sub">试算不平衡项与跨期变动 · 均来自已确认数据</span></div>';
    var items = [];
    if (project) {
      (project.periods || []).forEach(function (pd) {
        if (pd.status === 'pending' && pd.changedFields && pd.changedFields.length) {
          pd.changedFields.forEach(function (f) {
            items.push({ label: project.name + ' · ' + pd.label + ' · ' + f, desc: '字段变动待确认', cls: 'pending' });
          });
        }
      });
    }
    /* 从 CONFIRMS 取试算不平项 */
    var confirms = d.CONFIRMS || {};
    Object.keys(confirms).forEach(function (k) {
      var c = confirms[k];
      var tb = c.trialBalance || {};
      (tb.checks || []).forEach(function (ch) {
        if (ch.result !== 'pass') {
          items.push({ label: c.projectName + ' · ' + ch.name, desc: ch.detail || '试算不平', cls: 'fail' });
        }
      });
    });
    html += items.length ? '<div class="po-ws-list">' + items.map(function (it) {
      return '<div class="po-ws-item' + (it.cls === 'fail' ? ' fail' : '') + '">'
        + '<span class="po-ws-item-label">' + esc(it.label) + '</span>'
        + '<span class="po-ws-item-desc">' + esc(it.desc) + '</span>'
        + '</div>';
    }).join('') + '</div>' : '<div class="po-ws-empty">暂无数据差异</div>';
    return html;
  }

  /* —— Workspace：任务日志（解析/确认事件流，映射 T20/T21 溯源留痕） —— */
  function _renderWsLog(d, project) {
    var f = d.FILES || {};
    var html = '<div class="po-ws-h">任务日志 <span class="po-ws-h-sub">解析与确认事件流 · 全程留痕可溯源</span></div>';
    var logs = [];
    (f.pending || []).forEach(function (i) {
      logs.push({ t: '解析完成 · 待确认', d: i.name + ' → ' + (i.conflictCount + i.firstMapCount + i.abnormalCount) + ' 项待处理', cls: 'pending', time: '刚刚' });
    });
    (f.done || []).forEach(function (i) {
      logs.push({ t: '已确认写入', d: i.name + ' · ' + i.fields + ' 字段 · ' + (i.confirmedBy||'') + ' 确认', cls: 'done', time: i.confirmedAt || '' });
    });
    (f.abnormal || []).forEach(function (i) {
      logs.push({ t: '解析异常', d: i.name + ' · ' + (i.reason||''), cls: 'fail', time: '—' });
    });
    return html + '<div class="po-ws-log">' + logs.map(function (l) {
      return '<div class="po-ws-log-row"><span class="po-ws-log-time">' + esc(l.time) + '</span>'
        + '<span class="po-ws-log-dot ' + l.cls + '"></span>'
        + '<div class="po-ws-log-main"><strong>' + esc(l.t) + '</strong><span>' + esc(l.d) + '</span></div></div>';
    }).join('') + '</div>';
  }

  /* —— Workspace：项目档案（企业信息 + 条款 T22 + 联系人 T25 + 银行账户 T26 + 风险 T29 + 跟进 T28） —— */
  function _renderWsBrowser(d, project) {
    if (!project) return '<div class="po-ws-empty">独立对话无项目档案</div>';
    var html = '<div class="po-ws-h">项目档案 <span class="po-ws-h-sub">' + esc(project.name) + ' · 企业信息与投后档案</span></div>';

    /* 企业信息（T2） */
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">企业信息</div><div class="po-ws-grid">'
      + '<div class="po-ws-cell"><span>统一社会信用代码</span><strong>' + esc(project.creditCode || '91320594MA1XQ8C7X2') + '</strong></div>'
      + '<div class="po-ws-cell"><span>所属行业</span><strong>' + esc(project.industry || '—') + '</strong></div>'
      + '<div class="po-ws-cell"><span>注册地</span><strong>' + esc(project.city || '—') + '</strong></div>'
      + '<div class="po-ws-cell"><span>生命周期</span><strong>' + esc(project.stage === 'post' ? '投后管理' : (project.stage === 'deal' ? '投资交割' : '投前储备')) + '</strong></div>'
      + '</div></div>';

    /* 关键条款（T22 deal_terms，从项目数据读取，缺则默认） */
    var terms = project.terms || [
      { name: '回购条款', detail: '业绩不达标触发回购', has: true },
      { name: '董事会席位', detail: '1 席 · 重大事项否决', has: true },
      { name: '反稀释条款', detail: '加权平均', has: true },
      { name: '领售权', detail: '未约定', has: false },
    ];
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">关键条款 <span class="po-ws-sec-n">' + terms.length + '</span></div><div class="po-ws-terms">'
      + terms.map(function (t) {
        return '<div class="po-ws-term"><span class="po-ws-term-name">' + esc(t.name) + '</span><span class="po-ws-term-detail">' + esc(t.detail) + '</span>'
          + (t.has ? tag('po-tag-status-done', '已约定') : tag('po-tag-status-pending', '未约定')) + '</div>';
      }).join('')
      + '</div></div>';

    /* 联系人（T25） */
    var contacts = project.contacts || [
      { name: '张伟', role: 'CFO', phone: '138****9021' },
      { name: '李明', role: '董事会秘书', phone: '186****3345' },
    ];
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">联系人</div><div class="po-ws-contacts">'
      + contacts.map(function (c) {
        return '<div class="po-ws-contact"><strong>' + esc(c.name) + (c.primary ? ' ★' : '') + '</strong><span>' + esc(c.role) + '</span><span class="po-ws-contact-phone">' + esc(c.phone) + '</span></div>';
      }).join('')
      + '</div></div>';

    /* 银行账户（T26） */
    var accounts = project.bankAccounts || [
      { holder: '星河智造（苏州）科技有限公司', bank: '招商银行 · 苏州工业园区支行', no: '5129 **** **** 0821' },
    ];
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">银行账户</div><div class="po-ws-accounts">'
      + accounts.map(function (a) {
        return '<div class="po-ws-account"><strong>' + esc(a.holder) + '</strong><span>' + esc(a.bank) + ' · ' + esc(a.no) + (a.use ? ' · ' + esc(a.use) : '') + '</span></div>';
      }).join('')
      + '</div></div>';

    /* 风险清单（T29） */
    var risks = project.risks || [];
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">风险清单 <span class="po-ws-sec-n">' + risks.length + '</span></div><div class="po-ws-risks">'
      + (risks.length ? risks.map(function (r) {
          return '<div class="po-ws-risk' + (r.level === '中' ? ' mid' : (r.level === '高' ? ' high' : ' low')) + '"><span class="po-ws-risk-lv">' + esc(r.level) + '</span><div><strong>' + esc(r.name) + '</strong><span>' + esc(r.detail) + '</span></div></div>';
        }).join('') : '<div class="po-ws-empty">暂无风险</div>')
      + '</div></div>';

    /* 跟进待办（T28） */
    var fups = project.followups || [];
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">跟进待办 <span class="po-ws-sec-n">' + fups.length + '</span></div><div class="po-ws-followups">'
      + (fups.length ? fups.map(function (f) {
          return '<div class="po-ws-followup"><span class="po-ws-followup-dot"></span><div><strong>' + esc(f.title) + '</strong><span>' + esc(f.owner||'') + ' · 截止 ' + esc(f.due||'') + '</span></div><span class="po-tag po-tag-status-pending">待办</span></div>';
        }).join('') : '<div class="po-ws-empty">暂无待办</div>')
      + '</div></div>';

    return html;
  }

  /* —— Workspace：试算校验（映射 T37 规则 + T38 结果） —— */
  function _renderWsTests(d, project) {
    var html = '<div class="po-ws-h">试算校验 <span class="po-ws-h-sub">T37 校验规则 · T38 结果留痕</span></div>';
    var rules = (d.FINANCE_CONFIGS && d.FINANCE_CONFIGS.configs && d.FINANCE_CONFIGS.configs['tenant-1'] && d.FINANCE_CONFIGS.configs['tenant-1'].rules) || [];
    var results = [];
    Object.keys(d.CONFIRMS || {}).forEach(function (k) {
      var c = d.CONFIRMS[k];
      var tb = c.trialBalance || {};
      (tb.checks || []).forEach(function (ch) {
        results.push({ rule: ch.name, file: c.fileName, result: ch.result === 'pass' ? 'pass' : 'fail', detail: ch.detail || '' });
      });
    });
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">校验规则 <span class="po-ws-sec-n">' + rules.length + '</span></div><div class="po-ws-rules">'
      + rules.map(function (r) {
        return '<div class="po-ws-rule"><span class="po-ws-rule-name">' + esc(r.name) + '</span><span class="po-ws-rule-formula">' + esc(r.formula) + '</span></div>';
      }).join('')
      + '</div></div>';
    html += '<div class="po-ws-sec"><div class="po-ws-sec-h">校验结果</div><div class="po-ws-results">'
      + (results.length ? results.map(function (r) {
          return '<div class="po-ws-result' + (r.result === 'pass' ? '' : ' fail') + '"><span class="po-ws-result-icon">' + (r.result === 'pass' ? '✓' : '✕') + '</span>'
            + '<div class="po-ws-result-main"><strong>' + esc(r.rule) + '</strong><span>' + esc(r.file) + '</span></div>'
            + '<span class="po-ws-result-status">' + (r.result === 'pass' ? '通过' : '异常') + '</span></div>';
        }).join('') : '<div class="po-ws-empty">暂无校验结果</div>')
      + '</div></div>';
    return html;
  }

  /* —— 产出物预览面板（对齐 agent-demo ArtifactPreviewPane） —— */
  function _renderArtifactPreview(art) {
    var isMd = art.ext === 'md' || art.ext === 'markdown';
    var bodyHtml = '';
    if (isMd) {
      /* 简易 Markdown 渲染 */
      var lines = (art.content || '').split('\n');
      var html = '';
      var inList = false;
      lines.forEach(function(line) {
        if (/^###\s/.test(line)) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h3 class="po-art-h3">' + esc(line.replace(/^###\s*/, '')) + '</h3>';
        } else if (/^##\s/.test(line)) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h2 class="po-art-h2">' + esc(line.replace(/^##\s*/, '')) + '</h2>';
        } else if (/^- \*\*/.test(line)) {
          if (!inList) { html += '<ul class="po-art-list">'; inList = true; }
          var kv = line.replace(/^- \*\*/, '').split('**：');
          html += '<li><strong>' + esc(kv[0]||'') + '</strong>：' + esc((kv[1]||'')) + '</li>';
        } else if (/^- /.test(line) && inList) {
          html += '<li>' + esc(line.replace(/^- /,'')) + '</li>';
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          if (line.trim()) html += '<p class="po-art-p">' + esc(line) + '</p>';
        }
      });
      if (inList) html += '</ul>';
      bodyHtml = '<div class="po-art-body">' + html + '</div>';
    } else {
      bodyHtml = '<div class="po-art-body"><pre class="po-art-pre">' + esc(art.content || '') + '</pre></div>';
    }
    return '<div class="po-art-preview">'
      + '<header class="po-art-head">'
      + '<div class="po-art-head-l"><span class="po-art-head-icon">' + ICON_FILE + '</span><span class="po-art-fname">' + esc(art.filename) + '</span></div>'
      + '<div class="po-art-head-r">'
      +   '<button class="po-art-btn" data-act="copyArtifact" title="复制内容">复制</button>'
      +   '<button class="po-art-btn" data-act="downloadArtifact" title="下载 .md">下载</button>'
      + '</div>'
      + '</header>'
      + bodyHtml
      + '</div>';
  }

  /* —— 单条消息渲染（含产出物链接卡） —— */
  /* Thinking 折叠态：chatId:msgIdx -> bool */
  var THINKING_OPEN = {};
  function _renderChatMessage(msg, activeArtifact, msgIdx, chatId) {
    var hasArt = msg._hasArtifact;
    var artTitle = msg._artifactTitle;
    if (msg.role === 'user') {
      return '<div class="po-msg po-msg-user">'
        + '<div class="po-msg-bubble po-msg-bubble-user">' + esc(msg.text) + '</div>'
        + (msg.time ? '<div class="po-msg-time">' + esc(msg.time) + '</div>' : '')
        + '</div>';
    }

    /* AI 消息体：thinking（折叠） + tools（工具调用） + 正文/产出物 + result（结果） */
    var bodyHtml = '';

    /* 1) Thinking 思考过程（默认折叠，张小龙：克制不打扰） */
    if (msg.thinking && msg.thinking.length) {
      var tkey = chatId + ':' + msgIdx;
      var tOpen = THINKING_OPEN[tkey] === true;
      bodyHtml += '<div class="po-thinking' + (tOpen ? ' open' : '') + '" data-act="toggleThinking" data-arg="' + esc(tkey) + '">'
        + '<div class="po-thinking-h"><span class="po-thinking-icon">' + (tOpen ? '▾' : '▸') + '</span>'
        + '<span class="po-thinking-label">AI 思考 · ' + msg.thinking.length + ' 步</span></div>'
        + (tOpen ? '<div class="po-thinking-body">' + msg.thinking.map(function (s, si) {
            return '<div class="po-thinking-step"><span class="po-thinking-step-n">' + (si + 1) + '</span>' + esc(s) + '</div>';
          }).join('') + '</div>' : '')
        + '</div>';
    }

    /* 2) Tool Calls（执行的工具） */
    if (msg.tools && msg.tools.length) {
      bodyHtml += '<div class="po-tool-group">' + msg.tools.map(function (t) {
        var stLabel = t.status === 'done' ? '完成' : (t.status === 'running' ? '执行中' : t.status);
        var stCls = t.status === 'done' ? ' done' : (t.status === 'running' ? ' running' : '');
        return '<div class="po-tool-row' + stCls + '">'
          + '<span class="po-tool-icon">' + ICON_TOOL + '</span>'
          + '<span class="po-tool-name">' + esc(t.name) + '</span>'
          + '<span class="po-tool-detail">' + esc(t.detail || '') + '</span>'
          + '<span class="po-tool-status' + stCls + '">' + esc(stLabel) + '</span>'
          + '</div>';
      }).join('') + '</div>';
    }

    /* 3) 正文 / 产出物 teaser + 卡片 */
    if (hasArt && activeArtifact && activeArtifact.title === artTitle) {
      bodyHtml += '<div class="po-msg-ai-teaser">' + esc(msg.text.slice(0, 100)) + (msg.text.length > 100 ? '…' : '') + '</div>'
        + '<div class="po-panel-link-card active" data-act="pickArtifact" data-arg="' + msgsIdxForArtifact(msg) + '">'
        + '<span class="po-panel-link-icon">' + ICON_FILE + '</span>'
        + '<div class="po-panel-link-body"><strong>' + esc(artTitle || 'AI 产出') + '</strong><span>' + (CHAT_CTX_STATE.wsOpen ? '完整内容已在右侧面板打开' : '点击在右侧打开完整内容') + '</span></div>'
        + '<span class="po-panel-link-arrow">' + ICON_ARROW + '</span>'
        + '</div>';
    } else if (hasArt) {
      var ai = _findArtifactIdxByTitle(msg._artifactTitle);
      bodyHtml += '<div class="po-msg-ai-teaser">' + esc(msg.text.slice(0, 100)) + (msg.text.length > 100 ? '…' : '') + '</div>'
        + '<div class="po-panel-link-card" data-act="pickArtifact" data-arg="' + (ai >= 0 ? ai : 0) + '">'
        + '<span class="po-panel-link-icon">' + ICON_FILE + '</span>'
        + '<div class="po-panel-link-body"><strong>' + esc(artTitle || 'AI 产出') + '</strong><span>点击查看完整内容</span></div>'
        + '<span class="po-panel-link-arrow">' + ICON_ARROW + '</span>'
        + '</div>';
    } else {
      bodyHtml += '<div class="po-msg-bubble po-msg-bubble-ai">' + esc(msg.text) + '</div>';
      if (msg.cards && msg.cards.length) {
        bodyHtml += '<div class="po-msg-cards">' + msg.cards.map(_renderChatCard).join('') + '</div>';
      }
    }

    /* 4) Result（工具执行结果，可点击跳转） */
    if (msg.result) {
      bodyHtml += _renderChatResult(msg.result);
    }

    return '<div class="po-msg po-msg-ai">'
      + '<div class="po-msg-avatar">星</div>'
      + '<div class="po-msg-body">'
      + bodyHtml
      + (msg.time ? '<div class="po-msg-time">' + esc(msg.time) + '</div>' : '')
      + '</div></div>';
  }

  /* —— Result 结果行（string 或 {text, nav}） —— */
  function _renderChatResult(r) {
    var text = typeof r === 'string' ? r : (r && r.text) || '';
    var nav = (typeof r === 'object' && r && r.nav) || null;
    var cls = 'po-result-row' + (nav ? ' po-result-row-nav' : '');
    var attrs = nav ? ' data-act="chatResultNav" data-arg="' + esc(nav) + '"' : '';
    return '<div class="' + cls + '"' + attrs + '>'
      + '<span class="po-result-icon">' + ICON_CHECK + '</span>'
      + '<span class="po-result-text">' + esc(text) + '</span>'
      + (nav ? '<span class="po-result-arrow">' + ICON_ARROW + '</span>' : '')
      + '</div>';
  }

  /* Helper：根据消息的 artifact title 找到在 artifacts 数组中的 index */
  function _findArtifactIdxByTitle(title) {
    var cur = _ctx && _ctx.state && _ctx.state.route;
    var m = cur ? /^chat\/(.+)$/.exec(cur) : null;
    if (!m) return 0;
    var chat2 = _findChat(m[1]);
    var msgs = (chat2 && chat2.messages) || [];
    var arts = _collectArtifacts(msgs);
    for (var ai2 = 0; ai2 < arts.length; ai2++) if (arts[ai2].title === title) return ai2;
    return 0;
  }
  function msgsIdxForArtifact(msg) {
    var cur = _ctx && _ctx.state && _ctx.state.route;
    var m = cur ? /^chat\/(.+)$/.exec(cur) : null;
    if (!m) return 0;
    var chat2 = _findChat(m[1]);
    var msgs = (chat2 && chat2.messages) || [];
    var arts = _collectArtifacts(msgs);
    var title = msg._artifactTitle;
    for (var ai3 = 0; ai3 < arts.length; ai3++) if (arts[ai3].title === title) return ai3;
    return 0;
  }

  /* —— AI 结果卡（brief 摘要 / flags 建议 / table 数据表 / metric 指标） —— */
  function _renderChatCard(card) {
    var body = '';
    if (card.type === 'brief' || card.type === 'metric') {
      body = '<table class="po-card-table">' + (card.rows || []).map(function (r) {
        return '<tr><td class="po-card-k">' + esc(r[0]) + '</td><td class="po-card-v">' + esc(r[1]) + '</td></tr>';
      }).join('') + '</table>';
    } else if (card.type === 'flags') {
      body = '<ul class="po-card-flags">' + (card.items || []).map(function (it) {
        return '<li>' + esc(it) + '</li>';
      }).join('') + '</ul>';
    } else if (card.type === 'table') {
      var head = (card.headers || []).map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');
      var rows = (card.rows || []).map(function (r) {
        return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
      }).join('');
      body = '<table class="po-card-table po-card-table-grid"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>';
    }
    return '<div class="po-msg-card"><div class="po-msg-card-h">' + esc(card.title || '') + '</div><div class="po-msg-card-bd">' + body + '</div></div>';
  }

  /* —— 右侧上下文面板 —— */
  function _renderChatSidePanel(d, project, chat) {
    var html = '';
    if (project) {
      /* 项目绑定：项目摘要 + 材料 + 期间数据 */
      html += '<div class="po-side-sect"><div class="po-side-h">项目信息</div>'
        + '<div class="po-side-info">'
        + '<div class="po-side-info-row"><span>行业</span>' + esc(project.industry || '—') + '</div>'
        + '<div class="po-side-info-row"><span>投资金额</span>' + fmtMoney(project.investAmount) + '</div>'
        + '<div class="po-side-info-row"><span>持股比例</span>' + (project.ratio||0) + '%</div>'
        + '<div class="po-side-info-row"><span>最新估值</span>' + fmtMoney(project.valuation) + '</div>'
        + '</div></div>';
      /* 期间数据 */
      if (project.periods && project.periods.length) {
        var finRows = '<tr><th>科目</th>' + project.periods.map(function (p) { return '<th>' + esc(p.label) + '</th>'; }).join('') + '</tr>';
        var fields = [['revenue','营业收入'],['netProfit','净利润'],['totalAssets','资产总计'],['equity','所有者权益']];
        fields.forEach(function (f) {
          finRows += '<tr><td>' + f[1] + '</td>' + project.periods.map(function (p) {
            return '<td class="po-cell-num">' + (p[f[0]] != null ? p[f[0]].toLocaleString() : '—') + '</td>';
          }).join('') + '</tr>';
        });
        html += '<div class="po-side-sect"><div class="po-side-h">财务期间数据</div>'
          + '<div class="po-side-scroll"><table class="po-card-table po-card-table-grid">' + finRows + '</table></div></div>';
      }
      /* 材料 */
      html += '<div class="po-side-sect"><div class="po-side-h">相关材料</div><div class="po-side-list">'
        + '<div class="po-side-file" data-act="chatFileView" data-arg="' + esc(project.name) + '-2026H1-财报.pdf"><span class="po-side-file-name">' + esc(project.name) + '-2026H1-财报.pdf</span><span class="po-tag po-tag-status-pending">待确认</span></div>'
        + '<div class="po-side-file" data-act="chatFileView" data-arg="' + esc(project.name) + '-2025年度财报.pdf"><span class="po-side-file-name">' + esc(project.name) + '-2025年度财报.pdf</span><span class="po-tag po-tag-status-done">已确认</span></div>'
        + '</div></div>';
      /* 快捷操作 */
      html += '<div class="po-side-sect"><div class="po-side-h">快捷操作</div><div class="po-side-actions">'
        + '<button class="po-btn po-btn-sm po-btn-primary" data-act="chatGotoConfirm" data-arg="' + esc(project.id) + '">去确认数据</button>'
        + '<button class="po-btn po-btn-sm" data-nav="project/' + esc(project.id) + '">查看项目详情</button>'
        + '</div></div>';
    } else {
      /* 独立对话：无项目上下文，空面板 */
    }
    return html;
  }

  function _findProject(d, pid) {
    var projects = d.PROJECTS || [];
    for (var i = 0; i < projects.length; i++) if (projects[i].id === pid) return projects[i];
    return null;
  }

  /* —— 对话发送：追加用户消息 + AI 回复（匹配 QA 或默认） —— */
  function _chatSend(chatId, text) {
    var chat = _findChat(chatId);
    if (!chat) {
      /* 运行时对话不存在则新建 */
      chat = { id: chatId, type: 'standalone', title: text.length > 16 ? text.slice(0,16)+'…' : text, time:'刚刚', preview: text, messages: [] };
      RUNTIME_CHATS.unshift(chat);
    }
    chat.messages = chat.messages || [];
    chat.messages.push({ role: 'user', text: text, time: '刚刚' });
    var matched = _matchQA(text);
    var aiText, cards;
    if (matched) {
      aiText = matched.answer + '。' + matched.calc.replace(/<[^>]+>/g, '');
      cards = [{ type:'metric', title:'问数结果', rows:[['答案', matched.answer], ['数据来源', matched.source]] }];
    } else {
      aiText = '收到。关于「' + text + '」，我已记录。你可以试试问我：账面价值合计、盈利项目占比、GP 收齐情况，或上传财报让我解析确认。';
      cards = [];
    }
    chat.messages.push({ role: 'ai', text: aiText, time: '刚刚', cards: cards });
    chat.preview = aiText.length > 44 ? aiText.slice(0,44)+'…' : aiText;
    navigate('chat/' + chatId);
    /* 滚动到底部 */
    setTimeout(function () {
      var stream = document.getElementById('poChatStream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    }, 50);
  }

  /* —— 会话 ⋯ 菜单（Codex Task Card 菜单：重命名/复制/归档/删除） —— */
  function showChatTaskMenu(chatId) {
    var root = _ctx && _ctx.rootEl;
    if (!root) return;
    var chat = _findChat(chatId);
    if (!chat) return;
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:9998;display:flex;align-items:flex-start;justify-content:center;padding-top:180px';
    overlay.innerHTML = '<div class="po-task-menu" onclick="event.stopPropagation()">'
      + '<div class="po-task-menu-h"><strong>' + esc(chat.title) + '</strong><button class="po-modal-x" data-tm-close="1">×</button></div>'
      + '<div class="po-task-menu-item" data-tm-act="rename">重命名</div>'
      + '<div class="po-task-menu-item" data-tm-act="duplicate">复制</div>'
      + '<div class="po-task-menu-item" data-tm-act="archive">归档</div>'
      + '<div class="po-task-menu-item danger" data-tm-act="delete">删除</div>'
      + '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelectorAll('[data-tm-close]').forEach(function (b) {
      b.addEventListener('click', function () { overlay.remove(); });
    });
    overlay.querySelectorAll('[data-tm-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-tm-act');
        overlay.remove();
        if (a === 'rename') {
          var newName = prompt('重命名会话：', chat.title);
          if (newName && newName.trim()) { chat.title = newName.trim(); toast('已重命名为「' + newName.trim() + '」'); navigate('chat/' + chatId); }
        } else if (a === 'duplicate') {
          var copy = JSON.parse(JSON.stringify(chat));
          copy.id = 'rcp-' + Date.now(); copy.title = chat.title + '（副本）';
          RUNTIME_CHATS.unshift(copy);
          toast('已复制会话');
        } else if (a === 'archive') {
          toast('已归档「' + chat.title + '」');
        } else if (a === 'delete') {
          if (confirm('确认删除会话「' + chat.title + '」？')) {
            var all = RUNTIME_CHATS;
            for (var i = 0; i < all.length; i++) { if (all[i].id === chatId) { all.splice(i, 1); break; } }
            toast('已删除会话');
            navigate('home');
          }
        }
      });
    });
  }

  /* ═══ 路由分发 ═══ */
  var PE_POST_PAGES = {
    render: function (route, ctx) {
      _ctx = ctx;
      var r = route || 'home';
      var m;
      if (r === 'home') return pageHome();
      if (r === 'file-parse') return pageFileParse();
      if ((m = /^confirm\/(.+)$/.exec(r))) return pageConfirm(m[1]);
      if (r === 'projects') return pageProjects();
      /* 修复贪婪正则：project/<id> 不含 /，放行 project/<id>/chat/<cid> 给对话模块 */
      if ((m = /^project\/([^/]+)$/.exec(r))) return pageProjectDetailV2(m[1]);
      if (r === 'fund') return pageFund();
      if ((m = /^fund\/(.+)$/.exec(r))) return pageFundDetailV2(m[1]);
      if (r === 'fund-snapshot') return pageFundSnapshot();
      if (r === 'snapshot') return pageSnapshotV2();
      if (r === 'post-browser') return pageBrowser();
      /* 专家智库由 pages-pe.js 的会议 / 纪要 / 对接页负责；能力市场仍保留 AI 专家卡。 */
      if (r === 'skills') return pagePESkills();
      if (r === 'redblue') return pageRedBlue();
      if (r === 'redblue-setup') return pageRedBlueSetup();
      /* 科目配置（财评助手迁移） */
      if (r === 'finance-config') return pageFinanceConfig();
      if (r === 'field-config') return pageFieldConfig();
      /* 系统管理 */
      if (r === 'admin') return pageAdmin();
      /* 对话详情：委托给 PE_CHAT_PAGES 模块（chat/<id> 与 project/<id>/chat/<cid>） */
      if ((m = /^chat\/(.+)$/.exec(r))) return _renderChat(m[1], null);
      if ((m = /^project\/([^/]+)\/chat\/(.+)$/.exec(r))) return _renderChat(m[2], m[1]);
      return null; /* 不认识的路由返回 null，由 pages-pe.js 回退 */
    },
    bind: function (root) {
      if (!root) return;
      /* data-nav */
      root.querySelectorAll('[data-nav]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          var r = el.getAttribute('data-nav');
          if (r) navigate(r);
        });
      });
      /* data-act */
      root.querySelectorAll('[data-act]').forEach(function (el) {
        if (el.tagName === 'SELECT') {
          el.addEventListener('change', function () {
            var act2 = el.getAttribute('data-act');
            var arg2 = el.getAttribute('data-arg') || '';
            if (act2 === 'listPageSize') arg2 = String(arg2).split('|')[0] + '|' + el.value;
            if (act2 === 'projSaPeriod') arg2 = String(arg2).split('|')[0] + '|' + el.value;
            if (act2 === 'confirmMoneyUnit' || act2 === 'kvMoneyUnit') arg2 = String(arg2) + '|' + el.value;
            if (act2 === 'setConfirmMoneyUnit' || act2 === 'setGlobalMoneyUnit') arg2 = el.value;
            PE_POST_PAGES.act(act2, arg2);
          });
          return;
        }
        el.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var act = el.getAttribute('data-act');
          var arg = el.getAttribute('data-arg') || '';
          PE_POST_PAGES.act(act, arg);
        });
      });
      /* 候选字段点击 → 定位原文 */
      root.querySelectorAll('[data-field-idx]').forEach(function (el) {
        el.addEventListener('click', function () {
          var idx = el.getAttribute('data-field-idx');
          var leftPane = root.querySelector('.po-confirm-left');
          if (leftPane) {
            leftPane.querySelectorAll('.po-doc-hi').forEach(function(h){ h.classList.remove('active'); });
            var target = leftPane.querySelector('.po-doc-hi[data-field-idx="' + idx + '"]');
            if (target) { target.classList.add('active'); target.scrollIntoView({behavior:'smooth',block:'center'}); }
          }
        });
      });
      /* 编辑态输入框实时同步到 FIN_STATE */
      root.querySelectorAll('[data-fin-edit-input]').forEach(function (el) {
        el.addEventListener('input', function () {
          var k = el.getAttribute('data-edit');
          if (k === 'metric-name') FIN_STATE.editName = el.value;
          else if (k === 'metric-unit') FIN_STATE.editUnit = el.value;
          else if (k === 'metric-cat') FIN_STATE.editCat = el.value;
          else if (k === 'metric-custom-formula') FIN_STATE.editCustomFormula = el.value;
          else if (k === 'metric-periodRule') FIN_STATE.editPeriodRule = el.value;
          else if (k === 'metric-scope') FIN_STATE.editMetricScope = el.value;
          else if (k === 'metric-missing') FIN_STATE.editMetricMissing = el.value;
          else if (k === 'rule-name') FIN_STATE.editRuleName = el.value;
          else if (k === 'rule-type') FIN_STATE.editRuleType = el.value;
          else if (k === 'rule-stmt') FIN_STATE.editRuleStmt = el.value;
          else if (k === 'rule-formula') FIN_STATE.editRuleFormula = el.value;
          else if (k === 'rule-tolerance') FIN_STATE.editRuleTolerance = el.value;
          else if (k === 'rule-exception') FIN_STATE.editRuleException = el.value;
          else if (k === 'period-name') FIN_STATE.editPeriodName = el.value;
          else if (k === 'period-desc') FIN_STATE.editPeriodDesc = el.value;
          else if (k === 'ff-name') FIN_STATE.editFFName = el.value;
          else if (k === 'ff-unit') FIN_STATE.editFFUnit = el.value;
          else if (k === 'ff-aliases') FIN_STATE.editFFAliases = el.value;
          else if (k === 'ff-priority') FIN_STATE.editFFPriority = el.value;
          else if (k === 'ff-method') FIN_STATE.editFFMethod = el.value;
          else if (k === 'ff-layer') FIN_STATE.editFFLayer = el.value;
        });
        if (el.tagName === 'SELECT') el.addEventListener('change', function () {
          var k2 = el.getAttribute('data-edit');
          if (k2 === 'ff-priority') FIN_STATE.editFFPriority = el.value;
          else if (k2 === 'ff-method') FIN_STATE.editFFMethod = el.value;
          else if (k2 === 'ff-layer') FIN_STATE.editFFLayer = el.value;
          else if (k2 === 'metric-periodRule') FIN_STATE.editPeriodRule = el.value;
          else if (k2 === 'metric-scope') FIN_STATE.editMetricScope = el.value;
          else if (k2 === 'metric-missing') FIN_STATE.editMetricMissing = el.value;
          else if (k2 === 'rule-type') FIN_STATE.editRuleType = el.value;
          else if (k2 === 'rule-stmt') FIN_STATE.editRuleStmt = el.value;
        });
      });
      /* 冲突 radio */
      root.querySelectorAll('[data-conflict-idx]').forEach(function (el) {
        el.addEventListener('change', function () {
          toast('已选择「' + el.value + '」，提交时写入');
        });
      });
      root.querySelectorAll('[data-structured-value]').forEach(function (el) {
        function _persistStructured() {
          if (!CURRENT_CONFIRM) return;
          STRUCTURED_VALUES[CURRENT_CONFIRM] = STRUCTURED_VALUES[CURRENT_CONFIRM] || {};
          var sk = el.getAttribute('data-structured-value');
          var unit = el.getAttribute('data-money-unit');
          var v = el.value;
          if (el.getAttribute('data-money-base') === 'yuan') {
            STRUCTURED_VALUES[CURRENT_CONFIRM][sk] = _globalDisplayToYuanString(v);
          } else if (unit && el.type === 'number') {
            STRUCTURED_VALUES[CURRENT_CONFIRM][sk] = _composeMoneyValue(v, unit);
          } else {
            STRUCTURED_VALUES[CURRENT_CONFIRM][sk] = v;
          }
          /* 用户改过＝已核对：立刻去掉不确定样式；全无则收起页级说明 */
          if (el.classList && el.classList.contains('is-uncertain')) {
            el.classList.remove('is-uncertain');
          }
          var wrap = el.closest && el.closest('.po-field-val-wrap, .po-long-wrap, .po-field-input-wrap');
          if (wrap) {
            wrap.querySelectorAll('.is-uncertain').forEach(function (n) {
              n.classList.remove('is-uncertain');
            });
          }
          _syncUncertainInfo(root);
          var note = root.querySelector('[data-structured-save]');
          if (note) note.textContent = '正在保存…';
          clearTimeout(el._saveTimer);
          el._saveTimer = setTimeout(function () {
            if (note) note.textContent = '已保存';
          }, 450);
          var _cSt = CONFIRM_STATE[CURRENT_CONFIRM];
          if (_cSt && _cSt.submitted) {
            _cSt.submitted = false;
            var submitEl = root.querySelector('.po-btn-submitted');
            if (submitEl) {
              var newBtn = document.createElement('button');
              newBtn.className = 'po-btn po-btn-sm po-btn-primary';
              newBtn.setAttribute('data-act', 'submitConfirm');
              newBtn.textContent = '确认写入';
              submitEl.parentNode.replaceChild(newBtn, submitEl);
            }
          }
        }
        el.addEventListener('input', _persistStructured);
        if (el.tagName === 'SELECT') el.addEventListener('change', _persistStructured);
        if (el.classList && el.classList.contains('po-long-edit')) {
          el.addEventListener('blur', function () {
            var lk = el.getAttribute('data-long-key');
            if (!lk) return;
            UNDER_LONG_EXPAND[lk] = true;
            if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
          });
          el.addEventListener('keydown', function (ev) {
            if (ev.key === 'Escape') {
              ev.preventDefault();
              var lk2 = el.getAttribute('data-long-key');
              if (!lk2) return;
              UNDER_LONG_EXPAND[lk2] = true;
              if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
            }
          });
          setTimeout(function () {
            try { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } catch (e) {}
          }, 0);
        }
      });
      root.querySelectorAll('[data-structured-text]').forEach(function (el) {
        el.addEventListener('input', function () {
          var note = root.querySelector('[data-structured-save]');
          if (note) note.textContent = '正在自动保存草稿…';
          clearTimeout(el._saveTimer);
          el._saveTimer = setTimeout(function () { if (note) note.textContent = '草稿已自动保存 · 刚刚'; }, 450);
        });
      });
      root.querySelectorAll('[data-fin-period-field]').forEach(function (el) {
        el.addEventListener('change', function () {
          var field = el.getAttribute('data-fin-period-field');
          var pairs = { current: 'cumulative', cumulative: 'current', opening: 'closing', closing: 'opening' };
          var other = pairs[field];
          if (other) {
            var otherEl = root.querySelector('[data-fin-period-field="' + other + '"]');
            if (el.checked && otherEl) otherEl.checked = false;
            if (!el.checked && otherEl && !otherEl.checked) el.checked = true;
          }
          toast('期间口径已更新，科目映射和试算结果已重新计算');
        });
      });
      /* 系统管理：列表已去掉角色下拉，角色改由机构统一策略（本 Demo 不在此维护） */
      root.querySelectorAll('[data-fin-config-value]').forEach(function (el) {
        el.addEventListener('input', function () {
          var note = root.querySelector('[data-fin-config-save]');
          if (note) note.textContent = '…';
          clearTimeout(el._saveTimer);
          el._saveTimer = setTimeout(function () {
            var sid = el.getAttribute('data-subject-id');
            var sst = el.getAttribute('data-subject-stmt');
            if (sid && sst) {
              var cfg = _finConfig();
              var subs = (cfg.subjects || {})[sst] || [];
              var sub = subs.filter(function(s){ return s.id === sid; })[0];
              if (sub) {
                sub[el.getAttribute('data-fin-config-value')] = (el.value || '').trim();
                _saveFinConfig(cfg);
              }
            }
            if (note) note.textContent = '已保存';
          }, 600);
        });
      });
      /* 项目数据浏览器：项目范围树（选择 / 展开）+ 指标搜索 */
      root.querySelectorAll('[data-scope-act]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          _toggleScope(el.getAttribute('data-arg'));
          navigate('post-browser');
        });
      });
      root.querySelectorAll('[data-scope-caret]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var id = el.getAttribute('data-scope-caret');
          BROWSER_STATE.scopeExpanded[id] = !(BROWSER_STATE.scopeExpanded[id] !== false);
          navigate('post-browser');
        });
      });
      var srch = root.querySelector('#poBrowserSearch');
      if (srch) srch.addEventListener('input', function () {
        BROWSER_STATE.search = srch.value;
        navigate('post-browser');
        setTimeout(function () { var n = document.getElementById('poBrowserSearch'); if (n) { n.focus(); var e = n.value.length; n.setSelectionRange(e, e); } }, 0);
      });
      function bindFilter(id, state, key, route) {
        var el = root.querySelector('#' + id);
        if (el) el.addEventListener('change', function () { state[key] = el.value; navigate(route); });
      }
      function bindSearch(id, state, route) {
        var el = root.querySelector('#' + id);
        if (!el) return;
        el.addEventListener('input', function () {
          state.search = el.value;
          navigate(route);
          setTimeout(function () { var n=document.getElementById(id); if(n){n.focus();var x=n.value.length;n.setSelectionRange(x,x);} },0);
        });
      }
      bindFilter('poProjectType', PROJECT_FILTER, 'type', 'projects');
      bindFilter('poProjectFund', PROJECT_FILTER, 'fundId', 'projects');
      bindFilter('poProjectOwner', PROJECT_FILTER, 'owner', 'projects');
      bindSearch('poProjectSearch', PROJECT_FILTER, 'projects');
      bindSearch('poFundSearch', FUND_FILTER, 'fund');
      bindFilter('poFundManagement', FUND_FILTER, 'management', 'fund');
      bindFilter('poFundStrategy', FUND_FILTER, 'strategy', 'fund');
      bindFilter('poFundStatus', FUND_FILTER, 'status', 'fund');
      bindFilter('poFundManager', FUND_FILTER, 'manager', 'fund');
      bindFilter('poSnapshotStage', SNAPSHOT_FILTER, 'stageIn', 'snapshot');
      bindFilter('poSnapshotType', SNAPSHOT_FILTER, 'type', 'snapshot');
      bindFilter('poSnapshotFund', SNAPSHOT_FILTER, 'fundId', 'snapshot');
      bindFilter('poSnapshotOwner', SNAPSHOT_FILTER, 'owner', 'snapshot');
      bindFilter('poSnapshotIndustry', SNAPSHOT_FILTER, 'industry', 'snapshot');
      bindSearch('poSnapshotSearch', SNAPSHOT_FILTER, 'snapshot');
      bindFilter('poFundSnapFund', FUND_SNAP_STATE, 'fundId', 'fund-snapshot');
      _bindSnapDonuts(root);
      var parseTargetSearch = root.querySelector('#poParseTargetSearchInput');
      if (parseTargetSearch) {
        parseTargetSearch.addEventListener('input', function () {
          PARSE_TARGET_QUERY = parseTargetSearch.value || '';
          PARSE_TARGET = '';
          PARSE_TARGET_LABEL = '';
          var suggestDiv = document.getElementById('poParseTargetSuggest');
          if (suggestDiv) suggestDiv.innerHTML = PARSE_TARGET_QUERY ? _buildSuggestHtml(PARSE_TARGET_QUERY) : '';
        });
        parseTargetSearch.addEventListener('focus', function () {
          var suggestDiv = document.getElementById('poParseTargetSuggest');
          if (suggestDiv) suggestDiv.innerHTML = _buildSuggestHtml(parseTargetSearch.value || '');
        });
        parseTargetSearch.addEventListener('blur', function () {
          setTimeout(function () {
            var suggestDiv = document.getElementById('poParseTargetSuggest');
            if (suggestDiv) suggestDiv.innerHTML = '';
          }, 200);
        });
        /* 下拉是动态插入的：用 mousedown 委托，避免 blur 先清掉节点导致点选无效、无法返显 */
        var parseTargetBox = parseTargetSearch.parentElement;
        if (parseTargetBox && !parseTargetBox.getAttribute('data-suggest-bound')) {
          parseTargetBox.setAttribute('data-suggest-bound', '1');
          parseTargetBox.addEventListener('mousedown', function (e) {
            var item = e.target.closest ? e.target.closest('[data-act="parseTargetSelect"]') : null;
            if (!item) {
              var el = e.target;
              while (el && el !== parseTargetBox) {
                if (el.getAttribute && el.getAttribute('data-act') === 'parseTargetSelect') { item = el; break; }
                el = el.parentNode;
              }
            }
            if (!item) return;
            e.preventDefault();
            e.stopPropagation();
            PE_POST_PAGES.act('parseTargetSelect', item.getAttribute('data-arg') || '');
          });
        }
      }
      var parseTargetNewType = root.querySelector('#poParseTargetNewType');
      if (parseTargetNewType) parseTargetNewType.addEventListener('change', function () {
        PARSE_TARGET_NEW_TYPE = parseTargetNewType.value === 'managed' ? 'managed' : (parseTargetNewType.value === 'direct' ? 'direct' : 'external');
        navigate('file-parse');
      });
      var parseTargetNewName = root.querySelector('#poParseTargetNewName');
      if (parseTargetNewName) parseTargetNewName.addEventListener('input', function () {
        PARSE_TARGET_NEW_NAME = parseTargetNewName.value || '';
      });
      var spaceNameInput = root.querySelector('#poSpaceName');
      if (spaceNameInput) {
        spaceNameInput.addEventListener('input', function () {
          SPACE_EDITOR_STATE.name = spaceNameInput.value;
        });
      }
      /* 首页 "+" 按钮：切换弹出菜单 */
      var plusBtn = root.querySelector('#poHomePlus');
      if (plusBtn) {
        plusBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var menu = document.getElementById('poPlusMenu');
          if (!menu) return;
          if (menu.style.display === 'none' || !menu.style.display) {
            renderPlusMenu('main');
            menu.style.display = 'block';
          } else {
            menu.style.display = 'none';
          }
        });
        /* 点击页面其他区域关闭菜单 */
        document.addEventListener('click', function (e) {
          var menu = document.getElementById('poPlusMenu');
          if (menu && menu.style.display !== 'none' && !menu.contains(e.target) && e.target !== plusBtn) {
            menu.style.display = 'none';
          }
          /* 输入框卡片内部工具栏面板外部点击关闭 */
          if (HOME_STATE.toolbarOpen) {
            var tb = root.querySelector('.po-composer-tools');
            var tp = root.querySelector('.po-toolbar-panel');
            if (tb && tp && !tb.contains(e.target) && !tp.contains(e.target)) {
              HOME_STATE.toolbarOpen = null;
              navigate('home');
            }
          }
        });
      }
      /* 首页：选择本地文件后进入解析队列 */
      var homeFile = root.querySelector('#poHomeFile');
      if (homeFile) homeFile.addEventListener('change', function () {
        var names = Array.prototype.map.call(homeFile.files || [], function (f) { return f.name; });
        if (names.length) {
          toast('已添加 ' + names.length + ' 个文件（' + names[0] + (names.length > 1 ? ' 等' : '') + '），正在解析');
          setTimeout(function () { navigate('file-parse'); }, 700);
        }
        homeFile.value = '';
      });
      /* 首页输入框回车提交 */
      /* ── 行内编辑 KV 输入框：追踪草稿值 + 回车保存 + 自动聚焦 ── */
      root.querySelectorAll('.po-kv-input').forEach(function(inp) {
        var ekey = inp.getAttribute('data-ekey');
        var syncDraft = function() { KV_EDIT_DRAFT[ekey] = inp.value; };
        inp.addEventListener('input', syncDraft);
        inp.addEventListener('change', syncDraft);
        inp.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') { e.preventDefault(); PE_POST_PAGES.act('kvEditSave', ekey); }
          if (e.key === 'Escape') { e.preventDefault(); PE_POST_PAGES.act('kvEditCancel', ekey); }
        });
        if (inp.tagName === 'INPUT') { inp.focus(); if (inp.type === 'text' || inp.type === 'number') inp.select(); }
      });
      /* 材料文件夹选择器 */
      root.querySelectorAll('[data-act-folder]').forEach(function(sel) {
        var folderArg = sel.getAttribute('data-act-folder');
        sel.addEventListener('change', function(e) {
          e.stopPropagation();
          PE_POST_PAGES.act('materialSetFolder', folderArg + '|' + sel.value);
        });
        sel.addEventListener('click', function(e) { e.stopPropagation(); });
      });
      /* 首页输入框回车提交 */
      var homeInput = root.querySelector('#poHomeInput');
      if (homeInput) homeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); PE_POST_PAGES.act('homeAsk', ''); }
      });
      /* 对话页：输入框回车提交 + 文件上传 + 滚动到底 */
      var chatInput = root.querySelector('#poChatInput');
      if (chatInput) {
        chatInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); PE_POST_PAGES.act('chatSend', chatInput.getAttribute('data-chatid') || ''); }
        });
        var stream = root.querySelector('#poChatStream');
        if (stream) stream.scrollTop = stream.scrollHeight;
      }
      var chatSendBtn = root.querySelector('.po-chat-send');
      if (chatSendBtn) {
        var cidAttr = chatSendBtn.getAttribute('data-arg');
        if (chatInput) chatInput.setAttribute('data-chatid', cidAttr);
      }
      var chatFile = root.querySelector('#poChatFile');
      if (chatFile) chatFile.addEventListener('change', function () {
        var names = Array.prototype.map.call(chatFile.files || [], function (f) { return f.name; });
        if (names.length) {
          toast('已添加 ' + names.length + ' 个文件到对话，正在解析');
          setTimeout(function () { navigate('file-parse'); }, 700);
        }
        chatFile.value = '';
      });
    },
    act: function (act, arg) {
      if (act === 'setConfirmMoneyUnit' || act === 'setGlobalMoneyUnit') {
        setConfirmMoneyUnit(arg || 'wan');
        toast('确认页金额单位已切换为' + moneyUnitLabel(getConfirmMoneyUnit()) + '（写入按元入库；档案展示单位可另切）');
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        else navigate('file-parse');
        return;
      }
      if (act === 'confirmMoneyUnit' || act === 'kvMoneyUnit') {
        toast('请使用右栏「金额单位」切换');
        return;
      }
      /* ── 行内编辑字段 ── */
      if (act === 'kvEditStart') {
        KV_EDIT_STATE[arg] = true;
        KV_EDIT_DRAFT[arg] = undefined;
        var parts = String(arg).split('|');
        if (parts[0] === 'project') navigate('project/' + parts[1]);
        else if (parts[0] === 'fund') navigate('fund/' + parts[1]);
        return;
      }
      if (act === 'kvEditCancel') {
        delete KV_EDIT_STATE[arg];
        delete KV_EDIT_DRAFT[arg];
        delete KV_EDIT_UNIT[arg];
        var parts = String(arg).split('|');
        if (parts[0] === 'project') navigate('project/' + parts[1]);
        else if (parts[0] === 'fund') navigate('fund/' + parts[1]);
        return;
      }
      if (act === 'kvEditSave') {
        var parts = String(arg).split('|');
        var kind = parts[0], entityId = parts[1], fieldKey = parts[2];
        var store = window.PE_POST_STORE;
        var rootEl = document.getElementById('content') || document;
        var inp = rootEl.querySelector('.po-kv-input[data-ekey="' + arg + '"]');
        var etype = (inp && inp.getAttribute('data-etype')) || 'text';
        var newVal = KV_EDIT_DRAFT[arg] !== undefined ? KV_EDIT_DRAFT[arg] : (inp ? inp.value : '');
        if (etype === 'money' || etype === 'capital') {
          var unitSave = (inp && inp.getAttribute('data-money-unit')) || KV_EDIT_UNIT[arg] || 'wan';
          rootEl.querySelectorAll('select[data-act="kvMoneyUnit"]').forEach(function (sel) {
            if (sel.getAttribute('data-arg') === arg) unitSave = sel.value;
          });
          var rawNum = inp ? inp.value : newVal;
          newVal = moneyUnitToWan(rawNum, unitSave);
          if (newVal == null || isNaN(newVal)) newVal = 0;
        } else if (etype === 'percent' || etype === 'multiple' || etype === 'year') {
          newVal = Number(newVal);
          if (isNaN(newVal)) newVal = 0;
        } else if (etype === 'bool') {
          newVal = newVal === '是' || newVal === '1' || newVal === true;
        } else if (etype === 'date') {
          newVal = normalizeDateValue(newVal) || String(newVal || '').trim();
        } else if (etype === 'month') {
          newVal = normalizeMonthValue(newVal) || String(newVal || '').trim();
        } else {
          newVal = String(newVal == null ? '' : newVal).trim();
        }
        function _applyField(obj, key, val) {
          var di = key.indexOf('.');
          if (di === -1) { var u = {}; u[key] = val; return Object.assign({}, obj, u); }
          var pk = key.slice(0, di), ck = key.slice(di + 1);
          var nest = Object.assign({}, obj[pk] || {}); nest[ck] = val;
          var u = {}; u[pk] = nest; return Object.assign({}, obj, u);
        }
        if (kind === 'project') {
          var p = store.project(entityId);
          if (p) { store.saveProject(_applyField(p, fieldKey, newVal)); }
          delete KV_EDIT_STATE[arg]; delete KV_EDIT_DRAFT[arg]; delete KV_EDIT_UNIT[arg];
          navigate('project/' + entityId);
        } else if (kind === 'fund') {
          var f = store.fund(entityId);
          if (f) { store.saveFund(_applyField(f, fieldKey, newVal)); }
          delete KV_EDIT_STATE[arg]; delete KV_EDIT_DRAFT[arg]; delete KV_EDIT_UNIT[arg];
          navigate('fund/' + entityId);
        }
        return;
      }
      /* ── 材料删除 ── */
      if (act === 'materialDelete') {
        var parts = String(arg).split('|');
        var pid = parts[0], idx = parseInt(parts[1], 10);
        if (!window.confirm('确认删除该材料？')) return;
        var store = window.PE_POST_STORE;
        var _mdFund = store.fund(pid);
        if (_mdFund) {
          var _mdMats = (_mdFund.materials || []).filter(function(_, i){ return i !== idx; });
          store.saveFund(Object.assign({}, _mdFund, { materials: _mdMats }));
          DETAIL_STATE.fundTabs[pid] = 'materials';
          navigate('fund/' + pid);
        } else {
          var p = store.project(pid);
          if (!p) return;
          var _mdMats = (p.materials || []).filter(function(_, i){ return i !== idx; });
          store.saveProject(Object.assign({}, p, { materials: _mdMats }));
          navigate('project/' + pid);
        }
        return;
      }
      /* ── 材料文件夹 ── */
      if (act === 'createMaterialFolder') {
        var store = window.PE_POST_STORE;
        var _cmfName = window.prompt('新建文件夹名称：');
        if (!_cmfName || !_cmfName.trim()) return;
        _cmfName = _cmfName.trim();
        function _folderExists(list, name) {
          return (list || []).some(function(f){ return (typeof f==='string'?f:(f&&f.name)||'') === name; });
        }
        function _pushFolder(list, name) {
          var next = (list || []).slice();
          next.push({ id: 'mf-' + Date.now().toString(36), name: name });
          return next;
        }
        var _cmfFund = store.fund(arg);
        if (_cmfFund) {
          if (_folderExists(_cmfFund.materialFolders, _cmfName)) { toast('文件夹「' + _cmfName + '」已存在'); return; }
          store.saveFund(Object.assign({}, _cmfFund, { materialFolders: _pushFolder(_cmfFund.materialFolders, _cmfName) }));
          toast('已创建文件夹「' + _cmfName + '」');
          DETAIL_STATE.fundTabs[arg] = 'materials';
          navigate('fund/' + arg);
        } else {
          var proj = store.project(arg);
          if (!proj) return;
          if (_folderExists(proj.materialFolders, _cmfName)) { toast('文件夹「' + _cmfName + '」已存在'); return; }
          store.saveProject(Object.assign({}, proj, { materialFolders: _pushFolder(proj.materialFolders, _cmfName) }));
          toast('已创建文件夹「' + _cmfName + '」');
          DETAIL_STATE.projectTabs[arg] = 'materials';
          navigate('project/' + arg);
        }
        return;
      }
      if (act === 'materialSetFolder') {
        var parts = String(arg).split('|');
        var mpid = parts[0], midx = parseInt(parts[1], 10), mfolder = parts.slice(2).join('|') || null;
        var store = window.PE_POST_STORE;
        var _msfFund = store.fund(mpid);
        if (_msfFund) {
          var _msfMats = (_msfFund.materials || []).slice();
          if (_msfMats[midx]) { _msfMats[midx] = Object.assign({}, _msfMats[midx], { folder: mfolder || null }); }
          store.saveFund(Object.assign({}, _msfFund, { materials: _msfMats }));
          DETAIL_STATE.fundTabs[mpid] = 'materials';
          navigate('fund/' + mpid);
        } else {
          var proj = store.project(mpid);
          if (!proj) return;
          var _msfMats = (proj.materials || []).slice();
          if (_msfMats[midx]) { _msfMats[midx] = Object.assign({}, _msfMats[midx], { folder: mfolder || null }); }
          store.saveProject(Object.assign({}, proj, { materials: _msfMats }));
          DETAIL_STATE.projectTabs[mpid] = 'materials';
          navigate('project/' + mpid);
        }
        return;
      }
      /* ── 业务进展 新增 ── */
      if (act === 'addBusinessUpdate') {
        var pid = arg;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var body = _field('期间', '<input name="period" placeholder="如 2026Q3 · 2026H2 · 2026FY">')
          + _field('记录日期', '<input name="date" type="date">')
          + '<div class="po-crud-span">' + _field('业务进展描述', '<textarea name="text" rows="4" style="width:100%;resize:vertical;font-size:13px;line-height:1.6"></textarea>') + '</div>';
        var overlay = _crudOverlay('新增业务进展', '记录本期企业经营进展', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var text = _val(overlay, 'text');
          if (!text.trim()) return;
          var upd = Object.assign({}, p);
          upd.businessUpdates = (p.businessUpdates || []).concat([{ period: _val(overlay,'period') || '最新', date: _val(overlay,'date') || '', text: text }]);
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      /* ── 退出里程碑 新增 ── */
      if (act === 'addExitMilestone') {
        var pid = arg;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var body = _field('里程碑名称', '<input name="event" placeholder="如 B轮融资完成 · 科创板申报">')
          + _field('状态', '<select name="status"><option value="done">已完成</option><option value="in-progress">进行中</option><option value="planned" selected>计划中</option><option value="cancelled">已取消</option></select>')
          + _field('日期 / 预计时间', '<input name="date" type="month">')
          + '<div class="po-crud-span">' + _field('说明', '<textarea name="detail" rows="3" style="width:100%;resize:vertical;font-size:13px;line-height:1.6"></textarea>') + '</div>';
        var overlay = _crudOverlay('新增退出里程碑', '记录退出路径或后续融资节点', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var event = _val(overlay, 'event');
          if (!event.trim()) return;
          var upd = Object.assign({}, p);
          upd.exitMilestones = (p.exitMilestones || []).concat([{ event: event, status: _val(overlay,'status') || 'planned', date: _val(overlay,'date') || '—', detail: _val(overlay,'detail') }]);
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      /* ── 联系人 编辑 / 新增 ── */
      if (act === 'editContact') {
        var parts = String(arg).split('|');
        var pid = parts[0], ci = Number(parts[1]);
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var c = (p.contacts || [])[ci] || {};
        var body = _field('姓名', '<input name="name" value="' + esc(c.name || '') + '">')
          + _field('职位', '<input name="role" value="' + esc(c.role || '') + '">')
          + _field('电话', '<input name="phone" value="' + esc(c.phone || '') + '">')
          + _field('邮箱', '<input name="email" value="' + esc(c.email || '') + '">')
          + _field('主要联系人', '<select name="primary"><option value="1"' + (c.primary ? ' selected' : '') + '>是</option><option value="0"' + (!c.primary ? ' selected' : '') + '>否</option></select>');
        var overlay = _crudOverlay('编辑联系人', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var upd = Object.assign({}, p);
          var contacts = (p.contacts || []).slice();
          contacts[ci] = Object.assign({}, contacts[ci], { name: _val(overlay,'name'), role: _val(overlay,'role') || '—', phone: _val(overlay,'phone') || '—', email: _val(overlay,'email') || '—', primary: _val(overlay,'primary') === '1' });
          upd.contacts = contacts;
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      if (act === 'addContact') {
        var pid = arg;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var body = _field('姓名', '<input name="name">')
          + _field('职位', '<input name="role">')
          + _field('电话', '<input name="phone">')
          + _field('邮箱', '<input name="email">')
          + _field('主要联系人', '<select name="primary"><option value="0" selected>否</option><option value="1">是</option></select>');
        var overlay = _crudOverlay('添加联系人', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var name = _val(overlay, 'name');
          if (!name.trim()) return;
          var upd = Object.assign({}, p);
          upd.contacts = (p.contacts || []).concat([{ name: name, role: _val(overlay,'role') || '—', phone: _val(overlay,'phone') || '—', email: _val(overlay,'email') || '—', primary: _val(overlay,'primary') === '1' }]);
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      /* ── 账户信息 编辑 / 新增 ── */
      if (act === 'editBankAccount') {
        var parts = String(arg).split('|');
        var pid = parts[0], ai = Number(parts[1]);
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var a = (p.bankAccounts || [])[ai] || {};
        var body = _field('账户持有人', '<input name="holder" value="' + esc(a.holder || '') + '">')
          + _field('开户行', '<input name="bank" value="' + esc(a.bank || '') + '">')
          + _field('账号', '<input name="no" value="' + esc(a.no || '') + '">')
          + _field('用途', '<input name="use" value="' + esc(a.use || '') + '">')
          + _field('币种', '<select name="currency"><option value="CNY"' + (a.currency === 'CNY' ? ' selected' : '') + '>CNY</option><option value="USD"' + (a.currency === 'USD' ? ' selected' : '') + '>USD</option><option value="HKD"' + (a.currency === 'HKD' ? ' selected' : '') + '>HKD</option></select>');
        var overlay = _crudOverlay('编辑账户', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var upd = Object.assign({}, p);
          var accounts = (p.bankAccounts || []).slice();
          accounts[ai] = Object.assign({}, accounts[ai], { holder: _val(overlay,'holder'), bank: _val(overlay,'bank'), no: _val(overlay,'no'), use: _val(overlay,'use'), currency: _val(overlay,'currency') || 'CNY' });
          upd.bankAccounts = accounts;
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      if (act === 'addBankAccount') {
        var pid = arg;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var body = _field('账户持有人', '<input name="holder">')
          + _field('开户行', '<input name="bank">')
          + _field('账号', '<input name="no">')
          + _field('用途', '<input name="use">')
          + _field('币种', '<select name="currency"><option value="CNY">CNY</option><option value="USD">USD</option><option value="HKD">HKD</option></select>');
        var overlay = _crudOverlay('添加账户', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var holder = _val(overlay, 'holder');
          if (!holder.trim()) return;
          var upd = Object.assign({}, p);
          upd.bankAccounts = (p.bankAccounts || []).concat([{ holder: holder, bank: _val(overlay,'bank') || '—', no: _val(overlay,'no') || '—', use: _val(overlay,'use') || '收款', currency: _val(overlay,'currency') || 'CNY' }]);
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      /* ── 风险记录 新增 / 删除 ── */
      if (act === 'addRisk') {
        var pid = arg;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var body = _field('风险事项', '<input name="name" placeholder="如 应收账款周转天数上升">')
          + _field('等级', '<select name="level"><option value="高">高</option><option value="中" selected>中</option><option value="低">低</option></select>')
          + _field('期间', '<input name="period" placeholder="如 2026H1">')
          + _field('日期', '<input name="date" type="date">')
          + '<div class="po-crud-span">' + _field('风险说明', '<textarea name="detail" rows="3" style="width:100%;resize:vertical;font-size:13px;line-height:1.6"></textarea>') + '</div>';
        var overlay = _crudOverlay('添加风险记录', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var name = _val(overlay, 'name');
          if (!name.trim()) return;
          var upd = Object.assign({}, p);
          upd.risks = (p.risks || []).concat([{ name: name, level: _val(overlay,'level') || '中', period: _val(overlay,'period') || '—', date: _val(overlay,'date') || '—', detail: _val(overlay,'detail') }]);
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      if (act === 'deleteRisk') {
        var parts = String(arg).split('|');
        var pid = parts[0], ri = Number(parts[1]);
        if (!window.confirm('确认删除该风险记录？')) return;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var upd = Object.assign({}, p);
        upd.risks = (p.risks || []).filter(function (_, i) { return i !== ri; });
        store.saveProject(upd);
        navigate('project/' + pid);
        return;
      }
      /* ── 关键约定 编辑 / 新增 ── */
      if (act === 'editTerm') {
        var parts = String(arg).split('|');
        var pid = parts[0], ti = Number(parts[1]);
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var t = (p.terms || [])[ti] || {};
        var body = _field('约定名称', '<input name="name" value="' + esc(t.name || '') + '">')
          + _field('生效状态', '<select name="has"><option value="1"' + (t.has ? ' selected' : '') + '>已签署</option><option value="0"' + (!t.has ? ' selected' : '') + '>未约定</option></select>')
          + '<div class="po-crud-span">' + _field('约定详情', '<textarea name="detail" rows="3" style="width:100%;resize:vertical;font-size:13px;line-height:1.6">' + esc(t.detail || '') + '</textarea>') + '</div>';
        var overlay = _crudOverlay('编辑关键约定', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var upd = Object.assign({}, p);
          var terms = (p.terms || []).slice();
          terms[ti] = Object.assign({}, terms[ti], { name: _val(overlay,'name'), has: _val(overlay,'has') === '1', detail: _val(overlay,'detail') });
          upd.terms = terms;
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      if (act === 'addTerm') {
        var pid = arg;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var body = _field('约定名称', '<input name="name" placeholder="如 优先清算权 · 反稀释条款">')
          + _field('生效状态', '<select name="has"><option value="1" selected>已签署</option><option value="0">未约定</option></select>')
          + '<div class="po-crud-span">' + _field('约定详情', '<textarea name="detail" rows="3" style="width:100%;resize:vertical;font-size:13px;line-height:1.6"></textarea>') + '</div>';
        var overlay = _crudOverlay('添加关键约定', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var name = _val(overlay, 'name');
          if (!name.trim()) return;
          var upd = Object.assign({}, p);
          upd.terms = (p.terms || []).concat([{ name: name, has: _val(overlay,'has') === '1', detail: _val(overlay,'detail') || '—' }]);
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      /* ── 股权事件 新增 ── */
      if (act === 'addEquityEvent') {
        var pid = arg;
        var store = window.PE_POST_STORE;
        var p = store.project(pid);
        if (!p) return;
        var body = _field('事件类型', '<select name="type"><option>后续融资</option><option>股权转让</option><option>股权质押</option><option>回购</option><option>减资</option><option>增资</option><option>其他</option></select>')
          + _field('发生日期', '<input name="date" type="month">')
          + '<div class="po-crud-span">' + _field('事件说明', '<textarea name="desc" rows="3" style="width:100%;resize:vertical;font-size:13px;line-height:1.6"></textarea>') + '</div>';
        var overlay = _crudOverlay('新增股权事件', '', body, '保存');
        overlay.querySelector('[data-primary]').addEventListener('click', function () {
          var desc = _val(overlay, 'desc');
          if (!desc.trim()) return;
          var upd = Object.assign({}, p);
          upd.equityEvents = (p.equityEvents || []).concat([{ id: 'ee-u-' + Math.floor(Math.random()*99999), type: _val(overlay,'type') || '其他', date: _val(overlay,'date') || '—', desc: desc, status: 'confirmed' }]);
          store.saveProject(upd);
          overlay.remove();
          navigate('project/' + pid);
        });
        return;
      }
      if (act === 'detailTab') {
        var detailParts = String(arg || '').split('|');
        if (detailParts[0] === 'project') {
          DETAIL_STATE.projectTabs[detailParts[1]] = detailParts[2];
          navigate('project/' + detailParts[1]);
        } else if (detailParts[0] === 'fund') {
          DETAIL_STATE.fundTabs[detailParts[1]] = detailParts[2];
          navigate('fund/' + detailParts[1]);
        }
        return;
      }
      if (act === 'refreshPublicData') {
        var stamp = _publicNowStamp();
        DETAIL_STATE.publicSyncNote[arg] = { risk: stamp };
        DETAIL_STATE.projectTabs[arg] = 'public';
        toast('已刷新公开风险');
        navigate('project/' + arg);
        return;
      }
      if (act === 'timeMachineNode') {
        var tmParts = String(arg || '').split('|');
        DETAIL_STATE.timeMachineNode[tmParts[0]] = tmParts[1];
        DETAIL_STATE.timeMachineCompare[tmParts[0]] = false;
        navigate('project/' + tmParts[0]);
        return;
      }
      if (act === 'timeMachineCompare') {
        DETAIL_STATE.timeMachineCompare[arg] = true;
        navigate('project/' + arg);
        return;
      }
      if (act === 'timeMachineExitCompare') {
        DETAIL_STATE.timeMachineCompare[arg] = false;
        navigate('project/' + arg);
        return;
      }
      if (act === 'projFinSubTab') {
        var pfsStParts = String(arg).split('|');
        if (!PROJ_FIN_STATE[pfsStParts[0]]) PROJ_FIN_STATE[pfsStParts[0]] = {};
        PROJ_FIN_STATE[pfsStParts[0]].subTab = pfsStParts[1];
        DETAIL_STATE.projectTabs[pfsStParts[0]] = 'financial';
        navigate('project/' + pfsStParts[0]);
        return;
      }
      if (act === 'projSaCompare') {
        var saCParts = String(arg).split('|');
        if (!PROJ_FIN_STATE[saCParts[0]]) PROJ_FIN_STATE[saCParts[0]] = {};
        PROJ_FIN_STATE[saCParts[0]].saCompare = saCParts[1];
        PROJ_FIN_STATE[saCParts[0]].subTab = 'analysis';
        DETAIL_STATE.projectTabs[saCParts[0]] = 'financial';
        navigate('project/' + saCParts[0]);
        return;
      }
      if (act === 'projSaPeriod') {
        var saPParts = String(arg).split('|');
        if (!PROJ_FIN_STATE[saPParts[0]]) PROJ_FIN_STATE[saPParts[0]] = {};
        PROJ_FIN_STATE[saPParts[0]].saPeriod = saPParts[1] || '';
        PROJ_FIN_STATE[saPParts[0]].subTab = 'analysis';
        DETAIL_STATE.projectTabs[saPParts[0]] = 'financial';
        navigate('project/' + saPParts[0]);
        return;
      }
      if (act === 'projSaShowAll') {
        var saAParts = String(arg).split('|');
        if (!PROJ_FIN_STATE[saAParts[0]]) PROJ_FIN_STATE[saAParts[0]] = {};
        PROJ_FIN_STATE[saAParts[0]].saShowAll = saAParts[1] === '1';
        PROJ_FIN_STATE[saAParts[0]].subTab = 'analysis';
        DETAIL_STATE.projectTabs[saAParts[0]] = 'financial';
        navigate('project/' + saAParts[0]);
        return;
      }
      if (act === 'projSaExpand') {
        var saEParts = String(arg).split('|');
        if (!PROJ_FIN_STATE[saEParts[0]]) PROJ_FIN_STATE[saEParts[0]] = {};
        var curExp = PROJ_FIN_STATE[saEParts[0]].saExpand;
        PROJ_FIN_STATE[saEParts[0]].saExpand = (curExp === saEParts[1]) ? '' : saEParts[1];
        PROJ_FIN_STATE[saEParts[0]].subTab = 'analysis';
        DETAIL_STATE.projectTabs[saEParts[0]] = 'financial';
        navigate('project/' + saEParts[0]);
        return;
      }
      if (act === 'projFinUnit') {
        var pfsUParts = String(arg).split('|');
        var nextUnit = setArchiveMoneyUnit(pfsUParts[1] || 'wan');
        if (!PROJ_FIN_STATE[pfsUParts[0]]) PROJ_FIN_STATE[pfsUParts[0]] = {};
        PROJ_FIN_STATE[pfsUParts[0]].unit = nextUnit;
        toast('金额单位已切换为' + moneyUnitLabel(nextUnit));
        navigate('project/' + pfsUParts[0]);
        return;
      }
      if (act === 'projFinCurrency') {
        var pfsCParts = String(arg).split('|');
        if (!PROJ_FIN_STATE[pfsCParts[0]]) PROJ_FIN_STATE[pfsCParts[0]] = {};
        PROJ_FIN_STATE[pfsCParts[0]].currency = pfsCParts[1];
        navigate('project/' + pfsCParts[0]);
        return;
      }
      if (act === 'detailJump') {
        var detailNode = document.getElementById(arg);
        if (detailNode) detailNode.scrollIntoView({ behavior:'smooth', block:'start' });
        return;
      }
      if (act === 'homeChip') {
        /* 与「+ → 技能」一致：回填到输入框，由用户确认后再发送 */
        if (arg === '投委会对抗预演') { navigate('redblue'); return; }
        HOME_STATE.draft = '@' + arg + ' ';
        var input = document.getElementById('poHomeInput');
        if (input) { input.value = HOME_STATE.draft; input.focus(); }
        else navigate('home');
        toast('「' + arg + '」已选用，可补充说明后发送');
        return;
      }
      if (act === 'openChat') {
        navigate('chat/' + arg);
        return;
      }
      if (act === 'toggleSpace') {
        HOME_STATE.toolbarOpen = HOME_STATE.toolbarOpen === 'space' ? null : 'space';
        navigate('home');
        return;
      }
      if (act === 'togglePerm') {
        HOME_STATE.toolbarOpen = HOME_STATE.toolbarOpen === 'perm' ? null : 'perm';
        navigate('home');
        return;
      }
      if (act === 'pickSpace') {
        BROWSER_STATE.spaceId = arg;
        HOME_STATE.toolbarOpen = null;
        var ns = _currentSpace();
        toast('已切换到空间：' + (ns ? ns.label : '未选择'));
        navigate('home');
        return;
      }
      if (act === 'openSpaceEditor') {
        var dSpace = D();
        var allSpaces = (dSpace.SPACES || []).concat(dSpace.CUSTOM_SPACES || []);
        var editing = null;
        for (var se = 0; se < allSpaces.length; se++) if (allSpaces[se].id === arg) editing = allSpaces[se];
        SPACE_EDITOR_STATE.open = true;
        SPACE_EDITOR_STATE.editId = editing ? editing.id : null;
        SPACE_EDITOR_STATE.name = editing ? editing.label : '';
        SPACE_EDITOR_STATE.selected = editing ? (editing.projectIds || []).slice() : [];
        SPACE_EDITOR_STATE.primaryProjectId = editing ? (editing.primaryProjectId || SPACE_EDITOR_STATE.selected[0] || null) : null;
        SPACE_EDITOR_STATE.adding = !editing;
        HOME_STATE.toolbarOpen = null;
        navigate('home');
        return;
      }
      if (act === 'spaceClose') {
        SPACE_EDITOR_STATE.open = false;
        SPACE_EDITOR_STATE.adding = false;
        navigate('home');
        return;
      }
      if (act === 'spaceToggleAdd') {
        SPACE_EDITOR_STATE.adding = !SPACE_EDITOR_STATE.adding;
        navigate('home');
        return;
      }
      if (act === 'spaceAddProject') {
        if (SPACE_EDITOR_STATE.selected.indexOf(arg) < 0) SPACE_EDITOR_STATE.selected.push(arg);
        if (!SPACE_EDITOR_STATE.primaryProjectId) SPACE_EDITOR_STATE.primaryProjectId = arg;
        navigate('home');
        return;
      }
      if (act === 'spaceRemoveProject') {
        SPACE_EDITOR_STATE.selected = SPACE_EDITOR_STATE.selected.filter(function (id) { return id !== arg; });
        if (SPACE_EDITOR_STATE.primaryProjectId === arg) SPACE_EDITOR_STATE.primaryProjectId = SPACE_EDITOR_STATE.selected[0] || null;
        navigate('home');
        return;
      }
      if (act === 'spaceSetPrimary') {
        if (SPACE_EDITOR_STATE.selected.indexOf(arg) >= 0) SPACE_EDITOR_STATE.primaryProjectId = arg;
        navigate('home');
        return;
      }
      if (act === 'spaceSave') {
        var dSave = D();
        var nameEl = document.getElementById('poSpaceName');
        var spaceName = ((nameEl && nameEl.value) || SPACE_EDITOR_STATE.name || '').trim();
        if (!spaceName) { toast('请填写空间名称'); return; }
        if (!SPACE_EDITOR_STATE.selected.length) { toast('请至少添加一个项目'); return; }
        var saveSpaces = (dSave.SPACES || []).concat(dSave.CUSTOM_SPACES || []);
        var targetSpace = null;
        for (var ss = 0; ss < saveSpaces.length; ss++) if (saveSpaces[ss].id === SPACE_EDITOR_STATE.editId) targetSpace = saveSpaces[ss];
        if (!targetSpace) {
          targetSpace = { id: 'sp-custom-' + Date.now(), scope: 'mixed' };
          dSave.CUSTOM_SPACES = dSave.CUSTOM_SPACES || [];
          dSave.CUSTOM_SPACES.push(targetSpace);
        }
        targetSpace.label = spaceName;
        targetSpace.projectIds = SPACE_EDITOR_STATE.selected.slice();
        targetSpace.primaryProjectId = SPACE_EDITOR_STATE.primaryProjectId || SPACE_EDITOR_STATE.selected[0];
        targetSpace.desc = targetSpace.projectIds.length + ' 个项目';
        BROWSER_STATE.spaceId = targetSpace.id;
        SPACE_EDITOR_STATE.open = false;
        SPACE_EDITOR_STATE.editId = null;
        SPACE_EDITOR_STATE.adding = false;
        toast('空间已保存：' + spaceName);
        navigate('home');
        return;
      }
      if (act === 'pickPerm') {
        if (PERM_OPTIONS.indexOf(arg) === -1) return;
        HOME_STATE.perm = arg;
        HOME_STATE.toolbarOpen = null;
        toast('默认权限已设为：' + arg);
        navigate('home');
        return;
      }
      if (act === 'homeFocus') {
        var inp0 = document.getElementById('poHomeInput');
        if (inp0) inp0.focus();
        return;
      }
      if (act === 'fileView') {
        toast('打开预览：' + arg);
        return;
      }
      if (act === 'viewDone') {
        var parts = (arg || '').split('|');
        toast('「' + parts[0] + '」已确认 ' + parts[1] + ' 个字段 · ' + parts[3] + ' · ' + parts[2]);
        return;
      }
      if (act === 'viewParsing') {
        var pp = (arg || '').split('|');
        toast('解析中：「' + pp[0] + '」' + (pp[1] || '') + '% · ' + (pp[2] || ''));
        return;
      }
      if (act === 'uploadCap') {
        var ui = document.createElement('input');
        ui.type = 'file';
        ui.accept = '.pdf,.xlsx,.xls';
        ui.style.display = 'none';
        ui.addEventListener('change', function () {
          var n = ui.files && ui.files.length ? ui.files[0].name : '';
          if (n) { toast('已上传「' + n + '」，正在解析股权结构（cap table / 融资协议）'); navigate('file-parse'); }
          document.body.removeChild(ui);
        });
        document.body.appendChild(ui);
        ui.click();
        return;
      }
      if (act === 'reuploadScan') {
        var ri = document.createElement('input');
        ri.type = 'file';
        ri.accept = '.pdf,.xlsx,.xls,.png,.jpg';
        ri.style.display = 'none';
        ri.addEventListener('change', function () {
          var n = ri.files && ri.files.length ? ri.files[0].name : '';
          if (n) { toast('已重新上传「' + n + '」，正在重新解析'); navigate('file-parse'); }
          document.body.removeChild(ri);
        });
        document.body.appendChild(ri);
        ri.click();
        return;
      }
      if (act === 'homeAsk') {
        var inp = document.getElementById('poHomeInput');
        var q = inp ? inp.value.trim() : '';
        if (!q) { toast('请输入问题'); return; }
        HOME_STATE.draft = '';
        var cid = _createChatFromQuestion(q);
        navigate('chat/' + cid);
        return;
      }
      if (act === 'homeAdd') {
        navigate('file-parse');
        return;
      }
      if (act === 'homeTask') {
        var cid2 = _createChatFromQuestion(arg);
        navigate('chat/' + cid2);
        return;
      }
      if (act === 'uploadZone') {
        if (PARSE_TARGET_MODE === 'existing' && !PARSE_TARGET) { toast('先选已有对象'); return; }
        if (PARSE_TARGET_MODE === 'new' && !(PARSE_TARGET_NEW_NAME || '').trim()) { toast('先填新建对象名称'); return; }
        showUploadSuggest();
        return;
      }
      if (act === 'parseQueueTab') {
        PARSE_QUEUE_TAB = arg === 'all' ? 'all' : 'pending';
        navigate('file-parse');
        return;
      }
      if (act === 'deleteParseTask') {
        if (confirm('确认删除此解析任务？已写入项目的数据不受影响，未写入的解析结果将被清除。')) {
          PARSE_TASK_DELETED[arg || ''] = true;
          navigate('file-parse');
        }
        return;
      }
      if (act === 'parseTargetSelect') {
        var parts = arg.split('|');
        PARSE_TARGET = parts[0] || '';
        PARSE_TARGET_LABEL = parts.slice(1).join('|') || '';
        PARSE_TARGET_QUERY = '';
        navigate('file-parse');
        return;
      }
      if (act === 'parseTargetMode') {
        PARSE_TARGET_MODE = arg === 'new' ? 'new' : 'existing';
        navigate('file-parse');
        return;
      }
      if (act === 'switchProjectSource') {
        if (CURRENT_CONFIRM) {
          CONFIRM_SOURCE_STATE[CURRENT_CONFIRM] = parseInt(arg, 10) || 0;
          navigate('confirm/' + CURRENT_CONFIRM);
        }
        return;
      }
      if (act === 'switchFinanceStatement') {
        FIN_CONFIRM_STATE.stmt = arg || 'is';
        FIN_CONFIRM_STATE.periodOpen = false;
        /* 切到带派生列的表时恢复全量，避免资产负债表「仅不平衡」态带过来导致空白 */
        if (arg === 'is' || arg === 'cf') FIN_CONFIRM_STATE.filterUnbalanced = false;
        STRUCTURED_ACTIVE_FIELD[CURRENT_CONFIRM || 'fp3'] = 0;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        return;
      }
      if (act === 'configureFinancePeriod') {
        FIN_CONFIRM_STATE.activePeriod = parseInt(arg, 10) || 0;
        FIN_CONFIRM_STATE.periodOpen = true;
        FIN_CONFIRM_STATE.trialView = null;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        return;
      }
      if (act === 'closeFinancePeriod') {
        FIN_CONFIRM_STATE.periodOpen = false;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        return;
      }
      if (act === 'toggleFinanceTrial') {
        FIN_CONFIRM_STATE.trialView = (FIN_CONFIRM_STATE.trialView === arg) ? null : arg;
        FIN_CONFIRM_STATE.periodOpen = false;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        return;
      }
      if (act === 'locateFinanceRow') {
        STRUCTURED_ACTIVE_FIELD.fp3 = parseInt(arg, 10) || 0;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        toast('已在左侧原始报表定位该科目');
        return;
      }
      if (act === 'locateFinanceCheck') {
        var finCheckParts = String(arg || 'is|0').split('|');
        FIN_CONFIRM_STATE.stmt = finCheckParts[0] || 'is';
        FIN_CONFIRM_STATE.showAll = true;
        STRUCTURED_ACTIVE_FIELD.fp3 = parseInt(finCheckParts[1], 10) || 0;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        toast('已定位到对应报表科目');
        return;
      }
      if (act === 'switchStructuredRight') {
        if (CURRENT_CONFIRM) {
          STRUCTURED_RIGHT_TAB[CURRENT_CONFIRM] = arg === 'progress' ? 'progress' : 'fields';
          navigate('confirm/' + CURRENT_CONFIRM);
        }
        return;
      }
      if (act === 'adoptConflictValue') {
        if (!CURRENT_CONFIRM) return;
        var adoptParts = String(arg || '').split('|');
        var cKey = adoptParts[0] || '';
        var cVal = adoptParts[1] || '';
        var cSrc = parseInt(adoptParts[2], 10);
        if (!cKey) return;
        STRUCTURED_VALUES[CURRENT_CONFIRM] = STRUCTURED_VALUES[CURRENT_CONFIRM] || {};
        STRUCTURED_VALUES[CURRENT_CONFIRM][cKey] = cVal;
        if (cKey.indexOf('sumAdopt:') === 0) {
          var sumId = cKey.slice(9);
          var mirrors = SUM_ADOPT_MIRROR[sumId] || [];
          mirrors.forEach(function (mk) {
            STRUCTURED_VALUES[CURRENT_CONFIRM][mk] = _composeMoneyValue(_sumAdoptNorm(cVal), getConfirmMoneyUnit());
          });
        }
        if (!isNaN(cSrc)) CONFIRM_SOURCE_STATE[CURRENT_CONFIRM] = cSrc;
        var fieldLabel = cKey.indexOf('conflict:') === 0 ? cKey.slice(9)
          : (cKey.indexOf('sumAdopt:') === 0
            ? (SUM_ADOPT_WRITE_LABEL[cKey.slice(9)] || cKey.slice(9))
            : cKey);
        var opVerb = cKey.indexOf('sumAdopt:') === 0 ? '合计采用' : '冲突采用';
        STRUCTURED_OP_LOG.push({
          time: (function () { var n = new Date(); return n.getHours() + ':' + String(n.getMinutes()).padStart(2, '0') + ':' + String(n.getSeconds()).padStart(2, '0'); })(),
          who: '王敏',
          msg: opVerb + ' · ' + fieldLabel + ' → ' + cVal
        });
        toast('已采用 ' + fieldLabel + ' = ' + cVal);
        navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'locateStructuredSource') {
        if (CURRENT_CONFIRM) {
          var locateParts = String(arg || '0|0').split('|');
          CONFIRM_SOURCE_STATE[CURRENT_CONFIRM] = parseInt(locateParts[0], 10) || 0;
          STRUCTURED_ACTIVE_FIELD[CURRENT_CONFIRM] = parseInt(locateParts[1], 10) || 0;
          CONFIRM_PREVIEW_COLLAPSED = false; /* 溯源定位时自动展开原文栏 */
          navigate('confirm/' + CURRENT_CONFIRM);
          toast('已定位到原始文件中的提取位置');
        }
        return;
      }
      if (act === 'toggleConfirmPreview') {
        CONFIRM_PREVIEW_COLLAPSED = !CONFIRM_PREVIEW_COLLAPSED;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        return;
      }
      if (act === 'appendProjectFile') {
        var projectFileInput = document.createElement('input');
        projectFileInput.type = 'file';
        projectFileInput.multiple = true;
        projectFileInput.accept = '.pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg';
        projectFileInput.addEventListener('change', function () {
          if (!projectFileInput.files || !projectFileInput.files.length) return;
          toast('补充文件已合并：新增 8 项、覆盖 3 项、发现 1 项冲突');
          projectFileInput.remove();
        });
        document.body.appendChild(projectFileInput);
        projectFileInput.click();
        return;
      }
      if (act === 'switchBizTab') {
        var bizConfirmId = CURRENT_CONFIRM || 'fp3';
        var tabArg = arg;
        if (bizConfirmId === 'fp3') tabArg = _remapConfirmTab(FUND_CONFIRM_TAB_MAP, arg);
        else if (bizConfirmId === 'fp4' || bizConfirmId === 'fp6') tabArg = _remapConfirmTab(DIRECT_CONFIRM_TAB_MAP, arg);
        STRUCTURED_BIZ_TAB[bizConfirmId] = tabArg;
        if (bizConfirmId === 'fp3' && tabArg === '出资与回款') CONFIRM_SOURCE_STATE.fp3 = 1;
        if ((bizConfirmId === 'fp4' || bizConfirmId === 'fp6') && tabArg === '财务数据') CONFIRM_SOURCE_STATE[bizConfirmId] = 0;
        navigate('confirm/' + bizConfirmId);
        return;
      }
      if (act === 'toggleOpLog') {
        STRUCTURED_LOG_OPEN = !STRUCTURED_LOG_OPEN;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        return;
      }
      if (act === 'toggleFinShowAll') {
        var finNow = _financeConfirmData();
        var curSheet = finNow.statements[FIN_CONFIRM_STATE.stmt] || finNow.statements.is;
        var derivedSheet = (curSheet.cols || []).some(function (c) { return c.derived; });
        if (derivedSheet) FIN_CONFIRM_STATE.filterUnbalanced = !FIN_CONFIRM_STATE.filterUnbalanced;
        else FIN_CONFIRM_STATE.showAll = !FIN_CONFIRM_STATE.showAll;
        navigate('confirm/' + (CURRENT_CONFIRM || 'fp3'));
        return;
      }
      if (act === 'saveStructuredDraft') {
        var now = new Date();
        var ts = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
        STRUCTURED_OP_LOG.push({ time: ts, who: '王敏', msg: '暂存草稿 · 当前字段已保留' });
        toast('草稿已暂存');
        return;
      }
      if (act === 'exportConfirmXlsx') {
        poDownloadXlsx(CURRENT_EXPORT_PAYLOAD);
        return;
      }
      if (act === 'removeStructuredRow') {
        /* 仅字段行；底层项目持仓不做「移出本季」／按名删行 */
        if (CURRENT_CONFIRM) {
          var sourceFields = _confirmFields(D().CONFIRMS && D().CONFIRMS[CURRENT_CONFIRM]);
          var visibleFields = sourceFields.filter(function (f, i) { return !(STRUCTURED_REMOVED[CURRENT_CONFIRM] || {})[f.id || i]; });
          var targetField = visibleFields[parseInt(arg, 10) || 0];
          if (targetField) {
            STRUCTURED_REMOVED[CURRENT_CONFIRM] = STRUCTURED_REMOVED[CURRENT_CONFIRM] || {};
            STRUCTURED_REMOVED[CURRENT_CONFIRM][targetField.id || sourceFields.indexOf(targetField)] = true;
          }
          toast('已删除误识别行，系统已重新计算相关合计与指标');
          navigate('confirm/' + CURRENT_CONFIRM);
        }
        return;
      }
      if (act === 'addStructuredRow') {
        if (CURRENT_CONFIRM) {
          var activeConf = D().CONFIRMS && D().CONFIRMS[CURRENT_CONFIRM];
          if (activeConf && activeConf.fields) activeConf.fields.push({ id:'manual-' + Date.now(), name:'新增业务字段', srcVal:'—', mapVal:'', source:'manual', check:'pass' });
          toast('已新增一行，请直接填写最终采用值');
          navigate('confirm/' + CURRENT_CONFIRM);
        }
        return;
      }
      if (act === 'acceptField') {
        if (CURRENT_CONFIRM) CONFIRM_STATE[CURRENT_CONFIRM].fields[arg] = 'accepted';
        toast('已接受该字段');
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'rejectField') {
        if (CURRENT_CONFIRM) CONFIRM_STATE[CURRENT_CONFIRM].fields[arg] = 'rejected';
        toast('已驳回该字段（留痕）');
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'batchConfirm') {
        if (CURRENT_CONFIRM) {
          var _conf = D().CONFIRMS && D().CONFIRMS[CURRENT_CONFIRM];
          var _st = CONFIRM_STATE[CURRENT_CONFIRM];
          var _flds = _confirmFields(_conf);
          _flds.forEach(function (f, i) { _st.fields[i] = 'accepted'; });
          toast('已批量确认全部 ' + _flds.length + ' 字段，可提交');
          navigate('confirm/' + CURRENT_CONFIRM);
        }
        return;
      }
      if (act === 'submitConfirmBlocked') {
        var nBlock = _unmatchedParseEntities().length;
        toast(nBlock ? ('还有 ' + nBlock + ' 个项目未挂到档案，请先在「底层项目」处理') : '请先处理未挂到档案的项目');
        STRUCTURED_BIZ_TAB[CURRENT_CONFIRM || 'fp3'] = '底层项目';
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'setUnderFilter') {
        UNDER_FILTER = arg === 'all' ? 'all' : 'changed';
        UNDER_DRAWER = null;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'openUnderDrawer') {
        UNDER_DRAWER = (UNDER_DRAWER === arg) ? null : arg;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'closeUnderDrawer') {
        UNDER_DRAWER = null;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'toggleUnderPending') {
        UNDER_PENDING_OPEN = !UNDER_PENDING_OPEN;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'toggleUnderEmpty') {
        UNDER_SHOW_EMPTY = !UNDER_SHOW_EMPTY;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'toggleUnderSec') {
        var sp = String(arg || '').split('|');
        var sec = sp[0] || '';
        var defOpen = sp[1] === '1';
        UNDER_SEC_COLLAPSE[sec] = !_underSecCollapsed(sec, defOpen);
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'toggleUnderLong') {
        var lp = String(arg || '').split('|');
        var lk = lp[0] || '';
        var mode = lp[1] || '1';
        if (!lk) return;
        if (mode === '0') UNDER_LONG_EXPAND[lk] = false;
        else if (mode === 'edit') UNDER_LONG_EXPAND[lk] = 'edit';
        else UNDER_LONG_EXPAND[lk] = true;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'focusUnderRow') {
        UNDER_FILTER = 'all';
        UNDER_DRAWER = arg || null;
        UNDER_PENDING_OPEN = true;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        setTimeout(function () {
          var el = document.querySelector('.po-under-row.po-under-open');
          if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 40);
        return;
      }
      if (act === 'underAddRow') {
        toast('Demo：加行后可手工填项目名与金额（正式产品打开空白行）');
        UNDER_FILTER = 'all';
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'searchParseEntity') {
        _openArchivePickModal(arg);
        return;
      }
      if (act === 'createParseEntity') {
        var entId = arg;
        var ent = FUND_PARSE_ENTITIES.filter(function (e) { return e.id === entId; })[0];
        if (!ent) return;
        ENTITY_LINK_STATE[entId] = 'created';
        ENTITY_LINK_TARGET[entId] = { id: 'new-' + entId, name: ent.name };
        STRUCTURED_OP_LOG.push({
          time: (function () { var n = new Date(); return n.getHours() + ':' + String(n.getMinutes()).padStart(2, '0') + ':' + String(n.getSeconds()).padStart(2, '0'); })(),
          who: '王敏',
          msg: '新建档案 · ' + (ent.srcVal || ent.name)
        });
        toast('已新建「' + ent.name + '」档案');
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'dismissDeriveBanner') {
        FIN_CONFIRM_STATE.deriveBannerClosed = true;
        if (CURRENT_CONFIRM) navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      if (act === 'submitConfirm') {
        var stillUnmatched = _unmatchedParseEntities();
        if (stillUnmatched.length && (CURRENT_CONFIRM === 'fp3' || (CURRENT_CONFIRM && String(CURRENT_CONFIRM).indexOf('fp3') === 0))) {
          toast('还有 ' + stillUnmatched.length + ' 个项目未挂到档案');
          return;
        }
        showSubmitConfirm();
        return;
      }
      if (act === 'treeCat') {
        var cat = arg;
        BROWSER_STATE.expanded[cat] = !BROWSER_STATE.expanded[cat];
        var keys = [];
        (D().BROWSER_TREE || []).forEach(function (g) { if (g.cat === cat) g.items.forEach(function (it) { keys.push(it.key); }); });
        var cur = _pendingKeys();
        var anyVisible = keys.some(function (k) { return cur.indexOf(k) >= 0; });
        if (anyVisible) cur = cur.filter(function (k) { return keys.indexOf(k) < 0; });
        else keys.forEach(function (k) { if (cur.indexOf(k) < 0) cur.push(k); });
        _setPending(cur);
        navigate('post-browser');
        return;
      }
      if (act === 'treeLeaf') {
        _toggleKey(arg);
        navigate('post-browser');
        return;
      }
      /* 提取数据：将待提取指标同步为已生效，刷新表格 */
      if (act === 'extractData') {
        _setVisible(BROWSER_STATE.pendingVisible);
        navigate('post-browser');
        return;
      }
      if (act === 'filterStage') {
        PROJECT_FILTER.stage = arg;
        navigate('projects');
        return;
      }
      if (act === 'filterType') {
        PROJECT_FILTER.type = arg;
        navigate('projects');
        return;
      }
      if (act === 'clearProjectFilters') {
        PROJECT_FILTER = { stage:'全部', type:'direct', fundId:'all', owner:'all', search:'' };
        navigate('projects');
        return;
      }
      if (act === 'clearSnapshotFilters') {
        SNAPSHOT_FILTER = { stageIn:'all', type:'all', fundId:'all', owner:'all', industry:'all', search:'', extraDim: SNAPSHOT_FILTER.extraDim || 'region' };
        navigate('snapshot');
        return;
      }
      if (act === 'setSnapExtraDim') {
        var dimParts = String(arg || '').split('|');
        var dimPage = dimParts[0];
        var dimId = dimParts[1] || 'region';
        if (dimPage === 'fund') {
          FUND_SNAP_STATE.extraDim = dimId;
          navigate('fund-snapshot');
        } else {
          SNAPSHOT_FILTER.extraDim = dimId;
          navigate('snapshot');
        }
        return;
      }
      if (act === 'batchImport') {
        showProjectBatchImport();
        return;
      }
      if (act === 'projectCreate') {
        showProjectForm();
        return;
      }
      if (act === 'projectSingle') {
        showProjectForm();
        return;
      }
      if (act === 'projectEdit') {
        showProjectForm(arg);
        return;
      }
      if (act === 'projectRemove') {
        confirmProjectRemove(arg);
        return;
      }
      if (act === 'fundCreate') {
        showFundForm();
        return;
      }
      if (act === 'clearFundFilters') {
        FUND_FILTER = { search:'', management:'all', strategy:'all', status:'all', manager:'all' };
        navigate('fund');
        return;
      }
      if (act === 'fundEdit') {
        showFundForm(arg);
        return;
      }
      if (act === 'fundRemove') {
        confirmFundRemove(arg);
        return;
      }
      if (act === 'marketKind') {
        MARKET_STATE.kind = arg;
        navigate('skills');
        return;
      }
      if (act === 'marketScope') {
        MARKET_STATE.scope = arg;
        navigate('skills');
        return;
      }
      if (act === 'useSkill') {
        if (arg === '投委会对抗预演') { navigate('redblue'); return; } /* 红蓝对抗：直接进入对抗预演效果页 */
        HOME_STATE.draft = '@' + arg + ' ';
        toast('「' + arg + '」已启用，可在对话中调用');
        navigate('home');
        return;
      }
      if (act === 'debatePoint') {
        DEBATE_OPEN[arg] = !(DEBATE_OPEN[arg] === true);
        navigate('redblue');
        return;
      }
      if (act === 'debateBack') {
        navigate('home');
        return;
      }
      if (act === 'debatePick') {
        var dp = (arg || '').split(':');
        if (dp.length === 2) {
          var side = dp[0], id = dp[1];
          var arr = DEBATE_SETUP[side] = DEBATE_SETUP[side] || [];
          var i = arr.indexOf(id);
          if (i >= 0) { arr.splice(i, 1); }
          else {
            if (arr.length >= 4) { toast('每个方面最多选择 4 位专家'); return; }
            arr.push(id);
          }
        }
        navigate('redblue-setup');
        return;
      }
      if (act === 'debateStart') {
        DEBATE_PICK.red = (DEBATE_SETUP.red || []).slice();
        DEBATE_PICK.blue = (DEBATE_SETUP.blue || []).slice();
        navigate('redblue');
        return;
      }
      if (act === 'summonExpert') {
        HOME_STATE.draft = '@' + arg + ' ';
        toast('已召唤「' + arg + '」进入对话');
        navigate('home');
        return;
      }
      if (act === 'expertInvite') {
        toast('邀请链接已生成，可分享给外部专家入驻');
        return;
      }
      if (act === 'connectToggle') {
        toast('连接器「' + arg + '」设置已更新');
        return;
      }
      if (act === 'openMarketCreate') {
        toast('创建流程演示：填写名称、说明与标签后即可发布');
        return;
      }
      /* —— 对话详情交互 —— */
      if (act === 'chatBack') {
        /* 项目对话返回项目详情，独立对话返回首页 */
        var curR = _ctx && _ctx.state && _ctx.state.route;
        var cm = curR ? /^project\/([^/]+)\/chat\//.exec(curR) : null;
        navigate(cm ? 'project/' + cm[1] : 'home');
        return;
      }
      if (act === 'chatProjToggle') {
        CHAT_CTX_STATE.projOpen[arg] = !(CHAT_CTX_STATE.projOpen[arg] === true);
        var curRP = _ctx && _ctx.state && _ctx.state.route;
        if (curRP) navigate(curRP);
        return;
      }
      if (act === 'wsTab') {
        CHAT_CTX_STATE.wsTab = arg;
        var curRW = _ctx && _ctx.state && _ctx.state.route;
        if (curRW) navigate(curRW);
        return;
      }
      if (act === 'toggleWorkspace') {
        CHAT_CTX_STATE.wsOpen = !CHAT_CTX_STATE.wsOpen;
        if (!CHAT_CTX_STATE.wsOpen) CHAT_CTX_STATE.artifactFocus = false;
        var curWsRoute = _ctx && _ctx.state && _ctx.state.route;
        if (curWsRoute) navigate(curWsRoute);
        return;
      }
      if (act === 'toggleArtifactFocus') {
        CHAT_CTX_STATE.wsOpen = true;
        CHAT_CTX_STATE.artifactFocus = !CHAT_CTX_STATE.artifactFocus;
        var curFocusRoute = _ctx && _ctx.state && _ctx.state.route;
        if (curFocusRoute) navigate(curFocusRoute);
        return;
      }
      if (act === 'workspaceAdd') {
        toast('从中间任务区点击文件或产出卡片，即可在右侧打开新的标签页');
        return;
      }
      if (act === 'chatNewTask') {
        var nid = _createChatFromQuestion('');
        navigate('chat/' + nid);
        return;
      }
      if (act === 'toggleProjectGroup') {
        /* key: "archive-<pid>" */
        PRJ_TOGGLE[arg] = PRJ_TOGGLE[arg] || { open: false };
        PRJ_TOGGLE[arg].open = !PRJ_TOGGLE[arg].open;
        var curRtg = _ctx && _ctx.state && _ctx.state.route;
        if (curRtg) navigate(curRtg);
        return;
      }
      if (act === 'chatTaskMenu') {
        /* 会话 ⋯ 菜单：重命名/复制/归档/删除（Codex Task Card 菜单） */
        showChatTaskMenu(arg);
        return;
      }
      if (act === 'chatScenario') {
        var ci = document.getElementById('poChatInput');
        if (ci) { ci.value = arg + '：'; ci.focus(); }
        return;
      }
      if (act === 'chatSend') {
        var csi = document.getElementById('poChatInput');
        var ct = csi ? csi.value.trim() : '';
        if (!ct) { toast('请输入消息'); return; }
        CHAT_CTX_STATE.draft = '';
        _chatSend(arg, ct);
        return;
      }
      if (act === 'chatFileView') {
        toast('打开文件预览：' + arg);
        return;
      }
      if (act === 'chatGotoConfirm') {
        /* 找该项目待确认文件，跳转确认页 */
        var d = D();
        var pending = (d.FILES && d.FILES.pending) || [];
        var target = null;
        for (var pi = 0; pi < pending.length; pi++) { if (pending[pi].project === arg) { target = pending[pi]; break; } }
        if (target) navigate('confirm/' + target.id);
        else { toast('该项目暂无待确认文件'); navigate('project/' + arg); }
        return;
      }
      /* Artifact 交互 */
      if (act === 'pickArtifact') {
        CHAT_CTX_STATE.activeArtifactIdx = parseInt(arg) || 0;
        CHAT_CTX_STATE.wsOpen = true;
        var curRoute2 = _ctx && _ctx.state && _ctx.state.route;
        if (curRoute2) navigate(curRoute2);
        return;
      }
      if (act === 'toggleThinking') {
        THINKING_OPEN[arg] = !(THINKING_OPEN[arg] === true);
        var curRt = _ctx && _ctx.state && _ctx.state.route;
        if (curRt) navigate(curRt);
        return;
      }
      if (act === 'chatResultNav') {
        navigate(arg);
        return;
      }
      if (act === 'copyArtifact') {
        var curR2 = _ctx && _ctx.state && _ctx.state.route;
        var cm2 = curR2 ? /^chat\/(.+)$/.exec(curR2) : null;
        if (cm2) {
          var chatC = _findChat(cm2[1]);
          var msgsC = (chatC && chatC.messages) || [];
          var artsC = _collectArtifacts(msgsC);
          var artC = artsC[CHAT_CTX_STATE.activeArtifactIdx];
          if (artC && artC.content) {
            try { navigator.clipboard.writeText(artC.content); } catch(e) {}
            toast('已复制「' + (artC.title||'') + '」全部内容');
          }
        }
        return;
      }
      if (act === 'downloadArtifact') {
        var curR3 = _ctx && _ctx.state && _ctx.state.route;
        var cm3 = curR3 ? /^chat\/(.+)$/.exec(curR3) : null;
        if (cm3) {
          var chatD = _findChat(cm3[1]);
          var msgsD = (chatD && chatD.messages) || [];
          var artsD = _collectArtifacts(msgsD);
          var artD = artsD[CHAT_CTX_STATE.activeArtifactIdx];
          if (artD && artD.content) {
            var blob = new Blob([artD.content], { type: 'text/markdown;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = artD.filename || 'output.md';
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
            toast('已下载「' + (artD.filename||'') + '」');
          }
        }
        return;
      }
      if (act === 'switchFinStmt') {
        if (CURRENT_CONFIRM) CONFIRM_SHEET_STATE[CURRENT_CONFIRM] = arg;
        navigate('confirm/' + CURRENT_CONFIRM);
        return;
      }
      /* —— 科目配置交互 —— */
      if (act === 'finTab') {
        FIN_STATE.tab = arg;
        navigate('finance-config');
        return;
      }
      if (act === 'finStmt') {
        FIN_STATE.stmt = arg;
        FIN_STATE.subjectId = null;
        navigate('finance-config');
        return;
      }
      if (act === 'finSelectSubject') {
        FIN_STATE.subjectId = arg;
        navigate('finance-config');
        return;
      }
      if (act === 'finSwitchCfg') {
        FIN_STATE.configId = arg;
        FIN_STATE.subjectId = null;
        window.__FIN_CFG__ = null; /* 切换配置集清缓存 */
        navigate('finance-config');
        return;
      }
      if (act === 'finPublish') {
        var cfgPub = _finConfig();
        _saveFinConfig(cfgPub);
        toast('已发布 · 新任务将使用当前配置');
        return;
      }
      /* 新增指标 */
      if (act === 'finNewMetric') {
        var cfgM = _finConfig();
        cfgM.metrics = cfgM.metrics || [];
        cfgM.metrics.push({ id: _finUid('m'), name: '新指标', unit: '%', formula: '', desc: '' });
        _saveFinConfig(cfgM);
        navigate('finance-config');
        return;
      }
      /* 新增规则 */
      if (act === 'finNewRule') {
        var cfgR = _finConfig();
        cfgR.rules = cfgR.rules || [];
        cfgR.rules.push({ id: _finUid('r'), name: '新规则', type: 'balance', stmt: 'bs', formula: '', enabled: true });
        _saveFinConfig(cfgR);
        navigate('finance-config');
        return;
      }
      /* 删除指标/规则 */
      if (act === 'finDelMetric') {
        var cfgDM = _finConfig();
        cfgDM.metrics = (cfgDM.metrics || []).filter(function(m){ return m.id !== arg; });
        _saveFinConfig(cfgDM);
        navigate('finance-config');
        return;
      }
      if (act === 'finDelRule') {
        var cfgDR = _finConfig();
        cfgDR.rules = (cfgDR.rules || []).filter(function(r){ return r.id !== arg; });
        _saveFinConfig(cfgDR);
        navigate('finance-config');
        return;
      }
      /* —— 指标/规则编辑态 —— */
      if (act === 'finEditMetric') {
        FIN_STATE.editMetricId = arg; FIN_STATE.editRuleId = null;
        var met = (_finConfig().metrics||[]).filter(function(m){return m.id===arg;})[0];
        if (met) {
          FIN_STATE.editTemplate = met.formulaSlots && met.formulaSlots.length ? 'ratio' : (met.formula ? 'custom' : 'ratio');
          FIN_STATE.editCustomFormula = met.formula || '';
          FIN_STATE.editSlots = met.formulaSlots ? met.formulaSlots.slice() : [];
          FIN_STATE.editName = met.name || '';
          FIN_STATE.editUnit = met.unit || '';
          FIN_STATE.editCat = met.category || '';
          FIN_STATE.editPeriodRule = met.periodRule || 'point';
          FIN_STATE.editMetricScope = met.scope || 'all';
          FIN_STATE.editMetricMissing = met.missing || 'skip';
        }
        navigate('finance-config');
        return;
      }
      if (act === 'finEditRule') {
        FIN_STATE.editRuleId = arg; FIN_STATE.editMetricId = null;
        var rl = (_finConfig().rules||[]).filter(function(r){return r.id===arg;})[0];
        if (rl) {
          FIN_STATE.editRuleName = rl.name || '';
          FIN_STATE.editRuleType = rl.type || 'balance';
          FIN_STATE.editRuleStmt = rl.stmt || '';
          FIN_STATE.editRuleFormula = rl.formula || '';
          FIN_STATE.editRuleTolerance = rl.tolerance || '';
          FIN_STATE.editRuleException = rl.exception || '';
        }
        navigate('finance-config');
        return;
      }
      if (act === 'finPickTpl') {
        FIN_STATE.editTemplate = arg; FIN_STATE.editSlots = [];
        navigate('finance-config');
        return;
      }
      if (act === 'finPickSlot') {
        var slotIdx = parseInt(arg);
        if (!FIN_STATE.editSlots) FIN_STATE.editSlots = [];
        FIN_STATE.editSlots[slotIdx] = el.value;
        navigate('finance-config');
        return;
      }
      if (act === 'finSaveEdit') {
        var cfgE = _finConfig();
        /* 指标保存 */
        if (FIN_STATE.editMetricId) {
          var met2 = (cfgE.metrics||[]).filter(function(m){return m.id===FIN_STATE.editMetricId;})[0];
          if (met2) {
            met2.name = FIN_STATE.editName || met2.name;
            met2.unit = FIN_STATE.editUnit || '';
            met2.category = FIN_STATE.editCat || '';
            met2.periodRule = (FIN_STATE.editPeriodRule) || 'point';
            met2.scope = (FIN_STATE.editMetricScope) || 'all';
            met2.missing = (FIN_STATE.editMetricMissing) || 'skip';
            var tplId = FIN_STATE.editTemplate || 'custom';
            if (tplId === 'custom') {
              met2.formula = FIN_STATE.editCustomFormula || '';
              met2.formulaSlots = [];
            } else {
              met2.formulaSlots = FIN_STATE.editSlots ? FIN_STATE.editSlots.slice() : [];
              var tpl = [{id:'ratio',fn:function(s){return s[0]+' / '+s[1];}},{id:'margin',fn:function(s){return '('+s[0]+' - '+s[1]+') / '+s[2];}},{id:'diff',fn:function(s){return s[0]+' - '+s[1];}},{id:'turnover',fn:function(s){return s[0]+' / '+s[1]+' * 365';}},{id:'multiplier',fn:function(s){return s[0]+' / '+s[1];}}].filter(function(t){return t.id===tplId;})[0];
              if (tpl) met2.formula = tpl.fn([FIN_STATE.editSlots[0]||'?',FIN_STATE.editSlots[1]||'?',FIN_STATE.editSlots[2]||'?']);
            }
          }
        }
        /* 规则保存 */
        if (FIN_STATE.editRuleId) {
          var rl2 = (cfgE.rules||[]).filter(function(r){return r.id===FIN_STATE.editRuleId;})[0];
          if (rl2) {
            rl2.name = FIN_STATE.editRuleName || rl2.name;
            rl2.type = FIN_STATE.editRuleType || rl2.type;
            rl2.stmt = FIN_STATE.editRuleStmt || rl2.stmt;
            rl2.formula = FIN_STATE.editRuleFormula || rl2.formula;
            rl2.tolerance = FIN_STATE.editRuleTolerance || '';
            rl2.exception = FIN_STATE.editRuleException || '';
            rl2.enabled = true;
          }
        }
        /* 期间口径保存 */
        if (FIN_STATE.editPeriodId) {
          var pe2 = (cfgE.periodCalibers||[]).filter(function(p){return p.id===FIN_STATE.editPeriodId;})[0];
          if (pe2) {
            pe2.name = FIN_STATE.editPeriodName || pe2.name;
            pe2.desc = FIN_STATE.editPeriodDesc || '';
          }
        }
        /* 母基金字段保存 */
        if (FIN_STATE.editFundFieldId) {
          var ff2 = (cfgE.fundFields||[]).filter(function(f){return f.id===FIN_STATE.editFundFieldId;})[0];
          if (ff2) {
            ff2.name = FIN_STATE.editFFName || ff2.name;
            ff2.unit = FIN_STATE.editFFUnit || '';
            ff2.aliases = FIN_STATE.editFFAliases || '';
            ff2.priority = FIN_STATE.editFFPriority || ff2.priority;
            ff2.method = FIN_STATE.editFFMethod || ff2.method;
            ff2.layer = FIN_STATE.editFFLayer || ff2.layer;
          }
        }
        _saveFinConfig(cfgE);
        FIN_STATE.editMetricId = null; FIN_STATE.editRuleId = null; FIN_STATE.editPeriodId = null; FIN_STATE.editFundFieldId = null;
        FIN_STATE.editName = ''; FIN_STATE.editUnit = ''; FIN_STATE.editCat = '';
        FIN_STATE.editRuleName = ''; FIN_STATE.editRuleType = ''; FIN_STATE.editRuleStmt = ''; FIN_STATE.editRuleFormula = '';
        FIN_STATE.editPeriodName = ''; FIN_STATE.editPeriodDesc = '';
        FIN_STATE.editFFName = ''; FIN_STATE.editFFUnit = ''; FIN_STATE.editFFAliases = ''; FIN_STATE.editFFPriority = ''; FIN_STATE.editFFMethod = ''; FIN_STATE.editFFLayer = '';
        navigate('finance-config');
        return;
      }
      if (act === 'finCancelEdit') {
        FIN_STATE.editMetricId = null; FIN_STATE.editRuleId = null; FIN_STATE.editPeriodId = null; FIN_STATE.editFundFieldId = null;
        FIN_STATE.editName = ''; FIN_STATE.editUnit = ''; FIN_STATE.editCat = '';
        FIN_STATE.editRuleName = ''; FIN_STATE.editRuleType = ''; FIN_STATE.editRuleStmt = ''; FIN_STATE.editRuleFormula = '';
        FIN_STATE.editPeriodName = ''; FIN_STATE.editPeriodDesc = '';
        FIN_STATE.editFFName = ''; FIN_STATE.editFFUnit = ''; FIN_STATE.editFFAliases = ''; FIN_STATE.editFFPriority = ''; FIN_STATE.editFFMethod = ''; FIN_STATE.editFFLayer = '';
        navigate('finance-config');
        return;
      }
      /* —— 科目增删 —— */
      if (act === 'finNewSubject') {
        var stmt = el.getAttribute('data-stmt') || FIN_STATE.stmt;
        var cfgSub = _finConfig();
        cfgSub.subjects = cfgSub.subjects || {};
        cfgSub.subjects[stmt] = cfgSub.subjects[stmt] || [];
        cfgSub.subjects[stmt].push({ id: _finUid('sub'), name: '新科目', aliases: '' });
        _saveFinConfig(cfgSub);
        navigate('finance-config');
        return;
      }
      if (act === 'finDelSubject') {
        if (!confirm('确认删除该科目？')) return;
        var cfgDel = _finConfig();
        cfgDel.subjects = cfgDel.subjects || {};
        Object.keys(cfgDel.subjects).forEach(function(k){
          cfgDel.subjects[k] = (cfgDel.subjects[k]||[]).filter(function(s){return s.id !== arg;});
        });
        _saveFinConfig(cfgDel);
        FIN_STATE.subjectId = null;
        navigate('finance-config');
        return;
      }
      /* —— 期间口径增删改 —— */
      if (act === 'finNewPeriod') {
        var cfgP = _finConfig();
        cfgP.periodCalibers = cfgP.periodCalibers || [];
        cfgP.periodCalibers.push({ id: _finUid('p'), name: '新口径', desc: '', accumulation: true, singleMonth: true });
        _saveFinConfig(cfgP);
        navigate('finance-config');
        return;
      }
      if (act === 'finEditPeriod') {
        FIN_STATE.editPeriodId = arg; FIN_STATE.editRuleId = null; FIN_STATE.editMetricId = null; FIN_STATE.editFundFieldId = null;
        var p = (_finConfig().periodCalibers||[]).filter(function(x){return x.id===arg;})[0];
        if (p) { FIN_STATE.editPeriodName = p.name; FIN_STATE.editPeriodDesc = p.desc||''; }
        navigate('finance-config');
        return;
      }
      if (act === 'finDelPeriod') {
        var cfgDP = _finConfig();
        cfgDP.periodCalibers = (cfgDP.periodCalibers||[]).filter(function(x){return x.id!==arg;});
        _saveFinConfig(cfgDP);
        navigate('finance-config');
        return;
      }
      /* —— 母基金字段增删改 —— */
      if (act === 'finNewFundField') {
        var cfgF = _finConfig();
        cfgF.fundFields = cfgF.fundFields || [];
        cfgF.fundFields.push({ id: _finUid('ff'), name: '新字段', aliases: '', unit: '万元', layer: 'fund', priority: 'gp-report', method: 'extract', required: true });
        _saveFinConfig(cfgF);
        navigate('finance-config');
        return;
      }
      if (act === 'finEditFundField') {
        FIN_STATE.editFundFieldId = arg; FIN_STATE.editRuleId = null; FIN_STATE.editMetricId = null; FIN_STATE.editPeriodId = null;
        var ff = (_finConfig().fundFields||[]).filter(function(x){return x.id===arg;})[0];
        if (ff) { FIN_STATE.editFFName = ff.name; FIN_STATE.editFFUnit = ff.unit||''; FIN_STATE.editFFAliases = ff.aliases||''; FIN_STATE.editFFPriority = ff.priority||''; FIN_STATE.editFFMethod = ff.method||''; FIN_STATE.editFFLayer = ff.layer||'fund'; }
        navigate('finance-config');
        return;
      }
      if (act === 'finDelFundField') {
        var cfgDF = _finConfig();
        cfgDF.fundFields = (cfgDF.fundFields||[]).filter(function(x){return x.id!==arg;});
        _saveFinConfig(cfgDF);
        navigate('finance-config');
        return;
      }
      if (act === 'finUploadSubjects') {
        var fi = document.createElement('input');
        fi.type = 'file';
        fi.accept = '.xlsx,.xls,.csv';
        fi.style.display = 'none';
        fi.addEventListener('change', function () {
          var n = fi.files && fi.files.length ? fi.files[0].name : '';
          if (n) toast('已导入「' + n + '」科目表');
          document.body.removeChild(fi);
        });
        document.body.appendChild(fi);
        fi.click();
        return;
      }
      /* 列表翻页（通用） */
      if (act === 'listPageSize') {
        var sz = (arg || '').split('|');
        var sk = sz[0]; var sn = parseInt(sz[1], 10);
        if (sk && (sn === 10 || sn === 50 || sn === 100)) {
          _pagerState(sk).size = sn;
          _pagerState(sk).page = 1;
          _pagerNavigate(sk);
        }
        return;
      }
      if (act === 'listPage') {
        var pg = (arg || '').split('|');
        var pk = pg[0]; var dir = pg[1];
        if (pk && dir) {
          var st = _pagerState(pk);
          if (dir === 'prev' && st.page > 1) st.page -= 1;
          if (dir === 'next') st.page += 1;
          _pagerNavigate(pk);
        }
        return;
      }
      /* 系统管理 */
      if (act === 'adminTab') { FIN_STATE.tab = arg; navigate('admin'); return; }
      if (act === 'adminNewUser') {
        var overlay = document.createElement('div');
        overlay.className = 'po-crud-mask';
        overlay.innerHTML = '<div class="po-crud-dialog" style="width:min(440px,96vw)">'
          + '<div class="po-crud-head"><div><h3>新增用户</h3><p>带 <span class="po-req">*</span> 为必填</p></div><button type="button" class="po-crud-x" id="adminNewCancel">×</button></div>'
          + '<div class="po-crud-body">' + _adminUserFormFields() + '</div>'
          + '<div class="po-crud-actions"><button type="button" class="po-btn" id="adminNewCancel2">取消</button><button type="button" class="po-btn po-btn-primary" id="adminNewOk">确认新增</button></div>'
          + '</div>';
        document.body.appendChild(overlay);
        function closeAdminNew() { overlay.remove(); }
        overlay.querySelector('#adminNewCancel').addEventListener('click', closeAdminNew);
        overlay.querySelector('#adminNewCancel2').addEventListener('click', closeAdminNew);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closeAdminNew(); });
        var nameEl = overlay.querySelector('#adminNewName');
        var phoneEl = overlay.querySelector('#adminNewPhone');
        function setFieldErr(input, errId, msg, on) {
          var err = overlay.querySelector('#' + errId);
          if (on) { input.classList.add('invalid'); if (err) { err.textContent = msg; err.classList.add('on'); } }
          else { input.classList.remove('invalid'); if (err) err.classList.remove('on'); }
        }
        function validateAdminUser() {
          var nm = (nameEl.value || '').trim();
          var ph = (phoneEl.value || '').replace(/\s+/g, '');
          var ok = true;
          if (!nm) { setFieldErr(nameEl, 'adminErrName', '请填写姓名', true); ok = false; }
          else setFieldErr(nameEl, 'adminErrName', '', false);
          if (!ph) { setFieldErr(phoneEl, 'adminErrPhone', '请填写手机号', true); ok = false; }
          else if (!/^1\d{10}$/.test(ph)) { setFieldErr(phoneEl, 'adminErrPhone', '请填写 11 位手机号', true); ok = false; }
          else {
            var dup = _adminUsers().some(function (u) { return String(u.phone || '').replace(/\s+/g, '') === ph; });
            if (dup) { setFieldErr(phoneEl, 'adminErrPhone', '该手机号已存在', true); ok = false; }
            else setFieldErr(phoneEl, 'adminErrPhone', '', false);
          }
          return ok ? { name: nm, phone: ph } : null;
        }
        nameEl.addEventListener('blur', function () { validateAdminUser(); });
        phoneEl.addEventListener('blur', function () { validateAdminUser(); });
        overlay.querySelector('#adminNewOk').addEventListener('click', function () {
          var v = validateAdminUser();
          if (!v) return;
          var dp = ((document.getElementById('adminNewDept') || {}).value || '').trim();
          var tt = ((document.getElementById('adminNewTitle') || {}).value || '').trim();
          var aus = _adminUsers();
          aus.push({ id: _finUid('u'), name: v.name, phone: v.phone, dept: dp, title: tt, status: 'active', lastLogin: '—' });
          _saveAdminUsers(aus);
          _pushAdminLog({
            time: _nowStamp(), actor: '王敏', action: '新增', module: '系统管理',
            object: '用户 · ' + v.name,
            before: '—',
            after: '手机 ' + v.phone + (dp ? ' · ' + dp : '') + (tt ? ' · ' + tt : '')
          });
          overlay.remove();
          navigate('admin');
        });
        setTimeout(function () { nameEl.focus(); }, 0);
        return;
      }
      if (act === 'adminEditUser') {
        var editU = _adminUsers().filter(function (u) { return u.id === arg; })[0];
        if (!editU) { toast('用户不存在'); return; }
        var editOv = document.createElement('div');
        editOv.className = 'po-crud-mask';
        editOv.innerHTML = '<div class="po-crud-dialog" style="width:min(440px,96vw)">'
          + '<div class="po-crud-head"><div><h3>编辑用户</h3><p>手机号不可改</p></div><button type="button" class="po-crud-x" id="adminEditCancel">×</button></div>'
          + '<div class="po-crud-body">' + _adminUserFormFields(editU) + '</div>'
          + '<div class="po-crud-actions"><button type="button" class="po-btn" id="adminEditCancel2">取消</button><button type="button" class="po-btn po-btn-primary" id="adminEditOk">保存</button></div>'
          + '</div>';
        document.body.appendChild(editOv);
        function closeAdminEdit() { editOv.remove(); }
        editOv.querySelector('#adminEditCancel').addEventListener('click', closeAdminEdit);
        editOv.querySelector('#adminEditCancel2').addEventListener('click', closeAdminEdit);
        editOv.addEventListener('click', function (e) { if (e.target === editOv) closeAdminEdit(); });
        var en = editOv.querySelector('#adminNewName');
        editOv.querySelector('#adminEditOk').addEventListener('click', function () {
          var nm = (en.value || '').trim();
          var err = editOv.querySelector('#adminErrName');
          if (!nm) { en.classList.add('invalid'); if (err) { err.textContent = '请填写姓名'; err.classList.add('on'); } return; }
          var dp = ((editOv.querySelector('#adminNewDept') || {}).value || '').trim();
          var tt = ((editOv.querySelector('#adminNewTitle') || {}).value || '').trim();
          var before = '姓名 ' + editU.name + (editU.dept ? ' · ' + editU.dept : '') + (editU.title ? ' · ' + editU.title : '');
          var all = _adminUsers().map(function (u) {
            if (u.id !== editU.id) return u;
            return { id: u.id, name: nm, phone: u.phone, dept: dp, title: tt, status: u.status, lastLogin: u.lastLogin };
          });
          _saveAdminUsers(all);
          _pushAdminLog({
            time: _nowStamp(), actor: '王敏', action: '修改', module: '系统管理',
            object: '用户 · ' + nm,
            before: before,
            after: '姓名 ' + nm + (dp ? ' · ' + dp : '') + (tt ? ' · ' + tt : '')
          });
          closeAdminEdit();
          navigate('admin');
        });
        setTimeout(function () { en.focus(); }, 0);
        return;
      }
      if (act === 'adminCopyLogId') {
        var idText = arg || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(idText).then(function () { toast('已复制记录号'); }).catch(function () { toast(idText); });
        } else {
          toast(idText);
        }
        return;
      }
      if (act === 'adminLogFind') {
        var qEl = document.getElementById('adminLogQ');
        FIN_STATE.adminLogQ = ((qEl && qEl.value) || '').trim();
        FIN_STATE.tab = 'logs';
        if (FIN_STATE.adminLogQ) {
          var hit = _adminLogs().some(function (r) { return r.id === FIN_STATE.adminLogQ; });
          if (!hit) toast('没有这条记录');
        }
        navigate('admin');
        return;
      }
      if (act === 'adminDelUser') {
        var delU = _adminUsers().filter(function (u) { return u.id === arg; })[0];
        if (!delU) { toast('用户不存在'); return; }
        var delOv = document.createElement('div');
        delOv.className = 'po-crud-mask';
        delOv.innerHTML = '<div class="po-crud-dialog" style="width:min(420px,96vw)">'
          + '<div class="po-crud-head"><div><h3>确认删除</h3><p>删除后可用该手机号重新开通</p></div><button type="button" class="po-crud-x" id="adminDelCancel">×</button></div>'
          + '<div class="po-crud-body"><p style="margin:0;font-size:14px;line-height:1.6;color:var(--po-ink)">确定删除用户「' + esc(delU.name) + '」（' + esc(delU.phone || '—') + '）？</p></div>'
          + '<div class="po-crud-actions"><button type="button" class="po-btn" id="adminDelCancel2">取消</button><button type="button" class="po-btn po-btn-danger" id="adminDelOk">确认删除</button></div>'
          + '</div>';
        document.body.appendChild(delOv);
        function closeAdminDel() { delOv.remove(); }
        delOv.querySelector('#adminDelCancel').addEventListener('click', closeAdminDel);
        delOv.querySelector('#adminDelCancel2').addEventListener('click', closeAdminDel);
        delOv.addEventListener('click', function (e) { if (e.target === delOv) closeAdminDel(); });
        delOv.querySelector('#adminDelOk').addEventListener('click', function () {
          var ads = _adminUsers().filter(function (u) { return u.id !== delU.id; });
          _saveAdminUsers(ads);
          _pushAdminLog({
            time: _nowStamp(), actor: '王敏', action: '删除', module: '系统管理',
            object: '用户 · ' + delU.name,
            before: '手机 ' + (delU.phone || '—') + (delU.dept ? ' · ' + delU.dept : '') + (delU.title ? ' · ' + delU.title : ''),
            after: '已删除'
          });
          closeAdminDel();
          navigate('admin');
        });
        return;
      }
      /* 台账包导出：委托 pe-post-export（连萝卜带根，范围＝当前筛选） */
      if (act === 'exportFundsCSV') {
        if (window.PE_POST_EXPORT && window.PE_POST_EXPORT.exportFunds) window.PE_POST_EXPORT.exportFunds(FUND_FILTER);
        else toast('导出模块未加载，请刷新页面');
        return;
      }
      if (act === 'exportProjectsCSV') {
        if (window.PE_POST_EXPORT && window.PE_POST_EXPORT.exportProjects) window.PE_POST_EXPORT.exportProjects(PROJECT_FILTER);
        else toast('导出模块未加载，请刷新页面');
        return;
      }
      if (act === 'openProjectChat') {
        var allChats = _allChats();
        var existChat = null;
        for (var ci2 = 0; ci2 < allChats.length; ci2++) { if (allChats[ci2].type === 'project' && allChats[ci2].projectId === arg) { existChat = allChats[ci2]; break; } }
        var chatId2 = existChat ? existChat.id : _createProjectChat(arg);
        navigate('project/' + arg + '/chat/' + chatId2);
        return;
      }
      if (act === 'uploadMaterial') {
        var store = window.PE_POST_STORE;
        var umId = arg;
        var _umFund = store && store.fund(umId);
        var _umFundMockNames = ['季报-2026Q2.pdf','基金年报-2025FY.pdf','LP分配通知-2026Q2.pdf','审计报告-2025FY.xlsx','投资委托协议-修订版.pdf'];
        var _umProjMockNames = ['季报-2026Q2.pdf','融资协议-B轮.pdf','审计报告-2025FY.xlsx','股权架构图-最新.docx','投资备忘录-修订版.pdf'];
        if (_umFund) {
          var _umMockName = _umFundMockNames[Math.floor(_umFund.name.length % _umFundMockNames.length)];
          var _umMats = (_umFund.materials || []).slice();
          _umMats.push({ id: 'mat-' + Date.now().toString(36), name: _umFund.name+'-'+_umMockName, type: _umMockName.split('.').pop().toUpperCase(), date: new Date().toISOString().slice(0, 10), status: '待归档', size: Math.floor(Math.random() * 8000 + 500) + 'KB', tags: [] });
          store.saveFund(Object.assign({}, _umFund, { materials: _umMats }));
          toast('已上传「' + _umFund.name + '-' + _umMockName + '」');
          DETAIL_STATE.fundTabs[umId] = 'materials';
          navigate('fund/' + umId);
        } else {
          var proj = store && store.project(umId);
          var _umMockName = proj ? _umProjMockNames[Math.floor(proj.name.length % _umProjMockNames.length)] : '文件';
          if (proj) {
            var _umMats = (proj.materials || []).slice();
            _umMats.push({ id: 'mat-' + Date.now().toString(36), name: _umMockName, type: _umMockName.split('.').pop().toUpperCase(), date: new Date().toISOString().slice(0, 10), size: Math.floor(Math.random() * 8000 + 500) + 'KB', tags: [] });
            store.saveProject(Object.assign({}, proj, { materials: _umMats }));
          }
          toast('已上传「' + _umMockName + '」');
          DETAIL_STATE.projectTabs[umId] = 'materials';
          navigate('project/' + umId);
        }
        return;
      }
    },
  };

  /* —— 运行时对话（首页发送问题 → 创建新对话，进入对话详情页） —— */
  var RUNTIME_CHATS = [];
  function _matchQA(q) {
    var d = D();
    var qaList = d.QA || [];
    var ql = (q || '').toLowerCase();
    if (!ql) return null;
    for (var i = 0; i < qaList.length; i++) {
      var keys = qaList[i].keys || [];
      for (var j = 0; j < keys.length; j++) {
        if (ql.indexOf(keys[j].toLowerCase()) >= 0 || keys[j].toLowerCase().indexOf(ql) >= 0) return qaList[i];
      }
    }
    return null;
  }
  function _createChatFromQuestion(q) {
    var matched = _matchQA(q);
    var id = 'rc-' + Date.now();
    var aiText, cards;
    if (matched) {
      aiText = matched.answer + '。' + matched.calc.replace(/<[^>]+>/g, '');
      cards = [
        { type:'metric', title:'问数结果', rows:[['问题', q], ['答案', matched.answer], ['数据来源', matched.source]] },
      ];
    } else {
      aiText = '这个问题我还在学习。你可以试试：账面价值合计、盈利项目占比、GP 收齐情况、星河智造估值，或直接上传财报让我解析。';
      cards = [];
    }
    var chat = {
      id: id, type: 'standalone', spaceId: BROWSER_STATE.spaceId || null, title: q.length > 16 ? q.slice(0, 16) + '…' : (q || '新任务'), time: '刚刚',
      preview: aiText.length > 44 ? aiText.slice(0, 44) + '…' : aiText,
      messages: [
        { role: 'user', text: q, time: '刚刚' },
        { role: 'ai', text: aiText, time: '刚刚', cards: cards },
      ],
    };
    RUNTIME_CHATS.unshift(chat);
    return id;
  }
  /* 创建项目绑定对话 */
  function _createProjectChat(pid) {
    var d = D();
    var p = _findProject(d, pid);
    var name = p ? p.name : '项目';
    var id = 'rpc-' + Date.now();
    var pendingN = p ? p.pendingCount : 0;
    var aiText = '已进入「' + name + '」的投后对话。' + (pendingN > 0 ? '当前有 ' + pendingN + ' 项数据待确认。' : '') + '可以问我财报数据、估值变动，或让我生成摘要。';
    var cards = p ? [
      { type:'brief', title:name + ' · 概览', rows:[['投资金额', fmtMoney(p.investAmount)],['持股比例',(p.ratio||0)+'%'],['最新估值', fmtMoney(p.valuation)],['待确认', pendingN + ' 项']] },
    ] : [];
    var chat = {
      id: id, type: 'project', projectId: pid, title: name + ' · 投后跟踪', time: '刚刚',
      preview: aiText.length > 44 ? aiText.slice(0,44)+'…' : aiText,
      messages: [{ role:'ai', text: aiText, time:'刚刚', cards: cards }],
    };
    RUNTIME_CHATS.unshift(chat);
    return id;
  }
  /* 取所有对话（静态 + 运行时），供对话详情页与首页最近列表使用 */
  function _allChats() {
    return (RUNTIME_CHATS || []).concat((D().CHATS || []));
  }
  function _findChat(id) {
    var all = _allChats();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  /* —— 确认页字段取值（兼容 fields 与 sheetFields 两种结构） —— */
  function _confirmFields(conf) {
    if (!conf) return [];
    if (conf.sheetFields && conf.sheetTabs && conf.sheetTabs.length) {
      var sheet = CONFIRM_SHEET_STATE[conf.fileId] || conf.activeSheet || conf.sheetTabs[0];
      return conf.sheetFields[sheet] || [];
    }
    return conf.fields || [];
  }

  /* —— "+" 弹出菜单（WorkBuddy 风格：添加文件 / 引用材料） —— */
  var ICON_CLIP = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M9.8 3.6 5.4 8a1.9 1.9 0 0 0 2.7 2.7l4.6-4.6a3.2 3.2 0 0 0-4.6-4.6L3.4 6.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_AT = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.3"/><path d="M10.6 6.4v2.2a1.4 1.4 0 0 1-2.8 0V6.4m0 2.2a2 2 0 1 1 2-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  var ICON_FOLDER = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2.5 4.5a1 1 0 0 1 1-1h3l1.2 1.5h5.8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-7.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  var ICON_BACK = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_ARROW = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_CHECK = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="m3 8.5 3.5 3.5L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_EXPERT = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.9" stroke="currentColor" stroke-width="1.3"/><path d="M3.4 13.6c.9-2.5 2.6-3.7 4.6-3.7s3.7 1.2 4.6 3.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  var ICON_SKILL = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M9.2 1.6 3.4 9.2h3.4L6.8 14.4 12.6 6.8H9.2l.2-1.6-.2-3.6Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  var ICON_FILE = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5.5L13 5v9.5H4V1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9.5 1.5V5.5H13" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  var ICON_TOOL = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M9.2 1.6 3.4 9.2h3.4L6.8 14.4 12.6 6.8H9.2l.2-1.6-.2-3.6Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

  function renderPlusMenu(mode) {
    var menu = document.getElementById('poPlusMenu');
    if (!menu) return;
    var d = D();
    var html = '';
    if (mode === 'experts') {
      /* 二级：私募股权专家（菜单内展开，不跳页） */
      var experts = d.PE_EXPERTS || [];
      html += '<div class="po-plus-item po-plus-back" data-plus-act="back">' + ICON_BACK + '<span>返回</span></div>';
      html += '<div class="po-plus-item po-plus-debate" data-plus-act="debateSetup" title="开启红蓝对抗">'
        + '<span class="po-plus-chip po-plus-chip-debate">开启红蓝对抗</span>'
        + '<span style="color:var(--po-gray);font-size:11px;flex-shrink:0">选红方/蓝方专家</span></div>';
      html += '<div class="po-plus-div"></div>';
      if (experts.length) {
        html += experts.map(function (e) {
          return '<div class="po-plus-item" data-plus-act="summon" data-arg="' + esc(e.name) + '" title="' + esc(e.field) + '">'
            + '<span class="po-plus-chip"><span class="po-plus-at">' + esc(e.name) + '</span><span class="po-plus-name">' + esc(e.field) + '</span></span>'
            + '<span style="color:var(--po-gray);font-size:11px;flex-shrink:0">召唤</span></div>';
        }).join('');
      } else {
        html += '<div class="po-plus-empty">暂无专家数据</div>';
      }
    } else if (mode === 'skills') {
      /* 二级：技能列表（菜单内展开，不跳页） */
      var skills = d.PE_SKILLS || [];
      html += '<div class="po-plus-item po-plus-back" data-plus-act="back">' + ICON_BACK + '<span>返回</span></div>';
      if (skills.length) {
        html += skills.map(function (s) {
          return '<div class="po-plus-item" data-plus-act="useSkill" data-arg="' + esc(s.name) + '" title="' + esc(s.desc) + '">'
            + '<span class="po-plus-chip">' + esc(s.name) + '</span>'
            + '<span style="color:var(--po-gray);font-size:11px;flex-shrink:0">使用</span></div>';
        }).join('');
      } else {
        html += '<div class="po-plus-empty">暂无技能数据</div>';
      }
    } else {
      /* 主菜单（WorkBuddy 风格：添加文件 / 专家 / 技能；引用空间材料已移至输入框下方工具栏） */
      html += '<div class="po-plus-item" data-plus-act="addFile">' + ICON_CLIP + '<span>添加文件</span>' + ICON_ARROW + '</div>';
      html += '<div class="po-plus-div"></div>';
      html += '<div class="po-plus-item" data-plus-act="experts">' + ICON_EXPERT + '<span>专家</span>' + ICON_ARROW + '</div>';
      html += '<div class="po-plus-item" data-plus-act="skills">' + ICON_SKILL + '<span>技能</span>' + ICON_ARROW + '</div>';
    }
    menu.innerHTML = html;
    /* 绑定菜单项（动态内容，直接绑定） */
    menu.querySelectorAll('[data-plus-act]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var a = el.getAttribute('data-plus-act');
        var arg = el.getAttribute('data-arg') || '';
        if (a === 'addFile') {
          menu.style.display = 'none';
          var fi = document.getElementById('poHomeFile');
          if (fi) fi.click();
          else { toast('请在首页添加文件'); navigate('file-parse'); }
        }
        else if (a === 'back') { renderPlusMenu('main'); }
        else if (a === 'experts') { renderPlusMenu('experts'); }
        else if (a === 'skills') { renderPlusMenu('skills'); }
        else if (a === 'debateSetup') { menu.style.display = 'none'; navigate('redblue-setup'); }
        else if (a === 'summon') {
          menu.style.display = 'none';
          HOME_STATE.draft = '@' + arg + ' ';
          var ie = document.getElementById('poHomeInput'); if (ie) { ie.value = HOME_STATE.draft; ie.focus(); }
          toast('已召唤「' + arg + '」进入对话');
        }
        else if (a === 'useSkill') {
          if (arg === '投委会对抗预演') { menu.style.display = 'none'; navigate('redblue'); return; } /* 红蓝对抗：进对抗预演页 */
          menu.style.display = 'none';
          HOME_STATE.draft = '@' + arg + ' ';
          var ie = document.getElementById('poHomeInput'); if (ie) { ie.value = HOME_STATE.draft; ie.focus(); }
          toast('「' + arg + '」已启用，可在对话中调用');
        }
      });
    });
  }

  /* —— 上传确认条 —— */
  function showUploadSuggest() {
    var d = D();
    var root = _ctx && _ctx.rootEl;
    if (!root) return;
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9998;display:flex;align-items:center;justify-content:center';
    var demoFiles = [
      { name:'星河智造-2026H1-财报.pdf', type:'财报', fileType:'pdf-native', parseMode:'direct', period:'2026H1' },
      { name:'安泰生物-2025年报-扫描件.pdf', type:'财报', fileType:'pdf-scan', parseMode:'ocr', period:'2025FY' },
      { name:'君联资本-2026Q2季报.xlsx', type:'GP季报', fileType:'excel', parseMode:'cell', period:'2026Q2' },
    ];
    var targetLabel = _parseTargetLabel(d, PARSE_TARGET_MODE, PARSE_TARGET, PARSE_TARGET_NEW_TYPE, PARSE_TARGET_NEW_NAME);

    var rowsHtml = demoFiles.map(function(f) {
      var ocrTip = f.parseMode === 'ocr' ? '<span class="po-upload-ocr-tip">将进行 OCR 识别</span>' : '';
      return '<div class="po-upload-row">'
        + '<span class="po-upload-name">' + esc(f.name) + '</span>'
        + _fileTypeTag(f.fileType)
        + _parseModeTag(f.parseMode)
        + ocrTip
        + '<span class="po-upload-period">' + esc(f.period) + '</span>'
        + '<span class="po-upload-proj">' + esc(targetLabel) + '</span>'
        + '<span class="po-tag po-tag-status-pending">待确认</span>'
        + '</div>';
    }).join('');

    overlay.innerHTML = '<div class="po-upload-modal">'
      + '<div class="po-upload-modal-h">确认解析</div>'
      + '<div class="po-upload-modal-sub">已选择写入「' + esc(targetLabel) + '」。系统只识别文件类型、期间和报表结构，不再自动猜归属。</div>'
      + rowsHtml
      + '<div class="po-upload-modal-acts">'
      + '<button class="po-btn" id="poUploadCancel">取消</button>'
      + '<button class="po-btn po-btn-primary" id="poUploadStart">开始解析</button>'
      + '</div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#poUploadCancel').addEventListener('click', function(){ overlay.remove(); });
    overlay.querySelector('#poUploadStart').addEventListener('click', function(){
      overlay.remove();
      toast('已开始解析 ' + demoFiles.length + ' 份文件…');
      /* 投资云风格：确认后自动开始解析 → 显示解析中 → 解析完成自动进入确认页 */
      navigate('file-parse');
      setTimeout(function(){ toast('解析完成，' + demoFiles.length + ' 份文件已进入待确认'); }, 2600);
      /* 模拟：解析完成后自动跳转到第一个待确认文件的确认页（填槽式） */
      setTimeout(function(){
        var goFund = PARSE_TARGET_MODE === 'new' && PARSE_TARGET_NEW_TYPE !== 'direct';
        if (!goFund && PARSE_TARGET_MODE === 'existing' && PARSE_TARGET) {
          var items = _parseTargetItems(D());
          for (var i = 0; i < items.length; i++) {
            if (items[i].id === PARSE_TARGET) { goFund = items[i].kind === 'fund'; break; }
          }
        }
        navigate(goFund ? 'confirm/fp3' : 'confirm/fp4');
      }, 3600);
    });
  }

  /* —— 提交确认弹层（真实写入：标记 submitted 后回确认页显示已提交） —— */
  function showSubmitConfirm() {
    var root = _ctx && _ctx.rootEl;
    if (!root) return;
    var d = D();
    var conf = CURRENT_CONFIRM && d.CONFIRMS && d.CONFIRMS[CURRENT_CONFIRM];
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9998;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = '<div style="background:var(--xb-bg);border-radius:8px;padding:24px;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.15)">'
      + '<div style="font-size:16px;font-weight:700;color:var(--xb-text);margin-bottom:12px">确认写入</div>'
      + '<div style="font-size:13px;color:var(--xb-text);line-height:1.6;margin-bottom:16px">将写入：<strong>' + esc(conf ? conf.projectName : '—') + ' · ' + esc(conf ? conf.period : '—') + '</strong></div>'
      + '<div style="display:flex;gap:8px;justify-content:flex-end">'
      + '<button class="po-btn" id="poSubmitCancel">取消</button>'
      + '<button class="po-btn po-btn-primary" id="poSubmitOk">确认写入</button>'
      + '</div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#poSubmitCancel').addEventListener('click', function(){ overlay.remove(); });
    overlay.querySelector('#poSubmitOk').addEventListener('click', function(){
      overlay.remove();
      if (CURRENT_CONFIRM && CONFIRM_STATE[CURRENT_CONFIRM]) CONFIRM_STATE[CURRENT_CONFIRM].submitted = true;
      /* 真实写入：将确认的字段数据写入对应项目的 periods */
      var projName = conf ? conf.projectName : '';
      if (projName && window.PE_POST_STORE) {
        var allProjects = window.PE_POST_STORE.projects();
        var target = null;
        for (var pi = 0; pi < allProjects.length; pi++) {
          if (allProjects[pi].name === projName) { target = allProjects[pi]; break; }
        }
        if (target) {
          var pd = { id: (conf.period || 'N/A').replace(/\s/g,''), label: conf.period || '', status: 'done' };
          var flds = (conf && conf.fields) || [];
          /* 将确认的字段值合并到期间数据（结构化页无逐字段 accepted 态时跳过合并） */
          flds.forEach(function(f){
            if (f.status && f.status !== 'accepted') return;
            var key = (f.name || '').replace(/\s+/g, '_');
            if (key) pd[key] = f.candidate != null ? f.candidate : (f.mapVal || f.srcVal);
          });
          target.periods = target.periods || [];
          /* 去重：同期间覆盖旧数据 */
          var existingIdx = -1;
          for (var ep = 0; ep < target.periods.length; ep++) {
            if (target.periods[ep].id === pd.id) { existingIdx = ep; break; }
          }
          if (existingIdx >= 0) target.periods[existingIdx] = pd;
          else target.periods.push(pd);
          target.lastUpdate = new Date().toISOString().slice(0,10);
          if (!target.updates) target.updates = [];
          target.updates.push({ at: new Date().toISOString().slice(0,16).replace('T',' '), by: '当前用户', summary: '确认写入 ' + conf.period });
          window.PE_POST_STORE.saveProject(target);
        }
      }
      toast('已写入正式期间数据 · ' + (conf ? conf.projectName : '') + ' · ' + (conf ? conf.period : ''));
      setTimeout(function(){ navigate('confirm/' + CURRENT_CONFIRM); }, 800);
    });
  }

  /* ═══ 项目库 / 基金管理 CRUD 弹层 ═══ */
  function _crudOverlay(title, sub, body, primaryText) {
    var overlay = document.createElement('div');
    overlay.className = 'po-crud-mask';
    overlay.innerHTML = '<div class="po-crud-dialog"><div class="po-crud-head"><div><h3>' + esc(title) + '</h3>'
      + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div><button type="button" class="po-crud-x" data-close>×</button></div>'
      + '<div class="po-crud-body">' + body + '</div>'
      + '<div class="po-crud-actions"><button type="button" class="po-btn" data-close>取消</button>'
      + (primaryText ? '<button type="button" class="po-btn po-btn-primary" data-primary>' + esc(primaryText) + '</button>' : '')
      + '</div></div>';
    document.body.appendChild(overlay);
    overlay.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', function () { overlay.remove(); }); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    /* 表单金额单位切换：换算数字，不改真实金额 */
    overlay.querySelectorAll('select[name$="_unit"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var name = String(sel.name || '').replace(/_unit$/, '');
        var inp = overlay.querySelector('input[name="' + name + '"]');
        if (!inp) return;
        var old = inp.getAttribute('data-money-unit') || 'wan';
        var wan = moneyUnitToWan(inp.value, old);
        inp.value = wan == null ? '' : moneyWanToUnit(wan, sel.value);
        inp.setAttribute('data-money-unit', sel.value);
      });
    });
    return overlay;
  }

  function _field(label, control, hint) {
    return '<label class="po-crud-field"><span>' + label + '</span>' + control + (hint ? '<small>' + hint + '</small>' : '') + '</label>';
  }
  function _val(root, name) { var el = root.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }
  function _num(root, name) { var v = Number(_val(root, name)); return isNaN(v) ? 0 : v; }

  function showProjectCreateChoice() {
    var body = '<div class="po-create-choices">'
      + '<button type="button" class="po-create-choice" data-kind="single"><strong>单个新增</strong><span>填写一个直接投资项目</span></button>'
      + '<button type="button" class="po-create-choice" data-kind="batch"><strong>批量导入</strong><span>上传清单、预览校验后导入</span></button></div>';
    var overlay = _crudOverlay('新增项目', '选择本次建项方式', body, '');
    overlay.querySelector('[data-kind="single"]').addEventListener('click', function () { overlay.remove(); showProjectForm(); });
    overlay.querySelector('[data-kind="batch"]').addEventListener('click', function () { overlay.remove(); showProjectBatchImport(); });
  }

  function showProjectForm(id) {
    var store = window.PE_POST_STORE;
    var p = id ? store.project(id) : null;
    var isEdit = !!p;
    var stageOpts = '<option value="pre"' + (!p || p.stage === 'pre' ? ' selected' : '') + '>投前</option>'
      + '<option value="deal"' + (p && p.stage === 'deal' ? ' selected' : '') + '>投中</option>'
      + '<option value="post"' + (p && p.stage === 'post' ? ' selected' : '') + '>投后</option>';
    var stageIn = (p && p.stageIn) || '';
    if (stageIn === '中后期' || stageIn === '成长') stageIn = '中期';
    if (stageIn === '成熟') stageIn = '成熟期';
    var stageInOpts = ['早期', '中期', '成熟期'].map(function (v) {
      return '<option value="' + v + '"' + (stageIn === v ? ' selected' : '') + '>' + v + '</option>';
    }).join('');
    var body = '<div class="po-crud-error" hidden></div><div class="po-crud-grid po-crud-grid-slim">'
      + _field('项目名称', '<input name="name" required value="' + esc(p ? p.name : '') + '" placeholder="如星河智造">')
      + '<label class="po-crud-field po-crud-span"><span>企业名称</span>'
      + '<div class="po-company-suggest-wrap" style="position:relative">'
      + '<input name="legalName" autocomplete="off" required value="' + esc(p ? (p.legalName || '') : '') + '" placeholder="输入名称，从联想中点选">'
      + '<input type="hidden" name="creditCode" value="' + esc(p ? (p.creditCode || '') : '') + '">'
      + '<div class="po-company-suggest" hidden style="position:absolute;left:0;right:0;top:100%;z-index:20;max-height:220px;overflow:auto;background:var(--po-bg, #fff);border:1px solid var(--po-line, #e5e5ea);border-radius:8px;margin-top:4px;box-shadow:0 8px 24px rgba(0,0,0,.08)"></div>'
      + '</div><small>点选工商联想结果后反显全称；保存后自动补工商</small></label>'
      + _field('所属行业', '<input name="industry" required value="' + esc(p ? (p.industry || '') : '') + '" placeholder="如智能制造">')
      + _field('所属阶段', '<select name="stage">' + stageOpts + '</select>', '投前／投中／投后')
      + _field('投资阶段', '<select name="stageIn"><option value=""' + (!stageIn ? ' selected' : '') + '>请选择</option>' + stageInOpts + '</select>', '早期／中期／成熟期')
      + (isEdit
        ? _field('项目状态', '<select name="status"><option value="active"' + (!p.status || p.status === 'active' ? ' selected' : '') + '>进行中</option><option value="paused"' + (p.status === 'paused' ? ' selected' : '') + '>暂停</option><option value="terminated"' + (p.status === 'terminated' ? ' selected' : '') + '>终止</option><option value="exited"' + (p.status === 'exited' ? ' selected' : '') + '>已退出</option></select>')
        : '')
      + '</div>';
    var overlay = _crudOverlay(
      isEdit ? '编辑项目' : '新增项目',
      isEdit ? '只改必要信息；投资与工商细节在详情页维护' : '只填必要信息，其余进详情后再补',
      body,
      isEdit ? '保存修改' : '创建项目'
    );
    var legalInput = overlay.querySelector('[name="legalName"]');
    var creditInput = overlay.querySelector('[name="creditCode"]');
    var suggestBox = overlay.querySelector('.po-company-suggest');
    var picked = !!(p && p.legalName);
    function hideSuggest() { suggestBox.hidden = true; suggestBox.innerHTML = ''; }
    function renderSuggest(q) {
      var list = _qccGsSuggest(q);
      if (!list.length) { hideSuggest(); return; }
      suggestBox.innerHTML = list.map(function (gs, i) {
        return '<div class="po-suggest-item" data-idx="' + i + '" style="padding:8px 12px;font-size:13px;cursor:pointer;line-height:1.4">'
          + '<strong>' + esc(gs.企业全称) + '</strong>'
          + '<div style="font-size:12px;color:var(--xb-muted)">' + esc(gs.统一社会信用代码 || '') + (gs.市 ? ' · ' + esc(gs.市) : '') + '</div></div>';
      }).join('');
      suggestBox.hidden = false;
      suggestBox.querySelectorAll('[data-idx]').forEach(function (el) {
        el.addEventListener('mousedown', function (e) {
          e.preventDefault();
          var gs = list[Number(el.getAttribute('data-idx'))];
          if (!gs) return;
          legalInput.value = gs.企业全称 || '';
          creditInput.value = gs.统一社会信用代码 || '';
          overlay._pickedGs = gs;
          picked = true;
          hideSuggest();
          var nameEl = overlay.querySelector('[name="name"]');
          if (nameEl && !String(nameEl.value || '').trim()) {
            var short = (gs.企业全称 || '').replace(/（.*?）|\(.*?\)|有限公司|股份有限公司|有限责任公司/g, '').trim();
            if (short) nameEl.value = short.slice(0, 20);
          }
        });
      });
    }
    legalInput.addEventListener('input', function () {
      picked = false;
      creditInput.value = '';
      overlay._pickedGs = null;
      renderSuggest(legalInput.value);
    });
    legalInput.addEventListener('focus', function () {
      if (legalInput.value.trim().length >= 2) renderSuggest(legalInput.value);
    });
    legalInput.addEventListener('blur', function () { setTimeout(hideSuggest, 150); });

    overlay.querySelector('[data-primary]').addEventListener('click', function () {
      var name = _val(overlay, 'name');
      var legalName = _val(overlay, 'legalName');
      var industry = _val(overlay, 'industry');
      var stage = _val(overlay, 'stage');
      var stageInVal = _val(overlay, 'stageIn');
      var errBox = overlay.querySelector('.po-crud-error');
      function showErr(msg) { errBox.hidden = false; errBox.textContent = msg; }
      if (!name) return showErr('请填写项目名称');
      if (!legalName) return showErr('请填写企业名称');
      if (!picked && !isEdit) return showErr('请从企业名称联想中点选一家企业');
      if (isEdit && !picked && legalName !== (p.legalName || '')) return showErr('企业名称已改，请重新从联想中点选');
      if (!industry) return showErr('请填写所属行业');
      if (['pre', 'deal', 'post'].indexOf(stage) < 0) return showErr('请选择所属阶段');
      if (['早期', '中期', '成熟期'].indexOf(stageInVal) < 0) return showErr('请选择投资阶段');
      if (isEdit && p.stage !== stage && !window.confirm('确认将所属阶段由“' + ({ pre: '投前', deal: '投中', post: '投后' })[p.stage] + '”改为“' + ({ pre: '投前', deal: '投中', post: '投后' })[stage] + '”？')) return;
      var status = isEdit ? (_val(overlay, 'status') || 'active') : 'active';
      if (isEdit && p.status !== status && !window.confirm('确认将项目状态由“' + ({ active: '进行中', paused: '暂停', terminated: '终止', exited: '已退出' }[p.status] || p.status) + '”改为“' + ({ active: '进行中', paused: '暂停', terminated: '终止', exited: '已退出' }[status] || status) + '”？')) return;
      try {
        var payload = {
          id: p && p.id,
          name: name,
          type: (p && p.type) || 'direct',
          stage: stage,
          stageIn: stageInVal,
          status: status,
          industry: industry,
          legalName: legalName,
          creditCode: _val(overlay, 'creditCode') || (p && p.creditCode) || '',
          owner: (p && p.owner) || '菜菜'
        };
        if (!isEdit) {
          var row = _qccEnrichProjectRow({
            name: payload.name,
            type: payload.type,
            stage: payload.stage,
            stageIn: payload.stageIn,
            status: payload.status,
            industry: payload.industry,
            legalName: payload.legalName,
            creditCode: payload.creditCode,
            owner: payload.owner,
            parentFundIds: [],
            periods: [],
            equityEvents: [],
            updates: []
          });
          if (overlay._pickedGs && !row.creditCode) row.creditCode = overlay._pickedGs.统一社会信用代码 || '';
          var savedNew = store.saveProject(row);
          overlay.remove();
          toast(row.externalPublic && row.externalPublic.工商信息 ? '项目已创建，工商已自动补齐' : '项目已创建');
          navigate('project/' + savedNew.id);
          return;
        }
        var saved = store.saveProject(payload);
        overlay.remove();
        toast('项目已更新');
        navigate('project/' + saved.id);
      } catch (err) { showErr(err.message); }
    });
  }

  function showProjectBatchImport() {
    var body = '<div class="po-crud-error" hidden></div><div class="po-import-drop"><strong>选择项目清单</strong><span>支持 Excel / CSV；列对齐单个新增：项目名称／企业名称／所属行业／所属阶段／投资阶段</span><input type="file" accept=".xlsx,.xls,.csv"></div>'
      + '<div class="po-import-preview"><div class="po-import-title">预览 3 行 · 2 行可导入 · 1 行需修正</div>'
      + '<table class="po-table"><tr><th>项目名称</th><th>企业名称</th><th>所属行业</th><th>所属阶段</th><th>投资阶段</th><th>校验</th></tr>'
      + '<tr><td>远景储能</td><td>远景储能科技有限公司</td><td>新能源</td><td>投前</td><td>早期</td><td><span class="po-tag po-tag-status-done">通过</span></td></tr>'
      + '<tr><td>星河智造</td><td>星河智造（苏州）科技有限公司</td><td>智能制造</td><td>投前</td><td>中期</td><td><span class="po-tag po-tag-status-done">通过</span></td></tr>'
      + '<tr><td>未命名项目</td><td>—</td><td>—</td><td>投后</td><td>—</td><td><span class="po-tag po-tag-status-abnormal">缺企业名称</span></td></tr></table></div>';
    var overlay = _crudOverlay('批量导入项目', '先预览和校验，再导入有效行', body, '导入 2 行有效数据');
    overlay.querySelector('[data-primary]').addEventListener('click', function () {
      window.PE_POST_STORE.importProjects([
        _qccEnrichProjectRow({ name:'远景储能', legalName:'远景储能科技有限公司', type:'direct', stage:'pre', stageIn:'早期', status:'active', industry:'新能源', owner:'菜菜', importSource:'batch' }),
        _qccEnrichProjectRow({ name:'星河智造', legalName:'星河智造（苏州）科技有限公司', type:'direct', stage:'pre', stageIn:'中期', status:'active', industry:'智能制造', owner:'菜菜', parentFundIds:[], importSource:'batch' })
      ]);
      overlay.remove(); toast('已导入 2 个项目（命中工商的已自动补齐），1 行未导入'); navigate('projects');
    });
  }

  function confirmProjectRemove(id) {
    if (!window.confirm('确认删除或归档该项目？已有业务数据时系统将自动归档。')) return;
    var result = window.PE_POST_STORE.removeProject(id);
    toast(result.mode === 'archive' ? '项目已有业务数据，已归档' : '项目已删除'); navigate('projects');
  }

  function showFundForm(id) {
    var store = window.PE_POST_STORE;
    var f = id ? store.fund(id) : null;
    var isEdit = !!f;
    var body = '<div class="po-crud-error" hidden></div><div class="po-crud-grid po-crud-grid-slim">'
      + _field('基金名称', '<input name="name" required value="' + esc(f ? f.name : '') + '" placeholder="如众源一号">')
      + '<label class="po-crud-field po-crud-span"><span>基金全称</span>'
      + '<div class="po-company-suggest-wrap" style="position:relative">'
      + '<input name="fullName" autocomplete="off" required value="' + esc(f ? (f.fullName || '') : '') + '" placeholder="输入名称，从联想中点选">'
      + '<input type="hidden" name="creditCode" value="' + esc(f ? (f.creditCode || '') : '') + '">'
      + '<div class="po-fund-suggest" hidden style="position:absolute;left:0;right:0;top:100%;z-index:20;max-height:220px;overflow:auto;background:var(--po-bg, #fff);border:1px solid var(--po-line, #e5e5ea);border-radius:8px;margin-top:4px;box-shadow:0 8px 24px rgba(0,0,0,.08)"></div>'
      + '</div><small>点选工商联想结果后反显全称；保存后自动补工商</small></label>'
      + '<label class="po-crud-field"><span>管理人</span>'
      + '<div class="po-company-suggest-wrap" style="position:relative">'
      + '<input name="manager" autocomplete="off" required value="' + esc(f ? (f.manager || '') : '') + '" placeholder="输入名称，从联想中点选">'
      + '<div class="po-manager-suggest" hidden style="position:absolute;left:0;right:0;top:100%;z-index:20;max-height:220px;overflow:auto;background:var(--po-bg, #fff);border:1px solid var(--po-line, #e5e5ea);border-radius:8px;margin-top:4px;box-shadow:0 8px 24px rgba(0,0,0,.08)"></div>'
      + '</div><small>点选管理人联想结果</small></label>'
      + _field('基金类别', '<select name="management"><option value="managed"' + (!f || f.management !== 'external' ? ' selected' : '') + '>本机构管理基金</option><option value="external"' + (f && f.management === 'external' ? ' selected' : '') + '>所投子基金</option></select>')
      + (isEdit
        ? _field('运作状态', '<select name="status"><option value="正常运作"' + (!f.status || f.status === '正常运作' || f.status === '存续期' ? ' selected' : '') + '>正常运作</option><option value="投资期"' + (f.status === '投资期' ? ' selected' : '') + '>投资期</option><option value="退出期"' + (f.status === '退出期' ? ' selected' : '') + '>退出期</option><option value="已清算"' + (f.status === '已清算' ? ' selected' : '') + '>已清算</option></select>')
        : '')
      + '</div>';
    var overlay = _crudOverlay(
      isEdit ? '编辑基金' : '新增基金',
      isEdit ? '只改必要信息；认缴实缴与关联出资在详情维护' : '只填四项必要信息，其余进详情后再补',
      body,
      isEdit ? '保存修改' : '创建基金'
    );

    var fullInput = overlay.querySelector('[name="fullName"]');
    var creditInput = overlay.querySelector('[name="creditCode"]');
    var fundSuggest = overlay.querySelector('.po-fund-suggest');
    var managerInput = overlay.querySelector('[name="manager"]');
    var managerSuggest = overlay.querySelector('.po-manager-suggest');
    var fullPicked = !!(f && f.fullName);
    var managerPicked = !!(f && f.manager);

    function hideBox(box) { box.hidden = true; box.innerHTML = ''; }
    function bindSuggest(input, box, getList, onPick) {
      function render() {
        var list = getList(input.value);
        if (!list.length) { hideBox(box); return; }
        box.innerHTML = list.map(function (it, i) {
          return '<div class="po-suggest-item" data-idx="' + i + '" style="padding:8px 12px;font-size:13px;cursor:pointer;line-height:1.4">'
            + '<strong>' + esc(it.title) + '</strong>'
            + (it.sub ? '<div style="font-size:12px;color:var(--xb-muted)">' + esc(it.sub) + '</div>' : '')
            + '</div>';
        }).join('');
        box.hidden = false;
        box.querySelectorAll('[data-idx]').forEach(function (el) {
          el.addEventListener('mousedown', function (e) {
            e.preventDefault();
            onPick(list[Number(el.getAttribute('data-idx'))]);
            hideBox(box);
          });
        });
      }
      input.addEventListener('input', function () { onPick(null); render(); });
      input.addEventListener('focus', function () { if (String(input.value || '').trim().length >= 1) render(); });
      input.addEventListener('blur', function () { setTimeout(function () { hideBox(box); }, 150); });
    }

    bindSuggest(fullInput, fundSuggest, function (q) {
      return _qccGsSuggest(q).map(function (gs) {
        return { title: gs.企业全称, sub: (gs.统一社会信用代码 || '') + (gs.市 ? ' · ' + gs.市 : ''), gs: gs };
      });
    }, function (it) {
      if (!it) { fullPicked = false; creditInput.value = ''; overlay._pickedGs = null; return; }
      fullInput.value = it.gs.企业全称 || '';
      creditInput.value = it.gs.统一社会信用代码 || '';
      overlay._pickedGs = it.gs;
      fullPicked = true;
      var nameEl = overlay.querySelector('[name="name"]');
      if (nameEl && !String(nameEl.value || '').trim()) {
        var short = (it.gs.企业全称 || '').replace(/（.*?）|\(.*?\)|创业投资合伙企业|有限合伙|有限公司|股份有限公司/g, '').trim();
        if (short) nameEl.value = short.slice(0, 24);
      }
    });

    bindSuggest(managerInput, managerSuggest, function (q) {
      return _managerSuggest(q).map(function (name) { return { title: name, sub: '', name: name }; });
    }, function (it) {
      if (!it) { managerPicked = false; return; }
      managerInput.value = it.name;
      managerPicked = true;
    });

    overlay.querySelector('[data-primary]').addEventListener('click', function () {
      var name = _val(overlay, 'name');
      var fullName = _val(overlay, 'fullName');
      var manager = _val(overlay, 'manager');
      var management = _val(overlay, 'management') || 'managed';
      var errBox = overlay.querySelector('.po-crud-error');
      function showErr(msg) { errBox.hidden = false; errBox.textContent = msg; }
      if (!name) return showErr('请填写基金名称');
      if (!fullName) return showErr('请填写基金全称');
      if (!fullPicked && !isEdit) return showErr('请从基金全称联想中点选');
      if (isEdit && !fullPicked && fullName !== (f.fullName || '')) return showErr('基金全称已改，请重新从联想中点选');
      if (!manager) return showErr('请填写管理人');
      if (!managerPicked && !isEdit) return showErr('请从管理人联想中点选');
      if (isEdit && !managerPicked && manager !== (f.manager || '')) return showErr('管理人已改，请重新从联想中点选');
      if (['managed', 'external'].indexOf(management) < 0) return showErr('请选择基金类别');
      try {
        if (!isEdit) {
          var row = _qccEnrichFundRow({
            name: name,
            fullName: fullName,
            creditCode: _val(overlay, 'creditCode'),
            manager: manager,
            management: management,
            strategy: 'mixed',
            status: '正常运作',
            committed: 0,
            called: 0,
            fundRelations: [],
            updates: []
          });
          if (overlay._pickedGs && !row.creditCode) row.creditCode = overlay._pickedGs.统一社会信用代码 || '';
          var savedNew = store.saveFund(row);
          overlay.remove();
          toast(row.externalPublic && row.externalPublic.工商信息 ? '基金已创建，工商已自动补齐' : '基金已创建');
          navigate('fund/' + savedNew.id);
          return;
        }
        var payload = {
          id: f.id,
          name: name,
          fullName: fullName,
          creditCode: _val(overlay, 'creditCode') || f.creditCode || '',
          manager: manager,
          management: management,
          status: _val(overlay, 'status') || f.status || '正常运作'
        };
        var saved = store.saveFund(payload);
        overlay.remove();
        toast('基金已更新');
        navigate('fund/' + saved.id);
      } catch (err) { showErr(err.message); }
    });
  }

  function confirmFundRemove(id) {
    if (!window.confirm('确认删除或归档该基金？有关联项目时系统将自动归档。')) return;
    var result = window.PE_POST_STORE.removeFund(id);
    toast(result.mode === 'archive' ? '基金有关联项目，已归档' : '基金已删除'); navigate('fund');
  }

  /* ═══ 项目库（阶段Tab + 类型筛选 + 行式列表） ═══ */
  function pageProjects() {
    var store = window.PE_POST_STORE;
    var projects = store ? store.projects() : (D().PROJECTS || []);
    var funds = (store ? store.funds() : (D().FUNDS || [])).filter(function(f){return (f.management||'managed')==='managed';});
    var stageMap = { '全部':'all', '投前':'pre', '投中':'deal', '投后':'post' };
    var criteria = { search:PROJECT_FILTER.search, stage:stageMap[PROJECT_FILTER.stage], type:PROJECT_FILTER.type, fundId:PROJECT_FILTER.fundId, owner:PROJECT_FILTER.owner };
    var list = store ? store.filterProjects(criteria) : projects;
    list = _sortTimeDesc(list, 'lastUpdate');
    var projPage = _pageSlice(list, 'projects');
    var tabs = ['全部','投前','投中','投后'];
    var countCriteria = { search:PROJECT_FILTER.search, stage:'all', type:PROJECT_FILTER.type, fundId:PROJECT_FILTER.fundId, owner:PROJECT_FILTER.owner };
    var countBase = store ? store.filterProjects(countCriteria) : projects;
    var counts = { '全部':countBase.length, '投前':0, '投中':0, '投后':0 };
    countBase.forEach(function (p) { counts[({pre:'投前',deal:'投中',post:'投后'})[p.stage]] += 1; });
    var owners = []; projects.forEach(function (p) { var o=p.owner||'未分配'; if(owners.indexOf(o)<0) owners.push(o); });
    function fundNames(p) {
      if (p.type === 'lookthrough') return p.sourceFundName || ((store&&store.fund(p.targetFundId)||{}).name) || '—';
      return (p.parentFundIds || []).map(function (id) { var f=store&&store.fund(id); return f&&f.name; }).filter(Boolean).join('、') || '—';
    }
    var rowsHtml = projPage.rows.map(function (p) {
      var amt = store && store.projectInvestmentAmount ? store.projectInvestmentAmount(p) : (p.investAmount || 0);
      var amtTitle = p.type === 'lookthrough' ? '子基金对本金（本子基金对该企业的投资成本，非本机构对该子基金认缴）' : '本机构投资金额';
      return '<tr><td><button class="po-table-link" data-nav="project/' + esc(p.id) + '">' + esc(p.name) + '</button></td>'
        + '<td>' + typeTag(p.type) + '</td><td>' + stageTag(p.stage) + '</td>'
        + '<td class="po-cell-wrap">' + esc(fundNames(p)) + '</td>'
        + '<td class="po-cell-num" title="' + esc(amtTitle) + '">' + fmtMoney(amt) + (p.type === 'lookthrough' ? '<span style="display:block;font-size:11px;color:var(--xb-muted);font-weight:400">子基金对本金</span>' : '') + '</td>'
        + '<td>' + esc(p.owner || '') + '</td>'
        + '<td>' + esc(p.lastUpdate || '—') + '</td>'
        + '<td class="po-table-actions"><button class="po-btn po-btn-sm" data-nav="project/' + esc(p.id) + '">查看</button><button class="po-btn po-btn-sm" data-act="projectEdit" data-arg="' + esc(p.id) + '">编辑</button></td></tr>';
    }).join('');

    return '<div class="po-page">'
      + toolbar('项目库', '<button class="po-btn po-btn-sm" data-act="exportProjectsCSV">导出</button><button class="po-btn po-btn-sm" data-nav="monitor">项目动态</button><button class="po-btn po-btn-sm" data-nav="snapshot">盘面视图</button><button class="po-btn po-btn-sm" data-act="batchImport">批量新增</button><button class="po-btn po-btn-sm po-btn-primary" data-act="projectCreate">新增项目</button>')
      + '<div class="po-body">'
      + '<div class="po-snapshot-tabs" id="poProjStageTabs">'
      + tabs.map(function(t) {
          return '<div class="po-snap-tab' + (PROJECT_FILTER.stage===t?' active':'') + '" data-act="filterStage" data-arg="' + t + '">' + t + ' <span>' + counts[t] + '</span></div>';
        }).join('')
      + '</div>'
      + '<div class="po-filter-bar">'
      + '<div class="po-search-box"><span>⌕</span><input id="poProjectSearch" placeholder="搜索项目、企业或基金" value="' + esc(PROJECT_FILTER.search) + '"></div>'
      + '<select id="poProjectType"><option value="all">全部类型</option><option value="direct"' + (PROJECT_FILTER.type==='direct'?' selected':'') + '>直接投资</option><option value="lookthrough"' + (PROJECT_FILTER.type==='lookthrough'?' selected':'') + '>子基金穿透</option></select>'
      + '<select id="poProjectFund"><option value="all">全部出资基金</option>' + funds.map(function(f){return '<option value="'+esc(f.id)+'"'+(PROJECT_FILTER.fundId===f.id?' selected':'')+'>'+esc(f.name)+'</option>';}).join('') + '</select>'
      + '<select id="poProjectOwner"><option value="all">全部负责人</option>' + owners.map(function(o){return '<option value="'+esc(o)+'"'+(PROJECT_FILTER.owner===o?' selected':'')+'>'+esc(o)+'</option>';}).join('') + '</select>'
      + '<button class="po-btn po-btn-sm" data-act="clearProjectFilters">重置</button><span class="po-filter-result">' + list.length + ' 个项目</span></div>'
      + '<div class="po-table-shell"><table class="po-table po-project-table"><thead><tr><th>项目名称</th><th>类型</th><th>阶段</th><th>投资路径</th><th class="po-cell-num" title="直投＝本机构投资金额；穿透＝子基金对本金">投资金额</th><th>负责人</th><th>最近更新</th><th>操作</th></tr></thead><tbody>'
      + (rowsHtml || '<tr><td colspan="8"><div class="po-empty">没有匹配的项目，请调整搜索或筛选条件</div></td></tr>') + '</tbody></table></div>'
      + _pagerBar('projects', projPage.total)
      + '</div></div>';
  }

  /* ═══ 项目详情（直投/子基金同构） ═══ */
  function pageProjectDetail(id) {
    var d = D();
    var p = window.PE_POST_STORE ? window.PE_POST_STORE.project(id) : null;
    if (!p) {
      var projects = d.PROJECTS || [];
      for (var i=0; i<projects.length; i++) { if (projects[i].id === id) { p = projects[i]; break; } }
    }
    if (!p) return '<div class="po-page">' + toolbar('项目详情') + '<div class="po-body"><div class="po-empty">未找到项目</div></div></div>';

    /* 阶段条 */
    var stages = [{key:'pre',label:'投前'},{key:'deal',label:'投中'},{key:'post',label:'投后'}];
    var stageIdx = {pre:0, deal:1, post:2}[p.stage] || 0;
    var stageHtml = '<div class="po-stages">';
    stages.forEach(function(s, si) {
      var cls = si === stageIdx ? 'po-stage active' : (si < stageIdx ? 'po-stage done' : 'po-stage');
      stageHtml += '<div class="' + cls + '">' + s.label + '</div>';
      if (si < 2) stageHtml += '<span class="po-stage-arrow">→</span>';
    });
    stageHtml += '</div>';

    var panels = '';

    if (p.type === 'direct') {
      /* 直投项目 */
      /* 企业信息 */
      panels += panel('企业信息', '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px">'
        + '<div><span style="color:var(--xb-muted)">行业</span> ' + esc(p.industry) + '</div>'
        + '<div><span style="color:var(--xb-muted)">投资阶段</span> ' + esc(p.stageIn) + '</div>'
        + '<div><span style="color:var(--xb-muted)">企业所在省</span> ' + esc(p.province || '—') + '</div>'
        + '<div><span style="color:var(--xb-muted)">企业所在市</span> ' + esc(p.city || '—') + '</div>'
        + '<div><span style="color:var(--xb-muted)">企业所在区</span> ' + esc(p.district || '—') + '</div>'
        + '<div><span style="color:var(--xb-muted)">轮次</span> ' + esc(p.round) + '</div>'
        + '</div>');

      /* 投资信息 + 股权事件流 */
      var investBody = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px;margin-bottom:16px">'
        + '<div><span style="color:var(--xb-muted)">投资日期</span> ' + esc(p.investDate) + '</div>'
        + '<div><span style="color:var(--xb-muted)">投资金额</span> ' + fmtMoney(p.investAmount) + '</div>'
        + '<div><span style="color:var(--xb-muted)">持股比例</span> ' + (p.ratio||0) + '%</div>'
        + '<div><span style="color:var(--xb-muted)">最新投后估值</span> ' + fmtMoney(p.valuation) + '</div>'
        + '<div><span style="color:var(--xb-muted)">持股公允价值</span> ' + fmtMoney(p.holding&&p.holding.fairValue||0) + '</div>'
        + '<div><span style="color:var(--xb-muted)">总价值</span> ' + fmtMoney(p.holding&&p.holding.totalValue||0) + '</div>'
        + '</div>';
      investBody += '<div class="po-value-period">数据截至 ' + esc(p.holding&&p.holding.period||'当前') + '</div>';
      if (p.equityEvents && p.equityEvents.length) {
        investBody += '<div style="font-size:12px;font-weight:600;color:var(--xb-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">股权事件流</div>';
        p.equityEvents.forEach(function(ee) {
          investBody += '<div style="border:1px solid var(--po-line-2);border-radius:6px;padding:12px;margin-bottom:8px;background:var(--po-bg-2)">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
            + tag('po-tag-aifallback', ee.type)
            + '<span style="font-size:12px;color:var(--xb-muted)">' + esc(ee.date) + ' · ' + esc(ee.desc) + '</span>'
            + tag('po-tag-status-done', '已确认')
            + '</div>'
            + '<div style="display:flex;gap:16px;font-size:13px">'
            + '<span>估值: <s style="color:var(--xb-muted)">' + fmtMoney(ee.oldValuation) + '</s> → <strong>' + fmtMoney(ee.newValuation) + '</strong></span>'
            + '<span>持股: <s style="color:var(--xb-muted)">' + ee.oldRatio + '%</s> → <strong>' + ee.newRatio + '%</strong></span>'
            + '<span>新增股东: ' + esc((ee.newShareholders||[]).join('、')) + '</span>'
            + '</div></div>';
        });
      }
      investBody += '<button class="po-btn po-btn-sm" data-act="uploadCap" style="margin-top:4px">上传股权文件（cap table / 融资协议）</button>';
      panels += panel('本机构投资信息', investBody);

      /* 投后档案（T22 条款 + T25 联系人 + T26 账户 + T29 风险 + T28 待办，张小龙：默认折叠） */
      var archiveParts = [];
      var archiveCount = { terms:0, contacts:0, accts:0, risks:0, fups:0 };

      if (p.terms && p.terms.length) {
        archiveCount.terms = p.terms.length;
        archiveParts.push(panel('关键条款（T22 deal_terms）', '<div class="po-terms-list">' + p.terms.map(function (t) {
          return '<div class="po-term-row">'
            + '<span class="po-term-name">' + esc(t.name) + '</span>'
            + '<span class="po-term-detail">' + esc(t.detail) + '</span>'
            + (t.has ? tag('po-tag-status-done','已约定') : tag('po-tag-status-pending','未约定'))
            + '</div>';
        }).join('') + '</div>'));
      }
      if (p.contacts && p.contacts.length) {
        archiveCount.contacts = p.contacts.length;
        archiveParts.push(panel('联系人（T25 contacts）', '<div class="po-contacts-list">' + p.contacts.map(function (c) {
          return '<div class="po-contact-row">'
            + '<div class="po-contact-info"><strong>' + esc(c.name) + '</strong>'
            + (c.role ? '<span>' + esc(c.role) + '</span>' : '')
            + '</div>'
            + '<div class="po-contact-meta">' + (c.phone ? '<span>' + esc(c.phone) + '</span>' : '')
            + (c.email ? '<span>' + esc(c.email) + '</span>' : '')
            + (c.primary ? tag('po-tag-status-done','主要') : '')
            + '</div></div>';
        }).join('') + '</div>'));
      }
      if (p.bankAccounts && p.bankAccounts.length) {
        archiveCount.accts = p.bankAccounts.length;
        archiveParts.push(panel('银行账户（T26 bank_accounts）', '<div class="po-accounts-list">' + p.bankAccounts.map(function (a) {
          return '<div class="po-account-row"><div>'
            + '<strong>' + esc(a.holder) + '</strong>'
            + '<span>' + esc(a.bank) + ' · ' + esc(a.no) + '</span>'
            + '</div><span>' + (a.use||'') + ' · ' + (a.currency||'') + '</span></div>';
        }).join('') + '</div>'));
      }
      if (p.risks && p.risks.length) {
        archiveCount.risks = p.risks.length;
        archiveParts.push(panel('风险清单（T29 risks）', '<div class="po-risks-list">' + p.risks.map(function (r) {
          var lvCls = r.level === '中' ? 'mid' : (r.level === '高' ? 'high' : 'low');
          return '<div class="po-risk-row ' + lvCls + '"><span class="po-risk-lv">' + esc(r.level) + '</span>'
            + '<div><strong>' + esc(r.name) + '</strong><span>' + esc(r.detail) + '</span></div></div>';
        }).join('') + '</div>'));
      }
      if (p.followups && p.followups.length) {
        archiveCount.fups = p.followups.length;
        archiveParts.push(panel('跟进待办（T28 followups）', '<div class="po-followups-list">' + p.followups.map(function (f) {
          return '<div class="po-followup-row"><span class="po-followup-dot"></span>'
            + '<div><strong>' + esc(f.title) + '</strong><span>' + esc(f.owner||'') + ' · 截止 ' + esc(f.due||'') + '</span></div>'
            + tag('po-tag-status-pending','待办') + '</div>';
        }).join('') + '</div>'));
      }
      if (archiveParts.length) {
        var archiveTotal = archiveCount.terms + archiveCount.contacts + archiveCount.accts + archiveCount.risks + archiveCount.fups;
        var archiveSummary = archiveCount.terms + '条款 · ' + archiveCount.contacts + '联系人 · ' + archiveCount.accts + '账户 · ' + archiveCount.risks + '风险 · ' + archiveCount.fups + '待办';
        panels += _collapsibleGroup('archive-' + p.id, '投后档案', archiveTotal + ' 项 · ' + archiveSummary, archiveParts.join(''), false);
      }

      /* 财务期间数据 */
      if (p.periods && p.periods.length) {
        var finRows = '';
        /* 表头 */
        finRows += '<tr><th>科目</th>';
        p.periods.forEach(function(pd) { finRows += '<th>' + esc(pd.label) + '</th>'; });
        finRows += '</tr>';
        /* 数据行 */
        var fields = [
          {key:'revenue', label:'营业收入'}, {key:'netProfit', label:'净利润'},
          {key:'totalAssets', label:'资产总计'}, {key:'totalLiab', label:'负债合计'}, {key:'equity', label:'所有者权益'}
        ];
        var prevPeriod = null;
        fields.forEach(function(fld) {
          finRows += '<tr><td>' + fld.label + '</td>';
          p.periods.forEach(function(pd) {
            var val = pd[fld.key];
            var changed = pd.changedFields && pd.changedFields.indexOf(fld.key) >= 0;
            var badge = '';
            if (changed && prevPeriod && prevPeriod[fld.key] != null && val != null && prevPeriod[fld.key] !== 0) {
              var pct = ((val - prevPeriod[fld.key]) / Math.abs(prevPeriod[fld.key]) * 100).toFixed(0);
              badge = ' <span class="po-tag po-tag-status-abnormal" style="font-size:10px">' + (pct>0?'↑':'↓') + Math.abs(pct) + '%</span>';
            }
            finRows += '<td class="po-cell-num' + (changed?'':'') + '">' + (val!=null ? val.toLocaleString() : '—') + badge + '</td>';
          });
          finRows += '</tr>';
        });
        /* 状态行 */
        finRows += '<tr><td style="color:var(--xb-muted)">确认状态</td>';
        p.periods.forEach(function(pd) { finRows += '<td>' + statusTag(pd.status) + '</td>'; });
        finRows += '</tr>';
        panels += panel('财务期间数据', '<table class="po-table">' + finRows + '</table>'
          + '<div style="font-size:12px;color:var(--xb-muted);margin-top:8px">变动标注基于机构阈值配置（默认 ±20%）；点击任一数字可溯源回原文</div>');
      } else {
        panels += panel('财务期间数据', '<div class="po-empty">暂无期间数据，上传财报后自动生成</div>');
      }

      /* 材料 */
      panels += panel('材料与更新记录', '<div class="po-list">'
        + listRow({name:'星河智造-2026H1-财报.pdf', tags:[tag('po-tag-type-direct','财报')], meta:'2026-07-28 · 菜菜上传', badge:'待确认', badgeCls:'po-tag-status-pending', arrow:true, act:'fileView', arg:'星河智造-2026H1-财报.pdf'})
        + listRow({name:'星河智造-2025年度财报.pdf', tags:[tag('po-tag-type-direct','财报')], meta:'2026-04-15 · 菜菜确认', badge:'已确认', badgeCls:'po-tag-status-done', arrow:true, act:'fileView', arg:'星河智造-2025年度财报.pdf'})
        + listRow({name:'B轮融资-股权表.xlsx', tags:[tag('po-tag-aifallback','股权文件')], meta:'2026-07-15 · 菜菜确认', badge:'已确认', badgeCls:'po-tag-status-done', arrow:true, act:'fileView', arg:'B轮融资-股权表.xlsx'})
        + '</div>');
    } else {
      var sourceFund = window.PE_POST_STORE && window.PE_POST_STORE.fund(p.targetFundId);
      panels += panel('穿透路径', '<div style="font-size:13px;line-height:1.8"><strong>' + esc(sourceFund?sourceFund.name:p.sourceFundName||'—') + '</strong> → ' + esc(p.name) + '</div>');
      panels += panel('持仓信息', '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px">'
        + '<div><span style="color:var(--xb-muted)">投资成本</span> ' + fmtMoney(p.investAmount||0) + '</div>'
        + '<div><span style="color:var(--xb-muted)">剩余成本</span> ' + fmtMoney(p.remainingCost||0) + '</div>'
        + '<div><span style="color:var(--xb-muted)">持股比例</span> ' + (p.ratio||0) + '%</div>'
        + '<div><span style="color:var(--xb-muted)">持股公允价值</span> ' + fmtMoney(p.holding&&p.holding.fairValue||0) + '</div>'
        + '<div><span style="color:var(--xb-muted)">退出状态</span> ' + esc(p.exitStatus||'在管') + '</div>'
        + '<div><span style="color:var(--xb-muted)">退出金额</span> ' + fmtMoney(p.exitAmount||0) + '</div></div>');
      panels += panel('来源基金', '<div class="po-list">' + (sourceFund?listRow({name:sourceFund.name,tags:[tag('po-tag-type-fof','所投子基金')],meta:(sourceFund.manager||'—')+' · '+(sourceFund.status||'—'),nav:'fund/'+sourceFund.id,arrow:true}):'<div class="po-empty">未匹配来源基金</div>') + '</div>');
    }

    if (p.updates && p.updates.length) {
      panels += _collapsibleGroup('legacy-upd-' + p.id, '项目更新记录', '共 ' + p.updates.length + ' 条', _updatesListHtml(p.updates, p.lastUpdate, 'legacy-p-' + p.id), false);
    } else {
      panels += _collapsibleGroup('legacy-upd-' + p.id, '项目更新记录', '暂无', '<div class="po-empty">暂无更新记录</div>', false);
    }

    var pdActions = tag(p.type==='lookthrough'?'po-tag-type-fof':'po-tag-type-direct', p.type==='lookthrough'?'子基金穿透':'直接投资')
      + (p.type==='lookthrough'?'':'<button class="po-btn po-btn-sm" data-act="projectEdit" data-arg="' + esc(p.id) + '" style="margin-left:8px">编辑</button>')
      + (p.type==='lookthrough'?'':'<button class="po-btn po-btn-sm po-btn-danger" data-act="projectRemove" data-arg="' + esc(p.id) + '" style="margin-left:8px">删除/归档</button>')
      + '<button class="po-btn po-btn-sm" data-act="openProjectChat" data-arg="' + esc(p.id) + '" style="margin-left:8px">开启对话</button>'
      + '<button class="po-btn po-btn-sm" data-act="uploadMaterial" data-arg="' + esc(p.id) + '" style="margin-left:8px">上传材料</button>';

    return '<div class="po-page">'
      + toolbar(p.name, pdActions)
      + stageHtml
      + '<div class="po-body">' + panels + '</div></div>';
  }

  /* ═══ 基金管理 ═══ */
  function pageFund() {
    var allFunds = window.PE_POST_STORE ? window.PE_POST_STORE.funds() : (D().FUNDS || []);
    var searchedFunds = window.PE_POST_STORE ? window.PE_POST_STORE.filterFunds(FUND_FILTER.search) : allFunds;
    function strategyKey(f) {
      if (f.strategy) return f.strategy;
      var t=String(f.type||'').toLowerCase();
      return t.indexOf('fof')>=0 || t.indexOf('母基金')>=0 ? 'fof' : (t.indexOf('直投')>=0 ? 'direct' : 'other');
    }
    var funds = searchedFunds.filter(function(f){
      return (FUND_FILTER.management==='all'||(f.management||'managed')===FUND_FILTER.management)
        && (FUND_FILTER.strategy==='all'||strategyKey(f)===FUND_FILTER.strategy)
        && (FUND_FILTER.status==='all'||f.status===FUND_FILTER.status)
        && (FUND_FILTER.manager==='all'||(f.manager||'未分配')===FUND_FILTER.manager);
    });
    var statuses=[], managers=[];
    allFunds.forEach(function(f){var s=f.status||'未分类',m=f.manager||'未分配';if(statuses.indexOf(s)<0)statuses.push(s);if(managers.indexOf(m)<0)managers.push(m);});
    funds = _sortTimeDesc(funds, 'lastUpdate');
    var fundPage = _pageSlice(funds, 'funds');
    var rowsHtml = fundPage.rows.map(function(f) {
      var portfolio = window.PE_POST_STORE ? window.PE_POST_STORE.fundPortfolio(f.id) : {directProjects:[],investedFunds:[],lookthroughProjects:[]};
      var metrics = window.PE_POST_STORE ? window.PE_POST_STORE.fundMetrics(f.id) : {investmentCost:0,totalValue:0,period:'—'};
      var isExternal = f.management === 'external';
      var count = isExternal ? portfolio.lookthroughProjects.length : portfolio.directProjects.length + portfolio.investedFunds.length;
      var strategy = ({direct:'直投',fof:'母基金',mixed:'混合',other:'其他'})[f.strategy] || f.type || '—';
      var committedCell, calledCell;
      if (isExternal) {
        var rels = f.fundRelations || [];
        if (!rels.length) { committedCell = '—'; calledCell = '—'; }
        else {
          committedCell = fmtMoney(rels.reduce(function(s,r){return s+Number(r.committed||0);},0));
          calledCell = fmtMoney(rels.reduce(function(s,r){return s+Number(r.called||0);},0));
        }
      } else {
        committedCell = fmtMoney(f.committed || 0);
        calledCell = fmtMoney(f.called || 0);
      }
      return '<tr><td><button class="po-table-link" data-nav="fund/' + esc(f.id) + '">' + esc(f.name) + '</button></td>'
        + '<td>' + (isExternal?'所投子基金':'本机构管理基金') + '</td><td>' + esc(f.code || '—') + '</td><td>' + esc(strategy) + '</td><td>' + esc(f.status || '—') + '</td>'
        + '<td>' + esc(f.manager || '—') + '</td><td class="po-cell-num">' + count + '</td>'
        + '<td class="po-cell-num">' + committedCell + '</td><td class="po-cell-num">' + calledCell + '</td>'
        + '<td class="po-cell-num"><strong>' + fmtMoney(metrics.totalValue) + '</strong><small class="po-value-source">截至 ' + esc(metrics.period) + '</small></td>'
        + '<td class="po-table-actions"><button class="po-btn po-btn-sm" data-nav="fund/' + esc(f.id) + '">查看</button><button class="po-btn po-btn-sm" data-act="fundEdit" data-arg="' + esc(f.id) + '">编辑</button></td></tr>';
    }).join('');
    return '<div class="po-page">'
      + toolbar('基金管理', '<button class="po-btn po-btn-sm" data-act="exportFundsCSV">导出</button><button class="po-btn po-btn-sm" data-nav="fund-snapshot">基金盘面</button><button class="po-btn po-btn-sm po-btn-primary" data-act="fundCreate">新增基金</button>')
      + '<div class="po-body">'
      + '<div class="po-filter-bar"><div class="po-search-box po-search-wide"><span>⌕</span><input id="poFundSearch" placeholder="搜索基金名称、编号或策略" value="' + esc(FUND_FILTER.search) + '"></div>'
      + '<select id="poFundManagement"><option value="all">全部基金类别</option><option value="managed"'+(FUND_FILTER.management==='managed'?' selected':'')+'>本机构管理基金</option><option value="external"'+(FUND_FILTER.management==='external'?' selected':'')+'>所投子基金</option></select>'
      + '<select id="poFundStrategy"><option value="all">全部策略</option><option value="direct"'+(FUND_FILTER.strategy==='direct'?' selected':'')+'>直投</option><option value="fof"'+(FUND_FILTER.strategy==='fof'?' selected':'')+'>母基金</option><option value="mixed"'+(FUND_FILTER.strategy==='mixed'?' selected':'')+'>混合</option><option value="other"'+(FUND_FILTER.strategy==='other'?' selected':'')+'>其他</option></select>'
      + '<select id="poFundStatus"><option value="all">全部状态</option>'+statuses.map(function(s){return '<option value="'+esc(s)+'"'+(FUND_FILTER.status===s?' selected':'')+'>'+esc(s)+'</option>';}).join('')+'</select>'
      + '<select id="poFundManager"><option value="all">全部管理人</option>'+managers.map(function(m){return '<option value="'+esc(m)+'"'+(FUND_FILTER.manager===m?' selected':'')+'>'+esc(m)+'</option>';}).join('')+'</select>'
      + '<button class="po-btn po-btn-sm" data-act="clearFundFilters">重置</button><span class="po-filter-result">' + funds.length + ' 只基金</span></div>'
      + '<div class="po-table-shell"><table class="po-table po-fund-table"><thead><tr><th>基金名称</th><th>基金类别</th><th>基金编号</th><th>投资策略</th><th>状态</th><th>管理人</th><th class="po-cell-num">关联对象</th><th class="po-cell-num">认缴金额</th><th class="po-cell-num">实缴金额</th><th class="po-cell-num">当前价值</th><th>操作</th></tr></thead><tbody>' + (rowsHtml || '<tr><td colspan="11"><div class="po-empty">没有匹配的基金</div></td></tr>') + '</tbody></table></div>'
      + _pagerBar('funds', fundPage.total)
      + '</div></div>';
  }

  function pageFundDetail(id) {
    var d = D();
    var fund = window.PE_POST_STORE ? window.PE_POST_STORE.fund(id) : null;
    if (!fund) { var funds = d.FUNDS || []; for (var i=0; i<funds.length; i++) { if (funds[i].id === id) { fund = funds[i]; break; } } }
    if (!fund) return '<div class="po-page">' + toolbar('基金详情') + '<div class="po-body"><div class="po-empty">未找到基金</div></div></div>';

    var portfolio = window.PE_POST_STORE ? window.PE_POST_STORE.fundPortfolio(id) : {directProjects:[],investedFunds:[],lookthroughProjects:[]};
    var metrics = window.PE_POST_STORE ? window.PE_POST_STORE.fundMetrics(id) : {totalValue:0,period:'—'};
    var isExternal = fund.management === 'external';
    var rowsHtml = portfolio.investedFunds.map(function(p) {
      var rel=(p.fundRelations||[]).find(function(r){return r.fundId===id;})||{};
      return listRow({
        name: p.name,
        tags: [tag('po-tag-type-fof','所投子基金')],
        meta: '投资成本 ' + fmtMoney(rel.investmentCost || 0) + ' · 期末账户余额 ' + fmtMoney(rel.periodEndNav || 0),
        nav: 'fund/' + p.id,
        arrow: true,
      });
    }).join('');

    return '<div class="po-page">'
      + toolbar(fund.name, tag('po-tag-type-fof', isExternal?'所投子基金':'本机构管理基金')
        + '<button class="po-btn po-btn-sm" data-act="fundEdit" data-arg="' + esc(fund.id) + '" style="margin-left:8px">编辑</button>'
        + '<button class="po-btn po-btn-sm po-btn-danger" data-act="fundRemove" data-arg="' + esc(fund.id) + '" style="margin-left:8px">删除/归档</button>')
      + '<div class="po-body">'
      + statStrip([
          { num: isExternal?portfolio.lookthroughProjects.length:(portfolio.directProjects.length + portfolio.investedFunds.length), label: isExternal?'穿透项目':'投资组合' },
          { num: fmtMoney(fund.committed || 0), label: '认缴金额' },
          { num: fmtMoney(fund.called || 0), label: '实缴金额' },
          { num: fmtMoney(metrics.totalValue), label: '组合总价值（' + metrics.period + '）' },
        ])
      + (isExternal
        ? panel('出资关系', '<div class="po-list">' + ((fund.fundRelations||[]).map(function(r){var pf=window.PE_POST_STORE&&window.PE_POST_STORE.fund(r.fundId);return listRow({name:pf?pf.name:'未匹配基金',tags:[tag('po-tag-type-direct','本机构管理基金')],meta:'投资成本 '+fmtMoney(r.investmentCost||0)+' · 期末账户余额 '+fmtMoney(r.periodEndNav||0),nav:pf?'fund/'+pf.id:null,arrow:!!pf});}).join('') || '<div class="po-empty">未关联本机构管理基金</div>') + '</div>')
          + panel('穿透项目', '<div class="po-list">' + (portfolio.lookthroughProjects.map(function(p){return listRow({name:p.name,tags:[tag('po-tag-type-fof','子基金穿透')],meta:'子基金对本金 '+fmtMoney(p.investAmount||0)+' · 当前价值 '+fmtMoney(p.holding&&p.holding.totalValue||0),nav:'project/'+p.id,arrow:true});}).join('') || '<div class="po-empty">暂无穿透项目</div>') + '</div>')
        : panel('直接投资项目', '<div class="po-list">' + (portfolio.directProjects.map(function (p) { return listRow({name:p.name,tags:[tag('po-tag-type-direct','直投')],meta:'投资金额 '+fmtMoney(p.investAmount)+' · 总价值 '+fmtMoney(p.holding&&p.holding.totalValue||0),nav:'project/'+p.id,arrow:true}); }).join('') || '<div class="po-empty">暂无直接投资项目</div>') + '</div>')
          + panel('所投子基金', '<div class="po-list">' + (rowsHtml || '<div class="po-empty">暂无所投子基金</div>') + '</div>'))
        + '<div style="margin-top:12px"><button class="po-btn po-btn-sm" data-nav="fund-snapshot">查看基金盘面</button></div>'
      + '</div></div>';
  }

  /* 时光机器节点短标题：轴上只显示类型，完整说明放 title；日期压成 YYYY-MM */
  function _tmEventTitle(e) {
    return (e && (e.type || e.name || '').trim()) || '事件';
  }
  function _tmYm(d) {
    if (!d) return '—';
    var s = String(d).trim();
    var m = s.match(/(\d{4})\D*(\d{1,2})/);
    if (m) return m[1] + '-' + (m[2].length === 1 ? '0' + m[2] : m[2]);
    return s.length > 7 ? s.slice(0, 7) : s;
  }
  function _tmEventTip(e) {
    if (!e) return '';
    var bits = [];
    if (e.type) bits.push(e.type);
    if (e.date) bits.push(_tmYm(e.date));
    if (e.desc) bits.push(e.desc);
    return bits.join(' · ');
  }

  /* 时光机器：仅对直投项目且有已确认股权事件时显示；单行细条 */
  function _timeMachineBar(p, id) {
    if (p.type !== 'direct') return '';
    var confirmed = (p.equityEvents || []).filter(function(e){ return e.status === 'confirmed'; });
    if (!confirmed.length) return '';
    var activeNode = DETAIL_STATE.timeMachineNode[id] || 'current';
    var isSnapshot = activeNode !== 'current';
    var activeEvent = isSnapshot ? confirmed.reduce(function(f,e){ return e.id===activeNode?e:f; }, null) : null;
    var inCompare = DETAIL_STATE.timeMachineCompare[id];
    var banner = isSnapshot && activeEvent
      ? '<div class="po-tm-banner">'
        + '<span class="po-tm-banner-text" title="' + esc(_tmEventTip(activeEvent)) + '">查看：' + esc(_tmEventTitle(activeEvent)) + ' ' + esc(_tmYm(activeEvent.date)) + ' · 只读</span>'
        + (!inCompare ? '<button class="po-btn po-btn-sm" data-act="timeMachineCompare" data-arg="' + esc(id) + '">与当前对比</button>' : '')
        + '<button class="po-btn po-btn-sm" data-act="timeMachineNode" data-arg="' + esc(id) + '|current">返回最新</button></div>'
      : '';
    var startNode = '<div class="po-tm-node"><div class="po-tm-dot"></div><div class="po-tm-label"><span class="po-tm-label-title">入股时点</span><span class="po-tm-label-date">' + esc(_tmYm(p.investDate)) + '</span></div></div>';
    var middleNodes = confirmed.map(function(e){
      var on = activeNode === e.id;
      return '<div class="po-tm-gap"></div><div class="po-tm-node po-tm-node-event' + (on?' active':'') + '" data-act="timeMachineNode" data-arg="' + esc(id) + '|' + esc(e.id) + '" title="' + esc(_tmEventTip(e)) + '"><div class="po-tm-dot po-tm-dot-event"></div><div class="po-tm-label"><span class="po-tm-label-title">' + esc(_tmEventTitle(e)) + '</span><span class="po-tm-label-date">' + esc(_tmYm(e.date)) + '</span></div></div>';
    }).join('');
    var endNode = '<div class="po-tm-gap"></div><div class="po-tm-node po-tm-node-current' + (activeNode==='current'?' active':'') + '" data-act="timeMachineNode" data-arg="' + esc(id) + '|current"><div class="po-tm-dot po-tm-dot-current"></div><div class="po-tm-label"><span class="po-tm-label-title">当前最新</span></div></div>';
    return '<div class="po-tm-wrap">' + banner + '<div class="po-tm-rail-scroll"><div class="po-tm-rail">' + startNode + middleNodes + endNode + '</div></div></div>';
  }

  /* 时光机器：两时点对比面板，替换 Tab 区域 */
  function _timeMachineComparePanel(p, id) {
    var activeNode = DETAIL_STATE.timeMachineNode[id];
    var confirmed = (p.equityEvents||[]).filter(function(e){ return e.status==='confirmed'; });
    var ev = confirmed.reduce(function(f,e){ return e.id===activeNode?e:f; }, null);
    if (!ev) return null;
    var inv = Number(p.investAmount||0);
    var hRatio = ev.oldRatio != null ? ev.oldRatio : (p.ratio||0);
    var hVal   = Number(ev.oldValuation||0);
    var hFair  = (hRatio && hVal) ? Math.round(hRatio/100*hVal) : 0;
    var cRatio = Number(p.ratio||0);
    var cVal   = Number(p.valuation||0);
    var cFair  = Number(p.holding&&p.holding.fairValue||0);
    function pctChg(h,c) {
      if (!h||!c||h===c) return '';
      var chg = ((c-h)/h*100).toFixed(1);
      return Number(chg)>=0 ? ' <span class="po-tm-up">▲ +'+chg+'%</span>' : ' <span class="po-tm-dn">▼ '+chg+'%</span>';
    }
    function ppChg(h,c) {
      var d = c-h;
      if (!d) return '';
      return d>0 ? ' <span class="po-tm-up">▲ +'+d+'pp</span>' : ' <span class="po-tm-dn">▼ '+d+'pp</span>';
    }
    var rows = [
      { l:'持股比例', h:hRatio+'%', c:cRatio+'%', ch:ppChg(hRatio,cRatio) },
      { l:'最新投后估值（万元）', h:hVal.toLocaleString(), c:cVal.toLocaleString(), ch:pctChg(hVal,cVal) },
      { l:'持股公允价值（万元）', h:hFair.toLocaleString(), c:cFair.toLocaleString(), ch:pctChg(hFair,cFair) },
      { l:'回报倍数', h:inv?(hFair/inv).toFixed(2)+'x':'—', c:inv?(cFair/inv).toFixed(2)+'x':'—', ch:'' },
      { l:'新增股东', h:'—', c:ev.newShareholders?(ev.newShareholders.join('、')):'—', ch:'' },
    ].map(function(r){
      var changed = r.h !== r.c;
      return '<tr'+(changed?' class="po-tm-cmp-changed"':'')+'><td>'+esc(r.l)+'</td><td class="po-tm-cmp-hist">'+r.h+'</td><td class="po-tm-cmp-curr">'+r.c+r.ch+'</td></tr>';
    }).join('');
    return '<div class="po-tm-cmp-wrap">'
      + '<div class="po-tm-cmp-topbar"><span>仅展示核心持仓字段，未变化字段已折叠</span><button class="po-btn po-btn-sm" data-act="timeMachineExitCompare" data-arg="'+esc(id)+'">× 退出对比</button></div>'
      + '<div class="po-table-shell"><table class="po-table"><thead><tr><th>字段</th><th title="'+esc(_tmEventTip(ev))+'">'+esc(_tmEventTitle(ev))+'<span class="po-tm-cmp-date"> · '+esc(ev.date)+'</span></th><th>当前最新</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      + '</div>';
  }

  /* 详情页 v2：业务任务分 Tab；右侧目录只显示当前 Tab 的节点。 */
  function _detailShell(kind, id, tabs, active, sections) {
    var tabHtml = '<div class="po-detail-tabs">' + tabs.map(function(t){
      return '<button class="po-detail-tab' + (t.key===active?' active':'') + '" data-act="detailTab" data-arg="' + kind + '|' + esc(id) + '|' + t.key + '">' + esc(t.label) + '</button>';
    }).join('') + '</div>';
    var content = sections.map(function(s){
      if (s.noPanel) return '<section class="po-detail-section" id="' + esc(s.id) + '">' + s.body + '</section>';
      if (s.collapsedDefault) {
        var sum = s.summary || '';
        return '<section class="po-detail-section" id="' + esc(s.id) + '">'
          + _collapsibleGroup(s.id, s.title, sum, s.body, false)
          + '</section>';
      }
      return '<section class="po-detail-section" id="' + esc(s.id) + '">' + panel(s.title, s.body, s.actions) + '</section>';
    }).join('');
    var toc = '<aside class="po-detail-toc"><strong>本页目录</strong>' + sections.map(function(s,i){
      return '<button class="' + (i===0?'active':'') + '" data-act="detailJump" data-arg="' + esc(s.id) + '"><span></span>' + esc(s.title) + '</button>';
    }).join('') + '</aside>';
    return tabHtml + '<div class="po-detail-layout"><div class="po-detail-main">' + content + '</div>' + toc + '</div>';
  }

  function _kvGrid(items) {
    return '<div class="po-detail-kv">' + items.map(function(x){return '<div><span>' + esc(x[0]) + '</span><strong>' + esc(x[1]==null||x[1]===''?'—':x[1]) + '</strong></div>';}).join('') + '</div>';
  }

  /* 可行内编辑的 KV 网格：items = [[label, rawValue, fieldKey|null, editType?], ...]
     editType: text|date|month|year|money|capital|percent|multiple|bool|select:选项1|选项2
     金额类存「万元」数值；展示带单位，编辑框只输数字。日期用日期／月份控件，禁止自由文本。 */
  function _kvDisplay(val, type) {
    if (val == null || val === '') return '—';
    if (type === 'money') {
      var mn = typeof val === 'number' ? val : parseCapitalToWan(val);
      return mn == null ? '—' : fmtMoney(mn);
    }
    if (type === 'capital') return fmtCapitalWan(val);
    if (type === 'percent') {
      var pn = Number(String(val).replace(/%/g, ''));
      return isNaN(pn) ? '—' : (pn + '%');
    }
    if (type === 'multiple') {
      var xn = Number(String(val).replace(/x$/i, ''));
      return isNaN(xn) ? '—' : (xn + 'x');
    }
    if (type === 'bool') {
      if (val === true || val === '是' || val === '1' || val === 1) return '是';
      if (val === false || val === '否' || val === '0' || val === 0) return '否';
      return '—';
    }
    return String(val);
  }
  function _kvEditInputHtml(ekey, rawVal, type) {
    var draft = KV_EDIT_DRAFT[ekey];
    var base = draft !== undefined ? draft : rawVal;
    var saveBtn = '<button class="po-kv-save po-btn po-btn-xs" data-act="kvEditSave" data-arg="' + esc(ekey) + '">保存</button><button class="po-kv-cancel" data-act="kvEditCancel" data-arg="' + esc(ekey) + '" aria-label="取消">×</button>';
    function wrap(ctrl) { return '<span class="po-kv-editing">' + ctrl + saveBtn + '</span>'; }
    if (type === 'money' || type === 'capital') {
      var unit = getArchiveMoneyUnit();
      var wanN;
      if (draft !== undefined && draft !== '') wanN = moneyUnitToWan(draft, unit);
      else wanN = parseCapitalToWan(rawVal);
      if (wanN == null || isNaN(wanN)) wanN = null;
      var numShow = wanN == null ? '' : moneyWanToUnit(wanN, unit);
      return wrap('<span class="po-kv-numwrap"><input class="po-kv-input po-kv-input-num" type="number" step="0.01" value="' + esc(String(numShow)) + '" data-ekey="' + esc(ekey) + '" data-etype="' + type + '" data-money-unit="' + unit + '">'
        + '<span class="po-kv-unit">' + esc(moneyUnitLabel(unit)) + '</span>'
        + '</span>');
    }
    if (type === 'percent') {
      var pn = draft !== undefined ? draft : Number(String(rawVal == null ? '' : rawVal).replace(/%/g, ''));
      if (pn !== '' && isNaN(pn)) pn = '';
      return wrap('<span class="po-kv-numwrap"><input class="po-kv-input po-kv-input-num" type="number" step="0.01" value="' + esc(String(pn === '' || pn == null || isNaN(pn) ? '' : pn)) + '" data-ekey="' + esc(ekey) + '" data-etype="percent"><span class="po-kv-unit">%</span></span>');
    }
    if (type === 'multiple') {
      var xn = draft !== undefined ? draft : Number(String(rawVal == null ? '' : rawVal).replace(/x$/i, ''));
      if (xn !== '' && isNaN(xn)) xn = '';
      return wrap('<span class="po-kv-numwrap"><input class="po-kv-input po-kv-input-num" type="number" step="0.01" value="' + esc(String(xn === '' || xn == null || isNaN(xn) ? '' : xn)) + '" data-ekey="' + esc(ekey) + '" data-etype="multiple"><span class="po-kv-unit">x</span></span>');
    }
    if (type === 'date') {
      var dv = draft !== undefined ? draft : normalizeDateValue(rawVal);
      return wrap('<input class="po-kv-input" type="date" value="' + esc(dv) + '" data-ekey="' + esc(ekey) + '" data-etype="date">');
    }
    if (type === 'month') {
      var mv = draft !== undefined ? draft : normalizeMonthValue(rawVal);
      return wrap('<input class="po-kv-input" type="month" value="' + esc(mv) + '" data-ekey="' + esc(ekey) + '" data-etype="month">');
    }
    if (type === 'year') {
      var yv = draft !== undefined ? draft : normalizeYearValue(rawVal);
      return wrap('<input class="po-kv-input po-kv-input-num" type="number" min="1900" max="2100" step="1" value="' + esc(yv) + '" data-ekey="' + esc(ekey) + '" data-etype="year">');
    }
    if (type === 'bool') {
      var bv = draft !== undefined ? draft : ((rawVal === true || rawVal === '是' || rawVal === 1 || rawVal === '1') ? '是' : ((rawVal === false || rawVal === '否' || rawVal === 0 || rawVal === '0') ? '否' : ''));
      return wrap('<select class="po-kv-input" data-ekey="' + esc(ekey) + '" data-etype="bool"><option value=""' + (bv === '' ? ' selected' : '') + '>—</option><option value="是"' + (bv === '是' ? ' selected' : '') + '>是</option><option value="否"' + (bv === '否' ? ' selected' : '') + '>否</option></select>');
    }
    if (type && String(type).indexOf('select:') === 0) {
      var opts = String(type).slice(7).split('|').filter(Boolean);
      var cur = draft !== undefined ? String(draft) : String(rawVal == null || rawVal === '—' ? '' : rawVal);
      return wrap('<select class="po-kv-input" data-ekey="' + esc(ekey) + '" data-etype="' + esc(type) + '"><option value=""' + (cur === '' ? ' selected' : '') + '>—</option>' + opts.map(function (o) {
        return '<option value="' + esc(o) + '"' + (cur === o ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join('') + '</select>');
    }
    var tv = draft !== undefined ? draft : (rawVal == null || rawVal === '—' ? '' : rawVal);
    return wrap('<input class="po-kv-input" type="text" value="' + esc(String(tv)) + '" data-ekey="' + esc(ekey) + '" data-etype="text">');
  }
  function _editableKvGrid(items, kind, entityId) {
    return '<div class="po-detail-kv">' + items.map(function (x) {
      var label = x[0], val = x[1], fieldKey = x[2], editType = x[3] || 'text';
      var display = _kvDisplay(val, editType);
      if (fieldKey) {
        var ekey = kind + '|' + entityId + '|' + fieldKey;
        if (KV_EDIT_STATE[ekey]) {
          return '<div><span>' + esc(label) + '</span>' + _kvEditInputHtml(ekey, val, editType) + '</div>';
        }
        return '<div><span>' + esc(label) + '</span><strong class="po-kv-editable" data-act="kvEditStart" data-arg="' + esc(ekey) + '" data-etype="' + esc(editType) + '">' + esc(display) + '</strong></div>';
      }
      return '<div><span>' + esc(label) + '</span><strong>' + esc(display) + '</strong></div>';
    }).join('') + '</div>';
  }

  function _projectExtPublic(p, isLt) {
    var mock = p.externalPublic || p.外部数据_企查查 || null;
    if (mock) return mock;
    var src = isLt ? window.PE_POST_FOF_PROJECT_MOCK
      : (p.type === 'direct' ? (window.PE_POST_DIRECT_PROJECT_MOCK && window.PE_POST_DIRECT_PROJECT_MOCK[p.id] || null) : null);
    if (!src) return null;
    return isLt ? (src.id === p.id ? src.外部数据_企查查 : null) : (src.外部数据_企查查 || null);
  }
  function _riskHitCount(v) {
    if (v == null) return 0;
    if (typeof v === 'object') return Number(v.count) || 0;
    if (typeof v === 'boolean') return v ? 1 : 0;
    return Number(v) || 0;
  }
  function _riskHits(rd) {
    if (!rd) return [];
    var defs = [
      ['司法风险', '司法风险'],
      ['行政处罚', '行政处罚'],
      ['经营异常', '经营异常'],
      ['失信被执行人', '失信被执行'],
      ['失信被执行', '失信被执行'],
      ['股权冻结', '股权冻结'],
      ['严重违法', '严重违法']
    ];
    var seen = {}, out = [];
    defs.forEach(function (d) {
      var key = d[0], label = d[1];
      if (seen[label] || rd[key] == null) return;
      var cnt = _riskHitCount(rd[key]);
      if (cnt <= 0) return;
      seen[label] = true;
      var list = (typeof rd[key] === 'object' && rd[key] && Array.isArray(rd[key].list)) ? rd[key].list : [];
      out.push({ key: key, label: label, count: cnt, list: list });
    });
    return out;
  }
  function _normalizeStageIn(v) {
    v = String(v || '').trim();
    if (v === '中后期' || v === '成长' || v === '成长期') return '中期';
    if (v === '成熟') return '成熟期';
    if (v === '早期' || v === '中期' || v === '成熟期') return v;
    return v || '未分类';
  }
  function _qccGsCatalog() {
    return [
      { keys: ['星河', '星河智造', '91320594MA1XQ8C7X2'], gs: { 企业全称: '星河智造（苏州）科技有限公司', 统一社会信用代码: '91320594MA1XQ8C7X2', 成立日期: '2019-04-10', 注册资本: '5,000 万元', 法定代表人: '沈峰', 经营状态: '存续', 注册地址: '苏州工业园区星港街328号星海广场B栋1803', 省: '江苏省', 市: '苏州', 区: '工业园区' } },
      { keys: ['京东', '京东工业', '91110105MA01F2B8R7'], gs: { 企业全称: '京东工业有限公司', 统一社会信用代码: '91110105MA01F2B8R7', 成立日期: '2017-06-08', 注册资本: '100,000 万元', 法定代表人: '刘强东', 经营状态: '存续', 注册地址: '北京市朝阳区东坝乡将台路5号院2号楼', 省: '北京市', 市: '北京', 区: '大兴区' } },
      { keys: ['远景', '远景储能', '91320200MA1XQ9FAR8'], gs: { 企业全称: '远景储能科技有限公司', 统一社会信用代码: '91320200MA1XQ9FAR8', 成立日期: '2018-03-12', 注册资本: '20,000 万元', 法定代表人: '张雷', 经营状态: '存续', 注册地址: '江苏省无锡市新吴区', 省: '江苏省', 市: '无锡', 区: '新吴区' } },
      { keys: ['众源一号', '众源资本一号', '91310000MA1FLZX001'], gs: { 企业全称: '上海众源一号股权投资基金合伙企业（有限合伙）', 统一社会信用代码: '91310000MA1FLZX001', 成立日期: '2018-05-20', 注册资本: '120,000 万元', 法定代表人: '', 经营状态: '存续', 注册地址: '上海市浦东新区', 省: '上海市', 市: '上海', 区: '浦东新区' } },
      { keys: ['众源二号', '众源资本二号', '91310000MA1FLZX002'], gs: { 企业全称: '上海众源二号股权投资基金合伙企业（有限合伙）', 统一社会信用代码: '91310000MA1FLZX002', 成立日期: '2020-03-15', 注册资本: '150,000 万元', 法定代表人: '', 经营状态: '存续', 注册地址: '上海市浦东新区', 省: '上海市', 市: '上海', 区: '浦东新区' } },
      { keys: ['GGV', '纪源', '皓元', 'SLK742'], gs: { 企业全称: '苏州纪源皓元创业投资合伙企业（有限合伙）', 统一社会信用代码: '91320594MA2GGVSLK7', 成立日期: '2019-12-18', 注册资本: '160,100 万元', 法定代表人: '', 经营状态: '存续', 注册地址: '苏州工业园区苏虹东路183号', 省: '江苏省', 市: '苏州', 区: '工业园区' } }
    ];
  }
  function _qccGsSuggest(q) {
    q = String(q || '').replace(/\s/g, '');
    if (q.length < 2) return [];
    var out = [];
    _qccGsCatalog().forEach(function (row) {
      var hit = row.keys.some(function (k) { return q.indexOf(k) >= 0 || k.indexOf(q) >= 0; })
        || (row.gs.企业全称 && row.gs.企业全称.indexOf(q) >= 0)
        || (row.gs.统一社会信用代码 && row.gs.统一社会信用代码.indexOf(q) >= 0);
      if (hit) out.push(row.gs);
    });
    return out;
  }
  function _qccGsLookup(q) {
    var list = _qccGsSuggest(q);
    return list.length === 1 ? list[0] : null;
  }
  function _managerCatalog() {
    var base = ['众源资本', '宁波纪源投资管理有限公司', '上海纪源资本管理有限公司', '苏州工业园区元禾原点创业投资管理有限公司'];
    var seen = {};
    var out = [];
    base.forEach(function (n) { if (n && !seen[n]) { seen[n] = true; out.push(n); } });
    try {
      (window.PE_POST_STORE ? window.PE_POST_STORE.funds() : []).forEach(function (f) {
        var m = f && f.manager;
        if (m && !seen[m]) { seen[m] = true; out.push(m); }
      });
    } catch (e) {}
    return out;
  }
  function _managerSuggest(q) {
    q = String(q || '').replace(/\s/g, '');
    if (!q) return _managerCatalog().slice(0, 8);
    return _managerCatalog().filter(function (n) { return n.indexOf(q) >= 0 || q.indexOf(n) >= 0; });
  }
  function _qccEnrichFundRow(row) {
    row = row || {};
    var gs = _qccGsLookup(row.creditCode || row.fullName || row.name);
    if (!gs) return row;
    row.fullName = _qccEmpty(row.fullName, gs.企业全称);
    row.creditCode = _qccEmpty(row.creditCode, gs.统一社会信用代码);
    row.registeredPlace = _qccEmpty(row.registeredPlace, ((gs.市 || '') + (gs.区 || '')) || gs.注册地址);
    /* 成立日期不补：台账口径非工商 */
    row.externalPublic = row.externalPublic || {};
    row.externalPublic.工商信息 = { 企业全称: gs.企业全称, 统一社会信用代码: gs.统一社会信用代码, 成立日期: gs.成立日期, 注册资本: gs.注册资本, 法定代表人: gs.法定代表人, 经营状态: gs.经营状态, 注册地址: gs.注册地址, 同步时间: _publicNowStamp(), 数据来源: '企查查，仅供对照' };
    row.updates = (row.updates || []).concat([{ at: _publicNowStamp(), by: '当前用户', field: '工商基础', before: '—', after: gs.企业全称 || '已补齐', source: '对照·企查查' }]);
    return row;
  }
  function _fillEmptyInput(overlay, name, val) {
    if (val == null || String(val).trim() === '') return;
    var el = overlay.querySelector('[name="' + name + '"]');
    if (!el || String(el.value || '').trim()) return;
    el.value = val;
  }
  function _qccEmpty(cur, next) {
    if (cur != null && String(cur).trim() !== '') return cur;
    return next == null ? '' : next;
  }
  function _autoQccIntoOverlay(overlay, kind) {
    var q = kind === 'fund'
      ? (_val(overlay, 'name') || _val(overlay, 'fullName') || _val(overlay, 'creditCode'))
      : (_val(overlay, 'creditCode') || _val(overlay, 'legalName') || _val(overlay, 'name'));
    var gs = _qccGsLookup(q);
    if (!gs) return null;
    overlay._qccGs = gs;
    if (kind === 'fund') {
      _fillEmptyInput(overlay, 'fullName', gs.企业全称);
      _fillEmptyInput(overlay, 'registeredPlace', (gs.市 || '') + (gs.区 || '') || gs.注册地址);
      _fillEmptyInput(overlay, 'creditCode', gs.统一社会信用代码);
    } else {
      _fillEmptyInput(overlay, 'legalName', gs.企业全称);
      _fillEmptyInput(overlay, 'creditCode', gs.统一社会信用代码);
      _fillEmptyInput(overlay, 'province', gs.省);
      _fillEmptyInput(overlay, 'city', gs.市);
      _fillEmptyInput(overlay, 'district', gs.区);
      _fillEmptyInput(overlay, 'address', gs.注册地址);
      _fillEmptyInput(overlay, 'legalRep', gs.法定代表人);
      _fillEmptyInput(overlay, 'businessStatus', gs.经营状态);
      _fillEmptyInput(overlay, 'establishDate', normalizeDateValue(gs.成立日期) || gs.成立日期);
      var _capWan = parseCapitalToWan(gs.注册资本);
      if (_capWan != null) _fillEmptyInput(overlay, 'registeredCapital', _capWan);
    }
    return gs;
  }
  function _qccEnrichProjectRow(row) {
    row = row || {};
    var gs = _qccGsLookup(row.creditCode || row.legalName || row.name);
    if (!gs) return row;
    row.legalName = _qccEmpty(row.legalName, gs.企业全称);
    row.creditCode = _qccEmpty(row.creditCode, gs.统一社会信用代码);
    row.province = _qccEmpty(row.province, gs.省);
    row.city = _qccEmpty(row.city, gs.市);
    row.district = _qccEmpty(row.district, gs.区);
    row.address = _qccEmpty(row.address, gs.注册地址);
    row.legalRep = _qccEmpty(row.legalRep, gs.法定代表人);
    row.businessStatus = _qccEmpty(row.businessStatus, gs.经营状态);
    row.establishDate = _qccEmpty(row.establishDate, normalizeDateValue(gs.成立日期) || gs.成立日期);
    var _rowCap = parseCapitalToWan(gs.注册资本);
    row.registeredCapital = _qccEmpty(row.registeredCapital, _rowCap != null ? _rowCap : '');
    row.externalPublic = row.externalPublic || {};
    row.externalPublic.工商信息 = { 企业全称: gs.企业全称, 统一社会信用代码: gs.统一社会信用代码, 成立日期: gs.成立日期, 注册资本: gs.注册资本, 法定代表人: gs.法定代表人, 经营状态: gs.经营状态, 注册地址: gs.注册地址, 同步时间: _publicNowStamp(), 数据来源: '企查查，仅供对照' };
    row.updates = (row.updates || []).concat([{ at: _publicNowStamp(), by: '当前用户', field: '工商基础', before: '—', after: gs.企业全称 || '已补齐', source: '对照·企查查' }]);
    return row;
  }
  function _publicNowStamp() {
    var d = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function _publicSyncNote(id) {
    var n = id && DETAIL_STATE.publicSyncNote && DETAIL_STATE.publicSyncNote[id];
    if (!n) return {};
    if (typeof n === 'string') return { gs: n, risk: n };
    return n;
  }
  function _publicSyncKind(ext, id, kind) {
    var note = _publicSyncNote(id);
    if (kind === 'gs' && note.gs) return note.gs;
    if (kind === 'risk' && note.risk) return note.risk;
    if (!ext) return '';
    if (kind === 'gs') return (ext.工商信息 && ext.工商信息.同步时间) || ext.同步时间 || '';
    return (ext.风险数据 && ext.风险数据.同步时间) || ext.同步时间 || '';
  }
  /* 公开数据 Tab 只用风险同步时间 */
  function _publicSyncUnified(ext, id) {
    var b = _publicSyncKind(ext, id, 'risk');
    return b || '未同步';
  }
  function _publicRiskTabHtml(p, id) {
    var isLt = p.type === 'lookthrough';
    var ext = _projectExtPublic(p, isLt);
    var rd = ext && ext.风险数据;
    var hits = _riskHits(rd);
    var syncAt = _publicSyncUnified(ext, id);
    var riskHtml = hits.length
      ? hits.map(function (h) {
          var items = (h.list && h.list.length)
            ? '<ul class="po-risk-drawer-ul">' + h.list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'
            : '<p class="po-risk-drawer-empty-line">计数已同步，明细待补拉</p>';
          return '<div class="po-risk-drawer-block"><div class="po-risk-drawer-block-h"><strong>' + esc(h.label) + '</strong><span>' + h.count + ' 起</span></div>' + items + '</div>';
        }).join('')
      : '<div class="po-empty">当前无公开风险命中</div>';
    return '<div class="po-pub-toolbar">'
      + '<span class="po-risk-drawer-meta">更新于 ' + esc(syncAt) + '</span>'
      + '<button type="button" class="po-btn po-btn-sm" style="margin-left:auto" data-act="refreshPublicData" data-arg="' + esc(id) + '">刷新</button>'
      + '</div>'
      + '<div class="po-pub-sec-h">公开风险</div>' + riskHtml
      + '<p class="po-pub-foot">来源：企查查</p>';
  }

  function _fundNavLink(fid, name) {
    var label = name || '—';
    if (fid) return '<button type="button" class="po-table-link" data-nav="fund/' + esc(fid) + '">' + esc(label) + '</button>';
    return '<strong>' + esc(label) + '</strong>';
  }

  function pageProjectDetailV2(id) {
    var store=window.PE_POST_STORE, p=store&&store.project(id);
    if(!p)return '<div class="po-page">'+toolbar('项目详情')+'<div class="po-body"><div class="po-empty">未找到项目</div></div></div>';
    var isLt=p.type==='lookthrough', sourceFund=isLt&&store.fund(p.targetFundId);
    /* 直投与穿透均含财务数据 Tab；穿透财务随父基金持仓同步展示；公开数据独立主 Tab */
    var tabs=[{key:'overview',label:'概览'},{key:'investment',label:'投资与股权'},{key:'finance',label:'经营情况'},{key:'financial',label:'财务数据'},{key:'public',label:'公开数据'},{key:'materials',label:'材料与更新'}];
    var active=DETAIL_STATE.projectTabs[id]||'overview';
    if(!tabs.some(function(t){return t.key===active;}))active='overview';
    var sections=[];
    if(active==='overview'){
      var profileBody;
      var _parentFunds=(p.parentFundIds||[]).map(function(fid){return store&&store.fund?store.fund(fid):null;}).filter(Boolean);
      var _parentPath=_parentFunds.map(function(f){return _fundNavLink(f.id,f.name);}).join('<span>＋</span>');
      var _pathHtml;
      if(isLt){
        var _sfName=(sourceFund&&sourceFund.name)||p.sourceFundName||'—';
        var _sfId=p.targetFundId||(sourceFund&&sourceFund.id)||'';
        var _ltParts=[];
        if(_parentPath) _ltParts.push(_parentPath);
        _ltParts.push(_fundNavLink(_sfId,_sfName));
        _ltParts.push('<strong>'+esc(p.name)+'</strong>');
        _pathHtml='<div class="po-detail-path">'+_ltParts.join('<span>→</span>')+'</div>';
        if(p.targetFundId){
          _pathHtml+='<div class="po-detail-path-jump"><button type="button" class="po-table-link" data-nav="fund/'+esc(p.targetFundId)+'">去子基金档案看出资与分配</button></div>';
        }
      } else {
        _pathHtml=_parentPath
          ? '<div class="po-detail-path">'+_parentPath+'<span>→</span><strong>'+esc(p.name)+'</strong></div>'
          : '';
      }
      if(isLt){
        profileBody=_editableKvGrid([
          ['项目类型','子基金穿透',null],
          ['项目阶段',({pre:'投前',deal:'投中',post:'投后'})[p.stage]||'—',null],
          ['投资阶段',p.stageIn||'—','stageIn','select:早期|中期|成熟期'],
          ['所属行业',p.industry,'industry'],['主营业务',p.mainBusiness||'—','mainBusiness'],
          ['企业所在省',p.province||'—','province'],['企业所在市',p.city||'—','city'],['企业所在区',p.district||'—','district'],
          ['项目注册地址',p.address||p.regAddress||'—','address'],
          ['负责人',p.owner||'—','owner'],['数据期间',p.holding&&p.holding.period||'—',null]
        ],'project',id)+_pathHtml;
      } else {
        profileBody=_editableKvGrid([
          ['项目类型','直接投资',null],
          ['项目阶段',({pre:'投前',deal:'投中',post:'投后'})[p.stage]||'—',null],
          ['投资阶段',p.stageIn||'—','stageIn','select:早期|中期|成熟期'],
          ['所属行业',p.industry,'industry'],
          ['主营业务',p.mainBusiness,'mainBusiness'],
          ['企业所在省',p.province||'—','province'],
          ['企业所在市',p.city||'—','city'],
          ['企业所在区',p.district||'—','district'],
          ['项目注册地址',p.address||p.regAddress||'—','address'],
          ['负责人',p.owner,'owner'],
          ['数据期间',p.holding&&p.holding.period||'—',null]
        ],'project',id)+_pathHtml;
      }
      /* 主档键字段：信用代码等；完整工商不进公开数据 Tab */
      var _ovExtMock=_projectExtPublic(p,isLt);
      var _ovGs=_ovExtMock&&_ovExtMock.工商信息;
      var _gsCredit=p.creditCode||(_ovGs&&_ovGs.统一社会信用代码)||'';
      var _gsLegal=p.legalName||(_ovGs&&_ovGs.企业全称)||'';
      var _gsDate=p.establishDate||p.foundedDate||(_ovGs&&_ovGs.成立日期)||'';
      var _gsCap=p.registeredCapital||p.regCapital||(_ovGs&&_ovGs.注册资本)||'';
      var _gsRep=p.legalRep||(_ovGs&&_ovGs.法定代表人)||'';
      var _gsStat=p.businessStatus||p.bizStatus||(_ovGs&&_ovGs.经营状态)||'';
      var _gsAddr=p.address||p.regAddress||(_ovGs&&_ovGs.注册地址)||'';
      if(_ovGs||_gsCredit||_gsDate||_gsLegal||_gsCap||_gsRep||_gsStat||_gsAddr){
        var _gsKeyRows=[];
        if(_gsCredit) _gsKeyRows.push(['统一社会信用代码',_gsCredit]);
        if(_gsLegal && _gsKeyRows.length<2) _gsKeyRows.push(['工商全称',_gsLegal]);
        profileBody+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--xb-line,#e5e5ea)">'
          +(_gsKeyRows.length?_kvGrid(_gsKeyRows):'')
          +'</div>';
      }
      sections.push({id:'project-overview-profile',title:isLt?'企业与穿透路径':'企业概况',body:profileBody});
      sections.push({id:'project-overview-investment',title:'当前投资概览',body:_editableKvGrid([
        [isLt?'子基金对本金':'投资成本',p.investAmount||0,'investAmount','money'],
        ['当前价值',p.holding&&p.holding.totalValue||0,'holding.totalValue','money'],
        ['持股比例',p.ratio||0,'ratio','percent'],
        [isLt?'剩余成本':'最新投后估值',isLt?(p.remainingCost||0):(p.valuation||0),isLt?'remainingCost':'valuation','money'],
        ['退出状态',p.exitStatus||'在管','exitStatus','select:在管|部分退出|完全退出|核销减值'],
        ['最近更新',p.lastUpdate||'—',null]
      ],'project',id)});
      var latest=(p.equityEvents||[])[(p.equityEvents||[]).length-1];
      sections.push({id:'project-overview-change',title:'最近变化',body:latest?_kvGrid([['变化类型',latest.type],['发生日期',latest.date],['变化说明',latest.desc],['确认状态','已确认']]):'<div class="po-empty">暂无结构化变化记录</div>'});
    } else if(active==='public'){
      sections.push({id:'project-public-risk',title:'公开风险',body:_publicRiskTabHtml(p,id)});
    } else if(active==='investment'){
      var positionBody=_editableKvGrid([
        ['是否有后续融资',p.hasFollowOn,'hasFollowOn','bool'],
        ['最近一轮日期',p.latestRoundDate||'','latestRoundDate','month'],
        ['最近一轮轮次',p.latestRound||'','latestRound'],
        ['最近一轮估值',p.latestValuation!=null?p.latestValuation:'','latestValuation','money'],
        ['本轮后持股',p.postRoundRatio!=null?p.postRoundRatio:'','postRoundRatio','percent'],
        ['跟投说明',p.followOnText||'','followOnText'],
        ['首次投资日期',p.investDate,'investDate','month'],
        ['投资轮次',p.round,'round'],
        [isLt?'投资角色（GP 口径）':'投资角色',p.investRole,'investRole'],
        [isLt?'子基金对本金':'投资金额',p.investAmount||0,'investAmount','money'],
        ['最新持股比例',p.ratio||0,'ratio','percent'],
        ['持股公允价值',p.holding&&p.holding.fairValue||0,'holding.fairValue','money'],
        ['公允价值变动',p.fairValueChange||'—',null],
        ['已退出金额',p.exitAmount||0,'exitAmount','money'],
        ['总价值',p.holding&&p.holding.totalValue||0,'holding.totalValue','money'],
        ['回报倍数',p.investAmount?Number((Number(p.holding&&p.holding.totalValue||0)/Number(p.investAmount)).toFixed(2)):null,null,'multiple']
      ],'project',id);
      sections.push({id:'project-investment-position',title:'持仓信息',body:positionBody});
      sections.push({id:'project-investment-events',title:'投资与股权事件',actions:'<button class="po-btn po-btn-sm" data-act="addEquityEvent" data-arg="'+esc(id)+'">+ 新增事件</button>',body:(p.equityEvents&&p.equityEvents.length)?_dataTable(['日期','类型','说明','确认状态'],p.equityEvents.slice().reverse().map(function(e){return [e.date||'—',e.type||'事件',{text:e.desc||'—',wrap:true,title:e.desc||''},e.status==='confirmed'||!e.status?'已确认':(e.status||'—')];}),'暂无投资或股权事件'):'<div class="po-empty">暂无投资或股权事件</div>'});
      if(p.terms&&p.terms.length){
        sections.push({id:'project-investment-terms',title:'关键约定',actions:'<button class="po-btn po-btn-sm" data-act="addTerm" data-arg="'+esc(id)+'">+ 添加约定</button>',body:_dataTable(['约定','详情','操作'],p.terms.map(function(t,ti){return [t.name||'—',{text:t.detail||'—',wrap:true}, {html:'<button class="po-btn po-btn-xs" data-act="editTerm" data-arg="'+esc(id)+'|'+ti+'">编辑</button>'}];}))});
      }
    } else if(active==='finance'){
      var _fpPeriod=p.businessProgressPeriod||( p.periods&&p.periods.length?p.periods.filter(function(x){return x.status==='done';}).slice(-1)[0]&&p.periods.filter(function(x){return x.status==='done';}).slice(-1)[0].label:'—' );
      var _buUpdates=(p.businessUpdates&&p.businessUpdates.length)?p.businessUpdates:(p.businessProgress?[{period:_fpPeriod||'最新',date:p.lastUpdate||'',text:p.businessProgress}]:[]);
      var _bpBody=_buUpdates.length
        ?_dataTable(['期间','日期','进展'],_buUpdates.slice().reverse().map(function(u){return [u.period||'最新',u.date||'—',{text:u.text||'—',wrap:true,title:u.text||''}];}))
        :'<div class="po-empty">暂无本期业务进展；从季报或更新材料确认后展示</div>';
      var _exitPlanBody=_editableKvGrid([
        ['退出规划', (p.exitPlan && p.exitPlan !== '—') ? p.exitPlan : '', 'exitPlan'],
        ['后续融资情况', (p.followOnNarrative && p.followOnNarrative !== '—') ? p.followOnNarrative : (p.followOnText||''), 'followOnNarrative']
      ],'project',id);
      sections.push({id:'project-finance-business',title:'业务进展',actions:'<button class="po-btn po-btn-sm" data-act="addBusinessUpdate" data-arg="'+esc(id)+'">+ 新增更新</button>',body:_bpBody + '<div style="margin-top:14px">' + _exitPlanBody + '</div>'});
    } else if(active==='financial'){
      var periods=p.periods||[];
      var _finAny=function(keys){
        return periods.some(function(x){return keys.some(function(k){return x[k]!=null;});});
      };
      var _ltHasIS=_finAny(['revenue','grossProfit','netProfit','researchCost']);
      var _ltHasBS=_finAny(['totalAssets','totalLiab','equity']);
      var _ltHasCF=_finAny(['operatingCF']);
      var _ltEmptyCopy='<div class="po-empty">随 GP 季报同步，未披露不造表</div>';
      if(isLt && !_ltHasIS && !_ltHasBS && !_ltHasCF){
        sections.push({id:'project-financial-empty',title:'财务数据',body:_ltEmptyCopy});
      } else if(isLt && !_ltHasBS && !_ltHasCF){
        var _sparseKeys=[['revenue','营业收入'],['grossProfit','毛利润'],['netProfit','净利润'],['researchCost','研发费用']];
        var _sparseBody=periods.map(function(x){
          var rows=_sparseKeys.filter(function(k){return x[k[0]]!=null;}).map(function(k){
            return [k[1], fmtMoney(Number(x[k[0]]))];
          });
          if(!rows.length) return '';
          return '<div style="margin-bottom:12px"><div style="font-size:12px;color:var(--xb-muted);margin-bottom:6px">'+esc(x.label)+(x.status==='pending'?' · 待确认':'')+'</div>'+_kvGrid(rows)+'</div>';
        }).filter(Boolean).join('');
        sections.push({id:'project-financial-data',title:'财务数据',body:_sparseBody||_ltEmptyCopy});
      } else if(!periods.length){
        sections.push({id:'project-financial-empty',title:'财务数据',body:'<div class="po-empty">暂无财务期间数据，上传财报后自动生成</div>'});
      } else {
          var pfs=PROJ_FIN_STATE[p.id]||{};
          var finSubTab=pfs.subTab||'is';
          var finUnit=pfs.unit||getArchiveMoneyUnit();
          if(!MONEY_UNIT_DEFS.some(function(d){return d.key===finUnit;})) finUnit='wan';
          var finCurrency=pfs.currency||'rmb';
          var saCompare=pfs.saCompare||'yoy';
          var saExpand=pfs.saExpand||'';
          var saShowAll=!!pfs.saShowAll;
          var saPeriodId=pfs.saPeriod||'';
          var unitFactor={wan:1,baiwan:0.01,yi:0.0001,yuan:10000}[finUnit]||1;
          var currencyFactor=finCurrency==='usd'?(1/7.2):1;
          var totalFactor=unitFactor*currencyFactor;
          var unitLabel=moneyUnitLabel(finUnit);
          var currencyLabel=finCurrency==='usd'?'USD':'RMB';
          var computeFinCell=function(fk,x){
            if(fk==='_grossMargin')return x.revenue?((Number(x.grossProfit||0)/Number(x.revenue))*100).toFixed(1)+'%':'—';
            if(fk==='_leverageRatio')return x.totalAssets?((Number(x.totalLiab||0)/Number(x.totalAssets))*100).toFixed(1)+'%':'—';
            if(x[fk]==null)return '—';
            var v=Number(x[fk])*totalFactor;
            return (finUnit==='yi'||finUnit==='baiwan')?v.toFixed(2):Math.round(v).toLocaleString();
          };
          var buildFinTable=function(rows){
            return '<div class="po-table-shell"><table class="po-table"><thead><tr><th>指标</th>'
              +periods.map(function(x){return '<th class="po-cell-num'+(x.status==='pending'?' po-cell-pending':'')+'">'+esc(x.label)+(x.status==='pending'?' <small style="color:var(--xb-muted);font-weight:400">待确认</small>':'')+'</th>';}).join('')
              +'</tr></thead><tbody>'
              +rows.map(function(f){
                var isComp=f[0].charAt(0)==='_';
                return '<tr'+(isComp?' class="po-fin-computed"':'')+'><td>'+esc(f[1])+'</td>'
                  +periods.map(function(x){
                    var changed=!isComp&&x.changedFields&&x.changedFields.indexOf(f[0])>=0;
                    return '<td class="po-cell-num'+(x.status==='pending'?' po-cell-pending':'')+(changed?' po-cell-changed':'')+'">'+computeFinCell(f[0],x)+'</td>';
                  }).join('')+'</tr>';
              }).join('')+'</tbody></table></div>';
          };
          var _saDone=periods.filter(function(x){return x.status==='done'&&x.revenue!=null;});
          var _saCur=_saDone.filter(function(x){return x.id===saPeriodId;})[0]||(_saDone.length?_saDone[_saDone.length-1]:null);
          var _saPrev=null;
          if(_saCur&&_saDone.length>=2){
            var _saIdx=_saDone.indexOf(_saCur);
            if(saCompare==='qoq') {
              _saPrev=_saIdx>0?_saDone[_saIdx-1]:null;
            } else {
              var _cy=parseInt(String(_saCur.id||'').slice(0,4),10);
              _saPrev=_saDone.filter(function(x){return x!==_saCur&&parseInt(String(x.id||'').slice(0,4),10)===_cy-1;}).slice(-1)[0]||null;
            }
          }
          var _saPct=function(n,d){return (d&&Number(d))?((Number(n)/Number(d))*100):null;};
          var _saChg=function(a,b){return (a!=null&&b!=null)?(a-b):null;};
          var _saFmtPct=function(v,signed){
            if(v==null) return '—';
            var s=Number(v).toFixed(1)+'%';
            return (signed&&v>0)?('+'+s):s;
          };
          var _saFmtPp=function(v){return v==null?'—':((v>0?'+':'')+v.toFixed(1)+'pp');};
          var _saFmtNum=function(v,d){return v==null?'—':Number(v).toFixed(d==null?2:d);};
          var _saHitThresh=function(val,thresh){
            if(val==null||!thresh) return false;
            var m=String(thresh).trim().match(/^(<=|>=|<|>)\s*(-?\d+(?:\.\d+)?)\s*%?$/);
            if(!m) return false;
            var op=m[1], n=parseFloat(m[2]);
            if(op==='<') return val<n;
            if(op==='<=') return val<=n;
            if(op==='>') return val>n;
            if(op==='>=') return val>=n;
            return false;
          };
          /* 科目分析出数唯一来源＝配置中心启用指标集（有预警阈值）；禁止页面另写一套口径 */
          var _saIndList=[];
          try{
            var _crud=window.CFG_CENTER_CRUD;
            if(_crud&&_crud.listIndicatorSets&&_crud.listIndicatorsInSet){
              var _sets=(_crud.listIndicatorSets()||[]).filter(function(s){return s.enabled&&(s.standardId==='std-cn'||!s.standardId);});
              var _set=_sets.sort(function(a,b){return (a.sort||0)-(b.sort||0);})[0];
              if(_set){
                _saIndList=(_crud.listIndicatorsInSet(_set.id)||[]).filter(function(ind){
                  return ind.enabled!==false&&String(ind.threshold||'').trim()!==''&&ind.direction!=='none';
                });
              }
            }
          }catch(e){ _saIndList=[]; }
          if(!_saIndList.length){
            _saIndList=[
              {id:'ind-1',name:'营收同比增速',description:'本期营收相较上一同期的增长率',threshold:'< -20%',direction:'up'},
              {id:'ind-2',name:'毛利率',description:'毛利润 / 营业收入 × 100%',threshold:'< 15%',direction:'down'},
              {id:'ind-3',name:'净利润率',description:'净利润 / 营业收入 × 100%',threshold:'< 5%',direction:'down'},
              {id:'ind-4',name:'资产负债率',description:'负债合计 / 资产总计 × 100%',threshold:'> 70%',direction:'up'}
            ];
          }
          var _saDirLabel=function(d){return d==='up'?'上升触发':(d==='down'?'下降触发':'—');};
          var _saHint=function(name){
            if(name.indexOf('营收')>=0&&name.indexOf('增速')>=0) return {tip:'收入骤降，核对是否丢客户／砍价／确认口径变化',stmt:'is',stmtLabel:'利润表',focus:'营业收入'};
            if(name==='毛利率') return {tip:'毛利走弱，核对单价、成本与产品结构',stmt:'is',stmtLabel:'利润表',focus:'营业收入／营业成本／毛利润'};
            if(name.indexOf('净利润率')>=0||name==='净利率') return {tip:'净利承压，核对费用、减值与一次性损益',stmt:'is',stmtLabel:'利润表',focus:'净利润／期间费用'};
            if(name==='资产负债率') return {tip:'杠杆偏高，核对有息负债与资产水分',stmt:'bs',stmtLabel:'资产负债表',focus:'负债合计／资产总计'};
            if(name.indexOf('经营现金流')>=0) return {tip:'利润与现金背离，核对应收与经营现金流',stmt:'cf',stmtLabel:'现金流量表',focus:'经营活动现金流量净额'};
            if(name==='ROE') return {tip:'股东回报偏低，结合净利与权益变动核对',stmt:'bs',stmtLabel:'资产负债表',focus:'所有者权益／净利润'};
            if(name.indexOf('应收')>=0) return {tip:'应收增速异常，核对账龄与收入确认',stmt:'bs',stmtLabel:'资产负债表',focus:'应收账款'};
            if(name.indexOf('存货')>=0) return {tip:'存货堆积风险，核对库龄与成本结转',stmt:'bs',stmtLabel:'资产负债表',focus:'存货'};
            return {tip:'触及机构预警线，建议对照配置公式核对三表',stmt:'is',stmtLabel:'利润表',focus:''};
          };
          var _saComputeInd=function(ind){
            if(!_saCur) return null;
            var name=ind.name||'';
            var desc=ind.description||'';
            var thr=String(ind.threshold||'').trim();
            var hint=_saHint(name);
            var gm=_saPct(_saCur.grossProfit,_saCur.revenue);
            var gmP=_saPrev?_saPct(_saPrev.grossProfit,_saPrev.revenue):null;
            var nm=_saPct(_saCur.netProfit,_saCur.revenue);
            var nmP=_saPrev?_saPct(_saPrev.netProfit,_saPrev.revenue):null;
            var lev=_saPct(_saCur.totalLiab,_saCur.totalAssets);
            var levP=_saPrev?_saPct(_saPrev.totalLiab,_saPrev.totalAssets):null;
            var revCur=_saCur.revenue!=null?Number(_saCur.revenue):null;
            var revPrev=_saPrev&&_saPrev.revenue!=null?Number(_saPrev.revenue):null;
            var revG=(revCur!=null&&revPrev)?((revCur-revPrev)/revPrev*100):null;
            var ocf=_saCur.operatingCF!=null&&_saCur.netProfit?Number(_saCur.operatingCF)/Number(_saCur.netProfit):null;
            var ocfP=_saPrev&&_saPrev.operatingCF!=null&&_saPrev.netProfit?Number(_saPrev.operatingCF)/Number(_saPrev.netProfit):null;
            var roe=_saPct(_saCur.netProfit,_saCur.equity);
            var roeP=_saPrev?_saPct(_saPrev.netProfit,_saPrev.equity):null;
            var base={id:ind.id,name:name,formula:desc,thresh:thr+' · '+_saDirLabel(ind.direction),tip:hint.tip,stmt:hint.stmt,stmtLabel:hint.stmtLabel,focus:hint.focus};
            if(name.indexOf('营收')>=0&&name.indexOf('增速')>=0){
              return Object.assign(base,{cur:_saFmtPct(revG,true),prev:'—',chg:_saFmtPct(revG,true),warn:_saHitThresh(revG,thr),val:revG,kind:'growth'});
            }
            if(name==='毛利率'){
              return Object.assign(base,{cur:_saFmtPct(gm),prev:_saFmtPct(gmP),chg:_saFmtPp(_saChg(gm,gmP)),warn:_saHitThresh(gm,thr),val:gm,kind:'level'});
            }
            if(name.indexOf('净利润率')>=0||name==='净利率'){
              return Object.assign(base,{cur:_saFmtPct(nm),prev:_saFmtPct(nmP),chg:_saFmtPp(_saChg(nm,nmP)),warn:_saHitThresh(nm,thr),val:nm,kind:'level'});
            }
            if(name==='资产负债率'){
              return Object.assign(base,{cur:_saFmtPct(lev),prev:_saFmtPct(levP),chg:_saFmtPp(_saChg(lev,levP)),warn:_saHitThresh(lev,thr),val:lev,kind:'level'});
            }
            if(name.indexOf('经营现金流')>=0){
              return Object.assign(base,{cur:_saFmtNum(ocf),prev:_saFmtNum(ocfP),chg:_saFmtNum(_saChg(ocf,ocfP)),warn:_saHitThresh(ocf,thr),val:ocf,kind:'level'});
            }
            if(name==='ROE'){
              return Object.assign(base,{cur:_saFmtPct(roe),prev:_saFmtPct(roeP),chg:_saFmtPp(_saChg(roe,roeP)),warn:_saHitThresh(roe,thr),val:roe,kind:'level'});
            }
            return Object.assign(base,{cur:'—',prev:'—',chg:'—',warn:false,val:null,kind:'na',na:true,tip:'缺科目暂无法计算，补齐对应报表字段后自动出数'});
          };
          var _saRows=[];
          if(_saCur){
            _saRows=_saIndList.map(_saComputeInd).filter(Boolean);
            _saRows.sort(function(a,b){
              var aw=a.warn?0:(a.na?2:1), bw=b.warn?0:(b.na?2:1);
              return aw-bw;
            });
          }
          var _saWarnRows=_saRows.filter(function(r){return r.warn;});
          var _saOtherRows=_saRows.filter(function(r){return !r.warn;});
          var _saWarnN=_saWarnRows.length;
          var _saModeLabel=saCompare==='qoq'?'环比':'同比';
          var buildSubjectAnalysis=function(){
            if(!_saDone.length) return '<div class="po-empty">确认写入财报后自动计算</div>';
            if(!_saCur) return '<div class="po-empty">请选择本期期间</div>';
            if(!_saIndList.length) return '<div class="po-empty">本期无可分析指标（启用指标集中尚无带预警的模板）</div>';
            var periodOpts=_saDone.map(function(x){
              return '<option value="'+esc(x.id)+'"'+(_saCur.id===x.id?' selected':'')+'>'+esc(x.label)+'</option>';
            }).join('');
            var compareLine=_saPrev
              ? ('对比 <strong>'+esc(_saPrev.label)+'</strong><span class="po-sa-mode-tag">'+_saModeLabel+'</span>')
              : ('<span class="po-sa-missing">无'+_saModeLabel+'对比期间</span>');
            var bar='<div class="po-sa-toolbar">'
              +'<label class="po-sa-period-lab">本期 <select class="po-sa-period" data-act="projSaPeriod" data-arg="'+esc(p.id)+'">'+periodOpts+'</select></label>'
              +'<span class="po-sa-compare-line">'+compareLine+'</span>'
              +'<span class="po-sa-seg">'
              +'<button type="button" class="po-sa-seg-btn'+(saCompare==='yoy'?' active':'')+'" data-act="projSaCompare" data-arg="'+esc(p.id)+'|yoy">同比</button>'
              +'<button type="button" class="po-sa-seg-btn'+(saCompare==='qoq'?' active':'')+'" data-act="projSaCompare" data-arg="'+esc(p.id)+'|qoq">环比</button>'
              +'</span>'
              +'</div>';
            var verdict;
            if(_saWarnN){
              var names=_saWarnRows.slice(0,4).map(function(r){return r.name;}).join('、');
              if(_saWarnN>4) names+=' 等';
              verdict='<div class="po-sa-verdict po-sa-verdict-warn"><strong>'+_saWarnN+' 项需关注</strong><span>'+esc(names)+' · '+esc(_saCur.label)+(_saPrev?' vs '+esc(_saPrev.label):'')+'</span></div>';
            } else {
              verdict='<div class="po-sa-verdict po-sa-verdict-ok"><strong>本期无异动</strong><span>已启用预警均未触发'+(_saOtherRows.filter(function(r){return r.na;}).length?' · 部分指标缺科目未算':'')+'</span></div>';
            }
            var renderCard=function(r){
              var open=saExpand===r.id;
              var jump=r.stmt?'<button type="button" class="po-sa-card-jump" data-act="projFinSubTab" data-arg="'+esc(p.id)+'|'+esc(r.stmt)+'">去'+esc(r.stmtLabel)+(r.focus?'核对 '+esc(r.focus):'')+'</button>':'';
              return '<div class="po-sa-card'+(r.warn?' po-sa-card-warn':'')+(r.na?' po-sa-card-na':'')+'">'
                +'<button type="button" class="po-sa-card-main" data-act="projSaExpand" data-arg="'+esc(p.id)+'|'+esc(r.id)+'">'
                +'<div class="po-sa-card-top"><span class="po-sa-card-name">'+esc(r.name)+'</span>'
                +'<span class="'+(r.na?'po-sa-status-na':(r.warn?'po-sa-status-warn':'po-sa-status-ok'))+'">'+(r.na?'无法计算':(r.warn?'异动':'正常'))+'</span></div>'
                +'<div class="po-sa-card-nums"><span>本期 <b>'+r.cur+'</b></span>'
                +(_saPrev&&!r.na&&r.kind!=='growth'?'<span>对比 <b>'+r.prev+'</b></span>':'')
                +(r.chg!=='—'?'<span>变动 <b>'+r.chg+'</b></span>':'')
                +'</div>'
                +(r.warn||open?'<div class="po-sa-card-tip">'+esc(r.tip)+'</div>':'')
                +'</button>'
                +(open?'<div class="po-sa-card-extra"><div class="po-sa-formula">'+esc(r.formula)+' · 预警 '+esc(r.thresh)
                  +(_saPrev?' · 比对 '+esc(_saCur.label)+' vs '+esc(_saPrev.label)+'（'+_saModeLabel+'）':'')
                  +'</div>'+jump+'</div>':'')
                +'</div>';
            };
            var warnBlock=_saWarnN
              ? '<div class="po-sa-cards">'+_saWarnRows.map(renderCard).join('')+'</div>'
              : '';
            var restN=_saOtherRows.length;
            var allToggle=restN
              ? ('<div class="po-sa-all-bar"><button type="button" class="po-sa-all-btn" data-act="projSaShowAll" data-arg="'+esc(p.id)+'|'+(saShowAll?'0':'1')+'">'
                +(saShowAll?'收起全部指标':'查看全部指标（'+restN+'）')+'</button></div>')
              : '';
            var restBlock=(saShowAll&&restN)
              ? ('<div class="po-sa-cards po-sa-cards-rest">'+_saOtherRows.map(renderCard).join('')+'</div>')
              : '';
            return bar+verdict+warnBlock+allToggle+restBlock;
          };
          var finSubTabDefs=[{key:'is',label:'利润表'},{key:'bs',label:'资产负债表'},{key:'cf',label:'现金流量表'},{key:'note',label:'附注'},{key:'analysis',label:'科目分析'}];
          if(isLt){
            finSubTabDefs=finSubTabDefs.filter(function(t){
              if(t.key==='analysis') return _ltHasIS&&_ltHasBS;
              if(t.key==='is') return _ltHasIS;
              if(t.key==='bs') return _ltHasBS;
              if(t.key==='cf') return _ltHasCF;
              return !!(p.finNotes&&p.finNotes.length);
            });
            if(!finSubTabDefs.some(function(t){return t.key===finSubTab;})) finSubTab=(finSubTabDefs[0]&&finSubTabDefs[0].key)||'is';
          }
          var controlsBar='<div class="po-fin-data-bar">'
            +'<div class="po-fin-data-subtabs">'
            +finSubTabDefs.map(function(t){
              var dot=(t.key==='analysis'&&_saWarnN)?'<span class="po-fin-data-tab-dot" title="有异动"></span>':'';
              return '<button type="button" class="po-fin-data-tab'+(finSubTab===t.key?' po-fin-data-tab-active':'')+'" data-act="projFinSubTab" data-arg="'+esc(p.id)+'|'+t.key+'">'+t.label+dot+'</button>';
            }).join('')
            +'</div>'
            +'<div class="po-fin-data-controls">'
            +(finSubTab!=='analysis'&&_saWarnN?'<button type="button" class="po-sa-jump" data-act="projFinSubTab" data-arg="'+esc(p.id)+'|analysis">'+_saWarnN+' 项异动</button>':'')
            +(finSubTab==='analysis'?'':'<div class="po-fin-data-unit-group">'
            +MONEY_UNIT_DEFS.map(function(u){
              return '<button type="button" class="po-fin-data-unit'+(finUnit===u.key?' po-fin-data-unit-active':'')+'" data-act="projFinUnit" data-arg="'+esc(p.id)+'|'+u.key+'">'+esc(u.label)+'</button>';
            }).join('')
            +'</div>'
            +'<div class="po-fin-data-currency-group">'
            +'<button type="button" class="po-fin-data-currency'+(finCurrency==='rmb'?' po-fin-data-currency-active':'')+'" data-act="projFinCurrency" data-arg="'+esc(p.id)+'|rmb">RMB</button>'
            +'<button type="button" class="po-fin-data-currency'+(finCurrency==='usd'?' po-fin-data-currency-active':'')+'" data-act="projFinCurrency" data-arg="'+esc(p.id)+'|usd">USD</button>'
            +'</div>')
            +'</div>'
            +'</div>';
          var unitHint=finSubTab==='analysis'
            ?'<div class="po-fin-data-unit-hint">口径与阈值＝配置中心启用中的直投指标集；改预警只改配置。缺科目的指标标「无法计算」</div>'
            :'<div class="po-fin-data-unit-hint">金额单位：'+currencyLabel+' '+unitLabel+'（只改展示；入库按元）'+(finCurrency==='usd'?' · USD按1≈7.2RMB':'')+'</div>';
          var tableContent='';
          if(finSubTab==='analysis'){
            tableContent=buildSubjectAnalysis();
          }else if(finSubTab==='is'){
            tableContent=buildFinTable([['revenue','营业收入'],['grossProfit','毛利润'],['netProfit','净利润'],['researchCost','研发费用'],['_grossMargin','毛利率']]);
          }else if(finSubTab==='bs'){
            tableContent=buildFinTable([['totalAssets','资产总计'],['totalLiab','负债合计'],['equity','所有者权益'],['_leverageRatio','资产负债率']]);
          }else if(finSubTab==='cf'){
            tableContent=buildFinTable([['operatingCF','经营活动现金流量净额']]);
          }else{
            var notes=p.finNotes&&p.finNotes.length?p.finNotes:null;
            tableContent=notes?_dataTable(['附注项','说明'],notes.map(function(n){return [n.name||'—',{text:n.detail||'—',wrap:true,title:n.detail||''}];}),'暂无财务附注数据'):'<div class="po-empty">暂无财务附注数据</div>';
          }
          sections.push({id:'project-financial-data',title:finSubTab==='analysis'?'科目分析':'财务数据',noPanel:true,body:controlsBar+unitHint+tableContent});
      }
    } else {
      var _rawMatFolders = p.materialFolders || [];
      var matFolders = _rawMatFolders.map(function(f){ return typeof f==='string'?f:(f&&f.name)||''; }).filter(Boolean);
      function _matFolderName(m) {
        var raw = m && m.folder;
        if (!raw) return '';
        if (typeof raw !== 'string') return (raw && raw.name) || '';
        for (var fi = 0; fi < _rawMatFolders.length; fi++) {
          var fo = _rawMatFolders[fi];
          if (fo && typeof fo === 'object' && fo.id === raw) return fo.name || '';
        }
        return raw;
      }
      function _matRow(m, idx) {
        var cls = m.status==='已归档'?'po-tag-status-done':m.status==='异常'?'po-tag-status-error':'po-tag-status-pending';
        var mFolder = _matFolderName(m);
        var folderSel = matFolders.length
          ? '<select class="po-mat-folder-sel" data-act-folder="'+esc(p.id)+'|'+idx+'" onclick="event.stopPropagation()">'
            + '<option value="">未分类</option>'
            + matFolders.map(function(f){ return '<option value="'+esc(f)+'"'+(mFolder===f?' selected':'')+'>'+esc(f)+'</option>'; }).join('')
            + '</select>'
          : '';
        var st = (m.status && m.status !== '—') ? m.status : '';
        var statusBadge = st
          ? '<span class="po-row-badge '+cls+'">'+esc(st)+'</span>'
          : '';
        return '<div class="po-list-row" data-act="fileView" data-arg="'+esc(m.name)+'">'
          +'<span class="po-row-name">'+esc(m.name)+'</span>'
          +'<span class="po-row-tags">'+tag('po-tag-type-direct',m.type||'材料')+'</span>'
          +'<span class="po-row-meta">最近更新 '+esc(m.date||m.updatedAt||'—')+'</span>'
          +'<span class="po-row-spacer"></span>'
          + folderSel
          + statusBadge
          +'<button class="po-btn po-btn-xs" style="margin-left:8px;color:var(--xb-muted)" data-act="materialDelete" data-arg="'+esc(p.id)+'|'+idx+'" onclick="event.stopPropagation()">删除</button>'
          +'<span style="color:var(--xb-muted);font-size:14px;margin-left:4px">›</span>'
          +'</div>';
      }
      var matBody;
      if (!p.materials || !p.materials.length) {
        matBody = '<div class="po-empty">暂无项目材料，点击"上传材料"添加</div>';
      } else if (!matFolders.length) {
        matBody = '<div class="po-list">'+(p.materials||[]).map(function(m,idx){return _matRow(m,idx);}).join('')+'</div>';
      } else {
        var _groups = {}, _order = matFolders.concat(['__none__']);
        _order.forEach(function(f){ _groups[f] = []; });
        (p.materials||[]).forEach(function(m,idx){
          var fk = _matFolderName(m);
          var f = fk && _groups[fk] ? fk : '__none__';
          _groups[f].push({m:m,idx:idx});
        });
        matBody = _order.filter(function(f){ return f!=='__none__'||_groups['__none__'].length; }).map(function(f){
          var label = f==='__none__' ? '未分类' : f;
          var items = _groups[f];
          return '<div class="po-mat-folder-group">'
            +'<div class="po-mat-folder-h">'+esc(label)+'<span class="po-mat-folder-cnt">&nbsp;('+items.length+')</span></div>'
            +(items.length ? '<div class="po-list">'+items.map(function(x){return _matRow(x.m,x.idx);}).join('')+'</div>' : '<div class="po-empty" style="font-size:12px;padding:8px 12px">空文件夹</div>')
            +'</div>';
        }).join('');
      }
      sections.push({id:'project-materials-files',title:'项目材料',body:matBody,actions:'<button class="po-btn po-btn-sm" data-act="uploadMaterial" data-arg="'+esc(p.id)+'">上传材料</button>'+'<button class="po-btn po-btn-sm" data-act="createMaterialFolder" data-arg="'+esc(p.id)+'" style="margin-left:6px">+ 新建文件夹</button>'});
      sections.push({
        id: 'project-materials-updates',
        title: '更新记录',
        collapsedDefault: true,
        summary: ((p.updates && p.updates.length) ? ('共 ' + p.updates.length + ' 条') : '暂无'),
        body: _updatesListHtml(p.updates, p.lastUpdate, 'p-upd-' + p.id)
      });
    }
    var headerActions=tag(isLt?'po-tag-type-fof':'po-tag-type-direct',isLt?'子基金穿透':'直接投资')
      +'<button class="po-btn po-btn-sm" data-act="projectEdit" data-arg="'+esc(p.id)+'" style="margin-left:8px">编辑</button>'
      +'<button class="po-btn po-btn-sm" data-act="uploadMaterial" data-arg="'+esc(p.id)+'" style="margin-left:8px">上传材料</button>';
    var activeNode = DETAIL_STATE.timeMachineNode[id];
    var inCompare = DETAIL_STATE.timeMachineCompare[id] && activeNode && activeNode !== 'current';
    var shellHtml = inCompare ? (_timeMachineComparePanel(p,id) || _detailShell('project',id,tabs,active,sections)) : _detailShell('project',id,tabs,active,sections);
    return '<div class="po-page">'+toolbar(p.name,headerActions)+'<div class="po-body">'
      +_timeMachineBar(p,id)
      +shellHtml+'</div></div>';
  }

  function pageFundDetailV2(id) {
    var store=window.PE_POST_STORE, fund=store&&store.fund(id);
    if(!fund)return '<div class="po-page">'+toolbar('基金详情')+'<div class="po-body"><div class="po-empty">未找到基金</div></div></div>';
    var portfolio=store.fundPortfolio(id), metrics=store.fundMetrics(id), isExternal=fund.management==='external';
    var tabs=[{key:'overview',label:'概览'},{key:'portfolio',label:isExternal?'底层项目':'投资组合'},{key:'cashflow',label:'出资与回款'},{key:'performance',label:'期间表现'},{key:'materials',label:'材料'}];
    var active=DETAIL_STATE.fundTabs[id]||'overview';
    if(!tabs.some(function(t){return t.key===active;}))active='overview';
    var sections=[];
    var strategyLabel=({direct:'直投',fof:'母基金',mixed:'混合',other:'其他'})[fund.strategy]||fund.type||'—';
    var relsAll=fund.fundRelations||[];
    var rel0=relsAll[0]||{};
    var lpCost=rel0.investmentCost!=null?rel0.investmentCost:rel0.committed;
    var lpNav=rel0.periodEndNav;
    var lpTvpi=rel0.tvpi;
    var lpDpi=rel0.dpi;
    var lpMoic=rel0.moic!=null?rel0.moic:rel0.tvpi;
    function hasParallelStructure(f){
      var pc=f.parallelCommitted, pa=f.parallelCalled;
      var sameC=pc==null||Number(pc)===Number(f.committed||0);
      var sameA=pa==null||Number(pa)===Number(f.called||0);
      return !(sameC&&sameA);
    }
    function mergeUnderlying(){
      var list=[], seen={};
      (fund.underlyingProjects||[]).forEach(function(u){
        var archived=u.projectId?store.project(u.projectId):null;
        if(!archived)return; /* 写入闸门保证有穿透档案；无档案不进子基金列表 */
        seen[archived.id]=true;
        list.push({
          name:u.name||archived.name||'未命名',
          projectId:archived.id,
          firstInvestDate:u.firstInvestDate||archived.investDate||'',
          cost:u.cost!=null?u.cost:(archived.investAmount||0),
          value:u.fairValue!=null?u.fairValue:(archived.holding?archived.holding.totalValue:0),
          exitStatus:u.exitStatus||archived.exitStatus||''
        });
      });
      (portfolio.lookthroughProjects||[]).forEach(function(p){
        if(seen[p.id])return;
        list.push({
          name:p.name,
          projectId:p.id,
          firstInvestDate:p.investDate||p.firstInvestDate||'',
          cost:p.investAmount||0,
          value:p.holding&&p.holding.totalValue||0,
          exitStatus:p.exitStatus||''
        });
      });
      return list;
    }
    function underlyingListHtml(){
      var list=mergeUnderlying();
      if(!list.length)return '<div class="po-empty">暂无数据</div>';
      return '<div class="po-table-shell"><table class="po-table"><thead><tr>'
        + '<th>项目</th><th>首次投资</th><th class="po-cell-num">子基金对本金</th><th class="po-cell-num">当前价值</th><th>退出状态</th>'
        + '</tr></thead><tbody>'
        + list.map(function(u){
          return '<tr><td><button type="button" class="po-table-link" data-nav="project/'+esc(u.projectId)+'">'+esc(u.name)+'</button></td>'
            + '<td>'+esc(_tmYm(u.firstInvestDate))+'</td>'
            + '<td class="po-cell-num">'+fmtMoney(u.cost)+'</td>'
            + '<td class="po-cell-num">'+fmtMoney(u.value)+'</td>'
            + '<td>'+esc(u.exitStatus||'—')+'</td></tr>';
        }).join('')
        + '</tbody></table></div>';
    }
    function projectList(list,lookthrough){
      if(!list.length)return '<div class="po-empty">暂无数据</div>';
      var costLabel=lookthrough?'子基金对本金':'投资成本';
      var dateTh=lookthrough?'':'<th>首次投资</th>';
      return '<div class="po-table-shell"><table class="po-table"><thead><tr>'
        + '<th>项目</th>'+dateTh+'<th class="po-cell-num">'+costLabel+'</th><th class="po-cell-num">当前价值</th>'
        + '</tr></thead><tbody>'
        + list.map(function(p){
          var dateTd=lookthrough?'':'<td>'+esc(_tmYm(p.investDate||p.firstInvestDate))+'</td>';
          return '<tr><td><button type="button" class="po-table-link" data-nav="project/'+esc(p.id)+'">'+esc(p.name)+'</button></td>'
            + dateTd
            + '<td class="po-cell-num">'+fmtMoney(p.investAmount||0)+'</td>'
            + '<td class="po-cell-num">'+fmtMoney(p.holding&&p.holding.totalValue||0)+'</td></tr>';
        }).join('')
        + '</tbody></table></div>';
    }
    function investedFundsListHtml(){
      var funds=portfolio.investedFunds||[];
      if(!funds.length)return '<div class="po-empty">暂无所投子基金</div>';
      return '<div class="po-table-shell"><table class="po-table"><thead><tr>'
        + '<th>基金</th><th>首次出资</th><th class="po-cell-num">投资成本</th><th class="po-cell-num">期末账户余额</th>'
        + '</tr></thead><tbody>'
        + funds.map(function(f){
          var r=(f.fundRelations||[]).find(function(x){return x.fundId===id;})||{};
          return '<tr><td><button type="button" class="po-table-link" data-nav="fund/'+esc(f.id)+'">'+esc(f.name)+'</button></td>'
            + '<td>'+esc(_tmYm(r.firstInvestDate))+'</td>'
            + '<td class="po-cell-num">'+fmtMoney(r.investmentCost||0)+'</td>'
            + '<td class="po-cell-num">'+fmtMoney(r.periodEndNav||0)+'</td></tr>';
        }).join('')
        + '</tbody></table></div>';
    }
    var comboCount=isExternal?mergeUnderlying().length:portfolio.directProjects.length+portfolio.investedFunds.length;
    if(active==='overview'){
      var profileRows=[
        ['基金类别',isExternal?'所投子基金':'本机构管理基金',null],
        ['基金简称',fund.name,'name'],
        ['基金全称',fund.fullName||fund.name,'fullName'],
        ['基金编号',fund.code,'code'],
        ['管理人',fund.manager,'manager']
      ];
      if(isExternal){
        profileRows=profileRows.concat([
          ['基金注册地',fund.registeredPlace||fund.city||'—','registeredPlace'],
          ['成立日期',fund.established,'established',/^\d{4}-\d{2}/.test(String(fund.established||''))?'date':'year'],
          ['投资期',fund.investPeriod||'—','investPeriod'],
          ['投资期到期日',fund.investPeriodEnd||'','investPeriodEnd','date'],
          ['基金存续期',fund.duration||fund.fundTerm||'—','duration'],
          ['投资方向',fund.direction||fund.investDirection||'—','direction'],
          ['主要投资阶段',fund.stageFocus||fund.mainStage||'—','stageFocus'],
          ['团队核心成员',fund.team||fund.coreTeam||'—','team'],
          ['投资策略',strategyLabel,null],
          ['运作状态',fund.status,'status','select:存续期|投资期|退出期|已清算'],
          ['认缴（本基金主体）',fund.committed||0,'committed','money'],
          ['实缴（本基金主体）',fund.called||0,'called','money']
        ]);
        if(hasParallelStructure(fund)){
          profileRows.push(['认缴（基金合计）',fund.parallelCommitted||fund.committed||0,'parallelCommitted','money']);
          profileRows.push(['实缴（基金合计）',fund.parallelCalled||fund.called||0,'parallelCalled','money']);
        }
        profileRows=profileRows.concat([
          ['总退出金额',fund.totalExitAmount||0,'totalExitAmount','money'],
          ['投资比例',(function(){var r=fund.investRatio||rel0.commitmentRatio; if(r==null||r===''||r==='—')return ''; var n=Number(String(r).replace(/%/g,'')); return isNaN(n)?'':n;})(),'investRatio','percent'],
          ['投资进度',(function(){var r=fund.investProgress; if(r==null||r===''||r==='—')return ''; var n=Number(String(r).replace(/%/g,'')); return isNaN(n)?'':n;})(),'investProgress','percent'],
          ['报告截止日',fund.reportEndDate||'','reportEndDate','date'],
          ['基金规模',fund.fundSize||fund.committed||0,'fundSize','money'],
          ['数据期间',metrics.period,null]
        ]);
      } else {
        profileRows=profileRows.concat([
          ['成立日期',fund.established,'established',/^\d{4}-\d{2}/.test(String(fund.established||''))?'date':'year'],
          ['投资策略',strategyLabel,null],
          ['运作状态',fund.status,'status','select:存续期|投资期|退出期|已清算'],
          ['认缴（本基金主体）',fund.committed||0,'committed','money'],
          ['实缴（本基金主体）',fund.called||0,'called','money'],
          ['数据期间',metrics.period,null]
        ]);
      }
      sections.push({id:'fund-overview-profile',title:'基金概况',body:_editableKvGrid(profileRows,'fund',id)});
      if(isExternal){
        sections.push({id:'fund-overview-lp',title:'本机构出资口径',body:_kvGrid([
          ['本机构认缴金额',fmtMoney(rel0.committed)],
          ['本机构认缴比例',rel0.commitmentRatio||'—'],
          ['本机构实缴金额',fmtMoney(rel0.called)],
          ['本机构累计分配',fmtMoney(rel0.distributed)],
          ['资本账户期末余额',fmtMoney(rel0.periodEndNav)],
          ['本机构 TVPI',lpTvpi!=null?lpTvpi+'x':'—'],
          ['本机构 DPI',lpDpi!=null?lpDpi+'x':'—'],
          ['MOIC（GP 披露）',fund.moic!=null?fund.moic+'x':'—'],
          ['TVPI（GP 披露）',fund.tvpi!=null?fund.tvpi+'x':'—'],
          ['DPI（GP 披露）',fund.dpi!=null?fund.dpi+'x':'—']
        ])});
      } else {
        sections.push({id:'fund-overview-performance',title:'最新表现',body:_editableKvGrid([
          ['投资成本',metrics.investmentCost||0,null,'money'],
          ['当前价值',metrics.totalValue||0,null,'money'],
          ['MOIC',fund.moic!=null?fund.moic:null,'moic','multiple'],
          ['TVPI',fund.tvpi!=null?fund.tvpi:null,'tvpi','multiple'],
          ['DPI',fund.dpi!=null?fund.dpi:null,'dpi','multiple'],
          ['直投项目数',String(portfolio.directProjects.length),null],
          ['所投子基金数',String(portfolio.investedFunds.length),null]
        ],'fund',id)});
      }
    } else if(active==='portfolio'){
      if(isExternal){
        sections.push({id:'fund-portfolio-underlying',title:'底层穿透项目',body:underlyingListHtml()});
      } else {
        sections.push({id:'fund-portfolio-direct',title:'直接投资',body:projectList(portfolio.directProjects,false)});
        sections.push({id:'fund-portfolio-funds',title:'所投子基金',body:investedFundsListHtml()});
      }
    } else if(active==='cashflow'){
      var rels=isExternal?relsAll:portfolio.investedFunds.reduce(function(a,f){(f.fundRelations||[]).forEach(function(r){if(r.fundId===id)a.push(Object.assign({targetName:f.name},r));});return a;},[]);
      sections.push({id:'fund-cashflow-accounts',title:'出资账户',body:rels.length?'<div class="po-table-shell"><table class="po-table"><thead><tr><th>'+(isExternal?'出资基金':'所投基金')+'</th><th class="po-cell-num">认缴</th><th class="po-cell-num">实缴</th><th class="po-cell-num">累计分配</th><th class="po-cell-num">期末账户余额</th></tr></thead><tbody>'+rels.map(function(r){
        var nameCell;
        if(isExternal){
          var parent=store.fund(r.fundId);
          nameCell=parent?'<button type="button" class="po-table-link" data-nav="fund/'+esc(parent.id)+'">'+esc(parent.name)+'</button>':esc('未关联');
        } else {
          nameCell=esc(r.targetName);
        }
        return '<tr><td>'+nameCell+'</td><td class="po-cell-num">'+fmtMoney(r.committed||0)+'</td><td class="po-cell-num">'+fmtMoney(r.called||0)+'</td><td class="po-cell-num">'+fmtMoney(r.distributed||0)+'</td><td class="po-cell-num">'+fmtMoney(r.periodEndNav||0)+'</td></tr>';
      }).join('')+'</tbody></table></div>':'<div class="po-empty">暂无出资账户</div>'});
      sections.push({id:'fund-cashflow-distributions',title:'分配流水',body:(fund.distributions&&fund.distributions.length)
        ?'<div class="po-table-shell"><table class="po-table"><thead><tr><th>分配日期</th><th class="po-cell-num">到账金额</th><th class="po-cell-num">成本收回</th><th class="po-cell-num">收益分配</th><th class="po-cell-num">回收资金-基金</th><th class="po-cell-num">回收资金-本机构</th><th class="po-cell-num">项目成本-基金</th><th class="po-cell-num">项目成本-本机构</th><th>分配比例</th><th>分配性质</th><th>来源项目</th><th>备注</th></tr></thead><tbody>'
          +fund.distributions.map(function(r){
            var ratio=r.allocRatio!=null?r.allocRatio:(r.fundRecovered?((Number(r.amount||0)/Number(r.fundRecovered))*100).toFixed(2)+'%':'—');
            return '<tr><td>'+esc(r.date||'—')+'</td>'
              +'<td class="po-cell-num">'+fmtMoney(r.amount||0)+'</td>'
              +'<td class="po-cell-num">'+fmtMoney(r.costRecovered!=null?r.costRecovered:0)+'</td>'
              +'<td class="po-cell-num">'+fmtMoney(r.gainDistributed!=null?r.gainDistributed:0)+'</td>'
              +'<td class="po-cell-num">'+fmtMoney(r.fundRecovered!=null?r.fundRecovered:(r.amount||0))+'</td>'
              +'<td class="po-cell-num">'+fmtMoney(r.lpRecovered!=null?r.lpRecovered:(r.amount||0))+'</td>'
              +'<td class="po-cell-num">'+fmtMoney(r.projectCostFund!=null?r.projectCostFund:(r.costRecovered||0))+'</td>'
              +'<td class="po-cell-num">'+fmtMoney(r.projectCostLp!=null?r.projectCostLp:(r.costRecovered||0))+'</td>'
              +'<td>'+esc(String(ratio))+'</td>'
              +'<td>'+esc(r.nature||r.distType||'—')+'</td>'
              +'<td>'+esc(r.exitCompany||'—')+'</td>'
              +'<td>'+esc(r.note||r.fromFund||'—')+'</td></tr>';
          }).join('')
          +'</tbody></table></div>'
        :'<div class="po-empty">暂无可展示的逐笔分配；解析分配通知后按日期列示</div>'});
    } else if(active==='performance'){
      if(isExternal){
        sections.push({id:'fund-performance-current',title:'当期表现',body:_kvGrid([
          ['报告截止日',rel0.period||metrics.period||'—'],
          ['已投项目数',String(fund.investedCount!=null?fund.investedCount:comboCount)],
          ['投资金额（本基金主体）',fmtMoney(fund.investAmount!=null?fund.investAmount:lpCost)],
          ['完全退出项目数量',String(fund.fullExitCount!=null?fund.fullExitCount:'—')],
          ['部分退出项目数量',String(fund.partialExitCount!=null?fund.partialExitCount:'—')],
          ['总退出金额',fmtMoney(fund.totalExitAmount||0)]
        ])});
        sections.push({id:'fund-performance-history',title:'历史期间',body:_periodHistoryTable(fund.periods)});
      } else {
        sections.push({id:'fund-performance-current',title:'当期表现',body:_editableKvGrid([['报告截止日',metrics.period,null],['投资成本',metrics.investmentCost||0,null,'money'],['当前价值',metrics.totalValue||0,null,'money'],['MOIC',fund.moic!=null?fund.moic:null,'moic','multiple'],['TVPI',fund.tvpi!=null?fund.tvpi:null,'tvpi','multiple'],['DPI',fund.dpi!=null?fund.dpi:null,'dpi','multiple']],'fund',id)});
        sections.push({id:'fund-performance-history',title:'历史期间',body:_periodHistoryTable(fund.periods)});
      }
    } else {
      /* 基金材料 Tab：与项目材料一致（文件夹 + 上传 + 删除） */
      var _rawFMatFolders = fund.materialFolders || [];
      var fMatFolders = _rawFMatFolders.map(function(f){ return typeof f==='string'?f:(f&&f.name)||''; }).filter(Boolean);
      var _fMatFolderName = function(m) {
        var raw = m && m.folder;
        if (!raw) return '';
        if (typeof raw !== 'string') return (raw && raw.name) || '';
        for (var fi = 0; fi < _rawFMatFolders.length; fi++) {
          var fo = _rawFMatFolders[fi];
          if (fo && typeof fo === 'object' && fo.id === raw) return fo.name || '';
        }
        return raw;
      };
      var _fMatRow = function(m, idx) {
        var cls = m.status==='已归档'?'po-tag-status-done':m.status==='异常'?'po-tag-status-error':'po-tag-status-pending';
        var mFolder = _fMatFolderName(m);
        var folderSel = fMatFolders.length
          ? '<select class="po-mat-folder-sel" data-act-folder="'+esc(fund.id)+'|'+idx+'" onclick="event.stopPropagation()">'
            +'<option value="">未分类</option>'
            +fMatFolders.map(function(f){return '<option value="'+esc(f)+'"'+(mFolder===f?' selected':'')+'>'+esc(f)+'</option>';}).join('')
            +'</select>'
          : '';
        var st = (m.status && m.status !== '—') ? m.status : '';
        var statusBadge = st
          ? '<span class="po-row-badge '+cls+'">'+esc(st)+'</span>'
          : '';
        return '<div class="po-list-row" data-act="fileView" data-arg="'+esc(m.name)+'">'
          +'<span class="po-row-name">'+esc(m.name)+'</span>'
          +'<span class="po-row-tags">'+tag('po-tag-type-fof',m.type||'材料')+'</span>'
          +'<span class="po-row-meta">最近更新 '+esc(m.date||m.updatedAt||'—')+'</span>'
          +'<span class="po-row-spacer"></span>'
          +folderSel
          +statusBadge
          +'<button class="po-btn po-btn-xs" style="margin-left:8px;color:var(--xb-muted)" data-act="materialDelete" data-arg="'+esc(fund.id)+'|'+idx+'" onclick="event.stopPropagation()">删除</button>'
          +'<span style="color:var(--xb-muted);font-size:14px;margin-left:4px">›</span>'
          +'</div>';
      };
      var fMatBody;
      if (!fund.materials || !fund.materials.length) {
        fMatBody = '<div class="po-empty">暂无基金材料，点击"上传材料"添加</div>';
      } else if (!fMatFolders.length) {
        fMatBody = '<div class="po-list">'+(fund.materials||[]).map(function(m,idx){return _fMatRow(m,idx);}).join('')+'</div>';
      } else {
        var _fGroups = {}, _fOrder = fMatFolders.concat(['__none__']);
        _fOrder.forEach(function(f){ _fGroups[f] = []; });
        (fund.materials||[]).forEach(function(m,idx){
          var fk = _fMatFolderName(m);
          var key = fk && _fGroups[fk] ? fk : '__none__';
          _fGroups[key].push({m:m,idx:idx});
        });
        fMatBody = _fOrder.filter(function(f){ return f!=='__none__'||_fGroups['__none__'].length; }).map(function(f){
          var label = f==='__none__' ? '未分类' : f;
          var items = _fGroups[f];
          return '<div class="po-mat-folder-group">'
            +'<div class="po-mat-folder-h">'+esc(label)+'<span class="po-mat-folder-cnt">&nbsp;('+items.length+')</span></div>'
            +(items.length ? '<div class="po-list">'+items.map(function(x){return _fMatRow(x.m,x.idx);}).join('')+'</div>' : '<div class="po-empty" style="font-size:12px;padding:8px 12px">空文件夹</div>')
            +'</div>';
        }).join('');
      }
      sections.push({id:'fund-materials-files',title:'基金材料',body:fMatBody,actions:'<button class="po-btn po-btn-sm" data-act="uploadMaterial" data-arg="'+esc(fund.id)+'">上传材料</button>'+'<button class="po-btn po-btn-sm" data-act="createMaterialFolder" data-arg="'+esc(fund.id)+'" style="margin-left:6px">+ 新建文件夹</button>'});
      sections.push({
        id: 'fund-materials-updates',
        title: '更新记录',
        collapsedDefault: true,
        summary: ((fund.updates && fund.updates.length) ? ('共 ' + fund.updates.length + ' 条') : '暂无'),
        body: _updatesListHtml(fund.updates, fund.lastUpdate, 'f-upd-' + fund.id)
      });
    }
    var fundActions=tag('po-tag-type-fof',isExternal?'所投子基金':'本机构管理基金')
      +'<button class="po-btn po-btn-sm" data-act="fundEdit" data-arg="'+esc(fund.id)+'" style="margin-left:8px">编辑</button>'
      +'<button class="po-btn po-btn-sm" data-act="uploadMaterial" data-arg="'+esc(fund.id)+'" style="margin-left:8px">上传材料</button>';
    return '<div class="po-page">'+toolbar(fund.name,fundActions)+'<div class="po-body">'
      +_detailShell('fund',id,tabs,active,sections)+'</div></div>';
  }

  function _cssToken(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }
  function _snapPalette() {
    return [
      _cssToken('--po-ink', '#2c2c2e'),
      _cssToken('--po-gray', '#656a71'),
      _cssToken('--po-line-2', '#d0d0d5'),
      _cssToken('--po-ink-2', '#3d3d40'),
      _cssToken('--po-gray-2', '#8a8f98')
    ];
  }
  function _ndLabelFill(color) {
    var line = _cssToken('--po-line-2', '#d0d0d5');
    var gray2 = _cssToken('--po-gray-2', '#8a8f98');
    return (color === line || color === gray2) ? _cssToken('--po-ink', '#2c2c2e') : _cssToken('--po-on-ink', '#fbfbfa');
  }
  function _snapExitLabel(p) {
    var s = String((p && p.exitStatus) || '');
    if (!s || s === '持有中' || s === '在管') return '在管';
    if (s.indexOf('部分') >= 0) return '部分退出';
    if (s.indexOf('完全') >= 0) return '完全退出';
    if (s.indexOf('核销') >= 0 || /writeoff/i.test(s)) return '核销减值';
    if (s.indexOf('退出') >= 0) return '完全退出';
    return s;
  }
  function _snapYear(p) {
    var m = String((p && p.investDate) || '').match(/(\d{4})/);
    return m ? (m[1] + '年') : '未分类';
  }
  function _snapRegion(p) { return (p && (p.province || p.city)) || '未分类'; }
  function _snapTypeLabel(p) { return (p && p.type) === 'lookthrough' ? '子基金穿透' : '直接投资'; }
  function _snapGroupBy(list, keyFn) {
    var g = {};
    (list || []).forEach(function (p) {
      var k = keyFn(p) || '未分类';
      (g[k] = g[k] || []).push(p);
    });
    return g;
  }
  function _snapConic(parts) {
    var acc = 0, segs = [];
    (parts || []).forEach(function (p) {
      if (!(p.pct > 0)) return;
      var from = acc;
      acc += p.pct;
      if (acc > 100) acc = 100;
      segs.push(p.color + ' ' + from.toFixed(2) + '% ' + acc.toFixed(2) + '%');
    });
    var track = _cssToken('--po-line', '#e2e2e6');
    if (!segs.length) return track + ' 0% 100%';
    if (acc < 99.5) segs.push(track + ' ' + acc.toFixed(2) + '% 100%');
    return segs.join(', ');
  }
  function _snapSlices(groups, costFn, valFn) {
    var slices = Object.keys(groups || {}).filter(function (k) { return k !== '未分类'; }).map(function (k) {
      var items = groups[k];
      return {
        key: k,
        n: items.length,
        inv: items.reduce(function (s, p) { return s + costFn(p); }, 0),
        nav: items.reduce(function (s, p) { return s + valFn(p); }, 0)
      };
    }).filter(function (s) { return s.n > 0 && (s.inv > 0 || s.nav > 0); }).sort(function (a, b) { return b.inv - a.inv; });
    var pal = _snapPalette();
    slices.forEach(function (s, i) { s.color = pal[i % pal.length]; });
    return slices;
  }
  function _ndPolar(cx, cy, r, deg) {
    var rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function _ndRingSlice(cx, cy, r0, r1, a0, a1) {
    var span = a1 - a0;
    if (span <= 0.4) return '';
    if (span >= 359.5) {
      return 'M ' + (cx + r1) + ' ' + cy + ' A ' + r1 + ' ' + r1 + ' 0 1 1 ' + (cx - r1) + ' ' + cy
        + ' A ' + r1 + ' ' + r1 + ' 0 1 1 ' + (cx + r1) + ' ' + cy
        + ' M ' + (cx + r0) + ' ' + cy + ' A ' + r0 + ' ' + r0 + ' 0 1 0 ' + (cx - r0) + ' ' + cy
        + ' A ' + r0 + ' ' + r0 + ' 0 1 0 ' + (cx + r0) + ' ' + cy + ' Z';
    }
    var p0 = _ndPolar(cx, cy, r1, a0), p1 = _ndPolar(cx, cy, r1, a1);
    var p2 = _ndPolar(cx, cy, r0, a1), p3 = _ndPolar(cx, cy, r0, a0);
    var large = span > 180 ? 1 : 0;
    return 'M ' + p0.x.toFixed(2) + ' ' + p0.y.toFixed(2)
      + ' A ' + r1 + ' ' + r1 + ' 0 ' + large + ' 1 ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2)
      + ' L ' + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2)
      + ' A ' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + p3.x.toFixed(2) + ' ' + p3.y.toFixed(2) + ' Z';
  }
  function _nestedDonutHtml(slices, centerN) {
    var invSum = slices.reduce(function (s, x) { return s + x.inv; }, 0) || 1;
    var navSum = slices.reduce(function (s, x) { return s + x.nav; }, 0) || 1;
    var cx = 84, cy = 84, aInv = 0, aNav = 0, segs = '', labels = '';
    slices.forEach(function (x) {
      var invDeg = x.inv / invSum * 360;
      var navDeg = x.nav / navSum * 360;
      var ip = (x.inv / invSum * 100).toFixed(1);
      var np = (x.nav / navSum * 100).toFixed(1);
      var meta = ' data-k="' + esc(x.key) + '" data-inv="' + esc(fmtMoney(x.inv)) + '" data-nav="' + esc(fmtMoney(x.nav)) + '" data-n="' + x.n + '" data-ip="' + ip + '" data-np="' + np + '"';
      var outD = _ndRingSlice(cx, cy, 64, 84, aNav, aNav + navDeg);
      var inD = _ndRingSlice(cx, cy, 30, 50, aInv, aInv + invDeg);
      if (outD) segs += '<path class="po-nd-seg" fill-rule="evenodd" data-ring="out"' + meta + ' fill="' + x.color + '" d="' + outD + '"></path>';
      if (inD) segs += '<path class="po-nd-seg" fill-rule="evenodd" data-ring="in"' + meta + ' fill="' + x.color + '" d="' + inD + '"></path>';
      var lf = _ndLabelFill(x.color);
      if (invDeg >= 24) {
        var pin = _ndPolar(cx, cy, 40, aInv + invDeg / 2);
        labels += '<text class="po-nd-lbl" x="' + pin.x.toFixed(1) + '" y="' + pin.y.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" fill="' + lf + '">' + Math.round(x.inv / invSum * 100) + '%</text>';
      }
      if (navDeg >= 24) {
        var pout = _ndPolar(cx, cy, 74, aNav + navDeg / 2);
        labels += '<text class="po-nd-lbl" x="' + pout.x.toFixed(1) + '" y="' + pout.y.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" fill="' + lf + '">' + Math.round(x.nav / navSum * 100) + '%</text>';
      }
      aInv += invDeg;
      aNav += navDeg;
    });
    var legend = slices.map(function (x) {
      var ip = (x.inv / invSum * 100).toFixed(0);
      var np = (x.nav / navSum * 100).toFixed(0);
      return '<div class="po-donut-legend-row" data-k="' + esc(x.key) + '" data-inv="' + esc(fmtMoney(x.inv)) + '" data-nav="' + esc(fmtMoney(x.nav)) + '" data-n="' + x.n + '" data-ip="' + (x.inv / invSum * 100).toFixed(1) + '" data-np="' + (x.nav / navSum * 100).toFixed(1) + '"><span class="po-nd-swatch" style="background:' + x.color + '"></span><span>' + esc(x.key) + '</span><span class="po-nd-pct">内' + ip + '% · 外' + np + '%</span></div>';
    }).join('');
    return '<div class="po-nd-block" data-nd><div class="po-nd">'
      + '<svg viewBox="0 0 168 168" width="168" height="168" aria-label="内外双环，可悬停查看">'
      + '<circle cx="84" cy="84" r="57" fill="none" stroke="' + _cssToken('--po-page', '#f5f5f7') + '" stroke-width="52"></circle>'
      + segs + labels
      + '</svg>'
      + '<div class="po-nd-hole"><span class="po-nd-n">' + centerN + '</span><span class="po-nd-sub">项目</span></div>'
      + '<div class="po-nd-tip" data-nd-tip hidden></div></div>'
      + '<div class="po-nd-side"><div class="po-nd-cap">内圈投资金额 · 外圈持股价值 · 悬停看明细</div><div class="po-donut-legend">' + (legend || '<div class="po-donut-legend-row">暂无切片</div>') + '</div></div></div>';
  }
  function _bindSnapDonuts(root) {
    if (!root) return;
    root.querySelectorAll('[data-nd]').forEach(function (block) {
      var tip = block.querySelector('[data-nd-tip]');
      if (!tip) return;
      function hide() {
        block.classList.remove('is-hover');
        tip.hidden = true;
        block.querySelectorAll('.is-on').forEach(function (n) { n.classList.remove('is-on'); });
      }
      function show(el, ev) {
        var k = el.getAttribute('data-k');
        if (!k) return;
        block.classList.add('is-hover');
        block.querySelectorAll('[data-k]').forEach(function (n) {
          n.classList.toggle('is-on', n.getAttribute('data-k') === k);
        });
        var ring = el.getAttribute('data-ring');
        var ringLine = ring === 'in' ? '内圈 · 投资金额' : (ring === 'out' ? '外圈 · 持股价值' : '内圈金额 / 外圈价值');
        tip.innerHTML = '<div class="po-nd-tip-k">' + esc(k) + '</div><div class="po-nd-tip-sub">' + esc(ringLine) + '</div>'
          + '<div>投资金额 ' + esc(el.getAttribute('data-inv') || '—') + '（' + esc(el.getAttribute('data-ip') || '0') + '%）</div>'
          + '<div>持股价值 ' + esc(el.getAttribute('data-nav') || '—') + '（' + esc(el.getAttribute('data-np') || '0') + '%）</div>'
          + '<div>' + esc(el.getAttribute('data-n') || '0') + ' 个项目</div>';
        tip.hidden = false;
        var x = ev.clientX + 14, y = ev.clientY + 14;
        if (x + 228 > window.innerWidth) x = ev.clientX - 228;
        if (y + 128 > window.innerHeight) y = ev.clientY - 128;
        tip.style.left = x + 'px';
        tip.style.top = y + 'px';
      }
      block.querySelectorAll('.po-nd-seg, .po-donut-legend-row').forEach(function (el) {
        el.addEventListener('mouseenter', function (e) { show(el, e); });
        el.addEventListener('mousemove', function (e) { if (!tip.hidden) show(el, e); });
        el.addEventListener('mouseleave', hide);
      });
    });
  }
  function _snapTableHtml(titleKey, groups, costFn, valFn) {
    var keys = Object.keys(groups || {});
    var rows = '', totalP = 0, totalInv = 0, totalNav = 0;
    keys.forEach(function (k) {
      var items = groups[k];
      var inv = items.reduce(function (s, p) { return s + costFn(p); }, 0);
      var nav = items.reduce(function (s, p) { return s + valFn(p); }, 0);
      totalP += items.length; totalInv += inv; totalNav += nav;
      rows += '<tr><td>' + esc(k) + '</td><td class="po-cell-num">' + items.length + '</td><td class="po-cell-num">' + fmtMoney(inv) + '</td><td class="po-cell-num">' + fmtMoney(nav) + '</td></tr>';
    });
    rows += '<tr style="font-weight:700"><td>合计</td><td class="po-cell-num">' + totalP + '</td><td class="po-cell-num">' + fmtMoney(totalInv) + '</td><td class="po-cell-num">' + fmtMoney(totalNav) + '</td></tr>';
    return '<div class="po-table-shell"><table class="po-table"><thead><tr><th>' + esc(titleKey) + '</th><th class="po-cell-num">项目数</th><th class="po-cell-num">投资金额</th><th class="po-cell-num">持股价值</th></tr></thead><tbody>' + (keys.length ? rows : '<tr><td colspan="4"><div class="po-empty">暂无数据</div></td></tr>') + '</tbody></table></div>';
  }
  function _snapChartBlock(titleKey, groups, costFn, valFn) {
    var slices = _snapSlices(groups, costFn, valFn);
    var ringN = slices.reduce(function (s, x) { return s + x.n; }, 0);
    return '<div class="po-snap-grid">' + _snapTableHtml(titleKey, groups, costFn, valFn) + _nestedDonutHtml(slices, ringN) + '</div>';
  }
  function _snapExtraBlock(list, costFn, valFn, active, pageKind) {
    var defs = [
      { id: 'region', label: '按省', titleKey: '企业所在省', groups: _snapGroupBy(list, _snapRegion) },
      { id: 'year', label: '投资年份', titleKey: '投资年份', groups: _snapGroupBy(list, _snapYear) },
      { id: 'exit', label: '退出状态', titleKey: '退出状态', groups: _snapGroupBy(list, _snapExitLabel) },
      { id: 'owner', label: '负责人', titleKey: '负责人', groups: _snapGroupBy(list, function (p) { return p.owner || '未分类'; }) },
      { id: 'type', label: '项目类型', titleKey: '项目类型', groups: _snapGroupBy(list, _snapTypeLabel) }
    ];
    var cur = defs.filter(function (d) { return d.id === active; })[0] || defs[0];
    var pills = '<div class="po-snap-dims">' + defs.map(function (d) {
      return '<button type="button" class="po-snap-dim' + (d.id === cur.id ? ' is-on' : '') + '" data-act="setSnapExtraDim" data-arg="' + pageKind + '|' + d.id + '">' + esc(d.label) + '</button>';
    }).join('') + '</div>';
    return pills + _snapChartBlock(cur.titleKey, cur.groups, costFn, valFn);
  }

  function pageFundSnapshot() {
    var store = window.PE_POST_STORE;
    var funds = (store ? store.funds() : (D().FUNDS || [])).filter(function(f){return (f.management||'managed')==='managed';});
    function metric(f){return store?store.fundMetrics(f.id):{investmentCost:0,totalValue:0};}
    var selId = FUND_SNAP_STATE.fundId || 'all';
    if (selId !== 'all' && !funds.some(function(f){return f.id===selId;})) selId = 'all';
    var focusFund = selId === 'all' ? null : (store ? store.fund(selId) : funds.filter(function(f){return f.id===selId;})[0]);
    var portfolioProjects = [];
    if (focusFund && store) {
      var pf = store.fundPortfolio(focusFund.id) || { directProjects: [], investedFunds: [] };
      portfolioProjects = (pf.directProjects || []).concat([]);
      /* 穿透项目：母基金持有该子基金时挂在 lookthrough 上 */
      (store.projects() || []).forEach(function(p){
        if (p.type === 'lookthrough' && (p.parentFundIds || []).indexOf(focusFund.id) >= 0) portfolioProjects.push(p);
      });
    } else if (!focusFund && store) {
      var seenP = {};
      function addPort(p) { if (!p || seenP[p.id]) return; seenP[p.id] = true; portfolioProjects.push(p); }
      funds.forEach(function (f) {
        var pf = store.fundPortfolio(f.id) || { directProjects: [] };
        (pf.directProjects || []).forEach(addPort);
        (store.projects() || []).forEach(function (p) {
          if (p.type === 'lookthrough' && (p.parentFundIds || []).indexOf(f.id) >= 0) addPort(p);
        });
      });
    }
    function pCost(p){return store&&store.projectInvestmentAmount?store.projectInvestmentAmount(p):Number(p.investAmount||0);}
    function pVal(p){return Number(p.holding&&p.holding.totalValue||0);}
    var stageGroups = { '早期': [], '中期': [], '成熟期': [] };
    var industryGroups = {};
    portfolioProjects.forEach(function(p){
      var st = _normalizeStageIn(p.stageIn);
      if (!stageGroups[st]) stageGroups[st] = [];
      stageGroups[st].push(p);
      var ind = p.industry || '未分类';
      (industryGroups[ind] = industryGroups[ind] || []).push(p);
    });
    var fundSelect = '<div class="po-filter-bar" style="margin-bottom:12px"><select id="poFundSnapFund"><option value="all"'+(selId==='all'?' selected':'')+'>全部管理基金（汇总）</option>'
      + funds.map(function(f){return '<option value="'+esc(f.id)+'"'+(selId===f.id?' selected':'')+'>'+esc(f.name)+'</option>';}).join('')
      + '</select><span style="font-size:12px;color:var(--xb-muted);margin-left:8px">数据截至 2026-06-30 · 已确认口径</span></div>';
    var title = focusFund ? (focusFund.name + ' · 季报盘面') : '基金盘面';
    var totalInvested = portfolioProjects.reduce(function(s,p){return s+pCost(p);},0);
    var totalNav = portfolioProjects.reduce(function(s,p){return s+pVal(p);},0);
    return '<div class="po-page">'+toolbar(title,'<button class="po-btn po-btn-sm" data-nav="fund">返回基金管理</button>')+'<div class="po-body">'
      + fundSelect
      + statStrip([{num:focusFund?1:funds.length,label:focusFund?'当前基金':'管理基金'},{num:portfolioProjects.length,label:'组合项目'},{num:fmtMoney(totalInvested),label:'组合投资成本'},{num:fmtMoney(totalNav),label:'组合总价值'}])
      + panel('按投资阶段（早期／中期／成熟期）', _snapChartBlock('投资阶段', stageGroups, pCost, pVal))
      + panel('按行业', _snapChartBlock('行业', industryGroups, pCost, pVal))
      + panel('更多切片', _snapExtraBlock(portfolioProjects, pCost, pVal, FUND_SNAP_STATE.extraDim || 'region', 'fund'))
      + (focusFund ? '' : panel('基金概览','<div class="po-table-shell"><table class="po-table"><thead><tr><th>基金名称</th><th>策略</th><th>状态</th><th class="po-cell-num">组合投资成本</th><th class="po-cell-num">组合总价值</th></tr></thead><tbody>'+funds.map(function(f){return '<tr><td><button class="po-table-link" data-nav="fund/'+esc(f.id)+'">'+esc(f.name)+'</button></td><td>'+esc(({direct:'直投',fof:'母基金',mixed:'混合',other:'其他'})[f.strategy]||f.type||'—')+'</td><td>'+esc(f.status||'—')+'</td><td class="po-cell-num">'+fmtMoney(metric(f).investmentCost)+'</td><td class="po-cell-num">'+fmtMoney(metric(f).totalValue)+'</td></tr>';}).join('')+'</tbody></table></div>'))
      + '</div></div>';
  }

  /* ═══ 盘面视图（活的季报页） ═══ */
  function pageSnapshot() {
    return pageSnapshotV2();
  }

  /* 组合盘面：早期／中后期 + 行业 + 双环 + 盈利占比 */
  function pageSnapshotV2() {
    var store = window.PE_POST_STORE;
    var all = store ? store.projects() : (D().PROJECTS || []);
    var funds = store ? store.funds() : (D().FUNDS || []);
    var owners = [], industries = [];
    all.forEach(function (p) {
      var o=p.owner||'未分配', ind=p.industry||'未分类';
      if(owners.indexOf(o)<0) owners.push(o); if(industries.indexOf(ind)<0) industries.push(ind);
    });
    var list = store ? store.filterProjects(SNAPSHOT_FILTER) : all;
    function projectCost(p){return store&&store.projectInvestmentAmount?store.projectInvestmentAmount(p):Number(p.investAmount||0);}
    function projectValue(p){return Number(p.holding&&p.holding.totalValue||0);}
    function isProfitable(p){
      var periods = p.periods || [];
      var done = periods.filter(function(x){ return x.status === 'done' && x.netProfit != null; });
      if (done.length) return Number(done[done.length-1].netProfit) > 0;
      if (p.moic != null) return Number(p.moic) > 1;
      return projectValue(p) > projectCost(p);
    }
    var totalInv = list.reduce(function(s,p){return s+projectCost(p);},0);
    var totalValue = list.reduce(function(s,p){return s+projectValue(p);},0);
    var profitList = list.filter(isProfitable);
    var profitInv = profitList.reduce(function(s,p){return s+projectCost(p);},0);
    var profitShare = totalInv ? (profitInv / totalInv * 100) : 0;
    var stageGroups = { '早期': [], '中期': [], '成熟期': [] };
    var industryGroups = {};
    list.forEach(function(p){
      var st = _normalizeStageIn(p.stageIn);
      if (!stageGroups[st]) stageGroups[st] = [];
      stageGroups[st].push(p);
      var ind = p.industry || '未分类';
      (industryGroups[ind] = industryGroups[ind] || []).push(p);
    });
    var projectRows = list.map(function(p){
      return '<tr><td><button class="po-table-link" data-nav="project/'+esc(p.id)+'">'+esc(p.name)+'</button></td><td>'+typeTag(p.type)+'</td><td>'+esc(_normalizeStageIn(p.stageIn)==='未分类'?'—':_normalizeStageIn(p.stageIn))+'</td><td>'+esc(p.industry||'—')+'</td><td class="po-cell-num">'+fmtMoney(projectCost(p))+'</td><td class="po-cell-num">'+fmtMoney(projectValue(p))+'</td><td>'+(isProfitable(p)?'盈利':'—')+'</td></tr>';
    }).join('');
    return '<div class="po-page">'
      + toolbar('盘面视图','<button class="po-btn po-btn-sm" data-nav="projects">返回项目库</button>')
      + '<div class="po-body">'
      + '<div class="po-filter-bar po-snapshot-filter">'
      + '<div class="po-search-box"><span>⌕</span><input id="poSnapshotSearch" placeholder="搜索项目、行业或负责人" value="'+esc(SNAPSHOT_FILTER.search)+'"></div>'
      + '<select id="poSnapshotStage"><option value="all">全部投资阶段</option><option value="早期"'+(SNAPSHOT_FILTER.stageIn==='早期'?' selected':'')+'>早期</option><option value="中期"'+(SNAPSHOT_FILTER.stageIn==='中期'?' selected':'')+'>中期</option><option value="成熟期"'+(SNAPSHOT_FILTER.stageIn==='成熟期'?' selected':'')+'>成熟期</option></select>'
      + '<select id="poSnapshotType"><option value="all">全部类型</option><option value="direct"'+(SNAPSHOT_FILTER.type==='direct'?' selected':'')+'>直接投资</option><option value="lookthrough"'+(SNAPSHOT_FILTER.type==='lookthrough'?' selected':'')+'>子基金穿透</option></select>'
      + '<select id="poSnapshotFund"><option value="all">全部出资基金</option>'+funds.map(function(f){return '<option value="'+esc(f.id)+'"'+(SNAPSHOT_FILTER.fundId===f.id?' selected':'')+'>'+esc(f.name)+'</option>';}).join('')+'</select>'
      + '<select id="poSnapshotIndustry"><option value="all">全部行业</option>'+industries.map(function(x){return '<option value="'+esc(x)+'"'+(SNAPSHOT_FILTER.industry===x?' selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select>'
      + '<select id="poSnapshotOwner"><option value="all">全部负责人</option>'+owners.map(function(x){return '<option value="'+esc(x)+'"'+(SNAPSHOT_FILTER.owner===x?' selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select>'
      + '<button class="po-btn po-btn-sm" data-act="clearSnapshotFilters">重置</button></div>'
      + statStrip([
        {num:list.length,label:'项目数'},
        {num:profitList.length,label:'盈利项目数'},
        {num:profitShare.toFixed(1)+'%',label:'盈利项目占投资金额'},
        {num:fmtMoney(totalInv),label:'投资金额'},
        {num:fmtMoney(totalValue),label:'当前价值'}
      ])
      + panel('按投资阶段', _snapChartBlock('投资阶段', stageGroups, projectCost, projectValue))
      + panel('按行业', _snapChartBlock('行业', industryGroups, projectCost, projectValue))
      + panel('更多切片', _snapExtraBlock(list, projectCost, projectValue, SNAPSHOT_FILTER.extraDim || 'region', 'project'))
      + panel('筛选结果（'+list.length+'）','<div class="po-table-shell"><table class="po-table"><thead><tr><th>项目名称</th><th>类型</th><th>投资阶段</th><th>行业</th><th class="po-cell-num">投资金额</th><th class="po-cell-num">当前价值</th><th>盈利</th></tr></thead><tbody>'+(projectRows||'<tr><td colspan="7"><div class="po-empty">没有匹配项目</div></td></tr>')+'</tbody></table></div>')
      + '<div style="font-size:12px;color:var(--xb-muted);padding:12px 0">盈利按最近已确认净利润（无则按价值＞成本）判断</div>'
      + '</div></div>';
  }

  window.PE_POST_PAGES = PE_POST_PAGES;
  /* 暴露给全局 sidebar 使用：所有对话（含运行时新建）+ 新建任务动作 + 项目展开状态 */
  window.PE_POST_CHATS = function() { return _allChats(); };
  window.PE_POST_NEW_TASK = function() {
    var cid = _createChatFromQuestion('');
    return cid;
  };
  window.PE_POST_PROJ_OPEN = CHAT_CTX_STATE.projOpen || {};
  window.PE_POST_TOGGLE_PROJ = function(pid) {
    CHAT_CTX_STATE.projOpen = CHAT_CTX_STATE.projOpen || {};
    CHAT_CTX_STATE.projOpen[pid] = !(CHAT_CTX_STATE.projOpen[pid] === true);
    return CHAT_CTX_STATE.projOpen[pid];
  };
  window.PE_POST_SPACE_OPEN = CHAT_CTX_STATE.spaceOpen || {};
  window.PE_POST_TOGGLE_SPACE = function(sid) {
    CHAT_CTX_STATE.spaceOpen = CHAT_CTX_STATE.spaceOpen || {};
    CHAT_CTX_STATE.spaceOpen[sid] = !(CHAT_CTX_STATE.spaceOpen[sid] === true);
    return CHAT_CTX_STATE.spaceOpen[sid];
  };
  window.PE_POST_SELECTED_SPACE = function() { return BROWSER_STATE.spaceId || null; };
  window.PE_POST_SELECT_SPACE = function(sid) {
    BROWSER_STATE.spaceId = sid || null;
    HOME_STATE.toolbarOpen = null;
    CHAT_CTX_STATE.spaceOpen[sid] = true;
    return BROWSER_STATE.spaceId;
  };
})();
