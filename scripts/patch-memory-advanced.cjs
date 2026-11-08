/**
 * 把记忆页的调参项收进「高级」折叠区。按行操作，避免 CRLF 干扰。
 *
 * 常驻：群选择、记忆 v3 开关、v3 召回上限、刷新/压缩按钮
 * 高级：最近上下文条数、v3 提炼频率、原始记忆上限、摘要长度、压缩频率
 *
 * 用法：node scripts/patch-memory-advanced.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'lib', 'client.js');
let src = fs.readFileSync(file, 'utf8');

if (src.includes('memoryAdvancedOpen')) {
  console.log('已经改过了，跳过');
  process.exit(0);
}

// 1) 折叠状态
src = src.replace(
  "      const [safetyDetail, setSafetyDetail] = React.useState(false);",
  "      const [safetyDetail, setSafetyDetail] = React.useState(false);\n      /** 记忆页的调参项是否展开 */\n      const [memoryAdvancedOpen, setMemoryAdvancedOpen] = React.useState(false);",
  1,
);

const eol = src.includes('\r\n') ? '\r\n' : '\n';
const lines = src.split(/\r?\n/);

const findLine = (needle, from = 0) => {
  for (let i = from; i < lines.length; i += 1) if (lines[i].includes(needle)) return i;
  return -1;
};

const ctxIdx = findLine("h(Row, { label: '最近上下文条数' },");
const v3Idx = findLine("h(Row, { label: '记忆 v3' },", ctxIdx);
const freqIdx = findLine("h(Row, { label: 'v3 提炼频率' },", v3Idx);
const recallIdx = findLine("h(Row, { label: 'v3 召回上限' },", freqIdx);
const maxIdx = findLine("h(Row, { label: '原始记忆上限' },", recallIdx);

if ([ctxIdx, v3Idx, freqIdx, recallIdx, maxIdx].some((i) => i < 0)) {
  console.error('定位失败', { ctxIdx, v3Idx, freqIdx, recallIdx, maxIdx });
  process.exit(1);
}

// 结束位置：压缩那行的收尾 `),` 再下一个 `) : null,`
const compressIdx = findLine("children: '立即压缩'", maxIdx);
let endIdx = -1;
for (let i = compressIdx; i < lines.length; i += 1) {
  if (lines[i].trim() === ') : null,') { endIdx = i; break; }
}
if (compressIdx < 0 || endIdx < 0) {
  console.error('找不到结束位置', { compressIdx, endIdx });
  process.exit(1);
}

// 分块（按行号）
const contextBlock = lines.slice(ctxIdx, v3Idx);            // 最近上下文条数（2 行）
const v3Switch = lines.slice(v3Idx, freqIdx);               // 记忆 v3 开关
const freqBlock = lines.slice(freqIdx, recallIdx);          // v3 提炼频率
const recallBlock = lines.slice(recallIdx, maxIdx);         // v3 召回上限
const advBlock = lines.slice(maxIdx, endIdx);               // 原始记忆上限 / 摘要长度 / 压缩频率

const pad = (arr, n) => arr.map((l) => (l === '' ? l : ' '.repeat(n) + l));

const inserted = [
  ...v3Switch,
  ...recallBlock,
  `            h('div', { style: { marginTop: '6px' } },`,
  `              h('button', {`,
  `                style: { ...s.chip, ...(memoryAdvancedOpen ? s.chipOn : {}) },`,
  `                onClick: function () { setMemoryAdvancedOpen(!memoryAdvancedOpen); },`,
  `                children: memoryAdvancedOpen ? '收起高级设置' : '高级设置',`,
  `              }),`,
  `              h('span', { style: s.note, children: '平时不用动。调这些会改变她记得多少、多久压一次。' }),`,
  `            ),`,
  `            memoryAdvancedOpen ? h('div', { style: { marginTop: '4px' } },`,
  ...pad(contextBlock, 2),
  ...pad(freqBlock, 2),
  ...pad(advBlock, 2),
  `            ) : null,`,
];

const out = [...lines.slice(0, ctxIdx), ...inserted, ...lines.slice(endIdx)];
fs.writeFileSync(file, out.join(eol), 'utf8');
console.log('已把调参项收进「高级」');
