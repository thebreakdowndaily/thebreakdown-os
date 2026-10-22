---
title: Story image integrity audit
date: 2026-10-22
status: remediation-in-progress
owner: editorial-engineering
---

# Story image integrity audit — 2026-10-22

## Scope and evidence

Read-only audit of the production `public.stories` table, repository story seed records, the verified image manifest, CMS save path, public story presentation model, and image-context matcher.

The production database query returned 41 published records excluding test artifacts, 31 distinct hero-image paths, 9 paths containing `placeholder`, 38 records with empty `hero_image_alt`, and 38 records marked `hero_image_is_decorative = true`.

Repeated URLs alone are not proof of a mismatch: some stories are legitimately related. The following clusters are candidates for visual review; cross-topic assignments below are confirmed from the associated story titles and the asset/manifest descriptions.

## Confirmed cross-topic assignments

| Story | Current production hero path | Finding | Intended seed replacement |
|---|---|---|---|
| `india-ev-paradox` | `/images/stories/climate-finance.jpg` | EV charging and battery supply-chain article assigned a climate-finance visual | `/images/stories/india-ev-paradox.svg` |
| `india-indonesia-relations` | `/images/stories/india-europe-relations.jpg` | Indonesia bilateral article assigned an EU summit visual | `/images/stories/india-indonesia-relations.svg` |
| `india-uk-relations` | `/images/stories/india-europe-relations.jpg` | UK bilateral article assigned an EU summit visual | `/images/stories/india-uk-relations.svg` |

The three replacement assets are original The Breakdown vector illustrations, not documentary photographs. The asset manifest explicitly records their type, provenance, license and description. Each seed record has meaningful alt text and is marked non-decorative.

**Production is not yet repaired.** The production rows still contain the old paths because the new public assets must first be approved and deployed. After that, the three rows must be updated in a separate reviewed data operation, including `hero_image_alt` and `hero_image_is_decorative`.

## Repeated image path clusters

These are not all confirmed errors; they require editorial review for relevance and visual repetition.

| Reused path | Published stories | Assessment |
|---|---|---|
| `/images/placeholders/economy-placeholder.svg` | `income-inequality-india`, `mgnrega-reform`, `supply-chain-shift` | Generic; should be replaced with story-specific visuals over time |
| `/images/stories/india-china-border-tensions.jpg` | `india-china-border-lac`, `india-china-border-tensions`, `india-china-relations` | Related topics, but repetition and border-only framing should be reviewed |
| `/images/stories/india-europe-relations.jpg` | `india-europe-relations`, `india-indonesia-relations`, `india-uk-relations` | Two cross-topic assignments confirmed and corrected in seed data |
| `/images/placeholders/policy-placeholder.svg` | `bjp-mission-360`, `india-russia-relations` | Generic placeholders; not evidence of a cross-topic mismatch by themselves |
| `/images/placeholders/technology-placeholder.svg` | `india-5g-rollout`, `semiconductor-pli` | Generic placeholders; should be improved with topic-specific assets |
| `/images/stories/climate-finance.jpg` | `climate-finance`, `india-ev-paradox` | Climate image valid for one story, confirmed mismatched for the EV story |
| `/images/topics/health.jpg` | `ayushman-bharat`, `who-cancer-report-2026` | Broad category visual; verify specificity and consider separate assets |

## Root causes found in code

1. The CMS hero editor updates a nested hero block, but the save action previously persisted the old top-level `Story.heroImage`. The public renderer consumes that top-level field.
2. The CMS route did not synthesize an editable hero block for legacy stories whose image existed only on the canonical story record.
3. The story seed data had cross-topic image assignments.
4. Image matching could accept an image from generic token overlap such as “India” and “relations”; publication did not call a story-image context gate.

## Code remediation in PR #131

- Synchronize the editor's hero image with the canonical `Story.heroImage`.
- Synthesize a CMS hero block for legacy stories while preserving narrative block order.
- Keep the CMS-only hero metadata block out of narrative content.
- Correct the three confirmed seed assignments to story-specific original illustrations.
- Exclude broad country/relationship terms from semantic image-match approval.
- Add publication Gate 13 to reject a supplied hero image that fails story-context matching; the evidence-vault verification is Gate 14.
- Add regression tests for image synchronization, context mismatch, manifest consistency, alt text, local SVG validity and the publication gate.

## Required production follow-up

1. Merge and deploy PR #131 only after review and successful CI. Vercel preview attempts have reported a build-rate-limit block; this is separate from a source-code build result.
2. Update the three confirmed production records only after the SVG assets are live. Do not point production records at not-yet-deployed paths.
3. Verify all three public story routes and rendered hero requests after the database update.
4. Run a complete production image audit for all 41 records. The 38 empty alt descriptions and decorative flags need individual review; do not blindly mark every image informative or decorative without looking at its purpose.
5. Review the other duplicate clusters and the nine generic placeholders. Do not infer mismatch from reuse alone.

No production records or deployments were changed as part of this audit.
