(function () {
  'use strict';

  var _state = { selected: null };

  function D() { return window.PE_PORTFOLIO_DATA || { COMPANIES: [] }; }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtGrowth(v) { return (v >= 0 ? '+' : '') + v.toFixed(1) + '%'; }

  function fmtProfit(v) {
    if (Math.abs(v) >= 10000) return (v / 10000).toFixed(1) + '亿';
    return v.toFixed(0) + '万';
  }

  function renderLitCard(c, idx) {
    var gClass = c.revenueGrowth >= 0 ? 'pf-pos' : 'pf-neg';
    var pClass = c.netProfit   >= 0 ? 'pf-pos' : 'pf-neg';
    var aClass = c.anomalyCount > 0  ? 'pf-adanger' : 'pf-aok';
    var selClass = (_state.selected === idx) ? ' pf-card-sel' : '';
    return '<div class="pf-card pf-lit' + selClass + '" data-card-idx="' + idx + '">'
      + '<div class="pf-card-top">'
      +   '<span class="pf-name" title="' + esc(c.name) + '">' + esc(c.name) + '</span>'
      +   '<span class="pf-sector">' + esc(c.sector) + '</span>'
      + '</div>'
      + '<div class="pf-metrics">'
      +   '<div class="pf-metric"><span class="pf-ml">营收增长</span><span class="pf-mv ' + gClass + '">' + esc(fmtGrowth(c.revenueGrowth)) + '</span></div>'
      +   '<div class="pf-metric"><span class="pf-ml">净利润</span><span class="pf-mv ' + pClass + '">' + esc(fmtProfit(c.netProfit)) + '</span></div>'
      +   '<div class="pf-metric"><span class="pf-ml">异动项</span><span class="pf-mv ' + aClass + '">' + c.anomalyCount + '</span></div>'
      + '</div>'
      + '<div class="pf-card-foot"><span class="pf-dot"></span><span class="pf-foot-label">2026Q2 已处理</span></div>'
      + '</div>';
  }

  function renderFogCard(c, idx) {
    return '<div class="pf-card pf-fog" data-card-idx="' + idx + '">'
      + '<div class="pf-card-top">'
      +   '<span class="pf-name pf-fog-name" title="' + esc(c.name) + '">' + esc(c.name) + '</span>'
      +   '<span class="pf-sector pf-sector-fog">' + esc(c.sector) + '</span>'
      + '</div>'
      + '<div class="pf-fog-mid"><span class="pf-fog-hint">季报未上传</span></div>'
      + '<div class="pf-card-foot">'
      +   '<button class="pf-upload-btn" data-fog-idx="' + idx + '">上传季报</button>'
      + '</div>'
      + '</div>';
  }

  function renderDetail(companies) {
    var i = _state.selected;
    if (i === null || !companies[i] || !companies[i].lit) return '';
    var c = companies[i];
    var gClass = c.revenueGrowth >= 0 ? 'pf-pos' : 'pf-neg';
    var pClass = c.netProfit   >= 0 ? 'pf-pos' : 'pf-neg';
    var aClass = c.anomalyCount > 0  ? 'pf-adanger' : 'pf-aok';
    return '<div class="pf-detail">'
      + '<div class="pf-detail-hd">'
      +   '<span class="pf-detail-name">' + esc(c.name) + '</span>'
      +   '<span class="pf-sector">' + esc(c.sector) + '</span>'
      +   '<button class="pf-detail-close" data-close-detail>×</button>'
      + '</div>'
      + '<div class="pf-detail-bd">'
      +   '<div class="pf-detail-stat"><span>营收增长率</span><strong class="' + gClass + '">' + fmtGrowth(c.revenueGrowth) + '</strong></div>'
      +   '<div class="pf-detail-stat"><span>净利润</span><strong class="' + pClass + '">' + fmtProfit(c.netProfit) + '</strong></div>'
      +   '<div class="pf-detail-stat"><span>异动项数</span><strong class="' + aClass + '">' + c.anomalyCount + ' 项</strong></div>'
      +   '<div class="pf-detail-stat"><span>报告期</span><strong>2026Q2</strong></div>'
      + '</div>'
      + '</div>';
  }

  function renderStyles() {
    return '<style>'
      /* page shell */
      + '.pf-page{display:flex;flex-direction:column;min-height:100%;background:var(--xb-bg)}'
      /* sticky header */
      + '.pf-sticky{position:sticky;top:0;z-index:10;background:var(--xb-bg);border-bottom:1px solid var(--xb-border);padding:12px 24px}'
      + '.pf-sticky-inner{display:flex;align-items:center;gap:14px;flex-wrap:wrap}'
      + '.pf-prog-num{font-size:22px;font-weight:700;color:var(--xb-text);line-height:1}'
      + '.pf-prog-denom{font-size:15px;color:var(--xb-muted)}'
      + '.pf-prog-lbl{font-size:13px;color:var(--xb-muted)}'
      + '.pf-bar-wrap{flex:1;min-width:100px;max-width:180px;height:6px;background:var(--xb-border);border-radius:3px;overflow:hidden}'
      + '.pf-bar{height:100%;background:var(--xb-accent);border-radius:3px;transition:width .4s}'
      + '.pf-chips{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap}'
      + '.pf-chip{padding:3px 10px;border-radius:12px;font-size:12px;font-weight:500}'
      + '.pf-chip-danger{background:#fef2f2;color:var(--xb-danger)}'
      + '.pf-chip-ok{background:#f0fdf4;color:var(--xb-green)}'
      + '.pf-chip-fog{background:var(--xb-surface);color:var(--xb-muted)}'
      /* content */
      + '.pf-content{padding:20px 24px 32px}'
      + '.pf-section-lbl{font-size:11px;font-weight:700;color:var(--xb-muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 12px;display:flex;align-items:center;gap:6px}'
      + '.pf-section-lbl+.pf-grid{margin-bottom:4px}'
      + '.pf-fog-section{margin-top:24px}'
      + '.pf-sec-ct{background:var(--xb-surface);color:var(--xb-text);font-weight:600;padding:1px 7px;border-radius:10px;font-size:11px}'
      /* grid */
      + '.pf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-bottom:4px}'
      /* card base */
      + '.pf-card{border:1px solid var(--xb-border);border-radius:8px;padding:14px 14px 12px;display:flex;flex-direction:column;gap:10px;background:var(--xb-bg);transition:box-shadow .15s,border-color .15s}'
      + '.pf-lit{cursor:pointer}'
      + '.pf-lit:hover{border-color:var(--xb-accent);box-shadow:0 2px 12px rgba(99,102,241,.08)}'
      + '.pf-card-sel{border-color:var(--xb-accent)!important;box-shadow:0 0 0 2px rgba(99,102,241,.18)!important}'
      + '.pf-fog{background:var(--xb-surface);cursor:default}'
      /* card top */
      + '.pf-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}'
      + '.pf-name{font-size:13px;font-weight:600;color:var(--xb-text);line-height:1.4;flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'
      + '.pf-fog-name{color:var(--xb-muted)}'
      + '.pf-sector{flex-shrink:0;font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(99,102,241,.08);color:var(--xb-accent);white-space:nowrap}'
      + '.pf-sector-fog{background:var(--xb-border);color:var(--xb-muted)}'
      /* metrics */
      + '.pf-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}'
      + '.pf-metric{display:flex;flex-direction:column;gap:2px}'
      + '.pf-ml{font-size:10px;color:var(--xb-muted)}'
      + '.pf-mv{font-size:12px;font-weight:700}'
      + '.pf-pos{color:var(--xb-green)}'
      + '.pf-neg{color:var(--xb-danger)}'
      + '.pf-adanger{color:var(--xb-danger)}'
      + '.pf-aok{color:var(--xb-muted)}'
      /* card footer */
      + '.pf-card-foot{display:flex;align-items:center;gap:6px;padding-top:6px;border-top:1px solid var(--xb-border)}'
      + '.pf-dot{width:6px;height:6px;border-radius:50%;background:var(--xb-green);flex-shrink:0}'
      + '.pf-foot-label{font-size:10px;color:var(--xb-muted)}'
      /* fog mid */
      + '.pf-fog-mid{flex:1;display:flex;align-items:center;justify-content:center;padding:6px 0}'
      + '.pf-fog-hint{font-size:12px;color:var(--xb-muted)}'
      /* upload btn */
      + '.pf-upload-btn{padding:4px 12px;border-radius:6px;border:1px solid var(--xb-accent);color:var(--xb-accent);background:transparent;font-size:12px;cursor:pointer;transition:background .15s}'
      + '.pf-upload-btn:hover{background:rgba(99,102,241,.08)}'
      + '.pf-upload-btn:disabled{opacity:.5;cursor:not-allowed}'
      /* detail panel */
      + '.pf-detail{margin:16px 24px 0;border:1px solid var(--xb-border);border-radius:8px;background:var(--xb-surface);padding:14px 16px}'
      + '.pf-detail-hd{display:flex;align-items:center;gap:10px;margin-bottom:12px}'
      + '.pf-detail-name{font-size:14px;font-weight:700;color:var(--xb-text);flex:1}'
      + '.pf-detail-close{border:none;background:none;cursor:pointer;font-size:18px;color:var(--xb-muted);padding:0 2px;line-height:1}'
      + '.pf-detail-bd{display:flex;gap:28px;flex-wrap:wrap}'
      + '.pf-detail-stat{display:flex;flex-direction:column;gap:2px}'
      + '.pf-detail-stat span{font-size:11px;color:var(--xb-muted)}'
      + '.pf-detail-stat strong{font-size:15px}'
      + '</style>';
  }

  function renderPage() {
    var data = D();
    var companies = data.COMPANIES || [];
    var litTotal = 0, fogTotal = 0, critCount = 0;
    companies.forEach(function (c) { if (c.lit) { litTotal++; if (c.anomalyCount > 0) critCount++; } else fogTotal++; });
    var total = companies.length;
    var pct  = total > 0 ? Math.round(litTotal / total * 100) : 0;

    var html = '<div class="page-body pf-page">'
      /* sticky header */
      + '<div class="pf-sticky"><div class="pf-sticky-inner">'
      +   '<div style="display:flex;align-items:baseline;gap:5px">'
      +     '<span class="pf-prog-num">' + litTotal + '<span class="pf-prog-denom"> / ' + total + '</span></span>'
      +     '<span class="pf-prog-lbl">已处理 · 2026Q2</span>'
      +   '</div>'
      +   '<div class="pf-bar-wrap"><div class="pf-bar" style="width:' + pct + '%"></div></div>'
      +   '<div class="pf-chips">'
      +     (critCount > 0
              ? '<span class="pf-chip pf-chip-danger">⚠ ' + critCount + ' 家有异动</span>'
              : '<span class="pf-chip pf-chip-ok">无异动</span>')
      +     '<span class="pf-chip pf-chip-fog">' + fogTotal + ' 家待上传</span>'
      +   '</div>'
      + '</div></div>'
      /* content */
      + '<div class="pf-content">';

    /* lit section */
    if (litTotal > 0) {
      html += '<div class="pf-section-lbl">已处理 <span class="pf-sec-ct">' + litTotal + '</span></div>'
        + '<div class="pf-grid">';
      companies.forEach(function (c, i) {
        if (c.lit) html += renderLitCard(c, i);
      });
      html += '</div>';
    }

    /* fog section */
    if (fogTotal > 0) {
      html += '<div class="pf-section-lbl pf-fog-section">待上传 <span class="pf-sec-ct">' + fogTotal + '</span></div>'
        + '<div class="pf-grid">';
      companies.forEach(function (c, i) {
        if (!c.lit) html += renderFogCard(c, i);
      });
      html += '</div>';
    }

    html += '</div>' /* pf-content */
      + renderDetail(companies)
      + renderStyles()
      + '</div>'; /* pf-page */

    return html;
  }

  function refresh(root) {
    /* keep the guard flag — root element is reused, only innerHTML changes */
    var wasAttached = root._pfClickAttached;
    root.innerHTML = renderPage();
    root._pfClickAttached = wasAttached;
    if (!wasAttached) bind(root);
  }

  function bind(root) {
    if (root._pfClickAttached) return;
    root._pfClickAttached = true;

    root.addEventListener('click', function (e) {
      var closeBtn  = e.target.closest('[data-close-detail]');
      var uploadBtn = e.target.closest('[data-fog-idx]');
      var cardEl    = e.target.closest('[data-card-idx]');

      if (closeBtn) {
        _state.selected = null;
        refresh(root);
        return;
      }

      if (uploadBtn) {
        e.stopPropagation();
        uploadBtn.textContent = '上传中…';
        uploadBtn.disabled = true;
        setTimeout(function () {
          uploadBtn.textContent = '上传季报';
          uploadBtn.disabled = false;
        }, 1400);
        return;
      }

      if (cardEl) {
        var idx = parseInt(cardEl.getAttribute('data-card-idx'), 10);
        var companies = D().COMPANIES || [];
        if (companies[idx] && companies[idx].lit) {
          _state.selected = (_state.selected === idx) ? null : idx;
          refresh(root);
        }
      }
    });
  }

  function refreshIn(container) {
    var wasAttached = container._pfClickAttached;
    container.innerHTML = renderPage();
    container._pfClickAttached = wasAttached;
    if (!wasAttached) bindIn(container);
  }

  function bindIn(container) {
    if (!container) return;
    if (container._pfClickAttached) return;
    container._pfClickAttached = true;

    container.addEventListener('click', function (e) {
      var closeBtn  = e.target.closest('[data-close-detail]');
      var uploadBtn = e.target.closest('[data-fog-idx]');
      var cardEl    = e.target.closest('[data-card-idx]');

      if (closeBtn) {
        _state.selected = null;
        refreshIn(container);
        return;
      }

      if (uploadBtn) {
        e.stopPropagation();
        uploadBtn.textContent = '上传中…';
        uploadBtn.disabled = true;
        setTimeout(function () {
          uploadBtn.textContent = '上传季报';
          uploadBtn.disabled = false;
        }, 1400);
        return;
      }

      if (cardEl) {
        var idx = parseInt(cardEl.getAttribute('data-card-idx'), 10);
        var companies = D().COMPANIES || [];
        if (companies[idx] && companies[idx].lit) {
          _state.selected = (_state.selected === idx) ? null : idx;
          refreshIn(container);
        }
      }
    });
  }

  window.PE_PORTFOLIO = { renderPage: renderPage, bind: bind, bindIn: bindIn };
})();
