'use client';

import { useEffect, useState } from 'react';
import { KPI } from '@/components/ds/KPI';
import { Card } from '@/components/ds/Card';
import { api } from '@/lib/api';

interface OverviewData {
  mode: string;
  kpis: {
    paperEquity: number;
    liveEquity: number;
    drawdown: number;
    openPositions: number;
    todayPnl: number;
  };
  lastDecision: { symbol: string; action: string; createdAt: string } | null;
  todayDecisionsCount: number;
}

interface EquityPoint { t: string; v: number }
interface EquityHistory { paper: EquityPoint[]; live: EquityPoint[] }

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/* ── SVG Equity Chart ──────────────────────────────────── */

function EquityChart({ paper, live }: { paper: EquityPoint[]; live: EquityPoint[] }) {
  const W = 700;
  const H = 200;
  const PAD = { top: 10, right: 10, bottom: 24, left: 60 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allValues = [...paper.map((p) => p.v), ...live.map((p) => p.v)];
  if (allValues.length === 0) {
    return (
      <div className="ds-empty" style={{ height: H }}>
        <span>No equity data yet. Run the agent to start tracking.</span>
      </div>
    );
  }

  const minV = Math.min(...allValues) * 0.998;
  const maxV = Math.max(...allValues) * 1.002;
  const rangeV = maxV - minV || 1;

  const allTimes = [...paper.map((p) => new Date(p.t).getTime()), ...live.map((p) => new Date(p.t).getTime())];
  const minT = Math.min(...allTimes);
  const maxT = Math.max(...allTimes);
  const rangeT = maxT - minT || 1;

  const x = (t: string) => PAD.left + ((new Date(t).getTime() - minT) / rangeT) * chartW;
  const y = (v: number) => PAD.top + chartH - ((v - minV) / rangeV) * chartH;

  const toPath = (points: EquityPoint[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');

  const toArea = (points: EquityPoint[]) => {
    if (points.length === 0) return '';
    const line = toPath(points);
    const lastX = x(points[points.length - 1].t).toFixed(1);
    const firstX = x(points[0].t).toFixed(1);
    const bottom = (PAD.top + chartH).toFixed(1);
    return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`;
  };

  // Grid lines
  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => minV + (rangeV * i) / gridLines);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      {/* Grid */}
      {gridValues.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={y(v)} x2={W - PAD.right} y2={y(v)}
            stroke="var(--ds-border)" strokeWidth={1}
          />
          <text
            x={PAD.left - 6} y={y(v) + 4}
            textAnchor="end"
            fill="var(--ds-text-subtle)"
            fontSize={10}
            fontFamily="var(--ds-font-mono)"
          >
            ${v.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Paper area fill */}
      {paper.length > 1 && (
        <path d={toArea(paper)} fill="var(--ds-mode-paper)" opacity={0.08} />
      )}

      {/* Paper line */}
      {paper.length > 1 && (
        <path d={toPath(paper)} fill="none" stroke="var(--ds-mode-paper)" strokeWidth={2} />
      )}

      {/* Live line (dashed) */}
      {live.length > 1 && (
        <path d={toPath(live)} fill="none" stroke="var(--ds-mode-live)" strokeWidth={2} strokeDasharray="6 3" />
      )}

      {/* Last point markers */}
      {paper.length > 0 && (
        <circle cx={x(paper[paper.length - 1].t)} cy={y(paper[paper.length - 1].v)} r={4} fill="var(--ds-mode-paper)" />
      )}
      {live.length > 0 && (
        <circle cx={x(live[live.length - 1].t)} cy={y(live[live.length - 1].v)} r={4} fill="var(--ds-mode-live)" />
      )}

      {/* Legend */}
      <circle cx={PAD.left + 8} cy={H - 8} r={4} fill="var(--ds-mode-paper)" />
      <text x={PAD.left + 16} y={H - 4} fontSize={10} fill="var(--ds-text-muted)">Paper</text>
      {live.length > 0 && (
        <>
          <circle cx={PAD.left + 60} cy={H - 8} r={4} fill="var(--ds-mode-live)" />
          <text x={PAD.left + 68} y={H - 4} fontSize={10} fill="var(--ds-text-muted)">Live</text>
        </>
      )}
    </svg>
  );
}

/* ── Page ──────────────────────────────────────────────── */

const OverviewPage = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [equity, setEquity] = useState<EquityHistory>({ paper: [], live: [] });
  useEffect(() => {
    api.get<OverviewData>('/overview').then(setData).catch(() => {});
    api.get<EquityHistory>('/overview/equity-history').then(setEquity).catch(() => {});
  }, []);

  const kpis = data?.kpis;
  const variant = data?.mode === 'LIVE' ? 'live' : 'paper';
  const pnlDir = (kpis?.todayPnl ?? 0) > 0 ? 'up' : (kpis?.todayPnl ?? 0) < 0 ? 'down' : 'flat';

  return (
    <>
      <h1 className="ds-h1">Dashboard</h1>

      <div className="ds-kpis">
        <KPI
          variant="paper"
          label="Paper Equity"
          value={kpis ? fmt(kpis.paperEquity) : '--'}
          delta={kpis ? `${kpis.todayPnl >= 0 ? '+' : ''}${fmt(kpis.todayPnl)}` : undefined}
          deltaDir={pnlDir as 'up' | 'down' | 'flat'}
        />
        <KPI
          variant="live"
          label="Live Equity"
          value={kpis && kpis.liveEquity > 0 ? fmt(kpis.liveEquity) : '--'}
        />
        <KPI
          variant={variant}
          label="Drawdown"
          value={kpis ? `${kpis.drawdown.toFixed(2)}%` : '--'}
          deltaDir={kpis && kpis.drawdown > 0 ? 'down' : 'flat'}
        />
        <KPI
          variant={variant}
          label="Open Positions"
          value={kpis ? String(kpis.openPositions) : '0'}
        />
      </div>

      <Card>
        <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-sp-3)' }}>Equity Curve</h2>
        <EquityChart paper={equity.paper} live={equity.live} />
      </Card>

    </>
  );
};

export default OverviewPage;
