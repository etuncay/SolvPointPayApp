import { FormCard } from '@epay/ui';

export function KvPanel({
  id,
  title,
  rows,
}: {
  id: string;
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <FormCard id={id} title={title}>
      <div className="kv-grid">
        {rows.map((r) => (
          <div key={r.label} className="kv-item">
            <span className="kv-k">{r.label}</span>
            <span className="kv-v">{r.value}</span>
          </div>
        ))}
      </div>
    </FormCard>
  );
}
