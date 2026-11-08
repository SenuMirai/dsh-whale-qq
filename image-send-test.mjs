import { asksToSendImage } from './src/qq/policy.ts';
for (const t of ['发个表情包', '来张图', '给我发个表情', '斗图', '看看这张图', '这张图可爱吗', '今天吃什么']) {
  console.log(t, asksToSendImage(t));
}
