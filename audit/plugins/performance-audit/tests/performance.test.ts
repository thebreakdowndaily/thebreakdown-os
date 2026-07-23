import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { run } from '../index';
import { AuditContext } from '../../../types/AuditContext';
import { LifecycleState } from '../../../types/LifecycleState';

describe('Performance Plugin', () => {
  const realRepoRoot = path.resolve(__dirname, '../../../../');

  it('executes against real repo without crashing', async () => {
    const context: AuditContext = {
      repoRoot: realRepoRoot,
      config: {}
    };

    const result = await run(context);
    
    expect(result.pluginName).toBe('performance-audit');
    expect(result.data).toBeDefined();
    expect(result.data.score).toBeDefined();
    expect(result.data.coverage).toBe(100);
    expect(Array.isArray(result.data.findings)).toBe(true);
    expect(result.data.metrics).toBeDefined();
  });
});
