import { appendFileSync } from 'node:fs';

const p = 'C:/DSHwork/plugins-src/dsh-qq-group/docs/PROJECT-GOAL.md';
const text = `

## 目标修订：取消跨会话记忆同步（2026-10-27 主人确认）

原「23:00 休息后的跨会话记忆同步」**取消**，不再作为目标。

主人的边界：

- 工作 / 生活严格分开；
- 她的记忆只来自**家会话**和 **QQ 插件**；
- 其他会话是纯工作，不写入她的记忆，也不同步给她。

因此：

- 不实现"把她睡着期间别的会话发生的事注入她"；
- 不把工作会话归档进 world；
- 已配置 \`archiveScope: home\`，只归档家会话；
- 群聊见闻是例外且已实现（\`room/群里的近况.md\`），因为那是她自己参与的生活，不是工作。

剩余真目标：

1. 私聊体验对齐群聊（分条、间隔、语音、表情、不刷屏）
2. 世界模型下拉、入站语音转写、表情语义匹配（已做，待回归）
3. 上游 dsh-world 0.5.6 合并（已有签名包，主环境仍 0.5.1）
4. 微信原生桥（缺 MSVC，阻塞）
5. 完整回归与发布
`;
appendFileSync(p, text, 'utf8');
console.log('appended');
