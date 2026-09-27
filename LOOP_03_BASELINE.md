# THE BREAKDOWN — LOOP 03 BASELINE REPORT

**Date:** 2026-09-27T20:40:00+05:30  
**Loop Iteration:** Loop 03  
**Domain:** `https://thebreakdown.in`  
**Target Investigation:** `/story/accountability-in-india`  
**Operating Protocol:** Closed-Loop Engineering & Visual Integrity  

---

## 1. Baseline Identity
- **Baseline Git Commit:** `50b0b5471562b7a3ee0168817533ed6b68de5714`
- **Active Git Branch:** `main` (clean working tree, up to date with `origin/main`)
- **Active Production Deployment:** `dpl_2i8DJHkHXRPqWsWjgpJoCTdmrwH2`
- **Edge Deployment Aliases:**
  - `https://thebreakdown.in`
  - `https://thebreakdown-545l8m571-bholebababhakti108-makers-projects.vercel.app`

---

## 2. Current Hero Asset Specifications
- **Current Hero Asset Path:** `/images/placeholders/governance-placeholder.svg`
- **On-Disk Path:** `public/images/placeholders/governance-placeholder.svg`
- **Format:** SVG Vector (XML)
- **ViewBox / Dimensions:** `0 0 1200 630` (1.905:1 aspect ratio)
- **File Size:** 3,786 bytes (3.7 KB)
- **Visual Classification:** `BRANDED_VECTOR` / `branded-placeholder`
- **Visual Description:** Geometric dark-mode governance card with abstract institutional grid lines and balance scales.
- **Editorial Provenance:** The Breakdown Editorial Graphics

---

## 3. Current Live Presentation & Metadata State
- **Article Hero Container:** `<StoryHeroCanonical>` with `aspect-video rounded-2xl` rendering `hero.heroMedia.url`.
- **OpenGraph Image:** Declared in `buildStoryMetadata('accountability-in-india')` as `[{ url: '/images/placeholders/governance-placeholder.svg', width: 1200, height: 630 }]`.
- **Twitter Card:** `summary_large_image` referencing `/images/placeholders/governance-placeholder.svg`.
- **Image Intelligence Registration:**
  - In `lib/image-intelligence/manifest.ts`: Registered as `branded-placeholder`.
  - In `lib/image-intelligence/context-matcher.ts`: Category mapped to `governance-placeholder.svg`.

---

## 4. Problem Statement & Loop Objective
- **Problem (`ISSUE-003`):** The flagship investigative explainer `/story/accountability-in-india` (3,220 words, 9 acts, CAG audit extracts, interactive ledgers) is served with a generic geometric placeholder, while a bespoke, approved visual package was created specifically for it in the editorial source pack.
- **Loop 03 Objective:** Integrate the approved, bespoke visual asset (`5_Accountability in India website hero image.pdf`), produce high-fidelity optimized production derivatives, update canonical models and manifests, verify locally and at edge, and close `ISSUE-003`.
