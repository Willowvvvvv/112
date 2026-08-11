/**
 * 银行版 · 项目动态 & 企业动态 v1.0
 * window.BankMonitorPages = { render, renderProjectMonitor, renderEnterpriseMonitor }
 */
(function () {
  'use strict';

  function D() {
    return window.BANK_DATA || {};
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bindNav(root, navigate) {
    if (!root || !navigate) return;
    root.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var r = el.getAttribute('data-nav');
        if (r) navigate(r);
      });
    });
  }

  /* ─────────────── 项目动态 ─────────────── */

  var PROJECT_MONITOR_TABS = [
    { id: 'alert', label: '重点关注' },
    { id: 'all',   label: '全部动态' },
    { id: 'rules', label: '预警条件' }
  ];

  function dimensionTagClass(dim) {
    if (!dim) return 'dd';
    if (dim.indexOf('质押') !== -1 || dim.indexOf('司法') !== -1 || dim.indexOf('缺口') !== -1) return 'danger';
    if (dim.indexOf('工商') !== -1 || dim.indexOf('舆情') !== -1) return 'warn';
    if (dim.indexOf('知识产权') !== -1 || dim.indexOf('资质') !== -1) return 'ok';
    return 'dd';
  }

  function renderProjectMonitor(ctx) {
    var brief     = D().monitorBrief     || {};
    var feed      = D().monitorFeed      || [];
    var companies = D().monitorCompanies || [];
    var rules     = D().monitorRules     || [];
    var lead      = D().monitorLead      || '';

    var tab     = ctx.state.bkMonTab     || 'all';
    var company = ctx.state.bkMonCompany || 'all';

    var alertCount = feed.filter(function (m) { return m.triggered; }).length;

    /* AI 摘要卡片 */
    var briefHtml =
      '<div class="bk-panel" style="margin-bottom:16px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span class="bk-tag dd" style="font-size:11px">' + esc(brief.aiLabel || 'AI 综合解读') + '</span>' +
      '<strong>' + esc(brief.title || '近 7 日项目动态摘要') + '</strong></div>' +
      '<span class="bk-muted" style="font-size:12px">' + esc(brief.meta || '') + '</span></div>' +
      '<p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:var(--bk-text,#1e293b)">' + esc(brief.summary || '') + '</p>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">' +
      [
        { title: brief.riskTitle     || '重点风险',   text: brief.riskText     || '', cls: 'bk-tag danger' },
        { title: brief.positiveTitle || '正向进展',   text: brief.positiveText || '', cls: 'bk-tag ok'     },
        { title: brief.actionTitle   || '建议跟进',   text: brief.actionText   || '', cls: 'bk-tag dd'     }
      ].map(function (i) {
        return '<div style="background:var(--bk-bg,#f8fafc);border:1px solid var(--bk-border,#e2e8f0);border-radius:6px;padding:10px">' +
          '<span class="' + i.cls + '" style="font-size:11px;margin-bottom:6px;display:inline-block">' + esc(i.title) + '</span>' +
          '<p style="margin:0;font-size:12px;line-height:1.55;color:var(--bk-muted,#64748b)">' + esc(i.text) + '</p></div>';
      }).join('') +
      '</div></div>';

    /* Tabs */
    var tabsHtml =
      '<div class="xb-skills-tabs" role="tablist" style="margin-bottom:14px">' +
      PROJECT_MONITOR_TABS.map(function (t) {
        var lbl = t.label;
        if (t.id === 'alert' && alertCount) lbl += ' (' + alertCount + ')';
        if (t.id === 'rules') lbl += ' (' + rules.length + ')';
        return '<button type="button" class="xb-skills-tab' + (tab === t.id ? ' on' : '') +
          '" data-bk-mon-tab="' + t.id + '">' + esc(lbl) + '</button>';
      }).join('') +
      '</div>';

    /* Body */
    var bodyHtml = '';
    if (tab === 'rules') {
      bodyHtml =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<h4 style="margin:0;font-size:14px;font-weight:600">预警条件与类型</h4>' +
        '<button type="button" class="bk-btn-primary bk-btn" data-bk-mon-act="newRule">新建条件</button></div>' +
        rules.map(function (r) {
          return (
            '<div class="bk-mat" style="align-items:flex-start;margin-bottom:8px;' +
            (r.triggered ? 'border-color:#fecaca;' : '') + '">' +
            '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<strong style="font-size:13px">' + esc(r.company) + '</strong>' +
            '<span class="bk-tag ' + (r.triggered ? 'danger' : 'dd') + '">' + esc(r.status) + '</span>' +
            '</div>' +
            '<p style="margin:0 0 6px;font-size:13px;color:var(--bk-muted,#64748b)">' + esc(r.condition) + '</p>' +
            '<span class="bk-tag dd" style="font-size:11px">' + esc(r.dimension) + '</span>' +
            '<span class="bk-muted" style="font-size:11px;margin-left:8px">关联 ' + esc(r.projectName) + ' · 创建于 ' + esc(r.time) + '</span>' +
            '</div>' +
            '<div style="display:flex;gap:6px;flex-shrink:0">' +
            '<button type="button" class="bk-btn" data-bk-mon-act="editRule" data-bk-mon-id="' + esc(r.id) + '">编辑</button>' +
            '<button type="button" class="bk-btn" data-bk-mon-act="delRule" data-bk-mon-id="' + esc(r.id) + '">删除</button>' +
            '</div></div>'
          );
        }).join('');
    } else {
      var source = tab === 'alert' ? feed.filter(function (m) { return m.triggered; }) : feed;
      var filtered = company === 'all' ? source : source.filter(function (m) { return m.company === company || m.projectName === company; });
      // 企业筛选 rail
      var railBtns =
        '<button type="button" class="bk-monitor-company-btn' + (company === 'all' ? ' on' : '') +
        '" data-bk-mon-company="all"><div style="font-weight:600;font-size:13px">全部</div>' +
        (alertCount ? '<span class="bk-monitor-badge">' + alertCount + '</span>' : '') +
        '</button>' +
        companies.map(function (c) {
          var isOn = company === c.key || company === c.company;
          return '<button type="button" class="bk-monitor-company-btn' + (isOn ? ' on' : '') +
            '" data-bk-mon-company="' + esc(c.key) + '">' +
            '<div><div style="font-weight:600;font-size:13px">' + esc(c.company) + '</div>' +
            '<div style="font-size:11px;color:var(--bk-muted,#64748b)">' + esc(c.projectName) + '</div></div>' +
            (c.alertCount ? '<span class="bk-monitor-badge">' + c.alertCount + '</span>' : '') +
            '</button>';
        }).join('');

      var feedItems = filtered.map(function (m) {
        var dotCls = m.triggered ? 'bk-monitor-dot danger' : m.positive ? 'bk-monitor-dot ok' : 'bk-monitor-dot neutral';
        return (
          '<article style="display:flex;gap:12px;padding:12px;border-bottom:1px solid var(--bk-border,#e2e8f0)">' +
          '<div style="padding-top:4px"><span class="' + dotCls + '"></span></div>' +
          '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
          '<strong style="font-size:13px">' + esc(m.company) + '</strong>' +
          '<span class="bk-muted" style="font-size:12px">' + esc(m.time) + '</span>' +
          '</div>' +
          '<span class="bk-mini-tag">' + esc(m.projectName) + '</span>' +
          '<p style="margin:6px 0 4px;font-size:13px;line-height:1.5;color:var(--bk-text,#1e293b)">' + esc(m.change) + '</p>' +
          '<span class="bk-tag ' + dimensionTagClass(m.dimension) + '" style="font-size:11px">' + esc(m.dimension) + '</span>' +
          '</div></article>'
        );
      }).join('');

      bodyHtml =
        '<div class="bk-monitor-split">' +
        '<div class="bk-monitor-rail">' + railBtns + '</div>' +
        '<div class="bk-monitor-feed">' +
        (feedItems || '<div class="bk-muted" style="padding:24px 0">该筛选条件下暂无动态</div>') +
        '</div></div>';
    }

    ctx.rootEl.innerHTML =
      '<div class="page-body" style="overflow:auto;height:100%">' +
      '<div class="bk-toolbar" style="margin:0 0 12px">' +
      '<h1 style="margin:0;font-size:20px">企业动态</h1>' +
      '<div class="spacer"></div>' +
      '<span class="bk-muted" style="font-size:12px">变更 · 风险信号 · 预警规则</span></div>' +
      '<p class="xb-feature-lead">' + esc(lead) + '</p>' +
      briefHtml + tabsHtml + bodyHtml + '</div>';

    /* event bindings */
    ctx.rootEl.querySelectorAll('[data-bk-mon-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ bkMonTab: btn.getAttribute('data-bk-mon-tab') });
        renderProjectMonitor(ctx);
      });
    });
    ctx.rootEl.querySelectorAll('[data-bk-mon-company]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ bkMonCompany: btn.getAttribute('data-bk-mon-company') });
        renderProjectMonitor(ctx);
      });
    });
    ctx.rootEl.querySelectorAll('[data-bk-mon-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-bk-mon-act');
        if (act === 'newRule') {
          if (ctx.toast) ctx.toast('新建预警条件（示意）');
        } else if (act === 'editRule') {
          if (ctx.toast) ctx.toast('编辑预警条件（示意）');
        } else if (act === 'delRule') {
          if (ctx.toast) ctx.toast('删除预警条件（示意）');
        }
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* ─────────────── 企业动态 ─────────────── */

  var ENT_LEVEL_TAG = { high: 'danger', medium: 'warn', low: 'dd', ok: 'ok' };
  var ENT_LEVEL_LABEL = { high: '高风险', medium: '关注', low: '低', ok: '正常' };

  function renderEnterpriseMonitor(ctx) {
    var feedMap   = D().enterpriseFeed  || {};
    var customers = D().customers        || [];
    var target    = ctx.state.bkEntMonTarget;

    /* 首次进入默认第一个客户 */
    if (!target && customers.length) {
      target = customers[0].id;
      ctx.setState({ bkEntMonTarget: target });
    }

    var selectedCust = customers.filter(function (c) { return c.id === target; })[0];
    var events = target ? (feedMap[target] || []) : [];
    var totalAlerts = Object.keys(feedMap).reduce(function (n, k) {
      return n + (feedMap[k] || []).filter(function (e) { return e.level === 'high'; }).length;
    }, 0);

    /* 左侧企业导航 */
    var custRail = customers.map(function (c) {
      var evts = feedMap[c.id] || [];
      var highCount = evts.filter(function (e) { return e.level === 'high'; }).length;
      var isOn = c.id === target;
      return (
        '<button type="button" class="bk-monitor-company-btn' + (isOn ? ' on' : '') +
        '" data-bk-ent-mon="' + esc(c.id) + '">' +
        '<div><div style="font-weight:600;font-size:13px">' + esc(c.name || c.company) + '</div>' +
        '<div style="font-size:11px;color:var(--bk-muted,#64748b)">' +
        esc(c.creditCode ? c.creditCode.slice(0, 8) + '…' : '') + '</div></div>' +
        (highCount ? '<span class="bk-monitor-badge">' + highCount + '</span>' : '') +
        '</button>'
      );
    }).join('');

    /* 右侧事件流 */
    var feedHtml = '';
    if (events.length) {
      feedHtml = events.map(function (e) {
        var tagCls = ENT_LEVEL_TAG[e.level] || 'dd';
        var tagLbl = ENT_LEVEL_LABEL[e.level] || e.level;
        return (
          '<article style="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--bk-border,#e2e8f0)">' +
          '<div style="flex-shrink:0;width:64px;text-align:right">' +
          '<span style="font-size:11px;color:var(--bk-muted,#64748b);line-height:1.4;display:block">' + esc(e.time) + '</span></div>' +
          '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<strong style="font-size:13px">' + esc(e.title) + '</strong>' +
          '<span class="bk-tag ' + tagCls + '" style="font-size:11px">' + esc(tagLbl) + '</span>' +
          '<span class="bk-mini-tag">' + esc(e.type) + '</span></div>' +
          '<p style="margin:0 0 6px;font-size:13px;line-height:1.55;color:var(--bk-text,#1e293b)">' + esc(e.desc) + '</p>' +
          '<span class="bk-muted" style="font-size:11px">来源：' + esc(e.source) + '</span>' +
          '</div></article>'
        );
      }).join('');
    } else {
      feedHtml = '<p class="bk-muted" style="padding:24px 0">暂无该企业的动态记录</p>';
    }

    /* 右侧头部：企业概览 */
    var entHeader = '';
    if (selectedCust) {
      var highCnt = events.filter(function (e) { return e.level === 'high'; }).length;
      entHeader =
        '<div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--bk-bg,#f8fafc);border:1px solid var(--bk-border,#e2e8f0);border-radius:8px;margin-bottom:16px;flex-wrap:wrap">' +
        '<div style="flex:1;min-width:160px">' +
        '<div style="font-weight:700;font-size:15px;margin-bottom:2px">' + esc(selectedCust.name || selectedCust.company) + '</div>' +
        '<div class="bk-muted" style="font-size:12px">' + esc(selectedCust.creditCode || '') + '</div></div>' +
        '<div style="display:flex;gap:10px;align-items:center">' +
        (highCnt ? '<span class="bk-tag danger">' + highCnt + ' 项高风险</span>' : '<span class="bk-tag ok">无高风险</span>') +
        '<span class="bk-tag dd">' + events.length + ' 条动态</span>' +
        '<button type="button" class="bk-btn" data-nav="enterprise/' + esc(selectedCust.id) + '">查看档案</button>' +
        '</div></div>';
    }

    ctx.rootEl.innerHTML =
      '<div class="page-body" style="overflow:auto;height:100%">' +
      '<div class="bk-toolbar" style="margin:0 0 12px">' +
      '<h1 style="margin:0;font-size:20px">企业动态</h1>' +
      '<div class="spacer"></div>' +
      '<span class="bk-muted" style="font-size:12px">工商变更 · 司法涉诉 · 舆情 · 材料预警</span></div>' +
      '<p class="xb-feature-lead">跟踪在管企业的公开信息变更与内部任务预警，及时发现业务风险。</p>' +
      '<div class="bk-monitor-split">' +
      '<div class="bk-monitor-rail">' +
      '<div style="padding:8px 0 6px;font-size:11px;color:var(--bk-muted,#64748b);font-weight:600;text-transform:uppercase;letter-spacing:.5px">在管企业</div>' +
      custRail + '</div>' +
      '<div class="bk-monitor-feed">' + entHeader + feedHtml + '</div>' +
      '</div></div>';

    ctx.rootEl.querySelectorAll('[data-bk-ent-mon]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ bkEntMonTarget: btn.getAttribute('data-bk-ent-mon') });
        renderEnterpriseMonitor(ctx);
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* ─────────────── 内嵌样式 ─────────────── */

  var _stylesInjected = false;
  function ensureMonitorStyles() {
    if (_stylesInjected) return;
    _stylesInjected = true;
    var style = document.createElement('style');
    style.textContent = [
      '.bk-monitor-split{display:grid;grid-template-columns:200px 1fr;gap:0;height:100%;min-height:0}',
      '@media(max-width:700px){.bk-monitor-split{grid-template-columns:1fr}}',
      '.bk-monitor-rail{border-right:1px solid var(--bk-border,#e2e8f0);padding:8px 0;overflow-y:auto;min-height:0}',
      '.bk-monitor-feed{padding:0 0 0 20px;overflow-y:auto;min-height:0}',
      '.bk-monitor-company-btn{display:flex;justify-content:space-between;align-items:center;width:100%;padding:9px 12px;background:none;border:none;cursor:pointer;border-radius:6px;text-align:left;gap:8px;transition:background .15s}',
      '.bk-monitor-company-btn:hover{background:var(--bk-bg,#f8fafc)}',
      '.bk-monitor-company-btn.on{background:var(--bk-accent-light,#eff6ff);color:var(--bk-primary,#2563eb)}',
      '.bk-monitor-badge{background:#ef4444;color:#fff;border-radius:99px;padding:1px 6px;font-size:11px;font-weight:700;flex-shrink:0}',
      '.bk-monitor-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex-shrink:0}',
      '.bk-monitor-dot.danger{background:#ef4444}',
      '.bk-monitor-dot.ok{background:#16a34a}',
      '.bk-monitor-dot.neutral{background:#94a3b8}',
      '.bk-mini-tag{display:inline-block;background:var(--bk-bg,#f1f5f9);border:1px solid var(--bk-border,#e2e8f0);border-radius:4px;padding:1px 6px;font-size:11px;color:var(--bk-muted,#64748b)}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ─────────────── Router ─────────────── */

  function render(route, ctx) {
    route = (route || '').replace(/^\//, '');
    if (route === 'monitor') {
      ensureMonitorStyles();
      renderProjectMonitor(ctx);
      return true;
    }
    if (route === 'enterprise-monitor') {
      ensureMonitorStyles();
      renderEnterpriseMonitor(ctx);
      return true;
    }
    return false;
  }

  window.BankMonitorPages = {
    render: render,
    renderProjectMonitor: renderProjectMonitor,
    renderEnterpriseMonitor: renderEnterpriseMonitor
  };
})();
