#!/usr/bin/env bash
# 静态 frontend 项目交互 Playwright E2E
# 版本: v1.0 | 日期: 2026-07-01
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

grep -q 'import { setToast, openModal, closeModal, closeDrawer } from "./state.js"' scripts/actions.js
grep -q 'btn-header-action.*openCreateModal' scripts/render.js

E2E_DIR="$ROOT/e2e"
if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found" >&2
  exit 1
fi

cd "$E2E_DIR"
if [ ! -d node_modules/@playwright/test ]; then
  npm install --no-save @playwright/test@^1.52.0 playwright@^1.52.0
fi
if [ ! -d "$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228" ] && [ ! -d "$HOME/.cache/ms-playwright/chromium_headless_shell-1228" ]; then
  npx playwright install chromium
fi
npx playwright test project-interactions-v1.0-20260701.spec.mjs --config playwright.config.mjs

echo "build-test-runner-frontend-project-e2e-v1.0-20260701: ok"
