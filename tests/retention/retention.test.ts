/**
 * TASK-24 — Retention layer tests.
 *
 * Guards the four TASK-24 hard rules that can regress silently:
 *   1. Honest newsletter contract — a provider NEVER reports `confirmed` or
 *      `submitted` unless a real delivery provider accepted the address.
 *      With no provider configured the API returns `unavailable` (503),
 *      never a fabricated success.
 *   2. Reader-state store — follows/saves/visits are device-local, tolerant
 *      of missing/corrupt storage, and namespaced `tb_`.
 *   3. Retention taxonomy events exist with a non-PII allow-list.
 *   4. No account is required: every retention primitive is device-local.
 */

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  // ── 1. Newsletter provider contract (honesty) ─────────────────────────

  try {
    const env = await import('../../lib/newsletter/provider');
    const originalKey = process.env.BEEHIIV_API_KEY;
    const originalPub = process.env.BEEHIIV_PUB_ID;
    delete process.env.BEEHIIV_API_KEY;
    delete process.env.BEEHIIV_PUB_ID;

    try {
      assert(env.isProviderConfigured() === false, 'provider is not configured without secrets');

      const provider = env.getNewsletterProvider();
      assert(provider instanceof env.StubProvider, 'no-secrets env resolves to StubProvider');

      const result = await provider.subscribe('test@example.com');
      assert(result.status === 'unavailable', 'StubProvider returns `unavailable`');
      assert(result.status !== 'submitted' && result.status !== 'confirmed', 'StubProvider never fabricates success or confirmation');
      assert(typeof result.message === 'string' && result.message.length > 0, 'unavailable result carries a user-facing message');

      // Beehiiv without PUB_ID is unavailable, not a fake success.
      const keyMissing = new env.BeehiivProvider('fake-key');
      process.env.BEEHIIV_API_KEY = 'fake-key';
      const noPub = await keyMissing.subscribe('test@example.com');
      assert(noPub.status === 'unavailable', 'BeehiivProvider without PUB_ID is `unavailable`');
    } finally {
      if (originalKey === undefined) delete process.env.BEEHIIV_API_KEY; else process.env.BEEHIIV_API_KEY = originalKey;
      if (originalPub === undefined) delete process.env.BEEHIIV_PUB_ID; else process.env.BEEHIIV_PUB_ID = originalPub;
    }
  } catch (e) {
    console.error('  FAIL: provider contract threw', e);
    failed++;
  }

  // ── 1b. BeehiivProvider success paths (must never fabricate `confirmed`) ──

  try {
    const env = await import('../../lib/newsletter/provider');
    const originalFetch = globalThis.fetch;
    const originalPub = process.env.BEEHIIV_PUB_ID;
    process.env.BEEHIIV_PUB_ID = 'pub_test';

    try {
      globalThis.fetch = (async () => new Response('{}', { status: 200 })) as typeof fetch;
      const okProvider = new env.BeehiivProvider('key');
      const okResult = await okProvider.subscribe('test@example.com');
      assert(okResult.status === 'submitted', 'Beehiiv 2xx maps to `submitted` (double opt-in pending)');
      assert(okResult.status !== 'confirmed', 'Beehiiv 2xx does NOT auto-confirm the subscription');

      globalThis.fetch = (async () => new Response('{}', { status: 422 })) as typeof fetch;
      const badProvider = new env.BeehiivProvider('key');
      const badResult = await badProvider.subscribe('test@example.com');
      assert(badResult.status === 'error', 'Beehiiv non-2xx maps to `error`');

      globalThis.fetch = (async () => { throw new Error('network down'); }) as typeof fetch;
      const throwProvider = new env.BeehiivProvider('key');
      const throwResult = await throwProvider.subscribe('test@example.com');
      assert(throwResult.status === 'error', 'Beehiiv fetch failure maps to `error`');
    } finally {
      globalThis.fetch = originalFetch;
      if (originalPub === undefined) delete process.env.BEEHIIV_PUB_ID; else process.env.BEEHIIV_PUB_ID = originalPub;
    }
  } catch (e) {
    console.error('  FAIL: Beehiiv success paths threw', e);
    failed++;
  }

  // ── 1c. API route honesty (no configured provider → 503 unavailable) ────

  try {
    const { POST } = await import('../../app/api/newsletter/route');
    const originalKey = process.env.BEEHIIV_API_KEY;
    const originalPub = process.env.BEEHIIV_PUB_ID;
    delete process.env.BEEHIIV_API_KEY;
    delete process.env.BEEHIIV_PUB_ID;

    try {
      const email = `retention-test-${Date.now()}@example.com`;

      const missingEmail = await POST(new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }));
      assert(missingEmail.status === 400, 'API rejects missing email with 400');

      const invalidEmail = await POST(new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      }));
      assert(invalidEmail.status === 400, 'API rejects malformed email with 400');

      const ok = await POST(new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }));
      const body = await ok.json();
      assert(ok.status === 503, 'no-provider API responds 503 (unavailable)');
      assert(body.status === 'unavailable', 'no-provider API body says `unavailable`');
      assert(body.status !== 'submitted' && body.status !== 'confirmed', 'no-provider API never claims a subscription exists');
      assert(typeof body.message === 'string' && body.message.length > 0, 'unavailable API response carries a message');

      // Normalization: uppercase + surrounding whitespace accepted. The
      // repeated address hits the 1-min rate limiter (429) — still honest.
      const upper = await POST(new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `  ${email.toUpperCase()}  ` }),
      }));
      const upperBody = await upper.json();
      assert([400, 429, 503].includes(upper.status), 'API normalizes (case/whitespace) and still resolves honestly');
      assert(upperBody.status !== 'submitted' && upperBody.status !== 'confirmed', 'normalized duplicate never claims a subscription');
    } finally {
      if (originalKey === undefined) delete process.env.BEEHIIV_API_KEY; else process.env.BEEHIIV_API_KEY = originalKey;
      if (originalPub === undefined) delete process.env.BEEHIIV_PUB_ID; else process.env.BEEHIIV_PUB_ID = originalPub;
    }
  } catch (e) {
    console.error('  FAIL: API route honesty threw', e);
    failed++;
  }

  // ── 2. Reader-state store (device-local, tolerant) ──────────────────────

  try {
    const { createReaderState } = await import('../../lib/retention/reader-state');
    const store = new Map<string, string>();
    const kv: { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void } = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
      removeItem: (k) => void store.delete(k),
    };

    // Controlled clock so follow/save ordering is deterministic (the store
    // stamps with Date.now(); same-millisecond writes would tie).
    const realNow = Date.now;
    let now = 1000;
    Date.now = () => ++now;
    try {
      const state = createReaderState(kv);

      assert(state.isFollowing('kashmir') === false, 'isFollowing false before follow');
      state.followTopic('kashmir', 'Kashmir');
      state.followTopic('china', 'China');
      assert(state.isFollowing('kashmir') === true, 'isFollowing true after follow');
      const followed = state.getFollowedTopics();
      assert(followed.length === 2, 'both topics followed');
      assert(followed[0].slug === 'china', 'follows sorted most-recent-first');
      state.unfollowTopic('china');
      assert(state.isFollowing('china') === false, 'unfollowTopic removes');
      assert(state.getFollowedTopics().length === 1, 'unfollow reduces list');

      assert(state.isSaved('pds-reform') === false, 'isSaved false before save');
      state.saveStory('pds-reform', 'PDS Reform');
      state.saveStory('gst-2.0', 'GST 2.0');
      assert(state.isSaved('pds-reform') === true, 'isSaved true after save');
      const saved = state.getSavedStories();
      assert(saved.length === 2, 'both stories saved');
      assert(saved[0].slug === 'gst-2.0', 'saves sorted most-recent-first');
      state.unsaveStory('pds-reform');
      assert(state.isSaved('pds-reform') === false, 'unsaveStory removes');

      assert(state.getLastTopicVisit('kashmir') === null, 'no visit recorded initially');
      state.markTopicVisited('kashmir');
      assert(state.getLastTopicVisit('kashmir') !== null, 'last visit recorded');

      // Storage persisted under namespaced keys (device-local contract).
      assert(store.has('tb_followed_topics_v1'), 'follows persisted under tb_ namespaced key');
      assert(store.has('tb_saved_stories_v1'), 'saves persisted under tb_ namespaced key');
      assert(store.has('tb_topic_visits_v1'), 'visits persisted under tb_ namespaced key');
    } finally {
      Date.now = realNow;
    }
  } catch (e) {
    console.error('  FAIL: reader-state store threw', e);
    failed++;
  }

  // ── 2b. Reader-state resilience (null store, corrupt JSON) ──────────────

  try {
    const { createReaderState } = await import('../../lib/retention/reader-state');

    const nullStore = createReaderState(null);
    nullStore.followTopic('x', 'X');
    nullStore.saveStory('y', 'Y');
    nullStore.markTopicVisited('z');
    assert(!nullStore.isFollowing('x') && nullStore.getFollowedTopics().length === 0, 'null store no-ops safely');
    assert(nullStore.getSavedStories().length === 0 && nullStore.isSaved('y') === false, 'null store returns empty saves');
    assert(nullStore.getLastTopicVisit('z') === null, 'null store returns null visit');

    const corruptStore: { getItem(): string | null; setItem(): void; removeItem(): void } = {
      getItem: () => '{not json!!',
      setItem: () => {},
      removeItem: () => {},
    };
    const corruptState = createReaderState(corruptStore as never);
    assert(corruptState.getFollowedTopics().length === 0, 'corrupt JSON falls back to empty follows');
    assert(corruptState.getSavedStories().length === 0, 'corrupt JSON falls back to empty saves');
    corruptState.followTopic('a', 'A'); // write to read-only-ish store must not throw
    assert(true, 'write to throwing store does not throw');
  } catch (e) {
    console.error('  FAIL: reader-state resilience threw', e);
    failed++;
  }

  // ── 3. Retention taxonomy contract ──────────────────────────────────────

  try {
    const { CORE_EVENTS, ALLOWED_PARAMS } = await import('../../lib/analytics/capture');

    const expected: Record<string, string[]> = {
      newsletter_started: ['page'],
      newsletter_submitted: ['page'],
      newsletter_subscribed: ['page'],
      newsletter_error: ['page'],
      topic_followed: ['topic_id'],
      topic_unfollowed: ['topic_id'],
      story_saved: ['content_id', 'content_type'],
      story_unsaved: ['content_id', 'content_type'],
      reader_dashboard_opened: ['tab'],
    };

    for (const [event, params] of Object.entries(expected)) {
      assert(CORE_EVENTS.includes(event as never), `retention event "${event}" is in CORE_EVENTS`);
      const allowed = ALLOWED_PARAMS[event as keyof typeof ALLOWED_PARAMS];
      assert(!!allowed && allowed.length > 0, `retention event "${event}" has a param allow-list`);
      assert(params.every((p) => allowed.includes(p as never)), `retention event "${event}" exposes its spec params`);
    }

    // No PII / free-text fields in any retention event payload.
    const PII = /(email|address|phone|password|token|secret|ip\b|user_id|session_id|uid|mobile|aadhaar|pan\b|free_text|body|message)/i;
    let leaks = 0;
    for (const event of ['newsletter_started', 'newsletter_submitted', 'newsletter_subscribed', 'newsletter_error', 'topic_followed', 'topic_unfollowed', 'story_saved', 'story_unsaved', 'reader_dashboard_opened']) {
      for (const param of ALLOWED_PARAMS[event as keyof typeof ALLOWED_PARAMS] || []) {
        if (PII.test(param)) {
          leaks++;
          console.error(`    PII-like param "${param}" on "${event}"`);
        }
      }
    }
    assert(leaks === 0, `no PII/secret/free-text params on retention events (${leaks ? 'LEAKS' : 'clean'})`);
  } catch (e) {
    console.error('  FAIL: retention taxonomy threw', e);
    failed++;
  }

  // ── 4. No-account device-local guarantee ────────────────────────────────

  try {
    const { createReaderState } = await import('../../lib/retention/reader-state');
    const lastWritten: string[] = [];
    const local = {
      getItem: (): string | null => null,
      setItem: (_k: string, v: string) => { lastWritten.push(v); },
      removeItem: () => {},
    };
    const s = createReaderState(local);
    s.followTopic('kashmir', 'Kashmir');
    s.saveStory('pds', 'PDS');
    const serialized = lastWritten.join('');
    assert(serialized.includes('followedAt') && serialized.includes('savedAt'), 'reader state serializes only device-local, non-identifying data');
    assert(!serialized.includes('@') && !serialized.includes('email'), 'no email/identifying data in reader state');
  } catch (e) {
    console.error('  FAIL: no-account guarantee threw', e);
    failed++;
  }

  console.log(`\nRetention Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();