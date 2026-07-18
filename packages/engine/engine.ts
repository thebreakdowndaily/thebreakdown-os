import { GraphStore } from "../graph/types";
import { EngineContext, ResolvedKnowledgeSession, EnginePlugin, SessionExtension } from "./types";
import { ReasoningPolicy, DefaultReasoningPolicy } from "./policy";

import { JourneyResolver } from "./resolvers/journey";
import { RankingResolver, SharedEdgeRankingStrategy } from "./resolvers/ranking";
import { CapabilityResolver } from "./resolvers/capabilities";
import { EvidenceResolver } from "./resolvers/evidence";
import { PrerequisiteResolver } from "./resolvers/prerequisites";

export class KnowledgeEngine {
  private readonly journeyResolver: JourneyResolver;
  private readonly rankingResolver: RankingResolver;
  private readonly capabilityResolver: CapabilityResolver;
  private readonly evidenceResolver: EvidenceResolver;
  private readonly prerequisiteResolver: PrerequisiteResolver;

  constructor(
    private readonly graph: GraphStore,
    private readonly policy: ReasoningPolicy = DefaultReasoningPolicy,
    private readonly plugins: EnginePlugin[] = []
  ) {
    this.journeyResolver = new JourneyResolver();
    this.rankingResolver = new RankingResolver(new SharedEdgeRankingStrategy(this.policy));
    this.capabilityResolver = new CapabilityResolver();
    this.evidenceResolver = new EvidenceResolver(this.policy);
    this.prerequisiteResolver = new PrerequisiteResolver(this.policy);
  }

  public resolveSession(context: EngineContext): ResolvedKnowledgeSession {
    const startMs = Date.now();
    const diagnostics = context.diagnostics || [];
    
    // 1. Resolve Context (Locate starting node)
    const currentNode = this.graph.getNode(context.activeNodeId);
    if (!currentNode) {
      diagnostics.push({
        type: "NODE_NOT_FOUND",
        message: `Node '${context.activeNodeId}' not found in graph.`,
        timestamp: new Date().toISOString()
      });
      throw new Error(`KnowledgeEngine: Node '${context.activeNodeId}' not found in graph.`);
    }

    // 2. Resolve Journey
    const activeJourney = this.journeyResolver.resolve(currentNode, context, this.graph);
    if (context.activeJourneyId && context.activeJourneyId !== activeJourney.id) {
      diagnostics.push({
        type: "JOURNEY_FALLBACK",
        message: `Requested journey '${context.activeJourneyId}' was invalid. Fell back to '${activeJourney.id}'.`,
        timestamp: new Date().toISOString()
      });
    }

    // 3. Resolve Capabilities
    const capabilities = this.capabilityResolver.resolve(currentNode, context);

    // 4. Resolve Evidence
    const relevantEvidence = this.evidenceResolver.resolve(currentNode, context);

    // 5. Resolve Prerequisites
    const prerequisites = this.prerequisiteResolver.resolve(currentNode, context, this.graph);

    // 6. Resolve Recommendations
    const recommendations = this.rankingResolver.resolve(currentNode, context, this.graph);

    // 7. Assemble Base Session
    const reasoningDurationMs = Date.now() - startMs;

    const session: ResolvedKnowledgeSession = {
      sessionMetadata: {
        engineVersion: "1.0",
        graphVersion: "1.0", // ideally read from this.graph metadata when wired
        policyVersion: this.policy.version,
        generatedAt: new Date().toISOString(),
        reasoningDurationMs
      },
      currentNode,
      activeJourney,
      capabilities,
      relevantEvidence,
      prerequisites,
      recommendations,
      diagnostics,
      extensions: {}
    };

    // 8. Execute Engine Plugins deterministically
    for (const plugin of this.plugins) {
      try {
        if (plugin.supports(session)) {
          const extension = plugin.resolve({ currentNode, context, graph: this.graph });
          if (extension) {
            session.extensions[plugin.id] = extension;
          }
        }
      } catch (err: any) {
        session.diagnostics.push({
          type: "PLUGIN_ERROR",
          message: `EnginePlugin '${plugin.id}' failed during resolution: ${err.message}`,
          timestamp: new Date().toISOString()
        });
        // We isolate the failure; the session resolves successfully without this plugin's extensions.
      }
    }

    return session;
  }
}
