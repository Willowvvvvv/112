/**
 * AI 产业链探索 — 静态 Demo（对齐 agent-demo ChainHierarchyView + CompanyDrawer）
 * 版本: v1.0 | 日期: 2026-06-29
 */

import {
  CHAIN_TIERS,
  CHAIN_COMPANIES,
  REGION_LABELS,
  STAGE_LABELS,
  MARKET_POWER_LABELS,
} from "../data/chain-seed-v1.0-20260629.js";

const TIER_LABEL_MAP = Object.fromEntries(CHAIN_TIERS.map((t) => [t.id, t.label]));

const POWER_DOT_CLASS = {
  dominant: "xb-chain-power-dot--dominant",
  strong: "xb-chain-power-dot--strong",
  moderate: "xb-chain-power-dot--moderate",
  niche: "xb-chain-power-dot--niche",
};

const REGION_BADGE_CLASS = {
  CN: "xb-chain-region-badge--cn",
  US: "xb-chain-region-badge--us",
  EU: "xb-chain-region-badge--eu",
  OTHER: "xb-chain-region-badge--other",
};

export { CHAIN_TIERS, CHAIN_COMPANIES };

export function findChainCompany(id) {
  return CHAIN_COMPANIES.find((c) => c.id === id) || null;
}

export function getDefaultChainFilters() {
  return { query: "", tiers: [], regions: [], stages: [] };
}

export function normalizeChainFilters(raw) {
  const base = getDefaultChainFilters();
  if (!raw || typeof raw !== "object") return base;
  return {
    query: typeof raw.query === "string" ? raw.query : "",
    tiers: Array.isArray(raw.tiers) ? [...raw.tiers] : [],
    regions: Array.isArray(raw.regions) ? [...raw.regions] : [],
    stages: Array.isArray(raw.stages) ? [...raw.stages] : [],
  };
}

function tierById(id) {
  return CHAIN_TIERS.find((t) => t.id === id) || null;
}

