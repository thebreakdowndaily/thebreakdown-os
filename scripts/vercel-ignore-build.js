// scripts/vercel-ignore-build.js
// Vercel Ignored Build Step Filter (Loop 2 Architecture)
//
// Vercel Semantics:
//   Exit Code 0 = Cancel / Skip build (saves build minutes and deployment storage)
//   Exit Code 1 = Proceed with build (standard deployment)
//
// Core Principle:
//   FAIL-SAFE TO BUILD. An unknown, ambiguous, or unrecognized file MUST always trigger a build.
//   A deployment is skipped IF AND ONLY IF every single changed file is verified to be
//   strictly non-production (documentation, QA screenshots, test specs, local dev tools).

const { execSync } = require('child_process');
const path = require('path');

// Explicit non-production paths. If a changed file matches one of these prefixes or patterns,
// it is confirmed to have zero effect on the production application bundle or runtime.
const NON_PRODUCTION_PREFIXES = [
  'docs/',
  'audit/',
  'audit_reports/',
  'screenshots/',
  'tests/',
  'fixtures/',
  'specs/',
  'rfc/',
  'adr/',
  'wiki/',
  'workflows/',
  '.github/',
  '.gitlab/',
  '.vscode/',
  '.agents/',
  '.ai/',
  '.opencode/',
  '.storybook/',
  'coverage/',
  'dist-static/',
  '.open-next/',
];

function isNonProductionFile(file) {
  const normalized = file.replace(/\\/g, '/');

  // 1. Check directory prefixes
  for (const prefix of NON_PRODUCTION_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return true;
    }
  }

  // 2. Check root-level documentation and audit markdown files
  const filename = path.basename(normalized);
  if (normalized === filename) {
    // File is in root directory
    if (
      filename.endsWith('.md') ||
      filename.endsWith('.txt') ||
      filename.startsWith('lint') ||
      filename.startsWith('test-') ||
      filename.startsWith('deployment-storage-') ||
      filename === '.editorconfig' ||
      filename === 'LICENSE'
    ) {
      return true;
    }
  }

  // Any other file (including anything in app, components, lib, data, utils, public, config)
  // is treated as a potential production dependency!
  return false;
}

function evaluateBuild() {
  try {
    // Use Vercel's previous/current SHA when available, otherwise compare HEAD~1 HEAD
    let diffCmd = 'git diff HEAD~1 HEAD --name-only';
    if (process.env.VERCEL_GIT_PREVIOUS_SHA && process.env.VERCEL_GIT_COMMIT_SHA) {
      diffCmd = `git diff ${process.env.VERCEL_GIT_PREVIOUS_SHA} ${process.env.VERCEL_GIT_COMMIT_SHA} --name-only`;
    }

    const diffRaw = execSync(diffCmd, { encoding: 'utf-8' }).trim();
    if (!diffRaw) {
      console.log('ℹ️ No git diff detected between commits. Defaulting to PROCEED WITH BUILD (code 1).');
      process.exit(1);
    }

    const changedFiles = diffRaw.split('\n').map(f => f.trim()).filter(Boolean);
    console.log(`📋 Evaluating ${changedFiles.length} changed file(s):`);

    const productionFiles = [];
    const nonProductionFiles = [];

    for (const file of changedFiles) {
      if (isNonProductionFile(file)) {
        nonProductionFiles.push(file);
      } else {
        productionFiles.push(file);
      }
    }

    if (productionFiles.length > 0) {
      console.log(`✅ Production dependencies modified (${productionFiles.length} file(s)):`);
      productionFiles.slice(0, 5).forEach(f => console.log(`   - ${f}`));
      if (productionFiles.length > 5) console.log(`   ...and ${productionFiles.length - 5} more.`);
      console.log('🚀 Decision: PROCEED WITH BUILD (Exit Code 1)');
      process.exit(1);
    }

    console.log(`🛑 All changed files are strictly non-production (${nonProductionFiles.length} file(s)):`);
    nonProductionFiles.slice(0, 5).forEach(f => console.log(`   - ${f}`));
    if (nonProductionFiles.length > 5) console.log(`   ...and ${nonProductionFiles.length - 5} more.`);
    console.log('💤 Decision: CANCEL BUILD (Exit Code 0) — Deployment storage conserved.');
    process.exit(0);

  } catch (err) {
    console.warn(`⚠️ Error evaluating diff (${err.message}). FAIL-SAFE TRIGGERED: PROCEED WITH BUILD (code 1).`);
    process.exit(1);
  }
}

evaluateBuild();
