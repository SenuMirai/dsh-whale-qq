import { readFileSync } from 'node:fs';

// 从编译产物里抓出 tidy 的真实实现来验证
const src = readFileSync('C:/DSHwork/plugins-src/dsh-qq-group/lib/index.js', 'utf8');
const start = src.indexOf('function tidy(');
const end = src.indexOf('\n}', start);
const code = src.slice(start, end + 2);
console.log(code);
console.log('---- 用她的真实原文验证 ----');

const tidy = new Function(`${code}; return tidy;`)();
const cases = [
  '哼\n\n<br>\n\n别老这么说\n\n<br>\n\n说得我都不好意思了',
  '又来了\n\n这张你发过了\n\n<br>\n\n……\n\n不过我再看一遍也不烦',
  '才不是\n\n<br>\n\n我怕你不够吃\n\n<br>\n\n你要是够，那我分一半也行',
];
for (const c of cases) {
  const out = tidy(c);
  console.log(JSON.stringify(out));
  console.log('含空行:', /\n\s*\n/.test(out), '含标签:', /<br/i.test(out));
  console.log('---');
}
