/**
 * 项目图谱 — 静态 Demo（对齐 agent-demo /graph 两栏布局）
 * 版本: v1.0 | 日期: 2026-06-29
 */

export const GRAPH_DEMO_PROJECT = {
  id: "proj-bioray-001",
  name: "某生物医药 Pre-B 轮尽调",
  company: "苏州某生物医药科技有限公司",
};

export const GRAPH_DEMO_KB = {
  id: "kb-bioray-demo",
  name: "某生物医药 · 尽调资料库",
};

export const GRAPH_DEMO_DOCS = [
  { id: "d1", name: "融资 BP.pdf", status: "synced", selected: true },
  { id: "d2", name: "2022-2024 审计报告.pdf", status: "synced", selected: true },
  { id: "d3", name: "专家访谈纪要.docx", status: "ready", selected: false },
  { id: "d4", name: "股权架构.xlsx", status: "synced", selected: true },
  { id: "d5", name: "临床进展说明.pptx", status: "ready", selected: false },
];

/** 节点类型：company | person | concept | event | org */
export const GRAPH_DEMO_NODES = [
  { id: "n1", label: "苏州某生物医药科技有限公司", type: "company", x: 400, y: 240 },
  { id: "n2", label: "张明", type: "person", x: 160, y: 140 },
  { id: "n3", label: "李芳", type: "person", x: 640, y: 150 },
  { id: "n4", label: "CAR-T 疗法", type: "concept", x: 400, y: 70 },
  { id: "n5", label: "Pre-B 轮融资", type: "event", x: 140, y: 340 },
  { id: "n6", label: "国投资本", type: "org", x: 660, y: 350 },
  { id: "n7", label: "临床 II 期", type: "concept", x: 600, y: 80 },
  { id: "n8", label: "核心专利组合", type: "concept", x: 240, y: 400 },
];

export const GRAPH_DEMO_LINKS = [
  { source: "n2", target: "n1", label: "法定代表人" },
  { source: "n3", target: "n1", label: "财务负责人" },
  { source: "n1", target: "n4", label: "主营产品" },
  { source: "n1", target: "n7", label: "研发阶段" },
  { source: "n5", target: "n1", label: "融资标的" },
  { source: "n6", target: "n5", label: "领投方" },
  { source: "n1", target: "n8", label: "知识产权" },
];

const NODE_TYPE_LABEL = {
  company: "企业",
  person: "自然人",
  concept: "概念",
  event: "事件",
  org: "机构",
};

const NODE_STYLE = {
  company: { fill: "#3b82f6", stroke: "#1d4ed8", r: 28 },
  person: { fill: "#f97316", stroke: "#c2410c", r: 20 },
  concept: { fill: "#64748b", stroke: "#475569", r: 18 },
  event: { fill: "#8b5cf6", stroke: "#6d28d9", r: 18 },
  org: { fill: "#10b981", stroke: "#047857", r: 20 },
};

