import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getDocumentReviewPermissions } from './domain/permissions';
import type { ReviewQueueItem } from './domain/types';
import { buildDocumentReviewTableConfig } from './document-review-table-config';

export function DocumentReviewPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getDocumentReviewPermissions(role);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () => buildDocumentReviewTableConfig(role, translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, i18n.language],
  );

  const customFunctions = useMemo(
    () => ({
      renderSuspicious: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as ReviewQueueItem;
        return r.suspiciousFlag ? (
          <span className="badge danger" title={t('dr_suspicious')}>
            <AlertTriangle size={11} />
          </span>
        ) : (
          <span className="t-mute">—</span>
        );
      },
      renderCategory: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as ReviewQueueItem;
        return <span className="fs-12">{t(`dr_cat_${r.category}`, r.category)}</span>;
      },
      renderApprovalStatus: () => (
        <span className="st inactive">{t('bm_status_Pending')}</span>
      ),
    }),
    [t],
  );

  if (!permissions.list) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">{t('dr_no_access')}</p>
      </div>
    );
  }

  return (
    <DynamicTable
      config={tableConfig}
      header={{
        title: t('s_cust_doc'),
        subtitle: t('dr_subtitle'),
        status: (
          <span className="badge muted" id="dr-queue-badge">
            {t('dr_queue_badge')}
          </span>
        ),
      }}
      permissions={{
        new: false,
        edit: false,
        delete: false,
        view: permissions.view,
        export: false,
      }}
      customFunctions={customFunctions}
      locale={i18n.language}
      t={translate}
      onRowClick={(row) => {
        if (permissions.view) {
          navigate(`/customers/documents/${row.id}/review`);
        }
      }}
    />
  );
}
