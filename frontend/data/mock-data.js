/**
 * mock-data.js — Demo 静态数据与工厂函数
 * 版本：v4.5.0-20260626
 *
 * 分层：
 * - CURRENT_USER / ORG_MEMBERS：当前用户与机构成员名录（含 org 角色）
 * - PROJECT_LIST / RECENT_ITEMS：侧栏项目（邀请制成员 + 领导跨项目可见）
 * - RADAR_FEED / POLICY_FEED：投资雷达资讯流
 * - USER_ACCOUNT / CREDIT_COSTS：积分与套餐（见文件后部注释）
 * - createSession()：新对话/项目会话初始结构
 */

/** 当前登录用户（Demo 默认视角） */
export const CURRENT_USER = {
  id: "u-zhangming",
  name: "张明",
  avatar: "ZM",
  org: "国投资本",
  dept: "投资部",
  team: "先进制造组",
  role: "staff",
  projRole: "参与分析师"
};

/** 机构成员名录（邀请/头像组/身份切换用） */
export const ORG_MEMBERS = [
  { id: "u-zhangming", name: "张明", avatar: "ZM", dept: "投资部", team: "先进制造组", role: "staff" },
  { id: "u-lifang", name: "李芳", avatar: "LF", dept: "投资部", team: "先进制造组", role: "team_lead" },
  { id: "u-liuhua", name: "刘华", avatar: "LH", dept: "投资部", team: "投资部", role: "dept_lead" },
  { id: "u-wangwei", name: "王伟", avatar: "WW", dept: "风控部", team: "合规组", role: "staff" },
  { id: "u-chenjing", name: "陈静", avatar: "CJ", dept: "研究部", team: "生物医药组", role: "staff" },
  { id: "u-zhaolei", name: "赵磊", avatar: "ZL", dept: "投资部", team: "新能源组", role: "staff" }
];

/** Demo 身份切换预设（员工 / 团队领导 / 部门领导） */
export const DEMO_USER_IDENTITIES = [
  { id: "u-zhangming", label: "张明 · 员工（仅受邀项目）" },
  { id: "u-wangwei", label: "王伟 · 风控合规（跨部门受邀）" },
  { id: "u-lifang", label: "李芳 · 团队领导（本团队全部项目）" },
  { id: "u-liuhua", label: "刘华 · 部门领导（本部门全部项目）" }
];

/** 项目内角色 */
export const PROJ_ROLE_LABELS = {
  analyst: "参与分析师",
  compliance: "合规复核",
  readonly: "只读"
};

export function getOrgMember(userId) {
  return ORG_MEMBERS.find(m => m.id === userId) || null;
}

export function getDemoUser(userId) {
  const base = getOrgMember(userId);
  if (!base) return { ...CURRENT_USER };
  return {
    id: base.id,
    name: base.name,
    avatar: base.avatar,
    org: CURRENT_USER.org,
    dept: base.dept,
    team: base.team,
    role: base.role || "staff"
  };
}

export function memberId(m) {
  return m?.id || m?.userId || "";
}

export function isProjectMember(project, userId) {
  return (project?.members || []).some(m => memberId(m) === userId);
}

export function getProjectRole(project, userId) {
  const m = (project?.members || []).find(m => memberId(m) === userId);
  return m?.projRole || null;
}

export function canDoInProject(project, user, action) {
  const role = getProjectRole(project, user?.id);
  if (!role) return false;
  if (role === "analyst") return action !== "delete";
  if (role === "compliance") return action === "view" || action === "export";
  if (role === "readonly") return action === "view";
  return false;
}

/** 角色驱动的项目可见列表（侧栏与路由共用） */
export function visibleProjects(projects, user) {
  if (!projects?.length || !user) return [];
  const uid = user.id;
  const role = user.role || "staff";
  return projects.filter(p => {
    const member = isProjectMember(p, uid);
    if (role === "staff") return member;
    if (role === "team_lead") return p.team === user.team || member;
    if (role === "dept_lead") return p.dept === user.dept || member;
    return member;
  });
}

/** 文件/报告默认草稿元数据（项目内文件树协作） */
export function fileAuthorMeta(user = CURRENT_USER, shareState = "draft") {
  const shared = shareState === "shared";
  const today = new Date().toISOString().slice(0, 10);
  return {
    author: { id: user.id, name: user.name },
    shareState,
    sharedBy: shared ? { id: user.id, name: user.name } : null,
    sharedAt: shared ? today : null
  };
}

/** @deprecated 会话级共享已废弃，保留别名避免旧引用断裂 */
export function draftAuthorMeta(user = CURRENT_USER) {
  return fileAuthorMeta(user, "draft");
}

export const PROJECT_LIST = [
  {
    id: "proj-bioray-001",
    name: "某生物医药 Pre-B 轮尽调",
    company: "苏州某生物医药科技有限公司",
    industry: "生物医药",
    round: "Pre-B",
    color: "#2563eb",
    manager: "张明",
    org: "国投资本",
    dept: "投资部",
    team: "先进制造组",
    updated: "昨天",
    members: [
      { id: "u-zhangming", name: "张明", projRole: "analyst" },
      { id: "u-lifang", name: "李芳", projRole: "analyst" },
      { id: "u-wangwei", name: "王伟", projRole: "compliance" }
    ],
    chats: [
      { id: "proj-bioray-001", label: "投资尽调主流程", time: "昨天" },
      { id: "chat-bioray-risk", label: "公开风险扫描", time: "2 天前" },
      { id: "chat-bioray-notes", label: "关联交易初稿", time: "今天" }
    ],
    thesis: "自研溶瘤病毒平台，IIT 数据出色，核心判断是 IP 壁垒与商业化路径是否稳固",
    ddStage: "看清企业",
    stageIndex: 0,
    nextRecommended: ["查材料缺口", "访谈提纲准备"],
    keyRisks: ["其他应收款 +156%", "关联方回款集中度 83%"],
    comparableProjects: [
      { name: "天津某溶瘤病毒平台", sector: "生物医药", round: "B轮", invested: true, verdict: "IP壁垒验证通过，最终投资" },
      { name: "深圳某基因治疗平台", sector: "生物医药", round: "Pre-B", invested: false, verdict: "商业化路径不清晰，放弃" }
    ]
  },
  {
    id: "proj-lease-002",
    name: "某微电子售后回租尽调",
    company: "苏州某微电子科技有限公司",
    industry: "融资租赁",
    round: "售后回租",
    color: "#059669",
    manager: "李芳",
    org: "芯鑫租赁",
    dept: "投资部",
    team: "先进制造组",
    updated: "3 天前",
    members: [
      { id: "u-lifang", name: "李芳", projRole: "analyst" },
      { id: "u-zhangming", name: "张明", projRole: "analyst" },
      { id: "u-chenjing", name: "陈静", projRole: "readonly" }
    ],
    chats: [
      { id: "proj-lease-002", label: "企业分析", time: "3 天前" }
    ],
    thesis: "资产端质量高，核心风险是关联方回租集中度与应收账款真实性",
    ddStage: "案头工作",
    stageIndex: 1,
    nextRecommended: ["尽调报告", "投委会对抗预演"],
    keyRisks: ["关联方回租占比 71%", "应收账款账期拉长 45→78 天"],
    comparableProjects: [
      { name: "苏州某半导体设备融资租赁", sector: "融资租赁", round: "A轮", invested: true, verdict: "资产质量核实通过，最终投资" }
    ]
  },
  {
    id: "proj-newenergy-003",
    name: "固态电解质天使+尽调",
    company: "某固态电解质企业",
    industry: "新能源",
    round: "天使+",
    color: "#d97706",
    manager: "赵磊",
    org: "国投资本",
    dept: "投资部",
    team: "新能源组",
    updated: "上周",
    members: [{ id: "u-zhaolei", name: "赵磊", projRole: "analyst" }],
    chats: [
      { id: "proj-newenergy-003", label: "主流程", time: "上周" }
    ],
    thesis: "赛道卡位价值高但技术路线未定，先判断竞争格局与团队技术出身",
    ddStage: "看清企业",
    stageIndex: 0,
    nextRecommended: ["标的速览", "行业赛道分析"],
    keyRisks: ["技术路线分叉风险（氧化物 vs 硫化物）", "核心团队学缘单一"],
    comparableProjects: [
      { name: "北京某固态电解质材料", sector: "新能源", round: "A轮", invested: false, verdict: "量产节奏存疑，放弃" },
      { name: "某固态电解质平台", sector: "新能源", round: "天使+", invested: true, verdict: "背书强、卡位价值明确，最终投资" }
    ]
  }
];

/** 侧栏「对话」：独立会话 + 用户触达的项目会话 */
export const RECENT_ITEMS = [
  { id: "ephemeral-sample", kind: "ephemeral", label: "查某公司公开风险", time: "刚才", bucket: "today" },
  { id: "chat-ephemeral-tinci", kind: "ephemeral", label: "某材料初步了解", time: "4 小时前", bucket: "today" },
  { id: "chat-weiyi-b", kind: "ephemeral", label: "某医疗 B 轮赛道讨论", time: "昨天", bucket: "week" },
  { id: "chat-chip-policy", kind: "ephemeral", label: "算力芯片政策解读", time: "昨天", bucket: "week" },
  { id: "chat-mro-comp", kind: "ephemeral", label: "航空 MRO 竞争格局", time: "2 天前", bucket: "week" },
  { id: "chat-lease-dd", kind: "ephemeral", label: "某微电子售后回租材料", time: "3 天前", bucket: "week" },
  { id: "chat-bioray-ar", kind: "ephemeral", label: "某公司其他应收款核实", time: "上周", bucket: "earlier" },
  { id: "chat-batch-med", kind: "ephemeral", label: "天津医疗器械批量评估", time: "上周", bucket: "earlier" },
  { id: "chat-redblue", kind: "ephemeral", label: "上会前对抗预演", time: "更早", bucket: "earlier" },
  { id: "chat-gap-review", kind: "ephemeral", label: "材料缺口复盘", time: "更早", bucket: "earlier" }
];

/** 标准尽调主流程（首页与「完整流程」面板共用） */
export const DUE_DILIGENCE_FLOW = [
  { id: "risk", step: 1, label: "公开风险", action: "查公开风险", desc: "工商、司法等公开信息" },
  { id: "materials", step: 2, label: "整理材料", action: "整理材料", desc: "上传并归类项目材料" },
  { id: "finance", step: 3, label: "财报分析", action: "财报分析", desc: "三张表勾稽与异常识别" },
  { id: "interview", step: 4, label: "访谈准备", action: "访谈问题准备", desc: "按缺口定制管理层访谈问题" },
  { id: "report", step: 5, label: "撰写报告", action: "撰写报告", desc: "按所选模板生成报告，材料不足处标红" },
  { id: "ddq", step: 6, label: "风控预演", action: "风控预演", desc: "立项会追问清单与答复建议（基于报告）" }
];

export const SCENARIO_ITEMS = [
  { id: "risk", title: "查一家公司风险" },
  { id: "demo", title: "打开演示项目" },
  { id: "create", title: "创建新项目" }
];

export function homeWelcome() {
  return [];
}

export function createSession(overrides = {}, currentUser = CURRENT_USER) {
  const isProject = overrides.kind === "project";
  const sess = {
    id: overrides.id || "session-" + Date.now(),
    kind: isProject ? "project" : "ephemeral",
    projectId: overrides.projectId || null,
    name: overrides.name || (isProject ? "尽调项目" : "新对话"),
    company: overrides.company || "",
    industry: overrides.industry || "",
    round: overrides.round || "",
    manager: overrides.manager || currentUser.name,
    org: overrides.org || currentUser.org || "某机构",
    saved: isProject,
    materials: overrides.materials || [],
    /** 未存项目时：待发送附件，随下一条用户消息一并发出 */
    pendingAttachments: overrides.pendingAttachments || [],
    reportFields: overrides.reportFields || [],
    pendingField: overrides.pendingField || null,
    entityCard: overrides.entityCard || null,
    riskItems: overrides.riskItems || [],
    finance: overrides.finance || null,
    flags: {
      riskScanned: false,
      materialsParsed: false,
      financeDone: false,
      reportDone: false,
      pendingResolved: false,
      exported: false,
      savePromptDismissed: false,
      ...(overrides.flags || {})
    },
    messages: Array.isArray(overrides.messages) ? overrides.messages : homeWelcome(),
    /** 报告版本历史 */
    /** 多份 AI 报告（按模板/类型分文档，各自版本链） */
    reports: overrides.reports || [],
    activeReportId: overrides.activeReportId || null,
    reportVersions: overrides.reportVersions || [],
    activeVersion: overrides.activeVersion || null,
    template: overrides.template || null,
    activeTemplateId: overrides.activeTemplateId || null,
    /** AI 产出报告（文件树「AI生成报告」） */
    aiReports: overrides.aiReports || [],
    /** 上会材料打包选择 */
    meetingMaterials: overrides.meetingMaterials || null,
    ...overrides
  };
  if (!Array.isArray(sess.messages)) sess.messages = homeWelcome();
  return sess;
}

export const DEMO_PROJECT = createSession({
  id: "proj-bioray-001",
  kind: "project",
  projectId: "proj-bioray-001",
  name: "某生物医药 Pre-B 轮尽调",
  company: "苏州某生物医药科技有限公司",
  industry: "生物医药",
  round: "Pre-B",
  manager: "张明",
  org: "国投资本",
  saved: true,
  flags: {
    riskScanned: true,
    materialsParsed: false,
    financeDone: false,
    reportDone: false,
    pendingResolved: false,
    exported: false,
    savePromptDismissed: true
  },
  materials: [
    { id: "m1", name: "融资 BP.pdf", category: "BP", ...fileAuthorMeta({ id: "u-zhangming", name: "张明" }, "shared"), sharedAt: "2026-06-20" },
    { id: "m2", name: "2022-2024 审计报告.pdf", category: "财务", ...fileAuthorMeta({ id: "u-lifang", name: "李芳" }, "shared"), sharedAt: "2026-06-18" },
    { id: "m3", name: "专家访谈纪要.docx", category: "访谈", ...fileAuthorMeta({ id: "u-zhangming", name: "张明" }, "shared"), sharedAt: "2026-06-19" },
    { id: "m4", name: "临床进展说明.pptx", category: "BP", ...fileAuthorMeta({ id: "u-lifang", name: "李芳" }, "shared"), sharedAt: "2026-06-17" },
    { id: "m5", name: "股权架构.xlsx", category: "合同", ...fileAuthorMeta({ id: "u-zhangming", name: "张明" }, "shared"), sharedAt: "2026-06-16" },
    { id: "m6", name: "2025Q1 预测表.xlsx", category: "财务", ...fileAuthorMeta({ id: "u-zhangming", name: "张明" }, "draft") },
    { id: "m7-draft", name: "银行流水补充.xlsx", category: "财务", ...fileAuthorMeta({ id: "u-zhangming", name: "张明" }, "draft") }
  ],
  messages: [
    {
      role: "agent",
      type: "text",
      text: "欢迎回来。这个项目有 **6 份材料**，上次还没确认「其他应收款」那一行。\n\n接着聊就行，或选上方快捷动作「尽调报告」。"
    }
  ]
});

/** 某微电子售后回租演示项目（含材料与侧栏文件树） */
export const LEASE_DEMO_PROJECT = createSession({
  id: "proj-lease-002",
  kind: "project",
  projectId: "proj-lease-002",
  name: "某微电子售后回租尽调",
  company: "苏州某微电子科技有限公司",
  industry: "航空MRO",
  round: "售后回租",
  manager: "李芳",
  org: "芯鑫租赁",
  saved: true,
  flags: {
    riskScanned: true,
    materialsParsed: false,
    financeDone: false,
    reportDone: false,
    pendingResolved: false,
    exported: false,
    savePromptDismissed: true
  },
  materials: [
    { id: "xy-m1", name: "售后回租方案.pdf", category: "BP", ...fileAuthorMeta({ id: "u-lifang", name: "李芳" }, "shared"), sharedAt: "2026-06-15" },
    { id: "xy-m2", name: "2023-2024 审计报告.pdf", category: "财务", ...fileAuthorMeta({ id: "u-lifang", name: "李芳" }, "shared"), sharedAt: "2026-06-14" },
    { id: "xy-m3", name: "CCAR-145 适航维修许可证.pdf", category: "资质", ...fileAuthorMeta({ id: "u-zhangming", name: "张明" }, "shared"), sharedAt: "2026-06-13" },
    { id: "xy-m4", name: "东航国航维修框架协议.pdf", category: "合同", ...fileAuthorMeta({ id: "u-lifang", name: "李芳" }, "shared"), sharedAt: "2026-06-12" },
    { id: "xy-m5", name: "租赁设备清单.xlsx", category: "财务", ...fileAuthorMeta({ id: "u-zhangming", name: "张明" }, "shared"), sharedAt: "2026-06-11" },
    { id: "xy-m6", name: "管理层访谈纪要.docx", category: "访谈", ...fileAuthorMeta({ id: "u-lifang", name: "李芳" }, "shared"), sharedAt: "2026-06-10" }
  ],
  messages: [
    {
      role: "agent",
      type: "text",
      text: "欢迎回来。这个项目有 **6 份材料**，上次标记要重点核实 **客户集中度（前两大客户约 68%）** 和 **737MAX 订单增速**。\n\n可先「整理材料」或「查公开风险」，也可以直接问：某公司公开风险怎么样。"
    }
  ]
});

export const ENTITY_MOCK = {
  name: "苏州某生物医药科技有限公司",
  status: "存续",
  founded: "2018-03-15",
  legalRep: "王某某",
  controller: "王某某（穿透 38.2%）"
};

