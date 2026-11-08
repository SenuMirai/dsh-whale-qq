import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadStickerState,
  listStickerInfo,
  listStickerRepos,
  imageInfo,
  updateStickerRepos,
  moveStickers,
  createStickerHub,
} from './src/qq/stickers.ts';

const root = join(process.env.TEMP ?? '.', 'qq-sticker-test-' + Date.now());
mkdirSync(join(root, 'stickers'), { recursive: true });
const src = 'C:/DSHwork/plugins-src/dsh-qq-group/README.md';
const bytes = readFileSync(src);
writeFileSync(join(root, 'stickers', 'old.png'), bytes);
writeFileSync(join(root, 'stickers.json'), JSON.stringify({ version: 1, items: { 'old.png': { file: 'old.png', addedAt: 1, tags: ['测试'], description: '旧图', used: 0 } } }));
const state = loadStickerState(root);
console.log('repos', state.repos.map((r) => [r.id, r.weight, r.saveTarget]));
console.log('migrated', existsSync(join(root, 'stickers', 'repos', 'common', 'old.png')), Object.keys(state.items));
console.log('info', JSON.stringify(imageInfo(bytes)));
console.log('items', listStickerInfo(root).map((i) => [i.file, i.repoId, i.repoWeight, i.status]));
const repos = updateStickerRepos(root, [
  { id: 'inbox', name: '新图暂存', weight: 0, saveTarget: true, enabled: true },
  { id: 'common', name: '常用', weight: 100, saveTarget: false, enabled: true },
  { id: 'rare', name: '少用', weight: 20, saveTarget: false, enabled: true },
]);
console.log('repos2', repos.map((r) => r.id));
const moved = moveStickers(root, ['old.png'], 'inbox');
console.log('moved', moved, listStickerInfo(root).map((i) => [i.file, i.repoId]));
const hub = createStickerHub(root, {
  saveEnabled: () => false,
  filter: () => 'smart',
  saveRepo: () => 'inbox',
  analyzeOnSave: () => false,
  maxItems: () => 300,
  maxMB: () => 200,
  analyze: async () => undefined,
  log: () => undefined,
});
console.log('select inbox-only', hub.select?.('old.png'));
rmSync(root, { recursive: true, force: true });
