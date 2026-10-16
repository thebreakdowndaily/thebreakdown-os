import { safeRedirectPath } from '../../features/auth/redirect';

const checks: Array<[string, string | null, string]> = [
  ['valid internal route', '/admin?tab=users', '/admin?tab=users'],
  ['valid nested route with hash', '/intel/editorial#review', '/intel/editorial#review'],
  ['empty destination falls back', null, '/newsroom'],
  ['relative destination falls back', 'admin', '/newsroom'],
  ['absolute external URL falls back', 'https://evil.example/path', '/newsroom'],
  ['protocol-relative URL falls back', '//evil.example/path', '/newsroom'],
  ['backslash destination falls back', '/\\\\evil.example', '/newsroom'],
  ['javascript URL falls back', 'javascript:alert(1)', '/newsroom'],
  ['control characters fall back', '/admin\nLocation: https://evil.example', '/newsroom'],
];

let failed = 0;
for (const [name, input, expected] of checks) {
  const actual = safeRedirectPath(input);
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL: ${name}; expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  } else {
    console.log(`PASS: ${name}`);
  }
}

if (failed > 0) process.exit(1);
console.log(`Auth redirect tests passed: ${checks.length - failed}/${checks.length}`);
