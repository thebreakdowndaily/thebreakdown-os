const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\ingest-vertical-slice.js';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  /await client\.query\("SET session authorization 'authenticated'"\);/,
  `await client.query("SET LOCAL role = 'authenticated'");`
);
fs.writeFileSync(p, c);
console.log("Updated script");
