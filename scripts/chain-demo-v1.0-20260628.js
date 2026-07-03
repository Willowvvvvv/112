/**
 * AI 产业链探索 — 静态 Demo（对齐 agent-demo /chain）
 * 版本: v1.0 | 日期: 2026-06-28
 */

export const CHAIN_TIERS = [
  { id: "compute", label: "算力/芯片层", description: "GPU、AI 芯片、训练集群", color: "#2563eb" },
  { id: "cloud", label: "云基础设施层", description: "AI 云算力、存储、托管推理", color: "#0ea5e9" },
  { id: "model", label: "基础大模型层", description: "通用/多模态基础大模型", color: "#10b981" },
  { id: "platform", label: "开发平台/框架层", description: "微调、编排、应用开发框架", color: "#f59e0b" },
  { id: "app", label: "垂直应用层", description: "行业 AI 应用", color: "#ef4444" },
];

export const CHAIN_COMPANIES = [
  { id: "nvidia", name: "NVIDIA", tierId: "compute", region: "US", city: "Santa Clara", marketPower: "dominant", description: "全球 AI 算力龙头，GPU 训练与推理基础设施" },
  { id: "huawei", name: "华为技术有限公司", tierId: "compute", region: "CN", city: "深圳", marketPower: "strong", description: "昇腾 AI 芯片与全栈算力方案" },
  { id: "aliyun", name: "阿里云计算有限公司", tierId: "cloud", region: "CN", city: "杭州", marketPower: "strong", description: "国内最大公有云，通义系列模型托管" },
  { id: "tencent-cloud", name: "腾讯云计算（北京）有限责任公司", tierId: "cloud", region: "CN", city: "北京", marketPower: "strong", description: "混元大模型与行业云方案" },
  { id: "baidu", name: "北京百度网讯科技有限公司", tierId: "model", region: "CN", city: "北京", marketPower: "strong", description: "文心大模型与搜索场景落地" },
  { id: "zhipu", name: "北京智谱华章科技有限公司", tierId: "model", region: "CN", city: "北京", marketPower: "moderate", description: "GLM 系列开源与 API 服务" },
  { id: "langchain", name: "LangChain", tierId: "platform", region: "US", city: "San Francisco", marketPower: "strong", description: "LLM 应用编排与 Agent 框架" },
  { id: "sensetime", name: "商汤集团股份有限公司", tierId: "app", region: "CN", city: "上海", marketPower: "moderate", description: "计算机视觉与行业 AI 应用" },
];

export function companiesByTier(tierId) {
  return CHAIN_COMPANIES.filter((c) => c.tierId === tierId);
}

const POWER_LABEL = {
  dominant: "主导",
  strong: "强势",
  moderate: "中等",
  niche: "细分",
};

export function renderChainView(escapeHtml, icon, jsCall, selectedCompanyId = null) {
  const tiers = CHAIN_TIERS.map((tier) => {
    const companies = companiesByTier(tier.id);
    return `
      <section class="chain-tier" style="--tier-color:${tier.color}">
        <header class="chain-tier-head">
          <h3>${escapeHtml(tier.label)}</h3>
          <p>${escapeHtml(tier.description)}</p>
        </header>
        <div class="chain-company-grid">
          ${companies.map((c) => `
            <button type="button" class="chain-company-card${selectedCompanyId === c.id ? " is-selected" : ""}" aria-pressed="${selectedCompanyId === c.id ? "true" : "false"}" onclick="${jsCall("XinBaoDemo.openChainCompany", c.id)}">
              <strong>${escapeHtml(c.name)}</strong>
              <span class="chain-company-meta">${escapeHtml(c.city)} · ${escapeHtml(POWER_LABEL[c.marketPower] || c.marketPower)}</span>
              <span class="chain-company-desc">${escapeHtml(c.description)}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");

  return `
    <div class="chain-page">
      <p class="feature-lead">浏览 AI 产业链各层企业分布，点击公司查看生态位，一键发起产业链定向尽调。</p>
      <div class="chain-tiers">${tiers}</div>
    </div>
  `;
}

export function findChainCompany(id) {
  return CHAIN_COMPANIES.find((c) => c.id === id) || null;
}
