/**
 * 把 dsh-world 的补丁重新打上。
 *
 * 用途：dsh-world 重装 / 升级之后，这些改动会跟着 node_modules 一起消失，
 * 而且不会报错，只会静默退化（比如图片收不到、控制台少页）。
 * 这个脚本就是用来「重放」的。
 *
 * 用法：
 *   node patches/apply.mjs            # 打补丁 + 语法校验
 *   node patches/apply.mjs --check    # 只检查，不改文件
 *
 * 设计：
 * - 桥路由用锚点补丁，幂等，已经是新版结构就跳过。
 * - 控制台客户端是整文件快照，按 dsh-world 版本匹配；版本不符就拒绝，
 *   避免把新版的界面覆盖成旧版。
 * - 改动前一律留 .bak-<时间戳>。
 */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import * as bridgeImages from './world-bridge-images.mjs';

const PROFILE = process.env.DSH_WORLD_PROFILE_DIR ?? 'C:/Users/demo/.dsh/profiles/desktop';
const WORLD_PKG = join(PROFILE, 'node_modules/dsh-world');
const HERE = new URL('.', import.meta.url).pathname.replace(/^\//, '');

const checkOnly = process.argv.includes('--check');

const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

function pkgVersion() {
  return JSON.parse(readFileSync(join(WORLD_PKG, 'package.json'), 'utf8')).version;
}

/** 锚点补丁：读文件 → detect → apply → 写回 */
function applyAnchorPatch(mod) {
  const target = join(WORLD_PKG, mod.file);
  if (!existsSync(target)) return { id: mod.id, status: 'missing', detail: target };
  const source = readFileSync(target, 'utf8');
  if (mod.detect(source)) return { id: mod.id, status: 'already' };
  if (checkOnly) return { id: mod.id, status: 'needed' };
  const next = mod.apply(source);
  copyFileSync(target, `${target}.bak-${stamp()}`);
  writeFileSync(target, next, 'utf8');
  return { id: mod.id, status: 'applied' };
}

/** 整文件快照：版本匹配才覆盖 */
function applySnapshot(name, relTarget, expectedVersion) {
  const snapshot = join(HERE, name);
  if (!existsSync(snapshot)) return { id: name, status: 'missing-snapshot', detail: snapshot };
  const target = join(WORLD_PKG, relTarget);
  if (!existsSync(target)) return { id: name, status: 'missing', detail: target };

  const actual = pkgVersion();
  if (actual !== expectedVersion) {
    return {
      id: name,
      status: 'version-mismatch',
      detail: `快照是给 dsh-world ${expectedVersion} 的，装的是 ${actual}；需要按新版重新生成快照`,
    };
  }
  const a = readFileSync(snapshot, 'utf8');
  const b = readFileSync(target, 'utf8');
  if (a === b) return { id: name, status: 'already' };
  if (checkOnly) return { id: name, status: 'needed' };
  copyFileSync(target, `${target}.bak-${stamp()}`);
  writeFileSync(target, a, 'utf8');
  return { id: name, status: 'applied' };
}

function syntaxOk(rel) {
  // 用 node --check 做真正的语法校验；dsh-world 是 type:module，ESM 也能过。
  const target = join(WORLD_PKG, rel);
  const r = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
  return r.status === 0;
}

const expectedClientVersion = readFileSync(join(HERE, 'world-client.version.txt'), 'utf8').trim();

const results = [];
results.push(applyAnchorPatch(bridgeImages));
results.push(applySnapshot('world-client-0.5.6.js', 'client/index.js', expectedClientVersion));

console.log(`dsh-world ${pkgVersion()}`);
console.log(checkOnly ? '（只检查，不写入）\n' : '');
for (const r of results) {
  const detail = r.detail === undefined ? '' : ` — ${r.detail}`;
  console.log(`  ${r.id}: ${r.status}${detail}`);
}

if (!checkOnly) {
  const route = 'lib/ecosystem/bridge/route.js';
  console.log(`\n语法校验 ${route}: ${syntaxOk(route) ? 'ok' : '失败'}`);
}

const bad = results.filter((r) => r.status === 'missing' || r.status === 'missing-snapshot' || r.status === 'version-mismatch');
if (bad.length > 0) {
  console.log('\n有需要人工处理的项目，见上面。');
  process.exit(2);
}
console.log('\n补丁状态：齐了。');
