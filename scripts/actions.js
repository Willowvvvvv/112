/**
 * actions.js — 财跃启明星 Demo 交互与产品编排
 * 版本：v7.14.2-20260627
 *
 * 约定：
 * - update(msg) = toast + 全量 rerender（无虚拟 DOM）
 * - s() = 当前 session；项目材料在 session.materials，侧栏项目在 state.projectList
 *
 * 积分：spendCredits 仅路由到业务流程，Demo 不扣费、不弹提示
 * 对话与项目均可写报告、导出；「存为项目」为可选归档，非前置条件
 * 路由：location.hash → app.js onHash → openProject / openSession / go 等
 */
import { setToast, openModal, closeModal, closeDrawer } from "./state.js";
import { findSessionFile } from "./session-files-v1.0-20260627.js";
import {
  isOnProjectRoute,
  isProjectBoundSession,
  isHomeChatSession,
  isProjectHubState,
  standaloneChatHash,
} from "./chat-route-v1.0-20260627.js";
import {
  findChainCompany,
  buildChainPositionPrompt,
  getDefaultChainFilters,
  normalizeChainFilters,
} from "./chain-demo-v1.0-20260629.js";
import {
  PROJECT_LIST,
  RECENT_ITEMS,
  DEMO_PROJECT,
  LEASE_DEMO_PROJECT,
  createSession,
  homeWelcome,
  ENTITY_MOCK,
  RISK_MOCK,
  FINANCE_MOCK,
  OCR_RESULT_DEMO,
  FINANCE_ANALYSIS_RESULT,
  REPORT_MOCK,
  REPORT_SECTIONS,
  guessCompany,
  extractCompanyFromQuestion,
  looksLikeMultiCompanyList,
  buildInvestmentAnswer,
  buildExamineCompanySegments,
  buildRiskScanResponse,
  guessFileType,
  normalizeFileCategory,
  EVIDENCE,
  SCENARIO_ITEMS,
  DUE_DILIGENCE_FLOW,
  COMPANY_SEARCH_RESULT,
  BATCH_EVAL_RESULT,
  formatBatchEvalDocument,
  batchEvalToCsvRows,
  MY_TEMPLATES,
  PRELIMINARY_MOCK,
  getPreliminaryMock,
  RED_BLUE_MOCK,
  RADAR_FEED,
  POLICY_FEED,
  STAR_BRIEFING,
  SECTOR_WEEKLY,
  SECTOR_OPTIONS,
  QNA_TARGETS,
  SIMILAR_COMPANIES,
  MATERIALS_LIB,
  ORG_TEMPLATE_LIBRARY,
  MEETING_NOTES_LIB,
  MEETING_EXPERTS,
  REPORTER_EXPERTS,
  JOURNALIST,
  STAR_DATA,
  MY_AVATAR,
  EXPERT_LIST,
  getChatExpertOptions,
  getChatExpertById,
  getSelectedExpertIdsFromState,
  getBattleTeamsFromState,
  getDefaultExpertSelection,
  DEFAULT_EXPERT_ID,
  setPlatformExpertsForPicker,
  RESPONSE_STYLE_OPTIONS,
  DEFAULT_RESPONSE_STYLE,
  getResponseStyleById,
  SKILL_LIST,
  SCENARIO_ALL,
  SCENARIO_LABELS,
  getComposerChipConfig,
  DEPRECATED_SCENARIO_LABELS,
  DELIBERATION_MOCK,
  POST_MONITOR,
  INDUSTRY_ANALYSIS,
  PROJECT_WATCH_PROFILE,
  CREDIT_COSTS,
  FILE_CATEGORIES,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_ORG_REGISTRY,
  CURRENT_USER,
  ORG_MEMBERS,
  getOrgMember,
  getDemoUser,
  fileAuthorMeta,
  visibleProjects,
  memberId,
  PROJ_ROLE_LABELS,
  guessReportAffectedSections,
  normalizeReportSections,
  cloneReportSections,
  sectionPlainText,
  getSectionSourceRefs,
  getUserReportTemplates,
  STANDARD_REPORT_TEMPLATE,
  getReportContentForTemplate,
  getReportShortLabel,
  sessionHasReports
} from "../data/mock-data.js";
import {
  findPlatformSkill,
  findPlatformConnector,
  PLATFORM_SKILLS_CATALOG,
} from "../data/capability-market-catalog-v1.0-20260701.js";
import { buildEntryBrief } from "./entry-brief-demo-v1.0-20260628.js";
import { collectSourceCitationsFromAgentBlocks } from "./source-citations-demo-v1.0-20260629.js";
import { sourceHtml } from "./source-html.js";
import { REPORT_PANEL_DEFAULT_WIDTH } from "./layout-constants.js";
import { positionComposerPopovers } from "./composer-popovers.js";
import { syncExpertPopover, teardownExpertPopover } from "./expert-dropdown-v1.0-20260627.js";
import { bindScenarioTooltips, hideScenarioTooltip } from "./scenario-tooltip.js";
import { createAgentscopeBridge } from "./agentscope-bridge-v1.0-20260627.js";
import { loadAgentscopeManifest } from "./agentscope-config-v1.0-20260627.js";
import { buildLivePrompt, suggestContextTags } from "./live-intent-v1.0-20260627.js";
import {
  BATTLE_COMPOSER_HINT,
  BATTLE_MAX_ROUNDS,
  buildBattleRoundPrompt,
  buildBattleSpeakerLabel,
  buildBattleVerdictPrompt,
  toggleExpertInBattleTeam,
  isBattleReadyFromTeams,
  getBattleStatusTextFromTeams,
} from "./expert-picker-battle-v1.0-20260627.js";
import { loadPlatformExperts, getPlatformExpertById } from "./platform-experts-v1.0-20260627.js";
import {
  isUserChatSession,
  buildRecentItemFromSession,
  scheduleChatPersistence,
  saveChatPersistence,
} from "./chat-persistence-v1.0-20260627.js";
import { scheduleProjectPersistence } from "./project-persistence-v1.0-20260628.js";
import { applySessionAutoTitle } from "./session-auto-title-v1.0-20260627.js";
import {
  findRadarNewsItem,
  fetchRadarInterpretation,
  fetchRadarItem,
  fetchRadarWeekly,
  loadRadarWeeklyIntoState,
  refreshRadarPage,
  syncRadarUserProfile,
} from "./radar-feed-v1.0-20260627.js";
import {
  saveStarMemoriesToStorage,
  loadStarMemoriesFromStorage,
  defaultStarMemories,
} from "./star-user-context-v1.0-20260627.js";
import {
  normalizeCachedSession,
  ensureSessionMessages,
} from "./session-normalize-v1.0-20260629.js";

import {
  MATERIALS_KB_DEMO,
  DEMO_SAVED_TARGET_LISTS,
  findSavedAiOutput,
} from "./materials-demo-v1.0-20260629.js";

let aiOutputMenuDocHandler = null;

function teardownAiOutputMenuDocClick() {
  if (!aiOutputMenuDocHandler) return;
  document.removeEventListener("click", aiOutputMenuDocHandler, true);
  aiOutputMenuDocHandler = null;
}

function syncAiOutputMenuDocClick(uiState, update) {
  teardownAiOutputMenuDocClick();
  if (!uiState.aiOutputMenuOpen) return;
  setTimeout(() => {
    if (!uiState.aiOutputMenuOpen) return;
    aiOutputMenuDocHandler = (e) => {
      const wrap = document.querySelector(".ai-output-header-wrap");
      if (wrap?.contains(e.target)) return;
      uiState.aiOutputMenuOpen = false;
      teardownAiOutputMenuDocClick();
      update();
    };
    document.addEventListener("click", aiOutputMenuDocHandler, true);
  }, 0);
}

const resolveScenarioLabel = (label) => DEPRECATED_SCENARIO_LABELS[label] || label;

function buildProjectNameFromCompany(company) {
  const short = String(company || "").replace(/(有限公司|股份有限公司|有限责任公司)$/, "").trim();
  return `${short} 尽调`;
}

function chainFiltersState(state) {
  const fd = state.featureData || {};
  if (!fd.chainFilters) {
    fd.chainFilters = getDefaultChainFilters();
    state.featureData = fd;
  }
  return normalizeChainFilters(fd.chainFilters);
}

function setChainFilters(state, patch) {
  const prev = chainFiltersState(state);
  state.featureData = {
    ...(state.featureData || {}),
    chainFilters: { ...prev, ...patch },
  };
}

function parseMonitorIntent(text, projectList) {
  let company = guessCompany(text) || "";
  let projectId = null;
  let projectName = "";
  const hit = (projectList || []).find(p =>
    (p.company && text.includes(p.company.slice(0, 4))) ||
    (p.name && /某公司|某生物医药|某微电子|某医疗/.test(text) && (
      (/某公司|某生物医药/.test(text) && /某生物医药/.test(p.name)) ||
      (/某微电子/.test(text) && /某微电子/.test(p.name)) ||
      (/某医疗/.test(text) && /某医疗/.test(p.name))
    ))
  );
  if (hit) {
    projectId = hit.id;
    projectName = hit.name;
    company = hit.company || company;
  }
  if (!company && /某公司|某生物医药/.test(text)) company = "苏州某生物医药科技有限公司";
  if (!company && /某微电子/.test(text)) company = "苏州某微电子科技有限公司";
  if (!company && /某医疗/.test(text)) company = "天津某医疗科技有限公司";
  if (!company && /某材料/.test(text)) company = "广州某材料科技股份有限公司";
  return {
    company: company || "待指定企业",
    projectId,
    projectName,
    change: "",
    userDefinedRisk: { dimension: "自定义", condition: text }
  };
}

let _scenarioTabObserver = null;
function bindScenarioTabObserver() {
  if (_scenarioTabObserver) { _scenarioTabObserver.disconnect(); _scenarioTabObserver = null; }
  const modal = document.querySelector(".scenario-modal");
  const body = modal?.querySelector(".scenario-modal-body");
  const tabs = Array.from(modal?.querySelectorAll(".scenario-tab") || []);
  if (!body || !tabs.length) return;
  _scenarioTabObserver = new IntersectionObserver(entries => {
    let hit = null;
    entries.forEach(e => { if (e.isIntersecting) hit = e.target.id; });
    if (hit) tabs.forEach(b => b.classList.toggle("on", b.dataset.target === hit));
  }, { root: body, threshold: 0.3 });
  body.querySelectorAll(".scenario-section[id]").forEach(s => _scenarioTabObserver.observe(s));
}

