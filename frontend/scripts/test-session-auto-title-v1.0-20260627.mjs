/**
 * test-session-auto-title — 会话自动标题单元测试
 * 版本: v1.0 | 日期: 2026-06-27
 */
import assert from "node:assert/strict";

import {
  fallbackSessionTitle,
  isDefaultSessionName,
  MAX_SESSION_TITLE_LEN,
} from "./session-auto-title-v1.0-20260627.js";

assert.equal(isDefaultSessionName(""), true);
assert.equal(isDefaultSessionName("新对话"), true);
assert.equal(isDefaultSessionName("新对话 2"), true);
assert.equal(isDefaultSessionName("腾讯风险"), false);

assert.equal(
  fallbackSessionTitle("[查风险] 帮我查一下腾讯科技的风险情况").length,
  MAX_SESSION_TITLE_LEN,
);
assert.equal(
  fallbackSessionTitle("帮我查一下腾讯科技的风险情况"),
  "帮我查一下腾讯科技的",
);

console.log("test-session-auto-title ok");
