// ── Plugin Extension Engine & Capability Isolation (Phase 19B Recommendation 4) ─

import { ExtensionPlugin, ExtensionPluginManifest } from '../../types/extensibility';

export class PluginExtensionEngine {
  private plugins = new Map<string, ExtensionPlugin>();

  constructor() {
    this.registerPlugin({
      pluginId: 'plug-analytics-exporter',
      name: 'First Party Analytics Plugin',
      version: '1.0.0',
      apiVersionCompatibility: 'v1.0',
      trustLevel: 'FIRST_PARTY',
      requiredCapabilities: ['read:fixes', 'read:claims'],
      resourceLimits: { maxMemoryMb: 64, maxExecutionTimeMs: 500 },
    });
  }

  public registerPlugin(manifest: ExtensionPluginManifest): ExtensionPlugin {
    const plugin: ExtensionPlugin = Object.freeze({
      manifest: Object.freeze(manifest),
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
    });
    this.plugins.set(manifest.pluginId, plugin);
    return plugin;
  }

  /**
   * Verifies capability negotiation for plugin execution.
   */
  public verifyCapability(pluginId: string, requiredCapability: string): boolean {
    const plug = this.plugins.get(pluginId);
    if (!plug || plug.status !== 'ACTIVE') return false;
    return plug.manifest.requiredCapabilities.includes(requiredCapability);
  }

  public listPlugins(): readonly ExtensionPlugin[] {
    return Object.freeze(Array.from(this.plugins.values()));
  }
}
