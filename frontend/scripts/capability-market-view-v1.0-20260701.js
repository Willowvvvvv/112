/**
 * 能力市场视图（对齐 agent-demo SkillsPage）
 * 版本: v1.0 | 日期: 2026-07-01
 */
import { escapeHtml } from "./state.js";
import { icon } from "./icons.js";
import { DEFAULT_EXPERT_ID } from "../data/mock-data.js";
import {
  PLATFORM_SKILL_CATEGORIES,
  PLATFORM_SKILLS_CATALOG,
  PLATFORM_CONNECTORS_CATALOG,
  EXPERT_CATEGORY_LABELS,
  getSkillCategoryLabel,
  getMarketLead,
} from "../data/capability-market-catalog-v1.0-20260701.js";

const h = String.raw;

function jsCall(fn, ...args) {
  const encoded = args.map((a) => {
    if (typeof a === "number" && Number.isFinite(a)) return String(a);
    const s = String(a).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `'${s}'`;
  });
  return `${fn}(${encoded.join(", ")})`;
}

const KIND_TABS = [
  { id: "expert", icon: "users", label: "专家" },
  { id: "skill", icon: "zap", label: "技能" },
  { id: "connector", icon: "link", label: "连接器" },
];

function normalizeSkillsTab(raw) {
  if (["official", "skills", "platform-skills", "platform-experts"].includes(raw)) return "official";
  if (["my", "ai-experts", "my-skills", "my-experts"].includes(raw)) return "my";
  return "official";
}

function isSkillInstalled(state, skillId) {
  return (state.userSkills || []).includes(skillId);
}

function isConnectorInstalled(state, installKey) {
  return (state.installedConnectors || []).includes(installKey);
}

function getMySkillBookmarks(state) {
  return state.mySkillBookmarks || [];
}

function renderMarketToggle(installed, onclick, label) {
  const glyph = installed ? "minus" : "plus";
  return h`
    <button type="button"
      class="xb-market-add-btn${installed ? " is-installed" : ""}"
      aria-label="${escapeHtml(label)}"
      title="${escapeHtml(label)}"
      aria-pressed="${installed ? "true" : "false"}"
      onclick="${onclick}">
      ${icon(glyph, "icon--sm")}
    </button>
  `;
}

function renderSkillCategoryTabs(state) {
  const active = state.ui.skillCategory || "all";
  return h`
    <div class="xb-skills-tabs xb-skills-category-tabs" role="tablist">
      ${PLATFORM_SKILL_CATEGORIES.map((cat) => h`
        <button type="button"
          class="xb-skills-tab ${active === cat.id ? "on" : ""}"
          role="tab"
          onclick="${jsCall("XinBaoDemo.setSkillCategory", cat.id)}">${escapeHtml(cat.label)}</button>
      `).join("")}
    </div>
  `;
}

function filterOfficialSkills(state) {
  const cat = state.ui.skillCategory || "all";
  if (cat === "all") return PLATFORM_SKILLS_CATALOG;
  return PLATFORM_SKILLS_CATALOG.filter((skill) => skill.category === cat);
}

function getPlatformExperts(state) {
  return (state.platformExperts || []).filter((ex) => {
    const id = String(ex.id || ex.frontend_id || "");
    return id && id !== DEFAULT_EXPERT_ID && !id.startsWith("ex-cf-");
  });
}

