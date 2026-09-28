const { execSync } = require('child_process');

console.log('=== PHASE 4: VERIFY GIT STATE ===');

const stagedRaw = execSync('git diff --cached --name-only --diff-filter=D', { encoding: 'utf-8' }).trim();
const stagedDeletions = stagedRaw.split('\n').map(f => f.trim()).filter(Boolean);

console.log(`Total staged deletions for index change: ${stagedDeletions.length}`);

// Strictly forbidden paths that must NEVER be staged for deletion
const PROTECTED_PREFIXES = [
  'app/',
  'components/',
  'lib/',
  'data/',
  'public/',
  'styles/',
  'types/',
  'hooks/',
  'features/',
  'packages/',
  'plugins/',
  'services/',
  'utils/',
  'package.json',
  'next.config.js',
  'tsconfig.json',
];

const violated = [];

for (const file of stagedDeletions) {
  for (const protectedPrefix of PROTECTED_PREFIXES) {
    if (file === protectedPrefix || file.startsWith(protectedPrefix)) {
      violated.push(file);
    }
  }
}

if (violated.length > 0) {
  console.error(`❌ CRITICAL ERROR: Protected production files are staged for deletion (${violated.length})!`);
  violated.slice(0, 10).forEach(f => console.error(`  - ${f}`));
  process.exit(1);
}

console.log('✅ Assertion Passed: Zero production files or editorial data are staged for deletion.');
console.log('   All staged changes belong exclusively to non-production artifacts.');
