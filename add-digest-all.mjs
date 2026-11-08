import { readFileSync, writeFileSync } from 'node:fs';

const component = `    function Digest(props) {
      var state = useState(null), data = state[0], setData = state[1]
      var groupState = useState('all'), group = groupState[0], setGroup = groupState[1]
      var kindState = useState('all'), kind = kindState[0], setKind = kindState[1]
      var dayState = useState(''), day = dayState[0], setDay = dayState[1]
      var msgState = useState(''), msg = msgState[0], setMsg = msgState[1]
      function load() {
        fetch('/dsh-qq-group/world/digest', { cache: 'no-store' }).then(function (r) { return r.json() }).then(function (v) { setData(v) }, function () { setData(null) })
      }
      useEffect(load, [])
      function act(payload) {
        fetch('/dsh-qq-group/world/digest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then(function (r) { return r.json() }).then(function () { setMsg('已更新'); load() }, function (e) { setMsg('失败：' + (e.message || e)) })
      }
      var entries = list(data && data.entries)
      var groups = list(data && data.groups)
      var shown = entries.filter(function (e) {
        if (group !== 'all' && e.groupId !== group) return false
        if (kind === 'self' && e.self !== true) return false
        if (kind === 'others' && e.self === true) return false
        if (day !== '' && new Date(e.at).toLocaleDateString('en-CA') !== day) return false
        return true
      })
      return h('div', { className: 'dw-pane' },
        h(Card, { title: '群里的近况', delay: 60 },
          h('div', { className: 'dw-muted' }, '群里的话一进来就记下来，实时更新。她读的是 room/群里的近况.md（最近 40 条）；这里是你管理的完整记录。'),
          h('div', { className: 'dw-setting' },
            h('span', { className: 'dw-muted' }, '共 ' + entries.length + ' 条 · 我 ' + (data && data.selfCount ? data.selfCount : 0) + ' 条'),
            h('select', { value: group, onChange: function (e) { setGroup(e.target.value) } },
              h('option', { value: 'all' }, '全部群'),
              groups.map(function (g) { return h('option', { key: g, value: g }, '群 ' + g) })),
            h('select', { value: kind, onChange: function (e) { setKind(e.target.value) } },
              h('option', { value: 'all' }, '全部'),
              h('option', { value: 'self' }, '我说的'),
              h('option', { value: 'others' }, '别人说的')),
            h('input', { type: 'date', value: day, onChange: function (e) { setDay(e.target.value) } }),
            day ? h('button', { className: 'dw-btn', onClick: function () { setDay('') } }, '全部日期') : null,
            h('button', { className: 'dw-btn', onClick: function () { if (!window.confirm('清空全部群聊见闻？她说的话也会一起清掉。')) return; act({ action: 'clear' }) } }, '清空')),
          h('div', { className: 'dw-traces' }, shown.length === 0
            ? h('div', { className: 'dw-muted' }, '没有符合条件的记录')
            : shown.slice(0, 200).map(function (e, i, arr) {
                var d = new Date(e.at).toLocaleDateString('zh-CN')
                var prev = i > 0 ? new Date(arr[i - 1].at).toLocaleDateString('zh-CN') : ''
                return h('div', { key: e.id || i, className: 'dw-setting' },
                  d !== prev ? h('div', { className: 'dw-muted', style: { paddingBottom: '2px' } }, d) : null,
                  h('span', { className: 'dw-muted' }, new Date(e.at).toLocaleTimeString('zh-CN', { hour12: false }) + ' · 群 ' + e.groupId + ' · ' + (e.self ? '我' : e.name)),
                  h('span', { style: { display: 'block', whiteSpace: 'pre-wrap' } }, String(e.text || '')),
                  h('button', { className: 'dw-btn', onClick: function () { act({ action: 'delete', ids: [e.id] }) } }, '删'))
              })),
          msg ? h('div', { className: 'dw-muted' }, msg) : null))
    }

`;

const targets = [
  'C:/Users/demo/AppData/Local/Temp/dsh-world-056/client/index.js',
  'C:/Users/demo/.dsh/profiles/desktop/node_modules/dsh-world/client/index.js',
  'C:/Users/demo/.dsh/profiles/world-wechat-test/node_modules/dsh-world/client/index.js',
];

for (const f of targets) {
  let s = readFileSync(f, 'utf8');
  let changed = false;
  if (!s.includes('function Digest(props)')) {
    const anchor = '    function Traces(props) {';
    if (!s.includes(anchor)) {
      console.log('anchor missing', f);
      continue;
    }
    s = s.replace(anchor, component + anchor);
    changed = true;
  }
  if (!s.includes("'群里的近况'")) {
    s = s.replace("['traces', '记忆痕迹']]", "['traces', '记忆痕迹'], ['digest', '群里的近况']]");
    changed = true;
  }
  if (!s.includes("tab === 'digest'")) {
    s = s.replace(
      "tab === 'traces' ? h(Traces, null) : null",
      "tab === 'traces' ? h(Traces, null) : null,\n        tab === 'digest' ? h(Digest, null) : null",
    );
    changed = true;
  }
  writeFileSync(f, s);
  console.log(changed ? 'patched' : 'unchanged', f);
}
