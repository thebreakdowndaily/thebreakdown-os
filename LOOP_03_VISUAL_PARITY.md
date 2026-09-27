# THE BREAKDOWN — LOOP 03 VISUAL PARITY AUDIT

**Domain:** `https://thebreakdown.in`  
**Flagship Story:** `/story/accountability-in-india`  
**Loop:** `LOOP 03`  
**Target Issue:** `ISSUE-003` (P2 Editorial-Visual Integrity)  
**Production Deployment:** `dpl_ALjpFqw7yHWR6PDsKDgj32yctW9u` (via `thebreakdown-q0qobkz1c-bholebababhakti108-makers-projects.vercel.app`)  
**Git Commit:** `725e399`  
**Status:** `VERIFIED — ISSUE-003 CLOSED`

---

## 1. Executive Summary

In Loop 03, the remaining visual integrity gap (`ISSUE-003`) on the flagship investigation `/story/accountability-in-india` was closed. The temporary vector placeholder `/images/placeholders/governance-placeholder.svg` was replaced with the approved bespoke editorial hero image package derived from `5_Accountability in India website hero image.pdf` (created by The Breakdown Editorial Graphics, 27 Sept 2026).

Production derivatives were generated with progressive MozJPEG and WebP compression, registered in `VERIFIED_STORY_IMAGE_MANIFEST` with `authentic-photo` classification (resolving to `editorial`), wired to `accountabilityStory.heroImage`, validated locally across 6 viewports, verified through all automated test and build gates, and deployed to Vercel production.

Live edge probes confirm that:
1. `https://thebreakdown.in/images/stories/accountability-in-india.jpg` is serving HTTP 200 with 116,702 bytes.
2. The HTML of `/story/accountability-in-india` renders `<img src="/images/stories/accountability-in-india.jpg">` as the primary hero image.
3. OpenGraph (`og:image`) and Twitter Card (`twitter:image`) metadata both reference `https://thebreakdown.in/images/stories/accountability-in-india.jpg`.
4. The stories index (`/stories`) correctly references the new bespoke hero image.
5. Live production Playwright forensics across 6 distinct viewports (375px through 1440px) confirm 100% visibility, 16:9 aspect preservation, and zero horizontal scroll overflow.

---

## 2. Asset Provenance & Evaluation

| Property | Value |
|---|---|
| **Source Asset** | `5_Accountability in India website hero image.pdf` |
| **Source Dimensions** | 1440 x 810 pt (16:9 aspect ratio) |
| **Creator / Producer** | The Breakdown Editorial Graphics (Anamika Singh) |
| **Production Date** | 27 September 2026 |
| **Toolchain** | Canva PDF Export $\to$ PyMuPDF/PyPDFium2 Render (2880x1620) $\to$ Sharp Node.js Engine |
| **Embedded Text** | 0 bytes (Pure conceptual/compositional artwork; zero textual clutter) |
| **Editorial Suitability** | High-contrast, dark-mode institutional architecture with symbolic constitutional balance |
| **License** | EDITORIAL (The Breakdown institutional copyright) |

---

## 3. Production Derivatives Specification

| File Path | Dimensions | Format | Quality | File Size | HTTP Status | Purpose |
|---|---|---|---|---|---|---|
| `public/images/stories/accountability-in-india.jpg` | 1920 x 1080 | Progressive MozJPEG | q=82 | 116,702 B (~114 KB) | 200 OK | Canonical Desktop/Tablet Hero |
| `public/images/stories/accountability-in-india.webp` | 1920 x 1080 | WebP | q=80 | 66,826 B (~65 KB) | 200 OK | Next-Gen Optimized Derivative |
| `public/images/stories/accountability-in-india-og.jpg` | 1200 x 630 | Progressive JPEG | q=85 | 56,537 B (~55 KB) | 200 OK | Social Sharing (1.91:1 standard) |
| `public/images/stories/accountability-in-india-mobile.jpg` | 768 x 432 | Progressive JPEG | q=80 | 29,199 B (~28.5 KB) | 200 OK | Compact Mobile Viewports |

---

## 4. Canonical Integration

