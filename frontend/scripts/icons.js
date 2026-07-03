/**
 * 财跃启明星 · 线性图标集（规范：金融终端风格，stroke 1.5，无 emoji）
 * 版本: v1.0 · 2026-06-25
 */

const S = 'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';

const ICONS = {
  chat: `<path d="M2.5 3.5h11v6.5H6L2.5 12.5V3.5z" ${S}/>`,
  home: `<path d="M3 7.5l5-4.5 5 4.5V13.5H3z" ${S}/><path d="M6.5 13.5V9h3v4.5" ${S}/>`,
  radar: `<circle cx="8" cy="8" r="5.5" ${S}/><path d="M8 8l3.5-2M8 8V12" ${S}/><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/>`,
  users: `<circle cx="5.8" cy="5.2" r="2" ${S}/><circle cx="10.8" cy="5.8" r="1.7" ${S}/><path d="M2.2 13c0-1.8 1.5-2.8 3.3-2.8s3.3 1 3.3 2.8M8.8 12.2c.4-1.2 1.4-2 2.5-2 1.4 0 2.3 1.1 2.3 2.8" ${S}/>`,
  newspaper: `<path d="M3 3.5h10v9H3zM5.5 6h5M5.5 8.5h5M5.5 11h3" ${S}/>`,
  folder: `<path d="M2.5 4.5h4l1.5 1.5H13.5V13H2.5z" ${S}/>`,
  chart: `<path d="M3 12.5V8M6.5 12.5V5.5M10 12.5V7M13.5 12.5V4" ${S}/>`,
  sliders: `<path d="M3 5.5h10M3 10.5h10M6 4v3M10.5 9v3" ${S}/>`,
  grip: `<path d="M5.5 4h.01M5.5 8h.01M5.5 12h.01M10.5 4h.01M10.5 8h.01M10.5 12h.01" ${S}/>`,
  file: `<path d="M5 2.5h4.5L13.5 6.5V13.5H5z" ${S}/><path d="M9 2.5V6.5h4.5" ${S}/>`,
  layers: `<path d="M8 2.5L14.5 6 8 9.5 1.5 6zM1.5 10l6.5 3.5L14.5 10" ${S}/>`,
  layoutTemplate: `<rect x="3" y="2.5" width="10" height="11" rx="1.5" ${S}/><path d="M3 6h10M6.5 6v7.5" ${S}/>`,
  zap: `<path d="M9 2.5L4 9h4l-1 4.5L12 7H8z" ${S}/>`,
  finance: `<path d="M8 2.5v11M5.5 5.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-2.5 2-2.5 2 2.5.8 2.5 2-1.1 2-2.5 2" ${S}/>`,
  shield: `<path d="M8 2.5l5 2v4.5c0 3-2.2 5.2-5 6.5-2.8-1.3-5-3.5-5-6.5V4.5z" ${S}/>`,
  minus: `<path d="M4 8h8" ${S}/>`,
  link: `<path d="M6.2 9.8a2.8 2.8 0 0 0 4 0l2-2a2.8 2.8 0 1 0-4-4l-.8.8M9.8 6.2a2.8 2.8 0 0 0-4 0l-2 2a2.8 2.8 0 1 0 4 4l.8-.8" ${S}/>`,
  clipboard: `<path d="M5.5 3.5h5l1 1.5H14v8.5H4V3.5zM6 2.5h4v2H6z" ${S}/>`,
  "trending-up": `<path d="M3 12.5h10M11 6.5l2.5 2.5M11 6.5v3.5" ${S}/>`,
  target: `<circle cx="8" cy="8" r="5.5" ${S}/><circle cx="8" cy="8" r="2.5" ${S}/><circle cx="8" cy="8" r=".8" fill="currentColor" stroke="none"/>`,
  mic: `<path d="M8 2.5a2.5 2.5 0 0 1 2.5 2.5V8a2.5 2.5 0 0 1-5 0V5A2.5 2.5 0 0 1 8 2.5zM4.5 8a3.5 3.5 0 0 0 7 0M8 11.5V13.5" ${S}/>`,
  edit: `<path d="M10.5 3.5l2 2L6.5 11.5H4.5V9.5z" ${S}/>`,
  palette: `<circle cx="5.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="8" cy="4.8" r="1.2" fill="currentColor" stroke="none"/><circle cx="10.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><path d="M3 11.5c1-2 3-3 5-3s4 1 5 3" ${S}/>`,
  download: `<path d="M8 3v7M5.5 7.5L8 10l2.5-2.5M3.5 12.5h9" ${S}/>`,
  search: `<circle cx="7" cy="7" r="4" ${S}/><path d="M10 10l3 3" ${S}/>`,
  check: `<path d="M3.5 8.2l2.8 2.8 6.2-6.5" ${S}/>`,
  "alert-triangle": `<path d="M8 3.5l5.5 9H2.5zM8 7v2.2M8 11.2h.01" ${S}/>`,
  "alert-circle": `<circle cx="8" cy="8" r="5.5" ${S}/><path d="M8 5.5v3M8 11h.01" ${S}/>`,
  "help-circle": `<circle cx="8" cy="8" r="5.5" ${S}/><path d="M6.2 6.2a1.8 1.8 0 0 1 3.1 1.3c0 1.3-1.8 1.5-1.8 2.7M8 11.5h.01" ${S}/>`,
  info: `<circle cx="8" cy="8" r="5.5" ${S}/><path d="M8 7.2V11M8 5.5h.01" ${S}/>`,
  plus: `<path d="M8 4v8M4 8h8" ${S}/>`,
  send: `<path d="M14 2.5L7 9.5M14 2.5l-3 11-2-4.5L2.5 6.5z" ${S}/>`,
  stop: `<rect x="5.5" y="5.5" width="5" height="5" rx="1" fill="currentColor" stroke="none"/>`,
  attach: `<path d="M9.5 3.5l-3 3a2.5 2.5 0 0 0 3.5 3.5l3.5-3.5a3.5 3.5 0 0 0-5-5l-4 4a4.5 4.5 0 0 0 6.5 6.5l3.5-3.5" ${S}/>`,
  globe: `<circle cx="8" cy="8" r="5.5" ${S}/><path d="M2.5 8h11M8 2.5a10 10 0 0 1 0 11M8 2.5a10 10 0 0 0 0 11" ${S}/>`,
  chevronRight: `<path d="M6 4l4 4-4 4" ${S}/>`,
  chevronLeft: `<path d="M10 4l-4 4 4 4" ${S}/>`,
  chevronDown: `<path d="M4 6l4 4 4-4" ${S}/>`,
  chevronUp: `<path d="M4 10l4-4 4 4" ${S}/>`,
  x: `<path d="M5 5l6 6M11 5l-6 6" ${S}/>`,
  dot: `<circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none"/>`,
  projectSpace: `<circle cx="4.5" cy="5" r="1.5" ${S}/><circle cx="11.5" cy="5" r="1.5" ${S}/><circle cx="8" cy="11.5" r="1.5" ${S}/><path d="M5.7 6.2l1.8 4M10.3 6.2l-1.8 4" ${S}/>`,
  star: `<path d="M8 2.5l1.6 3.2 3.5.5-2.5 2.5.6 3.5L8 10.2l-3.2 1.8.6-3.5-2.5-2.5 3.5-.5z" ${S}/>`,
  sparkles: `<path d="M8 2l.6 2.2L10.8 5 8.6 5.6 8 8l-.6-2.4L5.2 5l2.2-.8zM12.5 9l.4 1.5 1.5.4-1.5.4-.4 1.5-.4-1.5-1.5-.4 1.5-.4zM4 10.5l.35 1.2 1.2.35-1.2.35L4 13.4l-.35-1.2-1.2-.35 1.2-.35z" ${S}/>`,
  route: `<circle cx="4.5" cy="11.5" r="2" ${S}/><circle cx="11.5" cy="4.5" r="2" ${S}/><path d="M6.2 10.2l3.1-3.1" ${S}/>`,
  network: `<circle cx="5" cy="5" r="2" ${S}/><circle cx="11" cy="5" r="2" ${S}/><circle cx="8" cy="11" r="2" ${S}/><path d="M6.5 6.2l1.5 3.3M9.5 6.2l-1.5 3.3M7 6.8h2" ${S}/>`,
  calculator: `<rect x="3.5" y="2.5" width="9" height="11" rx="1.5" ${S}/><path d="M5.5 5.5h5M5.5 8h2M8.5 8h2M5.5 10.5h2M8.5 10.5h2" ${S}/>`,
  share: `<circle cx="11.5" cy="4.5" r="1.5" ${S}/><circle cx="4.5" cy="8" r="1.5" ${S}/><circle cx="11.5" cy="11.5" r="1.5" ${S}/><path d="M6 7.2l4.5-2M6 8.8l4.5 2" ${S}/>`,
  library: `<path d="M3.5 3.5h4v9H3.5zM10.5 3.5h4v9h-4zM6.5 5.5v0M6.5 8v0M6.5 10.5v0" ${S}/>`,
  moreHorizontal: `<circle cx="4" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/>`,
  copy: `<rect x="5" y="5" width="6.5" height="7.5" rx="1" ${S}/><path d="M4.5 3.5h6.5v7" ${S}/>`,
  refresh: `<path d="M12.5 4.5A5.5 5.5 0 0 0 4.8 6.5M3.5 4.5v2.5h2.5M3.5 11.5a5.5 5.5 0 0 0 7.7 2M12.5 11.5V9H10" ${S}/>`
};

