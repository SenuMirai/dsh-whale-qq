import { defaultGroupPolicy } from './src/qq/config.ts';
import { decideSpeak, matchKeyword } from './src/qq/triggers.ts';

const base = defaultGroupPolicy();
const state = {
  groupId: '1',
  ignoredProactive: 0,
  replyTimes: [],
  proactiveDay: { day: '2026-10-21', count: 0 },
  pendingCount: 2,
};
const policy = (patch) => ({ ...base, ...patch });

const kw = policy({ keywordChances: { deepseek: 1 } });
console.log('keyword:', JSON.stringify(decideSpeak({ state, policy: kw, texts: ['deepseek 真好用'], now: 1000 })));

const amb0 = policy({ replyChance: 0, keywordChances: {}, memberChances: {}, engagedChance: 0 });
console.log('ambient off:', JSON.stringify(decideSpeak({ state: { ...state, lastDirectAt: 0 }, policy: amb0, texts: ['今天天气不错'], now: 1000 })));

const eng = policy({ replyChance: 0, keywordChances: {}, memberChances: {}, engagedChance: 1, engageMinutes: 10 });
console.log('engaged:', JSON.stringify(decideSpeak({ state: { ...state, lastDirectAt: 1 }, policy: eng, texts: ['今天天气不错'], now: 1000 })));

const mem = policy({ replyChance: 0, keywordChances: {}, memberChances: { '123': 1 } });
console.log('member:', JSON.stringify(decideSpeak({ state, policy: mem, texts: ['随便说说'], userId: '123', now: 1000 })));

console.log('match:', JSON.stringify(matchKeyword(['你好 deepseek'], kw)));
