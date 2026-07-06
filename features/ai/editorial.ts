import type { Story, Entity, Topic, Dataset } from '@/types/canonical';
import type { Services } from '@/services/registry';

export interface HeadlineSuggestion { headline: string; rationale: string; }
export interface EntitySuggestion { entityId: string; name: string; reason: string; }
export interface SourceGap { topic: string; missingType: string; suggestion: string; }
export interface FAQSuggestion { question: string; answer: string; }
export interface DatasetSuggestion { datasetId: string; title: string; reason: string; }

const JARGON_SYNONYMS: Record<string, string> = {
  'leverage': 'use', 'synergy': 'cooperation', 'optimize': 'improve',
  'paradigm': 'model', 'facilitate': 'help', 'utilize': 'use',
  'implement': 'apply', 'initiative': 'program', 'stakeholder': 'participant',
  'streamline': 'simplify', 'robust': 'strong', 'holistic': 'complete',
  'incentivize': 'encourage', 'operationalize': 'put into practice',
};

const TOP_LEVEL_CONJUNCTIONS = [
  'However,', 'Moreover,', 'Meanwhile,', 'Consequently,',
  'Additionally,', 'Previously,', 'Subsequently,',
];

export class EditorialAI {
  private services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  suggestHeadlines(story: Story): HeadlineSuggestion[] {
    const suggestions: HeadlineSuggestion[] = [];
    const entities = story.relatedEntityIds
      .map(id => this.services.entities.getEntity(id))
      .filter((e): e is Entity => e !== undefined);
    const topics = story.relatedTopicIds
      .map(id => this.services.topics.getTopic(id))
      .filter((t): t is Topic => t !== undefined);

    const entityNames = entities.map(e => e.name);
    const topicNames = topics.map(t => t.name);
    const primaryTopic = topicNames[0] || story.category;
    const primaryEntity = entityNames[0] || '';

    if (primaryEntity && primaryTopic) {
      const finding = story.claims[0]
        ? story.claims[0].claim.length > 60
          ? story.claims[0].claim.slice(0, 57) + '...'
          : story.claims[0].claim
        : story.summary.slice(0, 50);
      suggestions.push({
        headline: `${primaryTopic}: ${primaryEntity}'s ${finding}`,
        rationale: `Connects the primary topic "${primaryTopic}" with the key entity "${primaryEntity}" and a core finding.`,
      });
      suggestions.push({
        headline: `Explained: How ${primaryEntity} Affects ${primaryTopic}`,
        rationale: `Explainer format highlighting the relationship between "${primaryEntity}" and "${primaryTopic}".`,
      });
    }

    if (entityNames.length >= 2) {
      suggestions.push({
        headline: `${entityNames[0]} vs ${entityNames[1]}: A ${primaryTopic} Comparison`,
        rationale: `Contrasts two key entities within the context of "${primaryTopic}".`,
      });
    }

    if (story.claims.length > 0) {
      const topClaim = story.claims.reduce((a, b) => a.confidence > b.confidence ? a : b);
      suggestions.push({
        headline: `Fact Check: ${topClaim.claim.length > 70 ? topClaim.claim.slice(0, 67) + '...' : topClaim.claim}`,
        rationale: `Based on the highest-confidence claim in the story (confidence: ${topClaim.confidence}).`,
      });
    }

    const fallbackHeadline = `The ${story.category} Story: ${story.title}`;
    if (suggestions.length < 3) {
      suggestions.push({
        headline: story.headline || fallbackHeadline,
        rationale: 'Uses the existing headline or a category-based fallback.',
      });
    }

    const lastEntity = entityNames[entityNames.length - 1];
    if (lastEntity && primaryTopic && suggestions.length < 5) {
      suggestions.push({
        headline: `What ${lastEntity}'s Next Move Means for ${primaryTopic}`,
        rationale: `Forward-looking angle centered on "${lastEntity}" within "${primaryTopic}".`,
      });
    }

    if (suggestions.length < 3) {
      suggestions.push({
        headline: story.title,
        rationale: 'Falls back to the original story title.',
      });
    }

    return suggestions.slice(0, 5);
  }

