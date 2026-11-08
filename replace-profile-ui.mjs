import { readFileSync, writeFileSync } from 'node:fs';
const p = 'C:/DSHwork/plugins-src/dsh-qq-group/lib/client.js';
const lines = readFileSync(p, 'utf8').split('\n');
const start = 1529;
const end = 1629;
const replacement = `        h('div', { style: { ...s.card, display: tab === 'lists' ? 'block' : 'none' } },
          h('h3', { style: { fontSize: '14px', margin: 0 }, children: '用户画像与关系' }),
          h('div', { style: s.infoCard },
            h('div', { style: { fontWeight: 600, color: 'var(--dsw-alias-label-primary)', marginBottom: '4px' }, children: '关系语气档位（提示词硬性规则）' }),
            h('div', { children: '熟识度：<20 陌生、保持距离；20~44 认识、正常友好；45~74 熟悉、可调侃/用昵称/主动关心；≥75 很熟、可互损/撒娇/吐槽。' }),
            h('div', { children: '好感度：≤-30 反感、冷淡简短不主动帮忙；-29~-1 略疏远；0~29 普通；30~59 有好感、温和关心；≥60 亲近、更耐心更愿意解释，但不会无脑舔。' }),
            h('div', { style: s.note, children: '下面的数值决定画像涨落速度；所有“每日上限”填 0 表示不限。' }),
          ),
          Section({ title: '关系评分加成', note: '只影响价值评分，不影响语气档位。' }, [
            NumberField({ label: '熟识度加成', value: scoreWeights.familiarityMax === undefined ? 8 : scoreWeights.familiarityMax, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('familiarityMax', v); } }),
            NumberField({ label: '好感度加成', value: scoreWeights.affinityMax === undefined ? 10 : scoreWeights.affinityMax, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('affinityMax', v); } }),
          ]),
          Section({ title: '熟识度增长', note: '每天首次发言、后续发言、被点名、她回复分别计算，互不占用上限。' }, [
            NumberField({ label: '每日首次发言', value: pr('firstMessageFam', 2), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('firstMessageFam', v); } }),
            NumberField({ label: '当天后续发言', value: pr('repeatMessageFam', 0.1), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('repeatMessageFam', v); } }),
            NumberField({ label: '发言每日上限', value: pr('messageFamDailyCap', 4), min: 0, max: 1000, unit: '0=不限', onChange: function (v) { setProfileRule('messageFamDailyCap', v); } }),
            NumberField({ label: '被点名一次', value: pr('mentionFam', 1), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('mentionFam', v); } }),
            NumberField({ label: '点名每日上限', value: pr('mentionFamDailyCap', 3), min: 0, max: 1000, unit: '0=不限', onChange: function (v) { setProfileRule('mentionFamDailyCap', v); } }),
            NumberField({ label: '她回复你', value: pr('replyFam', 0.5), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('replyFam', v); } }),
            NumberField({ label: '回复每日上限', value: pr('replyFamDailyCap', 3), min: 0, max: 1000, unit: '0=不限', onChange: function (v) { setProfileRule('replyFamDailyCap', v); } }),
          ]),
          Section({ title: '好感度增长', note: '回复、接话、引用分开计数；敌意扣分单独设置。' }, [
            NumberField({ label: '她回复你', value: pr('replyAffinity', 1), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('replyAffinity', v); } }),
            NumberField({ label: '回复每日上限', value: pr('replyAffinityDailyCap', 5), min: 0, max: 1000, unit: '0=不限', onChange: function (v) { setProfileRule('replyAffinityDailyCap', v); } }),
            NumberField({ label: '你接她的话', value: pr('continuationAffinity', 2), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('continuationAffinity', v); } }),
            NumberField({ label: '接话每日上限', value: pr('continuationAffinityDailyCap', 6), min: 0, max: 1000, unit: '0=不限', onChange: function (v) { setProfileRule('continuationAffinityDailyCap', v); } }),
            NumberField({ label: '引用回复她', value: pr('quoteAffinity', 1), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('quoteAffinity', v); } }),
            NumberField({ label: '引用每日上限', value: pr('quoteAffinityDailyCap', 5), min: 0, max: 1000, unit: '0=不限', onChange: function (v) { setProfileRule('quoteAffinityDailyCap', v); } }),
          ]),
          Section({ title: '敌意与长期衰减', note: '敌意由模型判断；长期不互动按周衰减。' }, [
            NumberField({ label: '轻度敌意扣好感', value: pr('hostilityMildLoss', 2), min: 0, max: 100, unit: '分', onChange: function (v) { setProfileRule('hostilityMildLoss', v); } }),
            NumberField({ label: '严重敌意扣好感', value: pr('hostilitySevereLoss', 4), min: 0, max: 100, unit: '分', onChange: function (v) { setProfileRule('hostilitySevereLoss', v); } }),
            NumberField({ label: '敌意每日上限', value: pr('hostilityDailyCap', 0), min: 0, max: 1000, unit: '0=不限', onChange: function (v) { setProfileRule('hostilityDailyCap', v); } }),
            NumberField({ label: '熟识衰减等待', value: pr('inactiveDaysBeforeFamDecay', 14), min: 0, max: 365, unit: '天', onChange: function (v) { setProfileRule('inactiveDaysBeforeFamDecay', v); } }),
            NumberField({ label: '熟识每周衰减', value: pr('famDecayPerWeek', 10), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('famDecayPerWeek', v); } }),
            NumberField({ label: '熟识最低保留', value: pr('famDecayFloor', 1), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('famDecayFloor', v); } }),
            NumberField({ label: '好感衰减等待', value: pr('inactiveDaysBeforeAffinityDecay', 7), min: 0, max: 365, unit: '天', onChange: function (v) { setProfileRule('inactiveDaysBeforeAffinityDecay', v); } }),
            NumberField({ label: '好感每周靠拢', value: pr('affinityDecayPerWeek', 1), min: 0, max: 100, step: 0.1, unit: '分', onChange: function (v) { setProfileRule('affinityDecayPerWeek', v); } }),
          ]),
          Section({ title: '初始好感', note: '只对尚未初始化的画像生效，不会追溯修改老画像。' }, [
            NumberField({ label: '主人初始好感', value: pr('initialOwnerAffinity', 60), min: 0, max: 100, unit: '分', onChange: function (v) { setProfileRule('initialOwnerAffinity', v); } }),
            NumberField({ label: '白名单初始好感', value: pr('initialWhitelistAffinity', 20), min: 0, max: 100, unit: '分', onChange: function (v) { setProfileRule('initialWhitelistAffinity', v); } }),
          ]),
          Section({ title: '名单与开关' }, [
            h('label', { style: { ...s.field, gridColumn: '1 / -1', alignItems: 'center' } },
              h('span', { style: s.fieldLabel, children: '主人 QQ' }),
              h('input', { style: s.fieldInputWide, value: (cfg && cfg.qq && cfg.qq.config && cfg.qq.config.ownerQq) || '', placeholder: 'QQ 号', onChange: function (e) { setCfg({ ...cfg, qq: { ...cfg.qq, config: { ...cfg.qq.config, ownerQq: e.target.value } } }); } }),
            ),
            h('label', { style: { ...s.field, gridColumn: '1 / -1' } },
              h('span', { style: s.fieldLabel, children: '被怼时让模型判断' }),
              h('input', { type: 'checkbox', checked: settings.hostilityJudge !== false, onChange: function (e) { setSettings({ ...settings, hostilityJudge: e.target.checked }); } }),
            ),
            h('div', { style: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '4px' } },
              h('div', null,
                h('div', { style: s.fieldLabel, children: '白名单 QQ（一行一个）' }),
                h('textarea', { style: { ...s.area, minHeight: '70px' }, value: (settings.whitelist || []).join('\\n'), placeholder: 'QQ号，一行一个', onChange: function (e) { setSettings({ ...settings, whitelist: e.target.value.split(/\\r?\\n/).map(function (x) { return x.trim(); }).filter(Boolean) }); } }),
                h('div', { style: s.note, children: '评分下限' }),
                h('input', { style: s.fieldInput, type: 'number', min: '0', max: '100', value: settings.whitelistFloor || 0, onChange: function (e) { setSettings({ ...settings, whitelistFloor: Number(e.target.value) }); } }),
              ),
              h('div', null,
                h('div', { style: s.fieldLabel, children: '黑名单 QQ（一行一个）' }),
                h('textarea', { style: { ...s.area, minHeight: '70px' }, value: (settings.blacklist || []).join('\\n'), placeholder: 'QQ号，一行一个', onChange: function (e) { setSettings({ ...settings, blacklist: e.target.value.split(/\\r?\\n/).map(function (x) { return x.trim(); }).filter(Boolean) }); } }),
                h('div', { style: s.note, children: '评分上限' }),
                h('input', { style: s.fieldInput, type: 'number', min: '0', max: '100', value: settings.blacklistCeil || 0, onChange: function (e) { setSettings({ ...settings, blacklistCeil: Number(e.target.value) }); } }),
              ),
            ),
          ]),
        ),
`;
lines.splice(start, end - start, ...replacement.split('\n'));
writeFileSync(p, lines.join('\n'));
console.log('replaced', start, end);
