import { readFileSync } from 'node:fs';
import { createCommandRvcConverter } from './src/sound/rvc.ts';
const converter = createCommandRvcConverter({
  pythonPath: 'C:/DSHwork/models/rvc/venv-onnx/Scripts/python.exe',
  scriptPath: 'C:/DSHwork/models/rvc/rvc_onnx_worker.py',
  modelPath: 'C:/DSHwork/models/rvc/Hogaraka/model.onnx',
  indexPath: 'C:/DSHwork/models/rvc/Hogaraka/model.index',
  device: 'dml',
  pitch: 0,
  timeoutMs: 180000,
  maxSeconds: 60,
  tempDir: 'C:/DSHwork/models/rvc/cache-test',
});
const input = readFileSync('C:/DSHwork/models/rvc/samples/input-zh.wav');
const started = Date.now();
const result = await converter.convert(new Uint8Array(input));
console.log(result.ok ? `onnx adapter ok, bytes=${result.wav.byteLength}, ms=${Date.now() - started}` : `onnx adapter failed: ${result.reason} ${result.message}`);
