import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/DSHwork/plugins-src/dsh-qq-group/src/qq/bridge.ts';
const lines = readFileSync(p, 'utf8').split('\n');

// 1-based: 2987 是「// 分条规则来自 chat-style.json」那行，3093 是 if (chunks.length <= 1)
const startIdx = 2986;
const endIdx = 3092;
const head = lines.slice(0, startIdx);
const tail = lines.slice(endIdx);

const block = `    // ── 分条契约 ──
    // 不再猜换行、不再按句子切。规则只有一条：
    // 单独一行 ---  = 一条新气泡；没有 --- 就整条发一条。
    const style = this.chatStyle();
    const cap = Math.max(1, Math.min(style.maxBubbles, Math.round(policy.burst.max)));
    const SEPARATOR = /^[ \\t]*[-—–]{3,}[ \\t]*$/mu;
    const rawParts = body.split(SEPARATOR);
    let chunks = rawParts.map((part) => tidy(part)).filter((part) => part !== '');
    if (chunks.length === 0) chunks = [tidy(body)];
    if (chunks.length > cap) {
      // 超出上限：把多出来的并进最后一条，保证不刷屏。
      const kept = chunks.slice(0, cap - 1);
      const rest = chunks.slice(cap - 1).join('\\n');
      chunks = [...kept, rest];
    }`;

writeFileSync(p, [...head, block, ...tail].join('\n'), 'utf8');
console.log('契约分条已写入');
