require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');
(async () => {
  const c = new Client({ 
    connectionString: process.env.TEST_DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });
  await c.connect();
  console.log('=== Generating Batch 1 Data Files ===');
  
  // Function to write txt file
  function writeFile(filename, data) {
    const fs = require('fs');
    fs.writeFileSync(filename, data, 'utf8');
    console.log(`✅ Created ${filename} (${data.length} chars)`);
  }
  
  // 1. Constituencies
  const constituencies = await c.query(
    `SELECT canonical_id, name, created_at, ingestion_method 
     FROM research_constituencies 
     WHERE canonical_id NOT LIKE 'TEST-%' 
     ORDER BY canonical_id`
  );
  
  let constituenciesTxt = 'CONSTITUENCIES DATA\n';
  constituenciesTxt += '===================\n\n';
  constituenciesTxt += 'canonical_id | name | created_at | ingestion_method\n';
  constituenciesTxt += '------------- | ---- | ---------- | ----------------\n';
  constituencies.rows.forEach(row => {
    constituenciesTxt += `${row.canonical_id} | ${row.name} | ${row.created_at} | ${row.ingestion_method}\n`;
  });
  writeFile('constituencies.txt', constituenciesTxt);
  
  // 2. Claims
  const claims = await c.query(
    `SELECT canonical_id, statement, confidence, human_review_status, publication_status, created_at
     FROM research_claims 
     WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
     ORDER BY canonical_id`
  );
  
  let claimsTxt = 'CLAIMS DATA\n';
  claimsTxt += '============\n\n';
  claimsTxt += 'canonical_id | confidence | human_review_status | publication_status | created_at | statement preview\n';
  claimsTxt += '------------- | ----------- | ------------------- | ------------------ | ---------- | ------------------\n';
  claims.rows.forEach(row => {
    const preview = row.statement.substring(0, 80) + (row.statement.length > 80 ? '...' : '');
    claimsTxt += `${row.canonical_id} | ${row.confidence} | ${row.human_review_status} | ${row.publication_status} | ${row.created_at} | ${preview}\n`;
  });
  writeFile('claims.txt', claimsTxt);
  
  // 3. Sources
  const sources = await c.query(
    `SELECT id, title, source_type, created_at, ingestion_method
     FROM research_sources 
     WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
     ORDER BY id`
  );
  
  let sourcesTxt = 'SOURCES DATA\n';
  sourcesTxt += '==============\n\n';
  sourcesTxt += 'id | title | source_type | created_at | ingestion_method\n';
  sourcesTxt += '--- | ----- | ----------- | ---------- | ----------------\n';
  sources.rows.forEach(row => {
    sourcesTxt += `${row.id} | ${row.title} | ${row.source_type} | ${row.created_at} | ${row.ingestion_method}\n`;
  });
  writeFile('sources.txt', sourcesTxt);
  
  // 4. Evidence Items
  const evidence = await c.query(
    `SELECT id, source_id, extracted_text, human_review_status, created_at
     FROM research_evidence_items 
     WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
     ORDER BY id`
  );
  
  let evidenceTxt = 'EVIDENCE ITEMS DATA\n';
  evidenceTxt += '======================\n\n';
  evidenceTxt += 'id | source_id | extracted_text preview | human_review_status | created_at\n';
  evidenceTxt += '--- | --------- | ---------------------- | ------------------- | ----------\n';
  evidence.rows.forEach(row => {
    const preview = row.extracted_text.substring(0, 80) + (row.extracted_text.length > 80 ? '...' : '');
    evidenceTxt += `${row.id} | ${row.source_id} | ${preview} | ${row.human_review_status} | ${row.created_at}\n`;
  });
  writeFile('evidence.txt', evidenceTxt);
  
  // 5. Financial Records
  const financial = await c.query(
    `SELECT id, amount_value, amount_status, stage, currency, fiscal_year, target_geography
     FROM research_financial_records 
     WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED'
     ORDER BY id`
  );
  
  let financialTxt = 'FINANCIAL RECORDS DATA\n';
  financialTxt += '========================\n\n';
  financialTxt += 'id | amount_value | amount_status | stage | currency | fiscal_year | target_geography\n';
  financialTxt += '--- | ------------ | ------------ | ----- | -------- | ----------- | ----------------\n';
  financial.rows.forEach(row => {
    financialTxt += `${row.id} | ${row.amount_value} | ${row.amount_status} | ${row.stage} | ${row.currency} | ${row.fiscal_year} | ${row.target_geography}\n`;
  });
  writeFile('financial.txt', financialTxt);
  
  // 6. Corrections
  const corrections = await c.query(
    `SELECT id, correction_type, rationale, previous_claim_id, successor_claim_id, created_at, ingestion_method
     FROM research_corrections 
     WHERE ingestion_method LIKE 'P1_RESOLUTION%'
     ORDER BY id`
  );
  
  let correctionsTxt = 'CORRECTIONS DATA\n';
  correctionsTxt += '==================\n\n';
  correctionsTxt += 'id | correction_type | rationale preview | previous_claim_id | successor_claim_id | created_at | ingestion_method\n';
  correctionsTxt += '--- | ---------------- | ----------------- | ---------------- | ----------------- | ---------- | ----------------\n';
  corrections.rows.forEach(row => {
    const preview = row.rationale.substring(0, 80) + (row.rationale.length > 80 ? '...' : '');
    correctionsTxt += `${row.id} | ${row.correction_type} | ${preview} | ${row.previous_claim_id} | ${row.successor_claim_id} | ${row.created_at} | ${row.ingestion_method}\n`;
  });
  writeFile('corrections.txt', correctionsTxt);
  
  // Summary file
  let summaryTxt = 'BATCH 1 DATA SUMMARY\n';
  summaryTxt += '======================\n\n';
  summaryTxt += `Constituencies: ${constituencies.rows.length} records\n`;
  summaryTxt += `Claims: ${claims.rows.length} records\n`;
  summaryTxt += `Sources: ${sources.rows.length} records\n`;
  summaryTxt += `Evidence Items: ${evidence.rows.length} records\n`;
  summaryTxt += `Financial Records: ${financial.rows.length} records\n`;
  summaryTxt += `Corrections: ${corrections.rows.length} records\n\n`;
  summaryTxt += 'All data is from batch PROD-12CONSTITUENCY-CONTROLLED.\n';
  summaryTxt += 'Files generated: constituencies.txt, claims.txt, sources.txt, evidence.txt, financial.txt, corrections.txt\n';
  
  writeFile('summary.txt', summaryTxt);
  
  console.log('\n=== All Files Generated Successfully ===');
  console.log('Files created in current directory:');
  console.log('- constituencies.txt');
  console.log('- claims.txt'); 
  console.log('- sources.txt');
  console.log('- evidence.txt');
  console.log('- financial.txt');
  console.log('- corrections.txt');
  console.log('- summary.txt');
  
  await c.end();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });