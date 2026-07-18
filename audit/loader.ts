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
  // Cast - we trust the shape for this prototype
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
  try {
    performanceMonitor.start(meta.name);
    const result = await Promise.race([plugin.run(context), timer]);
    performanceMonitor.end(meta.name);
    return { ...result, pluginName: meta.name };
  } catch (err) {
    performanceMonitor.end(meta.name);
    logger.error(`Plugin ${meta.name} failed: ${(err as Error).message}`);
    return { pluginName: meta.name, state: LifecycleState.FAILED, data: { error: (err as Error).message } };
  }
}

/** Main loader entry point */
export async function runLoader(repoRoot: string) {
  const context: AuditContext = { repoRoot, config: {} };
  const manifests = await discoverManifests(repoRoot);
  const results: AuditResult[] = [];
  for (const manifestPath of manifests) {
    const pluginDir = path.dirname(manifestPath);
    const raw = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    const meta = validateManifest(raw);
    logger.info(`Plugin ${meta.name} discovered`);
    const plugin = await loadPlugin(pluginDir);
    const result = await executePlugin(plugin, meta, context);
    results.push(result);
  }
  return results;
}
