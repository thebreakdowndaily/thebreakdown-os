import fs from 'fs';
import path from 'path';

const mapFiles = [
  'public/images/library/chapter-1/maps/map-british-india-1939.svg',
  'public/images/library/chapter-1/maps/map-cabinet-mission-1946.svg',
  'public/images/library/chapter-1/maps/map-demography-1941.svg',
  'public/images/library/chapter-1/maps/map-kashmir-1947.svg',
  'public/images/library/chapter-1/maps/map-migration-flows-1947.svg',
  'public/images/library/chapter-1/maps/map-princely-states.svg',
  'public/images/library/chapter-1/maps/map-radcliffe-line.svg',
];

console.log('=== MAP FORENSICS AUDIT ===');

for (const mapPath of mapFiles) {
  const content = fs.readFileSync(mapPath, 'utf8');
  const size = fs.statSync(mapPath).size;
  const vbMatch = content.match(/viewBox=["']([^"']+)["']/i);
  
  // Extract text labels
  const textMatches = [...content.matchAll(/<text[^>]*>([^<]+)<\/text>/gi)].map(m => m[1].trim());
  
  // Extract path and polygon count
  const pathCount = (content.match(/<path/gi) || []).length;
  const polyCount = (content.match(/<polygon/gi) || []).length;

  console.log(`\nMap: ${path.basename(mapPath)}`);
  console.log(`  Size: ${size} bytes | viewBox: ${vbMatch ? vbMatch[1] : 'NONE'} | Paths: ${pathCount} | Polygons: ${polyCount}`);
  console.log(`  Labels sample (${textMatches.length} total):`, textMatches.slice(0, 10).join(', '));
}
