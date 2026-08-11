/**
 * 投后数据浏览器 · 字段定义 + mock 数据
 * 来源：私募信披监管模板字段清单-v1.0-20260717.xlsx 项目投资大表
 * 版本: v1.0 | 日期: 2026-07-22
 * 全局：window.POST_BROWSER_DATA
 */
(function () {
  'use strict';

  var GROUPS = [
    {
      id: 'basic', label: '基本信息',
      cols: [
        { id: 'seq',        label: '序号' },
        { id: 'name',       label: '项目企业名称' },
        { id: 'investDate', label: '投资日期' },
        { id: 'investWay',  label: '投资方式' },
        { id: 'sector',     label: '投资行业' }
      ]
    },
    {
      id: 'finance', label: '投资财务',
      cols: [
        { id: 'principal',        label: '投资本金（万）' },
        { id: 'bookValue',        label: '账面价值（万）' },
        { id: 'moic',             label: 'MOIC' },
        { id: 'exitPrincipal',    label: '累计退出本金（万）' },
        { id: 'exitReceipt',      label: '累计回款（万）' },
        { id: 'valuationMethod',  label: '估值方法' }
      ]
    },
    {
      id: 'funding', label: '融资进展',
      cols: [
        { id: 'latestRound',        label: '最新融资轮次' },
        { id: 'latestRoundDate',    label: '最新融资日期' },
        { id: 'latestRoundAmount',  label: '最新融资金额（万）' },
        { id: 'postInvValuation',   label: '最新投后估值（万）' },
        { id: 'leadInvestor',       label: '本轮领投方' },
        { id: 'changeNote',         label: '本期估值/持股变动' }
      ]
    },
    {
      id: 'compliance', label: '合规与条款',
      cols: [
        { id: 'exitStatus',        label: '退出状态' },
        { id: 'exitWay',           label: '退出方式' },
        { id: 'confirmStatus',     label: '履行确权' },
        { id: 'keyTerms',          label: '关键条款' },
        { id: 'repurchaseTrigger', label: '回购权触发日' },
        { id: 'betObligation',     label: '对赌义务' },
        { id: 'nextPlan',          label: '下轮/退出计划' }
      ]
    },
    {
      id: 'ai', label: 'AI 分析',
      cols: [
        { id: 'ai', label: 'AI 摘要' }
      ]
    }
  ];

  var DEFAULT_COLS = ['name', 'sector', 'principal', 'bookValue', 'moic', 'exitStatus', 'latestRound', 'ai'];

  var ALL_COL_IDS = GROUPS.reduce(function (acc, g) {
    return acc.concat(g.cols.map(function (c) { return c.id; }));
  }, []);

  var COMPANIES = [
    {
      seq: 1,
      name: '苏州芯睿半导体有限公司',
      investDate: '2023-09-15',
      investWay: '增资',
      sector: '半导体',
      principal: 8000,
      bookValue: 15000,
      moic: '1.88',
      exitPrincipal: 0,
      exitReceipt: 0,
      valuationMethod: '参考最近融资价格法',
      latestRound: 'B+轮',
      latestRoundDate: '2026-04-10',
      latestRoundAmount: 30000,
      postInvValuation: 125000,
      leadInvestor: '国调基金领投',
      changeNote: 'B+轮融资完成，估值由10亿上调至12.5亿，持股由13.6%稀释至12.5%',
      exitStatus: '未退出',
      exitWay: '—',
      confirmStatus: '已确权',
      keyTerms: '回购权（2028-09 触发）；一票否决权；优先清算权1x',
      repurchaseTrigger: '2028-09-15',
      betObligation: '无对赌',
      nextPlan: '拟2027年申报科创板',
      ai: 'B+轮融资完成，国调基金领投背书，估值升至12.5亿，MOIC 1.88。回购权2028-09触发，当前无压力。建议跟进科创板申报节奏。'
    },
    {
      seq: 2,
      name: '杭州智造机器人股份有限公司',
      investDate: '2023-11-20',
      investWay: '增资',
      sector: '智能制造',
      principal: 6000,
      bookValue: 9500,
      moic: '1.58',
      exitPrincipal: 0,
      exitReceipt: 0,
      valuationMethod: '市场乘数法',
      latestRound: 'B轮',
      latestRoundDate: '2023-11-20',
      latestRoundAmount: 18000,
      postInvValuation: 72000,
      leadInvestor: '—',
      changeNote: '本期无新融资，按可比公司PS倍数复核，估值维持',
      exitStatus: '未退出',
      exitWay: '—',
      confirmStatus: '已确权',
      keyTerms: '回购权（2029-11 触发）；反稀释条款',
      repurchaseTrigger: '2029-11-20',
      betObligation: '2026年营收对赌2.5亿，进度62%',
      nextPlan: '2026H2 启动C轮',
      ai: '估值维持，营收对赌进度62%，低于预期。需在C轮前推动管理层加速增长。建议Q3起组织销售专题投后会。'
    },
    {
      seq: 3,
      name: '深圳恒康生物科技有限公司',
      investDate: '2024-03-08',
      investWay: '增资',
      sector: '生物医药',
      principal: 5000,
      bookValue: 4800,
      moic: '0.96',
      exitPrincipal: 0,
      exitReceipt: 0,
      valuationMethod: '参考最近融资价格法（本期下调）',
      latestRound: 'B轮（折价）',
      latestRoundDate: '2026-05-20',
      latestRoundAmount: 10000,
      postInvValuation: 78000,
      leadInvestor: '老股东跟投',
      changeNote: 'II期临床延期，B轮折价融资，估值由8.3亿下调至7.8亿，账面价值相应下调',
      exitStatus: '未退出',
      exitWay: '—',
      confirmStatus: '已确权',
      keyTerms: '回购权（2027-03 触发）；优先清算权1.5x；董事席位1席',
      repurchaseTrigger: '2027-03-08',
      betObligation: '临床里程碑对赌未达成（已触发估值调整）',
      nextPlan: '关注回购谈判',
      ai: 'MOIC跌破1，II期临床延期+折价融资。回购权2027-03触发，时间紧迫。建议法务介入确认回购触发条件，提前启动谈判预案。'
    },
    {
      seq: 4,
      name: '北京云枢数据技术有限公司',
      investDate: '2024-06-12',
      investWay: '增资',
      sector: '企业软件',
      principal: 4500,
      bookValue: 7200,
      moic: '2.22',
      exitPrincipal: 1500,
      exitReceipt: 2800,
      valuationMethod: '参考最近融资价格法',
      latestRound: 'C轮',
      latestRoundDate: '2026-01-15',
      latestRoundAmount: 40000,
      postInvValuation: 200000,
      leadInvestor: '某战投领投',
      changeNote: 'C轮完成，估值翻倍；本基金向战投转让1/3持股实现部分退出',
      exitStatus: '部分退出',
      exitWay: '股权转让',
      confirmStatus: '已确权',
      keyTerms: '剩余持股保留随售权、领售权',
      repurchaseTrigger: '—',
      betObligation: '无',
      nextPlan: '剩余持股待IPO或并购退出',
      ai: 'C轮估值20亿，已部分退出回款2800万，MOIC 2.22，优质项目。剩余持股随IPO/并购再释放收益。建议重点维护领售权条款时效。'
    },
    {
      seq: 5,
      name: '广州新能动力股份有限公司',
      investDate: '2023-07-01',
      investWay: '增资',
      sector: '新能源',
      principal: 7000,
      bookValue: 0,
      moic: '2.21',
      exitPrincipal: 7000,
      exitReceipt: 15500,
      valuationMethod: '收盘价市值法（已清仓）',
      latestRound: 'IPO（2025-06 科创板）',
      latestRoundDate: '2025-06-30',
      latestRoundAmount: 0,
      postInvValuation: 0,
      leadInvestor: '—',
      changeNote: '锁定期满后2026H1分批减持完毕，全部变现',
      exitStatus: '完全退出',
      exitWay: '上市退出',
      confirmStatus: '已确权',
      keyTerms: '已全部终止（随上市自动失效）',
      repurchaseTrigger: '—',
      betObligation: '无',
      nextPlan: '已完结',
      ai: '科创板成功退出，MOIC 2.21，回款1.55亿。已完结，无后续跟踪动作。可作为基金优秀案例纳入LP汇报材料。'
    },
    {
      seq: 6,
      name: '成都星链航天科技有限公司',
      investDate: '2025-01-18',
      investWay: '增资',
      sector: '商业航天',
      principal: 5500,
      bookValue: 6000,
      moic: '1.09',
      exitPrincipal: 0,
      exitReceipt: 0,
      valuationMethod: '成本法',
      latestRound: 'A轮',
      latestRoundDate: '2025-01-18',
      latestRoundAmount: 20000,
      postInvValuation: 100000,
      leadInvestor: '—',
      changeNote: 'SPV份额确权办理中；发射里程碑达成，暂按成本计量',
      exitStatus: '未退出',
      exitWay: '—',
      confirmStatus: '部分确权',
      keyTerms: '回购权（2030-01 触发）；一票否决权；共同出售权',
      repurchaseTrigger: '2030-01-18',
      betObligation: '2027年首发对赌，进行中',
      nextPlan: '2026H2 启动A+轮',
      ai: '发射里程碑已达成，暂按成本法，MOIC 1.09。SPV确权仍在办理中，存在法律瑕疵风险。建议催办确权手续，A+轮前完成整改。'
    }
  ];

  window.POST_BROWSER_DATA = {
    GROUPS: GROUPS,
    ALL_COL_IDS: ALL_COL_IDS,
    DEFAULT_COLS: DEFAULT_COLS,
    COMPANIES: COMPANIES
  };
})();
