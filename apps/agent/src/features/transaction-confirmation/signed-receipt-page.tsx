import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DynamicForm, FormMode, PageHead, type CustomFunctions } from '@epay/ui';
import { SignedReceiptPrintField } from './components/signed-receipt-print-field';
import { buildSignedReceiptFormConfig } from './signed-receipt-form-config';
import { agentTransactionsService } from './api/agent-transactions-service';

const ACCEPT = '.pdf,.jpg,.jpeg,.png';
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_BYTES = 5 * 1024 * 1024;

/** 1.2 İmzalı Dekont Yükleme — DynamicForm. */
export function SignedReceiptPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const txId = Number(id);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildSignedReceiptFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      components: {
        SignedReceiptPrint: (props) => (
          <SignedReceiptPrintField {...props} componentProps={{ txId }} />
        ),
      },
    }),
    [txId],
  );

  return (
    <>
      <PageHead title={t('ag_sr_title')} subtitle={t('ag_sr_subtitle')} />
      <div className="fcard">
        <div className="fcard-body" style={{ maxWidth: 520 }}>
          <DynamicForm
            config={formConfig}
            mode={FormMode.Create}
            permissions={{ create: true }}
            customFunctions={customFunctions}
            t={translate}
            onButtonClick={(key, values) => {
              if (key !== 'submit') return;
              const files = values.signedFile as File[] | undefined;
              const file = files?.[0];
              if (!file) {
                toast.error(t('ag_sr_err_required'));
                return;
              }
              const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
              if (!ACCEPT.includes(ext) || !ALLOWED_MIME.includes(file.type)) {
                toast.error(t('ag_sr_err_type'));
                return;
              }
              if (file.size > MAX_BYTES) {
                toast.error(t('ag_sr_err_size'));
                return;
              }
              const fileName = file.name;
              const result = agentTransactionsService.uploadSignedReceipt(txId, fileName);
              if (!result.ok) {
                toast.error(t(result.error ?? 'ap_save_failed'));
                return;
              }
              toast.success(t('ag_sr_uploaded'));
              navigate(`/transactions/${txId}/success`);
            }}
          />
        </div>
      </div>
    </>
  );
}
