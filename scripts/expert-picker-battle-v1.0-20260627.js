/**
 * 专家 Battle 红蓝对抗 · 选位与角色提示词
 * 版本: v1.1 | 日期: 2026-06-27
 */

export const BATTLE_MAX_PER_TEAM = 4;
export const BATTLE_MAX_ROUNDS = 3;

export const BATTLE_COMPOSER_HINT =
  "先选红方/蓝方标签，再点专家加入（各最多 4 人）。发送后最多 3 轮辩论，由小星汇总裁定。";

const ROUND_HINTS = {
  1: "首轮：独立陈述本阵营观点，无需回应他方。",
  2: "次轮：针对上一轮对方要点回应与反驳，深化交锋。",
  3: "末轮：凝练最关键论点，指出仍待核实的信息缺口。",
};

export const BATTLE_ROLE_GUIDANCE = {
  red:
    "你担任红方（风险方）：指出风险、疑点、材料缺口与下行情景，对乐观论证提出专业挑战。本轮只谈风险与质疑，不要输出看多结论或立项建议。",
  blue:
    "你担任蓝方（支持方）：论证投资机会、增长逻辑与结构性亮点。本轮只谈机会与论证，不要输出风控结论或一票否决式表述。",
};

export function buildBattleSpeakerLabel(side, expertName) {
  const role = side === "red" ? "风险方" : "支持方";
  const sideName = side === "red" ? "红方" : "蓝方";
  return `${role}（${sideName}）· ${expertName}`;
}

export function isBattleReadyFromTeams(redIds, blueIds) {
  return (redIds?.length ?? 0) >= 1 && (blueIds?.length ?? 0) >= 1;
}

export function toggleExpertInBattleTeam(teamIds, expertId, max = BATTLE_MAX_PER_TEAM) {
  const team = [...(teamIds || [])];
  const idx = team.indexOf(expertId);
  if (idx >= 0) {
    team.splice(idx, 1);
    return { team, blocked: false };
  }
  if (team.length >= max) {
    return { team, blocked: true };
  }
  team.push(expertId);
  return { team, blocked: false };
}

export function getBattleRoleLabelsForExpert(expertId, redIds, blueIds, battleOn) {
  if (!battleOn || !expertId) return [];
  const roles = [];
  if ((redIds || []).includes(expertId)) roles.push("red");
  if ((blueIds || []).includes(expertId)) roles.push("blue");
  return roles;
}

export function getBattleStatusTextFromTeams(redIds, blueIds) {
  const red = redIds?.length ?? 0;
  const blue = blueIds?.length ?? 0;
  const ready = red >= 1 && blue >= 1;
  const parts = [
    `红方 ${red}/${BATTLE_MAX_PER_TEAM}`,
    `蓝方 ${blue}/${BATTLE_MAX_PER_TEAM}`,
    "最多 3 轮",
  ];
  if (ready) parts.push("小星裁定");
  return { text: parts.join(" · "), ready };
}

function formatTranscriptSnippet(transcript, side, round) {
  const prior = (transcript || []).filter(
    (t) => t.round < round || (t.round === round && t.side !== side),
  );
  if (!prior.length) return "";
  return prior
    .slice(-8)
    .map(
      (t) =>
        `[第${t.round}轮 · ${buildBattleSpeakerLabel(t.side, t.expertName)}] ${String(t.text).slice(0, 600)}`,
    )
    .join("\n");
}

export function buildBattleRoundPrompt({ side, round, expertName, topic, transcript, chipLabel }) {
  const sideLabel = side === "red" ? "红方·看风险" : "蓝方·看机会";
  const lines = [
    `【专家 Battle · 第 ${round}/${BATTLE_MAX_ROUNDS} 轮 · ${buildBattleSpeakerLabel(side, expertName)} · ${sideLabel}】`,
    BATTLE_ROLE_GUIDANCE[side],
    ROUND_HINTS[round] || ROUND_HINTS[3],
  ];
  if (chipLabel) lines.push(`场景：${chipLabel}`);
  lines.push(`议题：${topic}`);
  const prior = formatTranscriptSnippet(transcript, side, round);
  if (prior) lines.push(`前序辩论摘要（供本轮回应对话参考）：\n${prior}`);
  return lines.join("\n\n");
}

export function buildBattleVerdictPrompt(topic, transcript, chipLabel) {
  const fullLog = (transcript || [])
    .map(
      (t) =>
        `[第${t.round}轮 · ${buildBattleSpeakerLabel(t.side, t.expertName)}]\n${t.text}`,
    )
    .join("\n\n---\n\n");
  const lines = [
    "【专家 Battle · 小星综合裁定】",
    "你是主持方小星。以上红蓝双方已完成最多 3 轮对抗预演。",
    "请汇总：1) 红方核心质疑与风险论据 2) 蓝方核心机会论据 3) 关键争议点 4) 材料与信息缺口 5) 中性综合摘要。",
    "只陈述客观事实与各方观点，不做准入、投资或合作决策。",
  ];
  if (chipLabel) lines.push(`场景：${chipLabel}`);
  lines.push(`议题：${topic}`);
  lines.push(`辩论记录：\n${fullLog}`);
  return lines.join("\n\n");
}

/** @deprecated */
export function toggleBattleExpertSelection(selectedIds, expertId) {
  const ids = [...(selectedIds || [])];
  const count = ids.filter((id) => id === expertId).length;
  if (count === 0) ids.push(expertId);
  else if (count === 1 && ids.length === 1) ids.push(expertId);
  else ids.splice(ids.lastIndexOf(expertId), 1);
  return ids;
}

/** @deprecated */
export function buildBattleRolePrompt(slotIndex, userText) {
  return userText;
}

export function getBattleStatusText(selectedCount) {
  return getBattleStatusTextFromTeams(
    selectedCount > 0 ? ["x"] : [],
    selectedCount > 1 ? ["y"] : [],
  );
}
