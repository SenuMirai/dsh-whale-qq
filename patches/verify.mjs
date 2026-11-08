/**
 * 校验 dsh-world 的补丁是否都还在。
 *
 * 不写文件，只报状态；适合重启后、升级后、或者「感觉哪里不对」时先跑一遍。
 *
 * 用法：node patches/verify.mjs
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PROFILE = process.env.DSH_WORLD_PROFILE_DIR ?? 'C:/Users/demo/.dsh/profiles/desktop';
const WORLD_PKG = join(PROFILE, 'node_modules/dsh-world');
const HERE = new URL('.', import.meta.url).pathname.replace(/^\//, '');

const checks = [
  {
    name: '桥收图片',
    file: 'lib/ecosystem/bridge/route.js',
    need: ['bridge-images-patched|Array.isArray(body?.images)', 'saveImages|images'],
  },
  {
    name: '控制台 · 记忆页',
    file: 'client/index.js',
    need: ['function Traces', 'domainLabel', "'群对话'"],
  },
  {
    name: '控制台 · 活动记录可折叠',
    file: 'client/index.js',
    need: ['function Fold', 'defaultOpen: false'],
  },
  {
    name: '控制台 · 最近娱乐',
    file: 'client/index.js',
    need: ['function Entertainment', 'ENTERTAIN'],
  },
  {
    name: '控制台 · 错误边界',
    file: 'client/index.js',
    need: ['TabBoundary'],
  },
];

let failed = 0;
for (const c of checks) {
  const target = join(WORLD_PKG, c.file);
  if (!existsSync(target)) {
    console.log(`✗ ${c.name} —— 文件不存在：${c.file}`);
    failed += 1;
    continue;
  }
  const src = readFileSync(target, 'utf8');
  const missing = c.need.filter((token) => {
    if (token.includes('|')) return !token.split('|').some((t) => src.includes(t));
    return !src.includes(token);
  });
  if (missing.length === 0) {
    console.log(`✓ ${c.name}`);
  } else {
    console.log(`✗ ${c.name} —— 缺：${missing.join(', ')}`);
    failed += 1;
  }
}

const snap = join(HERE, 'world-client-0.5.6.js');
console.log(`\n快照文件：${existsSync(snap) ? '在' : '缺'}`);
const verFile = join(HERE, 'world-client.version.txt');
if (existsSync(verFile)) console.log(`快照目标版本：${readFileSync(verFile, 'utf8').trim()}`);

console.log(failed === 0 ? '\n全部在位。' : `\n有 ${failed} 项缺失，跑 node patches/apply.mjs 补回来。`);
process.exit(failed === 0 ? 0 : 1);
