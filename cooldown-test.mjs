import { defaultGroupPolicy } from './src/qq/config.ts';
import { createGroupState, noteSelfSpoke, rateVerdict } from './src/qq/policy.ts';

const now = Date.now();
const policy = defaultGroupPolicy();
policy.cooldownMs = 45_000;
policy.maxRepliesPer10Min = 6;
const state = createGroupState('g');
noteSelfSpoke(state, policy, now - 5_000, 'reply');
console.log('normal', JSON.stringify(rateVerdict(state, policy, now)));
console.log('direct', JSON.stringify(rateVerdict(state, policy, now, { ignoreCooldown: true })));
