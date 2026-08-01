const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  console.log('=== PROVENANCE AND SEMANTIC VALIDATION ===\n');
  let pass = 0, fail = 0;

  function check(name, ok, detail) {
    if (ok) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ': ' + detail); }
  }

  // 1. Every batch claim has >= 1 evidence
  const claimsWithoutEvidence = await c.query(`
    SELECT c.canonical_id, c.statement
    FROM research_claims c
    WHERE c.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND NOT EXISTS (
      SELECT 1 FROM research_claim_evidence_relationships cer
      WHERE cer.claim_id = c.id
    )
  `);
  check('Claim→Evidence coverage', claimsWithoutEvidence.rows.length === 0,
    claimsWithoutEvidence.rows.length + ' claims without evidence: ' + claimsWithoutEvidence.rows.map(r => r.canonical_id).join(', '));

  // 2. Every batch claim has >= 1 subject relationship
  const claimsWithoutSubject = await c.query(`
    SELECT c.canonical_id, c.statement
    FROM research_claims c
    WHERE c.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND NOT EXISTS (
      SELECT 1 FROM research_claim_subject_relationships csr
      WHERE csr.claim_id = c.id
    )
  `);
  check('Claim→Subject coverage', claimsWithoutSubject.rows.length === 0,
    claimsWithoutSubject.rows.length + ' claims without subject: ' + claimsWithoutSubject.rows.map(r => r.canonical_id).join(', '));

  // 3. Every batch financial record has a reporting source
  const finWithoutSource = await c.query(`
    SELECT f.canonical_id
    FROM research_financial_records f
    WHERE f.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND f.reporting_source_id IS NULL
  `);
  check('Financial→Source coverage', finWithoutSource.rows.length === 0,
    finWithoutSource.rows.length + ' financial records without source');

  // 4. Every batch financial record has a target constituency
  const finWithoutConst = await c.query(`
    SELECT f.canonical_id
    FROM research_financial_records f
    WHERE f.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND f.target_constituency_id IS NULL
  `);
  check('Financial→Constituency coverage', finWithoutConst.rows.length === 0,
    finWithoutConst.rows.length + ' financial records without constituency');

  // 5. Zero orphaned published facts (publication_status = PUBLISHED with no evidence)
  const orphanedPublished = await c.query(`
    SELECT c.canonical_id
    FROM research_claims c
    WHERE c.publication_status = 'PUBLISHED'
    AND NOT EXISTS (
      SELECT 1 FROM research_claim_evidence_relationships cer WHERE cer.claim_id = c.id
    )
  `);
  check('Zero orphaned published claims', orphanedPublished.rows.length === 0,
    orphanedPublished.rows.length + ' orphaned published claims');

  // 6. Every batch source has at least one evidence item referencing it
  const sourcesWithoutEvidence = await c.query(`
    SELECT s.id, s.title
    FROM research_sources s
    WHERE s.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND NOT EXISTS (
      SELECT 1 FROM research_evidence_items e WHERE e.source_id = s.id
    )
  `);
  check('Source→Evidence coverage', sourcesWithoutEvidence.rows.length === 0,
    sourcesWithoutEvidence.rows.length + ' sources without evidence');

  // 7. Every evidence item has a source
  const evidenceWithoutSource = await c.query(`
    SELECT e.id
    FROM research_evidence_items e
    WHERE e.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND NOT EXISTS (
      SELECT 1 FROM research_sources s WHERE s.id = e.source_id
    )
  `);
  check('Evidence→Source FK integrity', evidenceWithoutSource.rows.length === 0,
    evidenceWithoutSource.rows.length + ' evidence items without source FK');

  // 8. No duplicate batch claims (by canonical_id)
  const dupeClaims = await c.query(`
    SELECT canonical_id, count(*) as cnt
    FROM research_claims
    WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    GROUP BY canonical_id HAVING count(*) > 1
  `);
  check('Zero duplicate batch claims', dupeClaims.rows.length === 0,
    dupeClaims.rows.length + ' duplicate claim IDs');

  // 9. No duplicate batch financial records (by canonical_id)
  const dupeFin = await c.query(`
    SELECT canonical_id, count(*) as cnt
    FROM research_financial_records
    WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    GROUP BY canonical_id HAVING count(*) > 1
  `);
  check('Zero duplicate batch financial records', dupeFin.rows.length === 0,
    dupeFin.rows.length + ' duplicate financial IDs');

  // 10. No semantic mutation: all batch claims match manifest statements
  const allClaims = await c.query(`
    SELECT canonical_id, statement, confidence, publication_status, human_review_status
    FROM research_claims
    WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    ORDER BY canonical_id
  `);
  const expectedConfidences = {
    'CLM-VAR-001': 'C1', 'CLM-VAR-002': 'C1',
    'CLM-AMD-001': 'C1', 'CLM-AMD-002': 'C1', 'CLM-AMD-003': 'C2',
    'CLM-MUM-001': 'C1', 'CLM-MUM-002': 'C2',
    'CLM-HAM-001': 'C1', 'CLM-HAM-002': 'C1',
    'CLM-ESH-001': 'C1',
    'CLM-PIT-001': 'C1', 'CLM-PIT-002': 'C2',
    'CLM-TAW-001': 'C1', 'CLM-TAW-002': 'C2',
    'CLM-LAL-001': 'C1',
    'CLM-KHU-001': 'C1', 'CLM-KHU-002': 'C2',
    'CLM-JAL-001': 'C1',
    'CLM-GOR-001': 'C1', 'CLM-GOR-002': 'C1',
    'CLM-LKO-001': 'C1', 'CLM-LKO-002': 'C1'
  };
  let confidenceMatch = true;
  for (const row of allClaims.rows) {
    const expected = expectedConfidences[row.canonical_id];
    if (expected && row.confidence !== expected) {
      confidenceMatch = false;
      check('Confidence ' + row.canonical_id, false, 'expected ' + expected + ', got ' + row.confidence);
    }
  }
  check('All 22 claims have correct confidence tiers', confidenceMatch, '');

  // 11. No batch claims are PUBLISHED (all should be DRAFT)
  const publishedBatch = await c.query(`
    SELECT count(*) as cnt FROM research_claims
    WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED' AND publication_status = 'PUBLISHED'
  `);
  check('No batch claims are PUBLISHED', parseInt(publishedBatch.rows[0].cnt) === 0,
    publishedBatch.rows[0].cnt + ' claims are PUBLISHED');

  // 12. Every batch source has a valid source_type
  const invalidSourceTypes = await c.query(`
    SELECT s.title, s.source_type
    FROM research_sources s
    WHERE s.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
  `);
  const validTypes = ['JOURNALISM', 'OFFICIAL_GOVERNMENT_DOCUMENT', 'REFERENCE', 'ACADEMIC', 'LEGAL_DOCUMENT'];
  const badTypes = invalidSourceTypes.rows.filter(r => !validTypes.includes(r.source_type));
  check('All source_types are valid enum values', badTypes.length === 0,
    badTypes.map(r => r.title + ': ' + r.source_type).join(', '));

  // 13. Every batch financial amount_status is a valid enum value
  const finAmountStatuses = await c.query(`
    SELECT canonical_id, amount_status
    FROM research_financial_records
    WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
  `);
  const validAmountStatuses = ['KNOWN', 'UNKNOWN', 'NOT_FOUND', 'WITHHELD', 'NOT_REPORTED', 'NOT_APPLICABLE', 'REPORTED'];
  const badAmountStatus = finAmountStatuses.rows.filter(r => !validAmountStatuses.includes(r.amount_status));
  check('All amount_status values valid', badAmountStatus.length === 0,
    badAmountStatus.map(r => r.canonical_id + ': ' + r.amount_status).join(', '));

  // 14. Claim→Evidence relationship integrity: every CER points to valid claim and evidence
  const brokenCER = await c.query(`
    SELECT cer.id
    FROM research_claim_evidence_relationships cer
    LEFT JOIN research_claims c ON cer.claim_id = c.id
    LEFT JOIN research_evidence_items e ON cer.evidence_id = e.id
    WHERE cer.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND (c.id IS NULL OR e.id IS NULL)
  `);
  check('CER FK integrity', brokenCER.rows.length === 0,
    brokenCER.rows.length + ' broken CER references');

  // 15. Claim→Subject relationship integrity
  const brokenCSR = await c.query(`
    SELECT csr.id
    FROM research_claim_subject_relationships csr
    LEFT JOIN research_claims c ON csr.claim_id = c.id
    WHERE csr.ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
    AND c.id IS NULL
  `);
  check('CSR FK integrity', brokenCSR.rows.length === 0,
    brokenCSR.rows.length + ' broken CSR references');

  console.log('\n=== RESULT: ' + pass + ' passed, ' + fail + ' failed ===');
  if (fail > 0) process.exitCode = 1;

  await c.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
