/**
 * THE BREAKDOWN — Plugin Loader v1.0
 *
 * Discovers, validates, and loads plugins from the plugins/ directory.
 * Each plugin is a directory with:
 *   - manifest.yaml   — Plugin metadata and configuration
 *   - index.ts       — Plugin implementation (exports createPlugin)
 *
 * Usage:
 *   const loader = new PluginLoader();
 *   await loader.discover();        // Scan plugins/ directory
 *   const pib = loader.get('pib');  // Get plugin by ID
 *   const data = await pib.fetch(); // Fetch data from source
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  PluginManifest,
  PluginImplementation,
  PluginOutput,
  PluginError,
  FetchStatus,
} from './types';

// ── Plugin Loader ──────────────────────────────────────────────────────────

export class PluginLoader {
  private plugins = new Map<string, PluginImplementation>();
  private pluginDir: string;

  constructor(pluginDir?: string) {
    this.pluginDir = pluginDir || path.resolve(process.cwd(), 'plugins');
  }

  /**
   * Discover all plugins in the plugins/ directory.
   * Each subdirectory with a manifest.yaml and index.ts is a plugin.
   */
  async discover(): Promise<PluginManifest[]> {
    const entries = fs.readdirSync(this.pluginDir, { withFileTypes: true });
    const manifests: PluginManifest[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'sdk' || entry.name === 'registry' || entry.name.startsWith('.')) continue;

      try {
        const manifestPath = path.join(this.pluginDir, entry.name, 'manifest.yaml');
        const indexPath = path.join(this.pluginDir, entry.name, 'index.ts');

        if (!fs.existsSync(manifestPath)) continue;

        // Load and parse manifest
        const manifest = await this.loadManifest(manifestPath);

        // Validate manifest
        this.validateManifest(manifest);

        // Load implementation (if available)
        let implementation: PluginImplementation | null = null;
        if (fs.existsSync(indexPath)) {
          try {
            const mod = await import(indexPath);
            if (mod.createPlugin) {
              implementation = mod.createPlugin(manifest);
            }
          } catch (err) {
            console.warn(`[PluginLoader] Could not load implementation for ${entry.name}:`, err);
          }
        }

        if (implementation) {
          this.plugins.set(manifest.id, implementation);
        } else {
          // Register as manifest-only (data available but no fetch logic)
          this.plugins.set(manifest.id, {
            manifest,
            fetch: async () => ({
              pluginId: manifest.id,
              manifestVersion: manifest.version,
              fetchedAt: new Date().toISOString(),
              items: [],
              metadata: {
                totalItems: 0,
                source: manifest.sources[0]?.url || 'none',
                status: 'no_data',
                durationMs: 0,
              },
            }),
          });
        }

        manifests.push(manifest);
      } catch (err) {
        console.error(`[PluginLoader] Failed to load plugin ${entry.name}:`, err);
      }
    }

    return manifests;
  }

  /**
   * Get a loaded plugin by ID.
   */
  get(pluginId: string): PluginImplementation | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all loaded plugins.
   */
  getAll(): PluginImplementation[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all manifests.
   */
  getManifests(): PluginManifest[] {
    return this.getAll().map((p) => p.manifest);
  }

  /**
   * Reload a specific plugin.
   */
  async reload(pluginId: string): Promise<PluginImplementation | undefined> {
    this.plugins.delete(pluginId);
    const manifests = await this.discover();
    const found = manifests.find((m) => m.id === pluginId);
    return found ? this.get(pluginId) : undefined;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private async loadManifest(filePath: string): Promise<PluginManifest> {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Parse YAML (simple parser — use js-yaml in production)
    const manifest = this.parseYaml(content) as any;

    return {
      id: manifest.id || path.basename(path.dirname(filePath)),
      name: manifest.name || '',
      version: manifest.version || '0.1.0',
      description: manifest.description || '',
      author: manifest.author || 'The Breakdown',
      type: manifest.type || 'data-source',
      trust_tier: manifest.trust_tier || 3,
      status: manifest.status || 'active',
      schedule: manifest.schedule || 'every 24 hours',
      sources: manifest.sources || [],
      config: manifest.config || {},
      tags: manifest.tags || [],
      output_schema: manifest.output_schema,
      documentation: manifest.documentation,
      dependencies: manifest.dependencies,
    };
  }

  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id || !/^[a-z0-9-]+$/.test(manifest.id)) {
      throw new Error(`Invalid plugin ID: "${manifest.id}". Must be kebab-case.`);
    }
    if (!manifest.name) {
      throw new Error(`Plugin "${manifest.id}" requires a name.`);
    }
    if (!manifest.sources || manifest.sources.length === 0) {
      throw new Error(`Plugin "${manifest.id}" requires at least one source.`);
    }
    if (manifest.trust_tier < 1 || manifest.trust_tier > 5) {
      throw new Error(`Plugin "${manifest.id}" trust_tier must be 1-5.`);
    }
    if (!manifest.schedule) {
      throw new Error(`Plugin "${manifest.id}" requires a schedule.`);
    }
  }

  /**
   * Simple YAML parser. Replace with js-yaml in production.
   */
  private parseYaml(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = content.split('\n');
    let currentKey: string | null = null;
    let currentArray: unknown[] | null = null;
    let currentObject: Record<string, unknown> | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Array item
      if (trimmed.startsWith('- ')) {
        const value = trimmed.slice(2).trim();
        if (currentArray) {
          currentArray.push(parseYamlValue(value));
        }
        continue;
      }

      // Key-value pair
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;

      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();

      if (value === '' || value === '|') {
        // Object or array follows
        currentKey = key;
        if (key === 'sources' || key === 'tags' || key === 'dependencies') {
          currentArray = [];
          result[key] = currentArray;
        } else {
          currentObject = {};
          result[key] = currentObject;
        }
      } else {
        if (currentObject && currentKey) {
          currentObject[key] = parseYamlValue(value);
        } else {
          result[key] = parseYamlValue(value);
        }
      }
    }

    return result;
  }
}

