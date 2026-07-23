import { EnginePlugin } from "../engine";
import { KXEPlugin } from "../kxe";
import { Renderer } from "../renderer";
import { PluginManifest } from "../manifest";
import { assertCompatible } from "../compatibility";

/**
 * A bundled KOS Plugin that contains the manifest and any combination 
 * of engine, kxe, or renderer implementations.
 */
export interface KOSPlugin {
  manifest: PluginManifest;
  engine?: EnginePlugin;
  kxe?: KXEPlugin;
  renderer?: Renderer;
}

/**
 * A central registry for managing and validating KOS Plugins.
 */
export class PluginRegistry {
  private plugins: Map<string, KOSPlugin> = new Map();

  /**
   * Registers a plugin after asserting version compatibility.
   * Throws PluginCompatibilityError if incompatible.
   */
  register(plugin: KOSPlugin) {
    // 1. Compatibility Check
    assertCompatible(plugin.manifest);
    
    // 2. Register
    this.plugins.set(plugin.manifest.id, plugin);
  }

  /**
   * Registers multiple plugins.
   */
  registerAll(plugins: KOSPlugin[]) {
    plugins.forEach(p => this.register(p));
  }

  getEnginePlugins(): EnginePlugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.engine)
      .map(p => p.engine!);
  }

  getKXEPlugins(): KXEPlugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.kxe)
      .map(p => p.kxe!);
  }

  getRenderers(): Renderer[] {
    return Array.from(this.plugins.values())
      .filter(p => p.renderer)
      .map(p => p.renderer!);
  }
  
  getManifests(): PluginManifest[] {
    return Array.from(this.plugins.values()).map(p => p.manifest);
  }
}
