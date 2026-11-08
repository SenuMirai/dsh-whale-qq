import { readFileSync, writeFileSync } from 'node:fs';
const p = 'C:/DSHwork/plugins-src/dsh-qq-group/lib/client.js';
let s = readFileSync(p, 'utf8');
const start = s.indexOf("          Section({ title: 'RVC 音色（可选）'");
const end = s.indexOf("          h(Row, { label: '试听' }", start);
if (start < 0 || end < 0) throw new Error('markers not found');
const replacement = `          Section({ title: 'RVC 音色（可选）', note: '自动检测本地模型；语音/唱歌共用。780M 核显走 DirectML（ONNX），CPU 作为回退。' }, [
            h('label', { style: { ...s.field, gridColumn: '1 / -1' } },
              h('span', { style: s.fieldLabel, children: '启用 RVC' }),
              h('input', { type: 'checkbox', checked: !!(cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.enabled), onChange: function (e) { setRvc({ enabled: e.target.checked }); } }),
            ),
            h('label', { style: { ...s.field, gridColumn: '1 / -1' } },
              h('span', { style: s.fieldLabel, children: '模型目录' }),
              h('input', { style: { ...s.fieldInputWide, width: '100%', flex: '1 1 240px' }, value: (cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.modelsDir) || '', placeholder: 'C:/DSHwork/models/rvc', onChange: function (e) { setRvc({ modelsDir: e.target.value }); } }),
              h('button', { style: s.btn, onClick: function () { void openRvcDir(); }, children: '打开' }),
              h('button', { style: s.btn, onClick: function () { void loadRvcModels(); }, children: '刷新' }),
            ),
            h('label', { style: { ...s.field, gridColumn: '1 / -1' } },
              h('span', { style: s.fieldLabel, children: '语音模型' }),
              h('select', { style: { ...s.fieldInputWide, width: '100%', flex: '1 1 240px' }, value: (function () { const found = rvcModels.find(function (m) { return m.pth === ((cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.modelPath) || '') || m.onnx === ((cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.modelPath) || ''); }); return found ? found.id : ''; })(), onChange: function (e) { chooseRvcModel(e.target.value); } },
                h('option', { value: '', children: rvcModels.length === 0 ? '未检测到模型，把模型文件夹放进上面的目录' : '选择模型' }),
                rvcModels.map(function (model) { return h('option', { key: model.id, value: model.id, children: model.label + '（' + model.format + (model.index ? ' + index' : '') + '）' }); }),
              ),
            ),
            h('label', { style: { ...s.field } },
              h('span', { style: s.fieldLabel, children: '运行设备' }),
              h('select', { style: { ...s.fieldInputWide, width: '140px', flex: '0 0 140px' }, value: (cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.device) || 'auto', onChange: function (e) { setRvc({ device: e.target.value }); } },
                h('option', { value: 'auto', children: '自动（优先后核显）' }),
                h('option', { value: 'dml', children: 'DirectML（780M）' }),
                h('option', { value: 'cpu', children: 'CPU' }),
              ),
            ),
            h('label', { style: { ...s.field } },
              h('span', { style: s.fieldLabel, children: '音调' }),
              h('input', { style: { flex: '1 1 auto' }, type: 'range', min: '-24', max: '24', step: '1', value: (cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.pitch) || 0, onChange: function (e) { setRvc({ pitch: Number(e.target.value) }); } }),
              h('span', { style: s.unit, children: ((cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.pitch) || 0) + ' 半音' }),
            ),
            h('label', { style: { ...s.field } },
              h('span', { style: s.fieldLabel, children: '推理超时' }),
              h('input', { style: { flex: '1 1 auto' }, type: 'range', min: '5', max: '600', step: '5', value: Math.round(((cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.timeoutMs) || 120000) / 1000), onChange: function (e) { setRvc({ timeoutMs: Number(e.target.value) * 1000 }); } }),
              h('span', { style: s.unit, children: Math.round(((cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.timeoutMs) || 120000) / 1000) + ' 秒' }),
            ),
            h('label', { style: { ...s.field } },
              h('span', { style: s.fieldLabel, children: '最长音频' }),
              h('input', { style: { flex: '1 1 auto' }, type: 'range', min: '5', max: '300', step: '5', value: (cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.maxSeconds) || 60, onChange: function (e) { setRvc({ maxSeconds: Number(e.target.value) }); } }),
              h('span', { style: s.unit, children: ((cfg && cfg.qq && cfg.qq.config && cfg.qq.config.rvc && cfg.qq.config.rvc.maxSeconds) || 60) + ' 秒' }),
            ),
            h('div', { style: { gridColumn: '1 / -1', fontSize: '11px', color: 'var(--dsw-alias-label-tertiary)', marginTop: '2px' }, children: '自动检测：' + (rvcDir || '未设置模型目录') + '；pth 走 CPU，onnx 走 DirectML。保存全部后生效。' }),
          ]),
`;
s = s.slice(0, start) + replacement + s.slice(end);
writeFileSync(p, s);
console.log('replaced', start, end);
