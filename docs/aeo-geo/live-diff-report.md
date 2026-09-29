# The Breakdown OS — Live Production Diff Report (AEO/GEO Promotion)

**Audit Date:** 2026-09-29  
**Production Domain:** `https://thebreakdown.in`  
**Old Production Deployment:** `dpl_EDBBoUVowqmDH2nqfiPyuLVzTbhG` (commit `7f43920`, Loop 6)  
**New Production Deployment:** `dpl_BdsXRWprZM6VxQjzpauTz4egs2UF` (commit `9088511`, AEO/GEO Engine)  
**Vercel Project:** `thebreakdown-os` (`prj_WcVDpSso6PPWWOPKwoBRC9lm0huO`)  
**Methodology:** Live public HTTPS requests executed against `https://thebreakdown.in`. All "After promotion" values are measured directly from the live public Internet.

---

## 1. Live Production Diff Matrix

| Surface | Before Promotion | After Promotion (Live Measured) | Expected? | Verification Status |
|---|---|---|---|---|
| **`/news-sitemap.xml`** | `404 Not Found` (HTML error page) | `200 OK` (XML 588 bytes, `xmlns:news` schema) | Yes | ✅ **PASS** (Confirmed active on public web) |
| **`/llms.txt`** | `404 Not Found` (HTML error page) | `200 OK` (Text 2,069 bytes, Markdown manifest) | Yes | ✅ **PASS** (Confirmed active on public web) |
| **Editorial Constitution Canonical** | `https://thebreakdown.in` (Root drift) | `https://thebreakdown.in/editorial-constitution` | Yes | ✅ **PASS** (Canonical tag matches self) |
| **Story Author Schema** | `{"@type":"Organization","name":"The Breakdown Editorial"}` (no URL) | `{"@type":"Organization","name":"The Breakdown","url":"https://thebreakdown.in"}` | Yes | ✅ **PASS** (Emits canonical publisher/author URL) |
| **Story FAQPage Schema** | Missing / Not emitted | Active (`[#5] @type: FAQPage` present in live HTML) | Yes | ✅ **PASS** (Rich answer engine snippet schema active) |
| **Organization Schema Trust Signals** | `publishingPrinciples: NONE`, `correctionsPolicy: NONE` | `publishingPrinciples: .../editorial-constitution`, `correctionsPolicy: .../trust` | Yes | ✅ **PASS** (Trust signals declared in JSON-LD) |
| **Entity Schema (`/entity/wto`)** | Basic metadata | `200 OK`, Thing / Organization JSON-LD with sameAs references | Yes | ✅ **PASS** (106KB payload, valid entity schema) |
| **Standard Sitemap (`/sitemap.xml`)** | `200 OK` (22,046 bytes) | `200 OK` (22,046 bytes, valid XML) | Yes | ✅ **PASS** (No regression to standard indexing) |
| **Robots.txt (`/robots.txt`)** | Allowed standard paths, no news-sitemap | `200 OK`, allows standard paths, declares `/sitemap.xml` and `/news-sitemap.xml` | Yes | ✅ **PASS** (Google News discovery unblocked) |

---

## 2. Forensic Header & Payload Comparison

### `/news-sitemap.xml`
- **Before:** HTTP 404, Content-Type: `text/html; charset=utf-8`, 48,125 bytes.
- **After:** HTTP 200, Content-Type: `application/xml; charset=utf-8`, 588 bytes.
- **Payload Snippet:**
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    <url>
      <loc>https://thebreakdown.in/story/accountability-in-india</loc>
      <news:news>
        <news:publication>
          <news:name>The Breakdown</news:name>
          <news:language>en</news:language>
        </news:publication>
        <news:publication_date>2026-09-28T09:30:00.000Z</news:publication_date>
        <news:title>Accountability in India: Institutional Checks and Balances</news:title>
      </news:news>
    </url>
  </urlset>
  ```

### `/llms.txt`
- **Before:** HTTP 404, Content-Type: `text/html; charset=utf-8`, 48,125 bytes.
- **After:** HTTP 200, Content-Type: `text/plain; charset=utf-8`, 2,069 bytes.
- **Payload Snippet:**
  ```markdown
  # The Breakdown

  > Independent, evidence-backed journalism on Indian policy, politics, and society.

  The Breakdown is a knowledge platform that produces deeply reported, structured journalism
  on Indian affairs. All content follows the Editorial Constitution, requiring primary source
  verification, multi-perspective historiography, and structured claim-evidence mapping.
  ```

### Editorial Constitution Canonical Tag
- **Before:** `<link rel="canonical" href="https://thebreakdown.in"/>` (Erroneous root canonical)
- **After:** `<link rel="canonical" href="https://thebreakdown.in/editorial-constitution"/>` (Exact self-canonical)

---

## 3. Security & Injection Verification on Live Markup

Probed live rendered markup across `/story/mgnrega-reform`, `/story/rbi-repo-rate`, and `/series/.../indias-inheritance`:
- **SSRF Immunity:** Checked all embedded `sameAs`, `citation`, `author`, `publisher`, and `itemReviewed` URLs. Zero instances of `169.254.`, `127.0.0.1`, `0.0.0.0`, or private IP ranges.
- **JSON-LD Validity:** All `<script type="application/ld+json">` blocks parse cleanly with native `JSON.parse()`. No malformed JSON, unescaped quotes, or syntax errors.
