/**
 * chat-persistence — 独立对话 localStorage 持久化
 * 版本: v1.0 | 日期: 2026-06-27
 */

export const CHAT_PERSISTENCE_KEY = "jindiaobao-chat-persistence-v1.0-20260627";
export const CHAT_PERSISTENCE_VERSION = "1.0";

const MAX_SESSIONS = 50;
const MAX_MESSAGES = 200;

/** createSession() 生成的用户对话 id */
export function isUserChatSession(sessionOrId) {
  const id = typeof sessionOrId === "string" ? sessionOrId : sessionOrId?.id;
  return typeof id === "string" && /^session-\d+$/.test(id);
}

function trimSession(sess) {
  if (!sess || typeof sess !== "object") return sess;
  const copy = { ...sess };
  if (Array.isArray(copy.messages) && copy.messages.length > MAX_MESSAGES) {
    copy.messages = copy.messages.slice(-MAX_MESSAGES);
  }
  return copy;
}

/**
 * @param {Record<string, unknown>} sessionCache
 */
export function pickPersistableSessions(sessionCache) {
  const out = {};
  const entries = Object.entries(sessionCache || {})
    .filter(([, sess]) => isUserChatSession(sess))
    .sort((a, b) => {
      const ta = Number(String(a[0]).replace("session-", "")) || 0;
      const tb = Number(String(b[0]).replace("session-", "")) || 0;
      return tb - ta;
    })
    .slice(0, MAX_SESSIONS);
  for (const [id, sess] of entries) {
    out[id] = trimSession(sess);
  }
  return out;
}

/**
 * @param {Array<Record<string, unknown>>} demoRecents
 * @param {Array<Record<string, unknown>> | undefined} userRecents
 */
export function mergeRecentItems(demoRecents, userRecents) {
  const demo = [...(demoRecents || [])];
  const user = (userRecents || []).filter((r) => isUserChatSession(r));
  const userIds = new Set(user.map((r) => r.id));
  return [...user, ...demo.filter((r) => !userIds.has(r.id))];
}

/**
 * @returns {{ sessions: Record<string, unknown>, recentItems: Array<Record<string, unknown>> } | null}
 */
export function loadChatPersistence() {
  try {
    const raw = localStorage.getItem(CHAT_PERSISTENCE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    return {
      sessions: data.sessions && typeof data.sessions === "object" ? data.sessions : {},
      recentItems: Array.isArray(data.recentItems) ? data.recentItems : [],
    };
  } catch {
    return null;
  }
}

/**
 * @param {{ sessionCache?: Record<string, unknown>, recentItems?: Array<Record<string, unknown>> }} payload
 */
export function saveChatPersistence(payload) {
  try {
    const sessions = pickPersistableSessions(payload?.sessionCache);
    const recentItems = (payload?.recentItems || []).filter((r) => isUserChatSession(r));
    localStorage.setItem(
      CHAT_PERSISTENCE_KEY,
      JSON.stringify({
        version: CHAT_PERSISTENCE_VERSION,
        date: "2026-06-27",
        updatedAt: Date.now(),
        sessions,
        recentItems,
      }),
    );
    return true;
  } catch (err) {
    console.warn("[财跃启明星] 对话持久化失败", err);
    return false;
  }
}

let persistTimer = null;

/**
 * @param {{ sessionCache?: Record<string, unknown>, recentItems?: Array<Record<string, unknown>> }} payload
 * @param {number} [delayMs]
 */
export function scheduleChatPersistence(payload, delayMs = 400) {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    saveChatPersistence(payload);
  }, delayMs);
}

/**
 * @param {Record<string, unknown>} sess
 * @returns {Record<string, unknown>}
 */
export function buildRecentItemFromSession(sess) {
  const firstUser = (sess.messages || []).find((m) => m.role === "user");
  let label = sess.company || sess.name || "新对话";
  if (!sess.company && sess.name && !/^新对话(\s*\d+)?$/u.test(String(sess.name).trim())) {
    label = sess.name;
  } else if (firstUser) {
    const t = typeof firstUser.text === "string"
      ? firstUser.text
      : (firstUser.type === "text-with-files" ? firstUser.text : "");
    if (t?.trim()) label = t.trim().replace(/^\[[^\]]+\]\s*/, "");
  }
  if (label.length > 32) label = `${label.slice(0, 32)}…`;
  return {
    id: sess.id,
    kind: sess.kind === "project" ? "project" : "ephemeral",
    projectId: sess.projectId || null,
    label,
    time: "刚才",
    bucket: "today",
  };
}
