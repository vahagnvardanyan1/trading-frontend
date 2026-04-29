import { useQuery } from '@tanstack/react-query';
import { accountApi } from './api';
import { ConfigCard } from './components/ConfigCard';
import { SchedulerCard } from './components/SchedulerCard';
import { ControlsCard } from './components/ControlsCard';
import { RunsTable } from './components/RunsTable';

export function App(): JSX.Element {
  const account = useQuery({ queryKey: ['account'], queryFn: accountApi.state });

  return (
    <div className="app">
      <div className="header">
        <h1>TRADING</h1>
        <span className={`badge ${account.data?.mode ?? 'demo'}`}>
          {(account.data?.mode ?? '...').toUpperCase()}
        </span>
      </div>

      <p style={{ color: 'var(--muted)', marginTop: -12, marginBottom: 16, fontSize: 13 }}>
        Wallet, open orders, and trade history live on Binance —
        <a
          href="https://demo.binance.com/en/my/orders/exchange"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent)', marginLeft: 4 }}
        >
          open the Binance dashboard
        </a>
        . This page only controls the agent.
      </p>

      <div className="grid">
        <div className="col-4">
          <SchedulerCard />
        </div>
        <div className="col-4">
          <ControlsCard killSwitch={account.data?.kill_switch} />
        </div>
        <div className="col-4">
          <ConfigCard />
        </div>

        <div className="col-12">
          <RunsTable />
        </div>
      </div>
    </div>
  );
}
