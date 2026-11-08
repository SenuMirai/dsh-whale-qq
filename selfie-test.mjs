import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { asksForSelfie, asksToSeeImage } from './src/qq/policy.ts';
import { saveSelfie, listSelfies, createSelfieHub } from './src/qq/selfies.ts';

for (const t of ['看看尾巴', '看看你', '爆个照', '看看这张图', '这猫可爱吗']) {
  console.log(t, 'selfie=', asksForSelfie(t), 'view=', asksToSeeImage(t));
}
const root = mkdtempSync(join(tmpdir(), 'selfie-test-'));
writeFileSync(join(root, 'seed.png'), '');
const tiny = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const a = saveSelfie(root, 'tail-01.png', tiny);
const b = saveSelfie(root, 'selfie-01.png', tiny);
console.log('saved', a?.file, b?.file, 'count', listSelfies(root).length);
const hub = createSelfieHub(root);
console.log('pick tail', hub.pick('看看尾巴')?.file);
rmSync(root, { recursive: true, force: true });
