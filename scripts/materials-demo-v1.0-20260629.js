/**
 * 资料库页 — 静态 Demo（对齐 agent-demo /knowledge MaterialsPageShell）
 * 版本: v1.1 | 日期: 2026-07-03
 * 报告模板已迁至 report-template-demo / #/report-templates
 */
import {
  MATERIALS_LIB,
} from "../data/mock-data.js";
import { GRAPH_DEMO_KB, GRAPH_DEMO_DOCS } from "./graph-demo-v1.0-20260629.js";

export const MATERIALS_KB_DEMO = [
  {
    id: GRAPH_DEMO_KB.id,
    name: GRAPH_DEMO_KB.name,
    description: "项目尽调材料向量库，支持 RAG 检索与图谱同步",
  },
  {
    id: "kb-org-shared",
    name: "国投资本 · 共享资料库",
    description: "机构级通用研究与模板沉淀",
  },
];

export const MATERIALS_KB_DOCS = {
  [GRAPH_DEMO_KB.id]: GRAPH_DEMO_DOCS.map((d) => ({
    id: d.id,
    name: d.name,
    status: d.status === "synced" ? "ready" : "indexing",
    size: d.name.endsWith(".pdf") ? "2.4 MB" : "860 KB",
    folder: d.name.includes("审计") ? "财务" : d.name.includes("BP") ? "商业" : "其他",
  })),
  "kb-org-shared": [
    { id: "s1", name: "行业研究方法论.pdf", status: "ready", size: "1.1 MB", folder: "研究" },
    { id: "s2", name: "投委会材料规范.docx", status: "ready", size: "420 KB", folder: "制度" },
  ],
};

export const DEMO_SAVED_TARGET_LISTS = [
  {
    id: "list-demo-001",
    name: "医疗器械 Pre-A/Pre-B 线索",
    sector: "医疗器械",
    savedAt: "2026-06-25",
    source: "找项目",
    itemCount: 12,
    summary: "示例名单：某医疗A（尽调中）、某医疗B（待访谈）等 12 家标的。",
  },
  {
    id: "list-demo-002",
    name: "航空 MRO 融资动态",
    sector: "航空MRO",
    savedAt: "2026-06-20",
    source: "投资雷达",
    itemCount: 8,
  },
  {
    id: "list-demo-003",
    name: "新能源电池材料标的",
    sector: "新能源",
    savedAt: "2026-06-18",
    source: "找项目",
    itemCount: 15,
  },
];

const LEGACY_TAB_MAP = {
  报告模板: { redirect: "report-templates", reportTemplateGroup: "mine" },
  调研报告: { section: "saved", savedGroup: "ai" },
  会议纪要: { section: "saved", savedGroup: "ai" },
  企业名单: { section: "saved", savedGroup: "lists" },
  收藏资讯: { section: "saved", savedGroup: "news" },
};

const DOC_STATUS_LABEL = {
  ready: "已就绪",
  indexing: "索引中",
  error: "失败",
};

export function parseMaterialsSelection(state) {
  const fd = state?.featureData || {};
  if (fd.materialsSection) {
    return {
      section: fd.materialsSection,
      savedGroup: fd.materialsSavedGroup || "lists",
      kbId: fd.materialsKbId || null,
    };
  }
  const legacy = LEGACY_TAB_MAP[fd.materialsTab];
  if (legacy?.redirect) {
    return {
      section: "knowledge",
      savedGroup: "lists",
      kbId: GRAPH_DEMO_KB.id,
      redirect: legacy.redirect,
      reportTemplateGroup: legacy.reportTemplateGroup,
    };
  }
  if (legacy) {
    return {
      section: legacy.section,
      savedGroup: legacy.savedGroup || "lists",
      kbId: null,
    };
  }
  return {
    section: "knowledge",
    savedGroup: "lists",
    kbId: GRAPH_DEMO_KB.id,
  };
}

function hiddenSet(state, key) {
  return new Set(state?.featureData?.[key] || []);
}

function getSavedNews(state) {
  const hidden = hiddenSet(state, "materialsHiddenNews");
  const all = [
    ...MATERIALS_LIB.filter((m) => m.type === "收藏资讯"),
    ...(state.userMaterials || []).filter((m) => m.type === "收藏资讯"),
  ];
  return all.filter((m) => !hidden.has(m.id));
}

function getSavedLists(state) {
  const hidden = hiddenSet(state, "materialsHiddenLists");
  const userLists = (state.userMaterials || []).filter((m) => m.type === "企业名单");
  const rows = [
    ...DEMO_SAVED_TARGET_LISTS,
    ...userLists.map((m) => ({
      id: m.id,
      name: m.title,
      sector: m.source || "—",
      savedAt: m.date || "—",
      source: m.source || "找项目",
      itemCount: (m.fullText || "").split("\n").length - 1,
      summary: m.fullText?.slice(0, 120),
    })),
  ];
  return rows.filter((r) => !hidden.has(r.id));
}

