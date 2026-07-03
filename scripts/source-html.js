/**
 * source-html.js — 证据原文 HTML 片段
 * 版本：v1.0-20250626
 */
import { escapeHtml } from "./state.js";
import { EVIDENCE } from "../data/mock-data.js";

const h = String.raw;

export function sourceHtml(key) {
  const e = EVIDENCE[key];
  if (!e) return `<p>${escapeHtml(key)}</p><p class="muted">Mock 环境暂无原文预览。</p>`;
  return h`
    <p><strong>${escapeHtml(e.file)}</strong> · 第 ${escapeHtml(String(e.page))} 页</p>
    <blockquote>${escapeHtml(e.quote)}</blockquote>
    ${e.note ? `<p class="callout warn">${escapeHtml(e.note)}</p>` : ""}
  `;
}
