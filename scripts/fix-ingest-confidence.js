const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\ingest-vertical-slice.js';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/'t1'/g, "'C1'");
fs.writeFileSync(p, c);
console.log("Updated script confidence values");
