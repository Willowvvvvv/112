/**
 * 完整能力 Demo · 壳路由
 * PE ↔ 银行 由 state.mode 切换；页面由 PEPages / BankPages 渲染
 */
(function () {
  'use strict';

  var AUTH_KEY = 'qmx_logged_in';
  var AUTH_ORG_KEY = 'qmx_login_org';
  var DENSITY_KEY = 'qmx-density';
  var THEME_KEY = 'qmx-theme';
  var DEMO_USERS = [
    {
      phone: '13800138000',
      name: '王敏',
      memberships: [
        { org: '启明星基金', role: 'manager' },
        { org: '众源资本', role: 'manager' },
      ],
    },
    {
      phone: '13800138001',
      name: '林启',
      memberships: [{ org: '启明星基金', role: 'admin' }],
    },
  ];
  var DEMO_LOGIN_CFG = {
    registrationOpen: false,
    hint: '未开通的手机号将自动创建账号',
    protocols: [
      { name: '用户隐私协议', url: '#' },
      { name: '服务协议', url: '#' },
    ],
  };

  var state = {
    mode: 'pe',
    route: 'home',
    displayName: '王敏',
    phone: '13800138000',
    org: '启明星基金',
    /** Demo 保留字段，不再用于菜单可见性 */
    role: 'manager',
    /** peRole: 仅 Demo 切首页投资向／投后向，不是产品角色 */
    peRole: 'investment',
    sessions: {},
    shellMoreOpen: false,
    userMenuOpen: false,
    loggedIn: false,
    loginCodeSentTo: '',
    loginCodeValue: '',
    loginCooldown: 0,
  };

  var NAV_ICONS = {
    'plus-square':  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><line x1="8" y1="5" x2="8" y2="11"/><line x1="5" y1="8" x2="11" y2="8"/></svg>',
    'folder':       '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 5a1 1 0 011-1h3l1.5 2H13a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V5z"/></svg>',
    'branch':       '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="4" cy="3.5" r="1.5"/><circle cx="4" cy="12.5" r="1.5"/><circle cx="12" cy="3.5" r="1.5"/><path d="M4 5v6M4 5c0 3 8 3 8 0"/></svg>',
    'grid':         '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
    'radar':        '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="2"/><path d="M5 5a4.2 4.2 0 000 6M11 5a4.2 4.2 0 010 6"/><path d="M2.5 2.5a8.5 8.5 0 000 11M13.5 2.5a8.5 8.5 0 010 11"/></svg>',
    'book':         '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 2h8a1 1 0 011 1v10a1 1 0 01-1 1H3V2z"/><line x1="3" y1="2" x2="3" y2="14"/><line x1="6" y1="6" x2="10" y2="6"/><line x1="6" y1="9" x2="10" y2="9"/></svg>',
    'activity':     '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,8 4,8 6,3 8,13 10,6 12,8 15,8"/></svg>',
    'users':        '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="12" cy="4.5" r="2"/><path d="M15 14c0-2.2-1.8-4-4-4"/></svg>',
    'phone':        '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 2h3l1.5 3.5-1.5 1c1 1.9 2.5 3.5 4.5 4.5l1-1.5L15 11v3a1 1 0 01-1 1A13 13 0 012 3a1 1 0 011-1z"/></svg>',
    'layers':       '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="8,2 15,5.5 8,9 1,5.5"/><polyline points="1,10 8,13.5 15,10"/></svg>',
    'table':        '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="2" y1="10" x2="14" y2="10"/><line x1="6" y1="6" x2="6" y2="14"/></svg>',
    'sparkle':      '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2 L9.2 6.8 L14 8 L9.2 9.2 L8 14 L6.8 9.2 L2 8 L6.8 6.8 Z"/></svg>',
    'settings':     '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M12.5 3.5l-1 1M4.5 11.5l-1 1"/></svg>',
    'lightning':    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="10,1 4,9 8,9 6,15 12,7 8,7"/></svg>',
    'file-text':    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 2h5.5L13 5.5V14H4V2z"/><path d="M9 2v4h4"/><line x1="5" y1="9" x2="11" y2="9"/><line x1="5" y1="12" x2="9" y2="12"/></svg>',
    'file-doc':     '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 2h5.5L13 5.5V14H4V2z"/><path d="M9 2v4h4"/><line x1="5" y1="9" x2="11" y2="9"/><line x1="5" y1="12" x2="11" y2="12"/></svg>',
    /* 报告中心：多页报告叠层，与「单页文件」区分 */
    'report':       '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3.5h7.5a1 1 0 011 1V14H4a1 1 0 01-1-1V3.5z"/><path d="M5.5 2h7.5a1 1 0 011 1v9.5"/><line x1="5.5" y1="7" x2="9.5" y2="7"/><line x1="5.5" y1="10" x2="8.5" y2="10"/></svg>',
    'dollar':       '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="8" y1="1" x2="8" y2="15"/><path d="M11 3.5H6.5A2.5 2.5 0 004 6a2.5 2.5 0 002.5 2.5h3A2.5 2.5 0 0112 11a2.5 2.5 0 01-2.5 2.5H4"/></svg>',
  };

  /* 一线侧栏：轻分组；Demo 默认展示全部菜单（含管理） */
  var PE_NAV = [
    { section: '', items: [
      { route: 'home',       label: '工作台',   icon: 'plus-square' },
      { route: 'discover',   label: '发现调研', icon: 'radar' },
    ]},
    { section: '资产', items: [
      { route: 'projects',   label: '项目库',   icon: 'folder' },
      { route: 'fund',       label: '基金管理', icon: 'dollar' },
    ]},
    { section: '产出', items: [
      { route: 'file-parse', label: '文件解析', icon: 'file-text' },
      { route: 'report',     label: '报告中心', icon: 'report' },
    ]},
    { section: '管理', items: [
      { route: 'config-center', label: '配置中心', icon: 'settings' },
      { route: 'admin',         label: '系统管理', icon: 'users' },
    ]},
  ];

  var BANK_NAV = [
    { section: '', items: [
      { route: 'home', label: '工作台' },
    ]},
    { section: '尽调', items: [
      { route: 'tasks',       label: '任务中心' },
      { route: 'enterprises', label: '企业档案' },
    ]},
    { section: '监控', items: [
      { route: 'monitor', label: '企业动态' },
    ]},
    { section: '资产', items: [
      { route: 'artifacts',     label: '我的报告' },
      { route: 'capabilities',  label: '能力中心' },
    ]},
    { section: '管理', items: [
      { route: 'admin', label: '管理后台' },
    ]},
  ];

  function bankNav() {
    return BANK_NAV;
  }

  function peNav() {
    return PE_NAV;
  }

  function footSubtitle() {
    if (window.PE_DATA && window.PE_DATA.settings && window.PE_DATA.settings.title) {
      return window.PE_DATA.settings.title;
    }
    return '投资经理';
  }

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function toast(msg) {
    var el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove('show');
    }, 2200);
  }

  function setState(patch) {
    Object.keys(patch || {}).forEach(function (k) {
      state[k] = patch[k];
    });
    if (patch && (patch.mode || patch.role || patch.peRole || patch.displayName)) {
      renderSidebar();
    }
    if (patch && (patch.displayName || patch.role || patch.peRole || patch.mode)) {
      updateUserFoot();
    }
  }

  function navigate(route) {
    if (!state.loggedIn) {
      showLogin();
      return;
    }
    route = route || 'home';
    state.route = route;
    state.shellMoreOpen = false;
    renderSidebar();
    renderPage();
    try {
      history.replaceState(null, '', '#' + encodeURIComponent(state.mode + ':' + state.route));
    } catch (e) {}
  }

  function activeNavKey(route) {
    if (!route) return 'home';
    if (route === 'home') return 'home';
    if (state.mode === 'bank') {
      if (
        route === 'customers' ||
        route === 'enterprises' ||
        route.indexOf('customer/') === 0 ||
        route.indexOf('enterprise/') === 0
      ) {
        return 'enterprises';
      }
      if (route.indexOf('project/') === 0 || route === 'pack/ocr') {
        return 'enterprises';
      }
      if (
        route === 'admin' ||
        route === 'pack' ||
        route.indexOf('pack/') === 0 ||
        route.indexOf('config/') === 0 ||
        route.indexOf('sys/') === 0 ||
        route === 'finance-config' ||
        route === 'cases' ||
        route === 'stock'
      ) {
        return 'admin';
      }
      if (route.indexOf('task/') === 0) {
        return 'tasks';
      }
      if (route === 'capabilities' || route === 'tasks' || route === 'artifacts') {
        return route;
      }
      if (route === 'monitor') return 'monitor';
      if (route === 'enterprise-monitor') return 'enterprise-monitor';
      if (route === 'settings') return 'settings';
      return route.split('/')[0];
    }
    if (route.indexOf('customer/') === 0) {
      return 'customers';
    }
    if (route.indexOf('project/') === 0) {
      return 'projects';
    }
    /* 发现调研：线索 / 专家会议 / 一线调研及旧入口 */
    if (
      route === 'discover' ||
      route === 'intelligence' ||
      route === 'experts' ||
      route === 'journalist' ||
      route === 'radar' ||
      route === 'find' ||
      route === 'chain' ||
      route === 'graph'
    ) return 'discover';
    /* 项目动态、盘面从项目库进入 */
    if (route === 'monitor' || route === 'snapshot') return 'projects';
    /* 文件解析：pack/ocr 归到 file-parse；parse=知识库保持独立 */
    if (route === 'file-parse' || route === 'pack/ocr') return 'file-parse';
    if (route === 'parse') return 'parse';
    /* 基金管理 */
    if (route === 'fund' || route === 'fund-snapshot' || route.indexOf('fund/') === 0) return 'fund';
    /* 报告中心 */
    if (route === 'report') return 'report';
    /* 能力市场从工作台 pill 进入，侧栏高亮工作台 */
    if (route === 'skills' || route === 'redblue' || route === 'redblue-setup') return 'home';
    /* 投后：post-browser 等并入项目库高亮 */
    if (route === 'post-browser') return 'projects';
    if (route.indexOf('post') === 0) return 'projects';
    /* 配置中心 / 系统管理（admin） */
    if (route === 'admin' || route.indexOf('sys/') === 0) return 'admin';
    if (
      route === 'templates' ||
      route === 'config-center' ||
      route === 'finance-config' ||
      route === 'field-config'
    ) return 'config-center';
    /* 资料库/全部对话/场景 */
    if (route.indexOf('chat/') === 0) return 'home';
    if (route.indexOf('project/') === 0 && route.indexOf('/chat/') > 0) return 'projects';
    if (route === 'chats') return 'chats';
    if (route === 'knowledge') return 'projects';
    if (route === 'scenarios') return 'scenarios';
    if (route.indexOf('case/') === 0) return 'cases';
    if (route.indexOf('pack/') === 0) return route;
    if (route.indexOf('config/') === 0) return 'config-center';
    return route.split('/')[0];
  }

  function renderSidebar() {
    var nav = state.mode === 'bank' ? bankNav() : peNav();
    var active = activeNavKey(state.route);
    function navBtn(it, isActive) {
      var isDisabled = !!it.disabled;
      var iconHtml = (it.icon && NAV_ICONS[it.icon])
        ? '<span style="display:inline-flex;align-items:center;width:14px;height:14px;flex-shrink:0;margin-right:8px;opacity:0.7">' + NAV_ICONS[it.icon] + '</span>'
        : '';
      var extraStyle = isDisabled ? ';opacity:0.5' : '';
      return '<button type="button" class="nav-item' + (isActive ? ' active' : '') + '" data-shell-nav="' + it.route + '" data-nav-label="' + it.label + '"' + (isDisabled ? ' data-disabled="1" aria-disabled="true" title="暂未开放"' : '') + ' style="display:flex;align-items:center' + extraStyle + '">' + iconHtml + it.label + '</button>';
    }
    var html = '';
    if (state.mode === 'pe') {
      /* PE：组标题常显，不进「更多」浮层 */
      html += '<nav class="sidebar-nav sidebar-nav-main">';
      nav.forEach(function (group, gi) {
        if (!group.items || !group.items.length) return;
        if (group.section) {
          html += '<div class="sidebar-section' + (gi === 0 ? '' : ' sidebar-section-spaced') + '">' + esc(group.section) + '</div>';
        } else if (gi > 0) {
          html += '<div class="sidebar-nav-divider" aria-hidden="true"></div>';
        }
        group.items.forEach(function (it) {
          html += navBtn(it, active === it.route || active === activeNavKey(it.route));
        });
      });
      html += '</nav>';
    } else {
      /* 银行模式：首组常显，其余进「更多」浮层 */
      var mainGroup = nav[0];
      html += '<nav class="sidebar-nav sidebar-nav-main">';
      mainGroup.items.forEach(function (it) { html += navBtn(it, active === it.route); });
      html += '</nav>';
      var subGroups = nav.slice(1);
      var subHtml = '';
      subGroups.forEach(function (group) {
        if (!group.items || !group.items.length) return;
        subHtml += '<div class="sidebar-sub-section">' + esc(group.section) + '</div><nav class="sidebar-nav sidebar-nav-sub">';
        group.items.forEach(function (it) { subHtml += navBtn(it, active === it.route || active === activeNavKey(it.route)); });
        subHtml += '</nav>';
      });
      if (subHtml) {
        html += '<div class="sidebar-more-wrap' + (state.shellMoreOpen ? ' open' : '') + '" id="sidebarMoreWrap">'
          +   '<button type="button" class="nav-item sidebar-more-trigger" id="sidebarMoreToggle" aria-expanded="' + (state.shellMoreOpen ? 'true' : 'false') + '" aria-controls="sidebarMorePop" style="display:flex;align-items:center;justify-content:space-between;opacity:0.7">'
          +     '<span style="display:inline-flex;align-items:center;gap:8px">' + NAV_ICONS.grid + '<span>更多</span></span><span class="sidebar-more-caret" aria-hidden="true">›</span>'
          +   '</button>'
          +   '<div class="sidebar-more-pop" id="sidebarMorePop"' + (state.shellMoreOpen ? '' : ' hidden') + '>' + subHtml + '</div>'
          + '</div>';
      }
    }
    /* 项目与会话树（常驻显示在主导航下方，对齐 WorkBuddy） */
    if (state.mode === 'pe') {
      html += '<div class="sidebar-tasks" id="sidebarTasks">' + _renderSidebarTasks(state.route) + '</div>';
    }

    var scroll = $('sidebarNav');
    if (scroll) scroll.innerHTML = html;
    scroll.querySelectorAll('[data-shell-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('data-disabled') === '1') {
          toast('该能力暂未开放');
          return;
        }
        navigate(btn.getAttribute('data-shell-nav'));
      });
    });
    /* “更多能力”采用可预期的点击展开；键盘和触屏与鼠标行为一致。 */
    var wrap = $('sidebarMoreWrap');
    if (wrap) {
      var moreToggle = $('sidebarMoreToggle');
      if (moreToggle) {
        moreToggle.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          state.shellMoreOpen = !state.shellMoreOpen;
          renderSidebar();
          var nextToggle = $('sidebarMoreToggle');
          if (nextToggle) {
            nextToggle.focus();
            if (state.shellMoreOpen) {
              var pop = $('sidebarMorePop');
              var rect = nextToggle.getBoundingClientRect();
              if (pop) pop.style.setProperty('--sidebar-more-top', Math.max(12, Math.min(rect.top, window.innerHeight - 520)) + 'px');
            }
          }
        });
      }
    }
    /* 空间与任务：箭头只控制展开，空间名负责选择上下文。 */
    var tasksEl = $('sidebarTasks');
    if (tasksEl) {
      tasksEl.querySelectorAll('[data-space-toggle]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          var sid = el.getAttribute('data-space-toggle');
          if (sid && typeof window.PE_POST_TOGGLE_SPACE === 'function') {
            window.PE_POST_TOGGLE_SPACE(sid);
          }
          renderSidebar();
        });
      });
      tasksEl.querySelectorAll('[data-space-select]').forEach(function (el) {
        el.addEventListener('click', function () {
          var sid = el.getAttribute('data-space-select');
          if (sid && typeof window.PE_POST_SELECT_SPACE === 'function') window.PE_POST_SELECT_SPACE(sid);
          navigate('home');
        });
      });
      /* 会话行（排除项目头里的 data-nav） */
      tasksEl.querySelectorAll('.po-sb-chat[data-nav]').forEach(function (el) {
        el.addEventListener('click', function () {
          var nav = el.getAttribute('data-nav');
          if (nav) navigate(nav);
        });
      });
    }
    updateUserFoot();
  }

  /* —— Sidebar：空间与任务。项目类型只属于空间配置，不进入导航层级。 —— */
  function _renderSidebarTasks(curRoute) {
    var d = window.PE_POST_DATA || {};
    if (typeof d === 'function') d = d() || {};
    var chats = (typeof window.PE_POST_CHATS === 'function' ? window.PE_POST_CHATS() : (d.CHATS || []));
    var spaces = (d.SPACES || []).concat(d.CUSTOM_SPACES || []);
    var spaceOpen = window.PE_POST_SPACE_OPEN || {};
    var selectedSpace = typeof window.PE_POST_SELECTED_SPACE === 'function' ? window.PE_POST_SELECTED_SPACE() : null;

    function chatRow(c) {
      var chatRoute = c.type === 'project' ? 'project/' + c.projectId + '/chat/' + c.id : 'chat/' + c.id;
      return '<div class="po-sb-chat' + (curRoute === chatRoute ? ' active' : '') + '" data-nav="' + chatRoute + '">'
        + '<span class="po-sb-status"></span><span class="po-sb-chat-name">' + esc(c.title) + '</span>'
        + '<span class="po-sb-chat-time">' + esc(c.time || '') + '</span></div>';
    }

    var assigned = {};
    var spaceRows = spaces.map(function (space) {
      var ids = space.projectIds || [];
      var tasks = chats.filter(function (c) {
        var hit = c.spaceId === space.id || (!!c.projectId && ids.indexOf(c.projectId) >= 0);
        if (hit) assigned[c.id] = true;
        return hit;
      });
      var open = spaceOpen[space.id] === true || selectedSpace === space.id;
      var taskHtml = open && tasks.length ? '<div class="po-sb-chats">' + tasks.map(chatRow).join('') + '</div>' : '';
      return '<div class="po-sb-space"><div class="po-sb-space-h' + (selectedSpace === space.id ? ' active' : '') + '">'
        + '<button type="button" class="po-sb-caret" data-space-toggle="' + esc(space.id) + '" aria-label="' + (open ? '收起' : '展开') + esc(space.label) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' + (open ? '▾' : '▸') + '</button>'
        + '<button type="button" class="po-sb-space-name" data-space-select="' + esc(space.id) + '">' + esc(space.label) + '</button>'
        + '</div>' + taskHtml + '</div>';
    }).join('');
    var independent = chats.filter(function (c) { return !assigned[c.id]; });
    var independentHtml = independent.length
      ? '<div class="po-sb-group po-sb-independent"><div class="po-sb-group-h">独立任务</div>' + independent.map(chatRow).join('') + '</div>'
      : '';
    return '<div class="po-sb-group"><div class="po-sb-group-h">空间</div>' + spaceRows + '</div>'
      + independentHtml;
  }

  function orgName() {
    if (window.PE_DATA && window.PE_DATA.settings && window.PE_DATA.settings.org) return window.PE_DATA.settings.org;
    return state.org || '启明星基金';
  }

  function currentDensity() {
    try { return localStorage.getItem(DENSITY_KEY) || 'default'; } catch (e) { return 'default'; }
  }

  function currentTheme() {
    try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { return 'light'; }
  }

  function applyDisplayPrefs() {
    var prevTheme = document.documentElement.getAttribute('data-theme');
    var density = currentDensity();
    var theme = currentTheme();
    if (density !== 'comfortable' && density !== 'compact' && density !== 'default') density = 'default';
    if (theme !== 'dark' && theme !== 'light') theme = 'light';
    document.documentElement.setAttribute('data-density', density);
    document.documentElement.setAttribute('data-theme', theme);
    if (state.loggedIn && prevTheme && prevTheme !== theme) renderPage();
    var densBtns = document.querySelectorAll('[data-density-set]');
    for (var i = 0; i < densBtns.length; i++) {
      densBtns[i].classList.toggle('is-on', densBtns[i].getAttribute('data-density-set') === density);
    }
    var themeBtns = document.querySelectorAll('[data-theme-set]');
    for (var j = 0; j < themeBtns.length; j++) {
      themeBtns[j].classList.toggle('is-on', themeBtns[j].getAttribute('data-theme-set') === theme);
    }
  }

  function setDensity(next) {
    try { localStorage.setItem(DENSITY_KEY, next); } catch (e) {}
    applyDisplayPrefs();
  }

  function setTheme(next) {
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyDisplayPrefs();
  }

  function updateUserFoot() {
    var name = state.displayName || '王敏';
    var n = $('userName');
    var a = $('userAvatar');
    var r = $('userRole');
    if (n) n.textContent = name;
    if (a) a.textContent = name.slice(0, 1);
    if (r) r.textContent = footSubtitle();
    var mn = $('userMenuName');
    var mm = $('userMenuMeta');
    if (mn) mn.textContent = name;
    if (mm) mm.textContent = orgName() + ' · ' + footSubtitle();
    var wrap = $('sidebarFootWrap');
    var pop = $('userMenuPop');
    if (wrap) wrap.classList.toggle('is-open', !!state.userMenuOpen);
    if (pop) pop.hidden = !state.userMenuOpen;
    applyDisplayPrefs();
  }

  function setLoggedIn(on, user) {
    state.loggedIn = !!on;
    state.userMenuOpen = false;
    try {
      if (on) sessionStorage.setItem(AUTH_KEY, state.phone || '1');
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
    if (on && user) {
      state.displayName = user.name || state.displayName;
      state.phone = user.phone || state.phone;
      if (user.role) state.role = user.role;
      if (user.org) state.org = user.org;
      if (window.PE_DATA && window.PE_DATA.settings) {
        window.PE_DATA.settings.displayName = state.displayName;
        if (user.org) window.PE_DATA.settings.org = user.org;
      }
      try { sessionStorage.setItem(AUTH_ORG_KEY, state.org || ''); } catch (e2) {}
    } else if (!on) {
      try { sessionStorage.removeItem(AUTH_ORG_KEY); } catch (e3) {}
    }
    applyAuthShell();
    updateUserFoot();
  }

  function applyAuthShell() {
    document.body.classList.toggle('is-logged-out', !state.loggedIn);
  }

  function prefillsDemoLogin() {
    var demoPhone = (DEMO_USERS[0] && DEMO_USERS[0].phone) || '13800138000';
    var demoCode = '123456';
    var phoneEl = $('loginPhone');
    var codeEl = $('loginCode');
    if (phoneEl) phoneEl.value = demoPhone;
    if (codeEl) codeEl.value = demoCode;
    /* Demo：预置验证码已发，可直接点登录，不必先点获取 */
    state.loginCodeSentTo = demoPhone;
    state.loginCodeValue = demoCode;
  }

  function showLogin() {
    setLoggedIn(false);
    hideOrgPick();
    try { history.replaceState(null, '', '#login'); } catch (e2) {}
    var phoneErr = $('loginPhoneErr');
    var codeErr = $('loginCodeErr');
    if (phoneErr) phoneErr.textContent = '';
    if (codeErr) codeErr.textContent = '';
    prefillsDemoLogin();
  }

  function findDemoUser(phone) {
    var i;
    for (i = 0; i < DEMO_USERS.length; i++) if (DEMO_USERS[i].phone === phone) return DEMO_USERS[i];
    return null;
  }

  function userMemberships(user) {
    if (!user) return [];
    if (user.memberships && user.memberships.length) return user.memberships.slice();
    return [{ org: user.org || '启明星基金', role: user.role || 'manager' }];
  }

  function hideOrgPick() {
    var wrap = $('loginOrgPick');
    var fields = $('loginFields');
    if (wrap) wrap.hidden = true;
    if (fields) fields.hidden = false;
  }

  function showOrgPick(user) {
    var wrap = $('loginOrgPick');
    var fields = $('loginFields');
    var list = $('loginOrgList');
    var mems = userMemberships(user);
    if (list) {
      list.innerHTML = mems.map(function (m, i) {
        return '<button type="button" class="btn btn-ghost login-org-item" data-org-idx="' + i + '">' + esc(m.org) + '</button>';
      }).join('');
      list.onclick = function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-org-idx]') : null;
        if (!btn) return;
        var idx = Number(btn.getAttribute('data-org-idx'));
        enterAs(user, mems[idx]);
      };
    }
    if (fields) fields.hidden = true;
    if (wrap) wrap.hidden = false;
  }

  function enterAs(user, membership) {
    membership = membership || { org: '启明星基金', role: 'manager' };
    setLoggedIn(true, {
      phone: user.phone,
      name: user.name,
      role: membership.role,
      org: membership.org,
    });
    hideOrgPick();
    toast('登录成功');
    navigate('home');
  }

  function validPhone(raw) {
    return /^1\d{10}$/.test(String(raw || '').replace(/\s+/g, ''));
  }

  function bindLoginPage() {
    var hint = $('loginRegHint');
    var protos = $('loginProtocols');
    if (hint) {
      hint.hidden = !DEMO_LOGIN_CFG.registrationOpen;
      hint.textContent = DEMO_LOGIN_CFG.hint || '';
    }
    if (protos) {
      protos.innerHTML = DEMO_LOGIN_CFG.protocols.map(function (p) {
        return '<a href="' + esc(p.url) + '">' + esc(p.name) + '</a>';
      }).join('');
    }
    var sendBtn = $('loginSendCode');
    var submitBtn = $('loginSubmit');
    if (sendBtn) sendBtn.addEventListener('click', onSendLoginCode);
    if (submitBtn) submitBtn.addEventListener('click', onLoginSubmit);
    var phoneInp = $('loginPhone');
    var codeInp = $('loginCode');
    if (phoneInp) phoneInp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') onSendLoginCode();
    });
    if (codeInp) codeInp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') onLoginSubmit();
    });
    prefillsDemoLogin();
  }

  function tickLoginCooldown() {
    var btn = $('loginSendCode');
    if (!btn) return;
    if (state.loginCooldown <= 0) {
      btn.disabled = false;
      btn.textContent = '获取验证码';
      return;
    }
    btn.disabled = true;
    btn.textContent = state.loginCooldown + ' 秒后重试';
    setTimeout(function () {
      state.loginCooldown -= 1;
      tickLoginCooldown();
    }, 1000);
  }

  function onSendLoginCode() {
    var phoneEl = $('loginPhone');
    var err = $('loginPhoneErr');
    var codeErr = $('loginCodeErr');
    if (codeErr) codeErr.textContent = '';
    var phone = phoneEl ? String(phoneEl.value || '').replace(/\s+/g, '') : '';
    if (err) err.textContent = '';
    if (!phone) { if (err) err.textContent = '请填写手机号'; return; }
    if (!validPhone(phone)) { if (err) err.textContent = '请填写 11 位手机号'; return; }
    if (!DEMO_LOGIN_CFG.registrationOpen && !findDemoUser(phone)) {
      if (err) err.textContent = '该手机号未开通，请联系本公司系统管理员';
      return;
    }
    state.loginCodeSentTo = phone;
    state.loginCodeValue = '123456';
    state.loginCooldown = 60;
    toast('验证码已发送（演示码 123456）');
    tickLoginCooldown();
  }

  function onLoginSubmit() {
    var phoneEl = $('loginPhone');
    var codeEl = $('loginCode');
    var phoneErr = $('loginPhoneErr');
    var codeErr = $('loginCodeErr');
    if (phoneErr) phoneErr.textContent = '';
    if (codeErr) codeErr.textContent = '';
    var phone = phoneEl ? String(phoneEl.value || '').replace(/\s+/g, '') : '';
    var code = codeEl ? String(codeEl.value || '').trim() : '';
    if (!phone) { if (phoneErr) phoneErr.textContent = '请填写手机号'; return; }
    if (!validPhone(phone)) { if (phoneErr) phoneErr.textContent = '请填写 11 位手机号'; return; }
    if (!DEMO_LOGIN_CFG.registrationOpen && !findDemoUser(phone)) {
      if (phoneErr) phoneErr.textContent = '该手机号未开通，请联系本公司系统管理员';
      return;
    }
    if (!code) { if (codeErr) codeErr.textContent = '请填写验证码'; return; }
    if (state.loginCodeSentTo !== phone) { if (codeErr) codeErr.textContent = '请先获取验证码'; return; }
    if (code !== state.loginCodeValue) { if (codeErr) codeErr.textContent = '验证码不正确'; return; }
    var user = findDemoUser(phone) || {
      phone: phone,
      name: state.displayName || '新用户',
      memberships: [{ org: '启明星基金', role: 'manager' }],
    };
    var mems = userMemberships(user);
    if (mems.length >= 2) {
      showOrgPick(user);
      return;
    }
    enterAs(user, mems[0]);
  }

  function logout() {
    state.loginCodeSentTo = '';
    state.loginCodeValue = '';
    state.loginCooldown = 0;
    setLoggedIn(false);
    showLogin();
    toast('已退出登录');
  }

  function makeCtx() {
    return {
      rootEl: $('viewRoot'),
      navigate: navigate,
      state: state,
      setState: setState,
      toast: toast,
      mode: state.mode,
    };
  }

  function pePostData() {
    var d = window.PE_POST_DATA || {};
    return typeof d === 'function' ? (d() || {}) : d;
  }

  function findById(list, id) {
    list = list || [];
    for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) return list[i];
    return null;
  }

  function breadcrumbItems(route) {
    route = route || '';
    /* Chat 自己已有会话标题栏，不再叠加全局面包屑。 */
    if (/^chat\//.test(route) || /^project\/[^/]+\/chat\//.test(route)) return [];
    if (state.mode === 'bank') {
      var bankParts = route.split('/');
      if (bankParts.length < 2) return [];
      return [
        { label: bankParts[0] === 'task' ? '任务中心' : '企业档案', route: bankParts[0] === 'task' ? 'tasks' : 'enterprises' },
        { label: '当前详情' }
      ];
    }
    var d = pePostData();
    var m;
    if (/^confirm\//.test(route)) {
      /* 确认页已有「← 返回」与顶部文件条，不再叠面包屑占纵向空间 */
      return [];
    }
    if ((m = /^fund\/([^/]+)$/.exec(route))) {
      var fund = findById(d.FUNDS || d.funds, m[1]);
      return [{ label: '基金管理', route: 'fund' }, { label: fund ? fund.name : '基金详情' }];
    }
    if ((m = /^project\/([^/]+)\/chat\/([^/]+)$/.exec(route))) {
      var p1 = findById(d.PROJECTS, m[1]);
      return [{ label: '项目库', route: 'projects' }, { label: p1 ? p1.name : '项目', route: 'project/' + m[1] }, { label: '对话' }];
    }
    if ((m = /^project\/([^/]+)(?:\/(.+))?$/.exec(route))) {
      var p2 = findById(d.PROJECTS, m[1]);
      var items = [{ label: '项目库', route: 'projects' }, { label: p2 ? p2.name : '项目' }];
      if (m[2]) items.push({ label: ({ finance:'期间数据', report:'报告', brief:'项目简报', gaps:'信息缺口', ubo:'股权穿透', ic:'投委会', deliver:'交付' })[m[2]] || '详情' });
      return items;
    }
    if ((m = /^post\/([^/]+)$/.exec(route))) {
      var p3 = findById(d.PROJECTS, m[1]);
      return [{ label: '项目库', route: 'projects' }, { label: p3 ? p3.name : '投后详情' }];
    }
    if ((m = /^chat\/([^/]+)$/.exec(route))) {
      return [{ label: '新建任务', route: 'home' }, { label: '对话' }];
    }
    /* 配置中心子页面 */
    if (route === 'finance-config') return [{ label: '配置中心', route: 'config-center' }, { label: '财务准则配置' }];
    if (route === 'field-config') return [{ label: '配置中心', route: 'config-center' }, { label: '母基金映射' }];
    if (route === 'admin') return [{ label: '平台', route: 'home' }, { label: '系统管理' }];
    return [];
  }

  function injectBreadcrumb() {
    var root = $('viewRoot');
    if (!root) return;
    var old = root.querySelector('.app-breadcrumb-bar');
    if (old) old.remove();
    var items = breadcrumbItems(state.route);
    if (items.length < 2) return;
    var bar = document.createElement('nav');
    bar.className = 'app-breadcrumb-bar';
    bar.setAttribute('aria-label', '面包屑导航');
    bar.innerHTML = items.map(function (item, idx) {
      var current = idx === items.length - 1;
      var node = current || !item.route
        ? '<span class="app-breadcrumb-current" aria-current="page">' + esc(item.label) + '</span>'
        : '<button type="button" class="app-breadcrumb-link" data-breadcrumb-route="' + esc(item.route) + '">' + esc(item.label) + '</button>';
      return (idx ? '<span class="app-breadcrumb-sep" aria-hidden="true">›</span>' : '') + node;
    }).join('');
    var toolbar = root.querySelector('.po-toolbar, .page-toolbar, .po-chat-topbar, .bk-toolbar');
    if (toolbar && toolbar.parentNode) toolbar.parentNode.insertBefore(bar, toolbar.nextSibling);
    else root.insertBefore(bar, root.firstChild);
    bar.querySelectorAll('[data-breadcrumb-route]').forEach(function (btn) {
      btn.addEventListener('click', function () { navigate(btn.getAttribute('data-breadcrumb-route')); });
    });
  }

  function renderPage() {
    var ctx = makeCtx();
    var root = ctx.rootEl;
    if (!root) return;

    if (window.BankProjectPages) {
      if (typeof window.BankProjectPages.closeBankModals === 'function') {
        window.BankProjectPages.closeBankModals();
      }
      if (state.mode !== 'bank' && typeof window.BankProjectPages.resetRootLayout === 'function') {
        window.BankProjectPages.resetRootLayout(ctx);
      }
    }
    if (
      window.BankReportTaskPages &&
      typeof window.BankReportTaskPages.closeLaunchModal === 'function'
    ) {
      window.BankReportTaskPages.closeLaunchModal();
    }

    if (state.mode === 'bank') {
      if (!window.BankPages || typeof window.BankPages.render !== 'function') {
        root.innerHTML = '<div class="page-body">银行模块未加载</div>';
        return;
      }
      window.BankPages.render(state.route, ctx);
      injectBreadcrumb();
      return;
    }

    if (!window.PEPages || typeof window.PEPages.render !== 'function') {
      root.innerHTML = '<div class="page-body">PE 模块未加载</div>';
      return;
    }
    window.PEPages.render(state.route, ctx);
    injectBreadcrumb();
  }

  function parseHash() {
    var h = (location.hash || '').replace(/^#/, '');
    if (!h) return;
    try {
      h = decodeURIComponent(h);
    } catch (e) {}
    var parts = h.split(':');
    if (parts.length >= 2) {
      if (parts[0] === 'bank' || parts[0] === 'pe') state.mode = parts[0];
      state.route = parts.slice(1).join(':') || 'home';
    } else if (h) {
      state.route = h;
    }
  }

  function boot() {
    if (window.PE_DATA && window.PE_DATA.settings) {
      state.displayName = window.PE_DATA.settings.displayName || state.displayName;
      if (window.PE_DATA.settings.org) state.org = window.PE_DATA.settings.org;
      if (window.PE_DATA.settings.mode === 'bank') state.mode = 'bank';
    }
    try {
      var savedPhone = sessionStorage.getItem(AUTH_KEY);
      var savedOrg = sessionStorage.getItem(AUTH_ORG_KEY) || '';
      if (savedPhone && savedPhone !== '1') {
        var savedUser = findDemoUser(savedPhone);
        state.loggedIn = true;
        if (savedUser) {
          var mems = userMemberships(savedUser);
          var mem = null;
          var mi;
          for (mi = 0; mi < mems.length; mi++) {
            if (mems[mi].org === savedOrg) { mem = mems[mi]; break; }
          }
          if (!mem) mem = mems[0] || { org: '启明星基金', role: savedUser.role || 'manager' };
          state.displayName = savedUser.name;
          state.phone = savedUser.phone;
          state.role = mem.role;
          state.org = mem.org;
          if (window.PE_DATA && window.PE_DATA.settings) {
            window.PE_DATA.settings.displayName = state.displayName;
            window.PE_DATA.settings.org = state.org;
          }
        } else {
          state.phone = savedPhone;
        }
      }
    } catch (e) { state.loggedIn = false; }
    parseHash();
    if ((location.hash || '').replace(/^#/, '') === 'login') {
      try { sessionStorage.removeItem(AUTH_KEY); } catch (e3) {}
      state.loggedIn = false;
    }
    applyAuthShell();
    applyDisplayPrefs();
    bindLoginPage();
    renderSidebar();
    if (state.loggedIn) renderPage();
    if (window.DemoOcrChrome) window.DemoOcrChrome.bind();

    var brand = $('sidebarBrand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('.xb-shell-side-toggle-wrap, [data-ocr-chrome]')) {
          return;
        }
        navigate('home');
      });
    }
    var foot = $('sidebarFoot');
    if (foot) {
      foot.addEventListener('click', function (e) {
        e.stopPropagation();
        state.userMenuOpen = !state.userMenuOpen;
        updateUserFoot();
      });
      foot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          foot.click();
        }
      });
    }
    var profileBtn = $('userMenuProfile');
    var logoutBtn = $('userMenuLogout');
    if (profileBtn) profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      state.userMenuOpen = false;
      updateUserFoot();
      navigate('settings');
    });
    if (logoutBtn) logoutBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      logout();
    });
    var displayPop = $('userMenuPop');
    if (displayPop) {
      displayPop.addEventListener('click', function (e) {
        var dens = e.target && e.target.closest ? e.target.closest('[data-density-set]') : null;
        var th = e.target && e.target.closest ? e.target.closest('[data-theme-set]') : null;
        if (dens) {
          e.stopPropagation();
          setDensity(dens.getAttribute('data-density-set'));
          return;
        }
        if (th) {
          e.stopPropagation();
          setTheme(th.getAttribute('data-theme-set'));
        }
      });
    }
    window.addEventListener('hashchange', function () {
      parseHash();
      if ((location.hash || '').replace(/^#/, '') === 'login') {
        showLogin();
        return;
      }
      if (!state.loggedIn) {
        showLogin();
        return;
      }
      renderSidebar();
      renderPage();
    });
    document.addEventListener('click', function (e) {
      var footWrap = $('sidebarFootWrap');
      if (state.userMenuOpen && footWrap && !footWrap.contains(e.target)) {
        state.userMenuOpen = false;
        updateUserFoot();
      }
      if (!state.shellMoreOpen) return;
      var wrap = $('sidebarMoreWrap');
      if (wrap && wrap.contains(e.target)) return;
      state.shellMoreOpen = false;
      renderSidebar();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.keyCode !== 27) return;
      if (state.userMenuOpen) {
        state.userMenuOpen = false;
        updateUserFoot();
        return;
      }
      if (state.shellMoreOpen) {
        state.shellMoreOpen = false;
        renderSidebar();
        var more = $('sidebarMoreToggle');
        if (more) more.focus();
        return;
      }
      var close = document.querySelector('[data-act="closeRightPane"], [data-act="closeRight"], [data-act="toggleWorkspace"][aria-label="关闭产出物面板"]');
      if (close && close.offsetParent !== null) {
        e.preventDefault();
        close.click();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