function aggregateAiOutputs(state) {
  const hidden = hiddenSet(state, "materialsHiddenAi");
  const rows = [];
  for (const p of state.projectList || []) {
    for (const r of p.aiReports || []) {
      const id = `ai-${p.id}-${r.id}`;
      if (hidden.has(id)) continue;
      rows.push({
        id,
        projectId: p.id,
        projectName: p.name,
        company: p.company,
        name: r.name || r.label || "AI 报告",
        kind: "ai_report",
        updatedAt: r.generatedAt || r.sharedAt || p.updated || "—",
        shareState: r.shared ? "shared" : "draft",
      });
    }
    for (const m of p.materials || []) {
      const id = `mat-${p.id}-${m.id}`;
      if (hidden.has(id)) continue;
      rows.push({
        id,
        projectId: p.id,
        projectName: p.name,
        company: p.company,
        name: m.name,
        kind: "material",
        updatedAt: m.uploadedAt || p.updated || "—",
        shareState: "shared",
      });
    }
  }
  const legacyReports = MATERIALS_LIB.filter((m) => m.type === "调研报告" || m.type === "会议纪要");
  for (const m of legacyReports) {
    if (hidden.has(m.id)) continue;
    rows.push({
      id: m.id,
      projectId: m.projectId,
      projectName: m.projectId ? "关联项目" : "跨项目",
      company: "",
      name: m.title,
      kind: m.type === "会议纪要" ? "material" : "report_doc",
      updatedAt: m.date || "—",
      shareState: "shared",
    });
  }
  return rows;
}

export function findSavedAiOutput(state, id) {
  return aggregateAiOutputs(state).find((row) => row.id === id) || null;
}

function navBtn(active, onclick, iconHtml, label) {
  return `
    <button type="button" class="materials-nav-item${active ? " is-active" : ""}" onclick="${onclick}">
      <span class="materials-nav-item__icon" aria-hidden="true">${iconHtml}</span>
      <span class="materials-nav-item__label">${label}</span>
    </button>
  `;
}

function resourceRow(escapeHtml, icon, jsCall, { title, desc, meta, metaHtml, viewFn, downloadFn, deleteFn }) {
  return `
    <article class="materials-resource-row">
      <div class="materials-resource-row__body">
        <strong>${escapeHtml(title)}</strong>
        ${desc ? `<p>${escapeHtml(desc)}</p>` : ""}
        ${metaHtml ? `<span class="materials-resource-row__meta">${metaHtml}</span>` : meta ? `<span class="materials-resource-row__meta">${escapeHtml(meta)}</span>` : ""}
      </div>
      <div class="materials-resource-row__actions">
        ${viewFn ? `<button type="button" class="materials-icon-btn" title="查看" onclick="${viewFn}">${icon("search", "icon--sm")}</button>` : ""}
        ${downloadFn ? `<button type="button" class="materials-icon-btn" title="下载" onclick="${downloadFn}">${icon("download", "icon--sm")}</button>` : ""}
        ${deleteFn ? `<button type="button" class="materials-icon-btn materials-icon-btn--danger" title="删除" onclick="${deleteFn}">${icon("x", "icon--sm")}</button>` : ""}
      </div>
    </article>
  `;
}

