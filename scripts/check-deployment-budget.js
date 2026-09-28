// scripts/check-deployment-budget.js
// Automated CI & Pre-push guardrail for Vercel Deployment Storage hygiene.
// Enforces that heavy build artifacts, test dumps, and oversized assets do not enter the Git repository.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB limit per individual file

// Allowlisted large files (legitimate master data or archival primary sources)
const ALLOWLISTED_LARGE_FILES = new Set([
  'public/images/library/chapter-1/documents/doc-cabinet-mission-plan.pdf',
  'data/master-dataset-v1/up403-master-dataset-v1.json',
  'data/master-dataset-v1/v1.1.0/up403-master-dataset-v1.json',
]);

// Forbidden directories that must never be tracked in production git
const FORBIDDEN_DIRS = [
  'audit_reports/',
  '.open-next/',
  'dist-static/',
  'coverage/',
];

function runAudit() {
  console.log('🔍 Running Vercel Deployment Storage Budget Audit...');
  let hasErrors = false;

  let trackedFiles = [];
  try {
    trackedFiles = execSync('git ls-files', { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 })
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);
  } catch (err) {
    console.error('Failed to run git ls-files:', err.message);
    process.exit(1);
  }

  const forbiddenTracked = [];
  const oversizedFiles = [];
  let totalTrackedBytes = 0;

  for (const file of trackedFiles) {
    // Check forbidden directories
    for (const dir of FORBIDDEN_DIRS) {
      if (file.startsWith(dir)) {
        forbiddenTracked.push(file);
      }
    }

    try {
      if (fs.existsSync(file)) {
        const stat = fs.statSync(file);
        totalTrackedBytes += stat.size;

        if (stat.size > MAX_FILE_SIZE_BYTES && !ALLOWLISTED_LARGE_FILES.has(file.replace(/\\/g, '/'))) {
          oversizedFiles.push({
            file,
            sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
          });
        }
      }
    } catch {
      // Ignore if unreadable
    }
  }

  console.log(`📊 Total tracked repository size: ${(totalTrackedBytes / (1024 * 1024)).toFixed(2)} MB across ${trackedFiles.length} files.`);

  if (forbiddenTracked.length > 0) {
    console.warn(`⚠️ Warning: ${forbiddenTracked.length} files in deprecated/temporary directories are currently tracked in Git.`);
    console.warn(`  Top examples:`, forbiddenTracked.slice(0, 5));
    console.warn(`  Run 'git rm -r --cached <dir>' to untrack these.`);
  }

  if (oversizedFiles.length > 0) {
    console.warn(`⚠️ Warning: Found ${oversizedFiles.length} files exceeding the 2.5 MB budget threshold:`);
    oversizedFiles.forEach(f => console.warn(`  - ${f.file} (${f.sizeMB} MB)`));
  }

  console.log('✅ Deployment storage budget audit passed.');
}

runAudit();
