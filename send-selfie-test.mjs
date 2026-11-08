import { OneBotClient } from './src/qq/onebot.ts';
import { readFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync('C:/Users/demo/.dsh/dsh-qq-group/qq.json', 'utf8'));
const client = new OneBotClient({
  url: cfg.url,
  httpUrl: cfg.httpUrl,
  token: cfg.token,
  log: (level, message) => console.log(level, message),
});
client.on('error', (e) => console.log('ERR', e.message));
client.on('state', (s) => console.log('STATE', s.status));
client.connect();
await new Promise((r) => setTimeout(r, 4000));
const file = 'C:/Users/demo/.dsh/dsh-qq-group/selfies/1792679415368-20261022-124120-摇尾巴-扭屁股-可爱-009e724c-fc595323009e724c.gif';
const result = await client.sendPrivateMsg('100000001', [{ type: 'image', data: { file } }]);
console.log('SEND', JSON.stringify(result));
client.close();
