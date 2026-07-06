'use client';

import { useState } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { ForgotPassword } from '@/features/auth/components/ForgotPassword';
import { useRouter } from 'next/navigation';

type AuthView = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const [view, setView] = useState<AuthView>('login');
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
      {view === 'login' && (
        <LoginForm
          onSuccess={() => { router.push('/dashboard'); }}
          onRegisterClick={() => { setView('register'); }}
        />
      )}
      {view === 'register' && (
        <RegisterForm
          onSuccess={() => { router.push('/dashboard'); }}
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
