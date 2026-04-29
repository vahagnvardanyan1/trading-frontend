# trading-frontend

React + TypeScript + Vite UI for the trading agent.

## Quickstart

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The dev server proxies `/api/*` to
`http://localhost:4001` (the NestJS backend).

## What you can do from the UI

- **Account** — equity, daily P&L, open positions, allowed pairs.
- **Scheduler** — enable/disable the cron, change the schedule, or run
  the agent once on demand.
- **Controls** — manual kill switch.
- **Configuration** — switch demo/live, change risk per trade, edit
  the allowed-pairs list, change daily-loss kill threshold.
- **Recent activity** — the trade journal: every order, every no-op
  decision, every kill-switch trigger, with the agent's stated reason.

The UI auto-refreshes every 5 seconds via React Query.

## Folder layout

```
src/
├── main.tsx           # Vite entry, React Query provider
├── App.tsx            # Top-level grid layout
├── api.ts             # axios client + typed REST endpoints
├── styles.css         # design tokens + minimal component styles
└── components/
    ├── AccountCard.tsx
    ├── ConfigCard.tsx
    ├── ControlsCard.tsx
    ├── PositionsCard.tsx
    ├── SchedulerCard.tsx
    └── TradesTable.tsx
```
