import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createStickerHub } from './src/qq/stickers.ts';

const root = join(process.env.TEMP ?? '.', 'qq-select-' + Date.now());
for (const id of ['inbox', 'common']) mkdirSync(join(root, 'stickers', 'repos', id), { recursive: true });
writeFileSync(join(root, 'stickers', 'repos', 'inbox', 'a.png'), 'a');
writeFileSync(join(root, 'stickers', 'repos', 'common', 'b.png'), 'b');
const state = {
  version: 2,
  repos: [
    { id: 'inbox', name: 'inbox', weight: 0, saveTarget: true, enabled: true, maxItems: 500, maxMB: 100, autoAnalyze: false },
    { id: 'common', name: 'common', weight: 100, saveTarget: false, enabled: true, maxItems: 500, maxMB: 100, autoAnalyze: false },
  ],
  items: {
    'a.png': { file: 'a.png', repoId: 'inbox', addedAt: 1, tags: ['x'], description: 'A', used: 0, status: 'approved' },
    'b.png': { file: 'b.png', repoId: 'common', addedAt: 2, tags: ['y'], description: 'B', used: 0, status: 'approved' },
  },
};
writeFileSync(join(root, 'stickers.json'), JSON.stringify(state));
const hub = createStickerHub(root, { saveEnabled: () => false, filter: () => 'smart', saveRepo: () => 'inbox', analyzeOnSave: () => false, maxItems: () => 300, maxMB: () => 200, analyze: async () => undefined, log: () => undefined });
for (let i = 0; i < 5; i++) console.log('select', hub.select?.('a.png'));
console.log('resolve a', hub.resolve('a.png'));
rmSync(root, { recursive: true, force: true });
