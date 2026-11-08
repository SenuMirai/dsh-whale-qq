import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/DSHwork/plugins-src/dsh-qq-group/src/qq/world.ts';
let s = readFileSync(p, 'utf8');

// Only the reply path should be recorded as "what she said"; the inbound path is already the user's words.
if (s.includes("kind: 'reply'")) {
  console.log('already tagged');
  process.exit(0);
}

const before = s;
s = s.replace(
  `        if (reply !== null) {
          await this.options.deliver(reply.text, 'reply', {
            voice: item.voice,
            sticker: item.sticker,
            images: reply.images,
          });
        } else {`,
  `        if (reply !== null) {
          this.options.record?.({
            at: Date.now(),
            chars: reply.text.length,
            images: reply.images.length,
            voice: item.voice,
            sticker: item.sticker,
            preview: reply.text.replace(/\\s+/gu, ' ').slice(0, 160),
            kind: 'reply',
          });
          await this.options.deliver(reply.text, 'reply', {
            voice: item.voice,
            sticker: item.sticker,
            images: reply.images,
          });
        } else {`,
);
if (s === before) {
  console.log('reply block not matched');
  process.exit(1);
}
writeFileSync(p, s);
console.log('tagged reply');
