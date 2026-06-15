import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicForm, FormMode, PageHead, type CustomFunctions } from '@epay/ui';
import successFormJson from './config/success.form.config.json';
import { TransactionSuccessPanel } from './components/transaction-success-panel';
import type { FormConfig } from '@epay/ui';

/** İşlem başarıyla tamamlandı — DynamicForm + özel panel. */
export function TransactionSuccessPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const txId = Number(id);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(() => successFormJson as FormConfig, []);

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        TransactionSuccessPanel: (props) => (
          <TransactionSuccessPanel {...props} componentProps={{ txId }} />
        ),
      },
    }),
    [txId],
  );

  return (
    <>
      <PageHead title={t('ag_success_title')} subtitle={t('ag_success_subtitle')} />
      <DynamicForm
        config={formConfig}
        mode={FormMode.View}
        permissions={{ view: true }}
        customFunctions={customFunctions}
        t={translate}
      />
    </>
  );
}
