'use client';

import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Pill } from '@/components/ds/Pill';
import { Card } from '@/components/ds/Card';
import { api } from '@/lib/api';

interface Decision {
  id: string;
  runId: string;
  symbol: string;
  action: string;
  rationale: string;
  riskReward: string | null;
  gateVerdict: string;
  gateReason: string | null;
  book: string;
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  quantity: number | null;
  createdAt: string;
}

const actionVariant = (action: string) => {
  switch (action) {
    case 'OPEN_LONG': return 'success';
    case 'OPEN_SHORT': return 'danger';
    case 'CLOSE': return 'info';
    default: return 'default';
  }
};

const verdictVariant = (v: string) => {
  switch (v) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    case 'PENDING': return 'warn';
    default: return 'default';
  }
};

const DecisionsPage = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [runSummaries, setRunSummaries] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<Decision[]>('/decisions?limit=50').then(setDecisions).catch(() => {});
  }, []);

  const loadRunSummary = async (runId: string) => {
    if (runSummaries[runId]) return;
    try {
      const run = await api.get<{ finalDecision: unknown }>(`/runs/${runId}`);
      let text = '';
      const fd = run.finalDecision;
      if (typeof fd === 'string') text = fd;
      else if (fd && typeof fd === 'object' && 'text' in (fd as Record<string, unknown>)) text = (fd as Record<string, unknown>).text as string;
      setRunSummaries((prev) => ({ ...prev, [runId]: text }));
    } catch { /* ignore */ }
  };

  return (
    <>
      <h1 className="ds-h1">Decisions</h1>

      {decisions.length === 0 ? (
        <div className="ds-empty">
          <span>No decisions yet. Run the agent to generate trading decisions.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-sp-2)' }}>
          {decisions.map((d) => (
            <div key={d.id}>
              {/* Row */}
              <div
                onClick={() => {
                  const next = expandedId === d.id ? null : d.id;
                  setExpandedId(next);
                  if (next) loadRunSummary(d.runId);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-sp-2)',
                  padding: 'var(--ds-sp-3)',
                  borderBottom: '1px solid var(--ds-border)',
                  cursor: 'pointer',
                  background: expandedId === d.id ? 'var(--ds-surface-2)' : d.gateVerdict === 'REJECTED' ? 'var(--ds-danger-weak)' : undefined,
                  flexWrap: 'wrap',
                }}
              >
                <span className="ds-mono" style={{ fontSize: 'var(--ds-fs-xs)', color: 'var(--ds-text-subtle)', minWidth: 70 }}>
                  {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Pill variant={actionVariant(d.action) as 'success' | 'danger' | 'info' | 'default'}>
                  {d.action.replace('_', ' ')}
                </Pill>
                <span style={{ fontWeight: 500, fontSize: 'var(--ds-fs-sm)' }}>{d.symbol}</span>
                <div style={{ flex: 1 }} />
                {d.riskReward && <span className="ds-mono" style={{ fontSize: 'var(--ds-fs-xs)' }}>{d.riskReward}R</span>}
                <Pill variant={verdictVariant(d.gateVerdict) as 'success' | 'danger' | 'warn' | 'default'}>
                  {d.gateVerdict}
                </Pill>
                <Pill variant={d.book === 'PAPER' ? 'paper' : 'live'}>{d.book}</Pill>
                <span style={{ fontSize: 'var(--ds-fs-xs)', color: 'var(--ds-text-subtle)' }}>
                  {expandedId === d.id ? '▲' : '▼'}
                </span>
              </div>

              {/* Expanded detail */}
              {expandedId === d.id && (
                <Card style={{ margin: 'var(--ds-sp-2) 0', borderLeft: `3px solid ${d.gateVerdict === 'REJECTED' ? 'var(--ds-danger)' : d.action.includes('LONG') ? 'var(--ds-success)' : 'var(--ds-accent)'}` }}>
                  {/* Trade params */}
                  {d.entryPrice && (
                    <div className="ds-mono" style={{ fontSize: 'var(--ds-fs-sm)', marginBottom: 'var(--ds-sp-3)', display: 'flex', gap: 'var(--ds-sp-4)', flexWrap: 'wrap' }}>
                      <span>Entry: <strong>${d.entryPrice.toFixed(2)}</strong></span>
                      <span>SL: <strong>{d.stopLoss?.toFixed(2) ?? '--'}</strong></span>
                      <span>TP: <strong>{d.takeProfit?.toFixed(2) ?? '--'}</strong></span>
                      {d.quantity && <span>Qty: <strong>{d.quantity}</strong></span>}
                      {d.riskReward && <span>R:R: <strong>{d.riskReward}</strong></span>}
                    </div>
                  )}

                  {/* Gate reason */}
                  {d.gateReason && (
                    <div style={{ padding: 'var(--ds-sp-2) var(--ds-sp-3)', background: 'var(--ds-danger-weak)', borderRadius: 'var(--ds-radius-sm)', marginBottom: 'var(--ds-sp-3)', fontSize: 'var(--ds-fs-sm)', color: 'var(--ds-danger)' }}>
                      {d.gateReason}
                    </div>
                  )}

                  {/* Rationale */}
                  <div className="ds-markdown" style={{ fontSize: 'var(--ds-fs-sm)', lineHeight: 'var(--ds-lh-sm)' }}>
                    <Markdown>{d.rationale}</Markdown>
                  </div>

                  {/* Full run summary */}
                  {runSummaries[d.runId] && (
                    <>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--ds-border)', margin: 'var(--ds-sp-3) 0' }} />
                      <span className="ds-eyebrow" style={{ marginBottom: 'var(--ds-sp-2)', display: 'block' }}>Full Agent Analysis</span>
                      <div className="ds-markdown" style={{ fontSize: 'var(--ds-fs-sm)', lineHeight: 'var(--ds-lh-sm)' }}>
                        <Markdown>{runSummaries[d.runId]}</Markdown>
                      </div>
                    </>
                  )}
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DecisionsPage;
