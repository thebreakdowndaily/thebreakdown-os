// plugins/relationship-graph/index.ts

import { createPlugin } from "../../packages/plugin-sdk";
import { relationshipGraphManifest } from "./manifest";
import { RelationshipGraphEnginePlugin } from "./engine";
import { RelationshipGraphKxePlugin } from "./kxe";
import { RelationshipGraphRenderer } from "./renderer";

/**
 * Export the single KOSPlugin for the Relationship Graph plugin.
 * The Plugin Registry will handle registration, compatibility, and lifecycle.
 */
export const RelationshipGraphPlugin = createPlugin({
  manifest: relationshipGraphManifest,
  engine: RelationshipGraphEnginePlugin,
  kxe: RelationshipGraphKxePlugin,
  renderer: RelationshipGraphRenderer,
});