function filterCompanies(filters) {
  const q = (filters.query || "").toLowerCase().trim();
  const tierSet = new Set(filters.tiers || []);
  const regionSet = new Set(filters.regions || []);
  const stageSet = new Set(filters.stages || []);

  return CHAIN_COMPANIES.filter((c) => {
    if (tierSet.size && !tierSet.has(c.tierId)) return false;
    if (regionSet.size && !regionSet.has(c.region)) return false;
    if (stageSet.size && !stageSet.has(c.stage)) return false;
    if (q) {
      const match =
        c.name.toLowerCase().includes(q) ||
        (c.nameEn?.toLowerCase().includes(q) ?? false) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

function renderFilterChip(active, label, color, onclick) {
  const dot = color
    ? `<span class="xb-chain-filter-chip-dot" style="background-color:${color}"></span>`
    : "";
  return `
    <button type="button" class="xb-chain-filter-chip${active ? " is-active" : ""}" onclick="${onclick}">
      ${dot}${label}
    </button>
  `;
}

function renderCompanyCard(c, selected, jsCall) {
  return `
    <button
      type="button"
      class="xb-chain-company-card${selected ? " is-selected" : ""}"
      aria-pressed="${selected ? "true" : "false"}"
      onclick="${jsCall("XinBaoDemo.openChainCompany", c.id)}"
    >
      <div class="xb-chain-company-card-top">
        <span class="xb-chain-company-name">${escapeHtml(c.name)}</span>
        <span class="xb-chain-power-dot ${POWER_DOT_CLASS[c.marketPower] || ""}" title="话语权：${escapeHtml(MARKET_POWER_LABELS[c.marketPower] || "")}"></span>
      </div>
      <div class="xb-chain-company-badges">
        <span class="xb-chain-region-badge ${REGION_BADGE_CLASS[c.region] || ""}">${escapeHtml(c.region)}</span>
        <span class="xb-chain-stage-badge">${escapeHtml(STAGE_LABELS[c.stage] || c.stage)}</span>
      </div>
    </button>
  `;
}

let escapeHtml = (s) => String(s ?? "");

export function buildChainPositionPrompt(company) {
  const { name, tierId, marketPower, upstreamTiers, downstreamTiers, description, tags, funding } = company;
  const powerMap = {
    dominant: "支配地位",
    strong: "话语权强",
    moderate: "话语权中等",
    niche: "细分/利基",
  };
  const tierLabel = TIER_LABEL_MAP[tierId] || tierId;
  const upstream =
    (upstreamTiers || []).map((t) => TIER_LABEL_MAP[t] || t).join("、") || "无（产业链底层）";
  const downstream =
    (downstreamTiers || []).map((t) => TIER_LABEL_MAP[t] || t).join("、") || "无（终端应用层）";
  const fundingLine = funding ? `\n- 融资/市值：${funding}` : "";

  return `请基于以下产业链结构数据，对【${name}】的竞争地位与话语权做一次扎实的一级市场尽调分析。

## 输入数据

- 所处层级：${tierLabel}
- 系统评级：${powerMap[marketPower] || marketPower}
- 上游依赖：${upstream}
- 服务下游：${downstream}
- 核心标签：${(tags || []).join("、")}${fundingLine}
- 背景：${description}

---

## 分析质量规范（每个维度都必须遵守）

**规范一：结论必须有证据闭环**
每写下一个判断句，紧跟支撑材料（数据、案例、公开披露）。没有支撑的推断显式标注"（推断）"或"（估算）"。

**规范二：风险分析写完整三段**
结构固定为：风险识别 → 现有对冲措施 → 对冲有效性评估。只讲风险不讲对冲会系统性低估主体韧性。

**规范三：同一维度内的异质性要分层**
如果分析对象内部存在结构差异（存量客户 vs 新客户、高端场景 vs 中低端场景），分开论述，结论可以不同。

**规范四：量化判断附触发条件**
给出任何概率或时间预测时，同步说明：在什么条件下成立，关键驱动变量是什么。

**规范五：类比讲清边界**
使用对标类比时覆盖三点：哪些维度成立、哪些维度失效或需打折、基于对比能得出什么增量结论。

---

## 请按以下五个维度逐一展开

### 1. 生态位判断
在 ${tierLabel} 中，这家公司处于什么位置？描述它的核心价值主张，并与同层 2-3 家竞争对手对比，指出其差异化优势与被替代风险。类比需满足规范五。

### 2. 上游议价能力
分析对上游（${upstream}）的依赖结构。按规范二写完整三段：上游卡脖子风险具体在哪 → 公司现有的对冲动作（如自研、多源、长协） → 这些对冲在当前格局下的实际有效性。

### 3. 下游控制力
分析对下游（${downstream}）的渗透深度。如果下游客群存在异质性（如大客户 vs 长尾），按规范三分层论述，分别判断转换成本与黏性强度。

### 4. 竞争护城河
识别该公司的核心壁垒类型（技术/数据/生态/品牌/监管），每一类壁垒用具体事实支撑，无法支撑的标注"（推断）"。

### 5. 话语权综合结论
给出当前产业链地位的综合判断，并预判未来 18-24 个月内格局演变的 2 种情景。每种情景必须说明触发条件（规范四）。结论控制在 3-5 句，不重复上面已有内容。`;
}

export function renderChainView(eh, icon, jsCall, state, selectedCompanyId = null) {
  escapeHtml = eh;
  const filters = normalizeChainFilters(state?.featureData?.chainFilters);
  const filtered = filterCompanies(filters);
  const filteredByTier = CHAIN_TIERS.map((tier) => ({
    tier,
    companies: filtered.filter((c) => c.tierId === tier.id),
  })).filter((g) => !filters.tiers.length || filters.tiers.includes(g.tier.id));
  const totalShown = filteredByTier.reduce((n, g) => n + g.companies.length, 0);

  const searchVal = escapeHtml(filters.query);
  const tierChips = CHAIN_TIERS.map((tier) =>
    renderFilterChip(
      filters.tiers.includes(tier.id),
      escapeHtml(tier.label),
      tier.color,
      jsCall("XinBaoDemo.chainToggleFilter", "tier", tier.id),
    ),
  ).join("");

  const regionChips = ["CN", "US", "EU"].map((r) =>
    renderFilterChip(
      filters.regions.includes(r),
      escapeHtml(REGION_LABELS[r] || r),
      null,
      jsCall("XinBaoDemo.chainToggleFilter", "region", r),
    ),
  ).join("");

  const stageChips = ["listed", "pre-ipo", "growth", "early"].map((s) =>
    renderFilterChip(
      filters.stages.includes(s),
      escapeHtml(STAGE_LABELS[s] || s),
      null,
      jsCall("XinBaoDemo.chainToggleFilter", "stage", s),
    ),
  ).join("");

  const legend = ["dominant", "strong", "moderate", "niche"]
    .map(
      (p) => `
      <span class="xb-chain-legend-item">
        <span class="xb-chain-power-dot ${POWER_DOT_CLASS[p]}"></span>
        ${escapeHtml(MARKET_POWER_LABELS[p])}
      </span>`,
    )
    .join("");

  const tiersHtml = filteredByTier
    .map(({ tier, companies }) => {
      const cards =
        companies.length > 0
          ? `<div class="xb-chain-company-grid">${companies
              .map((c) => renderCompanyCard(c, selectedCompanyId === c.id, jsCall))
              .join("")}</div>`
          : `<p class="xb-chain-tier-empty">该层暂无符合条件的企业</p>`;
      return `
        <section class="xb-chain-tier-section">
          <header class="xb-chain-tier-head">
            <span class="xb-chain-tier-bar" style="background-color:${tier.color}"></span>
            <div class="xb-chain-tier-meta">
              <h3>${escapeHtml(tier.label)}</h3>
              <p>${escapeHtml(tier.description)}</p>
            </div>
            <span class="xb-chain-tier-count">${companies.length}</span>
          </header>
          ${cards}
        </section>`;
    })
    .join("");

  return `
    <div class="xb-chain-page">
      <div class="xb-chain-toolbar">
        <div class="xb-chain-search-wrap">
          ${icon("search", "icon--sm xb-chain-search-icon")}
          <input
            type="search"
            class="xb-chain-search"
            placeholder="搜索公司名、标签或城市…"
            value="${searchVal}"
            oninput="XinBaoDemo.chainSetQuery(this.value)"
          />
        </div>
        <div class="xb-chain-filter-row">
          <span class="xb-chain-filter-label">层级</span>
          ${tierChips}
        </div>
        <div class="xb-chain-filter-row">
          <span class="xb-chain-filter-label">地区</span>
          ${regionChips}
          <span class="xb-chain-filter-sep">·</span>
          <span class="xb-chain-filter-label">阶段</span>
          ${stageChips}
        </div>
      </div>
      <div class="xb-chain-legend">
        <span>话语权：</span>
        ${legend}
        <span class="xb-chain-legend-total">${totalShown} 家企业</span>
      </div>
      <div class="xb-chain-scroll xb-overlay-scrollbar">
        ${tiersHtml}
      </div>
    </div>
  `;
}

export function renderChainDrawer(company, eh, icon, jsCall) {
  escapeHtml = eh;
  if (!company) return "";
  const tier = tierById(company.tierId);
  if (!tier) return "";

  const upstream =
    (company.upstreamTiers || []).length === 0
      ? "无（产业链底层）"
      : company.upstreamTiers.map((id) => TIER_LABEL_MAP[id] || id).join("、");
  const downstream =
    (company.downstreamTiers || []).length === 0
      ? "无（终端应用层）"
      : company.downstreamTiers.map((id) => TIER_LABEL_MAP[id] || id).join("、");

  const tags = (company.tags || [])
    .map((t) => `<span class="xb-chain-drawer-tag">${escapeHtml(t)}</span>`)
    .join("");

  const nameEn =
    company.nameEn && company.nameEn !== company.name
      ? `<span class="xb-chain-drawer-name-en">${escapeHtml(company.nameEn)}</span>`
      : "";

  const funding = company.funding
    ? `<div class="xb-chain-drawer-funding">${icon("folder", "icon--sm")}<span>${escapeHtml(company.funding)}</span></div>`
    : "";

  return `
    <div class="xb-chain-drawer-mask open" onclick="if(event.target===this)XinBaoDemo.closeChainCompany()">
      <aside class="xb-chain-drawer" role="dialog" aria-label="${escapeHtml(company.name)}">
        <header class="xb-chain-drawer-head">
          <div class="xb-chain-drawer-title-wrap">
            <h3>${escapeHtml(company.name)}${nameEn}</h3>
            <div class="xb-chain-drawer-badges">
              <span class="xb-chain-drawer-tier" style="background-color:${tier.color}">${escapeHtml(tier.label)}</span>
              <span class="xb-chain-drawer-outline-badge">${escapeHtml(REGION_LABELS[company.region])} · ${escapeHtml(company.city)}</span>
              <span class="xb-chain-drawer-outline-badge">${escapeHtml(STAGE_LABELS[company.stage])}</span>
            </div>
          </div>
          <button type="button" class="preview-close" onclick="XinBaoDemo.closeChainCompany()" aria-label="关闭">×</button>
        </header>
        <div class="xb-chain-drawer-body xb-overlay-scrollbar">
          <div class="xb-chain-drawer-power">
            <span class="xb-chain-power-dot ${POWER_DOT_CLASS[company.marketPower]}"></span>
            <div>
              <p class="xb-chain-drawer-muted">话语权评级</p>
              <p class="xb-chain-drawer-power-label">${escapeHtml(MARKET_POWER_LABELS[company.marketPower])}</p>
            </div>
          </div>
          <section class="xb-chain-drawer-section">
            <h4>产业链位置</h4>
            <p><span class="xb-chain-drawer-muted">上游：</span>${escapeHtml(upstream)}</p>
            <p><span class="xb-chain-drawer-muted">下游：</span>${escapeHtml(downstream)}</p>
          </section>
          <section class="xb-chain-drawer-section">
            <h4>公司简介</h4>
            <p class="xb-chain-drawer-desc">${escapeHtml(company.description)}</p>
          </section>
          ${funding}
          <section class="xb-chain-drawer-section">
            <h4>标签</h4>
            <div class="xb-chain-drawer-tags">${tags}</div>
          </section>
          <p class="xb-chain-drawer-geo">${icon("globe", "icon--sm")}<span>${escapeHtml(REGION_LABELS[company.region])} · ${escapeHtml(company.city)}</span></p>
        </div>
        <footer class="xb-chain-drawer-foot">
          <button type="button" class="btn-send xb-chain-drawer-cta" onclick="${jsCall("XinBaoDemo.startChainDd", company.id)}">
            ${icon("chevronRight", "icon--sm")}
            基于产业链位置开始尽调
          </button>
        </footer>
      </aside>
    </div>
  `;
}
