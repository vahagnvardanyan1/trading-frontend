import { useQuery } from '@tanstack/react-query';
import { runsApi } from '../api';

export function RunsTable(): JSX.Element {
  const runs = useQuery({ queryKey: ['runs'], queryFn: () => runsApi.list(50) });

  return (
    <div className="card">
      <h2>Recent agent runs</h2>
      {!runs.data || runs.data.length === 0 ? (
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          No agent runs yet. Click "Run agent now" to fire one.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Status</th>
              <th>Tools</th>
              <th>Duration</th>
              <th>Decisions</th>
            </tr>
          </thead>
          <tbody>
            {runs.data
              .slice()
              .reverse()
              .map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.ts_iso).toLocaleTimeString()}</td>
                  <td>
                    {r.error ? (
                      <span className="tag halted">error</span>
                    ) : (
                      <span className="tag closed">{r.ended_with_status}</span>
                    )}
                  </td>
                  <td>{r.tool_calls}</td>
                  <td>{(r.duration_ms / 1000).toFixed(1)}s</td>
                  <td style={{ color: 'var(--muted)' }}>
                    {r.error ?? r.decisions.map((d) => `${d.action}${d.symbol ? ` ${d.symbol}` : ''}: ${d.reason}`).join('  •  ')}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
