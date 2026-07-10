const fs = require('fs');
const path = require('path');

function getFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, filter));
    } else if (file.endsWith(filter)) {
      results.push(fullPath);
    }
  });
  return results;
}

// 1 & 2. Verify page.tsx and 'use client'
const appDir = path.join(__dirname, '..', 'app');
const pageFiles = getFiles(appDir, 'page.tsx');
let clientPagesCount = 0;
const clientPagesList = [];

pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('use client') || content.includes("use client")) {
    clientPagesCount++;
    clientPagesList.push(path.relative(path.join(__dirname, '..'), file));
  }
});

console.log('--- PAGES VERIFICATION ---');
console.log('Total page.tsx files under app/:', pageFiles.length);
console.log('Client page.tsx files under app/:', clientPagesCount);
console.log('Percentage of client pages:', ((clientPagesCount / pageFiles.length) * 100).toFixed(2) + '%');
console.log('Client pages list:', clientPagesList);

// 3. Verify hardcoded color occurrences
const componentsDir = path.join(__dirname, '..', 'components');
const sourceFiles = [
  ...getFiles(appDir, '.tsx'),
  ...getFiles(appDir, '.ts'),
  ...getFiles(componentsDir, '.tsx'),
  ...getFiles(componentsDir, '.ts')
];

let colorCount = 0;
const hexRegex = /\[#[A-Fa-f0-9]{3,8}\]/g;

sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(hexRegex);
  if (matches) {
    colorCount += matches.length;
  }
});

console.log('\n--- COLOR VERIFICATION ---');
console.log('Total arbitrary color hex codes found (e.g., [#151515]):', colorCount);
