import type { Story, EntityBase, Topic, GraphNode, GraphEdge } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { EditorialAI, type HeadlineSuggestion, type EntitySuggestion, type SourceGap, type FAQSuggestion } from '@/features/ai/editorial';
import { ReaderAI, type SimplifiedStory } from '@/features/ai/reader';

export interface WorkspaceViewModel {
  story: Story;
  relatedEntities: EntityBase[];
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

export async function buildWorkspace(services: Services, storySlug: string): Promise<WorkspaceViewModel | null> {
  const story = await services.stories.getStoryBySlug(storySlug);
  if (!story) return null;

  const editorialAI = new EditorialAI(services);
  const readerAI = new ReaderAI();

  const fullGraph = await services.graph.build();
  const conns = await services.graph.getConnections(story.id, { maxDepth: 1 });

  const relatedEntitiesPromises = (story.relatedEntityIds || []).map(id => services.entities.getEntity(id));
  const relatedEntities = (await Promise.all(relatedEntitiesPromises)).filter(Boolean) as EntityBase[];
  const relatedTopicsPromises = (story.relatedTopicIds || []).map(id => services.topics.getTopic(id));
  const relatedTopics = (await Promise.all(relatedTopicsPromises)).filter((t): t is Topic => !!t);

  return {
    story,
    relatedEntities,
    relatedTopics,
    graphNodes: Array.from(fullGraph.nodes.values()),
    graphEdges: conns.map(c => c.edge),
    ai: {
      headlines: await editorialAI.suggestHeadlines(story),
      missingEntities: (await editorialAI.suggestMissingEntities(story)).slice(0, 5),
      sourceGaps: editorialAI.detectSourceGaps(story),
      faqs: (await editorialAI.suggestFAQs(story)).slice(0, 3),
      simplified: readerAI.simplify(story, 'general'),
      timelineText: readerAI.timelineSummary(story),
    },
  };
}
