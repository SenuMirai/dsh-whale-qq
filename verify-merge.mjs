function build(body, maxChunks = 5) {
  const normalized = body.replace(/<\/?br\s*\/?>/giu, '\n');
  const paragraphs = normalized
    .split(/\n\s*\n/u)
    .map((p) => p.trim())
    .filter((p) => p !== '');
  let chunks = paragraphs.length > 0 ? paragraphs : [body];
  if (chunks.length > 1) {
    const merged = [];
    for (const chunk of chunks) {
      const prev = merged[merged.length - 1];
      if (
        prev !== undefined &&
        chunk.length <= 14 &&
        prev.length <= 14 &&
        prev.length + chunk.length <= 26
      ) {
        merged[merged.length - 1] = `${prev}，${chunk}`;
      } else {
        merged.push(chunk);
      }
    }
    chunks = merged;
  }
  return chunks.slice(0, maxChunks);
}

const cases = [
  '没事\n\n<br>\n\n就是刚被你叫醒\n\n<br>\n\n天都黑了',
  '行吧\n\n那你先去忙',
  '我跟你说个事\n\n今天那个插件终于跑通了，中间踩了好几个坑\n\n不过最后都解决了',
  '嗯\n\n在',
  '好饿',
];

for (const c of cases) {
  const out = build(c);
  console.log(`out: ${out.length} 条 -> ${JSON.stringify(out)}`);
}
