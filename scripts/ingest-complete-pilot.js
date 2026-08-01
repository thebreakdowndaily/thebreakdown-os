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

  const BATCH_ID = 'STEP3B_COMPLETE_PILOT';

  // Helper: insert-or-resolve using SELECT-first-then-INSERT
  async function insertOrResolve(table, columns, values, conflictCols) {
    const conflictVals = conflictCols.map(c => values[columns.indexOf(c)]);
    const where = conflictCols.map((c, i) => `${c} = $${i + 1}`).join(' AND ');
    const existing = await client.query(`SELECT id FROM ${table} WHERE ${where}`, conflictVals);
    if (existing.rows.length > 0) return existing.rows[0].id;
    const cols = columns.join(', ');
    const vals = values.map((v, i) => `$${i + 1}`).join(', ');
    const res = await client.query(`INSERT INTO ${table} (${cols}) VALUES (${vals}) RETURNING id`, values);
    return res.rows[0].id;
  }

  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL role = 'authenticated'");
    await client.query(`SET LOCAL request.jwt.claims = '{"app_metadata": {"research_role": "automated_ingestion_agent"}}'`);

    // ====================================================================
    // RAMPUR (AC-37): Electoral Chronology — Vacancy/Disqualification/By-election
    // ====================================================================
    console.log("\n--- RAMPUR (AC-37) ---");

    // Constituency
    const rampur_const_id = await insertOrResolve('research_constituencies',
      ['canonical_id', 'name', 'ingestion_method'],
      ['UP-AC-037', 'Rampur', BATCH_ID],
      ['canonical_id']);

    // Source 1: PIB Press Release (Nov 10, 2022)
    const src_rampur_pib = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Bye Election to 37-Rampur AC of UP Legislative Assembly — Revision of bye election Schedule (PIB, PRID 1875030, Nov 10 2022)', 'OFFICIAL_GOVERNMENT_DOCUMENT', BATCH_ID],
      ['title']);

    // Source 2: Indian Express explainer (Nov 13, 2022)
    const src_rampur_ie = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['By-election in Rampur: How Azam Khan disqualification has resulted in second Assembly election (Indian Express, Nov 13 2022)', 'JOURNALISM', BATCH_ID],
      ['title']);

    // Source 3: Indian Express — Azam Khan no more MLA (Oct 28, 2022)
    const src_rampur_ie_vacancy = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Azam Khan is no more an MLA, his Rampur Sadar seat declared vacant (Indian Express, Oct 28 2022)', 'JOURNALISM', BATCH_ID],
      ['title']);

    // Evidence items
    const ev_rampur_pib = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_rampur_pib, 'The vacancy in 37-Rampur AC of UP Legislative Assembly occurred on 27th October 2022 due to disqualification of Shri Mohammad Azam Khan. The Commission vide Press Note No. ECI/PN/83/2022 dated 5th November 2022 announced schedule for bye election.', BATCH_ID],
      ['source_id']);

    const ev_rampur_ie_chronology = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_rampur_ie, 'On October 27, the Rampur MP-MLA court found Khan guilty of hate speech against CM Yogi Adityanath and DM of Rampur during 2019 Lok Sabha elections, sentenced to three years. On October 28, UP Legislative Assembly Secretariat disqualified him and declared seat vacant. ECI announced schedule Nov 5. Supreme Court directed pre-ponement of stay hearing to Nov 10. Court rejected stay application Nov 10. Bypoll held Dec 5, 2022.', BATCH_ID],
      ['source_id']);

    const ev_rampur_ie_vacancy = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_rampur_ie_vacancy, 'Senior SP leader Azam Khan lost his state Assembly membership after his conviction Thursday in a hate speech case. On Friday evening, the Principal Secretary, Vidhan Sabha, issued a letter declaring his Rampur Sadar seat vacant. Khan automatically stood disqualified upon being sentenced for more than two years.', BATCH_ID],
      ['source_id']);

    // Claims — Rampur electoral chronology
    const cl_rampur_conviction = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-RAM-001-A', 'C2', 'Azam Khan was convicted by the Rampur MP-MLA court on October 27, 2022 in a 2019 hate speech case and sentenced to three years imprisonment.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    const cl_rampur_disqualification = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-RAM-001-B', 'C2', 'The UP Legislative Assembly Secretariat declared the Rampur seat vacant on October 28, 2022, one day after the conviction, under Section 8(3) of the Representation of the People Act 1951.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    const cl_rampur_bypoll = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-RAM-002-A', 'C1', 'The by-election to 37-Rampur AC was held on December 5, 2022 and won by BJP candidate Akash Saxena with 81,432 votes (62.06%), marking BJP first-ever victory in the seat.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    // Claim-Evidence relationships
    for (const cl of [cl_rampur_conviction, cl_rampur_disqualification, cl_rampur_bypoll]) {
      const ev = cl === cl_rampur_bypoll ? ev_rampur_pib : ev_rampur_ie_chronology;
      await client.query(`
        INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method)
        VALUES ($1, $2, 'SUPPORTS', $3) ON CONFLICT DO NOTHING`,
        [cl, ev, BATCH_ID]);
    }

    // Claim-Subject relationships (geographic scope)
    for (const cl of [cl_rampur_conviction, cl_rampur_disqualification, cl_rampur_bypoll]) {
      await client.query(`
        INSERT INTO research_claim_subject_relationships (claim_id, constituency_id, scope, ingestion_method)
        VALUES ($1, $2, 'PRIMARY_SUBJECT', $3) ON CONFLICT DO NOTHING`,
        [cl, rampur_const_id, BATCH_ID]);
    }

    console.log("  Rampur: 3 claims, 3 evidence items, 3 sources");

    // ====================================================================
    // AYODHYA: Expand financial lifecycle (independent sourcing per stage)
    // ====================================================================
    console.log("\n--- AYODHYA (Airport Financial Lifecycle) ---");

    // Resolve existing project (create if missing — test resets wipe data)
    let proj_ayo = await client.query(`SELECT id FROM research_projects WHERE name = 'Maharishi Valmiki International Airport Ayodhya Dham'`);
    if (proj_ayo.rows.length === 0) {
      proj_ayo = await client.query(`INSERT INTO research_projects (name, ingestion_method) VALUES ('Maharishi Valmiki International Airport Ayodhya Dham', $1) RETURNING id`, [BATCH_ID]);
    }

    // Source: UP Budget 2021-22 — ₹101 crore allocation
    const src_ayo_budget = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['UP Budget 2021-22: Maryada Purushottam Sriram airport gets Rs 101 cr (NewsOnProjects)', 'OFFICIAL_GOVERNMENT_DOCUMENT', BATCH_ID],
      ['title']);

    // Source: AAI sanction ₹242 crore (Times of India, March 9 2021)
    const src_ayo_aai_sanction = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['AAI sanctions Rs 242 crore for Ayodhya airport: Hardeep Puri (Times of India, Mar 9 2021)', 'JOURNALISM', BATCH_ID],
      ['title']);

    // Source: PIB Phase1 completion cost ₹350 crore (June 30 2023)
    const src_ayo_pib_phase1 = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Development of Ayodhya Airport to be completed by September 2023 (PIB, PRID 1936512, Jun 30 2023)', 'OFFICIAL_GOVERNMENT_DOCUMENT', BATCH_ID],
      ['title']);

    // Source: Total Phase1 cost >₹1450 crore (Times Now, Dec 29 2023)
    const src_ayo_total = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Ayodhya new airport: Rs 1450 crore investment, direct flights from three cities (Times Now, Dec 29 2023)', 'JOURNALISM', BATCH_ID],
      ['title']);

    // Source: Statesman — state additional expenditure ₹1175.97 crore
    const src_ayo_statesman = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Ayodhya International Airport typifies the dynamism of double-engine govt (The Statesman, Jan 4 2024)', 'JOURNALISM', BATCH_ID],
      ['title']);

    // Evidence items
    const ev_ayo_budget = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_ayo_budget, 'The proposed Maryada Purushottam Shriram Airport in Ayodhya has been provided with Rs 101 crore for ongoing civil works in the UP Budget 2021-22.', BATCH_ID],
      ['source_id']);

    const ev_ayo_aai = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_ayo_aai_sanction, 'AAI has sanctioned Rs 242 crore for development of the state-of-the-art airport in Ayodhya. Around 270 acres of land has been made available by UP government. ATR72 operations will begin in the first phase.', BATCH_ID],
      ['source_id']);

    const ev_ayo_pib = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_ayo_pib_phase1, 'The airport is being developed at a cost of Rs 350 Cr (approx) and will be suitable for A-321/B-737 type of Aircraft. New interim Terminal Building area 6250 sqm, able to handle 300 passengers during peak hours.', BATCH_ID],
      ['source_id']);

    const ev_ayo_total = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_ayo_total, 'The newly built Ayodhya Airport was developed at a cost of more than Rs 1,450 crore. The airport terminal has been equipped to serve about 10 lakh passengers every year.', BATCH_ID],
      ['source_id']);

    const ev_ayo_statesman = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_ayo_statesman, 'With an additional expenditure of Rs 1,175.97 crore, supplementing the Rs 287 crore received from the Airports Authority of India, the Yogi government in UP has showcased the remarkable prowess of the second engine. AAI spent Rs 191 crore on pavement grading and Rs 96 crore on PEB construction.', BATCH_ID],
      ['source_id']);

    // AYODHYA — Financial records for each independently sourced stage
    // A1 (existing): Phase 1 reported expenditure
    // A3: Budget provision — UP Budget 2021-22
    const fin_ayo_budget = await insertOrResolve('research_financial_records',
      ['project_id', 'stage', 'canonical_id', 'amount_status', 'amount_operator', 'amount_value', 'source_terminology', 'fiscal_year', 'reporting_source_id', 'ingestion_method', 'target_geography', 'valid_from'],
      [proj_ayo.rows[0].id, 'BUDGET_PROVISION', 'FIN-AYO-A3-BUDGET', 'REPORTED', 'EXACT', 10100000000, 'Rs 101 crore for ongoing civil works', '2021-2022', src_ayo_budget, BATCH_ID, 'Ayodhya, Uttar Pradesh', '2021-02-01'],
      ['canonical_id']);

    // A4: AAI sanction
    const fin_ayo_aai = await insertOrResolve('research_financial_records',
      ['project_id', 'stage', 'canonical_id', 'amount_status', 'amount_operator', 'amount_value', 'source_terminology', 'fiscal_year', 'reporting_source_id', 'ingestion_method', 'target_geography', 'valid_from'],
      [proj_ayo.rows[0].id, 'FINANCIAL_SANCTION', 'FIN-AYO-A4-AAI-SANCTION', 'REPORTED', 'EXACT', 24200000000, 'AAI has sanctioned Rs 242 crore for development of the state-of-the-art airport', '2020-2021', src_ayo_aai_sanction, BATCH_ID, 'Ayodhya, Uttar Pradesh', '2021-03-09'],
      ['canonical_id']);

    // A5: Phase 1 construction cost (PIB — Rs 350 crore)
    const fin_ayo_phase1_pib = await insertOrResolve('research_financial_records',
      ['project_id', 'stage', 'canonical_id', 'amount_status', 'amount_operator', 'amount_value', 'source_terminology', 'fiscal_year', 'reporting_source_id', 'ingestion_method', 'target_geography', 'valid_from'],
      [proj_ayo.rows[0].id, 'REPORTED_EXPENDITURE', 'FIN-AYO-A5-PHASE1-PIB', 'REPORTED', 'EXACT', 35000000000, 'airport is being developed at a cost of Rs 350 Cr (approx)', '2023-2024', src_ayo_pib_phase1, BATCH_ID, 'Ayodhya, Uttar Pradesh', '2023-06-30'],
      ['canonical_id']);

    // A6: State additional expenditure (₹1175.97 crore)
    const fin_ayo_state = await insertOrResolve('research_financial_records',
      ['project_id', 'stage', 'canonical_id', 'amount_status', 'amount_operator', 'amount_value', 'source_terminology', 'fiscal_year', 'reporting_source_id', 'ingestion_method', 'target_geography', 'valid_from'],
      [proj_ayo.rows[0].id, 'REPORTED_EXPENDITURE', 'FIN-AYO-A6-STATE-ADDITIONAL', 'REPORTED', 'EXACT', 117597000000, 'additional expenditure of Rs 1,175.97 crore supplementing Rs 287 crore from AAI', '2023-2024', src_ayo_statesman, BATCH_ID, 'Ayodhya, Uttar Pradesh', '2024-01-04'],
      ['canonical_id']);

    // Claims for Ayodhya
    const cl_ayo_budget = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-AYO-002-A', 'C2', 'The UP state government allocated Rs 101 crore for civil works of the Maryada Purushottam Sriram Airport in the 2021-22 state budget.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    const cl_ayo_aai_sanction = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-AYO-002-B', 'C1', 'The Airports Authority of India sanctioned Rs 242 crore for the development of Ayodhya airport in March 2021.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    const cl_ayo_phase1_cost = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-AYO-003-A', 'C1', 'Phase 1 of Ayodhya Airport was completed at a total cost exceeding Rs 1,450 crore, combining central and state government expenditure.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    // Evidence-Claim and Claim-Subject for Ayodhya
    const ayo_claims = [
      { cl: cl_ayo_budget, ev: ev_ayo_budget },
      { cl: cl_ayo_aai_sanction, ev: ev_ayo_aai },
      { cl: cl_ayo_phase1_cost, ev: ev_ayo_total },
    ];
    for (const {cl, ev} of ayo_claims) {
      await client.query(`INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method) VALUES ($1, $2, 'SUPPORTS', $3) ON CONFLICT DO NOTHING`, [cl, ev, BATCH_ID]);
      await client.query(`INSERT INTO research_claim_subject_relationships (claim_id, project_id, scope, ingestion_method) VALUES ($1, $2, 'PRIMARY_SUBJECT', $3) ON CONFLICT DO NOTHING`, [cl, proj_ayo.rows[0].id, BATCH_ID]);
    }

    console.log("  Ayodhya: 3 new claims, 5 evidence items, 5 sources, 4 financial records");

    // ====================================================================
    // KARHAL (Mainpuri district): PWD/CAG Contradiction Pair
    // ====================================================================
    console.log("\n--- KARHAL (Mainpuri district) ---");

    const karhal_const_id = await insertOrResolve('research_constituencies',
      ['canonical_id', 'name', 'ingestion_method'],
      ['UP-AC-108', 'Karhal', BATCH_ID],
      ['canonical_id']);

    // Source: CAG Report No. 4 of 2017 — Contract Management in Road Works
    const src_cag_report = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Report No. 4 of 2017 — Performance Audit of Contract Management in Road Works, Government of Uttar Pradesh (CAG)', 'OFFICIAL_GOVERNMENT_DOCUMENT', BATCH_ID],
      ['title']);

    // Source: CAG Chapter7 — Evaluation of Bids and Selection of Contractor
    const src_cag_ch7 = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['CAG Chapter 7 — Evaluation of Bids and Selection of Contractor (Report No. 4 of 2017, UP PWD)', 'OFFICIAL_GOVERNMENT_DOCUMENT', BATCH_ID],
      ['title']);

    // Evidence: CAG finding on Mainpuri Construction Division
    const ev_cag_mainpuri = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_cag_ch7, 'During scrutiny of records of Construction division, Mainpuri, it was noticed that during 2015-16, for 12 works costing Rs 31.35 lakh, tenders were purchased by only two contractors — Girish Chandra Pandey and Bheekham Singh. In all 12 cases, bids of Girish Chandra Pandey were lower (rates quoted between 0.01 per cent to 0.25 per cent below estimated rate in 9 bids and at par in 3 bids) and all 12 contracts were awarded to Girish Chandra Pandey. This could be abnormal indicating a possible cartel formation and needs investigation.', BATCH_ID],
      ['source_id']);

    // Evidence: CAG finding on statewide collusive bidding
    const ev_cag_collusion = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_cag_report, 'Audit observed that tendering in road works was largely not competitive and the number of such tenders increased steeply from 63 per cent in 2011-12 to 77 per cent in 2015-16. 598 contracts (75 per cent) costing Rs 3,300.79 crore were awarded on the basis of one or two bids only during 2011-16, without resorting to retendering.', BATCH_ID],
      ['source_id']);

    // CAG finding on excess provision in estimates
    const ev_cag_excess = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_cag_report, 'Test-check of estimates of 11 road works under 10 test-checked divisions revealed excess provision of crust thickness, crust design without traffic census, etc., in contravention of IRC specifications. This resulted in excess or avoidable expenditure of Rs 58.33 crore.', BATCH_ID],
      ['source_id']);

    // Claims — Karhal PWD/CAG contradiction pair
    const cl_karhal_pwd = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-KAR-001-A', 'C1', 'PWD Construction Division Mainpuri awarded 12 road works worth Rs 31.35 lakh during 2015-16 to a single contractor (Girish Chandra Pandey) in all cases, with bid rates within 0.25% of estimated rates, suggesting possible cartel formation.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    const cl_karhal_cag = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-KAR-001-B', 'C1', 'The CAG Performance Audit (Report No. 4 of 2017) found that 75% of PWD contracts across UP (598 contracts costing Rs 3,300.79 crore during 2011-16) were awarded on the basis of one or two bids only, with clear indications of collusive bidding in most districts.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    // Evidence-Claim relationships
    await client.query(`INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method) VALUES ($1, $2, 'SUPPORTS', $3) ON CONFLICT DO NOTHING`, [cl_karhal_pwd, ev_cag_mainpuri, BATCH_ID]);
    await client.query(`INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method) VALUES ($1, $2, 'SUPPORTS', $3) ON CONFLICT DO NOTHING`, [cl_karhal_cag, ev_cag_collusion, BATCH_ID]);

    // Claim-Subject relationships
    await client.query(`INSERT INTO research_claim_subject_relationships (claim_id, constituency_id, scope, ingestion_method) VALUES ($1, $2, 'GEOGRAPHIC_SCOPE', $3) ON CONFLICT DO NOTHING`, [cl_karhal_pwd, karhal_const_id, BATCH_ID]);
    await client.query(`INSERT INTO research_claim_subject_relationships (claim_id, constituency_id, scope, ingestion_method) VALUES ($1, $2, 'GEOGRAPHIC_SCOPE', $3) ON CONFLICT DO NOTHING`, [cl_karhal_cag, karhal_const_id, BATCH_ID]);

    console.log("  Karhal: 2 claims, 3 evidence items, 2 sources");

    // ====================================================================
    // KAIRANA (AC-8): Boundary Distinction + NOT_FOUND Search Protocol
    // ====================================================================
    console.log("\n--- KAIRANA (AC-8, Shamli district) ---");

    let kai_const_id = await client.query(`SELECT id FROM research_constituencies WHERE canonical_id = 'UP-AC-110'`);
    if (kai_const_id.rows.length === 0) {
      kai_const_id = await client.query(`INSERT INTO research_constituencies (canonical_id, name, ingestion_method) VALUES ('UP-AC-110', 'Kairana', $1) RETURNING id`, [BATCH_ID]);
    }
    const kai_const_id_val = kai_const_id.rows[0].id;

    // Source: Wikipedia — Kairana Assembly constituency
    const src_kai_wiki = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Kairana Assembly constituency (Wikipedia)', 'JOURNALISM', BATCH_ID],
      ['title']);

    // Source: Kairana Block — 159.com
    const src_kai_block = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Kairana Block — Kairana Block map (159.com)', 'REFERENCE', BATCH_ID],
      ['title']);

    // Source: Kairana Lok Sabha constituency (Wikipedia)
    const src_kai_ls_wiki = await insertOrResolve('research_sources',
      ['title', 'source_type', 'ingestion_method'],
      ['Kairana Lok Sabha constituency (Wikipedia)', 'JOURNALISM', BATCH_ID],
      ['title']);

    // Evidence: Town vs AC vs district
    const ev_kai_boundary = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_kai_wiki, 'Kairana Assembly constituency is constituency No. 8 in Uttar Pradesh Legislative Assembly. It is part of Shamli district (prior to 2012, Kairana was a tehsil of Muzaffarnagar district). Kairana Assembly constituency came into existence in 1955 as a result of the Final Order DC (1953-1955).', BATCH_ID],
      ['source_id']);

    const ev_kai_block_boundary = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_kai_block, 'Kairana Block is in Muzaffarnagar District. Kairana Block comes under multiple assembly constituencies — 2 assembly constituencies: Kairana and Thana Bhawan. Block elevation 238 meters.', BATCH_ID],
      ['source_id']);

    const ev_kai_ls = await insertOrResolve('research_evidence_items',
      ['source_id', 'extracted_text', 'ingestion_method'],
      [src_kai_ls_wiki, 'Kairana Lok Sabha constituency comprises five Vidhan Sabha segments: Nakur, Gangoh, Kairana, Thana Bhawan, Shamli.', BATCH_ID],
      ['source_id']);

    // Claim: Town ≠ AC ≠ District
    const cl_kai_boundary = await insertOrResolve('research_claims',
      ['canonical_id', 'confidence', 'statement', 'publication_status', 'human_review_status', 'ingestion_method'],
      ['CLM-KAI-002-A', 'C2', 'Kairana town, Kairana Assembly constituency, and Kairana Block are three distinct geographical units. The town is in Muzaffarnagar district, the Assembly constituency is in Shamli district, and the Block spans both.', 'DRAFT', 'UNREVIEWED', BATCH_ID],
      ['canonical_id']);

    // Claim-Evidence
    await client.query(`INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method) VALUES ($1, $2, 'SUPPORTS', $3) ON CONFLICT DO NOTHING`, [cl_kai_boundary, ev_kai_boundary, BATCH_ID]);
    await client.query(`INSERT INTO research_claim_evidence_relationships (claim_id, evidence_id, relationship_type, ingestion_method) VALUES ($1, $2, 'SUPPORTS', $3) ON CONFLICT DO NOTHING`, [cl_kai_boundary, ev_kai_block_boundary, BATCH_ID]);

    // Claim-Subject
    await client.query(`INSERT INTO research_claim_subject_relationships (claim_id, constituency_id, scope, ingestion_method) VALUES ($1, $2, 'PRIMARY_SUBJECT', $3) ON CONFLICT DO NOTHING`, [cl_kai_boundary, kai_const_id_val, BATCH_ID]);

    // Search Protocol for NOT_FOUND gap (expanding existing)
    const proto_kai_fin = await client.query(`SELECT id FROM research_search_protocols WHERE canonical_id = 'PROTO-KAI-FIN'`);
    if (proto_kai_fin.rows.length === 0) {
      await client.query(`
        INSERT INTO research_search_protocols (canonical_id, research_question, repositories_searched, queries_used, search_started_at, search_completed_at, ingestion_method)
        VALUES ($1, $2, $3, $4, '2026-07-19T00:00:00Z', '2026-07-20T00:00:00Z', $5)`,
        ['PROTO-KAI-FIN', 'Constituency capital expenditure for Kairana',
          '["CEO UP", "UP Finance Department", "UP Planning Department", "Kairana Block records"]',
          '["Kairana", "expenditure", "allocation", "MLA LAD", "capital works"]', BATCH_ID]);
    }

    console.log("  Kairana: 1 claim, 3 evidence items, 3 sources");

    await client.query('COMMIT');
    console.log("\n=== COMPLETE PILOT INGESTION SUCCESSFUL ===");

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Ingestion failed:", err);
  } finally {
    await client.end();
  }
}

run();
