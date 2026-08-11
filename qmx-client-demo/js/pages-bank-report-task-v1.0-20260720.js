/**
 * 银行版 · 报告任务工作区
 * 路由：#bank:task/{taskId} · #bank:task/{taskId}/draft（同页双栏，/draft 定位正文）
 * 发起：能力中心 / Chat 调起同一套企业+材料表单
 * 布局：[材料树][执行过程][报告正文] 三栏，材料树可收缩，报告可全屏
 */
(function () {
  'use strict';

  /* 模块状态（生命周期同当前导航页面） */
  var _local = {
    filesOpen: true,
    openFolder: '材料袋',
    reportExpanded: false,
    editingChap: null,
    evidencePanelTab: 'source',
    evidenceCitationData: null,
    evidencePanelOpen: true,
    chatOpen: true,
    reportTabs: ['report'],
    reportActiveTab: 'report'
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

  function getTask(id) {
    var map = data().reportTasks || {};
    return map[id] || null;
  }

  function findCap(capId) {
    var caps = data().capabilities || {};
    var cats = Object.keys(caps);
    for (var i = 0; i < cats.length; i++) {
      var list = caps[cats[i]] || [];
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === capId) return list[j];
      }
    }
    return null;
  }

  function customers() {
    return data().customers || [];
  }

  function closeLaunchModal() {
    document.querySelectorAll('.bk-rt-launch-mask').forEach(function (el) {
      el.remove();
    });
  }

  /** 能力中心 / Chat 共用的轻量表单 */
  function openLaunchForm(ctx, opts) {
    opts = opts || {};
    closeLaunchModal();
    var cap = opts.cap || findCap(opts.capId) || {};
    var taskId = opts.taskId || cap.taskId || 'task-huacheng-dd';
    var task = getTask(taskId);
    var title = cap.title || (task && task.capTitle) || '报告';
    var custs = customers();
    var defaultCust =
      (task && task.enterpriseId) ||
      (custs[0] && custs[0].id) ||
      'cust-huacheng';
    var mats = (task && task.launchMaterials) || [
      { id: 'm1', name: '营业执照.pdf', state: 'reuse' },
      { id: 'm2', name: '审计报告_2025.pdf', state: 'reuse' },
      { id: 'm3', name: '公司章程.pdf', state: 'reuse' },
      { id: 'm4', name: '银行流水（近一年）', state: 'miss' }
    ];

    var mask = document.createElement('div');
    mask.className = 'bk-modal-mask bk-rt-launch-mask';
    mask.innerHTML =
      '<div class="bk-modal" role="dialog" aria-label="发起报告">' +
      '<div class="bk-modal-hd">发起 · ' +
      esc(title) +
      '</div>' +
      '<div class="bk-modal-bd xb-overlay-scrollbar" style="overflow-y:auto">' +
      '<p class="bk-rt-hint">确认企业与材料后进入任务工作区；Chat 不写报告正文。</p>' +
      '<label class="bk-field-l">企业名称 <span class="req">*</span></label>' +
      '<select class="bk-input" id="bkRtEnt" style="width:100%;margin-bottom:12px">' +
      custs
        .map(function (c) {
          return (
            '<option value="' +
            esc(c.id) +
            '"' +
            (c.id === defaultCust ? ' selected' : '') +
            '>' +
            esc(c.name) +
            '</option>'
          );
        })
        .join('') +
      '</select>' +
      '<label class="bk-field-l">材料（档案复用 / 待补）</label>' +
      '<div id="bkRtMats" style="margin-bottom:8px">' +
      mats
        .map(function (m) {
          var cls =
            m.state === 'miss' ? 'miss' : m.state === 'reuse' ? 'reuse' : '';
          var tag =
            m.state === 'miss' ? '待上传' : m.state === 'reuse' ? '档案复用' : '已选';
          return (
            '<span class="bk-rt-mat-chip ' +
            cls +
            '">' +
            esc(m.name) +
            ' · ' +
            esc(tag) +
            '</span>'
          );
        })
        .join('') +
      '</div>' +
      '<button type="button" class="bk-btn" id="bkRtUpload" style="margin-bottom:12px">+ 上传材料（示意）</button>' +
      '<label class="bk-field-l">补充说明（可选）</label>' +
      '<textarea class="bk-input" id="bkRtNote" rows="2" placeholder="例如：优先写股权与司法章…" style="width:100%;resize:vertical"></textarea>' +
      '</div>' +
      '<div class="bk-modal-ft">' +
      '<button type="button" class="bk-btn" id="bkRtCancel">取消</button>' +
      '<button type="button" class="bk-btn-primary bk-btn" id="bkRtStart">开始生成</button>' +
      '</div></div>';

    document.body.appendChild(mask);
    mask.addEventListener('click', function (e) {
      if (e.target === mask) closeLaunchModal();
    });
    mask.querySelector('#bkRtCancel').addEventListener('click', closeLaunchModal);
    mask.querySelector('#bkRtUpload').addEventListener('click', function () {
      if (ctx.toast) ctx.toast('已加入「银行流水」示意材料（局部续跑用）');
      var box = mask.querySelector('#bkRtMats');
      if (box) {
        box.insertAdjacentHTML(
          'beforeend',
          '<span class="bk-rt-mat-chip">银行流水（示意上传） · 已选</span>'
        );
      }
    });
    mask.querySelector('#bkRtStart').addEventListener('click', function () {
      var entEl = mask.querySelector('#bkRtEnt');
      var entId = entEl ? entEl.value : defaultCust;
      var t = getTask(taskId);
      if (t && title) {
        var entName =
          (customers().filter(function (c) {
            return c.id === entId;
          })[0] ||
            {}).name ||
          t.enterprise ||
          '';
        t.title = (entName || t.enterprise) + ' · ' + title;
        t.shortTitle = title;
        t.capTitle = title;
      }
      ensureTaskInList(taskId, title, entId);
      closeLaunchModal();
      if (ctx.toast) ctx.toast('已创建报告任务 · 进入任务工作区');
      ctx.setState({ bankRtChap: null });
      ctx.navigate('task/' + taskId);
    });
  }

  function ensureTaskInList(taskId, capTitle, enterpriseId) {
    var list = data().tasks;
    if (!list) return;
    var task = getTask(taskId);
    var ent =
      (customers().filter(function (c) {
        return c.id === enterpriseId;
      })[0] ||
        {}).name ||
      (task && task.enterprise) ||
      '';
    var exists = list.some(function (t) {
      return t.id === taskId || t.route === 'task/' + taskId;
    });
    if (exists) return;
    list.unshift({
      id: taskId,
      status: (task && task.taskBucket) || 'running',
      title:
        (ent ? ent.replace(/有限公司|股份有限公司/, '') : '某科技') +
        ' · ' +
        (capTitle || (task && task.shortTitle) || '报告') +
        ' · ' +
        ((task && task.statusLabel) || '材料解析中'),
      enterprise: ent || (task && task.enterprise) || '',
      route: 'task/' + taskId,
      updated: '刚刚'
    });
  }

  function stepMark(st) {
    if (st === 'ok') return '<span class="bk-rt-step-mark ok">✓</span>';
    if (st === 'warn') return '<span class="bk-rt-step-mark warn">!</span>';
    if (st === 'run') return '<span class="bk-rt-step-mark run">◐</span>';
    return '<span class="bk-rt-step-mark todo">○</span>';
  }

  function chapMark(st) {
    if (st === 'ok') return '<span class="bk-rt-chap-st ok">✓</span>';
    if (st === 'run') return '<span class="bk-rt-chap-st run">◐</span>';
    if (st === 'warn') return '<span class="bk-rt-chap-st warn">!</span>';
    return '<span class="bk-rt-chap-st todo">○</span>';
  }

  function triTag(kind) {
    if (kind === 'ok') return '<span class="bk-tag ok">证据充分</span>';
    if (kind === 'warn') return '<span class="bk-tag warn">待核实</span>';
    if (kind === 'na') return '<span class="bk-tag dd">暂无法分析</span>';
    return '';
  }

  function qCardHtml(q) {
    return (
      '<div class="bk-rt-qcard' +
      (q.paused ? ' paused' : '') +
      '"><h4>' +
      esc(q.title) +
      (q.paused ? ' · 本章暂停' : '') +
      '</h4><p>' +
      esc(q.body) +
      '</p><div class="bk-rt-q-actions">' +
      (q.actions || [])
        .map(function (a) {
          return (
            '<button type="button" class="bk-btn" data-rt-act="' +
            esc(a.act) +
            '" data-rt-qid="' +
            esc(q.id) +
            '">' +
            esc(a.label) +
            '</button>'
          );
        })
        .join('') +
      '</div></div>'
    );
  }

  function wrapPage(inner) {
    return '<div class="bk-rt-page">' + inner + '</div>';
  }

  function applyCiteActive(html, activeCite) {
    if (!activeCite || !html) return html || '';
    return html.replace(
      new RegExp(
        'class="bk-cite"(?=[^>]*\\bdata-arg="' +
          String(activeCite).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
          '")',
        'g'
      ),
      'class="bk-cite is-active"'
    );
  }

  /* ——— 材料文件树 ——— */
  function fileTreeHtml(task) {
    if (_local.filesOpen === false) {
      return (
        '<div class="bk-rt-files-col is-collapsed">' +
        '<button type="button" class="bk-rt-files-expand-fab" data-rt-act="toggleRtFiles" title="展开材料">›</button>' +
        '</div>'
      );
    }
    var mats = task.launchMaterials || [];
    var open = _local.openFolder === '材料袋';
    var files = '';
    if (open) {
      files = mats
        .map(function (m) {
          var isMiss = m.state === 'miss';
          return (
            '<div class="xb-files-file' +
            (isMiss ? ' bk-rt-file-miss' : '') +
            '">' +
            esc(m.name) +
            (isMiss
              ? ' <span class="bk-rt-miss-badge">待补</span>'
              : '') +
            '</div>'
          );
        })
        .join('');
      if (!files) files = '<div class="xb-files-file is-muted">暂无材料</div>';
    }
    return (
      '<div class="bk-rt-files-col">' +
      '<aside class="xb-files-pane">' +
      '<div class="xb-files-head"><span>材料</span>' +
      '<button type="button" class="xb-files-collapse-btn" data-rt-act="toggleRtFiles" title="收起材料栏">‹</button>' +
      '</div>' +
      '<div class="xb-files-tree-scroll">' +
      '<div class="xb-files-sec">任务材料</div>' +
      '<button type="button" class="xb-files-folder' +
      (open ? ' is-open' : '') +
      '" data-rt-act="toggleRtFolder" data-rt-arg="材料袋">' +
      '<span class="xb-files-folder-label">' +
      '<span>' + (open ? '▾' : '▸') + '</span>' +
      '<span>材料袋</span>' +
      '</span>' +
      '<span class="xb-files-folder-count">' + mats.length + '</span>' +
      '</button>' +
      files +
      '</div>' +
      '<button type="button" class="xb-files-upload-btn" data-rt-act="uploadMat">＋ 上传材料</button>' +
      '</aside>' +
      '</div>'
    );
  }

  /* ——— 报告目录（TOC） ——— */
  function reportTocHtml(task) {
    var chapters = task.chapters || [];
    if (!chapters.length) return '';
    return (
      '<div class="bk-rt-toc">' +
      '<span class="bk-rt-toc-label">目录</span>' +
      '<div class="bk-rt-toc-list">' +
      chapters
        .map(function (c) {
          return (
            '<button type="button" class="bk-rt-toc-item" data-rt-act="jump-chap" data-rt-chap="' +
            esc(c.id) +
            '">' +
            chapMark(c.status) +
            '<span>' +
            esc(c.title) +
            '</span>' +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '</div>'
    );
  }

  /** 右栏：按章节拼接可读正文 */
  function reportBodyHtml(task, activeCite) {
    var chapters = task.chapters || [];
    var drafts = task.draftByChapter || {};
    if (!chapters.length) {
      return '<p class="bk-rt-hint">暂无报告章节。</p>';
    }
    return chapters
      .map(function (c) {
        var draft = drafts[c.id];
        var title = (draft && draft.title) || c.title || '章节';
        var body;
        var isEditing = _local.editingChap === c.id;
        if (draft && draft.html) {
          body = applyCiteActive(draft.html, activeCite);
        } else if (c.status === 'run') {
          body =
            '<p class="bk-muted">本章生成中… ' +
            esc(c.note || '') +
            '</p>';
        } else if (c.status === 'todo') {
          body =
            '<p class="bk-muted">尚未开始。' +
            esc(c.note || '') +
            '</p>';
        } else {
          body =
            '<p class="bk-muted">' +
            esc(c.note || '本章草稿示意。') +
            '</p>';
        }
        var gap =
          c.status === 'warn' ||
          (body && body.indexOf('bk-dd-gap-inline') >= 0);
        var editBtn = isEditing
          ? '<button type="button" class="bk-btn bk-rt-sec-edit is-editing" data-rt-act="saveSec" data-rt-chap="' +
            esc(c.id) +
            '">完成编辑</button>'
          : '<button type="button" class="bk-btn bk-rt-sec-edit" data-rt-act="editSec" data-rt-chap="' +
            esc(c.id) +
            '">编辑</button>';
        return (
          '<section class="bk-rt-sec' +
          (gap ? ' is-gap' : '') +
          (isEditing ? ' is-editing' : '') +
          '" id="bk-rt-sec-' +
          esc(c.id) +
          '">' +
          '<div class="bk-rt-sec-h">' +
          chapMark(c.status) +
          '<div class="bk-rt-sec-title"><h3>' +
          esc(title) +
          '</h3>' +
          (c.locked
            ? '<span class="bk-rt-locked">已锁定</span>'
            : '') +
          (c.note
            ? '<span class="bk-rt-sec-note">' + esc(c.note) + '</span>'
            : '') +
          '</div>' +
          editBtn +
          (c.locked
            ? ''
            : '<button type="button" class="bk-btn bk-rt-sec-lock" data-rt-act="lock" data-rt-chap="' +
              esc(c.id) +
              '">锁定</button>') +
          '</div>' +
          '<div class="bk-rt-doc"' +
          (isEditing ? ' contenteditable="true" data-rt-chap="' + esc(c.id) + '"' : '') +
          '>' +
          body +
          '</div></section>'
        );
      })
      .join('');
  }

  function evidenceFooterHtml(task, activeCite) {
    var cites = task.cites || [];
    var flat = [];
    if (cites.length) {
      cites.forEach(function (c) {
        flat.push({
          id: c.id,
          text:
            '[' +
            (c.label || '') +
            '] ' +
            (c.source || '') +
            (c.page ? ' · ' + c.page : '') +
            (c.detail ? ' · ' + c.detail : '')
        });
      });
    } else {
      var byChap = task.evidenceByChapter || {};
      Object.keys(byChap).forEach(function (cid) {
        (byChap[cid] || []).forEach(function (e, i) {
          if (typeof e === 'string') {
            var m = e.match(/^\[(\d+)\]\s*(.*)$/);
            flat.push({
              id: m ? 'c' + m[1] : cid + '-' + i,
              text: e
            });
          }
        });
      });
    }
    if (!flat.length) return '';
    return (
      '<div class="bk-rt-evid-foot" id="bkRtEvidFoot">' +
      '<div class="bk-rt-evid-foot-h">证据与页码</div>' +
      flat
        .map(function (e) {
          return (
            '<div class="bk-rt-evidence' +
            (e.id && e.id === activeCite ? ' is-active' : '') +
            '" id="bk-rt-ev-' +
            esc(e.id) +
            '">' +
            esc(e.text) +
            '</div>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function taskEvidencePanelHtml(task) {
    var tab = _local.evidencePanelTab || 'source';
    var tabs = [
      { id: 'issue', label: '问题卡' },
      { id: 'finding', label: '关键发现' },
      { id: 'source', label: '溯源' }
    ];
    var tabsHtml = tabs.map(function (t) {
      return (
        '<button type="button" class="ev-tab' + (tab === t.id ? ' active' : '') +
        '" data-rt-act="evTab" data-rt-arg="' + t.id + '">' + t.label + '</button>'
      );
    }).join('');

    var bodyHtml = '';
    if (tab === 'source') {
      var cites = task.cites || [];
      var activeCitId = _local.evidenceCitationData && _local.evidenceCitationData.id;
      if (!cites.length) {
        bodyHtml =
          '<div class="ev-source-placeholder">' +
          '<div class="ev-source-placeholder-icon">⟦N⟧</div>' +
          '<div>暂无溯源数据</div>' +
          '</div>';
      } else {
        bodyHtml = cites.map(function (c, i) {
          var isActive = activeCitId === c.id;
          return (
            '<div class="ev-source-card' + (isActive ? ' is-active' : '') + '" id="ev-cite-' + esc(c.id) + '">' +
            '<div class="ev-source-meta">' +
            '<span class="cite-num">[' + (i + 1) + ']</span>' +
            '<span class="ev-source-kind">' + esc(c.source || '') + '</span>' +
            '<span class="ev-source-page">' + esc(c.page || '') + '</span>' +
            '</div>' +
            '<div class="ev-source-title">' + esc(c.claim || c.label || '') + '</div>' +
            (c.detail ? '<div class="ev-source-snippet">' + esc(c.detail) + '</div>' : '') +
            '<button type="button" class="bk-btn" style="margin-top:6px;font-size:11px;padding:2px 8px" data-rt-act="viewOcr" data-rt-arg="' + esc(c.id) + '">查看原文</button>' +
            '</div>'
          );
        }).join('');
      }
    } else if (tab === 'issue') {
      var questions = task.questions || [];
      if (!questions.length) {
        bodyHtml = '<div class="empty-hint">暂无问题卡</div>';
      } else {
        bodyHtml = questions.map(qCardHtml).join('');
      }
    } else if (tab === 'finding') {
      var findings = task.findings || [];
      if (!findings.length) {
        bodyHtml = '<div class="empty-hint">暂无关键发现</div>';
      } else {
        bodyHtml = findings.map(function (f) {
          return (
            '<div class="bk-rt-find">' +
            '<div class="bk-rt-find-h"><strong>' + esc(f.title) + '</strong>' + triTag(f.tri) + '</div>' +
            '<p style="margin:0 0 8px;color:var(--xb-muted);font-size:12px;line-height:1.5">' + esc(f.body) + '</p>' +
            (f.included
              ? '<span class="bk-tag ok">已纳入报告</span>'
              : '<button type="button" class="bk-btn xb-btn-mini-primary" data-rt-act="include" data-rt-fid="' + esc(f.id) + '">纳入报告</button>') +
            '</div>'
          );
        }).join('');
      }
    }

    return (
      '<aside class="xb-evidence-panel">' +
      '<div class="ev-panel-hd">' +
      '<div class="ev-tabs">' + tabsHtml + '</div>' +
      '<button type="button" class="ev-collapse-btn" data-rt-act="toggleEvPanel" title="收起">›</button>' +
      '</div>' +
      '<div class="ev-body">' + bodyHtml + '</div>' +
      '</aside>'
    );
  }

  function reportPaneTabBarHtml() {
    var tabs = _local.reportTabs || ['report'];
    var activeTab = _local.reportActiveTab || 'report';

    var tabsHtml = tabs.map(function (t) {
      var id = typeof t === 'string' ? t : t.id;
      var label = typeof t === 'string' ? (t === 'report' ? '报告草稿' : t) : (t.label || t.id);
      var isActive = activeTab === id;
      var canClose = id !== 'report';
      return (
        '<div class="bk-rt-tab-item' + (isActive ? ' active' : '') + '">' +
        '<button type="button" class="bk-rt-tab-label" data-rt-act="switchReportTab" data-rt-arg="' + esc(id) + '">' + esc(label) + '</button>' +
        (canClose
          ? '<button type="button" class="bk-rt-tab-close" data-rt-act="closeReportTab" data-rt-arg="' + esc(id) + '">×</button>'
          : '<span class="bk-rt-tab-close bk-rt-tab-close--dim">×</span>') +
        '</div>'
      );
    }).join('');

    var expandBtn = _local.reportExpanded
      ? '<button type="button" class="bk-rt-expand-btn" data-rt-act="toggleRtExpand" title="还原">⤡</button>'
      : '<button type="button" class="bk-rt-expand-btn" data-rt-act="toggleRtExpand" title="报告全屏">⤢</button>';

    return (
      '<div class="bk-rt-tab-bar">' +
      '<div class="bk-rt-tab-list">' + tabsHtml + '</div>' +
      '<span class="bk-rt-tab-hint">缺口标红 · 角标定位溯源</span>' +
      '<div class="spacer"></div>' +
      expandBtn +
      '</div>'
    );
  }

  function ocrTabHtml(tabId, task) {
    var cites = task.cites || [];
    var cite = cites.filter(function (c) { return c.id === tabId; })[0];
    if (!cite) return '<p class="bk-rt-hint">文档加载中…</p>';
    return (
      '<div class="bk-rt-ocr-placeholder">' +
      '<div class="bk-rt-ocr-hd">' +
      '<span class="bk-tag dd">原文预览</span>' +
      '<strong style="margin-left:8px;font-size:13px">' + esc(cite.source || '文档') + '</strong>' +
      (cite.page ? '<span class="bk-muted" style="margin-left:8px;font-size:12px">' + esc(cite.page) + '</span>' : '') +
      '</div>' +
      (cite.detail ? '<blockquote class="bk-rt-ocr-quote">' + esc(cite.detail) + '</blockquote>' : '') +
      '<p class="bk-rt-hint" style="margin-top:14px">完整原文渲染集成企业档案 OCR 服务（示意）</p>' +
      '</div>'
    );
  }

  function toolbarHtml(task) {
    var pct = task.progress != null ? task.progress : 0;
    return (
      '<div class="bk-rt-toolbar">' +
      '<h1>' +
      esc(task.title) +
      '</h1>' +
      '<div class="bk-rt-progress"><span class="bk-rt-progress-bar"><i style="width:' +
      pct +
      '%"></i></span>' +
      pct +
      '% · ' +
      esc(task.statusLabel || '') +
      '</div>' +
      '<div class="spacer"></div>' +
      '<button type="button" class="bk-btn" data-nav="tasks">任务中心</button>' +
      '</div>'
    );
  }

  function renderWorkspace(ctx, task, taskId, opts) {
    opts = opts || {};
    var steps = task.steps || [];
    var chapters = task.chapters || [];
    var activeCite = (_local.evidenceCitationData && _local.evidenceCitationData.id) || ctx.state.bankRtCite || '';

    var filesCol = fileTreeHtml(task);

    /* ——— 执行/对话列（可收起） ——— */
    var left = '';
    if (_local.chatOpen) {
      left =
        '<div class="bk-rt-pane bk-rt-pane--exec">' +
        '<div class="bk-rt-pane-h">执行过程' +
        '<div class="spacer"></div>' +
        '<button type="button" class="bk-rt-expand-btn" data-rt-act="toggleChat" title="收起对话">‹</button>' +
        '</div>' +
        '<div class="bk-rt-pane-bd xb-overlay-scrollbar">' +
        '<div style="margin-bottom:12px">' +
        steps.map(function (s) {
          return (
            '<div class="bk-rt-step">' +
            stepMark(s.status) +
            '<div><strong>' + esc(s.title) + '</strong>' +
            '<div class="bk-rt-chap-meta">' + esc(s.desc || '') + '</div>' +
            '</div></div>'
          );
        }).join('') +
        '</div>' +
        (chapters.length
          ? '<div class="bk-rt-chap-mini">' +
            '<div class="bk-rt-chap-mini-h">章节生成</div>' +
            chapters.map(function (c) {
              return (
                '<button type="button" class="bk-rt-chap-mini-item" data-rt-act="jump-chap" data-rt-chap="' + esc(c.id) + '">' +
                chapMark(c.status) +
                '<span>' + esc(c.title) + '</span>' +
                '</button>'
              );
            }).join('') +
            '</div>'
          : '') +
        '</div>' +
        '<div class="bk-rt-composer">' +
        '<button type="button" class="bk-btn bk-rt-composer-plus" data-rt-act="composerPlus" title="更多操作">＋</button>' +
        '<textarea id="bkRtChat" rows="2" placeholder="补充说明 / 追问…"></textarea>' +
        '<button type="button" class="bk-btn-primary bk-btn" data-rt-act="send">发送</button>' +
        '</div></div>';
    }

    /* ——— 报告正文列 ——— */
    var activeTabId = _local.reportActiveTab || 'report';
    var right =
      '<div class="bk-rt-pane bk-rt-pane--report" id="bkRtReportPane">' +
      /* FABs for collapsed panels */
      (!_local.chatOpen
        ? '<button type="button" class="bk-rt-reopen-chat-fab" data-rt-act="toggleChat" title="展开对话">›</button>'
        : '') +
      (!_local.evidencePanelOpen
        ? '<button type="button" class="bk-rt-reopen-ev-fab" data-rt-act="toggleEvPanel" title="展开证据面板">‹</button>'
        : '') +
      reportPaneTabBarHtml() +
      reportTocHtml(task) +
      '<div class="bk-rt-pane-bd xb-overlay-scrollbar" id="bkRtReportScroll">' +
      '<div class="bk-rt-report" id="bkRtDoc">' +
      (activeTabId === 'report'
        ? reportBodyHtml(task, activeCite)
        : ocrTabHtml(activeTabId, task)) +
      '</div></div></div>';

    /* ——— 证据面板（可收起） ——— */
    var evPanel = _local.evidencePanelOpen ? taskEvidencePanelHtml(task) : '';

    var bodyClass = 'bk-rt-body bk-rt-body--with-files bk-rt-has-ev' +
      (!_local.chatOpen ? ' bk-rt-chat-collapsed' : '') +
      (!_local.evidencePanelOpen ? ' bk-rt-ev-collapsed' : '') +
      (_local.filesOpen === false ? ' bk-rt-files-collapsed' : '') +
      (_local.reportExpanded ? ' bk-rt-report-expanded' : '');

    ctx.rootEl.innerHTML = wrapPage(
      toolbarHtml(task) +
      '<div class="' + bodyClass + '">' +
      filesCol +
      left +
      right +
      evPanel +
      '</div>'
    );
    bindWorkspace(ctx, task, taskId);

    if (opts.focusReport || opts.focusChap) {
      requestAnimationFrame(function () {
        if (opts.focusChap) {
          scrollToChapter(ctx, opts.focusChap);
        } else {
          scrollToReport(ctx);
        }
      });
    } else if (activeCite) {
      requestAnimationFrame(function () {
        var el = ctx.rootEl.querySelector('#ev-cite-' + activeCite);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  function scrollToReport(ctx) {
    var sc = ctx.rootEl.querySelector('#bkRtReportScroll');
    if (sc) sc.scrollTop = 0;
    var pane = ctx.rootEl.querySelector('#bkRtReportPane');
    if (pane) pane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function scrollToChapter(ctx, chapId) {
    var el = ctx.rootEl.querySelector('#bk-rt-sec-' + chapId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('is-flash');
      setTimeout(function () {
        el.classList.remove('is-flash');
      }, 1200);
    } else {
      scrollToReport(ctx);
    }
  }

  function bindWorkspace(ctx, task, taskId) {
    ctx.rootEl.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var r = el.getAttribute('data-nav');
        if (r) ctx.navigate(r);
      });
    });
    ctx.rootEl.querySelectorAll('.bk-cite').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var citeId = btn.getAttribute('data-arg');
        if (!citeId) return;
        /* 在 task.cites 里找匹配的溯源条目 */
        var cites = task.cites || [];
        var match = cites.filter(function (c) { return c.id === citeId; })[0];
        if (match) {
          _local.evidenceCitationData = {
            id: match.id,
            claim: match.claim || '',
            source: match.source || '',
            page: match.page || '',
            detail: match.detail || ''
          };
        } else {
          /* evidenceByChapter fallback */
          _local.evidenceCitationData = { id: citeId, claim: citeId, source: '', page: '', detail: '' };
        }
        _local.evidencePanelTab = 'source';
        /* 如果报告已全屏，退出全屏以显示证据面板 */
        _local.reportExpanded = false;
        /* 确保证据面板已打开 */
        _local.evidencePanelOpen = true;
        renderWorkspace(ctx, task, taskId);
      });
    });
    ctx.rootEl.querySelectorAll('[data-rt-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-rt-act');

        /* ——— 证据面板 Tab ——— */
        if (act === 'evTab') {
          _local.evidencePanelTab = btn.getAttribute('data-rt-arg') || 'source';
          renderWorkspace(ctx, task, taskId);
          return;
        }

        /* ——— 面板收起/展开 ——— */
        if (act === 'toggleEvPanel') {
          _local.evidencePanelOpen = !_local.evidencePanelOpen;
          renderWorkspace(ctx, task, taskId);
          return;
        }
        if (act === 'toggleChat') {
          _local.chatOpen = !_local.chatOpen;
          renderWorkspace(ctx, task, taskId);
          return;
        }

        /* ——— 报告 tab ——— */
        if (act === 'switchReportTab') {
          _local.reportActiveTab = btn.getAttribute('data-rt-arg') || 'report';
          renderWorkspace(ctx, task, taskId);
          return;
        }
        if (act === 'closeReportTab') {
          var closeId = btn.getAttribute('data-rt-arg');
          _local.reportTabs = (_local.reportTabs || ['report']).filter(function (t) { return t !== closeId; });
          if (_local.reportActiveTab === closeId) _local.reportActiveTab = 'report';
          renderWorkspace(ctx, task, taskId);
          return;
        }
        if (act === 'viewOcr') {
          var citeId2 = btn.getAttribute('data-rt-arg');
          var ocrTabId = 'ocr-' + citeId2;
          var tabs = _local.reportTabs || ['report'];
          if (tabs.indexOf(ocrTabId) < 0) _local.reportTabs = tabs.concat([ocrTabId]);
          _local.reportActiveTab = ocrTabId;
          renderWorkspace(ctx, task, taskId);
          return;
        }

        /* ——— 输入框 + 按钮 ——— */
        if (act === 'composerPlus') {
          if (ctx.toast) ctx.toast('更多操作（示意）');
          return;
        }

        /* ——— 材料树 ——— */
        if (act === 'toggleRtFiles') {
          _local.filesOpen = !_local.filesOpen;
          renderWorkspace(ctx, task, taskId);
          return;
        }
        if (act === 'toggleRtFolder') {
          var folderName = btn.getAttribute('data-rt-arg');
          _local.openFolder = _local.openFolder === folderName ? null : folderName;
          renderWorkspace(ctx, task, taskId);
          return;
        }
        if (act === 'uploadMat') {
          if (ctx.toast) ctx.toast('上传材料（示意）');
          return;
        }

        /* ——— 报告全屏 ——— */
        if (act === 'toggleRtExpand') {
          _local.reportExpanded = !_local.reportExpanded;
          renderWorkspace(ctx, task, taskId, { focusReport: true });
          return;
        }

        /* ——— 章节编辑 ——— */
        if (act === 'editSec') {
          var chapId = btn.getAttribute('data-rt-chap');
          _local.editingChap = chapId;
          renderWorkspace(ctx, task, taskId, { focusChap: chapId });
          return;
        }
        if (act === 'saveSec') {
          var chapId = btn.getAttribute('data-rt-chap');
          /* 读取 contenteditable 的当前 HTML 并保存回 draftByChapter */
          var docEl = ctx.rootEl.querySelector(
            '.bk-rt-doc[data-rt-chap="' + chapId + '"]'
          );
          if (docEl && task.draftByChapter) {
            if (!task.draftByChapter[chapId]) {
              task.draftByChapter[chapId] = { title: '', html: '' };
            }
            task.draftByChapter[chapId].html = docEl.innerHTML;
          }
          _local.editingChap = null;
          renderWorkspace(ctx, task, taskId, { focusChap: chapId });
          if (ctx.toast) ctx.toast('已保存编辑（示意）');
          return;
        }

        if (act === 'scroll-report') {
          scrollToReport(ctx);
          return;
        }
        if (act === 'jump-chap') {
          scrollToChapter(ctx, btn.getAttribute('data-rt-chap'));
          return;
        }
        if (act === 'send') {
          var ta = ctx.rootEl.querySelector('#bkRtChat');
          var v = ((ta && ta.value) || '').trim();
          if (ctx.toast) {
            ctx.toast(
              v
                ? '已记录补充说明（示意）· 受影响章将局部续跑'
                : '请输入补充说明'
            );
          }
          if (ta) ta.value = '';
          return;
        }
        if (act === 'include') {
          var fid = btn.getAttribute('data-rt-fid');
          (task.findings || []).forEach(function (f) {
            if (f.id === fid) f.included = true;
          });
          if (ctx.toast) ctx.toast('已纳入对应章节（示意）');
          renderWorkspace(ctx, task, taskId);
          return;
        }
        if (act === 'lock') {
          var chapId = btn.getAttribute('data-rt-chap');
          (task.chapters || []).forEach(function (c) {
            if (c.id === chapId) c.locked = true;
          });
          if (ctx.toast) ctx.toast('本章已锁定 · 补件续跑不覆盖');
          renderWorkspace(ctx, task, taskId, { focusChap: chapId });
          return;
        }
        if (act === 'answer' || act === 'upload' || act === 'skip') {
          var qid = btn.getAttribute('data-rt-qid');
          var hitQ = (task.questions || []).filter(function (q) {
            return q.id === qid;
          })[0];
          var chapTarget = hitQ && hitQ.chapterId;
          if (ctx.toast) {
            ctx.toast(
              act === 'upload'
                ? '已补件 · 仅重跑受影响分析与章节（示意）'
                : act === 'skip'
                  ? '已暂时跳过 · 章节标「暂无法分析」'
                  : '已确认 · 局部续跑受影响章节'
            );
          }
          task.questions = (task.questions || []).filter(function (q) {
            return q.id !== qid;
          });
          if (act === 'skip') {
            (task.chapters || []).forEach(function (c) {
              if (!chapTarget || c.id === chapTarget) {
                if (c.status === 'warn' || c.id === chapTarget) {
                  c.status = 'warn';
                  c.note = '暂无法分析 · 用户跳过';
                }
              }
            });
            task.statusLabel = '草稿已生成';
          } else if (act === 'answer' || act === 'upload') {
            (task.chapters || []).forEach(function (c) {
              if (chapTarget ? c.id === chapTarget : c.status === 'warn') {
                if (!c.locked) {
                  c.status = 'run';
                  c.note = '局部续跑中…';
                }
              }
            });
            task.progress = Math.min(95, (task.progress || 60) + 12);
            task.statusLabel = '报告生成中';
          }
          renderWorkspace(ctx, task, taskId, {
            focusChap: chapTarget || undefined
          });
        }
      });
    });
  }

  function renderTask(ctx, taskId, focusReport) {
    var task = getTask(taskId);
    if (!task) {
      ctx.rootEl.innerHTML =
        '<div class="page-body"><p class="bk-muted">未找到任务 ' +
        esc(taskId) +
        '</p><button type="button" class="bk-btn" data-nav="tasks">回任务中心</button></div>';
      ctx.rootEl.querySelectorAll('[data-nav]').forEach(function (el) {
        el.addEventListener('click', function () {
          ctx.navigate(el.getAttribute('data-nav'));
        });
      });
      return;
    }
    renderWorkspace(ctx, task, taskId, { focusReport: !!focusReport });
  }

  /**
   * @returns {boolean} handled
   */
  function render(route, ctx) {
    route = (route || '').replace(/^\//, '');
    var m = /^task\/([^/]+)(?:\/(draft))?$/.exec(route);
    if (!m) return false;
    if (
      window.BankProjectPages &&
      typeof window.BankProjectPages.resetRootLayout === 'function'
    ) {
      window.BankProjectPages.resetRootLayout(ctx);
    }
    /* 新路由进入时重置 _local，避免跨任务状态串扰 */
    _local.editingChap = null;
    _local.reportTabs = ['report'];
    _local.reportActiveTab = 'report';
    _local.evidenceCitationData = null;
    renderTask(ctx, m[1], m[2] === 'draft');
    return true;
  }

  function isReportLaunchCap(cap) {
    return !!(cap && cap.launch === 'report' && cap.ready && !cap.later);
  }

  window.BankReportTaskPages = {
    render: render,
    openLaunchForm: openLaunchForm,
    isReportLaunchCap: isReportLaunchCap,
    findCap: findCap,
    getTask: getTask,
    closeLaunchModal: closeLaunchModal
  };
})();
