export * from "./manifest";
export * from "./engine";
export * from "./kxe";
export * from "./renderer";
export * from "./version";
export * from "./compatibility";
export * from "./registry";

// Re-export core types commonly used by plugin authors
export { Capability, RelationshipType, NodeType, EvidenceConfidence, KnowledgeManifest } from "../compiler/types";
export { GraphNode, GraphEdge, GraphStore } from "../graph/types";
export { EngineContext, ResolvedKnowledgeSession, SessionExtension } from "../engine/types";
export { ExperienceState, ExperienceAction } from "../kxe/types";
