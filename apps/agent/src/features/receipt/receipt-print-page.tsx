import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicForm, FormMode, type CustomFunctions } from '@epay/ui';
import { agentTransactionsService } from '@/features/transaction-confirmation/api/agent-transactions-service';
import { buildReceiptModelFromView } from './build-receipt-model';
import type { ReceiptLang } from '@epay/data';
import { ReceiptDocumentField } from './components/receipt-document-field';
import { buildReceiptViewFormConfig } from './receipt-form-config';

function asLang(value: string): ReceiptLang {
  return value === 'en' || value === 'ar' ? value : 'tr';
}

/** /receipt/:id — DynamicForm + otomatik yazdırma. */
export function ReceiptPrintPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = asLang(i18n.language);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const model = useMemo(() => {
    const txId = Number(id);
    const view = Number.isFinite(txId) ? agentTransactionsService.getConfirmation(txId) : null;
    if (!view) return null;
    agentTransactionsService.markReceiptPrinted(txId);
    return buildReceiptModelFromView(view, lang);
  }, [id, lang]);

  const formConfig = useMemo(
    () => buildReceiptViewFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        ReceiptDocumentBody: (props) => (
          <ReceiptDocumentField {...props} componentProps={{ model }} />
        ),
      },
    }),
    [model],
  );

  useEffect(() => {
    if (model) {
      const handle = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(handle);
    }
    return undefined;
  }, [model]);

  if (!model) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('frp_tx_not_found')}</h3>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="rcpt-print-actions">
        <DynamicForm
          config={formConfig}
          mode={FormMode.View}
          permissions={{ view: true }}
          initialValues={{}}
          customFunctions={customFunctions}
          t={translate}
          onButtonClick={(key) => {
            if (key === 'print') window.print();
          }}
        />
      </div>
    </div>
  );
}
