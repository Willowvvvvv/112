/**
 * render.js — 财跃启明星 Demo 视图层（纯函数渲染，无框架）
 * 版本：v7.18.0-20260629
 *
 * 架构：
 * - renderApp → chat 壳（renderChatShell）或重磁功能壳（renderFeatureShell）
 * - 数据来自 state + mock-data.js；交互通过 XinBaoDemo.* onclick 回调 actions.js
 *
 * 产品布局要点：
 * - 首页：标题区 + 输入框上方快捷 tag（与全部场景一致 / 全部场景入口）
 * - 项目对话：左文件树 + 中对话 + 右 preview；文件树收起用左侧浮钮展开
 * - 投资雷达：左 feed + 右栏（资讯全文与「可能感兴趣」互斥，可拖拽拉宽）
 * - 资讯全文侧栏：无查这家/找同类/存为项目；解读标签统一「内容解读」
 * - 个人中心：积分余额 + 可购套餐包 + 消耗流水（无免费次数、无单价说明行）
 */
import { escapeHtml } from "./state.js";
import { renderEntryBriefPanel } from "./entry-brief-demo-v1.0-20260628.js";
import { renderMarkdown } from "./markdown-render-v1.0-20260627.js";
import {
  messageHasSourceCitationMarkers,
  renderMessageSourceBar,
  formatSourceCitationLabel,
  sourceKindLabel,
  collectSourceCitationsFromAgentBlocks,
} from "./source-citations-demo-v1.0-20260629.js";
import {
  renderChainView as buildChainView,
  renderChainDrawer,
  findChainCompany,
} from "./chain-demo-v1.0-20260629.js";
import { renderGraphView } from "./graph-demo-v1.0-20260629.js";
import { renderFinanceConfigView } from "./finance-config-demo-v1.0-20260629.js";
import { renderMaterialsView } from "./materials-demo-v1.0-20260629.js";
import { renderReportTemplatesView } from "./report-template-demo-v1.0-20260703.js";
import { isOnProjectRoute, isProjectHubState } from "./chat-route-v1.0-20260627.js";
import { PLATFORM_SKILLS_CATALOG } from "../data/capability-market-catalog-v1.0-20260701.js";
import { renderCapabilityMarketView } from "./capability-market-view-v1.0-20260701.js";
import { isDefaultSessionName } from "./session-auto-title-v1.0-20260627.js";
import { wrapFinstepPublicText } from "./finstep-data-wrapper-v1.0-20260627.js";
import { brandLogo, BRAND_NAME, BRAND_SLOGAN } from "./brand.js";
import { REPORT_PANEL_DEFAULT_WIDTH } from "./layout-constants.js";
import {
  icon, panelIcon, statusBadge, panelHeading, resolveIcon, CATEGORY_ICONS
} from "./icons.js";
import {
  getSessionFiles,
} from "./session-files-v1.0-20260627.js";
import {
  getRadarFeedItems,
  getRadarBriefing,
  getRadarInterests,
  getRadarWeeklyTeaser,
} from "./radar-feed-v1.0-20260627.js";
import {
  EVIDENCE, SCENARIO_ITEMS, getMockFilePreview, getContextTags,
  SECTOR_OPTIONS, RADAR_INTERESTS, SECTOR_WEEKLY,
  COMPANY_SEARCH_RESULT, BATCH_EVAL_RESULT,
  INDUSTRY_ANALYSIS, JOURNALIST, EXPERTS, RISK_QNA, MATERIAL_GAP,
  INTERVIEW_OUTLINE, MY_PROFILE, POST_MONITOR, PROJECT_WATCH_PROFILE,
  MY_TEMPLATES, REPORT_SECTIONS, AI_REPORT_CATEGORY, formatReportVersionLabel, sessionHasReports,
  normalizeReportSections, sectionPlainText, getSectionSourceRefs,
  MEETING_NOTES_LIB, MEETING_EXPERTS, EXPERT_LIST, getChatExpertOptions, getChatExpertById,
  getSelectedExpertIdsFromState, DEFAULT_EXPERT_ID, DEFAULT_CHAT_EXPERT,
  REPORTER_EXPERTS, JOURNALIST_CASE, SKILL_LIST, SCENARIO_ALL, SCENARIO_CATEGORY_ICONS, MY_AVATAR,
  MATERIALS_LIB, MY_BOOKINGS,
  MEETING_LIST, MEETING_SECTORS, STAR_DATA, FILE_CATEGORIES,
  normalizeFileCategory, PROJECT_LIST,
  ORG_MEMBERS,
  getOrgMember,
  visibleProjects,
  memberId,
  DEMO_USER_IDENTITIES,
  PROJ_ROLE_LABELS,
  CURRENT_USER,
  ONBOARDING_ROLE_OPTIONS,
  ONBOARDING_SECTOR_OPTIONS,
  ONBOARDING_FOCUS_OPTIONS,
  ONBOARDING_ORG_REGISTRY,
  getProjectProgress
} from "../data/mock-data.js";
import { getBattleRoleLabelsForExpert, getBattleStatusTextFromTeams } from "./expert-picker-battle-v1.0-20260627.js";

const h = String.raw;

const DD_STAGES = ["看清企业", "案头工作"];

/** 生成可嵌入 HTML 属性的 onclick 调用 */
function jsCall(fn, ...args) {
  const encoded = args.map(a => {
    if (typeof a === "number" && Number.isFinite(a)) return String(a);
    const s = String(a).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `'${s}'`;
  });
  return `${fn}(${encoded.join(", ")})`;
}

function chipOnclick(label, msgIndex) {
  if (msgIndex != null) return jsCall("XinBaoDemo.sendChip", label, msgIndex);
  return jsCall("XinBaoDemo.sendChip", label);
}

function isClsReporterSource(source) {
  return /一线调研/.test(String(source ?? ""));
}

function sourceChipClass(source, state) {
  const s = String(source ?? "");
  if (isClsReporterSource(s)) return "source-chip source-chip-cls";
  if (/Finstep 公开数据|公开数据/.test(s)) return "source-chip source-chip-public";
  if (/审计|报告|上传|材料|BP/i.test(s)) return "source-chip source-chip-upload";
  return "source-chip source-chip-neutral";
}

function externalSourceLabel(source, state) {
  const s = wrapFinstepPublicText(String(source ?? ""));
  if (state?.deploymentMode === "private" && (/Finstep 公开数据|财联社/.test(s))) {
    return `${s}（需机构数据源接入）`;
  }
  return s;
}

function renderSourceButton(source, prefix = "", state = null) {
  const label = prefix ? `${prefix}${externalSourceLabel(source, state)}` : externalSourceLabel(source, state);
  return `<button type="button" class="link ${sourceChipClass(source, state)}" onclick="${jsCall("XinBaoDemo.showSource", source)}">${escapeHtml(label)}</button>`;
}

const FILE_SECTION_SHARED = "__section_shared__";
const FILE_SECTION_DRAFT = "__section_draft__";

function partitionProjectFiles(files, userId) {
  const shared = (files || []).filter(f => f.shareState === "shared");
  const myDrafts = (files || []).filter(f => f.shareState !== "shared" && f.author?.id === userId);
  return { shared, myDrafts };
}

function groupMaterialsByCategory(materials, predicate) {
  return FILE_CATEGORIES.map(cat => ({
    cat,
    files: (materials || []).filter(m => normalizeFileCategory(m.category) === cat && predicate(m))
  })).filter(g => g.files.length);
}

function renderFileAuthorMeta(file, isAi = false, opts = {}) {
  if (!file?.author?.name && !opts.inDraftSection) return "";
  if (opts.inDraftSection) {
    const cat = isAi ? AI_REPORT_CATEGORY : normalizeFileCategory(file.category);
    return `<span class="files-tree-file-meta">${escapeHtml(cat)}</span>`;
  }
  if (file.shareState === "shared") {
    return `<span class="files-tree-file-meta">由 ${escapeHtml(file.author.name)} ${isAi ? "生成" : "上传"}</span>`;
  }
  return `<span class="files-tree-file-meta files-tree-file-draft">草稿 · 仅我</span>`;
}

function renderRadarMeta(source, time) {
  const srcCls = isClsReporterSource(source) ? "source-meta-cls" : "";
  return `<span class="radar-meta"><span class="${srcCls}">${escapeHtml(source)}</span> · ${escapeHtml(time)}</span>`;
}


function rightPanelWidthStyle(state, fallbackPx) {
  /** 右栏拖拽宽度；未设置时走 CSS 或 fallbackPx */
  const w = state.ui.rightPanelWidth ?? fallbackPx;
  if (!w) return "";
  return `width:${w}px;max-width:${w}px;flex:0 0 ${w}px`;
}

function renderPanelResizeHandle() {
  return `<div class="panel-resize-handle" role="separator" aria-orientation="vertical" aria-label="拖拽调整面板宽度" onmousedown="event.preventDefault();event.stopPropagation();XinBaoDemo.startPanelResize(event)"></div>`;
}

import { FEATURE_VIEWS } from "./feature-views-v1.0-20260628.js";

/** 侧栏项目预览条数 · v1.0 · 2026-06-27 */
const SIDEBAR_PROJECT_PREVIEW_LIMIT = 3;

export function renderApp(state) {
  const overlay = state.onboarding?.active ? renderOnboarding(state) : "";
  if (FEATURE_VIEWS.includes(state.view)) return overlay + renderFeatureShell(state);
  if (!state.session) return overlay + `<div class="shell"><p class="loading">加载中…</p></div>`;
  return overlay + renderChatShell(state);
}

/* ============================ 重磁功能视图外壳 ============================ */

function renderFeatureShell(state) {
  const titles = {
    radar: "投资雷达", find: "找项目", journalist: "一线调研", experts: "专家智库",
    monitor: "项目监控", materials: "资料库", "report-templates": "报告模板", star: "小星 · 尽调助手",
    skills: "能力市场", projects: "项目", scenarios: "尽调场景",
    chain: "AI 产业链", graph: "项目图谱", "finance-config": "财务配置",
    profile: "小星 · 尽调助手", avatar: "小星 · 尽调助手"
  };
  const subtitles = {
    radar: "一级市场每天发生了什么（资讯 + 政策）",
    find: "区域 + 行业搜索标的（快捷入口，主入口在对话）",
    journalist: "公开数据查不到的，一线调研团队实地帮你挖",
    experts: "真人专家路演、会议纪要查阅与预约对接",
    materials: "可检索知识与个人沉淀",
    "report-templates": "机构规范、个人上传与平台标准章节框架",
    monitor: "持续盯住在跟项目，只在你关心的变化上开口",
    star: "偏好、记忆与沟通风格；对话里找小星，设置来这里",
    skills: "专家 · 技能 · 连接器",
    projects: "尽调项目工作台：企业、材料、报告与协作",
    scenarios: "技能与专家已配好，点选直接开始",
    chain: "浏览 AI 产业链各层企业分布，点击公司查看生态位与话语权，一键发起产业链定向尽调",
    graph: "项目材料关系图谱：实体、关联与知识沉淀",
    "finance-config": "财报 OCR 规则、科目映射与试算平衡配置"
  };
  const viewKey = (state.view === "profile" || state.view === "avatar") ? "star" : state.view;
  const body = {
    radar: renderRadarView, find: renderFindView,
    journalist: renderJournalistView, experts: renderExpertsView,
    materials: renderMaterialsPage, "report-templates": renderReportTemplatesPage, monitor: renderMonitorView,
    star: renderStarView,
    skills: renderCapabilityMarketView,
    projects: renderProjectsView,
    scenarios: renderScenariosView,
    chain: renderChainPage,
    graph: renderGraphPage,
    "finance-config": renderFinanceConfigPage,
    profile: renderStarView, avatar: renderStarView
  }[viewKey](state);

  const hasPreview = state.ui.previewOpen && state.ui.previewKind;
  const isRadar = viewKey === "radar";
  const isGraph = viewKey === "graph";
  const isFinanceConfig = viewKey === "finance-config";
  const isMaterials = viewKey === "materials";
  const isReportTemplates = viewKey === "report-templates";
  const isChain = viewKey === "chain";
  const isScenarios = viewKey === "scenarios";
  const layoutCls = [
    hasPreview || isRadar ? "has-preview" : "",
    isRadar ? "has-radar-rail" : "",
    isGraph ? "feature-layout--graph" : "",
    isFinanceConfig ? "feature-layout--finance" : "",
    isMaterials ? "feature-layout--materials" : "",
    isReportTemplates ? "feature-layout--materials" : "",
    isChain ? "feature-layout--chain" : "",
  ].filter(Boolean).join(" ");
  const viewCls = isGraph
    ? "feature-view feature-view--graph"
    : isFinanceConfig
      ? "feature-view feature-view--finance"
      : isMaterials || isReportTemplates
        ? "feature-view feature-view--materials"
        : isChain
          ? "feature-view feature-view--chain"
          : isScenarios
            ? "feature-view feature-view--scenarios"
            : "feature-view";
  const viewBody = isFinanceConfig
    ? `<div class="feature-scroll feature-scroll--wide">${body}</div>`
    : isMaterials || isChain || isReportTemplates
      ? body
      : body;

  const featureHeaderActions = viewKey === "projects" ? h`
    <div class="bar-actions">
      <button type="button" class="btn-header-action" onclick="XinBaoDemo.openCreateModal()" title="新项目" aria-label="新项目">
        ${icon("plus", "icon--sm")}<span>新项目</span>
      </button>
    </div>
  ` : "";

  return h`
    <div class="shell shell-chat">
      <div class="app-body">
        ${renderSidebar(state)}
        <div class="main-col">
          <header class="bar bar-chat">
            <div class="bar-title">
              <strong>${escapeHtml(state.view === "materials" ? "资料库" : (titles[state.view] || titles[viewKey]))}</strong>
              <span>${escapeHtml(subtitles[viewKey] || "")}</span>
            </div>
            ${featureHeaderActions}
          </header>
          <div class="feature-layout ${layoutCls}">
            <div class="${viewCls}">${viewBody}</div>
            ${isRadar ? renderRadarSideRail(state) : renderPreviewPane(state)}
          </div>
        </div>
      </div>
      ${renderDrawer(state)}
      ${renderModal(state)}
      ${renderAccountModal(state)}
      ${renderScenarioSheet(state)}
      ${renderAllChatsPage(state)}
      ${renderToast(state)}
      ${renderComposerPopovers(state)}
    </div>
  `;
}

/* ============================ Chat 视图外壳 ============================ */
/**
 * 布局：[文件树?] | 对话区 | [preview?]
 * - 对话与项目均可上传材料、写报告、导出；「存为项目」为可选归档
 * - 有材料或已存项目时显示文件树；收起用左侧浮钮展开
 */

function renderChatShell(state) {
  const sess = state.session;
  const projectHub = isProjectHubState(state);
  const home = !projectHub && isHomeChat(state);
  const title = sess.saved || !isDefaultSessionName(sess.name)
    ? (sess.name || "新对话")
    : "新对话";
  const subtitle = sess.company || "";
  const projMeta = sess.projectId ? (state.projectList || []).find(p => p.id === sess.projectId) : null;

  return h`
    <div class="shell shell-chat">
      <div class="app-body">
        ${renderSidebar(state)}
        <div class="main-col">
          ${home || projectHub ? "" : h`
            <header class="bar bar-chat">
              <div class="bar-title">
                <strong>${escapeHtml(title)}</strong>
                ${subtitle ? `<span>${escapeHtml(subtitle)}</span>` : ""}
              </div>
              <div class="bar-actions">
                ${(() => {
                  const newSessionProjectId = sess.projectId || projMeta?.id;
                  const newSessionOnclick = newSessionProjectId
                    ? jsCall("XinBaoDemo.newProjectChat", newSessionProjectId)
                    : "XinBaoDemo.newChat()";
                  return h`
                  <button type="button" class="btn-header-action" onclick="${newSessionOnclick}" title="新会话">
                    ${icon("plus", "icon--sm")}<span>新会话</span>
                  </button>
                `;
                })()}
                ${projMeta ? h`
                  <button type="button" class="btn-header-action" onclick="${jsCall("XinBaoDemo.openProjectCollab", projMeta.id)}" title="邀请成员">邀请</button>
                ` : ""}
                ${renderAiOutputHeaderMenu(state)}
                ${sess.saved ? "" : h`
                  <button class="btn-header-action" onclick="XinBaoDemo.saveCurrentAsProject()" title="将当前对话存为项目">存为项目</button>
                `}
              </div>
            </header>
          `}
          <div class="chat-layout ${layoutClasses(state)}${home || projectHub ? " home-stage" : ""}${projectHub ? " project-hub-stage" : ""}">
            ${!projectHub && state.ui.filesOpen && sessionHasFiles(sess, state) ? renderFiles(state) : ""}
            ${!projectHub && sessionHasFiles(sess, state) && !state.ui.filesOpen ? renderFilesExpandFab() : ""}
            <section class="chat-main${home ? " chat-main-home" : ""}${projectHub ? " chat-main-project-hub" : ""}">
              ${projectHub ? h`
                <div class="project-hub-page">
                  ${state.ui.filesOpen && sessionHasFiles(sess, state) ? renderFiles(state) : ""}
                  ${sessionHasFiles(sess, state) && !state.ui.filesOpen ? renderFilesExpandFab() : ""}
                  <div class="project-hub-main">
                    <div class="project-hub-center">
                      ${renderProjectHub(state)}
                      <footer class="composer composer-home">${renderComposerArea(state)}</footer>
                    </div>
                  </div>
                </div>
              ` : home ? h`
                <div class="home-stage-center">
                  ${renderHomeHero(state)}
                  <footer class="composer composer-home">${renderComposerArea(state)}</footer>
                </div>
              ` : h`
                <div class="messages xb-chat-messages" id="chat-scroll">
                  ${(sess.messages || []).map((m, i) => renderMessage(m, i, state)).join("")}
                </div>
                <footer class="composer">${renderComposerArea(state)}</footer>
              `}
            </section>
            ${renderPreviewPane(state)}
          </div>
        </div>
      </div>
      ${renderDrawer(state)}
      ${renderModal(state)}
      ${renderAccountModal(state)}
      ${renderScenarioSheet(state)}
      ${renderAllChatsPage(state)}
      ${renderToast(state)}
      ${renderComposerPopovers(state)}
    </div>
  `;
}

/** 空对话且未绑定企业/项目 → 展示首页 hero，否则展示消息流 */
function isHomeChat(state) {
  const sess = state.session;
  if (!sess || sess.saved || sess.company) return false;
  return (sess.messages || []).length === 0;
}

/**
 * 首页 hero：仅品牌与标题
 */
function renderHomeHero(state) {
  return h`
    <div class="home-hero">
      <p class="home-eyebrow">${BRAND_SLOGAN}</p>
      <h1 class="home-headline">最近想尽调什么？</h1>
      <p class="home-lead">
        <span>一线调研实地核实</span>
        <span class="home-lead-sep" aria-hidden="true">·</span>
        <span>38万+专家纪要</span>
        <span class="home-lead-sep" aria-hidden="true">·</span>
        <span>AI专家即时研判</span>
      </p>
    </div>
  `;
}

/** 项目工作台：标题 + 历史会话（对齐 agent-demo 简化版） */
function renderProjectHub(state) {
  const projectId = state.ui.projectHubId || state.session?.projectId || state.session?.id;
  const proj = (state.projectList || []).find(p => p.id === projectId);
  const chats = proj?.chats?.length ? proj.chats : [];
  const displayName = (proj?.company || proj?.name || "")
    .replace(/科技有限公司$/, "")
    .replace(/有限公司$/, "");

  return h`
    <div class="project-hub-hero">
      <p class="project-hub-eyebrow">${escapeHtml(proj?.company || proj?.name || "")}</p>
      <h1 class="project-hub-title">${escapeHtml(displayName || proj?.name || "项目")}</h1>
      ${proj?.industry ? `<p class="project-hub-meta">${escapeHtml(proj.industry)}${proj.round ? ` · ${escapeHtml(proj.round)}` : ""}</p>` : ""}
    </div>
    <section class="project-hub-history" aria-label="历史会话">
      <h2 class="project-hub-history-title">历史会话</h2>
      ${chats.length ? h`
        <ul class="project-hub-history-list">
          ${chats.map(c => h`
            <li>
              <button type="button" class="project-hub-history-row"
                onclick="${jsCall("XinBaoDemo.openProjectChat", projectId, c.id)}">
                <span class="project-hub-history-label">${escapeHtml(c.label || "对话")}</span>
                <span class="project-hub-history-time">${escapeHtml(c.time || "")}</span>
              </button>
            </li>
          `).join("")}
        </ul>
      ` : `<p class="project-hub-history-empty">暂无历史会话，在下方输入框开始新对话。</p>`}
    </section>
  `;
}

/** 首页输入框上方快捷 tag（全部场景右对齐，与对话页一致） */
function renderHomeComposerTags() {
  const tag = (label, action) => h`
    <button type="button" class="home-prompt-chip" onclick="${action}">${escapeHtml(label)}</button>
  `;
  return h`
    <div class="composer-tag-row home-tag-row">
      <div class="home-prompt-chips">
        ${tag("标的速览", "XinBaoDemo.selectComposerChip('标的速览')")}
        ${tag("公开面深读", "XinBaoDemo.selectComposerChip('公开面深读')")}
        ${tag("行业赛道分析", "XinBaoDemo.selectComposerChip('行业赛道分析')")}
        ${tag("访谈提纲准备", "XinBaoDemo.selectComposerChip('访谈提纲准备')")}
        ${tag("财报深读", "XinBaoDemo.selectComposerChip('财报深读')")}
        ${tag("尽调报告", "XinBaoDemo.selectComposerChip('尽调报告')")}
      </div>
      <button type="button" class="composer-scenario-btn" onclick="XinBaoDemo.go('scenarios')">全部场景</button>
    </div>
  `;
}

function renderOnboarding(state) {
  const step = state.onboarding?.step ?? 0;
  const draft = state.onboarding?.draft || {};
  const steps = ["你在哪工作？", "你主要看什么方向？", "你平时尽调关注什么？"];

  let body = "";
  if (step === 0) {
    const selectedOrg = draft.org || "";
    body = h`
      <div class="onboarding-field-group">
        <label for="ob-org">机构名称</label>
        <select id="ob-org" class="onboarding-field" onchange="XinBaoDemo.onboardingOrgSelect(this.value)">
          <option value="">请选择机构（Demo 名录）</option>
          ${ONBOARDING_ORG_REGISTRY.map(o => h`
            <option value="${escapeHtml(o.name)}" ${selectedOrg === o.name ? "selected" : ""}>${escapeHtml(o.name)}</option>
          `).join("")}
        </select>
      </div>
      <div class="onboarding-field-group">
        <label for="ob-dept">部门</label>
        <input id="ob-dept" class="onboarding-field" type="text" placeholder="投资部 / 风控部 / 研究部…" value="${escapeHtml(draft.dept || "")}" />
      </div>
      <div class="onboarding-field-group">
        <label for="ob-role">角色</label>
        <select id="ob-role" class="onboarding-field">
          ${ONBOARDING_ROLE_OPTIONS.map(r =>
            `<option value="${escapeHtml(r)}" ${draft.role === r ? "selected" : ""}>${escapeHtml(r)}</option>`
          ).join("")}
        </select>
      </div>
    `;
  } else if (step === 1) {
    body = h`
      <p class="onboarding-hint">多选关注赛道；投资雷达会优先推送相关资讯。没有合适的可自行添加。</p>
      <div class="onboarding-chips">
        ${ONBOARDING_SECTOR_OPTIONS.map(s => {
          const on = (draft.sectors || []).includes(s);
          return `<button type="button" class="onboarding-chip ${on ? "on" : ""}" onclick="${jsCall("XinBaoDemo.toggleOnboardingSector", s)}">${escapeHtml(s)}</button>`;
        }).join("")}
        ${(draft.sectors || []).filter(s => !ONBOARDING_SECTOR_OPTIONS.includes(s)).map(s =>
          `<button type="button" class="onboarding-chip on onboarding-chip--custom" onclick="${jsCall("XinBaoDemo.toggleOnboardingSector", s)}">${escapeHtml(s)}</button>`
        ).join("")}
      </div>
      <div class="onboarding-custom-row">
        <input id="ob-sector-custom" class="onboarding-field" type="text" placeholder="其他赛道，输入后添加" />
        <button type="button" class="btn-mini primary" onclick="XinBaoDemo.addOnboardingCustomSector()">添加</button>
      </div>
    `;
  } else {
    body = h`
      <p class="onboarding-hint">写下来吧，小星会据此定制投资雷达与尽调提醒。写得越具体，越懂你的投资习惯。</p>
      <div class="onboarding-field-group">
        <label for="ob-focus-notes">尽调关注点</label>
        <textarea
          id="ob-focus-notes"
          class="onboarding-field onboarding-textarea"
          rows="4"
          placeholder="例如：重点关注客户集中度与关联交易；偏好先看公开风险再要材料；对现金流质量特别敏感…"
        >${escapeHtml(draft.focusNotes || "")}</textarea>
      </div>
      <label class="onboarding-sub-label">常见关注点（点选可填入上文）</label>
      <div class="onboarding-chips">
        ${ONBOARDING_FOCUS_OPTIONS.map(f => {
          const on = (draft.focuses || []).includes(f);
          return `<button type="button" class="onboarding-chip ${on ? "on" : ""}" onclick="${jsCall("XinBaoDemo.toggleOnboardingFocus", f)}">${escapeHtml(f)}</button>`;
        }).join("")}
      </div>
    `;
  }

  return h`
    <div class="onboarding-shell" role="dialog" aria-modal="true" aria-label="首次使用引导">
      <div class="onboarding-card">
        <div class="onboarding-progress">
          ${steps.map((_, i) => `<span class="onboarding-step-dot ${i <= step ? "on" : ""}"></span>`).join("")}
        </div>
        <p class="onboarding-eyebrow">欢迎使用 ${BRAND_NAME} · 步骤 ${step + 1}/3</p>
        <h2 class="onboarding-title">${escapeHtml(steps[step])}</h2>
        <div class="onboarding-body">${body}</div>
        <div class="onboarding-actions">
          ${step > 0 ? `<button type="button" class="btn-ghost" onclick="XinBaoDemo.onboardingBack()">上一步</button>` : `<button type="button" class="btn-ghost" onclick="XinBaoDemo.skipOnboarding()">跳过引导</button>`}
          <button type="button" class="btn-send" onclick="XinBaoDemo.onboardingNext()">${step < 2 ? "下一步" : "完成"}</button>
        </div>
      </div>
    </div>
  `;
}

