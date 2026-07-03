/**
 * 建项入场分析 — 高保真 Demo 预设（任意新建项目均生成完整 mock）
 * 版本: v1.1 | 日期: 2026-06-28
 */

const CITY_META = {
  杭州: { region: "浙江省杭州市滨江区", creditPrefix: "91330108", district: "滨江" },
  苏州: { region: "江苏省苏州市工业园区", creditPrefix: "91320594", district: "工业园" },
  上海: { region: "上海市浦东新区", creditPrefix: "91310115", district: "浦东" },
  北京: { region: "北京市海淀区", creditPrefix: "91110108", district: "海淀" },
  深圳: { region: "广东省深圳市南山区", creditPrefix: "91440300", district: "南山" },
  南京: { region: "江苏省南京市江宁区", creditPrefix: "91320115", district: "江宁" },
  广州: { region: "广东省广州市天河区", creditPrefix: "91440106", district: "天河" },
  天津: { region: "天津市滨海新区", creditPrefix: "91120116", district: "滨海" }
};

const SEED_SIMILAR_TECHSAAS = [
  {
    id: "seed-mes-sh",
    name: "上海某 MES 软件",
    company: "上海某制造执行系统科技有限公司",
    sector: "工业软件",
    round: "A 轮",
    currentStatus: "已投 · 已结案",
    ddStage: "投后跟踪",
    verdict: "制造业 SaaS 订阅模型验证通过，最终投资",
    keyRisks: ["大客户定制占比偏高", "实施交付人效"],
    relevanceNote: "同为制造业数字化 SaaS，订阅续费与交付边界是核心分歧点",
    projectId: "proj-mes-sh-004"
  },
  {
    id: "seed-vision-sz",
    name: "深圳某工业视觉检测",
    company: "深圳某工业视觉科技有限公司",
    sector: "机器视觉",
    round: "Pre-A",
    currentStatus: "已放弃",
    ddStage: "已终止",
    verdict: "Top3 客户占比超 70%，集中度否决",
    keyRisks: ["客户集中度", "应收账期超 180 天", "硬件绑定导致毛利波动"],
    relevanceNote: "同赛道机器视觉标的，客户集中度与应收是此前 IC 否决主因",
    projectId: "proj-vision-sz-005"
  },
  {
    id: "seed-lease-semi",
    name: "苏州某半导体设备融资租赁",
    company: "苏州某半导体设备科技有限公司",
    sector: "高端制造",
    round: "售后回租",
    currentStatus: "已投 · 已结案",
    ddStage: "投后",
    verdict: "资产质量核实通过，最终投资",
    keyRisks: ["关联方回租占比 71%", "应收账款账期拉长"],
    relevanceNote: "下游同为华东制造客户群，可对照产线投资节奏与设备采购周期",
    projectId: "proj-lease-002"
  }
];

const SEED_SIMILAR_BIOMED = [
  {
    id: "seed-bioray-tj",
    name: "天津某溶瘤病毒平台",
    company: "天津某溶瘤病毒平台有限公司",
    sector: "生物医药",
    round: "B 轮",
    currentStatus: "已投 · 已结案",
    ddStage: "投后跟踪",
    verdict: "IP 壁垒验证通过，最终投资",
    keyRisks: ["商业化路径节奏", "IIT 数据外推至 III 期"],
    relevanceNote: "同为生物医药创新药，均涉及 IP 壁垒与商业化路径判断",
    projectId: "proj-bioray-001"
  },
  {
    id: "seed-bioray-sz",
    name: "深圳某基因治疗平台",
    company: "深圳某基因治疗平台有限公司",
    sector: "生物医药",
    round: "Pre-B",
    currentStatus: "已放弃",
    ddStage: "已终止",
    verdict: "商业化路径不清晰，放弃",
    keyRisks: ["管线单一", "下游支付意愿未验证"],
    relevanceNote: "同为 Pre-B 生物医药，可作为放弃案例对照",
    projectId: "proj-bioray-001"
  },
  {
    id: "seed-mes-sh",
    name: "上海某 MES 软件",
    company: "上海某制造执行系统科技有限公司",
    sector: "工业软件",
    round: "A 轮",
    currentStatus: "已投 · 已结案",
    ddStage: "投后跟踪",
    verdict: "制造业 SaaS 订阅模型验证通过，最终投资",
    keyRisks: ["大客户定制占比偏高", "实施交付人效"],
    relevanceNote: "制造下游数字化投入节奏可作商业化参照",
    projectId: "proj-mes-sh-004"
  }
];

