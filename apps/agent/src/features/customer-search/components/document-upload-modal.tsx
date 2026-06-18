import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { DynamicForm, FormMode } from '@epay/ui';
import { buildDocumentUploadFormConfig } from '../customer-search-form-config';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

export interface DocumentUploadPayload {
  category: string;
  type: string;
  validFrom?: string;
  validTo?: string;
  fileName: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: DocumentUploadPayload) => void;
}

/** Belge yükleme modalı — DynamicForm (§7). */
export function DocumentUploadModal({ open, onClose, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildDocumentUploadFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );
  const ui = useAgentUiPermissions();

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <span>{t('ag_cs_upload_title')}</span>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label={t('form_cancel')}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-b">
          <DynamicForm
            config={formConfig}
            mode={FormMode.Create}
            permissions={ui.form.documentUpload}
            t={translate}
            onButtonClick={(key, values) => {
              if (key === 'cancel') {
                onClose();
                return;
              }
              if (key === 'submit') {
                const files = values.fileName as File[] | undefined;
                const fileName = files?.[0]?.name ?? String(values.fileName ?? '');
                if (!fileName.trim()) return;
                onSubmit({
                  category: String(values.category ?? 'Identity'),
                  type: String(values.type ?? 'IdentityCard'),
                  validFrom: values.validFrom ? String(values.validFrom) : undefined,
                  validTo: values.validTo ? String(values.validTo) : undefined,
                  fileName: fileName.trim(),
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
