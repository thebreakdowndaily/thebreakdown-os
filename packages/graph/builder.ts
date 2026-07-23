import { KnowledgeManifest } from "../compiler/types";
import { GraphEdge, GraphNode } from "./types";
import { GraphContext } from "./context";
import { ImmutableGraphStore } from "./store";

export class GraphBuilder {
  private manifests = new Map<string, KnowledgeManifest>();

  constructor(private readonly context: GraphContext) {}

  public ingest(manifest: KnowledgeManifest): void {
    if (this.manifests.has(manifest.nodeId)) {
      this.context.addDiagnostic({
        code: "GRAPH-001",
        message: `Duplicate node ID detected: ${manifest.nodeId}`,
        severity: "error",
        category: "schema",
      });
      return;
    }
    this.manifests.set(manifest.nodeId, manifest);
  }

  public ingestAll(manifests: KnowledgeManifest[]): void {
    for (const m of manifests) {
      this.ingest(m);
    }
  }

  public build(): ImmutableGraphStore {
    const nodes = new Map<string, GraphNode>();
    const outgoing = new Map<string, GraphEdge[]>();
    const incoming = new Map<string, GraphEdge[]>();

    // 1. Initialize nodes and empty adjacency lists
    for (const [nodeId, manifest] of this.manifests.entries()) {
      nodes.set(nodeId, {
        id: nodeId,
        manifest,
      });
      outgoing.set(nodeId, []);
      incoming.set(nodeId, []);
    }

    // 2. Populate edges
    let edgeCount = 0;
    for (const manifest of this.manifests.values()) {
      for (const rel of manifest.relationships) {
        const edge: GraphEdge = {
          sourceId: manifest.nodeId,
          targetId: rel.targetNodeId,
          type: rel.type,
        };

        // Outgoing
        outgoing.get(manifest.nodeId)!.push(edge);

        // Incoming (target might not exist yet, we handle dangling refs in validator, 
        // but we need to record incoming if target exists)
        if (!incoming.has(rel.targetNodeId)) {
          incoming.set(rel.targetNodeId, []);
        }
        incoming.get(rel.targetNodeId)!.push(edge);
        
        edgeCount++;
      }
    }

    // 3. Update Statistics
    this.context.updateStatistics({
      nodeCount: nodes.size,
      edgeCount,
    });

    return new ImmutableGraphStore(nodes, outgoing, incoming);
  }
}
