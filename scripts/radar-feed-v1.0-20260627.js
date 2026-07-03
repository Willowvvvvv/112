/**
 * 投资雷达：真实 RSS 资讯 + 小星 LLM 早餐/解读（非 MCP 连接器）
 * 版本: v1.5 | 日期: 2026-07-01
 */
import { getApiConfig, loadAgentscopeManifest } from "./agentscope-config-v1.0-20260627.js";
import {
  POLICY_FEED,
  RADAR_FEED,
  RADAR_INTERESTS,
  SECTOR_WEEKLY,
  STAR_BRIEFING,
} from "../data/mock-data.js";
import {
  buildRadarUserContext,
  RADAR_PROFILE_KEY,
  STAR_MEMORIES_UPDATED_EVENT,
  saveStarMemoriesToStorage,
} from "./star-user-context-v1.0-20260627.js";

const ONBOARDING_KEY = "xinbao_onboarding_done_v8";
const BRIEFING_SESSION_KEY = "xb_radar_briefing_v1.0_20260627";
const INTERESTS_SESSION_KEY = "xb_radar_interests_v1.0_20260627";
const WEEKLY_SESSION_KEY = "xb_radar_weekly_v1.0_20260627";

function contextFingerprint(ctx) {
  const memories = (ctx.user_memories || []).join("|");
  const sectors = (ctx.focus_sectors || []).join(",");
  return `${sectors}::${memories}::${ctx.user_note || ""}`;
}

function loadBriefingFromSession(ctx) {
  try {
    const raw = sessionStorage.getItem(BRIEFING_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.fp !== contextFingerprint(ctx)) return null;
    return parsed.briefing?.digest ? parsed.briefing : null;
  } catch {
    return null;
  }
}

function saveBriefingToSession(ctx, briefing) {
  try {
    sessionStorage.setItem(
      BRIEFING_SESSION_KEY,
      JSON.stringify({ fp: contextFingerprint(ctx), briefing, saved_at: Date.now() }),
    );
  } catch { /* ignore */ }
}

function loadInterestsFromSession(ctx) {
  try {
    const raw = sessionStorage.getItem(INTERESTS_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.fp !== contextFingerprint(ctx)) return null;
    return Array.isArray(parsed.items) && parsed.items.length ? parsed.items : null;
  } catch {
    return null;
  }
}

function saveInterestsToSession(ctx, items) {
  if (!items?.length) return;
  try {
    sessionStorage.setItem(
      INTERESTS_SESSION_KEY,
      JSON.stringify({ fp: contextFingerprint(ctx), items, saved_at: Date.now() }),
    );
  } catch { /* ignore */ }
}

