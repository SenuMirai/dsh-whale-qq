import { parseMessage } from './src/qq/onebot.ts';
const r = parseMessage([
  { type: 'text', data: { text: '看看这个' } },
  { type: 'file', data: { name: 'a.pdf', url: 'https://x' } },
  { type: 'forward', data: { id: 'f1' } },
], '1');
console.log(r.text, r.files.length, r.forwards.length);