export const RISK_MOCK = [
  { dim: "失信/被执行", result: "未发现当前在册记录", ok: true },
  { dim: "经营异常", result: "未发现当前经营异常名录记录", ok: true },
  { dim: "行政处罚", result: "2024 年环保处罚 1 条（已整改公示）", ok: false },
  { dim: "司法立案", result: "合同纠纷 1 起（被告，标的 120 万）", ok: false },
  { dim: "裁判文书", result: "近 3 年 2 篇，含 1 起买卖合同纠纷", ok: false },
  { dim: "股权出质", result: "未发现当前生效股权出质", ok: true },
  { dim: "对外担保", result: "未发现大额对外担保公示", ok: true },
  { dim: "关联方风险", result: "其他应收款对手方含某控股（需核实）", ok: false }
];

export const FINANCE_MOCK = {
  summary: "2024 营收 0.86 亿（+42%），货币资金 1.2 亿。需关注：其他应收款同比 +156%，附注为关联方往来。",
  highlights: [
    { label: "营收", value: "0.86 亿" },
    { label: "研发占比", value: "68%" },
    { label: "货币资金", value: "1.2 亿" }
  ],
  watch: "其他应收款 +156% — 建议访谈 CFO 核实对手方与回收安排"
};

export const FINANCE_CONFIG_DEMO = {
  template: "国投资本标准",
  subjectCount: 24,
  indicatorCount: 10,
  ruleCount: 8
};

export const OCR_RESULT_DEMO = {
  fileName: "某公司2024审计报告.pdf",
  pageCount: 5,
  autoMapped: 38,
  total: 41,
  balanced: true,
  diff: 0,
  unmatched: [
    { raw_name: "商品销售收入", standard_name: "营业收入·产品收入", confidence: 0.71 },
    { raw_name: "研发费用化支出", standard_name: "研发费用", confidence: 0.68 }
  ]
};

export const FINANCE_ANALYSIS_RESULT = {
  rulesTriggered: [
    { id: "bs-balance", name: "资产负债表平衡校验", passed: true, msg: "规则 bs-balance 通过" },
    { id: "cash-profit-diverge", name: "现金流与净利润背离", passed: false, msg: "净利润为正但经营现金流为负" }
  ],
  indicators: [
    { name: "毛利率", value: "70.0%" },
    { name: "净利率", value: "-3.7%" }
  ]
};

export const REPORT_MOCK = [
  { field: "公司名称", value: "苏州某生物医药科技有限公司", source: "企查查 · 工商照面", ok: true },
  { field: "成立时间", value: "2018-03-15", source: "企查查 · 工商照面", ok: true },
  { field: "2024 营业收入", value: "8,620 万元", source: "审计报告 · P18", ok: true },
  { field: "其他应收款异动", value: "同比 +156%，关联方往来", source: "审计报告 · P24", ok: false }
];

/** 章节正文纯文本（编辑区展示用） */
export function sectionPlainText(sec) {
  if (!sec) return "";
  if (sec.parts?.length) return sec.parts.map(p => p.text || "").join("");
  return sec.body || "";
}

/** 章节溯源角标（编辑后从 sourceRefs 或 parts 读取） */
export function getSectionSourceRefs(sec) {
  if (sec?.sourceRefs?.length) return sec.sourceRefs;
  const refs = [];
  let n = 0;
  (sec?.parts || []).forEach(p => {
    if (!p.cite) return;
    n += 1;
    refs.push({
      n,
      source: p.cite.source,
      ok: p.cite.ok !== false
    });
  });
  return refs;
}

/** 将旧版 body/gapNote 转为 parts 结构（兼容历史会话） */
export function normalizeReportSections(sections) {
  if (!sections?.length) return [];
  return sections.map(sec => {
    if (sec.parts?.length) {
      return {
        ...sec,
        gap: sec.gap ?? (sec.gapNote ? String(sec.gapNote).replace(/^需补充[：:]?\s*/, "") : null)
      };
    }
    return {
      title: sec.title,
      parts: [{ text: sec.body || "" }],
      gap: sec.gapNote ? String(sec.gapNote).replace(/^需补充[：:]?\s*/, "") : null
    };
  });
}

/** 尽调报告全文章节（正文内联溯源标注，无附录） */
export const REPORT_SECTIONS = [
  {
    title: "一、投资摘要",
    parts: [
      { text: "某生物医药处于创新药研发阶段，核心管线 II 期临床推进中。" },
      { text: "2024 年营收 8,620 万元", cite: { source: "审计报告 · P18", ok: true } },
      { text: "，同比增长 42.3%。本轮 Pre-B 融资用于临床与产能建设。主要待核项为其他应收款关联方往来" },
      { text: "（待核实）", cite: { source: "审计报告 · P24", ok: false } },
      { text: "及临床进度节点。综合公开信息与已收材料，项目具备赛道与成长性，但财务与临床节点仍需访谈核实后方可上会。" }
    ]
  },
  {
    title: "二、公司概况",
    parts: [
      { text: "苏州某生物医药科技有限公司", cite: { source: "企查查 · 工商照面", ok: true } },
      { text: "，2018 年 3 月成立，法定代表人王某某，实际控制人王某某（穿透 38.2%）。公司聚焦创新型生物药研发，尚未盈利，研发投入占比较高。注册地苏州，主体存续，无当前在册失信记录。" }
    ]
  },
  {
    title: "三、业务与行业",
    parts: [
      { text: "公司主营创新生物药研发与产业化，核心产品处于临床后期。行业层面，创新药审评提速，但医保谈判与集采对定价仍有压力。竞品方面，同赛道已有 2-3 家进入 III 期，公司差异化在于适应症选择与产能布局。" }
    ],
    gap: "客户集中度数据"
  },
  {
    title: "四、财务与经营",
    parts: [
      { text: "2024 年营业收入 " },
      { text: "8,620 万元", cite: { source: "审计报告 · P18", ok: true } },
      { text: "，同比增长 42.3%。研发支出占营收约 68%，货币资金 1.2 亿元。其他应收款 4,320 万元，较期初增加 156%，主要对手方为某控股有限公司" },
      { text: "（关联方往来）", cite: { source: "审计报告 · P24", ok: false } },
      { text: "，需进一步核实回收安排与商业实质。经营性现金流与净利润存在背离，建议 CFO 访谈重点覆盖。" }
    ]
  },
  {
    title: "五、风险提示",
    parts: [
      { text: "1. 关联交易与其他应收款异动；2. 临床进度与审批不确定性；3. 未盈利状态下现金流与融资节奏依赖。建议 IC 前补齐客户集中度、临床里程碑及关联方往来说明。" }
    ]
  },
  {
    title: "六、投资结论",
    parts: [
      { text: "在待核项落实前，建议维持「有条件推荐」立场：赛道与团队具备一定壁垒，但财务质量与临床节点是本轮尽调关键变量。下一步：补齐银行流水、核心客户合同，并完成管理层访谈后更新本节结论。" }
    ]
  }
];

/** 会议纪要模板章节 */
export const MEETING_MINUTES_SECTIONS = [
  {
    title: "一、会议信息",
    parts: [
      { text: "时间、地点、参会人员、会议主题与议程。" }
    ]
  },
  {
    title: "二、讨论要点",
    parts: [
      { text: "按议题记录管理层陈述、投资方追问与关键答复；标注与尽调结论相关的增量信息。" }
    ]
  },
  {
    title: "三、决议与待办",
    parts: [
      { text: "会议结论、后续材料补充清单、责任人及完成时限。" }
    ]
  }
];

/** 投委会审议摘要（一页纸）模板章节 */
export const IC_REVIEW_SUMMARY_SECTIONS = [
  {
    title: "一、投资要点",
    parts: [
      { text: "赛道：创新生物药 Pre-B，核心管线 II 期。团队：创始人产业背景扎实。财务：营收增长 42%，未盈利，研发占比高。本轮融资用于临床与产能。" }
    ]
  },
  {
    title: "二、核心风险",
    parts: [
      { text: "1. 临床与审批不确定性；2. 其他应收款关联方往来" },
      { text: "待核实", cite: { source: "审计报告 · P24", ok: false } },
      { text: "；3. 现金流对后续融资依赖。" }
    ],
    gap: "临床里程碑时间表"
  },
  {
    title: "三、投资建议",
    parts: [
      { text: "有条件推荐：待补齐客户集中度、临床节点及关联方说明后上会。建议跟进管理层访谈与 CFO 财务核实。" }
    ]
  }
];

/** 深拷贝章节（生成/更新时避免引用污染） */
export function cloneReportSections(sections) {
  return normalizeReportSections(sections).map(sec => ({
    ...sec,
    parts: (sec.parts || []).map(p => ({
      ...p,
      cite: p.cite ? { ...p.cite } : undefined
    }))
  }));
}

/** 按模板返回报告正文结构与字段（Demo） */
export function getReportContentForTemplate(templateEntry) {
  const title = templateEntry?.title || "";
  const scenario = templateEntry?.scenario || "";
  const id = templateEntry?.id || "";
  const isMeetingMinutes = /会议纪要/i.test(title + scenario) || id === "org-tpl-002";
  if (isMeetingMinutes) {
    return {
      sections: cloneReportSections(MEETING_MINUTES_SECTIONS),
      fields: []
    };
  }
  const isIcSummary = /投委会审议摘要|投委会汇报摘要|memo|立项备忘/i.test(title + scenario)
    || id === "org-tpl-003" || id === "tpl-demo-002";
  if (isIcSummary) {
    return {
      sections: cloneReportSections(IC_REVIEW_SUMMARY_SECTIONS),
      fields: REPORT_MOCK.slice(0, 3).map(f => ({ ...f }))
    };
  }
  return {
    sections: cloneReportSections(REPORT_SECTIONS),
    fields: REPORT_MOCK.map(f => ({ ...f }))
  };
}

/** 报告在 UI / 文件树中的短标签 */
export function getReportShortLabel(templateEntry) {
  const title = templateEntry?.title || "";
  const scenario = templateEntry?.scenario || "";
  if (/投委会审议摘要|投委会汇报摘要|memo|立项备忘/i.test(title + scenario)) return "投委会审议摘要";
  if (/会议纪要/i.test(title + scenario)) return "会议纪要";
  if (/尽调/i.test(title + scenario)) return "尽调报告";
  const base = title.replace(/\.(docx?|md|xlsx?)$/i, "").replace(/_v[\d.]+-\d+$/, "");
  return base.length > 24 ? base.slice(0, 24) + "…" : (base || "报告");
}

export function sessionHasReports(sess) {
  return !!(sess?.reports?.length || sess?.reportVersions?.length);
}

export const EVIDENCE = {
  "审计报告 · P18": { file: "2022-2024 审计报告.pdf", page: 18, quote: "营业收入 86,200,456.32 元，较上年增长 42.3%。" },
  "审计报告 · P24": { file: "2022-2024 审计报告.pdf", page: 24, quote: "其他应收款 4,320 万元，较期初增加 156%。主要对手方：某控股有限公司。", note: "含 AI 归纳，请你确认后写入正式报告。" },
  "企查查 · 工商照面": { file: "外部数据", page: "-", quote: "苏州某生物医药科技有限公司，存续，法定代表人王某某，2018-03-15 成立。" },
  "某公司审计报告 · P12": { file: "2023-2024 审计报告.pdf", page: 12, quote: "营业收入 68,450 万元，较上年增长 28.1%。前五名客户销售收入占年度收入总额 68.2%。" },
  "某公司审计报告 · P22": { file: "2023-2024 审计报告.pdf", page: 22, quote: "租赁设备原值 2.86 亿元，售后回租标的为波音系列维修专用设备 14 台套。", note: "含 AI 归纳，请你确认后写入正式报告。" },
  "东航框架协议": { file: "东航国航维修框架协议.pdf", page: 2, quote: "协议有效期 3 年，覆盖 737/777 机体定检与航材更换，年度框架金额上限 1.2 亿元。" },
  "银行流水 + 说明函": { file: "银行流水（近12月）.xlsx", page: "-", quote: "货币资金余额 1.2 亿元；其他应收款对手方已附管理层说明函。" },
  "银行流水 · 补充材料": { file: "银行流水（近12月）.xlsx", page: "-", quote: "货币资金余额 1.2 亿元（期末时点）。" },
  "补充材料 · BP": { file: "某公司 BP 2025Q1.pdf", page: 8, quote: "前五大客户销售收入占年度营收 38.2%。" }
};

/** 从用户输入里猜企业名（Demo 简化） */
const COMPANY_ALIASES = [
  ["某机构", "某智能科技有限公司"],
  ["某公司", "苏州某生物医药科技有限公司"],
  ["某生物医药", "苏州某生物医药科技有限公司"],
  ["目标公司", "苏州某生物医药科技有限公司"],
  ["某材料", "广州某材料科技股份有限公司"],
  ["某医疗", "天津某医疗科技有限公司"],
  ["某微电子", "苏州某微电子科技有限公司"],
];

export function guessCompany(text) {
  const t = String(text || "");
  if (!t.trim()) return "";

  const fullNameRe = /[\u4e00-\u9fa5（）()A-Za-z0-9·]{2,}(?:有限公司|股份有限公司|有限责任公司|合伙企业)/g;
  const fullMatches = [...t.matchAll(fullNameRe)].map((m) => m[0]);
  if (fullMatches.length) {
    return fullMatches.sort((a, b) => b.length - a.length)[0];
  }

  for (const [alias, full] of COMPANY_ALIASES) {
    if (t.includes(alias)) return full;
  }
  return "";
}

/** 是否像多家企业的名单（批量对比等场景，不应误走「查这家」） */
export function looksLikeMultiCompanyList(text) {
  const t = String(text || "").trim();
  if (!t) return false;
  const companies = t.match(
    /[\u4e00-\u9fa5（）()A-Za-z0-9·]{2,}(?:有限公司|股份有限公司|有限责任公司|合伙企业)/g,
  );
  if (companies && companies.length >= 2) return true;
  if (/^\s*\d+[、.．)\]]/.test(t) && /[、,，；;\n]/.test(t)) return true;
  if ((t.match(/[、,，；;\n]/g) || []).length >= 2 && companies?.length) return true;
  return false;
}

/** 从「X值得投资吗」类问句里抽出企业简称/全称 */
export function extractCompanyFromQuestion(text) {
  const direct = guessCompany(text);
  if (direct) return direct;
  let t = text
    .replace(/[？?。！!，,、]/g, "")
    .replace(/\s+/g, "")
    .replace(/(这家公司|该企业|请问|帮我看看|帮我查|我想问|问一下)/g, "")
    .replace(/(值得投资吗|值不值得投|值不值得投资|值得投吗|能不能投|可不可以投|靠不靠谱|要不要投|能投吗|值得买吗|怎么样|如何评价|有没有风险|风险大吗|值不值)/g, "")
    .trim();
  if (t.length >= 2 && t.length <= 24) return guessCompany(t) || t;
  return "";
}

export function buildInvestmentAnswer(company) {
  const data = getPreliminaryMock(company);
  const materials = (data.materialsNeeded || []).map(m => (typeof m === "string" ? m : m.item));
  const verdict = data.investmentVerdict || {
    stance: "基于当前公开信息，只能给出初步框架，不能替代完整尽调或投资建议。",
    pros: data.highlights || ["商业模式与赛道定位需结合材料进一步核实"],
    cons: (data.risks || [])
      .filter(r => !r.ok)
      .map(r => `${r.dim}：${r.result}`),
    nextSteps: materials.slice(0, 4)
  };
  if (!verdict.cons?.length) {
    verdict.cons = ["关键财务与客户结构仍依赖补充材料"];
  }
  return { data, verdict };
}

function formatMaterialsList(items) {
  if (!items?.length) return "—";
  return items.map((m, i) => {
    if (typeof m === "string") return `${i + 1}. ${m}`;
    return `${i + 1}. ${m.item}${m.reason ? `（${m.reason}）` : ""}`;
  }).join("\n");
}

/** 查这家 / 初步了解：流式输出分段（风险明细走 risk-card，正文不重复列表） */
export function buildExamineCompanySegments(co, data, { deep = false } = {}) {
  const ent = data.entity || {};
  const biz = data.business || {};
  const pipeline = (biz.pipeline || []).map(p => `- ${p}`).join("\n");
  const segments = [
    `**${co}**\n${data.tagline || data.positioning}`
  ];
  if (biz.summary || pipeline) {
    segments.push(
      `**业务概览**\n${biz.summary || data.positioning}${pipeline ? `\n\n**在研管线**\n${pipeline}` : ""}`
    );
  }
  const entityLines = [
    ent.uscc ? `统一社会信用代码：${ent.uscc}` : null,
    `状态：${ent.status} · 成立 ${ent.founded}`,
    ent.address ? `注册地址：${ent.address}` : null,
    `法定代表人：${ent.legalRep}`,
    `实控人：${ent.controller}`,
    `注册资本：${ent.capital}`,
    ent.insured ? `参保人数：${ent.insured}` : (ent.employees ? `员工规模：${ent.employees}` : null),
    data.industry ? `所属行业：${data.industry}` : null,
    data.round ? `融资阶段：${data.round}` : null
  ].filter(Boolean);
  segments.push(`**工商 / 股权**\n${entityLines.join("\n")}`);
  if (ent.shareholders?.length) {
    const holderLines = ent.shareholders.map(s =>
      `- **${s.name}** · ${s.ratio}${s.role ? `（${s.role}）` : ""}`
    ).join("\n");
    segments.push(`**股权结构（穿透前）**\n${holderLines}`);
  }
  if (data.recentEvents?.length) {
    const eventLines = data.recentEvents.map(e =>
      `- **${e.date}** · ${e.title}${e.summary ? `\n  ${e.summary}` : ""}`
    ).join("\n");
    segments.push(`**近期动态**\n${eventLines}`);
  }
  if (biz.revenue || biz.customers || biz.partners) {
    const bizLines = [biz.revenue, biz.customers, biz.partners].filter(Boolean);
    segments.push(`**经营快照**\n${bizLines.join("\n")}`);
  }
  if (data.riskNarrative) {
    segments.push(`**公开风险摘要**\n${data.riskNarrative}\n\n完整维度扫描见下方表格。`);
  }
  segments.push(`**要做这家的尽调，建议补充：**\n${formatMaterialsList(data.materialsNeeded)}`);
  if (data.watchPoints?.length) {
    segments.push(`**小星提示 · 建议优先核实**\n${data.watchPoints.map((w, i) => `${i + 1}. ${w}`).join("\n")}`);
  }
  if (deep) {
    segments.push(`**深度评估摘要**\n基于公开信息与材料框架，${co} 核心看点与风险已在上方梳理，完整报告见右侧尽调报告全文。`);
  }
  return segments;
}

