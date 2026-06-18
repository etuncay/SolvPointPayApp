import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { DynamicForm, FormMode } from '@epay/ui';
import { buildAdditionalInfoFormConfig } from '../additional-info-form-config';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

export interface AdditionalInfoPayload {
  nationality: string;
  idType: string;
  birthDate: string;
  companyTitle?: string;
  taxOffice?: string;
  tradeRegistryNo?: string;
}

interface Props {
  open: boolean;
  isCorporate: boolean;
  onClose: () => void;
  onSubmit: (payload: AdditionalInfoPayload) => void;
}

/** Alıcı sanction hit — DynamicForm (§8). */
export function AdditionalInfoModal({ open, isCorporate, onClose, onSubmit }: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildAdditionalInfoFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );
  const ui = useAgentUiPermissions();

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal modal-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <span>{t('ag_tr_additional_info_title')}</span>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label={t('form_cancel')}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-b">
          <DynamicForm
            config={formConfig}
            mode={FormMode.Create}
            permissions={ui.form.transferSubmit}
            initialValues={{ _isCorporate: isCorporate }}
            t={translate}
            onButtonClick={(key, values) => {
              if (key === 'cancel') {
                onClose();
                return;
              }
              if (key === 'submit') {
                onSubmit({
                  nationality: String(values.nationality ?? 'TUR'),
                  idType: String(values.idType ?? 'IdentityCard'),
                  birthDate: String(values.birthDate ?? ''),
                  companyTitle: isCorporate ? String(values.companyTitle ?? '') : undefined,
                  taxOffice: isCorporate ? String(values.taxOffice ?? '') : undefined,
                  tradeRegistryNo: isCorporate ? String(values.tradeRegistryNo ?? '') : undefined,
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
