/**
 * finstep-data-wrapper — 对外隐藏第三方数据源品牌，呈现 Finstep 公开数据
 * 版本: v1.2 | 日期: 2026-06-28
 */

const BRAND_PATTERNS = [
  [/企查查/g, "Finstep 公开数据"],
  [/\bQCC\b/gi, "Finstep"],
  [/qcc\.com/gi, "finstep.data"],
  [/AgentScope/gi, "Finstep 分析服务"],
  [/agentscope/gi, "finstep"],
];

const TOOL_NAME_RE = /^mcp__[^_]+__(.+)$/;

const TOOL_LABELS = {
  get_company_info: "查询企业工商照面",
  get_company_profile: "查询企业工商照面",
  get_company_registration_info: "查询企业登记信息",
  get_company_risk_scan: "扫描企业公开风险面",
  get_executive_risk_scan: "扫描关键人公开风险",
  get_dishonest_info: "查询失信公示信息",
  get_judgment_debtor_info: "查询被执行人信息",
  get_case_filing_info: "查询立案信息",
  get_change_records: "查询工商变更记录",
  get_key_personnel: "查询主要人员",
  get_actual_controller: "查询实际控制人",
  get_company_by_query: "识别目标企业主体",
  get_shareholder_info: "查询股东信息",
  verify_company_accuracy: "核验企业主体一致性",
};

const GENERIC_TOOL_LABEL = "查询 Finstep 公开数据";

/**
 * @param {string} toolName
 * @returns {string}
 */
export function mapToolStatusLabel(toolName) {
  if (!toolName) return GENERIC_TOOL_LABEL;
  const m = String(toolName).match(TOOL_NAME_RE);
  const base = m ? m[1] : String(toolName).replace(/^get_/, "get_");
  for (const [key, label] of Object.entries(TOOL_LABELS)) {
    if (base === key || base.includes(key) || toolName.includes(key)) return label;
  }
  if (/risk|judicial|dishonest|executive|equity|pledge/i.test(toolName)) {
    return "检索司法与经营公开信息";
  }
  if (/company|工商|照面|股东|登记/i.test(toolName)) {
    return "检索企业工商公开信息";
  }
  return GENERIC_TOOL_LABEL;
}

/**
 * 仅替换品牌词，不删除 MCP 返回正文。
 * @param {string} text
 * @returns {string}
 */
export function wrapFinstepPublicText(text) {
  if (!text) return text;
  let out = String(text);
  for (const [re, rep] of BRAND_PATTERNS) {
    out = out.replace(re, rep);
  }
  out = out.replace(/Finstep 公开数据源/g, "Finstep 公开数据");
  out = out.replace(/来自\s*Finstep 公开数据\s*的/g, "基于 Finstep 公开数据的");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

/**
 * @param {string} rawName
 * @returns {string}
 */
export function sanitizeToolDisplayName(rawName) {
  return mapToolStatusLabel(rawName);
}

/**
 * @param {string} text
 * @param {string} [savedMode]
 * @returns {boolean}
 */
export function shouldUseLiveAgent(text, savedMode) {
  const t = (text || "").trim();
  if (!t && !savedMode) return false;
  const liveModes = new Set(["risk", "examine", "deep", "gap", "finance", "bp"]);
  if (savedMode && liveModes.has(savedMode)) return true;
  if (/风险|公开风险|工商|司法|失信|被执行|立案|查询|查一下|照面|实控|股东|变更记录/.test(t)) {
    return true;
  }
  if (/值得|值不值|能不能投|靠不靠谱|初步了解|了解一下|查这家|初筛/.test(t)) {
    return true;
  }
  return false;
}
