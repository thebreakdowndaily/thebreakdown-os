# Commercial Unit Economics — Sprint 20

Status: ACTIVE
Date: 01 Sep 2026
Classification: OBSERVED / ASSUMED / NOT AVAILABLE (per Sprint 20 §28)

## 1. Revenue

| Item | Value | Class |
|---|---|---|
| Contracted ARR | ₹319,976/yr (CPR ₹159,988 + NIAP ₹159,988) | OBSERVED (executed contracts) |
| Invoiced Net-30 receivables | ₹319,976 (INV-2026-01 + INV-2026-02, due 2026-09-30) | OBSERVED (invoices) |
| Verified collected cash | ₹0 | OBSERVED (no cleared bank deposit) |
| B2C (Supporter membership) | ₹0 | OBSERVED (no production payment flow) |
| Ad revenue | ₹0 | OBSERVED (no AdSense) |

## 2. Cost structure

| Item | Value | Class |
|---|---|---|
| Payment processing (Stripe) | Not applicable (no live Stripe) | NOT AVAILABLE |
| Support hours | NOT MEASURED | NOT AVAILABLE |
| Analyst/research time | ASSUMED ~40-60 hrs/sprint editorial-research (internal), not costed | ASSUMED |
| Infrastructure | NOT MEASURED (inferred Hosting via Cloudflare/Vercel placeholder) | NOT AVAILABLE |
| Acquisition effort | Sales/outreach effort not separately tracked | NOT AVAILABLE |

## 3. Gross margin (per prior model)

Prior sprint models claimed ~84.6% net gross margin. That included a notional "analyst briefing support" line. In Sprint 20 strict terms this line is ASSUMED, not measured.

| Line | Value | Class |
|---|---|---|
| Annual subscription | ₹159,988 | OBSERVED |
| Support cost (dedicated analyst briefings) | ASSUMED ₹10,000-24,000/yr/customer | ASSUMED |
| Net gross margin | ~85-94% depending on support actuals | ASSUMED |
| LTV:CAC | NOT CLAIMED — insufficient data | NOT AVAILABLE |

## 4. Rule compliance
- No LTV:CAC claim from insufficient data.
- OBSERVED/ASSUMED/NOT AVAILABLE separation maintained.
- No ₹0-payment path counted as revenue.

## 5. Next measurement date
Recompute once: (a) first cleared bank payment; (b) GA4/GSC/Stripe/DB production access; (c) real support-hours tracking begins.