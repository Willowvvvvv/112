/**
 * 银行版 IA v1.3 · 能力中心 / 任务中心 / 我的报告 / 管理后台
 */
(function () {
  'use strict';

  function data() {
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

  /** 对齐 PE pageSkills：分类 tab + xb-skill-grid；有 route 进银行页，无 route 则 toast 示意 */
  function capCtaLabel(catId) {
    if (catId === 'agents') return '召唤';
    if (catId === 'connectors') return '连接';
    return '使用';
  }

  function capCard(c, catLabel, catId) {
    var later = !!c.later || !c.ready;
    var cls = later ? 'xb-skill-card xb-skill-card--muted' : 'xb-skill-card';
    var tag = c.tag || catLabel;
    var isReportLaunch = c.launch === 'report' && c.ready && !c.later;
    var cta = capCtaLabel(catId);
    var right = later
      ? '<span class="xb-mini-tag">后续</span>'
      : isReportLaunch
        ? '<button type="button" class="xb-btn-mini-primary" data-cap-launch="' +
          esc(c.id) +
          '">' +
          cta +
          '</button>'
        : c.route
          ? '<button type="button" class="xb-btn-mini-primary" data-nav="' +
            esc(c.route) +
            '">' +
            cta +
            '</button>'
          : '<button type="button" class="xb-btn-mini-primary" data-cap-demo="' +
            esc(c.title) +
            '">' +
            cta +
            '</button>';
    var meta = c.meta
      ? '<p class="xb-mini-meta" style="margin:6px 0 0;font-size:11px;color:var(--xb-muted,#6b7280)">' +
        esc(c.meta) +
        '</p>'
      : '';
    return (
      '<article class="' +
      cls +
      '"><div style="display:flex;justify-content:space-between;gap:8px">' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0"><strong>' +
      esc(c.title) +
      '</strong><span class="xb-mini-tag">' +
      esc(tag) +
      '</span>' +
      (later ? '' : '<span class="xb-mini-tag-official">可用</span>') +
      '</div>' +
      right +
      '</div><p>' +
      esc(c.desc) +
      '</p>' +
      meta +
      '</article>'
    );
  }

  function renderCapabilities(ctx) {
    var caps = data().capabilities || {};
    var cats =
      data().capabilityCategories ||
      [
        { id: 'report', label: '报告内容' },
        { id: 'analyze', label: '分析工具' },
        { id: 'agents', label: 'Agent' },
        { id: 'skills', label: 'Skill' },
        { id: 'connectors', label: '连接器' },
        { id: 'research', label: '研究能力' }
      ];
    var cat = ctx.state.bankCapCategory || (cats[0] && cats[0].id) || 'report';
    if (
      !cats.some(function (c) {
        return c.id === cat;
      })
    ) {
      cat = cats[0].id;
    }
    var catMeta =
      cats.filter(function (c) {
        return c.id === cat;
      })[0] || cats[0];
    var list = caps[cat] || [];
    var lead =
      cat === 'agents'
        ? 'Agent 与 PE 能力市场专家同源；可进银行工作台的会直接跳转，其余为示意召唤。'
        : cat === 'skills'
          ? 'Skill 与 PE 能力市场技能同源；可进银行工作台的会直接跳转，其余为示意使用。'
          : cat === 'connectors'
            ? '数据与工具连接器扩展公开面与研究能力；接入后供报告、Agent 与 Skill 调用。'
            : '不经过 Chat 也可直接点选。Chat 里用自然语言会调起同一套能力。';
    var catTabs = cats
      .map(function (c) {
        return (
          '<button type="button" class="xb-skills-tab' +
          (cat === c.id ? ' on' : '') +
          '" data-cap-cat="' +
          esc(c.id) +
          '">' +
          esc(c.label) +
          '</button>'
        );
      })
      .join('');

    ctx.rootEl.innerHTML =
      '<div class="page-toolbar"><h1>能力中心</h1><div class="spacer"></div>' +
      '<span class="bk-muted" style="font-size:12px">报告 · 工具 · Agent · Skill · 连接器 · 研究</span></div>' +
      '<div class="page-body" style="overflow:auto;height:calc(100% - 52px)">' +
      '<p class="xb-feature-lead">' +
      esc(lead) +
      '</p>' +
      '<div class="xb-skills-tabs xb-skills-category-tabs" role="tablist">' +
      catTabs +
      '</div>' +
      '<div class="xb-skill-grid">' +
      list
        .map(function (item) {
          return capCard(item, catMeta.label, cat);
        })
        .join('') +
      '</div></div>';

    ctx.rootEl.querySelectorAll('[data-cap-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ bankCapCategory: btn.getAttribute('data-cap-cat') });
        renderCapabilities(ctx);
      });
    });
    ctx.rootEl.querySelectorAll('[data-cap-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-cap-demo') || '该能力';
        if (!ctx.toast) return;
        if (cat === 'agents') {
          ctx.toast('已召唤「' + name + '」示意');
        } else if (cat === 'connectors') {
          ctx.toast('已连接「' + name + '」示意');
        } else {
          ctx.toast('「' + name + '」示意 · 正式环境可调用');
        }
      });
    });
    ctx.rootEl.querySelectorAll('[data-cap-launch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var capId = btn.getAttribute('data-cap-launch');
        if (
          window.BankReportTaskPages &&
          typeof window.BankReportTaskPages.openLaunchForm === 'function'
        ) {
          window.BankReportTaskPages.openLaunchForm(ctx, { capId: capId });
          return;
        }
        if (ctx.toast) ctx.toast('报告发起模块未加载');
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /** 筛选 tab：等待材料 / 失败已并入「处理中」，不再单独占 tab */
  var TASK_TABS = [
    { id: 'all', label: '全部' },
    { id: 'in_progress', label: '处理中' },
    { id: 'done', label: '已完成' }
  ];

  /** 「处理中」覆盖：待我处理 / 跑着 / 等材料 / 失败 */
  var TASK_IN_PROGRESS = ['action', 'running', 'wait_mat', 'failed'];

  function taskStatusLabel(s) {
    return (
      {
        action: '待我处理',
        running: '处理中',
        wait_mat: '等待材料',
        failed: '失败',
        done: '已完成'
      }[s] || s
    );
  }

  function taskTagClass(s) {
    return (
      {
        action: 'warn',
        running: 'dd',
        wait_mat: 'warn',
        failed: 'danger',
        done: 'ok'
      }[s] || 'dd'
    );
  }

  function taskMatchesTab(status, tab) {
    if (tab === 'all') return true;
    if (tab === 'done') return status === 'done';
    if (tab === 'in_progress') return TASK_IN_PROGRESS.indexOf(status) !== -1;
    /* 旧 tab id（action / running / wait_mat / failed）兼容：落到对应集合 */
    if (tab === 'action' || tab === 'running' || tab === 'wait_mat' || tab === 'failed') {
      return TASK_IN_PROGRESS.indexOf(status) !== -1;
    }
    return status === tab;
  }

  function renderTasks(ctx) {
    var tab = ctx.state.bankTaskTab || 'all';
    if (tab === 'action' || tab === 'running' || tab === 'wait_mat' || tab === 'failed') {
      tab = 'in_progress';
      ctx.setState({ bankTaskTab: 'in_progress' });
    }
    var list = (data().tasks || []).filter(function (t) {
      return taskMatchesTab(t.status, tab);
    });
    ctx.rootEl.innerHTML =
      '<div class="page-body" style="overflow:auto;height:100%">' +
      '<div class="bk-toolbar" style="margin:0 0 12px"><h1 style="margin:0;font-size:20px">任务中心</h1>' +
      '<div class="spacer"></div>' +
      '<span class="bk-muted" style="font-size:12px">OCR 是后台步骤，不单独占一级菜单</span></div>' +
      '<div class="xb-skills-tabs" role="tablist" style="margin-bottom:14px">' +
      TASK_TABS.map(function (t) {
        return (
          '<button type="button" class="xb-skills-tab' +
          (tab === t.id ? ' on' : '') +
          '" data-task-tab="' +
          t.id +
          '">' +
          esc(t.label) +
          '</button>'
        );
      }).join('') +
      '</div>' +
      (list.length
        ? '<div class="todo-list">' +
          list
            .map(function (t) {
              return (
                '<button type="button" class="todo-item" data-nav="' +
                esc(t.route) +
                '"><div><div class="title">' +
                esc(t.title) +
                '</div><div class="desc">' +
                esc(t.enterprise) +
                ' · ' +
                esc(t.updated) +
                '</div><div class="meta"><span class="tag ' +
                taskTagClass(t.status) +
                '">' +
                esc(taskStatusLabel(t.status)) +
                '</span></div></div><span class="todo-cta">打开 →</span></button>'
              );
            })
            .join('') +
          '</div>'
        : '<p class="bk-muted">该状态下暂无任务</p>') +
      '</div>';
    ctx.rootEl.querySelectorAll('[data-task-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ bankTaskTab: btn.getAttribute('data-task-tab') });
        renderTasks(ctx);
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  var ART_TABS = [
    { id: 'all', label: '全部报告' },
    { id: 'report', label: '报告' },
    { id: 'table', label: '表格' },
    { id: 'list', label: '清单' },
    { id: 'graph', label: '图谱' }
  ];

  var ART_DONE_STATUS = {
    已完成: 1,
    已定稿: 1,
    可下载: 1
  };

  function isArtifactDelivered(a) {
    return !!(a && ART_DONE_STATUS[a.status]);
  }

  function renderArtifacts(ctx) {
    var tab = ctx.state.bankArtTab || 'all';
    if (tab === 'deck') {
      tab = 'all';
      ctx.setState({ bankArtTab: 'all' });
      if (ctx.toast) ctx.toast('已打开我的报告');
    }
    var list = (data().artifacts || []).filter(function (a) {
      return isArtifactDelivered(a) && (tab === 'all' || a.kind === tab);
    });
    ctx.rootEl.innerHTML =
      '<div class="page-body" style="overflow:auto;height:100%">' +
      '<div class="bk-toolbar" style="margin:0 0 12px"><h1 style="margin:0;font-size:20px">我的报告</h1>' +
      '<div class="spacer"></div>' +
      '<span class="bk-muted" style="font-size:12px">交付清单：已完成报告的预览 / 导出 / 打开</span></div>' +
      '<div class="xb-skills-tabs" role="tablist" style="margin-bottom:14px">' +
      ART_TABS.map(function (t) {
        return (
          '<button type="button" class="xb-skills-tab' +
          (tab === t.id ? ' on' : '') +
          '" data-art-tab="' +
          t.id +
          '">' +
          esc(t.label) +
          '</button>'
        );
      }).join('') +
      '</div>' +
      (list.length
        ? '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>报告</th><th>企业</th><th>状态</th><th>更新</th><th></th></tr></thead><tbody>' +
          list
            .map(function (a) {
              return (
                '<tr><td><strong>' +
                esc(a.title) +
                '</strong><div class="bk-muted">' +
                esc(a.kind) +
                '</div></td><td>' +
                esc(a.enterprise) +
                '</td><td><span class="bk-tag ok">' +
                esc(a.status) +
                '</span></td><td>' +
                esc(a.updated) +
                '</td><td style="white-space:nowrap">' +
                '<button type="button" class="bk-btn" data-nav="' +
                esc(a.route) +
                '">打开</button> ' +
                '<button type="button" class="bk-btn" data-art-act="preview" data-art-id="' +
                esc(a.id) +
                '">预览</button> ' +
                '<button type="button" class="bk-btn" data-art-act="export" data-art-id="' +
                esc(a.id) +
                '">导出</button>' +
                '</td></tr>'
              );
            })
            .join('') +
          '</tbody></table></div>'
        : '<p class="bk-muted">暂无已完成报告。生成中与草稿请到任务中心 / 任务工作区查看。</p>') +
      '<p class="bk-muted" style="margin-top:16px;font-size:12px">本页只列已交付稿；编辑与跑批在任务工作区。</p></div>';
    ctx.rootEl.querySelectorAll('[data-art-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ bankArtTab: btn.getAttribute('data-art-tab') });
        renderArtifacts(ctx);
      });
    });
    ctx.rootEl.querySelectorAll('[data-art-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-art-act');
        var id = btn.getAttribute('data-art-id');
        var hit = (data().artifacts || []).filter(function (a) {
          return a.id === id;
        })[0];
        if (!hit) return;
        if (act === 'preview') {
          if (ctx.toast) ctx.toast('预览「' + hit.title + '」（示意）');
          return;
        }
        if (act === 'export') {
          if (ctx.toast) ctx.toast('导出「' + hit.title + '」· Word / PDF（示意）');
        }
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderAdminHub(ctx) {
    var links = data().adminLinks || [];
    ctx.rootEl.innerHTML =
      '<div class="page-body" style="overflow:auto;height:100%">' +
      '<div class="bk-toolbar" style="margin:0 0 12px"><h1 style="margin:0;font-size:20px">管理后台</h1>' +
      '<div class="spacer"></div></div>' +
      '<p class="xb-feature-lead">配置模版、材料清单、财务规则与权限。</p>' +
      '<div class="xb-skill-grid">' +
      links
        .map(function (l) {
          return (
            '<article class="xb-skill-card"><div class="xb-skill-card-top"><strong>' +
            esc(l.title) +
            '</strong></div><p>' +
            esc(l.desc) +
            '</p><div class="xb-skill-card-actions">' +
            '<button type="button" class="xb-btn-mini-primary" data-nav="' +
            esc(l.route) +
            '">打开</button></div></article>'
          );
        })
        .join('') +
      '</div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /**
   * @returns {boolean} true if handled
   */
  function render(route, ctx) {
    route = (route || '').replace(/^\//, '');
    if (route === 'capabilities') {
      renderCapabilities(ctx);
      return true;
    }
    if (route === 'tasks') {
      renderTasks(ctx);
      return true;
    }
    if (route === 'artifacts') {
      renderArtifacts(ctx);
      return true;
    }
    if (route === 'admin') {
      renderAdminHub(ctx);
      return true;
    }
    return false;
  }

  window.BankIaPages = {
    render: render,
    renderCapabilities: renderCapabilities,
    renderTasks: renderTasks,
    renderArtifacts: renderArtifacts,
    renderAdminHub: renderAdminHub
  };
})();
