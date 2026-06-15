import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button, DynamicTable, PageHead } from '@epay/ui';
import { DEFAULT_MAX_FILE_SIZE_MB } from '@/mocks/document-upload-params';
import { useRole } from '@/domain/role-context';
import { canListDocumentTypes } from './domain/permissions';
import { DocumentTypeFlagCheckbox } from './components/document-type-flags';
import { buildDocumentTypesTableConfig } from './document-types-table-config';

export function DocumentTypesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const canList = canListDocumentTypes(role);
  const { i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildDocumentTypesTableConfig(role, translate), [role, t]);

  if (!canList) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('sc_forbidden_title')}</h3>
        <p className="t-mute fs-12">{t('dt_forbidden_sub')}</p>
        <Button type="button" onClick={() => navigate('/documents')} style={{ marginTop: 16 }}>
          {t('du_back_list')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={t('s_dms_types')}
        subtitle={t('dt_subtitle')}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/documents')}>
              {t('du_back_list')}
            </Button>
            <Button type="button" variant="primary" onClick={() => navigate('/documents/types/new')}>
              <Plus size={14} /> {t('dt_new_type')}
            </Button>
          </div>
        }
      />

      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: true, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderCategory: (_v, row) => (
            <span className="fs-12">
              {t(`dr_cat_${String(row.documentCategory)}`, String(row.documentCategory))}
            </span>
          ),
          renderNameWithCode: (_v, row) => (
            <div>
              <div className="fs-12">{String(row.name)}</div>
              <div className="fs-11 mono t-mute">{String(row.documentTypeCode)}</div>
            </div>
          ),
          renderMono: (value) => <span className="fs-12 mono">{String(value ?? '')}</span>,
          renderMaxSize: (_v, row) => (
            <span className="fs-12">
              {row.maxFileSizeMb != null
                ? `${row.maxFileSizeMb} MB`
                : t('dt_max_default', { mb: DEFAULT_MAX_FILE_SIZE_MB })}
            </span>
          ),
          renderPersonalData: (_v, row) => (
            <DocumentTypeFlagCheckbox checked={Boolean(row.isPersonalData)} label={t('dd_personal_data')} />
          ),
          renderApprovalRequired: (_v, row) => (
            <DocumentTypeFlagCheckbox checked={Boolean(row.approvalRequired)} label={t('dd_approval_required')} />
          ),
        }}
        locale={i18n.language}
        t={translate}
        onNew={() => navigate('/documents/types/new')}
        onRowClick={(row) => navigate(`/documents/types/${row.id}/edit`)}
      />
    </>
  );
}
