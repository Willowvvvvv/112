/**
 * 统一来源溯源 — 静态 Demo（对齐 agent-demo source-citations）
 * 版本: v1.0 | 日期: 2026-06-29
 */

/**
 * @typedef {'web' | 'kb'} SourceKind
 * @typedef {{ id: number, kind: SourceKind, title: string, snippet?: string, url?: string, sourceFile?: string, pageNum?: number|null, sectionTitle?: string|null }} SourceCitation
 */

export function injectSourceCitationLinks(text) {
  return String(text ?? "")
    .replace(/⟦(\d+)⟧/g, "[$1](#finstep-cite-$1)")
    .replace(/【来源(\d+)】/g, "[$1](#finstep-cite-$1)");
}

export function messageHasSourceCitationMarkers(text) {
  return /⟦\d+⟧/.test(text) || /【来源\d+】/.test(text) || /#finstep-cite-\d+/.test(text);
}

/** @param {SourceCitation[]} citations */
export function findSourceCitation(citations, id) {
  return citations.find((c) => c.id === id);
}

/** @param {SourceCitation} citation */
export function formatSourceCitationLabel(citation) {
  if (citation.kind === "kb") {
    const base = (citation.sourceFile || citation.title || "").replace(/^.*[\\/]/, "");
    const parts = [base];
    if (citation.pageNum != null) parts.push(`第${citation.pageNum}页`);
    if (citation.sectionTitle) parts.push(citation.sectionTitle);
    return parts.join(" · ");
  }
  return citation.title;
}

/** @param {SourceKind} kind */
export function sourceKindLabel(kind) {
  return kind === "kb" ? "知识库" : "联网检索";
}

/**
 * @param {SourceCitation[]} citations
 * @param {(id: number) => string} onClickJs
 */
export function renderMessageSourceBar(citations, onClickJs) {
  if (!citations?.length) return "";
  const items = citations.map((c) => {
    const label = formatSourceCitationLabel(c);
    const onclick = onClickJs(c.id);
    return `<li>
      <button type="button" class="xb-message-source-chip xb-message-source-chip--${c.kind}"
        title="${escapeAttr(label)}" onclick="${onclick}">
        <span class="xb-message-source-chip__id">${c.id}</span>
        <span class="xb-message-source-chip__kind">${sourceKindLabel(c.kind)}</span>
        <span class="xb-message-source-chip__title">${escapeAttr(label)}</span>
      </button>
    </li>`;
  }).join("");
  return `<div class="xb-message-source-bar" role="navigation" aria-label="引用来源">
    <span class="xb-message-source-bar__label">来源</span>
    <ul class="xb-message-source-bar__list">${items}</ul>
  </div>`;
}

function escapeAttr(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function citationsFromWebSearchJson(text, startId = 1) {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data?.results)) return [];
    const citations = [];
    let id = startId;
    for (const item of data.results) {
      if (!item || typeof item !== "object") continue;
      const title = String(item.title ?? "").trim();
      const url = String(item.url ?? "").trim();
      const snippet = String(item.snippet ?? "").trim();
      if (!title && !url && !snippet) continue;
      citations.push({
        id,
        kind: "web",
        title: title || url || `来源 ${id}`,
        url,
        snippet,
      });
      id += 1;
    }
    return citations;
  } catch {
    return [];
  }
}

/** @param {Array<{type?: string, name?: string, output?: string}>} blocks */
export function collectSourceCitationsFromAgentBlocks(blocks) {
  const merged = [];
  let nextId = 1;
  for (const block of blocks || []) {
    if (block.type !== "tool" || block.name !== "web_search" || !block.output) continue;
    const batch = citationsFromWebSearchJson(block.output, nextId);
    merged.push(...batch);
    nextId += batch.length;
  }
  return merged;
}

export function renderSourceCitationBadge(id, citations, onClickJs) {
  const citation = findSourceCitation(citations, id);
  if (!citation) {
    return `<span class="xb-source-cite-badge xb-source-cite-badge--missing" title="来源 ${id} 暂无详情">${id}</span>`;
  }
  const label = formatSourceCitationLabel(citation);
  return `<button type="button" class="xb-source-cite-badge xb-source-cite-badge--${citation.kind}"
    title="${escapeAttr(label)}" aria-label="查看来源 ${id}: ${escapeAttr(label)}"
    onclick="${onClickJs(id)}">${id}</button>`;
}
