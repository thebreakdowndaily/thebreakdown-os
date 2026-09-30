import { DiffResult } from '../change-detector/ChangeDetector';
import { EditorialTask } from '@/types/canonical';
import { getSource } from '@/lib/knowledge/source-registry';
import { getPublicStories } from '@/utils/data-layer/store';

export class ImpactAnalyzer {
  async analyze(diff: DiffResult): Promise<EditorialTask[]> {
    if (!diff.hasChanges) return [];

    const source = getSource(diff.sourceId);
    const affectedStoriesSet = new Set<string>();
    const affectedTopicsSet = new Set<string>();
    const affectedEntitiesSet = new Set<string>();
    const affectedClaimsSet = new Set<string>();

    // 1. Direct linkage from canonical source registry
    if (source) {
      (source.storyIds || []).forEach(s => affectedStoriesSet.add(s));
      (source.claimIds || []).forEach(c => affectedClaimsSet.add(c));
    }

    // 2. Diff-level claim changes
    for (const change of diff.claimChanges) {
      if (change.newText) affectedClaimsSet.add(change.newText);
      if (change.oldText) affectedClaimsSet.add(change.oldText);
    }

    // 3. Scan public stories in store for citations or referenced claims
    try {
      const { data: stories } = getPublicStories({ pageSize: 100 });
      for (const story of stories) {
        let isStoryAffected = false;

        // Check if story explicitly links this source
        if (story.sources?.some(s => s.name === diff.sourceId || s.url === diff.sourceId || s.name === source?.title)) {
          isStoryAffected = true;
        }

        // Check if story claims overlap with affected claims
        if (!isStoryAffected && story.claims) {
          for (const sc of story.claims) {
            const matchesClaim = (sc.id && affectedClaimsSet.has(sc.id)) || affectedClaimsSet.has(sc.claim);
            if (sc.source === diff.sourceId || matchesClaim) {
              isStoryAffected = true;
              if (sc.id) affectedClaimsSet.add(sc.id);
              affectedClaimsSet.add(sc.claim);
              break;
            }
          }
        }

        if (isStoryAffected) {
          affectedStoriesSet.add(story.slug || story.id);
          if (story.category) affectedTopicsSet.add(story.category);
          (story.relatedTopicIds || []).forEach(t => affectedTopicsSet.add(t));
          if (story.primaryEntityId) affectedEntitiesSet.add(story.primaryEntityId);
        }
      }
    } catch {
      // Fallback if data layer is uninitialized in standalone unit tests
    }

    // Severity & Priority calculation: Distinguish affected stories from isolated changes
    const hasModifications = diff.claimChanges.some(c => c.type === 'modified' || c.type === 'removed');
    const isTier1 = source?.tier === 1;
    const isDisputed = source?.verificationStatus === 'disputed' || source?.verificationStatus === 'retracted';

    let priority: EditorialTask['priority'] = 'low';
    let severity: EditorialTask['severity'] = 'minor';

    if (isDisputed) {
      priority = 'critical';
      severity = 'blocker';
    } else if (affectedStoriesSet.size > 0) {
      if (isTier1 && hasModifications) {
        priority = 'critical';
        severity = 'blocker';
      } else if (hasModifications || affectedStoriesSet.size > 2) {
        priority = 'high';
        severity = 'major';
      } else {
        priority = 'medium';
        severity = 'minor';
      }
    } else {
      // Zero published stories affected: isolated background source amendment
      priority = 'low';
      severity = 'minor';
    }

    const task: EditorialTask = {
      id: `task-${diff.sourceId}-${Date.now()}`,
      title: `Source Change Review: ${source?.title || diff.sourceId}`,
      priority,
      severity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: {
        sourceId: diff.sourceId,
        diffSummary: `${diff.claimChanges.length} claim change(s) detected across ${affectedStoriesSet.size} affected story/stories`,
        url: source?.url,
      },
      affectedContent: {
        stories: Array.from(affectedStoriesSet),
        topics: Array.from(affectedTopicsSet),
        entities: Array.from(affectedEntitiesSet),
        claims: Array.from(affectedClaimsSet),
      },
      status: 'pending', // HUMAN REVIEW BOUNDARY: Requires verification desk signoff
    };

    return [task];
  }
}
