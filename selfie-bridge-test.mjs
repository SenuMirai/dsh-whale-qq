import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { QqBridge } from './src/qq/bridge.ts';
import { defaultConfig, defaultGroupPolicy } from './src/qq/config.ts';

const root = mkdtempSync(join(tmpdir(), 'qq-selfie-bridge-'));
const image = join(root, 'test.png');
writeFileSync(image, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'));
const config = defaultConfig();
config.groups = { g: { ...defaultGroupPolicy(), enabled: true, selfieEnabled: true, selfieChance: 1 } };
const calls = [];
const bridge = new QqBridge({
  config,
  userRoot: root,
  persona: () => '',
  log: () => {},
  selfies: {
    list: () => [{ file: 'test.png', tags: ['自拍'], description: '', addedAt: 1 }],
    resolve: () => image,
    pick: () => ({ file: 'test.png', tags: ['自拍'], description: '', addedAt: 1 }),
    markUsed: () => {},
  },
});
bridge.sendSegments = async (_groupId, segments) => { calls.push(segments); return { ok: true }; };
await bridge.deliver('g', config.groups.g, { messages: ['来啦'], action: 'text' }, Date.now(), 'at', false, true, { file: 'test.png', tags: [], description: '', addedAt: 1 });
console.log(JSON.stringify(calls.map((segments) => segments.map((s) => s.type))));
await bridge.stop?.();
rmSync(root, { recursive: true, force: true });
