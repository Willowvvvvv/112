/**
 * 财务配置 — 静态 Demo（对齐 agent-demo /finance-config）
 * 版本: v1.0 | 日期: 2026-06-29
 */

export const FINANCE_DEMO_CONFIG = {
  id: "platform-standard",
  name: "通用模板",
  scope: "platform",
  scopeLabel: "平台通用",
  template: "通用",
  subjects: [
    { id: "rev-total", standard: "营业收入", statement: "income", aliases: ["主营业务收入", "Revenue", "营业总收入"] },
    { id: "cogs", standard: "营业成本", statement: "income", aliases: ["主营业务成本", "销售成本"] },
    { id: "gross-profit", standard: "毛利", statement: "income", aliases: ["毛利润", "营业毛利"] },
    { id: "sales-expense", standard: "销售费用", statement: "income", aliases: ["营销费用", "市场推广费"] },
    { id: "admin-expense", standard: "管理费用", statement: "income", aliases: ["一般管理费用", "行政费用"] },
    { id: "rd-expense", standard: "研发费用", statement: "income", aliases: ["研发费用化支出", "研究开发费"] },
    { id: "net-profit", standard: "净利润", statement: "income", aliases: ["归属母公司净利润", "税后利润"] },
    { id: "cash", standard: "货币资金", statement: "balance", aliases: ["银行存款", "现金及现金等价物"] },
    { id: "ar", standard: "应收账款", statement: "balance", aliases: ["应收票据及应收账款", "应收款项"] },
    { id: "inventory", standard: "存货", statement: "balance", aliases: ["库存商品", "存货净额"] },
    { id: "total-assets", standard: "资产总计", statement: "balance", aliases: ["总资产", "资产合计"] },
    { id: "total-liabilities", standard: "负债合计", statement: "balance", aliases: ["总负债", "负债总计"] },
    { id: "total-equity", standard: "股东权益合计", statement: "balance", aliases: ["净资产", "所有者权益合计"] },
    { id: "cf-operating", standard: "经营活动现金流净额", statement: "cashflow", aliases: ["经营现金流", "经营活动产生的现金流量净额"] },
    { id: "cf-investing", standard: "投资活动现金流净额", statement: "cashflow", aliases: ["投资活动产生的现金流量净额"] },
    { id: "cf-financing", standard: "筹资活动现金流净额", statement: "cashflow", aliases: ["筹资活动产生的现金流量净额"] },
  ],
  indicators: [
    { id: "gross-margin", name: "毛利率", formula: "(营业收入 - 营业成本) / 营业收入", unit: "%", brief: "毛利占营收比例，反映产品竞争力与定价能力。" },
    { id: "net-margin", name: "净利率", formula: "净利润 / 营业收入", unit: "%", brief: "净利润占营收比例，反映综合盈利能力。" },
    { id: "debt-ratio", name: "资产负债率", formula: "负债合计 / 资产总计", unit: "%", brief: "反映财务杠杆水平；超过 70% 偿债压力较大。" },
    { id: "cash-conversion", name: "经营现金流/净利润", formula: "经营活动现金流净额 / 净利润", unit: "x", brief: "利润现金含量；低于 0.7 需关注应收账款堆积。" },
    { id: "ar-days", name: "应收账款周转天数", formula: "应收账款 / 营业收入 × 365", unit: "天", brief: "回款周期估算；超过 90 天需关注坏账风险。" },
    { id: "rd-ratio", name: "研发费用率", formula: "研发费用 / 营业收入", unit: "%", brief: "研发投入强度，科技类企业核心竞争力指标。" },
  ],
  rules: [
    { id: "bs-balance", name: "资产负债表平衡校验", expr: "资产总计 = 负债合计 + 股东权益", severity: "critical", msg: "资产负债表不平衡，请核查勾稽关系", enabled: true },
    { id: "gross-margin-low", name: "毛利率过低", expr: "毛利率 < 20%", severity: "warning", msg: "毛利率低于 20%，关注定价与成本控制", enabled: true },
    { id: "debt-ratio-high", name: "资产负债率偏高", expr: "资产负债率 > 70%", severity: "warning", msg: "负债率超过 70%，偿债压力需关注", enabled: true },
    { id: "cash-profit-diverge", name: "现金流与净利润背离", expr: "净利润 > 0 且 经营现金流 < 0", severity: "warning", msg: "盈利但现金流为负，重点检查应收账款", enabled: true },
    { id: "ar-high", name: "应收账款占比过高", expr: "应收账款 / 资产总计 > 40%", severity: "warning", msg: "应收账款占比偏高，关注回款风险", enabled: true },
  ],
};

const STATEMENT_TABS = [
  { id: "income", label: "利润表" },
  { id: "balance", label: "资产负债表" },
  { id: "cashflow", label: "现金流量表" },
];

const MAIN_TABS = [
  { id: "subjects", label: "科目库" },
  { id: "indicators", label: "指标计算" },
  { id: "rules", label: "规则引擎" },
];

function severityLabel(severity) {
  return severity === "critical" ? "严重" : "警告";
}

