import { writeFileSync } from 'node:fs';
import { Speaker } from './src/sound/tts.ts';
const speaker = new Speaker({ userRoot: 'C:/DSHwork/models/tts/test-root', cache: { dir: 'C:/DSHwork/models/tts/test-cache-fallback' } });
const r = await speaker.speak('语音回退测试。', { provider: 'gpt-sovits', endpoint: 'http://127.0.0.1:59999' });
if (!r.ok) { console.log('FAIL', r.reason, r.message); process.exit(1); }
writeFileSync('C:/DSHwork/models/tts/samples/fallback-edge.wav', r.mp3);
console.log('OK fallback bytes', r.mp3.length);