function renderKnowledgePanel(escapeHtml, icon, jsCall, state, kb) {
  if (!kb) {
    return `
      <div class="materials-main-panel materials-main-panel--center">
        <div class="materials-empty materials-empty--large">
          <span class="materials-empty__icon">${icon("folder", "icon--lg")}</span>
          <h3>还没有知识库</h3>
          <p>创建资料库后，可上传尽调文件并用于 RAG 检索与项目图谱。</p>
          <button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.materialsCreateKb")}">
            ${icon("plus", "icon--sm")}<span>创建资料库</span>
          </button>
        </div>
      </div>
    `;
  }

  const docs = MATERIALS_KB_DOCS[kb.id] || [];
  const docRows = docs.map((doc) => {
    const status = DOC_STATUS_LABEL[doc.status] || doc.status;
    const statusCls = doc.status === "ready" ? "materials-doc-status--ready" : "materials-doc-status--pending";
    return resourceRow(escapeHtml, icon, jsCall, {
      title: doc.name,
      desc: doc.folder ? `分类：${doc.folder}` : "",
      metaHtml: `${escapeHtml(doc.size)} · <span class="${statusCls}">${escapeHtml(status)}</span>`,
      viewFn: `${jsCall("XinBaoDemo.toast", "演示模式：文档预览请使用 agent-demo WebUI")}`,
      downloadFn: `${jsCall("XinBaoDemo.toast", "演示模式：下载请使用 agent-demo WebUI")}`,
      deleteFn: `${jsCall("XinBaoDemo.toast", "演示模式：删除请使用 agent-demo WebUI")}`,
    });
  }).join("");

  return `
    <div class="materials-main-panel">
      <header class="materials-kb-head">
        <div>
          <h2>${escapeHtml(kb.name)}</h2>
          ${kb.description ? `<p>${escapeHtml(kb.description)}</p>` : ""}
        </div>
        <button type="button" class="btn-mini" onclick="${jsCall("XinBaoDemo.materialsTestKb", kb.id)}">
          ${icon("search", "icon--sm")}<span>检索测试</span>
        </button>
      </header>
      <div class="materials-kb-toolbar">
        <button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.toast", "演示模式：上传请使用 agent-demo WebUI")}">
          ${icon("plus", "icon--sm")}<span>上传文档</span>
        </button>
        <span class="mini-meta">支持 PDF / Word / Excel / 图片等；上传后自动向量化</span>
      </div>
      <div class="materials-main-body">
        ${docRows || `<div class="materials-empty"><p>暂无文档，点击上传开始构建知识库。</p></div>`}
      </div>
    </div>
  `;
}

function renderSavedListsPanel(escapeHtml, icon, jsCall, state) {
  const lists = getSavedLists(state);
  const rows = lists.map((list) => resourceRow(escapeHtml, icon, jsCall, {
    title: list.name,
    desc: `${list.sector} · ${list.source}`,
    meta: `保存于 ${list.savedAt} · ${list.itemCount} 条标的`,
    viewFn: `${jsCall("XinBaoDemo.openSavedListPreview", list.id)}`,
    downloadFn: `${jsCall("XinBaoDemo.toast", "已触发下载（Demo）")}`,
    deleteFn: `${jsCall("XinBaoDemo.materialsRemoveSavedList", list.id)}`,
  })).join("");

  return `
    <div class="materials-main-panel">
      <header class="materials-main-head">
        <div>
          <h2>保存的名单</h2>
          <p>从找项目、投资雷达保存的标的线索清单。</p>
        </div>
      </header>
      <div class="materials-main-body">
        ${rows || `<div class="materials-empty"><p>暂无保存的名单</p><p class="mini-meta">在找项目或雷达中保存标的名单后，会显示在这里。</p></div>`}
      </div>
    </div>
  `;
}

function renderSavedNewsPanel(escapeHtml, icon, jsCall, state) {
  const news = getSavedNews(state);
  const rows = news.map((item) => resourceRow(escapeHtml, icon, jsCall, {
    title: item.title,
    desc: item.source || "",
    meta: item.date || item.time || "",
    viewFn: item.sourceNewsId
      ? `${jsCall("XinBaoDemo.openNews", item.sourceNewsId)}`
      : `${jsCall("XinBaoDemo.openMaterial", item.id)}`,
    deleteFn: `${jsCall("XinBaoDemo.materialsRemoveSavedNews", item.id)}`,
  })).join("");

  return `
    <div class="materials-main-panel">
      <header class="materials-main-head">
        <div>
          <h2>收藏的资讯</h2>
          <p>从投资雷达收藏的资讯，便于后续回看与尽调引用。</p>
        </div>
      </header>
      <div class="materials-main-body">
        ${rows || `<div class="materials-empty"><p>暂无收藏的资讯</p><p class="mini-meta">在投资雷达资讯卡片上点击收藏，即可沉淀到这里。</p></div>`}
      </div>
    </div>
  `;
}

function renderSavedAiPanel(escapeHtml, icon, jsCall, state) {
  const outputs = aggregateAiOutputs(state);
  const kindLabel = { ai_report: "AI 报告", material: "材料", report_doc: "尽调报告" };
  const rows = outputs.map((row) => resourceRow(escapeHtml, icon, jsCall, {
    title: row.name,
    desc: row.company || row.projectName,
    meta: `${kindLabel[row.kind] || row.kind} · 更新 ${row.updatedAt}${row.shareState === "draft" ? " · 草稿" : ""}`,
    viewFn: `${jsCall("XinBaoDemo.openSavedAiPreview", row.id)}`,
    deleteFn: `${jsCall("XinBaoDemo.materialsRemoveSavedAi", row.id)}`,
  })).join("");

  return `
    <div class="materials-main-panel">
      <header class="materials-main-head">
        <div>
          <h2>AI 产出</h2>
          <p>按项目聚合的报告、纪要与草稿；深度管理请在项目文件区操作。</p>
        </div>
      </header>
      <div class="materials-main-body">
        ${rows || `<div class="materials-empty"><p>暂无 AI 产出</p><p class="mini-meta">在项目内生成报告或上传材料后，会在此跨项目索引。</p></div>`}
      </div>
    </div>
  `;
}

