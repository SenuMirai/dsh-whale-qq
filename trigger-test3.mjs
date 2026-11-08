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

console.log('same speaker:', JSON.stringify(decideSpeak({ state, policy, texts: ['没人嫌弃你，我可不敢'], userId: 'owner', now: Date.now() })));
console.log('same speaker @other:', JSON.stringify(decideSpeak({ state, policy, texts: ['@张三 你看这个'], userId: 'owner', atOther: true, now: Date.now() })));
console.log('other ambient:', JSON.stringify(decideSpeak({ state, policy, texts: ['今天天气不错'], userId: 'other', now: Date.now() })));
