import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable, PageHead } from '@epay/ui';
import { Plus, Settings2 } from 'lucide-react';
import { Button } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { DocumentStatusPill } from './components/document-status-pill';
import { useDocuments } from './hooks/use-documents';
import { buildDocumentsTableConfig } from './documents-table-config';

export function DocumentsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const { filters, clearRelationFilter, hasRelationFilter } =
    useDocuments(role);
  const tr = i18n.language === 'tr';
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(
    () => buildDocumentsTableConfig(role, filters.relationType, filters.relatedId, translate),
    [role, filters.relationType, filters.relatedId, t],
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(tr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <>
      <PageHead
        title={t('m_dms')}
        subtitle={t('dms_subtitle')}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/documents/types')}>
              <Settings2 size={14} /> {t('s_dms_types')}
            </Button>
            <Button type="button" variant="primary" onClick={() => navigate('/documents/new')}>
              <Plus size={14} /> {t('s_dms_new')}
            </Button>
          </div>
        }
      />

      {hasRelationFilter && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span className="badge muted fs-11">
            {filters.relationType}:{filters.relatedId}
          </span>
          <Button type="button" variant="ghost" onClick={clearRelationFilter}>
            {t('dms_clear_relation_filter')}
          </Button>
        </div>
      )}
      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: true, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderDateTime: (value) => (
            <span className="mono fs-12">{fmtDate(String(value ?? ''))}</span>
          ),
          renderCategory: (value) => (
            <span className="fs-12">{t(`dr_cat_${String(value)}`, String(value))}</span>
          ),
          renderStatus: (value) => <DocumentStatusPill status={value as never} />,
          renderSoft: (value) => <span className="fs-12 t-soft">{String(value ?? '')}</span>,
          renderApprovedBy: (value) => <span className="fs-12 t-soft">{String(value ?? '—')}</span>,
        }}
        locale={i18n.language}
        t={translate}
        onNew={() => navigate('/documents/new')}
        onRowClick={(row) => navigate(`/documents/${row.id}`)}
      />
    </>
  );
}
