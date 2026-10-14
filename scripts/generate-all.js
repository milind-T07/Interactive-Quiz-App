const fs = require('fs');
const path = require('path');
const { getCssQuestions } = require('./gen-css');
const { getJsQuestions } = require('./gen-js');
const { getTsQuestions } = require('./gen-ts');

console.log('Generating clean question banks...');

const css = getCssQuestions();
fs.writeFileSync(path.join(__dirname, '../data/css.json'), JSON.stringify(css, null, 2), 'utf8');
console.log(`Saved data/css.json with ${css.length} questions.`);

const js = getJsQuestions();
fs.writeFileSync(path.join(__dirname, '../data/javascript.json'), JSON.stringify(js, null, 2), 'utf8');
console.log(`Saved data/javascript.json with ${js.length} questions.`);

const ts = getTsQuestions();
fs.writeFileSync(path.join(__dirname, '../data/typescript.json'), JSON.stringify(ts, null, 2), 'utf8');
console.log(`Saved data/typescript.json with ${ts.length} questions.`);

console.log('Generation completed successfully!');
