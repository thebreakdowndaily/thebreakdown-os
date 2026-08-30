import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function runTest(name: string, testFn: () => void) {
    try {
      testFn();
      passed++;
    } catch (e) {
      console.error(`  FAIL: ${name}`, e);
      failed++;
    }
  }

  const basePath = path.join(process.cwd(), 'app');

  const pagesToCheck = [
    {
      route: '/problems',
      filePath: path.join(basePath, 'problems/page.tsx'),
      expectedSchema: 'DefinedTermSet',
      metadataExpected: true
    },
    {
      route: '/precedents',
      filePath: path.join(basePath, 'precedents/page.tsx'),
      expectedSchema: 'Dataset',
      metadataExpected: true
    },
    {
      route: '/evolution',
      filePath: path.join(basePath, 'evolution/page.tsx'),
      expectedSchema: 'DataFeed',
      metadataExpected: true
    },
    {
      route: '/problems/[slug]',
      filePath: path.join(basePath, 'problems/[slug]/page.tsx'),
      expectedSchema: 'Article',
      metadataExpected: true
    },
    {
      route: '/problems/[slug]/compare',
      filePath: path.join(basePath, 'problems/[slug]/compare/page.tsx'),
      expectedSchema: 'Table',
      metadataExpected: true
    },
    {
      route: '/problems/[slug]/precedents',
      filePath: path.join(basePath, 'problems/[slug]/precedents/page.tsx'),
      expectedSchema: 'ItemPage',
      metadataExpected: true
    },
    {
      route: '/problems/[slug]/tracking',
      filePath: path.join(basePath, 'problems/[slug]/tracking/page.tsx'),
      expectedSchema: 'ItemPage',
      metadataExpected: true
    },
    {
      route: '/problems/[slug]/evolution',
      filePath: path.join(basePath, 'problems/[slug]/evolution/page.tsx'),
      expectedSchema: 'ItemPage',
      metadataExpected: true
    },
    {
      route: '/compare',
      filePath: path.join(basePath, 'compare/page.tsx'),
      expectedSchema: 'Table',
      metadataExpected: true
    }
  ];

  for (const page of pagesToCheck) {
    runTest(`Testing programmatic SEO for ${page.route}`, () => {
      const content = fs.readFileSync(page.filePath, 'utf-8');

      if (page.metadataExpected) {
        const hasMetadata = content.includes('export const metadata') || content.includes('export async function generateMetadata');
        assert(hasMetadata, `${page.route} exports metadata or generateMetadata`);
      }

      if (page.expectedSchema) {
        const regex = new RegExp(`'@type'\\s*:\\s*['"\`]${page.expectedSchema}['"\`]`);
        assert(regex.test(content), `${page.route} contains JSON-LD schema with @type '${page.expectedSchema}'`);
      }
    });
  }

  console.log(`\nProgrammatic SEO Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
