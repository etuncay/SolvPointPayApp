import { useTranslation } from 'react-i18next';
import { FormCard } from '@epay/ui';
import { CaseStatusPill } from '../../components/case-status-pill';
import type { SupportCaseDetail } from '../../domain/types';

type Props = { detail: SupportCaseDetail };

export function ActionsPanel({ detail }: Props) {
  const { t } = useTranslation();
  return (
    <FormCard title={t('scf_panel_actions')}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <span className="fs-11 t-mute">{t('scf_last_action')}</span>
          <div className="fs-12" style={{ marginTop: 4 }}>
            {detail.lastAction ? t(`case_action_${detail.lastAction}`, detail.lastAction) : '—'}
          </div>
        </div>
        <div>
          <span className="fs-11 t-mute">{t('rpt_col_status')}</span>
          <div style={{ marginTop: 4 }}>
            <CaseStatusPill status={detail.caseStatus} />
          </div>
        </div>
      </div>
      <span className="fs-11 t-mute">{t('scf_notes')}</span>
      <pre
        className="fs-12"
        style={{
          marginTop: 8,
          padding: 12,
          background: 'var(--surface-2)',
          borderRadius: 8,
          whiteSpace: 'pre-wrap',
          minHeight: 120,
        }}
      >
        {detail.notesText.trim() || t('scf_notes_empty')}
      </pre>
    </FormCard>
  );
}
