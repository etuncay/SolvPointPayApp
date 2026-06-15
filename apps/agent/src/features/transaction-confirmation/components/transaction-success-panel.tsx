import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Download, Home } from 'lucide-react';
import { Button } from '@epay/ui';
import { printReceipt } from '@/features/receipt/print-receipt';

type Props = {
  value?: unknown;
  componentProps?: { txId?: number };
};

/** DynamicForm CustomComponent — işlem başarı ekranı. */
export function TransactionSuccessPanel({ componentProps }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const txId = componentProps?.txId ?? 0;

  return (
    <div className="empty-state" style={{ padding: 64, textAlign: 'center' }}>
      <CheckCircle2 size={56} style={{ color: 'var(--ok)' }} />
      <h2 style={{ marginTop: 16 }}>{t('ag_success_title')}</h2>
      <p className="t-mute" style={{ marginTop: 4 }}>{t('ag_success_subtitle')}</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
        <Button type="button" variant="ghost" onClick={() => printReceipt(txId)}>
          <Download size={14} /> {t('ag_cf_download_receipt')}
        </Button>
        <Button type="button" variant="primary" onClick={() => navigate('/')}>
          <Home size={14} /> {t('ag_success_home')}
        </Button>
      </div>
    </div>
  );
}