function renderOfficialSkills(state) {
  const skills = filterOfficialSkills(state);
  return h`
    <div class="xb-market-skill-body">
      ${renderSkillCategoryTabs(state)}
      <div class="xb-skill-grid">
        ${skills.map((skill) => {
          const installed = isSkillInstalled(state, skill.id);
          const label = installed ? "从工作区移除" : "添加到工作区";
          return h`
            <article class="xb-skill-card">
              <div class="xb-skill-card-head">
                <div class="xb-skill-card-head-main">
                  <strong>${escapeHtml(skill.name)}</strong>
                  <span class="xb-mini-tag">${escapeHtml(getSkillCategoryLabel(skill.category))}</span>
                  <span class="xb-mini-tag xb-mini-tag-official">官方</span>
                </div>
                ${renderMarketToggle(installed, jsCall("XinBaoDemo.toggleMarketSkill", skill.id), label)}
              </div>
              <p>${escapeHtml(skill.description)}</p>
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderMySkills(state) {
  const bookmarks = getMySkillBookmarks(state);
  const custom = state.customSkillDefs || [];
  if (!bookmarks.length && !custom.length) {
    return `<p class="xb-block-desc">还没有收藏技能。在官方技能中点击「+」安装后即可出现在此处。</p>`;
  }
  const bookmarkCards = bookmarks.map((entry) => {
    const skill = PLATFORM_SKILLS_CATALOG.find((s) => s.id === entry.catalogId) || null;
    const name = entry.name || skill?.name || entry.catalogId;
    const installed = entry.catalogId ? isSkillInstalled(state, entry.catalogId) : false;
    const label = installed ? "从工作区移除" : "添加到工作区";
    return h`
      <article class="xb-skill-card">
        <div class="xb-skill-card-head">
          <div class="xb-skill-card-head-main">
            <strong>${escapeHtml(name)}</strong>
            <span class="xb-mini-tag xb-mini-tag-my">我的</span>
          </div>
          ${entry.catalogId
            ? renderMarketToggle(installed, jsCall("XinBaoDemo.toggleMarketSkill", entry.catalogId), label)
            : ""}
        </div>
        ${skill ? `<p>${escapeHtml(skill.description)}</p>` : ""}
      </article>
    `;
  });
  const customCards = custom.map((sk) => {
    const installed = isSkillInstalled(state, sk.id);
    const label = installed ? "从工作区移除" : "添加到工作区";
    return h`
      <article class="xb-skill-card">
        <div class="xb-skill-card-head">
          <div class="xb-skill-card-head-main">
            <strong>${escapeHtml(sk.name)}</strong>
            <span class="xb-mini-tag">${escapeHtml(sk.category || "自定义")}</span>
            <span class="xb-mini-tag xb-mini-tag-my">我的</span>
          </div>
          <div style="display:flex;gap:4px;">
            ${renderMarketToggle(installed, jsCall("XinBaoDemo.toggleMarketSkill", sk.id), label)}
            ${sk.scope !== "team" ? `<button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.shareSkill", sk.id)}">分享给团队</button>` : ""}
            <button type="button" class="xb-market-add-btn" title="删除" aria-label="删除"
              onclick="${jsCall("XinBaoDemo.deleteSkill", sk.id)}">${icon("x", "icon--sm")}</button>
          </div>
        </div>
        <p>${escapeHtml(sk.desc || "")}</p>
      </article>
    `;
  });
  return h`<div class="xb-skill-grid">${bookmarkCards.join("")}${customCards.join("")}</div>`;
}

function renderOfficialExperts(state) {
  const experts = getPlatformExperts(state);
  return h`
    <div class="xb-skill-grid">
      ${experts.map((ex) => h`
        <article class="xb-skill-card" role="button" tabindex="0"
          onclick="${jsCall("XinBaoDemo.openExpertDetail", ex.id || ex.frontend_id)}">
          <div class="xb-skill-card-head-main">
            <strong>${escapeHtml(ex.name)}</strong>
            <span class="xb-mini-tag">${escapeHtml(EXPERT_CATEGORY_LABELS[ex.category] || ex.category || "专家")}</span>
            <span class="xb-mini-tag xb-mini-tag-official">官方</span>
          </div>
          <p>${escapeHtml(ex.summary || ex.field || ex.capabilities || "")}</p>
          <div class="xb-skill-card-head-main">
            ${(ex.skills || []).map((s) => `<span class="xb-mini-tag">${escapeHtml(s)}</span>`).join("")}
          </div>
          <div class="xb-skill-card-actions">
            <button type="button" class="btn-mini primary"
              onclick="event.stopPropagation();${jsCall("XinBaoDemo.summonExpert", ex.id || ex.frontend_id)}">
              ${icon("sparkles", "icon--sm")} 召唤
            </button>
            <button type="button" class="btn-mini"
              onclick="event.stopPropagation();${jsCall("XinBaoDemo.openExpertDetail", ex.id || ex.frontend_id)}">详情</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderMyExperts(state) {
  const experts = state.userExperts || [];
  if (!experts.length) {
    return `<p class="xb-block-desc">还没有自建 AI 专家，可点击右上角「创建 AI 专家」。</p>`;
  }
  return h`
    <div class="xb-skill-grid">
      ${experts.map((ex) => h`
        <article class="xb-skill-card">
          <div class="xb-skill-card-head-main">
            <strong>${escapeHtml(ex.name)}</strong>
            <span class="xb-mini-tag xb-mini-tag-my">我的</span>
          </div>
          <p>${escapeHtml(ex.domain || ex.field || "")}</p>
          <div class="xb-skill-card-head-main">
            ${(ex.skills || []).map((s) => `<span class="xb-mini-tag">${escapeHtml(s)}</span>`).join("")}
          </div>
          <div class="xb-skill-card-actions">
            <button type="button" class="btn-mini primary"
              onclick="${jsCall("XinBaoDemo.summonExpert", ex.id)}">
              ${icon("sparkles", "icon--sm")} 召唤
            </button>
            ${ex.scope !== "team" ? `<button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.shareExpert", ex.id)}">分享给团队</button>` : ""}
            <button type="button" class="btn-mini danger" onclick="${jsCall("XinBaoDemo.deleteExpert", ex.id)}">删除</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderOfficialConnectors(state) {
  return h`
    <div class="xb-skill-grid">
      ${PLATFORM_CONNECTORS_CATALOG.map((conn) => {
        const installed = isConnectorInstalled(state, conn.installKey);
        const label = installed ? "移除连接器" : "添加连接器";
        return h`
          <article class="xb-skill-card">
            <div class="xb-skill-card-head">
              <div class="xb-skill-card-head-main">
                <strong>${escapeHtml(conn.name)}</strong>
                <span class="xb-mini-tag">${escapeHtml(conn.category)}</span>
                <span class="xb-mini-tag xb-mini-tag-official">官方</span>
              </div>
              ${renderMarketToggle(installed, jsCall("XinBaoDemo.toggleMarketConnector", conn.installKey), label)}
            </div>
            <p>${escapeHtml(conn.description)}</p>
            <p class="xb-skill-card-meta">底层 ${conn.serverCount} 路公开数据服务</p>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderMyConnectors(state) {
  const keys = state.installedConnectors || [];
  if (!keys.length) {
    return `<p class="xb-block-desc">还没有已安装的连接器。在官方连接器中点击「+」安装后即可出现在此处。</p>`;
  }
  const cards = keys.map((installKey) => {
    const conn = PLATFORM_CONNECTORS_CATALOG.find((c) => c.installKey === installKey);
    if (!conn) return "";
    const label = "移除连接器";
    return h`
      <article class="xb-skill-card">
        <div class="xb-skill-card-head">
          <div class="xb-skill-card-head-main">
            <strong>${escapeHtml(conn.name)}</strong>
            <span class="xb-mini-tag">${escapeHtml(conn.category)}</span>
            <span class="xb-mini-tag xb-mini-tag-my">我的</span>
          </div>
          ${renderMarketToggle(true, jsCall("XinBaoDemo.toggleMarketConnector", conn.installKey), label)}
        </div>
        <p>${escapeHtml(conn.description)}</p>
        <p class="xb-skill-card-meta">底层 ${conn.serverCount} 路公开数据服务</p>
      </article>
    `;
  });
  return h`<div class="xb-skill-grid">${cards.join("")}</div>`;
}

export function renderCapabilityMarketView(state) {
  const kind = state.ui.skillsKind || "expert";
  const scope = normalizeSkillsTab(state.ui.skillsTab);
  const lead = getMarketLead(kind, scope);

  const bodyByKind = {
    expert: scope === "official" ? renderOfficialExperts(state) : renderMyExperts(state),
    skill: scope === "official" ? renderOfficialSkills(state) : renderMySkills(state),
    connector: scope === "official" ? renderOfficialConnectors(state) : renderMyConnectors(state),
  };

  return h`
    <div class="feature-scroll capability-market-scroll feature-view--capability-market">
      <div class="capability-market-header-actions">
        <button type="button" class="btn-mini primary" onclick="XinBaoDemo.openSkillWizard()">
          ${icon("plus", "icon--sm")} 创建技能
        </button>
        <button type="button" class="btn-mini primary" onclick="XinBaoDemo.openExpertWizard()">
          ${icon("plus", "icon--sm")} 创建 AI 专家
        </button>
      </div>
      <p class="xb-feature-lead">${escapeHtml(lead)}</p>
      <div class="capability-market-toolbar">
        <div class="xb-market-kind-tabs" role="tablist" aria-label="能力类型">
          ${KIND_TABS.map((tab) => h`
            <button type="button"
              class="xb-market-kind-tab ${kind === tab.id ? "on" : ""}"
              role="tab"
              aria-selected="${kind === tab.id ? "true" : "false"}"
              onclick="${jsCall("XinBaoDemo.setSkillsKind", tab.id)}">
              ${icon(tab.icon, "icon--sm")}
              <span>${tab.label}</span>
            </button>
          `).join("")}
        </div>
        <div class="xb-skills-tabs xb-skills-tabs-scope" role="tablist">
          <button type="button" class="xb-skills-tab ${scope === "official" ? "on" : ""}" role="tab"
            onclick="${jsCall("XinBaoDemo.setSkillsTab", "official")}">官方</button>
          <button type="button" class="xb-skills-tab ${scope === "my" ? "on" : ""}" role="tab"
            onclick="${jsCall("XinBaoDemo.setSkillsTab", "my")}">我的</button>
        </div>
      </div>
      <div class="capability-market-body">${bodyByKind[kind] || ""}</div>
    </div>
  `;
}
