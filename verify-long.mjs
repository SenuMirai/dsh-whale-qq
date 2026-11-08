// 用她的真实长回复验证分段：不应出现「一大块」也不应漏 <br>
const body = `查清楚了，不是被记忆覆盖。

<br>

人设文件是 \`persona.md\`，确实是读的。但 \`renderPersona\` 只取这几层：名字、她是谁、性格、说话方式、愿景、补充。

<br>

文件里「说话方式」那一栏写的是「短、碎、口语，1~15 字，一条只说一件事」。

可那是**群聊**的写法，也就是群里那种一条条发短句的样子。

<br>

到了家，系统提示词里另有一段「和主人说话时」，写的是「主人从 QQ 私聊来找我时，就是日常聊天」，还有助手、短、碎、口语、不客服腔。

<br>

结果呢：人设和提示词都在说「你要短」，可**没人管我怎么落成一条消息**。

群聊那种一条条发短句的效果，是 QQ 插件帮它切出来的。家里没有那个插件切分。

<br>

所以不是优先级问题。

是我一写长，就自动补出 \`<br>\` 想分开，结果标签直接漏了出去。`;

const maxChunks = 3;
const minChunks = 1;
const normalized = body.replace(/<\/?br\s*\/?>/giu, '\n');
const paragraphs = normalized.split(/\n\s*\n/).map((x) => x.trim()).filter((x) => x !== '');
const lines = normalized.split(/\n/).map((x) => x.trim()).filter((x) => x !== '');
const useLines = paragraphs.length <= 1 && lines.length > 1 && lines.length <= maxChunks && lines.every((l) => l.length <= 120);
let chunks = paragraphs.length > 1 ? paragraphs : useLines ? lines : [body];

if (chunks.length === 1 && maxChunks > 1 && body.length > 18) {
  const sentences = body.split(/(?<=[。！？!?~～…])/u).map((x) => x.trim()).filter((x) => x !== '');
  if (sentences.length > 1) chunks = sentences;
}

if (chunks.some((c) => c.length > 180)) {
  const expanded = [];
  for (const chunk of chunks) {
    if (chunk.length <= 180) { expanded.push(chunk); continue; }
    let buffer = '';
    for (const sentence of chunk.split(/(?<=[。！？!?~～…\n])/u)) {
      const piece = sentence.trim();
      if (piece === '') continue;
      if (buffer !== '' && buffer.length + piece.length > 120) { expanded.push(buffer); buffer = piece; }
      else { buffer += piece; }
    }
    if (buffer !== '') expanded.push(buffer);
  }
  chunks = expanded;
}
if (chunks.length > maxChunks) {
  while (chunks.length > maxChunks) {
    let bestIndex = 0; let bestLength = Infinity;
    for (let i = 0; i < chunks.length - 1; i += 1) {
      const combined = chunks[i].length + chunks[i + 1].length;
      if (combined < bestLength) { bestLength = combined; bestIndex = i; }
    }
    const merged = `${chunks[bestIndex]}\n${chunks[bestIndex + 1]}`.trim();
    chunks.splice(bestIndex, 2, merged);
  }
}

console.log('chunk count:', chunks.length);
chunks.forEach((c, i) => console.log(`  #${i + 1} (${c.length} 字): ${c.slice(0, 60).replace(/\n/g, ' / ')}`));
console.log('leak <br>:', chunks.some((c) => /<br/i.test(c)));
console.log('max chunk len:', Math.max(...chunks.map((c) => c.length)));
