import { useTranslation } from 'react-i18next';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { fmtMoney } from '@/lib/format';
import { isDemoMode } from '@/lib/data-layer';

type Props = {
  limit: number;
  symbol?: string;
};

/** Mock — internet günlük transfer limiti ipucu (Ayarlar ile senkron). */
export function TransferLimitDemoBanner({ limit, symbol = '₺' }: Props) {
  const { t } = useTranslation();
  if (!isDemoMode()) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <AlertBanner tone="info" icon="info">
        {t('transfer_limit_demo_banner', { limit: fmtMoney(limit, symbol) })}
      </AlertBanner>
    </div>
  );
}
