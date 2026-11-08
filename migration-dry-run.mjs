import { readMemoryFile } from './src/qq/memory.ts';
import { emptyMemoryStore, migrateLegacyMemories, memoryStats, recallMemories } from './src/qq/memory-v3.ts';

const memory = readMemoryFile('C:/Users/demo/.dsh/dsh-qq-group/qq-memory.json').memory;
const store = emptyMemoryStore();
let added = 0;
for (const [groupId, group] of Object.entries(memory.groups)) {
  added += migrateLegacyMemories(
    store,
    groupId,
    group.keyMemories.map((item) => ({ text: item.text, kind: item.kind, confidence: item.confidence, createdAt: item.createdAt })),
    group.summary,
    Date.now(),
  );
}
console.log('migrated', added, 'groups', Object.keys(store.groups).length);
for (const groupId of Object.keys(store.groups)) {
  console.log(groupId, memoryStats(store, groupId));
  const result = recallMemories(store, groupId, '猫', { maxItems: 3 });
  console.log('query 猫:', result.selected.map((item) => item.text.slice(0, 30)));
}
