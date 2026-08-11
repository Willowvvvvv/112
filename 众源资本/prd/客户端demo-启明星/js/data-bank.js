/**
 * 银行版 AML / CDD / 受益所有人 — Demo 数据
 * 全局：window.BANK_DATA
 * 术语：案件、客户、客户尽职调查、受益所有人、BOMIS、差异报告、佐证材料、持续尽职、存量攻坚
 */
(function () {
  'use strict';

  var CASES = [
    {
      id: 'case-huacheng',
      name: '某科技 · 授信前调查',
      company: '某科技（苏州）有限公司',
      creditCode: '91320500XXXXXXXXXX',
      purpose: '授信前调查',
      owner: '周凯',
      status: '调查中',
      riskLevel: '中',
      progress: 2,
      updated: '今天 10:18',
      verify: {
        nameMatch: true,
        codeMatch: true,
        status: '存续（在营、开业、在册）',
        legalPerson: '张启明',
        regCapital: '人民币 5000 万元',
        establishDate: '2016-03-18',
        address: '苏州市工业园区星湖街 328 号',
        industry: '软件和信息技术服务业',
        businessScope: '软件开发；信息系统集成；集成电路设计；技术咨询…',
        notes: '名称与统一社会信用代码一致；经营状态正常；未见简易注销或吊销记录。'
      },
      uboRows: [
        {
          name: '张启明',
          gender: '男',
          nationality: '中国',
          idMask: '3205**********3816',
          birth: '1978-06',
          standard: '标准一',
          pct: 47.6955,
          votePct: 53.0011,
          formDate: '2019-08-12',
          path: '本人直接持股 28% → 苏州澄明企业管理合伙企业（有限合伙）19.6955%',
          recommended: true,
          role: '法定代表人 / 执行董事'
        },
        {
          name: '李婉清',
          gender: '女',
          nationality: '中国',
          idMask: '3205**********2209',
          birth: '1982-11',
          standard: '标准二',
          pct: 12.4,
          votePct: 26.5,
          formDate: '2021-04-03',
          path: '通过表决权委托协议对澄明合伙持有表决权，合计表决权 ≥25%',
          recommended: false,
          role: '股东'
        },
        {
          name: '王磊',
          gender: '男',
          nationality: '中国',
          idMask: '3101**********7712',
          birth: '1985-02',
          standard: '日常经营',
          pct: 0,
          votePct: 0,
          formDate: '2022-01-10',
          path: '总经理，负责日常经营管理（标准一至三均未单独满足时之兜底）',
          recommended: false,
          role: '总经理'
        },
        {
          name: '赵昕',
          gender: '男',
          nationality: '中国',
          idMask: '3205**********5530',
          birth: '1990-09',
          standard: '标准一',
          pct: 11.2,
          votePct: 11.2,
          formDate: '2023-06-20',
          path: '直接持股 11.2%（加强识别阈值 10% 场景下应列入）',
          recommended: false,
          role: '股东'
        }
      ],
      controlSummary:
        '实控人张启明通过直接持股与澄明合伙平台合计最终受益股份 47.6955%、表决权 53.0011%。李婉清依表决权委托协议享有 ≥25% 表决权，按标准二识别。未见公开代持协议；章程中一致行动条款待客户补件核对。',
      penetrate: {
        root: '某科技（苏州）有限公司',
        children: [
          {
            name: '张启明',
            pct: '28%',
            type: '自然人',
            note: '标准一 · 直接'
          },
          {
            name: '苏州澄明企业管理合伙企业（有限合伙）',
            pct: '32%',
            type: '合伙企业',
            children: [
              { name: '张启明（GP）', pct: '61.5484%', type: '自然人', note: '穿透计入 19.6955%' },
              { name: '李婉清（LP）', pct: '20%', type: '自然人', note: '另有表决权委托' },
              { name: '员工持股平台 LP', pct: '18.4516%', type: '有限合伙', note: '分散自然人' }
            ]
          },
          { name: '赵昕', pct: '11.2%', type: '自然人', note: '≥10% 加强阈值' },
          { name: '其他小股东合计', pct: '28.8%', type: '多方', note: '单人未达阈值' }
        ]
      },
      materials: [
        { name: '营业执照（扫描件）', status: '已收', source: '本地' },
        { name: '公示系统股东截图', status: '已收', source: '公开' },
        { name: '主要人员公示截图', status: '已收', source: '公开' },
        { name: '企业信用信息报告（官方水印）', status: '已收', source: '公开' },
        { name: '股权与表决权穿透图', status: '已生成', source: '系统' },
        { name: '公司章程（现行）', status: '待补', source: '客户' },
        { name: '受益所有人声明原件', status: '待补', source: '客户' },
        { name: '近三年审计报告', status: '待补', source: '客户' },
        { name: '一致行动 / 表决权委托协议', status: '待补', source: '客户' }
      ],
      risks: [
        { title: '被执行信息（历史已结）', level: '关注', source: '财跃启明星·司法', detail: '2022 年买卖合同纠纷，执行完毕' },
        { title: '行政处罚（环保）', level: '一般', source: '公开处罚', detail: '2023 年超标排放，已整改销案' },
        { title: '股权出质', level: '关注', source: '工商', detail: '澄明合伙部分出资额出质，未到期' }
      ],
      pendingDocs: [
        { title: '补齐近三年审计报告', owner: '周凯', due: '2026-08-01', tag: '补件' },
        { title: '确认表决权委托协议与工商一致', owner: '合规岗', due: '2026-07-25', tag: '核实' },
        { title: '受益所有人声明原件归档', owner: '周凯', due: '2026-07-22', tag: '佐证' }
      ],
      specialFlags: ['结构含合伙平台', '存在表决权委托', '股权出质'],
      eddHints: ['建议按加强措施核实表决权委托真实性', '补齐章程与协议后方可定级'],
      bomis: {
        result: '不一致',
        left: [
          { label: '受益所有人', value: '张启明；李婉清；王磊（日常经营）' },
          { label: '张启明 · 最终受益股份', value: '47.6955%' },
          { label: '张启明 · 表决权', value: '53.0011%' },
          { label: '李婉清 · 标准', value: '标准二（表决权 ≥25%）' },
          { label: '识别时点', value: '2026-07-18' }
        ],
        right: [
          { label: '备案受益所有人', value: '张启明' },
          { label: '张启明 · 备案股份', value: '45%' },
          { label: '张启明 · 备案表决权', value: '45%' },
          { label: '李婉清', value: '未备案' },
          { label: '备案更新日', value: '2024-11-02' }
        ],
        diffs: [
          {
            item: '受益所有人名单',
            bankSide: '张启明、李婉清、王磊',
            bomisSide: '仅张启明',
            type: '重大',
            reason: '人不匹配：本行识别李婉清（标准二），BOMIS 未备案'
          },
          {
            item: '张启明权利状况',
            bankSide: '受益股份 47.6955% / 表决权 53.0011%',
            bomisSide: '股份 45% / 表决权 45%',
            type: '重大',
            reason: '权利状况重大不一致（比例差超过非重大容忍）'
          },
          {
            item: '王磊任职',
            bankSide: '日常经营管理兜底',
            bomisSide: '未列示',
            type: '非重大',
            reason: '因本行识别口径含日常经营兜底，属阈值/口径差异，记录不报'
          }
        ]
      },
      diffReport: {
        sections: [
          {
            title: '一、客户基本信息',
            body:
              '客户名称：某科技（苏州）有限公司\n统一社会信用代码：91320500XXXXXXXXXX\n业务关系目的：授信前调查（流动资金贷款）\n客户经理：周凯\n风险初评：中'
          },
          {
            title: '二、差异概况',
            body:
              'BOMIS 核验结果：不一致（重大差异）。\n重大差异项 2 项：① 受益所有人名单人不匹配（李婉清未备案）；② 张启明受益股份/表决权与备案存在实质性偏差。\n非重大差异 1 项：日常经营管理兜底人员未在 BOMIS 列示，留痕不报。'
          },
          {
            title: '三、识别与核实过程',
            body:
              '1. 依据公示股东、主要人员及合伙企业工商信息完成穿透；\n2. 对照央行三大标准标注张启明（标准一）、李婉清（标准二）、王磊（日常经营）；\n3. 佐证材料：公示截图、信用报告、系统穿透图已归档；章程与表决权委托协议待客户补件；\n4. 禁止以 BOMIS 查询替代本行识别核实。'
          },
          {
            title: '四、风控措施',
            body:
              '1. 暂停将本笔授信推进至放款环节，待差异报告复核完成；\n2. 要求客户 10 个工作日内补充表决权委托协议及受益所有人声明；\n3. 对李婉清开展名单核查与补充身份核实；\n4. 差异报告按双岗（初审/复核）提交，不得全自动报送。'
          },
          {
            title: '五、补充说明',
            body:
              '重大差异须于发现之日起 30 个工作日内报送。本案发现日：2026-07-18，到期日：2026-08-29（示意工作日口径）。\n本报告为工作底稿初稿，不构成授信审批结论。'
          }
        ],
        deadlineWorkdays: 28,
        reviewStatus: '待初审'
      },
      monitorEvents: [
        { date: '2026-07-12', type: '股权变更', title: '赵昕增资入股 11.2%', detail: '工商已公示，触发受益所有人复评' },
        { date: '2026-06-01', type: '高管变更', title: '王磊任总经理', detail: '日常经营管理人员更新' },
        { date: '2026-03-18', type: '年检提醒', title: '持续尽职调查到期临近', detail: '中风险客户建议年度复评' }
      ],
      opinion:
        '【客户尽职调查意见 · 草稿】\n一、主体身份：某科技（苏州）有限公司存续正常，名称与统一社会信用代码核验一致。\n二、受益所有人：按标准一识别张启明（最终受益股份 47.6955%）；按标准二识别李婉清；日常经营管理人员王磊作兜底列示。\n三、BOMIS：存在重大差异，差异报告草稿已生成，待初审/复核，未完成前不得以备案信息替代本行识别。\n四、风险：历史被执行已结、环保处罚已销案、股权出质存续，建议关注。\n五、材料：章程、受益所有人声明、审计报告待补。\n六、结论取向：调查中，待补件与差异闭环后出具正式意见。AI 仅整理事实，不替代审批。'
    },
    {
      id: 'case-mingda',
      name: '某贸易 · 准入开户',
      company: '某贸易有限公司',
      creditCode: '91310115MA1MDTRD2X',
      purpose: '准入',
      owner: '孙悦',
      status: '待补件',
      riskLevel: '低',
      progress: 1,
      updated: '昨天',
      verify: {
        nameMatch: true,
        codeMatch: true,
        status: '存续（在营、开业、在册）',
        legalPerson: '陈浩',
        regCapital: '人民币 1000 万元',
        establishDate: '2018-09-05',
        address: '上海市浦东新区张杨路 1881 号',
        industry: '批发业',
        businessScope: '货物进出口；技术进出口；初级农产品批发…',
        notes: '主体核验通过；未见经营异常；开户用途为结算账户。'
      },
      uboRows: [
        {
          name: '陈浩',
          gender: '男',
          nationality: '中国',
          idMask: '3101**********6601',
          birth: '1975-04',
          standard: '标准一',
          pct: 70,
          votePct: 70,
          formDate: '2018-09-05',
          path: '直接持股 70%',
          recommended: true,
          role: '法定代表人 / 执行董事'
        },
        {
          name: '周敏',
          gender: '女',
          nationality: '中国',
          idMask: '3101**********1188',
          birth: '1979-12',
          standard: '标准一',
          pct: 30,
          votePct: 30,
          formDate: '2018-09-05',
          path: '直接持股 30%',
          recommended: true,
          role: '股东'
        }
      ],
      controlSummary: '自然人控股结构清晰：陈浩 70%、周敏 30%，无中间层；未见代持或复杂控制安排（公开面）。',
      penetrate: {
        root: '某贸易有限公司',
        children: [
          { name: '陈浩', pct: '70%', type: '自然人', note: '标准一' },
          { name: '周敏', pct: '30%', type: '自然人', note: '标准一' }
        ]
      },
      materials: [
        { name: '营业执照', status: '已收', source: '本地' },
        { name: '公示系统股东截图', status: '已收', source: '公开' },
        { name: '主要人员公示截图', status: '已收', source: '公开' },
        { name: '企业信用信息报告', status: '已收', source: '公开' },
        { name: '受益所有人声明原件', status: '待补', source: '客户' },
        { name: '法定代表人身份证件', status: '待补', source: '客户' }
      ],
      risks: [
        { title: '经营异常名录（历史已移出）', level: '关注', source: '工商异常', detail: '2021 年未按时年报，已移出' }
      ],
      pendingDocs: [
        { title: '受益所有人声明原件', owner: '孙悦', due: '2026-07-22', tag: '补件' },
        { title: '法定代表人身份证件核验', owner: '运营岗', due: '2026-07-21', tag: '核实' }
      ],
      specialFlags: [],
      eddHints: [],
      bomis: {
        result: '一致',
        left: [
          { label: '受益所有人', value: '陈浩；周敏' },
          { label: '陈浩 · 最终受益股份', value: '70%' },
          { label: '周敏 · 最终受益股份', value: '30%' }
        ],
        right: [
          { label: '备案受益所有人', value: '陈浩；周敏' },
          { label: '陈浩 · 备案股份', value: '70%' },
          { label: '周敏 · 备案股份', value: '30%' }
        ],
        diffs: []
      },
      diffReport: {
        sections: [
          { title: '一、客户基本信息', body: '某贸易有限公司 · 准入开户 · 孙悦' },
          { title: '二、差异概况', body: 'BOMIS 核验结果：一致。无差异报告报送义务。' },
          { title: '三、识别与核实过程', body: '直接持股结构，标准一识别陈浩、周敏；佐证材料待声明原件。' },
          { title: '四、风控措施', body: '标准 CDD；待补件完成后完成开户尽职调查。' },
          { title: '五、补充说明', body: '无需差异报告。' }
        ],
        deadlineWorkdays: null,
        reviewStatus: '无需报送'
      },
      monitorEvents: [
        { date: '2026-07-10', type: '开户流程', title: '准入建案', detail: '结算账户开户申请已受理' }
      ],
      opinion:
        '【准入 CDD 意见 · 草稿】主体存续、受益所有人结构清晰且与 BOMIS 一致。材料缺口：受益所有人声明原件、法定代表人证件。补齐前不得完成开户尽职调查结论。'
    },
    {
      id: 'case-haihe',
      name: '海河智造 · AML 复评',
      company: '某智能制造股份有限公司',
      creditCode: '91120116MA06HHZZ9K',
      purpose: 'AML',
      owner: '合规岗·刘芳',
      status: '待复核',
      riskLevel: '高',
      progress: 3,
      updated: '07-16',
      verify: {
        nameMatch: true,
        codeMatch: true,
        status: '存续（在营、开业、在册）',
        legalPerson: '郑国华',
        regCapital: '人民币 2 亿元',
        establishDate: '2012-01-20',
        address: '天津市滨海新区海河科教园',
        industry: '专用设备制造业',
        businessScope: '智能制造装备；工业机器人；技术服务…',
        notes: '高风险客户年度复评；跨境采购频繁，适用加强尽职调查。'
      },
      uboRows: [
        {
          name: '郑国华',
          gender: '男',
          nationality: '中国',
          idMask: '1201**********9902',
          birth: '1968-03',
          standard: '标准三',
          pct: 18.6,
          votePct: 18.6,
          formDate: '2015-07-01',
          path: '持股未达 25%，但通过董事会席位与一致行动协议实施实际控制',
          recommended: true,
          role: '董事长 / 实际控制人'
        },
        {
          name: 'Horizon Capital Ltd.',
          gender: '—',
          nationality: '开曼',
          idMask: '—',
          birth: '—',
          standard: '标准一',
          pct: 22.0,
          votePct: 22.0,
          formDate: '2020-02-14',
          path: '境外法人股东；须继续穿透至自然人（示意：待境外材料）',
          recommended: false,
          role: '法人股东'
        },
        {
          name: '孙婷',
          gender: '女',
          nationality: '中国',
          idMask: '1201**********3344',
          birth: '1972-08',
          standard: '标准一',
          pct: 15.5,
          votePct: 15.5,
          formDate: '2016-05-09',
          path: '直接持股 15.5%（加强识别 10% 阈值列入）',
          recommended: false,
          role: '股东'
        },
        {
          name: '吴建军',
          gender: '男',
          nationality: '中国',
          idMask: '1201**********7780',
          birth: '1970-01',
          standard: '日常经营',
          pct: 0,
          votePct: 0,
          formDate: '2019-03-01',
          path: '总经理',
          recommended: false,
          role: '总经理'
        }
      ],
      controlSummary:
        '郑国华持股 18.6% 但依标准三认定实际控制；境外股东 Horizon Capital Ltd. 持股 22%，须穿透至自然人后方可完成加强尽职调查。高风险标签：跨境资金、股权结构含境外层。',
      penetrate: {
        root: '某智能制造股份有限公司',
        children: [
          {
            name: 'Horizon Capital Ltd.（开曼）',
            pct: '22%',
            type: '境外法人',
            children: [
              { name: '待穿透自然人 A', pct: '—', type: '待核实', note: 'EDD：补境外股权证明' }
            ]
          },
          { name: '郑国华', pct: '18.6%', type: '自然人', note: '标准三 · 实际控制' },
          { name: '孙婷', pct: '15.5%', type: '自然人', note: '加强阈值 10%' },
          { name: '其他流通/小股东', pct: '43.9%', type: '多方', note: '分散' }
        ]
      },
      materials: [
        { name: '年报 / 上市公司公告摘录', status: '已收', source: '公开' },
        { name: '公示股东与主要人员', status: '已收', source: '公开' },
        { name: '一致行动协议', status: '已收', source: '客户' },
        { name: '境外股东穿透证明', status: '待补', source: '客户' },
        { name: '受益所有人声明', status: '已收', source: '客户' },
        { name: '实地走访记录', status: '已收', source: '客户经理' }
      ],
      risks: [
        { title: '跨境交易频繁', level: '高', source: '行内监测', detail: '近 12 个月跨境付款笔数显著高于同业均值' },
        { title: '股权冻结（历史）', level: '关注', source: '司法', detail: '2019 年股东股权冻结已解除' },
        { title: '制裁名单筛查', level: '通过', source: '名单系统', detail: '当前命中：无' }
      ],
      pendingDocs: [
        { title: '境外股东穿透至自然人证明', owner: '刘芳', due: '2026-07-30', tag: 'EDD' },
        { title: '高级管理层批准留痕', owner: '合规部', due: '2026-08-05', tag: 'EDD' }
      ],
      specialFlags: ['高风险客户', '含境外股东', '实际控制（标准三）', '加强尽职调查'],
      eddHints: ['阈值可降至 10%', '要求境外穿透材料', '须高级管理层批准后方可维持业务关系'],
      bomis: {
        result: '未备案',
        left: [
          { label: '受益所有人（本行）', value: '郑国华（标准三）；孙婷等' },
          { label: '境外层', value: 'Horizon Capital Ltd. 待穿透' }
        ],
        right: [
          { label: 'BOMIS', value: '未查询到有效备案' },
          { label: '备注', value: '股份公司部分情形可能免报/未及时备案，须人工判断' }
        ],
        diffs: [
          {
            item: '备案状态',
            bankSide: '已完成识别（部分待穿透）',
            bomisSide: '未备案',
            type: '重大',
            reason: '应备未备或备案状态异常，须按重大差异处理并评估是否报送'
          }
        ]
      },
      diffReport: {
        sections: [
          {
            title: '一、客户基本信息',
            body: '某智能制造股份有限公司 · AML 年度复评 · 高风险 · 经办：刘芳'
          },
          {
            title: '二、差异概况',
            body: 'BOMIS 结果：未备案。判定为重大差异（应备未备/状态异常），需双岗复核后决定是否报送。'
          },
          {
            title: '三、识别与核实过程',
            body: '按标准三认定郑国华为实际控制人；境外股东未完成自然人穿透；已开展实地走访与名单筛查。'
          },
          {
            title: '四、风控措施',
            body: '维持 EDD；限制部分高风险交易权限至穿透完成；提交高管审批。'
          },
          {
            title: '五、补充说明',
            body: '发现日 2026-07-16，重大差异报送倒计时进行中。'
          }
        ],
        deadlineWorkdays: 22,
        reviewStatus: '初审通过'
      },
      monitorEvents: [
        { date: '2026-07-16', type: 'BOMIS', title: '核验为未备案', detail: '已起草差异报告，初审通过待复核' },
        { date: '2026-07-01', type: '交易监测', title: '跨境付款预警', detail: '单笔金额突破监测阈值' },
        { date: '2026-05-20', type: 'UBO 变更', title: '孙婷持股升至 15.5%', detail: '触发复评' }
      ],
      opinion:
        '【AML 复评意见 · 草稿】高风险客户。受益所有人按标准三识别郑国华；境外股东穿透未完成，适用 EDD。BOMIS 未备案，差异报告初审已通过，待复核。名单筛查当前无命中。建议在穿透材料齐备并经高级管理层批准前，维持加强监测。'
    }
  ];

  var CUSTOMERS = [
    {
      id: 'cust-huacheng',
      name: '某科技（苏州）有限公司',
      creditCode: '91320500XXXXXXXXXX',
      industry: '软件和信息技术服务业'
    },
    {
      id: 'cust-mingda',
      name: '某贸易有限公司',
      creditCode: '91120100XXXXXXXXXX',
      industry: '批发业'
    },
    {
      id: 'cust-haihe',
      name: '某智能制造股份有限公司',
      creditCode: '91120101XXXXXXXXXX',
      industry: '专用设备制造业'
    }
  ];

  var PROJECTS = [
    {
      id: 'proj-huacheng',
      name: '某科技 · 授信尽调',
      companyId: 'cust-huacheng',
      company: '某科技（苏州）有限公司',
      creditCode: '91320500XXXXXXXXXX',
      amount: '3000 万',
      term: '36 个月',
      packId: 'pack-credit-dd-v1',
      packLabel: '对公授信尽调 Pack v1（已锁定）',
      owner: '周凯',
      status: '待 OCR',
      updated: '今天 10:18',
      ocrConfirmed: false,
      reportGenerated: false,
      materials: [
        {
          id: 'm1',
          name: '营业执照.pdf',
          required: true,
          status: 'parsed',
          note: '已归类'
        },
        {
          id: 'm2',
          name: '审计报告_2025.pdf（扫描）',
          required: true,
          status: 'parsed',
          needsOcr: true,
          note: '待右侧 OCR 确认'
        },
        {
          id: 'm3',
          name: '公司章程.pdf',
          required: false,
          status: 'parsed',
          note: '已归类'
        },
        {
          id: 'm4',
          name: '银行流水（近一年）',
          required: true,
          status: 'missing',
          note: '缺口标红 · 仍可生成报告'
        }
      ],
      gaps: [
        { id: 'g1', title: '银行流水（近一年）', detail: '必收未上传 · 与报告右窗同源' },
        { id: 'g2', title: '财报 OCR 确认', detail: '扫描件待右侧双栏校对' }
      ],
      sections: [],
      traces: [],
      tasks: [
        { id: 't1', title: '财报 OCR 待确认', status: '待确认', target: 'ocr' },
        { id: 't2', title: '材料包解析归类', status: '已完成', target: 'materials' }
      ],
      publicBrief: null
    },
    {
      id: 'proj-mingda',
      name: '某贸易 · 授信尽调',
      companyId: 'cust-mingda',
      company: '某贸易有限公司',
      creditCode: '91120100XXXXXXXXXX',
      amount: '800 万',
      term: '24 个月',
      packId: 'pack-credit-dd-v1',
      packLabel: '对公授信尽调 Pack v1（已锁定）',
      owner: '周凯',
      status: '材料整理',
      updated: '昨天',
      ocrConfirmed: false,
      reportGenerated: false,
      materials: [
        { id: 'm1', name: '营业执照', required: true, status: 'missing' },
        { id: 'm2', name: '近三年审计报告', required: true, status: 'missing', needsOcr: true }
      ],
      gaps: [
        { id: 'g1', title: '营业执照', detail: '必收未上传' },
        { id: 'g2', title: '近三年审计报告', detail: '必收未上传' }
      ],
      sections: [],
      traces: [],
      tasks: [],
      publicBrief: null
    }
  ];

  window.BANK_DATA = {
    cases: CASES,
    customers: CUSTOMERS,
    projects: PROJECTS,
    homeTodos: [
      {
        id: 'bt1',
        title: '某科技：BOMIS 重大差异临期',
        desc: '人不匹配 + 权利状况重大不一致，剩余约 28 个工作日须完成差异报告双岗。',
        caseId: 'case-huacheng',
        tag: '差异报告',
        tagClass: 'warn',
        cta: '打开企业档案',
        route: 'enterprise/cust-huacheng'
      },
      {
        id: 'bt2',
        title: '某贸易：待补受益所有人声明',
        desc: '准入开户材料未齐，声明原件截止 07-22。',
        caseId: 'case-mingda',
        tag: '补件',
        tagClass: 'warn',
        cta: '打开企业档案',
        route: 'enterprise/cust-mingda'
      },
      {
        id: 'bt3',
        title: '海河智造：差异报告待复核',
        desc: '初审已通过，请复核岗确认是否报送（BOMIS 未备案）。',
        caseId: 'case-haihe',
        tag: '复核',
        tagClass: 'dd',
        cta: '打开企业档案',
        route: 'enterprise/cust-haihe'
      },
      {
        id: 'bt4',
        title: '某科技：UBO 变更预警已触发',
        desc: '赵昕增资 11.2%，请复评受益所有人表（可切 10% 加强阈值）。',
        caseId: 'case-huacheng',
        tag: '持续尽职',
        tagClass: 'dd',
        cta: '打开企业档案',
        route: 'enterprise/cust-huacheng'
      },
      {
        id: 'bt5',
        title: '存量攻坚：高风险批次进度落后',
        desc: '高风险存量识别完成率 72%，距阶段目标还差 3 户。',
        caseId: null,
        tag: '存量攻坚',
        tagClass: 'post',
        cta: '打开看板',
        route: 'stock'
      },
      {
        id: 'bt6',
        title: '某科技：财报 OCR 待确认',
        desc: '审计报告扫描件已归类，请在客户工作台右侧完成 OCR 后生成报告（流水缺口可标红继续）。',
        caseId: 'case-huacheng',
        tag: '客户',
        tagClass: 'dd',
        cta: '打开客户 OCR',
        route: 'project/proj-huacheng/ocr',
        customerRoute: 'customer/cust-huacheng'
      }
    ],
    stockProgress: {
      summary: {
        total: 1280,
        done: 946,
        highRiskTotal: 86,
        highRiskDone: 62,
        deadline: '2026-09-30',
        phase: '第二阶段 · 全面推进'
      },
      batches: [
        { name: '高风险优先', total: 86, done: 62, pct: 72 },
        { name: '中风险', total: 420, done: 310, pct: 74 },
        { name: '低风险', total: 774, done: 574, pct: 74 }
      ],
      queue: [
        { company: '某智能制造股份有限公司', risk: '高', owner: '刘芳', status: '差异待复核', caseId: 'case-haihe' },
        { company: '某物流集团有限公司', risk: '高', owner: '周凯', status: '识别中', caseId: null },
        { company: '某精密部件有限公司', risk: '高', owner: '孙悦', status: '待补境外材料', caseId: null },
        { company: '某科技（苏州）有限公司', risk: '中', owner: '周凯', status: 'BOMIS 重大差异', caseId: 'case-huacheng' }
      ]
    },
    packMeta: {
      title: '授信 / 财报 Pack',
      lead: '复用底座：OCR 校对、财务异动、材料类型、报告模板、授信章节、汇编导出',
      modules: [
        { id: 'ocr', title: '财报 OCR 校对', desc: '三栏：原文预览 · 识别字段 · 试算平衡', route: 'pack/ocr' },
        { id: 'finance', title: '财务配置', desc: '科目 / 指标 / 规则（与 PE 同页）', route: 'finance-config' },
        { id: 'materials', title: '材料类型配置', desc: '对公尽调材料清单与必填规则', route: 'pack/materials-types' },
        { id: 'tpl', title: '报告模板配置', desc: '章节骨架、固定段、可编辑段', route: 'pack/tpl' },
        { id: 'credit', title: '授信章节列表', desc: '客户调查报告章节状态与生成', route: 'pack/credit' },
        { id: 'assemble', title: '汇编导出', desc: '按模板汇编 Word / 示意成功页', route: 'pack/assemble' }
      ]
    },
    /** IA v1.3 · 能力中心（对齐 PE #pe:skills；首 type=报告内容；Agent / Skill / 连接器分栏） */
    capabilityCategories: [
      { id: 'report', label: '报告内容' },
      { id: 'analyze', label: '分析工具' },
      { id: 'agents', label: 'Agent' },
      { id: 'skills', label: 'Skill' },
      { id: 'connectors', label: '连接器' },
      { id: 'research', label: '研究能力' }
    ],
    capabilities: {
      report: [
        {
          id: 'cap-dd-report',
          title: '企业尽调报告',
          desc: '按模版生成授信尽调报告，缺口标红可继续',
          launch: 'report',
          taskId: 'task-huacheng-dd',
          ready: true
        },
        {
          id: 'cap-fin-report',
          title: '财务分析报告',
          desc: '基于已确认财报做异动与勾稽摘要',
          launch: 'report',
          taskId: 'task-huacheng-fin',
          ready: true
        },
        {
          id: 'cap-ubo-report',
          title: '受益所有人报告',
          desc: '开户企业穿透识别最终受益人，并反向检索其名下/实控关联企业，形成关系网与风险画像',
          launch: 'report',
          taskId: 'task-huacheng-ubo',
          ready: true
        },
        {
          id: 'cap-risk-report',
          title: '企业风险排查报告',
          desc: '公开面司法 / 处罚 / 限高等客观清单',
          launch: 'report',
          taskId: 'task-huacheng-risk',
          ready: true
        },
        {
          id: 'cap-screen-report',
          title: '项目初筛报告',
          desc: '初筛一页纸与红旗清单',
          launch: 'report',
          taskId: 'task-huacheng-screen',
          ready: true
        },
        {
          id: 'cap-post-report',
          title: '贷后分析报告',
          desc: '后续开放 · 本期 Demo 不可点',
          route: null,
          ready: false,
          later: true
        }
      ],
      analyze: [
        {
          id: 'cap-ocr',
          title: '财报识别与分析',
          desc: '扫描件 OCR 双栏校对 → 结构化财报',
          route: 'project/proj-huacheng/ocr',
          ready: true
        },
        {
          id: 'cap-captable',
          title: '股权穿透',
          desc: '多层股权与控制关系',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'cap-related',
          title: '关联关系分析',
          desc: '一跳关联与关键人任职投资',
          route: 'project/proj-huacheng/public',
          ready: true
        },
        {
          id: 'cap-gap',
          title: '材料完整性检查',
          desc: '对照材料清单标红缺口',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'cap-conflict',
          title: '数据冲突核验',
          desc: '材料与公开面冲突点',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'cap-stock',
          title: '存量攻坚',
          desc: '存量识别进度看板（卡片入口）',
          route: 'stock',
          ready: true
        }
      ],
      /** 复用 PE market.experts（data-pe-discover）；点选 toast 示意召唤，银行相关可进工作台 */
      agents: [
        {
          id: 'ex-ag-kyc',
          title: '合规风控专家',
          tag: '风控',
          desc: '解析准入材料包，按机构规则做名单筛查与字段核验，输出待补件与升级项清单。',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'ex-fs-dd',
          title: '财务尽调专家',
          tag: '财务',
          desc: '在尽调阶段聚焦财务与业务数据质量，输出同业对比、三表骨架与可审计工作底稿。',
          route: 'task/task-huacheng-dd',
          ready: true
        },
        {
          id: 'ex-ag-model',
          title: '财务建模专家',
          tag: '财务',
          desc: '按标的与假设集搭建机构级估值模型，输出单元格全公式、可平衡校验的工作簿。',
          ready: true
        },
        {
          id: 'ex-ag-statement',
          title: '报表核验专家',
          tag: '财务',
          desc: '在报表下发前，将资本账户报表与净值包逐项核对，标记余额与费用分摊差异。',
          ready: true
        },
        {
          id: 'ex-ag-meeting',
          title: '客户访前专家',
          tag: '会前',
          desc: '在客户或项目会议前整理关系历史与背景，输出可执行的议程与谈话要点。',
          ready: true
        },
        {
          id: 'ex-ag-earnings',
          title: '业绩解读专家',
          tag: '财务',
          desc: '围绕单季业绩事件，解读披露与电话会要点，更新覆盖模型并起草业绩点评笔记。',
          ready: true
        },
        {
          id: 'ex-ag-market',
          title: '赛道研究专家',
          tag: '行业',
          desc: '输出行业空间、竞争格局、同业估值带与主题标的短名单。',
          ready: true
        },
        {
          id: 'ex-ag-pitch',
          title: '投行路演专家',
          tag: '财务',
          desc: '从标的与交易情境出发，独立完成估值工作簿与路演材料初稿，关键假设可复核。',
          ready: true
        },
        {
          id: 'ex-ag-gl',
          title: '总账对账专家',
          tag: '财务',
          desc: '按交易日核对总账与子账，定位差异根因并整理待签核异常报告。',
          ready: true
        },
        {
          id: 'ex-ag-close',
          title: '月末结账专家',
          tag: '财务',
          desc: '执行实体月末关账流程，完成计提与滚动表，整理待签核关账包。',
          ready: true
        },
        {
          id: 'ex-ag-valreview',
          title: '估值复核专家',
          tag: '财务',
          desc: '按机构模板复核组合估值并整理投资人季报草稿。',
          ready: true
        },
        {
          id: 'ex-fs-pe',
          title: '私募股权专家',
          tag: '财务',
          desc: '从赛道挖项目到立项尽调，输出筛选结论、尽调清单与投委会备忘录初稿。',
          ready: true
        },
        {
          id: 'ex-fs-ib',
          title: '并购交易专家',
          tag: '财务',
          desc: '从 teaser 到 CIM、买方名单与示意并购模型，整理可对外沟通的交易材料包。',
          ready: true
        },
        {
          id: 'ex-fs-theme',
          title: '主题挖项目专家',
          tag: '行业',
          desc: '从宏观与产业变化提炼可投资主题，跟踪催化并给出标的短名单。',
          ready: true
        },
        {
          id: 'ex-fs-fund',
          title: '基金行政专家',
          tag: '财务',
          desc: '完成计提与滚动、净值核对和总账对账，输出待签核差异说明与运营底稿。',
          ready: true
        }
      ],
      /** 复用 PE market.skills（data-pe-discover）；可进银行路由的带 route，其余点按 toast 示意 */
      skills: [
        {
          id: 'hv-analysis',
          title: '横纵赛道分析',
          tag: '初筛打分',
          desc: '横纵分析法：纵轴追赛道/行业演变，横轴对比竞争格局。',
          ready: true
        },
        {
          id: 'pe-peer-compare',
          title: '同业横向对比',
          tag: '初筛打分',
          desc: '多家主体的工商、知产与经营信号横向对比。',
          ready: true
        },
        {
          id: 'dd-beneficial-owner',
          title: '受益所有人识别',
          tag: '公开核查',
          desc: '穿透识别最终受益人；可接名人下/实控关联企业反向检索（与报告能力同源数据）。',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'dd-cap-table',
          title: '股权结构穿透',
          tag: '公开核查',
          desc: '多层股权结构解析，标注实控人、一致行动与隐性关联。',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'dd-corporate-timeline',
          title: '沿革时间线',
          tag: '公开核查',
          desc: '按时间线梳理工商变更、股权演变与关键里程碑。',
          ready: true
        },
        {
          id: 'dd-entity-anchor',
          title: '主体锚定核验',
          tag: '公开核查',
          desc: '尽调前确认目标主体：工商照面、股权结构与主要风险信号。',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'dd-judicial-scan',
          title: '司法风险扫描',
          tag: '公开核查',
          desc: '企业与核心人员的诉讼、执行与限高等司法风险分层梳理。',
          route: 'project/proj-huacheng/public',
          ready: true
        },
        {
          id: 'dd-key-person',
          title: '关键人背景核查',
          tag: '公开核查',
          desc: '董监高及实控人的司法、任职与关联企业风险画像。',
          route: 'project/proj-huacheng/public',
          ready: true
        },
        {
          id: 'dd-target-brief',
          title: '标的速览',
          tag: '公开核查',
          desc: '一页式企业基本面与核心风险速览，适合初筛与内部汇报。',
          route: 'project/proj-huacheng/public',
          ready: true
        },
        {
          id: 'pe-funding-track',
          title: '融资历程梳理',
          tag: '公开核查',
          desc: '追溯历次融资与股权变化，辅助理解估值与条款演变。',
          ready: true
        },
        {
          id: 'dd-business-signals',
          title: '经营信号扫描',
          tag: '深度尽调',
          desc: '结合招聘、中标与舆情等信号判断经营活跃度。',
          ready: true
        },
        {
          id: 'dd-checklist',
          title: '尽调材料清单',
          tag: '深度尽调',
          desc: '对照尽调清单识别材料缺口与矛盾点。',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'dd-ip-conflict',
          title: '知产冲突预警',
          tag: '深度尽调',
          desc: '商标近似与专利覆盖范围的潜在冲突识别。',
          ready: true
        },
        {
          id: 'dd-ip-inventory',
          title: '知产资产盘点',
          tag: '深度尽调',
          desc: '专利、商标与软著清单及有效性状态快速盘点。',
          ready: true
        },
        {
          id: 'dd-labor-risk',
          title: '用工合规排查',
          tag: '深度尽调',
          desc: '劳动仲裁、社保欠缴与行政处罚等用工风险排查。',
          ready: true
        },
        {
          id: 'dd-license-check',
          title: '资质证照核验',
          tag: '深度尽调',
          desc: '行业许可与证照有效期的批量核验与到期提示。',
          ready: true
        },
        {
          id: 'dd-signatory-check',
          title: '签约主体核验',
          tag: '深度尽调',
          desc: '签约前快速确认相对方存续、法代与经营异常。',
          route: 'enterprise/cust-huacheng',
          ready: true
        },
        {
          id: 'legal-debt-recovery-assessment',
          title: '债务清偿能力评估',
          tag: '深度尽调',
          desc: '诉前评估财报质量、可执行资产与个人兜底能力。',
          ready: true
        },
        {
          id: 'dd-meeting-prep',
          title: '访谈准备',
          tag: '访谈核实',
          desc: '公开资料先行，生成外部专家与管理层访谈提纲。',
          ready: true
        },
        {
          id: 'pe-ic-skeleton',
          title: 'IC 骨架整理',
          tag: '上会交付',
          desc: '把工商、股权、司法与知产要点整理成投委会备忘录骨架。',
          ready: true
        }
      ],
      /** 复用 PE market.connectors（data-pe-discover） */
      connectors: [
        {
          id: 'qcc',
          title: 'finstep 公开数据连接器',
          tag: '公开数据',
          desc: '工商照面、股权结构、风控司法、知识产权、经营信息与董监高画像等全量公开数据。',
          meta: '底层 6 路服务',
          route: 'project/proj-huacheng/public',
          ready: true
        },
        {
          id: 'pkulaw',
          title: '北大法宝连接器',
          tag: '法律研究',
          desc: '法规与案例检索、法条精确查询；结果带原文链接。',
          meta: '底层 1 路服务',
          ready: true
        },
        {
          id: 'fuyao',
          title: '扶摇研报连接器',
          tag: '研究资讯',
          desc: '券商研报与行业深度材料检索。',
          meta: '底层 2 路服务',
          ready: true
        },
        {
          id: 'tushare',
          title: 'Tushare 行情连接器',
          tag: '行情数据',
          desc: 'A 股行情与财务基本面接口。',
          meta: '底层 1 路服务',
          ready: true
        }
      ],
      research: [
        { id: 'cap-industry', title: '行业研究', desc: '后续', ready: false, later: true },
        { id: 'cap-peers', title: '相似企业', desc: '后续', ready: false, later: true },
        { id: 'cap-find', title: '找项目', desc: '后续', ready: false, later: true },
        { id: 'cap-news', title: '舆情与投后监控', desc: '后续', ready: false, later: true }
      ]
    },
    /** 报告任务工作区 mock（#bank:task/{id}） */
    reportTasks: {
      'task-huacheng-dd': {
        id: 'task-huacheng-dd',
        capTitle: '企业尽调报告',
        shortTitle: '授信尽调报告',
        title: '某科技（苏州）有限公司 · 授信尽调报告',
        enterprise: '某科技（苏州）有限公司',
        enterpriseId: 'cust-huacheng',
        progress: 68,
        statusLabel: '待确认关键问题',
        taskBucket: 'action',
        launchMaterials: [
          { id: 'm1', name: '营业执照.pdf', state: 'reuse' },
          { id: 'm2', name: '审计报告_2025.pdf', state: 'reuse' },
          { id: 'm3', name: '公司章程.pdf', state: 'reuse' },
          { id: 'm4', name: '银行流水（近一年）', state: 'miss' }
        ],
        steps: [
          { status: 'ok', title: '材料解析', desc: 'OCR / 分类 / 抽取完成（示意）' },
          { status: 'ok', title: '公开面与股权', desc: '工商 · 司法 · 股权链已就绪' },
          { status: 'warn', title: '财务与收入真实性', desc: '缺流水 · 本章局部暂停，其余继续' },
          { status: 'run', title: '报告章节生成', desc: '有证据章节边写边出' },
          { status: 'todo', title: '质量检查', desc: '定稿后进入我的报告交付' }
        ],
        questions: [
          {
            id: 'q-flow',
            chapterId: 'ch-income',
            paused: true,
            title: '缺少近一年银行流水',
            body: '收入真实性章依赖流水勾稽。仅本章及相关依赖暂停；企业概况 / 股权 / 司法继续生成。可上传流水、人工填写说明，或暂时跳过（标「暂无法分析」）。',
            actions: [
              { act: 'upload', label: '上传流水' },
              { act: 'answer', label: '说明已线下核验' },
              { act: 'skip', label: '暂时跳过' }
            ]
          }
        ],
        findings: [
          {
            id: 'f1',
            tri: 'ok',
            title: '应收增速偏高',
            body: '事实：近一年应收同比 +42%（示意）。判断：需与收入确认节奏对照。证据：审计报告 P18。',
            included: false
          },
          {
            id: 'f2',
            tri: 'warn',
            title: '流水缺口影响收入章',
            body: '待核实：无银行流水时不作收入真实性定论；授信建议初稿将标「受上游待核实影响」。',
            included: false
          }
        ],
        chapters: [
          { id: 'ch-overview', title: '企业概况', status: 'ok', note: '已生成 · 可溯源' },
          { id: 'ch-equity', title: '股权与实控', status: 'ok', note: '已生成', locked: true },
          { id: 'ch-judicial', title: '司法与公开风险', status: 'ok', note: '已生成' },
          {
            id: 'ch-income',
            title: '收入真实性',
            status: 'warn',
            note: '局部暂停 · 缺银行流水'
          },
          { id: 'ch-finance', title: '财务分析', status: 'run', note: '生成中…' },
          {
            id: 'ch-credit',
            title: '授信建议（初稿）',
            status: 'todo',
            note: '待上游闭合 · 不写伪确定批贷结论'
          }
        ],
        evidenceByChapter: {
          'ch-overview': ['营业执照.pdf · P1', '财跃启明星工商照面 · T+3'],
          'ch-equity': ['股权穿透示意 · 财跃启明星', '公司章程.pdf · §股权'],
          'ch-judicial': ['公开面扫描 · 失信 0 / 被执行 0（示意）'],
          'ch-income': ['待补：银行流水'],
          'ch-finance': ['审计报告_2025.pdf · 利润表'],
          'ch-credit': ['依赖上游待核实 · 仅出谨慎初稿']
        },
        draftByChapter: {
          'ch-overview': {
            title: '一、企业概况',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 某科技（苏州）有限公司，统一社会信用代码 91320500XXXXXXXXXX，存续，软件和信息技术服务业。</p><p>法定代表人张启明；注册资本人民币 5000 万元。来源：工商照面 + 营业执照。</p>'
          },
          'ch-equity': {
            title: '二、股权与实控',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 实控人张启明：最终受益股份 47.6955%、表决权 53.0011%（示意逐字引用工具返回）。本章已锁定。</p>'
          },
          'ch-judicial': {
            title: '三、司法与公开风险',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 当前公开面：未发现失信 / 被执行在册记录（示意 · T+0）。不构成授信通过与否结论。</p>'
          },
          'ch-income': {
            title: '四、收入真实性',
            html:
              '<p><span class="tri-na">【暂无法分析】</span> 缺近一年银行流水，本章不作收入真实性判断。影响：授信建议初稿将标注上游待核实。</p><p><span class="tri-warn">【待核实】</span> 应收增速偏高信号已记录，待流水闭合后复核。</p>'
          },
          'ch-finance': {
            title: '五、财务分析',
            html: '<p>基于已确认审计报告生成中（示意）。勾稽与异动摘要将写入本节。</p>'
          },
          'ch-credit': {
            title: '六、授信建议（初稿）',
            html:
              '<p><span class="tri-warn">【待核实】</span> 初稿仅列风险点与材料缺口，<strong>不写批贷通过 / 拒绝</strong>。待收入章闭合后局部更新本段。</p>'
          }
        }
      },
      'task-huacheng-fin': {
        id: 'task-huacheng-fin',
        capTitle: '财务分析报告',
        shortTitle: '财务分析报告',
        title: '某科技（苏州）有限公司 · 财务分析报告',
        enterprise: '某科技（苏州）有限公司',
        enterpriseId: 'cust-huacheng',
        progress: 55,
        statusLabel: '待确认关键问题',
        taskBucket: 'action',
        launchMaterials: [
          { id: 'f1', name: '审计报告_2025.pdf', state: 'reuse' },
          { id: 'f2', name: '财报结构化表（OCR）', state: 'reuse' },
          { id: 'f3', name: '科目余额表', state: 'miss' },
          { id: 'f4', name: '银行流水（近一年）', state: 'miss' }
        ],
        steps: [
          { status: 'ok', title: '财报入库', desc: '审计报告 / OCR 结构化表已就绪' },
          { status: 'ok', title: '勾稽校验', desc: '三大表勾稽通过（示意）' },
          { status: 'warn', title: '异动分析', desc: '缺科目余额表 · 部分异动暂停' },
          { status: 'run', title: '报告章节生成', desc: '有证据章节边写边出' },
          { status: 'todo', title: '质量检查', desc: '定稿后进入我的报告交付' }
        ],
        questions: [
          {
            id: 'q-bal',
            chapterId: 'fin-anomaly',
            paused: true,
            title: '缺少科目余额表',
            body: '异动分析章依赖科目余额表与审计报告对照。仅异动相关段落暂停；勾稽与偿债能力章继续。可上传余额表、人工说明口径，或暂时跳过。',
            actions: [
              { act: 'upload', label: '上传余额表' },
              { act: 'answer', label: '说明口径差异' },
              { act: 'skip', label: '暂时跳过' }
            ]
          }
        ],
        findings: [
          {
            id: 'ff1',
            tri: 'ok',
            title: '资产负债勾稽通过',
            body: '事实：资产合计 = 负债 + 所有者权益（示意）。判断：基础勾稽无缺口。证据：审计报告 P3。',
            included: true
          },
          {
            id: 'ff2',
            tri: 'warn',
            title: '应收增速偏高',
            body: '事实：近一年应收同比 +42%（示意）。待核实：需与收入确认节奏对照；缺余额表时不作科目级归因。',
            included: false
          }
        ],
        chapters: [
          { id: 'fin-summary', title: '财务摘要', status: 'ok', note: '已生成 · 可溯源' },
          { id: 'fin-tie', title: '勾稽校验', status: 'ok', note: '已生成', locked: true },
          {
            id: 'fin-anomaly',
            title: '异动分析',
            status: 'warn',
            note: '局部暂停 · 缺科目余额表'
          },
          { id: 'fin-solvency', title: '偿债与周转', status: 'run', note: '生成中…' },
          {
            id: 'fin-gap',
            title: '材料与缺口',
            status: 'todo',
            note: '待上游闭合'
          }
        ],
        evidenceByChapter: {
          'fin-summary': ['审计报告_2025.pdf · 利润表摘要'],
          'fin-tie': ['OCR 结构化表 · 试算平衡'],
          'fin-anomaly': ['待补：科目余额表'],
          'fin-solvency': ['审计报告_2025.pdf · 资产负债表'],
          'fin-gap': ['材料清单 · 流水 / 余额表']
        },
        draftByChapter: {
          'fin-summary': {
            title: '一、财务摘要',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 基于已确认审计报告：营收、毛利、净利摘要已出（示意）。来源：审计报告_2025.pdf。</p>'
          },
          'fin-tie': {
            title: '二、勾稽校验',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 三大表勾稽通过；OCR 试算平衡无阻断项。本章已锁定。</p>'
          },
          'fin-anomaly': {
            title: '三、异动分析',
            html:
              '<p><span class="tri-na">【暂无法分析】</span> 缺科目余额表，不作科目级异动归因。</p><p><span class="tri-warn">【待核实】</span> 应收增速偏高信号已记录，待余额表闭合后复核。</p>'
          },
          'fin-solvency': {
            title: '四、偿债与周转',
            html: '<p>流动比率、资产负债率、应收周转等指标生成中（示意）。不构成授信通过与否结论。</p>'
          },
          'fin-gap': {
            title: '五、材料与缺口',
            html:
              '<p><span class="tri-warn">【待核实】</span> 待补：科目余额表、近一年银行流水。边界：本报告只陈述勾稽与异动事实及缺口。</p>'
          }
        }
      },
      'task-huacheng-risk': {
        id: 'task-huacheng-risk',
        capTitle: '企业风险排查报告',
        shortTitle: '风险排查报告',
        title: '某科技（苏州）有限公司 · 企业风险排查报告',
        enterprise: '某科技（苏州）有限公司',
        enterpriseId: 'cust-huacheng',
        progress: 62,
        statusLabel: '待确认关键问题',
        taskBucket: 'action',
        launchMaterials: [
          { id: 'r1', name: '营业执照.pdf', state: 'reuse' },
          { id: 'r2', name: '公开面扫描缓存', state: 'reuse' },
          { id: 'r3', name: '关键人身份核验说明', state: 'miss' }
        ],
        steps: [
          { status: 'ok', title: '企业锚定', desc: '工商照面一致' },
          { status: 'ok', title: '风险面扫描', desc: '35 维计数已出（示意）' },
          { status: 'warn', title: '关键人核验', desc: '缺身份核验说明 · 人侧章节暂停' },
          { status: 'run', title: '报告章节生成', desc: '企业侧清单继续写' },
          { status: 'todo', title: '质量检查', desc: '定稿后进入我的报告交付' }
        ],
        questions: [
          {
            id: 'q-person',
            chapterId: 'risk-person',
            paused: true,
            title: '关键人身份核验材料待补',
            body: '法代/实控个人风险章依赖身份核验说明。仅人侧章节暂停；企业司法 / 处罚清单继续。可上传说明、人工确认同名，或暂时跳过。',
            actions: [
              { act: 'upload', label: '上传核验说明' },
              { act: 'answer', label: '确认同名已核' },
              { act: 'skip', label: '暂时跳过' }
            ]
          }
        ],
        findings: [
          {
            id: 'rf1',
            tri: 'ok',
            title: '企业自身 · 失信 / 被执行',
            body: '事实：当前公开面失信 0、被执行 0（示意 · T+0）。不构成可否合作结论。',
            included: true
          },
          {
            id: 'rf2',
            tri: 'warn',
            title: '行政处罚 · 待核实',
            body: '事实：近三年市场监管处罚计数 1（示意）。待核实：是否与主营相关、是否已整改。',
            included: false
          }
        ],
        chapters: [
          { id: 'risk-summary', title: '风险扫描摘要', status: 'ok', note: '已生成' },
          { id: 'risk-judicial', title: '司法与执行', status: 'ok', note: '已生成', locked: true },
          { id: 'risk-admin', title: '行政处罚', status: 'run', note: '生成中…' },
          {
            id: 'risk-person',
            title: '关键人公开风险',
            status: 'warn',
            note: '局部暂停 · 缺核验说明'
          },
          { id: 'risk-gap', title: '材料与缺口', status: 'todo', note: '待闭合' }
        ],
        evidenceByChapter: {
          'risk-summary': ['企业风险扫描 · 35 维计数（示意）'],
          'risk-judicial': ['中国执行信息公开网 · T+0'],
          'risk-admin': ['信用中国 / 市监处罚（示意）'],
          'risk-person': ['待补：关键人身份核验'],
          'risk-gap': ['材料清单']
        },
        draftByChapter: {
          'risk-summary': {
            title: '一、风险扫描摘要',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 企业自身公开面：失信 0、被执行 0、限高 0（示意）。处罚维计数 1，见下章。</p><p><strong>边界：</strong>只陈述命中维度与计数，不替银行判定能否授信。</p>'
          },
          'risk-judicial': {
            title: '二、司法与执行',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 未发现当前在册失信 / 被执行记录（示意）。本章已锁定。</p>'
          },
          'risk-admin': {
            title: '三、行政处罚',
            html: '<p><span class="tri-warn">【待核实】</span> 近三年市场监管处罚 1 条（示意），明细生成中。</p>'
          },
          'risk-person': {
            title: '四、关键人公开风险',
            html:
              '<p><span class="tri-na">【暂无法分析】</span> 缺关键人身份核验说明，暂不下钻个人风险明细，避免同名误挂。</p>'
          },
          'risk-gap': {
            title: '五、材料与缺口',
            html: '<p>待补：关键人身份核验说明。企业侧公开面清单可先行核验。</p>'
          }
        }
      },
      'task-huacheng-screen': {
        id: 'task-huacheng-screen',
        capTitle: '项目初筛报告',
        shortTitle: '项目初筛报告',
        title: '某科技（苏州）有限公司 · 项目初筛报告',
        enterprise: '某科技（苏州）有限公司',
        enterpriseId: 'cust-huacheng',
        progress: 48,
        statusLabel: '待确认关键问题',
        taskBucket: 'action',
        launchMaterials: [
          { id: 's1', name: '营业执照.pdf', state: 'reuse' },
          { id: 's2', name: '一页纸材料包', state: 'reuse' },
          { id: 's3', name: '行业许可 / 资质', state: 'miss' }
        ],
        steps: [
          { status: 'ok', title: '主体锚定', desc: '工商照面就绪' },
          { status: 'ok', title: '公开面快扫', desc: '司法 / 处罚计数已出' },
          { status: 'warn', title: '资质完整性', desc: '缺行业许可 · 红旗章局部暂停' },
          { status: 'run', title: '初筛一页纸', desc: '有证据段落继续写' },
          { status: 'todo', title: '质量检查', desc: '定稿后进入我的报告交付' }
        ],
        questions: [
          {
            id: 'q-lic',
            chapterId: 'scr-flag',
            paused: true,
            title: '行业许可材料待补',
            body: '红旗清单中「资质缺口」依赖行业许可。仅该红旗及相关表述暂停；主体概况与公开面红旗继续。可上传许可、说明不适用，或暂时跳过。',
            actions: [
              { act: 'upload', label: '上传许可' },
              { act: 'answer', label: '说明不适用' },
              { act: 'skip', label: '暂时跳过' }
            ]
          }
        ],
        findings: [
          {
            id: 'sf1',
            tri: 'ok',
            title: '主体存续正常',
            body: '事实：存续，软件和信息技术服务业（示意）。适合进入初筛一页纸。',
            included: true
          },
          {
            id: 'sf2',
            tri: 'warn',
            title: '资质缺口红旗',
            body: '待核实：行业许可材料未上传；是否属本行业必持证待确认。',
            included: false
          }
        ],
        chapters: [
          { id: 'scr-onepager', title: '初筛一页纸', status: 'run', note: '生成中…' },
          { id: 'scr-entity', title: '主体与行业', status: 'ok', note: '已生成', locked: true },
          {
            id: 'scr-flag',
            title: '红旗清单',
            status: 'warn',
            note: '资质项暂停'
          },
          { id: 'scr-focus', title: '建议关注点', status: 'todo', note: '待红旗闭合' },
          { id: 'scr-gap', title: '材料与缺口', status: 'warn', note: '许可待补' }
        ],
        evidenceByChapter: {
          'scr-onepager': ['汇总下游章'],
          'scr-entity': ['财跃启明星工商照面 · T+3'],
          'scr-flag': ['公开面扫描', '待补：行业许可'],
          'scr-focus': ['红旗清单派生'],
          'scr-gap': ['材料清单']
        },
        draftByChapter: {
          'scr-onepager': {
            title: '一、初筛一页纸',
            html:
              '<p>某科技 · 初筛摘要生成中。将汇总主体、公开面红旗与材料缺口；<strong>不含投否结论</strong>。</p>'
          },
          'scr-entity': {
            title: '二、主体与行业',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 某科技（苏州）有限公司，存续，软件和信息技术服务业。本章已锁定。</p>'
          },
          'scr-flag': {
            title: '三、红旗清单',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 公开面：失信 / 被执行未见在册记录（示意）。</p><p><span class="tri-na">【暂无法分析】</span> 行业许可未上传，资质红旗不作「已确认无证」表述。</p>'
          },
          'scr-focus': {
            title: '四、建议关注点',
            html: '<p>待红旗清单闭合后列出尽调优先核验项（示意）。</p>'
          },
          'scr-gap': {
            title: '五、材料与缺口',
            html: '<p><span class="tri-warn">【待核实】</span> 待补：行业许可 / 资质材料。</p>'
          }
        }
      },
      'task-huacheng-ubo': {
        id: 'task-huacheng-ubo',
        capTitle: '受益所有人报告',
        shortTitle: '受益所有人报告',
        title: '某科技（苏州）有限公司 · 受益所有人报告',
        enterprise: '某科技（苏州）有限公司',
        enterpriseId: 'cust-huacheng',
        progress: 72,
        statusLabel: '待确认关键问题',
        taskBucket: 'action',
        launchMaterials: [
          { id: 'u1', name: '营业执照.pdf', state: 'reuse' },
          { id: 'u2', name: '公司章程.pdf', state: 'reuse' },
          { id: 'u3', name: '受益所有人声明原件', state: 'miss' },
          { id: 'u4', name: '境外穿透材料', state: 'miss' }
        ],
        steps: [
          { status: 'ok', title: '开户企业锚定', desc: '工商照面核验一致' },
          { status: 'ok', title: '穿透识别 UBO / 实控', desc: '张启明 47.6955% / 53.0011%（示意）' },
          { status: 'ok', title: '自然人反向检索', desc: '名下任职 / 投资 / 实控企业成网' },
          { status: 'warn', title: '问题卡', desc: '境外层暂无法分析 · 声明待补' },
          { status: 'run', title: '章节生成', desc: '有证据章节继续写' }
        ],
        questions: [
          {
            id: 'q-bvi',
            chapterId: 'ubo-5',
            paused: true,
            title: '境外中间层未穿透',
            body: '某 BVI 持股层（mock）境内只见一层。仅依赖境外穿透的表述暂停；UBO 表与境内反向关联章继续。可上传境外证明、人工填写，或标「暂无法分析」后继续。',
            actions: [
              { act: 'upload', label: '上传境外证明' },
              { act: 'answer', label: '人工填写路径' },
              { act: 'skip', label: '标暂无法分析' }
            ]
          }
        ],
        findings: [
          {
            id: 'uf1',
            tri: 'ok',
            title: 'UBO · 张启明',
            body: '最终受益股份 47.6955%；表决权 53.0011%（示意逐字引用）。受益类型：25%以上股权 / 表决权 / 实际控制。',
            included: true
          },
          {
            id: 'uf2',
            tri: 'warn',
            title: '反向关联 · 澄海商贸',
            body: '张启明任法定代表人；与某科技是否存在资金往来 / 担保待核实。关联企业被执行计数 2（示意）。',
            included: false
          },
          {
            id: 'uf3',
            tri: 'na',
            title: '境外穿透',
            body: '暂无法分析——缺境外工商二次穿透材料。',
            included: false
          }
        ],
        chapters: [
          { id: 'ubo-1', title: '执行摘要', status: 'run', note: '汇总中' },
          { id: 'ubo-2', title: '开户企业锚定', status: 'ok', note: '已生成' },
          { id: 'ubo-3', title: '受益所有人与实控', status: 'ok', note: '已生成', locked: true },
          { id: 'ubo-4', title: '股权与控制关系', status: 'ok', note: '已生成' },
          { id: 'ubo-5', title: '自然人反向关联企业', status: 'warn', note: '境外层暂停' },
          { id: 'ubo-6', title: '关系网络总览', status: 'run', note: '生成中…' },
          { id: 'ubo-7', title: '风险画像', status: 'ok', note: '计数已出 · 可下钻' },
          { id: 'ubo-9', title: '材料与缺口', status: 'warn', note: '声明原件待补' }
        ],
        evidenceByChapter: {
          'ubo-2': ['财跃启明星企业基座 · 照面 8 项'],
          'ubo-3': ['受益所有人接口 · 采集日 mock 2026-07-20'],
          'ubo-5': ['董监高任职投资（示意）', '待补：境外穿透'],
          'ubo-7': ['风险扫描计数 · 人自身 / 人关联 / 企业关联']
        },
        draftByChapter: {
          'ubo-1': {
            title: '执行摘要',
            html:
              '<p><span class="tri-ok">【证据充分】</span> 开户企业某科技，识别受益所有人张启明：最终受益股份 47.6955%、表决权 53.0011%（示意逐字引用）。</p><p><span class="tri-warn">【待核实】</span> 张启明关联澄海商贸往来性质待核实。</p><p><span class="tri-na">【暂无法分析】</span> 境外中间层缺二次穿透。</p><p><strong>边界：</strong>本报告陈述公开关系与风险事实及材料缺口，不构成开户或授信决定。</p>'
          },
          'ubo-3': {
            title: '受益所有人与实控',
            html:
              '<p>张启明：最终受益股份 47.6955%；表决权 53.0011%。李婉清（标准二，mock）。本章已锁定。</p>'
          },
          'ubo-5': {
            title: '自然人反向关联企业',
            html:
              '<p>张启明：苏州市澄海商贸有限公司（法定代表人，被执行计数 2）；苏州启明咨询有限公司（投资）。</p><p><span class="tri-na">【暂无法分析】</span> 某境外控股层——缺境外工商二次穿透材料。</p>'
          },
          'ubo-7': {
            title: '风险画像',
            html:
              '<p>张启明个人：失信 0、限高 0、被执行 0（mock）。澄海商贸：被执行计数 2。仅陈述命中维度与计数；是否影响开户由银行规则判定。</p>'
          }
        }
      }
    },
    /** IA v1.3 · 任务中心 */
    tasks: [
      {
        id: 'task-huacheng-dd',
        status: 'action',
        title: '某科技 · 授信尽调报告 · 待确认关键问题',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-dd',
        updated: '今天 10:22'
      },
      {
        id: 'task-huacheng-fin',
        status: 'action',
        title: '某科技 · 财务分析报告 · 待确认关键问题',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-fin',
        updated: '今天 10:18'
      },
      {
        id: 'task-huacheng-ubo',
        status: 'action',
        title: '某科技 · 受益所有人报告 · 待确认关键问题',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-ubo',
        updated: '今天 10:05'
      },
      {
        id: 'task-huacheng-risk',
        status: 'action',
        title: '某科技 · 风险排查报告 · 待确认关键问题',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-risk',
        updated: '今天 09:58'
      },
      {
        id: 'task-huacheng-screen',
        status: 'running',
        title: '某科技 · 项目初筛报告 · 生成中',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-screen',
        updated: '今天 09:50'
      },
      {
        id: 'tk1',
        status: 'action',
        title: '某科技 · 财报 OCR 有 3 处数字待确认',
        enterprise: '某科技（苏州）有限公司',
        route: 'project/proj-huacheng/ocr',
        updated: '今天 10:18'
      },
      {
        id: 'tk2',
        status: 'wait_mat',
        title: '某科技 · 尽调报告缺少流水 · 收入章局部暂停',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-dd',
        updated: '今天 09:40'
      },
      {
        id: 'tk3',
        status: 'running',
        title: '某科技 · 新材料影响章节 · 报告生成中',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-dd',
        updated: '今天 09:12'
      },
      {
        id: 'tk4',
        status: 'wait_mat',
        title: '某科技 · 受益所有人 · 声明原件与境外材料待补',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-ubo',
        updated: '昨天'
      },
      {
        id: 'tk4b',
        status: 'wait_mat',
        title: '某科技 · 财务分析 · 科目余额表待补',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-fin',
        updated: '今天 09:30'
      },
      {
        id: 'tk4c',
        status: 'wait_mat',
        title: '某科技 · 风险排查 · 关键人核验说明待补',
        enterprise: '某科技（苏州）有限公司',
        route: 'task/task-huacheng-risk',
        updated: '今天 09:25'
      },
      {
        id: 'tk5',
        status: 'wait_mat',
        title: '明达 · 营业执照与审计报告未上传',
        enterprise: '某贸易有限公司',
        route: 'enterprise/cust-mingda',
        updated: '昨天'
      },
      {
        id: 'tk6',
        status: 'done',
        title: '海河 · 差异报告初审已完成',
        enterprise: '某智能制造股份有限公司',
        route: 'enterprise/cust-haihe',
        updated: '07-18'
      },
      {
        id: 'tk7',
        status: 'failed',
        title: '明达 · OCR 引擎超时（可重试）',
        enterprise: '某贸易有限公司',
        route: 'enterprise/cust-mingda',
        updated: '07-17'
      }
    ],
    /** IA v1.3 · 我的报告：仅已完成 / 已定稿 / 可下载（生成中·草稿在任务中心） */
    artifacts: [
      {
        id: 'art-dd-done',
        kind: 'report',
        title: '明达 · 客户调查报告',
        status: '已定稿',
        enterprise: '某贸易有限公司',
        updated: '昨天 16:20',
        route: 'enterprise/cust-mingda',
        gaps: 0
      },
      {
        id: 'art3',
        kind: 'list',
        title: '某科技 · 材料缺口清单',
        status: '已完成',
        enterprise: '某科技（苏州）有限公司',
        updated: '今天 09:40',
        route: 'enterprise/cust-huacheng',
        gaps: 0
      },
      {
        id: 'art-ubo-done',
        kind: 'report',
        title: '明达 · 受益所有人报告',
        status: '可下载',
        enterprise: '某贸易有限公司',
        updated: '昨天 15:10',
        route: 'enterprise/cust-mingda',
        gaps: 0
      },
      {
        id: 'art5',
        kind: 'graph',
        title: '某科技 · 股权穿透示意',
        status: '已完成',
        enterprise: '某科技（苏州）有限公司',
        updated: '昨天',
        route: 'enterprise/cust-huacheng',
        gaps: 0
      }
    ],
    adminLinks: [
      { title: '报告模版', desc: '章节骨架 · 固定段 / 可编辑段', route: 'pack/tpl' },
      { title: '材料清单', desc: '对公尽调材料类型与必填', route: 'pack/materials-types' },
      { title: '财务配置', desc: '科目 / 指标 / 规则（与 PE 同页）', route: 'finance-config' },
      { title: '分析框架', desc: '授信 / 初筛等框架', route: 'config/frameworks' },
      { title: '风险规则', desc: '公开面红旗规则', route: 'config/risk' },
      { title: '用户与角色', desc: '管理员 / 客经可见差', route: 'sys/roles' },
      { title: '数据源管理', desc: '财跃启明星 / OCR 等', route: 'sys/datasources' },
      { title: '操作日志', desc: '配置发布与导出记录', route: 'sys/logs' }
    ],

    monitorLead: '实时追踪尽调项目的企业变更与风险信号，AI 每日生成摘要，重点动态自动标记。',

    monitorBrief: {
      aiLabel: 'AI 综合解读',
      title: '近 7 日企业动态摘要',
      meta: '2026-07-20 08:00 更新',
      summary: '本周某科技出现股权质押与工商变更，建议尽快核查资金用途；某贸易无重大异常，尽调进度正常；海河智造材料缺口仍未补齐，尽调推进受阻。',
      riskTitle: '重点风险',
      riskText: '某科技实控人将 18% 股权质押给兴业银行，疑似融资困境；海河智造银行流水超期 14 天未提交，建议升级催收。',
      positiveTitle: '正向进展',
      positiveText: '某贸易新增发明专利 2 项，技术实力材料入库完整，尽调可按期推进。',
      actionTitle: '建议跟进',
      actionText: '①某科技：追问股权质押原因与资金用途；②海河智造：升级催收流水，或评估换口径说明。'
    },

    monitorCompanies: [
      { key: 'cust-huacheng', company: '某科技（苏州）有限公司', projectName: '某科技 · 授信尽调', alertCount: 2 },
      { key: 'cust-mingda',   company: '某贸易有限公司',         projectName: '某贸易 · 授信尽调',   alertCount: 0 },
      { key: 'cust-haihe',   company: '某智能制造股份有限公司',  projectName: '海河智造 · AML 复评', alertCount: 1 }
    ],

    monitorFeed: [
      {
        id: 'mf1',
        company: '某科技（苏州）有限公司', projectName: '某科技 · 授信尽调',
        dimension: '股权质押', change: '实控人张启明将 18% 股权质押给兴业银行，质押日 2026-07-18，质押期 1 年。',
        time: '今天 09:10', triggered: true, positive: false
      },
      {
        id: 'mf2',
        company: '某科技（苏州）有限公司', projectName: '某科技 · 授信尽调',
        dimension: '工商变更', change: '经营范围新增「供应链管理、商务信息咨询」，已完成工商登记。',
        time: '昨天 14:30', triggered: true, positive: false
      },
      {
        id: 'mf3',
        company: '某贸易有限公司', projectName: '某贸易 · 授信尽调',
        dimension: '知识产权', change: '新增发明专利授权 2 项，涉及生产流程优化，技术实力佐证材料已更新入库。',
        time: '07-18', triggered: false, positive: true
      },
      {
        id: 'mf4',
        company: '某智能制造股份有限公司', projectName: '海河智造 · AML 复评',
        dimension: '材料缺口', change: '银行流水（近 12 个月）已催收 2 次，截至今日仍未入库，尽调推进受阻。',
        time: '07-17', triggered: true, positive: false
      },
      {
        id: 'mf5',
        company: '某贸易有限公司', projectName: '某贸易 · 授信尽调',
        dimension: '司法涉诉', change: '本周无新增诉讼记录，司法涉诉检索清洁，风险状态正常。',
        time: '07-16', triggered: false, positive: true
      },
      {
        id: 'mf6',
        company: '某科技（苏州）有限公司', projectName: '某科技 · 授信尽调',
        dimension: '司法涉诉', change: '新增合同纠纷案件 1 件，作为被告，涉案金额 52 万元，案件受理中。',
        time: '07-10', triggered: false, positive: false
      }
    ],

    monitorRules: [
      {
        id: 'mr1', company: '某科技（苏州）有限公司', projectName: '某科技 · 授信尽调',
        condition: '股权比例变更 > 5% 或新增质押登记', dimension: '股权结构',
        status: '已触发', time: '2026-06-01', triggered: true
      },
      {
        id: 'mr2', company: '全部企业', projectName: '—',
        condition: '司法被执行新增记录或失信被执行人上榜', dimension: '司法风险',
        status: '监控中', time: '2026-06-01', triggered: false
      },
      {
        id: 'mr3', company: '某智能制造股份有限公司', projectName: '海河智造 · AML 复评',
        condition: '指定材料缺口超 14 天未提交', dimension: '材料管理',
        status: '已触发', time: '2026-06-15', triggered: true
      },
      {
        id: 'mr4', company: '全部企业', projectName: '—',
        condition: '工商变更：法定代表人 / 经营范围 / 注册资本变更', dimension: '工商信息',
        status: '监控中', time: '2026-06-01', triggered: false
      },
      {
        id: 'mr5', company: '全部企业', projectName: '—',
        condition: '负面舆情：关键词匹配（欺诈 / 违约 / 行政处罚）', dimension: '舆情监控',
        status: '监控中', time: '2026-07-01', triggered: false
      }
    ],

    enterpriseFeed: {
      'cust-huacheng': [
        {
          id: 'ef-hc-1', time: '今天 09:10', type: '股权质押', level: 'high',
          title: '实控人股权质押（18%）',
          desc: '张启明将持有某科技（苏州）有限公司 18% 股权质押给兴业银行厦门分行，质押日 2026-07-18，期限 12 个月，疑涉融资需求，建议核查资金用途。',
          source: '天眼查'
        },
        {
          id: 'ef-hc-2', time: '昨天', type: '工商变更', level: 'medium',
          title: '经营范围新增「供应链管理」',
          desc: '国家企业信用信息公示系统显示，某科技于 2026-07-18 完成工商变更，新增经营项目含「供应链管理、商务信息咨询」。',
          source: '国家企业信用信息公示'
        },
        {
          id: 'ef-hc-3', time: '07-10', type: '司法涉诉', level: 'medium',
          title: '合同纠纷案件受理',
          desc: '某科技作为被告，与供应商的合同纠纷案已于 2026-07-10 被法院受理，涉案金额约 52 万元，案件进展持续关注。',
          source: '裁判文书网'
        },
        {
          id: 'ef-hc-4', time: '06-28', type: '行政处罚', level: 'low',
          title: '一般性行政处罚记录',
          desc: '税务部门登记一条轻微违规记录，已缴纳罚款，无后续影响，可在尽调报告中注明并取证结案。',
          source: '国家税务总局'
        }
      ],
      'cust-mingda': [
        {
          id: 'ef-md-1', time: '07-18', type: '知识产权', level: 'ok',
          title: '新增发明专利授权 2 项',
          desc: '获得国家知识产权局授权发明专利 2 项，涉及生产工艺优化，技术壁垒有所增强，已更新佐证材料库。',
          source: '国家知识产权局'
        },
        {
          id: 'ef-md-2', time: '07-12', type: '工商变更', level: 'low',
          title: '完成增资，注册资本提升至 6000 万',
          desc: '某贸易完成本轮增资扩股，注册资本从 5000 万增至 6000 万人民币，股东持股比例保持不变，工商登记已完成。',
          source: '工商登记'
        },
        {
          id: 'ef-md-3', time: '07-05', type: '司法', level: 'ok',
          title: '本月无诉讼记录',
          desc: '司法检索显示近 30 日无新增立案或判决记录，司法涉诉状态清洁。',
          source: '法院公告'
        }
      ],
      'cust-haihe': [
        {
          id: 'ef-hh-1', time: '07-17', type: '材料缺口', level: 'high',
          title: '银行流水超期未交（14 天）',
          desc: '要求提交近 12 个月银行流水，已于 07-03 和 07-10 两次催收，截至今日仍未入库，已触发预警条件，建议升级跟进。',
          source: '内部任务跟踪'
        },
        {
          id: 'ef-hh-2', time: '07-14', type: '工商变更', level: 'medium',
          title: '法定代表人变更',
          desc: '法定代表人由王建国变更为现任总经理刘洋，工商登记已更新，建议在尽调报告中更新授权人信息及签字章程。',
          source: '国家企业信用信息公示'
        },
        {
          id: 'ef-hh-3', time: '07-08', type: '资质证书', level: 'ok',
          title: '建设工程资质年检通过',
          desc: '某智能制造完成建设工程施工总承包二级资质年检，证书有效期顺延至 2028 年，无降级风险。',
          source: '建设部门官网'
        }
      ]
    }
  };
})();
