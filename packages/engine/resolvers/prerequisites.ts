import { GraphNode, GraphStore, GraphQueries } from "../../graph/index";
import { EngineContext, Prerequisite } from "../types";
import { ReasoningPolicy } from "../policy";

export class PrerequisiteResolver {
  constructor(private readonly policy: ReasoningPolicy) {}

  public resolve(node: GraphNode, context: EngineContext, graph: GraphStore): Prerequisite[] {
    const queries = new GraphQueries(graph);
    
    // Traversing 'outgoing' for 'requires' dependencies. 
    // Wait, if node A requires node B, then A causes B? 
    // We haven't defined 'requires' exactly, but 'supersedes' or 'implements' could act as prereqs.
    // Let's assume 'implements' and 'causes' are used as a proxy for prerequisites for now.
    
    const maxDepth = this.policy.maxPrerequisiteDepth;
    const result = queries.traverse(node.id, { 
      maxDepth, 
      direction: "outgoing",
      relationshipTypes: ["causes", "implements"] // nodes this node builds upon
    });

    // In a mature schema, we would parse edge metadata to determine "required" vs "optional"
    // For now, nodes found at depth 1 are "required", depth > 1 are "recommended"
    // But GraphQueries traversal doesn't currently tell us the exact depth a node was found.
    // So we'll just treat everything directly adjacent as required, and mock the rest.
    
    const prereqs: Prerequisite[] = [];
    const directOutgoing = new Set(graph.getOutgoing(node.id).map(e => e.targetId));

    for (const reqNode of result.nodes) {
      const isDirect = directOutgoing.has(reqNode.id);
      
      prereqs.push({
        node: reqNode,
        level: isDirect ? "required" : "recommended"
      });
    }

    return prereqs;
  }
}
