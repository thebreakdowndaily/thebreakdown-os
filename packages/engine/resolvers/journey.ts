import { GraphNode, GraphStore } from "../../graph/types";
import { RelationshipType } from "../../compiler/types";
import { ActiveJourney, EngineContext } from "../types";

export class JourneyResolver {
  public resolve(node: GraphNode, context: EngineContext, graph: GraphStore): ActiveJourney {
    // 1. Fallback logic: Use activeJourneyId if requested and valid, else node's default
    let activeJourneyId = context.activeJourneyId;
    const isValidJourney = activeJourneyId && 
      (activeJourneyId === node.manifest.journeys.defaultJourneyId || 
       node.manifest.journeys.alternativeJourneyIds.includes(activeJourneyId));

    if (!isValidJourney) {
      activeJourneyId = node.manifest.journeys.defaultJourneyId;
    }

    // 2. Next Steps (outgoing 'next' edges in this journey)
    const nextSteps = graph.getOutgoing(node.id)
      .filter(edge => edge.type === RelationshipType.Next)
      .map(edge => graph.getNode(edge.targetId))
      .filter((n): n is GraphNode => n !== undefined)
      .sort((a, b) => a.id.localeCompare(b.id)); // deterministic

    // 3. Previous Steps (incoming 'next' edges)
    const previousSteps = graph.getIncoming(node.id)
      .filter(edge => edge.type === RelationshipType.Next)
      .map(edge => graph.getNode(edge.sourceId))
      .filter((n): n is GraphNode => n !== undefined)
      .sort((a, b) => a.id.localeCompare(b.id)); // deterministic

    return {
      id: activeJourneyId!,
      nextSteps,
      previousSteps
    };
  }
}
