import { DiffResult } from '../change-detector/ChangeDetector';
import { EditorialTask } from '@/types/canonical';

export class ImpactAnalyzer {
  async analyze(diff: DiffResult): Promise<EditorialTask[]> {
    if (!diff.hasChanges) return [];

    // Mock graph traversal: find affected stories, topics, entities
    const affectedStories = ['story-1', 'story-2'];
    const affectedTopics = ['economy'];
    const affectedEntities = ['rbi'];

    const task: EditorialTask = {
      id: `task-${Date.now()}`,
      title: `Source Update: ${diff.sourceId}`,
      priority: 'medium', // Will be mutated by RulesEngine
      severity: 'minor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: {
        sourceId: diff.sourceId,
        diffSummary: `${diff.claimChanges.length} claims changed`,
      },
      affectedContent: {
        stories: affectedStories,
        topics: affectedTopics,
        entities: affectedEntities,
        claims: []
      },
      status: 'pending'
    };

    return [task];
  }
}
