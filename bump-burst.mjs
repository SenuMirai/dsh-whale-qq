import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/Users/demo/.dsh/dsh-qq-group/qq.json';
const j = JSON.parse(readFileSync(p, 'utf8'));

const before = JSON.stringify(j.privates ?? {}) + JSON.stringify(j.defaultPrivate ?? {});
console.log('defaultPrivate burst before:', JSON.stringify(j.defaultPrivate?.burst));

if (j.defaultPrivate && j.defaultPrivate.burst) {
  j.defaultPrivate.burst.min = 1;
  j.defaultPrivate.burst.max = 5;
}
for (const key of Object.keys(j.privates ?? {})) {
  const item = j.privates[key];
  if (item && item.burst) {
    item.burst.min = 1;
    item.burst.max = 5;
  }
}

writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`, 'utf8');
console.log('defaultPrivate burst after :', JSON.stringify(j.defaultPrivate?.burst));
