/**
 * build-test-runner-expert-battle — 专家 Battle 与默认未选专家 smoke
 * 版本: v1.3 | 日期: 2026-06-28
 */
import { createInitialState } from "./state.js";
import {
  getDefaultExpertSelection,
  getChatExpertOptions,
  setPlatformExpertsForPicker,
  DEFAULT_EXPERT_ID,
} from "../data/mock-data.js";
import {
  toggleExpertInBattleTeam,
  isBattleReadyFromTeams,
  buildBattleRoundPrompt,
  buildBattleSpeakerLabel,
  BATTLE_MAX_PER_TEAM,
} from "./expert-picker-battle-v1.0-20260627.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

setPlatformExpertsForPicker([
  { frontend_id: "ex-ag-market", name: "赛道研究专家", category: "industry", field: "行业" },
  { frontend_id: "ex-ag-kyc", name: "准入合规专家", category: "risk", field: "合规" },
]);

const state = createInitialState();
assert(state.ui.activeExpertId === null, "初始 activeExpertId 应为 null");

const opts = getChatExpertOptions();
assert(!opts.some((e) => e.id === DEFAULT_EXPERT_ID), "候选项不含小星");

state.ui.multiExpertDiscussion = true;
state.ui.battleRedIds = ["ex-ag-kyc"];
state.ui.battleBlueIds = ["ex-ag-market"];
assert(isBattleReadyFromTeams(state.ui.battleRedIds, state.ui.battleBlueIds), "Battle 红蓝就绪");
assert(state.ui.battleRedIds.includes("ex-ag-kyc"), "红方应为风险/合规专家");
assert(state.ui.battleBlueIds.includes("ex-ag-market"), "蓝方应为支持/赛道专家");

const def = getDefaultExpertSelection();
assert(def.activeExpertIds.length === 0, "reset 为未选择");

let red = toggleExpertInBattleTeam([], "ex-ag-market").team;
red = toggleExpertInBattleTeam(red, "ex-ag-market").team;
assert(red.length <= BATTLE_MAX_PER_TEAM, "红方人数上限");
assert(buildBattleRoundPrompt({
  side: "blue",
  round: 2,
  expertName: "赛道研究专家",
  topic: "议题",
  transcript: [],
}).includes("看机会"), "蓝方第2轮看机会");
assert(
  buildBattleSpeakerLabel("red", "准入合规专家") === "风险方（红方）· 准入合规专家",
  "红方发言人标识",
);

console.log("build-test-runner-expert-battle-v1.0-20260627: ok");
