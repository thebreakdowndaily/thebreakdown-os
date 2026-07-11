const fs = require('fs');
if (fs.existsSync('lint-results.json')) {
  try {
    const raw = fs.readFileSync('lint-results.json', 'utf8').replace(/^\uFEFF/, '');
    const data = JSON.parse(raw);
    const ruleCounts = {};
    let totalErrors = 0;
    
    data.forEach(f => {
      f.messages.forEach(m => {
        const rule = m.ruleId || 'unknown';
        ruleCounts[rule] = (ruleCounts[rule] || 0) + 1;
        totalErrors++;
      });
    });
    
    console.log(`Total Errors: ${totalErrors}`);
    console.log('Rule Breakdown:');
    
    const sortedRules = Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]);
    sortedRules.forEach(([rule, count]) => {
      console.log(`  ${rule}: ${count}`);
    });
  } catch (e) {
    console.log('Parse error', e.message);
  }
} else {
  console.log('File not found');
}
