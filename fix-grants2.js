const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\test-005-migration.js';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  /console\.log\('Migrations applied successfully\.'\);/,
  `await serviceClient.query('GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;');
    await serviceClient.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;');
    console.log('Migrations applied successfully.');`
);

fs.writeFileSync(p, c);
console.log("Updated test-005-migration.js with grants");