/** 公开风险专项：流式正文 + 维度表（分析在正文，明细在 risk-card） */
export function buildRiskScanResponse(company) {
  const data = getPreliminaryMock(company);
  const risks = data.risks?.length ? [...data.risks] : [...RISK_MOCK];
  const name = company || ENTITY_MOCK.name;
  const warnCount = risks.filter(r => !r.ok).length;
  const warnDims = risks.filter(r => !r.ok).map(r => r.dim).slice(0, 3);
  const warnHint = warnCount
    ? (warnDims.length ? `有 ${warnCount} 个维度需进一步关注（如 ${warnDims.join("、")}）` : `有 ${warnCount} 个维度需进一步关注`)
    : "当前未见需特别提示项";

  const segments = [
    `好，我查了 **${name}** 的公开信息。主体存续，未发现当前失信记录；${warnHint}。`
  ];

  if (data?.riskNarrative) {
    segments.push(`**风险摘要**\n${data.riskNarrative}`);
  }

  if (data?.riskAnalysis) {
    segments.push(data.riskAnalysis);
  } else {
    const warns = risks.filter(r => !r.ok).map(r => `- **${r.dim}**：${r.result}`).join("\n");
    segments.push(
      `**综合判断**\n公开扫描共 ${risks.length} 个维度，其中 ${warnCount} 项提示关注。${warnCount ? `\n\n${warns}` : "当前未见需特别提示项。"}\n\n以上为公开信息归纳，不能替代完整尽调。`
    );
  }

  if (data?.watchPoints?.length) {
    segments.push(
      `**建议优先核实**\n${data.watchPoints.slice(0, 4).map((w, i) => `${i + 1}. ${w}`).join("\n")}\n\n完整维度扫描见下表。`
    );
  } else {
    segments.push("完整维度扫描见下表。");
  }

  return { segments, risks };
}

/** 根据会话进度生成「接下来你可以」快捷操作（消息区与输入区共用） */
export function getNextStepChips(sess) {
  const chips = [];
  const f = sess.flags || {};

  if (!f.riskScanned) {
    if (sess.company) chips.push("公开风险速览");
    if (sess.materials?.length) {
      if (!f.materialsParsed) chips.push("查材料缺口");
      else if (!f.financeDone) chips.push("财报深读");
    }
    return chips.slice(0, 4);
  }
  if (!sess.materials.length) {
    chips.push("上传材料分析");
  } else if (!f.materialsParsed) {
    chips.push("查材料缺口");
  }
  if (f.materialsParsed && !f.financeDone) chips.push("财报深读");
  if (f.financeDone && !sessionHasReports(sess)) chips.push("尽调报告");
  if (sessionHasReports(sess)) chips.push("尽调报告", "更新报告", "上会材料打包");
  if (f.reportDone && sess.pendingField && !f.pendingResolved) chips.push("确认待核项");
  if (!chips.length) chips.push("上传材料分析", "尽调报告");
  return chips.slice(0, 4);
}

/** AI 产出报告在文件树中的分类名 */
export const AI_REPORT_CATEGORY = "AI生成报告";

/** 标准尽调报告模板（无用户模板时的回退） */
export const STANDARD_REPORT_TEMPLATE = {
  id: "tpl-standard",
  title: "标准报告结构",
  scenario: "未上传机构模板时的通用报告框架",
  builtin: true
};

/** 根据新上传文件名推断可能补充的报告章节 */
export function guessReportAffectedSections(fileNames) {
  const sections = new Set();
  (fileNames || []).forEach(name => {
    if (/财务|审计|流水|预测|报表|现金流/i.test(name)) sections.add("财务预测与现金流");
    if (/bp|商业|临床|管线|客户|订单/i.test(name)) sections.add("业务增长趋势");
    if (/合同|股权|法律|协议/i.test(name)) sections.add("合同与合规");
    if (/访谈|纪要/i.test(name)) sections.add("管理层访谈要点");
  });
  if (!sections.size) sections.add("相关章节");
  return [...sections];
}

/** 获取资料库中用户上传的报告模板 */
export function getUserReportTemplates(state) {
  return (state?.userMaterials || []).filter(m => m.type === "报告模板");
}

/** 格式化报告版本显示标签 */
export function formatReportVersionLabel(ver) {
  if (!ver) return "";
  return `${ver.v} ${ver.label} · ${ver.date}`;
}

/** 项目文件树：一级形态分类（左侧文件夹） */
export const FILE_CATEGORIES = [
  "财务",
  "BP",
  "合同",
  "访谈",
  "资质",
  "其他"
];

const LEGACY_FILE_CATEGORY_MAP = {
  BP: "BP",
  合同: "合同",
  访谈: "访谈",
  "BP与商业": "BP",
  "合同与法律": "合同",
  "访谈与纪要": "访谈",
  "资质与证照": "资质"
};

export function normalizeFileCategory(catOrType) {
  const raw = catOrType || "其他";
  return LEGACY_FILE_CATEGORY_MAP[raw] || raw;
}

export function guessFileType(name) {
  if (/资产负债|审计|财报|财务|流水|利润|现金流|预测表|租赁设备清单/i.test(name)) return "财务";
  if (/bp|商业计划|路演|回租方案|方案\.pdf/i.test(name)) return "BP";
  if (/合同|协议|股权|章程|框架协议/i.test(name)) return "合同";
  if (/访谈|纪要|会议/i.test(name)) return "访谈";
  if (/许可|证照|ccar|适航|认证|专利|软著|资质/i.test(name)) return "资质";
  if (/临床|管线|说明\.ppt/i.test(name)) return "BP";
  return "其他";
}

/**
 * 各付费能力扣费额度（Demo）；仅 actions.spendCredits 使用，UI 不展示单价
 */
export const CREDIT_COSTS = {
  deepReport: 80,
  reporter: 200,
  expert: 150,
  journalist: 200
};

/**
 * 个人中心 Mock 数据
 * - packages：「我的套餐」= 可购买的积分包，非 SaaS 订阅权益
 * - 无 quotas / 免费次数；扣费无确认弹窗，见 actions.spendCredits
 */
/** 机构下发模板（只读复用） */
export const ORG_TEMPLATE_LIBRARY = [
  {
    id: "org-tpl-001",
    type: "报告模板",
    title: "尽调报告",
    scenario: "机构下发 · 股权投资尽调撰写（平台标准模板）",
    filename: "尽调报告模版.docx",
    sectionCount: 47,
    date: "2026-06-28",
    source: "机构模板",
    orgIssued: true,
    readonly: true
  },
  {
    id: "org-tpl-002",
    type: "报告模板",
    title: "会议纪要",
    scenario: "机构下发 · 项目沟通与访谈纪要",
    date: "2025-06-01",
    source: "机构模板",
    orgIssued: true,
    readonly: true
  },
  {
    id: "org-tpl-003",
    type: "报告模板",
    title: "投委会审议摘要",
    scenario: "机构下发 · 投委会审议一页纸",
    date: "2025-05-15",
    source: "机构模板",
    orgIssued: true,
    readonly: true
  }
];

export const USER_ACCOUNT = {
  name: "张明",
  org: "国投资本",
  dept: "投资部",
  team: "先进制造组",
  role: "投资经理",
  avatar: "ZM",
  credits: 1280,
  monthSpent: 320,
  orgPoolCredits: 48000,
  deptQuotaCredits: 8000,
  deptUsedCredits: 2150,
  orgEdition: {
    label: "机构版",
    hint: "无限项目、机构模板、团队协作、一线调研额度",
    cta: "了解机构版权益"
  },
  packages: [
    { id: "pkg-100", credits: 100, price: 99, label: "体验包" },
    { id: "pkg-500", credits: 500, price: 399, label: "标准包" },
    { id: "pkg-2000", credits: 2000, price: 1299, label: "专业包" }
  ],
  history: [
    { date: "06-24", action: "深度报告", credits: -80 },
    { date: "06-22", action: "一线调研", credits: -200 },
    { date: "06-20", action: "充值", credits: 500 }
  ]
};

/** 文件预览 Mock 正文（Demo） */
export function getMockFilePreview(material, sourceKey) {
  if (sourceKey && EVIDENCE[sourceKey]) {
    const e = EVIDENCE[sourceKey];
    return {
      title: e.file,
      page: e.page,
      quote: e.quote,
      note: e.note || ""
    };
  }
  const name = material?.name || "";
  if (/审计/.test(name)) {
    return {
      title: name,
      page: 18,
      quote: "营业收入 86,200,456.32 元，较上年增长 42.3%。其他应收款 4,320 万元，较期初增加 156%。",
      note: "节选：合并利润表及附注"
    };
  }
  if (/BP/i.test(name) || /回租方案/.test(name)) {
    return {
      title: name,
      page: 3,
      quote: /回租/.test(name)
        ? "本次售后回租标的为波音系列维修专用设备 14 台套，评估净值 2.86 亿元，租赁期限 5 年，资金用于产能扩建与航材备货。"
        : "公司专注于创新型生物药研发，核心管线 BG-001 处于 II 期临床，目标适应症为晚期实体瘤。",
      note: ""
    };
  }
  if (/适航|CCAR/.test(name)) {
    return {
      title: name,
      page: 1,
      quote: "维修许可证编号：D.30000123；维修类别：机体维修；适用机型：波音 737/777 系列；有效期至 2027-08-31。",
      note: "民航局 CCAR-145 公示信息"
    };
  }
  if (/维修合同|框架协议|航司/.test(name)) {
    return {
      title: name,
      page: 2,
      quote: "甲方：中国东方航空股份有限公司；服务范围：737MAX/737NG 机体定检与部件更换；合同期 2024-2027，年度框架上限 1.2 亿元。",
      note: ""
    };
  }
  if (/租赁设备|设备清单/.test(name)) {
    return {
      title: name,
      page: 1,
      quote: "序号 1-14：波音机体维修专用设备（含千斤顶系统、航材测试台等），账面原值合计 2.86 亿元。",
      note: "节选：租赁物清单"
    };
  }
  if (/访谈/.test(name)) {
    return {
      title: name,
      page: 1,
      quote: /某微电子|MRO|维修/.test(name)
        ? "总经理说明：737MAX 复飞后订单排期已至 2025Q3，东航、国航合计占收入约 68%；2025H2 需关注海外 MRO 竞争者进入带来的价格压力。"
        : "CFO 说明：其他应收款主要为关联方某控股的临时往来，预计 2025 Q3 前收回。",
      note: ""
    };
  }
  return {
    title: name || "文件预览",
    page: 1,
    quote: `【Mock 预览】${name} 的正文将在此显示。正式版支持 PDF、Word、Excel 分页预览与溯源高亮。`,
    note: ""
  };
}

/* ==================================================================
 *  V2 扩展数据 —— 投资雷达 / 找项目 / 批量评估 / 专家中心 / 思维分身
 * ================================================================== */

/** 投资雷达：一级市场投融资资讯（来自财联社） */
export const RADAR_FEED = [
  {
    id: "news-001",
    sector: "医疗器械",
    title: "天津某医疗完成 B 轮 3 亿元融资，红杉领投",
    source: "财联社创投通",
    time: "2 小时前",
    summary: "本轮资金主要用于产线扩建与 FDA 认证推进，公司 2024 年营收约 8 亿元，同比增长 45%。",
    fullText: "【财联社创投通】天津某医疗科技有限公司近日完成 B 轮融资，融资金额 3 亿元人民币，由红杉资本中国基金领投，老股东跟投。\n\n本轮资金将主要用于产线扩建与 FDA 认证推进。公司 2024 年营收约 8 亿元，同比增长 45%，核心产品已进入 FDA 终审阶段。\n\n公司成立于 2017 年，专注高端医疗器械研发与生产，主要客户为三甲医院及大型医疗器械经销商。",
    interpretation: "FDA 认证已进入终审阶段，营收规模与增速符合你过往关注的标的特征（营收 5-10 亿、toB）。若进入尽调，建议重点核实认证时间表与产能利用率。",
    company: "天津某医疗科技有限公司",
    relatedCompanies: [
      { name: "天津某医疗科技有限公司", role: "融资主体" },
      { name: "红杉资本中国基金", role: "领投方" }
    ]
  },
  {
    id: "news-002",
    sector: "航空MRO",
    title: "737MAX 复飞带动国内 MRO 需求，多家维修企业订单回暖",
    source: "一线调研 · 行业观察",
    time: "今天 09:30",
    summary: "随着 737MAX 在国内复飞，主流航司维修订单显著增加，具备波音适航认证的 MRO 企业受益明显。",
    fullText: "【一线调研 · 行业观察】随着 737MAX 在国内全面复飞，主流航司维修订单显著增加。据东航、国航采购部透露，2024 年新增 737MAX 维修订单约 200 架次，同比增长 45%。\n\n具备波音适航认证（CCAR-145）的 MRO 企业受益明显，订单排期已延至 2025Q3。C919 适航认证已于 2024 年 3 月通过，预计 2025 年开始接单，为国产 MRO 带来增量机会。",
    interpretation: "订单回暖确定性较高，但需关注 2025H2 海外竞争者进入带来的价格压力。与你关注的航空 MRO 赛道高度相关。",
    company: null,
    relatedCompanies: [
      { name: "苏州某微电子科技有限公司", role: "行业关联标的" }
    ]
  },
  {
    id: "news-003",
    sector: "新能源",
    title: "固态电池产业化提速，上游材料企业获密集融资",
    source: "财联社锂电产业",
    time: "昨天",
    summary: "近一个月已有 5 家固态电池材料企业完成融资，资本关注度持续升温。",
    fullText: "【财联社锂电产业】固态电池产业化提速，近一个月已有 5 家固态电池材料企业完成融资，资本关注度持续升温。\n\n行业人士指出，固态电池仍处产业化早期，量产时间表存在不确定性。上游材料环节（电解质、正负极）是当前资本布局重点，但技术路线尚未收敛。",
    interpretation: "资本热度上升，但产业化节奏仍存不确定性。你尚未关注该领域，若感兴趣可加入关注领域，雷达将持续推送。",
    company: null,
    relatedCompanies: []
  },
  {
    id: "news-004",
    sector: "生物医药",
    title: "苏州某生物医药涉合同纠纷被诉，标的 120 万元",
    source: "中国裁判文书网",
    time: "今天 08:15",
    summary: "对手方为关联方某控股旗下贸易公司，案件已立案，与尽调中「其他应收款」口径存在交叉。",
    fullText: "【裁判文书公开】苏州某生物医药科技有限公司作为被告，涉一起合同纠纷，标的 120 万元。对手方为关联方某控股旗下贸易公司，案件已立案。\n\n该事项与尽调材料中「其他应收款期末余额较高、对手方含关联方」的待核项存在交叉，建议对照项目监控与审计附注一并核实。",
    interpretation: "诉讼对手方与关联方体系相关，与投前「关联交易」假设直接相关。若你正在跟进该项目，建议对照项目监控中的司法维度与尽调报告待核项。",
    company: "苏州某生物医药科技有限公司",
    relatedCompanies: [
      { name: "苏州某生物医药科技有限公司", role: "被告" },
      { name: "某控股有限公司", role: "关联方 / 对手方" }
    ]
  }
];

/** 投资早餐：主编汇总序文（Layer 1，零点击；详情见下方 feed） */
export const STAR_BRIEFING = {
  date: "2026-06-28",
  lead: "早。",
  digest: "【政策】统计局：1—5月高技术制造业利润增44.7%，医疗设备器材制造利润增26.4%。【融资】创投通：本周110起融资、总额约79.81亿元，医疗健康与先进制造活跃；某量子计算企业完成近30亿元Pre-IPO轮融资。【并购】某芯片企业拟2.02亿元收购某微电子企业60%股权，拓展信号链芯片。【医疗器械】某生物医药企业本周获53家机构调研，热度居A股前列。【航空MRO】某连接器企业控股子公司中标中车物流贯通道集采1603.92万元。"
};

