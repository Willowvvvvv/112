/**
 * markdown-render — 对话区 Markdown 渲染（无外部依赖）
 * 版本: v1.2 | 日期: 2026-06-29
 */

import {
  injectSourceCitationLinks,
  renderSourceCitationBadge,
} from "./source-citations-demo-v1.0-20260629.js";

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(raw) {
  const href = String(raw || "").trim();
  if (/^(https?:|mailto:)/i.test(href)) return escapeHtml(href);
  return "#";
}

function inlineMd(text, citeCtx) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, "<code class=\"md-inline-code\">$1</code>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const citeMatch = String(href).match(/^#finstep-cite-(\d+)$/);
    if (citeMatch && citeCtx?.citations?.length && citeCtx.onClickJs) {
      return renderSourceCitationBadge(Number(citeMatch[1]), citeCtx.citations, citeCtx.onClickJs);
    }
    const safe = safeHref(href);
    return safe === "#"
      ? escapeHtml(label)
      : `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  return s;
}

function isTableSeparator(line) {
  return /^\|?[\s:-]+\|[\s|:-]+$/.test(line.trim());
}

function isTableRow(line) {
  const t = line.trim();
  return t.includes("|") && (t.startsWith("|") || /\|.+\|/.test(t));
}

function normalizeTableRow(line) {
  let t = line.trim();
  if (!t.startsWith("|")) t = `|${t}`;
  if (!t.endsWith("|")) t = `${t}|`;
  return t;
}

function renderTable(lines, citeCtx) {
  if (lines.length < 1) return "";
  const normalized = lines.map(normalizeTableRow);
  const split = (row) => row.split("|").slice(1, -1).map((c) => c.trim());
  const heads = split(normalized[0]);
  const bodyStart = normalized.length > 1 && isTableSeparator(normalized[1]) ? 2 : 1;
  const bodyRows = normalized.slice(bodyStart).map(split);
  const th = heads.map((h) => `<th>${inlineMd(h, citeCtx)}</th>`).join("");
  const trs = bodyRows
    .filter((cells) => cells.some((c) => c))
    .map((cells) => `<tr>${cells.map((c) => `<td>${inlineMd(c, citeCtx)}</td>`).join("")}</tr>`)
    .join("");
  return `<div class="md-table-wrap"><table class="md-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function renderMarkdown(text, citeCtx = null) {
  if (!text) return "";
  const prepared = citeCtx ? injectSourceCitationLinks(text) : String(text);
  const lines = prepared.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let inCode = false;
  let codeBuf = [];
  let listBuf = null;

  const flushList = () => {
    if (!listBuf) return;
    const tag = listBuf.ordered ? "ol" : "ul";
    out.push(`<${tag} class="md-list">${listBuf.items.map((li) => `<li>${inlineMd(li, citeCtx)}</li>`).join("")}</${tag}>`);
    listBuf = null;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushList();
      if (!inCode) {
        inCode = true;
        codeBuf = [];
      } else {
        out.push(`<pre class="md-code"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        inCode = false;
        codeBuf = [];
      }
      i += 1;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i += 1;
      continue;
    }
    if (isTableRow(line)) {
      flushList();
      const tableLines = [normalizeTableRow(line)];
      i += 1;
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(normalizeTableRow(lines[i]));
        i += 1;
      }
      out.push(renderTable(tableLines, citeCtx));
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      out.push(`<h${level} class="md-h md-h${level}">${inlineMd(h[2], citeCtx)}</h${level}>`);
      i += 1;
      continue;
    }
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      if (!listBuf || listBuf.ordered) {
        flushList();
        listBuf = { ordered: false, items: [] };
      }
      listBuf.items.push(ul[1]);
      i += 1;
      continue;
    }
    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      if (!listBuf || !listBuf.ordered) {
        flushList();
        listBuf = { ordered: true, items: [] };
      }
      listBuf.items.push(ol[1]);
      i += 1;
      continue;
    }
    if (!line.trim()) {
      flushList();
      out.push("<br>");
      i += 1;
      continue;
    }
    flushList();
    out.push(`<p class="md-p">${inlineMd(line, citeCtx)}</p>`);
    i += 1;
  }
  flushList();
  if (inCode && codeBuf.length) {
    out.push(`<pre class="md-code"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  }
  return `<div class="md-body">${out.join("")}</div>`;
}
