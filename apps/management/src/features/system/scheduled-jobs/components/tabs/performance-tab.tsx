import { useTranslation } from 'react-i18next';
import type { JobPerformanceMetrics } from '../../domain/types';

type Props = { metrics: JobPerformanceMetrics | null };

export function PerformanceTab({ metrics }: Props) {
  const { t } = useTranslation();
  if (!metrics) return null;

  const cards = [
    { label: t('sj_perf_success'), value: `${Math.round(metrics.successRate * 100)}%` },
    { label: t('sj_perf_duration'), value: `${Math.round(metrics.avgDurationMs)} ms` },
    { label: t('sj_perf_attempts'), value: metrics.avgAttemptCount.toFixed(1) },
    { label: t('sj_col_cpu'), value: `${metrics.avgCpu}%` },
    { label: t('sj_perf_memory'), value: `${metrics.avgMemoryMb} MB` },
    { label: t('sj_perf_total'), value: String(metrics.totalRuns) },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12,
        padding: 8,
      }}
    >
      {cards.map((c) => (
        <div key={c.label} className="card" style={{ padding: 16 }}>
          <p className="t-mute fs-11">{c.label}</p>
          <p className="fs-18 fw-600" style={{ marginTop: 4 }}>
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
