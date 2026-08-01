const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\test-005-migration.js';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  /IF NOT EXISTS \(SELECT FROM pg_catalog\.pg_roles WHERE rolname = 'automated_ingestion_agent'\) THEN CREATE ROLE automated_ingestion_agent; END IF;/,
  `IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'automated_ingestion_agent') THEN CREATE ROLE automated_ingestion_agent; END IF;
        GRANT automated_ingestion_agent TO CURRENT_USER;
        GRANT researcher TO CURRENT_USER;
        GRANT editor TO CURRENT_USER;
        GRANT reviewer TO CURRENT_USER;
        GRANT anon TO CURRENT_USER;`
);
fs.writeFileSync(p, c);
console.log("Updated test-005-migration.js with grants");
