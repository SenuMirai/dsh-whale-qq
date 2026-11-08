import { defaultGroupPolicy } from './src/qq/config.ts';
import { classifyTrigger, createGroupState, noteSelfSpoke, rateVerdict } from './src/qq/policy.ts';

const policy = defaultGroupPolicy();
policy.enabled = true;
policy.activeChat = true;
policy.cooldownMs = 45_000;
policy.maxRepliesPer10Min = 6;
policy.maxDirectRepliesPer10Min = 20;
const base = {
  groupId: 'g',
  userId: 'u',
  name: 'n',
  role: 'member',
  text: '[图片]',
  atSelf: false,
  callSelf: false,
  atAll: false,
  at: 0,
  messageId: '1',
  hasImage: true,
  images: [],
  hasVoice: false,
};
console.log('image-only', classifyTrigger({ ...base }, policy, '助手'));
console.log('image-with-text', classifyTrigger({ ...base, text: '[图片] 这猫可爱嘛' }, policy, '助手'));
console.log('at-image', classifyTrigger({ ...base, atSelf: true }, policy, '助手'));

const state = createGroupState('g');
const now = Date.now();
for (let i = 0; i < 7; i += 1) noteSelfSpoke(state, policy, now - i * 1000, 'reply', { direct: true });
console.log('direct after 7', JSON.stringify(rateVerdict(state, policy, now, { direct: true, ignoreCooldown: true })));
console.log('normal after 7', JSON.stringify(rateVerdict(state, policy, now, { ignoreCooldown: true })));
