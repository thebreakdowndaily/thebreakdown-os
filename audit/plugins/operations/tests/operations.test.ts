import * as fs from 'fs';
import * as path from 'path';
import { run } from '../index';
import { AuditContext } from '../../types/AuditContext';
import { LifecycleState } from '../../types/LifecycleState';

describe('Operations Plugin', () => {
  const realRepoRoot = path.resolve(__dirname, '../../../../');
  const mockRepoRoot = path.join(__dirname, '__fixtures__/repo');
  
  beforeAll(() => {
    // Setup a broken mock repository
    const opsPluginDir = path.join(mockRepoRoot, 'audit/plugins/operations');
    fs.mkdirSync(opsPluginDir, { recursive: true });
    fs.copyFileSync(
      path.join(realRepoRoot, 'audit/plugins/operations/policy.json'),
      path.join(opsPluginDir, 'policy.json')
    );

    const wfDir = path.join(mockRepoRoot, '.github/workflows');
    fs.mkdirSync(wfDir, { recursive: true });
    fs.writeFileSync(path.join(wfDir, 'ci.yml'), 'invalid: yaml: syntax: [][');
    fs.writeFileSync(path.join(mockRepoRoot, 'package.json'), '{ "malformed": true '); // invalid JSON
    fs.writeFileSync(path.join(mockRepoRoot, 'package-lock.json'), '{}');
    fs.writeFileSync(path.join(mockRepoRoot, 'yarn.lock'), ''); // disallowed
    
    const pluginDir = path.join(mockRepoRoot, 'audit/plugins/bad-plugin');
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.writeFileSync(path.join(pluginDir, 'manifest.json'), JSON.stringify({
      name: "bad-plugin",
      sdkVersion: "0.0.1",
      dependsOn: ["non-existent-plugin"]
    }));
  });

  afterAll(() => {
    fs.rmSync(mockRepoRoot, { recursive: true, force: true });
  });

  it('executes against real repo without crashing and should pass', async () => {
    const context: AuditContext = {
      repoRoot: realRepoRoot,
      config: {
        plugins: ['operations-audit']
      }
    };
    
    const result = await run(context);
    expect(result.pluginName).toBe('operations-audit');
    expect(result.state).toBe(LifecycleState.PASSED);
    expect((result.data as any).metrics.operationsComplianceScore).toBe(100);
  });

  it('detects missing files, invalid YAML/JSON, disallowed lockfiles, and broken dependsOn', async () => {
    const context: AuditContext = {
      repoRoot: mockRepoRoot,
      config: {
        plugins: ['operations-audit']
      }
    };
    
    const result = await run(context);
    expect(result.state).toBe(LifecycleState.FAILED);
    
    const findings = (result.data as any).findings.map((f: any) => f.message);
    
    // Package JSON invalid
    expect(findings).toContain('package.json is invalid JSON');
    // Invalid YAML
    expect(findings.some((f: string) => f.includes('failed to parse'))).toBe(true);
    // Missing required workflow (since ci.yml is invalid, and audit-framework.yml is completely missing)
    expect(findings).toContain('Missing required workflow: .github/workflows/audit-framework.yml');
    // Disallowed package manager
    expect(findings).toContain('Disallowed package manager lockfile found: yarn.lock');
    // Broken dependsOn
    expect(findings).toContain('Plugin bad-plugin depends on unknown plugin: non-existent-plugin');
  });
});
