import { defaultGroupPolicy } from './src/qq/config.ts';
import { decideSpeak, DEFAULT_SCORE_WEIGHTS } from './src/qq/triggers.ts';
import { asksToSeeImage } from './src/qq/policy.ts';

const policy = defaultGroupPolicy();
policy.scoreThreshold = 45;
const state = { groupId: 'g', ignoredProactive: 0, replyTimes: [], proactiveDay: { day: '', count: 0 }, pendingCount: 1 };
const baseRules = { owner: false, whitelist: false, blacklist: false, whitelistFloor: 95, blacklistCeil: 5, night: false, nightPenalty: 20 };
for (const text of ['你好', '今天天气不错，我出去走走']) {
  const d = decideSpeak({ state, policy, texts: [text], now: Date.now(), rules: { ...baseRules, weights: DEFAULT_SCORE_WEIGHTS } });
  console.log(text, d.score, d.reasons.join('；'));
}
console.log('custom base', decideSpeak({ state, policy, texts: ['今天天气不错，我出去走走'], now: Date.now(), rules: { ...baseRules, weights: { ...DEFAULT_SCORE_WEIGHTS, base: 40 } } }).score);
console.log('image', asksToSeeImage('看看这个图片'), asksToSeeImage('这猫可爱嘛'), asksToSeeImage('今天吃什么'));