const SEED_SIMILAR_LEASE = [
  {
    id: "seed-lease-semi",
    name: "苏州某半导体设备融资租赁",
    company: "苏州某半导体设备科技有限公司",
    sector: "融资租赁",
    round: "售后回租",
    currentStatus: "已投 · 已结案",
    ddStage: "投后",
    verdict: "资产质量核实通过，最终投资",
    keyRisks: ["关联方回租占比 71%", "应收账款账期拉长"],
    relevanceNote: "同为设备类售后回租，关注关联方集中度与资产真实性",
    projectId: "proj-lease-002"
  },
  {
    id: "seed-vision-sz",
    name: "深圳某工业视觉检测",
    company: "深圳某工业视觉科技有限公司",
    sector: "机器视觉",
    round: "Pre-A",
    currentStatus: "已放弃",
    ddStage: "已终止",
    verdict: "Top3 客户占比超 70%，集中度否决",
    keyRisks: ["客户集中度", "应收账期超 180 天"],
    relevanceNote: "设备类下游客户群重叠，可对照应收与集中度",
    projectId: "proj-vision-sz-005"
  },
  {
    id: "seed-mes-sh",
    name: "上海某 MES 软件",
    company: "上海某制造执行系统科技有限公司",
    sector: "工业软件",
    round: "A 轮",
    currentStatus: "已投 · 已结案",
    ddStage: "投后跟踪",
    verdict: "制造业 SaaS 订阅模型验证通过，最终投资",
    keyRisks: ["大客户定制占比偏高"],
    relevanceNote: "制造业主体客户群可作交叉验证",
    projectId: "proj-mes-sh-004"
  }
];

const SEED_SIMILAR_NEWENERGY = [
  {
    id: "seed-ne-solid",
    name: "北京某固态电解质材料",
    company: "北京某固态电解质材料有限公司",
    sector: "新能源",
    round: "A 轮",
    currentStatus: "已放弃",
    ddStage: "已终止",
    verdict: "量产节奏存疑，放弃",
    keyRisks: ["技术路线分叉", "产能爬坡不及预期"],
    relevanceNote: "同为新能源材料赛道，技术路线与量产节奏是核心分歧点",
    projectId: "proj-newenergy-003"
  },
  {
    id: "seed-lease-semi",
    name: "苏州某半导体设备融资租赁",
    company: "苏州某半导体设备科技有限公司",
    sector: "高端制造",
    round: "售后回租",
    currentStatus: "已投 · 已结案",
    ddStage: "投后",
    verdict: "资产质量核实通过，最终投资",
    keyRisks: ["关联方回租占比 71%"],
    relevanceNote: "新能源产线扩产与设备采购周期相关",
    projectId: "proj-lease-002"
  },
  {
    id: "seed-vision-sz",
    name: "深圳某工业视觉检测",
    company: "深圳某工业视觉科技有限公司",
    sector: "机器视觉",
    round: "Pre-A",
    currentStatus: "已放弃",
    ddStage: "已终止",
    verdict: "Top3 客户占比超 70%，集中度否决",
    keyRisks: ["客户集中度"],
    relevanceNote: "产线自动化需求与视觉检测场景存在交集",
    projectId: "proj-vision-sz-005"
  }
];

export function normalizeEntryBriefCompanyKey(company) {
  return String(company || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/有限公司$/g, "")
    .replace(/有限责任公司$/g, "")
    .replace(/股份有限公司$/g, "");
}

export function inferDemoBriefKind(company, projectName) {
  const text = `${company} ${projectName}`;
  if (/生物|医药|溶瘤|基因|药/.test(text)) return "biomed";
  if (/租赁|回租|微电子|设备/.test(text)) return "lease";
  if (/固态|电解质|新能源|电池|光伏|储能/.test(text)) return "newenergy";
  if (/科技|软件|信息|智能|数据|网络|数字|云/.test(text)) return "techsaas";
  return "techsaas";
}

function companyShortLabel(company) {
  return normalizeEntryBriefCompanyKey(company) || String(company || "").trim();
}

function inferCityMeta(company) {
  for (const [city, meta] of Object.entries(CITY_META)) {
    if (company.includes(city)) return { city, ...meta };
  }
  return { city: "杭州", ...CITY_META["杭州"] };
}

function demoCreditCode(company, prefix) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = (hash * 31 + company.charCodeAt(i)) >>> 0;
  }
  const tail = (hash % 100000000).toString().padStart(8, "0");
  return `${prefix}MA${tail.slice(0, 1)}${tail.slice(1, 4)}${tail.slice(4, 8)}`;
}