/* ============================ 左侧菜单（v4 顺序） ============================ */
/**
 * 侧栏结构：首页（hover 加新对话）→ 项目（标题行 + 新项目）→ 重磁导航 → 最近对话 → 小星 → 账号
 * 项目 ⋯：重命名、删除（无归档）；对话 hover 显示 ⋯
 */

function isProjectExpanded(state, projectId) {
  return state.ui.projectExpandedMap[projectId] !== false;
}

function chatDedupeKey(item) {
  if (item.projectId) return `project:${item.projectId}:${item.id}`;
  if (item.sessionId) return `session:${item.sessionId}`;
  return `chat:${item.id}`;
}

function allSidebarChats(state) {
  const recent = state.recentItems || [];
  const seen = new Set(recent.map((r) => chatDedupeKey(r)));
  const fromProjects = [];
  for (const proj of state.projectList || PROJECT_LIST) {
    for (const chat of proj.chats || []) {
      const entry = {
        ...chat,
        kind: "project",
        projectId: proj.id,
        label: chat.label,
        time: chat.time || proj.updated || "",
      };
      const key = chatDedupeKey(entry);
      if (seen.has(key)) continue;
      seen.add(key);
      fromProjects.push(entry);
    }
  }
  return [...recent, ...fromProjects];
}

function recentSidebarChats(state) {
  return allSidebarChats(state).slice(0, 5);
}

function chatOpenAction(item) {
  if (item.projectId) {
    return jsCall("XinBaoDemo.openProjectChat", item.projectId, item.id);
  }
  return jsCall("XinBaoDemo.openSession", item.id);
}

function chatRowMenuOpts(item) {
  return item.projectId
    ? { type: "projectChat", projectId: item.projectId }
    : { type: "chat" };
}

function chatTimeBucket(item) {
  if (item.bucket) return item.bucket;
  const t = item.time || "";
  if (/刚才|今天|小时前/.test(t)) return "today";
  if (/昨天|天前|本周|上周/.test(t)) return "week";
  return "earlier";
}

function renderSidebarRow(state, item, activeId, onclick, menuOpts) {
  const menuKey = menuOpts ? `${menuOpts.type}-${item.id}` : null;
  return h`
    <li class="sidebar-row-wrap">
      <button type="button" class="sidebar-row ${activeId === item.id ? "active" : ""}" onclick="${onclick}">
        <span class="sidebar-row-label">${escapeHtml(item.label)}</span>
        <span class="sidebar-row-time">${escapeHtml(item.time || "")}</span>
      </button>
      ${menuOpts ? renderRowMenuTrigger(state, menuKey, menuOpts.type, item.id, menuOpts.projectId) : ""}
    </li>
  `;
}

