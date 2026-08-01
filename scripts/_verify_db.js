const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // 1. Database identity
  const id = await c.query('SELECT current_database(), current_user, version()');
  console.log('DATABASE:', id.rows[0].current_database);
  console.log('USER:', id.rows[0].current_user);
  console.log('PG VERSION:', id.rows[0].version.split(',')[0]);

  // 2. Schema existence checks
  const tables = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'research_%' ORDER BY table_name");
  console.log('\nRESEARCH TABLES (' + tables.rows.length + '):', tables.rows.map(r => r.table_name).join(', '));

  // 3. Check for M008 evidence (relaxed CHECK on canonical_id)
  const checks = await c.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conname LIKE '%canonical%' OR conname LIKE '%constituenc%'");
  console.log('\nCONSTRAINTS:');
  for (const r of checks.rows) {
    console.log('  ' + r.conname + ': ' + r.def);
  }

  // 4. Check for M007 evidence (NOT NULL on financial canonical_id)
  const finCols = await c.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='research_financial_records' AND column_name='canonical_id'");
  console.log('\nFINANCIAL canonical_id NULLABLE:', finCols.rows[0] ? finCols.rows[0].is_nullable : 'column not found');

  // 5. Check for M004 evidence (REPORTED in amount_status enum)
  const reportedEnum = await c.query("SELECT e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'amount_status_type' AND e.enumlabel = 'REPORTED'");
  console.log('REPORTED in amount_status_type enum:', reportedEnum.rows.length > 0 ? 'YES (M004 present)' : 'NO (M004 missing)');

  // 6. RLS on claim_subject and claim_evidence
  const rls = await c.query("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('research_claim_subject_relationships','research_claim_evidence_relationships','research_corrections')");
  console.log('\nRLS STATUS:');
  for (const r of rls.rows) {
    console.log('  ' + r.tablename + ': rowsecurity=' + r.rowsecurity);
  }

  // 7. Batch data status (the critical check)
  const tables2 = ['research_constituencies','research_sources','research_evidence_items','research_claims','research_financial_records','research_claim_evidence_relationships','research_claim_subject_relationships','research_corrections'];
  console.log('\nBATCH DATA STATUS:');
  for (const t of tables2) {
    const total = await c.query('SELECT count(*) as cnt FROM ' + t);
    let testCount, nonTestCount;
    try {
      testCount = await c.query("SELECT count(*) as cnt FROM " + t + " WHERE ingestion_method = 'TEST'");
    } catch (e) {
      testCount = { rows: [{ cnt: 0 }] };
    }
    try {
      nonTestCount = await c.query("SELECT count(*) as cnt FROM " + t + " WHERE ingestion_method IS NULL OR ingestion_method NOT IN ('TEST')");
    } catch (e) {
      nonTestCount = { rows: [{ cnt: 0 }] };
    }
    console.log('  ' + t + ': ' + total.rows[0].cnt + ' total, ' + testCount.rows[0].cnt + ' test, ' + nonTestCount.rows[0].cnt + ' non-test');
  }

  // 8. Specific constituency check
  const consts = await c.query("SELECT canonical_id, name FROM research_constituencies ORDER BY canonical_id");
  console.log('\nCONSTITUENCIES (' + consts.rows.length + '):');
  for (const r of consts.rows) {
    console.log('  ' + r.canonical_id + ' - ' + r.name);
  }

  await c.end();
  console.log('\n=== DB VERIFICATION COMPLETE ===');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
