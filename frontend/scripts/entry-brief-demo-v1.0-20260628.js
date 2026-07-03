/**
 * 建项入场分析 Demo 数据（静态 Demo）
 * 版本: v1.1 | 日期: 2026-06-28
 */

import { buildDemoEntryBrief } from "./entry-brief-presets-v1.0-20260628.js";

const PROFILE_LABEL = {
  industry: "行业",
  market: "市场",
  finance: "财务",
  legal: "法务",
  risk: "风险"
};

/** Demo：任意新建项目均返回高保真 mock */
export function buildEntryBrief(company, projectName) {
  return { ...buildDemoEntryBrief(company, projectName), profileLabel: PROFILE_LABEL };
}

export function renderEntryBriefPanel(brief, state) {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const profileHtml = (brief.profile || [])
    .map(
      p => `
      <article class="entry-brief-profile-card">
        <h4>${esc(brief.profileLabel[p.key] || p.key)}</h4>
        <p>${esc(p.summary)}</p>
        ${p.pending ? '<span class="entry-brief-pending">待补充</span>' : ""}
      </article>`
    )
    .join("");
  const similarHtml =
    brief.similarCases?.length
      ? brief.similarCases
          .map(
            c => `
        <li class="entry-brief-similar-card">
          <div class="entry-brief-similar-head">
            <strong>${esc(c.name)}</strong>
            <span class="entry-brief-badge">${esc(c.currentStatus)}</span>
          </div>
          <p class="entry-brief-meta">${esc(c.sector)} · ${esc(c.round)} · ${esc(c.ddStage)}</p>
          <p class="entry-brief-verdict">${esc(c.verdict)}</p>
          ${c.keyRisks?.length ? `<ul class="entry-brief-risks">${c.keyRisks.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
          <p class="entry-brief-relevance">${esc(c.relevanceNote)}</p>
          ${c.projectId ? `<button type="button" class="btn-link entry-brief-link" onclick="XinBaoDemo.openProject('${esc(c.projectId)}')">查看原项目</button>` : ""}
        </li>`
          )
          .join("")
      : `<p class="entry-brief-empty">暂无机构内类似项目；完成更多项目后将自动积累参照库。</p>`;
  const nextHtml = (brief.nextSteps || [])
    .map(
      step =>
        `<button type="button" class="btn-mini" onclick="XinBaoDemo.applyEntryBriefStep(${JSON.stringify(step)})">${esc(step)}</button>`
    )
    .join("");
  return `
    <section class="entry-brief-anchor">
      <h3>主体锚定</h3>
      <dl>
        <div><dt>企业</dt><dd>${esc(brief.company)}</dd></div>
        ${brief.creditCode ? `<div><dt>统一社会信用代码</dt><dd>${esc(brief.creditCode)}</dd></div>` : ""}
        ${brief.region ? `<div><dt>地区</dt><dd>${esc(brief.region)}</dd></div>` : ""}
        ${brief.industryLabel ? `<div><dt>行业</dt><dd>${esc(brief.industryLabel)}</dd></div>` : ""}
        ${brief.roundLabel ? `<div><dt>轮次/交易类型</dt><dd>${esc(brief.roundLabel)}</dd></div>` : ""}
      </dl>
    </section>
    <section class="entry-brief-section">
      <h3>企业五维画像</h3>
      <div class="entry-brief-profile-grid">${profileHtml}</div>
    </section>
    <section class="entry-brief-section">
      <h3>类似案例参照</h3>
      <ul class="entry-brief-similar-list">${similarHtml}</ul>
    </section>
    <section class="entry-brief-section">
      <h3>建议下一步</h3>
      <div class="entry-brief-next-row">${nextHtml}</div>
    </section>
  `;
}
