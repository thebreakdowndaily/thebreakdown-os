import { InstitutionalLicenseManager } from '@/components/monetization/InstitutionalLicenseManager';

export default function LicenseManagementPage() {
  return (
    <div className="min-h-screen bg-surface-canvas text-neutral-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight">Institutional Access</h1>
          <p className="text-neutral-400 mt-2">Manage your organization's seats.</p>
        </header>
        <main>
          <InstitutionalLicenseManager />
        </main>
      </div>
    </div>
  );
}
