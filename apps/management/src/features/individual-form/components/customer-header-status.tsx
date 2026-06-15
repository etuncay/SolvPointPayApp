import { useTranslation } from 'react-i18next';
import type { CustomComponentProps } from '@epay/ui';

/** Bireysel müşteri formu üst bar status satırı — durum rozeti + alt bilgi/oluşturma. */
export function CustomerHeaderStatus({ value }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const v = (value ?? {}) as Record<string, unknown>;
  const isNew = v._isNew === true;
  const liveStatus = String(v._liveStatus ?? 'inactive');

  const statusLabel: Record<string, string> = {
    active: t('ib_status_Active'),
    inactive: t('ib_status_Inactive'),
    blocked: t('fcd_blocked'),
    closed: t('rl_closed'),
    prospect: t('cust_new_prosp'),
  };

  const createdAt = v.createdAt ? new Date(String(v.createdAt)).toLocaleDateString(tr ? 'tr-TR' : 'en-US') : '';

  return (
    <div className="head-status">
      <span className={`st ${liveStatus}`}>{statusLabel[liveStatus] ?? liveStatus}</span>
      {isNew ? (
        <span className="reason">
          {tr
            ? "Kimlik bilgileri girilince Nüfus Paneli KPS'ten doldurulur."
            : 'Civil registry auto-fills from KPS once identity is entered.'}
        </span>
      ) : (
        <span className="reason">
          {tr ? 'Müşteri No' : 'Customer No'} · {String(v.customerNo ?? '')} · {tr ? 'Oluşturma' : 'Created'} {createdAt}
        </span>
      )}
    </div>
  );
}
