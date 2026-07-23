import * as fs from 'fs';
import * as path from 'path';

function validateReport() {
  const reportPath = path.resolve(process.cwd(), 'audit-report.json');
  if (!fs.existsSync(reportPath)) {
    console.error(`[ERROR] Report not found at ${reportPath}`);
    process.exit(1);
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch (e) {
    console.error(`[ERROR] Failed to parse JSON report: ${(e as Error).message}`);
    process.exit(1);
  }

  const requiredTopLevel = ['frameworkVersion', 'schemaVersion', 'timestamp', 'results'];
  for (const field of requiredTopLevel) {
    if (!report[field]) {
      console.error(`[ERROR] Missing top-level field: ${field}`);
      process.exit(1);
    }
  }

  if (!Array.isArray(report.results)) {
    console.error(`[ERROR] 'results' must be an array`);
    process.exit(1);
  }

  for (const result of report.results) {
    if (!result.pluginName) {
      console.error(`[ERROR] A result is missing 'pluginName' metadata`);
      process.exit(1);
    }
    if (!result.state) {
      console.error(`[ERROR] Plugin result for ${result.pluginName} is missing lifecycle 'state'`);
      process.exit(1);
    }
  }

  console.log('[INFO] Structural validation passed.');
  process.exit(0);
}

validateReport();
