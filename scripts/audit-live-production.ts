import https from 'https';

function checkEndpoint(url: string): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

interface AuditResult {
  slug: string;
  url: string;
  statusCode: number;
  expectedType: 'canary' | 'non-canary';
  isCanonicalHeadline: boolean;
  isLegacyHeadline: boolean;
  canonicalClaimPresent: boolean;
  canonicalSourcePresent: boolean;
  jsonLdValid: boolean;
  verdict: 'CANONICAL_ACTIVE' | 'LEGACY_ACTIVE' | 'ANOMALOUS';
}

async function auditStory(slug: string, expectedType: 'canary' | 'non-canary'): Promise<AuditResult> {
  const url = `https://thebreakdown.in/story/${slug}`;
  const res = await checkEndpoint(url);

  let isCanonicalHeadline = false;
  let isLegacyHeadline = false;
  let canonicalClaimPresent = false;
  let canonicalSourcePresent = false;

  if (slug === 'mgnrega-reform') {
    isCanonicalHeadline = res.body.includes('The MGNREGA Transition of 2026');
    isLegacyHeadline = res.body.includes('MGNREGA &amp; The 2026 Rural Employment Transition') || res.body.includes('MGNREGA & The 2026 Rural Employment Transition');
    canonicalClaimPresent = res.body.includes('expanded the statutory rural wage employment guarantee to 125 days') || res.body.includes('Viksit Bharat');
    canonicalSourcePresent = res.body.includes('Gazette of India') || res.body.includes('Act No. 18 of 2025');
  } else if (slug === 'rbi-repo-rate') {
    isCanonicalHeadline = res.body.includes('RBI Monetary Policy Adjustments 2026');
    isLegacyHeadline = res.body.includes('RBI Repo Rate: Decoding Monetary Policy');
    canonicalClaimPresent = res.body.includes('Monetary Policy Committee') || res.body.includes('repo rate');
    canonicalSourcePresent = res.body.includes('Reserve Bank of India') || res.body.includes('RBI Bulletin');
  } else if (slug === 'digital-payments-boom') {
    isLegacyHeadline = res.body.includes('UPI &amp; Digital Payments') || res.body.includes('Digital Payments');
  }

  const jsonLdValid = res.body.includes('"@type":"Article"') || res.body.includes('"@context":"https://schema.org"');

  let verdict: 'CANONICAL_ACTIVE' | 'LEGACY_ACTIVE' | 'ANOMALOUS' = 'ANOMALOUS';
  if (isCanonicalHeadline && (canonicalClaimPresent || expectedType === 'non-canary')) {
    verdict = 'CANONICAL_ACTIVE';
  } else if (isLegacyHeadline) {
    verdict = 'LEGACY_ACTIVE';
  }

  return {
    slug,
    url,
    statusCode: res.statusCode,
    expectedType,
    isCanonicalHeadline,
    isLegacyHeadline,
    canonicalClaimPresent,
    canonicalSourcePresent,
    jsonLdValid,
    verdict,
  };
}

async function main() {
  console.log('Auditing Production Deployment at https://thebreakdown.in ...\n');

  const targets = [
    { slug: 'mgnrega-reform', type: 'canary' as const },
    { slug: 'rbi-repo-rate', type: 'canary' as const },
    { slug: 'digital-payments-boom', type: 'non-canary' as const },
  ];

  const results: AuditResult[] = [];

  for (const t of targets) {
    const res = await auditStory(t.slug, t.type);
    results.push(res);
    console.log(`[${t.slug}] -> Status: ${res.statusCode} | Verdict: ${res.verdict} | Canonical Headline: ${res.isCanonicalHeadline} | Claims Verified: ${res.canonicalClaimPresent}`);
  }

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(JSON.stringify(results, null, 2));

  const allCanariesActive = results.filter(r => r.expectedType === 'canary').every(r => r.verdict === 'CANONICAL_ACTIVE');
  const nonCanaryLegacy = results.filter(r => r.expectedType === 'non-canary').every(r => r.verdict === 'LEGACY_ACTIVE');

  if (allCanariesActive && nonCanaryLegacy) {
    console.log('\n✅ ALL CANARY PASS CRITERIA SATISFIED ON PRODUCTION');
  } else {
    console.log('\nℹ️ Current State: Production is in PRE-CANARY / LEGACY state.');
  }
}

main().catch(console.error);
