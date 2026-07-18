// plugins/relationship-graph/manifest.ts

import { PluginManifest, Capability } from "../../packages/plugin-sdk";

export const relationshipGraphManifest: PluginManifest = {
  id: "relationship-graph",
  version: "1.0.0",
  apiVersion: "1.0.0",
  displayName: "Relationship Graph",
  description: "Semantic graph exploration plugin with deterministic traversal and analytics.",
  capabilities: [Capability.RelationshipGraph],
  minimumKOSVersion: "1.0.0",
  engine: true,
  kxe: true,
  renderer: true,
};
