import sitemap from '../app/sitemap';
import robots from '../app/robots';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  console.log('─── Workstream A: Sitemap & Robots Policy Consistency Tests ───\n');

  try {
    const robotRules = robots();
    const defaultRule = Array.isArray(robotRules.rules) ? robotRules.rules[0] : robotRules.rules;
    const disallows = ((defaultRule?.disallow as string[]) || []).map((d) => d.trim());
    const allows = ((defaultRule?.allow as string[]) || []).map((a) => a.trim());

    // 1. Subscribe policy invariants
    assert(!disallows.includes('/subscribe'), '/subscribe is not in robots disallow list');
    assert(allows.includes('/subscribe'), '/subscribe is explicitly permitted in robots allow list');

    // 2. Public hubs are permitted
    const expectedPublicHubs = [
      '/',
      '/stories',
      '/newsletter',
      '/subscribe',
      '/timeline',
      '/transparency/corrections',
      '/about',
      '/trust',
      '/methodology',
      '/editorial-constitution',
    ];
    for (const hub of expectedPublicHubs) {
      assert(allows.includes(hub), `Public hub '${hub}' is explicitly in robots allow list`);
      assert(!disallows.includes(hub), `Public hub '${hub}' is NOT in robots disallow list`);
    }

    // 3. Sensitive / internal tools are disallowed
    const internalPaths = ['/workspace', '/admin', '/cms', '/editorial/', '/api', '/newsroom', '/editor', '/login'];
    for (const internalPath of internalPaths) {
      assert(disallows.includes(internalPath), `Internal tool '${internalPath}' is in robots disallow list`);
    }

    // 4. RFC 9309 editorial trailing slash invariant
    assert(!disallows.includes('/editorial'), 'Robots disallow does not have /editorial without slash (RFC 9309 collision guard)');
    assert(disallows.includes('/editorial/'), 'Robots disallow has /editorial/ with trailing slash');

    // 5. Sitemap URL compliance with robots disallows
    const sitemapEntries = await sitemap();
    assert(sitemapEntries.length > 50, 'Sitemap generates non-empty URL set', `Found ${sitemapEntries.length} entries`);

    const subscribeEntry = sitemapEntries.find((e) => e.url === 'https://thebreakdown.in/subscribe');
    assert(Boolean(subscribeEntry), 'Sitemap includes https://thebreakdown.in/subscribe');

    // Check every sitemap URL against every disallow rule
    const conflictingUrls: Array<{ url: string; disallow: string }> = [];
    for (const entry of sitemapEntries) {
      const pathname = new URL(entry.url).pathname;
      for (const disallow of disallows) {
        const isMatch = disallow.endsWith('/')
          ? pathname.startsWith(disallow)
          : pathname === disallow || pathname.startsWith(disallow + '/');
        if (isMatch) {
          conflictingUrls.push({ url: entry.url, disallow });
        }
      }
    }

    assert(
      conflictingUrls.length === 0,
      'Zero sitemap URLs are blocked by robots disallow rules',
      conflictingUrls.length > 0 ? JSON.stringify(conflictingUrls) : undefined
    );

    // 6. Sitemaps declared in robots.txt
    const declaredSitemaps = Array.isArray(robotRules.sitemap) ? robotRules.sitemap : [robotRules.sitemap];
    assert(
      declaredSitemaps.includes('https://thebreakdown.in/sitemap.xml'),
      'robots.txt declares canonical sitemap.xml'
    );
    assert(
      declaredSitemaps.includes('https://thebreakdown.in/news-sitemap.xml'),
      'robots.txt declares canonical news-sitemap.xml'
    );
  } catch (err: any) {
    console.error('Fatal error in sitemap-robots-consistency test:', err);
    failed++;
  }

  console.log(`\nSitemap & Robots Consistency: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
