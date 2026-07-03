/**
 * chat-route — 新对话 / 项目路由判定（首页场景选择不得误入项目）
 * 版本: v1.0 | 日期: 2026-06-27
 */

/** 当前 hash 是否在项目路由 #/p/... */
export function isOnProjectRoute(hash = typeof window !== "undefined" ? window.location.hash : "") {
  const raw = String(hash || "").replace(/^#/, "");
  const parts = (raw.startsWith("/") ? raw.slice(1) : raw).split("/").filter(Boolean);
  return parts[0] === "p";
}

/** 会话是否已绑定项目（存为项目 / 项目内对话） */
export function isProjectBoundSession(sess) {
  if (!sess) return false;
  return sess.kind === "project" || !!sess.projectId || !!sess.saved;
}

/** 空对话且未绑定企业/项目 → 首页 hero */
export function isHomeChatSession(sess) {
  if (!sess || sess.saved || sess.company) return false;
  return !(sess.messages || []).length;
}

/** 应用默认落地：新对话首页，而非第一个项目 */
export function defaultLandingHash() {
  return "/chat/new";
}

/** 解析 #/p/{projectId} 或 #/p/{projectId}/c/{chatId} */
export function parseProjectRoute(hash = typeof window !== "undefined" ? window.location.hash : "") {
  const raw = String(hash || "").replace(/^#/, "");
  const parts = (raw.startsWith("/") ? raw.slice(1) : raw).split("/").filter(Boolean);
  if (parts[0] !== "p" || !parts[1]) return null;
  const chatId = parts[2] === "c" ? parts[3] : parts[2] || null;
  return { projectId: parts[1], chatId: chatId || null };
}

/** 项目工作台：仅 #/p/{id}，无子会话 */
export function isProjectHubState(state, hash = typeof window !== "undefined" ? window.location.hash : "") {
  const route = parseProjectRoute(hash);
  if (!route?.projectId || route.chatId) return false;
  return state?.ui?.projectHubId === route.projectId;
}

/** 独立对话应使用的 hash（首页优先保持 /chat/new） */
export function standaloneChatHash(sess, { preferNew = false } = {}) {
  if (!sess) return "/chat/new";
  if (preferNew && isHomeChatSession(sess)) return "/chat/new";
  return `/chat/${sess.id}`;
}