function truncateLabel(label, max = 10) {
  const s = String(label || "");
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function nodeById(id) {
  return GRAPH_DEMO_NODES.find((n) => n.id === id);
}

function renderGraphSvg(escapeHtml, selectedNodeId, highlightIds = [], searchQ = "") {
  const highlights = new Set(highlightIds);
  const lines = GRAPH_DEMO_LINKS.map((link) => {
    const a = nodeById(link.source);
    const b = nodeById(link.target);
    if (!a || !b) return "";
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    return `
      <line class="graph-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />
      <text class="graph-edge-label" x="${mx}" y="${my - 4}">${escapeHtml(link.label)}</text>
    `;
  }).join("");

  const nodes = GRAPH_DEMO_NODES.map((n) => {
    const style = NODE_STYLE[n.type] || NODE_STYLE.concept;
    const selected = n.id === selectedNodeId;
    const dim = searchQ
      ? !highlights.has(n.id)
      : (selectedNodeId && !selected && !highlights.has(n.id));
    return `
      <g class="graph-node${selected ? " is-selected" : ""}${dim ? " is-dim" : ""}${highlights.has(n.id) && searchQ ? " is-hit" : ""}"
        data-node-id="${n.id}" transform="translate(${n.x},${n.y})">
        <circle r="${style.r}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2" />
        <text class="graph-node-label" dy="${style.r + 18}">${escapeHtml(truncateLabel(n.label, 12))}</text>
      </g>
    `;
  }).join("");

  return `
    <svg class="graph-canvas-svg" viewBox="0 0 800 480" role="img" aria-label="项目知识图谱示意">
      <defs>
        <pattern id="graph-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#graph-grid)" />
      ${lines}
      ${nodes}
    </svg>
  `;
}

export function renderGraphView(escapeHtml, icon, jsCall, state) {
  const fd = state?.featureData || {};
  const selectedNodeId = fd.graphSelectedNodeId || null;
  const selectedDocIds = new Set(fd.graphSelectedDocIds || GRAPH_DEMO_DOCS.filter((d) => d.selected).map((d) => d.id));
  const searchQ = String(fd.graphSearchQ || "").trim().toLowerCase();
  const highlightIds = searchQ
    ? GRAPH_DEMO_NODES.filter((n) => n.label.toLowerCase().includes(searchQ)).map((n) => n.id)
    : [];

  const docs = GRAPH_DEMO_DOCS.map((doc) => {
    const checked = selectedDocIds.has(doc.id);
    const statusLabel = doc.status === "synced" ? "已同步" : "待同步";
    const statusCls = doc.status === "synced" ? "graph-doc-badge--synced" : "graph-doc-badge--ready";
    return `
      <li class="graph-doc-row">
        <label class="graph-doc-check">
          <input type="checkbox" ${checked ? "checked" : ""}
            onchange="XinBaoDemo.toggleGraphDoc('${escapeHtml(doc.id)}', this.checked)" />
          <span class="graph-doc-name">${escapeHtml(doc.name)}</span>
        </label>
        <span class="graph-doc-badge ${statusCls}">${statusLabel}</span>
      </li>
    `;
  }).join("");

  const selectedNode = selectedNodeId ? nodeById(selectedNodeId) : null;
  const legend = [
    ["company", "企业"],
    ["person", "自然人"],
    ["concept", "概念/业务"],
    ["event", "事件"],
    ["org", "机构"],
  ].map(([type, label]) => {
    const s = NODE_STYLE[type];
    return `<span class="graph-legend-item"><i style="background:${s.fill}"></i>${label}</span>`;
  }).join("");

  return `
    <div class="graph-page">
      <div class="graph-layout">
        <aside class="graph-rail">
          <div class="graph-rail-callout">
            <p>当前项目：<strong>${escapeHtml(GRAPH_DEMO_PROJECT.name)}</strong></p>
            <p>绑定资料库：<strong>${escapeHtml(GRAPH_DEMO_KB.name)}</strong></p>
            <ol>
              <li>项目绑定资料库（新建项目时自动创建）</li>
              <li>在资料库中上传尽调文件</li>
              <li>点「同步到图谱」构建实体关系</li>
            </ol>
          </div>
          <div class="graph-rail-field">
            <span class="graph-rail-label">绑定资料库</span>
            <select class="graph-select" disabled>
              <option>${escapeHtml(GRAPH_DEMO_KB.name)}</option>
            </select>
          </div>
          <div class="graph-rail-docs">
            <div class="graph-rail-docs-head">
              <span>文档（${GRAPH_DEMO_DOCS.length}）</span>
              <button type="button" class="graph-link-btn" onclick="XinBaoDemo.selectAllGraphDocs()">全选</button>
              <button type="button" class="graph-link-btn" onclick="XinBaoDemo.deselectAllGraphDocs()">取消</button>
            </div>
            <ul class="graph-doc-list">${docs}</ul>
          </div>
          <p class="graph-rail-meta">上次同步：2026-06-28 14:32</p>
          <button type="button" class="btn-mini primary graph-sync-btn" onclick="XinBaoDemo.syncGraphDemo()">同步到图谱</button>
          <button type="button" class="btn-mini graph-config-btn" onclick="XinBaoDemo.toastGraphConfigDemo()">图谱配置</button>
        </aside>
        <div class="graph-canvas-wrap">
          <div class="graph-canvas-toolbar">
            <input type="search" class="graph-search" placeholder="搜索实体…"
              value="${escapeHtml(fd.graphSearchQ || "")}"
              oninput="XinBaoDemo.setGraphSearch(this.value)" />
            <button type="button" class="graph-icon-btn" title="刷新" onclick="XinBaoDemo.refreshGraphDemo()">${icon("refresh", "icon--sm")}</button>
          </div>
          <div class="graph-canvas" onclick="XinBaoDemo.handleGraphCanvasClick(event)">
            ${renderGraphSvg(escapeHtml, selectedNodeId, highlightIds, searchQ)}
          </div>
          <div class="graph-legend">${legend}</div>
          ${selectedNode ? `
            <div class="graph-node-panel">
              <strong>${escapeHtml(selectedNode.label)}</strong>
              <span class="graph-node-panel-type">${escapeHtml(NODE_TYPE_LABEL[selectedNode.type] || "实体")}</span>
              <p>来自已同步尽调材料抽取的实体节点（Demo 数据）。</p>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

export function findGraphNode(id) {
  return GRAPH_DEMO_NODES.find((n) => n.id === id) || null;
}
