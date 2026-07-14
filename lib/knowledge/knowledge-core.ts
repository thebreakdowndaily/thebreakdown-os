import type { CanonicalClaim, CanonicalSource, CanonicalDocument, CanonicalTimelineEvent, CanonicalThinker, CanonicalRelationship, CanonicalEvidence } from '@/types/canonical';
import { seedConcepts, getConcept, getRelatedConcepts, getAllConcepts } from './concept-registry';
import { seedClaims, getClaim, getClaimsByEntity, getClaimsByConcept, getAllClaims } from './claim-registry';
import { seedSources, getSource, getSourcesByEntity, getAllSources } from './source-registry';
import { seedDocuments, getDocument, getAllDocuments } from './document-registry';
import { seedTimelineEvents, getTimelineEvent, getEventsByEntity, getAllTimelineEvents } from './timeline-registry';
import { seedThinkers, getThinker, getThinkersByConcept, getAllThinkers } from './thinker-registry';
import { seedRelationships, getRelationship, getRelationshipsByEntity } from './relationship-registry';
import { seedEvidence, getEvidence, getEvidenceByClaim, getEvidenceBySource } from './evidence-registry';

let seeded = false;

export function seedAll(): void {
  if (seeded) return;
  seedConcepts();
  seedClaims();
  seedSources();
  seedDocuments();
  seedTimelineEvents();
  seedThinkers();
  seedRelationships();
  seedEvidence();
  seeded = true;
}

export interface KnowledgeCoreAPI {
  claims: {
    get: (id: string) => CanonicalClaim | undefined;
    all: () => CanonicalClaim[];
    byEntity: (entityId: string) => CanonicalClaim[];
    byConcept: (conceptId: string) => CanonicalClaim[];
  };
  sources: {
    get: (id: string) => CanonicalSource | undefined;
    all: () => CanonicalSource[];
    byEntity: (entityId: string) => CanonicalSource[];
  };
  documents: {
    get: (id: string) => CanonicalDocument | undefined;
    all: () => CanonicalDocument[];
  };
  timeline: {
    get: (id: string) => CanonicalTimelineEvent | undefined;
    all: () => CanonicalTimelineEvent[];
    byEntity: (entityId: string) => CanonicalTimelineEvent[];
  };
  thinkers: {
    get: (id: string) => CanonicalThinker | undefined;
    all: () => CanonicalThinker[];
    byConcept: (conceptId: string) => CanonicalThinker[];
  };
  relationships: {
    get: (id: string) => CanonicalRelationship | undefined;
    byEntity: (entityId: string) => CanonicalRelationship[];
  };
  evidence: {
    get: (id: string) => CanonicalEvidence | undefined;
    byClaim: (claimId: string) => CanonicalEvidence[];
    bySource: (sourceId: string) => CanonicalEvidence[];
  };
  concepts: {
    get: (id: string) => ReturnType<typeof getConcept>;
    all: () => ReturnType<typeof getConcept>[];
    related: (id: string) => ReturnType<typeof getRelatedConcepts>;
  };
}

export function getKnowledgeCore(): KnowledgeCoreAPI {
  seedAll();
  return {
    claims: {
      get: getClaim,
      all: getAllClaims,
      byEntity: getClaimsByEntity,
      byConcept: getClaimsByConcept,
    },
    sources: {
      get: getSource,
      all: getAllSources,
      byEntity: getSourcesByEntity,
    },
    documents: {
      get: getDocument,
      all: getAllDocuments,
    },
    timeline: {
      get: getTimelineEvent,
      all: getAllTimelineEvents,
      byEntity: getEventsByEntity,
    },
    thinkers: {
      get: getThinker,
      all: getAllThinkers,
      byConcept: getThinkersByConcept,
    },
    relationships: {
      get: getRelationship,
      byEntity: getRelationshipsByEntity,
    },
    evidence: {
      get: getEvidence,
      byClaim: getEvidenceByClaim,
      bySource: getEvidenceBySource,
    },
    concepts: {
      get: getConcept,
      all: getAllConcepts,
      related: getRelatedConcepts,
    },
  };
}

export interface EnrichedClaim extends CanonicalClaim {
  _sources: CanonicalSource[];
  _documents: CanonicalDocument[];
  _evidence: CanonicalEvidence[];
  _concepts: ReturnType<typeof getConcept>[];
}

export function enrichClaim(claim: CanonicalClaim): EnrichedClaim {
  const core = getKnowledgeCore();
  return {
    ...claim,
    _sources: claim.sourceIds.map(id => core.sources.get(id)).filter(Boolean) as CanonicalSource[],
    _documents: claim.documentIds.map(id => core.documents.get(id)).filter(Boolean) as CanonicalDocument[],
    _evidence: core.evidence.byClaim(claim.id),
    _concepts: claim.conceptIds.map(id => core.concepts.get(id)).filter(Boolean) as ReturnType<typeof getConcept>[],
  };
}

export function enrichClaimLazy(claimId: string): EnrichedClaim | undefined {
  const core = getKnowledgeCore();
  const claim = core.claims.get(claimId);
  if (!claim) return undefined;
  return enrichClaim(claim);
}
