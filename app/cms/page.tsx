import { buildCMSDashboard } from '@/features/cms/view-model';
import { bootstrapServices } from '@/services/bootstrap';
import CMSShell from '@/components/cms/CMSShell';

export const dynamic = 'force-dynamic';

export default async function CMSPage() {
  const services = await bootstrapServices();
  const stats = await buildCMSDashboard(services);
  
  const allStoriesRes = await services.stories.getStories({ pageSize: 100 });
  const stories = allStoriesRes.data;

  return (
    <CMSShell stories={stories}>
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--color-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>Total Stories</div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{stats.totalStories}</div>
          </div>
          <div style={{ background: 'var(--color-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>Drafts</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{stats.drafts}</div>
          </div>
          <div style={{ background: 'var(--color-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>In Review</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-amber-500)' }}>{stats.review}</div>
          </div>
          <div style={{ background: 'var(--color-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>Published</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-emerald-500)' }}>{stats.published}</div>
          </div>
        </div>
        
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Activity</h2>
        <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>
          {stats.recentActivity.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No recent activity</div>
          ) : (
            stats.recentActivity.map(activity => (
              <div key={activity.id + activity.timestamp} style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <a href={activity.link} style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  {activity.label}
                </a>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                  {new Date(activity.timestamp).toLocaleString()} {activity.userId && `by ${activity.userId}`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CMSShell>
  );
}
