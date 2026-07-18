import { runLoader } from '../loader';
import { aggregate } from '../report/aggregator';
import * as path from 'path';

describe('Audit Loader', () => {
  it('discovers plugins, validates manifests, executes them, and aggregates results', async () => {
    // Determine repo root based on this test location (audit/tests)
    const repoRoot = path.resolve(__dirname, '../../');
    const results = await runLoader(repoRoot);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(2);

    // Verify Hello World
    const helloWorldResult = results.find(r => r.pluginName === 'hello-world');
    expect(helloWorldResult).toBeDefined();
    expect(helloWorldResult?.state).toBe('PASSED');

    // Verify mock-crash
    const mockCrashResult = results.find(r => r.pluginName === 'mock-crash');
    expect(mockCrashResult).toBeDefined();
    expect(mockCrashResult?.state).toBe('FAILED');
    expect(mockCrashResult?.data?.error).toMatch(/Simulated plugin failure/);

    // Aggregator test
    const report = aggregate(results);
    expect(report.frameworkVersion).toBe('1.0.0');
    expect(report.results).toEqual(results);
  });
});
