import type { Story, Entity, Topic, GraphNode, GraphEdge } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { EditorialAI, type HeadlineSuggestion, type EntitySuggestion, type SourceGap, type FAQSuggestion } from '@/features/ai/editorial';
import { ReaderAI, type SimplifiedStory } from '@/features/ai/reader';
import { GraphService } from '@/lib/graph/graphService';

export interface WorkspaceViewModel {
  story: Story;
  relatedEntities: Entity[];
  relatedTopics: Topic[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  ai: {
    headlines: HeadlineSuggestion[];
    missingEntities: EntitySuggestion[];
    sourceGaps: SourceGap[];
    faqs: FAQSuggestion[];
    simplified: SimplifiedStory;
    timelineText: string;
  };
}

export function buildWorkspace(services: Services, storySlug: string): WorkspaceViewModel | null {
  const story = services.stories.getStoryBySlug(storySlug);
  if (!story) return null;

  const editorialAI = new EditorialAI(services);
  const readerAI = new ReaderAI();
  const graph = new GraphService(services);

  const fullGraph = graph.build();
  const conns = graph.getConnections(story.id, { maxDepth: 1 });

  const relatedEntities = (story.relatedEntityIds || []).map(id => services.entities.getEntity(id)).filter(Boolean) as Entity[];
  const relatedTopics = (story.relatedTopicIds || []).map(id => services.topics.getTopic(id)).filter(Boolean) as Topic[];

  return {
    story,
    relatedEntities,
    relatedTopics,
    graphNodes: Array.from(fullGraph.nodes.values()),
    graphEdges: conns.map(c => c.edge),
    ai: {
      headlines: editorialAI.suggestHeadlines(story),
      missingEntities: editorialAI.suggestMissingEntities(story).slice(0, 5),
      sourceGaps: editorialAI.detectSourceGaps(story),
      faqs: editorialAI.suggestFAQs(story).slice(0, 3),
      simplified: readerAI.simplify(story, 'general'),
      timelineText: readerAI.timelineSummary(story),
    },
  };
}
