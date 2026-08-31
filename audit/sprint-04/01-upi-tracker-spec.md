# UPI & Digital Payments Tracker Specification

Status: Shipped & Active
Subject: Unified Payments Interface (UPI) & Digital Rails
Date: 31 Aug 2026
Governance: AGENTS.md v1.0 — Platform Beta / Evidence Spine Doctrine

---

## 1. System Objective

The UPI & Digital Payments Tracker provides structured, continuous intelligence on India's retail payments architecture. It monitors transaction throughput, regulatory limits, feature phone inclusion (UPI123Pay), zero Merchant Discount Rate (MDR) rules, and international market linkage.

---

## 2. Information Architecture & Integration

- **Route**: [`/trackers/upi`](file:///C:/newsjack-content/thebreakdown-os/app/trackers/upi/page.tsx)
- **Data Definition**: [`lib/trackers/upi-tracker.ts`](file:///C:/newsjack-content/thebreakdown-os/lib/trackers/upi-tracker.ts)
- **Central Registry**: Indexed in [`lib/trackers/registry.ts`](file:///C:/newsjack-content/thebreakdown-os/lib/trackers/registry.ts)
- **Topic Integration**: Cross-linked under `/topic/digital-payments` and `/topic/technology`
- **Companion Story**: Cross-linked with `/story/digital-payments-boom`
- **Entities**: Connected to `/entity/npci` (National Payments Corporation of India) and `/entity/rbi` (Reserve Bank of India)

---

## 3. Quantitative Series Monitored

1. **Annual Transaction Volume (2016–2026)**: Historical expansion from 0.02B in FY17 to 185.2B in FY26.
2. **Annual Transaction Turnover Value (2016–2026)**: Value growth from ₹0.07L Cr in FY17 to ₹260.4L Cr in FY26.
3. **Regulatory Limit Configuration**: Tracking UPI123Pay ₹10,000 transaction ceiling and UPI Lite auto-replenishment rules.
