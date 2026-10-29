const fs = require('fs');
const path = require('path');

const ROOT = 'c:\\Users\\gopal\\OneDrive\\Desktop\\Luxure Nest\\LuxureNest_Subdomain_Page';

const missing = [];
const verified = [];

function check(relPath, source) {
  // Strip query string if any
  const clean = relPath.split('?')[0].replace(/^\//, '');
  const full = path.join(ROOT, clean);
  if (fs.existsSync(full)) {
    verified.push({ clean, source });
  } else {
    missing.push({ clean, source });
  }
}

// 1. Check index.html
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const srcRegex = /(?:src|srcset)=["']([^"']+)["']/g;
let m;
while ((m = srcRegex.exec(indexHtml)) !== null) {
  const val = m[1];
  if (!val.startsWith('http') && !val.startsWith('data:')) {
    check(val, 'index.html');
  }
}

// 2. Check thank-you.html
const tyHtml = fs.readFileSync(path.join(ROOT, 'thank-you.html'), 'utf8');
while ((m = srcRegex.exec(tyHtml)) !== null) {
  const val = m[1];
  if (!val.startsWith('http') && !val.startsWith('data:')) {
    check(val, 'thank-you.html');
  }
}

// 3. Check data/images.js
const imagesJs = fs.readFileSync(path.join(ROOT, 'data', 'images.js'), 'utf8');
const jsImgRegex = /src:\s*['"]([^'"]+)['"]/g;
while ((m = jsImgRegex.exec(imagesJs)) !== null) {
  check(m[1], 'data/images.js');
}

// 4. Check CSS files
const cssFiles = ['base.css', 'layout.css', 'components.css', 'responsive.css'];
cssFiles.forEach(cf => {
  const css = fs.readFileSync(path.join(ROOT, 'css', cf), 'utf8');
  const cssUrlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
  let cm;
  while ((cm = cssUrlRegex.exec(css)) !== null) {
    const u = cm[1];
    if (!u.startsWith('http') && !u.startsWith('data:') && !u.startsWith('#')) {
      // CSS relative to css/ folder or root
      let target = u;
      if (u.startsWith('../')) {
        target = u.replace('../', '');
      }
      check(target, `css/${cf}`);
    }
  }
});

console.log(`Verified Assets Count: ${verified.length}`);
console.log(`Missing Assets Count: ${missing.length}`);
if (missing.length > 0) {
  console.log('MISSING ASSETS:');
  missing.forEach(x => console.log(`  ${x.clean} (from ${x.source})`));
} else {
  console.log('ALL ASSET PATHS 100% VERIFIED ON DISK!');
}
