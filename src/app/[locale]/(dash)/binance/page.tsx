'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Pill } from '@/components/ds/Pill';
import { Button } from '@/components/ds/Button';
import { Table } from '@/components/ds/Table';
import { KPI } from '@/components/ds/KPI';
import { api } from '@/lib/api';

interface Balance {
  asset: string;
  total: number;
  free: number;
  used: number;
}

interface BinanceOrder {
  id: string;
  symbol: string;
  side: string;
  type: string;
  amount: number;
  price: number | null;
  filled: number;
  status: string;
  timestamp: string;
}

interface EquityPoint { t: string; v: number }
interface EquityHistory { points: EquityPoint[]; currentTotal: number }

/* ── SVG Balance Chart ─────────────────────────────────── */

function BalanceChart({ points }: { points: EquityPoint[] }) {
  const W = 700;
  const H = 220;
  const PAD = { top: 10, right: 10, bottom: 24, left: 70 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  if (points.length < 2) {
    return (
      <div className="ds-empty" style={{ height: H }}>
        <span>Not enough data yet. Make some trades to see your balance history.</span>
      </div>
    );
  }

  const values = points.map((p) => p.v);
  const minV = Math.min(...values) * 0.998;
  const maxV = Math.max(...values) * 1.002;
  const rangeV = maxV - minV || 1;

  const times = points.map((p) => new Date(p.t).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const rangeT = maxT - minT || 1;

  const x = (t: string) => PAD.left + ((new Date(t).getTime() - minT) / rangeT) * chartW;
  const y = (v: number) => PAD.top + chartH - ((v - minV) / rangeV) * chartH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L${x(points[points.length - 1].t).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L${x(points[0].t).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

  // Grid lines
  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => minV + (rangeV * i) / gridLines);

  // Time labels
  const firstDate = new Date(points[0].t);
  const lastDate = new Date(points[points.length - 1].t);
  const timeLabels = [
    { t: points[0].t, label: firstDate.toLocaleDateString() },
    { t: points[points.length - 1].t, label: lastDate.toLocaleDateString() },
  ];

  // P&L color
  const startVal = points[0].v;
  const endVal = points[points.length - 1].v;
  const isUp = endVal >= startVal;
  const lineColor = isUp ? 'var(--ds-success)' : 'var(--ds-danger)';

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

      {/* Area fill */}
      <path d={areaPath} fill={lineColor} opacity={0.08} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} />

      {/* Data point markers */}
      {points.map((p, i) => (
        <circle key={i} cx={x(p.t)} cy={y(p.v)} r={3} fill={lineColor} opacity={0.6} />
      ))}

      {/* Last point highlight */}
      <circle
        cx={x(points[points.length - 1].t)}
        cy={y(points[points.length - 1].v)}
        r={5} fill={lineColor}
      />

      {/* Time labels */}
      {timeLabels.map((tl, i) => (
        <text
          key={i}
          x={x(tl.t)}
          y={H - 4}
          textAnchor={i === 0 ? 'start' : 'end'}
          fill="var(--ds-text-subtle)"
          fontSize={10}
          fontFamily="var(--ds-font-mono)"
        >
          {tl.label}
        </text>
      ))}
    </svg>
  );
}

/* ── Page ──────────────────────────────────────────────── */

const BinanceAccountPage = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [orders, setOrders] = useState<BinanceOrder[]>([]);
  const [equity, setEquity] = useState<EquityHistory>({ points: [], currentTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balRes, ordRes] = await Promise.all([
        api.get<{ balances: Balance[]; isTestnet: boolean; error?: string }>('/binance-account/balance'),
        api.get<{ orders: BinanceOrder[]; isTestnet: boolean; error?: string }>('/binance-account/orders'),
      ]);
      if (balRes.error) {
        setError(balRes.error);
      } else {
        setBalances(balRes.balances);
        setOrders(ordRes.orders);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Load equity history separately (slow endpoint)
    api.get<EquityHistory>('/binance-account/equity-history').then(setEquity).catch(() => {});
  }, []);

  // Key balances
  const usdt = balances.find((b) => b.asset === 'USDT');
  const btc = balances.find((b) => b.asset === 'BTC');
  const eth = balances.find((b) => b.asset === 'ETH');

  // P&L calculation
  const pnl = equity.points.length >= 2
    ? equity.points[equity.points.length - 1].v - equity.points[0].v
    : 0;
  const pnlPct = equity.points.length >= 2 && equity.points[0].v > 0
    ? (pnl / equity.points[0].v) * 100
    : 0;

  // Top balances for table
  const topBalances = balances.slice(0, 15);

  return (
    <>
      <div className="ds-row-flex">
        <h1 className="ds-h1">Binance Account</h1>
        <Pill variant="warn">TESTNET</Pill>
        <div className="ds-grow" />
        <Button variant="ghost" onClick={load} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="ds-banner ds-banner--live">
          <span>{error}</span>
        </div>
      )}

      {/* Key balances */}
      <div className="ds-kpis">
        <KPI
          variant="paper"
          label="Total Portfolio"
          value={equity.currentTotal > 0 ? `$${equity.currentTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '--'}
          delta={pnl !== 0 ? `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)` : undefined}
          deltaDir={pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'flat'}
        />
        <KPI
          variant="paper"
          label="USDT Balance"
          value={usdt ? `$${usdt.total.toLocaleString()}` : '--'}
          delta={usdt && usdt.used > 0 ? `${usdt.used.toFixed(2)} in use` : undefined}
        />
        <KPI
          variant="paper"
          label="BTC Balance"
          value={btc ? btc.total.toFixed(6) : '--'}
        />
        <KPI
          variant="paper"
          label="ETH Balance"
          value={eth ? eth.total.toFixed(6) : '--'}
        />
      </div>

      {/* Balance History Chart */}
      <Card>
        <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-sp-3)' }}>Portfolio Value</h2>
        <BalanceChart points={equity.points} />
      </Card>

      {/* Balances table */}
      <Card>
        <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-sp-3)' }}>Balances</h2>
        {topBalances.length === 0 ? (
          <div className="ds-empty"><span>No balances</span></div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Asset</th>
                <th className="num">Total</th>
                <th className="num">Available</th>
                <th className="num">In Use</th>
              </tr>
            </thead>
            <tbody>
              {topBalances.map((b) => (
                <tr key={b.asset}>
                  <td style={{ fontWeight: 500 }}>{b.asset}</td>
                  <td className="num">{b.total.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                  <td className="num">{b.free.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                  <td className="num" style={{ color: b.used > 0 ? 'var(--ds-warn)' : undefined }}>
                    {b.used > 0 ? b.used.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Order history */}
      <Card>
        <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-sp-3)' }}>Order History</h2>
        {orders.length === 0 ? (
          <div className="ds-empty">
            <span>No orders yet. Run the agent to place testnet orders.</span>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Type</th>
                <th className="num">Amount</th>
                <th className="num">Price</th>
                <th className="num">Filled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="ds-mono" style={{ fontSize: 'var(--ds-fs-xs)' }}>
                    {new Date(o.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 500 }}>{o.symbol}</td>
                  <td>
                    <Pill variant={o.side === 'buy' ? 'success' : 'danger'}>
                      {o.side.toUpperCase()}
                    </Pill>
                  </td>
                  <td style={{ fontSize: 'var(--ds-fs-xs)' }}>{o.type}</td>
                  <td className="num">{o.amount}</td>
                  <td className="num">{o.price?.toFixed(2) ?? '--'}</td>
                  <td className="num">{o.filled}</td>
                  <td>
                    <Pill variant={
                      o.status === 'closed' ? 'success' :
                      o.status === 'canceled' ? 'default' :
                      o.status === 'open' ? 'warn' : 'default'
                    }>
                      {o.status}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
};

export default BinanceAccountPage;
