/**
 * live-intent — 将场景/模式转换为用户消息 + Agent 指令
 * 版本: v1.2 | 日期: 2026-06-27
 */
import { guessCompany, extractCompanyFromQuestion } from "../data/mock-data.js";
import { buildBattleRolePrompt } from "./expert-picker-battle-v1.0-20260627.js";

const BASE_RULES =
  "你是财跃启明星尽调助手。使用已接入的 Finstep 公开数据工具完成查询与分析。"
  + "只陈述客观事实，不做准入或投资决策。回复使用 Markdown 结构化输出。"
  + "对用户可见内容不要提及第三方数据品牌名称。";

/**
 * @param {object} ctx
 * @param {string} ctx.text
 * @param {string|null} [ctx.chatMode]
 * @param {{ label?: string }|null} [ctx.chip]
 * @param {object|null} [ctx.session]
 * @param {string} [ctx.scenarioLabel]
 * @param {string} [ctx.expertName]
 * @param {number} [ctx.battleSlotIndex] 红蓝对抗槽位：0 红方看机会，1 蓝方看风险
 * @returns {string}
 */
export function buildLivePrompt(ctx) {
  const text = (ctx.text || "").trim();
  const sess = ctx.session || {};
  const company = guessCompany(text) || sess.company || extractCompanyFromQuestion(text) || "";
  const chip = ctx.chip?.label || ctx.scenarioLabel || "";
  const mode = ctx.chatMode || "";

  const modeMap = {
    risk: `请对「${company || text}」做公开风险速览：工商照面要点、当前在册司法与经营风险提示、舆情与合规关注点。`,
    examine: `请对「${company}」做初步公开信息了解：企业定位、业务概览、公开风险提示与建议下一步尽调动作。`,
    deep: `请对「${company}」做深度公开信息尽调初筛：业务、财务公开面、风险维度、核心待核项。`,
    industry: `请做行业赛道分析：${text || sess.industry || company}。按行业空间、竞争格局、客户结构、监管环境、信息缺口五维输出。`,
    finance: `请对「${company || sess.company || "当前项目企业"}」做财报深读：三张表勾稽、异常科目、现金流质量与关联交易提示。`,
    gap: `请对照尽调材料清单，分析「${company}」的材料缺口与可能的数据冲突：${text}`,
    report: `请为「${company}」撰写结构化尽调报告初稿（Markdown），材料不足处标注【待核】。用户补充：${text}`,
    valuation: `请对「${company}」做估值测算框架：DCF 与可比公司法思路、关键假设与敏感性。${text}`,
    ppt: `请将「${company}」尽调结论整理为 IC 汇报 PPT 大纲（Markdown 列表）。${text}`,
    transcript: `请将以下访谈文字稿结构化（要点、待核实项、与公开信息交叉点）：\n${text}`,
    bp: [
      `请对「${company || text || "目标企业"}」做快速初筛。`,
      "用户未提供 BP/融资材料时：禁止先向用户索要材料清单；必须先调用公开企业数据（实体识别→照面/股东/实控人/变更→风险 scan）并联网搜索（业务描述、融资动态、团队背景），",
      "基于公开信息输出 30 秒初筛结论（亮点、疑点、是否值得深跟，标注「公开面初步判断」），再请用户补充 BP/财务细节。",
      text ? `用户补充：${text}` : "",
    ].filter(Boolean).join(""),
    find: `请按投资偏好找项目/标的：${text}。输出候选企业名单与筛选逻辑（Markdown 表格）。`,
    similar: `请找与「${company || text}」相似的标的（同赛道/相近规模），Markdown 表格列出。`,
    batch: `请对以下企业批量对比打分（Markdown 表格，含维度与简评）：\n${text}`,
    riskqna: `基于当前项目，模拟立项会/投委会风控追问清单与答复建议：\n${text}`,
    qna: `请生成尽调访谈问题清单（分管理层/财务/业务/合规）：\n${text}`,
    materials: `请整理并分析已上传项目材料，输出摘要、冲突点与缺口：\n${text}`,
    redblue: `请进行红蓝对抗投资预演：红方专看机会与论证立项理由，蓝方专看风险与质疑疑点，最后给裁决摘要。\n${text}`,
    "update-report": `请根据新材料增量更新尽调报告相关段落，输出变更摘要与建议修改内容：\n${text}`,
  };

  if (mode && modeMap[mode]) {
    return `${BASE_RULES}\n\n${modeMap[mode]}`;
  }

  const chipMap = {
    公开风险速览: modeMap.risk,
    查这家: modeMap.examine,
    行业赛道分析: modeMap.industry,
    财报深读: modeMap.finance,
    查材料缺口: modeMap.gap,
    尽调报告: modeMap.report,
    估值测算: modeMap.valuation,
    汇报PPT制作: modeMap.ppt,
    访谈纪要整理: modeMap.transcript,
    快速初筛: modeMap.bp,
    找项目: modeMap.find,
    找同类标的: modeMap.similar,
    批量对比打分: modeMap.batch,
    风控预演: modeMap.riskqna,
    撰写报告: modeMap.report,
  };
  if (chip && chipMap[chip]) {
    return `${BASE_RULES}\n\n${chipMap[chip]}`;
  }

  if (typeof ctx.battleSlotIndex === "number" && ctx.battleSlotIndex >= 0) {
    let body = text;
    if (company && !text.includes(company)) body = `[关注企业：${company}]\n${body}`;
    if (chip) body = `[场景：${chip}]\n${body}`;
    if (ctx.expertName) body = `[当前专家：${ctx.expertName}]\n${body}`;
    return `${BASE_RULES}\n\n${buildBattleRolePrompt(ctx.battleSlotIndex, body)}`;
  }

  let body = text;
  if (company && !text.includes(company)) body = `[关注企业：${company}]\n${body}`;
  if (chip) body = `[场景：${chip}]\n${body}`;
  if (ctx.expertName) body = `[当前专家：${ctx.expertName}]\n${body}`;
  return `${BASE_RULES}\n\n${body}`;
}

/**
 * @param {string|null} mode
 * @param {string} [chipLabel]
 * @returns {string[]}
 */
export function suggestContextTags(mode, chipLabel) {
  const map = {
    risk: ["行业赛道分析", "查材料缺口", "财报深读"],
    examine: ["行业赛道分析", "查材料缺口", "财报深读"],
    deep: ["撰写报告", "风控预演", "红蓝对抗预演"],
    industry: ["找同类标的", "批量对比打分"],
    finance: ["估值测算", "撰写报告"],
    gap: ["撰写报告", "访谈提纲准备"],
    report: ["风控预演", "上会材料打包"],
  };
  if (mode && map[mode]) return map[mode];
  if (chipLabel === "公开风险速览") return map.risk;
  return ["查材料缺口", "撰写报告"];
}
