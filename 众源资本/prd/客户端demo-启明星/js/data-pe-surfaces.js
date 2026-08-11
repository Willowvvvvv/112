/** PE 面补强数据 · 对齐 WebUI monitor / scenarios / knowledge / project files */
(function () {
  'use strict';
  var D = window.PE_DATA || (window.PE_DATA = {});

  D.monitorLead =
    '聚合工商、融资、司法、舆情和经营信号，生成项目动态摘要与风险预警。';
  D.monitorBrief = {
    aiLabel: 'AI 综合解读',
    title: '近 7 日项目动态摘要',
    meta: '今天 09:00 生成 · 覆盖 2 个项目、4 条变化',
    summary:
      '整体经营进展平稳。某生物医药项目核心管线按计划推进；新增关联方合同纠纷，需要结合其他应收款情况核实交易背景与回款安排。某微电子项目出现新的行业竞争动态，暂未构成重大风险。',
    riskTitle: '重点风险',
    riskText: '新增关联方合同纠纷，可能与其他应收款异常相关。',
    positiveTitle: '正向进展',
    positiveText: '核心管线临床 II 期入组完成，符合阶段计划。',
    actionTitle: '建议跟进',
    actionText: '本周向企业确认合同背景、款项性质及回款安排。',
  };

  D.monitorFeed = [
    {
      id: 'pm1',
      company: '苏州某生物医药科技有限公司',
      projectName: '某生物医药 Pre-B 轮尽调',
      change: '新增司法诉讼 1 起（合同纠纷，被告，120 万）',
      dimension: '司法新增',
      triggered: true,
      time: '2 天前',
    },
    {
      id: 'pm2',
      company: '苏州某生物医药科技有限公司',
      projectName: '某生物医药 Pre-B 轮尽调',
      change: '工商变更：注册资本由 5000 万增至 8000 万',
      dimension: '工商变更',
      triggered: false,
      time: '5 天前',
    },
    {
      id: 'pm3',
      company: '苏州某微电子科技有限公司',
      projectName: '某微电子售后回租尽调',
      change: '财联社行业稿提及 2025H2 海外 MRO 竞争者进入',
      dimension: '行业竞争',
      triggered: false,
      time: '昨天',
    },
    {
      id: 'pm4',
      company: '苏州某生物医药科技有限公司',
      projectName: '某生物医药 Pre-B 轮尽调',
      change: '核心管线临床 II 期入组完成，符合阶段预期',
      dimension: '经营里程碑',
      triggered: false,
      positive: true,
      time: '3 天前',
    },
  ];

  D.monitorCompanies = [
    {
      key: '苏州某生物医药科技有限公司',
      company: '苏州某生物医药科技有限公司',
      projectName: '某生物医药 Pre-B 轮尽调',
      alertCount: 1,
    },
    {
      key: '苏州某微电子科技有限公司',
      company: '苏州某微电子科技有限公司',
      projectName: '某微电子售后回租尽调',
      alertCount: 0,
    },
  ];

  D.monitorRules = [
    {
      id: 'um1',
      company: '苏州某生物医药科技有限公司',
      projectName: '某生物医药 Pre-B 轮尽调',
      condition: '作为被告且标的额 > 100 万',
      dimension: '司法',
      status: '已命中',
      triggered: true,
      time: '2026-07-10',
    },
    {
      id: 'um2',
      company: '苏州某微电子科技有限公司',
      projectName: '某微电子售后回租尽调',
      condition: '适航认证（CCAR-145）状态变更',
      dimension: '资质',
      status: '监听中',
      triggered: false,
      time: '2026-07-08',
    },
    {
      id: 'um3',
      company: '苏州某生物医药科技有限公司',
      projectName: '某生物医药 Pre-B 轮尽调',
      condition: '关联交易 / 其他应收款异常波动',
      dimension: '财务',
      status: '监听中',
      triggered: false,
      time: '2026-07-06',
    },
    {
      id: 'um4',
      company: '苏州某微电子科技有限公司',
      projectName: '某微电子售后回租尽调',
      condition: '单一客户收入占比突破 40%',
      dimension: '经营',
      status: '监听中',
      triggered: false,
      time: '2026-07-05',
    },
    {
      id: 'um5',
      company: '苏州某生物医药科技有限公司',
      projectName: '某生物医药 Pre-B 轮尽调',
      condition: '注册资本变动 > 30%',
      dimension: '工商',
      status: '监听中',
      triggered: false,
      time: '2026-07-04',
    },
    {
      id: 'um6',
      company: '苏州某微电子科技有限公司',
      projectName: '某微电子售后回租尽调',
      condition: '737MAX 维修订单增速低于 20%',
      dimension: '行业',
      status: '监听中',
      triggered: false,
      time: '2026-07-03',
    },
  ];

  /* 对齐 WebUI SCENARIO_ALL：工作流作推荐，看清企业 / 案头工作分栏 */
  D.scenarioCatalog = {
    lead: '技能与专家已配好，点选直接开始',
    featured: {
      id: 'sc-screen',
      name: '项目初筛',
      desc: '第一小时栈：材料→标的速览→公开面深度→行业赛道→找同类→访谈提纲→项目初评报告',
      prompt: '帮我初筛标的：星河智造科技有限公司',
      result: {
        text: '初筛结论：可立项深入。公开面无硬伤，客户集中与账期需尽调核实。',
        cards: [
          {
            type: 'kv',
            title: '初筛摘要',
            rows: [
              ['主体', '星河智造科技有限公司'],
              ['建议', '进入标的速览 + 材料清单'],
              ['红旗', '客户集中度高 · 应收拉长'],
            ],
          },
        ],
      },
    },
    groups: [
      {
        category: '看清企业',
        items: [
          {
            id: 'sc-onepager',
            name: '公司一页纸',
            desc: '公开面广度快照（基本盘/股权实控/风险计数/是否深跟）；深度下钻见公开面深读',
            prompt: '做公司一页纸：清泉环保科技股份有限公司',
            result: { text: '一页纸已生成。', cards: [] },
          },
          {
            id: 'sc-public',
            name: '公开面深读',
            desc: '在公开信息上做深度研判，是标的速览之上的深度档',
            prompt: '对星河智造做公开面深读',
            result: { text: '公开面深读完成。', cards: [] },
          },
          {
            id: 'sc-industry',
            name: '行业赛道分析',
            desc: '五维看市场空间、竞争格局与政策走向，判断赛道值不值得投',
            prompt: '分析工业自动化赛道',
            result: { text: '赛道分析已生成。', cards: [] },
          },
          {
            id: 'sc-interview',
            name: '访谈提纲准备',
            desc: '公开资料先行，按投资假设生成外部专家与管理层访谈提纲（默认双版本）',
            prompt: '准备访谈提纲：安泰生物',
            result: { text: '双版本访谈提纲已生成。', cards: [] },
          },
          {
            id: 'sc-peers',
            name: '找同类标的',
            desc: '输入对标企业或赛道关键词，找出同类可比标的（对标=分析手段）',
            prompt: '找同类：工业自动化',
            result: { text: '已列出可比标的。', cards: [] },
          },
          {
            id: 'sc-ip',
            name: '知产盘点',
            desc: '专利、商标与软著清单及有效性状态快速盘点',
            prompt: '盘点星河智造知产',
            result: { text: '知产清单已生成。', cards: [] },
          },
          {
            id: 'sc-score',
            name: '批量对比打分',
            desc: '多家标的同一框架打分排序（评分=分析框架，适合赛道初筛）',
            prompt: '批量对比打分：工业自动化候选池',
            result: { text: '打分表已生成。', cards: [] },
          },
        ],
      },
      {
        category: '案头工作',
        items: [
          {
            id: 'sc-finance',
            name: '财报深读',
            desc: '按机构财务配置（科目/指标/规则）做三张表勾稽与异常识别',
            prompt: '对星河智造已上传审计报告做财报深读',
            result: {
              text: '深读完成：应收周转与存货为主要关注。',
              cards: [
                {
                  type: 'flags',
                  title: '财务红旗',
                  items: ['应收周转 118 天，高于同行', '流水覆盖率 86%'],
                },
              ],
            },
          },
          {
            id: 'sc-report',
            name: '尽调报告',
            desc: '选择机构尽调模板，生成结构化尽调报告，缺口处自动标红',
            prompt: '生成尽调报告：星河智造',
            result: { text: '尽调报告骨架已生成。', cards: [] },
          },
          {
            id: 'sc-gap',
            name: '查材料缺口',
            desc: '对照尽调清单，发现缺什么、哪里信息互相打架',
            prompt: '列出安泰生物材料缺口及影响',
            result: { text: '流水缺失阻断现金跑道核验。', cards: [] },
          },
          {
            id: 'sc-minutes',
            name: '访谈纪要整理',
            desc: '上传录音文字稿，自动结构化访谈要点与待核实项',
            prompt: '整理访谈纪要',
            result: { text: '纪要要点已结构化。', cards: [] },
          },
          {
            id: 'sc-val',
            name: '估值测算',
            desc: '按机构财务配置（科目/指标/规则）做 DCF 或可比公司法估值',
            prompt: '测算星河智造估值',
            result: { text: '估值区间已给出。', cards: [] },
          },
          {
            id: 'sc-ic',
            name: 'IC Memo',
            desc: '选择 IC Memo 模板，生成投委会立项备忘录',
            prompt: '生成 IC Memo：星河智造',
            result: { text: 'IC Memo 骨架已生成。', cards: [] },
          },
          {
            id: 'sc-debate',
            name: '投委会对抗预演',
            desc: '红蓝对抗模拟立项会追问，合并原多视角评审/风控预演',
            prompt: '对抗预演：星河智造',
            result: { text: '红蓝追问清单已生成。', cards: [] },
          },
          {
            id: 'sc-review',
            name: '复盘报告',
            desc: '选择项目，基于材料与尽调结论生成结构化复盘报告',
            prompt: '生成复盘报告',
            result: { text: '复盘报告已生成。', cards: [] },
          },
        ],
      },
    ],
  };

  D.knowledge = {
    subtitle: '可检索知识与个人沉淀',
    kbs: [
      { id: 'kb1', name: '机构尽调知识库', docs: 12 },
      { id: 'kb2', name: '生物医药赛道笔记', docs: 5 },
    ],
    savedLists: ['生物医药 Pre-B 候选池', '工业自动化可比'],
    savedNews: ['财联社 · MRO 竞争格局', '临床 II 期入组完成'],
    aiOutputs: [
      {
        id: 'ao1',
        title: '星河智造 · 尽调报告 v0.3',
        version: 'v0.3',
        time: '昨天',
        body: '## 投资摘要\n标的公开面可立项深入。关注应收周转与客户集中度。\n\n## 核心发现\n1. 前五大客户集中度61%，高于同行中位22pct\n2. 2025H2 华东区域合同到期集中，续约风险需跟进\n3. 工业视觉引导系统占营收65.3%，产品结构持续升级\n\n## 待核实\n1. 关联交易合同背景及回款安排\n2. 其他应收款性质确认\n3. 2025H2 MRO 竞争压力量化',
      },
      {
        id: 'ao2',
        title: '安泰生物 · IC Memo 骨架',
        version: 'v0.1',
        time: '3 天前',
        body: '## 交易背景\nPre-B 轮，估值锚定临床 II 期入组进度。\n\n## 投资亮点\n1. 核心管线 II 期入组已完成，里程碑符合预期\n2. 管线差异化明显，竞品布局稀疏\n\n## 主要风险\n1. 新增关联方合同纠纷（120 万，被告）待核实\n2. 注册资本近期增至 8000 万，动机需了解\n\n## 建议\n本周向企业确认合同背景与款项性质后推进 IC 讨论',
      },
      {
        id: 'ao3',
        title: '清泉环保 · 公司一页纸',
        version: 'v1',
        time: '上周',
        body: '## 基本面\n- 主营：化工园运维 + 工业废水处理\n- 近期中标地方化工园项目（舆情正向）\n- 股东：南京产业基金持股\n\n## 材料缺口\n- 银行流水（近 12 个月）\n- 核心客户合同\n- 最新审计报告',
      },
    ],
  };

  D.defaultFileTree = [
    {
      folder: '财务',
      count: 1,
      files: [{ id: 'f1', name: '审计报告_2024.pdf', status: '已解析' }],
    },
    {
      folder: 'BP',
      count: 2,
      files: [
        { id: 'f2', name: '商业计划书_v3.pdf', status: '已解析' },
        { id: 'f3', name: '财务模型.xlsx', status: '已解析' },
      ],
    },
    {
      folder: '合同',
      count: 1,
      files: [{ id: 'f4', name: '关联交易协议.pdf', status: '已入库' }],
    },
    {
      folder: '访谈',
      count: 1,
      files: [{ id: 'f5', name: '管理层访谈纪要.md', status: '已解析' }],
    },
    { folder: '资质', count: 0, files: [] },
    { folder: '其他', count: 0, files: [] },
    {
      folder: 'AI生成报告',
      count: 2,
      files: [
        { id: 'f6', name: '尽调报告_草稿.docx', status: 'AI 产出' },
        { id: 'f7', name: 'IC_Memo_骨架.md', status: 'AI 产出' },
      ],
    },
  ];

  D.defaultAiOutputs = [
    {
      id: 'out1',
      title: '尽调报告 · 草稿',
      version: 'v0.3',
      time: '昨天',
      body:
        '## 投资摘要\n标的公开面可立项深入。关注应收周转与客户集中度。\n\n## 待核实\n1. 关联交易合同背景\n2. 其他应收款性质\n3. 2025H2 竞争压力',
    },
    {
      id: 'out2',
      title: 'IC Memo 骨架',
      version: 'v0.1',
      time: '3 天前',
      body: '## 交易背景\n…\n## 投资亮点\n…\n## 主要风险\n…',
    },
    {
      id: 'out3',
      title: '材料缺口清单',
      version: 'v1',
      time: '上周',
      body: '- 银行流水（近 12 个月）\n- 核心客户合同\n- 管线临床原始数据',
    },
  ];
})();
