import type { SearchResult } from '@/utils/types';
import { getStore } from '@/utils/data-layer/store';
import { findConceptsByAlias, expandConcept, getConcept, getAllConcepts, getConceptPath } from './concepts';
import type { Concept } from './concepts';

export interface SemanticResult extends SearchResult {
  conceptMatch: string[];
  conceptPath?: string[];
  matchType: 'exact' | 'concept' | 'expanded' | 'keyword';
  relevanceScore: number;
}

export interface SemanticSearchResponse {
  query: string;
  originalQuery: string;
  understood: {
    detectedConcepts: Array<{ id: string; label: string; domain: string }>;
    expansionTrail: Array<{ from: string; to: string; relation: string; weight: number }>;
  };
  results: SemanticResult[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/* ── Query Understanding ──────────────────────────────────────────────── */

interface ConceptMatch {
  concept: Concept;
  score: number;
}

function understandQuery(query: string): ConceptMatch[] {
  if (!query.trim()) return [];

  const lowered = query.toLowerCase();
  const words = lowered.split(/\s+/);

  // Find direct concept matches from aliases
  const directMatches = findConceptsByAlias(lowered);

  // Score each matched concept
  const scored = new Map<string, ConceptMatch>();

  for (const c of directMatches) {
    let score = 0;
    const allNames = [c.label.toLowerCase(), ...c.aliases.map(a => a.toLowerCase())];

    for (const name of allNames) {
      if (name === lowered) {
        score = Math.max(score, 1.0);
      } else if (lowered.includes(name) || name.includes(lowered)) {
        score = Math.max(score, 0.8);
      } else {
        for (const word of words) {
          if (name.includes(word) || word.includes(name)) {
            score = Math.max(score, 0.6);
          }
        }
      }
    }

    if (score > 0) {
      const existing = scored.get(c.id);
      if (!existing || existing.score < score) {
        scored.set(c.id, { concept: c, score });
      }
    }
  }

  // Score by word-level matching as fallback
  if (scored.size === 0) {
    const allConcepts = getAllConcepts();
    for (const c of allConcepts) {
      let score = 0;
      const allNames = [c.label.toLowerCase(), ...c.aliases.map(a => a.toLowerCase())];

      for (const word of words) {
        if (word.length < 2) continue;
        for (const name of allNames) {
          if (name.includes(word)) {
            score = Math.max(score, 0.4);
          }
        }
      }

      if (score > 0) {
        scored.set(c.id, { concept: c, score });
      }
    }
  }

  return Array.from(scored.values()).sort((a, b) => b.score - a.score);
}

/* ── Expansion Trail ─────────────────────────────────────────────────── */

interface ExpansionStep {
  from: string;
  to: string;
  relation: string;
  weight: number;
}

function buildExpansionTrail(detectedIds: string[], depth: number): { expandedIds: Set<string>; trail: ExpansionStep[] } {
  const expandedIds = new Set(detectedIds);
  const trail: ExpansionStep[] = [];

  for (const id of detectedIds) {
    const expanded = expandConcept(id, depth);
    for (const eid of expanded) {
      if (!expandedIds.has(eid)) {
        expandedIds.add(eid);
        const sourceConcept = getConcept(id);
        const targetConcept = getConcept(eid);
        if (sourceConcept && targetConcept) {
          // Find relation type
          const rel = sourceConcept.related.find(r => r.id === eid)
            || targetConcept.related.find(r => r.id === id);
          trail.push({
            from: sourceConcept.label,
            to: targetConcept.label,
            relation: rel?.type || 'related',
            weight: rel?.weight || 0.5,
          });
        }
      }
    }
  }

  return { expandedIds, trail };
}

/* ── Content Search ───────────────────────────────────────────────────── */

function searchStoriesByConcepts(
  conceptIds: Set<string>,
  detectedIds: string[],
  query: string,
): SemanticResult[] {
  const s = getStore();
  const results: SemanticResult[] = [];

  s.stories.forEach((story) => {
    const matchedConcepts: string[] = [];
    let matchType: 'exact' | 'concept' | 'expanded' | 'keyword' = 'keyword';
    let conceptScore = 0;

    // Check if any concept matches this story
    for (const cid of conceptIds) {
      const concept = getConcept(cid);
      if (!concept) continue;

      // Check entity associations
      const hasEntity = concept.entityAssociations.some(
        (ea) => ea.type === 'story' && ea.id === story.slug,
      );
      if (hasEntity) {
        matchedConcepts.push(concept.label);
        conceptScore += 0.8;
      }

      // Check tag matches
      const allNames = [concept.label.toLowerCase(), ...concept.aliases.map(a => a.toLowerCase())];
      for (const name of allNames) {
        if (story.tags.some(t => t.toLowerCase().includes(name) || name.includes(t.toLowerCase()))) {
          matchedConcepts.push(concept.label);
          conceptScore += 0.6;
          break;
        }
      }

      // Check headline/summary/keyPoints
      const searchable = [story.headline, story.summary, ...story.keyPoints].join(' ').toLowerCase();
      for (const name of allNames) {
        if (searchable.includes(name)) {
          if (!matchedConcepts.includes(concept.label)) {
            matchedConcepts.push(concept.label);
          }
          conceptScore += 0.4;
          break;
        }
      }
    }

    // Determine match type
    const isDirectDetect = detectedIds.some((did) => {
      const concept = getConcept(did);
      return concept?.entityAssociations.some(ea => ea.type === 'story' && ea.id === story.slug);
    });

    if (isDirectDetect) {
      matchType = 'exact';
    } else if (matchedConcepts.length > 0 && detectedIds.length > 0) {
      matchType = 'concept';
    } else if (matchedConcepts.length > 0) {
      matchType = 'expanded';
    }

    // Fallback keyword matching
    const queryMatch = query ? story.headline.toLowerCase().includes(query.toLowerCase())
      || story.summary.toLowerCase().includes(query.toLowerCase())
      || story.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      || story.keyPoints.some(kp => kp.toLowerCase().includes(query.toLowerCase()))
      || story.facts.some(f => f.label.toLowerCase().includes(query.toLowerCase()))
    : false;

    if (queryMatch && matchType === 'keyword') {
      matchType = 'keyword';
    }

    if (matchedConcepts.length > 0 || queryMatch) {
      // Compute relevance score
      const recencyScore = Math.max(0, 1 - (Date.now() - new Date(story.publishedAt).getTime()) / (365 * 24 * 60 * 60 * 1000));
      const evidenceBoost = story.evidenceScore / 100;
      const finalScore = Math.min(1, conceptScore * 0.5 + recencyScore * 0.2 + evidenceBoost * 0.3);

      results.push({
        id: story.slug,
        type: 'story',
        title: story.headline,
        description: story.summary,
        url: `/story/${story.slug}`,
        score: Math.round(finalScore * 100),
        date: story.publishedAt.slice(0, 10),
        category: story.category,
        conceptMatch: [...new Set(matchedConcepts)],
        matchType,
        relevanceScore: finalScore,
      });
    }
  });

  return results;
}

function searchEntitiesByConcepts(
  conceptIds: Set<string>,
  detectedIds: string[],
  query: string,
): SemanticResult[] {
  const s = getStore();
  const results: SemanticResult[] = [];

  s.entities.forEach((entity) => {
    const matchedConcepts: string[] = [];
    let matchType: 'exact' | 'concept' | 'expanded' | 'keyword' = 'keyword';
    let conceptScore = 0;

    for (const cid of conceptIds) {
      const concept = getConcept(cid);
      if (!concept) continue;

      const hasEntity = concept.entityAssociations.some(
        (ea) => ea.type === 'entity' && (ea.id === entity.slug || ea.id === entity.id),
      );
      if (hasEntity) {
        matchedConcepts.push(concept.label);
        conceptScore += 0.9;
      }

      const allNames = [concept.label.toLowerCase(), ...concept.aliases.map(a => a.toLowerCase())];
      for (const name of allNames) {
        if (entity.name.toLowerCase().includes(name) || entity.description.toLowerCase().includes(name)) {
          if (!matchedConcepts.includes(concept.label)) {
            matchedConcepts.push(concept.label);
          }
          conceptScore += 0.5;
          break;
        }
      }
    }

    const isDirectDetect = detectedIds.some((did) => {
      const concept = getConcept(did);
      return concept?.entityAssociations.some(ea => ea.type === 'entity' && (ea.id === entity.slug || ea.id === entity.id));
    });

    if (isDirectDetect) matchType = 'exact';
    else if (matchedConcepts.length > 0 && detectedIds.length > 0) matchType = 'concept';
    else if (matchedConcepts.length > 0) matchType = 'expanded';

    const queryMatch = query ? entity.name.toLowerCase().includes(query.toLowerCase())
      || entity.description.toLowerCase().includes(query.toLowerCase())
      || entity.aliases.some(a => a.toLowerCase().includes(query.toLowerCase()))
    : false;

    if (queryMatch && matchType === 'keyword') matchType = 'keyword';

    if (matchedConcepts.length > 0 || queryMatch) {
      const evidenceBoost = entity.storyCount / 100;
      const finalScore = Math.min(1, conceptScore * 0.6 + evidenceBoost * 0.4);

      const typeLabel = entity.type === 'policy' ? 'policy'
        : entity.type === 'organization' ? 'organization'
        : entity.type === 'country' ? 'country'
        : 'entity';

      results.push({
        id: entity.slug,
        type: 'entity',
        title: entity.name,
        description: entity.description,
        url: `/${typeLabel}/${entity.slug}`,
        score: Math.round(finalScore * 100),
        category: entity.type,
        conceptMatch: [...new Set(matchedConcepts)],
        matchType,
        relevanceScore: finalScore,
      });
    }
  });

  return results;
}

function searchTopicsByConcepts(
  conceptIds: Set<string>,
  detectedIds: string[],
  query: string,
): SemanticResult[] {
  const s = getStore();
  const results: SemanticResult[] = [];

  s.topics.forEach((topic) => {
    const matchedConcepts: string[] = [];
    let matchType: 'exact' | 'concept' | 'expanded' | 'keyword' = 'keyword';
    let conceptScore = 0;

    for (const cid of conceptIds) {
      const concept = getConcept(cid);
      if (!concept) continue;

      const allNames = [concept.label.toLowerCase(), ...concept.aliases.map(a => a.toLowerCase())];
      for (const name of allNames) {
        if (topic.name.toLowerCase().includes(name) || topic.description.toLowerCase().includes(name)) {
          matchedConcepts.push(concept.label);
          conceptScore += 0.7;
          break;
        }
      }
    }

    const isDirectDetect = detectedIds.some((did) => {
      const concept = getConcept(did);
      return concept?.entityAssociations.some(ea => ea.type === 'topic' && ea.id === topic.slug);
    });

    if (isDirectDetect) matchType = 'exact';
    else if (matchedConcepts.length > 0 && detectedIds.length > 0) matchType = 'concept';
    else if (matchedConcepts.length > 0) matchType = 'expanded';

    const queryMatch = query ? topic.name.toLowerCase().includes(query.toLowerCase())
      || topic.description.toLowerCase().includes(query.toLowerCase())
    : false;

    if (queryMatch && matchType === 'keyword') matchType = 'keyword';

    if (matchedConcepts.length > 0 || queryMatch) {
      const finalScore = Math.min(1, conceptScore * 0.7 + (topic.storyCount / 50) * 0.3);

      results.push({
        id: topic.slug,
        type: 'topic',
        title: topic.name,
        description: topic.description,
        url: `/topic/${topic.slug}`,
        score: Math.round(finalScore * 100),
        category: 'topic',
        conceptMatch: [...new Set(matchedConcepts)],
        matchType,
        relevanceScore: finalScore,
      });
    }
  });

  return results;
}

/* ── Main Search Function ────────────────────────────────────────────── */

export function semanticSearch(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    type?: string;
    depth?: number;
    expandThreshold?: number;
  } = {},
): SemanticSearchResponse {
  const { page = 1, pageSize = 20, type, depth = 2, expandThreshold = 0.3 } = options;

  const trimmed = query.trim();

  // Step 1: Understand the query
  const conceptMatches = understandQuery(trimmed);
  const detectedIds = conceptMatches.filter(m => m.score >= 0.5).map(m => m.concept.id);
  const weakIds = conceptMatches.filter(m => m.score < 0.5 && m.score >= expandThreshold).map(m => m.concept.id);

  // Step 2: Expand concepts
  const { expandedIds, trail } = buildExpansionTrail(detectedIds, depth);

  // Also add weak matches
  for (const wid of weakIds) {
    const weakExpanded = expandConcept(wid, 1);
    for (const eid of weakExpanded) expandedIds.add(eid);
  }

  // Step 3: Search all content types
  let results: SemanticResult[] = [];

  if (!type || type === 'story') {
    results = results.concat(searchStoriesByConcepts(expandedIds, detectedIds, trimmed));
  }
  if (!type || type === 'entity') {
    results = results.concat(searchEntitiesByConcepts(expandedIds, detectedIds, trimmed));
  }
  if (!type || type === 'topic') {
    results = results.concat(searchTopicsByConcepts(expandedIds, detectedIds, trimmed));
  }

  // Step 4: Deduplicate by ID (prefer higher score)
  const seen = new Map<string, SemanticResult>();
  for (const r of results) {
    const key = `${r.type}:${r.id}`;
    const existing = seen.get(key);
    if (!existing || r.score > existing.score) {
      seen.set(key, r);
    }
  }

  // Step 5: Sort by score descending
  let sorted = Array.from(seen.values()).sort((a, b) => {
    // Exact matches first
    if (a.matchType !== b.matchType) {
      const order = ['exact', 'concept', 'expanded', 'keyword'];
      return order.indexOf(a.matchType) - order.indexOf(b.matchType);
    }
    return b.score - a.score;
  });

  // Step 6: Add concept path for top results with exact/concept matches
  if (detectedIds.length > 0) {
    for (const r of sorted) {
      if (r.conceptMatch.length > 0 && detectedIds.length > 0) {
        const firstDetected = detectedIds[0];
        for (const cm of r.conceptMatch) {
          const cmConcept = getConceptByLabel(cm);
          if (cmConcept) {
            const path = getConceptPath(firstDetected, cmConcept.id, 3);
            if (path) {
              r.conceptPath = path;
              break;
            }
          }
        }
      }
    }
  }

  // Step 7: Paginate
  const total = sorted.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  return {
    query: trimmed,
    originalQuery: query,
    understood: {
      detectedConcepts: conceptMatches.map(m => ({
        id: m.concept.id,
        label: m.concept.label,
        domain: m.concept.domain,
      })),
      expansionTrail: trail,
    },
    results: paged,
    meta: { total, page, pageSize, totalPages },
  };
}

function getConceptByLabel(label: string): Concept | undefined {
  const allConcepts = getAllConcepts();
  return allConcepts.find(c => c.label === label);
}
