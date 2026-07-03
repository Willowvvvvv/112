#!/usr/bin/env bash
# 构建 GitHub Pages 静态站点（仅 frontend 使用端 Demo）
# 版本：v1.2.0 · 2026-07-03
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/.gh-pages-build"
EXCLUDES="$ROOT/scripts/demo-publish-excludes-v1.0-20260703.txt"

rm -rf "$OUT"
mkdir -p "$OUT"

# 使用端 -> 站点根目录（跳过 admin 软链、e2e 依赖等）
rsync -a --exclude-from="$EXCLUDES" "$ROOT/frontend/" "$OUT/"

touch "$OUT/.nojekyll"

echo "Built GitHub Pages site at: $OUT"
echo "  frontend: / (repo root)"
