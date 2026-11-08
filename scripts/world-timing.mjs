/**
 * 世界会话的耗时下钻（只读）。
 *
 * 输出每一轮的时间轴：
 *   触发 → 首条回复 → 后续每条的间隔 → 轮次总长
 * 用来分清「生成慢」还是「投递节奏慢」。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import zlib from 'node:zlib';

const SESS = join(homedir(), '.dsh', 'sessions');

function readSession(file) {
  const b = readFileSync(file);
  const offs = [];
  for (let i = 0; i < b.length - 3; i += 1) {
    if (b[i] === 0x28 && b[i + 1] === 0xb5 && b[i + 2] === 0x2f && b[i + 3] === 0xfd) offs.push(i);
  }
  offs.push(b.length);
  const lines = [];
  for (let k = 0; k < offs.length - 1; k += 1) {
    try {
      lines.push(...zlib.zstdDecompressSync(b.subarray(offs[k], offs[k + 1])).toString('utf8').split('\n').filter(Boolean));
    } catch {}
  }
  return lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

/** 找最近活跃的世界会话（cwd 在 worlds/<id>/room 下） */
function newestWorldSession() {
  let best = null;
  for (const dir of readdirSync(SESS)) {
    const d = join(SESS, dir);
    const f = join(d, 'session.v4.jsonl.zstd');
    if (!existsSync(f)) continue;
    const ev = readSession(f);
    const head = ev.find((e) => e.type === 'session');
    if (!head) continue;
    const cwd = String(head.cwd || '').replace(/\\/g, '/').toLowerCase();
    if (!cwd.includes('/.dsh/worlds/') || !cwd.endsWith('/room')) continue;
    const last = ev[ev.length - 1];
    if (!best || (last?.time ?? 0) > (best.last?.time ?? 0)) best = { file: f, ev, last };
  }
  return best;
}

const target = newestWorldSession();
if (!target) { console.log('没找到世界会话'); process.exit(0); }
const ev = target.ev;
console.log('会话文件:', target.file.split(/[\\/]/).slice(-2)[0]);
console.log('事件数:', ev.length);

// 按轮切开
const turns = [];
let cur = null;
for (const e of ev) {
  if (e.type === 'turn/start') { cur = { start: e.time, msgs: [], end: null }; turns.push(cur); }
  else if (e.type === 'assistant/message' && cur) cur.msgs.push({ time: e.time, text: (e.data?.message?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('') });
  else if (e.type === 'turn/end' && cur) cur.end = e.time;
}

const done = turns.filter((t) => t.end && t.msgs.length > 0).slice(-12);
console.log('');
console.log('轮次 | 总长 | 首条 | 条数 | 相邻间隔');
console.log('-----|------|------|------|----------');
for (const t of done) {
  const total = ((t.end - t.start) / 1000).toFixed(1);
  const first = ((t.msgs[0].time - t.start) / 1000).toFixed(1);
  const gaps = [];
  for (let i = 1; i < t.msgs.length; i += 1) gaps.push(((t.msgs[i].time - t.msgs[i - 1].time) / 1000).toFixed(1));
  const when = new Date(t.start).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai' });
  console.log(`${when} | ${total}s | ${first}s | ${t.msgs.length} | ${gaps.join(' / ') || '—'}`);
}

// 汇总
const all = done.map((t) => (t.end - t.start) / 1000);
if (all.length) {
  all.sort((a, b) => a - b);
  const med = all[Math.floor(all.length / 2)];
  console.log('');
  console.log(`最近 ${all.length} 轮：中位 ${med.toFixed(1)}s，最快 ${all[0].toFixed(1)}s，最慢 ${all[all.length - 1].toFixed(1)}s`);
}
