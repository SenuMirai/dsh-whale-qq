import { defaultGroupPolicy } from './src/qq/config.ts';
import { decideSpeak } from './src/qq/triggers.ts';

const base = defaultGroupPolicy();
const policy = { ...base, keywordChances: {}, memberChances: {}, scoreThreshold: 50, engageMinutes: 10 };
const now = Date.now();
const state = {
  groupId: '1',
  ignoredProactive: 0,
  replyTimes: [],
  proactiveDay: { day: '2026-10-21', count: 0 },
  pendingCount: 1,
  lastDirectAt: now - 80_000,
  lastDirectUser: '100000001',
  lastSelfAt: now - 80_000,
};
const profile = { familiarity: 5, affinity: 1 };
for (let i = 0; i < 3; i += 1) {
  console.log(JSON.stringify(decideSpeak({
    state,
    policy,
    texts: ['我这边比较靠北吧，今天 6 度，冷死了'],
    userId: '100000001',
    profile,
    now,
  })));
}
