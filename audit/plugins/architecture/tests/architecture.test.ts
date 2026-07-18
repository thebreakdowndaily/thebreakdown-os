import { run } from '../index';
import { AuditContext } from '../../types/AuditContext';
import * as path from 'path';

describe('Architecture Plugin', () => {
  it('executes against real repo without crashing', async () => {
    const context: AuditContext = {
      repoRoot: path.resolve(__dirname, '../../../../'),
      config: {}
    };

    const result = await run(context);
    expect(result.pluginName).toBe('architecture-audit');
    expect(result.state).toBeDefined();
    
    const data = result.data as any;
    expect(data.metrics).toBeDefined();
    expect(data.findings).toBeInstanceOf(Array);
    expect(data.metrics.requiredDirectories.present).toBeGreaterThan(0);
  });

  it('detects missing directories, forbidden imports, duplicate plugins, and unknown directories', async () => {
    const context: AuditContext = {
      repoRoot: path.resolve(__dirname, '__fixtures__/repo'),
      config: {}
    };

    const result = await run(context);
    const data = result.data as any;
    
    // We expect state FAILED because of Critical/High findings
    expect(result.state).toBe('FAILED');
    
    const findings = data.findings as {severity: string, message: string}[];
    
    // Missing required directory (e.g. app, services)
    expect(findings.some(f => f.message.includes('Missing required directory: app/'))).toBe(true);
    
    // Forbidden import
    expect(findings.some(f => f.message.includes("Forbidden import 'database' found"))).toBe(true);
    
    // Unknown top-level directory
    expect(findings.some(f => f.message.includes('Unknown top-level directory: unknown-dir/'))).toBe(true);

    // Duplicate plugin manifest
    expect(findings.some(f => f.message.includes('Duplicate plugin name found: hello-world'))).toBe(true);

    // Missing manifest (since we didn't put a manifest for a plugin)
    // Actually we put bad-plugin with a manifest but lacking sdkVersion
    expect(findings.some(f => f.message.includes('manifest missing sdkVersion'))).toBe(true);
  });
});
