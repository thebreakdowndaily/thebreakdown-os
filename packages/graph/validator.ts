import { GraphStore } from "./types";
import { GraphContext } from "./context";
import { RelationshipType } from "../compiler/types";

export class GraphValidator {
  constructor(private readonly context: GraphContext) {}

  public validate(store: GraphStore): void {
    this.checkDanglingReferences(store);
    this.checkCycles(store);
  }

  private checkDanglingReferences(store: GraphStore): void {
    const edges = store.getAllEdges();
    
    for (const edge of edges) {
      if (!store.exists(edge.targetId)) {
        this.context.addDiagnostic({
          code: "GRAPH-002",
          message: `Dangling reference: Node '${edge.sourceId}' points to non-existent target '${edge.targetId}'`,
          severity: this.context.config.strictMode ? "error" : "warning",
          category: "relationship",
        });
      }
    }
  }

  private checkCycles(store: GraphStore): void {
    const acyclicTypes: RelationshipType[] = ["causes", "implements", "supersedes"];
    const nodes = store.getAllNodes();

    for (const type of acyclicTypes) {
      // Cycle detection using DFS with a visited and recursion stack map
      const visited = new Set<string>();
      const recStack = new Set<string>();

      const isCyclic = (nodeId: string): boolean => {
        if (!visited.has(nodeId)) {
          visited.add(nodeId);
          recStack.add(nodeId);

          const edges = store.getOutgoing(nodeId).filter((e) => e.type === type);
          for (const edge of edges) {
            if (!visited.has(edge.targetId) && isCyclic(edge.targetId)) {
              return true;
            } else if (recStack.has(edge.targetId)) {
              this.context.addDiagnostic({
                code: "GRAPH-003",
                message: `Cycle detected involving node '${edge.targetId}' via '${type}' relationship. Cycles are not allowed for this relationship type.`,
                severity: "error",
                category: "relationship",
              });
              return true;
            }
          }
        }
        recStack.delete(nodeId);
        return false;
      };

      for (const node of nodes) {
        if (!visited.has(node.id)) {
          isCyclic(node.id);
        }
      }
    }
  }
}
