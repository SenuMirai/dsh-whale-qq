const fs = require('fs');
const b = fs.readFileSync('C:/Users/demo/AppData/Local/Programs/DeepSeek Harness/resources/app.asar', 'latin1');
const term = 'interface AttachmentStore';
let i = b.indexOf(term);
console.log('at', i);
console.log(b.slice(i - 500, i + 2500).replace(/[^\x20-\x7E]/g, '.'));
