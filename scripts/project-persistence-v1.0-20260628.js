/**
 * 用户新建项目 + 项目会话 localStorage 持久化
 * 版本: v1.0 | 日期: 2026-06-28
 */

import { PROJECT_LIST } from "../data/mock-data.js";

export const PROJECT_PERSISTENCE_KEY = "jindiaobao-project-persistence-v1.0-20260628";
export const PROJECT_PERSISTENCE_VERSION = "1.0";

const MAX_USER_PROJECTS = 80;
const MAX_PROJECT_SESSIONS = 50;
const MAX_MESSAGES = 200;

const SEED_PROJECT_IDS = new Set(PROJECT_LIST.map((p) => p.id));

/** createProject / saveAsProject 生成的 id：proj-{timestamp} */
export function isUserCreatedProjectId(projectId) {
  return (
    typeof projectId === "string" &&
    /^proj-\d+$/.test(projectId) &&
    !SEED_PROJECT_IDS.has(projectId)
  );
}

export function isProjectSession(sessionOrId) {
  const id = typeof sessionOrId === "string" ? sessionOrId : sessionOrId?.id;
  return isUserCreatedProjectId(id);
}

function trimSession(sess) {
  if (!sess || typeof sess !== "object") return sess;
  const copy = { ...sess };
  if (Array.isArray(copy.messages) && copy.messages.length > MAX_MESSAGES) {
    copy.messages = copy.messages.slice(-MAX_MESSAGES);
  }
  return copy;
}

export function pickPersistableProjects(projectList) {
  return (projectList || [])
    .filter((p) => isUserCreatedProjectId(p?.id))
    .sort((a, b) => {
      const ta = Number(String(a.id).replace("proj-", "")) || 0;
      const tb = Number(String(b.id).replace("proj-", "")) || 0;
      return tb - ta;
    })
    .slice(0, MAX_USER_PROJECTS)
    .map((p) => ({
      ...p,
      members: [...(p.members || [])],
      chats: (p.chats || []).map((c) => ({ ...c })),
    }));
}

export function pickPersistableProjectSessions(sessionCache, projectIds = null) {
  const allowed =
    projectIds instanceof Set
      ? projectIds
      : projectIds
        ? new Set(projectIds)
        : null;
  const out = {};
  const entries = Object.entries(sessionCache || {})
    .filter(([id, sess]) => {
      if (!isProjectSession(sess)) return false;
      return !allowed || allowed.has(id);
    })
    .sort((a, b) => {
      const ta = Number(String(a[0]).replace("proj-", "")) || 0;
      const tb = Number(String(b[0]).replace("proj-", "")) || 0;
      return tb - ta;
    })
    .slice(0, MAX_PROJECT_SESSIONS);
  for (const [id, sess] of entries) {
    out[id] = trimSession(sess);
  }
  return out;
}

export function mergeUserProjects(seedList, userProjects) {
  const seed = [...(seedList || [])];
  const user = pickPersistableProjects(userProjects);
  const userIds = new Set(user.map((p) => p.id));
  return [
    ...user,
    ...seed.filter((p) => !userIds.has(p.id)),
  ];
}

export function loadProjectPersistence() {
  try {
    const raw = localStorage.getItem(PROJECT_PERSISTENCE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    return {
      projects: Array.isArray(data.projects) ? data.projects : [],
      sessions: data.sessions && typeof data.sessions === "object" ? data.sessions : {},
    };
  } catch {
    return null;
  }
}

export function saveProjectPersistence(payload) {
  try {
    const projects = pickPersistableProjects(payload?.projectList);
    const projectIds = new Set(projects.map((p) => p.id));
    const sessions = pickPersistableProjectSessions(payload?.sessionCache, projectIds);
    localStorage.setItem(
      PROJECT_PERSISTENCE_KEY,
      JSON.stringify({
        version: PROJECT_PERSISTENCE_VERSION,
        date: "2026-06-28",
        updatedAt: Date.now(),
        projects,
        sessions,
      }),
    );
    return true;
  } catch (err) {
    console.warn("[财跃启明星] 项目持久化失败", err);
    return false;
  }
}

let persistTimer = null;

export function scheduleProjectPersistence(payload, delayMs = 400) {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    saveProjectPersistence(payload);
  }, delayMs);
}
