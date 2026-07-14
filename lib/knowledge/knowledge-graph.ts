import type { Chapter, KnowledgeConcept, Source, Claim } from '@/types/canonical';
import { getConcept, getRelatedConcepts, findConceptsByTerm } from './concept-registry';

export interface EntityIndex {
  id: string; slug: string; name: string; title: string;
}

export interface ChapterGraph {
  chapter: Chapter;
  concepts: KnowledgeConcept[];
  relatedConcepts: KnowledgeConcept[];
  sources: Source[];
  claims: Claim[];
  relatedChapters: ChapterLink[];
  entityLinks: EntityLink[];
}

export interface ChapterLink {
  chapterSlug: string;
  title: string;
  summary: string;
  relationship: string;
}

export interface EntityLink {
  entityId: string;
  entityName: string;
  role: string;
}

export interface GraphQuery {
  type: 'concept' | 'entity' | 'source' | 'chapter';
  id: string;
}

export interface QueryResult {
  query: GraphQuery;
  related: {
    chapters: ChapterLink[];
    concepts: KnowledgeConcept[];
    entities: EntityLink[];
    sources: Source[];
    claims: Claim[];
  };
}

export function buildChapterGraph(
  chapter: Chapter,
  allChapters: Chapter[],
  allEntities: EntityIndex[]
): ChapterGraph {
  const concepts = (chapter.relatedConceptIds || [])
    .map(id => getConcept(id))
    .filter((c): c is KnowledgeConcept => c !== undefined);

  const relatedConcepts = concepts.flatMap(c => getRelatedConcepts(c.id))
    .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);

  const sources = chapter.sources || [];
  const claims = chapter.claims || [];

  const relatedChapters: ChapterLink[] = [];
  if (chapter.relatedConceptIds) {
    for (const other of allChapters) {
      if (other.id === chapter.id) continue;
      const sharedConcepts = (other.relatedConceptIds || [])
        .filter(id => chapter.relatedConceptIds?.includes(id));
      if (sharedConcepts.length > 0) {
        relatedChapters.push({
          chapterSlug: other.slug,
          title: other.title,
          summary: other.summary,
          relationship: `Shares ${sharedConcepts.length} concept${sharedConcepts.length > 1 ? 's' : ''}`,
        });
      }
    }
  }

  const entityLinks: EntityLink[] = [];
  if (chapter.relatedEntityIds) {
    for (const entityId of chapter.relatedEntityIds) {
      const entity = allEntities.find(e => e.id === entityId || e.slug === entityId);
      if (entity) {
        entityLinks.push({
          entityId,
          entityName: entity.name || entity.title || entityId,
          role: 'mentioned',
        });
      }
    }
  }

  return { chapter, concepts, relatedConcepts, sources, claims, relatedChapters, entityLinks };
}

export function queryGraph(
  query: GraphQuery,
  allChapters: Chapter[],
  allEntities: EntityIndex[]
): QueryResult {
  const chapters: ChapterLink[] = [];
  const concepts: KnowledgeConcept[] = [];
  const entities: EntityLink[] = [];
  const sources: Source[] = [];
  const claims: Claim[] = [];

  if (query.type === 'concept') {
    const concept = getConcept(query.id) || findConceptsByTerm(query.id)[0];
    if (!concept) return { query, related: { chapters, concepts, entities, sources, claims } };

    concepts.push(concept, ...getRelatedConcepts(concept.id));

    for (const ch of allChapters) {
      if ((ch.relatedConceptIds || []).includes(concept.id)) {
        chapters.push({
          chapterSlug: ch.slug,
          title: ch.title,
          summary: ch.summary,
          relationship: 'references this concept',
        });
      }
    }

    for (const entityId of concept.relatedEntityIds) {
      const entity = allEntities.find((e: EntityIndex) => e.id === entityId || e.slug === entityId);
      if (entity) {
        entities.push({
          entityId,
          entityName: entity.name || entity.title || entityId,
          role: 'related',
        });
      }
    }
  }

  if (query.type === 'entity') {
    for (const ch of allChapters) {
      if ((ch.relatedEntityIds || []).includes(query.id)) {
        chapters.push({
          chapterSlug: ch.slug,
          title: ch.title,
          summary: ch.summary,
          relationship: 'mentions this entity',
        });
      }
    }
    const entity = allEntities.find((e: EntityIndex) => e.id === query.id || e.slug === query.id);
    if (entity) {
      entities.push({
        entityId: query.id,
        entityName: entity.name || entity.title || query.id,
        role: 'primary',
      });
    }
    const conceptMatches = findConceptsByTerm(query.id);
    concepts.push(...conceptMatches);
  }

  return { query, related: { chapters, concepts, entities, sources, claims } };
}
