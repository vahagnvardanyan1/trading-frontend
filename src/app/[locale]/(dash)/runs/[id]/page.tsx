'use client';

import { useEffect, useState, use } from 'react';
import { Card } from '@/components/ds/Card';
import { Pill } from '@/components/ds/Pill';
import { CodeBlock } from '@/components/ds/CodeBlock';
import { api } from '@/lib/api';

interface ToolCall {
  tool: string;
  input: unknown;
  output: unknown;
}

interface RunDecision {
  id: string;
  symbol: string;
  action: string;
  side: string | null;
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  rationale: string;
  gateVerdict: string;
  gateReason: string | null;
  book: string;
  createdAt: string;
}

interface RunDetail {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  toolCalls: ToolCall[] | null;
  finalDecision: string | null;
  error: string | null;
  decisions: RunDecision[];
}

const statusVariant = (s: string) => {
  switch (s) {
    case 'COMPLETED': return 'success';
    case 'FAILED': return 'danger';
    case 'RUNNING': return 'warn';
    default: return 'default';
  }
};

const RunDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [run, setRun] = useState<RunDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<RunDetail>(`/runs/${id}`).then(setRun).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return <div className="ds-empty"><span>Error: {error}</span></div>;
  }

  if (!run) {
    return <div className="ds-empty"><span>Loading run details...</span></div>;
  }

  return (
    <>
      <div className="ds-row-flex" style={{ marginBottom: 'var(--ds-sp-2)' }}>
        <h1 className="ds-h1">Agent Run</h1>
        <Pill variant={statusVariant(run.status) as 'success' | 'danger' | 'warn' | 'default'}>
          {run.status}
        </Pill>
      </div>

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-sp-3)', marginBottom: 'var(--ds-sp-4)' }}>
        <Card inset>
          <span className="ds-eyebrow">Run ID</span>
          <p className="ds-mono" style={{ margin: 'var(--ds-sp-1) 0 0', fontSize: 'var(--ds-fs-sm)' }}>{run.id.slice(0, 12)}...</p>
        </Card>
        <Card inset>
          <span className="ds-eyebrow">Started</span>
          <p className="ds-mono" style={{ margin: 'var(--ds-sp-1) 0 0', fontSize: 'var(--ds-fs-sm)' }}>{new Date(run.startedAt).toLocaleString()}</p>
        </Card>
        <Card inset>
          <span className="ds-eyebrow">Tool Calls</span>
          <p className="ds-mono" style={{ margin: 'var(--ds-sp-1) 0 0', fontSize: 'var(--ds-fs-sm)' }}>{run.toolCalls?.length ?? 0}</p>
        </Card>
      </div>

      {/* Conversation turns */}
      <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-sp-3)' }}>Conversation</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-sp-3)' }}>
        {/* Tool calls as turns */}
        {run.toolCalls?.map((tc, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-sp-2)' }}>
            {/* Assistant tool_use bubble */}
            <div style={{
              padding: 'var(--ds-sp-4)',
              border: '1px solid #C7D0FF',
              borderRadius: 'var(--ds-radius-md)',
              background: 'var(--ds-accent-weak)',
            }}>
              <div className="ds-row-flex" style={{ marginBottom: 'var(--ds-sp-2)' }}>
                <Pill variant="accent">tool_use</Pill>
                <span className="ds-mono" style={{ fontSize: 'var(--ds-fs-sm)', fontWeight: 500 }}>{tc.tool}</span>
              </div>
              <CodeBlock>{JSON.stringify(tc.input, null, 2)}</CodeBlock>
            </div>

            {/* Tool result bubble */}
            <div style={{
              padding: 'var(--ds-sp-4)',
              border: '1px solid #F4D9B7',
              borderRadius: 'var(--ds-radius-md)',
              background: 'var(--ds-warn-weak)',
            }}>
              <div style={{ marginBottom: 'var(--ds-sp-2)' }}>
                <Pill variant="warn">tool_result</Pill>
              </div>
              <CodeBlock>
                {typeof tc.output === 'string'
                  ? tc.output.slice(0, 500)
                  : JSON.stringify(tc.output, null, 2).slice(0, 500)}
                {(JSON.stringify(tc.output).length > 500 ? '\n...(truncated)' : '')}
              </CodeBlock>
            </div>
          </div>
        ))}

        {/* Final decision */}
        {run.finalDecision && (
          <div style={{
            padding: 'var(--ds-sp-4)',
            border: '1px solid var(--ds-border)',
            borderRadius: 'var(--ds-radius-md)',
            background: 'var(--ds-surface)',
          }}>
            <div style={{ marginBottom: 'var(--ds-sp-2)' }}>
              <Pill variant="accent">Final Decision</Pill>
            </div>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 'var(--ds-fs-sm)' }}>
              {typeof run.finalDecision === 'string' ? run.finalDecision : JSON.stringify(run.finalDecision, null, 2)}
            </p>
          </div>
        )}

        {/* Gate verdict for each decision */}
        {run.decisions.map((d) => (
          <div
            key={d.id}
            style={{
              padding: 'var(--ds-sp-4)',
              border: '1px solid #BFE4D2',
              borderRadius: 'var(--ds-radius-md)',
              background: 'var(--ds-success-weak)',
            }}
          >
            <div className="ds-row-flex" style={{ marginBottom: 'var(--ds-sp-2)' }}>
              <Pill variant={d.gateVerdict === 'APPROVED' ? 'success' : d.gateVerdict === 'REJECTED' ? 'danger' : 'warn'}>
                RiskGate: {d.gateVerdict}
              </Pill>
              <Pill>{d.symbol}</Pill>
              <Pill variant={d.action.includes('LONG') ? 'success' : d.action.includes('SHORT') ? 'danger' : 'info'}>
                {d.action}
              </Pill>
              <Pill variant={d.book === 'PAPER' ? 'paper' : 'live'}>{d.book}</Pill>
            </div>
            {d.entryPrice && (
              <div className="ds-mono" style={{ fontSize: 'var(--ds-fs-sm)', marginBottom: 'var(--ds-sp-1)' }}>
                Entry: {d.entryPrice} | SL: {d.stopLoss} | TP: {d.takeProfit}
              </div>
            )}
            <p className="ds-muted" style={{ margin: 0, fontSize: 'var(--ds-fs-sm)' }}>{d.rationale}</p>
            {d.gateReason && (
              <p style={{ margin: 'var(--ds-sp-1) 0 0', fontSize: 'var(--ds-fs-xs)', color: 'var(--ds-danger)' }}>
                {d.gateReason}
              </p>
            )}
          </div>
        ))}

        {/* Error */}
        {run.error && (
          <div className="ds-banner ds-banner--live">
            <strong>Error:</strong> {run.error}
          </div>
        )}
      </div>
    </>
  );
};

export default RunDetailPage;
