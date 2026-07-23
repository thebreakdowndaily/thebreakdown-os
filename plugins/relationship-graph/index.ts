// plugins/relationship-graph/index.ts

import { KOSPlugin } from "../../packages/plugin-sdk/registry";
import { relationshipGraphManifest } from "./manifest";
import { RelationshipGraphEnginePlugin } from "./engine";
import { RelationshipGraphKxePlugin } from "./kxe";
import { RelationshipGraphRenderer } from "./renderer";

/**
 * Export the single KOSPlugin for the Relationship Graph plugin.
 * The Plugin Registry will handle registration, compatibility, and lifecycle.
 */
export const RelationshipGraphPlugin: KOSPlugin = {
  manifest: relationshipGraphManifest,
  engine: RelationshipGraphEnginePlugin,
  kxe: RelationshipGraphKxePlugin,
  renderer: RelationshipGraphRenderer,
};

export * from "./manifest";
export * from "./engine";
export * from "./kxe";
export * from "./renderer";
