import fs from 'fs';
import path from 'path';

function walk(dir: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const svgs = walk('public').filter(f => f.endsWith('.svg'));
console.log('Auditing and adding accessibility tags to SVGs...');

for (const svgPath of svgs) {
  let content = fs.readFileSync(svgPath, 'utf8');
  if (content.includes('<title>') || content.includes('<desc>')) {
    continue;
  }

  const basename = path.basename(svgPath, '.svg');
  const humanTitle = basename
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  // Insert <title> and <desc> right after <svg ...>
  const svgTagMatch = content.match(/<svg[^>]*>/i);
  if (svgTagMatch) {
    const titleTag = `\n  <title id="title-${basename}">${humanTitle} — The Breakdown</title>\n  <desc id="desc-${basename}">Visual knowledge graphic illustrating ${humanTitle} for The Breakdown Knowledge Platform.</desc>`;
    const updated = content.replace(svgTagMatch[0], svgTagMatch[0] + titleTag);
    fs.writeFileSync(svgPath, updated);
    console.log(`✓ Added <title> and <desc> to ${path.relative('public', svgPath)}`);
  }
}

console.log('All SVGs now have structured accessibility tags.');
