/**
 * 给世界控制台加一张「上下文预算」卡（概览页），
 * 并把「记忆 60 轮」改名说清楚它不是记忆总量。
 *
 * 用法：node scripts/patch-context-budget.cjs（在 dsh-world 目录下跑）
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = 'C:/Users/demo/.dsh/profiles/desktop/node_modules/dsh-world';
const file = path.join(ROOT, 'client', 'index.js');
let src = fs.readFileSync(file, 'utf8');

if (src.includes('function ContextBudget')) {
  console.log('已经加过了，跳过');
  process.exit(0);
}

// ── 1. 新卡片组件 ─────────────────────────────────────────────────────
const COMPONENT = `
    /**
     * 上下文预算：每一轮请求到底背了多少东西。
     *
     * 为什么需要这一块：主人一直以为「记忆 60 轮」就是她的记忆总量。
     * 其实那只是短期衔接，角色卡、世界提示词、工具表、记忆痕迹都在别处，
     * 加起来比历史大一倍。不摊开看，调参永远调错地方。
     */
    function ContextBudget(props) {
      var ctx = props.ctx
      if (!ctx || !list(ctx.blocks).length) return null
      var blocks = list(ctx.blocks)
      var total = ctx.total || 0
      var window_ = 1000000 // 参考窗口：主流 1M 上下文
      var pct = Math.min(100, Math.round((total / window_) * 1000) / 10)
      var maxAbs = Math.max.apply(null, blocks.map(function (b) { return b.tokens || 0 }))
      function fmt(n) { return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',') }
      // 实况判断
      var advice = []
      var biggest = blocks.slice().sort(function (a, b) { return (b.tokens || 0) - (a.tokens || 0) })[0]
      if (biggest && biggest.key === 'tools') advice.push('工具表是最大的一块（' + fmt(biggest.tokens) + ' token）。她不用的时候不该常驻——查一下按需加载有没有生效。')
      if (biggest && biggest.key === 'history') advice.push('历史是最大的一块（' + fmt(biggest.tokens) + ' token）。想更快就把「短期衔接轮数」调小，记忆本身不受影响。')
      if (pct > 40) advice.push('已用掉 ' + pct + '% 的 1M 窗口。超过八成会开始自动压缩，压缩会丢细节。')
      else if (pct > 15) advice.push('占 1M 窗口的 ' + pct + '%，还很宽裕。这个量主要影响首字速度，不影响能不能记住。')
      else advice.push('只占 1M 窗口的 ' + pct + '%，非常轻。慢的话大概率是模型本身，不是上下文。')
      return h(Card, { title: '上下文预算', delay: 160 },
        h('div', { className: 'dw-muted', style: { marginBottom: 8 } }, '这是她每次开口前要读完的东西。数字越小，回得越快。'),
        blocks.map(function (b) {
          var w = maxAbs > 0 ? Math.max(2, Math.round(((b.tokens || 0) / maxAbs) * 100)) : 2
          return h('div', { key: b.key, style: { margin: '7px 0' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 3 } },
              h('span', null, b.label),
              h('span', { className: 'dw-muted' }, fmt(b.tokens || 0) + ' token')),
            h('div', { style: { height: 6, borderRadius: 3, background: 'color-mix(in srgb,currentColor 9%,transparent)', overflow: 'hidden' } },
              h('div', { style: { width: w + '%', height: '100%', background: 'var(--gold)', opacity: 0.65 } })),
            b.hint ? h('div', { className: 'dw-muted', style: { fontSize: 11.5, marginTop: 2 } }, b.hint) : null)
        }),
        h('div', { style: { marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--line)' } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 600 } },
            h('span', null, '合计'),
            h('span', null, fmt(total) + ' token · 约占 1M 窗口 ' + pct + '%'))),
        h('div', { className: 'dw-muted', style: { marginTop: 10, fontSize: 12, lineHeight: 1.7 } },
          '受这些设置影响：',
          h('br'),
          '· 角色卡 —— QQ 插件里的人设卡（改一次两边同步）',
          h('br'),
          '· 世界提示词 —— 设置里的「世界提示词」，写多少算多少',
          h('br'),
          '· 记忆痕迹注入 —— 由记忆条数与相关性决定，不是全部记忆，只是挑出来的几条',
          h('br'),
          '· 对话历史 —— 只由「短期衔接轮数」控制，和长期记忆无关',
          h('br'),
          '· 工具表 —— 插件注册了多少工具；按需加载能把它压到很小',
          h('br'),
          '自动压缩：快撞上模型窗口时，宿主会把最早的一段对话压成摘要，细节会丢。所以别把窗口喂满。'),
        advice.length ? h('div', { style: { marginTop: 10, fontSize: 12, lineHeight: 1.7 } },
          advice.map(function (a, i) { return h('div', { key: i, className: 'dw-muted' }, '· ' + a) })) : null)
    }
`;

src = src.replace('    function Digest(props) {', COMPONENT + '\n    function Digest(props) {', 1);

// ── 2. 概览里挂上这张卡 ───────────────────────────────────────────────
src = src.replace(
  "          h(Memory, { mem: mem, onSaved: props.refresh }),",
  "          h(Memory, { mem: mem, onSaved: props.refresh }),\n          h(ContextBudget, { ctx: snap.context }),",
  1,
);

// ── 3. 把「记忆」改名，并说清 60 轮是什么 ─────────────────────────────
src = src.replace(
  "/** 记忆块带最近几轮：默认 200，下次开始对话或压缩之后生效。 */\n    function Memory(props) {",
  "/**\n     * 短期衔接：她这一轮能看到最近多少条对话。\n     *\n     * 名词说明（很重要）：这个数字**不是她的记忆总量**。\n     * 长期记忆在记忆痕迹、日记、相册里，不随这个值变。\n     * 它只决定「刚才聊到哪」这一层衔接有多长。\n     */\n    function Memory(props) {",
  1,
);
src = src.replace("h(Card, { title: '记忆', delay: 180 }", "h(Card, { title: '短期衔接（不是记忆总量）', delay: 180 }", 1);

// ── 4. 导出给测试 ─────────────────────────────────────────────────────
src = src.replace(
  "PersonaEditor: PersonaEditor, PromptEditor: PromptEditor,",
  "PersonaEditor: PersonaEditor, PromptEditor: PromptEditor, ContextBudget: ContextBudget,",
  1,
);

fs.writeFileSync(file, src, 'utf8');
console.log('已加入 ContextBudget 卡并改名');
