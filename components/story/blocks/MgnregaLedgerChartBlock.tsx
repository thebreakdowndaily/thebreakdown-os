import React from 'react';
import type { MgnregaLedgerData } from './types';

export default function MgnregaLedgerChartBlock(props: Partial<MgnregaLedgerData>) {
  const reportingPeriod = props.reportingPeriod || '2019–20 to 2023–24 (Five Financial Years)';
  const source = props.source || 'Comptroller and Auditor General of India, Report No. 4 of 2026 (Govt of MP)';

  return (
    <figure
      aria-labelledby="mgnrega-ledger-heading"
      className="my-10 p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-neutral-800 shadow-xl"
    >
      <header className="border-b border-neutral-800 pb-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-800/40">
            Audited Financial Statement
          </span>
          <span className="text-xs font-mono text-neutral-400">
            Period: {reportingPeriod}
          </span>
        </div>
        <h3 id="mgnrega-ledger-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          The Rural Wage Ledger: Liabilities, Rejections & Recoveries
        </h3>
        <p className="text-sm text-neutral-400 mt-1">
          Official figures from the performance audit of MGNREGA in Madhya Pradesh, tabled in the Vidhan Sabha on 22 July 2026.
        </p>
      </header>

      {/* 1. Main Liability Split Waterfall */}
      <div className="mb-8 p-5 rounded-xl bg-[#141414] border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-3">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase font-bold tracking-wider">
              Total Pending Liability (As of 31 March 2024)
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5">
              ₹1,217.05 <span className="text-lg font-normal text-neutral-400">Crore</span>
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-500 mt-1 sm:mt-0">
            Recorded in MPSEGC Audited Accounts
          </span>
        </div>

        {/* Visual Split Bar */}
        <div className="w-full h-4 rounded-full bg-neutral-800 overflow-hidden flex my-3">
          <div
            style={{ width: '46.4%' }}
            className="h-full bg-amber-500"
            title="Unpaid Wages: ₹564.76 Crore (46.4%)"
          />
          <div
            style={{ width: '53.6%' }}
            className="h-full bg-blue-500"
            title="Unpaid Materials: ₹652.29 Crore (53.6%)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-sm bg-amber-500 flex-shrink-0" />
            <div>
              <span className="text-neutral-400 block font-mono text-xs">Unpaid Wages to Workers</span>
              <strong className="text-white text-base font-mono">₹564.76 Crore</strong>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-sm bg-blue-500 flex-shrink-0" />
            <div>
              <span className="text-neutral-400 block font-mono text-xs">Unpaid Material Costs</span>
              <strong className="text-white text-base font-mono">₹652.29 Crore</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Blocked Transactions */}
        <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800">
          <span className="text-[11px] font-mono text-neutral-400 font-bold uppercase tracking-wider block mb-1">
            ABPS Rejections / Stalls
          </span>
          <div className="text-2xl font-bold font-mono text-white">₹54.79 Cr</div>
          <p className="text-xs text-neutral-400 mt-1 leading-snug">
            Across <strong>4,69,489 (4.7 Lakh)</strong> transactions blocked due to Aadhaar non-mapping.
          </p>
        </div>

        {/* Social Audit Observations */}
        <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800">
          <span className="text-[11px] font-mono text-neutral-400 font-bold uppercase tracking-wider block mb-1">
            Social Audit Paras
          </span>
          <div className="text-2xl font-bold font-mono text-white">89,066</div>
          <p className="text-xs text-neutral-400 mt-1 leading-snug">
            Generated across MP: 49.7k process, 22.1k deviations, 10.7k misappropriations, 6.6k record reconciliation.
          </p>
        </div>

        {/* Recovery Performance */}
        <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800">
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block mb-1">
            Recovery in Decided Cases
          </span>
          <div className="text-2xl font-bold font-mono text-white">98.4%</div>
          <p className="text-xs text-neutral-400 mt-1 leading-snug">
            <strong>4,450 of 4,521</strong> financial cases recovered (₹2.91 cr); 71 pending (₹33.37L).
          </p>
        </div>

        {/* Statutory 100 Days Target */}
        <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800">
          <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1">
            100 Days Completed
          </span>
          <div className="text-2xl font-bold font-mono text-white">1.95%</div>
          <p className="text-xs text-neutral-400 mt-1 leading-snug">
            Around two per cent of working households completed 100 days in 2023–24.
          </p>
        </div>
      </div>

      {/* Explanatory Caption */}
      <figcaption className="text-xs text-neutral-400 leading-relaxed border-t border-neutral-800 pt-4">
        <strong>Source Note:</strong> {source}. The ₹1,217.05 crore represents pending liabilities recorded on the audited balance sheet of the Madhya Pradesh State Employment Guarantee Council, not cash theft. The recovery rate demonstrates that administrative action succeeds when specific financial misappropriations are decided, but systemic payment backlogs persist across audit cycles.
      </figcaption>

      {/* Accessible Text Table Alternative for Screen Readers */}
      <div className="sr-only">
        <table>
          <caption>Audited MGNREGA Financial Figures (Madhya Pradesh, 2019–2024)</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Audited Value</th>
              <th scope="col">Administrative Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Total Outstanding Liability</th>
              <td>₹1,217.05 Crore</td>
              <td>Total pending state liability towards wages (₹564.76 cr) and materials (₹652.29 cr) as of March 2024.</td>
            </tr>
            <tr>
              <th scope="row">Blocked Aadhaar Transactions</th>
              <td>₹54.79 Crore (4,69,489 transactions)</td>
              <td>Wage payments stalled due to Aadhaar-Based Payment System mapping errors at bank/NPCI.</td>
            </tr>
            <tr>
              <th scope="row">Social Audit Paras Recorded</th>
              <td>89,066 Observations</td>
              <td>Procedural deviations and financial issues flagged across MP Gram Panchayats.</td>
            </tr>
            <tr>
              <th scope="row">Recoveries Completed</th>
              <td>4,450 out of 4,521 cases (98.4%)</td>
              <td>₹2.91 crore recovered in decided financial misappropriation cases; ₹33.37 lakh pending in 71 cases.</td>
            </tr>
            <tr>
              <th scope="row">Households Achieving 100 Days Work</th>
              <td>1.95% (Around 2%)</td>
              <td>Percentage of working rural households receiving the full 100-day statutory guarantee in 2023–24.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </figure>
  );
}
