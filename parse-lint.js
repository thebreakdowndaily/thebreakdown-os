const fs = require('fs');
if (fs.existsSync('lint-results.json')) {
  try {
    const data = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));
    const files = data.filter(f => f.errorCount > 0);
    console.log(`Found ${files.length} files with errors.`);
    files.slice(0, 10).forEach(f => {
      console.log(f.filePath, `Errors: ${f.errorCount}`);
      f.messages.slice(0, 3).forEach(m => console.log(`  Line ${m.line}: ${m.ruleId} - ${m.message}`));
    });
  } catch (e) {
    console.log('Parse error', e.message);
  }
} else {
  console.log('File not found');
}
