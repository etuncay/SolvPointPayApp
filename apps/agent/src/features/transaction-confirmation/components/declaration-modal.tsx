import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { buildDeclarationFormConfig } from '../declaration-form-config';
import type { DeclarationInput, DeclarationReason } from '../domain/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (declaration: DeclarationInput) => void;
};

/** §8 İşlem Beyanı — DynamicForm modal. */
export function DeclarationModal({ open, onClose, onConfirm }: Props) {
  const { t, i18n } = useTranslation();

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildDeclarationFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(() => ({}), []);

  if (!open) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('ag_cf_decl_title')}</h2>
          <p>{t('ag_cf_decl_desc')}</p>
        </div>
        <div className="modal-body">
          <DynamicForm
            config={formConfig}
            mode={FormMode.Create}
            permissions={{ create: true }}
            customFunctions={customFunctions}
            t={translate}
            onButtonClick={(key, values) => {
              if (key === 'cancel') {
                onClose();
                return;
              }
              if (key === 'confirm') {
                onConfirm({
                  relation: String(values.relation ?? '').trim(),
                  reason: values.reason as DeclarationReason,
                  note: String(values.note ?? '').trim(),
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
