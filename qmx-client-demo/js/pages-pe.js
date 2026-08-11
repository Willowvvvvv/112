/**
 * 启明星完整能力 Demo · PE 工作台页面
 * 全局：window.PEPages = { render(route, ctx) }
 * ctx: { rootEl, navigate, state, setState, toast, mode }
 */
(function () {
  'use strict';

  var D = function () {
    return window.PE_DATA || {};
  };

  var _ctx = null;
  var _route = 'home';
  var _local = {
    homeDraft: '',
    expertTab: 'meetings',
    journalistView: 'list',
    projectFilter: '',
    postFilter: '',
    findQuery: '',
    knowledgeQuery: '',
    settingsName: '',
    intelligenceTab: 'radar',
    discoverTab: 'leads', /* leads | meetings | field */
    discoverEmbed: false,
    monitorTab: 'all',
    monitorCompany: 'all',
    knowledgePane: null, // null → 首个知识库或 empty
    kbCreateOpen: false,
    kbMenuId: null,
    createProjectOpen: false,
    rightPane: null,
    rightPaneKind: null,
    filesOpen: true,
    aiMenuOpen: false,
    openFolder: 'BP',
    ocrSheet: 'bs',
    ocrDataTab: 'data',
    ocrHi: '货币资金',
    ocrConfirmed: false,
    contactFlow: null,
    graphView: 'equity',
    finTab: 'subjects',
    finStmt: 'is',
    finPeriodTab: 'templates',
    activePeriodTemplateId: 'pt-q-ytd-only',
    finColTags: null,
    marketKind: 'experts',
    marketScope: 'official',
    skillCategory: 'all',
    installedSkills: { 'hv-analysis': 1, 'dd-entity-anchor': 1, 'dd-cap-table': 1, 'pe-ic-skeleton': 1, 'dd-judicial-scan': 1 },
    installedConnectors: { qcc: 1 },
    tplNav: 'org',
    radarFilter: '全部',
    radarFocus: null,
    radarPreviewId: null,
    radarShowWeekly: false,
    radarInterpreted: {},
    radarSaved: {},
    chainView: 'list',
    chainNodeId: 'chip-gpu',
    chainQuery: '',
    chainCompanyId: null,
    chatDraft: '',
    composerToolsOpen: false,
    composerMenu: null,
    homePlusMenuOpen: false,
    composerBattleMode: false,
    composerBattleSide: 'red',
    composerExpertIds: [],
    composerBattleRed: [],
    composerBattleBlue: [],
    composerSkillIds: [],
    composerCiteIds: [],
    composerMcpIds: [],
    financeConfigs: null,
    activeFinanceConfigId: 'platform-standard',
    finConfigMenuOpen: false,
    finBannerMenuOpen: false,
    finRenameOpen: false,
    finRenameVal: '',
    finEditSubjectId: null,
    kbEditId: null,
    kbSearchOpen: false,
    kbSearchQuery: '',
    marketCreateKind: null,
    inviteOpen: false,
    graphBoundKbId: null,
    composerAttachments: [],
    reportData: null,
    evidencePanelTab: 'source',
    evidenceCitationData: null,
    cfgTab: 'subjects',
    cfgModal: null,
    cfgSubjStmt: 'is',
    cfgStandard: null,
    cfgSubjSelected: null,
  };

  var COMPOSER_EXPERTS = [
    { id: 'ex-ib', name: '投行路演专家', field: '估值材料、可比分析、路演稿' },
    { id: 'ex-model', name: '财务建模专家', field: 'DCF、LBO、三表、可比估值' },
    { id: 'ex-sector', name: '赛道研究专家', field: '行业概览、竞争格局、主题标的' },
    { id: 'ex-earn', name: '业绩解读专家', field: '财报季点评、模型更新、业绩笔记' },
    { id: 'ex-risk', name: '合规风控专家', field: '合规风控、准入材料、名单筛查' },
    { id: 'ex-pe', name: '私募股权专家', field: '项目挖掘、尽调清单、投委会材料' },
    { id: 'ex-ma', name: '并购交易专家', field: 'Teaser、CIM、买方名单、并购模型' },
    { id: 'ex-fdd', name: '财务尽调专家', field: '同业对比、三表梳理、表格质检' },
    { id: 'ex-theme', name: '主题挖项目专家', field: '主题筛选、赛道论点、催化跟踪' },
    { id: 'ex-fund', name: '基金行政专家', field: '计提、滚动表、净值核对、总账对账' },
  ];

  var COMPOSER_SKILLS = [
    { id: 'hv-analysis', name: '横纵分析', desc: '行业横向 + 标的纵向' },
    { id: 'dd-entity-anchor', name: '主体锚定', desc: '工商照面与主体确认' },
    { id: 'dd-cap-table', name: '股权结构', desc: '多层股权与实控' },
    { id: 'pe-ic-skeleton', name: 'IC 备忘录骨架', desc: '立项要点结构' },
    { id: 'dd-judicial-scan', name: '司法扫描', desc: '诉讼执行限高' },
  ];

  var COMPOSER_CITES = [
    { id: 'kb-deal', name: '项目资料库', desc: '当前项目已入库材料' },
    { id: 'kb-fin', name: '财报摘录', desc: '近三年财报关键科目' },
    { id: 'kb-bp', name: 'BP / 路演材料', desc: '商业计划与路演稿' },
  ];

  var COMPOSER_MCPS = [
    { id: 'qcc', name: '财跃启明星', desc: '工商 / 司法 / 股权' },
    { id: 'pkulaw', name: '北大法宝', desc: '法规与判例检索' },
    { id: 'web', name: '联网搜索', desc: '公开资讯补充' },
  ];

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function buildPlatformFinanceSeed() {
    return {
      id: 'platform-standard',
      name: '通用模板',
      scope: 'platform',
      subjects: [
        { id: 's-rev-total', name: '营业总收入', aliases: '营业收入合计 · 一、营业总收入', stmt: 'is' },
        { id: 's-rev', name: '营业收入', aliases: '主营业务收入 · Revenue · 营业总收入', stmt: 'is' },
        { id: 's-cogs-total', name: '营业总成本', aliases: '营业成本合计', stmt: 'is' },
        { id: 's-cogs', name: '营业成本', aliases: '主营业务成本 · 销售成本', stmt: 'is' },
        { id: 's-tax', name: '税金及附加', aliases: '营业税金及附加', stmt: 'is' },
        { id: 's-sales', name: '销售费用', aliases: '营销费用 · 市场推广费', stmt: 'is' },
        { id: 's-admin', name: '管理费用', aliases: '一般管理费用 · 行政费用', stmt: 'is' },
        { id: 's-rd', name: '研发费用', aliases: '研发支出 · 费用化研发 · 研究开发费', stmt: 'is' },
        { id: 's-gp', name: '毛利', aliases: '毛利润 · 营业毛利', stmt: 'is' },
        { id: 's-ebitda', name: 'EBITDA', aliases: '息税折旧摊销前利润', stmt: 'is' },
        { id: 's-np', name: '净利润', aliases: '归属母公司净利润 · 税后利润', stmt: 'is' },
        { id: 's-cash', name: '货币资金', aliases: '银行存款 · 现金及现金等价物', stmt: 'bs' },
        { id: 's-ar', name: '应收账款', aliases: '应收票据及应收账款 · 应收款项', stmt: 'bs' },
        { id: 's-oar', name: '其他应收款', aliases: '其他应收款-关联方', stmt: 'bs' },
        { id: 's-inv', name: '存货', aliases: '原材料 · 库存商品 · 存货净额', stmt: 'bs' },
        { id: 's-fa', name: '固定资产', aliases: '固定资产净额 · 固定资产合计', stmt: 'bs' },
        { id: 's-ta', name: '资产总计', aliases: '总资产 · 资产合计', stmt: 'bs' },
        { id: 's-ap', name: '应付账款', aliases: '应付票据及应付账款', stmt: 'bs' },
        { id: 's-st', name: '短期借款', aliases: '短期银行贷款 · 一年内到期借款', stmt: 'bs' },
        { id: 's-tl', name: '负债合计', aliases: '总负债 · 负债总计', stmt: 'bs' },
        { id: 's-eq', name: '股东权益合计', aliases: '净资产 · 所有者权益合计', stmt: 'bs' },
        { id: 's-ocf', name: '经营活动现金流净额', aliases: '经营现金流 · 经营活动产生的现金流量净额', stmt: 'cf' },
        { id: 's-icf', name: '投资活动现金流净额', aliases: '投资活动产生的现金流量净额', stmt: 'cf' },
        { id: 's-fcf', name: '筹资活动现金流净额', aliases: '筹资活动产生的现金流量净额', stmt: 'cf' },
      ],
      metrics: [
        { id: 'm-gm', name: '毛利率', formula: '(营业收入 - 营业成本) / 营业收入', unit: '%', desc: '毛利占营收比例，反映产品竞争力与定价能力。' },
        { id: 'm-nm', name: '净利率', formula: '净利润 / 营业收入', unit: '%', desc: '净利润占营收比例，反映综合盈利能力。' },
        { id: 'm-ebitda', name: 'EBITDA利润率', formula: 'EBITDA / 营业收入', unit: '%', desc: '经营层面现金创造能力，排除财务杠杆与折旧影响。' },
        { id: 'm-debt', name: '资产负债率', formula: '负债合计 / 资产总计', unit: '%', desc: '财务杠杆水平。科技/轻资产健康值通常 < 40%。' },
        { id: 'm-ocf', name: '经营现金流/净利润', formula: '经营活动现金流净额 / 净利润', unit: 'x', desc: '利润现金含量。理想值 > 1.0。' },
        { id: 'm-ar', name: '应收账款周转天数', formula: '应收账款 / 营业收入 × 365', unit: '天', desc: '回款周期估算；超过 90 天需关注坏账风险。' },
        { id: 'm-rg', name: '营收增速', formula: '(本期营收 - 上期营收) / 上期营收', unit: '%', desc: '同比营收变动，反映业务成长性。' },
        { id: 'm-rd', name: '研发费用率', formula: '研发费用 / 营业收入', unit: '%', desc: '研发投入强度，科技类企业核心指标。' },
        { id: 'm-capex', name: '资本支出占比', formula: '|投资活动现金流| / 营业收入', unit: '%', desc: '反映重资产程度。' },
        { id: 'm-cash', name: '现金短债比', formula: '货币资金 / 短期借款', unit: 'x', desc: '流动性安全边际；低于 1.0 需警惕。' },
      ],
      rules: [
        { id: 'r-bs', name: '资产负债表平衡校验', expr: '资产总计 = 负债合计 + 股东权益', severity: 'critical', msg: '资产负债表不平衡，请核查资产、负债与股东权益是否勾稽一致', enabled: true },
        { id: 'r-gm', name: '毛利率过低', expr: '毛利率 < 20%', severity: 'warning', msg: '毛利率低于20%（行业警戒线），关注定价能力与成本控制', enabled: true },
        { id: 'r-debt', name: '资产负债率偏高', expr: '资产负债率 > 70%', severity: 'warning', msg: '资产负债率超过70%，偿债压力较大', enabled: true },
        { id: 'r-cash', name: '现金流与净利润背离', expr: '净利润 > 0 且 经营现金流 < 0', severity: 'warning', msg: '盈利但现金流为负——利润质量存疑', enabled: true },
        { id: 'r-rev', name: '营收波动异常', expr: '营收同比 < -30% 或 > 300%', severity: 'warning', msg: '营收同比变动幅度异常，需核查重大业务变化', enabled: true },
        { id: 'r-ar', name: '应收账款占比过高', expr: '应收账款 / 资产总计 > 40%', severity: 'warning', msg: '应收账款占总资产40%以上，回款风险较高', enabled: true },
        { id: 'r-rd', name: '研发费用率异常偏高', expr: '研发费用率 > 50%', severity: 'warning', msg: '需核查资本化 vs 费用化政策', enabled: true },
        { id: 'r-loss', name: '有营收但亏损', expr: '营收 > 0 且 净利润 < 0', severity: 'warning', msg: '有营收但整体亏损，关注一次性损失', enabled: true },
      ],
      periodTypes: [
        { id: 'month',   name: '当月 / 单月',   short: '月',   stmts: 'is,cf', desc: '利润表/现金流量的期间发生额，仅指当期一个月。' },
        { id: 'quarter', name: '当季 / 单季',   short: '季',   stmts: 'is,cf', desc: '单个季度的期间发生额。' },
        { id: 'ytd',     name: '本年累计',      short: '累计', stmts: 'is,cf', desc: '自年初至报表日的累计发生额——财务权威锚点，直取优先。' },
        { id: 'lytd',    name: '上年同期累计',  short: '同期', stmts: 'is,cf', desc: '上年同口径累计，用于同比对照。' },
        { id: 'end',     name: '期末时点',      short: '期末', stmts: 'bs',    desc: '资产负债表时点数（余额口径）。' },
      ],
      periodTemplates: [
        {
          id: 'pt-m-month',
          name: '月度 · 累计 + 当月',
          frequency: 'monthly',
          primary: 'month',
          columns: ['ytd', 'month'],
          derive: { target: 'month', from: 'ytd' },
          desc: '报表含本年累计与当月两列；两列均提取，以当月为主，累计为权威锚点。',
        },
        {
          id: 'pt-m-detail',
          name: '月度 · 逐月明细',
          frequency: 'monthly',
          primary: 'month',
          columns: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
          detail: true,
          derive: null,
          desc: '报表含截至当月的各月份明细列；全量提取，以最新一期财报为准（重述覆盖）。',
        },
        {
          id: 'pt-q-ytd',
          name: '季度 · 累计 + 当月(备查)',
          frequency: 'quarterly',
          primary: 'ytd',
          columns: ['ytd', 'month'],
          derive: { target: 'quarter', from: 'ytd' },
          desc: '以本年累计为主，当月金额备查；Q2-Q4 用当期累计 − 上期累计倒减出当季。',
        },
        {
          id: 'pt-q-quarter',
          name: '季度 · 累计 + 当季',
          frequency: 'quarterly',
          primary: 'quarter',
          columns: ['ytd', 'quarter'],
          derive: { target: 'quarter', from: 'ytd' },
          desc: '以当季金额为主；累计直取为权威，缺累计时可由当季加总近似。',
        },
        {
          id: 'pt-q-ytd-only',
          name: '季度 · 仅累计',
          frequency: 'quarterly',
          primary: 'ytd',
          columns: ['ytd'],
          derive: { target: 'quarter', from: 'ytd' },
          desc: '报表仅含本年累计；提取累计数，Q2-Q4 用当期累计 − 上期累计倒减出当季。',
        },
      ],
      periodRules: [
        { id: 'pr-derive',  name: '倒减补缺',     desc: '当期(月/季) = 本期累计 − 上期累计；仅当报表未直接提供当期金额时启用，倒减值标注「计算值」。', enabled: true },
        { id: 'pr-check',   name: '勾稽校验',     desc: '上期累计 + 本期当期金额 = 本期累计；不一致时标记差异并提示人工复核，不静默替代。', enabled: true },
        { id: 'pr-restate', name: '最新一期为准', desc: '多期报表入库后，同一期间数据以最新一期财报为准（覆盖旧值 / 重述）。', enabled: true },
      ],
    };
  }

  function ensureFinanceConfigs() {
    if (!_local.financeConfigs || !_local.financeConfigs.length) {
      _local.financeConfigs = [buildPlatformFinanceSeed()];
      _local.activeFinanceConfigId = 'platform-standard';
    } else {
      /* 升级旧 Demo 种子：平台模板科目过少时替换 */
      _local.financeConfigs = _local.financeConfigs.map(function (c) {
        if (c.id === 'platform-standard' && (!c.subjects || c.subjects.length < 20)) {
          var rich = buildPlatformFinanceSeed();
          rich.id = c.id;
          rich.name = c.name || rich.name;
          rich.scope = 'platform';
          return rich;
        }
        if (c.rules) c.rules = c.rules.map(normalizeFinanceRule);
        return c;
      });
    }
    return _local.financeConfigs;
  }

  function getActiveFinanceConfig() {
    var list = ensureFinanceConfigs();
    var id = _local.activeFinanceConfigId || 'platform-standard';
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
  }

  function financeScopeLabel(scope) {
    if (scope === 'user') return '我的配置';
    if (scope === 'institution') return '机构模板';
    return '平台模板';
  }

  function cloneActiveFinanceConfig() {
    var src = getActiveFinanceConfig();
    var cloned = deepClone(src);
    cloned.id = 'user-fin-' + Date.now();
    cloned.name = src.name + ' · 我的配置';
    cloned.scope = 'user';
    ensureFinanceConfigs().push(cloned);
    _local.activeFinanceConfigId = cloned.id;
    _local.finConfigMenuOpen = false;
    _local.finBannerMenuOpen = false;
    _local.finRenameOpen = false;
    _local.finEditSubjectId = null;
    return cloned;
  }

  function findFinanceConfig(id) {
    var list = ensureFinanceConfigs();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function financeConfigBannerHtml(opts) {
    opts = opts || {};
    var cfg = getActiveFinanceConfig();
    var menuOpen = !!_local.finBannerMenuOpen;
    var list = ensureFinanceConfigs();
    var menu =
      menuOpen
        ? '<div class="xb-fin-switch-menu">' +
          list
            .map(function (c) {
              return (
                '<button type="button" class="xb-fin-switch-item' +
                (c.id === cfg.id ? ' on' : '') +
                '" data-act="selectFinanceConfig" data-arg="' +
                esc(c.id) +
                '">' +
                esc(c.name) +
                '<span>' +
                esc(financeScopeLabel(c.scope)) +
                '</span></button>'
              );
            })
            .join('') +
          '<button type="button" class="xb-fin-switch-item xb-fin-switch-link" data-act="cloneFinanceConfig">' +
          ico('plus') +
          ' 新建个人配置</button>' +
          '<button type="button" class="xb-fin-switch-item xb-fin-switch-link" data-act="openFinanceConfigPage">打开财务配置页</button>' +
          '</div>'
        : '';
    return (
      '<div class="xb-fin-banner">' +
      '<div class="xb-fin-banner-main">' +
      ico('book') +
      '<span>当前使用：<strong>' +
      esc(cfg.name) +
      '</strong><span class="muted">共 ' +
      (cfg.subjects || []).length +
      ' 科目 · ' +
      (cfg.rules || []).length +
      ' 条规则</span></span></div>' +
      '<button type="button" class="btn btn-ghost xb-fin-banner-btn" data-act="toggleFinBannerMenu">修改 ' +
      ico('chevronDown') +
      '</button>' +
      menu +
      '</div>'
    );
  }

  function ico(name) {
    var paths = {
      list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
      news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
      bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
      plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
      paperclip:
        '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
      plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a6 6 0 0 1-12 0V8Z"/>',
      send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
      file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
      folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9l-.81-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
      sparkles:
        '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
      link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
      building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>',
      user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
      flask:
        '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
      eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
      trash:
        '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
      pencil:
        '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
      chevronLeft: '<path d="m15 18-6-6 6-6"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>',
      chevronDown: '<path d="m6 9 6 6 6-6"/>',
    };
    return (
      '<svg class="xb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (paths[name] || paths.file) +
      '</svg>'
    );
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(msg) {
    if (_ctx && typeof _ctx.toast === 'function') _ctx.toast(msg);
  }

  function navigate(route) {
    if (_ctx && typeof _ctx.navigate === 'function') _ctx.navigate(route);
  }

  function setState(patch) {
    if (_ctx && typeof _ctx.setState === 'function') _ctx.setState(patch);
  }

  function getState() {
    return (_ctx && _ctx.state) || {};
  }

  function findProject(id) {
    var list = D().projects || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function statusClass(st) {
    if (st === '尽调') return 'dd';
    if (st === 'IC') return 'ic';
    if (st === '投后' || st === '已投资') return 'post';
    return '';
  }

  function levelTag(level) {
    var c = level === '高' ? 'warn' : level === '中' ? 'ic' : 'ok';
    return '<span class="tag ' + c + '">' + esc(level) + '</span>';
  }

  function toolbar(title, rightHtml) {
    if (_local.discoverEmbed) {
      if (!rightHtml) return '';
      return (
        '<div class="page-toolbar xb-discover-embed-bar">' +
        '<div class="spacer"></div>' +
        rightHtml +
        '</div>'
      );
    }
    return (
      '<div class="page-toolbar">' +
      '<h1>' +
      esc(title) +
      '</h1>' +
      '<div class="spacer"></div>' +
      (rightHtml || '') +
      '</div>'
    );
  }

  function crumb(parts) {
    var html = '<div class="crumb">';
    for (var i = 0; i < parts.length; i++) {
      if (i) html += ' / ';
      var p = parts[i];
      if (p.route) {
        html +=
          '<a href="javascript:void(0)" data-nav="' +
          esc(p.route) +
          '">' +
          esc(p.label) +
          '</a>';
      } else {
        html += '<span>' + esc(p.label) + '</span>';
      }
    }
    return html + '</div>';
  }

  function renderCards(cards) {
    if (!cards || !cards.length) return '';
    var html = '';
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.type === 'report-open') {
        html +=
          '<div class="ai-card xb-report-open-card panel" style="margin-top:8px;padding:10px 12px">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
          '<span style="font-size:15px">📄</span>' +
          '<span style="font-weight:600">' + esc(c.title || '报告') + '</span>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--xb-muted);margin-bottom:8px">' + esc(c.subtitle || '') + '</div>' +
          '<button type="button" class="xb-btn-mini primary" data-act="openReportPane" data-arg="' + esc(c.reportId || '') + '">查看报告</button>' +
          '</div>';
        continue;
      }
      html += '<div class="ai-card panel" style="margin-top:8px;padding:10px 12px">';
      html += '<div style="font-weight:600;margin-bottom:6px">' + esc(c.title || '') + '</div>';
      if (c.rows) {
        html += '<table class="dt" style="box-shadow:none;border:0"><tbody>';
        for (var r = 0; r < c.rows.length; r++) {
          html +=
            '<tr><td style="width:100px;color:var(--xb-muted)">' +
            esc(c.rows[r][0]) +
            '</td><td>' +
            esc(c.rows[r][1]) +
            '</td></tr>';
        }
        html += '</tbody></table>';
      }
      if (c.items) {
        html += '<ul style="margin:0;padding-left:18px;color:var(--xb-text)">';
        for (var j = 0; j < c.items.length; j++) {
          html += '<li style="margin:4px 0">' + esc(c.items[j]) + '</li>';
        }
        html += '</ul>';
      }
      html += '</div>';
    }
    return html;
  }

  function renderMessages(messages) {
    if (!messages || !messages.length) {
      return '<div class="empty-hint">暂无消息</div>';
    }
    var html = '<div class="chat-thread xb-chat-messages">';
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var isUser = m.role === 'user';
      html +=
        '<div class="xb-message-row ' +
        (isUser ? 'xb-message-row--user' : 'xb-message-row--assistant') +
        '">';
      if (!isUser) {
        html += '<div class="xb-message-speaker">小星</div>';
      }
      html +=
        '<div class="xb-message-body ' +
        (isUser ? 'xb-message-body--user' : 'xb-message-body--assistant') +
        '">';
      html += '<div class="msg-text">' + esc(m.text || '') + '</div>';
      if (m.cards) html += renderCards(m.cards);
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function contactFlowHtml() {
    var cf = _local.contactFlow;
    if (!cf) return '';
    if (cf.kind === 'submitted') {
      return (
        '<div class="xb-contact-flow-mask" data-act="closeContactFlow" role="presentation">' +
        '<div class="xb-contact-flow-modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">' +
        '<h2>' +
        esc(cf.title || '已提交') +
        '</h2><p class="xb-contact-flow-hint">' +
        esc(cf.message || '专人将在 1–3 个工作日内联系你。') +
        '</p><div class="xb-contact-flow-actions">' +
        '<button type="button" class="xb-contact-flow-send" data-act="closeContactFlow">知道了</button></div></div></div>'
      );
    }
    if (cf.kind === 'expert-book') {
      return (
        '<div class="xb-contact-flow-mask" data-act="closeContactFlow" role="presentation">' +
        '<div class="xb-contact-flow-modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">' +
        '<h2>预约专家 · ' +
        esc(cf.name || '') +
        '</h2><p class="xb-contact-flow-hint">' +
        esc(cf.field || '') +
        '</p><label for="peCfTopic">想了解的问题</label>' +
        '<textarea id="peCfTopic" rows="4" placeholder="例如：该赛道近两年毛利率走势、头部客户切换情况…"></textarea>' +
        '<label for="peCfContact">联系方式</label>' +
        '<input id="peCfContact" placeholder="手机 / 微信 / 邮箱" />' +
        '<div class="xb-contact-flow-actions">' +
        '<button type="button" class="xb-contact-flow-ghost" data-act="closeContactFlow">取消</button>' +
        '<button type="button" class="xb-contact-flow-send" data-act="submitContactFlow" data-arg="book">提交预约</button>' +
        '</div></div></div>'
      );
    }
    if (cf.kind === 'expert-match') {
      return (
        '<div class="xb-contact-flow-mask" data-act="closeContactFlow" role="presentation">' +
        '<div class="xb-contact-flow-modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">' +
        '<h2>匹配专家</h2><p class="xb-contact-flow-hint">描述你的研究诉求与偏好领域，顾问将为你匹配合适专家。</p>' +
        '<label for="peCfTopic">想了解的问题</label>' +
        '<textarea id="peCfTopic" rows="3" placeholder="例如：工业视觉下游客户议价与扩产节奏…"></textarea>' +
        '<label for="peCfPref">偏好领域（可选）</label>' +
        '<input id="peCfPref" placeholder="例如：汽车零部件 / 3C" />' +
        '<label for="peCfContact">联系方式</label>' +
        '<input id="peCfContact" placeholder="手机 / 微信 / 邮箱" />' +
        '<div class="xb-contact-flow-actions">' +
        '<button type="button" class="xb-contact-flow-ghost" data-act="closeContactFlow">取消</button>' +
        '<button type="button" class="xb-contact-flow-send" data-act="submitContactFlow" data-arg="match">提交需求</button>' +
        '</div></div></div>'
      );
    }
    if (cf.kind === 'reporter-request') {
      return (
        '<div class="xb-contact-flow-mask" data-act="closeContactFlow" role="presentation">' +
        '<div class="xb-contact-flow-modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">' +
        '<h2>预约一线调研</h2><p class="xb-contact-flow-hint">提交标的与核实问题，调研专员将与你对接安排。</p>' +
        '<label for="peCfCompany">标的 / 公司</label>' +
        '<input id="peCfCompany" placeholder="企业全称" value="' +
        esc(cf.company || '') +
        '" />' +
        '<label for="peCfTopic">想核实的问题</label>' +
        '<textarea id="peCfTopic" rows="4" placeholder="订单/产能/渠道/回款等">' +
        esc(cf.questions || '') +
        '</textarea>' +
        '<label for="peCfContact">联系方式</label>' +
        '<input id="peCfContact" placeholder="手机 / 微信 / 邮箱" />' +
        '<div class="xb-contact-flow-actions">' +
        '<button type="button" class="xb-contact-flow-ghost" data-act="closeContactFlow">取消</button>' +
        '<button type="button" class="xb-contact-flow-send" data-act="submitContactFlow" data-arg="reporter">提交预约</button>' +
        '</div></div></div>'
      );
    }
    return '';
  }

  function resolveChatById(chatId) {
    var aliases = { c1: 'chat-global-1', c2: 'chat-global-2', c3: 'chat-global-3', c4: 'chat-global-4' };
    var id = aliases[chatId] || chatId;
    var found = null;
    (D().chats || []).forEach(function (c) {
      if (c.id === id || c.id === chatId) found = c;
    });
    if (found) return found;
    var sessions = getState().sessions || {};
    if (sessions[id] || sessions[chatId]) return sessions[id] || sessions[chatId];
    /* 项目内会话也可经 chat/:id 打开 */
    (D().projects || []).forEach(function (p) {
      (p.chats || []).forEach(function (c) {
        if (c.id === id || c.id === chatId) {
          found = {
            id: c.id,
            title: c.title,
            preview: c.preview,
            messages: c.messages,
            projectId: p.id,
          };
        }
      });
    });
    return found;
  }

  function findProjectChat(projectId, preferTitle, preferId) {
    var p = findProject(projectId);
    if (!p || !p.chats || !p.chats.length) return null;
    var i;
    if (preferId) {
      for (i = 0; i < p.chats.length; i++) {
        if (p.chats[i].id === preferId) return p.chats[i];
      }
    }
    if (preferTitle) {
      for (i = 0; i < p.chats.length; i++) {
        if (p.chats[i].title === preferTitle) return p.chats[i];
      }
    }
    /* 传入了 id/title 偏好却都未命中：勿静默落到 chats[0] */
    if (preferId || preferTitle) return null;
    return p.chats[0];
  }

  function cloneMessages(msgs) {
    return (msgs || []).map(function (m) {
      var copy = { role: m.role, text: m.text };
      if (m.cards) copy.cards = m.cards.slice();
      return copy;
    });
  }

  function ensureSessionMessages(chat) {
    if (chat.messages && chat.messages.length) return chat.messages;
    if (chat.projectId) {
      var pc = findProjectChat(chat.projectId, chat.title, chat.projectChatId);
      if (pc && pc.messages && pc.messages.length) return cloneMessages(pc.messages);
    }
    return [
      { role: 'user', text: chat.title },
      {
        role: 'ai',
        text: chat.preview || '已根据上下文整理要点。',
        cards: [
          {
            type: 'flags',
            title: '要点',
            items: ['可从项目 Hub 继续深挖材料与红旗', '需要时可切换到对应场景再跑一轮'],
          },
        ],
      },
    ];
  }

  function chatScenarioChipsHtml() {
    var chips = [
      ['标的速览', '请对当前标的做一页纸速览'],
      ['公开面核查', '请做公开面核查：股权、司法、经营异常'],
      ['材料缺口', '对照尽调清单列材料缺口'],
      ['财报深读', '请对已入库财报做勾稽与红旗扫描'],
      ['尽调报告', '按章节约束起草尽调报告骨架'],
    ];
    return (
      '<div class="xb-composer-tag-row">' +
      '<div class="xb-home-prompt-chips">' +
      chips
        .map(function (c) {
          return (
            '<button type="button" class="xb-home-prompt-chip" data-act="fillChip" data-arg="' +
            esc(c[1]) +
            '" title="' +
            esc(c[0]) +
            '">' +
            esc(c[0]) +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<button type="button" class="xb-composer-scenario-btn" data-nav="scenarios">工作流</button>' +
      '</div>'
    );
  }

  function hubComposerPillsHtml(p) {
    var id = p.id;
    var items = [
      ['project/' + id + '/brief', '公司一页纸'],
      ['project/' + id + '/ubo', '股权与 UBO'],
      ['project/' + id + '/gaps', '材料缺口'],
      ['project/' + id + '/finance', '财报深读'],
      ['project/' + id + '/report', '报告骨架'],
      ['project/' + id + '/ic', 'IC Memo'],
      ['project/' + id + '/debate', '对抗预演'],
      ['project/' + id + '/deliver', '交割进入投后'],
    ];
    return (
      '<div class="xb-composer-tag-row">' +
      '<div class="xb-home-prompt-chips">' +
      items
        .map(function (it) {
          return (
            '<button type="button" class="xb-home-prompt-chip" data-nav="' +
            esc(it[0]) +
            '" title="' +
            esc(it[1]) +
            '">' +
            esc(it[1]) +
            '</button>'
          );
        })
        .join('') +
      '</div></div>'
    );
  }

  function stashChatDraft() {
    var el = (_ctx && _ctx.rootEl && _ctx.rootEl.querySelector('#peChatInput')) || document.getElementById('peChatInput');
    if (el) _local.chatDraft = el.value;
  }

  function rerenderComposer() {
    stashChatDraft();
    PEPages.render(_route, _ctx);
    var el = _ctx && _ctx.rootEl && _ctx.rootEl.querySelector('#peChatInput');
    if (el && typeof el.focus === 'function') {
      el.focus();
      if (typeof el.setSelectionRange === 'function') {
        var n = el.value.length;
        el.setSelectionRange(n, n);
      }
    }
  }

  function composerExpertLabel() {
    if (_local.composerBattleMode) {
      var n = (_local.composerBattleRed || []).length + (_local.composerBattleBlue || []).length;
      return n ? '已选 ' + n + ' 人' : '';
    }
    var ids = _local.composerExpertIds || [];
    if (!ids.length) return '';
    var hit = null;
    for (var i = 0; i < COMPOSER_EXPERTS.length; i++) {
      if (COMPOSER_EXPERTS[i].id === ids[0]) {
        hit = COMPOSER_EXPERTS[i];
        break;
      }
    }
    if (!hit) return ids.length > 1 ? ids.length + ' 位' : '';
    var short = hit.name.replace(/专家$/, '');
    return ids.length > 1 ? short + ' +' + (ids.length - 1) : short;
  }

  function composerExpertDropdownHtml() {
    var battle = !!_local.composerBattleMode;
    var side = _local.composerBattleSide === 'blue' ? 'blue' : 'red';
    var status = '';
    if (battle) {
      var rn = (_local.composerBattleRed || []).length;
      var bn = (_local.composerBattleBlue || []).length;
      var ready = rn > 0 && bn > 0;
      status =
        '<div class="xb-expert-dropdown-status' +
        (ready ? ' is-ready' : '') +
        '">' +
        (ready ? '红蓝双方已就绪，可发送开始对抗' : '请为红方与蓝方各选至少 1 位专家') +
        '</div>';
    }
    function teamRow(s, ids) {
      var chips =
        !ids.length
          ? '<span class="xb-battle-team-empty">未选择</span>'
          : ids
              .map(function (id) {
                var name = id;
                for (var i = 0; i < COMPOSER_EXPERTS.length; i++) {
                  if (COMPOSER_EXPERTS[i].id === id) name = COMPOSER_EXPERTS[i].name.replace(/专家$/, '');
                }
                return (
                  '<span class="xb-battle-team-chip">' +
                  esc(name) +
                  '<button type="button" class="xb-battle-team-chip-remove" data-act="removeBattleExpert" data-arg="' +
                  esc(s) +
                  '" data-arg2="' +
                  esc(id) +
                  '">×</button></span>'
                );
              })
              .join('');
      return (
        '<div class="xb-battle-team-row is-' +
        s +
        '"><span class="xb-battle-team-label">' +
        (s === 'red' ? '红方' : '蓝方') +
        '</span><div class="xb-battle-team-chips">' +
        chips +
        '</div><span class="xb-battle-team-count">' +
        ids.length +
        '/3</span></div>'
      );
    }
    var list = COMPOSER_EXPERTS.map(function (ex) {
      var inRed = (_local.composerBattleRed || []).indexOf(ex.id) >= 0;
      var inBlue = (_local.composerBattleBlue || []).indexOf(ex.id) >= 0;
      var selected = battle ? inRed || inBlue : (_local.composerExpertIds || []).indexOf(ex.id) >= 0;
      var roles = '';
      if (battle && inRed) roles += '<span class="xb-expert-role xb-expert-role--red">红</span>';
      if (battle && inBlue) roles += '<span class="xb-expert-role xb-expert-role--blue">蓝</span>';
      if (!battle && selected) roles += '<span class="xb-expert-role xb-expert-role--extra">已选</span>';
      return (
        '<button type="button" class="xb-expert-dropdown-item xb-expert-dropdown-item--rich' +
        (selected ? ' selected' : '') +
        '" data-act="selectComposerExpert" data-arg="' +
        esc(ex.id) +
        '"><span class="xb-expert-dropdown-text"><strong>' +
        esc(ex.name) +
        roles +
        '</strong><span>' +
        esc(ex.field) +
        '</span></span>' +
        (selected ? '<span class="xb-expert-dropdown-check is-checked" aria-hidden="true"></span>' : '') +
        '</button>'
      );
    }).join('');
    return (
      '<div class="xb-expert-dropdown xb-expert-dropdown--battle" role="listbox">' +
      '<div class="xb-expert-dropdown-header"><div class="xb-expert-dropdown-mode">' +
      '<div class="xb-expert-dropdown-mode-text"><strong>专家 Battle · 红蓝对抗</strong><span>' +
      (battle ? '为红蓝双方选人后即可发送' : '选一位专家提问；开启 Battle 进入红蓝对抗') +
      '</span></div>' +
      '<button type="button" class="xb-toggle-switch' +
      (battle ? ' is-on' : '') +
      '" role="switch" aria-checked="' +
      (battle ? 'true' : 'false') +
      '" data-act="toggleComposerBattle"><span class="xb-toggle-switch-knob"></span></button>' +
      '</div></div>' +
      status +
      (battle
        ? '<div class="xb-battle-side-tabs">' +
          '<button type="button" class="xb-battle-side-tab is-red' +
          (side === 'red' ? ' is-active' : '') +
          '" data-act="setBattleSide" data-arg="red">加入红方</button>' +
          '<button type="button" class="xb-battle-side-tab is-blue' +
          (side === 'blue' ? ' is-active' : '') +
          '" data-act="setBattleSide" data-arg="blue">加入蓝方</button></div>' +
          '<div class="xb-battle-teams">' +
          teamRow('red', _local.composerBattleRed || []) +
          teamRow('blue', _local.composerBattleBlue || []) +
          '</div>'
        : '') +
      '<div class="xb-expert-dropdown-meta">' +
      (battle ? '正在选择' + (side === 'red' ? '红方' : '蓝方') + '专家' : '共 ' + COMPOSER_EXPERTS.length + ' 位平台专家') +
      '</div>' +
      '<div class="xb-expert-dropdown-list">' +
      list +
      '</div>' +
      ((_local.composerExpertIds || []).length || (_local.composerBattleRed || []).length || (_local.composerBattleBlue || []).length
        ? '<div class="xb-expert-dropdown-footer"><button type="button" class="xb-expert-dropdown-clear" data-act="clearComposerExperts">清除已选专家</button></div>'
        : '') +
      '</div>'
    );
  }

  function composerListMenuHtml(kind) {
    var title = kind === 'skill' ? '添加技能' : kind === 'cite' ? '引用材料' : '连接器';
    var items = kind === 'skill' ? COMPOSER_SKILLS : kind === 'cite' ? COMPOSER_CITES : COMPOSER_MCPS;
    var selected =
      kind === 'skill' ? _local.composerSkillIds || [] : kind === 'cite' ? _local.composerCiteIds || [] : _local.composerMcpIds || [];
    var act = kind === 'skill' ? 'toggleComposerSkill' : kind === 'cite' ? 'toggleComposerCite' : 'toggleComposerMcp';
    return (
      '<div class="xb-composer-menu" role="listbox">' +
      '<div class="xb-composer-menu-head">' +
      esc(title) +
      '</div>' +
      '<div class="xb-composer-menu-list">' +
      items
        .map(function (it) {
          var on = selected.indexOf(it.id) >= 0;
          return (
            '<button type="button" class="xb-composer-menu-item' +
            (on ? ' selected' : '') +
            '" data-act="' +
            act +
            '" data-arg="' +
            esc(it.id) +
            '"><strong>' +
            esc(it.name) +
            '</strong><span>' +
            esc(it.desc) +
            '</span></button>'
          );
        })
        .join('') +
      '</div></div>'
    );
  }

  function peComposerHtml(opts) {
    opts = opts || {};
    var toolsOpen = !!_local.composerToolsOpen;
    var menu = _local.composerMenu;
    var expertLabel = composerExpertLabel();
    var hasExpert =
      (_local.composerExpertIds || []).length > 0 ||
      (_local.composerBattleRed || []).length > 0 ||
      (_local.composerBattleBlue || []).length > 0;
    var placeholder = opts.placeholder || '输入问题或上传材料…';
    var sendAttrs = opts.sendAttrs || 'data-act="toast" data-arg="请先打开对话再发送"';
    var tagRow = opts.tagRowHtml || '';
    var draft = _local.chatDraft || '';
    var atts = _local.composerAttachments || [];
    if (atts.length) {
      tagRow +=
        '<div class="xb-composer-attach-row">' +
        atts
          .map(function (name, i) {
            return (
              '<span class="xb-composer-attach-chip">' +
              ico('paperclip') +
              ' ' +
              esc(name) +
              '<button type="button" class="xb-composer-attach-x" data-act="removeComposerAttach" data-arg="' +
              i +
              '" title="移除">×</button></span>'
            );
          })
          .join('') +
        '</div>';
    }

    var tools =
      '<button type="button" class="xb-composer-pill xb-composer-plus' +
      (toolsOpen ? ' active' : '') +
      '" data-act="toggleComposerTools" title="添加工具" aria-label="添加工具" aria-expanded="' +
      (toolsOpen ? 'true' : 'false') +
      '">' +
      ico('plus') +
      '</button>';

    if (toolsOpen) {
      tools +=
        '<button type="button" class="xb-composer-pill xb-composer-pill-icon" data-act="attachHint" title="附件" aria-label="附件">' +
        ico('paperclip') +
        '</button>' +
        '<button type="button" class="xb-composer-pill' +
        (menu === 'cite' || (_local.composerCiteIds || []).length ? ' active' : '') +
        '" data-act="toggleComposerMenu" data-arg="cite">' +
        ico('link') +
        '<span>引用</span></button>' +
        '<button type="button" class="xb-composer-pill' +
        (menu === 'skill' || (_local.composerSkillIds || []).length ? ' active' : '') +
        '" data-act="toggleComposerMenu" data-arg="skill">' +
        ico('zap') +
        '<span>技能</span></button>' +
        '<button type="button" class="xb-composer-pill' +
        (menu === 'expert' || hasExpert ? ' active' : '') +
        (_local.composerBattleMode && hasExpert ? ' xb-composer-pill--battle' : '') +
        '" data-act="toggleComposerMenu" data-arg="expert">' +
        ico('user') +
        '<span>专家</span>' +
        (expertLabel ? '<span class="xb-composer-pill-extra">' + esc(expertLabel) + '</span>' : '') +
        '</button>' +
        '<button type="button" class="xb-composer-pill' +
        (menu === 'mcp' || (_local.composerMcpIds || []).length ? ' active' : '') +
        '" data-act="toggleComposerMenu" data-arg="mcp">' +
        ico('plug') +
        '<span>连接器</span></button>';
    }

    var float = '';
    if (menu === 'expert') float = composerExpertDropdownHtml();
    else if (menu === 'skill' || menu === 'cite' || menu === 'mcp') float = composerListMenuHtml(menu);

    return (
      '<div class="xb-composer-dock">' +
      tagRow +
      '<div class="xb-composer-wrap">' +
      (float
        ? '<div class="xb-composer-popover-backdrop" data-act="closeComposerMenu" aria-hidden="true"></div><div class="xb-composer-float">' +
          float +
          '</div>'
        : '') +
      '<div class="composer-card xb-composer-card" style="margin:0">' +
      '<textarea class="composer-textarea xb-composer-textarea" id="peChatInput" rows="2" placeholder="' +
      esc(placeholder) +
      '">' +
      esc(draft) +
      '</textarea>' +
      '<div class="composer-bottom xb-composer-bottom">' +
      '<div class="composer-pills xb-composer-pills">' +
      tools +
      '</div>' +
      '<button type="button" class="composer-send xb-composer-send active" ' +
      sendAttrs +
      ' title="发送" aria-label="发送">' +
      ico('send') +
      '</button>' +
      '</div></div>' +
      '<div class="xb-chat-ai-disclaimer">内容由AI生成，请注意甄别！</div>' +
      '</div></div>'
    );
  }

  function composerDockHtml(p, chatId) {
    var sendAttrs = chatId
      ? 'data-act="sendProjectChat" data-arg="' + esc(p.id) + '" data-arg2="' + esc(chatId) + '"'
      : 'data-act="askProject" data-arg="' + esc(p.id) + '"';
    return peComposerHtml({
      placeholder: '关于 ' + (p.company || p.name) + '，输入问题或上传材料…',
      sendAttrs: sendAttrs,
      tagRowHtml: chatId ? chatScenarioChipsHtml() : hubComposerPillsHtml(p),
    });
  }

  function standaloneChatBarHtml(chat) {
    return (
      '<div class="xb-chat-project-bar">' +
      '<div class="xb-chat-project-bar-title"><strong>' +
      esc(chat.title) +
      '</strong><span>' +
      esc(chat.preview || '对话') +
      '</span></div>' +
      '<div class="xb-chat-project-bar-actions">' +
      '<button type="button" class="btn btn-ghost" data-act="newStandaloneSession" data-arg="' +
      esc(chat.id) +
      '">新会话</button>' +
      (chat.projectId
        ? '<button type="button" class="btn btn-ghost" data-nav="project/' +
          esc(chat.projectId) +
          '">打开项目</button>'
        : '<button type="button" class="btn btn-ghost" data-nav="chats">全部对话</button>') +
      '</div></div>'
    );
  }

  function bindCfgSubjectEditors(root) {
    if (!_route || _route !== 'config-center') return;
    var stdId = _local.cfgStandard;
    if (!stdId) return;
    var store = window.CFG_CENTER_CRUD;
    if (!store) return;

    root.querySelectorAll('[data-cfg-field]').forEach(function (el) {
      var field = el.getAttribute('data-cfg-field');
      var subjId = el.getAttribute('data-arg');
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', function () {
          store.saveSubjectField(stdId, subjId, field, el.value);
          if (field === 'stmt') _local.cfgSubjStmt = el.value;
          navigate('config-center');
        });
      } else {
        el.addEventListener('blur', function () {
          store.saveSubjectField(stdId, subjId, field, el.value.trim());
        });
        if (el.tagName !== 'TEXTAREA') {
          el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
          });
        }
      }
    });
  }

  function bindFinanceConfigEditors(root) {
    if (!_route || _route !== 'finance-config') return;
    var cfg = getActiveFinanceConfig();
    if (!cfg || cfg.scope !== 'user') return;

    function saveSubject(id, field, value) {
      var hit = null;
      (cfg.subjects || []).forEach(function (s) {
        if (s.id === id) hit = s;
      });
      if (!hit) return;
      var next = (value || '').trim();
      if (field === 'stmt') {
        if (hit.stmt === next) return;
        hit.stmt = next;
        _local.finStmt = next;
        toast('已保存');
        navigate('finance-config');
        return;
      }
      if (field === 'name') {
        if (!next || hit.name === next) return;
        hit.name = next;
        toast('已保存');
        return;
      }
      if (field === 'aliases') {
        if ((hit.aliases || '') === next) return;
        hit.aliases = next;
        toast('已保存');
      }
    }

    function saveMetric(id, field, value) {
      var hit = null;
      (cfg.metrics || []).forEach(function (m) {
        if (m.id === id) hit = m;
      });
      if (!hit) return;
      var next = (value || '').trim();
      if (field === 'name') {
        if (!next || hit.name === next) return;
        hit.name = next;
        toast('已保存');
        return;
      }
      if ((hit[field] || '') === next) return;
      hit[field] = next;
      toast('已保存');
    }

    root.querySelectorAll('[data-fin-field]').forEach(function (el) {
      var field = el.getAttribute('data-fin-field');
      var id = el.getAttribute('data-arg');
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', function () {
          saveSubject(id, field, el.value);
        });
      } else {
        el.addEventListener('blur', function () {
          saveSubject(id, field, el.value);
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            el.blur();
          }
        });
      }
    });

    root.querySelectorAll('[data-fin-mfield]').forEach(function (el) {
      var field = el.getAttribute('data-fin-mfield');
      var id = el.getAttribute('data-arg');
      el.addEventListener('blur', function () {
        saveMetric(id, field, el.value);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.blur();
        }
      });
    });

    var renameEl = root.querySelector('#peFinRename');
    if (renameEl) {
      renameEl.focus();
      if (typeof renameEl.select === 'function') renameEl.select();
      renameEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          PEPages.act('confirmFinRename');
        }
        if (e.key === 'Escape') PEPages.act('cancelFinRename');
      });
    }
  }

  function bindNav(root) {
    root.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var r = el.getAttribute('data-nav');
        if (r) navigate(r);
      });
    });
  }

  function bindActions(root) {
    root.querySelectorAll('[data-act]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var act = el.getAttribute('data-act');
        var arg = el.getAttribute('data-arg') || '';
        var arg2 = el.getAttribute('data-arg2') || '';
        PEPages.act(act, arg, arg2);
      });
    });
    root.querySelectorAll('[data-stop]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });
  }

  /* ——— pages ——— */

  function pageHome() {
    var data = D();
    var peRole = (getState().peRole || 'investment');
    var isPost = peRole === 'post';
    var chips = isPost ? (data.postChips || []) : (data.chips || []);
    var todos = isPost ? (data.postTodos || []) : (data.todos || []);
    var draft = _local.homeDraft || (getState().homeDraft || '');

    var eyebrow = isPost ? '管理组合，上财跃启明星' : '做尽调，上财跃启明星';
    var headline = isPost ? '今天要处理哪个项目？' : '最近想尽调什么？';
    var leadHtml = isPost
      ? '<span>经营包解析</span><span class="home-lead-sep">·</span><span>估值跟踪</span><span class="home-lead-sep">·</span><span>AI异常预警</span>'
      : '<span>一线调研实地核实</span><span class="home-lead-sep">·</span><span>38万+专家纪要</span><span class="home-lead-sep">·</span><span>AI专家即时研判</span>';
    var placeholder = isPost
      ? '输入企业名、上传经营包，或描述投后问题…'
      : '输入企业名、问题或上传材料后开始尽调…';
    var sendLabel = isPost ? '开始处理' : '开始尽调';

    var chipHtml = chips
      .map(function (c) {
        return (
          '<button type="button" class="prompt-chip" data-act="fillChip" data-arg="' +
          esc(c.text) +
          '">' +
          esc(c.label) +
          '</button>'
        );
      })
      .join('');

    var todoHtml = todos
      .map(function (t) {
        return (
          '<button type="button" class="todo-item" data-act="onTodo" data-arg="' +
          esc(t.id) +
          '">' +
          '<div><div class="title">' +
          esc(t.title) +
          '</div><div class="desc">' +
          esc(t.desc) +
          '</div><div class="meta"><span class="tag ' +
          esc(t.tagClass || '') +
          '">' +
          esc(t.tag) +
          '</span></div></div>' +
          '<span class="todo-cta">' +
          esc(t.cta) +
          ' →</span></button>'
        );
      })
      .join('');

    return (
      '<div class="home-page page-scroll">' +
      '<div class="home-stage">' +
      '<div class="home-hero">' +
      '<p class="home-eyebrow">' + esc(eyebrow) + '</p>' +
      '<h1 class="home-headline">' + esc(headline) + '</h1>' +
      '<p class="home-lead">' + leadHtml + '</p>' +
      '</div>' +
      '<div class="chip-row">' +
      chipHtml +
      '</div>' +
      '<div class="xb-composer-wrap xb-home-composer-wrap">' +
      (_local.homePlusMenuOpen
        ? '<div class="xb-composer-popover-backdrop" data-act="closeHomePlusMenu" aria-hidden="true"></div>' +
          '<div class="xb-composer-float xb-home-plus-float">' +
          '<div class="xb-composer-menu" role="menu">' +
          '<div class="xb-composer-menu-head">添加能力</div>' +
          '<div class="xb-composer-menu-list">' +
          '<button type="button" class="xb-composer-menu-item" data-act="homeOpenMarket" data-arg="skills">' +
          '<strong>' +
          ico('zap') +
          ' 技能</strong><span>打开能力市场 · 技能</span></button>' +
          '<button type="button" class="xb-composer-menu-item" data-act="homeOpenMarket" data-arg="experts">' +
          '<strong>' +
          ico('user') +
          ' 专家</strong><span>打开能力市场 · 专家/Agent</span></button>' +
          '<button type="button" class="xb-composer-menu-item" data-act="homeOpenMarket" data-arg="connectors">' +
          '<strong>' +
          ico('plug') +
          ' 连接器</strong><span>打开能力市场 · 连接器</span></button>' +
          '</div></div></div>'
        : '') +
      '<div class="composer-card">' +
      '<textarea class="composer-textarea" id="peHomeInput" rows="3" placeholder="' + esc(placeholder) + '">' +
      esc(draft) +
      '</textarea>' +
      '<div class="composer-bottom">' +
      '<div class="composer-pills xb-composer-pills">' +
      '<button type="button" class="xb-composer-pill xb-composer-plus' +
      (_local.homePlusMenuOpen ? ' active' : '') +
      '" data-act="toggleHomePlusMenu" title="添加工具" aria-label="添加工具" aria-expanded="' +
      (_local.homePlusMenuOpen ? 'true' : 'false') +
      '">' +
      ico('plus') +
      '</button>' +
      '<button type="button" class="xb-composer-pill" data-act="homeOpenMarket" data-arg="skills" title="能力市场">' +
      ico('zap') +
      '<span>能力市场</span>' +
      '</button>' +
      '</div>' +
      '<button type="button" class="composer-send btn-primary" id="peHomeSend" data-act="startDiligence">' + esc(sendLabel) + '</button>' +
      '</div></div></div>' +
      '<div class="todo-block">' +
      '<div class="todo-head"><h2>' + (isPost ? '待处理事项' : '待办建议') + ' <span style="font-weight:500;color:var(--xb-faint)">· ' +
      todos.length +
      ' 条</span></h2><span>点一条，填入对话或打开项目</span></div>' +
      '<div class="todo-list">' +
      todoHtml +
      '</div></div>' +
      recentChatsHome() +
      '</div></div>'
    );
  }

  function recentChatsHome() {
    var chats = (D().chats || []).slice(0, 5);
    if (!chats.length) return '';
    var rows = chats
      .map(function (c) {
        return (
          '<button type="button" class="chat-row" data-act="openGlobalChat" data-arg="' +
          esc(c.id) +
          '" style="border:1px solid var(--xb-line);margin-bottom:8px">' +
          '<strong>' +
          esc(c.title) +
          '</strong><span>' +
          esc(c.time || '') +
          ' · ' +
          esc(c.preview || '') +
          '</span></button>'
        );
      })
      .join('');
    return (
      '<div class="todo-block" style="margin-top:8px">' +
      '<div class="todo-head"><h2>最近对话</h2>' +
      '<button type="button" class="btn btn-ghost" style="height:28px" data-nav="chats">全部</button></div>' +
      rows +
      '</div>'
    );
  }

  function pageProjects() {
    var q = (_local.projectFilter || '').toLowerCase();
    var list = (D().projects || []).filter(function (p) {
      if (!q) return true;
      return (
        p.name.toLowerCase().indexOf(q) >= 0 ||
        p.company.indexOf(_local.projectFilter) >= 0
      );
    });
    var cards = list
      .map(function (p) {
        return (
          '<button type="button" class="xb-project-card" data-nav="project/' +
          esc(p.id) +
          '"><strong>' +
          esc(p.name) +
          '</strong><div class="co">' +
          esc(p.company) +
          '</div><div class="meta-row"><span class="tag ' +
          statusClass(p.status) +
          '">' +
          esc(p.status) +
          '</span><span>' +
          esc(p.updated) +
          '</span></div><div style="margin-top:8px;font-size:12px;color:var(--xb-muted)">' +
          esc(p.todo) +
          '</div>' +
          (p.status !== '投后' && p.status !== '已投资'
            ? '<button type="button" class="xb-btn-sm" style="margin-top:8px;font-size:11px" ' +
              'data-act="deliverProject" data-act-arg="' + esc(p.id) + '" ' +
              'onclick="event.stopPropagation()">标记为已投</button>'
            : '') +
          '</button>'
        );
      })
      .join('');

    var modal = '';
    if (_local.createProjectOpen) {
      modal =
        '<div class="xb-modal-mask" data-act="closeCreateProject">' +
        '<div class="xb-modal" onclick="event.stopPropagation()">' +
        '<h3>创建尽调项目</h3>' +
        '<p class="hint">填写企业全称即可建档；创建后将进入该项目的新会话。</p>' +
        '<label>企业全称</label>' +
        '<input id="peNewCompany" placeholder="例如：苏州某某科技有限公司" />' +
        '<label>项目名称（可选）</label>' +
        '<input id="peNewProjName" placeholder="不填则自动生成" />' +
        '<div class="xb-modal-actions">' +
        '<button type="button" class="btn btn-ghost" data-act="closeCreateProject">取消</button>' +
        '<button type="button" class="btn btn-primary" data-act="submitCreateProject">创建</button>' +
        '</div></div></div>';
    }

    return (
      toolbar(
        '项目',
        '<input class="search" id="peProjSearch" placeholder="搜索项目名称或企业…" value="' +
          esc(_local.projectFilter) +
          '" />' +
          '<button type="button" class="btn btn-primary" data-act="openCreateProject">+ 新项目</button>'
      ) +
      '<div class="page-body"><p class="xb-feature-lead">尽调项目工作台：企业信息、材料、报告与协作会话</p>' +
      '<div class="xb-project-cards">' +
      (cards || '<div class="empty-hint">暂无项目</div>') +
      '</div></div>' +
      modal
    );
  }

  function pagePostList() {
    var list = (D().projects || []).filter(function (p) {
      return p.status === '投后' || p.status === '已投资';
    });
    var q = (_local.postFilter || '').toLowerCase();
    if (q) {
      list = list.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) >= 0;
      });
    }

    /* triage sort: pending proposals first, then silence (older updated date first) */
    list = list.slice().sort(function (a, b) {
      var pa = ((a.postState || {}).proposals || []).filter(function (x) { return x.status === 'pending'; }).length;
      var pb = ((b.postState || {}).proposals || []).filter(function (x) { return x.status === 'pending'; }).length;
      if (pb !== pa) return pb - pa;
      /* fallback: older updated date = more silent = higher priority */
      return (a.updated || '').localeCompare(b.updated || '');
    });

    /* simulate last-contact silence in days from updated field (MM-DD format) */
    function silenceDays(p) {
      var u = p.updated || '';
      if (!u) return 0;
      var parts = u.split('-');
      if (parts.length < 2) return 0;
      var month = parseInt(parts[0], 10);
      var day = parseInt(parts[1], 10);
      /* today is 2026-07-27 per session context */
      var today = new Date(2026, 6, 27);
      var d = new Date(2026, month - 1, day);
      return Math.max(0, Math.round((today - d) / 86400000));
    }

    function healthColor(pending, silence) {
      if (pending > 0 || silence > 20) return '#e53935';
      if (silence > 10) return '#f59e0b';
      return '#16a34a';
    }
    function healthLabel(pending, silence) {
      if (pending > 0) return '需处理';
      if (silence > 20) return '久未接触';
      if (silence > 10) return '关注';
      return '正常';
    }

    /* simple runway lookup from chats KPI rows */
    function getRunway(p) {
      var chats = p.chats || [];
      for (var i = 0; i < chats.length; i++) {
        var msgs = chats[i].messages || [];
        for (var j = 0; j < msgs.length; j++) {
          var cards = msgs[j].cards || [];
          for (var k = 0; k < cards.length; k++) {
            var rows = cards[k].rows || [];
            for (var r = 0; r < rows.length; r++) {
              if (rows[r][0] === '现金跑道') return rows[r][1];
            }
          }
        }
      }
      return '—';
    }

    var cards = list
      .map(function (p) {
        var ps = p.postState || {};
        var pending = (ps.proposals || []).filter(function (x) {
          return x.status === 'pending';
        }).length;
        var silence = silenceDays(p);
        var hColor = healthColor(pending, silence);
        var hLabel = healthLabel(pending, silence);
        var runway = getRunway(p);
        var staleMats = (p.materials || []).filter(function (m) { return m.status === '待更新'; }).length;
        return (
          '<div class="panel" style="padding:14px;margin-bottom:12px;border-left:3px solid ' + hColor + '">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">' +
          '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-weight:600;font-size:15px">' + esc(p.name) + '</span>' +
          '<span style="font-size:11px;font-weight:600;color:' + hColor + '">' + hLabel + '</span>' +
          '</div>' +
          '<div style="color:var(--xb-muted);font-size:12px;margin-top:2px">' + esc(p.company) + '</div>' +
          '</div>' +
          '<span class="tag post">' + esc(p.status) + '</span>' +
          '</div>' +
          /* key stats row */
          '<div class="hub-grid" style="margin-top:10px">' +
          '<div><div class="muted">轮次</div><strong>' + esc(ps.round || '—') + '</strong></div>' +
          '<div><div class="muted">投资额</div><strong>' + esc(ps.amount || '—') + '</strong></div>' +
          '<div><div class="muted">估值</div><strong>' + esc(ps.valuation || '—') + '</strong></div>' +
          '<div><div class="muted">持股</div><strong>' + esc(ps.stake || '—') + '</strong></div>' +
          '</div>' +
          /* LP快答 row */
          '<div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:var(--xb-muted);border-top:1px solid var(--xb-border);padding-top:8px">' +
          '<span>现金跑道 <strong style="color:var(--xb-text)">' + esc(runway) + '</strong></span>' +
          '<span>距上次接触 <strong style="color:' + hColor + '">' + silence + ' 天</strong></span>' +
          (staleMats ? '<span style="color:#f59e0b">材料待更新 ' + staleMats + ' 份</span>' : '') +
          '</div>' +
          /* alert badges */
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' +
          (pending ? '<span class="tag warn">待确认提案 ' + pending + '</span>' : '') +
          '</div>' +
          /* actions */
          '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' +
          '<button type="button" class="btn btn-primary" data-act="openPostDetail" data-arg="' + esc(p.id) + '">投后详情</button>' +
          '<button type="button" class="btn btn-ghost" data-act="postQuickAction" data-arg="brief" data-arg2="' + esc(p.id) + '">生成简报</button>' +
          '<button type="button" class="btn btn-ghost" data-act="postQuickAction" data-arg="valuation" data-arg2="' + esc(p.id) + '">更新估值</button>' +
          '<button type="button" class="btn btn-ghost" data-act="postQuickAction" data-arg="news" data-arg2="' + esc(p.id) + '">扫描舆情</button>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    var pendingAll = list.reduce(function (n, p) {
      return n + ((p.postState || {}).proposals || []).filter(function (x) { return x.status === 'pending'; }).length;
    }, 0);

    return (
      toolbar(
        '投后项目',
        '<input class="search" id="pePostSearch" placeholder="搜索投后项目…" value="' +
          esc(_local.postFilter) +
          '" />'
      ) +
      '<div class="page-body">' +
      (pendingAll > 0
        ? '<div class="panel" style="padding:10px 14px;margin-bottom:14px;background:rgba(229,57,53,.06);border:1px solid rgba(229,57,53,.2);display:flex;align-items:center;gap:10px"><span style="color:#e53935;font-weight:600">⚠ 待处理事项</span><span style="font-size:13px;color:var(--xb-muted)">共 ' + pendingAll + ' 条估值/数据更新提案待确认</span></div>'
        : '') +
      (cards || '<div class="empty-hint">暂无投后项目</div>') +
      '</div>'
    );
  }

  function pagePostDetail(projectId) {
    var p = findProject(projectId);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var ps = p.postState || {
      round: '—',
      amount: '—',
      valuation: '—',
      stake: '—',
      fund: '—',
      timeline: [],
      proposals: [],
      brief: '暂无简报',
    };

    var pendingProposals = (ps.proposals || []).filter(function (pr) {
      return pr.status === 'pending';
    });
    var staleMats = (p.materials || []).filter(function (m) { return m.status === '待更新'; });
    var lastTimeline = (ps.timeline || []).slice(-1)[0];

    /* 今日待办 section */
    var todayTodos = [];
    if (pendingProposals.length > 0) {
      todayTodos.push(pendingProposals.length + ' 条 AI 估值/数据更新提案待确认');
    }
    if (staleMats.length > 0) {
      todayTodos.push(staleMats.map(function (m) { return m.name; }).join('、') + ' 材料待更新');
    }
    /* upcoming: next board meeting / milestone from profile */
    if (p.todo && p.todo !== '无') {
      todayTodos.push(p.todo);
    }

    var todayBlock = todayTodos.length > 0
      ? '<div class="panel" style="padding:12px 16px;margin-bottom:14px;background:rgba(99,102,241,.05);border:1px solid rgba(99,102,241,.2)">' +
        '<div style="font-weight:600;font-size:13px;color:var(--xb-accent);margin-bottom:8px">今日待办</div>' +
        todayTodos.map(function (t) {
          return '<div style="font-size:13px;display:flex;align-items:flex-start;gap:8px;margin-bottom:4px">' +
            '<span style="color:var(--xb-accent);margin-top:1px">·</span><span>' + esc(t) + '</span></div>';
        }).join('') +
        '</div>'
      : '';

    var props = (ps.proposals || [])
      .map(function (pr) {
        if (pr.status === 'rejected') return '';
        var done = pr.status === 'confirmed';
        var fieldLabels = { valuation: '估值', stake: '持股', amount: '投资额', round: '轮次' };
        return (
          '<div class="panel" style="padding:12px;margin-bottom:10px">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
          '<div>' +
          '<strong>' + esc(fieldLabels[pr.field] || pr.field) + '</strong>' +
          '<span style="font-size:12px;color:var(--xb-muted);margin-left:8px">AI 置信度 ' + esc(pr.confidence) + '</span>' +
          '</div>' +
          '<span class="tag ' + (done ? 'ok' : 'warn') + '">' + (done ? '已确认' : '待确认') + '</span>' +
          '</div>' +
          '<div style="margin-top:8px;font-size:13px">' +
          esc(pr.oldVal) + ' → <strong>' + esc(pr.newVal) + '</strong>' +
          '</div>' +
          '<div style="margin-top:6px;font-size:12px;color:var(--xb-muted)">' + esc(pr.reason) + '</div>' +
          (done
            ? ''
            : '<div style="margin-top:10px;display:flex;gap:8px">' +
              '<button type="button" class="btn btn-primary" data-act="confirmProposal" data-arg="' + esc(p.id) + '" data-arg2="' + esc(pr.id) + '">确认写入</button>' +
              '<button type="button" class="btn btn-ghost" data-act="rejectProposal" data-arg="' + esc(p.id) + '" data-arg2="' + esc(pr.id) + '">驳回</button>' +
              '</div>') +
          '</div>'
        );
      })
      .join('');

    var tl = (ps.timeline || [])
      .map(function (t) {
        return (
          '<div class="mat-row"><span>' + esc(t.date) + '</span><span>' + esc(t.event) + '</span></div>'
        );
      })
      .join('');

    var mats = (p.materials || [])
      .map(function (m) {
        var isStale = m.status === '待更新';
        return (
          '<div class="mat-row">' +
          '<span>' + esc(m.name) + '</span>' +
          '<span class="tag' + (isStale ? ' warn' : '') + '">' + esc(m.status) + '</span>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="detail-head">' +
      '<div style="flex:1;min-width:0">' +
      crumb([
        { label: '投后项目', route: 'post' },
        { label: p.name },
      ]) +
      '<h1>' + esc(p.name) + ' · 投后</h1>' +
      '<div class="sub">' + esc(ps.fund || '') + ' · ' + esc(p.company) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
      '<button type="button" class="btn btn-ghost" data-act="postQuickAction" data-arg="brief" data-arg2="' + esc(p.id) + '">生成简报</button>' +
      '<button type="button" class="btn btn-ghost" data-act="postQuickAction" data-arg="news" data-arg2="' + esc(p.id) + '">扫描舆情</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="post">返回列表</button>' +
      '</div>' +
      '</div>' +
      '<div class="page-body">' +
      todayBlock +
      '<div class="hub-grid" style="margin-bottom:14px">' +
      '<div class="panel" style="padding:12px"><div class="muted">轮次</div><strong>' + esc(ps.round) + '</strong></div>' +
      '<div class="panel" style="padding:12px"><div class="muted">投资额</div><strong>' + esc(ps.amount) + '</strong></div>' +
      '<div class="panel" style="padding:12px"><div class="muted">估值</div><strong id="postVal">' + esc(ps.valuation) + '</strong></div>' +
      '<div class="panel" style="padding:12px"><div class="muted">持股</div><strong id="postStake">' + esc(ps.stake) + '</strong></div>' +
      '</div>' +
      '<div class="split">' +
      '<div class="panel" style="padding:12px">' +
      '<h3>AI 数据更新提案</h3>' +
      (props || '<div class="empty-hint">暂无待确认提案</div>') +
      '</div>' +
      '<div class="panel" style="padding:12px">' +
      '<h3>经营简报</h3>' +
      '<p style="line-height:1.55;color:var(--xb-text);font-size:14px">' + esc(ps.brief || '') + '</p>' +
      '<div style="margin-top:12px;display:flex;gap:8px">' +
      '<button type="button" class="btn btn-ghost" style="font-size:12px" data-act="postQuickAction" data-arg="brief" data-arg2="' + esc(p.id) + '">重新生成</button>' +
      '</div>' +
      '<h3 style="margin-top:16px">投后时间线</h3>' +
      (tl || '<div class="empty-hint">暂无记录</div>') +
      '<h3 style="margin-top:16px">材料</h3>' +
      (mats || '<div class="empty-hint">暂无材料</div>') +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function hubLinks(p) {
    var id = p.id;
    var items = [
      ['project/' + id + '/brief', '公司一页纸'],
      ['project/' + id + '/ubo', '股权与 UBO'],
      ['project/' + id + '/gaps', '材料缺口'],
      ['project/' + id + '/finance', '财报深读'],
      ['project/' + id + '/report', '报告骨架'],
      ['project/' + id + '/ic', 'IC Memo'],
      ['project/' + id + '/debate', '对抗预演'],
      ['project/' + id + '/deliver', '交割进入投后'],
    ];
    return items
      .map(function (it) {
        return (
          '<button type="button" class="more-card" data-nav="' +
          esc(it[0]) +
          '"><strong>' +
          esc(it[1]) +
          '</strong><span>打开</span></button>'
        );
      })
      .join('');
  }

  function fileTreeHtml(p, opts) {
    opts = opts || {};
    var filesOpen = _local.filesOpen !== false;
    if (!filesOpen) {
      return (
        '<div class="xb-project-files-column is-collapsed" aria-label="project-files">' +
        '<button type="button" class="xb-files-expand-fab" data-act="toggleFilesPane" title="展开文件栏" aria-label="展开文件栏">' +
        ico('chevronRight') +
        '</button></div>'
      );
    }
    var tree = p.fileTree || D().defaultFileTree || [];
    var openFolder = _local.openFolder || 'BP';
    var folders = tree
      .map(function (f) {
        var open = openFolder === f.folder;
        var files = '';
        if (open) {
          files = (f.files || [])
            .map(function (file) {
              return (
                '<div class="xb-files-file" data-act="openFilePreview" data-arg="' +
                esc(file.id) +
                '" data-arg2="' +
                esc(file.name) +
                '">' +
                esc(file.name) +
                '</div>'
              );
            })
            .join('');
          if (!files) files = '<div class="xb-files-file is-muted">暂无文件</div>';
        }
        return (
          '<button type="button" class="xb-files-folder' +
          (open ? ' is-open' : '') +
          '" data-act="toggleFolder" data-arg="' +
          esc(f.folder) +
          '"><span class="xb-files-folder-label">' +
          ico(open ? 'chevronDown' : 'chevronRight') +
          '<span>' +
          esc(f.folder) +
          '</span></span><span class="xb-files-folder-count">' +
          (f.count != null ? f.count : (f.files || []).length) +
          '</span></button>' +
          files
        );
      })
      .join('');
    return (
      '<div class="xb-project-files-column" aria-label="project-files">' +
      '<aside class="xb-files-pane">' +
      '<div class="xb-files-head"><span>文件</span>' +
      '<button type="button" class="xb-files-collapse-btn" data-act="toggleFilesPane" title="收起文件栏" aria-label="收起文件栏">' +
      ico('chevronLeft') +
      '</button></div>' +
      '<div class="xb-files-tree-scroll">' +
      '<div class="xb-files-sec">团队共享 · 全员可见</div>' +
      folders +
      '<div class="xb-files-sec">我的草稿</div>' +
      '<div class="xb-files-file is-muted">暂无草稿</div>' +
      '</div>' +
      '<button type="button" class="xb-files-upload-btn" data-act="uploadMaterial" data-arg="' +
      esc(p.id) +
      '">' +
      ico('plus') +
      ' 上传</button>' +
      '</aside></div>'
    );
  }

  function workspaceClass(hasRight) {
    var isOcr = _local.rightPaneKind === 'ocr';
    var isReport = _local.rightPaneKind === 'report';
    return (
      'xb-project-workspace' +
      (hasRight ? ' has-right' : '') +
      (isOcr ? ' is-ocr-wide' : '') +
      (isReport ? ' has-report-ev' : '') +
      (_local.filesOpen === false ? ' files-collapsed' : '')
    );
  }

  function renderPeOcrArtifact(p) {
    var sheet = _local.ocrSheet || 'bs';
    var dataTab = _local.ocrDataTab || 'data';
    var confirmed = !!_local.ocrConfirmed;
    var sheets = [
      { id: 'bs', label: '资产负债表' },
      { id: 'is', label: '利润表' },
      { id: 'cf', label: '现金流量表' }
    ];
    var rows = [
      { seq: '', name: '流动资产', header: true },
      { seq: '1', name: '货币资金', val: '12,045.00' },
      { seq: '2', name: '应收账款', val: '68,634.15' },
      { seq: '3', name: '存货', val: '21,008.80' },
      { seq: '', name: '资产总计', val: '218,000.00', header: true }
    ];
    var previewLines = [
      { n: '货币资金', v: '12,045.00', hi: _local.ocrHi === '货币资金' },
      { n: '应收账款', v: '68,634.15', hi: _local.ocrHi === '应收账款' },
      { n: '存货', v: '21,008.80', hi: false },
      { n: '流动资产合计', v: '121,467.34', hi: false },
      { n: '资产总计', v: '218,000.00', hi: false }
    ];
    var sheetLabel = (sheets.find(function (s) {
      return s.id === sheet;
    }) || sheets[0]).label;
    return (
      '<div class="bk-ocr-detail">' +
      '<div class="bk-ocr-detail-top">' +
      '<div class="bk-ocr-title-wrap"><h5>' +
      esc(p.company || p.name) +
      ' · 审计报告_2024（扫描）</h5>' +
      '<p>财报 OCR 校对 · ' +
      (confirmed ? '已确认' : '待确认') +
      '</p></div>' +
      '<div class="bk-ocr-trial-banner ' +
      (confirmed ? 'ok' : 'warn') +
      '">' +
      (confirmed ? '试算通过 · 已提交' : '试算差 1 项 · 流动资产合计') +
      '</div>' +
      '<div class="bk-ocr-actions">' +
      '<button type="button" class="bk-mini-btn" data-act="ocrRerun">重新识别</button>' +
      '<button type="button" class="bk-mini-btn" data-act="toast" data-arg="已暂存">暂存</button>' +
      '<button type="button" class="bk-mini-btn primary" data-act="ocrConfirm">提交确认</button>' +
      '</div></div>' +
      '<div class="bk-ocr-sheet-bar">' +
      sheets
        .map(function (s) {
          return (
            '<button type="button" class="bk-ocr-sheet-tab' +
            (sheet === s.id ? ' active' : '') +
            '" data-act="ocrSheet" data-arg="' +
            s.id +
            '">' +
            s.label +
            '</button>'
          );
        })
        .join('') +
      '<span class="bk-ocr-sheet-hint">左侧对照原表，右侧编辑；点「定位」在左侧高亮溯源</span>' +
      '</div>' +
      '<div class="bk-ocr-two-col">' +
      '<div class="bk-ocr-preview-col">' +
      '<div class="bk-ocr-preview-toolbar"><span>原始财报 · 第 1 / 12 页</span>' +
      '<div class="bk-ocr-preview-toolbar-btns">' +
      '<button type="button" data-act="toast" data-arg="已旋转" title="旋转">↺</button>' +
      '<button type="button" data-act="toast" data-arg="已缩小" title="缩小">−</button>' +
      '<button type="button" data-act="toast" data-arg="已放大" title="放大">+</button>' +
      '<button type="button" data-act="toast" data-arg="上一页" title="上一页">‹</button>' +
      '<button type="button" data-act="toast" data-arg="下一页" title="下一页">›</button>' +
      '</div></div>' +
      '<div class="bk-ocr-preview-body"><div class="bk-ocr-preview-page">' +
      '<h6>' +
      esc(sheetLabel) +
      '</h6>' +
      '<div class="bk-ocr-pdf-meta">单位：万元 · 合并报表</div>' +
      '<div class="bk-ocr-preview-grid">' +
      previewLines
        .map(function (ln) {
          return (
            '<div class="bk-ocr-preview-line' +
            (ln.hi ? ' hi' : '') +
            '"><span class="n">' +
            esc(ln.n) +
            '</span><span class="v">' +
            esc(ln.v) +
            '</span></div>'
          );
        })
        .join('') +
      '</div></div></div></div>' +
      '<div class="bk-ocr-data-col">' +
      '<div class="bk-ocr-data-subtabs">' +
      '<button type="button" class="bk-ocr-data-subtab' +
      (dataTab === 'data' ? ' active' : '') +
      '" data-act="ocrDataTab" data-arg="data">财报数据</button>' +
      '<button type="button" class="bk-ocr-data-subtab' +
      (dataTab === 'trial' ? ' active' : '') +
      '" data-act="ocrDataTab" data-arg="trial">试算平衡<span class="bk-ocr-sub-badge">1</span></button>' +
      '<button type="button" class="bk-ocr-data-subtab' +
      (dataTab === 'log' ? ' active' : '') +
      '" data-act="ocrDataTab" data-arg="log">修改记录</button>' +
      '</div>' +
      (dataTab === 'data'
        ? '<div class="bk-ocr-data-panel"><div class="bk-ocr-table-scroll"><table class="bk-ocr-data-table"><thead><tr><th class="c">#</th><th>科目</th><th class="r">期末</th><th class="c">定位</th></tr></thead><tbody>' +
          rows
            .map(function (r) {
              if (r.header) {
                return (
                  '<tr class="bk-ocr-row-header"><td class="c"></td><td colspan="3">' +
                  esc(r.name) +
                  '</td></tr>'
                );
              }
              return (
                '<tr><td class="c">' +
                esc(r.seq) +
                '</td><td>' +
                esc(r.name) +
                '</td><td class="r"><input class="bk-ocr-cell-input" value="' +
                esc(r.val) +
                '" /></td><td class="c"><button type="button" class="bk-ocr-link-btn" data-act="ocrLoc" data-arg="' +
                esc(r.name) +
                '">定位</button></td></tr>'
              );
            })
            .join('') +
          '</tbody></table></div></div>'
        : dataTab === 'trial'
          ? '<div class="bk-ocr-data-panel"><div class="bk-ocr-trial-panel">' +
            '<div class="bk-ocr-trial-summary">' +
            '<div class="bk-ocr-trial-card">检查项<b>8</b></div>' +
            '<div class="bk-ocr-trial-card">通过<b>7</b></div>' +
            '<div class="bk-ocr-trial-card">失败<b>1</b></div></div>' +
            '<div class="bk-ocr-trial-row fail"><span>流动资产合计勾稽</span><span>差 121,467.34</span></div>' +
            '<div class="bk-ocr-trial-row pass"><span>资产 = 负债 + 权益</span><span>平衡</span></div>' +
            '<div class="bk-ocr-trial-row pass"><span>货币资金 ≥ 0</span><span>通过</span></div>' +
            '</div></div>'
          : '<div class="bk-ocr-data-panel"><div class="bk-ocr-log-panel">' +
            '<div class="bk-ocr-trial-row"><span>货币资金</span><span>12,000.00 → 12,045.00 · 王敏</span></div>' +
            '<div class="bk-ocr-trial-row"><span>初始识别</span><span>TextIn OCR · 今天 10:12</span></div>' +
            '</div></div>') +
      '</div></div></div>'
    );
  }

  function projectBarHtml(p, opts) {
    opts = opts || {};
    var outs = p.aiOutputs || D().defaultAiOutputs || [];
    var menuOpen = _local.aiMenuOpen;
    var menu = '';
    if (menuOpen) {
      menu =
        '<div class="xb-ai-menu">' +
        '<button type="button" class="xb-ai-menu-item" data-act="openOcrPane" data-arg="' +
        esc(p.id) +
        '"><strong>财报 OCR 校对</strong><span>扫描件双栏 · 试算</span></button>' +
        outs
          .map(function (o) {
            return (
              '<button type="button" class="xb-ai-menu-item" data-act="openAiOutput" data-arg="' +
              esc(o.id) +
              '" data-arg2="' +
              esc(p.id) +
              '"><strong>' +
              esc(o.title) +
              '</strong><span>' +
              esc(o.version || '') +
              ' · ' +
              esc(o.time) +
              '</span></button>'
            );
          })
          .join('') +
        (outs.length
          ? ''
          : '<div class="xb-ai-menu-empty">本会话暂无其它 AI 产出</div>') +
        '</div>';
    }
    return (
      '<div class="xb-chat-project-bar">' +
      '<div class="xb-chat-project-bar-title"><strong>' +
      esc(p.name) +
      '</strong><span>' +
      esc(p.company) +
      '</span></div>' +
      '<div class="xb-chat-project-bar-actions">' +
      '<button type="button" class="btn btn-ghost" data-act="newProjectSession" data-arg="' +
      esc(p.id) +
      '">新会话</button>' +
      '<button type="button" class="btn btn-ghost' +
      (_local.rightPaneKind === 'profile' ? ' btn-primary' : '') +
      '" data-act="toggleRightPane" data-arg="profile" data-arg2="' +
      esc(p.id) +
      '">项目档案</button>' +
      '<div class="xb-ai-menu-wrap">' +
      '<button type="button" class="btn btn-ghost' +
      (_local.rightPaneKind === 'ai' || _local.rightPaneKind === 'ocr' || menuOpen
        ? ' btn-primary'
        : '') +
      '" data-act="toggleAiMenu" data-arg="' +
      esc(p.id) +
      '">AI 产出' +
      (outs.length ? ' <span class="xb-ai-badge">' + outs.length + '</span>' : '') +
      '</button>' +
      menu +
      '</div>' +
      '<button type="button" class="btn btn-ghost" data-act="inviteHint">邀请成员</button>' +
      '</div></div>' +
      (_local.inviteOpen
        ? '<div class="xb-modal-mask" data-act="closeInvite"><div class="xb-modal xb-kb-create-modal" data-stop="1">' +
          '<h3>邀请成员</h3><p class="hint">输入同事邮箱或飞书名，加入当前项目协作。</p>' +
          '<label>成员</label><input id="peInviteEmail" placeholder="name@company.com 或 飞书名" />' +
          '<div class="xb-modal-actions">' +
          '<button type="button" class="btn btn-ghost" data-act="closeInvite">取消</button>' +
          '<button type="button" class="btn btn-primary" data-act="submitInvite" data-arg="' +
          esc(p.id) +
          '">发送邀请</button>' +
          '</div></div></div>'
        : '')
    );
  }

  function renderPeOtherOutputs(p) {
    var outs = p.aiOutputs || D().defaultAiOutputs || [];
    if (!outs.length) {
      return '<div class="empty-hint">暂无其它 AI 产出</div>';
    }
    return (
      '<div class="xb-doc-dock">' +
      '<div class="xb-doc-dock-meta">其它产出清单</div>' +
      outs
        .map(function (o) {
          return (
            '<button type="button" class="xb-ai-output-item" data-act="openAiOutput" data-arg="' +
            esc(o.id) +
            '" data-arg2="' +
            esc(p.id) +
            '"><strong>' +
            esc(o.title) +
            '</strong><span>' +
            esc(o.version || '') +
            ' · ' +
            esc(o.time || '') +
            '</span></button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function reportPanelColHtml() {
    var rpt = _local.reportData;
    if (!rpt) return '<div class="xb-report-panel-col"><div class="empty-hint">报告加载中…</div></div>';
    return (
      '<div class="xb-report-panel-col">' +
      '<div class="xb-report-panel-toolbar">' +
      '<span class="xb-report-panel-title">' + esc(rpt.title || '报告') + '</span>' +
      (rpt.subtitle ? '<span class="xb-report-panel-badge">' + esc(rpt.subtitle) + '</span>' : '') +
      '<button type="button" class="btn btn-ghost" style="margin-left:auto;font-size:12px" data-act="closeRightPane">关闭</button>' +
      '</div>' +
      '<div class="xb-report-panel-body">' +
      (rpt.html || '') +
      '</div>' +
      '</div>'
    );
  }

  function evidencePanelHtml() {
    var tab = _local.evidencePanelTab || 'source';
    var rpt = _local.reportData || {};
    var tabs = [
      { id: 'issue', label: '问题卡' },
      { id: 'finding', label: '关键发现' },
      { id: 'source', label: '溯源' },
    ];
    var tabsHtml = tabs.map(function (t) {
      return (
        '<button type="button" class="ev-tab' + (tab === t.id ? ' active' : '') + '" data-act="switchEvidenceTab" data-arg="' + t.id + '">' +
        t.label +
        '</button>'
      );
    }).join('');

    var bodyHtml = '';
    if (tab === 'source') {
      var cit = _local.evidenceCitationData;
      if (!cit) {
        bodyHtml =
          '<div class="ev-source-placeholder">' +
          '<div class="ev-source-placeholder-icon">⟦N⟧</div>' +
          '<div>点击报告中的引用编号<br>查看来源</div>' +
          '</div>';
      } else {
        bodyHtml =
          '<div class="ev-source-card">' +
          '<div class="ev-source-meta">' +
          '<span class="ev-source-kind">' + esc(cit.kind || '') + '</span>' +
          '<span class="ev-source-page">' + esc(cit.page || '') + '</span>' +
          '</div>' +
          '<div class="ev-source-title">' + esc(cit.title || '') + '</div>' +
          '<div class="ev-source-snippet">' + (cit.snippetHtml || esc(cit.snippet || '')) + '</div>' +
          '</div>';
      }
    } else if (tab === 'issue') {
      var issues = rpt.issues || [];
      if (!issues.length) {
        bodyHtml = '<div class="empty-hint">暂无问题卡</div>';
      } else {
        bodyHtml = issues.map(function (iss) {
          var statusClass = iss.status === '已核实' ? 'verified' : 'pending';
          return (
            '<div class="ev-issue-card">' +
            '<div class="ev-issue-no">问题 #' + esc(String(iss.no || '')) + '</div>' +
            '<div class="ev-issue-q">' + esc(iss.q || '') + '</div>' +
            '<span class="ev-issue-status ' + statusClass + '">' + esc(iss.status || '待核实') + '</span>' +
            '</div>'
          );
        }).join('');
      }
    } else if (tab === 'finding') {
      var findings = rpt.findings || [];
      if (!findings.length) {
        bodyHtml = '<div class="empty-hint">暂无关键发现</div>';
      } else {
        bodyHtml = findings.map(function (f) {
          var chipsHtml = '';
          if (f.chips && f.chips.length) {
            chipsHtml = '<div class="ev-finding-chips">' +
              f.chips.map(function (chip) {
                return '<button type="button" class="ev-finding-chip" data-act="openSourceCitation" data-arg="' + esc(String(chip)) + '">→ 溯源 ⟦' + esc(String(chip)) + '⟧</button>';
              }).join('') +
              '</div>';
          }
          return (
            '<div class="ev-finding-card">' +
            '<div class="ev-finding-label">' + esc(f.label || '关键发现') + '</div>' +
            '<div class="ev-finding-text">' + esc(f.text || '') + '</div>' +
            chipsHtml +
            '</div>'
          );
        }).join('');
      }
    }

    return (
      '<aside class="xb-evidence-panel">' +
      '<div class="ev-tabs">' + tabsHtml + '</div>' +
      '<div class="ev-body">' + bodyHtml + '</div>' +
      '</aside>'
    );
  }

  function rightPaneHtml(p) {
    if (!_local.rightPaneKind) return '';
    var body = '';
    var kind = _local.rightPaneKind;
    if (kind === 'ocr') {
      body = renderPeOcrArtifact(p);
    } else if (kind === 'other') {
      body = renderPeOtherOutputs(p);
    } else if (kind === 'profile') {
      var pf = p.profile || {};
      body =
        '<div style="margin-bottom:12px"><span class="xb-mini-tag">' +
        esc(p.sector || '赛道') +
        '</span></div>' +
        '<p style="margin:0 0 12px">' +
        esc(pf.summary || '暂无画像摘要') +
        '</p>' +
        '<div class="hub-grid">' +
        '<div><div class="muted">法人</div>' +
        esc(pf.legalRep || '—') +
        '</div>' +
        '<div><div class="muted">注册资本</div>' +
        esc(pf.regCapital || '—') +
        '</div>' +
        '<div><div class="muted">成立</div>' +
        esc(pf.founded || '—') +
        '</div>' +
        '<div><div class="muted">信用代码</div>' +
        esc(p.creditCode || '—') +
        '</div></div>' +
        '<div style="margin-top:14px"><button type="button" class="xb-btn-mini primary" data-nav="project/' +
        esc(p.id) +
        '/brief">打开一页纸</button></div>';
    } else if (kind === 'ai') {
      var outs = p.aiOutputs || D().defaultAiOutputs || [];
      var cur = _local.rightPane;
      if (!cur && outs[0]) cur = outs[0];
      if (cur && cur.body) {
        body =
          '<div class="xb-doc-dock">' +
          '<div class="xb-doc-dock-meta">' +
          esc(cur.version || '') +
          ' · ' +
          esc(cur.time || '') +
          '</div>' +
          '<h3 style="margin:0 0 12px">' +
          esc(cur.title) +
          '</h3>' +
          '<div class="xb-doc-dock-body">' +
          esc(cur.body) +
          '</div></div>';
      } else {
        body = '<div class="empty-hint">暂无 AI 产出，跑尽调场景后会出现在这里</div>';
      }
    } else if (kind === 'file') {
      var fname = (_local.rightPane && _local.rightPane.name) || '文件';
      body =
        '<div class="xb-doc-dock">' +
        '<div class="xb-doc-dock-meta">材料书 · 原文预览</div>' +
        '<h3 style="margin:0 0 12px">' +
        esc(fname) +
        '</h3>' +
        '<div class="xb-doc-dock-body">' +
        '【Demo 材料书正文】\n\n文件：' +
        esc(fname) +
        '\n状态：已解析\n\n可在对话中「插入引用」。真产品此处为 OCR/原文分页预览。' +
        '</div>' +
        '<div style="margin-top:12px;display:flex;gap:8px">' +
        '<button type="button" class="xb-btn-mini primary" data-act="insertFileRef">插入引用</button>' +
        '<button type="button" class="xb-btn-mini" data-act="closeRightPane">关闭</button>' +
        '</div></div>';
    }
    var useArtifactTabs = kind === 'ocr' || kind === 'ai' || kind === 'other';
    var tabActive = kind === 'ocr' ? 'ocr' : kind === 'other' ? 'other' : 'report';
    var head;
    if (useArtifactTabs && window.DemoOcrChrome && window.DemoOcrChrome.artifactTabsHeaderHtml) {
      head = window.DemoOcrChrome.artifactTabsHeaderHtml({
        active: tabActive,
        closeAct: 'closeRightPane',
        tabs: [
          { id: 'ocr', label: 'OCR' },
          { id: 'report', label: '报告' },
          { id: 'other', label: '其他产出' }
        ]
      });
    } else {
      var title =
        kind === 'profile' ? '项目档案' : kind === 'file' ? '材料书' : 'AI 产出';
      head =
        '<div class="xb-right-pane-h"><span>' +
        title +
        '</span><button type="button" class="btn btn-ghost" data-act="closeRightPane">关闭</button></div>';
    }
    return (
      '<aside class="xb-right-pane' +
      (kind === 'ocr' ? ' is-ocr' : '') +
      '"' +
      (useArtifactTabs ? ' data-ocr-fs-root="1"' : '') +
      '>' +
      head +
      '<div class="xb-right-pane-body">' +
      body +
      '</div></aside>'
    );
  }

  /** 对齐 WebUI ChatContent：toolbar + 居中一列（消息滚动 | Composer 含上方 pill） */
  function chatMainColumnHtml(opts) {
    opts = opts || {};
    return (
      '<div class="xb-chat-main-col">' +
      (opts.sessionTitle
        ? '<div class="xb-chat-toolbar"><span class="xb-chat-session-title" title="' +
          esc(opts.sessionTitle) +
          '">' +
          esc(opts.sessionTitle) +
          '</span></div>'
        : '') +
      '<div class="xb-chat-content-wrap">' +
      '<div class="xb-chat-content">' +
      '<div class="xb-chat-messages-scroll">' +
      (opts.messagesHtml || '') +
      '</div>' +
      (opts.composerHtml || '') +
      '</div></div></div>'
    );
  }

  function pageProjectHub(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    if (!p.fileTree) p.fileTree = D().defaultFileTree;
    if (!p.aiOutputs) p.aiOutputs = D().defaultAiOutputs;

    var chatRows = (p.chats || [])
      .map(function (c) {
        return (
          '<button type="button" class="chat-row" data-nav="project/' +
          esc(p.id) +
          '/chat/' +
          esc(c.id) +
          '"><strong>' +
          esc(c.title) +
          '</strong><span>' +
          esc(c.preview || '3 天前') +
          '</span></button>'
        );
      })
      .join('');

    var pf = p.profile || {};
    var hasRight = !!_local.rightPaneKind;

    return (
      '<div class="' +
      workspaceClass(hasRight) +
      '">' +
      fileTreeHtml(p) +
      '<div class="xb-chat-center">' +
      projectBarHtml(p) +
      '<div class="xb-chat-main">' +
      '<div class="xb-hub-profile-card"><div><strong>项目画像摘要</strong>' +
      '<div class="tag-row"><span class="xb-mini-tag">' +
      esc(p.sector || '赛道') +
      '</span></div>' +
      '<p style="margin:8px 0 0;font-size:13px;color:var(--xb-muted);line-height:1.5">' +
      esc(pf.summary || '') +
      '</p></div>' +
      '<button type="button" class="xb-jr-link" data-act="toggleRightPane" data-arg="profile" data-arg2="' +
      esc(p.id) +
      '">项目档案 →</button></div>' +
      '<div class="xb-hub-sessions"><h4>历史会话</h4>' +
      (chatRows || '<div class="empty-hint">暂无会话</div>') +
      '</div></div>' +
      composerDockHtml(p, null) +
      '</div>' +
      rightPaneHtml(p) +
      '</div>'
    );
  }

  function pageProjectChat(pid, chatId) {
    var p = findProject(pid);
    if (!p) return '<div class="page-body">未找到项目</div>';
    if (!p.fileTree) p.fileTree = D().defaultFileTree;
    if (!p.aiOutputs) p.aiOutputs = D().defaultAiOutputs;
    var chat = null;
    (p.chats || []).forEach(function (c) {
      if (c.id === chatId) chat = c;
    });
    if (!chat) {
      return (
        '<div class="page-body">未找到会话 <button class="btn" data-nav="project/' +
        esc(pid) +
        '">返回 Hub</button></div>'
      );
    }
    var hasRight = !!_local.rightPaneKind;
    var isReportMode = _local.rightPaneKind === 'report';
    return (
      '<div class="' +
      workspaceClass(hasRight) +
      '">' +
      fileTreeHtml(p) +
      '<div class="xb-chat-center">' +
      projectBarHtml(p) +
      chatMainColumnHtml({
        sessionTitle: chat.title,
        messagesHtml: renderMessages(chat.messages),
        composerHtml: composerDockHtml(p, chatId),
      }) +
      '</div>' +
      (isReportMode ? reportPanelColHtml() + evidencePanelHtml() : rightPaneHtml(p)) +
      '</div>'
    );
  }

  function subPageShell(p, title, body) {
    return (
      '<div class="detail-head"><div style="flex:1">' +
      crumb([
        { label: '项目', route: 'projects' },
        { label: p.name, route: 'project/' + p.id },
        { label: title },
      ]) +
      '<h1>' +
      esc(title) +
      '</h1></div>' +
      '<button type="button" class="btn btn-ghost" data-nav="project/' +
      esc(p.id) +
      '">返回 Hub</button></div>' +
      '<div class="page-body">' +
      body +
      '</div>'
    );
  }

  function pageBrief(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var pf = p.profile || {};
    var body =
      '<div class="panel" style="padding:16px">' +
      '<h3>' +
      esc(p.company) +
      '</h3>' +
      '<p style="line-height:1.6;margin:10px 0">' +
      esc(pf.summary || '') +
      '</p>' +
      '<table class="dt"><tbody>' +
      [
        ['统一社会信用代码', p.creditCode],
        ['法定代表人', pf.legalRep],
        ['注册资本', pf.regCapital],
        ['成立日期', pf.founded],
        ['登记状态', pf.status],
        ['所属行业', pf.industry],
        ['地址', pf.address],
        ['人员规模', pf.employees],
        ['融资阶段', p.stage],
        ['负责人', p.owner],
      ]
        .map(function (r) {
          return (
            '<tr><td style="width:140px;color:var(--xb-muted)">' +
            esc(r[0]) +
            '</td><td>' +
            esc(r[1] || '—') +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table></div>';
    return subPageShell(p, '公司一页纸', body);
  }

  function pageUbo(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var rows = (p.ubo || [])
      .map(function (u) {
        return (
          '<tr><td>' +
          esc(u.name) +
          '</td><td>' +
          esc(u.pct) +
          '</td><td><span class="tag">' +
          esc(u.standard) +
          '</span></td><td>' +
          esc(u.path) +
          '</td></tr>'
        );
      })
      .join('');
    var body =
      '<div class="table-wrap"><table class="dt"><thead><tr><th>姓名/主体</th><th>持股</th><th>标准</th><th>穿透路径</th></tr></thead><tbody>' +
      rows +
      '</tbody></table></div>';
    return subPageShell(p, '股权与 UBO', body);
  }

  function pageGaps(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var items = (p.gaps || [])
      .map(function (g) {
        return '<li style="margin:8px 0">' + esc(g) + '</li>';
      })
      .join('');
    var body =
      '<div class="panel" style="padding:14px"><h3>材料缺口</h3>' +
      (items
        ? '<ul style="padding-left:18px">' + items + '</ul>'
        : '<div class="empty-hint">暂无缺口</div>') +
      '<div style="margin-top:12px"><button type="button" class="btn btn-primary" data-act="uploadMaterial" data-arg="' +
      esc(p.id) +
      '">上传补件</button></div></div>';
    return subPageShell(p, '材料缺口', body);
  }

  function pageFinance(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var rows = (p.financeFindings || [])
      .map(function (f) {
        return (
          '<tr><td>' +
          esc(f.item) +
          '</td><td>' +
          levelTag(f.level) +
          '</td><td>' +
          esc(f.note) +
          '</td></tr>'
        );
      })
      .join('');
    var cfg = getActiveFinanceConfig();
    var ptpl = getActivePeriodTemplate();
    var body =
      financeConfigBannerHtml() +
      '<p class="xb-feature-lead">按「' +
      esc(cfg.name) +
      '」口径做勾稽与红旗扫描；期间口径模板：<strong>' +
      esc(ptpl.name) +
      '</strong>。</p>' +
      '<div class="xb-fin-coltag-card"><div class="xb-fin-coltag-head">' +
      '<div><strong>列口径标注</strong>' +
      '<p class="muted" style="margin:3px 0 0;font-size:12px">已解析 2026年6月利润表 · 3 列金额；系统按列头预填口径，可人工修改（对应投后反馈「让我自己勾选」）</p></div>' +
      '<button type="button" class="btn btn-primary" data-act="applyPeriodConfig">按当前配置应用</button></div>' +
      '<div class="xb-fin-coltag-cols">' +
      financeColumnTagHtml() +
      '</div></div>' +
      '<div class="xb-fin-mtx-card"><div class="xb-fin-mtx-head"><strong>科目 × 期间矩阵</strong>' +
      '<span class="muted">来源标注：直取 / 倒减 / 勾稽差异</span></div>' +
      periodMatrixHtml(ptpl) +
      '</div>' +
      '<div class="table-wrap"><table class="dt"><thead><tr><th>检查项</th><th>等级</th><th>说明</th></tr></thead><tbody>' +
      rows +
      '</tbody></table></div>';
    return subPageShell(p, '财报深读', body);
  }

  function pageReport(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var rows = (p.reportChapters || [])
      .map(function (c) {
        return (
          '<div class="mat-row"><span>' +
          esc(c.title) +
          '</span><span class="tag">' +
          esc(c.status) +
          '</span></div>'
        );
      })
      .join('');
    var body =
      '<div class="panel" style="padding:14px"><h3>报告骨架</h3>' +
      rows +
      '<div style="margin-top:12px;display:flex;gap:8px">' +
      '<button type="button" class="btn btn-primary" data-nav="project/' +
      esc(p.id) +
      '/ic">去写 IC Memo</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="templates">报告模板</button></div></div>';
    return subPageShell(p, '尽调报告', body);
  }

  function pageIc(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var ic = p.icMemo || {};
    var risks = (ic.risks || [])
      .map(function (r) {
        return '<li>' + esc(r) + '</li>';
      })
      .join('');
    var body =
      '<div class="panel" style="padding:16px">' +
      '<h3>投资逻辑</h3><p style="line-height:1.55">' +
      esc(ic.thesis || '') +
      '</p>' +
      '<h3 style="margin-top:14px">回报</h3><p>' +
      esc(ic.returns || '') +
      '</p>' +
      '<h3 style="margin-top:14px">红旗</h3><ul style="padding-left:18px">' +
      risks +
      '</ul>' +
      '<div style="margin-top:14px;display:flex;gap:8px">' +
      '<button type="button" class="btn btn-primary" data-nav="project/' +
      esc(p.id) +
      '/debate">对抗预演</button>' +
      '<button type="button" class="btn btn-ghost" data-nav="project/' +
      esc(p.id) +
      '/deliver">交割</button></div></div>';
    return subPageShell(p, 'IC Memo', body);
  }

  function pageDebate(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var d = p.debate || { bull: [], bear: [], open: [] };
    function list(arr) {
      return (arr || [])
        .map(function (x) {
          return '<li style="margin:6px 0">' + esc(x) + '</li>';
        })
        .join('');
    }
    var body =
      '<div class="split">' +
      '<div class="panel" style="padding:14px"><h3>多头</h3><ul style="padding-left:18px">' +
      list(d.bull) +
      '</ul></div>' +
      '<div class="panel" style="padding:14px"><h3>空头</h3><ul style="padding-left:18px">' +
      list(d.bear) +
      '</ul></div></div>' +
      '<div class="panel" style="padding:14px;margin-top:12px"><h3>开放问题</h3><ul style="padding-left:18px">' +
      list(d.open) +
      '</ul></div>';
    return subPageShell(p, '对抗预演', body);
  }

  function pageDeliver(id) {
    var p = findProject(id);
    if (!p) return '<div class="page-body">未找到项目</div>';
    var already = p.status === '投后' || p.status === '已投资';
    var body =
      '<div class="panel" style="padding:16px">' +
      '<h3>交割进入投后</h3>' +
      '<p style="line-height:1.55;margin:10px 0;color:var(--xb-muted)">确认交割完成后，项目状态将变为「投后」，并出现在投后列表，可维护估值/持股提案。</p>' +
      '<table class="dt" style="margin:12px 0"><tbody>' +
      '<tr><td>当前状态</td><td><span class="tag ' +
      statusClass(p.status) +
      '">' +
      esc(p.status) +
      '</span></td></tr>' +
      '<tr><td>公司</td><td>' +
      esc(p.company) +
      '</td></tr>' +
      '<tr><td>负责人</td><td>' +
      esc(p.owner) +
      '</td></tr>' +
      '</tbody></table>' +
      (already
        ? '<button type="button" class="btn btn-primary" data-nav="post">已在投后 · 打开投后</button>'
        : '<button type="button" class="btn btn-primary" data-act="deliverProject" data-arg="' +
          esc(p.id) +
          '">确认交割并进入投后</button>') +
      '</div>';
    return subPageShell(p, '交割', body);
  }

  function pageScenarios() {
    var cat = D().scenarioCatalog || {};
    var featured = cat.featured;
    var featuredHtml = featured
      ? '<section class="xb-scenario-featured" aria-label="推荐工作流">' +
        '<div class="xb-scenario-featured-badge">推荐工作流</div>' +
        '<button type="button" class="xb-scenario-card xb-scenario-card--featured" data-act="runScenario" data-arg="' +
        esc(featured.id) +
        '"><span class="xb-scenario-card-main"><span class="xb-scenario-card-label">' +
        esc(featured.name) +
        '</span><span class="xb-scenario-card-desc">' +
        esc(featured.desc) +
        '</span></span><span class="xb-scenario-card-arrow">→</span></button></section>'
      : '';

    var cols = (cat.groups || [])
      .map(function (g) {
        var cards = (g.items || [])
          .map(function (it) {
            return (
              '<button type="button" class="xb-scenario-card" data-act="runScenario" data-arg="' +
              esc(it.id) +
              '"><span class="xb-scenario-card-main"><span class="xb-scenario-card-label">' +
              esc(it.name) +
              '</span><span class="xb-scenario-card-desc">' +
              esc(it.desc) +
              '</span></span><span class="xb-scenario-card-arrow">→</span></button>'
            );
          })
          .join('');
        return (
          '<section class="xb-scenario-panel"><header class="xb-scenario-panel-head">' +
          '<h3 class="xb-scenario-section-title">' +
          esc(g.category) +
          '</h3><span class="xb-scenario-section-count">' +
          (g.items || []).length +
          ' 个场景</span></header><div class="xb-scenario-list">' +
          cards +
          '</div></section>'
        );
      })
      .join('');

    return (
      toolbar('工作流') +
      '<div class="page-body"><p class="xb-feature-lead">' +
      esc(cat.lead || '技能与专家已配好，点选直接开始') +
      '</p>' +
      featuredHtml +
      '<div class="xb-scenario-columns">' +
      cols +
      '</div></div>'
    );
  }

  function pageDiscover() {
    var tab = _local.discoverTab || 'leads';
    var tabs = [
      { id: 'leads', label: '线索' },
      { id: 'meetings', label: '专家会议' },
      { id: 'field', label: '一线调研' },
    ];
    var tabHtml = tabs
      .map(function (t) {
        return (
          '<button type="button" class="xb-discover-tab' +
          (tab === t.id ? ' on' : '') +
          '" data-act="discoverTab" data-arg="' +
          t.id +
          '">' +
          esc(t.label) +
          '</button>'
        );
      })
      .join('');
    var head =
      '<div class="page-toolbar xb-discover-head">' +
      '<h1>发现调研</h1>' +
      '<span class="xb-discover-sep" aria-hidden="true"></span>' +
      '<div class="xb-discover-tabs" role="tablist">' +
      tabHtml +
      '</div>' +
      '<div class="spacer"></div>' +
      '</div>';
    _local.discoverEmbed = true;
    var body = '';
    if (tab === 'meetings') body = pageExperts();
    else if (tab === 'field') body = pageJournalist();
    else body = pageIntelligence();
    _local.discoverEmbed = false;
    return head + '<div class="xb-discover-body">' + body + '</div>';
  }

  function pageIntelligence() {
    var tabs = [
      { id: 'radar', label: '项目线索' },
      { id: 'chain', label: 'AI产业链' },
    ];
    var activeTab = _local.intelligenceTab || 'radar';
    var tabBar =
      '<div style="display:flex;align-items:center;gap:0;padding:0 24px;border-bottom:1px solid var(--xb-border);background:var(--xb-surface)">' +
      tabs.map(function (t) {
        var isActive = activeTab === t.id;
        return (
          '<button type="button" style="padding:12px 18px;font-size:14px;font-weight:' +
          (isActive ? '600' : '400') +
          ';color:' +
          (isActive ? 'var(--xb-accent)' : 'var(--xb-muted)') +
          ';background:none;border:none;border-bottom:2px solid ' +
          (isActive ? 'var(--xb-accent)' : 'transparent') +
          ';cursor:pointer;transition:all .15s" data-act="intelligenceTab" data-arg="' +
          t.id +
          '">' +
          t.label +
          '</button>'
        );
      }).join('') +
      '</div>';
    var bodyHtml = '';
    if (activeTab === 'radar') bodyHtml = pageRadar();
    else bodyHtml = pageChain();
    return tabBar + bodyHtml;
  }

  function pageFind() {
    var q = _local.findQuery || '';
    var list = (D().findResults || []).filter(function (f) {
      if (!q) return true;
      return f.name.indexOf(q) >= 0 || f.sector.indexOf(q) >= 0;
    });
    var rows = list
      .map(function (f) {
        return (
          '<tr><td><span class="link-name">' +
          esc(f.name) +
          '</span></td><td>' +
          esc(f.sector) +
          '</td><td>' +
          esc(f.stage) +
          '</td><td>' +
          esc(f.signal) +
          '</td><td>' +
          esc(f.match) +
          '</td>' +
          '<td><button type="button" class="btn btn-ghost" data-act="findOpen" data-arg="' +
          esc(f.name) +
          '">建项</button></td></tr>'
        );
      })
      .join('');
    return (
      toolbar(
        '找项目',
        '<input class="search" id="peFindQ" placeholder="搜索标的/赛道…" value="' +
          esc(q) +
          '" />'
      ) +
      '<div class="page-body"><div class="table-wrap"><table class="dt"><thead><tr><th>标的</th><th>赛道</th><th>阶段</th><th>信号</th><th>匹配</th><th></th></tr></thead><tbody>' +
      rows +
      '</tbody></table></div></div>'
    );
  }

  function pageRadar() {
    var R = D().radar || {};
    var focus = _local.radarFocus || R.focus || ['医疗器械', '航空MRO'];
    _local.radarFocus = focus;
    var filter = _local.radarFilter || '全部';
    var feed = (R.feed || []).filter(function (n) {
      if (filter === '全部') return true;
      if (filter === '政策速递') return n.policy;
      return n.sector === filter;
    });
    var briefing = R.briefing || {};
    var weekly = R.weekly || {};
    var previewId = _local.radarPreviewId;
    var preview = null;
    (R.feed || []).forEach(function (n) {
      if (n.id === previewId) preview = n;
    });
    var showWeekly = _local.radarShowWeekly;

    var focusChips = focus
      .map(function (s) {
        return (
          '<span class="xb-sector-chip xb-sector-chip-managed' +
          (weekly.sector === s ? ' on' : '') +
          '"><button type="button" class="xb-sector-chip-select" data-act="radarWeeklySector" data-arg="' +
          esc(s) +
          '">' +
          esc(s) +
          '</button><button type="button" class="xb-sector-chip-remove" data-act="radarRemoveFocus" data-arg="' +
          esc(s) +
          '">×</button></span>'
        );
      })
      .join('');

    var filterChips =
      '<button type="button" class="xb-sector-chip' +
      (filter === '全部' ? ' on' : '') +
      '" data-act="radarFilter" data-arg="全部">全部</button>' +
      '<button type="button" class="xb-sector-chip' +
      (filter === '政策速递' ? ' on' : '') +
      '" data-act="radarFilter" data-arg="政策速递">政策速递</button>' +
      focus
        .map(function (s) {
          return (
            '<button type="button" class="xb-sector-chip' +
            (filter === s ? ' on' : '') +
            '" data-act="radarFilter" data-arg="' +
            esc(s) +
            '">' +
            esc(s) +
            '</button>'
          );
        })
        .join('');

    var cards = feed
      .map(function (n) {
        var interpreted = (_local.radarInterpreted || {})[n.id];
        var saved = (_local.radarSaved || {})[n.id];
        return (
          '<article class="xb-radar-card"><div class="xb-radar-card-toolbar"><div class="xb-radar-card-head">' +
          '<span class="xb-sector-tag' +
          (n.policy ? ' policy' : '') +
          '">' +
          (n.policy ? '政策' : esc(n.sector)) +
          '</span><span class="xb-radar-meta">' +
          esc(n.source) +
          ' · ' +
          esc(n.time) +
          '</span></div><div style="display:flex;gap:8px">' +
          '<button type="button" class="xb-radar-read-link' +
          (saved ? ' text-primary' : '') +
          '" data-act="radarSave" data-arg="' +
          esc(n.id) +
          '">' +
          ico('bookmark') +
          ' 收藏</button>' +
          '<button type="button" class="xb-radar-read-link" data-act="radarOpen" data-arg="' +
          esc(n.id) +
          '">查看全文</button></div></div><h3>' +
          esc(n.title) +
          '</h3><p class="xb-radar-summary">' +
          esc(n.summary) +
          '</p>' +
          (n.companies || [])
            .map(function (c) {
              return (
                '<span class="xb-company-chip">' +
                esc(c.name) +
                '<em>' +
                esc(c.role) +
                '</em></span>'
              );
            })
            .join('') +
          (interpreted
            ? '<div class="xb-expert-note"><span class="xb-expert-note-tag">小星 · 内容解读</span><p>' +
              esc(interpreted) +
              '</p></div>'
            : '<button type="button" class="xb-btn-interpret" data-act="radarInterpret" data-arg="' +
              esc(n.id) +
              '">' +
              ico('zap') +
              ' 内容解读</button>') +
          '</article>'
        );
      })
      .join('');

    var side = '';
    if (preview || showWeekly) {
      if (showWeekly) {
        side =
          '<div class="xb-radar-preview"><header class="xb-radar-preview-head"><strong>赛道周报</strong>' +
          '<button type="button" class="xb-btn-mini" data-act="radarClosePreview">关闭</button></header>' +
          '<div class="xb-radar-preview-body"><p class="xb-mini-meta">' +
          esc(weekly.sector || '') +
          ' · 近 7 日</p>' +
          '<div class="xb-radar-watch" style="margin-top:10px"><b>本周结论</b><span>' +
          esc(weekly.insight || weekly.teaser || '') +
          '</span></div><p>' +
          esc(weekly.teaser || '') +
          '</p></div></div>';
      } else {
        side =
          '<div class="xb-radar-preview"><header class="xb-radar-preview-head"><strong>全文</strong>' +
          '<button type="button" class="xb-btn-mini" data-act="radarClosePreview">关闭</button></header>' +
          '<div class="xb-radar-preview-body"><h3 style="margin:0 0 8px;font-size:14px">' +
          esc(preview.title) +
          '</h3><p class="xb-mini-meta" style="margin-bottom:10px">' +
          esc(preview.source) +
          ' · ' +
          esc(preview.time) +
          '</p><p style="white-space:pre-wrap;margin:0">' +
          esc(preview.fullText || preview.summary) +
          '</p></div></div>';
      }
    } else {
      side =
        '<div class="xb-radar-interests-panel"><div class="xb-radar-interests-head"><div class="xb-radar-interests-head-main"><strong>你可能感兴趣</strong><span>基于你的偏好</span></div>' +
        '<div class="xb-radar-interests-head-actions"><span class="xb-radar-interests-count">' +
        ((R.interests || []).length) +
        '</span><button type="button" class="xb-btn-mini" data-act="refreshRadarInterests">刷新</button></div></div>' +
        '<div class="xb-radar-interests-list">' +
        (R.interests || [])
          .map(function (it) {
            return (
              '<button type="button" class="xb-radar-interest-item" data-act="openRadarInterest" data-arg="' +
              esc(it.id) +
              '"><div class="xb-radar-interest-meta"><span class="xb-sector-tag">' +
              esc(it.kind) +
              '</span><span class="xb-radar-interest-match">' +
              esc(it.tag) +
              '</span><span class="xb-radar-meta">' +
              esc(it.time) +
              '</span></div><div class="ttl">' +
              esc(it.title) +
              '</div><div class="reason">' +
              esc(it.reason) +
              '</div></button>'
            );
          })
          .join('') +
        '</div></div>';
    }

    return (
      toolbar('项目线索') +
      '<div class="page-body"><p class="xb-feature-lead">' +
      esc(R.lead || '') +
      '</p><div class="xb-radar-layout"><div class="xb-radar-main">' +
      '<article class="xb-star-briefing-card"><header class="xb-star-briefing-head">' +
      ico('zap') +
      '<div><strong>投资早餐<span class="xb-star-briefing-date">' +
      esc(briefing.date || '') +
      '</span></strong></div></header>' +
      (briefing.watch
        ? '<div class="xb-radar-watch"><b>今日重点</b><span>' + esc(briefing.watch) + '</span></div>'
        : '') +
      '<p class="xb-morning-briefing-lead">' +
      esc(briefing.lead || '') +
      '</p><div class="xb-morning-briefing-digest">' +
      (briefing.digest || '')
        .split('\n')
        .filter(Boolean)
        .map(function (line) {
          var raw = line.replace(/^•\s*/, '');
          var dm = raw.match(/^【([^】]+)】(.*)$/);
          if (dm) {
            return (
              '<p><span class="xb-briefing-dim-tag">【' +
              esc(dm[1]) +
              '】</span>' +
              esc(dm[2]) +
              '</p>'
            );
          }
          return '<p>' + esc(raw) + '</p>';
        })
        .join('') +
      '</div></article>' +
      '<div class="xb-sector-weekly-entry"><div class="xb-sector-weekly-entry-chips">' +
      focusChips +
      '<button type="button" class="xb-sector-chip xb-sector-chip-add" data-act="radarAddFocus">' +
      ico('plus') +
      ' 添加关注赛道</button></div>' +
      '<div class="xb-sector-weekly-entry-row"><p class="xb-sector-weekly-entry-teaser">' +
      esc(weekly.teaser || '') +
      '</p><button type="button" class="xb-sector-weekly-entry-link" data-act="radarShowWeekly">赛道周报</button></div></div>' +
      '<div class="xb-radar-sectors"><span class="xb-radar-label">赛道热度</span>' +
      filterChips +
      '</div><h4 class="xb-section-h" style="margin:8px 0 10px">' +
      (filter === '全部' ? '今日动态' : filter === '政策速递' ? '政策速递' : filter + '动态') +
      ' <span class="xb-mini-meta">实时</span></h4>' +
      (cards || '<p class="xb-find-hint">该筛选下暂无资讯</p>') +
      '</div><aside class="xb-radar-side">' +
      side +
      '</aside></div></div>'
    );
  }

  function pageChain() {
    var C = D().chain || {};
    var nodes = C.nodes || [];
    var companies = C.companies || [];
    var view = _local.chainView || 'list';
    var nodeId = _local.chainNodeId || 'n2';
    var query = (_local.chainQuery || '').toLowerCase();
    var selectedCo = _local.chainCompanyId;
    var byParent = {};
    var byId = {};
    nodes.forEach(function (n) {
      byId[n.id] = n;
      var p = n.parentId == null ? '__root__' : n.parentId;
      if (!byParent[p]) byParent[p] = [];
      byParent[p].push(n);
    });
    Object.keys(byParent).forEach(function (k) {
      byParent[k].sort(function (a, b) {
        return a.order - b.order;
      });
    });
    function countFor(nid) {
      var ids = {};
      function walk(id) {
        ids[id] = 1;
        (byParent[id] || []).forEach(function (c) {
          walk(c.id);
        });
      }
      walk(nid);
      return companies.filter(function (c) {
        return ids[c.nodeId];
      }).length;
    }
    function renderTree(n, depth) {
      var kids = byParent[n.id] || [];
      var isLayer = n.layer === 'base' || n.layer === 'tech' || n.layer === 'app';
      var html =
        '<button type="button" class="xb-chain-node' +
        (nodeId === n.id ? ' on' : '') +
        (isLayer ? ' is-layer' : '') +
        '" style="padding-left:' +
        (8 + depth * 12) +
        'px" data-act="chainNode" data-arg="' +
        esc(n.id) +
        '"><span>' +
        esc(n.label) +
        '</span><span class="cnt">' +
        countFor(n.id) +
        '</span></button>';
      kids.forEach(function (k) {
        html += renderTree(k, depth + 1);
      });
      return html;
    }
    var roots = byParent['__root__'] || byParent['ai'] || [];
    var treeHtml = roots.map(function (n) {
      return renderTree(n, 0);
    }).join('');

    var node = byId[nodeId] || nodes[0] || { label: '—', id: '' };
    var path = [];
    var cur = node;
    while (cur) {
      if (cur.id !== 'ai') path.unshift(cur.label);
      cur = cur.parentId ? byId[cur.parentId] : null;
    }
    var list = companies.filter(function (c) {
      if (c.nodeId !== nodeId) return false;
      if (!query) return true;
      var hay =
        (c.name || '') +
        ' ' +
        (c.city || '') +
        ' ' +
        ((c.tags || []).join(' ')) +
        ' ' +
        (c.signal || '');
      return hay.toLowerCase().indexOf(query) >= 0;
    });

    var rows = list
      .map(function (c) {
        return (
          '<button type="button" class="xb-chain-row' +
          (selectedCo === c.id ? ' on' : '') +
          '" data-act="chainCompany" data-arg="' +
          esc(c.id) +
          '"><span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
          esc(c.name) +
          '</span><span style="display:inline-flex;align-items:center;gap:6px;font-size:12px"><i class="xb-dot ' +
          esc(c.riskLevel) +
          '"></i>' +
          esc(c.riskLabel || c.riskLevel) +
          '</span><span style="display:inline-flex;align-items:center;gap:6px;font-size:12px"><i class="xb-dot ' +
          esc(c.marketPower) +
          '"></i>' +
          esc(c.powerLabel || c.marketPower) +
          '</span><span style="font-size:11px;color:var(--xb-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
          esc((c.signalIcon || '') + ' ' + (c.signal || '')) +
          '</span></button>'
        );
      })
      .join('');

    var body = '';
    if (view === 'mindmap') {
      var mindChildNodes = byParent[nodeId] || [];
      var mindNodes = mindChildNodes.slice(0, 10);
      if (!mindNodes.length) {
        mindNodes = companies
          .filter(function (c) {
            return c.nodeId === nodeId;
          })
          .slice(0, 10)
          .map(function (c) {
            return { id: c.id, label: c.name, _company: true };
          });
      }
      if (!mindNodes.length) {
        mindNodes = (byParent[node.parentId] || []).slice(0, 10);
      }
      var W = 900;
      var H = 480;
      var cx = 120;
      var cy = H / 2;
      var svg =
        '<circle cx="' +
        cx +
        '" cy="' +
        cy +
        '" r="28" fill="#2563eb"/><text x="' +
        cx +
        '" y="' +
        (cy + 40) +
        '" text-anchor="middle" font-size="12" fill="#334155">' +
        esc(node.label) +
        '</text>';
      mindNodes.forEach(function (n, i) {
        var a = ((i + 0.5) / mindNodes.length) * Math.PI - Math.PI / 2;
        var x = cx + 220 + Math.cos(a) * 40;
        var y = 60 + i * 40;
        svg +=
          '<line x1="' +
          (cx + 28) +
          '" y1="' +
          cy +
          '" x2="' +
          x +
          '" y2="' +
          y +
          '" stroke="#94a3b8"/><circle cx="' +
          x +
          '" cy="' +
          y +
          '" r="16" fill="#64748b"/><text x="' +
          (x + 22) +
          '" y="' +
          (y + 4) +
          '" font-size="11" fill="#334155" style="cursor:pointer" data-act="chainNode" data-arg="' +
          esc(n.id) +
          '">' +
          esc(n.label) +
          '</text>';
      });
      // clickable foreignObject buttons for mind nodes
      var mindBtns = mindNodes
        .map(function (n, i) {
          var y = 44 + i * 40;
          var act = n._company ? 'chainCompany' : 'chainNode';
          return (
            '<button type="button" class="xb-btn-mini" style="position:absolute;left:360px;top:' +
            y +
            'px" data-act="' +
            act +
            '" data-arg="' +
            esc(n.id) +
            '">' +
            esc(n.label) +
            '</button>'
          );
        })
        .join('');
      body =
        '<div class="xb-chain-mind"><svg width="100%" height="' +
        H +
        '" viewBox="0 0 ' +
        W +
        ' ' +
        H +
        '">' +
        svg +
        '</svg>' +
        mindBtns +
        '<p style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:11px;color:#fff;background:rgba(15,23,42,.7);padding:4px 10px;border-radius:999px">脑图示意 · 点节点名或切回列表查看企业</p></div>';
    } else {
      var drawer = '';
      if (selectedCo) {
        var co = null;
        companies.forEach(function (c) {
          if (c.id === selectedCo) co = c;
        });
        if (co) {
          var sc = co.supplyChain || {};
          var sigFeed = (co.signals || [])
            .slice(0, 4)
            .map(function (s) {
              var iconMap = { recruit: '📋', product: '🚀', finance: '💰', risk: '⚠️' };
              return (
                '<div class="xb-chain-signal-row"><span>' +
                (iconMap[s.type] || '•') +
                '</span><div><div>' +
                esc(s.text) +
                '</div><div class="xb-mini-meta">' +
                esc(s.date || '') +
                '</div></div></div>'
              );
            })
            .join('');
          drawer =
            '<div class="xb-chain-drawer"><div style="display:flex;justify-content:space-between;gap:8px"><strong>' +
            esc(co.name) +
            '</strong><button type="button" class="xb-btn-mini" data-act="chainCloseDrawer">关闭</button></div>' +
            '<p class="xb-feature-lead" style="margin-top:8px">' +
            esc(co.description || co.riskSummary || '') +
            '</p><div class="xb-chain-drawer-tri">' +
            '<div><span class="xb-mini-meta">风险灯</span><div><i class="xb-dot ' +
            esc(co.riskLevel) +
            '"></i> ' +
            esc(co.riskLabel) +
            '</div></div>' +
            '<div><span class="xb-mini-meta">话语权</span><div><i class="xb-dot ' +
            esc(co.marketPower) +
            '"></i> ' +
            esc(co.powerLabel) +
            '</div></div>' +
            '<div><span class="xb-mini-meta">城市</span><div>' +
            esc(co.city || '—') +
            '</div></div></div>' +
            '<div class="xb-chain-drawer-sec"><div class="xb-chain-drawer-h">近期动态</div>' +
            (sigFeed || '<p class="xb-mini-meta">' + esc(co.signal || '') + '</p>') +
            '</div>' +
            '<div class="xb-chain-drawer-sec"><div class="xb-chain-drawer-h">供应链</div>' +
            '<div class="xb-chain-supply"><div><span class="xb-mini-meta">下游客户</span><div>' +
            esc((sc.customers || []).slice(0, 5).join('、') || '—') +
            '</div></div><div><span class="xb-mini-meta">上游供应商</span><div>' +
            esc((sc.suppliers || []).slice(0, 5).join('、') || '—') +
            '</div></div></div></div>' +
            '<button type="button" class="btn btn-primary" style="margin-top:14px;width:100%" data-act="startChainDiligence" data-arg="' +
            esc(co.name) +
            '">发起尽调</button></div>';
        }
      }
      body =
        '<div class="xb-chain-body"><aside class="xb-chain-tree"><div class="xb-chain-tree-h">产业链环节</div>' +
        treeHtml +
        '</aside><section class="xb-chain-main" style="position:relative"><div class="xb-chain-search"><span class="ico-abs">' +
        ico('list') +
        '</span><input id="peChainQuery" placeholder="搜索公司名、标签或城市…" value="' +
        esc(_local.chainQuery || '') +
        '" /></div><div style="padding:0 16px 8px"><h2 style="margin:0;font-size:16px">' +
        esc(node.label) +
        '</h2><p class="xb-mini-meta">' +
        esc(path.join(' · ')) +
        ' · ' +
        list.length +
        ' 家</p></div><div class="xb-chain-cols"><span>企业</span><span>风险灯</span><span>话语权</span><span>近期动态</span></div><div style="flex:1;overflow:auto;padding-bottom:12px">' +
        (rows || '<p class="xb-find-hint" style="margin:16px">该环节暂无符合条件的企业。</p>') +
        '</div>' +
        drawer +
        '</section></div>';
    }

    return (
      toolbar('AI 产业链') +
      '<div class="page-body"><p class="xb-feature-lead">列表或脑图探索产业链企业，一眼三问后再进深度挖掘。</p>' +
      '<div class="xb-chain-page--split"><div class="xb-chain-viewbar">' +
      '<button type="button" class="xb-chain-viewbtn' +
      (view === 'list' ? ' on' : '') +
      '" data-act="chainView" data-arg="list">' +
      ico('list') +
      ' 列表</button>' +
      '<button type="button" class="xb-chain-viewbtn' +
      (view === 'mindmap' ? ' on' : '') +
      '" data-act="chainView" data-arg="mindmap">' +
      ico('link') +
      ' 脑图</button></div>' +
      body +
      '</div></div>'
    );
  }

  function pageGraph() {
    var view = _local.graphView || 'equity';
    var links = D().graphLinks || [];
    var nodeMap = {};
    var colors = { company: '#2563eb', person: '#7c3aed', org: '#059669', risk: '#dc2626' };
    links.forEach(function (l) {
      if (!nodeMap[l.from]) {
        nodeMap[l.from] = {
          id: l.from,
          type: /基金|科创|产业/.test(l.from) ? 'org' : 'company',
        };
      }
      if (!nodeMap[l.to]) {
        nodeMap[l.to] = {
          id: l.to,
          type: /基金|科创|产业/.test(l.to)
            ? 'org'
            : /客户|厂/.test(l.rel)
              ? 'company'
              : 'company',
        };
      }
    });
    if (view === 'risk') {
      nodeMap['应收异常'] = { id: '应收异常', type: 'risk' };
      nodeMap['关联交易'] = { id: '关联交易', type: 'risk' };
      links = links.concat([
        { from: '星河智造', to: '应收异常', rel: '预警' },
        { from: '清泉环保', to: '关联交易', rel: '关注' },
      ]);
      links.forEach(function (l) {
        if (!nodeMap[l.from]) nodeMap[l.from] = { id: l.from, type: 'company' };
        if (!nodeMap[l.to]) nodeMap[l.to] = { id: l.to, type: 'risk' };
      });
    }
    if (view === 'people') {
      nodeMap = {
        张明: { id: '张明', type: 'person' },
        星河智造: { id: '星河智造', type: 'company' },
        李华: { id: '李华', type: 'person' },
        浦东科创: { id: '浦东科创', type: 'org' },
        王芳: { id: '王芳', type: 'person' },
        华章科技: { id: '华章科技', type: 'company' },
      };
      links = [
        { from: '张明', to: '星河智造', rel: '实控人' },
        { from: '李华', to: '浦东科创', rel: '合伙人' },
        { from: '王芳', to: '华章科技', rel: 'CEO' },
        { from: '浦东科创', to: '星河智造', rel: '股东' },
      ];
    }
    var nodes = Object.keys(nodeMap).map(function (k) {
      return nodeMap[k];
    });
    var W = 720;
    var H = 480;
    var cx = W / 2;
    var cy = H / 2 + 20;
    var R = Math.min(W, H) * 0.32;
    nodes.forEach(function (n, i) {
      var a = (Math.PI * 2 * i) / Math.max(nodes.length, 1) - Math.PI / 2;
      n.x = cx + Math.cos(a) * R;
      n.y = cy + Math.sin(a) * R;
    });
    var pos = {};
    nodes.forEach(function (n) {
      pos[n.id] = n;
    });
    var edgesSvg = links
      .map(function (l) {
        var a = pos[l.from];
        var b = pos[l.to];
        if (!a || !b) return '';
        var mx = (a.x + b.x) / 2;
        var my = (a.y + b.y) / 2;
        return (
          '<line class="xb-graph-edge" x1="' +
          a.x.toFixed(1) +
          '" y1="' +
          a.y.toFixed(1) +
          '" x2="' +
          b.x.toFixed(1) +
          '" y2="' +
          b.y.toFixed(1) +
          '" />' +
          '<text class="xb-graph-edge-label" x="' +
          mx.toFixed(1) +
          '" y="' +
          (my - 4).toFixed(1) +
          '" text-anchor="middle">' +
          esc(l.rel) +
          '</text>'
        );
      })
      .join('');
    var nodesSvg = nodes
      .map(function (n) {
        var c = colors[n.type] || colors.company;
        return (
          '<g class="xb-graph-node" transform="translate(' +
          n.x.toFixed(1) +
          ',' +
          n.y.toFixed(1) +
          ')">' +
          '<circle r="18" fill="' +
          c +
          '" />' +
          '<text y="36" text-anchor="middle">' +
          esc(n.id.length > 8 ? n.id.slice(0, 7) + '…' : n.id) +
          '</text></g>'
        );
      })
      .join('');

    var kbList = ((D().knowledge || {}).kbs || [])
      .map(function (kb) {
        var on = _local.graphBoundKbId === kb.id;
        return (
          '<button type="button" class="xb-knowledge-nav-btn' +
          (on ? ' on' : '') +
          '" style="width:100%;margin-bottom:4px" data-act="bindGraphKb" data-arg="' +
          esc(kb.id) +
          '">' +
          ico('folder') +
          ' ' +
          esc(kb.name) +
          (on ? ' · 已绑定' : '') +
          '</button>'
        );
      })
      .join('');

    var viewTabs = [
      ['equity', '股权穿透'],
      ['risk', '风险排查'],
      ['people', '关键人物'],
    ]
      .map(function (t) {
        return (
          '<button type="button" class="xb-graph-view-pill' +
          (view === t[0] ? ' on' : '') +
          '" data-act="graphView" data-arg="' +
          t[0] +
          '">' +
          t[1] +
          '</button>'
        );
      })
      .join('');

    return (
      toolbar('项目图谱') +
      '<div class="page-body"><p class="xb-feature-lead">跨文档实体关联可视化：股权、风险与关键人物一图串联。</p>' +
      '<div class="xb-graph-layout"><aside class="xb-graph-side"><h4>绑定知识库</h4>' +
      '<p>选择资料库后，图谱从文档实体与公开关系抽取生成。</p>' +
      (kbList || '<p style="color:var(--xb-faint);font-size:12px">暂无资料库，请先在资料库创建</p>') +
      '<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" data-nav="knowledge">管理资料库</button>' +
      '</aside><div class="xb-graph-canvas-wrap">' +
      '<div class="xb-graph-toolbar">' +
      viewTabs +
      '</div>' +
      '<svg class="xb-graph-svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" preserveAspectRatio="xMidYMid meet">' +
      edgesSvg +
      nodesSvg +
      '</svg>' +
      '<div class="xb-graph-legend">' +
      '<span><i class="xb-graph-dot" style="background:#2563eb"></i>企业</span>' +
      '<span><i class="xb-graph-dot" style="background:#7c3aed"></i>人物</span>' +
      '<span><i class="xb-graph-dot" style="background:#059669"></i>机构</span>' +
      '<span><i class="xb-graph-dot" style="background:#dc2626"></i>风险</span>' +
      '</div>' +
      '<div class="xb-graph-hint">示意节点 · 切换上方视图查看不同关系面</div>' +
      '</div></div></div>'
    );
  }

  function hub() {
    return window.EXPERT_HUB || {};
  }

  function statusLabel(st) {
    if (st === 'live') return '直播中';
    if (st === 'soon') return '预告';
    if (st === 'done') return '已结束';
    return st || '';
  }

  function pageExperts() {
    var H = hub();
    var tab = _local.expertTab || 'meetings';
    var sector = _local.meetingSector || '全部';
    var noteSector = _local.notesSector || '全部';
    var enrolled = _local.enrolledIds || [];

    var lead =
      tab === 'meetings'
        ? '专家路演与电话会：在线报名参与，已结束场次可看回放、阅读纪要。'
        : tab === 'notes'
          ? '按行业浏览专家会议纪要；点选后进入对话，右侧保留原文，可直接问小星。'
          : '可预约平台专家或一线调研专员。提交诉求后 1–3 个工作日内专人联系对接。';

    var tabs =
      '<div class="xb-expert-hub-tabs xb-skills-tabs" role="tablist">' +
      [
        ['meetings', '专家会议'],
        ['notes', '会议纪要'],
        ['booking', '专家对接'],
      ]
        .map(function (t) {
          return (
            '<button type="button" class="xb-skills-tab' +
            (tab === t[0] ? ' on' : '') +
            '" data-act="expertTab" data-arg="' +
            t[0] +
            '">' +
            t[1] +
            '</button>'
          );
        })
        .join('') +
      '</div>';

    var body = '';
    if (tab === 'meetings') {
      var meetings = (H.meetings || []).filter(function (m) {
        return sector === '全部' || m.sector === sector;
      });
      var chips = (H.sectors || [])
        .slice(0, 8)
        .map(function (s) {
          return (
            '<button type="button" class="xb-sector-chip' +
            (sector === s ? ' on' : '') +
            '" data-act="meetingSector" data-arg="' +
            esc(s) +
            '">' +
            esc(s) +
            '</button>'
          );
        })
        .join('');
      body =
        '<div class="xb-sector-filter">' +
        chips +
        '</div><div class="xb-meeting-grid">' +
        meetings
          .map(function (m) {
            var isEnrolled = enrolled.indexOf(m.id) >= 0 || m.enrolled;
            var noteId = 'n1';
            (H.notes || []).forEach(function (n) {
              if (n.meetingId === m.id) noteId = n.id;
            });
            if (m.id === 'mt6') noteId = 'n2';
            var action = '';
            if (m.status === 'done') {
              action =
                '<button type="button" class="xb-btn-mini" data-act="openMeetingNote" data-arg="' +
                esc(noteId) +
                '">看纪要并提问</button>';
            } else if (isEnrolled) {
              action = '<span class="xb-m-enrolled">已报名</span>';
            } else {
              action =
                '<button type="button" class="xb-btn-mini primary" data-act="enrollMeeting" data-arg="' +
                esc(m.id) +
                '">报名</button>';
            }
            return (
              '<article class="xb-meeting-card">' +
              '<div class="xb-meeting-cover" style="background-image:url(\'' +
              esc(m.cover) +
              '\')' +
              (m.coverPosition ? ';background-position:' + esc(m.coverPosition) : '') +
              '">' +
              '<span class="xb-m-badge xb-m-badge--' +
              esc(m.status) +
              '">' +
              statusLabel(m.status) +
              '</span>' +
              '<span class="xb-m-count">' +
              m.count +
              ' ' +
              esc(m.countLabel) +
              '</span></div>' +
              '<div class="xb-meeting-body"><h3>' +
              esc(m.title) +
              '</h3><p class="xb-m-speaker">' +
              esc(m.speaker) +
              ' · ' +
              esc(m.org) +
              '</p><div class="xb-meeting-foot"><span class="xb-m-tag">' +
              esc(m.tag) +
              '</span><span class="xb-m-time">' +
              esc(m.time) +
              '</span></div><div class="xb-meeting-actions">' +
              action +
              '</div></div></article>'
            );
          })
          .join('') +
        '</div>';
    } else if (tab === 'notes') {
      var notes = (H.notes || []).filter(function (n) {
        if (noteSector === '全部') return true;
        return (n.tags || []).indexOf(noteSector) >= 0;
      });
      var nchips = (H.noteSectors || [])
        .map(function (s) {
          return (
            '<button type="button" class="xb-sector-chip' +
            (noteSector === s ? ' on' : '') +
            '" data-act="notesSector" data-arg="' +
            esc(s) +
            '">' +
            esc(s) +
            '</button>'
          );
        })
        .join('');
      body =
        '<div class="xb-sector-filter">' +
        nchips +
        '</div>' +
        notes
          .map(function (n) {
            return (
              '<button type="button" class="xb-jr-item" data-act="openMeetingNote" data-arg="' +
              esc(n.id) +
              '"><strong>' +
              esc(n.title) +
              '</strong><span class="xb-mini-meta">' +
              esc(n.speaker) +
              ' · ' +
              esc(n.date) +
              ' · ' +
              n.points +
              ' 条要点</span><div style="margin-top:6px">' +
              (n.tags || [])
                .map(function (tag) {
                  return '<span class="xb-mini-tag">' + esc(tag) + '</span>';
                })
                .join('') +
              '</div><span class="xb-jr-link">打开纪要并提问 →</span></button>'
            );
          })
          .join('');
    } else {
      body =
        '<h4 class="xb-section-h">一线调研</h4><div class="xb-expert-grid-flat">' +
        (H.reporters || [])
          .map(function (re) {
            return (
              '<article class="xb-expert-tile xb-expert-tile--reporter">' +
              '<span class="xb-reporter-badge">' +
              esc(re.role) +
              '</span><strong>' +
              esc(re.name) +
              '</strong><span class="xb-expert-tile-field">' +
              esc(re.field) +
              '</span><p class="xb-expert-tile-desc">' +
              esc(re.exp) +
              '</p><span class="xb-expert-tile-cap">可做：' +
              esc(re.canDo) +
              '</span>' +
              '<button type="button" class="xb-btn-mini primary" style="margin-top:auto;width:100%" data-act="bookReporter" data-arg="' +
              esc(re.id) +
              '">预约</button></article>'
            );
          })
          .join('') +
        '</div><h4 class="xb-section-h">平台专家</h4><div class="xb-expert-grid-flat">' +
        (H.bookingExperts || [])
          .map(function (e) {
            return (
              '<article class="xb-expert-tile"><strong>' +
              esc(e.name) +
              '</strong><span class="xb-expert-tile-field">' +
              esc(e.field) +
              '</span><span class="xb-expert-tile-cap">擅长：' +
              esc((e.capabilities || '').split('、')[0] || e.field) +
              '</span>' +
              '<button type="button" class="xb-btn-mini primary" style="margin-top:auto;width:100%" data-act="bookExpert" data-arg="' +
              esc(e.id) +
              '">预约</button></article>'
            );
          })
          .join('') +
        '</div><div class="xb-section-card xb-match-card"><h4 class="xb-section-h" style="margin-top:0">没有合适的？</h4>' +
        '<p class="xb-block-desc">描述你想了解的问题和期望的专家背景，提交后为你匹配合适人选。</p>' +
        '<button type="button" class="xb-btn-mini primary" data-act="matchExpert">提交需求</button></div>';
    }

    return (
      toolbar('专家智库') +
      '<div class="page-body"><p class="xb-feature-lead">' +
      esc(lead) +
      '</p>' +
      tabs +
      body +
      '</div>'
    );
  }

  function pageJournalist() {
    var J = hub().journalist || {};
    if (_local.journalistView === 'report') {
      var r = J.report || {};
      return (
        toolbar(
          '调研报告',
          '<button type="button" class="btn btn-ghost" data-act="journalistBack">返回</button>'
        ) +
        '<div class="page-body"><div class="xb-section-card">' +
        '<h3 style="margin:0 0 6px">' +
        esc(r.title || '调研报告') +
        '</h3><span class="xb-mini-meta">' +
        esc(r.reporter || '') +
        ' · ' +
        esc(r.date || '') +
        ' · 已完成 · 关联项目：' +
        esc(r.projectName || '') +
        '</span><p style="margin:12px 0;line-height:1.55">' +
        esc(r.judgment || '') +
        '</p><h4 class="xb-section-h" style="margin-top:0">关键发现</h4><ul style="padding-left:18px;margin:0">' +
        (r.findings || [])
          .map(function (f) {
            return '<li style="margin:6px 0">' + esc(f) + '</li>';
          })
          .join('') +
        '</ul></div></div>'
      );
    }

    var c = J.caseCard || {};
    var reqs = _local.jrRequests || J.requests || [];
    _local.jrRequests = reqs;
    var tags = (c.tags || [])
      .map(function (t) {
        return '<span class="xb-mini-tag">' + esc(t) + '</span>';
      })
      .join('');
    var rep = J.report || {};

    var jrModal = _local.jrFormOpen
      ? '<div class="xb-modal-mask" data-act="closeJrForm">' +
        '<div class="xb-modal" data-stop="1" onclick="event.stopPropagation()">' +
        '<h3>新建调研需求</h3>' +
        '<p class="hint">填写想核实的问题，留下联系方式，我们会与你联系。</p>' +
        '<label>企业全称</label>' +
        '<input class="search" id="peJCompany" placeholder="例如：苏州某某科技有限公司" style="width:100%" />' +
        '<label>想核实的问题</label>' +
        '<textarea class="composer-textarea" id="peJFocus" rows="3" placeholder="订单 / 产能 / 渠道等"></textarea>' +
        '<label>联系方式</label>' +
        '<input class="search" id="peJContact" placeholder="手机或邮箱" style="width:100%" />' +
        '<div class="xb-modal-actions">' +
        '<button type="button" class="btn btn-ghost" data-act="closeJrForm">取消</button>' +
        '<button type="button" class="btn btn-primary" data-act="submitJournalist">提交</button>' +
        '</div></div></div>'
      : '';

    return (
      toolbar('一线调研') +
      '<div class="page-body"><p class="xb-feature-lead">' +
      esc(J.lead || '') +
      '</p>' +
      '<div class="xb-section-card"><div class="xb-section-card-head"><h3>调研案例</h3></div>' +
      '<strong>' +
      esc(c.title || '') +
      '</strong><div style="margin-top:8px">' +
      tags +
      '</div><p style="margin:10px 0 0;font-size:13px;color:var(--xb-muted);line-height:1.55">' +
      esc(c.summary || '') +
      '</p>' +
      '<a class="xb-jr-link" href="' +
      esc(c.url || '#') +
      '" target="_blank" rel="noopener">阅读原文 ↗</a></div>' +
      '<div class="xb-section-card"><div class="xb-section-card-head"><div><h3>发起定制调研</h3>' +
      '<p class="xb-block-desc" style="margin:4px 0 0">填写想核实的问题，留下联系方式，我们会与你联系</p></div>' +
      '<button type="button" class="xb-btn-mini primary" data-act="openJrForm">+ 新建调研需求</button></div>' +
      '<h4 class="xb-section-h" style="margin-top:4px">我的调研申请</h4>' +
      reqs
        .map(function (q) {
          return (
            '<button type="button" class="xb-jr-item"><strong>' +
            esc(q.company) +
            '</strong><span class="xb-mini-meta">' +
            esc(q.status) +
            ' · ' +
            esc(q.submittedAt) +
            '</span><p style="margin:6px 0 0;font-size:12px;color:var(--xb-muted);line-height:1.45">' +
            esc(q.questions) +
            '</p></button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="xb-section-card"><div class="xb-section-card-head"><h3>我的调研报告</h3></div>' +
      '<button type="button" class="xb-jr-item" data-act="openJournalistReport"><strong>' +
      esc(rep.title || '') +
      '</strong><span class="xb-mini-meta">' +
      esc(rep.reporter || '') +
      ' · ' +
      esc(rep.date || '') +
      ' · 已完成 · 关联项目：' +
      esc(rep.projectName || '') +
      '</span><p style="margin:8px 0 0;font-size:12px;color:var(--xb-muted);line-height:1.45">' +
      esc(rep.judgment || '') +
      '</p><span class="xb-jr-link">查看完整报告</span></button></div></div>' +
      jrModal
    );
  }

  function pageMonitor() {
    var tab = _local.monitorTab || 'all';
    var company = _local.monitorCompany || 'all';
    var brief = D().monitorBrief || {};
    var feed = D().monitorFeed || [];
    var companies = D().monitorCompanies || [];
    var rules = D().monitorRules || [];
    var alertCount = feed.filter(function (m) {
      return m.triggered;
    }).length;

    var briefHtml =
      '<section class="xb-monitor-brief"><div class="xb-monitor-brief-head"><div>' +
      '<span class="xb-monitor-brief-ai">' +
      esc(brief.aiLabel || 'AI 综合解读') +
      '</span><h2>' +
      esc(brief.title || '近 7 日项目动态摘要') +
      '</h2></div><span class="xb-monitor-brief-meta">' +
      esc(brief.meta || '') +
      '</span></div><div class="xb-monitor-brief-content"><p class="xb-monitor-brief-summary">' +
      esc(brief.summary || '') +
      '</p><div class="xb-monitor-brief-insights">' +
      '<div class="xb-monitor-brief-insight"><strong>' +
      esc(brief.riskTitle || '重点风险') +
      '</strong><p>' +
      esc(brief.riskText || '') +
      '</p></div>' +
      '<div class="xb-monitor-brief-insight"><strong>' +
      esc(brief.positiveTitle || '正向进展') +
      '</strong><p>' +
      esc(brief.positiveText || '') +
      '</p></div>' +
      '<div class="xb-monitor-brief-insight"><strong>' +
      esc(brief.actionTitle || '建议跟进') +
      '</strong><p>' +
      esc(brief.actionText || '') +
      '</p></div></div></div></section>';

    var tabs =
      '<div class="xb-monitor-tabs">' +
      [
        ['alert', '重点关注' + (alertCount ? ' (' + alertCount + ')' : '')],
        ['all', '全部动态'],
        ['rules', '预警条件 (' + rules.length + ')'],
      ]
        .map(function (t) {
          return (
            '<button type="button" class="xb-monitor-tab' +
            (tab === t[0] ? ' on' : '') +
            '" data-act="monitorTab" data-arg="' +
            t[0] +
            '">' +
            t[1] +
            '</button>'
          );
        })
        .join('') +
      '</div>';

    var body = '';
    if (tab === 'rules') {
      body =
        '<div class="xb-monitor-rules-head"><h4 class="xb-section-h xb-monitor-rules-title" style="margin:0">预警条件与类型</h4>' +
        '<button type="button" class="xb-btn-mini primary" data-act="newMonitorRule">新建条件</button></div>' +
        rules
          .map(function (r) {
            return (
              '<div class="xb-monitor-rule-item' +
              (r.triggered ? ' has-alert' : '') +
              '"><div class="xb-monitor-rule-main"><div class="xb-monitor-rule-top"><strong>' +
              esc(r.company) +
              '</strong> <span class="tag">' +
              esc(r.status) +
              '</span></div><p class="xb-monitor-rule-cond">' +
              esc(r.condition) +
              '</p><span class="xb-mini-tag">' +
              esc(r.dimension) +
              '</span> <span class="xb-mini-meta">关联 ' +
              esc(r.projectName) +
              ' · 创建于 ' +
              esc(r.time) +
              '</span></div><div class="xb-monitor-rule-actions">' +
              '<button type="button" class="xb-btn-mini" data-act="editMonitorRule">编辑</button>' +
              '<button type="button" class="xb-btn-mini" data-act="deleteMonitorRule" data-arg="' +
              esc(r.id) +
              '">删除</button></div></div>'
            );
          })
          .join('');
    } else {
      var source = tab === 'alert' ? feed.filter(function (m) { return m.triggered; }) : feed;
      var filtered =
        company === 'all'
          ? source
          : source.filter(function (m) {
              return m.company === company;
            });
      var rail =
        '<div class="xb-monitor-company-rail">' +
        '<button type="button" class="xb-monitor-company-item' +
        (company === 'all' ? ' on' : '') +
        '" data-act="monitorCompany" data-arg="all"><div><strong>全部</strong></div>' +
        (alertCount ? '<span class="xb-monitor-badge">' + alertCount + '</span>' : '') +
        '</button>' +
        companies
          .map(function (c) {
            return (
              '<button type="button" class="xb-monitor-company-item' +
              (company === c.key ? ' on' : '') +
              '" data-act="monitorCompany" data-arg="' +
              esc(c.key) +
              '"><div><strong>' +
              esc(c.company) +
              '</strong><span>' +
              esc(c.projectName) +
              '</span></div>' +
              (c.alertCount ? '<span class="xb-monitor-badge">' + c.alertCount + '</span>' : '') +
              '</button>'
            );
          })
          .join('') +
        '</div>';
      var items = filtered
        .map(function (m) {
          return (
            '<article class="xb-monitor-feed-item"><div class="xb-monitor-feed-marker"><span class="xb-monitor-dot ' +
            (m.triggered ? 'is-alert' : m.positive ? 'is-ok' : '') +
            '"></span></div><div class="xb-monitor-feed-body"><div class="xb-monitor-feed-head"><strong>' +
            esc(m.company) +
            '</strong><span class="xb-mini-meta">' +
            esc(m.time) +
            '</span></div><span class="xb-mini-tag">' +
            esc(m.projectName) +
            '</span><p class="xb-monitor-feed-fact">' +
            esc(m.change) +
            '</p><span class="xb-mini-tag">' +
            esc(m.dimension) +
            '</span></div></article>'
          );
        })
        .join('');
      body =
        '<div class="xb-monitor-split">' +
        rail +
        '<div class="xb-monitor-feed-list">' +
        (items || '<div class="empty-hint">暂无动态</div>') +
        '</div></div>';
    }

    return (
      toolbar('项目动态') +
      '<div class="page-body"><p class="xb-feature-lead">' +
      esc(D().monitorLead || '') +
      '</p>' +
      briefHtml +
      tabs +
      body +
      '</div>'
    );
  }

  function pageKnowledge() {
    var K = D().knowledge || {};
    var kbs = K.kbs || [];
    var pane = _local.knowledgePane;
    if (pane == null || pane === 'empty') {
      pane = kbs.length ? kbs[0].id : 'empty';
      _local.knowledgePane = pane;
    }
    var isFilled = pane !== 'empty' && pane !== 'lists' && pane !== 'news' && pane !== 'ai';

    var kbItems = kbs.length
      ? kbs
          .map(function (kb) {
            return (
              '<div class="xb-knowledge-kb-row">' +
              '<button type="button" class="xb-knowledge-nav-btn' +
              (pane === kb.id ? ' on' : '') +
              '" data-act="knowledgePane" data-arg="' +
              esc(kb.id) +
              '"><span class="xb-knowledge-nav-label">' +
              esc(kb.name) +
              '</span></button>' +
              '<button type="button" class="xb-knowledge-kb-more" data-act="kbMenu" data-arg="' +
              esc(kb.id) +
              '" title="更多">⋯</button>' +
              (_local.kbMenuId === kb.id
                ? '<div class="xb-knowledge-kb-menu"><button type="button" data-act="openEditKb" data-arg="' +
                  esc(kb.id) +
                  '">编辑</button><button type="button" data-act="deleteKb" data-arg="' +
                  esc(kb.id) +
                  '">删除</button></div>'
                : '') +
              '</div>'
            );
          })
          .join('')
      : '<p class="xb-knowledge-side-hint">创建资料库以开始索引文档</p>';

    var sideNav =
      '<div class="xb-knowledge-side-scroll">' +
      '<div class="xb-knowledge-sec"><div class="xb-knowledge-sec-h"><span>知识库</span><button type="button" class="xb-btn-mini" data-act="openCreateKb" title="创建资料库">' +
      ico('plus') +
      '</button></div>' +
      kbItems +
      '</div>' +
      '<div class="xb-knowledge-sec"><div class="xb-knowledge-sec-h"><span>我的沉淀</span></div>' +
      '<button type="button" class="xb-knowledge-nav-btn' +
      (pane === 'lists' ? ' on' : '') +
      '" data-act="knowledgePane" data-arg="lists">' +
      ico('list') +
      '<span>保存的名单</span></button>' +
      '<button type="button" class="xb-knowledge-nav-btn' +
      (pane === 'news' ? ' on' : '') +
      '" data-act="knowledgePane" data-arg="news">' +
      ico('news') +
      '<span>收藏的资讯</span></button>' +
      '<button type="button" class="xb-knowledge-nav-btn' +
      (pane === 'ai' ? ' on' : '') +
      '" data-act="knowledgePane" data-arg="ai">' +
      ico('bookmark') +
      '<span>AI 产出</span></button></div></div>' +
      (kbs.length
        ? ''
        : '<div class="xb-knowledge-side-footer"><button type="button" class="btn btn-primary xb-knowledge-create-footer" data-act="openCreateKb">' +
          ico('plus') +
          ' 创建资料库</button></div>');

    function iconAct(act, arg, title, iconName, danger) {
      return (
        '<button type="button" class="xb-icon-act' +
        (danger ? ' is-danger' : '') +
        '" data-act="' +
        act +
        '"' +
        (arg ? ' data-arg="' + esc(arg) + '"' : '') +
        ' title="' +
        esc(title) +
        '">' +
        ico(iconName) +
        '</button>'
      );
    }

    function savedRow(title, desc, meta, actions) {
      return (
        '<div class="xb-materials-row"><div class="xb-materials-row-main"><strong>' +
        esc(title) +
        '</strong>' +
        (desc ? '<div class="xb-materials-row-desc">' + esc(desc) + '</div>' : '') +
        (meta ? '<div class="xb-mini-meta">' + esc(meta) + '</div>' : '') +
        '</div><div class="xb-materials-row-actions">' +
        actions +
        '</div></div>'
      );
    }

    var main = '';
    if (pane === 'lists') {
      main =
        '<div class="xb-knowledge-panel"><h2>保存的名单</h2><p class="xb-feature-lead">从找项目等场景收藏的标的名单</p>' +
        ((K.savedLists || [])
          .map(function (x) {
            var name = typeof x === 'string' ? x : x.name;
            var desc =
              typeof x === 'string' ? '' : (x.sector || '赛道') + ' · ' + (x.source || '找项目');
            var meta =
              typeof x === 'string'
                ? ''
                : '保存于 ' + (x.time || '') + ' · ' + (x.count || 0) + ' 家';
            return savedRow(
              name,
              desc,
              meta,
              iconAct('toast', '已打开名单', '查看', 'eye') +
                iconAct('toast', '已下载', '下载', 'file') +
                iconAct('toast', '已移除名单', '删除', 'trash', true)
            );
          })
          .join('') || '<p class="xb-find-hint">暂无保存名单</p>') +
        '</div>';
    } else if (pane === 'news') {
      main =
        '<div class="xb-knowledge-panel"><h2>收藏的资讯</h2><p class="xb-feature-lead">投资雷达等场景收藏的资讯</p>' +
        ((K.savedNews || [])
          .map(function (x) {
            var title = typeof x === 'string' ? x : x.title;
            var desc = typeof x === 'string' ? '' : x.source || '';
            var meta = typeof x === 'string' ? '' : '收藏于 ' + (x.time || '');
            return savedRow(
              title,
              desc,
              meta,
              iconAct('toast', '已打开资讯', '查看', 'eye') +
                iconAct('toast', '已移除收藏', '删除', 'trash', true)
            );
          })
          .join('') || '<p class="xb-find-hint">暂无收藏资讯</p>') +
        '</div>';
    } else if (pane === 'ai') {
      main =
        '<div class="xb-knowledge-panel"><h2>AI 产出</h2><p class="xb-feature-lead">对话与报告中沉淀的 AI 产出</p>' +
        ((K.aiOutputs || [])
          .map(function (o) {
            return savedRow(
              o.title,
              o.kind || '产出',
              '生成于 ' + (o.time || ''),
              iconAct('toast', '已打开产出', '查看', 'eye') +
                iconAct('toast', '已下载', '下载', 'file') +
                iconAct('toast', '已删除产出', '删除', 'trash', true)
            );
          })
          .join('') || '<p class="xb-find-hint">暂无 AI 产出</p>') +
        '</div>';
    } else if (isFilled && kbs.some(function (k) { return k.id === pane; })) {
      var kb = null;
      kbs.forEach(function (k) {
        if (k.id === pane) kb = k;
      });
      var allDocs = K.docs || [];
      var docs = allDocs.filter(function (d) {
        return d.kbId === kb.id;
      });
      var docRows = docs.length
        ? docs
            .map(function (d) {
              return (
                '<div class="xb-kb-doc-row">' +
                '<div class="xb-kb-doc-main"><strong>' +
                esc(d.name) +
                '</strong><span class="xb-mini-meta">' +
                esc(d.time || d.project || '') +
                '</span></div>' +
                '<div class="xb-kb-doc-side"><span class="xb-kb-status">' +
                esc(d.status || '已入库') +
                '</span>' +
                iconAct('previewKbDoc', d.name, '预览', 'eye') +
                iconAct('deleteKbDoc', d.name, '删除', 'trash', true) +
                '</div></div>'
              );
            })
            .join('')
        : '<div class="xb-kb-docs-empty"><div class="xb-knowledge-empty-media">' +
          ico('folder') +
          '</div><h3>暂无文档</h3><p>上传文档以开始索引</p>' +
          '<button type="button" class="btn btn-ghost" data-act="uploadKbDoc">' +
          ico('plus') +
          ' 上传文档</button></div>';
      main =
        '<div class="xb-knowledge-panel"><div class="xb-knowledge-panel-head"><div><h2>' +
        esc(kb.name) +
        '</h2><p class="xb-feature-lead">' +
        esc(kb.desc || '共 ' + (docs.length || kb.docs || 0) + ' 篇文档') +
        '</p></div>' +
        '<button type="button" class="btn btn-ghost xb-kb-test-btn" data-act="openKbSearch">' +
        ico('flask') +
        ' 检索测试</button></div><div class="xb-knowledge-sep"></div>' +
        (docs.length
          ? '<div class="xb-kb-toolbar"><button type="button" class="btn btn-primary" data-act="uploadKbDoc">' +
            ico('plus') +
            ' 上传文档</button></div>'
          : '') +
        (_local.kbSearchOpen
          ? '<div class="xb-kb-search-panel"><input id="peKbSearch" placeholder="输入关键词检索本库…" value="' +
            esc(_local.kbSearchQuery || '') +
            '" /><button type="button" class="btn btn-primary" data-act="runKbSearch">检索</button>' +
            '<button type="button" class="btn btn-ghost" data-act="closeKbSearch">关闭</button>' +
            '<div class="xb-kb-search-hits">' +
            ((_local.kbSearchHits || [])
              .map(function (h) {
                return (
                  '<div class="xb-kb-doc-row"><div class="xb-kb-doc-main"><strong>' +
                  esc(h.name) +
                  '</strong><span class="xb-mini-meta">' +
                  esc(h.snippet || '') +
                  '</span></div></div>'
                );
              })
              .join('') ||
              (_local.kbSearchQuery
                ? '<p class="xb-find-hint">未命中文档</p>'
                : '<p class="xb-find-hint">输入关键词后点检索</p>')) +
            '</div></div>'
          : '') +
        '<div class="xb-kb-docs">' +
        docRows +
        '</div></div>';
    } else {
      main =
        '<div class="xb-knowledge-empty"><div class="xb-knowledge-empty-media">' +
        ico('folder') +
        '</div><h3>暂无资料库</h3><p>创建资料库以开始索引文档</p>' +
        '<button type="button" class="btn btn-primary" data-act="openCreateKb">' +
        ico('plus') +
        ' 创建资料库</button></div>';
    }

    var createModal = '';
    if (_local.kbCreateOpen || _local.kbEditId) {
      var editKb = null;
      if (_local.kbEditId) {
        (kbs || []).forEach(function (k) {
          if (k.id === _local.kbEditId) editKb = k;
        });
      }
      createModal =
        '<div class="xb-modal-mask" data-act="' +
        (_local.kbEditId ? 'closeEditKb' : 'closeCreateKb') +
        '">' +
        '<div class="xb-modal xb-kb-create-modal" data-stop="1">' +
        '<h3>' +
        (_local.kbEditId ? '编辑资料库' : '创建资料库') +
        '</h3><p class="hint">' +
        (_local.kbEditId ? '修改名称与描述后保存。' : '命名后选择向量模型，即可开始索引文档。') +
        '</p>' +
        '<label>名称</label><input id="peKbName" placeholder="例如：机构尽调知识库" value="' +
        esc(editKb ? editKb.name : '') +
        '" />' +
        '<label>描述（可选）</label><textarea id="peKbDesc" rows="3" placeholder="用途与收录范围">' +
        esc(editKb ? editKb.desc || '' : '') +
        '</textarea>' +
        (_local.kbEditId
          ? ''
          : '<label>向量模型</label><select id="peKbEmbed"><option>finstep / bge-m3 · 1024 维</option><option>openai / text-embedding-3-small · 1536 维</option></select>') +
        '<div class="xb-modal-actions">' +
        '<button type="button" class="btn btn-ghost" data-act="' +
        (_local.kbEditId ? 'closeEditKb' : 'closeCreateKb') +
        '">取消</button>' +
        '<button type="button" class="btn btn-primary" data-act="' +
        (_local.kbEditId ? 'submitEditKb' : 'submitCreateKb') +
        '">' +
        (_local.kbEditId ? '保存' : '创建') +
        '</button>' +
        '</div></div></div>';
    }

    return (
      '<div class="xb-knowledge-layout">' +
      '<aside class="xb-knowledge-side"><div class="xb-knowledge-side-head"><h1>资料库</h1>' +
      '<div class="sub">' +
      esc(K.subtitle || '可检索知识与个人沉淀') +
      '</div></div>' +
      sideNav +
      '</aside><div class="xb-knowledge-main' +
      (pane === 'empty' || (!kbs.length && pane !== 'lists' && pane !== 'news' && pane !== 'ai')
        ? ' is-empty'
        : ' is-filled') +
      '">' +
      main +
      '</div></div>' +
      createModal
    );
  }

  function pageTemplates() {
    var nav = _local.tplNav || 'org';
    var all = D().templates || [];
    var filtered = all.filter(function (t) {
      if (nav === 'mine') return t.use === 'IC' || t.id === 'tp2';
      if (nav === 'platform') return t.use === '投后' || t.id === 'tp3';
      return true;
    });
    if (!filtered.length) filtered = all;
    var selected = _local.tplId || (filtered[0] && filtered[0].id);
    var cards = filtered
      .map(function (t) {
        var on =
          t.chapterList
            ? t.chapterList.filter(function (c) {
                return c.on;
              }).length
            : t.chapters;
        return (
          '<div class="xb-tpl-card' +
          (selected === t.id ? ' on' : '') +
          '" data-act="selectTpl" data-arg="' +
          esc(t.id) +
          '"><div><strong>' +
          esc(t.name) +
          '</strong><div class="desc">' +
          esc(t.use) +
          '场景 · 章节可按机构口径启停</div>' +
          '<div class="meta">' +
          on +
          ' 章启用 · 更新 ' +
          esc(t.updated) +
          '</div></div>' +
          '<button type="button" class="btn btn-primary" data-act="useTemplate" data-arg="' +
          esc(t.id) +
          '">用于项目</button></div>'
        );
      })
      .join('');

    var navItems = [
      ['org', '机构模板', 'building'],
      ['mine', '我的模板', 'user'],
      ['platform', '平台标准', 'book'],
    ]
      .map(function (n) {
        return (
          '<button type="button" class="xb-tpl-nav-item' +
          (nav === n[0] ? ' on' : '') +
          '" data-act="tplNav" data-arg="' +
          n[0] +
          '">' +
          ico(n[2]) +
          '<span>' +
          n[1] +
          '</span></button>'
        );
      })
      .join('');

    return (
      toolbar('报告模板') +
      '<div class="page-body"><div class="xb-tpl-shell"><aside class="xb-tpl-nav"><div class="xb-tpl-nav-h">模板来源</div>' +
      navItems +
      '</aside><div class="xb-tpl-main"><h3 style="margin:0 0 4px;font-size:16px">' +
      (nav === 'mine' ? '我的模板' : nav === 'platform' ? '平台标准' : '机构模板') +
      '</h3><p class="xb-feature-lead" style="margin-bottom:14px">按机构口径管理章节骨架，一键用于当前项目。</p>' +
      cards +
      '</div></div></div>'
    );
  }

  /* ——— 期间口径：模板 / 换算引擎 / 矩阵 ——— */

  function getActivePeriodTemplate() {
    var cfg = getActiveFinanceConfig();
    var list = cfg.periodTemplates || [];
    var id = _local.activePeriodTemplateId || 'pt-q-ytd-only';
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return (
      list[0] || {
        id: 'pt-q-ytd-only',
        name: '季度 · 仅累计',
        frequency: 'quarterly',
        primary: 'ytd',
        columns: ['ytd'],
        derive: { target: 'quarter', from: 'ytd' },
        desc: '报表仅含本年累计；提取累计数，Q2-Q4 用当期累计 − 上期累计倒减出当季。',
      }
    );
  }

  function periodTypeLabel(id) {
    var cfg = getActiveFinanceConfig();
    var t = (cfg.periodTypes || []).filter(function (x) {
      return x.id === id;
    })[0];
    return t ? t.name : id;
  }

  function periodTypeShort(id) {
    var cfg = getActiveFinanceConfig();
    var t = (cfg.periodTypes || []).filter(function (x) {
      return x.id === id;
    })[0];
    return t ? t.short : id;
  }

  function periodRuleById(id) {
    var cfg = getActiveFinanceConfig();
    var r = (cfg.periodRules || []).filter(function (x) {
      return x.id === id;
    })[0];
    return r ? { enabled: r.enabled !== false } : { enabled: true };
  }

  function periodTemplateCardHtml(tpl, active) {
    return (
      '<button type="button" class="xb-fin-tpl-card' +
      (active ? ' on' : '') +
      '" data-act="selectPeriodTemplate" data-arg="' +
      esc(tpl.id) +
      '">' +
      '<div class="xb-fin-tpl-head"><strong>' +
      esc(tpl.name) +
      '</strong><span class="xb-fin-tpl-freq ' +
      (tpl.frequency === 'quarterly' ? 'q' : 'm') +
      '">' +
      (tpl.frequency === 'quarterly' ? '季度' : '月度') +
      '</span></div>' +
      '<p class="xb-fin-tpl-desc">' +
      esc(tpl.desc) +
      '</p>' +
      '<div class="xb-fin-tpl-meta"><span class="xb-fin-tpl-primary">主口径 · ' +
      esc(periodTypeLabel(tpl.primary)) +
      '</span>' +
      (tpl.detail
        ? '<span class="xb-fin-tpl-derive">逐月全量 · 最新一期为准</span>'
        : tpl.derive
          ? '<span class="xb-fin-tpl-derive">倒减 ' + esc(periodTypeLabel(tpl.derive.target)) + '</span>'
          : '') +
      '</div></button>'
    );
  }

  function periodRuleRowHtml(r, editable) {
    var on = !!r.enabled;
    return (
      '<div class="xb-fin-rule-card' +
      (on ? '' : ' is-off') +
      '"><div class="xb-fin-rule-top"><div class="xb-fin-rule-title">' +
      '<button type="button" class="xb-fin-switch' +
      (on ? ' on' : '') +
      '" role="switch" aria-checked="' +
      (on ? 'true' : 'false') +
      '"' +
      (editable
        ? ' data-act="togglePeriodRule" data-arg="' + esc(r.id) + '" title="' + (on ? '点击停用' : '点击启用') + '"'
        : ' disabled title="平台规则只读，新建我的配置后可操作"') +
      '><span></span></button>' +
      '<strong>' +
      esc(r.name) +
      '</strong></div>' +
      '<span class="xb-fin-rule-expr">' +
      esc(r.desc || '') +
      '</span></div></div>'
    );
  }

  /* 换算引擎：以累计为权威锚点，当期直取优先、倒减补缺、勾稽校验。
     演示数据为 mock（单位：万元）。
     monthly 模板：ytd = 每月累计、period = 每月当期（仅 detail 模板直取 period）；
     quarterly 模板：ytd = 季度累计、direct 覆盖 = 报表直取当期（模拟勾稽差异）。 */
  var PERIOD_MOCK_DATA = {
    quarterly: [
      { name: '营业总收入', ytd: [8200, 17500, 27800, 38600], direct: { 2: 9296 } },
      { name: '营业成本', ytd: [5600, 12000, 19200, 26600], direct: {} },
      { name: '净利润', ytd: [900, 1900, 3200, 4300], direct: {} },
    ],
    monthly: [
      { name: '营业总收入', ytd: [1300, 2800, 4500, 6200, 8100, 10000], period: [1300, 1500, 1700, 1700, 1900, 1900], direct: {} },
      { name: '营业成本', ytd: [900, 1900, 3100, 4300, 5600, 6900], period: [900, 1000, 1200, 1200, 1300, 1300], direct: {} },
      { name: '净利润', ytd: [140, 310, 480, 640, 810, 1000], period: [140, 170, 170, 160, 170, 190], direct: {} },
    ],
  };

  function fmtAmt(v) {
    if (v == null) return '—';
    var s = Math.round(v).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function periodSrcBadge(src) {
    if (src === 'direct') return '<span class="xb-fin-src xb-fin-src-direct">直取</span>';
    if (src === 'derive') return '<span class="xb-fin-src xb-fin-src-derive">倒减</span>';
    if (src === 'diff') return '<span class="xb-fin-src xb-fin-src-diff">勾稽差异</span>';
    return '';
  }

  function periodMatrixHtml(tpl) {
    tpl = tpl || getActivePeriodTemplate();
    var freq = tpl.frequency === 'monthly' ? 'monthly' : 'quarterly';
    var mock = PERIOD_MOCK_DATA[freq];
    var n = mock[0].ytd.length;
    var labels = freq === 'monthly' ? ['1月', '2月', '3月', '4月', '5月', '6月'] : ['Q1', 'Q2', 'Q3', 'Q4'];
    var hasDirect =
      (tpl.columns || []).indexOf('quarter') >= 0 ||
      (tpl.columns || []).indexOf('month') >= 0 ||
      !!tpl.detail;
    var prDerive = periodRuleById('pr-derive').enabled;
    var prCheck = periodRuleById('pr-check').enabled;

    var head =
      '<tr><th class="l">科目</th>' +
      labels
        .map(function (l) {
          return '<th class="r">' + l + '</th>';
        })
        .join('') +
      '<th class="r">本年累计</th></tr>';

    var rows = mock
      .map(function (row) {
        var cells = '';
        for (var i = 0; i < n; i++) {
          var ytdVal = row.ytd[i];
          var prev = i === 0 ? 0 : row.ytd[i - 1];
          var calc = ytdVal - prev;
          var directVal = row.direct && row.direct[i] != null ? row.direct[i] : null;
          var periodDirect = tpl.detail && row.period ? row.period[i] : null;
          var val = null;
          var src = '';
          if (periodDirect != null) {
            val = periodDirect;
            src = 'direct';
          } else if (i === 0) {
            val = ytdVal;
            src = 'direct';
          } else if (hasDirect && directVal != null) {
            val = directVal;
            src = prCheck && Math.abs(directVal - calc) > 0.5 ? 'diff' : 'direct';
          } else if (hasDirect && !prDerive) {
            val = null;
            src = '';
          } else if (prDerive) {
            val = calc;
            src = 'derive';
          } else {
            val = null;
            src = '';
          }
          cells +=
            '<td class="r">' +
            (val == null
              ? '<span class="xb-fin-mtx-empty">—</span>'
              : '<span class="xb-fin-mtx-val">' + fmtAmt(val) + '</span> ' + periodSrcBadge(src)) +
            '</td>';
        }
        return (
          '<tr><td class="l">' +
          esc(row.name) +
          '</td>' +
          cells +
          '<td class="r"><span class="xb-fin-mtx-val">' +
          fmtAmt(row.ytd[n - 1]) +
          '</span> ' +
          periodSrcBadge('direct') +
          '</td></tr>'
        );
      })
      .join('');

    var legend =
      '<div class="xb-fin-mtx-legend">' +
      periodSrcBadge('direct') +
      '<span class="xb-fin-mtx-legend-txt">报表直取（原文权威值）</span>' +
      periodSrcBadge('derive') +
      '<span class="xb-fin-mtx-legend-txt">倒减计算值（当期累计 − 上期累计）</span>' +
      periodSrcBadge('diff') +
      '<span class="xb-fin-mtx-legend-txt">勾稽不符，需人工复核</span>' +
      '</div>';

    var ruleNote =
      '<p class="xb-fin-hint">当前模板：<strong>' +
      esc(tpl.name) +
      '</strong>（主口径 · ' +
      esc(periodTypeLabel(tpl.primary)) +
      (tpl.derive
        ? '；' + esc(periodTypeLabel(tpl.derive.target)) + ' = 本期累计 − 上期累计'
        : '') +
      (freq === 'monthly' && tpl.detail ? '；逐月全量提取，以最新一期财报为准' : '') +
      '）。金额为演示数据（万元）。</p>';

    return (
      ruleNote +
      '<div class="xb-fin-mtx-wrap"><table class="xb-fin-mtx"><thead>' +
      head +
      '</thead><tbody>' +
      rows +
      '</tbody></table></div>' +
      legend
    );
  }

  /* 财报深读：上传解析后的"列口径标注"（对应众源访谈承诺的人工勾选） */
  function financeColumnTagHtml() {
    var cols = [
      { id: 'col-1', label: '2026年6月 金额', def: 'month' },
      { id: 'col-2', label: '1-6月 本年累计', def: 'ytd' },
      { id: 'col-3', label: '上年同期累计', def: 'lytd' },
    ];
    var tags = _local.finColTags || {};
    return cols
      .map(function (c) {
        var v = tags[c.id] || c.def;
        var opts = (getActiveFinanceConfig().periodTypes || [])
          .map(function (t) {
            return (
              '<option value="' +
              t.id +
              '"' +
              (v === t.id ? ' selected' : '') +
              '>' +
              esc(t.name) +
              '</option>'
            );
          })
          .join('');
        return (
          '<div class="xb-fin-coltag-row"><span class="xb-fin-coltag-name">' +
          esc(c.label) +
          '</span><select class="xb-fin-coltag-select" data-fin-coltag data-arg="' +
          c.id +
          '">' +
          opts +
          '</select></div>'
        );
      })
      .join('');
  }

  function bindFinanceColTags(root) {
    root.querySelectorAll('[data-fin-coltag]').forEach(function (el) {
      if (el._finColTagBound) return;
      el._finColTagBound = true;
      el.addEventListener('change', function () {
        _local.finColTags = _local.finColTags || {};
        _local.finColTags[el.getAttribute('data-arg')] = el.value;
      });
    });
  }

  function normalizeFinanceRule(r) {
    return {
      id: r.id,
      name: r.name,
      expr: r.expr || r.rule || '',
      severity: r.severity || (r.level === '高' ? 'critical' : 'warning'),
      msg: r.msg || r.rule || '',
      enabled: r.enabled != null ? !!r.enabled : r.on !== false,
    };
  }

  function financeRuleCardHtml(r, editable) {
    var on = !!r.enabled;
    return (
      '<div class="xb-fin-rule-card' +
      (on ? '' : ' is-off') +
      '"><div class="xb-fin-rule-top"><div class="xb-fin-rule-title">' +
      '<button type="button" class="xb-fin-switch' +
      (on ? ' on' : '') +
      '" role="switch" aria-checked="' +
      (on ? 'true' : 'false') +
      '"' +
      (editable
        ? ' data-act="toggleRule" data-arg="' + esc(r.id) + '" title="' + (on ? '点击停用' : '点击启用') + '"'
        : ' disabled title="模板只读，新建我的配置后可操作"') +
      '><span></span></button>' +
      '<strong class="' +
      (on ? '' : 'is-strike') +
      '">' +
      esc(r.name) +
      '</strong>' +
      '<span class="xb-fin-sev ' +
      (r.severity === 'critical' ? 'crit' : 'warn') +
      '">' +
      (r.severity === 'critical' ? '严重' : '警告') +
      '</span></div>' +
      '<span class="xb-fin-rule-expr">' +
      esc(r.expr || '') +
      '</span>' +
      (editable
        ? '<button type="button" class="xb-icon-act is-danger" data-act="deleteFinanceRule" data-arg="' +
          esc(r.id) +
          '" title="删除">' +
          ico('trash') +
          '</button>'
        : '') +
      '</div><p class="xb-fin-rule-msg">' +
      esc(r.msg || '') +
      '</p></div>'
    );
  }

  function pageFinanceConfig() {
    ensureFinanceConfigs();
    var cfg = getActiveFinanceConfig();
    cfg.rules = (cfg.rules || []).map(normalizeFinanceRule);
    var editable = cfg.scope === 'user';
    var tab = _local.finTab || 'subjects';
    var stmt = _local.finStmt || 'is';
    var list = _local.financeConfigs;
    var menuOpen = !!_local.finConfigMenuOpen;

    var tabs = [
      ['subjects', '科目库'],
      ['metrics', '指标计算'],
      ['rules', '规则引擎'],
      ['period', '期间口径'],
    ]
      .map(function (t) {
        return (
          '<button type="button" class="xb-fin-tab' +
          (tab === t[0] ? ' on' : '') +
          '" data-act="finTab" data-arg="' +
          t[0] +
          '">' +
          t[1] +
          '</button>'
        );
      })
      .join('');

    var actions = '';
    if (!editable) {
      actions =
        '<button type="button" class="btn btn-ghost xb-fin-outline-btn" data-act="cloneFinanceConfig">' +
        ico('plus') +
        ' 新建我的配置</button>';
    } else if (_local.finRenameOpen) {
      actions =
        '<input class="xb-fin-rename-input" id="peFinRename" value="' +
        esc(_local.finRenameVal || cfg.name) +
        '" />' +
        '<button type="button" class="xb-icon-act" data-act="confirmFinRename" title="确认">' +
        ico('check') +
        '</button>' +
        '<button type="button" class="xb-icon-act" data-act="cancelFinRename" title="取消">' +
        ico('x') +
        '</button>';
    } else {
      actions =
        '<button type="button" class="xb-icon-act" data-act="startFinRename" title="重命名">' +
        ico('pencil') +
        '</button>' +
        '<button type="button" class="xb-icon-act is-danger" data-act="deleteFinanceConfig" title="删除此配置">' +
        ico('trash') +
        '</button>';
    }
    if (list.length > 1) {
      actions +=
        '<button type="button" class="btn btn-ghost" data-act="toggleFinConfigMenu">切换 ' +
        ico('chevronDown') +
        '</button>';
    }

    var switchMenu = '';
    if (menuOpen) {
      switchMenu =
        '<div class="xb-fin-switch-menu xb-fin-switch-menu--card">' +
        list
          .map(function (c) {
            return (
              '<button type="button" class="xb-fin-switch-item' +
              (c.id === cfg.id ? ' on' : '') +
              '" data-act="selectFinanceConfig" data-arg="' +
              esc(c.id) +
              '">' +
              esc(c.name) +
              '<span>' +
              esc(financeScopeLabel(c.scope)) +
              '</span></button>'
            );
          })
          .join('') +
        '</div>';
    }

    var body = '';
    if (tab === 'subjects') {
      var stmtTabs = [
        ['is', '利润表'],
        ['bs', '资产负债表'],
        ['cf', '现金流量表'],
      ]
        .map(function (s) {
          var cnt = (cfg.subjects || []).filter(function (x) {
            return x.stmt === s[0];
          }).length;
          return (
            '<button type="button" class="xb-fin-stmt' +
            (stmt === s[0] ? ' on' : '') +
            '" data-act="finStmt" data-arg="' +
            s[0] +
            '">' +
            s[1] +
            '<span class="cnt">' +
            cnt +
            '</span></button>'
          );
        })
        .join('');

      var subjectRows = (cfg.subjects || [])
        .filter(function (s) {
          return s.stmt === stmt;
        })
        .map(function (s) {
          if (!editable) {
            return (
              '<div class="xb-fin-subject-readonly"><strong>' +
              esc(s.name) +
              '</strong>' +
              (s.aliases
                ? '<span class="muted">' + esc(s.aliases) + '</span>'
                : '') +
              '</div>'
            );
          }
          return (
            '<div class="xb-fin-subject-edit" data-subject-id="' +
            esc(s.id) +
            '">' +
            '<select class="xb-fin-stmt-select" data-fin-field="stmt" data-arg="' +
            esc(s.id) +
            '">' +
            '<option value="is"' +
            (s.stmt === 'is' ? ' selected' : '') +
            '>利润表</option>' +
            '<option value="bs"' +
            (s.stmt === 'bs' ? ' selected' : '') +
            '>资产负债表</option>' +
            '<option value="cf"' +
            (s.stmt === 'cf' ? ' selected' : '') +
            '>现金流量表</option></select>' +
            '<input class="xb-fin-name-input" data-fin-field="name" data-arg="' +
            esc(s.id) +
            '" value="' +
            esc(s.name) +
            '" placeholder="标准科目名" />' +
            '<input class="xb-fin-alias-input" data-fin-field="aliases" data-arg="' +
            esc(s.id) +
            '" value="' +
            esc(s.aliases || '') +
            '" placeholder="别名，逗号或 · 分隔" />' +
            '<button type="button" class="xb-icon-act is-danger" data-act="deleteFinanceSubject" data-arg="' +
            esc(s.id) +
            '" title="删除">' +
            ico('trash') +
            '</button></div>'
          );
        })
        .join('');

      body =
        (editable
          ? '<div class="xb-fin-upload-zone">' +
            '<div class="xb-fin-upload-main"><strong>上传科目表（覆盖当前科目库）</strong>' +
            '<p class="muted">支持 Excel / CSV / PDF。表格即时解析；PDF 将先 OCR 识别科目名再导入。</p></div>' +
            '<div class="xb-fin-upload-acts">' +
            '<button type="button" class="btn btn-ghost" data-act="downloadSubjectSample">下载示例</button>' +
            '<button type="button" class="btn btn-primary" data-act="importFinanceSubjects">上传文件</button>' +
            '</div></div>' +
            '<div class="xb-fin-toolbar-row"><p class="xb-fin-hint">标准科目名即指标/规则中的引用名；别名用于 OCR 映射。修改后失焦自动保存。</p>' +
            '<button type="button" class="btn btn-ghost" data-act="addFinanceSubject">' +
            ico('plus') +
            ' 新增科目</button></div>'
          : '<p class="xb-fin-hint">平台标准科目库（三表 + 别名），供全行业 OCR 映射与指标计算引用。</p>') +
        '<div class="xb-fin-stmt-tabs">' +
        stmtTabs +
        '</div><div class="xb-fin-subject-list">' +
        (subjectRows || '<p class="xb-find-hint">该报表暂无科目' + (editable ? '，可点「新增科目」添加' : '') + '</p>') +
        '</div>';
    } else if (tab === 'metrics') {
      if (!editable) {
        body =
          '<p class="xb-fin-hint">平台指标只读。新建「我的配置」后可增删改；或切换机构模板查看客户定制口径。</p>' +
          (cfg.metrics || [])
            .map(function (m) {
              return (
                '<div class="xb-fin-metric-card"><div class="xb-fin-metric-head"><strong>' +
                esc(m.name) +
                '</strong>' +
                (m.unit ? '<span class="xb-fin-unit">' + esc(m.unit) + '</span>' : '') +
                '</div><p class="xb-fin-metric-formula"><span>计算口径：</span>' +
                esc(m.formula || '') +
                '</p>' +
                (m.desc ? '<p class="muted" style="font-size:12px;margin:4px 0 0">' + esc(m.desc) + '</p>' : '') +
                '</div>'
              );
            })
            .join('');
      } else {
        body =
          '<div class="xb-fin-toolbar-row"><p class="xb-fin-hint">选填科目与公式即可配置计算口径；失焦自动保存。</p>' +
          '<button type="button" class="btn btn-ghost" data-act="addFinanceMetric">' +
          ico('plus') +
          ' 新增指标</button></div>' +
          (cfg.metrics || [])
            .map(function (m) {
              return (
                '<div class="xb-fin-metric-edit" data-metric-id="' +
                esc(m.id) +
                '"><div class="xb-fin-metric-edit-row">' +
                '<input class="xb-fin-name-input" data-fin-mfield="name" data-arg="' +
                esc(m.id) +
                '" value="' +
                esc(m.name) +
                '" placeholder="指标名称" />' +
                '<input class="xb-fin-unit-input" data-fin-mfield="unit" data-arg="' +
                esc(m.id) +
                '" value="' +
                esc(m.unit || '') +
                '" placeholder="单位" />' +
                '<button type="button" class="xb-icon-act is-danger" data-act="deleteFinanceMetric" data-arg="' +
                esc(m.id) +
                '" title="删除">' +
                ico('trash') +
                '</button></div>' +
                '<input class="xb-fin-formula-input" data-fin-mfield="formula" data-arg="' +
                esc(m.id) +
                '" value="' +
                esc(m.formula || '') +
                '" placeholder="公式，如 (营业收入-营业成本)/营业收入" />' +
                '</div>'
              );
            })
            .join('');
      }
    } else if (tab === 'period') {
      var ptpl = getActivePeriodTemplate();
      var ptSub = _local.finPeriodTab || 'templates';
      var ptSubTabs = [
        ['templates', '场景模板'],
        ['matrix', '科目×期间矩阵'],
      ]
        .map(function (s) {
          return (
            '<button type="button" class="xb-fin-stmt' +
            (ptSub === s[0] ? ' on' : '') +
            '" data-act="finPeriodTab" data-arg="' +
            s[0] +
            '">' +
            s[1] +
            '</button>'
          );
        })
        .join('');
      var periodRules = cfg.periodRules || [];
      var periodTypes = cfg.periodTypes || [];
      body =
        (editable
          ? '<p class="xb-fin-hint">自定义配置可调整口径字典、场景模板与规则开关；修改即时生效。</p>'
          : '<p class="xb-fin-hint">平台预置 5 种报表形态（月度/季度 × 累计/当期），对应投后报表常见差异；财报深读上传后按所选模板执行提取、倒减与勾稽校验。</p>') +
        '<div class="xb-fin-stmt-tabs">' +
        ptSubTabs +
        '</div>' +
        (ptSub === 'matrix'
          ? periodMatrixHtml(ptpl)
          : '<div class="xb-fin-tpl-grid">' +
            (cfg.periodTemplates || [])
              .map(function (t) {
                return periodTemplateCardHtml(t, t.id === ptpl.id);
              })
              .join('') +
            '</div>' +
            '<p class="xb-fin-group-label">口径字典 · ' +
            periodTypes.length +
            ' 种</p><div class="xb-fin-period-types">' +
            periodTypes
              .map(function (t) {
                return (
                  '<div class="xb-fin-period-type"><strong>' +
                  esc(t.name) +
                  '</strong><span class="xb-fin-period-type-stmts">' +
                  esc(t.stmts.toUpperCase()) +
                  '</span><p class="muted">' +
                  esc(t.desc) +
                  '</p></div>'
                );
              })
              .join('') +
            '</div>' +
            '<p class="xb-fin-group-label">期间规则 · ' +
            periodRules.length +
            ' 条</p><div class="xb-fin-rule-list">' +
            periodRules
              .map(function (r) {
                return periodRuleRowHtml(r, editable);
              })
              .join('') +
            '</div>');
    } else {
      var rules = (cfg.rules || []).map(normalizeFinanceRule);
      var critical = rules.filter(function (r) {
        return r.severity === 'critical';
      });
      var warning = rules.filter(function (r) {
        return r.severity !== 'critical';
      });
      body =
        (editable
          ? '<div class="xb-fin-toolbar-row"><p class="xb-fin-hint">开关控制是否启用；可新增预警规则，删除后不可恢复。</p>' +
            '<button type="button" class="btn btn-ghost" data-act="addFinanceRule">' +
            ico('plus') +
            ' 新增规则</button></div>'
          : '') +
        (critical.length
          ? '<p class="xb-fin-group-label">数据完整性（必须通过）· ' +
            critical.length +
            ' 条</p><div class="xb-fin-rule-list">' +
            critical.map(function (r) {
              return financeRuleCardHtml(r, editable);
            }).join('') +
            '</div>'
          : '') +
        (warning.length
          ? '<p class="xb-fin-group-label">财务预警 · ' +
            warning.length +
            ' 条</p><div class="xb-fin-rule-list">' +
            warning.map(function (r) {
              return financeRuleCardHtml(r, editable);
            }).join('') +
            '</div>'
          : '');
    }

    var hint = !editable
      ? '平台通用 baseline：标准三表科目、核心指标与预警规则。点「新建我的配置」复制后可编辑；机构可在 Admin 维护专属模板。'
      : '正在编辑个人配置。科目/指标/规则修改后失焦自动保存（本会话 Demo 状态）。';

    return (
      toolbar('财务配置') +
      '<div class="page-body"><p class="xb-feature-lead">维护科目体系、指标公式与校验规则；财报深读上传 PDF 并确认科目后，按本配置自动计算指标并检查规则。</p>' +
      '<div class="xb-fin-card xb-fin-card--relative"><div class="xb-fin-card-main"><div class="xb-fin-ico">' +
      ico('book') +
      '</div><div class="xb-fin-card-text"><div class="xb-fin-card-title"><strong>' +
      esc(cfg.name) +
      '</strong><span class="' +
      (editable ? 'xb-mini-tag-my' : 'xb-mini-tag-official') +
      '">' +
      esc(financeScopeLabel(cfg.scope)) +
      '</span><span class="muted xb-fin-card-counts">' +
      (cfg.subjects || []).length +
      ' 科目 · ' +
      (cfg.metrics || []).length +
      ' 指标 · ' +
      (cfg.rules || []).length +
      ' 条规则</span></div>' +
      '<div class="muted" style="font-size:12px;margin-top:4px">' +
      esc(hint) +
      '</div></div></div>' +
      '<div class="xb-fin-card-actions">' +
      actions +
      '</div>' +
      switchMenu +
      '</div>' +
      '<div class="xb-fin-tabs">' +
      tabs +
      '</div><div class="xb-fin-panel">' +
      body +
      '</div></div>'
    );
  }

  function pageSkills() {
    var M = D().market || {};
    var kind = _local.marketKind || 'experts';
    var scope = _local.marketScope || 'official';
    var cat = _local.skillCategory || 'all';
    var installed = _local.installedSkills || {};
    var installedConn = _local.installedConnectors || {};

    var kindTabs = [
      ['experts', '专家', 'users'],
      ['skills', '技能', 'zap'],
      ['connectors', '连接器', 'link'],
    ]
      .map(function (t) {
        return (
          '<button type="button" class="xb-market-kind-tab' +
          (kind === t[0] ? ' on' : '') +
          '" data-act="marketKind" data-arg="' +
          t[0] +
          '">' +
          ico(t[2]) +
          ' ' +
          t[1] +
          '</button>'
        );
      })
      .join('');

    var scopeTabs =
      '<div class="xb-skills-tabs xb-skills-tabs-scope" role="tablist">' +
      '<button type="button" class="xb-skills-tab' +
      (scope === 'official' ? ' on' : '') +
      '" data-act="marketScope" data-arg="official">官方</button>' +
      '<button type="button" class="xb-skills-tab' +
      (scope === 'my' ? ' on' : '') +
      '" data-act="marketScope" data-arg="my">我的</button></div>';

    var lead =
      kind === 'experts'
        ? scope === 'official'
          ? '平台 AI 专家，可一键召唤进对话。'
          : '你创建的专家会出现在这里。'
        : kind === 'skills'
          ? scope === 'official'
            ? '安装官方技能到工作区，对话中可直接调用。'
            : '你收藏与自建的技能。'
          : scope === 'official'
            ? '安装数据与工具连接器，扩展公开面与研究能力。'
            : '已接入的连接器。';

    var body = '';
    if (kind === 'experts') {
      var experts = (M.experts || []).filter(function (e) {
        return e.id !== 'ex-default' && e.name !== '小星助手';
      });
      if (scope === 'my') {
        experts = experts.filter(function (e) {
          return e.scope === 'mine' || e.custom;
        });
        if (!experts.length) {
          body = '<p class="xb-block-desc">暂无自定义专家。可点右上角「创建专家」添加。</p>';
        } else {
          body =
            '<div class="xb-skill-grid">' +
            experts
              .map(function (e) {
                return (
                  '<article class="xb-skill-card"><div class="xb-skill-card-top"><div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><strong>' +
                  esc(e.name) +
                  '</strong><span class="xb-mini-tag">' +
                  esc(e.field || e.category || '自定义') +
                  '</span><span class="xb-mini-tag-my">我的</span></div></div><p>' +
                  esc(e.summary || e.field || '') +
                  '</p><div class="xb-skill-card-actions"><button type="button" class="xb-btn-mini-primary" data-act="summonExpert" data-arg="' +
                  esc(e.id) +
                  '">' +
                  ico('sparkles') +
                  ' 召唤</button></div></article>'
                );
              })
              .join('') +
            '</div>';
        }
      } else {
        body =
          '<div class="xb-skill-grid">' +
          experts
            .filter(function (e) {
              return e.scope !== 'mine' && !e.custom;
            })
            .map(function (e) {
              return (
                '<article class="xb-skill-card"><div class="xb-skill-card-top"><div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><strong>' +
                esc(e.name) +
                '</strong><span class="xb-mini-tag">' +
                esc(e.category) +
                '</span><span class="xb-mini-tag-official">官方</span></div></div><p>' +
                esc(e.summary) +
                '</p><div class="xb-skill-tags">' +
                (e.skills || [])
                  .slice(0, 4)
                  .map(function (s) {
                    return '<span class="xb-mini-tag">' + esc(s) + '</span>';
                  })
                  .join('') +
                '</div><div class="xb-skill-card-actions"><button type="button" class="xb-btn-mini-primary" data-act="summonExpert" data-arg="' +
                esc(e.id) +
                '">' +
                ico('sparkles') +
                ' 召唤</button></div></article>'
              );
            })
            .join('') +
          '</div>';
      }
    } else if (kind === 'skills') {
      var skills = (M.skills || []).filter(function (s) {
        return cat === 'all' || s.category === cat;
      });
      if (scope === 'my') {
        skills = skills.filter(function (s) {
          return installed[s.id];
        });
        if (!skills.length) {
          body = '<p class="xb-block-desc">暂无已安装技能。切换到「官方」安装后会出现在这里。</p>';
        }
      }
      if (!body) {
        var cats = (M.skillCategories || [])
          .map(function (c) {
            return (
              '<button type="button" class="xb-skills-tab' +
              (cat === c.id ? ' on' : '') +
              '" data-act="skillCategory" data-arg="' +
              esc(c.id) +
              '">' +
              esc(c.label) +
              '</button>'
            );
          })
          .join('');
        body =
          (scope === 'official'
            ? '<div class="xb-skills-tabs xb-skills-category-tabs">' + cats + '</div>'
            : '') +
          '<div class="xb-skill-grid">' +
          skills
            .map(function (s) {
              var on = !!installed[s.id];
              return (
                '<article class="xb-skill-card"><div class="flex items-start justify-between gap-2" style="display:flex;justify-content:space-between;gap:8px">' +
                '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0"><strong>' +
                esc(s.name) +
                '</strong><span class="xb-mini-tag">' +
                esc(s.category) +
                '</span><span class="xb-mini-tag-official">官方</span></div>' +
                '<button type="button" class="xb-market-add-btn' +
                (on ? ' is-installed' : '') +
                '" data-act="toggleSkillInstall" data-arg="' +
                esc(s.id) +
                '" title="' +
                (on ? '从工作区移除' : '加入工作区') +
                '">' +
                (on ? '−' : '+') +
                '</button></div><p>' +
                esc(s.desc) +
                '</p></article>'
              );
            })
            .join('') +
          '</div>';
      }
    } else {
      var conns = M.connectors || [];
      if (scope === 'my') {
        conns = conns.filter(function (c) {
          return installedConn[c.id];
        });
        if (!conns.length) body = '<p class="xb-block-desc">暂无已接入连接器。</p>';
      }
      if (!body) {
        body =
          '<div class="xb-skill-grid">' +
          conns
            .map(function (c) {
              var on = !!installedConn[c.id];
              return (
                '<article class="xb-skill-card"><div style="display:flex;justify-content:space-between;gap:8px"><div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><strong>' +
                esc(c.name) +
                '</strong><span class="xb-mini-tag">' +
                esc(c.category) +
                '</span><span class="xb-mini-tag-official">官方</span></div>' +
                '<button type="button" class="xb-market-add-btn' +
                (on ? ' is-installed' : '') +
                '" data-act="toggleConnectorInstall" data-arg="' +
                esc(c.id) +
                '">' +
                (on ? '−' : '+') +
                '</button></div><p>' +
                esc(c.desc) +
                '</p><p class="xb-mini-meta">底层 ' +
                (c.serverCount || 1) +
                ' 路服务</p></article>'
              );
            })
            .join('') +
          '</div>';
      }
    }

    var headerActs =
      '<button type="button" class="xb-btn-mini-primary" data-act="openMarketCreate" data-arg="skill">' +
      ico('plus') +
      ' 创建技能</button> <button type="button" class="xb-btn-mini-primary" data-act="openMarketCreate" data-arg="expert">' +
      ico('users') +
      ' 创建专家</button>';

    var marketCreateModal = '';
    if (_local.marketCreateKind) {
      var isSkill = _local.marketCreateKind === 'skill';
      marketCreateModal =
        '<div class="xb-modal-mask" data-act="closeMarketCreate">' +
        '<div class="xb-modal xb-kb-create-modal" data-stop="1">' +
        '<h3>' +
        (isSkill ? '创建技能' : '创建专家') +
        '</h3><p class="hint">' +
        (isSkill ? '填写名称与说明后，会出现在「我的」能力列表。' : '填写专家名称与擅长领域，加入本地专家库。') +
        '</p>' +
        '<label>名称</label><input id="peMarketName" placeholder="' +
        (isSkill ? '例如：应收账龄拆解' : '例如：半导体赛道专家') +
        '" />' +
        '<label>' +
        (isSkill ? '说明' : '擅长领域') +
        '</label><textarea id="peMarketDesc" rows="3" placeholder="' +
        (isSkill ? '技能用途与输入输出' : '行业 / 交易类型 / 交付物') +
        '"></textarea>' +
        '<div class="xb-modal-actions">' +
        '<button type="button" class="btn btn-ghost" data-act="closeMarketCreate">取消</button>' +
        '<button type="button" class="btn btn-primary" data-act="submitMarketCreate">创建</button>' +
        '</div></div></div>';
    }

    return (
      toolbar('能力市场', headerActs) +
      '<div class="page-body"><p class="xb-feature-lead">' +
      esc(lead) +
      '</p><div class="skills-market-toolbar"><div class="xb-market-kind-tabs">' +
      kindTabs +
      '</div>' +
      scopeTabs +
      '</div>' +
      body +
      '</div>' +
      marketCreateModal
    );
  }

  function pageAssistant() {
    var s = D().settings || {};
    var name = s.displayName || '王敏';
    var org  = s.org || '鼎晖投资';

    function section(title, body) {
      return '<div class="panel" style="padding:16px;margin-bottom:12px">' +
        '<div style="font-size:11px;font-weight:700;letter-spacing:.07em;color:var(--xb-muted,#6b7280);text-transform:uppercase;margin-bottom:10px">' + esc(title) + '</div>' +
        body + '</div>';
    }
    function tagChip(text, accent) {
      return '<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;margin:3px 3px 3px 0;' +
        (accent
          ? 'background:rgba(99,102,241,.1);color:var(--xb-accent,#6366f1);border:1px solid rgba(99,102,241,.2)'
          : 'background:var(--xb-surface,#f9fafb);color:var(--xb-text);border:1px solid var(--xb-border,#e5e7eb)') +
        '">' + esc(text) + '</span>';
    }
    function kv(label, val) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--xb-border,#e5e7eb)">' +
        '<span style="font-size:12px;color:var(--xb-muted,#6b7280)">' + esc(label) + '</span>' +
        '<span style="font-size:13px;font-weight:500">' + esc(val) + '</span>' +
        '</div>';
    }
    function insightRow(icon, text, sub) {
      return '<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--xb-border,#e5e7eb)">' +
        '<span style="font-size:16px;flex-shrink:0">' + icon + '</span>' +
        '<div><div style="font-size:13px">' + text + '</div>' +
        (sub ? '<div style="font-size:11px;color:var(--xb-muted,#6b7280);margin-top:2px">' + sub + '</div>' : '') +
        '</div></div>';
    }

    var profileSection = section('用户档案',
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
      '<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);' +
      'display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;flex-shrink:0">' +
      esc(name.slice(0,1)) + '</div>' +
      '<div><div style="font-size:16px;font-weight:700">' + esc(name) + '</div>' +
      '<div style="font-size:12px;color:var(--xb-muted,#6b7280)">' + esc(org) + '</div></div>' +
      '</div>' +
      kv('首次使用', '2025-11-03') +
      kv('累计对话', '324 次') +
      kv('处理项目', '41 个') +
      kv('生成报告', '18 份')
    );

    var prefSection = section('投资偏好',
      '<div style="margin-bottom:8px">' +
      '<div style="font-size:12px;color:var(--xb-muted,#6b7280);margin-bottom:6px">重点赛道</div>' +
      tagChip('人工智能', true) + tagChip('半导体', true) + tagChip('高端制造', true) +
      tagChip('新能源', false) + tagChip('医疗器械', false) +
      '</div>' +
      '<div style="margin-bottom:8px">' +
      '<div style="font-size:12px;color:var(--xb-muted,#6b7280);margin-bottom:6px">偏好阶段</div>' +
      tagChip('A轮', true) + tagChip('B轮', true) + tagChip('Pre-A', false) +
      '</div>' +
      '<div>' +
      '<div style="font-size:12px;color:var(--xb-muted,#6b7280);margin-bottom:6px">典型票仓</div>' +
      tagChip('2,000 – 5,000 万', false) +
      '</div>'
    );

    var insightSection = section('AI 行为洞察',
      insightRow('🔍', '近30天主要分析 <strong>AI算力/推理芯片</strong> 赛道', '占全部项目调研的 61%') +
      insightRow('📊', '财务分析时最常关注 <strong>毛利率趋势</strong> 与 <strong>客户集中度</strong>', '已触发 23 次自动财务预警') +
      insightRow('👥', '专家访谈平均每项目 <strong>2.4 位</strong>，高于平台均值', '平台均值 1.6 位') +
      insightRow('⚡', '偏好在 <strong>周一上午</strong> 批量处理立项材料', '高活跃时段 09:00–11:30')
    );

    var watchSection = section('关注动态',
      '<div style="padding:10px 14px;background:rgba(99,102,241,.06);border-radius:6px;' +
      'border-left:3px solid var(--xb-accent,#6366f1);margin-bottom:10px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--xb-accent,#6366f1);margin-bottom:4px">✦ 财跃启明星建议</div>' +
      '<p style="font-size:12px;line-height:1.65;margin:0;color:var(--xb-text)">您近期密集调研 GPU 算力相关项目，建议关注「算力租赁成本结构」变化——当前电力成本占比已从22%升至31%，对被投企业毛利影响显著。</p>' +
      '</div>' +
      '<div style="padding:10px 14px;background:rgba(220,38,38,.04);border-radius:6px;' +
      'border-left:3px solid var(--xb-danger,#dc2626)">' +
      '<div style="font-size:11px;font-weight:700;color:var(--xb-danger,#dc2626);margin-bottom:4px">⚠ 风险提示</div>' +
      '<p style="font-size:12px;line-height:1.65;margin:0;color:var(--xb-text)">您关注的 3 家半导体项目存在同一核心供应商依赖，建议在尽调中增加供应链穿透核查。</p>' +
      '</div>'
    );

    return toolbar('小星助手') +
      '<div class="page-body">' +
      '<div style="max-width:640px">' +
      profileSection + prefSection + insightSection + watchSection +
      '</div></div>';
  }

  function pageSettings() {
    var s = D().settings || {};
    var st = getState() || {};
    var name = _local.settingsName || s.displayName || st.displayName || '王敏';
    var phone = st.phone || s.phone || '13800138000';
    var org = s.org || st.org || '';
    var mode = (_ctx && _ctx.mode) || st.mode || s.mode || 'pe';
    var peRole = (st.peRole || 'investment');
    return (
      toolbar('个人中心') +
      '<div class="page-body"><div class="panel" style="padding:16px;max-width:520px">' +
      '<h3>我的账户</h3>' +
      '<div style="margin-top:10px"><label style="font-size:12px;color:var(--xb-muted)">姓名</label>' +
      '<div style="margin-top:4px;font-size:13px">' + esc(name) + '</div></div>' +
      '<div style="margin-top:12px"><label style="font-size:12px;color:var(--xb-muted)">手机号</label>' +
      '<div style="margin-top:4px;font-size:13px">' + esc(phone) + '</div></div>' +
      '<div style="margin-top:12px"><label style="font-size:12px;color:var(--xb-muted)">所属机构</label>' +
      '<div style="margin-top:4px;font-size:13px">' + esc(org) + '</div></div>' +
      '<div style="margin-top:12px"><label style="font-size:12px;color:var(--xb-muted)">职务</label>' +
      '<div style="margin-top:4px;font-size:13px">' + esc(s.title || st.title || '—') + '</div></div>' +
      '<div style="margin-top:28px;padding-top:16px;border-top:1px solid var(--xb-line)">' +
      '<div style="font-size:11px;color:var(--xb-faint);margin-bottom:8px">以下仅 Demo 切换预览，不进正式产品</div>' +
      (mode === 'pe'
        ? '<div style="display:flex;gap:8px;margin-bottom:8px">' +
          '<button type="button" class="btn ' + (peRole === 'investment' ? 'btn-primary' : 'btn-ghost') + '" data-act="switchPeRole" data-arg="investment">演示·首页投资向</button>' +
          '<button type="button" class="btn ' + (peRole === 'post' ? 'btn-primary' : 'btn-ghost') + '" data-act="switchPeRole" data-arg="post">演示·首页投后向</button>' +
          '</div>'
        : '') +
      '<div style="display:flex;gap:8px">' +
      '<button type="button" class="btn ' + (mode !== 'bank' ? 'btn-primary' : 'btn-ghost') + '" data-act="switchMode" data-arg="pe">PE</button>' +
      '<button type="button" class="btn ' + (mode === 'bank' ? 'btn-primary' : 'btn-ghost') + '" data-act="switchMode" data-arg="bank">银行</button>' +
      '</div></div></div></div>'
    );
  }

  function pageChats() {
    var list = D().chats || [];
    var rows = list
      .map(function (c) {
        return (
          '<button type="button" class="xb-chat-list-row" data-act="openGlobalChat" data-arg="' +
          esc(c.id) +
          '">' +
          '<div class="xb-chat-list-main"><strong>' +
          esc(c.title) +
          '</strong><div class="xb-mini-meta">' +
          esc(c.preview || '') +
          '</div></div>' +
          '<div class="xb-chat-list-side"><span class="tag">' +
          esc(c.time || '') +
          '</span>' +
          (c.projectId ? '<span class="xb-mini-tag">项目</span>' : '<span class="xb-mini-tag">问答</span>') +
          '</div></button>'
        );
      })
      .join('');
    return (
      '<div class="page-toolbar"><h1>全部对话</h1><div class="spacer"></div>' +
      '<button type="button" class="btn btn-primary" data-act="newStandaloneSession">新建对话</button></div>' +
      '<div class="page-body"><div class="xb-chat-list">' +
      (rows || '<p class="xb-find-hint">暂无对话</p>') +
      '</div></div>'
    );
  }

  function pageChatDetail(chatId) {
    var chat = resolveChatById(chatId);
    if (!chat) {
      return (
        '<div class="page-body">未找到对话 <button class="btn" data-nav="chats">返回</button></div>'
      );
    }

    /* 有项目绑定 → 走项目三栏对话（文件 | 消息 | 档案） */
    if (chat.projectId) {
      var pchat = findProjectChat(chat.projectId, chat.title, chat.projectChatId);
      if (pchat) return pageProjectChat(chat.projectId, pchat.id);
      var p = findProject(chat.projectId);
      if (p) {
        if (!p.fileTree) p.fileTree = D().defaultFileTree;
        if (!p.aiOutputs) p.aiOutputs = D().defaultAiOutputs;
        var hasRight = !!_local.rightPaneKind;
        return (
          '<div class="' +
          workspaceClass(hasRight) +
          '">' +
          fileTreeHtml(p) +
          '<div class="xb-chat-center">' +
          projectBarHtml(p) +
          chatMainColumnHtml({
            sessionTitle: chat.title,
            messagesHtml: renderMessages(ensureSessionMessages(chat)),
            composerHtml: composerDockHtml(p, chat.id),
          }) +
          '</div>' +
          rightPaneHtml(p) +
          '</div>'
        );
      }
    }

    /* 无项目：独立对话壳（顶栏 + 消息 + Composer） */
    var messages = ensureSessionMessages(chat);
    return (
      '<div class="xb-project-workspace xb-chat-standalone">' +
      '<div class="xb-chat-center">' +
      standaloneChatBarHtml(chat) +
      chatMainColumnHtml({
        messagesHtml: renderMessages(messages),
        composerHtml: peComposerHtml({
          placeholder: '继续追问或点上方场景…',
          sendAttrs: 'data-act="sendGlobalChat" data-arg="' + esc(chat.id) + '"',
          tagRowHtml: chatScenarioChipsHtml(),
        }),
      }) +
      '</div></div>'
    );
  }

  function matchProjectByName(name) {
    var list = D().projects || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name || list[i].company.indexOf(name) >= 0) return list[i];
    }
    return null;
  }

  function createDiligenceChat(query) {
    var matched = null;
    var list = D().projects || [];
    for (var i = 0; i < list.length; i++) {
      if (query.indexOf(list[i].name) >= 0 || query.indexOf(list[i].company) >= 0) {
        matched = list[i];
        break;
      }
    }
    if (!matched && /星河|智造/.test(query)) matched = findProject('p-xinghe');
    if (!matched && /清泉|环保/.test(query)) matched = findProject('p-qingquan');
    if (!matched && /华章/.test(query)) matched = findProject('p-huazhang');
    if (!matched && /安泰|生物/.test(query)) matched = findProject('p-antai');
    if (!matched && /远航|新材/.test(query)) matched = findProject('p-yuanhang');

    var chatId = 'sess-' + Date.now();
    var title = matched ? matched.name + ' · 尽调会话' : '尽调会话';
    var aiText = matched
      ? '已围绕「' + matched.company + '」建立尽调会话，并写入项目材料上下文。'
      : '已根据你的输入建立尽调会话。可继续补充企业全称或上传材料。';
    var cards = matched
      ? [
          {
            type: 'brief',
            title: '入场摘要',
            rows: [
              ['标的', matched.company],
              ['状态', matched.status],
              ['待办', matched.todo],
              ['信用代码', matched.creditCode],
            ],
          },
          {
            type: 'flags',
            title: '建议下一步',
            items: (matched.gaps || []).slice(0, 3).concat(['打开项目 Hub 查看材料与一页纸']),
          },
        ]
      : [
          {
            type: 'flags',
            title: '建议',
            items: [
              '补充企业全称以便锚定主体',
              '或从「找项目」选择标的后建项',
              '也可直接跑「项目初筛」场景',
            ],
          },
        ];

    var session = {
      id: chatId,
      title: title,
      projectId: matched ? matched.id : null,
      preview: aiText,
      time: '刚刚',
      messages: [
        { role: 'user', text: query },
        { role: 'ai', text: aiText, cards: cards },
      ],
    };

    if (matched) {
      matched.chats = matched.chats || [];
      matched.chats.unshift({
        id: chatId,
        title: title,
        preview: aiText,
        messages: session.messages,
      });
    }

    var chats = D().chats || [];
    chats.unshift({
      id: chatId,
      title: title,
      projectId: matched ? matched.id : null,
      time: '刚刚',
      preview: aiText,
      messages: session.messages,
    });

    var st = getState();
    var sessions = Object.assign({}, st.sessions || {});
    sessions[chatId] = session;
    setState({ sessions: sessions, homeDraft: '' });
    _local.homeDraft = '';
    return chatId;
  }

  function createBlankChatSession(opts) {
    opts = opts || {};
    var chatId = 'sess-blank-' + Date.now();
    var title = opts.title || '新建会话';
    var projectId = opts.projectId || null;
    var welcome =
      opts.welcome ||
      (projectId
        ? '新会话已创建。可上传材料或直接提问。'
        : '新会话已创建。可直接提问，或从场景/找项目进入标的语境。');
    var messages = [{ role: 'ai', text: welcome }];
    var session = {
      id: chatId,
      title: title,
      projectId: projectId,
      preview: welcome,
      time: '刚刚',
      messages: messages,
    };

    if (projectId) {
      var pj = findProject(projectId);
      if (pj) {
        pj.chats = pj.chats || [];
        pj.chats.unshift({
          id: chatId,
          title: title,
          preview: welcome,
          messages: messages,
        });
      }
    }

    D().chats = D().chats || [];
    D().chats.unshift({
      id: chatId,
      title: title,
      projectId: projectId,
      time: '刚刚',
      preview: welcome,
      messages: messages,
    });

    var st = getState();
    var sessions = Object.assign({}, st.sessions || {});
    sessions[chatId] = session;
    setState({ sessions: sessions });
    return chatId;
  }

  var _BI_COMPANIES = [
    { name: '核聚变能源技术有限公司', sector: '新能源' },
    { name: '脑机接口研究有限公司',   sector: '医疗科技' },
    { name: '纳米制造设备有限公司',   sector: '半导体' },
    { name: '氢能燃料电池有限公司',   sector: '新能源' },
    { name: '卫星互联网终端有限公司', sector: '航天通信' },
    { name: '生物医药CDMO有限公司',   sector: '生物医药' },
    { name: '工业互联网平台有限公司', sector: '工业软件' },
    { name: '超导材料应用有限公司',   sector: '新材料' },
    { name: '智能驾驶芯片有限公司',   sector: '半导体' },
    { name: '绿色建筑材料有限公司',   sector: '新材料' },
    { name: '数字疗法科技有限公司',   sector: '医疗科技' },
    { name: '高端装备制造有限公司',   sector: '智能制造' },
  ];

  function pageBatchImport() {
    var rows = '';
    _BI_COMPANIES.forEach(function (c, i) {
      rows += '<tr>'
        + '<td style="padding:10px 12px;color:var(--xb-text);font-size:13px">' + esc(c.name) + '</td>'
        + '<td style="padding:10px 12px;font-size:12px"><span style="padding:2px 8px;border-radius:10px;background:rgba(99,102,241,.08);color:var(--xb-accent)">' + esc(c.sector) + '</span></td>'
        + '<td style="padding:10px 12px;font-size:12px;color:var(--xb-muted)">' + esc(c.name.replace(/有限公司$/, '')) + '_2026Q2_季报.pdf</td>'
        + '<td style="padding:10px 12px" data-bi-row="' + i + '"><span style="padding:2px 8px;border-radius:10px;font-size:12px;background:var(--xb-surface);color:var(--xb-muted)">待处理</span></td>'
        + '</tr>';
    });
    return '<div class="page-body" style="padding:24px">'
      + '<div style="border:2px dashed var(--xb-border);border-radius:8px;padding:32px 24px;text-align:center;margin-bottom:20px;background:var(--xb-surface)">'
      +   '<div style="font-size:22px;margin-bottom:8px">&#9729;</div>'
      +   '<div style="font-size:14px;font-weight:600;color:var(--xb-text);margin-bottom:4px">拖拽 ZIP / PDF 到此处上传</div>'
      +   '<div style="font-size:12px;color:var(--xb-muted)">演示模式 · 已预载 12 家被投企业季报</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
      +   '<span style="font-size:13px;font-weight:600;color:var(--xb-text)">待处理文件 <span style="font-size:12px;font-weight:400;color:var(--xb-muted)">12 份</span></span>'
      +   '<div style="display:flex;gap:8px">'
      +     '<button data-bi-start style="padding:6px 16px;border-radius:6px;border:none;background:var(--xb-accent);color:#fff;font-size:13px;font-weight:500;cursor:pointer">开始批量导入</button>'
      +     '<button data-bi-dl disabled style="padding:6px 16px;border-radius:6px;border:1px solid var(--xb-border);background:var(--xb-surface);color:var(--xb-muted);font-size:13px;cursor:not-allowed">下载汇总 Excel</button>'
      +   '</div>'
      + '</div>'
      + '<table style="width:100%;border-collapse:collapse;border:1px solid var(--xb-border);border-radius:8px;overflow:hidden">'
      +   '<thead><tr style="background:var(--xb-surface)">'
      +     '<th style="padding:9px 12px;font-size:11px;font-weight:600;color:var(--xb-muted);text-align:left;text-transform:uppercase;letter-spacing:.05em">企业名称</th>'
      +     '<th style="padding:9px 12px;font-size:11px;font-weight:600;color:var(--xb-muted);text-align:left;text-transform:uppercase;letter-spacing:.05em">行业</th>'
      +     '<th style="padding:9px 12px;font-size:11px;font-weight:600;color:var(--xb-muted);text-align:left;text-transform:uppercase;letter-spacing:.05em">文件名</th>'
      +     '<th style="padding:9px 12px;font-size:11px;font-weight:600;color:var(--xb-muted);text-align:left;text-transform:uppercase;letter-spacing:.05em">状态</th>'
      +   '</tr></thead>'
      +   '<tbody>' + rows + '</tbody>'
      + '</table>'
      + '</div>';
  }

  function bindBatchImport(container) {
    if (!container) return;
    if (container._biClickAttached) return;
    container._biClickAttached = true;
    container.addEventListener('click', function (e) {
      var startBtn = e.target.closest('[data-bi-start]');
      var dlBtn    = e.target.closest('[data-bi-dl]');
      if (startBtn && !startBtn.disabled) {
        startBtn.disabled = true;
        startBtn.textContent = '处理中…';
        _BI_COMPANIES.forEach(function (_, i) {
          setTimeout(function () {
            var cell = container.querySelector('[data-bi-row="' + i + '"]');
            if (cell) cell.innerHTML = '<span style="padding:2px 8px;border-radius:10px;font-size:12px;background:rgba(99,102,241,.08);color:var(--xb-accent)">处理中</span>';
          }, i * 400);
          setTimeout(function () {
            var cell = container.querySelector('[data-bi-row="' + i + '"]');
            if (cell) cell.innerHTML = '<span style="padding:2px 8px;border-radius:10px;font-size:12px;background:#f0fdf4;color:var(--xb-green)">已完成</span>';
            if (i === _BI_COMPANIES.length - 1) {
              var dl = container.querySelector('[data-bi-dl]');
              if (dl) {
                dl.disabled = false;
                dl.style.cursor = 'pointer';
                dl.style.color = 'var(--xb-accent)';
                dl.style.borderColor = 'var(--xb-accent)';
                dl.style.background = 'transparent';
              }
              startBtn.textContent = '重新导入';
              startBtn.disabled = false;
            }
          }, i * 400 + 700);
        });
        return;
      }
      if (dlBtn && !dlBtn.disabled) {
        var t = document.getElementById('toast');
        if (t) {
          t.textContent = '汇总 Excel 已生成，正在下载…';
          t.classList.add('show');
          clearTimeout(dlBtn._tt);
          dlBtn._tt = setTimeout(function () { t.classList.remove('show'); }, 2200);
        }
      }
    });
  }

  /* ——— 投后数据工作台：文件解析 / 基金管理 / 报告中心 / 配置中心 ——— */

  function pageFileParse() {
    var d = D();
    var queue = (d.fileParseQueue) || { parsing: [], pending: [], abnormal: [], done: [], gpProgress: { total: 24, arrived: 17 } };
    var gp = queue.gpProgress;
    var gpPct = Math.round(gp.arrived / gp.total * 100);
    var pendingCount = queue.pending.length;
    var parsingCount = queue.parsing.length;
    var abnormalCount = queue.abnormal.length;

    function rowItem(it) {
      return '<div class="fp-row" data-fp-row="' + (it.id || '') + '">'
        + '<span class="fp-row-name">' + esc(it.name || '') + '</span>'
        + '<span class="fp-row-type">' + esc(it.type || '') + '</span>'
        + '<span class="fp-row-project">' + esc(it.project || '') + '</span>'
        + '<span class="fp-row-period">' + esc(it.period || '') + '</span>'
        + '<span class="fp-row-status">' + esc(it.statusLabel || '') + '</span>'
        + '</div>';
    }

    return toolbar('文件解析')
      + '<div class="page-body">'
      + '<div class="fp-gp-progress">'
      +   '<div class="fp-gp-info">'
      +     '<span class="fp-gp-num">' + gp.arrived + '</span><span class="fp-gp-slash">/</span><span class="fp-gp-denom">' + gp.total + '</span>'
      +     '<span class="fp-gp-label">支 GP 已到报</span>'
      +     '<span class="fp-gp-pct">' + gpPct + '%</span>'
      +   '</div>'
      +   '<div class="fp-gp-bar"><div class="fp-gp-bar-fill" style="width:' + gpPct + '%"></div></div>'
      +   '<button class="fp-gp-btn" data-act="genReminder">生成催收清单</button>'
      + '</div>'
      + '<div class="fp-upload-zone" data-act="uploadZone">'
      +   '<div class="fp-upload-icon">⬆</div>'
      +   '<div class="fp-upload-text">拖入文件或点击上传</div>'
      +   '<div class="fp-upload-hint">支持 PDF / Excel / 图片；AI 自动建议材料类型、归属项目与报告期间</div>'
      + '</div>'
      + '<div class="fp-stats">'
      +   '<div class="fp-stat fp-stat-pending' + (pendingCount ? ' fp-stat-active' : '') + '" data-nav="file-parse"><span class="fp-stat-num">' + pendingCount + '</span><span class="fp-stat-label">待确认</span></div>'
      +   '<div class="fp-stat fp-stat-parsing"><span class="fp-stat-num">' + parsingCount + '</span><span class="fp-stat-label">解析中</span></div>'
      +   '<div class="fp-stat fp-stat-abnormal' + (abnormalCount ? ' fp-stat-active' : '') + '"><span class="fp-stat-num">' + abnormalCount + '</span><span class="fp-stat-label">异常</span></div>'
      +   '<div class="fp-stat fp-stat-done"><span class="fp-stat-num">' + queue.done.length + '</span><span class="fp-stat-label">已完成</span></div>'
      + '</div>'
      + (pendingCount ? '<div class="fp-section"><div class="fp-section-h">待确认</div>' + queue.pending.map(rowItem).join('') + '</div>' : '')
      + (parsingCount ? '<div class="fp-section"><div class="fp-section-h">解析中</div>' + queue.parsing.map(rowItem).join('') + '</div>' : '')
      + (abnormalCount ? '<div class="fp-section"><div class="fp-section-h">异常</div>' + queue.abnormal.map(function(it) {
          return '<div class="fp-row fp-row-abnormal">' + rowItem(it).replace('<div class="fp-row"', '<div class="fp-row fp-row-abnormal-inner"')
            + '<div class="fp-row-suggest">' + esc(it.suggest || '') + '</div></div>';
        }).join('') + '</div>' : '')
      + (queue.done.length ? '<div class="fp-section"><div class="fp-section-h">已完成</div>' + queue.done.slice(0, 10).map(rowItem).join('') + '</div>' : '')
      + '</div>'
      + fpStyles();
  }

  function pageFund() {
    var d = D();
    var funds = (d.funds) || [];
    if (!funds.length) {
      funds = [
        { id: 'fund-1', name: '众源一号', type: 'FOF', status: '存续期', projects: 14, nav: '199,821', invested: '109,727' },
        { id: 'fund-2', name: '众源二号', type: 'FOF', status: '存续期', projects: 16, nav: '—', invested: '85,000' },
      ];
    }
    function fundRow(f) {
      return '<div class="fund-row" data-nav="fund/' + f.id + '">'
        + '<span class="fund-row-name">' + esc(f.name) + '</span>'
        + '<span class="fund-row-type">' + esc(f.type || '') + '</span>'
        + '<span class="fund-row-status">' + esc(f.status || '') + '</span>'
        + '<span class="fund-row-projects">' + (f.projects || 0) + ' 个项目</span>'
        + '<span class="fund-row-invested">投资金额 ' + esc(f.invested || '—') + '</span>'
        + '<span class="fund-row-nav">持股价值 ' + esc(f.nav || '—') + '</span>'
        + '</div>';
    }
    return toolbar('基金管理')
      + '<div class="page-body">'
      + '<div class="fund-list">' + funds.map(fundRow).join('') + '</div>'
      + '<p class="xb-feature-lead" style="margin-top:20px">管理基金及其关联项目。点击基金查看穿透聚合数据。</p>'
      + '</div>'
      + fundStyles();
  }

  function pageFundDetail(fundId) {
    var d = D();
    var funds = d.funds || [];
    var fund = null;
    for (var i = 0; i < funds.length; i++) {
      if (funds[i].id === fundId) { fund = funds[i]; break; }
    }
    if (!fund) {
      fund = { id: fundId, name: '基金 ' + fundId, type: 'FOF', status: '存续期', projects: 14, nav: '199,821', invested: '109,727' };
    }
    var projects = fund.associatedProjects || [
      { name: '纪元 GGV', type: '子基金', invested: '15,000', nav: '28,500', status: '在管' },
      { name: '中鼎资本', type: '子基金', invested: '12,000', nav: '18,200', status: '在管' },
      { name: '微影资本', type: '子基金', invested: '10,000', nav: '15,800', status: '在管' },
      { name: '君联资本', type: '子基金', invested: '8,000', nav: '12,400', status: '在管' },
    ];
    function projRow(p) {
      return '<div class="fund-proj-row">'
        + '<span class="fund-proj-name">' + esc(p.name) + '</span>'
        + '<span class="fund-proj-type">' + esc(p.type) + '</span>'
        + '<span class="fund-proj-invested">投资 ' + esc(p.invested || '—') + '</span>'
        + '<span class="fund-proj-nav">持股价值 ' + esc(p.nav || '—') + '</span>'
        + '<span class="fund-proj-status">' + esc(p.status || '') + '</span>'
        + '</div>';
    }
    return toolbar(fund.name)
      + '<div class="page-body">'
      + '<div class="fund-detail-stats">'
      +   '<div class="fund-detail-stat"><span class="fd-stat-label">基金类型</span><strong>' + esc(fund.type || '') + '</strong></div>'
      +   '<div class="fund-detail-stat"><span class="fd-stat-label">状态</span><strong>' + esc(fund.status || '') + '</strong></div>'
      +   '<div class="fund-detail-stat"><span class="fd-stat-label">关联项目</span><strong>' + (fund.projects || projects.length) + ' 个</strong></div>'
      +   '<div class="fund-detail-stat"><span class="fd-stat-label">投资金额</span><strong>' + esc(fund.invested || '—') + '</strong></div>'
      +   '<div class="fund-detail-stat"><span class="fd-stat-label">持股价值合计</span><strong>' + esc(fund.nav || '—') + '</strong></div>'
      + '</div>'
      + '<div class="fund-detail-section">'
      +   '<div class="fp-section-h">关联子基金</div>'
      +   projects.map(projRow).join('')
      + '</div>'
      + '<p class="xb-feature-lead" style="margin-top:16px">穿透管理：点击子基金查看底层项目数据。盘面视图可在项目库投后 Tab 查看。</p>'
      + '</div>'
      + '<style>'
      + '.fund-detail-stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px}'
      + '.fund-detail-stat{display:flex;flex-direction:column;gap:2px;padding:12px 16px;background:var(--xb-surface);border:1px solid var(--xb-border);border-radius:8px;min-width:120px}'
      + '.fd-stat-label{font-size:11px;color:var(--xb-muted)}'
      + '.fund-detail-stat strong{font-size:15px;color:var(--xb-text)}'
      + '.fund-detail-section{margin-bottom:16px}'
      + '.fund-proj-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--xb-border);border-radius:6px;margin-bottom:6px;cursor:pointer;transition:border-color .15s}'
      + '.fund-proj-row:hover{border-color:var(--xb-accent)}'
      + '.fund-proj-name{font-size:13px;font-weight:600;color:var(--xb-text);flex:1}'
      + '.fund-proj-type{font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(99,102,241,.08);color:var(--xb-accent)}'
      + '.fund-proj-invested{font-size:12px;color:var(--xb-muted)}'
      + '.fund-proj-nav{font-size:12px;color:var(--xb-muted)}'
      + '.fund-proj-status{font-size:12px;font-weight:500}'
      + '</style>';
  }

  function pageReportCenter() {
    var projects = (D().projects || []).slice(0, 8);
    function isFof(p) { return (p.type === 'fof') || !!p.gpName || !!p.underlyingProjects; }
    function periodText(p) { return isFof(p) ? '季度 / 子基金' : '季度 / 直投'; }
    var rows = projects.map(function (p) {
      var ready = p.status === '投后' || p.status === '已投资';
      return '<button type="button" class="report-center-row" data-nav="project/' + esc(p.id) + '/report">'
        + '<span class="report-center-main"><strong>' + esc(p.company || p.name) + '</strong><span>' + periodText(p) + ' · ' + (ready ? '基于已确认数据' : '存在未确认数据') + '</span></span>'
        + '<span class="tag ' + (ready ? 'ok' : 'warn') + '">' + (ready ? '已入库' : '待补齐') + '</span>'
        + '<span class="report-center-arrow">›</span>'
        + '</button>';
    }).join('');
    var templateGroups = [
      { title: '股权直投', items: [
        '项目反馈表', '直接项目一页纸', '投前访谈纪要', '企业业绩点评',
        '直接项目立项报告', '立项会会议纪要', '直接项目投决报告', '投决会决议'
      ]},
      { title: '子基金投资', items: [
        '子基金立项报告', '立项会会议纪要', '投决会决议', '子基金投后报告'
      ]},
    ];
    var templateHtml = templateGroups.map(function (g) {
      return '<section class="report-template-group"><div class="report-template-group-title">' + esc(g.title) + '</div>'
        + '<div class="report-template-grid">' + g.items.map(function (t) {
          return '<button type="button" class="report-template-card" data-nav="templates"><strong>' + esc(t) + '</strong><span>投前 / 个人模板</span></button>';
        }).join('') + '</div></section>';
    }).join('');
    return toolbar('报告中心')
      + '<div class="page-body report-center-page">'
      + '<div class="report-center-hero">'
      +   '<div class="report-center-title">AI 报告</div>'
      +   '<div class="report-center-sub">从已确认数据和项目材料直接生成投前、投决与投后报告</div>'
      +   '<button type="button" class="report-center-add" data-nav="templates">+ 添加模板</button>'
      + '</div>'
      + '<div class="report-center-summary">'
      +   '<div><strong>12</strong><span>可用模板</span></div>'
      +   '<div><strong>' + projects.length + '</strong><span>关联项目</span></div>'
      +   '<div><strong>' + projects.filter(function (p) { return p.status === '投后' || p.status === '已投资'; }).length + '</strong><span>数据已就绪</span></div>'
      + '</div>'
      + templateHtml
      + '<div class="report-center-list-head"><div><strong>项目报告</strong><span>按项目数据状态继续撰写或更新</span></div><button type="button" data-nav="projects">查看项目库</button></div>'
      + '<div class="report-center-list">' + rows + '</div>'
      + '</div>'
      + '<style>'
      + '.report-center-page{max-width:1120px;width:100%;margin:0 auto;box-sizing:border-box}.report-center-hero{text-align:center;padding:18px 0 30px}.report-center-title{font-size:28px;font-weight:800;letter-spacing:.01em}.report-center-sub{margin-top:8px;color:var(--xb-muted);font-size:12px}.report-center-add{margin-top:16px;padding:10px 22px;border:1px solid var(--xb-border,#e5e7eb);border-radius:10px;background:#fff;color:var(--xb-text,#1d1d1f);font-weight:600}'
      + '.report-center-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:-8px auto 28px}.report-center-summary>div{display:flex;align-items:baseline;gap:8px;padding:15px 18px;border:1px solid var(--xb-line);border-radius:14px;background:#fff}.report-center-summary strong{font-size:22px}.report-center-summary span{font-size:12px;color:var(--xb-muted)}'
      + '.report-template-group{margin-bottom:18px}.report-template-group-title{display:flex;align-items:center;gap:8px;margin:8px 0 12px;font-size:16px;font-weight:700;color:var(--xb-text)}'
      + '.report-template-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}'
      + '.report-template-card{min-height:92px;padding:16px;border:1px solid var(--xb-line);border-radius:16px;background:#fff;text-align:left;display:flex;flex-direction:column;justify-content:space-between}.report-template-card:hover{border-color:var(--xb-text,#1d1d1f);box-shadow:0 4px 16px rgba(0,0,0,.06)}'
      + '.report-template-card strong{font-size:14px;line-height:1.4}.report-template-card span{font-size:12px;color:var(--xb-muted)}'
      + '.report-center-list{margin-top:20px;border:1px solid var(--xb-line);border-radius:16px;overflow:hidden;background:#fff}'
      + '.report-center-list-head{display:flex;align-items:center;justify-content:space-between;margin-top:30px}.report-center-list-head div{display:flex;flex-direction:column;gap:3px}.report-center-list-head strong{font-size:16px}.report-center-list-head span{font-size:12px;color:var(--xb-muted)}.report-center-list-head button{font-size:12px;color:var(--xb-muted)}.report-center-list-head button:hover{color:var(--xb-text)}'
      + '.report-center-row{width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--xb-line);text-align:left;background:#fff}'
      + '.report-center-row:last-child{border-bottom:0}.report-center-row:hover{background:var(--xb-bg-soft)}'
      + '.report-center-main{display:flex;flex-direction:column;gap:3px;flex:1}.report-center-main strong{font-size:14px}.report-center-main span{font-size:12px;color:var(--xb-muted)}'
      + '.report-center-arrow{font-size:20px;color:var(--xb-faint)}@media(max-width:960px){.report-template-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.report-center-page{max-width:100%;padding:0}.report-center-summary{grid-template-columns:1fr}.report-template-grid{grid-template-columns:1fr}}'
      + '</style>';
  }

  function pageConfigCenter() {
    var tab   = _local.cfgTab || 'subjects';
    var modal = _local.cfgModal || null;
    var store = window.CFG_CENTER_CRUD;
    if (!store) {
      return toolbar('配置中心') + '<div class="page-body"><p>配置模块未加载</p></div>';
    }

    var NAV_ITEMS = [
      { key: 'subjects',   label: '财务准则' },
      { key: 'indicators', label: '指标配置' },
      { key: 'fields',     label: '档案配置' },
    ];

    var innerNav = NAV_ITEMS.map(function (n) {
      return '<button type="button" class="cfgcc-nav-item' + (tab === n.key ? ' on' : '')
        + '" data-act="cfgTab" data-arg="' + n.key + '">' + esc(n.label) + '</button>';
    }).join('');

    var inDetail = (tab === 'subjects' && !!_local.cfgStandard)
      || (tab === 'indicators' && !!_local.cfgIndSet)
      || (tab === 'fields' && !!_local.cfgParseTpl);

    var content = '';
    if (tab === 'subjects')   content = cfgSubjectsContent(store);
    else if (tab === 'indicators') content = cfgIndicatorsContent(store);
    else if (tab === 'fields')    content = cfgFieldsContent(store);

    var modalHtml = modal ? cfgModalHtml(modal, store) : '';

    return toolbar('配置中心')
      + '<div class="page-body cfgcc-page' + (inDetail ? ' cfgcc-page--detail' : '') + '">'
      + '<div class="cfgcc-shell' + (inDetail ? ' cfgcc-shell--detail' : '') + '">'
      + (inDetail ? '' : '<div class="cfgcc-nav">' + innerNav + '</div>')
      + '<div class="cfgcc-main">' + content + '</div>'
      + '</div></div>'
      + modalHtml
      + cfgCenterStyles();
  }

  /* ——— Config Center 三栏内容渲染 ——— */

  var STMT_LABEL = { is: '利润表', bs: '资产负债表', cf: '现金流量表', fund: '基金跟踪字段' };
  var DIR_LABEL  = { up: '上升触发', down: '下降触发', both: '双向触发' };
  var DIR_CLASS  = { up: 'cfgcc-tag--danger', down: 'cfgcc-tag--warn', both: 'cfgcc-tag--muted' };
  var METHOD_LABEL = { direct: '直接提取', calc: '计算派生', ai: 'AI 识别' };

  function cfgTag(text, cls) {
    return '<span class="cfgcc-tag ' + (cls || 'cfgcc-tag--muted') + '">' + esc(text) + '</span>';
  }

  /* 把技术落点路径收成用户能看懂的字段名，仅用于展示 */
  function cfgLandingLabel(val) {
    if (!val) return '';
    var s = String(val);
    var m;
    if ((m = s.match(/科目\s*=\s*([^)\]，,]+)/))) return m[1].trim();
    if ((m = s.match(/指标\s*=\s*([^)\]，,]+)/))) return m[1].trim();
    if ((m = s.match(/条款类型\s*=\s*([^)\]，,]+)/))) return m[1].trim();
    if ((m = s.match(/事件类型\s*=\s*([^)\]，,]+)/))) return m[1].trim();
    /* 括号内整段中文：T12.business_metrics(营业收入) */
    if ((m = s.match(/[（(]([^)）]+)[)）]\s*$/))) {
      var inner = m[1].trim();
      if (/[\u4e00-\u9fff]/.test(inner) && !/=/.test(inner)) return inner;
    }
    if (/managers/i.test(s)) return '基金管理人';
    if (/company_id/i.test(s) && /companies/i.test(s)) return '关联企业';
    if (/holdings/i.test(s)) return '持股关系';
    if (/investment_events/i.test(s) && !/\./.test(s.split(/[→>]/).pop() || '')) return '投资事件';
    /* 取最后一段字段名；勿按 / 切开（如「备注/长文本」） */
    var tail = s.split(/[→>]/).pop() || s;
    var parts = tail.split('.');
    var last = (parts[parts.length - 1] || '').trim();
    last = last.replace(/[（(][^)）]*[)）]\s*$/, '').trim();
    if (!last || /^T\d+$/i.test(last) || /^[a-z][a-z0-9_]*$/i.test(last)) {
      /* 英文表名兜底：尽量从括号或整串里抠中文 */
      if ((m = s.match(/[\u4e00-\u9fff][\u4e00-\u9fffA-Za-z0-9_／\/·\-]+/))) return m[0];
      return s;
    }
    return last;
  }

  function cfgLandingCell(val) {
    if (!val) return '<span style="color:var(--xb-faint)">未设置</span>';
    var label = cfgLandingLabel(val);
    return '<span class="cfgcc-td-landing" title="' + esc(val) + '">' + esc(label) + '</span>';
  }

  function cfgTypeTag(kind, extraLabel) {
    /* 与档案配置 objectType 标签同风格：只标类型（直投／所投子基金／管理基金／企业三表／基金跟踪），不叫「启用桶」 */
    var map = {
      enterprise: { label: '企业三表', cls: 'cfgcc-tag--obj' },
      fund: { label: '基金跟踪', cls: 'cfgcc-tag--obj' },
      direct: { label: '直投项目', cls: 'cfgcc-tag--obj' },
      subFund: { label: '所投子基金', cls: 'cfgcc-tag--obj' },
      fundObj: { label: '管理基金', cls: 'cfgcc-tag--obj' },
      indEnt: { label: '直投指标', cls: 'cfgcc-tag--obj' },
      indFund: { label: '基金指标', cls: 'cfgcc-tag--obj' },
    };
    var m = map[kind] || { label: extraLabel || kind || '—', cls: 'cfgcc-tag--obj' };
    return cfgTag(extraLabel || m.label, m.cls);
  }

  function cfgEnableHint(text) {
    return '<div class="cfgcc-bucket-hint">' + esc(text) + '</div>';
  }

  function cfgStandardBucketKind(std) {
    if (!std) return 'enterprise';
    if (std.id === 'std-internal' || (std.name || '').indexOf('基金跟踪') >= 0) return 'fund';
    return 'enterprise';
  }

  function cfgEnabledToggle(col, id, enabled) {
    return '<button type="button" class="cfgcc-toggle' + (enabled ? ' on' : '')
      + '" data-act="cfgToggleEnabled" data-arg="' + esc(col) + '" data-arg2="' + esc(id) + '" title="点击'
      + (enabled ? '停用' : '启用') + '">'
      + (enabled ? '已启用' : '已停用') + '</button>';
  }

  function cfgRowActions(col, id) {
    /* 档案字段只停用、不硬删 */
    if (col === 'fields') {
      return '<button type="button" class="cfgcc-act-btn" data-act="cfgEdit" data-arg="' + esc(col) + '" data-arg2="' + esc(id) + '">编辑</button>';
    }
    return '<button type="button" class="cfgcc-act-btn" data-act="cfgEdit" data-arg="' + esc(col) + '" data-arg2="' + esc(id) + '">编辑</button>'
      + '<button type="button" class="cfgcc-act-btn cfgcc-act-danger" data-act="cfgDelete" data-arg="' + esc(col) + '" data-arg2="' + esc(id) + '">删除</button>';
  }

  /** 平台写死：对象类型 → Tab → 模块 */
  /* 配置中心下拉＝类型 A 可配模块（对齐《档案详情骨架》；B/C/D/E 壳不出现） */
  var ARCHIVE_TAB_MODULES = {
    direct: {
      '概览': ['企业概况', '当前投资概览', '最近变化'],
      '投资与股权': ['持仓信息', '关键约定'],
      '经营情况': ['业务进展']
    },
    subFund: {
      '概览': ['基金概况', '本机构出资口径'],
      '期间表现': ['当期表现']
    },
    fund: {
      '概览': ['基金概况', '最新表现'],
      '期间表现': ['当期表现']
    }
  };

  function cfgResolveFieldSource(f) {
    if (f.fieldSource) return f.fieldSource;
    if (f.method === 'compute' || f.method === 'calc') return 'calc';
    if (f.aiParse === false) return 'manual';
    return 'ai';
  }

  /** 兼容旧 seed「概览（企业概况）」→ Tab=概览、模块=企业概况 */
  function cfgNormalizeTabModule(f) {
    var tab = String(f.tab || '').trim();
    var mod = String(f.module || f.group || '').trim();
    var m = tab.match(/^(.+?)[（(]([^）)]+)[）)]$/);
    if (m) {
      tab = m[1].trim();
      if (!mod) mod = m[2].trim();
    }
    return { tab: tab || '—', module: mod || '—' };
  }

  function cfgFieldSourceLabel(f) {
    var src = cfgResolveFieldSource(f);
    if (src === 'calc') return cfgTag('系统计算', 'cfgcc-tag--muted');
    if (src === 'ai') return cfgTag('AI 解析', 'cfgcc-tag--accent');
    return '<span class="cfgcc-td-muted">—</span>';
  }

  function cfgInferModule(f) {
    return cfgNormalizeTabModule(f).module;
  }

  function cfgSubjectsContent(store) {
    var stdId = _local.cfgStandard || null;
    if (stdId) return cfgSubjectDetailView(store, stdId);
    return cfgStandardsListView(store);
  }

  function cfgStandardsListView(store) {
    var stds = store.list('standards');
    var cards = stds.map(function (std) {
      var cnt = store.subjectCounts(std.id);
      var isPlatform = std.source === 'platform';
      var bucketKind = cfgStandardBucketKind(std);
      var total = cnt.fund > 0 ? cnt.fund : ((cnt.is || 0) + (cnt.bs || 0) + (cnt.cf || 0));
      var unit = bucketKind === 'fund' ? '字段' : '科目';
      var enterLabel = bucketKind === 'fund' ? '配置字段' : '配置科目';
      return '<div class="cfgcc-std-card' + (std.enabled ? ' is-active' : '') + '">'
        + '<div class="cfgcc-std-main" data-act="cfgSelectStandard" data-arg="' + esc(std.id) + '" style="cursor:pointer">'
        + '<div class="cfgcc-std-bucket-row">' + cfgTypeTag(bucketKind)
        + (isPlatform ? cfgTag('平台', 'cfgcc-tag--muted') : '') + '</div>'
        + '<div class="cfgcc-std-title">' + esc(std.name) + '</div>'
        + '<div class="cfgcc-std-stats"><span class="cfgcc-std-stat"><strong>' + total + '</strong> 个' + unit + '</span></div>'
        + '</div>'
        + '<div class="cfgcc-std-acts">'
        + cfgEnabledToggle('standards', std.id, std.enabled)
        + '<button type="button" class="btn btn-primary cfgcc-std-enter-btn" data-act="cfgSelectStandard" data-arg="' + esc(std.id) + '">' + enterLabel + '</button>'
        + (isPlatform
            ? '<button type="button" class="cfgcc-act-btn" data-act="cfgCopyItem" data-arg="standards" data-arg2="' + esc(std.id) + '">复制</button>'
            : '<button type="button" class="cfgcc-act-btn" data-act="cfgEdit" data-arg="standards" data-arg2="' + esc(std.id) + '">编辑</button>'
              + '<button type="button" class="cfgcc-act-btn cfgcc-act-danger" data-act="cfgDelete" data-arg="standards" data-arg2="' + esc(std.id) + '">删除</button>')
        + '</div>'
        + '</div>';
    }).join('');

    return '<div class="cfgcc-content-head">'
      + '<span class="cfgcc-field-count">' + stds.length + ' 套准则</span>'
      + '<button type="button" class="btn btn-primary" data-act="cfgAdd" data-arg="standards">' + ico('plus') + ' 新增准则</button>'
      + '</div>'
      + '<div class="cfgcc-std-list">'
      + (cards || '<div class="cfgcc-empty" style="padding:48px 0;text-align:center">暂无准则</div>')
      + '</div>';
  }

  function cfgSubjectDetailView(store, stdId) {
    var std     = store.get('standards', stdId);
    var section = _local.cfgDetailSection || 'subjects';
    var chkCnt  = store.checkCounts ? store.checkCounts(stdId) : 0;
    var isFundStd = !!(std && (std.id === 'std-internal' || (std.name || '').indexOf('基金跟踪') >= 0));
    var mapTabLabel = isFundStd ? '基金跟踪字段' : '科目与映射';
    var chkTabLabel = isFundStd ? '勾稽规则' : '校验规则';

    var sectionTabs = '<div class="cfgcc-section-tabs">'
      + '<button type="button" class="cfgcc-section-tab' + (section === 'subjects' ? ' on' : '')
      + '" data-act="cfgDetailSection" data-arg="subjects">' + mapTabLabel + '</button>'
      + '<button type="button" class="cfgcc-section-tab' + (section === 'checks' ? ' on' : '')
      + '" data-act="cfgDetailSection" data-arg="checks">' + chkTabLabel + '<span class="cfgcc-section-cnt">' + chkCnt + '</span></button>'
      + '</div>';

    var body = section === 'checks'
      ? cfgChecksSection(store, stdId, isFundStd)
      : cfgSubjectMappingSection(store, stdId, isFundStd);

    return '<div class="cfgcc-detail-nav">'
      + '<button type="button" class="cfgcc-back-btn" data-act="cfgBackToStandards">' + ico('chevronLeft') + ' 准则列表</button>'
      + '<span class="cfgcc-detail-title">' + esc(std ? std.name : stdId) + '</span>'
      + '</div>'
      + sectionTabs
      + '<div style="padding:16px 20px;overflow-y:auto;flex:1">'
      + body
      + '</div>';
  }

  function cfgSubjectMappingSection(store, stdId, isFundStd) {
    var all   = store.listSubjects(stdId);
    var isFund = isFundStd || all.some(function (s) { return s.stmt === 'fund'; });
    var stmtKeys = isFund ? ['fund'] : ['is', 'bs', 'cf'];
    var defaultStmt = isFund ? 'fund' : 'is';
    var curStmt = _local.cfgSubjStmt;
    var stmt = (curStmt && stmtKeys.indexOf(curStmt) >= 0) ? curStmt : defaultStmt;
    var selId = _local.cfgSubjSelected || null;
    var rows  = all.filter(function (s) { return s.stmt === stmt; });
    var sel   = selId ? all.find(function (s) { return s.id === selId; }) : null;
    if (!sel) selId = null;
    var entityLabel = isFund ? '字段' : '科目';
    var nameLabel = isFund ? '标准字段名' : '标准科目名';
    var aliasLabel = isFund ? '来源字段别名' : '来源科目别名';
    var ruleTitle = isFund ? '字段规则' : '科目规则';
    var emptyHint = isFund ? '该分类暂无字段' : '该报表暂无科目';
    var pickHint = isFund ? '← 从左侧点击字段进行编辑' : '← 从左侧点击科目进行编辑';
    var headCol = isFund ? '标准字段' : '标准科目';
    var addBtn = isFund ? '新增字段' : '新增科目';
    var delBtn = isFund ? '删除字段' : '删除科目';
    var namePh = isFund ? '如：累计实缴金额' : '如：营业收入';
    var aliasPh = isFund ? '逗号分隔，如：实缴资本,Paid-in' : '逗号分隔，如：主营业务收入,收入';
    var aliasHint = isFund ? '来源别名用于 GP 季报／材料字段映射；命中后仍保留来源字段名。' : '来源别名用于 OCR 映射；命中别名后仍保留来源科目名称。';

    var stmtTabs = '<div class="po-fin-stmt-tabs">'
      + stmtKeys.map(function (s) {
        var cnt = all.filter(function (x) { return x.stmt === s; }).length;
        return '<button type="button" class="po-fin-stmt' + (stmt === s ? ' active' : '')
          + '" data-act="cfgSubjStmt" data-arg="' + s + '">' + STMT_LABEL[s]
          + '<span class="cnt">' + cnt + '</span></button>';
      }).join('')
      + '</div>';

    var subRows = rows.map(function (s) {
      var aliases = s.aliases || '';
      var aliasCnt = aliases.split(',').filter(function (a) { return a.trim(); }).length;
      return '<button type="button" class="po-fin-subject' + (s.id === selId ? ' active' : '')
        + '" data-act="cfgSelectSubject" data-arg="' + esc(s.id) + '"'
        + ' data-subj-id="' + esc(s.id) + '"'
        + ' draggable="true"'
        + ' ondragstart="window.qmxSubjDragStart(event,\'' + esc(s.id) + '\',\'' + esc(stdId) + '\')"'
        + ' ondragover="window.qmxSubjDragOver(event,this)"'
        + ' ondrop="window.qmxSubjDragDrop(event,\'' + esc(s.id) + '\',\'' + esc(stdId) + '\')"'
        + '>'
        + '<span class="po-fin-sub-name">'
        + (s.name ? esc(s.name) : '<em style="color:var(--po-gray);font-style:italic">（未命名）</em>')
        + '</span>'
        + '<span class="po-fin-sub-aliases">' + esc(aliases || '暂无别名') + '</span>'
        + '<span class="po-fin-sub-count">' + aliasCnt + ' 个别名</span>'
        + '</button>';
    }).join('');

    var rightPanel;
    if (sel) {
      var isPlatform = sel.source === 'platform';
      var roAttr = isPlatform ? ' readonly' : '';
      var roSelAttr = isPlatform ? ' disabled' : '';
      var stmtOptions = stmtKeys.map(function (k) {
        return '<option value="' + k + '"' + (sel.stmt === k ? ' selected' : '') + '>' + STMT_LABEL[k] + '</option>';
      }).join('');
      rightPanel = '<div class="po-fin-detail-head">'
        + '<strong>' + ruleTitle + '</strong>'
        + (isPlatform ? cfgTag('平台预置', 'cfgcc-tag--accent') : '<span>' + esc(sel.id || '—') + '</span>')
        + '</div>'
        + '<label>' + nameLabel
        + '<input data-cfg-field="name" data-arg="' + esc(sel.id) + '" value="' + esc(sel.name || '') + '" placeholder="' + namePh + '"' + roAttr + ' />'
        + '</label>'
        + '<label>所属分类'
        + '<select data-cfg-field="stmt" data-arg="' + esc(sel.id) + '"' + roSelAttr + '>'
        + stmtOptions
        + '</select>'
        + '</label>'
        + '<label>' + aliasLabel
        + '<textarea data-cfg-field="aliases" data-arg="' + esc(sel.id) + '" placeholder="' + aliasPh + '"' + roAttr + '>' + esc(sel.aliases || '') + '</textarea>'
        + '</label>'
        + '<p>' + aliasHint + '</p>'
        + '<div style="border-top:1px solid var(--po-line);padding-top:10px;margin-top:4px;display:flex;justify-content:flex-end;gap:8px">'
        + '<button type="button" class="cfgcc-act-btn" data-act="cfgCopySubject" data-arg="' + esc(stdId) + '" data-arg2="' + esc(sel.id) + '">复制</button>'
        + (isPlatform ? '' : '<button type="button" class="cfgcc-del-subj-btn" data-act="cfgDeleteSubject" data-arg="' + esc(stdId) + '" data-arg2="' + esc(sel.id) + '">' + delBtn + '</button>')
        + '</div>';
    } else {
      rightPanel = '<div class="po-fin-detail-head"><strong>' + ruleTitle + '</strong></div>'
        + '<p style="text-align:center;padding:24px 0;color:var(--po-gray)">' + pickHint + '</p>';
    }

    var subjHead = '<div class="cfgcc-content-head">'
      + '<span style="font-size:13px;color:var(--xb-muted)">共 ' + all.length + ' 个' + entityLabel + '</span>'
      + '<div style="display:flex;gap:8px">'
      + '<button type="button" class="btn btn-ghost" data-act="cfgImportSubjects" data-arg="' + esc(stdId) + '">批量导入</button>'
      + '<button type="button" class="btn btn-primary" data-act="cfgAddSubject" data-arg="' + esc(stdId) + '">' + ico('plus') + ' ' + addBtn + '</button>'
      + '</div></div>';

    return subjHead
      + stmtTabs
      + '<div class="po-fin-subject-workbench">'
      + '<div class="po-fin-subject-pane">'
      + '<div class="po-fin-subject-table-head"><span>' + headCol + '</span><span>来源别名</span><span>别名数</span></div>'
      + '<div class="po-fin-subject-list">'
      + (subRows || '<div style="padding:16px;font-size:12px;color:var(--po-gray);text-align:center">' + emptyHint + '</div>')
      + '</div>'
      + '</div>'
      + '<aside class="po-fin-subject-detail" style="position:static">'
      + rightPanel
      + '</aside>'
      + '</div>';
  }

  var CHK_TYPE_LABEL = { balance: '表内平衡', cross: '跨表勾稽', threshold: '阈值预警' };

  function cfgChecksSection(store, stdId, isFundStd) {
    var checks = store.listChecks(stdId);
    var chkHead = isFundStd ? '勾稽规则' : '校验规则';
    var chkLead = isFundStd
      ? '维护基金侧绩效与资本账户勾稽（如 DPI／TVPI、账户滚动）；不可配置企业三表会计恒等式。'
      : '维护本准则三表试算平衡与跨表勾稽规则。';
    var addChk = isFundStd ? '新增勾稽' : '新增规则';

    var cards = checks.map(function (c) {
      return '<div class="cfgcc-check-card' + (c.enabled ? '' : ' is-off') + '">'
        + '<div class="cfgcc-check-top">'
        + '<span class="cfgcc-check-name">' + esc(c.name) + '</span>'
        + cfgTag(CHK_TYPE_LABEL[c.type] || c.type, 'cfgcc-tag--muted')
        + '<span class="cfgcc-check-stmt">' + esc(STMT_LABEL[c.stmt] || c.stmt) + '</span>'
        + '<div class="cfgcc-check-acts">'
        + '<button type="button" class="cfgcc-toggle' + (c.enabled ? ' on' : '')
        + '" data-act="cfgToggleCheck" data-arg="' + esc(stdId) + '" data-arg2="' + esc(c.id) + '" title="点击'
        + (c.enabled ? '停用' : '启用') + '">' + (c.enabled ? '已启用' : '已停用') + '</button>'
        + '<button type="button" class="cfgcc-act-btn" data-act="cfgEditCheck" data-arg="' + esc(stdId) + '" data-arg2="' + esc(c.id) + '">编辑</button>'
        + '<button type="button" class="cfgcc-act-btn cfgcc-act-danger" data-act="cfgDeleteCheck" data-arg="' + esc(stdId) + '" data-arg2="' + esc(c.id) + '">删除</button>'
        + '</div>'
        + '</div>'
        + '<div class="cfgcc-check-formula">= ' + esc(c.formula || '—') + '</div>'
        + '</div>';
    }).join('');

    return '<div class="cfgcc-content-head">'
      + '<div><strong style="font-size:14px">' + chkHead + '</strong>'
      + '<p style="margin:4px 0 0;font-size:12px;color:var(--xb-muted)">' + chkLead + '</p></div>'
      + '<button type="button" class="btn btn-primary" data-act="cfgAddCheck" data-arg="' + esc(stdId) + '">' + ico('plus') + ' ' + addChk + '</button>'
      + '</div>'
      + '<div class="cfgcc-check-list">'
      + (cards || '<div class="cfgcc-empty" style="padding:32px 0;text-align:center">暂无' + chkHead + '</div>')
      + '</div>';
  }

  var SRC_LABEL = { platform: '平台官方', institution: '机构模板', custom: '我的配置' };
  var SRC_CLS   = { platform: 'cfgcc-tag--accent', institution: 'cfgcc-tag--muted', custom: '' };

  function cfgIndicatorsContent(store) {
    var setId = _local.cfgIndSet || null;
    if (setId) return cfgIndicatorSetDetail(store, setId);
    return cfgIndicatorSetsView(store);
  }

  function cfgIndicatorSetsView(store) {
    var sets = store.listIndicatorSets ? store.listIndicatorSets() : [];
    var cards = sets.map(function (s) {
      var cnt = store.indicatorSetCount ? store.indicatorSetCount(s.id) : 0;
      var stdObj = s.standardId && store.get ? store.get('standards', s.standardId) : null;
      var bucketKind = cfgStandardBucketKind(stdObj || { id: s.standardId });
      var bucketExtra = bucketKind === 'fund' ? '基金指标' : '企业指标';
      var isPlatform = s.source === 'platform';
      return '<div class="cfgcc-std-card' + (s.enabled ? ' is-active' : '') + '">'
        + '<div class="cfgcc-std-main" data-act="cfgSelectIndSet" data-arg="' + esc(s.id) + '" style="cursor:pointer">'
        + '<div class="cfgcc-std-bucket-row">' + cfgTypeTag(bucketKind === 'fund' ? 'indFund' : 'indEnt', bucketExtra)
        + (isPlatform ? cfgTag('平台', 'cfgcc-tag--muted') : '') + '</div>'
        + '<div class="cfgcc-std-title">' + esc(s.name) + '</div>'
        + '<div class="cfgcc-std-stats"><span class="cfgcc-std-stat"><strong>' + cnt + '</strong> 个模板</span></div>'
        + '</div>'
        + '<div class="cfgcc-std-acts">'
        + cfgEnabledToggle('indicatorSets', s.id, s.enabled)
        + '<button type="button" class="btn btn-primary cfgcc-std-enter-btn" data-act="cfgSelectIndSet" data-arg="' + esc(s.id) + '">配置模板</button>'
        + (isPlatform
            ? '<button type="button" class="cfgcc-act-btn" data-act="cfgCopyItem" data-arg="indicatorSets" data-arg2="' + esc(s.id) + '">复制</button>'
            : '<button type="button" class="cfgcc-act-btn" data-act="cfgEdit" data-arg="indicatorSets" data-arg2="' + esc(s.id) + '">编辑</button>'
              + '<button type="button" class="cfgcc-act-btn cfgcc-act-danger" data-act="cfgDelete" data-arg="indicatorSets" data-arg2="' + esc(s.id) + '">删除</button>')
        + '</div>'
        + '</div>';
    }).join('');

    return '<div class="cfgcc-content-head">'
      + '<span class="cfgcc-field-count">' + sets.length + ' 个模板集</span>'
      + '<button type="button" class="btn btn-primary" data-act="cfgAdd" data-arg="indicatorSets">' + ico('plus') + ' 新建模板集</button>'
      + '</div>'
      + '<div class="cfgcc-std-list">'
      + (cards || '<div class="cfgcc-empty" style="padding:48px 0;text-align:center">暂无模板集</div>')
      + '</div>';
  }

  function cfgIndicatorSetDetail(store, setId) {
    var indSet = store.get ? store.get('indicatorSets', setId) : null;
    var rows   = store.listIndicatorsInSet ? store.listIndicatorsInSet(setId) : [];
    var tableRows = rows.map(function (ind) {
      var dirCls = DIR_CLASS[ind.direction] || 'cfgcc-tag--muted';
      return '<tr>'
        + '<td class="cfgcc-td-name">' + esc(ind.name) + '</td>'
        + '<td>' + cfgTag(ind.category || '—', 'cfgcc-tag--accent') + '</td>'
        + '<td class="cfgcc-td-muted">' + esc(ind.description || '—') + '</td>'
        + '<td>' + cfgTag(ind.threshold || '—', 'cfgcc-tag--danger') + '</td>'
        + '<td>' + cfgTag(DIR_LABEL[ind.direction] || '—', dirCls) + '</td>'
        + '<td>' + cfgEnabledToggle('indicators', ind.id, ind.enabled) + '</td>'
        + '<td class="cfgcc-td-acts">' + cfgRowActions('indicators', ind.id) + '</td>'
        + '</tr>';
    }).join('');
    return '<div class="cfgcc-detail-nav">'
      + '<button type="button" class="cfgcc-back-btn" data-act="cfgBackToIndSets">' + ico('chevronLeft') + ' 指标集列表</button>'
      + '<span class="cfgcc-detail-title">' + esc(indSet ? indSet.name : setId) + '</span>'
      + '</div>'
      + '<div class="cfgcc-content-head">'
      + '<span class="cfgcc-field-count">' + rows.length + ' 个模板</span>'
      + '<button type="button" class="btn btn-primary" data-act="cfgAdd" data-arg="indicators">' + ico('plus') + ' 新增模板</button>'
      + '</div>'
      + '<table class="cfgcc-table">'
      + '<thead><tr><th>模板名</th><th>类别</th><th>计算说明</th><th>触发阈值</th><th>触发方向</th><th>状态</th><th></th></tr></thead>'
      + '<tbody>' + (tableRows || '<tr><td colspan="7" class="cfgcc-empty">暂无模板</td></tr>') + '</tbody>'
      + '</table>';
  }

  function cfgFieldsContent(store) {
    var tplId = _local.cfgParseTpl || null;
    if (tplId) return cfgParseTplDetail(store, tplId);
    return cfgParseTplsView(store);
  }

  function cfgParseTplsView(store) {
    var tpls = store.listParseTemplates ? store.listParseTemplates() : [];
    var otBucket = { direct: 'direct', subFund: 'subFund', fund: 'fundObj' };
    var cards = tpls.map(function (t) {
      var cnt = store.fieldTemplateCount ? store.fieldTemplateCount(t.id) : 0;
      var ot = t.objectType || 'direct';
      var otLabel = (store.OBJ_TYPES && store.OBJ_TYPES[ot]) || ot;
      var isPlatform = t.source === 'platform';
      return '<div class="cfgcc-std-card' + (t.enabled ? ' is-active' : '') + '">'
        + '<div class="cfgcc-std-main" data-act="cfgSelectParseTpl" data-arg="' + esc(t.id) + '" style="cursor:pointer">'
        + '<div class="cfgcc-std-bucket-row">' + cfgTypeTag(otBucket[ot] || 'direct', otLabel)
        + (isPlatform ? cfgTag('平台', 'cfgcc-tag--muted') : '') + '</div>'
        + '<div class="cfgcc-std-title">' + esc(t.name) + '</div>'
        + '<div class="cfgcc-std-stats"><span class="cfgcc-std-stat"><strong>' + cnt + '</strong> 个字段</span></div>'
        + '</div>'
        + '<div class="cfgcc-std-acts">'
        + cfgEnabledToggle('parseTemplates', t.id, t.enabled)
        + '<button type="button" class="btn btn-primary cfgcc-std-enter-btn" data-act="cfgSelectParseTpl" data-arg="' + esc(t.id) + '">配置字段</button>'
        + (isPlatform
            ? '<button type="button" class="cfgcc-act-btn" data-act="cfgCopyItem" data-arg="parseTemplates" data-arg2="' + esc(t.id) + '">复制</button>'
            : '<button type="button" class="cfgcc-act-btn" data-act="cfgEdit" data-arg="parseTemplates" data-arg2="' + esc(t.id) + '">编辑</button>'
              + '<button type="button" class="cfgcc-act-btn cfgcc-act-danger" data-act="cfgDelete" data-arg="parseTemplates" data-arg2="' + esc(t.id) + '">删除</button>')
        + '</div>'
        + '</div>';
    }).join('');

    return '<div class="cfgcc-content-head">'
      + '<span class="cfgcc-field-count">' + tpls.length + ' 个档案配置</span>'
      + '<button type="button" class="btn btn-primary" data-act="cfgAdd" data-arg="parseTemplates">' + ico('plus') + ' 新建档案配置</button>'
      + '</div>'
      + '<div class="cfgcc-std-list">'
      + (cards || '<div class="cfgcc-empty" style="padding:48px 0;text-align:center">暂无档案配置</div>')
      + '</div>';
  }

  function cfgFieldLayer(f) {
    if (f && (f.layer === 'lookthrough' || f.layer === 'fundLayer')) return f.layer;
    var tab = String(f.tab || '');
    var g = String(f.group || '');
    if (tab.indexOf('底层') >= 0 || g.indexOf('底层') >= 0 || g.indexOf('项目层') >= 0 || g.indexOf('穿透') >= 0) return 'lookthrough';
    return 'fundLayer';
  }

  function cfgParseTplDetail(store, tplId) {
    var tpl  = store.get ? store.get('parseTemplates', tplId) : null;
    var allRows = store.listFieldsInTemplate ? store.listFieldsInTemplate(tplId) : [];
    var isSub = tpl && tpl.objectType === 'subFund';
    var objType = (tpl && tpl.objectType) || 'direct';
    var layer = _local.cfgParseTplLayer || 'fundLayer';
    if (!isSub) layer = 'all';
    var filterTab = _local.cfgFieldFilterTab || '';
    var filterMod = _local.cfgFieldFilterModule || '';
    var rows = allRows.filter(function (f) {
      if (layer !== 'all' && cfgFieldLayer(f) !== layer) return false;
      var tm = cfgNormalizeTabModule(f);
      if (filterTab && tm.tab !== filterTab) return false;
      if (filterMod && tm.module !== filterMod) return false;
      return true;
    });
    var fundCnt = allRows.filter(function (f) { return cfgFieldLayer(f) === 'fundLayer'; }).length;
    var ltCnt = allRows.filter(function (f) { return cfgFieldLayer(f) === 'lookthrough'; }).length;
    /* 底层→穿透字段挂直投壳 Tab／模块 */
    var tabMap = (isSub && layer === 'lookthrough')
      ? ARCHIVE_TAB_MODULES.direct
      : (ARCHIVE_TAB_MODULES[objType] || ARCHIVE_TAB_MODULES.direct);
    var tabNames = Object.keys(tabMap);
    var modNames = filterTab ? (tabMap[filterTab] || []) : tabNames.reduce(function (acc, t) {
      return acc.concat(tabMap[t] || []);
    }, []);
    var tabFilterOpts = '<option value="">全部 Tab</option>' + tabNames.map(function (t) {
      return '<option value="' + esc(t) + '"' + (filterTab === t ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('');
    var modFilterOpts = '<option value="">全部模块</option>' + modNames.map(function (m) {
      return '<option value="' + esc(m) + '"' + (filterMod === m ? ' selected' : '') + '>' + esc(m) + '</option>';
    }).join('');
    var tableRows = rows.map(function (f) {
      var src = cfgResolveFieldSource(f);
      var tm = cfgNormalizeTabModule(f);
      var extra = '—';
      if (src === 'ai') {
        extra = esc(f.sourceType || '—');
        if (f.updateMode === 'first') extra += ' · 仅首次';
      } else if (src === 'calc') {
        extra = esc(f.formula || f.formulaTemplateName || '已配置公式');
      }
      return '<tr class="cfgcc-field-row" draggable="true"'
        + ' data-field-id="' + esc(f.id) + '"'
        + ' ondragstart="window.qmxFieldDragStart(event,\'' + esc(f.id) + '\',\'' + esc(tplId) + '\')"'
        + ' ondragover="window.qmxFieldDragOver(event,this)"'
        + ' ondrop="window.qmxFieldDragDrop(event,\'' + esc(f.id) + '\',\'' + esc(tplId) + '\')"'
        + ' ondragend="window.qmxFieldDragEnd()">'
        + '<td class="cfgcc-td-name"><span class="cfgcc-drag-hint" title="拖拽排序">⋮⋮</span> ' + esc(f.name) + '</td>'
        + '<td class="cfgcc-td-muted">' + esc(tm.tab) + '</td>'
        + '<td class="cfgcc-td-muted">' + esc(tm.module) + '</td>'
        + '<td>' + cfgFieldSourceLabel(f) + '</td>'
        + '<td class="cfgcc-td-muted">' + extra + '</td>'
        + '<td>' + cfgEnabledToggle('fields', f.id, f.enabled) + '</td>'
        + '<td class="cfgcc-td-acts">' + cfgRowActions('fields', f.id) + '</td>'
        + '</tr>';
    }).join('');
    var layerTabs = '';
    if (isSub) {
      layerTabs = '<div class="cfgcc-layer-seg" role="tablist">'
        + '<button type="button" class="cfgcc-layer-seg-btn' + (layer === 'fundLayer' ? ' is-on' : '') + '" data-act="cfgParseTplLayer" data-arg="fundLayer">基金层 ' + fundCnt + '</button>'
        + '<button type="button" class="cfgcc-layer-seg-btn' + (layer === 'lookthrough' ? ' is-on' : '') + '" data-act="cfgParseTplLayer" data-arg="lookthrough">底层→穿透 ' + ltCnt + '</button>'
        + '</div>';
    }
    var filterLeft = '<div class="cfgcc-field-toolbar-left">'
      + layerTabs
      + '<select class="cfgcc-filter-select" onchange="window.qmxFieldFilterTab(this)" aria-label="Tab">' + tabFilterOpts + '</select>'
      + '<select class="cfgcc-filter-select" onchange="window.qmxFieldFilterModule(this)" aria-label="模块">' + modFilterOpts + '</select>'
      + ((filterTab || filterMod)
        ? '<button type="button" class="cfgcc-filter-clear" data-act="cfgFieldFilterClear">清除</button>'
        : '')
      + '</div>';
    return '<div class="cfgcc-detail-nav">'
      + '<button type="button" class="cfgcc-back-btn" data-act="cfgBackToParseTpls">' + ico('chevronLeft') + ' 档案配置列表</button>'
      + '<span class="cfgcc-detail-title">' + esc(tpl ? tpl.name : tplId) + '</span>'
      + '</div>'
      + '<div class="cfgcc-field-toolbar">'
      + filterLeft
      + '<div class="cfgcc-field-toolbar-right">'
      + '<span class="cfgcc-field-count">' + rows.length + ' 个字段</span>'
      + '<button type="button" class="btn btn-primary" data-act="cfgAdd" data-arg="fields">' + ico('plus') + ' 新增字段</button>'
      + '</div>'
      + '</div>'
        + '<table class="cfgcc-table">'
        + '<thead><tr><th>字段名</th><th>Tab</th><th>模块</th><th>解析／计算</th><th>说明</th><th>状态</th><th></th></tr></thead>'
        + '<tbody>' + (tableRows || '<tr><td colspan="7" class="cfgcc-empty">暂无字段</td></tr>') + '</tbody>'
        + '</table>';
  }

  /* ——— Config Center 编辑弹窗 ——— */

  window.qmxFilterChips = function (v) {
    document.querySelectorAll('.cfgcc-chip-group[data-stmt]').forEach(function (g) {
      g.style.display = (!v || v === 'all' || v.indexOf(g.dataset.stmt) >= 0) ? '' : 'none';
    });
  };

  window.qmxToggleChipGroup = function (btn) {
    var grp = btn.parentElement;
    var chips = grp.querySelector('.cfgcc-grp-chips');
    if (!chips) return;
    var collapsed = grp.dataset.collapsed === '1';
    grp.dataset.collapsed = collapsed ? '0' : '1';
    var chevron = btn.querySelector('.cfgcc-grp-chevron');
    if (chevron) chevron.textContent = collapsed ? '▾' : '▸';
    chips.style.display = collapsed ? '' : 'none';
  };

  window.qmxFieldFilterTab = function (sel) {
    _local.cfgFieldFilterTab = (sel && sel.value) || '';
    _local.cfgFieldFilterModule = '';
    navigate('config-center');
  };

  window.qmxFieldFilterModule = function (sel) {
    _local.cfgFieldFilterModule = (sel && sel.value) || '';
    navigate('config-center');
  };

  window.qmxFieldDragStart = function (evt, fieldId, tplId) {
    window._cfgDragFieldId = fieldId;
    window._cfgDragFieldTpl = tplId;
    evt.dataTransfer.effectAllowed = 'move';
    try { evt.dataTransfer.setData('text/plain', fieldId); } catch (e) {}
  };

  window.qmxFieldDragOver = function (evt, el) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.cfgcc-field-row.drag-over').forEach(function (e) { e.classList.remove('drag-over'); });
    if (el) el.classList.add('drag-over');
  };

  window.qmxFieldDragEnd = function () {
    document.querySelectorAll('.cfgcc-field-row.drag-over').forEach(function (e) { e.classList.remove('drag-over'); });
    window._cfgDragFieldId = null;
    window._cfgDragFieldTpl = null;
  };

  window.qmxFieldDragDrop = function (evt, toId, tplId) {
    evt.preventDefault();
    document.querySelectorAll('.cfgcc-field-row.drag-over').forEach(function (e) { e.classList.remove('drag-over'); });
    var fromId = window._cfgDragFieldId;
    window._cfgDragFieldId = null;
    window._cfgDragFieldTpl = null;
    if (!fromId || fromId === toId) return;
    var store = window.CFG_CENTER_CRUD;
    if (store && store.moveField) store.moveField(tplId, fromId, toId);
    navigate('config-center');
  };

  window.qmxArchiveTabChange = function (sel) {
    var tab = sel.value || '';
    var objType = (document.getElementById('cfgFObjTypeHint') || {}).value || 'direct';
    var layerHint = (document.getElementById('cfgFLayerHint') || {}).value || '';
    var map = (objType === 'subFund' && layerHint === 'lookthrough')
      ? ARCHIVE_TAB_MODULES.direct
      : (ARCHIVE_TAB_MODULES[objType] || ARCHIVE_TAB_MODULES.direct);
    var mods = map[tab] || [];
    var modEl = document.getElementById('cfgFModule');
    if (!modEl) return;
    var cur = modEl.value;
    modEl.innerHTML = mods.map(function (m) {
      return '<option value="' + m.replace(/"/g, '&quot;') + '"' + (m === cur ? ' selected' : '') + '>' + m + '</option>';
    }).join('') || '<option value="">—</option>';
  };

  window.qmxToggleFieldExtras = function (el) {
    var aiChk = document.getElementById('cfgFAiParse');
    var calcChk = document.getElementById('cfgFCalc');
    var which = (el && el.id === 'cfgFCalc') ? 'calc' : 'ai';
    if (which === 'ai' && aiChk && aiChk.checked && calcChk) calcChk.checked = false;
    if (which === 'calc' && calcChk && calcChk.checked && aiChk) aiChk.checked = false;
    var aiOn = !!(aiChk && aiChk.checked);
    var calcOn = !!(calcChk && calcChk.checked);
    var aiCard = aiChk && aiChk.closest ? aiChk.closest('.cfgcc-cap-card') : null;
    var calcCard = calcChk && calcChk.closest ? calcChk.closest('.cfgcc-cap-card') : null;
    if (aiCard) aiCard.classList.toggle('is-on', aiOn);
    if (calcCard) calcCard.classList.toggle('is-on', calcOn);
    var ai = document.getElementById('cfgParseMeta');
    var calc = document.getElementById('cfgCalcMeta');
    if (ai) ai.style.display = aiOn ? '' : 'none';
    if (calc) calc.style.display = calcOn ? '' : 'none';
  };

  window.qmxToggleFieldSource = window.qmxToggleFieldExtras;

  /** 多值逗号列表：中文逗号转英文，去空项，统一用「, 」拼接 */
  window.qmxNormalizeCommaList = function (raw) {
    return String(raw || '')
      .replace(/，/g, ',')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .join(', ');
  };

  window.qmxCommaListInput = function (el) {
    if (!el) return;
    var start = el.selectionStart;
    var before = el.value || '';
    var next = before.replace(/，/g, ',');
    if (next === before) return;
    el.value = next;
    if (typeof start === 'number') {
      var delta = next.length - before.length;
      var pos = Math.max(0, start + delta);
      try { el.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
    }
  };

  window.qmxCommaListBlur = function (el) {
    if (!el) return;
    el.value = window.qmxNormalizeCommaList(el.value);
  };

  window.qmxFormulaTplChange = function (sel) {
    var prev = document.getElementById('cfgFFormulaPreview');
    if (!prev) return;
    var o = sel.options[sel.selectedIndex];
    var fml = (o && o.getAttribute('data-formula')) || '';
    prev.textContent = fml || (sel.value ? '（该模板暂无计算说明）' : '选用模板后显示');
  };

  window.qmxSubjDragStart = function (evt, subjectId, stdId) {
    window._cfgDragSubjId = subjectId;
    window._cfgDragStdId  = stdId;
    evt.dataTransfer.effectAllowed = 'move';
  };
  window.qmxSubjDragOver = function (evt, el) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.po-fin-subject.drag-over').forEach(function (e) { e.classList.remove('drag-over'); });
    if (el) el.classList.add('drag-over');
  };
  window.qmxSubjDragDrop = function (evt, toId, stdId) {
    evt.preventDefault();
    document.querySelectorAll('.po-fin-subject.drag-over').forEach(function (e) { e.classList.remove('drag-over'); });
    var fromId = window._cfgDragSubjId;
    window._cfgDragSubjId = null;
    if (!fromId || fromId === toId) return;
    var store = window.CFG_CENTER_CRUD;
    if (store && store.moveSubject) store.moveSubject(stdId, fromId, toId);
    var fromEl = document.querySelector('.po-fin-subject[data-subj-id="' + fromId + '"]');
    var toEl   = document.querySelector('.po-fin-subject[data-subj-id="' + toId   + '"]');
    if (!fromEl || !toEl || !fromEl.parentNode) return;
    var allSubjs = Array.from(fromEl.parentNode.querySelectorAll('.po-fin-subject'));
    var fromIdx = allSubjs.indexOf(fromEl);
    var toIdx   = allSubjs.indexOf(toEl);
    if (fromIdx < toIdx) {
      fromEl.parentNode.insertBefore(fromEl, toEl.nextSibling);
    } else {
      fromEl.parentNode.insertBefore(fromEl, toEl);
    }
  };

  window.qmxSearchSubjects = function (input) {
    var q = ((input && input.value) || '').trim().toLowerCase();
    var wrap = input && input.closest('[data-picker-wrap]');
    var picker = wrap && wrap.querySelector('.cfgcc-subject-picker');
    if (!picker) return;
    picker.querySelectorAll('.cfgcc-chip-group--collapsible').forEach(function (grp) {
      var chipsEl = grp.querySelector('.cfgcc-grp-chips');
      if (!chipsEl) return;
      var chips = Array.from(chipsEl.querySelectorAll('.cfgcc-subject-chip'));
      var anyMatch = false;
      chips.forEach(function (chip) {
        var match = !q || chip.textContent.toLowerCase().indexOf(q) >= 0;
        if (match) anyMatch = true;
        chip.style.display = match ? '' : 'none';
      });
      if (q) {
        grp.style.display = anyMatch ? '' : 'none';
        if (anyMatch) chipsEl.style.display = '';
      } else {
        grp.style.display = '';
        chipsEl.style.display = grp.dataset.collapsed === '1' ? 'none' : '';
        chips.forEach(function (c) { c.style.display = ''; });
      }
    });
  };

  function makePickerGroups(subjects, stmtLbl) {
    return ['is', 'bs', 'cf', 'fund'].map(function (s) {
      var grp = subjects.filter(function (sub) { return sub.stmt === s && sub.name; });
      if (!grp.length) return '';
      return '<div class="cfgcc-chip-group cfgcc-chip-group--collapsible" data-collapsed="0">'
        + '<button type="button" class="cfgcc-chip-group-toggle" onclick="window.qmxToggleChipGroup(this)">'
        + '<span class="cfgcc-grp-chevron">▾</span>'
        + '<span class="cfgcc-grp-label">' + stmtLbl[s] + '</span>'
        + '<span class="cfgcc-grp-count">(' + grp.length + ')</span>'
        + '</button>'
        + '<div class="cfgcc-grp-chips">'
        + grp.map(function (sub) {
          return '<button type="button" class="cfgcc-subject-chip" data-act="cfgFormulaChip" data-arg="' + esc(sub.name) + '">' + esc(sub.name) + '</button>';
        }).join('')
        + '</div>'
        + '</div>';
    }).join('');
  }

  /* 公式区：芯片拼装（引用框 + 运算符框），禁止手改文字 */
  var _CFG_FORMULA_OPS = ['+', '−', '-', '=', '×', '*', '÷', '/', '(', ')', '＋', '＝'];
  function cfgNormalizeOp(t) {
    if (t === '-') return '−';
    if (t === '＋') return '+';
    if (t === '*') return '×';
    if (t === '/') return '÷';
    if (t === '＝') return '=';
    return t;
  }
  function cfgParseFormulaTokens(str) {
    var s = String(str || '').trim();
    if (!s) return [];
    var tokens = [];
    var re = /([+\-−＝=×*÷\/()＋])|([^+\-−＝=×*÷\/()＋\s]+)/g;
    var m;
    while ((m = re.exec(s)) !== null) {
      if (m[1]) tokens.push({ type: 'op', text: cfgNormalizeOp(m[1]) });
      else if (m[2]) tokens.push({ type: 'ref', text: m[2] });
    }
    return tokens;
  }
  function cfgSerializeFormulaTokens(tokens) {
    return (tokens || []).map(function (t) { return t.text; }).join(' ');
  }
  function cfgFormulaTokenBtn(t, i, selected) {
    var kind = t.type === 'op' ? 'op' : 'ref';
    var on = i === selected ? ' is-selected' : '';
    return '<button type="button" class="cfgcc-formula-token cfgcc-formula-token--' + kind + on + '" data-formula-idx="' + i + '" title="点选后：再点左侧可替换；点删除可去掉">'
      + esc(t.text)
      + '</button>';
  }
  function cfgFormulaBoxHtml(formulaStr) {
    var tokens = cfgParseFormulaTokens(formulaStr);
    var inner = tokens.length
      ? tokens.map(function (t, i) { return cfgFormulaTokenBtn(t, i, -1); }).join('')
      : '<span class="cfgcc-formula-ph">未选中时：点左侧科目／字段或上方运算符 → 追加到末尾<br>选中某个框后：再点左侧／运算符 → 替换该框</span>';
    return '<div class="cfgcc-formula-toolbar">'
      + '<button type="button" class="cfgcc-formula-del" data-act="cfgFormulaRemove" title="删除选中的框" disabled>删除选中</button>'
      + '<button type="button" class="cfgcc-formula-clear" data-act="cfgFormulaClear" title="清空公式">清空</button>'
      + '</div>'
      + '<div class="cfgcc-formula-box" id="cfgFFormulaBox" data-selected="-1" tabindex="0">'
      + inner
      + '</div>'
      + '<input type="hidden" id="cfgFFormula" value="' + esc(cfgSerializeFormulaTokens(tokens)) + '" />';
  }
  function cfgSyncFormulaHidden(tokens) {
    var hid = document.getElementById('cfgFFormula');
    if (hid) hid.value = cfgSerializeFormulaTokens(tokens);
  }
  function cfgEnsureFormulaBoxDelegate(box) {
    if (!box || box.dataset.delegated === '1') return;
    box.dataset.delegated = '1';
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-formula-idx]');
      if (btn && box.contains(btn)) {
        e.preventDefault();
        e.stopPropagation();
        PEPages.act('cfgFormulaSelect', btn.getAttribute('data-formula-idx') || '');
        return;
      }
      if (e.target === box || (e.target && e.target.classList && e.target.classList.contains('cfgcc-formula-ph'))) {
        cfgRenderFormulaTokens(cfgReadFormulaTokens(), -1);
      }
    });
    box.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
      if (cfgFormulaSelectedIdx() < 0) return;
      e.preventDefault();
      PEPages.act('cfgFormulaRemove');
    });
  }
  function cfgRenderFormulaTokens(tokens, selectedIdx) {
    var box = document.getElementById('cfgFFormulaBox');
    if (!box) return;
    var sel = typeof selectedIdx === 'number' ? selectedIdx : -1;
    if (sel >= tokens.length) sel = -1;
    box.dataset.selected = String(sel);
    if (!tokens.length) {
      box.innerHTML = '<span class="cfgcc-formula-ph">未选中时：点左侧科目／字段或上方运算符 → 追加到末尾<br>选中某个框后：再点左侧／运算符 → 替换该框</span>';
    } else {
      box.innerHTML = tokens.map(function (t, i) { return cfgFormulaTokenBtn(t, i, sel); }).join('');
    }
    cfgSyncFormulaHidden(tokens);
    var delBtn = document.querySelector('.cfgcc-formula-del');
    if (delBtn) delBtn.disabled = sel < 0;
    cfgEnsureFormulaBoxDelegate(box);
  }
  function cfgFormulaSelectedIdx() {
    var box = document.getElementById('cfgFFormulaBox');
    if (!box) return -1;
    var n = parseInt(box.dataset.selected || '-1', 10);
    return isNaN(n) ? -1 : n;
  }
  function cfgReadFormulaTokens() {
    var box = document.getElementById('cfgFFormulaBox');
    if (!box) return [];
    return Array.from(box.querySelectorAll('.cfgcc-formula-token')).map(function (el) {
      return {
        type: el.classList.contains('cfgcc-formula-token--op') ? 'op' : 'ref',
        text: el.textContent
      };
    });
  }
  function cfgInsertOrReplaceToken(newTok) {
    var tokens = cfgReadFormulaTokens();
    var idx = cfgFormulaSelectedIdx();
    if (idx >= 0 && idx < tokens.length && tokens[idx].type === newTok.type) {
      tokens[idx] = newTok;
    } else {
      tokens.push(newTok);
    }
    /* 操作后取消选中，避免下一次点选被误当成替换 */
    cfgRenderFormulaTokens(tokens, -1);
  }

  function cfgIndicatorModalHtml(action, setId, indId, store) {
    var isEdit = action === 'edit';
    var item   = (isEdit && indId) ? store.get('indicators', indId) : null;
    var v      = item || {};
    var effectiveSetId = setId || v.setId || '';

    var indSet = effectiveSetId && store.get ? store.get('indicatorSets', effectiveSetId) : null;
    var boundStdId = (indSet && indSet.standardId) || '';
    var subjects = boundStdId && store.listSubjects
      ? (store.listSubjects(boundStdId) || []).filter(function (s) { return s && s.name; })
      : [];
    var peerInds = (store.list ? store.list('indicators') : [])
      .filter(function (ind) {
        return ind && ind.setId === effectiveSetId && ind.name && ind.id !== (v.id || '');
      });
    var stmtLbl    = { is: '利润表', bs: '资产负债表', cf: '现金流量表', fund: '基金跟踪字段' };

    var opBtns = ['+', '−', '=', '×', '÷', '(', ')'].map(function (op) {
      return '<button type="button" class="cfgcc-op-btn" data-act="cfgFormulaOp" data-arg="' + esc(op) + '">' + op + '</button>';
    }).join('');

    var indCats = ['成长性', '盈利能力', '偿债能力', '资产质量', '现金质量'];
    var curCat  = v.category  || '成长性';
    var curDir  = v.direction || 'up';

    var peerGroup = peerInds.length
      ? '<div class="cfgcc-chip-group cfgcc-chip-group--collapsible" data-collapsed="0">'
        + '<button type="button" class="cfgcc-chip-group-toggle" onclick="window.qmxToggleChipGroup(this)">'
        + '<span class="cfgcc-grp-chevron">▾</span>'
        + '<span class="cfgcc-grp-label">同集合其他指标</span>'
        + '<span class="cfgcc-grp-count">(' + peerInds.length + ')</span>'
        + '</button>'
        + '<div class="cfgcc-grp-chips">'
        + peerInds.map(function (ind) {
          return '<button type="button" class="cfgcc-subject-chip" data-act="cfgFormulaChip" data-arg="' + esc(ind.name) + '">' + esc(ind.name) + '</button>';
        }).join('')
        + '</div></div>'
      : '';

    var pickerInner = subjects.length || peerInds.length
      ? ((makePickerGroups(subjects, stmtLbl) || '') + peerGroup || '<span style="color:var(--xb-muted);font-size:12px">暂无科目</span>')
      : '<span style="color:var(--xb-muted);font-size:12px">该指标集关联准则暂无科目，请先在「科目与映射」中添加</span>';

    return '<div class="xb-modal-mask" data-act="cfgCloseModal">'
      + '<div class="xb-modal cfgcc-modal cfgcc-modal-ind" data-stop="1">'
      + '<h3>' + (isEdit ? '编辑指标' : '新增指标') + '</h3>'
      + '<input type="hidden" id="cfgFCol" value="indicators" />'
      + '<input type="hidden" id="cfgFSetId" value="' + esc(effectiveSetId) + '" />'
      + '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
      + '<div class="cfgcc-ind-body">'
      /* 左列：科目速查 */
      + '<div class="cfgcc-ind-picker-col" data-picker-wrap="1">'
      + '<div class="cfgcc-form-row" style="margin-bottom:8px">'
      + '<label>科目速查 <span style="font-weight:400">——点选插入或替换</span></label>'
      + '<input class="cfgcc-picker-search" placeholder="搜索科目…" oninput="window.qmxSearchSubjects(this)" autocomplete="off" />'
      + '</div>'
      + '<div class="cfgcc-subject-picker cfgcc-subject-picker--tall">' + pickerInner + '</div>'
      + '</div>'
      /* 右列：表单 */
      + '<div class="cfgcc-ind-form-col">'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
      + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>指标名<span class="req">*</span></label>'
      + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：毛利率" /></div>'
      + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>类别</label>'
      + '<select id="cfgFCat">'
      + indCats.map(function (c) {
        return '<option value="' + esc(c) + '"' + (curCat === c ? ' selected' : '') + '>' + esc(c) + '</option>';
      }).join('')
      + '</select></div>'
      + '</div>'
      + '<div class="cfgcc-form-row" style="margin-top:12px">'
      + '<label>计算公式 <span style="font-weight:400;color:var(--xb-muted)">先拼框；要改某个框就先点中它再选替换</span></label>'
      + '<div class="cfgcc-op-row">' + opBtns + '</div>'
      + cfgFormulaBoxHtml(v.description || '')
      + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px">'
      + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>触发阈值</label>'
      + '<input id="cfgFThreshold" value="' + esc(v.threshold || '') + '" placeholder="例：< -20%" /></div>'
      + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>触发方向</label>'
      + '<select id="cfgFDir">'
      + '<option value="up"'   + (curDir === 'up'   ? ' selected' : '') + '>上升触发</option>'
      + '<option value="down"' + (curDir === 'down' ? ' selected' : '') + '>下降触发</option>'
      + '<option value="both"' + (curDir === 'both' ? ' selected' : '') + '>双向触发</option>'
      + '<option value="none"' + (curDir === 'none' ? ' selected' : '') + '>不预警（纯计算）</option>'
      + '</select></div>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="xb-modal-actions">'
      + '<button type="button" class="btn btn-ghost" data-act="cfgCloseModal">取消</button>'
      + '<button type="button" class="btn btn-primary" data-act="cfgSave">保存</button>'
      + '</div></div></div>';
  }

  function cfgCheckModalHtml(action, stdId, checkId, store) {
    var isEdit = action === 'checkedit';
    var item = isEdit ? store.listChecks(stdId).find(function (c) { return c.id === checkId; }) : null;
    var v = item || {};
    var type = v.type || 'balance';
    var stmt = v.stmt || 'bs';

    var subjects = store.listSubjects ? store.listSubjects(stdId) : [];
    var stmtLbl  = { is: '利润表', bs: '资产负债表', cf: '现金流量表', fund: '基金跟踪字段' };
    var pickerInner = subjects.length
      ? (makePickerGroups(subjects, stmtLbl) || '<span style="color:var(--xb-muted);font-size:12px">暂无科目</span>')
      : '<span style="color:var(--xb-muted);font-size:12px">该准则暂无科目，请先在「科目与映射」中添加</span>';
    var opBtns = ['+', '−', '=', '×', '÷', '(', ')'].map(function (op) {
      return '<button type="button" class="cfgcc-op-btn" data-act="cfgFormulaOp" data-arg="' + esc(op) + '">' + op + '</button>';
    }).join('');

    return '<div class="xb-modal-mask" data-act="cfgCloseModal">'
      + '<div class="xb-modal cfgcc-modal cfgcc-modal-ind" data-stop="1">'
      + '<h3>' + (isEdit ? '编辑校验规则' : '新增校验规则') + '</h3>'
      + '<input type="hidden" id="cfgFCol" value="checks" />'
      + '<input type="hidden" id="cfgFStd" value="' + esc(stdId) + '" />'
      + '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
      + '<div class="cfgcc-ind-body">'
      + '<div class="cfgcc-ind-picker-col" data-picker-wrap="1">'
      + '<div class="cfgcc-form-row" style="margin-bottom:8px"><label>科目速查 <span style="font-weight:400">——点选插入或替换</span></label>'
      + '<input class="cfgcc-picker-search" placeholder="搜索科目…" oninput="window.qmxSearchSubjects(this)" autocomplete="off" /></div>'
      + '<div class="cfgcc-subject-picker cfgcc-subject-picker--tall">' + pickerInner + '</div>'
      + '</div>'
      + '<div class="cfgcc-ind-form-col">'
      + '<div class="cfgcc-form-row"><label>规则名<span class="req">*</span></label>'
      + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：资产=负债+权益" /></div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
      + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>类型</label>'
      + '<select id="cfgFType">'
      + '<option value="balance"'   + (type === 'balance'   ? ' selected' : '') + '>表内平衡</option>'
      + '<option value="cross"'     + (type === 'cross'     ? ' selected' : '') + '>跨表勾稽</option>'
      + '<option value="threshold"' + (type === 'threshold' ? ' selected' : '') + '>阈值预警</option>'
      + '</select></div>'
      + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>适用报表</label>'
      + '<select id="cfgFStmt2">'
      + '<option value="is"'    + (stmt === 'is'    ? ' selected' : '') + '>利润表</option>'
      + '<option value="bs"'    + (stmt === 'bs'    ? ' selected' : '') + '>资产负债表</option>'
      + '<option value="cf"'    + (stmt === 'cf'    ? ' selected' : '') + '>现金流量表</option>'
      + '<option value="fund"'  + (stmt === 'fund'  ? ' selected' : '') + '>基金跟踪字段</option>'
      + '<option value="is→bs"' + (stmt === 'is→bs' ? ' selected' : '') + '>利润表 → 资产负债表</option>'
      + '<option value="cf→bs"' + (stmt === 'cf→bs' ? ' selected' : '') + '>现金流量表 → 资产负债表</option>'
      + '<option value="all"'   + (stmt === 'all'   ? ' selected' : '') + '>所有报表</option>'
      + '</select></div>'
      + '</div>'
      + '<div class="cfgcc-form-row"><label>公式 <span style="font-weight:400;color:var(--xb-muted)">先拼框；要改某个框就先点中它再选替换</span></label>'
      + '<div class="cfgcc-op-row">' + opBtns + '</div>'
      + cfgFormulaBoxHtml(v.formula || '')
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="xb-modal-actions">'
      + '<button type="button" class="btn btn-ghost" data-act="cfgCloseModal">取消</button>'
      + '<button type="button" class="btn btn-primary" data-act="cfgSave">保存</button>'
      + '</div></div></div>';
  }

  function cfgModalHtml(modalState, store) {
    var parts  = modalState.split(':');
    var action = parts[0];  /* 'add' | 'edit' | 'checkadd' | 'checkedit' | 'subjimport' */

    if (action === 'checkadd' || action === 'checkedit') {
      return cfgCheckModalHtml(action, parts[1] || '', parts[2] || '', store);
    }

    /* 批量导入科目 */
    if (action === 'subjimport') {
      var importStdId = parts[1] || '';
      var std = store.get('standards', importStdId);
      return '<div class="xb-modal-mask" data-act="cfgCloseModal">'
        + '<div class="xb-modal cfgcc-modal" data-stop="1">'
        + '<h3>批量导入科目</h3>'
        + '<p style="font-size:12px;color:var(--xb-muted);margin:-4px 0 14px">科目库：' + esc(std ? std.name : importStdId) + '</p>'
        + '<input type="hidden" id="cfgFCol" value="subjects-bulk" />'
        + '<input type="hidden" id="cfgFStd" value="' + esc(importStdId) + '" />'
        + '<div class="cfgcc-form-row"><label>所属报表</label>'
        + '<select id="cfgFStmt">'
        + '<option value="is">利润表</option>'
        + '<option value="bs">资产负债表</option>'
        + '<option value="cf">现金流量表</option>'
        + '</select></div>'
        + '<div class="cfgcc-form-row"><label>科目名称<span class="req">*</span> <span style="font-weight:400;color:var(--xb-muted)">——每行一个，或逗号分隔</span></label>'
        + '<textarea id="cfgFBulk" rows="7" placeholder="营业收入\n营业成本\n税金及附加\n销售费用\n管理费用\n财务费用\n净利润"></textarea></div>'
        + '<div class="xb-modal-actions">'
        + '<button type="button" class="btn btn-ghost" data-act="cfgCloseModal">取消</button>'
        + '<button type="button" class="btn btn-primary" data-act="cfgSave">导入</button>'
        + '</div></div></div>';
    }

    var col    = parts[1];  /* 'subjects' | 'indicators' | 'fields' */
    var id     = parts[2] || '';

    if (col === 'indicators') {
      return cfgIndicatorModalHtml(action, _local.cfgIndSet || '', id, store);
    }

    var item = (action === 'edit' && id) ? store.get(col, id) : null;
    var v    = item || {};
    var isEdit = !!item;

    var title = (isEdit ? '编辑' : '新增')
      + (col === 'subjects' ? '科目' : col === 'indicators' ? '指标' : col === 'fields' ? '字段'
        : col === 'indicatorSets' ? '指标集' : col === 'parseTemplates' ? '档案配置' : '准则');

    var formBody = '';

    if (col === 'standards') {
      formBody = '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
        + '<div class="cfgcc-form-row"><label>准则名称<span class="req">*</span></label>'
        + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：中国企业会计准则（通用）、基金跟踪口径" /></div>'
        + '<div class="cfgcc-form-row"><label>描述</label>'
        + '<textarea id="cfgFDesc" rows="2" placeholder="准则说明，适用范围等">' + esc(v.description || '') + '</textarea></div>';
    } else if (col === 'subjects') {
      formBody = '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
        + '<div class="cfgcc-form-row">'
        + '<label>报表／字段类<span class="req">*</span></label>'
        + '<select id="cfgFStmt">'
        + '<option value="is"' + (v.stmt === 'is' ? ' selected' : '') + '>利润表</option>'
        + '<option value="bs"' + (v.stmt === 'bs' ? ' selected' : '') + '>资产负债表</option>'
        + '<option value="cf"' + (v.stmt === 'cf' ? ' selected' : '') + '>现金流量表</option>'
        + '<option value="fund"' + (v.stmt === 'fund' ? ' selected' : '') + '>基金跟踪字段</option>'
        + '</select></div>'
        + '<div class="cfgcc-form-row"><label>科目名<span class="req">*</span></label>'
        + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：营业收入／认缴金额" /></div>'
        + '<div class="cfgcc-form-row"><label>别名</label>'
        + '<input id="cfgFAliases" value="' + esc(v.aliases || '') + '" placeholder="逗号分隔，用于 OCR 映射" /></div>';
    } else if (col === 'indicators') {
      var indCats = ['成长性', '盈利能力', '偿债能力', '资产质量', '现金质量'];
      formBody = '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
        + '<div class="cfgcc-form-row"><label>指标名<span class="req">*</span></label>'
        + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：营收同比增速" /></div>'
        + '<div class="cfgcc-form-row"><label>类别</label>'
        + '<select id="cfgFCat">'
        + indCats.map(function (c) {
          return '<option value="' + esc(c) + '"' + (v.category === c ? ' selected' : '') + '>' + esc(c) + '</option>';
        }).join('')
        + '</select></div>'
        + '<div class="cfgcc-form-row"><label>计算说明</label>'
        + '<textarea id="cfgFDesc" rows="2" placeholder="如：毛利润 / 营业收入 × 100%">' + esc(v.description || '') + '</textarea></div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
        + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>触发阈值</label>'
        + '<input id="cfgFThreshold" value="' + esc(v.threshold || '') + '" placeholder="例：< -20%" /></div>'
        + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>触发方向</label>'
        + '<select id="cfgFDir">'
        + '<option value="up"'   + (v.direction === 'up'   ? ' selected' : '') + '>上升触发</option>'
        + '<option value="down"' + (v.direction === 'down' ? ' selected' : '') + '>下降触发</option>'
        + '<option value="both"' + (v.direction === 'both' ? ' selected' : '') + '>双向触发</option>'
        + '<option value="none"' + (v.direction === 'none' ? ' selected' : '') + '>不预警（纯计算）</option>'
        + '</select></div>'
        + '</div>';
    } else if (col === 'fields') {
      var curMode = v.updateMode || 'always';
      var curSrc = cfgResolveFieldSource(v);
      var tplForField = store.get ? store.get('parseTemplates', v.templateId || _local.cfgParseTpl || '') : null;
      var inhObjType = (tplForField && tplForField.objectType) || 'direct';
      var inhObjLabel = (store.OBJ_TYPES && store.OBJ_TYPES[inhObjType]) || inhObjType;
      var fieldLayer = (inhObjType === 'subFund')
        ? (v.layer || cfgFieldLayer(v) || _local.cfgParseTplLayer || 'fundLayer')
        : '';
      var tabMap = (inhObjType === 'subFund' && fieldLayer === 'lookthrough')
        ? ARCHIVE_TAB_MODULES.direct
        : (ARCHIVE_TAB_MODULES[inhObjType] || ARCHIVE_TAB_MODULES.direct);
      var tabNames = Object.keys(tabMap);
      var tm0 = cfgNormalizeTabModule(v);
      var curTab = tm0.tab;
      if (tabNames.indexOf(curTab) < 0) curTab = tabNames[0] || '';
      var modNames = tabMap[curTab] || [];
      var curMod = tm0.module;
      if (modNames.indexOf(curMod) < 0) curMod = modNames[0] || '';
      var tabOpts = tabNames.map(function (t) {
        return '<option value="' + esc(t) + '"' + (t === curTab ? ' selected' : '') + '>' + esc(t) + '</option>';
      }).join('');
      var modOpts = modNames.map(function (m) {
        return '<option value="' + esc(m) + '"' + (m === curMod ? ' selected' : '') + '>' + esc(m) + '</option>';
      }).join('');
      var indOpts = (store.list ? store.list('indicators') : []).map(function (ind) {
        return '<option value="' + esc(ind.id) + '"'
          + (v.formulaTemplateId === ind.id ? ' selected' : '')
          + ' data-formula="' + esc(ind.description || '') + '">'
          + esc(ind.name) + '</option>';
      }).join('');
      var curTplFormula = '';
      if (v.formulaTemplateId && store.get) {
        var _ft0 = store.get('indicators', v.formulaTemplateId);
        if (_ft0) curTplFormula = _ft0.description || '';
      } else if (v.formula) {
        curTplFormula = v.formula;
      }
      formBody = '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
        + '<input type="hidden" id="cfgFTplId" value="' + esc(v.templateId || _local.cfgParseTpl || '') + '" />'
        + '<input type="hidden" id="cfgFObjTypeHint" value="' + esc(inhObjType) + '" />'
        + '<input type="hidden" id="cfgFLayerHint" value="' + esc(fieldLayer) + '" />'
        + '<input type="hidden" id="cfgFLandingKeep" value="' + esc(v.landing || '') + '" />'
        + '<div class="cfgcc-form-row"><label>字段名<span class="req">*</span></label>'
        + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：营业收入" /></div>'
        + '<div class="cfgcc-form-row"><label>属于</label>'
        + '<div class="cfgcc-readonly-val">' + esc(inhObjLabel) + '</div></div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
        + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>Tab<span class="req">*</span></label>'
        + '<select id="cfgFTab" onchange="qmxArchiveTabChange(this)">' + tabOpts + '</select></div>'
        + '<div class="cfgcc-form-row" style="margin-bottom:0"><label>模块<span class="req">*</span></label>'
        + '<select id="cfgFModule">' + modOpts + '</select></div>'
        + '</div>'
        + '<div class="cfgcc-form-row" style="margin-top:12px"><label>可选能力</label>'
        + '<div class="cfgcc-cap-row">'
        + '<label class="cfgcc-cap-card' + (curSrc === 'ai' ? ' is-on' : '') + '" for="cfgFAiParse">'
        + '<input type="checkbox" class="cfgcc-cap-input" id="cfgFAiParse"' + (curSrc === 'ai' ? ' checked' : '') + ' onchange="qmxToggleFieldExtras(this)" />'
        + '<span class="cfgcc-cap-text"><span class="cfgcc-cap-title">AI 解析</span><span class="cfgcc-cap-desc">材料提取 · 可回填</span></span>'
        + '</label>'
        + '<label class="cfgcc-cap-card' + (curSrc === 'calc' ? ' is-on' : '') + '" for="cfgFCalc">'
        + '<input type="checkbox" class="cfgcc-cap-input" id="cfgFCalc"' + (curSrc === 'calc' ? ' checked' : '') + ' onchange="qmxToggleFieldExtras(this)" />'
        + '<span class="cfgcc-cap-text"><span class="cfgcc-cap-title">系统计算</span><span class="cfgcc-cap-desc">选用公式模板</span></span>'
        + '</label>'
        + '</div></div>'
        + '<div id="cfgParseMeta"' + (curSrc === 'ai' ? '' : ' style="display:none"') + '>'
          + '<div class="cfgcc-form-row"><label>字段别名 <span style="font-weight:400;color:var(--xb-muted)">可逗号填多个</span></label>'
          + '<input id="cfgFAliases" value="' + esc(window.qmxNormalizeCommaList(v.aliases || '')) + '" placeholder="例：营业收入, 营收, Revenue" oninput="qmxCommaListInput(this)" onblur="qmxCommaListBlur(this)" /></div>'
          + '<div class="cfgcc-form-row"><label>来源材料 <span style="font-weight:400;color:var(--xb-muted)">可逗号填多个</span></label>'
          + '<input id="cfgFSource" value="' + esc(window.qmxNormalizeCommaList(v.sourceType || '')) + '" placeholder="例：GP季报, 内部台账" oninput="qmxCommaListInput(this)" onblur="qmxCommaListBlur(this)" /></div>'
          + '<div class="cfgcc-form-row"><label>更新模式</label>'
          + '<select id="cfgFMode">'
          + '<option value="always"' + (curMode === 'always' ? ' selected' : '') + '>每次更新</option>'
          + '<option value="first"'  + (curMode === 'first'  ? ' selected' : '') + '>仅首次（有值不覆盖）</option>'
          + '</select></div>'
        + '</div>'
        + '<div id="cfgCalcMeta"' + (curSrc === 'calc' ? '' : ' style="display:none"') + '>'
          + '<div class="cfgcc-form-row"><label>公式模板<span class="req">*</span></label>'
          + '<select id="cfgFFormulaTpl" onchange="qmxFormulaTplChange(this)">'
          + '<option value="">请选择…</option>' + indOpts + '</select></div>'
          + '<div class="cfgcc-form-row"><label>计算公式</label>'
          + '<div class="cfgcc-readonly-val" id="cfgFFormulaPreview">' + esc(curTplFormula || '—') + '</div></div>'
        + '</div>';
    } else if (col === 'indicatorSets') {
      var stdOptions = (store.list ? store.list('standards') : []).map(function (s) {
        return '<option value="' + esc(s.id) + '"' + (v.standardId === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>';
      }).join('');
      formBody = '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
        + '<div class="cfgcc-form-row"><label>公式模板集名称<span class="req">*</span></label>'
        + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：直投企业财务分析公式模板集" /></div>'
        + '<div class="cfgcc-form-row"><label>关联财务准则<span class="req">*</span></label>'
        + '<select id="cfgFStdId"><option value="">请选择准则…</option>' + stdOptions + '</select></div>'
        + '<div class="cfgcc-form-row"><label>说明</label>'
        + '<textarea id="cfgFDesc" rows="2" placeholder="供档案字段「系统计算」选用，不管显示在哪一页">' + esc(v.description || '') + '</textarea></div>';
    } else if (col === 'parseTemplates') {
      var objTypes = (store.OBJ_TYPES) || { direct: '直投项目', subFund: '所投子基金', fund: '管理基金' };
      var objOpts = Object.keys(objTypes).map(function (k) {
        return '<option value="' + esc(k) + '"' + (v.objectType === k ? ' selected' : '') + '>' + esc(objTypes[k]) + '</option>';
      }).join('');
      formBody = '<input type="hidden" id="cfgFId" value="' + esc(v.id || '') + '" />'
        + '<div class="cfgcc-form-row"><label>模板名称<span class="req">*</span></label>'
        + '<input id="cfgFName" value="' + esc(v.name || '') + '" placeholder="例：PE/VC 子基金标准解析模板" /></div>'
        + '<div class="cfgcc-form-row"><label>对象类型<span class="req">*</span></label>'
        + '<select id="cfgFObjType">' + objOpts + '</select></div>'
        + '<div class="cfgcc-form-row"><label>说明</label>'
        + '<textarea id="cfgFDesc" rows="2" placeholder="模板用途说明">' + esc(v.description || '') + '</textarea></div>';
    }

    return '<div class="xb-modal-mask" data-act="cfgCloseModal">'
      + '<div class="xb-modal cfgcc-modal" data-stop="1">'
      + '<h3>' + esc(title) + '</h3>'
      + '<input type="hidden" id="cfgFCol" value="' + esc(col) + '" />'
      + formBody
      + '<div class="xb-modal-actions">'
      + '<button type="button" class="btn btn-ghost" data-act="cfgCloseModal">取消</button>'
      + '<button type="button" class="btn btn-primary" data-act="cfgSave">保存</button>'
      + '</div></div></div>';
  }

  /* ——— Config Center CSS ——— */

  function cfgCenterStyles() {
    /* 表面色走主题 token，禁止写死 #fff：深色下字色已变浅，白底会看不清 */
    return '<style>'
      /* shell */
      + '.cfgcc-page{max-width:1200px}'
      + '.cfgcc-page--detail{max-width:none}'
      + '.cfgcc-shell{display:flex;gap:0;border:1px solid var(--xb-border);border-radius:10px;overflow:hidden;background:var(--xb-surface);color:var(--xb-text);min-height:520px}'
      /* inner nav */
      + '.cfgcc-nav{width:168px;flex-shrink:0;border-right:1px solid var(--xb-border);background:var(--xb-bg-soft);padding:12px 0}'
      + '.cfgcc-nav-item{display:block;width:100%;padding:9px 18px;font-size:13px;font-weight:500;text-align:left;border:none;background:none;color:var(--xb-muted);cursor:pointer;transition:color .15s,background .15s}'
      + '.cfgcc-nav-item:hover{background:var(--po-hi-bg);color:var(--xb-text)}'
      + '.cfgcc-nav-item.on{background:var(--xb-surface);color:var(--xb-accent);font-weight:600;border-right:2px solid var(--xb-accent);margin-right:-1px}'
      /* main area */
      + '.cfgcc-main{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--xb-surface);color:var(--xb-text)}'
      + '.cfgcc-field-hint{margin-top:6px;font-size:12px;color:var(--xb-muted);line-height:1.4}'
      + '.cfgcc-radio-row{display:flex;flex-wrap:wrap;gap:12px 16px;padding-top:4px}'
      + '.cfgcc-cap-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
      + '.cfgcc-form-row .cfgcc-cap-card{display:flex;align-items:flex-start;gap:10px;margin:0;padding:11px 12px;border:1px solid var(--xb-border);border-radius:8px;background:var(--xb-bg-soft);cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s;color:var(--xb-text);font-weight:500;box-sizing:border-box}'
      + '.cfgcc-form-row .cfgcc-cap-card:hover{border-color:color-mix(in srgb, var(--xb-text) 28%, var(--xb-border));background:var(--xb-surface)}'
      + '.cfgcc-form-row .cfgcc-cap-card.is-on{border-color:var(--xb-text);background:var(--xb-surface);box-shadow:inset 0 0 0 1px var(--xb-text)}'
      + '.cfgcc-form-row .cfgcc-cap-card .cfgcc-cap-input{width:15px;height:15px;min-width:15px;margin:2px 0 0;padding:0;flex-shrink:0;accent-color:var(--xb-text);cursor:pointer;border:none;border-radius:0;background:transparent;box-shadow:none}'
      + '.cfgcc-form-row .cfgcc-cap-card .cfgcc-cap-input:focus{border:none;box-shadow:none}'
      + '.cfgcc-cap-text{display:flex;flex-direction:column;gap:2px;min-width:0;line-height:1.25}'
      + '.cfgcc-cap-title{display:block;font-size:13px;font-weight:600;color:var(--xb-text);margin:0}'
      + '.cfgcc-cap-desc{display:block;font-size:11px;font-weight:400;color:var(--xb-muted);margin:0}'
      + '.cfgcc-field-row{cursor:grab}'
      + '.cfgcc-field-row.drag-over{background:var(--po-hi-bg);box-shadow:inset 0 2px 0 var(--xb-accent)}'
      + '.cfgcc-drag-hint{display:inline-block;color:var(--xb-faint);font-size:12px;letter-spacing:-1px;margin-right:6px;user-select:none;opacity:.55}'
      + '.cfgcc-field-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-bottom:1px solid var(--xb-border);background:var(--xb-surface);flex-wrap:wrap}'
      + '.cfgcc-field-toolbar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}'
      + '.cfgcc-field-toolbar-right{display:flex;align-items:center;gap:12px;margin-left:auto;flex-shrink:0}'
      + '.cfgcc-field-count{font-size:12px;color:var(--xb-muted);white-space:nowrap;font-variant-numeric:tabular-nums}'
      + '.cfgcc-filter-select{height:32px;min-width:118px;max-width:168px;box-sizing:border-box;padding:0 28px 0 10px;font-size:12px;line-height:30px;border:1px solid var(--xb-border);border-radius:7px;background:var(--xb-bg-soft);color:var(--xb-text);outline:none;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%238e8e93\' d=\'M3 4.5L6 8l3-3.5\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;transition:border-color .15s}'
      + '.cfgcc-filter-select:hover{border-color:color-mix(in srgb, var(--xb-text) 28%, var(--xb-border))}'
      + '.cfgcc-filter-select:focus{border-color:var(--xb-accent);box-shadow:0 0 0 3px color-mix(in srgb, var(--xb-accent) 16%, transparent)}'
      + '.cfgcc-filter-clear{border:none;background:none;padding:0 4px;font-size:12px;color:var(--xb-muted);cursor:pointer}'
      + '.cfgcc-filter-clear:hover{color:var(--xb-text)}'
      + '.cfgcc-layer-seg{display:inline-flex;align-items:center;padding:3px;gap:2px;border-radius:8px;background:var(--xb-bg-soft);border:1px solid var(--xb-border)}'
      + '.cfgcc-layer-seg-btn{border:none;background:transparent;padding:5px 11px;font-size:12px;font-weight:500;color:var(--xb-muted);border-radius:6px;cursor:pointer;line-height:1.2;transition:background .15s,color .15s,box-shadow .15s}'
      + '.cfgcc-layer-seg-btn:hover{color:var(--xb-text)}'
      + '.cfgcc-layer-seg-btn.is-on{background:var(--xb-surface);color:var(--xb-text);font-weight:600;box-shadow:0 1px 2px color-mix(in srgb, var(--xb-text) 10%, transparent)}'
      + '.cfgcc-td-landing{font-weight:500;color:var(--xb-text)}'
      + '.cfgcc-content-head{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--xb-border);gap:12px;flex-wrap:wrap}'
      + '.cfgcc-stmt-tabs{display:flex;gap:4px}'
      + '.cfgcc-stmt-tab{padding:5px 12px;font-size:12px;font-weight:500;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-surface);color:var(--xb-muted);cursor:pointer;transition:all .15s}'
      + '.cfgcc-stmt-tab span{margin-left:4px;font-size:11px;color:var(--xb-faint)}'
      + '.cfgcc-stmt-tab.on{background:var(--xb-accent);border-color:var(--xb-accent);color:var(--po-on-ink)}'
      + '.cfgcc-stmt-tab.on span{color:color-mix(in srgb, var(--po-on-ink) 72%, transparent)}'
      /* table */
      + '.cfgcc-table{width:100%;border-collapse:collapse;font-size:13px;color:var(--xb-text)}'
      + '.cfgcc-table thead tr{border-bottom:1px solid var(--xb-border);background:var(--xb-bg-soft)}'
      + '.cfgcc-table th{padding:9px 16px;font-size:11px;font-weight:600;color:var(--xb-muted);text-align:left;white-space:nowrap}'
      + '.cfgcc-table tbody tr{border-bottom:1px solid var(--xb-border);transition:background .1s}'
      + '.cfgcc-table tbody tr:last-child{border-bottom:none}'
      + '.cfgcc-table tbody tr:hover{background:var(--xb-bg-soft)}'
      + '.cfgcc-table td{padding:10px 16px;vertical-align:middle}'
      + '.cfgcc-td-name{font-weight:500;color:var(--xb-text)}'
      + '.cfgcc-td-muted{color:var(--xb-muted);font-size:12px;max-width:240px}'
      + '.cfgcc-td-acts{white-space:nowrap}'
      + '.cfgcc-empty{text-align:center;color:var(--xb-muted);padding:36px !important;font-size:13px}'
      /* tags */
      + '.cfgcc-tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:500;white-space:nowrap}'
      + '.cfgcc-tag--accent{background:var(--po-hi-bg);color:var(--xb-accent)}'
      + '.cfgcc-tag--danger{background:var(--po-diff-bg);color:var(--po-danger-soft-fg,var(--xb-danger))}'
      + '.cfgcc-tag--warn{background:var(--po-warn-soft-bg);color:var(--po-warn-soft-fg)}'
      + '.cfgcc-tag--muted{background:var(--xb-bg-soft);color:var(--xb-muted);border:1px solid var(--xb-border)}'
      /* toggle btn */
      + '.cfgcc-toggle{padding:3px 10px;font-size:11px;font-weight:500;border-radius:10px;border:1px solid var(--xb-border);background:var(--xb-surface);color:var(--xb-muted);cursor:pointer;transition:all .15s}'
      + '.cfgcc-toggle.on{background:var(--po-ok-soft-bg);border-color:color-mix(in srgb, var(--po-ok-soft-fg) 35%, transparent);color:var(--po-ok-soft-fg)}'
      + '.cfgcc-toggle:hover{border-color:var(--xb-accent);color:var(--xb-accent)}'
      /* row action btns */
      + '.cfgcc-act-btn{padding:3px 10px;font-size:12px;border:1px solid var(--xb-border);border-radius:5px;background:var(--xb-surface);color:var(--xb-muted);cursor:pointer;margin-left:4px;transition:all .15s}'
      + '.cfgcc-act-btn.is-on{border-color:var(--xb-text);color:var(--xb-text);font-weight:600;background:var(--xb-bg-soft)}'
      + '.cfgcc-act-btn:hover{border-color:var(--xb-accent);color:var(--xb-accent)}'
      + '.cfgcc-act-danger:hover{border-color:var(--xb-danger);color:var(--xb-danger)}'
      /* code */
      + '.cfgcc-code{font-family:monospace;font-size:11px;background:var(--xb-bg-soft);padding:2px 6px;border-radius:4px;color:var(--xb-muted)}'
      + '.cfgcc-tag--obj{background:var(--po-ok-soft-bg);color:var(--po-ok-soft-fg)}'
      + '.cfgcc-bucket-hint{margin-top:6px;font-size:12px;line-height:1.45;color:var(--xb-muted);max-width:520px}'
      + '.cfgcc-std-bucket-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}'
      + '.cfgcc-std-card.is-active{border-color:var(--xb-text)}'
            + '.cfgcc-td-code{font-family:monospace;font-size:11px;color:var(--xb-text);max-width:280px;word-break:break-all}'
      + '.cfgcc-readonly-val{font-size:13px;color:var(--xb-text);padding:7px 10px;border:1px dashed var(--xb-border);border-radius:6px;background:var(--xb-bg-soft)}'
      + '.cfgcc-checkbox-row{display:flex;align-items:center;gap:10px;margin:2px 0 14px;flex-wrap:wrap}'
      + '.cfgcc-checkbox{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--xb-text);cursor:pointer}'
      + '.cfgcc-checkbox input{width:auto;margin:0}'
      + '.cfgcc-checkbox-hint{font-size:11px;color:var(--xb-muted)}'
      /* modal */
      + '.cfgcc-modal{min-width:440px;max-width:540px;background:var(--xb-surface);color:var(--xb-text)}'
      + '.cfgcc-modal h3{margin:0 0 16px;font-size:16px;font-weight:600;color:var(--xb-text)}'
      + '.cfgcc-form-row{margin-bottom:14px}'
      + '.cfgcc-form-row label{display:block;font-size:12px;font-weight:600;color:var(--xb-muted);margin-bottom:5px}'
      + '.cfgcc-form-row .req{color:var(--xb-danger);margin-left:2px}'
      + '.cfgcc-form-row input,.cfgcc-form-row select,.cfgcc-form-row textarea{width:100%;box-sizing:border-box;padding:8px 10px;font-size:13px;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-bg-soft);color:var(--xb-text);outline:none;transition:border-color .15s;font-family:inherit}'
      + '.cfgcc-form-row input:focus,.cfgcc-form-row select:focus,.cfgcc-form-row textarea:focus{border-color:var(--xb-accent);box-shadow:0 0 0 3px color-mix(in srgb, var(--xb-accent) 18%, transparent)}'
      + '.cfgcc-form-row textarea{resize:vertical;min-height:56px}'
      /* standards list */
      + '.cfgcc-std-list{padding:16px 20px;display:flex;flex-direction:column;gap:10px}'
      + '.cfgcc-std-card{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid var(--xb-border);border-radius:8px;background:var(--xb-surface);color:var(--xb-text);transition:border-color .15s,box-shadow .15s}'
      + '.cfgcc-std-card:hover{border-color:var(--xb-accent);box-shadow:0 2px 10px color-mix(in srgb, var(--xb-text) 8%, transparent)}'
      + '.cfgcc-std-main{flex:1;min-width:0}'
      + '.cfgcc-std-title{font-size:14px;font-weight:600;color:var(--xb-text);display:flex;align-items:center;gap:8px;margin:2px 0 6px}'
      + '.cfgcc-std-badge{font-size:10px;font-weight:500;padding:2px 7px;border-radius:8px;background:var(--po-hi-bg);color:var(--xb-accent)}'
      + '.cfgcc-std-desc{font-size:12px;color:var(--xb-muted);margin-bottom:8px;line-height:1.5}'
      + '.cfgcc-std-stats{display:flex;gap:14px}'
      + '.cfgcc-std-stat{font-size:12px;color:var(--xb-muted)}'
      + '.cfgcc-std-stat strong{color:var(--xb-text);font-weight:600}'
      + '.cfgcc-std-acts{display:flex;align-items:center;gap:6px;flex-shrink:0}'
      + '.cfgcc-std-enter-btn{font-size:12px;padding:5px 12px}'
      /* subject detail — split layout */
      + '.cfgcc-shell--detail{min-height:560px}'
      + '.cfgcc-detail-nav{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--xb-border);background:var(--xb-bg-soft);flex-shrink:0}'
      + '.cfgcc-back-btn{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--xb-muted);border:none;background:none;cursor:pointer;padding:4px 0;transition:color .15s}'
      + '.cfgcc-back-btn:hover{color:var(--xb-text)}'
      + '.cfgcc-back-btn svg{width:14px;height:14px}'
      + '.cfgcc-detail-title{font-size:14px;font-weight:600;color:var(--xb-text);padding-left:12px;border-left:1px solid var(--xb-border);letter-spacing:-.01em}'
      + '.cfgcc-del-subj-btn{font-size:12px;padding:6px 14px;border:1px solid var(--xb-danger);border-radius:6px;background:var(--xb-surface);color:var(--xb-danger);cursor:pointer;transition:background .15s}'
      + '.cfgcc-del-subj-btn:hover{background:var(--po-diff-bg)}'
      /* detail section tabs */
      + '.cfgcc-section-tabs{display:flex;gap:4px;padding:10px 20px 0;border-bottom:1px solid var(--xb-border);flex-shrink:0}'
      + '.cfgcc-section-tab{position:relative;padding:8px 4px 12px;margin-right:20px;font-size:13px;color:var(--xb-muted);border:none;background:none;cursor:pointer;transition:color .15s}'
      + '.cfgcc-section-tab:hover{color:var(--xb-text)}'
      + '.cfgcc-section-tab.on{color:var(--xb-text);font-weight:600}'
      + '.cfgcc-section-tab.on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--xb-text)}'
      + '.cfgcc-section-cnt{margin-left:5px;font-size:11px;color:var(--xb-muted);background:var(--xb-bg-soft);padding:1px 6px;border-radius:8px;font-weight:400}'
      /* check rule cards */
      + '.cfgcc-check-list{display:flex;flex-direction:column;gap:8px;margin-top:4px}'
      + '.cfgcc-check-card{border:1px solid var(--xb-border);border-radius:8px;padding:12px 14px;background:var(--xb-surface);color:var(--xb-text);transition:opacity .15s}'
      + '.cfgcc-check-card.is-off{opacity:.5}'
      + '.cfgcc-check-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}'
      + '.cfgcc-check-name{font-size:13px;font-weight:600;color:var(--xb-text)}'
      + '.cfgcc-check-stmt{font-size:11px;color:var(--xb-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}'
      + '.cfgcc-check-acts{margin-left:auto;display:flex;align-items:center;gap:6px}'
      + '.cfgcc-check-formula{margin-top:9px;font-size:12px;color:var(--xb-text);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--xb-bg-soft);padding:7px 11px;border-radius:6px}'
      /* wide modal for checks */
      + '.cfgcc-modal-wide{min-width:540px;max-width:780px}'
      /* two-column modal — indicators and checks */
      + '.cfgcc-modal-ind{width:860px;max-width:96vw}'
      + '.cfgcc-ind-body{display:flex;gap:20px;align-items:flex-start;margin-bottom:4px}'
      + '.cfgcc-ind-picker-col{width:260px;flex-shrink:0;border-right:1px solid var(--xb-border);padding-right:20px}'
      + '.cfgcc-ind-form-col{flex:1;min-width:0}'
      /* subject picker */
      + '.cfgcc-subject-picker{display:flex;flex-direction:column;gap:4px;max-height:220px;overflow-y:auto;padding:8px 10px;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-bg-soft);margin-bottom:8px}'
      + '.cfgcc-subject-picker--tall{max-height:360px;margin-bottom:0}'
      /* search box */
      + '.cfgcc-picker-search{width:100%;box-sizing:border-box;padding:6px 10px;font-size:12px;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-surface);color:var(--xb-text);outline:none;transition:border-color .15s;margin-bottom:6px}'
      + '.cfgcc-picker-search:focus{border-color:var(--xb-accent);box-shadow:0 0 0 3px color-mix(in srgb, var(--xb-accent) 18%, transparent)}'
      /* collapsible chip group */
      + '.cfgcc-chip-group{margin-bottom:2px}'
      + '.cfgcc-chip-group-toggle{display:flex;align-items:center;gap:5px;width:100%;border:none;background:none;cursor:pointer;padding:3px 0;font-size:11px;font-weight:600;color:var(--xb-muted);text-transform:uppercase;letter-spacing:.03em;text-align:left;transition:color .15s}'
      + '.cfgcc-chip-group-toggle:hover{color:var(--xb-accent)}'
      + '.cfgcc-grp-chevron{font-size:10px;width:8px;text-align:center;flex-shrink:0}'
      + '.cfgcc-grp-count{font-size:10px;color:var(--xb-faint);font-weight:400}'
      + '.cfgcc-grp-chips{display:flex;flex-wrap:wrap;gap:5px;padding-bottom:4px}'
      + '.cfgcc-subject-chip{padding:3px 9px;font-size:12px;border:1px solid var(--xb-border);border-radius:10px;background:var(--xb-surface);color:var(--xb-text);cursor:pointer;transition:all .12s;white-space:nowrap}'
      + '.cfgcc-subject-chip:hover{border-color:var(--xb-accent);color:var(--xb-accent);background:var(--po-hi-bg)}'
      /* operator buttons */
      + '.cfgcc-op-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}'
      + '.cfgcc-op-btn{padding:4px 12px;font-size:14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:500;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-surface);color:var(--xb-text);cursor:pointer;transition:all .12s;line-height:1}'
      + '.cfgcc-op-btn:hover{border-color:var(--xb-accent);color:var(--xb-accent);background:var(--po-hi-bg)}'
      /* formula chip box — no free-text editing */
      + '.cfgcc-formula-toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px}'
      + '.cfgcc-formula-del,.cfgcc-formula-clear{padding:3px 10px;font-size:12px;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-surface);color:var(--xb-muted);cursor:pointer}'
      + '.cfgcc-formula-del:hover:not(:disabled),.cfgcc-formula-clear:hover{border-color:var(--xb-text);color:var(--xb-text)}'
      + '.cfgcc-formula-del:disabled{opacity:.4;cursor:not-allowed}'
      + '.cfgcc-formula-box{min-height:88px;padding:10px 12px;border:1px solid var(--xb-border);border-radius:8px;background:var(--xb-surface);display:flex;flex-wrap:wrap;gap:6px;align-items:center;align-content:flex-start;outline:none}'
      + '.cfgcc-formula-box:focus{border-color:var(--xb-accent);box-shadow:0 0 0 3px color-mix(in srgb, var(--xb-accent) 18%, transparent)}'
      + '.cfgcc-formula-ph{font-size:12px;color:var(--xb-muted);line-height:1.5}'
      + '.cfgcc-formula-token{padding:5px 10px;font-size:13px;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-bg-soft);color:var(--xb-text);cursor:pointer;transition:all .12s;line-height:1.2;max-width:100%;text-align:left}'
      + '.cfgcc-formula-token--op{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:600;padding:5px 9px;background:var(--xb-surface)}'
      + '.cfgcc-formula-token:hover{border-color:var(--xb-accent)}'
      + '.cfgcc-formula-token.is-selected{border-color:var(--xb-text);background:var(--po-ink);color:var(--po-on-ink);box-shadow:0 0 0 2px color-mix(in srgb, var(--po-ink) 18%, transparent)}'
      + '</style>';
  }

  function fpStyles() {
    return '<style>'
      + '.fp-gp-progress{display:flex;align-items:center;gap:14px;padding:14px 18px;background:var(--xb-surface);border:1px solid var(--xb-border);border-radius:8px;margin-bottom:16px}'
      + '.fp-gp-info{display:flex;align-items:baseline;gap:2px;flex-shrink:0}'
      + '.fp-gp-num{font-size:22px;font-weight:700;color:var(--xb-text)}'
      + '.fp-gp-slash{color:var(--xb-muted);margin:0 2px}'
      + '.fp-gp-denom{font-size:15px;color:var(--xb-muted)}'
      + '.fp-gp-label{font-size:13px;color:var(--xb-muted);margin-left:8px}'
      + '.fp-gp-pct{font-size:13px;font-weight:600;color:var(--xb-accent);margin-left:6px}'
      + '.fp-gp-bar{flex:1;height:6px;background:var(--xb-border);border-radius:3px;overflow:hidden}'
      + '.fp-gp-bar-fill{height:100%;background:var(--xb-accent);border-radius:3px;transition:width .4s}'
      + '.fp-gp-btn{padding:6px 14px;font-size:13px;border:1px solid var(--xb-border);border-radius:6px;background:var(--xb-bg);color:var(--xb-text);cursor:pointer;white-space:nowrap}'
      + '.fp-gp-btn:hover{border-color:var(--xb-accent);color:var(--xb-accent)}'
      + '.fp-upload-zone{border:2px dashed var(--xb-border);border-radius:8px;padding:36px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;margin-bottom:16px}'
      + '.fp-upload-zone:hover{border-color:var(--xb-accent);background:rgba(99,102,241,.03)}'
      + '.fp-upload-icon{font-size:28px;color:var(--xb-muted);margin-bottom:8px}'
      + '.fp-upload-text{font-size:14px;font-weight:500;color:var(--xb-text);margin-bottom:4px}'
      + '.fp-upload-hint{font-size:12px;color:var(--xb-muted)}'
      + '.fp-stats{display:flex;gap:12px;margin-bottom:20px}'
      + '.fp-stat{flex:1;padding:14px;background:var(--xb-surface);border:1px solid var(--xb-border);border-radius:8px;text-align:center;cursor:default;transition:border-color .15s}'
      + '.fp-stat-active{border-color:var(--xb-danger);cursor:pointer}'
      + '.fp-stat-active:hover{box-shadow:0 2px 8px rgba(220,38,38,.1)}'
      + '.fp-stat-num{display:block;font-size:24px;font-weight:700;color:var(--xb-text)}'
      + '.fp-stat-active .fp-stat-num{color:var(--xb-danger)}'
      + '.fp-stat-label{display:block;font-size:12px;color:var(--xb-muted);margin-top:2px}'
      + '.fp-section{margin-bottom:16px}'
      + '.fp-section-h{font-size:12px;font-weight:600;color:var(--xb-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}'
      + '.fp-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid var(--xb-border);border-radius:6px;margin-bottom:6px;background:var(--xb-bg);cursor:pointer;transition:border-color .15s}'
      + '.fp-row:hover{border-color:var(--xb-accent)}'
      + '.fp-row-name{font-size:13px;font-weight:500;color:var(--xb-text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      + '.fp-row-type{font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(99,102,241,.08);color:var(--xb-accent);white-space:nowrap}'
      + '.fp-row-project{font-size:12px;color:var(--xb-muted);white-space:nowrap}'
      + '.fp-row-period{font-size:12px;color:var(--xb-muted);white-space:nowrap}'
      + '.fp-row-status{font-size:12px;font-weight:500;white-space:nowrap}'
      + '.fp-row-suggest{font-size:12px;color:var(--xb-danger);margin-top:4px}'
      + '.fp-chip{padding:4px 12px;border-radius:12px;font-size:12px;font-weight:500}'
      + '.fp-chip-fog{background:var(--xb-surface);color:var(--xb-muted);border:1px solid var(--xb-border)}'
      + '</style>';
  }

  function fundStyles() {
    return '<style>'
      + '.fund-row{display:flex;align-items:center;gap:16px;padding:16px 18px;border:1px solid var(--xb-border);border-radius:8px;margin-bottom:8px;background:var(--xb-bg);cursor:pointer;transition:border-color .15s,box-shadow .15s}'
      + '.fund-row:hover{border-color:var(--xb-accent);box-shadow:0 2px 12px rgba(99,102,241,.06)}'
      + '.fund-row-name{font-size:15px;font-weight:600;color:var(--xb-text);flex-shrink:0;min-width:100px}'
      + '.fund-row-type{font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(99,102,241,.08);color:var(--xb-accent)}'
      + '.fund-row-status{font-size:12px;color:var(--xb-muted)}'
      + '.fund-row-projects{font-size:12px;color:var(--xb-muted)}'
      + '.fund-row-invested{font-size:12px;color:var(--xb-muted);margin-left:auto}'
      + '.fund-row-nav{font-size:13px;font-weight:600;color:var(--xb-text)}'
      + '</style>';
  }

  function cfgStyles() {
    return '<style>'
      + '.cfg-page{max-width:1180px}.cfg-intro-text{font-size:13px;color:var(--xb-muted);margin:0 0 16px}'
      + '.cfg-material-table{border:1px solid var(--xb-border);border-radius:8px;background:#fff;overflow:hidden}.cfg-material-head,.cfg-material-row{display:grid;grid-template-columns:minmax(170px,1.1fr) minmax(250px,2fr) minmax(190px,1.4fr) 48px;gap:12px;align-items:center;width:100%;box-sizing:border-box;text-align:left}.cfg-material-head{padding:9px 14px;background:var(--xb-bg-soft);font-size:11px;font-weight:600;color:var(--xb-muted)}.cfg-material-row{padding:11px 14px;border:0;border-top:1px solid var(--xb-border);background:#fff;color:var(--xb-text);font-size:12px;cursor:default}.cfg-material-row[data-nav]{cursor:pointer}.cfg-material-row[data-nav]:hover{background:var(--xb-bg-soft)}.cfg-material-name{display:flex;flex-direction:column;gap:2px}.cfg-material-name strong{font-size:13px}.cfg-material-name small{font-size:10px;color:var(--xb-muted)}.cfg-material-arrow{font-size:11px;color:var(--xb-muted);text-align:right}@media(max-width:900px){.cfg-material-head,.cfg-material-row{grid-template-columns:150px 1fr}.cfg-material-head span:nth-child(3),.cfg-material-head span:nth-child(4),.cfg-material-row>span:nth-child(3),.cfg-material-row>span:nth-child(4){display:none}}'
      + '</style>';
  }

  /* ——— actions ——— */

  var PEPages = {
    render: function (route, ctx) {
      _ctx = ctx;
      _route = route || 'home';
      var root = ctx.rootEl;
      if (!root) return;

      if (_local.inviteOpen && !/^project\//.test(_route) && !/^chat\//.test(_route)) {
        _local.inviteOpen = false;
      }
      if (_route !== 'home') _local.homePlusMenuOpen = false;

      var html = '';
      var r = _route;
      var m;
      var _usedPost = false;
      var _postHtml = (window.PE_POST_PAGES) ? window.PE_POST_PAGES.render(r, ctx) : null;
      if (_postHtml != null) { html = _postHtml; _usedPost = true; }
      else if (r === 'home') html = pageHome();
      else if (r === 'file-parse') html = pageFileParse();
      else if (r === 'fund') html = pageFund();
      else if ((m = /^fund\/(.+)$/.exec(r))) html = pageFundDetail(m[1]);
      else if (r === 'report') html = pageReportCenter();
      else if (r === 'config-center') html = pageConfigCenter();
      else if (r === 'projects') html = pageProjects();
      else if (r === 'discover' || r === 'intelligence' || r === 'experts' || r === 'journalist') {
        if (r === 'experts') _local.discoverTab = 'meetings';
        else if (r === 'journalist') _local.discoverTab = 'field';
        else if (r === 'intelligence') _local.discoverTab = 'leads';
        html = pageDiscover();
      }
      else if (r === 'parse') html = pageKnowledge();
      else if (r === 'post' || r === 'post/pulse') {
        var _postTab = r === 'post/pulse' ? 'pulse' : 'list';
        var _tabStyle = 'padding:10px 16px 9px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;margin-bottom:-1px;';
        var _tabBar = '<div style="display:flex;border-bottom:1px solid var(--xb-border);background:var(--xb-bg);padding:0 24px">'
          + '<button style="' + _tabStyle + (_postTab === 'list'  ? 'color:var(--xb-accent);border-bottom:2px solid var(--xb-accent)' : 'color:var(--xb-muted);border-bottom:2px solid transparent') + '" data-nav="post">项目列表</button>'
          + '<button style="' + _tabStyle + (_postTab === 'pulse' ? 'color:var(--xb-accent);border-bottom:2px solid var(--xb-accent)' : 'color:var(--xb-muted);border-bottom:2px solid transparent') + '" data-nav="post/pulse">季报看板</button>'
          + '</div>';
        if (_postTab === 'pulse') {
          var _pfHtml = window.PE_PORTFOLIO ? window.PE_PORTFOLIO.renderPage() : '<div class="page-body">季报看板未加载</div>';
          html = _tabBar + '<div class="pf-tab-content">' + _pfHtml + '</div>';
        } else {
          html = _tabBar + pagePostList();
        }
      }
      else if (r === 'post-browser') html = window.PE_POST_BROWSER ? window.PE_POST_BROWSER.renderPage() : '<div class="page-body">数据浏览器未加载</div>';
      else if ((m = /^post\/([^/]+)$/.exec(r))) html = pagePostDetail(m[1]);
      else if ((m = /^project\/([^/]+)$/.exec(r))) html = pageProjectHub(m[1]);
      else if ((m = /^project\/([^/]+)\/chat\/([^/]+)$/.exec(r)))
        html = pageProjectChat(m[1], m[2]);
      else if ((m = /^project\/([^/]+)\/ocr$/.exec(r))) {
        _local.rightPaneKind = 'ocr';
        html = pageProjectHub(m[1]);
      } else if ((m = /^project\/([^/]+)\/brief$/.exec(r))) html = pageBrief(m[1]);
      else if ((m = /^project\/([^/]+)\/ubo$/.exec(r))) html = pageUbo(m[1]);
      else if ((m = /^project\/([^/]+)\/gaps$/.exec(r))) html = pageGaps(m[1]);
      else if ((m = /^project\/([^/]+)\/finance$/.exec(r))) html = pageFinance(m[1]);
      else if ((m = /^project\/([^/]+)\/report$/.exec(r))) html = pageReport(m[1]);
      else if ((m = /^project\/([^/]+)\/ic$/.exec(r))) html = pageIc(m[1]);
      else if ((m = /^project\/([^/]+)\/debate$/.exec(r))) html = pageDebate(m[1]);
      else if ((m = /^project\/([^/]+)\/deliver$/.exec(r))) html = pageDeliver(m[1]);
      else if (r === 'scenarios') html = pageScenarios();
      else if (r === 'find' || r === 'radar') {
        _local.discoverTab = 'leads';
        _local.intelligenceTab = 'radar';
        html = pageDiscover();
      }
      else if (r === 'chain') {
        _local.discoverTab = 'leads';
        _local.intelligenceTab = 'chain';
        html = pageDiscover();
      }
      else if (r === 'graph') html = pageGraph();
      else if (r === 'monitor') html = pageMonitor();
      else if (r === 'knowledge') html = pageKnowledge();
      else if (r === 'templates') html = pageTemplates();
      else if (r === 'finance-config') html = pageFinanceConfig();
      else if (r === 'assistant') html = pageAssistant();
      else if (r === 'skills') html = pageSkills();
      else if (r === 'settings') html = pageSettings();
      else if (r === 'chats') html = pageChats();
      else if ((m = /^chat\/([^/]+)$/.exec(r))) html = pageChatDetail(m[1]);
      else {
        html =
          '<div class="page-body"><div class="panel" style="padding:16px">未识别路由：' +
          esc(r) +
          '<div style="margin-top:10px"><button class="btn btn-primary" data-nav="home">回首页</button></div></div></div>';
      }

      root.innerHTML = html + contactFlowHtml();
      if (_usedPost && window.PE_POST_PAGES) {
        window.PE_POST_PAGES.bind(root);
      }
      bindNav(root);
      bindActions(root);
      var formulaBox = document.getElementById('cfgFFormulaBox');
      if (formulaBox) cfgEnsureFormulaBoxDelegate(formulaBox);
      bindCfgSubjectEditors(root);
      bindFinanceConfigEditors(root);
      bindFinanceColTags(root);
      if (!_usedPost && r === 'post-browser' && window.PE_POST_BROWSER) window.PE_POST_BROWSER.bind(root);
      if (r === 'post/pulse' && window.PE_PORTFOLIO) window.PE_PORTFOLIO.bindIn(root.querySelector('.pf-tab-content'));
      if (window.DemoOcrChrome) {
        var peFsPane =
          _local.rightPaneKind === 'ocr' ||
          _local.rightPaneKind === 'ai' ||
          _local.rightPaneKind === 'other';
        if (peFsPane) window.DemoOcrChrome.sync();
        else window.DemoOcrChrome.exitFullscreen();
        window.DemoOcrChrome.bind();
      }

      function onInput(el, fn) {
        if (el && typeof el.addEventListener === 'function') el.addEventListener('input', fn);
      }

      var homeInput = root.querySelector('#peHomeInput');
      if (homeInput && typeof homeInput.addEventListener === 'function') {
        homeInput.addEventListener('input', function () {
          _local.homeDraft = homeInput.value;
          var btn = root.querySelector('#peHomeSend');
          if (btn) btn.disabled = !homeInput.value.trim();
        });
        homeInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            PEPages.act('startDiligence');
          }
        });
        var btn = root.querySelector('#peHomeSend');
        if (btn) btn.disabled = !homeInput.value.trim();
      }

      onInput(root.querySelector('#peProjSearch'), function (e) {
        _local.projectFilter = e.target.value;
        PEPages.render('projects', _ctx);
        var el = _ctx.rootEl.querySelector('#peProjSearch');
        if (el && typeof el.focus === 'function') {
          el.focus();
          if (typeof el.setSelectionRange === 'function') {
            el.setSelectionRange(el.value.length, el.value.length);
          }
        }
      });

      onInput(root.querySelector('#pePostSearch'), function (e) {
        _local.postFilter = e.target.value;
        PEPages.render('post', _ctx);
        var el = _ctx.rootEl.querySelector('#pePostSearch');
        if (el && typeof el.focus === 'function') {
          el.focus();
          if (typeof el.setSelectionRange === 'function') {
            el.setSelectionRange(el.value.length, el.value.length);
          }
        }
      });

      onInput(root.querySelector('#peFindQ'), function (e) {
        _local.findQuery = e.target.value;
        PEPages.render('find', _ctx);
        var el = _ctx.rootEl.querySelector('#peFindQ');
        if (el && typeof el.focus === 'function') {
          el.focus();
          if (typeof el.setSelectionRange === 'function') {
            el.setSelectionRange(el.value.length, el.value.length);
          }
        }
      });

      onInput(root.querySelector('#peChainQuery'), function (e) {
        _local.chainQuery = e.target.value;
        PEPages.render('chain', _ctx);
        var el = _ctx.rootEl.querySelector('#peChainQuery');
        if (el && typeof el.focus === 'function') {
          el.focus();
          if (typeof el.setSelectionRange === 'function') {
            el.setSelectionRange(el.value.length, el.value.length);
          }
        }
      });
    },

    act: function (name, arg, arg2) {
      var data = D();

      if (name === 'uploadZone') {
        toast('拖入文件即可上传，AI 将自动建议材料类型、归属项目与报告期间');
        return;
      }
      if (name === 'genReminder') {
        toast('催收清单已生成（7 支 GP 未到报），可复制到微信/邮件发送');
        return;
      }

      if (name === 'fillChip') {
        var input =
          (_ctx.rootEl && _ctx.rootEl.querySelector('#peChatInput')) ||
          (_ctx.rootEl && _ctx.rootEl.querySelector('#peHomeInput')) ||
          document.getElementById('peChatInput');
        if (input) {
          input.value = arg;
          input.focus();
          toast('已填入输入框');
          return;
        }
        _local.homeDraft = arg;
        setState({ homeDraft: arg });
        navigate('home');
        toast('已填入对话');
        return;
      }

      if (name === 'attachHint') {
        var attachName = '附件_' + new Date().toISOString().slice(11, 19).replace(/:/g, '') + '.pdf';
        _local.composerAttachments = _local.composerAttachments || [];
        _local.composerAttachments.push(attachName);
        if (_ctx && _ctx.rootEl && _ctx.rootEl.querySelector('#peChatInput')) {
          toast('已添加附件「' + attachName + '」，可继续提问');
          rerenderComposer();
          return;
        }
        var target = findProject('p-xinghe') || (D().projects || [])[0];
        if (!target) {
          toast('暂无项目可挂材料');
          return;
        }
        target.materials = target.materials || [];
        target.materials.unshift({
          name: attachName,
          status: '解析中',
          source: '上传',
        });
        setTimeout(function () {
          if (target.materials[0] && target.materials[0].status === '解析中') {
            target.materials[0].status = '已解析';
          }
        }, 600);
        toast('已挂到「' + target.name + '」材料树');
        navigate('project/' + target.id);
        return;
      }

      if (name === 'startDiligence') {
        var input = _ctx && _ctx.rootEl && _ctx.rootEl.querySelector('#peHomeInput');
        var q = (input && input.value.trim()) || (_local.homeDraft || '').trim();
        if (!q) {
          toast('请先输入企业或问题');
          return;
        }
        var chatId = createDiligenceChat(q);
        navigate('chat/' + chatId);
        return;
      }

      if (name === 'onTodo') {
        var todo = null;
        var allTodos = (data.todos || []).concat(data.postTodos || []);
        allTodos.forEach(function (t) {
          if (t.id === arg) todo = t;
        });
        if (!todo) return;
        if (todo.action === 'compose') {
          _local.homeDraft = todo.prompt || '';
          setState({ homeDraft: _local.homeDraft });
          navigate('home');
          toast('已填入对话，可直接开始');
          return;
        }
        if (todo.route) {
          navigate(todo.route);
          return;
        }
        if (todo.projectId) navigate('project/' + todo.projectId);
        return;
      }

      if (name === 'uploadMaterial') {
        var p = findProject(arg);
        if (!p) return;
        p.materials = p.materials || [];
        var uploaded = false;
        for (var i = 0; i < p.materials.length; i++) {
          if (
            p.materials[i].status === '缺口' ||
            p.materials[i].status === '缺失' ||
            p.materials[i].status === '待确认'
          ) {
            p.materials[i].status = '已解析';
            p.materials[i].source = '上传';
            uploaded = true;
            break;
          }
        }
        if (!uploaded) {
          p.materials.push({
            name: '补充材料 ' + (p.materials.length + 1),
            status: '已解析',
            source: '上传',
          });
        }
        if (p.gaps && p.gaps.length) p.gaps.shift();
        p.updated = '刚刚';
        toast('材料已上传并解析');
        navigate(_route.indexOf('gaps') >= 0 ? 'project/' + arg + '/gaps' : 'project/' + arg);
        return;
      }

      if (name === 'askProject') {
        var proj = findProject(arg);
        if (!proj) return;
        var taAsk = _ctx.rootEl && _ctx.rootEl.querySelector('#peChatInput');
        var typed = taAsk && taAsk.value.trim();
        var q2 = typed || '针对' + proj.name + '：请根据当前材料给出投资要点与红旗';
        _local.chatDraft = '';
        _local.composerMenu = null;
        var cid = createDiligenceChat(q2);
        navigate('chat/' + cid);
        return;
      }

      if (name === 'sendProjectChat') {
        var pp = findProject(arg);
        if (!pp) return;
        var ch = null;
        (pp.chats || []).forEach(function (c) {
          if (c.id === arg2) ch = c;
        });
        var ta = _ctx.rootEl.querySelector('#peChatInput');
        var text = ta && ta.value.trim();
        var atts1 = (_local.composerAttachments || []).slice();
        if ((!text && !atts1.length) || !ch) {
          toast('请输入内容或添加附件');
          return;
        }
        var userText1 = text || '';
        if (atts1.length) {
          userText1 =
            (userText1 ? userText1 + '\n' : '') + '【附件】' + atts1.join('、');
        }
        ch.messages.push({ role: 'user', text: userText1 });
        ch.messages.push({
          role: 'ai',
          text:
            '已结合「' +
            pp.name +
            '」材料作答' +
            (atts1.length ? '（已接收 ' + atts1.length + ' 个附件）' : '') +
            '。',
          cards: [
            {
              type: 'flags',
              title: '回复要点',
              items: [
                '已引用项目内已解析材料',
                atts1.length ? '附件：' + atts1.join('、') : '缺口项仍需补齐后才能强化结论',
                '可跳转财报深读 / IC Memo 继续',
              ],
            },
          ],
        });
        ch.preview = text || atts1[0] || '新消息';
        _local.chatDraft = '';
        _local.composerMenu = null;
        _local.composerAttachments = [];
        navigate('project/' + arg + '/chat/' + arg2);
        return;
      }

      if (name === 'sendGlobalChat') {
        var st = getState();
        var sessions = Object.assign({}, st.sessions || {});
        var gchat = sessions[arg];
        if (!gchat) {
          (D().chats || []).forEach(function (c) {
            if (c.id === arg) gchat = c;
          });
        }
        var ta2 = _ctx.rootEl.querySelector('#peChatInput');
        var text2 = ta2 && ta2.value.trim();
        var atts2 = (_local.composerAttachments || []).slice();
        if ((!text2 && !atts2.length) || !gchat) {
          toast('请输入内容或添加附件');
          return;
        }
        var userText2 = text2 || '';
        if (atts2.length) {
          userText2 =
            (userText2 ? userText2 + '\n' : '') + '【附件】' + atts2.join('、');
        }
        gchat.messages = ensureSessionMessages(gchat);
        gchat.messages.push({ role: 'user', text: userText2 });
        gchat.messages.push({
          role: 'ai',
          text:
            '已记录你的追问' +
            (atts2.length ? '与 ' + atts2.length + ' 个附件' : '') +
            '，并给出结构化要点。',
          cards: [
            {
              type: 'kv',
              title: '下一步',
              rows: [
                ['可做', '打开关联项目 Hub'],
                ['或', '切换尽调场景再跑一轮'],
              ],
            },
          ],
        });
        sessions[arg] = gchat;
        setState({ sessions: sessions });
        _local.chatDraft = '';
        _local.composerMenu = null;
        _local.composerAttachments = [];
        navigate('chat/' + arg);
        return;
      }

      if (name === 'deliverProject') {
        var dp = findProject(arg);
        if (!dp) return;
        dp.status = '投后';
        dp.todo = '投后建档';
        dp.updated = '刚刚';
        if (!dp.postState) {
          dp.postState = {
            round: dp.stage || '本轮',
            amount: '待填',
            valuation: '待填',
            stake: '待填',
            fund: '启明星成长二号',
            timeline: [{ date: '今天', event: '交割确认，进入投后' }],
            proposals: [],
            brief: '交割完成，待上传投后经营包。',
          };
        } else {
          dp.postState.timeline = dp.postState.timeline || [];
          dp.postState.timeline.push({ date: '今天', event: '交割确认，进入投后' });
        }
        toast('已进入投后');
        navigate('post/' + arg);
        return;
      }

      if (name === 'openPostDetail') {
        navigate('post/' + arg);
        return;
      }

      if (name === 'postQuickAction') {
        /* arg = action type, arg2 = projectId */
        var qp = findProject(arg2);
        var qname = qp ? qp.name : '项目';
        if (arg === 'brief') {
          toast('正在为「' + qname + '」生成季度经营简报…');
        } else if (arg === 'valuation') {
          toast('正在为「' + qname + '」启动估值更新分析…');
        } else if (arg === 'news') {
          toast('正在扫描「' + qname + '」舆情与公告…');
        }
        return;
      }

      if (name === 'confirmProposal') {
        var cp = findProject(arg);
        if (!cp || !cp.postState) return;
        var pr = null;
        (cp.postState.proposals || []).forEach(function (x) {
          if (x.id === arg2) pr = x;
        });
        if (!pr || pr.status !== 'pending') return;
        if (pr.field === 'valuation') cp.postState.valuation = pr.newVal;
        if (pr.field === 'stake') cp.postState.stake = pr.newVal;
        if (pr.field === 'amount') cp.postState.amount = pr.newVal;
        pr.status = 'confirmed';
        cp.updated = '刚刚';
        toast('已写入 ' + pr.field + ' = ' + pr.newVal);
        navigate('post/' + arg);
        return;
      }

      if (name === 'rejectProposal') {
        var rp = findProject(arg);
        if (!rp || !rp.postState) return;
        var pr2 = null;
        (rp.postState.proposals || []).forEach(function (x) {
          if (x.id === arg2) pr2 = x;
        });
        if (!pr2) return;
        pr2.status = 'rejected';
        rp.postState.proposals = rp.postState.proposals.filter(function (x) {
          return x.id !== arg2;
        });
        toast('已驳回提案');
        navigate('post/' + arg);
        return;
      }

      if (name === 'runScenario') {
        var sc = null;
        (data.scenarios || []).forEach(function (g) {
          (g.items || []).forEach(function (it) {
            if (it.id === arg || it.name === arg) sc = it;
          });
        });
        var cat = data.scenarioCatalog || {};
        if (!sc && cat.featured && (cat.featured.id === arg || cat.featured.name === arg)) {
          sc = cat.featured;
        }
        if (!sc) {
          (cat.groups || []).forEach(function (g) {
            (g.items || []).forEach(function (it) {
              if (it.id === arg || it.name === arg) sc = it;
            });
          });
        }
        if (!sc) {
          toast('未找到场景');
          return;
        }
        var sid = 'sess-sc-' + (sc.id || arg) + '-' + Date.now();
        var session = {
          id: sid,
          title: '场景 · ' + sc.name,
          projectId: null,
          preview: sc.result && sc.result.text,
          time: '刚刚',
          messages: [
            { role: 'user', text: sc.prompt || '开始场景：' + sc.name },
            {
              role: 'ai',
              text: (sc.result && sc.result.text) || '场景结果已生成',
              cards: (sc.result && sc.result.cards) || [],
            },
          ],
        };
        var st2 = getState();
        var sessions2 = Object.assign({}, st2.sessions || {});
        sessions2[sid] = session;
        (D().chats || []).unshift({
          id: sid,
          title: session.title,
          projectId: null,
          time: '刚刚',
          preview: session.preview,
          messages: session.messages,
        });
        setState({ sessions: sessions2 });
        navigate('chat/' + sid);
        return;
      }

      if (name === 'findOpen') {
        var fp = matchProjectByName(arg);
        if (fp) {
          navigate('project/' + fp.id);
          return;
        }
        var nid = createDiligenceChat('帮我初筛标的：' + arg);
        navigate('chat/' + nid);
        return;
      }

      if (name === 'radarOpen') {
        _local.radarPreviewId = arg;
        _local.radarShowWeekly = false;
        navigate('radar');
        return;
      }
      if (name === 'radarFilter') {
        _local.radarFilter = arg || '全部';
        navigate('radar');
        return;
      }
      if (name === 'radarWeeklySector') {
        var R = D().radar || {};
        R.weekly = R.weekly || {};
        R.weekly.sector = arg;
        navigate('radar');
        return;
      }
      if (name === 'radarRemoveFocus') {
        _local.radarFocus = (_local.radarFocus || []).filter(function (s) {
          return s !== arg;
        });
        if (!_local.radarFocus.length) _local.radarFocus = ['医疗器械'];
        navigate('radar');
        return;
      }
      if (name === 'radarAddFocus') {
        _local.radarFocus = _local.radarFocus || [];
        if (_local.radarFocus.indexOf('先进制造') < 0) _local.radarFocus.push('先进制造');
        toast('已添加关注赛道：先进制造');
        navigate('radar');
        return;
      }
      if (name === 'radarShowWeekly') {
        _local.radarShowWeekly = true;
        _local.radarPreviewId = null;
        navigate('radar');
        return;
      }
      if (name === 'radarClosePreview') {
        _local.radarShowWeekly = false;
        _local.radarPreviewId = null;
        navigate('radar');
        return;
      }
      if (name === 'radarSave') {
        _local.radarSaved = _local.radarSaved || {};
        _local.radarSaved[arg] = !_local.radarSaved[arg];
        var feedItem = null;
        ((D().radar && D().radar.feed) || []).forEach(function (n) {
          if (n.id === arg) feedItem = n;
        });
        var K = D().knowledge || (D().knowledge = {});
        K.savedNews = K.savedNews || [];
        if (_local.radarSaved[arg] && feedItem) {
          var exists = K.savedNews.some(function (x) {
            return x.id === 'sn-' + arg;
          });
          if (!exists) {
            K.savedNews.unshift({
              id: 'sn-' + arg,
              title: feedItem.title,
              source: feedItem.source || '',
              time: '刚刚',
            });
          }
        } else {
          K.savedNews = K.savedNews.filter(function (x) {
            return x.id !== 'sn-' + arg;
          });
        }
        toast(_local.radarSaved[arg] ? '已收藏到资料库' : '已取消收藏');
        navigate('radar');
        return;
      }
      if (name === 'radarInterpret') {
        _local.radarInterpreted = _local.radarInterpreted || {};
        _local.radarInterpreted[arg] =
          '从小星视角：该信息对在管/在看组合的边际影响偏中性偏正。建议交叉核验订单能见度、应收周转与政策落地节奏，再决定是否升级为项目动态预警。';
        navigate('radar');
        return;
      }

      if (name === 'chainView') {
        _local.chainView = arg || 'list';
        navigate('chain');
        return;
      }
      if (name === 'chainNode') {
        _local.chainNodeId = arg;
        _local.chainCompanyId = null;
        navigate('chain');
        return;
      }
      if (name === 'chainCompany') {
        _local.chainCompanyId = arg;
        navigate('chain');
        return;
      }
      if (name === 'chainCloseDrawer') {
        _local.chainCompanyId = null;
        navigate('chain');
        return;
      }

      if (name === 'expertTab') {
        _local.expertTab = arg || 'meetings';
        _local.discoverTab = 'meetings';
        navigate('discover');
        return;
      }

      if (name === 'meetingSector') {
        _local.meetingSector = arg || '全部';
        _local.discoverTab = 'meetings';
        navigate('discover');
        return;
      }

      if (name === 'notesSector') {
        _local.notesSector = arg || '全部';
        _local.expertTab = 'notes';
        _local.discoverTab = 'meetings';
        navigate('discover');
        return;
      }

      if (name === 'enrollMeeting') {
        _local.enrolledIds = _local.enrolledIds || [];
        if (_local.enrolledIds.indexOf(arg) < 0) _local.enrolledIds.push(arg);
        toast('已报名');
        _local.discoverTab = 'meetings';
        navigate('discover');
        return;
      }

      if (name === 'openMeetingNote') {
        var note = null;
        ((window.EXPERT_HUB && window.EXPERT_HUB.notes) || []).forEach(function (n) {
          if (n.id === arg) note = n;
        });
        var draft =
          '请基于会议纪要「' +
          ((note && note.title) || arg) +
          '」原文，提炼可进 IC 的投资要点，并标出待核实项。';
        if (note && note.preview) draft += '\n\n纪要摘要：' + note.preview;
        _local.homeDraft = draft;
        setState({ homeDraft: draft });
        var nid = 'sess-note-' + arg + '-' + Date.now();
        var nSession = {
          id: nid,
          title: (note && note.title) || '会议纪要',
          projectId: null,
          preview: '纪要已带入对话',
          time: '刚刚',
          messages: [
            { role: 'user', text: draft },
            {
              role: 'ai',
              text: '已载入纪要上下文。下面按「可进 IC / 待核实」整理：',
              cards: [
                {
                  type: 'flags',
                  title: '纪要要点',
                  items: [
                    (note && note.preview) || '见原文',
                    '数字未标注来源的，投决前须交叉核验',
                    '可继续追问某一段落或关联到项目',
                  ],
                },
              ],
            },
          ],
        };
        var stN = getState();
        var sessionsN = Object.assign({}, stN.sessions || {});
        sessionsN[nid] = nSession;
        (D().chats || []).unshift({
          id: nid,
          title: nSession.title,
          projectId: null,
          time: '刚刚',
          preview: nSession.preview,
          messages: nSession.messages,
        });
        setState({ sessions: sessionsN });
        navigate('chat/' + nid);
        return;
      }

      if (name === 'bookExpert') {
        var be = null;
        ((hub().bookingExperts || [])).forEach(function (e) {
          if (e.id === arg) be = e;
        });
        _local.contactFlow = {
          kind: 'expert-book',
          id: arg,
          name: (be && be.name) || '专家',
          field: (be && be.field) || '',
        };
        navigate(_route);
        return;
      }

      if (name === 'matchExpert') {
        _local.contactFlow = { kind: 'expert-match' };
        navigate(_route);
        return;
      }

      if (name === 'bookReporter') {
        var re = null;
        ((hub().reporters || [])).forEach(function (r) {
          if (r.id === arg) re = r;
        });
        _local.contactFlow = {
          kind: 'reporter-request',
          id: arg,
          company: '',
          questions: '',
          name: (re && re.name) || '',
        };
        navigate(_route);
        return;
      }

      if (name === 'closeContactFlow') {
        _local.contactFlow = null;
        navigate(_route);
        return;
      }

      if (name === 'submitContactFlow') {
        var topicEl = _ctx.rootEl.querySelector('#peCfTopic');
        var contactEl = _ctx.rootEl.querySelector('#peCfContact');
        var prefEl = _ctx.rootEl.querySelector('#peCfPref');
        var companyEl = _ctx.rootEl.querySelector('#peCfCompany');
        var topic = topicEl ? topicEl.value.trim() : '';
        var contact = contactEl ? contactEl.value.trim() : '';
        if (arg === 'reporter') {
          var company = companyEl ? companyEl.value.trim() : '';
          if (!company || !topic || !contact) {
            toast('请填写标的、问题与联系方式');
            return;
          }
        } else if (!topic || !contact) {
          toast('请填写想了解的问题与联系方式');
          return;
        }
        _local.contactFlow = {
          kind: 'submitted',
          title: arg === 'match' ? '匹配需求已提交' : '预约已提交',
          message:
            '顾问将在 1–3 个工作日内联系你' +
            (contact ? '（' + contact + '）' : '') +
            '。' +
            (prefEl && prefEl.value ? ' 偏好：' + prefEl.value.trim() : ''),
        };
        navigate(_route);
        return;
      }

      if (name === 'graphView') {
        _local.graphView = arg || 'equity';
        navigate('graph');
        return;
      }

      if (name === 'finTab') {
        _local.finTab = arg || 'subjects';
        _local.finConfigMenuOpen = false;
        _local.finBannerMenuOpen = false;
        navigate('finance-config');
        return;
      }

      if (name === 'finPeriodTab') {
        _local.finPeriodTab = arg || 'templates';
        navigate('finance-config');
        return;
      }

      if (name === 'selectPeriodTemplate') {
        _local.activePeriodTemplateId = arg;
        _local.finPeriodTab = 'templates';
        toast('已应用「' + (getActivePeriodTemplate().name || '') + '」期间口径');
        navigate(_route || 'finance-config');
        return;
      }

      if (name === 'togglePeriodRule') {
        var prCfg = getActiveFinanceConfig();
        if (prCfg.scope !== 'user') {
          toast('请先新建我的配置后再编辑');
          return;
        }
        (prCfg.periodRules || []).forEach(function (r) {
          if (r.id === arg) r.enabled = !r.enabled;
        });
        toast('期间规则已更新');
        navigate(_route || 'finance-config');
        return;
      }

      if (name === 'applyPeriodConfig') {
        var pt = getActivePeriodTemplate();
        var tags = _local.finColTags || {};
        var tagged = Object.keys(tags)
          .map(function (k) {
            return tags[k];
          })
          .filter(Boolean);
        toast(
          '已按「' +
            (pt.name || '') +
            '」模板应用：' +
            (pt.derive ? '倒减补缺 · ' : '直取为主 · ') +
            '勾稽校验已执行'
        );
        navigate(_route || 'project/p-xinghe/finance');
        return;
      }

      if (name === 'finStmt') {
        _local.finStmt = arg || 'is';
        _local.finConfigMenuOpen = false;
        _local.finBannerMenuOpen = false;
        navigate('finance-config');
        return;
      }

      if (name === 'marketKind') {
        _local.marketKind = arg || 'experts';
        navigate('skills');
        return;
      }
      if (name === 'marketScope') {
        _local.marketScope = arg || 'official';
        navigate('skills');
        return;
      }
      if (name === 'skillCategory') {
        _local.skillCategory = arg || 'all';
        navigate('skills');
        return;
      }
      if (name === 'toggleSkillInstall') {
        _local.installedSkills = _local.installedSkills || {};
        if (_local.installedSkills[arg]) {
          delete _local.installedSkills[arg];
          toast('已从工作区移除');
        } else {
          _local.installedSkills[arg] = 1;
          toast('已加入工作区');
        }
        navigate('skills');
        return;
      }
      if (name === 'toggleConnectorInstall') {
        _local.installedConnectors = _local.installedConnectors || {};
        if (_local.installedConnectors[arg]) {
          delete _local.installedConnectors[arg];
          toast('已移除连接器');
        } else {
          _local.installedConnectors[arg] = 1;
          toast('已接入连接器');
        }
        navigate('skills');
        return;
      }
      if (name === 'summonExpert') {
        toast('已召唤专家进对话（Demo）');
        navigate('home');
        return;
      }

      if (name === 'tplNav') {
        _local.tplNav = arg || 'org';
        navigate('templates');
        return;
      }

      if (name === 'toast') {
        toast(arg || '已完成');
        return;
      }

      /* ——— 配置中心 CRUD ——— */

      if (name === 'cfgTab') {
        _local.cfgTab = arg || 'subjects';
        _local.cfgModal = null;
        _local.cfgStandard = null;
        _local.cfgSubjStmt = 'is';
        _local.cfgSubjSelected = null;
        _local.cfgDetailSection = 'subjects';
        _local.cfgIndSet = null;
        _local.cfgParseTpl = null;
        navigate('config-center');
        return;
      }

      if (name === 'cfgSelectStandard') {
        _local.cfgStandard = arg;
        _local.cfgSubjStmt = 'is';
        _local.cfgSubjSelected = null;
        _local.cfgDetailSection = 'subjects';
        navigate('config-center');
        return;
      }

      if (name === 'cfgBackToStandards') {
        _local.cfgStandard = null;
        _local.cfgSubjSelected = null;
        _local.cfgDetailSection = 'subjects';
        navigate('config-center');
        return;
      }

      if (name === 'cfgDetailSection') {
        _local.cfgDetailSection = arg || 'subjects';
        navigate('config-center');
        return;
      }

      if (name === 'cfgSelectIndSet') {
        _local.cfgIndSet = arg;
        navigate('config-center');
        return;
      }

      if (name === 'cfgBackToIndSets') {
        _local.cfgIndSet = null;
        navigate('config-center');
        return;
      }

      if (name === 'cfgSelectParseTpl') {
        _local.cfgParseTpl = arg;
        _local.cfgParseTplLayer = 'fundLayer';
        navigate('config-center');
        return;
      }

      if (name === 'cfgParseTplLayer') {
        _local.cfgParseTplLayer = arg || 'fundLayer';
        _local.cfgFieldFilterTab = '';
        _local.cfgFieldFilterModule = '';
        navigate('config-center');
        return;
      }

      if (name === 'cfgFieldFilterClear') {
        _local.cfgFieldFilterTab = '';
        _local.cfgFieldFilterModule = '';
        navigate('config-center');
        return;
      }

      if (name === 'cfgBackToParseTpls') {
        _local.cfgParseTpl = null;
        _local.cfgParseTplLayer = 'fundLayer';
        _local.cfgFieldFilterTab = '';
        _local.cfgFieldFilterModule = '';
        navigate('config-center');
        return;
      }

      if (name === 'cfgSubjStmt') {
        _local.cfgSubjStmt = arg || 'is';
        navigate('config-center');
        return;
      }

      if (name === 'cfgSelectSubject') {
        _local.cfgSubjSelected = arg;
        navigate('config-center');
        return;
      }

      if (name === 'cfgCopyItem') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        var origItem = store.get(arg, arg2);
        if (!origItem) { toast('复制失败：找不到原记录'); return; }
        var copyObj = {};
        Object.keys(origItem).forEach(function (k) { copyObj[k] = origItem[k]; });
        delete copyObj.id;
        copyObj.name    = origItem.name + ' - 副本';
        copyObj.source  = 'custom';
        copyObj.enabled = false;
        store.save(arg, copyObj);
        toast('已复制');
        navigate('config-center');
        return;
      }

      if (name === 'cfgAdd') {
        _local.cfgModal = 'add:' + (arg || 'subjects') + ':';
        navigate('config-center');
        return;
      }

      if (name === 'cfgEdit') {
        _local.cfgModal = 'edit:' + esc(arg) + ':' + esc(arg2);
        navigate('config-center');
        return;
      }

      if (name === 'cfgCloseModal') {
        _local.cfgModal = null;
        navigate('config-center');
        return;
      }

      if (name === 'cfgDelete') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        if (!confirm('确认删除？此操作不可恢复。')) return;
        try {
          store.remove(arg, arg2);
          toast('已删除');
        } catch (e) {
          toast(e.message || '删除失败');
        }
        navigate('config-center');
        return;
      }

      if (name === 'cfgImportSubjects') {
        _local.cfgModal = 'subjimport:' + arg;
        navigate('config-center');
        return;
      }

      if (name === 'cfgFormulaSelect') {
        var tokensSel = cfgReadFormulaTokens();
        var idxSel = parseInt(arg, 10);
        if (isNaN(idxSel) || idxSel < 0 || idxSel >= tokensSel.length) return;
        var curSel = cfgFormulaSelectedIdx();
        cfgRenderFormulaTokens(tokensSel, curSel === idxSel ? -1 : idxSel);
        return;
      }

      if (name === 'cfgFormulaRemove') {
        var tokensRm = cfgReadFormulaTokens();
        var idxRm = cfgFormulaSelectedIdx();
        if (idxRm < 0 || idxRm >= tokensRm.length) return;
        tokensRm.splice(idxRm, 1);
        cfgRenderFormulaTokens(tokensRm, -1);
        return;
      }

      if (name === 'cfgFormulaClear') {
        cfgRenderFormulaTokens([], -1);
        return;
      }

      if (name === 'cfgFormulaChip') {
        if (!document.getElementById('cfgFFormulaBox')) return;
        cfgInsertOrReplaceToken({ type: 'ref', text: arg });
        return;
      }

      if (name === 'cfgFormulaOp') {
        if (!document.getElementById('cfgFFormulaBox')) return;
        cfgInsertOrReplaceToken({ type: 'op', text: cfgNormalizeOp(arg) });
        return;
      }

      if (name === 'cfgAddSubject') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        var stmt_ = _local.cfgSubjStmt || 'is';
        var newS = store.addSubject(arg);
        newS.stmt = stmt_;
        store.saveSubjectField(arg, newS.id, 'stmt', stmt_);
        _local.cfgSubjSelected = newS.id;
        navigate('config-center');
        return;
      }

      if (name === 'cfgCopySubject') {
        var store = window.CFG_CENTER_CRUD;
        if (!store || !store.copySubject) return;
        var copied = store.copySubject(arg, arg2);
        if (!copied) { toast('复制失败'); return; }
        _local.cfgSubjSelected = copied.id;
        toast('已复制');
        navigate('config-center');
        return;
      }

      if (name === 'cfgDeleteSubject') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        if (!confirm('确认删除该科目？')) return;
        store.removeSubject(arg, arg2);
        _local.cfgSubjSelected = null;
        toast('已删除');
        navigate('config-center');
        return;
      }

      if (name === 'cfgToggleEnabled') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        var result = store.toggleEnabled(arg, arg2);
        if (result && result.ok === false) {
          toast(result.message || '无法切换启用状态');
          return;
        }
        if (result && result.switchedOff && result.switchedOff.length) {
          toast('已启用；同类型原启用套已自动停用');
        }
        navigate('config-center');
        return;
      }

      if (name === 'cfgAddCheck') {
        _local.cfgDetailSection = 'checks';
        _local.cfgModal = 'checkadd:' + arg;
        navigate('config-center');
        return;
      }

      if (name === 'cfgEditCheck') {
        _local.cfgDetailSection = 'checks';
        _local.cfgModal = 'checkedit:' + arg + ':' + arg2;
        navigate('config-center');
        return;
      }

      if (name === 'cfgToggleCheck') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        store.toggleCheck(arg, arg2);
        navigate('config-center');
        return;
      }

      if (name === 'cfgDeleteCheck') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        if (!confirm('确认删除该校验规则？')) return;
        store.removeCheck(arg, arg2);
        toast('已删除');
        navigate('config-center');
        return;
      }

      if (name === 'cfgSave') {
        var store = window.CFG_CENTER_CRUD;
        if (!store) return;
        var col  = (document.getElementById('cfgFCol')  || {}).value || '';
        var fid  = (document.getElementById('cfgFId')   || {}).value || '';
        var name_ = ((document.getElementById('cfgFName') || {}).value || '').trim();
        if (!col) { toast('表单状态异常'); return; }
        if (!name_) { toast('请填写名称'); return; }
        if (col === 'subjects-bulk') {
          var bStdId = (document.getElementById('cfgFStd') || {}).value || '';
          var bStmt  = (document.getElementById('cfgFStmt') || {}).value || 'is';
          var raw    = ((document.getElementById('cfgFBulk') || {}).value || '').trim();
          var names  = raw.split(/[\n,，]+/).map(function (n) { return n.trim(); }).filter(Boolean);
          if (!names.length) { toast('请输入至少一个科目名'); return; }
          names.forEach(function (n) {
            var ns = store.addSubject(bStdId);
            store.saveSubjectField(bStdId, ns.id, 'name', n);
            store.saveSubjectField(bStdId, ns.id, 'stmt', bStmt);
          });
          toast('已导入 ' + names.length + ' 个科目');
          _local.cfgModal = null;
          navigate('config-center');
          return;
        }
        if (col === 'checks') {
          var stdId = (document.getElementById('cfgFStd') || {}).value || '';
          var cid = fid;
          if (!cid) { var nc = store.addCheck(stdId); cid = nc.id; }
          store.saveCheckField(stdId, cid, 'name', name_);
          store.saveCheckField(stdId, cid, 'type', (document.getElementById('cfgFType') || {}).value || 'balance');
          store.saveCheckField(stdId, cid, 'stmt', ((document.getElementById('cfgFStmt2') || {}).value || '').trim());
          store.saveCheckField(stdId, cid, 'formula', ((document.getElementById('cfgFFormula') || {}).value || '').trim());
          toast(fid ? '已保存' : '已新增');
          _local.cfgModal = null;
          navigate('config-center');
          return;
        }
        var input = { id: fid || undefined, name: name_, enabled: true };
        if (col === 'standards') {
          input.description = ((document.getElementById('cfgFDesc') || {}).value || '').trim();
        } else if (col === 'indicatorSets') {
          input.description = ((document.getElementById('cfgFDesc')  || {}).value || '').trim();
          input.standardId  = ((document.getElementById('cfgFStdId') || {}).value || '').trim();
          if (!fid) input.source = 'custom';
        } else if (col === 'parseTemplates') {
          input.description = ((document.getElementById('cfgFDesc') || {}).value || '').trim();
          input.objectType  = (document.getElementById('cfgFObjType') || {}).value || 'direct';
          if (!fid) input.source = 'custom';
        } else if (col === 'subjects') {
          input.stmt    = (document.getElementById('cfgFStmt')    || {}).value || 'is';
          input.aliases = ((document.getElementById('cfgFAliases') || {}).value || '').trim();
        } else if (col === 'indicators') {
          input.setId       = (((document.getElementById('cfgFSetId') || {}).value || '').trim()) || (_local.cfgIndSet || '');
          input.category    = ((document.getElementById('cfgFCat')       || {}).value || '').trim();
          input.description = (((document.getElementById('cfgFFormula')  || {}).value) || ((document.getElementById('cfgFDesc') || {}).value) || '').trim();
          input.threshold   = ((document.getElementById('cfgFThreshold') || {}).value || '').trim();
          input.direction   = (document.getElementById('cfgFDir')        || {}).value || 'up';
        } else if (col === 'fields') {
          var fTplForSave = (window.CFG_CENTER_CRUD && window.CFG_CENTER_CRUD.get)
            ? window.CFG_CENTER_CRUD.get('parseTemplates', (document.getElementById('cfgFTplId') || {}).value || _local.cfgParseTpl || '')
            : null;
          var aiOn = !!((document.getElementById('cfgFAiParse') || {}).checked);
          var calcOn = !!((document.getElementById('cfgFCalc') || {}).checked);
          if (aiOn && calcOn) { toast('AI 解析与系统计算不可同时勾选'); return; }
          var srcKind = calcOn ? 'calc' : (aiOn ? 'ai' : 'manual');
          var tabVal = ((document.getElementById('cfgFTab') || {}).value || '').trim();
          var modVal = ((document.getElementById('cfgFModule') || {}).value || '').trim();
          if (!tabVal) { toast('请选择所属 Tab'); return; }
          if (!modVal) { toast('请选择所属模块'); return; }
          var keepLanding = ((document.getElementById('cfgFLandingKeep') || {}).value || '').trim();
          input.landing    = keepLanding || ('FIELD.' + name_);
          input.tab        = tabVal;
          input.module     = modVal;
          input.fieldSource = srcKind;
          input.aiParse    = srcKind === 'ai';
          input.objectType = (fTplForSave && fTplForSave.objectType) || 'direct';
          input.sourceType = srcKind === 'ai' ? window.qmxNormalizeCommaList((document.getElementById('cfgFSource')  || {}).value || '') : '';
          input.aliases    = srcKind === 'ai' ? window.qmxNormalizeCommaList((document.getElementById('cfgFAliases') || {}).value || '') : '';
          input.updateMode = srcKind === 'ai' ? ((document.getElementById('cfgFMode') || {}).value || 'always') : 'always';
          input.formulaTemplateId = srcKind === 'calc' ? ((document.getElementById('cfgFFormulaTpl') || {}).value || '').trim() : '';
          input.formula = '';
          input.formulaTemplateName = '';
          if (srcKind === 'calc') {
            if (!input.formulaTemplateId) { toast('系统计算须选用指标配置中的公式模板'); return; }
            if (store.get) {
              var ft = store.get('indicators', input.formulaTemplateId);
              if (!ft) { toast('所选公式模板不存在'); return; }
              input.formulaTemplateName = ft.name || '';
              input.formula = ft.description || '';
            }
          }
          input.templateId = (document.getElementById('cfgFTplId') || {}).value || _local.cfgParseTpl || '';
          if (input.objectType === 'subFund') {
            var layerKeep = ((document.getElementById('cfgFLayerHint') || {}).value || '').trim();
            input.layer = layerKeep || _local.cfgParseTplLayer || 'fundLayer';
            input.group = input.layer === 'lookthrough' ? '底层→穿透' : modVal;
          } else {
            input.group = modVal;
          }
        }
        if (!input.id) delete input.id;
        try {
          store.save(col, input);
          toast(fid ? '已保存' : '已新增');
          _local.cfgModal = null;
        } catch (e) {
          toast(e.message || '保存失败');
        }
        navigate('config-center');
        return;
      }

      if (name === 'openJrForm') {
        _local.jrFormOpen = true;
        _local.discoverTab = 'field';
        navigate('discover');
        return;
      }

      if (name === 'closeJrForm') {
        _local.jrFormOpen = false;
        _local.discoverTab = 'field';
        navigate('discover');
        return;
      }

      if (name === 'openJournalistReport') {
        _local.journalistView = 'report';
        _local.discoverTab = 'field';
        navigate('discover');
        return;
      }

      if (name === 'journalistBack') {
        _local.journalistView = 'list';
        _local.discoverTab = 'field';
        navigate('discover');
        return;
      }

      if (name === 'submitJournalist') {
        var jc = _ctx.rootEl.querySelector('#peJCompany');
        var jcontact = _ctx.rootEl.querySelector('#peJContact');
        var jfocus = _ctx.rootEl.querySelector('#peJFocus');
        var company = (jc && jc.value.trim()) || '';
        if (!company) {
          toast('请填写企业全称');
          return;
        }
        _local.jrRequests = _local.jrRequests || (hub().journalist && hub().journalist.requests) || [];
        _local.jrRequests.unshift({
          id: 'jr-' + Date.now(),
          company: company,
          questions: (jfocus && jfocus.value.trim()) || '综合核实',
          status: '等待匹配调研团队',
          submittedAt: '刚刚',
          contact: (jcontact && jcontact.value.trim()) || '',
        });
        _local.jrFormOpen = false;
        toast('调研诉求已提交');
        _local.discoverTab = 'field';
        navigate('discover');
        return;
      }

      if (name === 'useTemplate') {
        var tpl = null;
        (data.templates || []).forEach(function (t) {
          if (t.id === arg) tpl = t;
        });
        if (!tpl) return;
        var target = findProject('p-xinghe') || (data.projects || [])[0];
        if (!target) return;
        toast('已将「' + tpl.name + '」关联到 ' + target.name);
        navigate('project/' + target.id + '/report');
        return;
      }

      if (name === 'cloneFinanceConfig') {
        var created = cloneActiveFinanceConfig();
        toast('已创建「' + created.name + '」');
        navigate(
          _route.indexOf('finance') >= 0 && _route.indexOf('finance-config') < 0
            ? _route
            : 'finance-config'
        );
        return;
      }

      if (name === 'selectFinanceConfig') {
        if (!findFinanceConfig(arg)) return;
        _local.activeFinanceConfigId = arg;
        _local.finConfigMenuOpen = false;
        _local.finBannerMenuOpen = false;
        _local.finRenameOpen = false;
        _local.finEditSubjectId = null;
        toast('已切换配置');
        navigate(_route || 'finance-config');
        return;
      }

      if (name === 'toggleFinConfigMenu') {
        _local.finConfigMenuOpen = !_local.finConfigMenuOpen;
        _local.finBannerMenuOpen = false;
        navigate('finance-config');
        return;
      }

      if (name === 'toggleFinBannerMenu') {
        _local.finBannerMenuOpen = !_local.finBannerMenuOpen;
        _local.finConfigMenuOpen = false;
        navigate(_route || 'finance-config');
        return;
      }

      if (name === 'openFinanceConfigPage') {
        _local.finBannerMenuOpen = false;
        _local.finConfigMenuOpen = false;
        navigate('finance-config');
        return;
      }

      if (name === 'startFinRename') {
        var renCfg = getActiveFinanceConfig();
        if (renCfg.scope !== 'user') return;
        _local.finRenameOpen = true;
        _local.finRenameVal = renCfg.name;
        navigate('finance-config');
        return;
      }

      if (name === 'cancelFinRename') {
        _local.finRenameOpen = false;
        _local.finRenameVal = '';
        navigate('finance-config');
        return;
      }

      if (name === 'confirmFinRename') {
        var renameTarget = getActiveFinanceConfig();
        if (renameTarget.scope !== 'user') return;
        var renameEl = _ctx.rootEl.querySelector('#peFinRename');
        var newName = renameEl && renameEl.value.trim();
        if (!newName) {
          toast('名称不能为空');
          return;
        }
        renameTarget.name = newName;
        _local.finRenameOpen = false;
        _local.finRenameVal = '';
        toast('已重命名');
        navigate('finance-config');
        return;
      }

      if (name === 'deleteFinanceConfig') {
        var delCfg = getActiveFinanceConfig();
        if (delCfg.scope !== 'user') {
          toast('平台模板不可删除');
          return;
        }
        if (!window.confirm('确定删除「' + delCfg.name + '」？')) return;
        _local.financeConfigs = ensureFinanceConfigs().filter(function (c) {
          return c.id !== delCfg.id;
        });
        if (!_local.financeConfigs.length) {
          _local.financeConfigs = [buildPlatformFinanceSeed()];
        }
        _local.activeFinanceConfigId = 'platform-standard';
        if (!findFinanceConfig('platform-standard')) {
          _local.activeFinanceConfigId = _local.financeConfigs[0].id;
        }
        _local.finRenameOpen = false;
        _local.finEditSubjectId = null;
        _local.finConfigMenuOpen = false;
        _local.finBannerMenuOpen = false;
        toast('已删除，已切回平台模板');
        navigate('finance-config');
        return;
      }

      if (name === 'editSubjectAlias') {
        if (getActiveFinanceConfig().scope !== 'user') return;
        _local.finEditSubjectId = arg;
        navigate('finance-config');
        return;
      }

      if (name === 'cancelSubjectAlias') {
        _local.finEditSubjectId = null;
        navigate('finance-config');
        return;
      }

      if (name === 'saveSubjectAlias') {
        var aliasCfg = getActiveFinanceConfig();
        if (aliasCfg.scope !== 'user') return;
        var aliasEl = _ctx.rootEl.querySelector('#peFinAlias');
        var aliasVal = aliasEl ? aliasEl.value.trim() : '';
        (aliasCfg.subjects || []).forEach(function (s) {
          if (s.id === arg) s.aliases = aliasVal;
        });
        _local.finEditSubjectId = null;
        toast('别名已保存');
        navigate('finance-config');
        return;
      }

      if (name === 'toggleMetric') {
        var metricCfg = getActiveFinanceConfig();
        if (metricCfg.scope !== 'user') {
          toast('请先新建我的配置后再编辑');
          return;
        }
        (metricCfg.metrics || []).forEach(function (m) {
          if (m.id === arg) m.on = !m.on;
        });
        toast('指标已更新');
        navigate('finance-config');
        return;
      }

      if (name === 'toggleRule') {
        var ruleCfg = getActiveFinanceConfig();
        if (ruleCfg.scope !== 'user') {
          toast('请先新建我的配置后再编辑');
          return;
        }
        (ruleCfg.rules || []).forEach(function (r) {
          if (r.id === arg) {
            var n = normalizeFinanceRule(r);
            r.enabled = !n.enabled;
            r.on = r.enabled;
            r.expr = n.expr;
            r.severity = n.severity;
            r.msg = n.msg;
          }
        });
        toast('规则已更新');
        navigate('finance-config');
        return;
      }

      if (name === 'addFinanceSubject') {
        var addSubCfg = getActiveFinanceConfig();
        if (addSubCfg.scope !== 'user') return;
        var sid = 's-new-' + Date.now();
        addSubCfg.subjects = addSubCfg.subjects || [];
        addSubCfg.subjects.unshift({
          id: sid,
          name: '新科目',
          aliases: '',
          stmt: _local.finStmt || 'is',
        });
        toast('已新增科目');
        navigate('finance-config');
        return;
      }

      if (name === 'deleteFinanceSubject') {
        var delSubCfg = getActiveFinanceConfig();
        if (delSubCfg.scope !== 'user') return;
        var delSub = (delSubCfg.subjects || []).filter(function (s) {
          return s.id === arg;
        })[0];
        if (!delSub) return;
        if (!window.confirm('确认删除「' + delSub.name + '」？相关指标如引用该科目需自行调整。')) return;
        delSubCfg.subjects = (delSubCfg.subjects || []).filter(function (s) {
          return s.id !== arg;
        });
        toast('已删除科目');
        navigate('finance-config');
        return;
      }

      if (name === 'addFinanceMetric') {
        var addMetCfg = getActiveFinanceConfig();
        if (addMetCfg.scope !== 'user') return;
        addMetCfg.metrics = addMetCfg.metrics || [];
        addMetCfg.metrics.unshift({
          id: 'm-new-' + Date.now(),
          name: '新指标',
          formula: '',
          unit: '',
          desc: '',
        });
        toast('已新增指标');
        _local.finTab = 'metrics';
        navigate('finance-config');
        return;
      }

      if (name === 'deleteFinanceMetric') {
        var delMetCfg = getActiveFinanceConfig();
        if (delMetCfg.scope !== 'user') return;
        var delMet = (delMetCfg.metrics || []).filter(function (m) {
          return m.id === arg;
        })[0];
        if (!delMet) return;
        if (!window.confirm('确认删除「' + delMet.name + '」？')) return;
        delMetCfg.metrics = (delMetCfg.metrics || []).filter(function (m) {
          return m.id !== arg;
        });
        toast('已删除指标');
        navigate('finance-config');
        return;
      }

      if (name === 'addFinanceRule') {
        var addRuleCfg = getActiveFinanceConfig();
        if (addRuleCfg.scope !== 'user') return;
        addRuleCfg.rules = addRuleCfg.rules || [];
        addRuleCfg.rules.unshift({
          id: 'r-new-' + Date.now(),
          name: '新规则',
          expr: '毛利率 < 15%',
          severity: 'warning',
          msg: '自定义预警说明',
          enabled: true,
        });
        toast('已新增规则');
        _local.finTab = 'rules';
        navigate('finance-config');
        return;
      }

      if (name === 'deleteFinanceRule') {
        var delRuleCfg = getActiveFinanceConfig();
        if (delRuleCfg.scope !== 'user') return;
        var delRule = (delRuleCfg.rules || []).filter(function (r) {
          return r.id === arg;
        })[0];
        if (!delRule) return;
        if (!window.confirm('确认删除「' + delRule.name + '」？')) return;
        delRuleCfg.rules = (delRuleCfg.rules || []).filter(function (r) {
          return r.id !== arg;
        });
        toast('已删除规则');
        navigate('finance-config');
        return;
      }

      if (name === 'downloadSubjectSample') {
        toast('已下载科目表示例（demo_subjects.csv）');
        return;
      }

      if (name === 'importFinanceSubjects') {
        var impCfg = getActiveFinanceConfig();
        if (impCfg.scope !== 'user') {
          toast('请先新建我的配置');
          return;
        }
        var imported = [
          { id: 'imp-rev', name: '营业收入', aliases: '主营业务收入 · Revenue', stmt: 'is' },
          { id: 'imp-cogs', name: '营业成本', aliases: '主营业务成本', stmt: 'is' },
          { id: 'imp-gp', name: '毛利', aliases: '毛利润', stmt: 'is' },
          { id: 'imp-ar', name: '应收账款', aliases: '应收款项', stmt: 'bs' },
          { id: 'imp-cash', name: '货币资金', aliases: '银行存款', stmt: 'bs' },
          { id: 'imp-ocf', name: '经营活动现金流净额', aliases: '经营净现金流', stmt: 'cf' },
        ];
        impCfg.subjects = imported;
        _local.finStmt = 'is';
        toast('已导入科目表（覆盖当前科目库）');
        navigate('finance-config');
        return;
      }

      if (name === 'saveSubjectField') {
        return;
      }

      if (name === 'selectTpl') {
        _local.tplId = arg;
        navigate('templates');
        return;
      }

      if (name === 'toggleTplChapter') {
        var tpl = null;
        (data.templates || []).forEach(function (t) {
          if (t.id === arg) tpl = t;
        });
        if (!tpl) return;
        if (!tpl.chapterList) {
          tpl.chapterList = [
            { title: '投资摘要', on: true },
            { title: '公司概况', on: true },
            { title: '业务与市场', on: true },
            { title: '财务质量', on: true },
            { title: '风险与红旗', on: true },
            { title: '估值与回报', on: true },
            { title: '投决建议骨架', on: false },
          ];
        }
        var ci = parseInt(arg2, 10);
        if (tpl.chapterList[ci]) {
          tpl.chapterList[ci].on = !tpl.chapterList[ci].on;
          toast((tpl.chapterList[ci].on ? '已启用' : '已关闭') + '：' + tpl.chapterList[ci].title);
        }
        _local.tplId = tpl.id;
        navigate('templates');
        return;
      }

      if (name === 'toggleMap') {
        var maps = _local.subjectMaps || [];
        var mi = parseInt(arg, 10);
        if (maps[mi]) {
          maps[mi].on = !maps[mi].on;
          _local.subjectMaps = maps;
          toast(maps[mi].on ? '映射已启用' : '映射已停用');
        }
        navigate('finance-config');
        return;
      }

      if (name === 'installSkill') {
        (data.skills || []).forEach(function (s) {
          if (s.id === arg) s.status = '已安装';
        });
        toast('已安装');
        navigate('skills');
        return;
      }

      if (name === 'runSkill') {
        var skill = null;
        (data.skills || []).forEach(function (s) {
          if (s.id === arg) skill = s;
        });
        if (!skill) return;
        var scid = 'sess-skill-' + arg + '-' + Date.now();
        var skSession = {
          id: scid,
          title: '技能 · ' + skill.name,
          projectId: null,
          preview: '已运行 ' + skill.name,
          time: '刚刚',
          messages: [
            { role: 'user', text: '运行技能：' + skill.name },
            {
              role: 'ai',
              text: '技能「' + skill.name + '」已执行。',
              cards: [
                {
                  type: 'flags',
                  title: skill.name,
                  items: [skill.desc, '结果已写入当前会话，可继续追问或打开项目'],
                },
              ],
            },
          ],
        };
        var st3 = getState();
        var sessions3 = Object.assign({}, st3.sessions || {});
        sessions3[scid] = skSession;
        (D().chats || []).unshift({
          id: scid,
          title: skSession.title,
          projectId: null,
          time: '刚刚',
          preview: skSession.preview,
          messages: skSession.messages,
        });
        setState({ sessions: sessions3 });
        navigate('chat/' + scid);
        return;
      }

      if (name === 'saveSettings') {
        var nameInput = _ctx.rootEl.querySelector('#peSettingsName');
        var newName = (nameInput && nameInput.value.trim()) || '王敏';
        _local.settingsName = newName;
        if (data.settings) data.settings.displayName = newName;
        setState({ displayName: newName });
        toast('显示名称已保存');
        navigate('settings');
        return;
      }

      if (name === 'switchMode') {
        var mode = arg === 'bank' ? 'bank' : 'pe';
        if (data.settings) data.settings.mode = mode;
        setState({ mode: mode });
        toast(mode === 'bank' ? '已切换到银行版' : '已切换到 PE 版');
        navigate('home');
        return;
      }

      if (name === 'switchPeRole') {
        var nextPeRole = arg === 'post' ? 'post' : 'investment';
        setState({ peRole: nextPeRole });
        toast(nextPeRole === 'post' ? '已切换为演示·首页投后向' : '已切换为演示·首页投资向');
        navigate('home');
        return;
      }

      if (name === 'openGlobalChat') {
        var g = resolveChatById(arg);
        if (g && g.projectId) {
          var pc = findProjectChat(g.projectId, g.title, g.projectChatId);
          if (pc) {
            navigate('project/' + g.projectId + '/chat/' + pc.id);
            return;
          }
          navigate('project/' + g.projectId);
          return;
        }
        navigate('chat/' + (g ? g.id : arg));
        return;
      }

      if (name === 'openCreateProject') {
        _local.createProjectOpen = true;
        navigate('projects');
        return;
      }
      if (name === 'closeCreateProject') {
        _local.createProjectOpen = false;
        navigate('projects');
        return;
      }
      if (name === 'submitCreateProject') {
        var coEl = _ctx.rootEl.querySelector('#peNewCompany');
        var nmEl = _ctx.rootEl.querySelector('#peNewProjName');
        var company = (coEl && coEl.value.trim()) || '';
        if (!company) {
          toast('请填写企业全称');
          return;
        }
        var pname = (nmEl && nmEl.value.trim()) || company.replace(/有限公司|股份有限公司/g, '') + ' · 尽调';
        var nid = 'p-new-' + Date.now();
        var np = {
          id: nid,
          name: pname,
          company: company,
          creditCode: '—',
          status: '尽调',
          todo: '补齐材料清单',
          updated: '刚刚',
          owner: '王敏',
          sector: '待标注',
          profile: { summary: '新建项目，待拉取工商公开面。', legalRep: '—', regCapital: '—', founded: '—' },
          materials: [],
          chats: [],
          gaps: ['工商照面', '股权穿透', '近三年审计'],
          fileTree: JSON.parse(JSON.stringify(D().defaultFileTree || [])),
          aiOutputs: [],
        };
        (D().projects || []).unshift(np);
        _local.createProjectOpen = false;
        var cid = 'c-new-' + Date.now();
        np.chats = [
          {
            id: cid,
            title: '新建会话',
            preview: '刚刚',
            messages: [
              {
                role: 'ai',
                text: '项目「' + pname + '」已建档。可上传材料，或直接提问开始尽调。',
              },
            ],
          },
        ];
        toast('已创建项目，进入新会话');
        navigate('project/' + nid + '/chat/' + cid);
        return;
      }

      if (name === 'discoverTab') {
        _local.discoverTab = arg === 'meetings' || arg === 'field' ? arg : 'leads';
        navigate('discover');
        return;
      }

      if (name === 'intelligenceTab') {
        _local.intelligenceTab = arg;
        _local.discoverTab = 'leads';
        navigate('discover');
        return;
      }

      if (name === 'monitorTab') {
        _local.monitorTab = arg;
        navigate('monitor');
        return;
      }
      if (name === 'monitorCompany') {
        _local.monitorCompany = arg;
        navigate('monitor');
        return;
      }
      if (name === 'newMonitorRule' || name === 'editMonitorRule') {
        toast(name === 'newMonitorRule' ? 'Demo：新建预警条件（弹窗对齐真产品）' : 'Demo：编辑预警条件');
        return;
      }
      if (name === 'deleteMonitorRule') {
        D().monitorRules = (D().monitorRules || []).filter(function (r) {
          return r.id !== arg;
        });
        toast('已删除条件');
        navigate('monitor');
        return;
      }

      if (name === 'knowledgePane') {
        _local.knowledgePane = arg;
        _local.kbMenuId = null;
        navigate('knowledge');
        return;
      }
      if (name === 'openCreateKb') {
        _local.kbCreateOpen = true;
        navigate('knowledge');
        return;
      }
      if (name === 'closeCreateKb') {
        _local.kbCreateOpen = false;
        navigate('knowledge');
        return;
      }
      if (name === 'kbMenu') {
        _local.kbMenuId = _local.kbMenuId === arg ? null : arg;
        navigate('knowledge');
        return;
      }
      if (name === 'deleteKb') {
        D().knowledge = D().knowledge || {};
        D().knowledge.kbs = (D().knowledge.kbs || []).filter(function (k) {
          return k.id !== arg;
        });
        D().knowledge.docs = (D().knowledge.docs || []).filter(function (d) {
          return d.kbId !== arg;
        });
        _local.kbMenuId = null;
        if (_local.knowledgePane === arg) {
          _local.knowledgePane = (D().knowledge.kbs[0] && D().knowledge.kbs[0].id) || 'empty';
        }
        toast('已删除资料库');
        navigate('knowledge');
        return;
      }
      if (name === 'submitCreateKb' || name === 'createKb') {
        var nameEl = _ctx.rootEl && _ctx.rootEl.querySelector('#peKbName');
        var descEl = _ctx.rootEl && _ctx.rootEl.querySelector('#peKbDesc');
        var nm = (nameEl && nameEl.value && nameEl.value.trim()) || '';
        var ds = (descEl && descEl.value && descEl.value.trim()) || '';
        var kid = 'kb-' + Date.now();
        D().knowledge = D().knowledge || {};
        D().knowledge.kbs = D().knowledge.kbs || [];
        if (!nm) {
          var demo = (D().knowledge.demoKbs || [])[D().knowledge.kbs.length];
          nm = demo ? demo.name : '新建资料库';
          ds = demo ? demo.desc : '新建知识库';
        }
        D().knowledge.kbs.push({ id: kid, name: nm, docs: 0, desc: ds || '新建知识库' });
        _local.kbCreateOpen = false;
        _local.knowledgePane = kid;
        toast('已创建资料库');
        navigate('knowledge');
        return;
      }
      if (name === 'uploadKbDoc') {
        var upKb = _local.knowledgePane;
        D().knowledge = D().knowledge || {};
        D().knowledge.docs = D().knowledge.docs || [];
        D().knowledge.docs.unshift({
          name: '新上传材料_' + (D().knowledge.docs.length + 1) + '.pdf',
          status: '解析中',
          time: '刚刚',
          kbId: upKb,
        });
        var targetKb = (D().knowledge.kbs || []).filter(function (k) {
          return k.id === upKb;
        })[0];
        if (targetKb) targetKb.docs = (targetKb.docs || 0) + 1;
        toast('已上传文档（解析中）');
        navigate('knowledge');
        return;
      }

      if (name === 'toggleFolder') {
        _local.openFolder = _local.openFolder === arg ? '' : arg;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'toggleFilesPane') {
        _local.filesOpen = !_local.filesOpen;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'toggleRightPane') {
        if (_local.rightPaneKind === arg && !_local.rightPane) {
          _local.rightPaneKind = null;
        } else {
          _local.rightPaneKind = arg;
          _local.rightPane = null;
        }
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'openAiOutput') {
        var proj = findProject(arg2);
        var found = null;
        ((proj && proj.aiOutputs) || D().defaultAiOutputs || []).forEach(function (o) {
          if (o.id === arg) found = o;
        });
        _local.aiMenuOpen = false;
        _local.rightPaneKind = 'ai';
        _local.rightPane = found;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'toggleAiMenu') {
        _local.aiMenuOpen = !_local.aiMenuOpen;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'closeRightPane') {
        _local.rightPaneKind = null;
        _local.rightPane = null;
        _local.reportData = null;
        _local.evidencePanelTab = 'source';
        _local.evidenceCitationData = null;
        _local.aiMenuOpen = false;
        if (window.DemoOcrChrome) window.DemoOcrChrome.exitFullscreen();
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'openReportPane') {
        var rptId = arg;
        var rptData = ((window.PE_DATA || {}).reports || {})[rptId] || null;
        _local.rightPaneKind = 'report';
        _local.reportData = rptData;
        _local.evidencePanelTab = 'source';
        _local.evidenceCitationData = null;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'openSourceCitation') {
        var citId = arg;
        var curRpt = _local.reportData || {};
        var citFound = null;
        (curRpt.sources || []).forEach(function (s) {
          if (String(s.id) === String(citId)) citFound = s;
        });
        _local.evidencePanelTab = 'source';
        _local.evidenceCitationData = citFound;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'switchEvidenceTab') {
        _local.evidencePanelTab = arg;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'aiTab') {
        _local.aiMenuOpen = false;
        if (arg === 'ocr') {
          _local.rightPaneKind = 'ocr';
          _local.rightPane = null;
        } else if (arg === 'other') {
          _local.rightPaneKind = 'other';
          _local.rightPane = null;
        } else {
          var tabPid = (_route.match(/^project\/([^/]+)/) || [])[1];
          var tabProj = tabPid ? findProject(tabPid) : null;
          var tabOuts =
            (tabProj && tabProj.aiOutputs) || D().defaultAiOutputs || [];
          _local.rightPaneKind = 'ai';
          _local.rightPane = tabOuts[0] || null;
        }
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'openOcrPane') {
        _local.aiMenuOpen = false;
        _local.rightPaneKind = 'ocr';
        _local.rightPane = null;
        navigate('project/' + arg + '/ocr');
        return;
      }
      if (name === 'ocrSheet') {
        _local.ocrSheet = arg;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'ocrDataTab') {
        _local.ocrDataTab = arg;
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'ocrLoc') {
        _local.ocrHi = arg;
        toast('已定位：' + arg);
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'ocrRerun') {
        toast('已重新跑 OCR（示意）');
        return;
      }
      if (name === 'ocrConfirm') {
        _local.ocrConfirmed = true;
        toast('OCR 已确认');
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'openFilePreview') {
        var isFin =
          /审计|财报|报表|OCR|ocr/i.test(arg2 || '') || arg === 'f1';
        if (isFin) {
          _local.rightPaneKind = 'ocr';
          _local.rightPane = null;
          _local.openFolder = '财务';
        } else {
          _local.rightPaneKind = 'file';
          _local.rightPane = { id: arg, name: arg2 };
        }
        PEPages.render(_route, _ctx);
        return;
      }
      if (name === 'insertFileRef') {
        toast('已插入材料引用到对话');
        return;
      }
      if (name === 'inviteHint') {
        _local.inviteOpen = true;
        navigate(_route);
        return;
      }
      if (name === 'closeInvite') {
        _local.inviteOpen = false;
        navigate(_route);
        return;
      }
      if (name === 'submitInvite') {
        var inviteEl = _ctx.rootEl && _ctx.rootEl.querySelector('#peInviteEmail');
        var email = inviteEl && inviteEl.value.trim();
        if (!email) {
          toast('请填写同事邮箱或飞书名');
          return;
        }
        var invitePid = arg || (_route.match(/^project\/([^/]+)/) || [])[1];
        var invitePj = invitePid && findProject(invitePid);
        if (invitePj) {
          invitePj.members = invitePj.members || [];
          invitePj.members.push({ name: email, role: '协作', time: '刚刚' });
        }
        _local.inviteOpen = false;
        toast('已邀请「' + email + '」');
        navigate(_route);
        return;
      }
      if (name === 'connectorHint') {
        _local.composerToolsOpen = true;
        _local.composerMenu = 'mcp';
        rerenderComposer();
        toast('已打开连接器');
        return;
      }
      if (name === 'toggleHomePlusMenu') {
        _local.homePlusMenuOpen = !_local.homePlusMenuOpen;
        navigate('home');
        return;
      }
      if (name === 'closeHomePlusMenu') {
        _local.homePlusMenuOpen = false;
        navigate('home');
        return;
      }
      if (name === 'homeOpenMarket') {
        _local.homePlusMenuOpen = false;
        var kind = arg === 'skills' ? 'skills' : arg === 'connectors' ? 'connectors' : 'experts';
        _local.marketKind = kind;
        _local.marketScope = 'official';
        navigate('skills');
        toast(
          kind === 'skills'
            ? '已打开能力市场 · 技能'
            : kind === 'connectors'
              ? '已打开能力市场 · 连接器'
              : '已打开能力市场 · 专家'
        );
        return;
      }
      if (name === 'toggleComposerTools') {
        _local.composerToolsOpen = !_local.composerToolsOpen;
        if (!_local.composerToolsOpen) _local.composerMenu = null;
        rerenderComposer();
        return;
      }
      if (name === 'removeComposerAttach') {
        var ai = parseInt(arg, 10);
        _local.composerAttachments = (_local.composerAttachments || []).filter(function (_n, i) {
          return i !== ai;
        });
        rerenderComposer();
        return;
      }
      if (name === 'toggleComposerMenu') {
        if (!_local.composerToolsOpen) _local.composerToolsOpen = true;
        _local.composerMenu = _local.composerMenu === arg ? null : arg;
        rerenderComposer();
        return;
      }
      if (name === 'closeComposerMenu') {
        _local.composerMenu = null;
        rerenderComposer();
        return;
      }
      if (name === 'toggleComposerBattle') {
        _local.composerBattleMode = !_local.composerBattleMode;
        if (_local.composerBattleMode) {
          _local.composerExpertIds = [];
          _local.composerBattleSide = 'red';
        } else {
          _local.composerBattleRed = [];
          _local.composerBattleBlue = [];
        }
        rerenderComposer();
        return;
      }
      if (name === 'setBattleSide') {
        _local.composerBattleSide = arg === 'blue' ? 'blue' : 'red';
        rerenderComposer();
        return;
      }
      if (name === 'selectComposerExpert') {
        if (_local.composerBattleMode) {
          var sideKey = _local.composerBattleSide === 'blue' ? 'composerBattleBlue' : 'composerBattleRed';
          var arr = (_local[sideKey] || []).slice();
          var ii = arr.indexOf(arg);
          if (ii >= 0) arr.splice(ii, 1);
          else if (arr.length < 3) arr.push(arg);
          else {
            toast('每方最多 3 位专家');
            return;
          }
          _local[sideKey] = arr;
        } else {
          var cur = _local.composerExpertIds || [];
          if (cur.length === 1 && cur[0] === arg) _local.composerExpertIds = [];
          else _local.composerExpertIds = [arg];
        }
        rerenderComposer();
        return;
      }
      if (name === 'removeBattleExpert') {
        var key = arg === 'blue' ? 'composerBattleBlue' : 'composerBattleRed';
        _local[key] = (_local[key] || []).filter(function (id) {
          return id !== arg2;
        });
        rerenderComposer();
        return;
      }
      if (name === 'clearComposerExperts') {
        _local.composerExpertIds = [];
        _local.composerBattleRed = [];
        _local.composerBattleBlue = [];
        rerenderComposer();
        return;
      }
      if (name === 'toggleComposerSkill' || name === 'toggleComposerCite' || name === 'toggleComposerMcp') {
        var field =
          name === 'toggleComposerSkill' ? 'composerSkillIds' : name === 'toggleComposerCite' ? 'composerCiteIds' : 'composerMcpIds';
        var list = (_local[field] || []).slice();
        var at = list.indexOf(arg);
        if (at >= 0) list.splice(at, 1);
        else list.push(arg);
        _local[field] = list;
        rerenderComposer();
        return;
      }
      if (name === 'newProjectSession') {
        var pj = findProject(arg);
        if (!pj) return;
        var cid = createBlankChatSession({
          projectId: arg,
          title: pj.name + ' · 新建会话',
          welcome: '新会话已创建。可上传材料或直接提问。',
        });
        toast('已新建会话');
        navigate('project/' + arg + '/chat/' + cid);
        return;
      }
      if (name === 'newStandaloneSession') {
        var from = arg ? resolveChatById(arg) : null;
        var blankId = createBlankChatSession({
          projectId: from && from.projectId ? from.projectId : null,
          title: from && from.projectId ? '新建会话' : '新建会话',
        });
        toast('已新建会话');
        if (from && from.projectId) {
          navigate('project/' + from.projectId + '/chat/' + blankId);
        } else {
          navigate('chat/' + blankId);
        }
        return;
      }
      if (name === 'startChainDiligence') {
        var q = arg || '产业链标的';
        var newId = createDiligenceChat('对「' + q + '」发起尽调');
        toast('已发起尽调会话');
        navigate('chat/' + newId);
        return;
      }
      if (name === 'refreshRadarInterests') {
        var radar = D().radar || {};
        if (radar.interests && radar.interests.length > 1) {
          radar.interests.push(radar.interests.shift());
        }
        toast('已刷新推荐');
        navigate('radar');
        return;
      }
      if (name === 'openRadarInterest') {
        var Rdata = D().radar || {};
        var hit = null;
        (Rdata.interests || []).forEach(function (it) {
          if (it.id === arg) hit = it;
        });
        if (!hit) return;
        var feedMatch = null;
        (Rdata.feed || []).forEach(function (n) {
          if (!feedMatch && (n.title === hit.title || (n.title && hit.title && n.title.indexOf(hit.title.slice(0, 8)) >= 0))) {
            feedMatch = n;
          }
        });
        if (feedMatch) {
          _local.radarPreviewId = feedMatch.id;
        } else {
          Rdata.feed = Rdata.feed || [];
          var synthId = 'interest-' + hit.id;
          var exists = Rdata.feed.some(function (n) {
            return n.id === synthId;
          });
          if (!exists) {
            Rdata.feed.unshift({
              id: synthId,
              sector: hit.tag || '关注',
              title: hit.title,
              source: '兴趣推荐',
              time: hit.time || '刚刚',
              summary: hit.reason || '',
              fullText: (hit.reason || '') + '\n\n来自「你可能感兴趣」推荐，可收藏或让小星解读。',
            });
          }
          _local.radarPreviewId = synthId;
        }
        navigate('radar');
        return;
      }
      if (name === 'bindGraphKb') {
        _local.graphBoundKbId = _local.graphBoundKbId === arg ? null : arg;
        var boundKb = null;
        (((D().knowledge || {}).kbs) || []).forEach(function (k) {
          if (k.id === arg) boundKb = k;
        });
        toast(_local.graphBoundKbId ? '已绑定「' + (boundKb && boundKb.name) + '」' : '已取消绑定');
        navigate('graph');
        return;
      }
      if (name === 'openEditKb') {
        _local.kbEditId = arg;
        _local.kbMenuId = null;
        _local.kbCreateOpen = false;
        navigate('knowledge');
        return;
      }
      if (name === 'closeEditKb') {
        _local.kbEditId = null;
        navigate('knowledge');
        return;
      }
      if (name === 'submitEditKb') {
        var editTarget = null;
        ((D().knowledge && D().knowledge.kbs) || []).forEach(function (k) {
          if (k.id === _local.kbEditId) editTarget = k;
        });
        if (!editTarget) return;
        var en = _ctx.rootEl && _ctx.rootEl.querySelector('#peKbName');
        var ed = _ctx.rootEl && _ctx.rootEl.querySelector('#peKbDesc');
        var ename = en && en.value.trim();
        if (!ename) {
          toast('名称不能为空');
          return;
        }
        editTarget.name = ename;
        editTarget.desc = (ed && ed.value.trim()) || editTarget.desc || '';
        _local.kbEditId = null;
        toast('已保存资料库');
        navigate('knowledge');
        return;
      }
      if (name === 'openKbSearch') {
        _local.kbSearchOpen = true;
        _local.kbSearchHits = [];
        navigate('knowledge');
        return;
      }
      if (name === 'closeKbSearch') {
        _local.kbSearchOpen = false;
        _local.kbSearchQuery = '';
        _local.kbSearchHits = [];
        navigate('knowledge');
        return;
      }
      if (name === 'runKbSearch') {
        var sqEl = _ctx.rootEl && _ctx.rootEl.querySelector('#peKbSearch');
        var sq = (sqEl && sqEl.value.trim()) || '';
        _local.kbSearchQuery = sq;
        var paneKb = _local.knowledgePane;
        _local.kbSearchHits = ((D().knowledge && D().knowledge.docs) || [])
          .filter(function (d) {
            return d.kbId === paneKb && (!sq || (d.name && d.name.indexOf(sq) >= 0));
          })
          .map(function (d) {
            return { name: d.name, snippet: (d.status || '已入库') + ' · ' + (d.time || '') };
          });
        toast(_local.kbSearchHits.length ? '命中 ' + _local.kbSearchHits.length + ' 篇' : '未命中');
        navigate('knowledge');
        return;
      }
      if (name === 'previewKbDoc') {
        toast('已打开「' + arg + '」预览');
        return;
      }
      if (name === 'deleteKbDoc') {
        if (!window.confirm('删除文档「' + arg + '」？')) return;
        var paneDel = _local.knowledgePane;
        D().knowledge = D().knowledge || {};
        D().knowledge.docs = (D().knowledge.docs || []).filter(function (d) {
          return !(d.kbId === paneDel && d.name === arg);
        });
        var kbDel = (D().knowledge.kbs || []).filter(function (k) {
          return k.id === paneDel;
        })[0];
        if (kbDel && kbDel.docs > 0) kbDel.docs -= 1;
        toast('已删除文档');
        navigate('knowledge');
        return;
      }
      if (name === 'openMarketCreate') {
        _local.marketCreateKind = arg === 'expert' ? 'expert' : 'skill';
        navigate('skills');
        return;
      }
      if (name === 'closeMarketCreate') {
        _local.marketCreateKind = null;
        navigate('skills');
        return;
      }
      if (name === 'submitMarketCreate') {
        var mn = _ctx.rootEl && _ctx.rootEl.querySelector('#peMarketName');
        var md = _ctx.rootEl && _ctx.rootEl.querySelector('#peMarketDesc');
        var mname = mn && mn.value.trim();
        var mdesc = (md && md.value.trim()) || '';
        if (!mname) {
          toast('请填写名称');
          return;
        }
        var market = D().market || {};
        if (_local.marketCreateKind === 'expert') {
          market.experts = market.experts || [];
          var eid = 'ex-custom-' + Date.now();
          market.experts.unshift({
            id: eid,
            name: mname,
            field: mdesc || '自定义专家',
            scope: 'mine',
            official: false,
          });
          _local.marketKind = 'experts';
          _local.marketScope = 'my';
          toast('已创建专家「' + mname + '」');
        } else {
          market.skills = market.skills || [];
          var sid = 'sk-custom-' + Date.now();
          market.skills.unshift({
            id: sid,
            name: mname,
            desc: mdesc || '自定义技能',
            summary: mdesc || '自定义技能',
            category: '自定义',
            scope: 'mine',
            official: false,
          });
          _local.installedSkills = _local.installedSkills || {};
          _local.installedSkills[sid] = 1;
          _local.marketKind = 'skills';
          _local.marketScope = 'my';
          _local.skillCategory = 'all';
          toast('已创建技能「' + mname + '」');
        }
        D().market = market;
        _local.marketCreateKind = null;
        navigate('skills');
        return;
      }
    },
  };

  window.PEPages = PEPages;
})();
