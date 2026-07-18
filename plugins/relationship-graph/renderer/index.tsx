// plugins/relationship-graph/renderer/index.tsx

import React from "react";
import { createRenderer } from "../../packages/plugin-sdk";
import { useDispatch } from "../../packages/renderer/hooks";
import { RelationshipGraphExtension } from "../engine";
import { RelationshipGraphKxeState } from "../kxe";
import { relationshipGraphManifest } from "../manifest";

/**
 * Simple hierarchical renderer for the Relationship Graph.
 * It displays nodes and edges in a list; layout computation is delegated to future visualizers.
 */
export const RelationshipGraphRenderer = createRenderer<RelationshipGraphKxeState, RelationshipGraphExtension>({
  manifest: relationshipGraphManifest,
  fallback: <div>Loading Relationship Graph…</div>,
  render: function RelationshipGraphView({ state, pluginState, extensionData }) {
    const dispatch = useDispatch();

    return (
      <div className="relationship-graph-container" style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Relationship Graph</h2>
        <div style={{ marginBottom: "12px" }}>
          <button
            onClick={() => dispatch({ type: "relationshipGraph/focusNode", payload: { nodeId: extensionData.rootNode.id } })}
            style={{ marginRight: "8px" }}
          >
            Focus Root
          </button>
          <button
            onClick={() => dispatch({ type: "relationshipGraph/setDepth", payload: { maxDepth: pluginState.traversalPolicy.maxDepth + 1 } })}
          >
            Increase Depth
          </button>
        </div>
        <h3>Nodes ({extensionData.nodes.length})</h3>
        <ul>
          {extensionData.nodes.map(node => (
            <li key={node.id}>
              <strong>{node.id}</strong>: {node.title ?? "(no title)"}
            </li>
          ))}
        </ul>
        <h3>Edges ({extensionData.edges.length})</h3>
        <ul>
          {extensionData.edges.map(edge => (
            <li key={`${edge.sourceId}->${edge.targetId}`}>[{edge.type}] {edge.sourceId} → {edge.targetId}</li>
          ))}
        </ul>
      </div>
    );
  },
});