/** 赛道融资周报（嵌在投资雷达） */
export const SECTOR_WEEKLY = {
  "医疗器械": {
    sector: "医疗器械",
    range: "2026-06-19 ~ 06-25",
    teaser: "本周 3 起融资 · 天津某医疗 B 轮 3 亿",
    summary: "本周 3 起融资共 5.2 亿，B 轮及以后占比上升，国产替代仍是主线。",
    stats: { count: 3, amount: "5.2 亿", topRound: "B 轮", medianValuation: "12 亿" },
    deals: [
      {
        company: "天津某医疗科技有限公司", round: "B 轮", amount: "3 亿", investors: "高瓴、某产业基金", tag: "国产替代",
        blurb: "红杉领投 B 轮 3 亿，资金用于产线扩建与 FDA 认证推进；2024 年营收约 8 亿、同比 +45%，核心产品已进入 FDA 终审，与你偏好的 toB 器械营收区间高度匹配。"
      },
      {
        company: "天津某生物技术有限公司", round: "A+ 轮", amount: "1.2 亿", investors: "红杉、某地方引导基金", tag: "toB 器械",
        blurb: "A+ 轮 1.2 亿，红杉与地方引导基金跟投，主营 toB 医疗器械，客户结构较分散，毛利率处于赛道中上水平，适合作为某医疗的横向对标。"
      },
      {
        company: "天津某医疗器械有限公司", round: "战略融资", amount: "1 亿", investors: "产业资本", tag: "渠道拓展",
        blurb: "战略融资 1 亿，产业资本入局侧重渠道与集采能力，营收规模约 9 亿，偏成熟器械分销与制造一体化，估值弹性低于创新器械标的。"
      }
    ],
    insight: "你偏好的「营收 5-15 亿 · toB」区间内，本周天津某医疗最匹配。",
    watchers: "本周该赛道活跃机构：高瓴、红杉、某产业基金"
  },
  "半导体": {
    sector: "半导体",
    range: "2026-06-19 ~ 06-25",
    teaser: "本周 2 起融资 · 某微电子 A 轮 1.5 亿",
    summary: "本周 2 起融资共 2.8 亿，算力芯片与设备材料各 1 起。",
    stats: { count: 2, amount: "2.8 亿", topRound: "A 轮", medianValuation: "8 亿" },
    deals: [
      {
        company: "苏州某微电子科技有限公司", round: "A 轮", amount: "1.5 亿", investors: "国投、某半导体基金", tag: "算力配套",
        blurb: "A 轮 1.5 亿，国投与半导体专项基金领投，主营算力配套芯片与封测服务，受益于训练集群与推理部署双主线，订单能见度至 2025Q3。"
      },
      {
        company: "某光刻胶材料公司", round: "Pre-A", amount: "1.3 亿", investors: "产业方", tag: "材料国产化",
        blurb: "Pre-A 1.3 亿，产业方战略入股，光刻胶国产化仍处验证期，客户以二线晶圆厂为主，需关注良率爬坡与认证周期。"
      }
    ],
    insight: "算力政策利好后，训练集群与推理部署双主线仍在升温。",
    watchers: "本周活跃机构：国投、某半导体基金"
  },
  "新能源": {
    sector: "新能源",
    range: "2026-06-19 ~ 06-25",
    teaser: "本周 1 起融资 · 固态电解质天使+ 0.8 亿",
    summary: "本周 1 起融资，固态电池材料方向。",
    stats: { count: 1, amount: "0.8 亿", topRound: "天使+", medianValuation: "3 亿" },
    deals: [
      {
        company: "某固态电解质企业", round: "天使+", amount: "0.8 亿", investors: "早期基金", tag: "固态电池",
        blurb: "天使+ 0.8 亿，早期基金布局固态电解质路线，量产时间表仍不确定，适合跟踪技术路线收敛与车企验证节点，不宜按成熟制造估值。"
      }
    ],
    insight: "产业化节奏仍早，适合跟踪技术路线收敛情况。",
    watchers: "本周活跃机构：早期基金"
  }
};

/** 找同类：以企业为基准的相似标的 Mock */
export const SIMILAR_COMPANIES = {
  "天津某医疗科技有限公司": {
    region: "天津市",
    industry: "医疗器械",
    companies: [
      { id: "sim-1", name: "天津某生物技术有限公司", revenue: "6.5亿", years: 9, status: "存续", score: 7.8, similarity: "92%", tags: ["同赛道", "营收相近"] },
      { id: "sim-2", name: "天津某医疗器械有限公司", revenue: "9.1亿", years: 12, status: "存续", score: 7.2, similarity: "88%", tags: ["toB", "毛利率高"] },
      { id: "sim-3", name: "天津某医学科技有限公司", revenue: "7.7亿", years: 8, status: "存续", score: 6.5, similarity: "85%", tags: ["医疗器械", "区域相近"] },
      { id: "sim-4", name: "天津某医疗设备有限公司", revenue: "5.4亿", years: 6, status: "存续", score: 6.9, similarity: "81%", tags: ["营收区间匹配"] }
    ]
  },
  "天津某生物技术有限公司": {
    region: "天津市",
    industry: "医疗器械",
    companies: [
      { id: "sim-5", name: "天津某医疗科技有限公司", revenue: "8.2亿", years: 7, status: "存续", score: 8.5, similarity: "92%", tags: ["同赛道", "国产替代"] },
      { id: "sim-6", name: "天津某器械科技有限公司", revenue: "5.9亿", years: 5, status: "存续", score: 6.1, similarity: "79%", tags: ["营收相近"] }
    ]
  },
  _preference: {
    region: "按偏好",
    industry: "医疗器械 · toB",
    companies: [
      { id: "pref-1", name: "天津某医疗科技有限公司", revenue: "8.2亿", years: 7, status: "存续", score: 8.5, similarity: "偏好匹配", tags: ["营收5-15亿", "toB"] },
      { id: "pref-2", name: "天津某生物技术有限公司", revenue: "6.5亿", years: 9, status: "存续", score: 7.8, similarity: "偏好匹配", tags: ["客户分散"] },
      { id: "pref-3", name: "天津某医疗器械有限公司", revenue: "9.1亿", years: 12, status: "存续", score: 7.2, similarity: "偏好匹配", tags: ["毛利率高"] }
    ]
  },
  _default: {
    region: "全国",
    industry: "同行业",
    companies: [
      { id: "def-1", name: "天津某生物技术有限公司", revenue: "6.5亿", years: 9, status: "存续", score: 7.8, similarity: "86%", tags: ["同赛道"] },
      { id: "def-2", name: "天津某医疗器械有限公司", revenue: "9.1亿", years: 12, status: "存续", score: 7.2, similarity: "82%", tags: ["模式相近"] }
    ]
  }
};

/** 政策速递（宏观政策，未选行业时默认展示） */
export const POLICY_FEED = [
  {
    id: "pol-001",
    title: "国务院印发《关于促进医疗器械产业高质量发展的指导意见》",
    source: "国务院",
    time: "3 天前",
    summary: "提出支持创新医疗器械注册审批、鼓励国产替代、完善医保支付等 12 项措施。",
    fullText: "国务院印发《关于促进医疗器械产业高质量发展的指导意见》，提出支持创新医疗器械注册审批、鼓励国产替代、完善医保支付等 12 项措施。\n\n文件明确：对创新医疗器械实行优先审评审批；加大政府采购国产医疗器械力度；完善创新器械医保支付机制。",
    interpretation: "对医疗器械赛道是中长期利好，创新器械与国产替代方向的企业可能受益。与你关注的医疗器械领域直接相关。"
  },
  {
    id: "pol-002",
    title: "民航局发布《航空维修行业「十四五」发展规划》中期评估",
    source: "中国民航局",
    time: "1 周前",
    summary: "强调提升国产飞机 MRO 能力，鼓励民营维修企业参与竞争，适航认证标准持续完善。",
    fullText: "中国民航局发布《航空维修行业「十四五」发展规划》中期评估报告，强调提升国产飞机 MRO 能力，鼓励民营维修企业参与竞争，适航认证标准持续完善。\n\n报告提出：到 2025 年，国产飞机 MRO 能力覆盖率提升至 80%；C919 维修能力建设纳入重点支持范围。",
    interpretation: "MRO 行业政策环境稳定向好，具备适航资质的企业壁垒仍在。C919 相关维修能力是增量看点。"
  },
  {
    id: "pol-003",
    title: "证监会发布《关于深化科创板改革服务科技创新若干措施》",
    source: "证监会",
    time: "2 周前",
    summary: "优化未盈利企业上市标准，支持硬科技企业融资，强化信息披露要求。",
    fullText: "证监会发布《关于深化科创板改革服务科技创新若干措施》，优化未盈利企业上市标准，支持硬科技企业融资，强化信息披露要求。\n\n措施包括：放宽未盈利科技企业上市条件；加强研发投入与核心技术披露；完善退市与投资者保护机制。",
    interpretation: "一级市场 Pre-IPO 标的估值逻辑可能调整，尽调时需更关注盈利路径与合规披露质量。"
  }
];

/** 可选关注领域 */
export const SECTOR_OPTIONS = ["医疗器械", "航空MRO", "新能源", "半导体", "生物医药", "先进制造"];

/** v7.0 首次引导选项 */
export const ONBOARDING_ROLE_OPTIONS = ["投资经理", "风控经理", "投后管理", "研究分析", "其他"];
export const ONBOARDING_SECTOR_OPTIONS = [
  "医疗器械", "生物医药", "新能源", "半导体", "人工智能", "机器人",
  "航空MRO", "先进制造", "新材料", "企业服务", "金融科技",
  "汽车交通", "军工航天", "消费", "文娱传媒", "农业食品", "融资租赁"
];
export const ONBOARDING_FOCUS_OPTIONS = [
  "客户集中度", "关联交易", "技术壁垒", "合规风险", "现金流质量",
  "股权结构", "实控人背景", "产能利用率", "订单能见度", "研发管线"
];

/** 机构工商登记名录（Demo · 引导必选，不可手填游离文本） */
export const ONBOARDING_ORG_REGISTRY = [
  { name: "国投资本控股有限公司", creditCode: "911100007109320225", status: "存续" },
  { name: "深圳市创新投资集团有限公司", creditCode: "914403007084939898", status: "存续" },
  { name: "上海张江高科技创业投资有限公司", creditCode: "91310115132219889D", status: "存续" },
  { name: "红杉资本股权投资管理（天津）有限公司", creditCode: "91120118MA05XX8K2X", status: "存续" },
  { name: "中信证券股份有限公司", creditCode: "91110000100015088C", status: "存续" },
  { name: "招商银行股份有限公司", creditCode: "914403001000188577", status: "存续" },
  { name: "国投创业投资管理有限公司", creditCode: "91110108MA001ABC12", status: "存续" },
  { name: "北京君联资本管理有限公司", creditCode: "91110108MA001DEF34", status: "存续" },
  { name: "高瓴股权投资管理（天津）有限公司", creditCode: "91120118MA05YY9K3X", status: "存续" },
  { name: "中国工商银行股份有限公司", creditCode: "91110000100003943T", status: "存续" }
];

export function searchOnboardingOrgs(query, limit = 6) {
  const q = (query || "").trim();
  if (q.length < 2) return [];
  return ONBOARDING_ORG_REGISTRY.filter(o => o.name.includes(q)).slice(0, limit);
}

/** v7.0 首页 Wow 动态演示（3 帧循环） */
export const HOME_DEMO_FRAMES = [
  {
    id: "ask",
    userLine: "帮我看看苏州某生物医药 Pre-B 轮",
    team: null,
    output: null
  },
  {
    id: "team",
    userLine: null,
    team: [
      { role: "财务分析专家", iconKey: "finance" },
      { role: "风控专家", iconKey: "shield" },
      { role: "行业研究专家", iconKey: "chart" }
    ],
    output: null
  },
  {
    id: "output",
    userLine: null,
    team: null,
    output: {
      lines: [
        { text: "营收 8620 万", source: "审计报告 P18", warn: false },
        { text: "其他应收款 +156%", source: "审计报告 P24", warn: true, hint: "建议核实" }
      ],
      foot: "30 秒，从一句话到可上会的初稿"
    }
  }
];

export const HOME_STATS = [
  { value: "1.2 万+", label: "已分析企业" },
  { value: "38 万+", label: "专家纪要" },
  { value: "定制", label: "一线调研" }
];

export const ONBOARDING_STORAGE_KEY = "xinbao_onboarding_done_v8";

/** 雷达右侧「可能感兴趣」推荐（高密度） */
export const RADAR_INTERESTS = [
  {
    type: "company",
    name: "天津某生物技术有限公司",
    sector: "医疗器械",
    revenue: "6.5亿",
    score: 7.8,
    tags: ["国产替代", "客户分散"],
    reason: "营收区间与 toB 偏好匹配",
    match: "偏好赛道"
  },
  {
    type: "news",
    id: "news-001",
    title: "天津某医疗完成 B 轮 3 亿元融资，红杉领投",
    shortTitle: "天津某医疗 B 轮 3 亿",
    company: "天津某医疗科技有限公司",
    sector: "医疗器械",
    time: "2 小时前",
    tags: ["FDA 终审", "营收 +45%"],
    reason: "FDA 认证临近 · 你关注的赛道",
    match: "热点融资"
  },
  {
    type: "company",
    name: "天津某医疗科技有限公司",
    sector: "医疗器械",
    revenue: "8.2亿",
    score: 8.5,
    tags: ["FDA认证", "营收增长45%"],
    reason: "雷达热点标的 · 与今日资讯联动",
    match: "资讯关联"
  },
  {
    type: "news",
    id: "news-002",
    shortTitle: "737MAX 复飞带动 MRO 订单回暖",
    title: "737MAX 复飞带动国内 MRO 需求，多家维修企业订单回暖",
    company: "苏州某微电子科技有限公司",
    sector: "航空MRO",
    time: "今天 09:30",
    tags: ["订单回暖", "适航认证"],
    reason: "航空 MRO 为你在跟领域",
    match: "行业动态"
  }
];

/** 我关注的领域（思维分身的一部分） */
export const MY_SECTORS = ["医疗器械", "航空MRO"];

/** 找项目：区域 + 行业搜索的企业名单 Mock */
export const COMPANY_SEARCH_RESULT = {
  query: "天津市 · 医疗器械 · 营收5-10亿",
  total: 6,
  region: "天津市",
  industry: "医疗器械",
  companies: [
    { id: "c1", name: "天津某医疗科技有限公司", revenue: "8.2亿", years: 7, status: "存续", score: 8.5, tags: ["FDA认证", "营收增长45%"] },
    { id: "c2", name: "天津某生物技术有限公司", revenue: "6.5亿", years: 9, status: "存续", score: 7.8, tags: ["国产替代", "客户分散"] },
    { id: "c3", name: "天津某医疗器械有限公司", revenue: "9.1亿", years: 12, status: "存续", score: 7.2, tags: ["毛利率高", "客户集中"] },
    { id: "c4", name: "天津某医疗设备有限公司", revenue: "5.4亿", years: 6, status: "存续", score: 6.9, tags: ["新进入者"] },
    { id: "c5", name: "天津某医学科技有限公司", revenue: "7.7亿", years: 8, status: "存续", score: 6.5, tags: ["toG为主"] },
    { id: "c6", name: "天津某器械科技有限公司", revenue: "5.9亿", years: 5, status: "存续", score: 6.1, tags: ["毛利率低"] }
  ]
};

/** 批量评估结果 Mock */
export const BATCH_EVAL_RESULT = {
  total: 6,
  framework: "医疗器械行业尽调评分模型（技术壁垒/市场空间/财务健康/合规风险）",
  region: "天津市",
  industry: "医疗器械",
  query: "天津市 · 医疗器械",
  results: [
    { rank: 1, name: "天津某医疗科技有限公司", score: 8.5, dims: { 技术: 9, 市场: 8, 财务: 9, 合规: 8 }, verdict: "强烈推荐", reason: "营收增长健康，FDA 认证临近，财务质量高" },
    { rank: 2, name: "天津某生物技术有限公司", score: 7.8, dims: { 技术: 8, 市场: 8, 财务: 7, 合规: 8 }, verdict: "推荐", reason: "国产替代逻辑强，客户分散降低风险" },
    { rank: 3, name: "天津某医疗器械有限公司", score: 7.2, dims: { 技术: 7, 市场: 8, 财务: 8, 合规: 6 }, verdict: "可关注", reason: "盈利能力强，但客户集中度偏高需核实" },
    { rank: 4, name: "天津某医疗设备有限公司", score: 6.9, dims: { 技术: 7, 市场: 7, 财务: 7, 合规: 7 }, verdict: "观察", reason: "成立时间短，需观察成长性" },
    { rank: 5, name: "天津某医学科技有限公司", score: 6.5, dims: { 技术: 6, 市场: 7, 财务: 7, 合规: 6 }, verdict: "观察", reason: "toG 业务占比高，回款周期长" },
    { rank: 6, name: "天津某器械科技有限公司", score: 6.1, dims: { 技术: 6, 市场: 6, 财务: 6, 合规: 7 }, verdict: "暂不推荐", reason: "毛利率偏低，竞争力一般" }
  ]
};

/** 将批量评估结果格式化为资料库正文 */
export function formatBatchEvalDocument(result) {
  const r = result || BATCH_EVAL_RESULT;
  const head = [
    `评估框架：${r.framework}`,
    r.query ? `检索条件：${r.query}` : "",
    r.evaluatedAt ? `评估日期：${r.evaluatedAt}` : ""
  ].filter(Boolean).join("\n");
  const body = (r.results || []).map(it => {
    const dims = Object.entries(it.dims || {}).map(([k, v]) => `${k}${v}`).join(" / ");
    return `#${it.rank} ${it.name}\n综合 ${it.score} · ${it.verdict}\n维度：${dims}\n${it.reason}`;
  }).join("\n\n");
  return `${head}\n\n${body}`;
}

/** 构建批量评估 CSV */
export function batchEvalToCsvRows(result) {
  const r = result || BATCH_EVAL_RESULT;
  const header = "排名,企业名称,综合评分,技术,市场,财务,合规,结论,推荐理由\n";
  const rows = (r.results || []).map(it => {
    const d = it.dims || {};
    const esc = (s) => `"${String(s || "").replace(/"/g, '""')}"`;
    return [
      it.rank,
      esc(it.name),
      it.score,
      d.技术 ?? "",
      d.市场 ?? "",
      d.财务 ?? "",
      d.合规 ?? "",
      esc(it.verdict),
      esc(it.reason)
    ].join(",");
  }).join("\n");
  return header + rows;
}

