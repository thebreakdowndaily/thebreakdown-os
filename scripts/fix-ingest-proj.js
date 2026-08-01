const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\ingest-vertical-slice.js';
let c = fs.readFileSync(p, 'utf8');

// First replace the old FIN insert which we changed previously, or just replace it wholesale.
const finReplacement = `
    // Create Project
    const projA1 = await client.query(\`
      INSERT INTO research_projects (name, ingestion_method)
      VALUES ('Maharishi Valmiki International Airport Ayodhya Dham', '\${BATCH_ID}')
      RETURNING id
    \`);
    
    // 5. Domain State (Financial)
    const finA1 = await client.query(\`
      INSERT INTO research_financial_records (project_id, stage, amount_status, amount_value, amount_operator, fiscal_year, reporting_source_id, valid_from, ingestion_method)
      VALUES ('\${projA1.rows[0].id}', 'REPORTED_EXPENDITURE', 'REPORTED', 14500000000, 'GREATER_THAN', '2023-2024', '\${srcA1_id}', '2023-12-30', '\${BATCH_ID}')
      RETURNING id
    \`);
`;

// we need to find the existing finA1 block and replace it
c = c.replace(/\/\/ 5\. Domain State \(Financial\)[\s\S]*?RETURNING id\s*`\);\s*/, finReplacement);

// Also I need to make sure I clean up research_projects
c = c.replace(/await client\.query\(`DELETE FROM research_financial_records WHERE ingestion_method = '\$\{BATCH_ID\}'`\);/, 
  "await client.query(`DELETE FROM research_financial_records WHERE ingestion_method = '${BATCH_ID}'`);\n    await client.query(`DELETE FROM research_projects WHERE ingestion_method = '${BATCH_ID}'`);");

fs.writeFileSync(p, c);
console.log("Updated script finA1 with project");
