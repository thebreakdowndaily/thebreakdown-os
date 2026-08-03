import * as fs from 'fs';
import * as path from 'path';
import {
  decideIntelAccess,
  guardIntel,
  intelModuleFromPath,
  type IntelSessionLike,
} from '../features/auth/intel-auth';
import {
  INTEL_MODULES,
  normalizeIntelRole,
  canAccessIntelModule,
  intelModulesForRole,
  type IntelModule,
  type IntelRole,
} from '../features/auth/roles';

const REPO_ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function assert(cond: boolean, message: string) {
  if (cond) {
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

function sessionWithRole(role: string | null): IntelSessionLike {
  return { user: { role } };
}

const NO_SESSION = null;

// ────────────────────────────────────────────────
// 1. Role normalization — no silent privilege escalation, no unexpected downgrade
// ────────────────────────────────────────────────
function testRoleNormalization() {
  console.log('\n=== 1. Role Normalization ===');

  assert(normalizeIntelRole(null) === 'guest', 'null role → guest');
  assert(normalizeIntelRole(undefined) === 'guest', 'undefined role → guest');
  assert(normalizeIntelRole('') === 'guest', 'empty role → guest');
  assert(normalizeIntelRole('reader') === 'guest', 'public reader role → guest (minimum capability)');
  assert(normalizeIntelRole('unknown_role') === 'guest', 'unknown role → guest');
  assert(normalizeIntelRole('EDITOR') === 'editor', 'role normalized to lowercase');
  assert(normalizeIntelRole('managing_editor') === 'managing_editor', 'managing_editor preserved');
  assert(normalizeIntelRole('Managing Editor') === 'managing_editor', 'spaced label normalized to managing_editor');
  assert(normalizeIntelRole('owner') === 'owner', 'owner preserved');
  assert(normalizeIntelRole('fact_checker') === 'fact_checker', 'fact_checker preserved');
}

// ────────────────────────────────────────────────
// 2. Authorization matrix — module permission per role
// ────────────────────────────────────────────────
function testAuthorizationMatrix() {
  console.log('\n=== 2. Authorization Matrix ===');

  const expect = (role: IntelRole, module: IntelModule, allowed: boolean, label: string) => {
    assert(canAccessIntelModule(role, module) === allowed, `${label}`);
  };

  // guest: dashboard only
  for (const m of INTEL_MODULES) {
    expect('guest', m, m === 'dashboard', `guest → ${m} ${m === 'dashboard' ? 'allowed' : 'denied'}`);
  }

  // fact_checker: + verification
  for (const m of INTEL_MODULES) {
    const allowed = m === 'dashboard' || m === 'verification';
    expect('fact_checker', m, allowed, `fact_checker → ${m} ${allowed ? 'allowed' : 'denied'}`);
  }

  // researcher: + research, rti, candidates (still not watch-list/predictions/scenarios)
  for (const m of INTEL_MODULES) {
    const allowed = m === 'dashboard' || m === 'verification' || m === 'research' || m === 'rti' || m === 'candidates';
    expect('researcher', m, allowed, `researcher → ${m} ${allowed ? 'allowed' : 'denied'}`);
  }
  assert(canAccessIntelModule('researcher', 'watch-list') === false, 'researcher cannot access watch-list');
  assert(canAccessIntelModule('researcher', 'predictions') === false, 'researcher cannot access predictions');

  // reporter: + media, toolkit, tasks (still not research/editorial)
  for (const m of INTEL_MODULES) {
    const allowed = ['dashboard', 'verification', 'research', 'rti', 'candidates', 'media', 'toolkit', 'tasks'].includes(m);
    expect('reporter', m, allowed, `reporter → ${m} ${allowed ? 'allowed' : 'denied'}`);
  }
  assert(canAccessIntelModule('reporter', 'editorial') === false, 'reporter cannot access editorial');

  // analyst: + watch-list, predictions, scenarios
  for (const m of INTEL_MODULES) {
    const allowed = ['dashboard', 'verification', 'research', 'rti', 'candidates', 'media', 'toolkit', 'tasks', 'watch-list', 'predictions', 'scenarios'].includes(m);
    expect('analyst', m, allowed, `analyst → ${m} ${allowed ? 'allowed' : 'denied'}`);
  }
  assert(canAccessIntelModule('analyst', 'editorial') === false, 'analyst cannot access editorial');

  // editor: all modules except managing_editor/owner-specific (none exist at module level)
  for (const m of INTEL_MODULES) {
    expect('editor', m, true, `editor → ${m} allowed`);
  }

  // managing_editor / owner: all
  for (const m of INTEL_MODULES) {
    expect('managing_editor', m, true, `managing_editor → ${m} allowed`);
    expect('owner', m, true, `owner → ${m} allowed`);
  }

  // reader (public) is never granted anything beyond guest dashboard
  const readerModules = intelModulesForRole('reader');
  assert(readerModules.length === 1 && readerModules[0] === 'dashboard', 'reader resolves to dashboard-only (minimum capability)');

  // module set integrity
  assert(INTEL_MODULES.length === 13, '13 modules registered');
  assert(new Set(INTEL_MODULES).size === 13, 'module names unique');
}

// ────────────────────────────────────────────────
// 3. decideIntelAccess — pure decision logic
// ────────────────────────────────────────────────
function testDecideIntelAccess() {
  console.log('\n=== 3. decideIntelAccess ===');

  const denied = decideIntelAccess('predictions', 'guest');
  assert(denied.status === 'denied', 'guest denied predictions');
  assert(denied.status === 'denied' && denied.role === 'guest' && denied.roleLabel === 'Guest', 'denied decision carries role + label');

  const allowed = decideIntelAccess('predictions', 'analyst');
  assert(allowed.status === 'authorized' && allowed.role === 'analyst', 'analyst authorized predictions');

  const reader = decideIntelAccess('predictions', 'reader');
  assert(reader.status === 'denied', 'reader (public) denied predictions');

  const editor = decideIntelAccess('editorial', 'editor');
  assert(editor.status === 'authorized', 'editor authorized editorial');

  const reporter = decideIntelAccess('editorial', 'reporter');
  assert(reporter.status === 'denied', 'reporter denied editorial');

  const dash = decideIntelAccess('dashboard', null);
  assert(dash.status === 'authorized', 'any authenticated null-role (guest) authorized dashboard');
}

// ────────────────────────────────────────────────
// 4. guardIntel — session-loading boundary
// ────────────────────────────────────────────────
async function testGuardIntel() {
  console.log('\n=== 4. guardIntel (server gate) ===');

  // anonymous / expired session → never authorized
  const anon = await guardIntel('predictions', async () => NO_SESSION);
  assert(anon.authorized === false && anon.reason === 'unauthenticated', 'anonymous → unauthenticated');

  // missing role metadata → guest → forbidden on protected modules
  const missingRole = await guardIntel('predictions', async () => sessionWithRole(null));
  assert(missingRole.authorized === false && missingRole.reason === 'forbidden', 'missing role → forbidden on predictions');

  // invalid role → guest → forbidden
  const invalidRole = await guardIntel('predictions', async () => sessionWithRole('superuser'));
  assert(invalidRole.authorized === false && invalidRole.reason === 'forbidden', 'invalid role → forbidden on predictions');

  // public reader → forbidden on predictions
  const reader = await guardIntel('predictions', async () => sessionWithRole('reader'));
  assert(reader.authorized === false && reader.reason === 'forbidden', 'reader → forbidden on predictions');

  // reader → authorized on dashboard only
  const readerDash = await guardIntel('dashboard', async () => sessionWithRole('reader'));
  assert(readerDash.authorized === true, 'reader → authorized on dashboard');

  // authorized role
  const analyst = await guardIntel('predictions', async () => sessionWithRole('analyst'));
  assert(analyst.authorized === true && analyst.role === 'analyst', 'analyst → authorized on predictions');

  const editor = await guardIntel('editorial', async () => sessionWithRole('editor'));
  assert(editor.authorized === true && editor.roleLabel === 'Editor', 'editor → authorized on editorial');

  // role boundary held
  const lowAnalyst = await guardIntel('editorial', async () => sessionWithRole('analyst'));
  assert(lowAnalyst.authorized === false && lowAnalyst.reason === 'forbidden', 'analyst → forbidden on editorial');

  // guest on dashboard
  const guestDash = await guardIntel('dashboard', async () => sessionWithRole('guest'));
  assert(guestDash.authorized === true, 'guest → authorized on dashboard');
}

// ────────────────────────────────────────────────
// 5. intelModuleFromPath — middleware path→module mapping
// ────────────────────────────────────────────────
function testIntelModuleFromPath() {
  console.log('\n=== 5. intelModuleFromPath ===');

  assert(intelModuleFromPath('/intel') === 'dashboard', '/intel → dashboard');
  assert(intelModuleFromPath('/intel/') === 'dashboard', '/intel/ → dashboard');
  assert(intelModuleFromPath('/intel/predictions') === 'predictions', '/intel/predictions → predictions');
  assert(intelModuleFromPath('/intel/watch-list') === 'watch-list', '/intel/watch-list → watch-list');
  assert(intelModuleFromPath('/intel/editorial') === 'editorial', '/intel/editorial → editorial');
  assert(intelModuleFromPath('/intel/story-builder') === 'story-builder', '/intel/story-builder → story-builder');
  assert(intelModuleFromPath('/intel/predictions/extra') === 'predictions', 'nested path → predictions');
  assert(intelModuleFromPath('/intel/unknown') === null, '/intel/unknown → null (no module gate)');
  assert(intelModuleFromPath('/intelx') === null, '/intelx → null');
  assert(intelModuleFromPath('/up403') === null, '/up403 → null (public)');
  assert(intelModuleFromPath('/') === null, '/ → null');
  assert(intelModuleFromPath('') === null, 'empty → null');

  for (const m of INTEL_MODULES) {
    assert(intelModuleFromPath(m === 'dashboard' ? '/intel' : `/intel/${m}`) === m, `path mapping for ${m}`);
  }
}

// ────────────────────────────────────────────────
// 6. Structural regression — every intel page gates before data load
// ────────────────────────────────────────────────
function collectFiles(dir: string, match: (name: string) => boolean): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(full, match));
    } else if (match(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const DATA_CALL =
  /\b(?:compute[A-Z]\w*|loadData|getCachedData|getConstituencyToolkit|getDatasetVersion|getResearchCutoff|getTotalConstituencies|predictRecord|buildEvidenceGraph|linkPredictionToEvidence|toConstituencyIntelligence|computeAnalytics)\s*\(/;

function testStructuralPageGating() {
  console.log('\n=== 6. Structural: every /intel page gates before any data computation ===');

  const pages = collectFiles(path.join(REPO_ROOT, 'app', 'intel'), (n) => n === 'page.tsx');
  assert(pages.length === 15, `15 intel page routes discovered (found ${pages.length})`);

  for (const file of pages) {
    const rel = path.relative(REPO_ROOT, file);
    const content = fs.readFileSync(file, 'utf8');

    const gateIdx = content.indexOf('guardIntelModule(');
    assert(gateIdx !== -1, `${rel}: calls guardIntelModule`);

    assert(content.indexOf('IntelDenied') !== -1, `${rel}: renders IntelDenied when unauthorized`);

    const dataMatch = content.match(DATA_CALL);
    if (dataMatch) {
      const dataIdx = content.indexOf(dataMatch[0]);
      assert(gateIdx < dataIdx, `${rel}: guardIntelModule precedes data call "${dataMatch[0].trim()}"`);
    } else {
      assert(true, `${rel}: no data computation (placeholder)`);
    }
  }
}

// ────────────────────────────────────────────────
// 7. Structural: intelligence never imported outside the workspace
// ────────────────────────────────────────────────
function scanTreeExcluding(root: string, excluded: string[], matcher: (name: string) => boolean): string[] {
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (excluded.some((x) => full.startsWith(x))) continue;
      if (entry.isDirectory()) {
        walk(full);
      } else if (matcher(entry.name)) {
        out.push(full);
      }
    }
  };
  walk(root);
  return out;
}

function testBoundaryIsolation() {
  console.log('\n=== 7. Structural: no intelligence imports outside the workspace ===');

  const appExcluded = [path.join(REPO_ROOT, 'app', 'intel')];
  const appFiles = scanTreeExcluding(path.join(REPO_ROOT, 'app'), appExcluded, (n) => n.endsWith('.ts') || n.endsWith('.tsx'));
  for (const file of appFiles) {
    const rel = path.relative(REPO_ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    assert(!content.includes('@/lib/intel') && !content.includes('lib/intel/'), `${rel}: no intelligence engine import`);
    assert(!content.includes('intel-server'), `${rel}: no server authorization import`);
  }

  const componentsExcluded = [path.join(REPO_ROOT, 'components', 'intel')];
  const componentFiles = scanTreeExcluding(path.join(REPO_ROOT, 'components'), componentsExcluded, (n) => n.endsWith('.ts') || n.endsWith('.tsx'));
  for (const file of componentFiles) {
    const rel = path.relative(REPO_ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    assert(!content.includes('@/lib/intel') && !content.includes('lib/intel/'), `${rel}: component has no intelligence engine import`);
  }
}

// ────────────────────────────────────────────────
// 8. Structural: middleware enforces module authorization at the edge
// ────────────────────────────────────────────────
function testMiddlewareEnforcement() {
  console.log('\n=== 8. Structural: middleware module gate present ===');

  const file = path.join(REPO_ROOT, 'middleware.ts');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('intelModuleFromPath'), 'middleware derives module from path');
  assert(content.includes('canAccessIntelModule'), 'middleware checks module permission');
  assert(content.includes('user_metadata.role'), 'middleware resolves role from session metadata');
  assert(content.includes("status: 403"), 'middleware returns 403 on forbidden module');
}

async function run() {
  console.log('Intel Authorization Security Suite');
  testRoleNormalization();
  testAuthorizationMatrix();
  testDecideIntelAccess();
  await testGuardIntel();
  testIntelModuleFromPath();
  testStructuralPageGating();
  testBoundaryIsolation();
  testMiddlewareEnforcement();

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Auth Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
