import { readFileSync } from 'node:fs';

const src = readFileSync('C:/DSHwork/plugins-src/dsh-qq-group/lib/index.js', 'utf8');

// 抓 tidy
const t0 = src.indexOf('function tidy(');
const t1 = src.indexOf('\n}', t0);
const tidy = new Function(`${src.slice(t0, t1 + 2)}; return tidy;`)();

const SEPARATOR = /^[ \t]*[-—–]{3,}[ \t]*$/mu;
const cap = 5;

function chunksOf(body) {
  const rawParts = body.split(SEPARATOR);
  let chunks = rawParts.map((p) => tidy(p)).filter((p) => p !== '');
  if (chunks.length === 0) chunks = [tidy(body)];
  if (chunks.length > cap) {
    const kept = chunks.slice(0, cap - 1);
    const rest = chunks.slice(cap - 1).join('\n');
    chunks = [...kept, rest];
  }
  return chunks;
}

const cases = [
  ['点点点两行', '……\n……'],
  ['普通长句', '吃面吧，汤面，热的，比干饭舒服'],
  ['带空行+br（旧习惯）', '哼\n\n<br>\n\n别老这么说\n\n<br>\n\n说得我都不好意思了'],
  ['用契约分条', '行吧\n\n---\n\n那你先去忙'],
  ['三段契约', '第一件事\n\n---\n\n第二件事\n\n---\n\n第三件事'],
  ['没有契约的长回复', '今天修了一天插件，先是分段不对，后来发现是单条分支用错了变量，现在改成契约式了。'],
];

for (const [name, body] of cases) {
  const out = chunksOf(body);
  console.log(`${name}: ${out.length} 条 -> ${JSON.stringify(out)}`);
}
