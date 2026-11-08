import { defaultGroupPolicy } from './src/qq/config.ts';
import { decideSpeak } from './src/qq/triggers.ts';

const base = defaultGroupPolicy();
const policy = { ...base, keywordChances: {}, memberChances: {}, scoreThreshold: 50, engageMinutes: 10 };
const state = {
  groupId: '1',
  ignoredProactive: 0,
  replyTimes: [],
  proactiveDay: { day: '2026-10-21', count: 0 },
  pendingCount: 1,
  lastDirectAt: Date.now() - 5000,
  lastDirectUser: 'owner',
};
const profile = { familiarity: 50, affinity: 20 };
const now = Date.now();

for (let i = 0; i < 3; i += 1) {
  console.log('same speaker:', JSON.stringify(decideSpeak({ state, policy, texts: ['没人嫌弃你，我可不敢'], userId: 'owner', profile, now })));
}
console.log('whitelist:', JSON.stringify(decideSpeak({ state, policy, texts: ['今天天气不错'], userId: 'owner', profile, rules: { whitelist: true, blacklist: false, whitelistFloor: 95, blacklistCeil: 5, night: false }, now })));
console.log('blacklist:', JSON.stringify(decideSpeak({ state, policy, texts: ['没人嫌弃你，我可不敢'], userId: 'owner', profile, rules: { whitelist: false, blacklist: true, whitelistFloor: 95, blacklistCeil: 5, night: false }, now })));
console.log('night:', JSON.stringify(decideSpeak({ state, policy, texts: ['没人嫌弃你，我可不敢'], userId: 'owner', profile, rules: { whitelist: false, blacklist: false, whitelistFloor: 95, blacklistCeil: 5, night: true }, now })));
