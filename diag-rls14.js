const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  async function testInsert(label, columns, values) {
    try {
      await pg.query('BEGIN');
      await pg.query("SET LOCAL role = 'authenticated'");
      await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
      await pg.query(`INSERT INTO research_claims (${columns}) VALUES (${values})`);
      console.log(`  ${label}: SUCCEEDED`);
    } catch (e) {
      console.log(`  ${label}: FAILED (${e.code})`);
    }
    await pg.query('ROLLBACK');
  }

  console.log('=== KEY HYPOTHESIS: explicit publication_status vs default ===\n');

  // A: Minimal columns (publication_status defaults to DRAFT)
  await testInsert(
    'A: minimal columns (pub_status DEFAULT)',
    'canonical_id, confidence, statement, ingestion_method',
    "'HYP-A', 'C1', 'minimal', 'TEST'"
  );

  // B: Same but with publication_status = 'DRAFT' explicit
  await testInsert(
    'B: + explicit publication_status=DRAFT',
    'canonical_id, confidence, statement, publication_status, ingestion_method',
    "'HYP-B', 'C1', 'with pub', 'DRAFT', 'TEST'"
  );

  // C: Same but with publication_status = 'READY_FOR_PUBLICATION'
  await testInsert(
    'C: + explicit publication_status=READY_FOR_PUBLICATION',
    'canonical_id, confidence, statement, publication_status, ingestion_method',
    "'HYP-C', 'C1', 'with ready', 'READY_FOR_PUBLICATION', 'TEST'"
  );

  // D: publication_status = 'PUBLISHED' (control)
  await testInsert(
    'D: explicit publication_status=PUBLISHED',
    'canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method',
    "'HYP-D', 'C1', 'with pub', 'PUBLISHED', 'APPROVED', NOW(), 'TEST'"
  );

  // E: PUBLISHED with human_review_status = 'UNREVIEWED' (should fail CHECK)
  await testInsert(
    'E: PUBLISHED + UNREVIEWED (CHECK should fail)',
    'canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method',
    "'HYP-E', 'C1', 'pub unreviewed', 'PUBLISHED', 'UNREVIEWED', NOW(), 'TEST'"
  );

  // F: Explicit human_review_status only (no publication_status)
  await testInsert(
    'F: explicit human_review_status only',
    'canonical_id, confidence, statement, human_review_status, ingestion_method',
    "'HYP-F', 'C1', 'rev only', 'UNREVIEWED', 'TEST'"
  );

  // G: Explicit human_review_status = 'APPROVED' (no publication_status)
  await testInsert(
    'G: explicit human_review_status=APPROVED',
    'canonical_id, confidence, statement, human_review_status, ingestion_method',
    "'HYP-G', 'C1', 'rev approved', 'APPROVED', 'TEST'"
  );

  // H: Minimal columns with a DIFFERENT canonical_id
  await testInsert(
    'H: minimal columns (different id)',
    'canonical_id, confidence, statement, ingestion_method',
    "'HYP-H', 'C1', 'minimal 2', 'TEST'"
  );

  // I: Explicit all defaults (publication_status=DRAFT, human_review_status=UNREVIEWED)
  await testInsert(
    'I: both defaults explicit',
    'canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method',
    "'HYP-I', 'C1', 'both defaults', 'DRAFT', 'UNREVIEWED', 'TEST'"
  );

  // J: Just publication_status without human_review_status
  await testInsert(
    'J: publication_status only (no human_review_status)',
    'canonical_id, confidence, statement, publication_status, ingestion_method',
    "'HYP-J', 'C1', 'pub only', 'DRAFT', 'TEST'"
  );

  // K: Just human_review_status without publication_status  
  await testInsert(
    'K: human_review_status only (default pub)',
    'canonical_id, confidence, statement, human_review_status, ingestion_method',
    "'HYP-K', 'C1', 'rev only', 'UNREVIEWED', 'TEST'"
  );

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
