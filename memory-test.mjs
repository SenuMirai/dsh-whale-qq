import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { estimateTokens, mergeKeyMemories, readMemoryFile, emptyMemory, groupMemory, appendTurn } from './src/qq/memory.ts';

console.log('tokens', estimateTokens('你好 world'));
const merged = mergeKeyMemories(
  [{ id: 'a', kind: 'fact', text: '主人喜欢猫', confidence: 0.5, pinned: true, createdAt: 1, updatedAt: 1 }],
  [
    { id: 'b', kind: 'preference', text: '主人喜欢猫', confidence: 0.9, pinned: false, createdAt: 2, updatedAt: 2 },
    { id: 'c', kind: 'inside_joke', text: '助手', confidence: 0.7, pinned: false, createdAt: 2, updatedAt: 2 },
  ],
  10,
);
console.log('merged', merged.map((m) => [m.text, m.kind, m.pinned, m.confidence]));
const root = join(process.env.TEMP ?? '.', 'mem-test-' + Date.now());
mkdirSync(root, { recursive: true });
writeFileSync(join(root, 'm.json'), JSON.stringify({ version: 1, groups: { g: { turns: [], summary: 'old' } } }));
const read = readMemoryFile(join(root, 'm.json')).memory;
console.log('version', read.version, read.groups.g.keyMemories.length);
const mem = emptyMemory();
for (let i = 0; i < 3; i += 1) appendTurn(mem, 'g', { role: 'user', name: 'n', text: 'x'.repeat(100), ts: i }, { maxTurns: 2, summaryMaxChars: 500 });
console.log('turns', groupMemory(mem, 'g').turns.length, groupMemory(mem, 'g').summary.length);
rmSync(root, { recursive: true, force: true });
