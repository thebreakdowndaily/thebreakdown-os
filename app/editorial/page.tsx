import { bootstrapServices } from '@/lib/bootstrap';
import { buildEditorialDashboard } from '@/features/editorial/view-model';
import PlatformHealth from '@/components/editorial/PlatformHealth';
import StoryTable from '@/components/editorial/StoryTable';
import HealthMetricsGrid from '@/components/editorial/HealthMetricsGrid';
import EditorialQueue from '@/components/editorial/EditorialQueue';
import SourceMonitoring from '@/components/editorial/SourceMonitoring';

export default async function EditorialDashboardPage() {
  const services = bootstrapServices();
  const vm = await buildEditorialDashboard(services);

  const healthSections = [
    {
      title: 'Media Health',
      metrics: [
        { label: 'Missing Hero', value: vm.mediaHealth.missingHero },
        { label: 'Missing Gallery', value: vm.mediaHealth.missingGallery },
        { label: 'Broken Images', value: vm.mediaHealth.brokenImages },
        { label: 'Duplicate Images', value: vm.mediaHealth.duplicateImages },
        { label: 'Low Resolution', value: vm.mediaHealth.lowRes },
        { label: 'Missing Attribution', value: vm.mediaHealth.missingAttribution },
      ]
    },
    {
      title: 'Knowledge Health',
      metrics: [
        { label: 'Broken Entity Links', value: vm.knowledgeHealth.brokenEntityLinks },
        { label: 'Missing Topics', value: vm.knowledgeHealth.missingTopics },
        { label: 'Weak Relationships', value: vm.knowledgeHealth.weakRelationships },
        { label: 'Unverified Claims', value: vm.knowledgeHealth.unverifiedClaims },
        { label: 'Missing Timeline Events', value: vm.knowledgeHealth.missingTimelineEvents },
      ]
    },
    {
      title: 'SEO Health',
      metrics: [
        { label: 'Missing Description', value: vm.seoHealth.missingDescription },
        { label: 'Missing OG Image', value: vm.seoHealth.missingOgImage },
        { label: 'Missing JSON-LD', value: vm.seoHealth.missingJsonLd },
        { label: 'Duplicate Title', value: vm.seoHealth.duplicateTitle },
        { label: 'Short Content', value: vm.seoHealth.shortContent },
        { label: 'Broken Canonical', value: vm.seoHealth.brokenCanonical },
      ]
    },
    {
      title: 'Accessibility Health',
      metrics: [
        { label: 'Missing Alt Text', value: vm.accessibilityHealth.missingAltText },
        { label: 'Heading Order Issues', value: vm.accessibilityHealth.headingOrder },
        { label: 'Low Contrast', value: vm.accessibilityHealth.contrast },
        { label: 'Keyboard Traps', value: vm.accessibilityHealth.keyboard },
        { label: 'Missing ARIA', value: vm.accessibilityHealth.aria },
        { label: 'Missing Captions', value: vm.accessibilityHealth.captions },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-emerald-500/30 text-white pb-24">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">Newsroom <span className="text-emerald-500">Mission Control</span></h1>
            <span className="bg-emerald-950/50 text-emerald-500 text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold border border-emerald-900/50">
              Live
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-xs font-mono text-neutral-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> KB Synced</span>
              <span>Pipelines Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-12">
        <PlatformHealth data={vm.platformHealth} />
        
        <div className="mt-8">
          <EditorialQueue tasks={vm.editorialQueue} />
        </div>

        <SourceMonitoring data={vm.sourceMonitoring} systemStatus={vm.systemStatus} />
        
        <div className="mb-12">
          <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            System Diagnostics
          </h2>
          <HealthMetricsGrid sections={healthSections} />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Publishing Activity
          </h2>
          <StoryTable stories={vm.stories} />
        </div>
      </main>
    </div>
  );
}
