'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CMSShell from '@/components/cms/CMSShell';

export default function CMSPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to first story by default
    const firstId = 'story-001';
    router.replace(`/cms/story/${firstId}`);
  }, [router]);

  return (
    <CMSShell>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--color-text-tertiary)',
          fontSize: '14px',
        }}
      >
        Loading CMS...
      </div>
    </CMSShell>
  );
}
