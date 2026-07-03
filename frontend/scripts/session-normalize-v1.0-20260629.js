/**
 * session-normalize — 会话对象字段兜底（持久化恢复 / 渲染 / 交互）
 * 版本: v1.0 | 日期: 2026-06-29
 */

/** @param {Record<string, unknown> | null | undefined} sess */
export function normalizeCachedSession(sess) {
  if (!sess || typeof sess !== "object") return sess;
  if (!Array.isArray(sess.messages)) sess.messages = [];
  if (!Array.isArray(sess.materials)) sess.materials = [];
  if (!Array.isArray(sess.aiReports)) sess.aiReports = [];
  return sess;
}

/** @param {Record<string, unknown> | null | undefined} cache */
export function normalizeSessionCache(cache) {
  const out = {};
  for (const [id, sess] of Object.entries(cache || {})) {
    out[id] = normalizeCachedSession(
      typeof sess === "object" && sess ? { ...sess } : sess,
    );
  }
  return out;
}

/** 交互前确保 messages 可写 */
export function ensureSessionMessages(sess) {
  if (!sess || typeof sess !== "object") return [];
  if (!Array.isArray(sess.messages)) sess.messages = [];
  return sess.messages;
}
