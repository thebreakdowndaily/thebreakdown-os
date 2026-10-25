# BCCI/Ranji story pilot — editorial and technical acceptance dossier

**Date:** 25 October 2026  
**Scope:** One story only — `bcci-domestic-mandate-ranji-economics`  
**Base:** P0 candidate `0347a0c5ff283e8c969133ff247d43f237a3eebe`  
**Branch:** `pilot/bcci-ranji-story-end-to-end-2026-10-25`  
**State:** Draft review candidate. Do not publish, merge, or lift the existing release hold as part of this pilot.

## Editorial decision

Reframe the story as an evidence-led analysis, not an investigation claiming a measured causal effect. The public documents establish the BCCI's February 2024 message, the annual contract announcement, the domestic fee table, the Test incentive scheme, and the announced 2026–27 competition structure. They do not establish a causal estimate of how much the 2024 intervention changed participation.

## Primary-source and reporting checks

1. BCCI's 28 February 2024 annual-contract release says Iyer and Kishan were not considered in that round and recommends that players prioritise domestic cricket while not representing the national team. The release does not itself say “stripped existing contracts” or explicitly name the reason for the omissions.
2. The Indian Express reported on 17 February 2024 that Jay Shah had written to centrally contracted and India A players; it attributes to that letter the warning that domestic performance remained a selection yardstick and non-participation could have severe implications. This is reporting on the letter, not a public regulation published alongside the contract list.
3. BCCI's 20 September 2021 Apex Council update lists senior men's domestic rates of ₹40,000, ₹50,000 and ₹60,000 per day across match-count bands, with different rates for reserves. The table says “matches”; the story does not mislabel it as first-class-only experience.
4. The New Indian Express reported in May 2026 that the same senior men's rates were still in use. The story describes the 2021 BCCI publication as the latest public BCCI rate table located and qualifies the current-rate claim.
5. BCCI's March 2024 Test Cricket Incentive Scheme sets additional per-match bonuses for a season assumed to contain nine Tests. Its published table lists fewer than four, five and six, and seven or more Tests; exactly four Tests are not classified in that table. The story flags the ambiguity rather than filling it in.
6. BCCI's 2026–27 domestic calendar lists seven league matches per Ranji Trophy Elite team and five for a Plate team. The fee calculation is explicitly presented as a 28-scheduled-day scenario, not guaranteed salary.

## Image treatment

The hero remains the locally stored photograph of the Ranji Trophy, with provenance and public-domain basis recorded in the image manifest. The supporting fee graphic remains an original Breakdown SVG, but its wording is corrected: the BCCI table's band is match count, not first-class match experience. Its caption states that the daily rate is not annual salary. The licensing record is linked to Wikimedia Commons.

## Engineering changes in this pilot

- A shared narrative-depth target is enforced by the synchronous publication gate independently of reading-time consistency.
- The publication gate and presentation model now use the same narrative word counter and reading-time estimator.
- The BCCI story is classified as `analysis`, so feature-specific hero and visual controls apply independently of the release-hold list.
- The story uses direct source URLs, precise wording, a six-chapter narrative, one supporting data graphic, a transparent earnings scenario, and no unsupported 42% participation claim.
- The evidence appendix no longer labels secondary reporting as “primary sources.”

## Remaining blockers before publication

- A human editor must inspect and sign off on the final prose, all claim wording, the rendered hero/caption, the SVG chart and the final responsive page.
- Non-legacy claims must have actual Evidence Vault archive identities and verified/locked artifacts. This patch does not invent archive IDs or bypass that control.
- The Gold Standard Review must be completed by authorised reviewers independent of the author and bound to the exact content fingerprint.
- Run current-head CI and inspect the actual 390px mobile and 1440px desktop preview, including image loads, reading time, source drawer, and no console errors.
- Keep the BCCI story quarantined until those items pass. No production data or production deployment is changed by this branch.
