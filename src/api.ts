import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 60_000,
});

export type TradingMode = 'demo' | 'live';

export interface RuntimeConfig {
  mode: TradingMode;
  scheduler_enabled: boolean;
  scheduler_cron: string;
  risk_per_trade: number;
  max_concurrent_positions: number;
  max_entries_per_day: number;
  max_entries_per_hour: number;
  daily_loss_kill_pct: number;
  drawdown_kill_pct: number;
  allowed_pairs: string[];
  min_quote_volume_24h_usd: number;
}

export interface KillSwitchState {
  active: boolean;
  reason: string;
  triggered_at_iso?: string;
}

export interface AgentDecision {
  ts_iso: string;
  action: 'opened' | 'closed' | 'updated' | 'cancelled' | 'no_op' | 'halted';
  symbol: string | null;
  reason: string;
}

export interface AgentRun {
  id: string;
  ts_iso: string;
  turn_id: string;
  session_id: string;
  duration_ms: number;
  tool_calls: number;
  ended_with_status: string;
  decisions: AgentDecision[];
  error?: string;
}

export const accountApi = {
  /** Used only to know mode + kill_switch status; not a wallet view. */
  state: () =>
    api
      .get<{ mode: TradingMode; kill_switch: KillSwitchState }>('/account/state')
      .then((r) => r.data),
  setKillSwitch: (active: boolean, reason?: string) =>
    api.post('/account/kill-switch', { active, reason }).then((r) => r.data),
};

export const configApi = {
  get: () => api.get<RuntimeConfig>('/config').then((r) => r.data),
  patch: (patch: Partial<RuntimeConfig>) =>
    api.patch<RuntimeConfig>('/config', patch).then((r) => r.data),
};

export const runsApi = {
  list: (limit = 50) =>
    api.get<AgentRun[]>('/runs', { params: { limit } }).then((r) => r.data),
};

export const schedulerApi = {
  status: () =>
    api
      .get<{ enabled: boolean; cron: string; running: boolean }>('/scheduler')
      .then((r) => r.data),
  start: (cron?: string) => api.post('/scheduler/start', { cron }).then((r) => r.data),
  stop: () => api.post('/scheduler/stop').then((r) => r.data),
};

export const agentApi = {
  runOnce: () => api.post('/agent/run-once').then((r) => r.data),
};
