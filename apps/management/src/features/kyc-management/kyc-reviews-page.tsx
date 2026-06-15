import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { DynamicTable, PageHead } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getKycPermissions } from './domain/permissions';
import { buildKycReviewsTableConfig } from './kyc-reviews-table-config';

export function KycReviewsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getKycPermissions(role);
  const tr = i18n.language === 'tr';
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildKycReviewsTableConfig(role, translate), [role, t]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(tr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (!permissions.list) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageHead
        title={t('nav_kyc')}
        subtitle={t('kyc_subtitle')}
      />

      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderMono: (value) => <span className="mono fs-12">{String(value ?? '')}</span>,
          renderBirthDate: (_v, row) => <span className="mono fs-12">{String(row.birthDate ?? '—')}</span>,
          renderQueryTime: (_v, row) => <span className="mono fs-12">{fmtDate(String(row.queryTime ?? ''))}</span>,
          renderPreviousResult: (_v, row) => <span className="fs-12">{String(row.previousQueryResultLabel ?? '—')}</span>,
          renderBlockageReason: (_v, row) => <span className="fs-12">{String(row.blockageReason ?? '—')}</span>,
          renderKycStatus: (_v, row) => (
            <span className="fs-12" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {String(row.kycStatusDisplay ?? '')}
              {Boolean(row.isKnownException) && (
                <span className="badge warn" title={t('kyc_known_exception_badge')}>
                  <AlertTriangle size={11} />
                </span>
              )}
            </span>
          ),
        }}
        locale={i18n.language}
        t={translate}
        onRowClick={(row) => navigate(`/ops/kyc/${row.id}`)}
      />
    </>
  );
}
