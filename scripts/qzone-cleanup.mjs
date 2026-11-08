/**
 * 清理 QQ 空间多发的说说。
 *
 * 保留 keep 里的 tid，其余逐条删。每条之间隔 1500ms，
 * 避免短时间大量删除触发腾讯风控。
 *
 * 用法：node scripts/qzone-cleanup.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const HOST = 'http://127.0.0.1:61373';
const BACKUP = 'C:/DSHwork/backups/memory-merge-20261028';

const tids = JSON.parse(readFileSync(`${BACKUP}/qzone-drop-tids.json`, 'utf8'));
console.log(`待删 ${tids.length} 条`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ok = 0;
let failed = [];
let skipped = 0;

for (let i = 0; i < tids.length; i += 1) {
  const tid = tids[i];
  try {
    const res = await fetch(`${HOST}/dsh-qq-group/qzone`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'delete', tid }),
    });
    const data = await res.json();
    if (data.ok === true) {
      ok += 1;
      process.stdout.write('.');
    } else {
      const msg = String(data.message || '');
      // 已经不在的也算处理过
      if (msg.includes('不存在') || msg.includes('not exist')) {
        skipped += 1;
        process.stdout.write('s');
      } else {
        failed.push({ tid, message: msg });
        process.stdout.write('x');
      }
    }
  } catch (e) {
    failed.push({ tid, message: String(e?.message ?? e) });
    process.stdout.write('x');
  }
  if ((i + 1) % 20 === 0) process.stdout.write('\n');
  await sleep(1500);
}

console.log('');
console.log(`删除成功 ${ok} 条，跳过 ${skipped} 条，失败 ${failed.length} 条`);
if (failed.length > 0) {
  writeFileSync(`${BACKUP}/qzone-delete-failed.json`, JSON.stringify(failed, null, 2), 'utf8');
  console.log('失败详情已存 qzone-delete-failed.json');
  for (const f of failed.slice(0, 5)) console.log('  ', f.tid, f.message);
}
