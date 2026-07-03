/**
 * session-files — 项目材料解析与查找（文件树展示 / 移动 / 引用共用）
 * 版本: v1.0 | 日期: 2026-06-27
 */
import { DEMO_PROJECT, LEASE_DEMO_PROJECT } from "../data/mock-data.js";

export function resolveProjectRootSession(projectId, state) {
  if (!projectId) return null;
  if (projectId === DEMO_PROJECT.id) {
    return state.sessionCache?.[projectId] || DEMO_PROJECT;
  }
  if (projectId === LEASE_DEMO_PROJECT.id) {
    return state.sessionCache?.[projectId] || LEASE_DEMO_PROJECT;
  }
  if (state.sessionCache?.[projectId]) return state.sessionCache[projectId];
  return Object.values(state.sessionCache || {}).find(
    s => s?.projectId === projectId && (s?.materials?.length || s?.aiReports?.length)
  ) || null;
}

/** 当前会话可见材料（子会话空材料时回落到项目根会话） */
export function getSessionFiles(sess, state) {
  if (!sess) return { materials: [], aiReports: [] };
  let materials = sess.materials || [];
  let aiReports = sess.aiReports || [];
  if (sess.projectId && !materials.length && !aiReports.length) {
    const root = resolveProjectRootSession(sess.projectId, state);
    materials = root?.materials || [];
    aiReports = root?.aiReports || [];
  }
  return { materials, aiReports };
}

/**
 * 按 id 查找材料实体及所属 session（移动/引用/预览须写回正确 owner）
 * @returns {{ file: object, ownerSession: object, collection: 'materials'|'aiReports' }|null}
 */
export function findSessionFile(fileId, sess, state) {
  if (!fileId || !sess) return null;

  const fromSession = (session) => {
    const mat = (session.materials || []).find(m => m.id === fileId);
    if (mat) return { file: mat, ownerSession: session, collection: "materials" };
    const ai = (session.aiReports || []).find(r => r.id === fileId);
    if (ai) return { file: ai, ownerSession: session, collection: "aiReports" };
    return null;
  };

  const direct = fromSession(sess);
  if (direct) return direct;

  if (sess.projectId) {
    const root = resolveProjectRootSession(sess.projectId, state);
    if (root && root !== sess) return fromSession(root);
  }
  return null;
}
