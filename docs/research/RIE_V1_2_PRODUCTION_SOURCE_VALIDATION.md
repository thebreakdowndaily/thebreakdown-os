# RIE v1.2 — Production Source Validation

This record governs production delivery validation for the six authoritative
domains added by the v1.2 primary-source discovery intervention. Authority and
editorial approval are separate from transport validation: an authoritative
source may remain active in the source context while an unvalidated endpoint is
excluded from RSS polling.

| Source | Configured endpoint | Protocol | Validation | Production RSS readiness |
|---|---|---|---|---|
| MeitY | `https://meity.gov.in/` | HTML discovery surface | UNVALIDATED | Excluded. Investigation (2026-08-17) confirmed no official RSS/Atom/API endpoint exists. See MeitY investigation notes below. |
| UN Docs | `https://undocs.org/` | HTML discovery surface | UNVALIDATED | Excluded pending a documented API/feed endpoint. |
| Karnataka | `https://karnataka.gov.in/` | HTML discovery surface | UNVALIDATED | Excluded pending a documented machine-readable endpoint. |
| NGT | `https://greentribunal.gov.in/` | HTML discovery surface | UNVALIDATED | Excluded pending a documented machine-readable endpoint. |
| CMRS | `https://cmrs.gov.in/` | HTML discovery surface | UNVALIDATED | Excluded pending manual endpoint validation. |
| SEBI | `https://www.sebi.gov.in/sebirss.xml` | RSS | VALIDATED | Included in RSS polling. The public SEBI RSS documentation identifies this XML feed for press releases, circulars, and orders/rulings; authentication is not documented. Rate limits require operational confirmation before scheduling. |

## Health semantics

`HEALTHY_WITH_ITEMS` means a valid RSS/Atom feed returned at least one parsable
item. `HEALTHY_EMPTY` means a structurally valid feed returned no items. HTTP
failure is `UNAVAILABLE`; a structurally invalid RSS document is `INVALID_FEED`;
an XML parsing failure is `PARSE_ERROR`; aborted/timeout fetches are `TIMEOUT`;
HTML or another non-RSS/Atom response is `UNSUPPORTED`; an editorially active
source lacking endpoint validation is `UNVALIDATED`.

No live network request is required by the test suite. Tests use injected
fixtures, while endpoint provenance is reviewed separately.

## MeitY endpoint investigation (2026-08-17)

The official MeitY website (meity.gov.in) is a Next.js client-side rendered
application. Investigation confirmed:

**Candidate endpoints tested (all failed):**

| Candidate | Result | Evidence |
|-----------|--------|----------|
| `/feed` | Empty response | HTTP 200, body empty |
| `/rss` | Empty response | HTTP 200, body empty |
| `/rss.xml` | Empty response | HTTP 200, body empty |
| `/atom.xml` | Empty response | HTTP 200, body empty |
| `/feed.xml` | Empty response | HTTP 200, body empty |
| `/data/rss` | Empty response | HTTP 200, body empty |
| `/data/feed` | Empty response | HTTP 200, body empty |
| `/documents/feed` | Empty response | HTTP 200, body empty |
| `/web/guest/rss` | 404 | Not found |
| `/data/whats-new` | Empty response | HTTP 200, body empty |
| `/data/whats-new/rss` | 404 | Not found |
| `/data/press-releases/feed` | 404 | Not found |
| `/api/documents` | Empty response | HTTP 200, body empty |
| `/wp-json` | Empty response | Not WordPress |
| `www.meity.gov.in/rss` | Empty response | HTTP 200, body empty |
| `www.meity.gov.in/data/rss.xml` | Empty response | HTTP 200, body empty |
| `data.meity.gov.in` | Transport error | Domain unreachable |

**HTML analysis:**
- Homepage contains no `<link rel="alternate" type="application/rss+xml">` tags
- Homepage contains no `<link rel="alternate" type="application/atom+xml">` tags
- `robots.txt` is minimal (`Allow: /`), no RSS references
- `sitemap.xml` exists but contains no feed references

**Third-party evidence:**
- No official MeitY RSS/Atom feed is documented anywhere on the site
- Third-party RSS generators (e.g. newsloth.com) offer to scrape the site,
  but these are not official endpoints
- API Setu (apisetu.gov.in) is a MeitY platform but provides service-delivery
  APIs, not a document/news feed
- data.gov.in provides dataset APIs but not MeitY-specific document feeds

**Conclusion:** MeitY does not publish an official, stable RSS/Atom/API
endpoint suitable for deterministic production discovery. The source remains
`UNVALIDATED` with `discoveryProtocol: 'HTML'`. No adapter work is warranted
until an official endpoint is documented by MeitY.
