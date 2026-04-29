import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountApi, KillSwitchState } from '../api';

interface Props {
  killSwitch: KillSwitchState | undefined;
}

export function ControlsCard({ killSwitch }: Props): JSX.Element {
  const qc = useQueryClient();
  const setKill = useMutation({
    mutationFn: (active: boolean) => accountApi.setKillSwitch(active, active ? 'manual_halt' : ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['account'] }),
  });

  const active = killSwitch?.active ?? false;

  return (
    <div className="card">
      <h2>Controls</h2>

      <div className="kv">
        <span className="k">Kill switch</span>
        <span className={`v ${active ? 'bad' : 'good'}`}>
          {active ? 'ACTIVE' : 'inactive'}
        </span>
      </div>
      {active && killSwitch?.reason && (
        <div className="kv">
          <span className="k">Reason</span>
          <span className="v warn">{killSwitch.reason}</span>
        </div>
      )}

      <div className="row" style={{ marginTop: 12 }}>
        {active ? (
          <button
            className="btn primary"
            disabled={setKill.isPending}
            onClick={() => setKill.mutate(false)}
          >
            Resume trading
          </button>
        ) : (
          <button
            className="btn danger"
            disabled={setKill.isPending}
            onClick={() => setKill.mutate(true)}
          >
            Halt all trading
          </button>
        )}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
        The agent will refuse to open new entries while the kill switch is active.
        It can still tighten stops and close positions.
      </p>
    </div>
  );
}
