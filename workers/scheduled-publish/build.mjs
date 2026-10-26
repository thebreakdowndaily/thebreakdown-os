/**
 * esbuild config for the scheduled-publish Cloudflare Worker.
 *
 * Bundles the Worker entry point and canonical API dispatcher into a single file
 * suitable for the Cloudflare Workers V8 runtime. Editorial publication logic and
 * persistence remain owned by the canonical Next.js publication endpoint; this
 * bundle must not include a direct database publishing fallback.
 *
 * Usage: node workers/scheduled-publish/build.mjs
 */
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

const result = await build({
  entryPoints: [path.join(__dirname, 'index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  outdir: path.join(__dirname, 'dist'),
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  alias: {
    '@': projectRoot,
    '@lib': path.join(projectRoot, 'lib'),
    '@types': path.join(projectRoot, 'types'),
  },
  external: [],
  minify: false,
  sourcemap: false,
  logLevel: 'info',
  // Workers-specific
  conditions: ['worker', 'browser'],
  mainFields: ['module', 'main'],
});

if (result.errors.length > 0) {
  console.error('Build failed:', result.errors);
  process.exit(1);
}

console.log('✓ Scheduled publish Worker built → workers/scheduled-publish/dist/');
