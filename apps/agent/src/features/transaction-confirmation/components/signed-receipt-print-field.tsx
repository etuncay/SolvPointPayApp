import { useTranslation } from 'react-i18next';
import { Printer } from 'lucide-react';
import { Button } from '@epay/ui';
import { printReceipt } from '@/features/receipt/print-receipt';

type Props = {
  componentProps?: { txId?: number };
};

/** DynamicForm CustomComponent — dekont yazdır. */
export function SignedReceiptPrintField({ componentProps }: Props) {
  const { t } = useTranslation();
  const txId = componentProps?.txId ?? 0;

  return (
    <Button type="button" variant="ghost" onClick={() => printReceipt(txId)} style={{ alignSelf: 'flex-start' }}>
      <Printer size={14} /> {t('ag_sr_print')}
    </Button>
  );
}
