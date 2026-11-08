import { readFileSync, writeFileSync } from 'node:fs';

const targets = [
  'C:/Users/demo/AppData/Local/Temp/dsh-world-056/client/index.js',
  'C:/Users/demo/.dsh/profiles/world-wechat-test/node_modules/dsh-world/client/index.js',
];

for (const f of targets) {
  let s = readFileSync(f, 'utf8');
  if (s.includes('function Digest(props)')) {
    console.log('already', f);
    continue;
  }
  // Pull the Digest component out of the working main copy so both stay identical.
  const main = readFileSync('C:/Users/demo/.dsh/profiles/desktop/node_modules/dsh-world/client/index.js', 'utf8');
  const start = main.indexOf('    function Digest(props) {');
  const end = main.indexOf('\n    function ', start + 10);
  if (start < 0 || end < 0) {
    console.log('cannot extract from main');
    continue;
  }
  const block = main.slice(start, end + 1);

  // 0.5.6 uses no leading indent for these component functions.
  const anchor = 'function Traces(props) {';
  if (!s.includes(anchor)) {
    console.log('anchor missing', f);
    continue;
  }
  s = s.replace(anchor, block + anchor);
  writeFileSync(f, s);
  console.log('patched', f);
}
