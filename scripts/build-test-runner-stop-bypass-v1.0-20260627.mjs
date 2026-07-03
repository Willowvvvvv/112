/**
 * 停止按钮 + bypass 默认权限 — 静态检查
 * 版本: v1.0 | 日期: 2026-06-27
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const render = read("scripts/render.js");
const actions = read("scripts/actions.js");
const bridge = read("scripts/agentscope-bridge-v1.0-20260627.js");
const config = read("scripts/agentscope-config-v1.0-20260627.js");

if (!render.includes("stopGeneration")) throw new Error("render.js 缺少 stopGeneration");
if (!render.includes("composer-send--stop")) throw new Error("render.js 缺少停止按钮样式类");
if (!actions.includes("stopGeneration")) throw new Error("actions.js 缺少 stopGeneration");
if (!bridge.includes("hooks.setStreaming(false)")) throw new Error("bridge abortLive 未清理 streaming");
if (!config.includes('DEFAULT_PERMISSION_MODE = "bypass"')) {
  throw new Error("agentscope-config 默认权限不是 bypass");
}

console.log("build-test-runner: stop-bypass ok");
