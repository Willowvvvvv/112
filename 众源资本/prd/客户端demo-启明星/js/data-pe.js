/**
 * 启明星完整能力 Demo · PE 工作台 Mock 数据
 * 全局：window.PE_DATA
 */
(function () {
  'use strict';

  var projects = [
    {
      id: 'p-xinghe',
      name: '星河智造',
      company: '星河智造科技有限公司',
      status: '尽调',
      creditCode: '91310115MA1K3X8R2P',
      owner: '王敏',
      updated: '今天 09:12',
      todo: '估值更新待确认',
      sector: '工业自动化 / 智能制造',
      stage: 'B 轮',
      profile: {
        legalRep: '陈志远',
        regCapital: '5000 万人民币',
        founded: '2016-03-18',
        address: '上海市浦东新区张江路 88 号',
        status: '存续',
        industry: '工业机器人及系统集成',
        employees: '420+',
        summary:
          '主营工业视觉引导与柔性装配产线；客户覆盖汽车零部件与 3C 代工。近三年营收 CAGR 约 38%，毛利率 32–35%。本轮拟融资 1.2 亿，投前估值 8 亿。',
      },
      materials: [
        { name: '审计报告 2024', status: '已解析', source: '上传' },
        { name: '银行流水 2025Q1', status: '待确认', source: '飞书' },
        { name: '工商档案', status: '已入库', source: '财跃启明星' },
        { name: '核心客户合同抽样', status: '缺口', source: '—' },
        { name: '专利与软著清单', status: '已解析', source: '上传' },
      ],
      chats: [
        {
          id: 'c-xh-1',
          title: '星河智造 · 公开面核查',
          preview: '实控人陈志远 Indirect 持股 47.6955%，无失信',
          messages: [
            { role: 'user', text: '对星河智造做公开面核查，重点看股权与司法' },
            {
              role: 'ai',
              text: '已完成公开面速览。',
              cards: [
                {
                  type: 'brief',
                  title: '标的速览',
                  rows: [
                    ['主体', '星河智造科技有限公司'],
                    ['存续', '存续 · 2016 成立'],
                    ['实控人', '陈志远 · 总持股 47.6955%'],
                    ['司法', '未发现失信 / 限高 / 被执行'],
                  ],
                },
                {
                  type: 'flags',
                  title: '关注点',
                  items: [
                    '近 12 个月股权两次变更，需核对一致行动协议',
                    '前五大客户集中度约 61%，合同抽样仍缺',
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'c-xh-2',
          title: '星河智造 · 估值更新',
          preview: '建议投前 7.5–8.5 亿区间',
          messages: [
            { role: 'user', text: '根据审计与流水，更新本轮估值建议' },
            {
              role: 'ai',
              text: '已按可比与 DCF 交叉给出区间。',
              cards: [
                {
                  type: 'kv',
                  title: '估值建议（待确认）',
                  rows: [
                    ['投前估值', '7.5–8.5 亿元'],
                    ['本轮金额', '1.0–1.2 亿元'],
                    ['建议持股', '12–14%'],
                    ['关键假设', '2025 营收 3.8 亿 · 净利率 11%'],
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'c-xh-3',
          title: '星河智造 · 收入结构分析',
          preview: '收入结构深度分析已完成，可查看完整报告',
          messages: [
            { role: 'user', text: '整理星河智造收入结构分析报告，重点看主营构成与客户集中度' },
            {
              role: 'ai',
              text: '已完成收入结构深度分析。融资租赁类业务占主导，客户集中度高于同业均值，需关注续约节点。',
              cards: [
                {
                  type: 'report-open',
                  title: '收入结构深度分析',
                  reportId: 'rpt-xh-revenue',
                  subtitle: '2 个章节 · 3 条关键发现 · 4 条溯源',
                },
              ],
            },
          ],
        },
      ],
      ubo: [
        {
          name: '陈志远',
          pct: '47.6955%',
          standard: '标准一',
          path: '本人直接 28.2000% + 星河合伙 19.4955%',
        },
        {
          name: '星河智造员工持股平台（有限合伙）',
          pct: '19.4955%',
          standard: '持股平台',
          path: 'GP：陈志远；LP 为核心员工',
        },
        {
          name: '浦东科创投资有限公司',
          pct: '15.0000%',
          standard: '机构股东',
          path: '直接持股',
        },
        {
          name: '张薇',
          pct: '8.5000%',
          standard: '标准一',
          path: '直接持股（财务投资人）',
        },
      ],
      financeFindings: [
        {
          item: '营收与流水匹配',
          level: '中',
          note: '2024 审计营收 2.91 亿，流水口径覆盖约 86%，差额多在年末回款',
        },
        {
          item: '应收账款周转',
          level: '高',
          note: '周转天数升至 118 天，较同行中位偏高 30 天',
        },
        {
          item: '关联交易',
          level: '低',
          note: '与实控人关联方采购占比 <3%，金额披露完整',
        },
        {
          item: '存货跌价',
          level: '中',
          note: '定制产线在制存货增加，需核对订单覆盖率',
        },
      ],
      gaps: [
        '核心客户合同抽样（前五大至少 3 份）',
        '一致行动协议 / 表决权安排说明',
        '2025Q1 管理账与审计口径差异说明',
      ],
      reportChapters: [
        { title: '一、交易背景与投资逻辑', status: '已生成' },
        { title: '二、公司与业务', status: '已生成' },
        { title: '三、财务质量', status: '草稿' },
        { title: '四、风险与红旗', status: '草稿' },
        { title: '五、估值与回报', status: '待写' },
        { title: '六、投后安排', status: '待写' },
      ],
      icMemo: {
        thesis: '柔性装配+视觉闭环，切入汽车轻量化产线改造窗口。',
        returns: '基线 MOIC 2.1x / IRR 22%（5 年退出假设）',
        risks: ['客户集中', '应收账期拉长', '核心工程师依赖'],
      },
      debate: {
        bull: ['国产替代订单可见度高', '毛利率稳定在 32%+'],
        bear: ['回款慢拖累现金流', 'B 轮估值偏满，上行空间依赖 2026 放量'],
        open: ['前五大客户续约率需访谈确认', '专利可抗辩性待法务复核'],
      },
    },
    {
      id: 'p-qingquan',
      name: '清泉环保',
      company: '清泉环保科技股份有限公司',
      status: 'IC',
      creditCode: '91320100MA1XXXXX8K',
      owner: '李倩',
      updated: '昨天',
      todo: 'IC Memo 草稿',
      sector: '环保装备 / 工业废水',
      stage: 'C 轮前',
      profile: {
        legalRep: '周明',
        regCapital: '8000 万人民币',
        founded: '2012-09-01',
        address: '江苏省南京市江宁区诚信大道 100 号',
        status: '存续',
        industry: '工业废水处理设备与运维',
        employees: '680+',
        summary:
          '化工园区废水处理系统商，设备+运维双轮。在手订单约 6.2 亿，其中运维占比升至 41%。拟融资 2 亿用于运维网络扩张。',
      },
      materials: [
        { name: '商业计划书', status: '已解析', source: '上传' },
        { name: '客户合同抽样', status: '缺口', source: '—' },
        { name: '专利清单', status: '已入库', source: '上传' },
        { name: '审计报告 2022–2024', status: '已解析', source: '上传' },
        { name: '在手订单明细', status: '已解析', source: '飞书' },
      ],
      chats: [
        {
          id: 'c-qq-1',
          title: '清泉环保 · IC 要点',
          preview: '投资要点与红旗清单已出草稿',
          messages: [
            { role: 'user', text: '继续写清泉环保 IC Memo，先出投资要点与红旗清单' },
            {
              role: 'ai',
              text: '已按 IC 骨架输出要点。',
              cards: [
                {
                  type: 'flags',
                  title: '投资要点',
                  items: [
                    '运维收入占比提升，现金流可见度改善',
                    '园区客户黏性高，替换成本大',
                    '本轮资金用于区域运维站，回报路径清晰',
                  ],
                },
                {
                  type: 'flags',
                  title: '红旗清单',
                  items: [
                    '环保处罚历史：2023 有 1 次警告（已整改）',
                    '应收账中政府类拖欠约 0.4 亿',
                    '合同抽样未齐，影响收入确认可信度',
                  ],
                },
              ],
            },
          ],
        },
      ],
      ubo: [
        { name: '周明', pct: '32.1000%', standard: '标准一', path: '直接 + 清泉合伙' },
        { name: '南京产业基金', pct: '18.0000%', standard: '机构股东', path: '直接持股' },
        { name: '王磊', pct: '11.2000%', standard: '标准一', path: '直接持股' },
      ],
      financeFindings: [
        { item: '收入确认', level: '高', note: '设备交付与运维分期确认口径需与合同抽样交叉' },
        { item: '毛利率结构', level: '中', note: '运维毛利 28%，设备 22%，结构切换利好' },
        { item: '政府回款', level: '中', note: '园区平台回款周期 6–9 个月' },
      ],
      gaps: ['客户合同抽样', '环保整改验收材料', '关联方资金往来明细'],
      reportChapters: [
        { title: '一、投资摘要', status: '已生成' },
        { title: '二、行业与竞争', status: '已生成' },
        { title: '三、业务与订单', status: '草稿' },
        { title: '四、财务与回报', status: '草稿' },
        { title: '五、风险与条款', status: '待写' },
      ],
      icMemo: {
        thesis: '设备切入、运维沉淀，兑现园区废水治理刚性需求。',
        returns: '基线 MOIC 1.9x / IRR 18%',
        risks: ['政策补贴退坡', '应收账期', '合同抽样缺口'],
      },
      debate: {
        bull: ['订单可见', '运维占比提升'],
        bear: ['估值对 2026 增长敏感', '处罚历史需 IC 披露'],
        open: ['合同抽样补齐后再锁条款'],
      },
    },
    {
      id: 'p-huazhang',
      name: '华章科技',
      company: '华章科技（苏州）有限公司',
      status: '投后',
      creditCode: '91320594MA1MNBPN3Q',
      owner: '王敏',
      updated: '07-15',
      todo: '季度经营简报',
      sector: '企业软件 / 低代码',
      stage: '已投 A+',
      profile: {
        legalRep: '赵宁',
        regCapital: '1200 万人民币',
        founded: '2018-06-12',
        address: '苏州市工业园区星湖街 328 号',
        status: '存续',
        industry: '低代码与流程自动化',
        employees: '210+',
        summary:
          '面向制造与流通企业的低代码平台。2024 年 ARR 0.86 亿，净收入留存 112%。基金持股 12.5%，投后进入第二年。',
      },
      materials: [
        { name: '投后经营包 Q2', status: '已入库', source: '飞书' },
        { name: '估值模型', status: '待更新', source: '上传' },
        { name: '董事会材料 2025H1', status: '已解析', source: '上传' },
        { name: '关键客户续约表', status: '已解析', source: '上传' },
      ],
      chats: [
        {
          id: 'c-hz-1',
          title: '华章科技 · 季度经营简报',
          preview: 'ARR +18% QoQ，续约率 94%',
          messages: [
            { role: 'user', text: '根据华章科技投后经营包，生成季度经营简报要点' },
            {
              role: 'ai',
              text: '已生成 Q2 经营简报骨架。',
              cards: [
                {
                  type: 'kv',
                  title: '经营 KPI',
                  rows: [
                    ['ARR', '0.98 亿（+18% QoQ）'],
                    ['净收入留存', '112%'],
                    ['续约率', '94%'],
                    ['现金跑道', '19 个月'],
                  ],
                },
              ],
            },
          ],
        },
      ],
      ubo: [
        { name: '赵宁', pct: '41.2000%', standard: '标准一', path: '直接持股' },
        { name: '启明星成长二号', pct: '12.5000%', standard: '本基金', path: '直接持股' },
        { name: '苏州产投', pct: '10.0000%', standard: '机构股东', path: '直接持股' },
      ],
      financeFindings: [
        { item: '收入质量', level: '低', note: '订阅收入占比 78%，递延收入健康' },
        { item: '销售效率', level: '中', note: 'CAC 回本期 16 个月，略高于目标 14 个月' },
      ],
      gaps: ['估值模型待更新（对标市销率）'],
      reportChapters: [
        { title: '投后经营简报 Q2', status: '已生成' },
        { title: '风险跟踪', status: '草稿' },
      ],
      postState: {
        round: 'A+',
        amount: '8000 万',
        valuation: '6.4 亿',
        stake: '12.5000%',
        fund: '启明星成长二号',
        timeline: [
          { date: '2024-03', event: '交割完成，董事席位生效' },
          { date: '2024-09', event: '首次投后会：ARR 破 0.7 亿' },
          { date: '2025-06', event: 'Q2 经营包入库，AI 提案待确认' },
        ],
        proposals: [
          {
            id: 'prop-hz-1',
            field: 'valuation',
            oldVal: '6.4 亿',
            newVal: '7.2 亿',
            reason: '对标 SAAS 中位 PS 8.5x × ARR 0.98 亿，并扣流动性折扣',
            confidence: '72%',
            status: 'pending',
          },
          {
            id: 'prop-hz-2',
            field: 'stake',
            oldVal: '12.5000%',
            newVal: '12.5000%',
            reason: '本期无增发/回购，持股不变（校验通过）',
            confidence: '95%',
            status: 'pending',
          },
        ],
        brief:
          'Q2 ARR 环比 +18%，头部制造客户续约顺利；销售效率略低于目标，建议下季度聚焦渠道伙伴。',
      },
    },
    {
      id: 'p-antai',
      name: '安泰生物',
      company: '安泰生物医药有限公司',
      status: '尽调',
      creditCode: '91110108MA01XXXX2B',
      owner: '陈飞',
      updated: '07-14',
      todo: '材料缺口：银行流水',
      sector: '生物医药 / 创新药',
      stage: 'B 轮',
      profile: {
        legalRep: '林晓',
        regCapital: '3000 万人民币',
        founded: '2017-11-20',
        address: '北京市海淀区中关村生命科学园',
        status: '存续',
        industry: '肿瘤免疫创新药研发',
        employees: '160+',
        summary:
          '核心管线 ATB-301 处于 II 期，适应症为晚期实体瘤。现金跑道约 14 个月。本轮目标 3 亿，用于 II 期入组与 CMC。',
      },
      materials: [
        { name: '管线综述', status: '已解析', source: '上传' },
        { name: '银行流水', status: '缺失', source: '—' },
        { name: '核心专利', status: '已入库', source: '上传' },
        { name: '临床进度备忘', status: '已解析', source: '飞书' },
      ],
      chats: [
        {
          id: 'c-at-1',
          title: '安泰生物 · 材料缺口',
          preview: '财报深读卡住：缺银行流水',
          messages: [
            { role: 'user', text: '安泰生物材料缺口有哪些，影响哪一步' },
            {
              role: 'ai',
              text: '缺口已列出，优先催收流水。',
              cards: [
                {
                  type: 'flags',
                  title: '材料缺口',
                  items: [
                    '银行流水（近 18 个月）— 阻断财报深读与现金跑道核验',
                    'CRO 合同金额明细 — 影响研发费用勾稽',
                  ],
                },
              ],
            },
          ],
        },
      ],
      ubo: [
        { name: '林晓', pct: '29.8000%', standard: '标准一', path: '直接 + ESOP' },
        { name: '生物产业基金 A', pct: '22.0000%', standard: '机构股东', path: '直接持股' },
      ],
      financeFindings: [
        { item: '现金跑道', level: '高', note: '缺流水，无法核验账面现金与烧钱速度' },
        { item: '研发费用', level: '中', note: '管线投入与 CRO 付款需合同勾稽' },
      ],
      gaps: ['银行流水近 18 个月', 'CRO 合同金额明细', 'II 期入组里程碑证据'],
      reportChapters: [
        { title: '一、管线与临床', status: '草稿' },
        { title: '二、知识产权', status: '已生成' },
        { title: '三、财务与融资', status: '待写' },
      ],
      icMemo: {
        thesis: '差异化靶点组合，II 期数据是价值跃迁节点。',
        returns: '情景依赖临床读出，基线需情景树',
        risks: ['临床失败', '现金跑道', '流水缺失'],
      },
      debate: {
        bull: ['靶点差异化', '团队有大药厂背景'],
        bear: ['单一管线风险', '融资窗口紧'],
        open: ['流水到齐后再开财务深读'],
      },
    },
    {
      id: 'p-yuanhang',
      name: '远航新材',
      company: '远航新材料有限公司',
      status: '已投资',
      creditCode: '91370202MA3XXXXX7C',
      owner: '李倩',
      updated: '07-10',
      todo: '无',
      sector: '新材料 / 特种膜',
      stage: '已投 B',
      profile: {
        legalRep: '韩冬',
        regCapital: '6000 万人民币',
        founded: '2015-04-08',
        address: '山东省青岛市黄岛区长江路 200 号',
        status: '存续',
        industry: '特种功能膜材料',
        employees: '350+',
        summary:
          '锂电隔膜涂层材料供应商，客户含两家头部电芯厂。交割完成，基金持股 9.8000%，无待确认提案。',
      },
      materials: [
        { name: '交割文件', status: '已入库', source: '上传' },
        { name: '董事会决议', status: '已入库', source: '上传' },
        { name: '投后信息表', status: '已解析', source: '飞书' },
      ],
      chats: [
        {
          id: 'c-yh-1',
          title: '远航新材 · 交割核对',
          preview: '交割条款与持股已对齐',
          messages: [
            { role: 'user', text: '核对远航新材交割后持股与条款' },
            {
              role: 'ai',
              text: '交割文件与投后信息表一致。',
              cards: [
                {
                  type: 'kv',
                  title: '交割摘要',
                  rows: [
                    ['轮次', 'B 轮'],
                    ['金额', '1.5 亿'],
                    ['投后估值', '15.3 亿'],
                    ['持股', '9.8000%'],
                  ],
                },
              ],
            },
          ],
        },
      ],
      ubo: [
        { name: '韩冬', pct: '35.6000%', standard: '标准一', path: '直接持股' },
        { name: '启明星成长二号', pct: '9.8000%', standard: '本基金', path: '直接持股' },
      ],
      financeFindings: [
        { item: '毛利率', level: '低', note: '涂层材料毛利 41%，稳定' },
      ],
      gaps: [],
      reportChapters: [
        { title: '交割备忘', status: '已生成' },
      ],
      postState: {
        round: 'B',
        amount: '1.5 亿',
        valuation: '15.3 亿',
        stake: '9.8000%',
        fund: '启明星成长二号',
        timeline: [
          { date: '2025-05', event: '交割完成' },
          { date: '2025-07', event: '首次月度经营数据同步' },
        ],
        proposals: [],
        brief: '交割后经营平稳，产能利用率 78%，无重大异常。',
      },
    },
  ];

  var todos = [
    {
      id: 't1',
      title: '确认「华章科技」估值更新建议',
      desc: 'AI 建议投后估值由 6.4 亿调至 7.2 亿，待你确认写入。',
      projectId: 'p-huazhang',
      tag: '投后',
      tagClass: 'post',
      cta: '打开确认',
      action: 'post',
      route: 'post/p-huazhang',
    },
    {
      id: 't2',
      title: '「清泉环保」IC Memo 可继续写',
      desc: '公开面与材料要点已齐，可生成章节草稿。',
      projectId: 'p-qingquan',
      tag: 'IC',
      tagClass: 'ic',
      cta: '填入对话',
      prompt: '继续写清泉环保 IC Memo，先出投资要点与红旗清单',
      action: 'compose',
    },
    {
      id: 't3',
      title: '「安泰生物」材料缺口：银行流水',
      desc: '财报深读卡住，建议催收或换口径说明。',
      projectId: 'p-antai',
      tag: '缺口',
      tagClass: 'warn',
      cta: '打开项目',
      action: 'project',
      route: 'project/p-antai/gaps',
    },
    {
      id: 't4',
      title: '「华章科技」季度经营简报',
      desc: '投后经营包已入库，可生成一页简报。',
      projectId: 'p-huazhang',
      tag: '投后',
      tagClass: 'post',
      cta: '填入对话',
      prompt: '根据华章科技投后经营包，生成季度经营简报要点',
      action: 'compose',
    },
    {
      id: 't5',
      title: '「华章科技」估值提案待确认',
      desc: 'AI 建议投后估值由 6.4 亿调至 7.2 亿。',
      projectId: 'p-huazhang',
      tag: '投后',
      tagClass: 'post',
      cta: '打开确认',
      action: 'post',
      route: 'post/p-huazhang',
    },
    {
      id: 't6',
      title: '准备「星河智造」IC Memo',
      desc: '财务深读与股权穿透已齐，可出投决骨架。',
      projectId: 'p-xinghe',
      tag: 'IC',
      tagClass: 'ic',
      cta: '打开 IC',
      action: 'project',
      route: 'project/p-xinghe/ic',
    },
  ];

  var postTodos = [
    {
      id: 'pt1',
      title: '「华章科技」Q2 经营包待处理',
      desc: '经营包已入库，请解析财务数据并生成季度简报。',
      projectId: 'p-huazhang',
      tag: '待处理',
      tagClass: 'warn',
      cta: '立即处理',
      action: 'post',
      route: 'post/p-huazhang',
    },
    {
      id: 'pt2',
      title: '「华章科技」估值提案待确认',
      desc: 'AI 建议投后估值由 6.4 亿调至 7.2 亿，需你确认写入。',
      projectId: 'p-huazhang',
      tag: '投后',
      tagClass: 'post',
      cta: '打开确认',
      action: 'post',
      route: 'post/p-huazhang',
    },
    {
      id: 'pt3',
      title: '「安泰生物」本月经营数据更新',
      desc: '上月数据已录入，请核对营收与现金流变动。',
      projectId: 'p-antai',
      tag: '投后',
      tagClass: 'post',
      cta: '打开项目',
      action: 'post',
      route: 'post/p-antai',
    },
    {
      id: 'pt4',
      title: '「星河智造」工商变更预警',
      desc: '情报中心检测到法人代表变更，建议核实影响。',
      projectId: 'p-xinghe',
      tag: '预警',
      tagClass: 'warn',
      cta: '查看详情',
      action: 'project',
      route: 'project/p-xinghe',
    },
  ];

  var postChips = [
    { label: '生成简报', text: '根据最新经营包生成季度简报：' },
    { label: '估值更新', text: '更新投后估值模型：' },
    { label: '舆情扫描', text: '扫描被投企业近期舆情：' },
    { label: '经营异常', text: '分析本月经营异常指标：' },
    { label: '持仓总览', text: '生成基金组合整体健康摘要' },
  ];

  var chats = [
    {
      id: 'chat-global-1',
      title: '星河智造 · 公开面核查',
      projectId: 'p-xinghe',
      projectChatId: 'c-xh-1',
      time: '今天',
      preview: '实控人穿透与司法扫描完成',
      messages: null,
    },
    {
      id: 'chat-global-2',
      title: '清泉环保 · IC 要点',
      projectId: 'p-qingquan',
      projectChatId: 'c-qq-1',
      time: '昨天',
      preview: '投资要点与红旗清单草稿',
      messages: null,
    },
    {
      id: 'chat-global-3',
      title: '安泰生物 · 材料缺口',
      projectId: 'p-antai',
      projectChatId: 'c-at-1',
      time: '07-14',
      preview: '流水缺失阻断财报深读',
      messages: null,
    },
    {
      id: 'chat-global-4',
      title: '行业：工业自动化赛道速览',
      projectId: null,
      time: '07-12',
      preview: '国产替代与汽车产线改造窗口',
      messages: [
        { role: 'user', text: '工业自动化赛道近期投资逻辑？' },
        {
          role: 'ai',
          text: '围绕柔性产线与视觉闭环的改造需求仍在。',
          cards: [
            {
              type: 'flags',
              title: '赛道要点',
              items: [
                '汽车/3C 产线改造资本开支回暖',
                '国产视觉与运动控制份额提升',
                '关注应收账期与客户集中度',
              ],
            },
          ],
        },
      ],
    },
  ];

  var chips = [
    { label: '项目初筛', text: '帮我初筛一家标的：' },
    { label: '标的速览', text: '做标的速览：' },
    { label: '财报深读', text: '对已上传财报做深读：' },
    { label: '尽调报告', text: '整理尽调报告骨架：' },
    { label: '行业赛道', text: '梳理一下赛道格局：' },
  ];

  var scenarios = [
    {
      group: '入场与初筛',
      items: [
        {
          id: 'sc-screen',
          name: '项目初筛',
          desc: '工商、股权、司法与业务一句话判断是否值得立项',
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
        {
          id: 'sc-brief',
          name: '标的速览',
          desc: '一页纸：主体、股权、司法、经营信号',
          prompt: '做标的速览：清泉环保科技股份有限公司',
          result: {
            text: '速览已生成，可进入材料入库。',
            cards: [
              {
                type: 'brief',
                title: '清泉环保 · 一页纸',
                rows: [
                  ['行业', '工业废水处理'],
                  ['实控', '周明 32.1000%'],
                  ['司法', '无失信/限高'],
                  ['关注', '2023 环保警告已整改'],
                ],
              },
            ],
          },
        },
      ],
    },
    {
      group: '材料与财务',
      items: [
        {
          id: 'sc-finance',
          name: '财报深读',
          desc: '勾稽、异常科目与红旗表',
          prompt: '对星河智造已上传审计报告做财报深读',
          result: {
            text: '深读完成：应收周转与存货为主要关注。',
            cards: [
              {
                type: 'flags',
                title: '财务红旗',
                items: [
                  '应收周转 118 天，高于同行',
                  '流水覆盖率 86%，年末回款差额待说明',
                  '关联交易占比低，披露完整',
                ],
              },
            ],
          },
        },
        {
          id: 'sc-gap',
          name: '材料缺口',
          desc: '对照清单列出缺失与影响步骤',
          prompt: '列出安泰生物材料缺口及影响',
          result: {
            text: '流水缺失阻断现金跑道核验与财报深读。',
            cards: [
              {
                type: 'flags',
                title: '缺口',
                items: ['银行流水 18 个月', 'CRO 合同金额明细'],
              },
            ],
          },
        },
      ],
    },
    {
      group: '投决与交付',
      items: [
        {
          id: 'sc-report',
          name: '尽调报告',
          desc: '章节骨架与可编辑草稿',
          prompt: '整理星河智造尽调报告骨架',
          result: {
            text: '报告骨架已就绪，财务与估值章待补。',
            cards: [
              {
                type: 'flags',
                title: '章节状态',
                items: [
                  '交易背景 · 已生成',
                  '财务质量 · 草稿',
                  '估值与回报 · 待写',
                ],
              },
            ],
          },
        },
        {
          id: 'sc-ic',
          name: 'IC Memo',
          desc: '投资要点、回报与红旗',
          prompt: '写清泉环保 IC Memo 摘要',
          result: {
            text: 'IC 摘要已出，可进对抗预演。',
            cards: [
              {
                type: 'kv',
                title: 'IC 摘要',
                rows: [
                  ['逻辑', '设备+运维双轮'],
                  ['回报', 'MOIC 1.9x / IRR 18%'],
                  ['红旗', '合同抽样缺口'],
                ],
              },
            ],
          },
        },
        {
          id: 'sc-debate',
          name: '对抗预演',
          desc: '多空与开放问题',
          prompt: '对星河智造做 IC 对抗预演',
          result: {
            text: '多空已列，开放问题指向合同与一致行动。',
            cards: [
              {
                type: 'flags',
                title: '多头',
                items: ['国产替代订单', '毛利率稳定'],
              },
              {
                type: 'flags',
                title: '空头',
                items: ['账期拉长', '估值偏满'],
              },
            ],
          },
        },
      ],
    },
    {
      group: '投后',
      items: [
        {
          id: 'sc-post',
          name: '投后简报',
          desc: '经营 KPI 与提案确认',
          prompt: '生成华章科技季度经营简报',
          result: {
            text: '简报要点已生成，估值提案待确认。',
            cards: [
              {
                type: 'kv',
                title: 'Q2 KPI',
                rows: [
                  ['ARR', '0.98 亿'],
                  ['NRR', '112%'],
                  ['续约', '94%'],
                ],
              },
            ],
          },
        },
      ],
    },
  ];

  var experts = {
    meetings: [
      {
        id: 'em1',
        title: '工业视觉产线改造 · 专家会',
        project: '星河智造',
        time: '2026-07-16 14:00',
        status: '已完成',
        experts: ['刘工（前海康机器视觉）', '赵总（汽车零部件工厂）'],
        summary: '确认视觉引导在焊接工位渗透率提升；客户验收周期 3–6 个月。',
      },
      {
        id: 'em2',
        title: '园区废水运维模式 · 专家会',
        project: '清泉环保',
        time: '2026-07-20 10:00',
        status: '已预约',
        experts: ['孙工（园区环保平台）'],
        summary: '待开会：聚焦运维续约与回款账期。',
      },
      {
        id: 'em3',
        title: '低代码制造场景 · 专家会',
        project: '华章科技',
        time: '2026-07-08 16:00',
        status: '已完成',
        experts: ['钱经理（离散制造 CIO）'],
        summary: '续约驱动因素：流程模板沉淀与实施伙伴能力。',
      },
    ],
    minutes: [
      {
        id: 'min1',
        title: '锂电隔膜涂层供需 2025H2',
        sector: '新材料',
        date: '2026-06-28',
        source: '纪要库',
        highlight: '头部电芯厂涂层国产化比例继续提升，价格战缓和。',
      },
      {
        id: 'min2',
        title: '创新药 II 期融资窗口',
        sector: '生物医药',
        date: '2026-07-02',
        source: '纪要库',
        highlight: '临床数据读出前融资难度上升，现金跑道成硬门槛。',
      },
      {
        id: 'min3',
        title: '工业软件国产替代节奏',
        sector: '企业软件',
        date: '2026-07-10',
        source: '纪要库',
        highlight: '低代码在中型制造渗透快，但大客实施交付仍是瓶颈。',
      },
    ],
    bookings: [
      {
        id: 'bk1',
        topic: '星河智造 · 客户验收周期访谈',
        preferTime: '本周三四下午',
        expertType: '产业专家 · 汽车零部件工厂',
        status: '匹配中',
      },
      {
        id: 'bk2',
        topic: '安泰生物 · 临床运营可行性',
        preferTime: '下周一二',
        expertType: '临床运营 · CRO/药企',
        status: '待确认专家',
      },
    ],
  };

  var journalistCases = [
    {
      id: 'j1',
      company: '星河智造科技有限公司',
      city: '上海',
      focus: '产能、客户验收、核心人员稳定性',
      status: '报告已出',
      updated: '07-11',
    },
    {
      id: 'j2',
      company: '清泉环保科技股份有限公司',
      city: '南京',
      focus: '运维站点、回款、环保整改落实',
      status: '调研中',
      updated: '07-15',
    },
    {
      id: 'j3',
      company: '安泰生物医药有限公司',
      city: '北京',
      focus: '实验室运转、招聘活跃度',
      status: '待派单',
      updated: '07-14',
    },
  ];

  var journalistSampleReport = {
    company: '星河智造科技有限公司',
    date: '2026-07-11',
    findings: [
      '张江厂区两班运转，目测在制产线 6 条，与管理层表述基本一致。',
      '门岗反映核心客户驻场验收人员近两月频繁进出。',
      '周边招聘广告以电气工程师与视觉算法为主，未见大规模裁员迹象。',
      '午餐时段员工规模与「420+」口径大致吻合。',
    ],
    risks: ['未能进入洁净车间内部，产能利用率仍需财务交叉。'],
    photos: ['厂区外观', '门岗登记（打码）', '招聘栏'],
  };

  var radarItems = [
    {
      id: 'r1',
      title: '工业视觉赛道融资升温',
      tag: '赛道',
      time: '今天',
      summary: '两周内 3 起 B 轮，估值中枢上移；关注应收与交付周期。',
      related: '星河智造',
    },
    {
      id: 'r2',
      title: '清泉环保中标某化工园运维',
      tag: '标的',
      time: '昨天',
      summary: '公开招标金额约 4800 万/3 年，利好运维收入占比。',
      related: '清泉环保',
    },
    {
      id: 'r3',
      title: '低代码厂商价格战缓和',
      tag: '赛道',
      time: '07-15',
      summary: '头部厂商转向续约与增购，对华章科技留存叙事正面。',
      related: '华章科技',
    },
    {
      id: 'r4',
      title: '创新药投融资情绪分化',
      tag: '宏观',
      time: '07-13',
      summary: '有数据读出的管线仍可融资；纯早期更难。',
      related: '安泰生物',
    },
  ];

  var findResults = [
    {
      id: 'f1',
      name: '星河智造科技有限公司',
      sector: '智能制造',
      stage: 'B 轮窗口',
      signal: '视觉产线订单饱满',
      match: '92%',
    },
    {
      id: 'f2',
      name: '清泉环保科技股份有限公司',
      sector: '环保装备',
      stage: 'C 轮前',
      signal: '运维收入占比提升',
      match: '88%',
    },
    {
      id: 'f3',
      name: '远航新材料有限公司',
      sector: '新材料',
      stage: '已投跟踪',
      signal: '电芯厂涂层份额提升',
      match: '81%',
    },
    {
      id: 'f4',
      name: '华章科技（苏州）有限公司',
      sector: '企业软件',
      stage: '投后',
      signal: 'ARR 加速',
      match: '85%',
    },
    {
      id: 'f5',
      name: '安泰生物医药有限公司',
      sector: '创新药',
      stage: 'B 轮',
      signal: 'II 期入组中',
      match: '76%',
    },
  ];

  var chainData = {
    nodes: [
      { id: 'layer-up',   label: '上游',            parentId: null,         layer: 'base', order: 1 },
      { id: 'layer-mid',  label: '中游',            parentId: null,         layer: 'base', order: 2 },
      { id: 'layer-down', label: '下游',            parentId: null,         layer: 'base', order: 3 },
      { id: 'n1', label: '工业视觉传感器', parentId: 'layer-up',   layer: 'tech', order: 1 },
      { id: 'n6', label: '运动控制',       parentId: 'layer-up',   layer: 'tech', order: 2 },
      { id: 'n2', label: '视觉算法与标定', parentId: 'layer-mid',  layer: 'tech', order: 1 },
      { id: 'n3', label: '柔性装配系统',   parentId: 'layer-mid',  layer: 'tech', order: 2 },
      { id: 'n4', label: '汽车零部件工厂', parentId: 'layer-down', layer: 'tech', order: 1 },
      { id: 'n5', label: '3C 代工',        parentId: 'layer-down', layer: 'tech', order: 2 },
    ],
    companies: [
      { id: 'c1', name: '星河智造', nodeId: 'n2', city: '苏州', tags: ['视觉算法', '工业AI'], signal: '已投' },
      { id: 'c2', name: '华睿视觉', nodeId: 'n1', city: '杭州', tags: ['相机', '光源'], signal: '观察中' },
      { id: 'c3', name: '迪升运动', nodeId: 'n6', city: '深圳', tags: ['伺服', '国产替代'], signal: '待深入' },
      { id: 'c4', name: '博创装备', nodeId: 'n3', city: '上海', tags: ['柔性', '系统集成'], signal: '观察中' },
    ],
  };

  var graphLinks = [
    { from: '星河智造', to: '汽车零部件 A', rel: '客户' },
    { from: '星河智造', to: '浦东科创', rel: '股东' },
    { from: '清泉环保', to: '南京产业基金', rel: '股东' },
    { from: '华章科技', to: '启明星成长二号', rel: '本基金持股' },
    { from: '远航新材', to: '电芯厂 B', rel: '客户' },
    { from: '安泰生物', to: '生物产业基金 A', rel: '股东' },
  ];

  var skills = [
    { id: 'sk1', name: '标的速览', status: '已安装', desc: '公开面一页纸', group: '尽调' },
    { id: 'sk2', name: '财报深读', status: '已安装', desc: '勾稽与红旗', group: '尽调' },
    { id: 'sk3', name: 'IC Memo', status: '已安装', desc: '投决骨架', group: '投决' },
    { id: 'sk4', name: '对抗预演', status: '已安装', desc: '多空推演', group: '投决' },
    { id: 'sk5', name: '投后简报', status: '已安装', desc: '经营一页纸', group: '投后' },
    { id: 'sk6', name: '股权穿透', status: '可安装', desc: 'UBO 与路径', group: '尽调' },
    { id: 'sk7', name: '专家会议纪要摘要', status: '可安装', desc: '会后结构化', group: '调研' },
  ];

  var templates = [
    { id: 'tp1', name: 'PE 尽调报告（标准）', chapters: 12, updated: '2026-06-01', use: '尽调' },
    { id: 'tp2', name: 'IC Memo 一页纸', chapters: 6, updated: '2026-06-12', use: 'IC' },
    { id: 'tp3', name: '投后经营简报', chapters: 5, updated: '2026-07-01', use: '投后' },
    { id: 'tp4', name: '材料缺口清单', chapters: 1, updated: '2026-05-20', use: '尽调' },
  ];

  var financeRules = [
    { id: 'fr1', name: '应收周转预警', rule: '> 同行中位 +30 天', level: '高', on: true },
    { id: 'fr2', name: '流水覆盖率', rule: '< 85% 标黄', level: '中', on: true },
    { id: 'fr3', name: '关联交易占比', rule: '> 5% 需披露说明', level: '中', on: true },
    { id: 'fr4', name: '毛利率波动', rule: '同比变动 > 5pct', level: '中', on: false },
    { id: 'fr5', name: '现金跑道', rule: '< 12 个月标红', level: '高', on: true },
  ];

  var monitorAlerts = [
    {
      id: 'm1',
      project: '星河智造',
      type: '工商变更',
      level: '中',
      time: '今天 08:40',
      detail: '经营范围新增「软件开发」',
    },
    {
      id: 'm2',
      project: '清泉环保',
      type: '舆情',
      level: '低',
      time: '昨天',
      detail: '地方媒体报道中标化工园运维',
    },
    {
      id: 'm3',
      project: '华章科技',
      type: '经营',
      level: '中',
      time: '07-15',
      detail: 'ARR 环比加速，估值提案已生成',
    },
    {
      id: 'm4',
      project: '安泰生物',
      type: '材料',
      level: '高',
      time: '07-14',
      detail: '银行流水仍未入库',
    },
  ];

  var knowledgeDocs = [
    { id: 'k1', name: '星河智造 · 审计报告 2024.pdf', project: '星河智造', type: '财务', status: '已解析' },
    { id: 'k2', name: '清泉环保 · 在手订单.xlsx', project: '清泉环保', type: '业务', status: '已解析' },
    { id: 'k3', name: '华章科技 · 投后经营包 Q2.zip', project: '华章科技', type: '投后', status: '已入库' },
    { id: 'k4', name: '安泰生物 · 管线综述.docx', project: '安泰生物', type: '业务', status: '已解析' },
    { id: 'k5', name: '远航新材 · 交割文件.pdf', project: '远航新材', type: '法律', status: '已入库' },
    { id: 'k6', name: '工业自动化赛道笔记.md', project: '—', type: '研究', status: '笔记' },
  ];

  var settings = {
    displayName: '王敏',
    org: '启明星基金',
    phone: '13800138000',
    title: '投资经理',
    mode: 'pe',
  };

  var reports = {
    'rpt-xh-revenue': {
      id: 'rpt-xh-revenue',
      title: '收入结构深度分析',
      subtitle: '2024',
      html: [
        '<h4 style="font-size:13px;font-weight:700;color:#152033;margin:0 0 10px;">一、主营业务收入构成</h4>',
        '<p>星河智造2024年营业收入2.91亿元，同比增长34%。收入结构以工业视觉引导系统为核心，占总营收',
        '<span style="background:rgba(13,46,75,.08);border-radius:2px;padding:1px 3px">65.3%</span>，',
        '柔性装配系统占24.1%，安装调试与运维服务占10.6%。',
        '<button class="cite-num" data-act="openSourceCitation" data-arg="2">2</button>',
        '</p>',
        '<p>从客户结构看，前五大客户合计收入占比约61%',
        '<button class="cite-num" data-act="openSourceCitation" data-arg="3">3</button>，',
        '其中头部单一客户（某头部汽车零部件企业）占比18.3%，客户集中度明显高于同行中位水平',
        '<button class="cite-num" data-act="openSourceCitation" data-arg="4">4</button>。',
        '</p>',
        '<h4 style="font-size:13px;font-weight:700;color:#152033;margin:14px 0 10px;">二、区域分布</h4>',
        '<p>业务主要集中于华东地区（占比54%）',
        '<button class="cite-num" data-act="openSourceCitation" data-arg="5">5</button>，',
        '华南次之（占比23%）。区域集中叠加客户集中，双重风险需重点关注。',
        '</p>',
      ].join(''),
      sources: [
        {
          id: '2',
          kind: '审计报告',
          page: '2024年报 · 第14页',
          title: '主营业务收入分类明细表',
          snippetHtml: '工业视觉引导系统收入 <em>189,630 千元，占营业总收入65.3%</em>；柔性装配系统收入 70,131 千元，占比24.1%……',
        },
        {
          id: '3',
          kind: '客户合同',
          page: '合同抽样汇总 · 第2页',
          title: '前五大客户收入汇总',
          snippetHtml: '前五大客户合计收入 <em>177,510 千元</em>，占营业收入61.0%，续约节点集中于2025年Q3–Q4……',
        },
        {
          id: '4',
          kind: '同业分析',
          page: '可比分析报告 · 第8页',
          title: '工业自动化赛道客户集中度对比',
          snippetHtml: '赛道中位客户集中度（前五大）约39%，<em>星河智造61%高于中位22pct</em>，处于高集中区间……',
        },
        {
          id: '5',
          kind: '内部材料',
          page: '管理层汇报 · 第3页',
          title: '区域业务分布说明',
          snippetHtml: '华东区域营收占比 <em>54%</em>（上年52%），华南23%，其余区域合计23%……',
        },
      ],
      issues: [
        { no: 3, q: '前五大客户集中度是否存在续约风险？合同到期时间分布？', status: '待核实' },
        { no: 5, q: '华东区域集中度上升是主动布局还是被动结果？', status: '已核实' },
        { no: 7, q: '工业视觉系统毛利率与整体毛利率差距有多大？', status: '待核实' },
      ],
      findings: [
        {
          label: '关键发现 · 风险',
          text: '客户集中度高于同业中位22pct，前五大客户合同到期节点集中于2025年Q3–Q4，存在规模性续约风险。',
          chips: ['3', '4'],
        },
        {
          label: '关键发现 · 结构',
          text: '工业视觉引导系统占比从2022年的57%提升至65.3%，产品结构持续升级，单价趋势向好。',
          chips: ['2'],
        },
      ],
    },
  };

  window.PE_DATA = {
    projects: projects,
    todos: todos,
    postTodos: postTodos,
    chats: chats,
    chips: chips,
    postChips: postChips,
    scenarios: scenarios,
    experts: experts,
    journalistCases: journalistCases,
    journalistSampleReport: journalistSampleReport,
    radarItems: radarItems,
    findResults: findResults,
    chain: chainData,
    graphLinks: graphLinks,
    skills: skills,
    templates: templates,
    financeRules: financeRules,
    monitorAlerts: monitorAlerts,
    knowledgeDocs: knowledgeDocs,
    settings: settings,
    reports: reports,
  };
})();
