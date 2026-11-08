import { renderTraceBlock } from "file:///C:/DSHwork/plugins-src/dsh-qq-group/src/qq/memory-traces.ts";
const block = renderTraceBlock("C:/Users/demo/.dsh/worlds/default", Date.now());
console.log("渲染出的记忆块:", block.length, "字符\n");
for (const s of ["## 我的记忆痕迹","### 和主人的记忆","### 群聊记忆","### 今天翻出来的旧事","### 上一窗留给我的便签","### 未了的事","### 我懂了"]) {
  console.log(`  ${block.includes(s) ? "✓" : "·"} ${s}`);
}
console.log("\n=== 开头 300 字符 ===");
console.log(block.slice(0, 300));
