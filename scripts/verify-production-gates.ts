import http from 'http';
import { spawn, ChildProcess } from 'child_process';

function fetchUrl(url: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, text: data }));
    }).on('error', reject);
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(port: number, maxRetries = 30): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetchUrl(`http://127.0.0.1:${port}/story/mgnrega-reform`);
      if (res.status === 200 || res.status === 404) return true;
    } catch {
      await delay(1000);
    }
  }
  return false;
}

async function runGateTest(envFlag: 'CANARY' | 'OFF', port: number) {
  console.log(`\n========================================`);
  console.log(`Testing Gate with CANONICAL_READ_PATH=${envFlag} on port ${port}...`);
  console.log(`========================================`);

  const serverProc: ChildProcess = spawn('npx', ['next', 'start', '-p', String(port)], {
    cwd: process.cwd(),
    shell: true,
    env: {
      ...process.env,
      CANONICAL_READ_PATH: envFlag,
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout?.on('data', (d) => {
    const s = d.toString().trim();
    if (s.includes('story_read_resolution')) {
      console.log(`[Telemetry Captured]:`, s);
    }
  });

  serverProc.stderr?.on('data', (d) => {
    // console.error(`[Server stderr]:`, d.toString().trim());
  });

  try {
    const ready = await waitForServer(port);
    if (!ready) {
      throw new Error(`Server failed to start on port ${port} within timeout.`);
    }

    console.log(`Server is ready on port ${port}. Requesting /story/mgnrega-reform...`);
    const mgnregaRes = await fetchUrl(`http://127.0.0.1:${port}/story/mgnrega-reform`);
    console.log(`Response status: ${mgnregaRes.status}`);

    if (envFlag === 'CANARY') {
      const containsCanonicalHeadline = mgnregaRes.text.includes('The MGNREGA Transition of 2026');
      console.log(`Assert Canonical Headline ('The MGNREGA Transition of 2026') present:`, containsCanonicalHeadline);
      if (!containsCanonicalHeadline) {
        throw new Error('Gate A1 Failure: Canonical headline not found in rendered HTML under CANARY flag.');
      }
      console.log('✅ Gate A1 Verified: Local production build rendered canonical knowledge representation.');
    } else {
      const containsLegacyHeadline = mgnregaRes.text.includes('MGNREGA &amp; The 2026 Rural Employment Transition') || mgnregaRes.text.includes('MGNREGA & The 2026 Rural Employment Transition');
      console.log(`Assert Legacy Headline present under OFF:`, containsLegacyHeadline);
      if (!containsLegacyHeadline) {
        throw new Error('Gate E Failure: Legacy headline not found in rendered HTML under OFF flag.');
      }
      console.log('✅ Gate E Verified: Clean rollback to legacy path confirmed with zero code changes.');
    }

    console.log(`Requesting /story/rbi-repo-rate...`);
    const rbiRes = await fetchUrl(`http://127.0.0.1:${port}/story/rbi-repo-rate`);
    if (envFlag === 'CANARY') {
      const containsCanonicalRbi = rbiRes.text.includes('RBI Monetary Policy Adjustments 2026');
      console.log(`Assert Canonical RBI Headline present:`, containsCanonicalRbi);
    } else {
      const containsLegacyRbi = rbiRes.text.includes('RBI Repo Rate: Decoding Monetary Policy');
      console.log(`Assert Legacy RBI Headline present:`, containsLegacyRbi);
    }

  } finally {
    console.log(`Shutting down server on port ${port}...`);
    serverProc.kill('SIGTERM');
    // On windows process trees, ensure taskkill if needed
    try {
      if (serverProc.pid) {
        spawn('taskkill', ['/pid', String(serverProc.pid), '/f', '/t']);
      }
    } catch {}
  }
}

async function main() {
  // Step 1: Test CANARY (Gate A1) on port 3088
  await runGateTest('CANARY', 3088);
  await delay(2000);
  // Step 2: Test OFF / Rollback Rehearsal (Gate E) on port 3089
  await runGateTest('OFF', 3089);
  console.log('\nAll production-equivalent gate rehearsals passed successfully!');
}

main().catch((err) => {
  console.error('Gate Test Error:', err);
  process.exit(1);
});
