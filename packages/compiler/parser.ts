import { CompilerContext } from "./context";
import { KnowledgeManifest, NodeType } from "./types";
import { ManifestBuilder } from "./manifest-builder";
import { extractMetadata } from "./metadata";
import { inferCapabilities } from "./inference";
import { extractRelationships } from "./relationships";
import { ParseError } from "./errors";

export class Parser {
  public parse(node: any, context: CompilerContext): KnowledgeManifest {
    if (!node || typeof node !== "object") {
      throw new ParseError("Input must be a valid node object");
    }

    const nodeId = node.id || node.nodeId;
    if (!nodeId) {
      throw new ParseError("Node is missing a required 'id'");
    }

    const nodeType = node.type || node.nodeType || "chapter";
    if (!Object.values(NodeType).includes(nodeType as NodeType)) {
      context.addDiagnostic({
        code: "KCOMP-011",
        message: `Unknown node type: ${nodeType}`,
        severity: "error",
        category: "schema",
        field: "nodeType",
      });
    }

    // Step 1: Base Metadata extraction
    const baseMetadata = extractMetadata(node, context);

    // Step 2: Capability Inference
    const inferredCapabilities = inferCapabilities(node, baseMetadata.capabilities, context);
    baseMetadata.capabilities = inferredCapabilities;

    // Step 3: Relationship resolution
    const relationships = extractRelationships(node, context);

    // Step 4: Journeys (default/alternative)
    const journeys = {
      defaultJourneyId: node.defaultJourneyId || "default",
      alternativeJourneyIds: Array.isArray(node.alternativeJourneyIds)
        ? node.alternativeJourneyIds
        : [],
    };

    // Step 5: Manifest construction via Builder
    const builder = new ManifestBuilder()
      .withNode(nodeId, nodeType as NodeType)
      .withMetadata(baseMetadata)
      .withRelationships(relationships)
      .withJourneys(journeys);

    return builder.build();
  }
}
