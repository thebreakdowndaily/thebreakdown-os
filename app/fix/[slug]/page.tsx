import type { Metadata } from 'next';
import type { FixJSON, ExistingSolution } from '@/utils/types';
import { buildFix } from '@/utils/website-builder';
import { getFix } from '@/utils/data-layer/store';
import FixLayout from '@/layouts/FixLayout';
import FixRenderer from '@/components/fix/FixRenderer';

interface FixPageProps {
  params: Promise<{ slug: string }>;
}

function loadFix(slug: string): FixJSON | null {
  const apiFix = getFix(slug);
  if (!apiFix) return null;

  return {
    id: apiFix.id,
    slug: apiFix.slug,
    storySlug: apiFix.storySlug,
    headline: apiFix.headline,
    summary: apiFix.summary,
    heroImage: apiFix.heroImage,
    publishedAt: apiFix.publishedAt,
    updatedAt: apiFix.updatedAt,
    readingTime: apiFix.readingTime,
    author: apiFix.author,
    evidenceScore: apiFix.evidenceScore,
    tags: apiFix.tags,
    problem: apiFix.problem,
    whoIsAffected: apiFix.whoIsAffected,
    rootCauses: apiFix.rootCauses,
    evidence: apiFix.evidence,
    stakeholders: apiFix.stakeholders,
    existingSolutions: apiFix.existingSolutions.map(
      (s): ExistingSolution => ({
        name: s.name,
        description: s.description,
        status: s.status,
        effectiveness: s.effectiveness as ExistingSolution['effectiveness'],
        source: s.source,
      })
    ),
    globalExamples: apiFix.globalExamples,
    recommendedActions: apiFix.recommendedActions.map((action) => ({
      title: action.title,
      description: action.description,
      priority: action.priority,
      timeframe: action.timeframe,
      actors: action.actors,
    })),
    citizenActions: apiFix.citizenActions.map((action) => ({
      title: action.title,
      description: action.description,
      priority: action.priority,
      timeframe: action.timeframe,
      actors: action.actors,
    })),
    governmentActions: apiFix.governmentActions.map((action) => ({
      title: action.title,
      description: action.description,
      priority: action.priority,
      timeframe: action.timeframe,
      actors: action.actors,
    })),
    metricsToTrack: apiFix.metricsToTrack,
    relatedStories: apiFix.relatedStories,
    relatedEntities: apiFix.relatedEntities,
    sources: [],
  };
}

export async function generateMetadata({ params }: FixPageProps): Promise<Metadata> {
  const { slug } = await params;
  const fix = loadFix(slug);
  if (!fix) return { title: 'Fix Not Found — The Breakdown' };

  return {
    title: `${fix.headline} — The Breakdown Fix`,
    description: fix.summary.slice(0, 160),
  };
}

export default async function FixPage({ params }: FixPageProps) {
  const { slug } = await params;
  const fix = loadFix(slug);

  if (!fix) {
    return (
      <FixLayout seo={{ title: 'Fix Not Found', description: '', canonical: '', ogType: 'website' }} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Fix Not Found', href: '' }]}>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-300 mb-4">Fix Not Found</h1>
          <p className="text-gray-500">The fix you are looking for does not exist or has been removed.</p>
        </div>
      </FixLayout>
    );
  }

  const pageSpec = buildFix(fix);

  return (
    <FixLayout seo={pageSpec.seo} breadcrumbs={pageSpec.breadcrumbs}>
      <FixRenderer fix={fix} pageSpec={pageSpec} />
    </FixLayout>
  );
}
