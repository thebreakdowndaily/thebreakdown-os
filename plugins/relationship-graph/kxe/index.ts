// plugins/relationship-graph/kxe/index.ts

import { createKxePlugin, KxePluginContext } from "../../packages/plugin-sdk";
import { relationshipGraphManifest } from "../manifest";
import { TraversalPolicy, RankingStrategy } from "../../packages/graph/policy";

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

export const RelationshipGraphKxePlugin = createKxePlugin<RelationshipGraphKxeState>({
  manifest: relationshipGraphManifest,
  initialState: defaultKxeState,
  reducers: {
    // Action: relationshipGraph/focusNode
    focusNode(state, action: { type: "relationshipGraph/focusNode"; payload: { nodeId: string } }) {
      return { ...state, focusNodeId: action.payload.nodeId };
    },
    // Action: relationshipGraph/expandNode
    expandNode(state, action: { type: "relationshipGraph/expandNode"; payload: { nodeId: string } }) {
      const newSet = new Set(state.expandedNodeIds);
      newSet.add(action.payload.nodeId);
      return { ...state, expandedNodeIds: newSet };
    },
    // Action: relationshipGraph/collapseNode
    collapseNode(state, action: { type: "relationshipGraph/collapseNode"; payload: { nodeId: string } }) {
      const newSet = new Set(state.expandedNodeIds);
      newSet.delete(action.payload.nodeId);
      return { ...state, expandedNodeIds: newSet };
    },
    // Action: relationshipGraph/setDepth
    setDepth(state, action: { type: "relationshipGraph/setDepth"; payload: { maxDepth: number } }) {
      return { ...state, traversalPolicy: { ...state.traversalPolicy, maxDepth: action.payload.maxDepth } };
    },
    // Action: relationshipGraph/setRelationshipFilter
    setRelationshipFilter(state, action: { type: "relationshipGraph/setRelationshipFilter"; payload: { types: string[] } }) {
      return { ...state, traversalPolicy: { ...state.traversalPolicy, relationshipTypes: action.payload.types } };
    },
    // Action: relationshipGraph/setLayout
    setLayout(state, action: { type: "relationshipGraph/setLayout"; payload: { layout: "hierarchical" | "radial" | "force" } }) {
      return { ...state, layout: action.payload.layout };
    },
    // Action: relationshipGraph/highlightPath
    highlightPath(state, action: { type: "relationshipGraph/highlightPath"; payload: { path: string[] } }) {
      // For simplicity we store the last highlighted path in a temporary field
      return { ...state, highlightedPath: action.payload.path } as any;
    },
    // Action: relationshipGraph/clearHighlight
    clearHighlight(state) {
      const { highlightedPath, ...rest } = state as any;
      return rest as RelationshipGraphKxeState;
    },
    // Action: relationshipGraph/setPolicy – allows full policy replacement
    setPolicy(state, action: { type: "relationshipGraph/setPolicy"; payload: { policy: TraversalPolicy } }) {
      return { ...state, traversalPolicy: action.payload.policy };
    },
  },
});
