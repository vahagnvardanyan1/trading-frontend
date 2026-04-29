import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulerApi, agentApi } from '../api';

export function SchedulerCard(): JSX.Element {
  const qc = useQueryClient();
  const status = useQuery({ queryKey: ['scheduler'], queryFn: schedulerApi.status });
  const [cron, setCron] = useState('');

  useEffect(() => {
    if (status.data?.cron && !cron) setCron(status.data.cron);
  }, [status.data, cron]);

  const start = useMutation({
    mutationFn: () => schedulerApi.start(cron),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduler'] }),
  });
  const stop = useMutation({
    mutationFn: () => schedulerApi.stop(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduler'] }),
  });
  const runNow = useMutation({
    mutationFn: () => agentApi.runOnce(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['account'] });
      qc.invalidateQueries({ queryKey: ['trades'] });
    },
  });

  const enabled = status.data?.enabled ?? false;

  return (
    <div className="card">
      <h2>Scheduler</h2>

      <div className="kv">
        <span className="k">Status</span>
        <span className={`v ${enabled ? 'good' : 'warn'}`}>
          {enabled ? 'enabled' : 'disabled'}
        </span>
      </div>

      <div className="field">
        <label>Cron expression</label>
        <input value={cron} onChange={(e) => setCron(e.target.value)} placeholder="*/15 * * * *" />
      </div>

      <div className="row">
        {enabled ? (
          <button className="btn" disabled={stop.isPending} onClick={() => stop.mutate()}>
            Disable
          </button>
        ) : (
          <button
            className="btn primary"
            disabled={start.isPending || !cron}
            onClick={() => start.mutate()}
          >
            Enable
          </button>
        )}
        <button
          className="btn"
          disabled={runNow.isPending}
          onClick={() => runNow.mutate()}
        >
          {runNow.isPending ? 'Running agent…' : 'Run agent now'}
        </button>
      </div>
    </div>
  );
}
