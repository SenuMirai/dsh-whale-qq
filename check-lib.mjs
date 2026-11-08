// 用编译产物测试 —— 但 renderTraceBlock 没导出到 index.js
// 换个办法：直接检查 lib/index.js 里有没有新代码
import { readFileSync } from "node:fs";
const l = readFileSync("C:/DSHwork/plugins-src/dsh-qq-group/lib/index.js", "utf8");
const plain = l.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
console.log("lib 含 trace.voice:", plain.includes("trace.voice") ? "✓" : "✗");
console.log("lib 含「｜重要」:", plain.includes("｜重要") ? "❌ 还在" : "✓ 已清");
const i = plain.indexOf("trace.voice");
if (i >= 0) {
  console.log("\n=== lib 里的 line 函数 ===");
  console.log(plain.slice(Math.max(0, i - 300), i + 300));
}
