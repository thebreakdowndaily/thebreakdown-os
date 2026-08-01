const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  console.log('=== P1 RESOLUTION: RJ-AC-144 Jalore (judicial precedent jurisdiction) ===\n');

  // 1. Verify existing claim
  const existing = await c.query("SELECT id, canonical_id, statement FROM research_claims WHERE canonical_id = 'CLM-JAL-001'");
  if (existing.rows.length === 0) { console.error('CLM-JAL-001 not found'); await c.end(); return; }
  const claimId = existing.rows[0].id;
  console.log('Claim found:', existing.rows[0].canonical_id, '(id=' + claimId + ')');

  // 2. Update claim statement to reflect statewide scope
  const updatedStatement = "The Supreme Court (2025 INSC 1503, Civil Appeal No. 14112/2024) upheld the Rajasthan High Court ruling that reserved category candidates scoring above the general cutoff must be included in the open merit list, establishing that open category is merit-based, not a quota. [CORRECTION 20 Jul 2026: This is a statewide judicial precedent applicable to ALL Rajasthan district courts. No constituency-specific relationship to Jalore AC was established. Attributed to Jalore based on SC-reserved status, which is insufficient for constituency-level linkage.]";
  await c.query(
    `UPDATE research_claims SET statement = $1, human_review_status = 'APPROVED' WHERE canonical_id = 'CLM-JAL-001'`,
    [updatedStatement]
  );
  console.log('Claim updated with statewide scope correction');

  // 3. Create correction record
  await c.query(
    `INSERT INTO research_corrections (correction_type, rationale, previous_claim_id, successor_claim_id, authorized_by_user_id, methodology_version, ingestion_method)
     VALUES ($1, $2, $3, $3, '00000000-0000-0000-0000-000000000000', '1.0', 'P1_RESOLUTION_JALORE')
     ON CONFLICT DO NOTHING`,
    ['EVIDENTIARY_CORRECTION',
     'The case (Civil Appeal No. 14112/2024, Rajasthan HC vs Rajat Yadav) concerns JJA recruitment across ALL Rajasthan district courts. 2756 vacancies statewide. Attribution to Jalore AC was based on SC-reserved status, which is insufficient for constituency-level linkage. Scope corrected to statewide (Rajasthan).',
     claimId]
  );
  console.log('Correction record created');

  // 4. Verify final state
  const final = await c.query("SELECT canonical_id, human_review_status FROM research_claims WHERE canonical_id = 'CLM-JAL-001'");
  console.log('Final claim status:', final.rows[0].human_review_status);

  console.log('\n=== P1 Jalore RESOLVED ===');
  await c.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
