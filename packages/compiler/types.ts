export const Capability = {
  Timeline: "timeline",
  Comparison: "comparison",
  Simulation: "simulation",
  Debate: "debate",
  Metrics: "metrics",
  Map: "map",
  Citations: "citations",
  RelationshipGraph: "relationshipGraph",
} as const;
export type Capability = typeof Capability[keyof typeof Capability];

export const RelationshipType = {
  Causes: "causes",
  Contradicts: "contradicts",
  Implements: "implements",
  Measures: "measures",
  Supersedes: "supersedes",
  Before: "before",
  After: "after",
  Contemporary: "contemporary",
  Supports: "supports",
  Refutes: "refutes",
  Cites: "cites",
} as const;
export type RelationshipType = typeof RelationshipType[keyof typeof RelationshipType];

export const NodeType = {
  Fix: "fix",
  Investigation: "investigation",
  Chapter: "chapter",
  Dataset: "dataset",
  Law: "law",
  Entity: "entity",
  Metric: "metric",
  Claim: "claim",
  Evidence: "evidence",
  Source: "source",
} as const;
export type NodeType = typeof NodeType[keyof typeof NodeType];

export const EvidenceConfidence = {
  High: "high",
  Medium: "medium",
  Low: "low",
} as const;
export type EvidenceConfidence = typeof EvidenceConfidence[keyof typeof EvidenceConfidence];

export const Severity = {
  Info: "info",
  Warning: "warning",
  Error: "error",
} as const;
export type Severity = typeof Severity[keyof typeof Severity];

export type ValidationCategory =
  | "schema"
  | "relationship"
  | "capability"
  | "journey"
  | "version";

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: Severity;
  category: ValidationCategory;
}

export interface ValidationResult {
  valid: boolean;
  diagnostics: ValidationError[];
}

export type TemporalValue = string; // e.g. '1947', 'August 1947', '15 August 1947', '1500 BCE'

export interface TemporalMetadata {
  start: TemporalValue;
  end?: TemporalValue;
  precision: "year" | "month" | "day" | "approximate";
}

export interface CitationMetadata {
  preferredStyle?: string;
  primarySource?: string;
  lastVerified?: string;
}

export interface KnowledgeManifest {
  manifestVersion: "1.0";
  schemaVersion: "1.0";
  compilerVersion: "1.0";
  generatedAt: string;
  nodeId: string;
  nodeType: NodeType;
  metadata: {
    title: string;
    summary: string;
    capabilities: Capability[];
    evidenceConfidence: EvidenceConfidence;
    temporal?: TemporalMetadata;
    citations?: CitationMetadata;
  };
  relationships: Array<{
    type: RelationshipType;
    targetNodeId: string;
  }>;
  journeys: {
    defaultJourneyId: string;
    alternativeJourneyIds: string[];
  };
}
