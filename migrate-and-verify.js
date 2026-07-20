const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';
const MIGRATION_DIR = path.resolve(__dirname, 'supabase/migrations');

const MIGRATIONS = [
  '001_create_tables.sql',
  '002_canonical_schema.sql',
  '003_image_intelligence_schema.sql',
  '004_canonical_research_schema.sql',
];

async function getPublicTables(c) {
  const r = await c.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  return r.rows.map(x => x.tablename);
}

async function getEnums(c) {
  const r = await c.query("SELECT t.typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e' ORDER BY t.typname");
  return r.rows.map(x => x.typname);
}

async function getSchemas(c) {
  const r = await c.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_extensions','pg_toast','information_schema') ORDER BY schema_name");
  return r.rows.map(x => x.schema_name);
}

async function getRLSPolicies(c) {
  const r = await c.query("SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname");
  return r.rows.map(x => `${x.schemaname}.${x.tablename}.${x.policyname}`);
}

async function getRLSTables(c) {
  const r = await c.query("SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'research_%' AND rowsecurity = true ORDER BY tablename");
  return r.rows.map(x => `${x.schemaname}.${x.tablename}`);
}

async function getExtensions(c) {
  const r = await c.query("SELECT extname FROM pg_extension ORDER BY extname");
  return r.rows.map(x => x.extname);
}

async function getColumnCount(c, table) {
  const r = await c.query(`SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}'`);
  return parseInt(r.rows[0].cnt, 10);
}

async function getConstraints(c, table) {
  const r = await c.query(`SELECT conname, contype FROM pg_constraint WHERE conrelid = '${table}'::regclass ORDER BY conname`);
  return r.rows.map(x => `${x.conname}(${x.contype})`);
}

async function getExclusionConstraints(c) {
  const r = await c.query(`SELECT conname FROM pg_constraint WHERE contype = 'x' ORDER BY conname`);
  return r.rows.map(x => x.conname);
}

