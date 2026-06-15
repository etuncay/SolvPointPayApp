import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Field, FormCard, FormGrid, FormLayout, FormPrimaryActions, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { useDocumentUpload } from './hooks/use-document-upload';
import { FileDropzone } from './components/file-dropzone';
import { RelationFieldArray } from './components/relation-field-array';

export function DocumentUploadPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const {
    form,
    categories,
    typeOptions,
    relationsArray,
    selectedFile,
    setSelectedFile,
    scanning,
    onCategoryChange,
    submitUpload,
  } = useDocumentUpload(role);

  const { register, watch } = form;
  const category = watch('category');
  const [fileError, setFileError] = useState<string | undefined>();

  const handleSubmit = async () => {
    if (!selectedFile) {
      setFileError('du_file_required');
      return;
    }
    setFileError(undefined);
    const result = await submitUpload();
    if (!result) return;
    if (!result.ok) {
      toast.error(t(result.error));
      return;
    }
    toast.success(t('du_upload_success'));
    navigate(`/documents/${result.id}`);
  };

  return (
    <>
      <PageHead
        title={t('s_dms_new')}
        subtitle={t('du_subtitle')}
        actions={
          <FormPrimaryActions
            showSave
            onSave={() => void handleSubmit()}
            saveLabel={
              scanning ? (
                <>
                  <Loader2 size={14} className="spin" /> {t('du_scanning')}
                </>
              ) : (
                <>
                  <Plus size={14} /> {t('rs_add')}
                </>
              )
            }
            saveDisabled={scanning}
            showCancel
            onCancel={() => navigate('/documents')}
            cancelLabel={t('ib_cancel')}
          />
        }
      />

      <FormLayout>
        <FormCard title={t('du_card_main')}>
          <FormGrid>
            <Field label={t('du_field_category')} required>
              <select
                className="select"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as typeof category)}
              >
                <option value="">{t('du_select_category')}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {t(`dr_cat_${c}`, c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('dms_col_type')} required>
              <select
                className="select"
                disabled={!category || typeOptions.length === 0}
                {...register('documentTypeId', { required: true })}
              >
                <option value="">{t('du_select_type')}</option>
                {typeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                    {opt.approvalRequired ? ` (${t('du_approval_required')})` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('du_field_valid_from')}>
              <input className="input" type="date" {...register('validFrom')} />
            </Field>
            <Field label={t('du_field_valid_until')}>
              <input className="input" type="date" {...register('validUntil')} />
            </Field>
          </FormGrid>

          <div style={{ marginTop: 20 }}>
            <FileDropzone
              file={selectedFile}
              onFileSelect={(f) => {
                setSelectedFile(f);
                setFileError(undefined);
              }}
              disabled={scanning}
              error={fileError}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <RelationFieldArray
              fieldArray={relationsArray}
              register={form.register}
            />
          </div>
        </FormCard>
      </FormLayout>
    </>
  );
}
