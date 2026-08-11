/**
 * 项目库 / 基金管理 · 台账包导出（连萝卜带根）
 * 对齐投后数据整理 template 结构，列名用产品规范（本机构／子基金对本金）
 */
(function () {
  'use strict';

  function store() { return window.PE_POST_STORE || null; }
  function toast(msg) {
    if (typeof window.toast === 'function') window.toast(msg);
    else if (window.PE_POST_PAGES && window.PE_POST_PAGES.toast) window.PE_POST_PAGES.toast(msg);
  }

  function dateStamp() {
    var d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }

  var MONEY_UNIT_DEFS = [
    { key: 'yuan', label: '元', toWan: 1 / 10000 },
    { key: 'wan', label: '万元', toWan: 1 },
    { key: 'baiwan', label: '百万元', toWan: 100 },
    { key: 'yi', label: '亿元', toWan: 10000 }
  ];

  function getExportMoneyUnit() {
    /* 台账包固定万元导出；与档案可切换展示单位无关 */
    return 'wan';
  }

  function moneyUnitLabel(key) {
    var d = MONEY_UNIT_DEFS.filter(function (u) { return u.key === key; })[0];
    return d ? d.label : '万元';
  }

  /** 内部存「万元」数值 → 导出按万元 */
  function wanToExport(wan) {
    if (wan == null || wan === '' || isNaN(Number(wan))) return '';
    var unit = getExportMoneyUnit();
    var d = MONEY_UNIT_DEFS.filter(function (u) { return u.key === unit; })[0] || MONEY_UNIT_DEFS[1];
    var v = Number(wan) / d.toWan;
    if (unit === 'yuan') return Math.round(v);
    var s = v.toFixed(6).replace(/\.?0+$/, '');
    return s === '-0' ? 0 : Number(s);
  }

  function downloadWorkbook(filename, sheets) {
    if (!(window.XLSX && window.XLSX.utils && window.XLSX.writeFile)) {
      toast('Excel 组件未加载，无法导出');
      return false;
    }
    var wb = window.XLSX.utils.book_new();
    (sheets || []).forEach(function (s) {
      var name = String(s.name || 'Sheet').slice(0, 31);
      var aoa = s.aoa && s.aoa.length ? s.aoa : [['（无数据）']];
      window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(aoa), name);
    });
    window.XLSX.writeFile(wb, filename);
    return true;
  }

  function n(v) { return v == null || v === '' ? '' : v; }
  function num(v) { var x = Number(v); return isNaN(x) ? '' : x; }
  function money(v) { return wanToExport(v); }

  function strategyKey(f) {
    if (f.strategy) return f.strategy;
    var t = f.type || '';
    if (t === '母基金' || t === 'fof') return 'fof';
    if (t === '直投' || t === 'direct') return 'direct';
    if (t === '混合' || t === 'mixed') return 'mixed';
    return 'other';
  }

  function strategyLabel(f) {
    return ({ direct: '直投', fof: '母基金', mixed: '混合', other: '其他' })[strategyKey(f)] || (f.type || '—');
  }

  function relForFund(f, parentId) {
    var rels = (f && f.fundRelations) || [];
    if (parentId) {
      var hit = rels.find(function (r) { return r.fundId === parentId; });
      if (hit) return hit;
    }
    return rels[0] || {};
  }

  function filterFundsList(fundFilter) {
    var s = store();
    var all = s ? s.funds() : [];
    var ff = fundFilter || {};
    var searched = s && s.filterFunds ? s.filterFunds(ff.search || '') : all;
    return searched.filter(function (f) {
      return (ff.management === 'all' || !ff.management || (f.management || 'managed') === ff.management)
        && (ff.strategy === 'all' || !ff.strategy || strategyKey(f) === ff.strategy)
        && (ff.status === 'all' || !ff.status || f.status === ff.status)
        && (ff.manager === 'all' || !ff.manager || (f.manager || '未分配') === ff.manager);
    });
  }

  /** 由筛选结果展开连根树：管理基金、所投子基金、穿透项目 id 集合 */
  function buildFundExportScope(filtered) {
    var s = store();
    var managedMap = {};
    var externalMap = {};
    var projectIds = {};

    filtered.forEach(function (f) {
      if (f.management === 'external') externalMap[f.id] = f;
      else managedMap[f.id] = f;
    });

    Object.keys(managedMap).forEach(function (mid) {
      var port = s ? s.fundPortfolio(mid) : { investedFunds: [], lookthroughProjects: [], directProjects: [] };
      (port.investedFunds || []).forEach(function (sf) { externalMap[sf.id] = sf; });
      (port.lookthroughProjects || []).forEach(function (p) { if (p && p.id) projectIds[p.id] = p; });
      (port.directProjects || []).forEach(function (p) { if (p && p.id) projectIds[p.id] = p; });
    });

    Object.keys(externalMap).forEach(function (eid) {
      var port = s ? s.fundPortfolio(eid) : { lookthroughProjects: [] };
      (port.lookthroughProjects || []).forEach(function (p) { if (p && p.id) projectIds[p.id] = p; });
      /* 补关联母基金进管理基金表（出资账户需要） */
      ((externalMap[eid].fundRelations) || []).forEach(function (r) {
        if (!r.fundId || managedMap[r.fundId]) return;
        var mf = s && s.fund(r.fundId);
        if (mf && mf.management !== 'external') managedMap[mf.id] = mf;
      });
    });

    return {
      managed: Object.keys(managedMap).map(function (id) { return managedMap[id]; }),
      external: Object.keys(externalMap).map(function (id) { return externalMap[id]; }),
      projects: Object.keys(projectIds).map(function (id) { return projectIds[id]; })
    };
  }

  function resolveReportPeriod(external, managed) {
    var labels = [];
    function push(v) { if (v && labels.indexOf(v) < 0) labels.push(String(v)); }
    (external || []).concat(managed || []).forEach(function (f) {
      push(f.reportEndDate);
      push(f.reportPeriod);
      if (f.periods && f.periods.length) push(f.periods[f.periods.length - 1].label || f.periods[f.periods.length - 1].id);
      ((f.fundRelations) || []).forEach(function (r) { push(r.period); });
    });
    if (!labels.length) return '最新已确认期间';
    labels.sort();
    return labels[labels.length - 1];
  }

  function priorFairValue(p, h) {
    if (p.priorFairValue != null) return Number(p.priorFairValue);
    if (h && h.priorFairValue != null) return Number(h.priorFairValue);
    if (p.priorHolding && p.priorHolding.fairValue != null) return Number(p.priorHolding.fairValue);
    if (p.priorHolding && p.priorHolding.totalValue != null) return Number(p.priorHolding.totalValue);
    if (h && h.priorTotalValue != null) return Number(h.priorTotalValue);
    return null;
  }

  function exportFunds(fundFilter) {
    var s = store();
    var filtered = filterFundsList(fundFilter);
    var scope = buildFundExportScope(filtered);
    var managed = scope.managed;
    var external = scope.external;
    var unitLab = moneyUnitLabel(getExportMoneyUnit());
    var reportPeriod = resolveReportPeriod(external, managed);

    var noteRows = [
      ['启明星 · 基金管理台账包'],
      ['导出日期', dateStamp()],
      ['本期末报告期', reportPeriod],
      ['金额单位', unitLab + '（档案默认万元；台账包同口径）'],
      ['本机构', '界面与导出统一用「本机构」，不写客户口头简称'],
      ['子基金对本金', '底层持仓投资金额＝子基金对该企业的投资成本，不是本机构对该子基金的认缴'],
      ['范围', '与列表当前筛选一致；管理基金带出其下子基金／底层／分配（连萝卜带根）'],
      ['汇报态', '退出统计／披露摘要列全集对齐客户竖表（含预测差额、分季后续轮）；占比＝本机构认缴比例'],
      ['与数据浏览器', '本文件为固化快照；跨维透视与在线钻取见后续数据浏览器'],
      ['Sheet 顺序', '说明→管理基金→所投子基金→底层持仓→分配总表→分配拆项目→后续轮→出资账户→经营文字→退出统计→披露摘要']
    ];

    var managedHeader = [
      '序号', '基金简称', '基金全称', '内部编号', '基金类别', '投资策略', '运作状态', '管理人',
      '成立年份', '认缴金额', '实缴金额', '关联对象数', '最近更新'
    ];
    var managedRows = [managedHeader];
    managed.forEach(function (f, i) {
      var port = s ? s.fundPortfolio(f.id) : { directProjects: [], investedFunds: [] };
      var cnt = (port.directProjects || []).length + (port.investedFunds || []).length;
      managedRows.push([
        i + 1, n(f.name), n(f.fullName || f.name), n(f.code), '本机构管理基金', strategyLabel(f), n(f.status),
        n(f.manager), n(f.establishYear || f.foundedYear || (f.established && String(f.established).slice(0, 4))),
        money(f.committed), money(f.called), cnt, n(f.lastUpdate || f.updatedAt)
      ]);
    });

    var listHeader = [
      '基金简称', '基金全称（所投基金主体）', '基金管理人（全称及备案号）', '基金备案编号',
      '基金注册地', '基金成立日期', '投资期', '投资期到期日', '基金存续期', '投资方向', '主要投资阶段', '团队核心成员',
      '认缴金额（本基金主体）', '认缴金额（基金合计·平行）', '实缴金额（本基金主体）', '实缴金额（基金合计·平行）',
      '投资数量(个)', '投资金额（本基金主体）', '投资金额（基金合计·平行）',
      '完全退出项目数量（个）', '部分退出项目数量（个）', '总退出金额', 'MOIC(基金-GP报告值)',
      '本机构认缴金额', '本机构认缴比例（%）（＝占比）', '本机构实缴金额',
      '本机构TVPI', '本机构资本账户期末余额', '本机构累计分配金额', '本机构DPI', '未收回成本',
      '退出／清算时间', '基金总体退出金额', '清算回报倍数', '收回本金时间',
      'GP报告IRR', '报告截止日', '基金当前年限', '是否在延长期', '关联本机构管理基金'
    ];
    var listRows = [listHeader];
    external.forEach(function (f, i) {
      var port = s ? s.fundPortfolio(f.id) : { lookthroughProjects: [] };
      var lt = port.lookthroughProjects || [];
      var fullExit = lt.filter(function (p) { return (p.exitStatus || '').indexOf('完全') >= 0; }).length;
      var partExit = lt.filter(function (p) { return (p.exitStatus || '').indexOf('部分') >= 0; }).length;
      var investAmtWan = lt.reduce(function (a, p) { return a + Number(p.investAmount || 0); }, 0);
      var parentNames = [];
      var relCommitted = 0, relCalled = 0, relDist = 0, relNav = 0;
      ((f.fundRelations) || []).forEach(function (r) {
        var mf = s && s.fund(r.fundId);
        if (mf) parentNames.push(mf.name);
        relCommitted += Number(r.committed || 0);
        relCalled += Number(r.called || 0);
        relDist += Number(r.distributed || 0);
        relNav += Number(r.periodEndNav || 0);
      });
      if (!((f.fundRelations) || []).length) {
        relCalled = Number(f.called || 0);
        relCommitted = Number(f.committed || 0);
      }
      var fundCommittedWan = Number(f.committed || 0);
      /* 竖表：认缴比例＝本机构认缴÷基金主体认缴（同单位万） */
      var relRatio = fundCommittedWan ? Math.round((relCommitted / fundCommittedWan) * 1e8) / 1e8 : '';
      var tvpi = relCalled ? ((relDist + relNav) / relCalled) : '';
      var dpi = relCalled ? (relDist / relCalled) : '';
      var reportEnd = n(f.reportEndDate || (f.periods && f.periods[f.periods.length - 1] && f.periods[f.periods.length - 1].label) || '');
      listRows.push([
        n(f.name), n(f.fullName || f.name), n(f.manager), n(f.code),
        n(f.registeredPlace || f.city), n(f.established), n(f.investPeriod), n(f.investPeriodEnd), n(f.duration || f.fundTerm),
        n(f.direction || f.investDirection), n(f.mainStage || f.stageFocus), n(f.team || f.coreTeam),
        money(f.committed),
        money(f.parallelCommitted != null ? f.parallelCommitted : f.committedTotalWan),
        money(f.called),
        money(f.parallelCalled != null ? f.parallelCalled : f.called),
        lt.length,
        money(investAmtWan),
        money(f.parallelInvestAmount),
        fullExit, partExit, money(f.totalExitAmount), n(f.moic),
        money(relCommitted), num(relRatio), money(relCalled),
        tvpi === '' ? '' : Math.round(tvpi * 100) / 100,
        money(relNav), money(relDist),
        dpi === '' ? '' : Math.round(dpi * 100) / 100,
        relCalled ? money(Math.max(0, relCalled - relDist)) : '',
        n(f.liquidationDate || f.exitClearDate), money(f.fundTotalExitAmount), num(f.liquidationMoic), n(f.principalRecoverDate),
        n(f.gpIrr || f.irr), reportEnd, n(f.fundAgeYears), n(f.inExtension || f.extensionFlag), parentNames.join('、')
      ]);
    });

    var holdHeader = [
      '对应子基金名称', '项目简称', '项目工商全称', '企业所在省', '项目注册地（市）', '项目注册地（区）', '项目注册地址',
      '所属行业', '细分行业', '主营业务', '首次投资日期', '投资轮次', '领投者(Y/N)', '项目负责人',
      '报告期（本期末）', '本基金主体投资金额（子基金对本金）', '基金合计投资金额（平行）',
      '公司最新投后估值', '剩余投资成本', '最新持股比例',
      '已实现价值', '未实现价值', '项目公允价值', '上期末公允价值', '本期末公允价值', '公允价值变动', '回报倍数',
      '项目状态／退出状态', '确权情况', '投资方式', '项目状态备注',
      '是否有后续轮融资（Y/N）', '最新一轮融资日期', '最新一轮融资估值', '最新一轮融资后持股比例',
      '退出时间', '退出方式', '退出金额', '业务进展', '退出规划', '后续融资情况', '拟IPO项目时间预期'
    ];
    var holdRows = [holdHeader];
    var followRows = [['子基金', '项目简称', '轮次', '时间', '投资方', '投资金额', '投后估值', '持股比例']];
    var bizRows = [['子基金', '项目简称', '期间', '业务进展', '退出规划', '后续融资情况', '收入（万）', '净利润（万）']];
    external.forEach(function (f) {
      var port = s ? s.fundPortfolio(f.id) : { lookthroughProjects: [] };
      (port.lookthroughProjects || []).forEach(function (p) {
        var h = p.holding || {};
        var realized = Number(p.exitAmount || h.realized || 0);
        var unreal = Number(h.fairValue != null ? h.fairValue : h.totalValue || 0);
        var cost = Number(p.investAmount || 0);
        var share = Number(p.ratio != null ? p.ratio : h.ownership || 0);
        var fv = realized + unreal;
        if (h.totalValue != null && !realized) fv = Number(h.totalValue);
        else if (h.fairValue != null && realized) fv = realized + Number(h.fairValue);
        var moic = cost ? Math.round((fv / cost) * 100) / 100 : '';
        var prior = priorFairValue(p, h);
        var delta = prior != null && !isNaN(prior) ? Math.round((fv - prior) * 100) / 100 : '';
        var periodLab = n(h.period || p.dataPeriod || f.reportEndDate || f.reportPeriod || reportPeriod);
        /* 投后估值＝未实现÷持股（竖表）；无持股则用材料估值 */
        var postVal = (share && unreal) ? Math.round((unreal / share) * 100) / 100 : (p.latestValuation || h.postMoneyValuation || '');
        holdRows.push([
          n(f.name), n(p.name), n(p.legalName || p.fullName || p.name),
          n(p.province), n(p.city), n(p.district), n(p.address || p.registeredAddress),
          n(p.industry), n(p.subIndustry), n(p.mainBusiness), n(p.investDate), n(p.round),
          n(p.investRole === '领投' ? 'Y' : (p.leadInvestor != null ? p.leadInvestor : 'N')),
          n(p.owner),
          periodLab,
          money(p.investAmount), money(p.parallelInvestAmount),
          postVal === '' ? '' : money(postVal),
          money(p.remainingCost != null ? p.remainingCost : h.remainingCost),
          num(p.ratio), money(realized), money(unreal), money(fv),
          prior != null && !isNaN(prior) ? money(prior) : '',
          money(fv),
          delta === '' ? n(p.fairValueChange) : money(delta),
          moic === '' ? n(p.moic) : moic,
          n(p.exitStatus), n(p.confirmStatus || p.确权情况), n(p.investMethod || p.投资方式), n(p.statusNote),
          n(p.hasFollowOn != null ? (p.hasFollowOn ? 'Y' : 'N') : (p.followOnYn || '')),
          n(p.latestRoundDate), money(p.latestValuation), num(p.postRoundRatio != null ? p.postRoundRatio : p.ratio),
          n(p.exitDate), n(p.exitMethod), money(p.exitAmount),
          n(p.businessProgress), n(p.exitPlan), n(p.followOnNarrative || p.followOnText || ''),
          n(p.ipoPlan || p.拟IPO || '')
        ]);
        var fr = p.financingRounds || h.financingRounds || [];
        if (fr.length) {
          fr.forEach(function (rr) {
            followRows.push([n(f.name), n(p.name), n(rr.round), n(rr.date), n(rr.investors), money(rr.amount), n(rr.postValYi != null ? rr.postValYi : rr.postVal), num(rr.ownership)]);
          });
        } else {
          var addedFollow = false;
          (p.equityEvents || []).filter(function (e) { return (e.type || '').indexOf('融资') >= 0 || (e.type || '').indexOf('后续') >= 0; }).forEach(function (e) {
            followRows.push([n(f.name), n(p.name), n(e.type), n(e.date), n((e.newShareholders || []).join('、') || e.desc), money(e.amount), money(e.newValuation), num(e.newRatio)]);
            addedFollow = true;
          });
          if (!addedFollow && (p.latestRoundDate || p.hasFollowOn)) {
            followRows.push([n(f.name), n(p.name), n(p.latestRound || '后续轮'), n(p.latestRoundDate), '', '', money(p.latestValuation), num(p.postRoundRatio)]);
          }
        }
        var metrics = p.businessMetrics || h.businessMetrics || {};
        bizRows.push([
          n(f.name), n(p.name), n(h.period || p.businessProgressPeriod || ''),
          n(p.businessProgress), n(p.exitPlan), n(p.followOnNarrative || p.followOnText || ''),
          money(metrics.revenue || p.revenue), money(metrics.netProfit || p.netProfit)
        ]);
      });
    });

    var distHeader = [
      '所投子基金', '关联本机构管理基金', '本机构实缴', '分配日期', '到账金额（本机构）',
      '占比（本机构认缴比例）', '未收回成本', '成本收回', '收益分配',
      '分配性质', '分配所用比例', '来源项目', '备注'
    ];
    var distRows = [distHeader];
    var distDetailHeader = [
      '所投子基金', '关联本机构管理基金', '分配日期', '到账金额（本机构）', '来源项目',
      '回收资金-基金', '回收资金-本机构', '项目成本-基金', '项目成本-本机构',
      '分配所用比例', '分配款check', '分配性质', '成本收回', '收益分配', '备注'
    ];
    var distDetailRows = [distDetailHeader];

    function pushDistRows(f, parentName, relCalled, relRatio) {
      var unrecovered = relCalled ? Math.max(0, Number(relCalled) - ((f.distributions || []).reduce(function (a, d) { return a + Number(d.amount || 0); }, 0))) : (f.unrecoveredCost || '');
      (f.distributions || []).forEach(function (d) {
        var lpRec = Number(d.lpRecovered != null ? d.lpRecovered : d.amount || 0);
        var check = Number(d.amount || 0) - lpRec;
        distRows.push([
          n(f.name), n(parentName), money(relCalled), n(d.date), money(d.amount),
          num(relRatio), money(d.unrecoveredCost != null ? d.unrecoveredCost : unrecovered),
          money(d.costRecovered), money(d.gainDistributed),
          n(d.distType || d.nature || '现金分配'), num(d.lpRatio != null ? d.lpRatio : d.ratio),
          n(d.exitCompany || d.project || ''), n(d.note || '')
        ]);
        distDetailRows.push([
          n(f.name), n(parentName), n(d.date), money(d.amount), n(d.exitCompany || d.project || ''),
          money(d.fundRecovered != null ? d.fundRecovered : d.totalDistributed),
          money(lpRec),
          money(d.projectCostFund), money(d.projectCostLp),
          num(d.lpRatio != null ? d.lpRatio : d.ratio),
          Math.round(check * 100) / 100,
          n(d.distType || d.nature || '现金分配'),
          money(d.costRecovered), money(d.gainDistributed), n(d.note || '')
        ]);
      });
    }

    external.forEach(function (f) {
      var rels = (f.fundRelations) || [];
      var parentLabel = rels.map(function (r) {
        var mf = s && s.fund(r.fundId);
        return mf ? mf.name : '';
      }).filter(Boolean).join('、');
      var relCalled = 0, relCommittedForRatio = 0, fundCommitted = 0;
      rels.forEach(function (r) {
        relCalled += Number(r.called || 0);
        relCommittedForRatio += Number(r.committed || 0);
      });
      if (!rels.length) {
        relCalled = Number(f.called || 0);
        relCommittedForRatio = Number(f.committed || 0);
      }
      fundCommitted = Number(f.committed || 0);
      var relRatio = fundCommitted ? Math.round((relCommittedForRatio / fundCommitted) * 1e8) / 1e8 : '';
      pushDistRows(f, parentLabel, relCalled, relRatio);
    });
    /* 管理基金上直接挂的分配（fromFund）也收进总表 */
    managed.forEach(function (f) {
      (f.distributions || []).forEach(function (d) {
        var lpRec = Number(d.lpRecovered != null ? d.lpRecovered : d.amount || 0);
        var check = Number(d.amount || 0) - lpRec;
        distRows.push([
          n(d.fromFund || ''), n(f.name), money(f.called), n(d.date), money(d.amount),
          '', money(d.unrecoveredCost), money(d.costRecovered), money(d.gainDistributed),
          n(d.distType || d.nature || '现金分配'), num(d.lpRatio),
          n(d.exitCompany || d.project || ''), n(d.note || '')
        ]);
        distDetailRows.push([
          n(d.fromFund || ''), n(f.name), n(d.date), money(d.amount), n(d.exitCompany || d.project || ''),
          money(d.fundRecovered != null ? d.fundRecovered : d.totalDistributed),
          money(lpRec),
          money(d.projectCostFund), money(d.projectCostLp),
          num(d.lpRatio), Math.round(check * 100) / 100,
          n(d.distType || d.nature || '现金分配'),
          money(d.costRecovered), money(d.gainDistributed), n(d.note || '')
        ]);
      });
    });

    var caHeader = ['本机构管理基金', '所投子基金', '认缴', '实缴', '累计分配', '期末账户余额', '期间'];
    var caRows = [caHeader];
    var caSeen = {};
    managed.forEach(function (mf) {
      var port = s ? s.fundPortfolio(mf.id) : { investedFunds: [] };
      (port.investedFunds || []).forEach(function (sf) {
        if (!external.some(function (e) { return e.id === sf.id; })) return;
        var key = mf.id + '|' + sf.id;
        if (caSeen[key]) return;
        caSeen[key] = true;
        var r = relForFund(sf, mf.id);
        caRows.push([n(mf.name), n(sf.name), money(r.committed), money(r.called), money(r.distributed), money(r.periodEndNav), n(r.period)]);
      });
    });
    external.forEach(function (sf) {
      ((sf.fundRelations) || []).forEach(function (r) {
        var mf = s && s.fund(r.fundId);
        if (!mf) return;
        var key = mf.id + '|' + sf.id;
        if (caSeen[key]) return;
        caSeen[key] = true;
        caRows.push([n(mf.name), n(sf.name), money(r.committed), money(r.called), money(r.distributed), money(r.periodEndNav), n(r.period)]);
      });
    });

    var exitHeader = [
      '所投子基金', '基金规模', '报告期（本期末）', '本机构认缴', '本机构累计分配', '本机构DPI',
      '其中本年度收到分配', '年初预计退出分配', '较预期差额',
      '本年度重点退出项目', '下半年／次年预计退出分配', '新增退出项目', '预计新增IPO项目',
      '完全退出项目数', '部分退出项目数', '退出金额合计', '完全退出项目', '部分退出项目'
    ];
    var exitRows = [exitHeader];
    var discHeader = [
      '所投子基金', '报告期（本期末）', '基金规模（认缴主体）', '基金期限（存续期）', '投资期',
      '基金当前年限', '是否在延长期',
      'MOIC(GP)', '本机构TVPI', '本机构DPI',
      '新增后续轮融资个数', '新增后续轮项目-Q1', '新增后续轮项目-Q2', '新增后续轮项目-Q3', '新增后续轮项目-Q4',
      '已上市项目'
    ];
    var discRows = [discHeader];
    var reportYear = String(reportPeriod).match(/(\d{4})/);
    reportYear = reportYear ? reportYear[1] : String(new Date().getFullYear());

    external.forEach(function (f) {
      var port = s ? s.fundPortfolio(f.id) : { lookthroughProjects: [] };
      var lt = port.lookthroughProjects || [];
      var relCommitted = 0, relCalled = 0, relDist = 0, relNav = 0;
      ((f.fundRelations) || []).forEach(function (r) {
        relCommitted += Number(r.committed || 0);
        relCalled += Number(r.called || 0);
        relDist += Number(r.distributed || 0);
        relNav += Number(r.periodEndNav || 0);
      });
      if (!((f.fundRelations) || []).length) {
        relCommitted = Number(f.committed || 0);
        relCalled = Number(f.called || 0);
        relDist = Number(f.distributed || 0);
      }
      var dpi = relCommitted ? Math.round((relDist / relCommitted) * 10000) / 10000 : '';
      var tvpi = relCalled ? Math.round(((relDist + relNav) / relCalled) * 10000) / 10000 : '';
      var full = lt.filter(function (p) { return (p.exitStatus || '').indexOf('完全') >= 0; });
      var part = lt.filter(function (p) { return (p.exitStatus || '').indexOf('部分') >= 0; });
      var exitAmt = full.concat(part).reduce(function (a, p) { return a + Number(p.exitAmount || 0); }, 0);
      var yearDist = Number(f.yearDistributed || f.distThisYear || 0);
      var yearPlan = Number(f.yearExitPlan || f.expectedExitStart || 0);
      var yearGap = (yearDist || yearPlan) ? Math.round((yearDist - yearPlan) * 100) / 100 : '';
      var nextPlan = Number(f.nextHalfExitPlan || f.expectedExitNext || 0);
      exitRows.push([
        n(f.name), money(f.committed), reportPeriod, money(relCommitted), money(relDist), dpi,
        money(yearDist || ''), money(yearPlan || ''), yearGap === '' ? '' : money(yearGap),
        n(f.keyExitProjects || full.concat(part).map(function (p) { return p.name; }).join('、')),
        money(nextPlan || ''), n(f.newExitProjects || ''), n(f.expectedIpoProjects || ''),
        full.length, part.length, money(exitAmt || f.totalExitAmount),
        full.map(function (p) { return p.name; }).join('、'),
        part.map(function (p) { return p.name; }).join('、')
      ]);

      var qFollow = { Q1: [], Q2: [], Q3: [], Q4: [] };
      function quarterOf(dateStr) {
        var m = String(dateStr || '').match(/(\d{4})[.\-\/]?(\d{1,2})?/);
        if (!m || m[1] !== reportYear) return null;
        var mo = parseInt(m[2] || '1', 10);
        if (mo <= 3) return 'Q1';
        if (mo <= 6) return 'Q2';
        if (mo <= 9) return 'Q3';
        return 'Q4';
      }
      lt.forEach(function (p) {
        var fr = p.financingRounds || (p.holding && p.holding.financingRounds) || [];
        fr.forEach(function (rr) {
          var q = quarterOf(rr.date);
          if (q && qFollow[q].indexOf(p.name) < 0) qFollow[q].push(p.name);
        });
        (p.equityEvents || []).forEach(function (e) {
          if ((e.type || '').indexOf('融资') < 0 && (e.type || '').indexOf('后续') < 0) return;
          var q = quarterOf(e.date);
          if (q && qFollow[q].indexOf(p.name) < 0) qFollow[q].push(p.name);
        });
        if (p.latestRoundDate) {
          var q2 = quarterOf(p.latestRoundDate);
          if (q2 && qFollow[q2].indexOf(p.name) < 0) qFollow[q2].push(p.name);
        }
      });
      var followAll = [].concat(qFollow.Q1, qFollow.Q2, qFollow.Q3, qFollow.Q4);
      var followUnique = followAll.filter(function (name, i) { return followAll.indexOf(name) === i; });
      var ipoBits = lt.filter(function (p) {
        return p.ipoPlan || p.拟IPO || (p.exitMethod && String(p.exitMethod).toUpperCase().indexOf('IPO') >= 0) ||
          (p.listingNote) || (p.statusNote && String(p.statusNote).indexOf('上市') >= 0);
      }).map(function (p) {
        return p.name + (p.ipoPlan || p.listingNote || p.拟IPO ? '（' + (p.ipoPlan || p.listingNote || p.拟IPO) + '）' : '');
      });
      discRows.push([
        n(f.name), reportPeriod, money(f.committed), n(f.duration || f.fundTerm), n(f.investPeriod),
        n(f.fundAgeYears), n(f.inExtension || f.extensionFlag),
        n(f.moic), tvpi, dpi,
        followUnique.length,
        qFollow.Q1.join('、') || '-', qFollow.Q2.join('、') || '-', qFollow.Q3.join('、') || '-', qFollow.Q4.join('、') || '-',
        ipoBits.join('、')
      ]);
    });

    var ok = downloadWorkbook('基金管理台账包-' + dateStamp() + '.xlsx', [
      { name: '说明', aoa: noteRows },
      { name: '管理基金', aoa: managedRows },
      { name: '所投子基金', aoa: listRows },
      { name: '底层持仓', aoa: holdRows },
      { name: '分配总表', aoa: distRows },
      { name: '分配拆项目', aoa: distDetailRows },
      { name: '后续轮融资情况', aoa: followRows },
      { name: '本机构出资账户', aoa: caRows },
      { name: '经营文字', aoa: bizRows },
      { name: '退出统计', aoa: exitRows },
      { name: '披露摘要', aoa: discRows }
    ]);
    if (ok) toast('已导出台账包');
  }

  function filterProjectsList(projectFilter) {
    var s = store();
    var pf = projectFilter || {};
    var stageMap = { '全部': 'all', '投前': 'pre', '投中': 'deal', '投后': 'post' };
    var criteria = {
      search: pf.search || '',
      stage: stageMap[pf.stage] != null ? stageMap[pf.stage] : (pf.stage || 'all'),
      type: pf.type || 'all',
      fundId: pf.fundId || 'all',
      owner: pf.owner || 'all'
    };
    if (s && s.filterProjects) return s.filterProjects(criteria);
    return (s ? s.projects() : []).filter(function (p) {
      if (criteria.type !== 'all' && p.type !== criteria.type) return false;
      if (criteria.stage !== 'all' && p.stage !== criteria.stage) return false;
      if (criteria.owner !== 'all' && (p.owner || '') !== criteria.owner) return false;
      return true;
    });
  }

  function exportProjects(projectFilter) {
    var s = store();
    var list = filterProjectsList(projectFilter);
    var directs = list.filter(function (p) { return p.type === 'direct'; });
    var lts = list.filter(function (p) { return p.type === 'lookthrough'; });
    var unitLab = moneyUnitLabel(getExportMoneyUnit());

    function fundNames(p) {
      return (p.parentFundIds || []).map(function (id) { var f = s && s.fund(id); return f && f.name; }).filter(Boolean).join('、')
        || p.sourceFundName || '';
    }

    var noteRows = [
      ['启明星 · 项目库台账包'],
      ['导出日期', dateStamp()],
      ['金额单位', unitLab + '（档案默认万元；三表同单位）'],
      ['范围', '与项目库列表当前筛选一致'],
      ['与基金管理台账包', '穿透持仓可重叠；本包侧重按项目切片与直投三表／条款'],
      ['与数据浏览器', '固化快照；交互透视见后续数据浏览器']
    ];

    var baseH = ['项目名称', '类型', '阶段', '投资路径', '统一社会信用代码', '工商全称', '所属行业', '细分行业', '所在省', '城市', '注册地址', '成立日期', '注册资本', '法定代表人', '经营状态', '主营业务', '负责人', '最后更新'];
    var baseRows = [baseH];
    directs.forEach(function (p) {
      var ext = p.externalPublic || (p.外部数据_企查查) || {};
      var biz = ext.工商信息 || ext.biz || {};
      baseRows.push([
        n(p.name), '直接投资', ({ pre: '投前', deal: '投中', post: '投后' })[p.stage] || p.stage, fundNames(p),
        n(p.creditCode || biz.统一社会信用代码), n(p.legalName || biz.企业名称 || p.name),
        n(p.industry), n(p.subIndustry), n(p.province || biz.省份), n(p.city || biz.城市),
        n(p.address || biz.注册地址), n(p.establishDate || biz.成立日期), n(p.registeredCapital || biz.注册资本),
        n(p.legalRep || biz.法定代表人), n(p.businessStatus || biz.经营状态), n(p.mainBusiness), n(p.owner), n(p.lastUpdate)
      ]);
    });

    var invH = ['项目名称', '首次投资日期', '投资轮次', '投资角色', '本机构投资金额', '投资方式', '领投者'];
    var invRows = [invH];
    directs.forEach(function (p) {
      invRows.push([n(p.name), n(p.investDate), n(p.round), n(p.investRole), money(p.investAmount), n(p.investMethod), n(p.investRole === '领投' ? 'Y' : 'N')]);
    });

    var holdH = ['项目名称', '最新持股比例', '最新投后估值', '持股公允价值', '剩余投资成本', '已实现价值', '项目公允价值', '回报倍数', '退出状态', '数据期间'];
    var holdRows = [holdH];
    directs.forEach(function (p) {
      var h = p.holding || {};
      var cost = Number(p.investAmount || 0);
      var fv = Number(h.totalValue != null ? h.totalValue : h.fairValue || 0);
      var realized = Number(p.exitAmount || 0);
      holdRows.push([
        n(p.name), num(p.ratio), money(p.valuation), money(h.fairValue), money(p.remainingCost != null ? p.remainingCost : h.remainingCost),
        money(realized), money(fv), cost ? Math.round(((realized + fv) / cost) * 100) / 100 : '', n(p.exitStatus), n(h.period)
      ]);
    });

    var perfH = ['项目名称', '业务进展', '退出规划', '后续融资情况', '是否有后续轮融资', '最新一轮融资日期', '最新一轮融资估值', '融资后持股比例'];
    var perfRows = [perfH];
    directs.forEach(function (p) {
      perfRows.push([
        n(p.name), n(p.businessProgress), n(p.exitPlan), n(p.followOnNarrative || p.followOnText || ''),
        n(p.hasFollowOn != null ? (p.hasFollowOn ? 'Y' : 'N') : ''), n(p.latestRoundDate), money(p.latestValuation), num(p.postRoundRatio)
      ]);
    });

    var termH = ['项目名称', '条款名称', '是否有', '条款详情'];
    var termRows = [termH];
    directs.forEach(function (p) {
      (p.terms || []).forEach(function (t) {
        termRows.push([n(p.name), n(t.name), t.has ? '是' : '否', n(t.detail)]);
      });
    });

    function stmtSheet(title, keys) {
      var header = ['项目名称', '期间', '金额单位'].concat(keys.map(function (k) { return k[1]; }));
      var rows = [header];
      directs.forEach(function (p) {
        (p.periods || []).forEach(function (per) {
          rows.push([n(p.name), n(per.label || per.id), unitLab].concat(keys.map(function (k) { return money(per[k[0]]); })));
        });
      });
      return { name: title, aoa: rows };
    }

    var ltH = [
      '对应子基金名称', '项目简称', '项目工商全称', '所属行业', '投资轮次', '首次投资日期', '总投资金额（子基金对本金）',
      '剩余投资成本', '最新持股比例', '已实现价值', '未实现价值', '项目公允价值', '回报倍数', '退出状态',
      '确权情况', '投资方式', '业务进展', '退出规划', '后续融资情况'
    ];
    var ltRows = [ltH];
    lts.forEach(function (p) {
      var h = p.holding || {};
      var realized = Number(p.exitAmount || 0);
      var unreal = Number(h.fairValue != null ? h.fairValue : h.totalValue || 0);
      var cost = Number(p.investAmount || 0);
      ltRows.push([
        n(p.sourceFundName || (s && p.targetFundId && s.fund(p.targetFundId) && s.fund(p.targetFundId).name)),
        n(p.name), n(p.legalName || p.name), n(p.industry), n(p.round), n(p.investDate), money(p.investAmount),
        money(p.remainingCost != null ? p.remainingCost : h.remainingCost), num(p.ratio), money(realized), money(unreal),
        money(realized + unreal), cost ? Math.round(((realized + unreal) / cost) * 100) / 100 : n(p.moic),
        n(p.exitStatus), n(p.confirmStatus), n(p.investMethod), n(p.businessProgress), n(p.exitPlan), n(p.followOnNarrative || p.followOnText || '')
      ]);
    });

    var ltFollow = [['对应子基金', '项目简称', '融资日期', '融资轮次', '融资金额', '最新估值', '最新持股比例']];
    lts.forEach(function (p) {
      (p.equityEvents || []).forEach(function (e) {
        ltFollow.push([n(p.sourceFundName), n(p.name), n(e.date), n(e.type), money(e.amount), money(e.newValuation), num(e.newRatio)]);
      });
      if (p.latestRoundDate) ltFollow.push([n(p.sourceFundName), n(p.name), n(p.latestRoundDate), n(p.latestRound || '后续轮'), '', money(p.latestValuation), num(p.postRoundRatio)]);
    });

    var ltBiz = [['对应子基金', '项目简称', '业务进展', '退出规划', '后续融资情况']];
    lts.forEach(function (p) {
      ltBiz.push([n(p.sourceFundName), n(p.name), n(p.businessProgress), n(p.exitPlan), n(p.followOnNarrative || p.followOnText || '')]);
    });

    var sheets = [
      { name: '说明', aoa: noteRows },
      { name: '直投-基础信息', aoa: baseRows },
      { name: '直投-投资信息', aoa: invRows },
      { name: '直投-期末持仓', aoa: holdRows },
      { name: '直投-经营情况', aoa: perfRows },
      { name: '直投-企业与条款', aoa: termRows },
      stmtSheet('直投-利润表', [['revenue', '营业收入'], ['grossProfit', '毛利润'], ['researchCost', '研发费用'], ['netProfit', '净利润']]),
      stmtSheet('直投-资产负债表', [['totalAssets', '资产总计'], ['totalLiab', '负债合计'], ['equity', '所有者权益合计']]),
      stmtSheet('直投-现金流量表', [['operatingCF', '经营活动现金流量净额']]),
      { name: '穿透-持仓列表', aoa: ltRows },
      { name: '穿透-后续轮融资', aoa: ltFollow },
      { name: '穿透-经营文字', aoa: ltBiz }
    ];
    var ok = downloadWorkbook('项目库台账包-' + dateStamp() + '.xlsx', sheets);
    if (ok) toast('已导出台账包');
  }

  window.PE_POST_EXPORT = {
    exportFunds: exportFunds,
    exportProjects: exportProjects,
    downloadWorkbook: downloadWorkbook
  };
})();
