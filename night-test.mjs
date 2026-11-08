import { defaultGroupPolicy } from './src/qq/config.ts';
import { decideSpeak } from './src/qq/triggers.ts';

const policy = { ...defaultGroupPolicy(), keywordChances: {}, memberChances: {}, scoreThreshold: 50 };
const state = {
  groupId: 'g',
  ignoredProactive: 0,
  replyTimes: [],
  proactiveDay: { day: '2026-10-21', count: 0 },
  pendingCount: 1,
};
const now = Date.now();
for (const penalty of [0, 5, 20, 40]) {
  const d = decideSpeak({
    state,
    policy,
    texts: ['今天天气不错'],
    now,
    rules: { owner: false, whitelist: false, blacklist: false, whitelistFloor: 95, blacklistCeil: 5, night: true, nightPenalty: penalty },
  });
  console.log(penalty, d.score, d.reasons.join('；'));
}
