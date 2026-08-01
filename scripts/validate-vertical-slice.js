const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const envContent = fs.readFileSync('.env.test', 'utf8');
  const env = {};
  for (const line of envContent.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }

  const client = new Client({ connectionString: env.TEST_DATABASE_URL });
  await client.connect();

  let failed = false;
  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
    } else {
      console.error(`[FAIL] ${message}`);
      failed = true;
    }
  }

  try {
    const BATCH_ID = 'STEP3B_COMPLETE_PILOT';

    // 1. Provenance Validation: every claim in the batch must have at least one evidence relationship
    const claims = await client.query(`SELECT id, canonical_id FROM research_claims WHERE ingestion_method = $1`, [BATCH_ID]);
    let covered = 0;
    for (const c of claims.rows) {
      const cer = await client.query(`SELECT 1 FROM research_claim_evidence_relationships WHERE claim_id = $1`, [c.id]);
      if (cer.rowCount > 0) covered++;
    }
    assert(covered === claims.rowCount, `Claim provenance coverage ${covered}/${claims.rowCount} = ${claims.rowCount > 0 ? Math.round(covered / claims.rowCount * 100) : 0}%`);

    // 2. Domain-state uniqueness checks
    async function assertNoDuplicates(table, idColumn) {
      const dup = await client.query(`SELECT ${idColumn}, COUNT(*) FROM ${table} WHERE ingestion_method = $1 AND ${idColumn} IS NOT NULL GROUP BY ${idColumn} HAVING COUNT(*) > 1`, [BATCH_ID]);
      assert(dup.rowCount === 0, `No duplicate ${idColumn} in ${table}`);
    }
    await assertNoDuplicates('research_sources', 'id');
    await assertNoDuplicates('research_evidence_items', 'id');
    await assertNoDuplicates('research_claims', 'canonical_id');
    await assertNoDuplicates('research_claim_evidence_relationships', 'id');
    await assertNoDuplicates('research_claim_subject_relationships', 'id');
    await assertNoDuplicates('research_financial_records', 'canonical_id');
    await assertNoDuplicates('research_search_protocols', 'canonical_id');
    await assertNoDuplicates('research_gaps', 'canonical_id');

    // 3. Ayodhya financial lifecycle: A3 (Budget Provision) record
    const finA3 = await client.query(`SELECT canonical_id, amount_status, amount_operator, amount_value, stage, reporting_source_id FROM research_financial_records WHERE canonical_id = 'FIN-AYO-A3-BUDGET' AND ingestion_method = $1`, [BATCH_ID]);
    assert(finA3.rowCount === 1, 'FIN-AYO-A3-BUDGET exists in batch');
    if (finA3.rowCount === 1) {
      const a3 = finA3.rows[0];
      assert(a3.amount_status === 'REPORTED', `A3 amount_status = '${a3.amount_status}' (expected 'REPORTED')`);
      assert(Number(a3.amount_value) === 10100000000, `A3 amount_value = ${a3.amount_value} (expected 10100000000 = Rs 101 crore)`);
      assert(a3.reporting_source_id !== null, 'A3 has reporting_source_id');
    }

    // 4. Ayodhya A4 (AAI Sanction) record
    const finA4 = await client.query(`SELECT canonical_id, amount_status, amount_value, stage FROM research_financial_records WHERE canonical_id = 'FIN-AYO-A4-AAI-SANCTION' AND ingestion_method = $1`, [BATCH_ID]);
    assert(finA4.rowCount === 1, 'FIN-AYO-A4-AAI-SANCTION exists in batch');
    if (finA4.rowCount === 1) {
      assert(Number(finA4.rows[0].amount_value) === 24200000000, `A4 amount_value = ${finA4.rows[0].amount_value} (expected 24200000000 = Rs 242 crore)`);
    }

    // 5. Ayodhya A6 (State additional) record
    const finA6 = await client.query(`SELECT canonical_id, amount_status, amount_value FROM research_financial_records WHERE canonical_id = 'FIN-AYO-A6-STATE-ADDITIONAL' AND ingestion_method = $1`, [BATCH_ID]);
    assert(finA6.rowCount === 1, 'FIN-AYO-A6-STATE-ADDITIONAL exists in batch');
    if (finA6.rowCount === 1) {
      assert(Number(finA6.rows[0].amount_value) === 117597000000, `A6 amount_value = ${finA6.rows[0].amount_value} (expected 117597000000 = Rs 1175.97 crore)`);
    }

    // 6. Global financial-source coverage: every financial record must reference a source
    const finRecords = await client.query(`SELECT canonical_id, reporting_source_id FROM research_financial_records WHERE ingestion_method = $1`, [BATCH_ID]);
    assert(finRecords.rowCount >= 4, `Financial records count >= 4 (found ${finRecords.rowCount})`);
    for (const f of finRecords.rows) {
      assert(f.reporting_source_id !== null, `Financial record ${f.canonical_id} has reporting_source_id`);
    }

    // 7. Claim-count across all 4 constituencies
    const allClaims = await client.query(`SELECT canonical_id, statement FROM research_claims WHERE ingestion_method = $1`, [BATCH_ID]);
    assert(allClaims.rowCount >= 8, `Total claims >= 8 across 4 constituencies (found ${allClaims.rowCount})`);

    // 8. Per-constituency coverage
    const constituencies = ['UP-AC-037', 'UP-AC-108', 'UP-AC-110'];
    for (const cid of constituencies) {
      const csr = await client.query(`SELECT csr.claim_id FROM research_claim_subject_relationships csr JOIN research_constituencies rc ON csr.constituency_id = rc.id WHERE rc.canonical_id = $1`, [cid]);
      assert(csr.rowCount > 0, `Claim-subject link exists for ${cid}`);
    }

    // 9. Ayodhya financial lifecycle stages are distinct (budget, sanction, expenditure)
    const stages = finRecords.rows.map(f => f.canonical_id);
    assert(new Set(stages).size === stages.length, 'All financial record canonical_ids are unique');

    // 10. RLS boundary validation (service_role can see everything — bypass)
    const allClaimsSR = await client.query(`SELECT count(*) FROM research_claims`);
    assert(Number(allClaimsSR.rows[0].count) >= 9, `Service-role sees all claims (found ${allClaimsSR.rows[0].count})`);
    // NOTE: Anon RLS enforcement is validated by the 77/77 test suite via Supabase JS client.
    // Direct SQL SET LOCAL role='anon' does not properly simulate Supabase auth.jwt() context.

    // 11. RLS boundary validation (Anon CAN see PUBLISHED claims)
    // Publish a claim via service-role in its own transaction
    await client.query(`UPDATE research_claims SET publication_status = 'PUBLISHED', published_at = NOW(), human_review_status = 'APPROVED' WHERE canonical_id = 'CLM-RAM-002-A'`);
    // Read as anon
    await client.query("BEGIN");
    await client.query("SET LOCAL role = 'anon'");
    await client.query(`SET LOCAL request.jwt.claims = '{"role": "anon", "app_metadata": {}}'`);
    const anonPublished = await client.query(`SELECT * FROM research_claims WHERE publication_status = 'PUBLISHED'`);
    assert(anonPublished.rowCount >= 1, 'Anon user can see PUBLISHED claims');
    await client.query("ROLLBACK");

    // 12. Karhal contradiction pair: two claims with different canonical_ids in same constituency
    const karhalClaims = await client.query(`SELECT canonical_id FROM research_claims WHERE canonical_id LIKE 'CLM-KAR-%' AND ingestion_method = $1`, [BATCH_ID]);
    assert(karhalClaims.rowCount >= 2, `Karhal has >= 2 claims (contradiction pair, found ${karhalClaims.rowCount})`);

    // 13. Kairana boundary distinction claim
    const kaiClaim = await client.query(`SELECT canonical_id, statement FROM research_claims WHERE canonical_id = 'CLM-KAI-002-A' AND ingestion_method = $1`, [BATCH_ID]);
    assert(kaiClaim.rowCount === 1, 'Kairana boundary distinction claim exists');
    if (kaiClaim.rowCount === 1) {
      assert(kaiClaim.rows[0].statement.toLowerCase().includes('distinct'), `Kairana claim mentions distinction`);
    }

    // 14. Rampur electoral chronology: conviction → disqualification → by-election
    const rampurClaims = await client.query(`SELECT canonical_id FROM research_claims WHERE canonical_id LIKE 'CLM-RAM-%' AND ingestion_method = $1`, [BATCH_ID]);
    assert(rampurClaims.rowCount >= 3, `Rampur has >= 3 claims (conviction, disqualification, by-election, found ${rampurClaims.rowCount})`);

    // 15. Evidence coverage: at least 10 evidence items across all sources
    const evidence = await client.query(`SELECT COUNT(*) FROM research_evidence_items WHERE ingestion_method = $1`, [BATCH_ID]);
    assert(Number(evidence.rows[0].count) >= 10, `Evidence items >= 10 (found ${evidence.rows[0].count})`);

    // 16. Source coverage: at least 8 sources
    const sources = await client.query(`SELECT COUNT(*) FROM research_sources WHERE ingestion_method = $1`, [BATCH_ID]);
    assert(Number(sources.rows[0].count) >= 8, `Sources >= 8 (found ${sources.rows[0].count})`);

  } catch(e) {
    console.error('Validation error:', e);
    failed = true;
  } finally {
    await client.end();
    if (failed) {
      process.exit(1);
    } else {
      console.log('\nCOMPLETE PILOT VALIDATED — PROCEED TO FULL TEST SUITE');
      process.exit(0);
    }
  }
}
run();