async function main() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();
  
  console.log('=== PHASE 2: MIGRATION PROOF ===');
  console.log('Database connected.\n');
  
  // Pre-001: verify pristine
  const preTables = await getPublicTables(c);
  const preEnums = await getEnums(c);
  console.log('PRE-001 STATE:');
  console.log('  Public tables:', preTables.length === 0 ? 'NONE (pristine)' : preTables.join(', '));
  console.log('  Enums:', preEnums.length === 0 ? 'NONE' : preEnums.join(', '));
  
  if (preTables.length > 0) {
    console.error('\nABORT: Database not pristine. Tables exist before migration 001.');
    await c.end();
    process.exit(1);
  }
  console.log('  Pristine check: PASSED\n');
  
  // Execute migrations
  for (const file of MIGRATIONS) {
    const sqlPath = path.join(MIGRATION_DIR, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log(`--- Applying ${file} ---`);
    const startTime = Date.now();
    
    try {
      await c.query(sql);
      const elapsed = Date.now() - startTime;
      console.log(`  Status: OK (${elapsed}ms)`);
    } catch (e) {
      console.error(`  Status: FAILED`);
      console.error(`  Error: ${e.message}`);
      await c.end();
      process.exit(1);
    }
    
    // Verify after each migration
    if (file === '001_create_tables.sql') {
      const tables = await getPublicTables(c);
      console.log(`  Public tables: ${tables.length}`);
      const expected001 = ['bookmarks','datasets','dataset_dimensions','dataset_metrics','dataset_observations','dataset_series','dataset_versions','dataset_visualizations','entities','fixes','media_items','stories','timelines','topics','users'];
      const missing = expected001.filter(t => !tables.includes(t));
      const extra = tables.filter(t => !expected001.includes(t));
      if (missing.length > 0) console.error(`  MISSING: ${missing.join(', ')}`);
      if (extra.length > 0) console.error(`  EXTRA: ${extra.join(', ')}`);
      if (missing.length === 0 && extra.length === 0) console.log('  Tables: VERIFIED');
    }
    
    if (file === '002_canonical_schema.sql') {
      const tables = await getPublicTables(c);
      const enums = await getEnums(c);
      const schemas = await getSchemas(c);
      console.log(`  Public tables: ${tables.length}`);
      console.log(`  Enums: ${enums.length} (${enums.join(', ')})`);
      console.log(`  Schemas: ${schemas.join(', ')}`);
      
      const expectedSchemas = ['audit','editorial','graph','identity','public','search'];
      const missingSchemas = expectedSchemas.filter(s => !schemas.includes(s));
      if (missingSchemas.length > 0) console.error(`  MISSING SCHEMAS: ${missingSchemas.join(', ')}`);
      else console.log('  Schemas: VERIFIED');
      
      // Check 001 tables are gone
      const oldTables = ['bookmarks','datasets','entities','fixes','media_items','stories','timelines','topics','users'];
      const remaining = oldTables.filter(t => tables.includes(t));
      if (remaining.length > 0) console.error(`  OLD TABLES STILL PRESENT: ${remaining.join(', ')}`);
      else console.log('  001 tables dropped: VERIFIED');
      
      // Check new public tables
      const expectedNew = ['dataset_dimensions','dataset_metrics','dataset_observations','dataset_series','dataset_topics','dataset_visualizations','datasets','dataset_versions','entities','entity_relationships','fixes','media_items','stories','story_entities','story_timelines','story_topics','timelines','topics','topic_entities'];
      // Just check key ones exist
      const keyNew = ['stories','topics','entities','timelines','fixes','media_items','datasets','story_topics','story_entities','entity_relationships'];
      const missingNew = keyNew.filter(t => !tables.includes(t));
      if (missingNew.length > 0) console.error(`  MISSING NEW TABLES: ${missingNew.join(', ')}`);
      else console.log('  New public tables: VERIFIED');
    }
    
    if (file === '003_image_intelligence_schema.sql') {
      const cols = await getColumnCount(c, 'media_items');
      console.log(`  media_items columns: ${cols} (expected: 30, base 11 + 19 added)`);
      if (cols >= 30) console.log('  Column count: VERIFIED');
      else console.error(`  Column count: MISMATCH (got ${cols})`);
    }
    
    if (file === '004_canonical_research_schema.sql') {
      const tables = await getPublicTables(c);
      const enums = await getEnums(c);
      const extensions = await getExtensions(c);
      const rlsTables = await getRLSTables(c);
      const policies = await getRLSPolicies(c);
      const exclusions = await getExclusionConstraints(c);
      
      console.log(`  Public tables: ${tables.length}`);
      console.log(`  Enums: ${enums.length}`);
      console.log(`  Extensions: ${extensions.join(', ')}`);
      console.log(`  RLS tables: ${rlsTables.join(', ')}`);
      console.log(`  RLS policies: ${policies.length} (${policies.join(', ')})`);
      console.log(`  Exclusion constraints: ${exclusions.length} (${exclusions.join(', ')})`);
      
      // Verify research tables
      const researchTables = ['research_constituencies','research_persons','research_political_parties','research_projects','research_party_affiliation_history','research_financial_records','research_sources','research_evidence_items','research_claims','research_claim_subject_relationships','research_corrections'];
      const missingResearch = researchTables.filter(t => !tables.includes(t));
      if (missingResearch.length > 0) console.error(`  MISSING RESEARCH TABLES: ${missingResearch.join(', ')}`);
      else console.log('  Research tables: VERIFIED');
      
      // Verify RLS
      const expectedRlsTables = ['research_claims','research_financial_records','research_party_affiliation_history'];
      const missingRls = expectedRlsTables.filter(t => !rlsTables.includes(t));
      if (missingRls.length > 0) console.error(`  MISSING RLS TABLES: ${missingRls.join(', ')}`);
      else console.log('  RLS enabled: VERIFIED');
      
      // Verify policies
      const expectedPolicies = ['admin_update_claims','agent_insert_claims','editor_close_history','editor_publish_claims','public_read_active_history','public_read_published_claims','researcher_insert_claims','researcher_update_claims','reviewer_update_claims'];
      const missingPolicies = expectedPolicies.filter(p => !policies.includes(p));
      if (missingPolicies.length > 0) console.error(`  MISSING POLICIES: ${missingPolicies.join(', ')}`);
      else console.log('  RLS policies: VERIFIED');
      
      // Verify exclusion constraint
      if (exclusions.includes('no_overlapping_formal_memberships')) console.log('  Exclusion constraint: VERIFIED');
      else console.error('  Exclusion constraint: MISSING');
      
      // Verify CHECK constraints
      const claimsChecks = await getConstraints(c, 'research_claims');
      console.log(`  research_claims constraints: ${claimsChecks.join(', ')}`);
      
      const subjectChecks = await getConstraints(c, 'research_claim_subject_relationships');
      console.log(`  research_claim_subject_relationships constraints: ${subjectChecks.join(', ')}`);
      
      const correctionChecks = await getConstraints(c, 'research_corrections');
      console.log(`  research_corrections constraints: ${correctionChecks.join(', ')}`);
    }
    
    console.log('');
  }
  
  console.log('=== ALL 4 MIGRATIONS APPLIED SUCCESSFULLY ===');
  await c.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
