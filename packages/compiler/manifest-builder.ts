import { KnowledgeManifest, NodeType } from "./types";
import { ManifestValidationError } from "./errors";

export class ManifestBuilder {
  private nodeId?: string;
  private nodeType?: NodeType;
  private metadata?: KnowledgeManifest["metadata"];
  private relationships: KnowledgeManifest["relationships"] = [];
  private journeys?: KnowledgeManifest["journeys"];

  public withNode(id: string, type: NodeType): this {
    this.nodeId = id;
    this.nodeType = type;
    return this;
  }

  public withMetadata(metadata: KnowledgeManifest["metadata"]): this {
    this.metadata = metadata;
    return this;
  }

  public withRelationships(relationships: KnowledgeManifest["relationships"]): this {
    this.relationships = relationships;
    return this;
  }

  public withJourneys(journeys: KnowledgeManifest["journeys"]): this {
    this.journeys = journeys;
    return this;
  }

  public build(): KnowledgeManifest {
    // Assert structural invariants
    if (!this.nodeId || !this.nodeType || !this.metadata || !this.journeys) {
      throw new ManifestValidationError(
        "Cannot build KnowledgeManifest: Missing required properties (nodeId, nodeType, metadata, or journeys)."
      );
    }
    if (!this.journeys.defaultJourneyId) {
      throw new ManifestValidationError(
        "Cannot build KnowledgeManifest: Missing default journey assignment."
      );
    }

    // Self-reference validation could be here or handled in relationships.ts
    // Check it here for safety
    if (this.relationships.some((r) => r.targetNodeId === this.nodeId)) {
      throw new ManifestValidationError(
        `Cannot build KnowledgeManifest: Self-referencing relationship detected for node ${this.nodeId}.`,
        "REL-201"
      );
    }

    // De-duplicate capabilities & relationships
    const uniqueCapabilities = Array.from(new Set(this.metadata.capabilities));
    const uniqueRelations = this.relationships.filter(
      (rel, index, self) =>
        index ===
        self.findIndex(
          (r) => r.type === rel.type && r.targetNodeId === rel.targetNodeId
        )
    );

    // Apply canonical sorting rules
    uniqueCapabilities.sort(); // Alphabetical
    uniqueRelations.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.targetNodeId.localeCompare(b.targetNodeId);
    });

    return {
      manifestVersion: "1.0",
      schemaVersion: "1.0",
      compilerVersion: "1.0",
      generatedAt: new Date().toISOString(),
      nodeId: this.nodeId,
      nodeType: this.nodeType,
      metadata: {
        ...this.metadata,
        capabilities: uniqueCapabilities,
      },
      relationships: uniqueRelations,
      journeys: this.journeys,
    };
  }
}