function renderKbRowMenu(state, escapeHtml, jsCall, kb) {
  const key = `materials-kb-${kb.id}`;
  const open = state.ui?.rowMenu?.key === key;
  return `
    <div class="materials-kb-menu-wrap" onclick="event.stopPropagation()">
      <button type="button" class="materials-kb-more" aria-label="更多"
        onclick="event.stopPropagation();${jsCall("XinBaoDemo.toggleRowMenu", key, "materialsKb", kb.id)}">⋯</button>
      ${open ? `
        <div class="row-menu-dropdown materials-kb-dropdown">
          <button type="button" class="row-menu-item" onclick="event.stopPropagation();${jsCall("XinBaoDemo.materialsKbAction", "edit", kb.id)}">编辑</button>
          <button type="button" class="row-menu-item danger" onclick="event.stopPropagation();${jsCall("XinBaoDemo.materialsKbAction", "delete", kb.id)}">删除</button>
        </div>
      ` : ""}
    </div>
  `;
}

export function renderMaterialsView(escapeHtml, icon, jsCall, state) {
  const sel = parseMaterialsSelection(state);
  const kbs = MATERIALS_KB_DEMO;
  const selectedKb = sel.kbId ? kbs.find((kb) => kb.id === sel.kbId) : null;

  const sidebarNav = `
    <aside class="materials-sidebar">
      <header class="materials-sidebar-head">
        <div class="materials-sidebar-brand">资料库</div>
        <p>可检索知识与个人沉淀</p>
      </header>
      <nav class="materials-sidebar-nav">
        <div class="materials-nav-group">
          <div class="materials-nav-label materials-nav-label--row">
            <span>知识库</span>
            <button type="button" class="materials-nav-add" title="创建资料库" aria-label="创建资料库"
              onclick="${jsCall("XinBaoDemo.materialsCreateKb")}">${icon("plus", "icon--sm")}</button>
          </div>
          ${kbs.length
    ? kbs.map((kb) => `
              <div class="materials-kb-row${sel.section === "knowledge" && sel.kbId === kb.id ? " is-active" : ""}">
                <button type="button" class="materials-nav-item materials-nav-item--kb"
                  onclick="${jsCall("XinBaoDemo.materialsSelectKb", kb.id)}">
                  <span class="materials-nav-item__label">${escapeHtml(kb.name)}</span>
                </button>
                ${renderKbRowMenu(state, escapeHtml, jsCall, kb)}
              </div>
            `).join("")
    : `<p class="materials-nav-empty">创建资料库后，可上传尽调文件并用于检索。</p>`}
        </div>
        <div class="materials-nav-group">
          <div class="materials-nav-label">我的沉淀</div>
          ${navBtn(sel.section === "saved" && sel.savedGroup === "lists", jsCall("XinBaoDemo.materialsNavigate", "saved", "lists"), icon("chart", "icon--sm"), "保存的名单")}
          ${navBtn(sel.section === "saved" && sel.savedGroup === "news", jsCall("XinBaoDemo.materialsNavigate", "saved", "news"), icon("newspaper", "icon--sm"), "收藏的资讯")}
          ${navBtn(sel.section === "saved" && sel.savedGroup === "ai", jsCall("XinBaoDemo.materialsNavigate", "saved", "ai"), icon("clipboard", "icon--sm"), "AI 产出")}
        </div>
      </nav>
      ${!kbs.length ? `
        <footer class="materials-sidebar-foot">
          <button type="button" class="btn-mini primary materials-create-kb" onclick="${jsCall("XinBaoDemo.materialsCreateKb")}">
            ${icon("plus", "icon--sm")}<span>创建资料库</span>
          </button>
        </footer>
      ` : ""}
    </aside>
  `;

  let main = "";
  if (sel.section === "knowledge") {
    main = renderKnowledgePanel(escapeHtml, icon, jsCall, state, selectedKb);
  } else if (sel.section === "saved" && sel.savedGroup === "lists") {
    main = renderSavedListsPanel(escapeHtml, icon, jsCall, state);
  } else if (sel.section === "saved" && sel.savedGroup === "news") {
    main = renderSavedNewsPanel(escapeHtml, icon, jsCall, state);
  } else if (sel.section === "saved") {
    main = renderSavedAiPanel(escapeHtml, icon, jsCall, state);
  }

  return `
    <div class="materials-page" onclick="XinBaoDemo.closeRowMenu()">
      <div class="materials-layout">
        ${sidebarNav}
        <main class="materials-main">${main}</main>
      </div>
    </div>
  `;
}
