import type { CustomComponentProps } from '@epay/ui';

export function RiskScoreDisplay({ value }: CustomComponentProps) {
  const obj = value as { score?: number; segment?: string } | undefined;
  const score = obj?.score ?? 0;
  const segment = obj?.segment ?? 'low';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input className="input mono locked" value={`${score} / 100`} readOnly style={{ flex: 1 }} />
      <span className={`risk-seg ${segment}`}>{segment}</span>
    </div>
  );
}
