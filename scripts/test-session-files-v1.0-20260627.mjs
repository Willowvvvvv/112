/**
 * test-session-files — 项目材料查找与分类移动
 * 版本: v1.0 | 日期: 2026-06-27
 */
import assert from "node:assert/strict";
import { createSession } from "../data/mock-data.js";
import {
  findSessionFile,
  getSessionFiles,
  resolveProjectRootSession,
} from "./session-files-v1.0-20260627.js";

const rootMat = { id: "m-root", name: "root.pdf", category: "财务" };
const rootSession = createSession({
  id: "proj-test-001",
  projectId: "proj-test-001",
  materials: [rootMat],
  saved: true,
});

const state = {
  sessionCache: { "proj-test-001": rootSession },
};

const emptyChild = createSession({
  id: "chat-child",
  projectId: "proj-test-001",
  materials: [],
  saved: true,
});

assert.equal(getSessionFiles(emptyChild, state).materials.length, 1);
assert.equal(getSessionFiles(emptyChild, state).materials[0].id, "m-root");

const hit = findSessionFile("m-root", emptyChild, state);
assert.ok(hit);
assert.equal(hit.collection, "materials");
assert.equal(hit.ownerSession.id, "proj-test-001");

hit.file.category = "BP";
assert.equal(rootMat.category, "BP");

const resolved = resolveProjectRootSession("proj-test-001", state);
assert.equal(resolved.id, "proj-test-001");

console.log("test-session-files: ok");
