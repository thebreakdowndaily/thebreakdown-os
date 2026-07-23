import * as assert from 'assert';
import { PluginRegistry, KOSPlugin } from '../registry';
import { PluginCompatibilityError } from '../compatibility';
import { Capability } from '../../compiler/types';

declare function it(name: string, fn: () => void): void;

/**
 * Generic contract tests that any KOS plugin should satisfy.
 * Plugins should import this file in their own test suite and run the exported function
 * passing their plugin instance.
 */
export function runPluginContractTests(plugin: KOSPlugin) {
  const { manifest } = plugin;

  // 1. Manifest schema validation
  it('Manifest must contain required fields', () => {
    assert.ok(manifest.id, 'manifest.id is required');
    assert.ok(manifest.version, 'manifest.version is required');
    assert.ok(manifest.apiVersion, 'manifest.apiVersion is required');
    assert.ok(manifest.displayName, 'manifest.displayName is required');
    assert.ok(Array.isArray(manifest.capabilities), 'manifest.capabilities must be an array');
    assert.ok(manifest.minimumKOSVersion, 'manifest.minimumKOSVersion is required');
  });

  // 2. Compatibility enforcement
  it('Registry should accept compatible plugin', () => {
    const registry = new PluginRegistry();
    // Ensure compatibility – this should not throw
    registry.register(plugin);
    const registered = registry.getManifests().find(m => m.id === manifest.id);
    assert.ok(registered, 'Plugin manifest should be registered');
  });

  // 3. Incompatible plugin rejection (simulated)
  it('Registry should reject incompatible plugin', () => {
    const incompatible: KOSPlugin = {
      manifest: {
        ...manifest,
        id: manifest.id + '-incompatible',
        minimumKOSVersion: '99.0.0', // force incompatibility
      },
    } as any;
    const registry = new PluginRegistry();
    assert.throws(() => registry.register(incompatible), PluginCompatibilityError);
  });

  // 4. Engine component registration
  if (plugin.engine) {
    it('Engine component should be discoverable via registry', () => {
      const registry = new PluginRegistry();
      registry.register(plugin);
      const engines = registry.getEnginePlugins();
      assert.ok(engines.includes(plugin.engine as any), 'Engine plugin should be in registry list');
    });
  }

  // 5. KXE component registration
  if (plugin.kxe) {
    it('KXE component should be discoverable via registry', () => {
      const registry = new PluginRegistry();
      registry.register(plugin);
      const kxes = registry.getKXEPlugins();
      assert.ok(kxes.includes(plugin.kxe as any), 'KXE plugin should be in registry list');
    });
  }

  // 6. Renderer registration and uniqueness
  if (plugin.renderer) {
    it('Renderer should register without duplication', () => {
      const registry = new PluginRegistry();
      registry.register(plugin);
      const renderers = registry.getRenderers();
      // Count occurrences of the same renderer id
      const count = renderers.filter(r => r.id === plugin.renderer!.id).length;
      assert.strictEqual(count, 1, 'Renderer should be registered exactly once');
    });
  }
}

// If this file is run directly, provide a demo plugin to ensure the test file is syntactically correct.
if (require.main === module) {
  console.log('Contract test file loaded – import and run runPluginContractTests(plugin) in your plugin test suite.');
}
