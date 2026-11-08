import { Speaker } from './src/sound/tts.ts';
const s=new Speaker({userRoot:'C:/DSHwork/models/tts/test-root',cache:{dir:'C:/DSHwork/models/tts/test-cache-edge'}});
const t=Date.now();
const r=await s.speak('语音回退测试。',{provider:'edge'});
console.log(r.ok?'OK '+r.mp3.length:'FAIL '+r.reason+' '+r.message,'ms',Date.now()-t);
