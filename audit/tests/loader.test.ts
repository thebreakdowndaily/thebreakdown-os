import { runLoader } from '../loader';
import { aggregate } from '../report/aggregator';
import * as path from 'path';
import * as fs from 'fs';

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

  describe('Dependency Graph Validation', () => {
    const mockRepoRoot = path.join(__dirname, '__fixtures__/repo');
    
    afterEach(() => {
      if (fs.existsSync(mockRepoRoot)) {
        fs.rmSync(mockRepoRoot, { recursive: true, force: true });
      }
    });

    it('fails if there is a missing dependency', async () => {
      const p1 = path.join(mockRepoRoot, 'audit/plugins/p1');
      fs.mkdirSync(p1, { recursive: true });
      fs.writeFileSync(path.join(p1, 'manifest.json'), JSON.stringify({
        name: 'p1', description: 'desc', version: '1', sdkVersion: '1', capabilities: [], dependsOn: ['p2']
      }));
      fs.writeFileSync(path.join(p1, 'index.ts'), 'export const run = async () => ({ state: "PASSED" });');

      await expect(runLoader(mockRepoRoot)).rejects.toThrow(/missing plugin "p2"/);
    });

    it('fails if there is a circular dependency', async () => {
      const p1 = path.join(mockRepoRoot, 'audit/plugins/p1');
      const p2 = path.join(mockRepoRoot, 'audit/plugins/p2');
      fs.mkdirSync(p1, { recursive: true });
      fs.mkdirSync(p2, { recursive: true });
      fs.writeFileSync(path.join(p1, 'manifest.json'), JSON.stringify({
        name: 'p1', description: 'desc', version: '1', sdkVersion: '1', capabilities: [], dependsOn: ['p2']
      }));
      fs.writeFileSync(path.join(p1, 'index.ts'), 'export const run = async () => ({ state: "PASSED" });');
      
      fs.writeFileSync(path.join(p2, 'manifest.json'), JSON.stringify({
        name: 'p2', description: 'desc', version: '1', sdkVersion: '1', capabilities: [], dependsOn: ['p1']
      }));
      fs.writeFileSync(path.join(p2, 'index.ts'), 'export const run = async () => ({ state: "PASSED" });');

      await expect(runLoader(mockRepoRoot)).rejects.toThrow(/Circular dependency detected/);
    });

    it('executes in topological order', async () => {
      const p1 = path.join(mockRepoRoot, 'audit/plugins/p1'); // depends on p2 and p3
      const p2 = path.join(mockRepoRoot, 'audit/plugins/p2'); // depends on p3
      const p3 = path.join(mockRepoRoot, 'audit/plugins/p3'); // independent
      fs.mkdirSync(p1, { recursive: true });
      fs.mkdirSync(p2, { recursive: true });
      fs.mkdirSync(p3, { recursive: true });
      
      fs.writeFileSync(path.join(p1, 'manifest.json'), JSON.stringify({
        name: 'p1', description: 'desc', version: '1', sdkVersion: '1', capabilities: [], dependsOn: ['p2', 'p3']
      }));
      fs.writeFileSync(path.join(p1, 'index.ts'), 'export const run = async () => ({ state: "PASSED" });');
      
      fs.writeFileSync(path.join(p2, 'manifest.json'), JSON.stringify({
        name: 'p2', description: 'desc', version: '1', sdkVersion: '1', capabilities: [], dependsOn: ['p3']
      }));
      fs.writeFileSync(path.join(p2, 'index.ts'), 'export const run = async () => ({ state: "PASSED" });');

      fs.writeFileSync(path.join(p3, 'manifest.json'), JSON.stringify({
        name: 'p3', description: 'desc', version: '1', sdkVersion: '1', capabilities: [], dependsOn: []
      }));
      fs.writeFileSync(path.join(p3, 'index.ts'), 'export const run = async () => ({ state: "PASSED" });');

      const results = await runLoader(mockRepoRoot);
      expect(results.length).toBe(3);
      // Expected execution order: p3 -> p2 -> p1
      expect(results[0].pluginName).toBe('p3');
      expect(results[1].pluginName).toBe('p2');
      expect(results[2].pluginName).toBe('p1');
    });
  });
});
