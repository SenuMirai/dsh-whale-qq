import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/DSHwork/plugins-src/dsh-qq-group/src/qq/bridge.ts';
let s = readFileSync(p, 'utf8');

const startMarker = '/** 一条气泡里只留纯文字：去标签、去空行，避免 QQ 渲染出大空隙。 */';
const start = s.indexOf(startMarker);
if (start < 0) {
  console.log('tidy 定义没找到');
  process.exit(1);
}
const endMarker = '.slice(0, 2000);\n}\n';
const end = s.indexOf(endMarker, start);
if (end < 0) {
  console.log('tidy 结束没找到');
  process.exit(1);
}
const block = s.slice(start, end + endMarker.length);
s = s.slice(0, start) + s.slice(end + endMarker.length);

// 找 class 定义，插到它前面
const classAt = s.indexOf('export class QqBridge');
if (classAt < 0) {
  console.log('class 没找到');
  process.exit(1);
}
s = s.slice(0, classAt) + block + '\n' + s.slice(classAt);
writeFileSync(p, s);
console.log('tidy 已移到类外');
