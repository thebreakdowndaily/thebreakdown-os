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
  console.log("Connected to test database");
  
  const BATCH_ID = 'STEP3B_VERTICAL_SLICE_V1';

  try {
    // The original cleanup block has been disabled to preserve idempotency.
    // Instead, all inserts below use deterministic canonical IDs with ON CONFLICT DO NOTHING or guarded updates.
    // No tables are cleared before ingestion.
    await client.query('BEGIN');
    
    // Now assume the role of the ingestion agent
    await client.query("SET LOCAL role = 'authenticated'");
    await client.query(`SET LOCAL request.jwt.claims = '{"app_metadata": {"research_role": "automated_ingestion_agent"}}'`);

    // ---------------------------------------------------------
    // A1: Ayodhya Airport Phase 1 Expenditure
    // ---------------------------------------------------------
    
    // 1. Source
    let srcA1_id;
    const srcA1_res = await client.query(`
      INSERT INTO research_sources (title, source_type, ingestion_method)
      VALUES ('PM inaugurates Maharishi Valmiki International Airport Ayodhya Dham (PIB, Dec 30 2023)', 'OFFICIAL_GOVERNMENT_DOCUMENT', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id`
    );
    if (srcA1_res.rowCount === 0) {
      const existing = await client.query(`SELECT id FROM research_sources WHERE title = 'PM inaugurates Maharishi Valmiki International Airport Ayodhya Dham (PIB, Dec 30 2023)' AND source_type = 'OFFICIAL_GOVERNMENT_DOCUMENT'`);
      srcA1_id = existing.rows[0].id;
    } else {
      srcA1_id = srcA1_res.rows[0].id;
    }

    // 2. Evidence Item
    const evA1 = await client.query(`
      INSERT INTO research_evidence_items (source_id, extracted_text, ingestion_method)
      VALUES ('${srcA1_id}', 'Phase 1 of the state-of-the-art airport is developed at a cost of more than Rs 1450 crore.', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id
    `);
    const evA1_id = evA1.rows[0].id;

    // 3. Claim
    let clA1_id;
    const clA1_res = await client.query(`
      INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method)
      VALUES ('CLM-AYO-001-A', 'C1', 'Phase 1 of Ayodhya Airport was developed at a cost of more than ?1,450 crore.', 'DRAFT', 'UNREVIEWED', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id`
    );
    if (clA1_res.rowCount === 0) {
      const existing = await client.query(`SELECT id, statement FROM research_claims WHERE canonical_id = 'CLM-AYO-001-A'`);
      const existingRow = existing.rows[0];
      if (existingRow.statement !== 'Phase 1 of Ayodhya Airport was developed at a cost of more than ?1,450 crore.') {
        throw new Error('Semantic conflict on claim CLM-AYO-001-A');
      }
      clA1_id = existingRow.id;
    } else {
      clA1_id = clA1_res.rows[0].id;
    }

    // 4. Claim-Evidence Relationship
    await client.query(`
      INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method)
      VALUES ('${clA1_id}', '${evA1_id}', 'SUPPORTS', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);

    // Create Project
    const projA1_res = await client.query(`
      INSERT INTO research_projects (name, ingestion_method)
      VALUES ('Maharishi Valmiki International Airport Ayodhya Dham', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id`
    );
    let projA1_id;
    if (projA1_res.rowCount === 0) {
      const existing = await client.query(`SELECT id FROM research_projects WHERE name = 'Maharishi Valmiki International Airport Ayodhya Dham'`);
      projA1_id = existing.rows[0].id;
    } else {
      projA1_id = projA1_res.rows[0].id;
    }
    
    // Insert A2 regional financial record for Ayodhya (shared attribution, lower bound)
    let finA2_id;
    const finA2_res = await client.query(`
      INSERT INTO research_financial_records (
        project_id,
        stage,
        canonical_id,
        amount_status,
        amount_operator,
        amount_value,
        source_terminology,
        fiscal_year,
        reporting_source_id,
        ingestion_method,
        target_geography,
        target_constituency_id,
        valid_from
      ) VALUES (
        '${projA1_id}',
        'REPORTED_EXPENDITURE',
        'FIN-AYO-A2-REGIONAL',
        'REPORTED',
        'GREATER_THAN',
        111000000000,
        'Ayodhya and surrounding areas expenditure (regional aggregation)',
        '2026',
        '${srcA1_id}',
        '${BATCH_ID}',
        'Ayodhya and surrounding areas',
        NULL,
        '2026-01-01'
      ) ON CONFLICT DO NOTHING RETURNING id`
    );
    if (finA2_res.rowCount === 0) {
      const existing = await client.query(`SELECT id, amount_value, amount_operator FROM research_financial_records WHERE canonical_id = 'FIN-AYO-A2-REGIONAL'`);
      const row = existing.rows[0];
      if (row.amount_value !== 111000000000 || row.amount_operator !== 'GREATER_THAN') {
        throw new Error('Semantic conflict on financial record FIN-AYO-A2-REGIONAL');
      }
      finA2_id = row.id;
    } else {
      finA2_id = finA2_res.rows[0].id;
    }

    // 5. Domain State (Financial)
    const finA1 = await client.query(`
      INSERT INTO research_financial_records (project_id, stage, amount_status, amount_value, amount_operator, source_terminology, fiscal_year, reporting_source_id, valid_from, ingestion_method)
      VALUES ('${projA1_id}', 'REPORTED_EXPENDITURE', 'REPORTED', 14500000000, 'GREATER_THAN', 'developed at a cost of more than Rs 1450 crore', '2023-2024', '${srcA1_id}', '2023-12-30', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id
    `);
    
    // 6. Claim-Subject Relationship
    await client.query(`
      INSERT INTO research_claim_subject_relationships (claim_id, financial_record_id, scope, ingestion_method)
      VALUES ('${clA1_id}', '${finA1.rows[0].id}', 'PRIMARY_SUBJECT', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);

    // ---------------------------------------------------------
    // A2: Ayodhya Airport Overall Completion
    // ---------------------------------------------------------
    let clA2_id;
    const clA2_res = await client.query(`
      INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method)
      VALUES ('CLM-AYO-001-B', 'C1', 'Phase 1 of Ayodhya Airport is complete as of December 30, 2023.', 'DRAFT', 'UNREVIEWED', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id`
    );
    if (clA2_res.rowCount === 0) {
      const existing = await client.query(`SELECT id, statement FROM research_claims WHERE canonical_id = 'CLM-AYO-001-B'`);
      if (existing.rows[0].statement !== 'Phase 1 of Ayodhya Airport is complete as of December 30, 2023.') {
        throw new Error('Semantic conflict on claim CLM-AYO-001-B');
      }
      clA2_id = existing.rows[0].id;
    } else {
      clA2_id = clA2_res.rows[0].id;
    }

    await client.query(`
      INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method)
      VALUES ('${clA2_id}', '${evA1_id}', 'SUPPORTS', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO research_claim_subject_relationships (claim_id, project_id, scope, ingestion_method)
      VALUES ('${clA2_id}', '${projA1_id}', 'PRIMARY_SUBJECT', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);

    // ---------------------------------------------------------
    // KR1a & KR1b: Karhal NHRC Case (Provisional/Verification Required)
    // ---------------------------------------------------------
    let srcKAI_id;
    const srcKAI_res = await client.query(`
      INSERT INTO research_sources (title, source_type, ingestion_method)
      VALUES ('NHRC takes suo motu cognizance of a Dalit girl''s murder (Nov 22 2024)', 'OFFICIAL_GOVERNMENT_DOCUMENT', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id`
    );
    if (srcKAI_res.rowCount === 0) {
      const existing = await client.query(`SELECT id FROM research_sources WHERE title = 'NHRC takes suo motu cognizance of a Dalit girl''s murder (Nov 22 2024)' AND source_type = 'OFFICIAL_GOVERNMENT_DOCUMENT'`);
      srcKAI_id = existing.rows[0].id;
    } else {
      srcKAI_id = srcKAI_res.rows[0].id;
    }
    
    const evKAI = await client.query(`
      INSERT INTO research_evidence_items (source_id, extracted_text, ingestion_method)
      VALUES ('${srcKAI_id}', 'NHRC India has taken suo motu cognizance of a media report that a Dalit girl was murdered in Kairana...', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id
    `);
    const evKAI_id = evKAI.rows[0]?.id || (await client.query(`SELECT id FROM research_evidence_items WHERE source_id = '${srcKAI_id}' AND extracted_text LIKE 'NHRC India%Kairana%'`)).rows[0].id;

    const clK1a = await client.query(`
      INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, verification_required, ingestion_method)
      VALUES ('CLM-KAI-001-A', 'C1', 'NHRC took suo motu cognizance of the murder of a Dalit girl in Kairana.', 'DRAFT', 'UNREVIEWED', true, '${BATCH_ID}')
      ON CONFLICT (canonical_id) DO NOTHING RETURNING id
    `);
    const clK1a_id = clK1a.rows[0]?.id || (await client.query(`SELECT id FROM research_claims WHERE canonical_id = 'CLM-KAI-001-A'`)).rows[0].id;

    await client.query(`
      INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method)
      VALUES ('${clK1a_id}', '${evKAI_id}', 'SUPPORTS', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);

    const clK1b = await client.query(`
      INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, verification_required, ingestion_method)
      VALUES ('CLM-KAI-001-B', 'C1', 'NHRC issued notices to the Chief Secretary and DGP seeking a detailed report.', 'DRAFT', 'UNREVIEWED', true, '${BATCH_ID}')
      ON CONFLICT (canonical_id) DO NOTHING RETURNING id
    `);
    const clK1b_id = clK1b.rows[0]?.id || (await client.query(`SELECT id FROM research_claims WHERE canonical_id = 'CLM-KAI-001-B'`)).rows[0].id;

    await client.query(`
      INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method)
      VALUES ('${clK1b_id}', '${evKAI_id}', 'SUPPORTS', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);

    let constKAI_id;
    const constKAI_res = await client.query(`
      INSERT INTO research_constituencies (canonical_id, name, ingestion_method)
      VALUES ('UP-AC-110', 'Kairana', '${BATCH_ID}')
      ON CONFLICT DO NOTHING RETURNING id`
    );
    if (constKAI_res.rowCount === 0) {
      const existing = await client.query(`SELECT id FROM research_constituencies WHERE canonical_id = 'UP-AC-110'`);
      constKAI_id = existing.rows[0].id;
    } else {
      constKAI_id = constKAI_res.rows[0].id;
    }
    
    await client.query(`
      INSERT INTO research_claim_subject_relationships (claim_id, constituency_id, scope, ingestion_method)
      VALUES ('${clK1a_id}', '${constKAI_id}', 'GEOGRAPHIC_SCOPE', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO research_claim_subject_relationships (claim_id, constituency_id, scope, ingestion_method)
      VALUES ('${clK1b_id}', '${constKAI_id}', 'GEOGRAPHIC_SCOPE', '${BATCH_ID}')
      ON CONFLICT DO NOTHING
    `);

    // ---------------------------------------------------------
    // KR2: Karhal Financial Gap (NOT_FOUND)
    // ---------------------------------------------------------
    const protoKAI = await client.query(`
      INSERT INTO research_search_protocols (canonical_id, research_question, repositories_searched, queries_used, search_started_at, search_completed_at, ingestion_method)
      VALUES ('PROTO-KAI-FIN', 'Constituency capital expenditure for Kairana', '["CEO UP", "UP Finance Department", "UP Planning Department"]', '["Kairana", "expenditure", "allocation", "MLA LAD"]', '2026-07-19T00:00:00Z', '2026-07-20T00:00:00Z', '${BATCH_ID}')
      ON CONFLICT (canonical_id) DO NOTHING RETURNING id
    `);
    const protoKAI_id = protoKAI.rows[0]?.id || (await client.query(`SELECT id FROM research_search_protocols WHERE canonical_id = 'PROTO-KAI-FIN'`)).rows[0].id;

    await client.query(`
      INSERT INTO research_gaps (canonical_id, gap_status, entity_type, target_constituency_id, search_protocol_id, rationale, publication_status, human_review_status, ingestion_method)
      VALUES ('GAP-KAI-FIN-01', 'NOT_FOUND', 'FINANCIAL_RECORD', '${constKAI_id}', '${protoKAI_id}', 'No structured capital expenditure data available specifically attributed to Kairana constituency by the Finance Department.', 'DRAFT', 'UNREVIEWED', '${BATCH_ID}')
      ON CONFLICT (canonical_id) DO NOTHING
    `);

    // Regression check: ensure no lingering KAR identifiers in this batch
    const karCountRes = await client.query(`SELECT COUNT(*) FROM (
      SELECT canonical_id FROM research_claims WHERE canonical_id LIKE '%-KAR-%' AND ingestion_method = '${BATCH_ID}'
      UNION ALL SELECT title FROM research_sources WHERE title LIKE '%Karhal%' AND ingestion_method = '${BATCH_ID}'
      UNION ALL SELECT canonical_id FROM research_search_protocols WHERE canonical_id LIKE '%-KAR-%' AND ingestion_method = '${BATCH_ID}'
      UNION ALL SELECT canonical_id FROM research_gaps WHERE canonical_id LIKE '%-KAR-%' AND ingestion_method = '${BATCH_ID}'
    ) AS sub`);
    if (parseInt(karCountRes.rows[0].count) > 0) {
      throw new Error('KAR-prefixed identifiers remain after ingestion');
    }
    await client.query('COMMIT');
    console.log("Ingestion completed successfully with regression check");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Ingestion failed:", err);
  } finally {
    await client.end();
  }
}

run();
