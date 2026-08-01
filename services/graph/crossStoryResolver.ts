// services/graph/crossStoryResolver.ts
// Cross-Story Intelligence Resolver — Produces deterministic, explainable, ranked story connections.
// Read-only service layer over KnowledgeGraphService and KnowledgeCore.

import { getKnowledgeCore } from '@/lib/knowledge/knowledge-core';
import { getStore } from '@/utils/data-layer/store';

export interface CrossStoryRecommendation {
  targetStorySlug: string;
  targetStoryTitle: string;
  targetStoryCategory: string;
  score: number;
  qualityRating: 'STRONG' | 'RELEVANT' | 'WEAK' | 'MISLEADING';
  relationshipBasis: string;
  explanation: string;
  sharedClaimIds: string[];
  sharedEntityIds: string[];
  sharedTopicIds: string[];
}

export interface CrossStoryMatrixResult {
  sourceStorySlug: string;
  sourceStoryTitle: string;
  recommendations: CrossStoryRecommendation[];
}

export class CrossStoryIntelligenceResolver {
  public async resolveForStory(storySlug: string, limit = 5): Promise<CrossStoryRecommendation[]> {
    const core = getKnowledgeCore();
    const store = getStore();

    // 1. Fetch all stories
    const allStories = Array.from(store.stories.values());
    const sourceStory = allStories.find(s => s.slug === storySlug || s.id === storySlug);

    if (!sourceStory) return [];

    const allClaims = core.claims.all();

    // Helper to get all claim IDs associated with a story
    const getStoryClaimIds = (story: any): Set<string> => {
      const ids = new Set<string>();
      allClaims.forEach(c => {
        if (c.appearsIn.some(item => item.contentId === story.slug || item.contentId === story.id)) {
          ids.add(c.id);
        }
      });
      if (Array.isArray(story.claims)) {
        story.claims.forEach((sc: any) => { if (sc.id) ids.add(sc.id); });
      }
      if (Array.isArray(story.claimIds)) {
        story.claimIds.forEach((id: string) => ids.add(id));
      }
      return ids;
    };

    const sourceClaimIds = getStoryClaimIds(sourceStory);
    const sourceEntityIds = new Set(sourceStory.relatedEntityIds || []);
    const sourceTopicIds = new Set(sourceStory.relatedTopicIds || []);

    const candidates: CrossStoryRecommendation[] = [];

    // 3. Rank other stories (Enforce Canonical Publication Gate: PUBLIC + RESOLVABLE targets only)
    for (const targetStory of allStories) {
      if (targetStory.slug === sourceStory.slug || targetStory.id === sourceStory.id) continue;
      if (targetStory.publicationStatus && targetStory.publicationStatus !== 'published') continue;

      const targetClaimIds = getStoryClaimIds(targetStory);
      const sharedClaimIds = Array.from(targetClaimIds).filter(id => sourceClaimIds.has(id));
      const sharedClaims = allClaims.filter(c => sharedClaimIds.includes(c.id));

      const targetEntityIds = targetStory.relatedEntityIds || [];
      const sharedEntityIds = targetEntityIds.filter(id => sourceEntityIds.has(id));

      const targetTopicIds = targetStory.relatedTopicIds || [];
      const sharedTopicIds = targetTopicIds.filter(id => sourceTopicIds.has(id));

      // Phase 12 Semantic Eligibility Gate:
      // Must have at least 1 shared claim, 1 shared entity, or 1 shared topic.
      // Category-only overlap and generic-tag-only overlap do NOT independently qualify!
      const hasSubstantiveSemanticAnchor = 
        sharedClaimIds.length > 0 || 
        sharedEntityIds.length > 0 || 
        sharedTopicIds.length > 0;

      if (!hasSubstantiveSemanticAnchor) continue;

      // Deterministic Scoring Formula (Frozen Phase 11 Baseline Weights):
      // Category Match = 2.0 | Topic Match = 1.5 per topic | Entity Match = 3.0 per entity | Shared Claim = 5.0 per claim
      const categoryMatchScore = targetStory.category === sourceStory.category ? 2.0 : 0;
      const topicScore = sharedTopicIds.length * 1.5;
      const entityScore = sharedEntityIds.length * 3.0;
      const claimScore = sharedClaimIds.length * 5.0;

      const score = categoryMatchScore + topicScore + entityScore + claimScore;

      if (score === 0) continue;

      // Determine Quality Rating
      let qualityRating: CrossStoryRecommendation['qualityRating'] = 'RELEVANT';
      if (score >= 6.0 || sharedClaimIds.length >= 1) {
        qualityRating = 'STRONG';
      } else {
        qualityRating = 'RELEVANT';
      }

      // Generate Human-Readable Explanation & Relationship Basis
      let relationshipBasis = '';
      let explanation = '';

      if (sharedClaims.length > 0) {
        relationshipBasis = `Shares ${sharedClaims.length} verified canonical claim(s)`;
        explanation = `Connected through shared canonical evidence proposition "${sharedClaims[0].statement.substring(0, 70)}..."`;
      } else if (sharedEntityIds.length > 0) {
        relationshipBasis = `Shares primary entity [${sharedEntityIds[0]}]`;
        explanation = `Both stories analyze key strategic policy decisions involving ${sharedEntityIds[0]}.`;
      } else {
        relationshipBasis = `Shares topic area [${sharedTopicIds[0] || sourceStory.category}]`;
        explanation = `Cross-referenced under shared theme ${sharedTopicIds[0] || sourceStory.category}.`;
      }

      candidates.push({
        targetStorySlug: targetStory.slug,
        targetStoryTitle: targetStory.headline,
        targetStoryCategory: targetStory.category,
        score,
        qualityRating,
        relationshipBasis,
        explanation,
        sharedClaimIds,
        sharedEntityIds,
        sharedTopicIds,
      });
    }

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, limit);
  }

  public async generateFullMatrix(): Promise<CrossStoryMatrixResult[]> {
    const store = getStore();
    const allStories = Array.from(store.stories.values());

    const matrix: CrossStoryMatrixResult[] = [];

    for (const story of allStories) {
      const recommendations = await this.resolveForStory(story.slug, 5);
      matrix.push({
        sourceStorySlug: story.slug,
        sourceStoryTitle: story.headline,
        recommendations,
      });
    }

    return matrix;
  }
}
