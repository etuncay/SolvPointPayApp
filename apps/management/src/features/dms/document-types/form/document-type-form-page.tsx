import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button, FormLayout, FormPrimaryActions, PageHead, SectionRail } from '@epay/ui';
import { DefinitionPanel } from './components/definition-panel';
import { AccessPanel } from './components/access-panel';
import { useDocumentTypeForm } from './hooks/use-document-type-form';

export function DocumentTypeFormPage() {
  const { t } = useTranslation();
  const { typeId } = useParams<{ typeId: string }>();
  const vm = useDocumentTypeForm(typeId);
  const [activeSec, setActiveSec] = useState('definition');

  const sections = useMemo(
    () => [
      { id: 'definition', no: '1', label: t('dtf_panel_definition') },
      { id: 'access', no: '2', label: t('dtf_panel_access') },
    ],
    [t],
  );

  if (!vm.canMutate) {
    return <Navigate to="/documents/types" replace />;
  }

  if (vm.notFound) {
    return <Navigate to="/documents/types" replace />;
  }

  if (vm.loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">{t('loading')}</p>
      </div>
    );
  }

  const title = vm.isEdit ? t('dms_type_edit') : t('dms_type_new');
  const subtitle = vm.isEdit ? vm.form.watch('name') : t('dtf_subtitle_new');

  const handleSave = () => {
    const result = vm.submit();
    if (!result) return;
    if (!result.ok) {
      toast.error(t(result.error));
      return;
    }
    toast.success(t(vm.isEdit ? 'dtf_saved_edit' : 'dtf_saved_new'));
    vm.cancel();
  };

  return (
    <>
      <PageHead
        title={title}
        subtitle={subtitle}
        actions={
          <FormPrimaryActions
            showSave
            onSave={handleSave}
            saveLabel={
              <>
                <Save size={14} /> {t('ib_save')}
              </>
            }
            showCancel
            onCancel={vm.cancel}
            cancelLabel={t('ib_cancel')}
          />
        }
      />

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={title}
            onNavigate={setActiveSec}
          />
        }
      >
        {activeSec === 'definition' ? (
          <DefinitionPanel form={vm.form} isEdit={vm.isEdit} />
        ) : (
          <AccessPanel
            form={vm.form}
            approvalRequired={vm.approvalRequired}
          />
        )}
      </FormLayout>
    </>
  );
}