/** 行业分析五维框架 Mock */
export const INDUSTRY_ANALYSIS = {
  industry: "航空维修（MRO）",
  summary: "行业空间稳定，目标企业有波音系列差异化，但客户集中度偏高且面临海外竞争。",
  dimensions: [
    { name: "行业空间", conclusion: "MRO 市场 2024 年约 1800 亿，年增约 8%，受适航监管驱动需求稳定", risk: "low", source: "民航局2024年MRO市场年报 P12" },
    { name: "竞争格局", conclusion: "集中度高，前三家占 55%；目标企业市占率约 2%，差异化在波音系列", risk: "medium", source: "企查查行业排行" },
    { name: "客户结构", conclusion: "前两家客户占收入 68%，集中度偏高", risk: "high", source: "2024年度审计报告·主营收入明细" },
    { name: "监管与资质", conclusion: "CCAR-145 资质完整；进入壁垒高，新进入者需 2-3 年", risk: "low", source: "民航局适航认证公示" }
  ],
  gaps: [
    { q: "737MAX 复飞后该企业订单变化？", reason: "BP 提到订单增长，但无具体数据", action: "一线调研" },
    { q: "新增机型（C919）适航认证进度？", reason: "国产化是重要机会，但进度不明", action: "both" },
    { q: "海外竞争进入国内的时间表？", reason: "管理层提到但未量化", action: "expert" }
  ]
};

/** 一线调研：调研申请 + 完成报告 */
export const JOURNALIST = {
  completedReport: {
    title: "航空 MRO 行业竞争格局调研报告",
    reporter: "李XX（一线调研组）",
    date: "2024-06-20",
    method: "实地走访 MRO 企业 + 电话访谈东航/国航采购部 + 行业协会",
    projectId: "proj-lease-002",
    company: "苏州某微电子科技有限公司",
    findings: [
      { type: "fact", text: "2024 年新增 737MAX 维修订单约 200 架次，同比增长 45%（来源：企业生产计划表 + 东航采购部确认）" },
      { type: "fact", text: "C919 适航认证已于 2024 年 3 月通过，预计 2025 年开始接单" },
      { type: "risk", text: "ST Engineering 已在上海设子公司，预计 2025H2 运营，将直接竞争国航/东航订单" }
    ],
    judgment: "目标企业短期订单增长确定性高，但 2025H2 面临海外竞争压力，需关注价格战风险。"
  }
};

/** 专家库 + 会前提纲 + 会议纪要 */
export const EXPERTS = {
  candidates: [
    { id: "e1", name: "张XX（脱敏）", bg: "原东航工程技术公司副总裁", exp: "航空维修 25 年，熟悉 MRO 采购决策", cases: "曾负责东航 MRO 供应商选型(2015-2020)", capabilities: "航司采购、竞争格局", skills: ["行业五维分析"] },
    { id: "e2", name: "李XX（脱敏）", bg: "民航维修协会技术委员会委员", exp: "行业政策研究 15 年，熟悉适航认证", cases: "参与 C919 适航认证标准制定", capabilities: "适航认证、政策解读", skills: ["行业五维分析"] }
  ],
  outline: {
    expertName: "张XX（原东航副总裁）",
    basis: "基于项目已有材料（BP、财报、企查查）及已识别的材料缺口自动生成",
    categories: [
      { name: "行业趋势判断类", questions: ["737MAX 复飞后航司 MRO 采购策略是否变化？价格敏感度如何？", "C919 国产化带来的 MRO 增量规模预估？哪些企业有先发优势？", "未来 3 年国内 MRO 竞争格局会如何演变？"] },
      { name: "企业特定问题类", questions: ["目标企业波音系列差异化优势能维持多久？", "客户集中度 68%，从采购方视角是否合理？是否有被替换风险？", "目标企业当前报价在行业内处于什么水平？"] },
      { name: "竞争格局核实类", questions: ["海外 MRO 企业进入国内的真实进度？", "国内头部 MRO 是否已出现价格战？", "航司选择 MRO 供应商除价格外还看重什么？"] }
    ]
  },
  notes: {
    expertName: "张XX（原东航工程技术公司副总裁）",
    date: "2024-06-15",
    duration: "90 分钟",
    items: [
      { q: "737MAX 复飞后航司采购策略变化？", a: "复飞初期优先选有波音原厂认证的供应商，价格容忍度高。2024H2 起价格敏感度提升，开始要求降价 5-8%。", type: "事实核实", conf: "高" },
      { q: "客户集中度 68% 是否有被替换风险？", a: "正常偏高水平。航司不会轻易换 MRO（切换成本高），但若出现质量事故或交付延误，被降为备选概率大。", type: "行业判断", conf: "中高" },
      { q: "海外竞争者进入时间表？", a: "ST Engineering 上海子公司预计 2025H2 运营，判断会先从境外段维修切入，全面竞争可能到 2026 年。", type: "个人预测", conf: "中" }
    ],
    summary: "专家确认 737MAX 订单增长真实，同时指出 2025H2 海外竞争加剧风险。客户集中度短期可控，但需关注服务质量。"
  }
};

/** 风控 Q&A 预演 */
export const RISK_QNA = {
  total: 18, answered: 14, supplement: 3, pending: 1,
  questions: [
    { id: "q1", cat: "财务风险", q: "企业当前仍处于亏损状态，何时实现盈亏平衡？", status: "answered", a: "预计 2025Q3 平衡。依据：核心产品进入临床III期；月均亏损收窄至 800 万；已签 2 个 License-out。", src: "2024审计报告 / 管理层访谈纪要" },
    { id: "q7", cat: "客户集中", q: "客户集中度偏高（前2客户占68%），如何评估流失风险？", status: "supplement", a: "东航/国航均为 3 年框架协议，期内流失概率低。但专家指出若质量事故则被降备选概率大。", src: "合同台账 / 专家纪要", gap: "建议补充第三、四大潜在客户接触进展 + 质量体系第三方审计" },
    { id: "q11", cat: "行业竞争", q: "海外 MRO 竞争进入中国的具体时间表？", status: "supplement", a: "据一线调研，ST Engineering 上海子公司预计 2025H2 运营。专家判断全面竞争到 2026 年。", src: "一线调研报告 / 专家纪要", gap: "建议补充行业协会或竞争对手官方公告" },
    { id: "q15", cat: "技术壁垒", q: "C919 适航认证技术难度？是否存在认证失败风险？", status: "pending", a: null, src: "", gap: "当前材料无充分依据，建议约民航维修协会技术委员访谈" }
  ],
  assessment: {
    strengths: ["财务数据完整，盈利预期有清晰路径", "核心客户关系稳定，有框架协议保护", "波音系列差异化清晰"],
    weaknesses: ["C919 认证进度不明，可能错过窗口期", "对海外竞争的应对预案不够具体"],
    recommendation: "建议立项通过，但投决会前需补充：C919 认证进度更新 + 第三方质量审计报告"
  }
};

/** 材料缺口与冲突检测 */
export const MATERIAL_GAP = {
  required: 15, uploaded: 8, missing: 5, conflicted: 2,
  gaps: [
    { cat: "财务类", name: "银行流水（近12月）", priority: "high", reason: "核实营收真实性及回款" },
    { cat: "财务类", name: "应收账款明细（前十大）", priority: "medium", reason: "评估坏账风险" },
    { cat: "业务类", name: "核心专利清单及法律意见", priority: "high", reason: "评估技术壁垒及侵权风险" },
    { cat: "业务类", name: "主要客户合同（前三大）", priority: "high", reason: "核实框架协议条款及价格机制" }
  ],
  conflicts: [
    { desc: "BP 称年产能 5000 吨，财报披露产能仅 3000 吨", a: "企业BP P6", b: "2024审计报告·生产数据", action: "需管理层说明：BP 是否为规划产能？扩产时间表？" },
    { desc: "管理层称签约客户 15 家，合同台账仅 12 家", a: "管理层访谈纪要", b: "合同台账", action: "核实：是否含意向客户？或 3 份未纳入台账？" }
  ]
};

/** 访谈大纲（管理层访谈，非专家网络渠道） */
export const INTERVIEW_OUTLINE = {
  target: "管理层访谈",
  basis: "基于已上传材料缺口 + 财务异常点自动生成",
  categories: [
    { name: "财务核实", questions: ["其他应收款同比 +156%，对手方与回收安排？", "毛利率高于同行 8 个百分点，主要原因？", "经营性现金流与净利润背离的原因？"] },
    { name: "业务模式", questions: ["前两大客户占比 68%，是否有框架协议保护？", "新客户开发计划与进展？", "产能利用率 85%，扩产计划与资金安排？"] },
    { name: "团队与治理", questions: ["核心技术团队稳定性及股权激励安排？", "实控人其他关联企业与本主体的资金往来？"] }
  ]
};

/** 尽调问题清单：企业高管 vs 行业专家两套逻辑 */
export const QNA_TARGETS = {
  company: {
    target: "企业高管访谈",
    basis: "基于已上传材料缺口 + 财务异常点自动生成",
    categories: [
      { name: "财务核实", questions: ["其他应收款同比 +156%，对手方与回收安排？", "毛利率高于同行 8 个百分点，主要原因？", "经营性现金流与净利润背离的原因？"] },
      { name: "业务模式", questions: ["前两大客户占比 68%，是否有框架协议保护？", "新客户开发计划与进展？", "产能利用率 85%，扩产计划与资金安排？"] },
      { name: "团队与治理", questions: ["核心技术团队稳定性及股权激励安排？", "实控人其他关联企业与本主体的资金往来？"] }
    ]
  },
  expert: {
    target: "行业专家访谈",
    basis: "基于赛道判断需求与竞争格局验证点生成",
    categories: [
      { name: "赛道空间", questions: ["该赛道未来 3 年增速中枢？渗透率提升空间在哪一段？", "政策与支付环境对赛道估值的影响？"] },
      { name: "竞争格局", questions: ["头部玩家份额变化趋势？新进入者壁垒在哪？", "价格战或集采风险是否已反映在估值里？"] },
      { name: "技术壁垒", questions: ["核心技术路线是否收敛？替代技术威胁？", "关键专利与认证节点的时间表？"] },
      { name: "政策环境", questions: ["近期监管/集采/审批政策对赛道的中长期影响？", "国产替代政策是否带来订单结构性变化？"] }
    ]
  }
};

/** 思维分身：用户投资偏好画像（v3 简化为自然语言） */
export const MY_PROFILE = {
  active: true,
  maturity: 0.65,
  summary: "你主要关注医疗器械、航空MRO；偏好营收 5-15 亿、toB 企业；尽调时尤其看重客户集中度。系统会据此优先推送相关机会、调整搜索排序。越用越懂你。"
};

/** 项目监控动态（用户定义风险才推送，与项目库联动） */
export const POST_MONITOR = [
  {
    id: "pm1",
    projectId: "proj-bioray-001",
    projectName: "某生物医药 Pre-B 轮尽调",
    company: "苏州某生物医药科技有限公司",
    monitoring: true,
    userDefinedRisk: { dimension: "司法新增", condition: "作为被告且标的额 > 100 万" },
    triggered: true,
    level: "high",
    change: "新增司法诉讼 1 起（合同纠纷，被告，120 万）",
    hypothesis: "对照投前假设：关联交易风险正在显现",
    aiSummary: "这笔诉讼对手方为关联方某控股。尽调报告里「其他应收款 +156%」尚未闭环，建议对照尽调主流程里的待核项一起看。",
    linkedAssumption: "尽调报告 · 其他应收款异动",
    time: "2 天前"
  },
  {
    id: "pm2",
    projectId: "proj-bioray-001",
    projectName: "某生物医药 Pre-B 轮尽调",
    company: "苏州某生物医药科技有限公司",
    monitoring: true,
    userDefinedRisk: { dimension: "工商变更", condition: "注册资本变动 > 30%" },
    triggered: false,
    level: "medium",
    change: "工商变更：注册资本由 5000 万增至 8000 万",
    hypothesis: "未命中你定义的风险条件（变更幅度 60%，但非负面信号）",
    aiSummary: "增资更可能是新一轮融资配套，系统判断为中性信号；若你关心稀释比例，可在项目对话里追问股权结构。",
    time: "5 天前"
  },
  {
    id: "pm3",
    projectId: "proj-lease-002",
    projectName: "某微电子售后回租尽调",
    company: "苏州某微电子科技有限公司",
    monitoring: true,
    userDefinedRisk: { dimension: "投前假设恶化", condition: "737MAX 维修订单增速低于 20%" },
    triggered: false,
    level: "medium",
    change: "财联社行业稿提及 2025H2 海外 MRO 竞争者进入",
    hypothesis: "订单回暖趋势仍在，但价格竞争风险需持续跟踪",
    aiSummary: "与项目里「海外竞争 2025H2 进入」的一线调研结论一致，暂未达到你设定的订单增速阈值。",
    linkedAssumption: "一线调研 · 航空 MRO 竞争格局",
    time: "昨天"
  },
  {
    id: "pm4",
    projectId: "proj-bioray-001",
    projectName: "某生物医药 Pre-B 轮尽调",
    company: "苏州某生物医药科技有限公司",
    monitoring: true,
    userDefinedRisk: { dimension: "投前假设跟踪", condition: "核心管线临床进度符合立项假设" },
    triggered: false,
    level: "positive",
    change: "核心管线临床 II 期入组完成，符合投前假设",
    hypothesis: "临床进度与立项备忘录一致，暂无恶化信号",
    aiSummary: "公开披露与立项时里程碑对齐，建议下次 IC 更新时引用该节点。",
    linkedAssumption: "立项备忘录 · 临床进度",
    time: "3 天前"
  }
];

/** 项目库投后盯盘档案（自动从尽调结论提取假设） */
export const PROJECT_WATCH_PROFILE = [
  {
    projectId: "proj-bioray-001",
    projectName: "某生物医药 Pre-B 轮尽调",
    company: "苏州某生物医药科技有限公司",
    industry: "生物医药",
    watching: true,
    lastScan: "2 小时前",
    alertCount: 1,
    autoRules: [
      { id: "ar1", text: "关联交易 / 其他应收款异常波动", from: "尽调报告待核项" },
      { id: "ar2", text: "作为被告的司法诉讼标的 > 100 万", from: "投前风险清单" },
      { id: "ar3", text: "核心管线临床进度公开披露延迟", from: "立项备忘录" }
    ]
  },
  {
    projectId: "proj-lease-002",
    projectName: "某微电子售后回租尽调",
    company: "苏州某微电子科技有限公司",
    industry: "融资租赁",
    watching: true,
    lastScan: "1 小时前",
    alertCount: 0,
    autoRules: [
      { id: "ar4", text: "适航认证（CCAR-145）状态变更", from: "行业尽调结论" },
      { id: "ar5", text: "单一客户收入占比突破 40%", from: "投前假设" }
    ]
  }
];

/** 监控维度选项 */
export const MONITOR_DIMENSIONS = [
  { id: "工商变更", label: "工商变更", hint: "如注册资本、法人、经营范围变更" },
  { id: "司法新增", label: "司法新增（被告/大额）", hint: "作为被告或标的额超过阈值" },
  { id: "舆情负面", label: "舆情负面", hint: "媒体负面报道或社交舆情" },
  { id: "经营异常", label: "经营异常", hint: "列入经营异常名录等" },
  { id: "投前假设恶化", label: "对照投前风险假设恶化", hint: "与立项时风险假设对照" }
];

/** 资料库 Tab 顺序（无「全部」；报告模板置顶） */
export const MATERIAL_TABS = ["报告模板", "调研报告", "会议纪要", "企业名单", "收藏资讯"];

/** 机构报告模板（写报告时的内置回退，不在资料库展示） */
export const MY_TEMPLATES = [
  { id: "tpl-default", name: "标准 IC Memo", type: "尽调报告", fields: 11, builtin: true, scenario: "未上传模板时的通用 IC Memo 结构" }
];

/** 兼容旧引用 */
export const REPORT_TEMPLATES = MY_TEMPLATES;

/** Demo 预置报告模板（资料库） */
export const DEMO_USER_REPORT_TEMPLATES = [
  {
    id: "tpl-demo-001",
    type: "报告模板",
    title: "机构尽调报告模板_v1.0-20250625",
    scenario: "股权投资标准尽调报告（全字段）",
    reportType: "尽调报告",
    date: "2025-06-20",
    source: "本地上传"
  },
  {
    id: "tpl-demo-004",
    type: "报告模板",
    title: "Pre-A/B 轮股权投资尽调模板_v1.0-20250625",
    scenario: "早期股权项目尽调（精简字段、侧重团队与增长）",
    reportType: "尽调报告",
    date: "2025-06-19",
    source: "本地上传"
  },
  {
    id: "tpl-demo-002",
    type: "报告模板",
    title: "IC Memo 精简模板_v1.0-20250625",
    scenario: "内部 IC 立项备忘撰写",
    reportType: "IC Memo",
    date: "2025-06-18",
    source: "本地上传"
  },
  {
    id: "tpl-demo-003",
    type: "报告模板",
    title: "授信尽调报告模板_v1.0-20250626",
    scenario: "银行授信尽调报告撰写",
    reportType: "授信报告",
    date: "2025-06-15",
    source: "本地上传"
  }
];

