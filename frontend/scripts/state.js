/**
 * state.js — 全局状态与 UI 壳层工具
 * 版本：v7.7.0-20250626
 *
 * 产品模型（Demo）：
 * - view：当前主视图（chat = 对话壳；radar/find/… = 重磁功能页）
 * - session：当前对话上下文（含 materials、messages、saved 是否已存为项目）
 * - projectList / recentItems：侧栏「项目」「对话」数据源
 * - userAccount：积分余额、可购套餐包、消耗流水（无免费次数权益、无扣费确认弹窗）
 */

export function createInitialState() {
  return {
    view: "chat",
    sessionId: "new",
    session: null,
    recentItems: null,
    projectList: null,
    featureData: null,
    /** 当前登录用户 */
    currentUser: null,
    /** 部署形态：saas | private */
    deploymentMode: "saas",
    userSectors: [],
    /** 对话任务路由：bp | batch | deep | deliberation 等，影响 send 与引导文案 */
    chatMode: null,
    /** 回答方式：direct 直接回答 | multiReview 多专家讨论（由专家弹窗开关驱动） */
    responseStyle: "direct",
    userMonitors: [],
    userTemplates: null,
    /** 资料库选中的报告模板（未存项目时也生效） */
    activeTemplate: null,
    activeTemplateId: null,
    userSkills: [],
    /** 已安装连接器 installKey（mock 工作区） */
    installedConnectors: [],
    /** 我的技能收藏（官方技能安装后同步） */
    mySkillBookmarks: [],
    /** 自建技能完整定义 */
    customSkillDefs: [],
    /** 自建专家 */
    userExperts: [],
    userMaterials: [],
    starMemories: null,
    reporterRequests: [],
    meetingEnrollments: ["mt2"],
    /** v7.0 首次引导 */
    onboarding: {
      active: false,
      step: 0,
      draft: {
        org: "",
        orgCreditCode: "",
        dept: "",
        role: "",
        sectors: [],
        focusNotes: "",
        focuses: []
      }
    },
    ui: {
      drawer: null,
      toast: "",
      chatInput: "",

      /** 项目内左侧文件树是否展开；收起时显示贴边「>」浮钮（非顶栏按钮） */
      filesOpen: true,
      sidebarOpen: true,

      /** 右侧内容面板：报告全文、资讯全文、找项目名单、文件预览等 */
      previewOpen: false,
      previewKind: null,
      previewData: null,
      selectedFileId: null,
      previewSourceKey: null,

      /** 侧栏分区折叠：项目优先展开，对话默认收起 */
      projectsExpanded: true,
      chatsExpanded: false,
      projectExpandedMap: {},
      /** 当前项目工作台（#/p/{id}，无子会话） */
      projectHubId: null,

      modal: null,
      streaming: false,
      composerHint: null,
      /** 输入框场景 pill：{ label, hint }，选 tag 后填入，发送时一并派发 */
      composerChip: null,
      /** 从文件树拖入/插入的 +引用 [{ id, name }] */
      composerFileRefs: [],
      /** 当前主专家（单选模式或多选时的首位；未选时 null，对话走小星） */
      activeExpertId: null,
      /** 多专家 Battle 红方/蓝方（各最多 4 人） */
      battleRedIds: [],
      battleBlueIds: [],
      battleActiveSide: "red",
      /** @deprecated 兼容旧逻辑 */
      activeExpertIds: [],
      /** 专家弹窗内「专家 Battle · 红蓝对抗」开关 */
      multiExpertDiscussion: false,
      expertMenuOpen: false,
      responseStyleMenuOpen: false,
      forceContextTags: null,
      composerMenu: null,
      citedMaterial: null,
      scenarioOpen: false,
      sidebarMoreOpen: false,
      aiOutputMenuOpen: false,
      reportTab: "preview",

      /**
       * 投资雷达右侧栏：
       * - 打开资讯全文时自动 false，避免与 preview 叠层
       * - 与 preview 互斥展示，通过底部「推荐」条切换
       */
      radarInterestsOpen: true,

      accountModalOpen: false,
      /** 侧栏行 ⋯ 菜单；桌面端 hover 显示，触屏常显 */
      rowMenu: null,
      /** 项目文件分类文件夹展开态，默认全展开 */
      fileGroupExpanded: {},
      /** 文件树拖拽悬停的目标分类 */
      fileDragOverCat: null,
      /** 用户拖拽后的右栏宽度（px），会话内保持 */
      rightPanelWidth: null,

      /** 全部对话抽屉 */
      allChatsOpen: false,

      /** 撰写报告：生成中 */
      reportGenerating: false,
      /** 上传新材料后触发的报告更新提示 { fileNames, fileIds, affectedSections } */
      reportUpdatePrompt: null,
      /** 上会材料打包草稿 { selectedFileIds, reportVersion, generatedDocs } */
      meetingMaterialsDraft: null,

      /** 技能市场 Tab：official | my */
      skillsTab: "official",
      /** 能力市场类型：expert | skill | connector */
      skillsKind: "expert",
      /** 官方技能分类筛选 */
      skillCategory: "all",
      skillWizard: null,
      expertWizard: null
    }
  };
}

export function setToast(state, msg) {
  state.ui.toast = msg;
}

export function openDrawer(state, title, html) {
  state.ui.drawer = { title, html };
}

export function closeDrawer(state) {
  state.ui.drawer = null;
}

export function openModal(state, type, data) {
  state.ui.modal = { type, data: data || null };
}

export function closeModal(state) {
  state.ui.modal = null;
}

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
