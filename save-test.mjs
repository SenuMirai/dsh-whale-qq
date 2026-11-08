import { createServer } from 'node:http';
import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { once } from 'node:events';
import { createStickerHub, listStickerInfo } from './src/qq/stickers.ts';

const root = join(process.env.TEMP ?? '.', 'qq-save-' + Date.now());
mkdirSync(root, { recursive: true });
const image = readFileSync('C:/DSHwork/plugins-src/dsh-qq-group/README.md');
const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'image/jpeg' });
  res.end(image);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const port = server.address().port;
const hub = createStickerHub(root, {
  saveEnabled: () => true,
  filter: () => 'all',
  saveRepo: () => 'inbox',
  analyzeOnSave: () => false,
  maxItems: () => 300,
  maxMB: () => 200,
  analyze: async () => undefined,
  log: (m) => console.log('log', m),
});
await hub.save({ type: 'image', data: { url: 'http://127.0.0.1:' + port + '/a.jpg' } }, { groupId: 'g', sender: 'u', recent: [] });
await hub.save({ type: 'image', data: { url: 'http://127.0.0.1:' + port + '/a.jpg' } }, { groupId: 'g', sender: 'u', recent: [] });
console.log(listStickerInfo(root).map((i) => [i.file, i.repoId, i.status]));
server.close();
rmSync(root, { recursive: true, force: true });
