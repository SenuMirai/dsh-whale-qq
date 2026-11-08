import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createCommandRvcConverter } from './src/sound/rvc.ts';

const dir = mkdtempSync(join(tmpdir(), 'rvc-test-'));
const worker = join(dir, 'worker.py');
writeFileSync(worker, [
  'import argparse, shutil',
  'p = argparse.ArgumentParser()',
  'p.add_argument("--input", required=True)',
  'p.add_argument("--output", required=True)',
  'p.add_argument("--model", required=True)',
  'p.add_argument("--index", default="")',
  'p.add_argument("--device", default="auto")',
  'p.add_argument("--pitch", default="0")',
  'a = p.parse_args()',
  'shutil.copyfile(a.input, a.output)',
].join('\n'));
const model = join(dir, 'fake.pth');
writeFileSync(model, 'x');
const converter = createCommandRvcConverter({ pythonPath: 'python', scriptPath: worker, modelPath: model, indexPath: '', device: 'cpu', pitch: 0, timeoutMs: 10000, maxSeconds: 10 });
const wav = Buffer.alloc(44);
wav.write('RIFF', 0); wav.writeUInt32LE(36, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(8000, 28); wav.writeUInt16LE(1, 32); wav.writeUInt16LE(8, 34); wav.write('data', 36); wav.writeUInt32LE(0, 40);
const result = await converter.convert(new Uint8Array(wav));
console.log(result.ok ? 'rvc fake worker ok' : `failed: ${result.message}`);
rmSync(dir, { recursive: true, force: true });
