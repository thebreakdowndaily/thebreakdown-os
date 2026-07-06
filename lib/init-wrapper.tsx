'use client';
import { useEffect, useState } from 'react';
import { bootstrapServices } from './bootstrap';

export function useServices() {
  const [ready, setReady] = useState(false);
  useEffect(() => { bootstrapServices(); setReady(true); }, []);
  return ready;
}

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const ready = useServices();
  if (!ready) return <div>Loading...</div>;
  return <>{children}</>;
}
