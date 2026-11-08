const fs = require('fs');
const b = fs.readFileSync('C:/Users/demo/AppData/Local/Programs/DeepSeek Harness/resources/app.asar', 'latin1');
for (const t of ['data: Uint8Array', 'mediaType: ImageMediaType', 'interface ImageFile', 'ImageFileInput', 'prepareImageFile(input']) {
  let i = -1;
  let n = 0;
  while ((i = b.indexOf(t, i + 1)) >= 0 && n < 3) {
    console.log('TERM', JSON.stringify(t), 'AT', i);
    console.log(b.slice(Math.max(0, i - 800), i + 1200).replace(/[^\x20-\x7E]/g, '.'));
    n += 1;
  }
}
