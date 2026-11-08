import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/DSHwork/plugins-src/dsh-qq-group/src/qq/bridge.ts';
let s = readFileSync(p, 'utf8');

const BR = String.raw`/<\/?br\s*\/?>/giu`;
const NL = String.raw`/\n{2,}/gu`;

// 每条气泡里不允许出现空行：QQ 会把 \n\n 渲染成气泡内的巨大空隙。
const oldPart = `part.replace(${BR}, ' ')`;
const newPart = `part.replace(${BR}, ' ').replace(${NL}, '\\n')`;
const oldBody = `body.replace(${BR}, ' ')`;
const newBody = `body.replace(${BR}, ' ').replace(${NL}, '\\n')`;

let changed = 0;
if (s.includes(oldPart)) {
  s = s.split(oldPart).join(newPart);
  changed += 1;
}
if (s.includes(oldBody)) {
  s = s.split(oldBody).join(newBody);
  changed += 1;
}
writeFileSync(p, s);
console.log('替换组数', changed);
