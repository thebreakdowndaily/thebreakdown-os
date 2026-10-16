'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/features/auth/auth-client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError('The reset session may have expired. Request a new password reset link and try again.');
        return;
      }
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('Could not update the password. Request a new reset link and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'var(--color-bg-primary)' }}>
      <section style={{ width: '100%', maxWidth: 420, padding: 'var(--spacing-8)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-secondary)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>Reset password</h1>
        <p style={{ marginBottom: 'var(--spacing-6)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Choose a new password for your account. This form requires a valid password-reset session.
        </p>

        {success ? (
          <div role="status">
            <p style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>Your password has been updated.</p>
            <Link href="/login" style={{ color: 'var(--color-brand-400)', textDecoration: 'underline' }}>Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {error && (
              <p role="alert" style={{ color: 'var(--color-red-400)', fontSize: 'var(--text-sm)' }}>{error}</p>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: 'var(--spacing-2) var(--spacing-4)', border: 0, borderRadius: 'var(--radius-md)', background: 'var(--color-brand-400)', color: '#000', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.65 : 1 }}
            >
              {loading ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
