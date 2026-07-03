/**
 * app.js — Demo 入口：hash 路由、全局 state、挂载 XinBaoDemo
 * 版本：v7.14.5-20260627
 */
import { createInitialState } from "./state.js";
import {
  defaultLandingHash,
  isProjectBoundSession,
} from "./chat-route-v1.0-20260627.js";
import { renderApp } from "./render.js";
import { createActions } from "./actions.js";
import { loadAgentscopeManifest } from "./agentscope-config-v1.0-20260627.js";
import { loadPlatformExperts, loadCatalogForPicker } from "./platform-experts-v1.0-20260627.js";
import {
  loadChatPersistence,
  mergeRecentItems,
  saveChatPersistence,
} from "./chat-persistence-v1.0-20260627.js";
import {
  loadProjectPersistence,
  mergeUserProjects,
  pickPersistableProjectSessions,
  saveProjectPersistence,
} from "./project-persistence-v1.0-20260628.js";
import { normalizeSessionCache } from "./session-normalize-v1.0-20260629.js";
import { bindStarMemoriesRadarRefresh } from "./radar-feed-v1.0-20260627.js";
import {
  defaultStarMemories,
  loadStarMemoriesFromStorage,
} from "./star-user-context-v1.0-20260627.js";
import {
  PROJECT_LIST, RECENT_ITEMS, createSession, USER_ACCOUNT, ONBOARDING_STORAGE_KEY,
  DEMO_USER_REPORT_TEMPLATES, CURRENT_USER, ORG_MEMBERS, visibleProjects,
  setPlatformExpertsForPicker,
} from "../data/mock-data.js";

const root = document.getElementById("app");
const state = createInitialState();
state.currentUser = { ...CURRENT_USER };
state.orgMembers = [...ORG_MEMBERS];
const persistedChats = loadChatPersistence();
const persistedProjects = loadProjectPersistence();
state.projectList = mergeUserProjects(
  PROJECT_LIST.map(p => ({
    ...p,
    members: [...(p.members || [])],
    chats: (p.chats || []).map(c => ({ ...c, author: { ...c.author } }))
  })),
  persistedProjects?.projects,
).map(p => ({
  ...p,
  members: [...(p.members || [])],
  chats: (p.chats || []).map(c => ({ ...c, author: c.author ? { ...c.author } : c.author }))
}));
const userProjectIds = new Set(
  state.projectList.filter((p) => /^proj-\d+$/.test(p.id)).map((p) => p.id),
);
state.sessionCache = normalizeSessionCache({
  ...(persistedChats?.sessions || {}),
  ...pickPersistableProjectSessions(persistedProjects?.sessions || {}, userProjectIds),
});
state.recentItems = mergeRecentItems(RECENT_ITEMS, persistedChats?.recentItems);
state.userMaterials = [...DEMO_USER_REPORT_TEMPLATES];
state.userAccount = {
  ...USER_ACCOUNT,
  packages: [...USER_ACCOUNT.packages],
  history: [...USER_ACCOUNT.history]
};
state.starMemories = loadStarMemoriesFromStorage() || defaultStarMemories();

import { FEATURE_VIEWS } from "./feature-views-v1.0-20260628.js";

function rerender() {
  if (!root) return;
  try {
    root.innerHTML = renderApp(state);
    actions.afterRender?.();
  } catch (err) {
    console.error("[财跃启明星] 页面渲染失败", err);
    root.innerHTML = `<div class="shell shell-chat" style="padding:24px;font-family:system-ui,sans-serif"><p style="color:#b42318">页面渲染失败，请硬刷新（Cmd+Shift+R）后重试。</p><pre style="font-size:12px;color:#666;white-space:pre-wrap">${String(err?.message || err)}</pre></div>`;
  }
}

const actions = createActions(state, rerender);
window.XinBaoDemo = actions;
async function bootPlatformExperts() {
  try {
    const catalogExperts = await loadCatalogForPicker();
    setPlatformExpertsForPicker(catalogExperts);
    rerender();
    const [manifest, experts] = await Promise.all([
      loadAgentscopeManifest(),
      loadPlatformExperts(true),
    ]);
    state.agentscopeManifest = manifest;
    state.platformExperts = experts;
    setPlatformExpertsForPicker(experts);
    rerender();
  } catch (err) {
    console.warn("[财跃启明星] 专家列表加载失败，使用静态回退", err);
  }
}
bootPlatformExperts();

function needsOnboarding() {
  try {
    return !localStorage.getItem(ONBOARDING_STORAGE_KEY);
  } catch {
    return false;
  }
}

function onHash() {
  const parts = (window.location.hash.slice(1) || "/chat").split("/").filter(Boolean);
  const route = parts[0] || "chat";
  const id = parts[1] || "new";

  state.view = route;

  if (FEATURE_VIEWS.includes(route)) {
    actions.openFeature(route);
    return;
  }

  if (route === "p" && id) {
    const chatId = parts[2] === "c" ? parts[3] : parts[2];
    if (chatId) {
      if (!state.session || state.session.id !== chatId) {
        actions.openProjectChat(id, chatId);
        return;
      }
    } else if (!state.session || state.session.id !== id) {
      actions.openProject(id);
      return;
    }
    // 项目页与对话共用 chat shell；勿保留 view="p"，否则快捷动作会误判并 newChat
    state.view = "chat";
  } else if (route === "chat") {
    state.view = "chat";
    if (id === "new") {
      if (!state.session || isProjectBoundSession(state.session)) {
        const sess = createSession({}, state.currentUser);
        state.session = sess;
        state.sessionId = "new";
        state.sessionCache[sess.id] = sess;
      }
    } else if (!state.session || state.session.id !== id) {
      actions.openSession(id);
      return;
    }
  } else {
    window.location.hash = defaultLandingHash();
    return;
  }

  rerender();
}

function boot() {
  if (needsOnboarding()) {
    state.onboarding.active = true;
    state.onboarding.step = 0;
    if (!window.location.hash || window.location.hash === "#/projects") {
      window.location.hash = "/chat/new";
    }
    onHash();
    return;
  }

  if (!window.location.hash || window.location.hash === "#/projects") {
    window.location.hash = defaultLandingHash();
  } else {
    onHash();
  }
}

window.addEventListener("hashchange", onHash);
window.addEventListener("beforeunload", () => {
  saveChatPersistence({
    sessionCache: state.sessionCache,
    recentItems: state.recentItems,
  });
  saveProjectPersistence({
    projectList: state.projectList,
    sessionCache: state.sessionCache,
  });
});
bindStarMemoriesRadarRefresh(state, rerender);
boot();
