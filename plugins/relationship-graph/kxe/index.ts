// plugins/relationship-graph/kxe/index.ts

import { createKXEPlugin } from "../../../packages/plugin-sdk";
import { relationshipGraphManifest } from "../manifest";
import { TraversalPolicy, RankingStrategy } from "../../../packages/graph/policy";

/**
 * The KXE state for the Relationship Graph plugin.
 * It stores the current traversal policy and UI interaction flags.
 */
export interface RelationshipGraphKxeState {
  /** Current traversal policy – can be updated by UI actions. */
  traversalPolicy: TraversalPolicy;
  /** ID of the node currently focused/selected in the UI. */
  focusNodeId?: string;
  /** Set of expanded node IDs (for UI tree/graph expansion). */
  expandedNodeIds: Set<string>;
  /** Layout mode requested by the UI (hierarchical, radial, force‑directed). */
  layout: "hierarchical" | "radial" | "force";
  /** Currently highlighted path. */
  highlightedPath?: string[];
}

const defaultKxeState: RelationshipGraphKxeState = {
  traversalPolicy: {
    maxDepth: 3,
    maxNeighbors: 10,
    relationshipTypes: undefined,
    rankingStrategy: RankingStrategy.BreadthFirst,
    includeCycles: false,
  },
  expandedNodeIds: new Set(),
  layout: "hierarchical",
};

export const RelationshipGraphKxePlugin = createKXEPlugin<RelationshipGraphKxeState>({
  manifest: relationshipGraphManifest,
  initialState: defaultKxeState,
  onActivate: (state, extension) => {
    // If engine output traversalPolicy exists, initialize KXE state with it
    const extData = extension?.data as any;
    return {
      ...defaultKxeState,
      traversalPolicy: extData?.policy ?? defaultKxeState.traversalPolicy,
    };
  },
  onUpdate: (state, action, pluginState) => {
    switch (action.type) {
      case "relationship-graph/focusNode": {
        const payload = action.payload as { nodeId: string };
        return { ...pluginState, focusNodeId: payload.nodeId };
      }
      case "relationship-graph/expandNode": {
        const payload = action.payload as { nodeId: string };
        const newSet = new Set(pluginState.expandedNodeIds);
        newSet.add(payload.nodeId);
        return { ...pluginState, expandedNodeIds: newSet };
      }
      case "relationship-graph/collapseNode": {
        const payload = action.payload as { nodeId: string };
        const newSet = new Set(pluginState.expandedNodeIds);
        newSet.delete(payload.nodeId);
        return { ...pluginState, expandedNodeIds: newSet };
      }
      case "relationship-graph/setDepth": {
        const payload = action.payload as { maxDepth: number };
        return {
          ...pluginState,
          traversalPolicy: { ...pluginState.traversalPolicy, maxDepth: payload.maxDepth },
        };
      }
      case "relationship-graph/setRelationshipFilter": {
        const payload = action.payload as { types: string[] };
        return {
          ...pluginState,
          traversalPolicy: { ...pluginState.traversalPolicy, relationshipTypes: payload.types },
        };
      }
      case "relationship-graph/setLayout": {
        const payload = action.payload as { layout: "hierarchical" | "radial" | "force" };
        return { ...pluginState, layout: payload.layout };
      }
      case "relationship-graph/highlightPath": {
        const payload = action.payload as { path: string[] };
        return { ...pluginState, highlightedPath: payload.path };
      }
      case "relationship-graph/clearHighlight": {
        const { highlightedPath, ...rest } = pluginState;
        return rest;
      }
      case "relationship-graph/setPolicy": {
        const payload = action.payload as { policy: TraversalPolicy };
        return { ...pluginState, traversalPolicy: payload.policy };
      }
      default:
        return pluginState;
    }
  },
});
