import type { CustomComponentProps } from '@epay/ui';

export function CorpRiskScoreDisplay({ value }: CustomComponentProps) {
  const obj = value as { score?: number; segment?: string } | undefined;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input className="input mono locked" value={`${obj?.score ?? 0} / 100`} readOnly style={{ flex: 1 }} />
      <span className={`risk-seg ${obj?.segment ?? 'low'}`}>{obj?.segment ?? 'low'}</span>
    </div>
  );
}
