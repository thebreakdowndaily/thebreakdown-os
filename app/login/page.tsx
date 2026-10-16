'use client';

import { useState } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { ForgotPassword } from '@/features/auth/components/ForgotPassword';
import { useRouter } from 'next/navigation';
import { safeRedirectPath } from '@/features/auth/redirect';

type AuthView = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const [view, setView] = useState<AuthView>('login');
  const router = useRouter();

  const completeAuth = () => {
    const requested = typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('redirect');
    router.push(safeRedirectPath(requested));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
      {view === 'login' && (
        <LoginForm
          onSuccess={completeAuth}
          onRegisterClick={() => { setView('register'); }}
        />
      )}
      {view === 'register' && (
        <RegisterForm
          onSuccess={completeAuth}
          onLoginClick={() => { setView('login'); }}
        />
      )}
      {view === 'forgot' && (
        <ForgotPassword onBack={() => { setView('login'); }} />
      )}
      {view === 'login' && (
        <div style={{ position: 'absolute', bottom: 40 }}>
          <button
            onClick={() => { setView('forgot'); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)', textDecoration: 'underline' }}
          >
            Forgot password?
          </button>
        </div>
      )}
    </div>
  );
}
