import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function GraphLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Knowledge Graph', href: '/graph' },
        ]}
      />
      {children}
    </>
  );
}
