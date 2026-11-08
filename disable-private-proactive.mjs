import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/Users/demo/.dsh/dsh-qq-group/qq.json';
const j = JSON.parse(readFileSync(p, 'utf8'));

const target = j.privates?.['100000001'];
if (!target) {
  console.log('没找到 privates["100000001"]');
  process.exit(1);
}
console.log('改前 proactive.enabled =', target.proactive?.enabled);
target.proactive = { ...(target.proactive ?? {}), enabled: false };
console.log('改后 proactive.enabled =', target.proactive.enabled);

writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`, 'utf8');
console.log('已保存');
