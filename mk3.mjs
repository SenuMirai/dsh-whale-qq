import { writeFileSync } from "node:fs";
writeFileSync("C:/DSHwork/plugins-src/dsh-qq-group/probe3.ts", `
import { renderTraceBlock, syncTracePrompt } from './src/qq/memory-traces';
const W = 'C:/Users/demo/.dsh/worlds/default';
const block = renderTraceBlock(W, Date.now());
syncTracePrompt(W + '/world-prompt.md', block);
console.log('已同步，块长度:', block.length);
`);
