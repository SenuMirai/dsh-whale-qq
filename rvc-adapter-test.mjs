import { readFileSync } from 'node:fs';
import { createCommandRvcConverter } from './src/sound/rvc.ts';
const converter = createCommandRvcConverter({
  pythonPath: 'C:/DSHwork/models/rvc/venv/Scripts/python.exe',
  scriptPath: 'C:/DSHwork/models/rvc/rvc_worker.py',
  modelPath: 'C:/DSHwork/models/rvc/Hogaraka/model.pth',
  indexPath: 'C:/DSHwork/models/rvc/Hogaraka/model.index',
  device: 'cpu',
  pitch: 0,
  timeoutMs: 180000,
  maxSeconds: 60,
});
const input = readFileSync('C:/DSHwork/models/rvc/samples/input-zh.wav');
const result = await converter.convert(new Uint8Array(input));
console.log(result.ok ? `adapter ok, bytes=${result.wav.byteLength}` : `adapter failed: ${result.reason} ${result.message}`);
