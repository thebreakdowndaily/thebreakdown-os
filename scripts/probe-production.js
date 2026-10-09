const https = require('https');
const http = require('http');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('--- PROBING PRODUCTION (thebreakdown.in) ---');
  const home = await fetchUrl('https://thebreakdown.in/');
  console.log('Homepage Status:', home.statusCode);
  console.log('X-Vercel-Id:', home.headers['x-vercel-id']);
  console.log('Age:', home.headers['age']);
  console.log('Date:', home.headers['date']);
  
  // Extract build ID from Next.js scripts
  // e.g. /_next/static/<build-id>/_buildManifest.js
  const buildManifestMatch = home.body.match(/_next\/static\/([^\/]+)\/_buildManifest\.js/);
  console.log('Next.js Build ID:', buildManifestMatch ? buildManifestMatch[1] : 'Not found');

  const titleMatch = home.body.match(/<title[^>]*>([^<]+)<\/title>/i);
  console.log('Title:', titleMatch ? titleMatch[1] : 'None');

  const descMatch = home.body.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
  console.log('Meta Description:', descMatch ? descMatch[1] : 'None');

  const canonicalMatch = home.body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
  console.log('Canonical Link:', canonicalMatch ? canonicalMatch[1] : 'None');

  // Test representative routes
  const routesToTest = [
    '/',
    '/stories',
    '/story/electoral-bonds',
    '/story/accountability-in-india',
    '/story/mgnrega-reform',
    '/entity/cag',
    '/entity/supreme-court-of-india',
    '/entity/eci',
    '/topics',
    '/topic/governance',
    '/trackers',
    '/trackers/mgnrega',
    '/trackers/upi',
    '/trackers/semiconductor',
    '/trackers/pmfby',
    '/investigations',
    '/fix',
    '/trust',
    '/corrections',
    '/sitemap.xml',
    '/feed.xml',
    '/rss'
  ];

  console.log('\n--- TESTING REPRESENTATIVE ROUTES ---');
  for (const r of routesToTest) {
    try {
      const res = await fetchUrl(`https://thebreakdown.in${r}`);
      console.log(`Route: ${r.padEnd(35)} | HTTP: ${res.statusCode} | Length: ${res.body.length}`);
    } catch (e) {
      console.log(`Route: ${r.padEnd(35)} | ERROR: ${e.message}`);
    }
  }
}

main().catch(console.error);
