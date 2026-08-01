const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\test-005-migration.js';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  /DROP SCHEMA IF EXISTS editorial CASCADE;/,
  `DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      DROP SCHEMA IF EXISTS editorial CASCADE;`
);
fs.writeFileSync(p, c);
console.log("Updated test-005-migration.js with public drop");
