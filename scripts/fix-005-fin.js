const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\supabase\\migrations\\005_research_gap_schema.sql';
let c = fs.readFileSync(p, 'utf8');

const finUpdates = `
-------------------------------------------------------------------------------
-- FINANCIAL RECORD SCHEMA UPDATES FOR A1
-------------------------------------------------------------------------------
ALTER TABLE research_financial_records ADD COLUMN amount_operator VARCHAR(50);
ALTER TABLE research_financial_records ADD COLUMN fiscal_year VARCHAR(20);
ALTER TABLE research_financial_records ADD COLUMN reporting_source_id UUID REFERENCES research_sources(id);
`;

c = c + finUpdates;
fs.writeFileSync(p, c);
console.log("Added finUpdates to 005 schema");
