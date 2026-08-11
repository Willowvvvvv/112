/**
 * 银行版 · 项目壳（对齐 IA v1.1）
 * 三栏：材料+节点 | Chat 问答 | 右侧产出（OCR / 报告+缺口溯源）
 * 挂载：window.BankProjectPages
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

  /** 报告正文：纯文本 + 可选缺口标红片段（禁止任意 HTML） */
  function gapMark(text) {
    return '<span class="gap-inline">' + esc(text) + '</span>';
  }

  function renderSecBody(body) {
    if (!body) return gapMark('【缺数据】本章依据不足，请补材料或容忍缺口定稿');
    if (typeof body === 'object' && body.parts) {
      return body.parts
        .map(function (p) {
          if (p.type === 'gap') return gapMark(p.text);
          return esc(p.text);
        })
        .join('');
    }
    return esc(String(body));
  }

  function ensureStyles() {
    if (document.getElementById('bank-project-css')) return;
    var style = document.createElement('style');
    style.id = 'bank-project-css';
    style.textContent =
      '.bk-wb{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;background:var(--xb-color-bg,#f5f7fa)}' +
      '.bk-wb-head{flex-shrink:0;padding:12px 16px 10px;background:#fff;border-bottom:1px solid var(--xb-line,#e8ecf0)}' +
      '.bk-wb-head-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
      '.bk-wb-head h1{margin:0;font-size:16px;font-weight:600;color:var(--xb-brand,#0d2e4b);font-family:var(--xb-font-brand,inherit)}' +
      '.bk-wb-meta{font-size:12px;color:var(--xb-muted,#536075)}' +
      '.bk-wb-nodes{display:flex;gap:0;margin-top:10px;flex-wrap:wrap}' +
      '.bk-wb-node{flex:1;min-width:88px;padding:8px 10px;border:1px solid var(--xb-line,#e8ecf0);background:var(--xb-bg-soft,#f5f7fa);font-size:11px;text-align:center;color:var(--xb-muted,#536075);cursor:pointer}' +
      '.bk-wb-node:first-child{border-radius:6px 0 0 6px}' +
      '.bk-wb-node:last-child{border-radius:0 6px 6px 0}' +
      '.bk-wb-node.done{background:var(--xb-color-primary-muted,#e8eef3);color:var(--xb-brand,#0d2e4b);font-weight:600}' +
      '.bk-wb-node.cur{background:var(--xb-brand,#0d2e4b);color:#fff;font-weight:600;border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-wb-node.warn{box-shadow:inset 0 -2px 0 #b91c1c}' +
      '.bk-wb-body{flex:1;min-height:0;display:grid;grid-template-columns:220px minmax(220px,1fr) minmax(320px,1.4fr);gap:10px;padding:10px 12px 12px;overflow:hidden}' +
      '.bk-wb-body.is-ocr{grid-template-columns:200px minmax(180px,.7fr) minmax(420px,2fr)}' +
      '@media(max-width:1100px){.bk-wb-body,.bk-wb-body.is-ocr{grid-template-columns:1fr;overflow:auto}}' +
      '.bk-wb-col{min-height:0;min-width:0;display:flex;flex-direction:column;background:#fff;border:1px solid var(--xb-line,#e8ecf0);border-radius:6px;overflow:hidden}' +
      '.bk-wb-col-hd{padding:10px 12px;border-bottom:1px solid var(--xb-line,#e8ecf0);font-size:12px;font-weight:600;background:var(--xb-bg-soft,#f5f7fa);display:flex;align-items:center;gap:8px}' +
      '.bk-wb-col-hd .spacer{flex:1}' +
      '.bk-wb-col-bd{flex:1;min-height:0;overflow:auto;padding:10px 12px;font-size:12px}' +
      '.bk-mat-item{padding:8px 0;border-bottom:1px solid #f0f2f5;display:flex;justify-content:space-between;gap:8px;align-items:flex-start}' +
      '.bk-mat-item:last-child{border-bottom:0}' +
      '.bk-mat-item .name{font-weight:550;color:var(--xb-text,#152033)}' +
      '.bk-mat-item.gap .name{color:#b91c1c}' +
      '.bk-chat-msgs{display:flex;flex-direction:column;gap:10px;padding-bottom:8px}' +
      '.bk-chat-bubble{max-width:95%;padding:8px 10px;border-radius:8px;line-height:1.5;font-size:12px}' +
      '.bk-chat-bubble.user{align-self:flex-end;background:var(--xb-color-primary-muted,#e8eef3);color:var(--xb-brand,#0d2e4b)}' +
      '.bk-chat-bubble.ai{align-self:flex-start;background:#f8fafc;border:1px solid var(--xb-line,#e8ecf0);color:var(--xb-text,#152033)}' +
      '.bk-chat-hint{font-size:11px;color:var(--xb-faint,#8992a3);margin:0 0 8px;line-height:1.4}' +
      '.bk-chat-composer{flex-shrink:0;border-top:1px solid var(--xb-line,#e8ecf0);padding:8px 10px;display:flex;gap:8px;background:#fff}' +
      '.bk-chat-composer input{flex:1;height:34px;border:1px solid var(--xb-line,#e8ecf0);border-radius:3px;padding:0 10px;outline:none}' +
      '.bk-chat-composer input:focus{border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-doc{line-height:1.65;font-size:13px;color:var(--xb-text,#152033)}' +
      '.bk-doc h2{margin:0 0 10px;font-size:16px;color:var(--xb-brand,#0d2e4b)}' +
      '.bk-doc h3{margin:18px 0 8px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
      '.bk-doc p{margin:0 0 10px}' +
      '.bk-doc .gap-inline{color:#b91c1c;background:#fef2f2;padding:0 4px;border-radius:2px}' +
      '.bk-doc-sec{position:relative;padding:4px 0 4px 0;border-bottom:1px dashed #eef1f4}' +
      '.bk-doc-sec:last-child{border-bottom:0}' +
      '.bk-regen{height:26px;padding:0 8px;font-size:11px;border:1px solid var(--xb-line,#e8ecf0);border-radius:3px;background:#fff;cursor:pointer;color:var(--xb-muted,#536075)}' +
      '.bk-regen:hover{border-color:var(--xb-brand,#0d2e4b);color:var(--xb-brand,#0d2e4b)}' +
      '.bk-right-shell{flex:1;min-height:0;display:flex;overflow:hidden}' +
      '.bk-right-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}' +
      '.bk-aux{width:0;overflow:hidden;border-left:0;background:#fff;transition:width .18s ease;flex-shrink:0;display:flex;flex-direction:column}' +
      '.bk-aux.open{width:280px;border-left:1px solid var(--xb-line,#e8ecf0)}' +
      '.bk-aux-tabs{display:flex;border-bottom:1px solid var(--xb-line,#e8ecf0);flex-shrink:0}' +
      '.bk-aux-tabs button{flex:1;height:34px;border:0;background:var(--xb-bg-soft,#f5f7fa);font-size:12px;cursor:pointer;color:var(--xb-muted,#536075)}' +
      '.bk-aux-tabs button.on{background:#fff;color:var(--xb-brand,#0d2e4b);font-weight:600;box-shadow:inset 0 -2px 0 var(--xb-brand,#0d2e4b)}' +
      '.bk-aux-bd{flex:1;min-height:0;overflow:auto;padding:10px 12px;font-size:12px}' +
      '.bk-gap-row{padding:8px 0;border-bottom:1px solid #f0f2f5}' +
      '.bk-gap-row strong{color:#b91c1c}' +
      '.bk-trace-row{padding:8px 0;border-bottom:1px solid #f0f2f5;cursor:pointer}' +
      '.bk-trace-row:hover{background:var(--xb-bg-soft,#f5f7fa)}' +
      '.bk-ocr2{display:grid;grid-template-columns:1fr 1fr;gap:8px;height:100%;min-height:360px}' +
      '@media(max-width:900px){.bk-ocr2{grid-template-columns:1fr}}' +
      '.bk-ocr2 .pane{border:1px solid var(--xb-line,#e8ecf0);border-radius:4px;display:flex;flex-direction:column;min-height:0;overflow:hidden}' +
      '.bk-ocr2 .pane-hd{padding:8px 10px;font-size:11px;font-weight:600;background:var(--xb-bg-soft,#f5f7fa);border-bottom:1px solid var(--xb-line,#e8ecf0)}' +
      '.bk-ocr2 .pane-bd{flex:1;min-height:0;overflow:auto;padding:10px}' +
      '.bk-preview-scan{height:100%;min-height:280px;background:repeating-linear-gradient(0deg,#f8fafc,#f8fafc 28px,#eef2f6 28px,#eef2f6 29px);border:1px dashed var(--xb-line,#e8ecf0);border-radius:4px;display:grid;place-items:center;color:var(--xb-faint,#8992a3);text-align:center;line-height:1.6}' +
      '.bk-modal-mask{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px}' +
      '.bk-modal{width:min(520px,100%);background:#fff;border-radius:8px;border:1px solid var(--xb-line,#e8ecf0);box-shadow:0 12px 40px rgba(13,46,75,.18);max-height:90vh;display:flex;flex-direction:column}' +
      '.bk-modal-hd{padding:14px 16px;border-bottom:1px solid var(--xb-line,#e8ecf0);font-size:15px;font-weight:600;color:var(--xb-brand,#0d2e4b)}' +
      '.bk-modal-bd{padding:14px 16px;overflow:auto;flex:1;min-height:0}' +
      '.bk-modal-ft{padding:12px 16px;border-top:1px solid var(--xb-line,#e8ecf0);display:flex;justify-content:flex-end;gap:8px}' +
      '.bk-field-l{display:block;font-size:12px;font-weight:550;margin:0 0 6px;color:var(--xb-muted,#536075)}' +
      '.bk-field-l .req{color:#b91c1c}' +
      '.bk-input{width:100%;height:34px;border:1px solid var(--xb-line,#e8ecf0);border-radius:3px;padding:0 10px;margin-bottom:12px;outline:none;box-sizing:border-box}' +
      '.bk-input:focus{border-color:var(--xb-brand,#0d2e4b)}' +
      '.bk-suggest{border:1px solid var(--xb-line,#e8ecf0);border-radius:4px;margin:-8px 0 12px;max-height:160px;overflow:auto;background:#fff}' +
      '.bk-suggest button{display:block;width:100%;text-align:left;padding:8px 10px;border:0;border-bottom:1px solid #f0f2f5;background:#fff;cursor:pointer;font-size:12px}' +
      '.bk-suggest button:hover{background:var(--xb-bg-soft,#f5f7fa)}' +
      '.bk-suggest button:last-child{border-bottom:0}' +
      '.bk-soft-hint{font-size:11px;color:#b45309;background:#fff7ed;padding:8px 10px;border-radius:4px;margin-bottom:12px;line-height:1.45}' +
      '.bk-drawer{position:fixed;top:0;right:0;bottom:0;width:min(360px,100%);background:#fff;z-index:70;border-left:1px solid var(--xb-line,#e8ecf0);box-shadow:-8px 0 24px rgba(13,46,75,.12);display:flex;flex-direction:column}' +
      '.bk-drawer-mask{position:fixed;inset:0;background:rgba(15,23,42,.2);z-index:69}' +
      '.bk-task-row{padding:10px 0;border-bottom:1px solid #f0f2f5;cursor:pointer}' +
      '.bk-task-row:hover{background:var(--xb-bg-soft,#f5f7fa)}' +
      '.bk-upload-zone{border:1px dashed var(--xb-line,#e8ecf0);border-radius:6px;padding:14px;text-align:center;background:var(--xb-bg-soft,#f5f7fa);margin-bottom:10px}' +
      '.bk-public-doc{font-size:12px;line-height:1.55}' +
      '.bk-public-doc h3{margin:0 0 8px;font-size:13px}' +
      '.bk-list-page{padding:0 0 32px}' +
      '.bk-empty{padding:32px;text-align:center;color:var(--xb-muted,#536075);font-size:13px}';
    document.head.appendChild(style);
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

  function bindNav(root, navigate) {
    root.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(el.getAttribute('data-nav'));
      });
    });
  }

  function nodeState(p) {
    var ocrDone = !!p.ocrConfirmed;
    var reportDone = !!p.reportGenerated;
    var mats = p.materials || [];
    var hasScan = mats.some(function (m) {
      return m.needsOcr && m.status !== 'missing';
    });
    var matReady = mats.some(function (m) {
      return m.status === 'ready' || m.status === 'parsed';
    });
    return {
      materials: matReady ? 'done' : 'cur',
      ocr: !hasScan ? 'done' : ocrDone ? 'done' : matReady ? 'cur' : '',
      report: reportDone ? 'done' : ocrDone || !hasScan ? 'cur' : '',
      export: reportDone ? 'cur' : '',
      hasScan: hasScan,
      gapCount: mats.filter(function (m) {
        return m.status === 'missing' || m.required && m.status !== 'ready' && m.status !== 'parsed';
      }).length
    };
  }

  function defaultChat(p) {
    return [
      {
        role: 'ai',
        text:
          '我是本项目的问答助手。可问「这单还缺什么材料」「OCR 卡在哪」「报告哪章有缺口」。我只做项目总问询，不写报告正文——生成与改写请用右侧文档区的节点 /「重新生成」。'
      },
      {
        role: 'ai',
        text:
          '当前项目：' +
          p.name +
          ' · 承租人 ' +
          p.company +
          '。材料缺口 ' +
          (p.gaps || []).length +
          ' 项；' +
          (p.ocrConfirmed ? 'OCR 已确认。' : '有扫描财报待 OCR 确认。')
      }
    ];
  }

  function answerChat(p, q) {
    var s = q.toLowerCase();
    if (/缺|材料|齐/.test(s)) {
      var gaps = (p.gaps || []).map(function (g) {
        return g.title;
      });
      return gaps.length
        ? '还缺：' + gaps.join('、') + '。材料不齐也可生成报告，缺口会在左栏与右窗标红。'
        : '必收材料已齐（示意）。仍可在右窗核对章节字段缺口。';
    }
    if (/ocr|财报|扫描/.test(s)) {
      return p.ocrConfirmed
        ? 'OCR 已确认，可在节点条进入「生成报告」。'
        : '审计报告扫描件已归类，请在右侧产出区完成 OCR 双栏校对后确认。';
    }
    if (/风险|怎么样|这单/.test(s)) {
      return (
        p.company +
        '：公开面未见失信/被执行（示意）；财务侧应收增速偏高，详见报告「财务分析」章。具体投否由你们业务决策。'
      );
    }
    if (/报告|重生|改/.test(s)) {
      return '改报告请用右侧文档各章旁的「↺ 重新生成」，或节点条「重新生成报告」。Chat 本期不写正文（Phase 2 可探索口令改写）。';
    }
    return '已收到。可继续问材料缺口、OCR 进度或某章依据；推进流程请点上方节点条 / 左栏上传。';
  }

  /* —— 项目列表 —— */
  function renderProjects(ctx) {
    ensureStyles();
    var list = projectsOf(ctx);
    var q = (ctx.state.bankProjQ || '').trim();
    var rows = list;
    if (q) {
      rows = list.filter(function (p) {
        return (p.name + p.company + (p.owner || '')).indexOf(q) >= 0;
      });
    }
    ctx.rootEl.innerHTML =
      '<div class="bk-list-page bk-page">' +
      '<div class="bk-toolbar"><h1>授信项目</h1><div class="spacer"></div>' +
      '<input class="bk-search" id="bkProjQ" placeholder="搜项目 / 企业" value="' +
      esc(q) +
      '" />' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkNewProj">+ 新建项目</button></div>' +
      '<div class="bk-body">' +
      '<p class="bk-muted" style="margin:0 0 12px">主入口：建项时强制绑定企业（库中无则软建）。Pack 流程线挂在项目上，不做孤立向导。</p>' +
      (rows.length
        ? '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>项目</th><th>企业</th><th>额度/期限</th><th>阶段</th><th>更新</th></tr></thead><tbody>' +
          rows
            .map(function (p) {
              var ns = nodeState(p);
              var stage = p.reportGenerated
                ? '报告可导出'
                : p.ocrConfirmed
                  ? '待生成报告'
                  : ns.hasScan
                    ? '待 OCR'
                    : '材料整理中';
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
                (p.reportGenerated ? 'ok' : ns.gapCount ? 'warn' : 'dd') +
                '">' +
                esc(stage) +
                (ns.gapCount ? ' · 缺口' + ns.gapCount : '') +
                '</span></td><td>' +
                esc(p.updated || '') +
                '</td></tr>'
              );
            })
            .join('') +
          '</tbody></table></div>'
        : '<div class="bk-empty">暂无项目。点「+ 新建项目」开始。</div>') +
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

  /* —— 轻客户列表 —— */
  function renderCustomers(ctx) {
    ensureStyles();
    var list = customersOf(ctx);
    ctx.rootEl.innerHTML =
      '<div class="bk-list-page bk-page">' +
      '<div class="bk-toolbar"><h1>客户（轻主档）</h1><div class="spacer"></div>' +
      '<button type="button" class="bk-btn-primary bk-btn" data-nav="projects">去项目列表建项</button></div>' +
      '<div class="bk-body">' +
      '<p class="bk-muted" style="margin:0 0 12px">次入口：同客户多笔 deal / 找担保人。不做案例库式厚详情；工商/风险进项目内 AI 产出文档。</p>' +
      '<div class="bk-table-wrap"><table class="bk-table"><thead><tr><th>企业</th><th>信用代码</th><th>行业</th><th>关联项目</th></tr></thead><tbody>' +
      list
        .map(function (c) {
          var projs = projectsOf(ctx).filter(function (p) {
            return p.companyId === c.id || p.company === c.name;
          });
          return (
            '<tr><td><strong>' +
            esc(c.name) +
            '</strong>' +
            (c.soft ? ' <span class="bk-tag warn">软建</span>' : '') +
            '</td><td>' +
            esc(c.creditCode || '—') +
            '</td><td>' +
            esc(c.industry || '—') +
            '</td><td>' +
            (projs.length
              ? projs
                  .map(function (p) {
                    return (
                      '<a class="bk-link" data-nav="project/' +
                      esc(p.id) +
                      '">' +
                      esc(p.name) +
                      '</a>'
                    );
                  })
                  .join(' · ')
              : '<span class="bk-muted">无</span>') +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table></div></div></div>';
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function closeBankModals() {
    if (window.__bkNpEsc) {
      document.removeEventListener('keydown', window.__bkNpEsc);
      window.__bkNpEsc = null;
    }
    document.querySelectorAll('.bk-modal-mask, .bk-drawer-mask, .bk-drawer').forEach(function (el) {
      el.remove();
    });
  }

  function openNewProjectModal(ctx, presetCompany) {
    ensureStyles();
    closeBankModals();
    var mask = document.createElement('div');
    mask.className = 'bk-modal-mask';
    mask.innerHTML =
      '<div class="bk-modal" role="dialog" aria-label="新建授信项目">' +
      '<div class="bk-modal-hd">新建授信项目</div>' +
      '<div class="bk-modal-bd xb-overlay-scrollbar" style="overflow-y:auto">' +
      '<label class="bk-field-l">企业主体 <span class="req">*必选</span></label>' +
      '<input class="bk-input" id="bkNpCompany" placeholder="搜索已有企业，或输入新名软建" value="' +
      esc(presetCompany || '') +
      '" autocomplete="off" />' +
      '<div id="bkNpSuggest" class="bk-suggest" style="display:none"></div>' +
      '<div id="bkNpSoft" class="bk-soft-hint" style="display:none">客户库无完全匹配 → 建项时将<strong>软建</strong>轻量客户，无需先开客户管理页。</div>' +
      '<label class="bk-field-l">项目名称</label>' +
      '<input class="bk-input" id="bkNpName" placeholder="默认：企业名 · 授信尽调" />' +
      '<label class="bk-field-l">额度（示意）</label>' +
      '<input class="bk-input" id="bkNpAmount" placeholder="如 3000 万" />' +
      '<label class="bk-field-l">期限</label>' +
      '<input class="bk-input" id="bkNpTerm" placeholder="如 36 个月" />' +
      '<label class="bk-field-l">TemplatePack</label>' +
      '<select class="bk-input" id="bkNpPack"><option value="pack-credit-dd-v1">对公授信尽调 Pack v1（锁定）</option><option value="pack-lease-v1">融资租赁尽调 Pack v1</option></select>' +
      '<p class="bk-muted" style="margin:0">Pack 定义流程；建项后快照锁定到本项目，节点条出现在项目壳上。</p>' +
      '</div>' +
      '<div class="bk-modal-ft">' +
      '<button type="button" class="bk-btn" id="bkNpCancel">取消</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkNpOk">创建并进入项目</button>' +
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
      } else {
        softEl.style.display = 'block';
      }
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

    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    function close() {
      document.removeEventListener('keydown', onKey);
      if (window.__bkNpEsc === onKey) window.__bkNpEsc = null;
      mask.remove();
    }
    mask.querySelector('#bkNpCancel').addEventListener('click', close);
    mask.addEventListener('click', function (e) {
      if (e.target === mask) close();
    });
    window.__bkNpEsc = onKey;
    document.addEventListener('keydown', onKey);

    mask.querySelector('#bkNpOk').addEventListener('click', function () {
      var companyName = companyInput.value.trim();
      if (!companyName) {
        ctx.toast('请选择或输入企业主体（必选）');
        companyInput.focus();
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
        ctx.toast('已软建客户「' + companyName + '」');
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
        packId: mask.querySelector('#bkNpPack').value,
        packLabel:
          mask.querySelector('#bkNpPack').selectedOptions[0].textContent || 'Pack',
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
        sections: [
          { id: 's1', title: '1 客户基本情况', status: '空', gap: true, body: '' },
          { id: 's2', title: '2 股权与控制关系', status: '空', gap: true, body: '' },
          { id: 's3', title: '3 财务分析', status: '空', gap: true, body: '' },
          { id: 's4', title: '4 风险与合规', status: '空', gap: true, body: '' },
          { id: 's5', title: '5 调查结论', status: '空', gap: true, body: '' }
        ],
        traces: [],
        tasks: [],
        publicBrief: null
      };
      var projs = projectsOf(ctx);
      projs.unshift(proj);
      ctx.setState({ bankProjects: projs });
      close();
      ctx.toast('项目已创建，Pack 已锁定到本项目');
      ctx.navigate('project/' + proj.id);
    });
  }

  /* —— 项目壳 —— */
  function parseProjectRoute(route) {
    var parts = (route || '').split('/');
    if (parts[0] !== 'project' || !parts[1]) return null;
    if (parts[1] === 'new') return { id: null, view: 'new' };
    return { id: parts[1], view: parts[2] || 'report' };
  }

  function renderProjectShell(ctx, projectId, viewHint) {
    ensureStyles();
    var p = getProject(ctx, projectId);
    if (!p) {
      ctx.rootEl.innerHTML =
        '<div class="bk-page"><div class="bk-toolbar"><h1>项目不存在</h1></div>' +
        '<div class="bk-body"><button type="button" class="bk-btn" data-nav="projects">回项目列表</button></div></div>';
      bindNav(ctx.rootEl, ctx.navigate);
      return;
    }

    var view = viewHint || ctx.state.bankProjView || 'report';
    if (view === 'ocr' && p.ocrConfirmed && !viewHint) view = 'report';
    var ns = nodeState(p);
    var gapOpen = !!ctx.state.bankGapPanelOpen;
    var gapTab = ctx.state.bankGapTab || 'gaps';
    var chatKey = 'bankChat_' + p.id;
    if (!ctx.state[chatKey]) ctx.state[chatKey] = defaultChat(p);
    var msgs = ctx.state[chatKey];
    var tasksOpen = !!ctx.state.bankTaskDrawerOpen;

    var activeNode =
      view === 'ocr' ? 'ocr' : view === 'materials' ? 'materials' : view === 'export' ? 'export' : 'report';

    function nodeCls(key) {
      var st = ns[key];
      var cls = st === 'done' ? 'done' : st === 'cur' ? 'cur' : '';
      if (key === activeNode) cls = 'cur';
      if (key === 'report' && ns.gapCount && p.reportGenerated) cls += ' warn';
      if (key === 'materials' && ns.gapCount) cls += ' warn';
      return cls;
    }

    var rightInner = '';
    if (view === 'ocr') {
      rightInner = renderOcrPane(p);
    } else if (view === 'public') {
      rightInner = renderPublicPane(p);
    } else if (view === 'export') {
      rightInner = renderExportPane(p);
    } else {
      rightInner = renderReportPane(p, gapOpen, gapTab);
    }

    ctx.rootEl.innerHTML =
      '<div class="bk-wb">' +
      '<div class="bk-wb-head">' +
      '<div class="bk-wb-head-row">' +
      '<button type="button" class="bk-btn" data-nav="projects">← 项目</button>' +
      '<h1>' +
      esc(p.name) +
      '</h1>' +
      '<span class="bk-tag dd">' +
      esc(p.packLabel || 'Pack 已锁定') +
      '</span>' +
      (ns.gapCount
        ? '<span class="bk-tag danger">缺口 ' + ns.gapCount + '</span>'
        : '<span class="bk-tag ok">材料可生成</span>') +
      '<div class="spacer"></div>' +
      '<button type="button" class="bk-btn" id="bkTasksBtn">进行中 ' +
      ((p.tasks && p.tasks.length) || 0) +
      '</button>' +
      '<button type="button" class="bk-btn" id="bkExportBtn">导出 Word</button>' +
      '</div>' +
      '<div class="bk-wb-meta" style="margin-top:6px">' +
      esc(p.company) +
      (p.creditCode ? ' · ' + esc(p.creditCode) : '') +
      ' · 额度 ' +
      esc(p.amount || '—') +
      ' · 期限 ' +
      esc(p.term || '—') +
      ' · ' +
      esc(p.owner || '') +
      '</div>' +
      '<div class="bk-wb-nodes">' +
      '<button type="button" class="bk-wb-node ' +
      nodeCls('materials') +
      '" data-node="materials">1 材料</button>' +
      '<button type="button" class="bk-wb-node ' +
      nodeCls('ocr') +
      '" data-node="ocr">2 OCR' +
      (ns.hasScan && !p.ocrConfirmed ? ' · 待确认' : '') +
      '</button>' +
      '<button type="button" class="bk-wb-node ' +
      nodeCls('report') +
      '" data-node="report">3 尽调报告</button>' +
      '<button type="button" class="bk-wb-node ' +
      nodeCls('export') +
      '" data-node="export">4 导出</button>' +
      '</div></div>' +
      '<div class="bk-wb-body' +
      (view === 'ocr' ? ' is-ocr' : '') +
      '">' +
      /* left materials */
      '<aside class="bk-wb-col" aria-label="材料袋">' +
      '<div class="bk-wb-col-hd">材料袋<div class="spacer"></div>' +
      '<button type="button" class="bk-btn" id="bkUploadZip" style="height:28px;padding:0 8px">上传压缩包</button></div>' +
      '<div class="bk-wb-col-bd">' +
      '<div class="bk-upload-zone" id="bkDropHint">拖入 zip / 点上方上传<br/><span class="bk-muted">解析归类后进材料袋；扫描财报将打开 OCR</span></div>' +
      (p.materials || [])
        .map(function (m) {
          var gap = m.status === 'missing' || (m.required && m.status !== 'ready' && m.status !== 'parsed');
          var tag =
            m.status === 'missing'
              ? '<span class="bk-tag danger">缺</span>'
              : m.status === 'parsing'
                ? '<span class="bk-tag warn">解析中</span>'
                : m.needsOcr && !p.ocrConfirmed
                  ? '<span class="bk-tag warn">待 OCR</span>'
                  : '<span class="bk-tag ok">已就绪</span>';
          return (
            '<div class="bk-mat-item' +
            (gap ? ' gap' : '') +
            '"><div><div class="name">' +
            esc(m.name) +
            '</div>' +
            (m.note ? '<div class="bk-muted">' + esc(m.note) + '</div>' : '') +
            '</div>' +
            tag +
            (m.needsOcr && m.status !== 'missing'
              ? '<button type="button" class="bk-btn" data-open-ocr="1" style="height:26px;padding:0 8px">校对</button>'
              : '') +
            '</div>'
          );
        })
        .join('') +
      '<div style="margin-top:12px"><button type="button" class="bk-btn" id="bkOpenPublic" style="width:100%">公开面速览（产出文档）</button></div>' +
      '</div></aside>' +
      /* center chat — always visible */
      '<section class="bk-wb-col" aria-label="项目问答">' +
      '<div class="bk-wb-col-hd">Chat · 项目总问询<span class="bk-tag dd" style="margin-left:6px">可见</span><div class="spacer"></div><span class="bk-muted">不写报告正文</span></div>' +
      '<div class="bk-wb-col-bd" id="bkChatBd">' +
      '<p class="bk-chat-hint">先问答、看进度；生成与改写在右侧文档 / 节点「重新生成」。Phase 2 可探索 Chat 驱动改报告。</p>' +
      '<div class="bk-chat-msgs" id="bkChatMsgs">' +
      msgs
        .map(function (m) {
          return '<div class="bk-chat-bubble ' + (m.role === 'user' ? 'user' : 'ai') + '">' + esc(m.text) + '</div>';
        })
        .join('') +
      '</div></div>' +
      '<div class="bk-chat-composer">' +
      '<input id="bkChatInput" placeholder="问：这单还缺什么？风险点？" />' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkChatSend">发送</button></div>' +
      '</section>' +
      /* right output */
      '<section class="bk-wb-col" aria-label="AI 产出区" id="bkRightCol">' +
      rightInner +
      '</section>' +
      '</div>' +
      (tasksOpen ? renderTaskDrawer(p) : '') +
      '</div>';

    /* —— events —— */
    ctx.rootEl.querySelectorAll('[data-node]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = btn.getAttribute('data-node');
        if (n === 'materials') {
          ctx.setState({ bankProjView: 'report' });
          ctx.toast('请在左栏上传 / 查看材料');
          renderProjectShell(ctx, p.id, 'report');
          return;
        }
        if (n === 'ocr') {
          if (!ns.hasScan) {
            ctx.toast('当前无扫描财报，可直接生成报告');
            ctx.setState({ bankProjView: 'report' });
            renderProjectShell(ctx, p.id, 'report');
            return;
          }
          ctx.setState({ bankProjView: 'ocr' });
          renderProjectShell(ctx, p.id, 'ocr');
          return;
        }
        if (n === 'report') {
          if (!p.reportGenerated) {
            generateReport(ctx, p, false);
            return;
          }
          ctx.setState({ bankProjView: 'report' });
          renderProjectShell(ctx, p.id, 'report');
          return;
        }
        if (n === 'export') {
          ctx.setState({ bankProjView: 'export' });
          renderProjectShell(ctx, p.id, 'export');
        }
      });
    });

    ctx.rootEl.querySelectorAll('[data-open-ocr]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({ bankProjView: 'ocr' });
        renderProjectShell(ctx, p.id, 'ocr');
      });
    });

    var uploadBtn = ctx.rootEl.querySelector('#bkUploadZip');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', function () {
        simulateUpload(ctx, p);
      });
    }
    var drop = ctx.rootEl.querySelector('#bkDropHint');
    if (drop) {
      drop.addEventListener('click', function () {
        simulateUpload(ctx, p);
      });
    }

    var pub = ctx.rootEl.querySelector('#bkOpenPublic');
    if (pub) {
      pub.addEventListener('click', function () {
        if (!p.publicBrief) {
          p.publicBrief = {
            title: '公开面速览 · ' + p.company,
            lines: [
              '存续状态：在营（示意）',
              '司法：未发现失信 / 被执行公开记录（T+0 · 示意）',
              '股权要点：见项目报告「股权与控制关系」章；本页为 AI 产出文档，非案例库 CRM。'
            ]
          };
          persistProject(ctx, p);
        }
        ctx.setState({ bankProjView: 'public' });
        renderProjectShell(ctx, p.id, 'public');
      });
    }

    ctx.rootEl.querySelector('#bkTasksBtn').addEventListener('click', function () {
      ctx.setState({ bankTaskDrawerOpen: !tasksOpen });
      renderProjectShell(ctx, p.id, view);
    });
    ctx.rootEl.querySelector('#bkExportBtn').addEventListener('click', function () {
      if (!p.reportGenerated) {
        ctx.toast('请先生成尽调报告（材料不齐也可生成，缺口标红）');
        return;
      }
      ctx.setState({ bankProjView: 'export' });
      renderProjectShell(ctx, p.id, 'export');
    });

    var chatSend = ctx.rootEl.querySelector('#bkChatSend');
    var chatInput = ctx.rootEl.querySelector('#bkChatInput');
    function sendChat() {
      var q = (chatInput.value || '').trim();
      if (!q) return;
      msgs.push({ role: 'user', text: q });
      msgs.push({ role: 'ai', text: answerChat(p, q) });
      ctx.setState({});
      chatInput.value = '';
      renderProjectShell(ctx, p.id, view);
      var bd = ctx.rootEl.querySelector('#bkChatBd');
      if (bd) bd.scrollTop = bd.scrollHeight;
    }
    if (chatSend) chatSend.addEventListener('click', sendChat);
    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendChat();
      });
    }

    bindOcrEvents(ctx, p, view);
    bindReportEvents(ctx, p, view);
    bindExportEvents(ctx, p);
    bindTaskDrawer(ctx, p, view);
    bindNav(ctx.rootEl, ctx.navigate);

    /* project shell fills viewport; resetRootLayout clears on leave */
    ctx.rootEl.style.height = '100%';
    ctx.rootEl.style.overflow = 'hidden';
    ctx.rootEl.dataset.bkShell = '1';
  }

  function resetRootLayout(ctx) {
    if (!ctx || !ctx.rootEl) return;
    if (ctx.rootEl.dataset.bkShell) {
      ctx.rootEl.style.height = '';
      ctx.rootEl.style.overflow = '';
      delete ctx.rootEl.dataset.bkShell;
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

  function simulateUpload(ctx, p) {
    p.tasks = p.tasks || [];
    p.tasks.unshift({
      id: 't-parse-' + Date.now(),
      title: '材料包解析归类',
      status: '进行中',
      target: 'materials'
    });
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
    persistProject(ctx, p);
    ctx.toast('已上传并解析归类（示意）→ 发现扫描财报，打开 OCR');
    ctx.setState({ bankProjView: 'ocr', bankTaskDrawerOpen: false });
    setTimeout(function () {
      p.tasks = (p.tasks || []).map(function (t) {
        if (t.target === 'materials') return Object.assign({}, t, { status: '已完成' });
        return t;
      });
      p.tasks.unshift({
        id: 't-ocr-' + Date.now(),
        title: '财报 OCR 待确认',
        status: '待确认',
        target: 'ocr'
      });
      persistProject(ctx, p);
      renderProjectShell(ctx, p.id, 'ocr');
    }, 400);
    renderProjectShell(ctx, p.id, 'ocr');
  }

  function renderOcrPane(p) {
    return (
      '<div class="bk-wb-col-hd">右侧产出 · OCR 双栏校对<div class="spacer"></div>' +
      '<span class="bk-tag ' +
      (p.ocrConfirmed ? 'ok' : 'warn') +
      '">' +
      (p.ocrConfirmed ? '已确认' : '待确认') +
      '</span></div>' +
      '<div class="bk-wb-col-bd" style="display:flex;flex-direction:column;gap:8px">' +
      '<div class="bk-row-actions">' +
      '<span class="bk-muted">交互对齐芯鑫 OCR 双栏；样式用本 Demo 银行壳</span>' +
      '<div class="spacer"></div>' +
      '<button type="button" class="bk-btn" id="bkOcrRerun">重新识别</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkOcrConfirm">确认并继续生成报告</button></div>' +
      '<div class="bk-ocr2" style="flex:1">' +
      '<div class="pane"><div class="pane-hd">原文预览 · 资产负债表 p.12</div>' +
      '<div class="pane-bd"><div class="bk-preview-scan">扫描件预览（示意）<br/>' +
      esc(p.company) +
      '<br/>审计报告 2025</div></div></div>' +
      '<div class="pane"><div class="pane-hd">识别字段（可改）</div><div class="pane-bd">' +
      '<div class="bk-field"><span>货币资金</span><input value="120,450.00" /></div>' +
      '<div class="bk-field"><span>应收账款</span><input value="686,341.54" /></div>' +
      '<div class="bk-field"><span>存货</span><input value="210,088.00" /></div>' +
      '<div class="bk-field"><span>资产总计</span><input value="2,180,000.00" /></div>' +
      '<div class="bk-mat" style="margin-top:8px"><span>试算 · 流动资产合计</span><span class="bk-tag warn">差 121,467.34</span></div>' +
      '<div class="bk-mat"><span>资产 = 负债 + 权益</span><span class="bk-tag ok">平衡</span></div>' +
      '</div></div></div></div>'
    );
  }

  function bindOcrEvents(ctx, p, view) {
    if (view !== 'ocr') return;
    var rerun = ctx.rootEl.querySelector('#bkOcrRerun');
    if (rerun) {
      rerun.addEventListener('click', function () {
        ctx.toast('已重新跑 OCR（示意）');
      });
    }
    var ok = ctx.rootEl.querySelector('#bkOcrConfirm');
    if (ok) {
      ok.addEventListener('click', function () {
        p.ocrConfirmed = true;
        p.gaps = (p.gaps || []).filter(function (g) {
          return g.title.indexOf('OCR') < 0;
        });
        p.tasks = (p.tasks || []).map(function (t) {
          if (t.target === 'ocr') return Object.assign({}, t, { status: '已完成' });
          return t;
        });
        p.status = '可生成报告';
        p.updated = '刚刚';
        persistProject(ctx, p);
        ctx.toast('OCR 已确认 · 材料不齐也可生成，缺口标红');
        generateReport(ctx, p, true);
      });
    }
  }

  function renderReportPane(p, gapOpen, gapTab) {
    var secs = p.sections || [];
    var docHtml;
    if (!p.reportGenerated) {
      docHtml =
        '<div class="bk-empty" style="padding-top:48px">' +
        '<p>尚未生成尽调报告</p>' +
        '<p class="bk-muted">材料不齐也可生成；缺口将在正文与右窗标红</p>' +
        '<button type="button" class="bk-btn-primary bk-btn" id="bkGenReport" style="margin-top:12px">一键生成尽调报告</button>' +
        '</div>';
    } else {
      docHtml =
        '<div class="bk-doc">' +
        '<h2>' +
        esc(p.company) +
        ' · 尽调报告</h2>' +
        '<p class="bk-muted">连续文档主态 · 章旁「重新生成」为改写主路径</p>' +
        secs
          .map(function (s, idx) {
            return (
              '<div class="bk-doc-sec" id="sec-' +
              esc(s.id) +
              '"><h3>' +
              esc(s.title) +
              (s.gap ? ' <span class="bk-tag danger">缺口</span>' : ' <span class="bk-tag ok">' + esc(s.status) + '</span>') +
              (s.hasNewMaterial ? ' <span class="bk-tag warn">有新材料</span>' : '') +
              '<button type="button" class="bk-regen" data-regen="' +
              idx +
              '">↺ 重新生成</button></h3>' +
              '<p>' +
              renderSecBody(s.body) +
              '</p></div>'
            );
          })
          .join('') +
        '</div>';
    }

    return (
      '<div class="bk-wb-col-hd">右侧产出 · 尽调报告' +
      '<div class="spacer"></div>' +
      (p.reportGenerated
        ? '<button type="button" class="bk-btn" id="bkToggleGap" style="height:28px">' +
          (gapOpen ? '收起缺口/溯源' : '展开缺口/溯源') +
          '</button>' +
          '<button type="button" class="bk-btn" id="bkRegenAll" style="height:28px">重新生成报告</button>'
        : '') +
      '</div>' +
      '<div class="bk-right-shell">' +
      '<div class="bk-right-main"><div class="bk-wb-col-bd" id="bkReportDoc">' +
      docHtml +
      '</div></div>' +
      '<aside class="bk-aux' +
      (gapOpen ? ' open' : '') +
      '" aria-label="缺口与溯源">' +
      '<div class="bk-aux-tabs">' +
      '<button type="button" class="' +
      (gapTab === 'gaps' ? 'on' : '') +
      '" data-gaptab="gaps">缺少什么</button>' +
      '<button type="button" class="' +
      (gapTab === 'trace' ? 'on' : '') +
      '" data-gaptab="trace">溯源</button></div>' +
      '<div class="bk-aux-bd xb-overlay-scrollbar">' +
      (gapTab === 'gaps'
        ? (p.gaps || []).length
          ? (p.gaps || [])
              .map(function (g) {
                return (
                  '<div class="bk-gap-row"><strong>' +
                  esc(g.title) +
                  '</strong><div class="bk-muted">' +
                  esc(g.detail || '') +
                  '</div></div>'
                );
              })
              .join('')
          : '<p class="bk-muted">暂无材料缺口</p>'
        : (p.traces || []).length
          ? (p.traces || [])
              .map(function (t) {
                return (
                  '<div class="bk-trace-row"><strong>' +
                  esc(t.claim) +
                  '</strong><div class="bk-muted">' +
                  esc(t.source) +
                  '</div></div>'
                );
              })
              .join('')
          : '<p class="bk-muted">生成报告后可点段落查看溯源</p>') +
      '</div></aside></div>'
    );
  }

  function bindReportEvents(ctx, p, view) {
    if (view !== 'report' && view !== 'materials') return;
    var gen = ctx.rootEl.querySelector('#bkGenReport');
    if (gen) {
      gen.addEventListener('click', function () {
        generateReport(ctx, p, false);
      });
    }
    var toggle = ctx.rootEl.querySelector('#bkToggleGap');
    if (toggle) {
      toggle.addEventListener('click', function () {
        ctx.setState({ bankGapPanelOpen: !ctx.state.bankGapPanelOpen });
        renderProjectShell(ctx, p.id, 'report');
      });
    }
    ctx.rootEl.querySelectorAll('[data-gaptab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ctx.setState({
          bankGapTab: btn.getAttribute('data-gaptab'),
          bankGapPanelOpen: true
        });
        renderProjectShell(ctx, p.id, 'report');
      });
    });
    ctx.rootEl.querySelectorAll('[data-regen]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = Number(btn.getAttribute('data-regen'));
        var sec = p.sections[i];
        if (!sec) return;
        sec.status = '已生成';
        sec.gap = false;
        sec.hasNewMaterial = false;
        sec.body =
          '（已重新生成）' +
          sec.title +
          '：基于当前材料袋重跑。缺口字段若仍缺则保留标红。溯源已刷新。';
        p.traces = p.traces || [];
        p.traces.unshift({
          claim: sec.title + ' · 关键句',
          source: '材料：审计报告_2025.pdf p.12 / 工商公开面'
        });
        persistProject(ctx, p);
        ctx.setState({ bankGapPanelOpen: true, bankGapTab: 'trace' });
        ctx.toast('「' + sec.title + '」已重新生成');
        renderProjectShell(ctx, p.id, 'report');
      });
    });
    var all = ctx.rootEl.querySelector('#bkRegenAll');
    if (all) {
      all.addEventListener('click', function () {
        if (!window.confirm('重新生成整份报告？已定稿章（示意）将跳过。')) return;
        generateReport(ctx, p, true);
      });
    }
  }

  function generateReport(ctx, p, fromOcr) {
    var hasGap = (p.gaps || []).length > 0 || (p.materials || []).some(function (m) {
      return m.status === 'missing' && m.required;
    });
    p.reportGenerated = true;
    p.status = hasGap ? '报告草稿 · 有缺口' : '报告草稿';
    p.updated = '刚刚';
    p.sections = [
      {
        id: 's1',
        title: '1 客户基本情况',
        status: '已生成',
        gap: false,
        body:
          p.company +
          '，统一社会信用代码 ' +
          (p.creditCode || '（软建待补）') +
          '。本次申请额度 ' +
          p.amount +
          '、期限 ' +
          p.term +
          '。主体身份来自建项绑定企业。'
      },
      {
        id: 's2',
        title: '2 股权与控制关系',
        status: '已生成',
        gap: false,
        body: '公开面股权结构已写入（示意）。详细穿透见项目内公开面产出文档，非独立案例库页。'
      },
      {
        id: 's3',
        title: '3 财务分析',
        status: hasGap ? '缺口' : '已生成',
        gap: hasGap,
        body: hasGap
          ? {
              parts: [
                { type: 'text', text: '营收与应收同比（OCR 已采数）。' },
                { type: 'gap', text: '【缺】近一年银行流水未入库，现金流交叉验证无法完成' },
                { type: 'text', text: '。仍允许先出草稿。' }
              ]
            }
          : '三表钩稽已过；应收增速偏高，建议访谈核验。'
      },
      {
        id: 's4',
        title: '4 风险与合规',
        status: '已生成',
        gap: false,
        body: '未发现失信/被执行公开记录（示意 · T+0）。不替代业务投否决策。'
      },
      {
        id: 's5',
        title: '5 调查结论',
        status: hasGap ? '缺口' : '已生成',
        gap: hasGap,
        body: hasGap
          ? {
              parts: [
                { type: 'text', text: '建议在补齐' },
                { type: 'gap', text: '银行流水' },
                { type: 'text', text: '后定稿。本结论不替代信审决策。' }
              ]
            }
          : '材料齐备，可进入导出定稿流程。'
      }
    ];
    p.traces = [
      { claim: '主体存续正常', source: '公开面速览 · 工商照面' },
      { claim: '货币资金 120,450.00', source: '审计报告_2025.pdf · p.12 · OCR 确认' },
      {
        claim: '现金流交叉验证不足',
        source: '缺口：银行流水（近一年）· 左栏/右窗同源'
      }
    ];
    if (!p.gaps || !p.gaps.length) {
      p.gaps = hasGap
        ? [{ id: 'g1', title: '银行流水（近一年）', detail: '财务章 / 结论章标红' }]
        : [];
    }
    p.tasks = (p.tasks || []).filter(function (t) {
      return t.target !== 'report';
    });
    persistProject(ctx, p);
    ctx.setState({
      bankProjView: 'report',
      bankGapPanelOpen: hasGap || !!fromOcr,
      bankGapTab: 'gaps'
    });
    ctx.toast(hasGap ? '报告已生成 · 缺口已标红（可继续改）' : '报告已生成');
    renderProjectShell(ctx, p.id, 'report');
  }

  function renderPublicPane(p) {
    var b = p.publicBrief || {
      title: '公开面',
      lines: ['暂无公开面产出']
    };
    return (
      '<div class="bk-wb-col-hd">右侧产出 · 公开面文档<div class="spacer"></div>' +
      '<button type="button" class="bk-btn" id="bkBackReport" style="height:28px">回报告</button></div>' +
      '<div class="bk-wb-col-bd bk-public-doc"><h3>' +
      esc(b.title) +
      '</h3>' +
      (b.lines || [])
        .map(function (line) {
          return '<p>' + esc(line) + '</p>';
        })
        .join('') +
      '</div>'
    );
  }

  function renderExportPane(p) {
    return (
      '<div class="bk-wb-col-hd">导出 Word<div class="spacer"></div>' +
      '<button type="button" class="bk-btn" data-node-back="report" id="bkBackReport2" style="height:28px">回报告</button></div>' +
      '<div class="bk-wb-col-bd">' +
      (p.reportGenerated
        ? '<div class="bk-panel bk-success" style="border:none"><div class="big">✓</div>' +
          '<h2 style="margin:0 0 8px;color:var(--xb-brand,#0d2e4b);font-size:16px">可导出</h2>' +
          '<p class="bk-muted">《' +
          esc(p.company) +
          '_尽调报告.docx》（示意）' +
          ((p.gaps || []).length
            ? ' · 含 <span class="bk-tag danger">缺口 ' + (p.gaps || []).length + '</span> 提示页'
            : '') +
          '</p>' +
          '<div class="bk-row-actions" style="justify-content:center;margin-top:16px">' +
          '<button type="button" class="bk-btn-primary bk-btn" id="bkDlWord">下载 Word</button></div></div>'
        : '<div class="bk-empty">请先生成报告</div>') +
      '</div>'
    );
  }

  function bindExportEvents(ctx, p) {
    var dl = ctx.rootEl.querySelector('#bkDlWord');
    if (dl) {
      dl.addEventListener('click', function () {
        ctx.toast('开始下载 Word（示意）');
      });
    }
    var back = ctx.rootEl.querySelector('#bkBackReport') || ctx.rootEl.querySelector('#bkBackReport2');
    if (back) {
      back.addEventListener('click', function () {
        ctx.setState({ bankProjView: 'report' });
        renderProjectShell(ctx, p.id, 'report');
      });
    }
  }

  function renderTaskDrawer(p) {
    var tasks = p.tasks || [];
    return (
      '<div class="bk-drawer-mask" id="bkDrawerMask"></div>' +
      '<div class="bk-drawer" role="dialog" aria-label="项目内任务">' +
      '<div class="bk-wb-col-hd">本项目任务<div class="spacer"></div>' +
      '<button type="button" class="bk-btn" id="bkCloseTasks" style="height:28px">关闭</button></div>' +
      '<div class="bk-wb-col-bd">' +
      '<p class="bk-muted" style="margin:0 0 10px">任务挂在项目内，不做全局任务中心首页。</p>' +
      (tasks.length
        ? tasks
            .map(function (t) {
              return (
                '<div class="bk-task-row" data-task-target="' +
                esc(t.target || 'report') +
                '"><strong>' +
                esc(t.title) +
                '</strong> <span class="bk-tag ' +
                (t.status === '已完成' ? 'ok' : 'warn') +
                '">' +
                esc(t.status) +
                '</span></div>'
              );
            })
            .join('')
        : '<p class="bk-muted">暂无进行中任务</p>') +
      '</div></div>'
    );
  }

  function bindTaskDrawer(ctx, p, view) {
    var mask = ctx.rootEl.querySelector('#bkDrawerMask');
    var close = ctx.rootEl.querySelector('#bkCloseTasks');
    function shut() {
      ctx.setState({ bankTaskDrawerOpen: false });
      renderProjectShell(ctx, p.id, view);
    }
    if (mask) mask.addEventListener('click', shut);
    if (close) close.addEventListener('click', shut);
    ctx.rootEl.querySelectorAll('[data-task-target]').forEach(function (row) {
      row.addEventListener('click', function () {
        var t = row.getAttribute('data-task-target');
        ctx.setState({ bankTaskDrawerOpen: false, bankProjView: t === 'ocr' ? 'ocr' : 'report' });
        renderProjectShell(ctx, p.id, t === 'ocr' ? 'ocr' : 'report');
      });
    });
  }

  function renderHomeBank(ctx) {
    ensureStyles();
    var list = projectsOf(ctx).slice(0, 3);
    ctx.rootEl.innerHTML =
      '<div class="bk-page">' +
      '<div class="bk-toolbar"><h1>银行 · 授信尽调</h1><div class="spacer"></div>' +
      '<span class="bk-muted">对齐 IA v1.1</span>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkHomeNew">+ 新建项目</button></div>' +
      '<div class="bk-body" style="max-width:800px;margin:0 auto">' +
      '<p class="bk-muted" style="margin:0 0 14px">主链：新建项目（绑企业）→ 上传压缩包 → OCR（若有）→ 生成报告（缺口标红）→ 节点重生 → 导出。Chat 可见问答，不写正文。</p>' +
      '<div class="bk-panel"><h3>进行中项目</h3>' +
      (list.length
        ? list
            .map(function (p) {
              return (
                '<button type="button" class="bk-todo" data-nav="project/' +
                esc(p.id) +
                '"><div><div class="t">' +
                esc(p.name) +
                '</div><div class="d">' +
                esc(p.company) +
                ' · ' +
                esc(p.status || '') +
                '</div></div><span class="cta">进入 →</span></button>'
              );
            })
            .join('')
        : '<p class="bk-muted">暂无项目</p>') +
      '<div class="bk-row-actions" style="margin-top:8px">' +
      '<button type="button" class="bk-btn" data-nav="projects">全部项目</button>' +
      '<button type="button" class="bk-btn" data-nav="project/proj-huacheng/ocr">演示：OCR 主路径</button>' +
      '<button type="button" class="bk-btn" data-nav="customers">客户（轻）</button>' +
      '<button type="button" class="bk-btn" data-nav="cases">AML 案件库（次）</button></div>' +
      '</div></div></div>';
    ctx.rootEl.querySelector('#bkHomeNew').addEventListener('click', function () {
      openNewProjectModal(ctx);
    });
    bindNav(ctx.rootEl, ctx.navigate);
  }

  function render(route, ctx) {
    ensureStyles();
    closeBankModals();
    route = (route || '').replace(/^\//, '');

    var isShell =
      route.indexOf('project/') === 0 || route === 'pack/ocr';
    if (!isShell) resetRootLayout(ctx);

    if (route === 'projects') {
      renderProjects(ctx);
      return true;
    }
    if (route === 'customers') {
      renderCustomers(ctx);
      return true;
    }
    if (route === 'home' || route === '') {
      renderHomeBank(ctx);
      return true;
    }

    /* 兼容旧 hash：pack/ocr → 项目壳 OCR */
    if (route === 'pack/ocr') {
      var demo = getProject(ctx, 'proj-huacheng') || projectsOf(ctx)[0];
      if (demo) {
        ctx.setState({ bankProjView: 'ocr' });
        renderProjectShell(ctx, demo.id, 'ocr');
        return true;
      }
    }

    var pr = parseProjectRoute(route);
    if (pr) {
      if (pr.view === 'new') {
        renderProjects(ctx);
        openNewProjectModal(ctx);
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
