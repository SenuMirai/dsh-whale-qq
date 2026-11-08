/**
 * 设置项审计（只读）。
 *
 * 目的：找出「界面上有控件、但保存处理器不收 / 后端不读」的死设置。
 * 这一类是多次更新累积下来的主要脏东西 —— 用户改了没反应，也没人知道为什么。
 *
 * 用法：node scripts/audit-settings-deep.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const CLIENT = path.join(ROOT, 'lib', 'client.js');

const backendFiles = [
  'index.ts',
  'qq/config.ts', 'qq/policy.ts', 'qq/bridge.ts', 'qq/prompt.ts',
  'qq/world.ts', 'qq/memory-center.ts', 'qq/stickers.ts', 'qq/usage.ts',
  'qq/memory-traces.ts', 'qq/qzone.ts', 'qq/triggers.ts', 'qq/voice.ts',
];
const backend = backendFiles
  .map((f) => {
    try { return fs.readFileSync(path.join(SRC, f), 'utf8'); } catch { return ''; }
  })
  .join('\n');
const client = fs.readFileSync(CLIENT, 'utf8');

// ── 1. 保存处理器接受哪些「点路径」 ──────────────────────────────────
const saveStart = backend.indexOf('patch.settings !== undefined');
const saveBlock = saveStart >= 0 ? backend.slice(saveStart, saveStart + 60000) : '';

// 顶层键（next.xxx = ...）
const topKeys = new Set(
  [...saveBlock.matchAll(/^ {12}([a-zA-Z][a-zA-Z0-9]*):/gm)].map((m) => m[1]),
);

// ── 2. 前端设置页写入的路径 ────────────────────────────────────────
// 形如: save({ mapKey: { ...settings.mapKey, [key]: value } })
// 或   : save({ topKey: value })
const clientPuts = new Set();
for (const m of client.matchAll(/settings\.([a-zA-Z][a-zA-Z0-9]*)/g)) {
  clientPuts.add(m[1]);
}

// ── 3. 前端设置页调用的 save 里带的顶层键 ──────────────────────────
const saveCalls = [...client.matchAll(/save\(\{([^}]{0,400})/g)].map((m) => m[1]);
const savedTop = new Set();
for (const body of saveCalls) {
  for (const m of body.matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*:/g)) savedTop.add(m[1]);
}

// ── 报告 ──────────────────────────────────────────────────────────
console.log('保存处理器接受的顶层键:', topKeys.size);
console.log('前端出现的 settings.* 字段:', clientPuts.size);
console.log();

const uiButNotSaved = [...clientPuts].filter((k) => !topKeys.has(k));
console.log('=== 界面在用、保存处理器可能不接收（改了不生效）===');
if (uiButNotSaved.length === 0) console.log('（没有）');
for (const k of uiButNotSaved) {
  const n = (client.match(new RegExp(`settings\\.${k}\\b`, 'g')) || []).length;
  console.log(`  ${k}  (前端 ${n} 处)`);
}

const savedButNoUi = [...topKeys].filter((k) => !clientPuts.has(k));
console.log();
console.log('=== 保存处理器接受、界面上没有 ===');
for (const k of savedButNoUi) console.log('  ' + k);
