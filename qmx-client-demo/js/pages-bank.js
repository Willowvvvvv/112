/**
 * 银行版 AML / CDD / 受益所有人 — 页面渲染
 * 全局：window.BankPages = { render(route, ctx) }
 * ctx: { rootEl, navigate, state, setState, toast, mode }
 */
(function () {
  'use strict';

  function data() {
    return window.BANK_DATA || { cases: [], homeTodos: [], stockProgress: {}, packMeta: {} };
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getCase(id) {
    return (data().cases || []).find(function (c) {
      return c.id === id;
    });
  }

  function ensureStyles(root) {
    if (document.getElementById('bank-pages-css')) return;
    var style = document.createElement('style');
    style.id = 'bank-pages-css';
    style.textContent =
      '.bk-page{padding:0 0 32px;min-height:100%}' +
      '.bk-toolbar{display:flex;align-items:center;gap:12px;padding:16px 24px 12px;flex-wrap:wrap}' +
      '.bk-toolbar h1{margin:0;font-size:18px;font-weight:600;color:var(--xb-brand,#0d2e4b);font-family:var(--xb-font-brand,inherit)}' +
      '.bk-toolbar .spacer{flex:1}' +
      '.bk-body{padding:0 24px 24px}' +
      '.bk-lead{font-size:12px;color:var(--xb-muted,#536075);margin:4px 0 0}' +
      '.bk-crumb{font-size:12px;color:var(--xb-faint,#8992a3);margin-bottom:6px}' +
      '.bk-crumb a{color:var(--xb-brand,#0d2e4b);cursor:pointer}' +
      '.bk-panel{border:1px solid var(--xb-line,#e8ecf0);border-radius:var(--xb-radius-md,6px);background:var(--xb-surface,#fff);padding:14px 16px;margin-bottom:12px}' +
      '.bk-panel h3{margin:0 0 12px;font-size:13px;font-weight:600}' +
      '.bk-grid{display:grid;gap:12px}' +
      '.bk-grid-2{grid-template-columns:1fr 1fr}' +
      '.bk-grid-3{grid-template-columns:repeat(3,1fr)}' +
      '@media(max-width:900px){.bk-grid-2,.bk-grid-3{grid-template-columns:1fr}}' +
      '.bk-tag{display:inline-flex;align-items:center;padding:2px 7px;border-radius:3px;font-size:11px;font-weight:500;background:var(--xb-bg-soft,#f5f7fa);color:var(--xb-muted,#536075)}' +
      '.bk-tag.dd{background:var(--xb-color-primary-muted,#e8eef3);color:var(--xb-brand,#0d2e4b)}' +
      '.bk-tag.warn{background:#fff7ed;color:#b45309}' +
      '.bk-tag.ok{background:#f0fdf4;color:#15803d}' +
      '.bk-tag.danger{background:#fef2f2;color:#b91c1c}' +
      '.bk-tag.std1{background:#e8eef3;color:#0d2e4b}' +
      '.bk-tag.std2{background:#f4f4f5;color:#52525b}' +
      '.bk-tag.std3{background:#fff7ed;color:#b45309}' +
      '.bk-tag.std0{background:#f0fdf4;color:#15803d}' +
      '.bk-btn{height:34px;padding:0 12px;border:1px solid var(--xb-line,#e8ecf0);border-radius:3px;background:#fff;color:var(--xb-muted,#536075);cursor:pointer;font-size:12px}' +
      '.bk-btn:hover{border-color:var(--xb-brand,#0d2e4b);color:var(--xb-brand,#0d2e4b)}' +
      '.bk-btn-primary{background:var(--xb-brand,#0d2e4b);color:#fff;border-color:transparent;font-weight:600}' +
      '.bk-btn-primary:hover{background:#123a5c;color:#fff}' +
      '.bk-btn.active{border-color:var(--xb-brand,#0d2e4b);color:var(--xb-brand,#0d2e4b);background:var(--xb-color-primary-muted,#e8eef3)}' +
      '.bk-btn:disabled{opacity:.5;cursor:not-allowed}' +
      '.bk-table-wrap{border:1px solid var(--xb-line,#e8ecf0);border-radius:6px;overflow:auto;background:#fff}' +
      '.bk-table{width:100%;border-collapse:collapse;font-size:13px}' +
      '.bk-table th{text-align:left;padding:10px 12px;font-size:12px;font-weight:600;color:var(--xb-muted,#536075);background:var(--xb-bg-soft,#f5f7fa);border-bottom:1px solid var(--xb-line,#e8ecf0);white-space:nowrap}' +
      '.bk-table td{padding:10px 12px;border-bottom:1px solid #f0f2f5;vertical-align:top}' +
      '.bk-table tr:last-child td{border-bottom:0}' +
      '.bk-table tbody tr{cursor:pointer}' +
      '.bk-table tbody tr:hover td{background:var(--xb-bg-soft,#f5f7fa)}' +
      '.bk-table tr.dim td{opacity:.45}' +
      '.bk-table tr.hi td{background:#fff7ed}' +
      '.bk-link{color:var(--xb-brand,#0d2e4b);font-weight:550;cursor:pointer}' +
      '.bk-todo{display:grid;grid-template-columns:1fr auto;gap:8px 16px;padding:12px 14px;border:1px solid var(--xb-line,#e8ecf0);border-radius:6px;background:#fff;text-align:left;width:100%;margin-bottom:8px;cursor:pointer}' +
      '.bk-todo:hover{border-color:color-mix(in srgb,var(--xb-brand,#0d2e4b) 35%,var(--xb-line,#e8ecf0));box-shadow:0 1px 2px rgba(13,46,75,.06)}' +
      '.bk-todo .t{font-size:13px;font-weight:550}' +
      '.bk-todo .d{margin-top:4px;font-size:12px;color:var(--xb-muted,#536075);line-height:1.45}' +
      '.bk-todo .cta{font-size:12px;font-weight:600;color:var(--xb-brand,#0d2e4b);white-space:nowrap;padding-top:2px}' +
      '.bk-steps{display:flex;gap:0;margin:12px 0 16px;flex-wrap:wrap}' +
      '.bk-step{flex:1;min-width:100px;padding:10px 12px;border:1px solid var(--xb-line,#e8ecf0);background:var(--xb-bg-soft,#f5f7fa);font-size:12px;text-align:center;color:var(--xb-muted,#536075)}' +
      '.bk-step:first-child{border-radius:6px 0 0 6px}' +
      '.bk-step:last-child{border-radius:0 6px 6px 0}' +
      '.bk-step.done{background:var(--xb-color-primary-muted,#e8eef3);color:var(--xb-brand,#0d2e4b);font-weight:600}' +
      '.bk-step.cur{background:var(--xb-brand,#0d2e4b);color:#fff;font-weight:600;border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-subnav{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}' +
      '.bk-subnav button{height:30px;padding:0 10px;border-radius:3px;border:1px solid var(--xb-line,#e8ecf0);background:#fff;font-size:12px;color:var(--xb-muted,#536075);cursor:pointer}' +
      '.bk-subnav button.active,.bk-subnav button:hover{border-color:var(--xb-brand,#0d2e4b);color:var(--xb-brand,#0d2e4b)}' +
      '.bk-kv{display:grid;grid-template-columns:120px 1fr;gap:8px 12px;font-size:13px}' +
      '.bk-kv .k{color:var(--xb-muted,#536075)}' +
      '.bk-tree ul{list-style:none;margin:0;padding-left:18px;border-left:2px solid var(--xb-line,#e8ecf0)}' +
      '.bk-tree li{margin:8px 0;font-size:13px}' +
      '.bk-tree .node{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--xb-line,#e8ecf0);border-radius:4px;background:#fff}' +
      '.bk-tree .root .node{background:var(--xb-color-primary-muted,#e8eef3);border-color:var(--xb-brand,#0d2e4b);font-weight:600}' +
      '.bk-compare{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
      '@media(max-width:800px){.bk-compare{grid-template-columns:1fr}}' +
      '.bk-countdown{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:4px;background:#fff7ed;color:#b45309;font-size:12px;font-weight:600}' +
      '.bk-countdown.ok{background:#f0fdf4;color:#15803d}' +
      '.bk-mat{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f0f2f5;font-size:13px}' +
      '.bk-mat:last-child{border-bottom:0}' +
      '.bk-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}' +
      '.bk-ta{width:100%;min-height:160px;border:1px solid var(--xb-line,#e8ecf0);border-radius:4px;padding:10px;font:inherit;line-height:1.55;resize:vertical}' +
      '.bk-ta:focus{outline:none;border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-search{height:34px;min-width:200px;padding:0 12px;border:1px solid var(--xb-line,#e8ecf0);border-radius:3px;outline:none}' +
      '.bk-search:focus{border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-stat{padding:14px;border:1px solid var(--xb-line,#e8ecf0);border-radius:6px;background:#fff}' +
      '.bk-stat .n{font-size:22px;font-weight:700;color:var(--xb-brand,#0d2e4b)}' +
      '.bk-stat .l{font-size:12px;color:var(--xb-muted,#536075);margin-top:4px}' +
      '.bk-bar{height:8px;background:#eef1f4;border-radius:99px;overflow:hidden;margin-top:8px}' +
      '.bk-bar>i{display:block;height:100%;background:var(--xb-brand,#0d2e4b)}' +
      '.bk-ocr{display:grid;grid-template-columns:1fr 1.1fr 0.9fr;gap:10px;min-height:420px}' +
      '@media(max-width:1000px){.bk-ocr{grid-template-columns:1fr}}' +
      '.bk-ocr-col{border:1px solid var(--xb-line,#e8ecf0);border-radius:6px;background:#fff;display:flex;flex-direction:column;min-height:0}' +
      '.bk-ocr-hd{padding:10px 12px;border-bottom:1px solid var(--xb-line,#e8ecf0);font-size:12px;font-weight:600;background:var(--xb-bg-soft,#f5f7fa)}' +
      '.bk-ocr-bd{padding:12px;flex:1;overflow:auto;font-size:12px;line-height:1.5}' +
      '.bk-preview-fake{height:280px;background:repeating-linear-gradient(0deg,#f8fafc,#f8fafc 28px,#eef2f6 28px,#eef2f6 29px);border:1px dashed var(--xb-line,#e8ecf0);border-radius:4px;display:grid;place-items:center;color:var(--xb-faint,#8992a3)}' +
      '.bk-field{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #f0f2f5}' +
      '.bk-field input{width:110px;height:28px;border:1px solid var(--xb-line,#e8ecf0);border-radius:3px;padding:0 6px;text-align:right}' +
      '.bk-success{text-align:center;padding:48px 24px}' +
      '.bk-success .big{font-size:40px;margin-bottom:12px}' +
      '.bk-muted{color:var(--xb-muted,#536075);font-size:12px}' +
      '.bk-pre{white-space:pre-wrap;font-size:13px;line-height:1.6;color:var(--xb-text,#152033)}' +
      '.bk-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}' +
      '.bk-card{border:1px solid var(--xb-line,#e8ecf0);border-radius:6px;padding:16px;text-align:left;background:#fff;cursor:pointer}' +
      '.bk-card:hover{border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-card strong{display:block;font-size:14px;margin-bottom:6px;color:var(--xb-brand,#0d2e4b)}' +
      '.bk-card span{font-size:12px;color:var(--xb-muted,#536075);line-height:1.45}' +
      '.bk-row-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
      '.bk-pill-toggle{display:inline-flex;border:1px solid var(--xb-line,#e8ecf0);border-radius:99px;overflow:hidden}' +
      '.bk-pill-toggle button{height:30px;padding:0 14px;border:0;background:#fff;font-size:12px;cursor:pointer;color:var(--xb-muted,#536075)}' +
      '.bk-pill-toggle button.on{background:var(--xb-brand,#0d2e4b);color:#fff}' +
      '.bk-tpl-palette-item{display:flex;align-items:center;justify-content:space-between;padding:8px 6px;border-bottom:1px solid #f0f2f5;font-size:12px}' +
      '.bk-tpl-canvas-item{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--xb-line,#e8ecf0);border-radius:6px;margin-bottom:6px;background:#fff;cursor:pointer}' +
      '.bk-tpl-canvas-item:hover{border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-tpl-canvas-item.selected{border-color:var(--xb-brand,#0d2e4b);background:#eef2f7}' +
      '.bk-tpl-ch-num{width:24px;height:24px;border-radius:50%;background:var(--xb-brand,#0d2e4b);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0}' +
      '.bk-tpl-ch-name{flex:1;font-size:13px;font-weight:500}' +
      '.bk-page-heading{font-size:16px;font-weight:600;color:var(--xb-text,#152033);padding:16px 20px 0;flex-shrink:0}' +
      '.bk-page-card{margin:12px 16px 16px;background:#fff;border-radius:4px;border:1px solid var(--xb-line,#e8ecf0);flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0}' +
      '.bk-filter-bar{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#fff;border-bottom:1px solid var(--xb-line,#e8ecf0);flex-wrap:wrap;flex-shrink:0}' +
      '.bk-content-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:auto}' +
      '.bk-pagination-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--xb-line,#e8ecf0);font-size:12px;color:var(--xb-muted,#536075);flex-shrink:0}' +
      '.bk-tab-bar{display:flex;align-items:center;border-bottom:1px solid var(--xb-line,#e8ecf0);background:#fff;padding:0 20px;height:48px;flex-shrink:0}' +
      '.bk-dt{width:100%;border-collapse:collapse;font-size:12px}' +
      '.bk-dt th{background:#f8fafc;color:#475569;font-weight:600;padding:8px 10px;border-bottom:2px solid #e2e8f0;white-space:nowrap;font-size:11px;position:sticky;top:0;z-index:5;text-align:right}' +
      '.bk-dt th.l{text-align:left}.bk-dt th.c{text-align:center}' +
      '.bk-dt td{padding:6px 10px;border-bottom:1px solid #f1f5f9;color:#334155;vertical-align:middle;text-align:right}' +
      '.bk-dt td.l{text-align:left}.bk-dt td.c{text-align:center}' +
      '.bk-dt tbody tr:hover>td{background:rgba(248,250,252,0.8)}' +
      '.bk-dt tbody tr{cursor:pointer}' +
      '.bk-badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:600}' +
      '.bk-badge-built{background:#dbeafe;color:#1e40af}' +
      '.bk-badge-ok{background:#dcfce7;color:#166534}' +
      '.bk-badge-draft{background:#f1f5f9;color:#475569}' +
      '.bk-tpl-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;transition:all 0.15s;cursor:pointer}' +
      '.bk-tpl-card:hover{border-color:#93c5fd;box-shadow:0 2px 12px rgba(59,130,246,0.1)}' +
      '.bk-cte-topbar{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid #e4e7ed;background:#fff;flex-wrap:wrap;flex-shrink:0}' +
      '.bk-cte-top-title{font-size:15px;font-weight:700;color:#1e293b}' +
      '.bk-cte-status{font-size:12px;color:#1a66ff;background:#eff6ff;padding:2px 8px;border-radius:10px}' +
      '.bk-cte-status-draft{font-size:12px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:10px}' +
      '.bk-cte-top-actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
      '.bk-cte-panel{flex:1;min-height:0;display:flex;background:#f5f7fa;overflow:hidden}' +
      '.bk-cte-col{display:flex;flex-direction:column;border-right:1px solid #e4e7ed;background:#fff;min-width:0}' +
      '.bk-cte-col-palette{width:260px;flex-shrink:0}' +
      '.bk-cte-col-canvas{flex:1.6;min-width:360px;background:#eef1f6;border-right:1px solid #e4e7ed}' +
      '.bk-cte-col-right{width:360px;flex-shrink:0;flex:0 0 360px}' +
      '.bk-cte-col-head{padding:10px 12px;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid #e4e7ed;background:#fafbfc;flex-shrink:0}' +
      '.bk-cte-canvas-head{display:flex;align-items:center;justify-content:space-between;gap:8px}' +
      '.bk-cte-canvas-hint{font-size:11px;font-weight:400;color:#94a3b8}' +
      '.bk-cte-scroll{flex:1;overflow:auto;padding:8px}' +
      '.bk-cte-canvas-scroll{flex:1;overflow:auto;padding:16px 20px 32px}' +
      '.bk-cte-canvas-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;box-shadow:0 1px 2px rgba(15,23,42,.04);cursor:pointer;overflow:hidden}' +
      '.bk-cte-canvas-card:hover{border-color:#93c5fd}' +
      '.bk-cte-canvas-card.selected{border-color:#1a66ff;box-shadow:0 0 0 2px rgba(26,102,255,.15)}' +
      '.bk-cte-canvas-card-hd{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-bottom:1px solid #f1f5f9}' +
      '.bk-cte-canvas-ord{flex-shrink:0;width:28px;height:28px;border-radius:6px;background:#f1f5f9;color:#64748b;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}' +
      '.bk-cte-canvas-card.selected .bk-cte-canvas-ord{background:#eff6ff;color:#1a66ff}' +
      '.bk-cte-canvas-card-title{font-size:14px;font-weight:700;color:#0f172a;line-height:1.3}' +
      '.bk-cte-canvas-card-meta{font-size:11px;color:#94a3b8;margin-top:4px}' +
      '.bk-cte-canvas-card-acts{margin-left:auto;display:flex;gap:4px;opacity:.7;flex-shrink:0}' +
      '.bk-cte-canvas-card-acts button{border:0;background:transparent;color:#64748b;cursor:pointer;padding:4px 6px;border-radius:4px;font-size:12px}' +
      '.bk-cte-canvas-card-acts button:hover{background:#f1f5f9;color:#1a66ff}' +
      '.bk-cte-empty{padding:32px;text-align:center;color:#94a3b8;font-size:13px}' +
      '.bk-btn-default{padding:6px 14px;font-size:12px;background:#fff;color:var(--xb-text,#152033);border:1px solid var(--xb-line,#e8ecf0);border-radius:4px;cursor:pointer}' +
      '.bk-btn-default:hover{background:#f8fafc}' +
      /* palette tabs */
      '.bk-cte-ptabs{display:flex;border-bottom:1px solid #e4e7ed;background:#fafbfc;flex-shrink:0}' +
      '.bk-cte-ptab{flex:1;padding:8px 4px;text-align:center;font-size:12px;cursor:pointer;color:#64748b;border-bottom:2px solid transparent;user-select:none}' +
      '.bk-cte-ptab.active{color:#1a66ff;border-bottom-color:#1a66ff;font-weight:600}' +
      '.bk-cte-ptab:hover:not(.active){color:#334155;background:#f1f5f9}' +
      /* structure tree */
      '.bk-cte-tree-list{padding:4px 0}' +
      '.bk-cte-tree-row{padding-left:4px}' +
      '.bk-cte-tree-item{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:4px;cursor:pointer;font-size:12px;color:#334155}' +
      '.bk-cte-tree-item:hover{background:#f1f5f9}' +
      '.bk-cte-tree-item.active{background:#eff6ff;color:#1a66ff}' +
      '.bk-cte-tree-l1{font-weight:600}' +
      '.bk-cte-tree-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.bk-cte-tree-acts{display:flex;gap:2px;opacity:0;flex-shrink:0;transition:opacity .1s}' +
      '.bk-cte-tree-item:hover .bk-cte-tree-acts,.bk-cte-tree-item.active .bk-cte-tree-acts{opacity:1}' +
      '.bk-cte-tree-act{border:0;background:transparent;color:#94a3b8;cursor:pointer;padding:2px 5px;border-radius:3px;font-size:11px;line-height:1}' +
      '.bk-cte-tree-act:hover{background:#e2e8f0;color:#334155}' +
      '.bk-cte-tree-add-root{padding:7px 12px;font-size:11px;color:#94a3b8;cursor:pointer;border-top:1px solid #f1f5f9;text-align:center}' +
      '.bk-cte-tree-add-root:hover{color:#1a66ff;background:#f8fafc}' +
      /* content module palette */
      '.bk-cte-palette-group-title{font-size:10px;font-weight:700;color:#94a3b8;padding:6px 8px 3px;letter-spacing:.04em;text-transform:uppercase}' +
      '.bk-cte-palette-item{padding:7px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;color:#334155;margin-bottom:4px;cursor:pointer;background:#fff;user-select:none}' +
      '.bk-cte-palette-item:hover{border-color:#93c5fd;background:#f0f9ff;color:#1a66ff}' +
      '.bk-cte-hint{font-size:11px;color:#94a3b8;padding:4px 10px 6px;line-height:1.5;margin:0}' +
      /* canvas blocks inside section */
      '.bk-cte-blocks{padding:8px 12px 12px;border-top:1px solid #f1f5f9;background:#f8fafc}' +
      '.bk-cte-block{background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;margin-bottom:4px;cursor:pointer;position:relative;padding-right:72px}' +
      '.bk-cte-block:hover{border-color:#93c5fd}' +
      '.bk-cte-block.selected{border-color:#1a66ff;box-shadow:0 0 0 2px rgba(26,102,255,.12)}' +
      '.bk-cte-block-heading{background:transparent;border:0;border-bottom:1px dashed #e2e8f0;border-radius:0;padding:5px 10px;padding-right:72px}' +
      '.bk-cte-block-badge{display:inline-flex;align-items:center;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600}' +
      '.bk-cte-block-badge.ai{background:#eff6ff;color:#1d4ed8}' +
      '.bk-cte-block-badge.human{background:#f1f5f9;color:#475569}' +
      '.bk-cte-block-badge.sys{background:#f0fdf4;color:#166534}' +
      '.bk-cte-block-label{font-size:11px;color:#64748b}' +
      '.bk-cte-block-brief{font-size:11px;color:#94a3b8;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}' +
      '.bk-cte-block-acts{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;gap:2px;opacity:0;transition:opacity .1s}' +
      '.bk-cte-block:hover .bk-cte-block-acts,.bk-cte-block.selected .bk-cte-block-acts{opacity:1}' +
      '.bk-cte-block-acts button{border:0;background:transparent;color:#94a3b8;cursor:pointer;padding:3px 5px;border-radius:3px;font-size:11px;line-height:1}' +
      '.bk-cte-block-acts button:hover{background:#f1f5f9;color:#334155}' +
      '.bk-cte-insert-slot{padding:3px 8px;color:#c0d0e8;font-size:11px;text-align:center;cursor:pointer;border:1px dashed #dce4f0;border-radius:4px;margin:4px 0;background:transparent}' +
      '.bk-cte-insert-slot:hover{border-color:#93c5fd;color:#1a66ff;background:#f0f9ff}' +
      /* right panel */
      '.bk-cte-owner-banner{padding:7px 12px;background:#f8fafc;border-bottom:1px solid #e4e7ed;font-size:11px;color:#64748b}' +
      '.bk-cte-panel-title{padding:10px 12px;font-size:13px;font-weight:700;color:#1e293b;border-bottom:1px solid #f1f5f9}' +
      '.bk-cte-form{display:flex;flex-direction:column;gap:10px;padding:12px}' +
      '.bk-cte-right-section-title{font-size:10px;font-weight:700;color:#64748b;letter-spacing:.05em;text-transform:uppercase;margin-top:2px}' +
      '.bk-cte-gen-method-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px}' +
      '.bk-cte-gen-method-opt{display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:12px;color:#334155;user-select:none}' +
      '.bk-cte-gen-method-opt.active{border-color:#3b82f6;background:#eff6ff;color:#1d4ed8}' +
      '.bk-cte-field-hint{font-size:11px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;padding:6px 8px;border-radius:4px;margin-top:2px}';
    document.head.appendChild(style);
  }

  function riskTag(level) {
    var cls = level === '高' ? 'danger' : level === '中' ? 'warn' : 'ok';
    return '<span class="bk-tag ' + cls + '">风险 ' + esc(level) + '</span>';
  }

  function statusTag(st) {
    var cls = st === '已出报告' ? 'ok' : st === '待补件' || st === '待复核' ? 'warn' : 'dd';
    return '<span class="bk-tag ' + cls + '">' + esc(st) + '</span>';
  }

  function stdTag(std) {
    var map = { 标准一: 'std1', 标准二: 'std2', 标准三: 'std3', 日常经营: 'std0' };
    return '<span class="bk-tag ' + (map[std] || '') + '">' + esc(std) + '</span>';
  }

  function caseSubnav(c, active, navigate) {
    var items = [
      ['概览', 'case/' + c.id],
      ['主体核验', 'case/' + c.id + '/verify'],
      ['受益所有人', 'case/' + c.id + '/ubo'],
      ['穿透结构', 'case/' + c.id + '/penetrate'],
      ['佐证材料', 'case/' + c.id + '/evidence'],
      ['BOMIS', 'case/' + c.id + '/bomis'],
      ['差异报告', 'case/' + c.id + '/diff'],
      ['风险评级', 'case/' + c.id + '/risk'],
      ['调查意见', 'case/' + c.id + '/opinion'],
      ['持续监控', 'case/' + c.id + '/monitor']
    ];
    return (
      '<div class="bk-subnav">' +
      items
        .map(function (it) {
          return (
            '<button type="button" class="' +
            (active === it[0] ? 'active' : '') +
            '" data-nav="' +
            esc(it[1]) +
            '">' +
            esc(it[0]) +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function bindNav(root, navigate) {
    root.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(el.getAttribute('data-nav'));
      });
    });
  }

  function stepsHtml(progress) {
    var labels = ['识别', '核实', '核验', '报告'];
    return (
      '<div class="bk-steps">' +
      labels
        .map(function (lab, i) {
          var cls = i < progress ? 'done' : i === progress ? 'cur' : '';
          return '<div class="bk-step ' + cls + '">' + (i + 1) + '. ' + lab + '</div>';
        })
        .join('') +
      '</div>'
    );
  }

  function caseHeader(c, crumbExtra, navigateLabel) {
    return (
      '<div class="bk-toolbar" style="align-items:flex-start">' +
      '<div style="flex:1;min-width:0">' +
      '<div class="bk-crumb"><a data-nav="cases">案件库</a> / <a data-nav="case/' +
      esc(c.id) +
      '">' +
      esc(c.name) +
      '</a>' +
      (crumbExtra ? ' / ' + esc(crumbExtra) : '') +
      '</div>' +
      '<h1>' +
      esc(c.company) +
      '</h1>' +
      '<p class="bk-lead">' +
      esc(c.purpose) +
      ' · ' +
      esc(c.owner) +
      ' · ' +
      statusTag(c.status) +
      ' · ' +
      riskTag(c.riskLevel) +
      ' · ' +
      esc(c.creditCode) +
      '</p>' +
      '</div>' +
      '<button type="button" class="bk-btn" data-nav="cases">返回案件库</button>' +
      '</div>'
    );
  }

  /* —— Home —— */
  function renderHome(ctx) {
    var todos = data().homeTodos || [];
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      '<div class="bk-toolbar"><h1>客户调查工作台</h1><div class="spacer"></div>' +
      '<span class="bk-muted">待办 ' +
      todos.length +
      ' 条 · 银行模式</span></div>' +
      '<div class="bk-body" style="max-width:720px;margin:0 auto">' +
      '<p class="bk-muted" style="margin:0 0 14px">补件 / BOMIS / 差异临期 / 持续尽职 / 存量攻坚 — 点一条进入对应案件或 Pack</p>' +
      '<div id="bkTodoList">' +
      todos
        .map(function (t) {
          return (
            '<button type="button" class="bk-todo" data-nav="' +
            esc(t.route) +
            '"><div><div class="t">' +
            esc(t.title) +
            '</div><div class="d">' +
            esc(t.desc) +
            '</div><div style="margin-top:6px"><span class="bk-tag ' +
            esc(t.tagClass || '') +
            '">' +
            esc(t.tag) +
            '</span></div></div><span class="cta">' +
            esc(t.cta) +
            ' →</span></button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="bk-row-actions" style="margin-top:16px">' +
      '<button type="button" class="bk-btn-primary bk-btn" data-nav="cases">打开案件库</button>' +
      '<button type="button" class="bk-btn" data-nav="stock">存量攻坚看板</button>' +
      '<button type="button" class="bk-btn" data-nav="pack">授信 Pack</button>' +
      '</div></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Cases —— */
  function renderCases(ctx) {
    var q = (ctx.state.bankCaseQ || '').trim();
    var rows = data().cases || [];
    if (q) {
      rows = rows.filter(function (c) {
        return (c.company + c.name + c.purpose + c.owner).indexOf(q) >= 0;
      });
    }
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      '<div class="bk-toolbar"><h1>案件库</h1><div class="spacer"></div>' +
      '<input class="bk-search" id="bkCaseSearch" placeholder="搜索客户 / 目的 / 经办…" value="' +
      esc(q) +
      '" />' +
      '<button type="button" class="bk-btn" data-nav="home">首页待办</button></div>' +
      '<div class="bk-body"><div class="bk-table-wrap"><table class="bk-table"><thead><tr>' +
      '<th>客户 / 案件</th><th>目的</th><th>经办</th><th>状态</th><th>风险</th><th>BOMIS</th><th>更新</th>' +
      '</tr></thead><tbody id="bkCaseBody"></tbody></table></div></div></div>';
    var body = ctx.rootEl.querySelector('#bkCaseBody');
    body.innerHTML = rows
      .map(function (c) {
        var bomis = (c.bomis && c.bomis.result) || '—';
        var bcls = bomis === '一致' ? 'ok' : bomis === '不一致' || bomis === '未备案' ? 'danger' : '';
        return (
          '<tr data-nav="case/' +
          esc(c.id) +
          '"><td><span class="bk-link">' +
          esc(c.company) +
          '</span><div class="bk-muted" style="margin-top:2px">' +
          esc(c.name) +
          '</div></td><td>' +
          esc(c.purpose) +
          '</td><td>' +
          esc(c.owner) +
          '</td><td>' +
          statusTag(c.status) +
          '</td><td>' +
          riskTag(c.riskLevel) +
          '</td><td><span class="bk-tag ' +
          bcls +
          '">' +
          esc(bomis) +
          '</span></td><td class="bk-muted">' +
          esc(c.updated) +
          '</td></tr>'
        );
      })
      .join('');
    ctx.rootEl.querySelector('#bkCaseSearch').addEventListener('input', function (e) {
      ctx.setState({ bankCaseQ: e.target.value });
      renderCases(ctx);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Case overview —— */
  function renderCaseOverview(ctx, c) {
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c) +
      '<div class="bk-body">' +
      caseSubnav(c, '概览') +
      stepsHtml(c.progress) +
      '<div class="bk-grid bk-grid-2">' +
      '<div class="bk-panel"><h3>客户摘要</h3><div class="bk-kv">' +
      '<div class="k">统一社会信用代码</div><div>' +
      esc(c.creditCode) +
      '</div>' +
      '<div class="k">业务目的</div><div>' +
      esc(c.purpose) +
      '</div>' +
      '<div class="k">客户经理 / 经办</div><div>' +
      esc(c.owner) +
      '</div>' +
      '<div class="k">控制关系</div><div>' +
      esc(c.controlSummary) +
      '</div></div>' +
      '<div class="bk-row-actions" style="margin-top:12px">' +
      '<button type="button" class="bk-btn-primary bk-btn" data-nav="case/' +
      esc(c.id) +
      '/verify">继续主体核验</button>' +
      '<button type="button" class="bk-btn" data-nav="case/' +
      esc(c.id) +
      '/ubo">受益所有人</button>' +
      '<button type="button" class="bk-btn" data-nav="case/' +
      esc(c.id) +
      '/bomis">BOMIS 核验</button>' +
      '<button type="button" class="bk-btn" data-ask-ai="1">问 AI · 主体核验</button>' +
      '</div></div>' +
      '<div class="bk-panel"><h3>待补件 / 待办</h3>' +
      (c.pendingDocs || [])
        .map(function (p) {
          return (
            '<div class="bk-mat"><div><div>' +
            esc(p.title) +
            '</div><div class="bk-muted">' +
            esc(p.owner) +
            ' · 截止 ' +
            esc(p.due) +
            '</div></div><span class="bk-tag warn">' +
            esc(p.tag) +
            '</span></div>'
          );
        })
        .join('') +
      '</div></div>' +
      '<div class="bk-panel"><h3>材料一览</h3>' +
      (c.materials || [])
        .slice(0, 6)
        .map(function (m) {
          var ok = m.status === '已收' || m.status === '已生成';
          return (
            '<div class="bk-mat"><span>' +
            esc(m.name) +
            ' <span class="bk-muted">' +
            esc(m.source) +
            '</span></span><span class="bk-tag ' +
            (ok ? 'ok' : 'warn') +
            '">' +
            esc(m.status) +
            '</span></div>'
          );
        })
        .join('') +
      '<div class="bk-row-actions" style="margin-top:10px"><button type="button" class="bk-btn" data-nav="case/' +
      esc(c.id) +
      '/evidence">全部佐证材料</button>' +
      '<button type="button" class="bk-btn" data-nav="pack">打开授信 Pack</button></div></div>' +
      '</div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
    var ai = ctx.rootEl.querySelector('[data-ask-ai]');
    if (ai) {
      ai.addEventListener('click', function () {
        ctx.toast('已填入问 AI：请对「' + c.company + '」做主体核验、股权与控制、司法风险扫描（客观陈述，不替审批做结论）');
      });
    }
  }

  /* —— Verify —— */
  function renderVerify(ctx, c) {
    var v = c.verify || {};
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '主体核验') +
      '<div class="bk-body">' +
      caseSubnav(c, '主体核验') +
      '<div class="bk-panel"><h3>身份核验结果</h3>' +
      '<div class="bk-chips">' +
      '<span class="bk-tag ' +
      (v.nameMatch ? 'ok' : 'danger') +
      '">名称一致 ' +
      (v.nameMatch ? '✓' : '×') +
      '</span>' +
      '<span class="bk-tag ' +
      (v.codeMatch ? 'ok' : 'danger') +
      '">信用代码一致 ' +
      (v.codeMatch ? '✓' : '×') +
      '</span>' +
      '<span class="bk-tag dd">' +
      esc(v.status) +
      '</span></div>' +
      '<div class="bk-kv" style="margin-top:12px">' +
      [
        ['法定代表人', v.legalPerson],
        ['注册资本', v.regCapital],
        ['成立日期', v.establishDate],
        ['住所', v.address],
        ['行业', v.industry],
        ['经营范围', v.businessScope]
      ]
        .map(function (row) {
          return '<div class="k">' + esc(row[0]) + '</div><div>' + esc(row[1]) + '</div>';
        })
        .join('') +
      '</div>' +
      '<p class="bk-muted" style="margin:14px 0 0">' +
      esc(v.notes) +
      '</p>' +
      '<div class="bk-row-actions" style="margin-top:14px">' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkVerifyOk">标记核验通过</button>' +
      '<button type="button" class="bk-btn" data-nav="case/' +
      esc(c.id) +
      '/ubo">下一步：受益所有人</button></div></div></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
    ctx.rootEl.querySelector('#bkVerifyOk').addEventListener('click', function () {
      var map = Object.assign({}, ctx.state.bankVerifyOk || {});
      map[c.id] = true;
      ctx.setState({ bankVerifyOk: map });
      ctx.toast('主体核验已标记通过（示意）');
      this.textContent = '已通过 ✓';
      this.disabled = true;
    });
    if (ctx.state.bankVerifyOk && ctx.state.bankVerifyOk[c.id]) {
      var btn = ctx.rootEl.querySelector('#bkVerifyOk');
      btn.textContent = '已通过 ✓';
      btn.disabled = true;
    }
  }

  /* —— UBO —— */
  function renderUbo(ctx, c) {
    var thr = ctx.state.bankUboThr || 25;
    var rows = (c.uboRows || []).slice();
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '受益所有人') +
      '<div class="bk-body">' +
      caseSubnav(c, '受益所有人') +
      '<div class="bk-panel"><div class="bk-row-actions" style="justify-content:space-between">' +
      '<div><h3 style="margin:0">识别结果</h3><p class="bk-muted" style="margin:6px 0 0">标准一优先标注；多人分属不同标准须全部列示。禁止只查 BOMIS 代替识别。</p></div>' +
      '<div class="bk-pill-toggle">' +
      '<button type="button" class="' +
      (thr === 25 ? 'on' : '') +
      '" data-thr="25">标准 25%</button>' +
      '<button type="button" class="' +
      (thr === 10 ? 'on' : '') +
      '" data-thr="10">加强 10%</button></div></div>' +
      '<div class="bk-chips" style="margin-top:10px">' +
      (c.specialFlags || [])
        .map(function (f) {
          return '<span class="bk-tag warn">' + esc(f) + '</span>';
        })
        .join('') +
      '</div>' +
      '<div class="bk-table-wrap" style="margin-top:12px"><table class="bk-table"><thead><tr>' +
      '<th>姓名</th><th>性别</th><th>国籍</th><th>证件</th><th>标准</th><th>受益股份%</th><th>表决权%</th><th>形成日</th><th>路径 / 说明</th><th></th>' +
      '</tr></thead><tbody id="bkUboBody"></tbody></table></div>' +
      '<p class="bk-muted" style="margin-top:10px">切换 10% 时：持股≥10% 且未单独满足标准一/二/三的自然人会高亮；&lt;10% 且非推荐行会淡化。</p></div>' +
      '<div class="bk-panel"><h3>控制关系摘要</h3><p class="bk-pre">' +
      esc(c.controlSummary) +
      '</p>' +
      '<div class="bk-row-actions" style="margin-top:10px">' +
      '<button type="button" class="bk-btn" data-nav="case/' +
      esc(c.id) +
      '/penetrate">查看穿透结构</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" data-nav="case/' +
      esc(c.id) +
      '/bomis">去 BOMIS 核验</button></div></div></div></div>';

    function paint() {
      var tbody = ctx.rootEl.querySelector('#bkUboBody');
      tbody.innerHTML = rows
        .map(function (r) {
          var hi = thr === 10 && r.pct >= 10 && r.standard === '标准一';
          var dim = thr === 10 && r.pct > 0 && r.pct < 10 && !r.recommended && r.standard !== '日常经营' && r.standard !== '标准三' && r.standard !== '标准二';
          if (thr === 25) {
            dim = r.pct > 0 && r.pct < 25 && r.standard === '标准一' && !r.recommended;
            hi = r.recommended || (r.standard === '标准一' && r.pct >= 25);
          }
          if (r.standard === '标准二' || r.standard === '标准三' || r.standard === '日常经营') {
            dim = false;
            if (r.recommended) hi = true;
          }
          return (
            '<tr class="' +
            (hi ? 'hi' : '') +
            (dim ? ' dim' : '') +
            '"><td><strong>' +
            esc(r.name) +
            '</strong><div class="bk-muted">' +
            esc(r.role || '') +
            '</div></td><td>' +
            esc(r.gender) +
            '</td><td>' +
            esc(r.nationality) +
            '</td><td>' +
            esc(r.idMask) +
            '</td><td>' +
            stdTag(r.standard) +
            '</td><td>' +
            esc(r.pct) +
            '</td><td>' +
            esc(r.votePct) +
            '</td><td>' +
            esc(r.formDate) +
            '</td><td style="max-width:280px">' +
            esc(r.path) +
            '</td><td>' +
            (r.recommended ? '<span class="bk-tag dd">推荐主受益人</span>' : '') +
            '</td></tr>'
          );
        })
        .join('');
    }
    paint();
    ctx.rootEl.querySelectorAll('[data-thr]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = Number(btn.getAttribute('data-thr'));
        ctx.setState({ bankUboThr: v });
        thr = v;
        ctx.rootEl.querySelectorAll('[data-thr]').forEach(function (b) {
          b.classList.toggle('on', Number(b.getAttribute('data-thr')) === v);
        });
        paint();
        ctx.toast(v === 10 ? '已切换加强识别阈值 10%' : '已切换标准阈值 25%');
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Penetrate —— */
  function renderTreeNodes(nodes) {
    if (!nodes || !nodes.length) return '';
    return (
      '<ul>' +
      nodes
        .map(function (n) {
          return (
            '<li><div class="node"><strong>' +
            esc(n.name) +
            '</strong><span class="bk-tag">' +
            esc(n.pct) +
            '</span><span class="bk-muted">' +
            esc(n.type || '') +
            (n.note ? ' · ' + n.note : '') +
            '</span></div>' +
            renderTreeNodes(n.children) +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  function renderPenetrate(ctx, c) {
    var p = c.penetrate || { root: c.company, children: [] };
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '穿透结构') +
      '<div class="bk-body">' +
      caseSubnav(c, '穿透结构') +
      '<div class="bk-panel"><h3>所有权与控制权结构</h3>' +
      '<p class="bk-muted">示意穿透树；正式环境可切换股权 / 表决权视图。</p>' +
      '<div class="bk-tree" style="margin-top:12px"><div class="root"><div class="node">' +
      esc(p.root) +
      '</div>' +
      renderTreeNodes(p.children) +
      '</div></div>' +
      '<div class="bk-row-actions" style="margin-top:14px">' +
      '<button type="button" class="bk-btn" data-nav="case/' +
      esc(c.id) +
      '/ubo">返回受益所有人表</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" data-nav="case/' +
      esc(c.id) +
      '/evidence">归档佐证</button></div></div></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Evidence —— */
  function renderEvidence(ctx, c) {
    var mats = (c.materials || []).slice();
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '佐证材料') +
      '<div class="bk-body">' +
      caseSubnav(c, '佐证材料') +
      '<div class="bk-panel"><div class="bk-row-actions" style="justify-content:space-between;margin-bottom:12px">' +
      '<h3 style="margin:0">佐证材料包</h3>' +
      '<div class="bk-row-actions">' +
      '<button type="button" class="bk-btn" id="bkFeishu">从飞书拉取</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkAddMat">登记本地材料</button></div></div>' +
      '<div id="bkMatList"></div></div></div></div>';

    function paint() {
      ctx.rootEl.querySelector('#bkMatList').innerHTML = mats
        .map(function (m, i) {
          var ok = m.status === '已收' || m.status === '已生成';
          return (
            '<div class="bk-mat"><div><div>' +
            esc(m.name) +
            '</div><div class="bk-muted">来源：' +
            esc(m.source) +
            '</div></div><div class="bk-row-actions">' +
            '<span class="bk-tag ' +
            (ok ? 'ok' : 'warn') +
            '">' +
            esc(m.status) +
            '</span>' +
            (ok
              ? ''
              : '<button type="button" class="bk-btn" data-recv="' +
                i +
                '">标记已收</button>') +
            '</div></div>'
          );
        })
        .join('');
      ctx.rootEl.querySelectorAll('[data-recv]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = Number(btn.getAttribute('data-recv'));
          mats[i].status = '已收';
          paint();
          ctx.toast('已标记「' + mats[i].name + '」为已收');
        });
      });
    }
    paint();
    ctx.rootEl.querySelector('#bkFeishu').addEventListener('click', function () {
      mats.push({ name: '飞书客户材料.pdf', status: '已收', source: '飞书' });
      paint();
      ctx.toast('已从飞书写入客户材料（非真实同步）');
    });
    ctx.rootEl.querySelector('#bkAddMat').addEventListener('click', function () {
      mats.push({ name: '客户补充材料_' + (mats.length + 1) + '.pdf', status: '已收', source: '本地' });
      paint();
      ctx.toast('已登记本地材料');
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— BOMIS —— */
  function renderBomis(ctx, c) {
    var b = c.bomis || { result: '—', left: [], right: [], diffs: [] };
    var rcls = b.result === '一致' ? 'ok' : 'danger';
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, 'BOMIS 核验') +
      '<div class="bk-body">' +
      caseSubnav(c, 'BOMIS') +
      '<div class="bk-panel"><div class="bk-row-actions" style="justify-content:space-between">' +
      '<h3 style="margin:0">核验结果 <span class="bk-tag ' +
      rcls +
      '">' +
      esc(b.result) +
      '</span></h3>' +
      '<button type="button" class="bk-btn-primary bk-btn" data-nav="case/' +
      esc(c.id) +
      '/diff">进入差异工作台</button></div>' +
      '<p class="bk-muted" style="margin:8px 0 0">本行识别核实结果 vs BOMIS 备案信息并排比对。禁止以备案查询替代识别。</p></div>' +
      '<div class="bk-compare">' +
      '<div class="bk-panel"><h3>本行识别</h3>' +
      (b.left || [])
        .map(function (x) {
          return '<div class="bk-mat"><span class="bk-muted">' + esc(x.label) + '</span><strong>' + esc(x.value) + '</strong></div>';
        })
        .join('') +
      '</div>' +
      '<div class="bk-panel"><h3>BOMIS 备案</h3>' +
      (b.right || [])
        .map(function (x) {
          return '<div class="bk-mat"><span class="bk-muted">' + esc(x.label) + '</span><strong>' + esc(x.value) + '</strong></div>';
        })
        .join('') +
      '</div></div>' +
      '<div class="bk-panel"><h3>差异项</h3>' +
      (!(b.diffs || []).length
        ? '<p class="bk-muted">无差异项。</p>'
        : '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>比对项</th><th>本行</th><th>BOMIS</th><th>类型</th><th>说明</th></tr></thead><tbody>' +
          b.diffs
            .map(function (d) {
              return (
                '<tr><td>' +
                esc(d.item) +
                '</td><td>' +
                esc(d.bankSide) +
                '</td><td>' +
                esc(d.bomisSide) +
                '</td><td><span class="bk-tag ' +
                (d.type === '重大' ? 'danger' : 'warn') +
                '">' +
                esc(d.type) +
                '</span></td><td>' +
                esc(d.reason) +
                '</td></tr>'
              );
            })
            .join('') +
          '</tbody></table></div>') +
      '</div></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Diff report —— */
  function getDiffStatus(ctx, c) {
    var map = ctx.state.bankDiffStatus || {};
    return map[c.id] || (c.diffReport && c.diffReport.reviewStatus) || '待初审';
  }

  function renderDiff(ctx, c) {
    var dr = c.diffReport || { sections: [], deadlineWorkdays: null, reviewStatus: '—' };
    var status = getDiffStatus(ctx, c);
    var hasMajor = ((c.bomis && c.bomis.diffs) || []).some(function (d) {
      return d.type === '重大';
    });
    var cdCls = status === '复核通过' || status === '无需报送' ? 'ok' : '';
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '差异报告') +
      '<div class="bk-body">' +
      caseSubnav(c, '差异报告') +
      '<div class="bk-panel"><div class="bk-row-actions" style="justify-content:space-between;flex-wrap:wrap">' +
      '<div class="bk-row-actions">' +
      '<span class="bk-tag ' +
      (hasMajor ? 'danger' : 'ok') +
      '">' +
      (hasMajor ? '含重大差异' : '无重大差异 / 一致') +
      '</span>' +
      '<span class="bk-tag dd">状态：' +
      esc(status) +
      '</span>' +
      (dr.deadlineWorkdays != null
        ? '<span class="bk-countdown ' +
          cdCls +
          '">报送倒计时 · 剩余 ' +
          esc(dr.deadlineWorkdays) +
          ' 个工作日</span>'
        : '<span class="bk-countdown ok">无需报送</span>') +
      '</div>' +
      '<div class="bk-row-actions">' +
      '<button type="button" class="bk-btn" id="bkDiffFirst"' +
      (status !== '待初审' && status !== '初审驳回' ? ' disabled' : '') +
      '>初审通过</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkDiffSecond"' +
      (status !== '初审通过' ? ' disabled' : '') +
      '>复核通过</button>' +
      '<button type="button" class="bk-btn" id="bkDiffReject">退回修改</button></div></div>' +
      '<p class="bk-muted" style="margin:10px 0 0">重大差异须双岗；不可全自动提交。非重大差异留痕不报。</p></div>' +
      (dr.sections || [])
        .map(function (s) {
          return (
            '<div class="bk-panel"><h3>' +
            esc(s.title) +
            '</h3><div class="bk-pre">' +
            esc(s.body) +
            '</div></div>'
          );
        })
        .join('') +
      '</div></div>';

    function setStatus(st) {
      var map = Object.assign({}, ctx.state.bankDiffStatus || {});
      map[c.id] = st;
      ctx.setState({ bankDiffStatus: map });
      ctx.toast('差异报告状态 → ' + st);
      renderDiff(ctx, c);
    }
    var first = ctx.rootEl.querySelector('#bkDiffFirst');
    var second = ctx.rootEl.querySelector('#bkDiffSecond');
    var reject = ctx.rootEl.querySelector('#bkDiffReject');
    if (first) first.addEventListener('click', function () { setStatus('初审通过'); });
    if (second) second.addEventListener('click', function () { setStatus('复核通过'); });
    if (reject) reject.addEventListener('click', function () { setStatus('待初审'); });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Risk —— */
  function renderRisk(ctx, c) {
    var rating = (ctx.state.bankRating || {})[c.id] || c.riskLevel;
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '风险与评级') +
      '<div class="bk-body">' +
      caseSubnav(c, '风险评级') +
      '<div class="bk-grid bk-grid-2">' +
      '<div class="bk-panel"><h3>风险事项</h3>' +
      (c.risks || [])
        .map(function (r) {
          return (
            '<div class="bk-mat"><div><div>' +
            esc(r.title) +
            '</div><div class="bk-muted">' +
            esc(r.source) +
            ' · ' +
            esc(r.detail || '') +
            '</div></div><span class="bk-tag ' +
            (r.level === '高' ? 'danger' : r.level === '关注' ? 'warn' : 'dd') +
            '">' +
            esc(r.level) +
            '</span></div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="bk-panel"><h3>风险评级</h3>' +
      '<p>当前评级：' +
      riskTag(rating) +
      '</p>' +
      '<div class="bk-row-actions" style="margin:12px 0">' +
      ['低', '中', '高']
        .map(function (lv) {
          return (
            '<button type="button" class="bk-btn' +
            (rating === lv ? ' active' : '') +
            '" data-rate="' +
            lv +
            '">' +
            lv +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<h3 style="margin-top:16px">加强措施建议（EDD）</h3>' +
      '<div class="bk-chips">' +
      (c.specialFlags || [])
        .map(function (f) {
          return '<span class="bk-tag warn">' + esc(f) + '</span>';
        })
        .join('') +
      '</div><ul style="margin:10px 0 0;padding-left:18px;font-size:13px;line-height:1.6">' +
      (c.eddHints || ['标准客户尽职调查即可'])
        .map(function (h) {
          return '<li>' + esc(h) + '</li>';
        })
        .join('') +
      '</ul></div></div></div></div>';
    ctx.rootEl.querySelectorAll('[data-rate]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var map = Object.assign({}, ctx.state.bankRating || {});
        map[c.id] = btn.getAttribute('data-rate');
        ctx.setState({ bankRating: map });
        ctx.toast('风险评级已更新为「' + map[c.id] + '」');
        renderRisk(ctx, c);
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Opinion —— */
  function renderOpinion(ctx, c) {
    var key = 'bankOpinion_' + c.id;
    var text = ctx.state[key] != null ? ctx.state[key] : c.opinion || '';
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '调查意见') +
      '<div class="bk-body">' +
      caseSubnav(c, '调查意见') +
      '<div class="bk-panel"><div class="bk-row-actions" style="justify-content:space-between;margin-bottom:10px">' +
      '<h3 style="margin:0">客户尽职调查意见</h3>' +
      '<div class="bk-row-actions">' +
      '<button type="button" class="bk-btn" id="bkGenOpinion">生成 CDD 初稿</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkSaveOpinion">保存草稿</button></div></div>' +
      '<textarea class="bk-ta" id="bkOpinionTa">' +
      esc(text) +
      '</textarea>' +
      '<p class="bk-muted" style="margin-top:8px">AI 仅整理事实与材料缺口，不替代授信 / 准入审批结论。</p></div></div></div>';
    ctx.rootEl.querySelector('#bkSaveOpinion').addEventListener('click', function () {
      var v = ctx.rootEl.querySelector('#bkOpinionTa').value;
      var patch = {};
      patch[key] = v;
      ctx.setState(patch);
      ctx.toast('调查意见草稿已保存');
    });
    ctx.rootEl.querySelector('#bkGenOpinion').addEventListener('click', function () {
      var draft =
        c.opinion +
        '\n\n【系统追加 · ' +
        new Date().toLocaleString('zh-CN') +
        '】BOMIS=' +
        ((c.bomis && c.bomis.result) || '—') +
        '；待补件 ' +
        ((c.pendingDocs && c.pendingDocs.length) || 0) +
        ' 项；差异状态=' +
        getDiffStatus(ctx, c) +
        '。';
      ctx.rootEl.querySelector('#bkOpinionTa').value = draft;
      ctx.toast('已生成 CDD 初稿（示意）');
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Monitor —— */
  function renderMonitor(ctx, c) {
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      caseHeader(c, '持续监控') +
      '<div class="bk-body">' +
      caseSubnav(c, '持续监控') +
      '<div class="bk-panel"><h3>变更与预警时间线</h3>' +
      (c.monitorEvents || [])
        .map(function (e) {
          return (
            '<div class="bk-mat"><div><div><strong>' +
            esc(e.title) +
            '</strong> <span class="bk-tag dd">' +
            esc(e.type) +
            '</span></div><div class="bk-muted">' +
            esc(e.detail) +
            '</div></div><span class="bk-muted">' +
            esc(e.date) +
            '</span></div>'
          );
        })
        .join('') +
      '<div class="bk-row-actions" style="margin-top:12px">' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkAckMon">确认已阅预警</button>' +
      '<button type="button" class="bk-btn" data-nav="case/' +
      esc(c.id) +
      '/ubo">复评受益所有人</button></div></div></div></div>';
    ctx.rootEl.querySelector('#bkAckMon').addEventListener('click', function () {
      var map = Object.assign({}, ctx.state.bankMonAck || {});
      map[c.id] = true;
      ctx.setState({ bankMonAck: map });
      this.textContent = '已确认 ✓';
      this.disabled = true;
      ctx.toast('持续监控预警已确认');
    });
    if (ctx.state.bankMonAck && ctx.state.bankMonAck[c.id]) {
      var b = ctx.rootEl.querySelector('#bkAckMon');
      b.textContent = '已确认 ✓';
      b.disabled = true;
    }
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Stock —— */
  function renderStock(ctx) {
    var sp = data().stockProgress || {};
    var s = sp.summary || {};
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      '<div class="bk-toolbar"><h1>存量攻坚看板</h1><div class="spacer"></div>' +
      '<span class="bk-muted">' +
      esc(s.phase || '') +
      ' · 目标 ' +
      esc(s.deadline || '') +
      '</span>' +
      '<button type="button" class="bk-btn" data-nav="home">返回首页</button></div>' +
      '<div class="bk-body">' +
      '<div class="bk-grid bk-grid-3">' +
      '<div class="bk-stat"><div class="n">' +
      esc(s.done) +
      ' / ' +
      esc(s.total) +
      '</div><div class="l">存量识别完成</div><div class="bk-bar"><i style="width:' +
      Math.round((s.done / (s.total || 1)) * 100) +
      '%"></i></div></div>' +
      '<div class="bk-stat"><div class="n">' +
      esc(s.highRiskDone) +
      ' / ' +
      esc(s.highRiskTotal) +
      '</div><div class="l">高风险优先完成</div><div class="bk-bar"><i style="width:' +
      Math.round((s.highRiskDone / (s.highRiskTotal || 1)) * 100) +
      '%;background:#b45309"></i></div></div>' +
      '<div class="bk-stat"><div class="n">' +
      Math.round((s.done / (s.total || 1)) * 100) +
      '%</div><div class="l">整体进度</div></div></div>' +
      '<div class="bk-panel" style="margin-top:12px"><h3>分批进度</h3>' +
      (sp.batches || [])
        .map(function (b) {
          return (
            '<div style="margin-bottom:12px"><div class="bk-row-actions" style="justify-content:space-between"><span>' +
            esc(b.name) +
            '</span><span class="bk-muted">' +
            esc(b.done) +
            '/' +
            esc(b.total) +
            ' · ' +
            esc(b.pct) +
            '%</span></div><div class="bk-bar"><i style="width:' +
            esc(b.pct) +
            '%"></i></div></div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="bk-panel"><h3>高风险优先队列</h3><div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>客户</th><th>风险</th><th>经办</th><th>状态</th><th></th></tr></thead><tbody>' +
      (sp.queue || [])
        .map(function (q) {
          return (
            '<tr>' +
            '<td>' +
            esc(q.company) +
            '</td><td>' +
            riskTag(q.risk) +
            '</td><td>' +
            esc(q.owner) +
            '</td><td>' +
            esc(q.status) +
            '</td><td>' +
            (q.caseId
              ? '<button type="button" class="bk-btn" data-nav="enterprise/' +
                String(q.caseId).replace(/^case-/, 'cust-') +
                '">打开企业档案</button>'
              : '<span class="bk-muted">未建档</span>') +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table></div></div></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Pack hub & subpages —— */
  function renderPackHub(ctx) {
    if (!assertAdmin(ctx)) return;
    var meta = data().packMeta || { modules: [] };
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      '<div class="bk-toolbar"><h1>' +
      esc(meta.title || '授信 Pack') +
      '</h1><div class="spacer"></div>' +
      '<button type="button" class="bk-btn" data-nav="home">返回</button></div>' +
      '<div class="bk-body"><p class="bk-muted" style="margin:0 0 14px">' +
      esc(meta.lead || '') +
      '</p><div class="bk-card-grid">' +
      (meta.modules || [])
        .map(function (m) {
          return (
            '<button type="button" class="bk-card" data-nav="' +
            esc(m.route) +
            '"><strong>' +
            esc(m.title) +
            '</strong><span>' +
            esc(m.desc) +
            '</span></button>'
          );
        })
        .join('') +
      '</div></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function packChrome(title, ctx) {
    return (
      '<div class="bk-toolbar"><div><div class="bk-crumb"><a data-nav="pack">授信 Pack</a> / ' +
      esc(title) +
      '</div><h1>' +
      esc(title) +
      '</h1></div><div class="spacer"></div>' +
      '<button type="button" class="bk-btn" data-nav="pack">Pack 首页</button></div>'
    );
  }

  function renderPackOcr(ctx) {
    var done = !!ctx.state.packOcrBalanced;
    var sheet = ctx.state.packOcrSheet || 'bs';
    var sheets = {
      bs: {
        label: '资产负债表',
        rows: ctx.state.packOcrBs || [
          { name: '货币资金', val: '120,450.00', conf: '98%' },
          { name: '应收账款', val: '686,341.54', conf: '96%' },
          { name: '存货', val: '210,088.00', conf: '94%' },
          { name: '流动资产合计', val: '1,138,346.20', conf: '91%' },
          { name: '资产总计', val: '2,180,000.00', conf: '97%' }
        ]
      },
      is: {
        label: '利润表',
        rows: ctx.state.packOcrIs || [
          { name: '营业收入', val: '980,000.00', conf: '99%' },
          { name: '营业成本', val: '612,000.00', conf: '97%' },
          { name: '利润总额', val: '102,220.00', conf: '95%' },
          { name: '所得税费用', val: '16,000.00', conf: '96%' },
          { name: '净利润', val: '86,220.00', conf: '98%' }
        ]
      },
      cf: {
        label: '现金流量表',
        rows: ctx.state.packOcrCf || [
          { name: '经营活动现金流净额', val: '54,200.00', conf: '93%' },
          { name: '投资活动现金流净额', val: '-28,000.00', conf: '92%' },
          { name: '筹资活动现金流净额', val: '10,000.00', conf: '90%' },
          { name: '期末现金及等价物', val: '120,450.00', conf: '97%' }
        ]
      }
    };
    var cur = sheets[sheet] || sheets.bs;
    var tabHtml = Object.keys(sheets)
      .map(function (k) {
        return (
          '<button type="button" class="bk-btn' +
          (k === sheet ? ' active' : '') +
          '" data-sheet="' +
          k +
          '">' +
          sheets[k].label +
          '</button>'
        );
      })
      .join('');
    var rowHtml = cur.rows
      .map(function (r, idx) {
        return (
          '<tr><td>' +
          esc(r.name) +
          '</td><td><input data-row="' +
          idx +
          '" value="' +
          esc(r.val) +
          '" style="width:100%;border:1px solid var(--xb-line,#e8ecf0);border-radius:3px;padding:4px 8px" /></td><td>' +
          esc(r.conf) +
          '</td></tr>'
        );
      })
      .join('');
    var rules = [
      { name: '流动资产合计 = 子项汇总', status: done ? 'ok' : 'warn', detail: done ? '已平' : '差 121,467.34' },
      { name: '净利润 = 利润总额 − 所得税', status: done ? 'ok' : 'warn', detail: done ? '已平' : '差 0.01' },
      { name: '三表钩稽 · 货币资金 = 期末现金', status: done ? 'ok' : 'warn', detail: done ? '已平' : '待核' },
      { name: '资产总计 = 负债 + 权益', status: done ? 'ok' : 'ok', detail: '平衡' },
      { name: '现金流量表勾稽 · 期末现金', status: done ? 'ok' : 'warn', detail: done ? '已平' : '待核' }
    ];
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      packChrome('财报 OCR 校对', ctx) +
      '<div class="bk-body">' +
      '<div class="bk-row-actions" style="margin-bottom:10px">' +
      '<span class="bk-tag ' +
      (done ? 'ok' : 'warn') +
      '">' +
      (done ? '试算已处理' : '试算不平 · 待校对') +
      '</span>' +
      tabHtml +
      '<button type="button" class="bk-btn" id="bkOcrRun">重新识别</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkOcrFix">采纳校对并过试算</button></div>' +
      '<div class="bk-ocr">' +
      '<div class="bk-ocr-col"><div class="bk-ocr-hd">原文预览 · ' +
      esc(cur.label) +
      '</div><div class="bk-ocr-bd"><div class="bk-preview-fake">PDF 预览<br/>审计报告 2025<br/>' +
      esc(cur.label) +
      '<br/>第 ' +
      (sheet === 'bs' ? '12' : sheet === 'is' ? '18' : '24') +
      ' / 48 页</div></div></div>' +
      '<div class="bk-ocr-col"><div class="bk-ocr-hd">识别行表（可改）</div><div class="bk-ocr-bd" id="bkOcrFields">' +
      '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>科目</th><th>金额</th><th>置信度</th></tr></thead><tbody>' +
      rowHtml +
      '</tbody></table></div></div></div>' +
      '<div class="bk-ocr-col"><div class="bk-ocr-hd">试算规则</div><div class="bk-ocr-bd" id="bkOcrBal">' +
      rules
        .map(function (r) {
          return (
            '<div class="bk-mat"><span>' +
            esc(r.name) +
            '</span><span class="bk-tag ' +
            esc(r.status) +
            '">' +
            esc(r.detail) +
            '</span></div>'
          );
        })
        .join('') +
      '</div></div></div>' +
      '<div class="bk-row-actions" style="margin-top:12px"><button type="button" class="bk-btn" data-nav="finance-config">打开财务配置</button></div>' +
      '</div></div>';
    ctx.rootEl.querySelectorAll('[data-sheet]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rows = [];
        ctx.rootEl.querySelectorAll('#bkOcrFields input').forEach(function (inp) {
          var i = parseInt(inp.getAttribute('data-row'), 10);
          rows[i] = { name: cur.rows[i].name, val: inp.value, conf: cur.rows[i].conf };
        });
        var patch = { packOcrSheet: btn.getAttribute('data-sheet') };
        if (sheet === 'bs') patch.packOcrBs = rows;
        if (sheet === 'is') patch.packOcrIs = rows;
        if (sheet === 'cf') patch.packOcrCf = rows;
        ctx.setState(patch);
        renderPackOcr(ctx);
      });
    });
    ctx.rootEl.querySelector('#bkOcrRun').addEventListener('click', function () {
      ctx.toast('已重新跑 OCR（三表）');
    });
    ctx.rootEl.querySelector('#bkOcrFix').addEventListener('click', function () {
      var rows = [];
      ctx.rootEl.querySelectorAll('#bkOcrFields input').forEach(function (inp) {
        var i = parseInt(inp.getAttribute('data-row'), 10);
        rows[i] = { name: cur.rows[i].name, val: inp.value, conf: cur.rows[i].conf };
      });
      var patch = { packOcrBalanced: true };
      if (sheet === 'bs') patch.packOcrBs = rows;
      if (sheet === 'is') patch.packOcrIs = rows;
      if (sheet === 'cf') patch.packOcrCf = rows;
      ctx.setState(patch);
      ctx.toast('校对已采纳，试算标记为已处理');
      renderPackOcr(ctx);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderPackFinance(ctx) {
    var flagged = !!ctx.state.packFinFlagged;
    var rows = [
      { subject: '应收账款', yoy: '+42%', flag: '异动', note: '增速显著高于收入' },
      { subject: '存货', yoy: '+8%', flag: '正常', note: '—' },
      { subject: '经营活动现金流', yoy: '-15%', flag: '关注', note: '与净利润背离' },
      { subject: '其他应收款', yoy: '+120%', flag: '异动', note: '需说明关联往来' }
    ];
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      packChrome('财评异动分析', ctx) +
      '<div class="bk-body">' +
      '<div class="bk-row-actions" style="margin-bottom:10px">' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkFinRun">运行异动扫描</button>' +
      '<span class="bk-tag ' +
      (flagged ? 'warn' : 'dd') +
      '">' +
      (flagged ? '已生成异动清单' : '待扫描') +
      '</span></div>' +
      '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>科目</th><th>同比</th><th>标记</th><th>说明</th></tr></thead><tbody>' +
      rows
        .map(function (r) {
          return (
            '<tr><td>' +
            esc(r.subject) +
            '</td><td>' +
            esc(r.yoy) +
            '</td><td><span class="bk-tag ' +
            (r.flag === '异动' ? 'danger' : r.flag === '关注' ? 'warn' : 'ok') +
            '">' +
            esc(r.flag) +
            '</span></td><td>' +
            esc(r.note) +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table></div>' +
      '<div id="bkFinOut" class="bk-panel" style="margin-top:12px;display:' +
      (flagged ? 'block' : 'none') +
      '"><h3>分析结论（示意）</h3><p class="bk-pre">应收账款与收入增速背离、其他应收款陡增，建议在授信调查报告「财务分析」章中单独说明并要求客户补充账龄与关联方清单。</p></div>' +
      '<div class="bk-row-actions" style="margin-top:12px"><button type="button" class="bk-btn" data-nav="pack/credit">进入授信章节</button></div>' +
      '</div></div>';
    ctx.rootEl.querySelector('#bkFinRun').addEventListener('click', function () {
      ctx.setState({ packFinFlagged: true });
      ctx.toast('异动扫描完成');
      renderPackFinance(ctx);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderPackMaterials(ctx) {
    if (!assertAdmin(ctx)) return;
    var types = ctx.state.packMatTypes || [
      { name: '营业执照', required: true, on: true },
      { name: '受益所有人声明', required: true, on: true },
      { name: '近三年审计报告', required: true, on: true },
      { name: '公司章程', required: false, on: true },
      { name: '一致行动协议', required: false, on: false },
      { name: '实地走访记录', required: false, on: true }
    ];
    ctx.rootEl.innerHTML = adminConfigShell(
      ctx,
      'pack/materials-types',
      '材料类型配置',
      '<div class="bk-panel"><h3>对公客户尽调材料清单</h3>' +
        '<p class="bk-muted">必收项在项目文件树标红；客经侧不可改本配置。</p>' +
        '<div id="bkMatTypes"></div>' +
        '<div class="bk-row-actions" style="margin-top:12px"><button type="button" class="bk-btn-primary bk-btn" id="bkSaveTypes">保存配置</button></div></div>'
    );
    function paint() {
      ctx.rootEl.querySelector('#bkMatTypes').innerHTML = types
        .map(function (t, i) {
          return (
            '<div class="bk-mat"><div><strong>' +
            esc(t.name) +
            '</strong> ' +
            (t.required ? '<span class="bk-tag danger">必填</span>' : '<span class="bk-tag">选填</span>') +
            '</div><label class="bk-muted"><input type="checkbox" data-i="' +
            i +
            '" ' +
            (t.on ? 'checked' : '') +
            ' /> 启用</label></div>'
          );
        })
        .join('');
      ctx.rootEl.querySelectorAll('input[data-i]').forEach(function (inp) {
        inp.addEventListener('change', function () {
          types[Number(inp.getAttribute('data-i'))].on = inp.checked;
        });
      });
    }
    paint();
    ctx.rootEl.querySelector('#bkSaveTypes').addEventListener('click', function () {
      ctx.setState({ packMatTypes: types });
      ctx.toast('材料类型配置已保存');
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  // ── 报告模板配置（3 态：列表 / 详情 / 编辑器）──────────────────
  var PACK_TPL_DATA = [
    {
      id: 'dd-standard',
      name: '对公客户调查报告（标准版）',
      bizType: '对公授信',
      version: 'v2.1',
      isBuiltin: true,
      status: 'published',
      chapters: [
        { ch: 1, name: '客户基本情况', module: 'entity', entry: '公开面 + 股权穿透', dataSource: '公开数据' },
        { ch: 2, name: '经营情况分析', module: 'biz', entry: '行业判断 + 主营分析', dataSource: '工商 + 客户访谈' },
        { ch: 3, name: '财务分析', module: 'finance', entry: '三表分析 + 异动扫描', dataSource: 'OCR 财报' },
        { ch: 4, name: '信用与合规调查', module: 'credit', entry: '征信 + 司法', dataSource: '中登 + 征信系统' },
        { ch: 5, name: '受益所有人核查', module: 'entity', entry: 'BO 穿透', dataSource: '股权图 + 声明' },
        { ch: 6, name: '风险点与缓释措施', module: 'risk', entry: '红旗清单', dataSource: '各章回写' },
        { ch: 7, name: '调查结论与授信建议', module: 'conclusion', entry: '汇编', dataSource: '前六章定稿' }
      ],
      updatedAt: '2026-07-10 09:00'
    },
    {
      id: 'dd-trade',
      name: '贸易背景调查报告',
      bizType: '贸易融资',
      version: 'v1.3',
      isBuiltin: true,
      status: 'published',
      chapters: [
        { ch: 1, name: '企业基本情况', module: 'entity', entry: '公开面速览', dataSource: '公开数据' },
        { ch: 2, name: '贸易背景真实性核查', module: 'biz', entry: '合同 + 发票核验', dataSource: '贸易单据' },
        { ch: 3, name: '交易链审查', module: 'biz', entry: '上下游验证', dataSource: '核查底稿' },
        { ch: 4, name: '财务要点', module: 'finance', entry: '资产负债 + 现金流', dataSource: 'OCR' },
        { ch: 5, name: '合规与风险', module: 'risk', entry: '红旗清单', dataSource: '各章汇总' }
      ],
      updatedAt: '2026-06-28 14:30'
    },
    {
      id: 'dd-sme-lite',
      name: '小微客户简版调查报告',
      bizType: '小微授信',
      version: 'v1.0',
      isBuiltin: false,
      status: 'draft',
      chapters: [
        { ch: 1, name: '主体照面', module: 'entity', entry: '公开面速览', dataSource: '公开数据' },
        { ch: 2, name: '财务要点', module: 'finance', entry: '财报摘要', dataSource: 'OCR' },
        { ch: 3, name: '风险点与结论', module: 'conclusion', entry: '汇编', dataSource: '前两章' }
      ],
      updatedAt: '2026-07-15 11:00'
    }
  ];

  var PACK_TPL_MODULES = [
    { value: 'entity', label: '主体信息' },
    { value: 'biz', label: '经营/业务' },
    { value: 'finance', label: '财务分析' },
    { value: 'credit', label: '信用调查' },
    { value: 'risk', label: '风险缓释' },
    { value: 'conclusion', label: '调查结论' }
  ];

  var PACK_TPL_DEFAULTS_INIT = { '对公授信': 'dd-standard', '贸易融资': 'dd-trade' };

  var BLOCK_TYPE_LABELS = { text: '文本段落', table: '表格', heading: '小标题', image_gallery: '图片组' };

  var PACK_CONTENT_PALETTE = [
    { type: 'text', label: '文本段落', group: '通用组件', authoringMode: 'ai_write' },
    { type: 'table', label: '表格', group: '通用组件', authoringMode: 'ai_write' },
    { type: 'heading', label: '小标题', group: '通用组件', authoringMode: 'human_write' },
    { type: 'text', label: '人工填写文本', group: '通用组件', authoringMode: 'human_write' },
    { type: 'image_gallery', label: '图片组', group: '特殊组件', authoringMode: 'human_write' }
  ];

  var PACK_CHAPTER_BLOCK_DEFAULTS = {
    entity: [
      { type: 'heading', text: '基本工商信息', authoringMode: 'human_write' },
      { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '公开面信息整合：工商登记、注册资本、经营范围' },
      { type: 'table', label: '股权结构表', authoringMode: 'ai_write', writingBrief: '股东及出资比例（财跃启明星数据）' }
    ],
    biz: [
      { type: 'heading', text: '行业与主营', authoringMode: 'human_write' },
      { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '行业判断与竞争格局' },
      { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '主营业务及营收构成分析' }
    ],
    finance: [
      { type: 'heading', text: '财务分析', authoringMode: 'human_write' },
      { type: 'table', label: '财务数据表', authoringMode: 'ai_write', writingBrief: '资产负债表摘要（OCR 财报）' },
      { type: 'table', label: '财务数据表', authoringMode: 'ai_write', writingBrief: '利润表核心指标' },
      { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '财务异动分析与提示' }
    ],
    credit: [
      { type: 'heading', text: '征信与合规', authoringMode: 'human_write' },
      { type: 'table', label: '征信数据表', authoringMode: 'ai_write', writingBrief: '征信记录（中登/征信系统）' },
      { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '司法风险归纳' }
    ],
    risk: [
      { type: 'heading', text: '风险识别', authoringMode: 'human_write' },
      { type: 'table', label: '风险矩阵表', authoringMode: 'ai_write', writingBrief: '风险项列表及等级评估' },
      { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '缓释措施建议' }
    ],
    conclusion: [
      { type: 'heading', text: '综合结论', authoringMode: 'human_write' },
      { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '汇编前各章，给出授信建议' }
    ]
  };

  function getChapterBlocks(ch) {
    if (ch.contentBlocks && ch.contentBlocks.length) return ch.contentBlocks;
    var defaults = PACK_CHAPTER_BLOCK_DEFAULTS[ch.module] || [];
    return defaults.map(function (d, i) {
      return Object.assign({}, d, { key: (ch.module || 'b') + '-' + i });
    });
  }

  function nextBlockKey(chapters) {
    var max = 0;
    (chapters || []).forEach(function (ch) {
      (ch.contentBlocks || []).forEach(function (b) {
        var n = parseInt(String(b.key || '').replace(/[^0-9]/g, '') || '0', 10);
        if (!isNaN(n) && n > max) max = n;
      });
    });
    return 'b' + (max + 1);
  }

  function getPackTplList(ctx) {
    return ctx.state.packTplList || JSON.parse(JSON.stringify(PACK_TPL_DATA));
  }

  function packTplStatusBadge(status) {
    if (status === 'published') return '<span class="bk-tag ok">已发布</span>';
    if (status === 'draft') return '<span class="bk-tag warn">编辑中</span>';
    return '<span class="bk-tag">停用</span>';
  }

  function packTplModuleLabel(mod) {
    for (var i = 0; i < PACK_TPL_MODULES.length; i++) {
      if (PACK_TPL_MODULES[i].value === mod) return PACK_TPL_MODULES[i].label;
    }
    return mod;
  }

  function renderPackTpl(ctx) {
    if (!assertAdmin(ctx)) return;
    var view = ctx.state.packTplView || 'list';
    if (view === 'detail') { renderPackTplDetail(ctx); return; }
    if (view === 'editor') { renderPackTplEditor(ctx); return; }
    renderPackTplList(ctx);
  }

  function renderPackTplList(ctx) {
    var list = getPackTplList(ctx);
    var defaults = ctx.state.packTplDefaults || JSON.parse(JSON.stringify(PACK_TPL_DEFAULTS_INIT));
    var rows = list.map(function (tpl) {
      var isDef = defaults[tpl.bizType] === tpl.id;
      var defMark = isDef ? ' <span class="bk-badge bk-badge-ok" style="font-size:10px">默认</span>' : '';
      var hint = '<div style="font-size:11px;color:#64748b;margin-top:2px">材料按业务类型匹配，需求按章节组件生成</div>';
      var builtMark = tpl.isBuiltin ? ' <span class="bk-badge bk-badge-built">出厂</span>' : '';
      var acts = '<button type="button" class="bk-btn-primary bk-btn" style="font-size:11px;padding:0 10px;height:26px" data-tpl-editor="' + esc(tpl.id) + '">进入配置</button> ';
      if (!isDef) {
        acts += '<button type="button" class="bk-btn" style="font-size:11px;padding:0 10px;height:26px" data-tpl-default="' + esc(tpl.id) + '">设为默认</button> ';
      }
      if (!tpl.isBuiltin) {
        acts += '<button type="button" class="bk-btn" style="font-size:11px;padding:0 10px;height:26px;color:#ef4444" data-tpl-del="' + esc(tpl.id) + '">删除</button>';
      }
      return (
        '<tr data-tpl-view="' + esc(tpl.id) + '">' +
        '<td class="l" style="padding-left:16px"><strong>' + esc(tpl.name) + '</strong>' + defMark + builtMark + hint + '</td>' +
        '<td class="c">' + esc(tpl.bizType) + '</td>' +
        '<td class="c">' + esc(tpl.version) + '</td>' +
        '<td class="c">' + packTplStatusBadge(tpl.status) + '</td>' +
        '<td class="c" style="white-space:nowrap">' + acts + '</td></tr>'
      );
    }).join('');
    ctx.rootEl.innerHTML =
      '<div style="height:100%;display:flex;flex-direction:column;overflow:hidden">' +
      '<h5 class="bk-page-heading">模版配置 · 决策会报告模板包</h5>' +
      '<div class="bk-page-card">' +
      '<div class="bk-filter-bar">' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkTplCreate" style="font-size:12px;padding:6px 12px">+ 基于标准模板创建</button>' +
      '<span style="font-size:12px;color:#64748b;margin-left:8px">模板名称不可重复；非默认可设为默认；出厂模板不可删除</span>' +
      '<div style="margin-left:auto;display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:12px;color:#94a3b8">共 ' + list.length + ' 条</span>' +
      '</div></div>' +
      '<div class="bk-content-scroll" style="overflow-x:auto">' +
      '<table class="bk-dt" style="min-width:800px">' +
      '<thead><tr>' +
      '<th class="l" style="padding-left:16px">模板包名称</th>' +
      '<th class="c">业务类型</th>' +
      '<th class="c">版本</th>' +
      '<th class="c">状态</th>' +
      '<th class="c">操作</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div class="bk-pagination-bar" style="justify-content:flex-start">' +
      '<span>每个业务类型仅一个默认模板；新建授信项目将锁定该模板</span>' +
      '</div></div></div>';
    ctx.rootEl.querySelectorAll('[data-tpl-view]').forEach(function (tr) {
      tr.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        ctx.setState({ packTplView: 'detail', packTplId: tr.getAttribute('data-tpl-view') });
        renderPackTpl(ctx);
      });
    });
    ctx.rootEl.querySelectorAll('[data-tpl-editor]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        ctx.setState({ packTplView: 'editor', packTplId: btn.getAttribute('data-tpl-editor'), packTplEditorChapter: -1, packTplEditorChapters: null });
        renderPackTpl(ctx);
      });
    });
    ctx.rootEl.querySelectorAll('[data-tpl-default]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-tpl-default');
        var found = list.filter(function (t) { return t.id === id; })[0];
        if (!found) return;
        var d = JSON.parse(JSON.stringify(defaults));
        d[found.bizType] = id;
        ctx.setState({ packTplDefaults: d });
        if (ctx.toast) ctx.toast('已设「' + found.bizType + '」默认模板');
        renderPackTpl(ctx);
      });
    });
    ctx.rootEl.querySelectorAll('[data-tpl-del]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-tpl-del');
        ctx.setState({ packTplList: list.filter(function (t) { return t.id !== id; }) });
        if (ctx.toast) ctx.toast('模板已删除');
        renderPackTpl(ctx);
      });
    });
    ctx.rootEl.querySelector('#bkTplCreate').addEventListener('click', function () {
      var base = JSON.parse(JSON.stringify(PACK_TPL_DATA[0]));
      var newId = 'dd-custom-' + list.length;
      var newTpl = { id: newId, name: '自定义调查报告（副本）', bizType: '对公授信', version: 'v1.0', isBuiltin: false, status: 'draft', chapters: base.chapters, updatedAt: '2026-07-20 10:00' };
      ctx.setState({ packTplList: [newTpl].concat(list), packTplView: 'editor', packTplId: newId, packTplEditorChapter: -1, packTplEditorChapters: null });
      renderPackTpl(ctx);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderPackTplDetail(ctx) {
    var list = getPackTplList(ctx);
    var id = ctx.state.packTplId;
    var tpl = list.filter(function (t) { return t.id === id; })[0] || list[0];
    if (!tpl) { renderPackTplList(ctx); return; }
    var chRows = tpl.chapters.map(function (ch) {
      return (
        '<tr><td class="c" style="width:48px;font-weight:600">' + ch.ch + '</td>' +
        '<td class="l">' + esc(ch.name) + '</td></tr>'
      );
    }).join('');
    ctx.rootEl.innerHTML =
      '<div style="height:100%;display:flex;flex-direction:column;overflow:hidden">' +
      '<div class="bk-tab-bar">' +
      '<button type="button" class="bk-btn-default" id="bkTplBack" style="margin-right:12px;padding:4px 10px;border:0;background:transparent;cursor:pointer;color:#64748b;font-size:14px">&#8592;</button>' +
      '<span id="bkTplDetailTitle" style="font-weight:600;font-size:13px;color:#334155;margin-right:auto">' + esc(tpl.name) + '</span>' +
      '<span style="font-size:12px;color:#94a3b8;margin-right:12px">' + esc(tpl.bizType) + ' · ' + esc(tpl.version) + ' · ' + tpl.chapters.length + ' 章</span>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkTplEnterEditor" style="font-size:12px;padding:6px 12px">进入配置</button>' +
      '</div>' +
      '<div class="bk-content-scroll" style="padding:16px">' +
      '<table class="bk-dt" style="min-width:400px">' +
      '<thead><tr><th class="c" style="width:48px">章</th><th class="l">章节名称</th></tr></thead>' +
      '<tbody>' + chRows + '</tbody></table>' +
      '</div></div>';
    ctx.rootEl.querySelector('#bkTplBack').addEventListener('click', function () {
      ctx.setState({ packTplView: 'list' });
      renderPackTpl(ctx);
    });
    ctx.rootEl.querySelector('#bkTplEnterEditor').addEventListener('click', function () {
      ctx.setState({ packTplView: 'editor', packTplEditorChapter: -1, packTplEditorChapters: null });
      renderPackTpl(ctx);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderPackTplEditor(ctx) {
    var list = getPackTplList(ctx);
    var id = ctx.state.packTplId;
    var tpl = list.filter(function (t) { return t.id === id; })[0] || list[0];
    if (!tpl) { renderPackTplList(ctx); return; }

    var paletteMode = ctx.state.packTplPaletteMode || 'structure';
    var chapters = ctx.state.packTplEditorChapters
      ? JSON.parse(JSON.stringify(ctx.state.packTplEditorChapters))
      : JSON.parse(JSON.stringify(tpl.chapters));
    var selChIdx = typeof ctx.state.packTplEditorChapter === 'number' ? ctx.state.packTplEditorChapter : -1;
    var selCh = selChIdx >= 0 && selChIdx < chapters.length ? chapters[selChIdx] : null;
    var selBlockKey = ctx.state.packTplSelectedBlockKey || null;

    // Seed contentBlocks for all chapters
    chapters.forEach(function (ch) {
      if (!ch.contentBlocks || !ch.contentBlocks.length) {
        ch.contentBlocks = getChapterBlocks(ch);
      }
    });

    // Find selected block
    var selBlock = null, selBlockChIdx = -1;
    if (selBlockKey) {
      for (var _ci = 0; _ci < chapters.length; _ci++) {
        var _cbs = chapters[_ci].contentBlocks || [];
        for (var _bi = 0; _bi < _cbs.length; _bi++) {
          if (_cbs[_bi].key === selBlockKey) { selBlock = _cbs[_bi]; selBlockChIdx = _ci; break; }
        }
        if (selBlock) break;
      }
    }

    function renderStructureTree() {
      var html = '<div style="padding:6px 8px 8px;border-bottom:1px solid #f1f5f9">' +
        '<button type="button" class="bk-btn-default" id="bkTreeImport" style="font-size:11px;width:100%;padding:5px 0">导入 Word 目录结构</button>' +
        '</div><div class="bk-cte-tree-list">';
      chapters.forEach(function (ch, i) {
        var isActive = i === selChIdx;
        html += (
          '<div class="bk-cte-tree-item bk-cte-tree-l1' + (isActive ? ' active' : '') + '" data-tree-ch="' + i + '">' +
          '<span style="flex-shrink:0;width:22px;height:22px;background:' + (isActive ? '#eff6ff' : '#f1f5f9') + ';color:' + (isActive ? '#1a66ff' : '#64748b') + ';border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-right:2px">' + ch.ch + '</span>' +
          '<span class="bk-cte-tree-label">' + esc(ch.name) + '</span>' +
          '<span class="bk-cte-tree-acts">' +
          (chapters.length > 1 ? '<button type="button" class="bk-cte-tree-act" data-tree-ch-del="' + i + '" title="删除章节">×</button>' : '') +
          '</span>' +
          '</div>'
        );
      });
      html += '</div><div class="bk-cte-tree-add-root" id="bkTreeAddCh">+ 添加章节</div>';
      return html;
    }

    function renderModulesPalette() {
      var groups = {}, groupOrder = [];
      PACK_CONTENT_PALETTE.forEach(function (item) {
        if (!groups[item.group]) { groups[item.group] = []; groupOrder.push(item.group); }
        groups[item.group].push(item);
      });
      var html = '<p class="bk-cte-hint">双击组件插入当前章节</p>';
      groupOrder.forEach(function (grpName) {
        html += '<div class="bk-cte-palette-group-title">' + esc(grpName) + '</div>';
        groups[grpName].forEach(function (item) {
          var modeTag = item.authoringMode === 'ai_write' ? 'AI' : '人工';
          var modeBg = item.authoringMode === 'ai_write' ? 'background:#dbeafe;color:#1d4ed8' : 'background:#f1f5f9;color:#475569';
          html += (
            '<div class="bk-cte-palette-item" data-palette-type="' + esc(item.type) + '" data-palette-mode="' + esc(item.authoringMode) + '" data-palette-label="' + esc(item.label) + '">' +
            esc(item.label) +
            '<span style="display:inline-flex;margin-left:6px;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600;' + modeBg + '">' + modeTag + '</span>' +
            '</div>'
          );
        });
      });
      return html;
    }

    function renderCanvas() {
      if (selChIdx < 0 || !selCh) {
        return '<div class="bk-cte-empty">← 点击左侧章节查看内容组件</div>';
      }
      var blocks = selCh.contentBlocks || [];
      var out = (
        '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px 10px 0 0;border-bottom:none;padding:12px 16px;display:flex;align-items:center;gap:10px">' +
        '<span style="flex-shrink:0;width:28px;height:28px;border-radius:6px;background:#eff6ff;color:#1a66ff;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">' + selCh.ch + '</span>' +
        '<span style="font-size:15px;font-weight:700;color:#0f172a">' + esc(selCh.name) + '</span>' +
        '<span style="font-size:11px;color:#94a3b8;margin-left:4px">' + esc(packTplModuleLabel(selCh.module)) + '</span>' +
        '</div>' +
        '<div class="bk-cte-blocks" style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;margin-bottom:16px">'
      );
      out += '<div class="bk-cte-insert-slot" data-slot-before="0">＋ 插入</div>';
      blocks.forEach(function (b, bi) {
        var isAi = b.authoringMode !== 'human_write';
        var badgeCls = isAi ? 'ai' : 'human';
        var modeLabel = isAi ? 'AI 生成' : '人工填写';
        var typeLabel = BLOCK_TYPE_LABELS[b.type] || b.type;
        var displayLabel = b.text || b.label || typeLabel;
        var isSelBlock = selBlockKey && b.key === selBlockKey;
        out += (
          '<div class="bk-cte-block' + (isSelBlock ? ' selected' : '') + (b.type === 'heading' ? ' bk-cte-block-heading' : '') + '" data-block-key="' + esc(b.key) + '">' +
          '<span class="bk-cte-block-badge ' + badgeCls + '">' + typeLabel + '</span> ' +
          '<span style="font-size:12px;color:#334155;font-weight:' + (b.type === 'heading' ? '700' : '400') + '">' + esc(displayLabel) + '</span>' +
          '<span class="bk-cte-block-badge ' + badgeCls + '" style="margin-left:6px">' + modeLabel + '</span>' +
          '<div class="bk-cte-block-acts">' +
          (bi > 0 ? '<button type="button" data-block-up="' + esc(b.key) + '" title="上移">↑</button>' : '') +
          (bi < blocks.length - 1 ? '<button type="button" data-block-down="' + esc(b.key) + '" title="下移">↓</button>' : '') +
          '<button type="button" data-block-del="' + esc(b.key) + '" title="删除">×</button>' +
          '</div>' +
          (b.writingBrief ? '<div class="bk-cte-block-brief">' + esc(b.writingBrief) + '</div>' : '') +
          '</div>'
        );
        out += '<div class="bk-cte-insert-slot" data-slot-before="' + (bi + 1) + '">＋ 插入</div>';
      });
      out += '</div>';
      return out;
    }

    function renderRightPanel() {
      if (selBlock) {
        var ownerCh = selBlockChIdx >= 0 ? chapters[selBlockChIdx] : null;
        var isAi = selBlock.authoringMode !== 'human_write';
        return (
          '<div class="bk-cte-panel-title" style="font-size:12px">内容组件属性</div>' +
          (ownerCh ? '<div class="bk-cte-owner-banner">所属：第 ' + ownerCh.ch + ' 章 · ' + esc(ownerCh.name) + '</div>' : '') +
          '<div style="padding:12px">' +
          '<div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">生成方式</div>' +
          '<div class="bk-cte-gen-method-grid">' +
          '<div class="bk-cte-gen-method-opt' + (isAi ? ' active' : '') + '" data-gen-method="ai_write">' +
          '<div style="text-align:center"><div style="font-size:12px;font-weight:600">AI 生成</div><div style="font-size:10px;color:#64748b;margin-top:2px">自动撰写</div></div>' +
          '</div>' +
          '<div class="bk-cte-gen-method-opt' + (!isAi ? ' active' : '') + '" data-gen-method="human_write">' +
          '<div style="text-align:center"><div style="font-size:12px;font-weight:600">人工填写</div><div style="font-size:10px;color:#64748b;margin-top:2px">手动录入</div></div>' +
          '</div>' +
          '</div>' +
          '<div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-top:14px;margin-bottom:6px">写作指令</div>' +
          '<textarea id="bkBlockBrief" rows="4" style="width:100%;resize:vertical;font-size:12px;padding:6px 8px;border:1px solid #e2e8f0;border-radius:4px;font-family:inherit;box-sizing:border-box">' + esc(selBlock.writingBrief || '') + '</textarea>' +
          (isAi ? '<div class="bk-cte-field-hint">写作指令作为 AI prompt 补充，描述期望输出内容。</div>' : '') +
          '<div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-top:14px;margin-bottom:6px">必填</div>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" id="bkBlockRequired"' + (selBlock.required ? ' checked' : '') + ' /> 该组件为必填项</label>' +
          '<button type="button" class="bk-btn-primary bk-btn" id="bkBlockSave" style="width:100%;margin-top:16px;font-size:12px">保存</button>' +
          '</div>'
        );
      }
      if (selCh) {
        return (
          '<div class="bk-cte-panel-title" style="font-size:12px">章节属性</div>' +
          '<div class="bk-cte-form">' +
          '<div><label style="font-size:11px;font-weight:600;color:#374151;display:block;margin-bottom:4px">章节名称</label>' +
          '<input type="text" class="bk-search" id="bkChName" value="' + esc(selCh.name) + '" style="width:100%;box-sizing:border-box" /></div>' +
          '<div><label style="font-size:11px;font-weight:600;color:#374151;display:block;margin-bottom:4px">内容模块</label>' +
          '<select id="bkChModule" style="width:100%;height:32px;border:1px solid var(--xb-line,#e8ecf0);border-radius:4px;padding:0 8px;font-size:12px">' +
          PACK_TPL_MODULES.map(function (m) {
            return '<option value="' + m.value + '"' + (selCh.module === m.value ? ' selected' : '') + '>' + m.label + '</option>';
          }).join('') +
          '</select></div>' +
          '<div><label style="font-size:11px;font-weight:600;color:#374151;display:block;margin-bottom:4px">数据来源</label>' +
          '<input type="text" class="bk-search" id="bkChSource" value="' + esc(selCh.dataSource || '') + '" style="width:100%;box-sizing:border-box" /></div>' +
          '<button type="button" class="bk-btn-primary bk-btn" id="bkChSave" style="width:100%;font-size:12px">保存章节</button>' +
          '</div>'
        );
      }
      return '<div class="bk-cte-empty">← 点击章节或组件<br>查看属性</div>';
    }

    var statusCls = tpl.status === 'published' ? 'bk-cte-status' : 'bk-cte-status-draft';
    var statusLabel = tpl.status === 'published' ? '已发布' : '草稿';

    ctx.rootEl.innerHTML =
      '<div style="height:100%;display:flex;flex-direction:column;overflow:hidden">' +
      '<div class="bk-cte-topbar">' +
      '<button type="button" class="bk-btn-default" id="bkEdBack" style="font-size:12px">&#8592; 返回列表</button>' +
      '<span class="bk-cte-top-title">' + esc(tpl.name) + '</span>' +
      '<span class="' + statusCls + '">' + statusLabel + '</span>' +
      '<div class="bk-cte-top-actions">' +
      '<span style="font-size:11px;color:#64748b;white-space:nowrap">材料类型与需求 · 自动匹配</span>' +
      (!tpl.isBuiltin ? '<button type="button" class="bk-btn-default" id="bkEdReset" style="font-size:12px">恢复出厂</button>' : '') +
      '<button type="button" class="bk-btn-default" id="bkEdSave" style="font-size:12px">保存</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkEdPublish" style="font-size:12px">测试并发布</button>' +
      '</div></div>' +
      '<div class="bk-cte-panel">' +
      '<div class="bk-cte-col bk-cte-col-palette">' +
      '<div class="bk-cte-ptabs">' +
      '<button type="button" class="bk-cte-ptab' + (paletteMode === 'structure' ? ' active' : '') + '" data-ptab="structure">报告结构</button>' +
      '<button type="button" class="bk-cte-ptab' + (paletteMode === 'modules' ? ' active' : '') + '" data-ptab="modules">内容模块</button>' +
      '</div>' +
      '<div class="bk-cte-scroll">' +
      (paletteMode === 'structure' ? renderStructureTree() : renderModulesPalette()) +
      '</div></div>' +
      '<div class="bk-cte-col bk-cte-col-canvas">' +
      '<div class="bk-cte-col-head bk-cte-canvas-head">' +
      '<span>' + esc(tpl.name) + ' · 内容画布</span>' +
      '<span class="bk-cte-canvas-hint">选章节 → 查看组件</span>' +
      '</div>' +
      '<div class="bk-cte-canvas-scroll">' + renderCanvas() + '</div>' +
      '</div>' +
      '<div class="bk-cte-col bk-cte-col-right">' +
      '<div class="bk-cte-col-head">组件属性</div>' +
      '<div class="bk-cte-scroll">' + renderRightPanel() + '</div>' +
      '</div>' +
      '</div></div>';

    // Palette tabs
    ctx.rootEl.querySelectorAll('[data-ptab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ packTplPaletteMode: btn.getAttribute('data-ptab') });
        renderPackTplEditor(ctx);
      });
    });

    // Tree: click chapter
    ctx.rootEl.querySelectorAll('[data-tree-ch]').forEach(function (node) {
      node.addEventListener('click', function (e) {
        if (e.target.closest('[data-tree-ch-del]')) return;
        var i = parseInt(node.getAttribute('data-tree-ch'), 10);
        ctx.setState({ packTplEditorChapter: i, packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplSelectedBlockKey: null });
        renderPackTplEditor(ctx);
      });
    });

    // Tree: delete chapter
    ctx.rootEl.querySelectorAll('[data-tree-ch-del]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var i = parseInt(btn.getAttribute('data-tree-ch-del'), 10);
        chapters.splice(i, 1);
        for (var j = 0; j < chapters.length; j++) { chapters[j].ch = j + 1; }
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplEditorChapter: -1, packTplSelectedBlockKey: null });
        if (ctx.toast) ctx.toast('章节已删除');
        renderPackTplEditor(ctx);
      });
    });

    // Tree: import word (stub)
    var importBtn = ctx.rootEl.querySelector('#bkTreeImport');
    if (importBtn) {
      importBtn.addEventListener('click', function () {
        if (ctx.toast) ctx.toast('导入 Word 目录（示意功能）');
      });
    }

    // Tree: add chapter
    var addChBtn = ctx.rootEl.querySelector('#bkTreeAddCh');
    if (addChBtn) {
      addChBtn.addEventListener('click', function () {
        var newCh = { ch: chapters.length + 1, name: '新章节', module: 'entity', entry: '', dataSource: '', contentBlocks: [] };
        chapters.push(newCh);
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplEditorChapter: chapters.length - 1, packTplSelectedBlockKey: null });
        renderPackTplEditor(ctx);
      });
    }

    // Palette: double-click to insert block into selected chapter
    ctx.rootEl.querySelectorAll('[data-palette-type]').forEach(function (item) {
      item.addEventListener('dblclick', function () {
        if (selChIdx < 0) { if (ctx.toast) ctx.toast('请先在左侧选择章节'); return; }
        var newBlock = {
          type: item.getAttribute('data-palette-type'),
          label: item.getAttribute('data-palette-label'),
          authoringMode: item.getAttribute('data-palette-mode'),
          writingBrief: '',
          key: nextBlockKey(chapters)
        };
        if (!chapters[selChIdx].contentBlocks) chapters[selChIdx].contentBlocks = [];
        chapters[selChIdx].contentBlocks.push(newBlock);
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplSelectedBlockKey: newBlock.key });
        renderPackTplEditor(ctx);
      });
    });

    // Canvas: click block
    ctx.rootEl.querySelectorAll('[data-block-key]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-block-up],[data-block-down],[data-block-del]')) return;
        ctx.setState({ packTplSelectedBlockKey: card.getAttribute('data-block-key'), packTplEditorChapters: JSON.parse(JSON.stringify(chapters)) });
        renderPackTplEditor(ctx);
      });
    });

    function findBlockIdx(blocks, key) {
      for (var x = 0; x < blocks.length; x++) { if (blocks[x].key === key) return x; }
      return -1;
    }

    ctx.rootEl.querySelectorAll('[data-block-up]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var key = btn.getAttribute('data-block-up');
        var blocks = chapters[selChIdx].contentBlocks;
        var idx = findBlockIdx(blocks, key);
        if (idx <= 0) return;
        var tmp = blocks[idx]; blocks[idx] = blocks[idx - 1]; blocks[idx - 1] = tmp;
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplSelectedBlockKey: key });
        renderPackTplEditor(ctx);
      });
    });

    ctx.rootEl.querySelectorAll('[data-block-down]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var key = btn.getAttribute('data-block-down');
        var blocks = chapters[selChIdx].contentBlocks;
        var idx = findBlockIdx(blocks, key);
        if (idx < 0 || idx >= blocks.length - 1) return;
        var tmp = blocks[idx]; blocks[idx] = blocks[idx + 1]; blocks[idx + 1] = tmp;
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplSelectedBlockKey: key });
        renderPackTplEditor(ctx);
      });
    });

    ctx.rootEl.querySelectorAll('[data-block-del]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var key = btn.getAttribute('data-block-del');
        if (selChIdx >= 0) {
          chapters[selChIdx].contentBlocks = (chapters[selChIdx].contentBlocks || []).filter(function (b) { return b.key !== key; });
        }
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplSelectedBlockKey: null });
        if (ctx.toast) ctx.toast('组件已删除');
        renderPackTplEditor(ctx);
      });
    });

    // Canvas: insert slot
    ctx.rootEl.querySelectorAll('[data-slot-before]').forEach(function (slot) {
      slot.addEventListener('click', function () {
        if (selChIdx < 0) return;
        var before = parseInt(slot.getAttribute('data-slot-before'), 10);
        var newBlock = { type: 'text', label: '文本段落', authoringMode: 'ai_write', writingBrief: '', key: nextBlockKey(chapters) };
        if (!chapters[selChIdx].contentBlocks) chapters[selChIdx].contentBlocks = [];
        chapters[selChIdx].contentBlocks.splice(before, 0, newBlock);
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)), packTplSelectedBlockKey: newBlock.key });
        renderPackTplEditor(ctx);
      });
    });

    // Right: gen method toggle
    ctx.rootEl.querySelectorAll('[data-gen-method]').forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (!selBlockKey) return;
        var method = opt.getAttribute('data-gen-method');
        chapters.forEach(function (ch) {
          (ch.contentBlocks || []).forEach(function (b) {
            if (b.key === selBlockKey) b.authoringMode = method;
          });
        });
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)) });
        renderPackTplEditor(ctx);
      });
    });

    // Right: block save
    var blockSaveBtn = ctx.rootEl.querySelector('#bkBlockSave');
    if (blockSaveBtn) {
      blockSaveBtn.addEventListener('click', function () {
        var briefEl = ctx.rootEl.querySelector('#bkBlockBrief');
        var reqEl = ctx.rootEl.querySelector('#bkBlockRequired');
        chapters.forEach(function (ch) {
          (ch.contentBlocks || []).forEach(function (b) {
            if (b.key === selBlockKey) {
              if (briefEl) b.writingBrief = briefEl.value;
              if (reqEl) b.required = reqEl.checked;
            }
          });
        });
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)) });
        if (ctx.toast) ctx.toast('组件属性已保存');
        renderPackTplEditor(ctx);
      });
    }

    // Right: chapter save
    var chSaveBtn = ctx.rootEl.querySelector('#bkChSave');
    if (chSaveBtn) {
      chSaveBtn.addEventListener('click', function () {
        var nameEl = ctx.rootEl.querySelector('#bkChName');
        var modEl = ctx.rootEl.querySelector('#bkChModule');
        var srcEl = ctx.rootEl.querySelector('#bkChSource');
        if (nameEl) chapters[selChIdx].name = nameEl.value;
        if (modEl) chapters[selChIdx].module = modEl.value;
        if (srcEl) chapters[selChIdx].dataSource = srcEl.value;
        for (var j = 0; j < chapters.length; j++) { chapters[j].ch = j + 1; }
        ctx.setState({ packTplEditorChapters: JSON.parse(JSON.stringify(chapters)) });
        if (ctx.toast) ctx.toast('章节已更新');
        renderPackTplEditor(ctx);
      });
    }

    // Topbar
    ctx.rootEl.querySelector('#bkEdBack').addEventListener('click', function () {
      ctx.setState({ packTplView: 'list', packTplEditorChapters: null, packTplSelectedBlockKey: null });
      renderPackTpl(ctx);
    });
    ctx.rootEl.querySelector('#bkEdSave').addEventListener('click', function () {
      var cur = getPackTplList(ctx);
      ctx.setState({
        packTplList: cur.map(function (t) { return t.id === tpl.id ? Object.assign({}, t, { chapters: JSON.parse(JSON.stringify(chapters)) }) : t; }),
        packTplEditorChapters: null
      });
      if (ctx.toast) ctx.toast('模板已保存');
    });
    ctx.rootEl.querySelector('#bkEdPublish').addEventListener('click', function () {
      var cur = getPackTplList(ctx);
      ctx.setState({
        packTplList: cur.map(function (t) { return t.id === tpl.id ? Object.assign({}, t, { chapters: JSON.parse(JSON.stringify(chapters)), status: 'published' }) : t; }),
        packTplEditorChapters: null,
        packTplView: 'list'
      });
      if (ctx.toast) ctx.toast('已测试并发布（示意）');
      renderPackTpl(ctx);
    });
    var resetBtn = ctx.rootEl.querySelector('#bkEdReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var base = PACK_TPL_DATA.filter(function (t) { return t.id === tpl.id; })[0];
        var resetChapters = base ? JSON.parse(JSON.stringify(base.chapters)) : JSON.parse(JSON.stringify(tpl.chapters));
        ctx.setState({ packTplEditorChapters: resetChapters, packTplEditorChapter: -1, packTplSelectedBlockKey: null });
        if (ctx.toast) ctx.toast('已恢复出厂章节（示意）');
        renderPackTplEditor(ctx);
      });
    }
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderPackCredit(ctx) {
    var chapters = ctx.state.packChapters || [
      { name: '1 客户基本情况', status: '已生成', pct: 100 },
      { name: '2 受益所有人与控制关系', status: '生成中', pct: 60 },
      { name: '3 财务分析', status: '待材料', pct: 20 },
      { name: '4 风险与合规事项', status: '草稿', pct: 40 },
      { name: '5 调查结论', status: '未开始', pct: 0 }
    ];
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      packChrome('授信章节列表', ctx) +
      '<div class="bk-body"><div class="bk-panel"><div class="bk-row-actions" style="justify-content:space-between;margin-bottom:10px">' +
      '<h3 style="margin:0">某科技 · 客户调查报告</h3>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkGenAll">一键生成缺失章</button></div>' +
      '<div id="bkChapters"></div></div>' +
      '<div class="bk-row-actions"><button type="button" class="bk-btn" data-nav="pack/assemble">去汇编导出</button></div></div></div>';
    function paint() {
      ctx.rootEl.querySelector('#bkChapters').innerHTML = chapters
        .map(function (ch, i) {
          return (
            '<div class="bk-mat"><div style="flex:1"><div><strong>' +
            esc(ch.name) +
            '</strong> <span class="bk-tag ' +
            (ch.status === '已生成' ? 'ok' : ch.status === '待材料' ? 'warn' : 'dd') +
            '">' +
            esc(ch.status) +
            '</span></div><div class="bk-bar"><i style="width:' +
            esc(ch.pct) +
            '%"></i></div></div>' +
            '<button type="button" class="bk-btn" data-gen="' +
            i +
            '">生成 / 刷新</button></div>'
          );
        })
        .join('');
      ctx.rootEl.querySelectorAll('[data-gen]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = Number(btn.getAttribute('data-gen'));
          chapters[i].status = '已生成';
          chapters[i].pct = 100;
          ctx.setState({ packChapters: chapters });
          paint();
          ctx.toast('章节「' + chapters[i].name + '」已生成');
        });
      });
    }
    paint();
    ctx.rootEl.querySelector('#bkGenAll').addEventListener('click', function () {
      chapters = chapters.map(function (ch) {
        return { name: ch.name, status: '已生成', pct: 100 };
      });
      ctx.setState({ packChapters: chapters });
      paint();
      ctx.toast('全部章节已生成（示意）');
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderPackAssemble(ctx) {
    var ok = !!ctx.state.packAssembled;
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      packChrome('汇编导出', ctx) +
      '<div class="bk-body">' +
      (ok
        ? '<div class="bk-panel bk-success"><div class="big">✓</div><h2 style="margin:0 0 8px;color:var(--xb-brand,#0d2e4b)">汇编导出成功</h2>' +
          '<p class="bk-muted">已生成《某科技_客户调查报告_20260718.docx》（示意）</p>' +
          '<div class="bk-row-actions" style="justify-content:center;margin-top:16px">' +
          '<button type="button" class="bk-btn-primary bk-btn" id="bkDl">下载 Word</button>' +
          '<button type="button" class="bk-btn" data-nav="enterprise/cust-huacheng">返回企业档案</button>' +
          '<button type="button" class="bk-btn" id="bkResetAsm">重新汇编</button></div></div>'
        : '<div class="bk-panel"><h3>选择汇编范围</h3>' +
          '<label class="bk-mat"><span>包含全部已启用章节</span><input type="checkbox" checked disabled /></label>' +
          '<label class="bk-mat"><span>附受益所有人识别表</span><input type="checkbox" id="bkIncUbo" checked /></label>' +
          '<label class="bk-mat"><span>附 BOMIS 核验摘要</span><input type="checkbox" id="bkIncBomis" checked /></label>' +
          '<div class="bk-row-actions" style="margin-top:14px"><button type="button" class="bk-btn-primary bk-btn" id="bkDoAsm">开始汇编</button></div></div>') +
      '</div></div>';
    var doBtn = ctx.rootEl.querySelector('#bkDoAsm');
    if (doBtn) {
      doBtn.addEventListener('click', function () {
        ctx.setState({ packAssembled: true });
        ctx.toast('汇编完成');
        renderPackAssemble(ctx);
      });
    }

    var dl = ctx.rootEl.querySelector('#bkDl');
    if (dl) {
      dl.addEventListener('click', function () {
        ctx.toast('开始下载 Word（示意）');
      });
    }
    var reset = ctx.rootEl.querySelector('#bkResetAsm');
    if (reset) {
      reset.addEventListener('click', function () {
        ctx.setState({ packAssembled: false });
        renderPackAssemble(ctx);
      });
    }
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— Settings —— */
  function renderSettings(ctx) {
    var mode = ctx.state.mode || ctx.mode || 'bank';
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      '<div class="bk-toolbar"><h1>个人中心</h1><div class="spacer"></div>' +
      '<button type="button" class="bk-btn" data-nav="home">返回首页</button></div>' +
      '<div class="bk-body" style="max-width:560px">' +
      '<div class="bk-panel"><h3>工作区模式</h3>' +
      '<p class="bk-muted">切换后首页与侧栏用语随之变化。当前：<strong>' +
      (mode === 'bank' ? '银行 · 授信尽调' : 'PE · 投资工作台') +
      '</strong></p>' +
      '<div class="bk-pill-toggle" style="margin-top:12px">' +
      '<button type="button" class="' +
      (mode === 'pe' ? 'on' : '') +
      '" id="bkModePe">PE 投资</button>' +
      '<button type="button" class="' +
      (mode === 'bank' ? 'on' : '') +
      '" id="bkModeBank">银行授信</button></div></div>' +
      '<div class="bk-panel"><h3>显示名</h3>' +
      '<p class="bk-muted">只读，由机构开通时写入。当前：<strong>' +
      esc(ctx.state.displayName || '王敏') +
      '</strong></p></div>' +
      '</div></div>';
    ctx.rootEl.querySelector('#bkModePe').addEventListener('click', function () {
      ctx.setState({ mode: 'pe' });
      ctx.toast('已切换为 PE 投资工作台');
      ctx.navigate('home');
    });
    ctx.rootEl.querySelector('#bkModeBank').addEventListener('click', function () {
      ctx.setState({ mode: 'bank' });
      ctx.toast('已切换为银行授信');
      ctx.navigate('home');
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function assertAdmin(ctx) {
    return true;
  }

  /** 配置页内容区：导航用外层侧栏，页内不再套第二层菜单 */
  function adminConfigShell(ctx, active, title, bodyHtml) {
    return (
      '<div class="bk-page" style="height:100%;display:flex;flex-direction:column;overflow:hidden">' +
      '<div class="bk-toolbar" style="flex-shrink:0"><h1>' +
      esc(title) +
      '</h1><div class="spacer"></div>' +
      '<span class="bk-tag dd">配置</span>' +
      '<button type="button" class="bk-btn" data-nav="home">回首页</button></div>' +
      '<div class="bk-body xb-overlay-scrollbar" style="flex:1;overflow:auto;padding:16px 20px">' +
      bodyHtml +
      '</div></div>'
    );
  }

  function renderCoworkAdminPage(ctx, route, title, bodyHtml) {
    if (!assertAdmin(ctx)) return;
    ctx.rootEl.innerHTML = adminConfigShell(ctx, route, title, bodyHtml);
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderConfigFrameworks(ctx) {
    renderCoworkAdminPage(
      ctx,
      'config/frameworks',
      '分析框架',
      '<div class="bk-panel"><h3>分析框架（示意 · Cowork cfg-frameworks）</h3>' +
        '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>框架</th><th>适用</th><th>状态</th></tr></thead><tbody>' +
        '<tr><td>对公授信 · 五维尽调</td><td>银行授信</td><td><span class="bk-tag ok">默认</span></td></tr>' +
        '<tr><td>PE 初筛 · 红旗清单</td><td>投资初筛</td><td><span class="bk-tag ok">启用</span></td></tr>' +
        '<tr><td>贸易背景 · 交易链核查</td><td>贸易融资</td><td><span class="bk-tag dd">草稿</span></td></tr>' +
        '</tbody></table></div></div>'
    );
  }

  function renderConfigRisk(ctx) {
    renderCoworkAdminPage(
      ctx,
      'config/risk',
      '风险规则',
      '<div class="bk-panel"><h3>风险识别规则（示意 · Cowork cfg-risk）</h3>' +
        '<p class="bk-muted">公开面 / 合规红旗规则。财报同比勾稽见「财务配置」。</p>' +
        '<div class="bk-mat"><div><strong>失信 / 限高命中</strong></div><span class="bk-tag danger">高</span></div>' +
        '<div class="bk-mat"><div><strong>近 12 月重大处罚</strong></div><span class="bk-tag warn">中</span></div>' +
        '<div class="bk-mat"><div><strong>股权频繁变更</strong></div><span class="bk-tag dd">关注</span></div></div>'
    );
  }

  function renderSysRoles(ctx) {
    renderCoworkAdminPage(
      ctx,
      'sys/roles',
      '用户与角色',
      '<div class="bk-panel"><h3>用户与角色（示意 · Cowork sys-roles）</h3>' +
        '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>用户</th><th>角色</th><th>可见</th></tr></thead><tbody>' +
        '<tr><td>王敏</td><td>普通用户</td><td>工作台三栏 · 无配置</td></tr>' +
        '<tr><td>系统管理员</td><td>管理员</td><td>授信配置 + 分析框架/风险规则 + 系统管理</td></tr>' +
        '</tbody></table></div>' +
        '<p class="bk-muted" style="margin-top:12px">以下切换仅 Demo 预览，不进正式产品。</p></div>'
    );
  }

  function renderSysDatasources(ctx) {
    renderCoworkAdminPage(
      ctx,
      'sys/datasources',
      '数据源管理',
      '<div class="bk-panel"><h3>数据源管理（示意 · Cowork sys-datasources）</h3>' +
        '<div class="bk-mat"><div><strong>财跃启明星 / 公开面</strong><div class="bk-muted">工商 · 司法 · 知产</div></div><span class="bk-tag ok">已接</span></div>' +
        '<div class="bk-mat"><div><strong>OCR / 财报表格引擎</strong><div class="bk-muted">扫描件结构化</div></div><span class="bk-tag ok">已接</span></div>' +
        '<div class="bk-mat"><div><strong>内部授信主数据</strong><div class="bk-muted">客户号映射</div></div><span class="bk-tag dd">规划</span></div></div>'
    );
  }

  function renderSysLogs(ctx) {
    renderCoworkAdminPage(
      ctx,
      'sys/logs',
      '操作日志',
      '<div class="bk-panel"><h3>操作日志（示意 · Cowork sys-logs）</h3>' +
        '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>时间</th><th>操作者</th><th>动作</th></tr></thead><tbody>' +
        '<tr><td>2026-07-20 10:12</td><td>管理员</td><td>发布报告模版 v1.2.0</td></tr>' +
        '<tr><td>2026-07-19 16:40</td><td>王敏</td><td>导出某科技尽调报告 Word</td></tr>' +
        '<tr><td>2026-07-19 15:02</td><td>管理员</td><td>切换角色预览客经端</td></tr>' +
        '</tbody></table></div></div>'
    );
  }

  function renderConfigFinance(ctx) {
    if (!assertAdmin(ctx)) return;
    /* 与 PE 共用同一套财务配置页（科目 / 指标 / 规则） */
    if (window.PEPages && typeof window.PEPages.render === 'function') {
      window.PEPages.render('finance-config', ctx);
      return;
    }
    ctx.rootEl.innerHTML =
      '<div class="bk-page"><div class="bk-toolbar"><h1>财务配置</h1></div>' +
      '<div class="bk-body"><p class="bk-muted">PE 财务配置模块未加载。</p></div></div>';
  }

  function renderMissingCase(ctx, id) {
    ctx.rootEl.innerHTML =
      '<div class="bk-page"><div class="bk-toolbar"><h1>案件不存在</h1></div>' +
      '<div class="bk-body"><p class="bk-muted">未找到案件「' +
      esc(id) +
      '」。</p>' +
      '<button type="button" class="bk-btn-primary bk-btn" data-nav="cases">返回案件库</button></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function parseCaseRoute(route) {
    var parts = route.split('/');
    if (parts[0] !== 'case' || !parts[1]) return null;
    return { id: parts[1], sub: parts[2] || '' };
  }

  function render(route, ctx) {
    ensureStyles(ctx.rootEl);
    route = (route || 'home').replace(/^\//, '');

    /* AML 案件页已下线：旧 hash 一律落到企业档案 */
    if (route === 'cases' || route.indexOf('case/') === 0) {
      ctx.toast('AML 案件页已下线，请用企业档案');
      var caseId = (route.split('/')[1] || '').replace(/^case-/, '');
      var entMap = {
        huacheng: 'cust-huacheng',
        mingda: 'cust-mingda',
        haihe: 'cust-haihe'
      };
      var ent = entMap[caseId] || 'cust-huacheng';
      ctx.navigate(route === 'cases' ? 'enterprises' : 'enterprise/' + ent);
      return;
    }

    if (window.BankIaPages && typeof window.BankIaPages.render === 'function') {
      if (window.BankIaPages.render(route, ctx)) {
        return;
      }
    }

    /* 项目动态 / 企业动态 */
    if (
      window.BankMonitorPages &&
      typeof window.BankMonitorPages.render === 'function' &&
      window.BankMonitorPages.render(route, ctx)
    ) {
      return;
    }

    /* 报告任务工作区：#bank:task/{id} · /draft */
    if (
      window.BankReportTaskPages &&
      typeof window.BankReportTaskPages.render === 'function' &&
      window.BankReportTaskPages.render(route, ctx)
    ) {
      return;
    }

    /* IA v1.3 项目壳：home / enterprises / project/* / pack/ocr→右区 */
    if (
      window.BankProjectPages &&
      typeof window.BankProjectPages.render === 'function' &&
      window.BankProjectPages.render(route, ctx)
    ) {
      return;
    }

    if (window.BankProjectPages && typeof window.BankProjectPages.resetRootLayout === 'function') {
      window.BankProjectPages.resetRootLayout(ctx);
    }

    if (route === '' || route === 'home') {
      renderHome(ctx);
      return;
    }
    if (route === 'stock') {
      renderStock(ctx);
      return;
    }
    if (route === 'pack') {
      renderPackHub(ctx);
      return;
    }
    if (route === 'pack/ocr') {
      renderPackOcr(ctx);
      return;
    }
    if (route === 'config/anomaly' || route === 'pack/finance-analysis') {
      ctx.toast('异动模型配置已移除');
      ctx.navigate('finance-config');
      return;
    }
    if (route === 'config/finance' || route === 'finance-config') {
      renderConfigFinance(ctx);
      return;
    }
    if (route === 'config/hub' || route === 'config/components' || route === 'config/ai' || route === 'config/versions') {
      ctx.toast('该配置项已移除');
      ctx.navigate('pack/tpl');
      return;
    }
    if (route === 'config/frameworks') {
      renderConfigFrameworks(ctx);
      return;
    }
    if (route === 'config/risk') {
      renderConfigRisk(ctx);
      return;
    }
    if (route === 'sys/roles') {
      renderSysRoles(ctx);
      return;
    }
    if (route === 'sys/datasources') {
      renderSysDatasources(ctx);
      return;
    }
    if (route === 'sys/logs') {
      renderSysLogs(ctx);
      return;
    }
    if (route === 'pack/materials-types') {
      renderPackMaterials(ctx);
      return;
    }
    if (route === 'pack/tpl') {
      renderPackTpl(ctx);
      return;
    }
    if (route === 'pack/credit') {
      if (!assertAdmin(ctx)) return;
      renderPackCredit(ctx);
      return;
    }
    if (route === 'pack/assemble') {
      if (!assertAdmin(ctx)) return;
      renderPackAssemble(ctx);
      return;
    }
    if (route === 'settings') {
      renderSettings(ctx);
      return;
    }

    /* 旧 case 路由已在入口处重定向，不再渲染案件工作台 */
    if (parseCaseRoute(route)) {
      ctx.toast('AML 案件页已下线，请用企业档案');
      ctx.navigate('enterprises');
      return;
    }

    ctx.rootEl.innerHTML =
      '<div class="bk-page"><div class="bk-toolbar"><h1>未识别路由</h1></div>' +
      '<div class="bk-body"><p class="bk-muted">' +
      esc(route) +
      '</p><button type="button" class="bk-btn" data-nav="home">回首页</button></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  window.BankPages = { render: render };
})();
