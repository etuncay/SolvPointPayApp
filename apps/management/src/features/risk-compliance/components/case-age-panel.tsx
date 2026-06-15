import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WidgetCard } from '@epay/ui';
import type { CaseAgeBucket, CaseAgeSummary, PanelState } from '../domain/types';

const BUCKETS: CaseAgeBucket[] = ['0_1', '1_5', '5_10', 'gt_10'];

const BUCKET_LABEL: Record<CaseAgeBucket, string> = {
  '0_1': 'scr_bucket_0_1',
  '1_5': 'scr_bucket_1_5',
  '5_10': 'scr_bucket_5_10',
  gt_10: 'rc_bucket_gt_10',
};

export function CaseAgePanel({
  state,
  onRetry,
}: {
  state?: PanelState<CaseAgeSummary>;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();

  if (!state || state.status === 'loading') {
    return (
      <WidgetCard icon={Clock} iconTone="warn" title={t('rp_case_age')}>
        <div style={{ height: 80, borderRadius: 8, background: 'var(--bg-elevated)' }} />
      </WidgetCard>
    );
  }

  if (state.status === 'error') {
    return (
      <WidgetCard icon={Clock} iconTone="warn" title={t('rp_case_age')}>
        <p className="t-mute" style={{ padding: 16, textAlign: 'center' }}>
          {t('error_loading')}
          {onRetry && (
            <button type="button" className="link-btn" onClick={onRetry} style={{ marginLeft: 8 }}>
              {t('try_again')}
            </button>
          )}
        </p>
      </WidgetCard>
    );
  }

  const total = BUCKETS.reduce((s, b) => s + state.data[b], 0);

  return (
    <WidgetCard icon={Clock} iconTone="warn" title={t('rp_case_age')} count={total} countTone="warn">
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
              background: 'var(--bg-elevated)',
              textAlign: 'center',
            }}
          >
            <div className="mono" style={{ fontSize: 22, fontWeight: 600 }}>
              {state.data[b]}
            </div>
            <div className="t-mute fs-11" style={{ marginTop: 4 }}>
              {t(BUCKET_LABEL[b])}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
