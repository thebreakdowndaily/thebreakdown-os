import type { KnowledgeConcept } from '@/types/canonical';

const concepts = new Map<string, KnowledgeConcept>();

export function getConcept(id: string): KnowledgeConcept | undefined {
  return concepts.get(id);
}

export function getConceptBySlug(slug: string): KnowledgeConcept | undefined {
  return Array.from(concepts.values()).find(c => c.slug === slug);
}

export function getAllConcepts(): KnowledgeConcept[] {
  return Array.from(concepts.values());
}

export function getConceptsByCategory(category: string): KnowledgeConcept[] {
  return Array.from(concepts.values()).filter(c => c.category === category);
}

export function getRelatedConcepts(conceptId: string): KnowledgeConcept[] {
  const concept = concepts.get(conceptId);
  if (!concept) return [];
  return concept.relatedConceptIds
    .map(id => concepts.get(id))
    .filter((c): c is KnowledgeConcept => c !== undefined);
}

export function findConceptsByTerm(query: string): KnowledgeConcept[] {
  const lower = query.toLowerCase();
  return Array.from(concepts.values()).filter(
    c => c.term.toLowerCase().includes(lower) ||
         c.definition.toLowerCase().includes(lower)
  );
}

export function registerConcept(concept: KnowledgeConcept): void {
  concepts.set(concept.id, concept);
}

export function seedConcepts(): void {
  const seed: KnowledgeConcept[] = [
    {
      id: 'con-non-alignment',
      slug: 'non-alignment',
      term: 'Non-Alignment',
      definition: 'A foreign policy doctrine of not formally aligning with any major power bloc, pioneered by India under Nehru and formalised through the Non-Aligned Movement (NAM) in 1961.',
      category: 'doctrine',
      relatedConceptIds: ['con-panchsheel', 'con-cold-war', 'con-strategic-autonomy'],
      relatedEntityIds: ['jawaharlal-nehru', 'india'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-panchsheel',
      slug: 'panchsheel',
      term: 'Panchsheel',
      definition: 'The Five Principles of Peaceful Coexistence, jointly enunciated by India and China in 1954 as a framework for bilateral relations and later adopted as foundational principles of the Non-Aligned Movement.',
      category: 'doctrine',
      relatedConceptIds: ['con-non-alignment', 'con-cold-war'],
      relatedEntityIds: ['jawaharlal-nehru', 'china', 'india'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-cold-war',
      slug: 'cold-war',
      term: 'Cold War',
      definition: 'The period of geopolitical tension between the United States and the Soviet Union and their respective allies from 1947 to 1991, which shaped the context for India\'s non-alignment and foreign policy choices.',
      category: 'period',
      relatedConceptIds: ['con-non-alignment', 'con-strategic-autonomy'],
      relatedEntityIds: ['india', 'united-states', 'soviet-union'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-strategic-autonomy',
      slug: 'strategic-autonomy',
      term: 'Strategic Autonomy',
      definition: 'The capacity of a state to make independent foreign policy decisions without being constrained by alliance commitments or great power pressure. A core principle of Indian foreign policy from Nehru to the present.',
      category: 'strategy',
      relatedConceptIds: ['con-non-alignment', 'con-multi-alignment'],
      relatedEntityIds: ['india', 'jawaharlal-nehru'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-multi-alignment',
      slug: 'multi-alignment',
      term: 'Multi-Alignment',
      definition: 'A post-Cold War Indian foreign policy approach of simultaneously engaging multiple major powers and multilateral forums without formal alliance commitments, replacing the earlier emphasis on non-alignment.',
      category: 'doctrine',
      relatedConceptIds: ['con-strategic-autonomy', 'con-non-alignment'],
      relatedEntityIds: ['india'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-partition',
      slug: 'partition',
      term: 'Partition of India',
      definition: 'The 1947 division of British India into two independent dominions, India and Pakistan, resulting in one of the largest forced migrations in human history and an enduring source of conflict in South Asia.',
      category: 'event',
      relatedConceptIds: ['con-two-nation-theory', 'con-kashmir'],
      relatedEntityIds: ['india', 'pakistan', 'partition'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-two-nation-theory',
      slug: 'two-nation-theory',
      term: 'Two-Nation Theory',
      definition: 'The doctrine that Hindus and Muslims in South Asia constitute two distinct nations with separate identities, forming the ideological basis for the creation of Pakistan.',
      category: 'idea',
      relatedConceptIds: ['con-partition'],
      relatedEntityIds: ['mohammad-ali-jinnah', 'pakistan'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-kashmir',
      slug: 'kashmir',
      term: 'Kashmir Dispute',
      definition: 'The ongoing territorial conflict between India and Pakistan over the region of Jammu and Kashmir, originating from the 1947 partition and the disputed accession of the princely state.',
      category: 'event',
      relatedConceptIds: ['con-partition'],
      relatedEntityIds: ['kashmir', 'india', 'pakistan', 'jawaharlal-nehru'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-secular-nationalism',
      slug: 'secular-nationalism',
      term: 'Secular Nationalism',
      definition: 'The principle that the Indian nation-state is defined by civic territorial identity rather than religious identity, championed by Nehru and the Congress Party as the foundation of Indian democracy.',
      category: 'idea',
      relatedConceptIds: ['con-two-nation-theory'],
      relatedEntityIds: ['jawaharlal-nehru', 'india'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-united-nations',
      slug: 'united-nations',
      term: 'United Nations System',
      definition: 'India\'s engagement with the United Nations as a cornerstone of its foreign policy, including its role in peacekeeping, advocacy for decolonization, and referral of the Kashmir dispute.',
      category: 'institution',
      relatedConceptIds: ['con-kashmir', 'con-non-alignment'],
      relatedEntityIds: ['un', 'india', 'jawaharlal-nehru'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'con-decolonization',
      slug: 'decolonization',
      term: 'Decolonization',
      definition: 'The process by which colonies gained independence from European empires, especially in Asia and Africa during 1945–1975. India positioned itself as a leader of the decolonizing world.',
      category: 'movement',
      relatedConceptIds: ['con-non-alignment', 'con-united-nations'],
      relatedEntityIds: ['india', 'un'],
      createdAt: '2026-07-12T00:00:00Z', updatedAt: '2026-07-12T00:00:00Z',
    },
  ];

  for (const concept of seed) {
    concepts.set(concept.id, concept);
  }
}