/** 未知企业 Demo 画像工厂：保证任意输入均有可展示的投资经理首屏信息 */
function buildGenericPreliminaryMock(company) {
  const co = company || "目标企业";
  const short = co.replace(/(科技|生物|医药|电子|材料|信息|数据|网络|智能)?(有限|股份)?(责任)?公司/g, "").trim() || co;
  return {
    tagline: `${co} 是一家专注新消费品牌运营与全渠道分销的成长型企业，自有 IP 联名产品线覆盖休闲食品与日化品类，以抖音、天猫及线下 NKA 为主要销售渠道。`,
    positioning: `${short} 定位新消费赛道，以「自有品牌 + 联名 IP + 渠道精细化运营」为核心模式，2024 年 GMV 增速显著，正推进 A 轮融资。`,
    industry: "新消费 / 品牌运营",
    round: "A 轮（融资推进中）",
    entity: {
      status: "存续",
      founded: "2019-06-18",
      legalRep: "林某某",
      controller: "林某某（穿透 46.8%）",
      capital: "3000 万人民币",
      uscc: "91310115MA1FL2XK8R",
      address: "上海市浦东新区张江高科技园区祖冲之路 1777 号 3 幢",
      employees: "约 185 人",
      insured: "172 人（2024 社保公示）",
      shareholders: [
        { name: "林某某", ratio: "38.5%", role: "创始人 / 法定代表人" },
        { name: "上海启明创业投资合伙企业（有限合伙）", ratio: "22.0%", role: "A 轮领投方（媒体报道）" },
        { name: "某某新消费产业基金", ratio: "12.5%", role: "产业协同投资方" },
        { name: "核心员工持股平台", ratio: "8.0%", role: "团队激励" },
        { name: "其他自然人股东", ratio: "19.0%", role: "天使及早期跟投" }
      ]
    },
    business: {
      summary: `${co} 以线上内容电商起家，2022 年起拓展线下 NKA 与社区团购渠道。核心 SKU 为联名 IP 休闲零食与日化个护，采用「ODM 代工 + 自有品牌运营」轻资产模式，仓储物流主要外包第三方。`,
      revenue: "2024 年 GMV 约 2.8 亿元（公司口径，待审计核实），同比增长约 56%；经调整净利率约 6.2%。",
      customers: "线上渠道占比约 62%（抖音 38%、天猫 24%），线下 NKA 及社区团购占 38%。前五大客户（渠道方）收入占比约 41%，集中度中等。",
      partners: "公开信息显示与两家头部 ODM 工厂签署年度框架供货协议；与某知名动漫 IP 完成 2025-2027 独家联名授权（官微披露）。"
    },
    recentEvents: [
      {
        date: "2025-05-08",
        title: "完成 A 轮首关交割",
        summary: "财联社创投通：启明创投领投，融资金额 8000 万元，资金用于渠道扩张与 IP 联名矩阵扩充。"
      },
      {
        date: "2025-03-15",
        title: "联名 IP 新品线上市",
        summary: "公司官微：与头部动漫 IP 联名零食系列全渠道首发，首月 GMV 突破 1200 万元。"
      },
      {
        date: "2024-11-20",
        title: "入驻华东三家 NKA 系统",
        summary: "行业媒体：线下渠道从 0 到 1 突破，2025 年目标线下 GMV 占比提升至 45%。"
      },
      {
        date: "2024-08-02",
        title: "抖音自播 GMV 破亿",
        summary: "财联社快讯：618 大促期间自播 + 达人分销合计 GMV 超 1.2 亿元，同比翻倍。"
      }
    ],
    riskNarrative: "主体资格正常，未发现失信/被执行与经营异常。需关注：① 2024 年商标侵权纠纷 1 起（原告，已和解撤诉）；② 2024 年广告合规处罚 1 条（直播话术夸大功效，已整改并公示）；③ A 轮交割后创始人持股比例稀释至 38.5%，需核实对赌与回购条款。",
    riskAnalysis: `**综合判断**\n从公开信息看，${co} 信用类硬性风险（失信、被执行、经营异常）当前未见在册记录，主体存续正常，不属于典型「信用爆雷」型标的。

**合规与诉讼**\n2024 年商标侵权纠纷 1 起（原告，已和解撤诉），金额未披露；另检索到广告合规处罚 1 条（直播话术问题），信用中国公示已整改。对新消费品牌而言，IP 授权边界与广告合规是持续关注点，建议调取完整处罚文书与 IP 授权协议核对。

**股权与融资**\nA 轮首关已完成（媒体报道），创始人持股 38.5%，机构合计约 34.5%。需管理层访谈核实：对赌条款、回购安排、下一轮融资时间表及稀释预期。

**经营质量**\nGMV 增速亮眼但经调整净利率仅约 6.2%，渠道投放 ROI 与退货率是关键变量。线下 NKA 拓展处于早期，需核实进场费用、账期与动销数据。

**定性说明（仅基于公开面）**\n赛道与增速符合新消费投资窗口，但盈利质量、IP 合规与融资条款是三条必核线。建议补齐审计报告与渠道合同后再更新投资判断。`,
    risks: [
      { dim: "失信/被执行", result: "未发现当前在册记录", ok: true },
      { dim: "经营异常", result: "未发现当前经营异常名录记录", ok: true },
      { dim: "行政处罚", result: "2024 年广告合规处罚 1 条（已整改公示）", ok: false },
      { dim: "司法立案", result: "商标侵权纠纷 1 起（原告，已和解撤诉）", ok: false },
      { dim: "裁判文书", result: "近 3 年 1 篇，已撤诉结案", ok: true },
      { dim: "股权出质", result: "未发现当前生效股权出质", ok: true },
      { dim: "对外担保", result: "未发现大额对外担保公示", ok: true },
      { dim: "关联方风险", result: "ODM 供货方与创始人存在间接关联（需核实）", ok: false }
    ],
    clsNewsItems: [
      {
        date: "2025-05-08",
        title: `${short}完成 A 轮融资`,
        summary: "财联社创投通：启明创投领投 8000 万元，公司 GMV 2024 年同比增 56%，线下渠道拓展为资金主要用途。"
      },
      {
        date: "2024-08-02",
        title: "新消费品牌 618 战报",
        summary: `财联社快讯：多家新消费品牌抖音 GMV 破亿，${co} 联名 IP 零食线表现突出。`
      },
      {
        date: "2024-03-12",
        title: "新消费赛道融资回暖观察",
        summary: "行业专题：品牌运营型新消费企业受机构关注，渠道精细化与 IP 联名成为差异化关键词。"
      }
    ],
    clsNews: "财联社 2025-05 报道 A 轮融资；2024-08 618 战报中提及；2024-03 新消费赛道专题中作为案例出现。",
    watchPoints: [
      "A 轮对赌条款、回购安排与下一轮融资时间表",
      "2024 年经调整净利率 6.2% 的可持续性及渠道投放 ROI",
      "IP 联名授权范围、到期续签与竞品排他条款",
      "前五大渠道客户收入占比 41% 及账期管理",
      "ODM 供货方与创始人关联关系及采购定价公允性"
    ],
    materialsNeeded: [
      { item: "融资 BP（最新版）", reason: "GMV 拆分、盈利模型、资金用途与里程碑" },
      { item: "2023-2024 审计报告", reason: "核实 GMV 与经调整净利润口径" },
      { item: "IP 授权协议", reason: "授权范围、期限、分成与排他条款" },
      { item: "前五大渠道 / 客户合同", reason: "账期、退货率与续签条件" },
      { item: "股权架构图", reason: "穿透实控人、员工持股平台与 A 轮投资人" },
      { item: "银行流水（近 12 个月）", reason: "验证经营性现金流与渠道回款" }
    ],
    investmentVerdict: {
      stance: "新消费赛道有成长性，GMV 增速与 A 轮机构背书是亮点；但盈利质量、IP 合规与融资条款是决定性变量。公开信息下适合「有条件进入深度尽调」。",
      pros: [
        "GMV 2024 年同比增 56%，抖音 + 线下双渠道验证",
        "A 轮获启明创投领投（媒体报道）",
        "自有 IP 联名差异化，618 自播 GMV 破亿"
      ],
      cons: [
        "经调整净利率约 6.2%，盈利质量待审计核实",
        "广告合规处罚 1 条，IP 边界需持续合规",
        "A 轮后创始人持股 38.5%，需核实对赌条款"
      ],
      nextSteps: [
        "补齐 2023-2024 审计报告与银行流水",
        "核实 IP 授权协议与 ODM 关联交易",
        "完成管理层访谈后再更新投资判断"
      ]
    }
  };
}

/** 获取企业初步画像：已知企业走静态表，未知企业走 Demo 工厂 */
export function getPreliminaryMock(company) {
  if (company && PRELIMINARY_MOCK[company]) return PRELIMINARY_MOCK[company];
  return buildGenericPreliminaryMock(company);
}

/** 初步了解：企业画像 Mock */
export const PRELIMINARY_MOCK = {
  "天津某医疗科技有限公司": {
    positioning: "专注高端医疗器械研发与生产的 toB 企业，核心产品已进入 FDA 终审阶段。",
    entity: { status: "存续", founded: "2017-05-12", legalRep: "张某某", controller: "张某某（穿透 42%）", capital: "8000 万" },
    risks: [
      { dim: "失信/被执行", result: "未发现当前在册记录", ok: true },
      { dim: "行政处罚", result: "未发现", ok: true },
      { dim: "司法立案", result: "未发现当前在册", ok: true }
    ],
    clsNews: "财联社 2024-08 报道：「天津某医疗 B 轮获红杉领投」，提及 FDA 认证进展。",
    materialsNeeded: ["商业计划书（最新版）", "2023-2024 审计报告", "FDA 认证进度说明", "前三大客户合同", "产能利用率数据"]
  },
  "苏州某生物医药科技有限公司": {
    tagline: "创新型生物药研发企业，聚焦实体瘤与自免方向，核心管线 BG-001 处于 II 期临床，尚未实现规模化盈利。",
    positioning: "创新型生物药研发企业，核心管线处于 II 期临床，尚未盈利。",
    industry: "生物医药 / 创新药",
    round: "Pre-B（融资进行中）",
    entity: {
      status: "存续",
      founded: "2018-03-15",
      legalRep: "王某某",
      controller: "王某某（穿透 38.2%）",
      capital: "5000 万人民币",
      uscc: "91320594MA1WN8PN7X",
      address: "江苏省苏州市工业园区星湖街 218 号生物纳米园",
      employees: "约 280 人",
      insured: "276 人（2024 社保公示）"
    },
    business: {
      summary: "公司以抗肿瘤、自身免疫疾病方向生物药研发为主，采用「自主研发 + CRO/CDMO 外包」模式推进临床。目前收入以前期技术服务、合作开发里程碑款为主，商业化产品尚未上市。",
      pipeline: [
        "BG-001（晚期实体瘤）：国内多中心 II 期临床，2024 Q4 完成中期分析入组",
        "BG-002（自身免疫）：I 期剂量递增完成，准备进入 II 期",
        "BG-003（双抗平台）：临床前，预计 2025 年 IND 申报"
      ],
      revenue: "2024 年营收约 0.86 亿元（媒体及行业报道口径，待审计核实），同比增长约 42%。",
      customers: "收入结构以合作开发里程碑、技术服务为主，尚未形成单一产品大规模销售收入。",
      partners: "公开信息显示与苏州某头部 CXO、两家区域性三甲医院签署临床合作框架协议。"
    },
    riskNarrative: "主体资格正常，未发现失信/被执行与经营异常。需关注：① 2024 年环保处罚 1 条（废水排放超标，已整改并公示）；② 合同纠纷 1 起（被告，标的 120 万，对手方为关联方某控股旗下贸易公司）；③ 其他应收款期末余额较高，附注披露对手方含关联方，回收安排待访谈核实。",
    riskAnalysis: `**综合判断**\n从公开信息看，企业信用类硬性风险（失信、被执行、经营异常）当前未见在册记录，基础面相对干净，不属于典型「信用爆雷」型主体。

**合规与诉讼**\n2024 年环保处罚 1 条（废水排放超标），信用中国及地方公示显示已整改完成；另检索到买卖合同纠纷 1 起（被告，标的约 120 万元）。对 Pre-B 阶段 biotech 而言，单笔诉讼金额通常不构成致命项，但建议调取裁判文书核对案由、争议标的构成及是否终局，避免存在未披露系列纠纷。

**关联交易信号**\n维度扫描中「关联方风险」与尽调材料口径存在交叉：审计附注显示其他应收款主要对手方涉及某控股，而上述合同纠纷对手方亦与关联方体系相关。若二者属同一商业链条，需管理层访谈核实资金往来实质、定价公允性及回收安排，并判断是否存在重复争议模式。

**定性说明（仅基于公开面）**\n当前公开风险不宜视为「无风险放行」，但亦未达到多项 Tier A 风险同时命中的程度。环保整改是否复发、小额诉讼是否外延、关联方往来闭环，是本轮 Pre-B 尽调的三条必核线。若有项目材料，可继续「查材料缺口」或「深度了解」做交叉验证。`,
    risks: [
      { dim: "失信/被执行", result: "未发现当前在册记录", ok: true },
      { dim: "经营异常", result: "未发现当前经营异常名录记录", ok: true },
      { dim: "行政处罚", result: "2024 年环保处罚 1 条（已整改公示）", ok: false },
      { dim: "司法立案", result: "合同纠纷 1 起（被告，标的 120 万）", ok: false },
      { dim: "裁判文书", result: "近 3 年 2 篇，含买卖合同纠纷 1 起", ok: false },
      { dim: "股权出质", result: "未发现当前生效股权出质", ok: true },
      { dim: "对外担保", result: "未发现大额对外担保公示", ok: true },
      { dim: "关联方风险", result: "其他应收款对手方含某控股（需核实）", ok: false }
    ],
    clsNewsItems: [
      {
        date: "2024-11-18",
        title: "某生物医药完成 Pre-B 轮融资",
        summary: "财联社创投通：本轮融资用于 BG-001 II 期临床推进及苏州生产基地扩建，投资方含两家知名医疗专业基金。"
      },
      {
        date: "2024-06-12",
        title: "创新药融资回暖专题",
        summary: "专题提及苏州某生物医药等长三角 biotech 企业，行业回暖但机构对临床节点与现金流更为审慎。"
      },
      {
        date: "2024-03-05",
        title: "BG-001 完成 II 期首例入组",
        summary: "公司官微及财联社快讯：多中心 II 期临床正式启动，目标适应症为晚期实体瘤。"
      }
    ],
    clsNews: "财联社 2024-11 报道 Pre-B 融资；2024-06 行业融资回暖专题中提及。",
    watchPoints: [
      "BG-001 II 期临床入组进度与中期数据读出时间点",
      "其他应收款 4,320 万及关联方某控股往来商业实质",
      "Pre-B 融资估值、对赌条款与稀释比例",
      "环保处罚整改后是否出现重复违规"
    ],
    materialsNeeded: [
      { item: "融资 BP（最新版）", reason: "估值逻辑、资金用途、里程碑规划" },
      { item: "2022-2024 审计报告", reason: "核实营收、其他应收款与现金流" },
      { item: "临床进展说明", reason: "各管线阶段、入组、安全性数据" },
      { item: "股权架构图", reason: "穿透实控人、员工持股平台与外部股东" },
      { item: "主要客户/合作方合同", reason: "收入可持续性、里程碑付款条件" },
      { item: "银行流水（近 12 个月）", reason: "验证经营性现金流与关联方往来" }
    ],
    investmentVerdict: {
      stance: "赛道有成长性，但临床与财务质量是决定性变量；公开信息下更适合「有条件进入深度尽调」，不宜直接给投/不投结论。",
      pros: [
        "BG-001 进入 II 期，符合创新药投资窗口",
        "Pre-B 融资获专业医疗基金参与（媒体报道）",
        "营收增速可观，团队规模与研发人员占比合理"
      ],
      cons: [
        "尚未盈利，经营现金流依赖融资与里程碑款",
        "其他应收款关联方占比较高，需访谈 CFO 核实",
        "司法纠纷对手方为关联方体系，需排除利益输送"
      ],
      nextSteps: [
        "补齐近三年审计报告与银行流水",
        "核实临床进度节点与注册路径",
        "完成管理层访谈后再更新投资判断"
      ]
    }
  },
  "某智能科技有限公司": {
    positioning: "面向一级市场与金融机构的 AI 尽调工作台，整合企查查公开数据、财联社资讯与专家网络，产品品牌为财跃启明星。",
    entity: { status: "存续", founded: "2023 年", legalRep: "—", controller: "—", capital: "—" },
    risks: [
      { dim: "失信/被执行", result: "未发现当前在册记录", ok: true },
      { dim: "行政处罚", result: "未发现", ok: true },
      { dim: "司法立案", result: "未发现当前在册", ok: true }
    ],
    clsNews: "财联社生态内智能尽调、投研数字化方向多次被提及；属金融科技 + 数据服务交叉赛道。",
    materialsNeeded: ["商业计划书 / 融资 Deck", "近 12 个月营收与续约率", "头部客户合同或 POC 名单", "与财联社数据合作边界说明"],
    investmentVerdict: {
      stance: "若问的是「机构该不该采购」：产品场景清晰，差异化在尽调工作流 + 财联社内容；若问的是「股权投资」：公开信息不足以判断估值与回报，需要融资材料。",
      pros: ["金融机构尽调数字化需求明确", "公开风险—材料—报告—风控预演链路完整", "财联社资讯与专家网络形成内容壁垒"],
      cons: ["ToB 采购周期长，合规与私有化部署要求高", "赛道有传统尽调软件与通用 AI 竞品", "收入规模、续费率、客单价需内部材料验证"],
      nextSteps: ["弄清你问的是采购评估还是股权融资", "若要股权尽调：先要 BP 与审计", "若要自用评估：建议申请 Demo 走一遍主流程"      ]
    }
  },
  "苏州某微电子科技有限公司": {
    tagline: "航空 MRO 维修企业，持有 CCAR-145 适航维修资质，主营波音 737/777 系列机体定检与航材更换，当前推进售后回租融资。",
    positioning: "航空 MRO 维修服务商，差异化在波音系列维修能力，客户以大型航司为主。",
    industry: "航空维修（MRO）",
    round: "售后回租",
    entity: {
      status: "存续",
      founded: "2012-08-20",
      legalRep: "陈某某",
      controller: "陈某某（穿透 51.3%）",
      capital: "1.2 亿人民币",
      uscc: "91320594MA1MNBPN3Q",
      address: "江苏省苏州市工业园区现代大道 88 号航空产业园",
      employees: "约 420 人",
      insured: "398 人（2024 社保公示）"
    },
    business: {
      summary: "公司为波音系列机体维修与部件更换服务商，持有 CCAR-145 维修许可证。2024 年受益于 737MAX 复飞，维修订单排期已至 2025Q3；收入以东航、国航等头部航司框架合同为主。",
      revenue: "2024 年营收约 6.85 亿元（审计报告口径），同比增长约 28%。",
      customers: "前五名客户销售收入占年度收入总额约 68.2%，前两大客户（东航、国航）占比较高。",
      partners: "公开信息显示与中国东方航空、中国国际航空签署 3 年期维修框架协议；航材供应与波音授权服务商有合作。"
    },
    riskNarrative: "主体资格正常，未发现失信/被执行与经营异常。需关注：① 客户集中度偏高（前两大客户约 68%）；② 2024 年买卖合同纠纷 1 起（被告，标的 86 万，对手方为分包商）；③ 售后回租标的设备原值 2.86 亿元，需核实租赁物权属与保险安排。",
    riskAnalysis: `**综合判断**\n从公开信息看，企业信用类硬性风险（失信、被执行、经营异常）当前未见在册记录，作为 MRO 主体基础资质（CCAR-145）完整，不属于典型信用爆雷型主体。

**客户与经营**\n审计口径显示前五名客户收入占比约 68%，集中度偏高是售后回租尽调的核心变量。航司框架合同通常具备续签惯性，但若 2025H2 海外 MRO 竞争者（如 ST Engineering 国内子公司）进入并引发价格战，需关注毛利率与订单份额是否承压。

**诉讼与合规**\n检索到买卖合同纠纷 1 起（被告，标的约 86 万元），金额相对收入体量较小，建议调取裁判文书核对案由及是否终局。适航维修资质有效期至 2027 年，当前无公示处罚记录。

**租赁交易**\n售后回租标的为波音系列维修专用设备 14 台套，账面原值约 2.86 亿元。除公开风险外，需结合项目材料核实：租赁物清单与权属、保险受益人安排、设备利用率与产能匹配度。

**定性说明（仅基于公开面）**\n公开风险面相对可控，但客户集中度与海外竞争时间表是两条必核线。项目侧栏已有审计报告、适航许可证与航司框架协议，可继续「整理材料」或「分析财报」做交叉验证。`,
    risks: [
      { dim: "失信/被执行", result: "未发现当前在册记录", ok: true },
      { dim: "经营异常", result: "未发现当前经营异常名录记录", ok: true },
      { dim: "行政处罚", result: "未发现适航监管处罚公示", ok: true },
      { dim: "司法立案", result: "合同纠纷 1 起（被告，标的 86 万）", ok: false },
      { dim: "裁判文书", result: "近 3 年 1 篇买卖合同纠纷", ok: false },
      { dim: "股权出质", result: "未发现当前生效股权出质", ok: true },
      { dim: "对外担保", result: "未发现大额对外担保公示", ok: true },
      { dim: "客户集中度", result: "前五大客户收入占比约 68%（审计口径）", ok: false }
    ],
    clsNewsItems: [
      {
        date: "2024-09-12",
        title: "737MAX 复飞带动国内 MRO 需求回暖",
        summary: "财联社产业组：多家维修企业订单排期延长，苏州某微电子等波音系列维修商受益明显。"
      },
      {
        date: "2024-06-20",
        title: "航空 MRO 行业竞争格局调研",
        summary: "一线调研：ST Engineering 计划 2025H2 在上海运营，将直接竞争国航/东航订单；短期订单增长确定性高但需关注价格战。"
      }
    ],
    clsNews: "财联社 2024-09 报道 737MAX 复飞带动 MRO 订单回暖；2024-06 行业竞争格局调研中重点提及。",
    watchPoints: [
      "前两大航司客户收入占比 68% 及框架合同续签条件",
      "737MAX 维修订单增速与 2025Q3 后排期饱和度",
      "售后回租标的 2.86 亿设备权属、保险与利用率",
      "2025H2 海外 MRO 竞争者进入对报价的影响"
    ],
    materialsNeeded: [
      { item: "售后回租方案（最新版）", reason: "租赁期限、利率、资金用途与还款来源" },
      { item: "2023-2024 审计报告", reason: "核实营收、客户集中度与租赁负债" },
      { item: "CCAR-145 适航维修许可证", reason: "资质范围、有效期与机型覆盖" },
      { item: "东航/国航维修框架协议", reason: "合同期限、金额上限与续签条款" },
      { item: "租赁设备清单", reason: "标的明细、原值与权属证明" },
      { item: "管理层访谈纪要", reason: "订单排期、竞争策略与产能规划" }
    ],
    investmentVerdict: {
      stance: "作为售后回租标的，经营基本面与资质尚可，但客户集中度与竞争格局是核心风险变量；公开信息下适合「有条件推进材料核实」，不宜仅凭公开面给出放行结论。",
      pros: [
        "CCAR-145 资质完整，波音系列维修有差异化",
        "737MAX 复飞带动订单回暖（媒体报道与审计增速一致）",
        "与东航、国航签署长期框架合同"
      ],
      cons: [
        "前两大客户收入占比约 68%，集中度偏高",
        "2025H2 海外竞争者进入可能引发价格战",
        "售后回租需核实租赁物权属与保险安排"
      ],
      nextSteps: [
        "核对审计报告客户集中度与框架协议条款",
        "访谈管理层确认订单排期与毛利率趋势",
        "完成租赁物现场查勘与保险受益人核实"
      ]
    }
  },
  default: buildGenericPreliminaryMock("目标企业")
};

