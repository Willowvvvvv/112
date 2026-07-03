#!/usr/bin/env bash
# 仅将 frontend 源码推到 GitHub main（不含 admin / agent-demo / portal / monorepo 其余目录）
# 版本：v1.1.0 · 2026-07-03
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$PROJECT_ROOT/.demo-source-staging"
EXCLUDES="$PROJECT_ROOT/scripts/demo-publish-excludes-v1.0-20260703.txt"
DEMO_REPO="${DEMO_REPO:-Willowvvvvv/finstep}"
ORIGIN_URL="git@github.com:${DEMO_REPO}.git"

echo "==> 组装 Demo 源码（仅 frontend + 发布脚本）"
rm -rf "$STAGE"
mkdir -p "$STAGE/frontend" "$STAGE/scripts"

rsync -a --exclude-from="$EXCLUDES" "$PROJECT_ROOT/frontend/" "$STAGE/frontend/"
cp "$PROJECT_ROOT/scripts/build-gh-pages.sh" "$STAGE/scripts/"
cp "$PROJECT_ROOT/scripts/publish-gh-pages.sh" "$STAGE/scripts/"
cp "$PROJECT_ROOT/scripts/publish-demo-source-v1.0-20260703.sh" "$STAGE/scripts/"
cp "$EXCLUDES" "$STAGE/scripts/"

cat > "$STAGE/README-v1.0-20260703.md" <<'EOF'
# 尽调宝 Frontend Demo（GitHub 镜像）

本仓库**仅**包含静态使用端 `frontend/` 源码与发布脚本，不含 agent-demo、admin、portal 及 finstep monorepo 其他项目。

| 目录 | 说明 |
|------|------|
| `frontend/` | 静态使用端 Demo（含 mock 数据、RSS/雷达演示数据、manifest 等） |
| `scripts/` | 构建与 GitHub Pages 发布脚本 |

线上 Demo：`https://willowvvvvv.github.io/112/`

发布：

```bash
bash scripts/publish-gh-pages.sh
```
EOF

echo "==> 推送到 ${DEMO_REPO} main（孤儿提交，覆盖历史，仅 frontend）"
cd "$STAGE"
rm -rf .git
git init -q
git checkout -b main
git add -A
git commit -q -m "demo: frontend only $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git remote remove origin 2>/dev/null || true
git remote add origin "$ORIGIN_URL"
git push -f origin main

# 若远程曾存在仅含 admin/portal 的 gh-pages，删除该分支避免混淆
git push origin --delete gh-pages 2>/dev/null || true

echo ""
echo "已推送 frontend 源码到 ${DEMO_REPO}@main"
echo "未包含：agent-demo、admin、portal、monorepo 其他目录"
du -sh "$STAGE"
