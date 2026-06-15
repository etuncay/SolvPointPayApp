import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CaseDetailHeader } from '../domain/types';
import { CaseStatusPill } from '../../components/case-status-pill';

const PRIORITY_KEYS: Record<string, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

export function CaseHeaderStrip({ header }: { header: CaseDetailHeader }) {
  const { t } = useTranslation();

  return (
    <div className="id-strip" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <span className="t-mute fs-12">{t('fcd_case_id')}</span>
        <div className="mono fw-600">{header.id}</div>
      </div>
      <div>
        <span className="t-mute fs-12">{t('fc_col_case_status')}</span>
        <div style={{ marginTop: 4 }}>
          <CaseStatusPill status={header.caseStatus} />
        </div>
      </div>
      <div>
        <span className="t-mute fs-12">{t('col_priority')}</span>
        <div>{t(PRIORITY_KEYS[header.priority] ?? header.priority)}</div>
      </div>
      <div>
        <span className="t-mute fs-12">{t('fcd_sla')}</span>
        <div className="mono fs-13">{header.slaDueAt.slice(0, 16).replace('T', ' ')}</div>
      </div>
      <div>
        <span className="t-mute fs-12">{t('fc_fraud_report_tx')}</span>
        <div>
          <Link to={`/transfers/${header.transactionId}`} className="mono">
            {header.transactionNo}
          </Link>
        </div>
      </div>
      <div>
        <span className="t-mute fs-12">{t('fcd_assignee')}</span>
        <div>{header.assignedUserName ?? t('case_status_Unassigned')}</div>
      </div>
    </div>
  );
}
