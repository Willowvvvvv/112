/**
 * chat-persistence 单元测试
 * 版本: v1.0 | 日期: 2026-06-27
 */
import {
  isUserChatSession,
  pickPersistableSessions,
  mergeRecentItems,
  buildRecentItemFromSession,
} from "./chat-persistence-v1.0-20260627.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(isUserChatSession("session-1719000000000"), "用户会话 id");
assert(!isUserChatSession("ephemeral-sample"), "Demo 会话不持久化");

const cache = {
  "session-100": { id: "session-100", kind: "ephemeral", messages: [{ role: "user", text: "你好" }] },
  "ephemeral-sample": { id: "ephemeral-sample", messages: [] },
};
const picked = pickPersistableSessions(cache);
assert(Object.keys(picked).length === 1 && picked["session-100"], "仅保留用户会话");

const merged = mergeRecentItems(
  [{ id: "ephemeral-sample", kind: "ephemeral", label: "demo" }],
  [{ id: "session-100", kind: "ephemeral", label: "我的对话" }],
);
assert(merged[0].id === "session-100", "用户对话排在 Demo 前");

const recent = buildRecentItemFromSession({
  id: "session-200",
  name: "新对话",
  messages: [{ role: "user", text: "[批量对比打分] 天仪基业" }],
});
assert(recent.label.includes("天仪基业"), "侧栏标题取自首条用户消息");

console.log("test-chat-persistence-v1.0-20260627: ok");
