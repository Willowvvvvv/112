/** 配置中心 CRUD 运行时仓 · 财务准则 / 指标配置 / 档案配置 */
(function () {
  'use strict';

  var KEY = 'qmx:cfg-center:v8';
  var PREV_KEYS = ['qmx:cfg-center:v7', 'qmx:cfg-center:v6', 'qmx:cfg-center:v5', 'qmx:cfg-center:v4', 'qmx:cfg-center:v3', 'qmx:cfg-center:v2', 'qmx:cfg-center:v1'];

  function uid(p) {
    return p + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function clone(v) { return JSON.parse(JSON.stringify(v || [])); }

  /* ——— 种子数据 ——— */

  var SEED_STANDARDS = [
    { id: 'std-cn',       name: '中国企业会计准则（通用）', description: '适用于境内企业，覆盖利润表、资产负债表、现金流量表三大报表的标准科目口径', sort: 10, enabled: true, source: 'platform', createdAt: '2026-08-01 09:00', createdBy: '平台预置', updatedAt: '2026-08-03 10:00', updatedBy: '平台预置' },
    { id: 'std-internal', name: '基金跟踪口径',              description: '本机构 LP／子基金投后监控用的业务字段字典（认缴、实缴、分配、NAV 等），非企业会计三表；与中国准则分库、指标集不可跨库混引', sort: 20, enabled: true, source: 'platform', createdAt: '2026-08-01 09:00', createdBy: '平台预置', updatedAt: '2026-08-07 16:00', updatedBy: '平台预置' },
  ];

  var SEED_SUBJECTS = [
    /* ── 中国企业会计准则（通用）· 利润表 ── */
    { id: 'subj-is-01', standardId: 'std-cn', stmt: 'is', name: '营业收入',           aliases: '主营业务收入,收入,总收入,营收',             sort: 10,  enabled: true, source: 'platform' },
    { id: 'subj-is-02', standardId: 'std-cn', stmt: 'is', name: '营业成本',           aliases: '主营业务成本,销售成本,成本',               sort: 20,  enabled: true, source: 'platform' },
    { id: 'subj-is-03', standardId: 'std-cn', stmt: 'is', name: '毛利润',             aliases: '税前毛利,毛利',                           sort: 30,  enabled: true, source: 'platform' },
    { id: 'subj-is-04', standardId: 'std-cn', stmt: 'is', name: '税金及附加',         aliases: '营业税金及附加,税费',                     sort: 40,  enabled: true, source: 'platform' },
    { id: 'subj-is-05', standardId: 'std-cn', stmt: 'is', name: '销售费用',           aliases: '销售和营销费用,营销费用',                 sort: 50,  enabled: true, source: 'platform' },
    { id: 'subj-is-06', standardId: 'std-cn', stmt: 'is', name: '管理费用',           aliases: '一般及行政费用,G&A,行政管理费',           sort: 60,  enabled: true, source: 'platform' },
    { id: 'subj-is-07', standardId: 'std-cn', stmt: 'is', name: '研发费用',           aliases: '研究开发费用,R&D,技术研发费',             sort: 70,  enabled: true, source: 'platform' },
    { id: 'subj-is-08', standardId: 'std-cn', stmt: 'is', name: '财务费用',           aliases: '利息费用净额,融资费用',                   sort: 80,  enabled: true, source: 'platform' },
    { id: 'subj-is-09', standardId: 'std-cn', stmt: 'is', name: '其他收益',           aliases: '其他经营收益,政府补贴',                   sort: 90,  enabled: true, source: 'platform' },
    { id: 'subj-is-10', standardId: 'std-cn', stmt: 'is', name: '投资收益',           aliases: '联营/合营企业投资收益,权益法收益',         sort: 100, enabled: true, source: 'platform' },
    { id: 'subj-is-11', standardId: 'std-cn', stmt: 'is', name: '公允价值变动收益',   aliases: '公允价值损益,FV变动',                     sort: 110, enabled: true, source: 'platform' },
    { id: 'subj-is-12', standardId: 'std-cn', stmt: 'is', name: '信用减值损失',       aliases: '坏账损失,应收款减值',                     sort: 120, enabled: true, source: 'platform' },
    { id: 'subj-is-13', standardId: 'std-cn', stmt: 'is', name: '资产减值损失',       aliases: '长期资产减值,商誉减值',                   sort: 130, enabled: true, source: 'platform' },
    { id: 'subj-is-14', standardId: 'std-cn', stmt: 'is', name: '资产处置收益',       aliases: '处置固定资产收益,资产出售损益',           sort: 140, enabled: true, source: 'platform' },
    { id: 'subj-is-15', standardId: 'std-cn', stmt: 'is', name: '营业利润',           aliases: '运营利润,EBIT,经营利润',                  sort: 150, enabled: true, source: 'platform' },
    { id: 'subj-is-16', standardId: 'std-cn', stmt: 'is', name: '营业外收入',         aliases: '非经营性收入,政策性收益',                 sort: 160, enabled: true, source: 'platform' },
    { id: 'subj-is-17', standardId: 'std-cn', stmt: 'is', name: '营业外支出',         aliases: '非经营性支出,公益性捐赠',                 sort: 170, enabled: true, source: 'platform' },
    { id: 'subj-is-18', standardId: 'std-cn', stmt: 'is', name: '利润总额',           aliases: '税前利润,EBT',                           sort: 180, enabled: true, source: 'platform' },
    { id: 'subj-is-19', standardId: 'std-cn', stmt: 'is', name: '所得税费用',         aliases: '企业所得税,所得税',                       sort: 190, enabled: true, source: 'platform' },
    { id: 'subj-is-20', standardId: 'std-cn', stmt: 'is', name: '净利润',             aliases: '税后净利,净利,净收益',                    sort: 200, enabled: true, source: 'platform' },
    { id: 'subj-is-23', standardId: 'std-cn', stmt: 'is', name: 'EBITDA',            aliases: '息税折旧摊销前利润,EBITDA利润',             sort: 205, enabled: true, source: 'platform' },
    { id: 'subj-is-21', standardId: 'std-cn', stmt: 'is', name: '归属母公司股东净利润', aliases: '归母净利润,归属上市公司净利润',          sort: 210, enabled: true, source: 'platform' },
    { id: 'subj-is-22', standardId: 'std-cn', stmt: 'is', name: '少数股东损益',       aliases: '少数股东利润,非控制性权益损益',           sort: 220, enabled: true, source: 'platform' },

    /* ── 中国企业会计准则（通用）· 资产负债表 ── */
    /* 流动资产 */
    { id: 'subj-bs-01', standardId: 'std-cn', stmt: 'bs', name: '货币资金',           aliases: '现金及现金等价物,现金,银行存款',           sort: 10,  enabled: true, source: 'platform' },
    { id: 'subj-bs-02', standardId: 'std-cn', stmt: 'bs', name: '交易性金融资产',     aliases: '短期投资,交易性投资,理财产品',             sort: 20,  enabled: true, source: 'platform' },
    { id: 'subj-bs-03', standardId: 'std-cn', stmt: 'bs', name: '应收票据',           aliases: '商业票据,应收汇票',                       sort: 30,  enabled: true, source: 'platform' },
    { id: 'subj-bs-04', standardId: 'std-cn', stmt: 'bs', name: '应收账款',           aliases: '应收款项,账款,客户应收',                  sort: 40,  enabled: true, source: 'platform' },
    { id: 'subj-bs-05', standardId: 'std-cn', stmt: 'bs', name: '预付款项',           aliases: '预付账款,预付款',                         sort: 50,  enabled: true, source: 'platform' },
    { id: 'subj-bs-06', standardId: 'std-cn', stmt: 'bs', name: '其他应收款',         aliases: '其他应收,押金及备用金',                   sort: 60,  enabled: true, source: 'platform' },
    { id: 'subj-bs-07', standardId: 'std-cn', stmt: 'bs', name: '存货',               aliases: '存货资产,库存,在制品',                    sort: 70,  enabled: true, source: 'platform' },
    { id: 'subj-bs-08', standardId: 'std-cn', stmt: 'bs', name: '合同资产',           aliases: '未结算工程款,合同结算资产',               sort: 80,  enabled: true, source: 'platform' },
    { id: 'subj-bs-09', standardId: 'std-cn', stmt: 'bs', name: '其他流动资产',       aliases: '流动资产其他,待抵扣税金',                 sort: 90,  enabled: true, source: 'platform' },
    { id: 'subj-bs-10', standardId: 'std-cn', stmt: 'bs', name: '流动资产合计',       aliases: '流动资产总额,流动资产',                   sort: 100, enabled: true, source: 'platform' },
    /* 非流动资产 */
    { id: 'subj-bs-11', standardId: 'std-cn', stmt: 'bs', name: '长期股权投资',       aliases: '对外长期投资,权益性投资',                 sort: 110, enabled: true, source: 'platform' },
    { id: 'subj-bs-12', standardId: 'std-cn', stmt: 'bs', name: '固定资产',           aliases: '净固定资产,机器设备,厂房及设备',          sort: 120, enabled: true, source: 'platform' },
    { id: 'subj-bs-13', standardId: 'std-cn', stmt: 'bs', name: '在建工程',           aliases: '建设中工程,工程物资',                     sort: 130, enabled: true, source: 'platform' },
    { id: 'subj-bs-14', standardId: 'std-cn', stmt: 'bs', name: '使用权资产',         aliases: '租赁资产,经营租赁资产',                   sort: 140, enabled: true, source: 'platform' },
    { id: 'subj-bs-15', standardId: 'std-cn', stmt: 'bs', name: '无形资产',           aliases: '专利权,商标权,软件著作权',                sort: 150, enabled: true, source: 'platform' },
    { id: 'subj-bs-16', standardId: 'std-cn', stmt: 'bs', name: '商誉',               aliases: '并购溢价,Goodwill',                       sort: 160, enabled: true, source: 'platform' },
    { id: 'subj-bs-17', standardId: 'std-cn', stmt: 'bs', name: '递延所得税资产',     aliases: '递延税资产,DTA',                          sort: 170, enabled: true, source: 'platform' },
    { id: 'subj-bs-18', standardId: 'std-cn', stmt: 'bs', name: '非流动资产合计',     aliases: '非流动资产总额',                          sort: 180, enabled: true, source: 'platform' },
    { id: 'subj-bs-19', standardId: 'std-cn', stmt: 'bs', name: '资产总计',           aliases: '总资产,资产合计,资产总额',                sort: 190, enabled: true, source: 'platform' },
    /* 流动负债 */
    { id: 'subj-bs-20', standardId: 'std-cn', stmt: 'bs', name: '短期借款',           aliases: '短期贷款,银行短贷',                       sort: 200, enabled: true, source: 'platform' },
    { id: 'subj-bs-21', standardId: 'std-cn', stmt: 'bs', name: '应付票据',           aliases: '商业承兑汇票,银行承兑汇票',               sort: 210, enabled: true, source: 'platform' },
    { id: 'subj-bs-22', standardId: 'std-cn', stmt: 'bs', name: '应付账款',           aliases: '供应商应付,应付供应商款',                 sort: 220, enabled: true, source: 'platform' },
    { id: 'subj-bs-23', standardId: 'std-cn', stmt: 'bs', name: '合同负债',           aliases: '预收账款,预收款项,预收货款',              sort: 230, enabled: true, source: 'platform' },
    { id: 'subj-bs-24', standardId: 'std-cn', stmt: 'bs', name: '应付职工薪酬',       aliases: '应付工资,员工薪酬',                       sort: 240, enabled: true, source: 'platform' },
    { id: 'subj-bs-25', standardId: 'std-cn', stmt: 'bs', name: '应交税费',           aliases: '应缴税款,税费应付',                       sort: 250, enabled: true, source: 'platform' },
    { id: 'subj-bs-26', standardId: 'std-cn', stmt: 'bs', name: '其他应付款',         aliases: '其他应付,关联方往来',                     sort: 260, enabled: true, source: 'platform' },
    { id: 'subj-bs-27', standardId: 'std-cn', stmt: 'bs', name: '流动负债合计',       aliases: '流动负债总额,流动负债',                   sort: 270, enabled: true, source: 'platform' },
    /* 非流动负债 */
    { id: 'subj-bs-28', standardId: 'std-cn', stmt: 'bs', name: '长期借款',           aliases: '长期贷款,银行长贷',                       sort: 280, enabled: true, source: 'platform' },
    { id: 'subj-bs-29', standardId: 'std-cn', stmt: 'bs', name: '应付债券',           aliases: '公司债,企业债',                           sort: 290, enabled: true, source: 'platform' },
    { id: 'subj-bs-30', standardId: 'std-cn', stmt: 'bs', name: '租赁负债',           aliases: '融资租赁负债,经营租赁负债',               sort: 300, enabled: true, source: 'platform' },
    { id: 'subj-bs-31', standardId: 'std-cn', stmt: 'bs', name: '递延所得税负债',     aliases: '递延税负债,DTL',                          sort: 310, enabled: true, source: 'platform' },
    { id: 'subj-bs-32', standardId: 'std-cn', stmt: 'bs', name: '非流动负债合计',     aliases: '非流动负债总额',                          sort: 320, enabled: true, source: 'platform' },
    { id: 'subj-bs-33', standardId: 'std-cn', stmt: 'bs', name: '负债合计',           aliases: '总负债,负债总额,负债总计',                sort: 330, enabled: true, source: 'platform' },
    /* 所有者权益 */
    { id: 'subj-bs-34', standardId: 'std-cn', stmt: 'bs', name: '实收资本',           aliases: '股本,注册资本,实缴资本',                  sort: 340, enabled: true, source: 'platform' },
    { id: 'subj-bs-35', standardId: 'std-cn', stmt: 'bs', name: '资本公积',           aliases: '资本溢价,股本溢价',                       sort: 350, enabled: true, source: 'platform' },
    { id: 'subj-bs-36', standardId: 'std-cn', stmt: 'bs', name: '盈余公积',           aliases: '法定公积金,任意公积金',                   sort: 360, enabled: true, source: 'platform' },
    { id: 'subj-bs-37', standardId: 'std-cn', stmt: 'bs', name: '未分配利润',         aliases: '留存收益,未分配利润（亏损）',             sort: 370, enabled: true, source: 'platform' },
    { id: 'subj-bs-38', standardId: 'std-cn', stmt: 'bs', name: '归属母公司所有者权益', aliases: '归母净资产,母公司权益',                sort: 380, enabled: true, source: 'platform' },
    { id: 'subj-bs-39', standardId: 'std-cn', stmt: 'bs', name: '少数股东权益',       aliases: '非控制性权益,少数权益',                   sort: 390, enabled: true, source: 'platform' },
    { id: 'subj-bs-40', standardId: 'std-cn', stmt: 'bs', name: '所有者权益合计',     aliases: '股东权益,净资产,权益合计',                sort: 400, enabled: true, source: 'platform' },

    /* ── 中国企业会计准则（通用）· 现金流量表 ── */
    { id: 'subj-cf-01', standardId: 'std-cn', stmt: 'cf', name: '销售商品收到的现金',       aliases: '经营收款,客户付款',                   sort: 10,  enabled: true, source: 'platform' },
    { id: 'subj-cf-02', standardId: 'std-cn', stmt: 'cf', name: '收到的税费返还',           aliases: '退税收入,税收返还',                   sort: 20,  enabled: true, source: 'platform' },
    { id: 'subj-cf-03', standardId: 'std-cn', stmt: 'cf', name: '经营活动现金流入小计',     aliases: '经营流入合计',                        sort: 30,  enabled: true, source: 'platform' },
    { id: 'subj-cf-04', standardId: 'std-cn', stmt: 'cf', name: '购买商品支付的现金',       aliases: '经营采购付款,供应商付款',             sort: 40,  enabled: true, source: 'platform' },
    { id: 'subj-cf-05', standardId: 'std-cn', stmt: 'cf', name: '支付给职工的现金',         aliases: '工资福利支出,薪酬现金支出',           sort: 50,  enabled: true, source: 'platform' },
    { id: 'subj-cf-06', standardId: 'std-cn', stmt: 'cf', name: '支付的各项税费',           aliases: '缴纳税款,税费支出',                   sort: 60,  enabled: true, source: 'platform' },
    { id: 'subj-cf-07', standardId: 'std-cn', stmt: 'cf', name: '经营活动现金流出小计',     aliases: '经营流出合计',                        sort: 70,  enabled: true, source: 'platform' },
    { id: 'subj-cf-08', standardId: 'std-cn', stmt: 'cf', name: '经营活动产生的现金流量净额', aliases: '经营现金流,CFO,经营活动净现金流', sort: 80,  enabled: true, source: 'platform' },
    { id: 'subj-cf-09', standardId: 'std-cn', stmt: 'cf', name: '收回投资收到的现金',       aliases: '投资回收,退出收款',                   sort: 90,  enabled: true, source: 'platform' },
    { id: 'subj-cf-10', standardId: 'std-cn', stmt: 'cf', name: '取得投资收益收到的现金',   aliases: '股息收入现金,分红收入',               sort: 100, enabled: true, source: 'platform' },
    { id: 'subj-cf-11', standardId: 'std-cn', stmt: 'cf', name: '投资活动现金流入小计',     aliases: '投资流入合计',                        sort: 110, enabled: true, source: 'platform' },
    { id: 'subj-cf-12', standardId: 'std-cn', stmt: 'cf', name: '购建固定资产支付的现金',   aliases: 'Capex,资本开支,购置固定资产',         sort: 120, enabled: true, source: 'platform' },
    { id: 'subj-cf-13', standardId: 'std-cn', stmt: 'cf', name: '对外投资支付的现金',       aliases: '对外投资,股权投资付款',               sort: 130, enabled: true, source: 'platform' },
    { id: 'subj-cf-14', standardId: 'std-cn', stmt: 'cf', name: '投资活动现金流出小计',     aliases: '投资流出合计',                        sort: 140, enabled: true, source: 'platform' },
    { id: 'subj-cf-15', standardId: 'std-cn', stmt: 'cf', name: '投资活动产生的现金流量净额', aliases: '投资现金流,CFI,投资活动净现金流', sort: 150, enabled: true, source: 'platform' },
    { id: 'subj-cf-16', standardId: 'std-cn', stmt: 'cf', name: '吸收投资收到的现金',       aliases: '融资收款,股权融资',                   sort: 160, enabled: true, source: 'platform' },
    { id: 'subj-cf-17', standardId: 'std-cn', stmt: 'cf', name: '取得借款收到的现金',       aliases: '银行借款流入,贷款收入',               sort: 170, enabled: true, source: 'platform' },
    { id: 'subj-cf-18', standardId: 'std-cn', stmt: 'cf', name: '筹资活动现金流入小计',     aliases: '筹资流入合计',                        sort: 180, enabled: true, source: 'platform' },
    { id: 'subj-cf-19', standardId: 'std-cn', stmt: 'cf', name: '偿还债务支付的现金',       aliases: '还款支出,偿债现金',                   sort: 190, enabled: true, source: 'platform' },
    { id: 'subj-cf-20', standardId: 'std-cn', stmt: 'cf', name: '分配股利利润支付的现金',   aliases: '分红支出,股利支付',                   sort: 200, enabled: true, source: 'platform' },
    { id: 'subj-cf-21', standardId: 'std-cn', stmt: 'cf', name: '筹资活动现金流出小计',     aliases: '筹资流出合计',                        sort: 210, enabled: true, source: 'platform' },
    { id: 'subj-cf-22', standardId: 'std-cn', stmt: 'cf', name: '筹资活动产生的现金流量净额', aliases: '融资现金流,CFF,筹资活动净现金流', sort: 220, enabled: true, source: 'platform' },
    { id: 'subj-cf-23', standardId: 'std-cn', stmt: 'cf', name: '现金及现金等价物净增加额', aliases: '现金净变动,现金增减净额',              sort: 230, enabled: true, source: 'platform' },
    { id: 'subj-cf-24', standardId: 'std-cn', stmt: 'cf', name: '期初现金及现金等价物余额', aliases: '期初现金,年初现金余额',               sort: 240, enabled: true, source: 'platform' },
    { id: 'subj-cf-25', standardId: 'std-cn', stmt: 'cf', name: '期末现金及现金等价物余额', aliases: '期末现金,年末现金余额',               sort: 250, enabled: true, source: 'platform' },

    /* ── 基金跟踪口径（基金跟踪字段，非企业会计三表） ── */
    { id: 'subj-int-2',  standardId: 'std-internal', stmt: 'fund', name: '管理费（累计）',       aliases: '管理费收入,mgmt fee,管理费',                      sort: 10,  enabled: true, source: 'platform' },
    { id: 'subj-int-3',  standardId: 'std-internal', stmt: 'fund', name: '已投资产总额',         aliases: '投资账面值,投资成本合计',                          sort: 20,  enabled: true, source: 'platform' },
    { id: 'subj-int-4',  standardId: 'std-internal', stmt: 'fund', name: '累计分配金额',         aliases: '分配总额,Distributions,累计分配',                 sort: 30,  enabled: true, source: 'platform' },
    { id: 'subj-int-5',  standardId: 'std-internal', stmt: 'fund', name: '认缴金额',             aliases: '基金承诺出资总额,认缴出资额,Commitment',           sort: 40,  enabled: true, source: 'platform' },
    { id: 'subj-int-6',  standardId: 'std-internal', stmt: 'fund', name: '累计实缴金额',         aliases: '实缴资本,已出资金额,Paid-in Capital',              sort: 50,  enabled: true, source: 'platform' },
    { id: 'subj-int-7',  standardId: 'std-internal', stmt: 'fund', name: '期末净资产（NAV）',     aliases: '资本账户余额,期末余额,基金净值,期末账户余额,NAV', sort: 60,  enabled: true, source: 'platform' },
    { id: 'subj-int-8',  standardId: 'std-internal', stmt: 'fund', name: '未缴款余额',           aliases: '未缴出资,认缴减实缴,未缴款',                      sort: 70,  enabled: true, source: 'platform' },
    { id: 'subj-int-9',  standardId: 'std-internal', stmt: 'fund', name: '投资比例（%）',        aliases: '出资占比,认缴占比,LP认缴比例',                      sort: 80,  enabled: true, source: 'platform' },
    { id: 'subj-int-9b', standardId: 'std-internal', stmt: 'fund', name: '投资进度（%）',        aliases: '已投进度,部署进度,投资进度',                      sort: 85,  enabled: true, source: 'platform' },
    { id: 'subj-int-10', standardId: 'std-internal', stmt: 'fund', name: '总退出金额',           aliases: '退出总额,累计退出,退出金额合计',                  sort: 90,  enabled: true, source: 'platform' },
    { id: 'subj-int-11', standardId: 'std-internal', stmt: 'fund', name: '业绩报酬（累计）',     aliases: 'Carry,业绩提成,业绩报酬',                        sort: 100, enabled: true, source: 'platform' },
    { id: 'subj-int-12', standardId: 'std-internal', stmt: 'fund', name: '已实现价值',           aliases: '已实现收益,Realized Value',                     sort: 110, enabled: true, source: 'platform' },
    { id: 'subj-int-13', standardId: 'std-internal', stmt: 'fund', name: '未实现价值',           aliases: '未实现收益,Unrealized Value',                   sort: 120, enabled: true, source: 'platform' },
    { id: 'subj-int-14', standardId: 'std-internal', stmt: 'fund', name: '投资成本（底层项目）', aliases: '项目投资成本,底层投资成本',                      sort: 130, enabled: true, source: 'platform' },
    { id: 'subj-int-15', standardId: 'std-internal', stmt: 'fund', name: '持股公允价值',         aliases: '公允价值,Fair Value,持仓公允价值',               sort: 140, enabled: true, source: 'platform' },
    { id: 'subj-int-16', standardId: 'std-internal', stmt: 'fund', name: '期初净资产',           aliases: '期初NAV,期初资本账户余额,期初余额',               sort: 150, enabled: true, source: 'platform' },
    { id: 'subj-int-17', standardId: 'std-internal', stmt: 'fund', name: '本期实缴',             aliases: '本期出资,当期实缴',                                sort: 160, enabled: true, source: 'platform' },
    { id: 'subj-int-18', standardId: 'std-internal', stmt: 'fund', name: '本期综合收益',         aliases: '本期收益,当期综合收益',                            sort: 170, enabled: true, source: 'platform' },
    { id: 'subj-int-19', standardId: 'std-internal', stmt: 'fund', name: '本期分配',             aliases: '本期分配金额,当期分配',                            sort: 180, enabled: true, source: 'platform' },

    /* ── IFRS 国际准则 ── */
    /* IFRS 已从平台预置移除；历史子项见 migrateRemoveIfrsV8 */  ];

  var SEED_INDICATOR_SETS = [
    { id: 'iset-1', name: '直投企业财务分析指标集', description: '适用于直投被投企业的财务健康与成长监控，覆盖成长性、盈利能力、偿债能力、资产质量维度', standardId: 'std-cn',       source: 'platform', sort: 10, enabled: true, createdAt: '2026-08-01 09:00', createdBy: '平台预置', updatedAt: '2026-08-03 14:20', updatedBy: '平台预置' },
    { id: 'iset-2', name: 'PE/VC 基金投后监控指标集', description: '适用于子基金投后监控的核心基金绩效指标，覆盖回报水平（DPI/TVPI/RVPI/MOIC/IRR）、资本部署进度与风险分布', standardId: 'std-internal', source: 'platform', sort: 20, enabled: true, createdAt: '2026-08-01 09:00', createdBy: '平台预置', updatedAt: '2026-08-07 16:00', updatedBy: '平台预置' },
  ];

  var SEED_INDICATORS = [
    { id: 'ind-1', setId: 'iset-1', name: '营收同比增速',     category: '成长性',   description: '本期营收相较上一同期的增长率',               direction: 'up',   threshold: '< -20%',            enabled: true },
    { id: 'ind-2', setId: 'iset-1', name: '毛利率',           category: '盈利能力', description: '毛利润 / 营业收入 × 100%',                  direction: 'down', threshold: '< 15%',             enabled: true },
    { id: 'ind-3', setId: 'iset-1', name: '净利润率',         category: '盈利能力', description: '净利润 / 营业收入 × 100%',                  direction: 'down', threshold: '< 5%',              enabled: true },
    { id: 'ind-4', setId: 'iset-1', name: '资产负债率',       category: '偿债能力', description: '负债合计 / 资产总计 × 100%',                direction: 'up',   threshold: '> 70%',             enabled: true },
    { id: 'ind-5', setId: 'iset-1', name: '应收账款增速',     category: '资产质量', description: '应收账款环比/同比增速，与营收增速对比',        direction: 'up',   threshold: '> 营收增速 × 1.5', enabled: true },
    { id: 'ind-6', setId: 'iset-1', name: '存货增速',         category: '资产质量', description: '存货环比/同比增速，与营收增速对比',            direction: 'up',   threshold: '> 营收增速 × 2',   enabled: true },
    { id: 'ind-7', setId: 'iset-1', name: '经营现金流覆盖比', category: '现金质量', description: '经营活动现金流量净额 / 净利润',               direction: 'down', threshold: '< 0.5',             enabled: true },
    { id: 'ind-8',  setId: 'iset-1', name: '净利润波动率',     category: '成长性',   description: '最近 N 期净利润标准差 / 均值，衡量盈利稳定性',    direction: 'up',   threshold: '> 50%',             enabled: false },
    { id: 'ind-15', setId: 'iset-1', name: 'ROE',             category: '盈利能力', description: '净利润 / 所有者权益合计 × 100%',                   direction: 'down', threshold: '< 8%',              enabled: true },
    { id: 'ind-16', setId: 'iset-1', name: 'EBITDA 利润率',   category: '盈利能力', description: 'EBITDA / 营业收入 × 100%',                        direction: 'down', threshold: '< 10%',             enabled: true },
    { id: 'ind-17', setId: 'iset-1', name: '流动比率',         category: '偿债能力', description: '流动资产合计 / 流动负债合计',                      direction: 'down', threshold: '< 1.2',             enabled: true },
    { id: 'ind-18', setId: 'iset-1', name: '速动比率',         category: '偿债能力', description: '(流动资产合计 − 存货) / 流动负债合计',             direction: 'down', threshold: '< 0.8',             enabled: true },
    { id: 'ind-19', setId: 'iset-1', name: '利息保障倍数',     category: '偿债能力', description: '息税前利润 / 利息费用，衡量债务偿付安全垫',         direction: 'down', threshold: '< 2',               enabled: true },
    /* PE/VC 基金指标集（iset-2 · 基金跟踪口径） */
    { id: 'ind-9',  setId: 'iset-2', name: 'DPI',                    category: '现金质量', description: '累计分配金额 / 累计实缴金额',                                                         direction: 'down', threshold: '< 0.5',  enabled: true },
    { id: 'ind-10', setId: 'iset-2', name: 'TVPI',                   category: '现金质量', description: '(期末净资产（NAV） + 累计分配金额) / 累计实缴金额',                                     direction: 'down', threshold: '< 1.0',  enabled: true },
    { id: 'ind-11', setId: 'iset-2', name: '出资人 IRR（本机构 LP）', category: '盈利能力', description: '本机构作为 LP 的出资人口径 IRR：基于对本基金的实缴与分配现金流序列计算的内部收益率', direction: 'down', threshold: '< 8%',   enabled: true },
    { id: 'ind-12', setId: 'iset-2', name: '实缴进度',               category: '资产质量', description: '累计实缴金额 / 认缴金额 × 100%',                                                      direction: 'none', threshold: '',        enabled: true },
    { id: 'ind-13', setId: 'iset-2', name: '亏损项目占比',           category: '资产质量', description: '当期账面亏损项目数 / 被投项目总数 × 100%',                                            direction: 'up',   threshold: '> 20%',  enabled: true },
    { id: 'ind-14', setId: 'iset-2', name: '管理费增速',             category: '成长性',   description: '本期管理费（累计）环比增速，衡量 GP 管理费规模变化',                                             direction: 'down', threshold: '< -10%', enabled: false },
    { id: 'ind-20', setId: 'iset-2', name: 'RVPI',                   category: '资产质量', description: '期末净资产（NAV） / 累计实缴金额，衡量剩余价值倍数',                                  direction: 'none', threshold: '',       enabled: true },
    { id: 'ind-21', setId: 'iset-2', name: 'NAV 增速',               category: '成长性',   description: '期末净资产（NAV）相较上期增速',                                                      direction: 'down', threshold: '< -15%', enabled: true },
    { id: 'ind-22', setId: 'iset-2', name: '管理费率',               category: '盈利能力', description: '管理费（累计） / 认缴金额 × 100%，衡量 GP 管理成本水平',                             direction: 'up',   threshold: '> 3%',   enabled: true },
    { id: 'ind-23', setId: 'iset-2', name: '项目集中度',             category: '资产质量', description: '前三大项目投资成本之和 / 已投资产总额 × 100%',                                        direction: 'up',   threshold: '> 60%',  enabled: false },
    { id: 'ind-24', setId: 'iset-2', name: 'MOIC（基金层）',         category: '现金质量', description: '(已实现价值 + 未实现价值) / 已投资产总额；若未实现价值缺失可用持股公允价值近似总价值', direction: 'down', threshold: '< 1.0',  enabled: true },
    { id: 'ind-25', setId: 'iset-2', name: '未缴款余额',             category: '资产质量', description: '认缴金额 − 累计实缴金额',                                                            direction: 'up',   threshold: '',       enabled: true },
  ];

  var SEED_CHECKS = [
    /* 中国准则 —— 表内平衡 / 跨表勾稽 / 阈值 */
    { id: 'chk-cn-1', standardId: 'std-cn', name: '资产=负债+权益',            type: 'balance',   stmt: 'bs',    formula: '资产总计 = 负债合计 + 所有者权益合计',              severity: 'critical', enabled: true },
    { id: 'chk-cn-2', standardId: 'std-cn', name: '收入-成本-费用=净利润',      type: 'balance',   stmt: 'is',    formula: '营业收入 − 营业成本 − 税金及附加 − 期间费用 = 净利润', severity: 'critical', enabled: true },
    { id: 'chk-cn-3', standardId: 'std-cn', name: '经营现金流勾稽',            type: 'balance',   stmt: 'cf',    formula: '经营流入 − 经营流出 = 经营活动现金流量净额',          severity: 'critical', enabled: true },
    { id: 'chk-cn-4', standardId: 'std-cn', name: '跨表勾稽：净利润→未分配利润', type: 'cross',     stmt: 'is→bs', formula: '利润表净利润 = 资产负债表未分配利润本期增加',         severity: 'critical', enabled: true },
    { id: 'chk-cn-5', standardId: 'std-cn', name: '跨表勾稽：现金流净额',        type: 'cross',     stmt: 'cf→bs', formula: '现金净增加额 = 货币资金期末 − 期初',                  severity: 'critical', enabled: true },
    { id: 'chk-cn-6', standardId: 'std-cn', name: '变动阈值预警',              type: 'threshold', stmt: 'all',   formula: '同科目环比变动超 ±20% 标记差异',                     severity: 'warn',     enabled: true },
    /* 基金跟踪口径 */
    { id: 'chk-int-1', standardId: 'std-internal', name: '已投资产=各项目投资成本合计', type: 'balance', stmt: 'fund', formula: '已投资产总额 = Σ 各底层项目投资成本', severity: 'critical', enabled: true },
    { id: 'chk-int-2', standardId: 'std-internal', name: 'DPI 勾稽',              type: 'cross',   stmt: 'fund', formula: '累计分配金额 / 累计实缴金额 = DPI',    severity: 'warn',     enabled: true },
    { id: 'chk-int-3', standardId: 'std-internal', name: 'TVPI 勾稽',             type: 'cross',   stmt: 'fund', formula: '(期末净资产（NAV） + 累计分配金额) / 累计实缴金额 = TVPI', severity: 'warn', enabled: true },
    { id: 'chk-int-4', standardId: 'std-internal', name: '资本账户滚动',           type: 'balance', stmt: 'fund', formula: '期末净资产（NAV） = 期初净资产 + 本期实缴 + 本期综合收益 − 本期分配', severity: 'warn', enabled: true },
  ];

  var SEED_PARSE_TEMPLATES = [
    { id: 'tpl-1', name: 'PE/VC 所投子基金档案配置',         description: '子基金 GP 季报解析：基金层（基础信息、当期表现、本机构 LP 出资与分配）＋底层→穿透字段；上传归属为本基金，底层同步穿透档案', source: 'platform', objectType: 'subFund', sort: 10, enabled: true, createdAt: '2026-08-01 09:00', createdBy: '平台预置', updatedAt: '2026-08-08 11:30', updatedBy: '平台预置' },
    { id: 'tpl-2', name: '直投企业档案配置',                 description: '直投被投企业档案：企业概况、持仓摘要、关键约定与业务进展（财务三表走准则科目，不进本清单）', source: 'platform', objectType: 'direct',  sort: 20, enabled: true, createdAt: '2026-08-01 09:00', createdBy: '平台预置', updatedAt: '2026-08-07 15:00', updatedBy: '平台预置' },
    { id: 'tpl-3', name: '本机构管理基金（母基金）档案配置', description: '本机构管理基金档案：基金概况与最新表现（向子基金出资／分配写入流水壳，不进本清单）', source: 'platform', objectType: 'fund',   sort: 30, enabled: true, createdAt: '2026-08-01 09:00', createdBy: '平台预置', updatedAt: '2026-08-07 15:00', updatedBy: '平台预置' },
  ];

  var SEED_FIELDS = [
    { id: 'fld-d01', templateId: 'tpl-2', name: '企业名称', group: '企业概况', module: '企业概况', tab: '概览', sourceType: '工商档案,营业执照', aliases: '公司名称,被投企业全称', priority: 'AI识别+关联匹配', method: 'ai', updateMode: 'first', landing: 'T2.companies.企业完整名称', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d02', templateId: 'tpl-2', name: '统一社会信用代码', group: '企业概况', module: '企业概况', tab: '概览', sourceType: '工商档案,营业执照', aliases: '信用代码', priority: 'AI提取+正则校验', method: 'ai', updateMode: 'first', landing: 'T2.companies.统一社会信用代码', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d03', templateId: 'tpl-2', name: '成立日期', group: '企业概况', module: '企业概况', tab: '概览', sourceType: '工商档案,营业执照', aliases: '注册日期', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T2.companies.成立日期', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d04', templateId: 'tpl-2', name: '注册资本', group: '企业概况', module: '企业概况', tab: '概览', sourceType: '工商档案,营业执照', aliases: '注册资金', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T2.companies.注册资本', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d05', templateId: 'tpl-2', name: '经营状态', group: '企业概况', module: '企业概况', tab: '概览', sourceType: '工商档案', aliases: '存续状态', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T2.companies.经营状态', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d06', templateId: 'tpl-2', name: '注册地', group: '企业概况', module: '企业概况', tab: '概览', sourceType: '工商档案', aliases: '注册地址', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T2.companies.注册地', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d07', templateId: 'tpl-2', name: '所属行业', group: '企业概况', module: '企业概况', tab: '概览', sourceType: 'GP季报,工商', aliases: '行业分类', priority: 'AI模糊匹配', method: 'ai', updateMode: 'always', landing: 'T5.holdings.行业分类', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d08', templateId: 'tpl-2', name: '主营业务', group: '企业概况', module: '企业概况', tab: '概览', sourceType: 'GP季报', aliases: '业务描述', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T2.companies.主营业务', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d09', templateId: 'tpl-2', name: '投资成本', group: '当前投资概览', module: '当前投资概览', tab: '概览', sourceType: '投资协议,GP季报', aliases: '投资本金', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.投资金额(投资本金)', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d10', templateId: 'tpl-2', name: '当前价值', group: '当前投资概览', module: '当前投资概览', tab: '概览', sourceType: '系统计算', aliases: '项目公允价值', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T5.holdings.总价值', objectType: 'direct', aiParse: false, formula: '已实现＋未实现', enabled: true },
    { id: 'fld-d11', templateId: 'tpl-2', name: '持股比例（摘要）', group: '当前投资概览', module: '当前投资概览', tab: '概览', sourceType: 'GP季报', aliases: '持股比例', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.最新持股比例', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d12', templateId: 'tpl-2', name: '退出状态（摘要）', group: '当前投资概览', module: '当前投资概览', tab: '概览', sourceType: 'GP季报', aliases: '在管/部分退出/完全退出', priority: 'AI推断', method: 'ai', updateMode: 'always', landing: 'T5.holdings.退出状态', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d13', templateId: 'tpl-2', name: '首次投资日期', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: 'GP季报', aliases: '投资日期', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T5.holdings.首次投资日期', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d14', templateId: 'tpl-2', name: '投资轮次', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: 'GP季报', aliases: '轮次', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.首次投资轮次', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d15', templateId: 'tpl-2', name: '最新投后估值', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: '后续轮融资材料', aliases: '投后估值', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.最新投后估值', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d16', templateId: 'tpl-2', name: '最新持股比例', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: '后续轮融资材料,GP季报', aliases: '持股比例', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.最新持股比例', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d17', templateId: 'tpl-2', name: '剩余投资成本', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: 'GP季报', aliases: '剩余成本', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.剩余投资成本', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d18', templateId: 'tpl-2', name: '已实现价值', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: 'GP季报', aliases: '已实现', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.已退出金额', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d19', templateId: 'tpl-2', name: '未实现价值', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: 'GP季报', aliases: '未退出价值', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T5.holdings.持股公允价值(未退出)', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d20', templateId: 'tpl-2', name: '项目公允价值', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: '系统计算', aliases: '已实现+未实现', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T5.holdings.总价值', objectType: 'direct', aiParse: false, formula: '已实现＋未实现', enabled: true },
    { id: 'fld-d21', templateId: 'tpl-2', name: '回报倍数', group: '持仓信息', module: '持仓信息', tab: '投资与股权', sourceType: '系统计算', aliases: '公允/投资本金', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T5.holdings.回报倍数', objectType: 'direct', aiParse: false, formula: '公允价值÷投资本金', enabled: true },
    { id: 'fld-d22', templateId: 'tpl-2', name: '反稀释条款', group: '关键约定', module: '关键约定', tab: '投资与股权', sourceType: '投资协议', aliases: '反稀释', priority: 'AI提取', method: 'ai', updateMode: 'first', landing: 'T22.deal_terms.反稀释', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d23', templateId: 'tpl-2', name: '优先清算', group: '关键约定', module: '关键约定', tab: '投资与股权', sourceType: '投资协议', aliases: '清算优先权', priority: 'AI提取', method: 'ai', updateMode: 'first', landing: 'T22.deal_terms.优先清算', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d24', templateId: 'tpl-2', name: '回购权', group: '关键约定', module: '关键约定', tab: '投资与股权', sourceType: '投资协议', aliases: '回购条款', priority: 'AI提取', method: 'ai', updateMode: 'first', landing: 'T22.deal_terms.回购', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d25', templateId: 'tpl-2', name: '董事席位', group: '关键约定', module: '关键约定', tab: '投资与股权', sourceType: '投资协议', aliases: '董事会席位', priority: 'AI提取', method: 'ai', updateMode: 'first', landing: 'T22.deal_terms.董事席位', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d26', templateId: 'tpl-2', name: '业务进展', group: '业务进展', module: '业务进展', tab: '经营情况', sourceType: 'GP季报', aliases: '经营进展', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T7.holding_snapshots.业务进展', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d27', templateId: 'tpl-2', name: '退出规划', group: '业务进展', module: '业务进展', tab: '经营情况', sourceType: 'GP季报', aliases: '退出安排', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T7.holding_snapshots.退出规划', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-d28', templateId: 'tpl-2', name: '拟IPO项目时间预期', group: '业务进展', module: '业务进展', tab: '经营情况', sourceType: 'GP季报', aliases: '拟IPO', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T7.holding_snapshots.拟IPO项目时间预期', objectType: 'direct', aiParse: true, enabled: true },
    { id: 'fld-130', templateId: 'tpl-1', name: '基金简称', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '基金名称,子基金简称', priority: 'AI识别+归属匹配', method: 'ai', updateMode: 'first', landing: 'T1.funds.基金简称', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-131', templateId: 'tpl-1', name: '基金全称', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '基金主体全称', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.基金全称', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-132', templateId: 'tpl-1', name: '基金管理人', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: 'GP名称', priority: 'AI识别', method: 'ai', updateMode: 'first', landing: 'T1.funds→T4.managers', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-133', templateId: 'tpl-1', name: '基金备案编号', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '基金编码,备案号', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.备案编号', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-133b', templateId: 'tpl-1', name: '基金管理人备案号', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '管理人备案号', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T4.managers.备案编号', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-134', templateId: 'tpl-1', name: '基金注册地', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报,工商', aliases: '注册地址', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.注册地', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-135', templateId: 'tpl-1', name: '基金成立日期', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '成立日', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.成立日期', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-136', templateId: 'tpl-1', name: '投资期', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '投资期起止', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.投资期', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-211a', templateId: 'tpl-1', name: '投资期到期日', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '投资期末日', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.投资期到期日', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-137', templateId: 'tpl-1', name: '基金存续期', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '存续期,期限结构', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.存续期', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-138', templateId: 'tpl-1', name: '投资方向', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '投资策略,投资主题', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.投资方向', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-139', templateId: 'tpl-1', name: '主要投资阶段', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '早期/VC/PE', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.主要投资阶段', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-140', templateId: 'tpl-1', name: '团队核心成员', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '核心团队', priority: 'AI摘要', method: 'ai', updateMode: 'first', landing: 'T1.funds.核心成员/团队', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-228a', templateId: 'tpl-1', name: '基金内部编号', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: '内部财务表', aliases: '内部编号', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T1.funds.内部编号', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-141', templateId: 'tpl-1', name: '基金认缴金额（本基金主体）', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '本基金主体认缴', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.基金认缴金额（本基金主体）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-142', templateId: 'tpl-1', name: '基金认缴金额（基金合计）', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '平行基金合计认缴', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.基金认缴金额(基金合计)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-143', templateId: 'tpl-1', name: '基金实缴金额（本基金主体）', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '本基金主体实缴', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.基金实缴金额（本基金主体）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-212a', templateId: 'tpl-1', name: '基金实缴金额（基金合计）', group: '基金概况', module: '基金概况', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '平行基金合计实缴', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.基金实缴金额(基金合计)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-150', templateId: 'tpl-1', name: '本机构认缴金额', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '资本账户表,内部财务表', aliases: '众源认缴金额,本机构认缴', priority: '直接提取', method: 'ai', updateMode: 'first', landing: 'T8.capital_accounts.认缴金额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-151', templateId: 'tpl-1', name: '本机构认缴比例', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '系统计算', aliases: '众源认缴比例,认缴比例', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T8.capital_accounts.认缴比例（%）', objectType: 'subFund', aiParse: false, formula: '本机构认缴÷基金认缴合计', enabled: true },
    { id: 'fld-152', templateId: 'tpl-1', name: '本机构实缴金额', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '资本账户表,内部财务表', aliases: '众源实缴金额', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T8.capital_accounts.实缴金额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-208a', templateId: 'tpl-1', name: '未缴款余额', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '系统计算', aliases: '未call', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T8.capital_accounts.未缴款余额', objectType: 'subFund', aiParse: false, formula: '认缴−实缴', enabled: true },
    { id: 'fld-153', templateId: 'tpl-1', name: '累计分配金额', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '资本账户表,分配通知', aliases: '众源累计分配金额,累计分配', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T8.capital_accounts.累计分配金额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-154', templateId: 'tpl-1', name: '资本账户期末余额', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '资本账户表', aliases: '众源母基金资本账户余额,归属于本合伙人的净资产', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T8.capital_accounts.期末余额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-155', templateId: 'tpl-1', name: '本机构TVPI', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '系统计算', aliases: '众源母基金TVPI,TVPI', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T8.capital_accounts.TVPI(本机构口径)', objectType: 'subFund', aiParse: false, formula: '(累计分配＋期末余额)÷实缴', enabled: true },
    { id: 'fld-156', templateId: 'tpl-1', name: '本机构DPI', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: '系统计算', aliases: '众源母基金DPI,DPI', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T8.capital_accounts.DPI(本机构口径)', objectType: 'subFund', aiParse: false, formula: '累计分配÷实缴', enabled: true },
    { id: 'fld-148', templateId: 'tpl-1', name: 'MOIC（基金-GP报告值）', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '回报倍数,Money Multiple', priority: 'AI+别名归一', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.MOIC(基金-GP报告值)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-188', templateId: 'tpl-1', name: 'TVPI（基金-GP报告值）', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: '总价值倍数', priority: 'AI+别名归一', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.TVPI(基金-GP报告值)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-229a', templateId: 'tpl-1', name: 'DPI（基金-GP报告值）', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: 'DPI(GP),基金DPI', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.DPI(基金-GP报告值)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-149', templateId: 'tpl-1', name: 'GP报告IRR', group: '本机构出资口径', module: '本机构出资口径', tab: '概览', layer: 'fundLayer', sourceType: 'GP季报', aliases: 'IRR,内部收益率', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.GP报告IRR', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-210a', templateId: 'tpl-1', name: '报告截止日', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '报告期截止日', priority: 'AI提取+确认', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.期间值', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-214a', templateId: 'tpl-1', name: '投资比例', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: '系统计算', aliases: '投放进度,总投资/基金认缴', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T6.fund_snapshots.投资比例（%）', objectType: 'subFund', aiParse: false, formula: '总投资金额÷基金认缴金额（本基金主体）', enabled: true },
    { id: 'fld-189', templateId: 'tpl-1', name: '管理费（本期）', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '本期管理费', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.管理费（本期）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-190', templateId: 'tpl-1', name: '管理费（累计）', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '累计管理费', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.管理费（累计）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-191', templateId: 'tpl-1', name: '业绩报酬（累计）', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: 'Carry,业绩报酬', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.业绩报酬（累计）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-192', templateId: 'tpl-1', name: '新增后续轮融资个数', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '后续轮融资个数', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.新增后续轮融资个数', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-193', templateId: 'tpl-1', name: '资产配置摘要', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '资产配置', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.资产配置(文本摘要)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-144', templateId: 'tpl-1', name: '已投项目数', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '投资数量', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.已投项目数', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-145', templateId: 'tpl-1', name: '总投资金额', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '投资金额,投资成本', priority: 'AI+别名归一', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.总投资金额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-146', templateId: 'tpl-1', name: '完全退出项目数量', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '完全退出数', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.完全退出项目数', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-147', templateId: 'tpl-1', name: '部分退出项目数量', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '部分退出数', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.部分退出项目数', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-213a', templateId: 'tpl-1', name: '总退出金额', group: '当期表现', module: '当期表现', tab: '期间表现', layer: 'fundLayer', sourceType: 'GP季报', aliases: '总退出金额（万元）', priority: '直接提取', method: 'ai', updateMode: 'always', landing: 'T6.fund_snapshots.总退出金额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-170', templateId: 'tpl-1', name: '项目简称', group: '底层→穿透', module: '企业概况', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '被投企业名称', priority: 'AI识别+关联匹配', method: 'ai', updateMode: 'always', landing: 'T5.holdings.company_id→T2.companies', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-171', templateId: 'tpl-1', name: '项目工商全称', group: '底层→穿透', module: '企业概况', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '企业全称', priority: '直接提取', method: 'direct', updateMode: 'first', landing: 'T2.companies.企业完整名称', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-194', templateId: 'tpl-1', name: '注册地', group: '底层→穿透', module: '企业概况', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '省市区地址', priority: '直接提取', method: 'direct', updateMode: 'first', landing: 'T2.companies.注册地', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-172', templateId: 'tpl-1', name: '所属行业', group: '底层→穿透', module: '企业概况', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '行业分类', priority: 'AI模糊匹配', method: 'ai', updateMode: 'always', landing: 'T5.holdings.行业分类', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-197', templateId: 'tpl-1', name: '细分行业', group: '底层→穿透', module: '企业概况', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '子行业', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.细分行业', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-198', templateId: 'tpl-1', name: '主营业务', group: '底层→穿透', module: '企业概况', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '业务描述', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T2.companies.主营业务', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-180', templateId: 'tpl-1', name: '退出状态（摘要）', group: '底层→穿透', module: '当前投资概览', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '在管/部分退出/完全退出', priority: 'AI推断', method: 'ai', updateMode: 'always', landing: 'T5.holdings.退出状态', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-176s', templateId: 'tpl-1', name: '剩余投资成本（摘要）', group: '底层→穿透', module: '当前投资概览', tab: '概览', layer: 'lookthrough', sourceType: 'GP季报', aliases: '剩余成本', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.剩余投资成本', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-217s', templateId: 'tpl-1', name: '项目公允价值（摘要）', group: '底层→穿透', module: '当前投资概览', tab: '概览', layer: 'lookthrough', sourceType: '系统计算', aliases: '已实现+未实现', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T5.holdings.总价值', objectType: 'subFund', aiParse: false, formula: '已实现＋未实现', enabled: true },
    { id: 'fld-174', templateId: 'tpl-1', name: '首次投资日期', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '投资日期', priority: '直接提取', method: 'direct', updateMode: 'first', landing: 'T5.holdings.首次投资日期', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-173', templateId: 'tpl-1', name: '投资轮次', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '轮次', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.首次投资轮次', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-199', templateId: 'tpl-1', name: '领投者', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: '投资协议,GP季报', aliases: '是否领投', priority: '人工确认', method: 'manual', updateMode: 'first', landing: 'T5.holdings.领投者', objectType: 'subFund', aiParse: false, enabled: true },
    { id: 'fld-200', templateId: 'tpl-1', name: '项目负责人', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '主管合伙人', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.主管合伙人', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-175', templateId: 'tpl-1', name: '投资金额（投资本金）', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '投资成本,投资总额', priority: 'AI+别名归一', method: 'ai', updateMode: 'always', landing: 'T5.holdings.投资金额(投资本金)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-225a', templateId: 'tpl-1', name: '平行基金合计投资金额', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '基金合计投资金额', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.平行基金合计投资金额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-176', templateId: 'tpl-1', name: '剩余投资成本', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '剩余成本', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.剩余投资成本', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-177', templateId: 'tpl-1', name: '最新持股比例', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '持股比例', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.最新持股比例', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-178', templateId: 'tpl-1', name: '已实现价值', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '已实现', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.已退出金额', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-179', templateId: 'tpl-1', name: '未实现价值', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '公允价值,未退出价值', priority: 'AI+别名归一', method: 'ai', updateMode: 'always', landing: 'T5.holdings.持股公允价值(未退出)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-217a', templateId: 'tpl-1', name: '项目公允价值', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: '系统计算', aliases: '已实现+未实现', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T5.holdings.总价值', objectType: 'subFund', aiParse: false, formula: '已实现＋未实现', enabled: true },
    { id: 'fld-218a', templateId: 'tpl-1', name: '回报倍数', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: '系统计算', aliases: '项目MOIC', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T5.holdings.回报倍数', objectType: 'subFund', aiParse: false, formula: '公允÷投资本金', enabled: true },
    { id: 'fld-201a', templateId: 'tpl-1', name: '当期公允价值变动', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: '系统计算', aliases: '公允价值变动', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'T7.holding_snapshots.公允价值变动', objectType: 'subFund', aiParse: false, formula: '本季公允−上季公允', enabled: true },
    { id: 'fld-231a', templateId: 'tpl-1', name: '最新投后估值', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报,后续轮融资材料', aliases: '投后估值,公司最新投后估值', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.最新投后估值', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-181', templateId: 'tpl-1', name: '确权情况', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '已确权/未确权', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.确权情况', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-182', templateId: 'tpl-1', name: '投资方式', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '增资/受让/可转债', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T5.holdings.投资方式', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-183', templateId: 'tpl-1', name: '是否有后续轮融资', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报,后续轮融资材料', aliases: '后续融资Y/N', priority: 'AI推断', method: 'ai', updateMode: 'always', landing: 'T7.holding_snapshots.是否有后续融资（期末）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-184', templateId: 'tpl-1', name: '最新一轮融资日期', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: '后续轮融资材料', aliases: '融资日期', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T7.holding_snapshots.最新融资日期（期末）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-185', templateId: 'tpl-1', name: '最新一轮融资估值', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: '后续轮融资材料', aliases: '融资估值', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T7.holding_snapshots.最新融资估值（期末）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-220a', templateId: 'tpl-1', name: '最新一轮融资后持股比例', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报,后续轮融资材料', aliases: '融资后持股', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T7.holding_snapshots.融资后持股比例（期末）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-205a', templateId: 'tpl-1', name: '退出时间', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '退出日期', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T7.holding_snapshots.退出时间（期末）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-206a', templateId: 'tpl-1', name: '退出方式', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '退出类型', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T7.holding_snapshots.退出方式（期末）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-207a', templateId: 'tpl-1', name: '退出金额', group: '底层→穿透', module: '持仓信息', tab: '投资与股权', layer: 'lookthrough', sourceType: 'GP季报', aliases: '退出金额（万）', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T7.holding_snapshots.退出金额（期末）', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-186', templateId: 'tpl-1', name: '业务进展', group: '底层→穿透', module: '业务进展', tab: '经营情况', layer: 'lookthrough', sourceType: 'GP季报', aliases: '经营进展', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T7.holding_snapshots.业务进展', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-187', templateId: 'tpl-1', name: '退出规划', group: '底层→穿透', module: '业务进展', tab: '经营情况', layer: 'lookthrough', sourceType: 'GP季报', aliases: '退出安排', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T7.holding_snapshots.退出规划', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-221a', templateId: 'tpl-1', name: '后续融资情况', group: '底层→穿透', module: '业务进展', tab: '经营情况', layer: 'lookthrough', sourceType: 'GP季报', aliases: '后续融资进展', priority: 'AI提取', method: 'ai', updateMode: 'always', landing: 'T7.holding_snapshots.后续融资情况', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-203a', templateId: 'tpl-1', name: '关键经营指标（收入）', group: '底层→穿透', module: '业务进展', tab: '经营情况', layer: 'lookthrough', sourceType: 'GP季报', aliases: '收入', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T12.business_metrics(营业收入)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-204a', templateId: 'tpl-1', name: '关键经营指标（净利润）', group: '底层→穿透', module: '业务进展', tab: '经营情况', layer: 'lookthrough', sourceType: 'GP季报', aliases: '净利润', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T12.business_metrics(净利润)', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-230a', templateId: 'tpl-1', name: '拟IPO项目时间预期', group: '底层→穿透', module: '业务进展', tab: '经营情况', layer: 'lookthrough', sourceType: 'GP季报', aliases: '拟IPO', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T7.holding_snapshots.拟IPO项目时间预期', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-202a', templateId: 'tpl-1', name: '项目状态备注', group: '底层→穿透', module: '业务进展', tab: '经营情况', layer: 'lookthrough', sourceType: 'GP季报', aliases: '状态备注', priority: 'AI摘要', method: 'ai', updateMode: 'always', landing: 'T5.holdings.项目状态备注', objectType: 'subFund', aiParse: true, enabled: true },
    { id: 'fld-308', templateId: 'tpl-3', name: '母基金名称', group: '基金概况', module: '基金概况', tab: '概览', sourceType: '内部维护', aliases: '基金名称', priority: '直接提取', method: 'direct', updateMode: 'first', landing: 'T1.funds.基金名称', objectType: 'fund', aiParse: true, enabled: true },
    { id: 'fld-301', templateId: 'tpl-3', name: '基金内部编号', group: '基金概况', module: '基金概况', tab: '概览', sourceType: '内部财务表', aliases: '内部编号', priority: '直接提取', method: 'direct', updateMode: 'first', landing: 'T1.funds.内部编号', objectType: 'fund', aiParse: true, enabled: true },
    { id: 'fld-309', templateId: 'tpl-3', name: '管理人', group: '基金概况', module: '基金概况', tab: '概览', sourceType: '内部维护', aliases: 'GP,管理人', priority: '直接提取', method: 'direct', updateMode: 'first', landing: 'T1.funds→T4.managers', objectType: 'fund', aiParse: true, enabled: true },
    { id: 'fld-302', templateId: 'tpl-3', name: '投资策略', group: '基金概况', module: '基金概况', tab: '概览', sourceType: '内部维护', aliases: '直投/母基金/混合', priority: '人工确认', method: 'manual', updateMode: 'first', landing: 'T1.funds.策略', objectType: 'fund', aiParse: false, enabled: true },
    { id: 'fld-310', templateId: 'tpl-3', name: '母基金认缴金额', group: '基金概况', module: '基金概况', tab: '概览', sourceType: '内部财务表', aliases: '认缴金额', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T1.funds.认缴金额', objectType: 'fund', aiParse: true, enabled: true },
    { id: 'fld-311', templateId: 'tpl-3', name: '母基金实缴金额', group: '基金概况', module: '基金概况', tab: '概览', sourceType: '内部财务表', aliases: '实缴金额', priority: '直接提取', method: 'direct', updateMode: 'always', landing: 'T1.funds.实缴金额', objectType: 'fund', aiParse: true, enabled: true },
    { id: 'fld-316', templateId: 'tpl-3', name: '直投项目数', group: '最新表现', module: '最新表现', tab: '概览', sourceType: '系统计算', aliases: '直接投资数', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'AGG.直投项目数', objectType: 'fund', aiParse: false, formula: 'COUNT(直接投资)', enabled: true },
    { id: 'fld-317', templateId: 'tpl-3', name: '所投子基金数', group: '最新表现', module: '最新表现', tab: '概览', sourceType: '系统计算', aliases: '子基金数', priority: '系统计算', method: 'compute', updateMode: 'always', landing: 'AGG.所投子基金数', objectType: 'fund', aiParse: false, formula: 'COUNT(所投子基金)', enabled: true },
  ];

  /* 落点候选（数据模型 §二十二 字段清单，与《文件解析字段映射》Excel 同源） */
  var LANDING_OPTIONS = [
    { value: 'T1.funds.内部编号', tab: '期间表现' },
    { value: 'T1.funds.基金名称', tab: '期间表现' },
    { value: 'T1.funds→T4.managers', tab: '期间表现' },
    { value: 'T10.investment_events.事件日期', tab: '投资与股权' },
    { value: 'T10.investment_events.事件类型(枚举=后续轮融资)', tab: '投资与股权' },
    { value: 'T10.investment_events.备注/长文本', tab: '投资与股权' },
    { value: 'T10.investment_events.金额(数值)', tab: '投资与股权' },
    { value: 'T11.company_id → T2.companies', tab: '财务数据/概览' },
    { value: 'T11.financial_statements.金额_标准值', tab: '财务数据/概览' },
    { value: 'T11.financial_statements.金额_标准值 (科目=未分配利润 期初)', tab: '财务数据/概览' },
    { value: 'T11.financial_statements.金额_标准值 (科目=经营现金流入)', tab: '财务数据/概览' },
    { value: 'T11.financial_statements.金额_标准值 (科目=营业收入)', tab: '财务数据/概览' },
    { value: 'T11.financial_statements.金额_标准值 (科目=货币资金)', tab: '财务数据/概览' },
    { value: 'T11.单位', tab: '财务数据/概览' },
    { value: 'T11.合并标志', tab: '财务数据/概览' },
    { value: 'T11.审计状态', tab: '财务数据/概览' },
    { value: 'T11.币种', tab: '财务数据/概览' },
    { value: 'T11.报表类型', tab: '财务数据/概览' },
    { value: 'T11.期间值 + 期间标准语义', tab: '财务数据/概览' },
    { value: 'T7.holding_snapshots.业务进展', tab: '底层项目' },
    { value: 'T7.holding_snapshots.退出规划', tab: '底层项目' },
    { value: 'T7.holding_snapshots.后续融资情况', tab: '底层项目' },
    { value: 'T7.holding_snapshots.拟IPO项目时间预期', tab: '底层项目' },
    { value: 'T7.holding_snapshots.已实现价值', tab: '底层项目' },
    { value: 'T7.holding_snapshots.项目退出情况', tab: '底层项目' },
    { value: 'T12.business_metrics (指标=收入)', tab: '概览/投资与股权' },
    { value: 'T12.business_metrics (科目=应收账款, 维度=账龄)', tab: '概览/投资与股权' },
    { value: 'T12.business_metrics (科目=营业收入, 维度=产品/渠道)', tab: '概览/投资与股权' },
    { value: 'T13.key_persons', tab: '概览/投资与股权' },
    { value: 'T14.capital_events (事件类型=实缴)', tab: '期间表现/出资与回款' },
    { value: 'T2.companies.企业名称', tab: '概览/投资与股权' },
    { value: 'T2.companies.成立日期', tab: '概览/投资与股权' },
    { value: 'T2.companies.所属行业', tab: '概览/投资与股权' },
    { value: 'T2.companies.注册地', tab: '概览/投资与股权' },
    { value: 'T2.companies.注册资本', tab: '概览/投资与股权' },
    { value: 'T2.companies.生命周期状态', tab: '概览/投资与股权' },
    { value: 'T2.companies.经营状态', tab: '概览/投资与股权' },
    { value: 'T2.companies.统一社会信用代码 + T4.统一社会信用代码(管理人)', tab: '概览/投资与股权' },
    { value: 'T2.companies→T5.holdings.company_id', tab: '概览/投资与股权' },
    { value: 'T20.materials', tab: '材料' },
    { value: 'T20.materials (多份同期间+版本标记)', tab: '材料' },
    { value: 'T20.materials.解析状态', tab: '材料' },
    { value: 'T20.关联对象类型+关联对象_id', tab: '材料' },
    { value: 'T20.报告期间 → 进T11/T6等实体', tab: '材料' },
    { value: 'T21.material_links (M:N关联角色)', tab: '材料' },
    { value: 'T21.material_links(主源引用)', tab: '材料' },
    { value: 'T22.deal_terms (条款类型=一票否决权)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=优先清算权)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=优先认购权)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=公司治理)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=反稀释)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=回购权)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=对赌)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=最惠国)', tab: '概览/投资与股权' },
    { value: 'T22.deal_terms (条款类型=领售权/拖售权)', tab: '概览/投资与股权' },
    { value: 'T22.条款来源(枚举)', tab: '概览/投资与股权' },
    { value: 'T3.company_aliases', tab: '概览/投资与股权' },
    { value: 'T4.managers(企业视角) → 或 T2.法定代表人', tab: '概览/投资与股权' },
    { value: 'T5.holdings.主管合伙人', tab: '投资与股权' },
    { value: 'T5.holdings.剩余投资成本', tab: '投资与股权' },
    { value: 'T5.holdings.回报倍数', tab: '投资与股权' },
    { value: 'T5.holdings.已退出金额', tab: '投资与股权' },
    { value: 'T5.holdings.投资方式', tab: '投资与股权' },
    { value: 'T5.holdings.投资金额(投资本金)', tab: '投资与股权' },
    { value: 'T5.holdings.投资金额(投资本金) → T10.investment_events', tab: '投资与股权' },
    { value: 'T5.holdings.投资阶段', tab: '投资与股权' },
    { value: 'T5.holdings.持股公允价值(未退出)', tab: '投资与股权' },
    { value: 'T5.holdings.最新投后估值', tab: '投资与股权' },
    { value: 'T5.holdings.最新持股比例', tab: '投资与股权' },
    { value: 'T5.holdings.确权情况', tab: '投资与股权' },
    { value: 'T5.holdings.行业分类', tab: '投资与股权' },
    { value: 'T5.holdings.退出状态', tab: '投资与股权' },
    { value: 'T5.holdings.项目状态备注', tab: '投资与股权' },
    { value: 'T5.holdings.首次投资日期', tab: '投资与股权' },
    { value: 'T5/T6/T8/T9/T11各表 确认状态 + 确认人 + 确认时间', tab: '材料' },
    { value: 'T6.fund_snapshots (系统计算值)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.DPI(基金-GP报告值)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.DPI(系统计算值)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.GP报告IRR', tab: '期间表现' },
    { value: 'T6.fund_snapshots.MOIC(基金-GP报告值)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.TVPI(基金-GP报告值)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.TVPI(系统计算值)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.业绩报酬(本期)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.基金实缴金额(基金合计)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.基金认缴金额(基金合计)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.已投项目数', tab: '期间表现' },
    { value: 'T6.fund_snapshots.总投资金额', tab: '期间表现' },
    { value: 'T6.fund_snapshots.总投资金额(基金合计)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.新增后续轮融资个数', tab: '期间表现' },
    { value: 'T6.fund_snapshots.期间值', tab: '期间表现' },
    { value: 'T6.fund_snapshots.管理费(本期)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.资产配置(文本摘要)', tab: '期间表现' },
    { value: 'T6.fund_snapshots.退出项目数', tab: '期间表现' },
    { value: 'T6.fund_snapshots→T5.holdings汇总', tab: '期间表现' },
    { value: 'T6/T8/T9 历史期间行', tab: '材料' },
    { value: 'T8.capital_accounts.实缴金额', tab: '期间表现/出资与回款' },
    { value: 'T8.capital_accounts.未缴款余额', tab: '期间表现/出资与回款' },
    { value: 'T8.capital_accounts.累计分配金额', tab: '期间表现/出资与回款' },
    { value: 'T8.capital_accounts.认缴金额', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions (汇总)', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions.分配日期', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions.分配类型(枚举)', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions.分配金额', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions.成本收回', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions.收益分配', tab: '期间表现/出资与回款' },
    { value: 'T9.distributions→T5.holdings(可选)', tab: '期间表现/出资与回款' }
  ];

  /* ——— 读/写 ——— */

  function migrateFundDictV6(parsed) {
    if (!parsed || !parsed.standards) return parsed;
    var once = !parsed._migratedFundDictV6;
    /* 准则：旧名「内部管理口径」→「基金跟踪口径」 */
    var seedStdMap = {};
    SEED_STANDARDS.forEach(function (s) { seedStdMap[s.id] = s; });
    (parsed.standards || []).forEach(function (s) {
      var seed = seedStdMap[s.id];
      if (!seed) return;
      if (s.id === 'std-internal' && (s.name === '内部管理口径' || !s.name)) {
        s.name = seed.name;
        s.description = seed.description;
        s.updatedAt = seed.updatedAt;
        s.updatedBy = seed.updatedBy;
      } else if (s.id === 'std-internal' && s.name === '基金跟踪口径' && (!s.description || s.description.indexOf('非企业会计三表') < 0)) {
        s.description = seed.description;
      }
      if (!s.source)    s.source    = seed.source;
      if (!s.createdAt) s.createdAt = seed.createdAt;
      if (!s.createdBy) s.createdBy = seed.createdBy;
      if (!s.updatedAt) s.updatedAt = seed.updatedAt;
      if (!s.updatedBy) s.updatedBy = seed.updatedBy;
    });
    /* 指标：补缺失；iset-2 平台指标一次性纠偏（或检测到旧错误公式时覆盖） */
    var seedIndMap = {};
    SEED_INDICATORS.forEach(function (s) { seedIndMap[s.id] = s; });
    if (!parsed.indicators) { parsed.indicators = clone(SEED_INDICATORS); }
    else {
      var existingIndIds = {};
      (parsed.indicators || []).forEach(function (i) { existingIndIds[i.id] = true; });
      SEED_INDICATORS.forEach(function (s) {
        if (!existingIndIds[s.id]) parsed.indicators.push(clone(s));
      });
      (parsed.indicators || []).forEach(function (i) {
        var seed = seedIndMap[i.id];
        if (!seed || seed.setId !== 'iset-2') return;
        var desc = i.description || '';
        var needFix = once
          || desc.indexOf('已投资产总额 + 累计分配') >= 0
          || (i.id === 'ind-20' && desc.indexOf('已投资产总额') >= 0)
          || i.name === '子基金 IRR'
          || i.name === '管理费收入增速'
          || (i.id === 'ind-9' && desc.indexOf('累计实缴资本') >= 0);
        if (needFix) {
          i.name = seed.name;
          i.description = seed.description;
          if (seed.category) i.category = seed.category;
        }
      });
    }
    /* 校验规则：补缺失 */
    if (!parsed.checks) parsed.checks = clone(SEED_CHECKS);
    else {
      var existingChkIds = {};
      (parsed.checks || []).forEach(function (c) { existingChkIds[c.id] = true; });
      SEED_CHECKS.forEach(function (s) {
        if (!existingChkIds[s.id]) parsed.checks.push(clone(s));
      });
      /* 一次性同步资本账户滚动公式至含期初／本期科目的版本 */
      if (once) {
        var seedChkMap = {};
        SEED_CHECKS.forEach(function (s) { seedChkMap[s.id] = s; });
        (parsed.checks || []).forEach(function (c) {
          var seed = seedChkMap[c.id];
          if (seed && c.id === 'chk-int-4') c.formula = seed.formula;
        });
      }
    }
    /* 科目：移除基金字典中的 EBITDA（subj-int-1）；仅同步基金口径平台科目；补齐缺失 */
    if (parsed.subjects) {
      parsed.subjects = parsed.subjects.filter(function (s) {
        return !(s.id === 'subj-int-1' && s.standardId === 'std-internal' && s.source !== 'custom');
      });
    }
    var seedSubjMap = {};
    SEED_SUBJECTS.forEach(function (s) { seedSubjMap[s.id] = s; });
    var existingSubjIds = {};
    (parsed.subjects || []).forEach(function (s) {
      existingSubjIds[s.id] = true;
      if (!s.source) s.source = seedSubjMap[s.id] ? 'platform' : 'custom';
      var seed = seedSubjMap[s.id];
      if (!seed) return;
      /* 仅基金跟踪口径的平台科目强制同步名／别名／stmt；其他准则只补 stmt（若缺失） */
      if (seed.standardId === 'std-internal' && s.source === 'platform') {
        s.name = seed.name;
        s.stmt = seed.stmt;
        s.aliases = seed.aliases;
        s.sort = seed.sort;
      } else if (!s.stmt && seed.stmt) {
        s.stmt = seed.stmt;
      }
    });
    SEED_SUBJECTS.forEach(function (s) {
      if (!existingSubjIds[s.id]) {
        if (!parsed.subjects) parsed.subjects = [];
        parsed.subjects.push(clone(s));
      }
    });
    /* 指标集描述同步 */
    var seedISetMap = {};
    SEED_INDICATOR_SETS.forEach(function (s) { seedISetMap[s.id] = s; });
    (parsed.indicatorSets || []).forEach(function (s) {
      var seed = seedISetMap[s.id];
      if (!seed) return;
      if (!s.standardId) s.standardId = seed.standardId;
      if (s.id === 'iset-2' && (once || (s.description || '').indexOf('MOIC') < 0)) {
        s.description = seed.description;
        s.updatedAt = seed.updatedAt;
        s.updatedBy = seed.updatedBy;
      }
      if (!s.createdAt)  s.createdAt  = seed.createdAt;
      if (!s.createdBy)  s.createdBy  = seed.createdBy;
      if (!s.updatedAt)  s.updatedAt  = seed.updatedAt;
      if (!s.updatedBy)  s.updatedBy  = seed.updatedBy;
    });
    parsed._migratedFundDictV6 = true;
    return parsed;
  }

  function migrateRemoveIfrsV8(parsed) {
    if (!parsed || parsed._migratedRemoveIfrsV8) return parsed;
    parsed.standards = (parsed.standards || []).filter(function (s) {
      return s.id !== 'std-ifrs' && !(s.source === 'platform' && (s.name || '').indexOf('IFRS') >= 0);
    });
    parsed.subjects = (parsed.subjects || []).filter(function (s) {
      return s.standardId !== 'std-ifrs' && !(String(s.id || '').indexOf('subj-ifrs') === 0);
    });
    parsed.checks = (parsed.checks || []).filter(function (c) {
      return c.standardId !== 'std-ifrs' && c.id !== 'chk-ifrs-1';
    });
    parsed.indicatorSets = (parsed.indicatorSets || []).filter(function (s) {
      return s.standardId !== 'std-ifrs';
    });
    var keepSetIds = {};
    (parsed.indicatorSets || []).forEach(function (s) { keepSetIds[s.id] = true; });
    parsed.indicators = (parsed.indicators || []).filter(function (i) {
      return !i.setId || keepSetIds[i.setId];
    });
    /* 确保中国准则仍启用（删 IFRS 后企业桶至少一套） */
    var hasCnOn = (parsed.standards || []).some(function (s) {
      return s.id === 'std-cn' && s.enabled;
    });
    if (!hasCnOn) {
      (parsed.standards || []).forEach(function (s) {
        if (s.id === 'std-cn') s.enabled = true;
      });
    }
    parsed._migratedRemoveIfrsV8 = true;
    return parsed;
  }

  function migrateInvestRatioV8b(parsed) {
    if (!parsed || parsed._migratedInvestRatioV8b) return parsed;
    (parsed.fields || []).forEach(function (f) {
      if (f.id === 'fld-214a') {
        f.name = '投资比例';
        f.aliases = '本机构认缴/基金认缴合计';
        f.method = 'compute';
        f.aiParse = false;
      }
    });
    var hasProgress = (parsed.fields || []).some(function (f) { return f.id === 'fld-214b'; });
    if (!hasProgress) {
      var seed = (SEED_FIELDS || []).filter(function (f) { return f.id === 'fld-214b'; })[0];
      if (seed) {
        if (!parsed.fields) parsed.fields = [];
        parsed.fields.push(clone(seed));
      }
    }
    var hasSubj = (parsed.subjects || []).some(function (s) { return s.id === 'subj-int-9b'; });
    if (!hasSubj) {
      var seedS = (SEED_SUBJECTS || []).filter(function (s) { return s.id === 'subj-int-9b'; })[0];
      if (seedS) {
        if (!parsed.subjects) parsed.subjects = [];
        parsed.subjects.push(clone(seedS));
      }
    }
    (parsed.subjects || []).forEach(function (s) {
      if (s.id === 'subj-int-9' && s.source === 'platform') {
        s.name = '投资比例（%）';
        s.aliases = '出资占比,认缴占比,LP认缴比例';
      }
    });
    parsed._migratedInvestRatioV8b = true;
    return parsed;
  }


  /* 对齐《档案详情骨架》＋《平台官方档案配置种子》v1.0：纠错挂 Tab／剔除流水·三表种子 */
  var ARCHIVE_SEED_ILLEGAL_IDS = {
    'fld-201':1,'fld-202':1,'fld-203':1,'fld-204':1,'fld-205':1,'fld-206':1,'fld-207':1,'fld-208':1,'fld-209':1,
    'fld-210':1,'fld-211':1,'fld-212':1,'fld-213':1,'fld-214':1,'fld-215':1,'fld-216':1,'fld-217':1,
    'fld-218':1,'fld-219':1,'fld-220':1,'fld-221':1,'fld-222':1,'fld-223':1,'fld-224':1,'fld-225':1,'fld-226':1,
    'fld-227':1,'fld-228':1,'fld-229':1,'fld-230':1,
    'fld-157':1,'fld-158':1,'fld-159':1,'fld-160':1,'fld-161':1,'fld-162':1,
    'fld-183b':1,'fld-209a':1,'fld-222a':1,'fld-223a':1,'fld-224a':1,
    'fld-303':1,'fld-304':1,'fld-305':1,'fld-306':1,'fld-307':1,'fld-312':1,'fld-313':1,'fld-314':1,'fld-315':1,
    'fld-226a':1,'fld-227a':1,'fld-214b':1,'fld-215a':1,'fld-219a':1,
    'fld-195':1,'fld-196':1,'fld-216a':1,'fld-233b':1,'fld-233a':1,'fld-234a':1,'fld-235a':1
  };

  function migrateArchiveSeedSkeletonV20(parsed) {
    if (!parsed || parsed._migratedArchiveSeedSkeletonV20) return parsed;
    var seedMap = {};
    SEED_FIELDS.forEach(function (s) { seedMap[s.id] = s; });
    parsed.fields = (parsed.fields || []).filter(function (f) {
      return !ARCHIVE_SEED_ILLEGAL_IDS[f.id];
    });
    var existing = {};
    parsed.fields.forEach(function (f) { existing[f.id] = f; });
    Object.keys(seedMap).forEach(function (id) {
      var seed = seedMap[id];
      var cur = existing[id];
      if (!cur) {
        parsed.fields.push(clone(seed));
        return;
      }
      /* 平台种子字段强制同步归属与计算标记（机构自建字段 id 不在 seedMap） */
      cur.name = seed.name;
      cur.tab = seed.tab;
      cur.module = seed.module;
      cur.group = seed.group;
      cur.layer = seed.layer;
      cur.landing = seed.landing;
      cur.aliases = seed.aliases;
      cur.sourceType = seed.sourceType;
      cur.priority = seed.priority;
      cur.method = seed.method;
      cur.updateMode = seed.updateMode;
      cur.aiParse = seed.aiParse;
      cur.objectType = seed.objectType;
      cur.templateId = seed.templateId;
      if (seed.formula) cur.formula = seed.formula;
      cur.enabled = seed.enabled !== false;
    });
    parsed._migratedArchiveSeedSkeletonV20 = true;
    return parsed;
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var fromPrev = false;
      if (!raw) {
        for (var pi = 0; pi < PREV_KEYS.length; pi++) {
          raw = localStorage.getItem(PREV_KEYS[pi]);
          if (raw) { fromPrev = true; break; }
        }
      }
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.standards) {
          if (!parsed.checks)          parsed.checks          = clone(SEED_CHECKS);
          if (!parsed.indicatorSets)   parsed.indicatorSets   = clone(SEED_INDICATOR_SETS);
          if (!parsed.parseTemplates)  parsed.parseTemplates  = clone(SEED_PARSE_TEMPLATES);
          /* 迁移：给旧 indicatorSets seed 条目补 standardId / 审计字段 */
          var seedISetMap0 = {};
          SEED_INDICATOR_SETS.forEach(function (s) { seedISetMap0[s.id] = s; });
          (parsed.indicatorSets || []).forEach(function (s) {
            var seed = seedISetMap0[s.id];
            if (!seed) return;
            if (!s.standardId) s.standardId = seed.standardId;
            if (!s.createdAt)  s.createdAt  = seed.createdAt;
            if (!s.createdBy)  s.createdBy  = seed.createdBy;
            if (!s.updatedAt)  s.updatedAt  = seed.updatedAt;
            if (!s.updatedBy)  s.updatedBy  = seed.updatedBy;
          });
          /* 迁移：给旧 parseTemplates seed 条目补审计字段 */
          var seedTplMap = {};
          SEED_PARSE_TEMPLATES.forEach(function (s) { seedTplMap[s.id] = s; });
          (parsed.parseTemplates || []).forEach(function (t) {
            var seed = seedTplMap[t.id];
            if (!seed) return;
            if (!t.createdAt) t.createdAt = seed.createdAt;
            if (!t.createdBy) t.createdBy = seed.createdBy;
            if (!t.updatedAt) t.updatedAt = seed.updatedAt;
            if (!t.updatedBy) t.updatedBy = seed.updatedBy;
          });
          /* 迁移：替换旧 seed fields（v1 fld-1..18 / v2 fld-101..122 / fld-111..116）为新编号字段，保留用户自建字段 */
          var oldSeedIds = { 'fld-1':1,'fld-2':1,'fld-3':1,'fld-4':1,'fld-5':1,'fld-6':1,'fld-7':1,'fld-8':1,'fld-9':1,'fld-10':1,'fld-11':1,'fld-12':1,'fld-13':1,'fld-14':1,'fld-15':1,'fld-16':1,'fld-17':1,'fld-18':1,'fld-101':1,'fld-102':1,'fld-103':1,'fld-104':1,'fld-105':1,'fld-106':1,'fld-107':1,'fld-108':1,'fld-109':1,'fld-110':1,'fld-111':1,'fld-112':1,'fld-113':1,'fld-114':1,'fld-115':1,'fld-116':1,'fld-117':1,'fld-118':1,'fld-119':1,'fld-120':1,'fld-121':1,'fld-122':1 };
          var existingFldIds = {};
          (parsed.fields || []).forEach(function (f) { existingFldIds[f.id] = true; });
          /* 移除旧 seed 字段 */
          if (parsed.fields) parsed.fields = parsed.fields.filter(function (f) { return !oldSeedIds[f.id]; });
          /* 追加新 seed 字段（还不存在的） */
          SEED_FIELDS.forEach(function (s) {
            if (!existingFldIds[s.id]) { if (!parsed.fields) parsed.fields = []; parsed.fields.push(clone(s)); }
          });
          /* v6：基金跟踪口径分库迁移 */
          migrateFundDictV6(parsed);
          /* v8：删除平台 IFRS 预置 */
          migrateRemoveIfrsV8(parsed);
          migrateInvestRatioV8b(parsed);
          migrateArchiveSeedSkeletonV20(parsed);
          /* v7：分桶单启用，去掉默认 */
          enforceSingleEnableBuckets(parsed);
          parsed._migratedSingleEnableV7 = true;
          if (fromPrev || !parsed._persistedV8) {
            parsed._persistedV8 = true;
            try { localStorage.setItem(KEY, JSON.stringify(parsed)); } catch (e2) {}
          }
          return parsed;
        }
      }
    } catch (e) {}
    return {
      standards:      clone(SEED_STANDARDS),
      subjects:       clone(SEED_SUBJECTS),
      indicators:     clone(SEED_INDICATORS),
      fields:         clone(SEED_FIELDS),
      checks:         clone(SEED_CHECKS),
      indicatorSets:  clone(SEED_INDICATOR_SETS),
      parseTemplates: clone(SEED_PARSE_TEMPLATES),
      _migratedFundDictV6: true,
      _migratedRemoveIfrsV8: true,
      _migratedSingleEnableV7: true,
    };
  }

  var state = read();
  migrateRemoveIfrsV8(state);
  migrateInvestRatioV8b(state);
  migrateArchiveSeedSkeletonV20(state);
  enforceSingleEnableBuckets(state);
  state._migratedSingleEnableV7 = true;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ——— 通用 API ——— */

  function list(col) {
    return (state[col] || []).filter(function (r) { return !r.isDeleted; });
  }

  function get(col, id) {
    return (state[col] || []).find(function (r) { return r.id === id && !r.isDeleted; }) || null;
  }

  function save(col, input) {
    var old = input.id ? get(col, input.id) : null;
    var item = old ? old : { id: uid(col.slice(0, 3)) };
    var now = (function () {
      var d = new Date();
      return d.getFullYear() + '-'
        + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
        + ('0' + d.getDate()).slice(-2) + ' '
        + ('0' + d.getHours()).slice(-2) + ':'
        + ('0' + d.getMinutes()).slice(-2);
    })();
    Object.keys(input).forEach(function (k) {
      if (k === 'id' && !input[k]) return;
      item[k] = input[k];
    });
    if (!old) {
      item.createdAt = now;
      item.createdBy = '王敏';
      if (!state[col]) state[col] = [];
      state[col].unshift(item);
    }
    item.updatedAt = now;
    item.updatedBy = '王敏';
    persist();
    return item;
  }

  function remove(col, id) {
    var item = get(col, id);
    if (!item) return;
    item.isDeleted = true;
    persist();
  }

  function toggleEnabled(col, id) {
    var item = get(col, id);
    if (!item) return { ok: false, reason: 'not_found' };
    var turningOn = !item.enabled;

    function peers(predicate) {
      return list(col).filter(function (x) {
        return x.id !== id && !x.isDeleted && predicate(x);
      });
    }

    if (col === 'standards') {
      var bucket = standardBucket(item);
      var sameBucket = peers(function (x) { return standardBucket(x) === bucket; });
      if (!turningOn) {
        var stillOn = sameBucket.some(function (x) { return x.enabled; });
        if (!stillOn) return { ok: false, reason: 'last_in_bucket', message: '该类型至少保留一套启用（启用即生效）' };
        item.enabled = false;
        persist();
        return { ok: true };
      }
      sameBucket.forEach(function (x) { x.enabled = false; });
      item.enabled = true;
      persist();
      return { ok: true, switchedOff: sameBucket.map(function (x) { return x.name; }) };
    }

    if (col === 'indicatorSets') {
      var sid = item.standardId;
      var sameStd = peers(function (x) { return x.standardId === sid; });
      if (!turningOn) {
        if (!sameStd.some(function (x) { return x.enabled; })) {
          return { ok: false, reason: 'last_in_bucket', message: '同一准则下至少保留一套指标集启用' };
        }
        item.enabled = false;
        persist();
        return { ok: true };
      }
      sameStd.forEach(function (x) { x.enabled = false; });
      item.enabled = true;
      persist();
      return { ok: true };
    }

    if (col === 'parseTemplates') {
      var ot = item.objectType || 'direct';
      var sameOt = peers(function (x) { return (x.objectType || 'direct') === ot; });
      if (!turningOn) {
        if (!sameOt.some(function (x) { return x.enabled; })) {
          return { ok: false, reason: 'last_in_bucket', message: '该对象类型至少保留一套档案配置启用' };
        }
        item.enabled = false;
        persist();
        return { ok: true };
      }
      sameOt.forEach(function (x) { x.enabled = false; });
      item.enabled = true;
      persist();
      return { ok: true };
    }

    /* 指标／字段条目：可多开，无桶互斥 */
    item.enabled = !item.enabled;
    persist();
    return { ok: true };
  }

  function standardBucket(std) {
    if (!std) return 'enterprise';
    if (std.id === 'std-internal') return 'fund';
    if ((std.name || '').indexOf('基金跟踪') >= 0) return 'fund';
    return 'enterprise';
  }

  function enforceSingleEnableBuckets(parsed) {
    function keepOne(items, keyFn) {
      var groups = {};
      (items || []).forEach(function (it) {
        if (it.isDeleted) return;
        var k = keyFn(it);
        if (!groups[k]) groups[k] = [];
        groups[k].push(it);
      });
      Object.keys(groups).forEach(function (k) {
        var arr = groups[k];
        var enabled = arr.filter(function (x) { return x.enabled; });
        if (enabled.length <= 1) {
          if (enabled.length === 0 && arr.length) arr[0].enabled = true;
          return;
        }
        /* 多开时保留 sort 最小（或列表第一）的一套 */
        enabled.sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
        enabled.slice(1).forEach(function (x) { x.enabled = false; });
      });
    }
    keepOne(parsed.standards, standardBucket);
    keepOne(parsed.indicatorSets, function (s) { return s.standardId || 'none'; });
    keepOne(parsed.parseTemplates, function (t) { return t.objectType || 'direct'; });
    (parsed.standards || []).forEach(function (s) { delete s.isDefault; });
  }

  /* ——— 科目专用 API ——— */

  function listSubjects(standardId) {
    return (state.subjects || []).filter(function (s) {
      return s.standardId === standardId && !s.isDeleted;
    });
  }

  function addSubject(standardId) {
    var item = { id: uid('subj'), standardId: standardId, stmt: 'is', name: '', aliases: '', sort: 999, enabled: true, source: 'custom' };
    if (!state.subjects) state.subjects = [];
    state.subjects.push(item);
    persist();
    return item;
  }

  function copySubject(standardId, subjId) {
    var orig = (state.subjects || []).find(function (s) {
      return s.id === subjId && s.standardId === standardId;
    });
    if (!orig) return null;
    var item = { id: uid('subj'), standardId: standardId, stmt: orig.stmt, name: orig.name + ' - 副本', aliases: orig.aliases || '', sort: 999, enabled: true, source: 'custom' };
    state.subjects.push(item);
    persist();
    return item;
  }

  function saveSubjectField(standardId, subjId, field, value) {
    var item = (state.subjects || []).find(function (s) {
      return s.id === subjId && s.standardId === standardId && !s.isDeleted;
    });
    if (!item) return;
    item[field] = value;
    persist();
  }

  function removeSubject(standardId, subjId) {
    var item = (state.subjects || []).find(function (s) {
      return s.id === subjId && s.standardId === standardId && !s.isDeleted;
    });
    if (!item) return;
    item.isDeleted = true;
    persist();
  }

  function subjectCounts(standardId) {
    var subs = listSubjects(standardId);
    return {
      is:   subs.filter(function (s) { return s.stmt === 'is'; }).length,
      bs:   subs.filter(function (s) { return s.stmt === 'bs'; }).length,
      cf:   subs.filter(function (s) { return s.stmt === 'cf'; }).length,
      fund: subs.filter(function (s) { return s.stmt === 'fund'; }).length,
      total: subs.length,
    };
  }

  /* ——— 校验规则专用 API（按准则分组） ——— */

  function listChecks(standardId) {
    return (state.checks || []).filter(function (c) {
      return c.standardId === standardId && !c.isDeleted;
    });
  }

  function addCheck(standardId) {
    var item = { id: uid('chk'), standardId: standardId, name: '新校验规则', type: 'balance', stmt: 'bs', formula: '', severity: 'critical', enabled: true };
    if (!state.checks) state.checks = [];
    state.checks.push(item);
    persist();
    return item;
  }

  function saveCheckField(standardId, checkId, field, value) {
    var item = (state.checks || []).find(function (c) {
      return c.id === checkId && c.standardId === standardId && !c.isDeleted;
    });
    if (!item) return;
    item[field] = value;
    persist();
  }

  function removeCheck(standardId, checkId) {
    var item = (state.checks || []).find(function (c) {
      return c.id === checkId && c.standardId === standardId && !c.isDeleted;
    });
    if (!item) return;
    item.isDeleted = true;
    persist();
  }

  function toggleCheck(standardId, checkId) {
    var item = (state.checks || []).find(function (c) {
      return c.id === checkId && c.standardId === standardId && !c.isDeleted;
    });
    if (!item) return;
    item.enabled = !item.enabled;
    persist();
  }

  function checkCounts(standardId) {
    return listChecks(standardId).length;
  }

  /* ——— 指标集专用 API ——— */

  function listIndicatorSets() {
    return (state.indicatorSets || []).filter(function (s) { return !s.isDeleted; });
  }

  function listIndicatorsInSet(setId) {
    return (state.indicators || []).filter(function (ind) {
      return ind.setId === setId && !ind.isDeleted;
    });
  }

  function indicatorSetCount(setId) {
    return listIndicatorsInSet(setId).length;
  }

  /* ——— 解析模板专用 API ——— */

  function listParseTemplates() {
    return (state.parseTemplates || []).filter(function (t) { return !t.isDeleted; });
  }

  function listFieldsInTemplate(templateId) {
    return (state.fields || []).filter(function (f) {
      return f && f.templateId === templateId && !f.isDeleted;
    });
  }

  function fieldTemplateCount(templateId) {
    return listFieldsInTemplate(templateId).length;
  }

  function moveSubject(stdId, fromId, toId) {
    var subs = state.subjects || [];
    var fromIdx = -1, toIdx = -1;
    for (var i = 0; i < subs.length; i++) {
      if (subs[i].id === fromId && subs[i].standardId === stdId) fromIdx = i;
      if (subs[i].id === toId   && subs[i].standardId === stdId) toIdx   = i;
    }
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    var item = subs.splice(fromIdx, 1)[0];
    var insertAt = toIdx > fromIdx ? toIdx - 1 : toIdx;
    subs.splice(insertAt, 0, item);
    persist();
  }

  function moveField(templateId, fromId, toId) {
    var fields = state.fields || [];
    var fromIdx = -1, toIdx = -1;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].id === fromId && fields[i].templateId === templateId) fromIdx = i;
      if (fields[i].id === toId && fields[i].templateId === templateId) toIdx = i;
    }
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    var item = fields.splice(fromIdx, 1)[0];
    var insertAt = toIdx > fromIdx ? toIdx - 1 : toIdx;
    fields.splice(insertAt, 0, item);
    persist();
  }

  window.CFG_CENTER_CRUD = {
    list: list,
    get: get,
    save: save,
    remove: remove,
    toggleEnabled: toggleEnabled,
    listSubjects: listSubjects,
    addSubject: addSubject,
    copySubject: copySubject,
    saveSubjectField: saveSubjectField,
    removeSubject: removeSubject,
    subjectCounts: subjectCounts,
    listChecks: listChecks,
    addCheck: addCheck,
    saveCheckField: saveCheckField,
    removeCheck: removeCheck,
    toggleCheck: toggleCheck,
    checkCounts: checkCounts,
    listIndicatorSets: listIndicatorSets,
    listIndicatorsInSet: listIndicatorsInSet,
    indicatorSetCount: indicatorSetCount,
    listParseTemplates: listParseTemplates,
    listFieldsInTemplate: listFieldsInTemplate,
    getLandingOptions: function(){ return (typeof LANDING_OPTIONS!=='undefined')?LANDING_OPTIONS:[]; },
    OBJ_TYPES: { direct: '直投项目', subFund: '所投子基金', fund: '管理基金' },
    fieldTemplateCount: fieldTemplateCount,
    moveSubject: moveSubject,
    moveField: moveField,
  };
})();
