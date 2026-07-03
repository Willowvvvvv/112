/**
 * test-chat-route — 首页场景选择不得误入项目路由
 * 版本: v1.0 | 日期: 2026-06-27
 */
import assert from "node:assert/strict";
import {
  defaultLandingHash,
  isHomeChatSession,
  isOnProjectRoute,
  isProjectBoundSession,
  isProjectHubState,
  parseProjectRoute,
  standaloneChatHash,
} from "./chat-route-v1.0-20260627.js";

assert.equal(defaultLandingHash(), "/chat/new");

assert.equal(isOnProjectRoute("#/p/proj-001"), true);
assert.equal(isOnProjectRoute("#/chat/new"), false);
assert.equal(isOnProjectRoute("#/chat/session-1"), false);

assert.deepEqual(parseProjectRoute("#/p/proj-001"), { projectId: "proj-001", chatId: null });
assert.deepEqual(parseProjectRoute("#/p/proj-001/c/chat-1"), {
  projectId: "proj-001",
  chatId: "chat-1",
});

const hubState = { ui: { projectHubId: "proj-001" }, session: { projectId: "proj-001", messages: [] } };
assert.equal(isProjectHubState(hubState, "#/p/proj-001"), true);
assert.equal(isProjectHubState(hubState, "#/p/proj-001/c/chat-1"), false);
assert.equal(isProjectHubState({ ui: { projectHubId: null } }, "#/p/proj-001"), false);

const home = { id: "session-1", kind: "ephemeral", saved: false, company: "", messages: [] };
const project = { id: "proj-1", kind: "project", projectId: "proj-1", saved: true, messages: [] };

assert.equal(isHomeChatSession(home), true);
assert.equal(isHomeChatSession(project), false);
assert.equal(isProjectBoundSession(home), false);
assert.equal(isProjectBoundSession(project), true);

assert.equal(standaloneChatHash(home, { preferNew: true }), "/chat/new");
assert.equal(standaloneChatHash(home), "/chat/session-1");

console.log("test-chat-route-v1.0-20260627: ok");
