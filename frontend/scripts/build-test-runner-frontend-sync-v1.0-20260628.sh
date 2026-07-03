#!/usr/bin/env bash
# 静态 frontend 与 agent-demo UI 同步冒烟
# 版本: v1.6 | 日期: 2026-07-03
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

test -f styles/chat-density-v1.0-20260628.css
test -f styles/scenario-page-v1.0-20260628.css
test -f styles/scenario-catalog-v1.0-20260629.css
test -f styles/chain-v1.0-20260629.css
test -f styles/xb-scrollbar-v1.0-20260629.css
test -f scripts/chain-demo-v1.0-20260629.js
test -f data/chain-seed-v1.0-20260629.js
test -f scripts/graph-demo-v1.0-20260629.js
test -f scripts/finance-config-demo-v1.0-20260629.js

grep -q "scenarios" scripts/feature-views-v1.0-20260628.js
grep -q "feature-views-v1.0-20260628" scripts/app.js
grep -q "getRadarWeeklyTeaser" scripts/render.js
grep -q "renderGraphView" scripts/render.js
grep -q "renderFinanceConfigView" scripts/render.js

grep -q "研判能力" scripts/render.js
grep -q "项目沉淀" scripts/render.js
grep -q "发现与监控" scripts/render.js
grep -q "renderScenariosView" scripts/render.js
grep -q "renderMarkdown" scripts/render.js
grep -q "chat-ai-disclaimer" scripts/render.js
test -f styles/web-citation-v1.0-20260629.css
test -f styles/ai-output-dock-v1.0-20260629.css
test -f scripts/source-citations-demo-v1.0-20260629.js

grep -q "renderMessageSourceBar" scripts/render.js
grep -q "openSourceCitation" scripts/actions.js
grep -q "sidebarMoreAction" scripts/actions.js
grep -q "artifact-report" scripts/render.js
grep -q "renderAiOutputHeaderMenu" scripts/render.js
grep -q "toggleAiOutputMenu" scripts/actions.js
test -f scripts/materials-demo-v1.0-20260629.js
test -f styles/materials-page-v1.0-20260629.css

grep -q "materials-layout" scripts/materials-demo-v1.0-20260629.js
grep -q "materialsNavigate" scripts/actions.js
grep -q "materialsSelectKb" scripts/actions.js
grep -q "renderMaterialsView" scripts/materials-demo-v1.0-20260629.js
grep -q "copyMessage" scripts/actions.js
grep -q "project-hub-page" scripts/render.js
grep -q "XinBaoDemo.newProjectChat" scripts/render.js
grep -q "SCENARIO_CATEGORY_ICONS" data/mock-data.js
grep -q "xb-scenario-panel" scripts/render.js
grep -q "xb-chain-page" scripts/chain-demo-v1.0-20260629.js
grep -q "chainToggleFilter" scripts/actions.js
grep -q "syncProjectNameFromCompany" scripts/actions.js
grep -q "填写企业全称即可建档" scripts/render.js
grep -q 'title="新会话"' scripts/render.js
grep -q 'import { setToast, openModal, closeModal, closeDrawer } from "./state.js"' scripts/actions.js
test -f scripts/report-template-demo-v1.0-20260703.js
grep -q 'report-templates' scripts/feature-views-v1.0-20260628.js
grep -q 'renderReportTemplatesView' scripts/render.js
grep -q 'reportTemplateNavigate' scripts/actions.js
grep -q '报告模板' scripts/render.js
grep -q 'btn-header-action.*openCreateModal' scripts/render.js
grep -q 'is-active .sidebar-project-nav-actions' styles/layout.css
test -f styles/capability-market-v1.0-20260701.css
test -f data/capability-market-catalog-v1.0-20260701.js
test -f scripts/capability-market-view-v1.0-20260701.js
grep -q 'xb-market-kind-tab' scripts/capability-market-view-v1.0-20260701.js
grep -q 'PLATFORM_SKILLS_CATALOG' data/capability-market-catalog-v1.0-20260701.js

node --input-type=module -e "
import { PLATFORM_SKILLS_CATALOG, PLATFORM_CONNECTORS_CATALOG } from './data/capability-market-catalog-v1.0-20260701.js';
if (PLATFORM_SKILLS_CATALOG.length < 10) throw new Error('skills catalog too short');
if (PLATFORM_CONNECTORS_CATALOG.length < 4) throw new Error('connectors catalog too short');
console.log('capability market catalog ok');
"

node --input-type=module -e "
import { createInitialState } from './scripts/state.js';
import {
  loadRadarFeedIntoState,
  loadRadarBriefingIntoState,
  loadRadarInterestsIntoState,
  getRadarFeedItems,
  getRadarBriefing,
  getRadarInterests,
} from './scripts/radar-feed-v1.0-20260627.js';