function parseYamlValue(value: string): unknown {
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  // Number
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  // String
  return value.replace(/^["']|["']$/g, '');
}

// ── Utility: Fetch helper for plugins ──────────────────────────────────────

export interface FetchOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  retries?: number;
  parser?: 'json' | 'text' | 'xml';
}

/**
 * Fetch with timeout, retries, and error handling for plugins.
 */
export async function pluginFetch<T = any>(options: FetchOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    retries = 2,
    parser = 'json',
  } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'User-Agent': 'TheBreakdown/1.0 PluginSDK',
          'Accept': 'application/json',
          ...headers,
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      switch (parser) {
        case 'json':
          return await response.json();
        case 'text':
          return await response.text() as unknown as T;
        case 'xml':
          return await response.text() as unknown as T;
        default:
          return await response.json();
      }
    } catch (err: any) {
      clearTimeout(timer);
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Fetch failed after all retries');
}

// ── RSS Parser helper ──────────────────────────────────────────────────────

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category?: string;
  guid?: string;
}

/**
 * Parse RSS XML into structured items.
 * Simple regex-based parser. Use xml2js in production.
 */
export function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];

  // Extract <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    items.push({
      title: extractTag(block, 'title'),
      link: extractTag(block, 'link'),
      description: extractTag(block, 'description') || extractTag(block, 'summary'),
      pubDate: extractTag(block, 'pubDate') || extractTag(block, 'published'),
      category: extractTag(block, 'category'),
      guid: extractTag(block, 'guid'),
    });
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = regex.exec(xml);
  if (!m) return '';
  // Strip HTML tags from content
  return m[1].replace(/<[^>]*>/g, '').trim();
}

// ── Plugin Output Builder ──────────────────────────────────────────────────

export function buildPluginOutput(
  pluginId: string,
  version: string,
  items: PluginOutput['items'],
  source: string,
  status: FetchStatus = 'success',
  error?: string,
  durationMs?: number
): PluginOutput {
  return {
    pluginId,
    manifestVersion: version,
    fetchedAt: new Date().toISOString(),
    items,
    metadata: {
      totalItems: items.length,
      source,
      status,
      error,
      durationMs: durationMs || 0,
    },
  };
}


