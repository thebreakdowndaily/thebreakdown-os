const { execSync } = require('child_process');

const LIVE_DEPLOYMENT_ID = 'dpl_AAtzpPo15QUTz8aEeDcf3YF5kBQf';
const CLEANUP_TARGETS = [
  'dpl_9jLCfERe6uTxyrXbihRTgNUSx1Am',
  'dpl_759gBKuVwif4dsnduYhVRzd8gqzJ',
  'dpl_kNUCdqhWqznJgSBrb97XZCsXbndY',
  'dpl_D7jgyuRJ1HGMeEMSaiWZsmnxiwxB',
  'dpl_9gRyL1DFV5ooEs1bEgAzRt1eRCzn',
  'dpl_9jH4ZtH78S64oLqu3R61DpxaBiLq',
  'dpl_9Ea1SSMkmLzaG8KfCjAUDT2pwN28',
  'dpl_B5H4eADHM2sh8wTKiGCJjwhS4NKH',
  'dpl_6H4j4rEoQCLLH5YoBEMsEeWMq5kR',
];

console.log('=== PHASE 1: HARD SAFETY ASSERTION ===');

// Safety assertion 1: Live deployment ID must NOT be in cleanup list
if (CLEANUP_TARGETS.includes(LIVE_DEPLOYMENT_ID)) {
  console.error('❌ CRITICAL ERROR: Live production deployment ID is in cleanup targets! ABORTING.');
  process.exit(1);
}
console.log('✅ Assertion 1 Passed: Live deployment dpl_AAtzpPo15QUTz8aEeDcf3YF5kBQf is EXCLUDED from cleanup.');

// Safety assertion 2: Live production deployment must be verified via Vercel API
try {
  const raw = execSync('vercel api "/v13/deployments/dpl_AAtzpPo15QUTz8aEeDcf3YF5kBQf?teamId=team_tbFilNFb4UMox6A5vKhdBngZ"', { encoding: 'utf-8' });
  const deploy = JSON.parse(raw);
  if (deploy.readyState !== 'READY') {
    console.error(`❌ CRITICAL ERROR: Production deployment state is ${deploy.readyState}, not READY! ABORTING.`);
    process.exit(1);
  }
  console.log(`✅ Assertion 2 Passed: Deployment ${LIVE_DEPLOYMENT_ID} is in READY state.`);
  console.log(`   URL: https://${deploy.url}`);
} catch (e) {
  console.error('❌ Failed to verify production deployment via Vercel API:', e.message);
  process.exit(1);
}

// Safety assertion 3: Verify the alias for thebreakdown.in
try {
  const rawProj = execSync('vercel api "/v9/projects/thebreakdown-os?teamId=team_tbFilNFb4UMox6A5vKhdBngZ"', { encoding: 'utf-8' });
  const proj = JSON.parse(rawProj);
  const prodTarget = proj.targets?.production;
  if (!prodTarget || prodTarget.id !== LIVE_DEPLOYMENT_ID) {
    console.error(`❌ CRITICAL ERROR: thebreakdown-os production target is ${prodTarget?.id}, expected ${LIVE_DEPLOYMENT_ID}! ABORTING.`);
    process.exit(1);
  }
  console.log(`✅ Assertion 3 Passed: Project target explicitly maps to ${LIVE_DEPLOYMENT_ID}.`);
  console.log(`   Aliases:`, prodTarget.alias);
} catch (e) {
  console.error('❌ Failed to verify project targets:', e.message);
  process.exit(1);
}

console.log('\n🔒 ALL PRODUCTION SAFETY GATES VERIFIED AND LOCKED.');
