import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { configApi, RuntimeConfig } from '../api';

export function ConfigCard(): JSX.Element {
  const qc = useQueryClient();
  const cfg = useQuery({ queryKey: ['config'], queryFn: configApi.get });
  const [draft, setDraft] = useState<RuntimeConfig | null>(null);

  useEffect(() => {
    if (cfg.data && !draft) setDraft(cfg.data);
  }, [cfg.data, draft]);

  const save = useMutation({
    mutationFn: (patch: Partial<RuntimeConfig>) => configApi.patch(patch),
    onSuccess: (next) => {
      qc.invalidateQueries({ queryKey: ['config'] });
      qc.invalidateQueries({ queryKey: ['account'] });
      qc.invalidateQueries({ queryKey: ['scheduler'] });
      setDraft(next);
    },
  });

  if (!draft) return <div className="card"><h2>Config</h2><p>Loading…</p></div>;

  const update = <K extends keyof RuntimeConfig>(k: K, v: RuntimeConfig[K]) =>
    setDraft({ ...draft, [k]: v });

  return (
    <div className="card">
      <h2>Configuration</h2>

      <div className="field">
        <label>Mode</label>
        <select
          value={draft.mode}
          onChange={(e) => update('mode', e.target.value as 'demo' | 'live')}
        >
          <option value="demo">Demo</option>
          <option value="live">Live (real funds)</option>
        </select>
      </div>

      <div className="field">
        <label>Risk per trade (%)</label>
        <input
          type="number"
          step="0.05"
          min="0.1"
          max="2"
          value={(draft.risk_per_trade * 100).toFixed(2)}
          onChange={(e) => update('risk_per_trade', Number(e.target.value) / 100)}
        />
      </div>

      <div className="field">
        <label>Max concurrent positions</label>
        <input
          type="number"
          min={1}
          max={5}
          value={draft.max_concurrent_positions}
          onChange={(e) => update('max_concurrent_positions', Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label>Allowed pairs (comma-separated)</label>
        <input
          value={draft.allowed_pairs.join(', ')}
          onChange={(e) =>
            update('allowed_pairs', e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))
          }
        />
      </div>

      <div className="field">
        <label>Daily loss kill (%)</label>
        <input
          type="number"
          step="0.1"
          value={draft.daily_loss_kill_pct}
          onChange={(e) => update('daily_loss_kill_pct', Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label>ADX threshold</label>
        <input
          type="number"
          min={10}
          max={40}
          value={draft.adx_threshold}
          onChange={(e) => update('adx_threshold', Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label>Cooldown after stopout (hours)</label>
        <input
          type="number"
          min={0}
          max={24}
          value={draft.cooldown_hours}
          onChange={(e) => update('cooldown_hours', Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label>Max stopouts per day (halt trigger)</label>
        <input
          type="number"
          min={1}
          max={10}
          value={draft.max_stopouts_per_day}
          onChange={(e) => update('max_stopouts_per_day', Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label>Low-profit pairs threshold (0 = disabled)</label>
        <input
          type="number"
          min={0}
          max={10}
          value={draft.low_profit_pairs_threshold}
          onChange={(e) => update('low_profit_pairs_threshold', Number(e.target.value))}
        />
      </div>

      <div className="row">
        <button
          className="btn primary"
          disabled={save.isPending}
          onClick={() => save.mutate(draft)}
        >
          {save.isPending ? 'Saving…' : 'Save changes'}
        </button>
        <button
          className="btn"
          onClick={() => cfg.data && setDraft(cfg.data)}
          disabled={save.isPending}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
