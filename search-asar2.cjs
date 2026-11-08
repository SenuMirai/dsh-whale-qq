const fs = require('fs');
const p = 'C:/Users/demo/AppData/Local/Programs/DeepSeek Harness/resources/app.asar';
const b = fs.readFileSync(p, 'latin1');
const term = '"--no-open"';
let i = b.indexOf(term);
console.log('at', i);
console.log(b.slice(i - 2500, i + 1500).replace(/[^\x20-\x7E]/g, '.'));