/** 红蓝对抗 Mock */
export const RED_BLUE_MOCK = {
  topic: "天津某医疗是否值得 Pre-B 投资",
  red: { role: "看多方", expert: "行业研究专家", stance: "FDA 认证临近 + 营收增速 45%，窗口期明确" },
  blue: { role: "风控方", expert: "风控专家", stance: "客户集中度未知 + 医疗器械集采风险 + 认证失败概率" },
  rounds: [
    { round: 1, red: "FDA 终审阶段，同类企业通过后估值通常翻倍，时间窗口 6-12 个月。", blue: "终审不等于通过，历史上同类认证失败率约 15%，且未披露具体进度节点。" },
    { round: 2, red: "营收 8 亿、增速 45%，在医疗器械赛道属于第一梯队。", blue: "增速高但毛利率未知，且 B 轮后稀释 + 对赌条款可能压缩回报空间。" },
    { round: 3, red: "红杉领投是强信号，机构 DD 已做一轮筛选。", blue: "领投方看的是 portfolio 组合，不代表单项无风险；需独立核实产能和客户结构。" }
  ],
  verdict: "双方均认可企业基本面尚可，但风控方指出 3 项关键信息缺口（客户集中度、FDA 节点、毛利率）。建议：可进入深度尽调，但需在 IC 前补齐上述材料。"
};

/** 一线调研专员（专家智库 · 专家预约） */
export const REPORTER_EXPERTS = [
  {
    id: "re1",
    name: "杜姐",
    field: "医疗器械",
    role: "一线调研专员",
    exp: "8 年医疗器械产业调研，覆盖器械注册与集采",
    canDo: "行业趋势咨询、竞品动态、政策解读、订单真实性核实"
  },
  {
    id: "re2",
    name: "李XX",
    field: "航空 MRO",
    role: "一线调研专员",
    exp: "5 年航空产业链调研，熟悉航司采购逻辑",
    canDo: "产业链上下游核实、竞争格局、订单真实性核实"
  }
];

/** 一线调研案例 */
export const JOURNALIST_CASE = {
  title: "兮璞材料「抢跑」上市 向日葵跨界半导体「暗礁」隐现",
  url: "https://www.cls.cn/detail/2240231",
  summary: "一线调研实地走访发现：标的方产能与 BP 披露存在差距，核心客户合同尚未签署，跨界半导体逻辑缺乏产业验证 — 这些是公开数据看不到的「暗礁」。",
  highlight: "产业链上下游采访 + 实地走访 + 交叉验证"
};

/** 技能市场 */
export const SKILL_MARKET = [
  { id: "sk1", name: "财报异常检测", desc: "自动识别应收/存货/现金流异动", category: "财务", source: "platform" },
  { id: "sk2", name: "行业五维分析", desc: "行业空间/竞争/客户/监管/缺口", category: "行业", source: "platform" },
  { id: "sk3", name: "IC Memo 生成", desc: "按机构模板生成投委会备忘录", category: "报告", source: "platform" },
  { id: "sk4", name: "PPT 制式转换", desc: "尽调结论一键转为汇报 PPT 结构", category: "技能型", source: "platform" }
];

/** 输入框 / 技能浮层（第一期 11 项） */
export const SKILL_LIST = [
  { slash: "撰写报告", desc: "按所选模板生成报告，材料不足处标红", expert: "尽调报告专家" },
  { slash: "财报分析", desc: "三张表勾稽与异常识别", expert: "财务分析专家" },
  { slash: "估值测算", desc: "DCF 与可比公司法", expert: "估值专家" },
  { slash: "生成访谈大纲", desc: "按缺口定制管理层访谈问题", expert: "尽调报告专家" },
  { slash: "风控预演", desc: "立项会追问预演与答复建议", expert: "风控专家" },
  { slash: "缺口检测", desc: "材料完整度与数据冲突检测", expert: "风控专家" },
  { slash: "PPT制作", desc: "尽调结论转 IC 汇报结构", expert: "PPT 制作专家" },
  { slash: "IC Memo", desc: "按机构模板生成投委会备忘录", expert: "尽调报告专家" },
  { slash: "纪要整理", desc: "专家访谈纪要结构化", expert: "PPT 制作专家" },
  { slash: "批量打分", desc: "多家标的按维度批量评估", expert: "行业研究专家" },
  { slash: "红蓝对抗", desc: "多方与风控视角辩论", expert: "风控专家" }
];

/** 场景分组图标（对齐 agent-demo SCENARIO_CATEGORY_ICONS） */
export const SCENARIO_CATEGORY_ICONS = {
  工作流: "route",
  看清企业: "layers",
  案头工作: "shield",
};

/** 场景总表：工作流 + 两步尽调主线（全部场景入口） */
export const SCENARIO_ALL = [
  {
    category: "工作流",
    items: [
      {
        label: "尽调有序全链",
        desc: "四步自动编排：标的速览→材料→财报→报告，无需手选连接器"
      }
    ]
  },
  {
    category: "看清企业",
    items: [
      { label: "标的速览", desc: "公开面全维度（基本盘/股权实控/风险/资质/团队，可逐项深挖）" },
      { label: "公开面深读", desc: "在公开信息上做深度研判，是标的速览之上的深度档" },
      { label: "行业赛道分析", desc: "五维看市场空间、竞争格局与政策走向，判断赛道值不值得投" },
      { label: "访谈提纲准备", desc: "按材料缺口生成管理层访谈问题清单，带着去尽调现场" },
      { label: "找同类标的", desc: "输入对标企业或赛道关键词，找出同类可比标的（对标=分析手段）" },
      { label: "知产盘点", desc: "专利、商标与软著清单及有效性状态快速盘点" },
      { label: "批量对比打分", desc: "多家标的同一框架打分排序（评分=分析框架，适合赛道初筛）" }
    ]
  },
  {
    category: "案头工作",
    items: [
      { label: "财报深读", desc: "按机构财务配置（科目/指标/规则）做三张表勾稽与异常识别" },
      { label: "尽调报告", desc: "选择机构尽调模板，生成结构化尽调报告，缺口处自动标红" },
      { label: "查材料缺口", desc: "对照尽调清单，发现缺什么、哪里信息互相打架" },
      { label: "访谈纪要整理", desc: "上传录音文字稿，自动结构化访谈要点与待核实项" },
      { label: "估值测算", desc: "按机构财务配置（科目/指标/规则）做 DCF 或可比公司法估值" },
      { label: "IC Memo", desc: "选择 IC Memo 模板，生成投委会立项备忘录" },
      { label: "投委会对抗预演", desc: "红蓝对抗模拟立项会追问，合并原多视角评审/风控预演" },
      { label: "复盘报告", desc: "选择项目，基于材料与尽调结论生成结构化复盘报告" }
    ]
  }
];

/** 全部场景标签扁平列表（与 SCENARIO_ALL 一致，供 tag / 路由校验） */
export const SCENARIO_LABELS = SCENARIO_ALL.flatMap(g => g.items.map(i => i.label));

/**
 * 场景 tag → 输入框 pill + placeholder（3 步流程：选 tag → 补上下文 → 发送执行）
 * mode 对应 chatMode，发送时由 runUserMessage 路由
 */
export const COMPOSER_CHIP_MAP = {
  "找项目": { hint: "想找什么企业？例如：天津市 医疗器械 营收5-10亿", mode: "find" },
  "快速初筛": { hint: "输入企业名即可初筛；有 BP 可粘贴或上传…", mode: "bp" },
  "批量对比打分": { hint: "每行一个企业名称，或上传多份 BP…", mode: "batch" },
  "公开风险速览": { hint: "输入企业名，或拖入工商材料…", mode: "risk" },
  "查公开风险": { hint: "输入企业名，或拖入工商材料…", mode: "risk" },
  "查一家公司风险": { hint: "输入企业名，或拖入工商材料…", mode: "risk" },
  "行业赛道分析": { hint: "输入要研究的行业或赛道，例如：医疗器械、航空 MRO", mode: "industry" },
  "行业分析": { hint: "输入要研究的行业或赛道，例如：医疗器械、航空 MRO", mode: "industry" },
  "财报深读": { hint: "上传财报，或从文件树拖入…", mode: "finance" },
  "分析财报": { hint: "上传财报，或从文件树拖入…", mode: "finance" },
  "财报分析": { hint: "上传财报，或从文件树拖入…", mode: "finance" },
  "查材料缺口": { hint: "输入企业全称，以便对照尽调材料清单查缺口", mode: "gap" },
  "访谈提纲准备": { hint: "输入企业全称或补充访谈背景…", mode: "qna" },
  "生成访谈大纲": { hint: "输入企业全称或补充访谈背景…", mode: "qna" },
  "访谈问题准备": { hint: "输入企业全称或补充访谈背景…", mode: "qna" },
  "生成尽调问题清单": { hint: "输入企业全称或补充访谈背景…", mode: "qna" },
  "一线调研": { hint: "输入要实地调研的企业全称", mode: "journalist" },
  "找同类标的": { hint: "输入对标企业或赛道关键词，找出同类标的", mode: "similar" },
  "访谈纪要整理": { hint: "上传录音文字稿，或从文件树拖入…", mode: "transcript" },
  "尽调报告": { hint: "选择机构模板后开始生成…", mode: "report", reportType: "尽调报告" },
  "IC Memo": { hint: "选择 IC Memo 模板后开始生成…", mode: "report", reportType: "IC Memo" },
  "估值测算": { hint: "选择估值方法（DCF / 可比公司）或上传财务数据…", mode: "valuation" },
  "授信报告": { hint: "选择授信报告模板后开始生成…", mode: "report", reportType: "授信报告" },
  "汇报PPT制作": { hint: "基于当前项目报告生成 PPT 结构…", mode: "ppt" },
  "项目监控": { hint: "选择项目或设置监控条件…", mode: "monitor" },
  "风险预警": { hint: "选择项目或设置监控条件…", mode: "monitor" },
  "复盘报告": { hint: "选择项目，基于材料与尽调结论生成结构化复盘报告…", mode: "monitor" },
  "投后复盘": { hint: "选择项目，基于材料与尽调结论生成结构化复盘报告…", mode: "monitor" },
  "撰写报告": { hint: "选择模板后开始生成，或输入目标企业全称", mode: "report" },
  "写报告": { hint: "选择模板后开始生成，或输入目标企业全称", mode: "report" },
  "撰写尽调报告": { hint: "选择模板后开始生成，或输入目标企业全称", mode: "report" },
  "写报告里一段": { hint: "说明要撰写的段落或章节…", mode: "report" },
  "生成报告段落": { hint: "说明要撰写的段落或章节…", mode: "report" },
  "风控预演": { hint: "填写对抗议题，或补充关注焦点…", mode: "deliberation" },
  "红蓝对抗预演": { hint: "填写对抗议题，或补充关注焦点…", mode: "deliberation" },
  "红蓝对抗": { hint: "填写对抗议题，或补充关注焦点…", mode: "deliberation" },
  "多视角评审": { hint: "填写议题或补充背景，将以多视角评审方式输出…", mode: "deliberation" },
  "上会前对抗预演": { hint: "填写对抗议题，或补充关注焦点…", mode: "deliberation" },
  "查这家": { hint: "输入企业全称，例如：天津某医疗科技有限公司", mode: "examine" },
  "初步了解": { hint: "输入企业全称，例如：天津某医疗科技有限公司", mode: "examine" },
  "深度了解": { hint: "输入企业全称…", mode: "deep" },
  "公开信息深读": { hint: "输入企业全称…", mode: "deep" },
  "企业深度分析": { hint: "输入企业全称…", mode: "deep" },
  "企业深度了解": { hint: "输入企业全称…", mode: "deep" },
  "企业初筛": { hint: "粘贴 BP 内容，或上传文件…", mode: "bp" },
  "企业批量分析": { hint: "每行一个企业名称，或上传多份 BP…", mode: "batch" },
  "批量评估": { hint: "每行一个企业名称，或上传多份 BP…", mode: "batch" },
  "上传材料分析": { hint: "上传材料或从文件树拖入…", mode: "materials" },
  "上传材料": { hint: "上传材料或从文件树拖入…", mode: "materials" },
  "上传材料后整理": { hint: "上传材料或从文件树拖入…", mode: "materials" },
  // 规范场景 canonical label（与 SCENARIO_ALL 对齐，消除静默 fallback）
  "标的速览": { hint: "输入企业全称，一页速览基本盘/股权/风险/资质/团队…", mode: "examine" },
  "公开面深读": { hint: "输入企业全称，在公开信息上做深度研判…", mode: "deep" },
  "股权与实控": { hint: "输入企业全称，做股权穿透与实控核查", mode: "examine" },
  "关键人风险": { hint: "输入企业全称，扫描法代/实控人/董监高个人风险", mode: "risk" },
  "知产盘点": { hint: "输入企业全称，盘点专利/商标/软著及有效性", mode: "examine" },
  "汇报PPT大纲": { hint: "基于当前项目报告生成 PPT 结构…", mode: "ppt" },
  "投委会对抗预演": { hint: "填写对抗议题，或补充关注焦点…", mode: "deliberation" },
  "写尽调报告": { hint: "选择机构模板后开始生成…", mode: "report", reportType: "尽调报告" },
  "尽调有序全链": {
    hint: "输入目标企业全称，将按顺序自动编排四步交付…",
    mode: "default"
  }
};


