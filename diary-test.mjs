import { QqBridge } from './src/qq/bridge.ts';
import { defaultConfig, defaultGroupPolicy } from './src/qq/config.ts';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = mkdtempSync(join(tmpdir(), 'qq-diary-test-'));
const config = defaultConfig();
config.groups = { g: { ...defaultGroupPolicy(), enabled: true, proactive: { ...defaultGroupPolicy().proactive, enabled: false } } };
const entries = [];
const bridge = new QqBridge({
  config,
  userRoot: root,
  persona: () => '',
  log: () => {},
  llm: { chat: async () => ({ ok: true, text: '{"messages":["测试回复"]}' }) },
  timeContext: () => '',
  onError: () => {},
  onState: () => {},
  onDiary: (entry) => entries.push(entry),
});
await bridge.replyTo('g', config.groups.g, undefined, 'proactive', Date.now());
console.log(entries.map((e) => ({ reply: e.reply, thought: e.thought, confidence: e.familiarity === undefined })));
await bridge.stop?.();
rmSync(root, { recursive: true, force: true });
