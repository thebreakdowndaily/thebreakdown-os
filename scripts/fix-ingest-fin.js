const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\ingest-vertical-slice.js';
let c = fs.readFileSync(p, 'utf8');

// Remove canonical_id from finA1 insert
c = c.replace(
  /INSERT INTO research_financial_records \(canonical_id, amount_status, amount_value, amount_operator, financial_stage, fiscal_year, reporting_source_id, ingestion_method\)\s*VALUES \('FIN-AYO-001-A', 'REPORTED', 14500000000, 'GREATER_THAN', 'COMPLETED_EXPENDITURE', '2023-2024', '\$\{srcA1_id\}', '\$\{BATCH_ID\}'\)/,
  `INSERT INTO research_financial_records (amount_status, amount_value, amount_operator, financial_stage, fiscal_year, reporting_source_id, ingestion_method)
      VALUES ('REPORTED', 14500000000, 'GREATER_THAN', 'REPORTED_EXPENDITURE', '2023-2024', '\${srcA1_id}', '\${BATCH_ID}')`
);

fs.writeFileSync(p, c);
console.log("Updated script finA1 insert");
