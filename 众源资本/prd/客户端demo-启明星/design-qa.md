# Design QA

## Comparison basis

- Source A: `/var/folders/lc/nj_10ybn0m1c2td94w1n86xh0000gn/T/codex-clipboard-e0485296-65db-4b55-803f-3688f9edbdac.png` (1004 x 856), Codex-style project editor used as the structural reference for Space editing.
- Implementation A: `_verify/codex-space-editor.png` (1200 x 696) and `_verify/codex-space-editor-1024.png` (1024 x 768), state: create Space, select two projects from different project types, mark a primary project.
- Source B: `/var/folders/lc/nj_10ybn0m1c2td94w1n86xh0000gn/T/codex-clipboard-b4b65381-65b2-45d9-8e1e-d12911e39486.png` (3024 x 1766), Codex right-side tab/document panel reference.
- Implementation B: `_verify/codex-space-right-panel.png` (1200 x 696) and `_verify/codex-space-right-panel-1024.png` (1024 x 768), state: task open with a selected output document.
- Full-page evidence: `_verify/codex-space-home-empty.png` (1200 x 696), state: initial home with no Space selected.

## Five-surface review

1. Visual hierarchy: Space selector is kept in the composer context bar; the editor uses a clear title, name field, selected-project list, project picker, and fixed action footer.
2. Spacing and alignment: modal content, list rows, primary badge, remove controls, and footer actions align consistently at 1200 px and 1024 px.
3. Typography and color: neutral Codex-like grayscale hierarchy is preserved; black is reserved for primary actions and active context.
4. Interaction states: initial unselected Space, picker, create/edit, add/remove, set primary, save/cancel, sidebar expansion, artifact open/close, and Escape close were exercised in-browser.
5. Responsive behavior: at 1024 px the Space editor remains fully operable and the right document panel becomes a fixed overlay without compressing the task composer into an unusable width.

## Issue history

- P1 fixed: the sidebar previously grouped tasks by direct investment and fund project types. It now groups only by Space, with unmatched conversations under `独立任务`.
- P1 fixed: the home page previously implied an active context. It now starts with `工作空间 未选择`.
- P1 fixed: Space composition previously had no explicit editor. It now supports combining multiple direct-investment and fund projects, choosing a primary project, and editing membership.
- P1 fixed: the output area previously read as a generic side drawer. It now has document tabs, an add-tab affordance, a breadcrumb/context bar, document actions, and close/reopen behavior.
- P2 fixed: new Space sidebar classes initially lacked the project-row styling aliases; the Space rows now share the verified compact Codex-like row states.

## Verification

- JavaScript syntax: passed (`node --check` for `js/app.js`, data, and PE page modules).
- Diff whitespace validation: passed (`git diff --check` for touched demo files).
- Browser console: 0 errors, 0 warnings.
- Functional path: no Space selected -> open picker -> create a Space -> combine `星河智造` and `纪元 GGV` -> save -> tasks appear in the Space -> open task -> open/close right document panel -> Escape closes panel.

## Final result

passed

---

# 单层文件确认与材料组件 QA · 2026-08-02

## Comparison basis

- Competitor financial workbench: `/Users/ctt/project/finstep/竞品分析/投资云/4.png`.
- Original over-layered implementation: `/var/folders/lc/nj_10ybn0m1c2td94w1n86xh0000gn/T/codex-clipboard-145f0558-b9c0-44ad-990c-51e47769cf3f.png`.
- Final browser captures: `_verify/final-structured-confirm/fund-confirm.png`, `_verify/final-structured-confirm/financial-statements.png`, and `_verify/final-structured-confirm/config-center.png` at 1280 x 720.
- Business truth: `投后数据整理template.xlsx` and `文件解析字段映射-v1.0-20260801.xlsx`; both were imported and inspected with the spreadsheet runtime before UI implementation.

## Five-surface review

1. Information hierarchy: the path is now `返回 / 文件 / 识别结果 / 顶部确认`; the old right-side feature tabs, stacked save/config/validation banners, and bottom duplicate submit were removed from the project confirmation route.
2. Layout and spacing: the existing Qimingxing sidebar, toolbar, grayscale tokens, split-pane layout, table density, borders, and control radii were retained. The file strip scrolls horizontally instead of wrapping into another row.
3. Data component fidelity: eight mock source files automatically select the prebuilt component for GP report, capital account, distribution, financial statements, financing, investment agreement, company registry, or internal ledger.
4. Financial statement completeness: the financial component contains 44 mapped fields across report metadata, balance sheet, income statement, cash-flow statement, equity statement, and notes. The left preview uses the supplied March-June/FY2026 income-statement values.
5. Configuration consistency: Configuration Center now exposes all 10 mapped material types, 135 field definitions, component ownership, recognition scope, validation rules, lineage, and write behavior.

## Issue history

