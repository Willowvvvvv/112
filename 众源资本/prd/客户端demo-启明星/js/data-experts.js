/** 专家智库 / 一线调研 · 对齐 WebUI expert-hub-mock + journalist mock */
(function () {
  'use strict';
  var COVER = './assets/meeting-covers/';

  window.EXPERT_HUB = {
    sectors: ['全部', 'AI产业', '科技', '金融', '消费', '医疗健康', '先进制造', '能源材料'],
    noteSectors: ['全部', '半导体', 'AI应用', '新能源', '算力'],
    meetings: [
      {
        id: 'mt1', status: 'live', title: 'AI波动坚定信心',
        speaker: '刘高畅 · 李瑶', org: '财联社首席说系列直播',
        tag: 'AI与算力', sector: 'AI产业', time: '2026-07-06 20:00',
        count: 628, countLabel: '报名', cover: COVER + 'ai-volatility-confidence.png'
      },
      {
        id: 'mt2', status: 'soon', title: '机器人、卫星领涨，科技局部活跃怎么看？',
        speaker: '高磊 · 小白', org: '财联社投资学院',
        tag: '机器人', sector: '科技', time: '2026-07-03 15:00',
        count: 412, countLabel: '报名', enrolled: true, cover: COVER + 'robot-satellite-market.png'
      },
      {
        id: 'mt3', status: 'soon', title: '宇树IPO获批，机器人能否成为新主线？',
        speaker: '王啊奔 · 钱迪', org: '财联社与摩尔投研联合直播',
        tag: '具身智能', sector: '科技', time: '2026-07-03 12:00',
        count: 298, countLabel: '报名', cover: COVER + 'unitree-ipo.png'
      },
      {
        id: 'mt4', status: 'soon', title: '连线投资一线：2026硅谷AI一线调研',
        speaker: '周大勇', org: '前国泰证券交易所发行部副总经理',
        tag: '硅谷AI', sector: 'AI产业', time: '2026-07-15 15:30',
        count: 445, countLabel: '报名', cover: COVER + 'silicon-valley-ai.jpg'
      },
      {
        id: 'mt5', status: 'done', title: '金融大模型深度访谈：需求、落地与商业模式',
        speaker: '万军 · 苏仪', org: '财跃星辰与中泰证券联合访谈',
        tag: '金融AI', sector: '金融', time: '2026-06-12 15:00',
        count: 186, countLabel: '参会', cover: COVER + 'financial-llm-interview.jpg',
        coverPosition: 'center 8%'
      },
      {
        id: 'mt6', status: 'done', title: '光纤新周期：行业趋势与供需格局',
        speaker: '行业专家会议', org: '财跃星辰产业研究',
        tag: '光通信', sector: '科技', time: '2026-07-09 14:00',
        count: 534, countLabel: '参会', cover: COVER + 'fiber-cycle.jpg',
        coverPosition: 'center 5%'
      }
    ],
    notes: [
      {
        id: 'n1', title: '某算力芯片供需格局深度解读 · 会议纪要',
        speaker: '某专家B · 某券商', date: '2026-05-14',
        tags: ['半导体', '算力'], points: 12, meetingId: 'mt5',
        preview: '供给端交期改善；国产 GPU 三路线并行；推理部署增速快于训练。'
      },
      {
        id: 'n2', title: 'AI Agent 爆发期：通用智能体投资机会 · 会议纪要',
        speaker: '某专家A · 某研究院', date: '2026-05-10',
        tags: ['AI应用', 'Agent'], points: 9, meetingId: 'mt6',
        preview: 'Agent 看工具闭环与可观测工作流；ToB ARR 路径更清晰；护城河在数据接入。'
      },
      {
        id: 'n3', title: '固态电池产业化节奏与材料环节梳理 · 会议纪要',
        speaker: '某专家E · 某券商', date: '2026-05-08',
        tags: ['新能源', '锂电'], points: 11,
        preview: '半固态 2026–2027 小批量；优先看电解质与干法电极；警惕只有 PPT 能量密度。'
      }
    ],
    reporters: [
      {
        id: 're1', name: '杜姐', field: '医疗器械', role: '一线调研专员',
        exp: '8 年医疗器械产业调研，覆盖器械注册与集采',
        canDo: '行业趋势咨询、竞品动态、政策解读、订单真实性核实'
      },
      {
        id: 're2', name: '李XX', field: '航空 MRO', role: '一线调研专员',
        exp: '5 年航空产业链调研，熟悉航司采购逻辑',
        canDo: '产业链上下游核实、竞争格局、订单真实性核实'
      }
    ],
    bookingExperts: [
      { id: 'ex1', name: '张XX（脱敏）', field: '航空维修 MRO', capabilities: '航司采购逻辑、MRO 竞争格局' },
      { id: 'ex2', name: '李XX（脱敏）', field: '民航适航认证', capabilities: '适航认证标准、C919 进度' },
      { id: 'ex3', name: '王XX（脱敏）', field: '医疗器械注册', capabilities: '注册审批、集采政策' },
      { id: 'ex4', name: '陈XX（脱敏）', field: '半导体设备', capabilities: '设备国产化、产能验证' }
    ],
    journalist: {
      lead: '一线调研帮你尽调企业。调研团队可实地走访、采访产业链上下游、挖「暗礁」，出调研报告；行业快问可走专家智库预约对接。',
      caseCard: {
        title: '兮璞材料「抢跑」上市 向日葵跨界半导体「暗礁」隐现',
        tags: ['产业链上下游采访', '实地走访', '交叉验证'],
        highlight: '产业链上下游采访 + 实地走访 + 交叉验证',
        summary:
          '一线调研实地走访发现：标的方产能与 BP 披露存在差距，核心客户合同尚未签署，跨界半导体逻辑缺乏产业验证 — 这些是公开数据看不到的「暗礁」。',
        url: 'https://www.cls.cn/detail/2240231'
      },
      requests: [
        {
          id: 'jr-1',
          company: '苏州某生物医药科技有限公司',
          questions: '核实其他应收款对手方是否为关联方；走访主要经销商回款情况。',
          status: '对接中',
          submittedAt: '2026-06-20'
        }
      ],
      report: {
        title: '航空 MRO 行业竞争格局调研报告',
        reporter: '李XX（一线调研组）',
        date: '2024-06-20',
        projectName: '某微电子售后回租尽调',
        judgment:
          '目标企业短期订单增长确定性高，但 2025H2 面临海外竞争压力，需关注价格战风险。',
        findings: [
          '2024 年新增 737MAX 维修订单约 200 架次，同比增长 45%',
          'C919 适航认证已于 2024 年 3 月通过，预计 2025 年开始接单',
          'ST Engineering 已在上海设子公司，预计 2025H2 运营，将直接竞争国航/东航订单'
        ],
        risks: ['海外竞争加剧', '价格战风险']
      }
    }
  };
})();
