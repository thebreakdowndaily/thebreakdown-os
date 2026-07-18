export interface PluginMetadata {
  /** Human readable name */
  name: string;
  /** Short description */
  description: string;
  /** Version of the plugin */
  version: string;
  /** Required SDK version */
  sdkVersion: string;
  /** List of capabilities */
  capabilities: string[];
  /** Execution timeout in ms */
  timeout?: number;
  /** List of plugins this plugin depends on */
  dependsOn?: string[];
}
