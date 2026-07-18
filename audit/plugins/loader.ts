// audit/plugins/loader.ts
import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import { AuditPlugin } from './types/AuditPlugin';
import { AuditContext } from './types/AuditContext';
import { AuditResult } from './types/AuditResult';
import { LifecycleState } from './types/LifecycleState';
import { Logger } from './utils/logger';
import { loadConfig } from '../config/loader';
import { performance } from 'perf_hooks';

const ajv = new Ajv({ allErrors: true, strict: false });
const manifestSchemaPath = path.resolve(__dirname, '../../schema/manifest.schema.json');
const manifestSchema = JSON.parse(fs.readFileSync(manifestSchemaPath, 'utf-8'));
const validateManifest = ajv.compile(manifestSchema);

export async function loadPlugins(repoRoot: string): Promise<AuditResult[]> {
  const pluginsDir = path.resolve(__dirname);
  const pluginFolders = fs.readdirSync(pluginsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'utils' && d.name !== 'hello-world')
    .map(d => d.name);

  const results: AuditResult[] = [];
  const logger = new Logger();
  const config = loadConfig(path.join(repoRoot, 'audit-config.json'));

  const allFolders = ['hello-world', ...pluginFolders];

  for (const folder of allFolders) {
    const manifestPath = path.join(pluginsDir, folder, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      logger.warn(`Manifest missing for plugin ${folder}`);
      continue;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const valid = validateManifest(manifest);
    if (!valid) {
      logger.error(`Invalid manifest for ${folder}: ${ajv.errorsText(validateManifest.errors)}`);
      results.push({
        pluginName: manifest.name ?? folder,
        state: LifecycleState.FAILED,
        message: 'Manifest validation failed',
        durationMs: 0,
      });
      continue;
    }

    const entryPath = path.join(pluginsDir, folder, manifest.entry);
    let pluginModule: { default: AuditPlugin };
    try {
      pluginModule = await import(entryPath);
    } catch (e) {
      logger.error(`Failed to load plugin ${folder}: ${e}`);
      results.push({
        pluginName: manifest.name,
        state: LifecycleState.FAILED,
        message: `Module load error: ${e}`,
        durationMs: 0,
      });
      continue;
    }
    const plugin = pluginModule.default as AuditPlugin;

    const context: AuditContext = {
      repoRoot,
      config,
      logger,
      timeoutMs: manifest.timeoutMs,
    };

    const start = performance.now();
    let result: AuditResult;
    try {
      const execPromise = plugin.run(context);
      if (manifest.timeoutMs) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Plugin timeout')), manifest.timeoutMs)
        );
        await Promise.race([execPromise, timeoutPromise]);
      }
      const pluginResult = await execPromise;
      const duration = performance.now() - start;
      result = {
        pluginName: plugin.name,
        state: pluginResult.state ?? LifecycleState.PASSED,
        message: pluginResult.message,
        durationMs: duration,
        data: pluginResult.data,
      };
    } catch (err) {
      const duration = performance.now() - start;
      result = {
        pluginName: plugin.name,
        state: LifecycleState.FAILED,
        message: (err as Error).message,
        durationMs: duration,
      };
    }
    results.push(result);
  }
  return results;
}
