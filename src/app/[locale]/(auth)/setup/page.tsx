'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ds/Card';
import { Input } from '@/components/ds/Input';
import { Button } from '@/components/ds/Button';
import { api } from '@/lib/api';

const SetupPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/bootstrap', { email, password });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ds-bg)',
    }}>
      <Card style={{ width: 420, maxWidth: '92vw' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--ds-sp-6)' }}>
          <h1 className="ds-h1">Crypto Agent</h1>
          <p className="ds-muted" style={{ marginTop: 'var(--ds-sp-2)' }}>
            Create your operator account
          </p>
        </div>

        {error && (
          <div className="ds-banner ds-banner--live" style={{ marginBottom: 'var(--ds-sp-4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-sp-4)' }}>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Min 8 characters"
          />
          <Input
            id="confirm"
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SetupPage;
