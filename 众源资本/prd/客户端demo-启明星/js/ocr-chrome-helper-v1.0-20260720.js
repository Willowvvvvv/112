/**
 * 财报 OCR 共用 chrome：四角展开全屏 + 左侧菜单折叠
 * PE / 银行 OCR 行为一致；状态仅会话内
 */
(function () {
  'use strict';

  var state = {
    fullscreen: false,
    sidebarCollapsed: false,
    bound: false
  };

  function iconExpand() {
    /* 四角外展 · 对齐附图 */
    return (
      '<svg class="xb-ocr-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">' +
      '<path d="M9 3H3v6"/><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M15 21h6v-6"/>' +
      '</svg>'
    );
  }

  function iconExit() {
    /* 四角内收 · 退出全屏 */
    return (
      '<svg class="xb-ocr-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>' +
      '<path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>' +
      '</svg>'
    );
  }

  function iconSidebarCollapse() {
    return (
      '<svg class="xb-ocr-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16"/><path d="M13 12H6"/><path d="M8 9l-3 3 3 3"/>' +
      '</svg>'
    );
  }

  function iconSidebarExpand() {
    return (
      '<svg class="xb-ocr-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16"/><path d="M12 12h7"/><path d="M16 9l3 3-3 3"/>' +
      '</svg>'
    );
  }

  function fsBtnHtml() {
    var on = state.fullscreen;
    return (
      '<button type="button" class="xb-ocr-chrome-btn' +
      (on ? ' is-active' : '') +
      '" data-ocr-chrome="fullscreen" title="' +
      (on ? '退出全屏' : '全屏') +
      '" aria-label="' +
      (on ? '退出全屏' : '全屏') +
      '" aria-pressed="' +
      (on ? 'true' : 'false') +
      '">' +
      (on ? iconExit() : iconExpand()) +
      '</button>'
    );
  }

  function sidebarBtnHtml() {
    var on = state.sidebarCollapsed;
    return (
      '<button type="button" class="xb-ocr-chrome-btn' +
      (on ? ' is-active' : '') +
      '" data-ocr-chrome="sidebar" title="' +
      (on ? '展开左侧菜单' : '收起左侧菜单') +
      '" aria-label="' +
      (on ? '展开左侧菜单' : '收起左侧菜单') +
      '" aria-pressed="' +
      (on ? 'true' : 'false') +
      '">' +
      (on ? iconSidebarExpand() : iconSidebarCollapse()) +
      '</button>'
    );
  }

  /** 侧栏折叠 + 全屏（挂在 AI 产出 tab 行右侧） */
  function chromeActionsHtml() {
    return (
      '<div class="xb-ocr-chrome-actions" role="group" aria-label="视图控制">' +
      sidebarBtnHtml() +
      fsBtnHtml() +
      '</div>'
    );
  }

  /**
   * AI 产出右栏顶：左 tabs + 右 折叠/全屏/关闭（全屏时本行仍钉在顶）
   * opts.active: ocr | report | public | other …
   * opts.tabs: [{ id, label }] 可覆盖；默认银行三件套 OCR / 报告 / 公开面
   * opts.closeAct: 关闭右栏的 data-act
   */
  function artifactTabsHeaderHtml(opts) {
    opts = opts || {};
    var active = opts.active || 'ocr';
    var closeAct = opts.closeAct || 'closeRight';
    var tabs = opts.tabs || [
      { id: 'ocr', label: 'OCR' },
      { id: 'report', label: '报告' },
      { id: 'public', label: '公开面' }
    ];
    return (
      '<div class="xb-right-pane-h xb-artifact-tabs-h">' +
      '<div class="xb-artifact-tabs" role="tablist" aria-label="AI 产出类型">' +
      tabs
        .map(function (t) {
          var on = active === t.id;
          return (
            '<button type="button" class="xb-artifact-tab' +
            (on ? ' is-active' : '') +
            '" role="tab" aria-selected="' +
            (on ? 'true' : 'false') +
            '" data-act="aiTab" data-arg="' +
            t.id +
            '">' +
            t.label +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="xb-artifact-tabs-actions">' +
      chromeActionsHtml() +
      '<button type="button" class="btn btn-ghost xb-artifact-close" data-act="' +
      closeAct +
      '">关闭</button>' +
      '</div></div>'
    );
  }

  function shellToggleHtml() {
    var on = state.sidebarCollapsed;
    return (
      '<button type="button" class="xb-shell-side-toggle" data-ocr-chrome="sidebar" title="' +
      (on ? '展开左侧菜单' : '收起左侧菜单') +
      '" aria-label="' +
      (on ? '展开左侧菜单' : '收起左侧菜单') +
      '" aria-pressed="' +
      (on ? 'true' : 'false') +
      '">' +
      (on ? iconSidebarExpand() : iconSidebarCollapse()) +
      '</button>'
    );
  }

  function refreshChromeButtons() {
    document.querySelectorAll('[data-ocr-chrome="fullscreen"]').forEach(function (btn) {
      var on = state.fullscreen;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('title', on ? '退出全屏' : '全屏');
      btn.setAttribute('aria-label', on ? '退出全屏' : '全屏');
      btn.innerHTML = on ? iconExit() : iconExpand();
    });
    document.querySelectorAll('[data-ocr-chrome="sidebar"]').forEach(function (btn) {
      var on = state.sidebarCollapsed;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('title', on ? '展开左侧菜单' : '收起左侧菜单');
      btn.setAttribute('aria-label', on ? '展开左侧菜单' : '收起左侧菜单');
      if (btn.classList.contains('xb-shell-side-toggle')) {
        btn.innerHTML = on ? iconSidebarExpand() : iconSidebarCollapse();
      } else {
        btn.innerHTML = on ? iconSidebarExpand() : iconSidebarCollapse();
      }
    });
  }

  function applyState() {
    var app = document.querySelector('.app');
    if (app) {
      app.classList.toggle('sidebar-collapsed', !!state.sidebarCollapsed);
      app.classList.toggle('ocr-fs-active', !!state.fullscreen);
    }
    document.body.classList.toggle('ocr-fs-active', !!state.fullscreen);
    document.querySelectorAll('[data-ocr-fs-root]').forEach(function (el) {
      el.classList.toggle('is-ocr-fullscreen', !!state.fullscreen);
    });
    refreshChromeButtons();
  }

  function setFullscreen(on) {
    state.fullscreen = !!on;
    if (state.fullscreen && !state.sidebarCollapsed) {
      /* 进全屏时默认收起侧栏，给校对区更宽 */
      state.sidebarCollapsed = true;
    }
    applyState();
  }

  function toggleFullscreen() {
    setFullscreen(!state.fullscreen);
  }

  function setSidebarCollapsed(on) {
    state.sidebarCollapsed = !!on;
    applyState();
  }

  function toggleSidebar() {
    setSidebarCollapsed(!state.sidebarCollapsed);
  }

  function exitFullscreen() {
    if (!state.fullscreen) return;
    state.fullscreen = false;
    applyState();
  }

  function ensureShellToggle() {
    var brand = document.getElementById('sidebarBrand');
    if (!brand) return;
    /* 旧版插在品牌下方的兄弟节点 → 清掉，改挂到品牌行内右侧 */
    var parent = brand.parentElement;
    if (parent) {
      var stale = parent.querySelectorAll(':scope > .xb-shell-side-toggle-wrap');
      for (var i = 0; i < stale.length; i++) {
        if (stale[i].parentElement !== brand) stale[i].parentNode.removeChild(stale[i]);
      }
    }
    var existing = brand.querySelector('.xb-shell-side-toggle');
    if (existing) {
      refreshChromeButtons();
      return;
    }
    var wrap = document.createElement('div');
    wrap.className = 'xb-shell-side-toggle-wrap';
    wrap.innerHTML = shellToggleHtml();
    brand.appendChild(wrap);
  }

  function onDocClick(e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-ocr-chrome]') : null;
    if (!btn) return;
    var act = btn.getAttribute('data-ocr-chrome');
    if (act === 'fullscreen') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    if (act === 'sidebar') {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      if (state.fullscreen) {
        e.preventDefault();
        exitFullscreen();
      }
    }
  }

  function bind() {
    ensureShellToggle();
    applyState();
    if (state.bound) return;
    state.bound = true;
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeydown);
  }

  /** 页面重绘后同步全屏/侧栏 class 与按钮态 */
  function sync() {
    ensureShellToggle();
    applyState();
  }

  window.DemoOcrChrome = {
    chromeActionsHtml: chromeActionsHtml,
    artifactTabsHeaderHtml: artifactTabsHeaderHtml,
    fsBtnHtml: fsBtnHtml,
    sidebarBtnHtml: sidebarBtnHtml,
    bind: bind,
    sync: sync,
    setFullscreen: setFullscreen,
    toggleFullscreen: toggleFullscreen,
    exitFullscreen: exitFullscreen,
    setSidebarCollapsed: setSidebarCollapsed,
    toggleSidebar: toggleSidebar,
    isFullscreen: function () {
      return !!state.fullscreen;
    },
    isSidebarCollapsed: function () {
      return !!state.sidebarCollapsed;
    }
  };
})();
