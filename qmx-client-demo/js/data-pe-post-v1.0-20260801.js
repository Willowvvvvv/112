/**
 * 投后工作台统一数据 v1.1 (20260807-4arch)
 * 精简为 4 个核心实体：fund-1 / f-ggv / p-xinghe / lt-ggv-jd
 */
(function () {
  'use strict';

  /* —— 项目（直投 + 子基金穿透；盘面多维切片需维度交叉，不能只留 2 条一一对应） —— */
  var PROJECTS = [
    /* ① 直投：星河智造 */
    {
      id: 'p-xinghe', name: '星河智造', type: 'direct', stage: 'post',
      status: 'active', parentFundIds: ['fund-1'],
      round: 'A+', industry: '智能制造', stageIn: '早期',
      investDate: '2024-03', investAmount: 5000, ratio: 12, valuation: 80000,
      holding: { fairValue:9600, totalValue:9600, period:'2026Q2' },
      city: '苏州', pendingCount: 3, lastUpdate: '2026-07-28',
      creditCode: '91320594MA1XQ8C7X2',
      legalName: '星河智造（苏州）科技有限公司',
      legalRep: '沈峰',
      businessStatus: '存续',
      terms: [
        { name: '回购条款', detail: '业绩不达标触发回购', has: true },
        { name: '董事会席位', detail: '1 席 · 重大事项一票否决', has: true },
        { name: '反稀释条款', detail: '加权平均', has: true },
        { name: '领售权', detail: '未约定', has: false },
        { name: '优先清算', detail: '本金+8% 收益优先', has: true },
      ],
      contacts: [
        { name: '张伟', role: 'CFO', phone: '138****9021', email: 'zhangw@xhzz.com', primary: true },
        { name: '李明', role: '董事会秘书', phone: '186****3345', email: 'lim@xhzz.com', primary: false },
        { name: '王磊', role: 'CTO', phone: '137****8821', email: 'wangl@xhzz.com', primary: false },
      ],
      bankAccounts: [
        { holder: '星河智造（苏州）科技有限公司', bank: '招商银行 · 苏州工业园区支行', no: '5129 **** **** 0821', use: '主收款账户', currency: 'CNY' },
        { holder: '星河智造（苏州）科技有限公司', bank: '中国银行 · 苏州工业园区支行', no: '6217 **** **** 3392', use: '对公结算', currency: 'CNY' },
      ],
      risks: [
        { level: '中', name: '应收账款周转天数上升', detail: '周转天数 61→111 天，近四成收入未到账', period: '2026H1', date: '2026-07-28' },
        { level: '低', name: '研发投入增大', detail: '2026H1 研发费用同比 +28%', period: '2026H1', date: '2026-07-28' },
      ],
      followups: [
        { id:'f1', title: '追问 2026Q3 估值与 D 轮意向', due: '2026-09-30', owner: '菜菜', status: 'open' },
        { id:'f2', title: '获取 2026H1 银行流水', due: '2026-08-15', owner: '菜菜', status: 'open' },
        { id:'f3', title: '安排 9 月董事会访谈', due: '2026-09-10', owner: '胡老师', status: 'open' },
      ],
      periods: [
        { id: '2023FY', label: '2023年度', revenue: 6500, netProfit: 680, grossProfit: 2600, totalAssets: 28000, totalLiab: 13000, equity: 15000, operatingCF: 920, researchCost: 520, status: 'done' },
        { id: '2024FY', label: '2024年度', revenue: 9800, netProfit: 1260, grossProfit: 3920, totalAssets: 36000, totalLiab: 17500, equity: 18500, operatingCF: 1480, researchCost: 784, status: 'done' },
        { id: '2025FY', label: '2025年度', revenue: 12800, netProfit: 1820, grossProfit: 5120, totalAssets: 45000, totalLiab: 21000, equity: 24000, operatingCF: 2180, researchCost: 1024, status: 'done' },
        { id: '2026H1', label: '2026上半年', revenue: 8900, netProfit: 1450, grossProfit: 3560, totalAssets: 48000, totalLiab: 22500, equity: 25500, operatingCF: 1560, researchCost: 803, status: 'pending', changedFields: ['revenue','netProfit','totalAssets'] },
      ],
      equityEvents: [
        { id:'ee0', date:'2024-03', type:'初次投资', desc:'A+ 轮跟投，持股 18%，投资成本 5,000 万元，投后估值 5 亿元', status:'confirmed' },
        { id:'ee-follow', date:'2025-06', type:'增资', desc:'参与认购增资份额，维持持股比例 18%，巩固投后管理权益', status:'confirmed' },
        { id:'ee1', date:'2026-06', type:'后续融资', desc:'B轮融资完成，估值升至 8 亿元，持股由 18% 稀释至 12%，新引入光源创投与元生资本', oldValuation:50000, newValuation:80000, oldRatio:18, newRatio:12, newShareholders:['光源创投','元生资本'], status:'confirmed' },
      ],
      owner: '菜菜', mainBusiness: '工业自动化设备与机器人系统集成', investRole: '跟投',
      exitStatus: '持有中', exitAmount: 0, fairValueChange: '+60.0%（B轮完成后）',
      hasFollowOn: true,
      latestRoundDate: '2026-06',
      latestRound: 'B轮',
      latestValuation: 80000,
      postRoundRatio: 12,
      followOnText: 'B 轮已完成，本季无新增跟投',
      businessProgressPeriod: '2026H1',
      businessProgress: '2026H1 营收 8,900 万，同比增长；净利润 1,450 万，受研发投入增加影响略降。主要客户新能源汽车领域订单持续增长，B 轮融资后团队扩至 350 人，新产线计划 Q4 投产。',
      exitPlan: '计划 2028 年前科创板申报；B 轮完成后估值 8 亿，预计持股公允价值随估值提升持续上行。',
      businessUpdates: [
        { period: '2024FY', date: '2025-03-10', text: '2024 年度营收 9,800 万，净利润 1,260 万，同比增长 22%。获 B 轮投资意向书，主要投资方光源创投与元生资本完成尽调。年末团队 260 人，主要客户覆盖新能源汽车、3C 制造领域。' },
        { period: '2025FY', date: '2025-04-15', text: '2025 年度营收 12,800 万，净利润 1,820 万，增势稳健。新能源汽车客户渗透率持续提升，机器人关节模组新品线启动布局；年末团队规模 320 人，研发投入占营收约 8%。' },
        { period: '2026H1', date: '2026-07-28', text: '2026H1 营收 8,900 万，同比增长；净利润 1,450 万，受研发投入增加影响略降。B 轮融资后团队扩至 350 人，新产线计划 Q4 投产，主力客户新能源汽车领域订单持续放量。' },
      ],
      exitMilestones: [
        { date: '2024-03', event: '初次投资入股', status: 'done', detail: 'A+ 轮跟投，投资成本 5,000 万元，持股 18%，投后估值 5 亿元。' },
        { date: '2026-06', event: 'B 轮融资完成', status: 'done', detail: 'B 轮引入光源创投与元生资本，融资总额约 1.8 亿元，估值升至 8 亿元，持股稀释至 12%。公允价值较成本增长约 +60%。' },
        { date: '2028（预计）', event: '科创板 IPO 申报', status: 'planned', detail: '计划 2028 年前向科创板递交申报，预计上市区间估值 20~25 亿元，届时持股公允价值约 2.4~3.0 亿元。' },
      ],
      materialFolders: [
        { id: 'mf-xh-1', name: '财报' },
        { id: 'mf-xh-2', name: '股权文件' },
      ],
      materials: [
        { id: 'mat-xh-1', name: '星河智造-2026H1-财报.pdf', type: '财报', updatedAt: '2026-07-28', status: '待确认', folder: 'mf-xh-1' },
        { id: 'mat-xh-2', name: '星河智造-2026H1-补充材料.pdf', type: '财报', updatedAt: '2026-07-28', status: '待确认', folder: 'mf-xh-1' },
        { id: 'mat-xh-3', name: '星河智造-2025年度财报.pdf', type: '财报', updatedAt: '2026-04-15', status: '已归档', folder: 'mf-xh-1' },
        { id: 'mat-xh-4', name: '星河智造-B轮股权文件.pdf', type: '股权文件', updatedAt: '2026-06-20', status: '已归档', folder: 'mf-xh-2' },
      ],
      updates: [
        { summary: '确认写入 2026H1 财务数据（营业收入 8,900 万 · 净利润 1,450 万）', field: '财务数据·2026H1', before: '—', after: '营收 8,900 / 净利 1,450', source: '解析·星河智造-2026H1-补充材料.pdf', by: '菜菜', at: '2026-07-28 15:20' },
        { summary: 'B 轮融资完成：持股 18%→12%，估值 5 亿→8 亿', field: '持股比例 / 投后估值', before: '18% · 50,000 万', after: '12% · 80,000 万', source: '解析·星河智造-B轮股权文件.pdf', by: '菜菜', at: '2026-06-20 11:05' },
        { summary: '手工更正应收账款周转说明', field: '风险备注', before: '周转天数约 90 天', after: '周转天数 61→111 天', source: '手工维护', by: '胡老师', at: '2026-06-18 09:40' },
        { summary: '确认写入 2025 年度财报（净利润 1,820 万）', field: '财务数据·2025FY', before: '待确认', after: '已确认 · 净利 1,820 万', source: '解析·星河智造-2025年度财报.pdf', by: '菜菜', at: '2026-04-15 16:30' },
        { summary: '新增项目档案', field: '—', before: '—', after: '创建直投项目「星河智造」', source: '系统', by: '菜菜', at: '2024-03-28 10:00' },
      ],
      finNotes: [
        { name: '收入确认政策', detail: '设备销售于验收交付后按时点确认收入；系统集成项目按履约进度（投入法）确认，2026H1 无重大会计政策变更。' },
        { name: '信用风险与坏账准备', detail: '按账龄组合计提：1 年以内 5%、1-2 年 15%、2-3 年 40%、3 年以上 100%。2026H1 应收账款周转天数升至 111 天，已相应提高计提比例。' },
        { name: '关联交易', detail: '向关联方"星河自动化"采购零部件，2026H1 关联交易额约 1,200 万元，占营业成本约 9%，定价按市场化原则执行。' },
        { name: '研发支出', detail: '2026H1 研发费用 803 万元，全部费用化处理，无资本化研发支出。' },
        { name: '或有事项', detail: '存在 1 起未决劳动仲裁，标的额约 35 万元，管理层判断不会造成重大不利影响。' },
      ],
      /* 企查查工商/融资/风险外部数据，供概览页自动填充工商字段 */
      externalPublic: {
        工商信息: {
          同步时间: '2026-07-28 09:45',
          企业全称: '星河智造（苏州）科技有限公司',
          统一社会信用代码: '91320594MA1XQ8C7X2',
          注册资本: '5,000 万元',
          成立日期: '2019-04-10',
          经营状态: '存续',
          法定代表人: '沈峰',
          实控人: '沈峰',
          注册地址: '苏州工业园区星港街328号星海广场B栋1803',
          股东结构: [
            { 股东名称: '众源一号私募股权投资基金', 持股比例: '12.00%', 股东类型: '机构' },
            { 股东名称: '光源创投基金', 持股比例: '15.00%', 股东类型: '机构' },
            { 股东名称: '元生资本私募基金', 持股比例: '10.00%', 股东类型: '机构' },
            { 股东名称: '沈峰', 持股比例: '35.00%', 股东类型: '自然人' },
            { 股东名称: '星河智造员工持股平台（苏州）合伙企业', 持股比例: '28.00%', 股东类型: '机构' },
          ],
          数据来源: '企查查，仅供参考',
        },
        融资进程: {
          同步时间: '2026-07-28 09:45',
          数据: [
            { 融资轮次: '天使轮', 披露日期: '2020-05-12', 融资金额: '800 万元', 主要投资方: '苏高新天使基金' },
            { 融资轮次: 'Pre-A轮', 披露日期: '2021-11-08', 融资金额: '3,000 万元', 主要投资方: '元生资本（领投）' },
            { 融资轮次: 'A+轮', 披露日期: '2024-03-20', 融资金额: '5,000 万元', 主要投资方: '众源一号（领投）、元生资本（跟投）' },
            { 融资轮次: 'B轮', 披露日期: '2026-06-15', 融资金额: '1.2 亿元', 主要投资方: '光源创投（领投）、元生资本（跟投）、众源一号（跟投）' },
          ],
          数据来源: '企查查，仅供参考',
        },
        风险数据: {
          同步时间: '2026-07-28 09:45',
          司法风险: { count: 1, list: ['劳动仲裁1起（标的额约35万元，待裁决）'] },
          行政处罚: { count: 0, list: [] },
          失信被执行人: false,
          经营异常: false,
          严重违法: false,
          数据来源: '企查查，仅供参考',
        },
      },
    },

    /* ② 子基金穿透：京东工业品（穿透 GGV人民币二期） */
    {
      id: 'lt-ggv-jd', name: '京东工业品', type: 'lookthrough', stage: 'post',
      status: 'active',
      targetFundId: 'f-ggv', sourceFundName: 'GGV人民币二期',
      parentFundIds: ['fund-1'],
      legalName: '北京京东叁佰陆拾度电子商务有限公司',
      legalRep: '刘强东',
      businessStatus: '存续',
      industry: '产业互联网', subIndustry: '工业品B2B', city: '北京',
      province: '北京', district: '北京经济技术开发区', address: '—',
      stageIn: '中期', round: 'A轮',
      investDate: '2020-08-17', investAmount: 6645.4, ratio: 0.3531,
      investRole: '领投', investMethod: '增资', confirmStatus: '已确权',
      valuation: 2952166.9,
      holding: { fairValue: 10423.61, totalValue: 10423.61, period: '2026Q1', remainingCost: 6645.4 },
      remainingCost: 6645.4, exitAmount: 0, exitStatus: '在管',
      fairValueChange: -1661.21, statusNote: '在管',
      moic: 1.57,
      hasFollowOn: false,
      latestRoundDate: '',
      latestRound: '',
      latestValuation: 2952166.9,
      postRoundRatio: 0.3531,
      followOnText: '—',
      pendingCount: 0, lastUpdate: '2026-04-08',
      owner: '徐炳东',
      mainBusiness: '中国头部且盈利的一站式工业品线上采购平台',
      businessProgressPeriod: '2026Q1',
      businessProgress: '2026H1 营收 11,200 万、净利润 1,450 万；GP 季报经营表已同步。',
      exitPlan: '—',
      equityEvents: [
        { id:'jdee1', date:'2020-08-17', type:'A轮投资', desc:'GGV人民币二期投资 6,645.40 万元，持股约 0.35%，投后估值约 295 亿元', oldValuation:0, newValuation:2952166.9, oldRatio:0, newRatio:0.3531, status:'confirmed' },
      ],
      businessUpdates: [
        { period: '2026Q1', date: '2026-04-08', text: '台账更新：剩余成本 6,645.40 万，公允价值 10,423.61 万，MOIC 1.57x，公允价值变动 -1,661.21 万。' },
      ],
      exitMilestones: [
        { date: '2020-08-17', event: 'GGV 参与 A 轮投资', status: 'done', detail: '投资本金 6,645.40 万元，持股约 0.35%。' },
      ],
      periods: [
        { id: '2025FY', label: '2025年度', revenue: 18500, netProfit: 2100, status: 'done' },
        { id: '2026H1', label: '2026上半年', revenue: 11200, netProfit: 1450, status: 'done' },
      ],
      materialFolders: [
        { id: 'mf-jd-1', name: '经营材料' },
        { id: 'mf-jd-2', name: '融资材料' },
      ],
      materials: [
        { id: 'mat-jd-1', name: '投后数据整理template.xlsx', type: '内部财务表', updatedAt: '2026-04-08', status: '已归档', folder: 'mf-jd-1' },
      ],
      updates: [
        { summary: '确认写入 2026Q1 持仓（公允价值 10,423.61 万 · MOIC 1.57x）', field: '期末持仓·2026Q1', before: '—', after: '公允 10,423.61 万 · 持股 0.35%', source: '解析·投后数据整理template.xlsx', by: '菜菜', at: '2026-04-08 14:10' },
        { summary: '从 GGV 季报穿透建档「京东工业品」', field: '—', before: '—', after: '创建子基金穿透项目', source: '解析·GGV人民币二期', by: '系统', at: '2020-09-15 09:00' },
      ],
      /* 企查查工商/融资/风险外部数据 */
      externalPublic: {
        工商信息: {
          同步时间: '2026-04-08 14:00',
          企业全称: '北京京东叁佰陆拾度电子商务有限公司',
          统一社会信用代码: '91110105MA01F2B8R7',
          注册资本: '100,000万元',
          成立日期: '2017-06-08',
          经营状态: '存续',
          法定代表人: '刘强东',
          实控人: '刘强东',
          注册地址: '北京市朝阳区东坝乡将台路5号院2号楼',
          股东结构: [
            { 股东名称: '京东集团控股有限公司', 持股比例: '62.00%', 股东类型: '机构' },
            { 股东名称: '苏州纪源皓元创业投资合伙企业（有限合伙）', 持股比例: '0.35%', 股东类型: '机构' },
            { 股东名称: '其他机构投资人', 持股比例: '33.20%', 股东类型: '机构' },
          ],
          数据来源: '企查查，仅供参考',
        },
        融资进程: {
          同步时间: '2026-07-25 14:00',
          数据: [
            { 融资轮次: 'A轮', 披露日期: '2019-03-01', 融资金额: '未披露', 主要投资方: '京东集团内部融资' },
            { 融资轮次: 'B轮', 披露日期: '2020-09-10', 融资金额: '约2,000万元（GGV等跟投）', 主要投资方: 'GGV纪源资本（领投）' },
            { 融资轮次: 'C轮', 披露日期: '2022-12-15', 融资金额: '5亿元', 主要投资方: '产业战略投资方' },
            { 融资轮次: 'D轮', 披露日期: '2024-06-20', 融资金额: '15亿元', 主要投资方: '红杉中国（领投）、GGV（跟投）' },
          ],
          数据来源: '企查查，仅供参考',
        },
        风险数据: {
          同步时间: '2026-07-25 14:00',
          司法风险: { count: 2, list: ['买卖合同纠纷1起（标的额约120万元，审理中）', '劳动仲裁1起（标的额约18万元，已调解）'] },
          行政处罚: { count: 0, list: [] },
          失信被执行人: false,
          经营异常: false,
          严重违法: false,
          数据来源: '企查查，仅供参考',
        },
      },
    },
    {
      id: 'lt-ggv-zs', name: '智算芯片', type: 'lookthrough', stage: 'post', status: 'active',
      targetFundId: 'f-ggv', sourceFundName: 'GGV人民币二期', parentFundIds: ['fund-1'],
      industry: '半导体/AI', city: '上海', stageIn: '早期',
      investDate: '2021-03', investAmount: 3000, owner: '胡老师',
      holding: { fairValue: 8500, totalValue: 8500, period: '2026Q2' },
      exitStatus: '在管', lastUpdate: '2026-07-20'
    },
    {
      id: 'lt-ggv-ln', name: '量子通信', type: 'lookthrough', stage: 'post', status: 'active',
      targetFundId: 'f-ggv', sourceFundName: 'GGV人民币二期', parentFundIds: ['fund-1'],
      industry: '通信', city: '深圳', stageIn: '早期',
      investDate: '2019-11', investAmount: 1500, owner: '菜菜',
      holding: { fairValue: 0, totalValue: 0, period: '2026Q2' },
      exitStatus: '完全退出', exitAmount: 3200, lastUpdate: '2025-11-02'
    },
    {
      id: 'p-sandun', name: '三顿半', type: 'direct', stage: 'post', status: 'active',
      parentFundIds: ['fund-1'], industry: '消费', city: '长沙', stageIn: '中期',
      investDate: '2021-03', investAmount: 2700, owner: '胡老师',
      holding: { fairValue: 1350, totalValue: 1350, period: '2026Q2' },
      exitStatus: '部分退出', lastUpdate: '2026-06-18'
    },
  ];

  /* —— 文件队列 ——
     fileType: 文件物理类型 (pdf-native / pdf-scan / excel / word / image)
     parseMode: 解析方式 (direct / ocr / cell)
  */
  var FILES = {
    gpProgress: { total: 8, arrived: 6 },
    parsing: [
      { id:'fp1', name:'星河智造-2026H1-财报.pdf', type:'财报', fileType:'pdf-native', parseMode:'direct', project:'p-xinghe', period:'2026H1', progress:45, stage:'提取表格', stages:['识别版式','提取表格','映射字段','执行校验'] },
    ],
    pending: [
      { id:'fp3', name:'GGV人民币二期-2026Q2季报.xlsx', type:'GP季报', fileType:'excel', parseMode:'cell', project:'f-ggv', period:'2026Q2', conflictCount:1, firstMapCount:4, abnormalCount:0 },
      { id:'fp4', name:'星河智造-2026H1-补充材料.pdf', type:'财报', fileType:'pdf-native', parseMode:'direct', project:'p-xinghe', period:'2026H1', conflictCount:1, firstMapCount:2, abnormalCount:1 },
    ],
    abnormal: [],
    done: [
      { id:'fd3', name:'星河智造-2025年度财报.pdf', type:'财报', fileType:'pdf-native', parseMode:'direct', project:'p-xinghe', period:'2025FY', confirmedBy:'菜菜', confirmedAt:'2026-04-15', fields:52 },
    ],
  };

  /* —— 确认页数据（按文件ID） —— */
  var CONFIRMS = {
    'fp3': { /* GGV人民币二期季报 */
      fileId: 'fp3', fileName: 'GGV人民币二期-2026Q2季报.xlsx', project: 'f-ggv', projectName: 'GGV人民币二期', period: '2026Q2', type: 'GP季报',
      sheetTabs: ['基金概览','投资组合','分配明细'],
      activeSheet: '基金概览',
      fields: [
        { id:'e1', name:'基金管理人', srcVal:'纪源投资', mapVal:'宁波纪源投资管理有限公司', source:'entity', entityStatus:'matched', check:'pass' },
        { id:'e2', name:'底层项目·京东工业品', srcVal:'京东工业品', mapVal:'lt-ggv-jd', source:'entity', entityStatus:'matched', check:'pass' },
        { id:'c1', name:'基金规模', srcVal:'160,100', mapVal:'160,100', source:'extract', check:'pass', pos:{sheet:'基金概览',cell:'B2'}, aiFallback:false },
        { id:'c2', name:'LP总认缴', srcVal:'160,100', mapVal:'160,100', source:'extract', check:'pass', pos:{sheet:'基金概览',cell:'B3'} },
        { id:'c3', name:'众源一号认缴', srcVal:'5,000', mapVal:'5,000', source:'extract', check:'pass', pos:{sheet:'基金概览',cell:'B4'} },
        { id:'c4', name:'众源一号实缴', srcVal:'5,000', mapVal:'5,000', source:'extract', check:'pass', pos:{sheet:'基金概览',cell:'B5'} },
        { id:'c5', name:'众源一号累计分配', srcVal:'423.59', mapVal:'423.59', source:'extract', check:'pass', pos:{sheet:'基金概览',cell:'B6'}, confLevel:'low', uncertain:true },
        { id:'c6', name:'期末NAV（众源口径）', srcVal:'8,394.6', mapVal:'8,394.6', source:'extract', check:'pass', pos:{sheet:'基金概览',cell:'B7'} },
        { id:'c7', name:'MOIC（基金）', srcVal:'2.37', mapVal:'2.37', source:'extract', check:'pass', pos:{sheet:'子基金列表',cell:'V8'} },
        { id:'c8', name:'TVPI（众源自算）', srcVal:'1.76', mapVal:'1.76', source:'extract', check:'pass', pos:{sheet:'子基金列表',cell:'Z8'} },
        { id:'c9', name:'DPI（众源自算）', srcVal:'0.08', mapVal:'0.08', source:'extract', check:'pass', pos:{sheet:'子基金列表',cell:'AC8'} },
      ],
      trialBalance: { pass: true, checks:[{name:'认缴=实缴+未call',result:'pass'},{name:'分配+NAV≈认缴×TVPI',result:'pass'}] },
      totalCheck: null,
      investInfo: [
        { name: '京东工业品', industry: '产业互联网', amount: '6,645.40万', round: 'A轮', date: '2020-08', lead: '是' },
        { name: '科亚医疗', industry: '科技', amount: '3,900万', round: 'B+轮', date: '2020-08', lead: '是' },
        { name: '摩尔线程', industry: '科技', amount: '7,200万', round: 'Pre-A', date: '2021-01', lead: '是' },
        { name: '申基生物', industry: '—', amount: '6,387万', round: '—', date: '2024-12', lead: '否' },
      ],
    },
    'fp4': { /* 星河智造补充材料 —— 三表，含差异行 */
      fileId: 'fp4', fileName: '星河智造-2026H1-补充材料.pdf', project: 'p-xinghe', projectName: '星河智造', period: '2026H1', type: '财报',
      fileType: 'pdf-native', parseMode: 'direct',
      sheetTabs: ['资产负债表','利润表','现金流量表'],
      activeSheet: '利润表',
      sheetFields: {
        '利润表': [
          { id:'p41', name:'营业收入', srcVal:'8,900', mapVal:'8,900', source:'extract', check:'pass', pos:{sheet:'利润表',cell:'C4'}, diff:false },
          { id:'p42', name:'营业成本', srcVal:'5,320', mapVal:'5,320', source:'extract', check:'pass', pos:{sheet:'利润表',cell:'C5'}, diff:false },
          { id:'p43', name:'净利润', srcVal:'1,450', mapVal:'1,450', source:'extract', check:'pass', pos:{sheet:'利润表',cell:'C12'}, diff:true, diffNote:'与上期 1,820 相比变动 -20.3%，超阈值' },
          { id:'p44', name:'应收账款-净值', srcVal:'2,100', mapVal:'2,100', source:'aiFallback', check:'pass', aiFallback:true, fallbackFrom:'应收账款', pos:{sheet:'资产负债表',cell:'C8'}, diff:false },
        ],
        '资产负债表': [
          { id:'b41', name:'货币资金', srcVal:'1,941', mapVal:'1,941.84', source:'extract', check:'pass', pos:{sheet:'资产负债表',cell:'C2'}, diff:false },
          { id:'b42', name:'应收账款', srcVal:'847', mapVal:'847.56', source:'extract', check:'pass', pos:{sheet:'资产负债表',cell:'C6'}, diff:true, diffNote:'科目合并：应收账款+应收票据需拆分' },
          { id:'b43', name:'资产总计', srcVal:'48,000', mapVal:'48,000.00', source:'extract', check:'pass', pos:{sheet:'资产负债表',cell:'C20'}, diff:false },
          { id:'b44', name:'负债合计', srcVal:'22,500', mapVal:'22,500.00', source:'extract', check:'pass', pos:{sheet:'资产负债表',cell:'D20'}, diff:false },
        ],
        '现金流量表': [
          { id:'c41', name:'经营活动现金流入', srcVal:'9,200', mapVal:'9,200', source:'extract', check:'pass', pos:{sheet:'现金流量表',cell:'C4'}, diff:false },
          { id:'c42', name:'经营活动现金流出', srcVal:'6,800', mapVal:'6,800', source:'extract', check:'pass', pos:{sheet:'现金流量表',cell:'C8'}, diff:false },
          { id:'c43', name:'经营活动现金流量净额', srcVal:'2,400', mapVal:'2,400', source:'derived', check:'pass', formula:'流入 9,200 - 流出 6,800', pos:{sheet:'现金流量表',cell:'C12'}, diff:false },
        ],
      },
      fields: [],
      trialBalance: { pass: false, checks:[{name:'资产=负债+权益',result:'pass'},{name:'收入-成本-费用=净利润',result:'fail',detail:'计算 1,520 ≠ 报表 1,450，差异 70'}] },
      totalCheck: { sourceTotal:'1,450', calcTotal:'1,520', diff:'70', pass:false, diffField:'净利润', note:'利润表勾稽：收入8,900-成本5,320-费用2,060=1,520，报表净利润1,450' },
      bizFields: {
        基础信息: [
          { label: '工商全称', value: '星河智造（苏州）科技有限公司' },
          { label: '注册地', value: '江苏省苏州市工业园区' },
          { label: '成立日期', value: '2019-04-10' },
          { label: '法定代表人', value: '沈峰' },
          { label: '注册资本', value: '5,000 万元' },
        ],
        投资信息: [
          { label: '首次投资日期', value: '2024-03-28' },
          { label: '本轮投资金额', value: '5,000 万元' },
          { label: '累计投资金额', value: '5,000 万元' },
          { label: '投资轮次', value: 'A+轮' },
          { label: '持股比例', value: '12%' },
        ],
        期末持仓: [
          { label: '期末持股比例', value: '12%' },
          { label: '持股公允价值', value: '9,600 万元' },
          { label: '剩余投资成本', value: '5,000 万元' },
          { label: '未实现增值', value: '4,600 万元' },
          { label: 'MOIC', value: '1.92x' },
          { label: '退出状态', value: '持有中' },
        ],
        业绩指标: [
          { label: 'MOIC', value: '1.92x' },
          { label: 'IRR', value: '38.5%' },
          { label: '当前估值', value: '8.00 亿元' },
          { label: '较上期变动', value: '+60.0%（B轮完成）', flag: 'positive' },
        ],
        企业与条款: [
          { label: '优先清算权', value: '本金+8%收益优先' },
          { label: '反稀释条款', value: '加权平均反稀释' },
          { label: '回购条款', value: '业绩不达标触发回购' },
          { label: '董事会席位', value: '1席·重大事项一票否决' },
          { label: '领售权', value: '未约定' },
        ],
      },
    },
  };

  /* —— 基金（母基金 + 所投子基金，共 2 条） —— */
  var FUNDS = [
    /* ① 母基金：众源一号 */
    {
      id:'fund-1', name:'众源一号', code:'ZY-FOF-01', management:'managed', strategy:'fof', type:'母基金',
      status:'正常运作', manager:'众源资本', committed:120000, called:109727, established:'2018',
      tvpi:1.82, dpi:0.52, moic:1.9, lastUpdate:'2026-07-30',
      periods:[
        { id:'2024Q4', label:'2024Q4', status:'done', moic:1.50, tvpi:1.60, dpi:0.30 },
        { id:'2025Q2', label:'2025Q2', status:'done', moic:1.65, tvpi:1.70, dpi:0.40 },
        { id:'2025FY', label:'2025年度', status:'done', moic:1.75, tvpi:1.78, dpi:0.48 },
        { id:'2026Q2', label:'2026Q2', status:'done', moic:1.90, tvpi:1.82, dpi:0.52 },
      ],
      distributions:[
        { date:'2026-05-20', amount:4800, fromFund:'GGV人民币二期', exitCompany:'量子通信（完全退出）', totalDistributed:4800 },
      ],
      materialFolders:[
        { id:'mf-f1-1', name:'季报' },
        { id:'mf-f1-2', name:'分配通知' },
        { id:'mf-f1-3', name:'法律文件' },
      ],
      materials:[
        { id:'mat-f1-1', name:'众源一号-2026Q2基金简报.pdf', type:'季报', updatedAt:'2026-07-30', status:'已归档', folder:'mf-f1-1' },
        { id:'mat-f1-2', name:'众源一号-2026Q1分配通知.pdf', type:'分配通知', updatedAt:'2026-05-25', status:'已归档', folder:'mf-f1-2' },
        { id:'mat-f1-3', name:'众源一号LP协议-2018.pdf', type:'LP协议', updatedAt:'2018-06-01', status:'已归档', folder:'mf-f1-3' },
      ],
      updates:[
        { summary:'确认写入 2026Q2 基金简报（MOIC 1.90 · TVPI 1.82 · DPI 0.52）', field:'期间表现·2026Q2', before:'2025FY · MOIC 1.75', after:'2026Q2 · MOIC 1.90 / TVPI 1.82 / DPI 0.52', source:'解析·众源一号-2026Q2基金简报.pdf', by:'菜菜', at:'2026-07-30 16:05' },
        { summary:'登记分配到账 4,800 万（来源 GGV · 量子通信完全退出）', field:'分配流水', before:'—', after:'2026-05-20 · 4,800 万', source:'解析·众源一号-2026Q1分配通知.pdf', by:'菜菜', at:'2026-05-25 11:30' },
        { summary:'关联所投子基金「GGV人民币二期」出资关系', field:'所投子基金', before:'—', after:'认缴/实缴 5,000 万', source:'手工维护', by:'胡老师', at:'2020-07-20 09:15' },
        { summary:'新增母基金档案', field:'—', before:'—', after:'创建本机构管理基金「众源一号」', source:'系统', by:'菜菜', at:'2018-06-01 10:00' },
      ],
    },
    /* ② 所投子基金：GGV人民币二期 */
    {
      id:'f-ggv', name:'GGV人民币二期', fullName:'苏州纪源皓元创业投资合伙企业（有限合伙）',
      code:'SLK742', management:'external', strategy:'other', type:'所投子基金',
      status:'正常运作', manager:'宁波纪源投资管理有限公司',
      registeredPlace:'苏州市工业园区', established:'2019-12-18',
      direction:'前沿科技及智能硬件、企业服务/云、消费升级/新零售、互联网+/产业互联网', stageFocus:'早期和成长期及成熟期',
      investPeriod:'20年7月-23年12月', investPeriodEnd:'2023-12-31', duration:'3+4+2',
      team:'符绩勋、李宏玮、徐炳东', gpIrr:'—',
      /* 基金主体整体口径（万元）——对齐客户 template @20260331 */
      fundSize:160100, committed:160100, called:160100, distributed:12168.73,
      parallelCommitted:341000, parallelCalled:341000, totalExitAmount:12168.73,
      investRatio:'3.12%', investProgress:'83.4%',
      reportEndDate:'2026-03-31',
      /* 基金层：MOIC；众源 LP TVPI/DPI 见 fundRelations（材料未另披露 GP 口径 TVPI/DPI） */
      tvpi:1.76, dpi:0.08, moic:2.37,
      lastUpdate:'2026-04-15',
      /* LP 口径：众源一号对本基金的出资与分配 */
      fundRelations:[{
        fundId:'fund-1',
        firstInvestDate:'2019-12',
        committed:5000, called:5000,
        distributed:423.59,
        investmentCost:5000,
        periodEndNav:8394.6,
        period:'2026Q1',
        commitmentRatio:'3.12%',
        tvpi:1.76, dpi:0.08,
      }],
      periods:[
        { id:'2025Q2', label:'2025Q2', status:'done', moic:1.85, tvpi:1.60, dpi:0.06 },
        { id:'2025Q4', label:'2025Q4', status:'done', moic:2.05, tvpi:1.68, dpi:0.07 },
        { id:'2026Q1', label:'2026Q1', status:'done', moic:2.37, tvpi:1.76, dpi:0.08 },
      ],
      distributions:[
        /* 众源一号 LP 口径分配记录 */
        { date:'2026-05-20', amount:80, fromFund:'GGV人民币二期', exitCompany:'科亚医疗（部分退出）', totalDistributed:423.59, costRecovered:56, gainDistributed:24, distType:'现金分配', projectCostFund:560 },
      ],
      /* 底层项目概览（供基金详情页展示；数字对齐 template） */
      underlyingProjects:[
        { id:'ug-jd', name:'京东工业品', industry:'产业互联网', stage:'中后期', cost:6645.4, remain:6645.4, ratio:0.3531, fairValue:10423.61, exitStatus:'在管', projectId:'lt-ggv-jd', firstInvestDate:'2020-08' },
        { id:'ug-keya', name:'科亚医疗', industry:'科技', stage:'成长期', cost:3900, remain:2340, ratio:0.95, fairValue:3461.2, exitStatus:'在管', firstInvestDate:'2021-03' },
        { id:'ug-moore', name:'摩尔线程', industry:'科技', stage:'早期', cost:7200, remain:4985.17, ratio:0.6456, fairValue:160370.23, exitStatus:'在管', firstInvestDate:'2022-06' },
        { id:'ug-changrui', name:'长瑞光电', industry:'科技', stage:'早期', cost:1200, remain:0, ratio:0, fairValue:1200, exitStatus:'完全退出', exitAmount:1200, firstInvestDate:'2019-11' },
        { id:'ug-shenji', name:'申基生物', industry:'—', stage:'早期', cost:6387, remain:6387, ratio:2.4511, fairValue:8796.66, exitStatus:'在管', firstInvestDate:'2023-09' },
      ],
      materialFolders:[
        { id:'mf-ggv-1', name:'GP季报' },
        { id:'mf-ggv-2', name:'分配通知' },
        { id:'mf-ggv-3', name:'年度报告' },
      ],
      materials:[
        { id:'mat-ggv-1', name:'投后数据整理template.xlsx', type:'内部财务表', updatedAt:'2026-04-08', status:'待确认', size:'2.1MB', folder:'mf-ggv-1', tags:['2026Q1'] },
        { id:'mat-ggv-2', name:'GGV人民币二期-2026Q1季报.xlsx', type:'GP季报', updatedAt:'2026-04-28', status:'已归档', size:'1.9MB', folder:'mf-ggv-1', tags:['2026Q1'] },
        { id:'mat-ggv-3', name:'GGV人民币二期-分配通知-2026Q1.pdf', type:'分配通知', updatedAt:'2026-05-20', status:'已归档', size:'0.4MB', folder:'mf-ggv-2' },
        { id:'mat-ggv-4', name:'GGV人民币二期-2025年报.pdf', type:'年度报告', updatedAt:'2026-04-15', status:'已归档', size:'5.8MB', folder:'mf-ggv-3' },
      ],
      updates:[
        { summary:'确认写入 2026Q1 台账（基金 MOIC 2.37 · 众源 TVPI 1.76 · 底层 38 个项目）', field:'期间表现·2026Q1', before:'2025Q4 · TVPI 1.68', after:'2026Q1 · 众源 TVPI 1.76 / DPI 0.08 / 基金 MOIC 2.37', source:'解析·投后数据整理template.xlsx', by:'菜菜', at:'2026-04-08 17:40' },
        { summary:'资本账户期末余额更新为 8,394.6 万（众源 LP 口径）', field:'资本账户期末余额', before:'7,894.6 万', after:'8,394.6 万', source:'解析·资本账户表', by:'菜菜', at:'2026-04-08 17:42' },
        { summary:'登记分配到账 80 万（科亚医疗部分退出）', field:'分配流水', before:'—', after:'2026-05-18 · 80 万', source:'解析·分配通知', by:'菜菜', at:'2026-05-20 15:10' },
        { summary:'更新底层持仓：京东工业品公允价值 10,423.61 万 · MOIC 1.57x', field:'底层持仓·京东工业品', before:'—', after:'公允价值 10,423.61 万', source:'解析·投后数据整理template.xlsx', by:'菜菜', at:'2026-04-08 14:00' },
        { summary:'新增所投子基金档案', field:'—', before:'—', after:'创建「GGV人民币二期」', source:'系统', by:'菜菜', at:'2019-12-20 10:00' },
      ],
    },
  ];

  /* —— GP 收齐清单 —— */
  var GP_LIST = [
    { name:'宁波纪源投资管理有限公司（GGV）', arrived:true, lastReport:'2026Q2', daysAgo:3 },
    { name:'君联资本管理股份有限公司', arrived:true, lastReport:'2026Q2', daysAgo:5 },
    { name:'深创投集团', arrived:true, lastReport:'2026Q2', daysAgo:7 },
    { name:'华盖资本', arrived:true, lastReport:'2026Q2', daysAgo:10 },
    { name:'天图投资', arrived:true, lastReport:'2026Q2', daysAgo:12 },
    { name:'金沙江创业投资', arrived:false, lastReport:'2025FY', daysAgo:45 },
    { name:'红杉中国', arrived:false, lastReport:'2026Q1', daysAgo:20 },
    { name:'高瓴创投', arrived:false, lastReport:'—', daysAgo:90 },
  ];

  /* —— 问数问答对 —— */
  var QA = [
    {
      keys:['账面价值','一号基金','合计'],
      q:'众源一号账面价值合计多少',
      answer:'17,995 万',
      calc:'<code>众源一号</code> 关联直投 p-xinghe 公允价值 9,600 万 + 子基金 GGV人民币二期 LP 口径期末 NAV 8,394.6 万，合计 = <code>17,994.6 万</code>，约 17,995 万。数据截至 2026Q2。',
      source:'基金管理 → 众源一号 → 持股价值合计',
    },
    {
      keys:['星河','估值','持股'],
      q:'星河智造最新估值和持股比例',
      answer:'估值 80,000 万 / 持股 12%',
      calc:'2026年6月 B 轮融资后更新：估值 <code>50,000→80,000 万</code>，持股 <code>18%→12%</code>（光源创投、元生资本进入）。确认人：菜菜，确认时间：2026-07-15。',
      source:'项目库 → 星河智造 → 投资信息 → 股权事件',
    },
    {
      keys:['纪元','GGV','TVPI','回报'],
      q:'GGV人民币二期当前TVPI和DPI多少',
      answer:'众源 TVPI 1.76 / DPI 0.08 · 基金 MOIC 2.37',
      calc:'GGV人民币二期截至 2026-03-31：基金 MOIC <code>2.37</code>。众源一号 LP 口径：NAV 8,394.6 万，累计分配 423.59 万，LP-TVPI <code>1.76x</code>，DPI <code>0.08x</code>。本季材料未单独披露 GP 口径 TVPI／DPI。',
      source:'基金管理 → GGV人民币二期 → 出资与分配',
    },
    {
      keys:['未收齐','GP','到报','收齐'],
      q:'这个季度GP收齐情况怎么样',
      answer:'5 / 8 已到报',
      calc:'8 支子基金中已收到 5 支的 2026Q2 季报，仍有 <code>3 支未到报</code>（金沙江、红杉已超期，高瓴已超 90 天）。',
      source:'文件解析 → 收齐进度',
    },
    {
      keys:['京东工业品','估值','穿透'],
      q:'京东工业品最新估值是多少',
      answer:'D轮估值 150,000 万（15亿元）/ GGV持股 4.8%',
      calc:'GGV人民币二期底层项目京东工业品（客户 template @20260331）：公司最新投后估值 <code>2,952,166.9 万</code>，持股 <code>0.35%</code>，公允价值 <code>10,423.61 万</code>，MOIC <code>1.57x</code>。',
      source:'项目库 → 京东工业品（穿透） → 投资信息',
    },
  ];

  /* —— AI 建议映射（上传时按文件名建议） —— */
  var AI_SUGGEST = {
    '财报': { type:'财报', periodGuess:'2026H1' },
    '季报': { type:'GP季报', periodGuess:'2026Q2' },
    '资本账户': { type:'资本账户表', periodGuess:'2026Q2' },
    '分配': { type:'分配通知', periodGuess:'2026Q2' },
    'cap': { type:'股权文件', periodGuess:'—' },
  };

  /* —— 空间：用户按工作目的组合多个项目 —— */
  var SPACES = [
    {
      id: 'sp-post-plan', label: '投后跟踪', scope: 'mixed', desc: '2 个项目',
      projectIds: ['p-xinghe', 'lt-ggv-jd'], primaryProjectId: 'p-xinghe'
    },
    {
      id: 'sp-fund-review', label: '基金季报复盘', scope: 'mixed', desc: '1 个基金',
      projectIds: ['f-ggv'], primaryProjectId: 'f-ggv'
    },
  ];
  var CUSTOM_SPACES = [];

  /* —— 项目数据浏览器：指标维度树（业务域组织，非搜索框 alone） —— */
  var BROWSER_TREE = [
    { cat: '企业信息', items: [
      { key: 'industry', label: '所属行业' },
      { key: 'city', label: '所在城市' },
      { key: 'round', label: '投资轮次' },
      { key: 'stageIn', label: '投资阶段' }
    ]},
    { cat: '投资信息', items: [
      { key: 'ratio', label: '持股比例', unit: '%' },
      { key: 'investAmount', label: '投资金额', unit: '万元' },
      { key: 'valuation', label: '最新估值', unit: '万元' },
      { key: 'investDate', label: '投资日期' }
    ]},
    { cat: '回报指标', items: [
      { key: 'tvpi', label: 'TVPI' },
      { key: 'dpi', label: 'DPI' },
      { key: 'moic', label: 'MOIC' }
    ]},
    { cat: '期间数据', items: [
      { key: 'revenue', label: '营业收入', unit: '万元' },
      { key: 'netProfit', label: '净利润', unit: '万元' },
      { key: 'totalAssets', label: '总资产', unit: '万元' },
      { key: 'totalLiab', label: '总负债', unit: '万元' },
      { key: 'equity', label: '净资产', unit: '万元' }
    ]},
    { cat: '材料与披露', items: [
      { key: 'm-fin', label: '财报' },
      { key: 'm-gp', label: 'GP季报' },
      { key: 'm-supp', label: '补充材料' }
    ]},
    { cat: '外部情报', items: [
      { key: 'i-news', label: '舆情' },
      { key: 'i-law', label: '诉讼' },
      { key: 'i-chg', label: '工商变更' }
    ]}
  ];

  /* —— 项目数据浏览器：列定义（分组 + 口径/单位/来源） —— */
  var BROWSER_COLUMNS = [
    { group: '基础信息', cols: [
      { key: 'industry', label: '所属行业' },
      { key: 'city', label: '所在城市' },
      { key: 'round', label: '投资轮次' },
      { key: 'stageIn', label: '投资阶段' }
    ]},
    { group: '投资信息', cols: [
      { key: 'ratio', label: '持股比例', unit: '%', caliber: '最新', source: '项目库·投资信息' },
      { key: 'investAmount', label: '投资金额', unit: '万元', source: '项目库·投资信息' },
      { key: 'valuation', label: '最新估值', unit: '万元', source: '项目库·投资信息' },
      { key: 'investDate', label: '投资日期' }
    ]},
    { group: '回报指标', cols: [
      { key: 'tvpi', label: 'TVPI', caliber: '子基金', source: '基金管理·资本账户' },
      { key: 'dpi', label: 'DPI', caliber: '子基金', source: '基金管理·资本账户' },
      { key: 'moic', label: 'MOIC', caliber: '子基金', source: '基金管理·资本账户' }
    ]},
    { group: '材料与披露', cols: [
      { key: 'm-fin', label: '财报', caliber: '已解析' },
      { key: 'm-gp', label: 'GP季报', caliber: '已解析' },
      { key: 'm-supp', label: '补充材料' }
    ]},
    { group: '外部情报', cols: [
      { key: 'i-news', label: '舆情', source: '外部情报(未接入)' },
      { key: 'i-law', label: '诉讼', source: '外部情报(未接入)' },
      { key: 'i-chg', label: '工商变更', source: '外部情报(未接入)' }
    ]}
  ];

  /* —— 项目数据浏览器：模板（系统预设 + 我的） —— */
  var BROWSER_TEMPLATES = {
    system: [
      { id: 't-post', name: '投后跟踪模板', cols: ['industry','city','ratio','investAmount','valuation','revenue','netProfit','totalAssets','equity','m-fin'] },
      { id: 't-gp', name: 'GP季报审阅模板', cols: ['investAmount','tvpi','dpi','moic','m-gp'] },
      { id: 't-exit', name: '项目退出推演模板', cols: ['ratio','valuation','investAmount','m-fin','m-supp'] },
      { id: 't-compare', name: '底层项目横向对比模板', cols: ['industry','stageIn','investAmount','valuation','tvpi','dpi','moic'] }
    ],
    mine: [
      { id: 't-m1', name: '我的Q2复盘', cols: ['industry','ratio','revenue','netProfit','m-fin'] }
    ]
  };

  /* —— 专家市场 —— */
  var PE_EXPERTS = [
    { id:'ex-default', name:'小星', field:'财跃启明星默认助手', category:'default', summary:'小星是财跃启明星默认 AI 助手，具备公开企业数据查询能力，可承接风险扫描、企业初筛、材料分析与报告撰写等尽调任务。', tags:['找项目','快速初筛','批量对比打分','公开风险速览','标的速览','股权与实控','关键人风险','行业赛道分析','查材料缺口','投委会对抗预演'], visible:'core' },
    { id:'ex-ag-model', name:'财务建模专家', field:'DCF、LBO、三表、可比估值', category:'finance', summary:'按标的与假设集搭建机构级估值模型，输出单元格全公式、可平衡校验的工作簿。', tags:['DCF','LBO','三表模型','可比估值','模型审计'], visible:'core' },
    { id:'ex-ag-pitch', name:'投行路演专家', field:'估值材料、可比分析、路演稿', category:'finance', summary:'从标的公司与交易情境出发，独立完成估值工作簿与路演材料初稿，关键假设可复核、数字可溯源。', tags:['可比分析','DCF','LBO','路演稿','材料质检'], visible:'core' },
    { id:'ex-ag-market', name:'赛道研究专家', field:'行业概览、竞争格局、主题标的', category:'industry', summary:'输出行业空间、竞争格局、同业估值带与主题标的短名单，可附研究笔记或幻灯片大纲。', tags:['行业概览','竞争分析','可比估值','主题筛选'], visible:'core' },
    { id:'ex-ag-earnings', name:'业绩解读专家', field:'财报季点评、模型更新、业绩笔记', category:'finance', summary:'围绕单季业绩事件，解读披露与电话会要点，更新覆盖模型并起草业绩点评笔记。', tags:['业绩分析','模型更新','晨会笔记'], visible:'core' },
    { id:'ex-ag-kyc', name:'合规风控专家', field:'合规风控、准入材料、名单筛查', category:'risk', summary:'解析准入材料包，按机构规则做名单筛查与字段核验，输出待补件与升级项清单。', tags:['材料解析','规则筛查','表格整理'], visible:'core' },
    { id:'ex-fs-pe', name:'私募股权专家', field:'项目挖掘、尽调清单、投委会材料', category:'finance', summary:'面向一级市场股权投资项目，从赛道挖项目到立项尽调，输出可执行的筛选结论、尽调清单与投委会备忘录初稿。', tags:['项目挖掘','标的筛选','尽调清单','单元经济','投委会备忘录','组合监控'], visible:'core' },
    { id:'ex-fs-dd', name:'财务尽调专家', field:'同业对比、三表梳理、表格质检', category:'finance', summary:'在尽调阶段聚焦财务与业务数据质量，输出同业对比、三表骨架与可审计工作底稿，支撑估值与投委会讨论。', tags:['竞争分析','同业表','三表模型','表格审计','数据清洗'], visible:'core' },
    { id:'ex-fs-theme', name:'主题挖项目专家', field:'主题筛选、赛道论点、催化跟踪', category:'industry', summary:'从宏观与产业变化出发，提炼可投资主题与论点，跟踪催化并给出 3-5 家一级市场标的短名单。', tags:['主题构思','赛道论点','催化跟踪','标的短名单'], visible:'core' },
    { id:'ex-fs-ib', name:'并购交易专家', field:'Teaser、CIM、买方名单、并购模型', category:'finance', summary:'围绕并购或融资交易，从 teaser 到 CIM、买方名单与示意并购模型，整理可对外沟通的交易材料包。', tags:['Teaser','CIM','买方名单','并购模型','交易跟踪'], visible:'core' },
  ];

  /* —— 能力市场：技能 —— */
  var PE_SKILLS = [
    { id:'dd-target-brief', name:'标的速览', category:'公开查询', desc:'一页式企业基本面与核心风险速览，适合初筛与内部汇报。', visible:'core' },
    { id:'dd-entity-anchor', name:'主体锚定核验', category:'公开查询', desc:'尽调前确认目标主体：工商照面、股权结构与主要风险信号。', visible:'core' },
    { id:'dd-cap-table', name:'股权结构穿透', category:'公开查询', desc:'多层股权结构解析，标注实控人、一致行动与隐性关联。', visible:'core' },
    { id:'dd-beneficial-owner', name:'受益所有人识别', category:'公开查询', desc:'穿透股权识别最终受益人与实控关系。', visible:'core' },
    { id:'dd-key-person', name:'关键人背景核查', category:'公开查询', desc:'董监高及实控人的司法、任职与关联企业风险画像。', visible:'core' },
    { id:'dd-judicial-scan', name:'司法风险扫描', category:'公开查询', desc:'企业与核心人员的诉讼、执行与限高等司法风险分层梳理。', visible:'core' },
    { id:'pe-funding-track', name:'融资历程梳理', category:'公开查询', desc:'追溯历次融资与股权变化，辅助理解估值与条款演变。', visible:'core' },
    { id:'dd-corporate-timeline', name:'沿革时间线', category:'公开查询', desc:'按时间线梳理工商变更、股权演变与关键里程碑。', visible:'core' },
    { id:'dd-ip-inventory', name:'知产资产盘点', category:'深度尽调', desc:'专利、商标与软著清单及有效性状态快速盘点。', visible:'core' },
    { id:'pe-peer-compare', name:'同业横向对比', category:'筛选', desc:'多家主体的工商、知产与经营信号横向对比。', visible:'core' },
    { id:'dd-business-signals', name:'经营信号扫描', category:'深度尽调', desc:'结合招聘、中标与舆情等信号判断经营活跃度。', visible:'core' },
    { id:'pe-ic-skeleton', name:'IC 骨架整理', category:'投委会', desc:'立项阶段把工商、股权、司法与知产要点整理成投委会备忘录骨架。', visible:'core' },
    { id:'dd-checklist', name:'尽调材料清单', category:'深度尽调', desc:'对照尽调清单识别材料缺口与矛盾点，适用于查材料缺口等场景。', visible:'core' },
    { id:'dd-meeting-prep', name:'访谈准备', category:'访谈', desc:'公开资料先行，按投资假设路由外部专家，生成外部专家访谈提纲与管理层访谈提纲双版本。', visible:'core' },
    { id:'hv-analysis', name:'横纵赛道分析', category:'筛选', desc:'横纵分析法：纵轴追赛道演变，横轴对比竞争格局，交汇产出 PE 五维赛道初判。', visible:'core' },
    { id:'returns-analysis', name:'PE回报测算', category:'估值', desc:'PE 回报：假设进固定引擎出 MOIC/IRR/敏感性；禁止 AI 手算。', visible:'core' },
    { id:'post-distress-watch', name:'困境预警监控', category:'投后', desc:'破产重整、清算公告等节点的持续监控与提醒。', visible:'core' },
    { id:'dd-signatory-check', name:'签约主体核验', category:'深度尽调', desc:'签约前快速确认相对方存续、法代与经营异常。', visible:'advanced' },
    { id:'dd-labor-risk', name:'用工合规排查', category:'深度尽调', desc:'劳动仲裁、社保欠缴与行政处罚等用工风险排查。', visible:'advanced' },
    { id:'dd-ip-conflict', name:'知产冲突预警', category:'深度尽调', desc:'商标近似与专利覆盖范围的潜在冲突识别。', visible:'advanced' },
    { id:'dd-license-check', name:'资质证照核验', category:'深度尽调', desc:'行业许可与证照有效期的批量核验与到期提示。', visible:'advanced' },
    { id:'ic-debate', name:'投委会对抗预演', category:'上会交付', desc:'红蓝对抗：红方看多 vs 蓝方看空，逐论点交锋后输出综合裁定与上会建议。', visible:'core' },
  ];

  /* —— 投委会对抗预演（红蓝对抗）· 对齐 agent-demo 仙工智能报告 —— */
  var PE_DEBATE = {
    target: '仙工智能（06106.HK）',
    summary: [
      ['公司全称', '上海仙工智能科技股份有限公司'],
      ['核心定位', '以机器人控制器（"机器人大脑"）为核心的智能机器人公司'],
      ['2025 年营收', '4.42 亿元（三年 CAGR 33.2%）'],
      ['2025 年净亏损', '4,707 万元（经调整 287 万元）'],
      ['控制器全球市占率', '24.8%（按销量，全球第一）'],
      ['当前市值 / 估值', '约 89.45 亿港元 / 约 20 倍 PS'],
      ['基石投资者', '高瓴 HHLRA 领衔等 8 家，认购 43.34%'],
    ],
    red: [
      { t:'技术壁垒：控制器全球第一，SRC 生态护城河', d:'SRC 控制器全球市占率 24.8%、中国 45.2%，连续三年第一；适配 400+ 核心零部件、支持 2,000+ SKU；服务 2,100+ 集成商，客户复购率超 60%。开放平台不造整机与客户竞争，对标英伟达生态逻辑。' },
      { t:'赛道红利：具身智能写入十五五规划，万亿市场', d:'2025 年具身智能首次写入《政府工作报告》，2026 年被视为产业拐点。36氪研究院数据：2025 年市场规模约 9,150 亿元，2026 年预计突破万亿。仙工智能作为"机器人大脑第一股"占据核心环节先发优势。' },
      { t:'盈利拐点临近：经调整亏损收窄 86.3%', d:'2023-2025 年经调整净亏损从 2,091 万元收窄至 287 万元，降幅 86.3%；营收三年 CAGR 33.2%，2025 年出货量超 12,000 台、同比 +70%，正逼近盈亏平衡点。' },
      { t:'豪华基石背书：高瓴领衔，市场认购热情极高', d:'8 家基石合计认购 4.62 亿港元、占发行规模 43.34%，高瓴 HHLR 领衔；公开发售获 5,934 倍超额认购，国际配售 21.29 倍，一手中签率仅 5%。' },
    ],
    blue: [
      { t:'持续亏损，盈利时间表不明确', d:'2023-2025 三年累计净亏损 1.37 亿元，公司预计 2026 年仍亏损。亏损收窄速度放缓（2024 年降幅 43%、2025 年 76%），盈利路径依赖规模效应，实现需要时间。' },
      { t:'业务结构倒挂：从"卖大脑"滑向"组装厂"', d:'高毛利控制器收入占比从 2023 年 26.5% 降至 2025 年 19.3%，低毛利整机占比从 59.8% 升至 67.9%（毛利率仅 38.4%）。叙事是"机器人大脑"，实际已演变为整机组装为主。' },
      { t:'以价换量效果有限：降价 58.7% 仅换 1.2pct 市占率', d:'控制器单价从 2.59 万元降至 1.07 万元，但全球市占率仅从 23.6% 升至 24.8%。需求并非价格敏感型，降价侵蚀核心毛利率（85.2%→79.8%），不可持续。' },
      { t:'现金流持续恶化，应收高企', d:'经营现金流从 2023 年净流入 1,032 万转为 2024-2025 年净流出（-2,780 万）；应收账款周转天数从 61 天翻倍至 111 天，2025 年近四成收入尚未到账。' },
    ],
    verdict: {
      title: '有条件审慎参与，不建议在当前价位重仓配置',
      conflicts: [
        '叙事与现实的错位：以"机器人大脑"定位获得高估值溢价，但收入结构已以低毛利整机为主（67.9%），估值逻辑有从技术平台切换为组装厂的风险。',
        '以价换量有效性存疑：降价近 60% 仅换来 1.2pct 市占率提升，降价策略边际效益递减。',
        '现金流恶化超预期：经营现金流转负且扩大，应收账款周转天数翻倍至 111 天。',
        '竞争格局不利：极智嘉已盈利且营收为仙工 7 倍，海康机器人营收为 14.6 倍，大厂自研控制器趋势不利。',
      ],
      scores: [
        ['技术壁垒', 4, '控制器全球第一，生态有护城河'],
        ['赛道前景', 5, '具身智能为十五五重点未来产业'],
        ['财务健康', 2, '持续亏损，现金流恶化，应收高企'],
        ['业务结构', 2, '高毛利核心产品占比持续下滑'],
        ['竞争格局', 2, '极智嘉已盈利，大厂自研趋势不利'],
      ],
      advice: '不建议在当前价位（约 20 倍 PS）建仓或重仓；若股价回落至 40-50 港元区间（PS 10-12 倍）可小仓位布局；关注 2026 年报三指标：控制器收入占比、经营现金流、控制器单价。',
    },
  };

  /* —— 能力市场：连接器 —— */
  var PE_CONNECTORS = [
    { id:'c1', name:'企查查', desc:'工商 / 司法 / 股权 / 高管数据', status:'connected' },
    { id:'c2', name:'OCR 识别', desc:'财报 / 合同 / 股权文件识别', status:'connected' },
    { id:'c3', name:'邮件催收', desc:'GP 收齐催收与通知发送', status:'connected' },
    { id:'c4', name:'飞书协作', desc:'任务分发与纪要同步', status:'off' },
    { id:'c5', name:'Wind', desc:'宏观与行业数据接入', status:'off' },
  ];

  /* —— 对话数据（独立 + 项目绑定） —— */
  var CHATS = [
    {
      id: 'chat-1', type: 'standalone', title: '众源一号 Q2 复盘', time: '今天 09:32',
      preview: '正在整理众源一号 2026Q2 持仓与回报数据…',
      messages: [
        { role:'user', text:'帮我复盘下众源一号这个季度的表现', time:'09:32' },
        { role:'ai', text:'已基于已确认数据整理众源一号 2026Q2 复盘要点。本季度直投项目星河智造 B 轮完成估值提升，GGV人民币二期 LP 口径期末 NAV 8,394.6 万，合并账面价值约 17,995 万，整体 TVPI 1.82。', time:'09:32',
          thinking:['识别报告期间：2026Q2','读取已确认的 2 个项目数据','按基金汇总持股价值（直投+子基金NAV）','生成复盘摘要'],
          tools:[
            { name:'读取已确认数据', detail:'FUNDS · 众源一号 · 2 个关联实体', status:'done' },
            { name:'计算回报指标', detail:'TVPI 1.82 · DPI 0.52', status:'done' },
            { name:'生成复盘摘要', detail:'Markdown · 3 段要点', status:'done' },
          ],
          result:'已汇总 2 个实体 · 账面价值 17,995 万',
          cards:[
          { type:'metric', title:'众源一号 · 2026Q2 概览', rows:[['账面价值合计','17,995 万'],['直投（星河智造）','9,600 万'],['子基金NAV（GGV LP口径）','8,394.6 万'],['TVPI','1.82'],['DPI','0.52'],['本季新增确认','1 份']] },
          { type:'flags', title:'建议下一步', items:['GGV 2026Q2 季报解析中，1 个字段待确认','金沙江/红杉/高瓴 3 支 GP 未到报，建议催收','星河智造 2026H1 财报待确认（净利润勾稽差异 70 万）'] },
        ]},
        { role:'user', text:'GGV这次季报有什么需要确认的', time:'09:34' },
        { role:'ai', text:'GGV人民币二期 2026Q2 季报共 9 个字段，均已通过解析，1 个主要核对点：底层项目京东工业品已在系统中建档（lt-ggv-jd），实体匹配状态为已确认。整体试算平衡通过。', time:'09:34',
          thinking:['定位文件：fp3','读取季报字段映射结果','检查底层项目匹配状态'],
          tools:[
            { name:'读取季报', detail:'GGV人民币二期-2026Q2季报.xlsx · 3 个工作表', status:'done' },
            { name:'对比底层项目', detail:'京东工业品 → lt-ggv-jd · 已匹配', status:'done' },
          ],
          result:'9 个字段全部通过，试算平衡 OK',
          cards:[
          { type:'brief', title:'解析概览', rows:[['文件','GGV人民币二期-2026Q2季报.xlsx'],['字段总数','9'],['冲突','0'],['实体匹配','京东工业品 → lt-ggv-jd'],['试算平衡','通过']] },
        ]},
      ],
    },
    {
      id: 'chat-2', type: 'project', projectId: 'p-xinghe', title: '星河智造 · 投后跟踪', time: '昨天 16:20',
      preview: '星河智造 2026H1 财报已解析，3 项待确认…',
      messages: [
        { role:'user', text:'星河智造最新的财务数据怎么样', time:'16:20' },
        { role:'ai', text:'星河智造 2026H1 财报已解析完成，共 4 个字段待确认。营收同比增长、净利润有所下滑，主要受研发投入增加影响。', time:'16:20',
          thinking:['定位文件：2026H1-补充材料.pdf','读取三张报表的候选字段','执行勾稽校验（收入-成本-费用=净利润）','对比上期 2025FY 变动'],
          tools:[
            { name:'解析财报', detail:'星河智造-2026H1-补充材料.pdf · 原生PDF直读', status:'done' },
            { name:'映射科目', detail:'4 个字段 · 1 个 AI 兜底（应收账款-净值）', status:'done' },
            { name:'试算平衡', detail:'净利润勾稽差异 70', status:'done' },
          ],
          result:'解析 4 个字段 · 试算差异 1 项',
          cards:[
          { type:'table', title:'2026H1 关键财务', headers:['科目','2025FY','2026H1','变动'], rows:[['营业收入','12,800','8,900','+H1已达全年69%'],['净利润','1,820','1,450','↓ 同比'],['资产总计','45,000','48,000','+6.7%']] },
          { type:'flags', title:'待确认项', items:['净利润勾稽差异 70（报表1,450 vs 计算1,520）','应收账款科目需拆分（应收账款+应收票据）','B轮融资后持股 18%→12% 已确认'] },
        ]},
        { role:'user', text:'去确认一下这些数据', time:'16:22' },
        { role:'ai', text:'已为你打开星河智造-2026H1-补充材料.pdf 的确认页，左侧为原文表格，右侧为候选字段。差异行已用粉橙底色标记，点击"定位"可跳转原文对应位置。', time:'16:22',
          thinking:['打开确认页：fp4','加载原文表格','定位差异行：净利润','生成试算明细'],
          tools:[
            { name:'打开确认页', detail:'confirm/fp4 · 三张报表 Tab', status:'done' },
            { name:'定位差异', detail:'净利润 · 勾稽差异 70', status:'done' },
          ],
          result:{ text:'确认页已就绪 · 4 个字段待接受/驳回', nav:'confirm/fp4' },
        },
      ],
    },
    {
      id: 'chat-3', type: 'project', projectId: 'f-ggv', title: 'GGV人民币二期 · 季报核对', time:'2天前',
      preview: '正在核对 GGV人民币二期 2026Q2 季报字段…',
      messages: [
        { role:'user', text:'帮我核对下GGV人民币二期的季报', time:'14:05' },
        { role:'ai', text:'GGV人民币二期 2026Q2 季报已解析，共 9 个字段，众源一号 LP 口径认缴/实缴 5,000 万，期末 NAV 8,394.6 万，累计分配 423.59 万，试算平衡通过。底层项目京东工业品已自动匹配至系统中的 lt-ggv-jd。', time:'14:05',
          thinking:['解析 Excel 单元格：GGV人民币二期-2026Q2季报.xlsx','映射 9 个字段到标准科目','执行试算平衡（认缴=实缴+未call）','识别底层项目并匹配系统 ID'],
          tools:[
            { name:'读取 Excel', detail:'GGV人民币二期-2026Q2季报.xlsx · 3 个工作表', status:'done' },
            { name:'字段映射', detail:'9 个字段 · 全部通过', status:'done' },
            { name:'试算平衡', detail:'认缴=实缴+未call · 通过', status:'done' },
          ],
          result:'解析 9 个字段 · 试算平衡通过',
          cards:[
          { type:'brief', title:'LP口径核心数据', rows:[['认缴金额','5,000万'],['实缴金额','5,000万'],['累计分配','423.59万'],['期末NAV（众源口径）','8,394.6万'],['LP-TVPI','1.76x'],['DPI','0.08x']] },
        ]},
      ],
    },
  ];

  /* —— 科目配置（财评助手迁移） —— */
  var FINANCE_CONFIGS = {
    active: 'tenant-1',
    list: [
      { id:'platform', name:'平台标准科目库', scope:'platform', desc:'财政部 2019 修订版 60+ 科目，全行业通用' },
      { id:'tenant-1', name:'众源资本科目库', scope:'tenant', desc:'基于平台标准，补充私募行业专用科目与别名' },
    ],
    configs: {
      'tenant-1': {
        subjects: {
          'is': [
            { id:'is-1', name:'营业收入', aliases:'营业收入,主营业务收入,营收,收入' },
            { id:'is-2', name:'营业成本', aliases:'营业成本,主营业务成本,成本' },
            { id:'is-3', name:'税金及附加', aliases:'税金及附加,营业税金及附加' },
            { id:'is-4', name:'销售费用', aliases:'销售费用,营业费用' },
            { id:'is-5', name:'管理费用', aliases:'管理费用' },
            { id:'is-6', name:'研发费用', aliases:'研发费用,研究开发费用' },
            { id:'is-7', name:'财务费用', aliases:'财务费用' },
            { id:'is-8', name:'营业利润', aliases:'营业利润' },
            { id:'is-9', name:'利润总额', aliases:'利润总额,税前利润' },
            { id:'is-10', name:'净利润', aliases:'净利润,净亏损,归属母公司净利润' },
          ],
          'bs': [
            { id:'bs-1', name:'货币资金', aliases:'货币资金,现金及等价物' },
            { id:'bs-2', name:'应收票据及应收账款', aliases:'应收票据及应收账款,应收账款,应收票据' },
            { id:'bs-3', name:'应收账款', aliases:'应收账款,应收账款净额' },
            { id:'bs-4', name:'存货', aliases:'存货,库存' },
            { id:'bs-5', name:'流动资产合计', aliases:'流动资产合计,流动资产' },
            { id:'bs-6', name:'资产总计', aliases:'资产总计,总资产,资产合计' },
            { id:'bs-7', name:'流动负债合计', aliases:'流动负债合计,流动负债' },
            { id:'bs-8', name:'负债合计', aliases:'负债合计,总负债' },
            { id:'bs-9', name:'所有者权益合计', aliases:'所有者权益合计,净资产,股东权益' },
          ],
          'cf': [
            { id:'cf-1', name:'经营活动现金流入小计', aliases:'经营活动现金流入,经营现金流入' },
            { id:'cf-2', name:'经营活动现金流出小计', aliases:'经营活动现金流出,经营现金流出' },
            { id:'cf-3', name:'经营活动产生的现金流量净额', aliases:'经营活动现金流量净额,经营现金流净额' },
            { id:'cf-4', name:'投资活动产生的现金流量净额', aliases:'投资活动现金流量净额,投资现金流净额' },
            { id:'cf-5', name:'筹资活动产生的现金流量净额', aliases:'筹资活动现金流量净额,筹资现金流净额' },
            { id:'cf-6', name:'现金及现金等价物净增加额', aliases:'现金净增加额,现金及等价物净增加' },
          ],
        },
        metrics: [
          { id:'m-1', name:'毛利率', unit:'%', formula:'(营业收入 - 营业成本) / 营业收入 × 100%', desc:'反映主营业务盈利能力' },
          { id:'m-2', name:'净利率', unit:'%', formula:'净利润 / 营业收入 × 100%', desc:'反映最终盈利水平' },
          { id:'m-3', name:'资产负债率', unit:'%', formula:'负债合计 / 资产总计 × 100%', desc:'反映财务杠杆' },
          { id:'m-4', name:'流动比率', unit:'倍', formula:'流动资产合计 / 流动负债合计', desc:'反映短期偿债能力' },
          { id:'m-5', name:'ROE', unit:'%', formula:'净利润 / 所有者权益合计 × 100%', desc:'净资产收益率' },
          { id:'m-6', name:'TVPI', unit:'倍', formula:'(累计分配 + NAV) / 实缴', desc:'子基金投入资本倍数' },
          { id:'m-7', name:'DPI', unit:'倍', formula:'累计分配 / 实缴', desc:'投入资本现金回报率' },
        ],
        rules: [
          { id:'r-1', name:'资产=负债+权益', type:'balance', stmt:'bs', formula:'资产总计 = 负债合计 + 所有者权益合计', enabled:true },
          { id:'r-2', name:'收入-成本-费用=净利润', type:'balance', stmt:'is', formula:'营业收入 - 营业成本 - 税金及附加 - 期间费用 = 净利润', enabled:true },
          { id:'r-3', name:'经营现金流勾稽', type:'balance', stmt:'cf', formula:'经营流入 - 经营流出 = 经营净额', enabled:true },
          { id:'r-4', name:'跨表勾稽：净利润→未分配利润', type:'cross', stmt:'is→bs', formula:'利润表净利润 = 资产负债表未分配利润本期增加', enabled:true },
          { id:'r-5', name:'跨表勾稽：现金流净额', type:'cross', stmt:'cf→bs', formula:'现金净增加额 = 货币资金期末-期初', enabled:true },
          { id:'r-6', name:'变动阈值预警', type:'threshold', stmt:'all', formula:'同科目环比变动超 ±20% 标记差异', enabled:true },
        ],
        periodCalibers: [
          { id:'p-1', name:'月度累计+当月', desc:'月报常见：累计列+当月列', accumulation:true, singleMonth:true },
          { id:'p-2', name:'月度逐月', desc:'每月独立一列', accumulation:false, singleMonth:false },
          { id:'p-3', name:'季度累计+当季', desc:'季报常见：H1累计+Q2单季', accumulation:true, singleQuarter:true },
          { id:'p-4', name:'季度累计+当月', desc:'季度累计+当月数据', accumulation:true, singleMonth:true },
          { id:'p-5', name:'季度仅累计', desc:'仅累计数，单季需倒减', accumulation:true, singleQuarter:false, deriveSingle:true },
        ],
        mappingStrategies: [
          { id:'s-1', name:'精确匹配', desc:'原始科目名 = 标准科目名', priority:1, example:'营业收入 → 营业收入' },
          { id:'s-2', name:'包含匹配', desc:'原始名包含标准名或其别名', priority:2, example:'应收账款净额 → 应收账款' },
          { id:'s-3', name:'正则匹配', desc:'按正则规则匹配复杂命名', priority:3, example:'/应付.*账款/ → 应付账款' },
          { id:'s-4', name:'AI 语义兜底', desc:'以上均未命中，AI 语义理解匹配', priority:4, example:'本期收入合计 → 营业收入', fallback:true },
        ],
        fundFields: [
          { id:'ff-1', name:'基金规模', aliases:'基金规模,认缴规模,目标规模', unit:'万元', layer:'fund', priority:'gp-report', method:'extract', required:true },
          { id:'ff-2', name:'认缴金额', aliases:'认缴金额,累计认缴,Total Commitment', unit:'万元', layer:'fund', priority:'gp-report', method:'extract', required:true },
          { id:'ff-3', name:'实缴金额', aliases:'实缴金额,累计实缴,累计call款,Paid-in', unit:'万元', layer:'fund', priority:'gp-report', method:'extract', required:true },
          { id:'ff-4', name:'累计分配', aliases:'累计分配,累计回款,Distribution', unit:'万元', layer:'fund', priority:'capital-account', method:'extract', required:false },
          { id:'ff-5', name:'期末净值', aliases:'NAV,期末净值,净资产', unit:'万元', layer:'fund', priority:'gp-report', method:'extract', required:true },
          { id:'ff-6', name:'TVPI', aliases:'TVPI,投入资本倍数', unit:'x', layer:'fund', priority:'gp-report', method:'compute', required:true },
          { id:'ff-7', name:'DPI', aliases:'DPI,现金回报率', unit:'x', layer:'fund', priority:'gp-report', method:'compute', required:true },
          { id:'ff-8', name:'投资成本', aliases:'投资成本,投资金额,投资总额,Cost', unit:'万元', layer:'underlying', priority:'gp-report', method:'extract', required:true },
          { id:'ff-9', name:'剩余投资成本', aliases:'剩余成本,未退出成本,Remaining Cost', unit:'万元', layer:'underlying', priority:'gp-report', method:'compute', required:false },
          { id:'ff-10', name:'持股比例', aliases:'持股比例,股权比例,Ownership', unit:'%', layer:'underlying', priority:'gp-report', method:'extract', required:true },
          { id:'ff-11', name:'公允价值', aliases:'公允价值,当前估值,Fair Value', unit:'万元', layer:'underlying', priority:'gp-report', method:'extract', required:true },
          { id:'ff-12', name:'MOIC', aliases:'MOIC,回报倍数', unit:'x', layer:'underlying', priority:'gp-report', method:'compute', required:false },
        ],
      },
    },
  };

  /* —— 对话场景 chips —— */
  var CHAT_SCENARIOS = [
    { key:'fin', label:'问财报数据' },
    { key:'val', label:'查估值' },
    { key:'summary', label:'生成摘要' },
    { key:'compare', label:'横向对比' },
    { key:'report', label:'生成季报' },
  ];

  /* —— 子基金档案 Mock：GGV人民币二期 —— */
  window.PE_POST_SUBFUND_MOCK = {
    id: 'f-ggv',
    企业完整名称: 'GGV人民币二期（苏州纪源皓元创业投资合伙企业（有限合伙））',
    归属母基金: { id: 'fund-1', name: '众源一号私募股权投资基金' },
    GP基本信息: { GP名称: '宁波纪源投资管理有限公司', 成立年份: '2019', 管理规模: '160,100万元', 数据来源标注: 'GGV人民币二期LP季报' },
    众源投资情况: {
      认缴金额: 5000, 实缴金额: 5000, 分配金额: 423.59, 期末账户余额: 8394.6,
      TVPI: 1.76, DPI: 0.08, MOIC: 2.37, 数据期间: '2026Q1'
    },
    底层项目: [
      { id: 'lt-ggv-jd', 企业名称: '北京京东叁佰陆拾度电子商务有限公司', 持仓成本: 6645.4, 剩余成本: 6645.4, 持股比例: '0.35%', 公允价值: 10423.61, 退出状态: '在管', 所在阶段: '中后期' },
      { id: 'ug-keya', 企业名称: '科亚医疗科技股份有限公司', 持仓成本: 3900, 剩余成本: 2340, 持股比例: '0.95%', 公允价值: 3461.2, 退出状态: '在管', 所在阶段: '成长期' },
      { id: 'ug-moore', 企业名称: '摩尔线程智能科技（北京）有限责任公司', 持仓成本: 7200, 剩余成本: 4985.17, 持股比例: '0.65%', 公允价值: 160370.23, 退出状态: '在管', 所在阶段: '早期' },
    ],
    基金表现: { TVPI: 1.76, DPI: 0.08, MOIC: 2.37, 数据期间: '2026Q1' },
    数据来源标注: '投后数据整理template.xlsx · 20260331',
  };

  /* —— 底层项目档案 Mock：京东工业品（lt-ggv-jd） —— */
  window.PE_POST_FOF_PROJECT_MOCK = (function () {
    var p = PROJECTS.filter(function(x){ return x.id === 'lt-ggv-jd'; })[0] || {};
    return {
      id: 'lt-ggv-jd',
      企业完整名称: '北京京东叁佰陆拾度电子商务有限公司',
      所属行业: '产业互联网',
      细分行业: '工业品B2B',
      主营业务: p.mainBusiness || '—',
      省: '北京', 市: '北京', 区: '北京经济技术开发区',
      投资阶段: '中后期',
      数据来源标注: '投后数据整理template.xlsx · 20260331',
      归属子基金: { id: 'f-ggv', 来源基金名称: 'GGV人民币二期', 来源基金GP: '宁波纪源投资管理有限公司', 是否平行基金: true },
      穿透投资: {
        本子基金口径: { 投资金额: 6645.4, 剩余投资成本: 6645.4, 最新持股比例: '0.35%', 已实现价值: 0, 未实现价值: 10423.61, 项目公允价值: 10423.61, 回报倍数: 1.57 },
      },
      投后情况: { 退出状态: '在管', 最新投后估值: '2,952,166.9万元', 融资轮次: 'A轮', 最新更新: '2026-04-08' },
      外部数据_企查查: p.externalPublic || {},
    };
  })();

  /* —— 直投项目档案 Mock（thin alias，实体数据已在 PROJECTS[p-xinghe].externalPublic） —— */
  window.PE_POST_DIRECT_PROJECT_MOCK = (function () {
    var p = PROJECTS.filter(function(x){ return x.id === 'p-xinghe'; })[0] || {};
    return { 'p-xinghe': { 外部数据_企查查: p.externalPublic || {} } };
  })();

  window.PE_POST_DATA = {
    PROJECTS: PROJECTS,
    FILES: FILES,
    CONFIRMS: CONFIRMS,
    FUNDS: FUNDS,
    GP_LIST: GP_LIST,
    QA: QA,
    AI_SUGGEST: AI_SUGGEST,
    SPACES: SPACES,
    CUSTOM_SPACES: CUSTOM_SPACES,
    BROWSER_TREE: BROWSER_TREE,
    BROWSER_COLUMNS: BROWSER_COLUMNS,
    BROWSER_TEMPLATES: BROWSER_TEMPLATES,
    PE_EXPERTS: PE_EXPERTS,
    PE_SKILLS: PE_SKILLS,
    PE_CONNECTORS: PE_CONNECTORS,
    PE_DEBATE: PE_DEBATE,
    CHATS: CHATS,
    FINANCE_CONFIGS: FINANCE_CONFIGS,
    CHAT_SCENARIOS: CHAT_SCENARIOS,
  };
})();
