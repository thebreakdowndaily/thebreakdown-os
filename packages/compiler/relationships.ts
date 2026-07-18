import { KnowledgeManifest, RelationshipType } from "./types";
import { CompilerContext } from "./context";
import { RelationshipResolutionError } from "./errors";

export function extractRelationships(
  node: any,
  context: CompilerContext
): KnowledgeManifest["relationships"] {
  const relationships: KnowledgeManifest["relationships"] = [];

  if (!node.relationships) {
    return relationships;
  }

  if (!Array.isArray(node.relationships)) {
    context.addDiagnostic({
      code: "REL-202",
      message: "Node relationships field must be an array",
      severity: "warning",
      category: "relationship",
      field: "relationships",
    });
    return relationships;
  }

  for (const rel of node.relationships) {
    if (!rel.type || !rel.targetNodeId) {
      context.addDiagnostic({
        code: "REL-203",
        message: "Relationship is missing required 'type' or 'targetNodeId'",
        severity: "warning",
        category: "relationship",
      });
      continue;
    }

    // Validate type against known values
    if (!Object.values(RelationshipType).includes(rel.type as RelationshipType)) {
      context.addDiagnostic({
        code: "REL-204",
        message: `Unknown relationship type: ${rel.type}`,
        severity: "warning",
        category: "relationship",
      });
    }

    relationships.push({
      type: rel.type as RelationshipType,
      targetNodeId: rel.targetNodeId,
    });
  }

  return relationships;
}
