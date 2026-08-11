#!/usr/bin/env bash
# 财跃启明星 · 客户端 Demo → GitHub Pages 静态包
# 版本：v1.0 · 2026-08-11
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/.gh-pages-build"
EXCLUDES="$ROOT/scripts/gh-pages-excludes-v1.0-20260811.txt"

rm -rf "$OUT"
mkdir -p "$OUT"

rsync -a --exclude-from="$EXCLUDES" "$ROOT/" "$OUT/"
touch "$OUT/.nojekyll"

echo "Built GitHub Pages bundle at: $OUT"
echo "  entry: index.html"
