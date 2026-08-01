import type { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import IntelligenceDashboardView from '@/components/editorial/IntelligenceDashboardView';
import { EditorialDashboardProjection } from '@/services/intelligence/editorial-dashboard.service';
import { ResearchSupportService } from '@/services/intelligence/research-support.service';
import { GoldStandardAuditService } from '@/services/editorial/gold-standard-audit.service';
import { CHAPTER_1_PACKAGE } from '@/lib/editorial/chapter-1-data';
import { CHAPTER_1_FIX } from '@/lib/editorial/chapter-1-data';

export const metadata: Metadata = {
  title: 'Editorial Mission Control — The Breakdown Knowledge Platform',
  description: 'Real-time newsroom intelligence dashboard for evidence health, knowledge gaps, conflicts, and publication reviews.',
};

export default async function EditorialDashboardPage() {
  const fixes = [CHAPTER_1_FIX];

  // 1. Project Real-Time Operational Intelligence
  const dashboardData = EditorialDashboardProjection.projectDashboard(fixes);

  // 2. Generate Research Copilot Suggestions
  const researchRecommendations = ResearchSupportService.generateRecommendations(CHAPTER_1_FIX, fixes);

  // 3. Conduct Gold Standard Audit Evaluation
  const goldAuditCert = GoldStandardAuditService.auditChapter1(CHAPTER_1_PACKAGE);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-amber-500/30 pb-24">
      {/* Top Navigation Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-100">
              Newsroom <span className="text-amber-400">Mission Control</span>
            </h1>
            <span className="bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded font-bold border border-amber-500/30">
              Phase 15B Intelligence Engine Live
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Canonical Intelligence Synced
            </span>
            <span className="hidden sm:inline">AR-13A.0 Locked Baseline</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8" id="main-content">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Editorial Desk', href: '/editorial' },
          { label: 'Mission Control Dashboard', href: '/editorial' },
        ]} />

        <div className="mt-6">
          <IntelligenceDashboardView
            dashboardData={dashboardData}
            researchRecommendations={researchRecommendations}
            goldAuditCert={goldAuditCert}
          />
        </div>
      </main>
    </div>
  );
}
