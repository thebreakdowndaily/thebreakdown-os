import https from 'https';

function checkProductionEndpoint(url: string): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Auditing live production at https://thebreakdown.in ...');
  try {
    const res = await checkProductionEndpoint('https://thebreakdown.in/story/mgnrega-reform');
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Server / CDN Headers:`, {
      server: res.headers['server'],
      'x-vercel-id': res.headers['x-vercel-id'],
      'cf-ray': res.headers['cf-ray'],
      'cache-control': res.headers['cache-control'],
      'x-matched-path': res.headers['x-matched-path'],
    });

    const isCanonicalHeadline = res.body.includes('The MGNREGA Transition of 2026');
    const isLegacyHeadline = res.body.includes('MGNREGA &amp; The 2026 Rural Employment Transition') || res.body.includes('MGNREGA & The 2026 Rural Employment Transition');

    console.log(`Live HTML reflects Canonical Headline: ${isCanonicalHeadline}`);
    console.log(`Live HTML reflects Legacy Headline: ${isLegacyHeadline}`);

    if (isLegacyHeadline && !isCanonicalHeadline) {
      console.log('\n[Gate A2 Status]: Production currently serves the PRE-CANARY legacy build (Baseline intact).');
      console.log('To activate Canary in production, set CANONICAL_READ_PATH=CANARY in production deployment environment variables.');
    } else if (isCanonicalHeadline) {
      console.log('\n[Gate A2 Status]: Production currently serves CANONICAL representation.');
    }
  } catch (err: any) {
    console.error('Error contacting production endpoint:', err.message);
  }
}

main();
