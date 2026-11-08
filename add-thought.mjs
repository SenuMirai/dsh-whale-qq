import { readFileSync, writeFileSync } from 'node:fs';
const p = 'C:/DSHwork/plugins-src/dsh-qq-group/src/index.ts';
let s = readFileSync(p, 'utf8');
if (s.includes('world/thought')) {
  console.log('already');
  process.exit(0);
}
const anchor = "      if (rest === 'world/digest' && method === 'GET') {";
const block = [
  "      if (rest === 'world/thought' && method === 'POST') {",
  "        const parsed = JSON.parse(body ?? '{}') as { text?: unknown };",
  "        const note = typeof parsed.text === 'string' ? parsed.text.trim().slice(0, 2000) : '';",
  "        if (note === '') return send(400, { ok: false, message: 'text 为空' });",
  "        const settings = readSettings(root);",
  "        const worldDir = readWorldBridge(root, settings.worldBridge).worldDir;",
  "        const target = join(worldDir, 'room', '没说出口的话.md');",
  "        mkdirSync(dirname(target), { recursive: true });",
  "        const stamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });",
  "        try {",
  "          appendFileSync(target, `- ${stamp}｜${note}\\n`, 'utf8');",
  "        } catch (e) {",
  "          return send(500, { ok: false, message: e instanceof Error ? e.message : String(e) });",
  "        }",
  "        return send(200, { ok: true });",
  "      }",
  "",
  anchor,
].join('\n');
s = s.replace(anchor, block);
writeFileSync(p, s);
console.log('added');
