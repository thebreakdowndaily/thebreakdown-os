'use client';

import { useState } from 'react';
import { supabase } from '../auth-client';

export function LoginForm({ onSuccess, onRegisterClick }: { onSuccess?: () => void; onRegisterClick?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Invalid email or password' : err.message);
    } else {
      onSuccess?.();
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-6)', color: 'var(--color-text-primary)' }}>Sign In</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {error && (
          <div style={{ padding: 'var(--spacing-3)', background: 'color-mix(in srgb, var(--color-red-500) 10%, transparent)', borderRadius: 'var(--radius-md)', color: 'var(--color-red-400)', fontSize: 'var(--text-sm)' }}>{error}</div>
        )}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            required
            placeholder="you@example.com"
            style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
            required
            placeholder="Your password"
            style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', outline: 'none' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-brand-400)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>or continue with</div>
        <button onClick={() => { handleOAuth('google'); }} style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
          Google
        </button>
        <button onClick={() => { handleOAuth('github'); }} style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
          GitHub
        </button>
      </div>
      {onRegisterClick && (
        <p style={{ marginTop: 'var(--spacing-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <button onClick={onRegisterClick} style={{ background: 'none', border: 'none', color: 'var(--color-brand-400)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, padding: 0, textDecoration: 'underline' }}>
            Sign up
          </button>
        </p>
      )}
    </div>
  );
}
