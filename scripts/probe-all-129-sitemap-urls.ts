import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

interface Result {
  url: string;
  statusCode: number;
  contentType: string;
  canonicalHref: string | null;
  statusMatch: 'MATCH' | 'MISMATCH' | 'REDIRECT' | 'ERROR';
}

function fetchUrl(url: string): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function probeBatch(urls: string[], concurrency = 6): Promise<Result[]> {
  const results: Result[] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const chunkPromises = chunk.map(async (u) => {
      try {
        const res = await fetchUrl(u);
        const canonicalMatch = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i.exec(res.body) ||
                               /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i.exec(res.body);
        const canonicalHref = canonicalMatch ? canonicalMatch[1] : null;

        let statusMatch: Result['statusMatch'] = 'ERROR';
        if (res.statusCode >= 300 && res.statusCode < 400) {
          statusMatch = 'REDIRECT';
        } else if (res.statusCode === 200) {
          if (canonicalHref === u || (u === 'https://thebreakdown.in' && (canonicalHref === 'https://thebreakdown.in/' || canonicalHref === 'https://thebreakdown.in'))) {
            statusMatch = 'MATCH';
          } else {
            statusMatch = 'MISMATCH';
          }
        }
        return {
          url: u,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          canonicalHref,
          statusMatch,
        };
      } catch (err: any) {
        return {
          url: u,
          statusCode: 0,
          contentType: '',
          canonicalHref: null,
          statusMatch: 'ERROR' as const,
        };
      }
    });
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
    process.stdout.write(`Processed ${results.length}/${urls.length} URLs...\r`);
  }
  return results;
}

async function main() {
  const xml = fs.readFileSync(path.resolve(process.cwd(), 'docs/seo/live-sitemap.xml'), 'utf8');
  const locRegex = /<loc>(.*?)<\/loc>/g;
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = locRegex.exec(xml)) !== null) {
    urls.push(m[1].trim());
  }

  console.log(`Auditing all ${urls.length} live sitemap URLs...`);
  const results = await probeBatch(urls, 8);
  console.log('\n\n--- AUDIT SUMMARY FOR ALL 129 SITEMAP URLS ---');

  const matches = results.filter((r) => r.statusMatch === 'MATCH');
  const mismatches = results.filter((r) => r.statusMatch === 'MISMATCH');
  const redirects = results.filter((r) => r.statusMatch === 'REDIRECT');
  const errors = results.filter((r) => r.statusMatch === 'ERROR');

  console.log(`Total URLs: ${results.length}`);
  console.log(`✅ Canonical Match (200 OK): ${matches.length}`);
  console.log(`⚠️ Canonical Mismatch (200 OK): ${mismatches.length}`);
  console.log(`🔀 Redirects (3xx): ${redirects.length}`);
  console.log(`❌ Errors (4xx / 5xx / timeout): ${errors.length}`);

  if (mismatches.length > 0) {
    console.log('\n--- CANONICAL MISMATCHES ---');
    for (const mis of mismatches) {
      console.log(`URL: ${mis.url} -> Canonical: ${mis.canonicalHref}`);
    }
  }

  if (redirects.length > 0) {
    console.log('\n--- REDIRECTS IN SITEMAP ---');
    for (const red of redirects) {
      console.log(`URL: ${red.url} (Status ${red.statusCode})`);
    }
  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS IN SITEMAP ---');
    for (const err of errors) {
      console.log(`URL: ${err.url} (Status ${err.statusCode})`);
    }
  }

  fs.writeFileSync(
    path.resolve(process.cwd(), 'docs/seo/all-129-urls-probe-result.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log('\nDetailed result written to docs/seo/all-129-urls-probe-result.json');
}

main().catch(console.error);
