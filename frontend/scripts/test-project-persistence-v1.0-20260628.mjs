/**
 * project-persistence 单元测试
 * 版本: v1.0 | 日期: 2026-06-28
 */
import {
  isUserCreatedProjectId,
  isProjectSession,
  pickPersistableProjects,
  pickPersistableProjectSessions,
  mergeUserProjects,
} from "./project-persistence-v1.0-20260628.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(isUserCreatedProjectId("proj-1719000000000"), "用户项目 id");
assert(!isUserCreatedProjectId("proj-bioray-001"), "种子项目不视为用户项目");
assert(isProjectSession({ id: "proj-1719000000000", kind: "project" }), "项目会话可持久化");
assert(!isProjectSession({ id: "session-100" }), "独立对话走 chat-persistence");

const projects = pickPersistableProjects([
  { id: "proj-bioray-001", name: "种子" },
  { id: "proj-1719000000001", name: "我的项目" },
]);
assert(projects.length === 1 && projects[0].id === "proj-1719000000001", "仅保留用户项目");

const sessions = pickPersistableProjectSessions({
  "proj-1719000000001": { id: "proj-1719000000001", saved: true },
  "proj-1719000000999": { id: "proj-1719000000999", saved: true },
  "session-100": { id: "session-100" },
}, new Set(["proj-1719000000001"]));
assert(Object.keys(sessions).length === 1 && sessions["proj-1719000000001"], "仅保留仍在列表中的项目会话");

const merged = mergeUserProjects(
  [{ id: "proj-bioray-001", name: "种子" }],
  [{ id: "proj-1719000000002", name: "新建" }],
);
assert(merged[0].id === "proj-1719000000002", "用户项目排在种子前");

console.log("test-project-persistence-v1.0-20260628: ok");
