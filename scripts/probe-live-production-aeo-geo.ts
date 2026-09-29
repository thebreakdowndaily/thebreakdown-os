import https from 'node:https';

interface ProbeResult {
  url: string;
  statusCode?: number;
  vercelId?: string;
  contentType?: string;
  contentLength?: number;
  canonicalHref?: string | null;
  jsonLdScripts?: any[];
  rawSnippet?: string;
  error?: string;
}

function fetchUrl(url: string): Promise<ProbeResult> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const canonicalMatch = data.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                               data.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
        
        const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        const jsonLdScripts: any[] = [];
        let match;
        while ((match = jsonLdRegex.exec(data)) !== null) {
          try {
            jsonLdScripts.push(JSON.parse(match[1]));
          } catch (e: any) {
            jsonLdScripts.push({ parseError: e.message, raw: match[1].slice(0, 100) });
          }
        }

        resolve({
          url,
          statusCode: res.statusCode,
          vercelId: (res.headers['x-vercel-id'] as string) || undefined,
          contentType: res.headers['content-type'],
          contentLength: data.length,
          canonicalHref: canonicalMatch ? canonicalMatch[1] : null,
          jsonLdScripts,
          rawSnippet: data.slice(0, 400),
        });
      });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function main() {
  console.log('================================================================');
  console.log('PROBING LIVE PRODUCTION AT https://thebreakdown.in');
  console.log('================================================================\n');

  const targets = [
    'https://thebreakdown.in/',
    'https://thebreakdown.in/robots.txt',
    'https://thebreakdown.in/sitemap.xml',
    'https://thebreakdown.in/news-sitemap.xml',
    'https://thebreakdown.in/llms.txt',
    'https://thebreakdown.in/editorial-constitution',
    'https://thebreakdown.in/story/mgnrega-reform',
    'https://thebreakdown.in/story/rbi-repo-rate',
    'https://thebreakdown.in/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance'
  ];

  for (const t of targets) {
    const res = await fetchUrl(t);
    console.log(`URL: ${res.url}`);
    console.log(`  Status:       ${res.statusCode}`);
    console.log(`  Vercel-ID:    ${res.vercelId || 'N/A'}`);
    console.log(`  Content-Type: ${res.contentType || 'N/A'}`);
    console.log(`  Bytes:        ${res.contentLength ?? 'N/A'}`);
    if (res.canonicalHref !== undefined) {
      console.log(`  Canonical:    ${res.canonicalHref ?? 'NONE'}`);
    }
    if (res.jsonLdScripts && res.jsonLdScripts.length > 0) {
      console.log(`  JSON-LD:      ${res.jsonLdScripts.length} block(s) parsed`);
      res.jsonLdScripts.forEach((obj, idx) => {
        const type = obj['@type'] || (Array.isArray(obj['@graph']) ? 'Graph (' + obj['@graph'].map((g: any) => g['@type']).join(', ') + ')' : 'Unknown');
        console.log(`    [#${idx + 1}] @type: ${type}`);
        if (type === 'NewsArticle' || type === 'Article') {
          console.log(`         author: ${JSON.stringify(obj.author)}`);
          console.log(`         headline: ${obj.headline?.slice(0, 50)}...`);
        }
        if (type === 'NewsMediaOrganization' || type === 'Organization') {
          console.log(`         publishingPrinciples: ${obj.publishingPrinciples || 'NONE'}`);
          console.log(`         correctionsPolicy: ${obj.correctionsPolicy || 'NONE'}`);
        }
      });
    }
    if (res.url.endsWith('.txt') || res.url.endsWith('.xml')) {
      console.log(`  Preview:\n${res.rawSnippet?.slice(0, 250)}...\n`);
    } else {
      console.log('');
    }
  }
}

main().catch(console.error);
