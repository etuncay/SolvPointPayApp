import type { CSSProperties } from 'react';
import { Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormCard } from '@epay/ui';
import type { RiskScoreDetail, FraudRiskSource } from '../domain/types';
import type { RiskLevel } from '../../shared/risk-classification';

const SOURCE_KEYS: Record<FraudRiskSource, string> = {
  Customer: 'scf_entity_customer',
  Agent: 'rpt_col_agent',
  Transaction: 'rs_scope_transaction',
};

const LEVEL_KEYS: Record<RiskLevel, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

const LEVEL_RING: Record<RiskLevel, string> = {
  Low: 'var(--ok-fg)',
  Medium: 'var(--warn-fg)',
  High: 'var(--danger-fg)',
  Critical: 'oklch(0.42 0.17 25)',
};

const LEVEL_SEG: Record<RiskLevel, string> = {
  Low: 'low',
  Medium: 'med',
  High: 'high',
  Critical: 'critical',
};

export function ScoreHeaderPanel({ detail }: { detail: RiskScoreDetail }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const calculatedLabel = new Date(detail.calculatedAt).toLocaleString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { dateStyle: 'medium', timeStyle: 'short' },
  );

  return (
    <FormCard title={t('rsc_panel_header')} icon={<Fingerprint size={13} />} id="sec-header">
      <div className="rsc-hero">
        <div className="rsc-identity-grid">
          <div className="rsc-identity-item">
            <label>{t('rsc_entity_id')}</label>
            <span className="mono">{detail.entityId}</span>
          </div>
          <div className="rsc-identity-item">
            <label>{t('rsc_source')}</label>
            <span>{t(SOURCE_KEYS[detail.source])}</span>
          </div>
          <div className="rsc-identity-item is-wide">
            <label>{t('rpt_col_name')}</label>
            <span>{detail.displayName}</span>
          </div>
        </div>

        <div className="rsc-hero-score">
          <div
            className="rsc-score-ring"
            style={
              {
                '--score-pct': detail.score,
                '--ring-color': LEVEL_RING[detail.level],
              } as CSSProperties
            }
            aria-hidden
          >
            <div className="rsc-score-ring-inner">
              <span className="rsc-score-value">{detail.score}</span>
              <span className="rsc-score-max">/100</span>
            </div>
          </div>
          <span className={`risk-seg ${LEVEL_SEG[detail.level]}`}>
            {t(LEVEL_KEYS[detail.level])}
          </span>
          <span className="rsc-calculated-at">{calculatedLabel}</span>
        </div>
      </div>

      {detail.manualOverrideUntilRecalc && (
        <p className="rsc-override-note">{t('rsc_manual_override_note')}</p>
      )}
    </FormCard>
  );
}