const state = createInitialState();
loadRadarFeedIntoState(state, () => {}, '全部');
loadRadarBriefingIntoState(state, () => {});
loadRadarInterestsIntoState(state, () => {});
if (getRadarFeedItems(state).length < 1) throw new Error('radar mock feed empty');
if (!getRadarBriefing(state)?.digest) throw new Error('radar mock briefing empty');
if (getRadarInterests(state).length < 1) throw new Error('radar mock interests empty');
console.log('radar mock checks ok');
"

node --input-type=module -e "
import { renderMarkdown } from './scripts/markdown-render-v1.0-20260627.js';
import { CHAIN_TIERS, findChainCompany, renderChainView, buildChainPositionPrompt } from './scripts/chain-demo-v1.0-20260629.js';
import { SCENARIO_CATEGORY_ICONS } from './data/mock-data.js';
import { createInitialState } from './scripts/state.js';
import { renderApp } from './scripts/render.js';
import { createSession, PROJECT_LIST } from './data/mock-data.js';
import { FEATURE_VIEWS } from './scripts/feature-views-v1.0-20260628.js';
import { renderGraphView } from './scripts/graph-demo-v1.0-20260629.js';
import { renderFinanceConfigView } from './scripts/finance-config-demo-v1.0-20260629.js';
import { renderMaterialsView } from './scripts/materials-demo-v1.0-20260629.js';
import { renderReportTemplatesView } from './scripts/report-template-demo-v1.0-20260703.js';

const html = renderMarkdown('**bold** and list\\n- a\\n- b');
if (!html.includes('<strong>')) throw new Error('markdown render failed');
if (!CHAIN_TIERS.length || !findChainCompany('nvidia')) throw new Error('chain demo failed');
if (!SCENARIO_CATEGORY_ICONS['看清企业']) throw new Error('scenario icons failed');

const chainHtml = renderChainView((s) => s, () => '', (fn) => fn, { featureData: {} });
if (!chainHtml.includes('xb-chain-page')) throw new Error('chain view render failed');
const prompt = buildChainPositionPrompt(findChainCompany('nvidia'));
if (!prompt.includes('分析质量规范') || !prompt.includes('生态位判断')) throw new Error('chain prompt incomplete');

const base = createInitialState();
base.session = createSession();
base.recentItems = [];
base.projectList = PROJECT_LIST;
base.featureData = {};

for (const view of FEATURE_VIEWS) {
  const s = { ...base, view, featureData: { ...(base.featureData || {}) } };
  renderApp(s);
}

const bad = { ...base, view: 'chat', session: { id: 'x', name: 'test' } };
renderApp(bad);

const bad2 = { ...base, view: 'chat', session: createSession({ messages: null }) };
renderApp(bad2);

import { renderMessageSourceBar } from './scripts/source-citations-demo-v1.0-20260629.js';

const citeBar = renderMessageSourceBar(
  [{ id: 1, kind: 'web', title: '示例', snippet: 'demo' }],
  (id) => \`XinBaoDemo.openSourceCitation(0,\${id})\`
);
if (!citeBar.includes('xb-message-source-chip')) throw new Error('source bar render failed');

const graphHtml = renderGraphView((s) => s, () => '', (fn) => fn, { featureData: {} });
if (!graphHtml.includes('graph-layout')) throw new Error('graph demo render failed');
const fcHtml = renderFinanceConfigView((s) => s, () => '', (fn, ...args) => fn, { featureData: { financeConfigTab: 'rules' } });
if (!fcHtml.includes('fc-rule-card')) throw new Error('finance config demo render failed');
const matHtml = renderMaterialsView((s) => s, () => '', (fn, ...args) => fn, { featureData: { materialsSection: 'knowledge', materialsKbId: 'kb-demo-graph' }, projectList: PROJECT_LIST, userMaterials: [] });
if (!matHtml.includes('materials-layout')) throw new Error('materials demo render failed');
if (matHtml.includes('机构模板')) throw new Error('materials should not include template nav');

const tplHtml = renderReportTemplatesView((s) => s, () => '', (fn, ...args) => fn, { featureData: { reportTemplateGroup: 'org' }, userMaterials: [] });
if (!tplHtml.includes('report-templates-layout')) throw new Error('report templates demo render failed');
if (!tplHtml.includes('机构模板')) throw new Error('report templates org group failed');

console.log('frontend-sync checks ok');
"

echo "build-test-runner-frontend-sync-v1.0-20260628: ok"