/** 旧场景名 -> canonical label（与 scenario-binding-catalog 对齐） */
export const DEPRECATED_SCENARIO_LABELS = {
  "查这家": "标的速览",
  "初步了解": "标的速览",
  "深度了解": "公开面深读",
  "公开信息深读": "公开面深读",
  "企业深度分析": "公开面深读",
  "企业深度了解": "公开面深读",
    "企业初筛": "标的速览",
    "快速初筛": "标的速览",
    "公开风险速览": "标的速览",
    "股权与实控": "标的速览",
    "关键人风险": "标的速览",
    "资质牌照核查": "标的速览",
    "团队背景尽调": "标的速览",
    "研判一家公司": "标的速览",
    "写尽调报告": "尽调报告",
  "多视角评审": "投委会对抗预演",
  "红蓝对抗": "投委会对抗预演",
  "红蓝对抗预演": "投委会对抗预演",
  "上会前对抗预演": "投委会对抗预演",
  "风控预演": "投委会对抗预演",
  "汇报PPT制作": "汇报PPT大纲",
  "查公开风险": "标的速览",
  "查一家公司风险": "标的速览",
  "投后复盘": "复盘报告"
};

export function getComposerChipConfig(label) {
  const resolved = DEPRECATED_SCENARIO_LABELS[label] || label;
  return COMPOSER_CHIP_MAP[resolved] || COMPOSER_CHIP_MAP[label] || null;
}

/** 群议模式（多视角评审）通用 Demo 输出 */
export const DELIBERATION_MOCK = {
  bullish: {
    role: "看多方",
    expert: "行业研究专家",
    text: "该项目市占率提升路径清晰，赛道处于国产替代窗口期，营收增速与机构背书均处于第一梯队。"
  },
  risk: {
    role: "风控方",
    expert: "风控专家",
    text: "但客户集中度 CR3 可能超过 60%，且关键认证节点与毛利率尚未充分披露，需独立核实。"
  },
  verdict: {
    role: "综合裁定",
    text: "建议进入深度尽调，重点核实客户可替代性与认证进度。",
    rating: "★★★☆☆"
  }
};

/** 回答方式（非 Agent auto/plan 模式 · 与专家选择器并列） */
export const RESPONSE_STYLE_OPTIONS = [
  { id: "direct", label: "直接回答", desc: "由当前专家直接给出结论与建议" },
  { id: "multiReview", label: "多视角评审", desc: "看多方、风控方多角度分析后给出综合裁定" }
];

export const DEFAULT_RESPONSE_STYLE = "direct";

export function getResponseStyleById(id) {
  return RESPONSE_STYLE_OPTIONS.find(o => o.id === id) || RESPONSE_STYLE_OPTIONS[0];
}

/** 财跃启明星默认助手（不在专家选择器内展示） */
export const DEFAULT_CHAT_EXPERT = {
  id: "ex-default",
  name: "小星",
  iconKey: "star",
  category: "default",
  field: "财跃启明星默认助手 · 公开数据查询与任务分发"
};

export const DEFAULT_EXPERT_ID = "ex-default";

/** 金融领域专家白名单 category（不含 default 助手） */
export const ALLOWED_EXPERT_CATEGORIES = new Set(["finance", "risk", "industry", "skill"]);

/** @param {Record<string, unknown>} ex */
export function isAllowedExpertForPicker(ex) {
  const id = String(ex?.id || ex?.frontend_id || "");
  if (id === DEFAULT_EXPERT_ID) return false;
  if (id.startsWith("ex-cf-")) return false;
  return ALLOWED_EXPERT_CATEGORIES.has(ex?.category || "");
}

/** 专家列表（由 platform catalog 动态加载；此处仅作离线回退） */
export const EXPERT_LIST = [];

/** 专家选择器候选项（不含默认助手小星） */
export const CHAT_EXPERT_OPTIONS = [...EXPERT_LIST];

let _platformExpertsForPicker = [];

/** @param {Array<Record<string, unknown>>} list */
export function setPlatformExpertsForPicker(list) {
  _platformExpertsForPicker = (list || [])
    .filter(isAllowedExpertForPicker)
    .map((ex) => ({
      id: ex.id || ex.frontend_id,
      name: ex.name,
      iconKey: ex.iconKey || "users",
      category: ex.category || "expert",
      field: ex.field || ex.capabilities || "",
      capabilities: ex.capabilities || ex.field || "",
      summary: ex.summary || "",
      skills: ex.skills || [],
      source: ex.source || "platform",
      live: !!ex.live,
    }));
}

/** 重置为未选择任何专家（对话仍由小星承接） */
export function getDefaultExpertSelection() {
  return {
    activeExpertId: null,
    activeExpertIds: [],
    battleRedIds: [],
    battleBlueIds: [],
    battleActiveSide: "red",
  };
}

export function getBattleTeamsFromState(state) {
  const options = getChatExpertOptions();
  const optionIds = new Set(options.map((e) => e.id));
  const filter = (ids) => (ids || []).filter((id) => optionIds.has(id));
  return {
    red: filter(state?.ui?.battleRedIds),
    blue: filter(state?.ui?.battleBlueIds),
  };
}

/** 从 state 解析当前已选专家 id（与选择器候选项对齐） */
export function getSelectedExpertIdsFromState(state) {
  if (state?.ui?.multiExpertDiscussion) {
    const { red, blue } = getBattleTeamsFromState(state);
    return [...red, ...blue];
  }
  const options = getChatExpertOptions();
  const optionIds = new Set(options.map((e) => e.id));
  const raw = state?.ui?.activeExpertIds?.length
    ? state.ui.activeExpertIds
    : (state?.ui?.activeExpertId ? [state.ui.activeExpertId] : []);
  return raw.filter((id) => optionIds.has(id));
}

/** 输入框专家选择器候选项（不含小星；未选专家时由小星对话） */
export function getChatExpertOptions() {
  if (_platformExpertsForPicker.length) return [..._platformExpertsForPicker];
  return CHAT_EXPERT_OPTIONS;
}

export function getChatExpertById(id) {
  if (!id) return null;
  if (id === "ex-default") return DEFAULT_CHAT_EXPERT;
  return getChatExpertOptions().find((e) => e.id === id) || null;
}

/** 我的分身 → 默认助手「小星」 */
export const MY_AVATAR = {
  name: "小星",
  status: "活跃中",
  maturity: "越用越懂你",
  equippedSkills: ["财报分析", "行业分析", "风控预演"],
  customSkills: []
};

/** 小星：记忆 + 技能 + 偏好 */
export const STAR_DATA = {
  name: "小星",
  tagline: "小星是财跃启明星默认助手，你对话的就是它，它越用越懂你。",
  summary: "我记得你主要看医疗器械、航空MRO；偏好营收 5-15 亿 toB 企业；尽调时尤其看重客户集中度。",
  memories: [
    "关注赛道：医疗器械、航空 MRO",
    "偏好企业：营收 5-15 亿 toB",
    "尽调重点：客户集中度",
    "沟通风格：先看公开风险再要材料"
  ],
  equippedSkills: ["财报分析", "行业分析", "风控预演"],
  dispatchableExperts: ["财务分析专家", "风控专家", "行业研究专家", "估值专家"]
};

/** 资料库：跨项目成果沉淀 */
export const MATERIALS_LIB = [
  {
    id: "mat-1",
    type: "调研报告",
    title: "航空 MRO 行业竞争格局调研报告",
    date: "2024-06-20",
    source: "一线调研 · 李XX",
    projectId: "proj-lease-002",
    fullText: "【调研方式】实地走访 MRO 企业 + 电话访谈东航/国航采购部 + 行业协会\n\n【核心发现】\n1. 2024 年新增 737MAX 维修订单约 200 架次，同比增长 45%（来源：企业生产计划表 + 东航采购部确认）\n2. C919 适航认证已于 2024 年 3 月通过，预计 2025 年开始接单\n3. ST Engineering 已在上海设子公司，预计 2025H2 运营，将直接竞争国航/东航订单\n\n【调研判断】目标企业短期订单增长确定性高，但 2025H2 面临海外竞争压力，需关注价格战风险。"
  },
  {
    id: "mat-2",
    type: "会议纪要",
    title: "英伟达中国特供芯片深度解读 · 会议纪要",
    date: "2026-05-14",
    source: "陈明远 · 华泰证券",
    projectId: null,
    fullText: "【会议要点】\n- H20 芯片供应链稳定性提升，国内算力投资确定性增强\n- 国产 GPU 三足鼎立格局初步形成\n- 算力投资主线：训练集群 + 推理部署双轮驱动"
  },
  {
    id: "mat-3",
    type: "企业名单",
    title: "天津市医疗器械营收 5-10 亿企业名单",
    date: "2026-05-18",
    source: "找项目搜索导出",
    projectId: null,
    fullText: "企业名称,营收,成立年限,专家评分\n天津某医疗科技有限公司,8.2亿,7年,8.5\n天津某生物技术有限公司,6.5亿,9年,7.8\n天津某医疗器械有限公司,9.1亿,12年,7.2\n天津某医疗设备有限公司,5.4亿,6年,6.9\n天津某医学科技有限公司,7.7亿,8年,6.5\n天津某器械科技有限公司,5.9亿,5年,6.1"
  },
  {
    id: "mat-4",
    type: "收藏资讯",
    title: "天津某医疗完成 B 轮 3 亿元融资，红杉领投",
    date: "2 小时前",
    source: "财联社创投通",
    sourceNewsId: "news-001",
    projectId: null,
    fullText: "【财联社创投通】天津某医疗科技有限公司近日完成 B 轮融资，融资金额 3 亿元人民币，由红杉资本中国基金领投。"
  }
];

/** 我的预约（真人会议 + 1对1） */
export const MY_BOOKINGS = [
  { id: "bk1", type: "meeting", meetingId: "mt2", title: "英伟达H20产业链深度：算力投资的确定性主线", time: "2026-05-18 14:00", status: "已报名" },
  { id: "bk2", type: "expert", title: "1对1 · 医疗器械注册政策咨询", expert: "王XX（脱敏）", time: "待预约", status: "可预约" }
];

/** tag 上下文（输入框上方动态快捷动作 — 文案与 SCENARIO_ALL 一致） */
export function getContextTags(state) {
  const sess = state.session;
  const view = state.view;
  const forced = state.ui?.forceContextTags;
  if (forced?.length) return forced.slice(0, 6);

  if (view === "radar") return ["批量对比打分", "行业赛道分析", "找同类标的"];
  if (view === "find") return ["批量对比打分", "下载名单", "行业赛道分析"];
  if (view === "journalist") return ["一线调研"];
  if (view === "experts") return ["约专家访谈"];
  if (view === "star") return ["教小星"];
  if (!sess) {
    return ["标的速览", "公开面深读", "行业赛道分析", "访谈提纲准备", "财报深读", "尽调报告"];
  }

  if (state.ui.previewKind === "company-list" && state.featureData?.searchResult) {
    return ["批量对比打分", "下载名单", "保存到资料库"];
  }

  if (state.chatMode === "find") return ["批量对比打分", "找同类标的", "标的速览"];
  if (state.chatMode === "similar") return ["批量对比打分", "行业赛道分析", "标的速览"];

  if (sess.saved) {
    const f = sess.flags || {};
    const tags = [];
    if (!f.materialsParsed && sess.materials.length) tags.push("查材料缺口", "财报深读");
    tags.push("尽调报告", "查材料缺口", "访谈提纲准备", "行业赛道分析");
    if (sessionHasReports(sess)) {
      tags.push("更新报告", "投委会对抗预演");
    }
    return [...new Set(tags)].slice(0, 6);
  }

  if (sess.company) {
    return ["存为项目", "标的速览", "行业赛道分析", "查材料缺口"];
  }

  return ["标的速览", "公开面深读", "行业赛道分析", "访谈提纲准备", "财报深读", "尽调报告"];
}

/* ==================================================================
 *  专家会议中心（复用公司二级市场产品的会议中心 UI）
 * ================================================================== */

/** 会议中心：行业筛选 + 会议卡片（LIVE/预告/已结束） */
export const MEETING_SECTORS = ["全部", "AI产业", "科技", "金融", "消费", "医疗健康", "先进制造", "能源材料", "宏观策略", "量化配置", "固收", "基建服务"];

export const MEETINGS = [
  { id: "mt1", status: "live", title: "AI大模型在尽调领域的实践探索", speaker: "李晓峰", org: "华锐技术AI研究院院长", tag: "AI大模型", sector: "AI产业", time: "2026-05-19 10:00", count: 628, countLabel: "报名", cover: "ai" },
  { id: "mt2", status: "soon", title: "英伟达H20产业链深度：算力投资的确定性主线", speaker: "陈明远", org: "华泰证券电子首席", tag: "算力/芯片", sector: "科技", time: "2026-05-18 14:00", count: 412, countLabel: "报名", enrolled: true, cover: "chip" },
  { id: "mt3", status: "soon", title: "国产GPU三足鼎立：海光/寒武纪/摩尔线程跟踪", speaker: "周磊", org: "中金公司TMT首席", tag: "AI芯片", sector: "科技", time: "2026-05-20 15:00", count: 298, countLabel: "报名", cover: "gpu" },
  { id: "mt4", status: "soon", title: "人形机器人量产元年：产业链机会梳理", speaker: "赵伟", org: "广发证券机械首席", tag: "机器人", sector: "先进制造", time: "2026-05-21 10:00", count: 445, countLabel: "报名", cover: "robot" },
  { id: "mt5", status: "done", title: "英伟达中国特供芯片深度解读", speaker: "陈明远", org: "华泰证券电子首席", tag: "半导体", sector: "科技", time: "2026-05-14 14:00", count: 186, countLabel: "参会", cover: "chip2" },
  { id: "mt6", status: "done", title: "AI Agent爆发期：通用智能体的投资机会", speaker: "李晓峰", org: "华锐技术AI院长", tag: "AI应用", sector: "AI产业", time: "2026-05-10 14:00", count: 534, countLabel: "参会", cover: "agent" }
];

/** 纪要资料库 */
export const MEETING_NOTES_LIB = [
  { id: "n1", title: "英伟达中国特供芯片深度解读 · 会议纪要", speaker: "陈明远 · 华泰证券", date: "2026-05-14", tags: ["半导体", "算力"], points: 12 },
  { id: "n2", title: "AI Agent爆发期：通用智能体投资机会 · 会议纪要", speaker: "李晓峰 · 华锐技术", date: "2026-05-10", tags: ["AI应用", "Agent"], points: 9 },
  { id: "n3", title: "固态电池产业化节奏与材料环节梳理 · 会议纪要", speaker: "刘洋 · 国泰君安", date: "2026-05-08", tags: ["新能源", "锂电"], points: 11 }
];

/** 专家库（用于尽调约访 — v3 无档期费用） */
export const MEETING_EXPERTS = [
  { id: "ex1", name: "张XX（脱敏）", field: "航空维修 MRO", bg: "原东航工程技术公司副总裁", years: "25年", capabilities: "航司采购逻辑、MRO 竞争格局", skills: ["行业五维分析", "访谈大纲生成"] },
  { id: "ex2", name: "李XX（脱敏）", field: "民航适航认证", bg: "民航维修协会技术委员会委员", years: "15年", capabilities: "适航认证标准、C919 进度", skills: ["行业五维分析"] },
  { id: "ex3", name: "王XX（脱敏）", field: "医疗器械注册", bg: "原 NMPA 器械审评中心专家", years: "18年", capabilities: "注册审批、集采政策", skills: ["行业五维分析", "风控 Q&A 预演"] },
  { id: "ex4", name: "陈XX（脱敏）", field: "半导体设备", bg: "原中芯国际资深工艺工程师", years: "12年", capabilities: "设备国产化、产能验证", skills: ["财报异常检测"] }
];

/** 会议中心别名（v4 专家智库 · 真人会议 Tab） */
export const MEETING_LIST = MEETINGS;

const _DD_STAGES = ["看清企业", "案头工作"];
export function getProjectProgress(proj) {
  const idx = proj?.stageIndex ?? _DD_STAGES.indexOf(proj?.ddStage ?? "");
  const maxIdx = _DD_STAGES.length - 1;
  const i = Math.max(0, Math.min(maxIdx, (idx == null || isNaN(idx) || idx < 0) ? 0 : idx));
  return {
    stageName: _DD_STAGES[i],
    stageIndex: i,
    totalStages: _DD_STAGES.length,
    pct: Math.round((i + 1) / _DD_STAGES.length * 100),
    nextSteps: proj?.nextRecommended || []
  };
}
