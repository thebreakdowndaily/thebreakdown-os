import { GraphNode, GraphStore } from "../../graph/types";
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
      .filter(edge => edge.type === "next")
      // In a real system, we'd also filter by edge metadata matching the activeJourneyId,
      // but since edges in our compiler don't yet have property maps, we'll just return 
      // the adjacent nodes.
      .map(edge => graph.getNode(edge.targetId)!)
      .filter(Boolean)
      .sort((a, b) => a.id.localeCompare(b.id)); // deterministic

    // 3. Previous Steps (incoming 'next' edges)
    const previousSteps = graph.getIncoming(node.id)
      .filter(edge => edge.type === "next")
      .map(edge => graph.getNode(edge.sourceId)!)
      .filter(Boolean)
      .sort((a, b) => a.id.localeCompare(b.id)); // deterministic

    return {
      id: activeJourneyId!,
      nextSteps,
      previousSteps
    };
  }
}
