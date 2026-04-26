'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { useAppStore } from '@/store';
import { useTranslator } from '@/hooks/useTranslator';
import { NavItem } from '@/components/ds/NavItem';
import { Banner } from '@/components/ds/Banner';
import { Pill } from '@/components/ds/Pill';
import { Button } from '@/components/ds/Button';
import { api } from '@/lib/api';

const navItems = [
  { key: 'overview', href: '/', icon: 'home' },
  { key: 'decisions', href: '/decisions', icon: 'gavel' },
  { key: 'positions', href: '/positions', icon: 'account' },
  { key: 'trades', href: '/trades', icon: 'swap' },
  { key: 'binance', href: '/binance', icon: 'binance' },
  { key: 'settings', href: '/settings', icon: 'settings' },
] as const;

const navIcons: Record<string, React.ReactNode> = {
  home: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>,
  binance: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L7.5 4.5 10 7l2.5-2.5L10 2zM4.5 7.5L2 10l2.5 2.5L7 10 4.5 7.5zM15.5 7.5L13 10l2.5 2.5L18 10l-2.5-2.5zM10 13l-2.5-2.5L5 13l5 5 5-5-2.5-2.5L10 13z"/></svg>,
  gavel: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0114 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L7.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 016 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L10 4.323V3a1 1 0 011-1z" clipRule="evenodd"/></svg>,
  account: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>,
  swap: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/></svg>,
  settings: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>,
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const translate = useTranslator();
  const pathname = usePathname();
  const mode = useAppStore((s) => s.mode);
  const agentStatus = useAppStore((s) => s.agentStatus);
  const setMode = useAppStore((s) => s.setMode);
  const setAgentStatus = useAppStore((s) => s.setAgentStatus);
  const [email, setEmail] = useState('');
  const [runningAgent, setRunningAgent] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ email: string; mode: string }>('/auth/me')
      .then((data) => {
        setEmail(data.email);
        setMode(data.mode as 'PAPER' | 'LIVE');
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, [setMode]);

  const isPaper = mode === 'PAPER';

  const handleRunAgent = async () => {
    setRunningAgent(true);
    setAgentStatus('thinking');
    setLastError(null);
    try {
      await api.post('/agent/run');
      setAgentStatus('idle');
      setRunningAgent(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      setAgentStatus('error');
      setRunningAgent(false);
    }
  };

  const statusDotClass = agentStatus === 'idle' ? 'ds-dot--idle' :
    agentStatus === 'thinking' ? 'ds-dot--paper' :
    agentStatus === 'error' ? 'ds-dot--live' : 'ds-dot--paper';

  return (
    <>
      {/* Topbar */}
      <header className="ds-topbar">
        <span className="ds-topbar__brand">Crypto Agent</span>
        {email && <Pill>{email}</Pill>}
        <div className="ds-grow" />
        <div className="ds-row-flex" style={{ gap: 'var(--ds-sp-2)' }}>
          <span className={`ds-dot ${statusDotClass}`} />
          <span className="ds-muted" style={{ fontSize: 'var(--ds-fs-sm)' }}>
            {translate(`agent.${agentStatus}`)}
          </span>
        </div>
        <Button variant="primary" onClick={handleRunAgent} disabled={runningAgent}>
          Run agent now
        </Button>
      </header>

      {/* App grid */}
      <div className="ds-app" style={{ minHeight: 'calc(100vh - 49px)' }}>
        {/* Sidebar */}
        <aside className="ds-app__side">
          {/* Mode banner (read-only) */}
          <Banner variant={isPaper ? 'paper' : 'live'}>
            <span className={`ds-dot ${isPaper ? 'ds-dot--paper' : 'ds-dot--live'}`} />
            <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Mode &middot; {isPaper ? 'Paper' : 'Live'}
            </span>
            <Pill variant={isPaper ? 'paper' : 'live'}>
              {isPaper ? 'Testnet' : 'Real'}
            </Pill>
          </Banner>

          {/* Navigation */}
          <nav className="ds-nav">
            {navItems.map(({ key, href, icon }) => {
              const isActive =
                href === '/'
                  ? pathname.endsWith('/') || /^\/[a-z]{2}\/?$/.test(pathname)
                  : pathname.includes(href);

              return (
                <NavItem key={key} href={href} active={isActive} icon={navIcons[icon]}>
                  {translate(`nav.${key}`)}
                </NavItem>
              );
            })}
          </nav>

          <div className="ds-grow" />
        </aside>

        {/* Main content */}
        <main className="ds-app__main">
          {lastError && (
            <div className="ds-banner ds-banner--live" style={{ cursor: 'pointer' }} onClick={() => setLastError(null)}>
              <span style={{ fontWeight: 600 }}>Agent Error</span>
              <span style={{ flex: 1, wordBreak: 'break-word' }}>{lastError}</span>
              <span style={{ opacity: 0.7, fontSize: 'var(--ds-fs-xs)' }}>click to dismiss</span>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="ds-bottombar">
        {navItems.map(({ key, href, icon }) => {
          const isActive =
            href === '/'
              ? pathname.endsWith('/') || /^\/[a-z]{2}\/?$/.test(pathname)
              : pathname.includes(href);

          return (
            <a
              key={key}
              href={href}
              className={`ds-bottombar__item ${isActive ? 'ds-bottombar__item--active' : ''}`}
            >
              <span className="ds-bottombar__icon">{navIcons[icon]}</span>
              <span>{translate(`nav.${key}`)}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
};

export default DashboardLayout;
