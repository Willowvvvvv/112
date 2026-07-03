/**
 * platform-experts — 合并 catalog 与 agent manifest，供技能市场/专家召唤
 * 版本: v1.1 | 日期: 2026-06-27
 */
import { loadAgentscopeManifest } from "./agentscope-config-v1.0-20260627.js";

const CATALOG_URL = "./data/platform-expert-catalog-v1.0-20260627.json";

/** 平台专家白名单：仅金融/尽调领域 */
const ALLOWED_EXPERT_CATEGORIES = new Set(["finance", "risk", "industry", "skill"]);

/** 技能市场展示用（不含默认助手小星） */
function isVisiblePlatformExpert(ex) {
  const id = String(ex?.frontend_id || ex?.id || "");
  if (id === "ex-default") return false;
  if (id.startsWith("ex-cf-")) return false;
  return ALLOWED_EXPERT_CATEGORIES.has(ex?.category || "");
}

/** @type {Array<Record<string, unknown>> | null} */
let mergedExperts = null;

/**
 * @param {Array<Record<string, unknown>>} catalog
 * @param {Record<string, unknown>} manifest
 */
export function mergeCatalogWithManifest(catalog, manifest) {
  const bindings = new Map(
    (manifest.experts || []).map((e) => [e.frontend_id, e]),
  );
  const enabled = manifest.enabled !== false;
  return (catalog || [])
    .filter(isVisiblePlatformExpert)
    .map((ex) => {
    const bind = bindings.get(ex.frontend_id) || {};
    return {
      ...ex,
      id: ex.frontend_id,
      agent_id: bind.agent_id || null,
      session_id: bind.session_id || null,
      live: !!(bind.agent_id && bind.session_id && enabled),
    };
  });
}

export function resetPlatformExpertsCache() {
  mergedExperts = null;
}

/**
 * 仅加载 catalog（不等待 manifest），用于首屏专家选择器
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function loadCatalogForPicker() {
  const catalogRes = await fetch(CATALOG_URL, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error(`catalog HTTP ${r.status}`);
    return r.json();
  });
  return mergeCatalogWithManifest(catalogRes.experts || [], { enabled: false, experts: [] });
}

/**
 * @param {boolean} [force]
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function loadPlatformExperts(force = false) {
  if (mergedExperts && !force) return mergedExperts;
  const [catalogRes, manifest] = await Promise.all([
    fetch(CATALOG_URL, { cache: "no-store" }).then((r) => {
      if (!r.ok) throw new Error(`catalog HTTP ${r.status}`);
      return r.json();
    }),
    loadAgentscopeManifest(),
  ]);
  mergedExperts = mergeCatalogWithManifest(catalogRes.experts || [], manifest);
  return mergedExperts;
}

/**
 * @param {string} id
 * @param {Array<Record<string, unknown>>} list
 */
export function getPlatformExpertById(id, list) {
  return (list || mergedExperts || []).find((e) => e.id === id || e.frontend_id === id) || null;
}
