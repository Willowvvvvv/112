/**
 * 某科技 · 受益所有人报告正文 mock（完整版）
 * 穿透链：某科技 → 张启明 → 关联企业网络（企业—人—企业全链）
 * 章节对齐 reportTasks['task-huacheng-ubo']（data-bank.js）
 * 全局：window.BANK_UBO_REPORT
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
  var c = citeBtn;

  /* ─────────────────────────────────────────────────
     主工厂函数
  ───────────────────────────────────────────────── */
  function buildHuachengUboReport(ctx) {
    var company = (ctx && ctx.company) || '某科技（苏州）有限公司';
    var code    = (ctx && ctx.creditCode) || '91320500XXXXXXXXXX';

    /* ── 证据溯源表（16 条） ── */
    var cites = [
      {
        id: 'uc1', label: '1',
        claim: '工商照面核验',
        source: '营业执照.pdf',
        page: '照面页',
        detail: '登记状态存续 · 法代张启明 · 注册资本 5,000 万元 · 成立 2016-03-18'
      },
      {
        id: 'uc2', label: '2',
        claim: '公司章程节录',
        source: '公司章程.pdf（2026-07-10 版）',
        page: 'P3–P8 · 股权与表决',
        detail: '股东列表 · 出资比例 · 表决权安排 · 澄明合伙 GP 协议约定'
      },
      {
        id: 'uc3', label: '3',
        claim: '财跃启明星穿透计算',
        source: '财跃启明星接口 · 受益所有人识别',
        page: '受益所有人',
        detail: '张启明直接 28% + 澄明合伙穿透 19.6955% = 47.6955%；表决权 53.0011%'
      },
      {
        id: 'uc4', label: '4',
        claim: '澄明合伙工商登记',
        source: '财跃启明星 · 苏州澄明企业管理合伙企业',
        page: '工商照面',
        detail: 'GP：张启明 61.5484%；LP：李婉清 20%；员工 LP：18.4516%；成立 2019-11-20'
      },
      {
        id: 'uc5', label: '5',
        claim: '张启明董监高任职',
        source: '财跃启明星 · 自然人检索',
        page: '任职记录',
        detail: '当前 5 家企业任职；历史 1 家退出（朗远软件 2021-03）'
      },
      {
        id: 'uc6', label: '6',
        claim: '张启明对外投资',
        source: '财跃启明星 · 自然人持股',
        page: '对外投资',
        detail: '直接持股 3 家；通过澄明合伙 GP 间接控制某科技；启明数字科技 100% 持股'
      },
      {
        id: 'uc7', label: '7',
        claim: '澄海商贸被执行记录',
        source: '财跃启明星 · 司法风险',
        page: '被执行信息',
        detail: '2 条未结清：(2025)苏 0512 执 1188 号 · (2024)苏 0512 执 3301 号 · 合计标的约 86.5 万元'
      },
      {
        id: 'uc8', label: '8',
        claim: '启明数字科技照面',
        source: '财跃启明星 · 苏州启明数字科技有限公司',
        page: '工商照面',
        detail: '存续 · 张启明 100% 持股法代 · 注册资本 500 万元 · 成立 2021-06 · 软件开发'
      },
      {
        id: 'uc9', label: '9',
        claim: '李婉清任职投资查询',
        source: '财跃启明星 · 自然人检索',
        page: '任职 / 持股',
        detail: '2 家企业：澄明合伙 LP 20% · 婉清管理咨询 100% 持股法代；无风险记录'
      },
      {
        id: 'uc10', label: '10',
        claim: '赵昕任职投资查询',
        source: '财跃启明星 · 自然人检索',
        page: '任职 / 持股',
        detail: '3 家企业：某科技 11.2% · 远启投资 60% 法代 · 深圳远诚科技 30%；历史被执行 1 条已结清'
      },
      {
        id: 'uc11', label: '11',
        claim: '深圳远诚被执行查询',
        source: '财跃启明星 · 司法风险',
        page: '被执行信息',
        detail: '历史 1 条：(2025)粤 0306 执 5201 号 · 已结清（2025-09）· 当前 0 条'
      },
      {
        id: 'uc12', label: '12',
        claim: 'BOMIS 系统对比',
        source: '央行受益所有人信息管理系统',
        page: '核验记录',
        detail: '某科技 BOMIS 登记 UBO：张启明（2024-12-01）· 与本次识别结论一致；李婉清未单独登记'
      },
      {
        id: 'uc13', label: '13',
        claim: '朗远软件退出记录',
        source: '财跃启明星 · 历史股权变更',
        page: '历史变更',
        detail: '张启明曾持股 31.5% · 2021-03 完全退出 · 工商变更已公示 · 当前持股 0%'
      },
      {
        id: 'uc14', label: '14',
        claim: '境外层工商数据',
        source: '上海弘晟资本 · VCC/BVI 穿透尝试',
        page: '股东资料',
        detail: '弘晟资本管理有限公司 → Hongshen Capital Mgmt Ltd（开曼）→ 境外穿透受限，仅可见一层'
      },
      {
        id: 'uc15', label: '15',
        claim: '王磊任职核查',
        source: '财跃启明星 · 自然人检索',
        page: '任职 / 持股',
        detail: '某科技总经理 · 直接持股 3.8% · 无司法风险 · 无额外关联企业'
      },
      {
        id: 'uc16', label: '16',
        claim: '工商注册信息综合核验',
        source: '营业执照.pdf + 财跃启明星照面 API',
        page: '综合比对',
        detail: '14 项基本信息逐项比对：名称 / 代码 / 法代 / 住所 / 注册资本 / 成立日期 / 经营范围等 · 14/14 一致'
      }
    ];

    /* ── 表格样式常量（inline） ── */
    var TS   = 'style="width:100%;border-collapse:collapse;font-size:12.5px;margin:6px 0 14px;line-height:1.5"';
    var TH   = 'style="padding:7px 10px;background:#f1f5f9;color:#374151;font-weight:600;border:1px solid #e2e8f0;text-align:left;white-space:nowrap"';
    var TD   = 'style="padding:7px 10px;border:1px solid #e2e8f0;vertical-align:top"';
    var TDG  = 'style="padding:7px 10px;border:1px solid #e2e8f0;vertical-align:top;color:#6b7280"';
    var TDOK = 'style="padding:7px 10px;border:1px solid #e2e8f0;vertical-align:top;color:#16a34a;font-weight:500"';
    var TDWN = 'style="padding:7px 10px;border:1px solid #e2e8f0;vertical-align:top;color:#d97706;font-weight:500"';
    var TDRK = 'style="padding:7px 10px;border:1px solid #e2e8f0;vertical-align:top;color:#dc2626;font-weight:500"';
    var TRBL = 'style="background:#eff6ff"';
    var TRGR = 'style="background:#f8fafc"';
    var HR   = '<hr style="border:none;border-top:1px solid #e2e8f0;margin:14px 0"/>';

    /* ── 章节正文（9 章） ── */
    var sections = [

      /* ═══════════════════════════════════════
         1. 执行摘要
      ═══════════════════════════════════════ */
      {
        id: 'ubo-1', title: '执行摘要', status: 'ok', note: '已生成',
        evidence: ['财跃启明星穿透计算 · 采集 2026-07-20', '营业执照.pdf', '公司章程.pdf', 'BOMIS 核验'],
        html:
          '<table class="bk-summary-tbl">' +
          '<tr><td class="bk-st-label">报告主体</td><td colspan="3">' + company + '（统一社会信用代码：' + code + '）</td></tr>' +
          '<tr><td class="bk-st-label">报告类型</td><td colspan="3">受益所有人尽职调查报告（依《中国人民银行关于加强反洗钱客户尽职调查工作的指导意见》· FATF R.10/R.24）</td></tr>' +
          '<tr><td class="bk-st-label">报告日期</td><td>2026-07-20</td><td class="bk-st-label">审计编号</td><td>UBO-HC-20260720-001</td></tr>' +
          '<tr><td class="bk-st-label">执行机构</td><td colspan="3">某商业银行苏州分行 · 合规部 / 财跃启明星</td></tr>' +
          '</table>' +
          '<h4>关键判断</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>维度</th><th ' + TH + '>判断结论</th><th ' + TH + '>证据质量</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>受益所有人识别</td><td ' + TD + '>张启明确认为唯一主 UBO（最终受益 47.6955% · 表决权 53.0011%）' + c('uc3','3') + '</td><td ' + TDOK + '>充分</td></tr>' +
          '<tr><td ' + TD + '>实际控制人锁定</td><td ' + TD + '>张启明同时满足三项识别标准；标准一为主（≥25% 股权）；标准三兜底（法代 + 日常经营）' + c('uc2','2') + '</td><td ' + TDOK + '>充分</td></tr>' +
          '<tr><td ' + TD + '>股东结构清晰度</td><td ' + TD + '>直接股东 11 名；员工持股平台（澄明合伙）已完整穿透；境外层（弘晟 Cayman）需补材料' + c('uc14','14') + '</td><td ' + TDWN + '>基本充分（境外待补）</td></tr>' +
          '<tr><td ' + TD + '>关联企业风险</td><td ' + TD + '>3 位自然人 UBO 合计关联 10 家企业；澄海商贸被执行 2 条（未结）为主要关注点' + c('uc7','7') + '</td><td ' + TDWN + '>待核实（澄海）</td></tr>' +
          '<tr><td ' + TD + '>BOMIS 一致性</td><td ' + TD + '>张启明已在 BOMIS 登记（2024-12-01）与本次识别结论一致；赵昕（新进）尚未更新' + c('uc12','12') + '</td><td ' + TDWN + '>部分完成</td></tr>' +
          '<tr><td ' + TD + '>注册资本质量</td><td ' + TD + '>某科技 5,000 万元已足额实缴；澄明合伙 500 万元出资已完成；无抽逃减资记录' + c('uc1','1') + '</td><td ' + TDOK + '>充分</td></tr>' +
          '<tr><td ' + TD + '>综合准入建议</td><td ' + TD + '><strong>建议开户（附条件）</strong>：须补受益所有人声明原件 + 境外穿透证明；澄海商贸关联交易在授信阶段须专项核实</td><td ' + TDWN + '>补件后可通过</td></tr>' +
          '</tbody></table>' +
          '<h4>建议行动（按优先级）</h4>' +
          '<ol class="bk-dd-list">' +
          '<li>补件：<strong>受益所有人声明原件</strong>（法代张启明签署）· 满足央行 3 号令留存要求 <span class="bk-dd-gap-inline">【缺】声明待补</span></li>' +
          '<li>补件：<strong>境外穿透材料</strong>（弘晟资本 Cayman 层）· 中文公证件或认证翻译件 <span class="bk-dd-gap-inline">【缺】境外层</span></li>' +
          '<li>核实：<strong>澄海商贸被执行 2 条</strong> 的金额及偿还能力评估 → 授信评审前须有结论</li>' +
          '<li>更新 BOMIS：按本次识别结论增补赵昕（11.2%）及李婉清登记</li>' +
          '<li>设置监测：在系统添加张启明 / 赵昕 / 澄海商贸司法风险实时告警订阅</li>' +
          '</ol>' +
          '<p><em>边界声明：本报告仅陈述公开关系、已有证据及材料缺口，不构成开户或授信决定，最终由机构合规规则判定。</em></p>'
      },

      /* ═══════════════════════════════════════
         2. 开户企业锚定
      ═══════════════════════════════════════ */
      {
        id: 'ubo-2', title: '开户企业锚定', status: 'ok', note: '已生成',
        evidence: ['营业执照.pdf · 照面页', '财跃启明星照面 API · 采集 2026-07-20'],
        html:
          '<p><span class="tri-ok">【证据充分】</span> 工商核验 14/14 项一致，主体无歧义 ' + c('uc16','16') + '。</p>' +
          '<h4>工商登记基本信息</h4>' +
          '<table ' + TS + '><tbody>' +
          '<tr><td ' + TH + ' style="width:28%">企业全称</td><td ' + TD + '>某科技（苏州）有限公司</td></tr>' +
          '<tr><td ' + TH + '>统一社会信用代码</td><td ' + TD + '>' + code + ' ' + c('uc1','1') + '</td></tr>' +
          '<tr><td ' + TH + '>登记状态</td><td ' + TDOK + '>存续（在营）</td></tr>' +
          '<tr><td ' + TH + '>企业类型</td><td ' + TD + '>有限责任公司</td></tr>' +
          '<tr><td ' + TH + '>注册资本</td><td ' + TD + '>人民币 5,000 万元（已足额实缴）' + c('uc1','1') + '</td></tr>' +
          '<tr><td ' + TH + '>成立日期</td><td ' + TD + '>2016-03-18</td></tr>' +
          '<tr><td ' + TH + '>营业期限</td><td ' + TD + '>2016-03-18 至长期</td></tr>' +
          '<tr><td ' + TH + '>法定代表人</td><td ' + TD + '>张启明（与营业执照、系统台账三方一致）</td></tr>' +
          '<tr><td ' + TH + '>住所</td><td ' + TD + '>苏州市工业园区星湖街 328 号科文大厦 A 栋 8 楼</td></tr>' +
          '<tr><td ' + TH + '>登记机关</td><td ' + TD + '>苏州市市场监督管理局</td></tr>' +
          '<tr><td ' + TH + '>所属行业</td><td ' + TD + '>软件和信息技术服务业（I6500）</td></tr>' +
          '<tr><td ' + TH + '>纳税人资质</td><td ' + TD + '>一般纳税人 · 近期无欠税公开记录</td></tr>' +
          '</tbody></table>' +
          '<h4>经营范围（节选）</h4>' +
          '<p>工业软件开发与销售；集成电路设计辅助工具研发；信息系统集成服务；智能制造整体解决方案；大数据处理与分析；技术转让、咨询与培训。</p>' +
          '<h4>核验结论</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> 营业执照与财跃启明星工商接口 14 项信息逐项比对完全一致 ' + c('uc16','16') + '；系统内客户档案名称与法代无歧义。开户企业锚定通过，可继续 UBO 识别。</p>'
      },

      /* ═══════════════════════════════════════
         3. 受益所有人与实控（已锁定）
      ═══════════════════════════════════════ */
      {
        id: 'ubo-3', title: '受益所有人与实控', status: 'ok', note: '已生成', locked: true,
        evidence: ['财跃启明星穿透计算', '公司章程.pdf · 表决权安排', 'BOMIS 系统核验'],
        html:
          '<p><span class="tri-ok">【证据充分】</span> 依《中国人民银行关于加强反洗钱客户尽职调查工作的指导意见》及受益所有人认定规则（2022 年版），按以下三项标准顺序识别 ' + c('uc3','3') + '：</p>' +
          '<ul class="bk-dd-list">' +
          '<li><strong>标准一</strong>：直接或间接持股（含穿透关联结构）≥25% 的自然人；</li>' +
          '<li><strong>标准二</strong>：通过表决权委托、协议安排等方式实际行使表决权 ≥25% 的自然人；</li>' +
          '<li><strong>标准三</strong>：担任高管并实际控制日常经营管理的自然人（兜底条款）。</li>' +
          '</ul>' +
          '<h4>受益所有人识别结果</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>姓名</th><th ' + TH + '>受益类型</th><th ' + TH + '>最终受益股份</th>' +
          '<th ' + TH + '>表决权</th><th ' + TH + '>识别标准</th><th ' + TH + '>持股路径摘要</th><th ' + TH + '>职务</th>' +
          '</tr></thead><tbody>' +
          '<tr ' + TRBL + '><td ' + TD + '><strong>张启明</strong></td><td ' + TD + '>主 UBO</td>' +
          '<td ' + TD + '><strong>47.6955%</strong></td><td ' + TD + '><strong>53.0011%</strong></td>' +
          '<td ' + TD + '>标准一 · 标准三</td>' +
          '<td ' + TD + '>直接 28% + 澄明合伙穿透 19.6955% ' + c('uc3','3') + '</td>' +
          '<td ' + TD + '>法定代表人 · 执行董事</td></tr>' +
          '<tr><td ' + TD + '>李婉清</td><td ' + TD + '>次 UBO</td>' +
          '<td ' + TD + '>12.4%</td><td ' + TD + '>26.5%</td>' +
          '<td ' + TD + '>标准二</td>' +
          '<td ' + TD + '>澄明合伙 LP 20%；依表决权委托协议享有额外表决权 ' + c('uc4','4') + c('uc2','2') + '</td>' +
          '<td ' + TD + '>合伙人</td></tr>' +
          '<tr><td ' + TD + '>王磊</td><td ' + TD + '>经营 UBO</td>' +
          '<td ' + TD + '>3.8%（直接）</td><td ' + TD + '>3.8%</td>' +
          '<td ' + TD + '>标准三</td>' +
          '<td ' + TD + '>总经理 · 负责日常经营管理 ' + c('uc15','15') + '</td>' +
          '<td ' + TD + '>总经理</td></tr>' +
          '<tr><td ' + TDG + '>赵昕</td><td ' + TDG + '>监测阈值</td>' +
          '<td ' + TDG + '>11.2%（直接）</td><td ' + TDG + '>11.2%</td>' +
          '<td ' + TDG + '>加强识别（≥10%）</td>' +
          '<td ' + TDG + '>2026-07-12 新进股东 ' + c('uc10','10') + '</td>' +
          '<td ' + TDG + '>暂无任职</td></tr>' +
          '</tbody></table>' +
          '<h4>BOMIS 系统核验对比</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> 已查询央行受益所有人信息管理系统（BOMIS）' + c('uc12','12') + '：</p>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>项目</th><th ' + TH + '>BOMIS 登记信息</th><th ' + TH + '>本次识别结论</th><th ' + TH + '>差异</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>UBO 姓名</td><td ' + TD + '>张启明（2024-12-01 登记）</td><td ' + TD + '>张启明</td><td ' + TDOK + '>一致 ✓</td></tr>' +
          '<tr><td ' + TD + '>受益股份</td><td ' + TD + '>47.70%（BOMIS 登记值）</td><td ' + TD + '>47.6955%（系统穿透）</td><td ' + TDWN + '>微差 0.0045%（舍入，可接受）</td></tr>' +
          '<tr><td ' + TD + '>李婉清</td><td ' + TD + '>未单独登记</td><td ' + TD + '>标准二 UBO · 12.4%</td><td ' + TDWN + '>建议补登</td></tr>' +
          '<tr><td ' + TD + '>赵昕（新进）</td><td ' + TD + '>未登记</td><td ' + TD + '>11.2% 加强识别</td><td ' + TDWN + '>须于本月内更新 BOMIS ' + c('uc10','10') + '</td></tr>' +
          '</tbody></table>' +
          '<p><em>本章已锁定。如需修改，请联系合规专员解锁并重新审核。</em></p>'
      },

      /* ═══════════════════════════════════════
         4. 股权与控制关系
      ═══════════════════════════════════════ */
      {
        id: 'ubo-4', title: '股权与控制关系', status: 'ok', note: '已生成',
        evidence: ['公司章程.pdf · P3–P8', '财跃启明星穿透计算 · 澄明合伙内部结构'],
        html:
          '<h4>4.1 目标公司直接股东名册（共 11 名）</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> 数据来源：公司章程（2026-07-10 最新版）+ 财跃启明星照面接口 ' + c('uc2','2') + c('uc3','3') + '。</p>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>#</th><th ' + TH + '>股东名称</th><th ' + TH + '>类型</th>' +
          '<th ' + TH + '>持股比例</th><th ' + TH + '>出资额（万元）</th><th ' + TH + '>备注</th>' +
          '</tr></thead><tbody>' +
          '<tr ' + TRBL + '><td ' + TD + '>1</td><td ' + TD + '><strong>张启明</strong></td><td ' + TD + '>自然人</td>' +
          '<td ' + TD + '><strong>28.00%</strong></td><td ' + TD + '>1,400</td><td ' + TD + '>法代 · 执行董事 · 另通过澄明合伙间接持股</td></tr>' +
          '<tr><td ' + TD + '>2</td><td ' + TD + '>苏州澄明企业管理合伙企业（有限合伙）</td><td ' + TD + '>合伙企业</td>' +
          '<td ' + TD + '><strong>32.00%</strong></td><td ' + TD + '>1,600</td><td ' + TD + '>员工持股平台 · 需穿透（见 4.2）' + c('uc4','4') + '</td></tr>' +
          '<tr><td ' + TD + '>3</td><td ' + TD + '>赵昕</td><td ' + TD + '>自然人</td>' +
          '<td ' + TDWN + '>11.20%</td><td ' + TD + '>560</td><td ' + TDWN + '>2026-07-12 新进 · 触发 UBO 复评 ' + c('uc10','10') + '</td></tr>' +
          '<tr><td ' + TD + '>4</td><td ' + TD + '>上海弘晟资本合伙企业（有限合伙）</td><td ' + TD + '>合伙企业（PE）</td>' +
          '<td ' + TD + '>8.00%</td><td ' + TD + '>400</td><td ' + TDWN + '>境外层待穿透 ' + c('uc14','14') + '</td></tr>' +
          '<tr><td ' + TD + '>5</td><td ' + TD + '>苏州工业园区启辉科技投资合伙企业（有限合伙）</td><td ' + TD + '>合伙企业（政府引导基金）</td>' +
          '<td ' + TD + '>5.20%</td><td ' + TD + '>260</td><td ' + TD + '>园区政府引导基金背景</td></tr>' +
          '<tr><td ' + TD + '>6</td><td ' + TD + '>苏州远泽芯科股权投资合伙企业（有限合伙）</td><td ' + TD + '>合伙企业（战略）</td>' +
          '<td ' + TD + '>5.00%</td><td ' + TD + '>250</td><td ' + TD + '>战略投资方 · 主营半导体</td></tr>' +
          '<tr><td ' + TD + '>7</td><td ' + TD + '>王磊</td><td ' + TD + '>自然人</td>' +
          '<td ' + TD + '>3.80%</td><td ' + TD + '>190</td><td ' + TD + '>总经理 · 经营 UBO</td></tr>' +
          '<tr><td ' + TD + '>8</td><td ' + TD + '>宁波远洋创投有限公司</td><td ' + TD + '>有限公司</td>' +
          '<td ' + TD + '>3.00%</td><td ' + TD + '>150</td><td ' + TD + '>财务投资方</td></tr>' +
          '<tr><td ' + TD + '>9</td><td ' + TD + '>苏州志远企业服务中心（有限合伙）</td><td ' + TD + '>合伙企业</td>' +
          '<td ' + TD + '>2.00%</td><td ' + TD + '>100</td><td ' + TD + '>员工顾问持股</td></tr>' +
          '<tr><td ' + TD + '>10</td><td ' + TD + '>苏融投资管理有限公司</td><td ' + TD + '>国有企业</td>' +
          '<td ' + TD + '>0.80%</td><td ' + TD + '>40</td><td ' + TD + '>金融机构参股</td></tr>' +
          '<tr><td ' + TDG + '>11</td><td ' + TDG + '>其他个人股东（合计）</td><td ' + TDG + '>自然人 ×3</td>' +
          '<td ' + TDG + '>1.00%</td><td ' + TDG + '>50</td><td ' + TDG + '>单人均 ＜1% · 不独立触发识别标准</td></tr>' +
          '</tbody></table>' +

          '<h4>4.2 苏州澄明企业管理合伙企业 · 内部结构穿透</h4>' +
          '<p><span class="tri-ok">【证据充分】</span> 澄明合伙成立于 2019-11-20，注册资本 500 万元，为某科技核心员工持股平台 ' + c('uc4','4') + '。</p>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>合伙人</th><th ' + TH + '>类型</th><th ' + TH + '>份额</th>' +
          '<th ' + TH + '>穿透至某科技受益股份</th><th ' + TH + '>表决权说明</th>' +
          '</tr></thead><tbody>' +
          '<tr ' + TRBL + '><td ' + TD + '><strong>张启明</strong></td><td ' + TD + '>执行事务合伙人（GP）</td><td ' + TD + '><strong>61.5484%</strong></td>' +
          '<td ' + TD + '><strong>32% × 61.5484% = 19.6955%</strong></td>' +
          '<td ' + TD + '>依合伙协议，GP 享有某科技对应 25.0011% 的实际表决权（GP 表决权授权安排）' + c('uc2','2') + '</td></tr>' +
          '<tr><td ' + TD + '>李婉清</td><td ' + TD + '>有限合伙人（LP）</td><td ' + TD + '>20.0000%</td>' +
          '<td ' + TD + '>32% × 20% = 6.4000%</td>' +
          '<td ' + TD + '>表决权委托协议赋予其独立行使部分合伙体对应表决权（标准二识别来源）' + c('uc2','2') + '</td></tr>' +
          '<tr><td ' + TDG + '>员工持股 LP（多名核心员工）</td><td ' + TDG + '>有限合伙人（LP）</td><td ' + TDG + '>18.4516%</td>' +
          '<td ' + TDG + '>32% × 18.4516% = 5.9045%</td>' +
          '<td ' + TDG + '>分散于多名员工，单人均 ＜5%</td></tr>' +
          '</tbody></table>' +

          '<h4>4.3 张启明穿透计算明细</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>路径</th><th ' + TH + '>计算步骤</th><th ' + TH + '>受益股份</th><th ' + TH + '>表决权</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>直接持股</td><td ' + TD + '>28.0000%（直接）</td><td ' + TD + '>28.0000%</td><td ' + TD + '>28.0000%</td></tr>' +
          '<tr><td ' + TD + '>通过澄明合伙（GP 份额）</td><td ' + TD + '>32% × 61.5484%</td><td ' + TD + '>19.6955%</td><td ' + TD + '>25.0011%（GP 表决权授权）</td></tr>' +
          '<tr ' + TRBL + '><td ' + TD + '><strong>合计</strong></td><td ' + TD + '>—</td><td ' + TD + '><strong>47.6955%</strong></td><td ' + TD + '><strong>53.0011%</strong></td></tr>' +
          '</tbody></table>' +
          '<p><span class="tri-warn">【待核实】</span> 上海弘晟资本合伙企业（8.00%）→ GP 弘晟资本管理有限公司 → 上层指向境外 Cayman Islands 实体，境外穿透受限，等待补件 ' + c('uc14','14') + '。<span class="bk-dd-gap-inline">【缺】境外穿透材料</span></p>'
      },

      /* ═══════════════════════════════════════
         5. 自然人反向关联企业（企业—人—企业全链）
      ═══════════════════════════════════════ */
      {
        id: 'ubo-5', title: '自然人反向关联企业', status: 'warn', note: '境外层暂停',
        evidence: ['财跃启明星董监高任职接口', '财跃启明星对外投资接口', '待补：境外穿透材料'],
        html:
          '<p><span class="tri-ok">【证据充分（境内部分）】</span> 采用「<strong>企业—人—企业</strong>」穿透方法论：以目标企业为起点，识别出受益所有人后，逐人检索其名下全部任职、直接持股及间接控制企业，完成双向链路图谱 ' + c('uc5','5') + c('uc6','6') + '。</p>' +
          '<p><span class="tri-na">【暂无法分析】</span> 某科技直接股东上海弘晟资本合伙企业（8%）存在境外持股层（Cayman），仅能见一层境内主体，需补境外工商证明方可完成穿透，该分支暂停 ' + c('uc14','14') + '。<span class="bk-dd-gap-inline">【缺】境外穿透材料</span></p>' +
          HR +

          '<h4>A. 张启明 · 企业关联全图谱</h4>' +
          '<p>张启明当前共关联 <strong>5 家</strong>存续企业（含目标企业），另有 <strong>1 家</strong>历史退出。风险集中于澄海商贸 2 条未结清被执行 ' + c('uc5','5') + c('uc6','6') + '。</p>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>企业名称</th>' +
          '<th ' + TH + '>关联类型</th>' +
          '<th ' + TH + '>持股 / 份额</th>' +
          '<th ' + TH + '>任职</th>' +
          '<th ' + TH + '>成立日期</th>' +
          '<th ' + TH + '>状态</th>' +
          '<th ' + TH + '>风险</th>' +
          '</tr></thead><tbody>' +

          '<tr ' + TRGR + '><td colspan="7" style="padding:5px 10px;font-weight:600;color:#374151;font-size:12px">◈ 目标企业</td></tr>' +
          '<tr><td ' + TD + '>某科技（苏州）有限公司</td>' +
          '<td ' + TD + '>实际控制人 · 法代</td>' +
          '<td ' + TD + '>受益 47.6955%<br/>表决 53.0011%</td>' +
          '<td ' + TD + '>法定代表人 · 执行董事 ' + c('uc1','1') + '</td>' +
          '<td ' + TD + '>2016-03-18</td><td ' + TDOK + '>存续</td><td ' + TD + '>—</td></tr>' +

          '<tr ' + TRGR + '><td colspan="7" style="padding:5px 10px;font-weight:600;color:#374151;font-size:12px">◈ 当前持股 / 执行职务</td></tr>' +

          '<tr><td ' + TD + '>苏州澄明企业管理合伙企业（有限合伙）</td>' +
          '<td ' + TD + '>执行事务合伙人（GP）</td>' +
          '<td ' + TD + '>GP 61.5484%</td>' +
          '<td ' + TD + '>执行事务合伙人 ' + c('uc4','4') + '</td>' +
          '<td ' + TD + '>2019-11-20</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TD + '>— <small style="color:#6b7280">某科技员工持股平台</small></td></tr>' +

          '<tr><td ' + TD + '>苏州市澄海商贸有限公司</td>' +
          '<td ' + TD + '>控股股东 · 法代</td>' +
          '<td ' + TD + '>80.00%</td>' +
          '<td ' + TD + '>法定代表人 ' + c('uc7','7') + '</td>' +
          '<td ' + TD + '>2011-05-12</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TDRK + '>⚠ 被执行 2 条<br/>（未结·合计 ~86.5 万元）</td></tr>' +

          '<tr><td ' + TD + '>苏州启明数字科技有限公司</td>' +
          '<td ' + TD + '>控股股东 · 法代</td>' +
          '<td ' + TD + '>100.00%</td>' +
          '<td ' + TD + '>法定代表人 ' + c('uc8','8') + '</td>' +
          '<td ' + TD + '>2021-06-08</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TDOK + '>无风险</td></tr>' +

          '<tr><td ' + TD + '>苏州某创业投资管理合伙企业（有限合伙）</td>' +
          '<td ' + TD + '>执行事务合伙人（GP）</td>' +
          '<td ' + TD + '>GP 51.00%</td>' +
          '<td ' + TD + '>执行事务合伙人</td>' +
          '<td ' + TD + '>2023-04-15</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TD + '>— <small style="color:#6b7280">科创投资工具</small></td></tr>' +

          '<tr><td ' + TDG + '>苏州某软件行业协会</td>' +
          '<td ' + TDG + '>荣誉任职（无持股）</td>' +
          '<td ' + TDG + '>—</td>' +
          '<td ' + TDG + '>副理事长</td>' +
          '<td ' + TDG + '>行业组织</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TDG + '>— <small>非经营实体</small></td></tr>' +

          '<tr ' + TRGR + '><td colspan="7" style="padding:5px 10px;font-weight:600;color:#374151;font-size:12px">◈ 历史 · 已退出</td></tr>' +

          '<tr><td ' + TDG + '>苏州朗远软件科技有限公司</td>' +
          '<td ' + TDG + '>曾持股 31.5%（已退出）</td>' +
          '<td ' + TDG + '>0%</td>' +
          '<td ' + TDG + '>— (已卸任) ' + c('uc13','13') + '</td>' +
          '<td ' + TDG + '>2015-09-21</td><td ' + TDG + '>存续（他人持有）</td>' +
          '<td ' + TDG + '>— <small>2021-03 工商变更完成</small></td></tr>' +

          '</tbody></table>' +
          HR +

          '<h4>B. 李婉清 · 企业关联全图谱</h4>' +
          '<p>李婉清（标准二 UBO）当前共关联 <strong>2 家</strong>存续企业，无司法风险 ' + c('uc9','9') + '。</p>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>企业名称</th>' +
          '<th ' + TH + '>关联类型</th>' +
          '<th ' + TH + '>持股 / 份额</th>' +
          '<th ' + TH + '>任职</th>' +
          '<th ' + TH + '>成立日期</th>' +
          '<th ' + TH + '>状态</th>' +
          '<th ' + TH + '>风险</th>' +
          '</tr></thead><tbody>' +

          '<tr><td ' + TD + '>苏州澄明企业管理合伙企业（有限合伙）</td>' +
          '<td ' + TD + '>有限合伙人（LP）</td>' +
          '<td ' + TD + '>LP 20.00%<br/>穿透某科技 6.40%</td>' +
          '<td ' + TD + '>合伙人（表决权委托协议另行约定）' + c('uc4','4') + '</td>' +
          '<td ' + TD + '>2019-11-20</td><td ' + TDOK + '>存续</td><td ' + TD + '>—</td></tr>' +

          '<tr><td ' + TD + '>苏州婉清管理咨询有限公司</td>' +
          '<td ' + TD + '>控股股东 · 法代</td>' +
          '<td ' + TD + '>100.00%</td>' +
          '<td ' + TD + '>法定代表人 ' + c('uc9','9') + '</td>' +
          '<td ' + TD + '>2020-03-15</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TDOK + '>无风险</td></tr>' +

          '</tbody></table>' +
          HR +

          '<h4>C. 赵昕 · 企业关联全图谱（新进股东）</h4>' +
          '<p><span class="tri-warn">【待核实】</span> 赵昕于 2026-07-12 新进持股 11.2%，触发受益所有人复评，境内关联检索已完成 ' + c('uc10','10') + '。</p>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>企业名称</th>' +
          '<th ' + TH + '>关联类型</th>' +
          '<th ' + TH + '>持股 / 份额</th>' +
          '<th ' + TH + '>任职</th>' +
          '<th ' + TH + '>成立日期</th>' +
          '<th ' + TH + '>状态</th>' +
          '<th ' + TH + '>风险</th>' +
          '</tr></thead><tbody>' +

          '<tr ' + TRBL + '><td ' + TD + '>某科技（苏州）有限公司</td>' +
          '<td ' + TD + '>直接股东（新进）</td>' +
          '<td ' + TD + '>11.20%</td>' +
          '<td ' + TD + '>暂无任职 ' + c('uc10','10') + '</td>' +
          '<td ' + TD + '>2016-03-18</td><td ' + TDOK + '>存续</td><td ' + TD + '>—</td></tr>' +

          '<tr><td ' + TD + '>苏州远启投资管理有限公司</td>' +
          '<td ' + TD + '>控股股东 · 法代</td>' +
          '<td ' + TD + '>60.00%</td>' +
          '<td ' + TD + '>法定代表人</td>' +
          '<td ' + TD + '>2018-11-02</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TDOK + '>无风险</td></tr>' +

          '<tr><td ' + TD + '>深圳远诚科技有限公司</td>' +
          '<td ' + TD + '>参股（非控股）</td>' +
          '<td ' + TD + '>30.00%</td>' +
          '<td ' + TD + '>— （仅持股）' + c('uc11','11') + '</td>' +
          '<td ' + TD + '>2019-06-28</td><td ' + TDOK + '>存续</td>' +
          '<td ' + TDWN + '>历史被执行 1 条<br/>（2025-09 已结清）' + c('uc11','11') + '</td></tr>' +

          '</tbody></table>' +
          HR +

          '<h4>D. 境外层 · 弘晟资本（暂停分析）</h4>' +
          '<p><span class="tri-na">【暂无法分析】</span> 上海弘晟资本合伙企业（某科技 8% 直接股东）的执行事务合伙人为上海弘晟资本管理有限公司，工商可见层级止于此。据公开资料，实际管理主体指向境外实体 Hongshen Capital Management Ltd.（开曼群岛注册）。如需完成穿透，需提供：①开曼注册证书（中文公证）；②最终受益人声明（CDD 表格）。该分支在补件完成前标记为「暂无法分析」，不计入 UBO 名单 ' + c('uc14','14') + '。<span class="bk-dd-gap-inline">【缺】境外穿透材料</span></p>' +
          HR +

          '<h4>E. 关联网络覆盖度统计</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>自然人</th><th ' + TH + '>当前关联企业（境内）</th><th ' + TH + '>历史退出</th><th ' + TH + '>风险命中</th><th ' + TH + '>境外层</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '><strong>张启明</strong></td><td ' + TD + '>5 家（含目标企业）</td><td ' + TD + '>1 家（朗远软件）</td><td ' + TDRK + '>澄海商贸 · 被执行 2（未结）</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>李婉清</td><td ' + TD + '>2 家</td><td ' + TD + '>—</td><td ' + TDOK + '>无</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>赵昕</td><td ' + TD + '>3 家（含目标企业）</td><td ' + TD + '>—</td><td ' + TDWN + '>深圳远诚 · 历史被执行（已结清）</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TDG + '>机构股东（弘晟）</td><td ' + TDG + '>境外层暂停</td><td ' + TDG + '>—</td><td ' + TDG + '>—</td><td ' + TDWN + '>待补境外证明</td></tr>' +
          '</tbody></table>'
      },

      /* ═══════════════════════════════════════
         6. 关系网络总览
      ═══════════════════════════════════════ */
      {
        id: 'ubo-6', title: '关系网络总览', status: 'ok', note: '已生成',
        evidence: ['财跃启明星综合查询 · 2026-07-20 全量'],
        html:
          '<p><span class="tri-ok">【证据充分（境内）】</span> 本章汇总某科技关系网络全部已识别实体，覆盖直接股东层（L1）及 UBO 关联企业层（L2）' + c('uc5','5') + c('uc6','6') + c('uc9','9') + c('uc10','10') + '。</p>' +
          '<h4>全网实体一览</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>实体名称</th><th ' + TH + '>实体类型</th><th ' + TH + '>与目标企业关系</th>' +
          '<th ' + TH + '>涉及 UBO</th><th ' + TH + '>层级</th><th ' + TH + '>风险</th>' +
          '</tr></thead><tbody>' +

          '<tr ' + TRGR + '><td colspan="6" style="padding:5px 10px;font-weight:600;font-size:12px">━ 目标企业（L0）</td></tr>' +
          '<tr><td ' + TD + '>某科技（苏州）有限公司</td><td ' + TD + '>有限责任公司</td><td ' + TD + '>本体</td>' +
          '<td ' + TD + '>张启明 · 李婉清 · 王磊 · 赵昕</td><td ' + TD + '>L0</td><td ' + TDOK + '>无</td></tr>' +

          '<tr ' + TRGR + '><td colspan="6" style="padding:5px 10px;font-weight:600;font-size:12px">━ 直接股东层（L1）</td></tr>' +
          '<tr><td ' + TD + '>苏州澄明企业管理合伙企业（有限合伙）</td><td ' + TD + '>合伙企业</td><td ' + TD + '>直接股东（32%）</td>' +
          '<td ' + TD + '>张启明（GP）· 李婉清（LP）</td><td ' + TD + '>L1→L2</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>上海弘晟资本合伙企业（有限合伙）</td><td ' + TD + '>合伙企业（PE）</td><td ' + TD + '>直接股东（8%）</td>' +
          '<td ' + TDG + '>— 机构</td><td ' + TDWN + '>L1→境外待补</td><td ' + TDWN + '>境外层未穿透</td></tr>' +
          '<tr><td ' + TD + '>苏州工业园区启辉科技投资合伙企业</td><td ' + TD + '>合伙企业</td><td ' + TD + '>直接股东（5.2%）</td>' +
          '<td ' + TDG + '>—</td><td ' + TD + '>L1（已穿透）</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>苏州远泽芯科股权投资合伙企业</td><td ' + TD + '>合伙企业</td><td ' + TD + '>直接股东（5%）</td>' +
          '<td ' + TDG + '>—</td><td ' + TD + '>L1（已穿透）</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>宁波远洋创投有限公司</td><td ' + TD + '>有限公司</td><td ' + TD + '>直接股东（3%）</td>' +
          '<td ' + TDG + '>—</td><td ' + TD + '>L1</td><td ' + TDOK + '>无</td></tr>' +

          '<tr ' + TRGR + '><td colspan="6" style="padding:5px 10px;font-weight:600;font-size:12px">━ UBO 关联企业层（L2）</td></tr>' +
          '<tr><td ' + TD + '>苏州市澄海商贸有限公司</td><td ' + TD + '>有限公司</td><td ' + TD + '>张启明关联（80%·法代）</td>' +
          '<td ' + TD + '>张启明</td><td ' + TD + '>L2</td><td ' + TDRK + '>被执行 2（未结）</td></tr>' +
          '<tr><td ' + TD + '>苏州启明数字科技有限公司</td><td ' + TD + '>有限公司</td><td ' + TD + '>张启明关联（100%·法代）</td>' +
          '<td ' + TD + '>张启明</td><td ' + TD + '>L2</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>苏州某创业投资管理合伙企业</td><td ' + TD + '>合伙企业</td><td ' + TD + '>张启明关联（GP 51%）</td>' +
          '<td ' + TD + '>张启明</td><td ' + TD + '>L2</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>苏州婉清管理咨询有限公司</td><td ' + TD + '>有限公司</td><td ' + TD + '>李婉清关联（100%·法代）</td>' +
          '<td ' + TD + '>李婉清</td><td ' + TD + '>L2</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>苏州远启投资管理有限公司</td><td ' + TD + '>有限公司</td><td ' + TD + '>赵昕关联（60%·法代）</td>' +
          '<td ' + TD + '>赵昕</td><td ' + TD + '>L2</td><td ' + TDOK + '>无</td></tr>' +
          '<tr><td ' + TD + '>深圳远诚科技有限公司</td><td ' + TD + '>有限公司</td><td ' + TD + '>赵昕参股（30%）</td>' +
          '<td ' + TD + '>赵昕</td><td ' + TD + '>L2</td><td ' + TDWN + '>历史被执行（已结清）</td></tr>' +

          '</tbody></table>' +
          '<h4>网络覆盖完整性评估</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>评估维度</th><th ' + TH + '>状态</th><th ' + TH + '>备注</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>境内 L0–L1 穿透</td><td ' + TDOK + '>完整 ✓</td><td ' + TD + '>目标企业全部直接股东已识别</td></tr>' +
          '<tr><td ' + TD + '>自然人 UBO 识别</td><td ' + TDOK + '>完整 ✓</td><td ' + TD + '>张启明（标准一+三）· 李婉清（标准二）· 王磊（标准三）</td></tr>' +
          '<tr><td ' + TD + '>UBO 关联企业检索（境内）</td><td ' + TDOK + '>完整 ✓</td><td ' + TD + '>3 位 UBO 共检出 10 家关联企业（含目标企业）</td></tr>' +
          '<tr><td ' + TD + '>境外层穿透</td><td ' + TDWN + '>未完成</td><td ' + TDWN + '>弘晟资本 Cayman 层待补件，已标注</td></tr>' +
          '<tr><td ' + TD + '>BOMIS 核验</td><td ' + TDWN + '>部分完成</td><td ' + TDWN + '>张启明已登记；赵昕 / 李婉清等待更新</td></tr>' +
          '</tbody></table>'
      },

      /* ═══════════════════════════════════════
         7. 风险画像
      ═══════════════════════════════════════ */
      {
        id: 'ubo-7', title: '风险画像', status: 'ok', note: '计数已出 · 可下钻',
        evidence: ['财跃启明星司法风险扫描 · 2026-07-20', '被执行详情 · 澄海商贸 / 深圳远诚'],
        html:
          '<p>本章仅陈述各主体公开风险命中维度与计数；对开户或授信影响由银行合规规则独立判定 ' + c('uc7','7') + c('uc11','11') + c('uc15','15') + '。</p>' +
          '<h4>7.1 自然人风险扫描</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>自然人</th><th ' + TH + '>失信被执行</th><th ' + TH + '>限制消费令</th>' +
          '<th ' + TH + '>刑事案件</th><th ' + TH + '>行政处罚</th><th ' + TH + '>综合评级</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '><strong>张启明</strong></td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '<tr><td ' + TD + '>李婉清</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '<tr><td ' + TD + '>王磊</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '<tr><td ' + TD + '>赵昕</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '</tbody></table>' +
          '<h4>7.2 目标企业风险扫描</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>风险维度</th><th ' + TH + '>数量</th><th ' + TH + '>状态</th><th ' + TH + '>摘要</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>被执行</td><td ' + TDOK + '>0</td><td ' + TDOK + '>无</td><td ' + TD + '>某科技自身无被执行记录</td></tr>' +
          '<tr><td ' + TD + '>失信</td><td ' + TDOK + '>0</td><td ' + TDOK + '>无</td><td ' + TD + '>无</td></tr>' +
          '<tr><td ' + TD + '>行政处罚</td><td ' + TDOK + '>0</td><td ' + TDOK + '>无</td><td ' + TD + '>近 3 年公开面无记录</td></tr>' +
          '<tr><td ' + TD + '>股权出质</td><td ' + TDWN + '>1</td><td ' + TDWN + '>存续</td><td ' + TD + '>张启明部分股权已出质（融资担保安排）· 不影响控制权认定 ' + c('uc2','2') + '</td></tr>' +
          '</tbody></table>' +
          '<h4>7.3 关联企业风险扫描</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>关联企业</th><th ' + TH + '>被执行</th><th ' + TH + '>失信</th>' +
          '<th ' + TH + '>限高</th><th ' + TH + '>行政处罚</th><th ' + TH + '>综合</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>苏州市澄海商贸有限公司</td><td ' + TDRK + '>2（未结清）</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDRK + '>⚠ 中高风险</td></tr>' +
          '<tr><td ' + TD + '>苏州启明数字科技有限公司</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '<tr><td ' + TD + '>苏州某创业投资管理合伙企业</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '<tr><td ' + TD + '>苏州婉清管理咨询有限公司</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '<tr><td ' + TD + '>苏州远启投资管理有限公司</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>⬤ 低</td></tr>' +
          '<tr><td ' + TD + '>深圳远诚科技有限公司</td><td ' + TDWN + '>1（已结清）</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDOK + '>0</td><td ' + TDWN + '>△ 关注（历史）</td></tr>' +
          '</tbody></table>' +
          '<h4>7.4 澄海商贸被执行详情</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>案号</th><th ' + TH + '>申请执行人</th><th ' + TH + '>标的金额</th><th ' + TH + '>立案日期</th><th ' + TH + '>当前状态</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>(2025)苏 0512 执 1188 号</td><td ' + TD + '>苏州某建材供应商（化名）</td>' +
          '<td ' + TDRK + '>52.3 万元</td><td ' + TD + '>2025-04-15</td><td ' + TDRK + '>未结清 ' + c('uc7','7') + '</td></tr>' +
          '<tr><td ' + TD + '>(2024)苏 0512 执 3301 号</td><td ' + TD + '>苏州某劳务派遣公司（化名）</td>' +
          '<td ' + TDRK + '>34.2 万元</td><td ' + TD + '>2024-11-03</td><td ' + TDRK + '>未结清 ' + c('uc7','7') + '</td></tr>' +
          '</tbody></table>' +
          '<p><span class="tri-warn">【待核实】</span> 须核实澄海商贸与某科技是否存在关联交易（采购 / 资金拆借 / 担保），以评估风险传导路径。此项须在授信评审阶段专项完成，不影响开户 UBO 识别结论 ' + c('uc7','7') + '。</p>'
      },

      /* ═══════════════════════════════════════
         8. 重大变更与监测触发
      ═══════════════════════════════════════ */
      {
        id: 'ubo-8', title: '重大变更与监测触发', status: 'ok', note: '已生成',
        evidence: ['财跃启明星工商变更记录', '财跃启明星司法风险告警', 'BOMIS 操作记录'],
        html:
          '<p>本章记录近 24 个月内涉及受益所有人识别的关键变更事件及监测触发记录 ' + c('uc3','3') + c('uc10','10') + '。</p>' +
          '<h4>近期变更时间轴</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>日期</th><th ' + TH + '>变更类型</th><th ' + TH + '>变更内容</th>' +
          '<th ' + TH + '>对 UBO 识别的影响</th><th ' + TH + '>处理状态</th>' +
          '</tr></thead><tbody>' +
          '<tr ' + TRBL + '><td ' + TD + '><strong>2026-07-12</strong></td><td ' + TD + '>股权变更（新进）</td>' +
          '<td ' + TD + '>赵昕新进持股 11.2%，完成工商变更登记</td>' +
          '<td ' + TDWN + '>触发 UBO 复评 · 建议 30 日内更新 BOMIS</td>' +
          '<td ' + TDWN + '>复评进行中 · 已纳入本报告</td></tr>' +
          '<tr><td ' + TD + '>2026-01-08</td><td ' + TD + '>公司章程修订</td>' +
          '<td ' + TD + '>表决权委托协议更新（李婉清条款修订）</td>' +
          '<td ' + TD + '>李婉清表决权维持 26.5%，无实质变化</td>' +
          '<td ' + TDOK + '>已核验 · 无需复评</td></tr>' +
          '<tr><td ' + TD + '>2025-04-15</td><td ' + TD + '>司法风险（关联企业）</td>' +
          '<td ' + TD + '>澄海商贸新增被执行 1 条（(2025)苏 0512 执 1188 号）</td>' +
          '<td ' + TD + '>张启明关联企业风险升至中高；已推送银行告警</td>' +
          '<td ' + TDWN + '>告警已发 · 待授信阶段跟进</td></tr>' +
          '<tr><td ' + TD + '>2024-12-01</td><td ' + TD + '>BOMIS 首次登记</td>' +
          '<td ' + TD + '>某科技完成受益所有人 BOMIS 登记（张启明）</td>' +
          '<td ' + TD + '>合规基础登记完成</td>' +
          '<td ' + TDOK + '>已完成</td></tr>' +
          '<tr><td ' + TD + '>2024-11-03</td><td ' + TD + '>司法风险（关联企业）</td>' +
          '<td ' + TD + '>澄海商贸首条被执行登记（(2024)苏 0512 执 3301 号）</td>' +
          '<td ' + TD + '>张启明关联企业首次出现风险记录</td>' +
          '<td ' + TDWN + '>历史记录已归档</td></tr>' +
          '<tr><td ' + TDG + '>2024-08-15</td><td ' + TDG + '>股权出质</td>' +
          '<td ' + TDG + '>张启明名下部分某科技股权出质（融资担保）</td>' +
          '<td ' + TDG + '>不影响控制权识别·标注出质状态</td>' +
          '<td ' + TDOK + '>已记录</td></tr>' +
          '</tbody></table>' +
          '<h4>持续监测配置</h4>' +
          '<ul class="bk-dd-list">' +
          '<li><strong>当前触发：</strong>赵昕 2026-07-12 新进（≥10%）→ UBO 复评（本报告即复评结论）</li>' +
          '<li><strong>实时订阅：</strong>张启明 · 李婉清 · 赵昕自然人司法风险（失信 / 被执行 / 限高）</li>' +
          '<li><strong>实时订阅：</strong>澄海商贸司法风险变化（已设告警，变更即推送）</li>' +
          '<li><strong>挂起等待：</strong>境外穿透材料提交后自动恢复 ubo-5·D 分支分析</li>' +
          '<li><strong>定期复核：</strong>每 12 个月全量刷新；股权变动超 5% 时立即触发</li>' +
          '</ul>'
      },

      /* ═══════════════════════════════════════
         9. 数据来源与免责声明
      ═══════════════════════════════════════ */
      {
        id: 'ubo-9', title: '数据来源与免责声明', status: 'ok', note: '已生成',
        evidence: ['财跃启明星实时数据接口', 'BOMIS 系统', '营业执照 / 公司章程'],
        html:
          '<h4>数据来源</h4>' +
          '<p>本报告全部数据由<strong>财跃启明星</strong>实时数据接口返回（上游为国家市场监督管理总局及江苏省 / 苏州市数据局公示数据），采集时间 2026-06-27。</p>' +
          '<h4>适用标准</h4>' +
          '<table ' + TS + '><thead><tr>' +
          '<th ' + TH + '>合规标准</th><th ' + TH + '>条款</th>' +
          '</tr></thead><tbody>' +
          '<tr><td ' + TD + '>央行 3 号令</td><td ' + TD + '>中国境内金融机构 UBO 识别 25% 持股阈值</td></tr>' +
          '<tr><td ' + TD + '>FATF Recommendation 10</td><td ' + TD + '>受益所有人识别（Beneficial Ownership）</td></tr>' +
          '<tr><td ' + TD + '>FATF Recommendation 24</td><td ' + TD + '>法人受益所有权透明度</td></tr>' +
          '</tbody></table>' +
          '<h4>免责声明</h4>' +
          '<ol class="bk-dd-list">' +
          '<li>本报告基于公开工商数据生成，无法识别未披露的代持、协议控制、一致行动安排，须结合客户访谈、关联交易审查、合同尽调等手段综合判断。</li>' +
          '<li>本报告基于工商登记维度的 UBO 识别与关联企业网络分析。需补充 UBO 个人司法画像（失信 / 限高 / 被执行 / 限出境）、UBO 反向验证、UBO 关联企业合规扫描、历史 UBO 追溯等深度能力时，可通过专项尽调流程补强。</li>' +
          '<li>境外主体（BVI / Cayman / 香港等）穿透受限。本报告中 Hongshen Capital Management Ltd.（境外注册主体）仅识别其作为「上海弘晟资本合伙企业持有的境外中间层」地位，未对其最终 UBO 做境外工商数据库二次穿透。</li>' +
          '<li>国际制裁清单（OFAC / UN / EU）不在本报告覆盖范围。对高风险客户，必须配合专业制裁筛查工具完成制裁命中检查。</li>' +
          '<li>本报告仅供金融机构反洗钱合规内部尽调使用，不构成任何法律或商业决策建议。</li>' +
          '</ol>'
      }

    ]; /* end sections */

    return { sections: sections, cites: cites };
  }

  /* ─────────────────────────────────────────────────
     Patch task-huacheng-ubo（覆盖 data-bank.js 简版数据）
  ───────────────────────────────────────────────── */
  (function patchUboTask() {
    var data = window.BANK_DATA;
    if (!data || !data.reportTasks || !data.reportTasks['task-huacheng-ubo']) return;

    var pack = buildHuachengUboReport({});
    var task = data.reportTasks['task-huacheng-ubo'];

    /* draftByChapter + evidenceByChapter */
    var dbc = {};
    var ebc = {};
    pack.sections.forEach(function (s) {
      dbc[s.id] = { title: s.title, html: s.html };
      if (s.evidence) ebc[s.id] = s.evidence;
    });
    task.draftByChapter    = dbc;
    task.evidenceByChapter = ebc;

    /* chapters 列表（含新增 ubo-8）*/
    task.chapters = pack.sections.map(function (s) {
      return {
        id:     s.id,
        title:  s.title,
        status: s.status  || 'ok',
        note:   s.note    || '已生成',
        locked: !!s.locked
      };
    });

    /* cites */
    task.cites = pack.cites;

    /* 任务元数据 */
    task.progress    = 85;
    task.statusLabel = '草稿已出 · 境外层暂停';

    /* steps */
    task.steps = [
      { status: 'ok',   title: '开户企业锚定',       desc: '工商照面 14/14 核验一致' },
      { status: 'ok',   title: 'UBO / 实控识别',     desc: '张启明 47.6955% / 53.0011%；李婉清（标准二）；王磊（标准三）' },
      { status: 'ok',   title: '反向关联检索（境内）', desc: '3 位 UBO 合计关联 10 家企业；澄海商贸被执行 2 条（未结）' },
      { status: 'ok',   title: 'BOMIS 核验',          desc: '张启明已登记一致；赵昕等待更新' },
      { status: 'warn', title: '问题卡',               desc: '境外层（弘晟 / Cayman）暂无法分析；声明原件待补' },
      { status: 'ok',   title: '章节生成',             desc: '9 章节已全部完成；境外分支标注「暂无法分析」' }
    ];

    /* findings */
    task.findings = [
      {
        id: 'uf1', tri: 'ok', included: true,
        title: '主 UBO · 张启明',
        body: '最终受益 47.6955%；表决权 53.0011%。同时满足标准一（≥25%）及标准三（法代·执行董事）。BOMIS 登记一致（微差 0.0045% 为舍入）。'
      },
      {
        id: 'uf2', tri: 'warn', included: true,
        title: '关联风险 · 澄海商贸',
        body: '张启明 80% 控股并任法代；被执行 2 条未结，合计标的约 86.5 万元。与某科技关联交易性质须在授信阶段专项核实。'
      },
      {
        id: 'uf3', tri: 'ok', included: true,
        title: '次 UBO · 李婉清',
        body: '澄明合伙 LP 20%；依表决权委托协议表决权 26.5%（标准二）。关联企业仅婉清管理咨询，无风险记录。'
      },
      {
        id: 'uf4', tri: 'warn', included: true,
        title: '新进股东 · 赵昕',
        body: '2026-07-12 新进 11.2%，触发复评。关联深圳远诚科技有历史被执行（已结清）。BOMIS 尚未更新。'
      },
      {
        id: 'uf5', tri: 'na', included: false,
        title: '境外穿透',
        body: '弘晟资本（某科技 8% 股东）上层 Cayman 实体仅见一层，待提交境外工商证明，暂无法分析。'
      }
    ];
  })();

  /* ─────────────────────────────────────────────────
     导出
  ───────────────────────────────────────────────── */
  window.BANK_UBO_REPORT = {
    build: buildHuachengUboReport
  };

})();
