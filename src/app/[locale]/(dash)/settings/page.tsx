'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Input } from '@/components/ds/Input';
import { Button } from '@/components/ds/Button';
import { Pill } from '@/components/ds/Pill';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';

interface Settings {
  symbolWhitelist: string[];
  maxConcurrentPositions: number;
  perTradeRiskPct: number;
  dailyLossLimitPct: number;
  scheduleCadenceHours: number;
  paperInitialEquity: number;
  manualApproval: boolean;
  cooldownHours: number;
}

const SettingsPage = () => {
  const mode = useAppStore((s) => s.mode);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<Settings>('/settings').then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.patch<Settings>('/settings', settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <div className="ds-empty"><span>Loading settings...</span></div>;
  }

  return (
    <>
      <h1 className="ds-h1">Settings</h1>

      <Card>
        <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-sp-4)' }}>Trading Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-sp-4)' }}>
          <Input
            id="whitelist"
            label="Symbol Whitelist (comma-separated)"
            value={settings.symbolWhitelist.join(', ')}
            onChange={(e) =>
              setSettings({ ...settings, symbolWhitelist: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
            }
          />
          <Input
            id="maxPos"
            label="Max Concurrent Positions"
            type="number"
            value={settings.maxConcurrentPositions}
            onChange={(e) => setSettings({ ...settings, maxConcurrentPositions: parseInt(e.target.value) || 0 })}
          />
          <Input
            id="riskPct"
            label="Per Trade Risk %"
            type="number"
            step="0.001"
            value={settings.perTradeRiskPct}
            onChange={(e) => setSettings({ ...settings, perTradeRiskPct: parseFloat(e.target.value) || 0 })}
          />
          <Input
            id="dailyLoss"
            label="Daily Loss Limit %"
            type="number"
            step="0.001"
            value={settings.dailyLossLimitPct}
            onChange={(e) => setSettings({ ...settings, dailyLossLimitPct: parseFloat(e.target.value) || 0 })}
          />
          <Input
            id="cadence"
            label="Schedule Cadence (hours)"
            type="number"
            value={settings.scheduleCadenceHours}
            onChange={(e) => setSettings({ ...settings, scheduleCadenceHours: parseInt(e.target.value) || 1 })}
          />
          <Input
            id="equity"
            label="Paper Initial Equity"
            type="number"
            value={settings.paperInitialEquity}
            onChange={(e) => setSettings({ ...settings, paperInitialEquity: parseFloat(e.target.value) || 0 })}
          />
          <Input
            id="cooldown"
            label="Cooldown Hours"
            type="number"
            value={settings.cooldownHours}
            onChange={(e) => setSettings({ ...settings, cooldownHours: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div style={{ marginTop: 'var(--ds-sp-4)', display: 'flex', gap: 'var(--ds-sp-2)', alignItems: 'center' }}>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          {saved && <span style={{ color: 'var(--ds-success)', fontSize: 'var(--ds-fs-sm)' }}>Saved</span>}
        </div>
      </Card>

      <Card>
        <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-sp-4)' }}>Trading Mode</h2>
        <div className="ds-row-flex" style={{ gap: 'var(--ds-sp-3)' }}>
          <Pill variant={mode === 'PAPER' ? 'paper' : 'live'} style={{ fontSize: 'var(--ds-fs-sm)', height: 28, padding: '0 12px' }}>
            {mode}
          </Pill>
          <span className="ds-muted" style={{ fontSize: 'var(--ds-fs-sm)' }}>
            {mode === 'PAPER'
              ? 'Orders go to Binance testnet (fake money). Set BINANCE_TESTNET=false in .env to switch to real Binance.'
              : 'Orders go to REAL Binance. Set BINANCE_TESTNET=true in .env to switch back to testnet.'}
          </span>
        </div>
      </Card>
    </>
  );
};

export default SettingsPage;
