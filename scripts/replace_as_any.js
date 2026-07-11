const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('app/api/v2');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/\(db\(\)\.from\('([^']+)'\) as any\)/g, function(match, p1) {
    if (p1 === 'nodes' || p1 === 'edges' || p1 === 'claims' || p1 === 'sources') {
      return `(db().from('${p1}') as any)`; // Skip these because they are missing from schema or not fully typed
    }
    return `db().from('${p1}')`;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