- P1 fixed: missing return path. Added a visible `返回` control that routes to file parsing.
- P1 fixed: two feature tabs and three status banners forced users to understand system structure. Removed them; business progress is part of the GP report result.
- P1 fixed: the confirmation action appeared twice. Only the toolbar action remains.
- P1 fixed: financial statements were absent. Added the complete 44-field financial component with three-statement and cross-statement checks.
- P1 fixed: mocks covered only three fund files. Expanded the task to eight representative source files covering all required component families.
- P1 fixed: Configuration Center remained generic. Replaced the four-card index with the actual 10-type material registry and global rules.
- P2 fixed: right-side rows showed original, calculated, and final values for every field. Simplified each row to editable final value plus a persistent source anchor; calculations appear only when a real validation formula exists.

## Verification

- `DEMO_BASE_URL=http://127.0.0.1:4187 node verify-structured-confirm.js`: passed.
- JavaScript syntax for the two page modules and the guard script: passed.
- Browser assertions: return button present; one top submit; zero bottom submits; zero old feature tabs/status stack; eight source entrances; GP 35 fields; finance 44 fields; configuration 10 types/135 fields.
- Interaction assertions: file switching, source location, field editing, save completion, and return navigation passed.
- Browser console/page errors: 0.
- Visual comparison against the competitor and the original over-layered screen: passed; the implementation keeps the original Qimingxing visual system while adopting the competitor's direct source-to-result workflow.

## Final result

passed

---

# Source extraction workbench QA · 2026-08-02

## Comparison basis

- Source visual truth: `/Users/ctt/project/finstep/竞品分析/投资云/4.png` (3024 x 1766, 72 dpi), supported by `2.png` and `3.png` for field-conflict state.
- Original implementation issue evidence: `/var/folders/lc/nj_10ybn0m1c2td94w1n86xh0000gn/T/codex-clipboard-145f0558-b9c0-44ad-990c-51e47769cf3f.png` (2048 x 1192) and `codex-clipboard-71cbb758-5957-4ef9-8387-46cb89577a33.png` (1016 x 468).
- Browser-rendered implementation: `_verify/source-ui-qa/implementation-fields-final.png` and `_verify/source-ui-qa/implementation-progress-final.png` (1280 x 720 browser viewport, 1x CSS density).
- Normalized full-view comparison: `_verify/source-ui-qa/comparison-final.png`; both captures normalized to 1024 px width and vertically paired in one artifact.
- State: PE · 投资经理, `confirm/fp3`, structured-field view and business-progress view.

## Full-view and focused comparison

- Full view: matched the competitor's one-level numbered file strip and immediate left-source/right-field working area while preserving the existing Qimingxing sidebar, typography, grayscale tokens, and split-pane proportions.
- Focused field region: each business field now shows original value, system recalculation, editable final value, and a visible source anchor. Multi-source MOIC retains both source values beneath the row.
- Focused source region: the left pane now shows spreadsheet position, field, and original value. Source clicks switch the correct file and highlight exact cells such as `B4`, `F14`, and `J22`.
- Focused long-text region: business progress, exit plan, and material events each retain a visible document/page source anchor.

## Five-surface review

1. Fonts and typography: retained the product's existing family, weights, compact 11-13 px data hierarchy, and truncation behavior.
2. Spacing and layout rhythm: removed breadcrumb, file-meta, file-tab, and business-tab stacking; retained one file strip plus two right-pane work tabs. No page or pane horizontal overflow remains.
3. Colors and tokens: retained Qimingxing black/white/gray tokens and existing green validation state; no competitor purple skin was copied.
4. Image and source fidelity: no new decorative assets were introduced. The source pane uses a spreadsheet-grid representation because the current demo data is XLSX-oriented; file number and cell-position traceability is explicit.
5. Copy and content: replaced vague `提取` labels with concrete anchors such as `[1] 基金概览 B4`, `[2] 资本账户 F14`, `[1][3] 两处来源`, and `无原文来源`.

## Comparison history

- P1 fixed: four stacked navigation layers obscured the core task. Reduced to page title, one numbered file strip, and immediate work area.
- P1 fixed: source provenance was represented only as `原文` or `提取`. Added file-number, Sheet/section, and exact-cell/page anchors with click-to-locate behavior.
- P2 fixed: original/system/final/source columns overflowed and made the MOIC conflict row unreadable. Rebuilt the row as fixed field name + three-value grid + source anchor; moved multi-source detail below the row.
- P2 fixed: the left source panel looked like another results table. Added position headers and cell-level selection state.
- P2 fixed: source anchors were too faint. Changed them to persistent gray-surface controls using existing product tokens.

## Primary interactions tested

- Switch among three numbered source files.
- Click `[2] 资本账户 F14` and verify file 2 plus `Sheet1 · F14` source state.
- Click `[1][3] 两处来源` and verify `Gross IRR · J22` state.
- Edit MOIC final value and verify draft auto-save.
- Switch between `结构化字段` and `业务进展`.
- Browser console checked: 0 errors.

## Final result

passed
