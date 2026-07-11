const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else callback(p);
  });
};

const mapImports = {
  'StoryJSON': 'Story',
  'EntityJSON': 'Entity',
  'TopicJSON': 'Topic',
  'HomepageJSON': 'HomepageViewModel',
  'FixJSON': 'Fix'
};

const dirs = ['components', 'hooks', 'app'];
let affectedFiles = [];

dirs.forEach(d => {
  walk(d, (p) => {
    if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      if (content.includes('utils/types')) {
        affectedFiles.push(p);
        
        // Replace import path
        content = content.replace(/from\s+['"](@\/)?(\.\.\/)*utils\/types['"]/g, "from '@/types/canonical'");
        
        // Replace types
        for (const [oldType, newType] of Object.entries(mapImports)) {
          content = content.replace(new RegExp('\\b' + oldType + '\\b', 'g'), newType);
        }
        
        fs.writeFileSync(p, content, 'utf8');
      }
    }
  });
});

console.log('Modified files:', affectedFiles.length);
console.log(affectedFiles.join('\n'));