  suggestMissingEntities(story: Story): EntitySuggestion[] {
    const linkedEntityIds = new Set(story.relatedEntityIds);
    const suggestions: EntitySuggestion[] = [];
    const seen = new Set<string>();

    for (const topicId of story.relatedTopicIds) {
      const topic = this.services.topics.getTopic(topicId);
      if (!topic) continue;

      for (const entityId of topic.relatedEntityIds) {
        if (linkedEntityIds.has(entityId)) continue;
        if (seen.has(entityId)) continue;
        seen.add(entityId);

        const entity = this.services.entities.getEntity(entityId);
        if (!entity) continue;

        suggestions.push({
          entityId: entity.id,
          name: entity.name,
          reason: `Referenced by topic "${topic.name}" but not linked to this story.`,
        });
      }
    }

    return suggestions;
  }

  detectSourceGaps(story: Story): SourceGap[] {
    const gaps: SourceGap[] = [];
    const sources = story.sources || [];

    const hasGovernmentSource = sources.some(
      s => s.tier === 1 || /\.gov\b/i.test(s.url) || /government/i.test(s.title)
    );
    if (!hasGovernmentSource) {
      gaps.push({
        topic: 'Government Sources',
        missingType: 'tier-1 / official',
        suggestion: 'Add a government report, ministry press release, or parliamentary document.',
      });
    }

    const hasAcademicSource = sources.some(
      s => s.tier === 2 || /\.edu\b/i.test(s.url) || /research|study|journal|paper/i.test(s.title)
    );
    if (!hasAcademicSource) {
      gaps.push({
        topic: 'Academic / Research Sources',
        missingType: 'tier-2 / scholarly',
        suggestion: 'Include a peer-reviewed study, working paper, or academic analysis.',
      });
    }

    const hasDataSource = sources.some(
      s => s.tier === 3 || /data|dataset|statistics|survey|index/i.test(s.title) || /data\./i.test(s.url)
    );
    if (!hasDataSource) {
      gaps.push({
        topic: 'Data Sources',
        missingType: 'tier-3 / statistical',
        suggestion: 'Reference a dataset, survey, or statistical publication.',
      });
    }

    const hasExpertSource = sources.some(
      s => s.tier === 4 || /interview|expert|analysis|opinion/i.test(s.title)
    );
    if (!hasExpertSource) {
      gaps.push({
        topic: 'Expert / Analysis Sources',
        missingType: 'tier-4 / analytical',
        suggestion: 'Include an expert interview, think tank report, or policy analysis.',
      });
    }

    return gaps;
  }

  suggestFAQs(story: Story): FAQSuggestion[] {
    const faqs: FAQSuggestion[] = [];
    const seenQuestions = new Set<string>();

    const addIfUnique = (question: string, answer: string) => {
      const key = question.toLowerCase().trim();
      if (!seenQuestions.has(key)) {
        seenQuestions.add(key);
        faqs.push({ question, answer });
      }
    };

    for (const claim of story.claims) {
      const truncatedClaim = claim.claim.length > 80 ? claim.claim.slice(0, 77) + '...' : claim.claim;
      addIfUnique(
        `What is the evidence for "${truncatedClaim}"?`,
        `This claim has a confidence score of ${claim.confidence} (tier ${claim.tier}) and is ${claim.status}. ${claim.sourceUrl ? `Source: ${claim.source}` : 'No direct source URL provided.'}`
      );
    }

    for (const entityId of story.relatedEntityIds) {
      const entity = this.services.entities.getEntity(entityId);
      if (!entity) continue;

      if (entity.faq) {
        for (const faq of entity.faq) {
          addIfUnique(faq.question, faq.answer);
        }
      }

      if (entity.description) {
        addIfUnique(
          `What is ${entity.name}?`,
          entity.description
        );
      }
    }

    for (const topicId of story.relatedTopicIds) {
      const topic = this.services.topics.getTopic(topicId);
      if (!topic) continue;

      if (topic.faq) {
        for (const faq of topic.faq) {
          addIfUnique(faq.question, faq.answer);
        }
      }

      if (topic.description) {
        addIfUnique(
          `What is "${topic.name}" about?`,
          topic.description
        );
      }
    }

    if (faqs.length === 0 && story.summary) {
      addIfUnique(
        `What is the key takeaway from this story?`,
        story.summary
      );
    }

    return faqs;
  }

