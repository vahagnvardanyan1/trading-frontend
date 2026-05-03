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
  adx_threshold: number;
  cooldown_hours: number;
  max_stopouts_per_day: number;
  low_profit_pairs_threshold: number;
  correlation_buckets: string[][];
  dca_entries: { symbol: string; quote_amount: number; cron: string }[];
  dca_max_weekly_equity_pct: number;
  earn_reserve_amount: number;
  earn_min_park_amount: number;
  bear_regime_gate_lookback: number;
  bear_regime_gate_btc_threshold_pct: number;
  mean_reversion_rsi_entry: number;
  mean_reversion_rsi_exit: number;
  mean_reversion_atr_stop_multiplier: number;
  mean_reversion_time_stop_hours: number;
  grid_count: number;
  grid_range_lookback_days: number;
  grid_range_safety_margin_atr: number;
  grid_total_notional_pct: number;
  grid_range_break_atr_multiplier: number;
  strategy_kill_switches: Record<string, { active: boolean; reason: string }>;
}

export interface KillSwitchState {
  active: boolean;
  reason: string;
  triggered_at_iso?: string;
}

export interface AgentDecision {
  ts_iso: string;
  action: 'opened' | 'closed' | 'updated' | 'cancelled' | 'no_op' | 'halted' | 'dca_buy';
  symbol: string | null;
  reason: string;
  strategy?: 'breakout' | 'mean_reversion' | 'grid' | 'dca' | 'system';
  thesis?: string;
  counter_thesis?: string;
  confidence?: number;
  r_multiple?: number;
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
  state: () =>
    api
      .get<{
        mode: TradingMode;
        equity_usdt: number;
        free_usdt: number;
        earn_balance_usdt: number;
        daily_pnl_pct: number;
        recent_no_op_bear_streak: number;
        kill_switch: KillSwitchState;
      }>('/account/state')
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