export function createActions(state, rerender) {
  const scroll = () => {
    requestAnimationFrame(() => {
      const el = document.getElementById("chat-scroll");
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const syncComposerSendButton = (inputValue) => {
    const streaming = !!state.ui.streaming;
    const btn = document.querySelector(".composer-send");
    if (!btn) return;
    if (streaming) {
      btn.classList.add("active", "composer-send--stop");
      btn.title = "停止";
      btn.setAttribute("aria-label", "停止");
      return;
    }
    btn.classList.remove("composer-send--stop");
    const text = (inputValue ?? state.ui.chatInput ?? "").trim();
    const sess = state.session;
    const pending = sess && !sess.saved ? (sess.pendingAttachments || []).length : 0;
    const canSend = !!text
      || pending > 0
      || !!state.ui.composerChip
      || (state.ui.composerFileRefs?.length > 0);
    btn.classList.toggle("active", canSend);
    btn.title = "发送";
    btn.setAttribute("aria-label", "发送");
  };

  const update = (msg) => {
    if (msg) setToast(state, msg);
    if (state.session) state.sessionCache[state.session.id] = state.session;
    scheduleChatPersistence({
      sessionCache: state.sessionCache,
      recentItems: state.recentItems,
    });
    scheduleProjectPersistence({
      projectList: state.projectList,
      sessionCache: state.sessionCache,
    });
    rerender();
    scroll();
    if (msg) {
      clearTimeout(window.__toast);
      window.__toast = setTimeout(() => { state.ui.toast = ""; rerender(); }, 2000);
    }
  };

  const s = () => state.session;

  const cu = () => state.currentUser || CURRENT_USER;

  const mkSession = (overrides = {}) => createSession(overrides, cu());

  const projectList = () => state.projectList || PROJECT_LIST;

  const findProject = (projectId) => projectList().find(p => p.id === projectId);

  /** 项目路由 #/p/... 与 #/chat/... 共用对话壳；view 可能短暂为 "p" */
  const isChatShellView = () => state.view === "chat" || state.view === "p";

  const normalizeChatShellView = () => {
    if (state.view === "p") state.view = "chat";
  };

  const pushUser = (textOrMsg) => {
    const sess = s();
    const messages = ensureSessionMessages(sess);
    const isFirstUser = !messages.some((m) => m.role === "user");
    if (typeof textOrMsg === "string") {
      messages.push({ role: "user", text: textOrMsg });
    } else {
      messages.push({ role: "user", ...textOrMsg });
    }
    touchRecentChatEntry(sess);
    if (isFirstUser) {
      const text = typeof textOrMsg === "string"
        ? textOrMsg
        : (textOrMsg.text || textOrMsg.label || "");
      void applySessionAutoTitle(sess, text, (title) => {
        sess.name = title;
        if (sess.projectId) {
          const proj = findProject(sess.projectId);
          const chat = proj?.chats?.find((c) => c.id === sess.id);
          if (chat) chat.label = title;
        }
        touchRecentChatEntry(sess);
        update();
      });
    }
  };

  const touchRecentChatEntry = (sess) => {
    if (!isUserChatSession(sess)) return;
    const entry = buildRecentItemFromSession(sess);
    const items = state.recentItems || [];
    state.recentItems = [entry, ...items.filter((r) => r.id !== sess.id)];
  };

  const pushAgent = (msg) => {
    ensureSessionMessages(s()).push({ role: "agent", ...msg });
  };

  const agentBridge = createAgentscopeBridge({
    state,
    getSession: s,
    pushAgent,
    rerender,
    scroll,
    setStreaming: (v) => {
      state.ui.streaming = v;
      if (v) state.ui._streamCancelled = false;
      syncComposerSendButton();
    },
  });

  /** 统一真 API 对话入口（无 mock 回退） */
  const agentTurn = (promptOrCtx, opts = {}) => {
    const sess = s();
    if (!sess) return Promise.resolve({ ok: false, error: "no_session" });
    const ctx = typeof promptOrCtx === "object"
      ? { session: sess, ...promptOrCtx }
      : { text: promptOrCtx, session: sess };
    if (!ctx.expertName && state.ui.activeExpertId) {
      const ex = getChatExpertById(state.ui.activeExpertId);
      if (ex?.name) ctx.expertName = ex.name;
    }
    const prompt = buildLivePrompt(ctx);
    return agentBridge.runLiveQuery(prompt, opts).then((res) => {
      if (res.ok) {
        const tags = opts.contextTags
          || (typeof promptOrCtx === "object"
            ? suggestContextTags(promptOrCtx.chatMode, promptOrCtx.chip?.label)
            : null);
        if (tags?.length) setContextTags(tags);
        if (sess.company) sess.flags.riskScanned = true;
      } else {
        setToast(state, res.error || "Finstep 分析服务暂不可用，请确认后端已启动");
      }
      update();
      return res;
    });
  };

  /** 深度调研 / 行业分析后：低调引导一线调研与专家核验闭环 */
  const pushVerifyHint = (company) => {
    pushAgent({
      type: "verify-hint",
      data: { company: company || s()?.company || "" }
    });
  };

  const ensureChatSession = () => {
    if (!state.session) {
      const sess = mkSession();
      state.session = sess;
      state.view = "chat";
      state.sessionId = sess.id;
      state.sessionCache[sess.id] = sess;
      window.location.hash = standaloneChatHash(sess);
    } else if (!isChatShellView()) {
      actions.newChat();
    } else {
      normalizeChatShellView();
      syncStandaloneChatHash();
    }
  };

  /** 首页 / 新对话选场景：保持独立会话，禁止沿用项目路由或项目会话 */
  const ensureHomeChatSession = () => {
    if (isOnProjectRoute() || isProjectBoundSession(state.session)) {
      actions.newChat();
      return;
    }
    if (!state.session) {
      const sess = mkSession();
      state.session = sess;
      state.view = "chat";
      state.sessionId = "new";
      state.sessionCache[sess.id] = sess;
      window.location.hash = "/chat/new";
      return;
    }
    state.view = "chat";
    normalizeChatShellView();
    const target = standaloneChatHash(state.session, { preferNew: true });
    if (window.location.hash !== `#${target}`) {
      window.location.hash = target;
    }
  };

  const syncStandaloneChatHash = () => {
    const sess = state.session;
    if (!sess || isProjectBoundSession(sess) || isOnProjectRoute()) return;
    const target = standaloneChatHash(sess);
    if (window.location.hash !== `#${target}`) {
      window.location.hash = target;
    }
  };

  const clearComposerContext = () => {
    state.ui.composerChip = null;
    state.ui.composerFileRefs = [];
    state.ui.composerHint = null;
    state.chatMode = null;
  };

  const formatComposerUserText = (text, chip, fileRefs) => {
    const parts = [];
    if (chip?.label) parts.push(`[${chip.label}]`);
    if (text) parts.push(text);
    if (fileRefs?.length) {
      parts.push(fileRefs.map(f => `+${f.name}`).join(" "));
    }
    return parts.join(" ").trim();
  };

  const pushDeliberationCard = (topic, company) => {
    const co = company || s()?.company || "";
    const topicLine = topic || (co ? `${co} 是否值得投资` : "当前项目");
    const d = DELIBERATION_MOCK;
    const selected = (state.ui.activeExpertIds || [])
      .map(id => getChatExpertById(id))
      .filter(Boolean);
    let perspectives;
    if (selected.length >= 2) {
      const domain = selected;
      const roles = ["看多方", "风控方", "补充视角", "补充视角"];
      perspectives = (domain.length ? domain : selected).slice(0, 4).map((e, i) => ({
        role: roles[i] || `视角 ${i + 1}`,
        expert: e.name,
        text: i === 0 ? d.bullish.text : i === 1 ? d.risk.text : `从${e.field}角度：${d.bullish.text.slice(0, 48)}…`
      }));
    } else {
      perspectives = [
        { role: d.bullish.role, expert: d.bullish.expert, text: d.bullish.text },
        { role: d.risk.role, expert: d.risk.expert, text: d.risk.text }
      ];
    }
    pushAgent({
      type: "deliberation-card",
      data: {
        topic: topicLine,
        company: co,
        perspectives,
        verdict: { role: d.verdict.role, text: d.verdict.text, rating: d.verdict.rating }
      }
    });
  };

  const runDeliberationFlow = (topic) => {
    const co = s()?.company || guessCompany(topic) || "";
    if (co) s().company = co;
    pushDeliberationCard(topic, co);
    setContextTags(["尽调报告", "风控预演", "多视角评审"]);
    update();
  };

  const extractLastAgentReplyText = (fromIndex = 0) => {
    const msgs = s()?.messages || [];
    for (let i = msgs.length - 1; i >= fromIndex; i--) {
      const m = msgs[i];
      if (m.role !== "agent") continue;
      if (m.type === "agent-blocks" && Array.isArray(m.blocks)) {
        return m.blocks
          .filter((b) => b.type === "text" && b.text)
          .map((b) => b.text)
          .join("\n")
          .trim();
      }
      if (m.text) return String(m.text).trim();
      break;
    }
    return "";
  };

  const prefixLastAgentSpeaker = (speakerLabel, fromIndex = 0) => {
    const label = String(speakerLabel || "").trim();
    if (!label) return;
    const msgs = s()?.messages || [];
    for (let i = msgs.length - 1; i >= fromIndex; i--) {
      const m = msgs[i];
      if (m.role !== "agent") continue;
      m.speakerLabel = label;
      if (m.type === "agent-blocks" && Array.isArray(m.blocks)) {
        const blocks = m.blocks.map((b) => {
          if (b.type !== "text" || !b.text) return b;
          const body = String(b.text).trim();
          if (body.startsWith(`${label}\n\n`)) {
            return { ...b, text: body.slice(label.length + 2).trimStart() };
          }
          if (body.startsWith(label)) {
            return { ...b, text: body.slice(label.length).trimStart() };
          }
          return b;
        });
        msgs[i] = { ...m, blocks };
        return;
      }
      if (m.text) {
        let body = String(m.text).trim();
        if (body.startsWith(`${label}\n\n`)) body = body.slice(label.length + 2).trimStart();
        else if (body.startsWith(label)) body = body.slice(label.length).trimStart();
        msgs[i] = { ...m, text: body };
        return;
      }
      break;
    }
  };

  /** 专家 Battle：红蓝各最多 4 人 · 最多 3 轮 · 小星裁定 */
  const runMultiExpertLive = async ({ text, redIds, blueIds, chatMode, chipLabel } = {}) => {
    const topic = (text || "").trim();
    const red = (redIds || []).filter(Boolean);
    const blue = (blueIds || []).filter(Boolean);
    if (!topic || !isBattleReadyFromTeams(red, blue)) return;

    const saved = {
      activeExpertId: state.ui.activeExpertId,
      activeExpertIds: [...(state.ui.activeExpertIds || [])],
      battleRedIds: [...(state.ui.battleRedIds || [])],
      battleBlueIds: [...(state.ui.battleBlueIds || [])],
    };
    state.ui.streaming = true;
    update();

    const transcript = [];
    const sides = [
      { side: "red", ids: red },
      { side: "blue", ids: blue },
    ];

    for (let round = 1; round <= BATTLE_MAX_ROUNDS; round++) {
      for (const { side, ids } of sides) {
        for (const id of ids) {
          const expert = getChatExpertById(id);
          if (!expert) continue;
          state.ui.activeExpertId = expert.id;
          const msgStart = s().messages.length;
          const speakerLabel = buildBattleSpeakerLabel(side, expert.name);

          const prompt = buildBattleRoundPrompt({
            side,
            round,
            expertName: expert.name,
            topic,
            transcript,
            chipLabel,
          });
          const res = await agentTurn({
            text: prompt,
            session: s(),
            expertName: expert.name,
            chatMode: chatMode || "redblue",
          });
          prefixLastAgentSpeaker(speakerLabel, msgStart);
          const replyText = extractLastAgentReplyText(msgStart);
          transcript.push({
            round,
            side,
            expertName: expert.name,
            text: replyText || (res.ok ? "（见上方回复）" : "（本专家暂未返回内容）"),
          });
        }
      }
    }

    const verdictPrompt = buildBattleVerdictPrompt(topic, transcript, chipLabel);
    const verdictStart = s().messages.length;
    await agentTurn({
      text: verdictPrompt,
      session: s(),
      expertName: "小星",
      chatMode: "redblue",
    });
    prefixLastAgentSpeaker("综合裁定 · 小星", verdictStart);
    const verdictText = extractLastAgentReplyText(verdictStart);

    const sess = s();
    if (sess?.id) state.sessionCache[sess.id] = sess;
    saveChatPersistence({
      sessionCache: state.sessionCache,
      recentItems: state.recentItems,
    });

    state.ui.activeExpertId = saved.activeExpertId;
    state.ui.activeExpertIds = saved.activeExpertIds;
    state.ui.battleRedIds = saved.battleRedIds;
    state.ui.battleBlueIds = saved.battleBlueIds;
    state.ui.streaming = false;

    const perspectives = transcript.map((t) => ({
      role: `第${t.round}轮 · ${buildBattleSpeakerLabel(t.side, t.expertName)}`,
      expert: t.expertName,
      text: t.text,
    }));

    pushAgent({
      type: "deliberation-card",
      data: {
        topic,
        company: s()?.company || "",
        perspectives,
        verdict: {
          role: "小星 · 综合裁定",
          text: verdictText || `已完成 ${BATTLE_MAX_ROUNDS} 轮红蓝对抗预演，详见上方辩论与裁定。`,
          rating: null,
        },
      },
    });
    update();
  };

  /** 立即执行、无需 composer pill 的 chip */
  const IMMEDIATE_CHIP_KEYS = new Set([
    "存为项目", "下载名单", "下载评估结果", "保存评估结果", "确认待核项",
    "导出 Word", "创建项目", "打开演示项目", "管理关注领域", "更新报告",
    "更新尽调报告", "上会材料打包", "给企业高管", "给行业专家",
    "约专家访谈", "约专家会诊", "约专家", "约行业专家",
    "一线调研", "深度尽调"
  ]);

  /**
   * 报告类入口判定：命中 mode:"report" 的 label 一律先弹模板选择窗。
   * 返回 { reportType }（reportType 可为 null=列全部模板），非报告 label 返回 null。
   */
  const reportEntryFor = (label) => {
    const cfg = getComposerChipConfig(label);
    if (cfg && cfg.mode === "report") return { reportType: cfg.reportType || null };
    return null;
  };

  const tryAutoExecChip = (label) => {
    const sess = s();
    if (!sess) return false;
    if (["公开风险速览", "查公开风险", "查一家公司风险", "关键人风险", "股权与实控", "快速初筛", "研判一家公司"].includes(label) && sess.company) {
      actions.doExamineCompany(sess.company);
      return true;
    }
    if (["查这家", "初步了解", "标的速览"].includes(label) && sess.company) {
      actions.doExamineCompany(sess.company);
      return true;
    }
    if (label === "查材料缺口" && sess.company) {
      actions.doGap();
      return true;
    }
    if (label === "一线调研" && sess.company) {
      actions._openJournalistRequestForCompany(sess.company);
      return true;
    }
    if (label === "整理材料" && sess.materials?.length) {
      actions.doMaterials();
      return true;
    }
    if (label === "风控预演" && sessionHasReports(sess)) {
      actions.doRiskQna();
      return true;
    }
    return false;
  };

  const resolveMessage = (index, action) => {
    const msgs = s().messages;
    if (index != null && msgs[index]?.role === "agent") {
      msgs[index].resolved = true;
      msgs[index].resolvedAction = action;
      return;
    }
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.role === "agent" && (m.type === "confirm-card" || m.type === "scenarios-card") && !m.resolved) {
        m.resolved = true;
        m.resolvedAction = action;
        return;
      }
    }
  };

  const getBatchEvalResult = () => state.featureData?.batchEvalResult || BATCH_EVAL_RESULT;

  /** v3: 流式输出 — 默认走真 API；仅 opts.uiOnly 为短提示动画 */
  const streamAgent = (segments, opts = {}) => {
    if (opts.uiOnly !== true) {
      const prompt = opts.prompt || (Array.isArray(segments) ? segments.join("\n\n") : String(segments));
      return agentTurn(prompt, opts);
    }
    const sess = s();
    if (!sess) return Promise.resolve();
    const segs = Array.isArray(segments) ? segments : [segments];
    const charMode = opts.charMode !== false;
    const delay = opts.delay ?? (charMode ? 18 : 400);
    state.ui._streamCancelled = false;

    pushAgent({ role: "agent", type: "text", text: "", streaming: true, markdown: false });
    const msgIndex = sess.messages.length - 1;
    state.ui.streaming = true;
    rerender();
    scroll();

    return new Promise((resolve) => {
      let segIdx = 0;
      let charIdx = 0;

      const tick = () => {
        if (state.ui._streamCancelled) {
          const msg = sess.messages[msgIndex];
          if (msg) {
            msg.streaming = false;
            msg.markdown = true;
            if (!String(msg.text || "").trim()) msg.text = "已中断。";
          }
          state.ui.streaming = false;
          syncComposerSendButton();
          rerender();
          scroll();
          resolve();
          return;
        }
        const msg = sess.messages[msgIndex];
        if (!msg) { resolve(); return; }

        const currentSeg = segs[segIdx] || "";
        if (charIdx < currentSeg.length) {
          const step = charMode ? 2 : currentSeg.length;
          msg.text = (msg.text || "") + currentSeg.slice(charIdx, charIdx + step);
          charIdx += step;
          rerender();
          scroll();
          setTimeout(tick, delay);
          return;
        }

        segIdx++;
        charIdx = 0;
        if (segIdx < segs.length) {
          msg.text = (msg.text || "") + "\n\n";
          setTimeout(tick, delay * 2);
          return;
        }

        msg.streaming = false;
        msg.markdown = true;
        state.ui.streaming = false;
        rerender();
        scroll();
        resolve();
      };

      setTimeout(tick, 200);
    });
  };

  /** v3: 专家团队逐个点亮动画 */
  const animateExpertsTeam = (text, members, onDone) => {
    const sess = s();
    const animatedMembers = members.map(m => ({ ...m, done: false, result: m.result || "分析中…" }));
    pushAgent({
      type: "experts-team",
      text,
      data: { members: animatedMembers, animating: true }
    });
    const msgIndex = sess.messages.length - 1;
    rerender();
    scroll();

    let idx = 0;
    const lightNext = () => {
      if (idx >= animatedMembers.length) {
        const msg = sess.messages[msgIndex];
        if (msg?.data) msg.data.animating = false;
        rerender();
        if (onDone) onDone();
        return;
      }
      const msg = sess.messages[msgIndex];
      if (msg?.data?.members?.[idx]) {
        msg.data.members[idx].done = true;
        msg.data.members[idx].result = members[idx].result || "完成";
      }
      rerender();
      scroll();
      idx++;
      setTimeout(lightNext, 1500);
    };
    setTimeout(lightNext, 800);
  };

  const setContextTags = (tags) => {
    state.ui.forceContextTags = tags;
    rerender();
  };

  const clearContextTags = () => {
    state.ui.forceContextTags = null;
  };

  const reportDateStamp = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const reportFileStamp = () => reportDateStamp().replace(/-/g, "");

  const ensureReportsMigrated = (sess) => {
    if (!sess) return;
    if (!sess.reports?.length && sess.reportVersions?.length) {
      const legacyId = "report-legacy";
      sess.reports = [{
        id: legacyId,
        templateId: sess.activeTemplateId || "tpl-default",
        templateName: sess.template || "标准报告结构",
        label: getReportShortLabel({ title: sess.template, scenario: "" }),
        reportVersions: sess.reportVersions,
        activeVersion: sess.activeVersion || sess.reportVersions[sess.reportVersions.length - 1]?.v
      }];
      sess.activeReportId = legacyId;
    }
  };

  const getSessionReports = (sess) => {
    ensureReportsMigrated(sess);
    return sess?.reports || [];
  };

  const getActiveReportDoc = (sess) => {
    const reports = getSessionReports(sess);
    if (!reports.length) return null;
    return reports.find(r => r.id === sess.activeReportId) || reports[reports.length - 1];
  };

  const syncLegacyReportFields = (sess, doc) => {
    if (!sess || !doc) return;
    const ver = doc.reportVersions?.find(v => v.v === doc.activeVersion)
      || doc.reportVersions?.[doc.reportVersions.length - 1];
    sess.reportVersions = doc.reportVersions;
    sess.activeVersion = doc.activeVersion;
    sess.template = doc.templateName;
    sess.activeTemplateId = doc.templateId;
    sess.reportFields = ver?.fields || [];
    sess.pendingField = sess.reportFields.find(r => !r.ok) || null;
    sess.flags.reportDone = getSessionReports(sess).length > 0;
  };

  const syncAllAiReports = (sess) => {
    if (!sess) return;
    const prevMap = new Map((sess.aiReports || []).map(r => [r.id, r]));
    sess.aiReports = [];
    getSessionReports(sess).forEach(doc => {
      (doc.reportVersions || []).forEach(version => {
        const fileId = `${doc.id}__${version.v}`;
        const prev = prevMap.get(fileId);
        const authorUser = doc.author
          ? { id: doc.author.id || doc.author.userId, name: doc.author.name }
          : cu();
        const meta = prev
          ? {
            author: prev.author,
            shareState: prev.shareState,
            sharedBy: prev.sharedBy,
            sharedAt: prev.sharedAt
          }
          : fileAuthorMeta(authorUser, "draft");
        sess.aiReports.push({
          id: fileId,
          reportDocId: doc.id,
          name: `${doc.label}_${version.v}_${reportFileStamp()}.docx`,
          category: "AI生成报告",
          isAIGenerated: true,
          generatedAt: version.date,
          version: version.v,
          label: doc.label,
          template: doc.templateName,
          basedOn: (sess.materials || []).map(m => m.id),
          ...meta
        });
      });
    });
  };

  const syncReportToFileTree = (sess, doc, version) => {
    if (!sess || !doc || !version) return;
    syncAllAiReports(sess);
  };

  const buildPreviewFromReportDoc = (sess, doc) => {
    if (!doc) return null;
    const ver = doc.reportVersions?.find(v => v.v === doc.activeVersion)
      || doc.reportVersions?.[doc.reportVersions.length - 1];
    return {
      reports: getSessionReports(sess),
      activeReportId: doc.id,
      reportVersions: doc.reportVersions,
      activeVersion: doc.activeVersion,
      fields: ver?.fields || [],
      sections: ver?.sections || REPORT_SECTIONS,
      template: doc.templateName,
      reportLabel: doc.label,
      company: sess?.company || ""
    };
  };

  const buildReportSummary = (fields, sections) => {
    const totalFields = fields.length;
    const okFields = fields.filter(f => f.ok).length;
    const gapFields = totalFields - okFields;
    const normalized = normalizeReportSections(sections);
    const sectionGaps = normalized.filter(sec => sec.gap).length;
    const citeGaps = normalized.reduce((n, sec) =>
      n + (sec.parts || []).filter(p => p.cite && p.cite.ok === false).length, 0);
    const completedSections = normalized.length - sectionGaps;
    return {
      totalFields,
      okFields,
      gapFields,
      sectionGaps,
      citeGaps,
      completedSections,
      totalSections: normalized.length
    };
  };

  const actions = {
    newChat() {
      const sess = createSession();
      state.session = sess;
      state.view = "chat";
      state.sessionId = "new";
      state.ui.projectHubId = null;
      state.sessionCache[sess.id] = sess;
      state.ui.chatInput = "";
      state.ui.composerHint = null;
      state.ui.composerChip = null;
      state.ui.composerFileRefs = [];
      state.ui.activeExpertId = null;
      state.ui.activeExpertIds = [];
      state.ui.multiExpertDiscussion = false;
      state.ui.expertMenuOpen = false;
      state.ui.composerMenu = null;
      state.ui.citedMaterial = null;
      state.ui.scenarioOpen = false;
      state.chatMode = null;
      state.responseStyle = DEFAULT_RESPONSE_STYLE;
      state.ui.responseStyleMenuOpen = false;
      state.ui.filesOpen = false;
      state.ui.previewOpen = false;
      state.ui.previewKind = null;
      clearContextTags();
      window.location.hash = `/chat/${sess.id}`;
      update();
    },

    /** 侧栏「首页」：已在首页则保持，否则进入空白首页会话 */
    goHome() {
      state.view = "chat";
      state.ui.projectHubId = null;
      if (isHomeChatSession(state.session) && !isOnProjectRoute()) {
        window.location.hash = "/chat/new";
        update();
        return;
      }
      actions.newChat();
    },

    openSession(id) {
      state.view = "chat";
      state.chatMode = null;
      if (id === "new") {
        actions.newChat();
        return;
      }
      if (id === "ephemeral-sample") {
        const riskDemo = buildRiskScanResponse("苏州某生物医药科技有限公司");
        const sess = createSession({
          id: "ephemeral-sample",
          company: "苏州某生物医药科技有限公司",
          flags: { riskScanned: true },
          messages: [
            { role: "user", text: "苏州某生物医药风险怎么样" },
            {
              role: "agent",
              type: "text",
              text: `${riskDemo.segments.join("\n\n")}\n\n当前在册失信记录：未发现⟦1⟧；历史立案信息需结合案由判断⟦2⟧。`,
              sourceCitations: [
                {
                  id: 1,
                  kind: "web",
                  title: "中国执行信息公开网",
                  snippet: "未发现当前在册失信被执行人记录",
                  url: "https://zxgk.court.gov.cn/",
                },
                {
                  id: 2,
                  kind: "web",
                  title: "中国裁判文书网",
                  snippet: "历史民事立案记录摘要",
                  url: "https://wenshu.court.gov.cn/",
                },
              ],
            },
            { role: "agent", type: "risk-card", data: { risks: riskDemo.risks, title: "公开风险" } }
          ]
        });
        state.session = sess;
        state.sessionId = id;
        state.sessionCache[id] = sess;
        window.location.hash = `/chat/${id}`;
        state.ui.filesOpen = false;
        update();
        return;
      }
      if (id === "chat-ephemeral-tinci") {
        const sess = createSession({
          id: "chat-ephemeral-tinci",
          company: "广州某材料科技股份有限公司",
          messages: [
            { role: "user", text: "某材料这家公司怎么样" },
            {
              role: "agent",
              type: "text",
              text: "某材料主营锂电材料，上市主体经营稳定。如需深度尽调，可上传 BP 或继续追问。"
            }
          ]
        });
        state.session = sess;
        state.sessionId = id;
        state.sessionCache[id] = sess;
        window.location.hash = `/chat/${id}`;
        state.ui.filesOpen = false;
        update();
        return;
      }
      const cached = state.sessionCache[id];
      if (cached) {
        state.session = normalizeCachedSession(JSON.parse(JSON.stringify(cached)));
        state.sessionId = id;
        const isProjectChat = cached.kind === "project" && cached.projectId;
        if (isProjectChat) {
          window.location.hash = `/p/${cached.projectId}/c/${id}`;
          state.ui.filesOpen = !!cached.saved;
        } else {
          state.ui.projectHubId = null;
          window.location.hash = `/chat/${id}`;
          state.ui.filesOpen = false;
          state.ui.previewOpen = false;
          state.ui.previewKind = null;
        }
        update();
        return;
      }
      actions.newChat();
    },

    openProjectChat(projectId, chatId) {
      state.view = "chat";
      state.chatMode = null;
      if (chatId === DEMO_PROJECT.id && projectId === DEMO_PROJECT.id) {
        actions.openProject(chatId);
        return;
      }
      if (chatId === "chat-bioray-risk" && projectId === "proj-bioray-001") {
        const riskDemo = buildRiskScanResponse("苏州某生物医药科技有限公司");
        const sess = createSession({
          id: "chat-bioray-risk",
          kind: "project",
          projectId: "proj-bioray-001",
          name: "公开风险扫描",
          company: "苏州某生物医药科技有限公司",
          saved: true,
          flags: { riskScanned: true },
          messages: [
            {
              role: "agent",
              type: "text",
              text: `这是 **某生物医药** 项目下的风险扫描对话。\n\n${riskDemo.segments.join("\n\n")}`
            },
            { role: "agent", type: "risk-card", data: { risks: riskDemo.risks, title: "公开风险" } }
          ]
        });
        actions._finishOpenProjectChat(sess, projectId, chatId);
        return;
      }
      const cached = state.sessionCache[chatId];
      if (cached) {
        const sess = normalizeCachedSession(JSON.parse(JSON.stringify(cached)));
        actions._finishOpenProjectChat(sess, projectId, chatId);
        return;
      }
      const project = PROJECT_LIST.find(p => p.id === projectId);
      const chatMeta = project?.chats?.find(c => c.id === chatId);
      if (chatId === projectId) {
        actions.openProject(projectId);
        return;
      }
      const sess = createSession({
        id: chatId,
        kind: "project",
        projectId,
        name: chatMeta?.label || project?.name || "项目对话",
        company: project?.company || "",
        saved: true,
        messages: [
          {
            role: "agent",
            type: "text",
            text: `已打开项目 **${project?.name || ""}** 下的对话：${chatMeta?.label || "新对话"}。`
          }
        ]
      });
      actions._finishOpenProjectChat(sess, projectId, chatId);
    },

    _hydrateProjectChatSession(sess, projectId) {
      if (!sess || !projectId) return sess;
      if (!sess.projectId) sess.projectId = projectId;
      const root = actions._getProjectRootSession(projectId);
      if (!root) return sess;
      if (!sess.company && root.company) sess.company = root.company;
      if (!sess.industry && root.industry) sess.industry = root.industry;
      if (!sess.materials?.length && root.materials?.length) {
        sess.materials = JSON.parse(JSON.stringify(root.materials));
      }
      if (!sess.aiReports?.length && root.aiReports?.length) {
        sess.aiReports = JSON.parse(JSON.stringify(root.aiReports));
      }
      return sess;
    },

    _finishOpenProjectChat(sess, projectId, chatId) {
      actions._hydrateProjectChatSession(sess, projectId);
      state.session = sess;
      state.sessionId = chatId;
      state.sessionCache[chatId] = sess;
      state.ui.filesOpen = true;
      state.ui.projectHubId = null;
      window.location.hash = `/p/${projectId}/c/${chatId}`;
      clearContextTags();
      update();
    },

    _startProjectChatFromHub(projectId, { welcome = false } = {}) {
      const proj = findProject(projectId) || PROJECT_LIST.find(p => p.id === projectId);
      if (!proj) return null;

      const chatId = `chat-${Date.now()}`;
      const seq = (proj.chats?.length || 0) + 1;
      const label = seq === 1 ? "新对话" : `新对话 ${seq}`;
      const meta = { id: chatId, label, time: "刚刚" };
      proj.chats = proj.chats || [];
      proj.chats.unshift(meta);
      proj.updated = "刚刚";

      const rootSess = actions._getProjectRootSession(projectId);
      const materials = rootSess?.materials?.length
        ? JSON.parse(JSON.stringify(rootSess.materials))
        : [];

      const welcomeMsg = welcome
        ? [{
            role: "agent",
            type: "text",
            text: `已新建 **${proj.name}** 下的会话。目标企业：**${proj.company || "未填写"}**。`
          }]
        : [];

      const sess = mkSession({
        id: chatId,
        kind: "project",
        projectId,
        name: label,
        company: proj.company || rootSess?.company || "",
        industry: proj.industry || rootSess?.industry || "",
        round: proj.round || rootSess?.round || "",
        manager: proj.manager || rootSess?.manager || cu().name,
        org: proj.org || rootSess?.org || cu().org || "",
        saved: true,
        materials,
        flags: {
          riskScanned: false,
          materialsParsed: false,
          financeDone: false,
          reportDone: false,
          pendingResolved: false,
          exported: false,
          savePromptDismissed: true
        },
        messages: welcomeMsg
      });

      state.session = sess;
      state.sessionId = chatId;
      state.sessionCache[chatId] = sess;
      state.view = "chat";
      state.chatMode = null;
      state.ui.projectHubId = null;
      state.ui.filesOpen = true;
      state.ui.previewOpen = false;
      state.ui.previewKind = null;
      state.ui.projectsExpanded = true;
      state.ui.rowMenu = null;
      window.location.hash = `/p/${projectId}/c/${chatId}`;
      return sess;
    },

    openProject(id) {
      window.location.hash = `/p/${id}`;
      state.view = "chat";
      state.sessionId = id;
      state.chatMode = null;
      state.ui.projectHubId = id;
      if (state.ui.activeExpertId && !getChatExpertOptions().some(e => e.id === state.ui.activeExpertId)) {
        const def = getDefaultExpertSelection();
        state.ui.activeExpertId = def.activeExpertId;
        state.ui.activeExpertIds = def.activeExpertIds;
      }

      const cacheRoot = (src) => {
        if (!state.sessionCache[id]) {
          state.sessionCache[id] = JSON.parse(JSON.stringify(src));
        }
        return state.sessionCache[id];
      };

      if (id === DEMO_PROJECT.id) {
        const root = cacheRoot(DEMO_PROJECT);
        state.session = createSession({
          id,
          kind: "project",
          projectId: id,
          name: root.name,
          company: root.company,
          industry: root.industry,
          round: root.round,
          manager: root.manager,
          org: root.org,
          saved: true,
          materials: root.materials ? JSON.parse(JSON.stringify(root.materials)) : [],
          aiReports: root.aiReports ? JSON.parse(JSON.stringify(root.aiReports)) : [],
          messages: []
        });
      } else if (id === LEASE_DEMO_PROJECT.id) {
        const root = cacheRoot(LEASE_DEMO_PROJECT);
        state.session = createSession({
          id,
          kind: "project",
          projectId: id,
          name: root.name,
          company: root.company,
          industry: root.industry,
          saved: true,
          materials: root.materials ? JSON.parse(JSON.stringify(root.materials)) : [],
          messages: []
        });
      } else {
        const meta = PROJECT_LIST.find(p => p.id === id);
        const rootSess = actions._getProjectRootSession(id);
        state.session = createSession({
          id,
          kind: "project",
          projectId: id,
          name: meta?.name || "项目",
          company: meta?.company || "",
          industry: meta?.industry || "",
          saved: true,
          materials: rootSess?.materials?.length
            ? JSON.parse(JSON.stringify(rootSess.materials))
            : [],
          messages: []
        });
      }
      state.sessionCache[state.session.id] = state.session;
      state.ui.filesOpen = !!(state.session.materials?.length);
      state.ui.previewOpen = false;
      state.ui.previewKind = null;
      state.ui.selectedFileId = null;
      state.ui.previewSourceKey = null;
      clearContextTags();
      update();
    },

    toggleProjects() {
      state.ui.projectsExpanded = !state.ui.projectsExpanded;
      update();
    },

    toggleChats() {
      state.ui.chatsExpanded = state.ui.chatsExpanded === false;
      update();
    },

    toggleProjectExpand(projectId) {
      const expanded = state.ui.projectExpandedMap[projectId] !== false;
      state.ui.projectExpandedMap[projectId] = !expanded;
      update();
    },

    /** 项目下新建独立会话（共享企业信息，材料继承自主会话） */
    newProjectChat(projectId) {
      actions._startProjectChatFromHub(projectId, { welcome: true });
      state.ui.chatInput = "";
      state.ui.composerHint = null;
      state.ui.composerMenu = null;
      clearContextTags();
      update();
    },

    _getProjectRootSession(projectId) {
      if (projectId === DEMO_PROJECT.id) {
        return state.sessionCache[projectId] || DEMO_PROJECT;
      }
      if (projectId === LEASE_DEMO_PROJECT.id) {
        return state.sessionCache[projectId] || LEASE_DEMO_PROJECT;
      }
      if (state.sessionCache[projectId]) return state.sessionCache[projectId];
      return Object.values(state.sessionCache).find(
        s => s?.projectId === projectId && (s?.materials?.length || s?.aiReports?.length)
      ) || null;
    },

    openCreateModal() {
      openModal(state, "create");
      update();
      requestAnimationFrame(() => {
        const sess = s();
        const companyEl = document.getElementById("f-company");
        const nameEl = document.getElementById("f-name");
        const company = sess?.company?.trim() || "";
        if (companyEl) companyEl.value = company;
        if (nameEl) {
          delete nameEl.dataset.userEdited;
          nameEl.value = sess?.company && !sess.saved
            ? buildProjectNameFromCompany(company)
            : "";
        }
        companyEl?.focus();
        companyEl?.select?.();
      });
    },

    syncProjectNameFromCompany() {
      const companyEl = document.getElementById("f-company");
      const nameEl = document.getElementById("f-name");
      if (!companyEl || !nameEl) return;
      const company = companyEl.value.trim();
      if (!company) return;
      if (!nameEl.dataset.userEdited) {
        nameEl.value = buildProjectNameFromCompany(company);
      }
    },

    onProjectNameInput() {
      const nameEl = document.getElementById("f-name");
      if (nameEl) nameEl.dataset.userEdited = nameEl.value.trim() ? "1" : "";
    },

    closeModal() {
      closeModal(state);
      update();
    },

    createProject() {
      const company = document.getElementById("f-company")?.value?.trim();
      if (!company) { update("请填写企业全称"); return; }
      const name = document.getElementById("f-name")?.value?.trim() || buildProjectNameFromCompany(company);
      const id = "proj-" + Date.now();
      const sess = s();
      const carry = sess && !sess.saved ? {
        materials: [...(sess.materials || [])],
        flags: { ...sess.flags },
        entityCard: sess.entityCard,
        riskItems: sess.riskItems,
        finance: sess.finance,
        reportFields: sess.reportFields,
        pendingField: sess.pendingField,
        messages: [...sess.messages]
      } : {};
      const entryBrief = buildEntryBrief(company, name);
      const rootSess = createSession({
        id,
        kind: "project",
        projectId: id,
        name,
        company,
        saved: true,
        materials: carry.materials || [],
        flags: carry.flags,
        entityCard: carry.entityCard,
        riskItems: carry.riskItems,
        finance: carry.finance,
        reportFields: carry.reportFields,
        pendingField: carry.pendingField,
        messages: [],
        entryBrief,
      });
      state.sessionCache[id] = rootSess;
      closeModal(state);
      const user = cu();
      const projEntry = {
        id,
        name,
        company,
        industry: "",
        round: "",
        manager: user.name,
        org: user.org || "某机构",
        dept: user.dept,
        team: user.team,
        updated: "刚刚",
        members: [{ id: user.id, name: user.name, projRole: "analyst" }],
        chats: []
      };
      if (!PROJECT_LIST.find(p => p.id === id)) {
        PROJECT_LIST.unshift(projEntry);
      }
      if (!state.projectList.find(p => p.id === id)) {
        state.projectList.unshift({
          ...projEntry,
          members: [...projEntry.members],
          chats: []
        });
      }
      state.recentItems = (state.recentItems || []).filter(r => r.kind !== "project");
      const chatSess = actions._startProjectChatFromHub(id, { welcome: false });
      if (chatSess) {
        chatSess.entryBrief = entryBrief;
        chatSess.messages = carry.messages?.length ? carry.messages : [
          {
            role: "agent",
            type: "text",
            text: entryBrief.assistantSummary
          }
        ];
        state.session = chatSess;
        state.sessionCache[chatSess.id] = chatSess;
      }
      state.ui.filesOpen = true;
      state.ui.projectsExpanded = true;
      state.ui.previewKind = "entry-brief";
      state.ui.previewData = entryBrief;
      state.ui.previewOpen = true;
      state.ui.rightPanelWidth = REPORT_PANEL_DEFAULT_WIDTH;
      clearContextTags();
      update("创建成功");
    },

    saveCurrentAsProject() {
      const sess = s();
      if (sess.saved) { update("当前已在项目中"); return; }
      if (!sess.company) {
        actions.openCreateModal();
        return;
      }
      actions.saveAsProject();
    },

    saveAsProject(msgIndex) {
      const sess = s();
      if (sess.saved) return;
      resolveMessage(msgIndex, "save");
      const company = sess.company || "未命名企业";
      const name = sess.name && sess.name !== "新对话"
        ? sess.name
        : `${company.replace(/有限公司$/, "")} 尽调`;
      const id = sess.projectId || "proj-" + Date.now();
      sess.kind = "project";
      sess.projectId = id;
      sess.id = id;
      sess.name = name;
      sess.company = company;
      sess.saved = true;
      state.sessionId = id;
      state.sessionCache[id] = sess;
      const prevId = sess.id;
      if (!PROJECT_LIST.find(p => p.id === id)) {
        const user = cu();
        const projEntry = {
          id,
          name,
          company,
          industry: sess.industry || "",
          round: sess.round || "",
          manager: sess.manager || user.name,
          org: sess.org || user.org,
          dept: user.dept,
          team: user.team,
          updated: "刚刚",
          members: [{ id: user.id, name: user.name, projRole: "analyst" }],
          chats: [{ id, label: name, time: "刚刚" }]
        };
        PROJECT_LIST.unshift(projEntry);
      } else {
        const proj = PROJECT_LIST.find(p => p.id === id);
        proj.updated = "刚刚";
        proj.chats = proj.chats || [];
        if (!proj.chats.find(c => c.id === id)) {
          proj.chats.unshift({ id, label: name, time: "刚刚" });
        }
      }
      state.recentItems = (state.recentItems || []).filter(r => r.id !== prevId && r.kind !== "project");
      state.ui.projectExpandedMap[id] = true;
      state.ui.filesOpen = true;
      state.ui.projectsExpanded = true;
      state.view = "chat";
      const newProj = PROJECT_LIST.find(p => p.id === id);
      if (newProj && state.projectList && !state.projectList.find(p => p.id === id)) {
        state.projectList.unshift({ ...newProj, members: [...(newProj.members || [])], chats: [...(newProj.chats || [])] });
      }
      window.location.hash = `/p/${id}`;
      update("创建成功");
    },

    dismissSave(msgIndex) {
      resolveMessage(msgIndex, "dismiss");
      update();
    },

    pushNextSteps() {
      rerender();
    },

    toggleSidebar() {
      state.ui.sidebarOpen = !state.ui.sidebarOpen;
      update();
    },

    toggleFiles() {
      state.ui.filesOpen = !state.ui.filesOpen;
      update();
    },

    /**
     * 右栏 / 雷达侧栏拖拽拉宽；宽度写入 ui.rightPanelWidth 并在 rerender 后保持
     */
    startPanelResize(e) {
      const panel = e.target.closest(".resizable-panel");
      if (!panel) return;
      const startX = e.clientX;
      const startWidth = panel.getBoundingClientRect().width;
      const minW = panel.classList.contains("report-pane") ? 480 : 260;
      const maxW = panel.classList.contains("report-pane")
        ? Math.min(Math.round(window.innerWidth * 0.72), 840)
        : Math.min(Math.round(window.innerWidth * 0.65), 720);

      const onMove = (ev) => {
        const w = Math.round(Math.min(maxW, Math.max(minW, startWidth + (startX - ev.clientX))));
        state.ui.rightPanelWidth = w;
        panel.style.width = `${w}px`;
        panel.style.maxWidth = `${w}px`;
        panel.style.flex = `0 0 ${w}px`;
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.classList.remove("is-panel-resizing");
        document.body.style.removeProperty("user-select");
        document.body.style.removeProperty("cursor");
      };

      document.body.classList.add("is-panel-resizing");
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },

    /**
     * 展开「可能感兴趣」时若资讯全文已开，先关 preview，避免右栏双面板叠层
     */
    toggleRadarInterests() {
      const opening = state.ui.radarInterestsOpen === false;
      state.ui.radarInterestsOpen = !state.ui.radarInterestsOpen;
      if (opening && state.view === "radar" && state.ui.previewOpen) {
        state.ui.previewOpen = false;
        state.ui.previewKind = null;
        state.ui.previewData = null;
      }
      update();
    },

    selectFile(fileId) {
      const hit = findSessionFile(fileId, s(), state);
      if (!hit || hit.collection !== "materials") return;
      state.ui.selectedFileId = fileId;
      state.ui.previewSourceKey = null;
      state.ui.previewKind = "file";
      state.ui.previewOpen = true;
      update();
    },

    removeFile(fileId) {
      const hit = findSessionFile(fileId, s(), state);
      const sess = hit?.ownerSession || s();
      const name = hit?.file?.name;
      if (!hit || hit.collection !== "materials") return;
      if (!confirm(`确定删除「${name || "该文件"}」？`)) return;
      sess.materials = (sess.materials || []).filter(m => m.id !== fileId);
      if (state.ui.selectedFileId === fileId) {
        state.ui.selectedFileId = null;
        state.ui.previewSourceKey = null;
        state.ui.previewOpen = false;
      }
      update(name ? `已删除 ${name}` : "已删除");
    },

    closePreview() {
      state.ui.previewOpen = false;
      state.ui.previewSourceKey = null;
      state.ui.previewKind = null;
      state.ui.previewData = null;
      state.ui.aiOutputMenuOpen = false;
      teardownAiOutputMenuDocClick();
      update();
    },

    applyEntryBriefStep(step) {
      const text = String(step || "").trim();
      if (!text) return;
      state.ui.chatInput = text;
      state.ui._restoreComposerFocus = true;
      update();
    },

    setInput(v, inputEl) {
      state.ui.chatInput = v;
      if (v.endsWith("/") && !state.ui.composerMenu) {
        state.ui.composerMenu = "skill";
        state.ui._restoreComposerFocus = true;
        update();
        return;
      }
      if (v.endsWith("@") && !state.ui.expertMenuOpen) {
        state.ui.chatInput = v.slice(0, -1);
        state.ui.expertMenuOpen = true;
        state.ui._restoreComposerFocus = true;
        update();
        return;
      }
      syncComposerSendButton(v);
      if (inputEl) {
        inputEl.style.height = "auto";
        inputEl.style.height = `${inputEl.scrollHeight}px`;
      }
    },

    openComposerMenu(type) {
      if (type === "expert") {
        actions.toggleExpertMenu();
        return;
      }
      state.ui.expertMenuOpen = false;
      state.ui.responseStyleMenuOpen = false;
      state.ui.composerMenu = state.ui.composerMenu === type ? null : type;
      update();
    },

    closeComposerMenu() {
      if (!state.ui.composerMenu) return;
      state.ui.composerMenu = null;
      update();
    },

    toggleExpertMenu() {
      state.ui.composerMenu = null;
      state.ui.responseStyleMenuOpen = false;
      state.ui.expertMenuOpen = !state.ui.expertMenuOpen;
      update();
    },

    closeExpertMenu() {
      if (!state.ui.expertMenuOpen) return;
      state.ui.expertMenuOpen = false;
      update();
    },

    toggleMultiExpertDiscussion(enabled) {
      const on = enabled !== undefined ? !!enabled : !state.ui.multiExpertDiscussion;
      state.ui.multiExpertDiscussion = on;
      const optionIds = new Set(getChatExpertOptions().map(e => e.id));
      const validIds = (ids) => (ids || []).filter(id => optionIds.has(id));
      if (on) {
        state.responseStyle = "multiReview";
        state.ui.battleRedIds = validIds(state.ui.battleRedIds);
        state.ui.battleBlueIds = validIds(state.ui.battleBlueIds);
        state.ui.battleActiveSide = state.ui.battleActiveSide || "red";
        state.ui.activeExpertIds = [...state.ui.battleRedIds, ...state.ui.battleBlueIds];
        state.ui.activeExpertId = state.ui.activeExpertIds[0] || null;
        if (!state.ui.composerHint) {
          state.ui.composerHint = BATTLE_COMPOSER_HINT;
        }
      } else {
        state.responseStyle = DEFAULT_RESPONSE_STYLE;
        const id = state.ui.activeExpertIds?.[0] || state.ui.activeExpertId;
        if (id && optionIds.has(id)) {
          state.ui.activeExpertId = id;
          state.ui.activeExpertIds = [id];
        } else {
          const def = getDefaultExpertSelection();
          state.ui.activeExpertId = def.activeExpertId;
          state.ui.activeExpertIds = def.activeExpertIds;
          state.ui.battleRedIds = def.battleRedIds;
          state.ui.battleBlueIds = def.battleBlueIds;
          state.ui.battleActiveSide = def.battleActiveSide;
        }
      }
      update();
    },

    clearExpertSelection() {
      const def = getDefaultExpertSelection();
      state.ui.activeExpertId = def.activeExpertId;
      state.ui.activeExpertIds = def.activeExpertIds;
      state.ui.battleRedIds = def.battleRedIds;
      state.ui.battleBlueIds = def.battleBlueIds;
      state.ui.battleActiveSide = def.battleActiveSide;
      state.ui.composerHint = null;
      if (!state.ui.multiExpertDiscussion) {
        state.responseStyle = DEFAULT_RESPONSE_STYLE;
      }
      update();
    },

    selectExpert(expertId) {
      const expert = getChatExpertById(expertId);
      if (!expert) return;
      state.ui.composerMenu = null;
      if (state.ui.multiExpertDiscussion) {
        const side = state.ui.battleActiveSide === "blue" ? "blue" : "red";
        const key = side === "red" ? "battleRedIds" : "battleBlueIds";
        const result = toggleExpertInBattleTeam(state.ui[key], expert.id);
        if (result.blocked) {
          state.ui.composerHint = `${side === "red" ? "红方" : "蓝方"}已满（最多 4 人）`;
          update();
          return;
        }
        state.ui[key] = result.team;
        state.ui.activeExpertIds = [...state.ui.battleRedIds, ...state.ui.battleBlueIds];
        state.ui.activeExpertId = state.ui.activeExpertIds[0] || null;
        state.responseStyle = "multiReview";
        update();
        return;
      }
      if (state.ui.activeExpertId === expert.id) {
        actions.clearExpertSelection();
        state.ui.expertMenuOpen = false;
        requestAnimationFrame(() => document.getElementById("chat-input")?.focus());
        return;
      }
      state.ui.activeExpertId = expert.id;
      state.ui.activeExpertIds = [expert.id];
      state.ui.expertMenuOpen = false;
      state.ui.responseStyleMenuOpen = false;
      state.responseStyle = DEFAULT_RESPONSE_STYLE;
      state.ui.composerHint = `已向 ${expert.name} 提问`;
      update();
      requestAnimationFrame(() => document.getElementById("chat-input")?.focus());
    },

    pickSkill(slash) {
      const base = (state.ui.chatInput || "").replace(/\/$/, "");
      state.ui.chatInput = `${base}/${slash} `;
      state.ui.composerHint = `已选择 /${slash}，描述你的需求`;
      state.ui.composerMenu = null;
      update();
      requestAnimationFrame(() => document.getElementById("chat-input")?.focus());
    },

    pickExpert(name) {
      const expert = getChatExpertOptions().find(e => e.name === name);
      if (expert) actions.selectExpert(expert.id);
      else actions.clearExpertSelection();
    },

    pickCite(id) {
      const all = [...MATERIALS_LIB, ...(state.userMaterials || [])];
      const m = all.find(x => x.id === id);
      if (!m) return;
      state.ui.citedMaterial = { id: m.id, title: m.title };
      state.ui.composerMenu = null;
      update();
    },

    clearCite() {
      state.ui.citedMaterial = null;
      update();
    },

    openScenario() {
      actions.go("scenarios");
    },

    toggleSidebarMore() {
      state.ui.sidebarMoreOpen = !state.ui.sidebarMoreOpen;
      if (state.ui.sidebarMoreOpen) state.ui.aiOutputMenuOpen = false;
      update();
    },

    toggleAiOutputMenu(force) {
      if (typeof force === "boolean") {
        state.ui.aiOutputMenuOpen = force;
      } else {
        state.ui.aiOutputMenuOpen = !state.ui.aiOutputMenuOpen;
      }
      if (state.ui.aiOutputMenuOpen) {
        state.ui.sidebarMoreOpen = false;
      } else {
        teardownAiOutputMenuDocClick();
      }
      update();
    },

    sidebarMoreAction(action) {
      state.ui.sidebarMoreOpen = false;
      if (action === "setup") {
        actions.go("star");
        return;
      }
      const labels = {
        schedule: "日程",
        credential: "凭证",
        language: "语言切换",
        tour: "新手引导",
      };
      actions.toast(`演示模式：${labels[action] || action} 请使用 agent-demo WebUI`);
      update();
    },

    openSourceCitation(messageIndex, citationId) {
      const sess = s();
      const m = sess?.messages?.[Number(messageIndex)];
      const citation = (m?.sourceCitations || []).find((c) => c.id === Number(citationId));
      if (!citation) {
        const fromBlocks = collectSourceCitationsFromAgentBlocks(m?.blocks || []);
        const found = fromBlocks.find((c) => c.id === Number(citationId));
        if (!found) return;
        state.ui.previewOpen = true;
        state.ui.previewKind = "source-citation";
        state.ui.previewData = found;
        update();
        return;
      }
      state.ui.previewOpen = true;
      state.ui.previewKind = "source-citation";
      state.ui.previewData = citation;
      update();
    },

    copyMessage(index) {
      const sess = s();
      const m = sess?.messages?.[index];
      const text = m?.text;
      if (!text) return;
      const onOk = () => actions.toast("已复制到剪贴板");
      const onFail = () => actions.toast("复制失败，请手动选择文本");
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(onOk).catch(() => {
          try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            ok ? onOk() : onFail();
          } catch {
            onFail();
          }
        });
        return;
      }
      onFail();
    },

    openChainCompany(id) {
      state.featureData = { ...(state.featureData || {}), chainCompanyId: id };
      update();
    },

    closeChainCompany() {
      if (state.featureData) delete state.featureData.chainCompanyId;
      update();
    },

    chainSetQuery(q) {
      setChainFilters(state, { query: q });
      state.ui._restoreChainSearchFocus = true;
      rerender();
    },

    chainToggleFilter(kind, value) {
      const filters = chainFiltersState(state);
      const key = kind === "tier" ? "tiers" : kind === "region" ? "regions" : kind === "stage" ? "stages" : null;
      if (!key) return;
      const set = new Set(filters[key]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      setChainFilters(state, { [key]: [...set] });
      update();
    },

    startChainDd(companyId) {
      const company = findChainCompany(companyId);
      if (!company) return;
      const prompt = buildChainPositionPrompt(company);
      actions.closeChainCompany();
      const projectId = s()?.projectId;
      if (projectId) {
        actions._startProjectChatFromHub(projectId, { welcome: true });
      } else {
        actions.goHome();
      }
      state.ui.chatInput = prompt;
      update();
      setTimeout(() => actions.send(), 80);
    },

    openAdminFinanceConfig() {
      const base = `${window.location.protocol}//${window.location.host}`;
      window.open(`${base}/admin/index.html`, "_blank", "noopener,noreferrer");
    },

    openFinanceConfig() {
      actions.go("finance-config");
    },

    setFinanceConfigTab(tab) {
      state.featureData = { ...(state.featureData || {}), financeConfigTab: tab };
      update();
    },

    setFinanceStatementTab(stmt) {
      state.featureData = { ...(state.featureData || {}), financeStatementTab: stmt };
      update();
    },

    toastFinanceCloneDemo() {
      update("演示模式：已模拟创建「通用模板 · 我的配置」");
    },

    toggleGraphDoc(id, checked) {
      const on = checked === true || checked === "true";
      const fd = state.featureData || {};
      const base = fd.graphSelectedDocIds || ["d1", "d2", "d4"];
      const set = new Set(base);
      if (on) set.add(id);
      else set.delete(id);
      state.featureData = { ...fd, graphSelectedDocIds: [...set] };
      update();
    },

    selectAllGraphDocs() {
      state.featureData = {
        ...(state.featureData || {}),
        graphSelectedDocIds: ["d1", "d2", "d3", "d4", "d5"],
      };
      update();
    },

    deselectAllGraphDocs() {
      state.featureData = {
        ...(state.featureData || {}),
        graphSelectedDocIds: [],
      };
      update();
    },

    setGraphSearch(q) {
      state.featureData = { ...(state.featureData || {}), graphSearchQ: q };
      state.ui._restoreGraphSearchFocus = true;
      rerender();
    },

    selectGraphNode(id) {
      state.featureData = { ...(state.featureData || {}), graphSelectedNodeId: id };
      update();
    },

    handleGraphCanvasClick(event) {
      const g = event.target.closest(".graph-node");
      if (!g) {
        if (state.featureData?.graphSelectedNodeId) {
          state.featureData = { ...(state.featureData || {}), graphSelectedNodeId: null };
          update();
        }
        return;
      }
      const id = g.getAttribute("data-node-id");
      if (id) actions.selectGraphNode(id);
    },

    syncGraphDemo() {
      update("演示模式：已模拟同步 3 份文档到图谱");
    },

    refreshGraphDemo() {
      update("图谱已刷新（Demo）");
    },

    toastGraphConfigDemo() {
      update("演示模式：图谱深度/节点上限等配置在 agent-demo 中可用");
    },

    closeScenario() {
      hideScenarioTooltip();
      state.ui.scenarioOpen = false;
      update();
    },

    runScenarioAction(label) {
      hideScenarioTooltip();
      state.ui.scenarioOpen = false;
      if (state.view === "scenarios") {
        actions.goHome();
      }
      if (label === "找项目") {
        actions.startFindMode();
        update();
        return;
      }
      if (label === "约专家访谈") {
        actions.goExpertBooking();
        return;
      }
      const report = reportEntryFor(label);
      if (report) {
        actions.startWriteReport(report.reportType);
        return;
      }
      const onHome = isHomeChatSession(state.session);
      if (getComposerChipConfig(label)) {
        actions.selectComposerChip(label);
      } else {
        if (onHome) ensureHomeChatSession();
        else ensureChatSession();
        actions.dispatchChip(label);
      }
      update();
    },

    runUserMessage(text) {
      const chip = state.ui.composerChip;
      const fileRefs = [...(state.ui.composerFileRefs || [])];
      const t = (text || "").trim();
      if (isProjectHubState(state)) {
        const projectId = state.ui.projectHubId || state.session?.projectId;
        if (projectId) {
          actions._startProjectChatFromHub(projectId, { welcome: false });
        }
      }
      const sess = s();
      if (!sess) return;
      const pending = [...(sess.pendingAttachments || [])];
      const hasChip = !!chip?.label;
      if (!t && !pending.length && !hasChip && !fileRefs.length) return;

      const savedMode = state.chatMode;
      const { red, blue } = getBattleTeamsFromState(state);
      if (state.ui.multiExpertDiscussion && !isBattleReadyFromTeams(red, blue)) {
        state.ui.composerHint = "请至少为红方、蓝方各选 1 位专家";
        update();
        return;
      }
      const useMultiExpertLive =
        state.ui.multiExpertDiscussion && isBattleReadyFromTeams(red, blue);
      const useMockDeliberation = savedMode === "deliberation";
      const displayText = formatComposerUserText(t, chip, fileRefs);
      const refMaterials = fileRefs
        .map(ref => sess.materials.find(m => m.id === ref.id))
        .filter(Boolean);

      const commitUserTurn = () => {
        sess.pendingAttachments = [];
        if (pending.length) sess.materials.push(...pending);
        const allFiles = [...pending, ...refMaterials.filter(r => !pending.some(p => p.id === r.id))];
        const userText = displayText || (chip?.label ? `[${chip.label}]` : "");
        if (userText && allFiles.length) {
          pushUser({ type: "text-with-files", text: userText, files: allFiles, chip: chip?.label || null });
        } else if (allFiles.length) {
          pushUser({ type: "files", files: allFiles, chip: chip?.label || null });
        } else if (userText) {
          pushUser(userText);
        }
        clearComposerContext();
      };

      if (useMultiExpertLive) {
        commitUserTurn();
        runMultiExpertLive({
          text: t || chip?.label || "",
          redIds: red,
          blueIds: blue,
          chatMode: savedMode,
          chipLabel: chip?.label,
        });
        return;
      }

      if (useMockDeliberation) {
        commitUserTurn();
        actions.runDeliberationFlow(t || chip?.label || "");
        return;
      }

      if (!t && !pending.length && fileRefs.length) {
        commitUserTurn();
        actions.doMaterials();
        update();
        return;
      }

      if (!displayText && pending.length) {
        commitUserTurn();
        actions.doMaterials();
        update();
        return;
      }

      commitUserTurn();

      update();

      if (/存为项目|保存项目/.test(t)) {
        actions.saveCurrentAsProject();
        return;
      }
      if (/创建项目|新建项目/.test(t)) {
        actions.openCreateModal();
        return;
      }
      if (savedMode === "find") {
        actions.findInChat(t || "按偏好推荐");
        return;
      }
      if (savedMode === "similar") {
        const co = guessCompany(t) || sess.company || t.trim();
        if (co) {
          actions.doFindSimilar(co);
        } else {
          streamAgent("请输入对标企业全称，或补充赛道关键词（如：医疗器械 toB）", { uiOnly: true, charMode: false }).then(() => update());
        }
        return;
      }
      if (savedMode === "bp") {
        const co = guessCompany(t) || sess.company || "";
        if (co) sess.company = co;
        agentTurn({ text: t, chatMode: "bp", chip, session: sess });
        return;
      }
      if (savedMode === "batch") {
        actions.runBatchEvalPipeline(t);
        return;
      }
      if (savedMode === "deep") {
        const co = guessCompany(t) || sess.company || t;
        if (!co) return;
        sess.company = co;
        actions.doExamineCompany(co, { deep: true, skipUserPush: true });
        return;
      }
      if (savedMode === "industry") {
        const industry = t.trim() || sess.industry;
        if (!industry) return;
        actions.doIndustry(industry);
        return;
      }
      if (savedMode === "risk") {
        const co = guessCompany(t) || sess.company || t.trim();
        if (!co) return;
        sess.company = co;
        actions.doRiskScan();
        return;
      }
      if (savedMode === "examine") {
        const co = guessCompany(t) || sess.company || t.trim();
        if (!co) return;
        sess.company = co;
        actions.doExamineCompany(co, { skipUserPush: true });
        return;
      }
      if (savedMode === "report") {
        const co = guessCompany(t) || sess.company || t.trim();
        const chipCfg = chip?.label ? getComposerChipConfig(chip.label) : null;
        const reportType = chipCfg?.reportType || null;
        if (!co) {
          actions.startWriteReport(reportType);
          return;
        }
        sess.company = co;
        const tpl = state.featureData?.pendingReportTemplate;
        if (state.featureData) state.featureData.pendingReportTemplate = null;
        if (tpl) actions.generateReport(tpl);
        else actions.startWriteReport(reportType);
        return;
      }
      if (savedMode === "gap") {
        const co = guessCompany(t) || sess.company || t.trim();
        if (!co) return;
        sess.company = co;
        actions.doGap();
        return;
      }
      if (savedMode === "journalist") {
        const co = guessCompany(t) || sess.company || t.trim();
        if (!co) return;
        sess.company = co;
        actions._openJournalistRequestForCompany(co);
        return;
      }
      if (savedMode === "finance") {
        actions.doFinance();
        return;
      }
      if (savedMode === "qna") {
        actions.startQnaList();
        return;
      }
      if (savedMode === "materials") {
        if (pending.length || refMaterials.length) actions.doMaterials();
        else actions.chipMaterials();
        return;
      }
      if (savedMode === "riskqna") {
        actions.doRiskQna();
        return;
      }
      if (savedMode === "transcript") {
        agentTurn({ text: t, chatMode: "transcript", session: sess });
        return;
      }
      if (savedMode === "valuation") {
        agentTurn({ text: t, chatMode: "valuation", session: sess });
        return;
      }
      if (savedMode === "ppt") {
        agentTurn({ text: t, chatMode: "ppt", session: sess });
        return;
      }
      if (savedMode === "monitor") {
        if (chip?.label === "项目监控") {
          actions.go("monitor");
          return;
        }
        agentTurn({ text: t, chatMode: "monitor", session: sess });
        return;
      }
      actions.handleIntent(t);
    },

    sendChip(text, msgIndex) {
      if (msgIndex != null) resolveMessage(msgIndex, "chip");
      const journalistChips = ["一线调研"];
      if (journalistChips.includes(text)) {
        actions._ensureJournalistView();
        actions.dispatchChip(text);
        update();
        return;
      }
      const needsChat = [
        ...SCENARIO_LABELS,
        "存为项目", "查这家", "上传材料", "上传材料分析",
        "下载名单", "下载评估结果", "保存评估结果", "确认待核项",
        "查公开风险", "企业初筛", "企业批量分析", "公开信息深读",
        "企业深度分析", "企业深度了解", "深度了解", "行业分析",
        "一线调研", "约行业专家", "批量评估",
        "准备上会材料", "上会前对抗预演", "多视角评审", "整理材料", "分析财报"
      ].includes(text);
      if (needsChat) ensureChatSession();

      const report = reportEntryFor(text);
      if (report) {
        actions.startWriteReport(report.reportType);
        return;
      }

      if (IMMEDIATE_CHIP_KEYS.has(text)) {
        if (state.session) pushUser(text);
        actions.dispatchChip(text);
        update();
        return;
      }

      if (tryAutoExecChip(text)) {
        update();
        return;
      }

      if (getComposerChipConfig(text)) {
        actions.selectComposerChip(text);
        return;
      }

      if (state.session) {
        pushUser(text);
        actions.dispatchChip(text);
      } else {
        update(`Demo：${text}`);
      }
      update();
    },

    /** 步骤1：选场景 tag → pill 进输入框 + hint，不发消息、不触发 AI 追问 */
    selectComposerChip(label) {
      const canonical = resolveScenarioLabel(label);
      const cfg = getComposerChipConfig(label);
      if (!cfg) return;
      if (isProjectHubState(state)) {
        const projectId = state.ui.projectHubId || state.session?.projectId;
        if (projectId) {
          actions._startProjectChatFromHub(projectId, { welcome: false });
        }
      } else if (isHomeChatSession(state.session)) {
        ensureHomeChatSession();
      } else {
        ensureChatSession();
      }
      state.ui.composerChip = { label: canonical, hint: cfg.hint };
      state.chatMode = cfg.mode;
      state.ui.composerHint = cfg.hint;
      if (cfg.mode === "deliberation") {
        state.responseStyle = "multiReview";
        state.ui.multiExpertDiscussion = true;
        const optionIds = new Set(getChatExpertOptions().map(e => e.id));
        const preset = ["ex-ag-market", "ex-ag-kyc"].filter(id => optionIds.has(id));
        state.ui.activeExpertIds = preset.length >= 2 ? preset : [];
        state.ui.activeExpertId = state.ui.activeExpertIds[0] || null;
        state.ui.expertMenuOpen = true;
        state.ui.composerHint = BATTLE_COMPOSER_HINT;
      }
      actions._focusComposer();
      update();
    },

    clearComposerChip() {
      clearComposerContext();
      update();
    },

    toggleResponseStyleMenu() {
      state.ui.expertMenuOpen = false;
      state.ui.composerMenu = null;
      state.ui.responseStyleMenuOpen = !state.ui.responseStyleMenuOpen;
      update();
    },

    closeResponseStyleMenu() {
      if (!state.ui.responseStyleMenuOpen) return;
      state.ui.responseStyleMenuOpen = false;
      update();
    },

    selectResponseStyle(styleId) {
      const style = getResponseStyleById(styleId);
      state.responseStyle = style.id;
      state.ui.responseStyleMenuOpen = false;
      update();
      requestAnimationFrame(() => document.getElementById("chat-input")?.focus());
    },

    insertFileRef(fileId) {
      if (!s()) return;
      const hit = findSessionFile(fileId, s(), state);
      if (!hit) return;
      const file = hit.file;
      const refs = state.ui.composerFileRefs || [];
      if (refs.some(r => r.id === fileId)) return;
      state.ui.composerFileRefs = [...refs, { id: file.id, name: file.name }];
      state.ui.rowMenu = null;
      update();
      requestAnimationFrame(() => document.getElementById("chat-input")?.focus());
    },

    removeComposerFileRef(fileId) {
      state.ui.composerFileRefs = (state.ui.composerFileRefs || []).filter(r => r.id !== fileId);
      update();
    },

    onComposerFileDrop(fileId) {
      actions.insertFileRef(fileId);
    },

    runDeliberationFlow(topic) {
      runDeliberationFlow(topic);
    },

    runMultiExpertLive(opts) {
      return runMultiExpertLive(opts || {});
    },

    dispatchChip(text) {
      const chipMap = {
        "找项目": () => actions.startFindMode(),
        "快速初筛": () => actions.doBPAnalysis(),
        "批量对比打分": () => actions.doBatchDeep(),
        "公开风险速览": () => actions.startRiskScanMode(),
        "行业赛道分析": () => actions.startIndustryMode(),
        "财报深读": () => actions.doFinance(),
        "找同类标的": () => actions.startSimilarTargetsMode(),
        "一线调研": () => actions.requestJournalist(),
        "访谈纪要整理": () => actions.startTranscriptMode(),
        "尽调报告": () => actions.startWriteReport("尽调报告"),
        "IC Memo": () => actions.startWriteReport("IC Memo"),
        "授信报告": () => actions.startWriteReport("授信报告"),
        "估值测算": () => actions.startValuationMode(),
        "汇报PPT制作": () => actions.doPPTMaking(),
        "项目监控": () => actions.go("monitor"),
        "风险预警": () => actions.go("monitor"),
        "复盘报告": () => actions.selectComposerChip("复盘报告"),
        "投后复盘": () => actions.selectComposerChip("复盘报告"),
        "查材料缺口": () => actions.startGapMode(),
        "访谈提纲准备": () => actions.startQnaList(),
        "约专家访谈": () => actions.goExpertBooking(),
        "撰写报告": () => actions.startWriteReport(),
        "风控预演": () => actions.doRiskQna(),
        "红蓝对抗预演": () => actions.doRedBlue(),
        "多视角评审": () => actions.doRedBlue(),
        "红蓝对抗": () => actions.doRedBlue(),
        "上会前对抗预演": () => actions.doRedBlue(),
        "上会材料打包": () => actions.openMeetingMaterialsPacker(),
        "查一家公司风险": () => actions.runScenario("risk"),
        "查公开风险": () => actions.startRiskScanMode(),
        "上传材料分析": () => actions.selectComposerChip("上传材料分析"),
        "上传材料": () => actions.selectComposerChip("上传材料"),
        "上传材料后整理": () => actions.selectComposerChip("上传材料后整理"),
        "整理材料": () => actions.doMaterials(),
        "分析财报": () => actions.selectComposerChip("财报深读"),
        "财报分析": () => actions.selectComposerChip("财报深读"),
        "写报告里一段": () => actions.startWriteReport(),
        "写报告": () => actions.startWriteReport(),
        "撰写尽调报告": () => actions.startWriteReport(),
        "生成报告段落": () => actions.startWriteReport(),
        "更新报告": () => actions.updateReport(),
        "更新尽调报告": () => actions.updateReport(),
        "准备上会材料": () => actions.openMeetingMaterialsPacker(),
        "确认待核项": () => actions.promptConfirm(),
        "导出 Word": () => actions.doExport(),
        "创建项目": () => actions.openCreateModal(),
        "存为项目": () => actions.saveCurrentAsProject(),
        "批量评估": () => actions.batchEval(),
        "下载名单": () => actions.downloadList(),
        "保存到资料库": () => actions.saveListToMaterials(),
        "下载评估结果": () => actions.downloadBatchEval(),
        "保存评估结果": () => actions.saveBatchEvalToMaterials(),
        "行业分析": () => actions.startIndustryMode(),
        "约专家会诊": () => actions.goExpertBooking(),
        "约专家": () => actions.goExpertBooking(),
        "约行业专家": () => actions.goExpertBooking(),
        "深度尽调": () => actions.requestJournalist(),
        "教小星": () => actions.go("star"),
        "生成访谈大纲": () => actions.startQnaList(),
        "访谈问题准备": () => actions.startQnaList(),
        "生成尽调问题清单": () => actions.startQnaList(),
        "给企业高管": () => actions.generateQna("company"),
        "给行业专家": () => actions.generateQna("expert"),
        "管理关注领域": () => actions.go("radar"),
        "查这家": () => actions.startExamineCompanyMode(),
        "初步了解": () => actions.startExamineCompanyMode(),
        "写尽调报告": () => actions.startWriteReport("尽调报告"),
        "研判一家公司": () => actions.startExamineCompanyMode(),
        "标的速览": () => actions.startExamineCompanyMode(),
        "深度了解": () => actions.doDeepReport(),
        "公开面深读": () => actions.doDeepReport(),
        "汇报PPT大纲": () => actions.doPPTMaking(),
        "投委会对抗预演": () => actions.doRedBlue(),
        "股权与实控": () => actions.startExamineCompanyMode(),
        "关键人风险": () => actions.startExamineCompanyMode(),
        "知产盘点": () => actions.selectComposerChip("知产盘点"),
        "公开信息深读": () => actions.doDeepReport(),
        "企业深度分析": () => actions.doDeepReport(),
        "企业初筛": () => actions.doBPAnalysis(),
        "企业批量分析": () => actions.doBatchDeep(),
        "企业深度了解": () => actions.doDeepReport(),
        "打开演示项目": () => actions.openProject("proj-bioray-001")
      };
      const fn = chipMap[text];
      if (fn) fn();
      else if (state.session) actions.handleIntent(text);
      else update(`Demo：${text}`);
    },

    /** v3: 找项目降级为 chat 功能点 */
    startFindMode() {
      ensureChatSession();
      actions.selectComposerChip("找项目");
    },

    /** 行业分析：先让用户输入赛道，再生成五维框架 */
    startIndustryMode() {
      ensureChatSession();
      actions.selectComposerChip("行业赛道分析");
    },

    /** 查公开风险：无企业时 pill + hint；有企业直接执行 */
    startRiskScanMode() {
      ensureChatSession();
      const sess = s();
      if (sess.company) {
        actions.chipRiskScan();
        return;
      }
      actions.selectComposerChip("标的速览");
    },

    /** 查这家 / 初步了解：无企业时 pill + hint */
    startExamineCompanyMode() {
      ensureChatSession();
      const sess = s();
      if (sess.company) {
        actions.doExamineCompany(sess.company);
        return;
      }
      actions.selectComposerChip("标的速览");
    },

    /** 撰写报告：选模板后若无目标企业，pill + hint */
    startReportCompanyMode(templateEntry) {
      if (!templateEntry) return;
      ensureChatSession();
      const sess = s();
      if (sess.company) {
        actions.generateReport(templateEntry);
        return;
      }
      state.featureData = { ...(state.featureData || {}), pendingReportTemplate: templateEntry };
      actions.selectComposerChip("撰写报告");
    },

    /** 查材料缺口：无企业时 pill + hint */
    startGapMode() {
      ensureChatSession();
      const sess = s();
      if (sess.company) {
        actions.doGap();
        return;
      }
      actions.selectComposerChip("查材料缺口");
    },

    /** 一线调研：无企业时 pill + hint */
    startJournalistCompanyMode() {
      ensureChatSession();
      const sess = s();
      if (sess.company) {
        actions._openJournalistRequestForCompany(sess.company);
        return;
      }
      actions.selectComposerChip("一线调研");
    },

    startSimilarTargetsMode() {
      ensureChatSession();
      const sess = s();
      if (sess.company) {
        actions.doFindSimilar(sess.company);
        return;
      }
      actions.selectComposerChip("找同类标的");
    },

    startTranscriptMode() {
      ensureChatSession();
      actions.selectComposerChip("访谈纪要整理");
      pushAgent({
        type: "text",
        text: "把访谈录音或文字稿发我（可上传或从文件树拖入），我会整理成结构化纪要，并标出待核实项。"
      });
      update();
    },

    startValuationMode() {
      ensureChatSession();
      actions.selectComposerChip("估值测算");
      pushAgent({
        type: "text",
        text: "告诉我估值方法（DCF / 可比公司），或上传最新财务数据，我来搭建估值框架。"
      });
      update();
    },

    doPPTMaking() {
      ensureChatSession();
      actions.selectComposerChip("汇报PPT制作");
      pushAgent({
        type: "text",
        text: "基于当前项目报告，我会生成 IC 汇报 PPT 大纲。直接发送即可，或补充要突出的章节。"
      });
      update();
    },

    openProjectReport(projectId) {
      actions.openProject(projectId);
      const sess = state.session;
      const doc = getActiveReportDoc(sess) || getSessionReports(sess)?.[0];
      if (doc) {
        actions.openPanel("report", buildPreviewFromReportDoc(sess, doc));
      } else {
        update("该项目暂无报告，可先撰写报告");
      }
    },

    _openJournalistRequestForCompany(company) {
      actions._queueReporterRequestPrefill({
        company,
        questions: company ? `关于 ${company} 的实地核实` : ""
      });
      actions._ensureJournalistView();
      actions.openReporterRequest();
    },

    _focusComposer() {
      requestAnimationFrame(() => {
        const el = document.getElementById("chat-input");
        el?.focus();
      });
    },

    /** v6: 以企业为基准找同类 → chat 流式 + 右侧相似名单 */
    doFindSimilar(company, usePreference = false) {
      if (!state.session || !isChatShellView()) {
        actions.newChat();
      } else {
        normalizeChatShellView();
      }
      const userText = usePreference ? "按偏好找更多同类企业" : `找与「${company}」相似的企业`;
      pushUser(userText);
      state.chatMode = "similar";
      state.view = "chat";
      window.location.hash = `/chat/${state.session.id}`;
      agentTurn({
        text: usePreference ? "按我的投资偏好（医疗器械 toB）推荐相似标的" : (company || userText),
        chatMode: "similar",
        session: s(),
      }).then(() => {
        state.chatMode = null;
        state.ui.composerHint = null;
        update();
      });
    },

    findSimilarByPreference() {
      actions.doFindSimilar(null, true);
    },

    interpretNews(id) {
      const item = findRadarNewsItem(state, id);
      if (!item) return;
      if (!state.featureData) state.featureData = {};
      if (!state.featureData.radarInterpreted) state.featureData.radarInterpreted = {};
      const interpreted = state.featureData.radarInterpreted;
      if (interpreted[id] && interpreted[id] !== "loading") return;
      interpreted[id] = "loading";
      update();
      fetchRadarInterpretation(item)
        .then(text => {
          interpreted[id] = text || "小星未返回解读内容";
          update();
        })
        .catch(() => {
          interpreted[id] = item.interpretation || "小星解读暂时不可用，请稍后重试";
          update();
        });
    },

    briefingChip(action) {
      if (action.startsWith("news-") || action.startsWith("pol-")) {
        actions.go("radar");
        actions.openNews(action);
        return;
      }
      if (action.startsWith("company:")) {
        actions.doExamineCompany(action.slice(8));
        return;
      }
      if (action.startsWith("weekly:")) {
        actions.go("radar");
        actions.openSectorWeeklyReport(action.slice(7));
        return;
      }
      if (action.startsWith("monitor:")) {
        actions.go("monitor");
        state.featureData = {
          ...(state.featureData || {}),
          monitorHighlightId: action.slice(8),
          monitorFilter: "alert"
        };
        update();
        return;
      }
      if (action === "monitor") {
        actions.go("monitor");
      }
    },

    openSectorWeeklyReport(sector) {
      const s = sector || state.featureData?.weeklySector || state.userSectors?.[0] || "医疗器械";
      state.featureData = { ...(state.featureData || {}), weeklySector: s };
      state.ui.previewKind = "sector-weekly";
      state.ui.previewData = { sector: s, data: null, loading: true };
      state.ui.previewOpen = true;
      if (state.view === "radar") state.ui.radarInterestsOpen = false;
      update();
      fetchRadarWeekly(s)
        .then(data => {
          state.featureData.radarWeekly = data;
          state.ui.previewData = { sector: s, data };
          update();
        })
        .catch(() => {
          const data = SECTOR_WEEKLY[s] || SECTOR_WEEKLY["医疗器械"] || null;
          if (data) {
            state.featureData.radarWeekly = data;
            state.ui.previewData = { sector: s, data };
            update();
            return;
          }
          update("赛道周报生成失败，请稍后重试");
        });
    },

    openSectorWeekly(sector) {
      actions.openSectorWeeklyReport(sector);
    },

    setWeeklySector(sector) {
      state.featureData = { ...(state.featureData || {}), weeklySector: sector };
      void loadRadarWeeklyIntoState(state, update, sector);
    },

    interpretMonitor(monitorId) {
      const item = [...POST_MONITOR, ...(state.userMonitors || [])].find(m => m.id === monitorId);
      if (!item?.aiSummary) return;
      if (!state.featureData) state.featureData = {};
      if (!state.featureData.monitorInterpreted) state.featureData.monitorInterpreted = {};
      const interpreted = state.featureData.monitorInterpreted;
      if (interpreted[monitorId] && interpreted[monitorId] !== "loading") return;
      interpreted[monitorId] = "loading";
      update();
      setTimeout(() => {
        interpreted[monitorId] = item.aiSummary;
        update();
      }, 700);
    },

    discussInterpretation(kind, id) {
      if (kind === "monitor") {
        actions.askMonitorAI(id);
        return;
      }
      const item = findRadarNewsItem(state, id);
      if (!item) return;
      const sess = createSession({ name: `解读：${item.title?.slice(0, 12) || "资讯"}`, messages: [] });
      state.session = sess;
      state.sessionId = sess.id;
      state.sessionCache[sess.id] = sess;
      state.view = "chat";
      state.ui.composerHint = `关于这条资讯：${item.title || ""}`;
      state.ui.chatInput = item.interpretation
        ? `结合这条资讯继续深挖：${item.interpretation}`
        : `帮我从投资角度继续分析：${item.title || ""}`;
      window.location.hash = `/chat/${sess.id}`;
      update();
    },

    findInChat(query) {
      const q = query.trim();
      state.featureData = {
        ...(state.featureData || {}),
        query: q,
        searchResult: {
          ...COMPANY_SEARCH_RESULT,
          query: q || COMPANY_SEARCH_RESULT.query
        }
      };
      actions.openPanel("company-list");
      agentTurn({ text: q || "按偏好推荐标的", chatMode: "find", session: s() }).then(() => {
        state.chatMode = null;
        state.ui.composerHint = null;
        setContextTags(["批量对比打分", "下载名单", "保存到资料库"]);
        update();
      });
    },

    quickScreenFromList(company) {
      if (!company) return;
      ensureChatSession();
      s().company = company;
      state.view = "chat";
      actions.selectComposerChip("快速初筛");
      agentTurn({ text: company, chatMode: "bp", session: s() });
    },

    saveListToMaterials() {
      const r = state.featureData?.searchResult || COMPANY_SEARCH_RESULT;
      const title = `找项目 · ${r.query || r.region || "企业名单"}`;
      const batchKey = `${title} · ${r.evaluatedAt || "today"}`;
      const exists = (state.userMaterials || []).some(m => m.type === "企业名单" && m.batchKey === batchKey);
      if (exists) {
        update("该名单已在资料库中");
        return;
      }
      state.userMaterials = state.userMaterials || [];
      state.userMaterials.unshift({
        id: "umat-list-" + Date.now(),
        type: "企业名单",
        title,
        batchKey,
        date: "今天",
        source: "找项目",
        projectId: null,
        fullText: (r.companies || []).map(c => `${c.name},${c.revenue},${c.years}年,${c.score}`).join("\n")
      });
      update("名单已保存到资料库");
    },

    doInvestmentQuestion(company) {
      const co = company || s()?.company;
      if (!co) {
        streamAgent("要判断值不值得投，得先知道**具体哪家企业**。你把企业全称或常用简称发我就行。", { uiOnly: true }).then(() => update());
        return;
      }
      if (state.session && !state.session.saved) state.session.company = co;
      else if (!state.session || state.session.saved) {
        const sess = createSession({ company: co });
        state.session = sess;
        state.sessionId = sess.id;
        state.sessionCache[sess.id] = sess;
      }
      s().company = co;
      state.view = "chat";
      window.location.hash = `/chat/${s().id}`;
      agentTurn({
        text: `「${co}」是否值得进一步尽调？请给初步框架（不是投资建议）。`,
        chatMode: "examine",
        session: s(),
      });
    },

    doExamineCompany(company, opts = {}) {
      const { deep = false, skipUserPush = false } = opts;
      const co = company || s()?.company;
      if (!co) { update("请先指定企业"); return; }

      if (state.session && !state.session.saved) state.session.company = co;
      else if (!state.session || state.session.saved) {
        const sess = createSession({ company: co });
        state.session = sess;
        state.sessionId = sess.id;
        state.sessionCache[sess.id] = sess;
      }
      s().company = co;
      if (!skipUserPush) pushUser(`查这家：${co}`);
      state.view = "chat";
      window.location.hash = `/chat/${s().id}`;

      agentTurn({
        text: co,
        chatMode: deep ? "deep" : "examine",
        session: s(),
      }).then((res) => {
        if (res.ok && deep) pushVerifyHint(co);
      });
    },

    doPreliminary(company) {
      actions.doExamineCompany(company);
    },

    radarToChat(company) {
      actions.doExamineCompany(company);
    },

    doBPAnalysis() {
      if (isHomeChatSession(state.session)) {
        ensureHomeChatSession();
      } else {
        ensureChatSession();
      }
      actions.selectComposerChip("快速初筛");
    },

    doBatchDeep() {
      if (!state.session) ensureChatSession();
      if (state.ui.previewKind === "company-list" && state.featureData?.searchResult) {
        actions.batchEval();
        return;
      }
      actions.selectComposerChip("批量对比打分");
    },

    doDeepReport() {
      actions.spendCredits(CREDIT_COSTS.deepReport, "deepReport");
    },

    doRedBlue() {
      ensureChatSession();
      state.responseStyle = "multiReview";
      state.ui.multiExpertDiscussion = true;
      const optionIds = new Set(getChatExpertOptions().map(e => e.id));
      state.ui.battleRedIds = ["ex-ag-kyc"].filter(id => optionIds.has(id));
      state.ui.battleBlueIds = ["ex-ag-market"].filter(id => optionIds.has(id));
      state.ui.battleActiveSide = "red";
      state.ui.activeExpertIds = [...state.ui.battleRedIds, ...state.ui.battleBlueIds];
      state.ui.activeExpertId = state.ui.activeExpertIds[0] || null;
      state.ui.expertMenuOpen = true;
      state.ui.composerHint = BATTLE_COMPOSER_HINT;
      actions.selectComposerChip("红蓝对抗预演");
    },

    advanceRedBlue(text) {
      const t = (text || "").trim();
      if (!t) return;
      pushUser(t);
      const step = state.featureData?.redBlueStep ?? 0;
      const draft = { ...(state.featureData?.redBlueDraft || {}) };

      if (step === 0) {
        draft.red = t;
        state.featureData = { ...state.featureData, redBlueStep: 1, redBlueDraft: draft };
        state.ui.composerHint = "选风控方专家，如：风控专家";
        pushAgent({ type: "text", text: "好。**第二步**：选**风控方**专家视角（如：风控专家 / 合规专家）。" });
        update();
        return;
      }
      if (step === 1) {
        draft.blue = t;
        state.featureData = { ...state.featureData, redBlueStep: 2, redBlueDraft: draft };
        state.ui.composerHint = "填写对抗议题";
        pushAgent({ type: "text", text: "**第三步**：这次对抗的议题是什么？例如：这家企业是否值得 Pre-B 投资。" });
        update();
        return;
      }
      if (step === 2) {
        draft.topic = t;
        state.featureData = { ...state.featureData, redBlueStep: 3, redBlueDraft: draft };
        state.ui.composerHint = "例如：3";
        pushAgent({ type: "text", text: "**第四步**：跑几轮辩论？输入数字（建议 2-3 轮）。" });
        update();
        return;
      }

      const rounds = Math.min(parseInt(t, 10) || 3, 5);
      state.chatMode = null;
      state.ui.composerHint = null;
      state.featureData = { ...state.featureData, redBlueStep: 0, redBlueDraft: {} };
      const co = s()?.company || "";
      agentTurn({
        text: [
          `红蓝对抗预演，共 ${rounds} 轮辩论后给裁决摘要。`,
          `议题：${draft.topic || (co ? `${co} 是否值得投资` : "当前项目")}`,
          `多方视角：${draft.red || "投资经理"}`,
          `风控视角：${draft.blue || "风控专家"}`,
          co ? `关注企业：${co}` : "",
        ].filter(Boolean).join("\n"),
        chatMode: "redblue",
        session: s(),
      });
    },

    chipRiskScan() {
      const sess = s();
      if (!sess.company) {
        actions.startRiskScanMode();
        return;
      }
      if (sess.flags.riskScanned) {
        streamAgent(`**${sess.company}** 的公开风险已在上面。接下来可以整理材料或查这家。`, { uiOnly: true }).then(() => update());
        return;
      }
      actions.doRiskScan();
    },

    pushGuideResponse(preface) {
      pushAgent({ type: "text", text: preface || "选一种方式继续就行：" });
      pushAgent({ type: "scenarios-card", data: { items: SCENARIO_ITEMS } });
    },

    runScenario(id, msgIndex) {
      resolveMessage(msgIndex, "scenario");
      if (id === "demo") {
        actions.openProject("proj-bioray-001");
        return;
      }
      if (id === "create") {
        actions.openCreateModal();
        return;
      }
      if (id === "risk") {
        actions.startRiskScanMode();
        return;
      }
      actions.pushGuideResponse();
      update();
    },

    chipMaterials() {
      const sess = s();
      if ((sess.pendingAttachments || []).length) {
        update("请先发送附件，或输入说明后一起发送");
        return;
      }
      if (!sess.materials.length) {
        actions.pickFile();
        return;
      }
      actions.doMaterials();
    },

    send() {
      if (state.ui.streaming) {
        actions.stopGeneration();
        return;
      }
      const inputEl = document.getElementById("chat-input");
      const text = (inputEl?.value ?? state.ui.chatInput ?? "").trim();
      const pending = s()?.pendingAttachments?.length || 0;
      const chip = state.ui.composerChip;
      const fileRefs = state.ui.composerFileRefs?.length || 0;
      if (!text && !pending && !chip && !fileRefs) return;
      state.ui.chatInput = "";
      if (inputEl) inputEl.value = "";
      actions.runUserMessage(text);
    },

    stopGeneration() {
      state.ui._streamCancelled = true;
      agentBridge.abortLive();
      const sess = s();
      if (sess) {
        for (let i = sess.messages.length - 1; i >= 0; i--) {
          const m = sess.messages[i];
          if (m.role !== "agent") break;
          if (!m.streaming && m.type !== "agent-blocks") continue;
          m.streaming = false;
          if (m.type === "agent-blocks" && Array.isArray(m.blocks)) {
            for (const b of m.blocks) {
              if (b.type === "text") {
                b.streaming = false;
                if (!String(b.text || "").trim() || b.text === "正在连接 Finstep 分析服务…") {
                  b.text = "已中断。";
                }
              }
            }
          } else if (!String(m.text || "").trim()) {
            m.text = "已中断。";
          }
          break;
        }
      }
      state.ui.streaming = false;
      syncComposerSendButton();
      update();
    },

    isStreaming() {
      return !!state.ui.streaming;
    },

    handleIntent(text) {
      const { red, blue } = getBattleTeamsFromState(state);
      if (state.ui.multiExpertDiscussion && !isBattleReadyFromTeams(red, blue) && (text || "").trim()) {
        state.ui.composerHint = "请至少为红方、蓝方各选 1 位专家";
        update();
        return;
      }
      if (state.ui.multiExpertDiscussion && isBattleReadyFromTeams(red, blue) && (text || "").trim()) {
        runMultiExpertLive({ text, redIds: red, blueIds: blue });
        return;
      }
      if (state.chatMode === "deliberation" && (text || "").trim()) {
        actions.runDeliberationFlow(text);
        return;
      }
      const sess = s();
      const t = text.toLowerCase();

      if (/找项目|找企业|有哪些|名单|标的|筛选/.test(text)) {
        if (/批量评估|批量打分/.test(text)) { actions.batchEval(); return; }
        if (state.chatMode === "find") {
          actions.findInChat(text);
          return;
        }
        actions.startFindMode();
        const stripped = text.replace(/找项目|找企业|有哪些|名单|标的|筛选/g, "").trim();
        if (stripped.length > 2) actions.findInChat(text);
        return;
      }
      if (/值得|值不值|能不能投|可不可以投|靠不靠谱|要不要投|能投吗|有没有必要投|值得买/.test(text)
        || (/怎么样|如何评价|好不好/.test(text) && extractCompanyFromQuestion(text))) {
        const co = guessCompany(text) || extractCompanyFromQuestion(text);
        if (co) {
          actions.doInvestmentQuestion(co);
          return;
        }
        streamAgent("要判断值不值得投，得先知道**具体哪家企业**。你把企业全称或常用简称发我就行。", { uiOnly: true }).then(() => update());
        return;
      }
      if (/一线调研|实地调研/.test(text)) { actions.requestJournalist(); return; }
      if (/专家|访谈专家|约个专家|专家会议|红蓝/.test(text)) {
        if (/红蓝/.test(text)) { actions.doRedBlue(); return; }
        if (/专家会议/.test(text)) {
          state.view = "experts";
          state.featureData = { ...(state.featureData || {}), expertTab: "meetings" };
          window.location.hash = "/experts";
          update();
          return;
        }
        if (/约专家|约个专家|约行业专家|真人专家|专家对接/.test(text)) {
          actions.goExpertBooking();
          return;
        }
        actions.go("experts");
        return;
      }
      if (/尽调问题清单|问题清单/.test(text)) { actions.startQnaList(); return; }
      if (/更新报告|补材后/.test(text)) { actions.updateReport(); return; }
      if (/访谈大纲|访谈提纲|问什么|访谈问题/.test(text)) { actions.startQnaList(); return; }
      if (state.chatMode === "industry") return;
      if (/^行业分析$/.test(text.trim())) { actions.startIndustryMode(); return; }
      if (/行业分析/.test(text)) {
        const stripped = text.replace(/^(帮我|请)?(做|来)?/g, "").replace(/行业分析/g, "").trim();
        if (stripped.length >= 2) {
          actions.doIndustry(stripped);
          return;
        }
        actions.startIndustryMode();
        return;
      }
      if (/行业空间|竞争格局|赛道研判/.test(text) && text.length > 6) {
        actions.doIndustry(text.replace(/^(分析|研究)/, "").trim());
        return;
      }
      if (/缺口|缺什么|缺件|冲突|完整度/.test(text)) { actions.startGapMode(); return; }
      if (/风控预演|立项会追问/.test(text)) { actions.doRiskQna(); return; }
      if (/对抗|红蓝|投委会预演/.test(text)) { actions.doRedBlue(); return; }
      if (/查这家|初步了解|了解一下/.test(text)) {
        const co = guessCompany(text) || sess.company;
        if (co) { actions.doExamineCompany(co, { skipUserPush: true }); return; }
      }
      if (/BP|商业计划/.test(text)) { actions.doBPAnalysis(); return; }
      if (/深度了解|完整报告|评估报告/.test(text)) { actions.doDeepReport(); return; }

      if (/风险|公开|工商|司法|查一下|查询/.test(text) && !/财报|报告/.test(text)) {
        const co = guessCompany(text);
        if (co) sess.company = co;
        if (/查一家公司/.test(text) && !sess.company) {
          pushAgent({
            type: "text",
            text: "请告诉我企业全称，例如「苏州某生物医药科技有限公司」。Demo 里你也可以直接说「某公司风险怎么样」。"
          });
          return;
        }
        actions.doRiskScan();
        return;
      }
      if (/材料|整理|上传|解析|文件/.test(text)) {
        actions.doMaterials();
        return;
      }
      if (/财报|财务/.test(text)) {
        actions.doFinance();
        return;
      }
      if (/报告|段落|写报告|撰写/.test(text)) {
        actions.startWriteReport();
        return;
      }
      if (/更新.*报告|补材后/.test(text)) {
        actions.updateReport();
        return;
      }
      if (/上会材料|准备上会|投委会材料/.test(text)) {
        actions.openMeetingMaterialsPacker();
        return;
      }
      if (/确认|待核|拍板/.test(text)) {
        actions.promptConfirm();
        return;
      }
      if (/导出|下载|word/.test(t)) {
        actions.doExport();
        return;
      }
      if (/不知道|不清楚|搞不懂|不会|怎么开始|干什么|干嘛|帮助|从哪|从什么/.test(text)) {
        actions.pushGuideResponse("没关系，大多数人从下面选一种开始就行：");
        return;
      }

      if (looksLikeMultiCompanyList(text)) {
        agentTurn({
          text: `请对以下企业批量对比打分（Markdown 表格：企业名、综合分、推荐理由、主要风险）：\n${text.trim()}`,
          chatMode: "batch",
          session: sess,
        });
        return;
      }

      const coFallback = !looksLikeMultiCompanyList(text)
        && (guessCompany(text) || extractCompanyFromQuestion(text));
      if (coFallback) {
        actions.doExamineCompany(coFallback, { skipUserPush: true });
        return;
      }

      agentTurn({ text, session: sess });
    },

    doRiskScan() {
      const sess = s();
      if (!sess.company) {
        actions.startRiskScanMode();
        return;
      }
      sess.company = sess.company;
      agentTurn({ text: sess.company, chatMode: "risk", session: sess });
    },

    doMaterials() {
      const sess = s();
      if (!sess.materials.length) {
        actions.uploadFile();
        return;
      }
      const names = sess.materials.map((m) => m.name).join("、");
      agentTurn({
        text: `已上传材料：${names}。请整理摘要、冲突点与缺口清单。`,
        chatMode: "materials",
        session: sess,
      }).then((res) => {
        if (res.ok) {
          sess.flags.materialsParsed = true;
          pushAgent({
            type: "materials-card",
            data: { files: sess.materials, note: "分析结果见上方对话" },
          });
          update();
        }
      });
    },

    pickFile() {
      document.getElementById("file-picker")?.click();
    },

    onFilesPicked(inputEl) {
      const files = inputEl?.files ? [...inputEl.files] : [];
      if (!files.length) return;
      inputEl.value = "";
      actions.addUploadedFiles(files.map(f => f.name));
    },

    addUploadedFiles(names) {
      const sess = s();
      const added = names.map((name, i) => {
        const cat = guessFileType(name);
        return {
          id: "m" + Date.now() + i,
          name,
          category: cat,
          ...fileAuthorMeta(cu(), "draft")
        };
      });

      if (sess.saved) {
        sess.materials.push(...added);
        state.ui.filesOpen = true;
        if (added[0]) {
          state.ui.selectedFileId = added[0].id;
          state.ui.previewKind = "file";
          state.ui.previewOpen = true;
        }
        if (sessionHasReports(sess) && sess.reportVersions?.length) {
          const activeDoc = getActiveReportDoc(sess);
          const activeVer = activeDoc?.reportVersions?.find(v => v.v === activeDoc.activeVersion)
            || activeDoc?.reportVersions?.[activeDoc.reportVersions.length - 1];
          const affected = guessReportAffectedSections(added.map(a => a.name));
          state.ui.reportUpdatePrompt = {
            fileNames: added.map(a => a.name),
            fileIds: added.map(a => a.id),
            affectedSections: affected,
            reportVersion: activeVer?.v
          };
          pushAgent({
            type: "report-update-prompt",
            data: {
              fileNames: added.map(a => a.name),
              reportVersion: activeVer?.v,
              reportLabel: activeDoc?.label,
              affectedSections: affected
            }
          });
        }
        update();
        return;
      }

      sess.pendingAttachments = sess.pendingAttachments || [];
      sess.pendingAttachments.push(...added);
      update();
    },

    removePendingAttachment(id) {
      const sess = s();
      if (!sess?.pendingAttachments?.length) return;
      sess.pendingAttachments = sess.pendingAttachments.filter(f => f.id !== id);
      update();
    },

    uploadFile() {
      actions.addUploadedFiles(["银行流水2024.xlsx"]);
    },

    doFinance() {
      pushAgent({
        type: "ocr-review-card",
        text: "已识别财报科目，请确认映射后开始分析。",
        data: OCR_RESULT_DEMO
      });
      update();
    },

    confirmFinanceOcr() {
      pushAgent({
        type: "finance-rules-card",
        text: "规则引擎校验结果：",
        data: FINANCE_ANALYSIS_RESULT
      });
      pushAgent({
        type: "finance-card",
        text: "财报深读摘要（基于已确认科目映射）：",
        data: FINANCE_MOCK
      });
      agentTurn({ text: s()?.company || "", chatMode: "finance", session: s() });
    },

    /** 撰写报告入口：按 reportType 过滤模板 */
    startWriteReport(reportType) {
      if (!state.session || !isChatShellView()) {
        actions.newChat();
      } else {
        normalizeChatShellView();
      }
      let templates = getUserReportTemplates(state);
      if (reportType) {
        templates = templates.filter(t => t.reportType === reportType);
      }
      if (!templates.length) {
        if (reportType) {
          pushAgent({
            type: "text",
            text: `资料库中暂无 **${reportType}** 类型模板。可先上传模板，或使用标准结构生成。`
          });
          openModal(state, "report-no-template", { reportType });
          update();
          return;
        }
        openModal(state, "report-no-template");
        update();
        return;
      }
      if (templates.length === 1) {
        openModal(state, "report-template-confirm", { template: templates[0] });
        update();
        return;
      }
      openModal(state, "report-template-select", { templates, reportType });
      update();
    },

    /** 兼容旧入口 */
    doReport() {
      actions.startWriteReport();
    },

    selectReportTemplate(templateId) {
      const templates = getUserReportTemplates(state);
      const tpl = templates.find(t => t.id === templateId);
      if (!tpl) return;
      openModal(state, "report-template-confirm", { template: tpl });
      update();
    },

    useStandardReportTemplate() {
      closeModal(state);
      actions.startReportCompanyMode({
        id: STANDARD_REPORT_TEMPLATE.id,
        title: STANDARD_REPORT_TEMPLATE.title,
        scenario: STANDARD_REPORT_TEMPLATE.scenario
      });
    },

    goUploadReportTemplate() {
      closeModal(state);
      actions.go("materials");
    },

    confirmReportTemplate(templateId) {
      const templates = getUserReportTemplates(state);
      const tpl = templates.find(t => t.id === templateId);
      if (!tpl) return;
      closeModal(state);
      actions.startReportCompanyMode(tpl);
    },

    generateReport(templateEntry) {
      const sess = s();
      if (!sess?.company) {
        actions.startReportCompanyMode(templateEntry);
        return;
      }
      const tplName = templateEntry?.title || STANDARD_REPORT_TEMPLATE.title;
      const tplId = templateEntry?.id || STANDARD_REPORT_TEMPLATE.id;
      const label = getReportShortLabel(templateEntry);
      const { sections: sectionTpl, fields: fieldTpl } = getReportContentForTemplate(templateEntry);
      state.ui.reportGenerating = true;
      update();

      const matCount = sess.materials?.length || 0;
      agentTurn({
        text: `目标企业：${sess.company || "未指定"}。报告模板：${tplName}。已关联 ${matCount} 份材料。请输出完整 Markdown 尽调报告，材料不足处标注【待核】。`,
        chatMode: "report",
        session: sess,
      }).then((res) => {
        state.ui.reportGenerating = false;
        if (!res.ok) {
          update();
          return;
        }
        const fields = fieldTpl.map(f => ({ ...f }));
        const company = sess.company || "";
        if (company) {
          fields.forEach(f => {
            if (/公司|企业名称/.test(f.field || "")) f.value = company;
          });
        }
        const sections = cloneReportSections(sectionTpl);
        const version = {
          v: "v1.0",
          label: "初稿",
          date: reportDateStamp(),
          basis: `Agent 生成 · ${matCount} 份材料`,
          fields,
          sections,
          updatedFieldKeys: [],
          ...fileAuthorMeta(cu(), "draft"),
        };
        sess.reports = getSessionReports(sess);
        let doc = sess.reports.find(r => r.templateId === tplId);
        if (!doc) {
          doc = {
            id: `report-${tplId}-${Date.now()}`,
            templateId: tplId,
            templateName: tplName,
            label,
            reportVersions: [version],
            activeVersion: "v1.0",
            ...fileAuthorMeta(cu(), "draft"),
          };
          sess.reports.push(doc);
        }
        sess.activeReportId = doc.id;
        syncLegacyReportFields(sess, doc);
        sess.flags.reportDone = true;
        syncReportToFileTree(sess, doc, version);
        setContextTags(["尽调报告", "更新报告", "上会材料打包", "风控预演"]);
        actions.openPanel("report", buildPreviewFromReportDoc(sess, doc));
        update();
      });
    },

    dismissReportUpdate() {
      state.ui.reportUpdatePrompt = null;
      update("已保存新材料，暂不更新报告");
    },

    confirmReportUpdateFromPrompt() {
      const prompt = state.ui.reportUpdatePrompt;
      state.ui.reportUpdatePrompt = null;
      if (prompt?.fileIds?.length) {
        actions.updateReport(prompt.fileIds, prompt.fileNames);
      } else {
        actions.updateReport();
      }
    },

    updateReport(newFileIds, newFileNames) {
      const sess = s();
      const doc = getActiveReportDoc(sess);
      if (!doc?.reportVersions?.length) {
        pushAgent({ type: "text", text: "还没有报告内容。先说「撰写报告」生成初稿。", markdown: true });
        update();
        return;
      }
      const basisFile = (newFileNames && newFileNames[0]) || "补充材料";
      agentTurn({
        text: `请根据新上传材料「${basisFile}」增量更新「${doc.label}」尽调报告，输出变更摘要与建议修改段落。当前企业：${sess.company || "未指定"}`,
        chatMode: "update-report",
        session: sess,
      });
    },

    switchActiveReport(reportDocId) {
      const sess = s();
      const doc = getSessionReports(sess).find(r => r.id === reportDocId);
      if (!doc) return;
      sess.activeReportId = reportDocId;
      syncLegacyReportFields(sess, doc);
      if (state.ui.previewOpen && state.ui.previewKind === "report") {
        state.ui.previewData = buildPreviewFromReportDoc(sess, doc);
      }
      update();
    },

    switchReportVersion(versionId) {
      const sess = s();
      const doc = getActiveReportDoc(sess);
      const ver = doc?.reportVersions?.find(v => v.v === versionId);
      if (!ver || !doc) return;
      doc.activeVersion = versionId;
      syncLegacyReportFields(sess, doc);
      if (state.ui.previewOpen && state.ui.previewKind === "report") {
        state.ui.previewData = buildPreviewFromReportDoc(sess, doc);
      }
      update();
    },

    mutateActiveReportSection(sectionIndex, mutator) {
      const sess = s();
      const doc = getActiveReportDoc(sess);
      if (!doc) return null;
      const ver = doc.reportVersions?.find(v => v.v === doc.activeVersion);
      const sec = ver?.sections?.[sectionIndex];
      if (!sec) return null;
      mutator(sec, ver, doc);
      syncLegacyReportFields(sess, doc);
      if (state.ui.previewOpen && state.ui.previewKind === "report") {
        state.ui.previewData = buildPreviewFromReportDoc(sess, doc);
      }
      return { sess, doc, ver, sec };
    },

    saveReportCompany(el) {
      const text = (el?.innerText || "").trim();
      if (!text) return;
      const sess = s();
      sess.company = text;
      if (state.ui.previewData) state.ui.previewData.company = text;
      update();
    },

    saveReportSectionTitle(sectionIndex, el) {
      const text = (el?.innerText || "").trim();
      if (!text) return;
      const sess = s();
      const doc = getActiveReportDoc(sess);
      const ver = doc?.reportVersions?.find(v => v.v === doc.activeVersion);
      const sec = ver?.sections?.[sectionIndex];
      if (!sec || sec.title === text) return;
      actions.mutateActiveReportSection(sectionIndex, (s) => {
        s.title = text;
        s.userEdited = true;
      });
      update("章节标题已保存");
    },

    saveReportSectionBody(sectionIndex, el) {
      const text = (el?.innerText || "").replace(/\u00a0/g, " ").trim();
      if (!text) return;
      const sess = s();
      const doc = getActiveReportDoc(sess);
      const ver = doc?.reportVersions?.find(v => v.v === doc.activeVersion);
      const sec = ver?.sections?.[sectionIndex];
      if (!sec) return;
      const prev = sectionPlainText(sec).trim();
      if (prev === text) return;
      actions.mutateActiveReportSection(sectionIndex, (s) => {
        const refs = getSectionSourceRefs(s);
        if (refs.length) s.sourceRefs = refs.map(r => ({ ...r }));
        s.parts = [{ text, userEdited: true }];
        s.userEdited = true;
      });
      update("报告正文已保存");
    },

    saveReportSectionGap(sectionIndex, el) {
      const text = (el?.innerText || "").replace(/^\[待补充\]\s*/, "").trim();
      const sess = s();
      const doc = getActiveReportDoc(sess);
      const ver = doc?.reportVersions?.find(v => v.v === doc.activeVersion);
      const sec = ver?.sections?.[sectionIndex];
      if (!sec) return;
      const prev = (sec.gap || "").trim();
      if (prev === text) return;
      actions.mutateActiveReportSection(sectionIndex, (s) => {
        s.gap = text || null;
        s.userEdited = true;
      });
      update(text ? "待补充项已保存" : "已移除待补充项");
    },

    promptConfirm() {
      const sess = s();
      if (!sess.pendingField || sess.flags.pendingResolved) {
        pushAgent({ type: "text", text: "目前没有等你确认的事项。" });
        return;
      }
      if (sess.messages.some(m => m.type === "confirm-card" && !m.resolved)) return;
      pushAgent({ type: "confirm-card", data: { ...sess.pendingField } });
    },

    confirmPending(msgIndex) {
      const sess = s();
      resolveMessage(msgIndex, "confirm");
      sess.flags.pendingResolved = true;
      const field = sess.pendingField?.field;
      if (field) {
        const row = sess.reportFields.find(r => r.field === field);
        if (row) row.ok = true;
      }
      sess.pendingField = null;
      streamAgent(`好的，**${field}** 已记入报告。`, { uiOnly: true }).then(() => update("已确认"));
    },

    rejectPending(msgIndex) {
      const sess = s();
      resolveMessage(msgIndex, "reject");
      sess.flags.pendingResolved = true;
      sess.pendingField = null;
      streamAgent("明白，这条我先不写入正式报告。补材料后说「更新报告」，我只改受影响的部分。", { uiOnly: true }).then(() => update());
    },

    doExport() {
      const sess = s();
      if (!sessionHasReports(sess)) {
        pushAgent({ type: "text", text: "还没有报告内容。请先「撰写报告」生成初稿。" });
        return;
      }
      sess.flags.exported = true;
      update("Word 初稿已导出（Mock）");
    },

    export() { actions.doExport(); },

    go(view) {
      if (view === "templates") {
        view = "report-templates";
        state.featureData = {
          ...(state.featureData || {}),
          reportTemplateGroup: "mine",
          materialsTab: "报告模板",
        };
      }
      if (view === "meetings") view = "experts";
      if (view === "profile" || view === "avatar") view = "star";
      const hash = `/${view}`;
      if (window.location.hash === `#${hash}`) {
        actions.openFeature(view);
        return;
      }
      window.location.hash = hash;
    },

    openFeature(view) {
      if (view === "templates") {
        view = "report-templates";
        state.featureData = {
          ...(state.featureData || {}),
          reportTemplateGroup: "mine",
          materialsTab: "报告模板",
        };
      }
      if (view === "meetings") view = "experts";
      if (view === "profile" || view === "avatar") view = "star";
      state.view = view;
      state.featureData = state.featureData || {};
      if (view === "experts" && !state.featureData.expertTab) {
        state.featureData.expertTab = "meetings";
      }
      if (view === "skills") {
        actions.ensurePlatformExperts().then(() => rerender());
      }
      if (view === "star") {
        state.ui.previewOpen = false;
        state.ui.previewKind = null;
        state.ui.previewData = null;
        state.ui.allChatsOpen = false;
      }
      if (view === "radar") {
        const sector = state.featureData?.radarFilter || "全部";
        refreshRadarPage(state, rerender, sector);
      }
      rerender();
    },

    setRadarFilter(sector) {
      state.featureData = { ...(state.featureData || {}), radarFilter: sector };
      refreshRadarPage(state, rerender, sector);
    },

    materialsTab(tab) {
      const map = {
        报告模板: { redirect: "report-templates", reportTemplateGroup: "mine" },
        调研报告: { materialsSection: "saved", materialsSavedGroup: "ai" },
        会议纪要: { materialsSection: "saved", materialsSavedGroup: "ai" },
        企业名单: { materialsSection: "saved", materialsSavedGroup: "lists" },
        收藏资讯: { materialsSection: "saved", materialsSavedGroup: "news" },
      };
      const next = map[tab] || { materialsSection: "knowledge", materialsKbId: MATERIALS_KB_DEMO[0]?.id };
      if (next.redirect) {
        state.featureData = { ...(state.featureData || {}), reportTemplateGroup: next.reportTemplateGroup || "mine", materialsTab: tab };
        actions.go(next.redirect);
        return;
      }
      state.featureData = { ...(state.featureData || {}), ...next, materialsTab: tab };
      rerender();
    },

    reportTemplateNavigate(group) {
      state.featureData = {
        ...(state.featureData || {}),
        reportTemplateGroup: group || "org",
      };
      if (state.view !== "report-templates") {
        actions.go("report-templates");
        return;
      }
      rerender();
    },

    materialsNavigate(section, group) {
      if (section === "templates") {
        actions.reportTemplateNavigate(group || "mine");
        return;
      }
      const fd = { ...(state.featureData || {}) };
      fd.materialsSection = section;
      if (section === "saved") {
        fd.materialsSavedGroup = group || "lists";
        fd.materialsKbId = null;
      } else if (section === "knowledge") {
        fd.materialsKbId = group || null;
      }
      state.featureData = fd;
      state.ui.rowMenu = null;
      rerender();
    },

    materialsSelectKb(kbId) {
      state.featureData = {
        ...(state.featureData || {}),
        materialsSection: "knowledge",
        materialsKbId: kbId,
      };
      state.ui.rowMenu = null;
      rerender();
    },

    materialsCreateKb() {
      actions.toast("演示模式：创建资料库请使用 agent-demo WebUI");
    },

    materialsTestKb(kbId) {
      const name = MATERIALS_KB_DEMO.find((k) => k.id === kbId)?.name || "资料库";
      actions.toast(`演示模式：${name} 检索测试请使用 agent-demo WebUI`);
    },

    materialsKbAction(action, kbId) {
      state.ui.rowMenu = null;
      const name = MATERIALS_KB_DEMO.find((k) => k.id === kbId)?.name || "资料库";
      if (action === "edit") {
        actions.toast(`演示模式：编辑「${name}」请使用 agent-demo WebUI`);
        rerender();
        return;
      }
      if (action === "delete") {
        actions.toast(`演示模式：删除「${name}」请使用 agent-demo WebUI`);
      }
      rerender();
    },

    materialsRemoveSavedList(id) {
      const hidden = new Set(state.featureData?.materialsHiddenLists || []);
      hidden.add(id);
      state.featureData = { ...(state.featureData || {}), materialsHiddenLists: [...hidden] };
      update("已移除");
    },

    materialsRemoveSavedNews(id) {
      const hidden = new Set(state.featureData?.materialsHiddenNews || []);
      hidden.add(id);
      state.featureData = { ...(state.featureData || {}), materialsHiddenNews: [...hidden] };
      const idx = (state.userMaterials || []).findIndex((m) => m.id === id);
      if (idx >= 0) state.userMaterials.splice(idx, 1);
      update("已移除");
    },

    materialsRemoveSavedAi(id) {
      const hidden = new Set(state.featureData?.materialsHiddenAi || []);
      hidden.add(id);
      state.featureData = { ...(state.featureData || {}), materialsHiddenAi: [...hidden] };
      update("已移除");
    },

    openSavedListPreview(id) {
      const list = DEMO_SAVED_TARGET_LISTS.find((l) => l.id === id)
        || (state.userMaterials || []).find((m) => m.id === id);
      if (!list) {
        update("未找到该名单");
        return;
      }
      const title = list.name || list.title;
      const content = list.summary || list.fullText || "（Demo 名单预览）";
      state.ui.previewKind = "document";
      state.ui.previewData = {
        doc: {
          id: list.id,
          type: "企业名单",
          title,
          fullText: content,
        },
      };
      state.ui.previewOpen = true;
      update();
    },

    openSavedAiPreview(id) {
      const row = findSavedAiOutput(state, id);
      if (!row) {
        update("未找到该产出");
        return;
      }
      const kindLabel = { ai_report: "AI 报告", material: "材料", report_doc: "尽调报告" };
      const content = [
        `# ${row.name}`,
        "",
        `- 项目：${row.projectName}`,
        row.company ? `- 企业：${row.company}` : "",
        `- 类型：${kindLabel[row.kind] || row.kind}`,
        `- 更新：${row.updatedAt}`,
        "",
        "（Demo 预览：完整内容请在项目工作区内打开）",
      ].filter(Boolean).join("\n");
      state.ui.previewKind = "document";
      state.ui.previewData = {
        doc: {
          id: row.id,
          type: kindLabel[row.kind] || "AI 产出",
          title: row.name,
          fullText: content,
        },
      };
      state.ui.previewOpen = true;
      update();
    },

    /**
     * 投资雷达：在右栏打开资讯全文；同时收起「可能感兴趣」避免叠层
     */
    openNews(id) {
      const resolveAndOpen = (item) => {
        if (!item) { update("未找到该资讯"); return; }
        state.ui.previewKind = "news";
        state.ui.previewData = { item };
        state.ui.previewOpen = true;
        state.ui.radarInterestsOpen = false;
        update();
      };
      const local = findRadarNewsItem(state, id);
      if (local) {
        resolveAndOpen(local);
        return;
      }
      fetchRadarItem(id)
        .then(item => {
          if (!state.featureData) state.featureData = {};
          if (!state.featureData.radarItemCache) state.featureData.radarItemCache = {};
          state.featureData.radarItemCache[id] = item;
          resolveAndOpen(item);
        })
        .catch(() => update("未找到该资讯"));
    },

    saveNewsToMaterials(newsId) {
      const item = findRadarNewsItem(state, newsId);
      if (!item) return;
      const exists = (state.userMaterials || []).some(m => m.sourceNewsId === newsId);
      if (exists) { update("已在资料库中"); return; }
      state.userMaterials = state.userMaterials || [];
      state.userMaterials.push({
        id: "umat-" + Date.now(),
        type: "收藏资讯",
        title: item.title,
        date: item.time || item.date,
        source: item.source,
        sourceNewsId: newsId,
        projectId: null,
        fullText: item.fullText || item.summary
      });
      update("已收藏到资料库");
    },

    openMaterial(id, kind) {
      if (kind === "note") {
        const note = MEETING_NOTES_LIB.find(n => n.id === id);
        if (!note) return;
        state.ui.previewKind = "document";
        state.ui.previewData = {
          doc: {
            id: note.id,
            type: "会议纪要",
            title: note.title,
            date: note.date,
            source: note.speaker,
            fullText: `【${note.title}】\n\n发言人：${note.speaker}\n日期：${note.date}\n要点数：${note.points}\n标签：${note.tags.join("、")}\n\n（Demo 纪要全文）`
          }
        };
      } else {
        const doc = [...ORG_TEMPLATE_LIBRARY, ...MATERIALS_LIB, ...(state.userMaterials || [])].find(m => m.id === id);
        if (!doc) return;
        state.ui.previewKind = "document";
        state.ui.previewData = { doc };
      }
      state.ui.previewOpen = true;
      update();
    },

    openReporterRequest() {
      actions._ensureJournalistView();
      actions.spendCredits(CREDIT_COSTS.reporter, "reporter");
    },

    _ensureJournalistView() {
      if (state.view !== "journalist") {
        window.location.hash = "/journalist";
      }
    },

    _openReporterRequestModal() {
      const pre = state.ui.reporterRequestPrefill || {};
      state.ui.reporterRequestPrefill = null;
      openModal(state, "reporter-request", {
        company: pre.company ?? s()?.company ?? "",
        questions: pre.questions ?? ""
      });
      update();
    },

    _queueReporterRequestPrefill(prefill = {}) {
      state.ui.reporterRequestPrefill = {
        company: prefill.company ?? s()?.company ?? "",
        questions: prefill.questions ?? ""
      };
    },

    submitReporterRequest() {
      const company = document.getElementById("jr-company")?.value?.trim();
      const questions = document.getElementById("jr-questions")?.value?.trim();
      const contact = document.getElementById("jr-contact")?.value?.trim();
      if (!company || !questions || !contact) { update("请填写企业、核实问题和联系方式"); return; }
      const req = {
        id: "jr-" + Date.now(),
        company,
        questions,
        contact,
        status: "等待匹配调研团队",
        submittedAt: "刚刚"
      };
      state.reporterRequests = state.reporterRequests || [];
      state.reporterRequests.unshift(req);
      closeModal(state);
      window.location.hash = "/journalist";
      openModal(state, "contact-submitted", {
        title: "已收到你的调研需求",
        message: "已收到，会有专人与你联系"
      });
      update();
    },

    openReporterConsult(reporterId) {
      actions.openReporterRequest();
    },

    goReporterBooking(reporterId) {
      actions._ensureJournalistView();
      if (reporterId) {
        actions.openReporterConsult(reporterId);
      } else {
        actions.openReporterRequest();
      }
      update();
    },

    goExpertBooking(expertId) {
      state.view = "experts";
      state.featureData = { ...(state.featureData || {}), expertTab: "booking" };
      window.location.hash = "/experts";
      if (expertId) {
        actions.openExpertBook(expertId);
      }
      update();
    },

    openExpertBook(expertId) {
      actions.spendCredits(CREDIT_COSTS.expert, "expert", { expertId });
    },

    _openExpertBookModal(expertId) {
      const expert = MEETING_EXPERTS.find(e => e.id === expertId) || MEETING_EXPERTS[0];
      openModal(state, "expert-book", { expert });
      update();
    },

    openExpertMatch() {
      openModal(state, "expert-match");
      update();
    },

    submitExpertBook() {
      const topic = document.getElementById("eb-topic")?.value?.trim();
      const contact = document.getElementById("eb-contact")?.value?.trim();
      if (!topic || !contact) { update("请填写想了解的问题和联系方式"); return; }
      closeModal(state);
      openModal(state, "contact-submitted", {
        title: "预约申请已提交",
        message: "已收到，会有专人与你联系"
      });
      update();
    },

    submitExpertMatch() {
      const topic = document.getElementById("em-topic")?.value?.trim();
      const pref = document.getElementById("em-pref")?.value?.trim();
      const contact = document.getElementById("em-contact")?.value?.trim();
      if (!topic || !contact) { update("请填写诉求和联系方式"); return; }
      closeModal(state);
      openModal(state, "contact-submitted", {
        title: "已收到你的专家需求",
        message: "已收到，匹配到合适专家后会联系你"
      });
      update();
    },

    setAsTemplate(materialId) {
      actions.useTemplate(materialId);
    },

    bookMeeting(id) {
      if (!state.meetingEnrollments.includes(id)) {
        state.meetingEnrollments.push(id);
      }
      update("已报名，会议开始前会提醒你");
    },

    teachStar(text) {
      const t = (text || "").trim();
      if (!t) { update("请输入要记住的内容"); return; }
      state.starMemories = state.starMemories || [...STAR_DATA.memories];
      if (!Array.isArray(state.starMemories)) {
        state.starMemories = [...STAR_DATA.memories];
      }
      state.starMemories.push(t);
      saveStarMemoriesToStorage(state.starMemories);
      update("小星已记住");
    },

    toast(msg) { update(msg); },

    removeRadarFocusSector(sector) {
      if (!state.userSectors?.length) state.userSectors = ["医疗器械", "航空MRO"];
      if (state.userSectors.length <= 1) {
        update("至少保留一个关注赛道");
        return;
      }
      state.userSectors = state.userSectors.filter(s => s !== sector);
      actions._syncRadarFocusSectors();
      if (state.featureData?.weeklySector === sector) {
        actions.setWeeklySector(state.userSectors[0]);
      }
      if (state.featureData?.radarFilter === sector) {
        actions.setRadarFilter("全部");
      }
      update("已取消关注");
    },

    promptAddRadarFocusSector() {
      const val = window.prompt("输入要关注的赛道名称", "");
      if (!val?.trim()) return;
      actions.addRadarFocusSector(val.trim());
    },

    addRadarFocusSector(sector) {
      const s = String(sector || "").trim().replace(/^航空 MRO$/i, "航空MRO");
      if (!s) return;
      if (!state.userSectors?.length) state.userSectors = ["医疗器械", "航空MRO"];
      if (state.userSectors.includes(s)) {
        update("该赛道已在列表中");
        return;
      }
      state.userSectors = [...state.userSectors, s];
      actions._syncRadarFocusSectors();
      actions.setWeeklySector(s);
      update(`已关注 ${s}`);
    },

    _syncRadarFocusSectors() {
      const sectors = state.userSectors || [];
      const memories = loadStarMemoriesFromStorage() || defaultStarMemories();
      const rest = memories.filter(m => !/^关注赛道[：:]/.test(String(m)));
      if (sectors.length) {
        saveStarMemoriesToStorage([`关注赛道：${sectors.join("、")}`, ...rest]);
      }
      syncRadarUserProfile(state);
    },

    toggleSector(sector) {
      const idx = state.userSectors.indexOf(sector);
      if (idx >= 0) state.userSectors.splice(idx, 1);
      else state.userSectors.push(sector);
      update(state.userSectors.includes(sector) ? `已关注 ${sector}` : `已取消关注 ${sector}`);
    },

    runFind(query) {
      actions.startFindMode();
      const q = (query || "").trim();
      if (q.length > 2) actions.findInChat(q);
    },

    downloadList() {
      const r = state.featureData?.searchResult || COMPANY_SEARCH_RESULT;
      const header = "企业名称,营收,成立年限,专家评分,标签\n";
      const rows = r.companies.map(c => `${c.name},${c.revenue},${c.years}年,${c.score},${(c.tags || []).join("/")}`).join("\n");
      const blob = new Blob(["\ufeff" + header + rows], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `企业名单_${r.region || "导出"}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      update("名单已下载（CSV）");
    },

    downloadBatchEval() {
      const r = getBatchEvalResult();
      const blob = new Blob(["\ufeff" + batchEvalToCsvRows(r)], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const label = (r.query || r.industry || "批量评估").replace(/[\\/:*?"<>|]/g, "_");
      a.download = `批量评估结果_${label}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      update("评估结果已下载（CSV）");
    },

    saveBatchEvalToMaterials() {
      const r = getBatchEvalResult();
      const title = `批量评估 · ${r.query || r.industry || "企业名单"}`;
      const batchKey = r.evaluatedAt ? `${title} · ${r.evaluatedAt}` : title;
      const exists = (state.userMaterials || []).some(m => m.type === "批量评估" && m.batchKey === batchKey);
      if (exists) {
        update("该评估结果已在资料库中");
        return;
      }
      state.userMaterials = state.userMaterials || [];
      state.userMaterials.unshift({
        id: "umat-batch-" + Date.now(),
        type: "批量评估",
        title,
        batchKey,
        date: r.evaluatedAt || "今天",
        source: "财跃启明星 · 批量评估",
        projectId: null,
        fullText: formatBatchEvalDocument(r)
      });
      update("评估结果已保存到资料库");
    },

    runBatchEvalPipeline(userText = "") {
      const source = state.featureData?.searchResult;
      const names = (source?.companies || []).map((c) => c.name).filter(Boolean);
      const trimmed = String(userText || "").trim();
      const listText = trimmed
        || (names.length ? names.join("、") : (source?.query || "请根据对话中最近提到的候选企业名单"));
      if (!trimmed) pushUser("批量对比打分");
      agentTurn({
        text: `请对以下企业批量对比打分（Markdown 表格：企业名、综合分、推荐理由、主要风险）：\n${listText}`,
        chatMode: "batch",
        session: s(),
      }).then(() => {
        state.chatMode = null;
        state.ui.composerChip = null;
        state.ui.composerHint = null;
        update();
      });
    },

    batchEval() {
      if (!state.session) actions.newChat();
      state.view = "chat";
      if (state.ui.previewKind === "company-list" && state.featureData?.searchResult) {
        actions.runBatchEvalPipeline();
        return;
      }
      actions.selectComposerChip("批量对比打分");
    },

    findToProject(company) {
      const id = "proj-" + Date.now();
      const name = `${company.replace(/有限公司$/, "")} 尽调`;
      const sess = createSession({
        id, kind: "project", projectId: id, name, company, saved: true,
        messages: [
          { role: "agent", type: "text", text: `已为 **${company}** 创建尽调项目。\n\n建议路径：查这家 → 上传材料 → 行业分析 → 撰写报告 → 风控预演。` }
        ]
      });
      state.session = sess;
      state.view = "chat";
      state.sessionId = id;
      state.sessionCache[id] = sess;
      if (!PROJECT_LIST.find(p => p.id === id)) {
        PROJECT_LIST.unshift({ id, name, company, industry: "医疗器械", round: "", manager: "当前用户", org: "某机构", updated: "刚刚" });
      }
      state.ui.filesOpen = true;
      clearContextTags();
      window.location.hash = `/p/${id}`;
      update("已发起尽调");
    },

    openPanel(kind, data) {
      const prevKind = state.ui.previewKind;
      const wasOpen = state.ui.previewOpen;
      state.ui.aiOutputMenuOpen = false;
      state.ui.previewKind = kind;
      if (kind === "report") {
        if (!wasOpen || prevKind !== "report") {
          state.ui.rightPanelWidth = REPORT_PANEL_DEFAULT_WIDTH;
        }
        const sess = s();
        const doc = getActiveReportDoc(sess);
        if (data?.activeReportId && sess) {
          const pick = getSessionReports(sess).find(r => r.id === data.activeReportId);
          if (pick) {
            sess.activeReportId = pick.id;
            syncLegacyReportFields(sess, pick);
          }
        }
        const active = getActiveReportDoc(sess);
        state.ui.previewData = data || buildPreviewFromReportDoc(sess, active) || {
          template: "标准报告结构",
          fields: REPORT_MOCK,
          sections: REPORT_SECTIONS,
          company: sess?.company || "",
          reportVersions: [],
          activeVersion: null,
          reports: [],
          activeReportId: null
        };
      } else if (kind === "batch-eval") {
        state.ui.previewData = data || { result: getBatchEvalResult() };
      } else if (kind === "journalist-report") {
        const sess = s();
        const pid = data?.projectId || sess?.projectId || JOURNALIST.completedReport.projectId || null;
        state.ui.previewData = data || { report: JOURNALIST.completedReport, projectId: pid };
      } else if (kind === "sector-weekly") {
        const sector = data?.sector || state.featureData?.weeklySector || state.userSectors?.[0] || "医疗器械";
        state.featureData = { ...(state.featureData || {}), weeklySector: sector };
        state.ui.previewData = data?.data
          ? data
          : { sector, data: state.featureData?.radarWeekly || null };
        if (state.view === "radar") state.ui.radarInterestsOpen = false;
      } else if (kind === "industry") {
        state.ui.previewData = data?.analysis
          ? data
          : { analysis: state.featureData?.activeIndustryAnalysis || INDUSTRY_ANALYSIS };
      } else if (kind === "entry-brief") {
        state.ui.previewData = data || state.ui.previewData || s()?.entryBrief || null;
      } else {
        state.ui.previewData = data || null;
      }
      state.ui.previewOpen = true;
      update();
    },

    reportTab(tab) {
      state.ui.reportTab = tab;
      update();
    },

    openVerifyModal(field) {
      actions._queueReporterRequestPrefill({
        questions: String(field || "")
      });
      actions._ensureJournalistView();
      actions.openReporterRequest();
    },

    doIndustry(industry) {
      const label = (industry || s()?.industry || "").trim();
      if (label) s().industry = label;
      agentTurn({ text: label, chatMode: "industry", session: s() });
    },

    doGap() {
      agentTurn({ text: s()?.company || "", chatMode: "gap", session: s() });
    },

    doRiskQna() {
      const sess = s();
      agentTurn({
        text: sessionHasReports(sess) ? "基于当前报告做风控预演" : "做立项会风控追问预演",
        chatMode: "riskqna",
        session: sess,
      });
    },

    openMeetingMaterialsPacker() {
      const sess = s();
      if (!sessionHasReports(sess)) {
        pushAgent({ type: "text", text: "请先 **撰写报告** 生成初稿，再准备上会材料包。" });
        update();
        return;
      }
      const doc = getActiveReportDoc(sess);
      const latestVer = doc?.reportVersions?.[doc.reportVersions.length - 1];
      const citedIds = new Set();
      (latestVer.fields || []).forEach(f => {
        (sess.materials || []).forEach(m => {
          if (f.source && m.name && f.source.includes(m.name.replace(/\.\w+$/, "").slice(0, 6))) {
            citedIds.add(m.id);
          }
        });
      });
      const defaultSelected = (sess.materials || [])
        .filter(m => citedIds.has(m.id) || /审计|bp|商业计划|临床/i.test(m.name))
        .map(m => m.id);
      state.ui.meetingMaterialsDraft = {
        reportDocId: doc?.id,
        reportVersion: doc?.activeVersion || latestVer?.v,
        selectedFileIds: defaultSelected.length ? defaultSelected : (sess.materials || []).slice(0, 3).map(m => m.id),
        generatedDocs: ["summary", "qna"]
      };
      openModal(state, "meeting-materials");
      update();
    },

    setMeetingReportVersion(versionId) {
      const draft = state.ui.meetingMaterialsDraft;
      if (!draft) return;
      draft.reportVersion = versionId;
      update();
    },

    setMeetingReportDoc(reportDocId) {
      const draft = state.ui.meetingMaterialsDraft;
      if (!draft) return;
      const sess = s();
      const doc = getSessionReports(sess).find(r => r.id === reportDocId);
      draft.reportDocId = reportDocId;
      draft.reportVersion = doc?.activeVersion || doc?.reportVersions?.[doc.reportVersions.length - 1]?.v;
      update();
    },

    toggleMeetingMaterial(fileId) {
      const draft = state.ui.meetingMaterialsDraft;
      if (!draft) return;
      const set = new Set(draft.selectedFileIds || []);
      if (set.has(fileId)) set.delete(fileId);
      else set.add(fileId);
      draft.selectedFileIds = [...set];
      update();
    },

    toggleMeetingGeneratedDoc(docKey) {
      const draft = state.ui.meetingMaterialsDraft;
      if (!draft) return;
      const set = new Set(draft.generatedDocs || []);
      if (set.has(docKey)) set.delete(docKey);
      else set.add(docKey);
      draft.generatedDocs = [...set];
      update();
    },

    exportMeetingPackage() {
      const sess = s();
      const draft = state.ui.meetingMaterialsDraft;
      if (!draft) return;
      sess.meetingMaterials = {
        reportDocId: draft.reportDocId,
        selectedFiles: draft.selectedFileIds,
        reportVersion: draft.reportVersion,
        generatedDocs: draft.generatedDocs
      };
      closeModal(state);
      state.ui.meetingMaterialsDraft = null;
      const count = (draft.selectedFileIds?.length || 0) + (draft.generatedDocs?.length || 0) + 1;
      update(`投委会材料包已导出（Mock · 含 ${count} 项）`);
    },

    openReportFromBanner() {
      actions.openPanel("report");
    },

    openAIReportFile(reportId) {
      const sess = s();
      const entry = (sess.aiReports || []).find(r => r.id === reportId);
      if (!entry) return;
      if (entry.reportDocId) {
        actions.switchActiveReport(entry.reportDocId);
        if (entry.version) {
          const doc = getSessionReports(sess).find(r => r.id === entry.reportDocId);
          if (doc?.reportVersions?.some(v => v.v === entry.version)) {
            doc.activeVersion = entry.version;
            syncLegacyReportFields(sess, doc);
          }
        }
      }
      actions.openPanel("report");
    },

    startQnaList() {
      streamAgent("这份问题清单是给**企业高管**（核实经营/财务/治理），还是给**行业专家**（验证赛道/竞争/技术判断）？", { uiOnly: true, charMode: false }).then(() => {
        pushAgent({
          type: "choice-card",
          data: {
            choices: [
              { label: "给企业高管", action: "给企业高管" },
              { label: "给行业专家", action: "给行业专家" }
            ]
          }
        });
        update();
      });
    },

    generateQna(target) {
      const co = s()?.company || "";
      const label = target === "company" ? "企业高管" : "行业专家";
      pushUser(target === "company" ? "给企业高管" : "给行业专家");
      agentTurn({
        text: `为「${co || "当前尽调标的"}」生成给${label}的尽调访谈问题清单（按类别 Markdown 列表）`,
        chatMode: "qna",
        session: s(),
      });
    },

    doInterviewOutline() {
      actions.startQnaList();
    },

    requestJournalist() {
      const co = s()?.company || "";
      if (!co) {
        actions.startJournalistCompanyMode();
        return;
      }
      actions._openJournalistRequestForCompany(co);
    },

    bookExpert(id) {
      actions.summonExpert(id);
    },

    summonExpert(id) {
      const list = state.platformExperts || [];
      const expert = getPlatformExpertById(id, list)
        || EXPERT_LIST.find((e) => e.id === id)
        || (state.userExperts || []).find((e) => e.id === id);
      if (!expert) {
        update("未找到该专家");
        return;
      }
      const eid = expert.id || expert.frontend_id;
      const sess = createSession({ name: `与${expert.name}对话` });
      state.session = sess;
      state.view = "chat";
      state.sessionId = sess.id;
      state.sessionCache[sess.id] = sess;
      state.ui.activeExpertId = eid;
      state.ui.activeExpertIds = [eid];
      state.ui.multiExpertDiscussion = false;
      state.ui.expertMenuOpen = false;
      state.ui.chatInput = "";
      state.ui.composerHint = `已召唤 ${expert.name}，直接输入问题即可`;
      state.ui.composerMenu = null;
      state.ui.filesOpen = false;
      window.location.hash = `/chat/${sess.id}`;
      pushAgent({
        type: "text",
        text: `你好，我是 ${expert.name}。${expert.summary || expert.field || "请告诉我你的尽调问题。"}`,
        markdown: false,
      });
      update();
      requestAnimationFrame(() => document.getElementById("chat-input")?.focus());
    },

    openExpertDetail(id) {
      const list = state.platformExperts || [];
      const expert = getPlatformExpertById(id, list)
        || EXPERT_LIST.find((e) => e.id === id)
        || (state.userExperts || []).find((e) => e.id === id);
      if (!expert) return;
      openModal(state, "expert-detail", { expert });
      update();
    },

    ensurePlatformExperts() {
      if (state.platformExperts?.length) return Promise.resolve(state.platformExperts);
      return loadPlatformExperts().then((list) => {
        state.platformExperts = list;
        setPlatformExpertsForPicker(list);
        return list;
      });
    },

    openPanelStandalone(kind) {
      const sess = createSession({ name: "一线调研", company: "" });
      sess.messages = [
        { role: "agent", type: "text", text: "一线调研报告（Demo 已完成）：" },
        { role: "agent", type: "panel-link", data: { kind, iconKey: "newspaper", title: "一线调研报告", desc: "实地核实" } }
      ];
      state.session = sess;
      state.view = "chat";
      state.sessionId = sess.id;
      state.sessionCache[sess.id] = sess;
      window.location.hash = `/chat/${sess.id}`;
      actions.openPanel(kind);
    },

    openJournalistReport(projectId) {
      const report = JOURNALIST.completedReport;
      const pid = projectId || report.projectId || s()?.projectId || null;
      state.ui.previewKind = "journalist-report";
      state.ui.previewData = { report, projectId: pid };
      state.ui.previewOpen = true;
      if (state.view !== "journalist" && state.view !== "materials" && !isChatShellView()) {
        state.view = "journalist";
        window.location.hash = "/journalist";
      }
      update();
    },

    expertTab(tab) {
      const normalized = tab === "ai" ? "meetings" : tab;
      state.featureData = { ...(state.featureData || {}), expertTab: normalized };
      rerender();
    },

    meetingTab(tab) {
      const map = { center: "meetings", notes: "notes", booking: "booking" };
      actions.expertTab(map[tab] || tab);
    },

    meetingSector(sector) {
      state.featureData = { ...(state.featureData || {}), meetingSector: sector };
      rerender();
    },

    setNotesSector(sector) {
      state.featureData = { ...(state.featureData || {}), notesSector: sector };
      rerender();
    },

    enrollMeeting(id) {
      actions.bookMeeting(id);
    },

    openMeetingNotesLib(id) {
      actions.openMaterial(id, "note");
    },

    openAddMonitor(projectId) {
      openModal(state, "add-monitor", projectId ? { projectId } : null);
      update();
    },

    setMonitorFilter(filter) {
      const normalized = filter === "projects" ? "all" : filter;
      state.featureData = { ...(state.featureData || {}), monitorFilter: normalized, monitorCompanyKey: "all" };
      rerender();
    },

    setMonitorCompany(companyKey) {
      state.featureData = { ...(state.featureData || {}), monitorCompanyKey: companyKey || "all" };
      rerender();
    },

    editMonitorRule(ruleId) {
      const rule = (state.userMonitors || []).find(r => r.id === ruleId);
      if (!rule) { update("未找到该条件"); return; }
      openModal(state, "add-monitor", {
        editId: ruleId,
        projectId: rule.projectId || "",
        prefillNL: rule.userDefinedRisk?.condition || ""
      });
      update();
    },

    deleteMonitorRule(ruleId) {
      const idx = (state.userMonitors || []).findIndex(r => r.id === ruleId);
      if (idx < 0) { update("未找到该条件"); return; }
      state.userMonitors.splice(idx, 1);
      update("已删除预警条件");
    },

    askMonitorAI(monitorId) {
      const item = [...POST_MONITOR, ...(state.userMonitors || [])].find(m => m.id === monitorId);
      if (!item) { update("未找到该动态"); return; }
      const sess = createSession({
        company: item.company,
        projectId: item.projectId || null,
        messages: []
      });
      state.session = sess;
      state.sessionId = sess.id;
      state.sessionCache[sess.id] = sess;
      state.view = "chat";
      state.ui.composerHint = `关于「${item.company}」这条变化：${item.change || ""}。你想怎么处理？`;
      state.ui.chatInput = item.projectId
        ? `@小星 对照项目「${item.projectName || item.company}」解读这条变化，并建议下一步`
        : `@小星 解读这条企业变化：${item.change || item.company}`;
      window.location.hash = `/chat/${sess.id}`;
      update();
    },

    goToProjectFromMonitor(projectId) {
      state.view = "chat";
      actions.openSession(projectId);
    },

    disableProjectWatch(projectId) {
      const profile = PROJECT_WATCH_PROFILE.find(p => p.projectId === projectId);
      if (profile) profile.watching = false;
      const proj = (state.projectList || PROJECT_LIST).find(p => p.id === projectId);
      update(proj ? `已关闭「${proj.name}」监控` : "已关闭监控");
    },

    toggleProjectWatch(projectId) {
      const profile = PROJECT_WATCH_PROFILE.find(p => p.projectId === projectId);
      if (profile?.watching) {
        actions.disableProjectWatch(projectId);
        return;
      }
      actions.enableProjectWatch(projectId);
    },

    openAllChats() {
      state.ui.allChatsOpen = true;
      update();
    },

    closeAllChats() {
      state.ui.allChatsOpen = false;
      update();
    },

    setProjectsSearch(q) {
      if (!state.featureData) state.featureData = {};
      state.featureData.projectsSearch = q;
      update();
    },

    enableProjectWatch(projectId) {
      const proj = (state.projectList || PROJECT_LIST).find(p => p.id === projectId);
      if (!proj) return;
      const profile = PROJECT_WATCH_PROFILE.find(p => p.projectId === projectId);
      if (profile) {
        profile.watching = true;
        profile.projectName = proj.name;
        profile.company = proj.company || proj.name;
      } else {
        PROJECT_WATCH_PROFILE.push({
          projectId,
          projectName: proj.name,
          company: proj.company || proj.name,
          industry: proj.industry || "",
          watching: true,
          lastScan: "刚刚",
          alertCount: 0,
          autoRules: [
            { id: "ar-" + Date.now(), text: "对照尽调报告待核项恶化", from: "项目材料" }
          ]
        });
      }
      state.featureData = { ...(state.featureData || {}), monitorFilter: "all" };
      update(`已开启「${proj.name}」监控`);
    },

    submitMonitor() {
      const editId = document.getElementById("mon-edit-id")?.value || "";
      const projectId = document.getElementById("mon-project")?.value || "";
      const nl = document.getElementById("mon-nl")?.value?.trim();
      if (!nl) { update("用一句话说明要盯什么"); return; }
      const proj = projectId ? (state.projectList || PROJECT_LIST).find(p => p.id === projectId) : null;
      const parsed = parseMonitorIntent(nl, state.projectList || PROJECT_LIST);
      if (proj) {
        parsed.projectId = proj.id;
        parsed.projectName = proj.name;
        parsed.company = proj.company || parsed.company;
      } else {
        parsed.projectId = null;
        parsed.projectName = "";
      }
      if (editId) {
        const existing = (state.userMonitors || []).find(r => r.id === editId);
        if (!existing) { update("未找到该条件"); return; }
        Object.assign(existing, parsed, {
          monitoring: existing.monitoring !== false,
          triggered: existing.triggered || false
        });
        closeModal(state);
        state.featureData = { ...(state.featureData || {}), monitorFilter: "rules" };
        update("已更新预警条件");
        return;
      }
      state.userMonitors.push({
        id: "um-" + Date.now(),
        ...parsed,
        triggered: false,
        monitoring: true,
        aiSummary: "小星已加入盯盘列表，会与项目投前假设一并对照。",
        time: "刚刚"
      });
      closeModal(state);
      state.featureData = { ...(state.featureData || {}), monitorFilter: "rules" };
      update(`已为${proj ? `「${proj.name}」` : "该企业"}添加预警条件`);
    },

    uploadTemplate() {
      openModal(state, "upload-template");
      update();
    },

    submitUploadTemplate() {
      const scenario = (document.getElementById("tpl-scenario")?.value || "").trim();
      if (!scenario) {
        update("请用一句话描述模板的使用场景");
        return;
      }
      const stamp = "20250625";
      const title = `机构尽调报告模板_v1.0-${stamp}`;
      const id = "tpl-user-" + Date.now();
      const entry = {
        id,
        type: "报告模板",
        title,
        scenario,
        date: "刚刚上传",
        source: "本地上传",
        projectId: null,
        fullText: `【用户上传模板】\n文件名：${title}\n格式：Word / Markdown / Excel / CSV 等\n使用场景：${scenario}\n\n小星已解析章节结构（Demo），撰写报告时将按此模板填充字段。`
      };
      state.userMaterials = state.userMaterials || [];
      state.userMaterials.unshift(entry);
      const templates = state.userTemplates || [...MY_TEMPLATES];
      templates.push({
        id,
        name: title,
        type: "尽调报告",
        fields: 12,
        uploaded: true,
        builtin: false,
        scenario
      });
      state.userTemplates = templates;
      state.featureData = {
        ...(state.featureData || {}),
        reportTemplateGroup: "mine",
        materialsTab: "报告模板",
      };
      closeModal(state);
      if (state.view !== "report-templates") {
        state.view = "report-templates";
        window.location.hash = "/report-templates";
      }
      update("模板已上传");
    },

    useTemplate(id) {
      actions.openMaterial(id);
    },

    addSkill(id) {
      actions.toggleMarketSkill(id);
    },

    setSkillsKind(kind) {
      state.ui.skillsKind = kind;
      update();
    },

    setSkillCategory(category) {
      state.ui.skillCategory = category;
      update();
    },

    toggleMarketSkill(skillId) {
      const platform = findPlatformSkill(skillId);
      const custom = (state.customSkillDefs || []).find((s) => s.id === skillId);
      const skill = platform || custom;
      if (!skill) return;
      const owned = state.userSkills || [];
      const installed = owned.includes(skillId);
      if (installed) {
        state.userSkills = owned.filter((sid) => sid !== skillId);
        const skillName = platform?.name || custom?.name;
        if (skillName) {
          MY_AVATAR.equippedSkills = (MY_AVATAR.equippedSkills || []).filter((n) => n !== skillName);
        }
        update(`已移除技能：${platform?.name || custom?.name || skillId}`);
        return;
      }
      state.userSkills = [...owned, skillId];
      if (platform) {
        state.mySkillBookmarks = state.mySkillBookmarks || [];
        if (!state.mySkillBookmarks.some((b) => b.catalogId === skillId)) {
          state.mySkillBookmarks.push({
            id: `bm-${skillId}`,
            name: platform.name,
            catalogId: skillId,
          });
        }
      }
      const skillName = platform?.name || custom?.name;
      if (skillName && !MY_AVATAR.equippedSkills.includes(skillName)) {
        MY_AVATAR.equippedSkills = [...MY_AVATAR.equippedSkills, skillName];
      }
      update(`已安装技能：${skillName}`);
    },

    toggleMarketConnector(installKey) {
      const conn = findPlatformConnector(installKey);
      if (!conn) return;
      state.installedConnectors = state.installedConnectors || [];
      const installed = state.installedConnectors.includes(installKey);
      if (installed) {
        state.installedConnectors = state.installedConnectors.filter((k) => k !== installKey);
        update(`已移除 ${conn.name}`);
        return;
      }
      state.installedConnectors = [...state.installedConnectors, installKey];
      update(`已安装 ${conn.name}（${conn.serverCount} 路数据服务）`);
    },

    setSkillsTab(tab) {
      state.ui.skillsTab = tab;
      update();
    },

    openSkillWizard() {
      state.ui.skillWizard = { step: 0, draft: { name: "", category: "财务", desc: "", scope: "personal" } };
      openModal(state, "skill-wizard");
      update();
    },

    openExpertWizard() {
      const defaultSkillIds = (state.userSkills?.length
        ? state.userSkills.slice(0, 2)
        : PLATFORM_SKILLS_CATALOG.slice(0, 2).map(s => s.id));
      state.ui.expertWizard = {
        step: 0,
        draft: { name: "", domain: "", skills: defaultSkillIds, scope: "personal" }
      };
      openModal(state, "expert-wizard");
      update();
    },

    skillWizardNext() {
      const w = state.ui.skillWizard;
      if (!w) return;
      const nameEl = document.getElementById("sw-name");
      const catEl = document.getElementById("sw-category");
      const descEl = document.getElementById("sw-desc");
      const scopeEl = document.getElementById("sw-scope");
      if (w.step === 0) {
        w.draft.name = nameEl?.value?.trim() || "";
        w.draft.category = catEl?.value || "财务";
        if (!w.draft.name) { update("请填写技能名称"); return; }
        w.step = 1;
        update();
        return;
      }
      if (w.step === 1) {
        w.draft.desc = descEl?.value?.trim() || "";
        if (!w.draft.desc) { update("请填写技能描述"); return; }
        w.step = 2;
        update();
        return;
      }
      if (w.step === 2) {
        w.draft.scope = scopeEl?.value || "personal";
        actions.createSkill(w.draft);
      }
    },

    skillWizardBack() {
      const w = state.ui.skillWizard;
      if (!w || w.step <= 0) return;
      w.step -= 1;
      update();
    },

    expertWizardNext() {
      const w = state.ui.expertWizard;
      if (!w) return;
      const nameEl = document.getElementById("ew-name");
      const domainEl = document.getElementById("ew-domain");
      const scopeEl = document.getElementById("ew-scope");
      if (w.step === 0) {
        w.draft.name = nameEl?.value?.trim() || "";
        w.draft.domain = domainEl?.value?.trim() || "";
        if (!w.draft.name) { update("请填写专家名称"); return; }
        w.step = 1;
        update();
        return;
      }
      if (w.step === 1) {
        const checked = [...document.querySelectorAll(".ew-skill-check:checked")].map(el => el.value);
        w.draft.skills = checked;
        w.step = 2;
        update();
        return;
      }
      if (w.step === 2) {
        w.draft.scope = scopeEl?.value || "personal";
        actions.createExpert(w.draft);
      }
    },

    expertWizardBack() {
      const w = state.ui.expertWizard;
      if (!w || w.step <= 0) return;
      w.step -= 1;
      update();
    },

    toggleExpertWizardSkill(skillId) {
      const w = state.ui.expertWizard;
      if (!w) return;
      const skills = new Set(w.draft.skills || []);
      if (skills.has(skillId)) skills.delete(skillId);
      else skills.add(skillId);
      w.draft.skills = [...skills];
      update();
    },

    createSkill({ name, desc, category, scope }) {
      const id = `csk-${Date.now()}`;
      const entry = {
        id,
        name,
        desc,
        category: category || "技能型",
        scope: scope || "personal",
        source: "custom",
        createdAt: new Date().toISOString().slice(0, 10)
      };
      state.customSkillDefs = [...(state.customSkillDefs || []), entry];
      state.ui.skillWizard = null;
      closeModal(state);
      state.ui.skillsTab = "my";
      state.ui.skillsKind = "skill";
      update(`技能「${name}」已创建`);
    },

    updateSkill(id, patch) {
      state.customSkillDefs = (state.customSkillDefs || []).map(s =>
        s.id === id ? { ...s, ...patch } : s
      );
      update("技能已更新");
    },

    deleteSkill(id) {
      state.customSkillDefs = (state.customSkillDefs || []).filter(s => s.id !== id);
      state.userSkills = (state.userSkills || []).filter(sid => sid !== id);
      update("技能已删除");
    },

    shareSkill(id) {
      actions.updateSkill(id, { scope: "team" });
      update("已分享给团队");
    },

    createExpert({ name, domain, skills, scope }) {
      const id = `cex-${Date.now()}`;
      const skillNames = (skills || []).map(sid => {
        const platform = findPlatformSkill(sid);
        const custom = (state.customSkillDefs || []).find(s => s.id === sid);
        return platform?.name || custom?.name || sid;
      });
      const entry = {
        id,
        name,
        domain: domain || "",
        field: domain || "",
        skills: skillNames,
        scope: scope || "personal",
        source: "custom",
        iconKey: "star",
        category: "skill",
        createdAt: new Date().toISOString().slice(0, 10)
      };
      state.userExperts = [...(state.userExperts || []), entry];
      state.ui.expertWizard = null;
      closeModal(state);
      state.ui.skillsTab = "my";
      state.ui.skillsKind = "expert";
      update(`AI 专家「${name}」已创建`);
    },

    updateExpert(id, patch) {
      state.userExperts = (state.userExperts || []).map(e =>
        e.id === id ? { ...e, ...patch } : e
      );
      update("专家已更新");
    },

    deleteExpert(id) {
      state.userExperts = (state.userExperts || []).filter(e => e.id !== id);
      update("专家已删除");
    },

    shareExpert(id) {
      actions.updateExpert(id, { scope: "team" });
      update("已分享给团队");
    },

    mountSkillToExpert(expertId, skillId) {
      const expert = (state.userExperts || []).find(e => e.id === expertId);
      if (!expert) return;
      const skills = new Set(expert.skills || []);
      const platform = findPlatformSkill(skillId);
      const custom = (state.customSkillDefs || []).find(s => s.id === skillId);
      const label = platform?.name || custom?.name || skillId;
      skills.add(label);
      actions.updateExpert(expertId, { skills: [...skills] });
    },

    showSource(key) {
      const sess = s();
      const e = EVIDENCE[key];
      if (e?.file && sess) {
        const material = sess.materials.find(m => m.name === e.file);
        if (material) state.ui.selectedFileId = material.id;
      }
      state.ui.previewSourceKey = key;
      state.ui.previewKind = "file";
      state.ui.previewOpen = true;
      update();
    },

    closeDrawer() {
      closeDrawer(state);
      update();
    },

    /** 首页三能力卡片入口：快速初筛 / 批量对比打分 / 公开风险速览 */
    runHomeFeature(feature) {
      const map = {
        bp: () => actions.doBPAnalysis(),
        batch: () => actions.doBatchDeep(),
        risk: () => actions.startRiskScanMode(),
        deep: () => actions.spendCredits(CREDIT_COSTS.deepReport, "deepReport")
      };
      map[feature]?.();
    },

    /** 首页示例 chip：指向已有可交付体验，非弱预约页 */
    runHomeChip(chip) {
      const map = {
        "journalist-sample": () => actions.openJournalistReport(),
        "ask-industry": () => actions.bookExpert("ex-ag-market"),
        "request-journalist": () => actions.requestJournalist(),
        "bp-screen": () => actions.doBPAnalysis()
      };
      map[chip]?.();
    },

    /** 首页专家证明卡：打开 Demo 专家纪要预览 */
    openHomeExpertNotes() {
      actions.openPanel("expert-notes");
    },

    /** 首页 / 完整流程面板：打开某公司演示项目 */
    runWorkflowDemo() {
      actions.openProject("proj-bioray-001");
      update();
    },

    /** 点击流程某一步：进演示项目并触发对应能力 */
    runWorkflowStep(stepId) {
      const step = DUE_DILIGENCE_FLOW.find(s => s.id === stepId);
      if (!step) return;
      actions.openProject("proj-bioray-001");
      actions.dispatchChip(step.action);
      update();
    },

    /* ----- 个人中心与积分 ----- */

    openAccount() {
      state.ui.accountModalOpen = true;
      state.ui.rowMenu = null;
      update();
    },

    closeAccount() {
      state.ui.accountModalOpen = false;
      update();
    },

    recharge(packageId) {
      const pkg = state.userAccount.packages.find(p => p.id === packageId);
      if (!pkg) return;
      state.userAccount.credits += pkg.credits;
      state.userAccount.history.unshift({
        date: "今天",
        action: `充值 · ${pkg.label}`,
        credits: pkg.credits
      });
      update(`已充值 ${pkg.credits} 积分`);
    },

    /**
     * 付费能力入口（一线调研 / 专家预约 / 深度报告）
     * Demo 不展示扣积分提示，也不拦截余额
     */
    spendCredits(_cost, actionKey, extra = {}) {
      const dispatch = {
        reporter: () => actions._openReporterRequestModal(),
        expert: () => actions._openExpertBookModal(extra.expertId),
        deepReport: () => actions._startDeepReport(),
        journalist: () => actions._openReporterRequestModal()
      };
      dispatch[actionKey]?.();
      update();
      return true;
    },

    _startDeepReport() {
      if (!state.session) actions.newChat();
      if (s()?.company) {
        actions.doExamineCompany(s().company, { deep: true, skipUserPush: true });
        return;
      }
      actions.selectComposerChip("深度了解");
    },

    logout() {
      state.ui.accountModalOpen = false;
      update("已退出登录（Demo）");
    },

    /* ----- v6: CRUD ----- */

    toggleRowMenu(key, type, id, projectId) {
      const cur = state.ui.rowMenu;
      state.ui.rowMenu = cur?.key === key ? null : { key, type, id, projectId: projectId || null };
      update();
    },

    closeRowMenu() {
      if (state.ui.rowMenu) {
        state.ui.rowMenu = null;
        update();
      }
    },

    renameMaterial(id) {
      const all = [...MATERIALS_LIB, ...(state.userMaterials || [])];
      const item = all.find(m => m.id === id);
      if (!item) return;
      const name = prompt("重命名资料", item.title);
      if (!name?.trim()) return;
      item.title = name.trim();
      state.ui.rowMenu = null;
      update("已重命名");
    },

    deleteMaterial(id) {
      if (!confirm("确定删除这条资料？")) return;
      state.userMaterials = (state.userMaterials || []).filter(m => m.id !== id);
      state.ui.rowMenu = null;
      update("已删除");
    },

    renameProject(id) {
      const proj = (state.projectList || []).find(p => p.id === id);
      if (!proj) return;
      const name = prompt("重命名项目", proj.name);
      if (!name?.trim()) return;
      proj.name = name.trim();
      if (state.session?.id === id || state.session?.projectId === id) {
        state.session.name = name.trim();
      }
      state.ui.rowMenu = null;
      update("项目已重命名");
    },

    deleteProject(id) {
      if (!confirm("确定删除该项目？关联对话将一并移除。")) return;
      state.projectList = (state.projectList || []).filter(p => p.id !== id);
      delete state.sessionCache[id];
      const seedIdx = PROJECT_LIST.findIndex(p => p.id === id);
      if (seedIdx >= 0) PROJECT_LIST.splice(seedIdx, 1);
      if (state.session?.projectId === id || state.session?.id === id) {
        actions.newChat();
      }
      state.ui.rowMenu = null;
      update("项目已删除");
    },

    renameChat(id, projectId) {
      let item;
      if (projectId) {
        const proj = (state.projectList || []).find(p => p.id === projectId);
        item = proj?.chats?.find(c => c.id === id);
      } else {
        item = (state.recentItems || []).find(r => r.id === id);
      }
      if (!item) return;
      const name = prompt("重命名对话", item.label);
      if (!name?.trim()) return;
      item.label = name.trim();
      if (state.session?.id === id) state.session.name = name.trim();
      state.ui.rowMenu = null;
      update("对话已重命名");
    },

    deleteChat(id, projectId) {
      if (!confirm("确定删除该对话？")) return;
      if (projectId) {
        const proj = (state.projectList || []).find(p => p.id === projectId);
        if (proj?.chats) proj.chats = proj.chats.filter(c => c.id !== id);
      } else {
        state.recentItems = (state.recentItems || []).filter(r => r.id !== id);
      }
      delete state.sessionCache[id];
      saveChatPersistence({
        sessionCache: state.sessionCache,
        recentItems: state.recentItems,
      });
      if (state.session?.id === id) actions.newChat();
      state.ui.rowMenu = null;
      update("对话已删除");
    },

    moveChat(id) {
      openModal(state, "move-chat", { chatId: id });
      state.ui.rowMenu = null;
      update();
    },

    confirmMoveChat(chatId) {
      const projectId = document.getElementById("move-chat-project")?.value;
      if (!projectId) { update("请选择目标项目"); return; }
      const chat = (state.recentItems || []).find(r => r.id === chatId);
      const proj = (state.projectList || []).find(p => p.id === projectId);
      if (!chat || !proj) return;
      proj.chats = proj.chats || [];
      proj.chats.push({ id: chat.id, label: chat.label, time: chat.time || "刚刚" });
      state.recentItems = (state.recentItems || []).filter(r => r.id !== chatId);
      closeModal(state);
      update(`已移动到「${proj.name}」`);
    },

    setFileCategory(fileId, category) {
      const hit = findSessionFile(fileId, s(), state);
      if (!hit || hit.collection !== "materials") {
        update("无法移动该文件");
        return;
      }
      if (normalizeFileCategory(hit.file.category) === category) return;
      hit.file.category = category;
      state.ui.rowMenu = null;
      if (!state.ui.fileGroupExpanded) state.ui.fileGroupExpanded = {};
      state.ui.fileGroupExpanded[category] = true;
      update(`已移至「${category}」`);
    },

    setFileDragOverCat(cat) {
      if (state.ui.fileDragOverCat === cat) return;
      document.querySelectorAll(".files-tree-folder--drop-target").forEach(el => {
        el.classList.remove("files-tree-folder--drop-target");
      });
      state.ui.fileDragOverCat = cat;
      if (!cat) return;
      document.querySelectorAll(".files-tree-folder").forEach(btn => {
        const nameEl = btn.querySelector(".files-tree-folder-name");
        if (nameEl?.textContent === cat) btn.classList.add("files-tree-folder--drop-target");
      });
    },

    clearFileDragOverCat() {
      state.ui.fileDragOverCat = null;
      document.querySelectorAll(".files-tree-folder--drop-target").forEach(el => {
        el.classList.remove("files-tree-folder--drop-target");
      });
    },

    onFileTreeFolderDrop(fileId, category) {
      actions.setFileCategory(fileId, category);
    },

    toggleFileGroup(cat) {
      if (!state.ui.fileGroupExpanded) state.ui.fileGroupExpanded = {};
      const expanded = state.ui.fileGroupExpanded[cat] !== false;
      state.ui.fileGroupExpanded[cat] = !expanded;
      update();
    },

    createProjectFromCompany(company) {
      if (!company) return;
      state.ui.previewOpen = false;
      actions.openCreateModal();
      requestAnimationFrame(() => {
        const el = document.getElementById("f-company");
        if (el) el.value = company;
      });
    },

    /* ----- v7.0 首次引导 + 首页 Wow ----- */

    onboardingOrgSelect(name) {
      const org = ONBOARDING_ORG_REGISTRY.find(o => o.name === name);
      if (!org) {
        state.onboarding.draft.org = "";
        state.onboarding.draft.orgCreditCode = "";
        return;
      }
      state.onboarding.draft.org = org.name;
      state.onboarding.draft.orgCreditCode = org.creditCode;
    },

    addOnboardingCustomSector() {
      const val = document.getElementById("ob-sector-custom")?.value?.trim();
      if (!val) {
        update("请输入赛道名称");
        return;
      }
      const cur = state.onboarding.draft.sectors || [];
      if (cur.includes(val)) {
        update("该赛道已在列表中");
        return;
      }
      state.onboarding.draft.sectors = [...cur, val];
      const el = document.getElementById("ob-sector-custom");
      if (el) el.value = "";
      update();
    },

    onboardingSetField(field, value) {
      state.onboarding.draft = { ...state.onboarding.draft, [field]: value };
      update();
    },

    toggleOnboardingSector(sector) {
      const cur = state.onboarding.draft.sectors || [];
      const next = cur.includes(sector)
        ? cur.filter(s => s !== sector)
        : [...cur, sector];
      state.onboarding.draft.sectors = next;
      update();
    },

    toggleOnboardingFocus(focus) {
      const cur = state.onboarding.draft.focuses || [];
      const on = cur.includes(focus);
      const next = on ? cur.filter(f => f !== focus) : [...cur, focus];
      state.onboarding.draft.focuses = next;
      let notes = state.onboarding.draft.focusNotes || "";
      if (!on && !notes.includes(focus)) {
        notes = notes ? `${notes}、${focus}` : focus;
        state.onboarding.draft.focusNotes = notes;
      }
      update();
    },

    onboardingNext() {
      const step = state.onboarding.step ?? 0;
      if (step === 0) {
        const orgName = document.getElementById("ob-org")?.value?.trim() || state.onboarding.draft.org;
        if (!orgName) {
          update("请选择机构");
          return;
        }
        const org = ONBOARDING_ORG_REGISTRY.find(o => o.name === orgName);
        state.onboarding.draft.org = orgName;
        state.onboarding.draft.orgCreditCode = org?.creditCode || "91310000MOCK000000";
        const dept = document.getElementById("ob-dept")?.value?.trim();
        if (!dept) {
          update("请填写部门");
          return;
        }
        state.onboarding.draft.dept = dept;
        state.onboarding.draft.role = document.getElementById("ob-role")?.value?.trim() || "投资经理";
      }
      if (step === 1 && !(state.onboarding.draft.sectors || []).length) {
        update("请至少选择一个关注赛道，或添加自定义赛道");
        return;
      }
      if (step < 2) {
        state.onboarding.step = step + 1;
        update();
        return;
      }
      const notes = document.getElementById("ob-focus-notes")?.value?.trim() || "";
      if (notes.length < 8) {
        update("请用至少一句话描述尽调关注点（8 字以上），便于小星理解你的习惯");
        return;
      }
      state.onboarding.draft.focusNotes = notes;
      actions.finishOnboarding();
    },

    onboardingBack() {
      if (state.onboarding.step > 0) {
        state.onboarding.step -= 1;
        update();
      }
    },

    skipOnboarding() {
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, "done");
      } catch {
        /* ignore */
      }
      state.onboarding.active = false;
      state.onboarding.step = 0;
      update("已跳过引导，可直接体验 Demo");
    },

    finishOnboarding() {
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, "done");
      } catch {
        /* ignore */
      }
      const d = state.onboarding.draft || {};
      if (d.org) state.userAccount.org = d.org;
      if (d.orgCreditCode) state.userAccount.orgCreditCode = d.orgCreditCode;
      if (d.dept) state.userAccount.dept = d.dept;
      if (d.role) state.userAccount.role = d.role;
      if (d.sectors?.length) {
        state.userSectors = [...d.sectors];
        state.starMemories = { ...(state.starMemories || {}), sectors: [...d.sectors] };
      }
      if (d.focusNotes) {
        state.starMemories = { ...(state.starMemories || {}), focusNotes: d.focusNotes };
      }
      if (d.focuses?.length) {
        state.starMemories = { ...(state.starMemories || {}), focusAreas: [...d.focuses] };
      }
      state.onboarding.active = false;
      state.onboarding.step = 0;
      const sess = createSession();
      state.session = sess;
      state.sessionId = "new";
      state.sessionCache[sess.id] = sess;
      state.view = "chat";
      window.location.hash = "/chat/new";
      update("已根据你的机构与偏好定制投资雷达");
    },

    showOrgEdition() {
      update("机构版：无限项目、机构模板、团队协作、一线调研额度（Demo 咨询入口）");
    },

    toggleOrgStarStandard(on) {
      state.featureData = { ...(state.featureData || {}), useOrgStarStandard: !!on };
      update(on ? "已开启机构尽调标准（Demo 占位）" : "已恢复个人偏好");
    },

    setDeploymentMode(mode) {
      if (mode !== "saas" && mode !== "private") return;
      state.deploymentMode = mode;
      update(mode === "private" ? "已切换为私有化部署形态" : "已切换为 SaaS 形态");
    },

    openProjectCollab(projectId) {
      const proj = findProject(projectId);
      if (!proj) return;
      openModal(state, "project-collab", { projectId });
      update();
    },

    inviteMember(projectId, userId, projRole = "analyst") {
      const proj = findProject(projectId);
      const user = cu();
      if (!proj) return;
      const member = getOrgMember(userId);
      if (!member) {
        update("未找到该成员");
        return;
      }
      proj.members = proj.members || [];
      if (proj.members.some(m => memberId(m) === userId)) {
        update(`${member.name} 已在项目中`);
        return;
      }
      proj.members.push({ id: member.id, name: member.name, projRole });
      closeModal(state);
      const roleLabel = PROJ_ROLE_LABELS[projRole] || projRole;
      update(`已邀请 ${member.name} 以「${roleLabel}」角色加入项目`);
    },

    shareFileToProject(fileId) {
      const sess = s();
      if (!sess?.saved) {
        update("请先进入项目");
        return;
      }
      const user = cu();
      const now = new Date().toISOString().slice(0, 10);
      const patch = {
        shareState: "shared",
        sharedBy: { id: user.id, name: user.name },
        sharedAt: now
      };
      const material = sess.materials?.find(m => m.id === fileId);
      if (material) {
        Object.assign(material, patch);
        state.ui.rowMenu = null;
        update(`「${material.name}」已共享到项目`);
        return;
      }
      const aiFile = sess.aiReports?.find(r => r.id === fileId);
      if (aiFile) {
        Object.assign(aiFile, patch);
        const doc = getSessionReports(sess).find(d => d.id === aiFile.reportDocId);
        if (doc) {
          Object.assign(doc, {
            shareState: "shared",
            author: { id: user.id, name: user.name },
            sharedAt: now
          });
        }
        state.ui.rowMenu = null;
        update(`「${aiFile.name}」已共享到项目`);
        return;
      }
      update("未找到该文件");
    },

    switchDemoUser(userId) {
      state.currentUser = getDemoUser(userId);
      const visible = visibleProjects(state.projectList, state.currentUser);
      const roleLabel = {
        staff: "员工",
        team_lead: "团队领导",
        dept_lead: "部门领导"
      }[state.currentUser.role] || state.currentUser.role;
      if (state.session?.saved && state.session.projectId) {
        const canSee = visible.some(p => p.id === state.session.projectId);
        if (!canSee) {
          state.session = null;
          state.sessionId = "new";
          window.location.hash = visible.length ? `/p/${visible[0].id}` : "/chat/new";
        }
      }
      update(`已切换为 ${state.currentUser.name}（${roleLabel}）`);
    },

    toggleAgentToolBlock(msgIndex, toolId) {
      const m = s().messages[msgIndex];
      const block = m?.blocks?.find((b) => b.type === "tool" && b.id === toolId);
      if (!block) return;
      block.expanded = !block.expanded;
      update();
    },

    confirmAgentTool(msgIndex, toolId, confirm) {
      const m = s().messages[msgIndex];
      const block = m?.blocks?.find((b) => b.type === "tool" && b.id === toolId);
      if (!block) return;
      state.ui.streaming = true;
      update();
      agentBridge.confirmToolCall(block, confirm, null, { msgIndex }).then((res) => {
        if (!res?.ok) {
          const err = res?.error || (res?.timeout ? "timeout" : "");
          if (err === "no_active_turn") {
            setToast(state, "会话已刷新，请重新发送问题");
          } else if (res?.timeout) {
            setToast(state, "确认已提交，分析仍在进行，请稍候");
          } else {
            setToast(state, err || "确认失败，请重试");
          }
        }
        state.ui.streaming = false;
        update();
      });
    },

    afterRender() {
      bindScenarioTooltips();
      if (state.ui.scenarioOpen) {
        bindScenarioTabObserver();
      }
      if (state.ui._restoreComposerFocus) {
        state.ui._restoreComposerFocus = false;
        const input = document.getElementById("chat-input");
        if (input) {
          input.focus();
          const len = input.value.length;
          input.setSelectionRange(len, len);
          input.style.height = "auto";
          input.style.height = `${input.scrollHeight}px`;
        }
      }
      if (state.ui._restoreGraphSearchFocus) {
        state.ui._restoreGraphSearchFocus = false;
        const search = document.querySelector(".graph-search");
        if (search) {
          search.focus();
          const len = search.value.length;
          search.setSelectionRange(len, len);
        }
      }
      if (state.ui._restoreChainSearchFocus) {
        state.ui._restoreChainSearchFocus = false;
        const search = document.querySelector(".xb-chain-search");
        if (search) {
          search.focus();
          const len = search.value.length;
          search.setSelectionRange(len, len);
        }
      }
      if (state.ui.expertMenuOpen || state.ui.composerMenu) {
        syncExpertPopover(actions);
      } else {
        teardownExpertPopover();
      }
      if (state.ui.aiOutputMenuOpen) {
        syncAiOutputMenuDocClick(state.ui, update);
      } else {
        teardownAiOutputMenuDocClick();
      }
    },

    resetOnboardingDemo() {
      try { localStorage.removeItem(ONBOARDING_STORAGE_KEY); } catch { /* ignore */ }
      state.onboarding.active = true;
      state.onboarding.step = 0;
      state.onboarding.draft = {
        org: "",
        orgCreditCode: "",
        dept: "",
        role: "",
        sectors: [],
        focusNotes: "",
        focuses: []
      };
      update("已重置引导（Demo）");
    }
  };

  return actions;
}
