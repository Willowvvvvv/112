(function () {
  'use strict';

  var COMPANIES = [
    { name: '智算芯片科技有限公司',   sector: '半导体',   lit: true,  revenueGrowth: 34.2,  netProfit: 1820,  anomalyCount: 2 },
    { name: '碳纤维新材料有限公司',   sector: '新材料',   lit: true,  revenueGrowth: 18.5,  netProfit: 3240,  anomalyCount: 0 },
    { name: '光伏储能技术有限公司',   sector: '新能源',   lit: true,  revenueGrowth: 67.3,  netProfit:  520,  anomalyCount: 3 },
    { name: '工业机器人集成有限公司', sector: '智能制造', lit: true,  revenueGrowth: -8.4,  netProfit:  890,  anomalyCount: 1 },
    { name: '医疗影像AI有限公司',     sector: '医疗科技', lit: true,  revenueGrowth: 22.1,  netProfit:  440,  anomalyCount: 0 },
    { name: '新能源汽车零部件有限公司', sector: '汽车零部件', lit: true, revenueGrowth: 41.7, netProfit: 2180, anomalyCount: 1 },
    { name: '云原生安全科技有限公司', sector: '网络安全', lit: true,  revenueGrowth: 15.3,  netProfit:  670,  anomalyCount: 0 },
    { name: '精准农业技术有限公司',   sector: '农业科技', lit: true,  revenueGrowth:  9.8,  netProfit:  310,  anomalyCount: 2 },
    { name: '低空飞行器制造有限公司', sector: '航空航天', lit: true,  revenueGrowth: 88.6,  netProfit: -340,  anomalyCount: 4 },
    { name: '分布式储能系统有限公司', sector: '新能源',   lit: true,  revenueGrowth: 53.2,  netProfit: 1120,  anomalyCount: 1 },
    { name: '固态电池研究有限公司',   sector: '新能源',   lit: true,  revenueGrowth: 129.4, netProfit: -680,  anomalyCount: 3 },
    { name: '数字孪生平台有限公司',   sector: '工业软件', lit: true,  revenueGrowth: 28.7,  netProfit:  790,  anomalyCount: 0 },
    { name: '生物基材料有限公司',     sector: '新材料',   lit: true,  revenueGrowth: 11.2,  netProfit: 1560,  anomalyCount: 0 },
    { name: '量子通信技术有限公司',   sector: '量子科技', lit: true,  revenueGrowth: 45.8,  netProfit: -120,  anomalyCount: 2 },
    { name: '医疗器械研发有限公司',   sector: '医疗科技', lit: true,  revenueGrowth:  6.3,  netProfit: 2340,  anomalyCount: 1 },
    { name: '智能物流系统有限公司',   sector: '智能制造', lit: true,  revenueGrowth: -3.7,  netProfit: 1890,  anomalyCount: 1 },
    { name: '海洋资源开发有限公司',   sector: '海洋科技', lit: true,  revenueGrowth: 17.9,  netProfit: 4320,  anomalyCount: 0 },
    { name: '柔性显示技术有限公司',   sector: '半导体',   lit: true,  revenueGrowth: 72.1,  netProfit:  280,  anomalyCount: 2 },
    { name: '核聚变能源技术有限公司', sector: '新能源',   lit: false },
    { name: '脑机接口研究有限公司',   sector: '医疗科技', lit: false },
    { name: '纳米制造设备有限公司',   sector: '半导体',   lit: false },
    { name: '氢能燃料电池有限公司',   sector: '新能源',   lit: false },
    { name: '卫星互联网终端有限公司', sector: '航天通信', lit: false },
    { name: '生物医药CDMO有限公司',   sector: '生物医药', lit: false },
    { name: '工业互联网平台有限公司', sector: '工业软件', lit: false },
    { name: '超导材料应用有限公司',   sector: '新材料',   lit: false },
    { name: '智能驾驶芯片有限公司',   sector: '半导体',   lit: false },
    { name: '绿色建筑材料有限公司',   sector: '新材料',   lit: false },
    { name: '数字疗法科技有限公司',   sector: '医疗科技', lit: false },
    { name: '高端装备制造有限公司',   sector: '智能制造', lit: false },
  ];

  window.PE_PORTFOLIO_DATA = { COMPANIES: COMPANIES };
})();
