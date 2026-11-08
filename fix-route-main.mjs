import { readFileSync, writeFileSync } from 'node:fs';

const f = 'C:/Users/demo/.dsh/profiles/desktop/node_modules/dsh-world/client/index.js';
let s = readFileSync(f, 'utf8');
if (s.includes("tab === 'digest'")) {
  console.log('already routed');
  process.exit(0);
}
const before = s;
s = s.replace(
  "tab === 'traces' ? h(Traces, {}) : null)",
  "tab === 'traces' ? h(Traces, {}) : null,\n        tab === 'digest' ? h(Digest, {}) : null)",
);
if (s === before) {
  console.log('route replace did not match');
  process.exit(1);
}
writeFileSync(f, s);
console.log('routed');
