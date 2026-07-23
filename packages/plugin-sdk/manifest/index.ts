import { Capability } from "../../compiler/types";

export interface PluginManifest {
  id: string;
  version: string;
  apiVersion: string; // The version of the Plugin SDK API this plugin targets
  displayName: string;
  description?: string;
  capabilities: readonly Capability[];
  minimumKOSVersion: string;
  
  engine?: boolean;
  kxe?: boolean;
  renderer?: boolean;
}
