const { Client } = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();
  
  console.log('Resetting database to pristine state...');
  
  // Drop all research tables
  const researchTables = [
    'research_claim_subject_relationships', 'research_corrections',
    'research_evidence_items', 'research_claims', 'research_financial_records',
    'research_party_affiliation_history', 'research_sources',
    'research_constituencies', 'research_persons', 'research_political_parties',
    'research_projects'
  ];
  
  for (const t of researchTables) {
    await c.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
  }
  
  // Drop all research enums
  const researchEnums = [
    'publication_status_type', 'human_review_status_type', 'value_availability_status_type',
    'affiliation_type_enum', 'affiliation_status_enum', 'claim_scope_type',
    'research_confidence_type', 'financial_stage_type', 'correction_type_enum'
  ];
  
  for (const e of researchEnums) {
    await c.query(`DROP TYPE IF EXISTS ${e} CASCADE`);
  }
  
  // Drop 002 tables and enums
  const tables002 = [
    'story_topics', 'story_entities', 'topic_entities', 'story_timelines',
    'entity_relationships', 'story_claims', 'claim_citations', 'evidence_items',
    'nodes', 'edges', 'story_versions', 'activity_log',
    'reader_profiles', 'bookmarks', 'reading_history', 'follows',
    'index_entries', 'stories', 'topics', 'entities', 'timelines',
    'fixes', 'media_items', 'datasets', 'dataset_versions', 'dataset_metrics',
    'dataset_dimensions', 'dataset_series', 'dataset_observations', 'dataset_visualizations'
  ];
  
  for (const t of tables002) {
    await c.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
  }
  
  // Drop schemas
  await c.query('DROP SCHEMA IF EXISTS editorial CASCADE');
  await c.query('DROP SCHEMA IF EXISTS graph CASCADE');
  await c.query('DROP SCHEMA IF EXISTS audit CASCADE');
  await c.query('DROP SCHEMA IF EXISTS identity CASCADE');
  await c.query('DROP SCHEMA IF EXISTS search CASCADE');
  
  // Drop 002 enums
  const enums002 = [
    'entity_kind', 'story_status', 'relation_type', 'confidence_tier',
    'claim_status', 'media_type', 'dataset_category', 'dataset_frequency',
    'data_type', 'user_role', 'event_type'
  ];
  
  for (const e of enums002) {
    await c.query(`DROP TYPE IF EXISTS ${e} CASCADE`);
  }
  
  // Drop functions
  await c.query('DROP FUNCTION IF EXISTS set_updated_at CASCADE');
  await c.query('DROP FUNCTION IF EXISTS bump_story_version CASCADE');
  await c.query('DROP FUNCTION IF EXISTS archive_story_version CASCADE');
  
  // Drop extensions
  await c.query('DROP EXTENSION IF EXISTS btree_gist CASCADE');
  
  // Verify pristine
  const tables = await c.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  const enums = await c.query("SELECT t.typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e'");
  
  console.log('Post-reset public tables:', tables.rows.length === 0 ? 'NONE' : tables.rows.map(x => x.tablename).join(', '));
  console.log('Post-reset enums:', enums.rows.length === 0 ? 'NONE' : enums.rows.map(x => x.typname).join(', '));
  
  if (tables.rows.length === 0 && enums.rows.length === 0) {
    console.log('DATABASE RESET: PRISTINE');
  } else {
    console.error('DATABASE RESET: INCOMPLETE');
  }
  
  await c.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
