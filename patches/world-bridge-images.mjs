/**
 * dsh-world 桥：让 /dsh-world/bridge/say 收图片。
 *
 * 为什么需要：0.5.6 的 ecosystem/bridge/route.js 只读 body.text，
 * 而 bridge.say(text, images) 本身支持图片。不补这一段，QQ 插件发来的图
 * 会被静默丢掉，她只看到文本里的「[图片]」两个字。
 *
 * 幂等：已经打过（能搜到 MARKER）就不再动。
 */

export const id = 'world-bridge-images';

export const MARKER = 'bridge-images-patched';

export const file = 'lib/ecosystem/bridge/route.js';

export function detect(source) {
  // 认 MARKER；也认「解析 body.images」这段特征——
  // 早先手动打过的补丁没有 MARKER，但效果是一样的，不该重复打。
  return source.includes(MARKER) || source.includes('Array.isArray(body?.images)');
}

export function apply(source) {
  const anchor = `    try {
        return { status: 202, body: { accepted: true, id: (await bridge.say(text)).id } };
    }`;
  if (!source.includes(anchor)) {
    throw new Error('route.js 结构变了，找不到 say 调用点；需要按新版重新定位');
  }

  const replacement = `    // ${MARKER}
    // 图片：QQ 插件发来的是 data URL；转成 saveImages 认识的形状再交给桥。
    const images = [];
    if (Array.isArray(body?.images)) {
        for (const url of body.images.slice(0, 4)) {
            if (typeof url !== 'string') continue;
            const m = /^data:([^;]+);base64,([\\s\\S]+)$/.exec(url);
            if (m === null) continue;
            try {
                const data = Buffer.from(m[2], 'base64');
                if (data.byteLength === 0) continue;
                images.push({ data: new Uint8Array(data), mediaType: m[1], name: \`bridge-\${Date.now()}-\${images.length}\` });
            }
            catch {
                /* 单张坏掉不影响其他 */
            }
        }
    }
    try {
        const accepted = await bridge.say(text, images);
        return { status: 202, body: { accepted: true, id: accepted.id } };
    }`;

  return source.replace(anchor, replacement);
}
