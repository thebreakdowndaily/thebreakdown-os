import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @opennextjs/cloudflare supports Next.js Node.js runtime, not Next.js Edge
 * runtime. Keeping the AI copilot route on the default Node.js runtime avoids
 * an OpenNext packaging failure and preserves access to the Node-compatible
 * service graph imported by the route.
 */
describe('Cloudflare OpenNext runtime compatibility', () => {
  it('does not force the AI copilot route onto Next.js Edge runtime', () => {
    const routePath = path.join(process.cwd(), 'app/api/ai/copilot/route.ts');
    const source = fs.readFileSync(routePath, 'utf8');

    expect(source).not.toMatch(/export\s+const\s+runtime\s*=\s*['"]edge['"]/);
  });
});
