# TASK-24 — Walkthrough: what a first-time reader notices

**Requirement:** the Experience Rule — every sprint must produce at least one improvement a first-time reader can notice within five minutes. This walkthrough is the reader's five-minute tour of the retention layer. It is also the manual QA script.

---

## The five-minute tour

**Minute 0–1 — The Breakdown Brief on the homepage.**
The homepage band is now a named product: *The Breakdown Brief* — "What changed, why it matters, and the evidence behind it." A reader who enters an email and submits gets an honest response: either "check your inbox to confirm" or the transparent "The Breakdown Brief isn't accepting signups yet." The banner states double opt-in plainly. What the reader never sees is a fake "you're subscribed."

**Minute 1–2 — Open any story.**
At the end of the story there is a *Save* button and the story-end CTA for the Brief. Save a story:
1. Tap **Save** → it becomes **Saved ✓** (state is `aria-pressed`-announced). To a keyboard user the same toggle works with Tab + Space/Enter.
2. Continue to **Your library** (`/reader`) — no sign-in required.

**Minute 2–3 — Your library.**
`/reader` now works: **Continue Reading** lists your recent stories, **Bookmarks** lists what you saved, **Following** lists topics you follow, **Reading History** shows everything. Every empty state explains the privacy posture: "It stays on this device." If a reader never signed in, they still have a working library; signing in only unlocks **Settings**.

**Minute 3–4 — Follow a topic, then come back.**
On any topic hub (`/topic/...`), tap **Follow topic**. Leave the site. Come back to the same topic later, after a story was published or updated: the emerald banner says **"N stories are new here — See what changed"** with a direct link to the newest story. That is deterministic metadata math (published/updated dates vs your last visit), not an algorithm guessing at you.

**Minute 4–5 — It is honest, and it stays honest.**
Every retention surface behaves truthfully even though no delivery provider is configured: the newsletter says it is "not accepting signups yet" instead of claiming a subscription; analytics fire only on the production host; and the experiments that will later tune this are defined, reversible, and limited to three.

---

## Manual QA script (test builder / reviewer)

Run in this branch's `npm run dev` (demo mode):

| Step | Action | Expected |
|------|--------|----------|
| 1 | Load `/` | Band copy = The Breakdown Brief; form present; no error on load |
| 2 | Submit a well-formed email | Honest state: `submitted` → "Check your inbox…" (only if provider configured) or `unavailable` → "not accepting signups yet"; **never** a false success |
| 3 | Submit `"not-an-email"` | Inline error; no success path |
| 4 | Submit the same email twice within a minute | Second attempt rate-limited copy (429 path) |
| 5 | Open `/story/<any>` | Save button beside share panel (reading modes where applicable) |
| 6 | Keyboard path: Tab to Save, Space | `aria-pressed` toggles; label changes; **Saved ✓** |
| 7 | Go to `/reader` without signing in | Library renders four real tabs; settings says account optional |
| 8 | Visit `/topic/<any>`, tap Follow | **Following ✓**; appears in /reader Following tab |
| 9 | Verify the banner maths | Re-visit topic: banner only when published/updated dates postdate last visit; first visit shows nothing |
| 10 | Keyboard path on banner link | Reachable + visible focus ring |
| 11 | In devtools: `tb_followed_topics_v1` | Device-local JSON; no email anywhere; cleared storage removes follows/saves |
| 12 | Open `/newsletter`, `/subscribe` | Both present the Brief value prop and double-opt-in copy |

## Runtime gates to run before launch (deferred from this branch)

1. `npm run build` + bundle analyzer on a clean tree (origin/main or post-rebase) — numeric before/after vs PERF-08 gate.
2. axe-core @ Playwright pass over `/`, `/story/[slug]`, `/topic/[slug]`, `/reader` (A11Y-21).
3. Production console check on `https://thebreakdown.in` after deploy: newsletter submit → verify provider configured; confirm GA4 receives `newsletter_submitted` / (on confirmation) `newsletter_subscribed`.

## Evidence trail

- Code: `lib/newsletter/provider.ts`, `app/api/newsletter/route.ts`, `lib/retention/reader-state.ts`, `components/retention/*`, `components/home/NewsletterBand.tsx`, `components/rxs/StoryShell.tsx`, `features/auth/components/ReaderDashboard.tsx`, `app/reader/page.tsx`.
- Tests: `tests/retention/retention.test.ts` (70 assertions, `npm test` chain green).
- Specs/audits: `audit/task-24/01…11`, `task.md`.