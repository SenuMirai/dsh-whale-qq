const fs = require('fs');
const b = fs.readFileSync('C:/Users/demo/AppData/Local/Programs/DeepSeek Harness/resources/app.asar', 'latin1');
const terms = ['"ImageInput"', 'ImageInput {', 'ImageInput =', 'saveImages(inputs)', 'mediaType: input.mediaType'];
for (const t of terms) {
  let i = -1;
  let n = 0;
  while ((i = b.indexOf(t, i + 1)) >= 0 && n < 4) {
    console.log('TERM', JSON.stringify(t), 'AT', i);
    console.log(b.slice(Math.max(0, i - 700), i + 900).replace(/[^\x20-\x7E]/g, '.'));
    n += 1;
  }
}
