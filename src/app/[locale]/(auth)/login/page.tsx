'use client';

import { useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Input } from '@/components/ds/Input';
import { Button } from '@/components/ds/Button';
import { api } from '@/lib/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login', {
        email,
        password,
        ...(totp ? { totp } : {}),
      });
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
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
            Sign in to your dashboard
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
            autoComplete="current-password"
          />
          <Input
            id="totp"
            label="TOTP Code (optional)"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            placeholder="Leave blank if not set up"
            autoComplete="one-time-code"
          />
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
