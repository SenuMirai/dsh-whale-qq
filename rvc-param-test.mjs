import { readFileSync } from 'node:fs';
import { createCommandRvcConverter } from './src/sound/rvc.ts';
const converter = createCommandRvcConverter({
  pythonPath: 'C:/DSHwork/models/rvc/venv-onnx/Scripts/python.exe',
  scriptPath: 'C:/DSHwork/models/rvc/rvc_onnx_worker.py',
  modelPath: 'C:/DSHwork/models/rvc/Hogaraka/model.onnx',
  indexPath: 'C:/DSHwork/models/rvc/Hogaraka/model.index',
  device: 'dml',
  pitch: 0,
  indexRate: 0.65,
  protect: 0.4,
  filterRadius: 4,
  rmsMixRate: 0.5,
  f0Method: 'rmvpe',
  timeoutMs: 180000,
  maxSeconds: 60,
  tempDir: 'C:/DSHwork/models/rvc/temp',
});
const r = await converter.convert(new Uint8Array(readFileSync('C:/DSHwork/models/rvc/samples/input-zh.wav')));
console.log(r.ok ? 'OK bytes=' + r.wav.byteLength : 'FAIL ' + r.reason + ' ' + r.message);
