/**
 * 企业数据浏览器页面组件
 * 版本: v2.0 | 日期: 2026-07-27
 * 增强：统计摘要栏、列排序、行级详情卡、快速操作
 * 全局：window.PE_POST_BROWSER = { renderPage(), bind(root) }
 * 依赖：window.POST_BROWSER_DATA
 */
(function () {
  'use strict';

  /* ── 模块状态 ── */
  var _state = {
    cols: null,
    panelOpen: false,
    filter: '',
    sort: { col: null, dir: 'asc' },
    detail: null        // 当前展开详情的企业 name
  };

  function D() {
    return window.POST_BROWSER_DATA || { GROUPS: [], ALL_COL_IDS: [], DEFAULT_COLS: [], COMPANIES: [] };
  }

  function activeCols() {
    return _state.cols || D().DEFAULT_COLS.slice();
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtNum(v) {
    if (typeof v === 'number') return v.toLocaleString();
    if (v == null || v === '' || v === '—') return '—';
    var n = parseFloat(v);
    return isNaN(n) ? String(v) : n.toLocaleString();
  }

  function colLabel(id) {
    var d = D();
    for (var gi = 0; gi < d.GROUPS.length; gi++) {
      var g = d.GROUPS[gi];
      for (var ci = 0; ci < g.cols.length; ci++) {
        if (g.cols[ci].id === id) return g.cols[ci].label;
      }
    }
    return id;
  }

  function cellVal(company, colId) {
    var v = company[colId];
    if (colId === 'ai') {
      var full = String(v || '—');
      var short = full.length > 60 ? full.slice(0, 60) + '…' : full;
      return '<span title="' + esc(full) + '" style="cursor:default">' + esc(short) + '</span>';
    }
    if (colId === 'moic') {
      var m = parseFloat(v);
      if (isNaN(m)) return esc(v || '—');
      var color = m >= 2 ? 'var(--xb-green,#16a34a)' : m < 1 ? 'var(--xb-danger,#dc2626)' : 'inherit';
      return '<strong style="color:' + color + '">' + esc(String(v)) + 'x</strong>';
    }
    if (colId === 'exitStatus') {
      var cls = v === '完全退出' ? 'ok' : v === '部分退出' ? 'warn' : '';
      return cls ? '<span class="tag ' + cls + '">' + esc(v) + '</span>' : esc(v || '—');
    }
    if (typeof v === 'number') return esc(fmtNum(v));
    return esc(v || '—');
  }

  /* ── 排序 ── */
  function sortCompanies(list) {
    if (!_state.sort.col) return list;
    var col = _state.sort.col;
    var dir = _state.sort.dir;
    return list.slice().sort(function (a, b) {
      var av = a[col], bv = b[col];
      var an = parseFloat(av), bn = parseFloat(bv);
      if (!isNaN(an) && !isNaN(bn)) return dir === 'asc' ? an - bn : bn - an;
      var as = String(av == null ? '' : av);
      var bs = String(bv == null ? '' : bv);
      var cmp = as.localeCompare(bs, 'zh');
      return dir === 'asc' ? cmp : -cmp;
    });
  }

  /* ── 统计摘要栏 ── */
  function renderStats(companies) {
    var d = D();
    var count = companies.length;
    var principal = companies.reduce(function (s, c) { return s + (c.principal || 0); }, 0);
    var bookVal = companies.reduce(function (s, c) { return s + (c.bookValue || 0); }, 0);
    var moics = companies.filter(function (c) { return parseFloat(c.moic) > 0; })
      .map(function (c) { return parseFloat(c.moic); });
    var avgMoic = moics.length
      ? (moics.reduce(function (s, m) { return s + m; }, 0) / moics.length)
      : null;
    var moicColor = avgMoic == null ? null
      : avgMoic >= 2 ? 'var(--xb-green,#16a34a)'
      : avgMoic < 1  ? 'var(--xb-danger,#dc2626)'
      : null;

    function chip(label, value, color) {
      return '<div style="display:flex;flex-direction:column;gap:2px;padding:0 20px;' +
        'border-right:1px solid var(--xb-border,#e5e7eb)">' +
        '<span style="font-size:11px;color:var(--xb-muted,#6b7280);white-space:nowrap">' + esc(label) + '</span>' +
        '<span style="font-size:16px;font-weight:700' + (color ? ';color:' + color : '') + '">' + esc(value) + '</span>' +
        '</div>';
    }

    var filterNote = count < d.COMPANIES.length
      ? '<span style="font-size:12px;color:var(--xb-muted,#6b7280)">已筛选 ' + count + ' / ' + d.COMPANIES.length + ' 家</span>'
      : '';

    return '<div style="display:flex;align-items:center;padding:10px 4px;' +
      'background:var(--xb-surface,#f9fafb);border-bottom:1px solid var(--xb-border,#e5e7eb);gap:0;flex-shrink:0">' +
      chip('投资组合', count + ' 家', null) +
      chip('合计本金', fmtNum(principal) + ' 万', null) +
      chip('账面价值', fmtNum(bookVal) + ' 万', null) +
      chip('平均 MOIC', avgMoic != null ? avgMoic.toFixed(2) + 'x' : '—', moicColor) +
      '<div style="padding:0 20px;flex:1">' + filterNote + '</div>' +
      '</div>';
  }

  /* ── 行级详情卡 ── */
  function renderDetailCard(company) {
    if (!company) return '';

    var moicVal = parseFloat(company.moic);
    var moicColor = isNaN(moicVal) ? null
      : moicVal >= 2 ? 'var(--xb-green,#16a34a)'
      : moicVal < 1  ? 'var(--xb-danger,#dc2626)'
      : 'var(--xb-accent,#6366f1)';

    function metricChip(label, val, color) {
      return '<div style="text-align:center;min-width:80px;padding:8px 12px;background:var(--xb-bg,#fff);' +
        'border-radius:6px;border:1px solid var(--xb-border,#e5e7eb)">' +
        '<div style="font-size:10px;color:var(--xb-muted,#6b7280);margin-bottom:3px">' + esc(label) + '</div>' +
        '<div style="font-size:15px;font-weight:700' + (color ? ';color:' + color : '') + '">' + esc(val) + '</div>' +
        '</div>';
    }

    var html = '<div style="padding:16px 24px;border-bottom:2px solid var(--xb-accent,#6366f1);' +
      'background:linear-gradient(135deg,rgba(99,102,241,.04) 0%,rgba(139,92,246,.02) 100%)">';

    /* 标题行 */
    html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">' +
      '<div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--xb-text)">' + esc(company.name) + '</div>' +
      '<div style="font-size:12px;color:var(--xb-muted,#6b7280);margin-top:3px">' +
      esc(company.sector || '') + '&nbsp;·&nbsp;' + esc(company.latestRound || '') +
      '&nbsp;·&nbsp;投资于 ' + esc(company.investDate || '') +
      '</div></div>' +
      '<button type="button" data-pb-close style="background:none;border:none;cursor:pointer;' +
      'color:var(--xb-muted,#6b7280);font-size:22px;line-height:1;padding:0 6px;flex-shrink:0" title="关闭详情">×</button>' +
      '</div>';

    /* 关键指标 */
    html += '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
      metricChip('MOIC', company.moic ? company.moic + 'x' : '—', moicColor) +
      metricChip('投资本金', company.principal ? fmtNum(company.principal) + ' 万' : '—', null) +
      metricChip('账面价值', company.bookValue != null ? fmtNum(company.bookValue) + ' 万' : '—', null) +
      metricChip('退出状态', company.exitStatus || '—',
        company.exitStatus === '完全退出' ? 'var(--xb-green,#16a34a)'
        : company.exitStatus === '部分退出' ? 'var(--xb-warn,#d97706)' : null) +
      (company.repurchaseTrigger && company.repurchaseTrigger !== '—'
        ? metricChip('回购触发日', company.repurchaseTrigger, 'var(--xb-danger,#dc2626)')
        : '') +
      '</div>';

    /* AI 摘要 */
    if (company.ai && company.ai !== '—') {
      html += '<div style="padding:10px 14px;background:rgba(99,102,241,.06);border-radius:6px;' +
        'border-left:3px solid var(--xb-accent,#6366f1);margin-bottom:12px">' +
        '<div style="font-size:10px;font-weight:700;color:var(--xb-accent,#6366f1);letter-spacing:.05em;margin-bottom:5px">✦ AI 分析</div>' +
        '<p style="font-size:12px;line-height:1.65;color:var(--xb-text);margin:0">' + esc(company.ai) + '</p>' +
        '</div>';
    }

    /* 关键条款 & 对赌 */
    if (company.keyTerms && company.keyTerms !== '—') {
      html += '<div style="font-size:12px;color:var(--xb-muted);margin-bottom:8px">' +
        '<span style="font-weight:600;color:var(--xb-text)">关键条款：</span>' + esc(company.keyTerms) + '</div>';
    }
    if (company.betObligation && company.betObligation !== '—' && company.betObligation !== '无') {
      html += '<div style="font-size:12px;color:var(--xb-muted);margin-bottom:12px">' +
        '<span style="font-weight:600;color:var(--xb-text)">对赌义务：</span>' + esc(company.betObligation) + '</div>';
    }

    /* 快速操作 */
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">' +
      qBtn('brief',    company.name, '生成季度简报', true) +
      qBtn('urge',     company.name, '催办材料更新', false) +
      qBtn('legal',    company.name, '法务条款检查', false) +
      qBtn('valuation',company.name, '启动估值分析', false) +
      '</div>';

    html += '</div>';
    return html;
  }

  function qBtn(action, cname, label, primary) {
    var base = 'padding:6px 14px;font-size:12px;font-weight:500;border-radius:6px;cursor:pointer;';
    var style = primary
      ? base + 'background:var(--xb-accent,#6366f1);color:#fff;border:none;'
      : base + 'background:none;border:1px solid var(--xb-border,#e5e7eb);color:var(--xb-text);';
    return '<button type="button" data-pb-action="' + esc(action) + '" data-pb-cname="' + esc(cname) + '" style="' + style + '">' + esc(label) + '</button>';
  }

  /* ── 指标选择面板 ── */
  function renderPanel(cols) {
    var d = D();
    var html = '<div id="pbPanel" style="' +
      'position:absolute;top:40px;right:0;z-index:200;' +
      'background:var(--xb-bg,#fff);border:1px solid var(--xb-border,#e5e7eb);' +
      'border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);' +
      'padding:12px;min-width:240px;max-height:480px;overflow-y:auto">' +
      '<div style="font-weight:600;font-size:13px;margin-bottom:10px;color:var(--xb-muted,#6b7280)">选择显示指标</div>';
    d.GROUPS.forEach(function (g) {
      html += '<div style="margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:600;color:var(--xb-faint,#9ca3af);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">' +
        esc(g.label) + '</div>';
      g.cols.forEach(function (c) {
        var checked = cols.indexOf(c.id) >= 0;
        html += '<label style="display:flex;align-items:center;gap:6px;padding:3px 0;cursor:pointer;font-size:13px">' +
          '<input type="checkbox" data-pb-col="' + esc(c.id) + '"' +
          (checked ? ' checked' : '') + ' style="cursor:pointer" />' +
          esc(c.label) + '</label>';
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  /* ── 主页面 ── */
  function renderPage() {
    var d = D();
    var cols = activeCols();
    var filter = (_state.filter || '').toLowerCase();
    var filtered = d.COMPANIES.filter(function (c) {
      return !filter || c.name.toLowerCase().indexOf(filter) >= 0 ||
        (c.sector || '').toLowerCase().indexOf(filter) >= 0;
    });
    var companies = sortCompanies(filtered);
    var detailCompany = _state.detail
      ? (filtered.filter(function (c) { return c.name === _state.detail; })[0] || null)
      : null;

    /* 工具栏 */
    var toolbar =
      '<div class="page-toolbar">' +
      '<h1>数据浏览器</h1>' +
      '<div class="spacer"></div>' +
      '<input class="search" id="pbSearch" placeholder="搜索企业/行业…" value="' + esc(_state.filter) + '" style="width:160px" />' +
      '<div style="position:relative;margin-left:8px">' +
      '<button type="button" class="btn btn-ghost" id="pbPanelBtn" style="font-size:13px">' +
      '+ 指标 <span style="font-size:11px;color:var(--xb-muted,#6b7280)">(' + cols.length + '/' + d.ALL_COL_IDS.length + ')</span>' +
      '</button>' +
      (_state.panelOpen ? renderPanel(cols) : '') +
      '</div>' +
      '</div>';

    /* 排序列头（可点击） */
    var thead = '<thead><tr style="border-bottom:2px solid var(--xb-border,#e5e7eb)">';
    cols.forEach(function (id) {
      var isSort = _state.sort.col === id;
      var arrow = isSort ? (_state.sort.dir === 'asc' ? ' ↑' : ' ↓') : '';
      var w = id === 'name' ? '160px' : id === 'ai' ? '200px' : id === 'changeNote' ? '180px' : 'auto';
      thead += '<th data-pb-sort="' + esc(id) + '" style="padding:8px 12px;text-align:left;' +
        'font-size:12px;font-weight:600;color:var(--xb-muted,#6b7280);white-space:nowrap;' +
        'min-width:' + w + ';cursor:pointer;user-select:none" title="点击排序">' +
        esc(colLabel(id)) +
        '<span style="color:var(--xb-accent,#6366f1);margin-left:2px">' + esc(arrow) + '</span></th>';
    });
    thead += '</tr></thead>';

    /* 行体（可点击） */
    var tbody = '<tbody>';
    if (!companies.length) {
      tbody += '<tr><td colspan="' + cols.length + '" style="padding:40px;text-align:center;color:var(--xb-muted,#6b7280)">无匹配企业</td></tr>';
    }
    companies.forEach(function (c, i) {
      var isSelected = _state.detail === c.name;
      var bg = isSelected
        ? 'background:rgba(99,102,241,.07);'
        : (i % 2 === 1 ? 'background:var(--xb-row-alt,rgba(0,0,0,.02));' : '');
      tbody += '<tr data-pb-row="' + esc(c.name) + '" title="点击查看详情" ' +
        'style="border-bottom:1px solid var(--xb-border,#e5e7eb);' + bg + 'cursor:pointer">';
      cols.forEach(function (id) {
        tbody += '<td style="padding:8px 12px;font-size:13px;vertical-align:middle">' +
          cellVal(c, id) + '</td>';
      });
      tbody += '</tr>';
    });
    tbody += '</tbody>';

    var table =
      '<div style="overflow-x:auto">' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
      thead + tbody + '</table></div>';

    return toolbar +
      '<div class="page-body" style="padding:0">' +
      renderStats(filtered) +
      (detailCompany ? renderDetailCard(detailCompany) : '') +
      table +
      '</div>';
  }

  /* ── toast 辅助（直接操作 DOM，无需 app 注入） ── */
  function pbToast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._pbT);
    el._pbT = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ── 事件绑定 ── */
  function bind(root) {
    /* 搜索 */
    var searchEl = root.querySelector('#pbSearch');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        _state.filter = searchEl.value;
        _state.detail = null;
        refresh(root);
      });
    }

    /* 面板开关按钮 */
    var panelBtn = root.querySelector('#pbPanelBtn');
    if (panelBtn) {
      panelBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        _state.panelOpen = !_state.panelOpen;
        refresh(root);
      });
    }

    /* 面板 checkbox — 委托在 root，只注册一次 */
    if (!root._pbChangeListenerAttached) {
      root._pbChangeListenerAttached = true;
      root.addEventListener('change', function (e) {
        var t = e.target;
        if (!t || !t.getAttribute('data-pb-col')) return;
        var id = t.getAttribute('data-pb-col');
        var cols = activeCols();
        var idx = cols.indexOf(id);
        if (t.checked && idx < 0) cols.push(id);
        if (!t.checked && idx >= 0) cols.splice(idx, 1);
        _state.cols = cols;
        _state.panelOpen = true;
        refresh(root);
      });
    }

    /* 行点击/排序/关闭/操作 — 统一委托，只注册一次 */
    if (!root._pbClickDelegateAttached) {
      root._pbClickDelegateAttached = true;
      root.addEventListener('click', function (e) {
        var closeBtn = e.target.closest ? e.target.closest('[data-pb-close]') : null;
        if (closeBtn) { _state.detail = null; refresh(root); return; }

        var actionBtn = e.target.closest ? e.target.closest('[data-pb-action]') : null;
        if (actionBtn) {
          var action = actionBtn.getAttribute('data-pb-action');
          var cname = actionBtn.getAttribute('data-pb-cname') || '该企业';
          var msgs = {
            brief:    '正在为「' + cname + '」生成季度经营简报…',
            urge:     '已向「' + cname + '」负责人发送材料催办提醒',
            legal:    '正在对「' + cname + '」进行法务条款健康检查…',
            valuation:'正在为「' + cname + '」启动估值更新分析…'
          };
          pbToast(msgs[action] || '操作中…');
          return;
        }

        var sortTh = e.target.closest ? e.target.closest('[data-pb-sort]') : null;
        if (sortTh) {
          var col = sortTh.getAttribute('data-pb-sort');
          _state.sort = _state.sort.col === col
            ? { col: col, dir: _state.sort.dir === 'asc' ? 'desc' : 'asc' }
            : { col: col, dir: 'asc' };
          refresh(root);
          return;
        }

        var row = e.target.closest ? e.target.closest('[data-pb-row]') : null;
        if (row) {
          var name = row.getAttribute('data-pb-row');
          _state.detail = _state.detail === name ? null : name;
          refresh(root);
          return;
        }
      });
    }

    /* 点击面板外关闭 — 只注册一次 */
    if (!root._pbDocListenerAttached) {
      root._pbDocListenerAttached = true;
      document.addEventListener('click', function (e) {
        if (!_state.panelOpen) return;
        var panel = root.querySelector('#pbPanel');
        var btn = root.querySelector('#pbPanelBtn');
        if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
          _state.panelOpen = false;
          refresh(root);
        }
      });
    }
  }

  function refresh(root) {
    var viewRoot = root.closest && root.closest('.main')
      ? root.closest('.main').querySelector('#viewRoot')
      : null;
    if (viewRoot) {
      viewRoot.innerHTML = renderPage();
      bind(viewRoot);
    }
  }

  window.PE_POST_BROWSER = {
    renderPage: renderPage,
    bind: bind
  };
})();
