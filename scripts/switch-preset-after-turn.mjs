/**
 * 等当前这一轮跑完，再把本会话切到无限制模式。
 *
 * 为什么不能直接切：切预设要重建工具表，如果这一轮已经在跑，
 * 前后两半看到的工具就不一样了。所以由这个脚本在轮末代劳。
 *
 * 用法（detached）：node scripts/switch-preset-after-turn.mjs <sessionId> <preset>
 */
const HOST = 'http://127.0.0.1:61373';
const [sessionId, preset] = process.argv.slice(2);

if (!sessionId || !preset) {
  console.error('用法：node switch-preset-after-turn.mjs <sessionId> <preset>');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (let attempt = 1; attempt <= 120; attempt += 1) {
  await sleep(4000);
  try {
    const res = await fetch(`${HOST}/dsh-preset-switch/switch`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, preset }),
    });
    const data = await res.json();
    if (data.ok === true) {
      console.log(`[${new Date().toISOString()}] 第 ${attempt} 次尝试：切换成功 → ${preset}`);
      process.exit(0);
    }
    if (attempt % 10 === 0) {
      console.log(`[${new Date().toISOString()}] 第 ${attempt} 次：还在忙（${data.message || ''}）`);
    }
  } catch (e) {
    console.log(`[${new Date().toISOString()}] 第 ${attempt} 次出错：${e?.message ?? e}`);
  }
}

console.error('尝试次数用尽，没切成。');
process.exit(1);
