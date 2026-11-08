import { writeFileSync } from 'node:fs';
import { Speaker } from './src/sound/tts.ts';

const speaker = new Speaker({ userRoot: 'C:/DSHwork/models/tts/test-root', cache: { dir: 'C:/DSHwork/models/tts/test-cache' } });
const result = await speaker.speak('你好，我是助手。', {
  provider: 'cosyvoice',
  endpoint: 'http://127.0.0.1:50121',
  style: '开心、撒娇',
});
if (!result.ok) {
  console.log('FAIL', result.reason, result.message);
  process.exit(1);
}
writeFileSync('C:/DSHwork/models/tts/samples/speaker-cosyvoice.wav', result.mp3);
console.log('OK bytes', result.mp3.length, 'cached', result.cached);
