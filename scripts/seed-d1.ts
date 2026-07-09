// ─── Seed D1 Database with CMS Content Data ────────────────────────────
// Run: npx tsx scripts/seed-d1.ts
//
// Seeds all CMS tables with the in-memory store contents.
// This should be run once after migrations are applied to populate
// the D1 database with the initial seed data.

import { cmsStore } from '../utils/cms-store';

// Use wrangler d1 execute with JSON output for seeding
async function main() {
  console.log('Seeding D1 database with CMS content...\n');

  const stories = cmsStore.getStories();
  const topics = cmsStore.getTopics();
  const entities = cmsStore.getEntities();
  const timelines = cmsStore.getTimelines();
  const fixes = cmsStore.getFixes();
  const media = cmsStore.getMedia();
  const users = cmsStore.getUsers();
  const activity = cmsStore.getActivity(100);

  // Generate SQL insert statements
  const sql: string[] = ['-- Seeded on ' + new Date().toISOString()];
  sql.push('');

  // Stories
  for (const s of stories) {
    sql.push(`INSERT OR REPLACE INTO cms_stories (id,title,slug,excerpt,status,category,author,hero_image,tags,blocks_json,created_at,updated_at,published_at) VALUES (
      '${s.id}',
      '${escape(s.title)}',
      '${escape(s.slug)}',
      '${escape(s.excerpt || '')}',
      '${s.status || 'draft'}',
      '${escape(s.category || '')}',
      '${escape(s.author || '')}',
      '${escape(s.heroImage || '')}',
      '${jsonEscape(JSON.stringify(s.tags || []))}',
      '${jsonEscape(JSON.stringify(s.blocks || []))}',
      '${s.createdAt || new Date().toISOString()}',
      '${s.updatedAt || new Date().toISOString()}',
      ${s.publishedAt ? `'${s.publishedAt}'` : 'NULL'}
    );`);
  }

  // Topics
  for (const t of topics) {
    sql.push(`INSERT OR REPLACE INTO cms_topics (id,name,slug,description,overview,image,story_ids,related_entity_ids,featured_story_ids,countries,faq,timeline,statistics,created_at,updated_at) VALUES (
      '${t.id}',
      '${escape(t.name)}',
      '${escape(t.slug)}',
      '${escape(t.description || '')}',
      '${escape((t as any).overview || '')}',
      '${escape(t.image || '')}',
      '${jsonEscape(JSON.stringify((t as any).storyIds || []))}',
      '${jsonEscape(JSON.stringify((t as any).relatedEntityIds || []))}',
      '${jsonEscape(JSON.stringify((t as any).featuredStoryIds || []))}',
      '${jsonEscape(JSON.stringify((t as any).countries || []))}',
      '${jsonEscape(JSON.stringify(t.faq || []))}',
      '${jsonEscape(JSON.stringify((t as any).timeline || []))}',
      '${jsonEscape(JSON.stringify(t.statistics || []))}',
      '${t.createdAt || new Date().toISOString()}',
      '${t.updatedAt || new Date().toISOString()}'
    );`);
  }

  // Entities
  for (const e of entities) {
    sql.push(`INSERT OR REPLACE INTO cms_entities (id,type,name,slug,description,aliases,image,story_count,evidence_score,related_entity_ids,related_story_ids,related_topic_ids,statistics,timeline,faq,created_at,updated_at) VALUES (
      '${e.id}',
      '${e.type || 'organization'}',
      '${escape(e.name)}',
      '${escape(e.slug)}',
      '${escape(e.description || '')}',
      '${jsonEscape(JSON.stringify(e.aliases || []))}',
      '${escape(e.image || '')}',
      ${e.storyCount || 0},
      ${e.evidenceScore || 0},
      '${jsonEscape(JSON.stringify(e.relatedEntityIds || []))}',
      '${jsonEscape(JSON.stringify(e.relatedStoryIds || []))}',
      '${jsonEscape(JSON.stringify(e.relatedTopicIds || []))}',
      '${jsonEscape(JSON.stringify(e.statistics || []))}',
      '${jsonEscape(JSON.stringify(e.timeline || []))}',
      '${jsonEscape(JSON.stringify(e.faq || []))}',
      '${e.createdAt || new Date().toISOString()}',
      '${e.updatedAt || new Date().toISOString()}'
    );`);
  }

  // Timelines
  for (const tl of timelines) {
    sql.push(`INSERT OR REPLACE INTO cms_timelines (id,title,description,category,story_ids,entity_ids,topic_ids,events,created_at,updated_at) VALUES (
      '${tl.id}',
      '${escape(tl.title)}',
      '${escape(tl.description || '')}',
      '${escape(tl.category || '')}',
      '${jsonEscape(JSON.stringify(tl.storyIds || []))}',
      '${jsonEscape(JSON.stringify(tl.entityIds || []))}',
      '${jsonEscape(JSON.stringify(tl.topicIds || []))}',
      '${jsonEscape(JSON.stringify(tl.events || []))}',
      '${tl.createdAt || new Date().toISOString()}',
      '${tl.updatedAt || new Date().toISOString()}'
    );`);
  }

  // Fixes
  for (const f of fixes) {
    sql.push(`INSERT OR REPLACE INTO cms_fixes (id,title,slug,problem,root_causes,existing_solutions,global_examples,recommended_actions,citizen_actions,government_actions,metrics,status,created_at,updated_at) VALUES (
      '${f.id}',
      '${escape(f.title)}',
      '${escape(f.slug)}',
      '${escape(f.problem || '')}',
      '${jsonEscape(JSON.stringify(f.rootCauses || []))}',
      '${jsonEscape(JSON.stringify(f.existingSolutions || []))}',
      '${jsonEscape(JSON.stringify(f.globalExamples || []))}',
      '${jsonEscape(JSON.stringify(f.recommendedActions || []))}',
      '${jsonEscape(JSON.stringify(f.citizenActions || []))}',
      '${jsonEscape(JSON.stringify(f.governmentActions || []))}',
      '${jsonEscape(JSON.stringify(f.metrics || []))}',
      '${f.status || 'draft'}',
      '${f.createdAt || new Date().toISOString()}',
      '${f.updatedAt || new Date().toISOString()}'
    );`);
  }

  // Media
  for (const m of media) {
    sql.push(`INSERT OR REPLACE INTO cms_media (id,type,src,alt,caption,tags,credit,width,height,file_size,version,created_at,updated_at) VALUES (
      '${m.id}',
      '${m.type}',
      '${escape(m.src)}',
      '${escape(m.alt || '')}',
      '${escape(m.caption || '')}',
      '${jsonEscape(JSON.stringify(m.tags || []))}',
      '${escape(m.credit || '')}',
      ${m.width ?? 'NULL'},
      ${m.height ?? 'NULL'},
      ${m.fileSize ?? 'NULL'},
      ${m.version || 1},
      '${m.createdAt || new Date().toISOString()}',
      '${m.updatedAt || new Date().toISOString()}'
    );`);
  }

  // Users
  for (const u of users) {
    sql.push(`INSERT OR REPLACE INTO cms_users (id,name,email,role,avatar,created_at) VALUES (
      '${u.id}',
      '${escape(u.name)}',
      '${escape(u.email)}',
      '${u.role}',
      '${escape(u.avatar || '')}',
      '${u.createdAt || new Date().toISOString()}'
    );`);
  }

  // Activity
  for (const a of activity) {
    sql.push(`INSERT OR REPLACE INTO cms_activity (id,type,label,timestamp,user_id,link) VALUES (
      '${a.id}',
      '${a.type}',
      '${escape(a.label)}',
      '${a.timestamp}',
      ${a.userId ? `'${a.userId}'` : 'NULL'},
      ${a.link ? `'${a.link}'` : 'NULL'}
    );`);
  }

  // Write SQL to file
  const fs = await import('fs');
  const outputPath = 'scripts/seed-data.sql';
  fs.writeFileSync(outputPath, sql.join('\n'), 'utf-8');
  console.log(`Wrote ${sql.length - 2} SQL statements to ${outputPath}`);
  console.log('Apply with: wrangler d1 execute thebreakdown-auth --remote --file=' + outputPath);
}

function escape(s: string): string {
  return s ? s.replace(/'/g, "''").replace(/\\/g, '\\\\') : '';
}

function jsonEscape(s: string): string {
  return s ? s.replace(/'/g, "''") : "'[]'";
}

main().catch(console.error);
