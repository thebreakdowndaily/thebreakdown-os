export * from "./manifest";
export * from "./engine";
export * from "./kxe";
export * from "./renderer";
export * from "./version";
export * from "./compatibility";
export * from "./registry";

// Re-export core values (const objects) and types commonly used by plugin authors
// Capability, RelationshipType, NodeType, EvidenceConfidence are dual: both const objects and types.
export { Capability, RelationshipType, NodeType, EvidenceConfidence } from "../compiler/types";
export type { KnowledgeManifest } from "../compiler/types";
export type { GraphNode, GraphEdge, GraphStore } from "../graph/types";
export type { EngineContext, EnginePluginContext, ResolvedKnowledgeSession, SessionExtension } from "../engine/types";
export type { ExperienceState, ExperienceAction } from "../kxe/types";
