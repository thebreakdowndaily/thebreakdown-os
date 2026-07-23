// The Breakdown OS — Canonical Schema Migration
// Extracts mock data from in-memory store and pushes to canonical Postgres tables.
// Usage: npx tsx scripts/migrate-to-canonical.ts <service-role-key>
// Must run migration 002 first via Supabase SQL editor.

import { getStories, getEntities, getTopics, getTimelines, getFixes } from '../utils/data-layer/store';
import type {
  APIStory, APIEntity, APITopic, APITimeline, APIFix,
  APIRelatedStory, APIRelatedEntity,
} from '../utils/data-layer/types';

const projectRef = 'lvfovvidtowadmnggzzf';
const key = process.argv[2];

if (!key) {
  console.log('Usage: npx tsx scripts/migrate-to-canonical.ts <service-role-key>');
  console.log('Get service_role key from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const api = (path: string) => `https://${projectRef}.supabase.co/rest/v1/${path}`;
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Prefer': 'resolution=merge-duplicates',
};

async function upsert(table: string, rows: any[]): Promise<void> {
  if (!rows.length) { console.log(`  ${table}: 0 rows (skip)`); return; }
  const res = await fetch(api(table), {
    method: 'POST',
    headers,
    body: JSON.stringify(rows),
  });
  if (res.ok) {
    console.log(`  ${table}: ${rows.length} rows inserted`);
  } else {
    const err = await res.text();
    console.error(`  ${table}: FAILED (${res.status}) — ${err.slice(0, 300)}`);
  }
}

// Deterministic UUID v5 from a namespace + name
function detId(name: string): string {
  // Simple deterministic UUID using FNV-1a 64-bit → hex
  // This keeps IDs stable across runs so relationships resolve correctly
  let h = 14695981039346656037n;
  const data = Buffer.from(name, 'utf8');
  for (const b of data) {
    h ^= BigInt(b);
    h *= 1099511628211n;
    h &= 0xFFFFFFFFFFFFFFFFn;
  }
  const hex = h.toString(16).padStart(16, '0');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4000-8000-${hex.slice(12,16)}${hex.slice(0,4)}`;
}

// ─── Migrate ────────────────────────────────────────────────────────────────

async function migrateStories() {
  console.log('\nMigrating stories...');
  const { data: stories } = getStories({ pageSize: 100 });
  const rows = stories.map((s: APIStory) => ({
    id: detId(s.id),
    legacy_id: s.id,
    slug: s.slug,
    title: s.headline,
    headline: s.headline,
    summary: s.summary,
    hero_image: '',
    author: typeof (s as any).author === 'string' ? (s as any).author : (s as any).author?.name || '',
    category: s.category || '',
    status: 'published',
    evidence_score: s.evidenceScore || 0,
    reading_time: s.readingTime || 0,
    tags: s.tags || [],
    blocks: [],
    faq: (s.faq || []).map((f: any) => ({ question: f.question, answer: f.answer })),
    published_at: s.publishedAt || null,
  }));
  await upsert('stories', rows);
}

async function migrateTopics() {
  console.log('\nMigrating topics...');
  const topics = getTopics({ pageSize: 100 }).data;
  const rows = topics.map((t: APITopic) => ({
    id: detId(t.id),
    legacy_id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description || '',
    overview: (t as any).overview || null,
    image: (t as any).image || '',
    countries: [],
    faq: (t as any).faq || [],
    statistics: (t as any).statistics || [],
  }));
  await upsert('topics', rows);
}

async function migrateEntities() {
  console.log('\nMigrating entities...');
  const entities = getEntities({ pageSize: 100 }).data;
  const rows = entities.map((e: APIEntity) => ({
    id: detId(e.id),
    legacy_id: e.id,
    slug: e.slug,
    name: e.name,
    type: e.type,
    description: e.description || '',
    aliases: (e as any).aliases || [],
    image: (e as any).image || '',
    story_count: (e as any).storyCount || 0,
    evidence_score: (e as any).evidenceScore || 0,
    statistics: (e as any).statistics || [],
    timeline: (e as any).timeline || [],
    faq: (e as any).faq || [],
  }));
  await upsert('entities', rows);
}

async function migrateTimelines() {
  console.log('\nMigrating timelines...');
  const timelines = getTimelines({ pageSize: 100 }).data;
  const rows = timelines.map((tl: APITimeline) => ({
    id: detId(tl.id),
    legacy_id: tl.id,
    slug: tl.id,
    title: tl.title,
    description: (tl as any).description || '',
    category: (tl as any).category || '',
    events: (tl as any).events || [],
  }));
  await upsert('timelines', rows);
}

async function migrateFixes() {
  console.log('\nMigrating fixes...');
  const fixes = getFixes({ pageSize: 100 }).data;
  const rows = fixes.map((f: APIFix) => {
    const problem = (f as any).problem;
    return {
      id: detId(f.id),
      legacy_id: f.id,
      slug: f.slug,
      title: (f as any).headline || f.id,
      problem: typeof problem === 'string' ? problem : problem?.content || problem?.title || '',
      root_causes: Array.isArray((f as any).rootCauses) ? (f as any).rootCauses.map((rc: any) => typeof rc === 'string' ? rc : rc?.content || rc?.title || '') : [],
      existing_solutions: (f as any).existingSolutions || [],
      global_examples: (f as any).globalExamples || [],
      recommended_actions: (f as any).recommendedActions || [],
      citizen_actions: (f as any).citizenActions || [],
      government_actions: (f as any).governmentActions || [],
      metrics: (f as any).metrics || [],
      status: (f as any).status || 'published',
    };
  });
  await upsert('fixes', rows);
}

async function migrateRelationships() {
  console.log('\nMigrating relationships...');
  const { data: stories } = getStories({ pageSize: 100 });

  const storyTopics: { story_id: string; topic_id: string }[] = [];
  const storyEntities: { story_id: string; entity_id: string }[] = [];
  const topicEntities: { topic_id: string; entity_id: string }[] = [];
  const storyTimelines: { story_id: string; timeline_id: string }[] = [];

  for (const s of stories) {
    const storyId = detId(s.id);
    const topics = getTopics({ pageSize: 100 }).data;

    // Map relatedTopicIds
    if ((s as any).relatedTopicIds) {
      for (const tid of (s as any).relatedTopicIds) {
        storyTopics.push({ story_id: storyId, topic_id: detId(tid) });
      }
    }

    // Map relatedEntityIds
    if ((s as any).relatedEntityIds) {
      for (const eid of (s as any).relatedEntityIds) {
        storyEntities.push({ story_id: storyId, entity_id: detId(eid) });
      }
    }

    // Map related entities from the entity list
    if (s.relatedEntities) {
      for (const re of s.relatedEntities) {
        storyEntities.push({ story_id: storyId, entity_id: detId(re.id) });
      }
    }
  }

  // Map topic-entity relationships from topic data
  const topics = getTopics({ pageSize: 100 }).data;
  for (const t of topics) {
    const topicId = detId(t.id);
    if ((t as any).relatedEntityIds) {
      for (const eid of (t as any).relatedEntityIds) {
        topicEntities.push({ topic_id: topicId, entity_id: detId(eid) });
      }
    }
    if (t.entities) {
      for (const e of t.entities) {
        topicEntities.push({ topic_id: topicId, entity_id: detId(e.id) });
      }
    }
  }

  if (storyTopics.length) await upsert('story_topics', storyTopics);
  if (storyEntities.length) await upsert('story_entities', storyEntities);
  if (topicEntities.length) await upsert('topic_entities', topicEntities);
  if (storyTimelines.length) await upsert('story_timelines', storyTimelines);
}

async function migrateGraph() {
  console.log('\nMigrating knowledge graph...');
  const { data: stories } = getStories({ pageSize: 100 });
  const entities = getEntities({ pageSize: 100 }).data;
  const topics = getTopics({ pageSize: 100 }).data;

  // Build nodes for all content
  const nodes: any[] = [];
  const seen = new Set<string>();

  function addNode(refType: string, refId: string, title: string, slug: string, subtype?: string) {
    const key = `${refType}:${refId}`;
    if (seen.has(key)) return;
    seen.add(key);
    nodes.push({
      id: detId(key),
      ref_type: refType,
      ref_id: refId,
      title,
      slug,
      subtype: subtype || null,
    });
  }

  for (const s of stories) {
    addNode('story', s.id, s.headline, s.slug);
  }
  for (const e of entities) {
    addNode('entity', e.id, e.name, e.slug, e.type);
  }
  for (const t of topics) {
    addNode('topic', t.id, t.name, t.slug);
  }

  await upsert('nodes', nodes.map(n => ({
    ...n,
    metadata: null,
  })));

  // Build edges from relationships
  const edges: any[] = [];
  const edgeSeen = new Set<string>();

  function addEdge(sourceRefType: string, sourceRefId: string, targetRefType: string, targetRefId: string, relation: string, confidence: number = 1.0) {
    const sourceDetId = detId(`${sourceRefType}:${sourceRefId}`);
    const targetDetId = detId(`${targetRefType}:${targetRefId}`);
    const key = `${sourceDetId}:${targetDetId}:${relation}`;
    if (edgeSeen.has(key)) return;
    edgeSeen.add(key);
    edges.push({
      source_id: sourceDetId,
      target_id: targetDetId,
      relation,
      confidence,
    });
  }

  for (const s of stories) {
    if ((s as any).relatedTopicIds) {
      for (const tid of (s as any).relatedTopicIds) {
        addEdge('story', s.id, 'topic', tid, 'covers');
      }
    }
    if ((s as any).relatedEntityIds) {
      for (const eid of (s as any).relatedEntityIds) {
        addEdge('story', s.id, 'entity', eid, 'mentions');
      }
    }
    if (s.relatedEntities) {
      for (const re of s.relatedEntities) {
        addEdge('story', s.id, 'entity', re.id, 'mentions');
      }
    }
  }

  for (const t of topics) {
    if ((t as any).entities) {
      for (const e of (t as any).entities) {
        addEdge('topic', t.id, 'entity', e.id, 'related_to', 0.8);
      }
    }
  }

  if (edges.length) await upsert('edges', edges.map(e => ({ ...e, metadata: null })));
}

async function migrateSearchIndex() {
  console.log('\nBuilding search index...');
  const { data: stories } = getStories({ pageSize: 100 });
  const entities = getEntities({ pageSize: 100 }).data;
  const topics = getTopics({ pageSize: 100 }).data;

  const entries: any[] = [];

  for (const s of stories) {
    entries.push({
      ref_type: 'story',
      ref_id: s.id,
      ref_slug: s.slug,
      title: s.headline,
      description: s.summary || '',
      content: `${s.headline} ${s.summary} ${(s.keyPoints || []).join(' ')} ${(s.tags || []).join(' ')}`,
      tags: s.tags || [],
      score: s.evidenceScore || 0,
    });
  }

  for (const e of entities) {
    entries.push({
      ref_type: 'entity',
      ref_id: e.id,
      ref_slug: e.slug,
      title: e.name,
      description: e.description || '',
      content: `${e.name} ${e.description || ''} ${((e as any).aliases || []).join(' ')}`,
      tags: [],
      score: (e as any).evidenceScore || 0,
    });
  }

  for (const t of topics) {
    entries.push({
      ref_type: 'topic',
      ref_id: t.id,
      ref_slug: t.slug,
      title: t.name,
      description: t.description || '',
      content: `${t.name} ${t.description || ''}`,
      tags: [],
      score: 0,
    });
  }

  await upsert('index_entries', entries);
}

async function migrateActivityLog() {
  console.log('\nCreating audit trail...');
  const { data: stories } = getStories({ pageSize: 100 });
  const entities = getEntities({ pageSize: 100 }).data;
  const topics = getTopics({ pageSize: 100 }).data;

  const entries: any[] = [];

  for (const s of stories) {
    entries.push({
      event_type: 'story:published',
      entity_type: 'story',
      entity_id: s.id,
      entity_slug: s.slug,
      metadata: { title: s.headline },
    });
  }

  for (const e of entities) {
    entries.push({
      event_type: 'entity:created',
      entity_type: 'entity',
      entity_id: e.id,
      entity_slug: e.slug,
      metadata: { name: e.name, type: e.type },
    });
  }

  for (const t of topics) {
    entries.push({
      event_type: 'topic:created',
      entity_type: 'topic',
      entity_id: t.id,
      entity_slug: t.slug,
      metadata: { name: t.name },
    });
  }

  if (entries.length) await upsert('activity_log', entries);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Canonical Schema Migration ===\n');

  await migrateStories();
  await migrateTopics();
  await migrateEntities();
  await migrateTimelines();
  await migrateFixes();
  await migrateRelationships();
  await migrateGraph();
  await migrateSearchIndex();
  await migrateActivityLog();

  console.log('\n=== Migration complete ===');
}

main().catch(console.error);
