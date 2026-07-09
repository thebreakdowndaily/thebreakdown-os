// Seed script: pushes mock data from in-memory store to Supabase
// Usage: node scripts/seed-supabase.js <service-role-key>

const projectRef = 'lvfovvidtowadmnggzzf';
const key = process.argv[2];

if (!key) {
  console.log('Usage: node scripts/seed-supabase.js <service-role-key>');
  console.log('Get service_role key from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const api = (table) => `https://${projectRef}.supabase.co/rest/v1/${table}`;
const headers = {
  'Content-Type': 'application/json',
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Prefer': 'resolution=merge-duplicates',
};

// Import mock data from the store
const { getStories, getEntities, getTopics, getTimelines, getFixes, getDatasets, getMediaItems } = require('../utils/data-layer/store');

async function seed(table, rows) {
  if (!rows.length) { console.log(`  ${table}: 0 rows (skip)`); return; }
  const res = await fetch(api(table), {
    method: 'POST',
    headers,
    body: JSON.stringify(rows),
  });
  if (res.ok) {
    console.log(`  ${table}: ${rows.length} rows seeded`);
  } else {
    const err = await res.text();
    console.error(`  ${table}: FAILED (${res.status}) — ${err.slice(0, 200)}`);
  }
}

async function main() {
  console.log('Seeding Supabase...\n');

  // Extract data from the in-memory store
  const stories = getStories({ pageSize: 100 }).data;
  const entities = getEntities({ pageSize: 100 }).data;
  const topics = getTopics({ pageSize: 100 }).data;
  const timelines = getTimelines({ pageSize: 100 }).data;
  const fixes = getFixes({ pageSize: 100 }).data;

  // Seed each table
  await seed('stories', stories.map(s => ({
    id: s.id, slug: s.slug, title: s.title, summary: s.summary,
    content: { blocks: s.blocks || [] },
    status: s.status || 'published', author_id: s.author || '',
    category: s.category || '', tags: s.tags || [],
    published_at: s.publishedAt || null,
    created_at: s.createdAt, updated_at: s.updatedAt,
  })));

  await seed('topics', topics.map(t => ({
    id: t.id, slug: t.slug, name: t.name, description: t.description,
    category: t.category || '', tags: t.tags || [],
    related_entity_ids: t.relatedEntityIds || [],
    related_story_ids: t.storyIds || [],
    created_at: t.createdAt, updated_at: t.updatedAt,
  })));

  await seed('entities', entities.map(e => ({
    id: e.id, slug: e.slug, name: e.name, description: e.description,
    type: e.type, aliases: e.aliases || [], tags: (e as any).tags || [],
    image: (e as any).image || '', story_count: e.storyCount || 0,
    evidence_score: e.evidenceScore || 0,
    related_entity_ids: e.relatedEntityIds || [],
    related_story_ids: e.relatedStoryIds || [],
    related_topic_ids: e.relatedTopicIds || [],
    statistics: (e as any).statistics || [],
    timeline: (e as any).timeline || [],
    faq: (e as any).faq || [],
    created_at: e.createdAt, updated_at: e.updatedAt,
  })));

  await seed('timelines', timelines.map(tl => ({
    id: tl.id, title: tl.title, description: tl.description || '',
    events: (tl as any).events || [], category: (tl as any).category || '',
    tags: (tl as any).tags || [],
    story_ids: (tl as any).storyIds || [],
    entity_ids: (tl as any).entityIds || [],
    topic_ids: (tl as any).topicIds || [],
    created_at: tl.createdAt, updated_at: tl.updatedAt,
  })));

  await seed('fixes', fixes.map(f => ({
    id: f.id, slug: f.slug, title: f.title, problem: f.problem,
    root_causes: f.rootCauses || [],
    existing_solutions: (f as any).existingSolutions || [],
    global_examples: (f as any).globalExamples || [],
    recommended_actions: (f as any).recommendedActions || [],
    citizen_actions: (f as any).citizenActions || [],
    government_actions: (f as any).governmentActions || [],
    metrics: (f as any).metrics || {}, status: f.status || 'published',
    category: (f as any).category || '', tags: (f as any).tags || [],
    created_at: f.createdAt, updated_at: f.updatedAt,
  })));

  // Datasets exist as a separate service
  const { getDatasets } = require('../services/datasets/service');
  // For now, datasets are handled separately — skip if no service

  console.log('\nDone! Supabase is seeded.');
}

main().catch(console.error);
