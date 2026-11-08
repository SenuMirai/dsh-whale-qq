import { defaultGroupPolicy } from './src/qq/config.ts';
import { createGroupState, observeHuman, chatWindowElapsed, proactiveVerdict, noteSelfSpoke } from './src/qq/policy.ts';

const policy = defaultGroupPolicy();
policy.cooldownMs = 45_000;
policy.proactive.minIdleMs = 5 * 60_000;
policy.proactive.firstDelayMs = 10 * 60_000;
policy.proactive.enabled = true;
policy.enabled = true;

const t0 = 1_000_000;
const state = createGroupState('g');
observeHuman(state, policy, t0);
observeHuman(state, policy, t0 + 3_000);
console.log('window at +7s', chatWindowElapsed(state, t0 + 7_000));
console.log('window at +9s', chatWindowElapsed(state, t0 + 9_000));

const s2 = createGroupState('g2');
observeHuman(s2, policy, t0);
observeHuman(s2, policy, t0 + 5 * 60_000);
console.log('proactive at +10min', JSON.stringify(proactiveVerdict(s2, policy, t0 + 10 * 60_000)));
console.log('proactive at +15min', JSON.stringify(proactiveVerdict(s2, policy, t0 + 15 * 60_000)));

const s3 = createGroupState('g3');
observeHuman(s3, policy, t0);
s3.lastProactiveAt = t0 + 15 * 60_000;
observeHuman(s3, policy, t0 + 20 * 60_000);
console.log('after proactive + human, at +25min', JSON.stringify(proactiveVerdict(s3, policy, t0 + 25 * 60_000)));
console.log('after proactive + human, at +30min', JSON.stringify(proactiveVerdict(s3, policy, t0 + 30 * 60_000)));
