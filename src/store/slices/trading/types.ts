export type TradingMode = 'PAPER' | 'LIVE';
export type AgentStatus = 'idle' | 'thinking' | 'gated' | 'executed' | 'error';

export interface ITradingStore {
  mode: TradingMode;
  liveExpiresAt: string | null;
  agentStatus: AgentStatus;
  sidebarOpen: boolean;
  setMode: (mode: TradingMode, expiresAt?: string | null) => void;
  setAgentStatus: (status: AgentStatus) => void;
  toggleSidebar: () => void;
}
