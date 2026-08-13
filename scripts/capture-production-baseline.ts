import https from 'https';
import fs from 'fs';
import path from 'path';

function fetchUrl(url: string): Promise<{ status: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const dir = path.join(__dirname, '../scratch/comparisons/production-baseline');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const targets = ['mgnrega-reform', 'rbi-repo-rate', 'digital-payments-boom'];
  console.log('Capturing Pre-Canary Production Baseline from https://thebreakdown.in ...\n');

  const manifest: any = {
    timestamp: new Date().toISOString(),
    host: 'https://thebreakdown.in',
    currentFlagState: 'OFF',
    stories: {},
  };

  for (const slug of targets) {
    const url = `https://thebreakdown.in/story/${slug}`;
    console.log(`Fetching ${url} ...`);
    const res = await fetchUrl(url);

    fs.writeFileSync(path.join(dir, `${slug}-baseline.html`), res.body);

    const isLegacyMgnrega = res.body.includes('MGNREGA &amp; The 2026 Rural Employment Transition') || res.body.includes('MGNREGA & The 2026 Rural Employment Transition');
    const isCanonicalMgnrega = res.body.includes('The MGNREGA Transition of 2026');

    const isLegacyRbi = res.body.includes('RBI Repo Rate: Decoding Monetary Policy');
    const isCanonicalRbi = res.body.includes('RBI Monetary Policy Adjustments 2026');

    manifest.stories[slug] = {
      status: res.status,
      sizeBytes: res.body.length,
      headers: {
        server: res.headers['server'],
        'x-vercel-id': res.headers['x-vercel-id'],
        'cf-ray': res.headers['cf-ray'],
      },
      indicators: {
        isLegacyMgnrega: slug === 'mgnrega-reform' ? isLegacyMgnrega : undefined,
        isCanonicalMgnrega: slug === 'mgnrega-reform' ? isCanonicalMgnrega : undefined,
        isLegacyRbi: slug === 'rbi-repo-rate' ? isLegacyRbi : undefined,
        isCanonicalRbi: slug === 'rbi-repo-rate' ? isCanonicalRbi : undefined,
      }
    };
  }

  fs.writeFileSync(path.join(dir, 'baseline-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nProduction baseline captured successfully in scratch/comparisons/production-baseline/');
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch(console.error);
