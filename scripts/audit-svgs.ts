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

const allFiles = walk('public');
const svgFiles = allFiles.filter(f => {
  if (f.endsWith('.svg')) return true;
  try {
    const head = fs.readFileSync(f, 'utf8').slice(0, 100);
    return head.includes('<svg') || head.includes('<?xml');
  } catch {
    return false;
  }
});

console.log('=== SVG FORENSICS AUDIT ===');
console.log('Total SVG / vector files detected:', svgFiles.length);

interface SvgAudit {
  file: string;
  hasViewBox: boolean;
  viewBox: string;
  hasWidthHeight: boolean;
  hasScripts: boolean;
  hasExternalRefs: boolean;
  externalRefs: string[];
  hasEmbeddedRaster: boolean;
  hasTitleOrDesc: boolean;
  size: number;
}

const audits: SvgAudit[] = [];

for (const file of svgFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const hasViewBox = /viewBox=["'][^"']+["']/i.test(content);
  const vbMatch = content.match(/viewBox=["']([^"']+)["']/i);
  const hasWidthHeight = /width=["'][^"']+["']/i.test(content) && /height=["'][^"']+["']/i.test(content);
  const hasScripts = /<script/i.test(content);
  
  // External references
  const hrefMatches = [...content.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)].map(m => m[1]);
  const hasExternalRefs = hrefMatches.length > 0;
  const hasEmbeddedRaster = /data:image\/(png|jpeg|webp)/i.test(content);
  const hasTitleOrDesc = /<title/i.test(content) || /<desc/i.test(content);

  audits.push({
    file: file.replace(/\\/g, '/'),
    hasViewBox,
    viewBox: vbMatch ? vbMatch[1] : 'NONE',
    hasWidthHeight,
    hasScripts,
    hasExternalRefs,
    externalRefs: hrefMatches,
    hasEmbeddedRaster,
    hasTitleOrDesc,
    size: fs.statSync(file).size,
  });
}

console.log('\n--- SECURITY & PAYLOAD AUDIT ---');
const withScripts = audits.filter(a => a.hasScripts);
console.log('SVGs with <script> tags:', withScripts.length);
if (withScripts.length > 0) console.error('SECURITY ALERT:', withScripts.map(a => a.file));

const withExtRefs = audits.filter(a => a.hasExternalRefs);
console.log('SVGs with external HTTP/HTTPS refs:', withExtRefs.length);
if (withExtRefs.length > 0) console.log('External refs:', withExtRefs.map(a => ({ file: a.file, refs: a.externalRefs })));

const withRaster = audits.filter(a => a.hasEmbeddedRaster);
console.log('SVGs with embedded raster images:', withRaster.length);

const missingViewBox = audits.filter(a => !a.hasViewBox);
console.log('SVGs missing viewBox:', missingViewBox.length);
if (missingViewBox.length > 0) console.log('Missing viewBox:', missingViewBox.map(a => a.file));

console.log('\n--- SVG ACCESSIBILITY AUDIT ---');
const withoutTitle = audits.filter(a => !a.hasTitleOrDesc);
console.log('SVGs without <title> or <desc> tags:', withoutTitle.length, '/', audits.length);
