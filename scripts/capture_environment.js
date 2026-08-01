// scripts/capture_environment.js
// Captures repository execution environment for audit
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    return '';
  }
}

const gitCommit = exec('git rev-parse HEAD');
const gitBranch = exec('git rev-parse --abbrev-ref HEAD');
let gitDirty = false;
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  gitDirty = status.trim().length > 0;
} catch (e) {
  gitDirty = false;
}

const env = {
  git: {
    commit: gitCommit,
    branch: gitBranch,
    dirty: gitDirty,
  },
  node: exec('node -v'),
  npm: exec('npm -v'),
  os: exec('uname -s') + ' ' + exec('uname -m'),
  timestamp: new Date().toISOString(),
  next: exec('npx next --version'),
  react: (() => {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
      return pkg.dependencies && pkg.dependencies.react ? pkg.dependencies.react : '';
    } catch (e) {
      return '';
    }
  })(),
};

const outDir = path.resolve(__dirname, '..', 'audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'environment.json'), JSON.stringify(env, null, 2));
console.log('environment.json written');