/** kind → 默认图标（panel-link 等） */
export const KIND_ICONS = {
  "batch-eval": "chart",
  industry: "trending-up",
  "material-gap": "clipboard",
  "risk-qna": "target",
  "interview-outline": "edit",
  "journalist-report": "newspaper",
  "expert-outline": "clipboard",
  "expert-notes": "mic",
  report: "file",
  "entry-brief": "chart"
};

/** 专家分类默认图标 */
export const CATEGORY_ICONS = {
  finance: "finance",
  risk: "shield",
  industry: "chart",
  interview: "mic",
  skill: "palette"
};

/**
 * @param {string} name 图标名
 * @param {string} [size] icon--sm | icon--md | icon--lg | icon--xl
 */
export function icon(name, size = "icon--md") {
  const body = ICONS[name];
  if (!body) return "";
  const cls = ["icon", size].filter(Boolean).join(" ");
  return `<svg class="${cls}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
}

/** 解析 icon 字段（兼容旧 emoji 或 icon 名） */
export function resolveIcon(name, fallback = "file") {
  if (!name) return icon(fallback);
  if (ICONS[name]) return icon(name);
  return icon(fallback);
}

export function panelIcon(data) {
  const key = data?.iconKey || KIND_ICONS[data?.kind] || (ICONS[data?.icon] ? data.icon : null) || "file";
  return icon(key, "icon--xl");
}

export function statusBadge(type, label) {
  const map = {
    ok: ["check", "status-ok"],
    warn: ["alert-triangle", "status-warn"],
    pending: ["dot", "status-pending"],
    supplement: ["dot", "status-supplement"],
    answered: ["dot", "status-ok"],
    risk: ["alert-triangle", "status-warn"]
  };
  const [ic, cls] = map[type] || ["info", "status-neutral"];
  const labelHtml = label ? `<span>${label}</span>` : "";
  return `<span class="status-badge ${cls}">${icon(ic, "icon--sm")}${labelHtml}</span>`;
}

export function panelHeading(ic, text) {
  return `<h4 class="panel-h panel-h-icon">${icon(ic, "icon--sm")}<span>${text}</span></h4>`;
}
