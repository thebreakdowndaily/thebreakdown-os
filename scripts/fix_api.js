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

  // Replace `(db().from('table') as any)` -> `db().from('table')`
  // Except for nodes, edges, claims, sources
  content = content.replace(/\(db\(\)\.from\('([^']+)'\) as any\)/g, function(match, p1) {
    if (p1 === 'nodes' || p1 === 'edges' || p1 === 'claims' || p1 === 'sources') {
      return `(db().from('${p1}') as any)`;
    }
    return `db().from('${p1}')`;
  });
  
  // Replace db().from('table').update(body) -> db().from('table').update(body as import('@/supabase/schema').Database['public']['Tables']['table']['Update'])
  content = content.replace(/db\(\)\.from\('([^']+)'\)\.update\(body\)/g, function(match, p1) {
    return `db().from('${p1}').update(body as import('@/supabase/schema').Database['public']['Tables']['${p1}']['Update'])`;
  });

  // Replace db().from('table').insert(body) -> db().from('table').insert(body as import('@/supabase/schema').Database['public']['Tables']['table']['Insert'])
  content = content.replace(/db\(\)\.from\('([^']+)'\)\.insert\(body\)/g, function(match, p1) {
    return `db().from('${p1}').insert(body as import('@/supabase/schema').Database['public']['Tables']['${p1}']['Insert'])`;
  });

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
