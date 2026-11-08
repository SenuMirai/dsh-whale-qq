import { chooseVoiceAction } from './src/qq/voice.ts';
console.log(chooseVoiceAction('text', true, 0.8, 0.79));
console.log(chooseVoiceAction('text', true, 0.8, 0.81));
console.log(chooseVoiceAction('voice', true, 0.8, 0.81));
console.log(chooseVoiceAction('voice', false, 0.8, 0.1));
let n = 0;
for (let i = 0; i < 100000; i += 1) {
  if (chooseVoiceAction('text', true, 0.8, (i + 0.5) / 100000) === 'voice') n += 1;
}
console.log('rate', n / 100000);
