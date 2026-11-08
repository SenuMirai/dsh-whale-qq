import { readFileSync, writeFileSync } from 'node:fs';

const src = 'C:/Users/demo/AppData/Local/Temp/dsh-world-056/client/index.js';
const dst = 'C:/Users/demo/.dsh/profiles/desktop/node_modules/dsh-world/client/index.js';

const s = readFileSync(src, 'utf8');
let d = readFileSync(dst, 'utf8');

if (d.includes('function Digest(props)')) {
  console.log('already has Digest');
  process.exit(0);
}

// From "function Digest" to the next "\n    function " at the same indent level.
const start = s.indexOf('    function Digest(props) {');
if (start < 0) {
  console.log('source block missing');
  process.exit(1);
}
const rest = s.indexOf('\n    function ', start + 10);
if (rest < 0) {
  console.log('end marker missing');
  process.exit(1);
}
const block = s.slice(start, rest + 1);

const anchor = d.indexOf('    function Traces(props) {');
if (anchor < 0) {
  console.log('anchor missing in target');
  process.exit(1);
}
d = d.slice(0, anchor) + block + d.slice(anchor);

// Tabs list
if (!d.includes("['digest',")) {
  d = d.replace("['traces', '记忆痕迹']]", "['traces', '记忆痕迹'], ['digest', '群里的近况']]");
}
// Route
if (!d.includes("tab === 'digest'")) {
  d = d.replace(
    "tab === 'traces' ? h(Traces, null) : null",
    "tab === 'traces' ? h(Traces, null) : null,\n        tab === 'digest' ? h(Digest, null) : null",
  );
}
writeFileSync(dst, d);
console.log('patched main, block chars', block.length);
