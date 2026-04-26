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

const BinanceAccountPage = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [orders, setOrders] = useState<BinanceOrder[]>([]);
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

  useEffect(() => { load(); }, []);

  // Key balances
  const usdt = balances.find((b) => b.asset === 'USDT');
  const btc = balances.find((b) => b.asset === 'BTC');
  const eth = balances.find((b) => b.asset === 'ETH');

  // Top balances for table (skip tiny amounts and show top 15)
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
        <KPI
          variant="paper"
          label="Total Assets"
          value={String(balances.length)}
        />
      </div>

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
