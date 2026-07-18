import { GraphStore, GraphNode } from "../graph/types";
import { Capability } from "../compiler/types";

export interface EngineDiagnostic {
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface EngineContext {
  activeNodeId: string;
  activeJourneyId?: string;
  readerLevel?: string;
  enabledCapabilities?: Capability[];
  maxRecommendations?: number;
  evidenceThreshold?: "high" | "medium" | "low";
  diagnostics?: EngineDiagnostic[];
}

export interface SessionMetadata {
  engineVersion: string;
  graphVersion: string;
  policyVersion: string;
  generatedAt: string;
  reasoningDurationMs: number;
}

export interface Recommendation {
  node: GraphNode;
  score: number;
  reason: string;
  relationship?: string;
  provenance: { sourceId: string; targetId: string; type: string }[];
}

export interface Prerequisite {
  node: GraphNode;
  level: "required" | "recommended" | "optional";
}

export interface ActiveJourney {
  id: string;
  nextSteps: GraphNode[];
  previousSteps: GraphNode[];
}

export interface SessionExtension {
  id: string;
  version: string;
  data: unknown;
}

export interface ResolvedKnowledgeSession {
  sessionMetadata: SessionMetadata;
  currentNode: GraphNode;
  activeJourney: ActiveJourney;
  capabilities: Capability[];
  recommendations: Recommendation[];
  prerequisites: Prerequisite[];
  relevantEvidence: any[]; // Evidence items from the compiler manifest
  diagnostics: EngineDiagnostic[];
  extensions: Record<string, SessionExtension>;
}

export interface RankingStrategy {
  rank(node: GraphNode, context: EngineContext, graph: GraphStore): Recommendation[];
}

export interface EnginePluginContext {
  currentNode: GraphNode;
  context: EngineContext;
  graph: GraphStore;
}

export interface EnginePlugin {
  id: string;
  supports(session: ResolvedKnowledgeSession): boolean;
  resolve(ctx: EnginePluginContext): SessionExtension | null;
}
