// 用她真实的两条回复验证：单换行不再被拆成多条气泡
function chunksOf(body) {
  const normalized = body.replace(/<\/?br\s*\/?>/giu, '\n');
  const paragraphs = normalized
    .split(/\n\s*\n/u)
    .map((part) => part.trim())
    .filter((part) => part !== '');
  return paragraphs.length > 0 ? paragraphs : [body];
}

const cases = [
  '嗯\n在',
  '没事\n\n就是刚被你叫醒\n\n天都黑了',
  '嗯\n\n在',
  '今天好累\n不想动',
  '查清楚了，不是被记忆覆盖。',
];

for (const c of cases) {
  const out = chunksOf(c);
  console.log(`in : ${JSON.stringify(c)}`);
  console.log(`out: ${out.length} 条 -> ${JSON.stringify(out)}`);
  console.log('---');
}
