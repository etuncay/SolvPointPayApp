import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CaseAgeBucket, CaseAgeSummary, PanelState } from '../../domain/types';
import { ReportPanelShell } from '../report-panel-shell';

const BUCKETS: CaseAgeBucket[] = ['0_1', '1_5', '5_10', 'gt_10'];

const BUCKET_LABEL: Record<CaseAgeBucket, string> = {
  '0_1': 'scr_bucket_0_1',
  '1_5': 'scr_bucket_1_5',
  '5_10': 'scr_bucket_5_10',
  gt_10: 'scr_bucket_gt_10',
};

export function SupportCaseAgePanel({
  state,
  onRetry,
}: {
  state?: PanelState<CaseAgeSummary>;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const data = state?.status === 'ready' ? state.data : null;
  const total = data ? BUCKETS.reduce((s, b) => s + data[b], 0) : 0;

  return (
    <ReportPanelShell
      icon={Clock}
      iconTone="warn"
      titleKey="scr_panel_case_age"
      state={state}
      onRetry={onRetry}
      count={total}
      countTone="warn"
    >
      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          {BUCKETS.map((b) => (
            <div
              key={b}
              style={{
                padding: '14px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: b === 'gt_10' && data[b] > 0 ? 'var(--warn-bg, var(--bg-elevated))' : 'var(--bg-elevated)',
                textAlign: 'center',
              }}
            >
              <div className="mono" style={{ fontSize: 22, fontWeight: 600 }}>
                {data[b]}
              </div>
              <div className="t-mute fs-11" style={{ marginTop: 4 }}>
                {t(BUCKET_LABEL[b])}
              </div>
            </div>
          ))}
        </div>
      )}
    </ReportPanelShell>
  );
}
