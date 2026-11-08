/**
 * dsh-world：让她的世界提示词每轮重新读文件。
 *
 * 为什么需要：0.5.6 的 promptSection.js 只在会话打开时读一次 world-prompt.md，
 * 之后只有压缩（compaction）才重读。可是记忆痕迹和群近况是 QQ 插件实时写进这个文件的——
 * 结果就是：群里刚发生的事、今天新写的记忆，写进文件是实时的，进她的提示词要等重启或压缩。
 * 私聊走世界、群聊走插件，两边就变成了两套记忆、两个她。
 *
 * 做法：给系统提示词那一段包一层 mtime 检查。文件没变就照旧（provider 前缀缓存还能命中），
 * 变了就当场重读。一次 statSync 的成本可以忽略。
 *
 * 幂等：能搜到 MARKER 就不再动。
 */

export const id = 'world-prompt-live';

export const MARKER = 'world-prompt-live-patched';

export const file = 'lib/promptSection.js';

export function detect(source) {
  return source.includes(MARKER);
}

export function apply(source) {
  let out = source;

  // 1) 引入 statSync
  const importAnchor = `import { readTemplate, renderWorldPrompt } from "./worldPrompt.js";`;
  if (!out.includes(importAnchor)) {
    throw new Error('promptSection.js 的 import 段变了；需要按新版重新定位');
  }
  out = out.replace(
    importAnchor,
    `import { statSync } from "node:fs";\n${importAnchor}`,
  );

  // 2) 在读函数后面加一个 mtime 指纹
  const stampAnchor = `    /** Registers her persona when she has one and drops it when she has none. */`;
  if (!out.includes(stampAnchor)) {
    throw new Error('promptSection.js 找不到 placePersona 注释行；需要按新版重新定位');
  }
  out = out.replace(
    stampAnchor,
    `    /* ${MARKER}：world-prompt.md / 我是谁.md 一改就生效，不再等压缩。 */
    function promptStamp() {
        let out = "";
        for (const f of [world.prompt.file, config.selfFile]) {
            if (!f)
                continue;
            try {
                out += \`\${f}:\${statSync(f).mtimeMs};\`;
            }
            catch {
                out += \`\${f}:0;\`;
            }
        }
        return out;
    }
${stampAnchor}`,
  );

  // 3) 世界提示词那一段改成每轮检查
  const entryAnchor = `            const entry = { text, world: agent.ctx.systemPrompt.section({ name: 'dsh-world', order: 50, interpolate: false, text: () => renderWorldPrompt(world.prompt, entry.text.template, entry.text.self, world.isHome(agent.id)) }) };`;
  if (!out.includes(entryAnchor)) {
    throw new Error('promptSection.js 的 section 注册行变了；需要按新版重新定位');
  }
  out = out.replace(
    entryAnchor,
    `            const entry = { text, stamp: promptStamp(), world: agent.ctx.systemPrompt.section({ name: 'dsh-world', order: 50, interpolate: false, text: () => {
                    // 文件变了就重读：记忆痕迹、群近况、我是谁都是实时写进这个文件的。
                    const now = promptStamp();
                    if (now !== entry.stamp) {
                        entry.text = read();
                        entry.stamp = now;
                    }
                    return renderWorldPrompt(world.prompt, entry.text.template, entry.text.self, world.isHome(agent.id));
                } }) };`,
  );

  // 4) refresh() 里同步指纹，免得压缩后立刻又判定为「变了」白读一次
  const refreshAnchor = `            entry.text = read();
            placePersona(agent, entry);`;
  if (!out.includes(refreshAnchor)) {
    throw new Error('promptSection.js 的 refresh 段变了；需要按新版重新定位');
  }
  out = out.replace(
    refreshAnchor,
    `            entry.text = read();
            entry.stamp = promptStamp();
            placePersona(agent, entry);`,
  );

  return out;
}
