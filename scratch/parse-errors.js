const fs = require('fs');
const content = fs.readFileSync('C:\\newsjack-content\\thebreakdown-os\\supabase\\migrations\\002_canonical_schema.sql', 'utf8');
const lines = content.split('\n');

let print = false;
let count = 0;

lines.forEach((line, index) => {
  if (line.includes('CREATE TABLE timelines') || line.includes('CREATE TABLE public.timelines')) {
    print = true;
    count = 0;
  }
  if (print) {
    console.log(`${index + 1}: ${line}`);
    count++;
    if (count > 25) print = false;
  }
});