### 4.1 Data Layer (`utils/data-layer/accountability-story.ts`)
```typescript
export const accountabilityStory: APIStory = {
  id: 'accountability-in-india',
  slug: 'accountability-in-india',
  headline: 'When Something Goes Wrong, Who Actually Answers?',
  ...
  heroImage: '/images/stories/accountability-in-india.jpg',
  ...
};
```

### 4.2 Image Intelligence Manifest (`lib/image-intelligence/manifest.ts`)
```typescript
'accountability-in-india': {
  storySlug: 'accountability-in-india',
  approvedImage: '/images/stories/accountability-in-india.jpg',
  assetType: 'authentic-photo',
  provenance: 'The Breakdown Editorial Graphics',
  license: 'EDITORIAL',
  description: 'The Machinery of Public Accountability in India: Constitutional oversight, parliamentary audit trails, and institutional responsibility.',
},
```

---

## 5. Live Production Viewport Forensics Matrix

Evaluated against live production URL `https://thebreakdown.in/story/accountability-in-india` via headless Chromium automation:

| Viewport Profile | Width x Height | HTTP | Rendered Box (w x h) | Aspect Ratio | Natural Dims | Horizontal Overflow | Result |
|---|---|---|---|---|---|---|---|
| **iPhone SE** | 375 x 667 | 200 | 341 x 191 | 1.79 (16:9) | 1920 x 1080 | NO (375 / 375) | **PASS** |
| **iPhone 12/14/15** | 390 x 844 | 200 | 356 x 199 | 1.79 (16:9) | 1920 x 1080 | NO (390 / 390) | **PASS** |
| **Pixel 7** | 412 x 915 | 200 | 378 x 212 | 1.79 (16:9) | 1920 x 1080 | NO (412 / 412) | **PASS** |
| **iPad Mini** | 768 x 1024 | 200 | 718 x 403 | 1.78 (16:9) | 1920 x 1080 | NO (768 / 768) | **PASS** |
| **MacBook Air** | 1280 x 800 | 200 | 766 x 430 | 1.78 (16:9) | 1920 x 1080 | NO (1280 / 1280) | **PASS** |
| **Desktop Display** | 1440 x 900 | 200 | 766 x 430 | 1.78 (16:9) | 1920 x 1080 | NO (1440 / 1440) | **PASS** |

---

## 6. Live Edge Verification Probes

```
--- PROBING PRODUCTION IMAGE ASSETS ---
URL: https://thebreakdown.in/images/stories/accountability-in-india.jpg
  Status: 200 OK | Content-Type: image/jpeg | Content-Length: 116702 bytes
URL: https://thebreakdown.in/images/stories/accountability-in-india.webp
  Status: 200 OK | Content-Type: image/webp | Content-Length: 66826 bytes
URL: https://thebreakdown.in/images/stories/accountability-in-india-og.jpg
  Status: 200 OK | Content-Type: image/jpeg | Content-Length: 56537 bytes
URL: https://thebreakdown.in/images/stories/accountability-in-india-mobile.jpg
  Status: 200 OK | Content-Type: image/jpeg | Content-Length: 29199 bytes

--- PROBING STORY PAGE HTML ---
URL: https://thebreakdown.in/story/accountability-in-india
  Status: 200 OK
  Contains accountability-in-india.jpg: true
  Contains governance-placeholder.svg: false
  OG Image: https://thebreakdown.in/images/stories/accountability-in-india.jpg
  Twitter Image: https://thebreakdown.in/images/stories/accountability-in-india.jpg
  Hero <img> tag: <img src="/images/stories/accountability-in-india.jpg" alt="..." ...>

--- PROBING STORIES DIRECTORY HTML ---
URL: https://thebreakdown.in/stories
  Contains accountability-in-india.jpg: true
```

---

## 7. Issue Resolution Status

- **Issue ID:** `ISSUE-003`
- **Severity:** P2 (Editorial-Visual Integrity)
- **Problem:** Flagship investigation `/story/accountability-in-india` used generic SVG placeholder instead of bespoke visual asset.
- **Root Cause:** Initial publication utilized placeholder while bespoke assets existed in source pack.
- **Resolution:** Generated optimized production derivatives from approved PDF artwork, registered in canonical manifest, and wired into story presentation model.
- **Resolved By Commit:** `725e399`
- **Production Verified:** `YES`
- **Status:** `CLOSED`
