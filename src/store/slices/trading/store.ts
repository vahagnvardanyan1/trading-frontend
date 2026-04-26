import type { StateCreator } from "zustand";

import type { ITradingStore } from "./types";

const createTradingSlice: StateCreator<ITradingStore> = (set) => ({
  mode: 'PAPER',
  liveExpiresAt: null,
  agentStatus: 'idle',
  sidebarOpen: true,
  setMode: (mode, expiresAt = null) => set({ mode, liveExpiresAt: expiresAt }),
  setAgentStatus: (agentStatus) => set({ agentStatus }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
});

export default createTradingSlice;
