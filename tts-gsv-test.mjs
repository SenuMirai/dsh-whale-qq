import { writeFileSync } from 'node:fs';
import { Speaker } from './src/sound/tts.ts';
const speaker = new Speaker({ userRoot: 'C:/DSHwork/models/tts/test-root', cache: { dir: 'C:/DSHwork/models/tts/test-cache-gsv' } });
const started = Date.now();
const r = await speaker.speak('你好，我是助手。', { provider: 'gpt-sovits', endpoint: 'http://127.0.0.1:50123' });
if (!r.ok) { console.log('FAIL', r.reason, r.message); process.exit(1); }
writeFileSync('C:/DSHwork/models/tts/gpt-sovits/samples/speaker-gsv.wav', r.mp3);
console.log('OK', r.mp3.length, 'ms', Date.now() - started);
