// Seed script: pushes mock data from in-memory store to Supabase
// Usage: npx tsx scripts/seed-supabase.ts <service-role-key>

import { getStories, getEntities, getTopics, getTimelines, getFixes } from '../utils/data-layer/store';

const projectRef = 'lvfovvidtowadmnggzzf';
const key = process.argv[2];

if (!key) {
  console.log('Usage: npx tsx scripts/seed-supabase.ts <service-role-key>');
  console.log('Get service_role key from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const api = (table: string) => `https://${projectRef}.supabase.co/rest/v1/${table}`;
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Prefer': 'resolution=merge-duplicates',
};

async function seed(table: string, rows: any[]) {
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
    console.error(`  ${table}: FAILED (${res.status}) — ${err.slice(0, 300)}`);
  }
}

async function main() {
  console.log('Seeding Supabase...\n');

  const stories = getStories({ pageSize: 100 }).data;
  const entities = getEntities({ pageSize: 100 }).data;
  const topics = getTopics({ pageSize: 100 }).data;
  const timelines = getTimelines({ pageSize: 100 }).data;
  const fixes = getFixes({ pageSize: 100 }).data;

  await seed('stories', stories.map(s => ({
    id: s.id, slug: s.slug, title: (s as any).headline || s.id,
    summary: (s as any).summary || '',
    content: { blocks: (s as any).blocks || [] },
    status: (s as any).status || 'published',
    author_id: typeof (s as any).author === 'string' ? (s as any).author : (s as any).author?.name || '',
    category: (s as any).category || '', tags: (s as any).tags || [],
    published_at: (s as any).publishedAt || null,
    created_at: (s as any).createdAt, updated_at: (s as any).updatedAt,
  })));

  await seed('topics', topics.map(t => ({
    id: t.id, slug: t.slug, name: t.name, description: t.description,
    category: (t as any).category || '', tags: [],
    related_entity_ids: (t as any).relatedEntityIds || [],
    related_story_ids: (t as any).storyIds || [],
    created_at: (t as any).createdAt, updated_at: (t as any).updatedAt,
  })));

  await seed('entities', entities.map(e => ({
    id: e.id, slug: e.slug, name: e.name, description: e.description,
    type: e.type, aliases: (e as any).aliases || [],
    tags: [], image: (e as any).image || '',
    story_count: (e as any).storyCount || 0,
    evidence_score: (e as any).evidenceScore || 0,
    related_entity_ids: (e as any).relatedEntityIds || [],
    related_story_ids: (e as any).relatedStoryIds || [],
    related_topic_ids: (e as any).relatedTopicIds || [],
    statistics: (e as any).statistics || [],
    timeline: (e as any).timeline || [],
    faq: (e as any).faq || [],
    created_at: (e as any).createdAt, updated_at: (e as any).updatedAt,
  })));

  await seed('timelines', timelines.map(tl => ({
    id: tl.id, title: tl.title, description: (tl as any).description || '',
    events: (tl as any).events || [], category: (tl as any).category || '',
    tags: [], story_ids: [], entity_ids: [], topic_ids: [],
    created_at: (tl as any).createdAt, updated_at: (tl as any).updatedAt,
  })));

  await seed('fixes', fixes.map(f => {
    const problem = (f as any).problem;
    return {
      id: f.id, slug: f.slug, title: (f as any).headline || f.id,
      problem: typeof problem === 'string' ? problem : problem?.content || problem?.title || '',
      root_causes: Array.isArray((f as any).rootCauses) ? (f as any).rootCauses.map((rc: any) => typeof rc === 'string' ? rc : rc?.content || rc?.title || '') : [],
      existing_solutions: (f as any).existingSolutions || [],
      global_examples: (f as any).globalExamples || [],
      recommended_actions: (f as any).recommendedActions || [],
      citizen_actions: (f as any).citizenActions || [],
      government_actions: (f as any).governmentActions || [],
      metrics: (f as any).metrics || {},
      status: (f as any).status || 'published', category: '', tags: [],
      created_at: (f as any).createdAt, updated_at: (f as any).updatedAt,
    };
  }));

  console.log('\nDone! Supabase is seeded.');
}

main().catch(console.error);
