'use client';

import { useAuth } from './SessionProvider';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        {mode === 'login' ? (
          <LoginForm onRegisterClick={() => { setMode('register'); }} />
        ) : (
          <RegisterForm onLoginClick={() => { setMode('login'); }} onSuccess={() => { setMode('login'); }} />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
