const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /src=["']([^"']+)["']/g;
let match;
const sources = [];
while ((match = regex.exec(html)) !== null) {
  sources.push(match[1]);
}
console.log('Image sources found in index.html:');
sources.forEach(s => console.log('  ' + s));
