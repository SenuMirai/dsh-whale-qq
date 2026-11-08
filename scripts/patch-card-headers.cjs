/**
 * 给每个设置卡片加「标题 + 一句人话说明」。
 *
 * 原来每个卡片只有一行 h3 标题，等于让人猜这块是干什么的。
 * 现在统一成：大标题 + 一句解释「改这个会影响什么」。
 *
 * 用法：node scripts/patch-card-headers.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'lib', 'client.js');
let src = fs.readFileSync(file, 'utf8');

/** 标题 → 说明。写的是「改这个会发生什么」，不是术语。 */
const HINTS = {
  '新增群聊 / 私聊': '只有加进这里的群和人才会理；没加的一律不回。',
  '运行状态': '她连没连上 QQ、在哪些群、现在忙不忙。',
  '人设卡片': '决定她是谁、怎么说话。切换后世界那边也会跟着换。',
  '模型': '她用什么模型思考。默认跟随当前会话，也可以单独指定。',
  '模型用量与积分': '花了多少、还能用多久。数字是估算，仅供参考。',
  '主动搭话': '她会不会自己开口找你。频率越低越安静。',
  '聊天频率（按群设置）': '每个群分开调：多久接一次话、什么时候闭嘴。',
  '世界': '她的房间、日记、相册放在哪，以及和世界那边怎么同步。',
  '记忆与上下文': '她记得什么、记多久、忘多快。工作类记得短，和你有关的记得久。',
  '表情包': '她会发哪些图、从哪里收、收进来要不要自动识别内容。',
  '文件阅读': '别人发文件给她，她能不能看、看多大的。',
  '语音（edge-tts / 本地 TTS）': '她的声音从哪来、像不像本人。太长的话会退回文字。',
  '聊天内心吐槽': '聊完之后她在心里嘀咕的那一句，存在哪、留多久。',
  'QQ空间': '她自己决定发不发说说。开着就有可能发，不想发她会自己说"不发"。',
  '用户画像与关系': '她怎么记住每个人：熟识度、好感度、谁不能惹。',
  '夜间免打扰': '夜里她安静下来的时段，以及这时候被打扰会扣多少分。',
  '连接（OneBot / NapCat）': '怎么连上 QQ。一般不用动，除非换机器或换号。',
};

const oldPattern = /h\('h3', \{ style: \{ fontSize: '14px', margin: 0 \}, children: '([^']+)' \}\)/g;

let count = 0;
const missing = [];

src = src.replace(oldPattern, (match, title) => {
  const hint = HINTS[title];
  count += 1;
  if (hint === undefined) {
    missing.push(title);
    return match;
  }
  return (
    "h('div', { style: { marginBottom: '10px' } }, " +
    "h('h3', { style: s.cardTitle, children: '" + title + "' }), " +
    "h('p', { style: s.cardHint, children: '" + hint + "' }))"
  );
});

fs.writeFileSync(file, src, 'utf8');
console.log('替换卡片标题:', count, '个');
if (missing.length > 0) console.log('没有写说明的:', missing.join(' | '));
