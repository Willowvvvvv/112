#!/usr/bin/env bash
# 本地构建并推送 gh-pages 分支（仅 frontend 静态 Demo，不上传 monorepo / agent-demo）
# 版本：v1.2.0 · 2026-07-03
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$PROJECT_ROOT/.gh-pages-build"
GH_PAGES_REPO="${GH_PAGES_REPO:-Willowvvvvv/112}"
ORIGIN_URL="git@github.com:${GH_PAGES_REPO}.git"

bash "$PROJECT_ROOT/scripts/build-gh-pages.sh"

echo "推送到 ${GH_PAGES_REPO}/gh-pages（仅 frontend）..."

rm -rf "$SITE/.git"
cd "$SITE"
git init -q
git checkout -b gh-pages
git add -A
git commit -q -m "deploy: frontend demo only $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git remote remove origin 2>/dev/null || true
git remote add origin "$ORIGIN_URL"
git push -f origin gh-pages

echo ""
echo "已推送 gh-pages（仅 frontend，已移除 admin/portal/agent-demo）。"
echo "  Source: Deploy from a branch -> gh-pages / (root)"
echo ""
REPO_NAME="${GH_PAGES_REPO##*/}"
echo "访问地址："
echo "  https://willowvvvvv.github.io/${REPO_NAME}/"
echo "  https://willowvvvvv.github.io/${REPO_NAME}/#/report-templates"
