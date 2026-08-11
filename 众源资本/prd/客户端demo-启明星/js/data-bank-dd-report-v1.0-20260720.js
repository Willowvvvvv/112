/**
 * 某科技 · 授信尽调报告正文 mock
 * 章节骨架对齐 agent-demo `config/org-dd-report-template-outline-v1.0-20260628.json`
 * （尽调报告模版.docx · 五章结构，银行语境下「拟投」改为「拟授信」）
 * 全局：window.BANK_DD_REPORT
 */
(function () {
  'use strict';

  function citeBtn(id, n) {
    return (
      '<button type="button" class="bk-cite" data-act="cite" data-arg="' +
      id +
      '" title="查看溯源">' +
      n +
      '</button>'
    );
  }

  /* ————————————————————————————————————————
     公用 HTML 片段：表格构建辅助
  ———————————————————————————————————————— */

  /** 摘要表 */
  var HTML_SUMMARY_TABLE =
    '<table class="bk-summary-tbl">' +
    '<tr>' +
      '<td class="bk-st-label">授信机构</td>' +
      '<td colspan="3">某商业银行苏州分行</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-label">客户名称（内部评级）</td>' +
      '<td colspan="3">某科技（苏州）有限公司（内部评级：B+，无外部评级）</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-label" rowspan="5">授信方案</td>' +
      '<td class="bk-st-sub">金额</td>' +
      '<td colspan="2">人民币 3,000 万元</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">交易结构</td>' +
      '<td colspan="2">流动资金贷款 · 一次提款 · 到期还本付息</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">融资期限</td>' +
      '<td colspan="2">36 个月（2026-04 至 2029-04）</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">利率</td>' +
      '<td colspan="2">一年期 LPR + 35BPs（当前 LPR 3.0%，综合利率约 3.35%）</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">还款方式</td>' +
      '<td colspan="2">等额季度付息，到期一次性还本</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-label" rowspan="2">担保方式</td>' +
      '<td class="bk-st-sub">担保类型</td>' +
      '<td colspan="2">保证担保（实际控制人张启明个人连带责任保证）</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">备注</td>' +
      '<td colspan="2">担保方案为工作假设，最终以合同为准 · 股权出质存续需统筹安排</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-label">资金用途</td>' +
      '<td colspan="3">补充日常经营周转，支付研发人力、项目外采服务及软件许可采购款</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-label" rowspan="4">客户基本情况</td>' +
      '<td class="bk-st-sub">基本信息</td>' +
      '<td colspan="2">成立 2016-03-18，注册资本 5,000 万元；苏州某软件行业协会</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">股权结构</td>' +
      '<td colspan="2">实控人张启明：最终受益股份 47.70%、表决权 53.00%；第二自然人李婉清通过持股平台间接持股</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">财务概况（2025 年）</td>' +
      '<td colspan="2">资产总计 25,740 万元；净资产 14,780 万元；营业收入 28,600 万元；净利润 2,140 万元；资产负债率 42.6%</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">主营业务</td>' +
      '<td colspan="2">工业生产执行软件（MES/QMS）产品化 + 数字化实施交付；客户以长三角制造业园区为主；前五大客户集中度 38.6%</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-label" rowspan="4">调查结论</td>' +
      '<td class="bk-st-sub">还款来源</td>' +
      '<td colspan="2">借款人经营现金流为主 + 实控人个人连带保证兜底</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">覆盖率</td>' +
      '<td colspan="2">测算年度 EBITDA 约 3,800 万元；本次授信本息年均约 300 万元，覆盖倍数 &gt; 10×，符合要求</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">主要风险</td>' +
      '<td colspan="2">应收账款集中（同比 +42%）、银行流水缺口待闭合、关联采购定价公允性待核实、股权出质存续</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-st-sub">调查结论</td>' +
      '<td colspan="2"><strong>建议进入信审预沟通 · 待补银行流水后出正式底稿</strong></td>' +
    '</tr>' +
    '</table>';

  /** 现场尽职调查工作表 */
  var HTML_SITE_WORK_TABLE =
    '<p class="bk-tbl-caption">现场尽职调查工作表</p>' +
    '<table class="bk-data-tbl">' +
    '<thead><tr>' +
      '<th style="width:36px">序号</th>' +
      '<th style="width:180px">调查目标</th>' +
      '<th style="width:90px">调查日期</th>' +
      '<th>调查对象</th>' +
      '<th style="width:72px">调查方式</th>' +
      '<th>调查人</th>' +
    '</tr></thead>' +
    '<tbody>' +
    '<tr><td class="num">1</td><td>初步洽谈，了解融资需求及经营基本情况</td><td>2026-01-15</td><td>某科技（苏州）有限公司管理层</td><td>现场访谈</td><td>客户经理 周凯</td></tr>' +
    '<tr><td class="num">2</td><td>收集尽调材料，核实财务数据及审计报告</td><td>2026-02-20</td><td>某科技财务总监 王磊</td><td>现场尽调</td><td>客户经理 周凯</td></tr>' +
    '<tr><td class="num">3</td><td>核实担保方案及融资合同细节，确认实控人保证意愿</td><td>2026-03-05</td><td>实控人张启明 / 法务</td><td>现场访谈</td><td>客户经理 周凯</td></tr>' +
    '</tbody></table>';

  /** 营业收入构成表（单位：万元） */
  var HTML_REVENUE_TABLE =
    '<p class="bk-tbl-caption">营业收入构成（单位：万元）</p>' +
    '<table class="bk-data-tbl">' +
    '<thead><tr>' +
      '<th rowspan="2">项目</th>' +
      '<th colspan="2">2025 年</th>' +
      '<th colspan="2">2024 年</th>' +
      '<th colspan="2">2023 年</th>' +
      '<th colspan="2">2022 年</th>' +
    '</tr><tr>' +
      '<th>金额</th><th>占比</th>' +
      '<th>金额</th><th>占比</th>' +
      '<th>金额</th><th>占比</th>' +
      '<th>金额</th><th>占比</th>' +
    '</tr></thead>' +
    '<tbody>' +
    '<tr>' +
      '<td class="bk-td-total">营业收入合计</td>' +
      '<td class="num bk-td-total">28,600</td><td class="pct bk-td-total">100%</td>' +
      '<td class="num bk-td-total">24,200</td><td class="pct bk-td-total">100%</td>' +
      '<td class="num bk-td-total">19,500</td><td class="pct bk-td-total">100%</td>' +
      '<td class="num bk-td-total">15,300</td><td class="pct bk-td-total">100%</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-td-sub">工业软件产品及许可</td>' +
      '<td class="num">11,440</td><td class="pct">40.0%</td>' +
      '<td class="num">8,470</td><td class="pct">35.0%</td>' +
      '<td class="num">6,240</td><td class="pct">32.0%</td>' +
      '<td class="num">4,590</td><td class="pct">30.0%</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-td-sub">数字化实施及交付</td>' +
      '<td class="num">14,300</td><td class="pct">50.0%</td>' +
      '<td class="num">12,100</td><td class="pct">50.0%</td>' +
      '<td class="num">9,750</td><td class="pct">50.0%</td>' +
      '<td class="num">7,650</td><td class="pct">50.0%</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-td-sub">技术服务及维保续费</td>' +
      '<td class="num">2,860</td><td class="pct">10.0%</td>' +
      '<td class="num">3,630</td><td class="pct">15.0%</td>' +
      '<td class="num">3,510</td><td class="pct">18.0%</td>' +
      '<td class="num">3,060</td><td class="pct">20.0%</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-td-total">营业成本合计</td>' +
      '<td class="num bk-td-total">19,680</td><td class="pct bk-td-total">68.8%</td>' +
      '<td class="num bk-td-total">16,500</td><td class="pct bk-td-total">68.2%</td>' +
      '<td class="num bk-td-total">13,290</td><td class="pct bk-td-total">68.2%</td>' +
      '<td class="num bk-td-total">10,460</td><td class="pct bk-td-total">68.4%</td>' +
    '</tr>' +
    '<tr>' +
      '<td class="bk-td-total">毛利</td>' +
      '<td class="num bk-td-total">8,920</td><td class="pct bk-td-total">31.2%</td>' +
      '<td class="num bk-td-total">7,700</td><td class="pct bk-td-total">31.8%</td>' +
      '<td class="num bk-td-total">6,210</td><td class="pct bk-td-total">31.8%</td>' +
      '<td class="num bk-td-total">4,840</td><td class="pct bk-td-total">31.6%</td>' +
    '</tr>' +
    '</tbody></table>';

  /** 资产负债表摘要（单位：万元） */
  var HTML_BS_TABLE =
    '<p class="bk-tbl-caption">资产负债表摘要（单位：万元）</p>' +
    '<table class="bk-data-tbl">' +
    '<thead><tr>' +
      '<th>科目</th>' +
      '<th>2025 年末</th>' +
      '<th>2024 年末</th>' +
      '<th>2023 年末</th>' +
      '<th>2022 年末</th>' +
    '</tr></thead>' +
    '<tbody>' +
    '<tr><td class="bk-td-h" colspan="5">资产</td></tr>' +
    '<tr><td class="bk-td-sub">货币资金</td><td class="num">4,820</td><td class="num">4,130</td><td class="num">3,210</td><td class="num">2,890</td></tr>' +
    '<tr><td class="bk-td-sub">应收账款</td><td class="num">9,680</td><td class="num">6,810</td><td class="num">4,920</td><td class="num">3,650</td></tr>' +
    '<tr><td class="bk-td-sub">存货</td><td class="num">1,240</td><td class="num">980</td><td class="num">820</td><td class="num">640</td></tr>' +
    '<tr><td class="bk-td-sub">其他流动资产</td><td class="num">4,110</td><td class="num">3,720</td><td class="num">2,340</td><td class="num">1,580</td></tr>' +
    '<tr><td class="bk-td-total">流动资产合计</td><td class="num bk-td-total">19,850</td><td class="num bk-td-total">15,640</td><td class="num bk-td-total">11,290</td><td class="num bk-td-total">8,760</td></tr>' +
    '<tr><td class="bk-td-sub">固定资产（净值）</td><td class="num">3,420</td><td class="num">2,980</td><td class="num">2,310</td><td class="num">1,980</td></tr>' +
    '<tr><td class="bk-td-sub">无形资产</td><td class="num">860</td><td class="num">720</td><td class="num">610</td><td class="num">490</td></tr>' +
    '<tr><td class="bk-td-sub">其他非流动资产</td><td class="num">1,610</td><td class="num">1,110</td><td class="num">860</td><td class="num">710</td></tr>' +
    '<tr><td class="bk-td-total">非流动资产合计</td><td class="num bk-td-total">5,890</td><td class="num bk-td-total">4,810</td><td class="num bk-td-total">3,780</td><td class="num bk-td-total">3,180</td></tr>' +
    '<tr><td class="bk-td-total">资产总计</td><td class="num bk-td-total">25,740</td><td class="num bk-td-total">20,450</td><td class="num bk-td-total">15,070</td><td class="num bk-td-total">11,940</td></tr>' +
    '<tr><td class="bk-td-h" colspan="5">负债</td></tr>' +
    '<tr><td class="bk-td-sub">短期借款</td><td class="num">2,800</td><td class="num">2,100</td><td class="num">1,500</td><td class="num">1,200</td></tr>' +
    '<tr><td class="bk-td-sub">应付账款</td><td class="num">1,960</td><td class="num">1,540</td><td class="num">1,180</td><td class="num">920</td></tr>' +
    '<tr><td class="bk-td-sub">合同负债</td><td class="num">2,440</td><td class="num">1,820</td><td class="num">1,360</td><td class="num">980</td></tr>' +
    '<tr><td class="bk-td-sub">一年内到期非流动负债</td><td class="num">600</td><td class="num">500</td><td class="num">380</td><td class="num">280</td></tr>' +
    '<tr><td class="bk-td-sub">其他流动负债</td><td class="num">1,480</td><td class="num">1,300</td><td class="num">1,000</td><td class="num">800</td></tr>' +
    '<tr><td class="bk-td-total">流动负债合计</td><td class="num bk-td-total">9,280</td><td class="num bk-td-total">7,260</td><td class="num bk-td-total">5,420</td><td class="num bk-td-total">4,180</td></tr>' +
    '<tr><td class="bk-td-sub">长期借款</td><td class="num">1,400</td><td class="num">1,200</td><td class="num">850</td><td class="num">600</td></tr>' +
    '<tr><td class="bk-td-sub">其他非流动负债</td><td class="num">280</td><td class="num">250</td><td class="num">170</td><td class="num">120</td></tr>' +
    '<tr><td class="bk-td-total">非流动负债合计</td><td class="num bk-td-total">1,680</td><td class="num bk-td-total">1,450</td><td class="num bk-td-total">1,020</td><td class="num bk-td-total">720</td></tr>' +
    '<tr><td class="bk-td-total">负债合计</td><td class="num bk-td-total">10,960</td><td class="num bk-td-total">8,710</td><td class="num bk-td-total">6,440</td><td class="num bk-td-total">4,900</td></tr>' +
    '<tr><td class="bk-td-h" colspan="5">所有者权益</td></tr>' +
    '<tr><td class="bk-td-sub">实收资本</td><td class="num">5,000</td><td class="num">5,000</td><td class="num">5,000</td><td class="num">5,000</td></tr>' +
    '<tr><td class="bk-td-sub">资本公积</td><td class="num">1,840</td><td class="num">1,840</td><td class="num">1,840</td><td class="num">1,840</td></tr>' +
    '<tr><td class="bk-td-sub">盈余公积</td><td class="num">920</td><td class="num">780</td><td class="num">630</td><td class="num">480</td></tr>' +
    '<tr><td class="bk-td-sub">未分配利润</td><td class="num">7,020</td><td class="num">4,880</td><td class="num">3,070</td><td class="num">1,280</td></tr>' +
    '<tr><td class="bk-td-total">所有者权益合计</td><td class="num bk-td-total">14,780</td><td class="num bk-td-total">11,740</td><td class="num bk-td-total">8,630</td><td class="num bk-td-total">7,040</td></tr>' +
    '</tbody></table>';

  /** 利润表摘要（单位：万元） */
  var HTML_IS_TABLE =
    '<p class="bk-tbl-caption">利润表摘要（单位：万元）</p>' +
    '<table class="bk-data-tbl">' +
    '<thead><tr>' +
      '<th>科目</th>' +
      '<th>2025 年</th>' +
      '<th>2024 年</th>' +
      '<th>2023 年</th>' +
      '<th>2022 年</th>' +
    '</tr></thead>' +
    '<tbody>' +
    '<tr><td>营业收入</td><td class="num">28,600</td><td class="num">24,200</td><td class="num">19,500</td><td class="num">15,300</td></tr>' +
    '<tr><td>营业成本</td><td class="num">19,680</td><td class="num">16,500</td><td class="num">13,290</td><td class="num">10,460</td></tr>' +
    '<tr><td class="bk-td-total">毛利</td><td class="num bk-td-total">8,920</td><td class="num bk-td-total">7,700</td><td class="num bk-td-total">6,210</td><td class="num bk-td-total">4,840</td></tr>' +
    '<tr><td class="bk-td-sub">毛利率</td><td class="pct">31.2%</td><td class="pct">31.8%</td><td class="pct">31.8%</td><td class="pct">31.6%</td></tr>' +
    '<tr><td>销售费用</td><td class="num">1,430</td><td class="num">1,210</td><td class="num">975</td><td class="num">765</td></tr>' +
    '<tr><td>管理费用</td><td class="num">1,716</td><td class="num">1,452</td><td class="num">1,170</td><td class="num">918</td></tr>' +
    '<tr><td>研发费用</td><td class="num">2,288</td><td class="num">1,936</td><td class="num">1,560</td><td class="num">1,224</td></tr>' +
    '<tr><td>财务费用</td><td class="num">(-14)</td><td class="num">22</td><td class="num">75</td><td class="num">153</td></tr>' +
    '<tr><td class="bk-td-total">营业利润</td><td class="num bk-td-total">2,780</td><td class="num bk-td-total">2,420</td><td class="num bk-td-total">1,950</td><td class="num bk-td-total">1,320</td></tr>' +
    '<tr><td>利润总额</td><td class="num">2,780</td><td class="num">2,420</td><td class="num">1,955</td><td class="num">1,328</td></tr>' +
    '<tr><td>所得税费用</td><td class="num">640</td><td class="num">610</td><td class="num">465</td><td class="num">348</td></tr>' +
    '<tr><td class="bk-td-total">净利润</td><td class="num bk-td-total">2,140</td><td class="num bk-td-total">1,810</td><td class="num bk-td-total">1,490</td><td class="num bk-td-total">980</td></tr>' +
    '<tr><td class="bk-td-sub">净利率</td><td class="pct">7.5%</td><td class="pct">7.5%</td><td class="pct">7.6%</td><td class="pct">6.4%</td></tr>' +
    '</tbody></table>';

  /** 主要财务指标表 */
  var HTML_RATIO_TABLE =
    '<p class="bk-tbl-caption">主要财务指标</p>' +
    '<table class="bk-data-tbl">' +
    '<thead><tr>' +
      '<th>指标</th>' +
      '<th>2025 年</th>' +
      '<th>2024 年</th>' +
      '<th>2023 年</th>' +
      '<th>2022 年</th>' +
    '</tr></thead>' +
    '<tbody>' +
    '<tr><td class="bk-td-h" colspan="5">偿债能力</td></tr>' +
    '<tr><td>资产负债率</td><td class="num">42.6%</td><td class="num">42.6%</td><td class="num">42.7%</td><td class="num">41.0%</td></tr>' +
    '<tr><td>流动比率</td><td class="num">2.14</td><td class="num">2.15</td><td class="num">2.08</td><td class="num">2.10</td></tr>' +
    '<tr><td>速动比率</td><td class="num">1.93</td><td class="num">1.87</td><td class="num">1.89</td><td class="num">1.92</td></tr>' +
    '<tr><td>有息负债（万元）</td><td class="num">4,200</td><td class="num">3,300</td><td class="num">2,350</td><td class="num">1,800</td></tr>' +
    '<tr><td class="bk-td-h" colspan="5">盈利能力</td></tr>' +
    '<tr><td>毛利率</td><td class="num">31.2%</td><td class="num">31.8%</td><td class="num">31.8%</td><td class="num">31.6%</td></tr>' +
    '<tr><td>净利率</td><td class="num">7.5%</td><td class="num">7.5%</td><td class="num">7.6%</td><td class="num">6.4%</td></tr>' +
    '<tr><td>EBITDA（万元，估算）</td><td class="num">3,800</td><td class="num">3,180</td><td class="num">2,540</td><td class="num">1,850</td></tr>' +
    '<tr><td>利息保障倍数</td><td class="num">12.3×</td><td class="num">11.5×</td><td class="num">10.8×</td><td class="num">9.4×</td></tr>' +
    '<tr><td class="bk-td-h" colspan="5">运营能力</td></tr>' +
    '<tr><td>应收账款周转天数</td><td class="num">124 天</td><td class="num">103 天</td><td class="num">92 天</td><td class="num">87 天</td></tr>' +
    '<tr><td>存货周转天数</td><td class="num">23 天</td><td class="num">22 天</td><td class="num">23 天</td><td class="num">22 天</td></tr>' +
    '<tr><td class="bk-td-h" colspan="5">现金流</td></tr>' +
    '<tr><td>经营活动现金流净额（万元）</td><td class="num">3,140</td><td class="num">2,580</td><td class="num">2,180</td><td class="num">1,620</td></tr>' +
    '<tr><td>经营现金流 / 净利润</td><td class="num">1.47×</td><td class="num">1.43×</td><td class="num">1.46×</td><td class="num">1.65×</td></tr>' +
    '</tbody></table>';

  /** 融资情况表 */
  var HTML_DEBT_TABLE =
    '<p class="bk-tbl-caption">承租人融资情况（截至 2026-03，单位：万元）</p>' +
    '<table class="bk-data-tbl">' +
    '<thead><tr>' +
      '<th style="width:32px">序号</th>' +
      '<th>债权人</th>' +
      '<th>融资类型</th>' +
      '<th>余额</th>' +
      '<th>利率</th>' +
      '<th>期限</th>' +
      '<th>担保方式</th>' +
      '<th>到期日</th>' +
    '</tr></thead>' +
    '<tbody>' +
    '<tr><td class="num">1</td><td>某商业银行苏州分行</td><td>流动资金贷款</td><td class="num">2,000</td><td class="num">3.35%</td><td>12 个月</td><td>实控人保证</td><td>2027-01</td></tr>' +
    '<tr><td class="num">2</td><td>某城商行苏州支行</td><td>短期借款</td><td class="num">800</td><td class="num">3.45%</td><td>12 个月</td><td>股权质押</td><td>2026-09</td></tr>' +
    '<tr><td class="num">3</td><td>某国股行苏州分行</td><td>中长期贷款</td><td class="num">1,400</td><td class="num">3.80%</td><td>36 个月</td><td>设备抵押</td><td>2027-06</td></tr>' +
    '<tr>' +
      '<td class="bk-td-total" colspan="3">合计</td>' +
      '<td class="num bk-td-total">4,200</td>' +
      '<td class="pct bk-td-total">—</td>' +
      '<td class="bk-td-total">—</td>' +
      '<td class="bk-td-total">—</td>' +
      '<td class="bk-td-total">—</td>' +
    '</tr>' +
    '</tbody>' +
    '<tfoot><tr><td colspan="8" style="font-size:11px;color:#8992a3;padding:5px 8px;">注：以上数据来自客户提供融资台账及财跃启明星公开记录综合整理，融资余额以银行对账单为准 · 本稿未收到完整银行流水</td></tr></tfoot>' +
    '</table>';

  /** @returns {{ sections: object[], cites: object[], gaps: object[] }} */
  function buildHuachengCreditDdReport(ctx) {
    var company = (ctx && ctx.company) || '某科技（苏州）有限公司';
    var code = (ctx && ctx.creditCode) || '91320500XXXXXXXXXX';
    var amount = (ctx && ctx.amount) || '3000 万';
    var term = (ctx && ctx.term) || '36 个月';
    var c = citeBtn;

    var cites = [
      {
        id: 'c1',
        label: '1',
        claim: '统一社会信用代码与存续状态',
        source: '营业执照.pdf',
        page: 'P1',
        detail: '字段：统一社会信用代码 / 名称 / 登记状态'
      },
      {
        id: 'c2',
        label: '2',
        claim: '法定代表人、注册资本、成立日期',
        source: '财跃启明星 · 工商照面',
        page: 'T+3',
        detail: 'get_company_profile · 法代张启明 · 注册资本 5000 万'
      },
      {
        id: 'c3',
        label: '3',
        claim: '本次申请额度与期限',
        source: '授信申请表（客户经理录入）',
        page: '—',
        detail: '额度 ' + amount + ' · 期限 ' + term + ' · 流动资金贷款'
      },
      {
        id: 'c4',
        label: '4',
        claim: '实控人最终受益股份与表决权',
        source: '财跃启明星 · 实控人/受益所有人',
        page: '穿透链',
        detail: '最终受益股份 47.6955% · 表决权 53.0011%'
      },
      {
        id: 'c5',
        label: '5',
        claim: '股权结构与章程约定',
        source: '公司章程.pdf',
        page: '§股权 / P6–P9',
        detail: '股东会表决规则 · 董事会席位'
      },
      {
        id: 'c6',
        label: '6',
        claim: '对外投资主体清单',
        source: '财跃启明星 · 对外投资',
        page: '列表',
        detail: '澄海商贸（持股 80%）等'
      },
      {
        id: 'c7',
        label: '7',
        claim: '发明专利与软著数量',
        source: '财跃启明星 · 知识产权',
        page: '汇总',
        detail: '发明专利 6 · 软著 18（在册有效口径）'
      },
      {
        id: 'c8',
        label: '8',
        claim: '股权出质存续',
        source: '财跃启明星 · 股权出质',
        page: '在册',
        detail: '质权人：苏州某银行 · 出质股权对应注册资本 800 万'
      },
      {
        id: 'c9',
        label: '9',
        claim: '关联方澄海商贸往来',
        source: '审计报告_2025.pdf',
        page: 'P42 · 关联交易附注',
        detail: '向关联方采购技术服务 1260 万'
      },
      {
        id: 'c10',
        label: '10',
        claim: '公开司法面：失信/被执行计数',
        source: '财跃启明星 · 风险扫描',
        page: 'T+0',
        detail: '失信 0 · 被执行 0 · 限高 0（企业自身）'
      },
      {
        id: 'c11',
        label: '11',
        claim: '历史环保处罚已销案',
        source: '财跃启明星 · 行政处罚',
        page: '历史',
        detail: '2022 年危废管理类 · 罚款 8 万 · 已履行完毕'
      },
      {
        id: 'c12',
        label: '12',
        claim: '营收、毛利、净利摘要',
        source: '审计报告_2025.pdf',
        page: 'P12–P18 · 利润表',
        detail: '营业收入 2.86 亿 · 毛利率 31.2% · 净利润 2140 万'
      },
      {
        id: 'c13',
        label: '13',
        claim: '货币资金期末数',
        source: '审计报告_2025.pdf · OCR',
        page: 'P12 · 资产负债表',
        detail: '货币资金 4820 万元（OCR 已采 · 待/已确认）'
      },
      {
        id: 'c14',
        label: '14',
        claim: '应收账款同比增速',
        source: '审计报告_2025.pdf',
        page: 'P18 · 应收附注',
        detail: '应收账款期末 9680 万 · 同比 +42%'
      },
      {
        id: 'c15',
        label: '15',
        claim: '资产负债勾稽',
        source: '审计报告_2025.pdf',
        page: 'P3 · 审计意见段附近',
        detail: '资产合计 = 负债 + 所有者权益 · 基础勾稽通过'
      },
      {
        id: 'c16',
        label: '16',
        claim: '主要客户集中度',
        source: '审计报告_2025.pdf',
        page: 'P36 · 前五大客户',
        detail: '前五大客户收入占比 38.6%'
      },
      {
        id: 'c17',
        label: '17',
        claim: '增值税纳税信用',
        source: '财跃启明星 · 税务相关',
        page: '公开',
        detail: '一般纳税人 · 近期待缴/欠税公开记录未见'
      }
    ];

    var sections = [
      {
        id: 'ch1',
        title: '第一章  授信背景',
        status: '已生成',
        gap: false,
        html:
          HTML_SUMMARY_TABLE +
          HTML_SITE_WORK_TABLE +
          '<h4>1. 目标公司简介</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> ' +
          company +
          '（下称「目标公司」或「某科技」），统一社会信用代码' +
          code +
          c('c1', '1') +
          '，登记状态存续（在营）。住所苏州市工业园区星湖街 328 号；法定代表人张启明；注册资本人民币 5000 万元；成立日期 2016-03-18' +
          c('c2', '2') +
          '。所属行业：软件和信息技术服务业。经营范围以软件开发、信息系统集成、集成电路设计及相关技术服务为主。</p>' +
          '<p>目标公司定位为工业软件与行业数字化解决方案提供商，客户以长三角制造业、园区运营方及部分政务信息化项目为主。公开面与执照信息一致，主体锚定无歧义。</p>' +
          '<h4>2. 本次融资（授信）概况</h4>' +
          '<p>本次向本行申请流动资金贷款额度 <strong>' +
          amount +
          '</strong>、期限 <strong>' +
          term +
          '</strong>' +
          c('c3', '3') +
          '，用途表述为补充日常经营周转、支付研发及实施项目人力成本与外采服务款。客户经理周凯受理；风险初评口径为「中」（内部工作底稿，非正式评级结论）。</p>' +
          '<p>申请材料已入库：营业执照、公司章程、2025 年度审计报告（扫描件，OCR 采数）。' +
          '<span class="bk-dd-gap-inline">【缺】近一年银行流水未入库</span>，收入回款与经营性现金流交叉验证尚未闭合，相关判断见第四章与第五章。</p>' +
          '<h4>3. 我方拟授信方案（工作底稿）</h4>' +
          '<p>工作假设（非正式批贷意见）：额度不超过申请额、期限匹配项目回款周期；担保方式待客户经理与风险条线按行内制度补录。本稿仅整理可核验事实、红旗与材料缺口，<strong>不替代授信审批结论</strong>。</p>'
      },
      {
        id: 'ch2',
        title: '第二章  公司基本情况',
        status: '已生成',
        gap: false,
        html:
          '<h4>一、公司概况</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> 目标公司为有限责任公司，股权相对集中。注册资本 5000 万元，实缴情况以章程及年报披露为准。主营与工商登记范围匹配，未见明显超范围经营公开信号。</p>' +
          '<h4>二、历史沿革</h4>' +
          '<p>2016 年设立于苏州工业园区；2018–2020 年完成两轮增资（注册资本由 1000 万增至 5000 万）；2021 年后业务重心由定制开发转向「产品化工业软件 + 实施交付」组合。</p>' +
          '<h4>三、实际控制人</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> 公开面识别实际控制人为<strong>张启明</strong>：最终受益股份 <strong>47.6955%</strong>、表决权 <strong>53.0011%</strong>' +
          c('c4', '4') +
          '。张启明同时担任法定代表人、执行董事兼总经理。' +
          '<span class="tri-warn">【待核实】</span> 是否存在一致行动安排或代持，建议调取股东会决议及受益所有人声明原件交叉核验。</p>' +
          '<h4>四、治理结构及组织架构</h4>' +
          '<p>治理架构为执行董事 + 经理层，未设董事会（章程约定）' +
          c('c5', '5') +
          '。设监事一名。内部按「产品研发 / 交付实施 / 售前与商务 / 职能支持」划分，在职约 186 人。</p>' +
          '<h4>五、对外投资情况</h4>' +
          '<p>主要对外投资包括：苏州澄海商贸有限公司（持股 80%）' +
          c('c6', '6') +
          '、以及两家持股比例较低的技术服务合伙企业。澄海商贸与目标公司存在采购类关联交易，关联采购需关注定价公允性。</p>' +
          '<h4>六、主要资产情况</h4>' +
          '<p>知识产权：在册发明专利 6 项、软件著作权 18 项' +
          c('c7', '7') +
          '，与主营工业软件方向相符。' +
          '<span class="tri-warn">【待核实】</span> 资产受限：存在股权出质存续，出质对应注册资本约 800 万元，质权人为苏州某银行' +
          c('c8', '8') +
          '；受限货币资金（保证金性质）约 320 万元。</p>' +
          '<h4>七、重大负债</h4>' +
          '<p>有息负债以短期借款与一年内到期非流动负债为主，期末有息余额约 4,200 万元；应付账款与合同负债反映实施类业务结算节奏。对外担保公开记录未见。</p>' +
          '<h4>八、关联交易和同业竞争</h4>' +
          '<p>2025 年度向澄海商贸采购技术服务 1,260 万元' +
          c('c9', '9') +
          '，审计报告披露定价原则为「参考市场价格」，但未附独立比价底稿。' +
          '<span class="tri-warn">【待核实】</span> 建议补充合同、结算单与可比报价，排除利益输送疑点。</p>' +
          '<h4>九、诉讼、仲裁或行政处罚</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> 企业自身当前公开面：失信 0、被执行 0、限高 0' +
          c('c10', '10') +
          '。历史环保处罚 2022 年罚款 8 万元，已履行销案' +
          c('c11', '11') +
          '。本稿只陈述命中事实与计数，<strong>不替本行判定能否授信</strong>。</p>'
      },
      {
        id: 'ch3',
        title: '第三章  公司业务及行业地位',
        status: '已生成',
        gap: false,
        html:
          '<h4>一、业务概况</h4>' +
          HTML_REVENUE_TABLE +
          '<p><strong>1. 主要产品/服务：</strong>① 工业生产执行与质量追溯软件（产品化 license + 年维）；② 工厂数字化实施与集成（人天交付）；③ 少量芯片设计辅助工具授权。</p>' +
          '<p><strong>2. 商业模式：</strong>「产品获客 → 实施做深 → 维保续费」；回款节点多为合同签署预付、上线验收、质保尾款。账期受制造业客户付款节奏影响，应收偏高与该模式相关。</p>' +
          '<p><strong>3. 研发体系：</strong>设产品研发中心，年度研发费用率约 8%（利润表口径），在册发明专利 6 项、软著 18 项匹配。</p>' +
          '<p><strong>4. 主要客户：</strong>前五大客户收入合计占比 38.6%' +
          c('c16', '16') +
          '，集中度中等；第一大客户为园区制造龙头，单一客户依赖可控。</p>' +
          '<h4>二、公司所处行业的基本情况</h4>' +
          '<p><strong>1. 行业政策：</strong>工业软件国产替代与智能制造相关政策持续出台，目标公司业务方向与政策鼓励领域一致；具体补贴到账情况未见专项材料，不作收入加持假设。</p>' +
          '<p><strong>2. 行业格局：</strong>工业软件赛道参与者多，产品化头部与区域实施型公司并存；价格与交付能力竞争激烈。</p>' +
          '<p><strong>3. 公司市场地位：</strong>区域性解决方案商，在苏州及周边制造业客户口碑与案例密度较高。市场地位表述仅供讨论，非评级结论。</p>'
      },
      {
        id: 'ch4',
        title: '第四章  公司财务和税务情况',
        status: '缺口',
        gap: true,
        html:
          '<h4>一、财务情况分析</h4>' +
          HTML_BS_TABLE +
          HTML_IS_TABLE +
          HTML_RATIO_TABLE +
          '<p><strong>1. 盈利能力：</strong>毛利率 31.2%' +
          c('c12', '12') +
          '，处于实施+产品组合的合理区间；净利率约 7.5%。同比营收增长约 18%，净利润增长低于营收，费用端研发与交付人力上升是主因。</p>' +
          '<p><strong>2. 偿债能力：</strong>资产负债率 42.6%，有息负债 4,200 万元相对 EBITDA（约 3,800 万）尚可覆盖；利息保障倍数 12.3×，偿债安全边际充足。受限货币资金 320 万元降低即时流动性。</p>' +
          '<p><strong>3. 运营能力：</strong>应收账款周转天数拉长至 124 天，同比 <strong>+42%</strong>，显著高于收入增速，存在收入确认节奏与回款错配或客户账期拉长的可能。' +
          '<span class="bk-dd-gap-inline">【缺】近一年银行流水未入库，无法完成「收入—回款—流水」三方勾稽，本章对收入真实性不作定论</span>。</p>' +
          '<h4>二、税务情况分析</h4>' +
          '<p>一般纳税人；增值税纳税信用公开信息未见当前欠税公告' +
          c('c17', '17') +
          '。企业所得税汇算清缴细节未附完税证明原件，建议补。关联采购可能影响进项与费用真实性审查，税务风险项保持「关注」。</p>'
      },
      {
        id: 'ch5',
        title: '第五章  问题及分析建议',
        status: '已生成',
        gap: false,
        html:
          HTML_DEBT_TABLE +
          '<h4>一、财务方面</h4>' +
          '<ol class="bk-dd-list">' +
          '<li><span class="tri-warn">【待核实】</span> 应收账款同比 +42% 与收入增速背离：建议账龄分层、前十大应收客户对账，并在补齐流水后做回款匹配。</li>' +
          '<li><span class="tri-na">【暂无法分析】</span> 收入真实性：缺近一年银行流水，相关段落暂停定论；授信讨论材料须明示该缺口。</li>' +
          '<li><span class="tri-warn">【待核实】</span> 关联采购 1260 万：补合同、结算与比价，评估对成本和利润的影响。</li>' +
          '<li><span class="tri-ok">【证据充分】</span> 报表基础勾稽与审计意见段未提示持续经营重大不确定性。</li>' +
          '</ol>' +
          '<h4>二、法律与合规方面</h4>' +
          '<ol class="bk-dd-list">' +
          '<li><span class="tri-ok">【证据充分】</span> 当前公开面未见失信/被执行/限高在册记录；历史处罚已销案，建议归档处罚决定书与缴款凭证。</li>' +
          '<li><span class="tri-warn">【待核实】</span> 股权出质存续：与拟授信担保、股权稳定性一并评估，必要时取得质权人同意或置换方案。</li>' +
          '<li><span class="tri-warn">【待核实】</span> 受益所有人 / 一致行动：补声明原件与股权代持排查。</li>' +
          '</ol>' +
          '<h4>三、调查结论取向（非审批决定）</h4>' +
          '<p>在补齐<strong>近一年银行流水</strong>并完成 OCR 定稿、关联交易与股权出质核实后，本稿可作为授信调查讨论底稿进入信审预沟通。当前状态：<strong>报告草稿 · 有缺口</strong>。AI 与系统仅整理事实、红旗与材料缺口，<strong>不替代本行授信 / 准入审批结论</strong>。</p>'
      }
    ];

    var gaps = [
      {
        id: 'g-flow',
        title: '银行流水（近一年）',
        detail: '必收未上传 · 收入真实性章无法闭合三方勾稽'
      },
      {
        id: 'g-ocr',
        title: '财报 OCR 确认',
        detail: '扫描件数字待右侧双栏校对后方可锁定财务章口径'
      }
    ];

    return { sections: sections, cites: cites, gaps: gaps };
  }

  /** 任务工作区章节 ↔ 五章报告映射（供 draftByChapter 复用） */
  function taskDraftFromFullReport() {
    var full = buildHuachengCreditDdReport({});
    var byId = {};
    full.sections.forEach(function (s) {
      byId[s.id] = s;
    });
    return {
      chapters: [
        { id: 'ch-overview', title: '授信方案摘要', status: 'ok', note: '已生成 · 含摘要表', map: 'ch1' },
        { id: 'ch-equity', title: '股权与实控', status: 'ok', note: '已生成', locked: true, map: 'ch2' },
        { id: 'ch-judicial', title: '司法与公开风险', status: 'ok', note: '已生成', map: 'ch2' },
        {
          id: 'ch-income',
          title: '收入真实性',
          status: 'warn',
          note: '局部暂停 · 缺银行流水',
          map: 'ch4'
        },
        { id: 'ch-finance', title: '财务分析', status: 'ok', note: '已生成 · 含三年财务表', map: 'ch4' },
        {
          id: 'ch-credit',
          title: '授信建议（初稿）',
          status: 'ok',
          note: '已生成 · 含融资情况表',
          map: 'ch5'
        }
      ],
      draftByChapter: {
        'ch-overview': {
          title: '一、授信方案摘要',
          html: byId.ch1.html
        },
        'ch-equity': {
          title: '二、股权与公司基本情况（摘自第二章）',
          html: byId.ch2.html
        },
        'ch-judicial': {
          title: '三、诉讼、仲裁或行政处罚（摘自第二章·九）',
          html:
            '<p><span class="tri-ok">【证据充分】</span> 企业自身当前公开面：失信 0、被执行 0、限高 0' +
            citeBtn('c10', '10') +
            '。历史环保处罚已销案' +
            citeBtn('c11', '11') +
            '。只陈述事实与计数，不构成授信通过与否结论。</p>'
        },
        'ch-income': {
          title: '四、收入真实性',
          html:
            '<p><span class="tri-na">【暂无法分析】</span> <span class="bk-dd-gap-inline">【缺】近一年银行流水未入库</span>，无法完成收入—回款—流水勾稽，本章不作收入真实性定论。</p>' +
            '<p><span class="tri-warn">【待核实】</span> 应收账款同比 +42%' +
            citeBtn('c14', '14') +
            '，待流水闭合后复核。</p>' +
            HTML_REVENUE_TABLE
        },
        'ch-finance': {
          title: '五、财务分析（摘自第四章）',
          html: byId.ch4.html
        },
        'ch-credit': {
          title: '六、问题及调查建议（摘自第五章）',
          html: byId.ch5.html
        }
      },
      evidenceByChapter: {
        'ch-overview': full.cites
          .filter(function (x) {
            return ['c1', 'c2', 'c3'].indexOf(x.id) >= 0;
          })
          .map(citeToEvidence),
        'ch-equity': full.cites
          .filter(function (x) {
            return ['c4', 'c5', 'c6', 'c8', 'c9'].indexOf(x.id) >= 0;
          })
          .map(citeToEvidence),
        'ch-judicial': full.cites
          .filter(function (x) {
            return ['c10', 'c11'].indexOf(x.id) >= 0;
          })
          .map(citeToEvidence),
        'ch-income': ['待补：银行流水（近一年）', '审计报告_2025.pdf · P18 应收附注'],
        'ch-finance': full.cites
          .filter(function (x) {
            return ['c12', 'c13', 'c14', 'c15', 'c17'].indexOf(x.id) >= 0;
          })
          .map(citeToEvidence),
        'ch-credit': ['依赖上游待核实 · 仅出谨慎初稿', '缺口：银行流水']
      },
      cites: full.cites
    };
  }

  function citeToEvidence(c) {
    return (
      '[' +
      c.label +
      '] ' +
      c.source +
      (c.page ? ' · ' + c.page : '') +
      (c.detail ? ' · ' + c.detail : '')
    );
  }

  window.BANK_DD_REPORT = {
    buildHuachengCreditDdReport: buildHuachengCreditDdReport,
    taskDraftFromFullReport: taskDraftFromFullReport,
    templateRef:
      'agent-demo/config/org-dd-report-template-outline-v1.0-20260628.json（尽调报告模版.docx 五章骨架）'
  };

  /* 任务工作区复用同一份完整正文 */
  (function patchReportTask() {
    var data = window.BANK_DATA;
    if (!data || !data.reportTasks || !data.reportTasks['task-huacheng-dd']) return;
    var pack = taskDraftFromFullReport();
    var task = data.reportTasks['task-huacheng-dd'];
    task.chapters = pack.chapters.map(function (c) {
      return {
        id: c.id,
        title: c.title,
        status: c.status,
        note: c.note,
        locked: !!c.locked
      };
    });
    task.draftByChapter = pack.draftByChapter;
    task.evidenceByChapter = pack.evidenceByChapter;
    task.cites = pack.cites;
    task.progress = 82;
    task.statusLabel = '草稿已齐 · 流水缺口标红';
    var fin = task.chapters.filter(function (c) {
      return c.id === 'ch-finance';
    })[0];
    if (fin) {
      fin.status = 'ok';
      fin.note = '已生成 · 含三年财务表';
    }
    var credit = task.chapters.filter(function (c) {
      return c.id === 'ch-credit';
    })[0];
    if (credit) {
      credit.status = 'ok';
      credit.note = '已生成 · 含融资情况表';
    }
  })();
})();
