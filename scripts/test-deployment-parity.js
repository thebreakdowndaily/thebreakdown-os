const https = require('https');

async function fetchRoute(path) {
  const url = `https://thebreakdown.in${path}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      resolve({
        path,
        status: 0,
        headers: {},
        body: '',
        error: err.message
      });
    });
  });
}

function parseDom(html) {
  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
  const desc = (html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i) || [])[1] || '';
  const canonical = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) || [])[1] || '';
  const ogTitle = (html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i) || [])[1] || '';
  const ogDesc = (html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || [])[1] || '';
  
  // Extract JSON-LD scripts
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonLd = [];
  for (const m of jsonLdMatches) {
    try {
      jsonLd.push(JSON.parse(m[1]));
    } catch {}
  }

  return { title, desc, canonical, ogTitle, ogDesc, h1, jsonLdCount: jsonLd.length, jsonLd };
}

async function runParitySuite() {
  console.log('================================================================================');
  console.log('THE BREAKDOWN OS — AUTOMATED PRODUCTION PARITY TEST SUITE');
  console.log('Target: https://thebreakdown.in/ (Vercel Production)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================================\n');

  const testMatrix = [
    { path: '/', name: 'Homepage', expStatus: 200 },
    { path: '/stories', name: 'Stories Index', expStatus: 200 },
    { path: '/story/electoral-bonds', name: 'Story: Electoral Bonds', expStatus: 200 },
    { path: '/story/accountability-in-india', name: 'Story: Accountability', expStatus: 200 },
    { path: '/story/mgnrega-reform', name: 'Story: MGNREGA', expStatus: 200 },
    { path: '/entity/cag', name: 'Entity: CAG', expStatus: 200 },
    { path: '/entity/supreme-court-of-india', name: 'Entity: Supreme Court', expStatus: 200 },
    { path: '/entity/eci', name: 'Entity: ECI', expStatus: 200 },
    { path: '/topics', name: 'Topics Index', expStatus: 200 },
    { path: '/topic/governance', name: 'Topic: Governance', expStatus: 200 },
    { path: '/trackers', name: 'Trackers Hub', expStatus: 200 },
    { path: '/trackers/mgnrega', name: 'Tracker: MGNREGA', expStatus: 200 },
    { path: '/trackers/upi', name: 'Tracker: UPI', expStatus: 200 },
    { path: '/trackers/semiconductor', name: 'Tracker: Semiconductor', expStatus: 200 },
    { path: '/trackers/pmfby', name: 'Tracker: PMFBY', expStatus: 200 },
    { path: '/investigations', name: 'Investigations Hub', expStatus: 200 },
    { path: '/fix', name: 'Fix Hub', expStatus: 200 },
    { path: '/trust', name: 'Trust & Governance', expStatus: 200 },
    { path: '/transparency/corrections', name: 'Corrections Ledger', expStatus: 200 },
    { path: '/founding-edition/chapter-1', name: 'Founding Edition Ch 1', expStatus: 200 },
    { path: '/sitemap.xml', name: 'Sitemap XML', expStatus: 200 },
    { path: '/feed.xml', name: 'Atom Feed XML', expStatus: 200 },
    { path: '/rss', name: 'RSS Feed', expStatus: 200 }
  ];

  const results = [];

  for (const item of testMatrix) {
    const res = await fetchRoute(item.path);
    const dom = parseDom(res.body);

    let parityStatus = 'MATCH';
    let notes = '';

    if (res.status !== item.expStatus) {
      parityStatus = 'DRIFT_FAIL';
      notes = `Expected HTTP ${item.expStatus}, got ${res.status}`;
    } else if (item.path.endsWith('.xml') || item.path === '/rss') {
      if (res.body.length < 500) {
        parityStatus = 'DRIFT_FAIL';
        notes = 'Feed content unexpectedly truncated';
      } else {
        notes = `Valid XML feed (${res.body.length} bytes)`;
      }
    } else {
      if (!dom.title) {
        parityStatus = 'DRIFT_WARN';
        notes = 'Missing <title> tag';
      } else if (!dom.canonical) {
        parityStatus = 'DRIFT_WARN';
        notes = 'Missing canonical link';
      } else {
        notes = `Title: "${dom.title.slice(0, 35)}..." | JSON-LD: ${dom.jsonLdCount}`;
      }
    }

    results.push({
      ...item,
      actStatus: res.status,
      dom,
      parityStatus,
      notes,
      bodyLength: res.body.length
    });

    console.log(`[${parityStatus.padEnd(10)}] ${item.name.padEnd(25)} | ${item.path.padEnd(35)} | HTTP: ${res.status} | ${notes}`);
  }

  console.log('\n--- PARITY SUMMARY ---');
  const matched = results.filter(r => r.parityStatus === 'MATCH').length;
  const warned = results.filter(r => r.parityStatus === 'DRIFT_WARN').length;
  const failed = results.filter(r => r.parityStatus === 'DRIFT_FAIL').length;
  console.log(`Total Routes Tested: ${results.length}`);
  console.log(`Parity Matches:      ${matched}`);
  console.log(`Parity Warnings:     ${warned}`);
  console.log(`Parity Failures:     ${failed}`);

  return results;
}

runParitySuite().catch(console.error);
