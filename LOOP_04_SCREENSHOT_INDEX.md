# THE BREAKDOWN — LOOP 04 SCREENSHOT INDEX

**Domain:** `https://thebreakdown.in`  
**Production Deployment:** `dpl_5w5JG33jDqHLtjPU1q9pGCfN668J`  
**Release Commit:** `9c3bceb`  
**Date:** 2026-09-27  
**Capture Engine:** Playwright Chromium (Headless)  

---

## 1. Multi-Viewport Capture Matrix

| Target Route | Viewport | Resolution | File Name | HTTP Status | Visual Integrity Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` (Homepage) | Mobile | 375x812 | `homepage-mobile-375.png` | 200 | PASS — Clean masthead, hero rendering, zero horizontal scroll |
| `/` (Homepage) | Mobile | 390x844 | `homepage-mobile-390.png` | 200 | PASS — Responsive typography, proper card wrapping |
| `/` (Homepage) | Tablet | 768x1024 | `homepage-tablet-768.png` | 200 | PASS — 2-column grid alignment, crisp SVG accents |
| `/` (Homepage) | Desktop | 1440x900 | `homepage-desktop-1440.png` | 200 | PASS — 3-column layout, edge-to-edge balance |
| `/stories` | Mobile | 375x812 | `stories-mobile-375.png` | 200 | PASS — Story card thumbnail grid, clean badge metadata |
| `/stories` | Mobile | 390x844 | `stories-mobile-390.png` | 200 | PASS — Clean thumbnail alignment, no layout shift |
| `/stories` | Tablet | 768x1024 | `stories-tablet-768.png` | 200 | PASS — Multi-row card grid |
| `/stories` | Desktop | 1440x900 | `stories-desktop-1440.png` | 200 | PASS — Full directory view with search and filter controls |
| `/story/accountability-in-india` | Mobile | 375x812 | `accountability-story-mobile-375.png` | 200 | PASS — High-res hero JPEG renders crisply, readable lede |
| `/story/accountability-in-india` | Mobile | 390x844 | `accountability-story-mobile-390.png` | 200 | PASS — Proportional hero scaling, no letterboxing |
| `/story/accountability-in-india` | Tablet | 768x1024 | `accountability-story-tablet-768.png` | 200 | PASS — Sidebar layout, responsive typography |
| `/story/accountability-in-india` | Desktop | 1440x900 | `accountability-story-desktop-1440.png` | 200 | PASS — Golden editorial presentation, verified visual package |
| `/story/mgnrega-reform` | Mobile | 375x812 | `mgnrega-story-mobile-375.png` | 200 | PASS — Category placeholder and interactive tracker intact |
| `/story/mgnrega-reform` | Mobile | 390x844 | `mgnrega-story-mobile-390.png` | 200 | PASS — Tracker metric labels fit without truncation |
| `/story/mgnrega-reform` | Tablet | 768x1024 | `mgnrega-story-tablet-768.png` | 200 | PASS — Time-series interactive chart renders smoothly |
| `/story/mgnrega-reform` | Desktop | 1440x900 | `mgnrega-story-desktop-1440.png` | 200 | PASS — Full chart toolbar and evidence citations |
| `/entity/who` | Mobile | 375x812 | `entity-who-mobile-375.png` | 200 | PASS — Authentic dark-mode insignia JPEG decoded (VIS-001 fixed) |
| `/entity/who` | Mobile | 390x844 | `entity-who-mobile-390.png` | 200 | PASS — Clean avatar circle / header card |
| `/entity/who` | Tablet | 768x1024 | `entity-who-tablet-768.png` | 200 | PASS — Two-column entity profile layout |
| `/entity/who` | Desktop | 1440x900 | `entity-who-desktop-1440.png` | 200 | PASS — Entity relations graph and verified citations |
| `/series/.../chapter-1` | Mobile | 375x812 | `chapter-1-mobile-375.png` | 200 | PASS — Historical vector maps scale with viewBox preservation |
| `/series/.../chapter-1` | Mobile | 390x844 | `chapter-1-mobile-390.png` | 200 | PASS — Map legend reflows without obscuring cartography |
| `/series/.../chapter-1` | Tablet | 768x1024 | `chapter-1-tablet-768.png` | 200 | PASS — Dual map comparison panels render side-by-side |
| `/series/.../chapter-1` | Desktop | 1440x900 | `chapter-1-desktop-1440.png` | 200 | PASS — Full Founding Chapter 001 monograph presentation |

---

## 2. Forensic Findings from Visual Render Probes

1. **Entity Image Decode Restoration (VIS-001):**
   - Previous state: `public/images/entities/who.jpg`, `wto.jpg`, `ministry-of-finance.jpg` failed browser image decoding because they were HTML scrape errors disguised as `.jpg`.
   - Current verified state: Browsers render authentic 800x450 dark-mode insignia cards encoded as progressive MozJPEGs (`ffd8ffdb`). Zero decode errors, zero console warnings.
2. **Social OpenGraph Raster Normalization (VIS-002):**
   - Previous state: `og-default.jpg` and `og-home.jpg` were SVG vectors inside `.jpg` filenames, breaking OpenGraph scrapers on WhatsApp, LinkedIn, and Twitter.
   - Current verified state: 1200x630 progressive MozJPEG raster files served with `Content-Type: image/jpeg` header and HTTP 200.
3. **MIME Integrity & Performance Budget (VIS-003):**
   - All public image assets strictly adhere to file extension magic byte signatures.
   - All 121 public image assets strictly adhere to the <500KB performance budget (largest asset is `sup-03-...jpg` at 330KB).
4. **SVG Accessibility Attributes (VIS-004):**
   - 100% of SVGs (37/37) include valid `<title>` and `<desc>` tags with appropriate semantic roles and `viewBox` coordinates. Zero `<script>` or external HTTP resources detected.
