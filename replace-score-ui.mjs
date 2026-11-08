import { readFileSync, writeFileSync } from 'node:fs';
const p = 'C:/DSHwork/plugins-src/dsh-qq-group/lib/client.js';
const lines = readFileSync(p, 'utf8').split('\n');
const start = 1070;
const end = 1104;
const replacement = `            Section({ title: '评分权重', note: '分数 = 基础分 + 各加成 - 各扣分；具体阈值/概率仍按群设置。' }, [
              NumberField({ label: '基础分', value: scoreWeights.base === undefined ? 15 : scoreWeights.base, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('base', v); } }),
              NumberField({ label: '关键词倍率', value: scoreWeights.keywordMultiplier === undefined ? 50 : scoreWeights.keywordMultiplier, min: 0, max: 500, unit: '×', onChange: function (v) { setScoreWeight('keywordMultiplier', v); } }),
              NumberField({ label: '指定成员倍率', value: scoreWeights.memberMultiplier === undefined ? 50 : scoreWeights.memberMultiplier, min: 0, max: 500, unit: '×', onChange: function (v) { setScoreWeight('memberMultiplier', v); } }),
              NumberField({ label: '同一人接着说', value: scoreWeights.sameSpeaker === undefined ? 30 : scoreWeights.sameSpeaker, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('sameSpeaker', v); } }),
              NumberField({ label: '接着她的话', value: scoreWeights.continuation === undefined ? 20 : scoreWeights.continuation, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('continuation', v); } }),
              NumberField({ label: '直接接', value: scoreWeights.directContinuation === undefined ? 10 : scoreWeights.directContinuation, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('directContinuation', v); } }),
              NumberField({ label: '第二人称「你」', value: scoreWeights.secondPerson === undefined ? 15 : scoreWeights.secondPerson, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('secondPerson', v); } }),
              NumberField({ label: '@ 别人扣分', value: scoreWeights.atOtherPenalty === undefined ? 30 : scoreWeights.atOtherPenalty, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('atOtherPenalty', v); } }),
              NumberField({ label: '引用别人扣分', value: scoreWeights.replyOtherPenalty === undefined ? 25 : scoreWeights.replyOtherPenalty, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('replyOtherPenalty', v); } }),
              NumberField({ label: '被冷落每次扣', value: scoreWeights.ignoredPenalty === undefined ? 8 : scoreWeights.ignoredPenalty, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('ignoredPenalty', v); } }),
              NumberField({ label: '单条消息扣', value: scoreWeights.singleMessagePenalty === undefined ? 5 : scoreWeights.singleMessagePenalty, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('singleMessagePenalty', v); } }),
              NumberField({ label: '短消息扣', value: scoreWeights.shortMessagePenalty === undefined ? 8 : scoreWeights.shortMessagePenalty, min: 0, max: 100, unit: '分', onChange: function (v) { setScoreWeight('shortMessagePenalty', v); } }),
              NumberField({ label: '短消息字数阈值', value: scoreWeights.shortMessageChars === undefined ? 6 : scoreWeights.shortMessageChars, min: 0, max: 100, unit: '字', onChange: function (v) { setScoreWeight('shortMessageChars', v); } }),
            ]),`;
lines.splice(start, end - start, ...replacement.split('\n'));
writeFileSync(p, lines.join('\n'));
console.log('replaced', start, end);
