// 验证 sendPlainPrivate 的分段/清洗逻辑是否会漏出 <br>
const body = '「蓝色鲸鱼」\n\n<br>\n\n四个字，蓝底白字\n\n<br>\n\n你发这个给我做啥';

const normalized = body.replace(/<\/?br\s*\/?>/giu, '\n');
const paragraphs = normalized.split(/\n\s*\n/).map((x) => x.trim()).filter((x) => x !== '');
const lines = normalized.split(/\n/).map((x) => x.trim()).filter((x) => x !== '');
const maxChunks = 3;
const useLines = paragraphs.length <= 1 && lines.length > 1 && lines.length <= maxChunks && lines.every((l) => l.length <= 120);
let chunks = paragraphs.length > 1 ? paragraphs : useLines ? lines : [body];

if (chunks.length === 1 && maxChunks > 1 && body.length > 18) {
  const sentences = body.split(/(?<=[。！？!?~～…])/u).map((x) => x.trim()).filter((x) => x !== '');
  const pieces = [];
  for (const sentence of sentences) {
    if (sentence.length <= 40) { pieces.push(sentence); continue; }
  }
  if (pieces.length > 1) chunks = pieces;
}

const sent = chunks.map((p) => p.replace(/<\/?br\s*\/?>/giu, ' '));
console.log('chunks:', JSON.stringify(chunks));
console.log('sent  :', JSON.stringify(sent));
console.log('leak  :', sent.some((s) => /<br/i.test(s)));
