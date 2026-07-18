#!/usr/bin/env node
import { runLoader } from '../loader.ts';
import { writeReport } from '../report/writer.ts';
import { aggregate } from '../report/aggregator.ts';
import { logger } from '../plugins/utils/logger.ts';

/** Simple CLI argument parser */
function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }
  return args;
}

async function main() {
  try {
    const args = parseArgs(process.argv);
    // Config loading placeholder - could be extended later
    const configPath = args['config'] ?? 'audit/config.json';
    logger.info(`Loading configuration from ${configPath}`);
    // For now we ignore the actual file content
    const repoRoot = process.cwd();
    const results = await runLoader(repoRoot);
    const aggregated = aggregate(results);
    writeReport(results);
    // Determine exit code based on plugin results
    const hasFailure = results.some(r => r.state === 'FAILED');
    if (hasFailure) {
      process.exit(3);
    }
    process.exit(0);
  } catch (e) {
    logger.error(`CLI error: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
