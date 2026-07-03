/**
 * 专家选择器单元测试
 * 版本: v1.4 | 日期: 2026-06-27
 */
import {
  CHAT_EXPERT_OPTIONS,
  DEFAULT_EXPERT_ID,
  setPlatformExpertsForPicker,
  getChatExpertOptions,
  getChatExpertById,
  getSelectedExpertIdsFromState,
  getDefaultExpertSelection,
  isAllowedExpertForPicker,
} from "../data/mock-data.js";
import {
  toggleExpertInBattleTeam,
  buildBattleRoundPrompt,
  buildBattleVerdictPrompt,
  getBattleRoleLabelsForExpert,
  isBattleReadyFromTeams,
  BATTLE_MAX_PER_TEAM,
  BATTLE_MAX_ROUNDS,
} from "./expert-picker-battle-v1.0-20260627.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

setPlatformExpertsForPicker([]);
assert(!getChatExpertOptions().some((e) => e.id === DEFAULT_EXPERT_ID), "fallback 不应含小星");

const mockPlatform = [
  { frontend_id: "ex-default", name: "小星", field: "默认", category: "default", iconKey: "star" },
  { frontend_id: "ex-ag-market", name: "赛道研究专家", field: "行业", category: "industry", iconKey: "chart" },
  { frontend_id: "ex-ag-kyc", name: "准入合规专家", field: "合规", category: "risk", iconKey: "shield", live: true },
  { frontend_id: "ex-huashu", name: "华数女娲专家", field: "领域", category: "domain", iconKey: "sparkles" },
];
setPlatformExpertsForPicker(mockPlatform);
const opts = getChatExpertOptions();
assert(opts.length === 2, `应仅含 2 位专家，实际 ${opts.length}`);

const def = getDefaultExpertSelection();
assert(def.activeExpertId === null, "默认未选专家");

let red = [];
let r1 = toggleExpertInBattleTeam(red, "ex-ag-market");
red = r1.team;
assert(red.length === 1, "红方加入 1 人");
let blue = [];
let b1 = toggleExpertInBattleTeam(blue, "ex-ag-kyc");
blue = b1.team;
assert(isBattleReadyFromTeams(red, blue), "红蓝各 1 人可开始");

let team = [];
for (const id of ["slot-a", "slot-b", "slot-c", "slot-d", "slot-e"]) {
  const next = toggleExpertInBattleTeam(team, id);
  if (!next.blocked) team = next.team;
}
assert(team.length === BATTLE_MAX_PER_TEAM, "单阵营最多 4 人");
assert(toggleExpertInBattleTeam(team, "slot-e").blocked === true, "满员不可再加");

const dualRoles = getBattleRoleLabelsForExpert("ex-ag-kyc", red, blue, true);
assert(dualRoles.includes("red") || dualRoles.includes("blue"), "专家可显示阵营标签");

const roundPrompt = buildBattleRoundPrompt({
  side: "red",
  round: 1,
  expertName: "赛道研究专家",
  topic: "测试议题",
  transcript: [],
});
assert(roundPrompt.includes("看机会") && roundPrompt.includes(`第 1/${BATTLE_MAX_ROUNDS} 轮`), "轮次提示");

const verdict = buildBattleVerdictPrompt("测试", [
  { round: 1, side: "red", expertName: "A", text: "机会" },
  { round: 1, side: "blue", expertName: "B", text: "风险" },
]);
assert(verdict.includes("小星综合裁定"), "小星裁定 prompt");

console.log("test-expert-picker-v1.0-20260627: ok");
