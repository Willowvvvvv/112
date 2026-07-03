/**
 * agent-config — 加载 manifest、解析专家与 Agent 绑定
 * 版本: v1.5 | 日期: 2026-06-27
 */

const MANIFEST_URL = "./data/agentscope-manifest-v1.0-20260627.json";
/** 默认 bypass：MCP 工具自动执行；仅 MCP 显式 REQUIRE_USER_CONFIRM 时才弹确认卡 */
export const DEFAULT_PERMISSION_MODE = "bypass";

/** @type {Record<string, unknown> | null} */
let cachedManifest = null;
/** @type {Promise<Record<string, unknown>> | null} */
let loadPromise = null;

/**
 * @returns {Promise<Record<string, unknown>>}
 */
export function loadAgentscopeManifest() {
  if (cachedManifest) return Promise.resolve(cachedManifest);
  if (loadPromise) return loadPromise;
  loadPromise = fetch(MANIFEST_URL, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`manifest ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cachedManifest = { ...data, enabled: data.enabled !== false };
      return cachedManifest;
    })
    .catch((err) => {
      console.warn("[agent-config] manifest 加载失败，使用离线 Demo", err);
      cachedManifest = { enabled: false, experts: [], default: null };
      return cachedManifest;
    });
  return loadPromise;
}

/**
 * @param {Record<string, unknown>} manifest
 * @param {{ ui?: { activeExpertId?: string | null } }} state
 * @returns {{ agentId: string, sessionId: string, expertName: string, frontendId: string } | null}
 */
export function resolveExpertBinding(manifest, state) {
  if (!manifest?.enabled) return null;
  const experts = /** @type {Array<Record<string, string>>} */ (manifest.experts || []);
  const rawIds = state?.ui?.activeExpertIds?.length
    ? state.ui.activeExpertIds
    : (state?.ui?.activeExpertId ? [state.ui.activeExpertId] : []);
  const domainId = rawIds.find((id) => id && id !== "ex-default");
  if (domainId) {
    const hit = experts.find((e) => e.frontend_id === domainId);
    if (hit?.agent_id && hit?.session_id) {
      return {
        agentId: hit.agent_id,
        sessionId: hit.session_id,
        expertName: hit.name || "专家",
        frontendId: hit.frontend_id || domainId,
      };
    }
  }
  const def = /** @type {Record<string, string> | null} */ (
    manifest.assistant || manifest.default
  );
  if (def?.agent_id && def?.session_id) {
    return {
      agentId: def.agent_id,
      sessionId: def.session_id,
      expertName: def.name || "小星",
      frontendId: def.frontend_id || "ex-default",
    };
  }
  return null;
}

/**
 * @param {Record<string, unknown>} manifest
 * @returns {{ apiBase: string, userId: string }}
 */
export function getApiConfig(manifest) {
  return {
    apiBase: String(manifest.api_base || "http://127.0.0.1:8001").replace(/\/$/, ""),
    userId: String(manifest.user_id || "jindiaobao"),
  };
}

/**
 * 同步 session 权限模式为 bypass（与 bootstrap-llm / bootstrap-manifest 一致）。
 */
export async function ensureSessionPermissionMode(manifest, agentId, sessionId) {
  const { apiBase, userId } = getApiConfig(manifest);
  const qs = new URLSearchParams({ agent_id: agentId });
  try {
    const res = await fetch(`${apiBase}/sessions/${sessionId}?${qs}`, {
      method: "PATCH",
      headers: {
        "X-User-ID": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ permission_mode: DEFAULT_PERMISSION_MODE }),
    });
    if (!res.ok) {
      console.warn("[agent-config] 设置 permission_mode 失败", res.status);
    }
  } catch (err) {
    console.warn("[agent-config] 设置 permission_mode 失败", err);
  }
}

/** @deprecated 使用 ensureSessionPermissionMode */
export const ensureSessionBypass = ensureSessionPermissionMode;

async function apiJson(manifest, path, init = {}) {
  const { apiBase, userId } = getApiConfig(manifest);
  const headers = { "X-User-ID": userId, ...(init.headers || {}) };
  if (init.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${apiBase}${path}`, { ...init, headers });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${path} -> ${res.status}: ${detail}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}

/**
 * @param {Record<string, unknown> | null | undefined} sessionView
 */
function sessionHasAskingToolCall(sessionView) {
  const context = sessionView?.session?.state?.context || [];
  for (const msg of context) {
    for (const block of msg.content || []) {
      if (block.type === "tool_call" && block.state === "asking") return true;
    }
  }
  return false;
}

/**
 * @param {string} frontendId
 * @param {string} sessionId
 */
export function patchExpertSessionInManifest(frontendId, sessionId) {
  if (!cachedManifest) return;
  const experts = /** @type {Array<Record<string, string>>} */ (cachedManifest.experts || []);
  for (const ex of experts) {
    if (ex.frontend_id === frontendId) ex.session_id = sessionId;
  }
  const def = /** @type {Record<string, string> | undefined} */ (
    cachedManifest.assistant || cachedManifest.default
  );
  if (def?.frontend_id === frontendId) def.session_id = sessionId;
}

/**
 * 确保 session 可对话。bypass 下工具自动执行；仅残留 asking（历史 default 卡死）时重建。
 */
export async function ensureRunnableSession(manifest, binding) {
  const { agentId, frontendId } = binding;
  let { sessionId } = binding;

  await ensureSessionPermissionMode(manifest, agentId, sessionId);

  const list = await apiJson(manifest, `/sessions/?${new URLSearchParams({ agent_id: agentId })}`);
  const view = (list.sessions || []).find(
    (v) => (v.session?.id || v.session?.session_id) === sessionId,
  );

  const mode = view?.session?.state?.permission_context?.mode;
  if (view && mode !== DEFAULT_PERMISSION_MODE) {
    await ensureSessionPermissionMode(manifest, agentId, sessionId);
  }

  const stuckAsking = view && sessionHasAskingToolCall(view);
  if (view && !stuckAsking) {
    return sessionId;
  }

  const chatModelConfig = view?.session?.config?.chat_model_config;
  const { apiBase, userId } = getApiConfig(manifest);
  const qs = new URLSearchParams({ agent_id: agentId });

  console.warn("[agent-config] session 不可用或卡在历史 asking，重建中", sessionId);
  if (view) {
    try {
      await fetch(`${apiBase}/sessions/${sessionId}?${qs}`, {
        method: "DELETE",
        headers: { "X-User-ID": userId },
      });
    } catch (err) {
      console.warn("[agent-config] 删除卡住 session 失败", err);
    }
  }

  const created = await apiJson(manifest, "/sessions/", {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      chat_model_config: chatModelConfig,
      permission_mode: DEFAULT_PERMISSION_MODE,
    }),
  });
  const newSessionId = created.session_id;
  await ensureSessionPermissionMode(manifest, agentId, newSessionId);
  patchExpertSessionInManifest(frontendId, newSessionId);
  console.info("[agent-config] 已重建专家 session", frontendId, newSessionId);
  return newSessionId;
}