  flagUnsupportedClaims(story: Story): Array<{ claim: string; reason: string }> {
    const flags: Array<{ claim: string; reason: string }> = [];

    for (const claim of story.claims || []) {
      if (claim.confidence < 60) {
        flags.push({
          claim: claim.claim,
          reason: `Low confidence score (${claim.confidence}). Consider finding stronger supporting evidence.`,
        });
      } else if (!claim.sourceUrl || claim.sourceUrl.trim() === '') {
        flags.push({
          claim: claim.claim,
          reason: `No source URL provided. Confidence: ${claim.confidence}. Verify and add a citation.`,
        });
      }
    }

    return flags;
  }

  suggestTimelineEvents(story: Story): Array<{ date: string; title: string; description: string }> {
    const existingDates = new Set(story.timeline?.map(e => e.date + '|' + e.title) || []);
    const suggestions: Array<{ date: string; title: string; description: string }> = [];
    const seen = new Set<string>();

    for (const entityId of story.relatedEntityIds) {
      const entity = this.services.entities.getEntity(entityId);
      if (!entity) continue;

      for (const event of entity.timeline || []) {
        const key = event.date + '|' + event.title;
        if (existingDates.has(key)) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push(event);
      }
    }

    for (const topicId of story.relatedTopicIds) {
      const topic = this.services.topics.getTopic(topicId);
      if (!topic) continue;

      for (const event of topic.timeline || []) {
        const key = event.date + '|' + event.title;
        if (existingDates.has(key)) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push(event);
      }
    }

    suggestions.sort((a, b) => a.date.localeCompare(b.date));

    return suggestions;
  }

  suggestDatasets(story: Story): DatasetSuggestion[] {
    const suggestions: DatasetSuggestion[] = [];
    const seenIds = new Set<string>();

    const allDatasets = this.services.datasets.getDatasets({ pageSize: 50 }).data;

    for (const topicId of story.relatedTopicIds) {
      const topic = this.services.topics.getTopic(topicId);
      if (!topic) continue;
      for (const dataset of allDatasets) {
        if (seenIds.has(dataset.id)) continue;
        if (dataset.relatedTopicIds.includes(topicId)) {
          seenIds.add(dataset.id);
          suggestions.push({ datasetId: dataset.id, title: dataset.title, reason: `Related to topic "${topic.name}"` });
        }
      }
    }

    for (const entityId of story.relatedEntityIds) {
      const entity = this.services.entities.getEntity(entityId);
      if (!entity) continue;
      for (const dataset of allDatasets) {
        if (seenIds.has(dataset.id)) continue;
        if (dataset.relatedEntityIds.includes(entityId)) {
          seenIds.add(dataset.id);
          suggestions.push({ datasetId: dataset.id, title: dataset.title, reason: `Mentions entity "${entity.name}"` });
        }
      }
    }

    if (suggestions.length === 0) {
      const matching = allDatasets.filter(d =>
        d.tags.some(t => story.tags.includes(t) || story.category === d.category)
      );
      for (const dataset of matching.slice(0, 3)) {
        if (seenIds.has(dataset.id)) continue;
        seenIds.add(dataset.id);
        suggestions.push({ datasetId: dataset.id, title: dataset.title, reason: `Matches story category "${story.category}"` });
      }
    }

    return suggestions.slice(0, 5);
  }
}