function readWeeklySession() {
  try {
    const raw = sessionStorage.getItem(WEEKLY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.bySector || typeof parsed.bySector !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function loadWeeklyFromSession(ctx, sector) {
  const parsed = readWeeklySession();
  if (!parsed || parsed.fp !== contextFingerprint(ctx)) return null;
  const hit = parsed.bySector[sector];
  return hit?.teaser ? hit : null;
}

function saveWeeklyToSession(ctx, sector, weekly) {
  if (!weekly?.teaser) return;
  try {
    const existing = readWeeklySession();
    const bySector = existing && existing.fp === contextFingerprint(ctx)
      ? { ...existing.bySector }
      : {};
    bySector[sector] = weekly;
    sessionStorage.setItem(
      WEEKLY_SESSION_KEY,
      JSON.stringify({ fp: contextFingerprint(ctx), bySector, saved_at: Date.now() }),
    );
  } catch { /* ignore */ }
}

function loadUserContext() {
  return buildRadarUserContext();
}

let feedLoadPromise = null;
let briefingLoadPromise = null;
let interestsLoadPromise = null;
let weeklyLoadPromise = null;

/** 静态 Demo / 无 Agent 代理时走 mock，保证投资雷达可独立演示 */
export function shouldUseRadarLiveApi() {
  if (typeof window === "undefined") return false;
  const port = window.location.port;
  if (port === "8080" || port === "5173" || port === "4173") return true;
  try {
    if (localStorage.getItem("xinbao_radar_live_v1") === "1") return true;
  } catch { /* ignore */ }
  return false;
}

function buildMockFeedCatalog() {
  const policyRows = POLICY_FEED.map((row) => ({
    ...row,
    sector: row.sector || "政策",
  }));
  const catalog = new Map();
  [...RADAR_FEED, ...policyRows].forEach((row) => catalog.set(row.id, row));
  return [...catalog.values()];
}

function filterMockFeedView(catalog, sector = "全部") {
  if (sector === "政策速递") {
    return catalog.filter((row) => row.sector === "政策" || String(row.id || "").startsWith("pol-"));
  }
  if (!sector || sector === "全部") {
    return catalog.filter((row) => row.sector !== "政策" && !String(row.id || "").startsWith("pol-"));
  }
  return catalog.filter((row) => row.sector === sector);
}

function applyMockRadarFeed(state, sector = "全部") {
  if (!state.featureData) state.featureData = {};
  const catalog = buildMockFeedCatalog();
  const viewItems = filterMockFeedView(catalog, sector);
  state.featureData.radarFeedCatalog = catalog;
  state.featureData.radarLiveFeed = viewItems;
  state.featureData.radarFeedLive = false;
  state.featureData.radarFeedError = null;
  state.featureData.radarFeedLoading = false;
}

function applyMockRadarBriefing(state) {
  if (!state.featureData) state.featureData = {};
  state.featureData.radarBriefing = { ...STAR_BRIEFING };
  state.featureData.radarBriefingError = null;
  state.featureData.radarBriefingLoading = false;
  state.featureData.radarBriefingRefreshing = false;
}

function applyMockRadarInterests(state) {
  if (!state.featureData) state.featureData = {};
  state.featureData.radarInterests = RADAR_INTERESTS.map((row) => ({ ...row }));
  state.featureData.radarInterestsError = null;
  state.featureData.radarInterestsLoading = false;
}

function applyMockRadarWeekly(state, sector = "医疗器械") {
  if (!state.featureData) state.featureData = {};
  const weekly = SECTOR_WEEKLY[sector] || SECTOR_WEEKLY["医疗器械"] || null;
  state.featureData.radarWeeklySector = sector;
  state.featureData.radarWeekly = weekly ? { ...weekly } : null;
  state.featureData.radarWeeklyError = weekly ? null : "暂无该赛道周报 Demo 数据";
  state.featureData.radarWeeklyLoading = false;
}

export function getMockRadarInterpretation(item) {
  return item?.interpretation || "";
}

async function apiBaseUrl() {
  if (typeof window !== "undefined") {
    const port = window.location.port;
    // 静态 Demo :8080 / Agent Web UI :5173 走同源 /platform 代理
    if (port === "8080" || port === "5173" || port === "4173") return "";
  }
  const manifest = await loadAgentscopeManifest();
  return getApiConfig(manifest).apiBase;
}

export async function fetchRadarLiveFeed(sector = "全部", limit = 120) {
  const apiBase = await apiBaseUrl();
  const path = sector === "政策速递"
    ? `/platform/radar/policy-feed?limit=${Math.min(limit, 60)}`
    : sector && sector !== "全部"
      ? `/platform/radar/feed?sector=${encodeURIComponent(sector)}&limit=${limit}`
      : `/platform/radar/feed?limit=${limit}`;
  const res = await fetch(`${apiBase}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`radar feed ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchRadarBriefing() {
  const apiBase = await apiBaseUrl();
  const ctx = loadUserContext();
  const res = await fetch(`${apiBase}/platform/radar/briefing`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(ctx),
  });
  if (!res.ok) throw new Error(`radar briefing ${res.status}`);
  return res.json();
}

export async function fetchRadarInterpretation(item) {
  if (!shouldUseRadarLiveApi()) {
    return getMockRadarInterpretation(item);
  }
  const apiBase = await apiBaseUrl();
  const ctx = loadUserContext();
  const res = await fetch(`${apiBase}/platform/radar/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ item_id: item.id, item, ...ctx }),
  });
  if (!res.ok) throw new Error(`radar interpret ${res.status}`);
  const data = await res.json();
  return data.interpretation || "";
}

export async function fetchRadarInterests() {
  const apiBase = await apiBaseUrl();
  const ctx = loadUserContext();
  const res = await fetch(`${apiBase}/platform/radar/interests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(ctx),
  });
  if (!res.ok) throw new Error(`radar interests ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchRadarWeekly(sector = "医疗器械") {
  if (!shouldUseRadarLiveApi()) {
    return SECTOR_WEEKLY[sector] || SECTOR_WEEKLY["医疗器械"] || null;
  }
  const apiBase = await apiBaseUrl();
  const ctx = loadUserContext();
  const res = await fetch(`${apiBase}/platform/radar/weekly`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ sector, ...ctx }),
  });
  if (!res.ok) throw new Error(`radar weekly ${res.status}`);
  return res.json();
}

export async function fetchRadarItem(itemId) {
  const mockHit = buildMockFeedCatalog().find((row) => row.id === itemId) || null;
  if (!shouldUseRadarLiveApi()) {
    if (!mockHit) throw new Error(`radar item ${itemId}`);
    return mockHit;
  }
  const apiBase = await apiBaseUrl();
  const res = await fetch(`${apiBase}/platform/radar/item/${encodeURIComponent(itemId)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    if (mockHit) return mockHit;
    throw new Error(`radar item ${res.status}`);
  }
  return res.json();
}

export function getRadarFeedItems(state) {
  const live = state?.featureData?.radarLiveFeed;
  return Array.isArray(live) ? live : [];
}

export function getRadarFeedCatalog(state) {
  const catalog = state?.featureData?.radarFeedCatalog;
  if (Array.isArray(catalog) && catalog.length) return catalog;
  return getRadarFeedItems(state);
}

export function getRadarBriefing(state) {
  return state?.featureData?.radarBriefing || null;
}

export function findRadarNewsItem(state, id) {
  const feed = getRadarFeedCatalog(state);
  const hit = feed.find(n => n.id === id);
  if (hit) return hit;
  const cache = state?.featureData?.radarItemCache || {};
  if (cache[id]) return cache[id];
  const interests = state?.featureData?.radarInterests || [];
  const interest = interests.find(it => it.type === "news" && it.id === id);
  if (interest) {
    return {
      id: interest.id,
      title: interest.title,
      sector: interest.sector || "",
      time: interest.time || "",
      source: interest.source || "",
      summary: interest.summary || interest.reason || "",
      fullText: interest.fullText || interest.summary || interest.reason || "",
      link: interest.link || null,
      company: interest.company || null,
    };
  }
  return null;
}

export function getRadarInterests(state) {
  const items = state?.featureData?.radarInterests;
  return Array.isArray(items) ? items : [];
}

export function getRadarWeeklyTeaser(state, sector) {
  const activeSector = state.featureData?.radarWeeklySector || sector;
  const weekly = state?.featureData?.radarWeekly;
  if (weekly && activeSector === sector) {
    return weekly;
  }
  const ctx = loadUserContext();
  return loadWeeklyFromSession(ctx, sector);
}

export function loadRadarBriefingIntoState(state, rerender) {
  if (!state.featureData) state.featureData = {};
  if (!shouldUseRadarLiveApi()) {
    applyMockRadarBriefing(state);
    rerender();
    return Promise.resolve();
  }
  const ctx = loadUserContext();
  const sessionHit = loadBriefingFromSession(ctx);
  if (sessionHit) {
    state.featureData.radarBriefing = sessionHit;
    state.featureData.radarBriefingLoading = false;
    state.featureData.radarBriefingRefreshing = true;
  } else {
    state.featureData.radarBriefingLoading = true;
    state.featureData.radarBriefingRefreshing = false;
  }
  rerender();
  if (briefingLoadPromise) return briefingLoadPromise;
  briefingLoadPromise = (async () => {
    try {
      const data = await fetchRadarBriefing();
      state.featureData.radarBriefing = data;
      saveBriefingToSession(ctx, data);
      state.featureData.radarBriefingError = null;
    } catch (err) {
      console.warn("[radar-feed] 小星投资早餐生成失败", err);
      if (!sessionHit && !state.featureData.radarBriefing) {
        state.featureData.radarBriefingError = "小星投资早餐暂时不可用";
      }
    } finally {
      state.featureData.radarBriefingLoading = false;
      state.featureData.radarBriefingRefreshing = false;
      briefingLoadPromise = null;
      rerender();
    }
  })();
  return briefingLoadPromise;
}

export function loadRadarFeedIntoState(state, rerender, sector = "全部") {
  if (!state.featureData) state.featureData = {};
  if (!shouldUseRadarLiveApi()) {
    applyMockRadarFeed(state, sector);
    rerender();
    return Promise.resolve();
  }
  state.featureData.radarFeedLoading = true;
  state.featureData.radarFeedError = null;
  rerender();
  if (feedLoadPromise) return feedLoadPromise;
  feedLoadPromise = (async () => {
    try {
      const [fullItems, policyItems] = await Promise.all([
        fetchRadarLiveFeed("全部", 120),
        fetchRadarLiveFeed("政策速递", 30),
      ]);
      const catalog = new Map();
      fullItems.forEach(row => catalog.set(row.id, row));
      policyItems.forEach(row => catalog.set(row.id, row));
      state.featureData.radarFeedCatalog = [...catalog.values()];

      let viewItems = fullItems;
      if (sector === "政策速递") viewItems = policyItems;
      else if (sector && sector !== "全部") {
        viewItems = fullItems.filter(row => row.sector === sector);
      }
      state.featureData.radarLiveFeed = viewItems;
      state.featureData.radarFeedLive = viewItems.length > 0;
      if (!viewItems.length && !(state.featureData.radarFeedCatalog || []).length) {
        state.featureData.radarFeedError = "暂无资讯，请稍后刷新";
      }
    } catch (err) {
      console.warn("[radar-feed] 实时资讯加载失败", err);
      const hasCatalog = (state.featureData.radarFeedCatalog || []).length > 0;
      if (!hasCatalog) {
        state.featureData.radarFeedError = "实时资讯加载失败，请稍后刷新";
        state.featureData.radarLiveFeed = [];
        state.featureData.radarFeedLive = false;
      }
    } finally {
      state.featureData.radarFeedLoading = false;
      feedLoadPromise = null;
      rerender();
    }
  })();
  return feedLoadPromise;
}

export function syncRadarUserProfile(state) {
  try {
    localStorage.setItem(RADAR_PROFILE_KEY, JSON.stringify({
      sectors: state?.userSectors || state?.onboarding?.draft?.sectors || [],
      focusNotes: state?.starMemories?.focusNotes || state?.onboarding?.draft?.focusNotes || "",
    }));
    if (Array.isArray(state?.starMemories) && state.starMemories.length) {
      saveStarMemoriesToStorage(state.starMemories);
    }
  } catch { /* ignore */ }
}

export function bindStarMemoriesRadarRefresh(state, rerender) {
  if (typeof window === "undefined") return;
  window.addEventListener(STAR_MEMORIES_UPDATED_EVENT, () => {
    const sector = state.featureData?.radarFilter || "全部";
    void loadRadarBriefingIntoState(state, rerender);
    void loadRadarInterestsIntoState(state, rerender);
    const weeklySector = state.featureData?.weeklySector || state.userSectors?.[0] || "医疗器械";
    void loadRadarWeeklyIntoState(state, rerender, weeklySector);
    void loadRadarFeedIntoState(state, rerender, sector);
  });
}

export function loadRadarInterestsIntoState(state, rerender) {
  if (!state.featureData) state.featureData = {};
  if (!shouldUseRadarLiveApi()) {
    applyMockRadarInterests(state);
    rerender();
    return Promise.resolve();
  }
  const ctx = loadUserContext();
  const sessionHit = loadInterestsFromSession(ctx);
  if (sessionHit?.length) {
    state.featureData.radarInterests = sessionHit;
    state.featureData.radarInterestsLoading = false;
  } else {
    state.featureData.radarInterestsLoading = true;
  }
  rerender();
  if (interestsLoadPromise) return interestsLoadPromise;
  interestsLoadPromise = (async () => {
    try {
      const items = await fetchRadarInterests();
      state.featureData.radarInterests = items;
      saveInterestsToSession(ctx, items);
      state.featureData.radarInterestsError = null;
    } catch (err) {
      console.warn("[radar-feed] 可能感兴趣加载失败", err);
      if (!sessionHit?.length) {
        state.featureData.radarInterestsError = "推荐加载失败，请稍后刷新";
      }
    } finally {
      state.featureData.radarInterestsLoading = false;
      interestsLoadPromise = null;
      rerender();
    }
  })();
  return interestsLoadPromise;
}

export function loadRadarWeeklyIntoState(state, rerender, sector = "医疗器械") {
  if (!state.featureData) state.featureData = {};
  if (!shouldUseRadarLiveApi()) {
    applyMockRadarWeekly(state, sector);
    rerender();
    return Promise.resolve();
  }
  const ctx = loadUserContext();
  const sessionHit = loadWeeklyFromSession(ctx, sector);
  state.featureData.radarWeeklySector = sector;
  if (sessionHit) {
    state.featureData.radarWeekly = sessionHit;
    state.featureData.radarWeeklyLoading = false;
  } else {
    state.featureData.radarWeekly = null;
    state.featureData.radarWeeklyLoading = true;
  }
  rerender();
  if (weeklyLoadPromise) return weeklyLoadPromise;
  weeklyLoadPromise = (async () => {
    try {
      const data = await fetchRadarWeekly(sector);
      state.featureData.radarWeekly = data;
      saveWeeklyToSession(ctx, sector, data);
      state.featureData.radarWeeklyError = null;
    } catch (err) {
      console.warn("[radar-feed] 赛道周报加载失败", err);
      if (!sessionHit) {
        state.featureData.radarWeeklyError = "赛道周报暂时不可用";
      }
    } finally {
      state.featureData.radarWeeklyLoading = false;
      weeklyLoadPromise = null;
      rerender();
    }
  })();
  return weeklyLoadPromise;
}

export function refreshRadarPage(state, rerender, sector = "全部") {
  syncRadarUserProfile(state);
  void loadRadarFeedIntoState(state, rerender, sector);
  void loadRadarBriefingIntoState(state, rerender);
  void loadRadarInterestsIntoState(state, rerender);
  const weeklySector = state.featureData?.weeklySector || state.userSectors?.[0] || "医疗器械";
  void loadRadarWeeklyIntoState(state, rerender, weeklySector);
}
