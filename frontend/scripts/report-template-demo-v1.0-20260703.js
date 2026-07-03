/**
 * 报告模板页 — 静态 Demo（对齐 agent-demo /report-templates）
 * 版本: v1.0 | 日期: 2026-07-03
 */
import {
  ORG_TEMPLATE_LIBRARY,
} from "../data/mock-data.js";

export const STANDARD_TEMPLATE_DEMO = {
  id: "tpl-standard",
  title: "标准报告结构",
  scenario: "未上传机构模板时的通用报告框架",
  builtin: true,
  sectionCount: 8,
  filename: "",
};

const GROUP_META = {
  org: {
    title: "机构模板",
    hint: "机构管理员配置并下发，全员只读复用。",
    navLabel: "机构模板",
    icon: "layers",
  },
  mine: {
    title: "我的模板",
    hint: "本地上传的 Word / Markdown 模板，可编辑、删除。",
    navLabel: "我的模板",
    icon: "file",
  },
  standard: {
    title: "平台标准",
    hint: "未配置机构模板时的通用章节框架，非贵司定制模板。",
    navLabel: "平台标准",
    icon: "sparkles",
  },
};

export function parseReportTemplateGroup(state) {
  const g = state?.featureData?.reportTemplateGroup;
  if (g === "org" || g === "mine" || g === "standard") return g;
  return "org";
}

function getMyTemplates(state) {
  return (state.userMaterials || []).filter((m) => m.type === "报告模板" && !m.orgIssued);
}

function navBtn(active, onclick, iconHtml, label) {
  return `
    <button type="button" class="materials-nav-item${active ? " is-active" : ""}" onclick="${onclick}">
      <span class="materials-nav-item__icon" aria-hidden="true">${iconHtml}</span>
      <span class="materials-nav-item__label">${label}</span>
    </button>
  `;
}

function templateRow(escapeHtml, icon, jsCall, tpl, { readonly, onDelete }) {
  const badges = [];
  if (tpl.orgIssued) badges.push('<span class="materials-badge materials-badge--org">机构</span>');
  if (tpl.builtin) badges.push('<span class="materials-badge materials-badge--std">平台标准</span>');
  const sectionCount = tpl.sectionCount || tpl.sections?.length;
  const meta = [sectionCount ? `${sectionCount} 个章节` : "", tpl.filename || ""]
    .filter(Boolean)
    .join(" · ");
  const previewFn = tpl.builtin
    ? jsCall("XinBaoDemo.toast", "平台标准模板为内置章节框架，撰写报告时可在高级配置中选择")
    : jsCall("XinBaoDemo.openMaterial", tpl.id);
  return `
    <article class="materials-resource-row">
      <div class="materials-resource-row__body">
        <strong>${escapeHtml(tpl.title)}${badges.length ? ` ${badges.join("")}` : ""}</strong>
        <p>${escapeHtml(tpl.scenario || "")}</p>
        ${meta ? `<span class="materials-resource-row__meta">${escapeHtml(meta)}</span>` : ""}
      </div>
      <div class="materials-resource-row__actions">
        <button type="button" class="materials-icon-btn" title="查看模板"
          onclick="${previewFn}">${icon("search", "icon--sm")}</button>
        ${!readonly && onDelete ? `<button type="button" class="materials-icon-btn materials-icon-btn--danger" title="删除"
          onclick="${onDelete}">${icon("x", "icon--sm")}</button>` : ""}
      </div>
    </article>
  `;
}

function renderTemplatesPanel(escapeHtml, icon, jsCall, state, group) {
  const meta = GROUP_META[group];

  let templates = [];
  if (group === "org") templates = ORG_TEMPLATE_LIBRARY;
  else if (group === "standard") templates = [STANDARD_TEMPLATE_DEMO];
  else templates = getMyTemplates(state);

  const uploadBtn =
    group === "mine"
      ? `<button type="button" class="btn-mini primary" onclick="${jsCall("XinBaoDemo.uploadTemplate")}">${icon("plus", "icon--sm")}<span>上传模板</span></button>`
      : "";

  const body = templates.length
    ? templates
        .map((tpl) =>
          templateRow(escapeHtml, icon, jsCall, tpl, {
            readonly: tpl.orgIssued || tpl.builtin || tpl.readonly,
            onDelete:
              !tpl.orgIssued && !tpl.builtin ? jsCall("XinBaoDemo.deleteMaterial", tpl.id) : null,
          }),
        )
        .join("")
    : `<div class="materials-empty"><p>${group === "org" ? "暂无机构下发模板。" : "还没有报告模板。"}</p><p class="mini-meta">${group === "mine" ? "上传 Word / Markdown 模板并填写使用场景。" : ""}</p></div>`;

  return `
    <div class="materials-main-panel">
      <header class="materials-main-head">
        <div>
          <h2>${escapeHtml(meta.title)}</h2>
          <p>${escapeHtml(meta.hint)}</p>
        </div>
        ${uploadBtn}
      </header>
      <div class="materials-main-body">${body}</div>
    </div>
  `;
}

export function renderReportTemplatesView(escapeHtml, icon, jsCall, state) {
  const group = parseReportTemplateGroup(state);

  const sidebarNav = `
    <aside class="materials-sidebar">
      <header class="materials-sidebar-head">
        <div class="materials-sidebar-brand">报告模板</div>
        <p>机构规范、个人上传与平台标准章节框架</p>
      </header>
      <nav class="materials-sidebar-nav">
        <div class="materials-nav-group">
          <div class="materials-nav-label">模板分组</div>
          ${Object.entries(GROUP_META)
            .map(([key, meta]) =>
              navBtn(
                group === key,
                jsCall("XinBaoDemo.reportTemplateNavigate", key),
                icon(meta.icon, "icon--sm"),
                meta.navLabel,
              ),
            )
            .join("")}
        </div>
      </nav>
    </aside>
  `;

  return `
    <div class="materials-layout report-templates-layout">
      ${sidebarNav}
      <div class="materials-main">${renderTemplatesPanel(escapeHtml, icon, jsCall, state, group)}</div>
    </div>
  `;
}
