import { readFileSync, writeFileSync } from 'node:fs';

const path = 'C:/DSHwork/plugins-src/dsh-qq-group/lib/client.js';
let source = readFileSync(path, 'utf8');

const startMarker = "            h(Row, { label: '冷场主动开口' },";
const endMarker = "          ) : h('p', { style: s.note, children: '这个群还没有策略。' }),";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('proactive markers not found');
const block = source.slice(start, end);
source = source.slice(0, start) + source.slice(end);

const chatMarker = "        h('div', { style: { ...s.card, display: tab === 'chat' ? 'block' : 'none' } },";
const insertAt = source.indexOf(chatMarker);
if (insertAt < 0) throw new Error('chat marker not found');

const page = `        h('div', { style: { ...s.card, display: tab === 'proactive' ? 'block' : 'none' } },
          h('h3', { style: { fontSize: '14px', margin: 0 }, children: '主动搭话' }),
          h('p', { style: s.note, children: '所有主动开口相关设置集中在这里；按群生效。' }),
          h(Row, { label: '群' },
            h('select', { style: s.input, value: groupId, onChange: function (e) { pickGroup(e.target.value); } },
              groupIds.map(function (id) { return h('option', { key: id, value: id, children: (groups[id] && groups[id].name ? groups[id].name : id) + '（' + id + '）' }); }),
            ),
          ),
          policy ? h('div', null,
${block}          ) : h('p', { style: s.note, children: '这个群还没有策略。' }),
        ),

`;

source = source.slice(0, insertAt) + page + source.slice(insertAt);
writeFileSync(path, source);
console.log('moved proactive block', block.length, 'chars');
