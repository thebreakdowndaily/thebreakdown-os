import fs from 'node:fs';

const content = fs.readFileSync('LOOP_TOC_INTEGRITY.csv', 'utf8');
const lines = content.trim().split('\n').slice(1);
const failures = lines.filter(l => l.includes(',false,') || l.includes(',true,'));
console.log('Total failing lines:', failures.length);
const types: Record<string, number> = {};
for (const f of failures) {
  const parts = f.split(',');
  const reason = parts[parts.length - 1];
  types[reason] = (types[reason] || 0) + 1;
}
console.log('Failure types:', types);
const sampleStories = failures.map(f => f.split(',')[0]).slice(0, 10);
console.log('Sample failing stories:', [...new Set(sampleStories)]);
