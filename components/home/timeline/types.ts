export interface TimelineEventData {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: string;
  storySlug: string;
  headline: string;
  evidenceScore: number;
  relatedStoriesCount: number;
  relatedTopicsCount: number;
  relatedEntitiesCount: number;
}
