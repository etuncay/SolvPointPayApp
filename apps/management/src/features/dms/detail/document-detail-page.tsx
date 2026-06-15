import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button, FormLayout, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { DocumentStatusPill } from '@/features/dms/components/document-status-pill';
import { useDocumentDetail } from './hooks/use-document-detail';
import { MetadataPanel } from './components/metadata-panel';
import { RelationsPanel } from './components/relations-panel';
import { FilePanel } from './components/file-panel';

export function DocumentDetailPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const { detail, notFound, download, goBack } = useDocumentDetail(role);

  if (notFound || !detail) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('dd_not_found')}</h3>
        <p className="t-mute fs-12">{t('dd_forbidden_hint')}</p>
        <Button type="button" onClick={goBack} style={{ marginTop: 16 }}>
          {t('du_back_list')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={detail.fileName}
        subtitle={detail.documentTypeName}
        status={<DocumentStatusPill status={detail.documentStatus} />}
        actions={
          <Button type="button" variant="ghost" onClick={goBack}>
            <ArrowLeft size={14} /> {t('du_back_list')}
          </Button>
        }
      />

      <FormLayout>
        <MetadataPanel detail={detail} />
        <RelationsPanel detail={detail} />
        <FilePanel detail={detail} onDownload={download} />
      </FormLayout>
    </>
  );
}
