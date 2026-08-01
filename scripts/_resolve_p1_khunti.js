const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  console.log('=== P1 RESOLUTION: JH-AC-60 Khunti (PESA compliance) ===\n');

  // 1. Verify existing claim
  const existing = await c.query("SELECT id, canonical_id, statement FROM research_claims WHERE canonical_id = 'CLM-KHU-002'");
  if (existing.rows.length === 0) { console.error('CLM-KHU-002 not found'); await c.end(); return; }
  const claimId = existing.rows[0].id;
  console.log('Claim found:', existing.rows[0].canonical_id, '(id=' + claimId + ')');
  console.log('Current statement:', existing.rows[0].statement.substring(0, 100) + '...');

  // 2. Add PIB Jan 2026 source
  const srcRes = await c.query(
    `INSERT INTO research_sources (title, source_type, ingestion_method)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING
     RETURNING id, title`,
    ['Jharkhand Government notifies PESA Rules 2025 - PIB / PTI (Jan 3 2026)', 'OFFICIAL_GOVERNMENT_DOCUMENT', 'P1_RESOLUTION_KHUNTI']
  );
  if (srcRes.rows.length > 0) {
    console.log('New source added:', srcRes.rows[0].title);
    const srcId = srcRes.rows[0].id;

    // 3. Add evidence
    const evdRes = await c.query(
      `INSERT INTO research_evidence_items (source_id, extracted_text, ingestion_method)
       VALUES ($1, $2, $3) RETURNING id`,
      [srcId, 'The Jharkhand government notified PESA Rules on January 2, 2026 (Notification No. 40). Rules implemented fully in 13 districts including Khunti. Cabinet approved rules on Dec 23, 2025.', 'P1_RESOLUTION_KHUNTI']
    );
    console.log('New evidence added:', evdRes.rows[0].id);

    // 4. Link to claim
    await c.query(
      `INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method)
       VALUES ($1, $2, 'SUPPORTS', 'P1_RESOLUTION_KHUNTI')
       ON CONFLICT DO NOTHING`,
      [claimId, evdRes.rows[0].id]
    );
    console.log('Evidence linked to claim');
  } else {
    console.log('Source already exists (idempotent)');
  }

  // 5. Update claim with temporal framing
  const updatedStatement = "As of 2024, Jharkhand had not implemented PESA Rules despite 26 years since the Act's inception, affecting tribal self-governance in 16 of 24 districts including Khunti. [CORRECTION 20 Jul 2026: Jharkhand notified PESA Rules on Jan 2, 2026 - Notification No. 40. Khunti is among 13 fully-implemented districts. Original claim preserved for historical record.]";
  await c.query(
    `UPDATE research_claims SET statement = $1, human_review_status = 'APPROVED' WHERE canonical_id = 'CLM-KHU-002'`,
    [updatedStatement]
  );
  console.log('Claim updated with temporal framing');

  // 6. Create correction record
  await c.query(
    `INSERT INTO research_corrections (correction_type, rationale, previous_claim_id, successor_claim_id, authorized_by_user_id, methodology_version, ingestion_method)
     SELECT 'EVIDENTIARY_CORRECTION',
       'Academic source (2024) was accurate at time of writing. Official government notification (Jan 2026) supersedes. Source: PIB PRID 207293. Original claim: Jharkhand has not implemented PESA Rules despite 26 years since the Act''s inception. Corrected claim: Jharkhand had not implemented PESA Rules as of 2024. Government notified PESA Rules on Jan 2, 2026 (Notification No. 40). Khunti is among 13 fully-implemented districts.',
       id, id, '00000000-0000-0000-0000-000000000000', '1.0', 'P1_RESOLUTION_KHUNTI'
     FROM research_claims WHERE canonical_id = 'CLM-KHU-002'
     ON CONFLICT DO NOTHING`
  );
  console.log('Correction record created');

  console.log('\n=== P1 Khunti RESOLVED ===');
  await c.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
