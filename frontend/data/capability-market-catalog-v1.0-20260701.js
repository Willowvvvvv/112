/**
 * 能力市场 Mock 目录（对齐 agent-demo skills-catalog + connectors-catalog）
 * 版本: v1.0 | 日期: 2026-07-01
 */

export const PLATFORM_SKILL_CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "sourcing", label: "标的发现" },
  { id: "screening", label: "初筛打分" },
  { id: "public-check", label: "公开核查" },
  { id: "deep-dd", label: "深度尽调" },
  { id: "interview", label: "访谈核实" },
  { id: "ic-prep", label: "上会交付" },
  { id: "post-inv", label: "投后跟踪" },
  { id: "expert", label: "专家能力" },
];

export const PLATFORM_SKILLS_CATALOG = [
  { id: "dd-target-brief", name: "标的速览", category: "public-check", description: "一页式企业基本面与核心风险速览，适合初筛与内部汇报。" },
  { id: "dd-entity-anchor", name: "主体锚定核验", category: "public-check", description: "尽调前确认目标主体：工商照面、股权结构与主要风险信号。" },
  { id: "dd-cap-table", name: "股权结构穿透", category: "public-check", description: "多层股权结构解析，标注实控人、一致行动与隐性关联。" },
  { id: "dd-beneficial-owner", name: "受益所有人识别", category: "public-check", description: "穿透股权识别最终受益人与实控关系。" },
  { id: "dd-key-person", name: "关键人背景核查", category: "public-check", description: "董监高及实控人的司法、任职与关联企业风险画像。" },
  { id: "dd-judicial-scan", name: "司法风险扫描", category: "public-check", description: "企业与核心人员的诉讼、执行与限高等司法风险分层梳理。" },
  { id: "pe-funding-track", name: "融资历程梳理", category: "public-check", description: "追溯历次融资与股权变化，辅助理解估值与条款演变。" },
  { id: "dd-corporate-timeline", name: "沿革时间线", category: "public-check", description: "按时间线梳理工商变更、股权演变与关键里程碑。" },
  { id: "pe-peer-compare", name: "同业横向对比", category: "screening", description: "多家主体的工商、知产与经营信号横向对比。" },
  { id: "dd-ip-inventory", name: "知产资产盘点", category: "deep-dd", description: "专利、商标与软著清单及有效性状态快速盘点。" },
  { id: "dd-business-signals", name: "经营信号扫描", category: "deep-dd", description: "结合招聘、中标与舆情等信号判断经营活跃度。" },
  { id: "dd-signatory-check", name: "签约主体核验", category: "deep-dd", description: "签约前快速确认相对方存续、法代与经营异常。" },
  { id: "dd-labor-risk", name: "用工合规排查", category: "deep-dd", description: "劳动仲裁、社保欠缴与行政处罚等用工风险排查。" },
  { id: "dd-ip-conflict", name: "知产冲突预警", category: "deep-dd", description: "商标近似与专利覆盖范围的潜在冲突识别。" },
  { id: "dd-license-check", name: "资质证照核验", category: "deep-dd", description: "行业许可与证照有效期的批量核验与到期提示。" },
  { id: "pe-ic-skeleton", name: "IC 骨架整理", category: "ic-prep", description: "立项阶段把工商、股权、司法与知产要点整理成投委会备忘录骨架。" },
  { id: "post-distress-watch", name: "困境预警监控", category: "post-inv", description: "破产重整、清算公告等节点的持续监控与提醒。" },
  { id: "huashu-nuwa", name: "专家视角蒸馏", category: "expert", description: "从人物或主题提炼思维框架，蒸馏为可复用的专家视角技能。" },
];

export const PLATFORM_CONNECTORS_CATALOG = [
  {
    id: "qcc",
    name: "企查查连接器",
    category: "公开数据",
    description: "工商照面、股权结构、风控司法、知识产权、经营信息与董监高画像等全量公开数据。底层 6 路数据服务、约 180 个查询能力，安装后一次性接入。",
    serverCount: 6,
    installKey: "qcc",
  },
  {
    id: "pkulaw",
    name: "北大法宝连接器",
    category: "法律研究",
    description: "法规关键词/语义检索、案例检索、法条精确查询等官方法律智能服务。底层 1 路聚合 MCP，覆盖法规与司法案例双库。",
    serverCount: 1,
    installKey: "pkulaw",
  },
  {
    id: "fuyao",
    name: "同花顺扶摇连接器",
    category: "二级补证",
    description: "A 股代码检索、行情快照、历史行情与财报三表等结构化金融数据。底层 2 路 MCP，适合已上市对标与估值补证。",
    serverCount: 2,
    installKey: "fuyao",
  },
  {
    id: "tushare",
    name: "Tushare 连接器",
    category: "二级补证",
    description: "Tushare 官方 Remote MCP，覆盖 A 股基础信息、行情、财务三表与宏观等 200+ 数据接口。",
    serverCount: 1,
    installKey: "tushare",
  },
];

export const EXPERT_CATEGORY_LABELS = {
  finance: "财务",
  risk: "风控",
  industry: "行业",
  skill: "技能",
};

const CATEGORY_LABEL_MAP = Object.fromEntries(
  PLATFORM_SKILL_CATEGORIES.filter((c) => c.id !== "all").map((c) => [c.id, c.label]),
);

export function getSkillCategoryLabel(categoryId) {
  return CATEGORY_LABEL_MAP[categoryId] || categoryId;
}

const MARKET_LEADS = {
  "expert-official": "平台预置 AI 专家，可直接召唤进入对话。",
  "expert-my": "你创建的 AI 专家，可编辑与召唤。",
  "skill-official": "平台预置场景技能，一键安装到默认助手工作区。",
  "skill-my": "你已收藏的技能，可再次安装到工作区。",
  "connector-official": "平台预置数据连接器，一键安装到默认助手工作区。",
  "connector-my": "已安装的连接器；自定义 MCP 在对话高级配置中管理。",
};

export function getMarketLead(kind, scope) {
  return MARKET_LEADS[`${kind}-${scope}`] || MARKET_LEADS["skill-official"];
}

export function findPlatformSkill(skillId) {
  return PLATFORM_SKILLS_CATALOG.find((s) => s.id === skillId) || null;
}

export function findPlatformConnector(installKey) {
  return PLATFORM_CONNECTORS_CATALOG.find((c) => c.installKey === installKey) || null;
}
