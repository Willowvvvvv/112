/**
 * 前端用户可见文案不得出现 AgentScope 品牌
 * 版本: v1.0 | 日期: 2026-06-28
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { wrapFinstepPublicText } from './finstep-data-wrapper-v1.0-20260627.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const USER_FACING_FILES = [
  'scripts/render.js',
  'scripts/actions.js',
];

const BRAND_RE = /agentscope/i;

function collectStrings(content) {
  const hits = [];
  const patterns = [
    /`([^`\\]|\\.)*`/g,
    /'([^'\\]|\\.)*'/g,
    /"([^"\\]|\\.)*"/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content))) {
      const raw = m[0];
      if (!BRAND_RE.test(raw)) continue;
      if (
        /\.js["'`]?$/.test(raw) ||
        /^\s*["'`]\.\//.test(raw) ||
        /@agentscope-ai\//.test(raw) ||
        /from\s+["'`]/.test(content.slice(Math.max(0, m.index - 8), m.index + 2))
      ) {
        continue;
      }
      hits.push(raw);
    }
  }
  return hits;
}

for (const rel of USER_FACING_FILES) {
  const content = readFileSync(join(root, rel), 'utf8');
  const hits = collectStrings(content);
  if (hits.length) {
    console.error(`${rel} contains user-visible AgentScope string:`, hits.slice(0, 3));
    process.exit(1);
  }
}

const sample = wrapFinstepPublicText('AgentScope 返回了 agentscope 错误');
if (/agentscope/i.test(sample)) {
  console.error('wrapFinstepPublicText did not strip AgentScope');
  process.exit(1);
}

console.log('test-no-agentscope-brand-v1.0-20260628: ok');
