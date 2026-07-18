import * as fs from 'fs';
import * as path from 'path';
import { run } from '../index';
import { AuditContext } from '../../types/AuditContext';
import { LifecycleState } from '../../types/LifecycleState';

describe('Security Plugin', () => {
  const realRepoRoot = path.resolve(__dirname, '../../../../');
  const mockRepoRoot = path.join(__dirname, '__fixtures__/repo');
  
  beforeAll(() => {
    // Setup a broken mock repository
    fs.mkdirSync(mockRepoRoot, { recursive: true });

    // Mock policy for the test run
    const secPluginDir = path.join(mockRepoRoot, 'audit/plugins/security-audit');
    fs.mkdirSync(secPluginDir, { recursive: true });
    fs.copyFileSync(
      path.join(realRepoRoot, 'audit/plugins/security-audit/policy.json'),
      path.join(secPluginDir, 'policy.json')
    );
    
    // Malformed CSP configuration (missing 'Content-Security-Policy' string)
    fs.writeFileSync(path.join(mockRepoRoot, 'next.config.js'), 'module.exports = { headers: () => [{ key: "X-Frame-Options", value: "DENY" }] };');

    // Missing engines.node in package.json
    fs.writeFileSync(path.join(mockRepoRoot, 'package.json'), JSON.stringify({ name: "mock" }));

    // Multiple .env files
    fs.writeFileSync(path.join(mockRepoRoot, '.env'), 'SECRET=123');
    fs.writeFileSync(path.join(mockRepoRoot, '.env.local'), 'LOCAL=456'); // Should fail if not ignored by secret scanner logic (which it isn't, so it will fail)
    fs.writeFileSync(path.join(mockRepoRoot, '.env.example'), 'EXAMPLE=789'); // Allowed
  });

  afterAll(() => {
    fs.rmSync(mockRepoRoot, { recursive: true, force: true });
  });

  it('executes against real repo without crashing', async () => {
    const context: AuditContext = {
      repoRoot: realRepoRoot,
      config: {
        plugins: ['security-audit']
      }
    };
    
    const result = await run(context);
    expect(result.pluginName).toBe('security-audit');
    // Note: real repo might pass or fail depending on what we have, so we just expect it to run
    expect(result.state).toBeDefined();
    expect(result.data).toBeDefined();
  });

  it('detects exposed secrets, missing CSP, and missing manifest engines', async () => {
    const context: AuditContext = {
      repoRoot: mockRepoRoot,
      config: {
        plugins: ['security-audit']
      }
    };
    
    const result = await run(context);
    expect(result.state).toBe(LifecycleState.FAILED);
    
    const findings = (result.data as any).findings.map((f: any) => f.message);
    
    // Exposed secrets
    expect(findings.some((f: string) => f.includes('Exposed secret file found: .env'))).toBe(true);
    expect(findings.some((f: string) => f.includes('Exposed secret file found: .env.local'))).toBe(true);
    expect(findings.some((f: string) => f.includes('Exposed secret file found: .env.example'))).toBe(false);

    // Missing CSP
    expect(findings).toContain('No Content-Security-Policy definition found in Next.js config');
    
    // Manifest Consistency
    expect(findings).toContain('Missing required engine definition in package.json: node');

    // Score checks
    expect((result.data as any).metrics.securityComplianceScore).toBe(10); // only dependencyHealth is 100%, weighting 10%
  });
});
