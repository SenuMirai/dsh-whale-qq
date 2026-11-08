import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/DSHwork/plugins-src/dsh-qq-group/src/qq/world.ts';
let s = readFileSync(p, 'utf8');

if (!s.includes('lastDelivery')) {
  const anchor = '  private settleTimer: ReturnType<typeof setTimeout> | null = null;';
  s = s.replace(
    anchor,
    `${anchor}\n  /** 最近一次投递的摘要：给「她到底收到了什么」留证据。 */\n  readonly lastDelivery: { at: number; chars: number; images: number; voice: boolean; sticker: boolean; preview: string } | null = null;`,
  );
  writeFileSync(p, s);
  console.log('placeholder added');
} else {
  console.log('exists');
}