function renderRowMenuTrigger(state, menuKey, type, id, projectId) {
  const open = state.ui.rowMenu?.key === menuKey;
  const pidArg = projectId ? `,'${projectId}'` : "";
  const actions = {
    chat: [
      { label: "重命名", fn: `XinBaoDemo.renameChat('${id}'${pidArg})` },
      { label: "移动到项目", fn: `XinBaoDemo.moveChat('${id}')` },
      { label: "删除", fn: `XinBaoDemo.deleteChat('${id}'${pidArg})`, danger: true }
    ],
    projectChat: [
      { label: "重命名", fn: `XinBaoDemo.renameChat('${id}'${pidArg})` },
      { label: "删除", fn: `XinBaoDemo.deleteChat('${id}'${pidArg})`, danger: true }
    ],
    project: [
      { label: "重命名", fn: `XinBaoDemo.renameProject('${id}')` },
      { label: "删除", fn: `XinBaoDemo.deleteProject('${id}')`, danger: true }
    ],
    material: [
      { label: "重命名", fn: `XinBaoDemo.renameMaterial('${id}')` },
      { label: "删除", fn: `XinBaoDemo.deleteMaterial('${id}')`, danger: true }
    ],
    file: [
      { label: "删除", fn: `XinBaoDemo.removeFile('${id}')`, danger: true }
    ]
  }[type] || [];
  return h`
    <div class="row-menu-wrap">
      <button type="button" class="row-menu-trigger" onclick="event.stopPropagation();${jsCall("XinBaoDemo.toggleRowMenu", menuKey, type, id, projectId || "")}" aria-label="更多操作">⋯</button>
      ${open ? h`
        <div class="row-menu-dropdown">
          ${actions.map(a => `<button type="button" class="row-menu-item ${a.danger ? "danger" : ""}" onclick="event.stopPropagation();${a.fn}">${escapeHtml(a.label)}</button>`).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderSidebarSectionHead(label, count, expanded, toggleFn, trailingHtml = "", modifierClass = "", sectionIcon = "") {
  const iconHtml = sectionIcon
    ? `<span class="sidebar-section-head-icon">${icon(sectionIcon, "icon--sm")}</span>`
    : "";
  return h`
    <div class="sidebar-section-head-row ${modifierClass}">
      <button type="button" class="sidebar-section-head" onclick="${toggleFn}">
        <span class="sidebar-section-head-leading">
          ${iconHtml}
          <span class="sidebar-section-title">${escapeHtml(label)} <em>(${count})</em></span>
        </span>
        ${icon(expanded ? "chevronDown" : "chevronRight", "icon--sm")}
      </button>
      ${trailingHtml ? `<div class="sidebar-section-head-actions">${trailingHtml}</div>` : ""}
    </div>
  `;
}

/** 侧栏首页行：悬浮右侧显示「加新对话」（原「新对话」快捷入口） */
function renderSidebarHomeRow(state) {
  const homeActive = state.view === "chat" && isHomeChat(state);
  return h`
    <div class="sidebar-home-row ${homeActive ? "is-active" : ""}">
      <button type="button" class="sidebar-home-main" onclick="XinBaoDemo.goHome()">
        <span class="sidebar-home-icon">${icon("home", "icon--sm")}</span>
        <span class="sidebar-home-label">首页</span>
      </button>
      <div class="sidebar-home-row-actions">
        <button type="button" class="sidebar-home-add" onclick="event.stopPropagation();XinBaoDemo.newChat()" title="新对话" aria-label="新对话">
          ${icon("plus", "icon--sm")}<span>新对话</span>
        </button>
      </div>
    </div>
  `;
}

/** 侧栏项目行：悬浮右侧显示「新项目」 */
function renderSidebarProjectsRow(state) {
  const projectsNavActive = state.view === "projects" || isOnProjectRoute();
  return h`
    <div class="sidebar-project-nav-row ${projectsNavActive ? "is-active" : ""}">
      <button type="button" class="sidebar-project-nav-main" onclick="XinBaoDemo.go('projects')">
        <span class="sidebar-project-nav-icon">${icon("projectSpace", "icon--sm")}</span>
        <span class="sidebar-project-nav-label">项目</span>
      </button>
      <div class="sidebar-project-nav-actions">
        <button type="button" class="sidebar-project-nav-add" onclick="event.stopPropagation();XinBaoDemo.openCreateModal()" title="新项目" aria-label="新项目">
          ${icon("plus", "icon--sm")}<span>新项目</span>
        </button>
      </div>
    </div>
  `;
}

function renderSidebar(state) {
  const open = state.ui.sidebarOpen !== false;
  const view = state.view;
  const activeId = state.session?.id;
  const chats = recentSidebarChats(state);
  const chatsExpanded = state.ui.chatsExpanded !== false;

  const navItem = (key, iconName, label, { weak = false, primary = false, hint = "" } = {}) => h`
    <button class="nav-item ${view === key ? "active" : ""} ${weak ? "nav-weak" : ""} ${primary ? "nav-primary" : ""} ${hint ? "nav-item--with-hint" : ""}" onclick="XinBaoDemo.go('${key}')">
      <span class="nav-icon">${icon(iconName)}</span>
      <span class="nav-text-wrap">
        <span class="nav-text">${label}</span>
        ${hint ? `<span class="nav-hint">${escapeHtml(hint)}</span>` : ""}
      </span>
    </button>
  `;

  if (!open) {
    const railBtn = (fn, ic, title) =>
      `<button class="sidebar-rail-btn" onclick="${fn}" title="${title}" aria-label="${title}">${icon(ic, "icon--md")}</button>`;
    return h`
      <aside class="sidebar sidebar-collapsed" aria-label="导航">
        ${railBtn("XinBaoDemo.toggleSidebar()", "chevronRight", "展开侧栏")}
        ${brandLogo("brand-logo sidebar-rail-mark", 32)}
        ${railBtn("XinBaoDemo.goHome()", "home", "首页")}
        ${railBtn("XinBaoDemo.openCreateModal()", "plus", "新项目")}
        ${railBtn("XinBaoDemo.go('projects')", "projectSpace", "项目")}
        ${railBtn("XinBaoDemo.go('scenarios')", "layers", "尽调场景")}
        ${railBtn("XinBaoDemo.go('chain')", "network", "产业链")}
        ${railBtn("XinBaoDemo.go('experts')", "users", "专家智库")}
        ${railBtn("XinBaoDemo.go('journalist')", "newspaper", "一线调研")}
        ${railBtn("XinBaoDemo.go('report-templates')", "layoutTemplate", "报告模板")}
        ${railBtn("XinBaoDemo.go('finance-config')", "calculator", "财务配置")}
        ${railBtn("XinBaoDemo.go('graph')", "share", "项目图谱")}
        ${railBtn("XinBaoDemo.go('materials')", "library", "资料库")}
        ${railBtn("XinBaoDemo.go('radar')", "radar", "投资雷达")}
        ${railBtn("XinBaoDemo.go('monitor')", "chart", "项目监控")}
        ${railBtn("XinBaoDemo.go('skills')", "zap", "能力市场")}
        ${railBtn("XinBaoDemo.go('star')", "star", "小星 · 尽调助手")}
      </aside>
    `;
  }

  return h`
    <aside class="sidebar" aria-label="导航">
      <div class="sidebar-brand">
        ${brandLogo("brand-logo", 26)}
        <span class="name">${BRAND_NAME}</span>
        <button class="sidebar-collapse-btn" onclick="XinBaoDemo.toggleSidebar()" title="收起侧栏" aria-label="收起侧栏">${icon("chevronLeft")}</button>
      </div>

      <nav class="sidebar-section sidebar-projects sidebar-section-primary sidebar-block-top">
        ${renderSidebarHomeRow(state)}
        ${renderSidebarProjectsRow(state)}
        ${navItem("scenarios", "layers", "尽调场景", { primary: true })}
      </nav>

      <nav class="nav-group nav-group-research">
        <span class="nav-group-label">研判能力</span>
        ${navItem("chain", "network", "产业链", { primary: true })}
        ${navItem("experts", "users", "专家智库", { primary: true })}
        ${navItem("journalist", "newspaper", "一线调研", { primary: true })}
      </nav>

      <nav class="nav-group nav-group-assets">
        <span class="nav-group-label">项目沉淀</span>
        ${navItem("report-templates", "layoutTemplate", "报告模板")}
        ${navItem("finance-config", "calculator", "财务配置")}
        ${navItem("graph", "share", "项目图谱")}
        ${navItem("materials", "library", "资料库")}
      </nav>

      <nav class="nav-group nav-group-discovery">
        <span class="nav-group-label">发现与监控</span>
        ${navItem("radar", "radar", "投资雷达")}
        ${navItem("monitor", "chart", "项目监控")}
        ${navItem("skills", "zap", "能力市场", { hint: "专家 · 技能 · 连接器" })}
      </nav>

      <nav class="sidebar-section sidebar-chats sidebar-section-secondary">
        ${renderSidebarSectionHead("最近对话", chats.length, chatsExpanded, "XinBaoDemo.toggleChats()", "", "sidebar-section-head-row--secondary")}
        ${chatsExpanded ? h`
          <ul class="sidebar-list">
            ${chats.length
              ? chats.map(c => renderSidebarRow(state, c, activeId, chatOpenAction(c), chatRowMenuOpts(c))).join("")
              : `<li class="sidebar-empty">暂无对话</li>`}
          </ul>
          ${allSidebarChats(state).length > 5
            ? `<button type="button" class="sidebar-row sidebar-view-all" onclick="XinBaoDemo.openAllChats()">查看全部对话</button>`
            : ""}
        ` : ""}
      </nav>

      <div class="sidebar-bottom">
        <nav class="nav-group nav-group-bottom">
          ${navItem("star", "star", "小星 · 尽调助手")}
        </nav>

        <div class="sidebar-bottom-actions">
          <button type="button" class="sidebar-more xb-sidebar-more" onclick="XinBaoDemo.toggleSidebarMore()" title="更多" aria-label="更多">
            ${icon("moreHorizontal", "icon--sm")}
            <span>更多</span>
          </button>
          <button type="button" class="sidebar-account" onclick="XinBaoDemo.openAccount()">
            <span class="sidebar-account-avatar">${escapeHtml((state.currentUser?.avatar || state.userAccount?.avatar || "U").slice(0, 2))}</span>
            <span class="sidebar-account-info">
              <strong>${escapeHtml(state.currentUser?.name || state.userAccount?.name || "用户")}</strong>
              <em>个人中心</em>
            </span>
          </button>
        </div>
        ${state.ui.sidebarMoreOpen ? renderSidebarMoreMenu(state) : ""}
      </div>
    </aside>
  `;
}

function renderSidebarMoreMenu(state) {
  return h`
    <div class="sidebar-more-menu sidebar-more-dropdown" role="menu">
      <button type="button" class="sidebar-more-item" onclick="XinBaoDemo.sidebarMoreAction('schedule')">日程</button>
      <button type="button" class="sidebar-more-item" onclick="XinBaoDemo.sidebarMoreAction('credential')">凭证</button>
      <div class="sidebar-more-sep" role="separator"></div>
      <button type="button" class="sidebar-more-item" onclick="XinBaoDemo.sidebarMoreAction('language')">Switch to English</button>
      <button type="button" class="sidebar-more-item" onclick="XinBaoDemo.sidebarMoreAction('setup')">设置</button>
      <div class="sidebar-more-sep" role="separator"></div>
      <button type="button" class="sidebar-more-item" onclick="XinBaoDemo.sidebarMoreAction('tour')">新手引导</button>
    </div>
  `;
}

/* ============================ 重磁视图：投资雷达 ============================ */
/**
 * 左：投资早餐 + 赛道周报 + 行业筛选 + 资讯/政策 feed
 * 右栏 renderRadarSideRail：资讯全文 preview 与「可能感兴趣」互斥（见 openNews / toggleRadarInterests）
 * 资讯卡：工具栏右上「查看全文」；列表与全文侧栏均无查这家/找同类/存为项目按钮
 */

function renderRadarView(state) {
  const filter = state.featureData?.radarFilter || "全部";
  const isPolicy = filter === "政策速递";
  const allFeed = getRadarFeedItems(state);
  const feed = isPolicy
    ? allFeed
    : filter === "全部"
      ? allFeed
      : allFeed.filter(n => n.sector === filter);
  const feedLabel = isPolicy
    ? "政策速递"
    : filter === "全部"
      ? "今日资讯"
      : `${filter} 资讯`;
  const feedLoading = !!state.featureData?.radarFeedLoading;
  const feedError = state.featureData?.radarFeedError;

  return h`
    <div class="feature-scroll">
      ${renderStarBriefing(state)}
      ${renderSectorWeeklyEntry(state)}
      <div class="radar-sectors">
        <span class="radar-label">全市场热点 · 可按行业筛选</span>
        <button type="button" class="sector-chip ${filter === "全部" ? "on" : ""}"
          onclick="${jsCall("XinBaoDemo.setRadarFilter", "全部")}">全部</button>
        <button type="button" class="sector-chip ${isPolicy ? "on" : ""}"
          onclick="${jsCall("XinBaoDemo.setRadarFilter", "政策速递")}">政策速递</button>
        ${(() => {
          const filterSectors = (state.userSectors && state.userSectors.length)
            ? state.userSectors
            : ["医疗器械", "航空MRO"];
          return filterSectors.map(s => h`
          <button type="button" class="sector-chip ${filter === s ? "on" : ""}"
            onclick="${jsCall("XinBaoDemo.setRadarFilter", s)}">${escapeHtml(s)}</button>
        `).join("");
        })()}
      </div>

      ${!isPolicy ? `<div class="radar-briefing-divider" aria-hidden="true"></div>` : ""}
      <h4 class="section-h">${escapeHtml(feedLabel)}<span class="radar-meta"> · ${state.featureData?.radarFeedLive ? "实时" : "演示数据"}</span></h4>
      ${feedLoading ? `<p class="find-hint">资讯加载中…</p>` : ""}
      ${feedError ? `<p class="find-hint">${escapeHtml(feedError)}</p>` : ""}
      ${!feedLoading && feed.length
        ? feed.map(n => isPolicy ? renderPolicyCard(state, n) : renderRadarCard(state, n)).join("")
        : !feedLoading && !feedError ? `<p class="find-hint">该领域暂无新资讯，请稍后再看。</p>` : ""}
    </div>
  `;
}

function renderBriefingDigestHtml(digest) {
  const parts = String(digest || "").split(/(【[^】]+】)/g).filter(Boolean);
  return parts.map(part =>
    /^【[^】]+】$/.test(part)
      ? `<span class="briefing-dim-tag">${escapeHtml(part)}</span>`
      : escapeHtml(part)
  ).join("");
}

function renderStarBriefing(state) {
  const loading = !!state.featureData?.radarBriefingLoading;
  const refreshing = !!state.featureData?.radarBriefingRefreshing;
  const err = state.featureData?.radarBriefingError;
  const b = getRadarBriefing(state);
  return h`
    <article class="star-briefing-card morning-briefing-card">
      <header class="star-briefing-head">
        <span class="star-briefing-icon">${icon("radar", "icon--md")}</span>
        <div>
          <strong>投资早餐</strong>
          <span class="star-briefing-date">${escapeHtml(b?.date || "—")}</span>
        </div>
      </header>
      ${loading && !b ? `<p class="find-hint">小星正在整理今日投资早餐…</p>` : ""}
      ${err && !b ? `<p class="find-hint">${escapeHtml(err)}</p>` : ""}
      ${refreshing && b ? `<p class="find-hint mini-meta">正在更新…</p>` : ""}
      ${b?.lead ? `<p class="morning-briefing-lead">${escapeHtml(b.lead)}</p>` : ""}
      ${b?.digest ? `<p class="morning-briefing-digest">${renderBriefingDigestHtml(b.digest)}</p>` : ""}
    </article>
  `;
}

function renderSectorWeeklyEntry(state) {
  const sectors = (state.userSectors && state.userSectors.length)
    ? state.userSectors
    : ["医疗器械", "航空MRO"];
  const sector = state.featureData?.weeklySector || sectors[0] || "医疗器械";
  const loading = !!state.featureData?.radarWeeklyLoading;
  const err = state.featureData?.radarWeeklyError;
  const data = getRadarWeeklyTeaser(state, sector);
  const weeklySectors = sectors;
  return h`
    <div class="sector-weekly-entry" id="sector-weekly-entry">
      <div class="sector-weekly-entry-chips">
        ${weeklySectors.map(s => h`
          <span class="sector-chip sector-chip-managed ${sector === s ? "on" : ""}">
            <button type="button" class="sector-chip-select"
              onclick="${jsCall("XinBaoDemo.setWeeklySector", s)}">${escapeHtml(s)}</button>
            <button type="button" class="sector-chip-remove" title="取消关注"
              onclick="event.stopPropagation();${jsCall("XinBaoDemo.removeRadarFocusSector", s)}">×</button>
          </span>
        `).join("")}
        <button type="button" class="sector-chip sector-chip-add"
          onclick="${jsCall("XinBaoDemo.promptAddRadarFocusSector")}">+ 添加关注</button>
      </div>
      <div class="sector-weekly-entry-row">
        <p class="sector-weekly-entry-teaser">${loading && !data ? "小星正在整理赛道周报…" : err && !data ? escapeHtml(err) : data ? escapeHtml(data.teaser) : "该赛道本周暂无融资事件收录。"}</p>
        <button type="button" class="sector-weekly-entry-link" onclick="${jsCall("XinBaoDemo.openSectorWeeklyReport", sector)}">看赛道周报 →</button>
      </div>
    </div>
  `;
}

function renderSectorWeeklyPanel(payload) {
  const data = payload?.data || null;
  if (!data) return `<p class="find-hint">该赛道本周暂无融资事件收录。</p>`;
  return h`
    <div class="sector-weekly-panel">
      <p class="sector-weekly-panel-meta mini-meta">${escapeHtml(data.sector)} · ${escapeHtml(data.range)}</p>
      <p class="sector-weekly-panel-summary">${escapeHtml(data.summary)}</p>
      <ul class="sector-weekly-blurbs">
        ${data.deals.map(deal => h`
          <li class="sector-weekly-blurb-item">
            <button type="button" class="sector-weekly-blurb-name" onclick="${jsCall("XinBaoDemo.doExamineCompany", deal.company)}">${escapeHtml(deal.company)}</button>
            <span class="sector-weekly-blurb-meta mini-meta">${escapeHtml(deal.round)} · ${escapeHtml(deal.amount)} · ${escapeHtml(deal.tag)}</span>
            <p class="sector-weekly-blurb-text">${escapeHtml(deal.blurb)}</p>
          </li>
        `).join("")}
      </ul>
      ${data.insight ? `<p class="sector-weekly-panel-insight">${escapeHtml(data.insight)}</p>` : ""}
    </div>
  `;
}

/** 分条解读：点击后写入 featureData.radarInterpreted[id]，不跳转全文 */
function renderRadarInterpretation(state, id, interpretation) {
  const interpreted = state.featureData?.radarInterpreted?.[id];
  if (!interpreted) {
    return `<button type="button" class="btn-interpret" onclick="event.stopPropagation();${jsCall("XinBaoDemo.interpretNews", id)}">${icon("zap", "icon--sm")}<span>内容解读</span></button>`;
  }
  if (interpreted === "loading") {
    return `<div class="expert-note is-loading"><span class="expert-note-tag">小星解读中</span><p>正在从投资视角分析这条资讯…</p></div>`;
  }
  return h`
    <div class="expert-note is-expanded">
      <span class="expert-note-tag">小星 · 内容解读</span>
      <p>${escapeHtml(interpreted)}</p>
      <button type="button" class="interpret-discuss-link" onclick="event.stopPropagation();${jsCall("XinBaoDemo.discussInterpretation", "news", id)}">带这条继续深聊</button>
    </div>
  `;
}

function renderRadarCardToolbar(id, sectorLabel, source, time, isPolicy) {
  return h`
    <div class="radar-card-toolbar">
      <div class="radar-card-head">
        <span class="sector-tag ${isPolicy ? "policy" : ""}">${escapeHtml(sectorLabel)}</span>
        ${renderRadarMeta(source, time)}
      </div>
      <button type="button" class="radar-read-link" onclick="event.stopPropagation();${jsCall("XinBaoDemo.openNews", id)}">查看全文</button>
    </div>
  `;
}

/**
 * 雷达右侧栏：hasPreview 时占满高度展示资讯/报告 embed；否则展示推荐或收起条
 * interestsOpen 在 hasPreview 时强制 false，防止与 preview 重叠
 */
function renderRadarSideRail(state) {
  const hasPreview = state.ui.previewOpen && state.ui.previewKind;
  const interestsOpen = state.ui.radarInterestsOpen !== false && !hasPreview;
  const railClass = [
    interestsOpen ? "" : "is-interests-collapsed",
    hasPreview ? "has-preview-embed" : ""
  ].filter(Boolean).join(" ");
  const canResizeRail = hasPreview || interestsOpen;
  const railWidthFallback = hasPreview ? 440 : 320;
  return h`
    <aside class="radar-side-rail ${railClass}${canResizeRail ? " resizable-panel" : ""}" style="${canResizeRail ? rightPanelWidthStyle(state, railWidthFallback) : ""}" aria-label="推荐与详情">
      ${canResizeRail ? renderPanelResizeHandle() : ""}
      ${hasPreview ? renderPreviewPaneEmbedded(state) : ""}
      ${interestsOpen
        ? renderRadarInterestsPanel(state, false)
        : renderRadarInterestsCollapsedTab(state)}
    </aside>
  `;
}

function renderRadarInterestsCollapsedTab(state) {
  const count = getRadarInterests(state).length;
  return h`
    <button type="button" class="radar-interests-collapsed-tab" onclick="XinBaoDemo.toggleRadarInterests()" title="展开可能感兴趣" aria-label="展开可能感兴趣">
      ${icon("chevronLeft", "icon--sm")}
      <span class="radar-interests-collapsed-label">推荐</span>
      <em class="radar-interests-collapsed-count">${count}</em>
    </button>
  `;
}

function renderRadarInterestsPanel(state, compact) {
  const interests = getRadarInterests(state);
  const loading = !!state.featureData?.radarInterestsLoading;
  const err = state.featureData?.radarInterestsError;
  return h`
    <section class="radar-interests-panel ${compact ? "is-compact" : ""}">
      <header class="radar-interests-head">
        <div class="radar-interests-head-main">
          <strong>可能感兴趣</strong>
          <span>基于你的偏好与小星记忆</span>
        </div>
        <div class="radar-interests-head-actions">
          <span class="radar-interests-count">${interests.length}</span>
          <button type="button" class="radar-interests-toggle" onclick="XinBaoDemo.toggleRadarInterests()" title="收起" aria-label="收起可能感兴趣">
            ${icon("chevronRight", "icon--sm")}
          </button>
        </div>
      </header>
      ${loading && !interests.length ? `<p class="find-hint px-3">小星正在整理推荐…</p>` : ""}
      ${err ? `<p class="find-hint px-3">${escapeHtml(err)}</p>` : ""}
      <div class="radar-interests-list">
        ${interests.map(it => renderRadarInterestItem(it)).join("")}
      </div>
    </section>
  `;
}

function renderRadarInterestItem(it) {
  if (it.type === "company") {
    return h`
      <article class="radar-interest-item">
        <div class="radar-interest-top">
          <span class="radar-interest-kind">标的</span>
          ${it.match ? `<span class="radar-interest-match">${escapeHtml(it.match)}</span>` : ""}
        </div>
        <button type="button" class="radar-interest-title" onclick="${jsCall("XinBaoDemo.doExamineCompany", it.name)}">${escapeHtml(it.name)}</button>
        <div class="radar-interest-meta">
          ${it.sector ? `<span>${escapeHtml(it.sector)}</span>` : ""}
          ${it.revenue ? `<span>营收 ${escapeHtml(it.revenue)}</span>` : ""}
          ${it.score != null ? `<span class="radar-interest-score">${escapeHtml(String(it.score))} 分</span>` : ""}
        </div>
        ${(it.tags || []).length ? h`
          <div class="radar-interest-tags">
            ${it.tags.map(t => `<span class="mini-tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        ` : ""}
        <p class="radar-interest-reason">${escapeHtml(it.reason)}</p>
      </article>
    `;
  }
  const label = it.shortTitle || it.title || it.id;
  return h`
    <article class="radar-interest-item is-news">
      <div class="radar-interest-top">
        <span class="radar-interest-kind news">资讯</span>
        ${it.match ? `<span class="radar-interest-match">${escapeHtml(it.match)}</span>` : ""}
        ${it.time ? `<span class="radar-interest-time">${escapeHtml(it.time)}</span>` : ""}
      </div>
      <button type="button" class="radar-interest-title" onclick="${jsCall("XinBaoDemo.openNews", it.id)}">${escapeHtml(label)}</button>
      ${it.company ? `<p class="radar-interest-company">${escapeHtml(it.company)}</p>` : ""}
      <div class="radar-interest-meta">
        ${it.sector ? `<span>${escapeHtml(it.sector)}</span>` : ""}
      </div>
      ${(it.tags || []).length ? h`
        <div class="radar-interest-tags">
          ${it.tags.map(t => `<span class="mini-tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      ` : ""}
      <p class="radar-interest-reason">${escapeHtml(it.reason)}</p>
    </article>
  `;
}

function renderPreviewPaneEmbedded(state) {
  const kind = state.ui.previewKind;
  if (!kind || kind === "file") return "";
  const inner = {
      report: () => renderReportPanel(state.ui.previewData || {}, state),
      industry: renderIndustryPanel,
    "risk-qna": renderRiskQnaPanel, "material-gap": renderGapPanel,
    "journalist-report": renderJournalistReportPanel, "expert-outline": renderOutlinePanel,
    "expert-notes": renderNotesPanel, "interview-outline": renderInterviewPanel,
    "batch-eval": renderBatchEvalPanel,
    "company-list": renderCompanyListPanel,
    news: renderNewsPanel,
    document: renderDocumentPanel,
    "sector-weekly": renderSectorWeeklyPanel
  }[kind];
  if (!inner) return "";
  const body = kind === "report"
    ? renderReportPanel(state.ui.previewData || {}, state)
    : kind === "company-list"
      ? renderCompanyListPanel(state)
      : inner(state.ui.previewData || {});
  return h`
    <div class="radar-preview-embed preview-pane wide">
      ${renderPreviewHead(kind, state)}
      <div class="preview-body panel-body">${body}</div>
    </div>
  `;
}

function renderPolicyCard(state, p) {
  return h`
    <article class="radar-card policy-card clickable-card" onclick="${jsCall("XinBaoDemo.openNews", p.id)}">
      ${renderRadarCardToolbar(p.id, "政策", p.source, p.time, true)}
      <h3>${escapeHtml(p.title)}</h3>
      <p class="radar-summary">${escapeHtml(p.summary)}</p>
      <div class="radar-card-interpret">${renderRadarInterpretation(state, p.id, p.interpretation)}</div>
    </article>
  `;
}

function renderRadarCard(state, n) {
  return h`
    <article class="radar-card clickable-card" onclick="${jsCall("XinBaoDemo.openNews", n.id)}">
      ${renderRadarCardToolbar(n.id, n.sector, n.source, n.time, false)}
      <h3>${escapeHtml(n.title)}</h3>
      <p class="radar-summary">${escapeHtml(n.summary)}</p>
      ${(n.relatedCompanies || []).length ? h`
        <div class="related-companies related-companies-inline">
          ${n.relatedCompanies.map(c => h`
            <button type="button" class="company-chip company-chip-subtle" onclick="event.stopPropagation();${jsCall("XinBaoDemo.doExamineCompany", c.name)}">
              ${escapeHtml(c.name)}<em>${escapeHtml(c.role)}</em>
            </button>
          `).join("")}
        </div>
      ` : ""}
      <div class="radar-card-interpret">${renderRadarInterpretation(state, n.id, n.interpretation)}</div>
    </article>
  `;
}

/* ============================ 重磁视图：找项目 ============================ */

function renderFindView(state) {
  const r = state.featureData?.searchResult;
  return h`
    <div class="feature-scroll">
      <div class="find-search">
        <input type="text" id="find-input" class="find-input"
          placeholder="例如：天津市 医疗器械，营收5-10亿，有FDA认证"
          value="${escapeHtml(state.featureData?.query || "")}"
          onkeydown="if(event.key==='Enter')XinBaoDemo.runFind(this.value)" />
        <button class="btn-send" onclick="XinBaoDemo.runFind(document.getElementById('find-input').value)">搜索</button>
      </div>
      <p class="find-hint">自然语言搜索：区域 + 行业 + 财务条件，结果按专家评分排序，可下载名单</p>
      ${r ? renderCompanyList(r) : h`
        <div class="find-empty">
          <p>试试搜索：</p>
          <button class="suggest-chip" onclick="${jsCall("XinBaoDemo.runFind", "天津市医疗器械营收5-10亿")}">天津市医疗器械，营收5-10亿</button>
          <button class="suggest-chip" onclick="${jsCall("XinBaoDemo.runFind", "苏州航空MRO")}">苏州航空MRO企业</button>
        </div>
      `}
    </div>
  `;
}

function renderCompanyList(r) {
  const showSimilarity = r.isSimilar;
  return h`
    <div class="company-list-head">
      <span>找到 <strong>${r.total}</strong> 家企业（${escapeHtml(r.region)} · ${escapeHtml(r.industry)}）${r.baseCompany ? ` · 基准：${escapeHtml(r.baseCompany)}` : ""}</span>
      <div>
        <button class="btn-mini" onclick="XinBaoDemo.batchEval()"><span class="btn-with-icon">${icon("chart", "icon--sm")}<span>批量对比打分</span></span></button>
        <button class="btn-mini" onclick="XinBaoDemo.downloadList()"><span class="btn-with-icon">${icon("download", "icon--sm")}<span>下载名单</span></span></button>
        <button class="btn-mini" onclick="XinBaoDemo.saveListToMaterials()">保存到资料库</button>
      </div>
    </div>
    <table class="data-table">
      <thead><tr><th>企业名称</th><th>营收</th><th>年限</th>${showSimilarity ? "<th>相似度</th>" : "<th>专家评分</th>"}<th>标签</th><th>操作</th></tr></thead>
      <tbody>
        ${r.companies.map(c => h`
          <tr>
            <td class="td-name">${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.revenue)}</td>
            <td>${c.years}年</td>
            <td>${showSimilarity && c.similarity ? `<span class="similarity-badge">${escapeHtml(c.similarity)}</span>` : `<span class="score-badge">⭐ ${c.score}</span>`}</td>
            <td>${(c.tags || []).map(t => `<span class="mini-tag">${escapeHtml(t)}</span>`).join("")}</td>
            <td><button class="btn-mini primary" onclick="${jsCall("XinBaoDemo.quickScreenFromList", c.name)}">快速筛</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* ============================ 重磁视图：一线调研 ============================ */

function renderJournalistView(state) {
  const r = JOURNALIST.completedReport;
  const linked = resolveLinkedProject(r.projectId);
  const jc = JOURNALIST_CASE;
  const requests = state.reporterRequests || [];
  return h`
    <div class="feature-scroll">
      <div class="journalist-hero">
        <h3>一线调研帮你尽调企业</h3>
        <p class="block-desc">调研团队可实地走访、采访产业链上下游、挖「暗礁」，出调研报告。行业快问可走专家智库预约对接。</p>
      </div>

      <div class="section-card journalist-case">
        <div class="section-card-head"><h3>调研案例</h3></div>
        <strong>${escapeHtml(jc.title)}</strong>
        <p class="mini-meta">${escapeHtml(jc.highlight)}</p>
        <p>${escapeHtml(jc.summary)}</p>
        <a class="jr-link" href="${escapeHtml(jc.url)}" target="_blank" rel="noopener">阅读原文</a>
      </div>

      <div class="section-card">
        <div class="section-card-head">
          <h3>发起定制调研</h3>
          <button class="btn-mini primary" onclick="XinBaoDemo.openReporterRequest()">+ 新建调研需求</button>
        </div>
        <p class="mini-meta">填写想核实的问题，留下联系方式，我们会与你联系</p>
        ${requests.length ? h`
          <h4 class="section-h">我的调研申请</h4>
          ${requests.map(req => h`
            <div class="jr-item ${req.status === "已完成" ? "jr-done" : ""}">
              <strong>${escapeHtml(req.company)}</strong>
              <span class="mini-meta">${escapeHtml(req.status)} · ${escapeHtml(req.submittedAt || "")}</span>
              <p>${escapeHtml(req.questions?.slice(0, 80) || "")}${(req.questions?.length || 0) > 80 ? "…" : ""}</p>
              ${req.status === "已完成" ? `<button class="btn-mini" onclick="XinBaoDemo.openJournalistReport()">查看报告</button>` : ""}
            </div>
          `).join("")}
        ` : ""}
      </div>

      <h4 class="section-h">我的调研报告</h4>
      <div class="jr-item jr-done" onclick="${jsCall("XinBaoDemo.openJournalistReport")}">
        <strong>${escapeHtml(r.title)}</strong>
        <span class="mini-meta">${escapeHtml(r.reporter)} · ${escapeHtml(r.date)} · 已完成${linked ? ` · 关联项目：${linked.name}` : ""}</span>
        <p>${escapeHtml(r.judgment)}</p>
        <span class="jr-link">查看完整报告 →</span>
      </div>
    </div>
  `;
}

/* ============================ 重磁视图：专家智库（v4） ============================ */

function renderExpertsView(state) {
  const raw = state.featureData?.expertTab || "meetings";
  const tab = raw === "ai" ? "meetings" : raw;
  const tabBtn = (key, label) => `<button class="mtab ${tab === key ? "active" : ""}" onclick="${jsCall("XinBaoDemo.expertTab", key)}">${label}</button>`;

  let body;
  if (tab === "notes") body = renderMeetingNotesTab(state);
  else if (tab === "booking") body = renderExpertBookingTab(state);
  else body = renderMeetingGrid(state);

  return h`
    <div class="feature-scroll meetings">
      <div class="mtabs">
        ${tabBtn("meetings", "专家会议")}
        ${tabBtn("notes", "会议纪要")}
        ${tabBtn("booking", "专家对接")}
      </div>
      ${body}
    </div>
  `;
}

function renderMeetingGrid(state) {
  const sector = state.featureData?.meetingSector || "全部";
  const enrolled = state.meetingEnrollments || [];
  const list = sector === "全部"
    ? MEETING_LIST
    : MEETING_LIST.filter(m => m.sector === sector);
  const statusLabel = { live: "LIVE", soon: "预告", done: "已结束" };

  return h`
    <p class="block-desc">专家路演与电话会：在线报名参与，已结束场次可看回放、阅读纪要。</p>
    <div class="sector-filter">
      ${MEETING_SECTORS.slice(0, 8).map(s => h`
        <button type="button" class="sector-chip ${sector === s ? "on" : ""}"
          onclick="${jsCall("XinBaoDemo.meetingSector", s)}">${escapeHtml(s)}</button>
      `).join("")}
    </div>
    <div class="meeting-grid">
      ${list.map(m => h`
        <article class="meeting-card">
          <div class="meeting-cover cover-${escapeHtml(m.cover || "ai")}">
            <span class="m-badge ${escapeHtml(m.status)}">${statusLabel[m.status] || m.status}</span>
            <span class="m-count">${m.count} ${escapeHtml(m.countLabel)}</span>
          </div>
          <div class="meeting-body">
            <h3>${escapeHtml(m.title)}</h3>
            <p class="m-speaker">${escapeHtml(m.speaker)} · ${escapeHtml(m.org)}</p>
            <div class="meeting-foot">
              <span class="m-tag">${escapeHtml(m.tag)}</span>
              <span class="m-time">${escapeHtml(m.time)}</span>
            </div>
            <div class="meeting-actions">
              ${m.status === "done" ? h`
                <button class="btn-mini" onclick="${jsCall("XinBaoDemo.openMeetingNotesLib", "n1")}">看纪要</button>
              ` : enrolled.includes(m.id) || m.enrolled ? h`
                <span class="m-enrolled">已报名</span>
              ` : h`
                <button class="btn-mini primary" onclick="${jsCall("XinBaoDemo.bookMeeting", m.id)}">报名</button>
              `}
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderMeetingNotesTab(state) {
  const sector = state.featureData?.notesSector || "全部";
  const list = sector === "全部"
    ? MEETING_NOTES_LIB
    : MEETING_NOTES_LIB.filter(n => n.tags?.includes(sector));
  return h`
    <p class="block-desc">按行业浏览专家会议纪要，查阅往期观点与要点全文。</p>
    <div class="sector-filter">
      ${["全部", "半导体", "AI应用", "新能源", "算力"].map(s => h`
        <button type="button" class="sector-chip ${sector === s ? "on" : ""}"
          onclick="${jsCall("XinBaoDemo.setNotesSector", s)}">${escapeHtml(s)}</button>
      `).join("")}
    </div>
    ${list.map(n => h`
      <div class="jr-item jr-done" onclick="${jsCall("XinBaoDemo.openMaterial", n.id, "note")}">
        <strong>${escapeHtml(n.title)}</strong>
        <span class="mini-meta">${escapeHtml(n.speaker)} · ${escapeHtml(n.date)} · ${n.points} 条要点</span>
        <div>${n.tags.map(t => `<span class="mini-tag">${escapeHtml(t)}</span>`).join("")}</div>
        <span class="jr-link">查看纪要 →</span>
      </div>
    `).join("")}
  `;
}

function renderExpertBookingTab(state) {
  return h`
    <p class="block-desc">可预约平台专家或一线调研专员。提交诉求后 1–3 个工作日内专人联系对接，具体时间以沟通为准。</p>

    <h4 class="section-h">一线调研</h4>
    <div class="expert-grid-flat">
      ${REPORTER_EXPERTS.map(re => h`
        <article class="expert-tile reporter-tile">
          <span class="reporter-badge">${escapeHtml(re.role || "一线调研专员")}</span>
          <span class="expert-tile-icon">${icon("newspaper", "icon--lg")}</span>
          <strong>${escapeHtml(re.name)}</strong>
          <span class="expert-tile-field">${escapeHtml(re.field)}</span>
          <p class="expert-tile-desc">${escapeHtml(re.exp)}</p>
          <span class="expert-tile-cap">可做：${escapeHtml(re.canDo)}</span>
          <button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.openReporterConsult", re.id)}">预约</button>
        </article>
      `).join("")}
    </div>

    <h4 class="section-h">平台专家</h4>
    <div class="expert-grid-flat">
      ${MEETING_EXPERTS.map(e => h`
        <article class="expert-tile">
          <strong>${escapeHtml(e.name)}</strong>
          <span class="expert-tile-field">${escapeHtml(e.field)}</span>
          <span class="expert-tile-cap">擅长：${escapeHtml(e.capabilities.split("、")[0] || e.field)}</span>
          <button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.openExpertBook", e.id)}">预约</button>
        </article>
      `).join("")}
    </div>
    <div class="section-card match-card">
      <h4 class="section-h">没有合适的？</h4>
      <p class="block-desc">描述你想了解的问题和期望的专家背景，提交后为你匹配合适人选。</p>
      <button type="button" class="btn-mini primary" onclick="XinBaoDemo.openExpertMatch()">提交需求</button>
    </div>
  `;
}

function renderExpertGrid(state) {
  const experts = (state.platformExperts?.length ? state.platformExperts : EXPERT_LIST)
    .filter(e => e.id !== DEFAULT_EXPERT_ID && e.frontend_id !== DEFAULT_EXPERT_ID);
  return h`
    <p class="block-desc">点「召唤」在对话里直接使用该专家。</p>
    <div class="expert-grid-flat">
      ${experts.map(e => h`
        <div class="expert-tile-wrap">
          <button type="button" class="expert-tile" onclick="${jsCall("XinBaoDemo.openExpertDetail", e.id)}">
            <strong>${escapeHtml(e.name)}</strong>
            <span class="expert-tile-cap">擅长：${escapeHtml((e.capabilities || e.field || "").split("、")[0])}</span>
          </button>
          <button type="button" class="btn-mini primary expert-summon-btn" onclick="${jsCall("XinBaoDemo.summonExpert", e.id)}">召唤</button>
        </div>
      `).join("")}
    </div>
  `;
}

function renderMaterialsPage(state) {
  return renderMaterialsView(escapeHtml, icon, jsCall, state);
}

function renderReportTemplatesPage(state) {
  return renderReportTemplatesView(escapeHtml, icon, jsCall, state);
}

/* ============================ 小星（v4 合并偏好+分身） ============================ */

function renderStarView(state) {
  const star = STAR_DATA;
  const memories = state.starMemories || star.memories;
  return h`
    <div class="feature-scroll">
      <div class="profile-status"><span class="dot ok-dot"></span>小星 · 尽调助手 · 活跃中</div>
      <p class="block-desc">这里管偏好和记忆；日常尽调在对话里直接找小星即可。</p>

      <h4 class="section-h">对你的了解</h4>
      <ul class="monitor-dims">
        ${memories.map(m => `<li>${escapeHtml(m)}</li>`).join("")}
      </ul>

      <h4 class="section-h">教小星</h4>
      <div class="teach-star-form">
        <input id="star-memory-input" class="find-input" placeholder="例如：我更关注 toB 医疗器械，营收 5-15 亿" />
        <button class="btn-mini primary" onclick="XinBaoDemo.teachStar(document.getElementById('star-memory-input').value)">记住这条</button>
      </div>
    </div>
  `;
}

/* ============================ 重磁视图：全部项目 ============================ */

function renderProjectCardMenu(state, projectId) {
  const menuKey = `project-card-${projectId}`;
  const open = state.ui.rowMenu?.key === menuKey;
  return h`
    <div class="project-card-toolbar" onclick="event.stopPropagation()">
      <button type="button" class="project-card-toolbar-btn" title="新建会话" aria-label="新建会话"
        onclick="event.stopPropagation();${jsCall("XinBaoDemo.newProjectChat", projectId)}">${icon("chat", "icon--sm")}</button>
      <div class="row-menu-wrap">
        <button type="button" class="project-card-toolbar-btn" aria-label="更多操作"
          onclick="event.stopPropagation();${jsCall("XinBaoDemo.toggleRowMenu", menuKey, "projectCard", projectId)}">⋯</button>
        ${open ? h`
          <div class="row-menu-dropdown project-card-dropdown">
            <button type="button" class="row-menu-item" onclick="event.stopPropagation();${jsCall("XinBaoDemo.openProjectCollab", projectId)}">邀请成员</button>
            <button type="button" class="row-menu-item" onclick="event.stopPropagation();${jsCall("XinBaoDemo.renameProject", projectId)}">重命名</button>
            <button type="button" class="row-menu-item danger" onclick="event.stopPropagation();${jsCall("XinBaoDemo.deleteProject", projectId)}">删除</button>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function renderProjectsView(state) {
  const allProjects = visibleProjects(state.projectList || [], state.currentUser);
  const query = (state.featureData?.projectsSearch || "").trim().toLowerCase();
  const filtered = query
    ? allProjects.filter(p =>
        (p.name || "").toLowerCase().includes(query) ||
        (p.company || "").toLowerCase().includes(query))
    : allProjects;

  return h`
    <div class="feature-scroll projects-page">
      <div class="projects-page-toolbar">
        <input type="search" class="projects-search" placeholder="搜索项目名称或企业…"
          value="${escapeHtml(state.featureData?.projectsSearch || "")}"
          oninput="XinBaoDemo.setProjectsSearch(this.value)" />
        <p class="projects-page-meta">共 ${filtered.length} 个项目</p>
      </div>
      ${filtered.length
        ? h`
            <ul class="projects-grid">
              ${filtered.map(p => {
                const displayName = (p.company || p.name || "")
                  .replace(/科技有限公司$/, "")
                  .replace(/有限公司$/, "");
                const chatCount = p.chats?.length || 0;
                return h`
                  <li>
                    <article class="project-card">
                      ${renderProjectCardMenu(state, p.id)}
                      <button type="button" class="project-card-body" onclick="${jsCall("XinBaoDemo.openProject", p.id)}">
                        <span class="project-card-icon">${icon("projectSpace", "icon--md")}</span>
                        <strong>${escapeHtml(displayName || p.name)}</strong>
                        <span class="project-card-company">${escapeHtml(p.company || p.name || "")}</span>
                        ${p.ddStage ? `<span class="proj-card-stage">${escapeHtml(p.ddStage)} · ${(p.stageIndex ?? 0) + 1}/${DD_STAGES.length}</span>` : ""}
                        <em>更新 ${escapeHtml(p.updated || "")}${chatCount ? ` · ${chatCount} 个会话` : ""}</em>
                      </button>
                    </article>
                  </li>
                `;
              }).join("")}
            </ul>
          `
        : `<p class="projects-page-empty">暂无匹配项目。可点击右上角「新项目」创建。</p>`}
    </div>
  `;
}

/* ============================ 重磁视图：项目监控 ============================ */

function renderMonitorView(state) {
  const filterRaw = state.featureData?.monitorFilter || "alert";
  const filter = filterRaw === "projects" ? "all" : filterRaw;
  const userMonitors = state.userMonitors || [];
  const userRuleEvents = userMonitors.filter(m => m.triggered);
  const allMonitors = [...POST_MONITOR, ...userRuleEvents];
  const triggered = allMonitors.filter(m => m.triggered);
  const feed = allMonitors.filter(m => filter !== "alert" || m.triggered);
  const ruleCount = userMonitors.length;
  const projects = visibleProjects(state.projectList || [], state.currentUser);
  const watchProfiles = PROJECT_WATCH_PROFILE.map(p => {
    const linked = projects.find(pr => pr.id === p.projectId);
    return { ...p, projectName: linked?.name || p.projectName };
  });
  const alertCount = triggered.length;
  const projectCount = watchProfiles.filter(p => p.watching).length;
  const highlightId = state.featureData?.monitorHighlightId;

  return h`
    <div class="feature-scroll monitor-ai">
      <section class="monitor-brief">
        <div class="monitor-brief-head">
          <span class="monitor-brief-icon">${icon("chart", "icon--md")}</span>
          <div class="monitor-brief-text">
            <strong>本周持续盯盘 ${projectCount} 个项目、${allMonitors.length} 条公开变动</strong>
            <p>${alertCount
              ? `有 ${alertCount} 条命中你关心的变化，建议先看「${escapeHtml(triggered[0]?.company || "")}」。`
              : "暂无需要你立刻处理的变化，项目库里的投前假设仍在自动对照中。"}</p>
          </div>
        </div>
      </section>

      <div class="monitor-tabs">
        <button type="button" class="monitor-tab ${filter === "alert" ? "on" : ""}" onclick="${jsCall("XinBaoDemo.setMonitorFilter", "alert")}">需要你关注${alertCount ? ` (${alertCount})` : ""}</button>
        <button type="button" class="monitor-tab ${filter === "all" ? "on" : ""}" onclick="${jsCall("XinBaoDemo.setMonitorFilter", "all")}">经营与变动</button>
        <button type="button" class="monitor-tab ${filter === "rules" ? "on" : ""}" onclick="${jsCall("XinBaoDemo.setMonitorFilter", "rules")}">预警条件${ruleCount ? ` (${ruleCount})` : ""}</button>
      </div>

      ${filter === "rules"
        ? renderMonitorRules(state, userMonitors)
        : renderMonitorCompanySplit(state, {
            feed,
            allMonitors,
            watchProfiles,
            projects,
            highlightId,
            alertOnly: filter === "alert",
            emptyHint: filter === "alert"
              ? "暂无命中你关心条件的变化。"
              : "暂无动态，可从左侧开启监控。"
          })}
    </div>
  `;
}

function renderMonitorRules(state, userMonitors) {
  return h`
    <div class="monitor-rules">
      <div class="monitor-rules-head">
        <h4 class="section-h monitor-rules-title">你设的条件</h4>
        <button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.openAddMonitor")}">新建条件</button>
      </div>

      ${userMonitors.length
        ? h`
            <ul class="monitor-rules-list">
              ${userMonitors.map(r => renderMonitorRuleItem(r)).join("")}
            </ul>
          `
        : h`
            <div class="empty-guide compact">
              <p>还没有自定义预警条件。</p>
              <p class="mini-meta">在上方输入框用一句话描述，或点「新建条件」关联项目后设置。</p>
            </div>
          `}
    </div>
  `;
}

function renderMonitorRuleItem(r) {
  const cond = r.userDefinedRisk?.condition || r.change || "未填写条件";
  const dim = r.userDefinedRisk?.dimension;
  const status = r.triggered ? "已命中" : (r.monitoring !== false ? "监听中" : "已暂停");
  return h`
    <li class="monitor-rule-item ${r.triggered ? "has-alert" : ""}">
      <div class="monitor-rule-main">
        <div class="monitor-rule-top">
          <strong>${escapeHtml(r.company)}</strong>
          <span class="monitor-rule-status">${escapeHtml(status)}</span>
        </div>
        <p class="monitor-rule-cond">${escapeHtml(cond)}</p>
        ${dim && dim !== "自定义" ? `<span class="mini-tag">${escapeHtml(dim)}</span>` : ""}
        ${r.projectName ? `<span class="mini-meta">关联 ${escapeHtml(r.projectName)}</span>` : ""}
        <span class="mini-meta">创建于 ${escapeHtml(r.time || "刚刚")}</span>
      </div>
      <div class="monitor-rule-actions">
        <button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.editMonitorRule", r.id)}">编辑</button>
        <button type="button" class="btn-mini danger-text" onclick="${jsCall("XinBaoDemo.deleteMonitorRule", r.id)}">删除</button>
      </div>
    </li>
  `;
}

function buildMonitorCompanyRows(projects, watchProfiles, allMonitors, alertOnly) {
  const sourceFeed = alertOnly ? allMonitors.filter(m => m.triggered) : allMonitors;
  const rows = [];
  const seen = new Set();

  projects.forEach(proj => {
    const company = proj.company || proj.name;
    if (seen.has(company)) return;
    seen.add(company);
    const companyFeed = sourceFeed.filter(m => m.company === company);
    rows.push({
      key: company,
      company,
      projectId: proj.id,
      projectName: proj.name,
      watching: !!watchProfiles.find(w => w.projectId === proj.id && w.watching),
      alertCount: companyFeed.filter(m => m.triggered).length,
      feedCount: companyFeed.length
    });
  });

  sourceFeed.forEach(m => {
    if (!m.company || seen.has(m.company)) return;
    seen.add(m.company);
    const companyFeed = sourceFeed.filter(item => item.company === m.company);
    rows.push({
      key: m.company,
      company: m.company,
      projectId: m.projectId || null,
      projectName: m.projectName || "",
      watching: m.projectId
        ? !!watchProfiles.find(w => w.projectId === m.projectId && w.watching)
        : false,
      alertCount: companyFeed.filter(item => item.triggered).length,
      feedCount: companyFeed.length
    });
  });

  return rows;
}

function renderMonitorCompanySplit(state, { feed, allMonitors, watchProfiles, projects, highlightId, alertOnly, emptyHint }) {
  const companyKey = state.featureData?.monitorCompanyKey || "all";
  const rows = buildMonitorCompanyRows(projects, watchProfiles, allMonitors, alertOnly);
  const filteredFeed = companyKey === "all"
    ? feed
    : feed.filter(m => m.company === companyKey);
  const totalAlert = feed.filter(m => m.triggered).length;
  const hideCompanyInFeed = companyKey !== "all";

  return h`
    <div class="monitor-split">
      <aside class="monitor-company-rail" aria-label="企业筛选">
        <button
          type="button"
          class="monitor-company-rail-item ${companyKey === "all" ? "is-active" : ""}"
          onclick="${jsCall("XinBaoDemo.setMonitorCompany", "all")}"
        >
          <div class="monitor-company-rail-main">
            <strong>全部</strong>
          </div>
          ${totalAlert ? `<span class="monitor-company-badge is-alert">${totalAlert}</span>` : ""}
        </button>
        ${rows.map(row => renderMonitorCompanyRailItem(row, companyKey)).join("")}
      </aside>
      <div class="monitor-split-main">
        ${companyKey !== "all" ? h`
          <header class="monitor-split-head">
            <div>
              <h3 class="monitor-split-title">${escapeHtml(companyKey)}</h3>
              ${rows.find(r => r.key === companyKey)?.projectName
                ? `<p class="monitor-split-sub">${escapeHtml(rows.find(r => r.key === companyKey).projectName)}</p>`
                : ""}
            </div>
            ${rows.find(r => r.key === companyKey)?.watching
              ? `<span class="monitor-split-status">监控中</span>`
              : `<span class="monitor-split-status is-off">未监控</span>`}
          </header>
        ` : ""}
        <div class="monitor-feed">
          ${filteredFeed.length
            ? filteredFeed.map(m => renderMonitorFeedItem(state, m, highlightId, hideCompanyInFeed)).join("")
            : `<p class="find-hint">${emptyHint}</p>`}
        </div>
      </div>
    </div>
  `;
}

function renderMonitorCompanyRailItem(row, selectedKey) {
  const active = selectedKey === row.key;
  return h`
    <div class="monitor-company-rail-item ${active ? "is-active" : ""} ${row.watching ? "is-watching" : ""}">
      <button
        type="button"
        class="monitor-company-rail-select"
        onclick="${jsCall("XinBaoDemo.setMonitorCompany", row.key)}"
      >
        <div class="monitor-company-rail-main">
          <strong>${escapeHtml(row.company)}</strong>
          ${row.projectName ? `<span class="monitor-company-rail-meta">${escapeHtml(row.projectName)}</span>` : ""}
        </div>
        ${row.alertCount ? `<span class="monitor-company-badge is-alert">${row.alertCount}</span>` : ""}
      </button>
      ${row.projectId ? h`
        <button
          type="button"
          class="toggle-switch ${row.watching ? "is-on" : ""}"
          role="switch"
          aria-checked="${row.watching}"
          aria-label="${row.watching ? "关闭监控" : "开启监控"}：${escapeHtml(row.company)}"
          onclick="event.stopPropagation();${jsCall("XinBaoDemo.toggleProjectWatch", row.projectId)}"
        >
          <span class="toggle-switch-knob"></span>
        </button>
      ` : ""}
    </div>
  `;
}

function renderMonitorFeedItem(state, m, highlightId, hideCompany = false) {
  const level = m.triggered ? (m.level || "high") : (m.level === "positive" ? "positive" : "watching");
  const interpreted = state.featureData?.monitorInterpreted?.[m.id];
  const showInterpretation = interpreted && interpreted !== "loading";
  return h`
    <article class="monitor-feed-item ${level} ${highlightId === m.id ? "is-highlighted" : ""}" id="monitor-${escapeHtml(m.id)}">
      <div class="monitor-feed-marker">
        <span class="dot ${m.triggered ? (m.level || "high") : (m.level === "positive" ? "ok-dot" : "ok-dot")}"></span>
        <span class="monitor-feed-line"></span>
      </div>
      <div class="monitor-feed-body">
        <div class="monitor-feed-head">
          ${hideCompany
            ? `<span class="monitor-feed-dim">${escapeHtml(m.userDefinedRisk?.dimension || (m.triggered ? "待关注" : "动态"))}</span>`
            : `<strong>${escapeHtml(m.company)}</strong>`}
          <span class="mini-meta">${escapeHtml(m.time || "刚刚")}</span>
        </div>
        ${m.projectId ? h`
          <button type="button" class="monitor-project-link" onclick="${jsCall("XinBaoDemo.goToProjectFromMonitor", m.projectId)}">
            ${icon("projectSpace", "icon--sm")}<span>${escapeHtml(m.projectName || "关联项目")}</span>
          </button>
        ` : ""}
        ${m.change ? `<p class="monitor-feed-fact">${escapeHtml(m.change)}</p>` : ""}
        ${showInterpretation ? h`
          <div class="expert-note is-expanded monitor-ai-note">
            <span class="expert-note-tag">小星解读</span>
            <p>${escapeHtml(interpreted)}</p>
            <button type="button" class="interpret-discuss-link" onclick="${jsCall("XinBaoDemo.discussInterpretation", "monitor", m.id)}">带这条继续深聊</button>
          </div>
        ` : interpreted === "loading" ? h`
          <div class="expert-note is-loading monitor-ai-note">
            <span class="expert-note-tag">小星解读中</span>
            <p>正在对照投前假设分析这条变化…</p>
          </div>
        ` : m.hypothesis ? `<p class="monitor-hyp">${escapeHtml(m.hypothesis)}</p>` : ""}
        ${m.linkedAssumption ? `<span class="mini-tag">对照 ${escapeHtml(m.linkedAssumption)}</span>` : ""}
        <div class="monitor-feed-actions">
          ${m.aiSummary ? `<button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.interpretMonitor", m.id)}">深入分析</button>` : ""}
          ${m.projectId ? `<button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.goToProjectFromMonitor", m.projectId)}">查看项目档案</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

/* ============================ Chat：侧栏文件区 ============================ */
/**
 * 文件树：项目内会话共享项目材料；独立会话仅在有文件时展示
 */

function sessionHasFiles(sess, state) {
  if (!sess?.saved) return false;
  if (sess.projectId) return true;
  const { materials, aiReports } = getSessionFiles(sess, state);
  return !!(materials.length || aiReports.length);
}

function pendingAttachCount(sess) {
  if (!sess || sess.saved) return 0;
  return (sess.pendingAttachments || []).length;
}

function layoutClasses(state) {
  const c = [];
  if (state.ui.filesOpen && sessionHasFiles(state.session, state)) c.push("has-files");
  if (state.ui.previewOpen) c.push("has-preview");
  return c.join(" ");
}

function isFileGroupExpanded(state, cat) {
  return (state.ui.fileGroupExpanded || {})[cat] !== false;
}

function fileTreeIcon(name) {
  if (/\.pdf$/i.test(name)) return "file";
  if (/\.xlsx?$/i.test(name)) return "chart";
  if (/\.pptx?$/i.test(name)) return "layers";
  if (/\.docx?$/i.test(name)) return "edit";
  return "file";
}

function fileTreeDragHandleAttrs(fileId) {
  return `draggable="true" ondragstart="event.stopPropagation();event.dataTransfer.setData('text/plain','${fileId}');event.dataTransfer.setData('file-id','${fileId}');event.dataTransfer.effectAllowed='copyMove'" ondragend="XinBaoDemo.clearFileDragOverCat()"`;
}

function fileTreeFolderDropAttrs(cat) {
  return `class="files-tree-folder" ondragover="event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';XinBaoDemo.setFileDragOverCat('${cat}')" ondragleave="if(!event.currentTarget.contains(event.relatedTarget))XinBaoDemo.clearFileDragOverCat()" ondrop="event.preventDefault();event.stopPropagation();XinBaoDemo.clearFileDragOverCat();var id=event.dataTransfer.getData('file-id')||event.dataTransfer.getData('text/plain');if(id)XinBaoDemo.onFileTreeFolderDrop(id,'${cat}')"`;
}

function renderFileTreeMenu(state, fileId, currentCat, fileMeta, opts = {}) {
  const menuKey = `file-${fileId}`;
  const open = state.ui.rowMenu?.key === menuKey;
  const isDraft = fileMeta?.shareState !== "shared";
  const canMove = !opts.isAiReport;
  const moveItems = canMove
    ? FILE_CATEGORIES
      .filter(c => c !== currentCat)
      .map(c => `<button type="button" class="row-menu-item" onclick="event.stopPropagation();${jsCall("XinBaoDemo.setFileCategory", fileId, c)}">${escapeHtml(c)}</button>`)
      .join("")
    : "";
  return h`
    <div class="files-tree-menu">
      <button type="button" class="files-tree-insert" onclick="event.stopPropagation();${jsCall("XinBaoDemo.insertFileRef", fileId)}" title="插入引用" aria-label="插入引用到输入框">+</button>
      <button type="button" class="files-tree-more" onclick="event.stopPropagation();${jsCall("XinBaoDemo.toggleRowMenu", menuKey, "file", fileId)}" aria-label="更多操作" title="更多">⋯</button>
      ${open ? h`
        <div class="row-menu-dropdown files-tree-dropdown">
          <button type="button" class="row-menu-item" onclick="event.stopPropagation();${jsCall("XinBaoDemo.insertFileRef", fileId)}">插入引用</button>
          ${isDraft ? `<button type="button" class="row-menu-item primary" onclick="event.stopPropagation();${jsCall("XinBaoDemo.shareFileToProject", fileId)}">共享到项目</button>` : ""}
          ${moveItems ? `<span class="row-menu-label">移至</span>${moveItems}` : ""}
          <button type="button" class="row-menu-item danger" onclick="event.stopPropagation();XinBaoDemo.removeFile('${fileId}')">删除</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderMaterialFileItem(state, file, sel, cat, opts = {}) {
  return h`
    <li class="files-tree-item ${sel === file.id ? "is-selected" : ""} ${file.shareState !== "shared" ? "is-draft" : ""}">
      <span class="files-tree-drag-handle" ${fileTreeDragHandleAttrs(file.id)} title="拖到文件夹移动，或拖到输入框引用">${icon("grip", "icon--sm")}</span>
      <button type="button" class="files-tree-file" draggable="false" onclick="${jsCall("XinBaoDemo.selectFile", file.id)}" title="${escapeHtml(file.name)}">
        <span class="files-tree-file-icon">${icon(fileTreeIcon(file.name), "icon--sm")}</span>
        <span class="files-tree-file-text">
          <span class="files-tree-file-name">${escapeHtml(file.name)}</span>
          ${renderFileAuthorMeta(file, false, opts)}
        </span>
      </button>
      ${renderFileTreeMenu(state, file.id, cat, file)}
    </li>
  `;
}

function renderAiReportFileItem(state, report, sel, opts = {}) {
  return h`
    <li class="files-tree-item ${sel === report.id ? "is-selected" : ""} ${report.shareState !== "shared" ? "is-draft" : ""}">
      <span class="files-tree-drag-handle" ${fileTreeDragHandleAttrs(report.id)} title="拖到输入框引用">${icon("grip", "icon--sm")}</span>
      <button type="button" class="files-tree-file files-tree-ai-file" draggable="false" onclick="${jsCall("XinBaoDemo.openAIReportFile", report.id)}" title="${escapeHtml(report.name)}">
        <span class="files-tree-file-icon files-tree-ai-icon">${icon("zap", "icon--sm")}</span>
        <span class="files-tree-file-text">
          <span class="files-tree-file-name">${escapeHtml(report.name)}</span>
          ${renderFileAuthorMeta(report, true, opts)}
        </span>
      </button>
      ${renderFileTreeMenu(state, report.id, AI_REPORT_CATEGORY, report, { isAiReport: true })}
      <span class="files-tree-ai-meta mini-meta">${escapeHtml(report.generatedAt || "")}</span>
    </li>
  `;
}

/** 文件树收起后，贴左缘、与 files-head 同高的展开浮钮 */
function renderFilesExpandFab() {
  return h`
    <button type="button" class="files-expand-fab" onclick="XinBaoDemo.toggleFiles()" title="展开文件" aria-label="展开文件">
      ${icon("chevronRight", "icon--sm")}
    </button>
  `;
}

function renderFileCategoryGroups(state, materials, predicate, sel, opts = {}) {
  return FILE_CATEGORIES.map(cat => {
    const files = (materials || []).filter(m => normalizeFileCategory(m.category) === cat && predicate(m));
    const expanded = isFileGroupExpanded(state, cat);
    const folderAttrs = fileTreeFolderDropAttrs(cat);
    return h`
      <div class="files-tree-group">
        <button type="button" ${folderAttrs} onclick="${jsCall("XinBaoDemo.toggleFileGroup", cat)}">
          <span class="files-tree-chevron">${icon(expanded ? "chevronDown" : "chevronRight", "icon--sm")}</span>
          <span class="files-tree-folder-icon">${icon("folder", "icon--sm")}</span>
          <span class="files-tree-folder-name">${escapeHtml(cat)}</span>
          <span class="files-tree-folder-count">${files.length}</span>
        </button>
        ${expanded && files.length ? h`
          <ul class="files-tree-list">
            ${files.map(m => renderMaterialFileItem(state, m, sel, cat, opts)).join("")}
          </ul>
        ` : ""}
      </div>
    `;
  }).join("");
}

function renderAiReportGroup(state, reports, sel, opts = {}) {
  if (!reports.length) return "";
  const expanded = isFileGroupExpanded(state, AI_REPORT_CATEGORY);
  return h`
    <div class="files-tree-group files-tree-ai">
      <button type="button" class="files-tree-folder" onclick="${jsCall("XinBaoDemo.toggleFileGroup", AI_REPORT_CATEGORY)}">
        <span class="files-tree-chevron">${icon(expanded ? "chevronDown" : "chevronRight", "icon--sm")}</span>
        <span class="files-tree-folder-icon">${icon("zap", "icon--sm")}</span>
        <span class="files-tree-folder-name">${escapeHtml(AI_REPORT_CATEGORY)}</span>
        <span class="files-tree-folder-count">${reports.length}</span>
      </button>
      ${expanded ? h`
        <ul class="files-tree-list">
          ${reports.map(r => renderAiReportFileItem(state, r, sel, opts)).join("")}
        </ul>
      ` : ""}
    </div>
  `;
}

function renderFilesSection(state, { sectionKey, title, hint, count, variant, body }) {
  const expanded = isFileGroupExpanded(state, sectionKey);
  return h`
    <section class="files-tree-section files-tree-section--${variant}">
      <button type="button" class="files-tree-section-head" onclick="${jsCall("XinBaoDemo.toggleFileGroup", sectionKey)}">
        <span class="files-tree-section-chevron">${icon(expanded ? "chevronDown" : "chevronRight", "icon--sm")}</span>
        <span class="files-tree-section-title">${escapeHtml(title)}</span>
        <span class="files-tree-section-count">${count}</span>
        ${hint ? `<span class="files-tree-section-hint">${escapeHtml(hint)}</span>` : ""}
      </button>
      ${expanded ? `<div class="files-tree-section-body">${body}</div>` : ""}
    </section>
  `;
}

function renderFiles(state) {
  const sess = state.session;
  const sel = state.ui.selectedFileId;
  const userId = state.currentUser?.id || CURRENT_USER.id;
  const { materials, aiReports } = getSessionFiles(sess, state);
  const { shared: sharedAi, myDrafts: draftAi } = partitionProjectFiles(aiReports, userId);
  const sharedMaterials = materials.filter(m => m.shareState === "shared");
  const myDraftMaterials = materials.filter(m => m.shareState !== "shared" && m.author?.id === userId);
  const sharedCount = sharedMaterials.length + sharedAi.length;
  const draftCount = myDraftMaterials.length + draftAi.length;

  return h`
    <aside class="files-pane" aria-label="文件" onclick="XinBaoDemo.closeRowMenu()">
      <div class="files-head">
        <span>文件</span>
        <button class="files-collapse-btn" onclick="XinBaoDemo.toggleFiles()" title="收起文件" aria-label="收起文件">${icon("chevronLeft")}</button>
      </div>
      <div class="files-tree-scroll">
        ${materials.length || aiReports.length ? h`
          <div class="files-tree">
            ${sharedCount ? renderFilesSection(state, {
              sectionKey: FILE_SECTION_SHARED,
              title: "团队共享",
              hint: "全员可见",
              count: sharedCount,
              variant: "shared",
              body: h`
                ${renderFileCategoryGroups(state, materials, m => m.shareState === "shared", sel)}
                ${renderAiReportGroup(state, sharedAi, sel)}
              `
            }) : ""}
            ${draftCount ? renderFilesSection(state, {
              sectionKey: FILE_SECTION_DRAFT,
              title: "我的草稿",
              hint: "未共享 · 仅我可见",
              count: draftCount,
              variant: "draft",
              body: h`
                ${renderFileCategoryGroups(state, materials, m => m.shareState !== "shared" && m.author?.id === userId, sel, { inDraftSection: true })}
                ${renderAiReportGroup(state, draftAi, sel, { inDraftSection: true })}
              `
            }) : ""}
          </div>
        ` : h`
          <div class="files-empty">
            <span class="files-empty-icon">${icon("folder", "icon--lg")}</span>
            <p>暂无文件</p>
            <span class="mini-meta">上传 BP、审计报告或资质文件开始尽调</span>
          </div>
        `}
      </div>
      <button class="btn-file-add" onclick="XinBaoDemo.pickFile()">${icon("plus", "icon--sm")}<span>上传文件</span></button>
    </aside>
  `;
}

/* ============================ Chat：右侧通用面板 ============================ */

function renderPreviewPane(state) {
  if (!state.ui.previewOpen) return "";
  const kind = state.ui.previewKind;

  if (kind && kind !== "file") {
    const inner = {
      report: () => renderReportPanel(state.ui.previewData || {}, state),
      "entry-brief": () => renderEntryBriefPanel(state.ui.previewData || {}, state),
      industry: renderIndustryPanel,
      "risk-qna": renderRiskQnaPanel, "material-gap": renderGapPanel,
      "journalist-report": renderJournalistReportPanel, "expert-outline": renderOutlinePanel,
      "expert-notes": renderNotesPanel, "interview-outline": renderInterviewPanel,
      "batch-eval": renderBatchEvalPanel,
      "company-list": renderCompanyListPanel,
      news: renderNewsPanel,
      document: renderDocumentPanel,
      "sector-weekly": renderSectorWeeklyPanel,
      "source-citation": () => renderSourceCitationPanel(state.ui.previewData || {})
    }[kind];
    if (inner) {
      const body = kind === "report"
        ? renderReportPanel(state.ui.previewData || {}, state)
        : kind === "entry-brief"
          ? renderEntryBriefPanel(state.ui.previewData || {}, state)
        : kind === "company-list"
          ? renderCompanyListPanel(state)
          : kind === "industry"
            ? renderIndustryPanel(state.ui.previewData || {}, state)
            : inner(state.ui.previewData || {});
      return h`
        <aside class="preview-pane wide report-pane resizable-panel" style="${rightPanelWidthStyle(state, REPORT_PANEL_DEFAULT_WIDTH)}" aria-label="内容面板">
          ${renderPanelResizeHandle()}
          ${renderPreviewHead(kind, state)}
          <div class="preview-body panel-body">${body}</div>
        </aside>
      `;
    }
  }

  const sess = state.session;
  const file = sess?.materials.find(m => m.id === state.ui.selectedFileId);
  const preview = getMockFilePreview(file, state.ui.previewSourceKey);
  if (!preview.title) return "";
  return h`
    <aside class="preview-pane resizable-panel" style="${rightPanelWidthStyle(state)}" aria-label="文件预览">
      ${renderPanelResizeHandle()}
      ${renderPreviewHead("file", state, {
        title: preview.title,
        closeTitle: "收起预览",
        subtitle: preview.page ? `<span>第 ${escapeHtml(String(preview.page))} 页</span>` : ""
      })}
      <div class="preview-body">
        ${file?.author?.name ? `<p class="mini-meta file-uploaded-by">上传：${escapeHtml(file.author.name)}${file.shareState !== "shared" ? " · 草稿" : ""}</p>` : ""}
        <div class="preview-page-mock">
          <p class="preview-excerpt">${escapeHtml(preview.quote)}</p>
          ${preview.note ? `<p class="preview-note">${escapeHtml(preview.note)}</p>` : ""}
        </div>
        <p class="preview-foot">Mock 预览 · 正式版支持分页滚动与溯源高亮</p>
      </div>
    </aside>
  `;
}

function renderSourceCitationPanel(citation) {
  const label = formatSourceCitationLabel(citation);
  const kind = sourceKindLabel(citation.kind);
  const snippet = citation.snippet
    ? `<p class="xb-preview-excerpt">${escapeHtml(citation.snippet)}</p>`
    : "";
  const webLink = citation.kind === "web" && citation.url
    ? `<a class="xb-web-cite-open-link" href="${escapeHtml(citation.url)}" target="_blank" rel="noopener noreferrer">在新标签页打开原文</a>`
    : "";
  const meta = citation.pageNum != null
    ? `<span class="xb-preview-badge">第 ${escapeHtml(String(citation.pageNum))} 页</span>`
    : "";
  return h`
    <div class="xb-preview-pane source-preview-panel">
      <div class="xb-preview-body">
        <p class="mini-meta">${escapeHtml(kind)}</p>
        <h3 class="xb-preview-title">${escapeHtml(label)}</h3>
        ${meta ? `<div class="xb-preview-badges">${meta}</div>` : ""}
        ${snippet}
        ${webLink}
        <p class="preview-foot">演示模式 · 完整溯源预览请使用 agent-demo WebUI</p>
      </div>
    </div>
  `;
}

function panelTitle(kind, state) {
  if (kind === "report") return resolveReportPanelTitle(state);
  return {
    industry: "行业分析（五维框架）",
    "entry-brief": "项目入场分析",
    "risk-qna": "立项会风控预演", "material-gap": "材料完整度评估",
    "journalist-report": "一线调研报告", "expert-outline": "专家会前提纲",
    "expert-notes": "专家会议纪要", "interview-outline": "管理层访谈大纲",
    "batch-eval": "批量评估结果",
    "company-list": "企业名单",
    news: "资讯全文",
    document: "资料详情",
    "sector-weekly": "赛道融资周报",
    "source-citation": "来源预览"
  }[kind] || "内容";
}

function resolveReportPanelTitle(state) {
  return resolveReportPanelContext(state?.ui?.previewData || {}, state).activeDoc?.label
    || state?.ui?.previewData?.reportLabel
    || "尽调报告";
}

function resolveReportPanelContext(d, state) {
  const sess = state?.session;
  let reports = d.reports || sess?.reports || [];
  if (!reports.length && sess?.reportVersions?.length) {
    reports = [{
      id: sess.activeReportId || "report-legacy",
      label: d.reportLabel || "报告",
      templateName: d.template || sess?.template || "",
      reportVersions: sess.reportVersions,
      activeVersion: sess.activeVersion
    }];
  }
  const activeReportId = d.activeReportId || sess?.activeReportId || reports[reports.length - 1]?.id;
  const activeDoc = reports.find(r => r.id === activeReportId) || reports[reports.length - 1];
  const versions = activeDoc?.reportVersions || d.reportVersions || sess?.reportVersions || [];
  const activeVersion = d.activeVersion || activeDoc?.activeVersion || versions[versions.length - 1]?.v;
  const activeVer = versions.find(v => v.v === activeVersion) || versions[versions.length - 1];
  const fields = activeVer?.fields?.length ? activeVer.fields : (d.fields?.length ? d.fields : (sess?.reportFields || []));
  const activeAiFile = sess?.aiReports?.find(r =>
    r.reportDocId === activeDoc?.id && r.version === activeVersion
  );
  return {
    reports,
    activeReportId,
    activeDoc,
    versions,
    activeVersion,
    activeVer,
    fields,
    sections: activeVer?.sections || d.sections || REPORT_SECTIONS,
    company: d.company || sess?.company || "",
    template: d.template || activeDoc?.templateName || sess?.template || "",
    updateCount: activeVer?.updatedFieldKeys?.length || fields.filter(f => f.updatedInVersion === activeVersion).length,
    hasReport: sessionHasReports(sess),
    reportIsDraft: activeDoc?.shareState !== "shared",
    shareFileId: activeAiFile?.id
  };
}

function renderReportToolbarActions(ctx) {
  if (!ctx) return "";
  const { reportIsDraft, shareFileId, hasReport } = ctx;
  return h`
    <div class="report-preview-head-actions" aria-label="报告操作">
      ${reportIsDraft && shareFileId ? h`
        <button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.shareFileToProject", shareFileId)}">共享到项目</button>
      ` : ""}
      ${hasReport ? h`
        <button type="button" class="btn-mini" onclick="XinBaoDemo.updateReport()">根据新材料更新</button>
        <button type="button" class="btn-mini" onclick="XinBaoDemo.doPPTMaking()">导出 PPT 大纲</button>
        <button type="button" class="btn-mini" onclick="XinBaoDemo.openMeetingMaterialsPacker()">打包上会材料</button>
      ` : ""}
      <button type="button" class="btn-download btn-download-compact" onclick="XinBaoDemo.export()">
        ${icon("download", "icon--sm")}<span>导出 Word</span>
      </button>
    </div>
  `;
}

function renderPreviewHead(kind, state, opts = {}) {
  const closeTitle = opts.closeTitle || "收起";
  const title = opts.title != null ? opts.title : panelTitle(kind, state);
  const reportCtx = kind === "report"
    ? resolveReportPanelContext(state.ui.previewData || {}, state)
    : null;
  return h`
    <div class="preview-head ${kind === "report" ? "preview-head--report" : ""}">
      <div class="preview-title">
        <strong>${escapeHtml(title)}</strong>
        ${opts.subtitle || ""}
      </div>
      <div class="preview-head-end">
        ${kind === "report" ? renderReportToolbarActions(reportCtx) : ""}
        <button type="button" class="preview-close" onclick="XinBaoDemo.closePreview()" title="${escapeHtml(closeTitle)}" aria-label="${escapeHtml(closeTitle)}">×</button>
      </div>
    </div>
  `;
}

function renderSectionSourceRefs(refs, state) {
  if (!refs?.length) return "";
  return h`
    <div class="report-section-refs" aria-label="本章溯源">
      ${refs.map(r => h`
        <span class="report-section-ref-item">
          <sup class="report-cite-wrap">${r.n}</sup>
          ${renderSourceButton(r.source, "", state)}
        </span>
      `).join("")}
    </div>
  `;
}

function renderReportCiteRef(n, source) {
  return `<sup class="report-cite-wrap"><button type="button" class="report-cite-ref" title="${escapeHtml(source)}" onclick="${jsCall("XinBaoDemo.showSource", source)}">${n}</button></sup>`;
}

function prepareReportSectionsForRender(sections, activeVersion) {
  const normalized = normalizeReportSections(sections);
  let citeNum = 0;
  return normalized.map(sec => {
    const parts = (sec.parts || []).map(p => {
      if (!p.cite) {
        return { ...p, isUpdated: !!p.updated };
      }
      citeNum += 1;
      const needsMaterial = p.cite.ok === false;
      const isUpdated = !!p.updated || p.cite.updatedInVersion === activeVersion;
      return { ...p, citeN: citeNum, needsMaterial, isUpdated };
    });
    return {
      ...sec,
      parts,
      hasGap: !!sec.gap,
      sectionUpdated: parts.some(p => p.isUpdated)
    };
  });
}

function renderReportPartHtml(part) {
  const cls = [
    part.needsMaterial ? "report-needs-material" : "",
    part.isUpdated ? "report-is-updated" : ""
  ].filter(Boolean).join(" ");
  let html = cls
    ? `<span class="${cls}">${escapeHtml(part.text)}`
    : escapeHtml(part.text);
  if (part.citeN && part.cite?.source) {
    html += renderReportCiteRef(part.citeN, part.cite.source);
  }
  if (cls) html += "</span>";
  return html;
}

function renderCompanyListPanel(state) {
  const r = state.featureData?.searchResult || COMPANY_SEARCH_RESULT;
  return renderCompanyList(r);
}

function renderReportPanel(d, state) {
  const ctx = resolveReportPanelContext(d, state);
  const {
    reports, activeReportId, activeDoc, versions, activeVersion, activeVer,
    company, template, updateCount, sections
  } = ctx;
  const renderSections = prepareReportSectionsForRender(sections, activeVersion);

  return h`
    <div class="report-full-doc">
      <div class="report-full-toolbar">
        <div class="report-full-toolbar-row">
          <div class="report-full-toolbar-left">
            ${activeDoc?.author?.name ? h`
              <p class="mini-meta report-author-meta">
                ${activeDoc.shareState === "shared"
                  ? `由 ${escapeHtml(activeDoc.author.name)} 共享`
                  : `草稿 · ${escapeHtml(activeDoc.author.name)}`}
              </p>
            ` : ""}
            ${reports.length > 1 ? h`
              <div class="report-version-bar">
                <label class="report-version-label">报告</label>
                <select class="report-version-select report-doc-select" onchange="XinBaoDemo.switchActiveReport(this.value)">
                  ${reports.map(r => h`
                    <option value="${escapeHtml(r.id)}" ${r.id === activeReportId ? "selected" : ""}>${escapeHtml(r.label)} · ${escapeHtml(r.templateName || "")}</option>
                  `).join("")}
                </select>
              </div>
            ` : ""}
            ${versions.length ? h`
              <div class="report-version-bar">
                <label class="report-version-label">版本</label>
                <select class="report-version-select" onchange="XinBaoDemo.switchReportVersion(this.value)">
                  ${versions.map(v => h`
                    <option value="${escapeHtml(v.v)}" ${v.v === activeVersion ? "selected" : ""}>${escapeHtml(formatReportVersionLabel(v))}</option>
                  `).join("")}
                </select>
                ${updateCount ? `<span class="report-version-badge">本版更新 ${updateCount} 处</span>` : ""}
              </div>
            ` : `<p class="report-version-basis mini-meta">初稿生成后可切换版本</p>`}
          </div>
        </div>
        ${versions.length ? h`
          <div class="report-full-toolbar-meta">
            ${activeVer?.basis ? `<p class="report-version-basis mini-meta">${escapeHtml(activeVer.basis)}</p>` : ""}
            ${template ? `<p class="report-version-basis mini-meta">使用模板：${escapeHtml(template)}</p>` : ""}
            <div class="report-legend" aria-label="标注说明">
              <span class="report-legend-item"><span class="report-legend-swatch report-legend-swatch--updated"></span>本版更新</span>
              <span class="report-legend-item"><span class="report-legend-swatch report-legend-swatch--gap"></span>待补充材料</span>
              <span class="report-legend-item report-legend-hint">正文可直接编辑 · 失焦自动保存 · 点击角标查看来源</span>
            </div>
          </div>
        ` : ""}
      </div>
      <article class="report-full-body">
        ${company ? h`
          <h2
            class="report-full-title report-editable"
            contenteditable="true"
            spellcheck="true"
            data-placeholder="企业名称"
            onblur="XinBaoDemo.saveReportCompany(this)"
          >${escapeHtml(company)}</h2>
        ` : ""}
        ${renderSections.map((sec, si) => {
          const plain = sectionPlainText(sec);
          const refs = getSectionSourceRefs(sec);
          const userEdited = !!sec.userEdited;
          return h`
          <section class="report-full-section ${sec.hasGap ? "report-section-gap" : ""} ${sec.sectionUpdated && !userEdited ? "report-section-updated" : ""} ${userEdited ? "report-section-user-edited" : ""}">
            <h3
              class="report-editable report-editable-heading"
              contenteditable="true"
              spellcheck="true"
              data-placeholder="章节标题"
              onblur="XinBaoDemo.saveReportSectionTitle(${si}, this)"
            >${escapeHtml(sec.title)}</h3>
            <div
              class="report-editable-body report-full-paragraph"
              contenteditable="true"
              spellcheck="true"
              data-placeholder="在此编辑本章内容…"
              onblur="XinBaoDemo.saveReportSectionBody(${si}, this)"
            >${escapeHtml(plain)}</div>
            ${refs.length ? renderSectionSourceRefs(refs, state) : ""}
            ${sec.hasGap || sec.gap != null ? h`
              <div
                class="report-gap-note report-editable-gap"
                contenteditable="true"
                spellcheck="true"
                data-placeholder="待补充项（留空则移除）"
                onblur="XinBaoDemo.saveReportSectionGap(${si}, this)"
              >${sec.gap ? escapeHtml(sec.gap) : ""}</div>
            ` : ""}
          </section>
        `;
        }).join("")}
      </article>
    </div>
  `;
}

function renderIndustryPanel(d, state) {
  const a = d?.analysis || INDUSTRY_ANALYSIS;
  return h`
    <p class="panel-lead">${escapeHtml(a.industry)} · ${escapeHtml(a.summary)}</p>
    <table class="data-table compact">
      <thead><tr><th>维度</th><th>结论</th><th>风险</th></tr></thead>
      <tbody>
        ${a.dimensions.map(x => h`
          <tr>
            <td class="td-name">${escapeHtml(x.name)}</td>
            <td>${escapeHtml(x.conclusion)}<br>${renderSourceButton(x.source, "", state)}</td>
            <td><span class="tag ${x.risk === "high" ? "warn" : "ok"}">${x.risk}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    ${panelHeading("alert-triangle", "需继续核验（公开数据无法回答）")}
    ${a.gaps.map(g => h`
      <div class="gap-q">
        <p class="gap-q-text">${icon("help-circle", "icon--sm")}<span>${escapeHtml(g.q)}</span></p>
        <p class="mini-meta">${escapeHtml(g.reason)}</p>
        <div class="gap-actions gap-actions-subtle">
          ${g.action !== "expert" && g.action !== "一线调研" ? `<button type="button" class="verify-hint-link" onclick="${jsCall("XinBaoDemo.go", "journalist")}">一线调研</button>` : ""}
          ${g.action !== "一线调研" && g.action !== "expert" ? `<span class="verify-hint-sep">·</span>` : ""}
          ${g.action !== "一线调研" ? `<button type="button" class="verify-hint-link" onclick="${jsCall("XinBaoDemo.goExpertBooking")}">约专家访谈</button>` : ""}
        </div>
      </div>
    `).join("")}
  `;
}

function renderRiskQnaPanel() {
  const q = RISK_QNA;
  const qnaStatus = s => {
    if (s === "answered") return statusBadge("answered", "");
    if (s === "supplement") return statusBadge("supplement", "");
    return statusBadge("pending", "");
  };
  return h`
    <div class="qna-stat">
      <span class="tag ok">答复充分 ${q.answered}</span>
      <span class="tag warn">需补充 ${q.supplement}</span>
      <span class="tag">待确认 ${q.pending}</span>
    </div>
    ${q.questions.map(item => h`
      <div class="qna-item ${item.status}">
        <p class="qna-q">${qnaStatus(item.status)} <strong>${escapeHtml(item.cat)}</strong>：${escapeHtml(item.q)}</p>
        ${item.a ? `<p class="qna-a">${escapeHtml(item.a)}</p>` : ""}
        ${item.src ? `<p class="mini-meta">来源：${escapeHtml(item.src)}</p>` : ""}
        ${item.gap ? `<p class="qna-gap">${statusBadge("warn", escapeHtml(item.gap))}</p>` : ""}
      </div>
    `).join("")}
    <div class="assess-box">
      <h4 class="panel-h">综合评估</h4>
      <p><strong>优势：</strong>${q.assessment.strengths.join("；")}</p>
      <p><strong>不足：</strong>${q.assessment.weaknesses.join("；")}</p>
      <p class="assess-rec">${icon("info", "icon--sm")}<span>${escapeHtml(q.assessment.recommendation)}</span></p>
    </div>
  `;
}

function renderGapPanel() {
  const g = MATERIAL_GAP;
  return h`
    <p class="panel-lead">已上传 ${g.uploaded}/${g.required}，缺失 ${g.missing} 项，冲突 ${g.conflicted} 处</p>
    ${panelHeading("clipboard", "材料缺口")}
    ${g.gaps.map(it => h`
      <div class="gap-item">
        <span class="tag ${it.priority === "high" ? "warn" : ""}">${it.priority}</span>
        <strong>${escapeHtml(it.name)}</strong><span class="mini-tag">${escapeHtml(it.cat)}</span>
        <p class="mini-meta">${escapeHtml(it.reason)}</p>
      </div>
    `).join("")}
    ${panelHeading("alert-circle", "数据冲突")}
    ${g.conflicts.map(c => h`
      <div class="conflict-item">
        <p><strong>${escapeHtml(c.desc)}</strong></p>
        <p class="mini-meta">${icon("file", "icon--sm")}<span>${escapeHtml(c.a)} ↔ ${escapeHtml(c.b)}</span></p>
        <p class="conflict-action">→ ${escapeHtml(c.action)}</p>
      </div>
    `).join("")}
  `;
}

function resolveLinkedProject(projectId) {
  if (!projectId) return null;
  return PROJECT_LIST.find(p => p.id === projectId) || null;
}

function renderJournalistReportPanel(d) {
  const r = d?.report || JOURNALIST.completedReport;
  const projectId = d?.projectId || r.projectId;
  const proj = resolveLinkedProject(projectId);
  return h`
    <p class="panel-lead"><strong>${escapeHtml(r.title)}</strong></p>
    <p class="mini-meta">${escapeHtml(r.reporter)} · ${escapeHtml(r.date)}</p>
    <p class="mini-meta">调研方式：${escapeHtml(r.method)}</p>
    ${proj ? h`
      <p class="mini-meta panel-linked-project">
        ${icon("projectSpace", "icon--sm")}
        <span>关联项目：${escapeHtml(proj.name)}</span>
      </p>
    ` : ""}
    <h4 class="panel-h">核心发现</h4>
    ${r.findings.map(f => `<p class="finding ${f.type}">${f.type === "risk" ? statusBadge("risk", escapeHtml(f.text)) : statusBadge("ok", escapeHtml(f.text))}</p>`).join("")}
    <div class="assess-box"><p class="note-line">${icon("edit", "icon--sm")}<span><strong>调研判断：</strong>${escapeHtml(r.judgment)}</span></p></div>
    <div class="panel-actions">
      ${projectId ? `<button class="btn-mini primary" onclick="${jsCall("XinBaoDemo.openProject", projectId)}">打开关联项目</button>` : ""}
    </div>
  `;
}

function renderNewsPanel(d) {
  const item = d?.item || {};
  return h`
    <p class="panel-lead"><strong>${escapeHtml(item.title || "")}</strong></p>
    <p class="mini-meta">${escapeHtml(item.source || "")} · ${escapeHtml(item.time || item.date || "")}</p>
    <h4 class="panel-h">全文</h4>
    <div class="news-fulltext">${escapeHtml(item.fullText || item.summary || "").replace(/\n/g, "<br>")}</div>
    ${item.interpretation ? h`
      <div class="expert-note" style="margin-top:12px">
        <span class="expert-note-tag">内容解读</span>
        <p>${escapeHtml(item.interpretation)}</p>
      </div>
    ` : ""}
    ${(item.relatedCompanies || []).length ? h`
      <h4 class="panel-h">涉及企业</h4>
      <div class="related-companies">
        ${item.relatedCompanies.map(c => h`
          <button type="button" class="company-chip company-chip-subtle" onclick="${jsCall("XinBaoDemo.doExamineCompany", c.name)}">
            ${escapeHtml(c.name)}<em>${escapeHtml(c.role)}</em>
          </button>
        `).join("")}
      </div>
    ` : ""}
    <div class="panel-actions">
      <button class="btn-mini" onclick="${jsCall("XinBaoDemo.saveNewsToMaterials", item.id)}">收藏到资料库</button>
    </div>
  `;
}

function renderDocumentPanel(d) {
  const doc = d?.doc || {};
  return h`
    <p class="panel-lead"><strong>${escapeHtml(doc.title || "")}</strong></p>
    <p class="mini-meta">${escapeHtml(doc.type || "")} · ${escapeHtml(doc.date || doc.source || "")}</p>
    ${doc.scenario ? `<p class="template-scenario panel-scenario">${escapeHtml(doc.scenario)}</p>` : ""}
    <div class="news-fulltext">${escapeHtml(doc.fullText || "").replace(/\n/g, "<br>")}</div>
  `;
}

function renderOutlinePanel(d) {
  const o = d?.qna || EXPERTS.outline;
  return h`
    <p class="panel-lead">${escapeHtml(o.target || o.expertName || "专家会前提纲")}</p>
    <p class="mini-meta">${escapeHtml(o.basis)}</p>
    ${o.categories.map(c => h`
      <h4 class="panel-h">${escapeHtml(c.name)}</h4>
      <ul class="q-list">${c.questions.map(q => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
    `).join("")}
  `;
}

function renderNotesPanel() {
  const n = EXPERTS.notes;
  return h`
    <p class="panel-lead">${escapeHtml(n.expertName)}</p>
    <p class="mini-meta">${escapeHtml(n.date)} · ${escapeHtml(n.duration)}</p>
    ${n.items.map(it => h`
      <div class="note-item">
        <p class="note-q">Q：${escapeHtml(it.q)}</p>
        <p class="note-a">${escapeHtml(it.a)}</p>
        <p class="mini-meta"><span class="mini-tag">${escapeHtml(it.type)}</span> 置信度 ${escapeHtml(it.conf)}</p>
      </div>
    `).join("")}
    <div class="assess-box"><p class="note-line">${icon("edit", "icon--sm")}<span>${escapeHtml(n.summary)}</span></p></div>
  `;
}

function renderInterviewPanel(d) {
  const o = d?.qna || INTERVIEW_OUTLINE;
  return h`
    <p class="panel-lead">${escapeHtml(o.target)}</p>
    <p class="mini-meta">${escapeHtml(o.basis)}</p>
    ${o.categories.map(c => h`
      <h4 class="panel-h">${escapeHtml(c.name)}</h4>
      <ul class="q-list">${c.questions.map(q => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
    `).join("")}
  `;
}

function renderBatchEvalPanel(d) {
  const r = d?.result || BATCH_EVAL_RESULT;
  return h`
    <p class="panel-lead">评估框架：${escapeHtml(r.framework)}</p>
    ${r.query ? `<p class="mini-meta">检索：${escapeHtml(r.query)}${r.evaluatedAt ? ` · ${escapeHtml(r.evaluatedAt)}` : ""}</p>` : ""}
    <div class="panel-actions panel-actions--flush">
      <button type="button" class="btn-mini primary" onclick="XinBaoDemo.downloadBatchEval()">
        <span class="btn-with-icon">${icon("download", "icon--sm")}<span>下载评估结果</span></span>
      </button>
      <button type="button" class="btn-mini" onclick="XinBaoDemo.saveBatchEvalToMaterials()">保存到资料库</button>
      <button type="button" class="btn-mini" onclick="XinBaoDemo.downloadList()">下载原始名单</button>
    </div>
    ${r.results.map(it => h`
      <div class="eval-item">
        <div class="eval-head">
          <span class="eval-rank">#${it.rank}</span>
          <strong>${escapeHtml(it.name)}</strong>
          <span class="score-badge">⭐ ${it.score}</span>
        </div>
        <div class="eval-dims">${Object.entries(it.dims).map(([k, v]) => `<span class="mini-tag">${k} ${v}</span>`).join("")}</div>
        <p class="mini-meta"><span class="verdict">${escapeHtml(it.verdict)}</span> · ${escapeHtml(it.reason)}</p>
        <div class="eval-item-actions">
          <button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.doExamineCompany", it.name)}">查这家</button>
          <button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.findToProject", it.name)}">发起尽调</button>
        </div>
      </div>
    `).join("")}
  `;
}

/* ============================ Chat：输入区 + tag ============================ */

function lastAgentBlocksComposer(sess) {
  const messages = sess?.messages || [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "agent" || m.resolved) continue;
    const t = m.type || "text";
    return ["scenarios-card", "confirm-card"].includes(t);
  }
  return false;
}

function composerPlaceholder(sess, state) {
  if (state?.ui?.composerChip?.hint) return state.ui.composerChip.hint;
  if (state?.ui?.composerHint) return state.ui.composerHint;
  if (state?.chatMode === "find") return "想找什么企业？例如：天津市 医疗器械 营收5-10亿";
  if (state?.chatMode === "bp") return "粘贴 BP 内容，或上传文件…";
  if (state?.chatMode === "batch") return "每行一个企业名称…";
  if (state?.chatMode === "deep") return "输入企业全称…";
  if (state?.chatMode === "industry") return "输入要研究的行业或赛道，例如：医疗器械、航空 MRO";
  if (state?.chatMode === "risk") return "输入企业全称，例如：苏州某生物医药科技有限公司";
  if (state?.chatMode === "examine") return "输入企业全称，例如：天津某医疗科技有限公司";
  if (state?.chatMode === "report") return "输入尽调目标企业全称，例如：苏州某生物医药科技有限公司";
  if (state?.chatMode === "gap") return "输入企业全称，以便对照尽调材料清单查缺口";
  if (state?.chatMode === "journalist") return "输入要实地调研的企业全称";
  if (state?.chatMode === "deliberation") return state.ui.composerHint || "填写议题或补充背景…";
  const expert = getActiveExpert(state);
  if (expert) return `向${expert.name}提问…`;
  if (isProjectHubState(state)) {
    const company = sess?.company || "";
    return company ? `关于 ${company}，输入问题或上传材料…` : "输入问题或上传材料，开始新对话…";
  }
  if (isHomeChat(state)) return "问小星：企业名、赛道，或任何尽调问题…";
  if (sess.saved) return "输入文字提问，/ 唤醒技能";
  return "输入文字提问，/ 唤醒技能";
}

function getActiveExpert(state) {
  const id = state.ui.activeExpertId;
  if (!id) return null;
  const options = getChatExpertOptions();
  if (!options.some(e => e.id === id)) {
    state.ui.activeExpertId = null;
    return null;
  }
  return getChatExpertById(id);
}

function getSelectedExpertIds(state) {
  return getSelectedExpertIdsFromState(state);
}

function getExpertSelectorLabel(state) {
  const experts = getSelectedExpertIds(state).map(id => getChatExpertById(id)).filter(Boolean);
  if (!experts.length) return "";
  if (state.ui.multiExpertDiscussion) {
    if (experts.length === 1) return experts[0].name;
    const first = experts[0].name.replace(/专家$/, "");
    return `${first}等 ${experts.length} 位`;
  }
  return experts[0].name;
}

function getBattleRoleBadges(expertId, state, battleOn) {
  const roles = getBattleRoleLabelsForExpert(
    expertId,
    state?.ui?.battleRedIds,
    state?.ui?.battleBlueIds,
    battleOn,
  );
  const roleClass = {
    red: "expert-dropdown-role expert-dropdown-role--red",
    blue: "expert-dropdown-role expert-dropdown-role--blue",
    extra: "expert-dropdown-role expert-dropdown-role--extra",
  };
  const roleLabel = { red: "红方", blue: "蓝方", extra: "补充" };
  return roles
    .map((r) => `<span class="${roleClass[r]}">${roleLabel[r]}</span>`)
    .join("");
}

function renderExpertDropdownHeader(state) {
  const on = !!state.ui.multiExpertDiscussion;
  return h`
    <div class="expert-dropdown-header">
      <div class="expert-dropdown-mode">
        <div class="expert-dropdown-mode-text">
          <strong>专家 Battle · 红蓝对抗</strong>
          <span>${on ? "红方/蓝方各最多 4 人；发送后最多 3 轮辩论，小星汇总裁定" : "选一位专家提问；开启 Battle 进入红蓝对抗"}</span>
        </div>
        <button
          type="button"
          class="toggle-switch ${on ? "is-on" : ""}"
          role="switch"
          aria-checked="${on}"
          aria-label="专家 Battle 红蓝对抗"
          data-expert-multi-toggle
        >
          <span class="toggle-switch-knob"></span>
        </button>
      </div>
    </div>
  `;
}

function renderExpertDropdownStatus(state) {
  if (!state.ui.multiExpertDiscussion) return "";
  const status = getBattleStatusTextFromTeams(
    state.ui.battleRedIds,
    state.ui.battleBlueIds,
  );
  return `<div class="expert-dropdown-status ${status.ready ? "is-ready" : ""}">${escapeHtml(status.text)}</div>`;
}

function renderExpertDropdown(state, { id = "", fixed = false } = {}) {
  const multi = !!state.ui.multiExpertDiscussion;
  const selectedIds = getSelectedExpertIds(state);
  const selectedSet = new Set(selectedIds);
  const hasExtra = selectedIds.length > 0;
  const allOptions = getChatExpertOptions();
  const items = allOptions.map(e => {
    const isSelected = selectedSet.has(e.id);
    const mark = multi
      ? `<span class="expert-dropdown-check ${isSelected ? "is-checked" : ""}" aria-hidden="true"></span>`
      : (isSelected ? icon("check", "icon--sm") : "");
    const liveMark = "";
    const roleBadge = getBattleRoleBadges(e.id, state, multi);
    return h`
    <button type="button" class="expert-dropdown-item ${isSelected ? "is-active" : ""}"
      data-expert-id="${escapeHtml(e.id)}">
      <span class="expert-dropdown-text">
        <strong>${escapeHtml(e.name)}${liveMark}${roleBadge}</strong>
        <span>${escapeHtml(e.field)}</span>
      </span>
      ${mark}
    </button>
  `;
  }).join("");
  const footer = hasExtra ? h`
    <div class="expert-dropdown-footer">
      <button type="button" class="expert-dropdown-clear" data-expert-clear>清除额外选择</button>
    </div>
  ` : "";
  const fixedClass = fixed ? " expert-dropdown--fixed" : "";
  const idAttr = id ? ` id="${id}"` : "";
  return h`
    <div class="expert-dropdown${fixedClass}"${idAttr} role="listbox" aria-label="选择专家">
      ${renderExpertDropdownHeader(state)}
      ${renderExpertDropdownStatus(state)}
      <div class="expert-dropdown-meta">共 ${allOptions.length} 位平台专家</div>
      <div class="expert-dropdown-list">${items}</div>
      ${footer}
    </div>
  `;
}

/** 输入框底部专家选择器（与技能并列） */
function renderExpertSelector(state) {
  const selectedIds = getSelectedExpertIds(state);
  const primaryId = selectedIds[0];
  const expert = primaryId ? getChatExpertById(primaryId) : DEFAULT_CHAT_EXPERT;
  const label = getExpertSelectorLabel(state);
  const open = !!state.ui.expertMenuOpen;
  const multi = !!state.ui.multiExpertDiscussion;
  const hasExtra = selectedIds.length > 0;
  return h`
    <div class="expert-selector-wrap">
      <button type="button" id="expert-selector-trigger" class="composer-pill expert-selector-pill ${open ? "active is-open" : ""} ${multi && hasExtra ? "expert-selector-pill--multi" : ""}"
        onclick="XinBaoDemo.toggleExpertMenu()" aria-haspopup="listbox" aria-expanded="${open}"
        title="${escapeHtml(expert.field || expert.name)}">
        <span>专家</span>
        <span class="expert-selector-pill-name">${escapeHtml(label)}</span>
        <span class="expert-selector-chevron">${icon(open ? "chevronUp" : "chevronDown", "icon--sm")}</span>
      </button>
    </div>
  `;
}

function renderComposerActiveChips(state) {
  const chip = state.ui.composerChip;
  const fileRefs = state.ui.composerFileRefs || [];
  if (!chip && !fileRefs.length) return "";
  const scenarioPill = chip
    ? `<span class="composer-scenario-pill"><span>${escapeHtml(chip.label)}</span><button type="button" onclick="XinBaoDemo.clearComposerChip()" aria-label="移除场景">×</button></span>`
    : "";
  const filePills = fileRefs.map(f => h`
    <span class="composer-file-ref-pill">
      <span class="composer-file-ref-icon">${icon(fileTreeIcon(f.name), "icon--sm")}</span>
      <span class="composer-file-ref-name">${escapeHtml(f.name)}</span>
      <button type="button" class="composer-file-ref-remove" onclick="${jsCall("XinBaoDemo.removeComposerFileRef", f.id)}" aria-label="移除引用">×</button>
    </span>
  `).join("");
  return `<div class="composer-active-chips">${scenarioPill}${filePills}</div>`;
}

/** 输入框浮层：挂到 shell 顶层再移至 body，对齐各 pill 按钮 */
function renderComposerPopovers(state) {
  const expertOpen = !!state.ui.expertMenuOpen;
  const menuType = state.ui.composerMenu;
  if (!expertOpen && !menuType) return "";
  return h`
    <div class="composer-popover-layer">
      <div class="composer-popover-backdrop" aria-hidden="true"></div>
      ${expertOpen ? renderExpertDropdown(state, { id: "expert-dropdown-float", fixed: true }) : ""}
      ${menuType ? renderComposerMenu(state, { id: `composer-menu-${menuType}`, fixed: true }) : ""}
    </div>
  `;
}

function hasSessionEntryBrief(sess, state) {
  return !!(sess?.entryBrief || (state.ui.previewKind === "entry-brief" && state.ui.previewData));
}

function renderEntryBriefPanelLinkInline(sess) {
  const n = sess?.entryBrief?.similarCases?.length || 0;
  const desc = n > 0
    ? `五维画像 · ${n} 个类似案例 · 点击在右侧打开`
    : "五维画像与类似案例 · 点击在右侧打开";
  return `<div class="xb-panel-link-card panel-link panel-link--inline" onclick="XinBaoDemo.openPanel('entry-brief')">
    <span class="xb-panel-link-card__icon panel-link-icon">${panelIcon({ kind: "entry-brief" })}</span>
    <span class="xb-panel-link-card__body panel-link-info"><strong>项目入场分析</strong><span>${escapeHtml(desc)}</span></span>
    <span class="xb-panel-link-card__arrow panel-link-arrow">${icon("chevronRight", "icon--md")}</span>
  </div>`;
}

function buildAiOutputItems(state) {
  const sess = state.session;
  const items = [];
  if (hasSessionEntryBrief(sess, state)) {
    const active = state.ui.previewOpen && state.ui.previewKind === "entry-brief";
    items.push({
      id: "entry-brief",
      kind: "entry-brief",
      title: "项目入场分析",
      desc: "五维画像与类似案例",
      active,
      onclick: active
        ? "XinBaoDemo.closePreview()"
        : "XinBaoDemo.openPanel('entry-brief')"
    });
  }
  if (sess && sessionHasReports(sess)) {
    const reports = sess.reports?.length ? sess.reports : [{
      id: sess.activeReportId || "report-legacy",
      label: sess.template || "报告",
      activeVersion: sess.activeVersion
    }];
    const activeReport = reports.find(r => r.id === sess.activeReportId) || reports[reports.length - 1];
    const previewActive = state.ui.previewOpen && state.ui.previewKind === "report";
    items.push({
      id: "artifact-report",
      kind: "artifact",
      title: activeReport?.label || "报告",
      desc: activeReport?.activeVersion ? `版本 ${activeReport.activeVersion}` : "尽调报告",
      active: previewActive,
      onclick: previewActive
        ? "XinBaoDemo.closePreview()"
        : "XinBaoDemo.openReportFromBanner()"
    });
  }
  return items;
}

function renderAiOutputHeaderMenu(state) {
  const items = buildAiOutputItems(state);
  if (!items.length) return "";
  const activeCount = items.filter((item) => item.active).length;
  if (items.length === 1) {
    const item = items[0];
    return h`
      <button type="button" class="xb-btn-header-report btn-header-report ${item.active ? "xb-btn-header-report--active" : ""}"
        onclick="${item.onclick}" aria-pressed="${item.active ? "true" : "false"}" title="${escapeHtml(item.desc)}">
        ${icon("sparkles", "icon--sm")}
        <span>AI 产出</span>
      </button>
    `;
  }
  return h`
    <div class="ai-output-header-wrap">
      <button type="button" class="xb-btn-header-report btn-header-report ${activeCount > 0 ? "xb-btn-header-report--active" : ""}"
        onclick="XinBaoDemo.toggleAiOutputMenu()" aria-haspopup="menu" title="查看 AI 产出">
        ${icon("sparkles", "icon--sm")}
        <span>AI 产出</span>
        <span class="xb-ai-output-header-badge">${items.length}</span>
        ${icon("chevronDown", "icon--sm")}
      </button>
      ${state.ui.aiOutputMenuOpen ? h`
        <div class="ai-output-header-menu" role="menu">
          ${items.map((item) => h`
            <button type="button" class="xb-ai-output-menu-item" onclick="${item.onclick};XinBaoDemo.toggleAiOutputMenu(false)">
              <span class="xb-ai-output-menu-item__icon">${panelIcon({ kind: item.kind === "artifact" ? "report" : "entry-brief" })}</span>
              <span class="xb-ai-output-menu-item__body">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.desc)}</span>
              </span>
              ${item.active ? `<span class="xb-ai-output-menu-item__active">已打开</span>` : ""}
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderAiOutputDock(state) {
  return "";
}

function renderComposerArea(state) {
  const sess = state.session;
  const home = isHomeChat(state);
  const blocked = lastAgentBlocksComposer(sess);
  const tags = home || blocked ? [] : getContextTags(state);
  const tagRow = home
    ? renderHomeComposerTags()
    : tags.length || !home
      ? h`
      <div class="composer-tag-row">
        ${tags.length ? `<div class="composer-chips">${tags.map(c => `<button type="button" class="chip" onclick="${chipOnclick(c)}">${escapeHtml(c)}</button>`).join("")}</div>` : `<div></div>`}
        <button type="button" class="composer-scenario-btn" onclick="XinBaoDemo.go('scenarios')">全部场景</button>
      </div>
    `
      : "";
  const citeChip = state.ui.citedMaterial
    ? `<div class="composer-cite-chip"><span class="composer-cite-chip-icon">${icon("file", "icon--sm")}</span><span class="composer-cite-chip-name">已引用：${escapeHtml(state.ui.citedMaterial.title)}</span><button type="button" onclick="XinBaoDemo.clearCite()" aria-label="移除引用">${icon("x", "icon--sm")}</button></div>`
    : "";
  const attachBadge = pendingAttachCount(sess)
    ? `<span class="composer-attach-badge">${pendingAttachCount(sess)}</span>`
    : "";
  const canSend = !!(state.ui.chatInput?.trim())
    || pendingAttachCount(sess) > 0
    || !!state.ui.composerChip
    || (state.ui.composerFileRefs?.length > 0);
  const isStreaming = !!state.ui.streaming;
  const sendBtnClass = isStreaming
    ? "composer-send active composer-send--stop"
    : `composer-send ${canSend ? "active" : ""}`;
  const sendBtnTitle = isStreaming ? "停止" : "发送";
  const sendBtnOnClick = isStreaming ? "XinBaoDemo.stopGeneration()" : "XinBaoDemo.send()";
  const pendingFilesRow = renderPendingAttachments(sess);
  const menuOpen = state.ui.composerMenu;
  const activeChips = renderComposerActiveChips(state);
  const showExpertPill = !blocked;
  const dropHandlers = `ondragover="event.preventDefault();event.dataTransfer.dropEffect='copy';this.classList.add('composer-wrap--dragover')" ondragleave="if(!event.currentTarget.contains(event.relatedTarget))this.classList.remove('composer-wrap--dragover')" ondrop="event.preventDefault();this.classList.remove('composer-wrap--dragover');var id=event.dataTransfer.getData('file-id')||event.dataTransfer.getData('text/plain');if(id)XinBaoDemo.onComposerFileDrop(id)"`;
  return h`
    ${renderAiOutputDock(state)}
    ${tagRow}
    ${citeChip}
    ${pendingFilesRow}
    <div class="composer-wrap" ${dropHandlers}>
      <div class="composer-card">
        <input type="file" id="file-picker" class="file-picker-hidden" multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          onchange="XinBaoDemo.onFilesPicked(this)" />
        ${activeChips}
        <textarea id="chat-input" class="composer-textarea" rows="1" placeholder="${composerPlaceholder(sess, state)}"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey&&!XinBaoDemo.isStreaming()){event.preventDefault();XinBaoDemo.send()}"
          oninput="XinBaoDemo.setInput(this.value,this)">${escapeHtml(state.ui.chatInput)}</textarea>
        <div class="composer-bottom">
          <div class="composer-pills">
            <button type="button" class="composer-pill composer-pill-icon" onclick="XinBaoDemo.pickFile()" title="上传附件" aria-label="上传附件">
              ${icon("attach")}
              ${attachBadge}
            </button>
            <button type="button" id="composer-cite-trigger" class="composer-pill ${menuOpen === "cite" ? "active" : ""}" onclick="XinBaoDemo.openComposerMenu('cite')" title="引用资料" aria-haspopup="listbox" aria-expanded="${menuOpen === "cite"}">
              ${icon("link", "icon--sm")}
              <span>引用</span>
            </button>
            <button type="button" id="composer-skill-trigger" class="composer-pill ${menuOpen === "skill" ? "active" : ""}" onclick="XinBaoDemo.openComposerMenu('skill')" aria-haspopup="listbox" aria-expanded="${menuOpen === "skill"}">
              ${icon("zap", "icon--sm")}
              <span>技能</span>
            </button>
            ${showExpertPill ? renderExpertSelector(state) : ""}
          </div>
          <button type="button" class="${sendBtnClass}" onclick="${sendBtnOnClick}" title="${sendBtnTitle}" aria-label="${sendBtnTitle}">
            ${icon(isStreaming ? "stop" : "send", "icon--lg")}
          </button>
        </div>
      </div>
    </div>
    <p class="xb-chat-ai-disclaimer chat-ai-disclaimer">内容由 AI 生成，请注意甄别</p>
  `;
}

function renderPendingAttachments(sess) {
  const pending = sess?.pendingAttachments || [];
  if (!pending.length || sess?.saved) return "";
  return h`
    <div class="composer-pending-files">
      ${pending.map(f => h`
        <span class="composer-pending-chip">
          <span class="composer-pending-name">${escapeHtml(f.name)}</span>
          <button type="button" class="composer-pending-remove" onclick="${jsCall("XinBaoDemo.removePendingAttachment", f.id)}" aria-label="移除附件">×</button>
        </span>
      `).join("")}
    </div>
  `;
}

function renderComposerMenu(state, { id = "", fixed = false } = {}) {
  const type = state.ui.composerMenu;
  if (!type) return "";
  let items = "";
  let title = "";
  if (type === "skill") {
    title = "选个技能，让我帮你做";
    items = SKILL_LIST.map(s => `
      <button type="button" class="composer-menu-item" onclick="${jsCall("XinBaoDemo.pickSkill", s.slash)}">
        <strong>/${escapeHtml(s.slash)}</strong>
        <span>${escapeHtml(s.desc)}</span>
      </button>
    `).join("");
  } else if (type === "cite") {
    title = "引用资料库";
    const all = [...MATERIALS_LIB, ...(state.userMaterials || [])];
    items = all.map(m => `
      <button type="button" class="composer-menu-item" onclick="${jsCall("XinBaoDemo.pickCite", m.id)}">
        <strong>${escapeHtml(m.title)}</strong>
        <span>${escapeHtml(m.type)}</span>
      </button>
    `).join("");
  }
  const fixedClass = fixed ? " composer-menu--fixed" : "";
  const idAttr = id ? ` id="${escapeHtml(id)}"` : "";
  return h`
    <div class="composer-menu${fixedClass}"${idAttr} role="listbox" aria-label="${escapeHtml(title)}">
      <div class="composer-menu-head">${escapeHtml(title)}</div>
      <div class="composer-menu-list">${items}</div>
    </div>
  `;
}

function scenarioItemLabel(item) {
  return typeof item === "string" ? item : item.label;
}

function scenarioItemDesc(item) {
  return typeof item === "string" ? "" : (item.desc || "");
}

function renderAllChatsPage(state) {
  if (!state.ui.allChatsOpen) return "";
  const chats = allSidebarChats(state);
  const buckets = [
    { key: "today", label: "今天" },
    { key: "week", label: "本周" },
    { key: "earlier", label: "更早" }
  ];
  return h`
    <div class="drawer-mask open all-chats-mask" onclick="if(event.target===this)XinBaoDemo.closeAllChats()">
      <div class="modal-box all-chats-modal" role="dialog" aria-modal="true">
        <header class="all-chats-head">
          <h2>全部对话</h2>
          <button type="button" class="preview-close" onclick="XinBaoDemo.closeAllChats()" aria-label="关闭">×</button>
        </header>
        <div class="all-chats-body">
          ${buckets.map(b => {
            const items = chats.filter(c => chatTimeBucket(c) === b.key);
            if (!items.length) return "";
            return h`
              <section class="all-chats-section">
                <h3>${escapeHtml(b.label)}</h3>
                <ul class="all-chats-list">
                  ${items.map(c => h`
                    <li class="all-chats-row">
                      <button type="button" class="all-chats-open" onclick="XinBaoDemo.closeAllChats();${chatOpenAction(c)}">
                        <span>${escapeHtml(c.label)}</span>
                        <em>${escapeHtml(c.time || "")}</em>
                      </button>
                      ${renderRowMenuTrigger(state, `allchat-${c.id}`, c.projectId ? "projectChat" : "chat", c.id, c.projectId)}
                    </li>
                  `).join("")}
                </ul>
              </section>
            `;
          }).join("")}
          ${!chats.length ? `<p class="find-hint">暂无对话</p>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderScenarioCatalogBody({ modal = false } = {}) {
  const workflowGroup = SCENARIO_ALL.find(g => g.category === "工作流");
  const workflowItem = workflowGroup?.items?.[0];
  const mainGroups = SCENARIO_ALL.filter(g => g.category !== "工作流");

  const renderCard = (item, featured = false) => {
    const label = scenarioItemLabel(item);
    const desc = scenarioItemDesc(item);
    const cardCls = featured
      ? "xb-scenario-card xb-scenario-card--featured"
      : "xb-scenario-card";
    return h`
      <button
        type="button"
        class="${cardCls}"
        title="${escapeHtml(desc)}"
        aria-label="${escapeHtml(label)}：${escapeHtml(desc)}"
        onclick="${jsCall("XinBaoDemo.runScenarioAction", label)}"
      >
        <span class="xb-scenario-card-main">
          <span class="xb-scenario-card-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
          ${desc ? `<span class="xb-scenario-card-desc" aria-hidden="true">${escapeHtml(desc)}</span>` : ""}
        </span>
        <span class="xb-scenario-card-arrow" aria-hidden="true">${icon("chevronRight", "icon--sm")}</span>
      </button>
    `;
  };

  const renderSection = (g) => h`
    <section class="xb-scenario-panel" id="scenario-sec-${escapeHtml(g.category)}" aria-labelledby="xb-scenario-panel-${escapeHtml(g.category)}">
      <header class="xb-scenario-panel-head">
        <h3 class="xb-scenario-section-title" id="xb-scenario-panel-${escapeHtml(g.category)}">
          <span class="xb-scenario-section-icon">${icon(SCENARIO_CATEGORY_ICONS[g.category] || "zap", "icon--sm")}</span>
          <span class="xb-scenario-section-name">${escapeHtml(g.category)}</span>
        </h3>
        <span class="xb-scenario-section-count">${g.items.length} 个场景</span>
      </header>
      <div class="xb-scenario-grid">
        ${g.items.map(item => renderCard(item)).join("")}
      </div>
    </section>
  `;

  const bodyCls = modal
    ? "xb-scenario-page-body xb-overlay-scrollbar scenario-modal-body"
    : "xb-scenario-page-body xb-overlay-scrollbar";

  return h`
    <div class="${bodyCls}">
      ${workflowItem ? h`
        <section class="xb-scenario-featured" aria-label="推荐工作流">
          <div class="xb-scenario-featured-badge">推荐工作流</div>
          ${renderCard(workflowItem, true)}
        </section>
      ` : ""}
      <div class="xb-scenario-catalog-columns">
        ${mainGroups.map((g) => renderSection(g)).join("")}
      </div>
    </div>
  `;
}

function renderScenariosView(state) {
  return renderScenarioCatalogBody();
}

function renderChainPage(state) {
  const selected = state.featureData?.chainCompanyId
    ? findChainCompany(state.featureData.chainCompanyId)
    : null;
  return h`
    ${buildChainView(escapeHtml, icon, jsCall, state, selected?.id ?? null)}
    ${selected ? renderChainDrawer(selected, escapeHtml, icon, jsCall) : ""}
  `;
}

function renderGraphPage(state) {
  return renderGraphView(escapeHtml, icon, jsCall, state);
}

function renderFinanceConfigPage(state) {
  return renderFinanceConfigView(escapeHtml, icon, jsCall, state);
}

function renderScenarioSheet(state) {
  if (!state.ui.scenarioOpen) return "";
  return h`
    <div class="drawer-mask open scenario-modal-mask" onclick="if(event.target===this)XinBaoDemo.closeScenario()">
      <div class="modal-box scenario-modal" role="dialog" aria-modal="true" aria-labelledby="scenario-modal-title">
        <header class="scenario-modal-head">
          <div>
            <h2 id="scenario-modal-title">全部场景</h2>
            <p class="scenario-modal-lead">技能与专家已配好，点选直接开始</p>
          </div>
          <button type="button" class="preview-close" onclick="XinBaoDemo.closeScenario()" title="关闭" aria-label="关闭">×</button>
        </header>
        ${renderScenarioCatalogBody({ modal: true })}
      </div>
    </div>
  `;
}

function renderWecomQr() {
  return h`
    <div class="wecom-qr-card">
      <div class="wecom-qr-placeholder" aria-label="企业微信二维码"></div>
      <p class="mini-meta">也可扫码加我们，沟通更快</p>
    </div>
  `;
}

/* ============================ 消息渲染 ============================ */

function battleSpeakerSideClass(label) {
  if (!label) return "host";
  if (String(label).startsWith("风险方")) return "red";
  if (String(label).startsWith("支持方")) return "blue";
  return "host";
}

function renderBattleSpeakerHeader(label) {
  if (!label) return "";
  const side = battleSpeakerSideClass(label);
  return `<div class="xb-message-speaker msg-speaker msg-speaker--${side}">${escapeHtml(label)}</div>`;
}

function renderMessage(m, index, state) {
  if (m.role === "user") {
    if (m.type === "text-with-files" && m.files?.length) {
      return h`
        <div class="xb-message-row chat-message-row xb-message-row--user chat-message-row--user">
          <div class="xb-message-body chat-message-body xb-message-body--user chat-message-body--user user-with-files">
            ${m.text ? `<div class="user-text">${escapeHtml(m.text)}</div>` : ""}
            <div class="user-files">
              ${m.files.map(f => `<span class="user-file-chip">${escapeHtml(f.name)}</span>`).join("")}
            </div>
          </div>
        </div>
      `;
    }
    if (m.type === "files" && m.files?.length) {
      return h`
        <div class="xb-message-row chat-message-row xb-message-row--user chat-message-row--user">
          <div class="xb-message-body chat-message-body xb-message-body--user chat-message-body--user user-files">
            ${m.files.map(f => `<span class="user-file-chip">${escapeHtml(f.name)}</span>`).join("")}
          </div>
        </div>
      `;
    }
    return `<div class="xb-message-row chat-message-row xb-message-row--user chat-message-row--user"><div class="xb-message-body chat-message-body xb-message-body--user chat-message-body--user">${escapeHtml(m.text)}</div></div>`;
  }
  const body = {
    text: () => {
      const speaker = m.speakerLabel || "";
      const citations = m.sourceCitations || [];
      const citeOnClickJs = (id) => jsCall("XinBaoDemo.openSourceCitation", index, id);
      const inner = renderPlainAgentText(m.text, citations, citeOnClickJs);
      const showCursor = m.streaming && String(m.text || "").trim().length > 0;
      const entryBriefLink = String(m.text || "").includes("生成入场分析")
        ? renderEntryBriefPanelLinkInline(state?.session)
        : "";
      const hasInlineMarkers = messageHasSourceCitationMarkers(m.text || "");
      const sourceBar = citations.length && !hasInlineMarkers
        ? renderMessageSourceBar(citations, citeOnClickJs)
        : "";
      const copyBtn = m.text
        ? `<button type="button" class="xb-message-copy-btn chat-message-copy-btn" onclick="${jsCall("XinBaoDemo.copyMessage", index)}" title="复制" aria-label="复制">${icon("copy", "icon--sm")}</button>`
        : "";
      return `<div class="xb-message-row chat-message-row xb-message-row--assistant chat-message-row--assistant">${renderBattleSpeakerHeader(speaker)}<div class="xb-message-body chat-message-body xb-message-body--assistant chat-message-body--assistant"><div class="xb-message-body__blocks"><div class="msg agent"><div class="agent-text-wrap">${inner}${showCursor ? '<span class="stream-cursor"></span>' : ""}</div>${entryBriefLink}</div>${sourceBar}</div></div><div class="xb-message-meta chat-message-meta xb-message-meta--assistant chat-message-meta--assistant">${copyBtn}</div></div>`;
    },
    "choice-card": () => renderChoiceCard(m, index),
    "risk-card": () => renderRiskCard(m),
    "materials-card": () => renderMaterialsCard(m),
    "finance-card": () => renderFinanceCard(m),
    "ocr-review-card": () => renderOcrReviewPanel(m.data),
    "finance-rules-card": () => renderFinanceRulesCard(m.data),
    "report-card": () => renderReportCard(m),
    "report-summary-card": () => renderReportSummaryCard(m),
    "report-update-prompt": () => renderReportUpdatePromptCard(m),
    "confirm-card": () => renderConfirmCard(m, index),
    "export-card": () => renderExportCard(m),
    "scenarios-card": () => renderScenariosCard(m, index),
    "experts-team": () => renderExpertsTeamCard(m),
    "panel-link": () => renderPanelLinkCard(m),
    "verify-hint": () => renderVerifyHint(m),
    "deliberation-card": () => renderDeliberationCard(m),
    "tool-status": () => {
      const phase = m.phase === "done" ? "done" : "running";
      return `<div class="msg agent tool-status tool-status--${phase}"><span class="tool-status-dot"></span><span class="tool-status-label">${escapeHtml(m.label || "正在查询 Finstep 公开数据")}</span></div>`;
    },
    "tool-run": () => {
      const steps = m.steps || [];
      if (!steps.length && !m.active) return "";
      const showConnecting = m.active && !steps.length;
      return `<div class="msg agent tool-run ${m.active ? "tool-run--active" : "tool-run--idle"}">
        <div class="tool-run-title">Finstep 数据检索</div>
        <ul class="tool-run-steps">
          ${steps.map((s) => `<li class="tool-run-step tool-run-step--${s.status || "pending"}"><span class="tool-run-step-dot"></span><span>${escapeHtml(s.label)}</span></li>`).join("")}
          ${showConnecting ? `<li class="tool-run-step tool-run-step--running"><span class="tool-run-step-dot"></span><span>正在连接分析服务…</span></li>` : ""}
        </ul>
      </div>`;
    },
    "agent-blocks": () => renderAgentBlocks(m, index),
  }[m.type || "text"]?.() || renderMessage({ ...m, type: "text" }, index, state);
  return body;
}

function renderPlainAgentText(text, citations = [], citeOnClickJs = null) {
  if (!text) return `<div class="agent-plain-text"></div>`;
  const citeCtx = citations.length && citeOnClickJs
    ? { citations, onClickJs: citeOnClickJs }
    : null;
  return `<div class="agent-md agent-plain-text xb-message-prose">${renderMarkdown(text, citeCtx)}</div>`;
}

function formatMd(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
}

function renderChipsRow(m, index) {
  if (m.resolved) return "";
  return "";
}

function renderChoiceCard(m, index) {
  if (m.resolved) return "";
  const choices = m.data?.choices || [];
  return h`
    <div class="msg agent">
      <div class="choice-card-row">
        ${choices.map(c => h`
          <button type="button" class="chip choice-chip" onclick="${jsCall("XinBaoDemo.sendChip", c.action, index)}">${escapeHtml(c.label)}</button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderExpertsTeamCard(m) {
  const members = m.data?.members || [];
  return h`
    <div class="msg agent">
      <p>${escapeHtml(m.text || "尽调专家团队已组建：")}</p>
      <div class="artifact team-card">
        ${members.map(x => h`
          <div class="team-member">
            <span class="team-icon">${resolveIcon(x.iconKey || x.icon, "users")}</span>
            <div class="team-info"><strong>${escapeHtml(x.role)}</strong><span>${escapeHtml(x.task)}</span></div>
            <span class="team-status ${x.done ? "done" : "doing"}">${x.done ? "完成 " + escapeHtml(x.result || "") : "分析中…"}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderDeliberationCard(m) {
  const d = m.data || {};
  const perspectives = d.perspectives || [];
  const verdict = d.verdict || {};
  return h`
    <div class="msg agent deliberation-wrap">
      ${d.topic ? `<p class="deliberation-topic">议题：${escapeHtml(d.topic)}</p>` : ""}
      ${perspectives.map(p => h`
        <div class="deliberation-panel deliberation-panel--${p.role === "风控方" ? "risk" : "bull"}">
          <div class="deliberation-panel-head">${escapeHtml(p.role)}${p.expert ? ` · ${escapeHtml(p.expert)}` : ""}</div>
          <div class="deliberation-panel-body">${escapeHtml(p.text)}</div>
        </div>
      `).join("")}
      ${verdict.text ? h`
        <div class="deliberation-panel deliberation-panel--verdict">
          <div class="deliberation-panel-head">${escapeHtml(verdict.role || "综合裁定")}</div>
          <div class="deliberation-panel-body">${escapeHtml(verdict.text)}${verdict.rating ? `<div class="deliberation-rating">推荐值：${escapeHtml(verdict.rating)}</div>` : ""}</div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderVerifyHint() {
  return h`
    <div class="msg agent msg-verify-hint">
      <p class="verify-hint-line">
        <span class="verify-hint-label">公开数据难以核实的问题，可</span>
        <button type="button" class="verify-hint-link" onclick="${jsCall("XinBaoDemo.goExpertBooking")}">约专家访谈</button>
        <span class="verify-hint-sep">·</span>
        <button type="button" class="verify-hint-link" onclick="${jsCall("XinBaoDemo.go", "journalist")}">一线调研</button>
      </p>
    </div>
  `;
}

function renderPanelLinkCard(m) {
  const d = m.data || {};
  const batchActions = d.kind === "batch-eval"
    ? h`
      <div class="panel-actions">
        <button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.downloadBatchEval")}">下载评估结果</button>
        <button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.saveBatchEvalToMaterials")}">保存到资料库</button>
        <button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.downloadList")}">下载原始名单</button>
      </div>
    `
    : "";
  return h`
    <div class="msg agent">
      <div class="artifact panel-link" onclick="${jsCall("XinBaoDemo.openPanel", d.kind)}">
        <span class="panel-link-icon">${panelIcon(d)}</span>
        <div class="panel-link-info"><strong>${escapeHtml(d.title || "查看详情")}</strong><span>${escapeHtml(d.desc || "点击在右侧查看")}</span></div>
        <span class="panel-link-arrow">${icon("chevronRight", "icon--md")}</span>
      </div>
      ${batchActions}
    </div>
  `;
}

function renderScenariosCard(m, index) {
  if (m.resolved) return "";
  const items = m.data?.items || SCENARIO_ITEMS;
  return h`
    <div class="msg agent">
      <div class="scenario-grid">
        ${items.map(item => h`
          <button type="button" class="scenario-card" onclick="XinBaoDemo.runScenario('${escapeHtml(item.id)}', ${index})">
            <span class="scenario-card-label">${escapeHtml(item.title)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderRiskCard(m) {
  const rows = m.data?.risks || [];
  const title = m.data?.title || "公开风险";
  return h`
    <div class="msg agent">
      ${title ? `<p class="artifact-title">${escapeHtml(title)}</p>` : ""}
      <div class="artifact">
        <table>
          <thead><tr><th>维度</th><th>结果</th></tr></thead>
          <tbody>
            ${rows.map(r => h`
              <tr><td>${escapeHtml(r.dim)}</td>
              <td><span class="tag ${r.ok ? "ok" : "warn"}">${escapeHtml(r.result)}</span></td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMaterialsCard(m) {
  const files = m.data?.files || [];
  return h`
    <div class="msg agent">
      <p>${escapeHtml(m.text || "")}</p>
      <div class="artifact">
        <ul class="file-chips">${files.map(f => `<li>${escapeHtml(f.name)}</li>`).join("")}</ul>
        ${m.data?.note ? `<p class="artifact-foot">${escapeHtml(m.data.note)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderOcrReviewPanel(data) {
  const d = data || {};
  const unmatched = d.unmatched || [];
  return h`
    <div class="artifact finance-ocr-review">
      <h4>试算平衡复核</h4>
      <p class="mini-meta">${escapeHtml(d.fileName || "财报")} · 已识别 ${d.autoMapped || 0}/${d.total || 0} 科目 · ${d.balanced ? "平衡" : "差额 " + (d.diff || 0)}</p>
      ${unmatched.length ? `<table class="admin-table"><thead><tr><th>PDF科目</th><th>映射至</th><th>置信度</th></tr></thead><tbody>
        ${unmatched.map((u) => `<tr><td>${escapeHtml(u.raw_name)}</td><td>${escapeHtml(u.standard_name)}</td><td>${Math.round((u.confidence || 0) * 100)}%</td></tr>`).join("")}
      </tbody></table>` : ""}
      <button type="button" class="btn-mini primary" onclick="XinBaoDemo.confirmFinanceOcr()">确认并开始分析</button>
    </div>`;
}

function renderFinanceRulesCard(results) {
  const d = results || {};
  const rules = d.rulesTriggered || [];
  return h`
    <div class="artifact finance-rules-card">
      <h4>规则引擎</h4>
      <ul>${rules.map((r) => `<li class="${r.passed ? "ok" : "warn"}">${escapeHtml(r.msg || r.name)}</li>`).join("")}</ul>
    </div>`;
}

function renderFinanceCard(m) {
  const d = m.data || {};
  return h`
    <div class="msg agent">
      <p>${escapeHtml(m.text || "")}</p>
      <div class="artifact">
        <div class="stat-row">
          ${(d.highlights || []).map(x => h`<div class="stat"><span>${escapeHtml(x.label)}</span><strong>${escapeHtml(x.value)}</strong></div>`).join("")}
        </div>
        ${d.watch ? `<div class="callout warn">${escapeHtml(d.watch)}</div>` : ""}
        ${d.summary ? `<p class="artifact-foot">${escapeHtml(d.summary)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderReportCard() {
  return "";
}

function renderReportSummaryCard(m) {
  const d = m.data || {};
  const s = d.summary || {};
  const gapTotal = (s.sectionGaps || 0) + (s.citeGaps || 0);
  const isUpdate = !!d.updateNote;
  return h`
    <div class="msg agent">
      <div class="artifact report-summary-card">
        <h4 class="report-summary-title">${escapeHtml(d.reportLabel || "报告")} ${escapeHtml(d.version || "")} ${isUpdate ? "已更新" : "已生成"}</h4>
        ${d.template ? `<p class="mini-meta">使用模板：${escapeHtml(d.template)}</p>` : ""}
        <ul class="report-summary-stats">
          <li>已完成章节：${s.completedSections || 0}/${s.totalSections || 0}</li>
          ${gapTotal ? `<li>正文待补充：${gapTotal} 处</li>` : `<li>正文材料已覆盖主要章节</li>`}
          ${isUpdate ? `<li>本版更新：${escapeHtml(d.updateNote)}</li>` : ""}
        </ul>
        <p class="report-summary-hint">正文中 <span class="report-needs-material">红色</span> 为待补充材料${isUpdate ? `，<span class="report-is-updated">蓝色</span> 为本版更新` : ""}；点击角标 <sup class="report-cite-wrap"><span class="report-cite-ref report-cite-ref--static">1</span></sup> 可查看来源。完整内容在右侧面板。</p>
        <div class="report-summary-actions">
          <button type="button" class="btn-mini primary" onclick="XinBaoDemo.openPanel('report')">查看报告</button>
          <button type="button" class="btn-mini" onclick="XinBaoDemo.export()">导出 Word</button>
        </div>
      </div>
    </div>
  `;
}

function renderReportUpdatePromptCard(m) {
  const d = m.data || {};
  const files = d.fileNames || [];
  const sections = d.affectedSections || [];
  return h`
    <div class="msg agent">
      <div class="artifact report-update-prompt-card">
        ${files.length ? `<p>已上传 <strong>${escapeHtml(files.join("、"))}</strong></p>` : ""}
        <p>检测到本项目已有报告${d.reportLabel ? `「${escapeHtml(d.reportLabel)}」` : ""}（${escapeHtml(d.reportVersion || "当前版本")}），新材料可能补充以下章节（更新后将用<span class="report-is-updated">蓝色</span>标注）：</p>
        <ul class="report-update-sections">
          ${sections.map(sec => `<li>${escapeHtml(sec)}</li>`).join("")}
        </ul>
        <div class="report-summary-actions">
          <button type="button" class="btn-mini" onclick="XinBaoDemo.dismissReportUpdate()">暂不更新</button>
          <button type="button" class="btn-mini primary" onclick="XinBaoDemo.confirmReportUpdateFromPrompt()">更新报告</button>
        </div>
      </div>
    </div>
  `;
}

function formatToolInputPreview(input) {
  if (!input) return "";
  try {
    const obj = JSON.parse(input);
    return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(" · ");
  } catch {
    return String(input).slice(0, 120);
  }
}

function renderAgentToolBlock(b, m, msgIndex) {
  const needsMcpConfirm = Boolean(m?.awaitingConfirm) && b.callState === "asking";
  const state = needsMcpConfirm
    ? "asking"
    : (b.resultState === "running" || b.callState === "pending" || b.callState === "allowed" ? "running" : "done");
  const expanded = b.expanded || needsMcpConfirm;
  const inputLine = formatToolInputPreview(b.input);
  const outputHtml = b.output
    ? `<pre class="agent-tool-output">${escapeHtml(b.output)}</pre>`
    : (state === "running" ? `<p class="muted">正在检索…</p>` : "");
  const toggleBtn = b.output
    ? `<button type="button" class="agent-tool-toggle" onclick="${jsCall("XinBaoDemo.toggleAgentToolBlock", msgIndex, b.id)}">${expanded ? "收起" : "展开"}结果</button>`
    : "";

  let confirmHtml = "";
  if (needsMcpConfirm) {
    confirmHtml = `
      <div class="agent-tool-confirm">
        <p>数据服务需要你确认一项选择后继续：</p>
        <div class="confirm-actions">
          <button type="button" class="btn-yes" onclick="${jsCall("XinBaoDemo.confirmAgentTool", msgIndex, b.id, true)}">确认执行</button>
          <button type="button" class="btn-no" onclick="${jsCall("XinBaoDemo.confirmAgentTool", msgIndex, b.id, false)}">取消</button>
        </div>
      </div>`;
  }

  return `
    <div class="agent-block agent-block--tool agent-tool--${state}">
      <div class="agent-tool-head">
        <span class="agent-tool-dot agent-tool-dot--${state}"></span>
        <strong class="agent-tool-label">${escapeHtml(b.label || "查询 Finstep 公开数据")}</strong>
        ${inputLine ? `<span class="agent-tool-args muted">${escapeHtml(inputLine)}</span>` : ""}
        ${toggleBtn}
      </div>
      ${expanded && outputHtml ? `<div class="agent-tool-body">${outputHtml}</div>` : ""}
      ${confirmHtml}
    </div>`;
}

function renderAgentBlocks(m, index) {
  const citations = m.sourceCitations?.length
    ? m.sourceCitations
    : collectSourceCitationsFromAgentBlocks(m.blocks || []);
  const citeOnClickJs = (id) => jsCall("XinBaoDemo.openSourceCitation", index, id);
  const parts = [];
  let combinedText = "";
  for (const b of m.blocks || []) {
    if (b.type === "text") {
      if (!b.text && !b.streaming) continue;
      combinedText += b.text || "";
      const inner = renderPlainAgentText(b.text || "", citations, citeOnClickJs);
      const showCursor = m.streaming && b.streaming && String(b.text || "").trim().length > 0;
      parts.push(`<div class="agent-block agent-block--text"><div class="agent-text-wrap">${inner}${showCursor ? '<span class="stream-cursor"></span>' : ""}</div></div>`);
    } else if (b.type === "tool") {
      parts.push(renderAgentToolBlock(b, m, index));
    }
  }
  if (!parts.length && m.streaming) {
    parts.push(`<div class="agent-block agent-block--text muted">正在连接 Finstep 分析服务…</div>`);
  }
  const hasInlineMarkers = messageHasSourceCitationMarkers(combinedText);
  const sourceBar = citations.length && !hasInlineMarkers
    ? renderMessageSourceBar(citations, citeOnClickJs)
    : "";
  const copyBtn = combinedText.trim()
    ? `<button type="button" class="xb-message-copy-btn chat-message-copy-btn" onclick="${jsCall("XinBaoDemo.copyMessage", index)}" title="复制" aria-label="复制">${icon("copy", "icon--sm")}</button>`
    : "";
  return `<div class="xb-message-row chat-message-row xb-message-row--assistant chat-message-row--assistant">
    <div class="xb-message-body chat-message-body xb-message-body--assistant chat-message-body--assistant">
      <div class="xb-message-body__blocks">
        <div class="msg agent agent-blocks">${parts.join("")}</div>
        ${sourceBar}
      </div>
    </div>
    <div class="xb-message-meta chat-message-meta xb-message-meta--assistant chat-message-meta--assistant">${copyBtn}</div>
  </div>`;
}

function renderConfirmCard(m, index) {
  if (m.resolved) return "";
  const d = m.data || {};
  return h`
    <div class="msg agent">
      <p>这一项我不太确定，请你拍板：</p>
      <div class="artifact confirm-box">
        <strong>${escapeHtml(d.field)}</strong>
        <p>${escapeHtml(d.value)}</p>
        <p class="muted">来源：<span class="${sourceChipClass(d.source)}">${escapeHtml(d.source)}</span></p>
        <div class="confirm-actions">
          <button class="btn-yes" onclick="XinBaoDemo.confirmPending(${index})">确认写入报告</button>
          <button class="btn-no" onclick="XinBaoDemo.rejectPending(${index})">不对，我改天补材料</button>
          <button class="btn-link" onclick="${jsCall("XinBaoDemo.showSource", d.source)}">看原文</button>
        </div>
      </div>
    </div>
  `;
}

function renderExportCard(m) {
  return h`
    <div class="msg agent">
      <p>${escapeHtml(m.text || "报告段落已整理好。")}</p>
      <div class="artifact">
        <button class="btn-download" onclick="XinBaoDemo.export()">下载 Word 初稿（Mock）</button>
        <p class="artifact-foot">含来源标注与人工确认记录。</p>
      </div>
    </div>
  `;
}

function renderDrawer(state) {
  const d = state.ui.drawer;
  if (!d) return "";
  return h`
    <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeDrawer()">
      <div class="drawer-panel">
        <header><strong>${escapeHtml(d.title)}</strong><button onclick="XinBaoDemo.closeDrawer()">×</button></header>
        <div class="drawer-body">${d.html}</div>
      </div>
    </div>
  `;
}

function renderModal(state) {
  const m = state.ui.modal;
  if (!m) return "";

  if (m.type === "project-collab") {
    const projectId = m.data?.projectId;
    const proj = (state.projectList || []).find(p => p.id === projectId);
    const candidates = (state.orgMembers || ORG_MEMBERS).filter(om =>
      om.dept === proj?.dept
      && !(proj?.members || []).some(pm => memberId(pm) === om.id)
    );
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>邀请项目成员</h2>
          <p class="modal-hint">${escapeHtml(proj?.name || "")} · 被邀请成员可见本项目；项目内共享的是文件产出，不是会话。</p>
          <label>从本部门选择同事</label>
          <select id="proj-invite-user" class="modal-select">
            ${candidates.length
              ? candidates.map(c => h`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} · ${escapeHtml(c.team || c.dept)}</option>`).join("")
              : `<option value="">暂无可邀请同事</option>`}
          </select>
          <label style="margin-top:12px">项目内角色</label>
          <select id="proj-invite-role" class="modal-select">
            <option value="analyst">参与分析师</option>
            <option value="compliance">合规复核</option>
            <option value="readonly">只读</option>
          </select>
          <button type="button" class="btn-mini primary" style="margin-top:12px"
            onclick="XinBaoDemo.inviteMember('${escapeHtml(projectId)}', document.getElementById('proj-invite-user').value, document.getElementById('proj-invite-role').value)">发送邀请</button>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">关闭</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "add-monitor") {
    const prefillProject = m.data?.projectId || "";
    const editId = m.data?.editId || "";
    const editing = (state.userMonitors || []).find(r => r.id === editId);
    const prefillNL = m.data?.prefillNL || editing?.userDefinedRisk?.condition || "";
    const projects = visibleProjects(state.projectList || [], state.currentUser);
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>${editId ? "编辑预警条件" : "新建预警条件"}</h2>
          <p class="modal-hint">选项目，用一句话说清什么变化算需要你出手。系统会对照尽调里的投前假设一起记。</p>
          <input type="hidden" id="mon-edit-id" value="${escapeHtml(editId)}" />
          <label>关联项目</label>
          <select id="mon-project" class="modal-select">
            <option value="">不关联项目</option>
            ${projects.map(p => h`
              <option value="${escapeHtml(p.id)}" ${(prefillProject || editing?.projectId) === p.id ? "selected" : ""}>${escapeHtml(p.name)}</option>
            `).join("")}
          </select>
          <label>盯什么（自然语言）</label>
          <textarea id="mon-nl" rows="3" placeholder="例如：单一客户收入占比超过 40% 就提醒我">${escapeHtml(prefillNL)}</textarea>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button class="btn-send" onclick="XinBaoDemo.submitMonitor()">${editId ? "保存修改" : "设为预警条件"}</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "upload-template") {
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>上传报告模板</h2>
          <p class="modal-hint">选择模板文件（.docx、.doc、.md、.xlsx、.xls、.csv 等），并用一句话说明适用场景，便于在不同尽调任务中选用。</p>
          <label>模板文件</label>
          <div class="modal-file-mock">
            <span class="mini-meta">Demo 将模拟选择：尽调报告模版.docx</span>
          </div>
          <label>使用场景（一句话）</label>
          <textarea id="tpl-scenario" rows="2" placeholder="尽调报告撰写"></textarea>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button class="btn-send" onclick="XinBaoDemo.submitUploadTemplate()">上传</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "skill-wizard") {
    const w = state.ui.skillWizard || { step: 0, draft: {} };
    const step = w.step;
    const draft = w.draft || {};
    const steps = ["名称与分类", "自然语言描述", "可见范围"];
    let body = "";
    if (step === 0) {
      body = h`
        <label for="sw-name">技能名称</label>
        <input id="sw-name" class="modal-select" value="${escapeHtml(draft.name || "")}" placeholder="例如：关联交易识别" />
        <label for="sw-category" style="margin-top:12px">分类</label>
        <select id="sw-category" class="modal-select">
          ${["财务", "行业", "报告", "技能型"].map(c =>
            `<option value="${c}" ${draft.category === c ? "selected" : ""}>${c}</option>`
          ).join("")}
        </select>
      `;
    } else if (step === 1) {
      body = h`
        <label for="sw-desc">用自然语言描述这个技能做什么</label>
        <textarea id="sw-desc" rows="5" placeholder="例如：读取审计报告，自动标注关联方往来与异常科目…">${escapeHtml(draft.desc || "")}</textarea>
      `;
    } else {
      body = h`
        <label for="sw-scope">可见范围</label>
        <select id="sw-scope" class="modal-select">
          <option value="personal" ${draft.scope !== "team" ? "selected" : ""}>仅个人可见</option>
          <option value="team" ${draft.scope === "team" ? "selected" : ""}>团队共享</option>
        </select>
      `;
    }
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>新建技能 · 步骤 ${step + 1}/3</h2>
          <p class="modal-hint">${escapeHtml(steps[step])}</p>
          ${body}
          <div class="modal-actions">
            ${step > 0 ? `<button class="btn-ghost" onclick="XinBaoDemo.skillWizardBack()">上一步</button>` : `<button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>`}
            <button class="btn-send" onclick="XinBaoDemo.skillWizardNext()">${step < 2 ? "下一步" : "创建技能"}</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "expert-wizard") {
    const w = state.ui.expertWizard || { step: 0, draft: {} };
    const step = w.step;
    const draft = w.draft || {};
    const steps = ["名称与领域", "挂载技能", "可见范围"];
    const allSkills = [
      ...PLATFORM_SKILLS_CATALOG.map(s => ({ id: s.id, name: s.name })),
      ...(state.customSkillDefs || []).map(s => ({ id: s.id, name: s.name }))
    ];
    let body = "";
    if (step === 0) {
      body = h`
        <label for="ew-name">专家名称</label>
        <input id="ew-name" class="modal-select" value="${escapeHtml(draft.name || "")}" placeholder="例如：医疗器械注册专家" />
        <label for="ew-domain" style="margin-top:12px">领域描述</label>
        <textarea id="ew-domain" rows="3" placeholder="擅长领域、背景与能力边界…">${escapeHtml(draft.domain || "")}</textarea>
      `;
    } else if (step === 1) {
      body = h`
        <p class="modal-hint">选择要挂载到此专家的技能（可多选）</p>
        <div class="wizard-skill-checks">
          ${allSkills.map(s => {
            const on = (draft.skills || []).includes(s.id);
            return h`
              <label class="wizard-check-row">
                <input type="checkbox" class="ew-skill-check" value="${escapeHtml(s.id)}" ${on ? "checked" : ""} />
                <span>${escapeHtml(s.name)}</span>
              </label>
            `;
          }).join("")}
        </div>
      `;
    } else {
      body = h`
        <label for="ew-scope">可见范围</label>
        <select id="ew-scope" class="modal-select">
          <option value="personal" ${draft.scope !== "team" ? "selected" : ""}>仅个人可见</option>
          <option value="team" ${draft.scope === "team" ? "selected" : ""}>团队共享</option>
        </select>
      `;
    }
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>新建 AI 专家 · 步骤 ${step + 1}/3</h2>
          <p class="modal-hint">${escapeHtml(steps[step])}</p>
          ${body}
          <div class="modal-actions">
            ${step > 0 ? `<button class="btn-ghost" onclick="XinBaoDemo.expertWizardBack()">上一步</button>` : `<button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>`}
            <button class="btn-send" onclick="XinBaoDemo.expertWizardNext()">${step < 2 ? "下一步" : "创建 AI 专家"}</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "reporter-request") {
    const prefillCompany = m.data?.company ?? state.session?.company ?? "";
    const prefillQuestions = m.data?.questions ?? "";
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>新建调研需求</h2>
          <p class="modal-hint">实地调研出报告。填写想核实的问题，留下联系方式，我们会与你联系。</p>
          <label>目标企业</label>
          <input id="jr-company" placeholder="苏州某某科技有限公司" value="${escapeHtml(prefillCompany)}" />
          <label>想核实的问题</label>
          <textarea id="jr-questions" rows="4" placeholder="例如：产能利用率是否如 BP 所述？核心客户合同是否已签署？">${escapeHtml(prefillQuestions)}</textarea>
          <label>联系方式（手机 / 微信）</label>
          <input id="jr-contact" placeholder="便于我们回联" />
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button class="btn-send" onclick="XinBaoDemo.submitReporterRequest()">提交申请</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "expert-detail") {
    const ex = m.data?.expert || {};
    const skills = ex.skills || [];
    const skillPaths = ex.skill_paths || [];
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide expert-detail-modal">
          <div class="expert-detail-head">
            <h2>${escapeHtml(ex.name || "专家")}</h2>
          </div>
          <p class="modal-hint">${escapeHtml(ex.field || ex.capabilities || "")}</p>
          <div class="expert-detail-section">
            <h4>专家简介</h4>
            <p>${escapeHtml(ex.summary || ex.field || "暂无简介")}</p>
          </div>
          <div class="expert-detail-section">
            <h4>擅长能力</h4>
            <p>${escapeHtml(ex.capabilities || ex.field || "")}</p>
          </div>
          ${skills.length ? h`
            <div class="expert-detail-section">
              <h4>关联技能</h4>
              <div class="expert-skill-tags">${skills.map((s) => `<span class="mini-tag">${escapeHtml(s)}</span>`).join("")}</div>
            </div>
          ` : ""}
          ${skillPaths.length ? h`
            <div class="expert-detail-section">
              <h4>能力包来源</h4>
              <ul class="expert-skill-paths">${skillPaths.map((p) => `<li><code>${escapeHtml(p)}</code></li>`).join("")}</ul>
            </div>
          ` : ""}
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">关闭</button>
            <button class="btn-send" onclick="XinBaoDemo.closeModal();${jsCall("XinBaoDemo.summonExpert", ex.id || ex.frontend_id)}">召唤专家</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "expert-book") {
    const expert = m.data?.expert || MEETING_EXPERTS[0];
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>${escapeHtml(expert.name)} · ${escapeHtml(expert.field)}</h2>
          <p class="modal-hint">${escapeHtml(expert.capabilities || expert.bg || "")}</p>
          <label>想了解的问题 / 领域</label>
          <textarea id="eb-topic" rows="4" placeholder="例如：想了解航司 MRO 采购逻辑和竞争格局"></textarea>
          <label>联系方式（手机 / 微信）</label>
          <input id="eb-contact" placeholder="你的手机或微信" />
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button class="btn-send" onclick="XinBaoDemo.submitExpertBook()">提交预约</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "expert-match") {
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>专家需求</h2>
          <p class="modal-hint">描述你想咨询的问题和期望的专家背景，提交后为你匹配合适人选。</p>
          <label>想了解的问题 / 领域</label>
          <textarea id="em-topic" rows="3" placeholder="例如：半导体设备国产化验证"></textarea>
          <label>专家背景偏好（可选）</label>
          <input id="em-pref" placeholder="例如：产业一线 10 年以上" />
          <label>联系方式（手机 / 微信）</label>
          <input id="em-contact" placeholder="你的手机或微信" />
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button class="btn-send" onclick="XinBaoDemo.submitExpertMatch()">提交需求</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "contact-submitted") {
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box">
          <h2>${escapeHtml(m.data?.title || "已收到")}</h2>
          <p class="modal-hint">${escapeHtml(m.data?.message || "已收到，会有专人与你联系")}</p>
          ${renderWecomQr()}
          <div class="modal-actions">
            <button class="btn-send" onclick="XinBaoDemo.closeModal()">好的</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "move-chat") {
    const chatId = m.data?.chatId;
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box">
          <h2>移动到项目</h2>
          <label>选择目标项目</label>
          <select id="move-chat-project" class="modal-select">
            ${(state.projectList || []).map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join("")}
          </select>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button class="btn-send" onclick="${jsCall("XinBaoDemo.confirmMoveChat", chatId)}">确认移动</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "report-no-template") {
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>未检测到报告模板</h2>
          <p class="modal-hint">将使用标准报告结构生成。建议上传贵司模板，可生成更符合内部规范的报告。</p>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.goUploadReportTemplate()">上传模板后再生成</button>
            <button class="btn-send" onclick="XinBaoDemo.useStandardReportTemplate()">使用标准模板生成</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "report-template-select") {
    const templates = m.data?.templates || [];
    const reportType = m.data?.reportType || "";
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>选择${reportType || "报告"}模板</h2>
          <p class="modal-hint">资料库中有 ${templates.length} 个${reportType || ""}模板，请选择一个用于本次撰写。</p>
          <div class="template-select-list">
            ${templates.map(t => h`
              <button type="button" class="template-select-item" onclick="${jsCall("XinBaoDemo.selectReportTemplate", t.id)}">
                <strong>${escapeHtml(t.title)}</strong>
                <span class="template-scenario">${escapeHtml(t.scenario || "未填写使用场景")}</span>
                <span class="mini-meta">${escapeHtml(t.date || "")}</span>
              </button>
            `).join("")}
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "report-template-confirm") {
    const tpl = m.data?.template || {};
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide">
          <h2>确认使用模板</h2>
          <div class="template-confirm-box">
            <p><strong>使用模板：</strong>${escapeHtml(tpl.title || "")}</p>
            <p class="template-scenario">适用场景：${escapeHtml(tpl.scenario || "未填写")}</p>
            <p class="modal-hint">将根据此模板结构生成报告，缺少材料支撑的部分会用红色标注。若当前对话未绑定企业，确认后将提示输入目标企业全称。</p>
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">更换模板</button>
            <button class="btn-send" onclick="${jsCall("XinBaoDemo.confirmReportTemplate", tpl.id)}">开始生成</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type === "meeting-materials") {
    const sess = state.session;
    const draft = state.ui.meetingMaterialsDraft || {};
    const reportDocs = sess?.reports?.length ? sess.reports : [];
    const activeDoc = reportDocs.find(r => r.id === draft.reportDocId) || reportDocs[reportDocs.length - 1];
    const versions = activeDoc?.reportVersions || sess?.reportVersions || [];
    const materials = sess?.materials || [];
    const selected = new Set(draft.selectedFileIds || []);
    const generated = new Set(draft.generatedDocs || ["summary", "qna"]);
    const citeCount = (matId) => {
      const mat = materials.find(x => x.id === matId);
      if (!mat) return 0;
      const latest = versions.find(v => v.v === draft.reportVersion) || versions[versions.length - 1];
      return (latest?.fields || []).filter(f => f.source && mat.name && f.source.includes(mat.name.replace(/\.\w+$/, "").slice(0, 4))).length;
    };
    return h`
      <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
        <div class="modal-box modal-wide meeting-materials-modal">
          <h2>准备投委会材料包</h2>
          <div class="meeting-materials-section">
            <label class="meeting-materials-required">主报告（必选）</label>
            ${reportDocs.length > 1 ? h`
              <select class="modal-select" onchange="XinBaoDemo.setMeetingReportDoc(this.value)">
                ${reportDocs.map(r => h`
                  <option value="${escapeHtml(r.id)}" ${r.id === activeDoc?.id ? "selected" : ""}>${escapeHtml(r.label)}</option>
                `).join("")}
              </select>
            ` : `<p class="mini-meta">${escapeHtml(activeDoc?.label || "报告")}</p>`}
            <select class="modal-select" onchange="XinBaoDemo.setMeetingReportVersion(this.value)">
              ${versions.map(v => h`
                <option value="${escapeHtml(v.v)}" ${v.v === draft.reportVersion ? "selected" : ""}>${escapeHtml(formatReportVersionLabel(v))}</option>
              `).join("")}
            </select>
          </div>
          <div class="meeting-materials-section">
            <label>选择附件材料</label>
            <div class="meeting-materials-list">
              ${materials.map(mat => {
                const cites = citeCount(mat.id);
                return h`
                  <label class="meeting-material-row ${cites >= 2 ? "is-recommended" : ""}">
                    <input type="checkbox" ${selected.has(mat.id) ? "checked" : ""} onchange="XinBaoDemo.toggleMeetingMaterial('${mat.id}')" />
                    <span>${escapeHtml(mat.name)}</span>
                    ${cites ? `<span class="meeting-material-hint">报告引用 ${cites} 次，建议附上</span>` : ""}
                  </label>
                `;
              }).join("")}
            </div>
          </div>
          <div class="meeting-materials-section">
            <label>自动生成</label>
            <label class="meeting-material-row">
              <input type="checkbox" ${generated.has("summary") ? "checked" : ""} onchange="XinBaoDemo.toggleMeetingGeneratedDoc('summary')" />
              <span>投委会汇报摘要（1 页）</span>
            </label>
            <label class="meeting-material-row">
              <input type="checkbox" ${generated.has("qna") ? "checked" : ""} onchange="XinBaoDemo.toggleMeetingGeneratedDoc('qna')" />
              <span>风险问答清单</span>
            </label>
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button class="btn-send" onclick="XinBaoDemo.exportMeetingPackage()">导出 ZIP（Mock）</button>
          </div>
        </div>
      </div>
    `;
  }

  if (m.type !== "create") return "";
  return h`
    <div class="drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeModal()">
      <div class="modal-box modal-box--save-project" role="dialog" aria-labelledby="save-project-title">
        <h2 id="save-project-title">创建尽调项目</h2>
        <p class="modal-hint">填写企业全称即可建档；创建后将进入该项目的新会话。</p>
        <form class="modal-form" onsubmit="event.preventDefault();XinBaoDemo.createProject();">
          <label for="f-company">企业全称</label>
          <input
            id="f-company"
            name="company"
            placeholder="苏州某某科技有限公司"
            autocomplete="organization"
            required
            oninput="XinBaoDemo.syncProjectNameFromCompany()"
          />
          <label for="f-name">项目名称（可选）</label>
          <input id="f-name" name="name" placeholder="不填则自动生成" autocomplete="off" oninput="XinBaoDemo.onProjectNameInput()" />
          <div class="modal-actions">
            <button type="button" class="btn-ghost" onclick="XinBaoDemo.closeModal()">取消</button>
            <button type="submit" class="btn-send">创建</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * 个人中心：积分余额 + 可购积分套餐（我的套餐）+ 最近消耗
 * 无免费次数权益、无各功能单价说明；扣费在 actions.spendCredits 直接执行
 */
function renderAccountModal(state) {
  if (!state.ui.accountModalOpen) return "";
  const acct = state.userAccount || {};
  const isPrivate = state.deploymentMode === "private";
  const mode = state.deploymentMode || "saas";
  return h`
    <div class="drawer-mask open account-modal-mask" onclick="if(event.target===this)XinBaoDemo.closeAccount()">
      <div class="modal-box account-modal">
        <div class="account-modal-head">
          <div class="account-profile">
            <span class="account-avatar-lg">${escapeHtml((state.currentUser?.avatar || acct.avatar || "U").slice(0, 2))}</span>
            <div>
              <strong>${escapeHtml(state.currentUser?.name || acct.name || "用户")}</strong>
              <span class="mini-meta">${escapeHtml(acct.org || "")}${acct.dept ? ` · ${escapeHtml(acct.dept)}` : ""}${acct.team ? ` · ${escapeHtml(acct.team)}` : ""}</span>
              <span class="mini-meta">${isPrivate ? "登录：机构 SSO（Demo 占位）" : "登录：账号密码（Demo 占位）"}</span>
            </div>
          </div>
          <button type="button" class="preview-close" onclick="XinBaoDemo.closeAccount()" title="关闭">×</button>
        </div>

        <div class="account-modal-body">
          <section class="account-credits">
            ${isPrivate ? h`
              <div class="account-credit-main">
                <span>部门本月用量</span>
                <strong>${escapeHtml(String(acct.deptUsedCredits ?? 0))} / ${escapeHtml(String(acct.deptQuotaCredits ?? 0))}</strong>
              </div>
              <div class="account-credit-sub">
                <span>机构池剩余 ${escapeHtml(String(acct.orgPoolCredits ?? 0))} 积分当量</span>
              </div>
            ` : h`
              <div class="account-credit-main">
                <span>当前积分</span>
                <strong>${escapeHtml(String(acct.credits ?? 0))}</strong>
              </div>
              <div class="account-credit-sub">
                <span>本月消耗 ${escapeHtml(String(acct.monthSpent ?? 0))}</span>
              </div>
            `}
          </section>

          <div class="account-modal-columns">
            <section class="account-section account-deploy-mode">
              <h4>部署形态（Demo）</h4>
              <div class="deploy-mode-toggle">
                <button type="button" class="deploy-mode-btn ${mode === "saas" ? "on" : ""}" onclick="XinBaoDemo.setDeploymentMode('saas')">SaaS</button>
                <button type="button" class="deploy-mode-btn ${mode === "private" ? "on" : ""}" onclick="XinBaoDemo.setDeploymentMode('private')">私有化</button>
              </div>
              ${isPrivate ? `<p class="mini-meta">私有化：隐藏套餐购买，仅展示机构/部门用量；公开数据与财联社标注需机构数据源接入。</p>` : ""}
            </section>

            <section class="account-section">
              <h4>模拟身份（Demo）</h4>
              <p class="mini-meta">切换员工 / 团队领导 / 部门领导，验证项目可见范围与邀请权限。</p>
              <select class="modal-select" onchange="if(this.value)XinBaoDemo.switchDemoUser(this.value)">
                ${DEMO_USER_IDENTITIES.map(u => h`
                  <option value="${escapeHtml(u.id)}" ${state.currentUser?.id === u.id ? "selected" : ""}>${escapeHtml(u.label)}</option>
                `).join("")}
              </select>
            </section>

            <section class="account-section account-org-edition">
              <div class="org-edition-card">
                <div>
                  <strong>${escapeHtml(acct.orgEdition?.label || "机构版")}</strong>
                  <p class="mini-meta">${escapeHtml(acct.orgEdition?.hint || "团队协作与机构模板")}</p>
                </div>
                <button type="button" class="btn-mini primary" onclick="XinBaoDemo.showOrgEdition()">${escapeHtml(acct.orgEdition?.cta || "了解机构版")}</button>
              </div>
            </section>
          </div>

          ${isPrivate ? "" : h`
          <section class="account-section account-packages">
            <h4>我的套餐</h4>
            <div class="credit-packages">
              ${(acct.packages || []).map(pkg => h`
                <button type="button" class="credit-package" onclick="${jsCall("XinBaoDemo.recharge", pkg.id)}">
                  <strong>${pkg.credits} 积分</strong>
                  <span>${pkg.label}</span>
                  <em>¥${pkg.price}</em>
                </button>
              `).join("")}
            </div>
          </section>
          `}

          <section class="account-section account-history-section">
            <h4>最近消耗</h4>
            <ul class="account-history">
              ${(acct.history || []).slice(0, 5).map(rec => h`
                <li><span>${escapeHtml(rec.date)} · ${escapeHtml(rec.action)}</span><em>${rec.credits > 0 ? "+" : ""}${rec.credits}</em></li>
              `).join("")}
            </ul>
          </section>
        </div>

        <div class="modal-actions account-actions">
          <button class="btn-ghost" onclick="XinBaoDemo.logout()">退出登录</button>
          <button class="btn-send" onclick="XinBaoDemo.closeAccount()">关闭</button>
        </div>
      </div>
    </div>
  `;
}

function renderToast(state) {
  return `<div class="toast ${state.ui.toast ? "show" : ""}">${escapeHtml(state.ui.toast)}</div>`;
}
