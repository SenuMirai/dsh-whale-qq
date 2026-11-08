// 用 esbuild 单独打包一个测试入口
import { writeFileSync } from "node:fs";
writeFileSync("C:/DSHwork/plugins-src/dsh-qq-group/probe2.ts", `
import { renderTraceBlock } from './src/qq/memory-traces';
const block = renderTraceBlock('C:/Users/demo/.dsh/worlds/default', Date.now());
console.log('长度:', block.length);
console.log(block.slice(0, 900));
`);
console.log("已写测试入口");
