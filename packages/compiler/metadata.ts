import { EvidenceConfidence, KnowledgeManifest } from "./types";
import { CompilerContext } from "./context";
import { ParseError } from "./errors";

export function extractMetadata(
  node: any,
  context: CompilerContext
): KnowledgeManifest["metadata"] {
  if (!node) {
    throw new ParseError("Node cannot be null or undefined");
  }

  // Base fields
  const title = node.title || node.name;
  const summary = node.summary || node.description || "";

  // Validate required metadata
  if (!title) {
    context.addDiagnostic({
      code: "KCOMP-010",
      message: "Node is missing a title",
      severity: "error",
      category: "schema",
      field: "title",
    });
  }

  // Evidence Confidence
  let evidenceConfidence: EvidenceConfidence = "low";
  if (
    node.evidenceConfidence === "high" ||
    node.evidenceConfidence === "medium" ||
    node.evidenceConfidence === "low"
  ) {
    evidenceConfidence = node.evidenceConfidence as EvidenceConfidence;
  } else if (node.evidenceConfidence) {
    context.addDiagnostic({
      code: "VALIDATION-105",
      message: `Invalid evidence confidence value: ${node.evidenceConfidence}`,
      severity: "warning",
      category: "schema",
      field: "evidenceConfidence",
    });
  }

  // Extract raw capabilities if defined (inference will handle additional ones later)
  const baseCapabilities = Array.isArray(node.capabilities)
    ? node.capabilities
    : [];

  // Temporal Metadata
  let temporal: KnowledgeManifest["metadata"]["temporal"] = undefined;
  if (node.temporal) {
    if (!node.temporal.start) {
      context.addDiagnostic({
        code: "VALIDATION-106",
        message: "Temporal metadata missing 'start'",
        severity: "warning",
        category: "schema",
        field: "temporal.start",
      });
    } else {
      temporal = {
        start: String(node.temporal.start),
        end: node.temporal.end ? String(node.temporal.end) : undefined,
        precision: node.temporal.precision || "approximate"
      };
    }
  }

  // Citations Metadata
  let citations: KnowledgeManifest["metadata"]["citations"] = undefined;
  if (node.citations) {
    citations = {
      preferredStyle: node.citations.preferredStyle ? String(node.citations.preferredStyle) : undefined,
      primarySource: node.citations.primarySource ? String(node.citations.primarySource) : undefined,
      lastVerified: node.citations.lastVerified ? String(node.citations.lastVerified) : undefined,
    };
  }

  return {
    title: title || "Untitled",
    summary,
    capabilities: baseCapabilities,
    evidenceConfidence,
    temporal,
    citations,
  };
}
