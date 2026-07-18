import { createEnginePlugin, EnginePluginContext } from "../../../packages/plugin-sdk";
import { timelineManifest } from "../manifest";

export interface TimelineEvent {
  nodeId: string;
  title: string;
  summary: string;
  startYear: number;
  endYear?: number;
}

export interface TimelineExtensionData {
  events: TimelineEvent[];
  activeWindowStart: number;
  activeWindowEnd: number;
}

export const TimelineEnginePlugin = createEnginePlugin<TimelineExtensionData>({
  manifest: timelineManifest,
  resolve: (ctx: EnginePluginContext) => {
    const events: TimelineEvent[] = [];
    const nodes = ctx.graph.getAllNodes(); // using getAllNodes from GraphStore
    
    let minYear = Infinity;
    let maxYear = -Infinity;

    for (const node of nodes) {
      const temporal = (node.metadata as any)?.temporal;
      if (temporal && temporal.start) {
        const startMatch = String(temporal.start).match(/\d{4}/);
        if (startMatch) {
          const startYear = parseInt(startMatch[0], 10);
          let endYear = undefined;

          if (temporal.end) {
            const endMatch = String(temporal.end).match(/\d{4}/);
            if (endMatch) {
              endYear = parseInt(endMatch[0], 10);
            }
          }

          minYear = Math.min(minYear, startYear);
          maxYear = Math.max(maxYear, endYear || startYear);

          events.push({
            nodeId: node.id,
            title: String(node.metadata?.title || "Untitled"),
            summary: String(node.metadata?.summary || ""),
            startYear,
            endYear
          });
        }
      }
    }

    if (events.length === 0) {
      return {
        events: [],
        activeWindowStart: new Date().getFullYear(),
        activeWindowEnd: new Date().getFullYear()
      };
    }

    events.sort((a, b) => a.startYear - b.startYear);

    const currentTemporal = (ctx.currentNode.metadata as any)?.temporal;
    let activeStart = minYear;
    let activeEnd = maxYear;

    if (currentTemporal && currentTemporal.start) {
      const currentStartMatch = String(currentTemporal.start).match(/\d{4}/);
      if (currentStartMatch) {
        activeStart = parseInt(currentStartMatch[0], 10) - 5;
        activeEnd = activeStart + 20;
      }
    }

    return {
      events,
      activeWindowStart: activeStart,
      activeWindowEnd: activeEnd
    };
  }
});