function renderRuleCard(escapeHtml, rule) {
  return `
    <article class="fc-rule-card fc-rule-card--${rule.severity}">
      <header class="fc-rule-card-head">
        <strong>${escapeHtml(rule.name)}</strong>
        <span class="fc-badge fc-badge--${rule.severity}">${severityLabel(rule.severity)}</span>
        <span class="fc-badge fc-badge--${rule.enabled ? "on" : "off"}">${rule.enabled ? "已启用" : "已禁用"}</span>
      </header>
      <p class="fc-rule-expr"><span>表达式</span>${escapeHtml(rule.expr)}</p>
      <p class="fc-rule-msg">${escapeHtml(rule.msg)}</p>
    </article>
  `;
}

function renderSubjectsPanel(escapeHtml, jsCall, config, activeStatement) {
  const stmt = activeStatement || "income";
  const subjects = config.subjects.filter((s) => s.statement === stmt);
  const tabs = STATEMENT_TABS.map((t) => `
    <button type="button" class="fc-stmt-tab${t.id === stmt ? " on" : ""}"
      onclick="${jsCall("XinBaoDemo.setFinanceStatementTab", t.id)}">${t.label}</button>
  `).join("");

  const rows = subjects.map((s) => `
    <div class="fc-subject-row">
      <span class="fc-subject-name">${escapeHtml(s.standard)}</span>
      ${s.aliases?.length ? `<span class="fc-subject-aliases">${escapeHtml(s.aliases.join(" · "))}</span>` : ""}
    </div>
  `).join("");

  return `
    <p class="fc-panel-lead">平台标准科目库（三表 + 别名），供 OCR 映射与指标计算引用（Demo 只读）。</p>
    <div class="fc-stmt-tabs">${tabs}</div>
    <div class="fc-subject-table">${rows || `<p class="fc-empty">暂无科目</p>`}</div>
  `;
}

function renderIndicatorsPanel(escapeHtml, config) {
  const cards = config.indicators.map((ind) => `
    <article class="fc-indicator-card">
      <header>
        <strong>${escapeHtml(ind.name)}</strong>
        ${ind.unit ? `<span class="fc-unit-badge">${escapeHtml(ind.unit)}</span>` : ""}
      </header>
      <p><span class="fc-indicator-label">计算口径：</span>${escapeHtml(ind.brief || ind.formula)}</p>
      <p class="fc-indicator-formula mono">${escapeHtml(ind.formula)}</p>
    </article>
  `).join("");

  return `
    <p class="fc-panel-lead">平台指标只读。新建「我的配置」后可增删改；或切换机构模板查看定制口径。</p>
    <div class="fc-indicator-list">${cards}</div>
  `;
}

function renderRulesPanel(escapeHtml, config) {
  const critical = config.rules.filter((r) => r.severity === "critical");
  const warning = config.rules.filter((r) => r.severity === "warning");
  return `
    <section class="fc-rules-section">
      <h4>数据完整性（必须通过） · ${critical.length} 条</h4>
      ${critical.map((r) => renderRuleCard(escapeHtml, r)).join("")}
    </section>
    <section class="fc-rules-section">
      <h4>财务预警 · ${warning.length} 条</h4>
      ${warning.map((r) => renderRuleCard(escapeHtml, r)).join("")}
    </section>
  `;
}

export function renderFinanceConfigView(escapeHtml, icon, jsCall, state) {
  const fd = state?.featureData || {};
  const tab = fd.financeConfigTab || "subjects";
  const cfg = FINANCE_DEMO_CONFIG;
  const subjectCount = cfg.subjects.length;
  const indicatorCount = cfg.indicators.length;
  const ruleCount = cfg.rules.length;

  const mainTabs = MAIN_TABS.map((t) => `
    <button type="button" class="fc-main-tab${tab === t.id ? " on" : ""}"
      onclick="${jsCall("XinBaoDemo.setFinanceConfigTab", t.id)}">${t.label}</button>
  `).join("");

  let body = "";
  if (tab === "subjects") body = renderSubjectsPanel(escapeHtml, jsCall, cfg, fd.financeStatementTab);
  else if (tab === "indicators") body = renderIndicatorsPanel(escapeHtml, cfg);
  else body = renderRulesPanel(escapeHtml, cfg);

  return `
    <div class="finance-config-page">
      <p class="feature-lead">维护科目体系、指标公式与校验规则；财报深读上传 PDF 并确认科目后，按本配置自动计算指标并检查规则。</p>
      <div class="fc-header-card">
        <div class="fc-header-main">
          ${icon("calculator", "icon--sm")}
          <div class="fc-header-text">
            <strong>${escapeHtml(cfg.name)}</strong>
            <span class="fc-scope-badge">${escapeHtml(cfg.scopeLabel)}</span>
            <span class="fc-header-meta">${subjectCount} 科目 · ${indicatorCount} 指标 · ${ruleCount} 条规则</span>
          </div>
        </div>
        <div class="fc-header-actions">
          <button type="button" class="btn-mini" onclick="XinBaoDemo.toastFinanceCloneDemo()">新建我的配置</button>
          <button type="button" class="btn-mini" onclick="XinBaoDemo.openAdminFinanceConfig()">Admin 财务配置</button>
        </div>
        <p class="fc-header-hint">平台通用 baseline：标准三表科目、核心指标与预警规则。点「新建我的配置」复制后可编辑；机构可在 Admin 维护专属模板。</p>
      </div>
      <div class="fc-main-tabs">${mainTabs}</div>
      <div class="fc-panel">${body}</div>
    </div>
  `;
}