function profileForKind(kind, company, district) {
  const label = companyShortLabel(company);
  if (kind === "biomed") {
    return [
      { key: "industry", summary: `${label} 处于创新药 / 生物治疗相关赛道；产业链偏研发与临床转化，核心资产为管线 IP 与临床数据包。` },
      { key: "market", summary: "下游以医院、医保与商业支付为主；适应症拓展与商业化路径是估值核心变量。BP 口径：在研管线 2 条，核心品种处于 II 期临床。" },
      { key: "finance", summary: "Pre-B / B 轮阶段研发支出占比高；2024 年研发费用约 3,200 万元。需重点核实其他应收、关联方往来与预付款结构。" },
      { key: "legal", summary: "股权结构相对集中，实控人持股约 41%；核心专利 8 项（申请中 3 项）。公开面未见当前失信 / 被执行记录。" },
      { key: "risk", summary: "公开面扫描司法 / 经营异常当前 0 条。尽调关注：临床进度披露一致性、CRO 合同金额、核心团队竞业与 IP 归属。" }
    ];
  }
  if (kind === "lease") {
    return [
      { key: "industry", summary: `${label} 从事高端制造设备售后回租；资产端质量与权属清晰性是安全边际核心。` },
      { key: "market", summary: "下游以制造业与园区客户为主；2024 年新增租赁合同 23 笔，平均单笔融资金额约 1,850 万元。" },
      { key: "finance", summary: "2024 年应收融资租赁款余额约 4.2 亿元，平均账期 14.6 个月；经营性现金流覆盖倍数约 1.3x（管理层口径，待明细勾稽）。" },
      { key: "legal", summary: "担保链条涉及 2 层 SPV；2023 年有 1 次股权出质登记（已解除）。公开面无当前被执行 / 失信。" },
      { key: "risk", summary: "尽调关注：关联方回租占比、租赁物重复融资核查、应收账款真实性及残值评估假设。" }
    ];
  }
  if (kind === "newenergy") {
    return [
      { key: "industry", summary: `${label} 位于新能源材料赛道；技术路线（氧化物 / 硫化物等）尚未完全收敛，卡位价值高。` },
      { key: "market", summary: "下游绑定动力电池与储能厂商；2024 年送样客户 12 家，3 家进入小批量供货验证（BP 口径）。" },
      { key: "finance", summary: "天使 + / A 轮早期，2024 年营收约 2,100 万元，毛利率约 38%；产能投入与研发并行，现金 runway 约 14 个月（BP 口径）。" },
      { key: "legal", summary: "核心团队持股平台约 15%；发明专利 11 项，PCT 2 项。无当前司法风险公示记录。" },
      { key: "risk", summary: "尽调关注：技术路线选择、量产进度、关键设备依赖与核心团队稳定性。" }
    ];
  }
  return [
    { key: "industry", summary: `${label} 主营产线机器视觉质检与设备预测性维护 SaaS；赛道属工业互联网软件，交付形态为订阅 + 项目实施。` },
    { key: "market", summary: "下游以汽车零部件、3C 组装等离散制造产线为主；Top5 客户收入占比约 58%，典型年订阅 80–320 万元 / 产线。" },
    { key: "finance", summary: `2024 年营收约 8,500 万元（同比 +42%），毛利率约 62%；A 轮后迁址${district}，人员规模约 180 人（BP 口径）。` },
    { key: "legal", summary: "实控人直接 + 间接持股约 38%，员工持股平台约 12%；发明专利 17 项、软著 23 项。公开面未见当前失信 / 被执行。" },
    { key: "risk", summary: "公开面扫描司法 / 经营异常当前 0 条。尽调关注：客户集中度、应收账期（平均约 165 天）、核心算法团队留存。" }
  ];
}

function similarForKind(kind) {
  if (kind === "biomed") return SEED_SIMILAR_BIOMED;
  if (kind === "lease") return SEED_SIMILAR_LEASE;
  if (kind === "newenergy") return SEED_SIMILAR_NEWENERGY;
  return SEED_SIMILAR_TECHSAAS;
}

function labelsForKind(kind) {
  if (kind === "biomed") return { industryLabel: "生物医药", roundLabel: "Pre-B" };
  if (kind === "lease") return { industryLabel: "融资租赁", roundLabel: "售后回租" };
  if (kind === "newenergy") return { industryLabel: "新能源材料", roundLabel: "天使+" };
  return { industryLabel: "工业软件 / 企业级 AI 应用", roundLabel: "A 轮" };
}

function nextStepsForKind(kind) {
  if (kind === "biomed") return ["行业五维下钻", "查材料缺口", "公开风险下钻"];
  if (kind === "lease") return ["租赁物清单核验", "关联方回租结构下钻", "写尽调报告"];
  if (kind === "newenergy") return ["标的速览", "行业赛道分析", "查材料缺口"];
  return ["公开风险下钻", "查材料缺口", "写尽调报告"];
}

/** 任意新建项目均返回完整高保真 mock */
export function buildDemoEntryBrief(company, projectName) {
  const kind = inferDemoBriefKind(company, projectName);
  const { region, creditPrefix, district } = inferCityMeta(company);
  const { industryLabel, roundLabel } = labelsForKind(kind);
  const similarCases = similarForKind(kind);
  const n = similarCases.length;
  const assistantSummary =
    n > 0
      ? `已为 **${projectName}** 生成入场分析：右侧有企业五维画像和 ${n} 个类似案例参照。你想先从哪块开始？`
      : `已为 **${projectName}** 生成入场分析：右侧有企业五维画像。你想先从哪块开始？`;
  return {
    company,
    projectName,
    creditCode: demoCreditCode(company, creditPrefix),
    region,
    industryLabel,
    roundLabel,
    profile: profileForKind(kind, company, district),
    similarCases,
    nextSteps: nextStepsForKind(kind),
    assistantSummary
  };
}

export function resolveEntryBriefPreset(company, projectName) {
  return buildDemoEntryBrief(company, projectName);
}
