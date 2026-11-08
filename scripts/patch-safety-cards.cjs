/**
 * 往 client.js 里插入「安全防护」两张卡片。
 *
 * 卡片一：防护总览 —— 她现在能不能说话、今天发了多少、被哪条规则拦过。
 * 卡片二：档位与阈值 —— 安全档位 + 经济档位 + 可展开的具体数值。
 *
 * 用法：node scripts/patch-safety-cards.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'lib', 'client.js');
let src = fs.readFileSync(file, 'utf8');

const ANCHOR = `        h('div', { style: { ...s.card, display: tab === 'basic' ? 'block' : 'none' } },`;

if (src.includes("tab === 'safety' ? 'block'")) {
  console.log('已经插过了，跳过');
  process.exit(0);
}

const CARDS = `
        // ── 安全防护：总览 ─────────────────────────────────────────────
        h('div', { style: { ...s.card, display: tab === 'safety' ? 'block' : 'none' } },
          h('div', { style: { marginBottom: '10px' } },
            h('h3', { style: s.cardTitle, children: '防护总览' }),
            h('p', { style: s.cardHint, children: '管的是她能在什么时候、以什么节奏说话，不管她说什么。这一页回答一个问题：她现在安全吗。' }),
          ),
          (function () {
            const st = (safetyData && safetyData.stats) || {};
            const silenced = Number(st.silencedUntil || 0) > Date.now();
            const stateText = !safetyData
              ? '读取中…'
              : silenced
                ? '静默中 · ' + Math.ceil((st.silencedUntil - Date.now()) / 60000) + ' 分钟后恢复'
                : '正常，可以说话';
            const stateColor = silenced
              ? 'var(--dsw-alias-state-warning-primary, #e0a030)'
              : 'var(--dsw-alias-state-success-primary)';
            return h('div', { style: { ...s.infoCard, display: 'flex', alignItems: 'center', gap: '10px' } },
              h('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: stateColor, flex: '0 0 8px' } }),
              h('span', { style: { color: stateColor, fontWeight: 600 }, children: stateText }),
              safetyData && safetyData.ok === false
                ? h('span', { style: s.note, children: safetyData.message || '' })
                : null,
            );
          })(),
          h('div', { style: s.grid },
            h('div', { style: s.field },
              h('span', { style: s.fieldLabel, children: '这一分钟' }),
              h('span', { style: s.unit, children: String((safetyData && safetyData.stats && safetyData.stats.sentLastMinute) || 0) + ' 条' }),
            ),
            h('div', { style: s.field },
              h('span', { style: s.fieldLabel, children: '这一小时' }),
              h('span', { style: s.unit, children: String((safetyData && safetyData.stats && safetyData.stats.sentLastHour) || 0) + ' 条' }),
            ),
            h('div', { style: s.field },
              h('span', { style: s.fieldLabel, children: '今天合计' }),
              h('span', { style: s.unit, children: String((safetyData && safetyData.stats && safetyData.stats.sentToday) || 0) + ' 条' }),
            ),
            h('div', { style: s.field },
              h('span', { style: s.fieldLabel, children: '连续失败' }),
              h('span', { style: s.unit, children: String((safetyData && safetyData.stats && safetyData.stats.consecutiveFailures) || 0) + ' 次' }),
            ),
          ),
          h('div', { style: s.section },
            h('p', { style: s.sectionTitle, children: '今天被她挡下的' }),
            (function () {
              const blocks = (safetyData && safetyData.stats && safetyData.stats.blocksToday) || [];
              if (blocks.length === 0) return h('p', { style: s.note, children: '还没有拦过任何东西。' });
              return h('div', { style: s.grid },
                blocks.map(function (b) {
                  return h('div', { key: b.rule, style: s.field },
                    h('span', { style: s.fieldLabel, children: RULE_LABEL[b.rule] || b.rule }),
                    h('span', { style: s.unit, children: b.count + ' 次' }),
                  );
                }),
              );
            })(),
            (function () {
              const last = safetyData && safetyData.stats && safetyData.stats.lastBlock;
              if (!last) return null;
              return h('p', { style: s.note, children: '最后一次：' + last.reason });
            })(),
          ),
          h('div', { style: { ...s.row, marginTop: '12px' } },
            h('button', {
              style: s.btn,
              onClick: function () {
                void (async function () {
                  try {
                    await fetch(BASE + '/safety', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ action: 'reset' }),
                    });
                    const r = await fetch(BASE + '/safety', { cache: 'no-store' });
                    setSafetyData(await r.json());
                    setMessage('已解除静默');
                  } catch (e) {
                    setMessage('解除失败：' + String(e && e.message || e));
                  }
                })();
              },
              children: '解除静默',
            }),
            h('button', {
              style: s.btn,
              onClick: function () {
                void (async function () {
                  const r = await fetch(BASE + '/safety', { cache: 'no-store' });
                  setSafetyData(await r.json());
                })();
              },
              children: '刷新',
            }),
            h('span', { style: s.note, children: '「解除静默」只是清掉计时器和计数，不会改变档位。' }),
          ),
        ),

        // ── 安全防护：档位与阈值 ───────────────────────────────────────
        h('div', { style: { ...s.card, display: tab === 'safetyTune' ? 'block' : 'none' } },
          h('div', { style: { marginBottom: '10px' } },
            h('h3', { style: s.cardTitle, children: '档位与阈值' }),
            h('p', { style: s.cardHint, children: '先选档位，具体数值会跟着变。改得更保守的代价写在每个档位下面。' }),
          ),
          h(Row, { label: '总开关' },
            h('input', {
              type: 'checkbox',
              checked: !(settings.safety && settings.safety.enabled === false),
              onChange: function (e) { setSafety({ enabled: e.target.checked }); },
            }),
            h('span', { style: s.note, children: '关掉等于裸奔：不限速、不拦链接、失败也不退避。' }),
          ),
          h(Row, { label: '安全档位' },
            h('select', {
              style: s.input,
              value: (settings.safety && settings.safety.profile) || 'standard',
              onChange: function (e) { setSafety({ profile: e.target.value }); },
            },
              [
                { id: 'unlimited', label: '无限制 — 全部闸门关闭' },
                { id: 'loose', label: '宽松 — 只防极端情况' },
                { id: 'standard', label: '标准（默认）— 日常不受影响' },
                { id: 'strict', label: '保守 — 明显变安静变慢' },
              ].map(function (o) { return h('option', { key: o.id, value: o.id, children: o.label }); }),
            ),
          ),
          h(Row, { label: '经济档位' },
            h('select', {
              style: s.input,
              value: (settings.safety && settings.safety.economy) || 'off',
              onChange: function (e) { setSafety({ economy: e.target.value }); },
            },
              [
                { id: 'off', label: '不看成本 — 谷时峰时一个样' },
                { id: 'balanced', label: '峰时收敛 — 峰时额度 ×0.7，谷时 ×1.3' },
                { id: 'frugal', label: '峰时只回应 — 峰时额度 ×0.35，谷时 ×1.5' },
              ].map(function (o) { return h('option', { key: o.id, value: o.id, children: o.label }); }),
            ),
          ),
          h(Row, { label: '谷时时段' },
            h('input', {
              style: s.fieldInput, type: 'number', min: '0', max: '23',
              value: (settings.safety && settings.safety.offPeakStart) || 0,
              onChange: function (e) { setSafety({ offPeakStart: Number(e.target.value) }); },
            }),
            h('span', { style: s.unit, children: '点 到' }),
            h('input', {
              style: s.fieldInput, type: 'number', min: '0', max: '23',
              value: (settings.safety && settings.safety.offPeakEnd) || 8,
              onChange: function (e) { setSafety({ offPeakEnd: Number(e.target.value) }); },
            }),
            h('span', { style: s.unit, children: '点（默认 0–8）' }),
          ),
          h(Row, { label: '私聊豁免' },
            h('input', {
              type: 'checkbox',
              checked: !(settings.safety && settings.safety.privateExempt === false),
              onChange: function (e) { setSafety({ privateExempt: e.target.checked }); },
            }),
            h('span', { style: s.note, children: '静默期里私聊仍能回你一句，出事时你还找得到她。' }),
          ),
          h('div', { style: s.section },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              h('p', { style: s.sectionTitle, children: '具体阈值' }),
              h('button', {
                style: { ...s.chip, ...(safetyDetail ? s.chipOn : {}) },
                onClick: function () { setSafetyDetail(!safetyDetail); },
                children: safetyDetail ? '收起' : '展开',
              }),
            ),
            safetyDetail
              ? h('div', { style: s.grid },
                  [
                    { key: 'globalPerMinute', label: '每分钟上限', unit: '条', min: 0, max: 600 },
                    { key: 'globalPerHour', label: '每小时上限', unit: '条', min: 0, max: 5000 },
                    { key: 'burstAfter', label: '连发几句后静默', unit: '句', min: 0, max: 200 },
                    { key: 'burstSilenceMinutes', label: '连发静默时长', unit: '分钟', min: 0, max: 1440 },
                    { key: 'failureThreshold', label: '连续失败几次退避', unit: '次', min: 0, max: 100 },
                    { key: 'silenceMinutes', label: '退避静默时长', unit: '分钟', min: 0, max: 1440 },
                    { key: 'jitterMinMs', label: '分条间隔下限', unit: '毫秒', min: 0, max: 60000 },
                    { key: 'jitterMaxMs', label: '分条间隔上限', unit: '毫秒', min: 0, max: 60000 },
                    { key: 'typingPerCharMs', label: '每字打字延迟', unit: '毫秒', min: 0, max: 1000 },
                    { key: 'repeatWindowMinutes', label: '重复检测窗口', unit: '分钟', min: 1, max: 1440 },
                  ].map(function (f) {
                    return h('div', { key: f.key, style: s.field },
                      h('span', { style: s.fieldLabel, children: f.label }),
                      h('input', {
                        style: s.fieldInput, type: 'number', min: String(f.min), max: String(f.max),
                        value: (settings.safety && settings.safety[f.key] !== undefined) ? settings.safety[f.key] : 0,
                        onChange: function (e) {
                          const patch = {};
                          patch[f.key] = Number(e.target.value);
                          setSafety(patch);
                        },
                      }),
                      h('span', { style: s.unit, children: f.unit }),
                    );
                  }),
                  h('div', { style: s.field },
                    h('span', { style: s.fieldLabel, children: '拦带链接的发言' }),
                    h('input', {
                      type: 'checkbox',
                      checked: !(settings.safety && settings.safety.blockLinks === false),
                      onChange: function (e) { setSafety({ blockLinks: e.target.checked }); },
                    }),
                  ),
                  h('div', { style: s.field },
                    h('span', { style: s.fieldLabel, children: '拦重复的话' }),
                    h('input', {
                      type: 'checkbox',
                      checked: !(settings.safety && settings.safety.blockRepeat === false),
                      onChange: function (e) { setSafety({ blockRepeat: e.target.checked }); },
                    }),
                  ),
                  h('div', { style: s.field },
                    h('span', { style: s.fieldLabel, children: '深夜自动降频' }),
                    h('input', {
                      type: 'checkbox',
                      checked: !(settings.safety && settings.safety.nightThrottle === false),
                      onChange: function (e) { setSafety({ nightThrottle: e.target.checked }); },
                    }),
                  ),
                  h('div', { style: s.field },
                    h('span', { style: s.fieldLabel, children: '疑似风控立即停手' }),
                    h('input', {
                      type: 'checkbox',
                      checked: !(settings.safety && settings.safety.stopOnRiskSignal === false),
                      onChange: function (e) { setSafety({ stopOnRiskSignal: e.target.checked }); },
                    }),
                  ),
                )
              : h('p', { style: s.note, children: '平时不用动这一块。档位已经给了一组调好的值。' }),
          ),
          h('div', { style: s.infoCard },
            '这套东西只管频率和时机。她说什么、是什么性格，不归这里管——' +
            '把话削平不是防护，是换个方式把她弄丢。',
          ),
        ),

`;

src = src.replace(ANCHOR, CARDS + ANCHOR, 1);

// 规则中文名映射，放在 NAV 后面
if (!src.includes('const RULE_LABEL')) {
  src = src.replace(
    '    const s = {',
    `    /** 拦截规则 id → 中文名（界面显示用） */
    const RULE_LABEL = {
      'rate-minute': '每分钟超量',
      'rate-hour': '每小时超量',
      silence: '静默期内',
      night: '深夜限速',
      burst: '连发过多',
      repeat: '重复发言',
      link: '带链接',
      'failure-backoff': '连续失败',
      'failure-risk': '疑似风控',
      'failure-mute': '被禁言',
    };

    const s = {`,
    1,
  );
}

fs.writeFileSync(file, src, 'utf8');
console.log('已插入安全防护卡片');
