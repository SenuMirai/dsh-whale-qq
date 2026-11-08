import { readFileSync, writeFileSync } from 'node:fs';

const f = 'C:/Users/demo/.dsh/profiles/desktop/node_modules/dsh-world/client/index.js';
let s = readFileSync(f, 'utf8');

const before = s;
s = s.replace(
  "['diary', '日记'], ['traces', '记忆痕迹']]",
  "['diary', '日记'], ['traces', '记忆痕迹'], ['digest', '群里的近况']]",
);
if (s === before) {
  console.log('TABS replace did not match');
} else {
  writeFileSync(f, s);
  console.log('TABS updated');
}
