/**
 * 死设置扫描（只读）。
 *
 * 判定「死」的标准：这个键只在三处出现 —— 类型定义、默认值、保存处理器赋值 ——
 * 却没有一个「读取点」（拿它做判断/取值）。这类设置改了不会有任何效果。
 *
 * 用法：node scripts/audit-dead-keys.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const CLIENT = path.join(ROOT, 'lib', 'client.js');

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.bak')) files.push(full);
  }
};
walk(SRC);

const texts = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));
const all = [...texts.values()].join('\n');
const client = fs.readFileSync(CLIENT, 'utf8');

// 收集 Settings 里所有键（含嵌套），用「键名: 值」的出现位置粗判
const typeStart = all.indexOf('type Settings = {');
const typeEnd = all.indexOf('\n};', typeStart);
const typeBlock = typeStart >= 0 ? all.slice(typeStart, typeEnd) : '';

// 递归拿键名：形如  name: 或 name?:  （缩进 2 空格以上）
const keys = [...typeBlock.matchAll(/^ {2,}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]);
const uniq = [...new Set(keys)];

const readRe = (k) => new RegExp(`\\.${k}\\b(?!\\s*:)`, 'g');
const assignRe = (k) => new RegExp(`\\b${k}\\s*:`, 'g');

const rows = [];
for (const k of uniq) {
  const assignCount = (all.match(assignRe(k)) || []).length;
  const readCount = (all.match(readRe(k)) || []).length;
  const uiCount = (client.match(new RegExp(`\\b${k}\\b`, 'g')) || []).length;
  rows.push({ key: k, assign: assignCount, read: readCount, ui: uiCount });
}

console.log('Settings 内键名总数:', uniq.length);
console.log();

const dead = rows.filter((r) => r.read === 0 && r.assign > 0);
console.log('=== 只被赋值、从未被读取（死设置）===');
if (dead.length === 0) console.log('（没有）');
for (const r of dead) {
  console.log(`  ${r.key.padEnd(26)} 赋值 ${String(r.assign).padStart(2)} 次 | 界面出现 ${String(r.ui).padStart(2)} 次`);
}

console.log();
const uiOnly = rows.filter((r) => r.read > 0 && r.ui === 0);
console.log('=== 后端在用、界面没有（调不到）===');
for (const r of uiOnly) console.log(`  ${r.key.padEnd(26)} 读取 ${String(r.read).padStart(2)} 次`);
