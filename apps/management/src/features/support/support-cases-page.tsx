import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw, X } from 'lucide-react';
import {
  Button,
  DynamicTable,
  PageHead,
} from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { CaseStatusPill } from './components/case-status-pill';
import { LevelBadge } from './components/level-badge';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { getSupportCasePermissions } from './domain/permissions';
import { buildSupportCasesTableConfig } from './support-cases-table-config';

export function SupportCasesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const perms = getSupportCasePermissions(role);
  const [refreshKey, setRefreshKey] = useState(0);
  const currentUser = useMemo(() => getCurrentUser(role), [role]);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(
    () => buildSupportCasesTableConfig(role, currentUser.id, translate),
    [role, currentUser.id, t, refreshKey],
  );

  if (!perms.list) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('sc_forbidden_title')}</h3>
        <p className="t-mute fs-12">{t('sc_forbidden_sub')}</p>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={t('m_support')}
        subtitle={t('sc_subtitle')}
        actions={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw size={14} /> {t('refresh_all')}
            </Button>
            {perms.insert ? (
              <Button type="button" variant="primary" onClick={() => navigate('/support/cases/new')}>
                <Plus size={14} /> {t('s_supp_new')}
              </Button>
            ) : null}
          </>
        }
      />

      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: perms.insert, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderCaseNo: (_v, row) => <span className="mono fs-12 link">{String(row.caseNo)}</span>,
          renderComplaintType: (_v, row) => (
            <span className="fs-12">
              {t(`complaint_type_${String(row.complaintType)}`, String(row.complaintType))}
            </span>
          ),
          renderUrgency: (_v, row) => <LevelBadge level={row.urgency as never} />,
          renderCriticality: (_v, row) => <LevelBadge level={row.criticality as never} />,
          renderDate: (value) => (
            <span className="mono fs-12">
              {new Date(String(value)).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}
            </span>
          ),
          renderCaseAge: (_v, row) => <span className="fs-12">{t('sc_age_days', { n: Number(row.caseAgeDays) })}</span>,
          renderCaseStatus: (_v, row) => <CaseStatusPill status={row.caseStatus as never} />,
        }}
        locale={i18n.language}
        t={translate}
        onNew={() => navigate('/support/cases/new')}
        onRowClick={(row) => navigate(`/support/cases/${row.id}`)}
      />
    </>
  );
}
