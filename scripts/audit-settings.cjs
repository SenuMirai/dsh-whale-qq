const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(import.meta.dirname ?? __dirname, '..');
const SRC = path.join(ROOT, 'src');
const CLIENT = path.join(ROOT, 'lib', 'client.js');

const files = [
  'index.ts',
  'qq/config.ts', 'qq/policy.ts', 'qq/bridge.ts', 'qq/prompt.ts',
  'qq/world.ts', 'qq/memory-center.ts', 'qq/stickers.ts', 'qq/usage.ts',
  'qq/memory-traces.ts', 'qq/memory.ts', 'qq/memory-v3.ts', 'qq/qzone.ts',
];
const backend = files
  .map((f) => {
    try { return fs.readFileSync(path.join(SRC, f), 'utf8'); } catch { return ''; }
  })
  .join('\n');
const client = fs.readFileSync(CLIENT, 'utf8');

// Settings 类型里的字段
const typeStart = backend.indexOf('type Settings = {');
const typeBlock = typeStart >= 0 ? backend.slice(typeStart, typeStart + 9000) : '';
const fields = [...typeBlock.matchAll(/^ {2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]);

const uniq = [...new Set(fields)];
console.log('Settings 字段数:', uniq.length);

const countRe = (text, re) => (text.match(re) || []).length;

const rows = [];
for (const f of uniq) {
  // 后端：settings.x 或 current.x（saveSettings 归一化里用 current.）
  const readBackend =
    countRe(backend, new RegExp(`\\bsettings\\.${f}\\b`, 'g')) +
    countRe(backend, new RegExp(`\\bcurrent\\.${f}\\b`, 'g'));
  // 前端：设置页里出现的次数
  const usedClient = countRe(client, new RegExp(`\\bsettings\\.${f}\\b`, 'g'));
  rows.push({ field: f, backend: readBackend, client: usedClient });
}

console.log('\n=== 后端没读（可能是死设置）===');
const dead = rows.filter((r) => r.backend === 0);
if (dead.length === 0) console.log('（没有）');
for (const r of dead) console.log(' ', r.field, '| 前端出现', r.client, '次');

console.log('\n=== 前端没展示（后端在用，界面上调不到）===');
const hidden = rows.filter((r) => r.backend > 0 && r.client === 0);
if (hidden.length === 0) console.log('（没有）');
for (const r of hidden) console.log(' ', r.field, '| 后端读', r.backend, '次');

console.log('\n=== 两边都在用 ===');
console.log(' ', rows.filter((r) => r.backend > 0 && r.client > 0).length, '项');
