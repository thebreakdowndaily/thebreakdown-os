import * as fs from 'fs';
import * as path from 'path';
import { AuditPlugin } from './plugins/types/AuditPlugin';
import { AuditContext } from './plugins/types/AuditContext';
import { AuditResult } from './plugins/types/AuditResult';
import { PluginMetadata } from './plugins/types/PluginMetadata';
import { LifecycleState } from './plugins/types/LifecycleState';
import { logger } from './plugins/utils/logger';
import { performanceMonitor } from './plugins/utils/performanceMonitor';

/**
 * Discover plugin manifests under the audit/plugins directory.
 */
async function discoverManifests(repoRoot: string): Promise<string[]> {
  const pluginsDir = path.resolve(repoRoot, 'audit/plugins');
  const entries = await fs.promises.readdir(pluginsDir, { withFileTypes: true });
  const manifests: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const manifestPath = path.join(pluginsDir, entry.name, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        manifests.push(manifestPath);
      }
    }
  }
  // deterministic order
  manifests.sort();
  return manifests;
}

/** Simple validation of manifest shape */
function validateManifest(manifest: any): PluginMetadata {
  const required = ['name', 'description', 'version', 'sdkVersion', 'capabilities'];
  for (const key of required) {
    if (!manifest[key]) {
      throw new Error(`Manifest missing required field: ${key}`);
    }
  }
  return manifest as PluginMetadata;
}

/** Load a plugin module dynamically */
async function loadPlugin(pluginDir: string): Promise<AuditPlugin> {
  const modulePath = path.join(pluginDir, 'index.ts');
  const importPath = process.env.JEST_WORKER_ID !== undefined ? modulePath : `file://${modulePath}`;
  const mod = await import(importPath);
  if (!mod || typeof mod.run !== 'function') {
    throw new Error(`Plugin at ${pluginDir} does not export a run(context) function`);
  }
  return mod as AuditPlugin;
}

/** Execute a single plugin with timeout handling */
async function executePlugin(
  plugin: AuditPlugin,
  meta: PluginMetadata,
  context: AuditContext,
): Promise<AuditResult> {
  logger.info(`Running plugin ${meta.name}`);
  const timeoutMs = meta.timeout ?? 5000; // default 5s
  const timer = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs));
  const startedAt = new Date();
  try {
    performanceMonitor.start(meta.name);
    const result = await Promise.race([plugin.run(context), timer]);
    performanceMonitor.end(meta.name);
    const finishedAt = new Date();
    return { 
      ...result, 
      pluginName: meta.name,
      execution: {
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString()
      }
    };
  } catch (err) {
    performanceMonitor.end(meta.name);
    logger.error(`Plugin ${meta.name} failed: ${(err as Error).message}`);
    const finishedAt = new Date();
    return { 
      pluginName: meta.name, 
      state: LifecycleState.FAILED, 
      data: { 
        score: 0,
        coverage: 0,
        findings: [{ severity: 'critical', message: (err as Error).message }],
        metrics: {}
      },
      execution: {
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString()
      },
      error: (err as Error).message
    };
  }
}

/** Main loader entry point */
export async function runLoader(repoRoot: string) {
  const context: AuditContext = { repoRoot, config: {} };
  const manifestsPaths = await discoverManifests(repoRoot);
  
  // 1. Load and validate all manifests
  const pluginsMap = new Map<string, { meta: PluginMetadata, dir: string }>();
  for (const manifestPath of manifestsPaths) {
    const pluginDir = path.dirname(manifestPath);
    const raw = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    const meta = validateManifest(raw);
    
    // Duplicate IDs check
    if (pluginsMap.has(meta.name)) {
      throw new Error(`Dependency validation failed:\n- Duplicate plugin ID detected: "${meta.name}"`);
    }
    pluginsMap.set(meta.name, { meta, dir: pluginDir });
  }

  // 2. Validate dependencies
  const errors: string[] = [];
  for (const [name, { meta }] of pluginsMap.entries()) {
    if (meta.dependsOn) {
      for (const dep of meta.dependsOn) {
        if (dep === name) {
          errors.push(`- Plugin "${name}" depends on itself.`);
        } else if (!pluginsMap.has(dep)) {
          errors.push(`- Plugin "${name}" depends on missing plugin "${dep}".`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Dependency validation failed:\n${errors.join('\n')}`);
  }

  // 3. Topological Sort (Kahn's Algorithm)
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  for (const name of pluginsMap.keys()) {
    inDegree.set(name, 0);
    graph.set(name, []);
  }

  for (const [name, { meta }] of pluginsMap.entries()) {
    if (meta.dependsOn) {
      for (const dep of meta.dependsOn) {
        graph.get(dep)!.push(name);
        inDegree.set(name, inDegree.get(name)! + 1);
      }
    }
  }

  const queue: string[] = [];
  for (const [name, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(name);
  }

  const sortedPlugins: string[] = [];
  while (queue.length > 0) {
    // Sort queue to guarantee deterministic execution for independent plugins
    queue.sort();
    const current = queue.shift()!;
    sortedPlugins.push(current);

    for (const neighbor of graph.get(current)!) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check for cycles
  if (sortedPlugins.length !== pluginsMap.size) {
    throw new Error(`Dependency validation failed:\n- Circular dependency detected among plugins.`);
  }

  // 4. Execute plugins in topological order
  const results: AuditResult[] = [];
  for (const pluginName of sortedPlugins) {
    const { meta, dir } = pluginsMap.get(pluginName)!;
    logger.info(`Plugin ${meta.name} discovered`);
    const plugin = await loadPlugin(dir);
    const result = await executePlugin(plugin, meta, context);
    results.push(result);
  }

  return results;
}
