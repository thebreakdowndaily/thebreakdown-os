'use client';

import { useState, useEffect } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

export function InstitutionalLicenseManager() {
  const [seats, setSeats] = useState<{ email: string; role: string }[]>([]);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('reader');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/institution/licenses')
      .then((res) => res.json())
      .then((data) => {
        if (data.seats) setSeats(data.seats);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/institution/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to invite');
      return;
    }

    setSeats([...seats, { email, role }]);
    setEmail('');
    captureEvent('license_seat_invited', { role });
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const slotsRemaining = 5 - seats.length;

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-white max-w-xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">Institutional Seats</h2>
      
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Current Seats ({seats.length}/5)</h3>
        {seats.length === 0 ? (
          <p className="text-sm text-neutral-500">No seats invited yet.</p>
        ) : (
          <ul className="space-y-2">
            {seats.map((seat, i) => (
              <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-950">
                <span className="text-sm">{seat.email}</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{seat.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-4 border-t border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">Invite Member</h3>
        {slotsRemaining > 0 ? (
          <form onSubmit={handleInvite} className="space-y-3">
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="reader">Reader</option>
                <option value="editor">Editor</option>
              </select>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Invite
              </button>
            </div>
            <p className="text-xs text-neutral-500">{slotsRemaining} slots remaining</p>
          </form>
        ) : (
          <p className="text-sm text-amber-400 bg-amber-400/10 p-3 rounded-lg">Maximum seat limit reached.</p>
        )}
      </div>
    </div>
  );
}
