import { defaultGroupPolicy } from './src/qq/config.ts';
import { decideSpeak } from './src/qq/triggers.ts';

const base = defaultGroupPolicy();
const policy = { ...base, replyChance: 0.08, keywordChances: {}, memberChances: {}, engagedChance: 0.8, engageMinutes: 10 };
const state = {
  groupId: '1',
  ignoredProactive: 0,
  replyTimes: [],
  proactiveDay: { day: '2026-10-21', count: 0 },
  pendingCount: 1,
  lastDirectAt: Date.now() - 5000,
  lastDirectUser: 'owner',
};

const a = decideSpeak({ state, policy, texts: ['没人嫌弃你，我可不敢'], userId: 'owner', now: Date.now() });
console.log('owner continuation:', JSON.stringify(a));
const b = decideSpeak({ state, policy, texts: ['今天天气不错'], userId: 'other', now: Date.now() });
console.log('other ambient:', JSON.stringify(b));
const c = decideSpeak({ state: { ...state, lastDirectAt: undefined }, policy, texts: ['没人嫌弃你，我可不敢'], userId: 'owner', now: Date.now() });
console.log('no engage:', JSON.stringify(c));
