/**
 * 银行版 · 项目壳 v1.2（2026-07-20）
 * 对标 PE 壳：首页 Chat / 项目内 左文件树 | 中 Chat | 右 AI 产出
 * 右侧 OCR / 报告：结构截图复刻芯鑫 v2.1（样式 token 用启明星）
 * 无流程节点条主导；#bank:pack/ocr → 项目右区 OCR
 */
(function () {
  'use strict';

  var _local = {
    filesOpen: true,
    openFolder: '材料袋',
    aiMenuOpen: false,
    ocrSheet: 'bs',
    ocrDataTab: 'data',
    ocrHi: '货币资金',
    evidencePanelTab: 'source',
    evidenceCitationData: null
  };

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

  function gapMark(text) {
    return '<span class="bk-dd-gap-inline">' + esc(text) + '</span>';
  }

  function renderSecBody(body) {
    if (!body) return gapMark('【缺数据】本章依据不足，请补材料或容忍缺口定稿');
    if (typeof body === 'object') {
      if (body.html) return body.html;
      if (body.parts) {
        return body.parts
          .map(function (p) {
            if (p.type === 'gap') return gapMark(p.text);
            if (p.type === 'html') return p.html || '';
            return esc(p.text);
          })
          .join('');
      }
    }
    return esc(String(body));
  }

  function renderSectionHtml(s) {
    var html = s.html ? s.html : renderSecBody(s.body);
    var active = window.__bkActiveCite || '';
    if (active && html) {
      html = html.replace(
        new RegExp(
          'class="bk-cite"(?=[^>]*\\bdata-arg="' +
            active.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            '")',
          'g'
        ),
        'class="bk-cite is-active"'
      );
    }
    return html;
  }

  function citesOf(p) {
    return p.cites || p.traces || [];
  }

  function normalizeCite(t, idx) {
    var id = t.id || 'c' + (idx + 1);
    return {
      id: id,
      label: t.label || String(idx + 1),
      claim: t.claim || t.title || '',
      source: t.source || '',
      page: t.page || '',
      detail: t.detail || ''
    };
  }

  function projectsOf(ctx) {
    if (!ctx.state.bankProjects) {
      ctx.state.bankProjects = (data().projects || []).map(function (p) {
        return JSON.parse(JSON.stringify(p));
      });
    }
    return ctx.state.bankProjects;
  }

  function customersOf(ctx) {
    if (!ctx.state.bankCustomers) {
      ctx.state.bankCustomers = (data().customers || []).map(function (c) {
        return JSON.parse(JSON.stringify(c));
      });
    }
    return ctx.state.bankCustomers;
  }

  function getProject(ctx, id) {
    return projectsOf(ctx).find(function (p) {
      return p.id === id;
    });
  }

  function getCustomer(ctx, id) {
    return customersOf(ctx).find(function (c) {
      return c.id === id;
    });
  }

  function ensureProjectTrees(p) {
    if (!p.fileTree) {
      var mats = p.materials || [];
      p.fileTree = [
        {
          folder: '材料袋',
          files: mats.map(function (m) {
            return {
              id: m.id,
              name: m.name + (m.status === 'missing' ? ' · 缺' : ''),
              missing: m.status === 'missing',
              needsOcr: !!m.needsOcr
            };
          })
        },
        {
          folder: 'AI 产出',
          files: [
            { id: 'out-ocr', name: '财报 OCR 校对', kind: 'ocr' },
            { id: 'out-report', name: '尽调报告', kind: 'report' },
            { id: 'out-public', name: '公开面速览', kind: 'public' }
          ]
        }
      ];
    }
    if (!p.aiOutputs) {
      p.aiOutputs = [
        { id: 'ocr', title: '财报 OCR 校对', kind: 'ocr', version: 'v1', time: p.updated || '' },
        { id: 'report', title: '尽调报告', kind: 'report', version: '草稿', time: p.updated || '' },
        { id: 'public', title: '公开面速览', kind: 'public', version: 'HTML', time: '' }
      ];
    }
  }

  function persistProject(ctx, p) {
    var list = projectsOf(ctx);
    var i = list.findIndex(function (x) {
      return x.id === p.id;
    });
    if (i >= 0) list[i] = p;
    ctx.setState({ bankProjects: list });
  }

  function bindNav(root, navigate) {
    root.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(el.getAttribute('data-nav'));
      });
    });
  }

  function closeBankModals() {
    if (window.__bkNpEsc) {
      document.removeEventListener('keydown', window.__bkNpEsc);
      window.__bkNpEsc = null;
    }
    document.querySelectorAll('.bk-modal-mask').forEach(function (el) {
      el.remove();
    });
  }

  function resetRootLayout(ctx) {
    if (!ctx || !ctx.rootEl) return;
    if (ctx.rootEl.dataset.bkShell) {
      ctx.rootEl.style.height = '';
      ctx.rootEl.style.overflow = '';
      delete ctx.rootEl.dataset.bkShell;
    }
  }

  function defaultChat(p) {
    return [
      {
        role: 'ai',
        text:
          '我是本项目问答助手。可问材料缺口、OCR 进度、报告哪章有缺。生成与改写请用右侧 AI 产出（OCR / 尽调报告），Chat 不写正文。'
      },
      {
        role: 'ai',
        text:
          '当前：' +
          p.name +
          ' · ' +
          p.company +
          '。缺口 ' +
          ((p.gaps && p.gaps.length) || 0) +
          ' 项；' +
          (p.ocrConfirmed ? 'OCR 已确认。' : '有扫描财报待右侧 OCR。')
      }
    ];
  }

  function answerChat(p, q) {
    var s = (q || '').toLowerCase();
    if (/缺|材料|齐/.test(s)) {
      var gaps = (p.gaps || []).map(function (g) {
        return g.title;
      });
      return gaps.length
        ? '还缺：' + gaps.join('、') + '。材料不齐也可生成报告，缺口在报告右窗标红。'
        : '必收材料已齐（示意）。';
    }
    if (/ocr|财报|扫描/.test(s)) {
      return p.ocrConfirmed
        ? 'OCR 已确认，可打开右侧「尽调报告」生成 / 通读。'
        : '请点顶栏「AI 产出」→ 财报 OCR，或点材料袋扫描件进入右侧校对。';
    }
    if (/风险|怎么样|这单/.test(s)) {
      return (
        p.company +
        '：公开面未见失信/被执行（示意）；财务侧应收增速偏高，见报告财务章。投否由业务决策。'
      );
    }
    if (/报告|重生|改/.test(s)) {
      return '改报告请用右侧文档章旁「重新生成」，或 AI 产出菜单打开尽调报告。';
    }
    return '已收到。可继续问材料 / OCR / 风险；打开产出请用顶栏「AI 产出」。';
  }

  /* —— 首页 Chat（IA v1.3） —— */
  function renderHomeBank(ctx) {
    var todos = (data().tasks || []).filter(function (t) {
      return t.status === 'action' || t.status === 'wait_mat';
    }).slice(0, 4);
    if (!todos.length) todos = data().homeTodos || [];
    /* 对齐能力中心「报告内容」ready 项；首页不展示 later / 贷后灰态 pill（能力中心仍保留） */
    var reportCaps = ((data().capabilities || {}).report || []).filter(function (c) {
      if (!c) return false;
      if (c.id === 'cap-post-report' || c.later === true) return false;
      if (c.title && String(c.title).indexOf('贷后') >= 0) return false;
      return true;
    });
    var draft = ctx.state.bankHomeDraft || '';
    var custs = (data().customers || []).slice(0, 4);

    ctx.rootEl.innerHTML =
      '<div class="home-page page-scroll bk-home-page">' +
      '<div class="home-stage">' +
      '<div class="home-hero">' +
      '<p class="home-eyebrow">做授信尽调，上财跃启明星 · 银行版</p>' +
      '<h1 class="home-headline">最近想尽调哪家企业？</h1>' +
      '<p class="home-lead"><span>Chat 调能力</span><span class="home-lead-sep">·</span><span>能力中心点选</span><span class="home-lead-sep">·</span><span>报告在我的报告</span></p>' +
      '</div>' +
      '<div class="chip-row">' +
      reportCaps
        .map(function (c) {
          var later = c.ready === false || c.later;
          return (
            '<button type="button" class="bk-home-chip' +
            (later ? ' is-later' : '') +
            '" data-cap-id="' +
            esc(c.id) +
            '"' +
            (later ? ' aria-disabled="true" title="后续开放"' : '') +
            '>' +
            esc(c.title) +
            (later ? '<span class="bk-home-chip-tag">后续</span>' : '') +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="xb-composer-wrap xb-home-composer-wrap">' +
      (ctx.state.bkHomePlusOpen
        ? '<div class="xb-composer-popover-backdrop" id="bkHomePlusBackdrop" aria-hidden="true"></div>' +
          '<div class="xb-composer-float xb-home-plus-float">' +
          '<div class="xb-composer-menu" role="menu">' +
          '<div class="xb-composer-menu-head">添加能力</div>' +
          '<div class="xb-composer-menu-list">' +
          '<button type="button" class="xb-composer-menu-item" data-plus-market="skills">' +
          '<strong>技能</strong><span>打开能力中心 · Skill</span></button>' +
          '<button type="button" class="xb-composer-menu-item" data-plus-market="agents">' +
          '<strong>专家</strong><span>打开能力中心 · Agent</span></button>' +
          '<button type="button" class="xb-composer-menu-item" data-plus-market="connectors">' +
          '<strong>连接器</strong><span>打开能力中心 · 连接器</span></button>' +
          '</div></div></div>'
        : '') +
      '<div class="composer-card">' +
      '<textarea class="composer-textarea" id="bkHomeInput" rows="3" placeholder="例如：帮我生成某科技的授信尽调报告…">' +
      esc(draft) +
      '</textarea>' +
      '<div class="composer-bottom">' +
      '<div class="composer-pills xb-composer-pills">' +
      '<button type="button" class="xb-composer-pill xb-composer-plus' +
      (ctx.state.bkHomePlusOpen ? ' active' : '') +
      '" id="bkHomePlusBtn" title="添加工具" aria-label="添加工具" aria-expanded="' +
      (ctx.state.bkHomePlusOpen ? 'true' : 'false') +
      '"><svg class="xb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg></button>' +
      '</div>' +
      '<button type="button" class="composer-send btn-primary" id="bkHomeSend">开始</button>' +
      '</div></div></div>' +
      '<div class="todo-block">' +
      '<div class="todo-head"><h2>待处理任务 <span style="font-weight:500;color:var(--xb-faint)">· ' +
      todos.length +
      ' 条</span></h2>' +
      '<button type="button" class="btn btn-ghost" style="height:28px" data-nav="tasks">任务中心</button></div>' +
      '<div class="todo-list">' +
      todos
        .map(function (t) {
          var title = t.title || '';
          var desc = t.enterprise || t.desc || '';
          var r = t.route || 'tasks';
          return (
            '<button type="button" class="todo-item" data-nav="' +
            esc(r) +
            '"><div><div class="title">' +
            esc(title) +
            '</div><div class="desc">' +
            esc(desc) +
            '</div></div><span class="todo-cta">打开 →</span></button>'
          );
        })
        .join('') +
      '</div></div>' +
      '<div class="todo-block" style="margin-top:8px">' +
      '<div class="todo-head"><h2>最近企业</h2>' +
      '<button type="button" class="btn btn-ghost" style="height:28px" data-nav="enterprises">全部</button></div>' +
      custs
        .map(function (c) {
          return (
            '<button type="button" class="chat-row" data-nav="enterprise/' +
            esc(c.id) +
            '" style="border:1px solid var(--xb-line);margin-bottom:8px"><strong>' +
            esc(c.name) +
            '</strong><span>' +
            esc(c.industry || '') +
            ' · ' +
            esc(c.creditCode || c.uscc || '') +
            '</span></button>'
          );
        })
        .join('') +
      '</div></div></div>';

    var input = ctx.rootEl.querySelector('#bkHomeInput');
    if (input) {
      input.addEventListener('input', function () {
        ctx.state.bankHomeDraft = input.value;
      });
    }
    ctx.rootEl.querySelectorAll('[data-cap-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-disabled') === 'true' || btn.classList.contains('is-later')) {
          if (ctx.toast) ctx.toast('该报告能力后续开放');
          return;
        }
        var capId = btn.getAttribute('data-cap-id');
        if (!capId) return;
        if (
          window.BankReportTaskPages &&
          typeof window.BankReportTaskPages.openLaunchForm === 'function'
        ) {
          window.BankReportTaskPages.openLaunchForm(ctx, { capId: capId });
        } else {
          ctx.navigate('capabilities');
          if (ctx.toast) ctx.toast('报告发起模块未加载 · 已打开能力中心');
        }
      });
    });
    var send = ctx.rootEl.querySelector('#bkHomeSend');
    if (send) {
      send.addEventListener('click', function () {
        var q = ((input && input.value) || '').trim();
        if (!q) {
          ctx.navigate('capabilities');
          return;
        }
        if (/能力中心/.test(q)) {
          ctx.navigate('capabilities');
          return;
        }
        if (/新建|建项|尽调/.test(q) && !/报告|生成/.test(q)) {
          openNewProjectModal(ctx);
          return;
        }
        if (/受益所有人|UBO|ubo/.test(q)) {
          ctx.toast('已识别：调用「受益所有人报告」· 同一套发起表单');
          if (
            window.BankReportTaskPages &&
            typeof window.BankReportTaskPages.openLaunchForm === 'function'
          ) {
            window.BankReportTaskPages.openLaunchForm(ctx, {
              capId: 'cap-ubo-report'
            });
          } else {
            ctx.navigate('task/task-huacheng-ubo');
          }
          return;
        }
        if (/财务分析报告|财务分析/.test(q) && !/尽调|授信/.test(q)) {
          ctx.toast('已识别：调用「财务分析报告」· 同一套发起表单');
          if (
            window.BankReportTaskPages &&
            typeof window.BankReportTaskPages.openLaunchForm === 'function'
          ) {
            window.BankReportTaskPages.openLaunchForm(ctx, {
              capId: 'cap-fin-report'
            });
          } else {
            ctx.navigate('task/task-huacheng-fin');
          }
          return;
        }
        if (/风险排查|风险报告/.test(q)) {
          ctx.toast('已识别：调用「企业风险排查报告」· 同一套发起表单');
          if (
            window.BankReportTaskPages &&
            typeof window.BankReportTaskPages.openLaunchForm === 'function'
          ) {
            window.BankReportTaskPages.openLaunchForm(ctx, {
              capId: 'cap-risk-report'
            });
          } else {
            ctx.navigate('task/task-huacheng-risk');
          }
          return;
        }
        if (/初筛报告|项目初筛/.test(q)) {
          ctx.toast('已识别：调用「项目初筛报告」· 同一套发起表单');
          if (
            window.BankReportTaskPages &&
            typeof window.BankReportTaskPages.openLaunchForm === 'function'
          ) {
            window.BankReportTaskPages.openLaunchForm(ctx, {
              capId: 'cap-screen-report'
            });
          } else {
            ctx.navigate('task/task-huacheng-screen');
          }
          return;
        }
        if (/贷后分析|贷后报告|投后分析|投后报告/.test(q)) {
          ctx.toast('贷后分析报告后续开放');
          return;
        }
        if (/生成|尽调报告|授信报告/.test(q)) {
          ctx.toast('已识别：调用「企业尽调报告」· 同一套发起表单（不在 Chat 写正文）');
          if (
            window.BankReportTaskPages &&
            typeof window.BankReportTaskPages.openLaunchForm === 'function'
          ) {
            window.BankReportTaskPages.openLaunchForm(ctx, {
              capId: 'cap-dd-report'
            });
          } else {
            ctx.navigate('task/task-huacheng-dd');
          }
          return;
        }
        if (/OCR|财报识别|扫描/.test(q)) {
          ctx.toast('已识别：调用「财报识别与分析」');
          ctx.navigate('project/proj-huacheng/ocr');
          return;
        }
        var hit = projectsOf(ctx).find(function (p) {
          return q.indexOf(p.company) >= 0 || q.indexOf(p.name) >= 0 || /某科技/.test(q);
        });
        if (hit) {
          ctx.navigate('enterprise/' + (hit.companyId || 'cust-huacheng'));
          return;
        }
        var cust = customersOf(ctx).find(function (c) {
          return q.indexOf(c.name) >= 0;
        });
        if (cust) {
          ctx.navigate('enterprise/' + cust.id);
          return;
        }
        ctx.toast('未匹配到企业，可打开企业档案或能力中心');
        ctx.navigate('enterprises');
      });
    }
    var plusBtn = ctx.rootEl.querySelector('#bkHomePlusBtn');
    if (plusBtn) {
      plusBtn.addEventListener('click', function () {
        ctx.setState({ bkHomePlusOpen: !ctx.state.bkHomePlusOpen });
        renderHomeBank(ctx);
      });
    }
    var plusBd = ctx.rootEl.querySelector('#bkHomePlusBackdrop');
    if (plusBd) {
      plusBd.addEventListener('click', function () {
        ctx.setState({ bkHomePlusOpen: false });
        renderHomeBank(ctx);
      });
    }
    ctx.rootEl.querySelectorAll('[data-plus-market]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-plus-market') || 'skills';
        ctx.setState({ bkHomePlusOpen: false, bankCapCategory: cat });
        ctx.toast(
          cat === 'skills'
            ? '已打开能力中心 · Skill'
            : cat === 'connectors'
              ? '已打开能力中心 · 连接器'
              : '已打开能力中心 · Agent'
        );
        ctx.navigate('capabilities');
      });
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— 项目列表 —— */
  function renderProjects(ctx) {
    var list = projectsOf(ctx);
    var q = (ctx.state.bankProjQ || '').trim();
    var rows = list;
    if (q) {
      rows = list.filter(function (p) {
        return (p.name + p.company + (p.owner || '')).indexOf(q) >= 0;
      });
    }
    ctx.rootEl.innerHTML =
      '<div class="bk-list-page">' +
      '<div class="bk-toolbar"><h1>授信项目</h1><div class="spacer"></div>' +
      '<input class="bk-search" id="bkProjQ" placeholder="搜项目 / 企业" value="' +
      esc(q) +
      '" />' +
      '<button type="button" class="bk-btn-primary" id="bkNewProj">+ 新建项目</button></div>' +
      '<div class="bk-body">' +
      '<p class="bk-muted" style="margin:0 0 12px">进入项目 = 左文件树 · 中 Chat · 右 AI 产出（OCR / 报告）。无流程向导主导。</p>' +
      (rows.length
        ? '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>项目</th><th>企业</th><th>额度/期限</th><th>状态</th><th>更新</th></tr></thead><tbody>' +
          rows
            .map(function (p) {
              return (
                '<tr data-nav="project/' +
                esc(p.id) +
                '"><td><strong>' +
                esc(p.name) +
                '</strong></td><td>' +
                esc(p.company) +
                '</td><td>' +
                esc(p.amount || '—') +
                ' · ' +
                esc(p.term || '—') +
                '</td><td><span class="bk-tag ' +
                (p.reportGenerated ? 'ok' : (p.gaps || []).length ? 'warn' : 'dd') +
                '">' +
                esc(p.status || '') +
                '</span></td><td>' +
                esc(p.updated || '') +
                '</td></tr>'
              );
            })
            .join('') +
          '</tbody></table></div>'
        : '<div class="bk-empty">暂无项目</div>') +
      '</div></div>';
    var qEl = ctx.rootEl.querySelector('#bkProjQ');
    if (qEl) {
      qEl.addEventListener('input', function () {
        ctx.setState({ bankProjQ: qEl.value });
        renderProjects(ctx);
      });
    }
    ctx.rootEl.querySelector('#bkNewProj').addEventListener('click', function () {
      openNewProjectModal(ctx);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  /* —— 客户列表 + 详情（加厚） —— */
  function renderCustomers(ctx) {
    var list = customersOf(ctx);
    ctx.rootEl.innerHTML =
      '<div class="bk-list-page">' +
      '<div class="bk-toolbar"><h1>企业档案</h1><div class="spacer"></div>' +
      '<button type="button" class="bk-btn-primary" id="bkCustListNew">+ 新建尽调</button></div>' +
      '<div class="bk-body">' +
      '<p class="bk-muted" style="margin:0 0 12px">长期数据底座。首份报告自动建档；多笔事项在档案内展示。一期无独立「客户/项目」一级菜单。</p>' +
      '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>企业</th><th>信用代码</th><th>行业</th><th>在办事项</th></tr></thead><tbody>' +
      list
        .map(function (c) {
          var projs = projectsOf(ctx).filter(function (p) {
            return p.companyId === c.id || p.company === c.name;
          });
          return (
            '<tr data-nav="enterprise/' +
            esc(c.id) +
            '"><td><strong>' +
            esc(c.name) +
            '</strong>' +
            (c.soft ? ' <span class="bk-tag warn">软建</span>' : '') +
            '</td><td>' +
            esc(c.creditCode || '—') +
            '</td><td>' +
            esc(c.industry || '—') +
            '</td><td>' +
            (projs.length ? projs.length + ' 笔' : '无') +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table></div></div></div>';
    var listNew = ctx.rootEl.querySelector('#bkCustListNew');
    if (listNew) {
      listNew.addEventListener('click', function () {
        openNewProjectModal(ctx);
      });
    }
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function renderCustomerDetail(ctx, customerId) {
    var c = getCustomer(ctx, customerId);
    if (!c) {
      ctx.rootEl.innerHTML =
        '<div class="bk-list-page"><div class="bk-toolbar"><h1>企业不存在</h1></div>' +
        '<div class="bk-body"><button class="bk-btn" data-nav="enterprises">返回</button></div></div>';
      bindNav(ctx.rootEl, ctx.navigate);
      return;
    }
    var projs = projectsOf(ctx).filter(function (p) {
      return p.companyId === c.id || p.company === c.name;
    });
    var mats = [];
    var outs = [];
    projs.forEach(function (p) {
      (p.materials || []).forEach(function (m) {
        mats.push({ project: p, mat: m });
      });
      outs.push({
        project: p,
        items: [
          { title: '财报 OCR', ready: !!p.ocrConfirmed, route: 'project/' + p.id + '/ocr' },
          {
            title: '尽调报告',
            ready: true,
            route:
              p.id === 'proj-huacheng'
                ? 'task/task-huacheng-dd'
                : 'task/task-huacheng-dd'
          },
          { title: '公开面速览', ready: !!p.publicBrief, route: 'project/' + p.id + '/public' }
        ]
      });
    });

    ctx.rootEl.innerHTML =
      '<div class="bk-list-page bk-cust-page">' +
      '<div class="bk-toolbar">' +
      '<button type="button" class="bk-btn" data-nav="enterprises">← 企业档案</button>' +
      '<h1 style="margin:0;font-size:18px">' +
      esc(c.name) +
      '</h1><div class="spacer"></div>' +
      '<button type="button" class="bk-btn-primary" id="bkCustNew">新建尽调</button></div>' +
      '<div class="bk-body">' +
      '<div class="bk-cust-hero">' +
      '<div class="bk-muted">' +
      esc(c.creditCode || '信用代码待补') +
      ' · ' +
      esc(c.industry || '行业待补') +
      (c.soft ? ' · <span class="bk-tag warn">软建主档</span>' : '') +
      '</div>' +
      '<p style="margin:10px 0 0;font-size:13px;line-height:1.55;color:var(--xb-muted)">企业档案沉淀材料、结构化数据与历史成果；进入工作台（左文件树 · 中 Chat · 右 OCR/报告）从下方在办事项进入。</p>' +
      '</div>' +
      '<div class="bk-cust-grid">' +
      '<div class="bk-cust-card"><h3>业务事项 · ' +
      projs.length +
      '</h3>' +
      (projs.length
        ? projs
            .map(function (p) {
              return (
                '<div class="bk-cust-row"><div><a data-nav="project/' +
                esc(p.id) +
                '">' +
                esc(p.name) +
                '</a><div class="bk-muted">' +
                esc(p.amount || '') +
                ' · ' +
                esc(p.term || '') +
                '</div></div><span class="bk-tag dd">' +
                esc(p.status || '') +
                '</span></div>'
              );
            })
            .join('')
        : '<p class="bk-muted">暂无业务事项</p>') +
      '</div>' +
      '<div class="bk-cust-card"><h3>相关材料 · ' +
      mats.length +
      '</h3>' +
      (mats.length
        ? mats
            .map(function (x) {
              var gap = x.mat.status === 'missing';
              return (
                '<div class="bk-cust-row"><div><strong style="color:' +
                (gap ? '#b91c1c' : 'inherit') +
                '">' +
                esc(x.mat.name) +
                '</strong><div class="bk-muted">' +
                esc(x.project.name) +
                (x.mat.note ? ' · ' + esc(x.mat.note) : '') +
                '</div></div><span class="bk-tag ' +
                (gap ? 'danger' : 'ok') +
                '">' +
                (gap ? '缺' : '已归类') +
                '</span></div>'
              );
            })
            .join('')
        : '<p class="bk-muted">暂无材料</p>') +
      '</div>' +
      '<div class="bk-cust-card"><h3>AI 产出物</h3>' +
      (outs.length
        ? outs
            .map(function (block) {
              return (
                '<div style="margin-bottom:10px"><div class="bk-muted" style="margin-bottom:4px">' +
                esc(block.project.name) +
                '</div>' +
                block.items
                  .map(function (it) {
                    return (
                      '<div class="bk-cust-row"><a data-nav="' +
                      esc(it.route) +
                      '">' +
                      esc(it.title) +
                      '</a><span class="bk-tag ' +
                      (it.ready ? 'ok' : 'warn') +
                      '">' +
                      (it.ready ? '已有' : '待完成') +
                      '</span></div>'
                    );
                  })
                  .join('') +
                '</div>'
              );
            })
            .join('')
        : '<p class="bk-muted">暂无产出</p>') +
      '</div></div></div></div>';

    ctx.rootEl.querySelector('#bkCustNew').addEventListener('click', function () {
      openNewProjectModal(ctx, c.name);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function openNewProjectModal(ctx, presetCompany) {
    closeBankModals();
    var mask = document.createElement('div');
    mask.className = 'bk-modal-mask';
    mask.innerHTML =
      '<div class="bk-modal" role="dialog" aria-label="新建客户尽调">' +
      '<div class="bk-modal-hd">新建客户尽调</div>' +
      '<div class="bk-modal-bd xb-overlay-scrollbar" style="overflow-y:auto">' +
      '<label class="bk-field-l">企业主体 <span class="req">*必选</span></label>' +
      '<input class="bk-input" id="bkNpCompany" placeholder="搜索已有企业，或输入新名软建" value="' +
      esc(presetCompany || '') +
      '" autocomplete="off" />' +
      '<div id="bkNpSuggest" class="bk-suggest" style="display:none"></div>' +
      '<div id="bkNpSoft" class="bk-soft-hint" style="display:none">客户库无完全匹配 → 将<strong>软建</strong>客户主档。</div>' +
      '<label class="bk-field-l">尽调名称</label>' +
      '<input class="bk-input" id="bkNpName" placeholder="默认：企业名 · 授信尽调" />' +
      '<label class="bk-field-l">额度</label>' +
      '<input class="bk-input" id="bkNpAmount" placeholder="如 3000 万" />' +
      '<label class="bk-field-l">期限</label>' +
      '<input class="bk-input" id="bkNpTerm" placeholder="如 36 个月" />' +
      '</div>' +
      '<div class="bk-modal-ft">' +
      '<button type="button" class="bk-btn" id="bkNpCancel">取消</button>' +
      '<button type="button" class="bk-btn-primary" id="bkNpOk">创建并进入工作台</button>' +
      '</div></div>';
    document.body.appendChild(mask);

    var selected = null;
    var companyInput = mask.querySelector('#bkNpCompany');
    var suggestEl = mask.querySelector('#bkNpSuggest');
    var softEl = mask.querySelector('#bkNpSoft');

    function paintSuggest() {
      var q = companyInput.value.trim();
      selected = null;
      if (!q) {
        suggestEl.style.display = 'none';
        softEl.style.display = 'none';
        return;
      }
      var hits = customersOf(ctx).filter(function (c) {
        return c.name.indexOf(q) >= 0 || (c.creditCode && c.creditCode.indexOf(q) >= 0);
      });
      var exact = hits.find(function (c) {
        return c.name === q;
      });
      if (exact) {
        selected = exact;
        softEl.style.display = 'none';
      } else softEl.style.display = 'block';
      if (!hits.length) {
        suggestEl.style.display = 'none';
        return;
      }
      suggestEl.style.display = 'block';
      suggestEl.innerHTML = hits
        .map(function (c) {
          return (
            '<button type="button" data-cid="' +
            esc(c.id) +
            '">' +
            esc(c.name) +
            '<br/><span class="bk-muted">' +
            esc(c.creditCode || '无代码') +
            '</span></button>'
          );
        })
        .join('');
      suggestEl.querySelectorAll('[data-cid]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var c = customersOf(ctx).find(function (x) {
            return x.id === btn.getAttribute('data-cid');
          });
          if (!c) return;
          selected = c;
          companyInput.value = c.name;
          suggestEl.style.display = 'none';
          softEl.style.display = 'none';
          var nameEl = mask.querySelector('#bkNpName');
          if (!nameEl.value.trim()) nameEl.value = c.name + ' · 授信尽调';
        });
      });
    }

    companyInput.addEventListener('input', paintSuggest);
    if (presetCompany) paintSuggest();

    function close() {
      mask.remove();
    }
    mask.querySelector('#bkNpCancel').addEventListener('click', close);
    mask.addEventListener('click', function (e) {
      if (e.target === mask) close();
    });

    mask.querySelector('#bkNpOk').addEventListener('click', function () {
      var companyName = companyInput.value.trim();
      if (!companyName) {
        ctx.toast('请选择或输入企业主体');
        return;
      }
      var custs = customersOf(ctx);
      var company = selected;
      if (!company || company.name !== companyName) {
        company = custs.find(function (c) {
          return c.name === companyName;
        });
      }
      if (!company) {
        company = {
          id: 'cust-' + Date.now(),
          name: companyName,
          creditCode: '',
          industry: '待补',
          soft: true
        };
        custs.unshift(company);
        ctx.setState({ bankCustomers: custs });
      }
      var name =
        mask.querySelector('#bkNpName').value.trim() || company.name + ' · 授信尽调';
      var proj = {
        id: 'proj-' + Date.now(),
        name: name,
        companyId: company.id,
        company: company.name,
        creditCode: company.creditCode || '',
        amount: mask.querySelector('#bkNpAmount').value.trim() || '待填',
        term: mask.querySelector('#bkNpTerm').value.trim() || '待填',
        packId: 'pack-credit-dd-v1',
        packLabel: '对公授信尽调 Pack v1',
        owner: ctx.state.displayName || '周凯',
        status: '材料整理',
        updated: '刚刚',
        ocrConfirmed: false,
        reportGenerated: false,
        materials: [
          { id: 'm1', name: '营业执照', required: true, status: 'missing' },
          { id: 'm2', name: '近三年审计报告（扫描）', required: true, status: 'missing', needsOcr: true },
          { id: 'm3', name: '公司章程', required: false, status: 'missing' }
        ],
        gaps: [
          { id: 'g1', title: '营业执照', detail: '必收未上传' },
          { id: 'g2', title: '近三年审计报告', detail: '必收未上传' }
        ],
        sections: [],
        traces: [],
        tasks: [],
        publicBrief: null
      };
      var projs = projectsOf(ctx);
      projs.unshift(proj);
      ctx.setState({ bankProjects: projs });
      close();
      ctx.toast('尽调已创建');
      ctx.navigate('project/' + proj.id);
    });
  }

  /* —— 文件树（PE 结构） —— */
  function fileTreeHtml(p) {
    ensureProjectTrees(p);
    if (_local.filesOpen === false) {
      return (
        '<div class="xb-project-files-column is-collapsed" aria-label="project-files">' +
        '<button type="button" class="xb-files-expand-fab" data-act="toggleFiles" title="展开文件栏">›</button></div>'
      );
    }
    var tree = p.fileTree || [];
    var openFolder = _local.openFolder || '材料袋';
    var folders = tree
      .map(function (f) {
        var open = openFolder === f.folder;
        var files = '';
        if (open) {
          files = (f.files || [])
            .map(function (file) {
              return (
                '<div class="xb-files-file' +
                (file.missing ? ' bk-files-gap' : '') +
                '" data-act="openFile" data-arg="' +
                esc(file.id) +
                '" data-kind="' +
                esc(file.kind || '') +
                '" data-ocr="' +
                (file.needsOcr ? '1' : '0') +
                '">' +
                esc(file.name) +
                '</div>'
              );
            })
            .join('');
          if (!files) files = '<div class="xb-files-file is-muted">暂无文件</div>';
        }
        return (
          '<button type="button" class="xb-files-folder' +
          (open ? ' is-open' : '') +
          '" data-act="toggleFolder" data-arg="' +
          esc(f.folder) +
          '"><span class="xb-files-folder-label"><span>' +
          (open ? '▾' : '▸') +
          '</span><span>' +
          esc(f.folder) +
          '</span></span><span class="xb-files-folder-count">' +
          (f.files || []).length +
          '</span></button>' +
          files
        );
      })
      .join('');
    return (
      '<div class="xb-project-files-column" aria-label="project-files">' +
      '<aside class="xb-files-pane">' +
      '<div class="xb-files-head"><span>文件</span>' +
      '<button type="button" class="xb-files-collapse-btn" data-act="toggleFiles" title="收起">‹</button></div>' +
      '<div class="xb-files-tree-scroll">' +
      '<div class="xb-files-sec">项目材料 · 全员可见</div>' +
      folders +
      '</div>' +
      '<button type="button" class="xb-files-upload-btn" data-act="upload">＋ 上传</button>' +
      '</aside></div>'
    );
  }

  function projectBarHtml(p) {
    var outs = p.aiOutputs || [];
    var menu = '';
    if (_local.aiMenuOpen) {
      menu =
        '<div class="xb-ai-menu">' +
        outs
          .map(function (o) {
            return (
              '<button type="button" class="xb-ai-menu-item" data-act="openAi" data-arg="' +
              esc(o.kind || o.id) +
              '"><strong>' +
              esc(o.title) +
              '</strong><span>' +
              esc(o.version || '') +
              ' · ' +
              esc(o.time || '') +
              '</span></button>'
            );
          })
          .join('') +
        '</div>';
    }
    var rightKind = ctxRightKind();
    return (
      '<div class="xb-chat-project-bar">' +
      '<div class="xb-chat-project-bar-title"><strong>' +
      esc(p.name) +
      '</strong><span>' +
      esc(p.company) +
      ' · ' +
      esc(p.amount || '') +
      '</span></div>' +
      '<div class="xb-chat-project-bar-actions">' +
      '<button type="button" class="btn btn-ghost" data-nav="customer/' +
      esc(p.companyId || '') +
      '">客户详情</button>' +
      '<div class="xb-ai-menu-wrap">' +
      '<button type="button" class="btn btn-ghost' +
      (rightKind ? ' btn-primary' : '') +
      '" data-act="toggleAiMenu">AI 产出' +
      (outs.length ? ' <span class="xb-ai-badge">' + outs.length + '</span>' : '') +
      '</button>' +
      menu +
      '</div>' +
      '<button type="button" class="btn btn-ghost" data-act="exportHint">导出 Word</button>' +
      '</div></div>'
    );
  }

  function ctxRightKind() {
    return window.__bkRightKind || null;
  }

  function setRightKind(kind) {
    window.__bkRightKind = kind || null;
  }

  /* —— 右侧 OCR（芯鑫结构） —— */
  function renderOcrArtifact(p) {
    var sheet = _local.ocrSheet || 'bs';
    var dataTab = _local.ocrDataTab || 'data';
    var sheets = [
      { id: 'bs', label: '资产负债表' },
      { id: 'is', label: '利润表' },
      { id: 'cf', label: '现金流量表' }
    ];
    var rows = [
      { seq: '', name: '流动资产', header: true },
      { seq: '1', name: '货币资金', val: '12,045.00', loc: true },
      { seq: '2', name: '应收账款', val: '68,634.15' },
      { seq: '3', name: '存货', val: '21,008.80' },
      { seq: '', name: '资产总计', val: '218,000.00', header: true }
    ];
    var previewLines = [
      { n: '货币资金', v: '12,045.00', hi: _local.ocrHi === '货币资金' },
      { n: '应收账款', v: '68,634.15', hi: _local.ocrHi === '应收账款' },
      { n: '存货', v: '21,008.80', hi: false },
      { n: '流动资产合计', v: '121,467.34', hi: false },
      { n: '资产总计', v: '218,000.00', hi: false }
    ];

    return (
      '<div class="bk-ocr-detail">' +
      '<div class="bk-ocr-detail-top">' +
      '<div class="bk-ocr-title-wrap"><h5>' +
      esc(p.company) +
      ' · 审计报告_2025（扫描）</h5>' +
      '<p>财报 OCR 校对 · 对齐芯鑫 ocr-detail · ' +
      (p.ocrConfirmed ? '已确认' : '待确认') +
      '</p></div>' +
      '<div class="bk-ocr-trial-banner ' +
      (p.ocrConfirmed ? 'ok' : 'warn') +
      '">' +
      (p.ocrConfirmed ? '试算通过 · 已提交' : '试算差 1 项 · 流动资产合计') +
      '</div>' +
      '<div class="bk-ocr-actions">' +
      '<button type="button" class="bk-mini-btn" data-act="ocrRerun">重新识别</button>' +
      '<button type="button" class="bk-mini-btn">暂存</button>' +
      '<button type="button" class="bk-mini-btn primary" data-act="ocrConfirm">提交确认</button>' +
      '</div></div>' +
      '<div class="bk-ocr-sheet-bar">' +
      sheets
        .map(function (s) {
          return (
            '<button type="button" class="bk-ocr-sheet-tab' +
            (sheet === s.id ? ' active' : '') +
            '" data-act="ocrSheet" data-arg="' +
            s.id +
            '">' +
            s.label +
            '</button>'
          );
        })
        .join('') +
      '<span class="bk-ocr-sheet-hint">左侧对照原表，右侧编辑；点「定位」在左侧高亮溯源</span>' +
      '</div>' +
      '<div class="bk-ocr-two-col">' +
      '<div class="bk-ocr-preview-col">' +
      '<div class="bk-ocr-preview-toolbar"><span>原始财报 · 第 1 / 12 页</span>' +
      '<div class="bk-ocr-preview-toolbar-btns">' +
      '<button type="button" title="旋转">↺</button>' +
      '<button type="button" title="缩小">−</button>' +
      '<button type="button" title="放大">+</button>' +
      '<button type="button" title="上一页">‹</button>' +
      '<button type="button" title="下一页">›</button>' +
      '</div></div>' +
      '<div class="bk-ocr-preview-body"><div class="bk-ocr-preview-page">' +
      '<h6>' +
      esc(sheets.find(function (s) {
        return s.id === sheet;
      }).label) +
      '</h6>' +
      '<div class="bk-ocr-pdf-meta">单位：万元 · 合并报表</div>' +
      '<div class="bk-ocr-preview-grid">' +
      previewLines
        .map(function (ln) {
          return (
            '<div class="bk-ocr-preview-line' +
            (ln.hi ? ' hi' : '') +
            '"><span class="n">' +
            esc(ln.n) +
            '</span><span class="v">' +
            esc(ln.v) +
            '</span></div>'
          );
        })
        .join('') +
      '</div></div></div></div>' +
      '<div class="bk-ocr-data-col">' +
      '<div class="bk-ocr-data-subtabs">' +
      '<button type="button" class="bk-ocr-data-subtab' +
      (dataTab === 'data' ? ' active' : '') +
      '" data-act="ocrDataTab" data-arg="data">财报数据</button>' +
      '<button type="button" class="bk-ocr-data-subtab' +
      (dataTab === 'trial' ? ' active' : '') +
      '" data-act="ocrDataTab" data-arg="trial">试算平衡<span class="bk-ocr-sub-badge">1</span></button>' +
      '<button type="button" class="bk-ocr-data-subtab' +
      (dataTab === 'log' ? ' active' : '') +
      '" data-act="ocrDataTab" data-arg="log">修改记录</button>' +
      '</div>' +
      (dataTab === 'data'
        ? '<div class="bk-ocr-data-panel"><div class="bk-ocr-table-scroll"><table class="bk-ocr-data-table"><thead><tr><th class="c">#</th><th>科目</th><th class="r">期末</th><th class="c">定位</th></tr></thead><tbody>' +
          rows
            .map(function (r) {
              if (r.header) {
                return (
                  '<tr class="bk-ocr-row-header"><td class="c"></td><td colspan="3">' +
                  esc(r.name) +
                  '</td></tr>'
                );
              }
              return (
                '<tr><td class="c">' +
                esc(r.seq) +
                '</td><td>' +
                esc(r.name) +
                '</td><td class="r"><input class="bk-ocr-cell-input" value="' +
                esc(r.val) +
                '" /></td><td class="c"><button type="button" class="bk-ocr-link-btn" data-act="ocrLoc" data-arg="' +
                esc(r.name) +
                '">定位</button></td></tr>'
              );
            })
            .join('') +
          '</tbody></table></div></div>'
        : dataTab === 'trial'
          ? '<div class="bk-ocr-data-panel"><div class="bk-ocr-trial-panel">' +
            '<div class="bk-ocr-trial-summary">' +
            '<div class="bk-ocr-trial-card">检查项<b>8</b></div>' +
            '<div class="bk-ocr-trial-card">通过<b>7</b></div>' +
            '<div class="bk-ocr-trial-card">失败<b>1</b></div></div>' +
            '<div class="bk-ocr-trial-row fail"><span>流动资产合计勾稽</span><span>差 121,467.34</span></div>' +
            '<div class="bk-ocr-trial-row pass"><span>资产 = 负债 + 权益</span><span>平衡</span></div>' +
            '<div class="bk-ocr-trial-row pass"><span>货币资金 ≥ 0</span><span>通过</span></div>' +
            '</div></div>'
          : '<div class="bk-ocr-data-panel"><div class="bk-ocr-log-panel">' +
            '<div class="bk-ocr-trial-row"><span>货币资金</span><span>12,000.00 → 12,045.00 · 周凯</span></div>' +
            '<div class="bk-ocr-trial-row"><span>初始识别</span><span>TextIn OCR · 今天 10:12</span></div>' +
            '</div></div>') +
      '</div></div></div>'
    );
  }

  /* —— 右侧报告（芯鑫 dd-report 文档区结构） —— */
  function renderReportArtifact(p, gapOpen, gapTab) {
    var secs = p.sections || [];
    var done = secs.filter(function (s) {
      return !s.gap && s.status !== '空';
    }).length;
    var pct = secs.length ? Math.round((done / secs.length) * 100) : 0;
    var docHtml;
    if (!p.reportGenerated) {
      docHtml =
        '<div class="bk-dd-empty"><p>尚未生成尽调报告</p>' +
        '<p class="bk-muted">材料不齐也可生成；缺口标红</p>' +
        '<button type="button" class="bk-btn-primary" data-act="genReport" style="margin-top:12px">一键生成尽调报告</button></div>';
    } else {
      docHtml =
        '<h2>' +
        esc(p.company) +
        ' · 授信尽调报告</h2>' +
        '<p class="bk-muted">章节骨架对齐机构尽调报告模版（agent-demo org-dd-report-template）· 角标可点开溯源</p>' +
        secs
          .map(function (s, idx) {
            return (
              '<div class="bk-dd-sec" id="bk-sec-' +
              esc(s.id) +
              '"><h3>' +
              esc(s.title) +
              (s.gap
                ? ' <span class="bk-tag danger">缺口</span>'
                : ' <span class="bk-tag ok">' + esc(s.status || '已生成') + '</span>') +
              '<button type="button" class="bk-regen" data-act="regenSec" data-arg="' +
              idx +
              '">↺ 重新生成</button></h3><div class="bk-dd-sec-body">' +
              renderSectionHtml(s) +
              '</div></div>'
            );
          })
          .join('');
    }

    return (
      '<div class="bk-dd-report">' +
      '<div class="bk-dd-head">' +
      '<div class="bk-dd-head-row">' +
      '<h5>项目工作台 · 尽调报告</h5>' +
      '<div class="bk-dd-head-actions">' +
      (p.reportGenerated
        ? '<button type="button" class="bk-mini-btn" data-act="toggleGap">' +
          (gapOpen ? '收起缺口/溯源' : '展开缺口/溯源') +
          '</button>' +
          '<button type="button" class="bk-mini-btn" data-act="regenAll">重新生成</button>'
        : '') +
      '<button type="button" class="bk-mini-btn primary" data-act="exportHint">导出 Word</button>' +
      '</div></div>' +
      '<div class="bk-dd-meta">' +
      esc(p.company) +
      (p.creditCode ? ' · ' + esc(p.creditCode) : '') +
      ' · 额度 ' +
      esc(p.amount || '—') +
      '</div></div>' +
      (p.reportGenerated
        ? '<div class="bk-dd-progress"><div class="bk-dd-progress-meta"><span>' +
          done +
          ' / ' +
          secs.length +
          ' 章已就绪</span><span>完成度</span></div>' +
          '<div class="bk-dd-progress-track"><div class="bk-dd-progress-fill" style="width:' +
          pct +
          '%"></div></div></div>'
        : '') +
      '<div class="bk-dd-layout">' +
      '<div class="bk-dd-main"><div class="bk-dd-doc-shell">' +
      (p.reportGenerated
        ? '<nav class="bk-dd-toc"><div class="bk-dd-toc-label">目录</div>' +
          secs
            .map(function (s) {
              return (
                '<button type="button" data-act="jumpSec" data-arg="' +
                esc(s.id) +
                '">' +
                esc(s.title) +
                '</button>'
              );
            })
            .join('') +
          '</nav>'
        : '') +
      '<div class="bk-dd-doc-scroll xb-overlay-scrollbar" id="bkReportDoc">' +
      docHtml +
      '</div></div></div>' +
      '<aside class="bk-dd-aux' +
      (gapOpen ? ' open' : '') +
      '">' +
      '<div class="bk-dd-aux-tabs">' +
      '<button type="button" class="' +
      (gapTab === 'gaps' ? 'on' : '') +
      '" data-act="gapTab" data-arg="gaps">缺少什么</button>' +
      '<button type="button" class="' +
      (gapTab === 'trace' ? 'on' : '') +
      '" data-act="gapTab" data-arg="trace">溯源</button></div>' +
      '<div class="bk-dd-aux-bd xb-overlay-scrollbar">' +
      (gapTab === 'gaps'
        ? (p.gaps || []).length
          ? (p.gaps || [])
              .map(function (g) {
                return (
                  '<div class="bk-trace-item" style="padding:8px 0;border-bottom:1px solid #f0f2f5"><strong style="color:#b91c1c">' +
                  esc(g.title) +
                  '</strong><div class="bk-muted">' +
                  esc(g.detail || '') +
                  '</div></div>'
                );
              })
              .join('')
          : '<p class="bk-muted">暂无材料缺口</p>'
        : (function () {
            var list = citesOf(p).map(normalizeCite);
            var active = window.__bkActiveCite || '';
            if (!list.length) {
              return '<p class="bk-muted">生成后可查看段落溯源</p>';
            }
            return list
              .map(function (t) {
                return (
                  '<div class="bk-trace-item' +
                  (t.id === active ? ' is-active' : '') +
                  '" id="bk-trace-' +
                  esc(t.id) +
                  '" data-cite-id="' +
                  esc(t.id) +
                  '"><div class="bk-trace-lab">[' +
                  esc(t.label) +
                  '] ' +
                  esc(t.claim) +
                  '</div><div class="bk-muted">' +
                  esc(t.source) +
                  (t.page ? ' · ' + esc(t.page) : '') +
                  '</div>' +
                  (t.detail
                    ? '<div class="bk-trace-detail">' + esc(t.detail) + '</div>'
                    : '') +
                  '</div>'
                );
              })
              .join('');
          })()) +
      '</div></aside></div></div>'
    );
  }

  /* —— 三栏布局：报告列（无 bk-dd-aux，仅主报告内容） —— */
  function bankReportColHtml(p) {
    var secs = p.sections || [];
    var done = secs.filter(function (s) { return !s.gap && s.status !== '空'; }).length;
    var pct = secs.length ? Math.round((done / secs.length) * 100) : 0;
    var head =
      window.DemoOcrChrome && window.DemoOcrChrome.artifactTabsHeaderHtml
        ? window.DemoOcrChrome.artifactTabsHeaderHtml({
            active: 'report',
            closeAct: 'closeRight',
            tabs: [
              { id: 'ocr', label: 'OCR' },
              { id: 'report', label: '报告' },
              { id: 'public', label: '公开面' }
            ]
          })
        : '<div class="xb-right-pane-h"><span>尽调报告</span><button type="button" class="btn btn-ghost" data-act="closeRight">关闭</button></div>';

    var docHtml;
    if (!p.reportGenerated) {
      docHtml =
        '<div class="bk-dd-empty"><p>尚未生成尽调报告</p>' +
        '<p class="bk-muted">材料不齐也可生成；缺口标红</p>' +
        '<button type="button" class="bk-btn-primary" data-act="genReport" style="margin-top:12px">一键生成尽调报告</button></div>';
    } else {
      docHtml =
        '<h2>' + esc(p.company) + ' · 授信尽调报告</h2>' +
        '<p class="bk-muted">章节骨架对齐机构尽调报告模版 · 角标可点开溯源</p>' +
        secs.map(function (s, idx) {
          return (
            '<div class="bk-dd-sec" id="bk-sec-' + esc(s.id) + '"><h3>' +
            esc(s.title) +
            (s.gap
              ? ' <span class="bk-tag danger">缺口</span>'
              : ' <span class="bk-tag ok">' + esc(s.status || '已生成') + '</span>') +
            '<button type="button" class="bk-regen" data-act="regenSec" data-arg="' + idx + '">↺ 重新生成</button>' +
            '</h3><div class="bk-dd-sec-body">' + renderSectionHtml(s) + '</div></div>'
          );
        }).join('');
    }

    return (
      '<aside class="xb-right-pane xb-report-panel-col" data-ocr-fs-root="1" aria-label="尽调报告">' +
      head +
      '<div class="xb-right-pane-body" style="padding:0;overflow:hidden;display:flex;flex-direction:column;min-height:0">' +
      '<div class="bk-dd-report" style="display:flex;flex-direction:column;height:100%;overflow:hidden">' +
      '<div class="bk-dd-head">' +
      '<div class="bk-dd-head-row">' +
      '<h5>项目工作台 · 尽调报告</h5>' +
      '<div class="bk-dd-head-actions">' +
      (p.reportGenerated
        ? '<button type="button" class="bk-mini-btn" data-act="regenAll">重新生成</button>'
        : '') +
      '<button type="button" class="bk-mini-btn primary" data-act="exportHint">导出 Word</button>' +
      '</div></div>' +
      '<div class="bk-dd-meta">' +
      esc(p.company) + (p.creditCode ? ' · ' + esc(p.creditCode) : '') +
      ' · 额度 ' + esc(p.amount || '—') +
      '</div></div>' +
      (p.reportGenerated
        ? '<div class="bk-dd-progress"><div class="bk-dd-progress-meta"><span>' +
          done + ' / ' + secs.length + ' 章已就绪</span><span>完成度</span></div>' +
          '<div class="bk-dd-progress-track"><div class="bk-dd-progress-fill" style="width:' + pct + '%"></div></div></div>'
        : '') +
      '<div class="bk-dd-layout" style="flex:1;overflow:hidden">' +
      '<div class="bk-dd-main" style="width:100%"><div class="bk-dd-doc-shell">' +
      (p.reportGenerated
        ? '<nav class="bk-dd-toc"><div class="bk-dd-toc-label">目录</div>' +
          secs.map(function (s) {
            return '<button type="button" data-act="jumpSec" data-arg="' + esc(s.id) + '">' + esc(s.title) + '</button>';
          }).join('') +
          '</nav>'
        : '') +
      '<div class="bk-dd-doc-scroll xb-overlay-scrollbar" id="bkReportDoc">' +
      docHtml +
      '</div></div></div></div>' +
      '</div></div></aside>'
    );
  }

  /* —— 三栏布局：证据面板（银行版，使用通用 ev-* CSS） —— */
  function bankEvidencePanelHtml(p) {
    var tab = _local.evidencePanelTab || 'source';
    var tabs = [
      { id: 'issue', label: '材料缺口' },
      { id: 'finding', label: '关键发现' },
      { id: 'source', label: '溯源' }
    ];
    var tabsHtml = tabs.map(function (t) {
      return (
        '<button type="button" class="ev-tab' + (tab === t.id ? ' active' : '') +
        '" data-act="bkSwitchEvTab" data-arg="' + t.id + '">' + t.label + '</button>'
      );
    }).join('');

    var bodyHtml = '';
    if (tab === 'source') {
      var cit = _local.evidenceCitationData;
      if (!cit) {
        bodyHtml =
          '<div class="ev-source-placeholder">' +
          '<div class="ev-source-placeholder-icon">⟦N⟧</div>' +
          '<div>点击报告中的角标<br>查看来源</div>' +
          '</div>';
      } else {
        bodyHtml =
          '<div class="ev-source-card">' +
          '<div class="ev-source-meta">' +
          '<span class="ev-source-kind">' + esc(cit.source || '') + '</span>' +
          '<span class="ev-source-page">' + esc(cit.page || '') + '</span>' +
          '</div>' +
          '<div class="ev-source-title">' + esc(cit.claim || cit.title || '') + '</div>' +
          (cit.detail ? '<div class="ev-source-snippet">' + esc(cit.detail) + '</div>' : '') +
          '</div>';
      }
    } else if (tab === 'issue') {
      var gaps = p.gaps || [];
      if (!gaps.length) {
        bodyHtml = '<div class="empty-hint">暂无材料缺口</div>';
      } else {
        bodyHtml = gaps.map(function (g, i) {
          return (
            '<div class="ev-issue-card">' +
            '<div class="ev-issue-no">缺口 #' + (i + 1) + '</div>' +
            '<div class="ev-issue-q">' + esc(g.title || '') + '</div>' +
            (g.detail ? '<div class="ev-source-snippet" style="margin-top:4px">' + esc(g.detail) + '</div>' : '') +
            '<span class="ev-issue-status pending">待补充</span>' +
            '</div>'
          );
        }).join('');
      }
    } else if (tab === 'finding') {
      var findings = p.findings || (p.sections || []).reduce(function (acc, s) {
        return acc.concat(s.findings || []);
      }, []);
      if (!findings.length) {
        bodyHtml = '<div class="empty-hint">暂无关键发现</div>';
      } else {
        bodyHtml = findings.map(function (f) {
          var triColor = f.tri === 'warn' ? 'pending' : 'verified';
          return (
            '<div class="ev-finding-card">' +
            '<div class="ev-finding-label">' + esc(f.title || '发现') + '</div>' +
            '<div class="ev-finding-text">' + esc(f.body || '') + '</div>' +
            '<span class="ev-issue-status ' + triColor + '">' + (f.tri === 'warn' ? '待核实' : '已核实') + '</span>' +
            '</div>'
          );
        }).join('');
      }
    }

    return (
      '<aside class="xb-evidence-panel">' +
      '<div class="ev-tabs">' + tabsHtml + '</div>' +
      '<div class="ev-body">' + bodyHtml + '</div>' +
      '</aside>'
    );
  }

  function renderPublicArtifact(p) {
    if (!p.publicBrief) {
      p.publicBrief = {
        title: '公开面速览 · ' + p.company,
        lines: [
          '存续状态：在营（示意）',
          '司法：未发现失信 / 被执行公开记录（示意）',
          '股权要点：见尽调报告「股权与控制关系」章。'
        ]
      };
    }
    var b = p.publicBrief;
    return (
      '<div class="bk-dd-report"><div class="bk-dd-head"><div class="bk-dd-head-row">' +
      '<h5>' +
      esc(b.title) +
      '</h5></div></div>' +
      '<div class="bk-dd-doc-scroll" style="margin:12px">' +
      (b.lines || [])
        .map(function (line) {
          return '<p>' + esc(line) + '</p>';
        })
        .join('') +
      '</div></div>'
    );
  }

  function rightPaneHtml(p, view) {
    var kind = ctxRightKind();
    if (!kind && (view === 'ocr' || view === 'report' || view === 'public')) kind = view;
    if (!kind) return '';
    var gapOpen = !!window.__bkGapOpen;
    var gapTab = window.__bkGapTab || 'gaps';
    var body =
      kind === 'ocr'
        ? renderOcrArtifact(p)
        : kind === 'public'
          ? renderPublicArtifact(p)
          : renderReportArtifact(p, gapOpen, gapTab);
    var tabActive =
      kind === 'ocr' ? 'ocr' : kind === 'public' ? 'public' : 'report';
    var head =
      window.DemoOcrChrome && window.DemoOcrChrome.artifactTabsHeaderHtml
        ? window.DemoOcrChrome.artifactTabsHeaderHtml({
            active: tabActive,
            closeAct: 'closeRight',
            tabs: [
              { id: 'ocr', label: 'OCR' },
              { id: 'report', label: '报告' },
              { id: 'public', label: '公开面' }
            ]
          })
        : '<div class="xb-right-pane-h"><span>AI 产出</span><button type="button" class="btn btn-ghost" data-act="closeRight">关闭</button></div>';
    return (
      '<aside class="xb-right-pane' +
      (kind === 'ocr' ? ' is-ocr' : '') +
      '" data-ocr-fs-root="1" aria-label="AI 产出">' +
      head +
      '<div class="xb-right-pane-body">' +
      body +
      '</div></aside>'
    );
  }

  function chatColumnHtml(p, msgs) {
    return (
      '<div class="xb-chat-center">' +
      projectBarHtml(p) +
      '<div class="xb-chat-main-col">' +
      '<div class="xb-chat-toolbar"><span class="xb-chat-session-title">项目问答 · ' +
      esc(p.name) +
      '</span></div>' +
      '<div class="xb-chat-content-wrap"><div class="xb-chat-content">' +
      '<div class="xb-chat-messages-scroll" id="bkChatBd">' +
      msgs
        .map(function (m) {
          var isUser = m.role === 'user';
          return (
            '<div class="xb-message-row ' +
            (isUser ? 'xb-message-row--user' : 'xb-message-row--assistant') +
            '"><div class="xb-message-body ' +
            (isUser ? 'xb-message-body--user' : 'xb-message-body--assistant') +
            '">' +
            esc(m.text) +
            '</div></div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="composer-dock"><div class="composer-card" style="margin:0">' +
      '<textarea class="composer-textarea" id="bkChatInput" rows="2" placeholder="问：这单还缺什么？OCR 卡在哪？"></textarea>' +
      '<div class="composer-bottom">' +
      '<button type="button" class="composer-pill composer-pill--plus" data-act="composerPlus" title="更多操作">＋</button>' +
      '<button type="button" class="composer-send btn-primary" id="bkChatSend">发送</button>' +
      '</div></div></div>' +
      '</div></div></div></div>'
    );
  }

  function generateReport(ctx, p) {
    var hasGap =
      (p.gaps || []).length > 0 ||
      (p.materials || []).some(function (m) {
        return m.status === 'missing' && m.required;
      });
    p.reportGenerated = true;
    p.status = hasGap ? '报告草稿 · 有缺口' : '报告草稿';
    p.updated = '刚刚';

    var builder =
      window.BANK_DD_REPORT && window.BANK_DD_REPORT.buildHuachengCreditDdReport;
    if (typeof builder === 'function' && /某科技/.test(p.company || '')) {
      var pack = builder({
        company: p.company,
        creditCode: p.creditCode,
        amount: p.amount,
        term: p.term
      });
      p.sections = pack.sections;
      p.cites = pack.cites;
      p.traces = pack.cites.map(function (c) {
        return {
          id: c.id,
          claim: c.claim,
          source: c.source + (c.page ? ' · ' + c.page : ''),
          page: c.page,
          detail: c.detail,
          label: c.label
        };
      });
      if (pack.gaps && pack.gaps.length) {
        p.gaps = pack.gaps;
      }
    } else {
      p.sections = [
        {
          id: 's1',
          title: '第一章  授信背景',
          status: '已生成',
          gap: false,
          body:
            (p.company || '目标公司') +
            '，统一社会信用代码 ' +
            (p.creditCode || '（待补）') +
            '。本次申请额度 ' +
            (p.amount || '—') +
            '、期限 ' +
            (p.term || '—') +
            '。'
        },
        {
          id: 's2',
          title: '第二章  公司基本情况',
          status: '已生成',
          gap: false,
          body: '公开面股权与治理信息已写入。详细章节请使用某科技示意主体查看完整底稿。'
        },
        {
          id: 's3',
          title: '第四章  财务和税务情况',
          status: hasGap ? '缺口' : '已生成',
          gap: hasGap,
          body: hasGap
            ? {
                parts: [
                  { type: 'text', text: '营收与应收同比（OCR 已采数）。' },
                  {
                    type: 'gap',
                    text: '【缺】近一年银行流水未入库，现金流交叉验证无法完成'
                  },
                  { type: 'text', text: '。仍允许先出草稿。' }
                ]
              }
            : '三表钩稽已过；应收增速偏高，建议访谈核验。'
        },
        {
          id: 's4',
          title: '第五章  问题及分析建议',
          status: '已生成',
          gap: false,
          body: '建议在补齐流水并完成 OCR 定稿后提交信审讨论。本稿不替业务做批贷结论。'
        }
      ];
      p.cites = [];
      p.traces = [
        { id: 'c1', claim: '主体存续在营', source: '公开面 · 工商照面', page: 'T+3', detail: '' }
      ];
    }
    persistProject(ctx, p);
  }

  function renderProjectShell(ctx, projectId, viewHint) {
    var p = getProject(ctx, projectId);
    if (!p) {
      ctx.rootEl.innerHTML =
        '<div class="bk-list-page"><div class="bk-toolbar"><h1>项目不存在</h1></div>' +
        '<div class="bk-body"><button class="bk-btn" data-nav="enterprises">回企业档案</button></div></div>';
      bindNav(ctx.rootEl, ctx.navigate);
      return;
    }
    ensureProjectTrees(p);

    var view = viewHint || ctx.state.bankProjView || '';
    if (view === 'ocr' || view === 'report' || view === 'public') {
      setRightKind(view);
      ctx.state.bankProjView = view;
    } else if (!ctxRightKind()) {
      /* 进入项目默认打开报告产出区（可关） */
      setRightKind('report');
    }

    var chatKey = 'bankChat_' + p.id;
    if (!ctx.state[chatKey]) ctx.state[chatKey] = defaultChat(p);
    var msgs = ctx.state[chatKey];
    var hasRight = !!ctxRightKind();
    var isOcr = ctxRightKind() === 'ocr';
    var isReportMode = ctxRightKind() === 'report';

    /* 进入报告视图时自动生成（首次） */
    if (isReportMode && !p.reportGenerated) {
      generateReport(ctx, p);
    }

    ctx.rootEl.innerHTML =
      '<div class="xb-project-workspace bk-bank-ws' +
      (hasRight ? ' has-right' : '') +
      (isReportMode ? ' has-report-ev' : '') +
      (isOcr ? ' is-ocr-wide' : '') +
      (_local.filesOpen === false ? ' files-collapsed' : '') +
      '">' +
      fileTreeHtml(p) +
      chatColumnHtml(p, msgs) +
      (isReportMode
        ? bankReportColHtml(p) + bankEvidencePanelHtml(p)
        : rightPaneHtml(p, view)) +
      '</div>';

    ctx.rootEl.style.height = '100%';
    ctx.rootEl.style.overflow = 'hidden';
    ctx.rootEl.dataset.bkShell = '1';

    bindProjectEvents(ctx, p);
    bindNav(ctx.rootEl, ctx.navigate);
    if (window.DemoOcrChrome) {
      if (hasRight) window.DemoOcrChrome.sync();
      else window.DemoOcrChrome.exitFullscreen();
      window.DemoOcrChrome.bind();
    }
  }

  function bindProjectEvents(ctx, p) {
    function rerender(view) {
      renderProjectShell(ctx, p.id, view || ctxRightKind() || 'report');
    }

    ctx.rootEl.querySelectorAll('[data-act]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var act = el.getAttribute('data-act');
        var arg = el.getAttribute('data-arg');
        if (act === 'toggleFiles') {
          _local.filesOpen = !_local.filesOpen;
          rerender();
          return;
        }
        if (act === 'toggleFolder') {
          _local.openFolder = arg;
          rerender();
          return;
        }
        if (act === 'toggleAiMenu') {
          _local.aiMenuOpen = !_local.aiMenuOpen;
          rerender();
          return;
        }
        if (act === 'aiTab') {
          /* Tab = rightKind：ocr / report / public（兼容旧 other） */
          var mapKind =
            arg === 'public' || arg === 'other'
              ? 'public'
              : arg === 'report'
                ? 'report'
                : 'ocr';
          _local.aiMenuOpen = false;
          setRightKind(mapKind);
          ctx.setState({ bankProjView: mapKind });
          try {
            history.replaceState(
              null,
              '',
              '#' + encodeURIComponent('bank:project/' + p.id + '/' + mapKind)
            );
          } catch (err) {}
          rerender(mapKind);
          return;
        }
        if (act === 'openAi') {
          /* 顶栏「AI 产出」菜单与右区 Tab 一致，落右栏；不跳任务壳 */
          _local.aiMenuOpen = false;
          var openKind =
            arg === 'public' || arg === 'other'
              ? 'public'
              : arg === 'ocr'
                ? 'ocr'
                : 'report';
          setRightKind(openKind);
          ctx.setState({ bankProjView: openKind });
          try {
            history.replaceState(
              null,
              '',
              '#' + encodeURIComponent('bank:project/' + p.id + '/' + openKind)
            );
          } catch (err) {}
          rerender(openKind);
          return;
        }
        if (act === 'closeRight') {
          setRightKind(null);
          _local.aiMenuOpen = false;
          if (window.DemoOcrChrome) window.DemoOcrChrome.exitFullscreen();
          rerender('');
          return;
        }
        if (act === 'upload') {
          simulateUpload(ctx, p);
          return;
        }
        if (act === 'openFile') {
          var kind = el.getAttribute('data-kind');
          var needsOcr = el.getAttribute('data-ocr') === '1';
          if (kind === 'ocr' || needsOcr) {
            setRightKind('ocr');
            rerender('ocr');
            return;
          }
          if (kind === 'report') {
            setRightKind('report');
            rerender('report');
            return;
          }
          if (kind === 'public') {
            setRightKind('public');
            rerender('public');
            return;
          }
          ctx.toast('已选中材料：' + (el.textContent || '').trim());
          return;
        }
        if (act === 'ocrSheet') {
          _local.ocrSheet = arg;
          rerender('ocr');
          return;
        }
        if (act === 'ocrDataTab') {
          _local.ocrDataTab = arg;
          rerender('ocr');
          return;
        }
        if (act === 'ocrLoc') {
          _local.ocrHi = arg;
          ctx.toast('已在左侧原表定位：' + arg);
          rerender('ocr');
          return;
        }
        if (act === 'ocrRerun') {
          ctx.toast('已重新跑 OCR（示意）');
          return;
        }
        if (act === 'ocrConfirm') {
          p.ocrConfirmed = true;
          p.gaps = (p.gaps || []).filter(function (g) {
            return g.title.indexOf('OCR') < 0;
          });
          p.status = '可生成报告';
          p.updated = '刚刚';
          persistProject(ctx, p);
          ctx.toast('OCR 已确认');
          if (!p.reportGenerated) generateReport(ctx, p);
          setRightKind('report');
          rerender('report');
          return;
        }
        if (act === 'genReport') {
          generateReport(ctx, p);
          ctx.toast('报告已生成（材料缺口已标红）');
          rerender('report');
          return;
        }
        if (act === 'toggleGap') {
          window.__bkGapOpen = !window.__bkGapOpen;
          rerender('report');
          return;
        }
        if (act === 'gapTab') {
          window.__bkGapTab = arg;
          window.__bkGapOpen = true;
          rerender('report');
          return;
        }
        if (act === 'cite') {
          var cites = citesOf(p);
          var matchCite = cites.filter(function (c) { return c.id === arg; })[0];
          if (matchCite) {
            _local.evidenceCitationData = normalizeCite(matchCite, 0);
          }
          _local.evidencePanelTab = 'source';
          rerender('report');
          return;
        }
        if (act === 'bkSwitchEvTab') {
          _local.evidencePanelTab = arg;
          rerender('report');
          return;
        }
        if (act === 'regenSec') {
          var i = Number(arg);
          var sec = p.sections && p.sections[i];
          if (!sec) return;
          /* 单章重跑：保留完整 html，仅刷新状态；缺口章维持标红 */
          if (!sec.gap) sec.status = '已生成';
          persistProject(ctx, p);
          ctx.toast('「' + sec.title + '」已按当前材料重跑（示意）');
          rerender('report');
          return;
        }
        if (act === 'regenAll') {
          if (!window.confirm('重新生成整份报告？')) return;
          generateReport(ctx, p);
          ctx.toast('整份报告已重跑');
          rerender('report');
          return;
        }
        if (act === 'jumpSec') {
          var node = ctx.rootEl.querySelector('#bk-sec-' + arg);
          if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        if (act === 'exportHint') {
          if (!p.reportGenerated) {
            ctx.toast('请先生成尽调报告');
            return;
          }
          ctx.toast('开始下载 Word（示意）');
        }
      });
    });

    var chatSend = ctx.rootEl.querySelector('#bkChatSend');
    var chatInput = ctx.rootEl.querySelector('#bkChatInput');
    var chatKey = 'bankChat_' + p.id;
    function sendChat() {
      var q = (chatInput.value || '').trim();
      if (!q) return;
      ctx.state[chatKey].push({ role: 'user', text: q });
      ctx.state[chatKey].push({ role: 'ai', text: answerChat(p, q) });
      chatInput.value = '';
      rerender();
      var bd = ctx.rootEl.querySelector('#bkChatBd');
      if (bd) bd.scrollTop = bd.scrollHeight;
    }
    if (chatSend) chatSend.addEventListener('click', sendChat);
    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChat();
        }
      });
    }
  }

  function simulateUpload(ctx, p) {
    p.materials = [
      { id: 'm1', name: '营业执照.pdf', required: true, status: 'parsed', note: '已归类' },
      {
        id: 'm2',
        name: '审计报告_2025.pdf（扫描）',
        required: true,
        status: 'parsed',
        needsOcr: true,
        note: '识别为财报扫描件'
      },
      { id: 'm3', name: '公司章程.pdf', required: false, status: 'parsed', note: '已归类' },
      {
        id: 'm4',
        name: '银行流水（近一年）',
        required: true,
        status: 'missing',
        note: '缺口标红 · 仍可生成报告'
      }
    ];
    p.gaps = [
      { id: 'g1', title: '银行流水（近一年）', detail: '必收未上传 · 报告财务章将标红' },
      { id: 'g2', title: '财报 OCR 确认', detail: '扫描件待右侧校对' }
    ];
    p.status = '待 OCR';
    p.updated = '刚刚';
    p.fileTree = null;
    ensureProjectTrees(p);
    persistProject(ctx, p);
    ctx.toast('已上传并解析 → 打开 OCR');
    setRightKind('ocr');
    renderProjectShell(ctx, p.id, 'ocr');
  }

  function parseProjectRoute(route) {
    var parts = (route || '').split('/');
    if (parts[0] !== 'project' || !parts[1]) return null;
    if (parts[1] === 'new') return { id: null, view: 'new' };
    return { id: parts[1], view: parts[2] || '' };
  }

  function render(route, ctx) {
    closeBankModals();
    route = (route || '').replace(/^\//, '');
    if (route !== 'home' && route !== '') ctx.state.bkHomePlusOpen = false;

    var isShell =
      route.indexOf('project/') === 0 ||
      route === 'pack/ocr' ||
      route.indexOf('customer/') === 0 ||
      route.indexOf('enterprise/') === 0;
    if (!isShell) resetRootLayout(ctx);

    if (route === 'projects' || route === 'project/new') {
      ctx.navigate('enterprises');
      return true;
    }
    if (route === 'customers' || route === 'enterprises') {
      renderCustomers(ctx);
      return true;
    }
    if (route.indexOf('customer/') === 0 || route.indexOf('enterprise/') === 0) {
      renderCustomerDetail(ctx, route.split('/')[1]);
      return true;
    }
    if (route === 'home' || route === '') {
      renderHomeBank(ctx);
      return true;
    }

    if (route === 'pack/ocr') {
      var demo = getProject(ctx, 'proj-huacheng') || projectsOf(ctx)[0];
      if (demo) {
        setRightKind('ocr');
        ctx.setState({ bankProjView: 'ocr' });
        renderProjectShell(ctx, demo.id, 'ocr');
        return true;
      }
    }

    var pr = parseProjectRoute(route);
    if (pr) {
      /* 报告撰写主场 = 任务工作区；旧 project/.../report 深链过去 */
      if (pr.view === 'report') {
        if (ctx.toast) ctx.toast('报告编辑在任务工作区');
        ctx.navigate(
          pr.id === 'proj-huacheng'
            ? 'task/task-huacheng-dd/draft'
            : 'task/task-huacheng-dd'
        );
        return true;
      }
      renderProjectShell(ctx, pr.id, pr.view);
      return true;
    }
    return false;
  }

  window.BankProjectPages = {
    render: render,
    openNewProjectModal: openNewProjectModal,
    renderProjectShell: renderProjectShell,
    closeBankModals: closeBankModals,
    resetRootLayout: resetRootLayout
  };
})();
