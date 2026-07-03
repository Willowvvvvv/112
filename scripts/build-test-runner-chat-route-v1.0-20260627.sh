#!/usr/bin/env bash
# build-test-runner: 首页场景 / 新对话路由
# 版本: v1.0 | 日期: 2026-06-27
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/scripts"

node test-session-auto-title-v1.0-20260627.mjs
node test-chat-route-v1.0-20260627.mjs
node test-chat-persistence-v1.0-20260627.mjs
node test-project-persistence-v1.0-20260628.mjs
node test-guess-company-v1.0-20260627.mjs
node test-session-files-v1.0-20260627.mjs
node test-no-agentscope-brand-v1.0-20260628.mjs

echo "build-test-runner: chat-route ok"
