import type { CanonicalRelationship } from '@/types/canonical';

const relationships = new Map<string, CanonicalRelationship>();

export function getRelationship(id: string): CanonicalRelationship | undefined {
  return relationships.get(id);
}

export function getRelationshipsByEntity(entityId: string): CanonicalRelationship[] {
  return Array.from(relationships.values()).filter(
    r => r.sourceEntityId === entityId || r.targetEntityId === entityId
  );
}

export function registerRelationship(rel: CanonicalRelationship): void {
  relationships.set(rel.id, rel);
}

export function seedRelationships(): void {
  const seed: CanonicalRelationship[] = [
    {
      id: 'rel.nehru.partition',
      sourceEntityId: 'jawaharlal-nehru',
      targetEntityId: 'partition',
      relationType: 'shaped_by',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Nehru\'s foreign policy was fundamentally shaped by the trauma of Partition.' },
      ],
      confidence: 0.9,
      documentIds: ['doc-nehru-tryst'],
      storyIds: [],
      timelineIds: ['evt.independence'],
    },
    {
      id: 'rel.nehru.gandhi',
      sourceEntityId: 'jawaharlal-nehru',
      targetEntityId: 'mahatma-gandhi',
      relationType: 'mentored_by',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Gandhi chose Nehru as his political heir over the more conservative Sardar Patel.' },
        { sourceId: 's7', relevance: 'supporting', excerpt: 'Nehru shared Gandhi\'s commitment to secularism and non-violence.' },
      ],
      confidence: 0.95,
      documentIds: [],
      storyIds: [],
      timelineIds: [],
    },
    {
      id: 'rel.nehru.jinnah',
      sourceEntityId: 'jawaharlal-nehru',
      targetEntityId: 'mohammad-ali-jinnah',
      relationType: 'opposed',
      evidence: [
        { sourceId: 's3', relevance: 'direct', excerpt: 'Nehru and Jinnah represented competing visions of India — secular nationalism vs. the Two-Nation theory.' },
      ],
      confidence: 0.95,
      documentIds: [],
      storyIds: [],
      timelineIds: [],
    },
    {
      id: 'rel.india.kashmir',
      sourceEntityId: 'india',
      targetEntityId: 'kashmir',
      relationType: 'disputed',
      evidence: [
        { sourceId: 's8', relevance: 'direct', excerpt: 'The Kashmir dispute has been the central territorial conflict between India and Pakistan since 1947.' },
        { sourceId: 's6', relevance: 'supporting', excerpt: 'UN Resolution 47 called for a plebiscite to determine Kashmir\'s future.' },
      ],
      confidence: 0.85,
      documentIds: ['doc-un-res-47'],
      storyIds: [],
      timelineIds: ['evt.kashmir-accession', 'evt.un-referral'],
    },
    {
      id: 'rel.nehru.patel',
      sourceEntityId: 'jawaharlal-nehru',
      targetEntityId: 'sardar-patel',
      relationType: 'collaborated_with',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Nehru and Patel, despite their differences, formed an effective partnership that combined ideological vision with practical state-building.' },
      ],
      confidence: 0.9,
      documentIds: [],
      storyIds: [],
      timelineIds: ['evt.princely-states-accession'],
    },
    {
      id: 'rel.nehru.liaquat',
      sourceEntityId: 'jawaharlal-nehru',
      targetEntityId: 'liaquat-ali-khan',
      relationType: 'negotiated_with',
      evidence: [
        { sourceId: 's15', relevance: 'direct', excerpt: 'Nehru and Liaquat Ali Khan signed the Liaquat-Nehru Pact of 1950 to guarantee minority rights in both countries.' },
      ],
      confidence: 0.8,
      documentIds: ['doc-liaquat-nehru-pact'],
      storyIds: [],
      timelineIds: ['evt.liaquat-nehru-pact'],
    },
    {
      id: 'rel.india.pakistan',
      sourceEntityId: 'india',
      targetEntityId: 'pakistan',
      relationType: 'conflicted_with',
      evidence: [
        { sourceId: 's23', relevance: 'direct', excerpt: 'India and Pakistan have been locked in an enduring rivalry since 1947, rooted in the unfinished business of Partition.' },
        { sourceId: 's1', relevance: 'supporting', excerpt: 'The rivalry between India and Pakistan has been the defining feature of South Asian geopolitics since independence.' },
      ],
      confidence: 0.95,
      documentIds: [],
      storyIds: [],
      timelineIds: ['evt.kashmir-ceasefire', 'evt.partition-violence-peak', 'evt.kashmir-accession'],
    },
    {
      id: 'rel.patel.vp-menon',
      sourceEntityId: 'sardar-patel',
      targetEntityId: 'v-p-menon',
      relationType: 'deputized',
      evidence: [
        { sourceId: 's18', relevance: 'direct', excerpt: 'V.P. Menon served as Patel\'s deputy in the States Department and was the principal architect of the legal framework for integration.' },
      ],
      confidence: 0.95,
      documentIds: [],
      storyIds: [],
      timelineIds: ['evt.princely-states-accession'],
    },
    {
      id: 'rel.gandhi.nehru',
      sourceEntityId: 'mahatma-gandhi',
      targetEntityId: 'jawaharlal-nehru',
      relationType: 'mentored',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Gandhi chose Nehru as his political heir, passing over the more experienced Sardar Patel.' },
      ],
      confidence: 0.95,
      documentIds: [],
      storyIds: [],
      timelineIds: [],
    },
    {
      id: 'rel.jinnah.gandhi',
      sourceEntityId: 'mohammad-ali-jinnah',
      targetEntityId: 'mahatma-gandhi',
      relationType: 'opposed',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Jinnah and Gandhi represented fundamentally different visions of Indian nationalism — one secular and composite, the other based on Muslim separatism.' },
      ],
      confidence: 0.9,
      documentIds: [],
      storyIds: [],
      timelineIds: [],
    },
  ];

  for (const r of seed) relationships.set(r.id, r);
}
