/**
 * session-auto-title — 首条用户消息后自动生成会话标题（10 字以内）
 * 版本: v1.1 | 日期: 2026-06-27
 */

import { getApiConfig, loadAgentscopeManifest } from "./agentscope-config-v1.0-20260627.js";

export const MAX_SESSION_TITLE_LEN = 10;

/** @param {string | undefined | null} name */
export function isDefaultSessionName(name) {
  const n = (name || "").trim();
  if (!n) return true;
  if (/^新对话(\s*\d+)?$/u.test(n)) return true;
  return false;
}

/** @param {string} message */
export function fallbackSessionTitle(message) {
  const text = String(message || "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/\s+/g, "")
    .trim();
  if (!text) return "新对话";
  return text.slice(0, MAX_SESSION_TITLE_LEN);
}

/**
 * @param {Record<string, unknown>} manifest
 * @param {string} message
 */
export async function fetchAutoSessionTitle(manifest, message) {
  const text = String(message || "").trim();
  if (!text) return null;

  const { apiBase, userId } = getApiConfig(manifest);
  try {
    const res = await fetch(`${apiBase}/sessions/auto-title`, {
      method: "POST",
      headers: {
        "X-User-ID": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) return fallbackSessionTitle(text);
    const data = await res.json();
    const title = String(data?.title || "").trim();
    if (!title || isDefaultSessionName(title)) return fallbackSessionTitle(text);
    return title.slice(0, MAX_SESSION_TITLE_LEN);
  } catch {
    return fallbackSessionTitle(text);
  }
}

const attemptedIds = new Set();

/**
 * 首条用户消息后写回 sess.name；先同步兜底标题，再异步 AI 优化。
 * @param {Record<string, unknown>} sess
 * @param {string} message
 * @param {(title: string) => void} [onTitle]
 */
export async function applySessionAutoTitle(sess, message, onTitle) {
  if (!sess || !isDefaultSessionName(/** @type {string} */ (sess.name))) return;
  const id = String(sess.id || "");
  if (!id || attemptedIds.has(id)) return;

  const userCount = (sess.messages || []).filter((m) => m.role === "user").length;
  if (userCount !== 1) return;

  attemptedIds.add(id);
  const fallback = fallbackSessionTitle(message);
  onTitle?.(fallback);

  const manifest = await loadAgentscopeManifest();
  const aiTitle = manifest?.enabled
    ? await fetchAutoSessionTitle(manifest, message)
    : fallback;

  if (aiTitle && aiTitle !== fallback && !isDefaultSessionName(aiTitle)) {
    onTitle?.(aiTitle);
  }
}
